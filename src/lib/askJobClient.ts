// Async job client for ask-astrology edge function.
// Submits a request, then polls the ask_jobs row until status is
// completed/failed. Persists the active jobId per chart so a tab-switch,
// HMR reload, or full page reload can resume the SAME in-flight job
// instead of losing progress.

import { supabase } from "@/integrations/supabase/client";

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ask-astrology`;
const ACTIVE_JOB_KEY_PREFIX = "ask-active-job:";
const POLL_INTERVAL_MS = 3000;
const MAX_WAIT_MS = 10 * 60 * 1000; // 10 minutes hard ceiling
const QUEUED_STALE_MS = 75 * 1000;

export interface AskJobRow {
  id: string;
  status: "queued" | "processing" | "completed" | "failed";
  result: any | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

const getKey = (chartId: string) => `${ACTIVE_JOB_KEY_PREFIX}${chartId}`;

export function readActiveJobId(chartId: string): string | null {
  try { return localStorage.getItem(getKey(chartId)); } catch { return null; }
}

export function writeActiveJobId(chartId: string, jobId: string | null) {
  try {
    if (jobId) localStorage.setItem(getKey(chartId), jobId);
    else localStorage.removeItem(getKey(chartId));
  } catch { /* ignore quota */ }
}

export interface UserLocationsInput {
  current?: string;
  considering1?: string;
  considering2?: string;
}

interface SubmitArgs {
  messages: any[];
  chartContext: string;
  currentDate: string;
  deterministicTiming: any;
  chartId: string;
  userLocations?: UserLocationsInput;
  /**
   * REPLAY MODE — pass a saved capture ID to skip the AI call entirely
   * and re-run the post-process / autofix pipeline against the previously
   * generated raw prose. Free; intended for fix-validation loops.
   */
  replayCaptureId?: string;
}

export interface AskCaptureRow {
  id: string;
  chart_id: string | null;
  chart_name: string | null;
  question: string | null;
  captured_at: string;
  notes: string | null;
  prose_len: number | null;
}

/**
 * List the most recent saved AI captures for this user. RLS scopes results
 * to the caller automatically.
 */
export async function listAskCaptures(limit = 100): Promise<AskCaptureRow[]> {
  const { data, error } = await supabase
    .from("ask_generation_captures")
    .select("id, chart_id, chart_name, question, captured_at, notes, raw_ai_response")
    .order("captured_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[askJobClient] listAskCaptures failed:", error.message);
    return [];
  }
  return (data || []).map((r: any) => ({
    id: r.id,
    chart_id: r.chart_id,
    chart_name: r.chart_name ?? null,
    question: r.question ?? null,
    captured_at: r.captured_at,
    notes: r.notes,
    prose_len: typeof r.raw_ai_response === "string" ? r.raw_ai_response.length : null,
  }));
}

/**
 * Submit a replay job. The edge function reuses the saved chart_context,
 * messages, and raw AI prose from the capture row — no Anthropic call.
 */
export async function runReplayJob(args: {
  chartId: string;
  replayCaptureId: string;
  signal?: AbortSignal;
  onProgress?: (status: AskJobRow["status"]) => void;
}): Promise<AskJobRow> {
  const jobId = await submitAskJob({
    messages: [],
    chartContext: "",
    currentDate: new Date().toISOString().slice(0, 10),
    deterministicTiming: null,
    chartId: args.chartId,
    replayCaptureId: args.replayCaptureId,
  } as any);
  args.onProgress?.("queued");
  return pollAskJob(jobId, { chartId: args.chartId, signal: args.signal, onProgress: args.onProgress });
}

/**
 * Submit a new Ask job. Returns the jobId (already persisted to localStorage).
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRetryableSubmitStatus(status: number): boolean {
  return status === 500 || status === 503 || status === 504 || status === 522 || status === 544;
}

/**
 * Submit a new Ask job. Returns the jobId (already persisted to localStorage).
 */
export async function submitAskJob(args: SubmitArgs): Promise<string> {
  // CRITICAL: Use the user's session JWT (not the publishable key) so the
  // edge function can resolve auth.uid() and stamp the job's user_id.
  // Without this, jobs are created with user_id=NULL and RLS later blocks
  // the authenticated client from reading them — UI gets stuck on "Queued".
  const { data: { session } } = await supabase.auth.getSession();
  const bearer = session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  let lastErrorText = "";
  let lastStatus = 0;

  for (let attempt = 1; attempt <= 3; attempt++) {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${bearer}`,
      },
      body: JSON.stringify(args),
    });

    if (resp.status === 429) throw new Error("RATE_LIMIT");
    if (resp.status === 402) throw new Error("CREDITS_EXHAUSTED");

    if (resp.ok) {
      const data = await resp.json();
      if (data?.retryable && data?.queued === false) {
        lastStatus = 503;
        lastErrorText = data.error || "Queue temporarily unavailable";
        if (attempt < 3) {
          await sleep(attempt * 2000);
          continue;
        }
        break;
      }
      if (!data?.jobId) throw new Error("Submit returned no jobId");
      writeActiveJobId(args.chartId, data.jobId);
      return data.jobId as string;
    }

    lastStatus = resp.status;
    lastErrorText = await resp.text().catch(() => "");
    if (attempt < 3 && isRetryableSubmitStatus(resp.status)) {
      await sleep(attempt * 2000);
      continue;
    }
    break;
  }

  throw new Error(`QUEUE_RETRYABLE:${lastStatus}:${lastErrorText.slice(0, 200)}`);
}

/**
 * Poll the ask_jobs row for `jobId` until it is completed or failed.
 * Calls onProgress(status) on each tick so the UI can show "queued",
 * "processing", etc.
 */
export async function pollAskJob(
  jobId: string,
  opts: {
    chartId: string;
    signal?: AbortSignal;
    onProgress?: (status: AskJobRow["status"]) => void;
  },
): Promise<AskJobRow> {
  const startedAt = Date.now();
  let lastStatus: AskJobRow["status"] | null = null;

  // Direct DB read via supabase-js — RLS lets the user read their own rows
  // (and anonymous users read anonymous rows). This avoids a second edge
  // function round-trip on every poll.
  while (true) {
    if (opts.signal?.aborted) throw new DOMException("Aborted", "AbortError");
    if (Date.now() - startedAt > MAX_WAIT_MS) {
      throw new Error("Job exceeded max wait time (10 min). Please try again.");
    }

    const { data, error } = await supabase
      .from("ask_jobs")
      .select("id,status,result,error_message,created_at,completed_at")
      .eq("id", jobId)
      .maybeSingle();

    if (error) {
      console.error("[askJobClient] Poll error:", error);
      // Transient — wait & retry
    } else if (data) {
      const row = data as AskJobRow;
      const rowAgeMs = Date.now() - new Date(row.created_at).getTime();
      if (row.status === "queued" && rowAgeMs > QUEUED_STALE_MS) {
        writeActiveJobId(opts.chartId, null);
        throw new Error("QUEUE_STALE");
      }
      if (row.status !== lastStatus) {
        lastStatus = row.status;
        opts.onProgress?.(row.status);
      }
      if (row.status === "completed" || row.status === "failed") {
        writeActiveJobId(opts.chartId, null);
        return row;
      }
    }

    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

/**
 * Try to extract a structured reading object from a raw string. Some model
 * runs return the reading as a JSON string in `result.raw` instead of as
 * structured `result.sections`. We attempt:
 *   1. Direct JSON.parse
 *   2. Strip ```json ... ``` fences then parse
 *   3. Slice from first "{" to last "}" then parse
 * Returns the parsed object only if it looks like a reading (has `sections`
 * or `headline`/`title` fields). Otherwise returns null.
 */
function tryParseRawReading(raw: unknown): any | null {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const candidates: string[] = [trimmed];
  // Strip ```json ... ``` or ``` ... ``` fences
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch?.[1]) candidates.push(fenceMatch[1].trim());
  // Slice from first { to last }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last > first) candidates.push(trimmed.slice(first, last + 1));

  for (const c of candidates) {
    try {
      const parsed = JSON.parse(c);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        if (Array.isArray(parsed.sections) || parsed.headline || parsed.title) {
          return parsed;
        }
      }
    } catch { /* try next */ }
  }
  return null;
}

/**
 * Normalize an ask_jobs.result payload so the UI always sees structured
 * `sections` when the model produced them, even if the edge function stored
 * the reading as a stringified JSON in `raw`. Mutates a shallow copy.
 */
export function normalizeAskResult(result: any): any {
  if (!result || typeof result !== "object") return result;
  if (result.sections) return result; // already structured
  if (typeof result.raw === "string") {
    const parsed = tryParseRawReading(result.raw);
    if (parsed) {
      // Merge: keep original result fields, but let parsed reading fields win
      return { ...result, ...parsed, raw: result.raw };
    }
  }
  return result;
}

/**
 * Convenience: submit + poll in one call.
 */
export async function runAskJob(
  args: SubmitArgs,
  opts: {
    signal?: AbortSignal;
    onProgress?: (status: AskJobRow["status"]) => void;
  } = {},
): Promise<AskJobRow> {
  const jobId = await submitAskJob(args);
  opts.onProgress?.("queued");
  return pollAskJob(jobId, { chartId: args.chartId, signal: opts.signal, onProgress: opts.onProgress });
}
