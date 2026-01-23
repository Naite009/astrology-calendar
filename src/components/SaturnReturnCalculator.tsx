import { useMemo } from 'react';
import { Circle, ArrowRight, Star, AlertTriangle, CheckCircle } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateDetailedSaturnCycles, SaturnCyclePhase } from '@/lib/saturnCycleCalculator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns';

interface SaturnReturnCalculatorProps {
  chart: NatalChart;
  currentDate?: Date;
}

const SATURN_SYMBOL = '♄';

const PhaseCard = ({ phase, currentDate }: { phase: SaturnCyclePhase; currentDate: Date }) => {
  const firstEvent = phase.events[0];
  const isReturn = phase.phaseName === 'Return';
  const isActive = phase.isUpcoming && !phase.isPast;
  
  // Calculate time until/since
  const timeDiff = useMemo(() => {
    if (!firstEvent) return null;
    const eventDate = new Date(firstEvent.date);
    const daysDiff = differenceInDays(eventDate, currentDate);
    const monthsDiff = differenceInMonths(eventDate, currentDate);
    const yearsDiff = differenceInYears(eventDate, currentDate);
    
    if (Math.abs(yearsDiff) >= 2) {
      return { value: Math.abs(yearsDiff), unit: 'years', isPast: yearsDiff < 0 };
    } else if (Math.abs(monthsDiff) >= 2) {
      return { value: Math.abs(monthsDiff), unit: 'months', isPast: monthsDiff < 0 };
    } else {
      return { value: Math.abs(daysDiff), unit: 'days', isPast: daysDiff < 0 };
    }
  }, [firstEvent, currentDate]);
  
  const getBorderColor = () => {
    if (isReturn) return 'border-primary';
    if (phase.phaseType === 'waxing') return 'border-amber-400';
    if (phase.phaseType === 'waning') return 'border-purple-400';
    if (phase.phaseType === 'culmination') return 'border-red-400';
    return 'border-border';
  };
  
  const getBgColor = () => {
    if (isReturn && isActive) return 'bg-primary/10';
    if (isReturn) return 'bg-primary/5';
    if (isActive) return 'bg-secondary/80';
    return 'bg-card';
  };
  
  return (
    <div className={`p-4 rounded-lg border-2 ${getBorderColor()} ${getBgColor()} ${isActive ? 'ring-2 ring-primary/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{SATURN_SYMBOL}</span>
          <div>
            <div className="font-medium flex items-center gap-2">
              {phase.phaseName}
              <span className="text-lg">{phase.phaseSymbol}</span>
              {isReturn && <Star size={14} className="text-primary" fill="currentColor" />}
            </div>
            <div className="text-xs text-muted-foreground">
              Cycle {phase.cycleNumber} • {phase.transitingSign}
            </div>
          </div>
        </div>
        
        {isActive && (
          <span className="px-2 py-0.5 bg-primary text-primary-foreground text-xs font-bold rounded animate-pulse">
            UPCOMING
          </span>
        )}
        {phase.isPast && (
          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
            PAST
          </span>
        )}
      </div>
      
      {/* Age and timing */}
      <div className="flex items-center gap-4 mb-3">
        <div className="text-2xl font-serif">
          Age {firstEvent?.age || '?'}
        </div>
        {firstEvent && (
          <div className="text-sm text-muted-foreground">
            {format(new Date(firstEvent.date), 'MMM yyyy')}
          </div>
        )}
        {timeDiff && (
          <div className={`text-xs px-2 py-1 rounded ${timeDiff.isPast ? 'bg-muted' : 'bg-primary/20'}`}>
            {timeDiff.isPast ? `${timeDiff.value} ${timeDiff.unit} ago` : `in ${timeDiff.value} ${timeDiff.unit}`}
          </div>
        )}
      </div>
      
      {/* Description */}
      <p className="text-sm mb-3">{phase.description}</p>
      
      {/* Phase themes (collapsible) */}
      <details className="text-xs">
        <summary className="cursor-pointer text-primary hover:underline">
          Life Stage Interpretation
        </summary>
        <div className="mt-2 p-3 bg-background/50 rounded border border-border">
          <p className="whitespace-pre-line text-muted-foreground">{phase.phaseThemes}</p>
          
          {phase.question && (
            <div className="mt-3 p-2 bg-primary/10 rounded border-l-2 border-primary">
              <span className="font-medium">Reflection: </span>
              {phase.question}
            </div>
          )}
        </div>
      </details>
    </div>
  );
};

export const SaturnReturnCalculator = ({ chart, currentDate = new Date() }: SaturnReturnCalculatorProps) => {
  const saturnCycles = useMemo(() => {
    return calculateDetailedSaturnCycles(chart, currentDate);
  }, [chart, currentDate]);
  
  if (!saturnCycles) {
    return (
      <div className="p-4 rounded-lg border border-border bg-card text-center text-muted-foreground">
        <AlertTriangle size={24} className="mx-auto mb-2" />
        <p>Saturn position not available in chart</p>
      </div>
    );
  }
  
  // Filter to show Returns and key life stages (ages 28-30, 57-59)
  const keyPhases = saturnCycles.cycles.filter(phase => {
    const age = phase.events[0]?.age || 0;
    // Show Returns (most important)
    if (phase.phaseName === 'Return') return true;
    // Show waning squares before returns (ages 21-22, 51-52)
    if (phase.phaseName === 'Third Quarter' && (age >= 20 && age <= 23 || age >= 50 && age <= 53)) return true;
    // Show oppositions (ages 14-15, 44)
    if (phase.phaseName === 'Opposition' && age < 60) return true;
    return false;
  });
  
  const upcomingPhases = keyPhases.filter(p => p.isUpcoming && !p.isPast);
  const pastPhases = keyPhases.filter(p => p.isPast);
  
  // Find the next major event
  const nextMajorEvent = upcomingPhases[0];
  
  // Calculate current age
  const birthDate = new Date(chart.birthDate);
  const currentAge = differenceInYears(currentDate, birthDate);
  
  // Determine current life stage
  const getLifeStage = (age: number): { stage: string; description: string } => {
    if (age < 7) return { stage: 'Early Foundation', description: 'Building basic structure and security' };
    if (age < 14) return { stage: 'Testing Foundations', description: 'First Saturn square - learning limits' };
    if (age < 21) return { stage: 'Identity Formation', description: 'Opposition phase - discovering self vs. world' };
    if (age < 29) return { stage: 'Preparation', description: 'Waning square - releasing youth, preparing for adulthood' };
    if (age < 37) return { stage: 'First Maturity', description: 'Post-first Return - building adult structures' };
    if (age < 44) return { stage: 'Mid-Career Building', description: 'Second waxing square - testing commitments' };
    if (age < 51) return { stage: 'Midlife Reckoning', description: 'Opposition - confronting achievements vs. dreams' };
    if (age < 58) return { stage: 'Wisdom Preparation', description: 'Waning square - simplifying, harvesting' };
    if (age < 66) return { stage: 'Elder Wisdom', description: 'Post-second Return - mastery and mentorship' };
    return { stage: 'Legacy Phase', description: 'Third cycle - transcendent perspective' };
  };
  
  const lifeStage = getLifeStage(currentAge);
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Current Life Stage Banner */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary border border-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{SATURN_SYMBOL}</span>
                <h4 className="font-serif text-lg">Saturn Life Stage</h4>
              </div>
              <div className="text-sm text-muted-foreground mb-2">
                Natal Saturn: {saturnCycles.natalSaturn.degree}° {saturnCycles.natalSaturn.sign}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-serif">Age {currentAge}</div>
              <div className="text-sm text-primary font-medium">{lifeStage.stage}</div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{lifeStage.description}</p>
        </div>
        
        {/* Next Major Event Highlight */}
        {nextMajorEvent && (
          <div className="p-4 rounded-lg border-2 border-primary bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <ArrowRight size={18} className="text-primary" />
              <h4 className="font-medium">Next Major Saturn Event</h4>
            </div>
            <PhaseCard phase={nextMajorEvent} currentDate={currentDate} />
          </div>
        )}
        
        {/* Saturn Returns Focus */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Star size={16} className="text-primary" />
            Saturn Returns (Ages 28-30, 57-59)
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            {keyPhases
              .filter(p => p.phaseName === 'Return')
              .slice(0, 2)
              .map((phase, i) => (
                <PhaseCard key={i} phase={phase} currentDate={currentDate} />
              ))}
          </div>
        </div>
        
        {/* Other Key Phases */}
        {keyPhases.filter(p => p.phaseName !== 'Return').length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Circle size={16} className="text-muted-foreground" />
              Other Key Life Transitions
            </h4>
            <div className="grid gap-3">
              {keyPhases
                .filter(p => p.phaseName !== 'Return')
                .slice(0, 4)
                .map((phase, i) => (
                  <PhaseCard key={i} phase={phase} currentDate={currentDate} />
                ))}
            </div>
          </div>
        )}
        
        {/* Legend */}
        <div className="p-3 rounded-lg bg-secondary/50 text-xs text-muted-foreground">
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border-2 border-primary" /> Saturn Return
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border-2 border-amber-400" /> Waxing Square (building)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border-2 border-purple-400" /> Waning Square (releasing)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border-2 border-red-400" /> Opposition (culmination)
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
