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

// ─────────────────────────────────────────────────────────────────────────────
// Child Moon Profile (deterministic, no AI)
// ─────────────────────────────────────────────────────────────────────────────

export interface ChildMoonProfile {
  sign: string;
  house: number | null;
  headline: string;
  safetyNeeds: string[];
  stressSignals: string[];
  parentTip: string;
}

const MOON_PROFILES: Record<string, Omit<ChildMoonProfile, "sign" | "house">> = {
  Aries: {
    headline: "Aries Moon: needs to act, not be managed",
    safetyNeeds: [
      "space to move and decide quickly",
      "direct honest responses with no sugarcoating",
      "to feel like their anger is allowed",
    ],
    stressSignals: [
      "sudden outbursts that end fast",
      "physical restlessness when upset",
      "shutting down if they feel controlled",
    ],
    parentTip: "This Moon hears 'calm down' as an attack. Match their directness instead.",
  },
  Taurus: {
    headline: "Taurus Moon: needs consistency above everything",
    safetyNeeds: [
      "predictable routines they can count on",
      "physical comfort, food, softness, warmth",
      "no sudden changes without warning",
    ],
    stressSignals: [
      "digging in and refusing to move",
      "comfort eating or hoarding objects",
      "extreme stubbornness when feeling unsafe",
    ],
    parentTip: "Disrupting their routine without notice lands harder than you think. Warn early, warn often.",
  },
  Gemini: {
    headline: "Gemini Moon: needs to talk it through",
    safetyNeeds: [
      "to verbalize feelings out loud, even if scattered",
      "variety, same routine every day is draining",
      "a parent who asks questions and actually listens",
    ],
    stressSignals: [
      "talking too fast, jumping topics when anxious",
      "nervous humor or deflection",
      "going quiet suddenly after being very verbal",
    ],
    parentTip: "They process by speaking. Let them talk the feeling out before offering a solution.",
  },
  Cancer: {
    headline: "Cancer Moon: needs to feel like home is safe",
    safetyNeeds: [
      "a parent who remembers small emotional details",
      "to cry without being told to stop",
      "physical closeness especially after conflict",
    ],
    stressSignals: [
      "clinginess or sudden withdrawal",
      "retreating to their room and going silent",
      "stomach complaints or physical symptoms when emotionally overwhelmed",
    ],
    parentTip: "They track the emotional temperature of the home constantly. Your unspoken stress becomes their anxiety.",
  },
  Leo: {
    headline: "Leo Moon: needs to be witnessed and celebrated",
    safetyNeeds: [
      "direct expressions of pride and specific praise",
      "to feel special, not just loved, but seen as uniquely wonderful",
      "an audience for their feelings and creations",
    ],
    stressSignals: [
      "performing distress rather than stating it",
      "dramatic escalation when ignored",
      "sudden deflation after not getting a reaction",
    ],
    parentTip: "Generic praise lands flat. Name what you actually noticed. 'I saw how hard you worked on that' hits differently than 'good job.'",
  },
  Virgo: {
    headline: "Virgo Moon: needs order and to feel useful",
    safetyNeeds: [
      "to understand why rules exist",
      "to contribute, being given real responsibilities",
      "a calm, organized environment without chaos",
    ],
    stressSignals: [
      "picking at themselves or others when anxious",
      "over-explaining or apologizing excessively",
      "stomach tension or physical complaints under stress",
    ],
    parentTip: "Criticism lands 10x harder than you intend. This Moon is already harder on themselves than you will ever be.",
  },
  Libra: {
    headline: "Libra Moon: needs harmony and to feel fair treatment",
    safetyNeeds: [
      "to feel like decisions affecting them are explained fairly",
      "no yelling or prolonged tension in the home",
      "to have their perspective heard even when the answer is no",
    ],
    stressSignals: [
      "people-pleasing and suppressing their own feelings to keep peace",
      "difficulty making decisions under pressure",
      "indirect communication about what's actually bothering them",
    ],
    parentTip: "They will absorb household conflict as their own fault. Name out loud that disagreements between adults are not their responsibility.",
  },
  Scorpio: {
    headline: "Scorpio Moon: needs depth and total honesty",
    safetyNeeds: [
      "to never be lied to, even kindly",
      "emotional intensity to be matched, not minimized",
      "privacy that is genuinely respected",
    ],
    stressSignals: [
      "testing you with small provocations to see if you'll stay",
      "going completely silent and unreachable",
      "obsessive thinking about a perceived betrayal",
    ],
    parentTip: "Half-truths feel like betrayal to this Moon. If they sense you're managing them, trust breaks fast and rebuilds slowly.",
  },
  Sagittarius: {
    headline: "Sagittarius Moon: needs freedom and big-picture meaning",
    safetyNeeds: [
      "space to explore, question, and disagree",
      "honest answers to big questions without being dismissed",
      "adventures, even small ones, that expand their world",
    ],
    stressSignals: [
      "restlessness and pushing every boundary when constrained",
      "philosophical arguments as a form of emotional distance",
      "bluntness that sounds rude but is actually distress",
    ],
    parentTip: "Telling them what to believe backfires. Give them the reasoning and let them arrive at their own conclusion.",
  },
  Capricorn: {
    headline: "Capricorn Moon: needs competence and to be taken seriously",
    safetyNeeds: [
      "to be given real responsibility, not baby tasks",
      "practical demonstrations of love more than verbal ones",
      "to not be babied, they find it embarrassing",
    ],
    stressSignals: [
      "shutting emotions down completely and going cold",
      "workaholism or over-achievement as emotional management",
      "difficulty asking for help even when genuinely struggling",
    ],
    parentTip: "They experience emotional coddling as disrespect. Treat them as capable and they will be.",
  },
  Aquarius: {
    headline: "Aquarius Moon: needs independence and to not be emotionally crowded",
    safetyNeeds: [
      "space to be different without it being a problem",
      "to be reasoned with, not emotionally pressured",
      "friendships and a social world outside the family",
    ],
    stressSignals: [
      "detaching completely and going intellectual when overwhelmed",
      "sudden contrarian behavior as a bid for autonomy",
      "flatness or numbness rather than visible distress",
    ],
    parentTip: "Pushing for emotional closeness pushes them away. Create low-pressure side-by-side time instead of face-to-face intensity.",
  },
  Pisces: {
    headline: "Pisces Moon: needs gentleness and to feel spiritually held",
    safetyNeeds: [
      "a soft emotional environment, raised voices are physically distressing",
      "creative outlets, music, art, imagination",
      "to feel like their sensitivity is a gift, not a problem",
    ],
    stressSignals: [
      "dissolving into the emotions of others around them",
      "retreating into fantasy or screens when overwhelmed",
      "difficulty naming what is wrong because it is everything at once",
    ],
    parentTip: "This Moon absorbs the emotional atmosphere like a sponge. Their distress is often not even theirs, it is everyone else's they have collected.",
  },
};

export function buildChildMoonProfile(childChart: NatalChart): ChildMoonProfile | null {
  const moon = (childChart.planets as Record<string, NatalPlanetPosition | undefined>)?.Moon;
  if (!moon?.sign) return null;
  const profile = MOON_PROFILES[moon.sign];
  if (!profile) return null;
  const calcHouse = buildHouseCalc(childChart);
  const moonAbs = toAbsoluteDegree(moon);
  const house = moonAbs != null && calcHouse ? calcHouse(moonAbs) : null;
  return { sign: moon.sign, house, ...profile };
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

export interface SoulContract {
  whyTheseTwo: string;
  childLesson: string;
  parentLesson: string;
  contractSentence: string;
}

export interface MoonBridgeAi {
  summary: string;
  translation: string;
}

export type MoonBridgeConnection = "bridge" | "gap" | "mirror";

export interface MoonBridge {
  parentMoonLabel: string;
  childMoonLabel: string;
  connectionType: MoonBridgeConnection;
}

export interface PressureProfile {
  title: string;
  astrology: string;
  plainEnglish: string;
  whatTheParentMayNotice: string[];
  whatHelps: string[];
}

export type RepairProfile = PressureProfile;

export interface PairReadingResponse {
  essence: string[];
  ageNote: string;
  sections: PairReadingSection[];
  practice: string;
  soulContract?: SoulContract | null;
  moonBridge?: MoonBridgeAi | null;
  pressureProfile?: PressureProfile | null;
  repairProfile?: RepairProfile | null;
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
    toBirthDate: toChart.birthDate,
    parentMoonSummary: moonSummary(fromChart),
    childMoonSummary: moonSummary(toChart),
    aspects,
  };
}

const MOON_SHORT_DESCRIPTORS: Record<string, string> = {
  Aries: "acts first, feels second",
  Taurus: "needs consistency and physical comfort",
  Gemini: "processes by talking",
  Cancer: "absorbs the emotional atmosphere",
  Leo: "needs to be witnessed",
  Virgo: "manages feelings through doing",
  Libra: "keeps feelings under the surface to preserve peace",
  Scorpio: "feels everything intensely, shows little",
  Sagittarius: "needs freedom to feel safe",
  Capricorn: "manages feelings by staying in control",
  Aquarius: "detaches to self-protect",
  Pisces: "absorbs everyone else's feelings",
};

function ordinalShort(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function moonLabel(chart: NatalChart): string | null {
  const moon = (chart.planets as Record<string, NatalPlanetPosition | undefined>)?.Moon;
  if (!moon?.sign) return null;
  const desc = MOON_SHORT_DESCRIPTORS[moon.sign] ?? "";
  const calcHouse = buildHouseCalc(chart);
  const abs = toAbsoluteDegree(moon);
  const house = abs != null && calcHouse ? calcHouse(abs) : null;
  const housePart = house ? ` in the ${ordinalShort(house)}` : "";
  return `${moon.sign}${housePart}${desc ? `, ${desc}` : ""}`;
}

function moonSummary(chart: NatalChart): string {
  const moon = (chart.planets as Record<string, NatalPlanetPosition | undefined>)?.Moon;
  if (!moon?.sign) return "Moon: unknown";
  const calcHouse = buildHouseCalc(chart);
  const abs = toAbsoluteDegree(moon);
  const house = abs != null && calcHouse ? calcHouse(abs) : null;
  return `Moon in ${moon.sign}${house ? `, ${ordinalShort(house)} house` : ""}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Contract Overlap (deterministic, no AI)
// ─────────────────────────────────────────────────────────────────────────────

export type ContractOverlapType = "node-axis" | "chiron-core" | "moon-mirror";

export interface ContractOverlapFlag {
  type: ContractOverlapType;
  headline: string;
  body: string;
}

const OPPOSITE_SIGN: Record<string, string> = {
  Aries: "Libra", Libra: "Aries",
  Taurus: "Scorpio", Scorpio: "Taurus",
  Gemini: "Sagittarius", Sagittarius: "Gemini",
  Cancer: "Capricorn", Capricorn: "Cancer",
  Leo: "Aquarius", Aquarius: "Leo",
  Virgo: "Pisces", Pisces: "Virgo",
};

function aspectBetween(
  a: NatalPlanetPosition | undefined,
  b: NatalPlanetPosition | undefined,
  maxOrb = 8,
): { name: string; orb: number } | null {
  const d1 = toAbsoluteDegree(a);
  const d2 = toAbsoluteDegree(b);
  if (d1 == null || d2 == null) return null;
  let diff = Math.abs(d1 - d2);
  if (diff > 180) diff = 360 - diff;
  for (const asp of ASPECTS) {
    const orb = Math.abs(diff - asp.angle);
    if (orb <= maxOrb) return { name: asp.name, orb };
  }
  return null;
}

export function buildContractOverlap(
  parentChart: NatalChart,
  childChart: NatalChart,
): { flags: ContractOverlapFlag[] } {
  const flags: ContractOverlapFlag[] = [];
  const pp = parentChart.planets as Record<string, NatalPlanetPosition | undefined>;
  const cp = childChart.planets as Record<string, NatalPlanetPosition | undefined>;
  const parentName = parentChart.name;
  const childName = childChart.name;

  // Condition 1 — Node Axis Handoff
  // Parent SouthNode = opposite of NorthNode
  const parentNN = pp.NorthNode?.sign;
  const childNN = cp.NorthNode?.sign;
  if (parentNN && childNN) {
    const parentSN = OPPOSITE_SIGN[parentNN];
    if (parentSN && (parentSN === childNN || OPPOSITE_SIGN[parentSN] === childNN)) {
      flags.push({
        type: "node-axis",
        headline: `${parentName}'s past is ${childName}'s future`,
        body: `Your South Node in ${parentSN} marks a pattern you are learning to move beyond. ${childName}'s North Node in ${childNN} is the direction they are growing toward. You are living proof of what they are becoming — which means your own growth directly models their path.`,
      });
    }
  }

  // Condition 2 — Chiron-Core Activation
  const chironHit =
    aspectBetween(pp.Chiron, cp.Sun) ||
    aspectBetween(pp.Chiron, cp.Moon) ||
    aspectBetween(cp.Chiron, pp.Sun) ||
    aspectBetween(cp.Chiron, pp.Moon);
  if (chironHit) {
    flags.push({
      type: "chiron-core",
      headline: "Your sensitive spot is where they grow",
      body: `The place in your chart that carries your deepest sensitivity directly aspects ${childName}'s core identity. This is not an accident. The things that activate your own uncertainty are the exact areas where they need you to have worked on yourself. Your growth here is their permission slip.`,
    });
  }

  // Condition 3 — Moon Mirror
  const moonAsp = aspectBetween(pp.Moon, cp.Moon);
  if (
    moonAsp &&
    (moonAsp.name === "conjunction" || moonAsp.name === "square" || moonAsp.name === "opposition")
  ) {
    const parentMoonSign = pp.Moon?.sign;
    const childMoonSign = cp.Moon?.sign;
    if (parentMoonSign && childMoonSign) {
      flags.push({
        type: "moon-mirror",
        headline: "You feel the world differently — and that is the point",
        body: `Your Moon in ${parentMoonSign} and ${childName}'s Moon in ${childMoonSign} do not naturally speak the same emotional language. This creates friction that is actually the curriculum. You are each here to stretch into a way of feeling that does not come naturally. The frustration between you is the lesson, not a sign something is wrong.`,
      });
    }
  }

  return { flags };
}

export function buildMoonBridge(
  parentChart: NatalChart,
  childChart: NatalChart,
  existingRows: FamilyAspectRow[],
): MoonBridge | null {
  const parentLabel = moonLabel(parentChart);
  const childLabel = moonLabel(childChart);
  if (!parentLabel || !childLabel) return null;

  const moonRow = existingRows.find(
    (r) => r.fromPlanet === "Moon" && r.toPlanet === "Moon" && r.orb <= 8,
  );
  let connectionType: MoonBridgeConnection;
  if (!moonRow) {
    connectionType = "gap";
  } else if (moonRow.aspect === "trine" || moonRow.aspect === "sextile") {
    connectionType = "bridge";
  } else {
    connectionType = "mirror";
  }

  return {
    parentMoonLabel: parentLabel,
    childMoonLabel: childLabel,
    connectionType,
  };
}

