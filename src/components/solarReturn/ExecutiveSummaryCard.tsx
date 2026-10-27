import { ExecutiveSummary } from '@/lib/solarReturnExecutiveSummary';
import { Target, ListOrdered, Info } from 'lucide-react';

interface Props {
  summary: ExecutiveSummary;
}

export const ExecutiveSummaryCard = ({ summary }: Props) => (
  <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
    {summary.leadTheme && (
      <div className="p-5 bg-primary/5 border-b border-primary/10">
        <div className="text-[10px] uppercase tracking-widest text-primary font-medium mb-1">Most emphasized area</div>
        <h2 className="text-xl font-serif text-foreground">{summary.leadTheme}</h2>
      </div>
    )}

    {summary.coreFocus && (
      <div className="p-5 border-b border-border">
        <div className="flex items-start gap-2">
          <Target size={16} className="text-primary mt-0.5 shrink-0" />
          <div className="space-y-2">
            <div className="text-[10px] uppercase tracking-widest text-primary font-medium">Core focus</div>
            {summary.coreFocus.split('\n').map((p, i) => (
              <p key={i} className="text-sm text-foreground leading-relaxed">{p}</p>
            ))}
          </div>
        </div>
      </div>
    )}

    <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <ListOrdered size={14} className="text-primary" />
          <span className="text-[10px] uppercase tracking-widest font-medium text-primary">Ranked priorities</span>
        </div>
        <div className="space-y-3">
          {summary.priorities.map(p => (
            <div key={p.rank} className="space-y-0.5">
              <span className="text-xs font-medium text-foreground">{p.rank}. {p.title}</span>
              {p.description && <p className="text-[11px] text-muted-foreground leading-relaxed">{p.description}</p>}
              <p className="text-[9px] text-muted-foreground/70">{p.source}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Info size={14} className="text-muted-foreground" />
          <span className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">What the chart emphasizes</span>
        </div>
        <ul className="space-y-1.5">
          {summary.evidenceHierarchy.map((h, i) => (
            <li key={i} className="text-[11px] text-foreground"><span className="font-medium">{h.label}:</span> <span className="text-muted-foreground">{h.detail}</span></li>
          ))}
        </ul>
        <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">{summary.methodNote}</p>
      </div>
    </div>
  </div>
);
