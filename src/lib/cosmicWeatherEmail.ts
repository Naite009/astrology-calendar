/**
 * Cosmic Weather email — dedicated, lightweight pipeline.
 *
 * Uses the new `cosmic-weather-email` edge function (NOT the multi-section
 * ask-astrology pipeline, which force-injects "Timing Windows", "Modal
 * Balance", and "Today's Summary" sections that don't belong in an email).
 */

import { formatLocalDateKey } from "./localDate";
import { formatSkyBlockForEmail } from "./cosmicWeatherSkyBlock";
import { buildMorningDigest } from "./cosmicWeatherMorningDigest";
import { getPlanetaryPositions, calculateDailyAspects, getMoonPhase } from "./astrology";
import { calculateTransitAspects } from "./transitAspects";
import { getTransitPlanetHouse } from "./houseCalculations";
import { supabase } from "@/integrations/supabase/client";
import type { NatalChart } from "@/hooks/useNatalChart";
import type { SolarReturnChart } from "@/hooks/useSolarReturnChart";

const SLOW_PLANETS = new Set(["Pluto", "Neptune", "Uranus", "Saturn", "Jupiter", "Chiron"]);
const PERSONAL_TARGETS = new Set([
  "Sun", "Moon", "Mercury", "Venus", "Mars",
  "Ascendant", "Midheaven", "Descendant", "IC",
]);

async function fetchWeatherTodayParts(
  date: Date,
  natalChart: NatalChart | null,
  recipientName: string | undefined,
  signal?: AbortSignal,
): Promise<{ cause: string; effect: string; bestUse: string }> {
  const empty = { cause: "", effect: "", bestUse: "" };
  if (!natalChart) return empty;
  try {
    const transitPositions = getPlanetaryPositions(date);
    const transits = calculateTransitAspects(date, transitPositions, natalChart) as any[];
    const moon: any = (transitPositions as any).moon;
    const transitMoonSign = (moon?.signName || moon?.sign || "").toString();
    const transitMoonHouse = moon
      ? getTransitPlanetHouse(transitMoonSign, moon.degree ?? 0, natalChart)
      : null;

    const moonHits = transits
      .filter((t) => t.transitPlanet === "Moon")
      .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));
    const topMoonAspect = moonHits[0] || null;

    // ALL outer-planet transits to personal points within 3° orb. We send
    // the full list (not just the tightest) so the AI can synthesize what
    // they MEAN TOGETHER, instead of writing about one in isolation.
    const longerHits = transits
      .filter((t) =>
        SLOW_PLANETS.has(t.transitPlanet) &&
        PERSONAL_TARGETS.has(t.natalPlanet) &&
        parseFloat(t.orb) <= 3.0
      )
      .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))
      .slice(0, 6);

    if (!transitMoonSign) return empty;

    const payload = {
      recipientName: recipientName || natalChart.name,
      dateLabel: date.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      }),
      transitMoonSign,
      transitMoonHouse,
      topMoonAspect: topMoonAspect && {
        natalPlanet: topMoonAspect.natalPlanet,
        aspect: topMoonAspect.aspect,
        natalSign: topMoonAspect.natalSign,
        natalHouse: topMoonAspect.natalHouse ?? null,
        orb: topMoonAspect.orb,
      },
      // Full active outer-transit set, ordered tightest first.
      outerTransits: longerHits.map((t) => ({
        transitPlanet: t.transitPlanet,
        aspect: t.aspect,
        natalPlanet: t.natalPlanet,
        natalSign: t.natalSign,
        natalHouse: t.natalHouse ?? null,
        orb: t.orb,
        applying: t.applying,
      })),
      // Backward-compat single-aspect field (deprecated; AI should ignore
      // when outerTransits is present and non-empty).
      topLongerTransit: longerHits[0] && {
        transitPlanet: longerHits[0].transitPlanet,
        aspect: longerHits[0].aspect,
        natalPlanet: longerHits[0].natalPlanet,
        natalSign: longerHits[0].natalSign,
        natalHouse: longerHits[0].natalHouse ?? null,
        orb: longerHits[0].orb,
        applying: longerHits[0].applying,
      },
    };

    const { data, error } = await supabase.functions.invoke("your-weather-today", {
      body: payload,
    });
    if (signal?.aborted) return empty;
    if (error) {
      console.warn("your-weather-today edge fn error:", error);
      return empty;
    }
    const d = (data as any) || {};
    return {
      cause: String(d.cause || "").trim(),
      effect: String(d.effect || d.text || "").trim(),
      bestUse: String(d.bestUse || "").trim(),
    };
  } catch (e) {
    console.warn("your-weather-today compute error:", e);
    return empty;
  }
}

async function fetchCollectiveProse(
  date: Date,
  signal?: AbortSignal,
): Promise<string> {
  try {
    const positions = getPlanetaryPositions(date);
    const aspects = calculateDailyAspects(positions) as any[];
    const moonPhase = getMoonPhase(date);
    // Send the 5 tightest sky aspects (was 3). The model needs enough signal
    // to write something specific to TODAY rather than generic Saturday copy.
    const topAspects = [...aspects]
      .filter(a => parseFloat(a.orb) <= 6)
      .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))
      .slice(0, 5)
      .map(a => ({
        planet1: a.planet1,
        planet2: a.planet2,
        type: a.type,
        orb: a.orb,
        applying: a.applying,
      }));
    const retrogrades: string[] = [];
    for (const key of ["mercury", "jupiter", "saturn", "uranus", "neptune", "pluto"]) {
      const p = (positions as any)[key];
      if (p?.isRetrograde) retrogrades.push(key.charAt(0).toUpperCase() + key.slice(1));
    }
    // Personal-planet positions (sign only) so the AI can ground the copy
    // in concrete sky placements rather than abstract day-shape claims.
    const personalPositions: Record<string, string> = {};
    for (const key of ["sun", "moon", "mercury", "venus", "mars"]) {
      const p: any = (positions as any)[key];
      if (p?.signName) personalPositions[key.charAt(0).toUpperCase() + key.slice(1)] = p.signName;
    }
    const payload = {
      dateLabel: date.toLocaleDateString("en-US", {
        weekday: "long", month: "long", day: "numeric", year: "numeric",
      }),
      moonPhaseName: moonPhase.phaseName,
      moonSign: (positions as any).moon?.signName || "",
      personalPositions,
      topAspects,
      retrogrades,
    };
    const { data, error } = await supabase.functions.invoke("cosmic-weather-collective", {
      body: payload,
    });
    if (signal?.aborted) return "";
    if (error) {
      console.warn("cosmic-weather-collective edge fn error:", error);
      return "";
    }
    return String((data as any)?.text || "").trim();
  } catch (e) {
    console.warn("cosmic-weather-collective compute error:", e);
    return "";
  }
}
    return String((data as any)?.text || "").trim();
  } catch (e) {
    console.warn("cosmic-weather-collective compute error:", e);
    return "";
  }
}

export interface CosmicWeatherEmailArgs {
  date: Date;
  natalChart: NatalChart | null;
  chartId: string;
  recipientName?: string;
  solarReturnCharts?: SolarReturnChart[];
  activeChartId?: string;
}

export interface CosmicWeatherEmailResult {
  subject: string;
  body: string;
  skyBlock: string;
  meta: {
    date: string;
    dateLabel: string;
    recipientName?: string;
    chartId: string;
    generatedAt: string;
  };
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

export async function generateCosmicWeatherEmail(
  args: CosmicWeatherEmailArgs,
  opts: { signal?: AbortSignal; onProgress?: (status: string) => void } = {},
): Promise<CosmicWeatherEmailResult> {
  const { date, natalChart, chartId, recipientName } = args;
  const label = formatDateLabel(date);
  const subject = recipientName
    ? `${recipientName}'s Cosmic Weather, ${label}`
    : `Cosmic Weather, ${label}`;
  const dateKey = formatLocalDateKey(date);
  const meta = {
    date: dateKey,
    dateLabel: label,
    recipientName,
    chartId,
    generatedAt: new Date().toISOString(),
  };

  // Deterministic sky block — pure ephemeris, no AI.
  const skyBlock = formatSkyBlockForEmail(date);

  let body: string;

  opts.onProgress?.("writing today's collective sky");
  const collectiveProseHTML = await fetchCollectiveProse(date, opts.signal);

  opts.onProgress?.("personalizing today's weather");
  const weatherToday = await fetchWeatherTodayParts(date, natalChart, recipientName, opts.signal);

  opts.onProgress?.("building personalized morning digest");
  body = buildMorningDigest({
    date,
    natalChart,
    recipientName,
    collectiveProseHTML,
    weatherTodayParts: weatherToday,
  });

  return { subject, body, skyBlock, meta };
}


// ─── Recipients (preserved from old emailReport.ts) ───────────────────

const STORAGE_KEY = "cosmic-weather:email-recipients:v1";

export interface EmailRecipient {
  name: string;
  email: string;
}

export function loadRecipients(): EmailRecipient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

export function saveRecipient(r: EmailRecipient): EmailRecipient[] {
  const list = loadRecipients().filter(x => x.email !== r.email);
  list.push(r);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  return list;
}

export function deleteRecipient(email: string): EmailRecipient[] {
  const list = loadRecipients().filter(x => x.email !== email);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {}
  return list;
}
