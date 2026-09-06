/**
 * Deterministic "Sky right now" block for the Cosmic Weather email.
 * Computed at 12:00 AM Eastern Time on the chosen date using astronomy-engine.
 * NO AI involved — pure ephemeris math.
 */

import * as Astronomy from "astronomy-engine";
import { findNextMoonSignChange } from "./voidOfCourseMoon";
import { getDetailedChironPosition, getDetailedNodePosition } from "./astrology";
import { localToUtc } from "./time/zonedTime";

const ZODIAC = [
  { name: "Aries", symbol: "♈" },
  { name: "Taurus", symbol: "♉" },
  { name: "Gemini", symbol: "♊" },
  { name: "Cancer", symbol: "♋" },
  { name: "Leo", symbol: "♌" },
  { name: "Virgo", symbol: "♍" },
  { name: "Libra", symbol: "♎" },
  { name: "Scorpio", symbol: "♏" },
  { name: "Sagittarius", symbol: "♐" },
  { name: "Capricorn", symbol: "♑" },
  { name: "Aquarius", symbol: "♒" },
  { name: "Pisces", symbol: "♓" },
];

const PLANETS: { key: string; label: string; symbol: string; body: Astronomy.Body | "Moon" }[] = [
  { key: "sun", label: "Sun", symbol: "☉", body: Astronomy.Body.Sun },
  { key: "moon", label: "Moon", symbol: "☽", body: "Moon" },
  { key: "mercury", label: "Mercury", symbol: "☿", body: Astronomy.Body.Mercury },
  { key: "venus", label: "Venus", symbol: "♀", body: Astronomy.Body.Venus },
  { key: "mars", label: "Mars", symbol: "♂", body: Astronomy.Body.Mars },
  { key: "jupiter", label: "Jupiter", symbol: "♃", body: Astronomy.Body.Jupiter },
  { key: "saturn", label: "Saturn", symbol: "♄", body: Astronomy.Body.Saturn },
  { key: "uranus", label: "Uranus", symbol: "♅", body: Astronomy.Body.Uranus },
  { key: "neptune", label: "Neptune", symbol: "♆", body: Astronomy.Body.Neptune },
  { key: "pluto", label: "Pluto", symbol: "♇", body: Astronomy.Body.Pluto },
];

function longitudeOf(body: Astronomy.Body | "Moon", date: Date): number {
  if (body === "Moon") {
    const m = Astronomy.GeoMoon(date);
    return Astronomy.Ecliptic(m).elon;
  }
  const v = Astronomy.GeoVector(body, date, false);
  return Astronomy.Ecliptic(v).elon;
}

function isRetro(body: Astronomy.Body | "Moon", date: Date): boolean {
  if (body === "Moon" || body === Astronomy.Body.Sun) return false;
  const before = longitudeOf(body, new Date(date.getTime() - 12 * 3600 * 1000));
  const after = longitudeOf(body, new Date(date.getTime() + 12 * 3600 * 1000));
  let diff = after - before;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
}

function fmtPos(lon: number): { sign: string; symbol: string; deg: number; min: number } {
  const norm = ((lon % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const inSign = norm - idx * 30;
  let deg = Math.floor(inSign);
  let min = Math.round((inSign - deg) * 60);
  if (min === 60) { deg += 1; min = 0; }
  const z = ZODIAC[idx % 12];
  return { sign: z.name, symbol: z.symbol, deg, min };
}

/**
 * The UTC instant for a wall-clock time in US Eastern on the calendar date
 * carried by `date` (year/month/day are read from the Date as given). The
 * conversion uses the zone database rules for America/New_York rather than a
 * hand-written DST rule, so changeover nights and any future rule changes are
 * handled correctly. During the fall-back hour the first occurrence is used;
 * in the spring-forward gap the first real time after the jump is used.
 */
export function getEasternDateAtTime(date: Date, hour: number, minute = 0): Date {
  const parts = { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), hour, minute, second: 0 };
  const conv = localToUtc('America/New_York', parts, 'earlier');
  if (conv.resolved) return conv.resolved.utc;
  if (conv.status === 'nonexistent' && conv.suggestedLocal) {
    const again = localToUtc('America/New_York', conv.suggestedLocal, 'earlier');
    if (again.resolved) return again.resolved.utc;
  }
  // Unreachable with a valid zone id; keep a deterministic fallback anyway.
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day, hour + 5, minute, 0));
}

/**
 * Returns a Date for 12:00 AM US Eastern Time on the given calendar date.
 */
export function getEasternMidnightDate(date: Date): Date {
  return getEasternDateAtTime(date, 0, 0);
}

export interface SkyEntry {
  key: string;
  label: string;
  symbol: string;
  sign: string;
  signSymbol: string;
  degree: number;
  minutes: number;
  retrograde: boolean;
}

export function buildSkyEntries(date: Date): SkyEntry[] {
  const target = getEasternMidnightDate(date);
  return buildSkyEntriesAt(target);
}

/**
 * Real-time (live) sky positions at the exact Date passed in.
 * Includes Chiron and the True North Node in addition to the ten planets.
 */
export function buildSkyEntriesAt(target: Date): SkyEntry[] {
  const extended: { key: string; label: string; symbol: string; body: Astronomy.Body | "Moon" | "Chiron" | "NorthNode" }[] = [
    ...PLANETS,
    { key: "chiron", label: "Chiron", symbol: "⚷", body: "Chiron" },
    { key: "northNode", label: "N. Node", symbol: "☊", body: "NorthNode" },
  ];
  return extended.map(p => {
    let sign: string;
    let deg: number;
    let min: number;
    let signSymbol: string;
    let retro = false;
    if (p.body === "Chiron") {
      const c = getDetailedChironPosition(target);
      sign = c.sign; deg = c.degree; min = c.minutes; retro = !!c.isRetrograde;
      signSymbol = ZODIAC.find(z => z.name === sign)?.symbol || "";
    } else if (p.body === "NorthNode") {
      const n = getDetailedNodePosition(target);
      sign = n.sign; deg = n.degree; min = n.minutes; retro = true;
      signSymbol = ZODIAC.find(z => z.name === sign)?.symbol || "";
    } else {
      const lon = longitudeOf(p.body as Astronomy.Body | "Moon", target);
      const pos = fmtPos(lon);
      sign = pos.sign; deg = pos.deg; min = pos.min; signSymbol = pos.symbol;
      retro = isRetro(p.body as Astronomy.Body | "Moon", target);
    }
    return {
      key: p.key,
      label: p.label,
      symbol: p.symbol,
      sign,
      signSymbol,
      degree: deg,
      minutes: min,
      retrograde: retro,
    };
  });
}

function normalize360(x: number): number { return ((x % 360) + 360) % 360; }

export function formatSkyBlockForEmail(date: Date): string {
  const midnightET = getEasternMidnightDate(date);
  const noonET = getEasternDateAtTime(date, 12, 0);
  const endOfDayET = getEasternDateAtTime(date, 23, 59);
  const entries = buildSkyEntries(date);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(midnightET);
  const formatET = (value: Date) => value.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit",
  });
  const formatMoonPoint = (value: Date) => {
    const pos = fmtPos(longitudeOf("Moon", value));
    return `${pos.deg}°${String(pos.min).padStart(2, "0")}' ${pos.symbol} ${pos.sign}`;
  };
  const dayEnd = new Date(endOfDayET.getTime());
  const nextChange = findNextMoonSignChange(midnightET);
  const signChangeLine = nextChange.time <= dayEnd
    ? `Sign change: ${formatET(nextChange.time)} ET, enters ${fmtPos(longitudeOf("Moon", nextChange.time)).symbol} ${nextChange.newSign}`
    : `Sign change: none today`;
  const lines = entries.map(e =>
    `${e.symbol} ${e.label.padEnd(8)} ${e.degree}°${String(e.minutes).padStart(2, "0")}' ${e.signSymbol} ${e.sign}${e.retrograde ? " ℞" : ""}`,
  );
  return [
    `Sky at 12:00 AM Eastern, ${dateLabel}`,
    ``,
    ...lines,
    ``,
    `☽ Through the day`,
    `12:00 AM ET: ${formatMoonPoint(midnightET)}`,
    signChangeLine,
    `12:00 PM ET: ${formatMoonPoint(noonET)}`,
    `11:59 PM ET: ${formatMoonPoint(endOfDayET)}`,
  ].join("\n");
}
