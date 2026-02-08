import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { NatalChart } from '@/hooks/useNatalChart';
import { PlanetaryPositions } from '@/lib/astrology';
import { calculateTransitAspects, getTransitPlanetSymbol } from '@/lib/transitAspects';
import { getNatalPlanetHouse, getTransitPlanetHouse } from '@/lib/houseCalculations';
import { Sparkles, Heart, Zap, ChevronDown, ChevronUp, Loader2, Info } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
};

// Major planets and angles that users understand
const MAJOR_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Ascendant', 'Midheaven'
];

// Minor bodies (asteroids, nodes, etc.)
const MINOR_BODIES = [
  'NorthNode', 'SouthNode', 'Chiron', 'Ceres', 'Pallas', 'Juno', 'Vesta',
  'Lilith', 'Pholus', 'Nessus', 'Orcus', 'Ixion', 'Varuna', 'Quaoar',
  'Makemake', 'Haumea', 'Eris', 'Sedna', 'Gonggong'
];

// Descriptions for celestial bodies
const BODY_DESCRIPTIONS: Record<string, { name: string; symbol: string; meaning: string }> = {
  Sun: { name: 'Sun', symbol: '☉', meaning: 'Your core identity, ego, vitality, and life purpose. Where you shine.' },
  Moon: { name: 'Moon', symbol: '☽', meaning: 'Your emotions, instincts, comfort needs, and inner world.' },
  Mercury: { name: 'Mercury', symbol: '☿', meaning: 'How you think, communicate, learn, and process information.' },
  Venus: { name: 'Venus', symbol: '♀', meaning: 'Love, beauty, values, pleasure, and what you attract.' },
  Mars: { name: 'Mars', symbol: '♂', meaning: 'Action, drive, desire, anger, and how you assert yourself.' },
  Jupiter: { name: 'Jupiter', symbol: '♃', meaning: 'Expansion, luck, wisdom, growth, and where you find meaning.' },
  Saturn: { name: 'Saturn', symbol: '♄', meaning: 'Discipline, structure, limits, responsibility, and life lessons.' },
  Uranus: { name: 'Uranus', symbol: '♅', meaning: 'Revolution, awakening, freedom, innovation, and sudden change.' },
  Neptune: { name: 'Neptune', symbol: '♆', meaning: 'Dreams, intuition, spirituality, illusion, and transcendence.' },
  Pluto: { name: 'Pluto', symbol: '♇', meaning: 'Transformation, power, death/rebirth, and deep psychology.' },
  Ascendant: { name: 'Ascendant', symbol: 'AC', meaning: 'Your rising sign. How you appear to others and approach life.' },
  Midheaven: { name: 'Midheaven', symbol: 'MC', meaning: 'Your public image, career, reputation, and life direction.' },
  NorthNode: { name: 'North Node', symbol: '☊', meaning: 'Your soul\'s growth direction and life purpose in this lifetime.' },
  SouthNode: { name: 'South Node', symbol: '☋', meaning: 'Past life gifts and patterns. Comfort zone to move beyond.' },
  Chiron: { name: 'Chiron', symbol: '⚷', meaning: 'The Wounded Healer. Your deepest wound that becomes your gift to others.' },
  Ceres: { name: 'Ceres', symbol: '⚳', meaning: 'Nurturing, food, mothering, loss/return cycles, and self-care.' },
  Pallas: { name: 'Pallas Athena', symbol: '⚴', meaning: 'Wisdom, strategy, pattern recognition, and creative intelligence.' },
  Juno: { name: 'Juno', symbol: '⚵', meaning: 'Partnership, marriage, commitment, and what you need in a mate.' },
  Vesta: { name: 'Vesta', symbol: '⚶', meaning: 'Sacred devotion, focus, purity, and what you dedicate yourself to.' },
  Lilith: { name: 'Black Moon Lilith', symbol: '⚸', meaning: 'Your wild, untamed feminine. Shadow desires and rejection wounds.' },
  Pholus: { name: 'Pholus', symbol: '⯛', meaning: 'Small cause, big effect. Uncorking ancestral patterns. Catalyst energy.' },
  Nessus: { name: 'Nessus', symbol: '⯜', meaning: 'Abuse cycles, karma, the poison and its cure. Accountability.' },
  Orcus: { name: 'Orcus', symbol: '🜨', meaning: 'Oaths, promises, integrity. What you\'re bound to karmically.' },
  Ixion: { name: 'Ixion', symbol: '⯝', meaning: 'Lawlessness, betrayal, testing boundaries. Where we repeat mistakes.' },
  Varuna: { name: 'Varuna', symbol: '⯞', meaning: 'Fame, reputation, the all-seeing eye. Cosmic order and lies.' },
  Quaoar: { name: 'Quaoar', symbol: '🝾', meaning: 'Creation, dance, the playful origins of existence.' },
  Makemake: { name: 'Makemake', symbol: '🝻', meaning: 'Environmental awareness, fertility, connection to nature.' },
  Haumea: { name: 'Haumea', symbol: '🝼', meaning: 'Rebirth, fertility, Hawaiian creation goddess energy.' },
  Eris: { name: 'Eris', symbol: '⯙', meaning: 'Discord, awakening, the uninvited truth that disrupts.' },
  Sedna: { name: 'Sedna', symbol: '⯲', meaning: 'Deep trauma, abandonment, victimization, and transcendence.' },
  Gonggong: { name: 'Gonggong', symbol: '共', meaning: 'Chaos, climate, collective upheaval, the flood myth.' },
};

// Aspect descriptions
const ASPECT_DESCRIPTIONS: Record<string, { name: string; symbol: string; meaning: string }> = {
  conjunction: { name: 'Conjunction', symbol: '☌', meaning: 'Energies merge and intensify. Powerful blending of forces.' },
  opposition: { name: 'Opposition', symbol: '☍', meaning: 'Tension and awareness. Two forces pulling you in different directions.' },
  trine: { name: 'Trine', symbol: '△', meaning: 'Easy flow and harmony. Natural talents and gifts.' },
  square: { name: 'Square', symbol: '□', meaning: 'Friction and challenge. Growth through tension and action.' },
  sextile: { name: 'Sextile', symbol: '⚹', meaning: 'Opportunity and cooperation. Gentle support requiring effort to activate.' },
};

// Get interpretations for where Moon lands in natal houses
const getMoonInHouseInterpretation = (house: number | null): string => {
  if (!house) return '';
  const interpretations: Record<number, string> = {
    1: 'The Moon lights up your sense of self today. Your emotions are visible to others. Lead with your feelings.',
    2: 'Emotional focus on security, finances, and what you value. Good for self-care and comfort.',
    3: 'Communication is emotionally charged. Write, speak, connect with siblings or neighbors.',
    4: 'Home and family draw your attention. Nurture your roots. Privacy feels healing.',
    5: 'Creative expression and pleasure are highlighted. Romance, children, play—follow your joy.',
    6: 'Focus on daily routines and health. Emotional satisfaction comes through service.',
    7: 'Partnerships need attention. Your emotional needs are tied to others today.',
    8: 'Deep feelings surface. Transformation, intimacy, shared resources are activated.',
    9: 'Seek meaning and expansion. Travel, learning, philosophy speak to your soul.',
    10: 'Career and public image are emotionally important. Recognition matters today.',
    11: 'Friends and community fulfill you. Group activities and future visions inspire.',
    12: 'Retreat and reflection needed. Dreams are vivid. Solitude restores you.',
  };
  return interpretations[house] || '';
};

// Get Moon-to-natal-planet aspects with personalized meaning
const getMoonToNatalInterpretation = (natalPlanet: string, aspect: string, moonSign: string): string => {
  const planetMeanings: Record<string, Record<string, string>> = {
    Sun: {
      conjunction: `Your emotions and identity merge today. You feel most authentically yourself.`,
      opposition: `Full Moon energy in YOUR chart. Emotions about who you are reach a peak.`,
      trine: `Easy flow between feelings and self-expression. Confidence comes naturally.`,
      square: `Tension between what you feel and who you think you should be. Honor both.`,
      sextile: `Gentle support for being yourself. Small emotional wins today.`,
    },
    Moon: {
      conjunction: `Lunar Return! Emotional reset point. New emotional cycle begins.`,
      opposition: `Your emotional needs are highlighted through others. Reflection point.`,
      trine: `Emotions flow harmoniously. Trust your instincts.`,
      square: `Internal friction between old and current feelings. What needs adjustment?`,
      sextile: `Subtle emotional support. Intuition is reliable.`,
    },
    Ascendant: {
      conjunction: `Moon crosses your rising sign. You're emotionally visible. Others sense your mood.`,
      opposition: `Emotions focused on partnerships. Others reflect your feelings back.`,
      trine: `How you feel aligns with how you present yourself. Authentic expression.`,
      square: `Emotions may conflict with your usual persona. Inner vs outer tension.`,
      sextile: `Subtle emotional support for self-expression.`,
    },
    Mercury: {
      conjunction: `Feelings and thoughts merge. Speak from the heart.`,
      opposition: `Mind and emotions need balance. Listen before reacting.`,
      trine: `Easy emotional expression. Conversations flow.`,
      square: `Head vs heart conflict. Which wisdom serves you?`,
      sextile: `Gentle mental-emotional harmony.`,
    },
    Venus: {
      conjunction: `Love and comfort merge. Beautiful emotional day for relationships.`,
      opposition: `Relationship feelings peak. Express affection or address needs.`,
      trine: `Harmony in love. Pleasant connections flow naturally.`,
      square: `Love vs comfort tension. What do you truly need?`,
      sextile: `Sweet moments. Small pleasures bring joy.`,
    },
    Mars: {
      conjunction: `Emotions fuel action. Passionate, possibly irritable energy.`,
      opposition: `Feelings and drive may clash. Channel constructively.`,
      trine: `Emotions empower your actions. Motivated and effective.`,
      square: `Irritability possible. Breathe before reacting.`,
      sextile: `Gentle emotional motivation. Steady forward momentum.`,
    },
    Jupiter: {
      conjunction: `Emotional expansion! Joy, optimism, and generosity flow.`,
      opposition: `Big feelings. Don't overcommit based on emotion.`,
      trine: `Lucky feelings. Trust your emotional guidance.`,
      square: `Over-feeling. Where are emotions running away with you?`,
      sextile: `Optimistic mood. Emotional abundance.`,
    },
    Saturn: {
      conjunction: `Emotional maturity called for. Feel deeply but act wisely.`,
      opposition: `Responsibility weighs on emotions. Stay grounded.`,
      trine: `Stable emotions. Discipline supports feelings.`,
      square: `Emotional restriction. What feeling needs healthy boundaries?`,
      sextile: `Practical emotions. Steady inner strength.`,
    },
    Uranus: {
      conjunction: `Unexpected emotions. Embrace spontaneity.`,
      opposition: `Others may disrupt your emotional equilibrium.`,
      trine: `Exciting feelings. Fresh emotional perspectives.`,
      square: `Emotional restlessness. Freedom vs security.`,
      sextile: `Refreshing emotional insights.`,
    },
    Neptune: {
      conjunction: `Dreamy, intuitive, possibly confused. Trust your gut.`,
      opposition: `Clarity vs confusion. Ground yourself before deciding.`,
      trine: `Spiritual, creative, inspired feelings.`,
      square: `Emotional fog. Wait for clarity before action.`,
      sextile: `Gentle intuitions. Compassion deepens.`,
    },
    Pluto: {
      conjunction: `DEEP emotional power activated. Transformation possible.`,
      opposition: `Others may trigger your depths. Power dynamics surface.`,
      trine: `Emotional depth feels safe. Transform gently.`,
      square: `Power struggles with emotions. What are you controlling?`,
      sextile: `Subtle emotional healing. Insight arrives.`,
    },
    NorthNode: {
      conjunction: `Emotions align with your life path. Follow this feeling.`,
      opposition: `Old emotional patterns vs growth direction. Choose forward.`,
      trine: `Emotional support for your destiny. Trust the pull.`,
      square: `Feelings conflict with growth. What must you release?`,
      sextile: `Gentle guidance toward your purpose.`,
    },
    Chiron: {
      conjunction: `Old wounds surface for healing. Be gentle with yourself.`,
      opposition: `Others may trigger your sensitive spots. An opportunity to heal.`,
      trine: `Healing happens naturally today. Wisdom from pain.`,
      square: `Wound activated. Self-compassion is medicine.`,
      sextile: `Subtle healing energy available.`,
    },
  };
  
  return planetMeanings[natalPlanet]?.[aspect] || 
    `The Moon's current position ${aspect}s your natal ${natalPlanet}. Notice how this affects your emotional state.`;
};

// Note: getTransitPlanetHouse is imported from '@/lib/houseCalculations'

interface PersonalizedTransitsPanelProps {
  chart: NatalChart;
  transitPositions: PlanetaryPositions;
  moonSign: string;
  moonDegree: number;
  planetPositions?: Array<{ name: string; sign: string; degree: number }>;
}

export const PersonalizedTransitsPanel = ({ 
  chart, 
  transitPositions, 
  moonSign, 
  moonDegree,
  planetPositions = []
}: PersonalizedTransitsPanelProps) => {
  const [showMinorBodies, setShowMinorBodies] = useState(false);
  const [aiReading, setAiReading] = useState<string | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Build planetPositions from transitPositions if not provided
  const computedPlanetPositions = useMemo(() => {
    if (planetPositions && planetPositions.length > 0) return planetPositions;
    return Object.entries(transitPositions).map(([name, data]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      sign: data?.sign || 'Unknown',
      degree: data?.degree || 0
    }));
  }, [transitPositions, planetPositions]);

  // Calculate all transit aspects
  const transitAspects = useMemo(() => {
    return calculateTransitAspects(new Date(), transitPositions, chart);
  }, [transitPositions, chart]);

  // Priority scoring for natal planets (what we FEEL when aspected)
  const NATAL_PRIORITY: Record<string, number> = {
    Sun: 100, Moon: 98, Ascendant: 95, MC: 90, IC: 85, Descendant: 80,
    Mercury: 55, Venus: 55, Mars: 55, Jupiter: 40, Saturn: 40,
    Uranus: 30, Neptune: 30, Pluto: 30, NorthNode: 25, Chiron: 35,
    Lilith: 25, Ceres: 20, Pallas: 15, Juno: 15, Vesta: 15,
  };

  // Sort function: exact first, then by tighter orb, then by natal planet importance
  const sortByImpact = (aspects: typeof transitAspects) => {
    return [...aspects].sort((a, b) => {
      // Exact aspects always first
      if (a.isExact && !b.isExact) return -1;
      if (!a.isExact && b.isExact) return 1;
      
      // Then by natal planet priority (personal points first)
      const natalDiff = (NATAL_PRIORITY[b.natalPlanet] || 10) - (NATAL_PRIORITY[a.natalPlanet] || 10);
      if (natalDiff !== 0) return natalDiff;
      
      // Finally by orb (tighter first)
      return parseFloat(a.orb) - parseFloat(b.orb);
    });
  };

  // Filter for Moon aspects specifically - separated by major vs minor bodies
  const { majorMoonAspects, minorMoonAspects } = useMemo(() => {
    const moonAspects = transitAspects.filter(a => a.transitPlanet === 'Moon');
    return {
      majorMoonAspects: sortByImpact(moonAspects.filter(a => MAJOR_BODIES.includes(a.natalPlanet))),
      minorMoonAspects: sortByImpact(moonAspects.filter(a => MINOR_BODIES.includes(a.natalPlanet))),
    };
  }, [transitAspects]);

  // Priority for TRANSIT planets (outer = slower = more impactful)
  const TRANSIT_PRIORITY: Record<string, number> = {
    Pluto: 100, Neptune: 95, Uranus: 90, Saturn: 85, Jupiter: 75,
    Mars: 50, Sun: 40, Venus: 35, Mercury: 30, Moon: 20,
  };

  // Filter and sort other significant transits (outer planets to personal points first)
  const significantTransits = useMemo(() => {
    const filtered = transitAspects
      .filter(a => a.transitPlanet !== 'Moon' && parseFloat(a.orb) < 5);
    
    // Sort: outer planet transits to personal points first, exact first, tight orbs first
    return filtered.sort((a, b) => {
      // Exact always first
      if (a.isExact && !b.isExact) return -1;
      if (!a.isExact && b.isExact) return 1;
      
      // Transit planet priority (outer planets first)
      const transitDiff = (TRANSIT_PRIORITY[b.transitPlanet] || 15) - (TRANSIT_PRIORITY[a.transitPlanet] || 15);
      if (transitDiff !== 0) return transitDiff;
      
      // Natal planet priority (personal points first)
      const natalDiff = (NATAL_PRIORITY[b.natalPlanet] || 10) - (NATAL_PRIORITY[a.natalPlanet] || 10);
      if (natalDiff !== 0) return natalDiff;
      
      // Finally by orb (tighter first)
      return parseFloat(a.orb) - parseFloat(b.orb);
    }).slice(0, 8); // Show more since they're better prioritized now
  }, [transitAspects]);

  // Get where Moon currently falls in their houses (using actual house cusps)
  const moonHouse = useMemo(() => {
    const house = getTransitPlanetHouse(moonSign, moonDegree, chart);
    // Debug logging
    console.log('[TransitPanel] Moon house calculation:', {
      moonSign,
      moonDegree,
      calculatedHouse: house,
      hasHouseCusps: !!chart.houseCusps,
      chartName: chart.name
    });
    return house;
  }, [moonSign, moonDegree, chart]);
  const moonHouseInterpretation = getMoonInHouseInterpretation(moonHouse);

  // Generate personalized AI reading
  const generatePersonalizedReading = async () => {
    setIsLoadingAI(true);
    try {
      // Build natal chart context
      const natalPlanets = Object.entries(chart.planets)
        .filter(([_, data]) => data?.sign && data?.degree !== undefined)
        .map(([name, data]) => `${name}: ${data!.degree?.toFixed(1)}° ${data!.sign}`)
        .join('\n');

      const natalHouses = chart.houseCusps ? Object.entries(chart.houseCusps)
        .filter(([key]) => key.startsWith('house'))
        .map(([key, data]) => `${key}: ${data.sign}`)
        .join('\n') : '';

      // Detect intercepted signs and double-signed houses
      const interceptedSigns = chart.interceptedSigns || [];
      
      // Calculate double-signed houses (same sign on two consecutive house cusps)
      const doubleSignedHouses: string[] = [];
      if (chart.houseCusps) {
        const houseKeys = ['house1', 'house2', 'house3', 'house4', 'house5', 'house6', 
                          'house7', 'house8', 'house9', 'house10', 'house11', 'house12'] as const;
        const signs = houseKeys.map(k => chart.houseCusps?.[k]?.sign).filter(Boolean);
        
        // Check for repeated signs (indicating a sign rules two houses)
        const signCounts: Record<string, number[]> = {};
        signs.forEach((sign, i) => {
          if (sign) {
            if (!signCounts[sign]) signCounts[sign] = [];
            signCounts[sign].push(i + 1);
          }
        });
        
        Object.entries(signCounts).forEach(([sign, houses]) => {
          if (houses.length >= 2) {
            doubleSignedHouses.push(`${sign} rules houses ${houses.join(' and ')}`);
          }
        });
      }

      const interceptedInfo = interceptedSigns.length > 0 
        ? `INTERCEPTED SIGNS: ${interceptedSigns.join(', ')}
   - These signs are "trapped" within houses and their energy is harder to access
   - Planets in intercepted signs may feel blocked or require extra effort to express
   - Transits to intercepted areas can feel more intense when they finally activate`
        : 'INTERCEPTED SIGNS: NONE (this chart has no intercepted signs - do NOT mention interceptions)';

      const doubleSignedInfo = doubleSignedHouses.length > 0
        ? `DOUBLE-SIGNED HOUSES: ${doubleSignedHouses.join('; ')}
   - These signs have extra emphasis and influence in the chart
   - The themes of these signs are expressed across multiple life areas`
        : '';

      const moonAspectsList = majorMoonAspects.map(a => 
        `Moon ${a.aspect} natal ${a.natalPlanet} (${a.orb}° orb)`
      ).join(', ');

      const transitList = significantTransits.map(a =>
        `Transit ${a.transitPlanet} ${a.aspect} natal ${a.natalPlanet}`
      ).join(', ');

      // Check if Moon is transiting an intercepted sign in their chart
      const moonInIntercepted = interceptedSigns.includes(moonSign);

      const customPrompt = `Generate a personalized transit reading for ${chart.name}.

CRITICAL STYLE RULES:
- NO greetings, pleasantries, or flowery openings (NO "Hello", "What a lovely...", "Dear one")
- NO mystical clichés ("the universe wants", "cosmic currents", "celestial dance")
- Start IMMEDIATELY with the astrological substance
- Write like a professional astrologer giving a consultation, not a greeting card
- Be direct, specific, and psychologically insightful

THEIR NATAL CHART:
${natalPlanets}

Houses (from ${chart.houseCusps?.house1?.sign || chart.planets.Ascendant?.sign || 'unknown'} Ascendant):
${natalHouses}

${interceptedInfo}

${doubleSignedInfo}

TODAY'S PERSONAL TRANSITS:
**MOON HOUSE PLACEMENT (CALCULATED FROM THEIR EXACT HOUSE CUSPS - DO NOT OVERRIDE):**
- Moon at ${moonDegree.toFixed(1)}° ${moonSign} is in their ${moonHouse}${moonHouse === 1 ? 'ST' : moonHouse === 2 ? 'ND' : moonHouse === 3 ? 'RD' : 'TH'} HOUSE
- Their ${moonHouse}${moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'} house cusp is at ${chart.houseCusps?.house1?.degree || 0}° ${chart.houseCusps?.house1?.sign || ''} (House 1), so ${moonDegree.toFixed(0)}° ${moonSign} falls in house ${moonHouse}
${moonInIntercepted ? '- THIS IS AN INTERCEPTED SIGN IN THEIR CHART - pay special attention!' : ''}

- Moon aspects to natal planets: ${moonAspectsList || 'none major'}
- Other active transits: ${transitList || 'none significant'}

Write a reading that:
1. Opens with the most significant transit happening RIGHT NOW - no preamble
2. References SPECIFIC placements (e.g., "Your natal Venus at 14° Scorpio in the 8th...")
3. **CRITICAL**: When mentioning the Moon's house, you MUST say "${moonHouse}${moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'} house" - this is calculated from their exact house cusps. Do NOT say a different house number.
${interceptedSigns.length > 0 ? `4. If the Moon is transiting an intercepted sign, explain the unlocking/activation
5. If any natal planets are in intercepted signs, note how transits there feel more significant` : `4. DO NOT mention "intercepted" signs - this chart has NO interceptions
5. DO NOT invent or hallucinate interceptions - stick to the data provided`}
6. Interprets aspects with psychological depth - what does it FEEL like internally?
7. Gives ONE concrete, practical action or focus for the day
8. End with the takeaway, not a blessing

CRITICAL ANTI-HALLUCINATION RULES:
- The Moon is in the ${moonHouse}${moonHouse === 1 ? 'ST' : moonHouse === 2 ? 'ND' : moonHouse === 3 ? 'RD' : 'TH'} house. If you say ANY other house number, you are hallucinating.
- Only reference interceptions if INTERCEPTED SIGNS data above is non-empty. If empty, do NOT mention interceptions.
- Use ONLY the data provided. Do not infer or assume house placements.

Format with ## headers. Be chart-specific - no generic advice that could apply to anyone.`;

      const { data, error } = await supabase.functions.invoke('cosmic-weather', {
        body: {
          date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          moonPhase: 'current',
          moonSign,
          planetPositions: computedPlanetPositions,
          customPrompt,
        }
      });

      if (error) {
        console.error('Personalized reading error:', error);
        toast.error('Could not generate personalized reading');
        return;
      }

      setAiReading(data.insight);
    } catch (err) {
      console.error('Failed to generate personalized reading:', err);
      toast.error('Failed to connect to cosmic wisdom');
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Simple markdown to HTML conversion
  const formatReading = (text: string) => {
    return text
      .replace(/## (.*)/g, '<h3 class="text-lg font-semibold mt-4 mb-2 text-primary">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*)/g, '<li class="ml-4">$1</li>')
      .replace(/\n/g, '<br/>');
  };

  const renderBodyDescription = (bodyName: string) => {
    const body = BODY_DESCRIPTIONS[bodyName];
    if (!body) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-muted-foreground cursor-help inline-block ml-1" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium">{body.symbol} {body.name}</p>
            <p className="text-xs text-muted-foreground">{body.meaning}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  const renderAspectDescription = (aspectName: string) => {
    const aspect = ASPECT_DESCRIPTIONS[aspectName];
    if (!aspect) return null;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-help underline decoration-dotted">{aspect.symbol}</span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium">{aspect.symbol} {aspect.name}</p>
            <p className="text-xs text-muted-foreground">{aspect.meaning}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader className="border-b border-primary/10">
        <CardTitle className="font-serif text-xl font-light flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-primary" />
          Personalized for {chart.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          How today's cosmic energy affects your natal chart
        </p>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* AI Personalized Reading Button */}
        <div className="space-y-4">
          <Button 
            onClick={generatePersonalizedReading}
            disabled={isLoadingAI}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isLoadingAI ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Consulting the stars for {chart.name}...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Get AI Personalized Reading
              </>
            )}
          </Button>

          {/* AI Reading Display */}
          {aiReading && (
            <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
              <div 
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{ __html: formatReading(aiReading) }}
              />
            </div>
          )}
        </div>

        {/* Moon in House */}
        {moonHouse && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10">
                ☽ Moon in Your {moonHouse}
                {moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'} House
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {moonHouseInterpretation}
            </p>
            <p className="text-xs text-muted-foreground italic">
              {moonSign} is in your {moonHouse}
              {moonHouse === 1 ? 'st' : moonHouse === 2 ? 'nd' : moonHouse === 3 ? 'rd' : 'th'} house
              {(chart.houseCusps?.house1?.sign || chart.planets.Ascendant?.sign) && ` (you have ${chart.houseCusps?.house1?.sign || chart.planets.Ascendant?.sign} rising)`}
            </p>
          </div>
        )}

        {/* Major Moon Aspects to Natal Planets */}
        {majorMoonAspects.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Moon Touching Your Major Planets
            </h4>
            <div className="space-y-3">
              {majorMoonAspects.map((aspect, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-lg">☽</span>
                    <span style={{ color: aspect.color }} className="font-medium">
                      {renderAspectDescription(aspect.aspect)}
                    </span>
                    <span className="text-sm">
                      {aspect.natalPlanet}
                      {renderBodyDescription(aspect.natalPlanet)}
                    </span>
                    <Badge variant={aspect.isExact ? "default" : "outline"} className="text-xs">
                      {aspect.isExact ? 'EXACT!' : `${aspect.orb}° orb`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getMoonToNatalInterpretation(aspect.natalPlanet, aspect.aspect, moonSign)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Minor Body Moon Aspects (Collapsible) */}
        {minorMoonAspects.length > 0 && (
          <Collapsible open={showMinorBodies} onOpenChange={setShowMinorBodies}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between p-3 h-auto">
                <span className="text-sm font-medium flex items-center gap-2">
                  🌟 Moon Aspects to Asteroids & Minor Bodies ({minorMoonAspects.length})
                </span>
                {showMinorBodies ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 mt-2">
              <p className="text-xs text-muted-foreground italic px-3">
                Hover over body names and aspect symbols to learn what they mean
              </p>
              {minorMoonAspects.map((aspect, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-lg">☽</span>
                    <span style={{ color: aspect.color }} className="font-medium">
                      {renderAspectDescription(aspect.aspect)}
                    </span>
                    <span className="text-sm">
                      {BODY_DESCRIPTIONS[aspect.natalPlanet]?.name || aspect.natalPlanet}
                      {renderBodyDescription(aspect.natalPlanet)}
                    </span>
                    <Badge variant={aspect.isExact ? "default" : "outline"} className="text-xs">
                      {aspect.isExact ? 'EXACT!' : `${aspect.orb}° orb`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getMoonToNatalInterpretation(aspect.natalPlanet, aspect.aspect, moonSign)}
                  </p>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Other Significant Transits */}
        {significantTransits.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Active Transits Today
            </h4>
            <div className="space-y-2">
              {significantTransits.map((aspect, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-medium text-sm">
                      {getTransitPlanetSymbol(aspect.transitPlanet)} {aspect.transitPlanet}
                      {renderBodyDescription(aspect.transitPlanet)}
                    </span>
                    <span style={{ color: aspect.color }}>
                      {renderAspectDescription(aspect.aspect)}
                    </span>
                    <span className="text-sm">
                      your {aspect.natalPlanet}
                      {renderBodyDescription(aspect.natalPlanet)}
                    </span>
                    <Badge 
                      variant={aspect.isExact ? "destructive" : "outline"} 
                      className="text-xs"
                    >
                      {aspect.isExact ? 'EXACT!' : `${aspect.orb}°`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {aspect.detailedInterpretation?.header || aspect.interpretation}
                  </p>
                  {aspect.transitHouse && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Transit {aspect.transitPlanet} is in your {aspect.transitHouse}
                      {aspect.transitHouse === 1 ? 'st' : aspect.transitHouse === 2 ? 'nd' : aspect.transitHouse === 3 ? 'rd' : 'th'} house
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No aspects message */}
        {majorMoonAspects.length === 0 && significantTransits.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p>No major aspects to your natal planets right now.</p>
            <p className="text-sm">The cosmic energy is more general today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
