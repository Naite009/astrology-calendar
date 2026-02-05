/**
 * Grounded Narrative Analysis Engine v2.0
 * Comprehensive analysis of natal chart signals including:
 * - Proper aspect detection with orbs
 * - House placements for all planets
 * - Angular emphasis
 * - Planetary conjunctions and configurations
 * - Out-of-sign aspects
 */

import { NatalChart, NatalPlanetPosition, HouseCusp } from '@/hooks/useNatalChart';

// Types for the analysis engine
export interface OperatingModeScores {
  visibility: number;
  functionality: number;
  expressive: number;
  contained: number;
  relational: number;
  selfDirected: number;
}

export interface PressurePoint {
  type: 'anaretic' | 'threshold' | 'retrograde' | 'hard_aspect' | 'conjunction' | 'stellium' | 'saturn_pattern' | 'angular_planet' | 'house_placement' | 'asc_ruler' | 'out_of_sign';
  planet?: string;
  description: string;
  weight: number;
  details: string;
}

export interface AbsenceSignals {
  missingElements: string[];
  missingModalities: string[];
  fewAngularPlanets: boolean;
  angularPlanetCount: number;
  fewOuterPersonalLinks: boolean;
}

export interface PlanetHouseInfo {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  isAngular: boolean;
  isRetrograde: boolean;
}

export interface NatalAspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
  isApplying: boolean;
  isOutOfSign: boolean;
}

export interface MidheavenAnalysis {
  sign: string;
  degree: number;
  ruler: string;
  rulerSign: string;
  rulerHouse: number;
  rulerIsAngular: boolean;
  rulerIsRetrograde: boolean;
  tenthHousePlanets: string[];
  mcAspects: NatalAspect[];
  careerThemes: string[];
}

export interface SignalsData {
  operatingMode: OperatingModeScores;
  pressurePointsRanked: PressurePoint[];
  absenceSignals: AbsenceSignals;
  planetHouses: PlanetHouseInfo[];
  natalAspects: NatalAspect[];
  angularPlanets: string[];
  dominantElement: string;
  dominantModality: string;
  midheaven: MidheavenAnalysis | null;
}

export interface SourceMapEntry {
  sentence: string;
  triggers: { type: string; object: string; details: string }[];
}

// Constants
const ZODIAC_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const FIRE_SIGNS = ['Aries', 'Leo', 'Sagittarius'];
const EARTH_SIGNS = ['Taurus', 'Virgo', 'Capricorn'];
const AIR_SIGNS = ['Gemini', 'Libra', 'Aquarius'];
const WATER_SIGNS = ['Cancer', 'Scorpio', 'Pisces'];

const CARDINAL_SIGNS = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
const FIXED_SIGNS = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
const MUTABLE_SIGNS = ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'];

const ANGULAR_HOUSES = [1, 4, 7, 10];
const SUCCEDENT_HOUSES = [2, 5, 8, 11];
const CADENT_HOUSES = [3, 6, 9, 12];

const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const SOCIAL_PLANETS = ['Jupiter', 'Saturn'];
const OUTER_PLANETS = ['Uranus', 'Neptune', 'Pluto'];

// Aspect orbs - tighter for accuracy
const ASPECT_ORBS: Record<string, { angle: number; orb: number }> = {
  conjunction: { angle: 0, orb: 8 },
  sextile: { angle: 60, orb: 4 },
  square: { angle: 90, orb: 7 },
  trine: { angle: 120, orb: 7 },
  opposition: { angle: 180, orb: 8 }
};

// Luminaries get slightly wider orbs
const LUMINARY_ORB_BONUS = 2;

// Helper functions
const getElement = (sign: string): string => {
  if (FIRE_SIGNS.includes(sign)) return 'Fire';
  if (EARTH_SIGNS.includes(sign)) return 'Earth';
  if (AIR_SIGNS.includes(sign)) return 'Air';
  if (WATER_SIGNS.includes(sign)) return 'Water';
  return 'Unknown';
};

const getModality = (sign: string): string => {
  if (CARDINAL_SIGNS.includes(sign)) return 'Cardinal';
  if (FIXED_SIGNS.includes(sign)) return 'Fixed';
  if (MUTABLE_SIGNS.includes(sign)) return 'Mutable';
  return 'Unknown';
};

const positionToAbsoluteDegree = (position: NatalPlanetPosition): number => {
  const signIndex = ZODIAC_ORDER.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return (signIndex * 30) + position.degree + (position.minutes / 60);
};

const getSignRuler = (sign: string): string => {
  const rulers: Record<string, string> = {
    'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
    'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
  };
  return rulers[sign] || 'Sun';
};

/**
 * Calculate which house a planet is in using actual house cusps
 */
function calculatePlanetHouse(planetDegree: number, houseCusps: NatalChart['houseCusps']): number {
  if (!houseCusps) return 1;
  
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}` as keyof typeof houseCusps];
    if (cusp) {
      const cuspIndex = ZODIAC_ORDER.indexOf(cusp.sign);
      if (cuspIndex !== -1) {
        cusps.push((cuspIndex * 30) + cusp.degree + (cusp.minutes / 60));
      } else {
        cusps.push((i - 1) * 30);
      }
    } else {
      cusps.push((i - 1) * 30);
    }
  }
  
  // Find which house the planet is in
  for (let i = 0; i < 12; i++) {
    const nextHouse = (i + 1) % 12;
    let start = cusps[i];
    let end = cusps[nextHouse];
    
    // Handle wrap-around (e.g., house 12 to house 1)
    if (end < start) end += 360;
    let checkDegree = planetDegree;
    if (checkDegree < start && end > 360) checkDegree += 360;
    
    if (checkDegree >= start && checkDegree < end) {
      return i + 1;
    }
  }
  
  return 1;
}

/**
 * Estimate house using whole sign if no cusps available
 */
function estimateHouseWholeSign(planetDegree: number, ascDegree: number): number {
  const relDegree = ((planetDegree - ascDegree + 360) % 360);
  return Math.floor(relDegree / 30) + 1;
}

/**
 * Calculate all planet house placements
 */
function computePlanetHouses(chart: NatalChart): PlanetHouseInfo[] {
  const result: PlanetHouseInfo[] = [];
  const planets = chart.planets;
  const ascDegree = planets.Ascendant ? positionToAbsoluteDegree(planets.Ascendant) : 0;
  
  const planetEntries = Object.entries(planets) as [string, NatalPlanetPosition | undefined][];
  
  for (const [name, pos] of planetEntries) {
    if (!pos || name === 'Ascendant' || name === 'Vertex' || name === 'PartOfFortune') continue;
    
    const absDegree = positionToAbsoluteDegree(pos);
    const house = chart.houseCusps 
      ? calculatePlanetHouse(absDegree, chart.houseCusps)
      : estimateHouseWholeSign(absDegree, ascDegree);
    
    result.push({
      planet: name,
      sign: pos.sign,
      degree: pos.degree,
      house,
      isAngular: ANGULAR_HOUSES.includes(house),
      isRetrograde: pos.isRetrograde || false
    });
  }
  
  return result;
}

/**
 * Calculate all natal aspects with proper orb checking
 */
function computeNatalAspects(chart: NatalChart): NatalAspect[] {
  const aspects: NatalAspect[] = [];
  const planets = chart.planets;
  const planetList = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron', 'NorthNode'];
  
  for (let i = 0; i < planetList.length; i++) {
    for (let j = i + 1; j < planetList.length; j++) {
      const planet1 = planetList[i];
      const planet2 = planetList[j];
      
      const pos1 = planets[planet1 as keyof typeof planets];
      const pos2 = planets[planet2 as keyof typeof planets];
      
      if (!pos1 || !pos2) continue;
      
      const deg1 = positionToAbsoluteDegree(pos1);
      const deg2 = positionToAbsoluteDegree(pos2);
      
      let diff = Math.abs(deg1 - deg2);
      if (diff > 180) diff = 360 - diff;
      
      // Check for luminaries (Sun/Moon get bonus orb)
      const isLuminary = planet1 === 'Sun' || planet1 === 'Moon' || planet2 === 'Sun' || planet2 === 'Moon';
      
      for (const [aspectName, config] of Object.entries(ASPECT_ORBS)) {
        const maxOrb = config.orb + (isLuminary ? LUMINARY_ORB_BONUS : 0);
        const orb = Math.abs(diff - config.angle);
        
        if (orb <= maxOrb) {
          // Check if out of sign
          const expectedSignDiff = config.angle / 30;
          const sign1Idx = ZODIAC_ORDER.indexOf(pos1.sign);
          const sign2Idx = ZODIAC_ORDER.indexOf(pos2.sign);
          let actualSignDiff = Math.abs(sign1Idx - sign2Idx);
          if (actualSignDiff > 6) actualSignDiff = 12 - actualSignDiff;
          
          const isOutOfSign = aspectName === 'conjunction' ? actualSignDiff !== 0 :
                              aspectName === 'sextile' ? actualSignDiff !== 2 :
                              aspectName === 'square' ? actualSignDiff !== 3 :
                              aspectName === 'trine' ? actualSignDiff !== 4 :
                              aspectName === 'opposition' ? actualSignDiff !== 6 : false;
          
          aspects.push({
            planet1,
            planet2,
            type: aspectName as NatalAspect['type'],
            orb: Math.round(orb * 10) / 10,
            isApplying: deg1 < deg2, // simplified
            isOutOfSign
          });
          break; // Only one aspect per pair
        }
      }
    }
  }
  
  return aspects;
}

/**
 * Compute Operating Mode Scores (0-100 scale)
 */
export function computeOperatingModeScores(chart: NatalChart, planetHouses: PlanetHouseInfo[]): OperatingModeScores {
  const planets = chart.planets;
  let visibility = 50;
  let functionality = 50;
  let expressive = 50;
  let contained = 50;
  let relational = 50;
  let selfDirected = 50;

  // Count elements and modalities
  let fireCount = 0, earthCount = 0, airCount = 0, waterCount = 0;
  let fixedCount = 0, cardinalCount = 0;
  let retrogrades = 0;
  let angularCount = 0;

  for (const ph of planetHouses) {
    const element = getElement(ph.sign);
    if (element === 'Fire') fireCount++;
    if (element === 'Earth') earthCount++;
    if (element === 'Air') airCount++;
    if (element === 'Water') waterCount++;

    const modality = getModality(ph.sign);
    if (modality === 'Fixed') fixedCount++;
    if (modality === 'Cardinal') cardinalCount++;

    if (ph.isAngular) angularCount++;
    if (ph.isRetrograde) retrogrades++;

    // Specific sign/house bonuses
    if (ph.sign === 'Leo' || ph.sign === 'Aries') visibility += 3;
    if (ph.sign === 'Virgo' || ph.sign === 'Capricorn') functionality += 3;
    if (ph.sign === 'Libra') relational += 5;
    if (ph.sign === 'Aries') selfDirected += 5;
    
    // House-based scoring
    if (ph.house === 1 || ph.house === 10) visibility += 5;
    if (ph.house === 6 || ph.house === 10) functionality += 4;
    if (ph.house === 7) relational += 8;
    if (ph.house === 1) selfDirected += 6;
    if (ph.house === 5 || ph.house === 11) expressive += 4;
    if (ph.house === 8 || ph.house === 12) contained += 5;
  }

  // Visibility: angular planets, Leo/Aries, Sun/Moon in 1/10
  visibility += angularCount * 5;
  if (planets.Sun?.sign === 'Leo') visibility += 10;
  if (planets.Moon?.sign === 'Leo') visibility += 5;

  // Functionality: Saturn emphasis, earth dominance
  const saturnInfo = planetHouses.find(p => p.planet === 'Saturn');
  if (saturnInfo?.isAngular) functionality += 15;
  if (planets.Saturn?.sign === 'Capricorn' || planets.Saturn?.sign === 'Aquarius') functionality += 10;
  functionality += earthCount * 4;

  // Expressive: fire + air, Jupiter in 5/11
  expressive += (fireCount + airCount) * 3;
  const jupiterInfo = planetHouses.find(p => p.planet === 'Jupiter');
  if (jupiterInfo && (jupiterInfo.house === 5 || jupiterInfo.house === 11)) expressive += 10;

  // Contained: earth + water, Saturn, fixed, retrogrades, 8th/12th
  contained += (earthCount + waterCount) * 3;
  contained += fixedCount * 2;
  contained += retrogrades * 5;

  // Relational: Libra/7th emphasis, Venus strong
  const venusInfo = planetHouses.find(p => p.planet === 'Venus');
  if (venusInfo?.house === 7) relational += 15;
  if (planets.Venus?.sign === 'Libra' || planets.Venus?.sign === 'Taurus') relational += 10;

  // Self-directed: Aries/1st, Mars in 1st
  const marsInfo = planetHouses.find(p => p.planet === 'Mars');
  if (marsInfo?.house === 1) selfDirected += 15;
  if (planets.Mars?.sign === 'Aries' || planets.Mars?.sign === 'Scorpio') selfDirected += 10;

  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

  return {
    visibility: clamp(visibility),
    functionality: clamp(functionality),
    expressive: clamp(expressive),
    contained: clamp(contained),
    relational: clamp(relational),
    selfDirected: clamp(selfDirected),
  };
}

/**
 * Identify and rank pressure points with proper aspect checking
 */
export function computePressurePoints(chart: NatalChart, planetHouses: PlanetHouseInfo[], aspects: NatalAspect[]): PressurePoint[] {
  const points: PressurePoint[] = [];
  const planets = chart.planets;

  // 1. Anaretic and threshold degrees
  for (const ph of planetHouses) {
    if (ph.degree === 29) {
      points.push({
        type: 'anaretic',
        planet: ph.planet,
        description: `${ph.planet} at 29° ${ph.sign}`,
        weight: 85,
        details: `Anaretic degree suggests urgency, mastery pressure, and culmination energy. ${ph.planet} in house ${ph.house}.`
      });
    }
    if (ph.degree === 0) {
      points.push({
        type: 'threshold',
        planet: ph.planet,
        description: `${ph.planet} at 0° ${ph.sign}`,
        weight: 75,
        details: `Threshold degree indicates fresh, raw energy—${ph.planet} is learning to operate in ${ph.sign}. House ${ph.house}.`
      });
    }
  }

  // 2. Retrograde personal planets
  for (const ph of planetHouses) {
    if (ph.isRetrograde && PERSONAL_PLANETS.includes(ph.planet)) {
      points.push({
        type: 'retrograde',
        planet: ph.planet,
        description: `${ph.planet} retrograde in ${ph.sign}`,
        weight: ph.planet === 'Mercury' ? 70 : 80,
        details: `Retrograde ${ph.planet} in house ${ph.house} suggests internalized, reflective processing. May feel delayed expression.`
      });
    }
  }

  // 3. Hard aspects with actual orb checking (prioritize tight orbs)
  const hardAspects = aspects.filter(a => a.type === 'square' || a.type === 'opposition' || a.type === 'conjunction');
  for (const aspect of hardAspects.sort((a, b) => a.orb - b.orb).slice(0, 5)) {
    const isHard = aspect.type === 'square' || aspect.type === 'opposition';
    points.push({
      type: isHard ? 'hard_aspect' : 'conjunction',
      planet: `${aspect.planet1}-${aspect.planet2}`,
      description: `${aspect.planet1} ${aspect.type} ${aspect.planet2} (${aspect.orb}° orb)`,
      weight: isHard ? 80 - aspect.orb * 3 : 75 - aspect.orb * 2,
      details: aspect.isOutOfSign 
        ? `Out-of-sign ${aspect.type}: the aspect is technically exact but the signs don't match the aspect pattern, creating complexity.`
        : `Tight ${aspect.type} creates dynamic tension or fusion between ${aspect.planet1} and ${aspect.planet2}.`
    });
  }

  // 4. Moon conjunctions (specific attention to Moon-Pluto, Moon-Saturn, etc.)
  const moonAspects = aspects.filter(a => (a.planet1 === 'Moon' || a.planet2 === 'Moon') && a.type === 'conjunction');
  for (const ma of moonAspects) {
    const otherPlanet = ma.planet1 === 'Moon' ? ma.planet2 : ma.planet1;
    if (!points.find(p => p.planet === `Moon-${otherPlanet}` || p.planet === `${otherPlanet}-Moon`)) {
      points.push({
        type: 'conjunction',
        planet: `Moon-${otherPlanet}`,
        description: `Moon conjunct ${otherPlanet} (${ma.orb}° orb)`,
        weight: 88,
        details: `Moon fused with ${otherPlanet} colors emotional nature profoundly. The ${otherPlanet} archetype is felt viscerally.`
      });
    }
  }

  // 5. Angular planets (planets in 1, 4, 7, 10)
  const angularPlanets = planetHouses.filter(p => p.isAngular);
  for (const ap of angularPlanets) {
    points.push({
      type: 'angular_planet',
      planet: ap.planet,
      description: `${ap.planet} in ${ap.sign} (house ${ap.house})`,
      weight: ap.house === 1 || ap.house === 10 ? 82 : 72,
      details: `Angular ${ap.planet} is prominent and visible. House ${ap.house} themes are central to identity.`
    });
  }

  // 6. 12th house placements (hidden, unconscious material)
  const twelfthHouse = planetHouses.filter(p => p.house === 12);
  for (const th of twelfthHouse) {
    points.push({
      type: 'house_placement',
      planet: th.planet,
      description: `${th.planet} in 12th house (${th.sign})`,
      weight: PERSONAL_PLANETS.includes(th.planet) ? 78 : 65,
      details: `12th house ${th.planet} operates behind the scenes. May feel hidden from conscious awareness or projected onto others.`
    });
  }

  // 7. Saturn hard aspects to personal planets (WITH orb checking)
  const saturnHardAspects = aspects.filter(a => 
    (a.planet1 === 'Saturn' || a.planet2 === 'Saturn') &&
    (a.type === 'square' || a.type === 'opposition' || a.type === 'conjunction')
  );
  for (const sha of saturnHardAspects) {
    const otherPlanet = sha.planet1 === 'Saturn' ? sha.planet2 : sha.planet1;
    if (PERSONAL_PLANETS.includes(otherPlanet)) {
      if (!points.find(p => p.description.includes(`Saturn ${sha.type} ${otherPlanet}`))) {
        points.push({
          type: 'saturn_pattern',
          planet: `Saturn-${otherPlanet}`,
          description: `Saturn ${sha.type} ${otherPlanet} (${sha.orb}° orb)`,
          weight: sha.type === 'conjunction' ? 80 : 75,
          details: `Saturn's restriction meets ${otherPlanet}: may indicate early life challenges, self-criticism, or delayed development in ${otherPlanet}'s domain.`
        });
      }
    }
  }

  // 8. Chart ruler condition
  if (planets.Ascendant) {
    const ascSign = planets.Ascendant.sign;
    const ascRuler = getSignRuler(ascSign);
    const rulerInfo = planetHouses.find(p => p.planet === ascRuler);
    if (rulerInfo) {
      points.push({
        type: 'asc_ruler',
        planet: ascRuler,
        description: `Chart ruler ${ascRuler} in ${rulerInfo.sign} (house ${rulerInfo.house})`,
        weight: 70,
        details: `As ruler of ${ascSign} Ascendant, ${ascRuler}'s condition in house ${rulerInfo.house} shapes overall life approach.`
      });
    }
  }

  // 9. Out-of-sign aspects
  const outOfSignAspects = aspects.filter(a => a.isOutOfSign && a.orb <= 3);
  for (const oos of outOfSignAspects) {
    if (!points.find(p => p.description.includes(oos.planet1) && p.description.includes(oos.planet2))) {
      points.push({
        type: 'out_of_sign',
        planet: `${oos.planet1}-${oos.planet2}`,
        description: `${oos.planet1} ${oos.type} ${oos.planet2} (out of sign)`,
        weight: 60,
        details: `Aspect is exact by degree but crosses sign boundaries, adding nuance and complexity to the interpretation.`
      });
    }
  }

  // Sort by weight and deduplicate, return top 10
  const seen = new Set<string>();
  const unique = points.filter(p => {
    const key = p.description;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  return unique.sort((a, b) => b.weight - a.weight).slice(0, 10);
}

/**
 * Detect absence signals
 */
export function computeAbsenceSignals(chart: NatalChart, planetHouses: PlanetHouseInfo[], aspects: NatalAspect[]): AbsenceSignals {
  const elements = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalities = { Cardinal: 0, Fixed: 0, Mutable: 0 };

  for (const ph of planetHouses) {
    const element = getElement(ph.sign);
    if (element in elements) elements[element as keyof typeof elements]++;

    const modality = getModality(ph.sign);
    if (modality in modalities) modalities[modality as keyof typeof modalities]++;
  }

  const angularCount = planetHouses.filter(p => p.isAngular).length;
  
  // Check for outer planet links to personal planets
  const outerPersonalLinks = aspects.filter(a => 
    (OUTER_PLANETS.includes(a.planet1) && PERSONAL_PLANETS.includes(a.planet2)) ||
    (OUTER_PLANETS.includes(a.planet2) && PERSONAL_PLANETS.includes(a.planet1))
  ).length;

  return {
    missingElements: Object.entries(elements).filter(([_, count]) => count === 0).map(([elem]) => elem),
    missingModalities: Object.entries(modalities).filter(([_, count]) => count === 0).map(([mod]) => mod),
    fewAngularPlanets: angularCount < 2,
    angularPlanetCount: angularCount,
    fewOuterPersonalLinks: outerPersonalLinks < 2
  };
}

/**
 * Verb dictionary for translating placements
 */
export const VERB_DICTIONARY: Record<string, Record<string, string[]>> = {
  Moon: {
    Taurus: ['stabilizes', 'regulates', 'preserves', 'soothes through routine and consistency'],
    Cancer: ['nurtures', 'protects', 'remembers', 'feels deeply and attunes to others'],
    Virgo: ['analyzes feelings', 'serves', 'improves', 'processes emotion through practical care'],
    Scorpio: ['transforms', 'guards depths', 'bonds intensely', 'experiences emotion as power'],
    Capricorn: ['structures emotion', 'endures', 'provides', 'may suppress for productivity'],
    Pisces: ['absorbs', 'transcends', 'dreams', 'feels boundlessly and merges emotionally'],
    Aries: ['reacts quickly', 'asserts needs', 'leads with emotion', 'needs independence'],
    Leo: ['dramatizes', 'creates', 'needs recognition', 'expresses warmly'],
    Gemini: ['communicates feelings', 'adapts', 'intellectualizes', 'needs variety'],
    Libra: ['harmonizes', 'weighs', 'seeks balance', 'processes through relationship'],
    Sagittarius: ['explores', 'seeks meaning', 'needs freedom', 'emotionally adventurous'],
    Aquarius: ['detaches', 'observes', 'needs space', 'processes through ideas'],
  },
  Mars: {
    Aries: ['initiates', 'competes', 'acts directly', 'leads with courage'],
    Virgo: ['refines', 'optimizes', 'diagnoses', 'acts by improving systems'],
    Capricorn: ['strategizes', 'climbs', 'endures', 'builds through discipline'],
    Scorpio: ['penetrates', 'transforms', 'controls', 'acts with intensity'],
    Leo: ['performs', 'leads', 'creates', 'acts for recognition'],
    Taurus: ['persists', 'builds slowly', 'values stability', 'acts for security'],
    Gemini: ['multitasks', 'communicates action', 'adapts', 'acts through ideas'],
    Cancer: ['protects', 'defends home', 'acts emotionally', 'nurtures through action'],
    Libra: ['negotiates', 'partners', 'acts through others', 'seeks fairness'],
    Sagittarius: ['explores', 'preaches', 'acts on beliefs', 'seeks adventure'],
    Aquarius: ['rebels', 'innovates', 'acts for groups', 'seeks change'],
    Pisces: ['surrenders', 'acts intuitively', 'dissolves', 'sacrifices'],
  },
  Mercury: {
    Gemini: ['connects', 'questions', 'multitasks', 'thinks in networks'],
    Virgo: ['analyzes', 'categorizes', 'edits', 'thinks in details'],
    Libra: ['weighs', 'mediates', 'edits', 'thinks in consequences and fairness'],
    Scorpio: ['investigates', 'probes', 'keeps secrets', 'thinks in depths'],
    Sagittarius: ['synthesizes', 'philosophizes', 'generalizes', 'thinks big picture'],
    Capricorn: ['structures', 'plans', 'prioritizes', 'thinks strategically'],
    Aquarius: ['innovates', 'networks', 'detaches', 'thinks in systems'],
    Pisces: ['intuits', 'imagines', 'absorbs', 'thinks in symbols'],
    Aries: ['decides quickly', 'initiates', 'speaks directly', 'thinks competitively'],
    Taurus: ['deliberates', 'grounds', 'values', 'thinks practically'],
    Cancer: ['remembers', 'feels thoughts', 'protects', 'thinks emotionally'],
    Leo: ['dramatizes', 'creates', 'leads with words', 'thinks creatively'],
  },
  Venus: {
    Taurus: ['savors', 'stabilizes', 'values sensually', 'bonds through comfort'],
    Libra: ['harmonizes', 'partners', 'aestheticizes', 'bonds through balance'],
    Scorpio: ['bonds deeply', 'tests trust', 'values intensity', 'prefers depth over breadth'],
    Pisces: ['idealizes', 'sacrifices', 'loves unconditionally', 'bonds spiritually'],
    Cancer: ['nurtures love', 'protects bonds', 'values home', 'loves maternally'],
    Leo: ['dramatizes love', 'creates', 'needs admiration', 'loves generously'],
    Virgo: ['serves love', 'improves', 'values quality', 'loves through care'],
    Capricorn: ['commits', 'builds love', 'values status', 'loves responsibly'],
    Aries: ['pursues', 'conquers', 'loves passionately', 'values independence'],
    Gemini: ['communicates love', 'varies', 'values wit', 'loves through words'],
    Sagittarius: ['explores love', 'philosophizes', 'values freedom', 'loves adventurously'],
    Aquarius: ['friends first', 'values uniqueness', 'loves unconventionally', 'needs space'],
  },
  Saturn: {
    Aries: ['disciplines initiation', 'learns safe assertion', 'masters courage', 'fears rejection'],
    Capricorn: ['masters structure', 'builds authority', 'endures', 'fears failure'],
    Aquarius: ['systematizes', 'structures groups', 'fears conformity', 'masters innovation'],
    Cancer: ['protects boundaries', 'structures nurturing', 'fears abandonment', 'masters caregiving'],
    Leo: ['disciplines creativity', 'masters performance', 'fears invisibility', 'learns authentic expression'],
    Virgo: ['perfects systems', 'masters service', 'fears imperfection', 'learns good enough'],
    Libra: ['structures relationships', 'masters fairness', 'fears imbalance', 'learns commitment'],
    Scorpio: ['controls depths', 'masters transformation', 'fears vulnerability', 'learns trust'],
    Sagittarius: ['structures beliefs', 'masters teaching', 'fears limitation', 'learns discipline'],
    Pisces: ['structures spirituality', 'masters surrender', 'fears chaos', 'learns boundaries'],
    Taurus: ['builds value', 'masters resources', 'fears scarcity', 'learns sufficiency'],
    Gemini: ['structures thought', 'masters communication', 'fears superficiality', 'learns focus'],
  }
};

/**
 * Get verb description for a placement
 */
export function getVerbsForPlacement(planet: string, sign: string): string[] {
  return VERB_DICTIONARY[planet]?.[sign] || [`expresses ${planet} energy through ${sign}`];
}

/**
 * Get dominant element
 */
function getDominantElement(planetHouses: PlanetHouseInfo[]): string {
  const counts = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  for (const ph of planetHouses) {
    const el = getElement(ph.sign);
    if (el in counts) counts[el as keyof typeof counts]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * Get dominant modality
 */
function getDominantModality(planetHouses: PlanetHouseInfo[]): string {
  const counts = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const ph of planetHouses) {
    const mod = getModality(ph.sign);
    if (mod in counts) counts[mod as keyof typeof counts]++;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * MC Career Themes based on sign
 */
const MC_THEMES: Record<string, string[]> = {
  Aries: ['leadership', 'pioneering', 'athletics', 'entrepreneurship', 'military', 'competition'],
  Taurus: ['finance', 'beauty', 'agriculture', 'real estate', 'arts', 'luxury goods'],
  Gemini: ['communication', 'writing', 'teaching', 'media', 'sales', 'networking'],
  Cancer: ['nurturing professions', 'hospitality', 'real estate', 'family business', 'counseling'],
  Leo: ['entertainment', 'leadership', 'creative arts', 'children', 'performance', 'branding'],
  Virgo: ['health', 'service', 'analysis', 'editing', 'craftsmanship', 'research'],
  Libra: ['law', 'diplomacy', 'arts', 'partnerships', 'beauty', 'mediation'],
  Scorpio: ['psychology', 'investigation', 'finance', 'medicine', 'research', 'transformation'],
  Sagittarius: ['education', 'publishing', 'travel', 'philosophy', 'law', 'international'],
  Capricorn: ['business', 'management', 'government', 'architecture', 'tradition', 'authority'],
  Aquarius: ['technology', 'innovation', 'humanitarian', 'science', 'community', 'reform'],
  Pisces: ['healing', 'spirituality', 'arts', 'music', 'film', 'compassion work'],
};

/**
 * Compute Midheaven (MC) analysis
 */
function computeMidheavenAnalysis(chart: NatalChart, planetHouses: PlanetHouseInfo[], aspects: NatalAspect[]): MidheavenAnalysis | null {
  // Try to get MC from house cusps (house 10)
  const house10Cusp = chart.houseCusps?.house10;
  
  // Also check if there's an MC in planets (some charts may store it in a special field)
  const planets = chart.planets as Record<string, NatalPlanetPosition | undefined>;
  const mcFromPlanets = planets['MC'];
  
  if (!house10Cusp && !mcFromPlanets) return null;
  
  const mcSign = house10Cusp?.sign || mcFromPlanets?.sign || '';
  const mcDegree = house10Cusp?.degree || mcFromPlanets?.degree || 0;
  
  if (!mcSign) return null;
  
  // Get MC ruler
  const mcRuler = getSignRuler(mcSign);
  const mcRulerInfo = planetHouses.find(p => p.planet === mcRuler);
  
  // Get planets in 10th house
  const tenthHousePlanets = planetHouses.filter(p => p.house === 10).map(p => p.planet);
  
  // Get aspects to MC (calculated by position)
  // MC longitude
  const mcIndex = ZODIAC_ORDER.indexOf(mcSign);
  const mcLongitude = mcIndex * 30 + mcDegree;
  
  // Find aspects from planets to MC
  const mcAspects: NatalAspect[] = [];
  for (const ph of planetHouses) {
    const planetPos = chart.planets?.[ph.planet as keyof typeof chart.planets];
    if (!planetPos) continue;
    
    const planetLon = positionToAbsoluteDegree(planetPos);
    let diff = Math.abs(planetLon - mcLongitude);
    if (diff > 180) diff = 360 - diff;
    
    for (const [aspectName, config] of Object.entries(ASPECT_ORBS)) {
      const orb = Math.abs(diff - config.angle);
      if (orb <= config.orb) {
        mcAspects.push({
          planet1: ph.planet,
          planet2: 'MC',
          type: aspectName as NatalAspect['type'],
          orb: Math.round(orb * 10) / 10,
          isApplying: false,
          isOutOfSign: false
        });
        break;
      }
    }
  }
  
  return {
    sign: mcSign,
    degree: mcDegree,
    ruler: mcRuler,
    rulerSign: mcRulerInfo?.sign || '',
    rulerHouse: mcRulerInfo?.house || 0,
    rulerIsAngular: mcRulerInfo?.isAngular || false,
    rulerIsRetrograde: mcRulerInfo?.isRetrograde || false,
    tenthHousePlanets,
    mcAspects,
    careerThemes: MC_THEMES[mcSign] || []
  };
}

/**
 * Compute all signals from chart
 */
export function computeAllSignals(chart: NatalChart): SignalsData {
  const planetHouses = computePlanetHouses(chart);
  const natalAspects = computeNatalAspects(chart);
  const angularPlanets = planetHouses.filter(p => p.isAngular).map(p => p.planet);
  const midheaven = computeMidheavenAnalysis(chart, planetHouses, natalAspects);
  
  return {
    operatingMode: computeOperatingModeScores(chart, planetHouses),
    pressurePointsRanked: computePressurePoints(chart, planetHouses, natalAspects),
    absenceSignals: computeAbsenceSignals(chart, planetHouses, natalAspects),
    planetHouses,
    natalAspects,
    angularPlanets,
    dominantElement: getDominantElement(planetHouses),
    dominantModality: getDominantModality(planetHouses),
    midheaven,
  };
}
