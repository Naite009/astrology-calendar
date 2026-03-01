import { useState } from 'react';
import { NatalChart } from '@/hooks/useNatalChart';
import { SPILLER_NODE_DATA, SPILLER_SOURCE } from '@/lib/nodeSpillerData';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, BookOpen, Heart, AlertTriangle } from 'lucide-react';

interface Props {
  chart1: NatalChart;
  chart2: NatalChart;
}

function getNodeSign(chart: NatalChart): string | null {
  return chart.planets?.NorthNode?.sign || null;
}

export function SpillerNodeInsightsCard({ chart1, chart2 }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedPerson, setExpandedPerson] = useState<string | null>(null);

  const nn1 = getNodeSign(chart1);
  const nn2 = getNodeSign(chart2);

  if (!nn1 && !nn2) return null;

  const data1 = nn1 ? SPILLER_NODE_DATA[nn1] : null;
  const data2 = nn2 ? SPILLER_NODE_DATA[nn2] : null;

  const people = [
    { chart: chart1, nn: nn1, data: data1 },
    { chart: chart2, nn: nn2, data: data2 },
  ].filter(p => p.data);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full p-4 rounded-xl border bg-card hover:bg-secondary/30 transition-colors text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">☊</span>
              <div>
                <h3 className="font-semibold text-sm">North Node Relationship Patterns</h3>
                <p className="text-xs text-muted-foreground">How each person's soul path operates in relationships</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{SPILLER_SOURCE}</Badge>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        {people.map(({ chart, nn, data }) => {
          if (!data) return null;
          const isExpanded = expandedPerson === chart.id;

          return (
            <div key={chart.id} className="rounded-lg border bg-card overflow-hidden">
              <button
                onClick={() => setExpandedPerson(isExpanded ? null : chart.id)}
                className="w-full p-4 text-left hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{chart.name}</span>
                    <Badge variant="secondary" className="text-[10px]">NN in {nn}</Badge>
                  </div>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Relationship Pattern */}
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart size={14} className="text-primary" />
                      <p className="text-xs font-medium text-primary">How {chart.name} Operates in Relationships</p>
                    </div>
                    <p className="text-sm leading-relaxed">{data.relationships}</p>
                  </div>

                  {/* Past Life Context */}
                  <div className="p-3 rounded-lg bg-secondary/50 border">
                    <p className="text-xs font-medium text-muted-foreground mb-1">🔮 Past-Life Pattern</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{data.pastLifeStory}</p>
                  </div>

                  {/* What Works vs What Doesn't */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <p className="text-[10px] font-medium text-muted-foreground mb-2">✦ WHAT WORKS FOR THEM</p>
                      <p className="text-xs leading-relaxed">{data.whatWorksForYou}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                      <p className="text-[10px] font-medium text-muted-foreground mb-2">⚠ WHAT WORKS AGAINST THEM</p>
                      <p className="text-xs leading-relaxed">{data.whatWorksAgainstYou}</p>
                    </div>
                  </div>

                  {/* Pitfalls in Relationships */}
                  {data.pitfalls.length > 0 && (
                    <div className="p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={12} className="text-muted-foreground" />
                        <p className="text-[10px] font-medium text-muted-foreground">RELATIONSHIP PITFALLS</p>
                      </div>
                      <ul className="space-y-1">
                        {data.pitfalls.map((p, i) => (
                          <li key={i} className="text-xs text-muted-foreground">• {p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Healing Affirmations */}
                  <div className="p-3 rounded-lg bg-muted/50 border border-border">
                    <p className="text-[10px] font-medium text-muted-foreground mb-2">💫 HEALING AFFIRMATIONS</p>
                    <div className="space-y-1">
                      {data.healingAffirmations.map((a, i) => (
                        <p key={i} className="text-xs italic text-muted-foreground">"{a}"</p>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <p className="text-[10px] text-muted-foreground text-center italic">
          Source: {SPILLER_SOURCE} — relationship patterns by North Node sign
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
