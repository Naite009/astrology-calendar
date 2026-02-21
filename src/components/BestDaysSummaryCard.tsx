import { useState, useEffect, useRef } from 'react';
import { Calendar, Sparkles, Star } from 'lucide-react';
import {
  getBestDaysSummary,
  getCategoryColor,
  getCategoryBg,
  BestDaySummary,
  BestDaysSummaryResult,
} from '@/lib/bestDaysSummary';
import { NatalChart } from '@/hooks/useNatalChart';
import { format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface BestDaysSummaryCardProps {
  natalChart: NatalChart | null;
  days?: number;
}

/* ── Quality label using pre-computed rating string ── */
const QualityBadge = ({ rating }: { rating: string }) => {
  let color = 'bg-muted/40 text-muted-foreground';
  let label = rating || 'Quiet';
  if (rating === 'Peak') { color = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'; label = '🔥 Peak'; }
  else if (rating === 'Strong') { color = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'; label = '✦ Strong'; }
  else if (rating === 'Good') { color = 'bg-blue-500/15 text-blue-600 dark:text-blue-400'; label = '● Good'; }
  else if (rating === 'Mild') { color = 'bg-amber-500/15 text-amber-600 dark:text-amber-400'; label = '○ Mild'; }

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold text-[10px] tracking-wide ${color}`}>
      {label}
    </span>
  );
};

/* ── Category card with top 3 days ── */
const CategoryCard = ({ summary }: { summary: BestDaySummary }) => {
  const today = new Date();
  const ranks = ['#1', '#2', '#3'];

  return (
    <div className={`rounded-xl p-3.5 ${getCategoryBg(summary.category)} transition-all`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg">{summary.emoji}</span>
        <p className="text-sm font-bold flex-1">{summary.label}</p>
      </div>

      {/* Top days */}
      <div className="space-y-2">
        {summary.topDays.map((day, i) => {
          const isToday = isSameDay(day.date, today);
          return (
            <div
              key={i}
              className={`flex items-center gap-2.5 py-2 px-2.5 rounded-lg ${
                i === 0 ? 'bg-background/80 shadow-sm border border-border/50' : 'bg-background/40'
              } ${isToday ? 'ring-1 ring-primary/40' : ''}`}
            >
              <span className={`text-[10px] font-bold w-5 text-center ${i === 0 ? getCategoryColor(summary.category) : 'text-muted-foreground'}`}>
                {ranks[i]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`text-xs ${i === 0 ? 'font-bold' : 'font-medium'}`}>
                    {format(day.date, 'EEE, MMM d')}
                  </p>
                  {isToday && (
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-3.5 bg-primary/10 text-primary border-0">
                      TODAY
                    </Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{day.reason}</p>
              </div>
              <QualityBadge rating={day.rating} />
            </div>
          );
        })}
        {summary.topDays.length === 0 && (
          <p className="text-xs text-muted-foreground italic px-2 py-2">No strong days in this period</p>
        )}
      </div>
    </div>
  );
};

export const BestDaysSummaryCard = ({ natalChart, days = 30 }: BestDaysSummaryCardProps) => {
  const [summary, setSummary] = useState<BestDaysSummaryResult | null>(null);
  const cacheRef = useRef<{ key: string; data: BestDaysSummaryResult } | null>(null);

  useEffect(() => {
    const cacheKey = `${natalChart?.planets?.Sun?.sign || 'none'}-${days}`;
    if (cacheRef.current?.key === cacheKey) {
      setSummary(cacheRef.current.data);
      return;
    }

    let cancelled = false;
    // Use requestIdleCallback if available, else setTimeout
    const schedule = typeof requestIdleCallback !== 'undefined' ? requestIdleCallback : (cb: () => void) => setTimeout(cb, 50);
    const id = schedule(() => {
      if (cancelled) return;
      const s = getBestDaysSummary(natalChart, new Date(), days);
      if (!cancelled) {
        cacheRef.current = { key: cacheKey, data: s };
        setSummary(s);
      }
    });
    return () => {
      cancelled = true;
      if (typeof cancelIdleCallback !== 'undefined' && typeof id === 'number') cancelIdleCallback(id);
    };
  }, [natalChart, days]);

  if (!summary) {
    return (
      <div className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Best Days at a Glance</h3>
            <p className="text-xs text-muted-foreground">Scanning transits…</p>
          </div>
        </div>
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    );
  }

  const today = new Date();
  const bestDayIsToday = isSameDay(summary.overallBestDay.date, today);

  return (
    <div className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Best Days at a Glance</h3>
            <p className="text-xs text-muted-foreground">
              Next {days} days • {natalChart ? 'Personalized' : 'General'}
            </p>
          </div>
        </div>
      </div>

      {summary.overallBestDay.categories.length >= 2 && (
        <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-[10px] font-bold tracking-widest text-amber-700 dark:text-amber-300 uppercase">Power Day</span>
            {bestDayIsToday && <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-primary-foreground">TODAY!</Badge>}
          </div>
          <p className="text-sm font-bold">{format(summary.overallBestDay.date, 'EEEE, MMMM d')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Peak for: {summary.overallBestDay.categories.map(c => {
              const s = summary.summaries.find(s => s.category === c);
              return s?.emoji || '';
            }).join(' ')} {summary.overallBestDay.categories.join(' & ')}
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {summary.summaries.map((s) => (
          <CategoryCard key={s.category} summary={s} />
        ))}
      </div>

      <p className="text-[10px] text-center text-muted-foreground mt-3 tracking-wide">
        {format(summary.period.start, 'MMM d')} – {format(summary.period.end, 'MMM d')} • Quality based on planetary transits
      </p>
    </div>
  );
};
