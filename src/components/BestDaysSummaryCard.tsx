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
  SubActivityDayScore,
} from '@/lib/bestDaysSummary';
import { NatalChart } from '@/hooks/useNatalChart';
import { format, isSameDay, differenceInDays } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface BestDaysSummaryCardProps {
  natalChart: NatalChart | null;
  days?: number;
}

/* ── Mini timeline: shows today vs best day on a 30-day bar ── */
const MiniTimeline = ({ todayScore, bestDay, bestScore, days, barColor }: {
  todayScore: number;
  bestDay: Date;
  bestScore: number;
  days: number;
  barColor: string;
}) => {
  const today = new Date();
  const daysUntilBest = Math.max(0, differenceInDays(bestDay, today));
  const bestPct = Math.min(100, (daysUntilBest / days) * 100);
  const isToday = daysUntilBest === 0;
  // Normalise scores
  const todayPct = Math.min(100, Math.max(5, (todayScore / 120) * 100));
  const bestPctHeight = Math.min(100, Math.max(5, (bestScore / 120) * 100));

  return (
    <div className="mt-1.5">
      {/* Score comparison */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1">
        <span>Today: <span className="font-semibold text-foreground">{todayScore}pts</span></span>
        <span>•</span>
        <span>
          Best: <span className="font-semibold text-foreground">{bestScore}pts</span>
          {isToday ? ' (today!)' : ` in ${daysUntilBest}d`}
        </span>
      </div>
      {/* Timeline bar */}
      <div className="relative h-3 rounded-full bg-muted/30 overflow-hidden">
        {/* Today marker - always at left */}
        <div className="absolute left-0 top-0 h-full rounded-l-full bg-muted-foreground/20" style={{ width: '3px' }} />
        {/* Best day marker */}
        <div
          className={`absolute top-0 h-full ${barColor} rounded-full transition-all duration-500`}
          style={{ left: `${Math.max(0, bestPct - 3)}%`, width: '6px' }}
        />
        {/* Score fill from 0 to best day position */}
        <div
          className={`absolute left-0 top-0 h-full ${barColor} opacity-25 rounded-full`}
          style={{ width: `${bestPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
        <span>Today</span>
        <span>{format(bestDay, 'MMM d')}</span>
      </div>
    </div>
  );
};

/* ── Score badge ── */
const ScoreBadge = ({ score, small = false }: { score: number; small?: boolean }) => {
  let color = 'bg-muted text-muted-foreground';
  let label = 'Low';
  if (score >= 90) { color = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'; label = 'Excellent'; }
  else if (score >= 60) { color = 'bg-blue-500/20 text-blue-700 dark:text-blue-300'; label = 'Good'; }
  else if (score >= 30) { color = 'bg-amber-500/20 text-amber-700 dark:text-amber-300'; label = 'Fair'; }
  else { color = 'bg-muted/40 text-muted-foreground'; label = 'Low'; }

  return (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-medium ${color} ${small ? 'text-[9px]' : 'text-[10px]'}`}>
      {label}
    </span>
  );
};

/* ── Top 3 days row ── */
const TopDayChip = ({ day, rank }: { day: SubActivityDayScore; rank: number }) => {
  const isToday = isSameDay(day.date, new Date());
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className={`flex items-center gap-1.5 py-1 px-2 rounded-md ${isToday ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-background/60'}`}>
      <span className="text-sm">{medals[rank]}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold">
          {format(day.date, 'EEE, MMM d')}
          {isToday && <span className="ml-1 text-primary text-[9px]">← TODAY</span>}
        </p>
        <p className="text-[9px] text-muted-foreground truncate">{day.reason}</p>
      </div>
      <ScoreBadge score={day.score} small />
    </div>
  );
};

/* ── Sub-activity row with top 3 + timeline ── */
const SubActivityRow = ({ result, parentCategory }: { result: SubActivityResult; parentCategory: string }) => {
  const [showDetail, setShowDetail] = useState(false);

  const barColorMap: Record<string, string> = {
    love: 'bg-pink-400', career: 'bg-amber-400', health: 'bg-green-400',
    travel: 'bg-blue-400', finance: 'bg-emerald-400', beauty: 'bg-purple-400', chance: 'bg-yellow-400',
  };

  return (
    <div className="rounded-md bg-background/50 hover:bg-background/80 transition-colors overflow-hidden">
      <button
        onClick={() => setShowDetail(prev => !prev)}
        className="w-full flex items-center justify-between py-2 px-3 cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base shrink-0">{result.activity.emoji}</span>
          <div className="min-w-0 text-left">
            <p className="text-xs font-medium">{result.activity.label}</p>
            <p className="text-[10px] text-muted-foreground truncate">{result.activity.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          <div className="text-right">
            <p className="text-xs font-semibold">{format(result.bestDay, 'EEE, MMM d')}</p>
            <ScoreBadge score={result.score} />
          </div>
          {showDetail ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
        </div>
      </button>

      {showDetail && (
        <div className="px-3 pb-2.5 space-y-2">
          {/* Timeline */}
          <MiniTimeline
            todayScore={result.todayScore}
            bestDay={result.bestDay}
            bestScore={result.score}
            days={30}
            barColor={barColorMap[parentCategory] || 'bg-primary'}
          />
          {/* Top 3 days */}
          {result.topDays.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Top 3 Days</p>
              {result.topDays.map((d, i) => (
                <TopDayChip key={i} day={d} rank={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Category section ── */
const CategorySection = ({
  summary, subActivities, natalChart, days, expanded, onToggle,
}: {
  summary: BestDaySummary; subActivities: SubActivity[];
  natalChart: NatalChart | null; days: number; expanded: boolean; onToggle: () => void;
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
          {expanded ? <ChevronDown size={14} className="text-muted-foreground shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
          <span className="text-lg">{summary.emoji}</span>
          <div className="text-left">
            <p className="text-sm font-medium">{summary.label}</p>
            <p className="text-xs text-muted-foreground truncate max-w-[140px]">{summary.topReason}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className={`text-sm font-semibold ${getCategoryColor(summary.category)}`}>
              {format(summary.bestDay, 'EEE, MMM d')}
            </p>
            <ScoreBadge score={summary.score} />
          </div>
          {isToday && <Badge className="text-[10px] px-1 py-0 bg-primary/80 text-primary-foreground">TODAY</Badge>}
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

/* ── Chance Section ── */
const ChanceSection = ({ natalChart, days, expanded, onToggle }: {
  natalChart: NatalChart | null; days: number; expanded: boolean; onToggle: () => void;
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
          {expanded ? <ChevronDown size={14} className="text-muted-foreground shrink-0" /> : <ChevronRight size={14} className="text-muted-foreground shrink-0" />}
          <span className="text-lg">🍀</span>
          <div className="text-left">
            <p className="text-sm font-medium">Chance & Luck</p>
            <p className="text-xs text-muted-foreground">Lottery, casino, contests</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {bestChance && (
            <div className="text-right">
              <p className={`text-sm font-semibold ${getCategoryColor('chance')}`}>
                {format(bestChance.bestDay, 'EEE, MMM d')}
              </p>
              <ScoreBadge score={bestChance.score} />
            </div>
          )}
          {isToday && <Badge className="text-[10px] px-1 py-0 bg-primary/80 text-primary-foreground">TODAY</Badge>}
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

  const summary = useMemo(() => getBestDaysSummary(natalChart, new Date(), days), [natalChart, days]);

  const today = new Date();
  const bestDayIsToday = isSameDay(summary.overallBestDay.date, today);

  const toggle = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

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
              Next {days} days • {natalChart ? 'Personalized' : 'General'} • Tap to expand
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

      <div className="grid gap-2">
        {summary.summaries.map((s) => (
          <CategorySection
            key={s.category} summary={s} subActivities={SUB_ACTIVITIES[s.category]}
            natalChart={natalChart} days={days}
            expanded={expandedCategories.has(s.category)} onToggle={() => toggle(s.category)}
          />
        ))}
        <ChanceSection
          natalChart={natalChart} days={days}
          expanded={expandedCategories.has('chance')} onToggle={() => toggle('chance')}
        />
      </div>

      <p className="text-xs text-center text-muted-foreground mt-3">
        {format(summary.period.start, 'MMM d')} – {format(summary.period.end, 'MMM d')}
      </p>
    </div>
  );
};
