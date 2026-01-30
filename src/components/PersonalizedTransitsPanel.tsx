import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NatalChart } from '@/hooks/useNatalChart';
import { PlanetaryPositions } from '@/lib/astrology';
import { calculateTransitAspects, getTransitPlanetSymbol } from '@/lib/transitAspects';
import { Sparkles, Heart, Zap } from 'lucide-react';

const ZODIAC_SYMBOLS: Record<string, string> = {
  Aries: "♈", Taurus: "♉", Gemini: "♊", Cancer: "♋",
  Leo: "♌", Virgo: "♍", Libra: "♎", Scorpio: "♏",
  Sagittarius: "♐", Capricorn: "♑", Aquarius: "♒", Pisces: "♓"
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

// Get where a sign falls in the natal chart
const getSignHouse = (sign: string, chart: NatalChart): number | null => {
  if (!chart.houseCusps?.house1?.sign) return null;
  
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  const ascSign = chart.planets.Ascendant?.sign;
  if (!ascSign) return null;
  
  const ascIndex = signs.indexOf(ascSign);
  const targetIndex = signs.indexOf(sign);
  if (ascIndex === -1 || targetIndex === -1) return null;
  
  // Whole sign house: count from Ascendant sign
  let house = ((targetIndex - ascIndex + 12) % 12) + 1;
  return house;
};

interface PersonalizedTransitsPanelProps {
  chart: NatalChart;
  transitPositions: PlanetaryPositions;
  moonSign: string;
  moonDegree: number;
}

export const PersonalizedTransitsPanel = ({ 
  chart, 
  transitPositions, 
  moonSign, 
  moonDegree 
}: PersonalizedTransitsPanelProps) => {
  // Calculate all transit aspects
  const transitAspects = useMemo(() => {
    return calculateTransitAspects(new Date(), transitPositions, chart);
  }, [transitPositions, chart]);

  // Filter for Moon aspects specifically
  const moonAspects = useMemo(() => {
    return transitAspects.filter(a => a.transitPlanet === 'Moon');
  }, [transitAspects]);

  // Filter for other significant transits (exact or tight orb)
  const significantTransits = useMemo(() => {
    return transitAspects
      .filter(a => a.transitPlanet !== 'Moon' && parseFloat(a.orb) < 3)
      .slice(0, 5);
  }, [transitAspects]);

  // Get where Moon currently falls in their houses
  const moonHouse = getSignHouse(moonSign, chart);
  const moonHouseInterpretation = getMoonInHouseInterpretation(moonHouse);

  // Get where the current Moon sign is in their chart
  const moonSignHouse = getSignHouse(moonSign, chart);

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
              {chart.planets.Ascendant?.sign && ` (you have ${chart.planets.Ascendant.sign} rising)`}
            </p>
          </div>
        )}

        {/* Moon Aspects to Natal Planets */}
        {moonAspects.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Moon Touching Your Planets
            </h4>
            <div className="space-y-3">
              {moonAspects.slice(0, 4).map((aspect, i) => (
                <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">☽</span>
                    <span style={{ color: aspect.color }} className="font-medium">
                      {aspect.symbol}
                    </span>
                    <span className="text-sm">
                      {aspect.natalPlanet}
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
                    </span>
                    <span style={{ color: aspect.color }}>
                      {aspect.symbol}
                    </span>
                    <span className="text-sm">
                      your {aspect.natalPlanet}
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
        {moonAspects.length === 0 && significantTransits.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <p>No major aspects to your natal planets right now.</p>
            <p className="text-sm">The cosmic energy is more general today.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
