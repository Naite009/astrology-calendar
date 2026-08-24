/**
 * Period and transit read as one statement, which is how Jyotish judges timing.
 * The dasha lord's own transit is weighted first, the sub-period lord second,
 * and unrelated slow transits are labelled as background.
 */

import { DashaGocharaSynthesis } from '@/lib/vedic/dashaGocharaSynthesis';

interface Props {
  synthesis: DashaGocharaSynthesis;
}

const WEIGHT_CLS = {
  primary: 'border-primary/40 bg-primary/5',
  secondary: 'border-border bg-secondary/20',
  background: 'border-border/60 bg-secondary/10',
} as const;

const WEIGHT_LABEL = {
  primary: 'Weighed first',
  secondary: 'Near-term tone',
  background: 'Background only',
} as const;

export const DashaTransitCard = ({ synthesis }: Props) => (
  <section className="rounded-lg border border-border bg-card p-5 md:p-6">
    <h3 className="font-serif text-xl">Your Period and the Sky, Read Together</h3>
    <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
      Dasha and gochara as one statement, not two
    </p>

    <p className="mb-3 font-serif text-[15px] leading-relaxed">{synthesis.headline}</p>
    <p className="mb-4 text-sm leading-relaxed text-foreground/85">{synthesis.verdict}</p>

    <div className="space-y-2">
      {synthesis.lines.map((l, i) => (
        <div key={`${l.graha}-${i}`} className={`rounded-md border p-4 ${WEIGHT_CLS[l.weight]}`}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-serif text-[14px]">{l.label}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{WEIGHT_LABEL[l.weight]}</span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed">{l.plain}</p>
          {l.transit?.vedha.blocked && (
            <p className="mt-2 text-[12px] leading-relaxed text-amber-700 dark:text-amber-300">
              Obstruction active: {l.transit.vedha.plain}
            </p>
          )}
        </div>
      ))}
    </div>

    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {synthesis.worksNow.length > 0 && (
        <div className="rounded-md border border-emerald-500/40 bg-emerald-500/5 p-4">
          <p className="text-[11px] uppercase tracking-widest text-emerald-700 dark:text-emerald-300">
            What this combination supports
          </p>
          <ul className="mt-2 space-y-1.5">
            {synthesis.worksNow.map((w, i) => (
              <li key={i} className="text-[13px] leading-relaxed">{w}</li>
            ))}
          </ul>
        </div>
      )}
      {synthesis.costsNow.length > 0 && (
        <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-4">
          <p className="text-[11px] uppercase tracking-widest text-amber-700 dark:text-amber-300">
            What it makes expensive
          </p>
          <ul className="mt-2 space-y-1.5">
            {synthesis.costsNow.map((c, i) => (
              <li key={i} className="text-[13px] leading-relaxed">{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>

    <p className="mt-4 rounded-md border border-border/60 bg-secondary/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
      {synthesis.note}
    </p>
  </section>
);
