import { useMemo, useState } from 'react';
import { Calendar, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import {
  getBestDaysSummary,
  getCategoryColor,
  getCategoryBg,
  getSubActivityBestDay,
  SUB_ACTIVITIES,
  CHANCE_ACTIVITIES,
  BestDaySummary,
  SubActivityResult,
  SubActivity,
} from '@/lib/bestDaysSummary';
import { BestTimesCategory } from '@/lib/bestTimes';
import { NatalChart } from '@/hooks/useNatalChart';
import { format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface BestDaysSummaryCardProps {
  natalChart: NatalChart | null;
  days?: number;
}

const SubActivityRow = ({ result }: { result: SubActivityResult }) => {
  const isToday = isSameDay(result.bestDay, new Date());
  return (
    <div className="flex items-center justify-between py-1.5 px-3 rounded-md bg-background/50 hover:bg-background/80 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-sm">{result.activity.emoji}</span>
        <div>
          <p className="text-xs font-medium">{result.activity.label}</p>
          <p className="text-[10px] text-muted-foreground">{result.activity.description}</p>
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-semibold">
            {format(result.bestDay, 'MMM d')}
          </p>
          {isToday && (
            <Badge className="text-[9px] px-1 py-0 bg-primary">TODAY</Badge>
          )}
        </div>
        <p className="text-[10px] text-amber-500">{result.rating}</p>
      </div>
    </div>
  );
};

const CategorySection = ({
  summary,
  subActivities,
  natalChart,
  days,
  expanded,
  onToggle,
}: {
  summary: BestDaySummary;
  subActivities: SubActivity[];
  natalChart: NatalChart | null;
  days: number;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const isToday = isSameDay(summary.bestDay, new Date());

  const subResults = useMemo(() => {
    if (!expanded) return [];
    return subActivities.map(act => getSubActivityBestDay(act, natalChart, new Date(), days));
  }, [expanded, subActivities, natalChart, days]);

  return (
    <div className="rounded-lg overflow-hidden">
      {/* Main category row — clickable */}
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-2.5 ${getCategoryBg(summary.category)} transition-all hover:shadow-sm cursor-pointer`}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown size={14} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground" />
          )}
          <span className="text-lg">{summary.emoji}</span>
          <div className="text-left">
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
      </button>

      {/* Expanded sub-activities */}
      {expanded && (
        <div className={`border-l-2 ml-5 pl-1 py-1 space-y-1 ${getCategoryBg(summary.category)}`}>
          {subResults.map(r => (
            <SubActivityRow key={r.activity.id} result={r} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Chance / Luck Section ── */
const ChanceSection = ({
  natalChart,
  days,
  expanded,
  onToggle,
}: {
  natalChart: NatalChart | null;
  days: number;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const subResults = useMemo(() => {
    if (!expanded) return [];
    return CHANCE_ACTIVITIES.map(act => getSubActivityBestDay(act, natalChart, new Date(), days));
  }, [expanded, natalChart, days]);

  // Best overall chance day
  const bestChance = useMemo(() => {
    const results = CHANCE_ACTIVITIES.map(act => getSubActivityBestDay(act, natalChart, new Date(), days));
    return results.sort((a, b) => b.score - a.score)[0];
  }, [natalChart, days]);

  const isToday = bestChance ? isSameDay(bestChance.bestDay, new Date()) : false;

  return (
    <div className="rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-2.5 ${getCategoryBg('chance')} transition-all hover:shadow-sm cursor-pointer`}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown size={14} className="text-muted-foreground" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground" />
          )}
          <span className="text-lg">🍀</span>
          <div className="text-left">
            <p className="text-sm font-medium">Chance & Luck</p>
            <p className="text-xs text-muted-foreground">Lottery, casino, contests</p>
          </div>
        </div>
        <div className="text-right">
          {bestChance && (
            <>
              <div className="flex items-center gap-1">
                <p className={`text-sm font-semibold ${getCategoryColor('chance')}`}>
                  {format(bestChance.bestDay, 'MMM d')}
                </p>
                {isToday && (
                  <Badge className="text-[10px] px-1 py-0 bg-primary">TODAY</Badge>
                )}
              </div>
              <p className="text-xs text-amber-500">{bestChance.rating}</p>
            </>
          )}
        </div>
      </button>

      {expanded && (
        <div className={`border-l-2 ml-5 pl-1 py-1 space-y-1 ${getCategoryBg('chance')}`}>
          {subResults.map(r => (
            <SubActivityRow key={r.activity.id} result={r} />
          ))}
        </div>
      )}
    </div>
  );
};

export const BestDaysSummaryCard = ({ natalChart, days = 30 }: BestDaysSummaryCardProps) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const summary = useMemo(() => {
    return getBestDaysSummary(natalChart, new Date(), days);
  }, [natalChart, days]);

  const today = new Date();
  const bestDayIsToday = isSameDay(summary.overallBestDay.date, today);

  const toggle = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
              Next {days} days • {natalChart ? 'Personalized' : 'General'} • Tap to expand
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

      {/* Category Grid with dropdowns */}
      <div className="grid gap-2">
        {summary.summaries.map((s) => (
          <CategorySection
            key={s.category}
            summary={s}
            subActivities={SUB_ACTIVITIES[s.category]}
            natalChart={natalChart}
            days={days}
            expanded={expandedCategories.has(s.category)}
            onToggle={() => toggle(s.category)}
          />
        ))}

        {/* Chance & Luck section */}
        <ChanceSection
          natalChart={natalChart}
          days={days}
          expanded={expandedCategories.has('chance')}
          onToggle={() => toggle('chance')}
        />
      </div>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground mt-3">
        {format(summary.period.start, 'MMM d')} - {format(summary.period.end, 'MMM d')}
      </p>
    </div>
  );
};
