/**
 * The gate card: the three or four factors that actually run the chart.
 * Everything below it in the tab is detail on top of these.
 */

import { ChartDriverGate } from '@/lib/vedic/chartDrivers';

interface Props {
  gate: ChartDriverGate;
  name: string;
}

const BAND_CLS: Record<string, string> = {
  strong: 'border-emerald-500/40 bg-emerald-500/5',
  workable: 'border-border bg-secondary/15',
  strained: 'border-amber-500/40 bg-amber-500/5',
};

const BAND_LABEL: Record<string, string> = {
  strong: 'strong condition',
  workable: 'workable condition',
  strained: 'strained condition',
};

export const ChartDriversCard = ({ gate, name }: Props) => {
  if (!gate.drivers.length) return null;

  return (
    <section className="rounded-lg border border-primary/40 bg-primary/5 p-5 md:p-6">
      <h3 className="font-serif text-xl">What Actually Runs This Chart</h3>
      <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-primary">
        Read this before anything else
      </p>

      <p className="mb-4 text-sm leading-relaxed text-foreground/90">{gate.summary}</p>

      <div className="grid gap-3 md:grid-cols-2">
        {gate.drivers.map(d => (
          <div key={`${d.role}-${d.graha}`} className={`rounded-md border p-4 ${BAND_CLS[d.band || 'workable']}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-serif text-[15px]">{d.graha}</span>
              <span className="rounded-full bg-background/60 px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                {d.role}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">{d.placement}</p>
            {d.band && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {BAND_LABEL[d.band]}
                {d.conditionIndex !== null ? `, ${d.conditionIndex} out of 100` : ''}
              </p>
            )}
            <p className="mt-2 text-[13px] leading-relaxed">{d.reads}</p>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">Why it is on this list: {d.why}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 rounded-md border border-border/60 bg-background/50 p-3 text-[12px] leading-relaxed text-muted-foreground">
        {gate.note} This is {name}'s chart read at the top level only.
      </p>
    </section>
  );
};
