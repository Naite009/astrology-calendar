/**
 * The full shodashavarga browser: all sixteen divisional charts, one at a time,
 * with a note about what each magnifies and a warning where a chart is too
 * birth-time sensitive to trust.
 */

import { useState } from 'react';
import { VargaChart, VargaKey, ALL_VARGAS, VARGA_LABELS, VARGA_NOTE } from '@/lib/vedic/divisionalCharts';

interface Props {
  vargas: Partial<Record<VargaKey, VargaChart>>;
  exactBirthTime: boolean;
}

/** Charts that shift on a minute or two of birth-time error. */
const TIME_SENSITIVE: VargaKey[] = ['D27', 'D30', 'D40', 'D45', 'D60'];

export const VargaBrowser = ({ vargas, exactBirthTime }: Props) => {
  const available = ALL_VARGAS.filter(k => vargas[k]);
  const [active, setActive] = useState<VargaKey>(available.includes('D9') ? 'D9' : available[0]);
  const chart = vargas[active];
  if (!chart) return null;

  const label = VARGA_LABELS[active];
  const risky = TIME_SENSITIVE.includes(active) && !exactBirthTime;

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <h3 className="font-serif text-xl">All Sixteen Divisional Charts</h3>
      <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        The classical shodashavarga set, each one a magnifying lens on the same life
      </p>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {available.map(k => (
          <button
            key={k}
            onClick={() => setActive(k)}
            className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
              active === k ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground/80 hover:bg-secondary/70'
            }`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="rounded-md border border-border/70 p-4">
        <p className="font-serif text-lg">{label.name}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">Reads {label.reads}.</p>
        <p className="mt-2 text-[13px] leading-relaxed text-foreground/85">{label.plain}</p>

        {risky && (
          <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/5 p-3 text-[12px] leading-relaxed">
            This division changes with a minute or two of birth-time difference. The birth time on this chart is not
            recorded as exact, so treat everything below as indicative rather than settled.
          </p>
        )}

        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {chart.lagnaSign && (
            <div className="rounded-md bg-secondary/25 p-2.5">
              <p className="text-[10px] uppercase tracking-widest text-primary">Lagna</p>
              <p className="text-[13px]">{chart.lagnaSign}</p>
            </div>
          )}
          {chart.placements.map(p => (
            <div key={p.name} className="rounded-md bg-secondary/25 p-2.5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{p.name}</p>
              <p className="text-[13px]">
                {p.sign}{p.house ? `, house ${p.house}` : ''}
                {p.dignity !== 'neutral' && (
                  <span className={p.dignity === 'debilitated' ? 'text-amber-700 dark:text-amber-300' : 'text-emerald-700 dark:text-emerald-300'}>
                    {' '}({p.dignity})
                  </span>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 rounded-md border border-border/60 bg-secondary/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
        {VARGA_NOTE} Most readings only use a handful of these. The rest are here so nothing is hidden, not because every
        one needs to be interpreted.
      </p>
    </section>
  );
};
