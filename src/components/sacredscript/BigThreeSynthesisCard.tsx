// BigThreeSynthesisCard - Unified display of Sun, Moon, Rising with aligned boxes
// Shows decan, degree, house for each placement plus a final synthesis paragraph

import { Sun, Moon, Star, Sunrise, Sunset, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NatalChart } from '@/hooks/useNatalChart';
import { getDecan, Decan } from '@/lib/decans';
import { getSabianSymbol } from '@/lib/sabianSymbols';
import { getPlanetHouse } from '@/lib/sacredScriptHelpers';

interface BigThreeSynthesisCardProps {
  natalChart: NatalChart;
}

interface PlacementDetail {
  planet: 'Sun' | 'Moon' | 'Rising';
  sign: string;
  degree: number;
  decan: Decan;
  house: number | null;
  sabianSymbol: { symbol: string; meaning: string } | null;
}

// Get sign ruler symbol
const getSignRulerSymbol = (sign: string): { ruler: string; symbol: string } => {
  const rulers: Record<string, { ruler: string; symbol: string }> = {
    Aries: { ruler: 'Mars', symbol: '♂' },
    Taurus: { ruler: 'Venus', symbol: '♀' },
    Gemini: { ruler: 'Mercury', symbol: '☿' },
    Cancer: { ruler: 'Moon', symbol: '☽' },
    Leo: { ruler: 'Sun', symbol: '☉' },
    Virgo: { ruler: 'Mercury', symbol: '☿' },
    Libra: { ruler: 'Venus', symbol: '♀' },
    Scorpio: { ruler: 'Pluto', symbol: '♇' },
    Sagittarius: { ruler: 'Jupiter', symbol: '♃' },
    Capricorn: { ruler: 'Saturn', symbol: '♄' },
    Aquarius: { ruler: 'Uranus', symbol: '♅' },
    Pisces: { ruler: 'Neptune', symbol: '♆' },
  };
  return rulers[sign] || { ruler: 'Unknown', symbol: '?' };
};

// Determine if chart is day or night based on Sun position
const getSect = (natalChart: NatalChart): { isNightChart: boolean; description: string } => {
  const sunHouse = getPlanetHouse(natalChart, 'Sun');
  
  // Houses 7-12 are above the horizon = day chart
  // Houses 1-6 are below the horizon = night chart
  // But there's nuance: Sun in 1st but not yet risen = night chart
  
  if (!sunHouse) return { isNightChart: false, description: 'Day Chart (Sun position unknown)' };
  
  // Simple approach: Houses 1-6 = below horizon = night chart
  // Houses 7-12 = above horizon = day chart
  const isNightChart = sunHouse >= 1 && sunHouse <= 6;
  
  // More refined: Sun in 1st house close to ASC degree could still be night
  // For now use simpler model
  
  return {
    isNightChart,
    description: isNightChart 
      ? 'Night Chart (Sun below horizon)' 
      : 'Day Chart (Sun above horizon)',
  };
};

// House meaning summaries
const HOUSE_MEANINGS: Record<number, string> = {
  1: 'Self, Identity, Physical Presence',
  2: 'Resources, Values, Self-Worth',
  3: 'Communication, Learning, Siblings',
  4: 'Home, Family, Roots, Private Life',
  5: 'Creativity, Joy, Romance, Children',
  6: 'Work, Health, Service, Daily Routine',
  7: 'Partnership, Relationships, Others',
  8: 'Transformation, Shared Resources, Depth',
  9: 'Philosophy, Travel, Higher Learning',
  10: 'Career, Public Life, Reputation',
  11: 'Community, Friends, Hopes, Groups',
  12: 'Spirituality, Unconscious, Retreat',
};

// Generate the unified synthesis paragraph
const generateUnifiedSynthesis = (
  natalChart: NatalChart,
  sun: PlacementDetail,
  moon: PlacementDetail,
  rising: PlacementDetail,
  sect: { isNightChart: boolean }
): string => {
  const signRuler = getSignRulerSymbol(sun.sign);
  
  // Check for triple sign
  const isTripleSign = sun.sign === moon.sign && moon.sign === rising.sign;
  
  // Build synthesis based on specific configuration
  let synthesis = '';
  
  if (isTripleSign && sun.sign === 'Libra') {
    // Special case: Triple Libra with decan nuances
    const sunDecanRuler = sun.decan.ruler;
    const moonDecanRuler = moon.decan.ruler;
    const risingDecanRuler = rising.decan.ruler;
    
    synthesis = `You are Triple Libra—a unified field of Venusian energy seeking balance, beauty, and partnership in every domain. `;
    
    // Decan rulers add texture
    const decanRulers = [sunDecanRuler, moonDecanRuler, risingDecanRuler];
    const uniqueDecanRulers = [...new Set(decanRulers)];
    
    if (uniqueDecanRulers.includes('Mercury')) {
      synthesis += `But your ${decanRulers.filter(r => r === 'Mercury').length > 1 ? 'core decans are' : sun.decan.ruler === 'Mercury' ? 'Sun decan is' : moon.decan.ruler === 'Mercury' ? 'Moon decan is' : 'Rising decan is'} ruled by Mercury, which adds a different flavor to your Libra expression. `;
      synthesis += `Mercury brings the Gemini quality into your Air sign—quick thinking, curiosity, restlessness, and the need to communicate and analyze rather than just harmonize. `;
      synthesis += `Where pure Venus-Libra wants to create beauty and peace through relating, Mercury-ruled Libra needs to *understand* the balance, to *articulate* the fairness, to *learn* through partnership. `;
      synthesis += `This is why you may feel less like "the diplomat in elegant attire" and more like the curious observer who sees all sides but struggles to land on one. `;
    }
    
    if (uniqueDecanRulers.includes('Saturn') || uniqueDecanRulers.includes('Uranus')) {
      synthesis += `The Aquarian decan energy (Saturn/Uranus) brings detachment and idealism—you may relate better to humanity as a concept than to individuals in practice. `;
    }
    
    // Night chart interpretation for 1st house Sun
    if (sect.isNightChart && sun.house === 1) {
      synthesis += `\n\nNow, here's the paradox you feel: Your Sun is in the 1st house—the house of self, visibility, personal presence. Traditionally, this is the placement of someone who IS meant to be seen, who shines through being themselves. `;
      synthesis += `But you were born before sunrise, making this a Night Chart. In night charts, the Moon is the luminary "in charge," and the Sun operates more quietly—still powerful, but not in its most visible mode. `;
      synthesis += `Chris Brennan and the Hellenistic tradition describe this as the Sun being "below the horizon"—your light exists, but it's working underground, internally, through the depths rather than through public display. `;
      synthesis += `So you have this tension: 1st house Sun says "be seen" but Night Chart Sun says "your power is behind the scenes." `;
      synthesis += `The result? You may feel exposed when you're visible, preferring to work through influence rather than spotlight. `;
      synthesis += `Your gifts emerge in intimate settings, one-on-one conversations, written words rather than public speeches. `;
      synthesis += `You're not meant to hide forever—that 1st house Sun WILL eventually demand expression—but your path to visibility is gradual, earned, and often happens when you're not trying. `;
    } else if (sun.house === 1) {
      synthesis += `\n\nYour Sun in the 1st house means your very existence is your purpose—you are meant to be seen. In a day chart, this is classic "leader" energy: naturally visible, naturally commanding attention. `;
    }
    
    synthesis += `\n\nThe Mercury decan gives you intellectual Libra rather than purely aesthetic Libra. You're the lawyer who understands both sides, the writer who articulates fairness, the networker who connects ideas. `;
    synthesis += `Traditional astrologers like Demetra George note that Mercury-influenced Libra has a "nervous system calibrated to the collective"—you pick up on social currents, power dynamics, and unspoken tensions. This isn't the peaceful Libra stereotype; it's the Libra who can't stop analyzing until they understand the whole equation.`;
  } else {
    // General synthesis for non-triple or other triples
    synthesis = `Your ${sun.sign} Sun in the ${sun.decan.number === 1 ? 'first' : sun.decan.number === 2 ? 'second' : 'third'} decan is colored by ${sun.decan.ruler}, which adds ${sun.decan.ruler === signRuler.ruler ? 'pure, undiluted' : 'a distinct flavor of'} ${sun.decan.ruler} energy to your core identity. `;
    
    if (sun.house) {
      synthesis += `Placed in the ${sun.house}${sun.house === 1 ? 'st' : sun.house === 2 ? 'nd' : sun.house === 3 ? 'rd' : 'th'} house, your identity expresses through ${HOUSE_MEANINGS[sun.house]?.toLowerCase()}. `;
    }
    
    // Add Moon synthesis
    synthesis += `\n\nYour ${moon.sign} Moon in the ${moon.decan.number === 1 ? 'first' : moon.decan.number === 2 ? 'second' : 'third'} decan draws on ${moon.decan.ruler}'s influence for emotional processing. `;
    if (moon.house) {
      synthesis += `In house ${moon.house}, you find emotional security through ${HOUSE_MEANINGS[moon.house]?.toLowerCase()}. `;
    }
    
    // Add Rising synthesis
    synthesis += `\n\nYour ${rising.sign} Rising (${rising.decan.ruler} decan) determines how others first experience you—the mask that eventually becomes the face. `;
    
    // Sect interpretation
    if (sect.isNightChart) {
      synthesis += `\n\nAs a Night Chart native, your Moon is the "chart lord"—your emotional, intuitive, receptive nature is emphasized over the solar, will-driven self. `;
      synthesis += `You may feel more at home in your Moon sign than your Sun sign. Your gifts emerge in darkness, in reflection, in the interior world. `;
    }
  }
  
  return synthesis;
};

export const BigThreeSynthesisCard = ({ natalChart }: BigThreeSynthesisCardProps) => {
  const sunPos = natalChart.planets.Sun;
  const moonPos = natalChart.planets.Moon;
  const risingSign = natalChart.houseCusps?.house1?.sign || natalChart.planets.Ascendant?.sign;
  const risingDegree = natalChart.houseCusps?.house1?.degree ?? natalChart.planets.Ascendant?.degree ?? 0;
  
  if (!sunPos?.sign || !moonPos?.sign || !risingSign) return null;
  
  const sect = getSect(natalChart);
  
  const sun: PlacementDetail = {
    planet: 'Sun',
    sign: sunPos.sign,
    degree: sunPos.degree,
    decan: getDecan(sunPos.degree, sunPos.sign),
    house: getPlanetHouse(natalChart, 'Sun'),
    sabianSymbol: getSabianSymbol(sunPos.degree, sunPos.sign),
  };
  
  const moon: PlacementDetail = {
    planet: 'Moon',
    sign: moonPos.sign,
    degree: moonPos.degree,
    decan: getDecan(moonPos.degree, moonPos.sign),
    house: getPlanetHouse(natalChart, 'Moon'),
    sabianSymbol: getSabianSymbol(moonPos.degree, moonPos.sign),
  };
  
  const rising: PlacementDetail = {
    planet: 'Rising',
    sign: risingSign,
    degree: risingDegree,
    decan: getDecan(risingDegree, risingSign),
    house: 1, // Rising is always house 1
    sabianSymbol: getSabianSymbol(risingDegree, risingSign),
  };
  
  const synthesis = generateUnifiedSynthesis(natalChart, sun, moon, rising, sect);
  
  const PlacementBox = ({ detail, color, icon: Icon }: { detail: PlacementDetail; color: string; icon: typeof Sun }) => {
    const signRuler = getSignRulerSymbol(detail.sign);
    
    return (
      <div className={`${color} rounded-lg p-4 space-y-3`}>
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-current/10 pb-2">
          <Icon size={20} />
          <span className="font-serif text-lg font-medium">
            {detail.planet === 'Rising' ? 'Rising' : detail.planet} in {detail.sign}
          </span>
          <span className="text-xs text-muted-foreground ml-auto">
            {detail.degree.toFixed(1)}°
          </span>
        </div>
        
        {/* Grid of info boxes */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Sign Ruler */}
          <div className="bg-background/40 rounded p-2">
            <div className="text-muted-foreground mb-0.5">Sign Ruler</div>
            <div className="font-medium">{signRuler.symbol} {signRuler.ruler}</div>
          </div>
          
          {/* Decan Ruler */}
          <div className="bg-background/40 rounded p-2">
            <div className="text-muted-foreground mb-0.5">Decan Ruler</div>
            <div className="font-medium">{detail.decan.rulerSymbol} {detail.decan.ruler}</div>
          </div>
          
          {/* Degree Range */}
          <div className="bg-background/40 rounded p-2">
            <div className="text-muted-foreground mb-0.5">Decan</div>
            <div className="font-medium">{detail.decan.number === 1 ? '1st' : detail.decan.number === 2 ? '2nd' : '3rd'} ({detail.decan.degrees})</div>
          </div>
          
          {/* House */}
          <div className="bg-background/40 rounded p-2">
            <div className="text-muted-foreground mb-0.5">House</div>
            <div className="font-medium">{detail.house || '—'}</div>
          </div>
        </div>
        
        {/* Decan Description */}
        <div className="text-xs bg-background/30 rounded p-2 leading-relaxed">
          <span className="font-medium">Decan Energy: </span>
          {detail.decan.description}
        </div>
        
        {/* Sabian Symbol */}
        {detail.sabianSymbol && (
          <div className="text-xs bg-background/20 rounded p-2">
            <div className="font-medium text-muted-foreground mb-1">Sabian Symbol ({Math.ceil(detail.degree)}° {detail.sign})</div>
            <div className="italic">"{detail.sabianSymbol.symbol}"</div>
            <div className="text-muted-foreground mt-1">{detail.sabianSymbol.meaning}</div>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-orange-50/30 dark:from-amber-950/30 dark:to-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-serif">
          <Sparkles className="text-amber-500" size={20} />
          The Big Three — Complete Picture
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {sect.isNightChart ? (
            <Sunset className="text-indigo-500" size={16} />
          ) : (
            <Sunrise className="text-amber-500" size={16} />
          )}
          <span>{sect.description}</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Three placement boxes side by side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PlacementBox 
            detail={sun} 
            color="bg-orange-100 dark:bg-orange-900/40" 
            icon={Sun}
          />
          <PlacementBox 
            detail={moon} 
            color="bg-teal-100 dark:bg-teal-900/40" 
            icon={Moon}
          />
          <PlacementBox 
            detail={rising} 
            color="bg-purple-100 dark:bg-purple-900/40" 
            icon={Star}
          />
        </div>
        
        {/* Unified Synthesis */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
          <h4 className="font-serif font-medium mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-500" />
            How It All Comes Together
          </h4>
          <div className="text-sm leading-relaxed whitespace-pre-line">
            {synthesis}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
