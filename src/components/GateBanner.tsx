import { ShieldAlert, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Mirrors the shape attached by supabase/functions/ask-astrology/index.ts
 * to parsedContent._gate. We only consume a tiny slice (ok / defects /
 * label / status / unvalidated) here; the rest of the gate verdict lives
 * on the reading object for debugging.
 */
export type GateReport = {
  ok?: boolean | null;
  /**
   * Edge-function-assigned label:
   *   "ok"          → gate ran, returned 200, body.ok === true
   *   "exhausted"   → gate ran, V2 retried but couldn't fully heal
   *   "failed"      → gate ran (200), reading still has defects
   *   "unvalidated" → gate did NOT run (non-200 HTTP, fetch threw, etc.)
   *   "block_error" → the gate orchestration block itself threw
   */
  label?: string;
  /** Set to true by the edge function when the gate could not be reached. */
  unvalidated?: boolean;
  /** HTTP status returned by the gate request (when one was made). */
  status?: number;
  /** Error message if the fetch threw before getting a response. */
  error?: string;
  defects?: Array<{
    code?: string;
    message?: string;
    path?: string;
    severity?: string;
  }>;
  fixes_applied?: Array<unknown>;
};

/**
 * Mirrors `_relationship_contract` attached by the edge function. This is
 * the in-house contract verdict (independent of the external Replit gate).
 * Hard defects here mean a chart/prose mismatch the contract considers
 * unacceptable even when the external gate passed.
 */
export type ContractReport = {
  version?: string;
  ok?: boolean;
  defect_count?: number;
  hard_defect_count?: number;
  checked_rules?: string[];
  defects?: Array<{
    code?: string;
    severity?: string;
    path?: string;
    message?: string;
  }>;
  error?: string;
};

interface GateBannerProps {
  report: GateReport | null | undefined;
  contract?: ContractReport | null | undefined;
  onRegenerate?: () => void;
}

/**
 * Renders a banner for two distinct gate outcomes:
 *
 *   1. UNVALIDATED — the external Replit gate could NOT be reached
 *      (non-200 HTTP like 404/500/502, or the fetch threw). The reading
 *      was never actually checked. Rendered in WARNING (amber) styling
 *      with explicit "validation did not run" copy. This is the case the
 *      user flagged: a 404 from Replit must NOT be presented as a normal
 *      "needs review" state.
 *
 *   2. REVIEW NOTES — the gate ran (HTTP 200) but flagged the reading
 *      with `ok === false` and itemized defects. The reading is still
 *      rendered below; the banner just surfaces the defect codes for
 *      transparency in informational (primary) styling.
 *
 * Hidden entirely when the gate passed (`ok === true`) or was skipped.
 *
 * The in-house relationship contract is advisory-only (kept on the payload
 * for debugging via `contract` prop) and intentionally does NOT fail the
 * UI — Replit is the source of truth so we don't double-flag.
 */
export const GateBanner = ({ report, contract, onRegenerate }: GateBannerProps) => {
  const [expanded, setExpanded] = useState(false);
  // Suppress unused-var lint while keeping the prop in the public API
  void contract;

  // UNVALIDATED takes priority — the gate didn't run, so any `ok` value is
  // not meaningful. Detect via the explicit flag the edge function sets,
  // OR by a non-200 HTTP status, OR by a fetch error.
  const isUnvalidated =
    report?.unvalidated === true ||
    report?.label === "unvalidated" ||
    report?.label === "block_error" ||
    (typeof report?.status === "number" && report.status !== 200) ||
    (!!report?.error && report?.ok !== true);

  const gateFailed = !isUnvalidated && report?.ok === false;

  if (!isUnvalidated && !gateFailed) return null;

  // ── UNVALIDATED state (gate unreachable) ────────────────────────────
  if (isUnvalidated) {
    const status = report?.status;
    const errorMsg = report?.error;
    return (
      <div className="rounded-lg border border-warning/40 bg-warning/10 p-3 space-y-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              UNVALIDATED — external validation did not run
            </p>
            <p className="text-xs text-muted-foreground">
              The Replit validation gate could not be reached
              {typeof status === "number" ? ` (HTTP ${status})` : ""}
              {errorMsg ? ` — ${errorMsg}` : ""}.
              The reading and JSON export are still available below, but
              this draft was <span className="font-medium text-foreground">never checked</span> for
              chart/prose consistency. Treat it as unverified.
            </p>
          </div>
        </div>
        {onRegenerate && (
          <div className="pl-6">
            <Button size="sm" variant="outline" onClick={onRegenerate} className="h-7 text-xs">
              Try again (gate may have recovered)
            </Button>
          </div>
        )}
      </div>
    );
  }

  // ── REVIEW NOTES state (gate ran, flagged defects) ──────────────────
  const gateDefects = Array.isArray(report?.defects) ? report!.defects! : [];
  const defects = gateDefects.map((d) => ({ ...d, _source: "gate" as const }));
  const defectCount = defects.length;
  const failingLayers: string[] = ["external gate"];

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              JSON review notes
              {defectCount > 0 ? ` — ${defectCount} issue${defectCount === 1 ? "" : "s"} flagged` : ""}
              {failingLayers.length > 0 ? ` (${failingLayers.join(" + ")})` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              The reading and JSON export remain available. These notes mark
              anything the external gate wanted reviewed so you can send them
              back for correction without losing the generated JSON.
            </p>
          </div>
        </div>
        {defectCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="h-7 px-2 text-xs"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Hide" : "Details"}
          </Button>
        )}
      </div>

      {(expanded || defectCount > 0) && (
        <div className="space-y-1 pl-6 text-xs">
          {defectCount > 0 ? (
            <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
              {defects.slice(0, 20).map((d, i) => (
                <li key={i}>
                  <span className="font-medium text-foreground">{d.code || "issue"}</span>
                  <span className="ml-1 inline-block rounded bg-muted px-1 py-0 text-[10px] uppercase text-muted-foreground">
                    {d._source}
                  </span>
                  {d.message ? <> — {d.message}</> : null}
                  {d.path ? <span className="text-muted-foreground/70"> · {d.path}</span> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              The external gate marked this for review but did not return itemized defects.
            </p>
          )}
          {defects.length > 20 && (
            <p className="text-muted-foreground/70">
              … and {defects.length - 20} more
            </p>
          )}
        </div>
      )}

      {onRegenerate && (
        <div className="pl-6">
          <Button size="sm" variant="outline" onClick={onRegenerate} className="h-7 text-xs">
            Regenerate if you want a new draft
          </Button>
        </div>
      )}
    </div>
  );
};

