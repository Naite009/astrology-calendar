import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Star, Calendar, TrendingUp, Zap } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import {
  majorTransits2026,
  keyDates2026,
  monthlyTransitSummary,
  getTransitsForMonth,
  getMajorTransits,
  TransitEvent
} from '@/data/laurenTransits2026';

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

const significanceStyles = {
  major: 'ring-2 ring-primary shadow-lg',
  moderate: 'ring-1 ring-primary/50',
  minor: ''
};

interface TransitCalendarViewProps {
  natalChart?: NatalChart | null;
}

export const TransitCalendarView = ({ natalChart }: TransitCalendarViewProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1));
  const [selectedTransit, setSelectedTransit] = useState<TransitEvent | null>(null);
  const [viewTab, setViewTab] = useState<'calendar' | 'timeline' | 'list'>('calendar');
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const monthTransits = useMemo(() => getTransitsForMonth(currentMonth.getMonth(), 2026), [currentMonth]);
  
  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };
  
  // Group transits by date for calendar view
  const transitsByDate = useMemo(() => {
    const grouped: Record<string, TransitEvent[]> = {};
    majorTransits2026.forEach(t => {
      const key = format(t.date, 'yyyy-MM-dd');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });
    return grouped;
  }, []);
  
  const majorTransitsList = getMajorTransits();

  // Get natal positions from the user's chart
  const natalPositionsDisplay = useMemo(() => {
    if (!natalChart?.planets) return [];
    
    const planets = ['Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars'] as const;
    return planets
      .filter(p => natalChart.planets[p])
      .map(p => {
        const pos = natalChart.planets[p]!;
        return {
          planet: p,
          display: `${pos.degree}° ${pos.sign}`
        };
      });
  }, [natalChart]);
  
  return (
    <div className="space-y-6">
      {/* Header with natal positions summary */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-xl flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            {natalChart?.name ? `${natalChart.name}'s` : 'Your'} 2026 Transit Calendar
          </CardTitle>
          {natalChart && (
            <p className="text-sm text-muted-foreground">
              Born {natalChart.birthDate} · {natalChart.birthLocation} · {natalChart.birthTime}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {natalPositionsDisplay.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-xs">
              {natalPositionsDisplay.map(({ planet, display }) => (
                <Badge key={planet} variant="outline" className="font-mono">
                  {planetSymbols[planet] || planet} {planet}: {display}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              No natal chart loaded. Add a chart in the Charts tab to see personalized positions.
            </p>
          )}
        </CardContent>
      </Card>
      
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
              {monthlyTransitSummary[format(currentMonth, 'MMMM yyyy')] && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {monthlyTransitSummary[format(currentMonth, 'MMMM yyyy')].themes.map((theme, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {theme}
                    </Badge>
                  ))}
                </div>
              )}
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
                    
                    return (
                      <Tooltip key={dateKey}>
                        <TooltipTrigger asChild>
                          <button
                            className={`
                              aspect-square p-1 rounded-md text-sm relative
                              hover:bg-muted transition-colors
                              ${isToday(day) ? 'bg-primary/20 font-bold' : ''}
                              ${hasMajor ? 'bg-primary/30 ring-2 ring-primary' : hasModerate ? 'bg-primary/10' : ''}
                            `}
                            onClick={() => dayTransits.length > 0 && setSelectedTransit(dayTransits[0])}
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
                                  {t.time && t.time !== 'ongoing' && (
                                    <span className="text-muted-foreground"> @ {t.time}</span>
                                  )}
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
                  Social (Saturn/Jupiter/Chiron)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Personal
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Month's transits list */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                {format(currentMonth, 'MMMM')} Transits ({monthTransits.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-2">
                  {monthTransits.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No major transits this month</p>
                  ) : (
                    monthTransits.map(t => (
                      <TransitCard key={t.id} transit={t} compact />
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-serif text-lg">2026 Key Dates Timeline</CardTitle>
              <p className="text-sm text-muted-foreground">
                Major transits and turning points throughout the year
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                
                <div className="space-y-6 pl-10">
                  {keyDates2026.map((item, i) => (
                    <div key={i} className="relative">
                      {/* Dot */}
                      <div className={`
                        absolute -left-10 top-1 w-3 h-3 rounded-full
                        ${item.significance === 'major' ? 'bg-primary ring-2 ring-primary/30' : 'bg-muted-foreground'}
                      `} />
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {format(item.date, 'MMMM d, yyyy')}
                          </span>
                          {item.significance === 'major' && (
                            <Badge className="bg-primary/20 text-primary text-xs">Major</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.event}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
                  Major Transits ({majorTransitsList.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {majorTransitsList.map(t => (
                      <TransitCard key={t.id} transit={t} />
                    ))}
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
                  {['Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter', 'Chiron'].map(planet => {
                    const planetTransits = majorTransits2026.filter(t => t.transitPlanet === planet);
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
  transit: TransitEvent;
  compact?: boolean;
  expanded?: boolean;
}

const TransitCard = ({ transit, compact = false, expanded = false }: TransitCardProps) => {
  const interpretations: Record<string, string> = {
    'Pluto-Moon': 'Deep emotional transformation. Old patterns surface for healing. Intense but ultimately empowering.',
    'Neptune-Chiron': 'Spiritual healing opportunity. Dreams may hold messages. Creative expression as therapy.',
    'Neptune-Ascendant': 'Identity boundaries soften. Increased sensitivity. Time for spiritual exploration.',
    'Uranus-Uranus': 'Uranus opposition marks midlife awakening. Time to honor your authentic self.',
    'Uranus-Venus': 'Relationship revolution. Unexpected romantic developments. Freedom vs. connection themes.',
    'Uranus-Jupiter': 'Sudden expansion opportunities. Lucky breaks. Be ready to leap when doors open.',
    'Saturn-Moon': 'Emotional maturity test. Setting boundaries. Responsibility around home/family.',
    'Saturn-Pluto': 'Power structures transform. Old controls release. Building lasting foundations.',
    'Jupiter-Midheaven': 'Career expansion peak. Recognition comes. Time to aim higher professionally.',
    'Jupiter-Sun': 'Confidence surge. Opportunities align with identity. Growth feels natural.',
    'Chiron-Chiron': 'Chiron return! Major healing cycle. Past wounds can finally resolve.',
    'default': 'This transit activates themes of change and growth in your life.'
  };
  
  const getInterpretation = () => {
    const key = `${transit.transitPlanet}-${transit.natalPlanet}`;
    return interpretations[key] || interpretations['default'];
  };
  
  if (compact) {
    return (
      <div className={`p-2 rounded-md border ${categoryColors[transit.category]} ${significanceStyles[transit.significance]}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">
              {planetSymbols[transit.transitPlanet]} {transit.aspectSymbol} {planetSymbols[transit.natalPlanet]}
            </span>
            <span className="text-xs text-muted-foreground">
              {transit.transitPlanet} {transit.aspect} {transit.natalPlanet}
            </span>
          </div>
          <span className="text-xs">
            {format(transit.date, 'MMM d')}
            {transit.time && transit.time !== 'ongoing' && ` @ ${transit.time}`}
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-3 rounded-md border ${categoryColors[transit.category]} ${significanceStyles[transit.significance]}`}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg">
              {planetSymbols[transit.transitPlanet]} {transit.aspectSymbol} {planetSymbols[transit.natalPlanet]}
            </span>
            {transit.significance === 'major' && (
              <Star className="h-3 w-3 text-primary fill-primary" />
            )}
          </div>
          <Badge variant="outline" className="text-xs">
            {transit.transitSign}
          </Badge>
        </div>
        
        <div className="text-sm">
          <span className="font-medium">{transit.transitPlanet}</span>
          {' '}{transit.aspect}{' '}
          <span className="font-medium">{transit.natalPlanet}</span>
        </div>
        
        <div className="text-xs text-muted-foreground">
          {format(transit.date, 'EEEE, MMMM d, yyyy')}
          {transit.time && transit.time !== 'ongoing' && ` at ${transit.time}`}
          {transit.isExact && ' (exact)'}
        </div>
        
        {expanded && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs leading-relaxed">{getInterpretation()}</p>
          </div>
        )}
      </div>
    </div>
  );
};
