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

/** Calendar day key in the display zone, so "today" means the viewer's today. */
const dayKey = (d: Date, tz?: string): string =>
  d.toLocaleDateString('en-CA', { ...(tz ? { timeZone: tz } : {}) });

/** Short zone label ("EDT") for the display zone, so we never hard-code ET. */
export const zoneAbbr = (d: Date, tz?: string): string => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      ...(tz ? { timeZone: tz } : {}),
      timeZoneName: 'short',
    }).formatToParts(d);
    return parts.find((p) => p.type === 'timeZoneName')?.value || '';
  } catch {
    return '';
  }
};

/**
 * Time plus the day when it is not today, so a next-day ingress can never read
 * as if it happens this afternoon.
 */
export const formatWhen = (d: Date, now: Date, tz?: string, tzAbbr?: string): string => {
  const abbr = tzAbbr || zoneAbbr(d, tz);
  const clock = `${formatTime(d, tz)}${abbr ? ` ${abbr}` : ''}`;
  const today = dayKey(now, tz);
  const target = dayKey(d, tz);
  if (target === today) return clock;
  const tomorrow = dayKey(new Date(now.getTime() + 24 * 60 * 60 * 1000), tz);
  if (target === tomorrow) return `tomorrow at ${clock}`;
  const weekday = d.toLocaleDateString('en-US', {
    weekday: 'long',
    ...(tz ? { timeZone: tz } : {}),
  });
  return `${weekday} at ${clock}`;
};

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
 * Times that fall on another day are labeled ("tomorrow at 12:49 PM EDT").
 */
export function formatMoonHouseSchedule(
  chart: NatalChart,
  now: Date = new Date(),
  tz?: string,
  tzAbbr?: string,
): string {
  const segs = getMoonHouseSchedule(chart, now);
  if (!segs.length) return '';
  const sign = segs[0].sign;
  const signChange = findNextMoonSignChange(now);
  const nextSign = signChange.newSign;
  const when = (d: Date) => formatWhen(d, now, tz, tzAbbr);
  // The schedule window is capped at 24h; only promise an ingress inside it.
  const ingressInWindow =
    signChange.time.getTime() <= segs[segs.length - 1].to.getTime() + 60_000;
  const tail = ingressInWindow
    ? `until Moon enters ${nextSign} at ${when(signChange.time)}.`
    : `for the rest of the day. Moon enters ${nextSign} ${when(signChange.time)}.`;

  if (segs.length === 1) {
    return `Moon in ${sign}: in your ${ord(segs[0].house)} house ${tail}`;
  }
  const parts: string[] = [`Moon in ${sign}:`];
  segs.forEach((s, i) => {
    const isLast = i === segs.length - 1;
    if (isLast) {
      parts.push(`then your ${ord(s.house)} house ${tail}`);
    } else if (i === 0) {
      parts.push(`in your ${ord(s.house)} house until ${when(s.to)},`);
    } else {
      parts.push(`then your ${ord(s.house)} house until ${when(s.to)},`);
    }
  });
  return parts.join(' ');
}

export interface MoonUpcomingChange {
  /** "house" = crosses a natal cusp, "sign" = Moon changes sign. */
  kind: 'house' | 'sign';
  time: Date;
  label: string;
}

/**
 * The next few Moon changes, for a live "what changes next" strip.
 * House crossings come from the natal cusps; the sign change is appended even
 * when it falls outside the 24h schedule window, with its day labeled.
 */
export function getMoonUpcomingChanges(
  chart: NatalChart,
  now: Date = new Date(),
  tz?: string,
  tzAbbr?: string,
): MoonUpcomingChange[] {
  const segs = getMoonHouseSchedule(chart, now);
  if (!segs.length) return [];
  const when = (d: Date) => formatWhen(d, now, tz, tzAbbr);
  const out: MoonUpcomingChange[] = [];

  segs.slice(1).forEach((s) => {
    out.push({
      kind: 'house',
      time: s.from,
      label: `Moves into your ${ord(s.house)} house at ${when(s.from)}`,
    });
  });

  const signChange = findNextMoonSignChange(now);
  out.push({
    kind: 'sign',
    time: signChange.time,
    label: `Moon enters ${signChange.newSign} at ${when(signChange.time)}`,
  });

  return out.sort((a, b) => a.time.getTime() - b.time.getTime()).slice(0, 3);
}

/**
 * A house change inside the last hour, so the card can say the shift just
 * happened instead of silently redrawing.
 */
export function getJustChangedNote(
  chart: NatalChart,
  now: Date = new Date(),
): string | null {
  const segs = getMoonHouseSchedule(chart, now);
  if (!segs.length) return null;
  const start = segs[0].from.getTime();
  // segs[0].from is `now` by construction, so look one hour back instead.
  const past = getMoonHouseSchedule(chart, new Date(now.getTime() - 60 * 60 * 1000));
  if (!past.length || past[0].house === segs[0].house) return null;
  void start;
  return `Just moved into your ${ord(segs[0].house)} house.`;
}

