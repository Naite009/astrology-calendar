/**
 * Ashtakavarga: the classical point score for every sign and house.
 * Shows the SAV totals with their band, and each graha's own BAV row
 * underneath, so the number is always traceable.
 */

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import {
  AshtakavargaReport,
  ASHTAKAVARGA_NOTE,
  SAV_BAND_MEANING,
  SavBand,
} from '@/lib/vedic/ashtakavarga';
import { VedicTerm } from './VedicTerm';

interface Props {
  report: AshtakavargaReport;
}

const BAND: Record<SavBand, { label: string; bar: string; text: string }> = {
  strong: { label: 'Above average', bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
  average: { label: 'Around average', bar: 'bg-primary', text: 'text-primary' },
  weak: { label: 'Below average', bar: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
};

export const AshtakavargaCard = ({ report }: Props) => {
  const [showRows, setShowRows] = useState(false);

  return (
    <section className="rounded-lg border border-border bg-card p-5 md:p-6">
      <h3 className="font-serif text-xl">Where Your Chart Has Support</h3>
      <p className="mb-4 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        <VedicTerm term="Ashtakavarga" /> point scores, the classical timing filter
      </p>

      <p className="mb-4 text-sm leading-relaxed text-foreground/85">{ASHTAKAVARGA_NOTE}</p>

      <div className="space-y-1.5">
        {report.sav.map(s => {
          const b = BAND[s.band];
          return (
            <div key={s.sign} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-[13px]">{s.sign}</span>
              <span className="w-16 shrink-0 text-[12px] text-muted-foreground">
                {s.house ? `house ${s.house}` : ''}
              </span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                <span className={`block h-full rounded-full ${b.bar}`} style={{ width: `${Math.min(100, (s.bindus / 40) * 100)}%` }} />
              </span>
              <span className={`w-8 shrink-0 text-right text-[13px] font-medium ${b.text}`}>{s.bindus}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 space-y-3">
        {report.plain.map((p, i) => (
          <p key={i} className="text-[15px] leading-relaxed text-foreground/90">{p}</p>
        ))}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {(['strong', 'average', 'weak'] as SavBand[]).map(band => (
          <div key={band} className="rounded-md border border-border/70 p-3">
            <p className={`text-[11px] uppercase tracking-widest ${BAND[band].text}`}>{BAND[band].label}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{SAV_BAND_MEANING[band]}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => setShowRows(!showRows)}
        className="mt-4 flex items-center gap-1 text-xs font-medium text-primary"
      >
        {showRows ? 'Hide' : 'Show'} each planet's own score row
        <ChevronDown size={13} className={showRows ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>

      {showRows && (
        <div className="mt-3 overflow-x-auto rounded-md border border-border">
          <table className="w-full text-[12px]">
            <thead className="bg-secondary/30">
              <tr>
                <th className="p-2 text-left font-medium">Graha</th>
                {report.sav.map(s => (
                  <th key={s.sign} className="p-2 font-medium">{s.sign.slice(0, 3)}</th>
                ))}
                <th className="p-2 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {report.bav.map(row => (
                <tr key={row.planet} className="border-t border-border/60">
                  <td className="p-2 font-medium">{row.planet}</td>
                  {row.bySignIndex.map((v, i) => (
                    <td key={i} className={`p-2 text-center ${v >= 5 ? 'text-emerald-700 dark:text-emerald-300' : v <= 2 ? 'text-amber-700 dark:text-amber-300' : ''}`}>
                      {v}
                    </td>
                  ))}
                  <td className="p-2 text-center text-muted-foreground">{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-border/60 p-2 text-[11px] leading-relaxed text-muted-foreground">
            A planet's own row is the finer filter. Five or more of its own points in the sign it is crossing usually means
            that transit behaves well even in an average sign, and two or fewer means it tends to underdeliver even in a
            strong one.
          </p>
        </div>
      )}
    </section>
  );
};
