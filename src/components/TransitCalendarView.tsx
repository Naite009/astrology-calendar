import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronLeft, ChevronRight, Star, Calendar, TrendingUp, Zap, Globe, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NatalChart } from '@/hooks/useNatalChart';
import { ChartSelector } from './ChartSelector';
import {
  calculateYearTransits,
  getTransitsForMonth,
  generateMonthThemes,
  getTransitPlanetSymbol,
  getYearMilestones,
  YearlyTransitEvent
} from '@/lib/yearlyTransitCalculator';

// Planet symbols
const planetSymbols: Record<string, string> = {
  'Sun': '☉', 'Moon': '☽', 'Mercury': '☿', 'Venus': '♀', 'Mars': '♂',
  'Jupiter': '♃', 'Saturn': '♄', 'Uranus': '♅', 'Neptune': '♆', 'Pluto': '♇',
  'Chiron': '⚷', 'Ascendant': 'AC', 'Midheaven': 'MC', 'NorthNode': '☊'
};

// Category colors
const categoryColors = {
  outer: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  social: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  personal: 'bg-green-500/20 text-green-300 border-green-500/30'
};

interface TransitCalendarViewProps {
  natalChart?: NatalChart | null;
  savedCharts?: NatalChart[];
  onSelectChart?: (chartId: string) => void;
}

export const TransitCalendarView = ({ 
  natalChart, 
  savedCharts = [],
  onSelectChart 
}: TransitCalendarViewProps) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedYear, new Date().getMonth(), 1));
  const [selectedTransit, setSelectedTransit] = useState<YearlyTransitEvent | null>(null);
  const [viewTab, setViewTab] = useState<'calendar' | 'timeline' | 'list'>('calendar');
  const [includePersonal, setIncludePersonal] = useState(false);
  // Default to 'user' if userNatalChart exists, otherwise first saved chart
  // 'user' represents the primary user chart (Lauren Newman)
  const defaultChartId = natalChart ? 'user' : savedCharts[0]?.id || 'general';
  const [selectedChartId, setSelectedChartId] = useState<string>(defaultChartId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Determine which chart to use for calculations
  const activeChart = useMemo(() => {
    if (selectedChartId === 'general') {
      // "General" should never silently fall back to someone else's saved chart
      return natalChart || null;
    }
    if (selectedChartId === 'user') {
      return natalChart || null;
    }
    // Find the selected chart from savedCharts
    return savedCharts.find(c => c.id === selectedChartId) || natalChart || null;
  }, [selectedChartId, natalChart, savedCharts]);
  
  const yearTransits = useMemo(() => {
    if (!activeChart?.planets) return [];
    return calculateYearTransits(activeChart, selectedYear, { includePersonal });
  }, [activeChart, selectedYear, includePersonal]);
  
  const monthTransits = useMemo(() => 
    getTransitsForMonth(yearTransits, currentMonth.getMonth(), selectedYear),
    [yearTransits, currentMonth, selectedYear]
  );
  
  const monthThemes = useMemo(() => generateMonthThemes(monthTransits), [monthTransits]);
  
  const yearMilestones = useMemo(() => getYearMilestones(yearTransits), [yearTransits]);
  
  // Group transits by date for calendar view
  const transitsByDate = useMemo(() => {
    const grouped: Record<string, YearlyTransitEvent[]> = {};
    yearTransits.forEach(t => {
      const key = format(t.date, 'yyyy-MM-dd');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });
    return grouped;
  }, [yearTransits]);
  
  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      // Update year if crossing year boundary
      if (newDate.getFullYear() !== selectedYear) {
        setSelectedYear(newDate.getFullYear());
      }
      return newDate;
    });
  };
  
  // Get natal positions from the user's chart
  const natalPositionsDisplay = useMemo(() => {
    if (!activeChart?.planets) return [];
    
    const planets = ['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars'] as const;
    return planets
      .filter(p => activeChart.planets[p])
      .map(p => {
        const pos = activeChart.planets[p]!;
        return {
          planet: p,
          display: `${pos.degree}° ${pos.sign}`
        };
      });
  }, [activeChart]);

  // Get major transits for the list view
  const majorTransits = useMemo(() => 
    yearTransits.filter(t => t.significance === 'major' || t.significance === 'moderate'),
    [yearTransits]
  );
  
  // Available years for selection
  const yearOptions = [currentYear - 1, currentYear, currentYear + 1, currentYear + 2];
  
  return (
    <div className="space-y-6">
      {/* Header with chart selector and options */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {activeChart?.name ? `${activeChart.name}'s Transit Calendar` : 'Transit Calendar'}
              </CardTitle>
              {activeChart && (
                <p className="text-sm text-muted-foreground mt-1">
                  Born {activeChart.birthDate} · {activeChart.birthLocation}
                </p>
              )}
              {!activeChart && (
                <p className="text-sm text-muted-foreground mt-1">
                  Add a chart in the Charts tab to view transits
                </p>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Chart Selector */}
              <ChartSelector
                userNatalChart={natalChart || null}
                savedCharts={savedCharts}
                selectedChartId={selectedChartId}
                onSelect={(id) => {
                  setSelectedChartId(id);
                  onSelectChart?.(id);
                }}
                includeGeneral={false}
                label="View for"
              />
              
              {/* Date Picker - Jump to any date */}
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[160px] justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "MMM d, yyyy") : "Jump to date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setSelectedYear(date.getFullYear());
                        setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                        setDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                    defaultMonth={selectedDate || currentMonth}
                  />
                </PopoverContent>
              </Popover>
              
              {selectedDate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedDate(undefined);
                    setSelectedYear(new Date().getFullYear());
                    setCurrentMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
                  }}
                  className="text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeChart && natalPositionsDisplay.length > 0 ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs">
                {natalPositionsDisplay.map(({ planet, display }) => (
                  <Badge key={planet} variant="outline" className="font-mono">
                    {planetSymbols[planet] || planet} {planet}: {display}
                  </Badge>
                ))}
              </div>
              
              {/* Options */}
              <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                <Switch
                  id="include-personal"
                  checked={includePersonal}
                  onCheckedChange={setIncludePersonal}
                />
                <Label htmlFor="include-personal" className="text-xs text-muted-foreground">
                  Include personal planet transits (Sun, Moon, Mercury, Venus, Mars)
                </Label>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No natal chart loaded. Add a chart in the Charts tab to see personalized transits.
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Stats summary */}
      {yearTransits.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="text-2xl font-bold text-primary">{yearTransits.length}</div>
            <div className="text-xs text-muted-foreground">Total Transits</div>
          </Card>
          <Card className="p-3">
            <div className="text-2xl font-bold text-purple-400">
              {yearTransits.filter(t => t.category === 'outer').length}
            </div>
            <div className="text-xs text-muted-foreground">Outer Planet</div>
          </Card>
          <Card className="p-3">
            <div className="text-2xl font-bold text-blue-400">
              {yearTransits.filter(t => t.category === 'social').length}
            </div>
            <div className="text-xs text-muted-foreground">Social Planet</div>
          </Card>
          <Card className="p-3">
            <div className="text-2xl font-bold text-amber-400">
              {yearTransits.filter(t => t.significance === 'major').length}
            </div>
            <div className="text-xs text-muted-foreground">Major Transits</div>
          </Card>
        </div>
      )}
      
      {/* View Tabs */}
      <Tabs value={viewTab} onValueChange={(v) => setViewTab(v as typeof viewTab)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            All Transits
          </TabsTrigger>
        </TabsList>
        
        {/* Calendar View */}
        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <button 
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <CardTitle className="font-serif text-lg">
                  {format(currentMonth, 'MMMM yyyy')}
                </CardTitle>
                <button 
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-muted rounded-md transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
              {/* Theme badges removed - they were confusing without context */}
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-xs text-muted-foreground font-medium py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before month start */}
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {/* Days */}
                <TooltipProvider>
                  {days.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayTransits = transitsByDate[dateKey] || [];
                    const hasMajor = dayTransits.some(t => t.significance === 'major');
                    const hasModerate = dayTransits.some(t => t.significance === 'moderate');
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <Tooltip key={dateKey}>
                        <TooltipTrigger asChild>
                          <button
                            className={`
                              aspect-square p-1 rounded-md text-sm relative
                              hover:bg-muted transition-colors
                              ${isToday(day) ? 'bg-primary/20 font-bold' : ''}
                              ${isSelected ? 'ring-2 ring-primary bg-primary/40' : ''}
                              ${!isSelected && hasMajor ? 'bg-primary/30 ring-2 ring-primary/50' : !isSelected && hasModerate ? 'bg-primary/10' : ''}
                            `}
                            onClick={() => {
                              setSelectedDate(day);
                              if (dayTransits.length > 0) {
                                setSelectedTransit(dayTransits[0]);
                              }
                            }}
                          >
                            <span className="text-xs">{format(day, 'd')}</span>
                            {dayTransits.length > 0 && (
                              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                                {dayTransits.slice(0, 3).map((t, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      t.category === 'outer' ? 'bg-purple-500' :
                                      t.category === 'social' ? 'bg-blue-500' : 'bg-green-500'
                                    }`}
                                  />
                                ))}
                              </div>
                            )}
                          </button>
                        </TooltipTrigger>
                        {dayTransits.length > 0 && (
                          <TooltipContent side="top" className="max-w-[300px]">
                            <div className="space-y-1">
                              {dayTransits.map(t => (
                                <div key={t.id} className="text-xs">
                                  <span className="font-medium">
                                    {planetSymbols[t.transitPlanet]} {t.aspectSymbol} {planetSymbols[t.natalPlanet]}
                                  </span>
                                  {' '}
                                  <span className="text-muted-foreground">
                                    {t.transitPlanet} {t.aspect} {t.natalPlanet}
                                  </span>
                                  <span className="text-muted-foreground/70">
                                    {' '}({t.orb.toFixed(1)}°)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}
                </TooltipProvider>
              </div>
              
              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  Outer (Pluto/Neptune/Uranus)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Social (Saturn/Jupiter)
                </div>
                {includePersonal && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Personal
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Selected day or Month's transits list */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                {selectedDate 
                  ? `${format(selectedDate, 'EEEE, MMMM d, yyyy')} Transits`
                  : `${format(currentMonth, 'MMMM')} Transits (${monthTransits.length})`
                }
              </CardTitle>
              {selectedDate && (
                <p className="text-xs text-muted-foreground">
                  Showing transits for selected date
                </p>
              )}
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {(() => {
                    const transitsToShow = selectedDate 
                      ? transitsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
                      : monthTransits;
                    
                    if (transitsToShow.length === 0) {
                      return (
                        <p className="text-sm text-muted-foreground">
                          {selectedChartId === 'general' 
                            ? 'Select a chart to view personalized transits'
                            : selectedDate 
                              ? 'No transits on this date'
                              : 'No major transits this month'
                          }
                        </p>
                      );
                    }
                    
                    return transitsToShow.map(t => (
                      <TransitCard key={t.id} transit={t} compact />
                    ));
                  })()}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">{selectedYear} Key Milestones</CardTitle>
              <p className="text-sm text-muted-foreground">
                Major transits and turning points throughout the year
              </p>
            </CardHeader>
            <CardContent>
              {yearMilestones.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {natalChart ? 'No major milestones detected' : 'Select a chart to view milestones'}
                </p>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                  
                  <div className="space-y-6 pl-10">
                    {yearMilestones.map((item, i) => (
                      <div key={i} className="relative">
                        {/* Dot */}
                        <div className="absolute -left-10 top-1 w-3 h-3 rounded-full bg-primary ring-2 ring-primary/30" />
                        
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {format(item.date, 'MMMM d, yyyy')}
                            </span>
                            <Badge className="bg-primary/20 text-primary text-xs">Major</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* All Transits List */}
        <TabsContent value="list" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Major Transits */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  Major Transits ({majorTransits.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {majorTransits.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {natalChart ? 'No major transits found' : 'Select a chart to view transits'}
                      </p>
                    ) : (
                      majorTransits.map(t => (
                        <TransitCard key={t.id} transit={t} />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
            
            {/* By Planet */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">By Transit Planet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter'].map(planet => {
                    const planetTransits = yearTransits.filter(t => t.transitPlanet === planet);
                    return (
                      <div key={planet} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{planetSymbols[planet]}</span>
                          <span className="font-medium">{planet}</span>
                          <Badge variant="outline" className="text-xs">
                            {planetTransits.length} transits
                          </Badge>
                        </div>
                        <div className="pl-7 space-y-1">
                          {planetTransits.slice(0, 3).map(t => (
                            <div key={t.id} className="text-xs text-muted-foreground">
                              {format(t.date, 'MMM d')}: {t.aspect} {t.natalPlanet}
                            </div>
                          ))}
                          {planetTransits.length > 3 && (
                            <div className="text-xs text-primary">
                              +{planetTransits.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Transit Detail Modal/Panel */}
      {selectedTransit && (
        <Card className="fixed bottom-4 right-4 w-80 z-50 shadow-xl border-primary/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Transit Details</CardTitle>
              <button 
                onClick={() => setSelectedTransit(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <TransitCard transit={selectedTransit} expanded />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Transit Card Component
interface TransitCardProps {
  transit: YearlyTransitEvent;
  compact?: boolean;
  expanded?: boolean;
}

const TransitCard = ({ transit, compact, expanded }: TransitCardProps) => {
  const categoryColor = categoryColors[transit.category];
  
  if (compact) {
    return (
      <div className={`p-2 rounded-md border ${categoryColor} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">
            {planetSymbols[transit.transitPlanet]} {transit.aspectSymbol} {planetSymbols[transit.natalPlanet]}
          </span>
          <div className="text-xs">
            <span className="font-medium">{transit.transitPlanet} {transit.aspect} {transit.natalPlanet}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          {format(transit.date, 'MMM d')}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-3 rounded-md border ${categoryColor} ${transit.significance === 'major' ? 'ring-2 ring-primary shadow-lg' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">
          {planetSymbols[transit.transitPlanet]} {transit.aspectSymbol} {planetSymbols[transit.natalPlanet]}
        </span>
        <Badge variant="outline" className="text-xs">
          {transit.orb.toFixed(2)}° orb
        </Badge>
      </div>
      
      <div className="space-y-1">
        <div className="font-medium">
          {transit.transitPlanet} {transit.aspect} {transit.natalPlanet}
        </div>
        <div className="text-xs text-muted-foreground">
          {format(transit.date, 'EEEE, MMMM d, yyyy • HH:mm')}
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">Aspect audit: </span>
          {planetSymbols[transit.transitPlanet]} {transit.aspectSymbol} {planetSymbols[transit.natalPlanet]}
          <span className="text-muted-foreground/70"> ({transit.orb.toFixed(2)}°)</span>
        </div>
        <div className="text-xs">
          <span className="text-muted-foreground">Transit: </span>
          {transit.transitDegree}° {transit.transitSign}
          <span className="mx-2">→</span>
          <span className="text-muted-foreground">Natal: </span>
          {transit.natalDegree}° {transit.natalSign}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
          <p>
            This {transit.category} planet transit {transit.significance === 'major' ? 'is a major life event' : 'influences your experience'} as {transit.transitPlanet} forms a {transit.aspect} to your natal {transit.natalPlanet}.
          </p>
        </div>
      )}
    </div>
  );
};

export default TransitCalendarView;
