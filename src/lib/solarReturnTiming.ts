/**
 * Solar Return Timing Engine
 * 
 * Detects when transiting planets activate Solar Return positions (planets, angles)
 * throughout the SR year, scores each activation, links it to yearly themes, and
 * computes peak windows.
 */

import * as Astronomy from 'astronomy-engine';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { normalizeLongitude, aspectOrb } from '@/lib/transitMath';
import { computeYearPriorities, ScoredCategory } from '@/lib/yearPriorityScoring';

// ─── Constants ──────────────────────────────────────────────────────

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const TRANSITING_PLANETS = ['Sun','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
type TransitingPlanet = typeof TRANSITING_PLANETS[number];

const PLANET_TO_BODY: Record<TransitingPlanet, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

const ASPECT_DEFS = [
  { name: 'conjunction' as const, angle: 0, priority: 1, baseScore: 10 },
  { name: 'opposition' as const, angle: 180, priority: 2, baseScore: 8 },
  { name: 'square' as const, angle: 90, priority: 3, baseScore: 7 },
  { name: 'trine' as const, angle: 120, priority: 4, baseScore: 5 },
  { name: 'sextile' as const, angle: 60, priority: 5, baseScore: 4 },
] as const;

type AspectName = typeof ASPECT_DEFS[number]['name'];

const DEFAULT_ORBS: Record<TransitingPlanet, number> = {
  Sun: 2, Mercury: 2, Venus: 2, Mars: 3,
  Jupiter: 3, Saturn: 3, Uranus: 2, Neptune: 2, Pluto: 2,
};

const TARGET_BONUS: Record<string, number> = {
  solar_return_angle: 5,
  solar_return_Sun: 5,
  solar_return_Moon: 5,
};

const PLANET_BONUS: Record<string, number> = {
  Mars: 3, Jupiter: 3, Saturn: 4, Uranus: 4, Neptune: 3, Pluto: 5,
};

/** Window half-widths in days by planet speed group */
const WINDOW_DAYS: Record<string, number> = {
  Sun: 2, Mercury: 2, Venus: 2,
  Mars: 4,
  Jupiter: 10, Saturn: 10,
  Uranus: 21, Neptune: 21, Pluto: 21,
};

// House-to-category mapping (matches yearPriorityScoring)
const HOUSE_TO_CATEGORY: Record<number, string> = {
  1: 'identity_direction', 2: 'money_resources', 3: 'learning_travel_beliefs',
  4: 'home_family_private_life', 5: 'creativity_children_joy', 6: 'health_work_routines',
  7: 'relationships', 8: 'transformation_shared_resources', 9: 'learning_travel_beliefs',
  10: 'career_public_life', 11: 'friends_community_future', 12: 'inner_healing_spirituality',
};

const PLANET_TO_CATEGORIES: Record<string, string[]> = {
  Sun: ['identity_direction', 'career_public_life'],
  Moon: ['home_family_private_life', 'inner_healing_spirituality'],
  Mercury: ['learning_travel_beliefs', 'career_public_life'],
  Venus: ['relationships', 'money_resources', 'creativity_children_joy'],
  Mars: ['identity_direction', 'career_public_life', 'health_work_routines'],
  Jupiter: ['learning_travel_beliefs', 'career_public_life', 'friends_community_future'],
  Saturn: ['career_public_life', 'health_work_routines', 'home_family_private_life'],
  Uranus: ['identity_direction', 'friends_community_future'],
  Neptune: ['inner_healing_spirituality', 'creativity_children_joy'],
  Pluto: ['transformation_shared_resources', 'career_public_life'],
};

const ANGLE_TO_CATEGORIES: Record<string, string[]> = {
  Ascendant: ['identity_direction'], Descendant: ['relationships'],
  Midheaven: ['career_public_life'], IC: ['home_family_private_life'],
};

// ─── Types ──────────────────────────────────────────────────────────

export type TargetType = 'solar_return_planet' | 'solar_return_angle';

export interface TimingTarget {
  type: TargetType;
  name: string;           // e.g. "Sun", "Midheaven"
  longitude: number;      // absolute ecliptic degrees
  srHouse?: number;       // which SR house this point sits in
}

export interface SRTimingEvent {
  date: string;           // ISO date YYYY-MM-DD
  transitingPlanet: TransitingPlanet;
  targetType: TargetType;
  targetName: string;
  aspectName: AspectName;
  orb: number;
  exactitudeScore: number;  // 0–100, higher = tighter
  themeTags: string[];
  linkedYearPriorityCategory: string | null;
  activationStrength: 'high' | 'medium' | 'low';
  interpretiveHeadline: string;
  isPeakWindow: boolean;
  peakWindowStart: string;
  peakWindowEnd: string;
  score: number;          // composite activation score
}

export interface SRTimingResult {
  events: SRTimingEvent[];
  /** Top 5 strongest peak periods */
  nextPeakPeriods: SRTimingEvent[];
  /** Events grouped by yearly theme */
  themeActivations: Record<string, SRTimingEvent[]>;
  /** Full year timeline data */
  annualTimeline: SRTimingEvent[];
}

// ─── Helpers ────────────────────────────────────────────────────────

const toAbsDeg = (pos: { sign: string; degree: number; minutes?: number } | undefined): number | null => {
  if (!pos) return null;
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return null;
  return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
};

const formatDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const addDays = (d: Date, n: number): Date => new Date(d.getTime() + n * 86400000);

const getPlanetLon = (body: Astronomy.Body, date: Date): number => {
  const vec = Astronomy.GeoVector(body, date, false);
  const ecl = Astronomy.Ecliptic(vec);
  return normalizeLongitude(ecl.elon);
};

// ─── Target Extraction ─────────────────────────────────────────────

function extractTimingTargets(srChart: SolarReturnChart): TimingTarget[] {
  const targets: TimingTarget[] = [];

  // SR planet positions
  const planetNames = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
  for (const pName of planetNames) {
    const pos = srChart.planets[pName as keyof typeof srChart.planets];
    if (!pos) continue;
    const lon = toAbsDeg(pos);
    if (lon === null) continue;
    targets.push({
      type: 'solar_return_planet',
      name: pName,
      longitude: lon,
    });
  }

  // SR angles
  const asc = srChart.houseCusps?.house1;
  const mc = srChart.houseCusps?.house10;
  if (asc) {
    const ascDeg = toAbsDeg(asc);
    if (ascDeg !== null) {
      targets.push({ type: 'solar_return_angle', name: 'Ascendant', longitude: ascDeg });
      targets.push({ type: 'solar_return_angle', name: 'Descendant', longitude: normalizeLongitude(ascDeg + 180) });
    }
  }
  if (mc) {
    const mcDeg = toAbsDeg(mc);
    if (mcDeg !== null) {
      targets.push({ type: 'solar_return_angle', name: 'Midheaven', longitude: mcDeg });
      targets.push({ type: 'solar_return_angle', name: 'IC', longitude: normalizeLongitude(mcDeg + 180) });
    }
  }

  return targets;
}

// ─── Theme Linking ──────────────────────────────────────────────────

function inferThemeTags(
  transitingPlanet: string,
  targetType: TargetType,
  targetName: string,
): string[] {
  const tags = new Set<string>();

  // From transiting planet
  const transitCats = PLANET_TO_CATEGORIES[transitingPlanet] || [];
  transitCats.forEach(c => tags.add(c));

  // From target
  if (targetType === 'solar_return_angle') {
    (ANGLE_TO_CATEGORIES[targetName] || []).forEach(c => tags.add(c));
  } else {
    (PLANET_TO_CATEGORIES[targetName] || []).forEach(c => tags.add(c));
  }

  return Array.from(tags);
}

function linkToTopTheme(
  themeTags: string[],
  rankedThemes: ScoredCategory[],
): string | null {
  if (rankedThemes.length === 0) return null;
  // Find highest-ranked theme that overlaps with this event's tags
  for (const theme of rankedThemes) {
    if (themeTags.includes(theme.id)) return theme.id;
  }
  return null;
}

// ─── Scoring ────────────────────────────────────────────────────────

function scoreActivation(
  aspectDef: typeof ASPECT_DEFS[number],
  transitingPlanet: TransitingPlanet,
  targetType: TargetType,
  targetName: string,
  orb: number,
  linkedThemeRank: number | null,  // 0-based rank in yearly themes, null if unlinked
): number {
  let score = aspectDef.baseScore;

  // Target bonus
  const targetKey = targetType === 'solar_return_angle'
    ? 'solar_return_angle'
    : `solar_return_${targetName}`;
  score += TARGET_BONUS[targetKey] || 0;

  // If target is a top-ranked theme planet, bonus
  if (linkedThemeRank !== null && linkedThemeRank < 3) {
    score += 4; // top_theme_planet bonus
  } else if (linkedThemeRank !== null && linkedThemeRank < 6) {
    score += 3; // top_theme_house_ruler bonus
  }

  // Planet bonus
  score += PLANET_BONUS[transitingPlanet] || 0;

  // Exactness bonus: 0–3 points, inversely proportional to orb
  const maxOrb = DEFAULT_ORBS[transitingPlanet];
  if (maxOrb > 0) {
    score += Math.round((1 - orb / maxOrb) * 3);
  }

  return Math.max(score, 1);
}

// ─── Headline Generation ────────────────────────────────────────────

const HEADLINE_TEMPLATES: Record<string, Record<AspectName, string>> = {
  Ascendant: {
    conjunction: 'Identity surge and personal visibility',
    opposition: 'Self vs. other tension peaks',
    square: 'Identity challenge demands adjustment',
    trine: 'Easy flow into self-expression',
    sextile: 'Opportunity to redefine yourself',
  },
  Midheaven: {
    conjunction: 'Career and visibility peak',
    opposition: 'Public vs. private life crossroads',
    square: 'Career pressure demands action',
    trine: 'Professional doors open easily',
    sextile: 'Career opportunity emerges',
  },
  Sun: {
    conjunction: 'Core vitality activated',
    opposition: 'Purpose meets external challenge',
    square: 'Will tested by circumstances',
    trine: 'Creative energy flows freely',
    sextile: 'Fresh purpose opens up',
  },
  Moon: {
    conjunction: 'Emotional intensity and needs surface',
    opposition: 'Inner feelings clash with outer demands',
    square: 'Emotional adjustment required',
    trine: 'Emotional comfort and support flow',
    sextile: 'Subtle emotional opening',
  },
};

function generateHeadline(
  transitingPlanet: TransitingPlanet,
  targetName: string,
  aspectName: AspectName,
): string {
  const templates = HEADLINE_TEMPLATES[targetName];
  if (templates?.[aspectName]) {
    return `${transitingPlanet}: ${templates[aspectName]}`;
  }
  // Generic fallback
  const aspectVerb: Record<AspectName, string> = {
    conjunction: 'activates', opposition: 'opposes',
    square: 'challenges', trine: 'supports', sextile: 'opens',
  };
  return `${transitingPlanet} ${aspectVerb[aspectName]} SR ${targetName}`;
}

// ─── Main Engine ────────────────────────────────────────────────────

export interface SRTimingEngineInput {
  srChart: SolarReturnChart;
  natalChart: NatalChart;
  analysis: SolarReturnAnalysis;
  /** Start date of the SR year (the birthday) */
  srStartDate: Date;
  /** End date of the SR year (next birthday) */
  srEndDate: Date;
  /** Scanning step in days (default 1) */
  stepDays?: number;
}

/**
 * Compute all Solar Return timing activations for the year.
 * 
 * Scans each day between srStartDate and srEndDate, checks all transiting planets
 * against all SR targets (planets + angles), detects aspects within orb, scores them,
 * links to yearly themes, and calculates peak windows.
 */
export function computeSRTimingEvents(input: SRTimingEngineInput): SRTimingResult {
  const {
    srChart, natalChart, analysis,
    srStartDate, srEndDate,
    stepDays = 1,
  } = input;

  // 1. Extract targets
  const targets = extractTimingTargets(srChart);
  if (targets.length === 0) return emptyResult();

  // 2. Compute yearly themes for linking
  const rankedThemes = computeYearPriorities(analysis, natalChart, srChart);

  // 3. Scan each day
  const rawHits: Array<{
    date: Date;
    transitingPlanet: TransitingPlanet;
    target: TimingTarget;
    aspectDef: typeof ASPECT_DEFS[number];
    orb: number;
  }> = [];

  const totalDays = Math.ceil((srEndDate.getTime() - srStartDate.getTime()) / 86400000);
  
  for (let d = 0; d <= totalDays; d += stepDays) {
    const currentDate = addDays(srStartDate, d);

    for (const planet of TRANSITING_PLANETS) {
      const body = PLANET_TO_BODY[planet];
      let transitLon: number;
      try {
        transitLon = getPlanetLon(body, currentDate);
      } catch {
        continue;
      }

      const maxOrb = DEFAULT_ORBS[planet];

      for (const target of targets) {
        for (const asp of ASPECT_DEFS) {
          const orb = aspectOrb(transitLon, target.longitude, asp.angle);
          if (orb <= maxOrb) {
            rawHits.push({ date: currentDate, transitingPlanet: planet, target, aspectDef: asp, orb });
          }
        }
      }
    }
  }

  // 4. De-duplicate: for each (planet, target, aspect) combo, keep only the day with smallest orb
  //    within each continuous pass
  const events = deduplicateHits(rawHits, rankedThemes);

  // 5. Sort by date
  events.sort((a, b) => a.date.localeCompare(b.date));

  // 6. Build outputs
  const nextPeakPeriods = [...events]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const themeActivations: Record<string, SRTimingEvent[]> = {};
  for (const ev of events) {
    if (ev.linkedYearPriorityCategory) {
      if (!themeActivations[ev.linkedYearPriorityCategory]) {
        themeActivations[ev.linkedYearPriorityCategory] = [];
      }
      themeActivations[ev.linkedYearPriorityCategory].push(ev);
    }
  }

  return {
    events,
    nextPeakPeriods,
    themeActivations,
    annualTimeline: events,
  };
}

// ─── De-duplication ─────────────────────────────────────────────────

function deduplicateHits(
  rawHits: Array<{
    date: Date;
    transitingPlanet: TransitingPlanet;
    target: TimingTarget;
    aspectDef: typeof ASPECT_DEFS[number];
    orb: number;
  }>,
  rankedThemes: ScoredCategory[],
): SRTimingEvent[] {
  // Group by (planet, targetName, aspectName)
  const groups = new Map<string, typeof rawHits>();
  for (const hit of rawHits) {
    const key = `${hit.transitingPlanet}|${hit.target.name}|${hit.aspectDef.name}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(hit);
  }

  const events: SRTimingEvent[] = [];

  for (const [, hits] of groups) {
    // Sort by date
    hits.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Split into passes (gaps > window size = new pass)
    const passes: typeof rawHits[] = [];
    let currentPass: typeof rawHits = [hits[0]];

    for (let i = 1; i < hits.length; i++) {
      const gap = (hits[i].date.getTime() - hits[i - 1].date.getTime()) / 86400000;
      const windowDays = WINDOW_DAYS[hits[i].transitingPlanet] || 4;
      if (gap > windowDays * 3) {
        passes.push(currentPass);
        currentPass = [hits[i]];
      } else {
        currentPass.push(hits[i]);
      }
    }
    passes.push(currentPass);

    // For each pass, pick the tightest orb day
    for (const pass of passes) {
      const best = pass.reduce((a, b) => a.orb < b.orb ? a : b);
      const { date, transitingPlanet, target, aspectDef, orb } = best;

      const themeTags = inferThemeTags(transitingPlanet, target.type, target.name);
      const linkedCat = linkToTopTheme(themeTags, rankedThemes);
      const linkedRank = linkedCat
        ? rankedThemes.findIndex(t => t.id === linkedCat)
        : null;

      const score = scoreActivation(aspectDef, transitingPlanet, target.type, target.name, orb, linkedRank);

      const maxOrb = DEFAULT_ORBS[transitingPlanet];
      const exactitudeScore = Math.round(Math.max(0, (1 - orb / maxOrb) * 100));

      const strength: 'high' | 'medium' | 'low' =
        score >= 18 ? 'high' : score >= 12 ? 'medium' : 'low';

      const windowHalf = WINDOW_DAYS[transitingPlanet] || 4;
      const peakStart = addDays(date, -windowHalf);
      const peakEnd = addDays(date, windowHalf);

      events.push({
        date: formatDate(date),
        transitingPlanet,
        targetType: target.type,
        targetName: target.name,
        aspectName: aspectDef.name,
        orb: Math.round(orb * 100) / 100,
        exactitudeScore,
        themeTags,
        linkedYearPriorityCategory: linkedCat,
        activationStrength: strength,
        interpretiveHeadline: generateHeadline(transitingPlanet, target.name, aspectDef.name),
        isPeakWindow: score >= 15,
        peakWindowStart: formatDate(peakStart),
        peakWindowEnd: formatDate(peakEnd),
        score,
      });
    }
  }

  return events;
}

function emptyResult(): SRTimingResult {
  return { events: [], nextPeakPeriods: [], themeActivations: {}, annualTimeline: [] };
}

// ─── Convenience: get timing for the next N days from today ─────────

export function getUpcomingSRActivations(
  result: SRTimingResult,
  fromDate: Date = new Date(),
  days: number = 30,
): SRTimingEvent[] {
  const from = formatDate(fromDate);
  const to = formatDate(addDays(fromDate, days));
  return result.events.filter(e => e.date >= from && e.date <= to)
    .sort((a, b) => b.score - a.score);
}

/** Get events for a specific yearly theme */
export function getThemeTimeline(
  result: SRTimingResult,
  themeId: string,
): SRTimingEvent[] {
  return result.themeActivations[themeId] || [];
}
