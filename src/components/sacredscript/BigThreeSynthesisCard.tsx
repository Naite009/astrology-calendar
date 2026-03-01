// BigThreeSynthesisCard - Unified display of Sun, Moon, Rising with aligned boxes
// Shows decan, degree, house for each placement plus a final synthesis paragraph

import { Sun, Moon, Star, Sunrise, Sunset, Sparkles, HelpCircle, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NatalChart } from '@/hooks/useNatalChart';
import { getDecan, Decan } from '@/lib/decans';
import { getSabianSymbol } from '@/lib/sabianSymbols';
import { getPlanetHouse } from '@/lib/sacredScriptHelpers';
import { getReliableAscendant } from '@/lib/chartDataValidation';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';
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

// Decan ruler interpretations for each sign's three decans
// Based on triplicity: each element has 3 signs, and decans follow that order
const DECAN_FLAVOR_DESCRIPTIONS: Record<string, Record<1 | 2 | 3, string>> = {
  Libra: {
    // Air triplicity: Libra → Aquarius → Gemini
    1: `**Venus Decan (0°–9°):** This is Libra at its purest essence—Venus ruling Venus. You're the classic Libra archetype: aesthetically oriented, relationship-focused, naturally diplomatic. Beauty isn't optional; it's a spiritual need. You create harmony through charm, grace, and an almost supernatural ability to make others feel valued. Partnership feels like oxygen. Shadow: may over-compromise to keep peace, can lose yourself in others' preferences.`,
    2: `**Uranus/Saturn Decan (10°–19°):** The Aquarian influence transforms Venus into something more detached and idealistic. You're the reformer Libra—seeking fairness not just in personal relationships but in systems, societies, structures. You may love humanity more easily than individuals. Saturn adds gravity; you take relationships seriously, may choose fewer but deeper bonds. Uranus adds the rebel—you might partner unconventionally or prioritize intellectual connection over romantic feeling.`,
    3: `**Mercury Decan (20°–29°):** The Gemini influence brings intellectual restlessness to Venus's desire for connection. You're the analytical Libra—you need to *understand* balance, not just feel it. Language is your art form: writing, negotiating, articulating the nuances others miss. You may process relationships through conversation rather than pure emotion. Shadow: can overthink partnerships, may analyze love rather than surrender to it.`,
  },
  // Other signs follow their element's triplicity pattern
  Aries: {
    1: `**Mars Decan (0°–9°):** Pure, undiluted Aries fire. You're the warrior unfiltered—action-oriented, decisive, pioneering. Life is a series of beginnings, and you live for the adrenaline of the new.`,
    2: `**Sun Decan (10°–19°):** Leo's warmth enters Mars territory. The warrior gains a heart—you fight for what you love, lead with creative courage, seek recognition for your bravery.`,
    3: `**Jupiter Decan (20°–29°):** Sagittarian expansion transforms combat into crusade. You're the philosophical warrior—action serves a vision, courage has meaning beyond the moment.`,
  },
  Taurus: {
    1: `**Venus Decan (0°–9°):** Pure Taurean sensuality. You're the embodiment of pleasure, patience, and material wisdom. Security isn't fear—it's love of the tangible.`,
    2: `**Mercury Decan (10°–19°):** Virgo's discrimination enters Venus territory. You're discerning about pleasures, practical about beauty, skilled at turning values into useful systems.`,
    3: `**Saturn Decan (20°–29°):** Capricorn's ambition grounds Venus. You build lasting structures from your values—patient, determined, viewing pleasure as something earned.`,
  },
  Gemini: {
    1: `**Mercury Decan (0°–9°):** Pure mercurial energy. Your mind never stops, curiosity is endless, and learning is life's greatest pleasure.`,
    2: `**Venus Decan (10°–19°):** Libra's grace enters Mercury's domain. Communication becomes art; you seek beautiful ideas, harmonious dialogues, intellectual partnerships.`,
    3: `**Uranus/Saturn Decan (20°–29°):** Aquarian innovation electrifies your thinking. You're the futurist, the pattern-breaker, the mind that leaps ahead of convention.`,
  },
  Cancer: {
    1: `**Moon Decan (0°–9°):** The Moon ruling itself—pure emotional depth. You feel everything, nurture instinctively, and create home wherever you are.`,
    2: `**Pluto Decan (10°–19°):** Scorpio's intensity enters lunar territory. Your nurturing is transformative; your emotions run to the roots of the psyche.`,
    3: `**Neptune Decan (20°–29°):** Pisces dissolves Cancer's shell. You're the mystic mother, the intuitive feeler, the one who senses what others cannot speak.`,
  },
  Leo: {
    1: `**Sun Decan (0°–9°):** The Sun ruling itself—pure radiance. You exist to shine, create, and express. Visibility isn't ego; it's soul mandate.`,
    2: `**Jupiter Decan (10°–19°):** Sagittarian wisdom enters solar territory. Your creativity serves teaching; your expression illuminates meaning.`,
    3: `**Mars Decan (20°–29°):** Arian courage ignites Leo's fire. You're the bold performer, the creative warrior, the one who creates through action.`,
  },
  Virgo: {
    1: `**Mercury Decan (0°–9°):** Pure Virgoan analysis. You see the details others miss, serve through precision, heal through discernment.`,
    2: `**Saturn Decan (10°–19°):** Capricorn's mastery enters Virgo's laboratory. You're the expert, the craftsman, the one who perfects through discipline.`,
    3: `**Venus Decan (20°–29°):** Taurus's pleasure softens Virgo's critique. You find beauty in usefulness, pleasure in service, sensuality in health.`,
  },
  Scorpio: {
    1: `**Pluto Decan (0°–9°):** Pure Scorpionic depth. You see through everything, transform what you touch, and live in the realm of psychological truth.`,
    2: `**Neptune Decan (10°–19°):** Pisces spiritualizes Scorpio's power. Transformation becomes transcendence; depth becomes surrender.`,
    3: `**Moon Decan (20°–29°):** Cancer's nurturing enters the underworld. You protect through fierce love, transform through emotional bonding.`,
  },
  Sagittarius: {
    1: `**Jupiter Decan (0°–9°):** Pure Sagittarian expansion. You live for meaning, travel (inner and outer), and the eternal quest for truth.`,
    2: `**Mars Decan (10°–19°):** Arian action enters the temple. Your philosophy isn't passive—you pioneer new territories of thought and experience.`,
    3: `**Sun Decan (20°–29°):** Leo's creative fire illuminates the journey. You teach through example, inspire through personal expression.`,
  },
  Capricorn: {
    1: `**Saturn Decan (0°–9°):** Pure Capricornian mastery. You build, achieve, and endure. Time is your ally, patience your superpower.`,
    2: `**Venus Decan (10°–19°):** Taurus's pleasure enters Saturn's realm. You earn your pleasures, build beautiful structures, find success sensual.`,
    3: `**Mercury Decan (20°–29°):** Virgo's precision refines Capricorn's ambition. You're the strategist, the expert, the one who succeeds through analysis.`,
  },
  Aquarius: {
    1: `**Uranus/Saturn Decan (0°–9°):** Pure Aquarian vision. You see the future others can't imagine, serve humanity through innovation.`,
    2: `**Mercury Decan (10°–19°):** Gemini's curiosity enters the revolution. You spread ideas, network change-makers, communicate the vision.`,
    3: `**Venus Decan (20°–29°):** Libra's harmony softens Aquarius's edge. You're the diplomat of progress, the one who makes change palatable.`,
  },
  Pisces: {
    1: `**Neptune Decan (0°–9°):** Pure Piscean dissolution. You merge with the all, dream the world awake, and feel the cosmic ocean.`,
    2: `**Moon Decan (10°–19°):** Cancer's nurturing enters the mystic waters. You heal through compassion, dream through feeling.`,
    3: `**Pluto Decan (20°–29°):** Scorpio's power enters Pisces. The mystic becomes the healer-transformer, channeling depths into light.`,
  },
};

// Night Chart Moon Lordship explanation
const NIGHT_CHART_MOON_LORDSHIP_EXPLANATION = `
**WHY THE MOON BECOMES CHART LORD AT NIGHT:**

In Hellenistic astrology (Chris Brennan, Demetra George, Robert Schmidt), the concept of "Sect" divides all charts into two camps: Day (diurnal) and Night (nocturnal). The luminary that matches your sect becomes your **Chart Lord**—the planet most aligned with expressing your life purpose.

**The Ancient Logic:** When the Sun is below the horizon, it's "out of office"—still powerful, but working through the subterranean, hidden realm. The Moon, which rules the night sky, takes over as the guiding light. In practical terms:

• **Daily Life:** Night chart natives often feel more alive in the evening, do their best work after dark, need more sleep, and may resist early morning schedules. Your energy waxes and wanes with lunar cycles more noticeably than day chart people.

• **Relationships:** You connect through emotional attunement rather than solar "will-to-will" contact. You read unspoken feelings, nurture instinctively, and may attract partners who need emotional care. Intimacy matters more than admiration.

• **Career:** Your professional success comes through receptivity—listening, adapting, responding to what's needed rather than imposing vision. You may work better behind scenes than in spotlight, excel in fields requiring intuition (therapy, art, caregiving), or lead through emotional intelligence rather than authority.

• **The Paradox of 1st House Sun in Night Chart:** You have the mark of visibility (1st house Sun) but the operating system of hiddenness (night sect). This creates a lifelong tension: moments when you're thrust into visibility but feel exposed, periods where you retreat and wonder if you're "doing life wrong." You're not. Your light emerges differently—through intimate impact, through written word, through influence that works best when you're not performing. Over time, the 1st house Sun will demand its due, but on YOUR terms—authentic, emotionally connected, not performing brightness you don't feel.
`;

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
    synthesis = `You are Triple Libra—a unified field of Venusian energy seeking balance, beauty, and partnership in every domain.\n\n`;
    
    // Show all three Libra decans for context
    synthesis += `**THE THREE FACES OF LIBRA:**\n\n`;
    synthesis += DECAN_FLAVOR_DESCRIPTIONS.Libra[1] + '\n\n';
    synthesis += DECAN_FLAVOR_DESCRIPTIONS.Libra[2] + '\n\n';
    synthesis += DECAN_FLAVOR_DESCRIPTIONS.Libra[3] + '\n\n';
    
    // Now show which decans THEY have
    synthesis += `**YOUR SPECIFIC DECAN CONFIGURATION:**\n`;
    synthesis += `• Sun at ${sun.degree.toFixed(1)}° = ${sun.decan.number === 1 ? 'Venus' : sun.decan.number === 2 ? 'Uranus/Saturn' : 'Mercury'} decan\n`;
    synthesis += `• Moon at ${moon.degree.toFixed(1)}° = ${moon.decan.number === 1 ? 'Venus' : moon.decan.number === 2 ? 'Uranus/Saturn' : 'Mercury'} decan\n`;
    synthesis += `• Rising at ${rising.degree.toFixed(1)}° = ${rising.decan.number === 1 ? 'Venus' : rising.decan.number === 2 ? 'Uranus/Saturn' : 'Mercury'} decan\n\n`;
    
    // Custom synthesis based on their specific decans
    const sunIsVenus = sun.decan.number === 1;
    const sunIsAquarian = sun.decan.number === 2;
    const sunIsMercury = sun.decan.number === 3;
    
    if (sunIsMercury) {
      synthesis += `Your Sun is in the Mercury decan, which means your core identity is expressed through the 3rd face of Libra—the Gemini-influenced, intellectually restless version. You're not the "peaceful diplomat in elegant attire" stereotype. You're the Libra who needs to *understand* fairness, *analyze* relationship dynamics, *articulate* what others only feel. Your nervous system is calibrated to pick up on social nuances, power dynamics, unspoken tensions. This can feel exhausting—you see everything, including what people wish you wouldn't notice.\n\n`;
    } else if (sunIsAquarian) {
      synthesis += `Your Sun is in the Uranus/Saturn decan, bringing the Aquarian quality into your Libra core. You may relate better to humanity as a principle than to messy individual relationships. Partnership for you requires intellectual respect; you might prefer unconventional arrangements or prioritize mental connection over romantic chemistry. Saturn's influence makes you take relationships seriously—fewer but deeper.\n\n`;
    } else if (sunIsVenus) {
      synthesis += `Your Sun is in the Venus decan—pure, classic Libra. Beauty and partnership aren't preferences; they're soul needs. You create harmony naturally, make others feel seen and valued, and may struggle when forced to choose sides or assert yourself at the expense of relationship.\n\n`;
    }
    
    // Night chart interpretation for 1st house Sun
    if (sect.isNightChart && sun.house === 1) {
      synthesis += `**THE PARADOX YOU FEEL:**\n`;
      synthesis += `Your Sun is in the 1st house—traditionally the placement of someone who IS meant to be seen. But you were born before sunrise, making this a **Night Chart**.\n\n`;
      synthesis += `In night charts, the Moon becomes the "chart lord"—your emotional, receptive nature leads, while the Sun works more quietly, internally. So you have this tension: 1st house Sun says "be seen" but Night Chart Sun says "your power is behind the scenes."\n\n`;
      synthesis += `This is why you feel like hiding despite being "supposed to" shine. You're not wrong or broken—you're a Night Chart person with a daytime placement. Your visibility will come on YOUR terms: gradual, earned, authentic rather than performed. Your gifts emerge in intimate settings, through written word, through influence that works best when you're not trying to be impressive.\n\n`;
    }
  } else {
    // General synthesis for non-triple or other triples
    const decanFlavors = DECAN_FLAVOR_DESCRIPTIONS[sun.sign];
    if (decanFlavors) {
      synthesis += `${decanFlavors[sun.decan.number]}\n\n`;
    }
    
    synthesis += `Your ${sun.sign} Sun in the ${sun.decan.number === 1 ? 'first' : sun.decan.number === 2 ? 'second' : 'third'} decan is colored by ${sun.decan.ruler} energy. `;
    
    if (sun.house) {
      synthesis += `Placed in the ${sun.house}${sun.house === 1 ? 'st' : sun.house === 2 ? 'nd' : sun.house === 3 ? 'rd' : 'th'} house, your identity expresses through ${HOUSE_MEANINGS[sun.house]?.toLowerCase()}.\n\n`;
    }
    
    // Add Moon synthesis
    const moonDecanFlavors = DECAN_FLAVOR_DESCRIPTIONS[moon.sign];
    if (moonDecanFlavors) {
      synthesis += `Your Moon: ${moonDecanFlavors[moon.decan.number]}\n\n`;
    }
    
    // Add Rising synthesis
    const risingDecanFlavors = DECAN_FLAVOR_DESCRIPTIONS[rising.sign];
    if (risingDecanFlavors) {
      synthesis += `Your Rising: ${risingDecanFlavors[rising.decan.number]}\n\n`;
    }
    
    // Sect interpretation
    if (sect.isNightChart) {
      synthesis += `As a **Night Chart** native, your Moon is the "chart lord"—your emotional, intuitive, receptive nature is emphasized over the solar, will-driven self. You may feel more at home in your Moon sign than your Sun sign.`;
    }
  }
  
  return synthesis;
};

// Export for use in Guide section
export { NIGHT_CHART_MOON_LORDSHIP_EXPLANATION };

export const BigThreeSynthesisCard = ({ natalChart }: BigThreeSynthesisCardProps) => {
  const [showMoonLordship, setShowMoonLordship] = useState(false);
  
  const sunPos = natalChart.planets.Sun;
  const moonPos = natalChart.planets.Moon;
  const reliableAsc = getReliableAscendant(natalChart);
  const risingSign = reliableAsc?.sign;
  const risingDegree = reliableAsc?.degree ?? 0;
  
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
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg font-serif">
          <Sparkles className="text-primary" size={20} />
          The Big Three — Complete Picture
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {sect.isNightChart ? (
            <Sunset className="text-primary" size={16} />
          ) : (
            <Sunrise className="text-accent" size={16} />
          )}
          <span>{sect.description}</span>
          {sect.isNightChart && (
            <button 
              onClick={() => setShowMoonLordship(!showMoonLordship)}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <HelpCircle size={12} />
              Why Moon becomes Chart Lord?
            </button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Night Chart Moon Lordship Education (collapsible) */}
        {sect.isNightChart && (
          <Collapsible open={showMoonLordship} onOpenChange={setShowMoonLordship}>
            <CollapsibleContent>
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4 text-sm leading-relaxed">
                <h4 className="font-serif font-medium mb-3 flex items-center gap-2">
                  <Moon size={16} className="text-primary" />
                  Understanding Night Chart Moon Lordship
                </h4>
                <div className="prose prose-sm dark:prose-invert max-w-none space-y-3">
                  <p><strong>WHY THE MOON BECOMES CHART LORD AT NIGHT:</strong></p>
                  <p>In Hellenistic astrology (Chris Brennan, Demetra George, Robert Schmidt), the concept of "Sect" divides all charts into two camps: Day (diurnal) and Night (nocturnal). The luminary that matches your sect becomes your <strong>Chart Lord</strong>—the planet most aligned with expressing your life purpose.</p>
                  
                  <p><strong>The Ancient Logic:</strong> When the Sun is below the horizon, it's "out of office"—still powerful, but working through the subterranean, hidden realm. The Moon, which rules the night sky, takes over as the guiding light.</p>
                  
                  <div className="bg-background/50 rounded p-3 space-y-2">
                    <p><strong>🌙 Daily Life:</strong> Night chart natives often feel more alive in the evening, do their best work after dark, need more sleep, and may resist early morning schedules. Your energy waxes and wanes with lunar cycles more noticeably than day chart people.</p>
                    
                    <p><strong>💕 Relationships:</strong> You connect through emotional attunement rather than solar "will-to-will" contact. You read unspoken feelings, nurture instinctively, and may attract partners who need emotional care. Intimacy matters more than admiration.</p>
                    
                    <p><strong>💼 Career:</strong> Your professional success comes through receptivity—listening, adapting, responding to what's needed rather than imposing vision. You may work better behind scenes than in spotlight, excel in fields requiring intuition (therapy, art, caregiving), or lead through emotional intelligence rather than authority.</p>
                  </div>
                  
                  {sun.house === 1 && (
                    <div className="bg-accent/20 rounded p-3 mt-3">
                      <p><strong>⚡ The Paradox of 1st House Sun in Night Chart:</strong></p>
                      <p>You have the mark of visibility (1st house Sun) but the operating system of hiddenness (night sect). This creates a lifelong tension: moments when you're thrust into visibility but feel exposed, periods where you retreat and wonder if you're "doing life wrong."</p>
                      <p className="mt-2">You're not. Your light emerges differently—through intimate impact, through written word, through influence that works best when you're not performing. Over time, the 1st house Sun will demand its due, but on YOUR terms—authentic, emotionally connected, not performing brightness you don't feel.</p>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setShowMoonLordship(false)}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <ChevronDown size={12} className="rotate-180" /> Close
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Three placement boxes side by side */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <PlacementBox 
            detail={sun} 
            color="bg-primary/10" 
            icon={Sun}
          />
          <PlacementBox 
            detail={moon} 
            color="bg-accent/10" 
            icon={Moon}
          />
          <PlacementBox 
            detail={rising} 
            color="bg-secondary/50" 
            icon={Star}
          />
        </div>
        
        {/* Unified Synthesis */}
        <div className="bg-muted rounded-lg p-4 border border-border">
          <h4 className="font-serif font-medium mb-3 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            How It All Comes Together
          </h4>
          <div className="text-sm leading-relaxed whitespace-pre-line prose prose-sm dark:prose-invert max-w-none">
            {synthesis}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
