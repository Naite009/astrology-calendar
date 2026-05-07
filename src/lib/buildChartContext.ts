/**
 * Shared chart-context builder used by the Ask pipeline AND by any other
 * surface that wants to send a question to the `ask-astrology` edge function
 * (e.g. the Cosmic Weather email). Extracted verbatim from AskView so both
 * paths produce IDENTICAL context — there is no second template engine to
 * drift out of sync with the ephemeris.
 */

import * as Astronomy from "astronomy-engine";
import {
  getPlanetaryPositions,
  isPlanetRetrograde,
} from "./astrology";
import { calculateTransitAspects } from "./transitAspects";
import { calculateNatalAstrocartography } from "./natalAstrocartography";
import { calculateAstrocartography } from "./solarReturnAstrocartography";
import { buildAskValidationFactsBlock } from "./askValidationFacts";
import { formatLocationTitleCase } from "./locationFormat";
import { formatDateMMDDYYYY } from "./localDate";
import { findMatchingSolarReturn } from "./findMatchingSolarReturn";
import type { NatalChart } from "@/hooks/useNatalChart";
import type { SolarReturnChart } from "@/hooks/useSolarReturnChart";

const ZODIAC = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

const TRADITIONAL_RULERS: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

const PLANET_BODIES: Record<string, any> = {
  mercury: Astronomy.Body.Mercury, venus: Astronomy.Body.Venus, mars: Astronomy.Body.Mars,
  jupiter: Astronomy.Body.Jupiter, saturn: Astronomy.Body.Saturn, uranus: Astronomy.Body.Uranus,
  neptune: Astronomy.Body.Neptune, pluto: Astronomy.Body.Pluto,
};

function displayBirthDate(date?: string) {
  return formatDateMMDDYYYY(date) || date || "";
}

export function buildChartContext(
  chart: NatalChart | null,
  timingContext = "",
  srOverride: SolarReturnChart | null | undefined = undefined,
  opts: {
    solarReturnCharts?: SolarReturnChart[];
    activeChartId?: string;
  } = {},
): string {
  if (!chart) return "No chart data available.";
  const planets = chart.planets || {};
  const houseCusps = chart.houseCusps || {};
  let context = `Chart for ${chart.name}:\n`;
  context += `Birth: ${displayBirthDate(chart.birthDate)}`;
  if (chart.birthTime) context += ` at ${chart.birthTime}`;
  if (chart.birthLocation) context += ` in ${formatLocationTitleCase(chart.birthLocation)}`;
  context += "\n\nNATAL Planetary Positions (with calculated house placements):\n";

  const cuspLongitudes: number[] = [];
  if (Object.keys(houseCusps).length > 0) {
    for (let i = 1; i <= 12; i++) {
      const cusp = (houseCusps as any)[`house${i}`];
      if (cusp && typeof cusp === "object" && "sign" in cusp) {
        const c = cusp as { sign: string; degree: number; minutes?: number };
        cuspLongitudes.push(ZODIAC.indexOf(c.sign) * 30 + c.degree + (c.minutes || 0) / 60);
      }
    }
  }
  const calcHouse = (absDeg: number): number | null => {
    if (cuspLongitudes.length !== 12) return null;
    for (let i = 0; i < 12; i++) {
      const nextI = (i + 1) % 12;
      let start = cuspLongitudes[i];
      let end = cuspLongitudes[nextI];
      if (end < start) end += 360;
      let d = absDeg;
      if (d < start) d += 360;
      if (d >= start && d < end) return i + 1;
    }
    return 1;
  };

  const h1Override = (houseCusps as any)?.house1;
  const h7Override = (houseCusps as any)?.house7;
  const h10Override = (houseCusps as any)?.house10;
  const h4Override = (houseCusps as any)?.house4;
  const angleOverrides: Record<string, { sign: string; degree: number; minutes?: number }> = {};
  if (h1Override?.sign) angleOverrides.Ascendant = h1Override;
  if (h7Override?.sign) angleOverrides.Descendant = h7Override;
  if (h10Override?.sign) angleOverrides.Midheaven = h10Override;
  if (h4Override?.sign) angleOverrides.IC = h4Override;
  const planetEntries = Object.entries(planets) as Array<[string, any]>;
  for (const angleName of Object.keys(angleOverrides)) {
    if (!planetEntries.some(([n]) => n === angleName)) {
      planetEntries.push([angleName, angleOverrides[angleName]]);
    }
  }
  planetEntries.forEach(([planet, data]) => {
    const override = angleOverrides[planet];
    const source = override ?? data;
    if (source && typeof source === "object" && "sign" in source) {
      const pos = source as { sign: string; degree: number; minutes?: number; isRetrograde?: boolean };
      if (!ZODIAC.includes(pos.sign)) return;
      if (planet === "Lilith" || planet === "Juno") {
        if (typeof pos.degree !== "number" || pos.degree < 0 || pos.degree >= 30) return;
      }
      const absDeg = ZODIAC.indexOf(pos.sign) * 30 + pos.degree + (pos.minutes || 0) / 60;
      const house = override
        ? (planet === "Ascendant" ? 1 : planet === "Descendant" ? 7 : planet === "Midheaven" ? 10 : planet === "IC" ? 4 : calcHouse(absDeg))
        : calcHouse(absDeg);
      if ((planet === "Lilith" || planet === "Juno") && house == null) return;
      context += `- ${planet}: ${pos.degree}°${pos.minutes || 0}' ${pos.sign}`;
      if (house) context += ` (House ${house})`;
      if ((pos as any).isRetrograde) context += " (R)";
      context += "\n";
    }
  });

  // House cusps
  if (Object.keys(houseCusps).length > 0) {
    context += "\nHouse Cusps (with traditional rulers):\n";
    for (let i = 1; i <= 12; i++) {
      const cusp = (houseCusps as any)[`house${i}`];
      if (cusp && "sign" in cusp) {
        const ruler = TRADITIONAL_RULERS[cusp.sign] || "Unknown";
        context += `- House ${i}: ${cusp.degree}° ${cusp.sign} — ruled by ${ruler}\n`;
      }
    }
  }

  // Current transits + transit-to-natal aspects (THIS is what cosmic-weather emails care about)
  context += "\n--- CURRENT TRANSITS (today's sky) ---\n";
  try {
    const now = new Date();
    const nowPlanets = getPlanetaryPositions(now);
    const signGlyphMap: Record<string, string> = {
      "♈": "Aries", "♉": "Taurus", "♊": "Gemini", "♋": "Cancer", "♌": "Leo", "♍": "Virgo",
      "♎": "Libra", "♏": "Scorpio", "♐": "Sagittarius", "♑": "Capricorn", "♒": "Aquarius", "♓": "Pisces",
    };
    Object.entries(nowPlanets).forEach(([key, val]: [string, any]) => {
      if (["sun","moon","mercury","venus","mars","jupiter","saturn","uranus","neptune","pluto"].includes(key) && val) {
        const sign = val.signName || signGlyphMap[val.sign] || val.sign || "Unknown";
        const deg = typeof val.degree === "number" ? val.degree.toFixed(1) : val.degree || 0;
        let line = `- Transiting ${key.charAt(0).toUpperCase() + key.slice(1)}: ${deg}° ${sign}`;
        const body = PLANET_BODIES[key];
        if (body) {
          try { if (isPlanetRetrograde(body, now)) line += " (R)"; } catch {}
        }
        context += line + "\n";
      }
    });
    try {
      const transitAspects = calculateTransitAspects(now, nowPlanets, chart);
      if (transitAspects.length > 0) {
        context += "\n--- ACTIVE TRANSIT ASPECTS TO NATAL CHART ---\n";
        const sorted = [...transitAspects].sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));
        for (const ta of sorted.slice(0, 15)) {
          context += `- Transiting ${ta.transitPlanet} ${ta.transitDegree.toFixed(1)}° ${ta.transitSign} ${ta.symbol} Natal ${ta.natalPlanet} ${ta.natalDegree.toFixed(1)}° ${ta.natalSign} (orb: ${ta.orb}°) — ${ta.aspect}\n`;
        }
      }
    } catch {}
  } catch {}

  context += buildAskValidationFactsBlock(chart);
  if (timingContext) context += timingContext;

  // Natal astrocartography (light)
  try {
    const astrocarto = calculateNatalAstrocartography(chart);
    if (astrocarto) context += "\n" + astrocarto.contextString;
  } catch {}

  // Optional SR block
  const currentSR =
    srOverride !== undefined
      ? srOverride
      : findMatchingSolarReturn(opts.solarReturnCharts || [], chart, opts.activeChartId || "");
  if (currentSR) {
    context += `\n--- SOLAR RETURN ${currentSR.solarReturnYear} ---\n`;
    if ((currentSR as any).solarReturnDateTime) context += `Exact SR moment: ${(currentSR as any).solarReturnDateTime}\n`;
    if ((currentSR as any).solarReturnLocation) context += `SR location: ${(currentSR as any).solarReturnLocation}\n`;
    try {
      const srAstrocarto = calculateAstrocartography(currentSR, chart);
      if (srAstrocarto && srAstrocarto.topCities.length > 0 && srAstrocarto.bestBeneficCity) {
        context += `Best overall city this year: ${srAstrocarto.bestBeneficCity}\n`;
      }
    } catch {}
  }

  return context;
}
