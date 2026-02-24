import { useMemo, useState } from 'react';
import { TrendingUp, AlertTriangle, Sparkles, ChevronLeft, ChevronRight, Heart, User, Moon } from 'lucide-react';
import { 
  getBiorhythmForecast, 
  getCriticalDays, 
  getPeakDays,
  getCompatibilityForecast,
  BiorhythmDay,
  BIORHYTHM_CYCLES
} from '@/lib/biorhythms';
import { getMoonPhase } from '@/lib/astrology';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isSameDay } from 'date-fns';
import { ChartSelector } from './ChartSelector';

interface SavedChart {
  id: string;
  name: string;
  birthDate: string;
}

interface MoonPhaseData {
  date: Date;
  phase: string;
  emoji: string;
  isSignificant: boolean; // New/Full moon
}

interface BiorhythmForecastProps {
  birthDate: Date;
  startDate?: Date;
  days?: number;
  savedCharts?: SavedChart[];
  selectedChartId?: string;
  onChartChange?: (chartId: string) => void;
  showMoonOverlay?: boolean;
}

const WaveChart = ({ 
  forecast, 
  selectedDay,
  onDaySelect,
  moonPhases
}: { 
  forecast: BiorhythmDay[];
  selectedDay: number;
  onDaySelect: (index: number) => void;
  moonPhases?: MoonPhaseData[];
}) => {
  const width = 700;
  const height = 220; // Slightly taller for moon icons
  const padding = { top: 30, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const xScale = (index: number) => padding.left + (index / (forecast.length - 1)) * chartWidth;
  const yScale = (value: number) => padding.top + ((100 - value) / 200) * chartHeight;
  
  const createPath = (values: number[]) => {
    return values.map((val, i) => {
      const x = xScale(i);
      const y = yScale(val);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };
  
  const physicalPath = createPath(forecast.map(d => d.physical));
  const emotionalPath = createPath(forecast.map(d => d.emotional));
  const intellectualPath = createPath(forecast.map(d => d.intellectual));
  
  // Find today's index
  const todayIndex = forecast.findIndex(d => isSameDay(d.date, new Date()));
  
  // Find moon phase markers from props
  const significantMoonDays = useMemo(() => {
    if (!moonPhases) return [];
    return forecast.map((day, i) => {
      const moonData = moonPhases.find(m => isSameDay(m.date, day.date));
      return moonData?.isSignificant ? { index: i, ...moonData } : null;
    }).filter(Boolean) as { index: number; emoji: string; phase: string }[];
  }, [forecast, moonPhases]);
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Grid lines */}
      <line 
        x1={padding.left} 
        y1={yScale(0)} 
        x2={width - padding.right} 
        y2={yScale(0)} 
        stroke="currentColor" 
        strokeOpacity={0.3} 
        strokeDasharray="4 4"
      />
      <line 
        x1={padding.left} 
        y1={yScale(100)} 
        x2={width - padding.right} 
        y2={yScale(100)} 
        stroke="currentColor" 
        strokeOpacity={0.1}
      />
      <line 
        x1={padding.left} 
        y1={yScale(-100)} 
        x2={width - padding.right} 
        y2={yScale(-100)} 
        stroke="currentColor" 
        strokeOpacity={0.1}
      />
      
      {/* Y-axis labels */}
      <text x={padding.left - 5} y={yScale(100)} textAnchor="end" className="text-[10px] fill-muted-foreground">+100%</text>
      <text x={padding.left - 5} y={yScale(0)} textAnchor="end" className="text-[10px] fill-muted-foreground">0%</text>
      <text x={padding.left - 5} y={yScale(-100)} textAnchor="end" className="text-[10px] fill-muted-foreground">-100%</text>
      
      {/* Moon phase markers at top */}
      {significantMoonDays.map((moon, i) => (
        <g key={i}>
          <text 
            x={xScale(moon.index)} 
            y={12} 
            textAnchor="middle" 
            className="text-sm"
          >
            {moon.emoji}
          </text>
          <line
            x1={xScale(moon.index)}
            y1={18}
            x2={xScale(moon.index)}
            y2={padding.top}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="2 2"
            strokeOpacity={0.5}
          />
        </g>
      ))}
      
      {/* Cycle lines */}
      <path d={physicalPath} fill="none" stroke="hsl(210 90% 50%)" strokeWidth={2} strokeOpacity={0.8} />
      <path d={emotionalPath} fill="none" stroke="hsl(0 84% 60%)" strokeWidth={2} strokeOpacity={0.8} />
      <path d={intellectualPath} fill="none" stroke="hsl(142 76% 36%)" strokeWidth={2} strokeOpacity={0.8} />
      
      {/* Today marker */}
      {todayIndex >= 0 && (
        <line 
          x1={xScale(todayIndex)} 
          y1={padding.top} 
          x2={xScale(todayIndex)} 
          y2={height - padding.bottom} 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      )}
      
      {/* Interactive points */}
      {forecast.map((day, i) => (
        <g key={i} onClick={() => onDaySelect(i)} className="cursor-pointer">
          {/* Invisible larger hit area */}
          <rect
            x={xScale(i) - 10}
            y={padding.top}
            width={20}
            height={chartHeight}
            fill="transparent"
          />
          
          {/* Selected day highlight */}
          {selectedDay === i && (
            <rect
              x={xScale(i) - 8}
              y={padding.top}
              width={16}
              height={chartHeight}
              fill="hsl(var(--primary))"
              fillOpacity={0.1}
              rx={4}
            />
          )}
          
          {/* Critical day markers */}
          {day.criticalCycles.length > 0 && (
            <circle
              cx={xScale(i)}
              cy={yScale(0)}
              r={4}
              fill="hsl(45 100% 50%)"
              className="animate-pulse"
            />
          )}
          
          {/* Peak day markers */}
          {day.peakCycles.length >= 2 && (
            <circle
              cx={xScale(i)}
              cy={yScale(80)}
              r={4}
              fill="hsl(142 76% 36%)"
            />
          )}
        </g>
      ))}
      
      {/* X-axis date labels (every 5 days) */}
      {forecast.filter((_, i) => i % 5 === 0).map((day, i) => (
        <text 
          key={i}
          x={xScale(i * 5)} 
          y={height - 10} 
          textAnchor="middle" 
          className="text-[10px] fill-muted-foreground"
        >
          {format(day.date, 'M/d')}
        </text>
      ))}
    </svg>
  );
};

// Compatibility Wave Chart - shows overall compatibility over time
const CompatibilityWaveChart = ({ 
  forecast, 
  selectedDay,
  onDaySelect 
}: { 
  forecast: { date: Date; overall: number; passion: number; communication: number }[];
  selectedDay: number;
  onDaySelect: (index: number) => void;
}) => {
  const width = 700;
  const height = 150;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  
  const xScale = (index: number) => padding.left + (index / (forecast.length - 1)) * chartWidth;
  const yScale = (value: number) => padding.top + ((100 - value) / 100) * chartHeight;
  
  const createPath = (values: number[]) => {
    return values.map((val, i) => {
      const x = xScale(i);
      const y = yScale(val);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };
  
  // Create area fill path
  const createAreaPath = (values: number[]) => {
    const linePath = createPath(values);
    const lastX = xScale(values.length - 1);
    const firstX = xScale(0);
    const bottomY = yScale(0);
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };
  
  const overallPath = createPath(forecast.map(d => d.overall));
  const overallAreaPath = createAreaPath(forecast.map(d => d.overall));
  
  // Find peak compatibility days
  const peakDays = forecast.map((d, i) => ({ ...d, index: i })).filter(d => d.overall >= 70);
  
  // Find today's index
  const todayIndex = forecast.findIndex(d => {
    const today = new Date();
    return d.date.getDate() === today.getDate() && 
           d.date.getMonth() === today.getMonth() &&
           d.date.getFullYear() === today.getFullYear();
  });
  
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      {/* Background gradient zones */}
      <defs>
        <linearGradient id="compatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(330 80% 60%)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="hsl(330 80% 60%)" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      
      {/* Grid lines */}
      <line 
        x1={padding.left} 
        y1={yScale(70)} 
        x2={width - padding.right} 
        y2={yScale(70)} 
        stroke="hsl(330 80% 60%)" 
        strokeOpacity={0.3} 
        strokeDasharray="4 4"
      />
      <line 
        x1={padding.left} 
        y1={yScale(40)} 
        x2={width - padding.right} 
        y2={yScale(40)} 
        stroke="currentColor" 
        strokeOpacity={0.2} 
        strokeDasharray="2 2"
      />
      
      {/* Y-axis labels */}
      <text x={padding.left - 5} y={yScale(100)} textAnchor="end" className="text-[10px] fill-muted-foreground">100%</text>
      <text x={padding.left - 5} y={yScale(70)} textAnchor="end" className="text-[10px] fill-pink-500">70%</text>
      <text x={padding.left - 5} y={yScale(40)} textAnchor="end" className="text-[10px] fill-muted-foreground">40%</text>
      <text x={padding.left - 5} y={yScale(0)} textAnchor="end" className="text-[10px] fill-muted-foreground">0%</text>
      
      {/* Area fill */}
      <path d={overallAreaPath} fill="url(#compatGradient)" />
      
      {/* Compatibility line */}
      <path d={overallPath} fill="none" stroke="hsl(330 80% 60%)" strokeWidth={2.5} />
      
      {/* Today marker */}
      {todayIndex >= 0 && (
        <line 
          x1={xScale(todayIndex)} 
          y1={padding.top} 
          x2={xScale(todayIndex)} 
          y2={height - padding.bottom} 
          stroke="hsl(var(--primary))" 
          strokeWidth={2}
          strokeDasharray="4 2"
        />
      )}
      
      {/* Peak day markers */}
      {peakDays.map((day, i) => (
        <g key={i}>
          <circle
            cx={xScale(day.index)}
            cy={yScale(day.overall)}
            r={5}
            fill="hsl(330 80% 60%)"
            stroke="white"
            strokeWidth={2}
          />
          <text 
            x={xScale(day.index)} 
            y={yScale(day.overall) - 10} 
            textAnchor="middle" 
            className="text-[9px] fill-pink-500 font-bold"
          >
            ❤️
          </text>
        </g>
      ))}
      
      {/* Interactive points */}
      {forecast.map((day, i) => (
        <g key={i} onClick={() => onDaySelect(i)} className="cursor-pointer">
          <rect
            x={xScale(i) - 10}
            y={padding.top}
            width={20}
            height={chartHeight}
            fill="transparent"
          />
          
          {selectedDay === i && (
            <rect
              x={xScale(i) - 8}
              y={padding.top}
              width={16}
              height={chartHeight}
              fill="hsl(330 80% 60%)"
              fillOpacity={0.15}
              rx={4}
            />
          )}
        </g>
      ))}
      
      {/* X-axis date labels (every 5 days) */}
      {forecast.filter((_, i) => i % 5 === 0).map((day, i) => (
        <text 
          key={i}
          x={xScale(i * 5)} 
          y={height - 10} 
          textAnchor="middle" 
          className="text-[10px] fill-muted-foreground"
        >
          {format(day.date, 'M/d')}
        </text>
      ))}
    </svg>
  );
};

export const BiorhythmForecast = ({
  birthDate, 
  startDate = new Date(), 
  days = 30,
  savedCharts = [],
  selectedChartId,
  onChartChange
}: BiorhythmForecastProps) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [mode, setMode] = useState<'personal' | 'romance'>('personal');
  const [partnerChartId, setPartnerChartId] = useState<string>('');
  
  const partnerChart = savedCharts.find(c => c.id === partnerChartId);
  const partnerBirthDate = partnerChart ? new Date(partnerChart.birthDate) : null;
  
  const forecast = useMemo(() => {
    // Start 3 days before today for context
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() - 3);
    return getBiorhythmForecast(birthDate, adjustedStart, days + 3);
  }, [birthDate, startDate, days]);
  
  const compatibilityForecast = useMemo(() => {
    if (mode !== 'romance' || !partnerBirthDate) return null;
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() - 3);
    return getCompatibilityForecast(birthDate, partnerBirthDate, adjustedStart, days + 3);
  }, [birthDate, partnerBirthDate, startDate, days, mode]);
  
  const criticalDays = useMemo(() => 
    getCriticalDays(birthDate, startDate, days), 
    [birthDate, startDate, days]
  );
  
  const peakDays = useMemo(() => 
    getPeakDays(birthDate, startDate, days), 
    [birthDate, startDate, days]
  );
  
  const selectedDay = forecast[selectedDayIndex];
  const selectedCompatibility = compatibilityForecast?.[selectedDayIndex];
  
  // Navigate selected day
  const navigateDay = (delta: number) => {
    const newIndex = Math.max(0, Math.min(forecast.length - 1, selectedDayIndex + delta));
    setSelectedDayIndex(newIndex);
  };
  
  const currentChartName = savedCharts.find(c => c.id === selectedChartId)?.name || 'You';
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Wave Chart */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h4 className="text-sm font-medium">30-Day Biorhythm Forecast</h4>
              
              {/* Person Selector Dropdown */}
              {savedCharts.length > 0 && onChartChange && (
                <ChartSelector
                  userNatalChart={savedCharts[0] ? { ...savedCharts[0], planets: {}, birthTime: '', birthLocation: '' } as any : null}
                  savedCharts={savedCharts.slice(1).map(c => ({ ...c, planets: {}, birthTime: '', birthLocation: '' })) as any}
                  selectedChartId={selectedChartId === savedCharts[0]?.id ? 'user' : (selectedChartId || '')}
                  onSelect={(id) => onChartChange!(id === 'user' ? (savedCharts[0]?.id || '') : id)}
                  className="w-[140px]"
                />
              )}
              
              {/* Romance Mode Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setMode(mode === 'personal' ? 'romance' : 'personal')}
                    className={`p-1.5 rounded-full transition-colors ${
                      mode === 'romance' 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    <Heart size={14} fill={mode === 'romance' ? 'currentColor' : 'none'} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{mode === 'romance' ? 'Exit Romance Mode' : 'Romance Compatibility'}</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Partner Selector (when in romance mode) */}
              {mode === 'romance' && savedCharts.length > 1 && (
                <ChartSelector
                  userNatalChart={null}
                  savedCharts={savedCharts.filter(c => c.id !== selectedChartId).map(c => ({ ...c, planets: {}, birthTime: '', birthLocation: '' })) as any}
                  selectedChartId={partnerChartId}
                  onSelect={setPartnerChartId}
                  className="w-[140px]"
                />
              )}
              
              {/* Message when only 1 chart exists */}
              {mode === 'romance' && savedCharts.length <= 1 && (
                <span className="text-xs text-pink-500 bg-pink-50 dark:bg-pink-900/20 px-2 py-1 rounded">
                  Add another chart for compatibility
                </span>
              )}
            </div>
            
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: 'hsl(210 90% 50%)' }} /> Physical
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: 'hsl(0 84% 60%)' }} /> Emotional
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: 'hsl(142 76% 36%)' }} /> Intellectual
              </span>
            </div>
          </div>
          
          {/* Romance Compatibility Summary */}
          {mode === 'romance' && partnerBirthDate && selectedCompatibility && (
            <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-pink-500" fill="currentColor" />
                  <span className="text-sm font-medium">{currentChartName} + {partnerChart?.name}</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <div className="text-center">
                    <div className="text-muted-foreground">Passion</div>
                    <div className={`font-bold ${selectedCompatibility.passion >= 70 ? 'text-pink-500' : selectedCompatibility.passion >= 40 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      {selectedCompatibility.passion}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Communication</div>
                    <div className={`font-bold ${selectedCompatibility.communication >= 70 ? 'text-pink-500' : selectedCompatibility.communication >= 40 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      {selectedCompatibility.communication}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-muted-foreground">Overall</div>
                    <div className={`font-bold ${selectedCompatibility.overall >= 70 ? 'text-pink-500' : selectedCompatibility.overall >= 40 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                      {selectedCompatibility.overall}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {mode === 'romance' && !partnerChartId && savedCharts.length > 1 && (
            <div className="mb-4 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 text-center text-sm text-muted-foreground">
              <Heart size={16} className="inline mr-2 text-pink-400" />
              Select a partner above to see romance compatibility
            </div>
          )}
          
          {/* Personal Wave Chart */}
          <WaveChart 
            forecast={forecast} 
            selectedDay={selectedDayIndex}
            onDaySelect={setSelectedDayIndex}
          />
          
          {/* Compatibility Wave Chart - shown when in romance mode with partner selected */}
          {mode === 'romance' && partnerBirthDate && compatibilityForecast && (
            <div className="mt-4 pt-4 border-t border-pink-200 dark:border-pink-800">
              <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Heart size={14} className="text-pink-500" fill="currentColor" />
                30-Day Compatibility Forecast
              </h5>
              <CompatibilityWaveChart 
                forecast={compatibilityForecast}
                selectedDay={selectedDayIndex}
                onDaySelect={setSelectedDayIndex}
              />
            </div>
          )}
          
          {/* Selected Day Details */}
          {selectedDay && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <button 
                  onClick={() => navigateDay(-1)}
                  disabled={selectedDayIndex === 0}
                  className="p-1 rounded hover:bg-secondary disabled:opacity-30"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                  <div className="font-medium">{format(selectedDay.date, 'EEEE, MMMM d')}</div>
                  {isSameDay(selectedDay.date, new Date()) && (
                    <span className="text-xs text-primary">Today</span>
                  )}
                </div>
                <button 
                  onClick={() => navigateDay(1)}
                  disabled={selectedDayIndex === forecast.length - 1}
                  className="p-1 rounded hover:bg-secondary disabled:opacity-30"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Physical</div>
                  <div className={`text-lg font-bold ${selectedDay.physical >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedDay.physical > 0 ? '+' : ''}{selectedDay.physical}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Emotional</div>
                  <div className={`text-lg font-bold ${selectedDay.emotional >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedDay.emotional > 0 ? '+' : ''}{selectedDay.emotional}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Intellectual</div>
                  <div className={`text-lg font-bold ${selectedDay.intellectual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedDay.intellectual > 0 ? '+' : ''}{selectedDay.intellectual}%
                  </div>
                </div>
              </div>
              
              {/* Badges for special days */}
              <div className="flex justify-center gap-2 mt-3">
                {selectedDay.criticalCycles.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs rounded">
                    <AlertTriangle size={12} />
                    {selectedDay.criticalCycles.join(', ')} Critical
                  </span>
                )}
                {selectedDay.peakCycles.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs rounded">
                    <TrendingUp size={12} />
                    {selectedDay.peakCycles.join(', ')} Peak
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Upcoming Notable Days */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Critical Days */}
          <div className="p-4 rounded-lg border border-yellow-200 dark:border-yellow-800 bg-yellow-50/50 dark:bg-yellow-900/10">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-yellow-600" />
              <h4 className="text-sm font-medium">Upcoming Critical Days</h4>
            </div>
            {criticalDays.length > 0 ? (
              <ul className="space-y-2">
                {criticalDays.slice(0, 5).map((day, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{format(day.date, 'EEE, MMM d')}</span>
                    <span className="text-muted-foreground">{day.cycles.join(', ')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No critical days in the next {days} days</p>
            )}
          </div>
          
          {/* Peak Days */}
          <div className="p-4 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-green-600" />
              <h4 className="text-sm font-medium">Upcoming Peak Days</h4>
            </div>
            {peakDays.length > 0 ? (
              <ul className="space-y-2">
                {peakDays.slice(0, 5).map((day, i) => (
                  <li key={i} className="flex justify-between text-sm">
                    <span>{format(day.date, 'EEE, MMM d')}</span>
                    <span className="text-green-600 dark:text-green-400">{day.cycles.join(', ')}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No peak days in the next {days} days</p>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
