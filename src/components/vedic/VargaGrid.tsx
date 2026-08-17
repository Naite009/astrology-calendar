/**
 * Compact divisional-chart grid. Shows each graha's sign and whole-sign house
 * inside one varga, with the classical purpose of the chart labelled.
 */

import { VargaChart } from '@/lib/vedic/divisionalCharts';

interface Props {
  varga: VargaChart;
}

export const VargaGrid = ({ varga }: Props) => (
  <div className="rounded-md border border-border bg-secondary/20 p-3">
    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
      <span className="text-sm font-medium text-foreground">{varga.label}</span>
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{varga.reads}</span>
    </div>
    {varga.lagnaSign && (
      <p className="mb-2 text-[12px] text-muted-foreground">Lagna: {varga.lagnaSign}</p>
    )}
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
      {varga.placements.map(p => (
        <div key={p.name} className="flex items-baseline justify-between gap-2 text-[12px]">
          <span className="text-foreground/90">{p.name}</span>
          <span className="text-muted-foreground">
            {p.sign}{p.house ? ` ${p.house}` : ''}{p.dignity === 'exalted' ? ' ↑' : p.dignity === 'debilitated' ? ' ↓' : ''}
          </span>
        </div>
      ))}
    </div>
  </div>
);
