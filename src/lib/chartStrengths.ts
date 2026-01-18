// ============================================================================
// CHART STRENGTHS & SUPPORTS
// Synthesize planetary conditions into personalized strength narratives
// Based on traditional techniques: sect, benefics/malefics, visibility, ease
// ============================================================================

import { ChartPlanet, ChartAspect, getSignRuler } from './chartDecoderLogic';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateSect, ChartSect, SectData } from './birthConditions';
import { 
  analyzeAllPlanetaryConditions, 
  calculatePlanetaryCondition,
  PlanetaryCondition 
} from './planetaryCondition';
import { SIGN_PROPERTIES } from './planetDignities';

// ============================================================================
// TYPES
// ============================================================================

export interface SectLightAnalysis {
  planet: 'Sun' | 'Moon';
  sign: string;
  house: number | null;
  condition: PlanetaryCondition | null;
  isWellPlaced: boolean;
  interpretation: string;
  guidance: string;
}

export interface BeneficAnalysis {
  planet: 'Jupiter' | 'Venus';
  sign: string;
  house: number | null;
  condition: PlanetaryCondition | null;
  isWellPlaced: boolean;
  isSectBenefic: boolean;
  housesRuled: number[];
  easeZones: string[];
  interpretation: string;
}

export interface MaleficAnalysis {
  planet: 'Mars' | 'Saturn';
  sign: string;
  house: number | null;
  condition: PlanetaryCondition | null;
  isSectMalefic: boolean;
  interpretation: string;
  missionSupport: string;
}

export interface ContentmentIndicator {
  planet: string;
  area: string;
  score: number;
  isSupported: boolean;
  interpretation: string;
}

export interface ChartStrengthsAnalysis {
  // The Guiding Light
  sectLight: SectLightAnalysis;
  
  // The Helpers
  sectBenefic: BeneficAnalysis;
  outOfSectBenefic: BeneficAnalysis;
  
  // The Disciplinarians
  sectMalefic: MaleficAnalysis;
  outOfSectMalefic: MaleficAnalysis;
  
  // Resources
  wellPlacedPlanets: PlanetaryCondition[];
  areasOfEase: { house: number; ruler: string; reason: string }[];
  
  // Contentment
  contentment: {
    venus: ContentmentIndicator;
    jupiter: ContentmentIndicator;
    moon: ContentmentIndicator;
    overall: string;
  };
  
  // Summary
  summary: string;
}

// ============================================================================
// HOUSE TOPICS
// ============================================================================

const HOUSE_TOPICS: Record<number, string> = {
  1: 'identity, self-image, and first impressions',
  2: 'money, possessions, and self-worth',
  3: 'communication, learning, and daily connections',
  4: 'home, family, and emotional foundations',
  5: 'creativity, romance, and self-expression',
  6: 'work, health, and daily routines',
  7: 'partnerships and committed relationships',
  8: 'shared resources, intimacy, and transformation',
  9: 'philosophy, travel, and higher learning',
  10: 'career, reputation, and public standing',
  11: 'friendships, groups, and future visions',
  12: 'spirituality, solitude, and the unconscious'
};

// ============================================================================
// ANALYSIS FUNCTIONS
// ============================================================================

/**
 * Find which houses a planet rules based on its sign rulerships
 */
function findHousesRuled(
  planetName: string,
  houseCusps: Record<number, { sign: string; degree: number }>,
  useTraditional: boolean = true
): number[] {
  const housesRuled: number[] = [];
  
  for (let h = 1; h <= 12; h++) {
    const cusp = houseCusps[h];
    if (cusp) {
      const ruler = getSignRuler(cusp.sign, useTraditional);
      if (ruler === planetName) {
        housesRuled.push(h);
      }
    }
  }
  
  return housesRuled;
}

/**
 * Analyze the Sect Light (Sun for day charts, Moon for night charts)
 */
function analyzeSectLight(
  sectData: SectData,
  planets: ChartPlanet[],
  aspects: ChartAspect[],
  useTraditional: boolean
): SectLightAnalysis {
  const sectLightName = sectData.sect === 'Day' ? 'Sun' : 'Moon';
  const sectLight = planets.find(p => p.name === sectLightName);
  
  if (!sectLight) {
    return {
      planet: sectLightName as 'Sun' | 'Moon',
      sign: 'Unknown',
      house: null,
      condition: null,
      isWellPlaced: false,
      interpretation: `Your ${sectLightName} guides your path.`,
      guidance: 'Trust your inner compass.'
    };
  }
  
  const condition = calculatePlanetaryCondition(sectLight, aspects, sectData.sect, useTraditional);
  const isWellPlaced = condition.isWellPlaced;
  
  let interpretation = '';
  let guidance = '';
  
  if (sectData.sect === 'Day') {
    interpretation = isWellPlaced
      ? `Your Sun is your guiding light and it's well-placed. Your conscious will and sense of purpose flow naturally. You thrive when you lead, take visible action, and express your identity boldly.`
      : `Your Sun is your guiding light, though it faces some challenges. Your path to purpose may require more conscious effort, but this builds authentic rather than inherited confidence.`;
    
    guidance = `Trust your conscious will. You grow through visibility and taking initiative. When making decisions, ask: "Does this align with who I'm becoming?"`;
  } else {
    interpretation = isWellPlaced
      ? `Your Moon is your guiding light and it's well-placed. Your instincts and emotional intelligence are reliable guides. You thrive when you trust your feelings, work with natural rhythms, and allow things to unfold.`
      : `Your Moon is your guiding light, though it faces some challenges. Your emotional nature may need more conscious tending, but this develops profound emotional wisdom.`;
    
    guidance = `Trust your instincts. You grow through receptivity and intuition. When making decisions, ask: "Does this feel right in my body?"`;
  }
  
  return {
    planet: sectLightName as 'Sun' | 'Moon',
    sign: sectLight.sign,
    house: sectLight.house,
    condition,
    isWellPlaced,
    interpretation,
    guidance
  };
}

/**
 * Analyze a benefic planet (Jupiter or Venus)
 */
function analyzeBenefic(
  planetName: 'Jupiter' | 'Venus',
  isSectBenefic: boolean,
  planets: ChartPlanet[],
  aspects: ChartAspect[],
  sect: ChartSect,
  houseCusps: Record<number, { sign: string; degree: number }>,
  useTraditional: boolean
): BeneficAnalysis {
  const planet = planets.find(p => p.name === planetName);
  
  if (!planet) {
    return {
      planet: planetName,
      sign: 'Unknown',
      house: null,
      condition: null,
      isWellPlaced: false,
      isSectBenefic,
      housesRuled: [],
      easeZones: [],
      interpretation: `${planetName} brings ${planetName === 'Jupiter' ? 'expansion and luck' : 'love and harmony'}.`
    };
  }
  
  const condition = calculatePlanetaryCondition(planet, aspects, sect, useTraditional);
  const housesRuled = findHousesRuled(planetName, houseCusps, useTraditional);
  
  // Ease zones are where this benefic rules and occupies
  const easeZones: string[] = [];
  if (planet.house) {
    easeZones.push(`${HOUSE_TOPICS[planet.house] || `house ${planet.house}`} (where ${planetName} lives)`);
  }
  housesRuled.forEach(h => {
    if (h !== planet.house) {
      easeZones.push(`${HOUSE_TOPICS[h] || `house ${h}`} (ruled by ${planetName})`);
    }
  });
  
  let interpretation = '';
  
  if (planetName === 'Jupiter') {
    if (isSectBenefic) {
      interpretation = condition.isWellPlaced
        ? `Jupiter is your SECT BENEFIC — your primary source of luck and expansion, and it's well-placed! Growth, opportunity, and meaning flow naturally to you, especially in ${planet.house ? HOUSE_TOPICS[planet.house] : 'the area it occupies'}.`
        : `Jupiter is your SECT BENEFIC — your primary helper, though it faces some challenges. You may need to work more consciously for expansion, but this builds earned wisdom rather than easy luck.`;
    } else {
      interpretation = condition.isWellPlaced
        ? `Jupiter is your out-of-sect benefic but well-placed. Its gifts are available when you consciously reach for growth and meaning.`
        : `Jupiter is out of sect — expansion may require more internal work. Growth comes through reflection and philosophy rather than external opportunity.`;
    }
  } else {
    if (isSectBenefic) {
      interpretation = condition.isWellPlaced
        ? `Venus is your SECT BENEFIC — your primary source of love, beauty, and ease, and she's well-placed! Relationships, pleasure, and values flow naturally, especially in ${planet.house ? HOUSE_TOPICS[planet.house] : 'the area she occupies'}.`
        : `Venus is your SECT BENEFIC — your primary helper in love and pleasure, though she faces some challenges. You may need to work more consciously for harmony, but this builds authentic taste and genuine connection.`;
    } else {
      interpretation = condition.isWellPlaced
        ? `Venus is your out-of-sect benefic but well-placed. Love and pleasure are available when you consciously cultivate beauty and connection.`
        : `Venus is out of sect — love and harmony may require more conscious effort. Relationships grow through deliberate choice rather than easy attraction.`;
    }
  }
  
  return {
    planet: planetName,
    sign: planet.sign,
    house: planet.house,
    condition,
    isWellPlaced: condition.isWellPlaced,
    isSectBenefic,
    housesRuled,
    easeZones,
    interpretation
  };
}

/**
 * Analyze a malefic planet (Mars or Saturn)
 */
function analyzeMalefic(
  planetName: 'Mars' | 'Saturn',
  isSectMalefic: boolean,
  planets: ChartPlanet[],
  aspects: ChartAspect[],
  sect: ChartSect,
  useTraditional: boolean
): MaleficAnalysis {
  const planet = planets.find(p => p.name === planetName);
  
  if (!planet) {
    return {
      planet: planetName,
      sign: 'Unknown',
      house: null,
      condition: null,
      isSectMalefic,
      interpretation: `${planetName} provides ${planetName === 'Mars' ? 'drive and courage' : 'discipline and structure'}.`,
      missionSupport: ''
    };
  }
  
  const condition = calculatePlanetaryCondition(planet, aspects, sect, useTraditional);
  
  let interpretation = '';
  let missionSupport = '';
  
  if (planetName === 'Saturn') {
    if (isSectMalefic) {
      interpretation = `Saturn is your SECT MALEFIC — its challenges are more manageable for you. Discipline, responsibility, and structure feel purposeful rather than oppressive. You can work with limitations rather than against them.`;
      missionSupport = `Saturn supports your mission through patience, long-term thinking, and earned authority. Your capacity for discipline is a genuine strength.`;
    } else {
      interpretation = `Saturn is out of sect — its restrictions may feel heavier. You may struggle more with authority, time pressure, and self-criticism. The work is making peace with limitation rather than fighting it.`;
      missionSupport = `Saturn still supports your mission, but requires more conscious engagement. Structure yourself before life structures you.`;
    }
  } else {
    if (isSectMalefic) {
      interpretation = `Mars is your SECT MALEFIC — its fire is more controllable for you. Your drive, anger, and courage have productive outlets. You can assert yourself without destruction.`;
      missionSupport = `Mars supports your mission through courage, initiative, and healthy competition. Your capacity for action is a genuine strength.`;
    } else {
      interpretation = `Mars is out of sect — its heat can burn hotter. Watch for impulsiveness, anger that surprises you, or overexertion. The work is channeling intensity rather than being consumed by it.`;
      missionSupport = `Mars still supports your mission, but requires conscious channeling. Physical outlets, healthy competition, and strategic assertion help.`;
    }
  }
  
  return {
    planet: planetName,
    sign: planet.sign,
    house: planet.house,
    condition,
    isSectMalefic,
    interpretation,
    missionSupport
  };
}

/**
 * Analyze contentment indicators (Venus, Jupiter, Moon)
 */
function analyzeContentment(
  planets: ChartPlanet[],
  aspects: ChartAspect[],
  sect: ChartSect,
  useTraditional: boolean
): { venus: ContentmentIndicator; jupiter: ContentmentIndicator; moon: ContentmentIndicator; overall: string } {
  const venus = planets.find(p => p.name === 'Venus');
  const jupiter = planets.find(p => p.name === 'Jupiter');
  const moon = planets.find(p => p.name === 'Moon');
  
  const venusCondition = venus ? calculatePlanetaryCondition(venus, aspects, sect, useTraditional) : null;
  const jupiterCondition = jupiter ? calculatePlanetaryCondition(jupiter, aspects, sect, useTraditional) : null;
  const moonCondition = moon ? calculatePlanetaryCondition(moon, aspects, sect, useTraditional) : null;
  
  const venusIndicator: ContentmentIndicator = {
    planet: 'Venus',
    area: 'Relationship Contentment',
    score: venusCondition?.totalScore || 0,
    isSupported: venusCondition?.isWellPlaced || false,
    interpretation: venusCondition?.isWellPlaced
      ? 'Love, pleasure, and beauty tend to flow naturally. Relationships support your wellbeing.'
      : 'Love and harmony require conscious cultivation. Beauty grows through intentional practice.'
  };
  
  const jupiterIndicator: ContentmentIndicator = {
    planet: 'Jupiter',
    area: 'Growth & Abundance',
    score: jupiterCondition?.totalScore || 0,
    isSupported: jupiterCondition?.isWellPlaced || false,
    interpretation: jupiterCondition?.isWellPlaced
      ? 'Expansion and opportunity come readily. Your faith and optimism are well-founded.'
      : 'Growth requires more internal work. Meaning comes through seeking rather than finding.'
  };
  
  const moonIndicator: ContentmentIndicator = {
    planet: 'Moon',
    area: 'Emotional Contentment',
    score: moonCondition?.totalScore || 0,
    isSupported: moonCondition?.isWellPlaced || false,
    interpretation: moonCondition?.isWellPlaced
      ? 'Your emotional life tends to feel nourishing. Security and comfort come naturally.'
      : 'Emotional security requires conscious tending. You build your own sense of home.'
  };
  
  // Overall contentment summary
  const supportedCount = [venusIndicator, jupiterIndicator, moonIndicator].filter(i => i.isSupported).length;
  let overall = '';
  
  if (supportedCount === 3) {
    overall = 'Your chart shows strong natural contentment indicators. Emotional fulfillment, loving relationships, and meaningful growth are all supported.';
  } else if (supportedCount === 2) {
    overall = 'You have solid contentment foundations, with natural ease in some areas and growth edges in others.';
  } else if (supportedCount === 1) {
    overall = 'Contentment in your chart comes through conscious work in most areas, with one natural strength to anchor you.';
  } else {
    overall = 'Your chart emphasizes earned contentment — the kind that comes through conscious practice and becomes unshakeable.';
  }
  
  return { venus: venusIndicator, jupiter: jupiterIndicator, moon: moonIndicator, overall };
}

/**
 * Find areas of ease in the chart (houses ruled by benefics or well-placed planets)
 */
function findAreasOfEase(
  wellPlacedPlanets: PlanetaryCondition[],
  sectBenefic: BeneficAnalysis,
  houseCusps: Record<number, { sign: string; degree: number }>,
  useTraditional: boolean
): { house: number; ruler: string; reason: string }[] {
  const areasOfEase: { house: number; ruler: string; reason: string }[] = [];
  
  // Houses where well-placed planets reside
  for (const condition of wellPlacedPlanets) {
    if (condition.house) {
      areasOfEase.push({
        house: condition.house,
        ruler: condition.planet,
        reason: `${condition.planet} is well-placed here (${condition.qualityRating})`
      });
    }
  }
  
  // Houses ruled by the sect benefic
  if (sectBenefic.condition?.isWellPlaced) {
    for (const h of sectBenefic.housesRuled) {
      if (!areasOfEase.find(a => a.house === h)) {
        areasOfEase.push({
          house: h,
          ruler: sectBenefic.planet,
          reason: `Ruled by your well-placed sect benefic (${sectBenefic.planet})`
        });
      }
    }
  }
  
  return areasOfEase.slice(0, 5); // Top 5 areas
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

/**
 * Perform complete chart strengths analysis
 */
export function analyzeChartStrengths(
  planets: ChartPlanet[],
  aspects: ChartAspect[],
  chart: NatalChart,
  useTraditional: boolean = true
): ChartStrengthsAnalysis {
  const sectData = calculateSect(chart);
  const sect = sectData.sect;
  
  // Build house cusps from chart
  const houseCusps: Record<number, { sign: string; degree: number }> = {};
  if (chart.houseCusps) {
    for (let i = 1; i <= 12; i++) {
      const key = `house${i}` as keyof typeof chart.houseCusps;
      if (chart.houseCusps[key]) {
        houseCusps[i] = chart.houseCusps[key];
      }
    }
  }
  
  // Analyze sect light
  const sectLight = analyzeSectLight(sectData, planets, aspects, useTraditional);
  
  // Analyze benefics
  const jupiterIsSectBenefic = sect === 'Day';
  const sectBenefic = analyzeBenefic(
    jupiterIsSectBenefic ? 'Jupiter' : 'Venus',
    true,
    planets, aspects, sect, houseCusps, useTraditional
  );
  const outOfSectBenefic = analyzeBenefic(
    jupiterIsSectBenefic ? 'Venus' : 'Jupiter',
    false,
    planets, aspects, sect, houseCusps, useTraditional
  );
  
  // Analyze malefics
  const saturnIsSectMalefic = sect === 'Day';
  const sectMalefic = analyzeMalefic(
    saturnIsSectMalefic ? 'Saturn' : 'Mars',
    true,
    planets, aspects, sect, useTraditional
  );
  const outOfSectMalefic = analyzeMalefic(
    saturnIsSectMalefic ? 'Mars' : 'Saturn',
    false,
    planets, aspects, sect, useTraditional
  );
  
  // Get all planetary conditions
  const allConditions = analyzeAllPlanetaryConditions(planets, aspects, chart, useTraditional);
  const wellPlacedPlanets = allConditions.filter(c => c.isWellPlaced);
  
  // Find areas of ease
  const areasOfEase = findAreasOfEase(wellPlacedPlanets, sectBenefic, houseCusps, useTraditional);
  
  // Analyze contentment
  const contentment = analyzeContentment(planets, aspects, sect, useTraditional);
  
  // Generate summary
  const summary = generateStrengthsSummary(
    sectLight,
    sectBenefic,
    wellPlacedPlanets,
    areasOfEase,
    contentment
  );
  
  return {
    sectLight,
    sectBenefic,
    outOfSectBenefic,
    sectMalefic,
    outOfSectMalefic,
    wellPlacedPlanets,
    areasOfEase,
    contentment,
    summary
  };
}

/**
 * Generate a prose summary of chart strengths
 */
function generateStrengthsSummary(
  sectLight: SectLightAnalysis,
  sectBenefic: BeneficAnalysis,
  wellPlacedPlanets: PlanetaryCondition[],
  areasOfEase: { house: number; ruler: string; reason: string }[],
  contentment: { venus: ContentmentIndicator; jupiter: ContentmentIndicator; moon: ContentmentIndicator; overall: string }
): string {
  const parts: string[] = [];
  
  // Guiding light
  parts.push(`Your ${sectLight.planet} guides your path${sectLight.isWellPlaced ? ' from a place of strength' : ''}.`);
  
  // Benefic
  if (sectBenefic.isWellPlaced) {
    parts.push(`${sectBenefic.planet}, your sect benefic, is well-placed — luck and ease flow naturally${sectBenefic.easeZones.length > 0 ? `, especially in ${sectBenefic.easeZones[0]}` : ''}.`);
  }
  
  // Well-placed planets
  if (wellPlacedPlanets.length > 0) {
    const names = wellPlacedPlanets.slice(0, 3).map(p => p.planet).join(', ');
    parts.push(`Your strongest resources: ${names}.`);
  }
  
  // Areas of ease
  if (areasOfEase.length > 0) {
    const areas = areasOfEase.slice(0, 2).map(a => HOUSE_TOPICS[a.house] || `house ${a.house}`).join(' and ');
    parts.push(`Life tends to help you most in ${areas}.`);
  }
  
  return parts.join(' ');
}
