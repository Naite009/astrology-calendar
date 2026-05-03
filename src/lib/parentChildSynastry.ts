/**
 * Parent ↔ Child Synastry (deterministic, directional)
 *
 * Computes a curated set of cross-chart aspects from a FROM chart (e.g. parent)
 * to a TO chart (e.g. child) and joins each one to a hand-authored
 * interpretation in `parentChildInterpretations.ts`.
 *
 * Direction matters absolutely: "Parent Mars → Child Moon" is a different
 * interpretation than "Child Mars → Parent Moon".
 */

import { NatalChart, NatalPlanetPosition } from "@/hooks/useNatalChart";
import { getEffectiveOrb } from "./aspectOrbs";
import {
  PARENT_CHILD_INTERPRETATIONS,
  ParentChildInterpretation,
} from "@/data/parentChildInterpretations";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export type FamilyRole = "parent" | "child" | "grandparent" | "sibling";

export interface FamilyAspectRow {
  fromPlanet: string;
  toPlanet: string;
  /** `conjunction | opposition | trine | square | sextile` */
  aspect: string;
  orb: number;
  symbol: string;
  framingKey: string; // e.g. "sun-moon"
  /** Interpretation tailored to FROM=parent / TO=child orientation. */
  interpretation: ParentChildInterpretation | null;
}

export interface FamilySynastryReport {
  fromName: string;
  toName: string;
  fromRole: FamilyRole;
  toRole: FamilyRole;
  rows: FamilyAspectRow[];
  /** Quick essence summary: top 3 tightest rows, formatted for headline use. */
  essenceLines: string[];
}

interface CuratedPair {
  from: string;
  to: string;
  framingKey: string;
}

/**
 * Curated cross-aspect rows, FROM → TO. Keep the list focused — these are the
 * aspects that meaningfully describe how the FROM person's energy lands on the
 * TO person's nervous system.
 */
const PARENT_TO_CHILD_PAIRS: CuratedPair[] = [
  { from: "Sun", to: "Moon", framingKey: "sun-moon" },
  { from: "Sun", to: "Sun", framingKey: "sun-sun" },
  { from: "Moon", to: "Sun", framingKey: "moon-sun" },
  { from: "Moon", to: "Moon", framingKey: "moon-moon" },
  { from: "Ascendant", to: "Sun", framingKey: "asc-sun" },
  { from: "Mars", to: "Moon", framingKey: "mars-moon" },
  { from: "Mercury", to: "Moon", framingKey: "mercury-moon" },
  { from: "Saturn", to: "Sun", framingKey: "saturn-sun" },
  { from: "Saturn", to: "Moon", framingKey: "saturn-moon" },
  { from: "Moon", to: "Venus", framingKey: "moon-venus" },
  { from: "Venus", to: "Moon", framingKey: "venus-moon" },
  { from: "Jupiter", to: "Sun", framingKey: "jupiter-sun" },
  { from: "Pluto", to: "Sun", framingKey: "pluto-sun" },
  { from: "Pluto", to: "Moon", framingKey: "pluto-moon" },
  { from: "Neptune", to: "Sun", framingKey: "neptune-sun" },
  { from: "Neptune", to: "Moon", framingKey: "neptune-moon" },
  { from: "Chiron", to: "Sun", framingKey: "chiron-sun" },
  { from: "Chiron", to: "Moon", framingKey: "chiron-moon" },
  { from: "NorthNode", to: "Sun", framingKey: "node-sun" },
  { from: "NorthNode", to: "Moon", framingKey: "node-moon" },
];

/** Sibling-specific pair set — drops Saturn-authority, adds Mercury↔Mercury. */
const SIBLING_PAIRS: CuratedPair[] = [
  { from: "Sun", to: "Sun", framingKey: "sun-sun" },
  { from: "Moon", to: "Moon", framingKey: "moon-moon" },
  { from: "Mercury", to: "Mercury", framingKey: "mercury-mercury" },
  { from: "Sun", to: "Moon", framingKey: "sun-moon" },
  { from: "Moon", to: "Sun", framingKey: "moon-sun" },
  { from: "Mars", to: "Moon", framingKey: "mars-moon" },
  { from: "Venus", to: "Moon", framingKey: "venus-moon" },
  { from: "Mercury", to: "Moon", framingKey: "mercury-moon" },
  { from: "Jupiter", to: "Sun", framingKey: "jupiter-sun" },
  { from: "Chiron", to: "Moon", framingKey: "chiron-moon" },
];

const ASPECTS = [
  { name: "conjunction", angle: 0, symbol: "☌" },
  { name: "opposition", angle: 180, symbol: "☍" },
  { name: "trine", angle: 120, symbol: "△" },
  { name: "square", angle: 90, symbol: "□" },
  { name: "sextile", angle: 60, symbol: "⚹" },
] as const;

function toAbsoluteDegree(p?: NatalPlanetPosition): number | null {
  if (!p || !p.sign) return null;
  const idx = ZODIAC_SIGNS.indexOf(p.sign);
  if (idx < 0) return null;
  return idx * 30 + (p.degree ?? 0) + (p.minutes ?? 0) / 60;
}

function bestAspect(deg1: number, deg2: number, p1: string, p2: string) {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  for (const a of ASPECTS) {
    const orb = Math.abs(diff - a.angle);
    const allowed = getEffectiveOrb(p1, p2, a.name);
    if (orb <= allowed) {
      return { name: a.name, symbol: a.symbol, orb };
    }
  }
  return null;
}

function pairsForRoles(fromRole: FamilyRole, toRole: FamilyRole): CuratedPair[] {
  if (fromRole === "sibling" || toRole === "sibling") return SIBLING_PAIRS;
  return PARENT_TO_CHILD_PAIRS;
}

export function computeFamilySynastry(
  fromChart: NatalChart,
  toChart: NatalChart,
  fromRole: FamilyRole,
  toRole: FamilyRole,
): FamilySynastryReport {
  const pairs = pairsForRoles(fromRole, toRole);
  const rows: FamilyAspectRow[] = [];

  for (const pair of pairs) {
    const fromPos = (fromChart.planets as Record<string, NatalPlanetPosition | undefined>)[pair.from];
    const toPos = (toChart.planets as Record<string, NatalPlanetPosition | undefined>)[pair.to];
    const d1 = toAbsoluteDegree(fromPos);
    const d2 = toAbsoluteDegree(toPos);
    if (d1 == null || d2 == null) continue;
    const asp = bestAspect(d1, d2, pair.from, pair.to);
    if (!asp) continue;
    const interp = PARENT_CHILD_INTERPRETATIONS[pair.framingKey]?.[asp.name] ?? null;
    rows.push({
      fromPlanet: pair.from,
      toPlanet: pair.to,
      aspect: asp.name,
      orb: asp.orb,
      symbol: asp.symbol,
      framingKey: pair.framingKey,
      interpretation: interp,
    });
  }

  rows.sort((a, b) => a.orb - b.orb);

  const essenceLines = rows
    .slice(0, 3)
    .map(r => {
      const verb = r.interpretation?.essenceVerb ?? "shapes";
      return `${fromChart.name}'s ${r.fromPlanet} ${verb} ${toChart.name}'s ${r.toPlanet}.`;
    });

  return {
    fromName: fromChart.name,
    toName: toChart.name,
    fromRole,
    toRole,
    rows,
    essenceLines,
  };
}

export const FAMILY_ROLE_OPTIONS: { value: FamilyRole; label: string }[] = [
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "grandparent", label: "Grandparent" },
  { value: "sibling", label: "Sibling" },
];

// ─────────────────────────────────────────────────────────────────────────────
// AI Pair Reading payload builder
// ─────────────────────────────────────────────────────────────────────────────

export interface PairReadingSection {
  heading: string;
  badge: string;
  howItLands: string;
  blindSpot: string;
  whatHelps: string[];
}

export interface PairReadingResponse {
  essence: string[];
  ageNote: string;
  sections: PairReadingSection[];
  practice: string;
  ageYears: number | null;
  aspectsUsed: number;
  error?: string;
}

interface CrossAspectPayload {
  fromPlanet: string;
  fromSign?: string;
  fromHouse?: number | null;
  fromRetro?: boolean;
  toPlanet: string;
  toSign?: string;
  toHouse?: number | null;
  toRetro?: boolean;
  aspect: string;
  symbol: string;
  orb: number;
}

function buildHouseCalc(chart: NatalChart): ((abs: number) => number | null) | null {
  const cusps = chart.houseCusps;
  if (!cusps) return null;
  const longs: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = cusps[`house${i}` as keyof typeof cusps] as { sign?: string; degree?: number; minutes?: number } | undefined;
    if (!c?.sign) return null;
    const idx = ZODIAC_SIGNS.indexOf(c.sign);
    if (idx < 0) return null;
    longs.push(idx * 30 + (c.degree ?? 0) + (c.minutes ?? 0) / 60);
  }
  return (abs: number) => {
    for (let i = 0; i < 12; i++) {
      const next = (i + 1) % 12;
      let s = longs[i];
      let e = longs[next];
      if (e < s) e += 360;
      let d = abs;
      if (d < s) d += 360;
      if (d >= s && d < e) return i + 1;
    }
    return 1;
  };
}

function planetSummary(chart: NatalChart): string {
  const calcHouse = buildHouseCalc(chart);
  const lines: string[] = [];
  const order = ["Sun", "Moon", "Ascendant", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "NorthNode", "Chiron"];
  for (const name of order) {
    const p = (chart.planets as Record<string, { sign?: string; degree?: number; minutes?: number; isRetrograde?: boolean } | undefined>)[name];
    if (!p?.sign) continue;
    const abs = ZODIAC_SIGNS.indexOf(p.sign) * 30 + (p.degree ?? 0) + (p.minutes ?? 0) / 60;
    const h = calcHouse ? calcHouse(abs) : null;
    const houseStr = h ? ` (House ${h})` : "";
    const r = p.isRetrograde ? " R" : "";
    lines.push(`- ${name}: ${p.sign} ${p.degree ?? 0}°${houseStr}${r}`);
  }
  return lines.join("\n");
}

export function buildPairReadingPayload(
  fromChart: NatalChart,
  toChart: NatalChart,
  fromRole: FamilyRole,
  toRole: FamilyRole,
  report: FamilySynastryReport,
) {
  const fromCalc = buildHouseCalc(fromChart);
  const toCalc = buildHouseCalc(toChart);
  const fromPlanets = fromChart.planets as Record<string, { sign?: string; degree?: number; minutes?: number; isRetrograde?: boolean } | undefined>;
  const toPlanets = toChart.planets as Record<string, { sign?: string; degree?: number; minutes?: number; isRetrograde?: boolean } | undefined>;

  const aspects: CrossAspectPayload[] = report.rows.slice(0, 8).map((r) => {
    const fp = fromPlanets[r.fromPlanet];
    const tp = toPlanets[r.toPlanet];
    const fromAbs = fp?.sign ? ZODIAC_SIGNS.indexOf(fp.sign) * 30 + (fp.degree ?? 0) + (fp.minutes ?? 0) / 60 : null;
    const toAbs = tp?.sign ? ZODIAC_SIGNS.indexOf(tp.sign) * 30 + (tp.degree ?? 0) + (tp.minutes ?? 0) / 60 : null;
    return {
      fromPlanet: r.fromPlanet,
      fromSign: fp?.sign,
      fromHouse: fromAbs != null && fromCalc ? fromCalc(fromAbs) : null,
      fromRetro: !!fp?.isRetrograde,
      toPlanet: r.toPlanet,
      toSign: tp?.sign,
      toHouse: toAbs != null && toCalc ? toCalc(toAbs) : null,
      toRetro: !!tp?.isRetrograde,
      aspect: r.aspect,
      symbol: r.symbol,
      orb: r.orb,
    };
  });

  return {
    fromName: fromChart.name,
    fromRole,
    fromPlanetsSummary: planetSummary(fromChart),
    toName: toChart.name,
    toRole,
    toPlanetsSummary: planetSummary(toChart),
    toBirthDate: fromChart.birthDate, // not used; per-chart below
    aspects,
  };
}

