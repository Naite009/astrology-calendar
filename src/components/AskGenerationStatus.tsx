import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

interface AskGenerationStatusProps {
  /** When generation started (ms since epoch). */
  startedAt: number;
  /** Latest status from the job poller: queued | processing (or null while submitting). */
  jobStatus?: "queued" | "processing" | null;
}

/**
 * Visible progress UI for the Ask flow. Long Sonnet generations can take
 * 4-7 minutes — staring at a static spinner feels broken. This shows:
 *   - elapsed mm:ss counter (live)
 *   - a rotating stage message keyed off elapsed time (gives the sense
 *     of phased work even though we don't get true section-by-section
 *     progress from the streaming AI response)
 *   - a "queued" indicator when the job hasn't started server-side yet
 */
const STAGES: Array<{ minSeconds: number; label: string }> = [
  { minSeconds: 0,   label: "Reading the chart…" },
  { minSeconds: 15,  label: "Mapping placements and houses…" },
  { minSeconds: 45,  label: "Cross-referencing aspects and patterns…" },
  { minSeconds: 90,  label: "Weaving in solar return and timing…" },
  { minSeconds: 150, label: "Drafting the core narrative sections…" },
  { minSeconds: 210, label: "Building city comparisons and recommendations…" },
  { minSeconds: 270, label: "Synthesizing the strategy and summary…" },
  { minSeconds: 330, label: "Polishing the final reading…" },
  { minSeconds: 420, label: "Almost there — finalizing…" },
];

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function stageLabel(elapsedSec: number): string {
  let label = STAGES[0].label;
  for (const stage of STAGES) {
    if (elapsedSec >= stage.minSeconds) label = stage.label;
  }
  return label;
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
    : stageLabel(elapsedSec);

  // Friendly hint after 5 min so the user knows long waits are expected.
  const showLongHint = elapsedSec >= 300;

  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex flex-col gap-1 rounded-lg bg-muted px-4 py-3 min-w-[260px]">
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
