/**
 * One Vedic reading section: the chart-logic box on top, the human paragraph
 * underneath. Same structure approved for the Core Portrait.
 */

import { ChevronDown, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { VedicSectionData } from '@/lib/vedic/vedicReadings';

interface Props {
  section: VedicSectionData;
  defaultOpenTable?: boolean;
}

export const VedicSectionCard = ({ section, defaultOpenTable = false }: Props) => {
  const [showTable, setShowTable] = useState(defaultOpenTable);

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <header className="mb-4">
        <h3 className="font-serif text-xl text-foreground">{section.title}</h3>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{section.subtitle}</p>
      </header>

      {section.logic.length > 0 && (
        <div className="mb-5 rounded-md border border-primary/25 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-primary">
            <Sparkles size={12} />
            What the chart is showing
          </div>
          <ul className="space-y-1.5">
            {section.logic.map((line, i) => (
              <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-foreground/90">
                <span className="text-primary/70">·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-[15px] leading-[1.75] text-foreground/90">{section.paragraph}</p>

      {section.rows && section.rows.length > 0 && (
        <div className="mt-5">
          <button
            onClick={() => setShowTable(v => !v)}
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown size={13} className={`transition-transform ${showTable ? 'rotate-180' : ''}`} />
            {showTable ? 'Hide placements' : 'Show all placements'}
          </button>
          {showTable && (
            <div className="mt-3 overflow-hidden rounded-md border border-border">
              {section.rows.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex flex-wrap items-baseline justify-between gap-2 px-3 py-2 text-[13px] ${i % 2 ? 'bg-secondary/30' : ''}`}
                >
                  <span className="font-medium text-foreground">{row.label}</span>
                  <span className="text-muted-foreground">{row.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};
