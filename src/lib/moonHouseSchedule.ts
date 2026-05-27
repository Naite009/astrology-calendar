// Build a schedule of transiting-Moon house changes for the rest of "today",
// using the user's natal house cusps. Moon always moves forward, so we compute
// crossings analytically via linear interpolation across [now, end].
import * as Astronomy from 'astronomy-engine';
import { NatalChart } from '@/hooks/useNatalChart';
import { findNextMoonSignChange } from './voidOfCourseMoon';
import { signDegreesToLongitude } from './houseCalculations';

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const moonLon = (d: Date): number => {
  const m = Astronomy.GeoMoon(d);
  return Astronomy.Ecliptic(m).elon;
};

const signFromLon = (lon: number): string => SIGNS[Math.floor(((lon % 360) + 360) % 360 / 30)];

const formatTime = (d: Date, tz?: string): string =>
  d.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    ...(tz ? { timeZone: tz } : {}),
  });

const ord = (n: number) =>
  n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;

export interface MoonHouseSegment {
  from: Date;
  to: Date;
  house: number;
  sign: string;
}

/**
 * Returns Moon house segments from `now` until the Moon's next sign change
 * (or +24h, whichever comes first). Handles the case where the Moon crosses
 * one or more natal house cusps within its current sign window.
 */
export function getMoonHouseSchedule(
  chart: NatalChart,
  now: Date = new Date(),
): MoonHouseSegment[] {
  if (!chart?.houseCusps) return [];

  // Collect 12 cusp longitudes, indexed by house number.
  const cusps: { house: number; lon: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = (chart.houseCusps as any)[`house${i}`];
    if (!c?.sign) return [];
    cusps.push({ house: i, lon: signDegreesToLongitude(c.sign, c.degree, c.minutes || 0) });
  }

  // Helper: find house for a longitude.
  const houseOf = (lon: number): number => {
    let normLon = ((lon % 360) + 360) % 360;
    for (let i = 0; i < 12; i++) {
      const cur = cusps[i].lon;
      const nxt = cusps[(i + 1) % 12].lon;
      if (nxt < cur) {
        if (normLon >= cur || normLon < nxt) return cusps[i].house;
      } else {
        if (normLon >= cur && normLon < nxt) return cusps[i].house;
      }
    }
    return cusps[0].house;
  };

  // Window: now → next Moon sign change (capped at +24h).
  const signChange = findNextMoonSignChange(now);
  const cap = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const end = signChange.time.getTime() < cap.getTime() ? signChange.time : cap;

  const startLon = moonLon(now);
  const endLonRaw = moonLon(end);
  // Unwrap forward (Moon always moves forward).
  let endLonUnwrapped = endLonRaw;
  while (endLonUnwrapped < startLon) endLonUnwrapped += 360;

  // Find all cusp crossings between startLon and endLonUnwrapped.
  const crossings: { time: Date; house: number }[] = [];
  for (const { lon, house } of cusps) {
    // Try lon and lon+360 to cover wrap.
    for (const cand of [lon, lon + 360]) {
      if (cand > startLon && cand <= endLonUnwrapped) {
        const frac = (cand - startLon) / (endLonUnwrapped - startLon);
        const t = new Date(now.getTime() + frac * (end.getTime() - now.getTime()));
        // House the Moon ENTERS when crossing cusp `house` is `house`.
        crossings.push({ time: t, house });
      }
    }
  }
  crossings.sort((a, b) => a.time.getTime() - b.time.getTime());

  // Build segments.
  const segments: MoonHouseSegment[] = [];
  let segStart = now;
  let segHouse = houseOf(startLon);
  const sign = signFromLon(startLon);
  for (const c of crossings) {
    if (c.house === segHouse) continue;
    segments.push({ from: segStart, to: c.time, house: segHouse, sign });
    segStart = c.time;
    segHouse = c.house;
  }
  segments.push({ from: segStart, to: end, house: segHouse, sign });
  return segments;
}

/**
 * Renders the Moon house schedule as a single human/AI-readable line, e.g.
 *   "Moon in Libra: in your 12th house until 3:47 PM EDT, then your 1st
 *    house until Moon enters Scorpio at 8:52 PM EDT."
 */
export function formatMoonHouseSchedule(
  chart: NatalChart,
  now: Date = new Date(),
  tz?: string,
  tzAbbr: string = 'ET',
): string {
  const segs = getMoonHouseSchedule(chart, now);
  if (!segs.length) return '';
  const sign = segs[0].sign;
  const signChange = findNextMoonSignChange(now);
  const nextSign = signChange.newSign;
  const ingressTime = formatTime(signChange.time, tz);

  if (segs.length === 1) {
    return `Moon in ${sign}: in your ${ord(segs[0].house)} house until Moon enters ${nextSign} at ${ingressTime} ${tzAbbr}.`;
  }
  const parts: string[] = [`Moon in ${sign}:`];
  segs.forEach((s, i) => {
    const isLast = i === segs.length - 1;
    if (isLast) {
      parts.push(`then your ${ord(s.house)} house until Moon enters ${nextSign} at ${ingressTime} ${tzAbbr}.`);
    } else if (i === 0) {
      parts.push(`in your ${ord(s.house)} house until ${formatTime(s.to, tz)} ${tzAbbr},`);
    } else {
      parts.push(`then your ${ord(s.house)} house until ${formatTime(s.to, tz)} ${tzAbbr},`);
    }
  });
  return parts.join(' ');
}
