/**
 * Activation Windows Engine
 * 
 * Calculates when transiting planets activate Solar Return points during the SR year.
 * Three-tier timing: monthly themes, exact transit hits, and peak event windows.
 */

import * as Astronomy from 'astronomy-engine';
import { getPlanetLongitudeExact, aspectOrb, normalizeLongitude } from './transitMath';

const BODY_MAP: Record<string, Astronomy.Body> = {
  Sun: 'Sun' as Astronomy.Body,
  Mercury: 'Mercury' as Astronomy.Body,
  Venus: 'Venus' as Astronomy.Body,
  Mars: 'Mars' as Astronomy.Body,
  Jupiter: 'Jupiter' as Astronomy.Body,
  Saturn: 'Saturn' as Astronomy.Body,
};

const ASPECT_DEFS = [
  { name: 'Conjunction', angle: 0, orb: 2 },
  { name: 'Opposition', angle: 180, orb: 2 },
  { name: 'Square', angle: 90, orb: 2 },
  { name: 'Trine', angle: 120, orb: 2 },
  { name: 'Sextile', angle: 60, orb: 1.5 },
];

export interface TransitHit {
  transitPlanet: string;
  srTarget: string;         // e.g. "SR Sun", "SR Ascendant", "SR Moon"
  srTargetDegree: number;
  aspect: string;
  exactDate: Date;
  orb: number;
  windowStart: Date;
  windowEnd: Date;
  significance: 'high' | 'medium' | 'low';
  interpretation: string;
}

export interface ActivationWindow {
  label: string;
  startDate: Date;
  endDate: Date;
  peakDate: Date;
  triggers: TransitHit[];
  theme: string;
  intensity: number; // 1-10
  type: 'career' | 'relationship' | 'emotional' | 'health' | 'identity' | 'money' | 'mixed';
  advice: string;
}

export interface MonthlyTheme {
  month: number;       // 0-11
  monthLabel: string;
  year: number;
  themes: string[];
  theme: string;       // one-line summary of themes
  transitHits: TransitHit[];
  intensity: number;
}

export interface SRActivationData {
  transitHits: TransitHit[];
  activationWindows: ActivationWindow[];
  monthlyThemes: MonthlyTheme[];
  peakPeriods: { label: string; dates: string; theme: string }[];
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const TRANSIT_SIGNIFICANCE: Record<string, Record<string, 'high' | 'medium' | 'low'>> = {
  Sun: { 'SR Sun': 'high', 'SR Moon': 'high', 'SR Ascendant': 'high', 'SR MC': 'high', default: 'medium' },
  Mars: { 'SR Sun': 'high', 'SR Mars': 'high', 'SR Ascendant': 'high', 'SR MC': 'high', default: 'medium' },
  Jupiter: { 'SR Sun': 'high', 'SR Jupiter': 'medium', 'SR Ascendant': 'high', default: 'medium' },
  Saturn: { 'SR Sun': 'high', 'SR Saturn': 'high', 'SR Moon': 'high', 'SR Ascendant': 'high', default: 'high' },
};

function getTransitInterpretation(transitPlanet: string, srTarget: string, aspect: string): string {
  const interps: Record<string, Record<string, string>> = {
    'Sun-Conjunction': {
      'SR Sun': 'Your solar return themes are directly illuminated — this is a peak visibility moment for your year\'s central purpose.',
      'SR Moon': 'Emotional themes of the year come into sharp focus. What you\'ve been feeling becomes conscious.',
      'SR Ascendant': 'Your year\'s new identity expression is spotlighted. Others see the "new you" clearly.',
      'SR MC': 'Career and public reputation themes peak. Recognition or professional turning points.',
    },
    'Mars-Conjunction': {
      'SR Sun': 'Action energy surges around your core year themes. Assertiveness peaks — channel it intentionally.',
      'SR Mars': 'Drive and conflict potential doubles. Physical energy peaks but so does irritability.',
      'SR Ascendant': 'Your public presence becomes more forceful. Others notice your intensity.',
    },
    'Saturn-Conjunction': {
      'SR Sun': 'Reality check on your year\'s main themes. Structure what matters; release what doesn\'t hold up.',
      'SR Moon': 'Emotional maturation point. Feelings that aren\'t grounded in reality become unsustainable.',
      'SR Ascendant': 'Your year\'s identity expression is tested. Authenticity is the only thing that works.',
    },
    'Jupiter-Conjunction': {
      'SR Sun': 'Expansion and opportunity peak around your core themes. Say yes to growth — but don\'t overcommit.',
      'SR Moon': 'Emotional generosity and optimism surge. Good for big emotional decisions.',
      'SR Ascendant': 'Your presence expands. Opportunities come through being visible and optimistic.',
    },
  };

  const key = `${transitPlanet}-${aspect}`;
  const targetInterps = interps[key];
  if (targetInterps?.[srTarget]) return targetInterps[srTarget];

  // Generic fallback
  const aspectFeel: Record<string, string> = {
    Conjunction: 'directly activates',
    Opposition: 'creates tension and awareness around',
    Square: 'encourages action and decisions regarding',
    Trine: 'supports and eases',
    Sextile: 'opens opportunities related to',
  };
  const transitPlain: Record<string, string> = {
    Sun: 'Your core purpose energy', Mars: 'Your drive and motivation',
    Jupiter: 'Your growth and expansion energy', Saturn: 'Your commitment and responsibility focus',
    Mercury: 'Your communication energy', Venus: 'Your love and connection energy',
  };
  const tpLabel = transitPlain[transitPlanet] || 'This energy';
  return `${tpLabel} ${aspectFeel[aspect] || 'connects with'} your ${srTarget.replace('SR ', '')} placement — this is an activation point for those themes.`;
}

/**
 * Scan the SR year for transit hits to SR points
 */
export function calculateActivationWindows(
  srPlanetPositions: Record<string, number>,   // planet name → ecliptic degree
  srYear: number,
  birthdayMonth: number,  // 0-indexed
  birthdayDay: number,
): SRActivationData {
  // SR year runs birthday to birthday
  const startDate = new Date(srYear, birthdayMonth, birthdayDay);
  const endDate = new Date(srYear + 1, birthdayMonth, birthdayDay);

  const transitHits: TransitHit[] = [];

  // Scan each transiting planet against each SR target
  const transiters = ['Sun', 'Mars', 'Jupiter', 'Saturn'];
  const stepMs = 86400000; // 1 day

  for (const tp of transiters) {
    const body = BODY_MAP[tp];
    if (!body) continue;

    for (const [srTarget, srDeg] of Object.entries(srPlanetPositions)) {
      if (srDeg === null || srDeg === undefined) continue;
      const targetLabel = `SR ${srTarget}`;

      // Sample the orb at daily intervals for each aspect
      for (const aspDef of ASPECT_DEFS) {
        let prevOrb = 999;
        let bestOrb = 999;
        let bestMs = 0;
        let windowStartMs = 0;
        let windowEndMs = 0;
        let inWindow = false;

        for (let ms = startDate.getTime(); ms <= endDate.getTime(); ms += stepMs) {
          const tLon = getPlanetLongitudeExact(body, new Date(ms));
          const orb = aspectOrb(tLon, srDeg, aspDef.angle);

          if (orb <= aspDef.orb && !inWindow) {
            windowStartMs = ms;
            inWindow = true;
          }
          if (orb > aspDef.orb && inWindow) {
            windowEndMs = ms;
            inWindow = false;

            if (bestOrb < 0.5) {
              const sig = TRANSIT_SIGNIFICANCE[tp]?.[targetLabel] || TRANSIT_SIGNIFICANCE[tp]?.default || 'low';
              transitHits.push({
                transitPlanet: tp,
                srTarget: targetLabel,
                srTargetDegree: srDeg,
                aspect: aspDef.name,
                exactDate: new Date(bestMs),
                orb: Math.round(bestOrb * 100) / 100,
                windowStart: new Date(windowStartMs),
                windowEnd: new Date(windowEndMs),
                significance: sig,
                interpretation: getTransitInterpretation(tp, targetLabel, aspDef.name),
              });
            }
            bestOrb = 999;
          }

          if (inWindow && orb < bestOrb) {
            bestOrb = orb;
            bestMs = ms;
          }
          prevOrb = orb;
        }

        // If still in window at end
        if (inWindow && bestOrb < 0.5) {
          const sig = TRANSIT_SIGNIFICANCE[tp]?.[targetLabel] || TRANSIT_SIGNIFICANCE[tp]?.default || 'low';
          transitHits.push({
            transitPlanet: tp,
            srTarget: targetLabel,
            srTargetDegree: srDeg,
            aspect: aspDef.name,
            exactDate: new Date(bestMs),
            orb: Math.round(bestOrb * 100) / 100,
            windowStart: new Date(windowStartMs),
            windowEnd: new Date(endDate.getTime()),
            significance: sig,
            interpretation: getTransitInterpretation(tp, targetLabel, aspDef.name),
          });
        }
      }
    }
  }

  // Sort by date
  transitHits.sort((a, b) => a.exactDate.getTime() - b.exactDate.getTime());

  // Build monthly themes
  const monthlyThemes: MonthlyTheme[] = [];
  for (let m = 0; m < 12; m++) {
    const monthDate = new Date(startDate);
    monthDate.setMonth(monthDate.getMonth() + m);
    const monthNum = monthDate.getMonth();
    const yearNum = monthDate.getFullYear();

    const monthStart = new Date(yearNum, monthNum, 1);
    const monthEnd = new Date(yearNum, monthNum + 1, 0);

    const hits = transitHits.filter(h =>
      h.exactDate >= monthStart && h.exactDate <= monthEnd
    );

    const themes = [...new Set(hits.map(h => h.interpretation))].slice(0, 3);

    const themeList = themes.length > 0 ? themes : ['No major activation this month — a quieter period for integration'];
    const TRANSIT_PLAIN: Record<string, string> = {
      Sun: 'Purpose', Mars: 'Drive', Jupiter: 'Growth', Saturn: 'Responsibility',
      Mercury: 'Communication', Venus: 'Connection',
    };
    const themeSummary = hits.length === 0
      ? 'A quieter month for integration and reflection'
      : [...new Set(hits.map(h => {
          const p = TRANSIT_PLAIN[h.transitPlanet] || h.transitPlanet;
          const t = h.srTarget.replace('SR ', '');
          return `${p} activates ${t}`;
        }))].slice(0, 3).join(', ');

    monthlyThemes.push({
      month: monthNum,
      monthLabel: MONTHS[monthNum],
      year: yearNum,
      themes: themeList,
      theme: themeSummary,
      transitHits: hits,
      intensity: Math.min(10, hits.length * 2 + hits.filter(h => h.significance === 'high').length * 2),
    });
  }

  // Build activation windows by clustering nearby hits
  const activationWindows: ActivationWindow[] = [];
  const used = new Set<number>();

  for (let i = 0; i < transitHits.length; i++) {
    if (used.has(i)) continue;
    const cluster = [transitHits[i]];
    used.add(i);

    for (let j = i + 1; j < transitHits.length; j++) {
      if (used.has(j)) continue;
      const daysDiff = (transitHits[j].exactDate.getTime() - transitHits[i].exactDate.getTime()) / 86400000;
      if (daysDiff <= 14) {
        cluster.push(transitHits[j]);
        used.add(j);
      }
    }

    if (cluster.length > 0) {
      const starts = cluster.map(c => c.windowStart.getTime());
      const ends = cluster.map(c => c.windowEnd.getTime());
      const peakDate = cluster.reduce((best, c) =>
        c.significance === 'high' || c.orb < best.orb ? c : best
      ).exactDate;

      const targets = [...new Set(cluster.map(c => c.srTarget.replace('SR ', '')))];
      const planets = [...new Set(cluster.map(c => c.transitPlanet))];

      const windowType = classifyWindowType(targets, planets);
      const windowAdvice = generateWindowAdvice(windowType, planets, targets);

      activationWindows.push({
        label: `${planets.join(' + ')} → ${targets.join(', ')}`,
        startDate: new Date(Math.min(...starts)),
        endDate: new Date(Math.max(...ends)),
        peakDate,
        triggers: cluster,
        theme: synthesizeWindowTheme(cluster, planets, targets),
        intensity: Math.min(10, cluster.length * 2 + cluster.filter(c => c.significance === 'high').length * 3),
        type: windowType,
        advice: windowAdvice,
      });
    }
  }

  // Peak periods — top 5 most intense windows
  const peakPeriods = activationWindows
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 5)
    .map(w => ({
      label: w.label,
      dates: `${formatShortDate(w.startDate)} – ${formatShortDate(w.endDate)}`,
      theme: w.theme,
    }));

  return { transitHits, activationWindows, monthlyThemes, peakPeriods };
}

function formatShortDate(d: Date): string {
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

// ── Classify activation window type ──

const TARGET_TYPE_MAP: Record<string, ActivationWindow['type']> = {
  Sun: 'identity', Moon: 'emotional', Ascendant: 'identity', MC: 'career',
  Venus: 'relationship', Mars: 'health', Jupiter: 'money', Saturn: 'career',
  Mercury: 'career', Neptune: 'emotional', Pluto: 'identity', Uranus: 'identity',
  Chiron: 'health',
};

function classifyWindowType(targets: string[], planets: string[]): ActivationWindow['type'] {
  const types = targets.map(t => TARGET_TYPE_MAP[t] || 'mixed');
  const unique = [...new Set(types)];
  if (unique.length === 1) return unique[0];
  if (planets.includes('Saturn')) return 'career';
  if (planets.includes('Venus') || targets.includes('Venus')) return 'relationship';
  return 'mixed';
}

function generateWindowAdvice(type: ActivationWindow['type'], _planets: string[], _targets: string[]): string {
  const adviceMap: Record<string, string> = {
    career: 'Schedule important meetings, launches, or negotiations during this window.',
    relationship: 'Ideal for deepening connections or having important conversations.',
    emotional: 'Honor your feelings — journaling or creative expression helps process what surfaces.',
    health: 'Pay attention to body signals. Good time for starting new health routines.',
    identity: 'Who you are is shifting. Embrace the evolution instead of clinging to old patterns.',
    money: 'Financial opportunities or pressures peak. Review budgets and be strategic.',
    mixed: 'Multiple life areas activate simultaneously. Prioritize what feels most urgent.',
  };
  return adviceMap[type] || adviceMap.mixed;
}

// ── Synthesize a real theme description for activation windows ──

const PLANET_THEME_ACTION: Record<string, string> = {
  Sun: 'brings visibility and clarity to',
  Mars: 'pushes you to take action on',
  Jupiter: 'opens doors and expands',
  Saturn: 'demands accountability and hard work around',
  Mercury: 'accelerates communication about',
  Venus: 'brings warmth and connection to',
};

const TARGET_AREA: Record<string, string> = {
  Sun: 'your core identity and purpose for the year',
  Moon: 'your emotional needs and inner security',
  Ascendant: 'how people see you and your personal presence',
  MC: 'your career direction and public reputation',
  Mars: 'your drive, motivation, and how you assert yourself',
  Venus: 'your relationships, values, and what brings you joy',
  Jupiter: 'your growth opportunities and where life expands',
  Saturn: 'your responsibilities and where you face the hardest lessons',
  Mercury: 'your thinking, conversations, and daily decisions',
  Neptune: 'your intuition, creativity, and what feels unclear',
  Pluto: 'the deep changes happening beneath the surface',
  Uranus: 'where sudden shifts and unexpected events land',
  Chiron: 'your sensitive spots and where healing is available',
};

function synthesizeWindowTheme(cluster: TransitHit[], planets: string[], targets: string[]): string {
  // Use the highest-significance hit's interpretation as basis
  const highHit = cluster.find(c => c.significance === 'high') || cluster[0];

  if (cluster.length === 1) {
    return highHit.interpretation;
  }

  // Multiple hits — synthesize
  const planetActions = planets.map(p => PLANET_THEME_ACTION[p] || `activates`);
  const targetAreas = targets.map(t => TARGET_AREA[t] || `your ${t} themes`);

  if (planets.length === 1 && targets.length > 1) {
    return `${planets[0]} ${planetActions[0]} multiple areas at once: ${targetAreas.join(' and ')}. This is a concentrated burst — expect noticeable events.`;
  }

  if (planets.length > 1 && targets.length === 1) {
    return `Multiple planets (${planets.join(' and ')}) converge on ${targetAreas[0]}. This area gets loud — decisions and events pile up here.`;
  }

  // General multi-hit
  return `${planets.join(' and ')} activate ${targetAreas.slice(0, 2).join(' and ')} simultaneously. When this many triggers overlap, events feel faster and more significant. ${highHit.interpretation}`;
}
