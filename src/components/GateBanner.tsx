import { ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Mirrors the shape attached by supabase/functions/ask-astrology/index.ts
 * to parsedContent._gate. We only consume a tiny slice (ok / defects) here;
 * the rest of the gate verdict lives on the reading object for debugging.
 */
export type GateReport = {
  ok?: boolean;
  defects?: Array<{
    code?: string;
    message?: string;
    path?: string;
    severity?: string;
  }>;
  fixes_applied?: Array<unknown>;
  label?: string;
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
 * Renders a prominent warning when EITHER the external Replit validation
 * gate (`_gate.ok === false`) OR the in-house relationship contract
 * (`_relationship_contract.ok === false`) failed. The reading is still
 * rendered below so the user can read what was generated, but the banner
 * makes clear that one or more checks did not pass and surfaces the
 * defect codes for transparency.
 *
 * Hidden entirely when both checks passed (or did not run).
 */
export const GateBanner = ({ report, contract, onRegenerate }: GateBannerProps) => {
  const [expanded, setExpanded] = useState(false);
  const gateFailed = report?.ok === false;
  const contractFailed = contract?.ok === false;
  if (!gateFailed && !contractFailed) return null;

  const gateDefects = Array.isArray(report?.defects) ? report!.defects! : [];
  const contractDefects = Array.isArray(contract?.defects) ? contract!.defects! : [];
  // Combine, tagging the source so the user can see at a glance which
  // layer flagged each defect (gate = external Replit, contract = in-house).
  const defects = [
    ...gateDefects.map((d) => ({ ...d, _source: "gate" as const })),
    ...contractDefects.map((d) => ({ ...d, _source: "contract" as const })),
  ];
  const defectCount = defects.length;
  const failingLayers: string[] = [];
  if (gateFailed) failingLayers.push("external gate");
  if (contractFailed) failingLayers.push("relationship contract");

  return (
    <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <ShieldAlert className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Validation did not pass
              {defectCount > 0 ? ` — ${defectCount} issue${defectCount === 1 ? "" : "s"} flagged` : ""}
              {failingLayers.length > 0 ? ` (${failingLayers.join(" + ")})` : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              The reading below was generated, but at least one consistency
              check failed (e.g. prose claims about retrograde or aspect data
              that do not match the chart). Consider regenerating.
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

      {expanded && defectCount > 0 && (
        <div className="space-y-1 pl-6 text-xs">
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
            Regenerate this reading
          </Button>
        </div>
      )}
    </div>
  );
};
