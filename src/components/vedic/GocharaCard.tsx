/**
 * Gochara: the sign-based transit read, counted from the natal Moon and from
 * the rising sign. Includes Sade Sati, described as pressure and never as
 * disaster.
 */

import { GocharaReport, GOCHARA_NOTE, VEDHA_NOTE, BINDU_FILTER_NOTE } from '@/lib/vedic/gochara';
import { VedicTerm } from './VedicTerm';

interface Props {
  gochara: GocharaReport;
  moonSign: string;
}

const NET_LABEL = {
  works: 'Worth acting on',
  mixed: 'Genuinely mixed',
  maintenance: 'Upkeep, not launch',
} as const;

const QUALITY_CLS = {
  favourable: 'border-emerald-500/40 bg-emerald-500/5',
  mixed: 'border-border bg-secondary/15',
  difficult: 'border-amber-500/40 bg-amber-500/5',
} as const;

export const GocharaCard = ({ gochara, moonSign }: Props) => {
  const { transits, moonToday, sadeSati, dashaLordTransit } = gochara;

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <h3 className="font-serif text-xl">What Is Moving Right Now</h3>
      <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        <VedicTerm term="Gochara">Gochara</VedicTerm>, transits counted by sign from your Moon in {moonSign}
      </p>

      {dashaLordTransit && (
        <div className="mb-4 rounded-md border border-primary/40 bg-primary/5 p-4">
          <p className="text-[11px] uppercase tracking-widest text-primary">
            Your current period lord, {dashaLordTransit.graha}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{dashaLordTransit.plain}</p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            This is the transit to weigh most heavily, because a transit tends to land hardest when it belongs to the
            period you are already living in.
          </p>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {transits.map(t => (
          <div key={t.graha} className={`rounded-md border p-4 ${QUALITY_CLS[t.quality]}`}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-serif text-[15px]">{t.graha} in {t.sign}</span>
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {NET_LABEL[t.netVerdict]}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t.fromMoon} from the Moon{t.bindus.sav !== null ? `, ${t.bindus.sav} bindus in this sign` : ''}
              {t.vedha.blocked ? ', obstruction active' : ''}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t.nakshatra} nakshatra{t.dignity !== 'neutral' ? `, ${t.dignity}` : ''}{t.retrograde ? ', retrograde' : ''}
            </p>
            <p className="mt-2 text-[13px] leading-relaxed">{t.plain}</p>
          </div>
        ))}
      </div>

      {sadeSati && (
        <div className={`mt-4 rounded-md border p-4 ${sadeSati.active ? 'border-amber-500/40 bg-amber-500/5' : 'border-border bg-secondary/15'}`}>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
            <VedicTerm term="Sade Sati">Sade Sati</VedicTerm>, the Saturn passage over the Moon
          </p>
          <p className="mt-1 text-[13px] leading-relaxed">{sadeSati.plain}</p>
        </div>
      )}

      {moonToday && (
        <div className="mt-3 rounded-md border border-border/60 bg-secondary/15 p-3">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Today's Moon, flavour only</p>
          <p className="mt-1 text-[13px] leading-relaxed">{moonToday.plain}</p>
        </div>
      )}

      <p className="mt-4 rounded-md border border-border/60 bg-secondary/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
        {GOCHARA_NOTE}
      </p>

      <p className="mt-2 rounded-md border border-border/60 bg-secondary/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
        {VEDHA_NOTE}
      </p>

      {gochara.bindusAvailable && (
        <p className="mt-2 rounded-md border border-border/60 bg-secondary/20 p-3 text-[12px] leading-relaxed text-muted-foreground">
          {BINDU_FILTER_NOTE}
        </p>
      )}
    </section>
  );
};
