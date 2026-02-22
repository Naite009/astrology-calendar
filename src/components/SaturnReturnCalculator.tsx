import { useMemo } from 'react';
import { Circle, ArrowRight, Star, AlertTriangle, Zap } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateDetailedSaturnCycles, SaturnCyclePhase, UranusOpposition } from '@/lib/saturnCycleCalculator';
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
      
      {/* Age, exact dates, and timing */}
      <div className="mb-3">
        <div className="flex items-center gap-4 mb-2">
          <div className="text-2xl font-serif">
            Age {firstEvent?.age || '?'}
          </div>
          {timeDiff && (
            <div className={`text-xs px-2 py-1 rounded ${timeDiff.isPast ? 'bg-muted' : 'bg-primary/20'}`}>
              {timeDiff.isPast ? `${timeDiff.value} ${timeDiff.unit} ago` : `in ${timeDiff.value} ${timeDiff.unit}`}
            </div>
          )}
        </div>
        {/* Show ALL exact dates for each pass */}
        <div className="space-y-1">
          {phase.events.map((event, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                event.type === 'retrograde_pass' 
                  ? 'bg-purple-500/20 text-purple-600' 
                  : 'bg-blue-500/20 text-blue-600'
              }`}>
                {idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : 'rd'} pass
                {event.type === 'retrograde_pass' ? ' ℞' : ' →'}
              </span>
              <span className="font-medium">
                {format(new Date(event.date), 'MMMM d, yyyy')}
              </span>
              <span className="text-xs text-muted-foreground">
                (age {event.age})
              </span>
            </div>
          ))}
          {phase.events.length === 0 && firstEvent && (
            <div className="text-sm text-muted-foreground">
              {format(new Date(firstEvent.date), 'MMMM d, yyyy')}
            </div>
          )}
        </div>
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

// Uranus Opposition Card - Distinct cyan/teal styling
const UranusOppositionCard = ({ 
  opposition, 
  currentDate 
}: { 
  opposition: UranusOpposition; 
  currentDate: Date 
}) => {
  const firstEvent = opposition.events[0];
  const isActive = opposition.isUpcoming && !opposition.isPast;
  
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
  
  // Format degree for display
  const formatDegree = (absoluteDegree: number): string => {
    const normalized = ((absoluteDegree % 360) + 360) % 360;
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const signIndex = Math.floor(normalized / 30);
    const degree = Math.floor(normalized % 30);
    const minutes = Math.round((normalized % 1) * 60);
    return `${degree}°${minutes.toString().padStart(2, '0')}' ${signs[signIndex]}`;
  };
  
  return (
    <div className={`p-4 rounded-lg border-2 border-cyan-500 ${isActive ? 'bg-cyan-500/20 ring-2 ring-cyan-400/50' : opposition.isPast ? 'bg-cyan-950/30' : 'bg-cyan-500/10'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">♅</span>
          <div>
            <div className="font-medium flex items-center gap-2">
              Uranus Opposition
              <span className="text-lg">☍</span>
              <Zap size={14} className="text-cyan-400" fill="currentColor" />
            </div>
            <div className="text-xs text-muted-foreground">
              Midlife Awakening • {opposition.oppositionSign}
            </div>
          </div>
        </div>
        
        {isActive && (
          <span className="px-2 py-0.5 bg-cyan-500 text-white text-xs font-bold rounded animate-pulse">
            ACTIVE
          </span>
        )}
        {opposition.isPast && (
          <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">
            PAST
          </span>
        )}
      </div>
      
      {/* Exact Degrees Display */}
      <div className="text-xs bg-secondary/50 p-2 rounded mb-3 font-mono">
        <div className="flex flex-wrap gap-4">
          <div>
            <span className="text-muted-foreground">Natal ♅: </span>
            <span className="text-foreground font-medium">{formatDegree(opposition.natalUranus.absoluteDegree)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Opposition hits: </span>
            <span className="text-cyan-400 font-medium">{formatDegree(opposition.oppositionDegree)}</span>
          </div>
        </div>
      </div>
      
      {/* All passes with exact dates */}
      <div className="space-y-2 mb-3">
        {opposition.events.map((event, idx) => (
          <div 
            key={idx} 
            className={`flex items-center gap-3 p-2 rounded ${
              event.type === 'exact' 
                ? 'bg-cyan-500/30 border border-cyan-400' 
                : 'bg-background/50'
            }`}
          >
            <div className={`text-lg font-serif ${event.type === 'exact' ? 'text-cyan-300 font-bold' : ''}`}>
              Age {event.age}
            </div>
            <div className="text-sm text-muted-foreground">
              {format(new Date(event.date), 'MMM d, yyyy')}
            </div>
            <div className={`text-xs px-2 py-0.5 rounded ${
              event.type === 'exact' 
                ? 'bg-cyan-500 text-white font-bold' 
                : event.type === 'retrograde_pass' 
                  ? 'bg-amber-500/30 text-amber-200' 
                  : 'bg-green-500/30 text-green-200'
            }`}>
              {event.type === 'exact' ? '★ EXACT HIT' : event.type === 'retrograde_pass' ? 'Retrograde' : 'Direct'}
            </div>
          </div>
        ))}
      </div>
      
      {timeDiff && (
        <div className={`text-xs px-2 py-1 rounded inline-block mb-3 ${timeDiff.isPast ? 'bg-muted' : 'bg-cyan-500/20 text-cyan-300'}`}>
          {timeDiff.isPast ? `${timeDiff.value} ${timeDiff.unit} ago` : `in ${timeDiff.value} ${timeDiff.unit}`}
        </div>
      )}
      
      {/* Description */}
      <details className="text-xs">
        <summary className="cursor-pointer text-cyan-400 hover:underline">
          What is the Uranus Opposition?
        </summary>
        <div className="mt-2 p-3 bg-background/50 rounded border border-cyan-500/30">
          <p className="whitespace-pre-line text-muted-foreground">{opposition.description}</p>
          
          <div className="mt-3 p-2 bg-cyan-500/10 rounded border-l-2 border-cyan-400">
            <span className="font-medium">Reflection: </span>
            Where have I been playing it safe? What authentic part of myself have I suppressed?
          </div>
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
        
        {/* Uranus Opposition - Distinct Section */}
        {saturnCycles.uranusOpposition && (
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Zap size={16} className="text-cyan-400" />
              Uranus Opposition (Age ~42) — Midlife Awakening
            </h4>
            <UranusOppositionCard 
              opposition={saturnCycles.uranusOpposition} 
              currentDate={currentDate} 
            />
          </div>
        )}
        
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
              <span className="w-3 h-3 rounded border-2 border-cyan-500" /> Uranus Opposition
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border-2 border-amber-400" /> Waxing Square
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border-2 border-purple-400" /> Waning Square
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded border-2 border-red-400" /> Opposition
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
