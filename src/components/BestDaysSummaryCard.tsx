import { useState, useEffect } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
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

/* ── Score badge ── */
const ScoreBadge = ({ score }: { score: number }) => {
  let color = 'bg-muted/40 text-muted-foreground';
  let label = 'Low';
  if (score >= 120) { color = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'; label = 'Exceptional'; }
  else if (score >= 90) { color = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'; label = 'Excellent'; }
  else if (score >= 60) { color = 'bg-blue-500/20 text-blue-700 dark:text-blue-300'; label = 'Good'; }
  else if (score >= 30) { color = 'bg-amber-500/20 text-amber-700 dark:text-amber-300'; label = 'Fair'; }

  return (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-medium text-[9px] ${color}`}>
      {label}
    </span>
  );
};

/* ── Category card with top 3 days inline ── */
const CategoryCard = ({ summary }: { summary: BestDaySummary }) => {
  const medals = ['🥇', '🥈', '🥉'];
  const today = new Date();

  return (
    <div className={`rounded-lg p-3 ${getCategoryBg(summary.category)} transition-all`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-lg">{summary.emoji}</span>
        <p className="text-sm font-semibold flex-1">{summary.label}</p>
      </div>

      {/* Top 3 days */}
      <div className="space-y-1.5">
        {summary.topDays.map((day, i) => {
          const isToday = isSameDay(day.date, today);
          return (
            <div
              key={i}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-md ${
                i === 0 ? 'bg-background/80 shadow-sm' : 'bg-background/40'
              } ${isToday ? 'ring-1 ring-primary/40' : ''}`}
            >
              <span className="text-sm shrink-0">{medals[i]}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${i === 0 ? 'font-bold' : 'font-medium'}`}>
                  {format(day.date, 'EEE, MMM d')}
                  {isToday && <span className="ml-1 text-primary text-[9px]">TODAY</span>}
                </p>
                <p className="text-[9px] text-muted-foreground truncate">{day.reason}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className={`text-[10px] font-bold ${i === 0 ? getCategoryColor(summary.category) : ''}`}>
                  {day.score}pts
                </span>
              </div>
            </div>
          );
        })}
        {summary.topDays.length === 0 && (
          <p className="text-xs text-muted-foreground italic px-2">No strong days found</p>
        )}
      </div>
    </div>
  );
};

export const BestDaysSummaryCard = ({ natalChart, days = 30 }: BestDaysSummaryCardProps) => {
  const [summary, setSummary] = useState<BestDaysSummaryResult | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (cancelled) return;
      const s = getBestDaysSummary(natalChart, new Date(), days);
      if (!cancelled) setSummary(s);
    }, 100);
    return () => { cancelled = true; clearTimeout(timer); };
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
            <p className="text-xs text-muted-foreground">Calculating…</p>
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
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
              Next {days} days • {natalChart ? 'Personalized' : 'General'} • Top 3 per category
            </p>
          </div>
        </div>
      </div>

      {summary.overallBestDay.categories.length >= 2 && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">POWER DAY</span>
            {bestDayIsToday && <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-primary-foreground">TODAY!</Badge>}
          </div>
          <p className="text-sm font-medium">{format(summary.overallBestDay.date, 'EEEE, MMMM d')}</p>
          <p className="text-xs text-muted-foreground">
            Best for: {summary.overallBestDay.categories.map(c => {
              const s = summary.summaries.find(s => s.category === c);
              return s?.emoji || '';
            }).join(' ')} {summary.overallBestDay.categories.join(', ')}
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {summary.summaries.map((s) => (
          <CategoryCard key={s.category} summary={s} />
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground mt-3">
        {format(summary.period.start, 'MMM d')} – {format(summary.period.end, 'MMM d')}
      </p>
    </div>
  );
};
