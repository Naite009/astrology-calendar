// New Moon cycle engine: deterministic lunation data (astronomy-engine only),
// sky contacts to the lunation degree, natal overlay (house + aspects), and
// cross-cycle pattern detection for the Moon Cycle "Patterns" view.

import * as Astronomy from "astronomy-engine";
import type { NatalChart } from "@/hooks/useNatalChart";
import { getPlanetaryPositions } from "@/lib/astrology";
import { houseForLongitude, toAbsoluteLongitude } from "@/lib/houseForLongitude";

export const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export const SIGN_GLYPHS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋", Leo: "♌", Virgo: "♍",
  Libra: "♎", Scorpio: "♏", Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓",
};

export const SKY_BODIES = [
  "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
] as const;

export const NATAL_BODIES = [
  "Sun", "Moon", "Ascendant", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron", "NorthNode",
] as const;

export interface AspectDef {
  name: string;
  angle: number;
  orb: number;
  symbol: string;
  tone: string;
  hard: boolean;
}

export const ASPECT_DEFS: AspectDef[] = [
  { name: "conjunction", angle: 0, orb: 6, symbol: "☌", tone: "fuses with", hard: true },
  { name: "opposition", angle: 180, orb: 6, symbol: "☍", tone: "pulls against", hard: true },
  { name: "square", angle: 90, orb: 5, symbol: "□", tone: "pressures", hard: true },
  { name: "trine", angle: 120, orb: 5, symbol: "△", tone: "supports", hard: false },
  { name: "sextile", angle: 60, orb: 4, symbol: "⚹", tone: "opens a door for", hard: false },
];

export const PLANET_WEATHER: Record<string, string> = {
  Mercury: "conversations, plans, paperwork and how clearly you can say what you mean",
  Venus: "money, comfort, affection and what you are willing to accept",
  Mars: "energy, conflict, pace and how hard you push",
  Jupiter: "opportunity, appetite, over-committing and where you want more",
  Saturn: "limits, responsibility, delays and what has to be done properly",
  Uranus: "sudden changes of plan and the urge to break routine",
  Neptune: "fog, tiredness, imagination and blurred boundaries",
  Pluto: "control, power moves and things you cannot un-see",
};

export const HOUSE_ARENA: Record<number, string> = {
  1: "your body, your look and how you start things",
  2: "money you earn, what you own and what you value",
  3: "talking, writing, siblings, short trips and daily information",
  4: "home, family, the past and where you rest",
  5: "creating, romance, play and children",
  6: "work routine, health habits and daily maintenance",
  7: "one-to-one relationships, partners and contracts",
  8: "shared money, debt, intimacy and what you rarely say out loud",
  9: "travel, study, beliefs and the bigger picture",
  10: "career, reputation and the people who judge your results",
  11: "friends, groups, networks and long-range hopes",
  12: "rest, privacy, endings and the things you notice before you can explain them",
};

export interface LunationPoint {
  date: Date;
  sign: string;
  degree: number;
  lon: number;
}

export interface SkyContact {
  planet: string;
  symbol: string;
  aspect: string;
  tone: string;
  sign: string;
  orb: number;
  hard: boolean;
}

export interface NatalContact {
  planet: string;
  symbol: string;
  aspect: string;
  sign: string;
  house: number | null;
  orb: number;
  hard: boolean;
}

export interface SignConcentration {
  sign: string;
  bodies: string[];
}

export interface NewMoonCycle extends LunationPoint {
  nextNewMoon: Date;
  firstQuarter: LunationPoint | null;
  fullMoon: LunationPoint | null;
  lastQuarter: LunationPoint | null;
  skyContacts: SkyContact[];
  concentrations: SignConcentration[];
  natalHouse: number | null;
  natalContacts: NatalContact[];
}

const norm = (lon: number) => ((lon % 360) + 360) % 360;

export function signOfLongitude(lon: number) {
  const l = norm(lon);
  return { sign: ZODIAC_SIGNS[Math.floor(l / 30)] as string, degree: Math.floor(l % 30) };
}

function moonLongitude(date: Date): number {
  return norm(Astronomy.Ecliptic(Astronomy.GeoVector(Astronomy.Body.Moon, date, false)).elon);
}

function absFromPosition(pos: { signName?: string; rawDegree?: number }): number | null {
  const idx = ZODIAC_SIGNS.indexOf((pos.signName || "") as any);
  if (idx < 0) return null;
  return idx * 30 + (pos.rawDegree || 0);
}

function separation(a: number, b: number): number {
  let d = Math.abs(norm(a) - norm(b)) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function matchAspect(sep: number): { def: AspectDef; orb: number } | null {
  for (const def of ASPECT_DEFS) {
    const orb = Math.abs(sep - def.angle);
    if (orb <= def.orb) return { def, orb: Math.round(orb * 10) / 10 };
  }
  return null;
}

function toPoint(date: Date): LunationPoint {
  const lon = moonLongitude(date);
  const { sign, degree } = signOfLongitude(lon);
  return { date, sign, degree, lon };
}

/** All New Moons whose local date falls inside the given calendar year. */
export function getNewMoonsForYear(year: number): LunationPoint[] {
  const out: LunationPoint[] = [];
  let search = new Date(Date.UTC(year - 1, 11, 20));
  for (let i = 0; i < 16; i++) {
    const found = Astronomy.SearchMoonPhase(0, search, 40)?.date;
    if (!found) break;
    if (found.getFullYear() === year) out.push(toPoint(found));
    if (found.getFullYear() > year) break;
    search = new Date(found.getTime() + 2 * 864e5);
  }
  return out;
}

/** The New Moon that opened the cycle containing `when`. */
export function getCurrentNewMoon(when: Date = new Date()): Date {
  return (
    Astronomy.SearchMoonPhase(0, when, -32)?.date ||
    new Date(when.getTime() - 29.5 * 864e5)
  );
}

export function getSkyContacts(date: Date, lon: number): SkyContact[] {
  const positions = getPlanetaryPositions(date) as any;
  const contacts: SkyContact[] = [];
  for (const name of SKY_BODIES) {
    const pos = positions[name.toLowerCase()];
    if (!pos) continue;
    const abs = absFromPosition(pos);
    if (abs == null) continue;
    const hit = matchAspect(separation(abs, lon));
    if (!hit) continue;
    contacts.push({
      planet: name,
      symbol: hit.def.symbol,
      aspect: hit.def.name,
      tone: hit.def.tone,
      sign: pos.signName,
      orb: hit.orb,
      hard: hit.def.hard,
    });
  }
  return contacts.sort((a, b) => a.orb - b.orb);
}

/** Sign groupings of 3 or more bodies in the sky (never labeled a stellium). */
export function getSignConcentrations(date: Date): SignConcentration[] {
  const positions = getPlanetaryPositions(date) as any;
  const map: Record<string, string[]> = {};
  for (const name of ["Sun", "Moon", ...SKY_BODIES]) {
    const pos = positions[name.toLowerCase()];
    if (!pos?.signName) continue;
    (map[pos.signName] ||= []).push(name);
  }
  return Object.entries(map)
    .filter(([, bodies]) => bodies.length >= 3)
    .map(([sign, bodies]) => ({ sign, bodies }))
    .sort((a, b) => b.bodies.length - a.bodies.length);
}

export function getNatalContacts(chart: NatalChart | null | undefined, lon: number): NatalContact[] {
  if (!chart?.planets) return [];
  const out: NatalContact[] = [];
  for (const name of NATAL_BODIES) {
    const p = (chart.planets as any)[name];
    if (!p?.sign) continue;
    const abs = toAbsoluteLongitude(p);
    if (abs == null) continue;
    const hit = matchAspect(separation(abs, lon));
    if (!hit) continue;
    out.push({
      planet: name === "NorthNode" ? "North Node" : name,
      symbol: hit.def.symbol,
      aspect: hit.def.name,
      sign: p.sign,
      house: p.house ?? houseForLongitude(chart, abs),
      orb: hit.orb,
      hard: hit.def.hard,
    });
  }
  return out.sort((a, b) => a.orb - b.orb);
}

export function buildNewMoonCycle(
  newMoonDate: Date,
  chart?: NatalChart | null,
): NewMoonCycle {
  const base = toPoint(newMoonDate);
  const next =
    Astronomy.SearchMoonPhase(0, new Date(newMoonDate.getTime() + 2 * 864e5), 40)?.date ||
    new Date(newMoonDate.getTime() + 29.5 * 864e5);

  const phase = (target: number, limit: number): LunationPoint | null => {
    const found = Astronomy.SearchMoonPhase(target, newMoonDate, limit)?.date;
    return found ? toPoint(found) : null;
  };

  return {
    ...base,
    nextNewMoon: next,
    firstQuarter: phase(90, 15),
    fullMoon: phase(180, 20),
    lastQuarter: phase(270, 25),
    skyContacts: getSkyContacts(newMoonDate, base.lon),
    concentrations: getSignConcentrations(newMoonDate),
    natalHouse: houseForLongitude(chart, base.lon),
    natalContacts: getNatalContacts(chart, base.lon),
  };
}

export interface CycleSummary extends LunationPoint {
  natalHouse: number | null;
  tightestNatal: NatalContact | null;
  hardCount: number;
  softCount: number;
}

/** Light-weight per-lunation summary used by the calendar grid. */
export function summarizeNewMoon(point: LunationPoint, chart?: NatalChart | null): CycleSummary {
  const natal = getNatalContacts(chart, point.lon);
  return {
    ...point,
    natalHouse: houseForLongitude(chart, point.lon),
    tightestNatal: natal[0] || null,
    hardCount: natal.filter((c) => c.hard).length,
    softCount: natal.filter((c) => !c.hard).length,
  };
}

export interface CyclePattern {
  title: string;
  text: string;
}

/**
 * Patterns across a run of lunations: which of your houses keep getting
 * reset, which natal planets keep getting touched, and how the pressure
 * is distributed. Works with or without a saved journal.
 */
export function detectCyclePatterns(
  summaries: CycleSummary[],
  chart?: NatalChart | null,
): CyclePattern[] {
  const out: CyclePattern[] = [];
  if (summaries.length === 0) return out;

  const houseTally: Record<number, number> = {};
  for (const s of summaries) {
    if (s.natalHouse) houseTally[s.natalHouse] = (houseTally[s.natalHouse] || 0) + 1;
  }
  const houses = Object.entries(houseTally).sort((a, b) => b[1] - a[1]);
  if (chart && houses.length > 0) {
    const [h, count] = houses[0];
    out.push({
      title: `House ${h} keeps getting the reset`,
      text: `${count} of these ${summaries.length} New Moons land in your ${h}th house, which covers ${HOUSE_ARENA[Number(h)]}. When you look back, expect your fresh starts to cluster there rather than spread evenly.`,
    });
  }

  const planetTally: Record<string, { count: number; tightest: number }> = {};
  for (const s of summaries) {
    const c = s.tightestNatal;
    if (!c) continue;
    const rec = (planetTally[c.planet] ||= { count: 0, tightest: 99 });
    rec.count += 1;
    rec.tightest = Math.min(rec.tightest, c.orb);
  }
  const planets = Object.entries(planetTally).sort((a, b) => b[1].count - a[1].count);
  if (planets.length > 0) {
    const [planet, rec] = planets[0];
    out.push({
      title: `Your ${planet} is the part that keeps getting called`,
      text: `${planet} is the closest natal contact on ${rec.count} of these lunations, tightest at ${rec.tightest}°. That is the function that keeps being asked to restart, not a one-off month.`,
    });
  }

  const hard = summaries.reduce((n, s) => n + s.hardCount, 0);
  const soft = summaries.reduce((n, s) => n + s.softCount, 0);
  if (hard + soft > 0) {
    out.push({
      title: hard > soft ? "This stretch runs on pressure" : "This stretch runs on openings",
      text:
        hard > soft
          ? `Across these cycles there are ${hard} hard contacts (conjunction, square, opposition) against ${soft} easy ones, so most months start by forcing a decision rather than handing you an easy lane.`
          : `Across these cycles there are ${soft} easy contacts (trine, sextile) against ${hard} hard ones, so most months open a door and wait for you to walk through it instead of shoving you.`,
    });
  }

  const emptyHouses = chart
    ? Array.from({ length: 12 }, (_, i) => i + 1).filter((h) => !houseTally[h])
    : [];
  if (chart && emptyHouses.length > 0 && emptyHouses.length <= 9) {
    out.push({
      title: "Nothing restarts here in this window",
      text: `No New Moon in this range falls in house${emptyHouses.length > 1 ? "s" : ""} ${emptyHouses.join(", ")}. Those areas stay on their existing track for now, so do not wait for a lunar push there.`,
    });
  }

  return out;
}
