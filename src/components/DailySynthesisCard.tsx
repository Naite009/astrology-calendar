import { useMemo } from 'react';
import { Sparkles, Moon, Activity, AlertTriangle, CheckCircle } from 'lucide-react';
import { 
  getDailyPowerSummary, 
  getCosmicWeatherIcon, 
  getCosmicWeatherColor,
  DailyPowerSummary
} from '@/lib/dailySynthesis';
import { NatalChart } from '@/hooks/useNatalChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DailySynthesisCardProps {
  birthDate: Date | null;
  targetDate?: Date;
  natalChart?: NatalChart | null;
}

export const DailySynthesisCard = ({
  birthDate,
  targetDate = new Date(),
  natalChart
}: DailySynthesisCardProps) => {
  const synthesis = useMemo(() => 
    getDailyPowerSummary(birthDate, targetDate, natalChart),
    [birthDate, targetDate, natalChart]
  );
  
  if (!synthesis) {
    return null;
  }
  
  const getPowerScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 50) return 'text-blue-500';
    if (score >= 30) return 'text-amber-500';
    return 'text-muted-foreground';
  };
  
  const getPowerScoreBg = (score: number) => {
    if (score >= 70) return 'from-green-500/20 to-emerald-500/10';
    if (score >= 50) return 'from-blue-500/20 to-indigo-500/10';
    if (score >= 30) return 'from-amber-500/20 to-orange-500/10';
    return 'from-gray-500/10 to-gray-500/5';
  };
  
  return (
    <TooltipProvider>
      <div className="p-4 rounded-lg border border-border bg-gradient-to-br from-card to-secondary/30">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Daily Power Synthesis
            </span>
          </div>
          
          {/* Cosmic Weather Badge */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="px-2 py-1 rounded text-xs font-medium flex items-center gap-1"
                style={{ 
                  backgroundColor: `${getCosmicWeatherColor(synthesis.cosmicWeather)}20`,
                  color: getCosmicWeatherColor(synthesis.cosmicWeather)
                }}
              >
                <span>{getCosmicWeatherIcon(synthesis.cosmicWeather)}</span>
                <span>{synthesis.cosmicWeather}</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Today's cosmic weather: {synthesis.cosmicWeather}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Power Score */}
        <div className={`rounded-lg p-4 mb-4 bg-gradient-to-r ${getPowerScoreBg(synthesis.powerScore)}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Power Score</div>
              <div className={`text-4xl font-bold ${getPowerScoreColor(synthesis.powerScore)}`}>
                {synthesis.powerScore}
              </div>
            </div>
            
            {/* Score breakdown */}
            <div className="text-right text-xs space-y-1">
              <div className="flex items-center gap-2 justify-end">
                <Activity size={12} />
                <span>Biorhythm: {synthesis.biorhythmContribution.score}%</span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Moon size={12} />
                <span>Astrology: {synthesis.astrologyContribution.score}%</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Moon Info */}
        <div className="flex items-center justify-between mb-4 p-2 rounded bg-secondary/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {synthesis.astrologyContribution.moonPhase.includes('New') ? '🌑' :
               synthesis.astrologyContribution.moonPhase.includes('Full') ? '🌕' :
               synthesis.astrologyContribution.moonPhase.includes('First') ? '🌓' :
               synthesis.astrologyContribution.moonPhase.includes('Last') ? '🌗' :
               synthesis.astrologyContribution.moonPhase.includes('Waxing') ? '🌒' : '🌘'}
            </span>
            <div>
              <div className="text-sm font-medium">{synthesis.astrologyContribution.moonPhase}</div>
              <div className="text-xs text-muted-foreground">
                Moon in {synthesis.astrologyContribution.moonSign}
              </div>
            </div>
          </div>
          
          {/* VOC Badge */}
          {synthesis.astrologyContribution.isVoidOfCourse && (
            <div className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs rounded flex items-center gap-1">
              <AlertTriangle size={12} />
              VOC Moon
            </div>
          )}
        </div>
        
        {/* Synthesis Text */}
        <div className="mb-4">
          <p className="text-sm text-foreground leading-relaxed">
            {synthesis.synthesis}
          </p>
        </div>
        
        {/* Biorhythm Highlights */}
        {synthesis.biorhythmContribution.highlights.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {synthesis.biorhythmContribution.highlights.map((highlight, i) => (
                <span 
                  key={i}
                  className={`text-[10px] px-1.5 py-0.5 rounded ${
                    highlight.includes('peak') 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      : highlight.includes('Critical')
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Best For / Cautions */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
          {/* Best For */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <CheckCircle size={12} className="text-green-500" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Best For</span>
            </div>
            <div className="space-y-1">
              {synthesis.bestFor.slice(0, 3).map((activity, i) => (
                <div 
                  key={i}
                  className="text-xs text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded"
                >
                  {activity}
                </div>
              ))}
            </div>
          </div>
          
          {/* Cautions */}
          <div>
            <div className="flex items-center gap-1 mb-2">
              <AlertTriangle size={12} className="text-amber-500" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Cautions</span>
            </div>
            <div className="space-y-1">
              {synthesis.cautions.length > 0 ? (
                synthesis.cautions.slice(0, 3).map((caution, i) => (
                  <div 
                    key={i}
                    className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded"
                  >
                    {caution}
                  </div>
                ))
              ) : (
                <div className="text-xs text-muted-foreground">No major cautions</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Exact Aspects */}
        {synthesis.astrologyContribution.exactAspects.length > 0 && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Exact Aspects Today
            </div>
            <div className="flex flex-wrap gap-1">
              {synthesis.astrologyContribution.exactAspects.slice(0, 4).map((aspect, i) => (
                <span 
                  key={i}
                  className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-medium animate-pulse"
                >
                  {aspect.planet1} {aspect.symbol} {aspect.planet2}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};
