/**
 * Group Dynamics Analysis
 * Analyzes relationships between 3+ people (e.g., family, team, friend group)
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { RelationshipFocus } from './focusAwareInterpretations';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ELEMENTS: Record<string, string[]> = {
  Fire: ['Aries', 'Leo', 'Sagittarius'],
  Earth: ['Taurus', 'Virgo', 'Capricorn'],
  Air: ['Gemini', 'Libra', 'Aquarius'],
  Water: ['Cancer', 'Scorpio', 'Pisces']
};

const MODALITIES: Record<string, string[]> = {
  Cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
  Fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
  Mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces']
};

function toAbsoluteDegree(position: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return (signIndex * 30) + position.degree + ((position.minutes || 0) / 60);
}

function getElement(sign: string): string {
  for (const [element, signs] of Object.entries(ELEMENTS)) {
    if (signs.includes(sign)) return element;
  }
  return 'Unknown';
}

function getModality(sign: string): string {
  for (const [modality, signs] of Object.entries(MODALITIES)) {
    if (signs.includes(sign)) return modality;
  }
  return 'Unknown';
}

export interface GroupMemberProfile {
  chart: NatalChart;
  sunElement: string;
  moonElement: string;
  sunModality: string;
  roleInGroup: string;
  primaryEnergy: string;
  pallasSign?: string;
  vestaSign?: string;
  pallasInsight?: string;
  vestaInsight?: string;
}

export interface PairDynamic {
  person1: string;
  person2: string;
  connectionStrength: number;
  keyAspects: string[];
  dynamicType: string;
}

export interface GroupDynamicsReport {
  memberCount: number;
  members: GroupMemberProfile[];
  elementBalance: { Fire: number; Earth: number; Air: number; Water: number };
  modalityBalance: { Cardinal: number; Fixed: number; Mutable: number };
  groupEnergy: string;
  groupStrengths: string[];
  groupChallenges: string[];
  pairDynamics: PairDynamic[];
  focusInsights: string[];
  recommendations: string[];
  // Asteroid insights for group
  pallasAnalysis?: string;
  vestaAnalysis?: string;
}

// Pallas interpretations by sign for strategy/business
const PALLAS_INSIGHTS: Record<string, string> = {
  Aries: 'Bold strategic initiator - takes decisive action on ideas',
  Taurus: 'Practical strategist - builds sustainable, value-focused plans',
  Gemini: 'Versatile thinker - excels at multi-pronged approaches',
  Cancer: 'Intuitive strategist - reads emotional currents for advantage',
  Leo: 'Creative visionary - leads with confidence and flair',
  Virgo: 'Analytical planner - masters detail and process optimization',
  Libra: 'Diplomatic negotiator - excels at partnerships and mediation',
  Scorpio: 'Deep investigator - uncovers hidden patterns and leverage',
  Sagittarius: 'Big-picture thinker - connects strategy to meaning',
  Capricorn: 'Executive planner - builds enduring structures',
  Aquarius: 'Innovative strategist - sees unconventional solutions',
  Pisces: 'Intuitive visionary - strategizes through imagination'
};

// Vesta interpretations by sign for dedication/focus
const VESTA_INSIGHTS: Record<string, string> = {
  Aries: 'Focused on pioneering - dedicates to breaking new ground',
  Taurus: 'Focused on stability - dedicates to building lasting value',
  Gemini: 'Focused on learning - dedicates to information and ideas',
  Cancer: 'Focused on nurturing - dedicates to home and emotional care',
  Leo: 'Focused on expression - dedicates to creative self-actualization',
  Virgo: 'Focused on service - dedicates to improvement and healing',
  Libra: 'Focused on harmony - dedicates to relationships and beauty',
  Scorpio: 'Focused on transformation - dedicates to depth and healing',
  Sagittarius: 'Focused on truth - dedicates to wisdom and exploration',
  Capricorn: 'Focused on achievement - dedicates to mastery and legacy',
  Aquarius: 'Focused on humanity - dedicates to collective progress',
  Pisces: 'Focused on transcendence - dedicates to spiritual service'
};

function analyzeGroupMember(chart: NatalChart): GroupMemberProfile {
  const sunSign = chart.planets.Sun?.sign || 'Unknown';
  const moonSign = chart.planets.Moon?.sign || 'Unknown';
  const sunElement = getElement(sunSign);
  const moonElement = getElement(moonSign);
  const sunModality = getModality(sunSign);
  
  // Get asteroid signs
  const pallasSign = chart.planets.Pallas?.sign;
  const vestaSign = chart.planets.Vesta?.sign;

  // Determine role based on sun/moon combination
  let roleInGroup = 'Contributor';
  let primaryEnergy = `${sunSign} Sun with ${moonSign} Moon`;

  if (sunModality === 'Cardinal') {
    roleInGroup = 'Initiator';
  } else if (sunModality === 'Fixed') {
    roleInGroup = 'Stabilizer';
  } else if (sunModality === 'Mutable') {
    roleInGroup = 'Adapter';
  }

  if (sunElement === 'Fire') {
    primaryEnergy = 'Brings enthusiasm, inspiration, and forward momentum';
  } else if (sunElement === 'Earth') {
    primaryEnergy = 'Brings practicality, reliability, and grounding';
  } else if (sunElement === 'Air') {
    primaryEnergy = 'Brings ideas, communication, and social connection';
  } else if (sunElement === 'Water') {
    primaryEnergy = 'Brings emotional depth, intuition, and nurturing';
  }

  return {
    chart,
    sunElement,
    moonElement,
    sunModality,
    roleInGroup,
    primaryEnergy,
    pallasSign,
    vestaSign,
    pallasInsight: pallasSign ? PALLAS_INSIGHTS[pallasSign] : undefined,
    vestaInsight: vestaSign ? VESTA_INSIGHTS[vestaSign] : undefined
  };
}

function analyzePairDynamic(chart1: NatalChart, chart2: NatalChart): PairDynamic {
  const keyAspects: string[] = [];
  let connectionStrength = 50;

  // Check Sun compatibility
  const sun1 = chart1.planets.Sun?.sign;
  const sun2 = chart2.planets.Sun?.sign;
  if (sun1 && sun2) {
    const elem1 = getElement(sun1);
    const elem2 = getElement(sun2);
    if (elem1 === elem2) {
      keyAspects.push(`Both ${elem1} Suns - natural understanding`);
      connectionStrength += 15;
    } else if (
      (elem1 === 'Fire' && elem2 === 'Air') || (elem1 === 'Air' && elem2 === 'Fire') ||
      (elem1 === 'Earth' && elem2 === 'Water') || (elem1 === 'Water' && elem2 === 'Earth')
    ) {
      keyAspects.push(`Complementary elements (${elem1}/${elem2})`);
      connectionStrength += 10;
    }
  }

  // Check Moon compatibility
  const moon1 = chart1.planets.Moon?.sign;
  const moon2 = chart2.planets.Moon?.sign;
  if (moon1 && moon2) {
    const elem1 = getElement(moon1);
    const elem2 = getElement(moon2);
    if (elem1 === elem2) {
      keyAspects.push(`Same Moon element - emotional harmony`);
      connectionStrength += 15;
    }
  }

  // Sun-Moon connection
  if (sun1 === moon2 || sun2 === moon1) {
    keyAspects.push('Sun-Moon same sign - deep understanding');
    connectionStrength += 20;
  }

  // Determine dynamic type
  let dynamicType = 'Neutral';
  if (connectionStrength >= 80) {
    dynamicType = 'Very Harmonious';
  } else if (connectionStrength >= 65) {
    dynamicType = 'Supportive';
  } else if (connectionStrength >= 50) {
    dynamicType = 'Balanced';
  } else {
    dynamicType = 'Growth-Oriented';
  }

  return {
    person1: chart1.name,
    person2: chart2.name,
    connectionStrength: Math.min(100, connectionStrength),
    keyAspects,
    dynamicType
  };
}

export function analyzeGroupDynamics(
  charts: NatalChart[],
  focus: RelationshipFocus
): GroupDynamicsReport {
  const members = charts.map(analyzeGroupMember);

  // Calculate element balance
  const elementBalance = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalityBalance = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  members.forEach(m => {
    if (elementBalance[m.sunElement as keyof typeof elementBalance] !== undefined) {
      elementBalance[m.sunElement as keyof typeof elementBalance]++;
    }
    if (modalityBalance[m.sunModality as keyof typeof modalityBalance] !== undefined) {
      modalityBalance[m.sunModality as keyof typeof modalityBalance]++;
    }
  });

  // Analyze all pair dynamics
  const pairDynamics: PairDynamic[] = [];
  for (let i = 0; i < charts.length; i++) {
    for (let j = i + 1; j < charts.length; j++) {
      pairDynamics.push(analyzePairDynamic(charts[i], charts[j]));
    }
  }

  // Determine group energy
  const dominantElement = Object.entries(elementBalance)
    .sort((a, b) => b[1] - a[1])[0];
  
  const elementDescriptions: Record<string, string> = {
    Fire: 'Dynamic, enthusiastic, and action-oriented',
    Earth: 'Practical, stable, and results-focused',
    Air: 'Communicative, intellectual, and social',
    Water: 'Emotionally attuned, intuitive, and nurturing'
  };

  const groupEnergy = `${dominantElement[0]}-dominant: ${elementDescriptions[dominantElement[0]]}`;

  // Identify strengths
  const groupStrengths: string[] = [];
  const groupChallenges: string[] = [];

  if (elementBalance.Fire >= 2) {
    groupStrengths.push('Strong initiative and enthusiasm');
  }
  if (elementBalance.Earth >= 2) {
    groupStrengths.push('Practical grounding and follow-through');
  }
  if (elementBalance.Air >= 2) {
    groupStrengths.push('Excellent communication and idea generation');
  }
  if (elementBalance.Water >= 2) {
    groupStrengths.push('Emotional intelligence and intuitive understanding');
  }

  // Identify missing elements as challenges
  if (elementBalance.Fire === 0) {
    groupChallenges.push('May lack spontaneity and initiative');
  }
  if (elementBalance.Earth === 0) {
    groupChallenges.push('May struggle with practical implementation');
  }
  if (elementBalance.Air === 0) {
    groupChallenges.push('May need to work on communication');
  }
  if (elementBalance.Water === 0) {
    groupChallenges.push('May need to cultivate emotional connection');
  }

  // Generate focus-specific insights
  const focusInsights: string[] = [];
  const recommendations: string[] = [];

  switch (focus) {
    case 'business':
      focusInsights.push(`${modalityBalance.Cardinal} initiators, ${modalityBalance.Fixed} stabilizers, ${modalityBalance.Mutable} adapters`);
      if (modalityBalance.Cardinal === 0) {
        focusInsights.push('No natural leaders - will need to consciously assign initiative roles');
      }
      if (modalityBalance.Fixed === 0) {
        focusInsights.push('May struggle with long-term commitment - build in accountability structures');
      }
      recommendations.push('Define clear roles based on each person\'s natural energy');
      if (elementBalance.Earth >= 2) {
        recommendations.push('Leverage your practical Earth energy for financial planning');
      }
      break;

    case 'friendship':
      const avgStrength = pairDynamics.reduce((sum, p) => sum + p.connectionStrength, 0) / pairDynamics.length;
      focusInsights.push(`Average connection strength: ${Math.round(avgStrength)}%`);
      focusInsights.push(`${pairDynamics.filter(p => p.dynamicType === 'Very Harmonious' || p.dynamicType === 'Supportive').length} naturally harmonious pairings`);
      recommendations.push('Spend quality time in the pairs with strongest connections');
      recommendations.push('Plan group activities that honor different energy levels');
      break;

    case 'family':
      focusInsights.push('Family element distribution shows generational patterns');
      if (dominantElement[0] === 'Water') {
        focusInsights.push('Strong emotional family bond - feelings are central');
      } else if (dominantElement[0] === 'Earth') {
        focusInsights.push('Family shows through practical care and stability');
      }
      const weakestPair = pairDynamics.sort((a, b) => a.connectionStrength - b.connectionStrength)[0];
      if (weakestPair && weakestPair.connectionStrength < 50) {
        recommendations.push(`${weakestPair.person1} and ${weakestPair.person2} may need more one-on-one bonding time`);
      }
      recommendations.push('Honor each family member\'s unique energy and role');
      break;

    case 'creative':
      if (elementBalance.Fire + elementBalance.Air >= charts.length / 2) {
        focusInsights.push('Strong creative fire and ideas flow easily');
      }
      if (elementBalance.Water >= 2) {
        focusInsights.push('Deep emotional and intuitive creativity available');
      }
      recommendations.push('Combine different energies: visionaries (Fire/Air) with manifesters (Earth/Water)');
      break;

    case 'romantic':
      focusInsights.push('This analysis is designed for groups - for romantic pairs, use the Synastry tab');
      break;

    default:
      focusInsights.push(`Group of ${charts.length} people with diverse energies`);
  }

  // Generate Pallas analysis for business focus
  let pallasAnalysis: string | undefined;
  if (focus === 'business' || focus === 'all') {
    const pallasInsights = members.filter(m => m.pallasInsight).map(m => `${m.chart.name}: ${m.pallasInsight}`);
    if (pallasInsights.length > 0) {
      pallasAnalysis = `Strategic Strengths (Pallas): ${pallasInsights.join('; ')}`;
    }
  }
  
  // Generate Vesta analysis for dedication patterns
  let vestaAnalysis: string | undefined;
  const vestaInsights = members.filter(m => m.vestaInsight).map(m => `${m.chart.name}: ${m.vestaInsight}`);
  if (vestaInsights.length > 0) {
    vestaAnalysis = `Dedication Patterns (Vesta): ${vestaInsights.join('; ')}`;
  }

  return {
    memberCount: charts.length,
    members,
    elementBalance,
    modalityBalance,
    groupEnergy,
    groupStrengths,
    groupChallenges,
    pairDynamics,
    focusInsights,
    recommendations,
    pallasAnalysis,
    vestaAnalysis
  };
}
