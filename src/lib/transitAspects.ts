// Transit-to-Natal Aspect Calculation System
import { PlanetaryPositions, getPlanetSymbol } from './astrology';
import { NatalChart } from '@/hooks/useNatalChart';
import { 
  getTransitPlanetHouse, 
  getNatalPlanetHouse, 
  getHouseOverlay, 
  getHouseLabel,
  hasHouseData,
  getTransitHouseInterpretation,
  HOUSE_MEANINGS
} from './houseCalculations';
import { getDetailedInterpretation, DetailedInterpretation } from './detailedInterpretations';

// Aspect definitions with orbs, symbols, and colors
export const ASPECT_TYPES = [
  { name: 'conjunction', angle: 0, orb: 8, symbol: '☌', color: '#2C2C2C', meaning: 'merging' },
  { name: 'opposition', angle: 180, orb: 8, symbol: '☍', color: '#C74E4E', meaning: 'polarity' },
  { name: 'trine', angle: 120, orb: 8, symbol: '△', color: '#66BB6A', meaning: 'harmony' },
  { name: 'square', angle: 90, orb: 7, symbol: '□', color: '#FFA726', meaning: 'tension' },
  { name: 'sextile', angle: 60, orb: 6, symbol: '⚹', color: '#42A5F5', meaning: 'opportunity' },
  { name: 'quincunx', angle: 150, orb: 3, symbol: '⚻', color: '#AB47BC', meaning: 'adjustment' },
  { name: 'semisextile', angle: 30, orb: 2, symbol: '⚺', color: '#78909C', meaning: 'subtle connection' },
] as const;

export interface TransitAspect {
  transitPlanet: string;
  transitSign: string;
  transitDegree: number;
  transitLongitude: number;
  transitHouse: number | null;
  natalPlanet: string;
  natalSign: string;
  natalDegree: number;
  natalLongitude: number;
  natalHouse: number | null;
  aspect: string;
  symbol: string;
  orb: string;
  color: string;
  meaning: string;
  interpretation: string;
  detailedInterpretation: DetailedInterpretation;
  houseOverlay: string;
  isExact: boolean;
}

// Calculate longitude from sign + degree
const signToLongitude = (sign: string, degree: number, minutes: number = 0): number => {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree + (minutes / 60);
};

// Planet symbols for display
const PLANET_SYMBOLS: Record<string, string> = {
  sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
  jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
  northNode: '☊', chiron: '⚷', lilith: '⚸', eris: '⯰',
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', Chiron: '⚷', Lilith: '⚸', Eris: '⯰',
};

export const getTransitPlanetSymbol = (planet: string): string => {
  return PLANET_SYMBOLS[planet] || planet.charAt(0);
};

// Re-export house utilities for convenience
export { getHouseLabel, hasHouseData, HOUSE_MEANINGS };

// Calculate transit-to-natal aspects
export const calculateTransitAspects = (
  transitDate: Date,
  transitPositions: PlanetaryPositions,
  natalChart: NatalChart
): TransitAspect[] => {
  const aspects: TransitAspect[] = [];

  // Transit planets to check
  const transitPlanets = [
    { key: 'moon', name: 'Moon', data: transitPositions.moon },
    { key: 'sun', name: 'Sun', data: transitPositions.sun },
    { key: 'mercury', name: 'Mercury', data: transitPositions.mercury },
    { key: 'venus', name: 'Venus', data: transitPositions.venus },
    { key: 'mars', name: 'Mars', data: transitPositions.mars },
    { key: 'jupiter', name: 'Jupiter', data: transitPositions.jupiter },
    { key: 'saturn', name: 'Saturn', data: transitPositions.saturn },
    { key: 'uranus', name: 'Uranus', data: transitPositions.uranus },
    { key: 'neptune', name: 'Neptune', data: transitPositions.neptune },
    { key: 'pluto', name: 'Pluto', data: transitPositions.pluto },
  ];

  // Natal planets to check — use corrected Ascendant from houseCusps.house1
  const rawNatalPlanets = Object.entries(natalChart.planets)
    .filter(([name, pos]) => pos?.sign && name !== 'Ascendant') // exclude raw Ascendant, add corrected one below
    .map(([name, pos]) => ({
      name,
      sign: pos!.sign,
      degree: pos!.degree,
      minutes: pos!.minutes || 0,
      longitude: signToLongitude(pos!.sign, pos!.degree, pos!.minutes),
    }));

  // Add corrected Ascendant from houseCusps.house1 (avoids 180° flip bug)
  const h1 = natalChart.houseCusps?.house1;
  const ascData = h1?.sign ? h1 : natalChart.planets?.Ascendant;
  if (ascData?.sign) {
    rawNatalPlanets.push({
      name: 'Ascendant',
      sign: ascData.sign,
      degree: ascData.degree,
      minutes: ascData.minutes || 0,
      longitude: signToLongitude(ascData.sign, ascData.degree, ascData.minutes || 0),
    });
  }

  const natalPlanets = rawNatalPlanets;

  // Check each transit planet against each natal planet
  transitPlanets.forEach(transit => {
    if (!transit.data) return;
    
    const transitLon = transit.data.degree + 
      (['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
        'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        .indexOf(transit.data.signName) * 30);

    // Calculate which house the transit planet is in
    const transitHouse = getTransitPlanetHouse(transit.data.signName, transit.data.degree, natalChart);

    natalPlanets.forEach(natal => {
      // Calculate angular difference
      let diff = Math.abs(transitLon - natal.longitude);
      if (diff > 180) diff = 360 - diff;

      // Calculate which house the natal planet is in
      const natalHouse = getNatalPlanetHouse(natal.name, natalChart);

      // Check for aspects
      ASPECT_TYPES.forEach(aspectType => {
        const angleDiff = Math.abs(diff - aspectType.angle);
        if (angleDiff <= aspectType.orb) {
          // Generate house overlay interpretation
          const houseOverlay = getHouseOverlay(transit.name, transitHouse, natal.name, natalHouse);
          
          // Generate detailed interpretation using the complete 5-layer system
          const detailed = getDetailedInterpretation(
            transit.name,
            transit.data!.signName,
            transit.data!.degree,
            transitHouse,
            natal.name,
            natal.sign,
            natal.degree,
            natalHouse,
            aspectType.name,
            angleDiff.toFixed(1)
          );
          
          aspects.push({
            transitPlanet: transit.name,
            transitSign: transit.data!.signName,
            transitDegree: transit.data!.degree,
            transitLongitude: transitLon,
            transitHouse,
            natalPlanet: natal.name,
            natalSign: natal.sign,
            natalDegree: natal.degree,
            natalLongitude: natal.longitude,
            natalHouse,
            aspect: aspectType.name,
            symbol: aspectType.symbol,
            orb: angleDiff.toFixed(1),
            color: aspectType.color,
            meaning: aspectType.meaning,
            interpretation: detailed.header,
            detailedInterpretation: detailed,
            houseOverlay,
            isExact: angleDiff < 1,
          });
        }
      });
    });
  });

  // Sort by orb (tightest first)
  return aspects.sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb));
};

// Get interpretation for transit aspect
const getTransitInterpretation = (transitPlanet: string, natalPlanet: string, aspect: string): string => {
  const interpretations: Record<string, Record<string, string>> = {
    // Transit Moon aspects
    'moon-sun': {
      conjunction: 'Your emotions align with your core identity. Authentic day.',
      opposition: 'Internal pull between feelings and ego. Balance needed.',
      trine: 'Emotional flow supports your self-expression. Easy confidence.',
      square: 'Tension between heart and head. Honor both truths.',
      sextile: 'Gentle emotional support for being yourself. Opportunities arise.',
    },
    'moon-moon': {
      conjunction: 'Emotional reset. You feel most like yourself today.',
      opposition: 'Emotional full moon in YOUR chart. Peak feelings.',
      trine: 'Emotions flow naturally. Trust your instincts completely.',
      square: 'Inner emotional friction. What needs adjustment?',
      sextile: 'Emotional ease. Small comforts bring big peace.',
    },
    'moon-mercury': {
      conjunction: 'Feelings and thoughts merge. Speak from the heart.',
      opposition: 'Mind vs emotions. Find the balance.',
      square: 'Head vs heart conflict. Which wisdom to trust?',
      trine: 'Easy emotional expression. Say what you feel.',
      sextile: 'Gentle conversations about feelings go well.',
    },
    'moon-venus': {
      conjunction: 'Love and nurturing merge. Beautiful emotional day.',
      opposition: 'Relationship feelings peak. Express affection.',
      trine: 'Harmony in love. Pleasant connections flow.',
      square: 'Love vs comfort tension. What do you need?',
      sextile: 'Sweet moments. Small pleasures bring joy.',
    },
    'moon-mars': {
      conjunction: 'Emotions fuel action. Passionate energy.',
      opposition: 'Feelings vs drive clash. Channel constructively.',
      trine: 'Emotions empower your actions. Go for it.',
      square: 'Irritability possible. Breathe before reacting.',
      sextile: 'Emotional motivation. Gentle push forward.',
    },
    'moon-jupiter': {
      conjunction: 'Emotional expansion. Joy and optimism grow.',
      opposition: 'Big feelings. Dont overdo it.',
      trine: 'Lucky feelings. Trust your emotional guidance.',
      square: 'Over-feeling. Where are emotions excessive?',
      sextile: 'Optimistic mood. Good fortune in small things.',
    },
    'moon-saturn': {
      conjunction: 'Emotional maturity demanded. Feel deeply but wisely.',
      opposition: 'Responsibility weighs on emotions. Stay grounded.',
      trine: 'Stable emotions. Discipline supports feelings.',
      square: 'Emotional restriction. What feeling needs boundaries?',
      sextile: 'Practical emotions. Steady inner state.',
    },
    'moon-uranus': {
      conjunction: 'Surprising emotions. Expect the unexpected.',
      opposition: 'Emotional disruption from others. Stay centered.',
      trine: 'Exciting feelings. Embrace spontaneity.',
      square: 'Emotional restlessness. Freedom vs security.',
      sextile: 'Refreshing emotional insights. New perspectives.',
    },
    'moon-neptune': {
      conjunction: 'Dreamy, intuitive day. Imagination flows.',
      opposition: 'Confusion vs clarity. Trust your intuition.',
      trine: 'Spiritual feelings. Creative inspiration.',
      square: 'Emotional fog. Ground yourself.',
      sextile: 'Gentle intuitions. Compassion deepens.',
    },
    'moon-pluto': {
      conjunction: 'DEEP EMOTIONAL POWER. Transformation possible.',
      opposition: 'Emotional intensity peaks. Others trigger your depths.',
      trine: 'Emotional depth feels safe. Transform gently.',
      square: 'Power struggles with emotions. What are you controlling?',
      sextile: 'Subtle emotional insights. Healing moments.',
    },

    // Transit Mercury aspects
    'mercury-sun': {
      conjunction: 'Brilliant clarity about who you are. Speak your truth.',
      opposition: 'Communication about identity. Express yourself.',
      trine: 'Express yourself effortlessly. Writing/speaking flows.',
      square: 'Communication challenges around identity. Revise message.',
      sextile: 'Easy self-expression. Good for networking.',
    },
    'mercury-mercury': {
      conjunction: 'Mental reset. Think like yourself again.',
      opposition: 'New vs old thinking. Find synthesis.',
      trine: 'Thoughts flow smoothly. Easy mental clarity.',
      square: 'Mental friction. Old vs new ways of thinking.',
      sextile: 'Quick thinking. Ideas click into place.',
    },
    'mercury-pluto': {
      conjunction: 'POWER COMMUNICATION. Deep truths surface. Profound insights.',
      opposition: 'Intense conversations. Secrets may emerge.',
      trine: 'Penetrating insight flows easily. Research depth.',
      square: 'Mental power struggles. Whose truth wins?',
      sextile: 'Deep thinking comes naturally. Investigation succeeds.',
    },

    // Transit Venus aspects
    'venus-sun': {
      conjunction: 'Love yourself today. You ARE beautiful.',
      opposition: 'Love from others highlights your identity.',
      trine: 'Grace and charm flow naturally. Magnetism.',
      square: 'Values vs identity conflict. What do you truly want?',
      sextile: 'Pleasant self-expression. Attractiveness increases.',
    },
    'venus-venus': {
      conjunction: 'Return to your core values. Love what you love.',
      opposition: 'Relationship mirror. See yourself in others.',
      trine: 'Pleasure flows. Indulge in your aesthetic.',
      square: 'Old values challenged. What matters now?',
      sextile: 'Small pleasures bring joy. Harmony in love.',
    },
    'venus-mars': {
      conjunction: 'Passion ignites! Love and desire merge.',
      opposition: 'Attraction peaks. Chemistry is electric.',
      trine: 'Harmonious desire. Romance flows.',
      square: 'Love vs lust tension. Balance passion.',
      sextile: 'Gentle attraction. Affection expressed easily.',
    },

    // Transit Mars aspects
    'mars-sun': {
      conjunction: 'TAKE ACTION on who you are. Courageous self-expression.',
      opposition: 'Others trigger your anger. Assert yourself.',
      trine: 'Confident action. You know what to do.',
      square: 'Frustration with self. Channel anger productively.',
      sextile: 'Energy boost. Initiative succeeds.',
    },
    'mars-mars': {
      conjunction: 'Raw authentic drive returns. Pure motivation.',
      opposition: 'External conflict mirrors internal fire.',
      trine: 'Energy flows powerfully. Physical vitality.',
      square: 'Old anger resurfaces. What battle is worth it?',
      sextile: 'Steady drive. Productive energy.',
    },

    // Transit Jupiter aspects
    'jupiter-sun': {
      conjunction: 'MAJOR GROWTH OPPORTUNITY. Your identity expands.',
      opposition: 'Others bring luck and opportunity.',
      trine: 'Luck flows to you. Optimism supported.',
      square: 'Overconfidence warning. Where are you over-extending?',
      sextile: 'Small lucky breaks. Growth opportunities.',
    },
    'jupiter-moon': {
      conjunction: 'Emotional expansion. Joy and optimism grow.',
      opposition: 'Relationships bring joy. Generosity flows.',
      trine: 'Lucky feelings. Trust your emotional guidance.',
      square: 'Over-feeling. Where are emotions excessive?',
      sextile: 'Optimistic mood. Emotional abundance.',
    },
    'jupiter-jupiter': {
      conjunction: 'Jupiter return! Major 12-year growth cycle begins.',
      opposition: 'Expansion vs wisdom. Find balance.',
      trine: 'Luck compounds. Big opportunities.',
      square: 'Growth pains. Too much of a good thing?',
      sextile: 'Steady growth. Opportunities multiply.',
    },

    // Transit Saturn aspects
    'saturn-sun': {
      conjunction: 'Major life structure forms. Saturn return energy.',
      opposition: 'External authority challenges you. Stand firm.',
      trine: 'Disciplined self-expression bears fruit.',
      square: 'Challenge to your identity. What must mature?',
      sextile: 'Steady progress. Structure supports goals.',
    },
    'saturn-moon': {
      conjunction: 'Emotional maturity demanded. Feel deeply but wisely.',
      opposition: 'Relationships demand responsibility.',
      trine: 'Stable emotions. Discipline supports feelings.',
      square: 'Emotional restriction. What feeling needs boundaries?',
      sextile: 'Practical emotions. Steady inner strength.',
    },
    'saturn-saturn': {
      conjunction: 'SATURN RETURN. Major life restructuring.',
      opposition: 'Evaluate life structures. Whats working?',
      trine: 'Efforts pay off. Karmic rewards.',
      square: 'Crisis of structure. What needs to change?',
      sextile: 'Steady building. Long-term progress.',
    },

    // Transit Uranus aspects
    'uranus-sun': {
      conjunction: 'IDENTITY REVOLUTION. Who you thought you were is changing.',
      opposition: 'Others disrupt your identity. Wake up.',
      trine: 'Exciting authentic changes. Freedom to be yourself.',
      square: 'Shocking changes to self. Sudden awakening.',
      sextile: 'Refreshing self-expression. New perspectives.',
    },

    // Transit Neptune aspects
    'neptune-sun': {
      conjunction: 'Spiritual awakening or identity confusion. Boundaries dissolve.',
      opposition: 'Others create confusion or inspiration.',
      trine: 'Spiritual flow supports identity. Creative inspiration.',
      square: 'Illusions about self. What delusion must clear?',
      sextile: 'Gentle spiritual insights. Imagination flows.',
    },

    // Transit Pluto aspects
    'pluto-sun': {
      conjunction: 'TOTAL IDENTITY TRANSFORMATION. Death and rebirth of self.',
      opposition: 'Others wield power over your identity. Reclaim it.',
      trine: 'Deep transformation feels natural. Evolve.',
      square: 'Power struggle with yourself. What must die?',
      sextile: 'Subtle transformation. Empowerment.',
    },
    'pluto-pluto': {
      conjunction: 'Pluto return. Once-per-lifetime transformation.',
      opposition: 'Power dynamics shift fundamentally.',
      trine: 'Generational wisdom activates. Transform easily.',
      square: 'Mid-life Pluto square. Everything transforms.',
      sextile: 'Subtle power shifts. Evolution.',
    },
    'pluto-moon': {
      conjunction: 'Emotional rebirth. Deep feelings transform.',
      opposition: 'Others trigger deep emotional transformation.',
      trine: 'Emotional evolution feels natural.',
      square: 'Emotional power struggles. Whats being controlled?',
      sextile: 'Subtle emotional healing. Insight.',
    },
  };

  const key = `${transitPlanet.toLowerCase()}-${natalPlanet.toLowerCase()}`;
  return interpretations[key]?.[aspect] || 
    `Transit ${transitPlanet} ${aspect}s your natal ${natalPlanet}. Pay attention to how ${transitPlanet} themes interact with your ${natalPlanet} expression.`;
};

// Get personalized journal prompt based on transit aspects
export const getPersonalizedJournalPrompt = (
  transitAspects: TransitAspect[],
  moonSign: string,
  moonPhase: string
): string => {
  if (!transitAspects || transitAspects.length === 0) {
    return `Moon in ${moonSign} during ${moonPhase}. How are you feeling today? What arose for you?`;
  }

  const mainAspect = transitAspects[0];
  
  const prompts: Record<string, string> = {
    'Moon-Sun-square': `Transit Moon squares your natal Sun. What tension arose between feelings and identity? How did you honor both?`,
    'Moon-Pluto-conjunction': `Transit Moon conjuncts your natal Pluto. What emotional transformation occurred? What did you feel deeply?`,
    'Mercury-Pluto-conjunction': `Transit Mercury conjuncts your natal Pluto. What deep truths surfaced? What powerful realizations came?`,
    'Mars-Sun-conjunction': `Transit Mars conjuncts your natal Sun. What brave action did you take? How did you assert yourself?`,
    'Venus-Venus-conjunction': `Transit Venus returns to your natal Venus. What do you truly value? What brought you beauty today?`,
    'Saturn-Sun-conjunction': `Transit Saturn conjuncts your natal Sun. What responsibility did you accept? What matured in you?`,
    'Jupiter-Sun-conjunction': `Transit Jupiter conjuncts your natal Sun. What expanded? Where did luck find you?`,
  };

  const specificKey = `${mainAspect.transitPlanet}-${mainAspect.natalPlanet}-${mainAspect.aspect}`;
  if (prompts[specificKey]) {
    return prompts[specificKey];
  }

  // Generate based on natal planet
  const natalPlanetPrompts: Record<string, string> = {
    Moon: `Transit ${mainAspect.transitPlanet} ${mainAspect.aspect}s your natal Moon. What did you feel? How did emotions guide you?`,
    Sun: `Transit ${mainAspect.transitPlanet} ${mainAspect.aspect}s your natal Sun. How did this affect your sense of self?`,
    Mercury: `Transit ${mainAspect.transitPlanet} ${mainAspect.aspect}s your natal Mercury. What thoughts arose? What conversations mattered?`,
    Venus: `Transit ${mainAspect.transitPlanet} ${mainAspect.aspect}s your natal Venus. What did you love? What brought pleasure?`,
    Mars: `Transit ${mainAspect.transitPlanet} ${mainAspect.aspect}s your natal Mars. What action did you take? Where did you assert yourself?`,
    Jupiter: `Transit ${mainAspect.transitPlanet} ${mainAspect.aspect}s your natal Jupiter. What grew? Where did abundance appear?`,
    Saturn: `Transit ${mainAspect.transitPlanet} ${mainAspect.aspect}s your natal Saturn. What responsibility arose? What structured your day?`,
    Pluto: `Transit ${mainAspect.transitPlanet} ${mainAspect.aspect}s your natal Pluto. What transformed? What power shifted?`,
  };

  return natalPlanetPrompts[mainAspect.natalPlanet] || 
    `${mainAspect.interpretation} How did you experience this today?`;
};

// Priority score for natal planets (higher = more significant)
// Personal points and luminaries are what we FEEL most when aspected
const NATAL_PLANET_PRIORITY: Record<string, number> = {
  Sun: 100,        // Identity, vitality - you FEEL this
  Moon: 98,        // Emotions, instincts - equally vital
  Ascendant: 95,   // How you meet the world - physical experience
  MC: 90,          // Career, public life - visible impact
  IC: 85,          // Home, roots - private foundation
  Descendant: 80,  // Relationships - felt through others
  Mercury: 55,     // Mind, communication
  Venus: 55,       // Love, values, pleasure
  Mars: 55,        // Action, drive
  Jupiter: 40,
  Saturn: 40,
  Uranus: 30,
  Neptune: 30,
  Pluto: 30,
  NorthNode: 25,
  Chiron: 35,      // Wounds are felt!
  Lilith: 25,
  Ceres: 20,
  Pallas: 15,
  Juno: 15,
  Vesta: 15,
};

// Priority score for TRANSIT planets
// Outer planets = slower = longer-lasting = MOST FELT in daily life
// Research shows: outer planet transits to personal points are life-defining
const TRANSIT_PLANET_PRIORITY: Record<string, number> = {
  Pluto: 100,      // Transformation - years-long, life-altering
  Neptune: 95,     // Dissolution/dreams - multi-year impact
  Uranus: 90,      // Revolution/awakening - sudden, lasting change
  Saturn: 85,      // Responsibility/structure - 2-3 year themes
  Jupiter: 75,     // Expansion/opportunity - ~1 year themes
  Mars: 50,        // Action/conflict - weeks
  Sun: 40,         // Illumination - daily (but Solar Return is special)
  Venus: 35,       // Love/pleasure - days
  Mercury: 30,     // Communication - fast-moving
  Moon: 20,        // Emotions - hours (fleeting but frequent)
};

// Aspect priority - conjunctions and hard aspects are most felt
const ASPECT_PRIORITY: Record<string, number> = {
  conjunction: 100,  // Merging - MOST powerful
  opposition: 75,    // Awareness, polarity
  square: 70,        // Friction, action-requiring
  trine: 45,         // Easy flow (often unnoticed!)
  sextile: 35,       // Gentle opportunity
};

// Get top transit aspects for calendar display (limit to most significant)
// Priority: Outer planets to personal points, exact orbs first
export const getTopTransitAspects = (aspects: TransitAspect[], limit: number = 3): TransitAspect[] => {
  // Calculate significance score for each aspect
  const withScores = aspects.map(asp => {
    let score = 0;
    const orb = parseFloat(asp.orb);
    
    // ========================================
    // TIER 1: EXACTNESS (most visually impactful)
    // ========================================
    if (asp.isExact) score += 300;           // EXACT = top priority
    else if (orb < 0.5) score += 200;        // Near-exact
    else if (orb < 1) score += 150;          // Very tight
    else if (orb < 2) score += 100;          // Tight
    else if (orb < 3) score += 50;           // Moderate
    // Wide orbs get no bonus
    
    // ========================================
    // TIER 2: OUTER PLANET TRANSITS (most felt)
    // Pluto/Neptune/Uranus transits are LIFE-DEFINING
    // ========================================
    score += TRANSIT_PLANET_PRIORITY[asp.transitPlanet] || 15;
    
    // ========================================
    // TIER 3: PERSONAL NATAL POINTS (Sun/Moon/Asc/MC)
    // These are what you FEEL in your body/life
    // ========================================
    score += NATAL_PLANET_PRIORITY[asp.natalPlanet] || 10;
    
    // ========================================
    // TIER 4: ASPECT TYPE
    // ========================================
    score += ASPECT_PRIORITY[asp.aspect] || 20;
    
    // ========================================
    // SPECIAL BONUSES
    // ========================================
    
    // Outer planet to personal point = THE most significant transits
    const isOuterTransit = ['Pluto', 'Neptune', 'Uranus', 'Saturn', 'Jupiter'].includes(asp.transitPlanet);
    const isPersonalNatal = ['Sun', 'Moon', 'Ascendant', 'MC'].includes(asp.natalPlanet);
    
    if (isOuterTransit && isPersonalNatal) {
      score += 150; // Major life transit bonus
      
      // Extra bonus for hard aspects to personal points (these DEMAND attention)
      if (['conjunction', 'opposition', 'square'].includes(asp.aspect)) {
        score += 75;
      }
    }
    
    // Luminary conjunctions (New Moon on natal Sun, etc.) = peak moments
    if (asp.aspect === 'conjunction') {
      if ((asp.transitPlanet === 'Sun' || asp.transitPlanet === 'Moon') && 
          (asp.natalPlanet === 'Sun' || asp.natalPlanet === 'Moon')) {
        score += 125;
      }
    }
    
    // ========================================
    // PENALTIES for low-impact aspects
    // ========================================
    // Wide orbs to minor bodies = barely noticeable
    if (orb > 5 && !isPersonalNatal) score -= 50;
    if (orb > 6) score -= 40;
    if (orb > 7) score -= 30;
    
    // Fast-moving transit to outer natal = fleeting, less felt
    const isFastTransit = ['Moon', 'Mercury', 'Venus'].includes(asp.transitPlanet);
    const isOuterNatal = ['Uranus', 'Neptune', 'Pluto'].includes(asp.natalPlanet);
    if (isFastTransit && isOuterNatal) score -= 25;
    
    return { aspect: asp, score };
  });
  
  // Sort by score (highest first), then by tighter orb as tiebreaker
  const prioritized = withScores
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return parseFloat(a.aspect.orb) - parseFloat(b.aspect.orb);
    })
    .map(item => item.aspect);

  return prioritized.slice(0, limit);
};
