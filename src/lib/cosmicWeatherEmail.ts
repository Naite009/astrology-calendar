/**
 * Cosmic Weather email — Path A.
 *
 * Routes the email generation through the SAME ask-astrology pipeline used
 * by the Ask tab. This eliminates the brittle parallel template engine that
 * was producing inaccurate astrology (wrong stations, mis-timed transits,
 * awkward phrasing). All ephemeris facts, retrograde gates, fact-check
 * blocks, and felt-sense voice rules now apply automatically.
 */

import { runAskJob } from "./askJobClient";
import { buildChartContext } from "./buildChartContext";
import { buildDeterministicTimingData } from "./deterministicTiming";
import { formatLocalDateKey } from "./localDate";
import type { NatalChart } from "@/hooks/useNatalChart";
import type { SolarReturnChart } from "@/hooks/useSolarReturnChart";

const COSMIC_WEATHER_PROMPT = (recipientName: string | undefined, dateLabel: string) => `
Write a Cosmic Weather email for ${recipientName || "the reader"} dated ${dateLabel}.

Required structure (use clean section headers, no markdown symbols beyond ##):

## Today at a glance
A 2-3 sentence felt-sense opening. Plain language, what they will FEEL or NOTICE.

## What the sky is doing
Today's Sun, Moon, and the 1-2 tightest aspects perfecting in the sky. Name any planet that is retrograde or stationing. NEVER claim a station unless ephemeris confirms it within ±3 days.

## What it means for you
2-3 short paragraphs grounded in the user's natal chart. Use the ACTIVE TRANSIT ASPECTS TO NATAL CHART block as the source of truth. Each transit must say what the person will actually feel, do, or notice today — no abstract verbs, no jargon.

## A small move
One concrete suggestion for today.

Hard rules:
- Every astrological claim must come from the chart context provided. If a fact is not in context, do not state it.
- Never use em dashes. Use commas, periods, or parentheses.
- 3rd-grade plain language. No author citations. No "the chart shows..." filler.
- Do not invent stations, ingresses, or aspect dates.
`.trim();

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
}

function dateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

/**
 * Strip the AI's structured-reading JSON down to plain email body text.
 */
function flattenReading(result: any, fallback: string): string {
  if (!result) return fallback;
  if (typeof result.raw === "string" && result.raw.trim()) return result.raw.trim();
  const sections = result.sections;
  if (!Array.isArray(sections)) return fallback;
  const parts: string[] = [];
  for (const s of sections) {
    if (s?.title) parts.push(`## ${s.title}`);
    if (typeof s?.body === "string") parts.push(s.body);
    if (typeof s?.content === "string") parts.push(s.content);
    if (Array.isArray(s?.bullets)) {
      for (const b of s.bullets) if (b?.text) parts.push(`• ${b.text}`);
    }
  }
  return parts.join("\n\n").trim() || fallback;
}

export async function generateCosmicWeatherEmail(
  args: CosmicWeatherEmailArgs,
  opts: { signal?: AbortSignal; onProgress?: (status: string) => void } = {},
): Promise<CosmicWeatherEmailResult> {
  const { date, natalChart, chartId, recipientName } = args;
  const label = dateLabel(date);
  const subject = recipientName
    ? `${recipientName}'s Cosmic Weather — ${label}`
    : `Cosmic Weather — ${label}`;

  if (!natalChart) {
    return {
      subject,
      body: "No chart available. Add or import your natal chart first.",
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
      currentDate: formatLocalDateKey(date),
      deterministicTiming: timingData.section,
      chartId,
    },
    { signal: opts.signal, onProgress: (s) => opts.onProgress?.(s) },
  );

  if (job.status === "failed") {
    throw new Error(job.error_message || "Email generation failed.");
  }

  const body = flattenReading(job.result, "Reading was empty.");
  return { subject, body };
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
