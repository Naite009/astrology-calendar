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
  timingMethod?: string;
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

// Activation text is a dated label plus a hedged, concrete note. Transits to SR points are
// timing context only: no peaks, events, recognition, conflict or certainty claims.
function getTransitInterpretation(transitPlanet: string, srTarget: string, aspect: string): string {
  const target = srTarget.replace('SR ', '');
  const area = TARGET_AREA[target] || `your Solar Return ${target}`;
  return `Transiting ${transitPlanet} ${aspect.toLowerCase()} Solar Return ${target}. Around this date you may notice ${area} in your plans or conversations.`;
}

/**
 * Scan the SR year for transit hits to SR points
 */
export function calculateActivationWindows(
  srPlanetPositions: Record<string, number>,   // planet name → ecliptic degree
  srYear: number,
  birthdayMonth: number,  // 0-indexed
  birthdayDay: number,
  returnInstant?: Date | null,
): SRActivationData {
  // SR year runs birthday to birthday
  if (!Number.isFinite(srPlanetPositions.Sun)) return { transitHits: [], activationWindows: [], monthlyThemes: [], peakPeriods: [] };
  const startDate = returnInstant || Astronomy.SearchSunLongitude(srPlanetPositions.Sun, new Date(Date.UTC(srYear, birthdayMonth, birthdayDay) - 20 * 86400000), 40)?.date;
  if (!startDate) return { transitHits: [], activationWindows: [], monthlyThemes: [], peakPeriods: [] };
  const endDate = Astronomy.SearchSunLongitude(srPlanetPositions.Sun, new Date(startDate.getTime() + 350 * 86400000), 30)?.date || new Date(startDate.getTime() + 365.25 * 86400000);

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
                exactDate: (() => {
                  let lo = Math.max(startDate.getTime(), bestMs - stepMs), hi = Math.min(endDate.getTime(), bestMs + stepMs);
                  for (let n = 0; n < 40; n++) {
                    const left = lo + (hi - lo) / 3, right = hi - (hi - lo) / 3;
                    if (aspectOrb(getPlanetLongitudeExact(body, new Date(left)), srDeg, aspDef.angle) < aspectOrb(getPlanetLongitudeExact(body, new Date(right)), srDeg, aspDef.angle)) hi = right; else lo = left;
                  }
                  return new Date((lo + hi) / 2);
                })(),
                timingMethod: 'Daily ephemeris scan with numerical minimum refinement; orb-window boundaries sampled daily', 
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
            exactDate: (() => {
                  let lo = Math.max(startDate.getTime(), bestMs - stepMs), hi = Math.min(endDate.getTime(), bestMs + stepMs);
                  for (let n = 0; n < 40; n++) {
                    const left = lo + (hi - lo) / 3, right = hi - (hi - lo) / 3;
                    if (aspectOrb(getPlanetLongitudeExact(body, new Date(left)), srDeg, aspDef.angle) < aspectOrb(getPlanetLongitudeExact(body, new Date(right)), srDeg, aspDef.angle)) hi = right; else lo = left;
                  }
                  return new Date((lo + hi) / 2);
                })(),
                timingMethod: 'Daily ephemeris scan with numerical minimum refinement; orb-window boundaries sampled daily', 
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
  for (const hit of transitHits) {
    const body = BODY_MAP[hit.transitPlanet];
    const definition = ASPECT_DEFS.find(a => a.name === hit.aspect);
    if (body && definition) hit.orb = aspectOrb(getPlanetLongitudeExact(body, hit.exactDate), hit.srTargetDegree, definition.angle);
    hit.timingMethod = hit.orb < 0.001 ? 'Numerically refined exact ephemeris contact; orb-window boundaries sampled daily' : 'Closest approach, not an exact pass; orb-window boundaries sampled daily';
  }
  transitHits.sort((a, b) => a.exactDate.getTime() - b.exactDate.getTime());

  // Build monthly themes
  const monthlyThemes: MonthlyTheme[] = [];
  for (let m = 0; m < 12; m++) {
    const monthDate = new Date(startDate);
    monthDate.setUTCDate(1);
    monthDate.setUTCMonth(startDate.getUTCMonth() + m);
    const monthNum = monthDate.getUTCMonth();
    const yearNum = monthDate.getUTCFullYear();

    const monthStart = new Date(Date.UTC(yearNum, monthNum, 1));
    const monthEnd = new Date(Date.UTC(yearNum, monthNum + 1, 1));

    const hits = transitHits.filter(h =>
      h.exactDate >= monthStart && h.exactDate < monthEnd
    );

    const themes = [...new Set(hits.map(h => h.interpretation))].slice(0, 3);

    const themeList = themes.length > 0 ? themes : ['No major activation this month: a quieter period for integration'];
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

      const LABEL_PLAIN: Record<string, string> = {
        Sun: 'Purpose', Mars: 'Drive', Jupiter: 'Growth', Saturn: 'Responsibility',
        Mercury: 'Communication', Venus: 'Connection',
      };
      const plainPlanets = planets.map(p => LABEL_PLAIN[p] || p);

      const windowType = classifyWindowType(targets, planets);
      const windowAdvice = generateWindowAdvice(windowType, planets, targets);

      activationWindows.push({
        label: `${plainPlanets.join(' + ')} → ${targets.join(', ')}`,
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
    career: 'If you have a work decision pending, you could schedule time to review it in this window.',
    relationship: 'If a conversation with someone close has been waiting, you could plan it for this window.',
    emotional: 'You could set aside some quiet time to notice what you need from your week.',
    health: 'You could check whether your daily routine still fits your schedule.',
    identity: 'You could review how you are presenting your plans to others.',
    money: 'You could review your budget or a planned purchase during this window.',
    mixed: 'Several chart points are contacted close together; you could list what is due and pick one priority.',
  };
  return adviceMap[type] || adviceMap.mixed;
}

// ── Synthesize a real theme description for activation windows ──

const TARGET_AREA: Record<string, string> = {
  Sun: 'the main priority of your year',
  Moon: 'what helps you feel settled day to day',
  Ascendant: 'how you introduce yourself and your plans',
  MC: 'work and public responsibilities',
  Mars: 'where you take action and set limits',
  Venus: 'the people and activities you enjoy',
  Jupiter: 'plans you want to grow',
  Saturn: 'commitments and limits you can maintain',
  Mercury: 'conversations, information and decisions',
  Neptune: 'agreements worth checking before you act',
  Pluto: 'commitments you may reconsider',
  Uranus: 'routines you may want to change',
  Chiron: 'a sensitive area you may handle with more care',
};

function synthesizeWindowTheme(cluster: TransitHit[], planets: string[], targets: string[]): string {
  const highHit = cluster.find(c => c.significance === 'high') || cluster[0];
  if (cluster.length === 1) return highHit.interpretation;
  const areas = [...new Set(targets.map(t => TARGET_AREA[t] || `Solar Return ${t}`))].slice(0, 2);
  return `${cluster.length} transit contacts (${[...new Set(planets)].join(', ')}) fall close together. Around these dates you may notice ${areas.join(' and ')} in your plans or conversations.`;
}
