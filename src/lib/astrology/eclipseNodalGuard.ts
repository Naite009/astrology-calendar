import type { ZodiacSign } from "@/lib/astrology/signTeacher";

// North Node sign by series (for the years shown in the app)
const NORTH_BY_SERIES: Record<string, ZodiacSign> = {
  "Aries-Libra": "Aries",
  "Virgo-Pisces": "Pisces",
  "Leo-Aquarius": "Leo",
  "Cancer-Capricorn": "Cancer",
};

interface EclipseLike {
  sign: ZodiacSign;
  series: string;
  nodal: "north" | "south";
}

export function normalizeEclipseNodal<T extends EclipseLike>(e: T): T {
  const northSign = NORTH_BY_SERIES[e.series];
  if (!northSign) return e;

  const expected: "north" | "south" = e.sign === northSign ? "north" : "south";

  if (e.nodal !== expected) {
    return { ...e, nodal: expected };
  }
  return e;
}
