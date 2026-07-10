// Shared house lookup: given a natal chart with 12 cusps and an absolute
// ecliptic longitude (0–360), returns the house number (1–12) or null when
// cusps are missing / incomplete.
//
// Also exports absolute-longitude helpers used across personalizers.

import type { NatalChart } from "@/hooks/useNatalChart";

export const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export const signIndex = (sign?: string): number => {
  if (!sign) return -1;
  return SIGN_NAMES.findIndex((s) => s.toLowerCase() === sign.toLowerCase());
};

export interface AbsPosInput {
  sign?: string;
  degree?: number;
  minutes?: number;
}

export const toAbsoluteLongitude = (p?: AbsPosInput | null): number | null => {
  if (!p?.sign) return null;
  const i = signIndex(p.sign);
  if (i < 0) return null;
  return i * 30 + (p.degree || 0) + (p.minutes || 0) / 60;
};

export const houseForLongitude = (
  chart: NatalChart | null | undefined,
  absDeg: number | null | undefined,
): number | null => {
  if (!chart?.houseCusps || absDeg == null || Number.isNaN(absDeg)) return null;
  const cuspLons: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = (chart.houseCusps as any)[`house${i}`];
    const abs = toAbsoluteLongitude(cusp);
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

export const ordinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const HOUSE_ARENA: Record<number, string> = {
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
