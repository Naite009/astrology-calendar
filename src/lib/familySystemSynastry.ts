/**
 * Family System Synastry — group-level (not pair-level) deterministic analysis.
 *
 * Takes 2+ family member charts and computes the data the AI needs to write a
 * single integrated reading about how the whole group functions as a system.
 */

import { NatalChart, NatalPlanetPosition } from "@/hooks/useNatalChart";
import { getEffectiveOrb } from "./aspectOrbs";
import { FamilyRole } from "./parentChildSynastry";
import {
  moonPhaseAtBirth,
  sectOfChart,
  rulershipChain,
  retrogradeFlags,
  currentProfectedHouse,
  parentActivationMap,
  crossChartTSquares,
  householdComposite,
} from "./familyAstrology";

const ZODIAC_SIGNS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const FIRE = new Set(["Aries", "Leo", "Sagittarius"]);
const EARTH = new Set(["Taurus", "Virgo", "Capricorn"]);
const AIR = new Set(["Gemini", "Libra", "Aquarius"]);
const WATER = new Set(["Cancer", "Scorpio", "Pisces"]);

function elementOf(sign?: string): "fire" | "earth" | "air" | "water" | null {
  if (!sign) return null;
  if (FIRE.has(sign)) return "fire";
  if (EARTH.has(sign)) return "earth";
  if (AIR.has(sign)) return "air";
  if (WATER.has(sign)) return "water";
  return null;
}

const ASPECTS = [
  { name: "conjunction", angle: 0, symbol: "☌" },
  { name: "opposition", angle: 180, symbol: "☍" },
  { name: "trine", angle: 120, symbol: "△" },
  { name: "square", angle: 90, symbol: "□" },
  { name: "sextile", angle: 60, symbol: "⚹" },
] as const;

function toAbs(p?: NatalPlanetPosition): number | null {
  if (!p?.sign) return null;
  const idx = ZODIAC_SIGNS.indexOf(p.sign);
  if (idx < 0) return null;
  return idx * 30 + (p.degree ?? 0) + (p.minutes ?? 0) / 60;
}

function bestAspect(d1: number, d2: number, p1: string, p2: string) {
  let diff = Math.abs(d1 - d2);
  if (diff > 180) diff = 360 - diff;
  for (const a of ASPECTS) {
    const orb = Math.abs(diff - a.angle);
    const allowed = getEffectiveOrb(p1, p2, a.name);
    if (orb <= allowed) return { name: a.name, symbol: a.symbol, orb };
  }
  return null;
}

export interface FamilyMemberInput {
  chart: NatalChart;
  role: FamilyRole;
}

export interface MemberRoleAssignment {
  name: string;
  role: FamilyRole;
  systemRole: string; // "anchor", "spark", "regulator", etc.
  reason: string; // 1 short line on why
}

export interface SharedPlacement {
  planet: string;
  sign: string;
  members: string[]; // names
}

export interface CrossAspectInfo {
  fromName: string;
  fromPlanet: string;
  fromSign?: string;
  toName: string;
  toPlanet: string;
  toSign?: string;
  aspect: string;
  symbol: string;
  orb: number;
}

export interface FamilySystemData {
  memberSummaries: string[]; // one block per member, planets list
  moonElements: { fire: number; earth: number; air: number; water: number };
  dominantMoonElement: "fire" | "earth" | "air" | "water" | null;
  sunElements: { fire: number; earth: number; air: number; water: number };
  sharedPlacements: SharedPlacement[]; // 2+ members share the same planet sign
  roles: MemberRoleAssignment[];
  topFriction: CrossAspectInfo[];
  topBridges: CrossAspectInfo[];
  memberCount: number;
}

const TRACKED_PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const ROLE_PRIORITY = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

function planetSummary(chart: NatalChart): string {
  const lines: string[] = [];
  const planets = chart.planets as Record<string, NatalPlanetPosition | undefined>;
  for (const name of ROLE_PRIORITY) {
    const p = planets[name];
    if (!p?.sign) continue;
    const r = p.isRetrograde ? " R" : "";
    lines.push(`  - ${name}: ${p.sign} ${p.degree ?? 0}°${r}`);
  }
  return lines.join("\n");
}

function assignRole(
  member: FamilyMemberInput,
  allMembers: FamilyMemberInput[],
): MemberRoleAssignment {
  const planets = member.chart.planets as Record<string, NatalPlanetPosition | undefined>;
  const moon = planets.Moon;
  const sun = planets.Sun;
  const saturn = planets.Saturn;
  const moonEl = elementOf(moon?.sign);

  // Count fire/water across personal planets to detect spark vs feeler
  let fireCount = 0;
  let waterCount = 0;
  let earthCount = 0;
  let airCount = 0;
  for (const pname of TRACKED_PLANETS) {
    const el = elementOf(planets[pname]?.sign);
    if (el === "fire") fireCount++;
    else if (el === "water") waterCount++;
    else if (el === "earth") earthCount++;
    else if (el === "air") airCount++;
  }

  // Heaviest Capricorn/Saturn-in-Capricorn or strong earth = anchor
  if (saturn?.sign === "Capricorn" || elementOf(saturn?.sign) === "earth" && earthCount >= 3) {
    return {
      name: member.chart.name,
      role: member.role,
      systemRole: "the anchor",
      reason: "holds structure when things get unsteady",
    };
  }

  if (fireCount >= 4) {
    return {
      name: member.chart.name,
      role: member.role,
      systemRole: "the spark",
      reason: "starts the energy in the room, fast and direct",
    };
  }

  if (waterCount >= 4 || moonEl === "water") {
    return {
      name: member.chart.name,
      role: member.role,
      systemRole: "the feeler",
      reason: "tracks the emotional weather of the whole household",
    };
  }

  if (moon?.sign === "Libra" || moon?.sign === "Pisces") {
    return {
      name: member.chart.name,
      role: member.role,
      systemRole: "the peacemaker",
      reason: "smooths friction, sometimes at their own expense",
    };
  }

  if (moon?.sign === "Sagittarius" || moon?.sign === "Aquarius" || moon?.sign === "Aries") {
    return {
      name: member.chart.name,
      role: member.role,
      systemRole: "the truth-teller",
      reason: "says the thing nobody else will say",
    };
  }

  if (airCount >= 4) {
    return {
      name: member.chart.name,
      role: member.role,
      systemRole: "the translator",
      reason: "puts feelings into words the rest can hear",
    };
  }

  if (earthCount >= 3) {
    return {
      name: member.chart.name,
      role: member.role,
      systemRole: "the steadier",
      reason: "the practical one who keeps the day moving",
    };
  }

  return {
    name: member.chart.name,
    role: member.role,
    systemRole: "the wildcard",
    reason: "their pattern does not fit the household norm",
  };
}

export function buildFamilySystem(members: FamilyMemberInput[]): FamilySystemData | null {
  if (members.length < 2) return null;

  // Member summaries
  const memberSummaries = members.map((m) => {
    return `${m.chart.name} (${m.role}):\n${planetSummary(m.chart)}`;
  });

  // Moon and Sun element tallies
  const moonElements = { fire: 0, earth: 0, air: 0, water: 0 };
  const sunElements = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    const me = elementOf(planets.Moon?.sign);
    const se = elementOf(planets.Sun?.sign);
    if (me) moonElements[me]++;
    if (se) sunElements[se]++;
  }
  const dominantMoonElement = (Object.entries(moonElements).sort((a, b) => b[1] - a[1])[0]?.[1] ?? 0) > 0
    ? (Object.entries(moonElements).sort((a, b) => b[1] - a[1])[0][0] as "fire" | "earth" | "air" | "water")
    : null;

  // Shared placements (2+ members with same planet in same sign)
  const placementMap = new Map<string, string[]>();
  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    for (const pname of TRACKED_PLANETS) {
      const sign = planets[pname]?.sign;
      if (!sign) continue;
      const key = `${pname}|${sign}`;
      if (!placementMap.has(key)) placementMap.set(key, []);
      placementMap.get(key)!.push(m.chart.name);
    }
  }
  const sharedPlacements: SharedPlacement[] = [];
  for (const [key, names] of placementMap.entries()) {
    if (names.length >= 2) {
      const [planet, sign] = key.split("|");
      sharedPlacements.push({ planet, sign, members: names });
    }
  }

  // Roles
  const roles = members.map((m) => assignRole(m, members));

  // All pairwise cross-aspects (curated planet set: Sun, Moon, Mercury, Venus, Mars, Saturn, Chiron)
  const ASPECT_PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Saturn", "Chiron"];
  const allAspects: CrossAspectInfo[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];
      const pa = a.chart.planets as Record<string, NatalPlanetPosition | undefined>;
      const pb = b.chart.planets as Record<string, NatalPlanetPosition | undefined>;
      for (const p1 of ASPECT_PLANETS) {
        for (const p2 of ASPECT_PLANETS) {
          const d1 = toAbs(pa[p1]);
          const d2 = toAbs(pb[p2]);
          if (d1 == null || d2 == null) continue;
          const asp = bestAspect(d1, d2, p1, p2);
          if (!asp) continue;
          // Only score luminary-touching or Mars/Saturn for tension; skip pure non-luminary trines
          const touchesCore =
            p1 === "Sun" || p1 === "Moon" || p2 === "Sun" || p2 === "Moon";
          if (!touchesCore && asp.name !== "conjunction") continue;
          allAspects.push({
            fromName: a.chart.name,
            fromPlanet: p1,
            fromSign: pa[p1]?.sign,
            toName: b.chart.name,
            toPlanet: p2,
            toSign: pb[p2]?.sign,
            aspect: asp.name,
            symbol: asp.symbol,
            orb: asp.orb,
          });
        }
      }
    }
  }

  const friction = allAspects
    .filter((a) => a.aspect === "square" || a.aspect === "opposition")
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 4);
  const bridges = allAspects
    .filter((a) => a.aspect === "trine" || a.aspect === "sextile" || a.aspect === "conjunction")
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 4);

  return {
    memberSummaries,
    moonElements,
    dominantMoonElement,
    sunElements,
    sharedPlacements,
    roles,
    topFriction: friction,
    topBridges: bridges,
    memberCount: members.length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI payload + response types
// ─────────────────────────────────────────────────────────────────────────────

/** Composite tone block — shared line + per-person behavioral translation. */
export interface PairCompositeBlock {
  shared: string;                      // tone of the pair composite, 1 sentence, no advice
  feelsLikeForA: string | null;        // how Person A (parent or older sibling) experiences it, behavioral
  feelsLikeForB: string | null;        // how Person B (child or younger sibling) experiences it, behavioral
}

/** Aspect block — cited synastry aspect + per-person behavioral translation. */
export interface PairAspectBlock {
  aspect: string;                      // cited synastry aspect (planet–planet + orb)
  forA: string | null;                 // what Person A does/initiates/feels (range-based)
  forB: string | null;                 // what Person B does/feels in response (range-based)
}

/** Always-on real-life interaction pattern, sourced from individual charts (NOT a synastry aspect). */
export interface InteractionPatternBlock {
  forA: string;     // how Person A approaches Person B day to day, behavioral, range-based
  forB: string;     // how Person B experiences Person A day to day, behavioral, range-based
  why: string;      // one sentence naming the individual placements that source the pattern
}

/** Role-aware pair connection. Legacy strings still accepted for cached readings. */
export interface PairConnectionEntry {
  composite?: PairCompositeBlock | string | null;
  bridge?: PairAspectBlock | string | null;
  friction?: PairAspectBlock | string | null;
  /** REQUIRED on freshly-generated readings; may be absent on legacy cached payloads. */
  interactionPattern?: InteractionPatternBlock | null;
  /** NEW: range-based dynamic paragraph for the pair (3rd grade plain English, both sides of the range). */
  dynamic?: string | null;
  /** NEW: one to two sentences naming how this pair commonly breaks. */
  whatCanFeelHard?: string | null;
  /** NEW: one concrete sentence of what changes the dynamic for the better. */
  whatHelps?: string | null;
  /** NEW (sibling pairs only): one of the allowed pattern types. */
  patternType?: SiblingPatternType | null;
  note?: string | null;
}

/** Allowed sibling pattern types — fixed allow-list, validated server-side. */
export const SIBLING_PATTERN_TYPES = [
  "translation problem",
  "pacing friction",
  "competition risk",
  "quiet co-regulation",
  "mirror match",
  "role split",
] as const;
export type SiblingPatternType = typeof SIBLING_PATTERN_TYPES[number];

/** Role-aware "what already works" entry. */
export interface WhatAlreadyWorksEntry {
  pair: string;
  aspect?: string | null;
  forA?: string | null;
  forB?: string | null;
  /** legacy fallback for older cached readings */
  line?: string | null;
}

/** NEW: Parent-as-Regulation-Center block, one per parent. */
export interface ParentRegulationCenter {
  name: string;
  body: string;
  whatThisMeansInRealLife: string;
}

/** NEW: Per-child adaptation block (richer than the legacy line). */
export interface ChildAdaptationBlock {
  name: string;
  /** Legacy single-line summary, still accepted. */
  line?: string;
  /** NEW: paragraph describing how this child adapts to the family system. */
  adaptation?: string;
  /** NEW: one concrete sentence of what works for this child. */
  respondsBestWhen?: string | string[];
  whatMakesItWorse?: string[];
  inTheMoment?: { scenario: string; actions: string[] }[];
}

/** NEW: Best Family Practice — short, repeatable sequence, NOT a meeting. */
export interface BestFamilyPractice {
  sequence: string;
  steps: string[];
}

export interface FamilySystemReadingResponse {
  atAGlance?: { name: string; line: string }[]; // REQUIRED: one plain-language pattern line per family member
  childMechanisms?: {
    name: string;
    corePattern?: { placement: string; does: string }[];
    theConflict?: string;
    inRealLife?: string;
    underStress?: string;
    whatThisIsNot?: string;
  }[];
  /** NEW Section 2 — required, one entry per parent. */
  parentRegulationCenter?: ParentRegulationCenter[];
  childAdaptations: ChildAdaptationBlock[];
  whatEscalates: { name: string; body: string }[]; // one per family member, written from their perspective
  /** Evidence-gated. May be empty. Each entry must cite a real tight bridge aspect. */
  whatAlreadyWorks?: WhatAlreadyWorksEntry[];
  /** REQUIRED for every parent↔child pair. Role-aware structure. */
  parentChildConnections?: ({ parent: string; child: string } & PairConnectionEntry)[];
  /** REQUIRED for every unique sibling pair. siblingA = older, siblingB = younger. */
  siblingConnections?: ({ siblingA: string; siblingB: string } & PairConnectionEntry)[];
  /** NEW Section 6 — concrete practices for THIS family. */
  whatHelpsWholeFamily?: string[];
  whatHelpsRationale?: string;
  /** NEW Section 7 — concrete things to stop doing in THIS family. */
  whatToAvoid?: string[];
  /** NEW Section 8 — short repeatable practice sequence. */
  bestFamilyPractice?: BestFamilyPractice;
  /** @deprecated kept for back-compat; ignored on render. */
  householdRegulationPattern?: string;
  /** @deprecated NOTE: legacy top-level essay — current `whatHelpsWholeFamily` array replaces it. */
  whatHelps?: string;
  /** @deprecated */
  siblingPressurePoints?: { name: string; body: string }[];
  /** @deprecated */
  householdInTheMoment?: { scenario: string; actions: string[] }[];
  /** @deprecated */
  householdMakesItWorse?: string[];
  whatEachChildNeedsFromYou?: ({
    childName: string;
    opener: string;
    lines: { text: string; tiedTo: "processing" | "stuckPoint" | "pressure" | "specificFriction" }[];
  } | { childName: string; opener: null; lines: null })[];
  error?: string;
}

export function buildFamilySystemPayload(
  members: FamilyMemberInput[],
  data: FamilySystemData,
) {
  const memberContext = members.map((m) => {
    let age: number | null = null;
    if (m.chart.birthDate) {
      const [y, mo, d] = m.chart.birthDate.split("-").map(Number);
      if (y && mo && d) {
        const now = new Date();
        let a = now.getFullYear() - y;
        const before = now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d);
        if (before) a--;
        age = a;
      }
    }
    return {
      name: m.chart.name,
      role: m.role,
      age,
      moonPhase: moonPhaseAtBirth(m.chart),
      sect: sectOfChart(m.chart),
      rulers: rulershipChain(m.chart, [1, 4, 10]),
      retrograde: retrogradeFlags(m.chart),
      profection: age != null ? currentProfectedHouse(m.chart, age) : null,
    };
  });

  const parents = members.filter((m) => m.role === "parent" || m.role === "grandparent");
  const children = members.filter((m) => m.role === "child" || m.role === "sibling");

  // Sort siblings by birthDate ASC so older→younger ordering is stable across pairs.
  // forA / siblingA = older sibling, forB / siblingB = younger sibling.
  const childrenByAge = [...children].sort((a, b) => {
    const da = a.chart.birthDate || "";
    const db = b.chart.birthDate || "";
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da.localeCompare(db); // ISO YYYY-MM-DD string compare = chronological
  });

  const parentActivations = parents.flatMap((p) =>
    children.map((c) => ({
      parentName: p.chart.name,
      childName: c.chart.name,
      hits: parentActivationMap(p.chart, c.chart),
    })),
  );

  const tsquares = crossChartTSquares(members.map((m) => ({ name: m.chart.name, chart: m.chart })));
  const composite = householdComposite(members);

  // Pair composites (carry MORE interpretive weight than the whole-family composite).
  // Compute for every parent-child pair and every sibling pair.
  const pairComposites: { pairType: "parent-child" | "sibling"; nameA: string; nameB: string; composite: ReturnType<typeof householdComposite> }[] = [];
  for (const p of parents) {
    for (const c of children) {
      pairComposites.push({
        pairType: "parent-child",
        nameA: p.chart.name,
        nameB: c.chart.name,
        composite: householdComposite([p, c]),
      });
    }
  }
  for (let i = 0; i < childrenByAge.length; i++) {
    for (let j = i + 1; j < childrenByAge.length; j++) {
      pairComposites.push({
        pairType: "sibling",
        nameA: childrenByAge[i].chart.name, // older
        nameB: childrenByAge[j].chart.name, // younger
        composite: householdComposite([childrenByAge[i], childrenByAge[j]]),
      });
    }
  }

  return {
    members: members.map((m) => ({ name: m.chart.name, role: m.role })),
    memberSummaries: data.memberSummaries,
    moonElements: data.moonElements,
    sunElements: data.sunElements,
    dominantMoonElement: data.dominantMoonElement,
    sharedPlacements: data.sharedPlacements,
    roles: data.roles,
    topFriction: data.topFriction,
    topBridges: data.topBridges,
    memberContext,
    parentActivations,
    crossChartTSquares: tsquares,
    householdComposite: composite,
    pairComposites,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic "When Pressure Builds" pattern generator (client-side)
// Each member must get a DISTINCT, non-interchangeable behavioral line.
// ─────────────────────────────────────────────────────────────────────────────

const PRESSURE_BY_SIGN: Record<string, string> = {
  Aries: "impulse arrives before words, so waiting can feel like losing control",
  Leo: "expression rises quickly, so being ignored can make the signal louder",
  Sagittarius: "meaning has to stay wide, so tight control can trigger blunt escape",
  Cancer: "feeling lands before language, so protection can look like pulling inward",
  Scorpio: "trust has to be checked first, so pressure can make them go private",
  Pisces: "noise enters all at once, so the system can flood before words form",
  Gemini: "thoughts race ahead of feeling, so stress can turn into point-by-point arguing",
  Libra: "both sides register at once, so conflict can stall the answer",
  Aquarius: "logic takes over before feeling is available, so answers can go flat",
  Taurus: "the body needs time to shift, so sudden pressure can become refusal",
  Virgo: "the mind scans for errors first, so stress can become correction",
  Capricorn: "control returns through function, so feeling can get packed away",
};

const MOON_TONE: Record<string, string> = {
  Aries: "with a sharp emotional edge",
  Leo: "with feelings showing on their face",
  Sagittarius: "while needing physical space",
  Cancer: "while clearly hurt underneath",
  Scorpio: "while quietly tracking everything",
  Pisces: "while overwhelmed by the noise",
  Gemini: "while narrating their reaction out loud",
  Libra: "while trying not to upset anyone",
  Aquarius: "while going emotionally flat",
  Taurus: "while needing time to settle",
  Virgo: "while replaying what went wrong",
  Capricorn: "while holding it in until later",
};

const MERCURY_TONE: Record<string, string> = {
  Aries: "and answering before thinking",
  Leo: "and announcing how they feel",
  Sagittarius: "and saying the unfiltered version",
  Cancer: "and going quiet mid-sentence",
  Scorpio: "and refusing to explain themselves",
  Pisces: "and losing the words altogether",
  Gemini: "and arguing every point in real time",
  Libra: "and choosing words carefully",
  Aquarius: "and answering in short, clipped lines",
  Taurus: "and refusing to be rushed for an answer",
  Virgo: "and pointing out exactly what's wrong",
  Capricorn: "and shutting the conversation down",
};

type MechanismLike = NonNullable<FamilySystemReadingResponse["childMechanisms"]>[number];

function mechanismByName(reading?: FamilySystemReadingResponse): Map<string, MechanismLike> {
  const map = new Map<string, MechanismLike>();
  for (const m of reading?.childMechanisms ?? []) {
    const key = m?.name?.trim().toLowerCase();
    if (key) map.set(key, m);
  }
  return map;
}

function firstCauseSentence(text?: string): string | null {
  const hit = (text ?? "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .find((s) => /\b(so|because|which makes|which means|so that|which is why)\b/i.test(s));
  return hit ? hit.replace(/\s+/g, " ") : null;
}

function conciseMechanismLine(m?: MechanismLike): string | null {
  const source = firstCauseSentence(m?.underStress) || firstCauseSentence(m?.inRealLife);
  if (!source) return null;
  const cleaned = source
    .replace(/\([^)]*\)/g, "")
    .replace(/\b(the feeling|feeling|the mind|his mind|her mind|their mind)\b/gi, (x) => x.toLowerCase())
    .replace(/\s+/g, " ")
    .trim();
  return cleaned.length > 170 ? `${cleaned.slice(0, 167).trim()}...` : cleaned;
}

function basePressureLine(chart: NatalChart): string {
  const planets = chart.planets as Record<string, NatalPlanetPosition | undefined>;
  const sign = planets.Mars?.sign || planets.Moon?.sign || planets.Mercury?.sign;
  if (!sign) return "may go quieter and pull inward until things settle";
  return PRESSURE_BY_SIGN[sign] || "may go quieter and pull inward until things settle";
}

export function buildPressurePattern(chart: NatalChart): string {
  return basePressureLine(chart);
}

/**
 * Group-aware version: guarantees each member's pressure line is DISTINCT from
 * every other member's. When two members share a Mars sign, the second is
 * differentiated using their Moon (then Mercury, then Sun) as a tiebreaker.
 */
export function buildPressurePatternsForGroup(
  members: { id: string; chart: NatalChart }[],
  reading?: FamilySystemReadingResponse,
): Record<string, string> {
  const out: Record<string, string> = {};
  const used = new Set<string>();
  const mechanisms = mechanismByName(reading);

  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    const base = conciseMechanismLine(mechanisms.get(m.chart.name.trim().toLowerCase())) || basePressureLine(m.chart);
    let line = base;

    if (used.has(line)) {
      const moonSign = planets.Moon?.sign;
      const moonMod = moonSign ? MOON_TONE[moonSign] : undefined;
      if (moonMod) line = `${base} ${moonMod}`;
    }
    if (used.has(line)) {
      const mercSign = planets.Mercury?.sign;
      const mercMod = mercSign ? MERCURY_TONE[mercSign] : undefined;
      if (mercMod) line = `${base} ${mercMod}`;
    }
    if (used.has(line)) {
      const moonSign = planets.Moon?.sign;
      const mercSign = planets.Mercury?.sign;
      const moonMod = moonSign ? MOON_TONE[moonSign] : "";
      const mercMod = mercSign ? MERCURY_TONE[mercSign] : "";
      const combined = `${base} ${moonMod} ${mercMod}`.replace(/\s+/g, " ").trim();
      if (combined && !used.has(combined)) line = combined;
    }
    if (used.has(line)) {
      const sunSign = planets.Sun?.sign;
      const mercSign = planets.Mercury?.sign;
      if (sunSign || mercSign) line = `${line}, filtered through ${mercSign || sunSign} timing`;
    }

    used.add(line);
    out[m.id] = line;
  }

  return out;
}


// ─────────────────────────────────────────────────────────────────────────────
// Deterministic "Responds Best To" line per member.
// LAYERED evidence: Moon (emotional safety) + Venus (what feels like love) +
// Mercury (how to talk to them) + Mars (recovery / defense) + Saturn hard-aspect
// to luminaries (what to NOT do first) + Sect (day-led vs night-led approach).
// One short line per person. No astrology terms in output. Each person unique
// by construction because the signature mix differs.
// ─────────────────────────────────────────────────────────────────────────────

// Lead clause: emotional safety currency (Moon).
const MOON_LEAD: Record<string, string> = {
  Aries: "short, direct requests and a way to move",
  Leo: "being acknowledged first, then asked",
  Sagittarius: "a real reason and room to choose",
  Cancer: "a soft tone and a private check-in",
  Scorpio: "honesty, no surprises, and space to come back on their own",
  Pisces: "lower volume and one thing at a time",
  Gemini: "talking it through, not being told",
  Libra: "fairness and a minute to think before answering",
  Aquarius: "space, logic, and not being pushed for emotion on demand",
  Taurus: "slower pacing and warning before a change",
  Virgo: "clear instructions and a private correction",
  Capricorn: "being trusted with the task and not micromanaged",
};

// What feels like love / respect (Venus). Not the same as emotional safety.
const VENUS_LOVE: Record<string, string> = {
  Aries: "being chosen first",
  Taurus: "consistency and physical comfort",
  Gemini: "being asked questions about themselves",
  Cancer: "small acts of care without being asked",
  Leo: "being noticed out loud",
  Virgo: "small specific things done right",
  Libra: "feeling like the relationship is fair",
  Scorpio: "loyalty and undivided attention",
  Sagittarius: "shared honesty and freedom inside the bond",
  Capricorn: "showing up reliably over time",
  Aquarius: "being respected as their own person",
  Pisces: "feeling deeply understood without explaining",
};

// How to phrase things so they actually land (Mercury).
const MERCURY_DELIVERY: Record<string, string> = {
  Aries: "say it short and direct",
  Taurus: "say it calmly and don't rush the answer",
  Gemini: "ask, don't tell",
  Cancer: "soften the tone before the content",
  Leo: "lead with what they did right",
  Virgo: "give a reason and a clear next step",
  Libra: "offer a choice between two options",
  Scorpio: "be straight, no hint or implication",
  Sagittarius: "keep it big-picture, skip the lecture",
  Capricorn: "be matter-of-fact, not emotional",
  Aquarius: "use logic, not pressure",
  Pisces: "use fewer words and a gentler tone",
};

// Recovery / defense currency (Mars) — what helps them come back.
const MARS_RECOVERY: Record<string, string> = {
  Aries: "movement before talking",
  Taurus: "a snack and a slower pace",
  Gemini: "a question that lets them think out loud",
  Cancer: "a quiet room and food",
  Leo: "being given something visible to lead",
  Virgo: "a clear next step",
  Libra: "being asked their opinion",
  Scorpio: "one trusted person, not a group",
  Sagittarius: "fresh air and room to move",
  Capricorn: "a defined goal",
  Aquarius: "being left alone briefly first",
  Pisces: "lower stimulation and one thing at a time",
};

// Signs in hard aspect (conjunction/square/opposition) by sign relationship.
const SIGN_INDEX: Record<string, number> = {
  Aries: 0, Taurus: 1, Gemini: 2, Cancer: 3, Leo: 4, Virgo: 5,
  Libra: 6, Scorpio: 7, Sagittarius: 8, Capricorn: 9, Aquarius: 10, Pisces: 11,
};

function absLon(p?: NatalPlanetPosition): number | null {
  if (!p || !p.sign) return null;
  const i = SIGN_INDEX[p.sign];
  if (i == null) return null;
  return i * 30 + (p.degree ?? 0) + ((p.minutes ?? 0) / 60);
}

function hardAspectOrb(a?: NatalPlanetPosition, b?: NatalPlanetPosition): number | null {
  const la = absLon(a), lb = absLon(b);
  if (la == null || lb == null) return null;
  let diff = Math.abs(la - lb) % 360;
  if (diff > 180) diff = 360 - diff;
  // Conjunction (0), square (90), opposition (180)
  const targets = [0, 90, 180];
  let best = Infinity;
  for (const t of targets) {
    const d = Math.abs(diff - t);
    if (d < best) best = d;
  }
  return best;
}

// Returns a "what to avoid" caveat if Saturn hard-aspects Sun or Moon within 7°.
function saturnLuminaryCaveat(planets: Record<string, NatalPlanetPosition | undefined>): string | null {
  const sat = planets.Saturn;
  if (!sat) return null;
  const toSun = hardAspectOrb(sat, planets.Sun);
  const toMoon = hardAspectOrb(sat, planets.Moon);
  const tight = Math.min(toSun ?? 99, toMoon ?? 99);
  if (tight > 7) return null;
  // Hits Moon → criticism cuts; hits Sun → being judged on performance cuts.
  if ((toMoon ?? 99) <= (toSun ?? 99)) return "without being criticized first";
  return "without being made to prove themselves first";
}

function sectOpener(chart: NatalChart): string | null {
  const s = sectOfChart(chart);
  if (!s) return null;
  return s.sect === "day"
    ? "clear leadership and fairness up front"
    : "the right moment before a serious ask";
}

// Pick the strongest 1-2 secondary currencies (avoid stacking ones that say
// almost the same thing as the Moon lead, to keep the line tight).
function pickSecondaries(
  planets: Record<string, NatalPlanetPosition | undefined>,
  used: Set<string>
): string[] {
  const candidates: string[] = [];
  const venus = planets.Venus?.sign;
  const merc = planets.Mercury?.sign;
  const mars = planets.Mars?.sign;
  if (venus && VENUS_LOVE[venus]) candidates.push(`feeling loved through ${VENUS_LOVE[venus]}`);
  if (merc && MERCURY_DELIVERY[merc]) candidates.push(`hearing it when you ${MERCURY_DELIVERY[merc]}`);
  if (mars && MARS_RECOVERY[mars]) candidates.push(`recovering through ${MARS_RECOVERY[mars]}`);
  // Prefer two unused-looking fragments so siblings sound different.
  const fresh = candidates.filter((c) => !Array.from(used).some((u) => u.includes(c)));
  const ordered = fresh.length ? fresh : candidates;
  return ordered.slice(0, 1);
}

export interface RespondsBestProfile {
  whatFeelsSafe: string;       // Moon
  whatFeelsLikeLove: string;   // Venus
  howTheyHearYou: string;      // Mercury
  howTheyReset: string;        // Mars
  whatCuts?: string;           // Saturn hard-aspect to luminary (only if present)
}

// Returns labeled micro-lines per person. No blended sentence.
// Each line is one specific, short condition mapped to one placement.
export function buildRespondsBestProfileForGroup(
  members: { id: string; chart: NatalChart }[],
): Record<string, RespondsBestProfile> {
  const out: Record<string, RespondsBestProfile> = {};
  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    const moon = planets.Moon?.sign;
    const venus = planets.Venus?.sign;
    const merc = planets.Mercury?.sign;
    const mars = planets.Mars?.sign;
    const caveat = saturnLuminaryCaveat(planets);

    out[m.id] = {
      whatFeelsSafe: (moon && MOON_LEAD[moon]) || "a calm tone and one thing at a time",
      whatFeelsLikeLove: (venus && VENUS_LOVE[venus]) || "consistent, specific care",
      howTheyHearYou: (merc && MERCURY_DELIVERY[merc]) || "short, clear words without pressure",
      howTheyReset: (mars && MARS_RECOVERY[mars]) || "lower stimulation and a short break",
      ...(caveat ? { whatCuts: caveat.replace(/^without /, "being ") } : {}),
    };
  }
  return out;
}

export function buildRespondsBestForGroup(
  members: { id: string; chart: NatalChart }[],
  reading?: FamilySystemReadingResponse,
): Record<string, string> {
  const out: Record<string, string> = {};
  const used = new Set<string>();
  const usedFragments = new Set<string>();
  const needsByName = new Map(
    (reading?.whatEachChildNeedsFromYou ?? [])
      .filter((entry) => entry.opener && Array.isArray(entry.lines) && entry.lines.length >= 3)
      .map((entry) => [entry.childName.trim().toLowerCase(), entry.lines.map((l) => l.text.trim()).join("; ")]),
  );

  for (const m of members) {
    const mechanismMapped = needsByName.get(m.chart.name.trim().toLowerCase());
    if (mechanismMapped) {
      out[m.id] = mechanismMapped;
      used.add(mechanismMapped);
      continue;
    }
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    const moon = planets.Moon?.sign;
    const lead = (moon && MOON_LEAD[moon]) || "a calm tone and one thing at a time";

    const opener = sectOpener(m.chart);
    const secondaries = pickSecondaries(planets, usedFragments);
    const caveat = saturnLuminaryCaveat(planets);

    // Compose: "responds best to <lead>" + optional sect opener merged + secondaries + caveat
    const parts: string[] = [lead];
    if (opener && !lead.includes(opener.split(" ")[0])) parts.push(opener);
    if (secondaries.length) parts.push(secondaries.join(", and "));
    if (caveat) parts.push(caveat);

    let line = parts.join(", ").replace(/\s+/g, " ").trim();

    // Uniqueness safety: if this line collides exactly, append Sun-sign style note.
    if (used.has(line)) {
      const sun = planets.Sun?.sign;
      if (sun) line = `${line} (in their own ${sun} way)`;
    }

    used.add(line);
    secondaries.forEach((s) => usedFragments.add(s));
    if (opener) usedFragments.add(opener);
    out[m.id] = line;
  }

  return out;
}

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic household reset line from Moon-element tally.
// One sentence. No advice, no scenarios.
// ─────────────────────────────────────────────────────────────────────────────

export function buildHouseholdResetLine(
  members: { chart: NatalChart }[]
): string | null {
  if (!members.length) return null;
  const tally = { fire: 0, earth: 0, air: 0, water: 0 };
  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    const el = elementOf(planets.Moon?.sign);
    if (el) tally[el]++;
  }
  const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
  const [topEl, topN] = sorted[0];
  if (topN === 0) return null;

  const need: Record<string, string> = {
    water: "quiet, lower volume, and time alone to reset",
    fire: "movement, physical outlet, and space to discharge",
    earth: "structure, predictable routine, and food before discussion",
    air: "talking it through, fewer interruptions, and room to think out loud",
  };

  const counts = `${tally.water} water, ${tally.fire} fire, ${tally.earth} earth, ${tally.air} air`;
  return `Moons in this household: ${counts}. The group resets fastest with ${need[topEl]}.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// THE FAMILY WEB — collision-layer (deterministic, no AI)
// ─────────────────────────────────────────────────────────────────────────────

type Element = "fire" | "earth" | "air" | "water";
type Modality = "cardinal" | "fixed" | "mutable";

const CARDINAL = new Set(["Aries", "Cancer", "Libra", "Capricorn"]);
const FIXED = new Set(["Taurus", "Leo", "Scorpio", "Aquarius"]);
const MUTABLE = new Set(["Gemini", "Virgo", "Sagittarius", "Pisces"]);

function modalityOf(sign?: string): Modality | null {
  if (!sign) return null;
  if (CARDINAL.has(sign)) return "cardinal";
  if (FIXED.has(sign)) return "fixed";
  if (MUTABLE.has(sign)) return "mutable";
  return null;
}

function cuspAbs(c?: { sign: string; degree: number; minutes?: number }): number | null {
  if (!c?.sign) return null;
  const idx = ZODIAC_SIGNS.indexOf(c.sign);
  if (idx < 0) return null;
  return idx * 30 + (c.degree ?? 0) + ((c.minutes ?? 0) / 60);
}

/** Returns 1..12 for planet's house, or null if cusps missing. */
function houseOfPlanet(chart: NatalChart, planet: NatalPlanetPosition | undefined): number | null {
  if (!planet?.sign || !chart.houseCusps) return null;
  const pAbs = toAbs(planet);
  if (pAbs == null) return null;
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = (chart.houseCusps as any)[`house${i}`];
    const v = cuspAbs(c);
    if (v == null) return null;
    cusps.push(v);
  }
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    // Handle wraparound across 0° Aries
    const inside = start < end
      ? pAbs >= start && pAbs < end
      : pAbs >= start || pAbs < end;
    if (inside) return i + 1;
  }
  return null;
}

// ── Section 1: Elemental Void + Natural Surrogate ─────────────────────────────
const VOID_ELEMENT_HOUSES: Record<Element, number[]> = {
  earth: [2, 6, 10],
  water: [4, 8, 12],
  fire: [1, 5, 9],
  air: [3, 7, 11],
};

const VOID_RISINGS: Record<Element, Set<string>> = {
  earth: new Set(["Taurus", "Virgo", "Capricorn"]),
  water: new Set(["Cancer", "Scorpio", "Pisces"]),
  fire: new Set(["Aries", "Leo", "Sagittarius"]),
  air: new Set(["Gemini", "Libra", "Aquarius"]),
};

const VOID_IMPACT: Record<Element, string> = {
  earth: "No natural anchor. When things get chaotic, no one inherently slows down or gets practical.",
  water: "No natural feeler. Emotional weather can go unnoticed until someone breaks.",
  fire: "No natural spark. The household can stall, miss momentum, avoid risk.",
  air: "No natural translator. Feelings stay unspoken and assumptions pile up.",
};

const VOID_ANCHOR: Record<Element, string> = {
  earth: "Add a physical anchor — a literal timer, a chore order, food before discussion.",
  water: "Add a feeling check — one shared sentence about how today landed, named out loud.",
  fire: "Add a starter — one person assigned to launch the day, the meal, the plan.",
  air: "Add a naming step — short, plain words about what just happened before reacting.",
};

export interface ElementalVoid {
  missingElement: Element | null;
  counts: { fire: number; earth: number; air: number; water: number };
  impact: string | null;
  anchorSuggestion: string | null;
  surrogate: { name: string; why: string } | null;
}

export function computeElementalVoid(
  members: { chart: NatalChart }[],
): ElementalVoid {
  const counts = { fire: 0, earth: 0, air: 0, water: 0 };
  // Tally Sun/Moon/Mercury/Venus/Mars elements across the family
  for (const m of members) {
    const p = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    for (const name of ["Sun", "Moon", "Mercury", "Venus", "Mars"]) {
      const el = elementOf(p[name]?.sign);
      if (el) counts[el]++;
    }
  }

  const sorted = (Object.entries(counts) as [Element, number][]).sort((a, b) => a[1] - b[1]);
  const [missing, missingCount] = sorted[0];
  // Threshold: 0 or (1 and family >= 3 members)
  const isVoid = missingCount === 0 || (missingCount <= 1 && members.length >= 3);
  if (!isVoid) {
    return { missingElement: null, counts, impact: null, anchorSuggestion: null, surrogate: null };
  }

  // Find surrogate
  let surrogate: { name: string; why: string } | null = null;
  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    const rising = planets.Ascendant?.sign;
    if (rising && VOID_RISINGS[missing].has(rising)) {
      surrogate = { name: m.chart.name, why: `${rising} rising acts as the family's ${missing}` };
      break;
    }
    // Planet in natural house of that element
    for (const pname of ["Sun", "Moon", "Mercury", "Venus", "Mars", "Saturn"]) {
      const pl = planets[pname];
      if (!pl) continue;
      const h = houseOfPlanet(m.chart, pl);
      if (h && VOID_ELEMENT_HOUSES[missing].includes(h)) {
        surrogate = { name: m.chart.name, why: `${pname} in the ${h}th house carries the missing ${missing} function` };
        break;
      }
    }
    if (surrogate) break;
    // Strong Saturn for missing earth
    if (missing === "earth") {
      const sat = planets.Saturn;
      if (sat?.sign && ["Capricorn", "Aquarius"].includes(sat.sign)) {
        surrogate = { name: m.chart.name, why: `Saturn in ${sat.sign} acts as the family's earth` };
        break;
      }
    }
  }

  return {
    missingElement: missing,
    counts,
    impact: VOID_IMPACT[missing],
    anchorSuggestion: VOID_ANCHOR[missing],
    surrogate,
  };
}

// ── Section 2: Bridge Members + Shadow Bridge ─────────────────────────────────
export type BridgeType = "fire-redirect" | "water-soothe" | "air-translate" | "earth-anchor";

export interface BridgeMember {
  clashingPair: [string, string];
  clashReason: string;
  bridge: string;
  sharedElementWithA: Element;
  sharedElementWithB: Element;
  bridgeType: BridgeType;
  howToUse: string;
  withdrawalCaveat?: string;
}

function dominantElements(chart: NatalChart): Element[] {
  const tally = { fire: 0, earth: 0, air: 0, water: 0 };
  const planets = chart.planets as Record<string, NatalPlanetPosition | undefined>;
  for (const n of ["Sun", "Moon", "Mercury", "Venus", "Mars", "Ascendant"]) {
    const el = elementOf(planets[n]?.sign);
    if (el) tally[el]++;
  }
  return (Object.entries(tally) as [Element, number][])
    .filter(([, n]) => n >= 1)
    .sort((a, b) => b[1] - a[1])
    .map(([e]) => e);
}

function elementClash(a: Element, b: Element): string | null {
  // Classic incompatibilities
  if ((a === "fire" && b === "water") || (a === "water" && b === "fire")) return "fire dries water; water smothers fire";
  if ((a === "air" && b === "earth") || (a === "earth" && b === "air")) return "earth ignores air's ideas; air destabilizes earth's routine";
  return null;
}

const BRIDGE_HOWTO: Record<BridgeType, string> = {
  "fire-redirect": "Physical redirection. Move bodies — walk, drive, cook side by side. Do NOT mediate verbally; the fire bridge accidentally fans the conflict if it sits and talks.",
  "water-soothe": "Soft tone, slower pace. The water bridge soothes by lowering volume and naming feelings without fixing.",
  "air-translate": "Name what's happening out loud, in plain words. The air bridge translates one side's behavior for the other.",
  "earth-anchor": "Anchor through a practical task. The earth bridge gets everyone doing something concrete — a chore, food, a routine — so the conflict has somewhere to go.",
};

export function findBridgeMembers(
  members: { chart: NatalChart }[],
): BridgeMember[] {
  if (members.length < 3) return [];
  const out: BridgeMember[] = [];
  const memberDom = members.map((m) => ({ name: m.chart.name, dom: dominantElements(m.chart), chart: m.chart }));

  for (let i = 0; i < memberDom.length; i++) {
    for (let j = i + 1; j < memberDom.length; j++) {
      const a = memberDom[i];
      const b = memberDom[j];
      if (!a.dom.length || !b.dom.length) continue;
      const elA = a.dom[0];
      const elB = b.dom[0];
      const reason = elementClash(elA, elB);
      if (!reason) continue;

      // Find a bridge: third member who shares an element with both
      for (let k = 0; k < memberDom.length; k++) {
        if (k === i || k === j) continue;
        const c = memberDom[k];
        const shareA = c.dom.find((e) => e === elA);
        const shareB = c.dom.find((e) => e === elB);
        if (!shareA || !shareB) continue;

        // Determine bridge type from the bridge's dominant element OR Mars sign
        const mars = (c.chart.planets as any).Mars?.sign;
        const marsEl = elementOf(mars);
        const bridgeEl = c.dom[0];
        let bridgeType: BridgeType;
        if (bridgeEl === "fire" || marsEl === "fire" || (mars && ["Aries"].includes(mars))) {
          bridgeType = "fire-redirect";
        } else if (bridgeEl === "water") {
          bridgeType = "water-soothe";
        } else if (bridgeEl === "air") {
          bridgeType = "air-translate";
        } else {
          bridgeType = "earth-anchor";
        }

        const withdrawalCaveat = bridgeType === "fire-redirect"
          ? "If the bridge starts mediating verbally, the heat rises. Keep the bridge active, not seated."
          : undefined;

        out.push({
          clashingPair: [a.name, b.name],
          clashReason: reason,
          bridge: c.name,
          sharedElementWithA: shareA,
          sharedElementWithB: shareB,
          bridgeType,
          howToUse: BRIDGE_HOWTO[bridgeType],
          withdrawalCaveat,
        });
        break;
      }
    }
  }
  return out;
}

// ── Section 3: Triangulation + Modality Gridlock ──────────────────────────────
export interface ModalityPattern {
  dominant: Modality;
  count: number;
  label: "GRIDLOCK" | "START-WAR" | "DRIFT";
  intervention: string;
}

export interface Triangulation {
  loud: string;
  quiet: string;
  amplifier: string;
  sequence: string;
  intervention: string;
}

const MODALITY_LABELS: Record<Modality, ModalityPattern["label"]> = {
  fixed: "GRIDLOCK",
  cardinal: "START-WAR",
  mutable: "DRIFT",
};

const MODALITY_INTERVENTIONS: Record<Modality, string> = {
  fixed: "Introduce a Mutable choice — offer two options instead of one demand. Nothing moves under a single ultimatum.",
  cardinal: "Everyone wants to lead the moment. Assign turns out loud: who decides this one, who decides the next.",
  mutable: "The plan keeps changing. One person must hold the frame and refuse to renegotiate mid-stream.",
};

function isLoud(chart: NatalChart): boolean {
  const p = chart.planets as Record<string, NatalPlanetPosition | undefined>;
  const fire = [p.Sun?.sign, p.Moon?.sign, p.Mars?.sign, p.Ascendant?.sign].filter((s) => s && FIRE.has(s)).length;
  const air = [p.Mercury?.sign].filter((s) => s && AIR.has(s)).length;
  return fire >= 2 || (fire >= 1 && air >= 1);
}
function isQuiet(chart: NatalChart): boolean {
  const p = chart.planets as Record<string, NatalPlanetPosition | undefined>;
  const water = [p.Sun?.sign, p.Moon?.sign, p.Mercury?.sign, p.Ascendant?.sign].filter((s) => s && WATER.has(s)).length;
  const earth = [p.Sun?.sign, p.Moon?.sign].filter((s) => s && EARTH.has(s)).length;
  return water >= 2 || (water >= 1 && earth >= 1);
}

export interface TriangulationResult {
  triangles: Triangulation[];
  modalityPattern: ModalityPattern | null;
}

export function findTriangulations(
  members: { chart: NatalChart }[],
): TriangulationResult {
  const triangles: Triangulation[] = [];

  if (members.length >= 3) {
    const louds = members.filter((m) => isLoud(m.chart));
    const quiets = members.filter((m) => isQuiet(m.chart));
    for (const L of louds) {
      for (const Q of quiets) {
        if (L.chart.id === Q.chart.id) continue;
        // Find an amplifier: another loud member (not L or Q)
        const amp = louds.find((m) => m.chart.id !== L.chart.id && m.chart.id !== Q.chart.id);
        if (!amp) continue;
        triangles.push({
          loud: L.chart.name,
          quiet: Q.chart.name,
          amplifier: amp.chart.name,
          sequence: `${L.chart.name} pushes → ${amp.chart.name} echoes or escalates → ${Q.chart.name} withdraws further.`,
          intervention: `Pull ${amp.chart.name} aside first. Without the amplifier, ${L.chart.name} runs out of fuel and ${Q.chart.name} can re-enter.`,
        });
        break;
      }
    }
  }

  // Modality pile-up across Sun + Moon + Mars + Rising of every member
  const tally = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const m of members) {
    const p = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    for (const n of ["Sun", "Moon", "Mars", "Ascendant"]) {
      const mod = modalityOf(p[n]?.sign);
      if (mod) tally[mod]++;
    }
  }
  let modalityPattern: ModalityPattern | null = null;
  const total = tally.cardinal + tally.fixed + tally.mutable;
  const threshold = Math.max(3, Math.ceil(total * 0.5));
  const dom = (Object.entries(tally) as [Modality, number][]).sort((a, b) => b[1] - a[1])[0];
  if (dom && dom[1] >= threshold) {
    modalityPattern = {
      dominant: dom[0],
      count: dom[1],
      label: MODALITY_LABELS[dom[0]],
      intervention: MODALITY_INTERVENTIONS[dom[0]],
    };
  }

  return { triangles: triangles.slice(0, 3), modalityPattern };
}

// ── Section 4: Inherited Signatures (Family Mirrors) ──────────────────────────
export interface FamilyMirror {
  parent: string;
  child: string;
  mirroredPlacement: string;
  sameTeamMessage: string;
}

export function findInheritedSignatures(
  members: { chart: NatalChart; role: FamilyRole }[],
): FamilyMirror[] {
  const parents = members.filter((m) => m.role === "parent" || m.role === "grandparent");
  const children = members.filter((m) => m.role === "child" || m.role === "sibling");
  const out: FamilyMirror[] = [];
  const checks: { key: string; label: string }[] = [
    { key: "Sun", label: "Sun" },
    { key: "Moon", label: "Moon" },
    { key: "Mercury", label: "Mercury" },
    { key: "Venus", label: "Venus" },
    { key: "Mars", label: "Mars" },
    { key: "Ascendant", label: "Rising" },
  ];
  for (const p of parents) {
    for (const c of children) {
      const pp = p.chart.planets as Record<string, NatalPlanetPosition | undefined>;
      const cp = c.chart.planets as Record<string, NatalPlanetPosition | undefined>;
      // Exact sign match
      for (const ck of checks) {
        const ps = pp[ck.key]?.sign;
        const cs = cp[ck.key]?.sign;
        if (ps && cs && ps === cs) {
          out.push({
            parent: p.chart.name,
            child: c.chart.name,
            mirroredPlacement: `Both ${ck.label} in ${ps}`,
            sameTeamMessage: `Same team, different volume. When you collide here, you're colliding with a part of yourself.`,
          });
          break;
        }
      }
      // Element match on luminary (only if no exact match found for this pair)
      if (!out.some((m) => m.parent === p.chart.name && m.child === c.chart.name)) {
        for (const lum of ["Sun", "Moon"]) {
          const ps = pp[lum]?.sign;
          const cs = cp[lum]?.sign;
          if (ps && cs && ps !== cs && elementOf(ps) && elementOf(ps) === elementOf(cs)) {
            out.push({
              parent: p.chart.name,
              child: c.chart.name,
              mirroredPlacement: `${lum}s in the same element (${elementOf(ps)})`,
              sameTeamMessage: `Same emotional climate, different style. The friction is method, not values.`,
            });
            break;
          }
        }
      }
    }
  }
  return out;
}

// ── Section 5: Regulation Dashboard + Saturn Wall ─────────────────────────────
export interface RegulationRow {
  name: string;
  role: FamilyRole;
  triggeredBy: string;
  stressReaction: string;
  circuitBreaker: string;
  sensitivityNotes?: { aboutChild: string; note: string }[];
}

const MERCURY_TRIGGER: Record<string, string> = {
  Aries: "interruptions and slow explanations",
  Taurus: "being rushed or talked over",
  Gemini: "vague answers and dead-air silence",
  Cancer: "sharp tones and public correction",
  Leo: "being dismissed or upstaged",
  Virgo: "imprecision and surprise changes",
  Libra: "open conflict and forced sides",
  Scorpio: "feeling watched or interrogated",
  Sagittarius: "small rules and micromanaging",
  Capricorn: "emotional flooding without a plan",
  Aquarius: "pressure to perform feelings on cue",
  Pisces: "blunt logic without acknowledgment",
};

const MARS_REACTION: Record<string, string> = {
  Aries: "snaps, then moves away fast",
  Taurus: "digs in, refuses to budge",
  Gemini: "argues sideways, keeps changing the point",
  Cancer: "retreats and goes silent",
  Leo: "performs anger loudly, then sulks",
  Virgo: "criticizes details to discharge",
  Libra: "withdraws politely, stores resentment",
  Scorpio: "goes cold, watches, waits",
  Sagittarius: "blurts the truth, then leaves the room",
  Capricorn: "shuts down and lectures",
  Aquarius: "detaches, observes coolly",
  Pisces: "dissolves, cries, or disappears",
};

const MARS_BREAKER: Record<string, string> = {
  Aries: "short physical outlet — walk, push-ups, anything bodily",
  Taurus: "food and a long pause before re-engaging",
  Gemini: "switch topic or environment, then come back",
  Cancer: "private space and a soft re-entry",
  Leo: "acknowledgment first, problem-solving second",
  Virgo: "one concrete next step, not a discussion",
  Libra: "name the conflict gently, don't avoid it",
  Scorpio: "honesty without an audience",
  Sagittarius: "movement and open air, not a closed room",
  Capricorn: "structure and a clear timeline",
  Aquarius: "logic and space, not pleading",
  Pisces: "low stimulation, music, water",
};

export function buildRegulationDashboard(
  members: { chart: NatalChart; role: FamilyRole }[],
): RegulationRow[] {
  const parents = members.filter((m) => m.role === "parent" || m.role === "grandparent");
  const children = members.filter((m) => m.role === "child" || m.role === "sibling");

  const rows: RegulationRow[] = members.map((m) => {
    const p = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    const merc = p.Mercury?.sign;
    const mars = p.Mars?.sign;
    return {
      name: m.chart.name,
      role: m.role,
      triggeredBy: (merc && MERCURY_TRIGGER[merc]) || "abrupt shifts and unclear expectations",
      stressReaction: (mars && MARS_REACTION[mars]) || "withdraws and waits it out",
      circuitBreaker: (mars && MARS_BREAKER[mars]) || "lower stimulation and a slower pace",
    };
  });

  // Saturn Wall: child's Saturn matches parent's Sun or Moon sign
  for (const c of children) {
    const cSat = (c.chart.planets as any).Saturn?.sign;
    if (!cSat) continue;
    for (const par of parents) {
      const pp = par.chart.planets as Record<string, NatalPlanetPosition | undefined>;
      const hits: string[] = [];
      if (pp.Sun?.sign === cSat) hits.push("Sun");
      if (pp.Moon?.sign === cSat) hits.push("Moon");
      if (!hits.length) continue;
      const row = rows.find((r) => r.name === par.chart.name);
      if (!row) continue;
      row.sensitivityNotes = row.sensitivityNotes ?? [];
      row.sensitivityNotes.push({
        aboutChild: c.chart.name,
        note: `${c.chart.name}'s Saturn sits on your ${hits.join(" and ")} (${cSat}). Their silence will feel personal. It is their boundary forming, not rejection of you.`,
      });
    }
  }

  return rows;
}

// ── Sibling Shadow-Bridge reset mode ──────────────────────────────────────────
// For a sibling pair, determine HOW to resolve conflict based on their shared
// dominant element. Fire/Earth pairs should NEVER be sat down to talk — they
// reset through action. Air pairs reset through naming. Water pairs reset
// through soft tone and acknowledgment.
export interface SiblingResetMode {
  siblingA: string;
  siblingB: string;
  sharedElements: Element[];
  mode: "action" | "naming" | "soothe" | "translate";
  doThis: string;
  dontDoThis: string;
}

export function computeSiblingResetMode(
  chartA: NatalChart,
  chartB: NatalChart,
): SiblingResetMode {
  const domA = new Set(dominantElements(chartA));
  const domB = new Set(dominantElements(chartB));
  const shared: Element[] = (["fire", "earth", "air", "water"] as Element[])
    .filter((e) => domA.has(e) && domB.has(e));

  const hasFire = shared.includes("fire");
  const hasEarth = shared.includes("earth");
  const hasAir = shared.includes("air");
  const hasWater = shared.includes("water");

  let mode: SiblingResetMode["mode"];
  let doThis: string;
  let dontDoThis: string;

  if (hasFire && hasEarth) {
    mode = "action";
    doThis = `Hand ${chartA.name} and ${chartB.name} a physical project — a ball, a build, a chore that needs two people. They reset through doing, side by side.`;
    dontDoThis = `Do NOT sit them down to talk it out. Words slow the fire and bore the earth; the conflict will reignite within minutes.`;
  } else if (hasFire) {
    mode = "action";
    doThis = `Move their bodies — walk, run, throw, cook. ${chartA.name} and ${chartB.name} reset through movement, not conversation.`;
    dontDoThis = `Do NOT sit them down for a talk. Shared fire heats up under verbal mediation; hand them a task instead.`;
  } else if (hasEarth) {
    mode = "action";
    doThis = `Give them a concrete shared task — build, fix, finish something together. Doing resolves what talking can't.`;
    dontDoThis = `Do NOT force a long emotional conversation. Earth resets through completion, not processing.`;
  } else if (hasAir) {
    mode = "naming";
    doThis = `Name what just happened out loud, in plain words. ${chartA.name} and ${chartB.name} settle when the dynamic is articulated.`;
    dontDoThis = `Do NOT demand they "just move on." Air needs the moment translated before it can drop it.`;
  } else if (hasWater) {
    mode = "soothe";
    doThis = `Soft tone, lower volume, fewer words. Acknowledge the feeling before solving anything.`;
    dontDoThis = `Do NOT push for an immediate fix or a logical explanation. Water resets through being met, not corrected.`;
  } else {
    mode = "translate";
    doThis = `Translate between them: one needs words, the other needs movement (or quiet). Don't expect the same reset to work for both.`;
    dontDoThis = `Do NOT apply a single intervention to both. Their reset modes don't overlap — separate first, regroup second.`;
  }

  return {
    siblingA: chartA.name,
    siblingB: chartB.name,
    sharedElements: shared,
    mode,
    doThis,
    dontDoThis,
  };
}

// ── Section 6: Karmic Custodian — 12th-House Mirror ───────────────────────────
export interface TwelfthHouseMirror {
  parent: string;
  child: string;
  childPlanet: string;
  text: string;
}

const TWELFTH_HOUSE_TEXT: Record<string, (parent: string, child: string) => string> = {
  Sun: (_p, c) => `${c}'s "look at me" behavior is a mirror of the part of yourself you keep private. When they act out for attention, ask what part of you is going unseen. Name your own desire to be seen first, and their performing softens.`,
  Moon: (_p, c) => `${c}'s restlessness, clinginess, or random tears are a mirror of stress you haven't named out loud. They feel it before you do. Say "I'm tense right now and it's not about you," and their nervous system settles.`,
  Mercury: (_p, c) => `${c}'s blunt questions or "weird" comments are a mirror of thoughts you're holding back. They voice what you won't. Say the held-back sentence yourself, and their odd timing drops.`,
  Venus: (_p, c) => `${c}'s neediness or sudden coldness is a mirror of relationship tension you're avoiding. Acknowledge the tension directly (even to yourself) so they don't have to act it out for you.`,
  Mars: (_p, c) => `${c}'s tantrums or pushback are a mirror of anger you're sitting on. Their reactivity will drop the moment you name your own frustration ("I'm mad about X, not you").`,
};

export function findTwelfthHouseMirrors(
  members: { chart: NatalChart; role: FamilyRole }[],
): TwelfthHouseMirror[] {
  const parents = members.filter((m) => m.role === "parent" || m.role === "grandparent");
  const children = members.filter((m) => m.role === "child");
  const out: TwelfthHouseMirror[] = [];

  for (const p of parents) {
    if (!p.chart.houseCusps) continue;
    for (const c of children) {
      for (const planetName of ["Sun", "Moon", "Mercury", "Venus", "Mars"]) {
        const planet = (c.chart.planets as any)[planetName] as NatalPlanetPosition | undefined;
        if (!planet?.sign) continue;
        const house = houseOfPlanet(p.chart, planet);
        if (house !== 12) continue;
        const textFn = TWELFTH_HOUSE_TEXT[planetName];
        if (!textFn) continue;
        out.push({
          parent: p.chart.name,
          child: c.chart.name,
          childPlanet: planetName,
          text: textFn(p.chart.name, c.chart.name),
        });
      }
    }
  }
  return out;
}

// ── Section 7: Midpoint Hotspots ──────────────────────────────────────────────
export interface MidpointHotspot {
  parentA: string;
  parentB: string;
  parentPlanetA: string;
  parentPlanetB: string;
  midpointSign: string;
  midpointDegree: number; // 0..30
  midpointMinutes: number; // 0..60
  activator: string;
  activatorPlanet: string;
  orb: number;
  interpretation: string;
}

const MIDPOINT_PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Ascendant"] as const;
const MIDPOINT_ORB = 1.5;

function midpointInterpretation(planetA: string, planetB: string, child: string): string {
  const key = [planetA, planetB].sort().join("/");
  const map: Record<string, string> = {
    "Mars/Sun": `${child} activates your shared drive. They feel most secure when you two are moving toward a goal together.`,
    "Moon/Sun": `${child} sits on your relationship's emotional center. Your mood as a couple sets theirs.`,
    "Mars/Saturn": `${child} triggers your shared frustration and discipline knot. Tighten the rules together, or they'll exploit the gap.`,
    "Mars/Venus": `${child} activates the spark between you two. They thrive when you two are affectionate in front of them.`,
    "Saturn/Sun": `${child} carries your shared sense of duty. Don't over-task them.`,
    "Mercury/Sun": `${child} echoes your shared conversation style. They will speak the way you two speak to each other.`,
    "Moon/Venus": `${child} amplifies the warmth or coolness between you two. Affection between parents is felt directly by them.`,
    "Mars/Moon": `${child} sits on the emotional friction point. Unresolved tension between you two lands in their nervous system.`,
  };
  return map[key]
    || `${child} sits on the midpoint of your ${planetA}/${planetB} energy. When you two are aligned around that theme, they amplify it.`;
}

export function findMidpointHotspots(
  members: { chart: NatalChart; role: FamilyRole }[],
): MidpointHotspot[] {
  const parents = members.filter((m) => m.role === "parent");
  if (parents.length < 2) return [];

  const hotspots: MidpointHotspot[] = [];

  for (let i = 0; i < parents.length; i++) {
    for (let j = i + 1; j < parents.length; j++) {
      const pA = parents[i];
      const pB = parents[j];
      for (const planetA of MIDPOINT_PLANETS) {
        const posA = (pA.chart.planets as any)[planetA] as NatalPlanetPosition | undefined;
        const aAbs = toAbs(posA);
        if (aAbs == null) continue;
        for (const planetB of MIDPOINT_PLANETS) {
          const posB = (pB.chart.planets as any)[planetB] as NatalPlanetPosition | undefined;
          const bAbs = toAbs(posB);
          if (bAbs == null) continue;

          // Two midpoint axes: short-arc midpoint and its opposition
          let mid = (aAbs + bAbs) / 2;
          // Pick the shorter-arc midpoint
          if (Math.abs(aAbs - bAbs) > 180) mid = (mid + 180) % 360;
          mid = ((mid % 360) + 360) % 360;
          const midOpp = (mid + 180) % 360;

          for (const m of members) {
            if (m === pA || m === pB) continue;
            for (const aPlanet of MIDPOINT_PLANETS) {
              const aPos = (m.chart.planets as any)[aPlanet] as NatalPlanetPosition | undefined;
              const aPosAbs = toAbs(aPos);
              if (aPosAbs == null) continue;
              for (const axis of [mid, midOpp]) {
                let diff = Math.abs(aPosAbs - axis);
                if (diff > 180) diff = 360 - diff;
                if (diff <= MIDPOINT_ORB) {
                  const signIdx = Math.floor(axis / 30);
                  const deg = axis - signIdx * 30;
                  const degree = Math.floor(deg);
                  const minutes = Math.round((deg - degree) * 60);
                  hotspots.push({
                    parentA: pA.chart.name,
                    parentB: pB.chart.name,
                    parentPlanetA: planetA,
                    parentPlanetB: planetB,
                    midpointSign: ZODIAC_SIGNS[signIdx],
                    midpointDegree: degree,
                    midpointMinutes: minutes,
                    activator: m.chart.name,
                    activatorPlanet: aPlanet,
                    orb: Math.round(diff * 100) / 100,
                    interpretation: midpointInterpretation(planetA, planetB, m.chart.name),
                  });
                  break; // don't double-count both axes
                }
              }
            }
          }
        }
      }
    }
  }

  // Dedupe (parentA, parentB, planetA, planetB, activator, activatorPlanet) keeping tightest orb
  const dedup = new Map<string, MidpointHotspot>();
  for (const h of hotspots) {
    const sortedPlanets = [h.parentPlanetA, h.parentPlanetB].sort();
    const key = `${h.parentA}|${h.parentB}|${sortedPlanets.join("/")}|${h.activator}|${h.activatorPlanet}`;
    const prev = dedup.get(key);
    if (!prev || h.orb < prev.orb) dedup.set(key, h);
  }

  return Array.from(dedup.values())
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 8);
}

// ── Section 8: T-Square Completion (Missing Leg) ──────────────────────────────
export interface TSquareCompletion {
  parent: string;
  child: string;
  parentPlanetA: string;
  parentPlanetB: string;
  childPlanet: string;
  apexSign: string;
  apexDegree: number;
  orb: number;
  text: string;
}

const TSQUARE_PARENT_PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"] as const;
const TSQUARE_CHILD_PLANETS = ["Sun", "Moon", "Mars", "Ascendant"] as const;
const SQUARE_ORB = 6;
const APEX_ORB = 3;

export function findTSquareCompletions(
  members: { chart: NatalChart; role: FamilyRole }[],
): TSquareCompletion[] {
  const parents = members.filter((m) => m.role === "parent" || m.role === "grandparent");
  const children = members.filter((m) => m.role === "child");
  const out: TSquareCompletion[] = [];

  for (const p of parents) {
    // Find squares within parent's natal chart
    const squares: { a: string; b: string; aAbs: number; bAbs: number }[] = [];
    for (let i = 0; i < TSQUARE_PARENT_PLANETS.length; i++) {
      for (let j = i + 1; j < TSQUARE_PARENT_PLANETS.length; j++) {
        const pa = (p.chart.planets as any)[TSQUARE_PARENT_PLANETS[i]] as NatalPlanetPosition | undefined;
        const pb = (p.chart.planets as any)[TSQUARE_PARENT_PLANETS[j]] as NatalPlanetPosition | undefined;
        const aAbs = toAbs(pa);
        const bAbs = toAbs(pb);
        if (aAbs == null || bAbs == null) continue;
        let diff = Math.abs(aAbs - bAbs);
        if (diff > 180) diff = 360 - diff;
        if (Math.abs(diff - 90) <= SQUARE_ORB) {
          squares.push({ a: TSQUARE_PARENT_PLANETS[i], b: TSQUARE_PARENT_PLANETS[j], aAbs, bAbs });
        }
      }
    }
    if (!squares.length) continue;

    for (const c of children) {
      let best: TSquareCompletion | null = null;
      for (const sq of squares) {
        // Two apex points: 90° from each planet, picking the points that are
        // ~90° from BOTH simultaneously (i.e., the midpoint of the long arc
        // and its opposition).
        const longMidpoint = ((sq.aAbs + sq.bAbs) / 2 + 90) % 360;
        const apex1 = ((longMidpoint % 360) + 360) % 360;
        const apex2 = (apex1 + 180) % 360;

        for (const cPlanetName of TSQUARE_CHILD_PLANETS) {
          const cPos = (c.chart.planets as any)[cPlanetName] as NatalPlanetPosition | undefined;
          const cAbs = toAbs(cPos);
          if (cAbs == null) continue;
          for (const apex of [apex1, apex2]) {
            let diff = Math.abs(cAbs - apex);
            if (diff > 180) diff = 360 - diff;
            if (diff <= APEX_ORB) {
              const signIdx = Math.floor(apex / 30);
              const apexDeg = apex - signIdx * 30;
              const apexSign = ZODIAC_SIGNS[signIdx];
              const entry: TSquareCompletion = {
                parent: p.chart.name,
                child: c.chart.name,
                parentPlanetA: sq.a,
                parentPlanetB: sq.b,
                childPlanet: cPlanetName,
                apexSign,
                apexDegree: Math.round(apexDeg * 10) / 10,
                orb: Math.round(diff * 100) / 100,
                text: `${c.chart.name}'s ${cPlanetName} at ${Math.round(apexDeg)}° ${apexSign} completes your ${sq.a}/${sq.b} square. They don't just push your buttons, their existence is the catalyst that forces the growth this square has been demanding from you.`,
              };
              if (!best || entry.orb < best.orb) best = entry;
            }
          }
        }
      }
      if (best) out.push(best);
    }
  }
  return out;
}

// ── Section 9: Generational Outer-Planet Gap ──────────────────────────────────
export interface GenerationalGap {
  parent: string;
  child: string;
  planet: "Uranus" | "Neptune" | "Pluto";
  parentSign: string;
  childSign: string;
  text: string;
}

const GENERATIONAL_LOOKUP: Record<string, (parent: string, child: string) => string> = {
  // Pluto
  "Pluto:Virgo>Libra": (_, c) => `You value efficiency and self-improvement (Pluto in Virgo); ${c}'s generation values balance and partnership. Their refusal to grind feels lazy to you, it's actually their generation's correction.`,
  "Pluto:Virgo>Scorpio": (_, c) => `You value useful work and discretion; ${c}'s generation values intensity and exposure. Their dramatic depth isn't excess, it's their generational currency.`,
  "Pluto:Libra>Scorpio": (_, c) => `You value harmony and partnership; ${c}'s generation values raw truth. Their intensity will feel like aggression to you, it's their generation's refusal of niceness.`,
  "Pluto:Scorpio>Sagittarius": (_, c) => `You value depth and privacy (Pluto in Scorpio); ${c}'s generation values bluntness and freedom. Their oversharing isn't disrespect, it's their generation's mission to refuse secrecy.`,
  "Pluto:Scorpio>Capricorn": (_, c) => `You value emotional intensity; ${c}'s generation values structure and legitimacy. Their pragmatism will feel cold, it's their generation's rebuild after collapse.`,
  "Pluto:Sagittarius>Capricorn": (_, c) => `You value freedom and big-picture truth; ${c}'s generation values structure and authority. Their seriousness isn't joyless, it's their generation's job to rebuild what yours questioned.`,
  "Pluto:Sagittarius>Aquarius": (_, c) => `You value belief and expansion; ${c}'s generation values systems and collective change. Their detachment isn't apathy, it's their generation's lens.`,
  "Pluto:Capricorn>Aquarius": (_, c) => `You value hierarchy and proven structure (Pluto in Capricorn); ${c}'s generation values systems-breaking and collective rights. Their disregard for authority isn't rudeness, it's their generation's mission.`,
  "Pluto:Capricorn>Pisces": (_, c) => `You value structure and earned status; ${c}'s generation values dissolution and collective feeling. Their boundary-blurring will feel undisciplined, it's their generation's softening.`,
  // Neptune
  "Neptune:Sagittarius>Capricorn": (_, c) => `You dream of expansion and meaning (Neptune in Sagittarius); ${c}'s generation dreams of legitimate structure. They romanticize what you wanted to escape.`,
  "Neptune:Capricorn>Aquarius": (_, c) => `You dream of solid structures (Neptune in Capricorn); ${c}'s generation dreams of digital collectives. Their online life isn't escapism to them, it's where their idealism lives.`,
  "Neptune:Aquarius>Pisces": (_, c) => `You dream in systems and ideals (Neptune in Aquarius); ${c}'s generation dreams in feeling and merger. Their emotional flooding isn't drama, it's their native language.`,
  "Neptune:Pisces>Aries": (_, c) => `You dream of merging and dissolving (Neptune in Pisces); ${c}'s generation dreams of distinct selves. Their assertion isn't selfish, it's a corrective to the blur.`,
  // Uranus
  "Uranus:Sagittarius>Capricorn": (_, c) => `You rebel through ideas and travel; ${c}'s generation rebels through restructuring institutions. Their seriousness is the new disruption.`,
  "Uranus:Capricorn>Aquarius": (_, c) => `You rebel by rebuilding structures; ${c}'s generation rebels by inventing new networks. Their tech-native instincts aren't a phase.`,
  "Uranus:Aquarius>Pisces": (_, c) => `You rebel through systems and ideals; ${c}'s generation rebels through dissolving the boundaries of identity itself.`,
  "Uranus:Pisces>Aries": (_, c) => `You rebel through dissolution and art; ${c}'s generation rebels through direct, individual action. Their bluntness is the rebellion you didn't make.`,
  "Uranus:Aries>Taurus": (_, c) => `You rebel through speed and disruption; ${c}'s generation rebels through stubborn embodiment and resource refusal. Their slowness is the new rebellion.`,
};

export function findGenerationalGaps(
  members: { chart: NatalChart; role: FamilyRole }[],
): GenerationalGap[] {
  const parents = members.filter((m) => m.role === "parent" || m.role === "grandparent");
  const children = members.filter((m) => m.role === "child");
  const out: GenerationalGap[] = [];
  const seen = new Set<string>();

  for (const p of parents) {
    for (const c of children) {
      for (const planet of ["Uranus", "Neptune", "Pluto"] as const) {
        const pSign = (p.chart.planets as any)[planet]?.sign as string | undefined;
        const cSign = (c.chart.planets as any)[planet]?.sign as string | undefined;
        if (!pSign || !cSign || pSign === cSign) continue;
        const key = `${p.chart.name}|${c.chart.name}|${planet}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const lookupKey = `${planet}:${pSign}>${cSign}`;
        const reverseKey = `${planet}:${cSign}>${pSign}`;
        const fn = GENERATIONAL_LOOKUP[lookupKey] || GENERATIONAL_LOOKUP[reverseKey];
        const text = fn
          ? fn(p.chart.name, c.chart.name)
          : `${planet} ${pSign} (you) vs ${planet} ${cSign} (${c.chart.name}): different generational values. The friction is generational, not personal.`;
        out.push({
          parent: p.chart.name,
          child: c.chart.name,
          planet,
          parentSign: pSign,
          childSign: cSign,
          text,
        });
      }
    }
  }
  return out;
}

// ── Section 10: House Overlays (Hellenistic) ──────────────────────────────────
export interface HouseOverlay {
  fromName: string;
  fromPlanet: "Sun" | "Mars" | "Saturn" | "Jupiter";
  fromSign?: string;
  toName: string;
  house: number;
  category: "hidden" | "angular" | "neutral";
  label: string;
  note: string;
}

const HIDDEN_HOUSES = new Set([6, 8, 12]);
const ANGULAR_HOUSES = new Set([1, 4, 7, 10]);

const OVERLAY_TEXT: Record<string, (from: string, to: string, h: number) => string> = {
  "Sun:hidden": (from, to, h) => `${from}'s Sun lands in ${to}'s ${ordinal(h)} house — their identity activates ${to}'s private, behind-the-scenes life. ${to} may feel pressured to perform around them without knowing why.`,
  "Sun:angular": (from, to, h) => `${from}'s Sun lands on ${to}'s ${ordinal(h)} angle — they visibly shape ${to}'s self-image, home, partnerships, or public role. Their attention literally moves ${to}'s life.`,
  "Mars:hidden": (from, to, h) => `${from}'s Mars lands in ${to}'s ${ordinal(h)} house — their drive triggers ${to}'s hidden frustration, health stress, or unspoken conflicts. The friction won't be named, it will be somatic.`,
  "Mars:angular": (from, to, h) => `${from}'s Mars lands on ${to}'s ${ordinal(h)} angle — they push ${to} into action visibly. Helpful when aligned, exhausting when not.`,
  "Saturn:hidden": (from, to, h) => `${from}'s Saturn lands in ${to}'s ${ordinal(h)} house — they apply quiet, invisible pressure to ${to}'s vulnerabilities. ${to} feels watched or judged without proof.`,
  "Saturn:angular": (from, to, h) => `${from}'s Saturn lands on ${to}'s ${ordinal(h)} angle — they openly structure ${to}'s identity, home, partnerships, or public role. Can feel like support or like a ceiling.`,
  "Jupiter:hidden": (from, to, h) => `${from}'s Jupiter lands in ${to}'s ${ordinal(h)} house — they quietly expand ${to}'s hidden resources or healing. A behind-the-scenes benefactor.`,
  "Jupiter:angular": (from, to, h) => `${from}'s Jupiter lands on ${to}'s ${ordinal(h)} angle — they visibly open doors for ${to} in identity, home, relationships, or career. A clear lift.`,
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function findHouseOverlays(
  members: { chart: NatalChart; role: FamilyRole }[],
): HouseOverlay[] {
  const out: HouseOverlay[] = [];
  const planets: ("Sun" | "Mars" | "Saturn" | "Jupiter")[] = ["Sun", "Mars", "Saturn", "Jupiter"];
  for (const from of members) {
    for (const to of members) {
      if (from.chart.id === to.chart.id) continue;
      if (!to.chart.houseCusps) continue;
      for (const planetName of planets) {
        const planet = (from.chart.planets as any)[planetName] as NatalPlanetPosition | undefined;
        if (!planet?.sign) continue;
        const h = houseOfPlanet(to.chart, planet);
        if (h == null) continue;
        let category: "hidden" | "angular" | "neutral" = "neutral";
        if (HIDDEN_HOUSES.has(h)) category = "hidden";
        else if (ANGULAR_HOUSES.has(h)) category = "angular";
        if (category === "neutral") continue;
        const fn = OVERLAY_TEXT[`${planetName}:${category}`];
        if (!fn) continue;
        out.push({
          fromName: from.chart.name,
          fromPlanet: planetName,
          fromSign: planet.sign,
          toName: to.chart.name,
          house: h,
          category,
          label: category === "hidden" ? "Hidden Impact" : "Visibility / Support",
          note: fn(from.chart.name, to.chart.name, h),
        });
      }
    }
  }
  return out;
}

// ── Section 11: Profection Alignment ──────────────────────────────────────────
export interface ProfectionAlignment {
  perMember: { name: string; age: number; house: number; theme: string }[];
  synergies: { members: string[]; house: number; theme: string; note: string }[];
  clashes: { memberA: string; houseA: number; memberB: string; houseB: number; relation: "square" | "opposition"; note: string }[];
}

const PROFECTION_THEME_SHORT: Record<number, string> = {
  1: "self, body, identity",
  2: "money, resources, security",
  3: "siblings, talking, daily moves",
  4: "home, family, foundation",
  5: "creativity, play, being seen",
  6: "health, work, routines",
  7: "partnerships, one-on-ones",
  8: "shared resources, deep change",
  9: "travel, beliefs, big picture",
  10: "public role, achievement",
  11: "friends, groups, future",
  12: "solitude, rest, hidden things",
};

function ageFromBirthDate(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const [y, mo, d] = birthDate.split("-").map(Number);
  if (!y || !mo || !d) return null;
  const now = new Date();
  let a = now.getFullYear() - y;
  const before = now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d);
  if (before) a--;
  return a >= 0 ? a : null;
}

export function findProfectionAlignment(
  members: { chart: NatalChart; role: FamilyRole }[],
): ProfectionAlignment | null {
  const perMember: ProfectionAlignment["perMember"] = [];
  for (const m of members) {
    const age = ageFromBirthDate(m.chart.birthDate);
    if (age == null) continue;
    const house = (age % 12) + 1;
    perMember.push({
      name: m.chart.name,
      age,
      house,
      theme: PROFECTION_THEME_SHORT[house] ?? "",
    });
  }
  if (perMember.length < 2) return null;

  // Synergy: 2+ members share same profected house
  const houseMap = new Map<number, string[]>();
  for (const p of perMember) {
    if (!houseMap.has(p.house)) houseMap.set(p.house, []);
    houseMap.get(p.house)!.push(p.name);
  }
  const synergies: ProfectionAlignment["synergies"] = [];
  for (const [house, names] of houseMap.entries()) {
    if (names.length >= 2) {
      synergies.push({
        members: names,
        house,
        theme: PROFECTION_THEME_SHORT[house] ?? "",
        note: `${names.join(" and ")} are sharing a ${ordinal(house)}-house year (${PROFECTION_THEME_SHORT[house]}). Aim their effort at the same target — this is the season to plan together.`,
      });
    }
  }

  // Clashes: squares (3 houses apart in 4-cycle) or oppositions (6 apart)
  const clashes: ProfectionAlignment["clashes"] = [];
  for (let i = 0; i < perMember.length; i++) {
    for (let j = i + 1; j < perMember.length; j++) {
      const a = perMember[i];
      const b = perMember[j];
      const diff = Math.abs(a.house - b.house);
      const arc = Math.min(diff, 12 - diff);
      if (arc === 3) {
        clashes.push({
          memberA: a.name, houseA: a.house, memberB: b.name, houseB: b.house,
          relation: "square",
          note: `${a.name}'s ${ordinal(a.house)}-house year (${PROFECTION_THEME_SHORT[a.house]}) squares ${b.name}'s ${ordinal(b.house)}-house year (${PROFECTION_THEME_SHORT[b.house]}). Their priorities will pull in different directions this year — schedule separate time blocks for each, don't try to merge them.`,
        });
      } else if (arc === 6) {
        clashes.push({
          memberA: a.name, houseA: a.house, memberB: b.name, houseB: b.house,
          relation: "opposition",
          note: `${a.name}'s ${ordinal(a.house)}-house year (${PROFECTION_THEME_SHORT[a.house]}) is opposite ${b.name}'s ${ordinal(b.house)}-house year (${PROFECTION_THEME_SHORT[b.house]}). Their needs are mirror-opposite this year — explicit negotiation beats assumption.`,
        });
      }
    }
  }

  return { perMember, synergies, clashes };
}

// ── Section 12: Nodal Destiny ─────────────────────────────────────────────────
export interface NodalDestiny {
  ownerName: string;       // member whose Node is hit
  nodeType: "North" | "South";
  nodeSign?: string;
  contactorName: string;   // member whose Sun/Moon hits the node
  contactorPlanet: "Sun" | "Moon";
  contactorSign?: string;
  orb: number;
  role: "The Teacher" | "The Comfort Zone";
  text: string;
}

const NODAL_ORB = 6;

export function findNodalDestiny(
  members: { chart: NatalChart; role: FamilyRole }[],
): NodalDestiny[] {
  const out: NodalDestiny[] = [];
  for (const owner of members) {
    const north = (owner.chart.planets as any).NorthNode as NatalPlanetPosition | undefined;
    const south = (owner.chart.planets as any).SouthNode as NatalPlanetPosition | undefined;
    const northAbs = toAbs(north);
    const southAbs = toAbs(south);
    for (const contactor of members) {
      if (contactor.chart.id === owner.chart.id) continue;
      for (const planetName of ["Sun", "Moon"] as const) {
        const pos = (contactor.chart.planets as any)[planetName] as NatalPlanetPosition | undefined;
        const pAbs = toAbs(pos);
        if (pAbs == null) continue;

        if (northAbs != null) {
          let diff = Math.abs(pAbs - northAbs);
          if (diff > 180) diff = 360 - diff;
          if (diff <= NODAL_ORB) {
            out.push({
              ownerName: owner.chart.name,
              nodeType: "North",
              nodeSign: north?.sign,
              contactorName: contactor.chart.name,
              contactorPlanet: planetName,
              contactorSign: pos?.sign,
              orb: Math.round(diff * 100) / 100,
              role: "The Teacher",
              text: `${contactor.chart.name}'s ${planetName} sits on ${owner.chart.name}'s North Node. ${contactor.chart.name} is The Teacher — they embody the direction ${owner.chart.name} is here to grow toward. Their presence will feel both magnetic and stretching, because they live the thing ${owner.chart.name} is still becoming.`,
            });
          }
        }
        if (southAbs != null) {
          let diff = Math.abs(pAbs - southAbs);
          if (diff > 180) diff = 360 - diff;
          if (diff <= NODAL_ORB) {
            out.push({
              ownerName: owner.chart.name,
              nodeType: "South",
              nodeSign: south?.sign,
              contactorName: contactor.chart.name,
              contactorPlanet: planetName,
              contactorSign: pos?.sign,
              orb: Math.round(diff * 100) / 100,
              role: "The Comfort Zone",
              text: `${contactor.chart.name}'s ${planetName} sits on ${owner.chart.name}'s South Node. ${contactor.chart.name} is The Comfort Zone — easy, familiar, deeply known, and also the pattern ${owner.chart.name} is meant to evolve beyond. Comfortable, but watch for over-reliance or repeating old loops together.`,
            });
          }
        }
      }
    }
  }
  // Dedupe & sort by tightest orb, cap at 12
  return out.sort((a, b) => a.orb - b.orb).slice(0, 12);
}

// ── Section 13: Sun as Hero's Journey (Developmental Task) ────────────────────
export interface SunDevelopmentalTask {
  name: string;
  sunSign: string;
  task: string;        // "practicing courage"
  reframe: string;     // longer behavioral reframe replacing the trait label
  insteadOf: string;   // the lazy trait label being replaced
}

const SUN_TASK: Record<string, { task: string; insteadOf: string; reframe: (name: string) => string }> = {
  Aries: { task: "practicing courage", insteadOf: "impulsive", reframe: (n) => `${n} isn't impulsive, ${n} is practicing courage. Every burst of "I'll do it" is a rep at trusting their own first move. Reward the trying, even when the move is rough.` },
  Taurus: { task: "practicing steadiness", insteadOf: "stubborn", reframe: (n) => `${n} isn't stubborn, ${n} is practicing steadiness. Their slowness is them learning that their own pace is allowed. Don't rush, give a long runway.` },
  Gemini: { task: "practicing curiosity", insteadOf: "scattered", reframe: (n) => `${n} isn't scattered, ${n} is practicing curiosity. The questions and topic-jumping are how they map the world. Answer the question, don't shut the loop.` },
  Cancer: { task: "practicing belonging", insteadOf: "moody", reframe: (n) => `${n} isn't moody, ${n} is practicing belonging. Their tides are them learning who is safe and who isn't. Stay consistent, don't take the withdrawal personally.` },
  Leo: { task: "practicing being seen", insteadOf: "attention-seeking", reframe: (n) => `${n} isn't attention-seeking, ${n} is practicing being seen. They are learning their light is allowed to take up space. Witness it out loud, don't dim it.` },
  Virgo: { task: "practicing usefulness", insteadOf: "critical", reframe: (n) => `${n} isn't critical, ${n} is practicing usefulness. Noticing what's off is how they contribute. Thank them for the catch before correcting the tone.` },
  Libra: { task: "practicing fairness", insteadOf: "indecisive", reframe: (n) => `${n} isn't indecisive, ${n} is practicing fairness. The pause is them weighing what's right for everyone. Hold the space, don't decide for them.` },
  Scorpio: { task: "practicing depth", insteadOf: "intense", reframe: (n) => `${n} isn't too intense, ${n} is practicing depth. They are learning that nothing surface-level will satisfy them. Meet them at the real layer, don't deflect with small talk.` },
  Sagittarius: { task: "practicing meaning", insteadOf: "restless", reframe: (n) => `${n} isn't restless, ${n} is practicing meaning. The wandering and big questions are them looking for what's true. Engage the big question, don't dismiss it as much.` },
  Capricorn: { task: "practicing responsibility", insteadOf: "serious", reframe: (n) => `${n} isn't too serious, ${n} is practicing responsibility. They are learning what they can hold. Let them carry real things, but explicitly tell them it's safe to be a kid too.` },
  Aquarius: { task: "practicing originality", insteadOf: "weird", reframe: (n) => `${n} isn't weird, ${n} is practicing originality. The "off" choices are them testing if their own mind is allowed. Don't normalize them, ask what they see.` },
  Pisces: { task: "practicing empathy", insteadOf: "spacey", reframe: (n) => `${n} isn't spacey, ${n} is practicing empathy. The drift is them absorbing what's around. Help them name it, don't snap them out of it.` },
};

export function findSunDevelopmentalTasks(
  members: { chart: NatalChart; role: FamilyRole }[],
): SunDevelopmentalTask[] {
  const out: SunDevelopmentalTask[] = [];
  const children = members.filter((m) => m.role === "child");
  for (const c of children) {
    const sun = (c.chart.planets as any).Sun as NatalPlanetPosition | undefined;
    if (!sun?.sign) continue;
    const entry = SUN_TASK[sun.sign];
    if (!entry) continue;
    out.push({
      name: c.chart.name,
      sunSign: sun.sign,
      task: entry.task,
      insteadOf: entry.insteadOf,
      reframe: entry.reframe(c.chart.name),
    });
  }
  return out;
}

// ── Section 14: Family Mission Statement ──────────────────────────────────────
export interface FamilyMissionStatement {
  sentence: string;
  dominantElement: "fire" | "earth" | "air" | "water" | null;
  secondaryElement: "fire" | "earth" | "air" | "water" | null;
  dominantModality: "cardinal" | "fixed" | "mutable" | null;
  elementCounts: { fire: number; earth: number; air: number; water: number };
  modalityCounts: { cardinal: number; fixed: number; mutable: number };
}

const ELEMENT_PHRASE: Record<string, string> = {
  fire: "individual fire (drive, will, spark)",
  earth: "grounded earth (body, work, security)",
  air: "collective air (ideas, words, social fabric)",
  water: "shared water (feeling, intuition, bonding)",
};

const MODALITY_PHRASE: Record<string, string> = {
  cardinal: "while learning to start and lead without burning out",
  fixed: "while learning to hold steady without becoming rigid",
  mutable: "while learning to adapt without losing the thread",
};

const MISSION_PLANETS = ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
const CARDINAL_SET = new Set(["Aries", "Cancer", "Libra", "Capricorn"]);
const FIXED_SET = new Set(["Taurus", "Leo", "Scorpio", "Aquarius"]);
const MUTABLE_SET = new Set(["Gemini", "Virgo", "Sagittarius", "Pisces"]);

export function computeFamilyMissionStatement(
  members: { chart: NatalChart; role: FamilyRole }[],
): FamilyMissionStatement | null {
  if (members.length < 2) return null;
  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 };
  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    for (const pname of MISSION_PLANETS) {
      const sign = planets[pname]?.sign;
      const el = elementOf(sign);
      if (el) elementCounts[el]++;
      if (sign) {
        if (CARDINAL_SET.has(sign)) modalityCounts.cardinal++;
        else if (FIXED_SET.has(sign)) modalityCounts.fixed++;
        else if (MUTABLE_SET.has(sign)) modalityCounts.mutable++;
      }
    }
  }
  const sortedEls = Object.entries(elementCounts).sort((a, b) => b[1] - a[1]);
  const dominantElement = sortedEls[0]?.[1] > 0 ? (sortedEls[0][0] as any) : null;
  const secondaryElement = sortedEls[1]?.[1] > 0 ? (sortedEls[1][0] as any) : null;
  const sortedMods = Object.entries(modalityCounts).sort((a, b) => b[1] - a[1]);
  const dominantModality = sortedMods[0]?.[1] > 0 ? (sortedMods[0][0] as any) : null;

  if (!dominantElement || !secondaryElement) return null;

  const sentence =
    `This family is here to learn how to balance ${ELEMENT_PHRASE[dominantElement]} with ${ELEMENT_PHRASE[secondaryElement]}` +
    (dominantModality ? `, ${MODALITY_PHRASE[dominantModality]}.` : ".");

  return {
    sentence,
    dominantElement,
    secondaryElement,
    dominantModality,
    elementCounts,
    modalityCounts,
  };
}

// ── Section 15: Parental Shadow (Parent planet in Child's 12th) ───────────────
export interface ParentalShadow {
  parent: string;
  child: string;
  parentPlanet: string;
  text: string;
}

const PARENTAL_SHADOW_TEXT: Record<string, (parent: string, child: string) => string> = {
  Sun: (p, c) => `${p}'s identity lands in ${c}'s 12th — your sense of self can feel loud to ${c}'s subconscious. When ${c} seems reactive or withdrawn, check your own internal state first; they may be mirroring what you haven't said yet.`,
  Moon: (p, c) => `${p}'s mood lands in ${c}'s 12th — your unspoken emotional weather hits ${c}'s nervous system before words. Name your own state out loud ("I'm tense, not about you") so ${c} doesn't carry it.`,
  Mercury: (p, c) => `${p}'s thoughts land in ${c}'s 12th — what you don't say still reaches ${c}. If ${c} suddenly seems anxious or shut down, say the held-back sentence yourself.`,
  Venus: (p, c) => `${p}'s relational tension lands in ${c}'s 12th — your unspoken disappointment or longing seeps into ${c}'s sense of being loved. Acknowledge it explicitly so ${c} doesn't absorb it as their fault.`,
  Mars: (p, c) => `${p}'s anger lands in ${c}'s 12th — your suppressed frustration becomes ${c}'s background tension. Name your own irritation out loud and ${c}'s reactivity drops.`,
  Saturn: (p, c) => `${p}'s pressure lands in ${c}'s 12th — your invisible standards become ${c}'s ambient self-doubt. Make your expectations explicit; the silent version is heavier.`,
};

export function findParentalShadows(
  members: { chart: NatalChart; role: FamilyRole }[],
): ParentalShadow[] {
  const parents = members.filter((m) => m.role === "parent" || m.role === "grandparent");
  const children = members.filter((m) => m.role === "child");
  const out: ParentalShadow[] = [];
  for (const c of children) {
    if (!c.chart.houseCusps) continue;
    for (const p of parents) {
      for (const planetName of ["Sun", "Moon", "Mercury", "Venus", "Mars", "Saturn"]) {
        const planet = (p.chart.planets as any)[planetName] as NatalPlanetPosition | undefined;
        if (!planet?.sign) continue;
        const house = houseOfPlanet(c.chart, planet);
        if (house !== 12) continue;
        const fn = PARENTAL_SHADOW_TEXT[planetName];
        if (!fn) continue;
        out.push({
          parent: p.chart.name,
          child: c.chart.name,
          parentPlanet: planetName,
          text: fn(p.chart.name, c.chart.name),
        });
      }
    }
  }
  return out;
}

// ── Section 16: Profection Year-Mates (Current MVP) ───────────────────────────
export interface ProfectionYearMate {
  parent: string;
  mate: string;
  house: number;
  theme: string;
}

export function findProfectionYearMates(
  alignment: ProfectionAlignment | null,
  members: { chart: NatalChart; role: FamilyRole }[],
): ProfectionYearMate[] {
  if (!alignment) return [];
  const roleByName = new Map(members.map((m) => [m.chart.name, m.role]));
  const out: ProfectionYearMate[] = [];
  const seen = new Set<string>();
  for (const a of alignment.perMember) {
    const aRole = roleByName.get(a.name);
    if (aRole !== "parent" && aRole !== "grandparent") continue;
    for (const b of alignment.perMember) {
      if (a.name === b.name) continue;
      if (a.house !== b.house) continue;
      const key = `${a.name}|${b.name}|${a.house}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ parent: a.name, mate: b.name, house: a.house, theme: a.theme });
    }
  }
  return out;
}

// ── Section 17: "So What?" Family Headline ────────────────────────────────────
export interface FamilyHeadline {
  sentence: string;
}

const ELEMENT_HOUSEHOLD_FOCUS: Record<string, string> = {
  fire: "individual growth and forward motion",
  earth: "stability, work, and the physical world",
  air: "ideas, conversation, and social connection",
  water: "emotional bonding and felt safety",
};

function dominantElementForMember(
  m: { chart: NatalChart; role: FamilyRole },
): "fire" | "earth" | "air" | "water" | null {
  const counts = { fire: 0, earth: 0, air: 0, water: 0 };
  const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
  for (const pn of ["Sun", "Moon", "Mercury", "Venus", "Mars"]) {
    const el = elementOf(planets[pn]?.sign);
    if (el) counts[el]++;
  }
  const rising = (m.chart as any).ascendant?.sign;
  const rEl = elementOf(rising);
  if (rEl) counts[rEl] += 2;
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return sorted[0][1] > 0 ? (sorted[0][0] as any) : null;
}

export function computeFamilyHeadline(
  members: { chart: NatalChart; role: FamilyRole }[],
  mission: FamilyMissionStatement | null,
  bridges: BridgeMember[],
): FamilyHeadline | null {
  if (!mission?.dominantElement) return null;
  const dom = mission.dominantElement;

  // Grounding: a member with strongest earth signature; fall back to fixed-modality parent
  let grounding: string | null = null;
  let groundingScore = -1;
  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    let earthScore = 0;
    for (const pn of ["Sun", "Moon", "Mercury", "Venus", "Mars", "Saturn"]) {
      if (elementOf(planets[pn]?.sign) === "earth") earthScore++;
    }
    if (m.role === "parent" || m.role === "grandparent") earthScore += 0.5;
    if (earthScore > groundingScore) {
      groundingScore = earthScore;
      grounding = m.chart.name;
    }
  }

  // Spark: prefer a child who is a fire bridge; else child with dominant fire; else first bridge
  let spark: string | null = null;
  const fireBridge = bridges.find((b) => b.bridgeType === "fire-redirect");
  if (fireBridge) spark = fireBridge.bridge;
  if (!spark) {
    const children = members.filter((m) => m.role === "child");
    const fireChild = children.find((c) => dominantElementForMember(c) === "fire");
    if (fireChild) spark = fireChild.chart.name;
  }
  if (!spark && bridges[0]) spark = bridges[0].bridge;

  const focus = ELEMENT_HOUSEHOLD_FOCUS[dom] ?? "their shared work";
  const groundingClause =
    grounding && grounding !== spark
      ? `, where ${grounding} provides the grounding`
      : "";
  const sparkClause = spark
    ? `${groundingClause ? " and " : ", where "}${spark} acts as the developmental spark`
    : "";

  const sentence =
    `This is a ${dom}-heavy household focused on ${focus}${groundingClause}${sparkClause}.`;

  return { sentence };
}

// ── Master bundle ─────────────────────────────────────────────────────────────
export interface FamilyWeb {
  elementalVoid: ElementalVoid;
  bridges: BridgeMember[];
  triangulation: TriangulationResult;
  mirrors: FamilyMirror[];
  dashboard: RegulationRow[];
  twelfthHouseMirrors: TwelfthHouseMirror[];
  midpointHotspots: MidpointHotspot[];
  tsquareCompletions: TSquareCompletion[];
  generationalGaps: GenerationalGap[];
  houseOverlays: HouseOverlay[];
  profectionAlignment: ProfectionAlignment | null;
  nodalDestiny: NodalDestiny[];
  sunDevelopmentalTasks: SunDevelopmentalTask[];
  missionStatement: FamilyMissionStatement | null;
  parentalShadows: ParentalShadow[];
  profectionYearMates: ProfectionYearMate[];
  headline: FamilyHeadline | null;
}

export function buildFamilyWeb(
  members: { chart: NatalChart; role: FamilyRole }[],
): FamilyWeb {
  const bridges = findBridgeMembers(members);
  const profectionAlignment = findProfectionAlignment(members);
  const missionStatement = computeFamilyMissionStatement(members);
  return {
    elementalVoid: computeElementalVoid(members),
    bridges,
    triangulation: findTriangulations(members),
    mirrors: findInheritedSignatures(members),
    dashboard: buildRegulationDashboard(members),
    twelfthHouseMirrors: findTwelfthHouseMirrors(members),
    midpointHotspots: findMidpointHotspots(members),
    tsquareCompletions: findTSquareCompletions(members),
    generationalGaps: findGenerationalGaps(members),
    houseOverlays: findHouseOverlays(members),
    profectionAlignment,
    nodalDestiny: findNodalDestiny(members),
    sunDevelopmentalTasks: findSunDevelopmentalTasks(members),
    missionStatement,
    parentalShadows: findParentalShadows(members),
    profectionYearMates: findProfectionYearMates(profectionAlignment, members),
    headline: computeFamilyHeadline(members, missionStatement, bridges),
  };
}
