/**
 * Strength-Based Contract
 * ------------------------------------------------------------------
 * A closing box for the Soul Agreements reading. Deterministic: built
 * from real chart placements (dignity, angularity, supportive aspects)
 * plus the reading's own summary fields. No AI call, no jargon, no
 * invented life details.
 *
 * Calculate like an astrologer. Explain like a human.
 */

import { NatalChart } from "@/hooks/useNatalChart";
import { computeAllSignals, PlanetHouseInfo } from "@/lib/narrativeAnalysisEngine";

export interface StrengthContract {
  headline: string;
  /** Short, plain sentence naming the person's most reliable capacity. */
  coreStrength: string;
  /** 3 to 5 concrete strengths with the chart reason behind each. */
  strengths: Array<{ title: string; chartReason: string; plain: string }>;
  /** How they can use these on purpose. */
  howToUse: string[];
  /** What the strength costs when it runs unchecked. */
  costWhenOverused: string;
  /** The commitment line, written in first person. */
  commitment: string;
}

const DOMICILE: Record<string, string[]> = {
  Sun: ["Leo"], Moon: ["Cancer"], Mercury: ["Gemini", "Virgo"],
  Venus: ["Taurus", "Libra"], Mars: ["Aries", "Scorpio"],
  Jupiter: ["Sagittarius", "Pisces"], Saturn: ["Capricorn", "Aquarius"],
};
const EXALTATION: Record<string, string> = {
  Sun: "Aries", Moon: "Taurus", Mercury: "Virgo", Venus: "Pisces",
  Mars: "Capricorn", Jupiter: "Cancer", Saturn: "Libra",
};

const HOUSE_ARENA: Record<number, string> = {
  1: "how you show up and start things",
  2: "how you earn, hold and value what is yours",
  3: "how you talk, learn and handle daily contact with people",
  4: "home, family and the private base you run everything from",
  5: "creative work, play and what you make for its own sake",
  6: "daily work, routines and taking care of the details",
  7: "one-to-one relationships and partnership",
  8: "shared money, trust and situations that ask for real honesty",
  9: "teaching, travel, belief and the long view",
  10: "public work, responsibility and what you get known for",
  11: "groups, friendships and long-range goals",
  12: "quiet, behind-the-scenes work and inner life",
};

const PLANET_STRENGTH: Record<string, { title: string; plain: string; use: string; cost: string }> = {
  Sun: {
    title: "Steady sense of self",
    plain: "You can hold a direction without needing everyone to agree with it first.",
    use: "Say what you are choosing before you ask for input.",
    cost: "You can push past your own tiredness and call it commitment.",
  },
  Moon: {
    title: "Emotional read on a room",
    plain: "You pick up on what people are actually feeling, usually before they say it.",
    use: "Name what you notice out loud instead of quietly managing it.",
    cost: "You can end up carrying other people's moods as if they were your job.",
  },
  Mercury: {
    title: "Clear thinking under pressure",
    plain: "You can take a messy situation and put it into words other people can follow.",
    use: "Write the plan down early. Your clarity is most useful before the decision, not after.",
    cost: "You can talk yourself out of a good instinct by over-explaining it.",
  },
  Venus: {
    title: "Ability to make things feel good",
    plain: "You know how to make a room, a project or a relationship pleasant enough that people stay in it.",
    use: "Use it to set the tone at the start, not to smooth things over at the end.",
    cost: "You can trade honesty for harmony without noticing you did it.",
  },
  Mars: {
    title: "Willingness to act",
    plain: "When something needs to be done, you move, and you can handle the friction that comes with moving.",
    use: "Pick the one thing that matters and go first. You are the one who breaks the stall.",
    cost: "You can start before you check whether this is your fight.",
  },
  Jupiter: {
    title: "Ability to see the bigger version",
    plain: "You can look at a small situation and see what it could grow into, which makes other people braver.",
    use: "Say the bigger version out loud. People need someone to raise the ceiling.",
    cost: "You can overpromise because the big picture feels closer than it is.",
  },
  Saturn: {
    title: "Follow-through",
    plain: "You finish things other people abandon, and you can tolerate the boring middle part.",
    use: "Take the piece of work that needs consistency over months, not enthusiasm for a week.",
    cost: "You can hold yourself to a standard you would never hand to anyone else.",
  },
  Uranus: {
    title: "Willingness to do it differently",
    plain: "You notice the rule nobody is questioning, and you are not afraid to break it.",
    use: "Offer the alternative early, while there is still time to change course.",
    cost: "You can reject a workable plan just because it is the expected one.",
  },
  Neptune: {
    title: "Imagination and compassion",
    plain: "You can feel your way into someone else's experience, which makes people trust you quickly.",
    use: "Put it into something concrete: writing, images, care work, music.",
    cost: "You can lose the edge between their situation and yours.",
  },
  Pluto: {
    title: "Ability to stay in hard truth",
    plain: "You do not flinch from the real version of a situation, which is why people bring you the serious things.",
    use: "Be the person who says the thing everyone is avoiding, once, plainly.",
    cost: "You can go all-in on control when you feel the ground moving.",
  },
};

const has = (p: PlanetHouseInfo | undefined): p is PlanetHouseInfo => Boolean(p && p.sign);

function dignityNote(planet: string, sign: string): string | null {
  if (DOMICILE[planet]?.includes(sign)) return `${planet} is in its own sign (${sign}), so it works without much strain`;
  if (EXALTATION[planet] === sign) return `${planet} is exalted in ${sign}, so it tends to show up at its best`;
  return null;
}

const SUPPORTIVE = new Set(["trine", "sextile", "Trine", "Sextile"]);

export function buildStrengthContract(
  chart: NatalChart,
  summary?: { whatToBuild?: string; whatToGive?: string; integration?: string },
): StrengthContract {
  const signals = computeAllSignals(chart);
  const ph = signals.planetHouses;
  const find = (name: string) => ph.find((p) => p.planet === name);

  type Scored = { planet: string; sign: string; house: number; score: number; reasons: string[] };
  const scored: Scored[] = [];

  for (const planet of Object.keys(PLANET_STRENGTH)) {
    const info = find(planet);
    if (!has(info)) continue;
    let score = 0;
    const reasons: string[] = [];

    const dig = dignityNote(planet, info.sign);
    if (dig) { score += 3; reasons.push(dig); }

    if ([1, 4, 7, 10].includes(info.house)) {
      score += 2;
      reasons.push(`it sits in your ${info.house}th house, one of the four most visible places in a chart`);
    }

    const support = signals.natalAspects.filter(
      (a) => (a.planet1 === planet || a.planet2 === planet) && SUPPORTIVE.has(a.type),
    );
    if (support.length) {
      score += Math.min(support.length, 3);
      const other = support[0].planet1 === planet ? support[0].planet2 : support[0].planet1;
      reasons.push(`it has an easy aspect to ${other}, so the two work together instead of fighting`);
    }

    if (planet === "Sun" || planet === "Moon") score += 1;

    if (score > 0) scored.push({ planet, sign: info.sign, house: info.house, score, reasons });
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, 4);

  // Fallback: if nothing scored (sparse chart), use Sun and Moon plainly.
  if (top.length === 0) {
    for (const planet of ["Sun", "Moon"]) {
      const info = find(planet);
      if (has(info)) top.push({ planet, sign: info.sign, house: info.house, score: 1, reasons: [] });
    }
  }

  const strengths = top.map(({ planet, sign, house, reasons }) => {
    const meta = PLANET_STRENGTH[planet];
    const arena = HOUSE_ARENA[house] ?? "the area of life this house covers";
    const reason = reasons.length
      ? `${planet} in ${sign} in the ${house}th house: ${reasons.join(", and ")}.`
      : `${planet} in ${sign} in the ${house}th house.`;
    return {
      title: meta.title,
      chartReason: reason,
      plain: `${meta.plain} It shows up most in ${arena}.`,
    };
  });

  const lead = top[0] ? PLANET_STRENGTH[top[0].planet] : PLANET_STRENGTH.Sun;
  const leadArena = top[0] ? (HOUSE_ARENA[top[0].house] ?? "your daily life") : "your daily life";

  const howToUse = top.map(({ planet }) => PLANET_STRENGTH[planet].use);
  if (summary?.whatToBuild) howToUse.push(summary.whatToBuild);
  if (summary?.whatToGive) howToUse.push(summary.whatToGive);

  return {
    headline: "Strength-Based Contract",
    coreStrength: `${lead.plain} That is the capacity this chart keeps returning to, and it is strongest in ${leadArena}.`,
    strengths,
    howToUse: howToUse.slice(0, 6),
    costWhenOverused: `${lead.cost} The strength is real. The cost shows up when you use it instead of asking for help.`,
    commitment:
      summary?.integration
        ? `I will lead with what already works in me, use it on purpose rather than on reflex, and stop when it turns into overwork. ${summary.integration}`
        : "I will lead with what already works in me, use it on purpose rather than on reflex, and stop when it turns into overwork.",
  };
}
