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
import { getPlanetaryPositions } from "./astrology";
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

async function fetchWeatherTodayProse(
  date: Date,
  natalChart: NatalChart | null,
  recipientName: string | undefined,
  signal?: AbortSignal,
): Promise<string> {
  if (!natalChart) return "";
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

    const longerHits = transits
      .filter((t) =>
        SLOW_PLANETS.has(t.transitPlanet) && PERSONAL_TARGETS.has(t.natalPlanet)
      )
      .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));
    const topLongerTransit = longerHits[0] || null;

    if (!transitMoonSign) return "";

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
      topLongerTransit: topLongerTransit && {
        transitPlanet: topLongerTransit.transitPlanet,
        aspect: topLongerTransit.aspect,
        natalPlanet: topLongerTransit.natalPlanet,
        natalSign: topLongerTransit.natalSign,
        natalHouse: topLongerTransit.natalHouse ?? null,
        orb: topLongerTransit.orb,
        applying: topLongerTransit.applying,
      },
    };

    const { data, error } = await supabase.functions.invoke("your-weather-today", {
      body: payload,
    });
    if (signal?.aborted) return "";
    if (error) {
      console.warn("your-weather-today edge fn error:", error);
      return "";
    }
    return String((data as any)?.text || "").trim();
  } catch (e) {
    console.warn("your-weather-today compute error:", e);
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

  opts.onProgress?.("building personalized morning digest");
  body = buildMorningDigest({ date, natalChart, recipientName });

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
