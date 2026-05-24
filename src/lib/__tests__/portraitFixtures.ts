// Per-chart regression fixtures for Ike, Ben, and Lauren.
// Run with: `bunx tsx src/lib/__tests__/portraitFixtures.ts`
// Vitest is not configured in this project, so this file exposes pure
// fixtures + a runnable smoke check. Any future edit to portraitComposer.ts
// should be diffed against the snapshot output of this script.

import { composePortrait } from "../portraitComposer";
import { detectChartSignature } from "../portraitSignature";
import { buildChildPortrait } from "../childPortrait";
import type { NatalChart } from "@/hooks/useNatalChart";

// Minimal chart stubs sufficient for the composer. Real charts contain more
// fields; these are the slices the portrait pipeline actually reads.
function mk(planets: Record<string, { sign: string; degree: number; minutes?: number; house?: number }>): NatalChart {
  return {
    id: "fix",
    name: "fixture",
    birthDate: "2015-01-01",
    birthTime: "12:00",
    birthLocation: "NYC",
    planets: planets as any,
  } as NatalChart;
}

export const FIXTURES: Record<string, NatalChart> = {
  // Ike: Mars Aries 1st, Mercury Pisces 12th, Merc/Jup mutual reception, Sun/Pluto tight.
  ike: mk({
    Sun: { sign: "Scorpio", degree: 10, house: 8 },
    Moon: { sign: "Sagittarius", degree: 5, house: 2 },
    Mercury: { sign: "Pisces", degree: 14, house: 12 },
    Mars: { sign: "Aries", degree: 4, house: 1 },
    Jupiter: { sign: "Gemini", degree: 22, house: 3 },
    Saturn: { sign: "Capricorn", degree: 18, house: 10 },
    Pluto: { sign: "Capricorn", degree: 12, house: 10 },
    Ascendant: { sign: "Aries", degree: 1 },
  }),
  // Ben: Mercury/Saturn mutual reception (Mercury Capricorn, Saturn Virgo).
  ben: mk({
    Sun: { sign: "Leo", degree: 8, house: 5 },
    Moon: { sign: "Cancer", degree: 12, house: 4 },
    Mercury: { sign: "Capricorn", degree: 6, house: 11 },
    Mars: { sign: "Scorpio", degree: 20, house: 8 },
    Jupiter: { sign: "Taurus", degree: 3, house: 2 },
    Saturn: { sign: "Virgo", degree: 14, house: 7 },
    Pluto: { sign: "Scorpio", degree: 1, house: 8 },
    Ascendant: { sign: "Pisces", degree: 4 },
  }),
  // Lauren: Mercury Libra 12th + Mars Scorpio 1st (the original test case).
  lauren: mk({
    Sun: { sign: "Scorpio", degree: 3, house: 1 },
    Moon: { sign: "Pisces", degree: 17, house: 5 },
    Mercury: { sign: "Libra", degree: 28, house: 12 },
    Mars: { sign: "Scorpio", degree: 9, house: 1 },
    Jupiter: { sign: "Capricorn", degree: 4, house: 3 },
    Saturn: { sign: "Capricorn", degree: 10, house: 3 },
    Pluto: { sign: "Scorpio", degree