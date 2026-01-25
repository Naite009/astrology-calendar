/**
 * Relationship Potential Calculator
 * Calculates short-term vs long-term compatibility, marriage/business potential
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { KarmicAnalysis } from './karmicAnalysis';
import { CompositeInterpretation } from './compositeChart';

export interface RelationshipPotential {
  shortTerm: {
    score: number;
    description: string;
    factors: string[];
  };
  longTerm: {
    score: number;
    description: string;
    factors: string[];
  };
  marriagePotential: {
    score: number;
    considerations: string[];
    timing?: string;
  };
  businessPotential: {
    score: number;
    considerations: string[];
    bestAreas?: string[];
  };
  growthPotential: {
    individual: string;
    collective: string;
    evolutionaryPath: string;
  };
}

export interface PurposeAlignment {
  aligned: boolean;
  alignmentScore: number;
  sharedPurpose: string;
  individualGoals: {
    person1: string;
    person2: string;
  };
  conflictingGoals: string[];
  synergies: string[];
  missionStatement: string;
  coreValues: string[];
  jointVision: string;
}

// Zodiac signs for reference
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const FIRE_SIGNS = ['Aries', 'Leo', 'Sagittarius'];
const EARTH_SIGNS = ['Taurus', 'Virgo', 'Capricorn'];
const AIR_SIGNS = ['Gemini', 'Libra', 'Aquarius'];
const WATER_SIGNS = ['Cancer', 'Scorpio', 'Pisces'];

const CARDINAL_SIGNS = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
const FIXED_SIGNS = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
const MUTABLE_SIGNS = ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'];

function getElement(sign: string): string {
  if (FIRE_SIGNS.includes(sign)) return 'Fire';
  if (EARTH_SIGNS.includes(sign)) return 'Earth';
  if (AIR_SIGNS.includes(sign)) return 'Air';
  if (WATER_SIGNS.includes(sign)) return 'Water';
  return 'Unknown';
}

function getModality(sign: string): string {
  if (CARDINAL_SIGNS.includes(sign)) return 'Cardinal';
  if (FIXED_SIGNS.includes(sign)) return 'Fixed';
  if (MUTABLE_SIGNS.includes(sign)) return 'Mutable';
  return 'Unknown';
}

function toAbsoluteDegree(pos: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(pos.sign);
  return signIndex * 30 + pos.degree + (pos.minutes || 0) / 60;
}

function calculateAspect(pos1: NatalPlanetPosition, pos2: NatalPlanetPosition): { type: string; orb: number } | null {
  const deg1 = toAbsoluteDegree(pos1);
  const deg2 = toAbsoluteDegree(pos2);
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  
  const aspects = [
    { name: 'conjunction', angle: 0, orb: 10 },
    { name: 'sextile', angle: 60, orb: 6 },
    { name: 'square', angle: 90, orb: 8 },
    { name: 'trine', angle: 120, orb: 8 },
    { name: 'opposition', angle: 180, orb: 10 }
  ];
  
  for (const aspect of aspects) {
    const orbActual = Math.abs(diff - aspect.angle);
    if (orbActual <= aspect.orb) {
      return { type: aspect.name, orb: orbActual };
    }
  }
  return null;
}

/**
 * Calculate Short-Term Potential
 * Based on: Venus-Mars chemistry, Moon connection, Mercury communication
 */
function calculateShortTermPotential(
  chart1: NatalChart, 
  chart2: NatalChart,
  karmicAnalysis?: KarmicAnalysis
): { score: number; description: string; factors: string[] } {
  let score = 50;
  const factors: string[] = [];
  
  // Venus-Mars chemistry (high impact for short-term)
  const venus1Mars2 = calculateAspect(chart1.planets.Venus, chart2.planets.Mars);
  const mars1Venus2 = calculateAspect(chart1.planets.Mars, chart2.planets.Venus);
  
  if (venus1Mars2) {
    if (venus1Mars2.type === 'conjunction' || venus1Mars2.type === 'trine') {
      score += 15;
      factors.push('Strong Venus-Mars attraction creates immediate chemistry');
    } else if (venus1Mars2.type === 'square' || venus1Mars2.type === 'opposition') {
      score += 10; // Still attractive, just tension
      factors.push('Passionate Venus-Mars tension drives excitement');
    }
  }
  
  if (mars1Venus2) {
    if (mars1Venus2.type === 'conjunction' || mars1Venus2.type === 'trine') {
      score += 12;
      factors.push('Mutual Mars-Venus connection heightens desire');
    }
  }
  
  // Moon connection (emotional resonance)
  const moon1Moon2 = calculateAspect(chart1.planets.Moon, chart2.planets.Moon);
  if (moon1Moon2) {
    if (moon1Moon2.type === 'conjunction' || moon1Moon2.type === 'trine') {
      score += 10;
      factors.push('Moon harmony creates emotional comfort quickly');
    } else if (moon1Moon2.type === 'sextile') {
      score += 6;
      factors.push('Easy emotional flow between you');
    }
  }
  
  // Sun-Moon cross-aspects (immediate connection)
  const sun1Moon2 = calculateAspect(chart1.planets.Sun, chart2.planets.Moon);
  const moon1Sun2 = calculateAspect(chart1.planets.Moon, chart2.planets.Sun);
  
  if (sun1Moon2?.type === 'conjunction' || sun1Moon2?.type === 'trine') {
    score += 8;
    factors.push('Sun-Moon connection creates natural understanding');
  }
  if (moon1Sun2?.type === 'conjunction' || moon1Sun2?.type === 'trine') {
    score += 8;
    factors.push('Moon-Sun bond feels nurturing and supportive');
  }
  
  // Mercury aspects (communication ease)
  const mercury1Mercury2 = calculateAspect(chart1.planets.Mercury, chart2.planets.Mercury);
  if (mercury1Mercury2?.type === 'conjunction' || mercury1Mercury2?.type === 'trine' || mercury1Mercury2?.type === 'sextile') {
    score += 6;
    factors.push('Mental rapport makes conversation enjoyable');
  }
  
  // Karmic catalyst types boost short-term
  if (karmicAnalysis) {
    if (karmicAnalysis.karmicType === 'catalyst') {
      score += 10;
      factors.push('Catalyst connection creates intense initial attraction');
    }
    if (karmicAnalysis.karmicType === 'twin_flame') {
      score += 8;
      factors.push('Twin flame recognition creates magnetic pull');
    }
  }
  
  score = Math.min(100, Math.max(0, score));
  
  let description = '';
  if (score >= 80) description = 'Excellent short-term chemistry. Strong immediate attraction and easy rapport.';
  else if (score >= 65) description = 'Good short-term potential. Natural compatibility and enjoyable connection.';
  else if (score >= 50) description = 'Moderate short-term dynamics. May take time to warm up to each other.';
  else description = 'Challenging initial chemistry. Connection requires conscious effort.';
  
  return { score, description, factors };
}

/**
 * Calculate Long-Term Potential
 * Based on: Saturn aspects, fixed sign emphasis, composite stability, karmic type
 */
function calculateLongTermPotential(
  chart1: NatalChart,
  chart2: NatalChart,
  karmicAnalysis?: KarmicAnalysis,
  compositeInterpretation?: CompositeInterpretation
): { score: number; description: string; factors: string[] } {
  let score = 50;
  const factors: string[] = [];
  
  // Saturn aspects (commitment, longevity)
  const saturn1Sun2 = calculateAspect(chart1.planets.Saturn, chart2.planets.Sun);
  const sun1Saturn2 = calculateAspect(chart1.planets.Sun, chart2.planets.Saturn);
  const saturn1Moon2 = calculateAspect(chart1.planets.Saturn, chart2.planets.Moon);
  const saturn1Venus2 = calculateAspect(chart1.planets.Saturn, chart2.planets.Venus);
  
  if (saturn1Sun2?.type === 'conjunction' || saturn1Sun2?.type === 'trine') {
    score += 10;
    factors.push('Saturn-Sun connection builds lasting structure');
  } else if (saturn1Sun2?.type === 'square') {
    score -= 5;
    factors.push('Saturn-Sun square: must work through authority issues');
  }
  
  if (sun1Saturn2?.type === 'trine' || sun1Saturn2?.type === 'sextile') {
    score += 8;
    factors.push('Mutual respect and support for long-term goals');
  }
  
  if (saturn1Moon2?.type === 'conjunction' || saturn1Moon2?.type === 'trine') {
    score += 8;
    factors.push('Emotional security through consistent support');
  } else if (saturn1Moon2?.type === 'square') {
    score -= 8;
    factors.push('Saturn-Moon square: emotional coldness may develop');
  }
  
  if (saturn1Venus2?.type === 'trine' || saturn1Venus2?.type === 'sextile') {
    score += 6;
    factors.push('Saturn-Venus supports committed, mature love');
  }
  
  // Fixed sign emphasis (staying power)
  const chart1FixedCount = Object.values(chart1.planets)
    .filter(p => p && FIXED_SIGNS.includes(p.sign)).length;
  const chart2FixedCount = Object.values(chart2.planets)
    .filter(p => p && FIXED_SIGNS.includes(p.sign)).length;
  
  if (chart1FixedCount >= 4 && chart2FixedCount >= 4) {
    score += 10;
    factors.push('Strong fixed sign emphasis brings loyalty and persistence');
  } else if (chart1FixedCount >= 3 || chart2FixedCount >= 3) {
    score += 5;
    factors.push('Reasonable staying power in the relationship');
  }
  
  // Jupiter aspects (growth together)
  const jupiter1Venus2 = calculateAspect(chart1.planets.Jupiter, chart2.planets.Venus);
  const jupiter1Sun2 = calculateAspect(chart1.planets.Jupiter, chart2.planets.Sun);
  
  if (jupiter1Venus2?.type === 'conjunction' || jupiter1Venus2?.type === 'trine') {
    score += 8;
    factors.push('Jupiter-Venus brings abundance and joy over time');
  }
  if (jupiter1Sun2?.type === 'conjunction' || jupiter1Sun2?.type === 'trine') {
    score += 6;
    factors.push('Jupiter-Sun supports mutual growth and optimism');
  }
  
  // North Node aspects (evolutionary support)
  if (chart1.planets.NorthNode && chart2.planets.Sun) {
    const node1Sun2 = calculateAspect(chart1.planets.NorthNode, chart2.planets.Sun);
    if (node1Sun2?.type === 'conjunction' || node1Sun2?.type === 'trine') {
      score += 10;
      factors.push('North Node connection: you help each other evolve');
    }
  }
  
  // Karmic type impact
  if (karmicAnalysis) {
    switch (karmicAnalysis.karmicType) {
      case 'soul_family':
      case 'new_contract':
        score += 15;
        factors.push('Soul family connection supports lasting bonds');
        break;
      case 'twin_flame':
        score += 10;
        factors.push('Twin flame connection provides deep foundation');
        break;
      case 'catalyst':
        score -= 10;
        factors.push('Catalyst connections often serve a temporary purpose');
        break;
      case 'completion':
        score -= 5;
        factors.push('Completion karma: may naturally conclude after lessons learned');
        break;
    }
    
    // Danger flags reduce long-term score
    if (karmicAnalysis.dangerFlags.length > 0) {
      score -= karmicAnalysis.dangerFlags.length * 5;
      factors.push('Karmic danger patterns require conscious work');
    }
  }
  
  score = Math.min(100, Math.max(0, score));
  
  let description = '';
  if (score >= 75) description = 'Strong long-term potential. Solid foundation for lasting commitment.';
  else if (score >= 55) description = 'Moderate long-term potential. Success depends on both partners\' commitment.';
  else if (score >= 40) description = 'Limited long-term indicators. May be meant as shorter-term connection.';
  else description = 'Challenging for long-term. Better as a growth catalyst than permanent partner.';
  
  return { score, description, factors };
}

/**
 * Calculate Marriage Potential
 */
function calculateMarriagePotential(
  chart1: NatalChart,
  chart2: NatalChart,
  longTermScore: number,
  karmicAnalysis?: KarmicAnalysis
): { score: number; considerations: string[]; timing?: string } {
  let score = longTermScore;
  const considerations: string[] = [];
  
  // 7th house connections (partnership house)
  // Check if Descendant/7th cusp involved
  if (chart1.houseCusps?.[7] && chart2.planets.Sun) {
    // Would check if partner's Sun near 7th cusp
    considerations.push('Partner planets activating your 7th house of commitment');
  }
  
  // Juno aspects (asteroid of marriage)
  if (chart1.planets.Juno && chart2.planets.Sun) {
    const juno1Sun2 = calculateAspect(chart1.planets.Juno, chart2.planets.Sun);
    if (juno1Sun2?.type === 'conjunction' || juno1Sun2?.type === 'trine') {
      score += 10;
      considerations.push('Juno-Sun connection indicates marriage potential');
    }
  }
  
  // Saturn-Venus aspects (serious love)
  const saturn1Venus2 = calculateAspect(chart1.planets.Saturn, chart2.planets.Venus);
  const venus1Saturn2 = calculateAspect(chart1.planets.Venus, chart2.planets.Saturn);
  
  if (saturn1Venus2?.type === 'conjunction' || saturn1Venus2?.type === 'trine') {
    score += 8;
    considerations.push('Saturn-Venus creates serious, committed love');
  }
  if (venus1Saturn2?.type === 'trine' || venus1Saturn2?.type === 'sextile') {
    score += 5;
    considerations.push('Venus-Saturn supports mature partnership');
  }
  
  // Karmic considerations
  if (karmicAnalysis) {
    considerations.push(`Karmic type: ${karmicAnalysis.karmicType}`);
    considerations.push(karmicAnalysis.soulPurpose);
    
    if (karmicAnalysis.dangerFlags.length > 0) {
      considerations.push('⚠️ Address danger patterns before committing');
      score -= 10;
    }
  }
  
  // Moon-Moon compatibility for domestic harmony
  const moon1Moon2 = calculateAspect(chart1.planets.Moon, chart2.planets.Moon);
  if (moon1Moon2?.type === 'conjunction' || moon1Moon2?.type === 'trine') {
    score += 5;
    considerations.push('Moon harmony supports domestic bliss');
  } else if (moon1Moon2?.type === 'square') {
    score -= 5;
    considerations.push('Moon tension may create emotional friction at home');
  }
  
  score = Math.min(100, Math.max(0, score));
  
  // Timing suggestion based on Saturn transits
  const timing = score >= 70 
    ? 'Saturn transits suggest structured milestones are favorable'
    : 'Take time to address challenges before major commitments';
  
  return { score, considerations, timing };
}

/**
 * Calculate Business Potential
 */
function calculateBusinessPotential(
  chart1: NatalChart,
  chart2: NatalChart,
  compositeInterpretation?: CompositeInterpretation
): { score: number; considerations: string[]; bestAreas?: string[] } {
  let score = 50;
  const considerations: string[] = [];
  const bestAreas: string[] = [];
  
  // Mercury aspects (communication, deals)
  const mercury1Mercury2 = calculateAspect(chart1.planets.Mercury, chart2.planets.Mercury);
  if (mercury1Mercury2?.type === 'conjunction' || mercury1Mercury2?.type === 'trine') {
    score += 15;
    considerations.push('Excellent mental rapport for business discussions');
  } else if (mercury1Mercury2?.type === 'square') {
    score -= 5;
    considerations.push('Different communication styles may cause misunderstandings');
  }
  
  // Saturn aspects (structure, responsibility)
  const saturn1Saturn2 = calculateAspect(chart1.planets.Saturn, chart2.planets.Saturn);
  if (saturn1Saturn2?.type === 'conjunction' || saturn1Saturn2?.type === 'trine') {
    score += 10;
    considerations.push('Shared approach to responsibility and structure');
  }
  
  // Jupiter aspects (growth, luck)
  const jupiter1Jupiter2 = calculateAspect(chart1.planets.Jupiter, chart2.planets.Jupiter);
  const jupiter1Sun2 = calculateAspect(chart1.planets.Jupiter, chart2.planets.Sun);
  
  if (jupiter1Jupiter2?.type === 'conjunction' || jupiter1Jupiter2?.type === 'trine') {
    score += 10;
    considerations.push('Shared vision for growth and expansion');
    bestAreas.push('Expansion ventures');
  }
  if (jupiter1Sun2?.type === 'conjunction' || jupiter1Sun2?.type === 'trine') {
    score += 8;
    considerations.push('One partner elevates the other\'s success');
    bestAreas.push('Leadership roles');
  }
  
  // Mars aspects (action, drive)
  const mars1Mars2 = calculateAspect(chart1.planets.Mars, chart2.planets.Mars);
  if (mars1Mars2?.type === 'trine' || mars1Mars2?.type === 'sextile') {
    score += 8;
    considerations.push('Complementary action styles work well together');
    bestAreas.push('Project execution');
  } else if (mars1Mars2?.type === 'square') {
    score -= 5;
    considerations.push('Competitive tension may arise');
  }
  
  // Pallas aspects (strategy)
  if (chart1.planets.Pallas && chart2.planets.Pallas) {
    const pallas1Pallas2 = calculateAspect(chart1.planets.Pallas, chart2.planets.Pallas);
    if (pallas1Pallas2?.type === 'conjunction' || pallas1Pallas2?.type === 'trine') {
      score += 8;
      considerations.push('Aligned strategic thinking');
      bestAreas.push('Strategy & planning');
    }
  }
  
  // Element analysis for business areas
  const sunElement1 = getElement(chart1.planets.Sun.sign);
  const sunElement2 = getElement(chart2.planets.Sun.sign);
  
  if (sunElement1 === 'Earth' || sunElement2 === 'Earth') {
    bestAreas.push('Finance', 'Real estate', 'Manufacturing');
  }
  if (sunElement1 === 'Air' || sunElement2 === 'Air') {
    bestAreas.push('Technology', 'Communications', 'Media');
  }
  if (sunElement1 === 'Fire' || sunElement2 === 'Fire') {
    bestAreas.push('Entertainment', 'Sports', 'Entrepreneurship');
  }
  if (sunElement1 === 'Water' || sunElement2 === 'Water') {
    bestAreas.push('Healthcare', 'Hospitality', 'Creative arts');
  }
  
  score = Math.min(100, Math.max(0, score));
  
  return { score, considerations, bestAreas: [...new Set(bestAreas)] };
}

/**
 * Calculate Growth Potential
 */
function calculateGrowthPotential(
  chart1: NatalChart,
  chart2: NatalChart,
  karmicAnalysis?: KarmicAnalysis,
  compositeInterpretation?: CompositeInterpretation
): { individual: string; collective: string; evolutionaryPath: string } {
  
  // Individual growth through North Node aspects
  let individual = 'This connection challenges you both to develop individually.';
  
  if (chart1.planets.NorthNode && chart2.planets.Sun) {
    const node1Sun2 = calculateAspect(chart1.planets.NorthNode, chart2.planets.Sun);
    if (node1Sun2) {
      individual = `${chart2.planets.Sun.sign} energy from your partner activates your North Node path of growth.`;
    }
  }
  
  // Collective growth through composite
  let collective = 'Together you can build something greater than the sum of your parts.';
  if (compositeInterpretation) {
    collective = compositeInterpretation.overallTheme || collective;
  }
  
  // Evolutionary path from karmic analysis
  let evolutionaryPath = 'Your connection is designed to catalyze spiritual evolution.';
  if (karmicAnalysis) {
    evolutionaryPath = karmicAnalysis.timeline.key_lessons.join(' → ') || evolutionaryPath;
    if (karmicAnalysis.healingOpportunities.length > 0) {
      evolutionaryPath = `Healing opportunity: ${karmicAnalysis.healingOpportunities[0]}`;
    }
  }
  
  return { individual, collective, evolutionaryPath };
}

/**
 * Main function to calculate complete relationship potential
 */
export function calculateRelationshipPotential(
  chart1: NatalChart,
  chart2: NatalChart,
  karmicAnalysis?: KarmicAnalysis,
  compositeInterpretation?: CompositeInterpretation
): RelationshipPotential {
  const shortTerm = calculateShortTermPotential(chart1, chart2, karmicAnalysis);
  const longTerm = calculateLongTermPotential(chart1, chart2, karmicAnalysis, compositeInterpretation);
  const marriagePotential = calculateMarriagePotential(chart1, chart2, longTerm.score, karmicAnalysis);
  const businessPotential = calculateBusinessPotential(chart1, chart2, compositeInterpretation);
  const growthPotential = calculateGrowthPotential(chart1, chart2, karmicAnalysis, compositeInterpretation);
  
  return {
    shortTerm,
    longTerm,
    marriagePotential,
    businessPotential,
    growthPotential
  };
}

/**
 * Calculate Purpose Alignment between two people
 */
export function calculatePurposeAlignment(
  chart1: NatalChart,
  chart2: NatalChart,
  compositeInterpretation?: CompositeInterpretation
): PurposeAlignment {
  let alignmentScore = 50;
  const synergies: string[] = [];
  const conflictingGoals: string[] = [];
  const coreValues: string[] = [];
  
  // Sun sign compatibility (core identity alignment)
  const sunElement1 = getElement(chart1.planets.Sun.sign);
  const sunElement2 = getElement(chart2.planets.Sun.sign);
  
  if (sunElement1 === sunElement2) {
    alignmentScore += 10;
    synergies.push(`Both ${sunElement1} signs: shared elemental approach to life`);
  } else if (
    (sunElement1 === 'Fire' && sunElement2 === 'Air') ||
    (sunElement1 === 'Air' && sunElement2 === 'Fire') ||
    (sunElement1 === 'Earth' && sunElement2 === 'Water') ||
    (sunElement1 === 'Water' && sunElement2 === 'Earth')
  ) {
    alignmentScore += 8;
    synergies.push('Complementary elements create balanced synergy');
  } else {
    conflictingGoals.push('Different elemental natures may create friction in priorities');
  }
  
  // Modality alignment
  const sunMode1 = getModality(chart1.planets.Sun.sign);
  const sunMode2 = getModality(chart2.planets.Sun.sign);
  
  if (sunMode1 === sunMode2) {
    if (sunMode1 === 'Fixed') {
      synergies.push('Both Fixed signs: shared determination and loyalty');
      coreValues.push('Stability', 'Commitment');
    } else if (sunMode1 === 'Cardinal') {
      synergies.push('Both Cardinal signs: shared drive to initiate');
      coreValues.push('Leadership', 'Action');
    } else {
      synergies.push('Both Mutable signs: shared adaptability');
      coreValues.push('Flexibility', 'Growth');
    }
    alignmentScore += 5;
  }
  
  // North Node alignment (soul purpose direction)
  if (chart1.planets.NorthNode && chart2.planets.NorthNode) {
    const nodeElement1 = getElement(chart1.planets.NorthNode.sign);
    const nodeElement2 = getElement(chart2.planets.NorthNode.sign);
    
    if (nodeElement1 === nodeElement2) {
      alignmentScore += 15;
      synergies.push('Aligned North Nodes: you\'re heading in the same spiritual direction');
      coreValues.push('Shared soul path');
    }
  }
  
  // Sun-Moon cross connections (understanding each other's needs)
  const sun1Moon2 = calculateAspect(chart1.planets.Sun, chart2.planets.Moon);
  const moon1Sun2 = calculateAspect(chart1.planets.Moon, chart2.planets.Sun);
  
  if (sun1Moon2?.type === 'conjunction' || sun1Moon2?.type === 'trine') {
    alignmentScore += 8;
    synergies.push('Sun-Moon connection: natural understanding of each other\'s core needs');
  }
  if (moon1Sun2?.type === 'conjunction' || moon1Sun2?.type === 'trine') {
    alignmentScore += 8;
    synergies.push('Moon-Sun bond: emotional support for each other\'s identity');
  }
  
  // Jupiter connections (shared vision for growth)
  const jupiter1Jupiter2 = calculateAspect(chart1.planets.Jupiter, chart2.planets.Jupiter);
  if (jupiter1Jupiter2?.type === 'conjunction' || jupiter1Jupiter2?.type === 'trine') {
    alignmentScore += 10;
    synergies.push('Aligned Jupiter: shared beliefs and vision for expansion');
    coreValues.push('Growth', 'Adventure');
  } else if (jupiter1Jupiter2?.type === 'square') {
    conflictingGoals.push('Different beliefs or growth directions may cause friction');
  }
  
  // Saturn connections (shared approach to responsibility)
  const saturn1Saturn2 = calculateAspect(chart1.planets.Saturn, chart2.planets.Saturn);
  if (saturn1Saturn2?.type === 'conjunction' || saturn1Saturn2?.type === 'trine') {
    alignmentScore += 8;
    synergies.push('Aligned Saturn: shared approach to duty, responsibility, and structure');
    coreValues.push('Responsibility', 'Maturity');
  } else if (saturn1Saturn2?.type === 'square') {
    conflictingGoals.push('Different approaches to responsibility and timing');
  }
  
  // Check for challenging aspects that create conflicting goals
  const mars1Mars2 = calculateAspect(chart1.planets.Mars, chart2.planets.Mars);
  if (mars1Mars2?.type === 'square' || mars1Mars2?.type === 'opposition') {
    conflictingGoals.push('Mars tension: different ways of taking action and pursuing goals');
  }
  
  alignmentScore = Math.min(100, Math.max(0, alignmentScore));
  
  // Generate individual goals based on Sun signs
  const getSunGoal = (sign: string): string => {
    const goals: Record<string, string> = {
      'Aries': 'To pioneer, lead, and assert individual identity',
      'Taurus': 'To build security, enjoy life\'s pleasures, and create lasting value',
      'Gemini': 'To learn, communicate, and connect with diverse ideas and people',
      'Cancer': 'To nurture, protect, and create emotional security',
      'Leo': 'To create, express, and be recognized for unique talents',
      'Virgo': 'To serve, improve, and perfect skills and systems',
      'Libra': 'To harmonize, partner, and create beauty and balance',
      'Scorpio': 'To transform, investigate, and achieve deep intimacy',
      'Sagittarius': 'To explore, expand horizons, and find meaning',
      'Capricorn': 'To achieve, build structures, and leave a legacy',
      'Aquarius': 'To innovate, liberate, and serve humanity',
      'Pisces': 'To transcend, heal, and connect with the spiritual'
    };
    return goals[sign] || 'To express their unique soul purpose';
  };
  
  // Generate shared purpose from composite
  let sharedPurpose = 'To grow together and support each other\'s evolution';
  let missionStatement = '';
  let jointVision = 'A partnership that brings out the best in both individuals';
  
  if (compositeInterpretation) {
    sharedPurpose = compositeInterpretation.relationshipStyle || sharedPurpose;
    missionStatement = compositeInterpretation.overallTheme || '';
    jointVision = `${compositeInterpretation.emotionalCore} Combined with ${compositeInterpretation.loveLanguage}`;
  }
  
  return {
    aligned: alignmentScore >= 60,
    alignmentScore,
    sharedPurpose,
    individualGoals: {
      person1: getSunGoal(chart1.planets.Sun.sign),
      person2: getSunGoal(chart2.planets.Sun.sign)
    },
    conflictingGoals,
    synergies,
    missionStatement,
    coreValues,
    jointVision
  };
}

export default { calculateRelationshipPotential, calculatePurposeAlignment };
