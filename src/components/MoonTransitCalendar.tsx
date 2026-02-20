import { useState, useMemo, useEffect } from 'react';
import { Moon, ChevronLeft, ChevronRight, Calendar, Star, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NatalChart } from '@/hooks/useNatalChart';
import * as Astronomy from 'astronomy-engine';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { refineExactAspectTime, aspectOrb, normalizeLongitude } from '@/lib/transitMath';

interface MoonTransitCalendarProps {
  natalChart: NatalChart | null;
}

interface MoonTransit {
  date: Date;
  exactTime: string; // HH:mm format
  natalPlanet: string;
  aspectType: string;
  aspectSymbol: string;
  orb: number;
  moonSign: string;
  moonDegree: number;
  isExact: boolean;
  interpretation: string;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  Ascendant: 'AC', Midheaven: 'MC', NorthNode: '☊', Chiron: '⚷'
};

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

// Personal planets + angles that you would "feel" most strongly
const PERSONAL_POINTS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant', 'Midheaven'];

const ASPECT_TYPES = [
  { name: 'conjunction', angle: 0, symbol: '☌', orb: 6, nature: 'major' },
  { name: 'sextile', angle: 60, symbol: '⚹', orb: 4, nature: 'harmonious' },
  { name: 'square', angle: 90, symbol: '□', orb: 5, nature: 'challenging' },
  { name: 'trine', angle: 120, symbol: '△', orb: 5, nature: 'harmonious' },
  { name: 'opposition', angle: 180, symbol: '☍', orb: 6, nature: 'major' },
];

const getMoonLongitude = (date: Date): number => {
  try {
    const vector = Astronomy.GeoVector(Astronomy.Body.Moon, date, false);
    const ecliptic = Astronomy.Ecliptic(vector);
    return normalizeLongitude(ecliptic.elon);
  } catch {
    return 0;
  }
};

const getMoonSign = (longitude: number): { sign: string; degree: number } => {
  const normalized = normalizeLongitude(longitude);
  const signIndex = Math.floor(normalized / 30);
  const degree = normalized % 30;
  return { sign: ZODIAC_SIGNS[signIndex], degree };
};

const getNatalPlanetLongitude = (chart: NatalChart, planet: string): number | null => {
  if (planet === 'Ascendant') {
    // Always prefer houseCusps.house1 over planets.Ascendant to avoid Asc/Desc flip
    const h1 = chart.houseCusps?.house1;
    const asc = h1?.sign ? h1 : chart.planets.Ascendant;
    if (!asc?.sign) return null;
    const signIndex = ZODIAC_SIGNS.indexOf(asc.sign);
    if (signIndex === -1) return null;
    return signIndex * 30 + asc.degree + (asc.minutes || 0) / 60;
  }
  
  if (planet === 'Midheaven') {
    const mc = chart.houseCusps?.house10;
    if (!mc?.sign) return null;
    const signIndex = ZODIAC_SIGNS.indexOf(mc.sign);
    if (signIndex === -1) return null;
    return signIndex * 30 + mc.degree + (mc.minutes || 0) / 60;
  }
  
  const planetData = chart.planets[planet as keyof typeof chart.planets];
  if (!planetData?.sign) return null;
  
  const signIndex = ZODIAC_SIGNS.indexOf(planetData.sign);
  if (signIndex === -1) return null;
  
  return signIndex * 30 + planetData.degree + (planetData.minutes || 0) / 60;
};

const getTransitInterpretation = (planet: string, aspect: string): string => {
  const interpretations: Record<string, Record<string, string>> = {
    Sun: {
      conjunction: 'Emotional connection to identity and vitality. Good for self-expression.',
      sextile: 'Easy flow between emotions and will. Creative opportunities.',
      square: 'Internal tension between needs and goals. Emotional decisions.',
      trine: 'Harmony between heart and head. Confidence flows naturally.',
      opposition: 'Awareness of how emotions affect your sense of self.',
    },
    Moon: {
      conjunction: 'Lunar Return - emotional reset. New emotional cycle begins.',
      sextile: 'Emotional insights available. Connect with your feelings.',
      square: 'Emotional tension or restlessness. Inner adjustments needed.',
      trine: 'Deep emotional harmony. Trust your instincts.',
      opposition: 'Full awareness of emotional patterns. Release what no longer serves.',
    },
    Mercury: {
      conjunction: 'Mind and heart align. Good for emotional conversations.',
      sextile: 'Easy communication of feelings. Write, journal, connect.',
      square: 'Mental/emotional disconnect. Clarify before speaking.',
      trine: 'Words flow from the heart. Intuitive understanding.',
      opposition: 'Balance logic with intuition. Listen as much as speak.',
    },
    Venus: {
      conjunction: 'Love and comfort highlighted. Good for relationships, beauty.',
      sextile: 'Pleasant social interactions. Enjoy simple pleasures.',
      square: 'Tension in relationships or values. Comfort-seeking.',
      trine: 'Natural charm and warmth. Attract what you need.',
      opposition: 'Relationship awareness. Balance giving and receiving.',
    },
    Mars: {
      conjunction: 'Emotional energy intensifies. Channel into action.',
      sextile: 'Motivation comes easily. Take initiative.',
      square: 'Irritability or impatience. Pause before reacting.',
      trine: 'Courage and emotional strength. Assert yourself.',
      opposition: 'Others may trigger reactions. Choose your battles.',
    },
    Ascendant: {
      conjunction: 'Emotions visible to others. Your mood sets the tone.',
      sextile: 'Easy self-expression. Others respond to your vibe.',
      square: 'Tension between inner feelings and outer image.',
      trine: 'Natural authenticity. Be yourself comfortably.',
      opposition: 'Relationships reflect your emotional state.',
    },
    Midheaven: {
      conjunction: 'Public visibility of emotions. Career/reputation touched.',
      sextile: 'Professional opportunities align with emotional needs.',
      square: 'Work/life balance challenged. Prioritize wisely.',
      trine: 'Success feels emotionally fulfilling. Recognition comes.',
      opposition: 'Home and career seek balance. Nurture both.',
    },
  };
  
  return interpretations[planet]?.[aspect] || 'Lunar energy activates this natal point.';
};

// Refine to find exact aspect time using ternary search
const findExactMoonAspectTime = (
  seedDate: Date,
  natalLongitude: number,
  aspectAngle: number
): { date: Date; orb: number } => {
  return refineExactAspectTime({
    seedDate,
    windowHours: 6, // Moon moves fast, 6 hours is plenty
    transitLongitudeAt: getMoonLongitude,
    natalLongitude,
    aspectAngle,
  });
};

// Async chunked version: processes one day at a time, yielding to main thread between days
const calculateMoonTransitsAsync = (
  chart: NatalChart,
  startDate: Date,
  days: number,
  onProgress: (transits: MoonTransit[]) => void,
  signal: AbortSignal
): void => {
  const uniqueTransits = new Map<string, MoonTransit>();
  let currentDay = 0;

  const processDay = () => {
    if (signal.aborted || currentDay >= days) {
      onProgress(Array.from(uniqueTransits.values()).sort((a, b) => a.date.getTime() - b.date.getTime()));
      return;
    }

    // Process one day (6 checks × 7 planets × 5 aspects = ~210 iterations)
    const d = currentDay;
    for (let h = 0; h < 24; h += 4) {
      const checkDate = new Date(startDate);
      checkDate.setDate(checkDate.getDate() + d);
      checkDate.setHours(h, 0, 0, 0);

      const moonLon = getMoonLongitude(checkDate);

      PERSONAL_POINTS.forEach(planet => {
        const natalLon = getNatalPlanetLongitude(chart, planet);
        if (natalLon === null) return;

        ASPECT_TYPES.forEach(aspect => {
          const orb = aspectOrb(moonLon, natalLon, aspect.angle);

          if (orb <= aspect.orb) {
            const exactResult = findExactMoonAspectTime(checkDate, natalLon, aspect.angle);
            const dateKey = format(exactResult.date, 'yyyy-MM-dd');
            const transitKey = `${dateKey}-${planet}-${aspect.name}`;

            const existing = uniqueTransits.get(transitKey);
            if (!existing || exactResult.orb < existing.orb) {
              const { sign: moonSign, degree: moonDegree } = getMoonSign(getMoonLongitude(exactResult.date));

              uniqueTransits.set(transitKey, {
                date: exactResult.date,
                exactTime: format(exactResult.date, 'h:mm a'),
                natalPlanet: planet,
                aspectType: aspect.name,
                aspectSymbol: aspect.symbol,
                orb: Math.round(exactResult.orb * 100) / 100,
                moonSign,
                moonDegree: Math.round(moonDegree * 10) / 10,
                isExact: exactResult.orb < 0.5,
                interpretation: getTransitInterpretation(planet, aspect.name),
              });
            }
          }
        });
      });
    }

    currentDay++;
    // Yield to main thread before processing the next day
    setTimeout(processDay, 0);
  };

  setTimeout(processDay, 0);
};

const aspectColors: Record<string, string> = {
  conjunction: 'bg-primary/20 text-primary',
  sextile: 'bg-secondary text-secondary-foreground',
  square: 'bg-destructive/20 text-destructive',
  trine: 'bg-accent text-accent-foreground',
  opposition: 'bg-muted text-muted-foreground',
};

const TransitDetailDialog = ({ transit }: { transit: MoonTransit }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={`text-xs px-2 py-1 rounded-full hover:ring-2 hover:ring-primary/50 transition-all ${aspectColors[transit.aspectType]}`}>
          {transit.aspectSymbol} {PLANET_SYMBOLS[transit.natalPlanet] || transit.natalPlanet}
          {transit.isExact && <Star className="inline-block w-2 h-2 ml-0.5 fill-current" />}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" />
            Moon {transit.aspectSymbol} {transit.natalPlanet}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Prominent exact time display */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Exact Time</div>
            <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              {transit.exactTime}
            </div>
            <div className="text-sm text-muted-foreground mt-1">{format(transit.date, 'EEEE, MMMM d, yyyy')}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-secondary/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Moon Position</div>
              <div className="font-medium">{transit.moonDegree.toFixed(1)}° {transit.moonSign}</div>
            </div>
            <div className="p-3 rounded-lg bg-secondary/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Orb</div>
              <div className="font-medium">{transit.orb.toFixed(2)}°</div>
              {transit.isExact && <Badge className="mt-1 text-xs bg-primary/20">★ EXACT</Badge>}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg ${aspectColors[transit.aspectType]}`}>
            <div className="text-xs uppercase tracking-wider mb-1 opacity-80">Aspect Type</div>
            <div className="font-medium capitalize flex items-center gap-2">
              <span className="text-xl">{transit.aspectSymbol}</span>
              {transit.aspectType}
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-card border">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">How You'll Feel It</div>
            <p className="text-sm leading-relaxed">{transit.interpretation}</p>
          </div>
          
          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Transit ☽ {transit.aspectSymbol} Natal {PLANET_SYMBOLS[transit.natalPlanet] || transit.natalPlanet} {transit.natalPlanet}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Compact transit row for the list view
const TransitListRow = ({ transit }: { transit: MoonTransit }) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg border ${transit.isExact ? 'bg-primary/5 border-primary/30' : 'bg-card'}`}>
    <div className="w-20 text-center">
      <div className="text-sm font-medium">{format(transit.date, 'MMM d')}</div>
      <div className="text-lg font-bold text-primary">{transit.exactTime}</div>
    </div>
    <div className={`px-3 py-2 rounded-lg ${aspectColors[transit.aspectType]} flex items-center gap-2`}>
      <span className="text-lg">☽</span>
      <span className="text-xl">{transit.aspectSymbol}</span>
      <span className="font-medium">{PLANET_SYMBOLS[transit.natalPlanet]}</span>
    </div>
    <div className="flex-1">
      <div className="text-sm font-medium">
        Moon {transit.aspectType} {transit.natalPlanet}
        {transit.isExact && <Star className="inline-block w-3 h-3 ml-1 fill-primary text-primary" />}
      </div>
      <div className="text-xs text-muted-foreground truncate">{transit.interpretation}</div>
    </div>
    <div className="text-xs text-muted-foreground">
      {transit.orb.toFixed(2)}°
    </div>
  </div>
);

export const MoonTransitCalendar = ({ natalChart }: MoonTransitCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Use a stable string key so useEffect doesn't re-run on every render
  const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
  
  // Auto-calculate transits with async chunked execution (yields to main thread between days)
  const [transits, setTransits] = useState<MoonTransit[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  useEffect(() => {
    if (!natalChart) { setTransits([]); return; }
    setIsCalculating(true);
    const controller = new AbortController();
    calculateMoonTransitsAsync(natalChart, monthStart, 35, (result) => {
      if (!controller.signal.aborted) {
        setTransits(result);
        setIsCalculating(false);
      }
    }, controller.signal);
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natalChart, monthKey]);

  // Filter transits to only those in the current month for list view
  const monthTransits = useMemo(() => {
    return transits.filter(t => {
      const tMonth = t.date.getMonth();
      const tYear = t.date.getFullYear();
      return tMonth === currentMonth.getMonth() && tYear === currentMonth.getFullYear();
    });
  }, [transits, currentMonth]);
  
  // Group transits by date
  const transitsByDate = useMemo(() => {
    const grouped: Record<string, MoonTransit[]> = {};
    transits.forEach(t => {
      const key = format(t.date, 'yyyy-MM-dd');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(t);
    });
    return grouped;
  }, [transits]);
  
  const selectedDayTransits = selectedDate 
    ? transitsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : [];
  
  const navigateMonth = (direction: number) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + direction);
      return newDate;
    });
    setSelectedDate(null);
  };
  
  if (!natalChart) {
    return (
      <Card className="border-2 border-dashed border-muted-foreground/30">
        <CardContent className="p-6 text-center text-muted-foreground">
          <Moon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Select a natal chart to see Moon transits</p>
        </CardContent>
      </Card>
    );
  }

  if (isCalculating) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Moon className="h-8 w-8 mx-auto mb-3 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">Calculating Moon transits…</p>
        </CardContent>
      </Card>
    );
  }
  
  // Get first day of week offset
  const firstDayOffset = monthStart.getDay();
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Moon className="h-5 w-5 text-primary" />
            ☽ Moon Transits
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-muted-foreground">
            Exact times the Moon hits your personal planets & angles
          </p>
          <Badge variant="secondary" className="text-xs">
            {monthTransits.length} transits this month
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* View Mode Tabs */}
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')} className="mb-4">
          <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
            <TabsTrigger value="calendar" className="flex items-center gap-1 text-xs">
              <Calendar className="h-3 w-3" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              List
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            {/* List View - Shows all transits with exact times */}
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-2">
                {monthTransits.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No Moon transits this month</p>
                ) : (
                  monthTransits.map((transit, i) => (
                    <TransitListRow key={i} transit={transit} />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
          
              {/* Empty cells for offset */}
              {Array.from({ length: firstDayOffset }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24" />
              ))}
          
              {/* Day cells */}
              {daysInMonth.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayTransits = transitsByDate[dateKey] || [];
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                const hasExact = dayTransits.some(t => t.isExact);
            
                return (
                  <button
                    key={dateKey}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className={`h-24 p-1 rounded-lg border text-left transition-all hover:border-primary/50 ${
                      isSelected 
                        ? 'border-primary bg-primary/10' 
                        : isToday 
                          ? 'border-primary/30 bg-primary/5' 
                          : 'border-border/50'
                    } ${hasExact ? 'ring-2 ring-yellow-500/50' : ''}`}
                  >
                    <div className={`text-xs font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                      {format(day, 'd')}
                    </div>
                    <div className="flex flex-wrap gap-0.5">
                      {dayTransits.slice(0, 4).map((transit, i) => (
                        <TransitDetailDialog key={i} transit={transit} />
                      ))}
                      {dayTransits.length > 4 && (
                        <span className="text-xs text-muted-foreground px-1">
                          +{dayTransits.length - 4}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
        
            {/* Selected Day Detail */}
            {selectedDate && (
              <div className="mt-4 p-4 rounded-lg border bg-secondary/30">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </h4>
                {selectedDayTransits.length > 0 ? (
                  <ScrollArea className="max-h-48">
                    <div className="space-y-2">
                      {selectedDayTransits.map((transit, i) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-lg border ${
                            transit.isExact 
                              ? 'bg-primary/10 border-primary/50' 
                              : 'bg-card'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">
                              ☽ Moon {transit.aspectSymbol} {PLANET_SYMBOLS[transit.natalPlanet]} {transit.natalPlanet}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-primary">
                                {transit.exactTime}
                              </span>
                              {transit.isExact && (
                                <Badge variant="secondary" className="text-xs bg-primary/20">
                                  ★ EXACT
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {transit.interpretation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-sm text-muted-foreground">No major Moon transits on this day</p>
                )}
              </div>
            )}
        
            {/* Legend */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-primary/60" /> Conjunction
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-accent" /> Trine
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-secondary" /> Sextile
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-destructive/60" /> Square
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-muted-foreground" /> Opposition
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-primary text-primary" /> Exact
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};