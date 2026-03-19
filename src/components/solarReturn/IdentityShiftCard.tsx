import { IdentityShift } from '@/lib/solarReturnIdentityShift';
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface Props {
  shift: IdentityShift;
}

export const IdentityShiftCard = ({ shift }: Props) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      {/* Header */}
      <div className="p-5 bg-primary/5 border-b border-primary/10">
        <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1 flex items-center gap-1.5">
          <Sparkles size={12} /> Who You Are Becoming
        </div>
        <h2 className="text-xl font-serif text-foreground">{shift.headline}</h2>
      </div>

      {/* Narrative */}
      <div className="p-5 border-b border-border">
        <p className="text-sm text-foreground leading-relaxed">{shift.becomingNarrative}</p>
      </div>

      {/* Three Pillars */}
      <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {shift.pillars.map((pillar, i) => (
          <div key={i} className="p-4">
            <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-2">{pillar.label}</div>
            <div className="text-sm font-medium text-foreground mb-1">{pillar.placement}</div>
            <div className="text-[10px] uppercase tracking-wider text-primary/70 mb-2">{pillar.keyword}</div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{pillar.description}</p>
          </div>
        ))}
      </div>

      {/* Tension Note */}
      {shift.tensionNote && (
        <div className="p-4 bg-muted/30 border-t border-border">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
            <div>
              <div className="text-[10px] uppercase tracking-widest text-amber-600 font-medium mb-1">Creative Tension</div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{shift.tensionNote}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
