import { ContradictionResolution } from '@/lib/solarReturnContradictions';
import { ArrowLeftRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Props {
  contradictions: ContradictionResolution[];
}

const CATEGORY_LABELS: Record<string, string> = {
  'house-axis': 'House Axis',
  'element-clash': 'Element Clash',
  'planet-tension': 'Planet Tension',
  'mode-conflict': 'Mode Conflict',
};

export const ContradictionCard = ({ contradictions }: Props) => {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  if (contradictions.length === 0) return null;

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1 flex items-center gap-1.5">
          <ArrowLeftRight size={12} /> Contradiction Resolution
        </div>
        <p className="text-[11px] text-muted-foreground">Where you may feel pulled in two directions — and how to integrate both</p>
      </div>

      <div className="divide-y divide-border">
        {contradictions.map((c, i) => {
          const isOpen = expandedIdx === i;
          return (
            <div key={i}>
              <button
                onClick={() => setExpandedIdx(isOpen ? null : i)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium">
                      {CATEGORY_LABELS[c.category] || c.category}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-foreground">{c.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {c.placement1} ↔ {c.placement2}
                  </div>
                </div>
                {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
              </button>

              {isOpen && (
                <div className="px-4 pb-4 space-y-3">
                  <div className="bg-muted/20 p-3 rounded-sm">
                    <div className="text-[10px] uppercase tracking-widest text-amber-600 font-medium mb-1">The Tension</div>
                    <p className="text-[11px] text-foreground leading-relaxed">{c.tension}</p>
                  </div>
                  <div className="bg-primary/5 p-3 rounded-sm">
                    <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">The Integration</div>
                    <p className="text-[11px] text-foreground leading-relaxed">{c.synthesis}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
