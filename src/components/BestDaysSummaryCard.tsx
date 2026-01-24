import { useMemo } from 'react';
import { Calendar, Star, Sparkles } from 'lucide-react';
import { getBestDaysSummary, getCategoryColor, getCategoryBg, BestDaySummary } from '@/lib/bestDaysSummary';
import { NatalChart } from '@/hooks/useNatalChart';
import { format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface BestDaysSummaryCardProps {
  natalChart: NatalChart | null;
  days?: number;
}

const CategoryRow = ({ summary, isToday }: { summary: BestDaySummary; isToday: boolean }) => (
  <div className={`flex items-center justify-between p-2.5 rounded-lg ${getCategoryBg(summary.category)} transition-all hover:shadow-sm`}>
    <div className="flex items-center gap-2">
      <span className="text-lg">{summary.emoji}</span>
      <div>
        <p className="text-sm font-medium">{summary.label}</p>
        <p className="text-xs text-muted-foreground truncate max-w-[140px]">
          {summary.topReason}
        </p>
      </div>
    </div>
    <div className="text-right">
      <div className="flex items-center gap-1">
        <p className={`text-sm font-semibold ${getCategoryColor(summary.category)}`}>
          {format(summary.bestDay, 'MMM d')}
        </p>
        {isToday && (
          <Badge className="text-[10px] px-1 py-0 bg-primary">TODAY</Badge>
        )}
      </div>
      <p className="text-xs text-amber-500">{summary.rating}</p>
    </div>
  </div>
);

export const BestDaysSummaryCard = ({ natalChart, days = 30 }: BestDaysSummaryCardProps) => {
  const summary = useMemo(() => {
    return getBestDaysSummary(natalChart, new Date(), days);
  }, [natalChart, days]);
  
  const today = new Date();
  
  // Separate into top 4 categories for display
  const displaySummaries = summary.summaries.slice(0, 6);
  
  // Check if overall best day is today
  const bestDayIsToday = isSameDay(summary.overallBestDay.date, today);
  
  return (
    <div className="p-4 rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      {/* Header */}
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
      
      {/* Power Day Highlight */}
      {summary.overallBestDay.categories.length >= 2 && (
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-amber-500" />
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              POWER DAY
            </span>
            {bestDayIsToday && (
              <Badge className="text-[10px] px-1.5 py-0 bg-amber-500">TODAY!</Badge>
            )}
          </div>
          <p className="text-sm font-medium">
            {format(summary.overallBestDay.date, 'EEEE, MMMM d')}
          </p>
          <p className="text-xs text-muted-foreground">
            Best for: {summary.overallBestDay.categories.map(c => {
              const s = summary.summaries.find(s => s.category === c);
              return s?.emoji || '';
            }).join(' ')} {summary.overallBestDay.categories.join(', ')}
          </p>
        </div>
      )}
      
      {/* Category Grid */}
      <div className="grid gap-2">
        {displaySummaries.map((s) => (
          <CategoryRow 
            key={s.category} 
            summary={s} 
            isToday={isSameDay(s.bestDay, today)}
          />
        ))}
      </div>
      
      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground mt-3">
        {format(summary.period.start, 'MMM d')} - {format(summary.period.end, 'MMM d')}
      </p>
    </div>
  );
};
