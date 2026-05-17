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
  members: { id: string; chart: NatalChart }[]
): Record<string, string> {
  const out: Record<string, string> = {};
  const used = new Set<string>();

  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    const base = basePressureLine(m.chart);
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
      if (sunSign) line = `${line} (showing up in their own ${sunSign} way)`;
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
    : "softening and timing before the content";
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
  return ordered.slice(0, 2);
}

export function buildRespondsBestForGroup(
  members: { id: string; chart: NatalChart }[]
): Record<string, string> {
  const out: Record<string, string> = {};
  const used = new Set<string>();
  const usedFragments = new Set<string>();

  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    const moon = planets.Moon?.sign;
    const lead = (moon && MOON_LEAD[moon]) || "a calm tone and one thing at a time";

    const opener = sectOpener(m.chart);
    const secondaries = pickSecondaries(planets, usedFragments);
    const caveat = saturnLuminaryCaveat(planets);

    // Compose: "responds best to <lead>" + optional sect opener merged + secondaries + caveat
    const parts: string[] = [`responds best to ${lead}`];
    if (opener && !lead.includes(opener.split(" ")[0])) parts[0] = `responds best to ${lead}, plus ${opener}`;
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
