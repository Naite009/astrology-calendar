/**
 * Relationship Timing Calculator
 * Finds the best dates for important events based on synastry transits
 */

import { useState, useMemo } from 'react';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Star, Heart, Briefcase, Users, Home, Sparkles, Check, Award, Clock } from 'lucide-react';
import { format, addDays, addMonths } from 'date-fns';
import { RelationshipFocus } from '@/lib/focusAwareInterpretations';
import * as Astronomy from 'astronomy-engine';

interface RelationshipTimingCalculatorProps {
  chart1: NatalChart;
  chart2: NatalChart;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', NorthNode: '☊'
};

type EventType = 'business_meeting' | 'wedding' | 'family_gathering' | 'creative_launch' | 'important_talk' | 'romantic_date';

const EVENT_TYPES: { value: EventType; label: string; icon: React.ReactNode; focus: RelationshipFocus; description: string }[] = [
  { value: 'business_meeting', label: 'Business Meeting', icon: <Briefcase size={14} />, focus: 'business', description: 'Contracts, negotiations, partnerships' },
  { value: 'wedding', label: 'Wedding / Commitment', icon: <Heart size={14} />, focus: 'romantic', description: 'Marriage, engagement, vow renewal' },
  { value: 'family_gathering', label: 'Family Gathering', icon: <Home size={14} />, focus: 'family', description: 'Reunions, holidays, important family events' },
  { value: 'creative_launch', label: 'Creative Launch', icon: <Sparkles size={14} />, focus: 'creative', description: 'Art shows, product launches, collaborations' },
  { value: 'important_talk', label: 'Important Conversation', icon: <Users size={14} />, focus: 'friendship', description: 'Heart-to-heart, conflict resolution' },
  { value: 'romantic_date', label: 'Romantic Date', icon: <Heart size={14} />, focus: 'romantic', description: 'Special dates, anniversaries' }
];

function toAbsoluteDegree(position: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return (signIndex * 30) + position.degree + ((position.minutes || 0) / 60);
}

function getTransitPlanetPosition(planet: string, date: Date): number {
  const astroDate = Astronomy.MakeTime(date);
  
  const bodyMap: Record<string, Astronomy.Body> = {
    Sun: Astronomy.Body.Sun,
    Moon: Astronomy.Body.Moon,
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
    Jupiter: Astronomy.Body.Jupiter,
    Saturn: Astronomy.Body.Saturn,
  };
  
  const body = bodyMap[planet];
  if (!body) return 0;
  
  try {
    const geo = Astronomy.GeoVector(body, astroDate, false);
    const ecl = Astronomy.Ecliptic(geo);
    return ((ecl.elon % 360) + 360) % 360;
  } catch {
    return 0;
  }
}

interface DateScore {
  date: Date;
  score: number;
  positiveAspects: string[];
  warnings: string[];
  moonPhase: string;
  moonSign: string;
}

function getMoonPhase(date: Date): { phase: string; illumination: number } {
  const astroDate = Astronomy.MakeTime(date);
  const moon = Astronomy.MoonPhase(astroDate);
  
  if (moon < 45) return { phase: 'New Moon', illumination: moon };
  if (moon < 90) return { phase: 'Waxing Crescent', illumination: moon };
  if (moon < 135) return { phase: 'First Quarter', illumination: moon };
  if (moon < 180) return { phase: 'Waxing Gibbous', illumination: moon };
  if (moon < 225) return { phase: 'Full Moon', illumination: moon };
  if (moon < 270) return { phase: 'Waning Gibbous', illumination: moon };
  if (moon < 315) return { phase: 'Last Quarter', illumination: moon };
  return { phase: 'Waning Crescent', illumination: moon };
}

function getMoonSign(date: Date): string {
  const moonDegree = getTransitPlanetPosition('Moon', date);
  const signIndex = Math.floor(moonDegree / 30);
  return ZODIAC_SIGNS[signIndex] || 'Aries';
}

function getAspect(angle: number): { type: string; quality: 'positive' | 'neutral' | 'challenging' } | null {
  const aspects = [
    { angle: 0, orb: 8, type: 'conjunction', quality: 'positive' as const },
    { angle: 60, orb: 6, type: 'sextile', quality: 'positive' as const },
    { angle: 90, orb: 7, type: 'square', quality: 'challenging' as const },
    { angle: 120, orb: 8, type: 'trine', quality: 'positive' as const },
    { angle: 180, orb: 8, type: 'opposition', quality: 'challenging' as const }
  ];
  
  for (const asp of aspects) {
    const orbDiff = Math.abs(angle - asp.angle);
    if (orbDiff <= asp.orb) {
      return { type: asp.type, quality: asp.quality };
    }
  }
  return null;
}

// Weights for different event types
const EVENT_PLANET_WEIGHTS: Record<EventType, Record<string, number>> = {
  business_meeting: { Saturn: 3, Jupiter: 3, Mercury: 2, Sun: 1, Venus: 1 },
  wedding: { Venus: 3, Moon: 2, Jupiter: 2, Sun: 1, Saturn: 1 },
  family_gathering: { Moon: 3, Venus: 2, Jupiter: 2, Sun: 1 },
  creative_launch: { Venus: 3, Mercury: 2, Jupiter: 2, Uranus: 2, Sun: 1 },
  important_talk: { Mercury: 3, Moon: 2, Venus: 2, Sun: 1 },
  romantic_date: { Venus: 3, Mars: 2, Moon: 2, Sun: 1 }
};

// Good Moon signs for different events
const GOOD_MOON_SIGNS: Record<EventType, string[]> = {
  business_meeting: ['Capricorn', 'Taurus', 'Virgo', 'Libra'],
  wedding: ['Libra', 'Taurus', 'Leo', 'Cancer', 'Pisces'],
  family_gathering: ['Cancer', 'Taurus', 'Leo', 'Libra'],
  creative_launch: ['Leo', 'Libra', 'Pisces', 'Aquarius'],
  important_talk: ['Gemini', 'Libra', 'Aquarius', 'Virgo'],
  romantic_date: ['Libra', 'Taurus', 'Leo', 'Pisces', 'Scorpio']
};

export const RelationshipTimingCalculator = ({ chart1, chart2 }: RelationshipTimingCalculatorProps) => {
  const [eventType, setEventType] = useState<EventType>('business_meeting');
  const [searchMonths, setSearchMonths] = useState(3);
  
  const bestDates = useMemo(() => {
    const dates: DateScore[] = [];
    const endDate = addMonths(new Date(), searchMonths);
    const transitPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
    const natalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'NorthNode'];
    const weights = EVENT_PLANET_WEIGHTS[eventType];
    const goodMoonSigns = GOOD_MOON_SIGNS[eventType];
    
    // Get natal positions for both charts
    const natalPositions: Array<{ planet: string; degree: number; owner: string }> = [];
    
    for (const planet of natalPlanets) {
      const pos1 = chart1.planets[planet as keyof typeof chart1.planets];
      if (pos1) {
        natalPositions.push({ planet, degree: toAbsoluteDegree(pos1), owner: chart1.name });
      }
      const pos2 = chart2.planets[planet as keyof typeof chart2.planets];
      if (pos2) {
        natalPositions.push({ planet, degree: toAbsoluteDegree(pos2), owner: chart2.name });
      }
    }
    
    // Score each day
    let currentDate = new Date();
    while (currentDate <= endDate) {
      let score = 50; // Base score
      const positiveAspects: string[] = [];
      const warnings: string[] = [];
      
      const moonPhaseData = getMoonPhase(currentDate);
      const moonSign = getMoonSign(currentDate);
      
      // Moon phase bonus
      if (eventType === 'wedding' || eventType === 'creative_launch') {
        if (moonPhaseData.phase === 'Full Moon') score += 10;
        else if (moonPhaseData.phase === 'Waxing Gibbous') score += 5;
      }
      if (eventType === 'business_meeting' || eventType === 'important_talk') {
        if (moonPhaseData.phase === 'First Quarter') score += 5;
      }
      
      // Moon sign bonus
      if (goodMoonSigns.includes(moonSign)) {
        score += 8;
        positiveAspects.push(`☽ Moon in ${moonSign} (favorable)`);
      }
      
      // Check transits to natal positions
      for (const transitPlanet of transitPlanets) {
        const transitDegree = getTransitPlanetPosition(transitPlanet, currentDate);
        const planetWeight = weights[transitPlanet] || 0;
        
        for (const natal of natalPositions) {
          let diff = Math.abs(transitDegree - natal.degree);
          if (diff > 180) diff = 360 - diff;
          
          const aspect = getAspect(diff);
          if (aspect) {
            const aspectScore = planetWeight * (aspect.quality === 'positive' ? 5 : -3);
            score += aspectScore;
            
            if (aspect.quality === 'positive' && planetWeight >= 2) {
              positiveAspects.push(`${PLANET_SYMBOLS[transitPlanet]} ${transitPlanet} ${aspect.type} ${natal.owner}'s ${PLANET_SYMBOLS[natal.planet]} ${natal.planet}`);
            } else if (aspect.quality === 'challenging' && planetWeight >= 2) {
              warnings.push(`${PLANET_SYMBOLS[transitPlanet]} ${transitPlanet} ${aspect.type} ${natal.owner}'s ${PLANET_SYMBOLS[natal.planet]} ${natal.planet}`);
            }
          }
        }
      }
      
      // Check synastry between transits (Venus-Jupiter together is lucky for weddings, etc.)
      const venusTransit = getTransitPlanetPosition('Venus', currentDate);
      const jupiterTransit = getTransitPlanetPosition('Jupiter', currentDate);
      let venuJupDiff = Math.abs(venusTransit - jupiterTransit);
      if (venuJupDiff > 180) venuJupDiff = 360 - venuJupDiff;
      if (venuJupDiff <= 10) {
        score += 15;
        positiveAspects.push('♀ Venus conjunct ♃ Jupiter (very lucky!)');
      }
      
      dates.push({
        date: new Date(currentDate),
        score: Math.max(0, Math.min(100, score)),
        positiveAspects: positiveAspects.slice(0, 5),
        warnings: warnings.slice(0, 3),
        moonPhase: moonPhaseData.phase,
        moonSign
      });
      
      currentDate = addDays(currentDate, 1);
    }
    
    // Sort by score and return top dates
    return dates.sort((a, b) => b.score - a.score).slice(0, 10);
  }, [chart1, chart2, eventType, searchMonths]);
  
  const selectedEvent = EVENT_TYPES.find(e => e.value === eventType);
  
  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl font-serif">
          <Calendar className="text-primary" size={20} />
          Relationship Timing Calculator
        </CardTitle>
        <CardDescription>
          Find the best dates for important events between {chart1.name} and {chart2.name}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Event Type Selection */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Event Type</label>
            <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                {EVENT_TYPES.map(event => (
                  <SelectItem key={event.value} value={event.value}>
                    <div className="flex items-center gap-2">
                      {event.icon}
                      <span>{event.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEvent && (
              <p className="text-xs text-muted-foreground mt-1">{selectedEvent.description}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Search Period</label>
            <Select value={searchMonths.toString()} onValueChange={(v) => setSearchMonths(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border shadow-lg z-50">
                <SelectItem value="1">Next 1 month</SelectItem>
                <SelectItem value="3">Next 3 months</SelectItem>
                <SelectItem value="6">Next 6 months</SelectItem>
                <SelectItem value="12">Next 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Best Dates */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Award className="text-amber-500" size={16} />
            Top 10 Best Dates
          </h4>
          
          <div className="grid gap-3">
            {bestDates.map((dateScore, i) => (
              <div 
                key={i} 
                className={`p-4 rounded-lg border ${
                  i === 0 
                    ? 'border-primary bg-primary/5' 
                    : i < 3 
                      ? 'border-amber-500/30 bg-amber-500/5' 
                      : 'border-border bg-card'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {i === 0 && <Star className="text-primary fill-primary" size={16} />}
                    <span className="font-medium">{format(dateScore.date, 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  <Badge variant={dateScore.score >= 75 ? 'default' : dateScore.score >= 60 ? 'secondary' : 'outline'}>
                    {dateScore.score}% favorable
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {dateScore.moonPhase}
                  </span>
                  <span>☽ in {dateScore.moonSign}</span>
                </div>
                
                {dateScore.positiveAspects.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {dateScore.positiveAspects.map((asp, j) => (
                      <p key={j} className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <Check size={10} />
                        {asp}
                      </p>
                    ))}
                  </div>
                )}
                
                {dateScore.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {dateScore.warnings.map((warn, j) => (
                      <p key={j} className="text-xs text-amber-600 dark:text-amber-400">
                        ⚠ {warn}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Dates are scored based on transiting planets aspecting both charts, Moon phase, and Moon sign favorable for {selectedEvent?.label.toLowerCase()}
        </p>
      </CardContent>
    </Card>
  );
};
