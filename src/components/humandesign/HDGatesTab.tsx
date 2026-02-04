import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { HumanDesignChart, HDGateActivation } from '@/types/humanDesign';
import { getGateByNumber, HDGate } from '@/data/humanDesignGates';
import { LINE_DESCRIPTIONS } from '@/data/humanDesignProfiles';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface HDGatesTabProps {
  chart: HumanDesignChart;
}

interface GateWithActivations {
  gate: HDGate;
  activations: Array<{
    line: number;
    planet: string;
    isConscious: boolean;
  }>;
}

export const HDGatesTab = ({ chart }: HDGatesTabProps) => {
  const [expandedGates, setExpandedGates] = useState<Set<number>>(new Set());

  // Collect all unique gates from activations
  const gatesMap = new Map<number, GateWithActivations>();
  
  const addActivation = (act: { gate: number; line: number; planet: string; isConscious: boolean }) => {
    const gateData = getGateByNumber(act.gate);
    if (!gateData) return;
    
    if (!gatesMap.has(act.gate)) {
      gatesMap.set(act.gate, { gate: gateData, activations: [] });
    }
    gatesMap.get(act.gate)!.activations.push({
      line: act.line,
      planet: act.planet,
      isConscious: act.isConscious,
    });
  };

  chart.personalityActivations.forEach(a => addActivation({ ...a, isConscious: true }));
  chart.designActivations.forEach(a => addActivation({ ...a, isConscious: false }));

  // Sort by gate number
  const sortedGates = Array.from(gatesMap.values()).sort((a, b) => a.gate.number - b.gate.number);

  const toggleGate = (gateNum: number) => {
    setExpandedGates(prev => {
      const next = new Set(prev);
      if (next.has(gateNum)) {
        next.delete(gateNum);
      } else {
        next.add(gateNum);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded border border-border bg-card p-4">
        <h4 className="mb-2 text-[10px] uppercase tracking-widest text-muted-foreground">
          Activated Gates ({sortedGates.length})
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          Click on any gate to see its description and your line activations.
        </p>
      </div>

      <div className="space-y-2">
        {sortedGates.map(({ gate, activations }) => {
          const isExpanded = expandedGates.has(gate.number);
          
          return (
            <Collapsible
              key={gate.number}
              open={isExpanded}
              onOpenChange={() => toggleGate(gate.number)}
            >
              <div className="rounded border border-border bg-card overflow-hidden">
                <CollapsibleTrigger className="w-full px-4 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-mono font-semibold text-primary">
                      {gate.number}
                    </span>
                    <div className="text-left">
                      <p className="font-medium text-foreground">{gate.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {gate.center} Center • {gate.circuit || 'Individual'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {activations.map((act, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 text-xs rounded ${
                            act.isConscious
                              ? 'bg-foreground/10 text-foreground'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {act.planet} L{act.line}
                        </span>
                      ))}
                    </div>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <div className="px-4 py-4 border-t border-border bg-secondary/10 space-y-4">
                    {/* Gate Description */}
                    <div>
                      <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                        Gate Theme
                      </h5>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {gate.keynotes.map((kn, i) => (
                          <span key={i} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                            {kn}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {gate.description}
                      </p>
                    </div>

                    {/* Line Activations */}
                    <div>
                      <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                        Your Line Activations
                      </h5>
                      <div className="space-y-3">
                        {activations.map((act, i) => {
                          const lineInfo = LINE_DESCRIPTIONS[act.line];
                          return (
                            <div
                              key={i}
                              className={`p-3 rounded border ${
                                act.isConscious
                                  ? 'border-border bg-card'
                                  : 'border-destructive/30 bg-destructive/5'
                              }`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono font-semibold">
                                  {gate.number}.{act.line}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded bg-muted">
                                  {act.planet}
                                </span>
                                <span className={`text-xs ${act.isConscious ? 'text-foreground' : 'text-destructive'}`}>
                                  {act.isConscious ? 'Conscious (Personality)' : 'Unconscious (Design)'}
                                </span>
                              </div>
                              {lineInfo && (
                                <div className="mt-2">
                                  <p className="text-sm font-medium">
                                    Line {act.line}: {lineInfo.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {lineInfo.theme}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                                    {lineInfo.description}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expression */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                          Conscious Expression
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {gate.consciousExpression}
                        </p>
                      </div>
                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                          Unconscious Expression
                        </h5>
                        <p className="text-sm text-muted-foreground">
                          {gate.unconsciousExpression}
                        </p>
                      </div>
                    </div>

                    {/* Gifts & Challenges */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                          Gifts
                        </h5>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          {gate.gifts.map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                          Challenges
                        </h5>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                          {gate.challenges.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};
