import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export type ValidationReport = {
  fixed_counts?: Array<{ section: string; from: string; to: string }>;
  stripped_aspects?: Array<{ section: string; phrase: string; reason?: string }>;
  stripped_dates?: Array<{ section: string; phrase: string }>;
  stripped_planets?: Array<{ section: string; phrase: string }>;
  drift_count?: number;
};

interface DriftBannerProps {
  report: ValidationReport | null | undefined;
  onRegenerate?: () => void;
}

/**
 * Renders a warning banner whenever the universal validator caught any
 * AI mis-paraphrasing in the reading. Shows a per-issue breakdown and an
 * optional "Regenerate" button that re-runs the same reading.
 */
export const DriftBanner = ({ report, onRegenerate }: DriftBannerProps) => {
  const [expanded, setExpanded] = useState(false);
  const driftCount = report?.drift_count ?? 0;
  if (!report || driftCount === 0) return null;

  const fixedCounts = report.fixed_counts ?? [];
  const strippedAspects = report.stripped_aspects ?? [];
  const strippedDates = report.stripped_dates ?? [];
  const strippedPlanets = report.stripped_planets ?? [];

  return (
    <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              {driftCount} correction{driftCount === 1 ? "" : "s"} applied to this reading
            </p>
            <p className="text-xs text-muted-foreground">
              The AI mis-stated chart data in {driftCount} place{driftCount === 1 ? "" : "s"}. We
              auto-fixed counts and removed unverifiable aspect / date / planet claims.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded((v) => !v)}
          className="h-7 px-2 text-xs"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "Hide" : "Details"}
        </Button>
      </div>

      {expanded && (
        <div className="space-y-2 pl-6 text-xs">
          {fixedCounts.length > 0 && (
            <div>
              <p className="font-medium text-foreground">Counts auto-corrected ({fixedCounts.length})</p>
              <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                {fixedCounts.map((f, i) => (
                  <li key={i}>
                    <span className="line-through">{f.from}</span> → <span className="text-foreground">{f.to}</span>
                    <span className="text-muted-foreground/70"> · {f.section}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {strippedAspects.length > 0 && (
            <div>
              <p className="font-medium text-foreground">Aspect claims removed ({strippedAspects.length})</p>
              <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                {strippedAspects.map((s, i) => (
                  <li key={i}>
                    "{s.phrase}" {s.reason ? `— ${s.reason}` : ""}
                    <span className="text-muted-foreground/70"> · {s.section}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {strippedDates.length > 0 && (
            <div>
              <p className="font-medium text-foreground">Dates removed ({strippedDates.length})</p>
              <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                {strippedDates.map((s, i) => (
                  <li key={i}>
                    "{s.phrase}"
                    <span className="text-muted-foreground/70"> · {s.section}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {strippedPlanets.length > 0 && (
            <div>
              <p className="font-medium text-foreground">Unknown planets removed ({strippedPlanets.length})</p>
              <ul className="list-disc pl-4 text-muted-foreground space-y-0.5">
                {strippedPlanets.map((s, i) => (
                  <li key={i}>
                    "{s.phrase}"
                    <span className="text-muted-foreground/70"> · {s.section}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {onRegenerate && (
            <div className="pt-1">
              <Button size="sm" variant="outline" onClick={onRegenerate} className="h-7 text-xs">
                Regenerate this reading
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
