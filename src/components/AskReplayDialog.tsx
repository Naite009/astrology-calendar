import { useEffect, useState } from "react";
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
  /** Disable while another generation is running. */
  disabled?: boolean;
  /**
   * Called with the corrected reading (`result` from ask_jobs.result) once
   * the replay finishes. Parent decides what to do with it (render in
   * chat, swap into history, etc).
   */
  onReplayed: (result: any, capture: AskCaptureRow) => void;
}

export function AskReplayDialog({ chartId, disabled, onReplayed }: Props) {
  const [open, setOpen] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [captures, setCaptures] = useState<AskCaptureRow[]>([]);
  const [replayingId, setReplayingId] = useState<string | null>(null);
  const [progressStatus, setProgressStatus] = useState<AskJobRow["status"] | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingList(true);
    listAskCaptures(50).then((rows) => {
      if (cancelled) return;
      setCaptures(rows);
      setLoadingList(false);
    });
    return () => { cancelled = true; };
  }, [open]);

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
        ) : (
          <ScrollArea className="max-h-[420px] pr-3">
            <ul className="space-y-2">
              {captures.map((cap) => {
                const isReplayingThis = replayingId === cap.id;
                const isOtherReplaying = replayingId !== null && !isReplayingThis;
                return (
                  <li
                    key={cap.id}
                    className="flex items-center justify-between gap-3 rounded-md border border-border/60 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {cap.chart_id || "(no chart id)"}
                        <span className="ml-2 text-xs text-muted-foreground">
                          {formatTs(cap.captured_at)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {cap.prose_len != null ? `${cap.prose_len.toLocaleString()} chars` : ""}
                        {cap.notes ? ` · ${cap.notes}` : ""}
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
