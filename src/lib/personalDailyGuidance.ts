// Personal Daily Guidance
// Composes a chart-specific reflection + journal prompt tuned to today's Moon
// (phase + sign) filtered through the user's natal chart:
//   • which natal house today's Moon is transiting for them
//   • the tightest Moon-to-natal aspect currently in orb
//   • the developmental instruction of the phase (seed vs. release vs. review)
//
// Two-day, same-sign, same-phase should NOT read identically because the Moon
// moves ~13° per day and both the activated house and the tightest natal
// aspect will shift.

import type { NatalChart } from "@/hooks/useNatalChart";
import type { TransitAspect } from "@/lib/transitAspects";

const SIGN_NAMES = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
];

const signIndex = (sign?: string): number => {
  if (!sign) return -1;
  return SIGN_NAMES.findIndex((s) => s.toLowerCase() === sign.toLowerCase());
};

interface SimplePos { sign?: string; degree?: number; minutes?: number }
const toAbs = (p?: SimplePos): number | null => {
  if (!p?.sign) return null;
  const i = signIndex(p.sign);
  if (i < 0) return null;
  return i * 30 + (p.degree || 0) + (p.minutes || 0) / 60;
};

const buildHouseCalc = (chart: NatalChart) => {
  const cusps = chart.houseCusps || {};
  const cuspLons: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = (cusps as any)[`house${i}`] as SimplePos | undefined;
    const abs = toAbs(cusp);
    if (abs == null) return null;
    cuspLons.push(abs);
  }
  return (absDeg: number): number => {
    for (let i = 0; i < 12; i++) {
      const nextI = (i + 1) % 12;
      let start = cuspLons[i];
      let end = cuspLons[nextI];
      if (end < start) end += 360;
      let d = absDeg;
      if (d < start) d += 360;
      if (d >= start && d < end) return i + 1;
    }
    return 1;
  };
};

// What each house means as a life arena the Moon is currently lighting up.
const HOUSE_ARENA: Record<number, { arena: string; verb: string }> = {
  1: { arena: "your body, your energy, how you're showing up", verb: "how you feel in your own skin" },
  2: { arena: "money, self-worth, and what feels secure", verb: "what you value and what you're worth" },
  3: { arena: "conversations, siblings, the daily-message layer of your life", verb: "the sentences running through your head" },
  4: { arena: "home, family, your emotional foundation", verb: "what your inner house feels like today" },
  5: { arena: "creativity, play, kids, romance", verb: "where you're free to be seen and enjoyed" },
  6: { arena: "work routines, health, daily systems", verb: "the small daily loops running your life" },
  7: { arena: "close partnerships, one-on-ones, mirrors", verb: "who's mirroring you back today" },
  8: { arena: "intimacy, shared money, buried truths", verb: "what's underneath the surface" },
  9: { arena: "meaning, travel, belief, the big picture", verb: "the story you're telling about your life" },
  10: { arena: "career, reputation, public-facing self", verb: "how you're being seen out in the world" },
  11: { arena: "friends, community, future goals", verb: "your people and your long game" },
  12: { arena: "solitude, dreams, what's dissolving", verb: "what's asking for quiet and endings" },
};

// Phase-specific instruction (what the developmental moment is asking of you).
type PhaseKey =
  | "New Moon" | "Waxing Crescent" | "First Quarter" | "Waxing Gibbous"
  | "Full Moon" | "Waning Gibbous" | "Last Quarter" | "Waning Crescent"
  | "Balsamic";

const PHASE_INSTRUCTION: Record<PhaseKey, { verb: string; write: string }> = {
  "New Moon":        { verb: "plant a quiet intention around", write: "the seed you want to plant here" },
  "Waxing Crescent": { verb: "take one small brave step in",   write: "one small brave step you can take this week in" },
  "First Quarter":   { verb: "push through friction inside",   write: "the friction you're meeting in" },
  "Waxing Gibbous":  { verb: "refine and adjust your approach to", write: "what needs adjusting in" },
  "Full Moon":       { verb: "let something be fully seen in", write: "what's coming into full view in" },
  "Waning Gibbous":  { verb: "name what you've actually learned about", write: "what you've actually learned recently about" },
  "Last Quarter":    { verb: "break the old pattern inside",   write: "the pattern you're ready to break in" },
  "Waning Crescent": { verb: "rest and metabolize what happened in", write: "what still needs metabolizing in" },
  "Balsamic":        { verb: "release and close the chapter in", write: "what you're closing the door on in" },
};

// Optional: a felt-sense flavor per sign for the Moon (kept short — one clause).
const SIGN_MOOD: Record<string, string> = {
  Aries: "sharp, fast, a little impatient",
  Taurus: "slower, more sensory, wanting to settle",
  Gemini: "chatty, curious, a little scattered",
  Cancer: "tender, family-adjacent, close to the skin",
  Leo: "warmer, more visible, wanting to be seen",
  Virgo: "detail-focused, tidy, ready to fix",
  Libra: "relational, comparing, weighing fairness",
  Scorpio: "quieter and deeper, everything more loaded",
  Sagittarius: "restless, big-picture, ready to escape the room",
  Capricorn: "more serious, more responsible, quietly heavy",
  Aquarius: "cooler, more mental, pulling back to observe",
  Pisces: "dreamy, blurred, harder to hold a straight line",
};

const normalizePhase = (phaseName: string, isBalsamic: boolean): PhaseKey => {
  if (isBalsamic) return "Balsamic";
  if ((PHASE_INSTRUCTION as any)[phaseName]) return phaseName as PhaseKey;
  return "Waxing Crescent";
};

const pickTopMoonAspect = (aspects: TransitAspect[]): TransitAspect | null => {
  if (!aspects?.length) return null;
  const moonOnes = aspects.filter((a) => a.transitPlanet === "Moon");
  if (!moonOnes.length) return null;
  // Prefer smallest orb (as float).
  return [...moonOnes].sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))[0];
};

// Contact language per aspect type — short felt sentence.
const CONTACT_LANGUAGE = (aspect: string, natalPlanet: string): string => {
  const a = aspect.toLowerCase();
  const p = natalPlanet;
  if (a === "conjunction") return `sitting right on top of your natal ${p}, lighting it up from inside`;
  if (a === "opposition") return `standing across from your natal ${p}, asking for balance between the two`;
  if (a === "square")     return `pressing on your natal ${p}, creating the useful friction that forces a decision`;
  if (a === "trine")      return `flowing easily with your natal ${p}, opening a soft channel you can use`;
  if (a === "sextile")    return `offering your natal ${p} a doorway you have to consciously walk through`;
  return `in contact with your natal ${p}`;
};

export interface PersonalDailyGuidance {
  reflection: string;   // 2–3 sentences, personal
  journalPrompt: string; // one direct writing prompt
}

export const buildPersonalDailyGuidance = (params: {
  moonSign: string;
  moonDegree: number;      // 0–29
  moonMinutes: number;     // 0–59
  moonPhaseName: string;
  isBalsamic: boolean;
  chart?: NatalChart | null;
  transitAspects?: TransitAspect[];
}): PersonalDailyGuidance => {
  const { moonSign, moonDegree, moonMinutes, moonPhaseName, isBalsamic, chart, transitAspects } = params;
  const phase = normalizePhase(moonPhaseName, isBalsamic);
  const phaseData = PHASE_INSTRUCTION[phase];
  const mood = SIGN_MOOD[moonSign] || "distinctive";

  // No chart → non-personal fallback (still phase-aware, no gratitude default).
  if (!chart) {
    return {
      reflection:
        `The Moon is in ${moonSign} today — ${mood} — moving through a ${phase} rhythm. ` +
        `That combination asks you to ${phaseData.verb} the part of life this sign tends to touch. ` +
        `Notice where the day tugs on you.`,
      journalPrompt: `Write about ${phaseData.write} the ${moonSign} part of your life right now.`,
    };
  }

  // Compute activated house for today's Moon in the user's chart.
  const idx = signIndex(moonSign);
  const moonAbs = idx >= 0 ? idx * 30 + moonDegree + moonMinutes / 60 : null;
  const calcHouse = buildHouseCalc(chart);
  const house = moonAbs != null && calcHouse ? calcHouse(moonAbs) : null;
  const houseInfo = house ? HOUSE_ARENA[house] : null;

  const top = pickTopMoonAspect(transitAspects || []);

  // Sentence 1: what today's Moon actually is for THIS chart.
  const s1 = houseInfo
    ? `Today's ${moonSign} Moon is transiting your ${ordinal(house!)} house — ${houseInfo.arena}. That's where the day lands for you.`
    : `Today's ${moonSign} Moon is coloring your day ${mood}.`;

  // Sentence 2: contact language if we have a tight Moon aspect.
  const s2 = top
    ? `It's ${CONTACT_LANGUAGE(top.aspect, top.natalPlanet)} (orb ${top.orb}°), so ${moodedInstruction(top.aspect, houseInfo?.verb || "your day")}.`
    : `The mood is ${mood}, so pace yourself accordingly.`;

  // Sentence 3: phase instruction, applied to the house arena.
  const s3 = houseInfo
    ? `As a ${phase}, this is the moment to ${phaseData.verb} ${houseInfo.arena}.`
    : `As a ${phase}, this is the moment to ${phaseData.verb} what today is putting in front of you.`;

  // Journal prompt: phase-driven + house-specific, not generic gratitude.
  const prompt = houseInfo
    ? `Write about ${phaseData.write} ${houseInfo.arena}. What have you noticed in the last few days that you want to name honestly?`
    : `Write about ${phaseData.write} the ${moonSign} part of your life right now.`;

  return {
    reflection: `${s1} ${s2} ${s3}`,
    journalPrompt: prompt,
  };
};

const ordinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const moodedInstruction = (aspect: string, arena: string): string => {
  const a = aspect.toLowerCase();
  if (a === "conjunction") return `expect ${arena} to feel amplified — pay attention to what wants to be said`;
  if (a === "opposition") return `expect ${arena} to show up as a pull between two sides — don't force resolution today`;
  if (a === "square")     return `expect ${arena} to press on you — the friction is asking for a real choice, not a compromise`;
  if (a === "trine")      return `${arena} should flow more easily today — use the opening while it's here`;
  if (a === "sextile")    return `${arena} is offering you an opportunity, but only if you take the small deliberate step`;
  return `stay tuned to ${arena}`;
};
