import { useState, useEffect } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateBestTimes, BestTimesCategory, BestTimeResult, CATEGORY_INFO } from '@/lib/bestTimes';

interface BestTimesViewProps {
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
  selectedChartForTiming: string;
  setSelectedChartForTiming: (id: string) => void;
}

export const BestTimesView = ({
  userNatalChart,
  savedCharts,
  selectedChartForTiming,
  setSelectedChartForTiming,
}: BestTimesViewProps) => {
  const [category, setCategory] = useState<BestTimesCategory>('love');
  const [bestTimes, setBestTimes] = useState<BestTimeResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    const chart = selectedChartForTiming === 'user'
      ? userNatalChart
      : selectedChartForTiming === 'general'
      ? null
      : savedCharts.find(c => c.id === selectedChartForTiming);

    setIsCalculating(true);

    // Use setTimeout to avoid blocking UI
    setTimeout(() => {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const times = calculateBestTimes(category, chart ?? null, startDate, endDate);
      setBestTimes(times);
      setIsCalculating(false);
    }, 100);
  }, [category, selectedChartForTiming, userNatalChart, savedCharts]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Clock className="text-primary" size={28} />
        <h2 className="font-serif text-2xl font-light text-foreground">Best Times Calculator</h2>
      </div>

      {/* Chart Selector */}
      <div className="mb-6 p-4 rounded-sm bg-secondary">
        <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-2">
          Calculate for:
        </label>
        <select
          value={selectedChartForTiming}
          onChange={e => setSelectedChartForTiming(e.target.value)}
          className="w-full md:w-auto border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
        >
          <option value="user">Your Chart</option>
          <option value="general">General (No Personal Chart)</option>
          {savedCharts.map(chart => (
            <option key={chart.id} value={chart.id}>{chart.name}</option>
          ))}
        </select>
        {selectedChartForTiming === 'user' && !userNatalChart && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠️ Add your natal chart in the Charts view for personalized timing
          </p>
        )}
      </div>

      {/* Category Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(Object.keys(CATEGORY_INFO) as BestTimesCategory[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm transition-all ${
              category === cat
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-secondary/80'
            }`}
          >
            <span>{CATEGORY_INFO[cat].emoji}</span>
            <span>{CATEGORY_INFO[cat].label}</span>
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl text-foreground flex items-center gap-2">
          <Sparkles size={20} className="text-primary" />
          Best Times for {CATEGORY_INFO[category].label}
        </h3>

        {isCalculating ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="animate-pulse">Calculating optimal times...</div>
          </div>
        ) : bestTimes.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No highly favorable times found in the next 30 days for this category.
          </div>
        ) : (
          <div className="space-y-3">
            {bestTimes.map((time, i) => (
              <div
                key={i}
                className="rounded-sm border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-600 text-lg font-medium">{time.rating}</span>
                    <span className="font-medium text-foreground">
                      {time.date.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {time.date.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZone: 'America/New_York',
                      })}{' '}
                      ET
                    </span>
                  </div>
                  <span className="text-[11px] uppercase tracking-widest text-muted-foreground bg-secondary px-2 py-1 rounded-sm">
                    Score: {time.score}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {time.reasons.map((reason, j) => (
                    <span
                      key={j}
                      className={`text-xs px-2 py-1 rounded-sm ${
                        reason.includes('avoid') || reason.includes('Void')
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-8 p-4 rounded-sm bg-secondary text-sm text-muted-foreground">
        <p className="mb-2">
          <strong>How it works:</strong> Best times are calculated based on:
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Favorable transiting planet aspects to your natal chart</li>
          <li>Moon sign compatibility with the activity</li>
          <li>Moon phase (waxing = building, waning = releasing)</li>
          <li>Avoiding void-of-course Moon periods</li>
          <li>Mercury retrograde considerations (for travel)</li>
        </ul>
      </div>
    </div>
  );
};
