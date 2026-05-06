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
  if (dpd >= 10) { pace = 'very fast'; note = 'changes signs every ~2.5 days, sets the daily mood.'; }
  else if (dpd >= 1) { pace = 'fast'; note = 'moves through a sign in a few weeks, week-to-week themes.'; }
  else if (dpd >= 0.3) { pace = 'moderate'; note = 'spends ~6–8 weeks per sign, month-long chapters.'; }
  else if (dpd >= 0.08) { pace = 'slow'; note = 'sits in a sign for many months, multi-month story arcs.'; }
  else if (dpd >= 0.02) { pace = 'very slow'; note = 'stays in a sign for 2–3 years, life-chapter pressure.'; }
  else { pace = 'generational'; note = 'creeps less than a degree a year, defines an entire era.'; }
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

  // Transit planets to check, includes Chiron, Lilith, North Node so deep aspects
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

  // Natal planets to check, use corrected Ascendant from houseCusps.house1
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
            : `is releasing, fades over ${describeDuration(daysToExact)}`;
          const totalWindow = describeDuration(feltDurationDays);
          const feltSenseDuration = applying
            ? `Pressure is rising, this ${verb}. You'll feel it most strongly as it tightens, then it eases. Whole window: about ${totalWindow}.`
            : `The peak has passed, this ${verb}. The lesson is integrating now rather than intensifying. Whole window: about ${totalWindow}.`;

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
      square: 'Head says one thing, gut says another. Pick which one you actually trust before you act.',
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
      trine: 'Mood lifts. Say yes to the unplanned thing, the last-minute invite, the new place to eat.',
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
      conjunction: 'You will say the thing nobody else has dared to say. People will remember it. Choose your words on purpose.',
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
    // are highly felt and should not be buried, surface them in the top list.
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
  /** "applying" | "separating" | "stationary", true direction *right now* */
  liveDirection: 'applying' | 'separating' | 'stationary';
  /** "direct" | "retrograde" | "stationing", the planet's actual motion */
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
      `${transitPlanet} is barely moving right now, it's "stationing," like a car idling before it changes direction. ` +
      `That makes whatever this aspect is about feel extra loud and frozen in place for several days.`;
    if (nextExactDate) {
      explanation += ` The next exact hit is around ${formatShortDate(nextExactDate)}.`;
    }
  } else if (motion === 'retrograde' && liveDirection === 'separating' && nextExactDate) {
    // The interesting case: looks like it's fading, but it's coming back.
    explanation =
      `Heads-up: even though the orb is opening up today, ${transitPlanet} is retrograde, that means it's moving backward in the sky. ` +
      `So this aspect isn't really "done." It's going to swing back and hit exact again around ${formatShortDate(nextExactDate)}. ` +
      `Astrologers don't usually call a backward-moving planet "applying", they just say it's going to perfect again. Either way, the theme isn't finished with you yet.`;
  } else if (motion === 'retrograde' && liveDirection === 'applying') {
    explanation =
      `${transitPlanet} is retrograde and tightening toward exact, it's walking *backward* into this aspect. ` +
      `That usually feels like an old story circling back: same lesson, second look.`;
    if (nextExactDate) explanation += ` Exact again around ${formatShortDate(nextExactDate)}.`;
  } else if (liveDirection === 'applying') {
    explanation =
      `${transitPlanet} is moving forward and the orb is closing, pressure is rising toward the exact hit.`;
    if (nextExactDate) explanation += ` Peaks around ${formatShortDate(nextExactDate)}.`;
  } else {
    // direct + separating, no future pass
    explanation =
      `${transitPlanet} has already crossed the exact point and is moving forward away from it. ` +
      `The peak intensity has passed; what's left is integration, noticing what shifted.`;
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
// FELT-SENSE LIBRARY, COMPOSITIONAL
//
// Built from FOUR layers, not a flat lookup:
//   1. Aspect dynamic   (geometry: fusion / mirror / friction / flow / opening / awkward)
//   2. Transit pressure (what the outer planet DOES: rebuild / dissolve / shock / pressure / expand)
//   3. Natal anchor     (what the natal planet RUNS in you: feelings / identity / love-money / drive / mind)
//   4. House anchor     (which life area this is actually playing out in, from natalHouse and transitHouse)
//
// This way the description is always grounded in the user's actual chart instead
// of pre-baking assumptions like "opposition = partner shows up". A 7th-house
// natal Moon vs a 4th-house natal Moon should feel completely different even
// for the same aspect.
//
// Per the Hybrid Clarity Rule: situation → feeling → why. No abstract trait words.
// ============================================================================

type FeltSenseEntry = {
  /** What is actually happening / what you'll notice (situation + feeling). */
  felt: string;
  /** Optional one-line "why this is happening astrologically", plain language. */
  why?: string;
};

// ---------- Layer 1: ASPECT DYNAMIC (pure geometry, no life-area assumptions) ----------
// Opposition does NOT mean "a partner shows up". It means the energy plays out
// across a polarity, often through whatever (or whoever) sits opposite you in
// the relevant life area. The actual life area comes from the natal house.
const ASPECT_DYNAMIC: Record<string, { verb: string; flavor: string; intensity: 'high' | 'medium' | 'low' }> = {
  conjunction: { verb: 'fuses with', flavor: 'loud, direct, impossible to ignore: this energy is sitting on top of you and you\'ll feel it in your body and your day', intensity: 'high' },
  opposition:  { verb: 'shows up across from', flavor: 'a tug-of-war between two real, valid sides of your life: often felt through another person mirroring it back to you, but just as often an internal pull where every choice for one side costs the other', intensity: 'high' },
  square:      { verb: 'grinds against', flavor: 'real friction that won\'t let you stay where you are: something has to give, and the longer you sit still, the louder it gets', intensity: 'high' },
  trine:       { verb: 'flows easily with', flavor: 'low-resistance and easy: things click, doors open without you forcing them, and you\'ll only get the benefit if you actually walk through (it\'s easy to sleep through trines)', intensity: 'medium' },
  sextile:     { verb: 'offers a small opening to', flavor: 'a quiet, easy-to-miss opportunity: a useful conversation, a small introduction, a small idea, only worth something if you reach out and take it', intensity: 'low' },
  quincunx:    { verb: 'creates an awkward fit with', flavor: 'a constant low-grade misfit: nothing dramatic, just a feeling that things keep being slightly off and need small constant adjustments (the schedule, the body, the relationship, the plan)', intensity: 'medium' },
  semisextile: { verb: 'subtly nudges', flavor: 'a low background hum you only notice if you\'re paying attention: a small mood shift, a small pull, easy to miss', intensity: 'low' },
};

// ---------- Layer 2: TRANSIT-PLANET PRESSURE (what the visiting planet DOES) ----------
const TRANSIT_PRESSURE: Record<string, { action: string; timeframe: string; warning?: string }> = {
  Pluto: {
    action: 'forces a deep, slow rebuild of this part of your life: something here that you\'ve outgrown but kept propping up (a job, a relationship dynamic, an identity, a habit, a power imbalance) starts breaking down on its own, and you\'ll feel obsessed with it, unable to look away, sometimes scared of what\'s being uncovered. By the end you won\'t recognize the old version of yourself in this area',
    timeframe: 'years (this is the slowest, deepest pressure in your chart)',
    warning: 'don\'t try to manage or speed up the outcome: the more you grip, the harder it pries your fingers loose. Your job is to notice what genuinely refuses to stay the same and stop defending it',
  },
  Neptune: {
    action: 'makes this part of your life feel hazy and hard to see clearly: you\'ll second-guess what you actually feel, romanticize people or situations, lose motivation, feel more tired than usual, or get pulled toward escape (sleep, scrolling, drinking, fantasy, daydreaming about a different life)',
    timeframe: 'about 1 to 2 years of background haze, with peaks',
    warning: 'don\'t sign contracts, make big commitments, or fully trust your read on a person right now: your gut is picking up real signals but also a lot of static, so wait for the fog to lift before deciding',
  },
  Uranus: {
    action: 'breaks the routine open in this area, usually through something you didn\'t plan for: a sudden opportunity, an unexpected exit, a person leaving or arriving out of nowhere, or your own restlessness hitting a breaking point where you can\'t do it the old way one more day. Expect plans to change last minute and to feel weirdly alive even when it\'s stressful',
    timeframe: 'roughly a year, with sharp jolts at the exact passes',
    warning: 'the urge to quit, leave, or blow it up is real information, but acting on it in 24 hours usually overshoots. Sleep on big moves, then move',
  },
  Saturn: {
    action: 'puts slow, heavy pressure on this part of your life and asks "is this actually built right?" Anything you\'ve been faking, avoiding, or duct-taping together starts cracking, and anything you\'ve quietly built well starts paying off. Expect to feel older, more tired, more serious here, with a lot of "I have to deal with this now"',
    timeframe: 'about a year, in 2 or 3 distinct waves',
    warning: 'this is not the moment to walk away from the work: the reward shows up after the grind, not during it',
  },
  Jupiter: {
    action: 'opens this part of your life up: more opportunities, more invitations, more confidence, more "yes" energy, but also more spending, more commitments, more stuff on your plate than you can actually carry. You\'ll feel optimistic and a little overconfident',
    timeframe: 'a few weeks per pass, full year of background luck-or-bloat',
    warning: 'don\'t say yes to everything just because it\'s available, and watch the spending and the promises: the bill comes after Jupiter leaves',
  },
  Chiron: {
    action: 'reopens an old wound in this area (often something from childhood, a parent, an early rejection, or a place you decided you weren\'t enough): the same hurt comes back up in a current situation, but this time you\'re old enough to actually tend to it instead of just survive it. Expect to feel raw, easily triggered, and surprisingly tender',
    timeframe: 'months, comes in waves',
  },
  Lilith: {
    action: 'exposes whatever you\'ve been making yourself smaller, quieter, or more polite about in this area. You\'ll feel angrier than usual, less willing to perform, more allergic to people who talk over you or take you for granted, and pulled toward saying the thing you usually swallow',
    timeframe: 'about 9 months in this part of your chart',
  },
  Mars: {
    action: 'turns up the heat fast in this area: more drive, more urgency, shorter fuse, more libido, more "let\'s go right now." You\'ll get a lot done, and you\'ll also pick fights more easily, especially with people who are slowing you down',
    timeframe: 'a few days to a week',
    warning: 'channel it into a workout, a hard task, or something physical before it leaks into a conversation you\'ll regret',
  },
};

// ---------- Layer 3: NATAL-PLANET ANCHOR (what part of YOU is being touched) ----------
const NATAL_ANCHOR: Record<string, { runs: string; signals: string }> = {
  Sun:     { runs: 'your core identity, vitality, and sense of self',           signals: 'your energy level, your confidence, whether you feel seen or invisible, and how willing you are to take up space in a room' },
  Moon:    { runs: 'your inner emotional weather, instincts, and need for safety', signals: 'your moods, your sleep, what you crave to eat, who you want near you, and what suddenly makes you cry or shut down' },
  Mercury: { runs: 'how you think, talk, and process information',              signals: 'how clear or scattered your head feels, the conversations you keep replaying, texts and emails, scheduling, and what your brain won\'t stop chewing on at 2am' },
  Venus:   { runs: 'what you value, who and what you\'re drawn to, your sense of beauty and worth', signals: 'who you\'re attracted to, what you spend money on, how you feel about your own body in the mirror, and whether you feel loved or overlooked' },
  Mars:    { runs: 'your drive, anger, and how you go after things',            signals: 'your energy in your body, your patience level, your sex drive, how quickly you snap, and whether you\'re initiating or stalling' },
  Jupiter: { runs: 'where you reach for more, your faith and your blind spots', signals: 'how lucky or stuck you feel, the size of the opportunities showing up, how much you\'re saying yes to, and whether you\'re overcommitting or overspending' },
  Saturn:  { runs: 'where you build long-term structure and where you feel limited', signals: 'what feels heavy and adult right now, what responsibilities you can\'t put off, what fear keeps coming up, and what slow project is finally paying off (or finally falling apart)' },
  Uranus:  { runs: 'where you need freedom and where you break patterns',       signals: 'how restless you feel in your own life, the sudden ideas or urges to leave, plans that get blown up last minute, and the parts of your routine you can\'t tolerate one more week' },
  Neptune: { runs: 'where you dream, dissolve, or escape',                      signals: 'how foggy or inspired you feel, what you\'re fantasizing about, who or what you\'re idealizing, your dreams at night, and what you\'re using to check out (sleep, screens, substances, daydreams)' },
  Pluto:   { runs: 'where you\'ve been transforming for life',                  signals: 'who or what you\'re obsessed with, the power dynamic you can\'t stop noticing, what you\'re afraid will get exposed, and the part of yourself that\'s quietly dying off' },
  Ascendant: { runs: 'how you show up and the body you live in',                signals: 'what people say about you when they first meet you, how you look in the mirror this week, your posture, your wardrobe, and the version of you that walks into the room' },
  MC:      { runs: 'your public role, career, and reputation',                  signals: 'what\'s happening at work, who\'s noticing you (or not), your title, your boss, and what people who don\'t know you personally think you do' },
  IC:      { runs: 'your private self, home, and emotional roots',              signals: 'how your home feels when you walk in, what\'s coming up about your parents or childhood, what you only let yourself feel when no one\'s watching, and whether you feel rooted or unmoored' },
  Descendant: { runs: 'what you meet in close partners and open enemies',       signals: 'the dynamic with your partner or closest collaborator, who\'s suddenly pushing your buttons, what kind of person you keep attracting, and what you keep negotiating' },
  NorthNode: { runs: 'the unfamiliar direction your soul is growing toward',    signals: 'what feels new and a little scary but oddly right, the door you keep walking past, and the version of your life you can almost picture but haven\'t built yet' },
  Lilith:  { runs: 'the part of you that refuses to be small or polite',        signals: 'what you\'re suddenly furious about, the boundary you\'re done apologizing for, and the desire or opinion you usually keep to yourself but can\'t anymore' },
  Chiron:  { runs: 'your oldest wound, the one you eventually help others with',signals: 'the old hurt that just got poked again, where you feel like a fraud or "not enough," and the place where, ironically, other people keep coming to you for help' },
};

// ---------- Layer 4: HOUSE LIFE AREA ----------
// This is the most important new layer. Same aspect, different house = totally
// different lived experience. We use compact, plain-language house phrases here
// (not "house of partnerships, marriage, open enemies", which is jargon).
const HOUSE_LIFE_AREA: Record<number, { area: string; example: string }> = {
  1:  { area: 'how you show up, your body, your appearance, your name',          example: 'you may notice it in the mirror, in your energy, or in how people first respond to you' },
  2:  { area: 'your money, possessions, and sense of self-worth',                example: 'showing up in income, spending, or the question "am I enough on my own"' },
  3:  { area: 'daily communication, siblings, neighbors, short trips, learning', example: 'showing up in texts, conversations, errands, or what you\'re studying' },
  4:  { area: 'your home, family, private life, and emotional roots',            example: 'showing up in the house you live in, parents, ancestry, or what you only feel in private' },
  5:  { area: 'creativity, romance, kids, play, what you make for the joy of it',example: 'showing up in dating, art, performance, kids, or risk-taking for fun' },
  6:  { area: 'daily work, health, routines, and small habits',                  example: 'showing up in your body, your job tasks, your daily schedule, or pets' },
  7:  { area: 'one-on-one partnerships and the people directly across from you', example: 'showing up through a partner, a close collaborator, or a clear opponent' },
  8:  { area: 'shared resources, intimacy, debt, sex, and deep transformation',  example: 'showing up in joint money, taxes, intimacy, therapy, or grief' },
  9:  { area: 'long-distance travel, big beliefs, higher learning, and meaning', example: 'showing up in travel, school, publishing, or your worldview shifting' },
  10: { area: 'your career, public role, and reputation',                        example: 'showing up at work, in your title, or in what you\'re publicly known for' },
  11: { area: 'friends, groups, networks, and your long-term hopes',             example: 'showing up through friends, online community, organizations, or future plans' },
  12: { area: 'what\'s hidden, dreams, retreat, and what you do alone',          example: 'showing up in dreams, solitude, hospitals, behind-the-scenes work, or the unconscious' },
};

// House family for fallback warmth when we don't have an exact natal house
const HOUSE_FAMILY: Record<string, string> = {
  Sun: 'identity', Moon: 'inner life', Mercury: 'mind', Venus: 'love and money',
  Mars: 'drive', Jupiter: 'growth', Saturn: 'long-term work',
};

const lower = (s: string) => s.toLowerCase().replace(/\s+/g, '');

/**
 * Compose a felt-sense description from aspect + transit + natal planet + houses.
 *
 * Returns null only if we cannot identify the natal planet at all.
 * Always prefers grounded house-specific copy when natalHouse is provided.
 */
export function getFeltSenseDescription(
  transitPlanet: string,
  natalPlanet: string,
  aspect: string,
  natalHouse?: number | null,
  transitHouse?: number | null,
): FeltSenseEntry | null {
  const tp = transitPlanet;
  const np = natalPlanet;
  const asp = lower(aspect);

  const dyn = ASPECT_DYNAMIC[asp];
  const pressure = TRANSIT_PRESSURE[tp];
  const anchor = NATAL_ANCHOR[np];
  if (!anchor) return null;

  // Resolve house life-area. If natalHouse is missing, fall back to the natal planet's
  // natural domain so the copy still feels grounded instead of generic.
  const natalHouseInfo = natalHouse && HOUSE_LIFE_AREA[natalHouse] ? HOUSE_LIFE_AREA[natalHouse] : null;
  const transitHouseInfo = transitHouse && HOUSE_LIFE_AREA[transitHouse] ? HOUSE_LIFE_AREA[transitHouse] : null;

  // ---- Build the felt description ----
  // Sentence 1: where it lives in your life (house-grounded if possible).
  // Sentence 2: what the pressure feels like in that life area.
  // Sentence 3: practical signal to watch for.

  const lifeArea = natalHouseInfo
    ? natalHouseInfo.area
    : `${anchor.runs} (natural ${HOUSE_FAMILY[np] || 'territory'} of your ${np})`;

  const example = natalHouseInfo
    ? natalHouseInfo.example
    : `look for it in ${anchor.signals}`;

  // Aspect-specific situational lead-in.
  let situation: string;
  if (asp === 'conjunction') {
    situation = `${tp} is sitting right on top of your natal ${np}, fusing into ${lifeArea}.`;
  } else if (asp === 'opposition') {
    // Critical fix: opposition does NOT automatically mean a partner. It means
    // the polarity of THIS house axis. Name the actual axis, not "your spouse".
    const oppositeHouse = natalHouse ? ((natalHouse + 6 - 1) % 12) + 1 : null;
    const oppositeArea = oppositeHouse && HOUSE_LIFE_AREA[oppositeHouse] ? HOUSE_LIFE_AREA[oppositeHouse].area : 'the opposite side of your life';
    situation = `${tp} is sitting directly across from your natal ${np}, lighting up the polarity between ${lifeArea} and ${oppositeArea}. You'll feel pulled in two directions at once: something in ${lifeArea} is asking for your attention, and something in ${oppositeArea} is pulling against it, so whatever you choose for one side costs you on the other. This often shows up through another person mirroring it back to you (a partner, collaborator, or someone who keeps pushing your buttons), but it can just as easily be an internal tug-of-war with no one else involved.`;
  } else if (asp === 'square') {
    situation = `${tp} is at a 90° angle to your natal ${np}, creating real friction in ${lifeArea}. Something there has to move.`;
  } else if (asp === 'trine') {
    situation = `${tp} is in easy flow with your natal ${np}, opening a low-resistance window in ${lifeArea}.`;
  } else if (asp === 'sextile') {
    situation = `${tp} is offering a small, useful opening to your natal ${np} in ${lifeArea}. Quiet, but real if you take it.`;
  } else if (asp === 'quincunx') {
    situation = `${tp} is at an awkward 150° angle to your natal ${np}, creating a constant low-grade misfit in ${lifeArea}. Small adjustments needed.`;
  } else {
    situation = `${tp} is making a ${asp} to your natal ${np}, touching ${lifeArea}.`;
  }

  // What the visiting planet's pressure feels like, grounded in the natal anchor.
  const action = pressure
    ? `${pressure.action.charAt(0).toUpperCase() + pressure.action.slice(1)}.`
    : `Pressure on ${anchor.runs}.`;

  // Practical signal.
  const signal = `Specifically, ${example}. Watch for shifts in ${anchor.signals}.`;

  // Optional warning from the transit planet.
  const warning = pressure?.warning ? ` Heads-up: ${pressure.warning}.` : '';

  // Transit house adds extra texture: "happening through your career area" etc.
  const transitContext = transitHouseInfo
    ? ` The pressure is currently coming from your ${transitHouseInfo.area} area.`
    : '';

  const felt = `${situation} ${action} ${signal}${transitContext}${warning}`;

  // Plain-language "why" line.
  const why = `${tp} ${dyn?.verb || 'aspects'} your natal ${np}${natalHouse ? ` (${ordinal(natalHouse)} house)` : ''}. ${dyn?.flavor ? `That's ${dyn.flavor}.` : ''} ${pressure ? `Lasts roughly ${pressure.timeframe}.` : ''}`.trim();

  return { felt, why };
}

const ordinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

