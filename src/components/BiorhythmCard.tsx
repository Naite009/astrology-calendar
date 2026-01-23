import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Minus, Heart, Users } from 'lucide-react';
import { 
  getAllBiorhythms, 
  getDayQuality, 
  getCompatibility,
  BiorhythmValue,
  BIORHYTHM_CYCLES,
  getStateLabel,
  CompatibilityResult
} from '@/lib/biorhythms';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NatalChart } from '@/hooks/useNatalChart';
import { format } from 'date-fns';

interface BiorhythmCardProps {
  birthDate: Date;
  targetDate?: Date;
  savedCharts?: NatalChart[];
  selectedChartId?: string;
  onChartChange?: (chartId: string) => void;
  chartName?: string;
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

const CompatibilityGauge = ({ 
  value, 
  label, 
  icon,
  color 
}: { 
  value: number; 
  label: string;
  icon: string;
  color: string;
}) => {
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 transform -rotate-90">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-secondary"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke={color}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm">{icon}</span>
          <span className="text-xs font-bold">{value}%</span>
        </div>
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">{label}</div>
    </div>
  );
};

const CompatibilityView = ({ 
  compatibility, 
  person1Name,
  person2Name,
  targetDate 
}: { 
  compatibility: CompatibilityResult;
  person1Name: string;
  person2Name: string;
  targetDate: Date;
}) => {
  const overallColor = compatibility.overall >= 70 
    ? 'hsl(142 76% 36%)' 
    : compatibility.overall >= 50 
      ? 'hsl(var(--primary))' 
      : 'hsl(var(--muted-foreground))';
  
  return (
    <div className="space-y-4">
      {/* Header with overall score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart size={16} className="text-pink-500" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Compatibility
          </span>
        </div>
        <div 
          className="px-2 py-1 rounded text-xs font-medium"
          style={{ 
            backgroundColor: `${overallColor}20`,
            color: overallColor
          }}
        >
          {compatibility.overall}% Overall
        </div>
      </div>
      
      {/* Names */}
      <div className="text-center text-sm">
        <span className="font-medium">{person1Name}</span>
        <span className="text-muted-foreground mx-2">♡</span>
        <span className="font-medium">{person2Name}</span>
      </div>
      
      {/* Cycle compatibility gauges */}
      <div className="flex justify-around">
        <CompatibilityGauge 
          value={compatibility.physical} 
          label="Physical" 
          icon="💪"
          color="hsl(var(--destructive))"
        />
        <CompatibilityGauge 
          value={compatibility.emotional} 
          label="Emotional" 
          icon="💙"
          color="hsl(var(--primary))"
        />
        <CompatibilityGauge 
          value={compatibility.intellectual} 
          label="Mental" 
          icon="🧠"
          color="hsl(142 76% 36%)"
        />
      </div>
      
      {/* Derived scores */}
      <div className="flex justify-center gap-6 text-xs">
        <div className="text-center">
          <div className="text-pink-500 font-medium">{compatibility.passion}%</div>
          <div className="text-muted-foreground">Passion</div>
        </div>
        <div className="text-center">
          <div className="text-blue-500 font-medium">{compatibility.communication}%</div>
          <div className="text-muted-foreground">Communication</div>
        </div>
      </div>
      
      {/* Synergy description */}
      <div className="pt-3 border-t border-border">
        <p className="text-sm text-center text-muted-foreground">
          {compatibility.synergy}
        </p>
      </div>
      
      {/* Peak days preview */}
      {compatibility.peakDays.length > 0 && (
        <div className="pt-2">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Best Days Together (Next 30)
          </div>
          <div className="flex flex-wrap gap-1">
            {compatibility.peakDays.slice(0, 5).map((day, i) => (
              <span 
                key={i}
                className="text-[10px] px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded"
              >
                {format(day.date, 'MMM d')} ({day.score}%)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const BiorhythmCard = ({ 
  birthDate, 
  targetDate = new Date(),
  savedCharts = [],
  selectedChartId,
  onChartChange,
  chartName = 'You'
}: BiorhythmCardProps) => {
  const [mode, setMode] = useState<'personal' | 'compatibility'>('personal');
  const [compareChartId, setCompareChartId] = useState<string>('');
  
  const biorhythms = useMemo(() => 
    getAllBiorhythms(birthDate, targetDate), 
    [birthDate, targetDate]
  );
  
  const dayQuality = useMemo(() => 
    getDayQuality(birthDate, targetDate), 
    [birthDate, targetDate]
  );
  
  const compareChart = useMemo(() => 
    savedCharts.find(c => c.id === compareChartId),
    [savedCharts, compareChartId]
  );
  
  const compatibility = useMemo(() => {
    if (!compareChart) return null;
    return getCompatibility(birthDate, new Date(compareChart.birthDate), targetDate);
  }, [birthDate, compareChart, targetDate]);
  
  const hasCritical = biorhythms.some(b => b.state === 'critical');
  const peakCount = biorhythms.filter(b => b.state === 'peak').length;
  
  // Filter out current chart from comparison options
  const comparisonOptions = savedCharts.filter(c => c.id !== selectedChartId);
  
  return (
    <TooltipProvider>
      <div className="p-4 rounded-lg border border-border bg-card">
        {/* Header with chart selector and mode toggle */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Biorhythms
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Chart Selector */}
            {savedCharts.length > 0 && onChartChange && (
              <Select value={selectedChartId} onValueChange={onChartChange}>
                <SelectTrigger className="h-8 text-xs w-[120px]">
                  <SelectValue placeholder="Select chart" />
                </SelectTrigger>
                <SelectContent>
                  {savedCharts.map(chart => (
                    <SelectItem key={chart.id} value={chart.id} className="text-xs">
                      {chart.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Mode toggle */}
            {comparisonOptions.length > 0 && (
              <div className="flex rounded-md border border-border overflow-hidden">
                <button
                  onClick={() => setMode('personal')}
                  className={`px-2 py-1 text-[10px] transition-colors ${
                    mode === 'personal' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <Users size={12} />
                </button>
                <button
                  onClick={() => setMode('compatibility')}
                  className={`px-2 py-1 text-[10px] transition-colors ${
                    mode === 'compatibility' 
                      ? 'bg-pink-500 text-white' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <Heart size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        {mode === 'compatibility' ? (
          <>
            {/* Comparison chart selector */}
            <div className="mb-4">
              <Select value={compareChartId} onValueChange={setCompareChartId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Compare with..." />
                </SelectTrigger>
                <SelectContent>
                  {comparisonOptions.map(chart => (
                    <SelectItem key={chart.id} value={chart.id} className="text-xs">
                      {chart.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {compatibility && compareChart ? (
              <CompatibilityView 
                compatibility={compatibility}
                person1Name={chartName}
                person2Name={compareChart.name}
                targetDate={targetDate}
              />
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Select someone to compare compatibility
              </div>
            )}
          </>
        ) : (
          <>
            {/* Day quality badge */}
            <div className="flex justify-end mb-2">
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
          </>
        )}
      </div>
    </TooltipProvider>
  );
};