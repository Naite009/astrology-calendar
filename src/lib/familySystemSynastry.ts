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

export interface FamilySystemReadingResponse {
  householdRegulationPattern: string; // how parent(s) set tone, conflict style, repair pattern
  childAdaptations: { name: string; line: string; respondsBestWhen?: string[] }[]; // one per child
  siblingPressurePoints: { name: string; body: string }[]; // one per child, written from that child's perspective
  whatEscalates: { name: string; body: string }[]; // one per family member, written from their perspective
  whatHelps: string; // realistic, low-pressure practices for THIS family
  error?: string;
}

export function buildFamilySystemPayload(
  members: FamilyMemberInput[],
  data: FamilySystemData,
) {
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
  };
}
