import { ActionGuidance } from '@/lib/solarReturnActionGuidance';
import { ChevronDown, ChevronUp, Check, X, Zap } from 'lucide-react';
import { useState } from 'react';

interface Props {
  guidance: ActionGuidance[];
}

export const ActionGuidanceCard = ({ guidance }: Props) => {
  const [expanded, setExpanded] = useState<number | null>(0);

  if (!guidance.length) return null;

  return (
    <div className="border border-border rounded-sm bg-card">
      <div className="p-5 border-b border-border">
        <h3 className="text-sm uppercase tracking-widest font-medium text-foreground flex items-center gap-2">
          <Zap size={16} className="text-primary" />
          Your Year's Playbook
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          What to lean into, what to avoid, and the best use of each energy
        </p>
      </div>

      <div className="divide-y divide-border">
        {guidance.map((g, i) => (
          <div key={i}>
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{g.planetSymbol}</span>
                <span className="text-xs font-medium text-foreground">{g.placement}</span>
              </div>
              {expanded === i ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {expanded === i && (
              <div className="px-4 pb-4 space-y-3">
                {/* Lean Into */}
                <div className="flex items-start gap-2">
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Check size={12} className="text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-emerald-600 font-medium mb-0.5">Lean Into</div>
                    <p className="text-xs text-foreground leading-relaxed">{g.leanInto}</p>
                  </div>
                </div>

                {/* Avoid */}
                <div className="flex items-start gap-2">
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-red-500/10 flex items-center justify-center">
                    <X size={12} className="text-red-500" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-red-500 font-medium mb-0.5">Avoid</div>
                    <p className="text-xs text-foreground leading-relaxed">{g.avoid}</p>
                  </div>
                </div>

                {/* Best Use */}
                <div className="flex items-start gap-2">
                  <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Zap size={12} className="text-primary" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-0.5">Best Use of This Energy</div>
                    <p className="text-xs text-foreground leading-relaxed">{g.bestUse}</p>
                  </div>
                </div>

                {/* Timing note */}
                {g.timing && (
                  <div className="bg-muted/30 rounded-sm px-3 py-2 mt-2">
                    <p className="text-[10px] text-muted-foreground italic">⏱ {g.timing}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
