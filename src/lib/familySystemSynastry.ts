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

/** New 3-line structured pair connection (composite tone + optional bridge + optional friction). */
export interface PairConnectionEntry {
  composite?: string; // 1 sentence naming this pair's composite signature + plain-language tone
  bridge?: string;    // strongest tight (≤5° orb) bridge aspect between personal planets, behavioral effect
  friction?: string;  // strongest tight (≤5° orb) friction aspect between personal planets, behavioral effect
  note?: string;      // honest one-liner if no qualifying aspects exist
}

export interface FamilySystemReadingResponse {
  atAGlance?: { name: string; line: string }[]; // REQUIRED: one plain-language pattern line per family member
  childAdaptations: { name: string; line: string; respondsBestWhen?: string[]; inTheMoment?: { scenario: string; actions: string[] }[]; whatMakesItWorse?: string[] }[];
  whatEscalates: { name: string; body: string }[]; // one per family member, written from their perspective
  /** Evidence-gated. May be empty. Each entry must cite a real tight bridge aspect. */
  whatAlreadyWorks?: { pair: string; line: string }[];
  /** REQUIRED for every parent↔child pair. New 3-line structure (no story essays). */
  parentChildConnections?: ({ parent: string; child: string } & PairConnectionEntry)[];
  /** REQUIRED for every unique sibling pair. Same 3-line structure. */
  siblingConnections?: ({ siblingA: string; siblingB: string } & PairConnectionEntry)[];
  /** @deprecated kept for back-compat; ignored on render. */
  householdRegulationPattern?: string;
  /** @deprecated kept for back-compat; ignored on render. */
  whatHelps?: string;
  /** @deprecated kept for back-compat; ignored on render. */
  siblingPressurePoints?: { name: string; body: string }[];
  /** @deprecated kept for back-compat; ignored on render. */
  householdInTheMoment?: { scenario: string; actions: string[] }[];
  /** @deprecated kept for back-compat; ignored on render. */
  householdMakesItWorse?: string[];
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
  for (let i = 0; i < children.length; i++) {
    for (let j = i + 1; j < children.length; j++) {
      pairComposites.push({
        pairType: "sibling",
        nameA: children[i].chart.name,
        nameB: children[j].chart.name,
        composite: householdComposite([children[i], children[j]]),
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
  Aries: "may act fast, push back, or resist direction",
  Leo: "may get louder and take up more space to be seen",
  Sagittarius: "may speak bluntly or bolt to get room to breathe",
  Cancer: "may pull inward and protect what feels safe",
  Scorpio: "may go quiet and intense, watching before reacting",
  Pisces: "may drift, get overwhelmed, or disappear into their own world",
  Gemini: "may talk faster, argue points, and try to outthink the moment",
  Libra: "may try to smooth things over or step back to weigh sides",
  Aquarius: "may detach, observe coolly, and refuse to be pushed",
  Taurus: "may dig in, slow everything down, and refuse to be moved",
  Virgo: "may try to fix it, list the problems, or critique the chaos",
  Capricorn: "may shut down emotion and switch into get-it-done mode",
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
// Deterministic "Responds Best To" line per member (no AI, no scenarios).
// One line per person describing the conditions they handle best, derived from
// Moon sign primarily, with Mars/Mercury tiebreakers to keep every line unique.
// ─────────────────────────────────────────────────────────────────────────────

const RESPONDS_BEST_BY_MOON: Record<string, string> = {
  Aries: "responds best to short, direct requests and being given a way to move",
  Leo: "responds best to being acknowledged first, then asked",
  Sagittarius: "responds best to being given a reason and room to choose",
  Cancer: "responds best to a soft tone and a private check-in, not a public one",
  Scorpio: "responds best to honesty, no surprises, and time to come back on their own",
  Pisces: "responds best to lower volume, fewer transitions, and one thing at a time",
  Gemini: "responds best to talking it through and being asked, not told",
  Libra: "responds best to fairness, choices, and time to think before answering",
  Aquarius: "responds best to space, logic, and not being pushed for emotion on demand",
  Taurus: "responds best to slower pacing and warning before a change",
  Virgo: "responds best to clear instructions, a reason, and a private correction",
  Capricorn: "responds best to being trusted with the task and not micromanaged",
};

const MARS_RESPONDS_MOD: Record<string, string> = {
  Aries: ", and to physical movement before talking",
  Leo: ", and to being given the lead on something visible",
  Sagittarius: ", and to being outside or moving",
  Cancer: ", and to food, comfort, or a quiet room",
  Scorpio: ", and to one trusted person, not a group",
  Pisces: ", and to quiet sensory input",
  Gemini: ", and to a question instead of a command",
  Libra: ", and to being asked their opinion",
  Aquarius: ", and to being left alone briefly first",
  Taurus: ", and to a hands-on task",
  Virgo: ", and to a clear next step",
  Capricorn: ", and to a defined goal",
};

export function buildRespondsBestForGroup(
  members: { id: string; chart: NatalChart }[]
): Record<string, string> {
  const out: Record<string, string> = {};
  const used = new Set<string>();

  for (const m of members) {
    const planets = m.chart.planets as Record<string, NatalPlanetPosition | undefined>;
    const moon = planets.Moon?.sign;
    const base = (moon && RESPONDS_BEST_BY_MOON[moon]) || "responds best to a calm tone and one thing at a time";
    let line = base;

    if (used.has(line)) {
      const mars = planets.Mars?.sign;
      const mod = mars ? MARS_RESPONDS_MOD[mars] : undefined;
      if (mod) line = `${base}${mod}`;
    }
    if (used.has(line)) {
      const merc = planets.Mercury?.sign;
      const mod = merc ? MERCURY_TONE[merc] : undefined;
      if (mod) line = `${line} ${mod}`;
    }
    used.add(line);
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
