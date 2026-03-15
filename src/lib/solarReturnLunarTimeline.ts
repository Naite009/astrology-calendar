// 29-Year Solar Return Lunar Phase Timeline Engine
// Uses astronomy-engine to compute the exact SR Moon position for each year

import * as Astronomy from 'astronomy-engine';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

// ── Phase definitions (from the JSON spec) ──────────────────────────
export interface PhaseDefinition {
  name: string;
  range: [number, number];
  cycleStage: string;
  shortMeaning: string;
  colorLabel: string;
}

export const PHASE_DEFINITIONS: PhaseDefinition[] = [
  { name: 'New Moon', range: [0, 22.5], cycleStage: 'Beginning', shortMeaning: 'A year of initiation, emergence, and planting new seeds.', colorLabel: 'beginning' },
  { name: 'Crescent', range: [22.5, 67.5], cycleStage: 'Growth', shortMeaning: 'A year of effort, traction, and building momentum.', colorLabel: 'growth' },
  { name: 'First Quarter', range: [67.5, 112.5], cycleStage: 'Action', shortMeaning: 'A year of challenge, decisions, and decisive forward movement.', colorLabel: 'action' },
  { name: 'Gibbous', range: [112.5, 157.5], cycleStage: 'Refinement', shortMeaning: 'A year of preparation, adjustment, and improvement before culmination.', colorLabel: 'refinement' },
  { name: 'Full Moon', range: [157.5, 202.5], cycleStage: 'Culmination', shortMeaning: 'A year of visibility, relationship focus, revelation, and harvest.', colorLabel: 'culmination' },
  { name: 'Disseminating', range: [202.5, 247.5], cycleStage: 'Sharing', shortMeaning: 'A year of teaching, distributing, contributing, and expressing what has been learned.', colorLabel: 'sharing' },
  { name: 'Last Quarter', range: [247.5, 292.5], cycleStage: 'Reevaluation', shortMeaning: 'A year of restructuring, rethinking, and challenging old systems.', colorLabel: 'reevaluation' },
  { name: 'Balsamic', range: [292.5, 360], cycleStage: 'Completion', shortMeaning: 'A year of closure, release, healing, and spiritual preparation for the next beginning.', colorLabel: 'completion' },
];

// ── Timeline entry ──────────────────────────────────────────────────
export interface TimelineEntry {
  year: number;
  age: number;
  phase: string;
  phaseAngle: number;
  cycleStage: string;
  moonSign: string;
  sunSign: string;
  waxingOrWaning: 'waxing' | 'waning';
  shortMeaning: string;
  colorLabel: string;
  isCurrent: boolean;
  isMajorTransition: boolean;
  patternTags: string[];
}

// ── Pattern detection result ────────────────────────────────────────
export interface TimelinePatterns {
  newCycleYears: number[];
  crescentYears: number[];
  actionYears: number[];
  refinementYears: number[];
  culminationYears: number[];
  sharingYears: number[];
  turningPointYears: number[];
  releaseYears: number[];
  bridgeYears: number[];
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Convert sign+degree+minutes to absolute ecliptic longitude */
function signDegreeToLongitude(sign: string, degree: number, minutes: number): number {
  const idx = ZODIAC_SIGNS.indexOf(sign);
  if (idx < 0) return 0;
  return idx * 30 + degree + minutes / 60;
}

/** Convert absolute longitude to sign+degree */
function lonToSign(lon: number): { sign: string; degree: number } {
  const normalized = ((lon % 360) + 360) % 360;
  const idx = Math.floor(normalized / 30);
  return { sign: ZODIAC_SIGNS[idx], degree: Math.floor(normalized - idx * 30) };
}

/** Get the Sun's ecliptic longitude at a given date */
function getSunLongitude(date: Date): number {
  const pos = Astronomy.SunPosition(date);
  return pos.elon;
}

/** Get the Moon's ecliptic longitude at a given date */
function getMoonLongitude(date: Date): number {
  const vec = Astronomy.GeoVector(Astronomy.Body.Moon, date, true);
  const ecl = Astronomy.Ecliptic(vec);
  return ecl.elon;
}

/**
 * Find the exact moment the Sun returns to a target ecliptic longitude,
 * searching near a given date. Uses bisection for precision.
 */
function findSolarReturn(targetLon: number, searchCenter: Date): Date {
  // Search in a window of ±10 days around the expected birthday
  let lo = new Date(searchCenter.getTime() - 10 * 86400000);
  let hi = new Date(searchCenter.getTime() + 10 * 86400000);

  // Normalize target
  const target = ((targetLon % 360) + 360) % 360;

  // We need to find where sun lon crosses target.
  // Sun moves ~1°/day, so in 20 days it moves ~20°.
  // Use a scan + refine approach.

  // Scan at 2-hour intervals to find the crossing
  const step = 2 * 3600000; // 2 hours
  let bestTime = searchCenter;
  let bestDiff = 999;

  for (let t = lo.getTime(); t <= hi.getTime(); t += step) {
    const d = new Date(t);
    const sunLon = getSunLongitude(d);
    let diff = sunLon - target;
    // Handle wrap-around
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    const absDiff = Math.abs(diff);
    if (absDiff < bestDiff) {
      bestDiff = absDiff;
      bestTime = d;
    }
  }

  // Bisect around best time for higher precision (to ~1 minute)
  lo = new Date(bestTime.getTime() - 2 * 3600000);
  hi = new Date(bestTime.getTime() + 2 * 3600000);

  for (let i = 0; i < 20; i++) {
    const mid = new Date((lo.getTime() + hi.getTime()) / 2);
    const sunLon = getSunLongitude(mid);
    let diff = sunLon - target;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    if (Math.abs(diff) < 0.001) return mid; // Good enough (~3.6 arc-seconds)

    // Determine which half contains the crossing
    const loLon = getSunLongitude(lo);
    let loDiff = loLon - target;
    if (loDiff > 180) loDiff -= 360;
    if (loDiff < -180) loDiff += 360;

    if ((loDiff < 0 && diff > 0) || (loDiff > 0 && diff < 0)) {
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return new Date((lo.getTime() + hi.getTime()) / 2);
}

/** Determine phase from angle */
function getPhaseFromAngle(angle: number): PhaseDefinition {
  const normalized = ((angle % 360) + 360) % 360;
  for (const phase of PHASE_DEFINITIONS) {
    if (normalized >= phase.range[0] && normalized < phase.range[1]) return phase;
  }
  // Edge case: exactly 360 = New Moon
  return PHASE_DEFINITIONS[0];
}

/** Detect pattern tags for an entry */
function getPatternTags(phase: string, moonSign: string, sunSign: string): string[] {
  const tags: string[] = [];
  if (phase === 'New Moon') tags.push('new_cycle');
  if (phase === 'Full Moon') tags.push('culmination');
  if (phase === 'Balsamic') tags.push('release', 'spiritual_reset');
  if (phase === 'First Quarter' || phase === 'Last Quarter') tags.push('turning_point');
  if (moonSign !== sunSign) tags.push('bridge_year');
  return tags;
}

// ── Main computation ────────────────────────────────────────────────

/**
 * Compute the 29-year Solar Return Lunar Phase Timeline.
 * 
 * @param natalSunSign - Natal Sun sign
 * @param natalSunDegree - Natal Sun degree within sign
 * @param natalSunMinutes - Natal Sun minutes
 * @param birthDate - Birth date string (YYYY-MM-DD or similar)
 * @param currentSRYear - The current Solar Return year (anchor)
 * @param yearsPast - How many years back (default 14)
 * @param yearsFuture - How many years forward (default 14)
 */
export function computeLunarPhaseTimeline(
  natalSunSign: string,
  natalSunDegree: number,
  natalSunMinutes: number,
  birthDate: string,
  currentSRYear: number,
  yearsPast = 14,
  yearsFuture = 14,
): TimelineEntry[] {
  const natalSunLon = signDegreeToLongitude(natalSunSign, natalSunDegree, natalSunMinutes);
  if (natalSunLon === 0 && natalSunSign !== 'Aries') return [];

  // Parse birth date for month/day
  const bd = new Date(birthDate + 'T12:00:00Z');
  const birthMonth = bd.getUTCMonth();
  const birthDay = bd.getUTCDate();
  const birthYear = bd.getUTCFullYear();

  // Start from birth year, go to current + yearsFuture
  const startYear = birthYear;
  const endYear = currentSRYear + yearsFuture;
  const entries: TimelineEntry[] = [];

  for (let year = startYear; year <= endYear; year++) {
    try {
      // Create a search center near the birthday in this year
      const searchCenter = new Date(Date.UTC(year, birthMonth, birthDay, 12, 0, 0));

      // Find exact SR moment
      const srMoment = findSolarReturn(natalSunLon, searchCenter);

      // Get Moon position at SR moment
      const moonLon = getMoonLongitude(srMoment);
      const sunLon = getSunLongitude(srMoment);

      // Phase angle = Moon - Sun (mod 360)
      const phaseAngle = ((moonLon - sunLon) % 360 + 360) % 360;

      const phaseDef = getPhaseFromAngle(phaseAngle);
      const moonInfo = lonToSign(moonLon);
      const sunInfo = lonToSign(sunLon);

      const age = year - birthYear;
      const isCurrent = year === currentSRYear;
      const tags = getPatternTags(phaseDef.name, moonInfo.sign, sunInfo.sign);

      entries.push({
        year,
        age,
        phase: phaseDef.name,
        phaseAngle: Math.round(phaseAngle * 100) / 100,
        cycleStage: phaseDef.cycleStage,
        moonSign: moonInfo.sign,
        sunSign: sunInfo.sign,
        waxingOrWaning: phaseAngle < 180 ? 'waxing' : 'waning',
        shortMeaning: phaseDef.shortMeaning,
        colorLabel: phaseDef.colorLabel,
        isCurrent,
        isMajorTransition: tags.includes('new_cycle') || tags.includes('release') || tags.includes('turning_point'),
        patternTags: tags,
      });
    } catch {
      // Skip years that fail computation
    }
  }

  return entries;
}

/** Detect recurring patterns across the timeline */
export function detectTimelinePatterns(entries: TimelineEntry[]): TimelinePatterns {
  return {
    newCycleYears: entries.filter(e => e.phase === 'New Moon').map(e => e.year),
    crescentYears: entries.filter(e => e.phase === 'Crescent').map(e => e.year),
    actionYears: entries.filter(e => e.phase === 'First Quarter').map(e => e.year),
    refinementYears: entries.filter(e => e.phase === 'Gibbous').map(e => e.year),
    culminationYears: entries.filter(e => e.phase === 'Full Moon').map(e => e.year),
    sharingYears: entries.filter(e => e.phase === 'Disseminating').map(e => e.year),
    turningPointYears: entries.filter(e => e.phase === 'Last Quarter').map(e => e.year),
    releaseYears: entries.filter(e => e.phase === 'Balsamic').map(e => e.year),
    bridgeYears: entries.filter(e => e.moonSign !== e.sunSign).map(e => e.year),
  };
}

/** Generate timeline summary narrative */
export function generateTimelineSummary(entries: TimelineEntry[], currentYear: number): string {
  const current = entries.find(e => e.year === currentYear);
  if (!current) return '';

  const totalYears = entries.length;
  return `Over the last ${totalYears} years, your Solar Return lunar phases reveal a repeating developmental story: years of beginning, growth, culmination, reevaluation, and closure. The current year falls in the ${current.phase} phase, emphasizing ${current.cycleStage.toLowerCase()}.`;
}

/** Generate transition narrative between two consecutive years */
export function generateTransitionNarrative(prev: TimelineEntry | undefined, current: TimelineEntry): string {
  if (!prev) return '';
  if (prev.cycleStage === current.cycleStage) {
    return `This year continues the ${current.cycleStage.toLowerCase()} energy from ${prev.year}.`;
  }
  return `The shift from ${prev.year}'s ${prev.cycleStage.toLowerCase()} into ${current.year}'s ${current.cycleStage.toLowerCase()} suggests movement from ${prev.phase.toLowerCase()} themes into ${current.phase.toLowerCase()} territory.`;
}
