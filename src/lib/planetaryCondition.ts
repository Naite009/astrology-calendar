// ============================================================================
// PLANETARY CONDITION SCORING
// Traditional astrological techniques for assessing planetary strength and support
// ============================================================================

import { ChartPlanet, ChartAspect, computeDignity, getSignRuler, DignityType } from './chartDecoderLogic';
import { SIGN_PROPERTIES, TRIPLICITY_RULERS, DECAN_RULERS, EGYPTIAN_TERMS, HOUSE_TYPES } from './planetDignities';
import { NatalChart } from '@/hooks/useNatalChart';
import { calculateSect, ChartSect } from './birthConditions';

// ============================================================================
// TYPES
// ============================================================================

export interface PlanetaryCondition {
  planet: string;
  sign: string;
  house: number | null;
  
  // Scores
  essentialDignityScore: number;
  accidentalDignityScore: number;
  sectScore: number;
  aspectScore: number;
  totalScore: number;
  
  // Ratings
  qualityRating: 'Excellent' | 'Good' | 'Moderate' | 'Challenged' | 'Difficult';
  visibility: 'Highly Visible' | 'Stable' | 'Behind the Scenes';
  isWellPlaced: boolean;
  
  // Details
  essentialDignity: DignityType;
  hasTriplicityDignity: boolean;
  hasTermDignity: boolean;
  hasDecanDignity: boolean;
  isInSect: boolean;
  
  // Interpretive
  strengthFactors: string[];
  challengeFactors: string[];
  traditionalInterpretation: string;
}

export interface ChartStrengthsSummary {
  sectLight: {
    planet: string;
    isWellPlaced: boolean;
    condition: PlanetaryCondition;
    interpretation: string;
  };
  sectBenefic: {
    planet: string;
    isWellPlaced: boolean;
    condition: PlanetaryCondition;
    interpretation: string;
    easeZones: string[];
  };
  outOfSectBenefic: {
    planet: string;
    condition: PlanetaryCondition;
    interpretation: string;
  };
  sectMalefic: {
    planet: string;
    condition: PlanetaryCondition;
    interpretation: string;
  };
  outOfSectMalefic: {
    planet: string;
    condition: PlanetaryCondition;
    interpretation: string;
  };
  wellPlacedPlanets: PlanetaryCondition[];
  areasOfEase: { house: number; reason: string }[];
  contentmentIndicators: {
    venus: { score: number; interpretation: string };
    jupiter: { score: number; interpretation: string };
    moon: { score: number; interpretation: string };
  };
}

// ============================================================================
// ESSENTIAL DIGNITY CALCULATION
// ============================================================================

/**
 * Calculate essential dignity score (traditional 5-tier system)
 * Rulership: +5, Exaltation: +4, Triplicity: +3, Terms: +2, Decan: +1
 * Detriment: -2, Fall: -4
 */
export function calculateEssentialDignityScore(
  planetName: string,
  sign: string,
  degree: number,
  sect: ChartSect,
  useTraditional: boolean = true
): { score: number; details: { dignity: DignityType; hasTriplicity: boolean; hasTerm: boolean; hasDecan: boolean } } {
  let score = 0;
  
  // Primary dignity
  const dignity = computeDignity(planetName, sign, useTraditional);
  
  switch (dignity) {
    case 'rulership': score += 5; break;
    case 'exaltation': score += 4; break;
    case 'detriment': score -= 2; break;
    case 'fall': score -= 4; break;
    // peregrine adds 0
  }
  
  // Check triplicity (by sect)
  const signElement = SIGN_PROPERTIES[sign]?.element;
  let hasTriplicity = false;
  if (signElement && TRIPLICITY_RULERS[signElement]) {
    const triplicityRulers = TRIPLICITY_RULERS[signElement];
    if (sect === 'Day' && triplicityRulers.day === planetName) {
      score += 3;
      hasTriplicity = true;
    } else if (sect === 'Night' && triplicityRulers.night === planetName) {
      score += 3;
      hasTriplicity = true;
    } else if (triplicityRulers.participating === planetName) {
      score += 1; // Participating triplicity ruler gets less
      hasTriplicity = true;
    }
  }
  
  // Check terms (bounds)
  let hasTerm = false;
  if (EGYPTIAN_TERMS[sign]) {
    for (const term of EGYPTIAN_TERMS[sign]) {
      if (degree <= term.end && term.ruler === planetName) {
        score += 2;
        hasTerm = true;
        break;
      }
    }
  }
  
  // Check decan
  let hasDecan = false;
  if (DECAN_RULERS[sign]) {
    const decanIndex = Math.min(Math.floor(degree / 10), 2);
    if (DECAN_RULERS[sign][decanIndex] === planetName) {
      score += 1;
      hasDecan = true;
    }
  }
  
  return {
    score,
    details: { dignity, hasTriplicity, hasTerm, hasDecan }
  };
}

// ============================================================================
// ACCIDENTAL DIGNITY CALCULATION
// ============================================================================

/**
 * Calculate accidental dignity score based on house placement and motion
 * Angular: +3, Succedent: +2, Cadent: +1
 * Direct: +1, Retrograde: -1 (but not weakness, internalized)
 */
export function calculateAccidentalDignityScore(
  house: number | null,
  isRetrograde: boolean
): { score: number; visibility: 'Highly Visible' | 'Stable' | 'Behind the Scenes' } {
  let score = 0;
  let visibility: 'Highly Visible' | 'Stable' | 'Behind the Scenes' = 'Stable';
  
  if (house) {
    const houseType = HOUSE_TYPES[house];
    switch (houseType) {
      case 'Angular':
        score += 3;
        visibility = 'Highly Visible';
        break;
      case 'Succedent':
        score += 2;
        visibility = 'Stable';
        break;
      case 'Cadent':
        score += 1;
        visibility = 'Behind the Scenes';
        break;
    }
  }
  
  // Motion
  if (isRetrograde) {
    score -= 1;
  } else {
    score += 1;
  }
  
  return { score, visibility };
}

// ============================================================================
// SECT CONDITION
// ============================================================================

const DAY_SECT_PLANETS = ['Sun', 'Jupiter', 'Saturn'];
const NIGHT_SECT_PLANETS = ['Moon', 'Venus', 'Mars'];

/**
 * Calculate sect condition score
 * In sect: +2, Out of sect: 0
 */
export function calculateSectCondition(
  planetName: string,
  sect: ChartSect
): { score: number; isInSect: boolean } {
  // Mercury is neutral
  if (planetName === 'Mercury') {
    return { score: 1, isInSect: true };
  }
  
  // Outer planets don't have sect
  if (['Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'Ascendant', 'Midheaven'].includes(planetName)) {
    return { score: 0, isInSect: true };
  }
  
  const isInSect = sect === 'Day' 
    ? DAY_SECT_PLANETS.includes(planetName)
    : NIGHT_SECT_PLANETS.includes(planetName);
  
  return {
    score: isInSect ? 2 : 0,
    isInSect
  };
}

// ============================================================================
// ASPECT SCORE
// ============================================================================

const BENEFIC_PLANETS = ['Venus', 'Jupiter'];
const MALEFIC_PLANETS = ['Mars', 'Saturn'];

/**
 * Calculate aspect score based on aspects to benefics/malefics
 */
export function calculateAspectScore(
  planetName: string,
  aspects: ChartAspect[]
): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  
  const planetAspects = aspects.filter(
    a => a.planet1 === planetName || a.planet2 === planetName
  );
  
  for (const aspect of planetAspects) {
    const otherPlanet = aspect.planet1 === planetName ? aspect.planet2 : aspect.planet1;
    const isBenefic = BENEFIC_PLANETS.includes(otherPlanet);
    const isMalefic = MALEFIC_PLANETS.includes(otherPlanet);
    
    if (isBenefic) {
      switch (aspect.aspectType) {
        case 'trine':
        case 'sextile':
          score += 2;
          factors.push(`${aspect.aspectType} from ${otherPlanet} — support and ease`);
          break;
        case 'conjunction':
          score += 1;
          factors.push(`Conjunct ${otherPlanet} — beneficial energy merged`);
          break;
      }
    }
    
    if (isMalefic) {
      switch (aspect.aspectType) {
        case 'square':
        case 'opposition':
          score -= 2;
          factors.push(`${aspect.aspectType} from ${otherPlanet} — requires conscious work`);
          break;
        case 'conjunction':
          score -= 1;
          factors.push(`Conjunct ${otherPlanet} — intensity to master`);
          break;
        case 'trine':
        case 'sextile':
          score += 1;
          factors.push(`${aspect.aspectType} from ${otherPlanet} — controlled discipline`);
          break;
      }
    }
  }
  
  return { score, factors };
}

// ============================================================================
// FULL PLANETARY CONDITION
// ============================================================================

/**
 * Calculate complete planetary condition for a single planet
 */
export function calculatePlanetaryCondition(
  planet: ChartPlanet,
  aspects: ChartAspect[],
  sect: ChartSect,
  useTraditional: boolean = true
): PlanetaryCondition {
  // Essential dignity
  const essential = calculateEssentialDignityScore(
    planet.name,
    planet.sign,
    planet.degree,
    sect,
    useTraditional
  );
  
  // Accidental dignity
  const accidental = calculateAccidentalDignityScore(
    planet.house,
    planet.retrograde
  );
  
  // Sect condition
  const sectCondition = calculateSectCondition(planet.name, sect);
  
  // Aspect score
  const aspectResult = calculateAspectScore(planet.name, aspects);
  
  // Total score
  const totalScore = essential.score + accidental.score + sectCondition.score + aspectResult.score;
  
  // Quality rating
  let qualityRating: PlanetaryCondition['qualityRating'];
  if (totalScore >= 8) qualityRating = 'Excellent';
  else if (totalScore >= 5) qualityRating = 'Good';
  else if (totalScore >= 2) qualityRating = 'Moderate';
  else if (totalScore >= -2) qualityRating = 'Challenged';
  else qualityRating = 'Difficult';
  
  // Strength factors
  const strengthFactors: string[] = [];
  if (essential.details.dignity === 'rulership') strengthFactors.push('In its home sign — natural expression');
  if (essential.details.dignity === 'exaltation') strengthFactors.push('Exalted — elevated, idealized expression');
  if (essential.details.hasTriplicity) strengthFactors.push('Has triplicity dignity — supported by element');
  if (essential.details.hasTerm) strengthFactors.push('In its own terms — refined expression');
  if (essential.details.hasDecan) strengthFactors.push('In its own decan — face visible');
  if (accidental.visibility === 'Highly Visible') strengthFactors.push('In angular house — prominent, active');
  if (sectCondition.isInSect) strengthFactors.push('In sect — works with your chart\'s mode');
  strengthFactors.push(...aspectResult.factors.filter(f => !f.includes('requires') && !f.includes('intensity')));
  
  // Challenge factors
  const challengeFactors: string[] = [];
  if (essential.details.dignity === 'detriment') challengeFactors.push('In detriment — requires conscious strategy');
  if (essential.details.dignity === 'fall') challengeFactors.push('In fall — confidence earned through practice');
  if (planet.retrograde) challengeFactors.push('Retrograde — energy internalized, processing mode');
  if (!sectCondition.isInSect && !['Mercury', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode', 'Ascendant', 'Midheaven'].includes(planet.name)) {
    challengeFactors.push('Out of sect — requires more conscious management');
  }
  challengeFactors.push(...aspectResult.factors.filter(f => f.includes('requires') || f.includes('intensity')));
  
  // Traditional interpretation
  const interpretation = generateTraditionalInterpretation(
    planet.name,
    qualityRating,
    strengthFactors,
    challengeFactors,
    accidental.visibility,
    sectCondition.isInSect
  );
  
  return {
    planet: planet.name,
    sign: planet.sign,
    house: planet.house,
    essentialDignityScore: essential.score,
    accidentalDignityScore: accidental.score,
    sectScore: sectCondition.score,
    aspectScore: aspectResult.score,
    totalScore,
    qualityRating,
    visibility: accidental.visibility,
    isWellPlaced: totalScore >= 5,
    essentialDignity: essential.details.dignity,
    hasTriplicityDignity: essential.details.hasTriplicity,
    hasTermDignity: essential.details.hasTerm,
    hasDecanDignity: essential.details.hasDecan,
    isInSect: sectCondition.isInSect,
    strengthFactors,
    challengeFactors,
    traditionalInterpretation: interpretation
  };
}

/**
 * Generate a narrative interpretation based on condition
 */
function generateTraditionalInterpretation(
  planetName: string,
  quality: PlanetaryCondition['qualityRating'],
  strengths: string[],
  challenges: string[],
  visibility: PlanetaryCondition['visibility'],
  isInSect: boolean
): string {
  const planetNatures: Record<string, string> = {
    Sun: 'vitality and purpose',
    Moon: 'emotional needs and instincts',
    Mercury: 'thinking and communication',
    Venus: 'love and values',
    Mars: 'drive and assertion',
    Jupiter: 'growth and opportunity',
    Saturn: 'discipline and mastery'
  };
  
  const nature = planetNatures[planetName] || `${planetName}'s energy`;
  
  let interpretation = '';
  
  switch (quality) {
    case 'Excellent':
      interpretation = `Your ${planetName} is exceptionally well-placed. ${nature.charAt(0).toUpperCase() + nature.slice(1)} flows naturally and consistently for you. This is a genuine strength — a resource you can rely on.`;
      break;
    case 'Good':
      interpretation = `Your ${planetName} is well-supported. ${nature.charAt(0).toUpperCase() + nature.slice(1)} comes fairly easily, though it may need occasional conscious direction.`;
      break;
    case 'Moderate':
      interpretation = `Your ${planetName} operates in neutral territory. ${nature.charAt(0).toUpperCase() + nature.slice(1)} expresses based on how you consciously engage with it.`;
      break;
    case 'Challenged':
      interpretation = `Your ${planetName} requires conscious effort. ${nature.charAt(0).toUpperCase() + nature.slice(1)} may feel like work rather than flow — but mastery is available through practice.`;
      break;
    case 'Difficult':
      interpretation = `Your ${planetName} faces multiple challenges. ${nature.charAt(0).toUpperCase() + nature.slice(1)} may feel blocked or difficult — but this is where you develop hard-won wisdom others may never understand.`;
      break;
  }
  
  if (visibility === 'Highly Visible') {
    interpretation += ' Others see and respond to this energy in you.';
  } else if (visibility === 'Behind the Scenes') {
    interpretation += ' This operates more privately — you feel it more than others see it.';
  }
  
  return interpretation;
}

// ============================================================================
// ANALYZE ALL PLANETS
// ============================================================================

/**
 * Calculate conditions for all planets in a chart
 */
export function analyzeAllPlanetaryConditions(
  planets: ChartPlanet[],
  aspects: ChartAspect[],
  chart: NatalChart,
  useTraditional: boolean = true
): PlanetaryCondition[] {
  const sectData = calculateSect(chart);
  const sect = sectData.sect;
  
  return planets
    .filter(p => !['Ascendant', 'Midheaven', 'NorthNode', 'Chiron'].includes(p.name))
    .map(planet => calculatePlanetaryCondition(planet, aspects, sect, useTraditional))
    .sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Get the well-placed planets (score >= 5)
 */
export function getWellPlacedPlanets(conditions: PlanetaryCondition[]): PlanetaryCondition[] {
  return conditions.filter(c => c.isWellPlaced);
}

/**
 * Get the challenged planets (score < 0)
 */
export function getChallengedPlanets(conditions: PlanetaryCondition[]): PlanetaryCondition[] {
  return conditions.filter(c => c.totalScore < 0);
}
