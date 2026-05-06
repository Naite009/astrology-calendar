// Transit-to-Natal Aspect Calculation System
import { PlanetaryPositions, getPlanetSymbol } from './astrology';
import { NatalChart } from '@/hooks/useNatalChart';
import { getEffectiveOrb } from './aspectOrbs';
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
  // Motion: is the transit closing in (applying) or moving past (separating)?
  applying: boolean;
  // Estimated days until exact (negative = days since exact for separating aspects)
  daysToExact: number;
  // Total felt-window in days (how long this aspect lingers within orb)
  feltDurationDays: number;
  // Felt-sense sentence that adapts to applying vs. separating
  feltSenseDuration: string;
}

// Daily ecliptic motion in degrees (mean values; ignores retrograde nuance for duration estimates)
export const DAILY_SPEED: Record<string, number> = {
  Moon: 13.2, Sun: 0.985, Mercury: 1.4, Venus: 1.2, Mars: 0.524,
  Jupiter: 0.083, Saturn: 0.034, Uranus: 0.012, Neptune: 0.006, Pluto: 0.004,
  Chiron: 0.017, Lilith: 0.111, NorthNode: 0.053,
};

/**
 * Short, plain-English description of a body's daily ecliptic motion,
 * for inline display next to a transit or position.
 */
export function describeDailyMotion(planet: string): { speed: string; pace: string; note: string } | null {
  const key = planet.replace(/\s+/g, '');
  const dpd = DAILY_SPEED[key] ?? DAILY_SPEED[planet];
  if (dpd == null) return null;
  const speed = dpd >= 1 ? `~${dpd.toFixed(1)}°/day` : `~${dpd.toFixed(3)}°/day`;
  let pace = '';
  let note = '';
  if (dpd >= 10) { pace = 'very fast'; note = 'changes signs every ~2.5 days — sets the daily mood.'; }
  else if (dpd >= 1) { pace = 'fast'; note = 'moves through a sign in a few weeks — week-to-week themes.'; }
  else if (dpd >= 0.3) { pace = 'moderate'; note = 'spends ~6–8 weeks per sign — month-long chapters.'; }
  else if (dpd >= 0.08) { pace = 'slow'; note = 'sits in a sign for many months — multi-month story arcs.'; }
  else if (dpd >= 0.02) { pace = 'very slow'; note = 'stays in a sign for 2–3 years — life-chapter pressure.'; }
  else { pace = 'generational'; note = 'creeps less than a degree a year — defines an entire era.'; }
  return { speed, pace, note };
}

// Friendly duration phrasing
function describeDuration(days: number): string {
  if (days < 1) return "a few hours";
  if (days < 2) return "about a day";
  if (days < 4) return "a few days";
  if (days < 8) return "about a week";
  if (days < 16) return "a couple weeks";
  if (days < 35) return "about a month";
  if (days < 70) return "a couple months";
  if (days < 200) return "several months";
  if (days < 500) return "about a year";
  return "a multi-year passage";
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

  // Transit planets to check — includes Chiron, Lilith, North Node so deep aspects
  // (e.g. Lilith conjunct natal Sun) actually surface in the daily readout.
  const tp: any = transitPositions as any;
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
    { key: 'chiron', name: 'Chiron', data: tp.chiron },
    { key: 'lilith', name: 'Lilith', data: tp.lilith },
    { key: 'northNode', name: 'NorthNode', data: tp.northNode },
  ].filter(p => p.data && (p.data as any).signName);

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
        const effectiveOrb = getEffectiveOrb(transit.name, natal.name, aspectType.name);
        if (angleDiff <= effectiveOrb) {
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

          // ─── Applying vs separating + felt-window estimate ───
          // Project the transit forward by 1 day; natal points are static.
          const speed = DAILY_SPEED[transit.name] ?? 0.5;
          const futureLon = (transitLon + speed) % 360;
          let futureDiff = Math.abs(futureLon - natal.longitude);
          if (futureDiff > 180) futureDiff = 360 - futureDiff;
          const futureAngleDiff = Math.abs(futureDiff - aspectType.angle);
          const applying = futureAngleDiff < angleDiff;

          // Days to exact = current orb ÷ daily speed (rough; ignores retrograde stations).
          const daysToExact = speed > 0 ? angleDiff / speed : 999;
          const signedDaysToExact = applying ? daysToExact : -daysToExact;
          // Total felt-window: time to traverse the full orb on either side of exact.
          const feltDurationDays = speed > 0 ? (effectiveOrb * 2) / speed : 999;

          const verb = applying
            ? (angleDiff < 1 ? `peaks now` : `builds toward exact in ${describeDuration(daysToExact)}`)
            : `is releasing — fades over ${describeDuration(daysToExact)}`;
          const totalWindow = describeDuration(feltDurationDays);
          const feltSenseDuration = applying
            ? `Pressure is rising — this ${verb}. You'll feel it most strongly as it tightens, then it eases. Whole window: about ${totalWindow}.`
            : `The peak has passed — this ${verb}. The lesson is integrating now rather than intensifying. Whole window: about ${totalWindow}.`;

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
            applying,
            daysToExact: signedDaysToExact,
            feltDurationDays,
            feltSenseDuration,
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
export const getTopTransitAspects = (aspects: TransitAspect[], limit: number = 5): TransitAspect[] => {
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
    
    // Karmic / shadow bodies (Lilith, Chiron, North Node) hitting a personal point
    // are highly felt and should not be buried — surface them in the top list.
    const isKarmicTransit = ['Lilith', 'Chiron', 'NorthNode'].includes(asp.transitPlanet);
    if (isKarmicTransit && isPersonalNatal) {
      score += 130;
      if (['conjunction', 'opposition', 'square'].includes(asp.aspect)) {
        score += 60;
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

// ─────────────────────────────────────────────────────────────────────────────
// Retrograde-aware motion phase
// ─────────────────────────────────────────────────────────────────────────────
//
// The simple `applying` boolean stored on every TransitAspect uses a mean daily
// speed and projects forward 1 day. That's fine for fast bodies, but it gets
// the *story* wrong for slow bodies near a retrograde station: e.g. Pluto just
// stationed retrograde, the orb is widening *today* (so technically separating),
// but Pluto is about to reverse and come back for another exact pass.
//
// `describeTransitMotionPhase` uses astronomy-engine to compute:
//   - real signed daily motion (positive=direct, negative=retrograde)
//   - whether the orb is shrinking or growing right now
//   - whether a future exact pass is still coming in the scan window
//
// It returns a teen-friendly label + 1-paragraph explanation so the UI can
// say "separating now, but Pluto is retrograde and will hit exact again on…".

import * as Astronomy from 'astronomy-engine';
import { getPlanetLongitudeExact, aspectOrb } from './transitMath';
import { getOuterTransitTiming } from './outerPlanetTransitTiming';

const ASTRO_BODY: Record<string, Astronomy.Body> = {
  Sun: 'Sun' as Astronomy.Body,
  Mercury: 'Mercury' as Astronomy.Body,
  Venus: 'Venus' as Astronomy.Body,
  Mars: 'Mars' as Astronomy.Body,
  Jupiter: 'Jupiter' as Astronomy.Body,
  Saturn: 'Saturn' as Astronomy.Body,
  Uranus: 'Uranus' as Astronomy.Body,
  Neptune: 'Neptune' as Astronomy.Body,
  Pluto: 'Pluto' as Astronomy.Body,
};

const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0, opposition: 180, trine: 120, square: 90,
  sextile: 60, quincunx: 150, semisextile: 30,
};

export interface TransitMotionPhase {
  /** "applying" | "separating" | "stationary" — true direction *right now* */
  liveDirection: 'applying' | 'separating' | 'stationary';
  /** "direct" | "retrograde" | "stationing" — the planet's actual motion */
  motion: 'direct' | 'retrograde' | 'stationing';
  /** Short label for a badge: e.g. "Separating · Retrograde · returns Jan 12" */
  badge: string;
  /** Teen-friendly 2–3 sentence explanation of what's happening */
  explanation: string;
  /** Date of the next exact pass, if one exists in the scan window */
  nextExactDate: Date | null;
  /** Total number of exact passes in the scan window (1 = single pass, 3 = full retrograde dance) */
  totalPasses: number;
}

const formatShortDate = (d: Date): string =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

export function describeTransitMotionPhase(
  transitPlanet: string,
  natalLongitude: number,
  aspectName: string,
  referenceDate: Date = new Date(),
): TransitMotionPhase | null {
  const body = ASTRO_BODY[transitPlanet];
  const aspectAngle = ASPECT_ANGLES[aspectName];
  if (!body || aspectAngle === undefined) return null;

  // Real signed motion: longitude tomorrow vs today.
  const lonNow = getPlanetLongitudeExact(body, referenceDate);
  const lonNext = getPlanetLongitudeExact(body, new Date(referenceDate.getTime() + 86400000));
  let signedDelta = lonNext - lonNow;
  if (signedDelta > 180) signedDelta -= 360;
  if (signedDelta < -180) signedDelta += 360;
  const speedAbs = Math.abs(signedDelta);

  // Stationing threshold: outer planets crawl <0.005°/day near a station.
  const isStationary = speedAbs < 0.005;
  const motion: TransitMotionPhase['motion'] =
    isStationary ? 'stationing' : signedDelta > 0 ? 'direct' : 'retrograde';

  // Live applying/separating from real orbs (today vs tomorrow).
  const orbNow = aspectOrb(lonNow, natalLongitude, aspectAngle);
  const orbNext = aspectOrb(lonNext, natalLongitude, aspectAngle);
  const liveDirection: TransitMotionPhase['liveDirection'] =
    isStationary ? 'stationary' : orbNext < orbNow ? 'applying' : 'separating';

  // Check for future exact passes (uses cached outer-planet timing).
  let nextExactDate: Date | null = null;
  let totalPasses = 0;
  const timing = getOuterTransitTiming(
    transitPlanet, 'natal', natalLongitude, aspectName, aspectAngle, referenceDate,
  );
  if (timing) {
    totalPasses = timing.exactPasses.length;
    const future = timing.exactPasses.find(p => p.date.getTime() > referenceDate.getTime());
    if (future) nextExactDate = future.date;
  }

  // Build badge + explanation.
  const motionWord = motion === 'direct' ? 'Direct' : motion === 'retrograde' ? 'Retrograde' : 'Stationing';
  const directionWord =
    liveDirection === 'applying' ? 'Applying'
    : liveDirection === 'separating' ? 'Separating'
    : 'Holding still';

  let badge = `${directionWord} · ${motionWord}`;
  if (nextExactDate) badge += ` · returns ${formatShortDate(nextExactDate)}`;

  let explanation: string;

  if (motion === 'stationing') {
    explanation =
      `${transitPlanet} is barely moving right now — it's "stationing," like a car idling before it changes direction. ` +
      `That makes whatever this aspect is about feel extra loud and frozen in place for several days.`;
    if (nextExactDate) {
      explanation += ` The next exact hit is around ${formatShortDate(nextExactDate)}.`;
    }
  } else if (motion === 'retrograde' && liveDirection === 'separating' && nextExactDate) {
    // The interesting case: looks like it's fading, but it's coming back.
    explanation =
      `Heads-up: even though the orb is opening up today, ${transitPlanet} is retrograde — that means it's moving backward in the sky. ` +
      `So this aspect isn't really "done." It's going to swing back and hit exact again around ${formatShortDate(nextExactDate)}. ` +
      `Astrologers don't usually call a backward-moving planet "applying" — they just say it's going to perfect again. Either way, the theme isn't finished with you yet.`;
  } else if (motion === 'retrograde' && liveDirection === 'applying') {
    explanation =
      `${transitPlanet} is retrograde and tightening toward exact — it's walking *backward* into this aspect. ` +
      `That usually feels like an old story circling back: same lesson, second look.`;
    if (nextExactDate) explanation += ` Exact again around ${formatShortDate(nextExactDate)}.`;
  } else if (liveDirection === 'applying') {
    explanation =
      `${transitPlanet} is moving forward and the orb is closing — pressure is rising toward the exact hit.`;
    if (nextExactDate) explanation += ` Peaks around ${formatShortDate(nextExactDate)}.`;
  } else {
    // direct + separating, no future pass
    explanation =
      `${transitPlanet} has already crossed the exact point and is moving forward away from it. ` +
      `The peak intensity has passed; what's left is integration — noticing what shifted.`;
    if (totalPasses > 1) {
      explanation += ` This aspect already had its full retrograde "dance" (${totalPasses} exact passes), so the lesson has been thoroughly delivered.`;
    }
  }

  return {
    liveDirection,
    motion,
    badge,
    explanation,
    nextExactDate,
    totalPasses,
  };
}


// ============================================================================
// FELT-SENSE LIBRARY — concrete real-life descriptions per (transit × natal × aspect)
//
// Per the Hybrid Clarity Rule: situation → feeling → why. No abstract trait words.
// Each entry describes what the user is likely to NOTICE in their life this week,
// not the textbook keyword. Returns null if no specific entry exists, so the UI
// can fall back to a generic phrasing.
// ============================================================================

type FeltSenseEntry = {
  /** What is actually happening / what you'll notice (situation + feeling). */
  felt: string;
  /** Optional one-line "why this is happening astrologically" — plain language. */
  why?: string;
};

// Aspect "flavor" — how the geometry colors the experience.
// conjunction = fused/loud, opposition = mirrored/tug-of-war, square = friction/forcing,
// trine = open door/permission, sextile = small invitation, quincunx = awkward adjustment.

const FELT_SENSE: Record<string, Record<string, FeltSenseEntry>> = {
  // ---- PLUTO transits ----
  'pluto-moon': {
    conjunction: { felt: 'Old emotional patterns surface — a feeling, a memory, or a person from your past keeps coming up. You may feel things more deeply than usual, and small moments hit harder. Something about how you take care of yourself is being rewritten from the inside out.', why: 'Pluto exposes what your Moon (your inner life, your needs, your home) has been hiding.' },
    opposition: { felt: 'Someone close — partner, family, a roommate — keeps mirroring your deepest feelings back to you, and it can feel intense or even confrontational. You notice yourself reacting bigger than the situation calls for. It\'s pointing at an old emotional wound that\'s ready to be seen.', why: 'Pluto on the other side of your Moon brings buried feelings up through other people.' },
    square: { felt: 'You feel pulled between what you NEED emotionally and what your life or family actually allows. Mood swings, sudden cravings for solitude, or a wish to blow something up are normal. The pressure is forcing a real change in how you do "comfort" and "home."', why: 'Pluto is grinding against your Moon — the friction is the upgrade.' },
    trine: { felt: 'Deep feelings come up but they don\'t overwhelm you — you can actually look at them. A long-held emotional habit (over-giving, hiding, numbing) loosens its grip almost on its own. Conversations about feelings go deeper than usual without drama.', why: 'Pluto and your Moon are working together — transformation feels safe right now.' },
    sextile: { felt: 'Small moments invite real emotional honesty — a friend asks how you\'re doing and you actually tell them. You notice you can let go of one small grudge or habit that\'s been quietly draining you.', why: 'A gentle Pluto–Moon channel: subtle healing, no fireworks.' },
  },
  'pluto-sun': {
    conjunction: { felt: 'You feel like a different person is trying to come through — old labels, old jobs, old roles suddenly don\'t fit. Sometimes feels like an identity crisis; sometimes like quiet, total clarity about what has to change.', why: 'Pluto right on your Sun rebuilds who you are from the ground up.' },
    opposition: { felt: 'Someone with real influence (a boss, partner, parent) keeps pushing on your sense of self. You\'re forced to figure out where you end and where their power begins.', why: 'Pluto opposite your Sun brings transformation through other people\'s pressure.' },
    square: { felt: 'You hit a wall: the way you\'ve been showing up isn\'t working anymore. Frustration, stuckness, or a sense of "I have to change something" that won\'t go away.', why: 'Pluto squaring your Sun forces a real-life restructure of your identity.' },
    trine: { felt: 'You feel quietly more powerful — able to make choices that match who you really are without explaining yourself. Good time to step into something bigger.', why: 'Pluto and your Sun in flow: deep change without the crisis.' },
    sextile: { felt: 'Small openings to step into more authority or take yourself more seriously. A door cracks open if you reach for it.' },
  },
  'pluto-venus': {
    conjunction: { felt: 'A relationship, a value, or something you love gets totally rewritten. Could be obsession, jealousy, a magnetic attraction, OR a clean ending you\'ve needed for a long time.', why: 'Pluto on your Venus transforms what (and how) you love.' },
    opposition: { felt: 'A relationship intensifies — fast bond, power struggle, or someone who makes you feel everything at once. Finances or a big purchase may also get loud.', why: 'Pluto opposite Venus pulls hidden relationship dynamics into the open.' },
    square: { felt: 'Tension in love or money: jealousy, control issues, a values clash, or feeling someone is trying to "own" you. Forces you to redefine what you actually want.', why: 'Pluto squaring Venus is a relationship pressure-cooker.' },
    trine: { felt: 'Attractions feel deeper and more meaningful. A relationship can transform in a good way; finances or self-worth quietly upgrade.' },
    sextile: { felt: 'Small chance to deepen a connection or make a smarter money move. Subtle but real.' },
  },
  'pluto-mars': {
    conjunction: { felt: 'Your drive is on overdrive — you can move mountains or get into a fight. Sex, anger, and ambition all amplified.' },
    opposition: { felt: 'Power struggles with someone — at work, at home, or in traffic. Don\'t take the bait.' },
    square: { felt: 'Frustration that won\'t quit. Channel it into hard physical work or a project, or it leaks out as conflict.' },
    trine: { felt: 'Your energy is focused and strong — great for tackling something hard you\'ve been avoiding.' },
    sextile: { felt: 'Quiet boost of stamina and willpower.' },
  },
  'pluto-mercury': {
    conjunction: { felt: 'Your mind goes deep — research, investigation, or one thought you cannot stop turning over. Conversations get unusually honest.' },
    opposition: { felt: 'Intense talks; secrets surface; someone says the thing you\'ve been avoiding.' },
    square: { felt: 'Mental loops, obsessive thinking, or a conversation that turns into a power struggle.' },
    trine: { felt: 'You can finally say (or write) the hard true thing. Great for any kind of deep work.' },
    sextile: { felt: 'A small but sharp insight — pay attention to what keeps coming up.' },
  },

  // ---- NEPTUNE transits ----
  'neptune-moon': {
    conjunction: { felt: 'Your feelings get foggy and dreamy — you absorb other people\'s moods, cry at commercials, or can\'t tell if you\'re tired or sad. Sleep is weird; intuition is sky-high. Don\'t make big logistics decisions about home or family right now.', why: 'Neptune dissolves the usual edges of your Moon (your inner weather).' },
    opposition: { felt: 'Someone close — partner, family member — confuses you. You can\'t tell what they\'re actually feeling, or you keep over-empathizing until you lose yourself in it. Boundaries blur.', why: 'Neptune opposite your Moon pulls in misunderstanding and fantasy through relationships.' },
    square: { felt: 'You feel emotionally tired in a way you can\'t explain. Old escape habits (scrolling, drinking, daydreaming, over-giving) get tempting. Your gut says one thing, your head says another, and neither feels reliable.', why: 'Neptune square Moon = emotional fog you have to walk through, not around.' },
    trine: { felt: 'Compassion comes easy, art and music hit deeper, dreams are vivid. Good time for anything spiritual, creative, or tender.', why: 'Neptune and your Moon in flow — your imagination is wide open.' },
    sextile: { felt: 'A small wave of empathy or inspiration. Be gentle with yourself today.' },
  },
  'neptune-sun': {
    conjunction: { felt: 'You\'re less sure of who you are — and that\'s actually the point. Old definitions of yourself dissolve; new ones haven\'t arrived yet. Tired, dreamy, or weirdly inspired.' },
    opposition: { felt: 'Someone you look up to (or look at) reflects confusion back at you. Hard to see them — or yourself — clearly.' },
    square: { felt: 'Confusion about your direction. Avoid signing big things or making identity-defining choices in fog.' },
    trine: { felt: 'Creative flow, easy spirituality, a sense your life has meaning bigger than the to-do list.' },
    sextile: { felt: 'A small whisper of inspiration — follow it.' },
  },
  'neptune-venus': {
    conjunction: { felt: 'Romantic, dreamy, idealizing — you may see someone (or something you want to buy) through rose-colored glasses. Beautiful, but wait before committing.' },
    opposition: { felt: 'A relationship feels confusing — mixed signals, idealization, or someone who isn\'t who they seemed.' },
    square: { felt: 'Disappointment or self-deception in love or money. Clarity comes later — don\'t force it now.' },
    trine: { felt: 'Love, art, and beauty all feel easier and deeper. Great for anything creative or romantic.' },
    sextile: { felt: 'A sweet, soft moment in love or aesthetics.' },
  },

  // ---- URANUS transits ----
  'uranus-moon': {
    conjunction: { felt: 'Your emotional rhythm gets shaken up — sudden mood swings, restlessness at home, the urge to change your room, your routine, or who you live with. You may feel "I can\'t do this the same way anymore."', why: 'Uranus on your Moon breaks the usual emotional pattern open.' },
    opposition: { felt: 'Someone close acts unpredictably, or YOU do — surprise news, a sudden change in a close relationship, an emotional jolt from out of nowhere.', why: 'Uranus opposite Moon delivers shock through people you live with or love.' },
    square: { felt: 'Restless, irritable, can\'t sit still emotionally. Your usual coping doesn\'t work. Something in your home life or routine wants to change NOW.', why: 'Uranus squaring your Moon won\'t let you settle until you change something.' },
    trine: { felt: 'Refreshing emotional clarity — you suddenly see what to do differently. Easy time to change a habit or shake up your space.' },
    sextile: { felt: 'A small "aha" about what you actually need. Try one new thing.' },
  },
  'uranus-venus': {
    conjunction: { felt: 'Sudden attraction, surprise crush, unexpected money news, or you suddenly want something completely different in love or aesthetics. Could be exciting or destabilizing.' },
    opposition: { felt: 'Someone in your life surprises you — a relationship suddenly shifts, an attraction comes out of nowhere, or money news lands fast. Old security around love and value gets shaken.', why: 'Uranus opposite Venus shocks open whatever you\'ve been quietly tolerating.' },
    square: { felt: 'Restless in a relationship or with how you spend money. The urge to do something impulsive in love or finances is strong — sleep on it before you act.' },
    trine: { felt: 'Exciting new connection, a fun freedom in how you love or spend, or a clever idea about money.' },
    sextile: { felt: 'A small surprise in love, friendship, or income — usually a good one.' },
  },
  'uranus-sun': {
    conjunction: { felt: 'Identity reset. You wake up wanting to be more YOU, even if it disrupts everything. Sudden insights about who you actually are.' },
    opposition: { felt: 'Someone shakes your sense of self — challenging you, surprising you, or breaking a pattern you were stuck in.' },
    square: { felt: 'Restless and itchy in your own life. Something has to change about how you show up, even if you can\'t name it yet.' },
    trine: { felt: 'Freedom to be more yourself, with less friction. Good time for a brave move.' },
    sextile: { felt: 'A small invitation to try something new about how you present yourself.' },
  },

  // ---- SATURN transits ----
  'saturn-moon': {
    conjunction: { felt: 'You feel more alone, more serious, or like the emotional load is heavy. A reality check about home, family, or how you take care of yourself.', why: 'Saturn on your Moon asks you to grow up emotionally.' },
    opposition: { felt: 'A close person (partner, parent, roommate) feels distant, demanding, or like a wall. You\'re being asked to set a real boundary.' },
    square: { felt: 'Heavy, low-energy mood; what usually comforts you doesn\'t work; obligation outweighs joy. Builds emotional resilience the hard way.' },
    trine: { felt: 'Your emotions feel stable and grown-up. Good time to commit to a routine that takes care of you long-term.' },
    sextile: { felt: 'A small chance to set a boundary or build a healthy habit — it sticks.' },
  },
  'saturn-sun': {
    conjunction: { felt: 'A serious chapter — you\'re being asked to step up, take responsibility, or face the gap between who you say you are and how you actually live.' },
    opposition: { felt: 'Authority figures (boss, dad, teacher) push back on you. Tests whether you can hold your own.' },
    square: { felt: 'Frustration: hard work without obvious reward yet. The structure you\'re building is invisible right now.' },
    trine: { felt: 'Effort pays off. Good time to commit to something long-term that matches who you really are.' },
    sextile: { felt: 'A small step toward a long-term goal — take it.' },
  },
  'saturn-venus': {
    conjunction: { felt: 'Love and money get serious — commitment, a real conversation about the relationship, or facing a financial reality.' },
    opposition: { felt: 'A relationship feels heavy, distant, or like work. Or someone wants more commitment than you\'re ready for.' },
    square: { felt: 'Tension between what you want and what\'s realistic. Could feel lonely or restricted in love or money.' },
    trine: { felt: 'Solid, grown-up love and money decisions go well. A relationship can deepen for real.' },
  },

  // ---- JUPITER transits ----
  'jupiter-moon': {
    conjunction: { felt: 'Mood lifts, generosity flows, you want to feed people and be fed. Easy joy at home.' },
    opposition: { felt: 'A close relationship gets bigger — more time together, more emotional intensity (good or overwhelming).' },
    square: { felt: 'Over-eating, over-spending, over-giving. Feels good in the moment but watch the limits.' },
    trine: { felt: 'Genuine happiness and emotional luck. Good day to ask for what you need.' },
    sextile: { felt: 'Small win for your mood or your home life.' },
  },
  'jupiter-sun': {
    conjunction: { felt: 'Confidence boost. Doors open if you walk toward them.' },
    opposition: { felt: 'Someone offers you something big — opportunity or excess. Read the fine print.' },
    square: { felt: 'Overconfidence trap. Where are you over-extending?' },
    trine: { felt: 'Lucky day for visibility, opportunity, or a bold ask.' },
  },
};

/**
 * Returns a concrete, real-life felt-sense description for a transit.
 * Falls back to null if no specific entry exists; the UI should then show a generic line.
 */
export function getFeltSenseDescription(
  transitPlanet: string,
  natalPlanet: string,
  aspect: string,
): FeltSenseEntry | null {
  const tp = transitPlanet.toLowerCase().replace(/\s+/g, '');
  const np = natalPlanet.toLowerCase().replace(/\s+/g, '');
  const asp = aspect.toLowerCase();

  // Normalize: "northnode" / "ascendant" / "mc" not yet in library — return null and let fallback handle it.
  const key = `${tp}-${np}`;
  return FELT_SENSE[key]?.[asp] || null;
}
