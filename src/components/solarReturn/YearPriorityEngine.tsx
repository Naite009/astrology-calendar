import { useMemo } from 'react';
import { Trophy, TrendingUp, ChevronRight } from 'lucide-react';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { computeYearPriorities, ScoredCategory } from '@/lib/yearPriorityScoring';

const CONFIDENCE_COLORS: Record<string, string> = {
  'Very High': 'text-primary',
  'High': 'text-primary/80',
  'Moderate': 'text-foreground',
  'Emerging': 'text-muted-foreground',
};

interface Props {
  analysis: SolarReturnAnalysis;
  natalChart: NatalChart;
  srChart: SolarReturnChart;
}

export function YearPriorityEngine({ analysis, natalChart, srChart }: Props) {
  const rankedThemes = useMemo(() => {
    return computeYearPriorities(analysis, natalChart, srChart);
  }, [analysis, natalChart, srChart]);

  const top3 = rankedThemes.slice(0, 3);
  const rest = rankedThemes.slice(3);

  if (top3.length === 0) return null;

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      <div className="bg-primary/5 px-5 py-4 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">Year Priority Engine</h3>
            <p className="text-xs text-muted-foreground">
              Top themes ranked by house placements, angle contacts, and overlays
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Top 3 themes */}
        {top3.map((theme, i) => (
          <div key={theme.id} className={`rounded-sm p-4 ${i === 0 ? 'bg-primary/5 border border-primary/10' : 'bg-muted/30 border border-border'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${i === 0 ? 'text-primary' : 'text-foreground'}`}>#{i + 1}</span>
                <span className="text-sm font-medium text-foreground">{theme.label}</span>
              </div>
              <span className={`text-[10px] uppercase tracking-widest font-medium ${CONFIDENCE_COLORS[theme.confidence] || 'text-muted-foreground'}`}>
                {theme.confidence}
              </span>
            </div>

            {/* Why this theme ranks */}
            <div className="space-y-1 mt-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <TrendingUp size={10} /> Why This Ranks
              </p>
              {theme.drivers.slice(0, 4).map((d, di) => (
                <p key={di} className="text-xs text-muted-foreground flex items-start gap-1">
                  <ChevronRight size={10} className="flex-shrink-0 mt-0.5" />
                  <span>{d.source}</span>
                </p>
              ))}
              {theme.drivers.length > 4 && (
                <p className="text-[10px] text-muted-foreground/50">
                  +{theme.drivers.length - 4} more signals
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Remaining themes (compact) */}
        {rest.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Other Active Themes</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {rest.map((theme) => (
                <div key={theme.id} className="flex items-center justify-between text-xs text-muted-foreground py-1 px-2 bg-muted/20 rounded-sm">
                  <span>{theme.label}</span>
                  <span className={`text-[10px] uppercase tracking-widest ${CONFIDENCE_COLORS[theme.confidence] || ''}`}>
                    {theme.confidence}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
