import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, TrendingUp, TrendingDown, Minus, Heart, Users, Layers, Sparkles, ArrowUp, ArrowDown } from 'lucide-react';
import { getBiorhythmForecast } from '@/lib/biorhythms';
import { 
  getAllBiorhythms, 
  getDayQuality, 
  getCompatibility,
  BiorhythmValue,
  BIORHYTHM_CYCLES,
  getStateLabel,
  CompatibilityResult
} from '@/lib/biorhythms';
import { getSecondaryCycles, getRomanceReadiness, SecondaryCycle, RomanceReadiness } from '@/lib/dailySynthesis';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { NatalChart } from '@/hooks/useNatalChart';
import { format } from 'date-fns';

interface BiorhythmCardProps {
  birthDate: Date | null;
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
  state,
  direction
}: { 
  value: number; 
  color: string; 
  icon: string; 
  label: string;
  state: string;
  direction?: 'rising' | 'falling' | 'peak' | 'trough';
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
        
        {/* Direction indicator */}
        {direction && !isPeak && !isCritical && (
          <div className="absolute -bottom-1 right-0 text-xs text-muted-foreground">
            {direction === 'rising' && <ArrowUp size={14} className="text-green-500" />}
            {direction === 'falling' && <ArrowDown size={14} className="text-red-400" />}
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

// Smaller gauge for secondary cycles
const SecondaryGauge = ({ 
  cycle 
}: { 
  cycle: SecondaryCycle;
}) => {
  const normalizedValue = (cycle.value + 100) / 2;
  const circumference = 2 * Math.PI * 20;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  const isPositive = cycle.value >= 0;
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex flex-col items-center cursor-help">
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-secondary"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke={cycle.color}
                strokeWidth="4"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm">{cycle.icon}</span>
            </div>
          </div>
          <div className="mt-1 text-center">
            <div className="text-[10px] font-medium">{cycle.name}</div>
            <div className={`text-[10px] font-bold ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {cycle.value > 0 ? '+' : ''}{cycle.value}%
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-[200px]">
        <p className="font-medium mb-1">{cycle.name}</p>
        <p className="text-xs text-muted-foreground">{cycle.description}</p>
        <p className="text-xs mt-1">Components: {cycle.components.join(' + ')}</p>
      </TooltipContent>
    </Tooltip>
  );
};

// Romance Readiness View (Solo)
const RomanceReadinessView = ({ 
  romanceReadiness 
}: { 
  romanceReadiness: RomanceReadiness;
}) => {
  const getScoreColor = (value: number) => {
    if (value >= 60) return 'text-pink-500';
    if (value >= 30) return 'text-amber-500';
    if (value >= 0) return 'text-muted-foreground';
    return 'text-blue-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Heart size={16} className="text-pink-500" fill="currentColor" />
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          Romance Readiness
        </span>
      </div>
      
      {/* Main romance score */}
      <div className="text-center">
        <div className={`text-3xl font-bold ${getScoreColor(romanceReadiness.overallEnergy)}`}>
          {romanceReadiness.overallEnergy > 0 ? '+' : ''}{romanceReadiness.overallEnergy}%
        </div>
        <div className="text-xs text-muted-foreground">Overall Romantic Energy</div>
      </div>
      
      {/* Romance gauges */}
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center p-2 rounded bg-secondary/50">
          <div className="text-lg">🔥</div>
          <div className={`text-sm font-bold ${getScoreColor(romanceReadiness.passionScore)}`}>
            {romanceReadiness.passionScore}%
          </div>
          <div className="text-[10px] text-muted-foreground">Passion</div>
        </div>
        <div className="text-center p-2 rounded bg-secondary/50">
          <div className="text-lg">💗</div>
          <div className={`text-sm font-bold ${getScoreColor(romanceReadiness.heartOpenness)}`}>
            {romanceReadiness.heartOpenness}%
          </div>
          <div className="text-[10px] text-muted-foreground">Heart</div>
        </div>
        <div className="text-center p-2 rounded bg-secondary/50">
          <div className="text-lg">✨</div>
          <div className={`text-sm font-bold ${getScoreColor(romanceReadiness.magnetism)}`}>
            {romanceReadiness.magnetism}%
          </div>
          <div className="text-[10px] text-muted-foreground">Magnetism</div>
        </div>
        <div className="text-center p-2 rounded bg-secondary/50">
          <div className="text-lg">🔮</div>
          <div className={`text-sm font-bold ${getScoreColor(romanceReadiness.intuition)}`}>
            {romanceReadiness.intuition}%
          </div>
          <div className="text-[10px] text-muted-foreground">Intuition</div>
        </div>
      </div>
      
      {/* Best activities */}
      <div className="pt-2">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Best For Today
        </div>
        <div className="flex flex-wrap gap-1">
          {romanceReadiness.bestActivities.slice(0, 4).map((activity, i) => (
            <span 
              key={i}
              className="text-[10px] px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded"
            >
              {activity}
            </span>
          ))}
        </div>
      </div>
      
      {/* Recommendation */}
      <div className="pt-3 border-t border-border">
        <p className="text-sm text-center text-muted-foreground">
          {romanceReadiness.recommendation}
        </p>
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

/* ── Inline 30-day biorhythm wave chart shown under the three circles ── */
const BiorhythmWaveInline = ({ birthDate, targetDate, primaryBiorhythms }: { 
  birthDate: Date; targetDate: Date; primaryBiorhythms: BiorhythmValue[] 
}) => {
  const forecast = useMemo(() => {
    const start = new Date(targetDate);
    start.setDate(start.getDate() - 3);
    return getBiorhythmForecast(birthDate, start, 33);
  }, [birthDate, targetDate]);

  if (forecast.length === 0) return null;

  const width = 600;
  const height = 140;
  const pad = { top: 20, right: 15, bottom: 24, left: 32 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;

  const xScale = (i: number) => pad.left + (i / (forecast.length - 1)) * cw;
  const yScale = (v: number) => pad.top + ((100 - v) / 200) * ch;

  const makePath = (vals: number[]) =>
    vals.map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(v)}`).join(' ');

  const todayIdx = forecast.findIndex(d => {
    const t = new Date();
    return d.date.getDate() === t.getDate() && d.date.getMonth() === t.getMonth() && d.date.getFullYear() === t.getFullYear();
  });

  const lines = [
    { key: 'physical', color: 'hsl(210 90% 50%)', vals: forecast.map(d => d.physical) },
    { key: 'emotional', color: 'hsl(0 84% 60%)', vals: forecast.map(d => d.emotional) },
    { key: 'intellectual', color: 'hsl(142 76% 36%)', vals: forecast.map(d => d.intellectual) },
  ];

  return (
    <div className="mt-4 pt-3 border-t border-border">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">30-Day Biorhythm Forecast</p>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <line x1={pad.left} y1={yScale(0)} x2={width - pad.right} y2={yScale(0)}
          stroke="currentColor" strokeOpacity={0.25} strokeDasharray="4 4" />
        <text x={pad.left - 4} y={yScale(100)} textAnchor="end" className="text-[8px] fill-muted-foreground">+100</text>
        <text x={pad.left - 4} y={yScale(0)} textAnchor="end" className="text-[8px] fill-muted-foreground">0</text>
        <text x={pad.left - 4} y={yScale(-100)} textAnchor="end" className="text-[8px] fill-muted-foreground">-100</text>
        {lines.map(l => (
          <path key={l.key} d={makePath(l.vals)} fill="none" stroke={l.color} strokeWidth={1.8} strokeOpacity={0.85} />
        ))}
        {todayIdx >= 0 && (
          <>
            <line x1={xScale(todayIdx)} y1={pad.top} x2={xScale(todayIdx)} y2={height - pad.bottom}
              stroke="hsl(var(--primary))" strokeWidth={1.5} strokeDasharray="3 2" />
            <text x={xScale(todayIdx)} y={pad.top - 4} textAnchor="middle" className="text-[7px] fill-primary font-semibold">TODAY</text>
          </>
        )}
        {forecast.filter((_, i) => i % 7 === 0).map((d, i) => (
          <text key={i} x={xScale(i * 7)} y={height - 6} textAnchor="middle" className="text-[7px] fill-muted-foreground">
            {format(d.date, 'M/d')}
          </text>
        ))}
      </svg>
      <div className="flex justify-center gap-4 mt-1">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-3 h-0.5 rounded inline-block" style={{ backgroundColor: 'hsl(210 90% 50%)' }} /> Physical</span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-3 h-0.5 rounded inline-block" style={{ backgroundColor: 'hsl(0 84% 60%)' }} /> Emotional</span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-3 h-0.5 rounded inline-block" style={{ backgroundColor: 'hsl(142 76% 36%)' }} /> Intellectual</span>
      </div>
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
  const [mode, setMode] = useState<'personal' | 'romance' | 'compatibility'>('personal');
  const [cycleView, setCycleView] = useState<'primary' | 'secondary'>('primary');
  const [compareChartId, setCompareChartId] = useState<string>('');
  
  const biorhythms = useMemo(() => 
    birthDate ? getAllBiorhythms(birthDate, targetDate, true) : [], 
    [birthDate, targetDate]
  );
  
  const secondaryCycles = useMemo(() =>
    birthDate ? getSecondaryCycles(birthDate, targetDate) : [],
    [birthDate, targetDate]
  );
  
  const romanceReadiness = useMemo(() =>
    birthDate ? getRomanceReadiness(birthDate, targetDate) : null,
    [birthDate, targetDate]
  );
  
  const dayQuality = useMemo(() => 
    birthDate ? getDayQuality(birthDate, targetDate) : null, 
    [birthDate, targetDate]
  );
  
  const compareChart = useMemo(() => 
    savedCharts.find(c => c.id === compareChartId),
    [savedCharts, compareChartId]
  );
  
  const compatibility = useMemo(() => {
    if (!compareChart || !birthDate) return null;
    return getCompatibility(birthDate, new Date(compareChart.birthDate), targetDate);
  }, [birthDate, compareChart, targetDate]);
  
  const hasCritical = biorhythms.some(b => b.state === 'critical');
  const peakCount = biorhythms.filter(b => b.state === 'peak').length;
  
  // Filter out current chart from comparison options
  const comparisonOptions = savedCharts.filter(c => c.id !== selectedChartId);
  
  // Only show 3 primary cycles (not intuitive)
  const primaryBiorhythms = biorhythms.filter(b => 
    b.cycle === 'Physical' || b.cycle === 'Emotional' || b.cycle === 'Intellectual'
  );
  
  return (
    <TooltipProvider>
      <div className="p-4 rounded-lg border border-border bg-card">
        {/* Header with chart selector and mode toggle */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-primary" />
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              Personal Biorhythm
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Chart Selector - Always visible if there are charts */}
            {savedCharts.length > 0 && onChartChange && (
              <Select value={selectedChartId || ''} onValueChange={onChartChange}>
                <SelectTrigger className="h-8 text-xs w-[140px]">
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  {savedCharts.map(chart => (
                    <SelectItem key={chart.id} value={chart.id} className="text-xs">
                      {chart.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {/* Mode toggle - Personal / Solo Romance / Compatibility */}
            {birthDate && (
              <div className="flex rounded-md border border-border overflow-hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>
                  <TooltipContent>Personal View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setMode('romance')}
                      className={`px-2 py-1 text-[10px] transition-colors ${
                        mode === 'romance' 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <Sparkles size={12} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Solo Romance Readiness</TooltipContent>
                </Tooltip>
                {comparisonOptions.length > 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setMode('compatibility')}
                        className={`px-2 py-1 text-[10px] transition-colors ${
                          mode === 'compatibility' 
                            ? 'bg-pink-600 text-white' 
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                      >
                        <Heart size={12} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Partner Compatibility</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* No chart selected state */}
        {!birthDate && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Activity size={24} className="mx-auto mb-2 opacity-50" />
            <p>Select a person above to see their biorhythm cycles</p>
          </div>
        )}
        
        {/* Solo Romance Mode */}
        {birthDate && mode === 'romance' && romanceReadiness && (
          <RomanceReadinessView romanceReadiness={romanceReadiness} />
        )}
        
        {/* Compatibility Mode */}
        {birthDate && mode === 'compatibility' ? (
          <>
            {/* Comparison chart selector */}
            <div className="mb-4">
              <Select value={compareChartId} onValueChange={setCompareChartId}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Compare with..." />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
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
                person1Name={chartName || 'You'}
                person2Name={compareChart.name}
                targetDate={targetDate}
              />
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Select someone to compare compatibility
              </div>
            )}
          </>
        ) : birthDate && mode === 'personal' && dayQuality ? (
          <>
            {/* Cycle view toggle and day quality badge */}
            <div className="flex justify-between items-center mb-3">
              {/* Primary/Secondary toggle */}
              <div className="flex rounded-md border border-border overflow-hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCycleView('primary')}
                      className={`px-2 py-1 text-[10px] transition-colors ${
                        cycleView === 'primary' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      Primary
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Physical, Emotional, Intellectual</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCycleView('secondary')}
                      className={`px-2 py-1 text-[10px] transition-colors ${
                        cycleView === 'secondary' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      <Layers size={12} className="inline mr-1" />
                      Secondary
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Mastery, Passion, Wisdom, Awareness, Aesthetic</TooltipContent>
                </Tooltip>
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
            
            {/* Primary Cycles */}
            {cycleView === 'primary' && (
              <div className="flex justify-around items-start">
                {primaryBiorhythms.map((bio) => {
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
                            direction={bio.direction}
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[200px]">
                        <p className="font-medium mb-1">{bio.cycle} Cycle ({BIORHYTHM_CYCLES[cycleKey].length} days)</p>
                        <p className="text-xs text-muted-foreground">{cycleInfo?.description}</p>
                        {bio.direction && (
                          <p className="text-xs mt-1">
                            {bio.direction === 'rising' ? '↗ Rising toward peak' : 
                             bio.direction === 'falling' ? '↘ Falling toward trough' :
                             bio.direction === 'peak' ? '⭐ At peak' : '💫 At trough'}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            )}
            
            {/* Secondary Cycles */}
            {cycleView === 'secondary' && (
              <div className="flex justify-around items-start flex-wrap gap-2">
                {secondaryCycles.map((cycle) => (
                  <SecondaryGauge key={cycle.name} cycle={cycle} />
                ))}
              </div>
            )}
            
            {/* Summary message */}
            <div className="mt-4 pt-3 border-t border-border">
              <p className="text-sm text-center text-muted-foreground">
                {dayQuality.recommendation}
              </p>
            </div>
            
            {/* 30-Day Biorhythm Wave Chart */}
            <BiorhythmWaveInline birthDate={birthDate} targetDate={targetDate} primaryBiorhythms={primaryBiorhythms} />
          </>
        ) : null}
      </div>
    </TooltipProvider>
  );
};
