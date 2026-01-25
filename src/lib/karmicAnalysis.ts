import { NatalChart } from '@/hooks/useNatalChart';

// Karmic weight constants
const KARMIC_WEIGHTS = {
  southNode: {
    conjunction: 15,
    opposition: 10,
    square: 8,
    trine: 6,
    sextile: 4
  },
  northNode: {
    conjunction: 12,
    opposition: 8,
    square: 6,
    trine: 5,
    sextile: 3
  },
  saturn: {
    conjunction: 12,
    opposition: 10,
    square: 10,
    trine: 5,
    sextile: 3
  },
  pluto: {
    conjunction: 14,
    opposition: 12,
    square: 11,
    trine: 6,
    sextile: 4
  },
  chiron: {
    conjunction: 10,
    opposition: 8,
    square: 7,
    trine: 4,
    sextile: 3
  },
  twelfthHouse: 8,
  eighthHouse: 6,
  vertex: 10
};

const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];

export interface KarmicIndicator {
  type: 'south_node' | 'north_node' | 'saturn' | 'pluto' | 'chiron' | 'twelfth_house' | 'eighth_house' | 'vertex';
  planet1: string;
  planet2: string;
  aspect?: string;
  weight: number;
  interpretation: string;
  theme: 'past_life' | 'soul_growth' | 'karmic_debt' | 'transformation' | 'healing' | 'fated';
}

export interface KarmicAnalysis {
  totalKarmicScore: number;
  pastLifeProbability: number;
  karmicType: 'completion' | 'new_contract' | 'soul_family' | 'catalyst' | 'twin_flame' | 'karmic_lesson';
  indicators: KarmicIndicator[];
  dangerFlags: string[];
  healingOpportunities: string[];
  soulPurpose: string;
  recommendedApproach: string;
  timeline: { likely_duration: string; key_lessons: string[]; completion_indicators: string[]; };
}

const ZODIAC_SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

function calculateAspect(planet1: any, planet2: any): string | null {
  if (!planet1 || !planet2) return null;
  const signIndex1 = typeof planet1.sign === 'string' ? ZODIAC_SIGNS.indexOf(planet1.sign) : planet1.sign;
  const signIndex2 = typeof planet2.sign === 'string' ? ZODIAC_SIGNS.indexOf(planet2.sign) : planet2.sign;
  if (signIndex1 === -1 || signIndex2 === -1) return null;
  const pos1 = signIndex1 * 30 + planet1.degree + (planet1.minutes / 60);
  const pos2 = signIndex2 * 30 + planet2.degree + (planet2.minutes / 60);
  let diff = Math.abs(pos1 - pos2);
  if (diff > 180) diff = 360 - diff;
  if (diff <= 8) return 'conjunction';
  if (Math.abs(diff - 180) <= 8) return 'opposition';
  if (Math.abs(diff - 120) <= 8) return 'trine';
  if (Math.abs(diff - 90) <= 7) return 'square';
  if (Math.abs(diff - 60) <= 6) return 'sextile';
  return null;
}

function isPlanetInHouse(planet: any, houseCusp: any, nextHouseCusp: any): boolean {
  if (!planet || !houseCusp || !nextHouseCusp) return false;
  const planetSignIndex = typeof planet.sign === 'string' ? ZODIAC_SIGNS.indexOf(planet.sign) : planet.sign;
  const cuspSignIndex = typeof houseCusp.sign === 'string' ? ZODIAC_SIGNS.indexOf(houseCusp.sign) : houseCusp.sign;
  const nextCuspSignIndex = typeof nextHouseCusp.sign === 'string' ? ZODIAC_SIGNS.indexOf(nextHouseCusp.sign) : nextHouseCusp.sign;
  if (planetSignIndex === -1 || cuspSignIndex === -1 || nextCuspSignIndex === -1) return false;
  const planetPos = planetSignIndex * 30 + planet.degree + (planet.minutes / 60);
  const cuspPos = cuspSignIndex * 30 + houseCusp.degree + (houseCusp.minutes / 60);
  let nextCuspPos = nextCuspSignIndex * 30 + nextHouseCusp.degree + (nextHouseCusp.minutes / 60);
  if (nextCuspPos < cuspPos) nextCuspPos += 360;
  let adjustedPlanetPos = planetPos;
  if (adjustedPlanetPos < cuspPos) adjustedPlanetPos += 360;
  return adjustedPlanetPos >= cuspPos && adjustedPlanetPos < nextCuspPos;
}

function analyzeSouthNodeConnections(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[]) {
  const southNode1 = chart1.planets.SouthNode;
  if (!southNode1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(southNode1, planet2);
    if (aspect) {
      indicators.push({ type: 'south_node', planet1: 'SouthNode', planet2: planetName, aspect, weight: KARMIC_WEIGHTS.southNode[aspect] || 0, interpretation: `Past life ${planetName} connection via ${aspect}`, theme: 'past_life' });
    }
  });
}

function analyzeNorthNodeConnections(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[]) {
  const northNode1 = chart1.planets.NorthNode;
  if (!northNode1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(northNode1, planet2);
    if (aspect) {
      indicators.push({ type: 'north_node', planet1: 'NorthNode', planet2: planetName, aspect, weight: KARMIC_WEIGHTS.northNode[aspect] || 0, interpretation: `Soul growth ${planetName} connection via ${aspect}`, theme: 'soul_growth' });
    }
  });
}

function analyzeSaturnKarma(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[], dangerFlags: string[]) {
  const saturn1 = chart1.planets.Saturn;
  if (!saturn1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(saturn1, planet2);
    if (aspect) {
      indicators.push({ type: 'saturn', planet1: 'Saturn', planet2: planetName, aspect, weight: KARMIC_WEIGHTS.saturn[aspect] || 0, interpretation: `Saturn karma with ${planetName}`, theme: 'karmic_debt' });
      if ((aspect === 'conjunction' || aspect === 'square' || aspect === 'opposition') && ['Moon', 'Sun', 'Venus'].includes(planetName)) {
        dangerFlags.push(`Saturn ${aspect} ${planetName}: Potential restriction/control dynamics`);
      }
    }
  });
}

function analyzePlutoTransformation(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[], dangerFlags: string[]) {
  const pluto1 = chart1.planets.Pluto;
  if (!pluto1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(pluto1, planet2);
    if (aspect) {
      indicators.push({ type: 'pluto', planet1: 'Pluto', planet2: planetName, aspect, weight: KARMIC_WEIGHTS.pluto[aspect] || 0, interpretation: `Pluto transformation with ${planetName}`, theme: 'transformation' });
      if ((aspect === 'conjunction' || aspect === 'square' || aspect === 'opposition') && ['Venus', 'Mars', 'Moon'].includes(planetName)) {
        dangerFlags.push(`Pluto ${aspect} ${planetName}: Intense power dynamics`);
      }
    }
  });
}

function analyzeChironHealing(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[], healingOpportunities: string[]) {
  const chiron1 = chart1.planets.Chiron;
  if (!chiron1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(chiron1, planet2);
    if (aspect) {
      indicators.push({ type: 'chiron', planet1: 'Chiron', planet2: planetName, aspect, weight: KARMIC_WEIGHTS.chiron[aspect] || 0, interpretation: `Chiron healing with ${planetName}`, theme: 'healing' });
      healingOpportunities.push(`Chiron ${aspect} ${planetName}: Healing opportunity`);
    }
  });
}

function analyzeTwelfthHouseOverlays(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[]) {
  const twelfthHouseCusp = chart1.houseCusps?.[12];
  const nextHouseCusp = chart1.houseCusps?.[1];
  if (!twelfthHouseCusp || !nextHouseCusp) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    if (isPlanetInHouse(planet2, twelfthHouseCusp, nextHouseCusp)) {
      indicators.push({ type: 'twelfth_house', planet1: planetName, planet2: '12th House', weight: KARMIC_WEIGHTS.twelfthHouse, interpretation: `${planetName} in 12th house overlay`, theme: 'past_life' });
    }
  });
}

function analyzeEighthHouseOverlays(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[], dangerFlags: string[]) {
  const eighthHouseCusp = chart1.houseCusps?.[8];
  const ninthHouseCusp = chart1.houseCusps?.[9];
  if (!eighthHouseCusp || !ninthHouseCusp) return;
  let count = 0;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    if (isPlanetInHouse(planet2, eighthHouseCusp, ninthHouseCusp)) {
      count++;
      indicators.push({ type: 'eighth_house', planet1: planetName, planet2: '8th House', weight: KARMIC_WEIGHTS.eighthHouse, interpretation: `${planetName} in 8th house overlay`, theme: 'transformation' });
    }
  });
  if (count >= 3) dangerFlags.push('Multiple 8th house overlays: High intensity');
}

function analyzeVertexContacts(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[]) {
  const vertex1 = chart1.planets.Vertex;
  if (!vertex1) return;
  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;
    const aspect = calculateAspect(vertex1, planet2);
    if (aspect === 'conjunction') {
      indicators.push({ type: 'vertex', planet1: 'Vertex', planet2: planetName, aspect: 'conjunction', weight: KARMIC_WEIGHTS.vertex, interpretation: `Vertex conjunct ${planetName}: Fated encounter`, theme: 'fated' });
    }
  });
}

function determineKarmicType(indicators: KarmicIndicator[], totalScore: number): KarmicAnalysis['karmicType'] {
  const pastLifeCount = indicators.filter(i => i.theme === 'past_life').length;
  const transformationCount = indicators.filter(i => i.theme === 'transformation').length;
  const fatedCount = indicators.filter(i => i.theme === 'fated').length;
  const growthCount = indicators.filter(i => i.theme === 'soul_growth').length;
  const healingCount = indicators.filter(i => i.theme === 'healing').length;
  if (totalScore >= 100 && pastLifeCount >= 4 && transformationCount >= 3) return 'twin_flame';
  if (pastLifeCount >= 5) return 'completion';
  if (transformationCount >= 4 && totalScore >= 60) return 'catalyst';
  if (growthCount >= 2 || fatedCount >= 2) return 'soul_family';
  if (totalScore >= 40 && growthCount >= 1) return 'soul_family';
  if (totalScore >= 50 && pastLifeCount >= 2) return 'karmic_lesson';
  if (healingCount >= 3) return 'soul_family';
  if (totalScore < 30 && pastLifeCount === 0 && growthCount === 0 && transformationCount === 0) return 'new_contract';
  return 'soul_family';
}

export function calculateKarmicAnalysis(chart1: NatalChart, chart2: NatalChart): KarmicAnalysis {
  const indicators: KarmicIndicator[] = [];
  const dangerFlags: string[] = [];
  const healingOpportunities: string[] = [];

  analyzeSouthNodeConnections(chart1, chart2, indicators);
  analyzeSouthNodeConnections(chart2, chart1, indicators);
  analyzeNorthNodeConnections(chart1, chart2, indicators);
  analyzeNorthNodeConnections(chart2, chart1, indicators);
  analyzeSaturnKarma(chart1, chart2, indicators, dangerFlags);
  analyzeSaturnKarma(chart2, chart1, indicators, dangerFlags);
  analyzePlutoTransformation(chart1, chart2, indicators, dangerFlags);
  analyzePlutoTransformation(chart2, chart1, indicators, dangerFlags);
  analyzeChironHealing(chart1, chart2, indicators, healingOpportunities);
  analyzeChironHealing(chart2, chart1, indicators, healingOpportunities);
  analyzeTwelfthHouseOverlays(chart1, chart2, indicators);
  analyzeTwelfthHouseOverlays(chart2, chart1, indicators);
  analyzeEighthHouseOverlays(chart1, chart2, indicators, dangerFlags);
  analyzeEighthHouseOverlays(chart2, chart1, indicators, dangerFlags);
  analyzeVertexContacts(chart1, chart2, indicators);

  const totalKarmicScore = indicators.reduce((sum, ind) => sum + ind.weight, 0);
  const pastLifeScore = indicators.filter(ind => ind.theme === 'past_life').reduce((sum, ind) => sum + ind.weight, 0);
  const pastLifeProbability = Math.min(100, Math.round((pastLifeScore / 80) * 100));
  const karmicType = determineKarmicType(indicators, totalKarmicScore);

  const purposes = {
    twin_flame: 'Mirror relationship for radical self-awareness and transformation.',
    completion: 'Complete unfinished past-life business.',
    catalyst: 'Rapid growth through intensity.',
    soul_family: 'Supportive soul connection for mutual growth.',
    karmic_lesson: 'Specific karmic lesson to master.',
    new_contract: 'New soul agreement without heavy karma.'
  };

  const approaches = {
    twin_flame: 'Requires both in active healing. Therapy and boundaries essential.',
    completion: 'Focus on resolution and release.',
    catalyst: 'Embrace transformation but protect yourself.',
    soul_family: 'Nurture this precious connection.',
    karmic_lesson: 'Stay conscious of the lesson.',
    new_contract: 'Build healthy patterns from scratch.'
  };

  const timelines = {
    twin_flame: { likely_duration: '7-14 years', key_lessons: ['Self-love', 'Boundaries'], completion_indicators: ['Drama decreases', 'Peace emerges'] },
    completion: { likely_duration: '6 months to 3 years', key_lessons: ['Forgiveness', 'Release'], completion_indicators: ['Resolution feeling', 'Natural drift'] },
    catalyst: { likely_duration: '3 months to 2 years', key_lessons: ['Rapid transformation'], completion_indicators: ['Major life change'] },
    soul_family: { likely_duration: 'Potentially lifetime', key_lessons: ['Unconditional love'], completion_indicators: ['Continues nourishing'] },
    karmic_lesson: { likely_duration: '1-5 years', key_lessons: ['Wound healing'], completion_indicators: ['Pattern no longer triggers'] },
    new_contract: { likely_duration: 'Variable', key_lessons: ['Present-moment relating'], completion_indicators: ['Based on choice'] }
  };

  let approach = dangerFlags.length >= 3 ? '⚠️ HIGH ALERT: Multiple danger indicators. ' : dangerFlags.length > 0 ? '⚠️ CAUTION: ' : '';
  approach += approaches[karmicType];

  return {
    totalKarmicScore,
    pastLifeProbability,
    karmicType,
    indicators,
    dangerFlags,
    healingOpportunities,
    soulPurpose: purposes[karmicType],
    recommendedApproach: approach,
    timeline: timelines[karmicType]
  };
}

export default calculateKarmicAnalysis;
