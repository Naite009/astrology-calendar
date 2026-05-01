import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Loader2, Replace } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { listAskCaptures, runReplayJob, AskCaptureRow, normalizeAskResult, AskJobRow } from "@/lib/askJobClient";
import { toast } from "sonner";

/**
 * Re-render a saved AI prose capture through the autofix / post-process
 * pipeline WITHOUT calling the AI. Critical for the fix-validation loop:
 * we can verify a code-side fix produces the expected change without
 * burning API tokens on a full regeneration.
 */
interface Props {
  /** Active chart id; used as the chartId for the new ask_jobs row. */
  chartId: string;
  /**
   * Active chart name (e.g. "Lauren Newman"). Used to default-filter the
   * list so the user only sees captures for the person they're currently
   * looking at. They can still switch to another person via the dropdown.
   */
  chartName?: string;
  /** Disable while another generation is running. */
  disabled?: boolean;
  /**
   * Called with the corrected reading (`result` from ask_jobs.result) once
   * the replay finishes. Parent decides what to do with it (render in
   * chat, swap into history, etc).
   */
  onReplayed: (result: any, capture: AskCaptureRow) => void;
}

const ALL_PEOPLE = "__all__";
const NO_NAME = "__none__";

/**
 * Heuristic: derive a short, human topic label from the captured question
 * text, e.g. "Solar Return", "Relationship", "Where to live", "Natal".
 * Falls back to "Reading" if nothing matches.
 */
function deriveTopic(question: string | null): string {
  if (!question) return "Reading";
  const q = question.toLowerCase();
  // Order matters: check the MOST SPECIFIC user intents first. Solar Return
  // questions reference "solar return chart" — but so do Relationship/Career
  // prompts that consume the SR chart as context. Don't let the generic
  // "solar return" substring swallow more specific reading types.
  if (q.includes("synastry") || q.includes("relationship") || q.includes("compatibility") || q.includes("partner") || q.includes("love analysis")) return "Relationship";
  if (q.includes("astrocartograph")) return "Astrocartography";
  if (q.includes("where") && (q.includes("live") || q.includes("move") || q.includes("relocat"))) return "Where to live";
  if (q.includes("career") || q.includes("work") || q.includes("job")) return "Career";
  if (q.includes("transit") || q.includes("timing") || q.includes("when")) return "Timing / Transits";
  // Now safe to treat remaining "solar return" mentions as actual SR readings.
  if (q.includes("complete professional solar return") || q.includes("solar return reading") || q.includes("solar return analysis") || (q.includes("solar return") && !q.includes("current solar return chart"))) return "Solar Return";
  if (q.includes("natal")) return "Natal";
  return "Reading";
}

export function AskReplayDialog({ chartId, chartName, disabled, onReplayed }: Props) {
  const [open, setOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [captures, setCaptures] = useState<AskCaptureRow[]>([]);
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<AskJobRow["status"] | null>(null);
  const [filterName, setFilterName] = useState<string>(chartName || ALL_PEOPLE);

  // Reset the filter to the currently-active chart whenever the dialog
  // opens or the active chart changes. Users can override with the dropdown.
  useEffect(() => {
    if (open) setFilterName(chartName || ALL_PEOPLE);
  }, [open, chartName]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingList(true);
    listAskCaptures(100).then((rows) => {
      if (cancelled) return;
      setCaptures(rows);
      setLoadingList(false);
    });
    return () => { cancelled = true; };
  }, [open]);

  // Distinct chart names present in the captures (for the dropdown).
  const peopleOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of captures) {
      const key = c.chart_name || NO_NAME;
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const entries = Array.from(counts.entries()).sort((a, b) => {
      if (a[0] === NO_NAME) return 1;
      if (b[0] === NO_NAME) return -1;
      return a[0].localeCompare(b[0]);
    });
    return entries;
  }, [captures]);

  const filteredCaptures = useMemo(() => {
    if (filterName === ALL_PEOPLE) return captures;
    if (filterName === NO_NAME) return captures.filter((c) => !c.chart_name);
    return captures.filter((c) => c.chart_name === filterName);
  }, [captures, filterName]);

  const handleReplay = async (cap: AskCaptureRow) => {
    if (replayingId) return;
    setReplayingId(cap.id);
    setProgressStatus("queued");
    try {
      const job = await runReplayJob({
        chartId: chartId || cap.chart_id || "replay",
        replayCaptureId: cap.id,
        onProgress: (s) => setProgressStatus(s),
      });
      if (job.status === "failed") {
        toast.error(`Replay failed: ${job.error_message || "unknown error"}`);
        return;
      }
      const result = normalizeAskResult(job.result || {});
      onReplayed(result, cap);
      toast.success("Re-rendered from saved prose (no AI call).");
      setOpen(false);
    } catch (e: any) {
      console.error("[AskReplayDialog] replay error:", e);
      toast.error(`Replay error: ${e?.message || String(e)}`);
    } finally {
      setReplayingId(null);
      setProgressStatus(null);
    }
  };

  const formatTs = (iso: string): string => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      });
    } catch { return iso; }
  };

  const activeFilterLabel =
    filterName === ALL_PEOPLE
      ? "All people"
      : filterName === NO_NAME
        ? "Unlabeled"
        : filterName;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="text-muted-foreground"
          title="Re-render an earlier reading through the latest fixes — no AI call"
        >
          <Replace className="h-4 w-4 mr-1" />
          Replay
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Re-render from saved prose</DialogTitle>
          <DialogDescription>
            Pick a saved AI generation. The autofix and post-process pipeline
            will re-run against the same prose — no new AI call, no API
            credits used. Use this to verify code-side fixes.
          </DialogDescription>
        </DialogHeader>

        {/* Person filter */}
        {!loadingList && captures.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-muted-foreground">Person:</span>
            <Select value={filterName} onValueChange={setFilterName}>
              <SelectTrigger className="h-8 w-[240px] text-sm">
                <SelectValue>{activeFilterLabel}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_PEOPLE}>All people ({captures.length})</SelectItem>
                {peopleOptions.map(([name, count]) => (
                  <SelectItem key={name} value={name}>
                    {name === NO_NAME ? "Unlabeled" : name} ({count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {loadingList ? (
          <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading saved captures…
          </div>
        ) : captures.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground">
            No captures found. Captures are written automatically when{" "}
            <code className="px-1 rounded bg-muted">ASK_DEBUG_CAPTURE=1</code>{" "}
            is set on the edge function.
          </div>
        ) : filteredCaptures.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground">
            No captures yet for <strong>{activeFilterLabel}</strong>. Run a
            fresh generation for this person and a capture will be saved
            automatically. Or switch the Person filter above to see captures
            for other charts.
          </div>
        ) : (
          <ScrollArea className="max-h-[420px] pr-3">
            <ul className="space-y-2">
              {filteredCaptures.map((cap) => {
                const isReplayingThis = replayingId === cap.id;
                const isOtherReplaying = replayingId !== null && !isReplayingThis;
                const topic = deriveTopic(cap.question);
                return (
                  <li
                    key={cap.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">
                          {topic}
                        </span>
                        <span className="truncate">
                          {cap.chart_name || "(no name)"}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTs(cap.captured_at)}
                        </span>
                      </div>
                      {cap.question && (
                        <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                          {cap.question}
                        </div>
                      )}
                      <div className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {cap.prose_len != null ? `${cap.prose_len.toLocaleString()} chars` : ""}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isReplayingThis ? "default" : "secondary"}
                      disabled={isOtherReplaying}
                      onClick={() => handleReplay(cap)}
                    >
                      {isReplayingThis ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                          {progressStatus || "running"}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 mr-1" />
                          Replay
                        </>
                      )}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
