import { useMemo, useState } from 'react';
import { TrendingUp, AlertTriangle, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  getBiorhythmForecast, 
  getCriticalDays, 
  getPeakDays,
  BiorhythmDay,
  BIORHYTHM_CYCLES
} from '@/lib/biorhythms';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, isSameDay } from 'date-fns';

interface BiorhythmForecastProps {
  birthDate: Date;
  startDate?: Date;
  days?: number;
}

const WaveChart = ({ 
  forecast, 
  selectedDay,
  onDaySelect 
}: { 
  forecast: BiorhythmDay[];
  selectedDay: number;
  onDaySelect: (index: number) => void;
}) => {
  const width = 700;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
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
      
      {/* Cycle lines */}
      <path d={physicalPath} fill="none" stroke="hsl(var(--destructive))" strokeWidth={2} strokeOpacity={0.8} />
      <path d={emotionalPath} fill="none" stroke="hsl(var(--primary))" strokeWidth={2} strokeOpacity={0.8} />
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

export const BiorhythmForecast = ({ 
  birthDate, 
  startDate = new Date(), 
  days = 30 
}: BiorhythmForecastProps) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  
  const forecast = useMemo(() => {
    // Start 3 days before today for context
    const adjustedStart = new Date(startDate);
    adjustedStart.setDate(adjustedStart.getDate() - 3);
    return getBiorhythmForecast(birthDate, adjustedStart, days + 3);
  }, [birthDate, startDate, days]);
  
  const criticalDays = useMemo(() => 
    getCriticalDays(birthDate, startDate, days), 
    [birthDate, startDate, days]
  );
  
  const peakDays = useMemo(() => 
    getPeakDays(birthDate, startDate, days), 
    [birthDate, startDate, days]
  );
  
  const selectedDay = forecast[selectedDayIndex];
  
  // Navigate selected day
  const navigateDay = (delta: number) => {
    const newIndex = Math.max(0, Math.min(forecast.length - 1, selectedDayIndex + delta));
    setSelectedDayIndex(newIndex);
  };
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Wave Chart */}
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium">30-Day Biorhythm Forecast</h4>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-destructive rounded" /> Physical
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-primary rounded" /> Emotional
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 rounded" style={{ backgroundColor: 'hsl(142 76% 36%)' }} /> Intellectual
              </span>
            </div>
          </div>
          
          <WaveChart 
            forecast={forecast} 
            selectedDay={selectedDayIndex}
            onDaySelect={setSelectedDayIndex}
          />
          
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
