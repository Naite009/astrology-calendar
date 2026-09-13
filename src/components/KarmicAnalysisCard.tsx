/**
 * Symbolic-contact card for Synastry.
 *
 * Rewritten to remove: the archetype headline ("Catalyst Connection", "Twin Flame"),
 * the total karmic score, the "past life probability" percent, per-indicator point
 * values, the duration/completion table, and the danger-flag alerts. What remains is
 * the shared evidence-first summary plus a directional list of every contact, each
 * with its neutral technical category, exact orb, whose planet is whose, what tends
 * to support the connection, and what can strain it.
 */

import { useMemo, useState } from 'react';
import { Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  SYMBOLIC_LENS_NOTE,
  buildKarmicSummary,
  karmicContactLine,
  formatKarmicOrb,
  type RelationshipContext,
} from '@/lib/relationship';
import { KarmicSummaryCard } from '@/components/relationship/KarmicSummaryCard';
import type { KarmicAnalysis } from '@/lib/karmicAnalysis';

interface KarmicAnalysisCardProps {
  analysis: KarmicAnalysis;
  chart1Name: string;
  chart2Name: string;
  /** Canonical relationship context: drives age-aware wording and symbolic permission. */
  context?: RelationshipContext | null;
}

export function KarmicAnalysisCard({
  analysis,
  chart1Name,
  chart2Name,
  context,
}: KarmicAnalysisCardProps) {
  const [showContacts, setShowContacts] = useState(false);

  const karmicSummary = useMemo(
    () => buildKarmicSummary(analysis, context ?? null, chart1Name, chart2Name),
    [analysis, context, chart1Name, chart2Name]
  );

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-full bg-secondary/50 text-primary">
            <Moon size={20} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold">Symbolic contacts between these charts</h3>
            <p className="text-sm text-muted-foreground mt-1">{analysis.emphasis}</p>
            <p className="text-[11px] text-muted-foreground mt-2">{SYMBOLIC_LENS_NOTE}</p>
          </div>
        </div>

        {/* Shared evidence-first summary, identical on every Synastry surface */}
        <div className="mt-4">
          <KarmicSummaryCard summary={karmicSummary} />
        </div>
      </div>

      <Collapsible open={showContacts} onOpenChange={setShowContacts}>
        <CollapsibleTrigger className="w-full px-6 py-3 border-t bg-background/40 hover:bg-background/60 transition-colors flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium">
            <Moon size={16} className="text-primary" />
            Every contact found ({analysis.indicators.length})
          </div>
          {showContacts ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </CollapsibleTrigger>
        <CollapsibleContent className="px-6 py-4 border-t bg-background/30">
          {analysis.indicators.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No contacts of this kind were found between these two charts.
            </p>
          ) : (
            <ScrollArea className="max-h-96">
              <div className="space-y-2">
                {analysis.indicators.map((ind, i) => (
                  <div key={i} className="p-3 rounded-lg bg-background/80 border text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{ind.technicalCategory}</Badge>
                      <span className="font-medium">
                        {karmicContactLine(ind, chart1Name, chart2Name)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({formatKarmicOrb(ind.orb)})
                      </span>
                      {ind.isOutOfSign && <Badge variant="outline">Out of sign</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{ind.interpretation}</p>
                    {ind.signVsDegreeNote && (
                      <p className="text-xs text-muted-foreground mt-1">{ind.signVsDegreeNote}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium text-foreground">What tends to support this: </span>
                      {ind.supports}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className="font-medium text-foreground">What can strain it: </span>
                      {ind.strains}
                    </p>
                    {ind.optionalSymbolic && (
                      <p className="text-[11px] text-muted-foreground mt-1 italic">
                        Optional symbolic reading: {ind.optionalSymbolic}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {analysis.careAreas.length > 0 && (
            <div className="mt-4 p-3 rounded-lg border bg-muted/30">
              <h4 className="font-medium text-sm mb-1">Areas worth care and awareness</h4>
              <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                {analysis.careAreas.map((area, i) => (
                  <li key={i}>{area}</li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">{analysis.recommendedApproach}</p>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default KarmicAnalysisCard;
