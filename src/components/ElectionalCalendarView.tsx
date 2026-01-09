import { useState, useMemo } from 'react';
import { Calendar, Users, User, ChevronLeft, ChevronRight, Info, AlertTriangle, CheckCircle, Zap, Star } from 'lucide-react';
import { 
  calculateElectionalDays, 
  calculatePersonalActivations,
  getMonthElectionalDays,
  ElectionalDay,
  ElectionalRating,
  PersonalActivation
} from '@/lib/electionalCalendar';
import { NatalChart } from '@/hooks/useNatalChart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ElectionalCalendarViewProps {
  year: number;
  userNatalChart: NatalChart | null;
  savedCharts: NatalChart[];
}

const RATING_CONFIG: Record<ElectionalRating, { 
  bg: string; 
  border: string; 
  icon: string; 
  label: string;
  description: string;
}> = {
  RED: { 
    bg: 'bg-red-50', 
    border: 'border-red-400', 
    icon: '🔴', 
    label: 'Avoid',
    description: "Don't start anything important"
  },
  YELLOW: { 
    bg: 'bg-yellow-50', 
    border: 'border-yellow-400', 
    icon: '🟡', 
    label: 'Caution',
    description: 'Proceed carefully, expect challenges'
  },
  GREEN: { 
    bg: 'bg-green-50', 
    border: 'border-green-400', 
    icon: '🟢', 
    label: 'Best Days',
    description: 'Highly supportive for launches'
  },
  BLUE: { 
    bg: 'bg-blue-50', 
    border: 'border-blue-400', 
    icon: '🔵', 
    label: 'Power Days',
    description: 'Good for specific activities'
  },
  PURPLE: { 
    bg: 'bg-purple-50', 
    border: 'border-purple-400', 
    icon: '🟣', 
    label: 'Rare Events',
    description: 'Once-in-decades astrology'
  }
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const ElectionalCalendarView = ({ 
  year, 
  userNatalChart, 
  savedCharts 
}: ElectionalCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [viewMode, setViewMode] = useState<'collective' | 'personal'>('collective');
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedChart, setSelectedChart] = useState<string>('user');
  
  // Calculate all electional days for the year
  const electionalDays = useMemo(() => {
    return calculateElectionalDays(selectedYear);
  }, [selectedYear]);
  
  // Get days for current month
  const monthDays = useMemo(() => {
    return getMonthElectionalDays(selectedYear, currentMonth, electionalDays);
  }, [electionalDays, selectedYear, currentMonth]);
  
  // Personal activations
  const activeChart = useMemo(() => {
    if (selectedChart === 'user') return userNatalChart;
    return savedCharts.find(c => c.id === selectedChart) || null;
  }, [selectedChart, userNatalChart, savedCharts]);
  
  const personalActivations = useMemo(() => {
    if (!activeChart) return [];
    return calculatePersonalActivations(selectedYear, currentMonth, activeChart);
  }, [selectedYear, currentMonth, activeChart]);
  
  // Build calendar grid
  const calendarGrid = useMemo(() => {
    const daysInMonth = new Date(selectedYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, currentMonth, 1).getDay();
    
    const grid: (number | null)[] = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      grid.push(null);
    }
    
    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      grid.push(day);
    }
    
    return grid;
  }, [selectedYear, currentMonth]);
  
  // Get day data for collective view
  const getDayData = (day: number): ElectionalDay | null => {
    const date = new Date(selectedYear, currentMonth, day);
    return monthDays.find(d => 
      d.date.getDate() === day
    ) || null;
  };
  
  // Get personal activations for a day
  const getDayActivations = (day: number): PersonalActivation[] => {
    return personalActivations.filter(a => a.date.getDate() === day);
  };
  
  // Today check
  const isToday = (day: number): boolean => {
    const today = new Date();
    return today.getFullYear() === selectedYear && 
           today.getMonth() === currentMonth && 
           today.getDate() === day;
  };
  
  const allCharts = [
    ...(userNatalChart ? [{ id: 'user', name: userNatalChart.name }] : []),
    ...savedCharts.map(c => ({ id: c.id, name: c.name }))
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Year Selector */}
        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Year:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        
        {/* View Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('collective')}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
              viewMode === 'collective'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users size={16} />
            For Everyone
          </button>
          
          <button
            onClick={() => setViewMode('personal')}
            disabled={allCharts.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm text-sm font-medium transition-all ${
              viewMode === 'personal'
                ? 'bg-primary text-primary-foreground'
                : allCharts.length > 0
                  ? 'bg-secondary text-muted-foreground hover:text-foreground'
                  : 'bg-secondary/50 text-muted-foreground/50 cursor-not-allowed'
            }`}
          >
            <User size={16} />
            My Chart {allCharts.length === 0 && '(Upload Chart)'}
          </button>
          
          {viewMode === 'personal' && allCharts.length > 0 && (
            <select
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="border border-border bg-background px-3 py-2 text-sm rounded-sm focus:border-primary focus:outline-none"
            >
              {allCharts.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-4 bg-secondary/30 rounded-lg">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Calendar Key:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.entries(RATING_CONFIG).map(([rating, config]) => (
            <div
              key={rating}
              className={`flex items-center gap-2 p-3 ${config.bg} border-2 ${config.border} rounded-lg`}
            >
              <span className="text-lg">{config.icon}</span>
              <div>
                <div className="text-sm font-semibold text-foreground">{config.label}</div>
                <div className="text-[10px] text-muted-foreground leading-tight">{config.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Month Selector */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => setCurrentMonth(m => m > 0 ? m - 1 : 11)}
          className="p-2 border border-border rounded-sm hover:bg-secondary transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex flex-wrap justify-center gap-2">
          {MONTHS.map((month, index) => (
            <button
              key={month}
              onClick={() => setCurrentMonth(index)}
              className={`px-3 py-2 text-xs font-semibold rounded-sm transition-all ${
                currentMonth === index
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background border border-border hover:border-primary'
              }`}
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setCurrentMonth(m => m < 11 ? m + 1 : 0)}
          className="p-2 border border-border rounded-sm hover:bg-secondary transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Calendar Grid */}
      <TooltipProvider>
        <div className="bg-background border border-border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-serif mb-4 text-center">
            {MONTHS[currentMonth]} {selectedYear}
          </h2>
          
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-bold text-muted-foreground py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {calendarGrid.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="p-2" />;
              }
              
              const dayData = viewMode === 'collective' ? getDayData(day) : null;
              const activations = viewMode === 'personal' ? getDayActivations(day) : [];
              const topActivation = activations.length > 0 
                ? activations.reduce((best, curr) => 
                    curr.intensity === 'HIGH' ? curr : best, activations[0])
                : null;
              
              const rating = dayData?.rating || topActivation?.rating;
              const config = rating ? RATING_CONFIG[rating] : null;
              const today = isToday(day);
              
              return (
                <Tooltip key={day}>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        relative p-2 min-h-[70px] rounded-lg cursor-pointer transition-all
                        ${config ? `${config.bg} border-2 ${config.border}` : 'bg-card border border-border'}
                        ${today ? 'ring-2 ring-primary ring-offset-2' : ''}
                        hover:shadow-md
                      `}
                    >
                      <div className={`text-sm font-semibold ${today ? 'text-primary' : 'text-foreground'}`}>
                        {day}
                      </div>
                      
                      {config && (
                        <div className="absolute bottom-2 right-2 text-lg">
                          {config.icon}
                        </div>
                      )}
                      
                      {viewMode === 'personal' && activations.length > 0 && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[10px] px-1.5 rounded-full">
                          {activations.length}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  
                  {(dayData || activations.length > 0) && (
                    <TooltipContent side="bottom" className="max-w-xs p-3">
                      {viewMode === 'collective' && dayData && (
                        <div>
                          <div className="font-bold mb-1">{dayData.reason}</div>
                          <div className="text-sm text-muted-foreground">
                            {dayData.why}
                          </div>
                          {dayData.power && (
                            <div className="text-sm text-green-600 mt-1 font-medium">
                              ✨ {dayData.power}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {viewMode === 'personal' && activations.length > 0 && (
                        <div className="space-y-2">
                          {activations.slice(0, 3).map((a, i) => (
                            <div key={i} className="text-sm">
                              <span className={`font-medium ${
                                a.intensity === 'HIGH' ? 'text-red-600' :
                                a.intensity === 'MEDIUM' ? 'text-yellow-600' : 'text-blue-600'
                              }`}>
                                {a.intensity}
                              </span>
                              : {a.description}
                            </div>
                          ))}
                          {activations.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{activations.length - 3} more...
                            </div>
                          )}
                        </div>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </div>
      </TooltipProvider>
      
      {/* Detailed List */}
      <div className="space-y-4">
        <h3 className="text-lg font-serif border-b border-border pb-2">
          {viewMode === 'collective' 
            ? `Special Days in ${MONTHS[currentMonth]}` 
            : `Personal Activations in ${MONTHS[currentMonth]}`}
        </h3>
        
        {viewMode === 'collective' ? (
          monthDays.length > 0 ? (
            <div className="grid gap-4">
              {monthDays.map((day, index) => {
                const config = RATING_CONFIG[day.rating];
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-2 ${config.bg} ${config.border}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-foreground">
                            {day.date.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            day.rating === 'RED' ? 'bg-red-200 text-red-800' :
                            day.rating === 'YELLOW' ? 'bg-yellow-200 text-yellow-800' :
                            day.rating === 'GREEN' ? 'bg-green-200 text-green-800' :
                            day.rating === 'BLUE' ? 'bg-blue-200 text-blue-800' :
                            'bg-purple-200 text-purple-800'
                          }`}>
                            {config.label}
                          </span>
                        </div>
                        
                        <div className="text-base font-medium text-foreground mb-2">
                          {day.reason}
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {day.why}
                        </p>
                        
                        {day.avoid && day.avoid.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-bold uppercase text-red-600">❌ Avoid:</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {day.avoid.join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {day.bestFor && day.bestFor.length > 0 && (
                          <div className="mb-2">
                            <span className="text-xs font-bold uppercase text-green-600">✓ Best For:</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {day.bestFor.join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {day.workaround && (
                          <div className="mt-2 p-2 bg-background/50 rounded text-sm">
                            <span className="font-medium">💡 Workaround:</span> {day.workaround}
                          </div>
                        )}
                        
                        {day.power && (
                          <div className="mt-2 p-2 bg-green-100 rounded text-sm text-green-800 font-medium">
                            ✨ {day.power}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar size={48} className="mx-auto mb-3 opacity-50" />
              <p>No special electional days this month.</p>
              <p className="text-sm">Regular days are neutral for most activities.</p>
            </div>
          )
        ) : (
          personalActivations.length > 0 ? (
            <div className="grid gap-3">
              {personalActivations.slice(0, 20).map((activation, index) => {
                const config = RATING_CONFIG[activation.rating];
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${config.bg} ${config.border}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{config.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {activation.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            activation.intensity === 'HIGH' ? 'bg-red-200 text-red-800' :
                            activation.intensity === 'MEDIUM' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-blue-200 text-blue-800'
                          }`}>
                            {activation.intensity}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {activation.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {personalActivations.length > 20 && (
                <p className="text-sm text-muted-foreground text-center">
                  And {personalActivations.length - 20} more activations this month...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {activeChart ? (
                <>
                  <User size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No major personal activations this month.</p>
                  <p className="text-sm">Transiting planets aren't making tight aspects to your natal chart.</p>
                </>
              ) : (
                <>
                  <User size={48} className="mx-auto mb-3 opacity-50" />
                  <p>No natal chart loaded.</p>
                  <p className="text-sm">Upload a chart in the Charts section to see personal activations.</p>
                </>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};
