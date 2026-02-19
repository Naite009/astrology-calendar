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

/* ── Score bar visual ── */
const ScoreBar = ({ score, category }: { score: number; category: string }) => {
  // Normalise score to 0-100 range for the bar (scores typically 20-150+)
  const pct = Math.min(100, Math.max(0, (score / 150) * 100));
  
  const barColorMap: Record<string, string> = {
    love: 'bg-pink-400',
    career: 'bg-amber-400',
    health: 'bg-green-400',
    travel: 'bg-blue-400',
    finance: 'bg-emerald-400',
    beauty: 'bg-purple-400',
    chance: 'bg-yellow-400',
  };
  const barColor = barColorMap[category] || 'bg-primary';

  const label = pct >= 80 ? 'Excellent' : pct >= 55 ? 'Good' : pct >= 30 ? 'Fair' : 'Low';

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 h-2 rounded-full bg-muted/40 overflow-hidden">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground w-14 text-right">{label}</span>
    </div>
  );
};

/* ── Sub-activity row ── */
const SubActivityRow = ({ result, parentCategory }: { result: SubActivityResult; parentCategory: string }) => {
  const isToday = isSameDay(result.bestDay, new Date());
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md bg-background/50 hover:bg-background/80 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base shrink-0">{result.activity.emoji}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium">{result.activity.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{result.topReason}</p>
        </div>
      </div>
      <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
        <div className="flex items-center gap-1">
          <p className="text-xs font-semibold">{format(result.bestDay, 'EEE, MMM d')}</p>
          {isToday && (
            <Badge className="text-[9px] px-1 py-0 bg-primary/80 text-primary-foreground">NOW</Badge>
          )}
        </div>
        <ScoreBar score={result.score} category={parentCategory} />
      </div>
    </div>
  );
};

/* ── Category section with dropdown ── */
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
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-2.5 rounded-lg ${getCategoryBg(summary.category)} transition-all hover:shadow-sm cursor-pointer`}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown size={14} className="text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
          )}
          <span className="text-lg">{summary.emoji}</span>
          <div className="text-left">
            <p className="text-sm font-medium">{summary.label}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">
              {summary.topReason}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-1">
            <p className={`text-sm font-semibold ${getCategoryColor(summary.category)}`}>
              {format(summary.bestDay, 'EEE, MMM d')}
            </p>
            {isToday && (
              <Badge className="text-[10px] px-1 py-0 bg-primary/80 text-primary-foreground">TODAY</Badge>
            )}
          </div>
          <ScoreBar score={summary.score} category={summary.category} />
        </div>
      </button>

      {expanded && (
        <div className="border-l-2 border-muted-foreground/20 ml-5 mt-1 pl-1 py-1 space-y-1">
          {subResults.map(r => (
            <SubActivityRow key={r.activity.id} result={r} parentCategory={summary.category} />
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

  const bestChance = useMemo(() => {
    const results = CHANCE_ACTIVITIES.map(act => getSubActivityBestDay(act, natalChart, new Date(), days));
    return results.sort((a, b) => b.score - a.score)[0];
  }, [natalChart, days]);

  const isToday = bestChance ? isSameDay(bestChance.bestDay, new Date()) : false;

  return (
    <div className="rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-2.5 rounded-lg ${getCategoryBg('chance')} transition-all hover:shadow-sm cursor-pointer`}
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown size={14} className="text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
          )}
          <span className="text-lg">🍀</span>
          <div className="text-left">
            <p className="text-sm font-medium">Chance & Luck</p>
            <p className="text-xs text-muted-foreground">Lottery, casino, contests</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          {bestChance && (
            <>
              <div className="flex items-center gap-1">
                <p className={`text-sm font-semibold ${getCategoryColor('chance')}`}>
                  {format(bestChance.bestDay, 'EEE, MMM d')}
                </p>
                {isToday && (
                  <Badge className="text-[10px] px-1 py-0 bg-primary/80 text-primary-foreground">TODAY</Badge>
                )}
              </div>
              <ScoreBar score={bestChance.score} category="chance" />
            </>
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-l-2 border-muted-foreground/20 ml-5 mt-1 pl-1 py-1 space-y-1">
          {subResults.map(r => (
            <SubActivityRow key={r.activity.id} result={r} parentCategory="chance" />
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
              <Badge className="text-[10px] px-1.5 py-0 bg-amber-500 text-primary-foreground">TODAY!</Badge>
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
        <ChanceSection
          natalChart={natalChart}
          days={days}
          expanded={expandedCategories.has('chance')}
          onToggle={() => toggle('chance')}
        />
      </div>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground mt-3">
        {format(summary.period.start, 'MMM d')} – {format(summary.period.end, 'MMM d')}
      </p>
    </div>
  );
};
