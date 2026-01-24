import { useState } from 'react';
import { ChevronDown, ChevronUp, Calculator, Star, AlertTriangle, Home, Sparkles, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FocusIndicator, FocusAnalysis } from '@/lib/relationshipFocusAnalysis';

interface ScoringBreakdownViewProps {
  analysis: FocusAnalysis;
  chart1Name: string;
  chart2Name: string;
}

export const ScoringBreakdownView = ({ analysis, chart1Name, chart2Name }: ScoringBreakdownViewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Categorize indicators
  const tier1Indicators = analysis.indicators.filter(i => i.tier === 1);
  const tier2Indicators = analysis.indicators.filter(i => i.tier === 2);
  const tier3Indicators = analysis.indicators.filter(i => i.tier === 3);
  const karmicIndicators = analysis.indicators.filter(i => 
    i.name.includes('KARMIC') || i.name.includes('FATED') || i.name.includes('PROSPERITY')
  );
  const houseIndicators = analysis.indicators.filter(i => 
    i.name.includes('House Overlay')
  );
  const negativeIndicators = analysis.indicators.filter(i => 
    i.name.includes('⚠️')
  );
  
  // Calculate totals for display
  const foundTier1 = tier1Indicators.filter(i => i.found);
  const foundTier2 = tier2Indicators.filter(i => i.found);
  const foundTier3 = tier3Indicators.filter(i => i.found);
  
  const tier1Points = foundTier1.reduce((sum, i) => sum + (i.points || 0), 0);
  const tier2Points = foundTier2.reduce((sum, i) => sum + (i.points || 0), 0);
  const tier3Points = foundTier3.reduce((sum, i) => sum + (i.points || 0), 0);
  const karmicPoints = karmicIndicators.filter(i => i.found).reduce((sum, i) => sum + (i.points || 0), 0);
  const housePoints = houseIndicators.filter(i => i.found).reduce((sum, i) => sum + (i.points || 0), 0);
  const negativePoints = negativeIndicators.reduce((sum, i) => sum + (i.points || 0), 0);
  
  const totalStandardPoints = tier1Points + tier2Points + tier3Points;
  
  // Estimate max possible (rough calculation for display)
  const maxTier1 = tier1Indicators.length * 10;
  const maxTier2 = tier2Indicators.length * 8;
  const maxTier3 = tier3Indicators.length * 6;
  const totalMaxStandard = maxTier1 + maxTier2 + maxTier3;

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 2: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 3: return 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong': return 'text-green-600 dark:text-green-400';
      case 'moderate': return 'text-blue-600 dark:text-blue-400';
      case 'weak': return 'text-slate-500 dark:text-slate-400';
      default: return 'text-muted-foreground';
    }
  };

  const IndicatorRow = ({ indicator }: { indicator: FocusIndicator }) => (
    <div className={`flex items-start justify-between p-2 rounded-lg ${
      indicator.found ? 'bg-secondary/30' : 'bg-muted/20 opacity-60'
    }`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${indicator.found ? '' : 'line-through'}`}>
            {indicator.name}
          </span>
          {indicator.tier && (
            <Badge variant="outline" className={`text-[10px] ${getTierColor(indicator.tier)}`}>
              Tier {indicator.tier}
            </Badge>
          )}
          {indicator.aspect && (
            <Badge variant="secondary" className="text-[10px]">
              {indicator.aspect.type} ({indicator.aspect.orb}°)
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {indicator.interpretation}
        </p>
      </div>
      <div className="ml-2 text-right shrink-0">
        {indicator.found ? (
          <span className={`text-sm font-bold ${getStrengthColor(indicator.strength)}`}>
            +{indicator.points || 0}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    </div>
  );

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-purple-500" />
              <span className="font-medium text-sm">Scoring Breakdown</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={14} className="text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-sm">
                      See exactly how the {analysis.overallStrength}% score was calculated, including points per indicator, karmic bonuses, and house overlays.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {analysis.overallStrength}% Final
              </Badge>
              {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-3 p-4 rounded-lg border border-border bg-card space-y-4">
          {/* Formula Overview */}
          <div className="p-3 rounded-lg bg-secondary/30">
            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-purple-500" />
              Scoring Formula
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-background">
                <span className="text-muted-foreground">Base Score</span>
                <p className="font-bold text-lg">25%</p>
              </div>
              <div className="p-2 rounded bg-background">
                <span className="text-muted-foreground">Standard %</span>
                <p className="font-bold text-lg">
                  +{Math.round((totalStandardPoints / Math.max(1, totalMaxStandard)) * 40)}%
                </p>
                <p className="text-[10px] text-muted-foreground">
                  ({totalStandardPoints}/{totalMaxStandard} × 40%)
                </p>
              </div>
              <div className="p-2 rounded bg-background">
                <span className="text-muted-foreground">Karmic Bonus</span>
                <p className="font-bold text-lg text-purple-600 dark:text-purple-400">
                  +{Math.min(25, karmicPoints)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  (max 25 pts)
                </p>
              </div>
              <div className="p-2 rounded bg-background">
                <span className="text-muted-foreground">House Bonus</span>
                <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  +{Math.min(15, housePoints)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  (max 15 pts)
                </p>
              </div>
            </div>
            {negativePoints < 0 && (
              <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>Tension aspects: {negativePoints} points</span>
              </div>
            )}
          </div>

          {/* Tier 1: Core Indicators */}
          {tier1Indicators.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Star size={14} className="text-amber-500" />
                  Tier 1: Core Indicators
                  <Badge variant="outline" className="text-[10px] ml-2">10 pts each</Badge>
                </h4>
                <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                  {foundTier1.length}/{tier1Indicators.length} found
                </span>
              </div>
              <div className="space-y-2">
                {tier1Indicators.map((indicator, i) => (
                  <IndicatorRow key={i} indicator={indicator} />
                ))}
              </div>
            </div>
          )}

          {/* Tier 2: Important Indicators */}
          {tier2Indicators.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Star size={14} className="text-blue-500" />
                  Tier 2: Important Indicators
                  <Badge variant="outline" className="text-[10px] ml-2">8 pts each</Badge>
                </h4>
                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                  {foundTier2.length}/{tier2Indicators.length} found
                </span>
              </div>
              <div className="space-y-2">
                {tier2Indicators.map((indicator, i) => (
                  <IndicatorRow key={i} indicator={indicator} />
                ))}
              </div>
            </div>
          )}

          {/* Tier 3: Supporting Indicators */}
          {tier3Indicators.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Star size={14} className="text-slate-500" />
                  Tier 3: Supporting Indicators
                  <Badge variant="outline" className="text-[10px] ml-2">4-6 pts each</Badge>
                </h4>
                <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
                  {foundTier3.length}/{tier3Indicators.length} found
                </span>
              </div>
              <div className="space-y-2">
                {tier3Indicators.map((indicator, i) => (
                  <IndicatorRow key={i} indicator={indicator} />
                ))}
              </div>
            </div>
          )}

          {/* Karmic/Fated Bonuses */}
          {karmicIndicators.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Sparkles size={14} className="text-purple-500" />
                  Karmic & Fated Bonuses
                  <Badge variant="outline" className="text-[10px] ml-2 bg-purple-50 dark:bg-purple-950/30">
                    Flat bonus (not diluted)
                  </Badge>
                </h4>
              </div>
              <div className="space-y-2">
                {karmicIndicators.filter(i => i.found).map((indicator, i) => (
                  <IndicatorRow key={i} indicator={indicator} />
                ))}
              </div>
            </div>
          )}

          {/* House Overlays */}
          {houseIndicators.filter(i => i.found).length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Home size={14} className="text-blue-500" />
                  House Overlay Bonuses
                </h4>
              </div>
              <div className="space-y-2">
                {houseIndicators.filter(i => i.found).map((indicator, i) => (
                  <IndicatorRow key={i} indicator={indicator} />
                ))}
              </div>
            </div>
          )}

          {/* Tension Aspects (Negative) */}
          {negativeIndicators.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={14} />
                  Tension Aspects (Score Reduction)
                </h4>
              </div>
              <div className="space-y-2">
                {negativeIndicators.map((indicator, i) => (
                  <div key={i} className="flex items-start justify-between p-2 rounded-lg bg-amber-50/50 dark:bg-amber-950/20">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium">{indicator.name}</span>
                      <p className="text-xs text-muted-foreground mt-1">
                        {indicator.interpretation}
                      </p>
                    </div>
                    <div className="ml-2 text-right shrink-0">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">
                        {indicator.points || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Score Calculation */}
          <div className="p-3 rounded-lg bg-gradient-to-r from-purple-100/50 to-indigo-100/50 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-800">
            <h4 className="text-sm font-semibold mb-2">Final Calculation</h4>
            <div className="text-sm space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Base Score:</span>
                <span>25%</span>
              </div>
              <div className="flex justify-between">
                <span>Standard Aspects ({totalStandardPoints}/{totalMaxStandard} × 40%):</span>
                <span>+{Math.round((totalStandardPoints / Math.max(1, totalMaxStandard)) * 40)}%</span>
              </div>
              <div className="flex justify-between text-purple-600 dark:text-purple-400">
                <span>Karmic Bonus (capped at 25):</span>
                <span>+{Math.min(25, karmicPoints)}%</span>
              </div>
              <div className="flex justify-between text-blue-600 dark:text-blue-400">
                <span>House Overlay Bonus (capped at 15):</span>
                <span>+{Math.min(15, housePoints)}%</span>
              </div>
              {negativePoints < 0 && (
                <div className="flex justify-between text-red-600 dark:text-red-400">
                  <span>Tension Reduction:</span>
                  <span>{negativePoints}%</span>
                </div>
              )}
              <div className="border-t border-border pt-1 mt-1 flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span className="text-purple-600 dark:text-purple-400">{analysis.overallStrength}%</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                (bounded to 15%-92% range for realistic assessment)
              </p>
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};