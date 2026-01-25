import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Calendar, ChevronDown, ChevronUp, Star, AlertTriangle, Heart, Briefcase, Sparkles, Clock, TrendingUp, TrendingDown, Minus, HelpCircle, BookOpen } from 'lucide-react';
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
  transitOwner: string;
  natalOwner: string;
  whyItMattersForBond: string;
  howPartnerFeels: string;
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

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇'
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌', sextile: '⚹', square: '□', trine: '△', opposition: '☍'
};

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

/**
 * Educational: Explains WHY a transit to one partner's chart matters for the relationship
 */
function getWhyItMattersForBond(
  transitPlanet: string, 
  natalPlanet: string, 
  aspect: string, 
  natalOwnerName: string,
  partnerName: string
): string {
  const aspectEnergy = {
    conjunction: 'intensifies',
    trine: 'supports and harmonizes',
    sextile: 'gently encourages',
    square: 'creates tension around',
    opposition: 'brings awareness to'
  }[aspect] || 'activates';

  const planetMeaning: Record<string, { core: string; inRelationship: string }> = {
    Venus: { 
      core: 'love, attraction, and what they value',
      inRelationship: 'how they express and receive affection'
    },
    Mars: { 
      core: 'energy, desire, and how they take action',
      inRelationship: 'their passion, drive, and how they pursue what they want'
    },
    Jupiter: { 
      core: 'growth, optimism, and expansion',
      inRelationship: 'their sense of adventure and generosity with you'
    },
    Saturn: { 
      core: 'structure, responsibility, and long-term thinking',
      inRelationship: 'their commitment level and how they handle obligations to you'
    },
    Sun: {
      core: 'core identity and vitality',
      inRelationship: 'their confidence and sense of self within the partnership'
    },
    Moon: {
      core: 'emotions, needs, and instinctive responses',
      inRelationship: 'their emotional availability and how safe they feel with you'
    },
    Mercury: {
      core: 'communication and thinking patterns',
      inRelationship: 'how they communicate with you and process the relationship'
    }
  };

  const transitPlanetInfo = planetMeaning[transitPlanet] || { core: 'various life themes', inRelationship: 'how they relate to you' };
  const natalPlanetInfo = planetMeaning[natalPlanet] || { core: 'personal expression', inRelationship: 'their way of being' };

  // Build the educational explanation
  return `**Why this affects your bond:** Transiting ${transitPlanet} (${PLANET_SYMBOLS[transitPlanet]}) represents ${transitPlanetInfo.core} moving through the sky right now. When it ${aspectEnergy} ${natalOwnerName}'s natal ${natalPlanet} (${PLANET_SYMBOLS[natalPlanet]}), it activates ${natalPlanetInfo.inRelationship}. Even though this transit is "happening to" ${natalOwnerName}, you'll feel it too because ${natalOwnerName}'s ${natalPlanet.toLowerCase()} energy is part of how they show up in your relationship.`;
}

/**
 * Educational: Explains how the partner who's NOT receiving the transit might feel
 */
function getHowPartnerFeels(
  transitPlanet: string,
  natalPlanet: string,
  aspect: string,
  natalOwnerName: string,
  partnerName: string
): string {
  const isHarmonic = ['trine', 'sextile', 'conjunction'].includes(aspect);
  
  const scenarios: Record<string, { harmonic: string; tense: string }> = {
    'Venus-Sun': {
      harmonic: `${partnerName}, you may notice ${natalOwnerName} seems more radiant, attractive, or romantically inclined. They might initiate more affection or want quality time together.`,
      tense: `${partnerName}, ${natalOwnerName} might seem preoccupied with feeling appreciated or attractive. They may need extra validation from you during this time.`
    },
    'Venus-Moon': {
      harmonic: `${partnerName}, ${natalOwnerName} is likely feeling emotionally open and affectionate. This is a great time to connect on a deeper emotional level.`,
      tense: `${partnerName}, ${natalOwnerName}'s emotional needs around love may feel heightened. Be patient if they seem more sensitive than usual.`
    },
    'Venus-Venus': {
      harmonic: `${partnerName}, ${natalOwnerName} is experiencing a peak in their capacity for love and beauty. They may want to do romantic things together or beautify shared spaces.`,
      tense: `${partnerName}, ${natalOwnerName} may be questioning what they value in relationships. Be open to conversations about what you both want.`
    },
    'Venus-Mars': {
      harmonic: `${partnerName}, expect increased passion from ${natalOwnerName}. This transit ignites their desire and attraction—they may initiate romance.`,
      tense: `${partnerName}, there may be some push-pull between ${natalOwnerName}'s desire for harmony and their assertive side. Give them space to work through it.`
    },
    'Saturn-Sun': {
      harmonic: `${partnerName}, ${natalOwnerName} may feel more grounded and ready to make serious commitments. They might want to discuss the future.`,
      tense: `${partnerName}, ${natalOwnerName} may feel burdened by responsibilities or question their path. They need your support, not pressure.`
    },
    'Saturn-Moon': {
      harmonic: `${partnerName}, ${natalOwnerName} is processing emotions maturely. They may want to create more stability in your home or emotional life together.`,
      tense: `${partnerName}, ${natalOwnerName} might feel emotionally restricted or cold. This isn't about you—Saturn is teaching them emotional resilience.`
    },
    'Saturn-Venus': {
      harmonic: `${partnerName}, ${natalOwnerName} is taking love seriously. They may want to formalize or deepen your commitment.`,
      tense: `${partnerName}, ${natalOwnerName} might feel unappreciated or doubt whether love is enough. Reassure them without being clingy.`
    },
    'Saturn-Mars': {
      harmonic: `${partnerName}, ${natalOwnerName}'s actions are disciplined and focused. Great time for tackling long-term projects together.`,
      tense: `${partnerName}, ${natalOwnerName} may feel frustrated or blocked in taking action. Avoid adding pressure—let them work through it.`
    },
    'Jupiter-Sun': {
      harmonic: `${partnerName}, ${natalOwnerName} is radiating confidence and optimism! They may want to expand horizons together—say yes to adventures.`,
      tense: `${partnerName}, ${natalOwnerName} might feel restless or overextend. Help them channel this growth energy constructively.`
    },
    'Jupiter-Venus': {
      harmonic: `${partnerName}, ${natalOwnerName} is feeling generous and romantic. Expect gifts, grand gestures, or desires to celebrate your love.`,
      tense: `${partnerName}, ${natalOwnerName} may overindulge in pleasure or spending. Gently help them stay balanced.`
    },
    'Jupiter-Moon': {
      harmonic: `${partnerName}, ${natalOwnerName} is emotionally expansive and nurturing. They may want to grow your home life or family together.`,
      tense: `${partnerName}, ${natalOwnerName}'s emotions may feel bigger than usual. Give them space to process without taking it personally.`
    },
    'Jupiter-Mars': {
      harmonic: `${partnerName}, ${natalOwnerName} is fired up with enthusiasm and ambition. Great time for starting new projects together.`,
      tense: `${partnerName}, ${natalOwnerName} may be impulsive or overly aggressive in pursuing goals. Encourage patience.`
    },
    'Mars-Venus': {
      harmonic: `${partnerName}, passion is ignited in ${natalOwnerName}. They may pursue you more actively or want to reignite chemistry.`,
      tense: `${partnerName}, ${natalOwnerName}'s desire may feel intense or impatient. Clear communication about pace helps.`
    },
    'Mars-Mars': {
      harmonic: `${partnerName}, ${natalOwnerName}'s drive and energy are amplified. Great for tackling projects together or active dates.`,
      tense: `${partnerName}, ${natalOwnerName} may seem more competitive or argumentative. Pick your battles wisely.`
    },
    'Mars-Sun': {
      harmonic: `${partnerName}, ${natalOwnerName} feels energized and assertive. They may take charge in positive ways.`,
      tense: `${partnerName}, ${natalOwnerName}'s ego may be activated. Avoid power struggles—let minor things go.`
    },
    'Mars-Moon': {
      harmonic: `${partnerName}, ${natalOwnerName} is emotionally passionate. They may be more expressive about their feelings for you.`,
      tense: `${partnerName}, ${natalOwnerName}'s emotions may be reactive. If they seem irritable, give space rather than engage.`
    },
    // Neptune aspects (dreamy, spiritual, potentially confusing)
    'Neptune-Venus': {
      harmonic: `${partnerName}, ${natalOwnerName} is experiencing a wave of romantic idealism. They may see you through rose-colored glasses—enjoy it, but stay grounded.`,
      tense: `${partnerName}, ${natalOwnerName} may be confused about love or feel disillusioned. Don't take it personally—Neptune fogs the heart temporarily.`
    },
    'Neptune-Sun': {
      harmonic: `${partnerName}, ${natalOwnerName} is in a creative, dreamy state. They may want to share spiritual or artistic experiences with you.`,
      tense: `${partnerName}, ${natalOwnerName} may feel lost or unclear about their identity. Be a steady presence without trying to "fix" them.`
    },
    'Neptune-Moon': {
      harmonic: `${partnerName}, ${natalOwnerName}'s intuition and empathy are heightened. They may feel deeply connected to you on a soul level.`,
      tense: `${partnerName}, ${natalOwnerName}'s emotions may be foggy or overwhelming. Encourage grounding activities like walks in nature.`
    },
    'Neptune-Mars': {
      harmonic: `${partnerName}, ${natalOwnerName}'s actions are inspired by idealism. They may want to do something meaningful together.`,
      tense: `${partnerName}, ${natalOwnerName} may lack motivation or feel directionless. Patience is key—don't push.`
    },
    // Uranus aspects (sudden, liberating, unpredictable)
    'Uranus-Venus': {
      harmonic: `${partnerName}, ${natalOwnerName} craves excitement in love. Spontaneous dates or trying something new together will thrill them.`,
      tense: `${partnerName}, ${natalOwnerName} may feel restless in routine. Give them space for independence—it strengthens the bond.`
    },
    'Uranus-Sun': {
      harmonic: `${partnerName}, ${natalOwnerName} is feeling free-spirited and innovative. Support their unique ideas and personal growth.`,
      tense: `${partnerName}, ${natalOwnerName} may be unpredictable or rebellious. This is about their need for authenticity, not rejection of you.`
    },
    'Uranus-Moon': {
      harmonic: `${partnerName}, ${natalOwnerName}'s emotional life is awakening in new ways. They may share unconventional feelings or insights.`,
      tense: `${partnerName}, ${natalOwnerName}'s moods may be erratic. Offer stability without trying to control their emotional process.`
    },
    'Uranus-Mars': {
      harmonic: `${partnerName}, ${natalOwnerName} is ready for bold action and innovation. Great time for exciting new ventures together.`,
      tense: `${partnerName}, ${natalOwnerName} may be impulsive or accident-prone. Encourage thoughtful action without dampening their spirit.`
    },
    // Pluto aspects (deep, transformative, intense)
    'Pluto-Venus': {
      harmonic: `${partnerName}, ${natalOwnerName} is experiencing profound love transformation. Your bond may deepen significantly.`,
      tense: `${partnerName}, ${natalOwnerName} may be processing intense feelings about love, possibly including jealousy or control issues. Be patient and honest.`
    },
    'Pluto-Sun': {
      harmonic: `${partnerName}, ${natalOwnerName} is stepping into their power. They may become more confident and magnetic.`,
      tense: `${partnerName}, ${natalOwnerName} may be going through ego death and rebirth. Support their transformation without taking it personally.`
    },
    'Pluto-Moon': {
      harmonic: `${partnerName}, ${natalOwnerName} is accessing deep emotional truth. Profound intimacy is possible now.`,
      tense: `${partnerName}, ${natalOwnerName} may be processing intense emotions, possibly related to the past. Hold space without fixing.`
    },
    'Pluto-Mars': {
      harmonic: `${partnerName}, ${natalOwnerName}'s willpower is supercharged. Great for accomplishing major goals together.`,
      tense: `${partnerName}, ${natalOwnerName} may be confronting power issues. Avoid power struggles—let them process their inner battle.`
    }
  };

  const key = `${transitPlanet}-${natalPlanet}`;
  const scenario = scenarios[key];
  
  if (scenario) {
    return isHarmonic ? scenario.harmonic : scenario.tense;
  }

  // Generic fallback
  if (isHarmonic) {
    return `${partnerName}, you may notice positive changes in how ${natalOwnerName} expresses their ${natalPlanet.toLowerCase()} energy. Be receptive to these shifts.`;
  } else {
    return `${partnerName}, ${natalOwnerName} may be working through challenges related to their ${natalPlanet.toLowerCase()} expression. Patience and understanding help.`;
  }
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
              title: `${PLANET_SYMBOLS[transitPlanet]} ${ASPECT_SYMBOLS[aspect.type]} ${chart1.name}'s ${PLANET_SYMBOLS[natalPlanet]}`,
              description: getAspectDescription(transitPlanet, natalPlanet, aspect.type, chart1.name),
              planets: [transitPlanet, natalPlanet],
              aspect: aspect.type,
              impact: aspect.orb < 1 ? 'high' : aspect.orb < 2 ? 'medium' : 'low',
              categories: getEventCategories(transitPlanet, natalPlanet),
              isExact: aspect.orb < 1,
              transitOwner: 'sky',
              natalOwner: chart1.name,
              whyItMattersForBond: getWhyItMattersForBond(transitPlanet, natalPlanet, aspect.type, chart1.name, chart2.name),
              howPartnerFeels: getHowPartnerFeels(transitPlanet, natalPlanet, aspect.type, chart1.name, chart2.name)
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
              title: `${PLANET_SYMBOLS[transitPlanet]} ${ASPECT_SYMBOLS[aspect.type]} ${chart2.name}'s ${PLANET_SYMBOLS[natalPlanet]}`,
              description: getAspectDescription(transitPlanet, natalPlanet, aspect.type, chart2.name),
              planets: [transitPlanet, natalPlanet],
              aspect: aspect.type,
              impact: aspect.orb < 1 ? 'high' : aspect.orb < 2 ? 'medium' : 'low',
              categories: getEventCategories(transitPlanet, natalPlanet),
              isExact: aspect.orb < 1,
              transitOwner: 'sky',
              natalOwner: chart2.name,
              whyItMattersForBond: getWhyItMattersForBond(transitPlanet, natalPlanet, aspect.type, chart2.name, chart1.name),
              howPartnerFeels: getHowPartnerFeels(transitPlanet, natalPlanet, aspect.type, chart2.name, chart1.name)
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

const EventCard = ({ event, chart1Name, chart2Name }: { event: TimelineEvent; chart1Name: string; chart2Name: string }) => {
  const [showDetails, setShowDetails] = useState(false);
  
  const typeConfig = {
    opportunity: { icon: Star, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Supportive Energy' },
    challenge: { icon: AlertTriangle, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Growth Opportunity' },
    transformation: { icon: Sparkles, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30', label: 'Deep Change' },
    milestone: { icon: Star, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Significant Moment' }
  };
  
  const config = typeConfig[event.type];
  const Icon = config.icon;

  // Get the other partner's name
  const partnerName = event.natalOwner === chart1Name ? chart2Name : chart1Name;
  
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
            <p className="text-xs text-muted-foreground">
              {format(event.date, 'MMM d, yyyy')} • Transiting {event.planets[0]} → {event.natalOwner}'s {event.planets[1]}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-[10px]">
          {config.label}
        </Badge>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">{event.description}</p>
      
      <div className="flex gap-1 mt-2 flex-wrap">
        {event.categories.map(cat => (
          <Badge key={cat} variant="secondary" className="text-[9px] px-1.5 py-0">
            {cat === 'romantic' && '💕'}
            {cat === 'business' && '💼'}
            {cat === 'growth' && '🌱'}
            {cat === 'communication' && '💬'}
            {cat}
          </Badge>
        ))}
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[10px] h-5 px-2 ml-auto"
          onClick={() => setShowDetails(!showDetails)}
        >
          <BookOpen size={10} className="mr-1" />
          {showDetails ? 'Hide' : 'Learn More'}
        </Button>
      </div>

      {showDetails && (
        <div className="mt-3 pt-3 border-t border-border space-y-3">
          {/* Educational: Why this transit matters for the bond */}
          <div className="p-2 rounded bg-background/50">
            <h5 className="text-xs font-medium flex items-center gap-1 mb-1">
              <HelpCircle size={12} className="text-primary" />
              How Does This Affect Your Relationship?
            </h5>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
              {event.whyItMattersForBond.replace(/\*\*(.*?)\*\*/g, '$1')}
            </p>
          </div>

          {/* Educational: How the partner feels */}
          <div className="p-2 rounded bg-background/50">
            <h5 className="text-xs font-medium flex items-center gap-1 mb-1">
              <Heart size={12} className="text-primary" />
              What {partnerName} Might Experience
            </h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {event.howPartnerFeels}
            </p>
          </div>

          {/* Symbol Legend */}
          <div className="p-2 rounded bg-secondary/30 text-[10px] text-muted-foreground">
            <span className="font-medium">Reading the symbols:</span> {PLANET_SYMBOLS[event.planets[0]]} = {event.planets[0]} (transiting in the sky) {ASPECT_SYMBOLS[event.aspect]} = {event.aspect} (angle type) {PLANET_SYMBOLS[event.planets[1]]} = {event.natalOwner}'s natal {event.planets[1]}
          </div>
        </div>
      )}
    </div>
  );
};

const MonthSection = ({ summary, defaultOpen = false, chart1Name, chart2Name }: { summary: MonthSummary; defaultOpen?: boolean; chart1Name: string; chart2Name: string }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  const energyConfig = {
    positive: { icon: TrendingUp, color: 'text-green-600 dark:text-green-400', label: 'Favorable' },
    mixed: { icon: Minus, color: 'text-amber-600 dark:text-amber-400', label: 'Mixed' },
    challenging: { icon: TrendingDown, color: 'text-destructive', label: 'Challenging' }
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
            <EventCard key={i} event={event} chart1Name={chart1Name} chart2Name={chart2Name} />
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
        
        {/* Educational Context */}
        <div className="p-4 rounded-xl bg-secondary/30 border">
          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
            <HelpCircle className="text-primary" size={16} />
            Understanding Relationship Transits
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>What are "transiting" planets?</strong> Planets are always moving through the zodiac. 
            When a transiting planet (like ♀ Venus in the sky today) forms an angle (aspect) to one of your natal planets, 
            it temporarily "activates" that part of your chart.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            <strong>Why do {chart2.name}'s transits matter to {chart1.name}?</strong> In a relationship, 
            when {chart2.name} experiences a transit, their energy shifts—and you feel it! If Venus trines {chart2.name}'s Sun, 
            {chart2.name} feels more attractive, loving, and radiant. {chart1.name} benefits from that energy even though the transit 
            isn't "happening to" {chart1.name} directly.
          </p>
        </div>

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
                  chart1Name={chart1.name}
                  chart2Name={chart2.name}
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
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {events.filter(e => e.type === 'opportunity' || e.type === 'milestone').length}
            </div>
            <p className="text-xs text-muted-foreground">Opportunities</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {events.filter(e => e.type === 'challenge').length}
            </div>
            <p className="text-xs text-muted-foreground">Challenges</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
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
