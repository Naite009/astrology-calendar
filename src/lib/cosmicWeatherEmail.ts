/**
 * Cosmic Weather email — dedicated, lightweight pipeline.
 *
 * Uses the new `cosmic-weather-email` edge function (NOT the multi-section
 * ask-astrology pipeline, which force-injects "Timing Windows", "Modal
 * Balance", and "Today's Summary" sections that don't belong in an email).
 */

import { supabase } from "@/integrations/supabase/client";
import { buildChartContext } from "./buildChartContext";
import { buildDeterministicTimingData } from "./deterministicTiming";
import { formatLocalDateKey } from "./localDate";
import type { NatalChart } from "@/hooks/useNatalChart";
import type { SolarReturnChart } from "@/hooks/useSolarReturnChart";

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

  if (!natalChart) {
    return {
      subject,
      body: "No chart available. Add or import your natal chart first.",
      meta,
    };
  }

  opts.onProgress?.("building chart context");
  const timingData = buildDeterministicTimingData(natalChart, 18, 15, "natal");
  const chartContext = buildChartContext(natalChart, timingData.context, undefined, {
    solarReturnCharts: args.solarReturnCharts,
    activeChartId: args.activeChartId,
  });

  opts.onProgress?.("calling AI");
  const { data, error } = await supabase.functions.invoke("cosmic-weather-email", {
    body: {
      recipientName,
      dateLabel: label,
      currentDate: dateKey,
      chartContext,
    },
  });

  if (error) throw new Error(error.message || "Email generation failed.");
  if (data?.error) throw new Error(data.error);

  const body = (data?.body as string)?.trim() || "Reading was empty.";
  return { subject, body, meta };
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
