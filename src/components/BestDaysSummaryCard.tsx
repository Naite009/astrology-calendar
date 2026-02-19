import { useMemo, useState, useEffect, useTransition, useCallback } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';

interface BestDaysSummaryCardProps {
  natalChart: NatalChart | null;
  days?: number;
}

/* ── Score badge ── */
const ScoreBadge = ({ score, small = false }: { score: number; small?: boolean }) => {
  let color = 'bg-muted/40 text-muted-foreground';
  let label = 'Low';
  if (score >= 120) { color = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'; label = 'Exceptional'; }
  else if (score >= 90) { color = 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'; label = 'Excellent'; }
  else if (score >= 60) { color = 'bg-blue-500/20 text-blue-700 dark:text-blue-300'; label = 'Good'; }
  else if (score >= 30) { color = 'bg-amber-500/20 text-amber-700 dark:text-amber-300'; label = 'Fair'; }

  return (
    <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 font-medium ${color} ${small ? 'text-[9px]' : 'text-[10px]'}`}>
      {label}
    </span>
  );
};

/* ── 30-day wave chart (like biorhythm) ── */
const WaveChart = ({ allDays, parentColor, todayIndex }: {
  allDays: SubActivityDayScore[];
  parentColor: string;
  todayIndex: number;
}) => {
  if (allDays.length === 0) return null;

  const maxScore = Math.max(...allDays.map(d => d.score), 1);
  const width = 300;
  const height = 60;
  const padding = { top: 4, bottom: 14, left: 2, right: 2 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const strokeColorMap: Record<string, string> = {
    love: '#ec4899', career: '#f59e0b', health: '#22c55e',
    travel: '#3b82f6', finance: '#10b981', beauty: '#a855f7', chance: '#eab308',
  };
  const strokeColor = strokeColorMap[parentColor] || '#6366f1';

  // Build SVG path
  const points = allDays.map((d, i) => {
    const x = padding.left + (i / Math.max(allDays.length - 1, 1)) * chartW;
    const y = padding.top + chartH - (d.score / maxScore) * chartH;
    return { x, y, score: d.score, date: d.date };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  // Fill area
  const areaD = `${pathD} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  // Today marker
  const todayX = todayIndex >= 0 && todayIndex < points.length ? points[todayIndex].x : null;

  // Top 3 peaks (spread apart)
  const sortedByScore = [...points].sort((a, b) => b.score - a.score);
  const peaks: typeof points = [];
  for (const p of sortedByScore) {
    if (peaks.length >= 3) break;
    const tooClose = peaks.some(pk => Math.abs(pk.x - p.x) < chartW * 0.1);
    if (!tooClose && p.score > 0) peaks.push(p);
  }

  // Date labels
  const firstDate = allDays[0]?.date;
  const midDate = allDays[Math.floor(allDays.length / 2)]?.date;
  const lastDate = allDays[allDays.length - 1]?.date;

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        <line x1={padding.left} y1={padding.top} x2={width - padding.right} y2={padding.top}
          stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.5} />
        <line x1={padding.left} y1={padding.top + chartH / 2} x2={width - padding.right} y2={padding.top + chartH / 2}
          stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.5} />
        <line x1={padding.left} y1={padding.top + chartH} x2={width - padding.right} y2={padding.top + chartH}
          stroke="currentColor" strokeOpacity={0.08} strokeWidth={0.5} />

        {/* Area fill */}
        <path d={areaD} fill={strokeColor} fillOpacity={0.1} />
        
        {/* Line */}
        <path d={pathD} fill="none" stroke={strokeColor} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Today vertical line */}
        {todayX !== null && (
          <>
            <line x1={todayX} y1={padding.top} x2={todayX} y2={padding.top + chartH}
              stroke="currentColor" strokeOpacity={0.3} strokeWidth={0.5} strokeDasharray="2,2" />
            <circle cx={todayX} cy={points[todayIndex].y} r={3} fill={strokeColor} stroke="white" strokeWidth={1} />
            <text x={todayX} y={padding.top - 0.5} textAnchor="middle" fontSize={5} fill="currentColor" opacity={0.6}>
              TODAY
            </text>
          </>
        )}

        {/* Peak markers */}
        {peaks.map((p, i) => {
          const medals = ['🥇', '🥈', '🥉'];
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={2.5} fill={strokeColor} stroke="white" strokeWidth={0.8} />
              <text x={p.x} y={p.y - 4} textAnchor="middle" fontSize={6}>
                {medals[i]}
              </text>
            </g>
          );
        })}

        {/* Date labels */}
        {firstDate && <text x={padding.left} y={height - 1} fontSize={4.5} fill="currentColor" opacity={0.5}>{format(firstDate, 'MMM d')}</text>}
        {midDate && <text x={width / 2} y={height - 1} textAnchor="middle" fontSize={4.5} fill="currentColor" opacity={0.5}>{format(midDate, 'MMM d')}</text>}
        {lastDate && <text x={width - padding.right} y={height - 1} textAnchor="end" fontSize={4.5} fill="currentColor" opacity={0.5}>{format(lastDate, 'MMM d')}</text>}
      </svg>
    </div>
  );
};

/* ── Top 3 day chip ── */
const TopDayChip = ({ day, rank }: { day: SubActivityDayScore; rank: number }) => {
  const isToday = isSameDay(day.date, new Date());
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div className={`flex items-center gap-1.5 py-1.5 px-2 rounded-md ${isToday ? 'bg-primary/10 ring-1 ring-primary/30' : 'bg-background/60'}`}>
      <span className="text-sm">{medals[rank]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold">
          {format(day.date, 'EEEE, MMM d')}
          {isToday && <span className="ml-1 text-primary text-[9px]">← YOU ARE HERE</span>}
        </p>
        <p className="text-[9px] text-muted-foreground truncate">{day.reason}</p>
      </div>
      <div className="text-right shrink-0">
        <span className="text-[11px] font-bold">{day.score}pts</span>
        <br />
        <ScoreBadge score={day.score} small />
      </div>
    </div>
  );
};

/* ── Sub-activity row ── */
const SubActivityRow = ({ result, parentCategory }: { result: SubActivityResult; parentCategory: string }) => {
  const [showDetail, setShowDetail] = useState(false);
  const today = new Date();
  const todayIndex = result.allDays.findIndex(d => isSameDay(d.date, today));

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
        <div className="px-3 pb-3 space-y-2.5">
          {/* Today vs Best comparison */}
          <div className="flex items-center justify-between text-[10px] px-1">
            <span className="text-muted-foreground">
              Today: <span className="font-semibold text-foreground">{result.todayScore}pts</span> ({result.todayRating})
            </span>
            <span className="text-muted-foreground">
              Best: <span className="font-semibold text-foreground">{result.score}pts</span>
              {isSameDay(result.bestDay, today) ? ' (today!)' : ` in ${differenceInDays(result.bestDay, today)}d`}
            </span>
          </div>

          {/* Wave chart */}
          <WaveChart allDays={result.allDays} parentColor={parentCategory} todayIndex={todayIndex} />

          {/* Top 3 spread days */}
          {result.topDays.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Best 3 Days This Month</p>
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
const ChanceSection = ({ natalChart, days, expanded, onToggle, bestChance }: {
  natalChart: NatalChart | null; days: number; expanded: boolean; onToggle: () => void;
  bestChance: SubActivityResult | null;
}) => {
  const subResults = useMemo(() => {
    if (!expanded) return [];
    return CHANCE_ACTIVITIES.map(act => getSubActivityBestDay(act, natalChart, new Date(), days));
  }, [expanded, natalChart, days]);

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
            <p className="text-xs text-muted-foreground">
              {bestChance ? `Best: ${bestChance.activity.emoji} ${bestChance.activity.label}` : 'Lottery, casino, contests'}
            </p>
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
  const [summary, setSummary] = useState<ReturnType<typeof getBestDaysSummary> | null>(null);
  const [bestChance, setBestChance] = useState<SubActivityResult | null>(null);

  // Defer heavy computation so the tab renders instantly
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const s = getBestDaysSummary(natalChart, new Date(), days);
      setSummary(s);
      const results = CHANCE_ACTIVITIES.map(act => getSubActivityBestDay(act, natalChart, new Date(), days));
      setBestChance(results.sort((a, b) => b.score - a.score)[0] || null);
    });
    return () => cancelAnimationFrame(id);
  }, [natalChart, days]);

  const toggle = (key: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

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
          bestChance={bestChance}
        />
      </div>

      <p className="text-xs text-center text-muted-foreground mt-3">
        {format(summary.period.start, 'MMM d')} – {format(summary.period.end, 'MMM d')}
      </p>
    </div>
  );
};
