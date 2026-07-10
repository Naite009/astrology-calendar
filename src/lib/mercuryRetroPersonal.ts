// Personalized Mercury Retrograde impact.
// Given a natal chart and the sign(s) Mercury retrogrades through, returns:
//   - which natal house(s) that sign activates (via cusps)
//   - which natal planets sit in the retrograde sign (getting re-worked)
//   - the sign-specific "reviewing / watch for / do this" guidance
//
// Falls back gracefully when no chart or no house cusps are present.

import type { NatalChart } from "@/hooks/useNatalChart";
import {
  MERCURY_RETRO_BY_SIGN,
  type MercuryRetroSignGuidance,
} from "@/lib/mercuryRetroGuidance";

const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const signIndex = (sign?: string): number => {
  if (!sign) return -1;
  return SIGN_NAMES.findIndex((s) => s.toLowerCase() === sign.toLowerCase());
};

interface Pos { sign?: string; degree?: number; minutes?: number }

const toAbs = (p?: Pos): number | null => {
  if (!p?.sign) return null;
  const i = signIndex(p.sign);
  if (i < 0) return null;
  return i * 30 + (p.degree || 0) + (p.minutes || 0) / 60;
};

// Return house number (1-12) containing the given absolute ecliptic longitude,
// based on the chart's 12 house cusps. Returns null if cusps are missing.
const houseForLongitude = (chart: NatalChart, absDeg: number): number | null => {
  const cusps = chart.houseCusps;
  if (!cusps) return null;
  const cuspLons: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = (cusps as any)[`house${i}`] as Pos | undefined;
    const abs = toAbs(cusp);
    if (abs == null) return null;
    cuspLons.push(abs);
  }
  for (let i = 0; i < 12; i++) {
    let start = cuspLons[i];
    let end = cuspLons[(i + 1) % 12];
    if (end < start) end += 360;
    let d = absDeg;
    if (d < start) d += 360;
    if (d >= start && d < end) return i + 1;
  }
  return null;
};

const HOUSE_ARENA: Record<number, string> = {
  1: "your body, identity, and how you show up",
  2: "money, values, and what feels secure",
  3: "conversations, siblings, everyday communication",
  4: "home, family, your emotional foundation",
  5: "creativity, romance, kids, self-expression",
  6: "work routines, health, daily systems",
  7: "close partnerships and one-on-ones",
  8: "intimacy, shared money, buried truths",
  9: "meaning, travel, belief, big picture",
  10: "career, reputation, public-facing self",
  11: "friends, community, future goals",
  12: "solitude, dreams, endings, what's dissolving",
};

const ordinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// The 10 core bodies most people care about for a Mercury Rx sweep.
const CORE_BODIES: Array<keyof NatalChart["planets"]> = [
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
  "NorthNode", "Chiron", "Ascendant",
];

const planetsInSign = (chart: NatalChart, sign: string): string[] => {
  const target = sign.toLowerCase();
  const hits: string[] = [];
  for (const key of CORE_BODIES) {
    const p = chart.planets?.[key];
    if (p?.sign && p.sign.toLowerCase() === target) {
      hits.push(String(key));
    }
  }
  return hits;
};

export interface PersonalRetroImpact {
  sign: string;
  guidance?: MercuryRetroSignGuidance;
  houseNumber: number | null;
  houseArena: string | null;
  houseLabel: string | null; // "3rd house — conversations, siblings…"
  natalHits: string[]; // natal bodies in that sign
}

/**
 * Build the personalization payload for a single retrograde sign.
 * Uses 15° of the sign as the representative longitude for house lookup —
 * good enough for a quick "this lights up your Nth house" summary.
 */
export const getPersonalRetroImpact = (
  chart: NatalChart | null | undefined,
  sign: string,
): PersonalRetroImpact => {
  const guidance = MERCURY_RETRO_BY_SIGN[sign];
  let houseNumber: number | null = null;
  let houseArena: string | null = null;
  let natalHits: string[] = [];

  if (chart) {
    const idx = signIndex(sign);
    if (idx >= 0) {
      const mid = idx * 30 + 15;
      houseNumber = houseForLongitude(chart, mid);
      if (houseNumber != null) houseArena = HOUSE_ARENA[houseNumber] ?? null;
    }
    natalHits = planetsInSign(chart, sign);
  }

  return {
    sign,
    guidance,
    houseNumber,
    houseArena,
    houseLabel:
      houseNumber != null
        ? `${ordinal(houseNumber)} house — ${houseArena}`
        : null,
    natalHits,
  };
};

/**
 * One-paragraph personal Mercury retrograde sentence for daily guidance.
 * Reads: "Mercury retrograde is in Cancer, transiting your 4th house — home,
 * family, your emotional foundation. It's reworking your natal Moon in Cancer.
 * Do this: <sign-specific action>."
 */
export const buildPersonalMercuryRxSentence = (
  chart: NatalChart | null | undefined,
  mercurySign: string,
): string => {
  const impact = getPersonalRetroImpact(chart, mercurySign);
  const parts: string[] = [`Mercury retrograde is in ${mercurySign}.`];

  if (chart) {
    if (impact.houseLabel) {
      parts.push(`It's transiting your ${impact.houseLabel}.`);
    }
    if (impact.natalHits.length > 0) {
      parts.push(
        `It's reworking your natal ${impact.natalHits.join(", ")} in ${mercurySign}.`,
      );
    } else if (impact.houseNumber != null) {
      parts.push(
        `You don't have natal planets in ${mercurySign}, so the pressure lands on the house itself, not a planet.`,
      );
    }
  }

  if (impact.guidance) {
    parts.push(`Do this: ${impact.guidance.doThis}`);
  }

  return parts.join(" ");
};
