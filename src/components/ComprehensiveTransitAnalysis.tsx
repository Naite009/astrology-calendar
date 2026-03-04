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
import { getStationDates, formatRetrogradeDate } from '@/lib/retrogradePatterns';
import * as Astronomy from 'astronomy-engine';
import { RETROGRADE_GUIDANCE, KENT_SOURCE } from '@/lib/transitGuidanceData';

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

const ASPECT_MEANINGS: Record<string, { meaning: string; energy: string; plainExplanation: string }> = {
  conjunction: { meaning: 'merges with', energy: 'Fusion - these energies become ONE. Intensity and focus.', plainExplanation: 'These two forces combine into one — it\'s like they\'re speaking at the same time, amplifying each other.' },
  opposition: { meaning: 'opposes', energy: 'Polarity - awareness through contrast. Balance required.', plainExplanation: 'These two forces pull you in opposite directions — like being torn between two equally important needs. The goal is to find balance, not choose one over the other.' },
  trine: { meaning: 'flows with', energy: 'Harmony - natural talent and ease. Gifts that come easily.', plainExplanation: 'These two forces naturally support each other — things flow easily here. It\'s a green light.' },
  square: { meaning: 'challenges', energy: 'Tension - friction that creates action. Growth through struggle.', plainExplanation: 'These two forces clash — creating friction you can feel. It\'s uncomfortable but pushes you to grow. Think of it as growing pains.' },
  sextile: { meaning: 'supports', energy: 'Opportunity - potential that needs activation. Gentle gifts.', plainExplanation: 'These two forces gently cooperate — opportunities appear if you reach for them. It\'s a helpful nudge, not a push.' },
};

// Plain-language planet name lookup (no symbols)
const PLANET_PLAIN_NAMES: Record<string, string> = {
  sun: 'the Sun (your identity)', moon: 'the Moon (your emotions)', mercury: 'Mercury (your mind)',
  venus: 'Venus (your love & values)', mars: 'Mars (your drive & action)',
  jupiter: 'Jupiter (growth & opportunity)', saturn: 'Saturn (structure & responsibility)',
  uranus: 'Uranus (change & awakening)', neptune: 'Neptune (intuition & spirituality)',
  pluto: 'Pluto (deep transformation)', chiron: 'Chiron (your deepest wound)',
  northnode: 'North Node (your life direction)', ascendant: 'your Rising Sign (how others see you)',
  midheaven: 'your Midheaven (career & public life)',
};

const getPlainPlanetName = (planet: string): string => {
  return PLANET_PLAIN_NAMES[planet.toLowerCase()] || planet;
};

// Generate a practical, jargon-free explanation of what a transit aspect means
const generatePracticalMeaning = (transitPlanet: string, natalPlanet: string, aspectType: string, natalHouse?: number | null): string => {
  const transit = PLANET_ESSENCES[transitPlanet.toLowerCase()];
  const natal = PLANET_ESSENCES[natalPlanet.toLowerCase()];
  const aspect = ASPECT_MEANINGS[aspectType];
  if (!transit || !natal || !aspect) return '';

  const houseContext = natalHouse ? ` This is playing out in your ${HOUSE_MEANINGS[natalHouse]?.short?.toLowerCase() || ''} area of life.` : '';

  // Build specific practical explanations for common combinations
  const key = `${transitPlanet.toLowerCase()}-${aspectType}-${natalPlanet.toLowerCase()}`;
  const practicalDB: Record<string, string> = {
    'uranus-opposition-neptune': 'The part of you that craves sudden change and freedom is pulling against the part of you that dreams, imagines, and connects to something greater. You may feel restless — like your inner visionary is being shaken awake. Old spiritual beliefs or fantasies you\'ve held since childhood are being disrupted. This is about waking up to a more authentic version of your intuition — letting go of illusions so your real spiritual gifts can emerge.',
    'uranus-conjunction-neptune': 'Your intuition and imagination are being electrified. Sudden spiritual insights, vivid dreams, or creative breakthroughs may come out of nowhere. This can feel disorienting but ultimately liberating.',
    'pluto-conjunction-sun': 'Who you are at your core is being completely transformed. You may feel like a different person is emerging. Old identities are dying so a more authentic you can be born.',
    'pluto-opposition-sun': 'You\'re facing powerful forces (people, situations, or inner compulsions) that challenge who you think you are. Power struggles may arise. The point is to reclaim your authentic power.',
    'pluto-square-moon': 'Your deepest emotions are being intensified and transformed. Old emotional patterns — possibly from childhood — are surfacing to be healed. This feels heavy but leads to emotional freedom.',
    'saturn-opposition-moon': 'Your emotional needs feel restricted or tested. You might feel lonely, burdened, or like you can\'t get the nurturing you need. This is about learning emotional self-reliance and setting healthy boundaries.',
    'saturn-conjunction-saturn': 'This is your Saturn Return — a major life milestone. The structures you\'ve built are being evaluated. What\'s solid stays; what\'s not falls away. You\'re growing up in a significant way.',
    'jupiter-conjunction-sun': 'Confidence and opportunities are expanding. You feel optimistic and lucky. Doors open more easily. This is one of the best transits for growth and new beginnings.',
    'neptune-square-venus': 'Your romantic ideals are being tested. You might feel confused about love, attracted to unavailable people, or seeing partnerships through rose-colored glasses. The gift is learning to love with both your heart AND your eyes open.',
    'uranus-square-sun': 'You\'re feeling a strong urge to break free from anything that feels confining — a job, a relationship, an identity. Sudden changes may happen. The goal is to become more authentically yourself, not just rebel for rebellion\'s sake.',
  };

  if (practicalDB[key]) {
    return practicalDB[key] + houseContext;
  }

  // Generate a meaningful generic explanation
  return `Right now, the energy of ${getPlainPlanetName(transitPlanet)} is interacting with ${getPlainPlanetName(natalPlanet)} in your birth chart. ${aspect.plainExplanation} In practical terms: the themes of ${transit.essence.toLowerCase()} are actively ${aspectType === 'opposition' ? 'challenging and stretching' : aspectType === 'square' ? 'creating friction with' : aspectType === 'trine' ? 'supporting and enhancing' : aspectType === 'sextile' ? 'gently helping' : 'intensifying'} the part of you that relates to ${natal.essence.toLowerCase()}${houseContext}`;
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

// ============================================================================
// TRANSIT FEELING DATA — Somatic, Psychological, Esoteric
// ============================================================================

// What each transit planet DOES to whatever it touches
const TRANSIT_PLANET_FEELING: Record<string, { verb: string; somatic: string; psyche: string; esoteric: string }> = {
  sun: { verb: 'illuminates', somatic: 'Warmth in the chest, a surge of vitality, heightened awareness of your heartbeat. You feel more SEEN — for better or worse.', psyche: 'Your ego and conscious identity are lit up. You become acutely aware of how you present yourself and whether you are living authentically.', esoteric: 'The Sun is the spotlight of consciousness — it makes visible what was hidden. Nothing can stay in shadow under this light.' },
  moon: { verb: 'emotionalizes', somatic: 'Stomach flutters, appetite changes, water retention, sensitivity in the chest. Your body responds to feelings before your mind catches up.', psyche: 'Emotions are heightened and reactive. Old memories surface. You feel more vulnerable, more tender, more in need of comfort and safety.', esoteric: 'The Moon governs the instinctual body — the part of you that reacts before thinking. It connects you to ancestral and maternal patterns.' },
  mercury: { verb: 'activates mentally', somatic: 'Restless hands, rapid thoughts, tension in shoulders and neck. You might talk faster, think in loops, or feel mentally buzzy.', psyche: 'Your mind is stimulated. Ideas come quickly. Communication becomes important — conversations, emails, decisions all carry more weight.', esoteric: 'Mercury is the messenger — it creates connections between ideas and people. It asks you to NAME what you are experiencing.' },
  venus: { verb: 'softens', somatic: 'Relaxation in the face and jaw, desire for touch and beauty, craving sweet or comforting foods. Your senses become more receptive.', psyche: 'You want harmony, beauty, connection. Relationships come into focus. You evaluate what and who you value — and whether you feel valued in return.', esoteric: 'Venus is the principle of attraction and receptivity — it draws toward you what resonates with your authentic values.' },
  mars: { verb: 'energizes', somatic: 'Heat in the body, increased pulse, tension in muscles, restless legs. You feel the urge to DO something — move, compete, confront, build.', psyche: 'Your drive and assertiveness are activated. Anger may surface. You feel impatient with anything blocking your way. Desire — sexual and otherwise — intensifies.', esoteric: 'Mars is the warrior principle — it asks where you need to fight, what boundaries need defending, and what you are willing to pursue with full force.' },
  jupiter: { verb: 'expands', somatic: 'A feeling of spaciousness in the chest, deep breathing, optimism that shows up as physical lightness. Possible overindulgence — too much food, spending, or saying yes.', psyche: 'Hope returns. You see the bigger picture. Opportunities appear. The danger is overconfidence — saying yes to everything without discernment.', esoteric: 'Jupiter is the principle of growth through meaning. It asks: what is this experience teaching you about your place in something larger?' },
  saturn: { verb: 'constricts', somatic: 'Heaviness in the body, stiff joints, fatigue, feeling like you are carrying weight. Your body tells you to slow down and get serious.', psyche: 'Pressure to get real. Responsibilities increase. You feel tested — not punished, but evaluated. What is solid stays; what is built on sand crumbles. Fear of failure may surface.', esoteric: 'Saturn is the teacher of time and consequence. It builds character through limitation. It asks: are you willing to do the hard work that lasting things require?' },
  uranus: { verb: 'disrupts', somatic: 'Electric, jittery energy. Heart palpitations or sudden anxiety. Feeling wired but not tired. Sleep disruptions. A physical sensation of restlessness — like your skin does not fit right.', psyche: 'You need freedom NOW. Anything that feels confining becomes unbearable. Sudden insights crack open old patterns. You may act impulsively or make unexpected changes.', esoteric: 'Uranus is the awakener — the lightning bolt that shatters what is outdated so something more authentic can emerge. It liberates through shock.' },
  neptune: { verb: 'dissolves', somatic: 'Fatigue, brain fog, heightened sensitivity to substances and environments. Feeling spacey, dreamy, or overwhelmed by stimuli. Boundaries between self and others blur. You may feel more psychic or more confused — sometimes both.', psyche: 'Reality becomes less certain. You question what is real. Idealism rises — but so does the potential for deception (of self or others). Spiritual longing intensifies. Creative inspiration flows but practical focus suffers.', esoteric: 'Neptune dissolves the ego\'s boundaries so you can connect to something transcendent. The danger is losing yourself; the gift is finding the divine.' },
  pluto: { verb: 'transforms', somatic: 'Deep, visceral tension — gut, pelvis, base of spine. A sense of something being pulled from within you. Exhaustion from the intensity. Sleep may bring vivid, sometimes disturbing dreams. The body holds what the mind tries to avoid.', psyche: 'Power dynamics surface. You confront what you have been avoiding — shadow material, control issues, buried rage, grief, or desire. This is a death-and-rebirth process. Something in you must die so something more authentic can live.', esoteric: 'Pluto is the lord of the underworld — it forces descent into your own depths. What you find there, if you face it honestly, becomes your greatest source of power.' },
  chiron: { verb: 'reopens wounds', somatic: 'A dull ache in the body — often in an area connected to old injuries or chronic issues. Feeling physically vulnerable. The body remembers what the mind has forgotten.', psyche: 'Old wounds resurface — not to punish you, but because you are now ready to heal at a deeper level. Sensitivity increases. You may feel inadequate or broken, but this is the doorway to becoming a healer for others.', esoteric: 'Chiron is the wounded healer. It shows you that your deepest pain contains your greatest gift. The wound that never fully closes becomes the opening through which grace enters.' },
};

// What each NATAL planet/point represents when activated
const NATAL_TARGET_FEELING: Record<string, { area: string; when_activated: string; house_flavor: (h: number | null) => string }> = {
  sun: { area: 'your core identity and sense of self', when_activated: 'Who you ARE is being directly affected. Your confidence, vitality, and life direction are in play.', house_flavor: (h) => h ? `Your identity is being shaped through ${HOUSE_MEANINGS[h].keywords} themes — this is where you are discovering who you really are right now.` : '' },
  moon: { area: 'your emotional body and inner security', when_activated: 'Your feelings, needs, and sense of safety are activated. Childhood patterns and maternal themes may surface.', house_flavor: (h) => h ? `Your emotional life is focused on ${HOUSE_MEANINGS[h].keywords} — this is where you feel most vulnerable and most in need of nurturing right now.` : '' },
  mercury: { area: 'your thinking patterns and communication', when_activated: 'How you think, speak, learn, and process information is being reshaped. Important conversations and decisions are likely.', house_flavor: (h) => h ? `Your mental focus is on ${HOUSE_MEANINGS[h].keywords} — expect important communications and decisions in this area.` : '' },
  venus: { area: 'your relationships and values', when_activated: 'Love, money, beauty, and what you value are in the spotlight. Relationships shift. Your aesthetic sense and self-worth are affected.', house_flavor: (h) => h ? `Your relationships and values are being tested or enriched through ${HOUSE_MEANINGS[h].keywords}. This is where you are learning what truly matters.` : '' },
  mars: { area: 'your drive, anger, and assertiveness', when_activated: 'Your energy levels, sexual drive, competitive instincts, and capacity for anger are all in play. Conflicts may arise — or you may find new courage.', house_flavor: (h) => h ? `Your energy and assertiveness are directed at ${HOUSE_MEANINGS[h].keywords}. This is where you are fighting, building, or defending right now.` : '' },
  jupiter: { area: 'your beliefs and sense of meaning', when_activated: 'Your faith, optimism, philosophical outlook, and capacity for growth are being touched. This can feel expansive or destabilizing if beliefs are challenged.', house_flavor: (h) => h ? `Growth and opportunity are coming through ${HOUSE_MEANINGS[h].keywords}. This is where your world is getting bigger.` : '' },
  saturn: { area: 'your structures, responsibilities, and authority', when_activated: 'Your relationship with rules, limits, career, and maturity is being activated. This can feel heavy but builds lasting foundations.', house_flavor: (h) => h ? `Responsibility and restructuring are focused on ${HOUSE_MEANINGS[h].keywords}. What you build here during this transit will last.` : '' },
  uranus: { area: 'your need for freedom and authenticity', when_activated: 'The most unconventional, rebellious part of your nature is being triggered. You may feel a powerful urge to break free from restrictions.', house_flavor: (h) => h ? `Your desire for freedom and change is focused on ${HOUSE_MEANINGS[h].keywords}. This is where life is asking you to evolve.` : '' },
  neptune: { area: 'your spirituality and imagination', when_activated: 'Your connection to the transcendent, your creativity, and your susceptibility to illusion are all heightened.', house_flavor: (h) => h ? `Spiritual sensitivity and creative inspiration flow through ${HOUSE_MEANINGS[h].keywords}. Be discerning — inspiration and illusion are close neighbors here.` : '' },
  pluto: { area: 'your deepest power and shadow', when_activated: 'Your relationship with power, control, and transformation is being directly engaged. Compulsions and obsessions may intensify.', house_flavor: (h) => h ? `Deep transformation and power dynamics are playing out through ${HOUSE_MEANINGS[h].keywords}. This is where you are being fundamentally changed.` : '' },
  chiron: { area: 'your core wound and healing gift', when_activated: 'Old pain resurfaces for deeper healing. You may feel more vulnerable than usual, but this sensitivity is the doorway to growth.', house_flavor: (h) => h ? `Healing and vulnerability are centered on ${HOUSE_MEANINGS[h].keywords}. This is where your wound becomes your wisdom.` : '' },
  ascendant: { area: 'how you present yourself and how others perceive you', when_activated: 'Your physical appearance, first impressions, and the mask you show the world are being directly altered. People may see you differently — or you may feel like a different person.', house_flavor: (h) => `This directly affects your 1st house of self-presentation, physical body, and personal identity. Others notice changes in you before you do.` },
  midheaven: { area: 'your career direction and public reputation', when_activated: 'Your professional life, public image, and life direction are in the spotlight. Career shifts, recognition, or reevaluation of your path are likely.', house_flavor: (h) => `This directly affects your 10th house of career, public standing, and life direction. Professional changes are unfolding.` },
  northnode: { area: 'your soul growth direction', when_activated: 'Your karmic path is being activated. Life events are pushing you toward your growth edge — away from comfort and toward destiny.', house_flavor: (h) => h ? `Your soul growth is expressing through ${HOUSE_MEANINGS[h].keywords}. Pay attention — this is where life is guiding you.` : '' },
  southnode: { area: 'your past-life patterns', when_activated: 'Old habits, comfort zones, and past-life tendencies are surfacing. You are being asked to release what no longer serves your evolution.', house_flavor: (h) => h ? `Past patterns and karmic release are playing out through ${HOUSE_MEANINGS[h].keywords}. What can you let go of here?` : '' },
};

// How each ASPECT TYPE colors the interaction
const ASPECT_FEELING_QUALITY: Record<string, { title_verb: string; body_mod: string; emotional_mod: string; duration_mod: string }> = {
  conjunction: { title_verb: 'Merges With', body_mod: 'The physical sensations are AMPLIFIED — you feel this transit as a direct, personal, undeniable force in your body. This is the most intense aspect.', emotional_mod: 'Emotionally, these two energies fuse into one — you cannot separate them. This feels all-consuming while it lasts. There is no escaping it — only moving through it.', duration_mod: 'Conjunctions are the strongest aspect. You feel them building as the transit planet approaches within 3° of exact, peaking at 0°, and lingering 2-3° past. For outer planets, this can mean months of intensity.' },
  opposition: { title_verb: 'Confronts', body_mod: 'Your body may feel pulled in two directions — tension between left/right sides, or a sense of being stretched. Headaches and jaw tension are common as you try to hold opposing forces.', emotional_mod: 'You feel torn between two equally important needs. Relationships become the mirror — other people act out the energy you are not owning. The goal is integration, not choosing one side.', duration_mod: 'Oppositions build awareness through contrast. The peak is at exact, but the tension is noticeable within 5° approaching. Outer planet oppositions last months and create major turning points.' },
  square: { title_verb: 'Pressures', body_mod: 'Friction in the body — tight muscles, clenched jaw, restless energy that demands ACTION. You feel like you must do something but are unsure what. The body is responding to internal conflict.', emotional_mod: 'This feels HARD. Squares create crisis energy — you are forced to change because staying the same becomes too painful. Frustration, anger, and urgency are common. But this friction is exactly what creates growth.', duration_mod: 'Squares feel urgent — the pressure builds within 3-5° of exact and demands resolution. The discomfort peaks at exact and releases slowly. For outer planets, expect weeks to months of active pressure.' },
  trine: { title_verb: 'Supports', body_mod: 'Ease in the body — smooth energy flow, relaxed muscles, natural vitality. You may not even notice this transit because it feels so natural. Good sleep, good appetite, things just work.', emotional_mod: 'Emotional harmony — things feel aligned without effort. Talent flows. Opportunities arrive easily. The only danger is taking the gifts for granted and not actively using them. Trines give but do not push.', duration_mod: 'Trines are gentle — they operate in the background. You feel them within 3° but they lack urgency. For outer planets, this creates a months-long window of ease and flow in the affected life area.' },
  sextile: { title_verb: 'Opens Doors For', body_mod: 'A gentle buzz of possibility — lightness in the body, curiosity, openness. You feel receptive to new ideas and connections. Energy is available but not demanding.', emotional_mod: 'A quiet confidence and openness to opportunity. Unlike trines (which deliver gifts), sextiles present doors you must choose to walk through. They reward initiative and curiosity.', duration_mod: 'Sextiles are brief and gentle. You feel them within 2-3° of exact. For inner planets, this lasts days; for outer planets, a few weeks. They reward quick, intentional action.' },
};

// Duration data based on planet speed
const TRANSIT_DURATIONS: Record<string, string> = {
  sun: 'The Sun moves about 1° per day. You feel this transit for about 5-7 days total, with the peak lasting 1-2 days around the exact aspect.',
  moon: 'The Moon moves about 13° per day. This transit lasts only a few hours — you may feel a brief emotional wave and then it passes. Check the time, not just the date.',
  mercury: 'Mercury moves 1-2° per day (when direct). This transit lasts about 3-5 days. If Mercury is retrograde, it can pass this point THREE times over 2-3 weeks — intensifying the mental processing.',
  venus: 'Venus moves about 1° per day. This transit lasts about 5-7 days. If Venus is retrograde (rare), it can revisit this point over several weeks.',
  mars: 'Mars moves about 0.5° per day. This transit lasts about 1-2 weeks. Mars retrograde (every 2 years) can extend this to 2-3 months of sustained activation.',
  jupiter: 'Jupiter moves about 0.08° per day (5 arcminutes). This transit is active for about 2-3 months. With retrograde motion, Jupiter can make 3 passes over this point across 6-9 months — each pass bringing a different layer of growth.',
  saturn: 'Saturn moves about 0.03° per day (2 arcminutes). This transit is active for about 3-4 months per pass. With retrograde, Saturn typically makes 3 passes over 9-12 months. Each pass tests and strengthens different aspects of the theme.',
  uranus: 'Uranus moves about 0.01° per day. This transit is active for about 6-8 months per pass. With retrograde, Uranus makes 3 passes over 1-2 YEARS. This is a slow, fundamental reshaping of the affected life area.',
  neptune: 'Neptune moves about 0.006° per day. This transit is active for about 8-12 months per pass. With retrograde, Neptune makes 3 passes over 2-3 YEARS. This is one of the longest transits — a gradual dissolution and spiritual transformation.',
  pluto: 'Pluto moves about 0.004° per day. This transit is active for 1-2 YEARS per pass. With retrograde, Pluto can make 3-5 passes over 2-4 YEARS at the same degree. This is the deepest, slowest, most transformative transit in astrology.',
  chiron: 'Chiron moves about 0.02° per day. This transit is active for about 4-6 months per pass. With retrograde, Chiron makes 3 passes over 9-14 months. Each pass opens a deeper layer of the healing process.',
};

const getFeeling = (transitPlanet: string, natalPlanet: string, aspect: string, natalHouse: number | null): FeelingData => {
  // First check hardcoded specific combos
  const key = `${transitPlanet.toLowerCase()}-${aspect}-${natalPlanet.toLowerCase()}`;
  const specificFeelings: Record<string, FeelingData> = {
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
      title: 'Saturn Square — Life Structure Test',
      feeling: 'Your life structures are being tested. What you built is being challenged. This is the mid-point of your Saturn cycle — a crisis of maturity.',
      body: 'Physically: possible fatigue, feeling of weight or burden, needing more rest.',
      emotional: 'Emotionally: serious, possibly depressed, questioning your life direction. Heavy responsibilities.',
      where: natalHouse ? `The pressure is on your ${HOUSE_MEANINGS[natalHouse].short.toLowerCase()} themes.` : 'Look at what structures need to change.',
      duration: 'Saturn transits last MONTHS. The exact hit is just the peak — you feel this for weeks before and after.',
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

  if (specificFeelings[key]) {
    return specificFeelings[key];
  }

  // Build rich, real astrological content dynamically
  const tPlanet = TRANSIT_PLANET_FEELING[transitPlanet.toLowerCase()];
  const nTarget = NATAL_TARGET_FEELING[natalPlanet.toLowerCase()];
  const aspectQ = ASPECT_FEELING_QUALITY[aspect];
  const durationData = TRANSIT_DURATIONS[transitPlanet.toLowerCase()];
  
  const transitInfo = PLANET_ESSENCES[transitPlanet.toLowerCase()] || { name: transitPlanet, essence: '' };
  const natalInfo = PLANET_ESSENCES[natalPlanet.toLowerCase()] || { name: natalPlanet, essence: '' };

  // Build title
  const title = aspectQ 
    ? `${transitInfo.name} ${aspectQ.title_verb} ${natalInfo.name}`
    : `${transitInfo.name} Aspects ${natalInfo.name}`;

  // Build feeling — what is actually happening
  const feelingParts: string[] = [];
  if (tPlanet) {
    feelingParts.push(`${transitInfo.name} ${tPlanet.verb} ${nTarget ? nTarget.area : `your natal ${natalInfo.name}`}.`);
    feelingParts.push(tPlanet.psyche);
  }
  if (nTarget) {
    feelingParts.push(nTarget.when_activated);
  }
  const feeling = feelingParts.join(' ') || `${transitInfo.name} is actively engaging your natal ${natalInfo.name}, reshaping how you experience ${natalInfo.essence.toLowerCase()}`;

  // Build body sensation
  const bodyParts: string[] = [];
  if (tPlanet) bodyParts.push(tPlanet.somatic);
  if (aspectQ) bodyParts.push(aspectQ.body_mod);
  const body = bodyParts.join(' ') || `Your body registers this transit through the lens of ${transitInfo.name} energy — pay attention to where tension or activation shows up physically.`;

  // Build emotional content
  const emotionalParts: string[] = [];
  if (aspectQ) emotionalParts.push(aspectQ.emotional_mod);
  if (tPlanet) emotionalParts.push(tPlanet.esoteric);
  const emotional = emotionalParts.join(' ') || `This transit activates the emotional dimension of your ${natalInfo.name} — notice what feelings arise without judging them.`;

  // Build "where" — house-specific
  let where = '';
  if (nTarget && natalHouse) {
    where = nTarget.house_flavor(natalHouse);
  } else if (natalHouse) {
    where = `This transit activates your ${HOUSE_MEANINGS[natalHouse].full}. Themes of ${HOUSE_MEANINGS[natalHouse].keywords} are front and center — this is the specific life department where you will feel these changes most concretely.`;
  } else {
    where = nTarget ? `This transit touches ${nTarget.area}. Look for which area of your daily life is most activated by these themes.` : 'Notice which life area is most affected by these changes.';
  }

  // Build duration — real data
  const duration = durationData || `Check the orbital speed of ${transitInfo.name} for precise timing of this transit.`;

  return { title, feeling, body, emotional, where, duration };
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
                1st Pass — "The Introduction" (Direct Motion) →
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
                  2nd Pass — "The Deep Processing" (Retrograde) ←
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
                  3rd Pass — "The Integration" (Direct Motion) → Final
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
            
            {/* Kent's Retrograde Guidance */}
            {(() => {
              const planetKey = transitPlanet.charAt(0).toUpperCase() + transitPlanet.slice(1).toLowerCase();
              const guidance = RETROGRADE_GUIDANCE[planetKey];
              if (!guidance) return null;
              return (
                <div style={{
                  marginTop: '12px',
                  padding: '14px',
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: '6px',
                  border: '1px solid rgba(156,39,176,0.2)',
                }}>
                  <div style={{ fontWeight: '600', fontSize: '13px', marginBottom: '8px', color: '#4A148C' }}>
                    📖 {transitPlanet} Retrograde Guidance
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#2E7D32', marginBottom: '6px' }}>✓ DO THIS</div>
                      {guidance.doThis.map((item, i) => (
                        <div key={i} style={{ fontSize: '12px', marginBottom: '3px', color: '#333' }}>• {item}</div>
                      ))}
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: '#C62828', marginBottom: '6px' }}>✗ AVOID THIS</div>
                      {guidance.avoidThis.map((item, i) => (
                        <div key={i} style={{ fontSize: '12px', marginBottom: '3px', color: '#333' }}>• {item}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: '10px', color: '#9E9E9E', marginTop: '8px', fontStyle: 'italic' }}>
                    Source: {KENT_SOURCE}
                  </div>
                </div>
              );
            })()}
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

// Retrograde information for outer planets with actual station dates
const RETROGRADE_INFO: Record<string, { duration: string; frequency: string; passCount: number; description: string }> = {
  pluto: {
    duration: '5-6 months',
    frequency: 'once per year',
    passCount: 3,
    description: 'Pluto — the planet of deep transformation — appears to move backward for about 5-6 months every year. This is completely normal (all outer planets do this). Because it moves so slowly, it often crosses the same sensitive point in your chart 3 times over 1-2 years, giving you 3 chances to work through the transformation: first you notice the shift, then you process it deeply during the retrograde, and finally you integrate the change and move forward.'
  },
  neptune: {
    duration: '5+ months',
    frequency: 'once per year',
    passCount: 3,
    description: 'Neptune — the planet of intuition, dreams, and spirituality — reverses direction for about 5-6 months each year. Its 3 passes over a chart point allow spiritual and creative themes to gradually emerge, dissolve old illusions, and re-form with greater clarity. This is a gentle, slow unfolding — not a sudden event.'
  },
  uranus: {
    duration: '5 months',
    frequency: 'once per year',
    passCount: 3,
    description: 'Uranus — the planet of sudden change and awakening — retrogrades for about 5 months every year. Its 3 passes work like this: the first pass brings an unexpected shift or realization, the retrograde pass asks you to sit with the disruption and understand it more deeply, and the final pass helps you fully embrace the change and move forward in a more authentic way.'
  },
  saturn: {
    duration: '4.5 months',
    frequency: 'once per year',
    passCount: 3,
    description: 'Saturn — the planet of responsibility and maturity — retrogrades for about 4.5 months each year. The 3 passes help you build something lasting: first you confront a challenge or limitation, then during the retrograde you restructure internally, and finally you build something more solid and enduring.'
  },
  jupiter: {
    duration: '4 months',
    frequency: 'once per year',
    passCount: 3,
    description: 'Jupiter — the planet of growth and opportunity — retrogrades for about 4 months each year. The 3 passes allow an opportunity or growth experience to appear, then be reassessed to make sure it truly aligns with your path, and finally be fully embraced and expanded upon.'
  }
};

// Dynamic station dates computed from astronomy-engine ephemeris

const getComputedStationDates = (planetName: string, referenceDate: Date): Array<{ year: number; retrograde: { date: string; degree: string }; direct: { date: string; degree: string } }> => {
  const bodyMap: Record<string, Astronomy.Body> = {
    pluto: Astronomy.Body.Pluto,
    neptune: Astronomy.Body.Neptune,
    uranus: Astronomy.Body.Uranus,
    saturn: Astronomy.Body.Saturn,
    jupiter: Astronomy.Body.Jupiter,
  };
  const body = bodyMap[planetName.toLowerCase()];
  if (!body) return [];
  
  const stations = getStationDates(body, referenceDate);
  return stations.map(s => ({
    year: s.year,
    retrograde: { date: formatRetrogradeDate(s.retrograde.date), degree: `${s.retrograde.degree}` },
    direct: { date: formatRetrogradeDate(s.direct.date), degree: `${s.direct.degree}` },
  }));
};

// Get the transit sign for a given aspect (where the transit planet IS, not the natal point)
const getTransitSignForAspect = (natalSign: string, aspectAngle: number): string => {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const natalSignIndex = signs.indexOf(natalSign);
  const signOffset = Math.round(aspectAngle / 30);
  const transitSignIndex = (natalSignIndex + signOffset) % 12;
  return signs[transitSignIndex];
};

// Calculate multiple passes for slow-moving planets
const calculateRetrogradePasses = (
  transitPlanet: string,
  transitDegree: number,
  natalDegree: number,
  natalSign: string,
  currentDate: Date,
  aspectAngle: number
): Array<{ date: Date; passNumber: number; direction: 'direct' | 'retrograde'; status: 'passed' | 'current' | 'upcoming' }> => {
  const passes: Array<{ date: Date; passNumber: number; direction: 'direct' | 'retrograde'; status: 'passed' | 'current' | 'upcoming' }> = [];
  const speed = PLANET_SPEEDS[transitPlanet.toLowerCase()] || 1;
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  // Target degree for the aspect
  const natalLongitude = signs.indexOf(natalSign) * 30 + natalDegree;
  const targetTransitLongitude = (natalLongitude + aspectAngle) % 360;
  const transitLongitude = signs.indexOf(signs[Math.floor(transitDegree / 30) % 12]) * 30 + (transitDegree % 30);
  
  // For slow planets (Pluto, Neptune, Uranus, Saturn, Jupiter), calculate 3 passes
  const outerPlanets = ['pluto', 'neptune', 'uranus', 'saturn', 'jupiter'];
  const isOuterPlanet = outerPlanets.includes(transitPlanet.toLowerCase());
  
  if (!isOuterPlanet) {
    // For faster planets, just one pass
    const degreesToTarget = targetTransitLongitude - transitDegree;
    const daysToExact = degreesToTarget / speed;
    const exactDate = new Date(currentDate);
    exactDate.setDate(exactDate.getDate() + Math.floor(daysToExact));
    
    passes.push({
      date: exactDate,
      passNumber: 1,
      direction: 'direct',
      status: exactDate < currentDate ? 'passed' : 
              Math.abs(exactDate.getTime() - currentDate.getTime()) < 30 * 24 * 60 * 60 * 1000 ? 'current' : 'upcoming'
    });
    return passes;
  }
  
  // For outer planets - calculate approximate 3 passes over ~18 months for Pluto
  // Retrograde cycle lengths (in days between station retrograde and station direct)
  const retrogradeCycles: Record<string, { stationOffset: number; cycleLength: number }> = {
    pluto: { stationOffset: 90, cycleLength: 170 }, // Stations ~90 days before crossing, ~170 day retrograde
    neptune: { stationOffset: 80, cycleLength: 160 },
    uranus: { stationOffset: 75, cycleLength: 155 },
    saturn: { stationOffset: 60, cycleLength: 140 },
    jupiter: { stationOffset: 50, cycleLength: 120 }
  };
  
  const cycle = retrogradeCycles[transitPlanet.toLowerCase()] || { stationOffset: 60, cycleLength: 120 };
  
  // First pass (direct motion approaching) - Look backward and forward
  // Estimate when the first pass happened/will happen
  let degreesToTarget = natalDegree - transitDegree;
  if (degreesToTarget < -180) degreesToTarget += 360;
  if (degreesToTarget > 180) degreesToTarget -= 360;
  
  const daysToFirst = degreesToTarget / speed;
  const firstPassDate = new Date(currentDate);
  firstPassDate.setDate(firstPassDate.getDate() + Math.floor(daysToFirst));
  
  // Second pass (retrograde) - typically 2-4 months after first
  const secondPassDate = new Date(firstPassDate);
  secondPassDate.setDate(secondPassDate.getDate() + Math.floor(cycle.stationOffset + cycle.cycleLength * 0.4));
  
  // Third pass (direct again) - typically 2-4 months after second
  const thirdPassDate = new Date(secondPassDate);
  thirdPassDate.setDate(thirdPassDate.getDate() + Math.floor(cycle.cycleLength * 0.6));
  
  // Also calculate previous cycle (for looking back)
  const orbitalDays = ORBITAL_PERIODS[transitPlanet.toLowerCase()] || 90560;
  const prevFirstPass = new Date(firstPassDate);
  prevFirstPass.setDate(prevFirstPass.getDate() - Math.floor(orbitalDays));
  const prevSecondPass = new Date(prevFirstPass);
  prevSecondPass.setDate(prevSecondPass.getDate() + Math.floor(cycle.stationOffset + cycle.cycleLength * 0.4));
  const prevThirdPass = new Date(prevSecondPass);
  prevThirdPass.setDate(prevThirdPass.getDate() + Math.floor(cycle.cycleLength * 0.6));
  
  // Add passes (include previous cycle if recent, within 3 years)
  const threeYearsAgo = new Date(currentDate);
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
  
  const allDates = [
    { date: prevFirstPass, pass: 1, dir: 'direct' as const },
    { date: prevSecondPass, pass: 2, dir: 'retrograde' as const },
    { date: prevThirdPass, pass: 3, dir: 'direct' as const },
    { date: firstPassDate, pass: 1, dir: 'direct' as const },
    { date: secondPassDate, pass: 2, dir: 'retrograde' as const },
    { date: thirdPassDate, pass: 3, dir: 'direct' as const },
  ].filter(d => d.date > threeYearsAgo);
  
  // Sort by date
  allDates.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Determine status
  allDates.forEach(d => {
    const daysDiff = Math.abs(d.date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
    passes.push({
      date: d.date,
      passNumber: d.pass,
      direction: d.dir,
      status: d.date < currentDate ? 'passed' : daysDiff < 60 ? 'current' : 'upcoming'
    });
  });
  
  return passes;
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
  
  // Check if this is an outer planet
  const outerPlanets = ['pluto', 'neptune', 'uranus', 'saturn', 'jupiter'];
  const isOuterPlanet = outerPlanets.includes(transitPlanet.toLowerCase());
  const retroInfo = RETROGRADE_INFO[transitPlanet.toLowerCase()];
  
  // Find all natal planets being aspected by this transit (within tight orb for Pluto)
  const aspectOrb = transitPlanet.toLowerCase() === 'pluto' ? 2 : 
                    ['neptune', 'uranus'].includes(transitPlanet.toLowerCase()) ? 3 : 5;
  
  const allAspects: Array<{
    natalPlanet: string;
    natalDegree: number;
    natalSign: string;
    aspectType: string;
    aspectSymbol: string;
    orb: number;
    isExact: boolean;
    passes: Array<{ date: Date; passNumber: number; direction: 'direct' | 'retrograde'; status: 'passed' | 'current' | 'upcoming' }>;
  }> = [];
  
  Object.entries(natalChart.planets).forEach(([planetName, position]) => {
    if (!position?.sign || !position?.degree) return;
    
    const natalLongitude = signs.indexOf(position.sign) * 30 + position.degree;
    
    Object.entries(aspectAngles).forEach(([aspectName, aspectData]) => {
      let diff = Math.abs(transitLongitude - natalLongitude);
      if (diff > 180) diff = 360 - diff;
      
      // Adjust for the aspect angle
      const angleDiff = Math.abs(diff - aspectData.angle);
      
      // Use tighter orb for outer planets
      const effectiveOrb = isOuterPlanet ? Math.min(aspectOrb, aspectData.orb) : aspectData.orb;
      
      if (angleDiff <= effectiveOrb) {
        // Calculate multiple passes for outer planets
        const passes = calculateRetrogradePasses(
          transitPlanet,
          transitDegree,
          position.degree,
          position.sign,
          currentDate,
          aspectData.angle
        );
        
        allAspects.push({
          natalPlanet: planetName,
          natalDegree: position.degree,
          natalSign: position.sign,
          aspectType: aspectName,
          aspectSymbol: aspectData.symbol,
          orb: angleDiff,
          isExact: angleDiff < 1,
          passes,
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
        {getSymbol(transitPlanet)} at {transitDegree}° {transitSign} is currently making aspects to {allAspects.length} of your natal points
        {isOuterPlanet && ` (showing all passes within ±${aspectOrb}° orb)`}:
      </div>
      
      {/* Retrograde Education Section for Outer Planets */}
      {isOuterPlanet && retroInfo && (
        <div style={{
          marginBottom: '20px',
          padding: '16px',
          background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
          borderRadius: '8px',
          border: '1px solid #42A5F5'
        }}>
          <h5 style={{ fontSize: '14px', fontWeight: '700', color: '#1565C0', marginBottom: '10px' }}>
            📚 Understanding {transitPlanet} Retrograde Cycles
          </h5>
          <p style={{ fontSize: '12px', color: '#1976D2', lineHeight: '1.6', marginBottom: '12px' }}>
            {retroInfo.description}
          </p>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '10px',
            fontSize: '11px'
          }}>
            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px', borderRadius: '4px' }}>
              <strong style={{ color: '#1565C0' }}>Retrograde Duration:</strong>
              <div style={{ color: '#424242' }}>{retroInfo.duration}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px', borderRadius: '4px' }}>
              <strong style={{ color: '#1565C0' }}>Frequency:</strong>
              <div style={{ color: '#424242' }}>{retroInfo.frequency}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.7)', padding: '8px', borderRadius: '4px' }}>
              <strong style={{ color: '#1565C0' }}>Passes per Transit:</strong>
              <div style={{ color: '#424242' }}>{retroInfo.passCount} times over 1-2 years</div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {allAspects.map((asp, idx) => {
          const hasMultiplePasses = asp.passes.length > 1;
          const passedPasses = asp.passes.filter(p => p.status === 'passed');
          const upcomingPasses = asp.passes.filter(p => p.status === 'upcoming' || p.status === 'current');
          
          return (
            <div key={idx} style={{
              padding: '16px',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '8px',
              borderLeft: `4px solid ${asp.isExact ? '#F44336' : '#90A4AE'}`,
            }}>
              {/* Aspect Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {getSymbol(transitPlanet)}{asp.aspectSymbol}{getSymbol(asp.natalPlanet)}
                  </span>
                  <div>
                    <div style={{ fontWeight: '600', color: '#424242', fontSize: '14px' }}>
                      {asp.aspectType.charAt(0).toUpperCase() + asp.aspectType.slice(1)} to {PLANET_ESSENCES[asp.natalPlanet.toLowerCase()]?.name || asp.natalPlanet}
                    </div>
                    <div style={{ fontSize: '12px', color: '#757575' }}>
                      Your {PLANET_ESSENCES[asp.natalPlanet.toLowerCase()]?.name || asp.natalPlanet} at {asp.natalDegree}° {asp.natalSign} • Orb: {asp.orb.toFixed(1)}°
                    </div>
                  </div>
                </div>
                {asp.isExact && (
                  <span style={{
                    background: '#F44336',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '700'
                  }}>
                    EXACT NOW
                  </span>
                )}
              </div>
              
              {/* Practical Meaning - Plain English */}
              <div style={{
                padding: '12px',
                background: 'linear-gradient(135deg, rgba(255,248,225,0.8) 0%, rgba(255,243,224,0.8) 100%)',
                borderRadius: '6px',
                borderLeft: '3px solid #FF8F00',
                marginBottom: '12px',
                fontSize: '13px',
                lineHeight: '1.7',
                color: '#4E342E'
              }}>
                <strong style={{ color: '#E65100' }}>💡 What this actually means for you:</strong>
                <p style={{ margin: '6px 0 0 0' }}>
                  {generatePracticalMeaning(transitPlanet, asp.natalPlanet, asp.aspectType)}
                </p>
              </div>
              
              {/* Multiple Passes Timeline */}
              {hasMultiplePasses && (() => {
                // Calculate the transit sign based on the aspect angle
                const transitSignForAspect = getTransitSignForAspect(asp.natalSign, 
                  asp.aspectType === 'conjunction' ? 0 :
                  asp.aspectType === 'opposition' ? 180 :
                  asp.aspectType === 'trine' ? 120 :
                  asp.aspectType === 'square' ? 90 : 60
                );
                
                // Get station dates for this planet
                const planetStations = getComputedStationDates(transitPlanet, new Date());
                const relevantStations = planetStations.filter(s => s.year >= 2025 && s.year <= 2027);
                
                return (
                <div style={{ 
                  background: '#FAFAFA', 
                  borderRadius: '6px', 
                  padding: '12px',
                  marginTop: '8px'
                }}>
                  {/* Explanation of what the dates mean - Plain English */}
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#5D4037', 
                    marginBottom: '12px',
                    padding: '12px',
                    background: 'rgba(255,243,224,0.8)',
                    borderRadius: '4px',
                    lineHeight: '1.6'
                  }}>
                    <strong>🔄 Why you see 3 dates for this transit:</strong>
                    <p style={{ margin: '8px 0 4px 0' }}>
                      Unlike Mercury (which retrogrades 3-4 times a year for ~3 weeks), the outer planets like {transitPlanet} retrograde just <strong>once a year for about 5 months</strong>. This is completely normal — all planets appear to move backward from Earth's perspective at some point. It's not "bad," it's just part of the cycle.
                    </p>
                    <p style={{ margin: '4px 0 8px 0' }}>
                      Because {transitPlanet} moves so slowly and reverses direction once a year, it crosses this sensitive point in your chart <strong>3 separate times</strong> — like a highlighter going over the same sentence 3 times:
                    </p>
                    <ol style={{ margin: '8px 0 0 16px', padding: 0 }}>
                      <li style={{ marginBottom: '6px' }}>
                        <strong>1st pass — "The Introduction"</strong>: {transitPlanet} crosses this point for the first time moving forward. You start to notice the themes — something shifts, a new awareness begins.
                      </li>
                      <li style={{ marginBottom: '6px' }}>
                        <strong>2nd pass — "The Deep Processing"</strong>: {transitPlanet} has reversed direction and crosses this point again moving backward. This is often the most intense — you're revisiting and processing what came up the first time. Think of it as going deeper.
                      </li>
                      <li style={{ marginBottom: '6px' }}>
                        <strong>3rd pass — "The Integration"</strong>: {transitPlanet} moves forward again and crosses this point one final time. Now you've learned the lesson. You integrate and move on with new understanding.
                      </li>
                    </ol>
                  </div>
                  
                  {/* Station Dates */}
                  {relevantStations.length > 0 && (
                    <div style={{ 
                      marginBottom: '12px',
                      padding: '10px',
                      background: 'linear-gradient(135deg, rgba(156,39,176,0.1) 0%, rgba(33,150,243,0.1) 100%)',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}>
                      <strong style={{ color: '#424242' }}>📆 {transitPlanet} Station Dates:</strong>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '8px' }}>
                        {relevantStations.map((station, sIdx) => (
                          <div key={sIdx} style={{ 
                            background: 'rgba(255,255,255,0.8)', 
                            padding: '8px', 
                            borderRadius: '4px',
                            borderLeft: '3px solid #9C27B0'
                          }}>
                            <div style={{ fontWeight: '600', color: '#424242', marginBottom: '4px' }}>{station.year}</div>
                            <div style={{ color: '#7B1FA2' }}>
                              ℞ Retrograde: <strong>{station.retrograde.date}</strong>
                              <span style={{ color: '#757575' }}> at {station.retrograde.degree}</span>
                            </div>
                            <div style={{ color: '#1976D2' }}>
                              → Direct: <strong>{station.direct.date}</strong>
                              <span style={{ color: '#757575' }}> at {station.direct.degree}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#616161', marginBottom: '10px' }}>
                    📅 EXACT {asp.aspectType.toUpperCase()} DATES — {getSymbol(transitPlanet)} at {asp.natalDegree}° {transitSignForAspect} {asp.aspectSymbol} your {getSymbol(asp.natalPlanet)} at {asp.natalDegree}° {asp.natalSign}:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {asp.passes.map((pass, pIdx) => (
                      <div key={pIdx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        background: pass.status === 'current' ? 'rgba(255,235,59,0.3)' : 
                                   pass.status === 'passed' ? 'rgba(158,158,158,0.1)' : 'rgba(76,175,80,0.1)',
                        borderRadius: '4px',
                        borderLeft: `3px solid ${
                          pass.status === 'current' ? '#FFC107' : 
                          pass.status === 'passed' ? '#9E9E9E' : '#4CAF50'
                        }`
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ 
                            fontSize: '10px', 
                            fontWeight: '700',
                            color: pass.direction === 'retrograde' ? '#7B1FA2' : '#1976D2',
                            background: pass.direction === 'retrograde' ? 'rgba(123,31,162,0.1)' : 'rgba(25,118,210,0.1)',
                            padding: '2px 6px',
                            borderRadius: '3px'
                          }}>
                            {pass.passNumber === 1 ? '1st' : pass.passNumber === 2 ? '2nd' : '3rd'} 
                            {pass.direction === 'retrograde' ? ' ℞' : ' →'}
                          </span>
                          <span style={{ fontSize: '12px', color: '#424242', fontWeight: '500' }}>
                            {pass.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span style={{ fontSize: '10px', color: '#757575' }}>
                            ({getSymbol(transitPlanet)} at {asp.natalDegree}° {transitSignForAspect})
                          </span>
                        </div>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          color: pass.status === 'current' ? '#F57F17' : 
                                 pass.status === 'passed' ? '#78909C' : '#2E7D32'
                        }}>
                          {pass.status === 'current' ? '⭐ ACTIVE' : 
                           pass.status === 'passed' ? '✓ PASSED' : 'UPCOMING'}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Summary */}
                  <div style={{ 
                    marginTop: '10px', 
                    fontSize: '11px', 
                    color: '#616161',
                    fontStyle: 'italic'
                  }}>
                    {passedPasses.length > 0 && upcomingPasses.length > 0 && (
                      <>
                        {passedPasses.length} pass{passedPasses.length > 1 ? 'es' : ''} completed, {upcomingPasses.length} remaining
                      </>
                    )}
                    {passedPasses.length > 0 && upcomingPasses.length === 0 && (
                      <>All {passedPasses.length} passes completed - transit finishing</>
                    )}
                    {passedPasses.length === 0 && upcomingPasses.length > 0 && (
                      <>Transit beginning - {upcomingPasses.length} passes ahead</>
                    )}
                  </div>
                </div>
                );
              })()}
              
              {/* Single pass for faster planets */}
              {!hasMultiplePasses && asp.passes[0] && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#757575',
                  marginTop: '8px'
                }}>
                  Exact: {asp.passes[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' • '}
                  <span style={{
                    color: asp.passes[0].status === 'current' ? '#F57F17' : 
                           asp.passes[0].status === 'passed' ? '#78909C' : '#2E7D32',
                    fontWeight: '600'
                  }}>
                    {asp.passes[0].status === 'current' ? 'ACTIVE NOW' : 
                     asp.passes[0].status === 'passed' ? 'PASSED' : 'UPCOMING'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div style={{ 
        marginTop: '16px', 
        padding: '12px', 
        background: 'rgba(255,255,255,0.8)', 
        borderRadius: '6px',
        fontSize: '12px',
        color: '#5D4037',
        lineHeight: '1.5'
      }}>
        💡 <strong>The Big Picture:</strong> {isOuterPlanet ? (
          <>
            {transitPlanet} is a slow-moving planet — it takes years to travel through each sign. Because it reverses direction once a year (just like all outer planets do), 
            it touches the same point in your chart 3 times. Think of it like life giving you 3 chances to learn the same lesson: 
            first you <strong>notice it</strong>, then you <strong>sit with it deeply</strong>, and finally you <strong>integrate and move forward</strong>. 
            This whole process typically unfolds over 1-2 years.
          </>
        ) : (
          <>Watch for themes connecting these life areas as {transitPlanet} aspects multiple natal points.</>
        )}
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
