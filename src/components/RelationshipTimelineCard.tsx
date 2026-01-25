import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, ChevronDown, ChevronUp, Star, AlertTriangle, Heart, Briefcase, Sparkles, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

interface TimelineEvent {
  date: Date;
  type: 'opportunity' | 'challenge' | 'transformation' | 'milestone';
  title: string;
  description: string;
  planets: string[];
  aspect: string;
  impact: 'high' | 'medium' | 'low';
  categories: ('romantic' | 'business' | 'growth' | 'communication')[];
  isExact?: boolean;
}

interface MonthSummary {
  month: Date;
  events: TimelineEvent[];
  overallEnergy: 'positive' | 'mixed' | 'challenging';
  theme: string;
}

interface RelationshipTimelineCardProps {
  chart1: NatalChart;
  chart2: NatalChart;
  months?: number;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function toAbsoluteDegree(pos: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(pos.sign);
  return signIndex * 30 + pos.degree + (pos.minutes || 0) / 60;
}

// Approximate daily motion for planets
const DAILY_MOTION: Record<string, number> = {
  Sun: 0.9856,
  Moon: 13.176,
  Mercury: 1.2,
  Venus: 1.0,
  Mars: 0.524,
  Jupiter: 0.083,
  Saturn: 0.034,
  Uranus: 0.012,
  Neptune: 0.006,
  Pluto: 0.004
};

function getTransitPosition(planet: string, baseDate: Date, targetDate: Date, baseLongitude: number): number {
  const daysDiff = (targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24);
  const motion = DAILY_MOTION[planet] || 0.5;
  let longitude = baseLongitude + (motion * daysDiff);
  return ((longitude % 360) + 360) % 360;
}

function checkAspect(transitLon: number, natalLon: number): { type: string; orb: number } | null {
  let diff = Math.abs(transitLon - natalLon);
  if (diff > 180) diff = 360 - diff;
  
  const aspects = [
    { name: 'conjunction', angle: 0, orb: 8, symbol: '☌' },
    { name: 'sextile', angle: 60, orb: 4, symbol: '⚹' },
    { name: 'square', angle: 90, orb: 6, symbol: '□' },
    { name: 'trine', angle: 120, orb: 6, symbol: '△' },
    { name: 'opposition', angle: 180, orb: 8, symbol: '☍' }
  ];
  
  for (const aspect of aspects) {
    const orbActual = Math.abs(diff - aspect.angle);
    if (orbActual <= aspect.orb) {
      return { type: aspect.name, orb: orbActual };
    }
  }
  return null;
}

function getEventType(aspect: string, transitPlanet: string): TimelineEvent['type'] {
  if (aspect === 'trine' || aspect === 'sextile') return 'opportunity';
  if (aspect === 'square') return 'challenge';
  if (transitPlanet === 'Pluto' || transitPlanet === 'Saturn') return 'transformation';
  if (aspect === 'conjunction') return 'milestone';
  return 'opportunity';
}

function getEventCategories(transitPlanet: string, natalPlanet: string): TimelineEvent['categories'] {
  const categories: TimelineEvent['categories'] = [];
  
  if (['Venus', 'Moon'].includes(transitPlanet) || ['Venus', 'Moon'].includes(natalPlanet)) {
    categories.push('romantic');
  }
  if (['Saturn', 'Jupiter', 'Mars'].includes(transitPlanet) || ['Saturn', 'Jupiter', 'MC'].includes(natalPlanet)) {
    categories.push('business');
  }
  if (['Mercury', 'Uranus'].includes(transitPlanet)) {
    categories.push('communication');
  }
  if (['Jupiter', 'Pluto', 'Neptune'].includes(transitPlanet)) {
    categories.push('growth');
  }
  
  return categories.length > 0 ? categories : ['growth'];
}

function getAspectDescription(transitPlanet: string, natalPlanet: string, aspect: string, personName: string): string {
  const aspectDescriptions: Record<string, Record<string, string>> = {
    conjunction: {
      'Venus-Venus': `A powerful moment of harmony and attraction between you. Excellent for deepening connection.`,
      'Mars-Venus': `Passionate energy ignites. Great for romantic initiatives or creative collaborations.`,
      'Jupiter-Sun': `Expansion and luck surround ${personName}'s identity. Support their growth.`,
      'Saturn-Moon': `Emotional maturity is called for. A time to build lasting emotional security.`,
      default: `A significant merging of ${transitPlanet} and ${natalPlanet} energies affects your connection.`
    },
    trine: {
      'Venus-Moon': `Emotional harmony flows naturally. Excellent for heartfelt conversations.`,
      'Jupiter-Venus': `Abundance in love and partnership. A lucky period for the relationship.`,
      default: `Harmonious flow between ${transitPlanet} and ${natalPlanet} supports your bond.`
    },
    square: {
      'Mars-Mars': `Tension and competition may arise. Channel energy into shared goals.`,
      'Saturn-Venus': `Commitment is tested. Work through restrictions with patience.`,
      default: `Friction between ${transitPlanet} and ${natalPlanet} calls for conscious navigation.`
    },
    opposition: {
      default: `Awareness through contrast. ${transitPlanet} opposing ${natalPlanet} highlights relationship dynamics.`
    },
    sextile: {
      default: `Opportunity for growth as ${transitPlanet} supports ${natalPlanet} harmoniously.`
    }
  };
  
  const key = `${transitPlanet}-${natalPlanet}`;
  return aspectDescriptions[aspect]?.[key] || aspectDescriptions[aspect]?.default || 
    `${transitPlanet} ${aspect} ${personName}'s ${natalPlanet} activates relationship dynamics.`;
}

function generateTimelineEvents(
  chart1: NatalChart,
  chart2: NatalChart,
  startDate: Date,
  endDate: Date
): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const today = new Date();
  
  // Key planets for relationship transits
  const transitPlanets = ['Venus', 'Mars', 'Jupiter', 'Saturn'];
  const natalTargets = ['Sun', 'Moon', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  
  // Sample key dates (weekly check over the period)
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const sampleDays = days.filter((_, i) => i % 7 === 0); // Weekly sampling
  
  for (const checkDate of sampleDays) {
    for (const transitPlanet of transitPlanets) {
      const transitBase = chart1.planets[transitPlanet as keyof typeof chart1.planets];
      if (!transitBase) continue;
      
      const transitLon = getTransitPosition(
        transitPlanet,
        new Date(chart1.birthDate),
        checkDate,
        toAbsoluteDegree(transitBase)
      );
      
      // Check against both charts' natal positions
      for (const natalPlanet of natalTargets) {
        // Check chart1's planets
        const natal1 = chart1.planets[natalPlanet as keyof typeof chart1.planets];
        if (natal1) {
          const aspect = checkAspect(transitLon, toAbsoluteDegree(natal1));
          if (aspect && aspect.orb < 3) {
            events.push({
              date: checkDate,
              type: getEventType(aspect.type, transitPlanet),
              title: `${transitPlanet} ${aspect.type} ${chart1.name}'s ${natalPlanet}`,
              description: getAspectDescription(transitPlanet, natalPlanet, aspect.type, chart1.name),
              planets: [transitPlanet, natalPlanet],
              aspect: aspect.type,
              impact: aspect.orb < 1 ? 'high' : aspect.orb < 2 ? 'medium' : 'low',
              categories: getEventCategories(transitPlanet, natalPlanet),
              isExact: aspect.orb < 1
            });
          }
        }
        
        // Check chart2's planets
        const natal2 = chart2.planets[natalPlanet as keyof typeof chart2.planets];
        if (natal2) {
          const aspect = checkAspect(transitLon, toAbsoluteDegree(natal2));
          if (aspect && aspect.orb < 3) {
            events.push({
              date: checkDate,
              type: getEventType(aspect.type, transitPlanet),
              title: `${transitPlanet} ${aspect.type} ${chart2.name}'s ${natalPlanet}`,
              description: getAspectDescription(transitPlanet, natalPlanet, aspect.type, chart2.name),
              planets: [transitPlanet, natalPlanet],
              aspect: aspect.type,
              impact: aspect.orb < 1 ? 'high' : aspect.orb < 2 ? 'medium' : 'low',
              categories: getEventCategories(transitPlanet, natalPlanet),
              isExact: aspect.orb < 1
            });
          }
        }
      }
    }
  }
  
  // Sort by date and dedupe similar events
  return events
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .filter((event, index, arr) => {
      if (index === 0) return true;
      const prev = arr[index - 1];
      return !(
        event.title === prev.title &&
        Math.abs(event.date.getTime() - prev.date.getTime()) < 7 * 24 * 60 * 60 * 1000
      );
    });
}

function groupEventsByMonth(events: TimelineEvent[], months: number): MonthSummary[] {
  const summaries: MonthSummary[] = [];
  const today = new Date();
  
  for (let i = 0; i < months; i++) {
    const month = addMonths(today, i);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthEvents = events.filter(e => 
      e.date >= monthStart && e.date <= monthEnd
    );
    
    const opportunities = monthEvents.filter(e => e.type === 'opportunity' || e.type === 'milestone').length;
    const challenges = monthEvents.filter(e => e.type === 'challenge').length;
    
    let overallEnergy: MonthSummary['overallEnergy'] = 'mixed';
    if (opportunities > challenges * 1.5) overallEnergy = 'positive';
    else if (challenges > opportunities * 1.5) overallEnergy = 'challenging';
    
    let theme = 'A balanced month for relationship development';
    if (monthEvents.some(e => e.planets.includes('Jupiter'))) {
      theme = 'Expansion and growth opportunities abound';
    } else if (monthEvents.some(e => e.planets.includes('Saturn'))) {
      theme = 'Structure and commitment are emphasized';
    } else if (monthEvents.some(e => e.planets.includes('Venus'))) {
      theme = 'Love and harmony take center stage';
    } else if (monthEvents.some(e => e.planets.includes('Mars'))) {
      theme = 'Action and passion drive the connection';
    }
    
    summaries.push({
      month: monthStart,
      events: monthEvents,
      overallEnergy,
      theme
    });
  }
  
  return summaries;
}

const EventCard = ({ event }: { event: TimelineEvent }) => {
  const typeConfig = {
    opportunity: { icon: Star, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' },
    challenge: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    transformation: { icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    milestone: { icon: Star, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' }
  };
  
  const config = typeConfig[event.type];
  const Icon = config.icon;
  
  return (
    <div className={`p-3 rounded-lg border ${config.bg}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className={config.color} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">{event.title}</span>
              {event.isExact && (
                <Badge variant="default" className="text-[10px] px-1.5 py-0">EXACT</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{format(event.date, 'MMM d, yyyy')}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {event.impact}
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground mt-2">{event.description}</p>
      <div className="flex gap-1 mt-2">
        {event.categories.map(cat => (
          <Badge key={cat} variant="secondary" className="text-[9px] px-1.5 py-0">
            {cat === 'romantic' && '💕'}
            {cat === 'business' && '💼'}
            {cat === 'growth' && '🌱'}
            {cat === 'communication' && '💬'}
            {cat}
          </Badge>
        ))}
      </div>
    </div>
  );
};

const MonthSection = ({ summary, defaultOpen = false }: { summary: MonthSummary; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const energyConfig = {
    positive: { icon: TrendingUp, color: 'text-green-500', label: 'Favorable' },
    mixed: { icon: Minus, color: 'text-amber-500', label: 'Mixed' },
    challenging: { icon: TrendingDown, color: 'text-red-500', label: 'Challenging' }
  };
  
  const config = energyConfig[summary.overallEnergy];
  const EnergyIcon = config.icon;
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold">{format(summary.month, 'MMM')}</div>
              <div className="text-xs text-muted-foreground">{format(summary.month, 'yyyy')}</div>
            </div>
            <div className="text-left">
              <p className="text-sm font-medium">{summary.theme}</p>
              <p className="text-xs text-muted-foreground">{summary.events.length} significant transits</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <EnergyIcon size={14} className={config.color} />
              <span className={`text-xs ${config.color}`}>{config.label}</span>
            </div>
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-2">
        {summary.events.length > 0 ? (
          summary.events.map((event, i) => (
            <EventCard key={i} event={event} />
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No significant transits this month
          </p>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export function RelationshipTimelineCard({ chart1, chart2, months = 12 }: RelationshipTimelineCardProps) {
  const [showAll, setShowAll] = useState(false);
  
  const { events, monthlySummaries, upcomingHighlights } = useMemo(() => {
    const today = new Date();
    const endDate = addMonths(today, months);
    
    const events = generateTimelineEvents(chart1, chart2, today, endDate);
    const monthlySummaries = groupEventsByMonth(events, months);
    
    // Get top 5 upcoming high-impact events
    const upcomingHighlights = events
      .filter(e => e.impact === 'high' || e.isExact)
      .slice(0, 5);
    
    return { events, monthlySummaries, upcomingHighlights };
  }, [chart1, chart2, months]);
  
  const displayedMonths = showAll ? monthlySummaries : monthlySummaries.slice(0, 3);
  
  return (
    <Card className="border-2 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="text-primary" size={20} />
          Relationship Timeline
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Key transits and dates affecting {chart1.name} & {chart2.name} over the next {months} months
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upcoming Highlights */}
        {upcomingHighlights.length > 0 && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border">
            <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
              <Star className="text-primary" size={16} />
              Upcoming Highlights
            </h4>
            <div className="space-y-2">
              {upcomingHighlights.map((event, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{format(event.date, 'MMM d')}</span>
                    <span className="font-medium">{event.title}</span>
                    {event.isExact && (
                      <Badge variant="default" className="text-[9px] px-1 py-0">EXACT</Badge>
                    )}
                  </div>
                  <Badge 
                    variant={event.type === 'opportunity' || event.type === 'milestone' ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {event.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Monthly Breakdown */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Monthly Breakdown</h4>
          <ScrollArea className={showAll ? "h-[500px]" : ""}>
            <div className="space-y-3">
              {displayedMonths.map((summary, i) => (
                <MonthSection 
                  key={i} 
                  summary={summary} 
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          </ScrollArea>
          
          {monthlySummaries.length > 3 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? 'Show Less' : `Show All ${months} Months`}
            </Button>
          )}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {events.filter(e => e.type === 'opportunity' || e.type === 'milestone').length}
            </div>
            <p className="text-xs text-muted-foreground">Opportunities</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-500">
              {events.filter(e => e.type === 'challenge').length}
            </div>
            <p className="text-xs text-muted-foreground">Challenges</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {events.filter(e => e.type === 'transformation').length}
            </div>
            <p className="text-xs text-muted-foreground">Transformations</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RelationshipTimelineCard;
