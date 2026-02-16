/**
 * Relationship Focus Analysis
 * Professional-grade synastry scoring aligned with astrological research
 * 
 * Scoring Philosophy:
 * - Base score of 25% (any partnership has baseline potential)
 * - Standard indicators contribute weighted percentage (normalized ~120 pts max)
 * - Major karmic indicators add FLAT bonuses (capped at 22 for all focus types)
 * - House overlays contribute directly when relevant
 * - Aspect ratio (harmonious:tense) affects final score
 * - Realistic range: 15-92% (exceptional pairings can reach high 80s/low 90s)
 * 
 * IMPORTANT: South Node aspects are NOT separately counted since South Node
 * is exactly 180° opposite North Node - an opposition to North Node IS a
 * conjunction to South Node. This prevents artificial score inflation.
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

export type RelationshipFocus = 'all' | 'romantic' | 'friendship' | 'business' | 'creative' | 'family';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

function toAbsoluteDegree(position: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return (signIndex * 30) + position.degree + ((position.minutes || 0) / 60);
}

function calculateAngle(pos1: NatalPlanetPosition, pos2: NatalPlanetPosition): number {
  const deg1 = toAbsoluteDegree(pos1);
  const deg2 = toAbsoluteDegree(pos2);
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

interface AspectResult {
  type: string;
  orb: number;
  quality: 'harmonious' | 'tense' | 'powerful';
}

function getAspect(angle: number): AspectResult | null {
  const aspects = [
    { angle: 0, orb: 8, type: 'conjunction', quality: 'powerful' as const },
    { angle: 60, orb: 6, type: 'sextile', quality: 'harmonious' as const },
    { angle: 90, orb: 7, type: 'square', quality: 'tense' as const },
    { angle: 120, orb: 8, type: 'trine', quality: 'harmonious' as const },
    { angle: 180, orb: 8, type: 'opposition', quality: 'tense' as const }
  ];
  
  for (const asp of aspects) {
    const orbDiff = Math.abs(angle - asp.angle);
    if (orbDiff <= asp.orb) {
      return { type: asp.type, orb: Math.round(orbDiff * 10) / 10, quality: asp.quality };
    }
  }
  return null;
}

function checkAspect(chart1: NatalChart, planet1: string, chart2: NatalChart, planet2: string): AspectResult | null {
  const pos1 = chart1.planets[planet1 as keyof typeof chart1.planets];
  const pos2 = chart2.planets[planet2 as keyof typeof chart2.planets];
  if (!pos1 || !pos2) return null;
  
  const angle = calculateAngle(pos1, pos2);
  return getAspect(angle);
}

// Helper to get house for a planet using whole-sign houses
function getHouseForPlanet(planetPos: NatalPlanetPosition, ascSign: string): number {
  const planetSignIndex = ZODIAC_SIGNS.indexOf(planetPos.sign);
  const ascSignIndex = ZODIAC_SIGNS.indexOf(ascSign);
  if (planetSignIndex === -1 || ascSignIndex === -1) return 1;
  return ((planetSignIndex - ascSignIndex + 12) % 12) + 1;
}

export interface FocusIndicator {
  name: string;
  found: boolean;
  aspect?: AspectResult | null;
  interpretation: string;
  strength: 'strong' | 'moderate' | 'weak' | 'absent';
  planet1?: string;
  planet2?: string;
  tier?: number;
  points?: number;
}

export interface AspectRatioData {
  harmonious: number;
  tense: number;
  powerful: number;
  ratio: number;
  assessment: string;
}

export interface FocusAnalysis {
  focus: RelationshipFocus;
  title: string;
  overallStrength: number;
  indicators: FocusIndicator[];
  summary: string;
  recommendations: string[];
  aspectRatio?: AspectRatioData;
  maxStandardPoints?: number;
  earnedStandardPoints?: number;
}

/**
 * Calculate aspect ratio from found aspects
 * Professional astrologers use 2:1 (harmonious:tense) as a benchmark
 */
function calculateAspectRatio(indicators: FocusIndicator[]): AspectRatioData {
  let harmonious = 0;
  let tense = 0;
  let powerful = 0;
  
  for (const indicator of indicators) {
    if (indicator.found && indicator.aspect) {
      if (indicator.aspect.quality === 'harmonious') harmonious++;
      else if (indicator.aspect.quality === 'tense') tense++;
      else if (indicator.aspect.quality === 'powerful') powerful++;
    }
  }
  
  const ratio = tense > 0 ? harmonious / tense : harmonious > 0 ? 3.0 : 1.0;
  
  let assessment: string;
  if (ratio >= 2.0) {
    assessment = 'Excellent flow (≥2:1 harmonious to tense)';
  } else if (ratio >= 1.5) {
    assessment = 'Good balance (1.5:1 to 2:1)';
  } else if (ratio >= 1.0) {
    assessment = 'Moderate challenge (1:1 ratio)';
  } else {
    assessment = 'Dynamic tension (more tense than harmonious)';
  }
  
  return { harmonious, tense, powerful, ratio: Math.round(ratio * 100) / 100, assessment };
}

/**
 * Apply aspect ratio bonus/penalty to score
 * Based on professional astrological research
 */
function getAspectRatioModifier(ratio: number): number {
  if (ratio >= 2.0) return 5;
  if (ratio >= 1.5) return 2;
  if (ratio >= 1.0) return 0;
  return -3;
}

// ============================================
// BUSINESS PARTNERSHIP ANALYSIS
// Professional-grade scoring based on astrological research
// Target: ~120 max standard points
// ============================================
function analyzeBusinessPartnership(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  
  // Separate tracking for standard points and karmic bonuses
  let standardPoints = 0;
  let maxStandardPoints = 0;
  let karmicBonus = 0; // Flat bonuses that don't get diluted
  let houseOverlayBonus = 0;
  
  // ============================================
  // TIER 1: CORE BUSINESS INDICATORS (10 pts each)
  // These are ESSENTIAL for professional success
  // ============================================
  
  // Sun-Sun: Core identity alignment - shared vision
  const sunSun = checkAspect(chart1, 'Sun', chart2, 'Sun');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Sun-Sun: Core Identity Alignment',
    found: !!sunSun,
    aspect: sunSun,
    planet1: 'Sun',
    planet2: 'Sun',
    tier: 1,
    points: sunSun ? (sunSun.quality === 'harmonious' || sunSun.type === 'conjunction' ? 10 : 5) : 0,
    interpretation: sunSun 
      ? `${sunSun.type} (${sunSun.orb}° orb): Your core identities ${sunSun.quality === 'harmonious' ? 'align naturally - shared vision comes easily' : sunSun.type === 'conjunction' ? 'merge powerfully - you operate as one force' : 'create dynamic tension that can fuel healthy competition'}.`
      : 'No Sun-Sun aspect. Core visions may differ - establish shared mission statement.',
    strength: sunSun ? (sunSun.quality === 'harmonious' || sunSun.type === 'conjunction' ? 'strong' : 'moderate') : 'weak'
  });
  if (sunSun) standardPoints += sunSun.quality === 'harmonious' || sunSun.type === 'conjunction' ? 10 : 5;

  // Saturn-Sun: Authority and structure
  const saturnSun = checkAspect(chart1, 'Saturn', chart2, 'Sun') || checkAspect(chart2, 'Saturn', chart1, 'Sun');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Saturn-Sun: Authority & Structure',
    found: !!saturnSun,
    aspect: saturnSun,
    planet1: 'Saturn',
    planet2: 'Sun',
    tier: 1,
    points: saturnSun ? (saturnSun.quality === 'harmonious' ? 10 : 6) : 0,
    interpretation: saturnSun 
      ? `${saturnSun.type} (${saturnSun.orb}° orb): One partner provides structure and accountability. ${saturnSun.quality === 'harmonious' ? 'This flows naturally - roles are clear and respected.' : 'This may feel restrictive at times, but creates necessary discipline.'}`
      : 'No direct Saturn-Sun aspect. Structure and authority roles may need conscious definition.',
    strength: saturnSun ? (saturnSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'absent'
  });
  if (saturnSun) standardPoints += saturnSun.quality === 'harmonious' ? 10 : 6;

  // Mercury-Mercury: Communication - ESSENTIAL for business
  const mercuryMercury = checkAspect(chart1, 'Mercury', chart2, 'Mercury');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Mercury-Mercury: Mental Sync',
    found: !!mercuryMercury,
    aspect: mercuryMercury,
    planet1: 'Mercury',
    planet2: 'Mercury',
    tier: 1,
    points: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: mercuryMercury
      ? `${mercuryMercury.type} (${mercuryMercury.orb}° orb): Your minds ${mercuryMercury.quality === 'harmonious' ? 'work well together - similar thought processes and easy idea exchange' : 'approach problems differently - this can create conflict or complement each other'}.`
      : 'No Mercury-Mercury aspect. Different thinking styles - this can be a strength with conscious bridging.',
    strength: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryMercury) standardPoints += mercuryMercury.quality === 'harmonious' ? 10 : 5;

  // Mars-Jupiter: "The Millionaire Combination" - drive meets expansion
  const marsJupiter = checkAspect(chart1, 'Mars', chart2, 'Jupiter') || checkAspect(chart2, 'Mars', chart1, 'Jupiter');
  maxStandardPoints += 10;
  indicators.push({
    name: '★ Mars-Jupiter: The Millionaire Combination',
    found: !!marsJupiter,
    aspect: marsJupiter,
    planet1: 'Mars',
    planet2: 'Jupiter',
    tier: 1,
    points: marsJupiter ? (marsJupiter.quality === 'harmonious' ? 10 : 7) : 0,
    interpretation: marsJupiter 
      ? `${marsJupiter.type} (${marsJupiter.orb}° orb): One of the BEST business aspects! Mars provides drive and action while Jupiter expands opportunities. ${marsJupiter.quality === 'harmonious' ? 'This flows beautifully - ambitious ventures succeed.' : 'High energy that needs channeling - guard against overextension.'}`
      : 'No Mars-Jupiter aspect. Drive and expansion need conscious cultivation.',
    strength: marsJupiter ? 'strong' : 'weak'
  });
  if (marsJupiter) standardPoints += marsJupiter.quality === 'harmonious' ? 10 : 7;

  // Jupiter-Saturn: Vision + Execution (the ideal business combination)
  const jupiterSaturn = checkAspect(chart1, 'Jupiter', chart2, 'Saturn') || checkAspect(chart2, 'Jupiter', chart1, 'Saturn');
  maxStandardPoints += 10;
  indicators.push({
    name: '★ Jupiter-Saturn: Vision + Execution',
    found: !!jupiterSaturn,
    aspect: jupiterSaturn,
    planet1: 'Jupiter',
    planet2: 'Saturn',
    tier: 1,
    points: jupiterSaturn ? (jupiterSaturn.quality === 'harmonious' ? 10 : 6) : 0,
    interpretation: jupiterSaturn 
      ? `${jupiterSaturn.type} (${jupiterSaturn.orb}° orb): The ideal business combination! One partner brings expansive vision while the other provides realistic structure. ${jupiterSaturn.quality === 'harmonious' ? 'These energies blend well - dreams meet practicality.' : 'There may be tension between "go big" and "go slow" but both perspectives are valuable.'}`
      : 'No Jupiter-Saturn aspect. Balance vision and structure consciously.',
    strength: jupiterSaturn ? (jupiterSaturn.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (jupiterSaturn) standardPoints += jupiterSaturn.quality === 'harmonious' ? 10 : 6;

  // ============================================
  // TIER 2: IMPORTANT BUSINESS INDICATORS (8 pts each)
  // ============================================
  
  // Saturn-Mercury: Practical communication
  const saturnMercury = checkAspect(chart1, 'Saturn', chart2, 'Mercury') || checkAspect(chart2, 'Saturn', chart1, 'Mercury');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Saturn-Mercury: Practical Communication',
    found: !!saturnMercury,
    aspect: saturnMercury,
    planet1: 'Saturn',
    planet2: 'Mercury',
    tier: 2,
    points: saturnMercury ? (saturnMercury.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: saturnMercury
      ? `${saturnMercury.type} (${saturnMercury.orb}° orb): Business communications are ${saturnMercury.quality === 'harmonious' ? 'grounded and productive' : 'sometimes tense, but ultimately clarifying'}.`
      : 'No Saturn-Mercury aspect. Communication style may be less formal.',
    strength: saturnMercury ? (saturnMercury.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (saturnMercury) standardPoints += saturnMercury.quality === 'harmonious' ? 8 : 4;

  // Jupiter-Sun: Growth & Opportunity
  const jupiterSun = checkAspect(chart1, 'Jupiter', chart2, 'Sun') || checkAspect(chart2, 'Jupiter', chart1, 'Sun');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Jupiter-Sun: Growth & Opportunity',
    found: !!jupiterSun,
    aspect: jupiterSun,
    planet1: 'Jupiter',
    planet2: 'Sun',
    tier: 2,
    points: jupiterSun ? (jupiterSun.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: jupiterSun
      ? `${jupiterSun.type} (${jupiterSun.orb}° orb): Excellent for expansion! Jupiter expands the Sun person's potential. ${jupiterSun.quality === 'harmonious' ? 'Natural luck and growth together.' : 'Big visions that may need grounding.'}`
      : 'No Jupiter-Sun aspect. Growth opportunities exist but may require more deliberate cultivation.',
    strength: jupiterSun ? (jupiterSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (jupiterSun) standardPoints += jupiterSun.quality === 'harmonious' ? 8 : 4;

  // Mercury-Mars: Ideas translate to action
  const mercuryMars = checkAspect(chart1, 'Mercury', chart2, 'Mars') || checkAspect(chart2, 'Mercury', chart1, 'Mars');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Mercury-Mars: Ideas → Action',
    found: !!mercuryMars,
    aspect: mercuryMars,
    planet1: 'Mercury',
    planet2: 'Mars',
    tier: 2,
    points: mercuryMars ? (mercuryMars.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: mercuryMars 
      ? `${mercuryMars.type} (${mercuryMars.orb}° orb): Ideas quickly become action. ${mercuryMars.quality === 'harmonious' ? 'Smooth translation from planning to execution.' : 'Debates can be heated but productive.'}`
      : 'No Mercury-Mars aspect. Bridge ideas to action consciously.',
    strength: mercuryMars ? (mercuryMars.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryMars) standardPoints += mercuryMars.quality === 'harmonious' ? 8 : 4;

  // Jupiter-Jupiter: Shared philosophy and growth vision
  const jupiterJupiter = checkAspect(chart1, 'Jupiter', chart2, 'Jupiter');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Jupiter-Jupiter: Shared Vision',
    found: !!jupiterJupiter,
    aspect: jupiterJupiter,
    planet1: 'Jupiter',
    planet2: 'Jupiter',
    tier: 2,
    points: jupiterJupiter ? (jupiterJupiter.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: jupiterJupiter
      ? `${jupiterJupiter.type} (${jupiterJupiter.orb}° orb): Aligned on growth philosophy. ${jupiterJupiter.quality === 'harmonious' ? 'Natural agreement on expansion strategy.' : 'Different growth philosophies that can complement.'}`
      : 'No Jupiter-Jupiter aspect. Growth visions may differ.',
    strength: jupiterJupiter ? (jupiterJupiter.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (jupiterJupiter) standardPoints += jupiterJupiter.quality === 'harmonious' ? 8 : 4;

  // Saturn-Saturn: Mutual understanding of limitations
  const saturnSaturn = checkAspect(chart1, 'Saturn', chart2, 'Saturn');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Saturn-Saturn: Structural Agreement',
    found: !!saturnSaturn,
    aspect: saturnSaturn,
    planet1: 'Saturn',
    planet2: 'Saturn',
    tier: 2,
    points: saturnSaturn ? (saturnSaturn.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: saturnSaturn
      ? `${saturnSaturn.type} (${saturnSaturn.orb}° orb): Similar understanding of limits and responsibilities. ${saturnSaturn.quality === 'harmonious' ? 'Agreement on boundaries and timelines.' : 'Different but complementary approaches to structure.'}`
      : 'No Saturn-Saturn aspect. Structural approaches may differ.',
    strength: saturnSaturn ? (saturnSaturn.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (saturnSaturn) standardPoints += saturnSaturn.quality === 'harmonious' ? 8 : 4;

  // Mars-Mars: Shared Drive
  const marsMars = checkAspect(chart1, 'Mars', chart2, 'Mars');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Mars-Mars: Shared Drive',
    found: !!marsMars,
    aspect: marsMars,
    planet1: 'Mars',
    planet2: 'Mars',
    tier: 2,
    points: marsMars ? (marsMars.quality === 'harmonious' ? 8 : 3) : 0,
    interpretation: marsMars
      ? `${marsMars.type} (${marsMars.orb}° orb): Your action styles ${marsMars.quality === 'harmonious' ? 'align well - you energize each other' : 'clash - different approaches to getting things done'}.`
      : 'No Mars-Mars aspect. Your working styles may differ.',
    strength: marsMars ? (marsMars.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (marsMars) standardPoints += marsMars.quality === 'harmonious' ? 8 : 3;

  // Juno-Sun: Legal partnership (NEW - important for business)
  const junoSun = checkAspect(chart1, 'Juno', chart2, 'Sun') || checkAspect(chart2, 'Juno', chart1, 'Sun');
  if (chart1.planets.Juno || chart2.planets.Juno) {
    maxStandardPoints += 7;
    indicators.push({
      name: 'Juno-Sun: Partnership Commitment',
      found: !!junoSun,
      aspect: junoSun,
      planet1: 'Juno',
      planet2: 'Sun',
      tier: 2,
      points: junoSun ? 7 : 0,
      interpretation: junoSun
        ? `${junoSun.type} (${junoSun.orb}° orb): Juno brings commitment energy. Natural inclination toward formal partnership/contracts.`
        : 'No Juno-Sun aspect. Commitment needs conscious cultivation.',
      strength: junoSun ? 'strong' : 'weak'
    });
    if (junoSun) standardPoints += 7;
  }

  // Juno-Mercury: Contract communication (NEW)
  const junoMercury = checkAspect(chart1, 'Juno', chart2, 'Mercury') || checkAspect(chart2, 'Juno', chart1, 'Mercury');
  if (chart1.planets.Juno || chart2.planets.Juno) {
    maxStandardPoints += 6;
    indicators.push({
      name: 'Juno-Mercury: Contract Communication',
      found: !!junoMercury,
      aspect: junoMercury,
      planet1: 'Juno',
      planet2: 'Mercury',
      tier: 2,
      points: junoMercury ? 6 : 0,
      interpretation: junoMercury
        ? `${junoMercury.type} (${junoMercury.orb}° orb): Juno meets Mercury. Good for negotiating contracts and formal agreements.`
        : 'No Juno-Mercury aspect.',
      strength: junoMercury ? 'moderate' : 'weak'
    });
    if (junoMercury) standardPoints += 6;
  }

  // ============================================
  // SUN-MC (Midheaven) - Career elevation indicator
  // This is MAJOR for business - partner elevates your career
  // ============================================
  const sunMC1 = checkAspect(chart1, 'Sun', chart2, 'MC');
  const sunMC2 = checkAspect(chart2, 'Sun', chart1, 'MC');
  const sunMC = sunMC1 || sunMC2;
  const hasMC = (chart1.planets as Record<string, NatalPlanetPosition | undefined>)['MC'] || (chart2.planets as Record<string, NatalPlanetPosition | undefined>)['MC'];
  if (hasMC) {
    maxStandardPoints += 10;
    indicators.push({
      name: '★★ Sun-Midheaven: Career Elevation',
      found: !!sunMC,
      aspect: sunMC,
      planet1: 'Sun',
      planet2: 'MC',
      tier: 1,
      points: sunMC ? (sunMC.quality === 'harmonious' || sunMC.type === 'conjunction' ? 10 : 6) : 0,
      interpretation: sunMC 
        ? `${sunMC.type} (${sunMC.orb}° orb): POWERFUL career synergy! The Sun person elevates the MC person's professional standing. ${sunMC.quality === 'harmonious' || sunMC.type === 'conjunction' ? 'Natural career boost - partnership enhances public reputation.' : 'Career impact is strong but may require navigation.'}`
        : 'No Sun-MC aspect. Career impacts flow through other channels.',
      strength: sunMC ? 'strong' : 'weak'
    });
    if (sunMC) standardPoints += sunMC.quality === 'harmonious' || sunMC.type === 'conjunction' ? 10 : 6;
  }

  // ============================================
  // TIER 3: SUPPORTING INDICATORS (5-6 pts each)
  // ============================================

  // Pallas for strategy (APPROPRIATE for business)
  const pallasSun = checkAspect(chart1, 'Pallas', chart2, 'Sun') || checkAspect(chart2, 'Pallas', chart1, 'Sun');
  if (chart1.planets.Pallas || chart2.planets.Pallas) {
    maxStandardPoints += 5;
    indicators.push({
      name: 'Pallas-Sun: Strategic Vision',
      found: !!pallasSun,
      aspect: pallasSun,
      planet1: 'Pallas',
      planet2: 'Sun',
      tier: 3,
      points: pallasSun ? 5 : 0,
      interpretation: pallasSun
        ? `${pallasSun.type} (${pallasSun.orb}° orb): Pallas (goddess of strategy) enhances planning ability together. Natural strategic alignment.`
        : 'No Pallas-Sun aspect.',
      strength: pallasSun ? 'moderate' : 'weak'
    });
    if (pallasSun) standardPoints += 5;
  }

  const pallasMercury = checkAspect(chart1, 'Pallas', chart2, 'Mercury') || checkAspect(chart2, 'Pallas', chart1, 'Mercury');
  if (chart1.planets.Pallas || chart2.planets.Pallas) {
    maxStandardPoints += 4;
    indicators.push({
      name: 'Pallas-Mercury: Strategic Communication',
      found: !!pallasMercury,
      aspect: pallasMercury,
      planet1: 'Pallas',
      planet2: 'Mercury',
      tier: 3,
      points: pallasMercury ? 4 : 0,
      interpretation: pallasMercury
        ? `${pallasMercury.type} (${pallasMercury.orb}° orb): Strategic thinking meets communication. Excellent for planning and negotiations.`
        : 'No Pallas-Mercury aspect.',
      strength: pallasMercury ? 'moderate' : 'weak'
    });
    if (pallasMercury) standardPoints += 4;
  }

  // Vesta for dedication (APPROPRIATE for business)
  const vestaSun = checkAspect(chart1, 'Vesta', chart2, 'Sun') || checkAspect(chart2, 'Vesta', chart1, 'Sun');
  if (chart1.planets.Vesta || chart2.planets.Vesta) {
    maxStandardPoints += 4;
    indicators.push({
      name: 'Vesta-Sun: Dedicated Focus',
      found: !!vestaSun,
      aspect: vestaSun,
      planet1: 'Vesta',
      planet2: 'Sun',
      tier: 3,
      points: vestaSun ? 4 : 0,
      interpretation: vestaSun
        ? `${vestaSun.type} (${vestaSun.orb}° orb): Vesta (goddess of the hearth/focus) brings sacred dedication to shared goals. Deep commitment to the work.`
        : 'No Vesta-Sun aspect.',
      strength: vestaSun ? 'moderate' : 'weak'
    });
    if (vestaSun) standardPoints += 4;
  }

  // ============================================
  // MAJOR KARMIC INDICATORS - FLAT BONUSES
  // These create a "floor" for business potential
  // ============================================
  
  // Saturn-North Node: THE major professional destiny indicator
  const saturnNorthNode = checkAspect(chart1, 'Saturn', chart2, 'NorthNode') || checkAspect(chart2, 'Saturn', chart1, 'NorthNode');
  if (saturnNorthNode) {
    const isConjunction = saturnNorthNode.type === 'conjunction';
    // Note: Opposition to North Node = Conjunction to South Node (past-life connection)
    const isOpposition = saturnNorthNode.type === 'opposition';
    const points = isConjunction ? 15 : isOpposition ? 10 : 8;
    karmicBonus += points;
    
    indicators.push({
      name: '★★★ KARMIC: Saturn-North Node',
      found: true,
      aspect: saturnNorthNode,
      planet1: 'Saturn',
      planet2: 'NorthNode',
      tier: 0, // Special tier for major karmic
      points,
      interpretation: isOpposition
        ? `${saturnNorthNode.type} (${saturnNorthNode.orb}° orb): **PAST-LIFE PROFESSIONAL BOND.** Saturn opposing North Node (conjunct South Node) indicates you worked together before. Instant professional familiarity.`
        : `${saturnNorthNode.type} (${saturnNorthNode.orb}° orb): **MAJOR FATED BUSINESS CONNECTION.** Saturn provides the structure, lessons, and authority the North Node person needs for their professional destiny. ${isConjunction ? 'The CONJUNCTION is the strongest possible indicator of professional karma.' : 'This aspect indicates significant professional destiny together.'}`,
      strength: 'strong'
    });
  }

  // North Node-Jupiter: Growth destiny - expands professional path
  const nodeJupiter = checkAspect(chart1, 'NorthNode', chart2, 'Jupiter') || checkAspect(chart2, 'NorthNode', chart1, 'Jupiter');
  if (nodeJupiter) {
    const isConjunction = nodeJupiter.type === 'conjunction';
    const points = isConjunction ? 12 : 8;
    karmicBonus += points;
    
    indicators.push({
      name: '★★ KARMIC: North Node-Jupiter',
      found: true,
      aspect: nodeJupiter,
      planet1: 'NorthNode',
      planet2: 'Jupiter',
      tier: 0,
      points,
      interpretation: `${nodeJupiter.type} (${nodeJupiter.orb}° orb): **GROWTH DESTINY.** Jupiter blesses the partnership with expansion and opportunity. You attract fortunate circumstances together. ${isConjunction ? 'This conjunction brings exceptional luck to shared ventures.' : 'Growth naturally aligns with professional destiny.'}`,
      strength: 'strong'
    });
  }

  // North Node-MC: Professional destiny alignment
  const nodeMC1 = checkAspect(chart1, 'NorthNode', chart2, 'MC');
  const nodeMC2 = checkAspect(chart2, 'NorthNode', chart1, 'MC');
  const nodeMC = nodeMC1 || nodeMC2;
  if (nodeMC && hasMC) {
    const points = nodeMC.type === 'conjunction' ? 12 : 8;
    karmicBonus += points;
    
    indicators.push({
      name: '★★ KARMIC: North Node-Midheaven',
      found: true,
      aspect: nodeMC,
      planet1: 'NorthNode',
      planet2: 'MC',
      tier: 0,
      points,
      interpretation: `${nodeMC.type} (${nodeMC.orb}° orb): **PROFESSIONAL DESTINY.** The North Node aligns with career potential. This partnership is meant to impact your public standing and professional evolution.`,
      strength: 'strong'
    });
  }

  // ============================================
  // FATED POINTS: Vertex & Part of Fortune
  // ============================================
  
  // Sun-Vertex: Fated business meeting
  const sunVertex1 = checkAspect(chart1, 'Sun', chart2, 'Vertex');
  const sunVertex2 = checkAspect(chart2, 'Sun', chart1, 'Vertex');
  const sunVertex = sunVertex1 || sunVertex2;
  if (sunVertex && (chart1.planets.Vertex || chart2.planets.Vertex)) {
    karmicBonus += 8;
    indicators.push({
      name: '★ FATED: Sun-Vertex',
      found: true,
      aspect: sunVertex,
      planet1: 'Sun',
      planet2: 'Vertex',
      tier: 0,
      points: 8,
      interpretation: `${sunVertex.type} (${sunVertex.orb}° orb): **FATED MEETING.** The Vertex indicates destined encounters. Your meeting was meant to happen and has professional significance.`,
      strength: 'strong'
    });
  }

  // Saturn-Vertex: Structured destiny bond
  const saturnVertex1 = checkAspect(chart1, 'Saturn', chart2, 'Vertex');
  const saturnVertex2 = checkAspect(chart2, 'Saturn', chart1, 'Vertex');
  const saturnVertex = saturnVertex1 || saturnVertex2;
  if (saturnVertex && (chart1.planets.Vertex || chart2.planets.Vertex)) {
    karmicBonus += 6;
    indicators.push({
      name: '★ FATED: Saturn-Vertex',
      found: true,
      aspect: saturnVertex,
      planet1: 'Saturn',
      planet2: 'Vertex',
      tier: 0,
      points: 6,
      interpretation: `${saturnVertex.type} (${saturnVertex.orb}° orb): **DESTINED STRUCTURE.** Saturn's lessons meet the Vertex's fate. This partnership is meant to provide important professional lessons and structures.`,
      strength: 'moderate'
    });
  }

  // Part of Fortune connections
  const pofSun = checkAspect(chart1, 'PartOfFortune', chart2, 'Sun') || checkAspect(chart2, 'PartOfFortune', chart1, 'Sun');
  if (pofSun && (chart1.planets.PartOfFortune || chart2.planets.PartOfFortune)) {
    karmicBonus += 6;
    indicators.push({
      name: '★ PROSPERITY: Part of Fortune-Sun',
      found: true,
      aspect: pofSun,
      planet1: 'PartOfFortune',
      planet2: 'Sun',
      tier: 0,
      points: 6,
      interpretation: `${pofSun.type} (${pofSun.orb}° orb): **PROSPERITY TOGETHER.** The Part of Fortune indicates material success. This partnership has strong potential for financial gain.`,
      strength: 'strong'
    });
  }

  const pofJupiter = checkAspect(chart1, 'PartOfFortune', chart2, 'Jupiter') || checkAspect(chart2, 'PartOfFortune', chart1, 'Jupiter');
  if (pofJupiter && (chart1.planets.PartOfFortune || chart2.planets.PartOfFortune)) {
    karmicBonus += 8;
    indicators.push({
      name: '★★ PROSPERITY: Part of Fortune-Jupiter',
      found: true,
      aspect: pofJupiter,
      planet1: 'PartOfFortune',
      planet2: 'Jupiter',
      tier: 0,
      points: 8,
      interpretation: `${pofJupiter.type} (${pofJupiter.orb}° orb): **LUCKY FINANCIAL PARTNERSHIP.** Fortune meets expansion - excellent for profitable ventures together.`,
      strength: 'strong'
    });
  }

  // ============================================
  // HOUSE OVERLAY INTEGRATION
  // Business-relevant houses: 2nd (money), 6th (work), 7th (contracts), 10th (career), 11th (goals)
  // ============================================
  const bizAsc1 = chart1.houseCusps?.house1 || chart1.planets.Ascendant;
  const bizAsc2 = chart2.houseCusps?.house1 || chart2.planets.Ascendant;
  if (bizAsc1 && bizAsc2) {
    const businessPlanets = ['Sun', 'Saturn', 'Jupiter', 'Mars', 'Mercury'];
    const businessHouses = [2, 6, 7, 10, 11];
    
    // Check Person 1's planets in Person 2's business houses
    for (const planet of businessPlanets) {
      const planetPos = chart1.planets[planet as keyof typeof chart1.planets];
      if (!planetPos) continue;
      
      const house = getHouseForPlanet(planetPos, bizAsc2.sign);
      if (businessHouses.includes(house)) {
        let bonus = 0;
        
        switch(house) {
          case 2: 
            bonus = planet === 'Jupiter' ? 5 : 3; 
            break;
          case 6: 
            bonus = planet === 'Saturn' || planet === 'Mercury' ? 4 : 2; 
            break;
          case 7: 
            bonus = planet === 'Sun' || planet === 'Saturn' ? 6 : 4; 
            break;
          case 10: 
            bonus = planet === 'Sun' || planet === 'Jupiter' ? 8 : 5; 
            break;
          case 11: 
            bonus = planet === 'Jupiter' ? 5 : 3; 
            break;
        }
        
        houseOverlayBonus += bonus;
      }
    }
    
    // Check Person 2's planets in Person 1's business houses
    for (const planet of businessPlanets) {
      const planetPos = chart2.planets[planet as keyof typeof chart2.planets];
      if (!planetPos) continue;
      
      const house = getHouseForPlanet(planetPos, bizAsc1.sign);
      if (businessHouses.includes(house)) {
        let bonus = 0;
        
        switch(house) {
          case 2: bonus = planet === 'Jupiter' ? 5 : 3; break;
          case 6: bonus = planet === 'Saturn' || planet === 'Mercury' ? 4 : 2; break;
          case 7: bonus = planet === 'Sun' || planet === 'Saturn' ? 6 : 4; break;
          case 10: bonus = planet === 'Sun' || planet === 'Jupiter' ? 8 : 5; break;
          case 11: bonus = planet === 'Jupiter' ? 5 : 3; break;
        }
        
        houseOverlayBonus += bonus;
      }
    }
    
    // Cap house overlay bonus at 15
    houseOverlayBonus = Math.min(15, houseOverlayBonus);
    
    if (houseOverlayBonus > 5) {
      indicators.push({
        name: `House Overlays: Business Sectors Active`,
        found: true,
        tier: 2,
        points: houseOverlayBonus,
        interpretation: `Planets fall in each other's business-relevant houses (2nd/6th/7th/10th/11th), activating financial, work, partnership, and career sectors.`,
        strength: houseOverlayBonus >= 10 ? 'strong' : 'moderate'
      });
    }
  }

  // ============================================
  // NEGATIVE MODIFIERS (tension aspects reduce score)
  // ============================================
  const plutoSun = checkAspect(chart1, 'Pluto', chart2, 'Sun') || checkAspect(chart2, 'Pluto', chart1, 'Sun');
  if (plutoSun && plutoSun.quality === 'tense') {
    indicators.push({
      name: '⚠️ Pluto-Sun: Power Dynamics',
      found: true,
      aspect: plutoSun,
      planet1: 'Pluto',
      planet2: 'Sun',
      tier: 4,
      points: -5,
      interpretation: `${plutoSun.type} (${plutoSun.orb}° orb): Intense power dynamics. Power struggles possible - requires mature handling and clear boundaries.`,
      strength: 'moderate'
    });
    standardPoints -= 5; // Penalty for tense power dynamics
  }

  const marsSaturn = checkAspect(chart1, 'Mars', chart2, 'Saturn') || checkAspect(chart2, 'Mars', chart1, 'Saturn');
  if (marsSaturn && marsSaturn.quality === 'tense') {
    indicators.push({
      name: '⚠️ Mars-Saturn: Frustration Pattern',
      found: true,
      aspect: marsSaturn,
      planet1: 'Mars',
      planet2: 'Saturn',
      tier: 4,
      points: -4,
      interpretation: `${marsSaturn.type} (${marsSaturn.orb}° orb): Mars feels blocked by Saturn's restrictions. Saturn feels Mars is reckless. Requires patience and clear expectations.`,
      strength: 'moderate'
    });
    standardPoints -= 4;
  }

  // ============================================
  // CALCULATE FINAL PERCENTAGE
  // ============================================
  const aspectRatio = calculateAspectRatio(indicators);
  const aspectRatioModifier = getAspectRatioModifier(aspectRatio.ratio);
  
  const baseScore = 25;
  const standardPercentage = maxStandardPoints > 0 ? (Math.max(0, standardPoints) / maxStandardPoints) * 40 : 0;
  
  // Cap karmic bonus at 22 points (STANDARDIZED across all focus types)
  const cappedKarmicBonus = Math.min(22, karmicBonus);
  
  // Cap house overlay bonus contribution
  const cappedHouseBonus = Math.min(10, houseOverlayBonus);
  
  // Final calculation with aspect ratio modifier
  let overallStrength = Math.round(baseScore + standardPercentage + cappedKarmicBonus + cappedHouseBonus + aspectRatioModifier);
  
  // Realistic bounds: 15% minimum (anyone can work together with effort), 92% maximum (nothing is perfect)
  overallStrength = Math.max(15, Math.min(92, overallStrength));
  
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  const karmicIndicators = indicators.filter(i => i.name.includes('KARMIC') || i.name.includes('FATED') || i.name.includes('PROSPERITY'));
  const challenges = indicators.filter(i => i.name.includes('⚠️'));
  
  // Generate summary based on score ranges
  let summary: string;
  if (overallStrength >= 78) {
    summary = `Exceptional business partnership potential (${overallStrength}%). ${karmicIndicators.length > 0 ? `${karmicIndicators.length} karmic indicator(s) suggest a fated professional bond.` : 'Strong alignment across key business indicators.'} ${strongIndicators.length} major supportive aspects create a powerful foundation.`;
  } else if (overallStrength >= 65) {
    summary = `Strong business partnership potential (${overallStrength}%). ${strongIndicators.length} key indicators support professional success together. ${karmicIndicators.length > 0 ? 'Karmic elements add depth and purpose.' : 'Solid foundations for shared ventures.'}`;
  } else if (overallStrength >= 50) {
    summary = `Moderate business potential (${overallStrength}%). ${strongIndicators.length > 0 ? `${strongIndicators.length} supportive indicator(s) provide a foundation.` : 'Potential exists with conscious effort.'} ${karmicIndicators.length > 0 ? 'Karmic connections suggest deeper purpose.' : 'Clear roles and communication will be essential.'}`;
  } else if (overallStrength >= 35) {
    summary = `Business partnership would require significant effort (${overallStrength}%). While not impossible, success depends on clearly defined roles, regular communication, and possibly complementary skills that aren't reflected in the chart aspects.`;
  } else {
    summary = `Business partnership faces significant challenges (${overallStrength}%). This doesn't mean failure is certain, but both partners would need to work harder to align professionally. Consider whether this partnership serves other purposes (friendship, creative) more naturally.`;
  }
  
  return {
    focus: 'business',
    title: 'Business Partnership Analysis',
    overallStrength,
    indicators: indicators.sort((a, b) => (a.tier || 99) - (b.tier || 99)),
    summary,
    aspectRatio,
    maxStandardPoints,
    earnedStandardPoints: Math.max(0, standardPoints),
    recommendations: [
      ...(karmicIndicators.length > 0 ? [`★ ${karmicIndicators.length} karmic/fated indicator(s) suggest this partnership has deeper professional purpose.`] : []),
      ...(saturnNorthNode ? ['★★ Your Saturn-North Node connection is a MAJOR indicator of fated professional relationship - this is rare and significant.'] : []),
      ...(marsJupiter ? ['★ Your Mars-Jupiter "millionaire combination" favors ambitious ventures.'] : []),
      ...(nodeJupiter ? ['★ Your Node-Jupiter brings growth and luck to shared ventures.'] : []),
      ...(saturnSun ? ['Leverage your Saturn-Sun dynamic for clear authority structures.'] : ['Establish explicit decision-making agreements.']),
      ...(mercuryMercury ? ['Use your Mercury connection for regular strategy sessions.'] : ['Schedule regular check-ins to bridge communication styles.']),
      ...(jupiterSaturn ? ['Balance vision (Jupiter) with execution (Saturn).'] : []),
      ...(houseOverlayBonus > 5 ? [`House overlays activate ${houseOverlayBonus >= 10 ? 'multiple' : 'key'} business sectors in each other's charts.`] : []),
      ...(challenges.length > 0 ? ['Address power dynamics and frustration patterns proactively with clear boundaries.'] : [])
    ]
  };
}

// ============================================
// FRIENDSHIP ANALYSIS - Professional-grade
// Target: ~120 max standard points (NORMALIZED)
// ============================================
function analyzeFriendship(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let standardPoints = 0;
  let maxStandardPoints = 0;
  let karmicBonus = 0;
  
  // ============================================
  // TIER 1: Core friendship indicators (10 pts each)
  // ============================================
  
  const mercuryMercury = checkAspect(chart1, 'Mercury', chart2, 'Mercury');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Mercury-Mercury: Conversation Flow',
    found: !!mercuryMercury,
    aspect: mercuryMercury,
    planet1: 'Mercury',
    planet2: 'Mercury',
    tier: 1,
    points: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: mercuryMercury
      ? `${mercuryMercury.type} (${mercuryMercury.orb}° orb): ${mercuryMercury.quality === 'harmonious' ? 'You could talk for hours! Natural mental rapport.' : 'Stimulating discussions that make each other think.'}`
      : 'No direct Mercury aspect. Conversation may require more effort.',
    strength: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryMercury) standardPoints += mercuryMercury.quality === 'harmonious' ? 10 : 5;
  
  const sunMoon = checkAspect(chart1, 'Sun', chart2, 'Moon') || checkAspect(chart2, 'Sun', chart1, 'Moon');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Sun-Moon: Core Understanding',
    found: !!sunMoon,
    aspect: sunMoon,
    planet1: 'Sun',
    planet2: 'Moon',
    tier: 1,
    points: sunMoon ? (sunMoon.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: sunMoon
      ? `${sunMoon.type} (${sunMoon.orb}° orb): ${sunMoon.quality === 'harmonious' ? 'You "get" each other at a fundamental level.' : 'Your core natures interact intensely.'}`
      : 'No Sun-Moon aspect. Understanding develops over time.',
    strength: sunMoon ? (sunMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (sunMoon) standardPoints += sunMoon.quality === 'harmonious' ? 10 : 5;
  
  const sunSun = checkAspect(chart1, 'Sun', chart2, 'Sun');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Sun-Sun: Identity Resonance',
    found: !!sunSun,
    aspect: sunSun,
    planet1: 'Sun',
    planet2: 'Sun',
    tier: 1,
    points: sunSun ? (sunSun.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: sunSun
      ? `${sunSun.type} (${sunSun.orb}° orb): ${sunSun.quality === 'harmonious' ? 'Your core selves resonate naturally.' : 'Dynamic interplay of identities.'}`
      : 'No Sun-Sun aspect. Different identities can complement.',
    strength: sunSun ? (sunSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (sunSun) standardPoints += sunSun.quality === 'harmonious' ? 10 : 5;

  const moonMoon = checkAspect(chart1, 'Moon', chart2, 'Moon');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Moon-Moon: Emotional Resonance',
    found: !!moonMoon,
    aspect: moonMoon,
    planet1: 'Moon',
    planet2: 'Moon',
    tier: 1,
    points: moonMoon ? (moonMoon.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: moonMoon
      ? `${moonMoon.type} (${moonMoon.orb}° orb): ${moonMoon.quality === 'harmonious' ? 'Deep emotional understanding.' : 'Emotional needs interact intensely.'}`
      : 'No Moon-Moon aspect. Emotional attunement develops through experience.',
    strength: moonMoon ? (moonMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (moonMoon) standardPoints += moonMoon.quality === 'harmonious' ? 10 : 5;
  
  // ============================================
  // TIER 2: Supporting indicators (8 pts each)
  // ============================================
  
  const jupiterMoon = checkAspect(chart1, 'Jupiter', chart2, 'Moon') || checkAspect(chart2, 'Jupiter', chart1, 'Moon');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Jupiter-Moon: Emotional Uplift',
    found: !!jupiterMoon,
    aspect: jupiterMoon,
    planet1: 'Jupiter',
    planet2: 'Moon',
    tier: 2,
    points: jupiterMoon ? 8 : 0,
    interpretation: jupiterMoon
      ? `${jupiterMoon.type} (${jupiterMoon.orb}° orb): You make each other feel good! Naturally supportive and encouraging.`
      : 'No Jupiter-Moon aspect. Emotional support needs conscious cultivation.',
    strength: jupiterMoon ? 'strong' : 'weak'
  });
  if (jupiterMoon) standardPoints += 8;
  
  const venusVenus = checkAspect(chart1, 'Venus', chart2, 'Venus');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Venus-Venus: Shared Pleasures',
    found: !!venusVenus,
    aspect: venusVenus,
    planet1: 'Venus',
    planet2: 'Venus',
    tier: 2,
    points: venusVenus ? (venusVenus.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: venusVenus
      ? `${venusVenus.type} (${venusVenus.orb}° orb): ${venusVenus.quality === 'harmonious' ? 'Similar tastes - easy companionship.' : 'Different but complementary values.'}`
      : 'No Venus-Venus aspect. Different tastes can introduce new things.',
    strength: venusVenus ? (venusVenus.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (venusVenus) standardPoints += venusVenus.quality === 'harmonious' ? 8 : 4;

  const jupiterJupiter = checkAspect(chart1, 'Jupiter', chart2, 'Jupiter');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Jupiter-Jupiter: Shared Joy',
    found: !!jupiterJupiter,
    aspect: jupiterJupiter,
    planet1: 'Jupiter',
    planet2: 'Jupiter',
    tier: 2,
    points: jupiterJupiter ? (jupiterJupiter.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: jupiterJupiter
      ? `${jupiterJupiter.type} (${jupiterJupiter.orb}° orb): You expand each other's worlds. Shared adventures and growth.`
      : 'No Jupiter-Jupiter aspect. Growth philosophies may differ.',
    strength: jupiterJupiter ? (jupiterJupiter.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (jupiterJupiter) standardPoints += jupiterJupiter.quality === 'harmonious' ? 8 : 4;

  const venusSun = checkAspect(chart1, 'Venus', chart2, 'Sun') || checkAspect(chart2, 'Venus', chart1, 'Sun');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Venus-Sun: Appreciation & Warmth',
    found: !!venusSun,
    aspect: venusSun,
    planet1: 'Venus',
    planet2: 'Sun',
    tier: 2,
    points: venusSun ? (venusSun.quality === 'harmonious' ? 8 : 5) : 0,
    interpretation: venusSun
      ? `${venusSun.type} (${venusSun.orb}° orb): Natural appreciation for each other. Venus admires Sun's essence.`
      : 'No Venus-Sun aspect. Appreciation develops through quality time.',
    strength: venusSun ? 'strong' : 'weak'
  });
  if (venusSun) standardPoints += venusSun.quality === 'harmonious' ? 8 : 5;

  const mercurySun = checkAspect(chart1, 'Mercury', chart2, 'Sun') || checkAspect(chart2, 'Mercury', chart1, 'Sun');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Mercury-Sun: Understanding Identity',
    found: !!mercurySun,
    aspect: mercurySun,
    planet1: 'Mercury',
    planet2: 'Sun',
    tier: 2,
    points: mercurySun ? (mercurySun.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: mercurySun
      ? `${mercurySun.type} (${mercurySun.orb}° orb): Communication flows naturally about who you really are.`
      : 'No Mercury-Sun aspect. Getting to know each other takes more time.',
    strength: mercurySun ? (mercurySun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercurySun) standardPoints += mercurySun.quality === 'harmonious' ? 8 : 4;

  const jupiterSun = checkAspect(chart1, 'Jupiter', chart2, 'Sun') || checkAspect(chart2, 'Jupiter', chart1, 'Sun');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Jupiter-Sun: Mutual Encouragement',
    found: !!jupiterSun,
    aspect: jupiterSun,
    planet1: 'Jupiter',
    planet2: 'Sun',
    tier: 2,
    points: jupiterSun ? 8 : 0,
    interpretation: jupiterSun
      ? `${jupiterSun.type} (${jupiterSun.orb}° orb): Jupiter expands and encourages Sun's identity. Natural cheerleaders for each other.`
      : 'No Jupiter-Sun aspect. Encouragement requires conscious effort.',
    strength: jupiterSun ? 'strong' : 'weak'
  });
  if (jupiterSun) standardPoints += 8;

  const mercuryMoon = checkAspect(chart1, 'Mercury', chart2, 'Moon') || checkAspect(chart2, 'Mercury', chart1, 'Moon');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Mercury-Moon: Emotional Communication',
    found: !!mercuryMoon,
    aspect: mercuryMoon,
    planet1: 'Mercury',
    planet2: 'Moon',
    tier: 2,
    points: mercuryMoon ? (mercuryMoon.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: mercuryMoon
      ? `${mercuryMoon.type} (${mercuryMoon.orb}° orb): Thoughts and feelings flow easily. You can talk about emotions.`
      : 'No Mercury-Moon aspect. Emotional discussions may feel awkward at first.',
    strength: mercuryMoon ? (mercuryMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryMoon) standardPoints += mercuryMoon.quality === 'harmonious' ? 8 : 4;

  // Neptune-Sun: Imaginative connection (NEW)
  const neptuneSun = checkAspect(chart1, 'Neptune', chart2, 'Sun') || checkAspect(chart2, 'Neptune', chart1, 'Sun');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Neptune-Sun: Imaginative Connection',
    found: !!neptuneSun,
    aspect: neptuneSun,
    planet1: 'Neptune',
    planet2: 'Sun',
    tier: 2,
    points: neptuneSun ? (neptuneSun.quality === 'harmonious' ? 7 : 4) : 0,
    interpretation: neptuneSun
      ? `${neptuneSun.type} (${neptuneSun.orb}° orb): Neptune inspires imagination. ${neptuneSun.quality === 'harmonious' ? 'Dreamy, idealistic friendship.' : 'Idealization that needs grounding.'}`
      : 'No Neptune-Sun aspect.',
    strength: neptuneSun ? (neptuneSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (neptuneSun) standardPoints += neptuneSun.quality === 'harmonious' ? 7 : 4;

  // Pallas-Sun: Intellectual friendship (NEW)
  const pallasSun = checkAspect(chart1, 'Pallas', chart2, 'Sun') || checkAspect(chart2, 'Pallas', chart1, 'Sun');
  if (chart1.planets.Pallas || chart2.planets.Pallas) {
    maxStandardPoints += 6;
    indicators.push({
      name: 'Pallas-Sun: Intellectual Friendship',
      found: !!pallasSun,
      aspect: pallasSun,
      planet1: 'Pallas',
      planet2: 'Sun',
      tier: 2,
      points: pallasSun ? 6 : 0,
      interpretation: pallasSun
        ? `${pallasSun.type} (${pallasSun.orb}° orb): Pallas brings wisdom and strategy. Great for intellectual bonding.`
        : 'No Pallas-Sun aspect.',
      strength: pallasSun ? 'moderate' : 'weak'
    });
    if (pallasSun) standardPoints += 6;
  }

  // Pallas-Mercury: Mental harmony (NEW)
  const pallasMercury = checkAspect(chart1, 'Pallas', chart2, 'Mercury') || checkAspect(chart2, 'Pallas', chart1, 'Mercury');
  if (chart1.planets.Pallas || chart2.planets.Pallas) {
    maxStandardPoints += 5;
    indicators.push({
      name: 'Pallas-Mercury: Mental Harmony',
      found: !!pallasMercury,
      aspect: pallasMercury,
      planet1: 'Pallas',
      planet2: 'Mercury',
      tier: 2,
      points: pallasMercury ? 5 : 0,
      interpretation: pallasMercury
        ? `${pallasMercury.type} (${pallasMercury.orb}° orb): Wisdom meets communication. Stimulating intellectual exchange.`
        : 'No Pallas-Mercury aspect.',
      strength: pallasMercury ? 'moderate' : 'weak'
    });
    if (pallasMercury) standardPoints += 5;
  }

  // Ceres-Moon: Supportive nurturing (NEW)
  const ceresMoon = checkAspect(chart1, 'Ceres', chart2, 'Moon') || checkAspect(chart2, 'Ceres', chart1, 'Moon');
  if (chart1.planets.Ceres || chart2.planets.Ceres) {
    maxStandardPoints += 6;
    indicators.push({
      name: 'Ceres-Moon: Supportive Nurturing',
      found: !!ceresMoon,
      aspect: ceresMoon,
      planet1: 'Ceres',
      planet2: 'Moon',
      tier: 2,
      points: ceresMoon ? 6 : 0,
      interpretation: ceresMoon
        ? `${ceresMoon.type} (${ceresMoon.orb}° orb): Ceres brings nurturing energy. Emotionally supportive friendship.`
        : 'No Ceres-Moon aspect.',
      strength: ceresMoon ? 'moderate' : 'weak'
    });
    if (ceresMoon) standardPoints += 6;
  }
  
  // ============================================
  // TIER 3: Bonus indicators (5-6 pts each)
  // ============================================
  
  const uranusSun = checkAspect(chart1, 'Uranus', chart2, 'Sun') || checkAspect(chart2, 'Uranus', chart1, 'Sun');
  maxStandardPoints += 5;
  indicators.push({
    name: 'Uranus-Sun: Excitement Factor',
    found: !!uranusSun,
    aspect: uranusSun,
    planet1: 'Uranus',
    planet2: 'Sun',
    tier: 3,
    points: uranusSun ? 5 : 0,
    interpretation: uranusSun
      ? `${uranusSun.type} (${uranusSun.orb}° orb): Never boring! Exciting adventures together.`
      : 'No Uranus-Sun aspect. Excitement comes from elsewhere.',
    strength: uranusSun ? 'moderate' : 'weak'
  });
  if (uranusSun) standardPoints += 5;

  const uranusMoon = checkAspect(chart1, 'Uranus', chart2, 'Moon') || checkAspect(chart2, 'Uranus', chart1, 'Moon');
  maxStandardPoints += 5;
  indicators.push({
    name: 'Uranus-Moon: Emotional Freedom',
    found: !!uranusMoon,
    aspect: uranusMoon,
    planet1: 'Uranus',
    planet2: 'Moon',
    tier: 3,
    points: uranusMoon ? 5 : 0,
    interpretation: uranusMoon
      ? `${uranusMoon.type} (${uranusMoon.orb}° orb): Friendship feels liberating. You encourage each other's authenticity.`
      : 'No Uranus-Moon aspect.',
    strength: uranusMoon ? 'moderate' : 'weak'
  });
  if (uranusMoon) standardPoints += 5;

  const marsSun = checkAspect(chart1, 'Mars', chart2, 'Sun') || checkAspect(chart2, 'Mars', chart1, 'Sun');
  maxStandardPoints += 6;
  indicators.push({
    name: 'Mars-Sun: Active Energy',
    found: !!marsSun,
    aspect: marsSun,
    planet1: 'Mars',
    planet2: 'Sun',
    tier: 3,
    points: marsSun ? (marsSun.quality === 'harmonious' ? 6 : 3) : 0,
    interpretation: marsSun
      ? `${marsSun.type} (${marsSun.orb}° orb): ${marsSun.quality === 'harmonious' ? 'Great for active adventures together!' : 'Dynamic energy - can motivate or clash.'}`
      : 'No Mars-Sun aspect.',
    strength: marsSun ? (marsSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (marsSun) standardPoints += marsSun.quality === 'harmonious' ? 6 : 3;

  const marsMars = checkAspect(chart1, 'Mars', chart2, 'Mars');
  maxStandardPoints += 5;
  indicators.push({
    name: 'Mars-Mars: Shared Drive',
    found: !!marsMars,
    aspect: marsMars,
    planet1: 'Mars',
    planet2: 'Mars',
    tier: 3,
    points: marsMars ? (marsMars.quality === 'harmonious' ? 5 : 2) : 0,
    interpretation: marsMars
      ? `${marsMars.type} (${marsMars.orb}° orb): ${marsMars.quality === 'harmonious' ? 'Compatible energy levels for activities.' : 'Different action styles - can spark or clash.'}`
      : 'No Mars-Mars aspect.',
    strength: marsMars ? (marsMars.quality === 'harmonious' ? 'moderate' : 'weak') : 'weak'
  });
  if (marsMars) standardPoints += marsMars.quality === 'harmonious' ? 5 : 2;

  // Juno for loyalty in friendship
  const junoSun = checkAspect(chart1, 'Juno', chart2, 'Sun') || checkAspect(chart2, 'Juno', chart1, 'Sun');
  if (chart1.planets.Juno || chart2.planets.Juno) {
    maxStandardPoints += 6;
    indicators.push({
      name: 'Juno-Sun: Loyal Bond',
      found: !!junoSun,
      aspect: junoSun,
      planet1: 'Juno',
      planet2: 'Sun',
      tier: 3,
      points: junoSun ? 6 : 0,
      interpretation: junoSun
        ? `${junoSun.type} (${junoSun.orb}° orb): Juno brings commitment to the friendship. A loyal, enduring bond.`
        : 'No Juno-Sun aspect. Loyalty builds through time.',
      strength: junoSun ? 'strong' : 'weak'
    });
    if (junoSun) standardPoints += 6;
  }

  // Vesta for dedicated friendship
  const vestaSun = checkAspect(chart1, 'Vesta', chart2, 'Sun') || checkAspect(chart2, 'Vesta', chart1, 'Sun');
  if (chart1.planets.Vesta || chart2.planets.Vesta) {
    maxStandardPoints += 5;
    indicators.push({
      name: 'Vesta-Sun: Dedicated Friend',
      found: !!vestaSun,
      aspect: vestaSun,
      planet1: 'Vesta',
      planet2: 'Sun',
      tier: 3,
      points: vestaSun ? 5 : 0,
      interpretation: vestaSun
        ? `${vestaSun.type} (${vestaSun.orb}° orb): Vesta brings dedication. This friendship has focus and purpose.`
        : 'No Vesta-Sun aspect.',
      strength: vestaSun ? 'moderate' : 'weak'
    });
    if (vestaSun) standardPoints += 5;
  }

  // Chiron for healing friendships
  const chironSun = checkAspect(chart1, 'Chiron', chart2, 'Sun') || checkAspect(chart2, 'Chiron', chart1, 'Sun');
  maxStandardPoints += 5;
  indicators.push({
    name: 'Chiron-Sun: Healing Friendship',
    found: !!chironSun,
    aspect: chironSun,
    planet1: 'Chiron',
    planet2: 'Sun',
    tier: 3,
    points: chironSun ? 5 : 0,
    interpretation: chironSun
      ? `${chironSun.type} (${chironSun.orb}° orb): Chiron brings healing energy. You help each other grow through wounds.`
      : 'No Chiron-Sun aspect.',
    strength: chironSun ? 'moderate' : 'weak'
  });
  if (chironSun) standardPoints += 5;

  const chironMoon = checkAspect(chart1, 'Chiron', chart2, 'Moon') || checkAspect(chart2, 'Chiron', chart1, 'Moon');
  maxStandardPoints += 5;
  indicators.push({
    name: 'Chiron-Moon: Emotional Healing',
    found: !!chironMoon,
    aspect: chironMoon,
    planet1: 'Chiron',
    planet2: 'Moon',
    tier: 3,
    points: chironMoon ? 5 : 0,
    interpretation: chironMoon
      ? `${chironMoon.type} (${chironMoon.orb}° orb): Deep emotional healing potential. Safe space for vulnerability.`
      : 'No Chiron-Moon aspect.',
    strength: chironMoon ? 'moderate' : 'weak'
  });
  if (chironMoon) standardPoints += 5;

  // Vertex for fated friendships
  const vertexSun = checkAspect(chart1, 'Vertex', chart2, 'Sun') || checkAspect(chart2, 'Vertex', chart1, 'Sun');
  if ((chart1.planets.Vertex || chart2.planets.Vertex) && vertexSun) {
    karmicBonus += vertexSun.type === 'conjunction' ? 8 : 5;
    indicators.push({
      name: '★ FATED: Vertex-Sun Connection',
      found: true,
      aspect: vertexSun,
      planet1: 'Vertex',
      planet2: 'Sun',
      tier: 0,
      points: vertexSun.type === 'conjunction' ? 8 : 5,
      interpretation: `${vertexSun.type} (${vertexSun.orb}° orb): Vertex indicates fated encounters. This friendship was "meant to happen."`,
      strength: 'strong'
    });
  }

  // ============================================
  // KARMIC INDICATORS (Flat bonus)
  // ============================================

  const nodeVenus = checkAspect(chart1, 'NorthNode', chart2, 'Venus') || checkAspect(chart2, 'NorthNode', chart1, 'Venus');
  if (nodeVenus) {
    const pts = nodeVenus.type === 'conjunction' ? 10 : nodeVenus.type === 'opposition' ? 8 : 6;
    karmicBonus += pts;
    indicators.push({
      name: '★ KARMIC: North Node-Venus',
      found: true,
      aspect: nodeVenus,
      planet1: 'NorthNode',
      planet2: 'Venus',
      tier: 0,
      points: pts,
      interpretation: nodeVenus.type === 'opposition' 
        ? `${nodeVenus.type} (${nodeVenus.orb}° orb): Venus opposite North Node (conjunct South Node) indicates past-life affection. Instant familiarity and comfort.`
        : `${nodeVenus.type} (${nodeVenus.orb}° orb): Fated connection bringing love and appreciation into each other's lives.`,
      strength: 'strong'
    });
  }

  const nodeSun = checkAspect(chart1, 'NorthNode', chart2, 'Sun') || checkAspect(chart2, 'NorthNode', chart1, 'Sun');
  if (nodeSun) {
    const pts = nodeSun.type === 'conjunction' ? 12 : nodeSun.type === 'opposition' ? 10 : 7;
    karmicBonus += pts;
    indicators.push({
      name: '★★ KARMIC: North Node-Sun',
      found: true,
      aspect: nodeSun,
      planet1: 'NorthNode',
      planet2: 'Sun',
      tier: 0,
      points: pts,
      interpretation: nodeSun.type === 'opposition'
        ? `${nodeSun.type} (${nodeSun.orb}° orb): Sun opposite North Node (conjunct South Node) indicates **PAST LIFE FRIEND.** Instant familiarity - you likely knew each other before.`
        : `${nodeSun.type} (${nodeSun.orb}° orb): Destined friendship. The Sun person embodies growth for the Node person.`,
      strength: 'strong'
    });
  }

  const nodeMoon = checkAspect(chart1, 'NorthNode', chart2, 'Moon') || checkAspect(chart2, 'NorthNode', chart1, 'Moon');
  if (nodeMoon) {
    const pts = nodeMoon.type === 'conjunction' ? 10 : nodeMoon.type === 'opposition' ? 10 : 6;
    karmicBonus += pts;
    indicators.push({
      name: nodeMoon.type === 'opposition' ? '★★ KARMIC: Past Life Friend (Moon)' : '★ KARMIC: North Node-Moon',
      found: true,
      aspect: nodeMoon,
      planet1: 'NorthNode',
      planet2: 'Moon',
      tier: 0,
      points: pts,
      interpretation: nodeMoon.type === 'opposition'
        ? `${nodeMoon.type} (${nodeMoon.orb}° orb): **PAST LIFE FRIEND.** Moon opposite North Node (conjunct South Node) brings instant familiarity - you likely knew each other before.`
        : `${nodeMoon.type} (${nodeMoon.orb}° orb): Emotional destiny connection. Deep comfort and understanding.`,
      strength: 'strong'
    });
  }

  const nodeJupiter = checkAspect(chart1, 'NorthNode', chart2, 'Jupiter') || checkAspect(chart2, 'NorthNode', chart1, 'Jupiter');
  if (nodeJupiter) {
    const pts = nodeJupiter.type === 'conjunction' ? 10 : 6;
    karmicBonus += pts;
    indicators.push({
      name: '★ KARMIC: North Node-Jupiter',
      found: true,
      aspect: nodeJupiter,
      planet1: 'NorthNode',
      planet2: 'Jupiter',
      tier: 0,
      points: pts,
      interpretation: `${nodeJupiter.type} (${nodeJupiter.orb}° orb): Growth and expansion aligned with destiny. Lucky friendship.`,
      strength: 'strong'
    });
  }
  
  // ============================================
  // CALCULATE FINAL SCORE
  // ============================================
  const aspectRatio = calculateAspectRatio(indicators);
  const aspectRatioModifier = getAspectRatioModifier(aspectRatio.ratio);
  
  const baseScore = 25;
  const standardPercentage = maxStandardPoints > 0 ? (Math.max(0, standardPoints) / maxStandardPoints) * 45 : 0;
  const cappedKarmicBonus = Math.min(22, karmicBonus); // STANDARDIZED cap
  
  let overallStrength = Math.round(baseScore + standardPercentage + cappedKarmicBonus + aspectRatioModifier);
  overallStrength = Math.max(15, Math.min(92, overallStrength));
  
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  const karmicIndicators = indicators.filter(i => i.name.includes('KARMIC') || i.name.includes('FATED'));
  
  return {
    focus: 'friendship',
    title: 'Friendship Compatibility Analysis',
    overallStrength,
    indicators: indicators.sort((a, b) => (a.tier || 99) - (b.tier || 99)),
    aspectRatio,
    maxStandardPoints,
    earnedStandardPoints: Math.max(0, standardPoints),
    summary: overallStrength >= 70
      ? `Strong friendship potential (${overallStrength}%)! ${strongIndicators.length} key connections support natural companionship.${karmicIndicators.length > 0 ? ' Karmic elements suggest a fated bond.' : ''}`
      : overallStrength >= 50
      ? `Good friendship foundation (${overallStrength}%). Natural connection in key areas.`
      : `Friendship may require more conscious effort (${overallStrength}%). Focus on shared activities and experiences.`,
    recommendations: [
      ...(karmicIndicators.length > 0 ? [`★ ${karmicIndicators.length} karmic indicator(s) suggest fated friendship.`] : []),
      ...(mercuryMercury ? ['Your Mercury connection makes conversation easy - lean into it'] : ['Schedule regular catch-ups to build communication comfort']),
      ...(jupiterMoon || jupiterSun ? ['Jupiter brings joy and encouragement - great for adventures'] : []),
      ...(moonMoon ? ['Your Moon-Moon connection provides emotional safety'] : []),
      ...(chironSun || chironMoon ? ['This friendship has healing potential - be there for each other'] : []),
      'Shared experiences build the strongest friendships'
    ]
  };
}

// ============================================
// ROMANTIC ANALYSIS - Professional-grade
// Target: ~120 max standard points (NORMALIZED)
// ============================================
function analyzeRomantic(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let standardPoints = 0;
  let maxStandardPoints = 0;
  let karmicBonus = 0;
  
  // TIER 1: Core romantic indicators (10 pts each)
  const venusMars1 = checkAspect(chart1, 'Venus', chart2, 'Mars');
  const venusMars2 = checkAspect(chart2, 'Venus', chart1, 'Mars');
  const venusMars = venusMars1 || venusMars2;
  maxStandardPoints += 10;
  indicators.push({
    name: '★ Venus-Mars: Sexual Chemistry',
    found: !!venusMars,
    aspect: venusMars,
    planet1: 'Venus',
    planet2: 'Mars',
    tier: 1,
    points: venusMars ? 10 : 0,
    interpretation: venusMars
      ? `${venusMars.type} (${venusMars.orb}° orb): Classic attraction! ${venusMars.quality === 'harmonious' ? 'Natural romantic and sexual chemistry.' : 'Intense attraction with exciting friction.'}`
      : 'No Venus-Mars aspect. Attraction may build over time.',
    strength: venusMars ? 'strong' : 'weak'
  });
  if (venusMars) standardPoints += 10;
  
  const sunMoon = checkAspect(chart1, 'Sun', chart2, 'Moon') || checkAspect(chart2, 'Sun', chart1, 'Moon');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Sun-Moon: Soul Connection',
    found: !!sunMoon,
    aspect: sunMoon,
    planet1: 'Sun',
    planet2: 'Moon',
    tier: 1,
    points: sunMoon ? (sunMoon.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: sunMoon
      ? `${sunMoon.type} (${sunMoon.orb}° orb): ${sunMoon.quality === 'harmonious' ? 'Deep soul-level understanding.' : 'Intense connection with growth potential.'}`
      : 'No Sun-Moon aspect. Soul connection develops through nurturing.',
    strength: sunMoon ? (sunMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (sunMoon) standardPoints += sunMoon.quality === 'harmonious' ? 10 : 5;

  // Mars-Mars for passion
  const marsMars = checkAspect(chart1, 'Mars', chart2, 'Mars');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Mars-Mars: Passion & Drive',
    found: !!marsMars,
    aspect: marsMars,
    planet1: 'Mars',
    planet2: 'Mars',
    tier: 1,
    points: marsMars ? (marsMars.quality === 'harmonious' || marsMars.type === 'conjunction' ? 10 : 5) : 0,
    interpretation: marsMars
      ? `${marsMars.type} (${marsMars.orb}° orb): ${marsMars.quality === 'harmonious' ? 'Passionate energy flows together.' : marsMars.type === 'conjunction' ? 'Powerful merged desires.' : 'Intense passion that may spark conflict.'}`
      : 'No Mars-Mars aspect. Passion expressed in other ways.',
    strength: marsMars ? (marsMars.quality === 'harmonious' || marsMars.type === 'conjunction' ? 'strong' : 'moderate') : 'weak'
  });
  if (marsMars) standardPoints += marsMars.quality === 'harmonious' || marsMars.type === 'conjunction' ? 10 : 5;
  
  // TIER 2: Important romantic indicators (8 pts each)
  const venusVenus = checkAspect(chart1, 'Venus', chart2, 'Venus');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Venus-Venus: Love Languages',
    found: !!venusVenus,
    aspect: venusVenus,
    planet1: 'Venus',
    planet2: 'Venus',
    tier: 2,
    points: venusVenus ? (venusVenus.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: venusVenus
      ? `${venusVenus.type} (${venusVenus.orb}° orb): ${venusVenus.quality === 'harmonious' ? 'Similar love languages - you naturally appreciate each other.' : 'Different but complementary ways of loving.'}`
      : 'No Venus-Venus aspect. Communicate your needs.',
    strength: venusVenus ? (venusVenus.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (venusVenus) standardPoints += venusVenus.quality === 'harmonious' ? 8 : 4;
  
  const moonMoon = checkAspect(chart1, 'Moon', chart2, 'Moon');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Moon-Moon: Emotional Home',
    found: !!moonMoon,
    aspect: moonMoon,
    planet1: 'Moon',
    planet2: 'Moon',
    tier: 2,
    points: moonMoon ? (moonMoon.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: moonMoon
      ? `${moonMoon.type} (${moonMoon.orb}° orb): ${moonMoon.quality === 'harmonious' ? 'You feel emotionally safe together.' : 'Emotional needs interact intensely.'}`
      : 'No Moon-Moon aspect. Emotional safety builds through care.',
    strength: moonMoon ? (moonMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (moonMoon) standardPoints += moonMoon.quality === 'harmonious' ? 8 : 4;

  // Venus-Sun: Love & admiration
  const venusSun = checkAspect(chart1, 'Venus', chart2, 'Sun') || checkAspect(chart2, 'Venus', chart1, 'Sun');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Venus-Sun: Love & Admiration',
    found: !!venusSun,
    aspect: venusSun,
    planet1: 'Venus',
    planet2: 'Sun',
    tier: 2,
    points: venusSun ? (venusSun.quality === 'harmonious' ? 8 : 5) : 0,
    interpretation: venusSun
      ? `${venusSun.type} (${venusSun.orb}° orb): Venus adores the Sun. ${venusSun.quality === 'harmonious' ? 'Natural appreciation and affection.' : 'Strong attraction with dynamic tension.'}`
      : 'No Venus-Sun aspect. Appreciation develops over time.',
    strength: venusSun ? 'strong' : 'weak'
  });
  if (venusSun) standardPoints += venusSun.quality === 'harmonious' ? 8 : 5;

  // Venus-Moon: Emotional affection
  const venusMoon = checkAspect(chart1, 'Venus', chart2, 'Moon') || checkAspect(chart2, 'Venus', chart1, 'Moon');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Venus-Moon: Emotional Affection',
    found: !!venusMoon,
    aspect: venusMoon,
    planet1: 'Venus',
    planet2: 'Moon',
    tier: 2,
    points: venusMoon ? 8 : 0,
    interpretation: venusMoon
      ? `${venusMoon.type} (${venusMoon.orb}° orb): Venus meets Moon - love and emotions blend beautifully. Tender affection.`
      : 'No Venus-Moon aspect. Emotional affection expressed differently.',
    strength: venusMoon ? 'strong' : 'weak'
  });
  if (venusMoon) standardPoints += 8;

  // Mars-Moon: Passionate emotions
  const marsMoon = checkAspect(chart1, 'Mars', chart2, 'Moon') || checkAspect(chart2, 'Mars', chart1, 'Moon');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Mars-Moon: Passionate Emotions',
    found: !!marsMoon,
    aspect: marsMoon,
    planet1: 'Mars',
    planet2: 'Moon',
    tier: 2,
    points: marsMoon ? (marsMoon.quality === 'harmonious' ? 7 : 4) : 0,
    interpretation: marsMoon
      ? `${marsMoon.type} (${marsMoon.orb}° orb): ${marsMoon.quality === 'harmonious' ? 'Passion meets emotion - protective and caring.' : 'Intense emotional reactions - passion runs high.'}`
      : 'No Mars-Moon aspect.',
    strength: marsMoon ? (marsMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (marsMoon) standardPoints += marsMoon.quality === 'harmonious' ? 7 : 4;
  
  // TIER 3: Juno indicators - marriage/commitment (APPROPRIATE for romantic)
  const junoSun = checkAspect(chart1, 'Juno', chart2, 'Sun') || checkAspect(chart2, 'Juno', chart1, 'Sun');
  if (chart1.planets.Juno || chart2.planets.Juno) {
    maxStandardPoints += 7;
    indicators.push({
      name: '★★ Juno-Sun: Marriage Potential',
      found: !!junoSun,
      aspect: junoSun,
      planet1: 'Juno',
      planet2: 'Sun',
      tier: 3,
      points: junoSun ? 7 : 0,
      interpretation: junoSun
        ? `${junoSun.type} (${junoSun.orb}° orb): Juno (goddess of marriage) connects to the Sun. ${junoSun.quality === 'harmonious' ? 'Strong marriage potential - commitment feels natural.' : 'Commitment energy that requires working through expectations.'}`
        : 'No Juno-Sun aspect. Commitment develops consciously.',
      strength: junoSun ? 'strong' : 'weak'
    });
    if (junoSun) standardPoints += 7;
  }

  const junoVenus = checkAspect(chart1, 'Juno', chart2, 'Venus') || checkAspect(chart2, 'Juno', chart1, 'Venus');
  if ((chart1.planets.Juno || chart2.planets.Juno) && junoVenus) {
    maxStandardPoints += 7;
    indicators.push({
      name: '★★ Juno-Venus: Love & Commitment United',
      found: true,
      aspect: junoVenus,
      planet1: 'Juno',
      planet2: 'Venus',
      tier: 3,
      points: 7,
      interpretation: `${junoVenus.type} (${junoVenus.orb}° orb): Juno (commitment) blends with Venus (love). Love naturally leads to lasting partnership.`,
      strength: 'strong'
    });
    standardPoints += 7;
  }

  const junoMars = checkAspect(chart1, 'Juno', chart2, 'Mars') || checkAspect(chart2, 'Juno', chart1, 'Mars');
  if ((chart1.planets.Juno || chart2.planets.Juno) && junoMars) {
    maxStandardPoints += 6;
    indicators.push({
      name: '★ Juno-Mars: Passionate Commitment',
      found: true,
      aspect: junoMars,
      planet1: 'Juno',
      planet2: 'Mars',
      tier: 3,
      points: 6,
      interpretation: `${junoMars.type} (${junoMars.orb}° orb): Passion meets commitment. Physical connection deepens the bond.`,
      strength: 'strong'
    });
    standardPoints += 6;
  }

  // Ceres for nurturing (APPROPRIATE for romantic/family)
  const ceresMoon = checkAspect(chart1, 'Ceres', chart2, 'Moon') || checkAspect(chart2, 'Ceres', chart1, 'Moon');
  if (chart1.planets.Ceres || chart2.planets.Ceres) {
    maxStandardPoints += 5;
    indicators.push({
      name: 'Ceres-Moon: Deep Nurturing',
      found: !!ceresMoon,
      aspect: ceresMoon,
      planet1: 'Ceres',
      planet2: 'Moon',
      tier: 3,
      points: ceresMoon ? 5 : 0,
      interpretation: ceresMoon
        ? `${ceresMoon.type} (${ceresMoon.orb}° orb): Ceres connects with the Moon. Deeply nurturing dynamic - excellent for family-building.`
        : 'No Ceres-Moon aspect.',
      strength: ceresMoon ? 'strong' : 'weak'
    });
    if (ceresMoon) standardPoints += 5;
  }

  const ceresVenus = checkAspect(chart1, 'Ceres', chart2, 'Venus') || checkAspect(chart2, 'Ceres', chart1, 'Venus');
  if (chart1.planets.Ceres || chart2.planets.Ceres) {
    maxStandardPoints += 5;
    indicators.push({
      name: 'Ceres-Venus: Nurturing Love',
      found: !!ceresVenus,
      aspect: ceresVenus,
      planet1: 'Ceres',
      planet2: 'Venus',
      tier: 3,
      points: ceresVenus ? 5 : 0,
      interpretation: ceresVenus
        ? `${ceresVenus.type} (${ceresVenus.orb}° orb): Love expressed through nurturing. Taking care of each other comes naturally.`
        : 'No Ceres-Venus aspect.',
      strength: ceresVenus ? 'moderate' : 'weak'
    });
    if (ceresVenus) standardPoints += 5;
  }

  // Pluto connections for intensity (can be positive in romance)
  const plutoVenus = checkAspect(chart1, 'Pluto', chart2, 'Venus') || checkAspect(chart2, 'Pluto', chart1, 'Venus');
  maxStandardPoints += 6;
  indicators.push({
    name: 'Pluto-Venus: Transformative Love',
    found: !!plutoVenus,
    aspect: plutoVenus,
    planet1: 'Pluto',
    planet2: 'Venus',
    tier: 3,
    points: plutoVenus ? 6 : 0,
    interpretation: plutoVenus
      ? `${plutoVenus.type} (${plutoVenus.orb}° orb): Intense, transformative attraction. ${plutoVenus.quality === 'harmonious' ? 'Deep soul bond.' : 'Obsessive or all-consuming - navigate with awareness.'}`
      : 'No Pluto-Venus aspect.',
    strength: plutoVenus ? 'strong' : 'weak'
  });
  if (plutoVenus) standardPoints += 6;

  const plutoMars = checkAspect(chart1, 'Pluto', chart2, 'Mars') || checkAspect(chart2, 'Pluto', chart1, 'Mars');
  maxStandardPoints += 5;
  indicators.push({
    name: 'Pluto-Mars: Magnetic Intensity',
    found: !!plutoMars,
    aspect: plutoMars,
    planet1: 'Pluto',
    planet2: 'Mars',
    tier: 3,
    points: plutoMars ? (plutoMars.quality === 'harmonious' ? 5 : 2) : 0,
    interpretation: plutoMars
      ? `${plutoMars.type} (${plutoMars.orb}° orb): ${plutoMars.quality === 'harmonious' ? 'Powerful magnetic attraction.' : 'Intense passion that needs careful handling.'}`
      : 'No Pluto-Mars aspect.',
    strength: plutoMars ? (plutoMars.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (plutoMars) standardPoints += plutoMars.quality === 'harmonious' ? 5 : 2;
  
  // KARMIC: Node connections - destiny
  const nodeVenus = checkAspect(chart1, 'NorthNode', chart2, 'Venus') || checkAspect(chart2, 'NorthNode', chart1, 'Venus');
  if (nodeVenus) {
    const points = nodeVenus.type === 'conjunction' ? 12 : nodeVenus.type === 'opposition' ? 10 : 8;
    karmicBonus += points;
    indicators.push({
      name: '★★★ KARMIC: North Node-Venus - FATED LOVE',
      found: true,
      aspect: nodeVenus,
      planet1: 'NorthNode',
      planet2: 'Venus',
      tier: 0,
      points,
      interpretation: nodeVenus.type === 'opposition'
        ? `${nodeVenus.type} (${nodeVenus.orb}° orb): **PAST LIFE LOVE.** Venus opposite North Node (conjunct South Node) indicates deep past-life romantic connection. Instant soul recognition.`
        : `${nodeVenus.type} (${nodeVenus.orb}° orb): **FATED ROMANTIC CONNECTION.** One of the strongest indicators of destined love. The Venus person embodies the love the Node person is meant to experience. Strong "meant to be" feeling.`,
      strength: 'strong'
    });
  }

  const nodeMoon = checkAspect(chart1, 'NorthNode', chart2, 'Moon') || checkAspect(chart2, 'NorthNode', chart1, 'Moon');
  if (nodeMoon) {
    const points = nodeMoon.type === 'conjunction' ? 10 : 6;
    karmicBonus += points;
    indicators.push({
      name: '★★ KARMIC: North Node-Moon',
      found: true,
      aspect: nodeMoon,
      planet1: 'NorthNode',
      planet2: 'Moon',
      tier: 0,
      points,
      interpretation: `${nodeMoon.type} (${nodeMoon.orb}° orb): Emotional destiny connection. The Moon person provides the emotional nourishment needed for soul growth.`,
      strength: 'strong'
    });
  }

  // Vertex for fated romance
  const vertexVenus = checkAspect(chart1, 'Vertex', chart2, 'Venus') || checkAspect(chart2, 'Vertex', chart1, 'Venus');
  if ((chart1.planets.Vertex || chart2.planets.Vertex) && vertexVenus) {
    karmicBonus += 10;
    indicators.push({
      name: '★★ FATED: Vertex-Venus',
      found: true,
      aspect: vertexVenus,
      planet1: 'Vertex',
      planet2: 'Venus',
      tier: 0,
      points: 10,
      interpretation: `${vertexVenus.type} (${vertexVenus.orb}° orb): **FATED LOVE ENCOUNTER.** Vertex on Venus indicates destined romantic meeting.`,
      strength: 'strong'
    });
  }

  // Eros for passion (ONLY romantic)
  const planets1 = chart1.planets as Record<string, NatalPlanetPosition | undefined>;
  const planets2 = chart2.planets as Record<string, NatalPlanetPosition | undefined>;
  const hasEros = planets1['Eros'] || planets2['Eros'];
  
  const erosVenus = checkAspect(chart1, 'Eros', chart2, 'Venus') || checkAspect(chart2, 'Eros', chart1, 'Venus');
  if (hasEros) {
    maxStandardPoints += 6;
    indicators.push({
      name: '★ Eros-Venus: Erotic Attraction',
      found: !!erosVenus,
      aspect: erosVenus,
      planet1: 'Eros',
      planet2: 'Venus',
      tier: 2,
      points: erosVenus ? 6 : 0,
      interpretation: erosVenus
        ? `${erosVenus.type} (${erosVenus.orb}° orb): Eros (erotic love) meets Venus. Powerful physical and romantic attraction.`
        : 'No Eros-Venus aspect.',
      strength: erosVenus ? 'strong' : 'weak'
    });
    if (erosVenus) standardPoints += 6;
  }

  const erosMars = checkAspect(chart1, 'Eros', chart2, 'Mars') || checkAspect(chart2, 'Eros', chart1, 'Mars');
  if (hasEros) {
    maxStandardPoints += 6;
    indicators.push({
      name: '★ Eros-Mars: Magnetic Passion',
      found: !!erosMars,
      aspect: erosMars,
      planet1: 'Eros',
      planet2: 'Mars',
      tier: 2,
      points: erosMars ? 6 : 0,
      interpretation: erosMars
        ? `${erosMars.type} (${erosMars.orb}° orb): Eros ignites Mars. Magnetic sexual attraction and passionate desire.`
        : 'No Eros-Mars aspect.',
      strength: erosMars ? 'strong' : 'weak'
    });
    if (erosMars) standardPoints += 6;
  }

  // Calculate with new formula
  const aspectRatio = calculateAspectRatio(indicators);
  const aspectRatioModifier = getAspectRatioModifier(aspectRatio.ratio);
  
  const baseScore = 25;
  const standardPercentage = maxStandardPoints > 0 ? (Math.max(0, standardPoints) / maxStandardPoints) * 45 : 0;
  const cappedKarmicBonus = Math.min(22, karmicBonus); // STANDARDIZED cap
  
  let overallStrength = Math.round(baseScore + standardPercentage + cappedKarmicBonus + aspectRatioModifier);
  overallStrength = Math.max(15, Math.min(92, overallStrength));
  
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  const junoIndicators = indicators.filter(i => i.name.includes('Juno'));
  const karmicIndicators = indicators.filter(i => i.name.includes('KARMIC') || i.name.includes('FATED'));
  
  return {
    focus: 'romantic',
    title: 'Romantic Compatibility Analysis',
    overallStrength,
    indicators: indicators.sort((a, b) => (a.tier || 99) - (b.tier || 99)),
    aspectRatio,
    maxStandardPoints,
    earnedStandardPoints: Math.max(0, standardPoints),
    summary: overallStrength >= 75
      ? `High romantic potential (${overallStrength}%)! ${strongIndicators.length} love indicators suggest strong chemistry.${karmicIndicators.length > 0 ? ' Karmic elements suggest a fated love connection.' : ''}${junoIndicators.length > 0 ? ' Juno connections point to lasting commitment.' : ''}`
      : overallStrength >= 55
      ? `Solid romantic foundation (${overallStrength}%). Key connections support love with some areas needing nurturing.`
      : `Romance may develop gradually (${overallStrength}%). Build friendship first; attraction grows with understanding.`,
    recommendations: [
      ...(karmicIndicators.length > 0 ? ['★ Karmic indicators suggest this is a fated love connection.'] : []),
      ...(venusMars ? ['Your Venus-Mars chemistry is real - physical affection matters'] : ['Build attraction through shared experiences']),
      ...(sunMoon ? ['Honor your Sun-Moon soul connection'] : []),
      ...(nodeVenus ? ['This feels fated - trust it while doing the work'] : []),
      ...(junoVenus || junoSun ? ['★ Juno connections indicate strong marriage potential'] : []),
      ...(ceresMoon || ceresVenus ? ['Nurture each other through acts of care'] : []),
      'Communicate love languages explicitly'
    ]
  };
}

// ============================================
// CREATIVE PARTNERSHIP ANALYSIS - Professional-grade
// Target: ~120 max standard points (NORMALIZED)
// ============================================
function analyzeCreative(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let standardPoints = 0;
  let maxStandardPoints = 0;
  let karmicBonus = 0;
  
  // TIER 1: Core creative indicators (10 pts each)
  const neptuneSun = checkAspect(chart1, 'Neptune', chart2, 'Sun') || checkAspect(chart2, 'Neptune', chart1, 'Sun');
  maxStandardPoints += 10;
  indicators.push({
    name: '★ Neptune-Sun: Shared Vision',
    found: !!neptuneSun,
    aspect: neptuneSun,
    planet1: 'Neptune',
    planet2: 'Sun',
    tier: 1,
    points: neptuneSun ? (neptuneSun.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: neptuneSun
      ? `${neptuneSun.type} (${neptuneSun.orb}° orb): Neptune inspires the Sun person's creative identity. ${neptuneSun.quality === 'harmonious' ? 'Beautiful imaginative flow.' : 'Intense creative energy - clarify visions together.'}`
      : 'No Neptune-Sun aspect. Creative inspiration comes from other sources.',
    strength: neptuneSun ? (neptuneSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (neptuneSun) standardPoints += neptuneSun.quality === 'harmonious' ? 10 : 5;
  
  const venusVenus = checkAspect(chart1, 'Venus', chart2, 'Venus');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Venus-Venus: Aesthetic Harmony',
    found: !!venusVenus,
    aspect: venusVenus,
    planet1: 'Venus',
    planet2: 'Venus',
    tier: 1,
    points: venusVenus ? (venusVenus.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: venusVenus
      ? `${venusVenus.type} (${venusVenus.orb}° orb): ${venusVenus.quality === 'harmonious' ? 'Similar aesthetics - you create beauty together.' : 'Different aesthetics can spark innovation.'}`
      : 'No Venus-Venus aspect. Different preferences can enrich collaboration.',
    strength: venusVenus ? (venusVenus.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (venusVenus) standardPoints += venusVenus.quality === 'harmonious' ? 10 : 5;

  // Neptune-Venus: Artistic inspiration
  const neptuneVenus = checkAspect(chart1, 'Neptune', chart2, 'Venus') || checkAspect(chart2, 'Neptune', chart1, 'Venus');
  maxStandardPoints += 10;
  indicators.push({
    name: '★ Neptune-Venus: Artistic Inspiration',
    found: !!neptuneVenus,
    aspect: neptuneVenus,
    planet1: 'Neptune',
    planet2: 'Venus',
    tier: 1,
    points: neptuneVenus ? (neptuneVenus.quality === 'harmonious' ? 10 : 6) : 0,
    interpretation: neptuneVenus
      ? `${neptuneVenus.type} (${neptuneVenus.orb}° orb): Neptune elevates Venus's aesthetic sense. ${neptuneVenus.quality === 'harmonious' ? 'Dreamy, inspired creative connection.' : 'Powerful artistic vision that needs grounding.'}`
      : 'No Neptune-Venus aspect. Artistic inspiration from other sources.',
    strength: neptuneVenus ? 'strong' : 'weak'
  });
  if (neptuneVenus) standardPoints += neptuneVenus.quality === 'harmonious' ? 10 : 6;

  // Mars-Neptune: Artistic drive (NEW)
  const marsNeptune = checkAspect(chart1, 'Mars', chart2, 'Neptune') || checkAspect(chart2, 'Mars', chart1, 'Neptune');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Mars-Neptune: Artistic Drive',
    found: !!marsNeptune,
    aspect: marsNeptune,
    planet1: 'Mars',
    planet2: 'Neptune',
    tier: 1,
    points: marsNeptune ? (marsNeptune.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: marsNeptune
      ? `${marsNeptune.type} (${marsNeptune.orb}° orb): Action meets imagination. ${marsNeptune.quality === 'harmonious' ? 'Inspired action toward creative goals.' : 'Creative vision needs grounded execution.'}`
      : 'No Mars-Neptune aspect. Creative drive from other sources.',
    strength: marsNeptune ? (marsNeptune.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (marsNeptune) standardPoints += marsNeptune.quality === 'harmonious' ? 10 : 5;
  
  // TIER 2: Supporting creative indicators (8 pts each)
  const mercuryVenus = checkAspect(chart1, 'Mercury', chart2, 'Venus') || checkAspect(chart2, 'Mercury', chart1, 'Venus');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Mercury-Venus: Artistic Expression',
    found: !!mercuryVenus,
    aspect: mercuryVenus,
    planet1: 'Mercury',
    planet2: 'Venus',
    tier: 2,
    points: mercuryVenus ? 8 : 0,
    interpretation: mercuryVenus
      ? `${mercuryVenus.type} (${mercuryVenus.orb}° orb): Ideas are expressed artistically. Natural creative dialogue.`
      : 'No Mercury-Venus aspect. Creative communication develops through practice.',
    strength: mercuryVenus ? 'strong' : 'weak'
  });
  if (mercuryVenus) standardPoints += 8;
  
  const moonNeptune = checkAspect(chart1, 'Moon', chart2, 'Neptune') || checkAspect(chart2, 'Moon', chart1, 'Neptune');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Moon-Neptune: Intuitive Creation',
    found: !!moonNeptune,
    aspect: moonNeptune,
    planet1: 'Moon',
    planet2: 'Neptune',
    tier: 2,
    points: moonNeptune ? (moonNeptune.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: moonNeptune
      ? `${moonNeptune.type} (${moonNeptune.orb}° orb): ${moonNeptune.quality === 'harmonious' ? 'Shared creative stream - almost telepathic.' : 'Powerful emotional creativity.'}`
      : 'No Moon-Neptune aspect. Intuitive creativity develops through experience.',
    strength: moonNeptune ? (moonNeptune.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (moonNeptune) standardPoints += moonNeptune.quality === 'harmonious' ? 8 : 4;

  // Mercury-Neptune: Imaginative communication
  const mercuryNeptune = checkAspect(chart1, 'Mercury', chart2, 'Neptune') || checkAspect(chart2, 'Mercury', chart1, 'Neptune');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Mercury-Neptune: Imaginative Communication',
    found: !!mercuryNeptune,
    aspect: mercuryNeptune,
    planet1: 'Mercury',
    planet2: 'Neptune',
    tier: 2,
    points: mercuryNeptune ? (mercuryNeptune.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: mercuryNeptune
      ? `${mercuryNeptune.type} (${mercuryNeptune.orb}° orb): ${mercuryNeptune.quality === 'harmonious' ? 'Ideas flow with imaginative depth.' : 'Creative thinking that may need clarity.'}`
      : 'No Mercury-Neptune aspect.',
    strength: mercuryNeptune ? (mercuryNeptune.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryNeptune) standardPoints += mercuryNeptune.quality === 'harmonious' ? 8 : 4;

  // Jupiter-Venus: Artistic luck (NEW)
  const jupiterVenus = checkAspect(chart1, 'Jupiter', chart2, 'Venus') || checkAspect(chart2, 'Jupiter', chart1, 'Venus');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Jupiter-Venus: Artistic Luck',
    found: !!jupiterVenus,
    aspect: jupiterVenus,
    planet1: 'Jupiter',
    planet2: 'Venus',
    tier: 2,
    points: jupiterVenus ? 8 : 0,
    interpretation: jupiterVenus
      ? `${jupiterVenus.type} (${jupiterVenus.orb}° orb): Jupiter expands Venus's creative potential. Lucky collaborations.`
      : 'No Jupiter-Venus aspect.',
    strength: jupiterVenus ? 'strong' : 'weak'
  });
  if (jupiterVenus) standardPoints += 8;

  // Moon-Venus: Aesthetic intuition (NEW)
  const moonVenus = checkAspect(chart1, 'Moon', chart2, 'Venus') || checkAspect(chart2, 'Moon', chart1, 'Venus');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Moon-Venus: Aesthetic Intuition',
    found: !!moonVenus,
    aspect: moonVenus,
    planet1: 'Moon',
    planet2: 'Venus',
    tier: 2,
    points: moonVenus ? 7 : 0,
    interpretation: moonVenus
      ? `${moonVenus.type} (${moonVenus.orb}° orb): Emotional and aesthetic senses blend. Creates from feeling.`
      : 'No Moon-Venus aspect.',
    strength: moonVenus ? 'strong' : 'weak'
  });
  if (moonVenus) standardPoints += 7;

  // Saturn-Neptune: Discipline + vision (NEW)
  const saturnNeptune = checkAspect(chart1, 'Saturn', chart2, 'Neptune') || checkAspect(chart2, 'Saturn', chart1, 'Neptune');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Saturn-Neptune: Discipline + Vision',
    found: !!saturnNeptune,
    aspect: saturnNeptune,
    planet1: 'Saturn',
    planet2: 'Neptune',
    tier: 2,
    points: saturnNeptune ? (saturnNeptune.quality === 'harmonious' ? 7 : 4) : 0,
    interpretation: saturnNeptune
      ? `${saturnNeptune.type} (${saturnNeptune.orb}° orb): ${saturnNeptune.quality === 'harmonious' ? 'Structure meets imagination - can manifest dreams.' : 'Dreams meet reality checks - requires balance.'}`
      : 'No Saturn-Neptune aspect.',
    strength: saturnNeptune ? (saturnNeptune.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (saturnNeptune) standardPoints += saturnNeptune.quality === 'harmonious' ? 7 : 4;

  // Mercury-Mercury: Idea exchange (NEW)
  const mercuryMercury = checkAspect(chart1, 'Mercury', chart2, 'Mercury');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Mercury-Mercury: Idea Exchange',
    found: !!mercuryMercury,
    aspect: mercuryMercury,
    planet1: 'Mercury',
    planet2: 'Mercury',
    tier: 2,
    points: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 7 : 4) : 0,
    interpretation: mercuryMercury
      ? `${mercuryMercury.type} (${mercuryMercury.orb}° orb): ${mercuryMercury.quality === 'harmonious' ? 'Ideas flow easily between you.' : 'Different thinking styles can spark innovation.'}`
      : 'No Mercury-Mercury aspect.',
    strength: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryMercury) standardPoints += mercuryMercury.quality === 'harmonious' ? 7 : 4;
  
  // Uranus for innovation
  const uranusVenus = checkAspect(chart1, 'Uranus', chart2, 'Venus') || checkAspect(chart2, 'Uranus', chart1, 'Venus');
  maxStandardPoints += 6;
  indicators.push({
    name: 'Uranus-Venus: Innovative Art',
    found: !!uranusVenus,
    aspect: uranusVenus,
    planet1: 'Uranus',
    planet2: 'Venus',
    tier: 3,
    points: uranusVenus ? 6 : 0,
    interpretation: uranusVenus
      ? `${uranusVenus.type} (${uranusVenus.orb}° orb): Uranus electrifies Venus. Unconventional, avant-garde creative potential.`
      : 'No Uranus-Venus aspect.',
    strength: uranusVenus ? 'moderate' : 'weak'
  });
  if (uranusVenus) standardPoints += 6;

  const uranusSun = checkAspect(chart1, 'Uranus', chart2, 'Sun') || checkAspect(chart2, 'Uranus', chart1, 'Sun');
  maxStandardPoints += 6;
  indicators.push({
    name: 'Uranus-Sun: Creative Innovation',
    found: !!uranusSun,
    aspect: uranusSun,
    planet1: 'Uranus',
    planet2: 'Sun',
    tier: 3,
    points: uranusSun ? 6 : 0,
    interpretation: uranusSun
      ? `${uranusSun.type} (${uranusSun.orb}° orb): Innovative energy! You push each other toward originality.`
      : 'No Uranus-Sun aspect.',
    strength: uranusSun ? 'moderate' : 'weak'
  });
  if (uranusSun) standardPoints += 6;

  // Vesta-Neptune: Dedicated creative vision (NEW)
  const vestaNeptune = checkAspect(chart1, 'Vesta', chart2, 'Neptune') || checkAspect(chart2, 'Vesta', chart1, 'Neptune');
  if (chart1.planets.Vesta || chart2.planets.Vesta) {
    maxStandardPoints += 5;
    indicators.push({
      name: 'Vesta-Neptune: Dedicated Vision',
      found: !!vestaNeptune,
      aspect: vestaNeptune,
      planet1: 'Vesta',
      planet2: 'Neptune',
      tier: 3,
      points: vestaNeptune ? 5 : 0,
      interpretation: vestaNeptune
        ? `${vestaNeptune.type} (${vestaNeptune.orb}° orb): Vesta's dedication meets Neptune's vision. Focused creative work.`
        : 'No Vesta-Neptune aspect.',
      strength: vestaNeptune ? 'moderate' : 'weak'
    });
    if (vestaNeptune) standardPoints += 5;
  }

  // Ceres-Venus: Nurturing artistic expression (NEW)
  const ceresVenus = checkAspect(chart1, 'Ceres', chart2, 'Venus') || checkAspect(chart2, 'Ceres', chart1, 'Venus');
  if (chart1.planets.Ceres || chart2.planets.Ceres) {
    maxStandardPoints += 5;
    indicators.push({
      name: 'Ceres-Venus: Nurturing Art',
      found: !!ceresVenus,
      aspect: ceresVenus,
      planet1: 'Ceres',
      planet2: 'Venus',
      tier: 3,
      points: ceresVenus ? 5 : 0,
      interpretation: ceresVenus
        ? `${ceresVenus.type} (${ceresVenus.orb}° orb): Ceres nurtures Venus's creative expression. Supportive collaboration.`
        : 'No Ceres-Venus aspect.',
      strength: ceresVenus ? 'moderate' : 'weak'
    });
    if (ceresVenus) standardPoints += 5;
  }

  // Sun-Sun: Core creative identity
  const sunSun = checkAspect(chart1, 'Sun', chart2, 'Sun');
  maxStandardPoints += 6;
  indicators.push({
    name: 'Sun-Sun: Creative Identity',
    found: !!sunSun,
    aspect: sunSun,
    planet1: 'Sun',
    planet2: 'Sun',
    tier: 3,
    points: sunSun ? (sunSun.quality === 'harmonious' ? 6 : 3) : 0,
    interpretation: sunSun
      ? `${sunSun.type} (${sunSun.orb}° orb): ${sunSun.quality === 'harmonious' ? 'Core creative identities align.' : 'Different creative identities can complement.'}`
      : 'No Sun-Sun aspect.',
    strength: sunSun ? (sunSun.quality === 'harmonious' ? 'moderate' : 'weak') : 'weak'
  });
  if (sunSun) standardPoints += sunSun.quality === 'harmonious' ? 6 : 3;
  
  // KARMIC indicators
  const nodeNeptune = checkAspect(chart1, 'NorthNode', chart2, 'Neptune') || checkAspect(chart2, 'NorthNode', chart1, 'Neptune');
  if (nodeNeptune) {
    const points = nodeNeptune.type === 'conjunction' ? 10 : 6;
    karmicBonus += points;
    indicators.push({
      name: '★★ KARMIC: North Node-Neptune',
      found: true,
      aspect: nodeNeptune,
      planet1: 'NorthNode',
      planet2: 'Neptune',
      tier: 0,
      points,
      interpretation: `${nodeNeptune.type} (${nodeNeptune.orb}° orb): Creative/spiritual destiny connection. Neptune's imagination serves the Node's life path.`,
      strength: 'strong'
    });
  }

  const nodeVenus = checkAspect(chart1, 'NorthNode', chart2, 'Venus') || checkAspect(chart2, 'NorthNode', chart1, 'Venus');
  if (nodeVenus) {
    const points = nodeVenus.type === 'conjunction' ? 8 : 5;
    karmicBonus += points;
    indicators.push({
      name: '★ KARMIC: North Node-Venus',
      found: true,
      aspect: nodeVenus,
      planet1: 'NorthNode',
      planet2: 'Venus',
      tier: 0,
      points,
      interpretation: `${nodeVenus.type} (${nodeVenus.orb}° orb): Artistic values align with destiny path. Creating together serves soul growth.`,
      strength: 'strong'
    });
  }
  
  // Calculate with new formula
  const aspectRatio = calculateAspectRatio(indicators);
  const aspectRatioModifier = getAspectRatioModifier(aspectRatio.ratio);
  
  const baseScore = 25;
  const standardPercentage = maxStandardPoints > 0 ? (Math.max(0, standardPoints) / maxStandardPoints) * 45 : 0;
  const cappedKarmicBonus = Math.min(22, karmicBonus); // STANDARDIZED cap (was 18)
  
  let overallStrength = Math.round(baseScore + standardPercentage + cappedKarmicBonus + aspectRatioModifier);
  overallStrength = Math.max(15, Math.min(92, overallStrength));
  
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  const karmicIndicators = indicators.filter(i => i.name.includes('KARMIC'));
  
  return {
    focus: 'creative',
    title: 'Creative Partnership Analysis',
    overallStrength,
    indicators: indicators.sort((a, b) => (a.tier || 99) - (b.tier || 99)),
    aspectRatio,
    maxStandardPoints,
    earnedStandardPoints: Math.max(0, standardPoints),
    summary: overallStrength >= 70
      ? `Strong creative partnership (${overallStrength}%)! ${strongIndicators.length} key connections support artistic collaboration.${karmicIndicators.length > 0 ? ' Karmic elements suggest creative destiny together.' : ''}`
      : overallStrength >= 50
      ? `Good creative potential (${overallStrength}%). Some synergy exists; others need cultivation.`
      : `Creative collaboration needs structure (${overallStrength}%). Different styles can complement if harnessed well.`,
    recommendations: [
      ...(karmicIndicators.length > 0 ? ['★ Karmic indicators suggest creative work together serves a higher purpose.'] : []),
      ...(neptuneSun || neptuneVenus ? ['Your Neptune connection supports shared dreaming and artistic vision'] : []),
      ...(venusVenus ? ['Lean into your shared aesthetic'] : ['Explore each other\'s preferences']),
      ...(mercuryVenus || mercuryNeptune ? ['Use your Mercury connections for creative dialogue'] : []),
      ...(uranusVenus || uranusSun ? ['Embrace innovation - you can create ahead-of-the-curve work'] : []),
      'Schedule regular creative sessions together'
    ]
  };
}

// ============================================
// FAMILY ANALYSIS - Professional-grade
// Target: ~120 max standard points (NORMALIZED)
// ============================================
function analyzeFamily(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let standardPoints = 0;
  let maxStandardPoints = 0;
  let karmicBonus = 0;
  
  // ============================================
  // TIER 1: Core family indicators (10 pts each)
  // ============================================
  
  const moonMoon = checkAspect(chart1, 'Moon', chart2, 'Moon');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Moon-Moon: Emotional Foundation',
    found: !!moonMoon,
    aspect: moonMoon,
    planet1: 'Moon',
    planet2: 'Moon',
    tier: 1,
    points: moonMoon ? (moonMoon.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: moonMoon
      ? `${moonMoon.type} (${moonMoon.orb}° orb): ${moonMoon.quality === 'harmonious' ? 'Deep emotional understanding - you feel like family.' : 'Strong emotional connection, though needs may differ.'}`
      : 'No Moon-Moon aspect. Emotional attunement develops through shared experiences.',
    strength: moonMoon ? (moonMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (moonMoon) standardPoints += moonMoon.quality === 'harmonious' ? 10 : 5;

  const sunMoon = checkAspect(chart1, 'Sun', chart2, 'Moon') || checkAspect(chart2, 'Sun', chart1, 'Moon');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Sun-Moon: Core Understanding',
    found: !!sunMoon,
    aspect: sunMoon,
    planet1: 'Sun',
    planet2: 'Moon',
    tier: 1,
    points: sunMoon ? (sunMoon.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: sunMoon
      ? `${sunMoon.type} (${sunMoon.orb}° orb): ${sunMoon.quality === 'harmonious' ? 'Natural understanding of each other\'s needs.' : 'Dynamic interplay of identity and emotion.'}`
      : 'No Sun-Moon aspect. Understanding develops through care and patience.',
    strength: sunMoon ? (sunMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (sunMoon) standardPoints += sunMoon.quality === 'harmonious' ? 10 : 5;

  const sunSun = checkAspect(chart1, 'Sun', chart2, 'Sun');
  maxStandardPoints += 10;
  indicators.push({
    name: 'Sun-Sun: Family Identity',
    found: !!sunSun,
    aspect: sunSun,
    planet1: 'Sun',
    planet2: 'Sun',
    tier: 1,
    points: sunSun ? (sunSun.quality === 'harmonious' ? 10 : 5) : 0,
    interpretation: sunSun
      ? `${sunSun.type} (${sunSun.orb}° orb): ${sunSun.quality === 'harmonious' ? 'Core selves resonate - shared family pride.' : 'Different identities can create family diversity.'}`
      : 'No Sun-Sun aspect. Family identity builds through shared experiences.',
    strength: sunSun ? (sunSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (sunSun) standardPoints += sunSun.quality === 'harmonious' ? 10 : 5;

  // ============================================
  // TIER 2: Nurturing indicators (8 pts each)
  // ============================================
  
  // Ceres is ESSENTIAL for family
  const ceresMoon = checkAspect(chart1, 'Ceres', chart2, 'Moon') || checkAspect(chart2, 'Ceres', chart1, 'Moon');
  maxStandardPoints += 8;
  indicators.push({
    name: '★ Ceres-Moon: Deep Nurturing',
    found: !!ceresMoon,
    aspect: ceresMoon,
    planet1: 'Ceres',
    planet2: 'Moon',
    tier: 2,
    points: ceresMoon ? 8 : 0,
    interpretation: ceresMoon
      ? `${ceresMoon.type} (${ceresMoon.orb}° orb): Ceres (mother/nurturer) connects with the Moon. Natural caregiving dynamic - essential for family bonds.`
      : 'No Ceres-Moon aspect. Nurturing expressed in other ways.',
    strength: ceresMoon ? 'strong' : 'weak'
  });
  if (ceresMoon) standardPoints += 8;

  const ceresSun = checkAspect(chart1, 'Ceres', chart2, 'Sun') || checkAspect(chart2, 'Ceres', chart1, 'Sun');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Ceres-Sun: Nurturing Identity',
    found: !!ceresSun,
    aspect: ceresSun,
    planet1: 'Ceres',
    planet2: 'Sun',
    tier: 2,
    points: ceresSun ? 7 : 0,
    interpretation: ceresSun
      ? `${ceresSun.type} (${ceresSun.orb}° orb): Ceres nurtures the Sun person's core self. Supportive family dynamic.`
      : 'No Ceres-Sun aspect.',
    strength: ceresSun ? 'moderate' : 'weak'
  });
  if (ceresSun) standardPoints += 7;

  const ceresVenus = checkAspect(chart1, 'Ceres', chart2, 'Venus') || checkAspect(chart2, 'Ceres', chart1, 'Venus');
  maxStandardPoints += 6;
  indicators.push({
    name: 'Ceres-Venus: Nurturing Love',
    found: !!ceresVenus,
    aspect: ceresVenus,
    planet1: 'Ceres',
    planet2: 'Venus',
    tier: 2,
    points: ceresVenus ? 6 : 0,
    interpretation: ceresVenus
      ? `${ceresVenus.type} (${ceresVenus.orb}° orb): Love expressed through nurturing. Taking care of each other comes naturally.`
      : 'No Ceres-Venus aspect.',
    strength: ceresVenus ? 'moderate' : 'weak'
  });
  if (ceresVenus) standardPoints += 6;

  // Saturn for family structure
  const saturnMoon = checkAspect(chart1, 'Saturn', chart2, 'Moon') || checkAspect(chart2, 'Saturn', chart1, 'Moon');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Saturn-Moon: Emotional Structure',
    found: !!saturnMoon,
    aspect: saturnMoon,
    planet1: 'Saturn',
    planet2: 'Moon',
    tier: 2,
    points: saturnMoon ? (saturnMoon.quality === 'harmonious' ? 8 : 4) : 0,
    interpretation: saturnMoon
      ? `${saturnMoon.type} (${saturnMoon.orb}° orb): Saturn provides emotional stability. ${saturnMoon.quality === 'harmonious' ? 'Solid emotional foundation.' : 'May feel restrictive but builds security.'}`
      : 'No Saturn-Moon aspect. Structure comes from elsewhere.',
    strength: saturnMoon ? (saturnMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (saturnMoon) standardPoints += saturnMoon.quality === 'harmonious' ? 8 : 4;

  const saturnSun = checkAspect(chart1, 'Saturn', chart2, 'Sun') || checkAspect(chart2, 'Saturn', chart1, 'Sun');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Saturn-Sun: Authority & Stability',
    found: !!saturnSun,
    aspect: saturnSun,
    planet1: 'Saturn',
    planet2: 'Sun',
    tier: 2,
    points: saturnSun ? (saturnSun.quality === 'harmonious' ? 7 : 3) : 0,
    interpretation: saturnSun
      ? `${saturnSun.type} (${saturnSun.orb}° orb): ${saturnSun.quality === 'harmonious' ? 'Healthy authority dynamic. Mutual respect.' : 'May feel hierarchical but provides structure.'}`
      : 'No Saturn-Sun aspect.',
    strength: saturnSun ? (saturnSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (saturnSun) standardPoints += saturnSun.quality === 'harmonious' ? 7 : 3;

  // Juno for family commitment
  const junoMoon = checkAspect(chart1, 'Juno', chart2, 'Moon') || checkAspect(chart2, 'Juno', chart1, 'Moon');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Juno-Moon: Committed Bond',
    found: !!junoMoon,
    aspect: junoMoon,
    planet1: 'Juno',
    planet2: 'Moon',
    tier: 2,
    points: junoMoon ? 7 : 0,
    interpretation: junoMoon
      ? `${junoMoon.type} (${junoMoon.orb}° orb): Juno brings commitment to emotional bonds. Strong family loyalty.`
      : 'No Juno-Moon aspect. Loyalty expressed differently.',
    strength: junoMoon ? 'strong' : 'weak'
  });
  if (junoMoon) standardPoints += 7;

  const junoSun = checkAspect(chart1, 'Juno', chart2, 'Sun') || checkAspect(chart2, 'Juno', chart1, 'Sun');
  maxStandardPoints += 6;
  indicators.push({
    name: 'Juno-Sun: Family Commitment',
    found: !!junoSun,
    aspect: junoSun,
    planet1: 'Juno',
    planet2: 'Sun',
    tier: 2,
    points: junoSun ? 6 : 0,
    interpretation: junoSun
      ? `${junoSun.type} (${junoSun.orb}° orb): Juno brings commitment to identity. Dedicated family bond.`
      : 'No Juno-Sun aspect.',
    strength: junoSun ? 'moderate' : 'weak'
  });
  if (junoSun) standardPoints += 6;

  // Vesta for family dedication
  const vestaMoon = checkAspect(chart1, 'Vesta', chart2, 'Moon') || checkAspect(chart2, 'Vesta', chart1, 'Moon');
  maxStandardPoints += 6;
  indicators.push({
    name: 'Vesta-Moon: Sacred Home',
    found: !!vestaMoon,
    aspect: vestaMoon,
    planet1: 'Vesta',
    planet2: 'Moon',
    tier: 2,
    points: vestaMoon ? 6 : 0,
    interpretation: vestaMoon
      ? `${vestaMoon.type} (${vestaMoon.orb}° orb): Vesta (keeper of the hearth) honors the home. Dedication to family.`
      : 'No Vesta-Moon aspect.',
    strength: vestaMoon ? 'moderate' : 'weak'
  });
  if (vestaMoon) standardPoints += 6;

  // Communication for family
  const mercuryMoon = checkAspect(chart1, 'Mercury', chart2, 'Moon') || checkAspect(chart2, 'Mercury', chart1, 'Moon');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Mercury-Moon: Emotional Communication',
    found: !!mercuryMoon,
    aspect: mercuryMoon,
    planet1: 'Mercury',
    planet2: 'Moon',
    tier: 2,
    points: mercuryMoon ? (mercuryMoon.quality === 'harmonious' ? 7 : 4) : 0,
    interpretation: mercuryMoon
      ? `${mercuryMoon.type} (${mercuryMoon.orb}° orb): Thoughts and feelings connect easily. Good for family discussions.`
      : 'No Mercury-Moon aspect. Open communication requires effort.',
    strength: mercuryMoon ? (mercuryMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryMoon) standardPoints += mercuryMoon.quality === 'harmonious' ? 7 : 4;

  const mercuryMercury = checkAspect(chart1, 'Mercury', chart2, 'Mercury');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Mercury-Mercury: Family Communication',
    found: !!mercuryMercury,
    aspect: mercuryMercury,
    planet1: 'Mercury',
    planet2: 'Mercury',
    tier: 2,
    points: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 7 : 4) : 0,
    interpretation: mercuryMercury
      ? `${mercuryMercury.type} (${mercuryMercury.orb}° orb): ${mercuryMercury.quality === 'harmonious' ? 'Easy communication flow.' : 'Different communication styles - requires patience.'}`
      : 'No Mercury-Mercury aspect.',
    strength: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryMercury) standardPoints += mercuryMercury.quality === 'harmonious' ? 7 : 4;

  // Jupiter-Moon for emotional support
  const jupiterMoon = checkAspect(chart1, 'Jupiter', chart2, 'Moon') || checkAspect(chart2, 'Jupiter', chart1, 'Moon');
  maxStandardPoints += 8;
  indicators.push({
    name: 'Jupiter-Moon: Emotional Expansion',
    found: !!jupiterMoon,
    aspect: jupiterMoon,
    planet1: 'Jupiter',
    planet2: 'Moon',
    tier: 2,
    points: jupiterMoon ? 8 : 0,
    interpretation: jupiterMoon
      ? `${jupiterMoon.type} (${jupiterMoon.orb}° orb): Jupiter uplifts and encourages. Natural emotional support.`
      : 'No Jupiter-Moon aspect. Encouragement through action.',
    strength: jupiterMoon ? 'strong' : 'weak'
  });
  if (jupiterMoon) standardPoints += 8;

  const jupiterSun = checkAspect(chart1, 'Jupiter', chart2, 'Sun') || checkAspect(chart2, 'Jupiter', chart1, 'Sun');
  maxStandardPoints += 7;
  indicators.push({
    name: 'Jupiter-Sun: Growth & Support',
    found: !!jupiterSun,
    aspect: jupiterSun,
    planet1: 'Jupiter',
    planet2: 'Sun',
    tier: 2,
    points: jupiterSun ? 7 : 0,
    interpretation: jupiterSun
      ? `${jupiterSun.type} (${jupiterSun.orb}° orb): Jupiter expands the Sun's confidence. Uplifting family dynamic.`
      : 'No Jupiter-Sun aspect.',
    strength: jupiterSun ? 'strong' : 'weak'
  });
  if (jupiterSun) standardPoints += 7;

  // ============================================
  // TIER 3: Supporting indicators (5-6 pts each)
  // ============================================

  const venusVenus = checkAspect(chart1, 'Venus', chart2, 'Venus');
  maxStandardPoints += 6;
  indicators.push({
    name: 'Venus-Venus: Shared Values',
    found: !!venusVenus,
    aspect: venusVenus,
    planet1: 'Venus',
    planet2: 'Venus',
    tier: 3,
    points: venusVenus ? (venusVenus.quality === 'harmonious' ? 6 : 3) : 0,
    interpretation: venusVenus
      ? `${venusVenus.type} (${venusVenus.orb}° orb): ${venusVenus.quality === 'harmonious' ? 'Shared family values and aesthetics.' : 'Different values can enrich family life.'}`
      : 'No Venus-Venus aspect.',
    strength: venusVenus ? (venusVenus.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (venusVenus) standardPoints += venusVenus.quality === 'harmonious' ? 6 : 3;

  const venusMoon = checkAspect(chart1, 'Venus', chart2, 'Moon') || checkAspect(chart2, 'Venus', chart1, 'Moon');
  maxStandardPoints += 6;
  indicators.push({
    name: 'Venus-Moon: Emotional Affection',
    found: !!venusMoon,
    aspect: venusMoon,
    planet1: 'Venus',
    planet2: 'Moon',
    tier: 3,
    points: venusMoon ? 6 : 0,
    interpretation: venusMoon
      ? `${venusMoon.type} (${venusMoon.orb}° orb): Love and emotion blend harmoniously. Warm, affectionate bond.`
      : 'No Venus-Moon aspect.',
    strength: venusMoon ? 'strong' : 'weak'
  });
  if (venusMoon) standardPoints += 6;

  const chironMoon = checkAspect(chart1, 'Chiron', chart2, 'Moon') || checkAspect(chart2, 'Chiron', chart1, 'Moon');
  maxStandardPoints += 5;
  indicators.push({
    name: 'Chiron-Moon: Healing Family Wounds',
    found: !!chironMoon,
    aspect: chironMoon,
    planet1: 'Chiron',
    planet2: 'Moon',
    tier: 3,
    points: chironMoon ? 5 : 0,
    interpretation: chironMoon
      ? `${chironMoon.type} (${chironMoon.orb}° orb): Chiron brings healing to family emotional patterns.`
      : 'No Chiron-Moon aspect.',
    strength: chironMoon ? 'moderate' : 'weak'
  });
  if (chironMoon) standardPoints += 5;

  const chironSun = checkAspect(chart1, 'Chiron', chart2, 'Sun') || checkAspect(chart2, 'Chiron', chart1, 'Sun');
  maxStandardPoints += 5;
  indicators.push({
    name: 'Chiron-Sun: Identity Healing',
    found: !!chironSun,
    aspect: chironSun,
    planet1: 'Chiron',
    planet2: 'Sun',
    tier: 3,
    points: chironSun ? 5 : 0,
    interpretation: chironSun
      ? `${chironSun.type} (${chironSun.orb}° orb): Chiron helps heal identity wounds within the family.`
      : 'No Chiron-Sun aspect.',
    strength: chironSun ? 'moderate' : 'weak'
  });
  if (chironSun) standardPoints += 5;

  // Vertex for fated family
  const vertexMoon = checkAspect(chart1, 'Vertex', chart2, 'Moon') || checkAspect(chart2, 'Vertex', chart1, 'Moon');
  if ((chart1.planets.Vertex || chart2.planets.Vertex) && vertexMoon) {
    karmicBonus += vertexMoon.type === 'conjunction' ? 10 : 6;
    indicators.push({
      name: '★★ FATED: Vertex-Moon Connection',
      found: true,
      aspect: vertexMoon,
      planet1: 'Vertex',
      planet2: 'Moon',
      tier: 0,
      points: vertexMoon.type === 'conjunction' ? 10 : 6,
      interpretation: `${vertexMoon.type} (${vertexMoon.orb}° orb): Vertex on the Moon indicates fated emotional/family connection.`,
      strength: 'strong'
    });
  }

  // ============================================
  // KARMIC INDICATORS (Flat bonus)
  // ============================================

  const nodeMoon = checkAspect(chart1, 'NorthNode', chart2, 'Moon') || checkAspect(chart2, 'NorthNode', chart1, 'Moon');
  if (nodeMoon) {
    const pts = nodeMoon.type === 'conjunction' ? 12 : nodeMoon.type === 'opposition' ? 12 : 7;
    karmicBonus += pts;
    indicators.push({
      name: nodeMoon.type === 'opposition' ? '★★★ KARMIC: Past Life Family (Moon)' : '★★ KARMIC: North Node-Moon',
      found: true,
      aspect: nodeMoon,
      planet1: 'NorthNode',
      planet2: 'Moon',
      tier: 0,
      points: pts,
      interpretation: nodeMoon.type === 'opposition'
        ? `${nodeMoon.type} (${nodeMoon.orb}° orb): **PAST LIFE FAMILY.** Moon opposite North Node (conjunct South Node) indicates deep past-life family bond. Instant familiarity - you were likely family before.`
        : `${nodeMoon.type} (${nodeMoon.orb}° orb): Fated emotional/family connection. The Moon person provides the emotional foundation needed for soul growth.`,
      strength: 'strong'
    });
  }

  const nodeSun = checkAspect(chart1, 'NorthNode', chart2, 'Sun') || checkAspect(chart2, 'NorthNode', chart1, 'Sun');
  if (nodeSun) {
    const pts = nodeSun.type === 'conjunction' ? 10 : nodeSun.type === 'opposition' ? 10 : 6;
    karmicBonus += pts;
    indicators.push({
      name: nodeSun.type === 'opposition' ? '★★ KARMIC: Past Life Family (Sun)' : '★ KARMIC: North Node-Sun',
      found: true,
      aspect: nodeSun,
      planet1: 'NorthNode',
      planet2: 'Sun',
      tier: 0,
      points: pts,
      interpretation: nodeSun.type === 'opposition'
        ? `${nodeSun.type} (${nodeSun.orb}° orb): Sun opposite North Node (conjunct South Node) suggests past-life family connection.`
        : `${nodeSun.type} (${nodeSun.orb}° orb): Destined family connection. Identity growth through family bond.`,
      strength: 'strong'
    });
  }

  const nodeSaturn = checkAspect(chart1, 'NorthNode', chart2, 'Saturn') || checkAspect(chart2, 'NorthNode', chart1, 'Saturn');
  if (nodeSaturn) {
    const pts = nodeSaturn.type === 'conjunction' ? 10 : 6;
    karmicBonus += pts;
    indicators.push({
      name: '★ KARMIC: North Node-Saturn',
      found: true,
      aspect: nodeSaturn,
      planet1: 'NorthNode',
      planet2: 'Saturn',
      tier: 0,
      points: pts,
      interpretation: `${nodeSaturn.type} (${nodeSaturn.orb}° orb): Karmic lessons around family responsibility and structure.`,
      strength: 'moderate'
    });
  }

  const nodeCeres = checkAspect(chart1, 'NorthNode', chart2, 'Ceres') || checkAspect(chart2, 'NorthNode', chart1, 'Ceres');
  if (nodeCeres) {
    const pts = nodeCeres.type === 'conjunction' ? 8 : 5;
    karmicBonus += pts;
    indicators.push({
      name: '★ KARMIC: North Node-Ceres',
      found: true,
      aspect: nodeCeres,
      planet1: 'NorthNode',
      planet2: 'Ceres',
      tier: 0,
      points: pts,
      interpretation: `${nodeCeres.type} (${nodeCeres.orb}° orb): Nurturing aligned with destiny. Caring for each other is part of your soul path.`,
      strength: 'strong'
    });
  }

  // ============================================
  // CALCULATE FINAL SCORE
  // ============================================
  const aspectRatio = calculateAspectRatio(indicators);
  const aspectRatioModifier = getAspectRatioModifier(aspectRatio.ratio);
  
  const baseScore = 25;
  const standardPercentage = maxStandardPoints > 0 ? (Math.max(0, standardPoints) / maxStandardPoints) * 45 : 0;
  const cappedKarmicBonus = Math.min(22, karmicBonus); // STANDARDIZED cap
  
  let overallStrength = Math.round(baseScore + standardPercentage + cappedKarmicBonus + aspectRatioModifier);
  overallStrength = Math.max(15, Math.min(92, overallStrength));
  
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  const karmicIndicators = indicators.filter(i => i.name.includes('KARMIC') || i.name.includes('FATED'));
  
  return {
    focus: 'family',
    title: 'Family Bond Analysis',
    overallStrength,
    indicators: indicators.sort((a, b) => (a.tier || 99) - (b.tier || 99)),
    aspectRatio,
    maxStandardPoints,
    earnedStandardPoints: Math.max(0, standardPoints),
    summary: overallStrength >= 70
      ? `Strong family bond potential (${overallStrength}%)! ${strongIndicators.length} nurturing connections support deep family ties.${karmicIndicators.length > 0 ? ' Karmic elements suggest past-life family connection.' : ''}`
      : overallStrength >= 50
      ? `Good family foundation (${overallStrength}%). Natural connection in key areas with some room for growth.`
      : `Family bond develops through conscious effort (${overallStrength}%). Focus on nurturing and communication.`,
    recommendations: [
      ...(karmicIndicators.length > 0 ? ['★ Karmic indicators suggest past-life family connection.'] : []),
      ...(ceresMoon ? ['Your Ceres-Moon connection is excellent for nurturing each other.'] : ['Focus on expressing care through actions.']),
      ...(moonMoon ? ['Honor your Moon-Moon emotional bond.'] : ['Build emotional safety through consistent care.']),
      ...(jupiterMoon || jupiterSun ? ['Lean into Jupiter for uplift and encouragement.'] : []),
      ...(saturnMoon || saturnSun ? ['Saturn provides stability - honor the structure.'] : []),
      'Create shared rituals and traditions'
    ]
  };
}

// ============================================
// MAIN ANALYSIS FUNCTION
// ============================================
export function analyzeRelationshipFocus(
  chart1: NatalChart,
  chart2: NatalChart,
  focus: RelationshipFocus
): FocusAnalysis | null {
  switch (focus) {
    case 'business':
      return analyzeBusinessPartnership(chart1, chart2);
    case 'friendship':
      return analyzeFriendship(chart1, chart2);
    case 'romantic':
      return analyzeRomantic(chart1, chart2);
    case 'creative':
      return analyzeCreative(chart1, chart2);
    case 'family':
      return analyzeFamily(chart1, chart2);
    case 'all':
    default:
      return null;
  }
}
