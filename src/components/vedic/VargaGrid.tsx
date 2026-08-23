/**
 * Compact divisional-chart grid. Shows each graha's sign and whole-sign house
 * inside one varga, with a beginner-facing description of what the chart is for
 * and an info note so nobody reads a varga as a second personality chart.
 */

import { Info } from 'lucide-react';
import { VargaChart, VARGA_NOTE } from '@/lib/vedic/divisionalCharts';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  varga: VargaChart;
}

export const VargaGrid = ({ varga }: Props) => (
  <div className="rounded-md border border-border bg-secondary/20 p-3">
    <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
      <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
        {varga.label}
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" aria-label={`What ${varga.label} is used for`} className="text-muted-foreground hover:text-primary">
              <Info size={12} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 text-[13px] leading-relaxed">
            <p className="font-medium">{varga.plain}</p>
            <p className="mt-2 text-muted-foreground">{VARGA_NOTE}</p>
          </PopoverContent>
        </Popover>
      </span>
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{varga.reads}</span>
    </div>
    <p className="mb-2 text-[12px] leading-relaxed text-muted-foreground">{varga.plain}</p>
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
