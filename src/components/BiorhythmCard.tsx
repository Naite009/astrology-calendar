import { useMemo } from 'react';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { 
  getAllBiorhythms, 
  getDayQuality, 
  BiorhythmValue,
  BIORHYTHM_CYCLES,
  getStateLabel
} from '@/lib/biorhythms';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BiorhythmCardProps {
  birthDate: Date;
  targetDate?: Date;
}

const CircularGauge = ({ 
  value, 
  color, 
  icon, 
  label,
  state 
}: { 
  value: number; 
  color: string; 
  icon: string; 
  label: string;
  state: string;
}) => {
  // Normalize value from -100/+100 to 0-100 for the gauge
  const normalizedValue = (value + 100) / 2;
  const circumference = 2 * Math.PI * 36; // radius = 36
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  
  const isPositive = value >= 0;
  const isCritical = state === 'critical';
  const isPeak = state === 'peak';
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        {/* Background circle */}
        <svg className="w-24 h-24 transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="36"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-secondary"
          />
          <circle
            cx="48"
            cy="48"
            r="36"
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-500 ${isCritical ? 'animate-pulse' : ''}`}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg">{icon}</span>
          <span className={`text-lg font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {value > 0 ? '+' : ''}{value}%
          </span>
        </div>
        
        {/* Peak/Critical badge */}
        {(isPeak || isCritical) && (
          <div className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-bold rounded ${
            isPeak 
              ? 'bg-green-500 text-white' 
              : 'bg-yellow-500 text-black animate-pulse'
          }`}>
            {isPeak ? 'PEAK' : 'CRIT'}
          </div>
        )}
      </div>
      
      <div className="mt-2 text-center">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
          {state === 'peak' && <TrendingUp size={12} className="text-green-500" />}
          {state === 'high' && <TrendingUp size={12} className="text-green-400" />}
          {state === 'neutral' && <Minus size={12} />}
          {state === 'low' && <TrendingDown size={12} className="text-red-400" />}
          {state === 'critical' && <AlertTriangle size={12} className="text-yellow-500" />}
          {getStateLabel(state as any)}
        </div>
      </div>
    </div>
  );
};

export const BiorhythmCard = ({ birthDate, targetDate = new Date() }: BiorhythmCardProps) => {
  const biorhythms = useMemo(() => 
    getAllBiorhythms(birthDate, targetDate), 
    [birthDate, targetDate]
  );
  
  const dayQuality = useMemo(() => 
    getDayQuality(birthDate, targetDate), 
    [birthDate, targetDate]
  );
  
  const hasCritical = biorhythms.some(b => b.state === 'critical');
  const peakCount = biorhythms.filter(b => b.state === 'peak').length;
  
  return (
    <TooltipProvider>
      <div className="p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Biorhythms
            </span>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                peakCount >= 2 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  : hasCritical 
                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                    : dayQuality.score >= 30 
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'bg-secondary text-muted-foreground'
              }`}>
                {dayQuality.label}
              </div>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[240px]">
              <p className="text-sm">{dayQuality.recommendation}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        
        {/* Circular Gauges */}
        <div className="flex justify-around items-start">
          {biorhythms.map((bio) => {
            const cycleKey = bio.cycle.toLowerCase();
            const cycleInfo = BIORHYTHM_CYCLES[cycleKey];
            
            return (
              <Tooltip key={bio.cycle}>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <CircularGauge
                      value={bio.value}
                      color={bio.color}
                      icon={bio.icon}
                      label={bio.cycle}
                      state={bio.state}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-[200px]">
                  <p className="font-medium mb-1">{bio.cycle} Cycle ({BIORHYTHM_CYCLES[cycleKey].length} days)</p>
                  <p className="text-xs text-muted-foreground">{cycleInfo?.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        
        {/* Summary message */}
        <div className="mt-4 pt-3 border-t border-border">
          <p className="text-sm text-center text-muted-foreground">
            {dayQuality.recommendation}
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
};
