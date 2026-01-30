import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RotateCcw, Calendar, ChevronLeft, ChevronRight, Sparkles, AlertTriangle, Info, Moon, Sun, Zap } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { getPlanetSymbol } from '@/components/PlanetSymbol';
import { getPlanetHouse } from '@/lib/sacredScriptHelpers';
import { getRetrogradeInterpretation, RETROGRADE_PLANET_MODIFIERS } from '@/lib/retrogradeSignCombinations';
import { getRetrogradePeriods, getRetrogradeStatus, RetrogradeInfo } from '@/lib/retrogradePatterns';
import * as Astronomy from 'astronomy-engine';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

const SIGN_SYMBOLS: Record<string, string> = {
  'Aries': '♈', 'Taurus': '♉', 'Gemini': '♊', 'Cancer': '♋',
  'Leo': '♌', 'Virgo': '♍', 'Libra': '♎', 'Scorpio': '♏',
  'Sagittarius': '♐', 'Capricorn': '♑', 'Aquarius': '♒', 'Pisces': '♓'
};

const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron'];

const PLANET_BODIES: Record<string, Astronomy.Body> = {
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

interface RetrogradeActivationsCalendarProps {
  userChart: NatalChart | null;
  savedCharts: NatalChart[];
}

interface NatalRetrogradeInfo {
  planet: string;
  sign: string;
  degree: number;
  house?: number;
  isRetrograde: boolean;
}

interface TransitActivation {
  date: Date;
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  aspectSymbol: string;
  orb: number;
  isExact: boolean;
  transitInRetrograde: boolean;
  natalIsRetrograde: boolean;
  description: string;
}

// Get ecliptic longitude for a planet at a given date
const getPlanetLongitude = (body: Astronomy.Body, date: Date): number => {
  try {
    const vector = Astronomy.GeoVector(body, date, false);
    const ecliptic = Astronomy.Ecliptic(vector);
    return ecliptic.elon;
  } catch {
    return 0;
  }
};

// Check if transit planet is retrograde
const isTransitRetrograde = (body: Astronomy.Body, date: Date): boolean => {
  try {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayLon = getPlanetLongitude(body, date);
    const yesterdayLon = getPlanetLongitude(body, yesterday);
    
    let diff = todayLon - yesterdayLon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    return diff < 0;
  } catch {
    return false;
  }
};

// Calculate aspect between two longitudes
const calculateAspect = (lon1: number, lon2: number): { aspect: string; symbol: string; orb: number } | null => {
  const aspects = [
    { name: 'Conjunction', symbol: '☌', angle: 0, orb: 8 },
    { name: 'Opposition', symbol: '☍', angle: 180, orb: 8 },
    { name: 'Trine', symbol: '△', angle: 120, orb: 8 },
    { name: 'Square', symbol: '□', angle: 90, orb: 7 },
    { name: 'Sextile', symbol: '⚹', angle: 60, orb: 6 },
  ];
  
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  
  for (const asp of aspects) {
    const orb = Math.abs(diff - asp.angle);
    if (orb <= asp.orb) {
      return { aspect: asp.name, symbol: asp.symbol, orb: Math.round(orb * 10) / 10 };
    }
  }
  
  return null;
};

// Convert natal position to longitude
const natalPositionToLongitude = (sign: string, degree: number): number => {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
};

export const RetrogradeActivationsCalendar = ({ userChart, savedCharts }: RetrogradeActivationsCalendarProps) => {
  const [selectedChartId, setSelectedChartId] = useState<string | null>(userChart?.id || null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'calendar' | 'natal' | 'upcoming'>('calendar');

  // Combine all available charts
  const allCharts = useMemo(() => {
    const charts: NatalChart[] = [];
    if (userChart) charts.push(userChart);
    charts.push(...savedCharts);
    return charts;
  }, [userChart, savedCharts]);

  // Get the selected chart
  const selectedChart = useMemo(() => {
    if (!selectedChartId) return null;
    return allCharts.find(c => c.id === selectedChartId) || null;
  }, [selectedChartId, allCharts]);

  // Extract natal retrograde planets
  const natalRetrogrades = useMemo((): NatalRetrogradeInfo[] => {
    if (!selectedChart?.planets) return [];
    
    const retros: NatalRetrogradeInfo[] = [];
    const planetNames = Object.keys(selectedChart.planets) as (keyof typeof selectedChart.planets)[];
    
    for (const planetName of planetNames) {
      const data = selectedChart.planets[planetName];
      if (!data?.sign || !data.isRetrograde) continue;
      
      const house = getPlanetHouse(selectedChart, planetName);
      retros.push({
        planet: planetName,
        sign: data.sign,
        degree: data.degree + (data.minutes || 0) / 60,
        house: house || undefined,
        isRetrograde: true,
      });
    }
    
    return retros;
  }, [selectedChart]);

  // Calculate transit activations to natal retrograde planets for the month
  const monthActivations = useMemo((): TransitActivation[] => {
    if (natalRetrogrades.length === 0) return [];
    
    const activations: TransitActivation[] = [];
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    for (const day of days) {
      for (const natalRetro of natalRetrogrades) {
        const natalLon = natalPositionToLongitude(natalRetro.sign, natalRetro.degree);
        
        // Check aspects from transit planets
        for (const transitPlanet of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) {
          const body = PLANET_BODIES[transitPlanet];
          if (!body && transitPlanet !== 'Sun' && transitPlanet !== 'Moon') continue;
          
          let transitLon = 0;
          if (transitPlanet === 'Sun') {
            transitLon = Astronomy.SunPosition(day).elon;
          } else if (transitPlanet === 'Moon') {
            const moonVector = Astronomy.GeoVector(Astronomy.Body.Moon, day, false);
            transitLon = Astronomy.Ecliptic(moonVector).elon;
          } else {
            transitLon = getPlanetLongitude(body, day);
          }
          
          const aspectResult = calculateAspect(transitLon, natalLon);
          
          if (aspectResult && aspectResult.orb <= 2) { // Tight orb for calendar display
            const isTransitRx = body ? isTransitRetrograde(body, day) : false;
            
            activations.push({
              date: day,
              transitPlanet,
              natalPlanet: natalRetro.planet,
              aspect: aspectResult.aspect,
              aspectSymbol: aspectResult.symbol,
              orb: aspectResult.orb,
              isExact: aspectResult.orb < 0.5,
              transitInRetrograde: isTransitRx,
              natalIsRetrograde: true,
              description: `Transit ${transitPlanet} ${aspectResult.symbol} natal ${natalRetro.planet} ℞`,
            });
          }
        }
      }
    }
    
    return activations;
  }, [natalRetrogrades, currentMonth]);

  // Group activations by date
  const activationsByDate = useMemo(() => {
    const grouped = new Map<string, TransitActivation[]>();
    for (const activation of monthActivations) {
      const dateKey = format(activation.date, 'yyyy-MM-dd');
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(activation);
    }
    return grouped;
  }, [monthActivations]);

  // Upcoming transit retrograde periods that will affect natal retrogrades
  const upcomingRetrogradePeriods = useMemo(() => {
    const periods: { planet: string; info: RetrogradeInfo; affectedNatal: NatalRetrogradeInfo[] }[] = [];
    
    for (const planet of ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']) {
      const body = PLANET_BODIES[planet];
      if (!body) continue;
      
      const retros = getRetrogradePeriods(body, new Date());
      const upcomingRetros = retros.filter(r => r.start >= new Date() || r.end >= new Date()).slice(0, 3);
      
      for (const retro of upcomingRetros) {
        // Check which natal retrogrades will be activated
        const affected = natalRetrogrades.filter(nr => {
          // Check if retrograde passes through the same sign or makes aspects
          return retro.sign.split('/').some(s => s === nr.sign) || 
                 (nr.sign && retro.sign.split('/').some(s => {
                   // Check for square, opposition, trine signs
                   const signIndex = (sign: string) => Object.keys(SIGN_SYMBOLS).indexOf(sign);
                   const natalIdx = signIndex(nr.sign);
                   const retroIdx = signIndex(s);
                   const diff = Math.abs(natalIdx - retroIdx);
                   return diff === 3 || diff === 4 || diff === 6 || diff === 9; // square, trine, opposition
                 }));
        });
        
        if (affected.length > 0 || planet === 'Mercury') { // Always show Mercury retrogrades
          periods.push({ planet, info: retro, affectedNatal: affected });
        }
      }
    }
    
    return periods.sort((a, b) => a.info.start.getTime() - b.info.start.getTime());
  }, [natalRetrogrades]);

  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const renderNatalRetrogrades = () => {
    if (natalRetrogrades.length === 0) {
      return (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <RotateCcw className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">No retrograde planets in natal chart</p>
            <p className="text-xs text-muted-foreground mt-1">
              Select a chart with natal retrograde planets to see activations
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {natalRetrogrades.map((retro, i) => {
          const interpretation = getRetrogradeInterpretation(retro.planet, retro.sign);
          
          return (
            <Card key={i} className="border-warning/30 bg-warning/5">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      {getPlanetSymbol(retro.planet)} {retro.planet} ℞
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {SIGN_SYMBOLS[retro.sign]} {retro.sign}
                    </Badge>
                    {retro.house && (
                      <Badge variant="outline" className="text-xs">
                        {retro.house}{retro.house === 1 ? 'st' : retro.house === 2 ? 'nd' : retro.house === 3 ? 'rd' : 'th'} House
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-sm font-medium mt-2">
                  {interpretation.signCombo?.title || `${retro.planet} Retrograde in ${retro.sign}`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {interpretation.signCombo?.internalExpression || interpretation.modifier?.internal || 
                   `${retro.planet} retrograde in ${retro.sign} expresses its energy more internally.`}
                </p>
                
                {interpretation.signCombo && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <h5 className="text-[10px] font-medium text-primary mb-1 uppercase tracking-wide">Gifts</h5>
                      <ul className="space-y-0.5">
                        {interpretation.signCombo.gifts.slice(0, 3).map((gift, j) => (
                          <li key={j} className="text-[10px] text-foreground/70 flex items-start gap-1">
                            <span className="text-primary">✦</span> {gift}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-medium text-destructive mb-1 uppercase tracking-wide">Challenges</h5>
                      <ul className="space-y-0.5">
                        {interpretation.signCombo.challenges.slice(0, 3).map((challenge, j) => (
                          <li key={j} className="text-[10px] text-foreground/70 flex items-start gap-1">
                            <span className="text-destructive">•</span> {challenge}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Pad beginning of month
    const startDay = monthStart.getDay();
    const paddedDays = [...Array(startDay).fill(null), ...days];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">{format(currentMonth, 'MMMM yyyy')}</h3>
          <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-[10px] font-medium text-muted-foreground py-1">
              {day}
            </div>
          ))}
          
          {paddedDays.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }
            
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayActivations = activationsByDate.get(dateKey) || [];
            const hasExact = dayActivations.some(a => a.isExact);
            const isToday = format(new Date(), 'yyyy-MM-dd') === dateKey;
            
            return (
              <div
                key={dateKey}
                className={`aspect-square p-1 border rounded-sm text-xs relative ${
                  isToday ? 'border-primary bg-primary/10' : 'border-border'
                } ${dayActivations.length > 0 ? 'bg-warning/10' : ''}`}
              >
                <div className="text-[10px] font-medium">{format(day, 'd')}</div>
                {dayActivations.length > 0 && (
                  <div className="absolute bottom-0.5 left-0.5 right-0.5 flex flex-wrap gap-0.5 justify-center">
                    {dayActivations.slice(0, 3).map((a, j) => (
                      <span 
                        key={j} 
                        className={`text-[8px] ${hasExact ? 'text-warning font-bold' : 'text-muted-foreground'}`}
                        title={a.description}
                      >
                        {a.aspectSymbol}
                      </span>
                    ))}
                    {dayActivations.length > 3 && (
                      <span className="text-[8px] text-muted-foreground">+{dayActivations.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Month activations list */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Retrograde Activations This Month ({monthActivations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px]">
              {monthActivations.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No transits to natal retrograde planets this month
                </p>
              ) : (
                <div className="space-y-2">
                  {monthActivations.map((activation, i) => (
                    <div 
                      key={i} 
                      className={`flex items-center justify-between p-2 rounded-sm border ${
                        activation.isExact ? 'border-warning bg-warning/10' : 'border-border'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono">{format(activation.date, 'MMM d')}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {getPlanetSymbol(activation.transitPlanet)} {activation.aspectSymbol} {getPlanetSymbol(activation.natalPlanet)}℞
                        </Badge>
                        {activation.transitInRetrograde && (
                          <Badge variant="secondary" className="text-[10px]">
                            <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
                            Transit ℞
                          </Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {activation.orb}° orb
                        {activation.isExact && <Sparkles className="h-3 w-3 inline ml-1 text-warning" />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUpcoming = () => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Upcoming retrograde periods and how they activate your natal retrograde planets.
      </p>
      
      {upcomingRetrogradePeriods.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground text-sm">No upcoming retrograde periods found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {upcomingRetrogradePeriods.map((period, i) => (
            <Card key={i} className="border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-warning/20 text-warning border-warning/30">
                      <RotateCcw className="h-3 w-3 mr-1" />
                      {getPlanetSymbol(period.planet)} {period.planet} ℞
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {period.info.sign.split('/').map(s => SIGN_SYMBOLS[s] || s).join('→')}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(period.info.start, 'MMM d')} - {format(period.info.end, 'MMM d, yyyy')}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {period.affectedNatal.length > 0 ? (
                  <>
                    <p className="text-xs text-foreground">
                      <Zap className="h-3 w-3 inline mr-1 text-warning" />
                      Activates your natal:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {period.affectedNatal.map((nr, j) => (
                        <Badge key={j} variant="secondary" className="text-[10px]">
                          {getPlanetSymbol(nr.planet)} {nr.planet} ℞ in {SIGN_SYMBOLS[nr.sign]}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      When transit {period.planet} goes retrograde in {period.info.sign}, it creates a resonance 
                      with your natal retrograde planets. This is a time for deeper internal work on the themes 
                      these planets represent.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    General retrograde period - review {period.planet}-related matters
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2 pb-4 border-b border-border">
        <h2 className="text-2xl font-serif text-foreground flex items-center justify-center gap-2">
          <RotateCcw className="h-6 w-6 text-warning" />
          Retrograde Activations
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Track when transits activate your natal retrograde planets—moments of intensified internal work and karmic opportunity.
        </p>
      </div>

      {/* Chart Selector */}
      {allCharts.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium">Select Chart:</span>
              <Select 
                value={selectedChartId || 'none'} 
                onValueChange={(v) => setSelectedChartId(v === 'none' ? null : v)}
              >
                <SelectTrigger className="w-[200px] bg-background">
                  <SelectValue placeholder="Select a chart..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No chart selected</SelectItem>
                  {allCharts.filter(chart => chart.id).map(chart => (
                    <SelectItem key={chart.id} value={chart.id}>
                      {chart.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {natalRetrogrades.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {natalRetrogrades.length} natal retrograde planet{natalRetrogrades.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="natal" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Natal ℞
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
        </TabsList>

        <TabsContent value="natal" className="mt-6">
          {renderNatalRetrogrades()}
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          {natalRetrogrades.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Calendar className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Select a chart with natal retrograde planets</p>
              </CardContent>
            </Card>
          ) : (
            renderCalendar()
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          {renderUpcoming()}
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground">About Retrograde Activations</p>
              <p>
                When a transit planet aspects your natal retrograde planet, it creates a "double retrograde" effect—
                intensifying the internal, reflective nature of that natal placement. These are powerful times for:
              </p>
              <ul className="list-disc list-inside space-y-0.5 mt-1">
                <li>Processing old patterns and karmic material</li>
                <li>Completing unfinished psychological work</li>
                <li>Accessing gifts that require introspection</li>
                <li>Reconnecting with past-life themes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
