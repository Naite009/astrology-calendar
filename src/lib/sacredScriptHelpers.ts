// Sacred Script Helper Functions
// Calculations and data for professional astrology reading framework

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ELEMENTS: Record<string, string[]> = {
  Fire: ['Aries', 'Leo', 'Sagittarius'],
  Earth: ['Taurus', 'Virgo', 'Capricorn'],
  Air: ['Gemini', 'Libra', 'Aquarius'],
  Water: ['Cancer', 'Scorpio', 'Pisces'],
};

const MODALITIES: Record<string, string[]> = {
  Cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
  Fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
  Mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
};

// Saturn cycle data
export interface SaturnCycle {
  age: number;
  year: number;
  aspectType: 'Square' | 'Opposition' | 'Return';
  description: string;
  question: string;
  isPast: boolean;
  isUpcoming: boolean; // within 3 years
}

// Calculate Saturn cycles for a birth year
export const calculateSaturnCycles = (birthDate: string, currentDate: Date): SaturnCycle[] => {
  const [birthYear] = birthDate.split('-').map(Number);
  const currentAge = Math.floor((currentDate.getTime() - new Date(birthYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  
  const cycles = [
    { age: 7, aspectType: 'Square' as const, description: 'First waxing square - Early authority experiences' },
    { age: 14, aspectType: 'Opposition' as const, description: 'First opposition - Teenage rebellion, identity vs. structure' },
    { age: 21, aspectType: 'Square' as const, description: 'Third waning square - Adulthood entry, taking responsibility' },
    { age: 29, aspectType: 'Return' as const, description: 'Saturn Return - Major life restructuring, becoming yourself' },
    { age: 36, aspectType: 'Square' as const, description: 'Fourth waxing square - Career challenges, mid-30s crisis' },
    { age: 43, aspectType: 'Opposition' as const, description: 'Second opposition - Midlife review, rebalancing' },
    { age: 50, aspectType: 'Square' as const, description: 'Fifth waning square - Legacy questions begin' },
    { age: 59, aspectType: 'Return' as const, description: 'Second Saturn Return - Wisdom elder, life review' },
  ];
  
  return cycles.map(cycle => ({
    ...cycle,
    year: birthYear + cycle.age,
    question: `Tell me what happened around age ${cycle.age}? (year ${birthYear + cycle.age})`,
    isPast: currentAge >= cycle.age,
    isUpcoming: currentAge < cycle.age && currentAge >= cycle.age - 3,
  }));
};

// Get element for a sign
const getElement = (sign: string): string => {
  for (const [element, signs] of Object.entries(ELEMENTS)) {
    if (signs.includes(sign)) return element;
  }
  return 'Unknown';
};

// Get modality for a sign
const getModality = (sign: string): string => {
  for (const [modality, signs] of Object.entries(MODALITIES)) {
    if (signs.includes(sign)) return modality;
  }
  return 'Unknown';
};

// Calculate elemental balance
export interface ElementalBalance {
  Fire: number;
  Earth: number;
  Air: number;
  Water: number;
  planets: Record<string, string[]>;
  dominant: string;
  missing: string[];
  abundant: string[];
  pattern: 'Energized' | 'Grounded' | 'Balanced' | 'Intense' | 'Variable';
}

export const calculateElementalBalance = (chart: NatalChart): ElementalBalance => {
  const balance: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const planetsByElement: Record<string, string[]> = { Fire: [], Earth: [], Air: [], Water: [] };
  
  const relevantPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant'];
  
  for (const planetName of relevantPlanets) {
    const position = chart.planets[planetName as keyof typeof chart.planets];
    if (position?.sign) {
      const element = getElement(position.sign);
      if (balance[element] !== undefined) {
        balance[element]++;
        planetsByElement[element].push(planetName);
      }
    }
  }
  
  // Find dominant, missing, and abundant
  const entries = Object.entries(balance).sort(([, a], [, b]) => b - a);
  const dominant = entries[0][0];
  const missing = entries.filter(([, count]) => count <= 1).map(([element]) => element);
  const abundant = entries.filter(([, count]) => count >= 4).map(([element]) => element);
  
  // Determine pattern
  const fireAir = balance.Fire + balance.Air;
  const earthWater = balance.Earth + balance.Water;
  let pattern: ElementalBalance['pattern'] = 'Balanced';
  
  if (fireAir >= 7) pattern = 'Energized';
  else if (earthWater >= 7) pattern = 'Grounded';
  else if (balance.Water >= 4 && balance.Fire >= 3) pattern = 'Intense';
  else if (Math.max(...Object.values(balance)) - Math.min(...Object.values(balance)) >= 4) pattern = 'Variable';
  
  return {
    Fire: balance.Fire,
    Earth: balance.Earth,
    Air: balance.Air,
    Water: balance.Water,
    planets: planetsByElement,
    dominant,
    missing,
    abundant,
    pattern,
  };
};

// Get house number for a planet (based on house cusps)
export const getPlanetHouse = (chart: NatalChart, planetName: string): number | null => {
  if (!chart.houseCusps) return null;
  
  const position = chart.planets[planetName as keyof typeof chart.planets];
  if (!position?.sign) return null;
  
  const planetLongitude = ZODIAC_SIGNS.indexOf(position.sign) * 30 + position.degree + position.minutes / 60;
  
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
};

// Character card data
export interface CharacterCard {
  planet: 'Sun' | 'Moon' | 'Rising';
  sign: string;
  degree: number;
  house: number | null;
  element: string;
  modality: string;
  description: string;
  keywords: string[];
}

export const getCharacterCards = (chart: NatalChart): CharacterCard[] => {
  const cards: CharacterCard[] = [];
  
  const sunPos = chart.planets.Sun;
  if (sunPos?.sign) {
    cards.push({
      planet: 'Sun',
      sign: sunPos.sign,
      degree: sunPos.degree,
      house: getPlanetHouse(chart, 'Sun'),
      element: getElement(sunPos.sign),
      modality: getModality(sunPos.sign),
      description: `Your core self, identity, and life purpose expressed through ${sunPos.sign}`,
      keywords: getSunKeywords(sunPos.sign),
    });
  }
  
  const moonPos = chart.planets.Moon;
  if (moonPos?.sign) {
    cards.push({
      planet: 'Moon',
      sign: moonPos.sign,
      degree: moonPos.degree,
      house: getPlanetHouse(chart, 'Moon'),
      element: getElement(moonPos.sign),
      modality: getModality(moonPos.sign),
      description: `Your emotional nature and needs expressed through ${moonPos.sign}`,
      keywords: getMoonKeywords(moonPos.sign),
    });
  }
  
  // Prefer house1 cusp for Rising sign (more reliable than Ascendant planet entry)
  // Fall back to Ascendant planet if house cusps not available
  const house1Cusp = chart.houseCusps?.house1;
  const ascPos = chart.planets.Ascendant;
  
  const risingSign = house1Cusp?.sign || ascPos?.sign;
  const risingDegree = house1Cusp?.degree ?? ascPos?.degree ?? 0;
  const risingMinutes = house1Cusp?.minutes ?? ascPos?.minutes ?? 0;
  
  if (risingSign) {
    cards.push({
      planet: 'Rising',
      sign: risingSign,
      degree: risingDegree,
      house: 1,
      element: getElement(risingSign),
      modality: getModality(risingSign),
      description: `Your outer presentation and first impression expressed through ${risingSign}`,
      keywords: getRisingKeywords(risingSign),
    });
  }
  
  return cards;
};

// Sign keywords
const getSunKeywords = (sign: string): string[] => {
  const keywords: Record<string, string[]> = {
    Aries: ['pioneer', 'initiator', 'warrior', 'independent'],
    Taurus: ['builder', 'steady', 'sensual', 'determined'],
    Gemini: ['communicator', 'curious', 'versatile', 'witty'],
    Cancer: ['nurturer', 'protective', 'intuitive', 'sentimental'],
    Leo: ['leader', 'creative', 'generous', 'dramatic'],
    Virgo: ['analyst', 'helper', 'practical', 'discerning'],
    Libra: ['diplomat', 'harmonizer', 'aesthetic', 'partnership'],
    Scorpio: ['transformer', 'intense', 'investigator', 'powerful'],
    Sagittarius: ['explorer', 'philosopher', 'optimistic', 'adventurer'],
    Capricorn: ['achiever', 'disciplined', 'responsible', 'ambitious'],
    Aquarius: ['innovator', 'humanitarian', 'independent', 'visionary'],
    Pisces: ['dreamer', 'compassionate', 'intuitive', 'artistic'],
  };
  return keywords[sign] || ['unique', 'individual'];
};

const getMoonKeywords = (sign: string): string[] => {
  const keywords: Record<string, string[]> = {
    Aries: ['needs action', 'emotionally direct', 'quick to react'],
    Taurus: ['needs security', 'emotionally stable', 'comfort-seeking'],
    Gemini: ['needs stimulation', 'emotionally curious', 'talks feelings'],
    Cancer: ['needs nurturing', 'emotionally deep', 'protective'],
    Leo: ['needs recognition', 'emotionally warm', 'heart-centered'],
    Virgo: ['needs usefulness', 'emotionally practical', 'service-oriented'],
    Libra: ['needs harmony', 'emotionally balanced', 'relationship-focused'],
    Scorpio: ['needs intensity', 'emotionally deep', 'transformative'],
    Sagittarius: ['needs freedom', 'emotionally optimistic', 'expansive'],
    Capricorn: ['needs structure', 'emotionally controlled', 'responsible'],
    Aquarius: ['needs space', 'emotionally detached', 'unconventional'],
    Pisces: ['needs transcendence', 'emotionally sensitive', 'empathic'],
  };
  return keywords[sign] || ['unique emotional needs'];
};

const getRisingKeywords = (sign: string): string[] => {
  const keywords: Record<string, string[]> = {
    Aries: ['appears confident', 'direct approach', 'athletic presence'],
    Taurus: ['appears steady', 'calm presence', 'solid demeanor'],
    Gemini: ['appears curious', 'quick wit', 'youthful presence'],
    Cancer: ['appears nurturing', 'soft demeanor', 'protective aura'],
    Leo: ['appears regal', 'commanding presence', 'magnetic'],
    Virgo: ['appears modest', 'neat presentation', 'helpful demeanor'],
    Libra: ['appears charming', 'graceful presence', 'diplomatic'],
    Scorpio: ['appears intense', 'penetrating gaze', 'magnetic'],
    Sagittarius: ['appears jovial', 'open demeanor', 'adventurous aura'],
    Capricorn: ['appears serious', 'authoritative', 'composed'],
    Aquarius: ['appears unique', 'detached demeanor', 'unconventional'],
    Pisces: ['appears dreamy', 'gentle presence', 'ethereal quality'],
  };
  return keywords[sign] || ['unique presentation'];
};

// Life lesson data
export interface LifeLesson {
  saturn: {
    sign: string;
    house: number | null;
    directive: string;
    lesson: string;
  } | null;
  northNode: {
    sign: string;
    house: number | null;
    direction: string;
  } | null;
}

export const getLifeLesson = (chart: NatalChart): LifeLesson => {
  const saturnPos = chart.planets.Saturn;
  const northNodePos = chart.planets.NorthNode;
  
  let saturn: LifeLesson['saturn'] = null;
  if (saturnPos?.sign) {
    saturn = {
      sign: saturnPos.sign,
      house: getPlanetHouse(chart, 'Saturn'),
      directive: getSaturnDirective(saturnPos.sign),
      lesson: getSaturnLesson(saturnPos.sign),
    };
  }
  
  let northNode: LifeLesson['northNode'] = null;
  if (northNodePos?.sign) {
    northNode = {
      sign: northNodePos.sign,
      house: getPlanetHouse(chart, 'NorthNode'),
      direction: getNorthNodeDirection(northNodePos.sign),
    };
  }
  
  return { saturn, northNode };
};

const getSaturnDirective = (sign: string): string => {
  const directives: Record<string, string> = {
    Aries: 'Learn to act independently and trust your own initiative',
    Taurus: 'Build lasting security through patience and persistence',
    Gemini: 'Master communication and commit to learning',
    Cancer: 'Create emotional security and nurture responsibly',
    Leo: 'Develop authentic self-expression and creative authority',
    Virgo: 'Perfect your skills and serve with practical wisdom',
    Libra: 'Master relationships and create balanced partnerships',
    Scorpio: 'Transform through facing shadows and sharing resources',
    Sagittarius: 'Develop wisdom through experience and honest seeking',
    Capricorn: 'Achieve mastery through discipline and integrity',
    Aquarius: 'Innovate within structure and serve the collective',
    Pisces: 'Bring spiritual wisdom into practical form',
  };
  return directives[sign] || 'Master your unique lessons through experience';
};

const getSaturnLesson = (sign: string): string => {
  const lessons: Record<string, string> = {
    Aries: 'You are learning courage, self-reliance, and how to begin things on your own terms.',
    Taurus: 'You are learning stability, self-worth, and how to build something lasting.',
    Gemini: 'You are learning to focus your mind, communicate clearly, and complete what you start.',
    Cancer: 'You are learning to nurture without smothering and create true emotional safety.',
    Leo: 'You are learning authentic self-expression without seeking external validation.',
    Virgo: 'You are learning when good enough is perfect and how to serve without martyrdom.',
    Libra: 'You are learning balance in relationships and how to be fair to yourself and others.',
    Scorpio: 'You are learning to trust, transform, and share power appropriately.',
    Sagittarius: 'You are learning to commit to your truth and follow through on your ideals.',
    Capricorn: 'You are learning mastery through consistent effort and responsible leadership.',
    Aquarius: 'You are learning to be yourself within groups and innovate responsibly.',
    Pisces: 'You are learning healthy boundaries while maintaining compassion and spiritual connection.',
  };
  return lessons[sign] || 'Your Saturn placement reveals your unique life mastery path.';
};

const getNorthNodeDirection = (sign: string): string => {
  const directions: Record<string, string> = {
    Aries: 'Moving toward independence, courage, and self-assertion',
    Taurus: 'Moving toward stability, self-reliance, and simplicity',
    Gemini: 'Moving toward curiosity, communication, and versatility',
    Cancer: 'Moving toward emotional vulnerability and nurturing',
    Leo: 'Moving toward self-expression, creativity, and heart-centered living',
    Virgo: 'Moving toward practical service and attention to detail',
    Libra: 'Moving toward partnership, diplomacy, and balance',
    Scorpio: 'Moving toward depth, transformation, and shared resources',
    Sagittarius: 'Moving toward adventure, meaning, and expansion',
    Capricorn: 'Moving toward achievement, structure, and responsibility',
    Aquarius: 'Moving toward community, innovation, and humanitarian ideals',
    Pisces: 'Moving toward faith, compassion, and spiritual surrender',
  };
  return directions[sign] || 'Moving toward your soul\'s evolutionary path';
};

// Generate final directive
export const generateFinalDirective = (chart: NatalChart, elements: ElementalBalance): string => {
  const lifeLesson = getLifeLesson(chart);
  
  // Priority: Saturn directive, then missing element guidance
  if (lifeLesson.saturn) {
    return lifeLesson.saturn.directive;
  }
  
  if (elements.missing.length > 0) {
    const missingElement = elements.missing[0];
    const guidance: Record<string, string> = {
      Fire: 'Take action. Don\'t wait for permission. Your spark comes from doing.',
      Earth: 'Ground yourself. Build something tangible. Trust the physical world.',
      Air: 'Communicate more. Share your thoughts. Let ideas flow.',
      Water: 'Feel your feelings. Trust your intuition. Allow emotional connection.',
    };
    return guidance[missingElement] || 'Trust your unique path.';
  }
  
  return 'Trust yourself. You have everything you need within.';
};

// Element guidance for missing/abundant
export const getElementGuidance = (element: string, type: 'missing' | 'abundant'): string => {
  const guidance: Record<string, Record<string, string>> = {
    Fire: {
      missing: 'You may need to consciously cultivate initiative, spontaneity, and action. Don\'t overthink—sometimes you just need to do it.',
      abundant: 'You have natural enthusiasm and drive. Channel this energy constructively; avoid burnout through impulsive action.',
    },
    Earth: {
      missing: 'You may struggle with practical matters and follow-through. Create structure and routine. Don\'t forget the physical world.',
      abundant: 'You have natural practicality and persistence. Be careful not to become too rigid or materialistic.',
    },
    Air: {
      missing: 'You may need to consciously develop communication and intellectual analysis. Talk things through. Get perspective.',
      abundant: 'You have natural intellectual gifts. Don\'t live entirely in your head—remember to feel and to act.',
    },
    Water: {
      missing: 'You may struggle with emotional awareness and intuition. Practice feeling. Allow vulnerability and connection.',
      abundant: 'You have natural emotional depth and empathy. Set healthy boundaries. Don\'t drown in feeling.',
    },
  };
  return guidance[element]?.[type] || '';
};

// Calculate age from birth date
export const calculateAge = (birthDate: string): number => {
  const [year, month, day] = birthDate.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Format degree display
export const formatDegree = (position: NatalPlanetPosition): string => {
  return `${position.degree}°${position.minutes}'`;
};
