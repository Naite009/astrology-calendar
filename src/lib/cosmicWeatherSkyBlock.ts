/**
 * Deterministic "Sky right now" block for the Cosmic Weather email.
 * Computed at 12:00 AM Eastern Time on the chosen date using astronomy-engine.
 * NO AI involved — pure ephemeris math.
 */

import * as Astronomy from "astronomy-engine";

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
 * Returns a Date for 12:00 AM US Eastern Time on the given calendar date.
 * Eastern is UTC-5 (EST) or UTC-4 (EDT). We use the standard JS DST rule
 * for America/New_York (2nd Sun of March → 1st Sun of November).
 */
export function getEasternMidnightDate(date: Date): Date {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();

  // DST: starts 2nd Sunday of March, ends 1st Sunday of November.
  const secondSundayMarch = (() => {
    const first = new Date(Date.UTC(y, 2, 1));
    const dow = first.getUTCDay();
    const firstSun = 1 + ((7 - dow) % 7);
    return firstSun + 7;
  })();
  const firstSundayNov = (() => {
    const first = new Date(Date.UTC(y, 10, 1));
    const dow = first.getUTCDay();
    return 1 + ((7 - dow) % 7);
  })();

  let isDST = false;
  if (m > 2 && m < 10) isDST = true;
  else if (m === 2 && d >= secondSundayMarch) isDST = true;
  else if (m === 10 && d < firstSundayNov) isDST = true;

  const offsetHours = isDST ? 4 : 5; // EDT or EST
  // 12:00 AM Eastern → that hour in UTC is +offset
  return new Date(Date.UTC(y, m, d, offsetHours, 0, 0));
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
  return PLANETS.map(p => {
    const lon = longitudeOf(p.body, target);
    const pos = fmtPos(lon);
    const r = isRetro(p.body, target);
    return {
      key: p.key,
      label: p.label,
      symbol: p.symbol,
      sign: pos.sign,
      signSymbol: pos.symbol,
      degree: pos.deg,
      minutes: pos.min,
      retrograde: r,
    };
  });
}

export function formatSkyBlockForEmail(date: Date): string {
  const entries = buildSkyEntries(date);
  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
  const lines = entries.map(e =>
    `${e.symbol} ${e.label.padEnd(8)} ${e.degree}°${String(e.minutes).padStart(2, "0")}' ${e.signSymbol} ${e.sign}${e.retrograde ? " ℞" : ""}`,
  );
  return [
    `Sky at 12:00 AM Eastern, ${dateLabel}`,
    ``,
    ...lines,
  ].join("\n");
}
