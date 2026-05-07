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

export async function generateCosmicWeatherEmail(
  args: CosmicWeatherEmailArgs,
  opts: { signal?: AbortSignal; onProgress?: (status: string) => void } = {},
): Promise<CosmicWeatherEmailResult> {
  const { date, natalChart, chartId, recipientName } = args;
  const label = dateLabel(date);
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
      reading: null,
      meta,
    };
  }

  const timingData = buildDeterministicTimingData(natalChart, 18, 15, "natal");
  const chartContext = buildChartContext(natalChart, timingData.context, undefined, {
    solarReturnCharts: args.solarReturnCharts,
    activeChartId: args.activeChartId,
  });

  const question = COSMIC_WEATHER_PROMPT(recipientName, label);

  const job = await runAskJob(
    {
      messages: [{ role: "user", content: question }],
      chartContext,
      currentDate: dateKey,
      deterministicTiming: timingData.section,
      chartId,
    },
    { signal: opts.signal, onProgress: (s) => opts.onProgress?.(s) },
  );

  if (job.status === "failed") {
    throw new Error(job.error_message || "Email generation failed.");
  }

  const body = flattenReading(job.result, "Reading was empty.");
  return { subject, body, reading: job.result ?? null, meta };
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
