import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { 
  VenusStarPoint,
  getVenusCycleStatus, 
  isVenusStarPointDay,
  calculateVenusStarPointSignificance,
  getSignSymbol,
  VENUS_JOURNAL_PROMPTS,
  VENUS_STAR_POINTS,
} from '@/lib/venusStarPoint';
import { NatalChart } from '@/hooks/useNatalChart';

interface VenusStarPointTrackerProps {
  date: Date;
  activeChart?: NatalChart | null;
}

export const VenusStarPointTracker = ({ date, activeChart }: VenusStarPointTrackerProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const cycleStatus = getVenusCycleStatus(date);
  const starPointToday = isVenusStarPointDay(date);
  
  // Helper to convert position to longitude
  const posToLongitude = (pos: { sign: string; degree: number; minutes?: number }) => {
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = signs.indexOf(pos.sign);
    return signIndex * 30 + pos.degree + (pos.minutes || 0) / 60;
  };
  
  // Calculate personal significance if we have a chart
  const personalSig = starPointToday && activeChart 
    ? calculateVenusStarPointSignificance(starPointToday, {
        positions: activeChart.planets ? Object.fromEntries(
          Object.entries(activeChart.planets)
            .filter(([_, v]) => v && v.sign)
            .map(([k, v]) => [k, { longitude: posToLongitude(v!), sign: v!.sign }])
        ) : undefined
      })
    : null;
  
  // Find historical pattern (8 years ago = same star point position)
  const historicalMatch = VENUS_STAR_POINTS.find(sp => {
    if (!starPointToday) return false;
    const yearDiff = starPointToday.date.getFullYear() - sp.date.getFullYear();
    return yearDiff >= 7 && yearDiff <= 9 && sp.sign === starPointToday.sign;
  });
  
  // Get journal prompts for current phase
  const getPrompts = () => {
    if (starPointToday?.type === 'inferior') return VENUS_JOURNAL_PROMPTS.inferior;
    if (starPointToday?.type === 'superior') return VENUS_JOURNAL_PROMPTS.superior;
    return cycleStatus.phase === 'morning' 
      ? VENUS_JOURNAL_PROMPTS.morningstar 
      : VENUS_JOURNAL_PROMPTS.eveningstar;
  };

  return (
    <div className={`rounded-sm border ${starPointToday ? 'border-pink-300 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30' : 'border-border bg-secondary/50'} overflow-hidden`}>
      {/* Header - always visible */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">{starPointToday ? '♀⭐' : '♀'}</span>
          <div>
            <div className="font-medium text-foreground">
              {starPointToday ? 'Venus Star Point Today!' : 'Venus Cycle Status'}
            </div>
            <div className="text-xs text-muted-foreground">
              {cycleStatus.phaseName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <div className="text-muted-foreground">Cycle Progress</div>
            <div className="font-medium text-foreground">{cycleStatus.progressPercent}%</div>
          </div>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      
      {/* Progress bar */}
      <div className="px-4 pb-2">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-pink-400 to-rose-500 transition-all"
            style={{ width: `${cycleStatus.progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Day {cycleStatus.daysInCycle} of {cycleStatus.totalCycleDays}</span>
          <span>Next: {cycleStatus.nextStarPoint.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>
      
      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 pt-2 space-y-4 border-t border-border/50">
          {/* Star Point Details (if today is a star point) */}
          {starPointToday && (
            <div className="p-4 bg-gradient-to-r from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40 rounded-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-3xl">♀⭐</span>
                <div>
                  <div className="font-serif text-lg font-medium text-foreground">
                    Venus Star Point
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {starPointToday.type === 'inferior' ? 'Inferior Conjunction (New Cycle)' : 'Superior Conjunction (Cycle Midpoint)'}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-foreground mb-2">
                <span className="font-medium">{starPointToday.degree}° {getSignSymbol(starPointToday.sign)} {starPointToday.sign}</span>
              </div>
              
              {/* Triple conjunction info */}
              {starPointToday.companions && (
                <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-sm mb-3">
                  <div className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                    🌟 TRIPLE CONJUNCTION
                  </div>
                  <div className="text-sm text-foreground">
                    ☉ Sun at {starPointToday.companions.find(c => c.planet === 'Sun')?.degree}° {starPointToday.sign}<br/>
                    ♀ Venus at {starPointToday.degree}° {starPointToday.sign}<br/>
                    ♂ Mars at {starPointToday.companions.find(c => c.planet === 'Mars')?.degree}° {starPointToday.sign}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    This rare alignment happens every 32 years! Last: 1994
                  </div>
                </div>
              )}
              
              {starPointToday.specialNotes && !starPointToday.companions && (
                <div className="text-xs text-muted-foreground italic">
                  {starPointToday.specialNotes}
                </div>
              )}
            </div>
          )}
          
          {/* Personal Significance */}
          {personalSig && personalSig.score > 0 && (
            <div className="p-4 bg-secondary rounded-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Personal Significance
                </div>
                <div className={`text-lg font-bold ${personalSig.score >= 70 ? 'text-pink-600' : personalSig.score >= 40 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  {personalSig.score}/100
                </div>
              </div>
              <ul className="space-y-1.5">
                {personalSig.reasons.map((reason, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-pink-500">•</span>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Historical Pattern */}
          {historicalMatch && (
            <div className="p-4 bg-secondary rounded-sm">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                📅 Historical Pattern
              </div>
              <div className="text-sm text-foreground">
                This energy last activated on{' '}
                <span className="font-medium">
                  {historicalMatch.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                {' '}({Math.round((date.getTime() - historicalMatch.date.getTime()) / (1000 * 60 * 60 * 24))} days ago)
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Venus Star Points return to the same sign every 8 years, creating a 5-pointed star pattern (pentagram) in the zodiac.
              </div>
            </div>
          )}
          
          {/* Cycle Guidance */}
          <div className="p-4 bg-secondary rounded-sm">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              {starPointToday?.type === 'inferior' 
                ? '🌑 New Cycle Begins' 
                : starPointToday?.type === 'superior'
                ? '☀️ Cycle Midpoint'
                : cycleStatus.phase === 'morning' 
                ? '🌅 Morning Star Phase' 
                : '🌆 Evening Star Phase'}
            </div>
            <div className="text-sm text-foreground mb-3">
              {starPointToday?.type === 'inferior' && (
                <>Venus passes between Earth and Sun — closest to us. Like a "Venus New Moon," this is an inward, cocoon phase. Time to reassess values, relationships, and self-worth.</>
              )}
              {starPointToday?.type === 'superior' && (
                <>Venus passes on the far side of the Sun — farthest from us. Like a "Venus Full Moon," this is maturation and integration time. Consolidate and commit.</>
              )}
              {!starPointToday && cycleStatus.phase === 'morning' && (
                <>Venus rises before the Sun (morning star). This is INTERNAL refinement — clarifying values, developing self-worth, examining relationship patterns privately.</>
              )}
              {!starPointToday && cycleStatus.phase === 'evening' && (
                <>Venus follows the Sun (evening star). This is EXTERNAL expression — dating, socializing, beautifying your environment, attracting abundance outwardly.</>
              )}
            </div>
            
            {/* Journal Prompts */}
            <div className="border-t border-border pt-3 mt-3">
              <div className="text-[10px] uppercase tracking-widest text-primary mb-2">
                Journal Prompts
              </div>
              <ul className="space-y-1.5">
                {getPrompts().map((prompt, i) => (
                  <li key={i} className="text-sm text-foreground italic flex items-start gap-2">
                    <span className="text-pink-500">✦</span>
                    {prompt}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Last/Next Star Points Reference */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-secondary rounded-sm">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Last Star Point</div>
              <div className="font-medium text-foreground mt-1">
                {cycleStatus.lastStarPoint.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-xs text-muted-foreground">
                {cycleStatus.lastStarPoint.type === 'inferior' ? '🌑' : '☀️'} {cycleStatus.lastStarPoint.degree}° {getSignSymbol(cycleStatus.lastStarPoint.sign)}
              </div>
            </div>
            <div className="p-3 bg-secondary rounded-sm">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Next Star Point</div>
              <div className="font-medium text-foreground mt-1">
                {cycleStatus.nextStarPoint.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="text-xs text-muted-foreground">
                {cycleStatus.nextStarPoint.type === 'inferior' ? '🌑' : '☀️'} {cycleStatus.nextStarPoint.degree}° {getSignSymbol(cycleStatus.nextStarPoint.sign)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
