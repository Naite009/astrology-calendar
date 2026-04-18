import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface AskGenerationStatusProps {
  /** When generation started (ms since epoch). */
  startedAt: number;
  /** Latest status from the job poller: queued | processing (or null while submitting). */
  jobStatus?: "queued" | "processing" | null;
}

/**
 * Visible progress UI for the Ask flow. Long Sonnet readings take 4-7 minutes.
 *
 * Honest progress model:
 *   - "Section X of 12" advances every ~30s (assumes ~6 min total / 12 sections).
 *   - Once we cross 360s (6 min) we hold at 12/12 and switch to "Finalizing…"
 *     so the label never lies about being done before the result actually lands.
 *   - The timer starts from `startedAt`. If the job is still "queued" we label
 *     the wait as "Queued" so the user knows time hasn't started counting
 *     against actual generation yet.
 */

const TOTAL_SECTIONS = 12;
// Approx seconds per section based on observed ~5-6 min Sonnet generations.
const SECONDS_PER_SECTION = 30;
// After this point we stop advancing the section count and just say "finalizing".
const FINALIZING_AFTER_SEC = TOTAL_SECTIONS * SECONDS_PER_SECTION; // 360s = 6 min

const SECTION_THEMES: string[] = [
  "Reading the chart",
  "Mapping core placements",
  "Cross-referencing aspects",
  "Weaving in solar return",
  "Analyzing timing transits",
  "Drafting narrative sections",
  "Building city comparisons",
  "Identifying caution zones",
  "Synthesizing patterns",
  "Writing strategy summary",
  "Polishing the final reading",
  "Wrapping up",
];

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function progressLabel(elapsedSec: number): string {
  if (elapsedSec >= FINALIZING_AFTER_SEC) {
    return "Finalizing your reading… (12 of 12)";
  }
  // Section number = floor(elapsedSec / 30) + 1, clamped to TOTAL_SECTIONS
  const idx = Math.min(
    TOTAL_SECTIONS - 1,
    Math.floor(elapsedSec / SECONDS_PER_SECTION),
  );
  const sectionNumber = idx + 1;
  return `${SECTION_THEMES[idx]}… (Section ${sectionNumber} of ${TOTAL_SECTIONS})`;
}

export function AskGenerationStatus({ startedAt, jobStatus }: AskGenerationStatusProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsedMs = now - startedAt;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  const isQueued = jobStatus === "queued";
  const message = isQueued
    ? "Queued — waiting for the AI to start…"
    : progressLabel(elapsedSec);

  // Friendly hint after 5 min so the user knows long waits are expected.
  const showLongHint = elapsedSec >= 300;

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-col gap-1 rounded-lg bg-muted px-4 py-3 min-w-[300px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{message}</span>
          <span className="ml-auto text-xs font-mono text-muted-foreground/80 tabular-nums">
            {formatElapsed(elapsedMs)}
          </span>
        </div>
        {showLongHint && (
          <p className="text-xs text-muted-foreground/70 pl-6">
            Deep readings can take 4–7 minutes. You can safely switch tabs — it will keep generating.
          </p>
        )}
      </div>
    </div>
  );
}
