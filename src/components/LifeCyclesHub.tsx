import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Clock, ChevronDown, ChevronUp, Target, Zap, Calendar, AlertCircle, Star, Sun, Moon } from 'lucide-react';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateDetailedSaturnCycles, DetailedSaturnCycles, formatDegreePosition } from '@/lib/saturnCycleCalculator';
import { SaturnReturnCalculator } from './SaturnReturnCalculator';
import { calculateSect } from '@/lib/birthConditions';
import { calculateSecondaryProgressions, getProgressedMoonInfo } from '@/lib/secondaryProgressions';
import * as Astronomy from 'astronomy-engine';
import { format, differenceInDays, differenceInMonths, addYears, addMonths } from 'date-fns';

interface LifeCyclesHubProps {
  chart: NatalChart;
  currentDate?: Date;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇', Chiron: '⚷',
  Sun: '☉', Moon: '☽', Jupiter: '♃'
};

// Chiron wound interpretations by sign (GENERATIONAL - everyone born within ~8 years shares this)
const CHIRON_WOUND_BY_SIGN: Record<string, {
  wound: string;
  gift: string;
  healingPath: string;
}> = {
  Aries: {
    wound: "The wound of SELF — feeling like you don't have the right to exist, assert yourself, or take up space. Fear of being too much or not enough.",
    gift: "Becoming a champion for others' right to exist authentically. You help others find their courage because you know what it's like to feel invisible.",
    healingPath: "Learning that your existence is not a burden. Taking action despite fear. Claiming your right to be HERE."
  },
  Taurus: {
    wound: "The wound of WORTH — feeling fundamentally unworthy, insecure about money/resources, or disconnected from your body and senses.",
    gift: "Becoming a guide for others to find their inherent value. You help people reconnect with their bodies and build real security.",
    healingPath: "Discovering that you are valuable simply because you exist. Building security from within, not from possessions."
  },
  Gemini: {
    wound: "The wound of COMMUNICATION — feeling unheard, misunderstood, or like your voice doesn't matter. Possible learning difficulties or sibling wounds.",
    gift: "Becoming a translator, teacher, or writer who helps others find their voice. You understand what it means to struggle to be understood.",
    healingPath: "Learning that your thoughts and words matter. Finding communities that hear you. Writing your truth."
  },
  Cancer: {
    wound: "The wound of BELONGING — feeling homeless, motherless, or like you never had a safe emotional foundation. Family trauma or abandonment.",
    gift: "Becoming a nurturer who creates safe spaces for others. You build the family and home you never had.",
    healingPath: "Becoming your own mother. Creating emotional safety within. Healing ancestral patterns."
  },
  Leo: {
    wound: "The wound of RECOGNITION — feeling unseen, uncelebrated, or like your creative self-expression was crushed. Shame about wanting attention.",
    gift: "Becoming a mentor who celebrates others' unique gifts. You help people shine because you know the pain of being dimmed.",
    healingPath: "Learning that wanting to be seen is not selfish. Creating for yourself first. Owning your light."
  },
  Virgo: {
    wound: "The wound of IMPERFECTION — chronic self-criticism, feeling broken or flawed, health anxieties, never feeling 'good enough.'",
    gift: "Becoming a healer or helper who accepts others' imperfections with compassion. You perfect the art of gentle improvement.",
    healingPath: "Accepting that 'good enough' IS enough. Healing the inner critic. Finding perfection in imperfection."
  },
  Libra: {
    wound: "The wound of RELATIONSHIP — feeling incomplete without a partner, losing yourself in relationships, or experiencing painful rejection/abandonment.",
    gift: "Becoming a relationship healer, mediator, or counselor. You understand the depths of human connection and its challenges.",
    healingPath: "Learning to be whole alone before partnering. Finding balance between self and other."
  },
  Scorpio: {
    wound: "The wound of TRUST — betrayal, violation of boundaries, exposure to death/darkness too young, fear of intimacy and vulnerability.",
    gift: "Becoming a transformer who helps others through their darkest passages. You are a guide through the underworld.",
    healingPath: "Learning to trust again—carefully. Transforming pain into power. Reclaiming what was taken."
  },
  Sagittarius: {
    wound: "The wound of MEANING — feeling like life has no purpose, crisis of faith, cultural displacement, or having your beliefs mocked/invalidated.",
    gift: "Becoming a wisdom teacher who helps others find their own truth. You understand the journey of seeking meaning.",
    healingPath: "Creating your own philosophy of life. Finding meaning in the search itself. Teaching what you needed to learn."
  },
  Capricorn: {
    wound: "The wound of AUTHORITY — absent/harsh father figures, premature responsibility, feeling like you must earn love through achievement, imposter syndrome.",
    gift: "Becoming a gentle authority who guides others without domination. You understand the loneliness of climbing.",
    healingPath: "Separating your worth from your achievements. Becoming your own supportive father. Achieving for joy, not validation."
  },
  Aquarius: {
    wound: "The wound of BELONGING TO HUMANITY — feeling like an alien, ostracized for being different, disconnected from groups while desperately wanting to belong.",
    gift: "Becoming a bridge for other outsiders. You create communities where everyone's weirdness is welcome.",
    healingPath: "Embracing that you're different AND you belong. Finding your tribe. Being the change you needed to see."
  },
  Pisces: {
    wound: "The wound of SPIRITUAL ABANDONMENT — feeling forgotten by the divine, overwhelmed by universal suffering, escapism, or martyrdom patterns.",
    gift: "Becoming a compassionate healer, artist, or spiritual guide. You feel everything, and you transmute pain into beauty.",
    healingPath: "Learning healthy boundaries while staying connected. Creating art from suffering. Compassion without martyrdom."
  }
};

// Chiron HOUSE interpretations (PERSONAL - this is what makes it unique to YOU)
const CHIRON_WOUND_BY_HOUSE: Record<number, {
  lifeArea: string;
  personalWound: string;
  personalGift: string;
}> = {
  1: {
    lifeArea: "Self-Image & Identity",
    personalWound: "Your wound manifests in how you see yourself and present to the world. You may struggle with self-doubt, feeling 'wrong' in your own skin, or difficulty asserting your authentic self.",
    personalGift: "You become a model of authentic self-acceptance, helping others embrace who they really are."
  },
  2: {
    lifeArea: "Self-Worth & Resources",
    personalWound: "Your wound manifests through money, possessions, and self-worth. You may struggle to feel valuable, have complicated relationships with earning, or question what you deserve.",
    personalGift: "You become a guide for others to discover their inherent worth beyond material measures."
  },
  3: {
    lifeArea: "Communication & Learning",
    personalWound: "Your wound manifests in how you think, speak, and learn. Early communication difficulties, sibling dynamics, or feeling 'stupid' may have shaped you. You might fear speaking up.",
    personalGift: "You become a powerful communicator, teacher, or writer precisely because you know what it's like to struggle to be heard."
  },
  4: {
    lifeArea: "Home & Family",
    personalWound: "Your wound is deeply rooted in family, childhood, and home. You may have felt unsafe growing up, dealt with family dysfunction, or never felt like you belonged at 'home.'",
    personalGift: "You become someone who creates true emotional safety for others, building the nurturing environment you needed."
  },
  5: {
    lifeArea: "Creativity & Self-Expression",
    personalWound: "Your wound manifests in creativity, romance, and joy. You may have been shamed for self-expression, had your creative spark diminished, or struggle to 'play.'",
    personalGift: "You become a creative healer who helps others reclaim their joy and authentic self-expression."
  },
  6: {
    lifeArea: "Health & Daily Work",
    personalWound: "Your wound manifests through health, work routines, and service. You may struggle with chronic health issues, perfectionism at work, or feeling never 'good enough' at what you do.",
    personalGift: "You become a healer, mentor, or guide who helps others integrate wellness and meaningful work."
  },
  7: {
    lifeArea: "Relationships & Partnership",
    personalWound: "Your wound manifests in one-on-one relationships. You may attract wounded partners, give too much, fear abandonment, or struggle to maintain healthy boundaries in love.",
    personalGift: "You become a relationship healer who helps others navigate the depths of intimate connection."
  },
  8: {
    lifeArea: "Intimacy & Transformation",
    personalWound: "Your wound lives in the deepest, most intimate places — sexuality, shared resources, trust, death, and psychological depth. Betrayal or violation may have marked you.",
    personalGift: "You become a guide through the underworld, helping others transform their deepest pain into power."
  },
  9: {
    lifeArea: "Beliefs & Higher Meaning",
    personalWound: "Your wound manifests through beliefs, faith, and the search for meaning. You may have had beliefs shattered, felt culturally displaced, or struggled to find your life's purpose.",
    personalGift: "You become a wisdom teacher who helps others find meaning precisely because you know the pain of meaninglessness."
  },
  10: {
    lifeArea: "Career & Public Role",
    personalWound: "Your wound manifests in career, reputation, and public life. You may struggle with authority figures, imposter syndrome, or feel your achievements are never enough.",
    personalGift: "You become a compassionate leader who guides others to authentic success, not success at the cost of soul."
  },
  11: {
    lifeArea: "Community & Belonging",
    personalWound: "Your wound manifests in groups, friendships, and feeling like you belong to humanity. You may feel like an outsider, rejected by groups, or unable to find 'your people.'",
    personalGift: "You become a community builder who creates spaces where everyone — especially outsiders — belongs."
  },
  12: {
    lifeArea: "Spirituality & The Unconscious",
    personalWound: "Your wound lives in the hidden realm — dreams, spirituality, the unconscious, and what's unspoken. You may feel spiritually abandoned, absorb others' pain, or struggle with escapism.",
    personalGift: "You become a spiritual guide, artist, or healer who connects others to the transcendent and helps them heal invisible wounds."
  }
};

interface OuterPlanetTransit {
  planet: string;
  aspectType: 'square' | 'opposition' | 'return' | 'conjunction';
  aspectSymbol: string;
  typicalAgeRange: string;
  exactAge: number | null;
  exactDate: Date | null;
  isPast: boolean;
  isActive: boolean;
  daysUntil: number | null;
  description: string;
  lifeTheme: string;
  intensity: 'critical' | 'major' | 'moderate';
  natalSign?: string;
  natalDegree?: string;
  targetDegree?: string;
  natalHouse?: number | null;
  woundData?: {
    wound: string;
    gift: string;
    healingPath: string;
  };
  houseWoundData?: {
    lifeArea: string;
    personalWound: string;
    personalGift: string;
  };
}

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

// Format degree as "XX° Sign"
function formatDegree(absoluteDegree: number): string {
  const normalized = ((absoluteDegree % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = Math.floor(normalized % 30);
  const minutes = Math.round((normalized % 1) * 60);
  return `${degree}°${minutes.toString().padStart(2, '0')}' ${ZODIAC_SIGNS[signIndex]}`;
}

// Get sign from absolute degree
function getSignFromDegree(absoluteDegree: number): string {
  const normalized = ((absoluteDegree % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[signIndex];
}

// Get planet longitude at date
function getPlanetLongitude(body: Astronomy.Body, date: Date): number {
  const astroTime = new Astronomy.AstroTime(date);
  const geo = Astronomy.GeoVector(body, astroTime, true);
  const ecliptic = Astronomy.Ecliptic(geo);
  return ecliptic.elon;
}

// Calculate natal planet longitude
function getNatalPlanetLongitude(chart: NatalChart, planetName: string): number | null {
  const planet = chart.planets[planetName as keyof typeof chart.planets];
  if (!planet || !planet.sign) return null;
  
  const signIndex = ZODIAC_SIGNS.indexOf(planet.sign);
  if (signIndex === -1) return null;
  
  return signIndex * 30 + planet.degree + (planet.minutes || 0) / 60;
}

// Get planet's house placement (Whole Sign houses if cusps not provided)
function getPlanetHouse(chart: NatalChart, planetLongitude: number): number | null {
  if (!chart.houseCusps) {
    // Fall back to Whole Sign houses using Ascendant — prefer houseCusps.house1
    const ascendant = chart.houseCusps?.house1 || chart.planets.Ascendant;
    if (!ascendant) return null;
    const ascIndex = ZODIAC_SIGNS.indexOf(ascendant.sign);
    if (ascIndex === -1) return null;
    
    const planetSignIndex = Math.floor(((planetLongitude % 360) + 360) % 360 / 30);
    let house = planetSignIndex - ascIndex + 1;
    if (house <= 0) house += 12;
    return house;
  }
  
  // Use provided house cusps
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
    if (cusp) {
      const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
      if (signIndex >= 0) {
        cusps.push(signIndex * 30 + cusp.degree + cusp.minutes / 60);
      }
    }
  }
  
  if (cusps.length !== 12) return null;
  
  const normalizedPlanet = ((planetLongitude % 360) + 360) % 360;
  
  for (let i = 0; i < 12; i++) {
    const cuspStart = cusps[i];
    const cuspEnd = cusps[(i + 1) % 12];
    
    if (cuspEnd > cuspStart) {
      if (normalizedPlanet >= cuspStart && normalizedPlanet < cuspEnd) {
        return i + 1;
      }
    } else {
      if (normalizedPlanet >= cuspStart || normalizedPlanet < cuspEnd) {
        return i + 1;
      }
    }
  }
  
  return null;
}

// Find when a transiting planet hits a target degree (rough estimate)
function findTransitDate(
  body: Astronomy.Body,
  targetDegree: number,
  birthDate: Date,
  startAge: number,
  endAge: number
): { date: Date; age: number } | null {
  const startDate = addYears(new Date(birthDate), startAge);
  const endDate = addYears(new Date(birthDate), endAge);
  
  let currentDate = new Date(startDate);
  const stepDays = 30; // Monthly steps for outer planets
  
  while (currentDate < endDate) {
    const lon = getPlanetLongitude(body, currentDate);
    let diff = Math.abs(lon - targetDegree);
    if (diff > 180) diff = 360 - diff;
    
    if (diff < 2) {
      // Found approximate date, refine with smaller steps
      const refinedDate = new Date(currentDate);
      for (let i = 0; i < 60; i++) {
        const testDate = new Date(refinedDate.getTime() - (30 - i) * 24 * 60 * 60 * 1000);
        const testLon = getPlanetLongitude(body, testDate);
        let testDiff = Math.abs(testLon - targetDegree);
        if (testDiff > 180) testDiff = 360 - testDiff;
        if (testDiff < 1) {
          const ageInYears = (testDate.getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
          return { date: testDate, age: Math.round(ageInYears * 10) / 10 };
        }
      }
      const ageInYears = (currentDate.getTime() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
      return { date: currentDate, age: Math.round(ageInYears * 10) / 10 };
    }
    
    currentDate = new Date(currentDate.getTime() + stepDays * 24 * 60 * 60 * 1000);
  }
  
  return null;
}

// Calculate all major outer planet transits for a life cycle
function calculateOuterPlanetTransits(chart: NatalChart, currentDate: Date): OuterPlanetTransit[] {
  const birthDate = new Date(chart.birthDate);
  const currentAge = (currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const transits: OuterPlanetTransit[] = [];
  
  // Neptune Square (natal Neptune) - typically age 40-42
  const natalNeptune = getNatalPlanetLongitude(chart, 'Neptune');
  const neptuneSign = chart.planets.Neptune?.sign || '';
  if (natalNeptune !== null) {
    const squareDegree1 = (natalNeptune + 90) % 360;
    const result = findTransitDate(Astronomy.Body.Neptune, squareDegree1, birthDate, 38, 50);
    if (result) {
      transits.push({
        planet: 'Neptune',
        aspectType: 'square',
        aspectSymbol: '□',
        typicalAgeRange: '40-42',
        exactAge: result.age,
        exactDate: result.date,
        isPast: result.date < currentDate,
        isActive: Math.abs(result.age - currentAge) < 2,
        daysUntil: result.date > currentDate ? differenceInDays(result.date, currentDate) : null,
        description: 'Neptune Square Neptune — The Fog of Midlife',
        lifeTheme: 'Spiritual disillusionment and re-enchantment. Old dreams dissolve to make way for deeper meaning. You may question what you\'ve been chasing.',
        intensity: 'major',
        natalSign: neptuneSign,
        natalDegree: formatDegree(natalNeptune),
        targetDegree: formatDegree(squareDegree1)
      });
    }
  }
  
  // Pluto Square (natal Pluto) - varies HUGELY by generation
  const natalPluto = getNatalPlanetLongitude(chart, 'Pluto');
  const plutoSign = chart.planets.Pluto?.sign || '';
  if (natalPluto !== null) {
    const squareDegree = (natalPluto + 90) % 360;
    // Pluto square can happen anywhere from 36-90 depending on Pluto's speed at birth
    const result = findTransitDate(Astronomy.Body.Pluto, squareDegree, birthDate, 30, 100);
    if (result) {
      transits.push({
        planet: 'Pluto',
        aspectType: 'square',
        aspectSymbol: '□',
        typicalAgeRange: 'Varies (36-90)',
        exactAge: result.age,
        exactDate: result.date,
        isPast: result.date < currentDate,
        isActive: Math.abs(result.age - currentAge) < 3,
        daysUntil: result.date > currentDate ? differenceInDays(result.date, currentDate) : null,
        description: 'Pluto Square Pluto — Power Transformation',
        lifeTheme: 'Deep power crisis. Everything you thought you controlled comes up for review. Death/rebirth of old identity structures. Shadow material demands integration.',
        intensity: 'critical',
        natalSign: plutoSign,
        natalDegree: formatDegree(natalPluto),
        targetDegree: formatDegree(squareDegree)
      });
    }
  }
  
  // Chiron Return - age 49-51
  // Note: astronomy-engine doesn't have Chiron, so we estimate based on typical 50-year cycle
  const natalChiron = getNatalPlanetLongitude(chart, 'Chiron');
  const chironSign = chart.planets.Chiron?.sign || '';
  const chironWound = CHIRON_WOUND_BY_SIGN[chironSign];
  const chironHouse = natalChiron !== null ? getPlanetHouse(chart, natalChiron) : null;
  const chironHouseWound = chironHouse ? CHIRON_WOUND_BY_HOUSE[chironHouse] : null;
  
  if (natalChiron !== null) {
    // Estimate Chiron return at age 50 (Chiron's orbital period is ~50.7 years)
    const estimatedDate = addYears(birthDate, 50);
    transits.push({
      planet: 'Chiron',
      aspectType: 'return',
      aspectSymbol: '☌',
      typicalAgeRange: '49-51',
      exactAge: 50,
      exactDate: estimatedDate,
      isPast: estimatedDate < currentDate,
      isActive: Math.abs(50 - currentAge) < 2,
      daysUntil: estimatedDate > currentDate ? differenceInDays(estimatedDate, currentDate) : null,
      description: `Chiron Return — The Wounded Healer (${chironSign} in House ${chironHouse || '?'})`,
      lifeTheme: chironHouseWound 
        ? `YOUR WOUND MANIFESTS IN: ${chironHouseWound.lifeArea}`
        : (chironWound 
          ? `YOUR WOUND: ${chironWound.wound.substring(0, 100)}...`
          : 'Your core wound comes full circle. The pain you\'ve carried since childhood asks to be healed—or transformed into wisdom.'),
      intensity: 'major',
      natalSign: chironSign,
      natalDegree: formatDegree(natalChiron),
      targetDegree: formatDegree(natalChiron),
      natalHouse: chironHouse,
      woundData: chironWound,
      houseWoundData: chironHouseWound || undefined
    });
  }
  
  // Second Saturn Return - age 57-60
  const natalSaturn = getNatalPlanetLongitude(chart, 'Saturn');
  if (natalSaturn !== null) {
    const result = findTransitDate(Astronomy.Body.Saturn, natalSaturn, birthDate, 56, 62);
    if (result) {
      transits.push({
        planet: 'Saturn',
        aspectType: 'return',
        aspectSymbol: '☌',
        typicalAgeRange: '57-60',
        exactAge: result.age,
        exactDate: result.date,
        isPast: result.date < currentDate,
        isActive: Math.abs(result.age - currentAge) < 1,
        daysUntil: result.date > currentDate ? differenceInDays(result.date, currentDate) : null,
        description: '2nd Saturn Return — Elder Initiation',
        lifeTheme: 'Time to become an elder, not just an older person. What legacy will you leave? What structures need rebuilding for your final chapter?',
        intensity: 'critical'
      });
    }
  }
  
  // Neptune Opposition - age 82-84 (most won't see this)
  if (natalNeptune !== null && currentAge < 80) {
    const oppositionDegree = (natalNeptune + 180) % 360;
    transits.push({
      planet: 'Neptune',
      aspectType: 'opposition',
      aspectSymbol: '☍',
      typicalAgeRange: '82-84',
      exactAge: 83,
      exactDate: addYears(birthDate, 83),
      isPast: currentAge > 84,
      isActive: false,
      daysUntil: null,
      description: 'Neptune Opposition — Transcendence',
      lifeTheme: 'If reached: Complete dissolution of ego boundaries. Spiritual transcendence. Many experience visions, mystical states, or the veil between worlds thinning.',
      intensity: 'major'
    });
  }
  
  // Third Saturn Return - age 87-90
  if (natalSaturn !== null && currentAge < 85) {
    transits.push({
      planet: 'Saturn',
      aspectType: 'return',
      aspectSymbol: '☌',
      typicalAgeRange: '87-90',
      exactAge: 88,
      exactDate: addYears(birthDate, 88),
      isPast: currentAge > 90,
      isActive: false,
      daysUntil: null,
      description: '3rd Saturn Return — Final Mastery',
      lifeTheme: 'Rare transit reached by few. Complete mastery over time and form. The wisdom-keeper phase. Legacy solidification.',
      intensity: 'critical'
    });
  }
  
  return transits.sort((a, b) => (a.exactAge || 0) - (b.exactAge || 0));
}

// Chart Lord Activation Component
const ChartLordActivation: React.FC<{ chart: NatalChart; currentDate: Date }> = ({ chart, currentDate }) => {
  // Use proper sect calculation from birthConditions.ts
  const sectData = useMemo(() => calculateSect(chart), [chart]);
  const isNightChart = sectData.sect === 'Night';
  
  const sectLight = isNightChart ? 'Moon' : 'Sun';
  const sectLightSymbol = isNightChart ? '☽' : '☉';
  
  // Find next major transit to sect light
  const natalSectLightLon = getNatalPlanetLongitude(chart, sectLight);
  
  const [nextTransit, setNextTransit] = useState<any>(null);
  useEffect(() => {
    if (natalSectLightLon === null) return;
    const timer = setTimeout(() => {
      const outerPlanets = [
        { name: 'Saturn', body: Astronomy.Body.Saturn },
        { name: 'Jupiter', body: Astronomy.Body.Jupiter },
        { name: 'Uranus', body: Astronomy.Body.Uranus },
        { name: 'Neptune', body: Astronomy.Body.Neptune },
        { name: 'Pluto', body: Astronomy.Body.Pluto }
      ];
      const aspects = [
        { name: 'conjunction', angle: 0, symbol: '☌', orb: 8 },
        { name: 'opposition', angle: 180, symbol: '☍', orb: 8 },
        { name: 'square', angle: 90, symbol: '□', orb: 7 },
        { name: 'trine', angle: 120, symbol: '△', orb: 7 }
      ];
      let closestTransit: any = null;
      let smallestOrb = 999;
      outerPlanets.forEach(planet => {
        const currentLon = getPlanetLongitude(planet.body, currentDate);
        aspects.forEach(aspect => {
          const targetAngle1 = (natalSectLightLon + aspect.angle) % 360;
          const targetAngle2 = (natalSectLightLon - aspect.angle + 360) % 360;
          [targetAngle1, targetAngle2].forEach(target => {
            let diff = Math.abs(currentLon - target);
            if (diff > 180) diff = 360 - diff;
            if (diff <= aspect.orb && diff < smallestOrb) {
              smallestOrb = diff;
              closestTransit = {
                planet: planet.name,
                symbol: PLANET_SYMBOLS[planet.name],
                aspect: aspect.name,
                aspectSymbol: aspect.symbol,
                orb: diff.toFixed(1)
              };
            }
          });
        });
      });
      setNextTransit(closestTransit);
    }, 50);
    return () => clearTimeout(timer);
  }, [natalSectLightLon, currentDate]);
  
  return (
    <Card className={isNightChart ? 'border-violet-500/30 bg-violet-500/5' : 'border-amber-500/30 bg-amber-500/5'}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {isNightChart ? <Moon size={16} className="text-violet-500" /> : <Sun size={16} className="text-amber-500" />}
            {sectLightSymbol} {sectLight} — Your Chart Lord Status
          </CardTitle>
          <Badge variant="outline" className={isNightChart ? 'text-violet-600' : 'text-amber-600'}>
            {isNightChart ? 'Night Chart' : 'Day Chart'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {nextTransit ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{nextTransit.symbol}</span>
              <div>
                <div className="font-medium">
                  {nextTransit.planet} {nextTransit.aspectSymbol} {sectLightSymbol} {sectLight}
                </div>
                <div className="text-sm text-muted-foreground">
                  Currently within {nextTransit.orb}° orb
                </div>
              </div>
              <Badge variant="outline" className="ml-auto bg-primary/10 text-primary animate-pulse">
                ACTIVE
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {isNightChart 
                ? 'Your Moon is activated. Emotional themes, instincts, and daily rhythms are intensified.'
                : 'Your Sun is activated. Identity, purpose, and visibility themes are intensified.'}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No major outer planet transits currently activating your {sectLight}. 
            Your Chart Lord is in a quiet period.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Journey stages for progressed moon through each sign
const PROG_MOON_JOURNEY: Record<string, { q1: string; q2: string; q3: string; q4: string }> = {
  Aries: { q1: "The spark ignites — restless, ready to move. New impulses arrive before you can name them.", q2: "The fire burns steady. You've found what you're fighting for.", q3: "Your courage has been tested. Others see your strength now.", q4: "The warrior prepares to rest. A quieter voice asks what to BUILD. Taurus beckons." },
  Taurus: { q1: "Everything slows down — and it's a relief. You crave comfort, stability, beauty.", q2: "You're settling in. Financial security matters. Patience comes naturally.", q3: "What you planted is growing. Sensual pleasure feeds your soul deeply.", q4: "The garden is full but curiosity stirs. Gemini energy approaches." },
  Gemini: { q1: "Your mind wakes up. You want to read everything, talk to everyone.", q2: "Connecting dots, building networks. Writing or teaching may call.", q3: "Information overload possible. Depth vs. breadth becomes the lesson.", q4: "The social butterfly looks homeward, craving something deeper. Cancer stirs." },
  Cancer: { q1: "You turn inward. Home, family, roots become everything. Old memories surface.", q2: "You're nesting. Nurturing brings deep satisfaction.", q3: "Emotional depth is your superpower. You understand what 'home' really means.", q4: "The cocoon cracks. Something wants to SHINE. Leo approaches." },
  Leo: { q1: "You step into the light. Romance, creativity, play — your heart demands joy.", q2: "Full bloom. Creative projects flow. You're learning to receive applause.", q3: "Confidence is earned. You know what makes you unique.", q4: "The spotlight dims gently. A quieter voice asks: how can I be useful? Virgo calls." },
  Virgo: { q1: "Time to organize. Health routines and daily improvements call.", q2: "You've found your rhythm. Being of service brings satisfaction.", q3: "Perfectionism may peak. Be gentle. Your skills are honed.", q4: "You feel the pull toward partnership, balance. Libra approaches." },
  Libra: { q1: "Relationships become the mirror. Beauty, harmony, and fairness matter.", q2: "Learning the dance of compromise. Aesthetics nourish your soul.", q3: "Diplomatic skills peak. You've learned when to give and hold.", q4: "Surface harmony isn't enough. Something deeper calls. Scorpio's waters pull." },
  Scorpio: { q1: "The surface breaks. Emotions are raw, powerful, honest.", q2: "You're transforming. Old patterns crumble. Intimacy deepens.", q3: "You've faced darkness and found treasure. Psychological insight is profound.", q4: "The phoenix rises. You crave meaning, adventure. Sagittarius points to the horizon." },
  Sagittarius: { q1: "Freedom! You need space. Travel, philosophy, higher learning expand your spirit.", q2: "Exploring physically, mentally, spiritually. Beliefs are evolving.", q3: "Wisdom gathered. The quest shifts from outer adventure to inner meaning.", q4: "Adventure winds down. You want to BUILD something. Capricorn's mountain appears." },
  Capricorn: { q1: "You get serious. Career ambitions crystallize. Ready for hard work.", q2: "You're climbing. Discipline comes naturally. Building a legacy.", q3: "Authority becomes you. People look to you for guidance.", q4: "The summit is visible. Loneliness makes you crave connection. Aquarius calls." },
  Aquarius: { q1: "You break free. Old rules feel stifling. Community and innovation excite.", q2: "Your tribe finds you. Friendships based on shared ideals matter.", q3: "You've found your cause. You're the visionary now.", q4: "The mind has gone far. Something softer, more spiritual calls. Pisces awaits." },
  Pisces: { q1: "The veil thins. Dreams are vivid. Intuition is sharp. Boundaries blur.", q2: "Swimming in the collective unconscious. Art and spirituality feed your soul.", q3: "Spiritual depth is profound. Forgiveness becomes the great gift.", q4: "The cycle completes. Old identities release. A new beginning forms. Aries is coming." },
};

const ProgressedMoonJourneyInline: React.FC<{ moonInfo: any }> = ({ moonInfo }) => {
  const journey = useMemo(() => {
    const currentDeg = moonInfo.exactDegree;
    const monthsPerDegree = 1 / 1.08;
    const now = new Date();
    const milestones = [
      { deg: 0, label: 'Entry — 0°', stage: 'entry' as const },
      { deg: 7.5, label: 'Quarter — 7°30\'', stage: 'q1' as const },
      { deg: 15, label: 'Midpoint — 15°', stage: 'q2' as const },
      { deg: 22.5, label: 'Three-Quarter — 22°30\'', stage: 'q3' as const },
      { deg: 30, label: `Exit → ${moonInfo.nextSign}`, stage: 'q4' as const },
    ];
    return milestones.map(m => {
      const monthsFromNow = (m.deg - currentDeg) * monthsPerDegree;
      const date = addMonths(now, Math.round(monthsFromNow));
      const isPast = m.deg <= currentDeg;
      const isCurrent = (currentDeg >= (m.deg - 3.75) && currentDeg < (m.deg + 3.75));
      return { ...m, date, isPast, isCurrent, formattedDate: format(date, 'MMM yyyy') };
    });
  }, [moonInfo]);

  const stages = PROG_MOON_JOURNEY[moonInfo.sign];
  const currentQuarter = moonInfo.exactDegree < 7.5 ? 'q1' : moonInfo.exactDegree < 15 ? 'q2' : moonInfo.exactDegree < 22.5 ? 'q3' : 'q4';

  return (
    <Collapsible>
      <CollapsibleTrigger className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
        <ChevronDown size={12} />
        Journey through {moonInfo.sign} — Milestones
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3">
        <div className="relative pl-5 space-y-0">
          <div className="absolute left-[9px] top-1 bottom-1 w-0.5 bg-border" />
          {journey.map((m, i) => (
            <div key={i} className="relative flex items-start gap-2 pb-3">
              <div className={`absolute left-[-11px] top-1 w-2.5 h-2.5 rounded-full border-2 ${
                m.isCurrent ? 'bg-primary border-primary ring-2 ring-primary/20' : m.isPast ? 'bg-muted-foreground/50 border-muted-foreground/50' : 'bg-background border-border'
              }`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium ${m.isCurrent ? 'text-primary' : m.isPast ? 'text-muted-foreground' : 'text-foreground'}`}>{m.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{m.formattedDate}</span>
                  {m.isCurrent && <Badge variant="default" className="text-[8px] px-1 py-0">NOW</Badge>}
                </div>
                {stages && i > 0 && i <= 4 && (
                  <p className={`text-[11px] mt-0.5 leading-relaxed ${m.stage === currentQuarter ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {stages[m.stage === 'entry' ? 'q1' : m.stage]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

// Progressed Moon Card for Overview
const ProgressedMoonCard: React.FC<{ chart: NatalChart; currentDate: Date }> = ({ chart, currentDate }) => {
  const [progressedMoonInfo, setProgressedMoonInfo] = useState<any>(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      const progressions = calculateSecondaryProgressions(chart, currentDate);
      if (!progressions) { setProgressedMoonInfo(null); return; }
      setProgressedMoonInfo(getProgressedMoonInfo(progressions, chart));
    }, 100);
    return () => clearTimeout(timer);
  }, [chart, currentDate]);
  
  if (!progressedMoonInfo) {
    return null;
  }
  
  // Format the exact degree
  const exactDeg = progressedMoonInfo.exactDegree;
  const degrees = Math.floor(exactDeg);
  const minutes = Math.round((exactDeg % 1) * 60);
  const formattedDegree = `${degrees}°${minutes.toString().padStart(2, '0')}' ${progressedMoonInfo.sign}`;
  
  return (
    <Card className="border-violet-500/30 bg-violet-500/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Moon size={16} className="text-violet-500" />
            ☽ Progressed Moon — Current Position
          </CardTitle>
          <Badge variant="outline" className="font-mono text-violet-600 bg-violet-500/20">
            {formattedDegree}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="p-3 bg-secondary/30 rounded-lg">
          <div className="text-sm font-medium mb-1">{progressedMoonInfo.detailedPhase.phaseName}</div>
          <p className="text-xs text-muted-foreground">{progressedMoonInfo.detailedPhase.description}</p>
        </div>
        
        <div className="text-xs space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">House:</span>
            <span className="font-medium">{progressedMoonInfo.house ? `House ${progressedMoonInfo.house} — ${progressedMoonInfo.houseMeaning?.short || ''}` : 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Next sign change:</span>
            <span className="font-medium">→ {progressedMoonInfo.nextSign} in ~{progressedMoonInfo.monthsUntilSignChange} months</span>
          </div>
        </div>
        
        <Collapsible>
          <CollapsibleTrigger className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
            <ChevronDown size={12} />
            What does this mean for me?
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 p-3 bg-background/50 rounded border border-border text-xs">
            <p className="text-muted-foreground">{progressedMoonInfo.signMeaning?.clientSummary || progressedMoonInfo.currentExperience}</p>
          </CollapsibleContent>
        </Collapsible>

        {/* Journey Timeline */}
        <ProgressedMoonJourneyInline moonInfo={progressedMoonInfo} />
      </CardContent>
    </Card>
  );
};

// Midlife Window Component
const MidlifeTransitWindow: React.FC<{ chart: NatalChart; currentDate: Date }> = ({ chart, currentDate }) => {
  const birthDate = new Date(chart.birthDate);
  const currentAge = (currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  
  const [midlifeTransits, setMidlifeTransits] = useState<OuterPlanetTransit[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setMidlifeTransits(calculateOuterPlanetTransits(chart, currentDate).filter(t => 
        t.exactAge !== null && t.exactAge >= 38 && t.exactAge <= 52
      ));
    }, 150);
    return () => clearTimeout(timer);
  }, [chart, currentDate]);
  
  const getStatusColor = (transit: OuterPlanetTransit) => {
    if (transit.isActive) return 'border-rose-500 bg-rose-500/10';
    if (transit.isPast) return 'border-muted bg-muted/30';
    return 'border-amber-500 bg-amber-500/10';
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            Midlife Transit Window (Ages 38-52)
          </CardTitle>
          <Badge variant="outline">
            Current Age: {Math.floor(currentAge)}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          The concentrated period of outer planet challenges that reshape identity
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {midlifeTransits.length > 0 ? (
          midlifeTransits.map((transit, idx) => (
            <Collapsible key={idx}>
              <div className={`p-3 rounded-lg border ${getStatusColor(transit)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{PLANET_SYMBOLS[transit.planet]}</span>
                    <div>
                      <div className="text-sm font-medium">
                        {transit.planet} {transit.aspectSymbol} natal {transit.planet}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Age ~{transit.exactAge} • {transit.exactDate ? format(transit.exactDate, 'MMMM d, yyyy') : transit.typicalAgeRange}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {transit.isActive && (
                      <Badge variant="outline" className="bg-destructive/20 text-destructive animate-pulse">
                        ACTIVE NOW
                      </Badge>
                    )}
                    {!transit.isPast && !transit.isActive && transit.daysUntil && (
                      <Badge variant="outline" className="bg-accent/50 text-accent-foreground">
                        in {Math.round(transit.daysUntil / 30)} months
                      </Badge>
                    )}
                    {transit.isPast && (
                      <Badge variant="outline" className="bg-muted">
                        COMPLETE
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Exact Degrees Display */}
                {transit.natalDegree && (
                  <div className="text-xs bg-secondary/50 p-2 rounded mb-2 font-mono">
                    <span className="text-muted-foreground">Natal: </span>
                    <span className="text-foreground font-medium">{transit.natalDegree}</span>
                    {transit.targetDegree && transit.targetDegree !== transit.natalDegree && (
                      <>
                        <span className="text-muted-foreground"> → Transit hits: </span>
                        <span className="text-foreground font-medium">{transit.targetDegree}</span>
                      </>
                    )}
                  </div>
                )}
                
                <p className="text-xs text-foreground font-medium mb-1">{transit.description}</p>
                
                <CollapsibleTrigger className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                  <ChevronDown size={12} />
                  {transit.woundData ? 'See Your Wound & Gift' : 'Learn More'}
                </CollapsibleTrigger>
                
                <CollapsibleContent className="mt-2 p-3 bg-background/50 rounded border border-border text-xs space-y-3">
                  {/* Personal House Interpretation (UNIQUE TO YOU) */}
                  {transit.houseWoundData && (
                    <div className="p-2 bg-primary/10 rounded border border-primary/20">
                      <span className="font-bold text-primary">🏠 YOUR PERSONAL WOUND (House {transit.natalHouse}):</span>
                      <p className="text-xs text-muted-foreground italic mb-1">{transit.houseWoundData.lifeArea}</p>
                      <p className="text-muted-foreground mt-1">{transit.houseWoundData.personalWound}</p>
                      <div className="mt-2">
                        <span className="font-semibold text-primary">✨ YOUR PERSONAL GIFT:</span>
                        <p className="text-muted-foreground mt-1">{transit.houseWoundData.personalGift}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Generational Sign Interpretation */}
                  {transit.woundData && (
                    <div className="p-2 bg-secondary/30 rounded border border-border">
                      <span className="font-semibold text-muted-foreground">📜 GENERATIONAL THEME ({transit.natalSign} — shared by your age group):</span>
                      <p className="text-muted-foreground mt-1 text-xs">{transit.woundData.wound}</p>
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">See generational gift & healing path</summary>
                        <div className="mt-2 space-y-2">
                          <div>
                            <span className="font-semibold text-primary">✨ GIFT:</span>
                            <p className="text-muted-foreground mt-1">{transit.woundData.gift}</p>
                          </div>
                          <div>
                            <span className="font-semibold text-accent-foreground">🌱 HEALING PATH:</span>
                            <p className="text-muted-foreground mt-1">{transit.woundData.healingPath}</p>
                          </div>
                        </div>
                      </details>
                    </div>
                  )}
                  
                  {/* Fallback for non-Chiron transits */}
                  {!transit.woundData && !transit.houseWoundData && (
                    <p className="text-muted-foreground">{transit.lifeTheme}</p>
                  )}
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No midlife transits calculated. Check birth data.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Post-50 Transits Component
const Post50Transits: React.FC<{ chart: NatalChart; currentDate: Date }> = ({ chart, currentDate }) => {
  const birthDate = new Date(chart.birthDate);
  const currentAge = (currentDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  
  const [post50Transits, setPost50Transits] = useState<OuterPlanetTransit[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setPost50Transits(calculateOuterPlanetTransits(chart, currentDate).filter(t => 
        t.exactAge !== null && t.exactAge >= 50
      ));
    }, 200);
    return () => clearTimeout(timer);
  }, [chart, currentDate]);
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Star size={16} className="text-violet-500" />
            Elder Initiations (Ages 50+)
          </CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          The wisdom years: what's ahead after midlife
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {post50Transits.map((transit, idx) => (
          <Collapsible key={idx}>
            <div className={`p-3 rounded-lg border ${transit.isPast ? 'bg-muted/30' : transit.isActive ? 'bg-primary/10 border-primary/30' : 'bg-secondary/30 border-border'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{PLANET_SYMBOLS[transit.planet]}</span>
                  <div>
                    <div className="text-sm font-medium">{transit.description}</div>
                    <div className="text-xs text-muted-foreground">
                      Age ~{transit.exactAge} • {transit.exactDate ? format(transit.exactDate, 'MMMM d, yyyy') : transit.typicalAgeRange}
                    </div>
                  </div>
                </div>
                {transit.isActive && (
                  <Badge variant="outline" className="bg-primary/20 text-primary animate-pulse">
                    APPROACHING
                  </Badge>
                )}
              </div>
              
              {/* Exact Degrees Display */}
              {transit.natalDegree && (
                <div className="text-xs bg-secondary/50 p-2 rounded mb-2 font-mono">
                  <span className="text-muted-foreground">Natal: </span>
                  <span className="text-foreground font-medium">{transit.natalDegree}</span>
                </div>
              )}
              
              <CollapsibleTrigger className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">
                <ChevronDown size={12} />
                {transit.woundData ? 'See Your Wound & Gift' : 'Learn More'}
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-2 p-3 bg-background/50 rounded border border-border text-xs space-y-3">
                {/* Personal House Interpretation (UNIQUE TO YOU) */}
                {transit.houseWoundData && (
                  <div className="p-2 bg-primary/10 rounded border border-primary/20">
                    <span className="font-bold text-primary">🏠 YOUR PERSONAL WOUND (House {transit.natalHouse}):</span>
                    <p className="text-xs text-muted-foreground italic mb-1">{transit.houseWoundData.lifeArea}</p>
                    <p className="text-muted-foreground mt-1">{transit.houseWoundData.personalWound}</p>
                    <div className="mt-2">
                      <span className="font-semibold text-primary">✨ YOUR PERSONAL GIFT:</span>
                      <p className="text-muted-foreground mt-1">{transit.houseWoundData.personalGift}</p>
                    </div>
                  </div>
                )}
                
                {/* Generational Sign Interpretation */}
                {transit.woundData && (
                  <div className="p-2 bg-secondary/30 rounded border border-border">
                    <span className="font-semibold text-muted-foreground">📜 GENERATIONAL THEME ({transit.natalSign} — shared by your age group):</span>
                    <p className="text-muted-foreground mt-1 text-xs">{transit.woundData.wound}</p>
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground">See generational gift & healing path</summary>
                      <div className="mt-2 space-y-2">
                        <div>
                          <span className="font-semibold text-primary">✨ GIFT:</span>
                          <p className="text-muted-foreground mt-1">{transit.woundData.gift}</p>
                        </div>
                        <div>
                          <span className="font-semibold text-accent-foreground">🌱 HEALING PATH:</span>
                          <p className="text-muted-foreground mt-1">{transit.woundData.healingPath}</p>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
                
                {/* Fallback for non-Chiron transits */}
                {!transit.woundData && !transit.houseWoundData && (
                  <p className="text-muted-foreground">{transit.lifeTheme}</p>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
        
        {post50Transits.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No post-50 transits calculated.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Personalized Life Cycle Timeline with exact dates
const LifeCycleTimelinePersonalized = ({ chart }: { chart: NatalChart }) => {
  const birthDate = useMemo(() => {
    if (!chart.birthDate) return null;
    const parts = chart.birthDate.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }, [chart.birthDate]);

  // Use exact ephemeris for Saturn Returns
  const saturnCycles = useMemo(() => {
    return calculateDetailedSaturnCycles(chart, new Date());
  }, [chart]);

  const cycles = useMemo(() => {
    if (!birthDate) return [];

    const formatAge = (targetDate: Date) => {
      const age = Math.floor((targetDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return age;
    };

    // Get exact Saturn Return dates from ephemeris
    const saturnReturns = saturnCycles?.cycles.filter(c => c.phaseName === 'Return') || [];
    const sr1 = saturnReturns[0];
    const sr2 = saturnReturns[1];
    
    const saturnReturn1Start = sr1?.events[0] ? new Date(sr1.events[0].date) : addYears(birthDate, 28);
    const saturnReturn1End = sr1?.events[sr1.events.length - 1] ? new Date(sr1.events[sr1.events.length - 1].date) : addYears(birthDate, 30);
    const saturnReturn2Start = sr2?.events[0] ? new Date(sr2.events[0].date) : addYears(birthDate, 57);
    const saturnReturn2End = sr2?.events[sr2.events.length - 1] ? new Date(sr2.events[sr2.events.length - 1].date) : addYears(birthDate, 59);

    // Uranus opposition ~42 years (half of 84-year cycle)
    const uranusOppStart = addYears(birthDate, 40);
    const uranusOppEnd = addYears(birthDate, 43);

    // Neptune square ~41 years (quarter of 164-year cycle)
    const neptuneSqStart = addYears(birthDate, 40);
    const neptuneSqEnd = addYears(birthDate, 42);

    // Pluto square varies greatly by generation (Pluto's orbit is eccentric)
    // Approximate: if born with Pluto in Scorpio/Sagittarius → ~36-40; Libra → ~37-42; Virgo → ~38-45
    const plutoSqStart = addYears(birthDate, 36);
    const plutoSqEnd = addYears(birthDate, 44);

    // Chiron return ~50 years
    const chironReturnStart = addYears(birthDate, 49);
    const chironReturnEnd = addYears(birthDate, 51);

    const now = new Date();

    return [
      {
        symbol: '♄', label: 'Saturn Return #1',
        start: saturnReturn1Start, end: saturnReturn1End,
        age: `Age ${formatAge(saturnReturn1Start)}-${formatAge(saturnReturn1End)}`,
        description: 'Adult identity forms — who you truly are emerges',
        bg: 'bg-amber-500/10',
        isPast: now > saturnReturn1End,
        isCurrent: now >= saturnReturn1Start && now <= saturnReturn1End,
        exactEvents: sr1?.events || [],
      },
      {
        symbol: '♅', label: 'Uranus Opposition',
        start: uranusOppStart, end: uranusOppEnd,
        age: `Age ${formatAge(uranusOppStart)}-${formatAge(uranusOppEnd)}`,
        description: 'Midlife awakening — radical authenticity call',
        bg: 'bg-cyan-500/10',
        isPast: now > uranusOppEnd,
        isCurrent: now >= uranusOppStart && now <= uranusOppEnd,
        exactEvents: [],
      },
      {
        symbol: '♆', label: 'Neptune Square',
        start: neptuneSqStart, end: neptuneSqEnd,
        age: `Age ${formatAge(neptuneSqStart)}-${formatAge(neptuneSqEnd)}`,
        description: 'Spiritual disillusionment — ego dissolves',
        bg: 'bg-violet-500/10',
        isPast: now > neptuneSqEnd,
        isCurrent: now >= neptuneSqStart && now <= neptuneSqEnd,
        exactEvents: [],
      },
      {
        symbol: '♇', label: 'Pluto Square',
        start: plutoSqStart, end: plutoSqEnd,
        age: `Age ${formatAge(plutoSqStart)}-${formatAge(plutoSqEnd)}`,
        description: 'Power transformation — death/rebirth of identity',
        bg: 'bg-rose-500/10',
        isPast: now > plutoSqEnd,
        isCurrent: now >= plutoSqStart && now <= plutoSqEnd,
        exactEvents: [],
      },
      {
        symbol: '⚷', label: 'Chiron Return',
        start: chironReturnStart, end: chironReturnEnd,
        age: `Age ${formatAge(chironReturnStart)}-${formatAge(chironReturnEnd)}`,
        description: 'Wound becomes gift — deepest healing',
        bg: 'bg-emerald-500/10',
        isPast: now > chironReturnEnd,
        isCurrent: now >= chironReturnStart && now <= chironReturnEnd,
        exactEvents: [],
      },
      {
        symbol: '♄', label: 'Saturn Return #2',
        start: saturnReturn2Start, end: saturnReturn2End,
        age: `Age ${formatAge(saturnReturn2Start)}-${formatAge(saturnReturn2End)}`,
        description: 'Elder initiation — wisdom crystallizes',
        bg: 'bg-amber-500/10',
        isPast: now > saturnReturn2End,
        isCurrent: now >= saturnReturn2Start && now <= saturnReturn2End,
        exactEvents: sr2?.events || [],
      },
    ];
  }, [birthDate, saturnCycles]);

  if (!birthDate) {
    return <p className="text-xs text-muted-foreground">Birth date required for personalized dates.</p>;
  }

  return (
    <div className="space-y-2 text-xs">
      {cycles.map((cycle, i) => (
        <div key={i} className={`p-2 rounded ${cycle.bg} ${cycle.isCurrent ? 'ring-2 ring-primary' : ''}`}>
          <div className="flex items-center gap-2">
            <span className="text-lg shrink-0">{cycle.symbol}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-medium">{cycle.label}:</span>
                {cycle.isPast && <Badge variant="outline" className="text-[9px] px-1 py-0">Complete</Badge>}
                {cycle.isCurrent && <Badge className="text-[9px] px-1 py-0 bg-primary text-primary-foreground">NOW</Badge>}
              </div>
              <span className="text-muted-foreground">{cycle.description}</span>
            </div>
            <div className="text-right shrink-0">
              <p className="font-semibold text-[11px]">{format(cycle.start, 'MMM d, yyyy')} – {format(cycle.end, 'MMM d, yyyy')}</p>
              <p className="text-[10px] text-muted-foreground">{cycle.age}</p>
            </div>
          </div>
          {/* Show exact pass dates for Saturn Returns */}
          {cycle.exactEvents.length > 1 && (
            <div className="mt-1.5 ml-8 space-y-0.5">
              {cycle.exactEvents.map((event: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2 text-[10px]">
                  <span className={`font-bold px-1 py-0 rounded ${
                    event.type === 'retrograde_pass' 
                      ? 'bg-purple-500/20 text-purple-600' 
                      : 'bg-blue-500/20 text-blue-600'
                  }`}>
                    {idx + 1}{idx === 0 ? 'st' : idx === 1 ? 'nd' : 'rd'} pass
                  </span>
                  <span className="font-medium">{format(new Date(event.date), 'MMMM d, yyyy')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export const LifeCyclesHub: React.FC<LifeCyclesHubProps> = ({ chart, currentDate = new Date() }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showSaturnDetails, setShowSaturnDetails] = useState(false);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="text-primary" size={24} />
        <div>
          <h3 className="text-lg font-serif">Life Cycles & Major Transits</h3>
          <p className="text-sm text-muted-foreground">
            Your personal timeline of major astrological initiations
          </p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cycles">Key Cycles</TabsTrigger>
          <TabsTrigger value="midlife">Midlife</TabsTrigger>
          <TabsTrigger value="elder">50+</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Chart Lord Activation */}
          <ChartLordActivation chart={chart} currentDate={currentDate} />
          
          {/* Progressed Moon Position */}
          <ProgressedMoonCard chart={chart} currentDate={currentDate} />
          
          {/* Quick Summary of All Life Phases */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar size={16} className="text-primary" />
                Your Life Cycle Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LifeCycleTimelinePersonalized chart={chart} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cycles" className="mt-4">
          <SaturnReturnCalculator chart={chart} currentDate={currentDate} />
        </TabsContent>
        
        <TabsContent value="midlife" className="mt-4">
          <MidlifeTransitWindow chart={chart} currentDate={currentDate} />
        </TabsContent>
        
        <TabsContent value="elder" className="mt-4">
          <Post50Transits chart={chart} currentDate={currentDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LifeCyclesHub;
