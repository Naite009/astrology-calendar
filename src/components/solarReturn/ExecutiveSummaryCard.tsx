import { ExecutiveSummary } from '@/lib/solarReturnExecutiveSummary';
import { Flame, Shield, Target, Repeat, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Props {
  summary: ExecutiveSummary;
}

export const ExecutiveSummaryCard = ({ summary }: Props) => {
  const [showPatterns, setShowPatterns] = useState(false);

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      {/* Year Archetype */}
      <div className="p-5 bg-primary/5 border-b border-primary/10">
        <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Year Archetype</div>
        <h2 className="text-xl font-serif text-foreground">{summary.yearArchetype}</h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{summary.yearArchetypeDescription}</p>
      </div>

      {/* Core Focus */}
      <div className="p-5 border-b border-border">
        <div className="flex items-start gap-2">
          <Target size={16} className="text-primary mt-0.5 shrink-0" />
          <div>
            <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Core Focus</div>
            <p className="text-sm text-foreground leading-relaxed font-medium">{summary.coreFocus}</p>
          </div>
        </div>
      </div>

      {/* Top 3 Opportunities & Challenges side by side */}
      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {/* Opportunities */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Flame size={14} className="text-emerald-600" />
            <span className="text-[10px] uppercase tracking-widest font-medium text-emerald-600">Top Opportunities</span>
          </div>
          <div className="space-y-3">
            {summary.opportunities.map((o, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {i + 1}. {o.title}
                  </span>
                  <IntensityPips value={o.intensity} color="emerald" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{o.description}</p>
                <p className="text-[9px] text-muted-foreground/60">{o.source}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Shield size={14} className="text-amber-600" />
            <span className="text-[10px] uppercase tracking-widest font-medium text-amber-600">Worth Knowing</span>
          </div>
          <div className="space-y-3">
            {summary.challenges.map((c, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground">
                    {i + 1}. {c.title}
                  </span>
                  <IntensityPips value={c.intensity} color="amber" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{c.description}</p>
                <p className="text-[9px] text-muted-foreground/60">{c.source}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pattern Recognition */}
      {summary.patterns.length > 0 && (
        <div className="border-t border-border">
          <button
            onClick={() => setShowPatterns(!showPatterns)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Repeat size={14} className="text-primary" />
              <span className="text-xs uppercase tracking-widest font-medium text-foreground">
                Pattern Recognition — "You've Seen This Before"
              </span>
            </div>
            {showPatterns ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showPatterns && (
            <div className="px-4 pb-4 space-y-3">
              {summary.patterns.map((p, i) => (
                <div key={i} className="border border-border rounded-sm p-3 bg-muted/10">
                  <div className="flex items-start gap-2 mb-1">
                    <span className={`shrink-0 text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                      p.category === 'natal-echo' ? 'bg-purple-500/10 text-purple-600 border-purple-200' :
                      p.category === 'eclipse' ? 'bg-red-500/10 text-red-600 border-red-200' :
                      p.category === 'cycle' ? 'bg-blue-500/10 text-blue-600 border-blue-200' :
                      'bg-muted text-muted-foreground border-border'
                    }`}>
                      {p.category === 'natal-echo' ? 'Natal Echo' :
                       p.category === 'eclipse' ? 'Eclipse' :
                       p.category === 'cycle' ? 'Cycle' : 'Recurring'}
                    </span>
                    <span className="text-xs font-medium text-foreground">{p.pattern}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{p.description}</p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 italic">{p.connection}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const IntensityPips = ({ value, color }: { value: number; color: 'emerald' | 'amber' }) => {
  const filled = Math.min(5, Math.ceil(value / 2));
  const colorClass = color === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500';
  return (
    <div className="flex gap-0.5 ml-auto">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className={`w-1 h-1 rounded-full ${i < filled ? colorClass : 'bg-muted'}`} />
      ))}
    </div>
  );
};
