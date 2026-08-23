/**
 * Vimshottari dasha timeline. The current mahadasha is highlighted, and each
 * period can be expanded to show its sub-periods with real dates.
 *
 * The first period is the balance of the birth nakshatra lord's chapter that
 * was still remaining at birth, so it starts at birth and is usually short.
 */

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  DashaPeriod, CurrentDasha, formatDashaRange, formatAgeRange, formatYears, formatDashaDateExact,
} from '@/lib/vedic/vimshottariDasha';
import { dashaCopy } from '@/lib/vedic/interpretations/dashaCopy';
import { VedicTerm } from './VedicTerm';

interface Props {
  periods: DashaPeriod[];
  current: CurrentDasha | null;
  birthMoment?: Date;
}

export const DashaTimeline = ({ periods, current, birthMoment }: Props) => {
  const [open, setOpen] = useState<string | null>(current ? `${current.maha.lord}-${current.maha.start.getTime()}` : null);

  if (!periods.length) return null;

  const balance = periods[0]?.isBirthBalance ? periods[0] : null;

  return (
    <div className="rounded-lg border border-border bg-card p-5 md:p-6">
      <h3 className="font-serif text-xl">Your Life Periods</h3>
      <p className="mb-1 mt-1 text-xs uppercase tracking-widest text-muted-foreground">
        <VedicTerm term="Vimshottari">Vimshottari</VedicTerm> <VedicTerm term="Mahadasha">mahadasha</VedicTerm> and{' '}
        <VedicTerm term="Antardasha">antardasha</VedicTerm>
      </p>
      <p className="mt-2 text-sm leading-relaxed text-foreground/85">
        A mahadasha is a long planetary chapter of life and an antardasha is a smaller chapter inside it. The planet named
        only shows which kind of growth tends to take the lead. It is not a calendar of when you are allowed to have love,
        money, family or success, all of which can happen in any period.
      </p>
      {balance && (
        <p className="mt-2 rounded-md border border-border/60 bg-secondary/25 p-3 text-[12px] leading-relaxed text-muted-foreground">
          Timed from the exact sidereal Moon. At birth, {formatYears(balance.years)} of the {balance.lord} period
          ({balance.fullYears} years in full) was still remaining, so that balance runs from birth to{' '}
          {formatDashaDateExact(balance.end)} and every later period is chained from there.
        </p>
      )}

      <div className="mt-4 space-y-2">
        {periods.map(p => {
          const key = `${p.lord}-${p.start.getTime()}`;
          const isCurrent = current?.maha.start.getTime() === p.start.getTime();
          const isPast = p.end < new Date();
          const copy = dashaCopy(p.lord);
          return (
            <div key={key} className={`rounded-md border ${isCurrent ? 'border-primary bg-primary/5' : 'border-border'}`}>
              <button
                onClick={() => setOpen(open === key ? null : key)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
              >
                <ChevronRight size={14} className={`shrink-0 text-muted-foreground transition-transform ${open === key ? 'rotate-90' : ''}`} />
                <span className={`w-20 shrink-0 text-sm font-medium ${isPast && !isCurrent ? 'text-muted-foreground' : 'text-foreground'}`}>
                  {p.lord}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDashaRange(p)}
                  {birthMoment ? ` · ${formatAgeRange(p, birthMoment)}` : ''}
                  {p.isBirthBalance ? ` · balance at birth, ${formatYears(p.years)}` : ''}
                </span>
                <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">{copy.title}</span>
                {isCurrent && (
                  <span className="ml-2 shrink-0 rounded-full bg-primary px-2 py-0.5 text-[10px] uppercase tracking-widest text-primary-foreground">
                    now
                  </span>
                )}
              </button>

              {open === key && (
                <div className="border-t border-border/60 px-3 py-3">
                  <p className="mb-3 text-[13px] leading-relaxed text-foreground/85">
                    During this chapter, {p.lord} tends to put more emphasis on this part of life. It may ask {copy.asks}.
                    It can bring {copy.gives}. Watch for {copy.trap}.
                  </p>
                  <div className="space-y-1">
                    {(p.sub || []).map(s => {
                      const isNow = current?.antar?.start.getTime() === s.start.getTime();
                      return (
                        <div
                          key={`${s.subLord}-${s.start.getTime()}`}
                          className={`flex items-baseline justify-between gap-2 rounded px-2 py-1 text-[12px] ${isNow ? 'bg-primary/10 text-foreground' : 'text-muted-foreground'}`}
                        >
                          <span>{p.lord} · {s.subLord}</span>
                          <span>{formatDashaDateExact(s.start)} to {formatDashaDateExact(s.end)}{isNow ? ' · current' : ''}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
