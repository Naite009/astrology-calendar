import { useMemo } from 'react';
import { Trophy, TrendingUp, ChevronRight, HelpCircle } from 'lucide-react';
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

  const maxScore = top3[0]?.score || 1;

  return (
    <div className="border border-primary/20 rounded-sm bg-card overflow-hidden">
      <div className="bg-primary/5 px-5 py-4 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <Trophy className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-sm uppercase tracking-widest font-medium text-foreground">Year Priority Engine</h3>
            <p className="text-xs text-muted-foreground">
              Top themes ranked by weighted signal strength
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
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase tracking-widest font-medium ${theme.confidenceColor}`}>
                  {theme.confidence}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{theme.score}pts</span>
              </div>
            </div>

            {/* Score bar */}
            <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${i === 0 ? 'bg-primary' : 'bg-primary/50'}`}
                style={{ width: `${Math.min(100, (theme.score / maxScore) * 100)}%` }}
              />
            </div>

            {/* Drivers */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
                <TrendingUp size={10} /> Key Drivers
              </p>
              {theme.drivers.slice(0, 4).map((d, di) => (
                <p key={di} className="text-xs text-muted-foreground flex items-center gap-1">
                  <ChevronRight size={10} className="flex-shrink-0" />
                  {d.source}
                  <span className="text-muted-foreground/50 font-mono ml-auto">+{d.weight}</span>
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
                  <span className="font-mono text-[10px]">{theme.score}pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Method note */}
        <div className="flex items-start gap-1.5 pt-2 border-t border-border">
          <HelpCircle size={10} className="text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Scores combine SR house placements, natal house overlays, angle-to-planet contacts, planet-to-angle contacts, major aspects, lunar phase, and stacking bonuses. Higher scores indicate stronger, more repeated signals pointing to the same life area.
          </p>
        </div>
      </div>
    </div>
  );
}

function ord(n: number): string {
  if (n === 1) return 'st'; if (n === 2) return 'nd'; if (n === 3) return 'rd'; return 'th';
}
