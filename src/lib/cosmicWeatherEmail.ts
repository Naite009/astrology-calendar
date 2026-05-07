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
import { formatSkyBlockForEmail } from "./cosmicWeatherSkyBlock";
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

/**
 * Pull the in-app Cosmic Weather reading from localStorage instead of
 * generating a parallel (worse) version. The TodaysCosmicEnergy component
 * caches its result under `cosmic-weather-${YYYY-MM-DD}-${voiceStyle}`.
 * We grab whichever voice the user last viewed.
 */
function findCachedInsight(dateKey: string): { insight: string; voiceStyle: string; moonPhase?: string; moonSign?: string } | null {
  try {
    const prefix = `cosmic-weather-${dateKey}-`;
    let best: { insight: string; voiceStyle: string; moonPhase?: string; moonSign?: string; ts: number } | null = null;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(prefix)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (!parsed?.insight) continue;
        const voiceStyle = key.slice(prefix.length);
        const ts = Date.parse(parsed.generatedAt) || 0;
        if (!best || ts > best.ts) {
          best = { insight: parsed.insight, voiceStyle, moonPhase: parsed.moonPhase, moonSign: parsed.moonSign, ts };
        }
      } catch {}
    }
    if (!best) return null;
    return { insight: best.insight, voiceStyle: best.voiceStyle, moonPhase: best.moonPhase, moonSign: best.moonSign };
  } catch { return null; }
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

  opts.onProgress?.("checking cache");
  const cached = findCachedInsight(dateKey);
  if (cached) {
    const greeting = recipientName ? `Hi ${recipientName.split(/\s+/)[0]},\n\n` : "";
    const body = `${greeting}${skyBlock}\n\n${cached.insight.trim()}`;
    return { subject, body, skyBlock, meta };
  }

  // No cached reading available. Do NOT silently call a parallel AI pipeline,
  // because it produces lower-quality output than the in-app reading.
  throw new Error(
    "No Cosmic Weather reading is cached for this date yet. Open Today's Cosmic Weather in the app first (so it generates and caches the full reading), then come back here to email it."
  );
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
