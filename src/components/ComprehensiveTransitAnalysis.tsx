// ============================================================================
// COMPLETE PROFESSIONAL TRANSIT ANALYSIS SYSTEM
// Shows: degree meaning, house activation, emotional impact, duration, 
// historical patterns, and journal tracking
// ============================================================================

import { useState } from 'react';
import { TransitAspect } from '@/lib/transitAspects';
import { NatalChart } from '@/hooks/useNatalChart';
import { getSabianSymbol } from '@/lib/sabianSymbols';
import { getDecan } from '@/lib/decans';
import { getPlanetInSignExpression } from '@/lib/planetSignExpressions';
import { getAspectInterpretation, getAspectFeeling, getAspectDynamics, ASPECT_INTERPRETATIONS } from '@/lib/aspectInterpretations';
import { detectChartPatterns, getPatternActivation, ChartPattern } from '@/lib/chartPatterns';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSymbol = (planet: string): string => {
  const symbols: Record<string, string> = {
    sun: '☉', moon: '☽', mercury: '☿', venus: '♀', mars: '♂',
    jupiter: '♃', saturn: '♄', uranus: '♅', neptune: '♆', pluto: '♇',
    chiron: '⚷', lilith: '⚸', northnode: '☊', southnode: '☋',
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
    Chiron: '⚷', Lilith: '⚸', NorthNode: '☊', SouthNode: '☋',
    Ascendant: 'AC', Midheaven: 'MC',
  };
  return symbols[planet] || planet.charAt(0);
};

const getOrdinal = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const HOUSE_MEANINGS: Record<number, { short: string; full: string; keywords: string }> = {
  1: { short: 'Self & Identity', full: 'Your sense of self, how you present to the world, personal initiatives, physical body, first impressions', keywords: 'identity, appearance, self-expression' },
  2: { short: 'Money & Values', full: 'Your finances, personal values, material security, self-worth, possessions, what you own and earn', keywords: 'finances, values, possessions' },
  3: { short: 'Communication', full: 'Daily communications, learning, siblings, local travel, mental processes, neighbors, short trips', keywords: 'communication, siblings, learning' },
  4: { short: 'Home & Family', full: 'Your home, family, emotional foundations, private life, ancestry, roots, mother, inner security', keywords: 'home, family, roots' },
  5: { short: 'Creativity & Romance', full: 'Creative expression, romance, children, pleasure, self-expression, hobbies, fun, dating, speculation', keywords: 'creativity, romance, children' },
  6: { short: 'Health & Work', full: 'Your health, daily work, routines, service, habits, pets, employees, day-to-day responsibilities', keywords: 'health, work, daily routine' },
  7: { short: 'Partnerships', full: 'Committed partnerships, marriage, one-on-one relationships, open enemies, contracts, negotiations', keywords: 'partnerships, marriage, others' },
  8: { short: 'Transformation', full: 'Shared finances, intimacy, transformation, inheritances, the occult, death/rebirth, sexuality, psychology', keywords: 'transformation, shared resources, depth' },
  9: { short: 'Philosophy & Travel', full: 'Higher learning, long-distance travel, philosophy, publishing, beliefs, foreign cultures, higher education', keywords: 'philosophy, travel, higher education' },
  10: { short: 'Career & Status', full: 'Your career, public reputation, achievements, authority figures, father, life direction, ambitions', keywords: 'career, public image, authority' },
  11: { short: 'Friends & Groups', full: 'Friendships, groups, social causes, hopes and dreams, the collective, community, organizations', keywords: 'friends, groups, hopes' },
  12: { short: 'Subconscious', full: 'Your subconscious, hidden matters, solitude, spirituality, self-undoing, dreams, karma, endings', keywords: 'subconscious, secrets, spirituality' },
};

const PLANET_ESSENCES: Record<string, { name: string; essence: string }> = {
  sun: { name: 'Sun', essence: 'Your core identity, vitality, and conscious self-expression. What makes you YOU.' },
  moon: { name: 'Moon', essence: 'Your emotional nature, instincts, and inner world. How you feel and nurture.' },
  mercury: { name: 'Mercury', essence: 'Your mind, communication style, and how you process information.' },
  venus: { name: 'Venus', essence: 'Your values, love nature, aesthetics, and what brings you pleasure.' },
  mars: { name: 'Mars', essence: 'Your drive, ambition, anger, and how you take action and assert yourself.' },
  jupiter: { name: 'Jupiter', essence: 'Your expansion, luck, beliefs, and where you seek growth and meaning.' },
  saturn: { name: 'Saturn', essence: 'Your structure, discipline, limits, and where you learn through challenge.' },
  uranus: { name: 'Uranus', essence: 'Your uniqueness, rebellion, and where you break free from convention.' },
  neptune: { name: 'Neptune', essence: 'Your spirituality, imagination, and where you transcend or escape.' },
  pluto: { name: 'Pluto', essence: 'Your power, transformation, and where you experience death and rebirth.' },
  chiron: { name: 'Chiron', essence: 'Your deepest wound and greatest healing gift.' },
  northnode: { name: 'North Node', essence: 'Your soul growth direction and karmic destiny.' },
  southnode: { name: 'South Node', essence: 'Your past life patterns and comfort zone.' },
  ascendant: { name: 'Ascendant', essence: 'Your rising sign, outer personality, and how others see you.' },
};

const ASPECT_MEANINGS: Record<string, { meaning: string; energy: string }> = {
  conjunction: { meaning: 'merges with', energy: 'Fusion - these energies become ONE. Intensity and focus.' },
  opposition: { meaning: 'opposes', energy: 'Polarity - awareness through contrast. Balance required.' },
  trine: { meaning: 'flows with', energy: 'Harmony - natural talent and ease. Gifts that come easily.' },
  square: { meaning: 'challenges', energy: 'Tension - friction that creates action. Growth through struggle.' },
  sextile: { meaning: 'supports', energy: 'Opportunity - potential that needs activation. Gentle gifts.' },
};

const getDegreeMeaning = (degree: number, sign: string): { symbol: string; meaning: string } => {
  return getSabianSymbol(degree, sign);
};

const getSignExpression = (planet: string, sign: string): string => {
  // Use the comprehensive planet-in-sign database
  return getPlanetInSignExpression(planet, sign);
};

const getHouseToHouseMeaning = (transitHouse: number, natalHouse: number, aspectType: string): string => {
  if (transitHouse === natalHouse) {
    return `Both energies are concentrated in the same life area, intensifying themes of ${HOUSE_MEANINGS[transitHouse].keywords}.`;
  }
  
  return `Energy flows between your ${HOUSE_MEANINGS[transitHouse].short.toLowerCase()} and ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()}, connecting these life areas in ${aspectType} ways.`;
};

// Degrees per day for each planet (average direct motion)
const PLANET_SPEEDS: Record<string, number> = {
  sun: 0.986, moon: 13.18, mercury: 1.5, venus: 1.2, mars: 0.52,
  jupiter: 0.083, saturn: 0.033, uranus: 0.012, neptune: 0.006, pluto: 0.004,
};

interface RetrogradePasses {
  firstPass: { start: Date; exact: Date; end: Date };
  secondPass: { start: Date; exact: Date; end: Date } | null;
  thirdPass: { start: Date; exact: Date; end: Date } | null;
  hasRetrograde: boolean;
}

interface TransitTimelineData {
  orbEntryDate: Date;
  exactDate: Date;
  orbExitDate: Date;
  exactDegreeDate: Date; // When transit planet was at the EXACT natal degree
  currentDegreeDistance: number; // Current distance from natal point in degrees
  totalDays: number;
  isApproaching: boolean;
  retrogradeNote: string;
  retrogradePasses: RetrogradePasses | null;
  orbExplanation: string;
}

const calculateDetailedTransitTimeline = (
  transitPlanet: string,
  transitDegree: number,
  natalDegree: number,
  aspect: string,
  currentDate: Date
): TransitTimelineData => {
  const speeds = PLANET_SPEEDS;
  const aspectAngles: Record<string, number> = {
    conjunction: 0, opposition: 180, trine: 120, square: 90, sextile: 60
  };
  
  const aspectAngle = aspectAngles[aspect] || 0;
  const orb = aspect === 'conjunction' || aspect === 'opposition' ? 8 : aspect === 'square' ? 7 : 6;
  const speed = speeds[transitPlanet.toLowerCase()] || 1;
  
  // Calculate the target degree (where transit needs to be for exact aspect to natal)
  const targetDegree = natalDegree;
  
  // Current degree distance (how far transit is from exact)
  const currentDegreeDistance = Math.abs(transitDegree - targetDegree);
  const adjustedDistance = currentDegreeDistance > 180 ? 360 - currentDegreeDistance : currentDegreeDistance;
  
  // Is the transit approaching or separating?
  const isApproaching = transitDegree < natalDegree || (transitDegree > 330 && natalDegree < 30);
  
  // Days to/from exact at natal degree
  const degreesToExact = Math.abs(transitDegree - natalDegree);
  const adjustedDegreesToExact = degreesToExact > 180 ? 360 - degreesToExact : degreesToExact;
  const daysToExact = adjustedDegreesToExact / speed;
  
  // Calculate when transit was/will be at exact natal degree
  const exactDegreeDate = new Date(currentDate);
  if (isApproaching) {
    exactDegreeDate.setDate(exactDegreeDate.getDate() + Math.floor(daysToExact));
  } else {
    exactDegreeDate.setDate(exactDegreeDate.getDate() - Math.floor(daysToExact));
  }
  
  // Calculate orb entry and exit dates
  const daysInOrb = orb / speed;
  
  const orbEntryDate = new Date(exactDegreeDate);
  orbEntryDate.setDate(orbEntryDate.getDate() - Math.floor(daysInOrb));
  
  const orbExitDate = new Date(exactDegreeDate);
  orbExitDate.setDate(orbExitDate.getDate() + Math.floor(daysInOrb));
  
  // Retrograde passes calculation for outer planets
  let retrogradeNote = '';
  let retrogradePasses: RetrogradePasses | null = null;
  const outerPlanets = ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  
  if (outerPlanets.includes(transitPlanet.toLowerCase())) {
    // Outer planets typically retrograde for 4-5 months per year
    // This creates 3 passes: direct → retrograde → direct
    const retrogradeLength = transitPlanet.toLowerCase() === 'pluto' ? 160 : 
                             transitPlanet.toLowerCase() === 'neptune' ? 158 :
                             transitPlanet.toLowerCase() === 'uranus' ? 155 :
                             transitPlanet.toLowerCase() === 'saturn' ? 140 : 120;
    
    // First pass (direct motion)
    const firstPassExact = new Date(exactDegreeDate);
    const firstPassStart = new Date(firstPassExact);
    firstPassStart.setDate(firstPassStart.getDate() - Math.floor(daysInOrb));
    const firstPassEnd = new Date(firstPassExact);
    firstPassEnd.setDate(firstPassEnd.getDate() + Math.floor(daysInOrb / 3));
    
    // Second pass (retrograde motion) - typically 2-4 months after first
    const secondPassExact = new Date(firstPassExact);
    secondPassExact.setDate(secondPassExact.getDate() + Math.floor(retrogradeLength * 0.6));
    const secondPassStart = new Date(secondPassExact);
    secondPassStart.setDate(secondPassStart.getDate() - Math.floor(daysInOrb / 2));
    const secondPassEnd = new Date(secondPassExact);
    secondPassEnd.setDate(secondPassEnd.getDate() + Math.floor(daysInOrb / 2));
    
    // Third pass (direct motion again) - typically 2-4 months after second
    const thirdPassExact = new Date(secondPassExact);
    thirdPassExact.setDate(thirdPassExact.getDate() + Math.floor(retrogradeLength * 0.5));
    const thirdPassStart = new Date(thirdPassExact);
    thirdPassStart.setDate(thirdPassStart.getDate() - Math.floor(daysInOrb / 3));
    const thirdPassEnd = new Date(thirdPassExact);
    thirdPassEnd.setDate(thirdPassEnd.getDate() + Math.floor(daysInOrb));
    
    retrogradePasses = {
      hasRetrograde: true,
      firstPass: { start: firstPassStart, exact: firstPassExact, end: firstPassEnd },
      secondPass: { start: secondPassStart, exact: secondPassExact, end: secondPassEnd },
      thirdPass: { start: thirdPassStart, exact: thirdPassExact, end: thirdPassEnd },
    };
    
    retrogradeNote = `${transitPlanet} retrogrades ~${Math.round(retrogradeLength / 30)} months/year, creating 3 passes over this degree.`;
  }
  
  // Explanation of what "entered orb" means
  const orbExplanation = `"Orb" is the range of influence (±${orb}°). When ${transitPlanet} enters this ${orb}° range of your natal ${natalDegree}°, you begin feeling the transit. The effect intensifies as it approaches exact, then gradually fades.`;
  
  return {
    orbEntryDate,
    exactDate: exactDegreeDate,
    orbExitDate,
    exactDegreeDate,
    currentDegreeDistance: adjustedDegreesToExact,
    totalDays: Math.round(daysInOrb * 2),
    isApproaching,
    retrogradeNote,
    retrogradePasses,
    orbExplanation,
  };
};

interface HistoricalMatch {
  date: Date;
  yearsAgo: number;
  transitPlanet: string;
  transitDegree: number;
  transitSign: string;
  natalPlanet: string;
  natalDegree: number;
  natalSign: string;
  aspect: string;
  journalEntry?: string;
}

interface CalculatedOccurrence {
  date: Date;
  approximate: boolean;
  description: string;
}

// Orbital periods in days for calculating past transit occurrences
const ORBITAL_PERIODS: Record<string, number> = {
  sun: 365.25,
  moon: 27.32,
  mercury: 87.97,
  venus: 224.7,
  mars: 686.98,
  jupiter: 4332.59,
  saturn: 10759.22,
  uranus: 30688.5,
  neptune: 60182,
  pluto: 90560,
};

// Calculate approximate degrees traveled per day
const DEGREES_PER_DAY: Record<string, number> = {
  sun: 360 / 365.25,           // ~0.986°/day
  moon: 360 / 27.32,           // ~13.18°/day
  mercury: 360 / 87.97,        // ~4.09°/day (average, varies widely)
  venus: 360 / 224.7,          // ~1.60°/day
  mars: 360 / 686.98,          // ~0.52°/day
  jupiter: 360 / 4332.59,      // ~0.083°/day
  saturn: 360 / 10759.22,      // ~0.033°/day
  uranus: 360 / 30688.5,       // ~0.012°/day
  neptune: 360 / 60182,        // ~0.006°/day
  pluto: 360 / 90560,          // ~0.004°/day
};

// Calculate how often this SPECIFIC aspect happens (transit planet to a fixed natal point)
const getTransitFrequency = (transitPlanet: string, aspectType: string): { 
  frequency: string; 
  description: string; 
  nextIn: string;
  rarity: 'common' | 'moderate' | 'rare' | 'very-rare' | 'once-in-lifetime';
} => {
  const planet = transitPlanet.toLowerCase();
  const orbitalPeriod = ORBITAL_PERIODS[planet] || 365;
  
  // Most aspects happen twice per orbit (once applying, once separating)
  // Except conjunctions and oppositions which happen once
  const aspectsPerOrbit = aspectType === 'conjunction' || aspectType === 'opposition' ? 1 : 2;
  const daysPerAspect = orbitalPeriod / aspectsPerOrbit;
  
  if (planet === 'moon') {
    return {
      frequency: `Every ~${Math.round(27.32 / aspectsPerOrbit)} days`,
      description: `The Moon makes this aspect to your natal planet about ${aspectsPerOrbit === 1 ? 'once' : 'twice'} per month.`,
      nextIn: `~${Math.round(27.32 / aspectsPerOrbit)} days`,
      rarity: 'common'
    };
  }
  
  if (planet === 'sun' || planet === 'mercury' || planet === 'venus') {
    return {
      frequency: `${aspectsPerOrbit === 1 ? 'Once' : 'Twice'} per year`,
      description: `The ${transitPlanet} makes this exact aspect to your natal planet ${aspectsPerOrbit === 1 ? 'once' : 'twice'} each year as it travels through the zodiac.`,
      nextIn: `~${Math.round(daysPerAspect / 30)} months`,
      rarity: 'moderate'
    };
  }
  
  if (planet === 'mars') {
    return {
      frequency: `${aspectsPerOrbit === 1 ? 'Once' : 'Twice'} every ~2 years`,
      description: `Mars takes about 2 years to complete its orbit, so this aspect happens ${aspectsPerOrbit === 1 ? 'once' : 'twice'} in that cycle. Pay attention—this is moderately rare.`,
      nextIn: `~${Math.round(daysPerAspect / 365)} year${daysPerAspect > 365 ? 's' : ''}`,
      rarity: 'moderate'
    };
  }
  
  if (planet === 'jupiter') {
    return {
      frequency: `${aspectsPerOrbit === 1 ? 'Once' : 'Twice'} every ~12 years`,
      description: `Jupiter takes 12 years to orbit the Sun. This aspect is significant—you only experience it ${aspectsPerOrbit === 1 ? 'once' : 'twice'} per Jupiter cycle.`,
      nextIn: `~${Math.round(daysPerAspect / 365)} years`,
      rarity: 'rare'
    };
  }
  
  if (planet === 'saturn') {
    return {
      frequency: `${aspectsPerOrbit === 1 ? 'Once' : 'Twice'} every ~29 years`,
      description: `Saturn's 29-year cycle means this aspect marks major life chapters. You'll experience this ${aspectsPerOrbit === 1 ? 'once' : 'twice'} per Saturn Return cycle.`,
      nextIn: `~${Math.round(daysPerAspect / 365)} years`,
      rarity: 'very-rare'
    };
  }
  
  if (planet === 'uranus') {
    return {
      frequency: `${aspectsPerOrbit === 1 ? 'Once' : 'Twice'} every ~84 years`,
      description: `Uranus takes 84 years to orbit. Most people only experience this aspect ${aspectsPerOrbit === 1 ? 'once' : 'twice'} in their lifetime. This is a pivotal, once-in-a-generation transit.`,
      nextIn: `~${Math.round(daysPerAspect / 365)} years`,
      rarity: 'once-in-lifetime'
    };
  }
  
  if (planet === 'neptune') {
    return {
      frequency: `${aspectsPerOrbit === 1 ? 'Once' : 'Twice'} every ~165 years`,
      description: `Neptune's 165-year orbit means this aspect happens ${aspectsPerOrbit === 1 ? 'once' : 'at most twice'} in anyone's life. This is exceptionally rare and spiritually significant.`,
      nextIn: `~${Math.round(daysPerAspect / 365)} years`,
      rarity: 'once-in-lifetime'
    };
  }
  
  if (planet === 'pluto') {
    return {
      frequency: `${aspectsPerOrbit === 1 ? 'Once' : 'Twice'} every ~248 years`,
      description: `Pluto's 248-year orbit means NO ONE experiences this same aspect twice at the same degree. This is a completely unique, transformative moment in your life.`,
      nextIn: 'Never in your lifetime at this exact degree',
      rarity: 'once-in-lifetime'
    };
  }
  
  return {
    frequency: 'Varies',
    description: 'This transit follows its own unique cycle.',
    nextIn: 'See transit tables',
    rarity: 'moderate'
  };
};

// Calculate past occurrences of this transit
const calculatePastOccurrences = (
  transitPlanet: string, 
  natalDegree: number, 
  natalSign: string,
  aspectType: string,
  currentDate: Date
): CalculatedOccurrence[] => {
  const planet = transitPlanet.toLowerCase();
  const orbitalPeriod = ORBITAL_PERIODS[planet];
  const aspectsPerOrbit = aspectType === 'conjunction' || aspectType === 'opposition' ? 1 : 2;
  const daysPerAspect = orbitalPeriod / aspectsPerOrbit;
  
  const occurrences: CalculatedOccurrence[] = [];
  const today = currentDate.getTime();
  
  // Calculate backwards from today
  // For outer planets, we may not have many past occurrences
  // For inner planets, limit to last 5 years of occurrences
  const maxLookbackDays = Math.min(orbitalPeriod * 3, 365 * 80); // Max 80 years or 3 orbits
  const maxOccurrences = 10;
  
  let daysBack = daysPerAspect; // Start with the previous occurrence
  while (daysBack <= maxLookbackDays && occurrences.length < maxOccurrences) {
    const pastDate = new Date(today - daysBack * 24 * 60 * 60 * 1000);
    
    // Skip future dates somehow calculated
    if (pastDate >= currentDate) {
      daysBack += daysPerAspect;
      continue;
    }
    
    occurrences.push({
      date: pastDate,
      approximate: true,
      description: `${transitPlanet} ${aspectType} your natal point`
    });
    
    daysBack += daysPerAspect;
  }
  
  return occurrences;
};

const findHistoricalMatches = (aspect: TransitAspect, currentDate: Date): HistoricalMatch[] => {
  const transitSignature = `${aspect.transitPlanet.toLowerCase()}-${aspect.aspect}-${aspect.natalPlanet.toLowerCase()}`;
  const journalEntries = JSON.parse(localStorage.getItem('transitJournals') || '[]');
  
  const matches = journalEntries
    .filter((entry: { transitSignature: string }) => entry.transitSignature === transitSignature)
    .map((entry: { date: string; transitDegree: number; transitSign: string; natalDegree: number; natalSign: string; entry: string }) => ({
      date: new Date(entry.date),
      yearsAgo: Math.floor((currentDate.getTime() - new Date(entry.date).getTime()) / (1000 * 60 * 60 * 24 * 365)),
      transitPlanet: aspect.transitPlanet,
      transitDegree: entry.transitDegree,
      transitSign: entry.transitSign,
      natalPlanet: aspect.natalPlanet,
      natalDegree: entry.natalDegree,
      natalSign: entry.natalSign,
      aspect: aspect.aspect,
      journalEntry: entry.entry,
    }))
    .sort((a: HistoricalMatch, b: HistoricalMatch) => b.date.getTime() - a.date.getTime());
  
  return matches;
};

const getTransitCycle = (planet: string): string => {
  const cycles: Record<string, string> = {
    sun: 'The Sun completes a full cycle through your chart every year.',
    moon: 'The Moon completes a full cycle every 28 days.',
    mercury: 'Mercury completes a cycle every year, with retrogrades creating repeating patterns every 3-4 months.',
    venus: 'Venus completes a cycle every 1-1.5 years.',
    mars: 'Mars completes a cycle every 2 years.',
    jupiter: 'Jupiter completes a cycle every 12 years.',
    saturn: 'Saturn completes a cycle every 29 years.',
    uranus: 'Uranus completes a cycle every 84 years.',
    neptune: 'Neptune completes a cycle every 165 years.',
    pluto: 'Pluto completes a cycle every 248 years.',
  };
  return cycles[planet.toLowerCase()] || '';
};

interface FeelingData {
  title: string;
  feeling: string;
  body: string;
  emotional: string;
  where: string;
  duration: string;
}

const getFeeling = (transitPlanet: string, natalPlanet: string, aspect: string, natalHouse: number | null): FeelingData => {
  const feelingsDatabase: Record<string, FeelingData> = {
    'sun-square-pluto': {
      title: 'Power Struggle with Self',
      feeling: 'You feel like your identity is being challenged by deep, buried power. It is uncomfortable. Your ego (Sun) is being forced to confront your shadow (Pluto). You might feel controlling or controlled. Authority issues surface.',
      body: 'Physically: tension in solar plexus, feeling of being watched or judged, power surging through you that you do not know how to direct.',
      emotional: 'Emotionally: intense, confrontational, like you are being tested. Might feel paranoid or deeply suspicious. Anger at people in authority. Desire to control situations.',
      where: natalHouse ? `This is playing out in your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()} - so the power dynamics are specifically around ${HOUSE_MEANINGS[natalHouse].keywords.toLowerCase()}.` : 'Pay attention to where power dynamics are surfacing.',
      duration: 'Squares feel URGENT - like you MUST do something. The discomfort peaks at exact but you feel it building 3 days before and releasing 3 days after.',
    },
    'moon-trine-mars': {
      title: 'Emotions Empower Action',
      feeling: 'You feel energized and clear. Your emotions (Moon) and your drive (Mars) are working together perfectly. What you FEEL and what you WANT are aligned. You are motivated without being aggressive.',
      body: 'Physically: energy flowing smoothly, vitality, feeling strong but not tense. Easy movement. Good for physical activity.',
      emotional: 'Emotionally: confident, decisive, passionate but not overwhelming. Emotions fuel you rather than drain you. Courage feels natural.',
      where: natalHouse ? `This flows through your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()}.` : 'Notice where action feels effortless.',
      duration: 'Trines feel EASY - you might not even notice them. The gift is subtle. Lasts about 1-2 days for Moon transits.',
    },
    'sun-conjunction-pluto': {
      title: 'Identity Transformation',
      feeling: 'Your core self is being completely transformed. This is a death and rebirth of who you are. Ego confronts ultimate power.',
      body: 'Physically: intense energy, possible exhaustion, feeling of being stripped down to essentials.',
      emotional: 'Emotionally: powerful, potentially overwhelming. Old identity must die for the new to emerge.',
      where: natalHouse ? `This transformation affects your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()}.` : 'Your entire sense of self is being remade.',
      duration: 'Conjunctions are the most powerful aspect. Effects linger for the entire transit period.',
    },
    'saturn-square-saturn': {
      title: 'Saturn Square - Life Structure Test',
      feeling: 'Your life structures are being tested. What you built is being challenged. This is the mid-point of your Saturn cycle - a crisis of maturity.',
      body: 'Physically: possible fatigue, feeling of weight or burden, needing more rest.',
      emotional: 'Emotionally: serious, possibly depressed, questioning your life direction. Heavy responsibilities.',
      where: natalHouse ? `The pressure is on your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()} themes.` : 'Look at what structures need to change.',
      duration: 'Saturn transits last MONTHS. The exact hit is just the peak - you feel this for weeks before and after.',
    },
    'jupiter-conjunction-sun': {
      title: 'Expansion of Self',
      feeling: 'You feel larger than life! Confidence soars. Opportunities find you. Your identity is expanding in positive ways.',
      body: 'Physically: high energy, possibly weight gain, feeling of abundance and vitality.',
      emotional: 'Emotionally: optimistic, generous, confident. Belief in yourself is strong. Might overdo it.',
      where: natalHouse ? `Growth and luck flow to your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()}.` : 'Expansion touches your core identity.',
      duration: 'Jupiter transits are relatively brief but powerful. Make the most of this lucky period!',
    },
  };
  
  const key = `${transitPlanet.toLowerCase()}-${aspect}-${natalPlanet.toLowerCase()}`;
  
  if (feelingsDatabase[key]) {
    return feelingsDatabase[key];
  }
  
  // Generic feeling based on aspect type
  const aspectInfo = ASPECT_MEANINGS[aspect] || { meaning: 'aspects', energy: 'planetary interaction' };
  const transitInfo = PLANET_ESSENCES[transitPlanet.toLowerCase()] || { name: transitPlanet, essence: '' };
  const natalInfo = PLANET_ESSENCES[natalPlanet.toLowerCase()] || { name: natalPlanet, essence: '' };
  
  return {
    title: `${transitInfo.name} ${aspectInfo.meaning} ${natalInfo.name}`,
    feeling: `Transit ${transitInfo.name} ${aspectInfo.meaning} your natal ${natalInfo.name}. ${aspectInfo.energy}`,
    body: 'Physical sensations vary by person. Notice where you feel tension or ease in your body.',
    emotional: 'Emotional responses depend on your personal relationship with these planetary energies.',
    where: natalHouse ? `This affects your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()} themes.` : 'Notice which life area is activated.',
    duration: 'Duration varies by planet speed. Faster planets = shorter transits.',
  };
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

const DegreeMeaning = ({ degree, sign, house, natalChart }: { 
  degree: number; 
  sign: string; 
  house: number | null; 
  natalChart: NatalChart;
}) => {
  // Check what else is at this degree in natal chart
  const natalPlanetsAtDegree = Object.entries(natalChart.planets)
    .filter(([, planet]) => {
      if (!planet?.degree) return false;
      const planetDegree = Math.floor(planet.degree);
      return planetDegree >= degree - 2 && planetDegree <= degree + 2;
    });
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
      borderRadius: '8px',
      border: '1px solid #2196F3'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#1565C0'
      }}>
        📍 What {degree}° {sign} Means in YOUR Chart
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C' }}>
        {house && (
          <div style={{ marginBottom: '12px' }}>
            <strong>This degree falls in your {house}{getOrdinal(house)} house:</strong>
            {' '}{HOUSE_MEANINGS[house].full}
          </div>
        )}
        
        {natalPlanetsAtDegree.length > 0 && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '4px',
            borderLeft: '3px solid #2196F3'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1565C0' }}>
              ⚡ SENSITIVE POINT - You have natal planets near this degree:
            </div>
            {natalPlanetsAtDegree.map(([planetKey, planetData], i) => (
              <div key={i} style={{ fontSize: '13px', color: '#424242', marginBottom: '4px' }}>
                • {getSymbol(planetKey)} {PLANET_ESSENCES[planetKey.toLowerCase()]?.name || planetKey} at {planetData?.degree}° {planetData?.sign}
              </div>
            ))}
            <div style={{ fontSize: '12px', color: '#6B6B6B', marginTop: '8px', fontStyle: 'italic' }}>
              This area of your chart is already loaded with planetary energy - transits here are EXTRA significant!
            </div>
          </div>
        )}
        
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px'
        }}>
          {/* Decan Info */}
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#6A1B9A' }}>
            {Math.floor(degree)}° {sign} — {getDecan(degree, sign).number === 1 ? '1st' : getDecan(degree, sign).number === 2 ? '2nd' : '3rd'} Decan ({getDecan(degree, sign).rulerSymbol} {getDecan(degree, sign).ruler})
          </div>
          <div style={{ fontSize: '12px', color: '#7B1FA2', marginBottom: '10px', lineHeight: '1.5' }}>
            {getDecan(degree, sign).description}
          </div>
          
          {/* Sabian Symbol */}
          <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '4px', color: '#1565C0' }}>
            Sabian Symbol:
          </div>
          <div style={{ fontSize: '13px', color: '#424242', fontStyle: 'italic', marginBottom: '4px' }}>
            "{getDegreeMeaning(degree, sign).symbol}"
          </div>
          <div style={{ fontSize: '12px', color: '#616161' }}>
            {getDegreeMeaning(degree, sign).meaning}
          </div>
        </div>
      </div>
    </div>
  );
};

const TransitActivation = ({
  transitPlanet, transitDegree, transitSign, transitHouse,
  natalPlanet, natalDegree, natalSign, natalHouse, aspect
}: {
  transitPlanet: string;
  transitDegree: number;
  transitSign: string;
  transitHouse: number | null;
  natalPlanet: string;
  natalDegree: number;
  natalSign: string;
  natalHouse: number | null;
  aspect: string;
}) => {
  const transitInfo = PLANET_ESSENCES[transitPlanet.toLowerCase()] || { name: transitPlanet, essence: '' };
  const natalInfo = PLANET_ESSENCES[natalPlanet.toLowerCase()] || { name: natalPlanet, essence: '' };
  const aspectData = ASPECT_INTERPRETATIONS[aspect] || ASPECT_INTERPRETATIONS.conjunction;
  const aspectDynamics = getAspectDynamics(aspect);
  
  // Get the deep aspect interpretation
  const deepInterpretation = getAspectInterpretation(transitPlanet, natalPlanet, aspect);
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
      borderRadius: '8px',
      border: '1px solid #66BB6A'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#1B5E20'
      }}>
        ⚡ What This Transit Activates
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C' }}>
        {/* Transit Planet Section */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontWeight: '600', color: '#1B5E20', marginBottom: '6px' }}>
            Transit {transitInfo.name} at {transitDegree}° {transitSign}{transitHouse ? ` (your ${transitHouse}${getOrdinal(transitHouse)} house)` : ''}:
          </div>
          <div>
            {transitHouse ? `Your ${HOUSE_MEANINGS[transitHouse].short.toLowerCase()} area is being energized by` : 'Your chart is being activated by'}
            {' '}{transitInfo.name.toLowerCase()} energy. {transitInfo.essence}
          </div>
          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.8)', borderRadius: '4px', borderLeft: '3px solid #4CAF50' }}>
            <div style={{ fontWeight: '600', fontSize: '12px', color: '#2E7D32', marginBottom: '4px' }}>
              HOW {transitInfo.name.toUpperCase()} EXPRESSES THROUGH {transitSign.toUpperCase()}:
            </div>
            <div style={{ color: '#1B5E20' }}>
              {getSignExpression(transitInfo.name, transitSign)}
            </div>
          </div>
        </div>
        
        {/* THE ASPECT - New section showing the specific aspect dynamics */}
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
          borderRadius: '6px',
          marginBottom: '16px',
          border: '1px solid #64B5F6'
        }}>
          <div style={{ fontWeight: '700', color: '#1565C0', marginBottom: '8px', fontSize: '15px' }}>
            {aspectData.symbol} THE {aspect.toUpperCase()} ({aspectData.keyword})
          </div>
          <div style={{ marginBottom: '10px', fontSize: '14px' }}>
            {deepInterpretation}
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
            {aspectDynamics.challenge && (
              <div style={{ flex: '1', minWidth: '200px', padding: '10px', background: 'rgba(244,67,54,0.1)', borderRadius: '4px', border: '1px solid rgba(244,67,54,0.3)' }}>
                <div style={{ fontWeight: '600', fontSize: '11px', color: '#C62828', marginBottom: '4px' }}>⚠️ CHALLENGE:</div>
                <div style={{ fontSize: '13px', color: '#B71C1C' }}>{aspectDynamics.challenge}</div>
              </div>
            )}
            {aspectDynamics.gift && (
              <div style={{ flex: '1', minWidth: '200px', padding: '10px', background: 'rgba(76,175,80,0.1)', borderRadius: '4px', border: '1px solid rgba(76,175,80,0.3)' }}>
                <div style={{ fontWeight: '600', fontSize: '11px', color: '#2E7D32', marginBottom: '4px' }}>🎁 GIFT:</div>
                <div style={{ fontSize: '13px', color: '#1B5E20' }}>{aspectDynamics.gift}</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Natal Planet Section */}
        <div style={{
          padding: '16px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '4px',
          borderLeft: '4px solid #66BB6A'
        }}>
          <div style={{ fontWeight: '600', color: '#1B5E20', marginBottom: '6px' }}>
            Your Natal {natalInfo.name} at {natalDegree}° {natalSign}{natalHouse ? ` (your ${natalHouse}${getOrdinal(natalHouse)} house)` : ''}:
          </div>
          <div>
            Your natal {natalInfo.name.toLowerCase()} represents {natalInfo.essence.toLowerCase()}
            {natalHouse && ` It lives in your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()} (${natalHouse}${getOrdinal(natalHouse)} house).`}
          </div>
          <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(129,199,132,0.2)', borderRadius: '4px', borderLeft: '3px solid #66BB6A' }}>
            <div style={{ fontWeight: '600', fontSize: '12px', color: '#2E7D32', marginBottom: '4px' }}>
              HOW YOUR {natalInfo.name.toUpperCase()} EXPRESSES THROUGH {natalSign.toUpperCase()}:
            </div>
            <div style={{ color: '#1B5E20' }}>
              {getSignExpression(natalInfo.name, natalSign)}
            </div>
          </div>
        </div>
        
        {transitHouse && natalHouse && (
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,235,59,0.2)', borderRadius: '4px' }}>
            <div style={{ fontWeight: '600', marginBottom: '6px' }}>
              🎯 HOUSE CONNECTION:
            </div>
            <div>
              {getHouseToHouseMeaning(transitHouse, natalHouse, aspectData.keyword.toLowerCase())}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const HowItFeels = ({ transitPlanet, natalPlanet, aspect, natalHouse }: {
  transitPlanet: string;
  natalPlanet: string;
  aspect: string;
  natalHouse: number | null;
}) => {
  const feelings = getFeeling(transitPlanet, natalPlanet, aspect, natalHouse);
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)',
      borderRadius: '8px',
      border: '1px solid #FFA726'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#E65100'
      }}>
        💭 How This FEELS
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C' }}>
        <div style={{
          fontSize: '15px',
          fontWeight: '600',
          marginBottom: '12px',
          color: '#E65100'
        }}>
          {feelings.title}
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong>General Feeling:</strong> {feelings.feeling}
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong>In Your Body:</strong> {feelings.body}
        </div>
        
        <div style={{ marginBottom: '12px' }}>
          <strong>Emotionally:</strong> {feelings.emotional}
        </div>
        
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px',
          borderLeft: '3px solid #FFA726'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#E65100' }}>
            Where You Will Feel This:
          </div>
          <div style={{ fontSize: '13px' }}>
            {feelings.where}
          </div>
        </div>
        
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#E65100' }}>
            Duration of This Feeling:
          </div>
          <div style={{ fontSize: '13px' }}>
            {feelings.duration}
          </div>
        </div>
      </div>
    </div>
  );
};

const TransitTimeline = ({ transitPlanet, transitDegree, natalPlanet, natalDegree, natalSign, aspect, currentDate }: {
  transitPlanet: string;
  transitDegree: number;
  natalPlanet: string;
  natalDegree: number;
  natalSign: string;
  aspect: string;
  currentDate: Date;
}) => {
  const timeline = calculateDetailedTransitTimeline(transitPlanet, transitDegree, natalDegree, aspect, currentDate);
  
  const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatDateWithYear = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
      borderRadius: '8px',
      border: '1px solid #AB47BC'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#6A1B9A'
      }}>
        ⏰ Timeline & Duration
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C' }}>
        {/* Current Status */}
        <div style={{
          padding: '12px',
          background: timeline.isApproaching ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
          borderRadius: '6px',
          marginBottom: '16px',
          borderLeft: `4px solid ${timeline.isApproaching ? '#4CAF50' : '#FF9800'}`
        }}>
          <div style={{ fontWeight: '600', marginBottom: '4px', color: timeline.isApproaching ? '#2E7D32' : '#E65100' }}>
            {timeline.isApproaching ? '↗️ APPROACHING' : '↘️ SEPARATING'} — {timeline.currentDegreeDistance.toFixed(1)}° from exact
          </div>
          <div style={{ fontSize: '13px' }}>
            {getSymbol(transitPlanet)} is currently at {transitDegree}° • Your {getSymbol(natalPlanet)} is at {natalDegree}° {natalSign}
          </div>
        </div>
        
        {/* What is Orb explanation */}
        <div style={{
          padding: '10px 12px',
          background: 'rgba(103,58,183,0.08)',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#5E35B1',
          borderLeft: '3px solid #7C4DFF'
        }}>
          💡 <strong>What does "Entered Orb" mean?</strong> {timeline.orbExplanation}
        </div>
        
        {/* 3 Passes for outer planets */}
        {timeline.retrogradePasses?.hasRetrograde ? (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontWeight: '600', color: '#6A1B9A', marginBottom: '12px', fontSize: '15px' }}>
              🔄 Three Passes (Due to Retrograde):
            </div>
            
            {/* First Pass */}
            <div style={{
              padding: '12px',
              background: 'rgba(255,255,255,0.9)',
              borderRadius: '6px',
              marginBottom: '8px',
              borderLeft: '4px solid #4CAF50'
            }}>
              <div style={{ fontWeight: '600', color: '#2E7D32', marginBottom: '6px' }}>
                1st Pass (Direct Motion) →
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: '13px' }}>
                <span style={{ color: '#78909C' }}>Enters orb:</span>
                <span>{formatDateWithYear(timeline.retrogradePasses.firstPass.start)}</span>
                <span style={{ color: '#78909C' }}>EXACT at {natalDegree}°:</span>
                <span style={{ fontWeight: '600' }}>{formatDateWithYear(timeline.retrogradePasses.firstPass.exact)} ⭐</span>
                <span style={{ color: '#78909C' }}>Stations retrograde:</span>
                <span>{formatDateWithYear(timeline.retrogradePasses.firstPass.end)}</span>
              </div>
            </div>
            
            {/* Second Pass */}
            {timeline.retrogradePasses.secondPass && (
              <div style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '6px',
                marginBottom: '8px',
                borderLeft: '4px solid #FF9800'
              }}>
                <div style={{ fontWeight: '600', color: '#E65100', marginBottom: '6px' }}>
                  2nd Pass (Retrograde) ←
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: '13px' }}>
                  <span style={{ color: '#78909C' }}>Re-enters orb:</span>
                  <span>{formatDateWithYear(timeline.retrogradePasses.secondPass.start)}</span>
                  <span style={{ color: '#78909C' }}>EXACT at {natalDegree}°:</span>
                  <span style={{ fontWeight: '600' }}>{formatDateWithYear(timeline.retrogradePasses.secondPass.exact)} ⭐</span>
                  <span style={{ color: '#78909C' }}>Stations direct:</span>
                  <span>{formatDateWithYear(timeline.retrogradePasses.secondPass.end)}</span>
                </div>
              </div>
            )}
            
            {/* Third Pass */}
            {timeline.retrogradePasses.thirdPass && (
              <div style={{
                padding: '12px',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: '6px',
                borderLeft: '4px solid #9C27B0'
              }}>
                <div style={{ fontWeight: '600', color: '#7B1FA2', marginBottom: '6px' }}>
                  3rd Pass (Direct Motion) → Final
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '4px 12px', fontSize: '13px' }}>
                  <span style={{ color: '#78909C' }}>Re-enters orb:</span>
                  <span>{formatDateWithYear(timeline.retrogradePasses.thirdPass.start)}</span>
                  <span style={{ color: '#78909C' }}>EXACT at {natalDegree}°:</span>
                  <span style={{ fontWeight: '600' }}>{formatDateWithYear(timeline.retrogradePasses.thirdPass.exact)} ⭐</span>
                  <span style={{ color: '#78909C' }}>Exits orb:</span>
                  <span>{formatDateWithYear(timeline.retrogradePasses.thirdPass.end)}</span>
                </div>
              </div>
            )}
            
            <div style={{
              marginTop: '12px',
              padding: '10px 12px',
              background: 'rgba(156,39,176,0.1)',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#7B1FA2'
            }}>
              🔄 {timeline.retrogradeNote}
            </div>
          </div>
        ) : (
          /* Single pass for faster planets */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontWeight: '600', color: '#6A1B9A' }}>Entered Orb:</div>
            <div>{formatDateWithYear(timeline.orbEntryDate)}</div>
            
            <div style={{ fontWeight: '600', color: '#6A1B9A' }}>EXACT at {natalDegree}°:</div>
            <div>
              {formatDateWithYear(timeline.exactDegreeDate)} ⭐
            </div>
            
            <div style={{ fontWeight: '600', color: '#6A1B9A' }}>Exits Orb:</div>
            <div>{formatDateWithYear(timeline.orbExitDate)}</div>
            
            <div style={{ fontWeight: '600', color: '#6A1B9A' }}>Total Duration:</div>
            <div>{timeline.totalDays} days in orb</div>
          </div>
        )}
        
        <div style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '6px', color: '#6A1B9A' }}>
            What to Expect:
          </div>
          <div style={{ marginBottom: '6px' }}>
            • <strong>Building Phase</strong>: Energy increases as {getSymbol(transitPlanet)} approaches your natal {getSymbol(natalPlanet)}.
          </div>
          <div style={{ marginBottom: '6px' }}>
            • <strong>Peak</strong> (at {natalDegree}°): Maximum intensity when {getSymbol(transitPlanet)} crosses your exact natal degree.
          </div>
          <div>
            • <strong>Release Phase</strong>: Energy decreases as {getSymbol(transitPlanet)} separates. Integration period.
          </div>
          {timeline.retrogradePasses?.hasRetrograde && (
            <div style={{ marginTop: '8px', color: '#7B1FA2' }}>
              • <strong>Retrograde deepening</strong>: The 2nd pass often brings the deepest transformation as you revisit themes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const HistoricalPatterns = ({ matches, transitPlanet, natalPlanet, natalDegree, natalSign, aspect, currentDate }: {
  matches: HistoricalMatch[];
  transitPlanet: string;
  natalPlanet: string;
  natalDegree: number;
  natalSign: string;
  aspect: string;
  currentDate: Date;
}) => {
  const frequency = getTransitFrequency(transitPlanet, aspect);
  const calculatedOccurrences = calculatePastOccurrences(transitPlanet, natalDegree, natalSign, aspect, currentDate);
  
  // Rarity badge colors
  const rarityColors: Record<string, { bg: string; text: string; border: string }> = {
    'common': { bg: '#E8F5E9', text: '#2E7D32', border: '#81C784' },
    'moderate': { bg: '#FFF3E0', text: '#E65100', border: '#FFB74D' },
    'rare': { bg: '#E3F2FD', text: '#1565C0', border: '#64B5F6' },
    'very-rare': { bg: '#F3E5F5', text: '#7B1FA2', border: '#BA68C8' },
    'once-in-lifetime': { bg: '#FCE4EC', text: '#C2185B', border: '#F48FB1' },
  };
  
  const rarityStyle = rarityColors[frequency.rarity] || rarityColors['moderate'];
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #ECEFF1 0%, #CFD8DC 100%)',
      borderRadius: '8px',
      border: '1px solid #90A4AE'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#37474F'
        }}>
          📅 When This Transit Occurs
        </h4>
        
        {/* Rarity Badge */}
        <div style={{
          padding: '4px 10px',
          background: rarityStyle.bg,
          border: `1px solid ${rarityStyle.border}`,
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '600',
          color: rarityStyle.text,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {frequency.rarity === 'once-in-lifetime' ? '✨ Once in Lifetime' : 
           frequency.rarity === 'very-rare' ? '💎 Very Rare' :
           frequency.rarity === 'rare' ? '⭐ Rare' :
           frequency.rarity === 'moderate' ? '○ Occasional' : '● Regular'}
        </div>
      </div>
      
      {/* Frequency Info */}
      <div style={{
        padding: '16px',
        background: 'rgba(255,255,255,0.9)',
        borderRadius: '6px',
        marginBottom: '16px',
        borderLeft: `4px solid ${rarityStyle.border}`
      }}>
        <div style={{ fontSize: '15px', fontWeight: '600', color: '#37474F', marginBottom: '8px' }}>
          {getSymbol(transitPlanet)} {transitPlanet} {aspect} {getSymbol(natalPlanet)} {natalPlanet}: {frequency.frequency}
        </div>
        <div style={{ fontSize: '13px', color: '#546E7A', lineHeight: '1.6' }}>
          {frequency.description}
        </div>
        <div style={{ fontSize: '12px', color: '#78909C', marginTop: '8px' }}>
          <strong>Next occurrence:</strong> {frequency.nextIn}
        </div>
      </div>
      
      {/* Frequency Summary */}
      <div style={{
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #81C784'
      }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2E7D32', marginBottom: '4px' }}>
          📊 This happens: {frequency.frequency}
        </div>
        <div style={{ fontSize: '12px', color: '#558B2F' }}>
          {getTransitCycle(transitPlanet)}
        </div>
      </div>
      
      {/* Calculated Past & Future Occurrences */}
      {calculatedOccurrences.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#37474F', marginBottom: '10px' }}>
            📆 Past Occurrences:
          </div>
          <div style={{ fontSize: '12px', color: '#78909C', marginBottom: '10px', fontStyle: 'italic' }}>
            Calculated estimates based on orbital mechanics. Dates may vary due to retrograde.
          </div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', 
            gap: '8px' 
          }}>
            {calculatedOccurrences.slice(0, 8).map((occurrence, i) => {
              const year = occurrence.date.getFullYear();
              const yearsAgo = Math.floor((currentDate.getTime() - occurrence.date.getTime()) / (1000 * 60 * 60 * 24 * 365));
              return (
                <div key={i} style={{
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.8)',
                  borderRadius: '4px',
                  fontSize: '13px',
                  border: '1px solid #CFD8DC',
                  textAlign: 'center'
                }}>
                  <div style={{ fontWeight: '700', color: '#37474F', fontSize: '16px' }}>
                    {year}
                  </div>
                  <div style={{ fontSize: '11px', color: '#78909C' }}>
                    {yearsAgo > 0 ? `${yearsAgo} yr${yearsAgo > 1 ? 's' : ''} ago` : 'This year'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Journal Entries for this transit */}
      {matches && matches.length > 0 && (
        <div style={{
          padding: '16px',
          background: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)',
          borderRadius: '6px',
          border: '1px solid #26A69A'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#00695C', marginBottom: '12px' }}>
            📓 Your Journal Entries for This Transit:
          </div>
          {matches.slice(0, 3).map((match, i) => (
            <div key={i} style={{
              marginBottom: i < matches.length - 1 ? '12px' : 0,
              padding: '12px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '4px',
              borderLeft: '4px solid #26A69A'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{ fontWeight: '600', color: '#00695C', fontSize: '13px' }}>
                  {match.date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
                <div style={{ fontSize: '11px', color: '#6B6B6B' }}>
                  {match.yearsAgo > 0 ? `${match.yearsAgo} year${match.yearsAgo > 1 ? 's' : ''} ago` : 'This year'}
                </div>
              </div>
              
              {match.journalEntry && (
                <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#424242' }}>
                  "{match.journalEntry}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Prompt to journal if no entries */}
      {(!matches || matches.length === 0) && (
        <div style={{
          padding: '12px',
          background: 'rgba(255,235,59,0.15)',
          borderRadius: '4px',
          fontSize: '13px',
          color: '#5D4037'
        }}>
          💡 <strong>Tip:</strong> Start journaling this transit below! Next time it occurs, you'll be able to compare how you felt and identify patterns in your life.
        </div>
      )}
    </div>
  );
};

const JournalWithPatterns = ({ aspect, currentDate }: {
  aspect: TransitAspect;
  currentDate: Date;
}) => {
  const [journalEntry, setJournalEntry] = useState('');
  const [saved, setSaved] = useState(false);
  
  const saveJournal = () => {
    const transitSignature = `${aspect.transitPlanet.toLowerCase()}-${aspect.aspect}-${aspect.natalPlanet.toLowerCase()}`;
    const journalData = {
      date: currentDate.toISOString(),
      transitSignature,
      transitDegree: aspect.transitDegree,
      transitSign: aspect.transitSign,
      natalDegree: aspect.natalDegree,
      natalSign: aspect.natalSign,
      entry: journalEntry,
    };
    
    const existingJournals = JSON.parse(localStorage.getItem('transitJournals') || '[]');
    existingJournals.push(journalData);
    localStorage.setItem('transitJournals', JSON.stringify(existingJournals));
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  return (
    <div style={{
      padding: '20px',
      background: 'linear-gradient(135deg, #FFF9C4 0%, #FFF59D 100%)',
      borderRadius: '8px',
      border: '1px solid #FBC02D'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#F57F17'
      }}>
        📔 Journal This Transit - Track the Pattern
      </h4>
      
      <div style={{ fontSize: '14px', lineHeight: '1.8', color: '#2C2C2C', marginBottom: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          Write about how you are experiencing this transit. When this same aspect happens again, 
          you will see your entry here and recognize the pattern.
        </div>
        
        <div style={{
          padding: '12px',
          background: 'rgba(255,255,255,0.9)',
          borderRadius: '4px',
          fontSize: '13px',
          marginBottom: '12px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '8px', color: '#F57F17' }}>
            Reflection Prompts:
          </div>
          <div>• How are you feeling in your body right now?</div>
          <div>• What themes are coming up{aspect.natalHouse ? ` in your ${HOUSE_MEANINGS[aspect.natalHouse].short.toLowerCase()}` : ''}?</div>
          <div>• What power dynamics are you noticing?</div>
          <div>• What wants to transform?</div>
          <div>• What are you learning?</div>
        </div>
      </div>
      
      <textarea
        value={journalEntry}
        onChange={(e) => setJournalEntry(e.target.value)}
        placeholder="Write your experience of this transit here..."
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '16px',
          border: '1px solid #FBC02D',
          borderRadius: '4px',
          fontSize: '14px',
          fontFamily: 'Lato, sans-serif',
          resize: 'vertical',
          marginBottom: '12px',
          boxSizing: 'border-box',
        }}
      />
      
      <button
        onClick={saveJournal}
        disabled={!journalEntry.trim()}
        style={{
          padding: '12px 24px',
          background: journalEntry.trim() ? '#FBC02D' : '#E0E0E0',
          color: journalEntry.trim() ? '#2C2C2C' : '#9E9E9E',
          border: 'none',
          borderRadius: '4px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: journalEntry.trim() ? 'pointer' : 'not-allowed',
        }}
      >
        {saved ? '✓ Saved!' : '💾 Save Journal Entry'}
      </button>
    </div>
  );
};

// All Natal Points Being Aspected by this Transit Planet
const AllNatalAspects = ({ transitPlanet, transitDegree, transitSign, natalChart, currentDate }: {
  transitPlanet: string;
  transitDegree: number;
  transitSign: string;
  natalChart: NatalChart;
  currentDate: Date;
}) => {
  const aspectAngles: Record<string, { angle: number; orb: number; symbol: string; name: string }> = {
    conjunction: { angle: 0, orb: 8, symbol: '☌', name: 'conjunction' },
    opposition: { angle: 180, orb: 8, symbol: '☍', name: 'opposition' },
    trine: { angle: 120, orb: 8, symbol: '△', name: 'trine' },
    square: { angle: 90, orb: 7, symbol: '□', name: 'square' },
    sextile: { angle: 60, orb: 6, symbol: '⚹', name: 'sextile' },
  };
  
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const transitLongitude = signs.indexOf(transitSign) * 30 + transitDegree;
  
  // Find all natal planets being aspected by this transit
  const allAspects: Array<{
    natalPlanet: string;
    natalDegree: number;
    natalSign: string;
    aspectType: string;
    aspectSymbol: string;
    orb: number;
    isExact: boolean;
    exactDate: Date;
  }> = [];
  
  Object.entries(natalChart.planets).forEach(([planetName, position]) => {
    if (!position?.sign || !position?.degree) return;
    
    const natalLongitude = signs.indexOf(position.sign) * 30 + position.degree;
    
    Object.entries(aspectAngles).forEach(([aspectName, aspectData]) => {
      let diff = Math.abs(transitLongitude - natalLongitude);
      if (diff > 180) diff = 360 - diff;
      
      // Adjust for the aspect angle
      const angleDiff = Math.abs(diff - aspectData.angle);
      
      if (angleDiff <= aspectData.orb) {
        // Calculate when transit will be/was exact at this natal degree
        const speed = PLANET_SPEEDS[transitPlanet.toLowerCase()] || 1;
        
        // For the specific aspect angle, we need to find when transit will be at the right position
        // The "right position" is when the transit creates the exact aspect
        const targetTransitLongitude = aspectData.angle === 0 
          ? natalLongitude 
          : aspectData.angle === 180
          ? (natalLongitude + 180) % 360
          : aspectData.angle === 120
          ? (natalLongitude + (transitLongitude > natalLongitude ? 120 : -120) + 360) % 360
          : aspectData.angle === 90
          ? (natalLongitude + (transitLongitude > natalLongitude ? 90 : -90) + 360) % 360
          : (natalLongitude + (transitLongitude > natalLongitude ? 60 : -60) + 360) % 360;
        
        // Days from current position to target
        let degreesToTarget = targetTransitLongitude - transitLongitude;
        if (degreesToTarget < -180) degreesToTarget += 360;
        if (degreesToTarget > 180) degreesToTarget -= 360;
        
        const daysToExact = degreesToTarget / speed;
        
        const exactDate = new Date(currentDate);
        exactDate.setDate(exactDate.getDate() + Math.floor(daysToExact));
        
        allAspects.push({
          natalPlanet: planetName,
          natalDegree: position.degree,
          natalSign: position.sign,
          aspectType: aspectName,
          aspectSymbol: aspectData.symbol,
          orb: angleDiff,
          isExact: angleDiff < 1,
          exactDate,
        });
      }
    });
  });
  
  // Sort by orb (tightest first)
  allAspects.sort((a, b) => a.orb - b.orb);
  
  if (allAspects.length === 0) return null;
  
  return (
    <div style={{
      marginBottom: '24px',
      padding: '20px',
      background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
      borderRadius: '8px',
      border: '1px solid #EF5350'
    }}>
      <h4 style={{
        fontSize: '16px',
        fontWeight: '700',
        marginBottom: '12px',
        color: '#C62828'
      }}>
        🎯 All Your Natal Points {getSymbol(transitPlanet)} {transitPlanet} is Hitting
      </h4>
      
      <div style={{ fontSize: '13px', color: '#B71C1C', marginBottom: '16px' }}>
        {getSymbol(transitPlanet)} at {transitDegree}° {transitSign} is currently making aspects to {allAspects.length} of your natal points:
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {allAspects.map((asp, idx) => {
          const isPast = asp.exactDate < currentDate;
          const isCurrent = Math.abs(asp.exactDate.getTime() - currentDate.getTime()) < (7 * 24 * 60 * 60 * 1000); // Within a week
          
          return (
            <div key={idx} style={{
              padding: '12px',
              background: isCurrent ? 'rgba(255,235,59,0.3)' : 'rgba(255,255,255,0.9)',
              borderRadius: '6px',
              borderLeft: `4px solid ${asp.isExact ? '#F44336' : isCurrent ? '#FFC107' : '#90A4AE'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>
                  {getSymbol(transitPlanet)}{asp.aspectSymbol}{getSymbol(asp.natalPlanet)}
                </span>
                <div>
                  <div style={{ fontWeight: '600', color: '#424242' }}>
                    {asp.aspectType} to {PLANET_ESSENCES[asp.natalPlanet.toLowerCase()]?.name || asp.natalPlanet}
                  </div>
                  <div style={{ fontSize: '12px', color: '#757575' }}>
                    Your {getSymbol(asp.natalPlanet)} at {asp.natalDegree}° {asp.natalSign} • Orb: {asp.orb.toFixed(1)}°
                  </div>
                </div>
              </div>
              
              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '600',
                  color: isCurrent ? '#F57F17' : isPast ? '#78909C' : '#2E7D32'
                }}>
                  {isCurrent ? '⭐ NOW' : isPast ? 'PASSED' : 'UPCOMING'}
                </div>
                <div style={{ fontSize: '11px', color: '#9E9E9E' }}>
                  Exact: {asp.exactDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        marginTop: '12px', 
        padding: '10px', 
        background: 'rgba(255,255,255,0.8)', 
        borderRadius: '4px',
        fontSize: '12px',
        color: '#5D4037'
      }}>
        💡 <strong>Tip:</strong> Outer planets like {getSymbol(transitPlanet)} move slowly, so they often aspect multiple natal points simultaneously. 
        Watch for themes connecting these life areas.
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface ComprehensiveTransitAnalysisProps {
  aspect: TransitAspect;
  natalChart: NatalChart;
  currentDate: Date;
  allTransitAspects?: TransitAspect[]; // All aspects from this transit planet
}

export const ComprehensiveTransitAnalysis = ({ 
  aspect, 
  natalChart, 
  currentDate 
}: ComprehensiveTransitAnalysisProps) => {
  const historicalMatches = findHistoricalMatches(aspect, currentDate);
  
  // Detect chart patterns
  const chartPatterns = detectChartPatterns(natalChart);
  
  // Check if this transit activates any patterns
  const transitDegree = aspect.transitDegree + (['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'].indexOf(aspect.transitSign) * 30);
  const activatedPatterns = getPatternActivation(aspect.transitPlanet, transitDegree, natalChart);
  
  return (
    <div style={{
      marginBottom: '32px',
      padding: '28px',
      background: '#FFFFFF',
      borderRadius: '12px',
      border: `3px solid ${aspect.color}`,
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }}>
      {/* Header */}
      <div style={{
        fontSize: '20px',
        fontWeight: '700',
        marginBottom: '20px',
        color: aspect.color,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '28px' }}>
          {getSymbol(aspect.transitPlanet)}{aspect.symbol}{getSymbol(aspect.natalPlanet)}
        </span>
        <span>
          Transit {aspect.transitPlanet}
          {' '}{aspect.aspect}s{' '}
          Natal {aspect.natalPlanet}
        </span>
        {aspect.isExact && <span style={{ fontSize: '24px' }}>⭐</span>}
      </div>
      
      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px',
        marginBottom: '24px',
        padding: '16px',
        background: '#F5F3EF',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '4px' }}>TRANSIT</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {aspect.transitDegree}° {aspect.transitSign}
          </div>
          {aspect.transitHouse && (
            <div style={{ fontSize: '12px', color: '#8B7355' }}>
              in your {aspect.transitHouse}{getOrdinal(aspect.transitHouse)} house
            </div>
          )}
        </div>
        
        <div>
          <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '4px' }}>NATAL</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {aspect.natalDegree}° {aspect.natalSign}
          </div>
          {aspect.natalHouse && (
            <div style={{ fontSize: '12px', color: '#8B7355' }}>
              in your {aspect.natalHouse}{getOrdinal(aspect.natalHouse)} house
            </div>
          )}
        </div>
        
        <div>
          <div style={{ fontSize: '11px', color: '#6B6B6B', marginBottom: '4px' }}>ORB</div>
          <div style={{ fontSize: '14px', fontWeight: '600' }}>
            {aspect.isExact ? 'EXACT!' : `${aspect.orb}°`}
          </div>
          <div style={{ fontSize: '12px', color: '#8B7355' }}>
            {aspect.meaning}
          </div>
        </div>
      </div>
      
      {/* Section 1: What This Degree Means in YOUR Chart */}
      <DegreeMeaning
        degree={aspect.transitDegree}
        sign={aspect.transitSign}
        house={aspect.transitHouse}
        natalChart={natalChart}
      />
      
      {/* Section 2: What the Transit Activates */}
      <TransitActivation
        transitPlanet={aspect.transitPlanet}
        transitDegree={aspect.transitDegree}
        transitSign={aspect.transitSign}
        transitHouse={aspect.transitHouse}
        natalPlanet={aspect.natalPlanet}
        natalDegree={aspect.natalDegree}
        natalSign={aspect.natalSign}
        natalHouse={aspect.natalHouse}
        aspect={aspect.aspect}
      />
      
      {/* Section 3: How This FEELS */}
      <HowItFeels
        transitPlanet={aspect.transitPlanet}
        natalPlanet={aspect.natalPlanet}
        aspect={aspect.aspect}
        natalHouse={aspect.natalHouse}
      />
      
      {/* Section 4: Timeline & Duration */}
      <TransitTimeline
        transitPlanet={aspect.transitPlanet}
        transitDegree={aspect.transitDegree}
        natalPlanet={aspect.natalPlanet}
        natalDegree={aspect.natalDegree}
        natalSign={aspect.natalSign}
        aspect={aspect.aspect}
        currentDate={currentDate}
      />
      
      {/* Section 5: All Natal Points Being Hit by This Transit Planet */}
      <AllNatalAspects
        transitPlanet={aspect.transitPlanet}
        transitDegree={aspect.transitDegree}
        transitSign={aspect.transitSign}
        natalChart={natalChart}
        currentDate={currentDate}
      />
      
      {/* Section 6: Historical Patterns */}
      <HistoricalPatterns
        matches={historicalMatches}
        transitPlanet={aspect.transitPlanet}
        natalPlanet={aspect.natalPlanet}
        natalDegree={aspect.natalDegree}
        natalSign={aspect.natalSign}
        aspect={aspect.aspect}
        currentDate={currentDate}
      />
      
      {/* Section 6: Chart Patterns (Grand Cross, Yod, etc.) */}
      {(chartPatterns.length > 0 || activatedPatterns.length > 0) && (
        <div style={{
          marginBottom: '24px',
          padding: '20px',
          background: 'linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%)',
          borderRadius: '8px',
          border: '1px solid #AB47BC'
        }}>
          <h4 style={{
            fontSize: '16px',
            fontWeight: '700',
            marginBottom: '16px',
            color: '#6A1B9A'
          }}>
            🔮 Chart Patterns Detected
          </h4>
          
          {activatedPatterns.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: '600', color: '#7B1FA2', marginBottom: '8px', fontSize: '14px' }}>
                ⚡ ACTIVATED BY THIS TRANSIT:
              </div>
              {activatedPatterns.map((pattern, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '6px',
                  marginBottom: '8px',
                  borderLeft: '4px solid #AB47BC'
                }}>
                  <div style={{ fontWeight: '700', color: '#4A148C', marginBottom: '6px' }}>
                    {pattern.symbol} {pattern.name}
                  </div>
                  <div style={{ fontSize: '13px', color: '#4A148C', marginBottom: '8px' }}>
                    {pattern.description}
                  </div>
                  <div style={{ fontSize: '13px', color: '#6A1B9A', marginBottom: '6px' }}>
                    {pattern.meaning}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1', minWidth: '180px', padding: '8px', background: 'rgba(244,67,54,0.1)', borderRadius: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '11px', color: '#C62828' }}>Challenge: </span>
                      <span style={{ fontSize: '12px', color: '#B71C1C' }}>{pattern.challenge}</span>
                    </div>
                    <div style={{ flex: '1', minWidth: '180px', padding: '8px', background: 'rgba(76,175,80,0.1)', borderRadius: '4px' }}>
                      <span style={{ fontWeight: '600', fontSize: '11px', color: '#2E7D32' }}>Gift: </span>
                      <span style={{ fontSize: '12px', color: '#1B5E20' }}>{pattern.gift}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {chartPatterns.length > 0 && (
            <div>
              <div style={{ fontWeight: '600', color: '#7B1FA2', marginBottom: '8px', fontSize: '14px' }}>
                📐 YOUR NATAL CHART PATTERNS:
              </div>
              {chartPatterns.map((pattern, idx) => (
                <div key={idx} style={{
                  padding: '12px',
                  background: 'rgba(255,255,255,0.7)',
                  borderRadius: '6px',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontWeight: '600', color: '#6A1B9A', marginBottom: '4px' }}>
                    {pattern.symbol} {pattern.name}: {pattern.planets.join(', ')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#7B1FA2' }}>
                    {pattern.meaning}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Section 7: Journal Prompt with Pattern Tracking */}
      <JournalWithPatterns
        aspect={aspect}
        currentDate={currentDate}
      />
    </div>
  );
};

export default ComprehensiveTransitAnalysis;
