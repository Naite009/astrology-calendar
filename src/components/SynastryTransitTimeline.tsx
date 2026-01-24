/**
 * Synastry Transit Timeline
 * Shows when transiting planets will activate synastry aspects between two people
 * Helpful for timing important meetings, conversations, or gatherings
 */

import { useMemo, useState } from 'react';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, ChevronLeft, ChevronRight, Star, AlertTriangle, Sparkles, Briefcase, Heart, Users, Home } from 'lucide-react';
import { format, addDays, addMonths, differenceInDays } from 'date-fns';
import { RelationshipFocus } from '@/lib/focusAwareInterpretations';
import * as Astronomy from 'astronomy-engine';

interface SynastryTransitTimelineProps {
  chart1: NatalChart;
  chart2: NatalChart;
  focus: RelationshipFocus;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
};

const TRANSIT_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

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

interface TransitEvent {
  date: Date;
  transitPlanet: string;
  natalPlanet: string;
  natalOwner: string;
  aspectType: string;
  orb: number;
  description: string;
  significance: 'high' | 'medium' | 'low';
  focusRelevance: 'high' | 'medium' | 'low';
}

function getAspectType(angle: number): { type: string; orb: number } | null {
  const aspects = [
    { angle: 0, orb: 2, type: 'conjunction' },
    { angle: 60, orb: 2, type: 'sextile' },
    { angle: 90, orb: 2, type: 'square' },
    { angle: 120, orb: 2, type: 'trine' },
    { angle: 180, orb: 2, type: 'opposition' }
  ];
  
  for (const asp of aspects) {
    const orbDiff = Math.abs(angle - asp.angle);
    if (orbDiff <= asp.orb) {
      return { type: asp.type, orb: Math.round(orbDiff * 10) / 10 };
    }
  }
  return null;
}

function isFocusRelevant(transitPlanet: string, natalPlanet: string, focus: RelationshipFocus): 'high' | 'medium' | 'low' {
  const relevanceMap: Record<RelationshipFocus, Record<string, string[]>> = {
    business: {
      high: ['Saturn', 'Jupiter', 'Mercury'],
      medium: ['Sun', 'Mars']
    },
    romantic: {
      high: ['Venus', 'Mars'],
      medium: ['Moon', 'Sun']
    },
    friendship: {
      high: ['Mercury', 'Jupiter', 'Venus'],
      medium: ['Moon', 'Sun']
    },
    creative: {
      high: ['Venus', 'Neptune', 'Uranus'],
      medium: ['Mercury', 'Jupiter']
    },
    family: {
      high: ['Moon', 'Saturn'],
      medium: ['Sun', 'Venus']
    },
    all: {
      high: ['Saturn', 'Jupiter'],
      medium: ['Venus', 'Mars', 'Mercury']
    }
  };
  
  const focusRules = relevanceMap[focus] || relevanceMap.all;
  
  if (focusRules.high.includes(transitPlanet) || focusRules.high.includes(natalPlanet)) {
    return 'high';
  }
  if (focusRules.medium.includes(transitPlanet) || focusRules.medium.includes(natalPlanet)) {
    return 'medium';
  }
  return 'low';
}

function getTransitDescription(
  transitPlanet: string, 
  natalPlanet: string, 
  aspectType: string, 
  natalOwner: string,
  focus: RelationshipFocus
): string {
  const aspectDescriptions: Record<string, string> = {
    conjunction: 'activates',
    trine: 'harmonizes with',
    sextile: 'supports',
    square: 'challenges',
    opposition: 'illuminates tension with'
  };
  
  const action = aspectDescriptions[aspectType] || 'aspects';
  
  const focusContext: Record<RelationshipFocus, Record<string, string>> = {
    business: {
      Saturn: 'structure, commitments, and long-term planning',
      Jupiter: 'expansion, opportunities, and growth',
      Mercury: 'negotiations, contracts, and communications',
      Mars: 'action, competition, and drive',
      Venus: 'partnerships, agreements, and values',
      Sun: 'leadership, visibility, and identity',
      Moon: 'team morale and emotional climate'
    },
    romantic: {
      Venus: 'love, attraction, and harmony',
      Mars: 'passion, desire, and chemistry',
      Moon: 'emotional connection and intimacy',
      Sun: 'vitality and core connection',
      Saturn: 'commitment and long-term stability',
      Jupiter: 'joy, growth, and shared adventures',
      Mercury: 'communication and understanding'
    },
    friendship: {
      Mercury: 'conversations and shared interests',
      Jupiter: 'fun, adventure, and optimism',
      Venus: 'affection and shared pleasures',
      Moon: 'emotional support and understanding',
      Sun: 'mutual appreciation and respect',
      Mars: 'shared activities and energy',
      Saturn: 'loyalty and lasting bonds'
    },
    creative: {
      Venus: 'aesthetic vision and artistic collaboration',
      Mercury: 'idea exchange and creative communication',
      Jupiter: 'inspiration and grand visions',
      Mars: 'creative drive and motivation',
      Neptune: 'imagination and spiritual art',
      Uranus: 'innovation and breakthrough ideas',
      Sun: 'creative identity and expression'
    },
    family: {
      Moon: 'emotional bonds and nurturing',
      Saturn: 'responsibility and family structure',
      Sun: 'family identity and leadership',
      Venus: 'love and harmony in the home',
      Mars: 'family dynamics and boundaries',
      Jupiter: 'family growth and celebrations',
      Mercury: 'family communication'
    },
    all: {
      Saturn: 'structure and responsibility',
      Jupiter: 'growth and opportunity',
      Venus: 'love and values',
      Mars: 'action and energy',
      Mercury: 'communication and ideas',
      Sun: 'vitality and identity',
      Moon: 'emotions and intuition'
    }
  };
  
  const transitContext = focusContext[focus]?.[transitPlanet] || `${transitPlanet} energy`;
  
  return `Transiting ${PLANET_SYMBOLS[transitPlanet]} ${transitPlanet} ${action} ${natalOwner}'s ${PLANET_SYMBOLS[natalPlanet]} ${natalPlanet}, highlighting ${transitContext}.`;
}

export const SynastryTransitTimeline = ({ chart1, chart2, focus }: SynastryTransitTimelineProps) => {
  const [monthOffset, setMonthOffset] = useState(0);
  const startDate = addMonths(new Date(), monthOffset);
  const endDate = addDays(startDate, 30);
  
  // Calculate transit events for the next 30 days
  const transitEvents = useMemo(() => {
    const events: TransitEvent[] = [];
    const natalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'NorthNode'];
    
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
    
    // Check each day
    for (let d = 0; d <= 30; d++) {
      const checkDate = addDays(startDate, d);
      
      for (const transitPlanet of TRANSIT_PLANETS) {
        const transitDegree = getTransitPlanetPosition(transitPlanet, checkDate);
        
        for (const natal of natalPositions) {
          let diff = Math.abs(transitDegree - natal.degree);
          if (diff > 180) diff = 360 - diff;
          
          const aspect = getAspectType(diff);
          if (aspect) {
            // Avoid duplicate events for same transit on consecutive days
            const existingEvent = events.find(e => 
              e.transitPlanet === transitPlanet && 
              e.natalPlanet === natal.planet && 
              e.natalOwner === natal.owner &&
              Math.abs(differenceInDays(e.date, checkDate)) <= 1
            );
            
            if (!existingEvent) {
              const focusRelevance = isFocusRelevant(transitPlanet, natal.planet, focus);
              
              events.push({
                date: checkDate,
                transitPlanet,
                natalPlanet: natal.planet,
                natalOwner: natal.owner,
                aspectType: aspect.type,
                orb: aspect.orb,
                description: getTransitDescription(transitPlanet, natal.planet, aspect.type, natal.owner, focus),
                significance: aspect.type === 'conjunction' || aspect.type === 'opposition' ? 'high' : 
                             aspect.type === 'square' || aspect.type === 'trine' ? 'medium' : 'low',
                focusRelevance
              });
            }
          }
        }
      }
    }
    
    // Sort by date, then by significance
    return events.sort((a, b) => {
      const dateDiff = a.date.getTime() - b.date.getTime();
      if (dateDiff !== 0) return dateDiff;
      const sigOrder = { high: 0, medium: 1, low: 2 };
      return sigOrder[a.significance] - sigOrder[b.significance];
    });
  }, [chart1, chart2, startDate, focus]);
  
  // Filter for focus-relevant events
  const relevantEvents = transitEvents.filter(e => e.focusRelevance === 'high' || e.focusRelevance === 'medium');
  
  // Group by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, TransitEvent[]> = {};
    for (const event of relevantEvents) {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(event);
    }
    return grouped;
  }, [relevantEvents]);
  
  const focusIcon = {
    business: <Briefcase size={14} />,
    romantic: <Heart size={14} />,
    friendship: <Users size={14} />,
    creative: <Sparkles size={14} />,
    family: <Home size={14} />,
    all: <Star size={14} />
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-lg flex items-center gap-2">
          <Calendar className="text-primary" size={18} />
          Synastry Transit Timeline
        </h4>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonthOffset(m => m - 1)}>
            <ChevronLeft size={14} />
          </Button>
          <span className="text-sm font-medium min-w-[100px] text-center">
            {format(startDate, 'MMM yyyy')}
          </span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonthOffset(m => m + 1)}>
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
      
      <div className="p-3 rounded-lg bg-secondary/30 border text-sm text-muted-foreground flex items-center gap-2">
        {focusIcon[focus]}
        <span>
          Showing transits relevant to <strong>{focus === 'all' ? 'all relationship types' : focus}</strong> between {chart1.name} and {chart2.name}
        </span>
      </div>
      
      <ScrollArea className="h-[400px]">
        <div className="space-y-4 pr-4">
          {Object.entries(eventsByDate).length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No significant transits in this period for {focus} focus.</p>
          ) : (
            Object.entries(eventsByDate).map(([dateKey, events]) => (
              <div key={dateKey} className="space-y-2">
                <div className="sticky top-0 bg-background/95 backdrop-blur py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{format(new Date(dateKey), 'EEEE, MMM d')}</span>
                    {events.some(e => e.focusRelevance === 'high') && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">Key Day</Badge>
                    )}
                  </div>
                </div>
                
                {events.map((event, i) => (
                  <div 
                    key={i} 
                    className={`p-3 rounded-lg border ${
                      event.focusRelevance === 'high' 
                        ? 'border-primary/50 bg-primary/5' 
                        : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{PLANET_SYMBOLS[event.transitPlanet]}</span>
                      <span className="text-sm font-medium">
                        {event.transitPlanet} {event.aspectType} {event.natalOwner}'s {event.natalPlanet}
                      </span>
                      <Badge 
                        variant={event.significance === 'high' ? 'default' : 'secondary'} 
                        className="ml-auto text-[10px]"
                      >
                        {event.aspectType}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{event.description}</p>
                    
                    {/* Timing recommendation based on aspect */}
                    <div className="mt-2 text-xs">
                      {event.aspectType === 'conjunction' || event.aspectType === 'trine' || event.aspectType === 'sextile' ? (
                        <span className="text-green-600 dark:text-green-400">
                          ✓ Good timing for {focus === 'business' ? 'meetings and negotiations' : focus === 'romantic' ? 'dates and connection' : focus === 'family' ? 'family gatherings' : 'coming together'}
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <AlertTriangle size={10} />
                          May bring {focus === 'business' ? 'negotiations that need patience' : 'tension that requires awareness'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
