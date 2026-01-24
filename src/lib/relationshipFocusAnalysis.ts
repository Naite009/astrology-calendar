/**
 * Relationship Focus Analysis
 * Analyzes specific indicators for different relationship types
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

export interface FocusIndicator {
  name: string;
  found: boolean;
  aspect?: AspectResult | null;
  interpretation: string;
  strength: 'strong' | 'moderate' | 'weak' | 'absent';
  planet1?: string;
  planet2?: string;
}

export interface FocusAnalysis {
  focus: RelationshipFocus;
  title: string;
  overallStrength: number;
  indicators: FocusIndicator[];
  summary: string;
  recommendations: string[];
}

// Business Partnership Analysis - REBALANCED SCORING
// Uses weighted scoring with a maximum theoretical score to produce realistic percentages
function analyzeBusinessPartnership(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  
  // Track raw points and maximum possible points for weighted percentage
  let rawPoints = 0;
  let maxPossiblePoints = 0;
  
  // TIER 1: CORE BUSINESS INDICATORS (max 10 points each, these are essential)
  // Saturn-Sun: Authority and structure
  const saturnSun = checkAspect(chart1, 'Saturn', chart2, 'Sun') || checkAspect(chart2, 'Saturn', chart1, 'Sun');
  maxPossiblePoints += 10;
  indicators.push({
    name: 'Saturn-Sun: Authority & Structure',
    found: !!saturnSun,
    aspect: saturnSun,
    planet1: 'Saturn',
    planet2: 'Sun',
    interpretation: saturnSun 
      ? `${saturnSun.type} (${saturnSun.orb}° orb): One partner provides structure and accountability. ${saturnSun.quality === 'harmonious' ? 'This flows naturally - roles are clear and respected.' : 'This may feel restrictive at times, but creates necessary discipline.'}`
      : 'No direct Saturn-Sun aspect. Structure and authority roles may need conscious definition.',
    strength: saturnSun ? (saturnSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'absent'
  });
  if (saturnSun) rawPoints += saturnSun.quality === 'harmonious' ? 10 : 6;

  // Mercury-Mercury: Communication
  const mercuryMercury = checkAspect(chart1, 'Mercury', chart2, 'Mercury');
  maxPossiblePoints += 10;
  indicators.push({
    name: 'Mercury-Mercury: Mental Sync',
    found: !!mercuryMercury,
    aspect: mercuryMercury,
    planet1: 'Mercury',
    planet2: 'Mercury',
    interpretation: mercuryMercury
      ? `${mercuryMercury.type} (${mercuryMercury.orb}° orb): Your minds ${mercuryMercury.quality === 'harmonious' ? 'work well together - similar thought processes and easy idea exchange' : 'approach problems differently - this can create conflict or complement each other'}.`
      : 'No Mercury-Mercury aspect. You may think in different ways - this can be a strength with conscious bridging.',
    strength: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryMercury) rawPoints += mercuryMercury.quality === 'harmonious' ? 10 : 5;

  // Jupiter-Saturn: Vision + Execution (the ideal business combination)
  const jupiterSaturn = checkAspect(chart1, 'Jupiter', chart2, 'Saturn') || checkAspect(chart2, 'Jupiter', chart1, 'Saturn');
  maxPossiblePoints += 10;
  if (jupiterSaturn) {
    indicators.push({
      name: 'Jupiter-Saturn: Vision + Execution',
      found: true,
      aspect: jupiterSaturn,
      planet1: 'Jupiter',
      planet2: 'Saturn',
      interpretation: `${jupiterSaturn.type} (${jupiterSaturn.orb}° orb): The ideal business combination! One partner brings expansive vision while the other provides realistic structure. ${jupiterSaturn.quality === 'harmonious' ? 'These energies blend well - dreams meet practicality.' : 'There may be tension between "go big" and "go slow" but both perspectives are valuable.'}`,
      strength: jupiterSaturn.quality === 'harmonious' ? 'strong' : 'moderate'
    });
    rawPoints += jupiterSaturn.quality === 'harmonious' ? 10 : 6;
  }

  // TIER 2: IMPORTANT BUSINESS INDICATORS (max 8 points each)
  // Saturn-Mercury: Practical communication
  const saturnMercury = checkAspect(chart1, 'Saturn', chart2, 'Mercury') || checkAspect(chart2, 'Saturn', chart1, 'Mercury');
  maxPossiblePoints += 8;
  indicators.push({
    name: 'Saturn-Mercury: Practical Communication',
    found: !!saturnMercury,
    aspect: saturnMercury,
    planet1: 'Saturn',
    planet2: 'Mercury',
    interpretation: saturnMercury
      ? `${saturnMercury.type} (${saturnMercury.orb}° orb): Business communications are ${saturnMercury.quality === 'harmonious' ? 'grounded and productive' : 'sometimes tense, but ultimately clarifying'}.`
      : 'No Saturn-Mercury aspect. Communication style may be less formal.',
    strength: saturnMercury ? (saturnMercury.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (saturnMercury) rawPoints += saturnMercury.quality === 'harmonious' ? 8 : 4;

  // Jupiter-Sun: Growth & Opportunity
  const jupiterSun = checkAspect(chart1, 'Jupiter', chart2, 'Sun') || checkAspect(chart2, 'Jupiter', chart1, 'Sun');
  maxPossiblePoints += 8;
  indicators.push({
    name: 'Jupiter-Sun: Growth & Opportunity',
    found: !!jupiterSun,
    aspect: jupiterSun,
    planet1: 'Jupiter',
    planet2: 'Sun',
    interpretation: jupiterSun
      ? `${jupiterSun.type} (${jupiterSun.orb}° orb): Excellent for expansion! Jupiter expands the Sun person's potential. ${jupiterSun.quality === 'harmonious' ? 'Natural luck and growth together.' : 'Big visions that may need grounding.'}`
      : 'No Jupiter-Sun aspect. Growth opportunities exist but may require more deliberate cultivation.',
    strength: jupiterSun ? (jupiterSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (jupiterSun) rawPoints += jupiterSun.quality === 'harmonious' ? 8 : 4;

  // Mars-Mars: Shared Drive
  const marsMars = checkAspect(chart1, 'Mars', chart2, 'Mars');
  maxPossiblePoints += 8;
  indicators.push({
    name: 'Mars-Mars: Shared Drive',
    found: !!marsMars,
    aspect: marsMars,
    planet1: 'Mars',
    planet2: 'Mars',
    interpretation: marsMars
      ? `${marsMars.type} (${marsMars.orb}° orb): Your action styles ${marsMars.quality === 'harmonious' ? 'align well - you energize each other' : 'clash - different approaches to getting things done'}.`
      : 'No Mars-Mars aspect. Your working styles may differ.',
    strength: marsMars ? (marsMars.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (marsMars) rawPoints += marsMars.quality === 'harmonious' ? 8 : 3;

  // TIER 3: KARMIC/DESTINY INDICATORS (bonus points, max 6 each)
  // These ADD to the score but don't inflate unrealistically
  const saturnNorthNode = checkAspect(chart1, 'Saturn', chart2, 'NorthNode') || checkAspect(chart2, 'Saturn', chart1, 'NorthNode');
  if (saturnNorthNode) {
    indicators.push({
      name: '★ KARMIC: Saturn-North Node',
      found: true,
      aspect: saturnNorthNode,
      planet1: 'Saturn',
      planet2: 'NorthNode',
      interpretation: `${saturnNorthNode.type} (${saturnNorthNode.orb}° orb): **Fated business connection.** Saturn provides the structure and lessons the North Node person needs for their destiny path. This partnership has a "meant to be" quality around shared work.`,
      strength: 'strong'
    });
    rawPoints += saturnNorthNode.type === 'conjunction' ? 6 : 4;
    maxPossiblePoints += 6; // Only count if present
  }

  const nodeJupiter = checkAspect(chart1, 'NorthNode', chart2, 'Jupiter') || checkAspect(chart2, 'NorthNode', chart1, 'Jupiter');
  if (nodeJupiter) {
    indicators.push({
      name: '★ KARMIC: North Node-Jupiter',
      found: true,
      aspect: nodeJupiter,
      planet1: 'NorthNode',
      planet2: 'Jupiter',
      interpretation: `${nodeJupiter.type} (${nodeJupiter.orb}° orb): **Growth Destiny.** Jupiter blesses the partnership with expansion and opportunity. You attract fortunate circumstances together.`,
      strength: 'strong'
    });
    rawPoints += nodeJupiter.type === 'conjunction' ? 6 : 4;
    maxPossiblePoints += 6;
  }

  // TIER 4: SUPPORTING INDICATORS (smaller points, 4 max each)
  // Pallas for strategy
  const pallasSun = checkAspect(chart1, 'Pallas', chart2, 'Sun') || checkAspect(chart2, 'Pallas', chart1, 'Sun');
  if (chart1.planets.Pallas || chart2.planets.Pallas) {
    maxPossiblePoints += 4;
    if (pallasSun) {
      indicators.push({
        name: 'Pallas-Sun: Strategic Vision',
        found: true,
        aspect: pallasSun,
        planet1: 'Pallas',
        planet2: 'Sun',
        interpretation: `${pallasSun.type} (${pallasSun.orb}° orb): Enhanced ability to plan and strategize together.`,
        strength: 'moderate'
      });
      rawPoints += 4;
    }
  }

  // Vesta for dedication (only if present)
  const vestaSun = checkAspect(chart1, 'Vesta', chart2, 'Sun') || checkAspect(chart2, 'Vesta', chart1, 'Sun');
  if ((chart1.planets.Vesta || chart2.planets.Vesta) && vestaSun) {
    maxPossiblePoints += 4;
    indicators.push({
      name: 'Vesta-Sun: Dedicated Focus',
      found: true,
      aspect: vestaSun,
      planet1: 'Vesta',
      planet2: 'Sun',
      interpretation: `${vestaSun.type} (${vestaSun.orb}° orb): Vesta brings sacred dedication to shared goals.`,
      strength: 'moderate'
    });
    rawPoints += 4;
  }

  // NEGATIVE MODIFIERS (tension aspects reduce score)
  const plutoSun = checkAspect(chart1, 'Pluto', chart2, 'Sun') || checkAspect(chart2, 'Pluto', chart1, 'Sun');
  if (plutoSun && plutoSun.quality === 'tense') {
    indicators.push({
      name: 'Pluto-Sun: Power Dynamics',
      found: true,
      aspect: plutoSun,
      planet1: 'Pluto',
      planet2: 'Sun',
      interpretation: `${plutoSun.type} (${plutoSun.orb}° orb): Intense power dynamics. Power struggles possible - requires mature handling.`,
      strength: 'moderate'
    });
    rawPoints -= 3; // Penalty for tense power dynamics
  }

  // Calculate percentage based on what was actually possible
  // Base score of 30% (any partnership has some potential)
  // Plus weighted percentage of achieved vs possible
  const baseScore = 30;
  const achievedPercentage = maxPossiblePoints > 0 ? (rawPoints / maxPossiblePoints) * 50 : 0;
  const overallStrength = Math.max(15, Math.min(85, Math.round(baseScore + achievedPercentage)));
  
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  const karmicIndicators = indicators.filter(i => i.name.includes('KARMIC'));
  const challenges = indicators.filter(i => i.aspect?.quality === 'tense');
  
  return {
    focus: 'business',
    title: 'Business Partnership Analysis',
    overallStrength,
    indicators,
    summary: overallStrength >= 65 
      ? `Strong business partnership potential with ${strongIndicators.length} key indicators. ${karmicIndicators.length > 0 ? `Karmic connections suggest a fated professional bond.` : ''}`
      : overallStrength >= 45
      ? `Moderate business potential. ${strongIndicators.length > 0 ? `You have ${strongIndicators.length} supportive indicator(s).` : 'Requires conscious effort to build structure.'} ${karmicIndicators.length > 0 ? `Karmic elements add depth.` : ''}`
      : `Business partnership would require significant effort. Focus on clearly defined roles and regular communication.`,
    recommendations: [
      ...(saturnNorthNode ? ['★ Your Saturn-North Node connection indicates a fated professional relationship.'] : []),
      ...(nodeJupiter ? ['★ Your Node-Jupiter brings growth and luck to shared ventures.'] : []),
      ...(saturnSun ? ['Leverage your Saturn-Sun dynamic for clear authority structures.'] : ['Establish explicit decision-making agreements.']),
      ...(mercuryMercury ? ['Use your Mercury connection for regular strategy sessions.'] : ['Schedule regular check-ins to bridge communication styles.']),
      ...(jupiterSaturn ? ['Balance vision (Jupiter) with execution (Saturn).'] : []),
      ...(challenges.length > 0 ? ['Address power dynamics proactively.'] : [])
    ]
  };
}

// Friendship Analysis - REBALANCED SCORING
function analyzeFriendship(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let rawPoints = 0;
  let maxPossiblePoints = 0;
  
  // TIER 1: Core friendship indicators (10 pts each)
  const mercuryMercury = checkAspect(chart1, 'Mercury', chart2, 'Mercury');
  maxPossiblePoints += 10;
  indicators.push({
    name: 'Mercury-Mercury: Conversation Flow',
    found: !!mercuryMercury,
    aspect: mercuryMercury,
    planet1: 'Mercury',
    planet2: 'Mercury',
    interpretation: mercuryMercury
      ? `${mercuryMercury.type} (${mercuryMercury.orb}° orb): ${mercuryMercury.quality === 'harmonious' ? 'You could talk for hours! Natural mental rapport.' : 'Stimulating discussions that make each other think.'}`
      : 'No direct Mercury aspect. Conversation may require more effort.',
    strength: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryMercury) rawPoints += mercuryMercury.quality === 'harmonious' ? 10 : 5;
  
  const sunMoon = checkAspect(chart1, 'Sun', chart2, 'Moon') || checkAspect(chart2, 'Sun', chart1, 'Moon');
  maxPossiblePoints += 10;
  indicators.push({
    name: 'Sun-Moon: Core Understanding',
    found: !!sunMoon,
    aspect: sunMoon,
    planet1: 'Sun',
    planet2: 'Moon',
    interpretation: sunMoon
      ? `${sunMoon.type} (${sunMoon.orb}° orb): ${sunMoon.quality === 'harmonious' ? 'You "get" each other at a fundamental level.' : 'Your core natures interact intensely.'}`
      : 'No Sun-Moon aspect. Understanding develops over time.',
    strength: sunMoon ? (sunMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (sunMoon) rawPoints += sunMoon.quality === 'harmonious' ? 10 : 5;
  
  // TIER 2: Supporting indicators (8 pts each)
  const jupiterMoon = checkAspect(chart1, 'Jupiter', chart2, 'Moon') || checkAspect(chart2, 'Jupiter', chart1, 'Moon');
  maxPossiblePoints += 8;
  indicators.push({
    name: 'Jupiter-Moon: Emotional Uplift',
    found: !!jupiterMoon,
    aspect: jupiterMoon,
    planet1: 'Jupiter',
    planet2: 'Moon',
    interpretation: jupiterMoon
      ? `${jupiterMoon.type} (${jupiterMoon.orb}° orb): You make each other feel good! Naturally supportive and encouraging.`
      : 'No Jupiter-Moon aspect. Emotional support needs conscious cultivation.',
    strength: jupiterMoon ? 'strong' : 'weak'
  });
  if (jupiterMoon) rawPoints += 8;
  
  const venusVenus = checkAspect(chart1, 'Venus', chart2, 'Venus');
  maxPossiblePoints += 8;
  indicators.push({
    name: 'Venus-Venus: Shared Pleasures',
    found: !!venusVenus,
    aspect: venusVenus,
    planet1: 'Venus',
    planet2: 'Venus',
    interpretation: venusVenus
      ? `${venusVenus.type} (${venusVenus.orb}° orb): ${venusVenus.quality === 'harmonious' ? 'Similar tastes - easy companionship.' : 'Different but complementary values.'}`
      : 'No Venus-Venus aspect. Different tastes can introduce new things.',
    strength: venusVenus ? (venusVenus.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (venusVenus) rawPoints += venusVenus.quality === 'harmonious' ? 8 : 4;
  
  const moonMoon = checkAspect(chart1, 'Moon', chart2, 'Moon');
  maxPossiblePoints += 8;
  indicators.push({
    name: 'Moon-Moon: Emotional Resonance',
    found: !!moonMoon,
    aspect: moonMoon,
    planet1: 'Moon',
    planet2: 'Moon',
    interpretation: moonMoon
      ? `${moonMoon.type} (${moonMoon.orb}° orb): ${moonMoon.quality === 'harmonious' ? 'Deep emotional understanding.' : 'Emotional needs interact intensely.'}`
      : 'No Moon-Moon aspect. Emotional attunement develops through experience.',
    strength: moonMoon ? (moonMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (moonMoon) rawPoints += moonMoon.quality === 'harmonious' ? 8 : 4;
  
  // TIER 3: Bonus indicators (4 pts each)
  const uranusSun = checkAspect(chart1, 'Uranus', chart2, 'Sun') || checkAspect(chart2, 'Uranus', chart1, 'Sun');
  if (uranusSun) {
    maxPossiblePoints += 4;
    indicators.push({
      name: 'Uranus-Sun: Excitement Factor',
      found: true,
      aspect: uranusSun,
      planet1: 'Uranus',
      planet2: 'Sun',
      interpretation: `${uranusSun.type} (${uranusSun.orb}° orb): Never boring! Exciting adventures together.`,
      strength: 'moderate'
    });
    rawPoints += 4;
  }
  
  // Calculate balanced percentage
  const baseScore = 30;
  const achievedPercentage = maxPossiblePoints > 0 ? (rawPoints / maxPossiblePoints) * 50 : 0;
  const overallStrength = Math.max(15, Math.min(85, Math.round(baseScore + achievedPercentage)));
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  
  return {
    focus: 'friendship',
    title: 'Friendship Compatibility Analysis',
    overallStrength,
    indicators,
    summary: overallStrength >= 65
      ? `Strong friendship potential! ${strongIndicators.length} key connections support natural companionship.`
      : overallStrength >= 45
      ? `Good friendship foundation. Natural connection in some areas.`
      : `Friendship may require more conscious effort. Focus on shared activities.`,
    recommendations: [
      ...(mercuryMercury ? ['Use your Mercury connection for long conversations'] : ['Find topics you both enjoy']),
      ...(jupiterMoon ? ['Lean into uplifting each other'] : []),
      ...(venusVenus ? ['Plan activities around your shared tastes'] : ['Explore each other\'s interests']),
      'Shared experiences build the strongest friendships'
    ]
  };
}

// Romantic Analysis - REBALANCED SCORING
function analyzeRomantic(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let rawPoints = 0;
  let maxPossiblePoints = 0;
  
  // TIER 1: Core romantic indicators (10 pts each)
  const venusMars1 = checkAspect(chart1, 'Venus', chart2, 'Mars');
  const venusMars2 = checkAspect(chart2, 'Venus', chart1, 'Mars');
  const venusMars = venusMars1 || venusMars2;
  maxPossiblePoints += 10;
  indicators.push({
    name: 'Venus-Mars: Sexual Chemistry',
    found: !!venusMars,
    aspect: venusMars,
    planet1: 'Venus',
    planet2: 'Mars',
    interpretation: venusMars
      ? `${venusMars.type} (${venusMars.orb}° orb): Classic attraction! ${venusMars.quality === 'harmonious' ? 'Natural romantic and sexual chemistry.' : 'Intense attraction with exciting friction.'}`
      : 'No Venus-Mars aspect. Attraction may build over time.',
    strength: venusMars ? 'strong' : 'weak'
  });
  if (venusMars) rawPoints += 10;
  
  const sunMoon = checkAspect(chart1, 'Sun', chart2, 'Moon') || checkAspect(chart2, 'Sun', chart1, 'Moon');
  maxPossiblePoints += 10;
  indicators.push({
    name: 'Sun-Moon: Soul Connection',
    found: !!sunMoon,
    aspect: sunMoon,
    planet1: 'Sun',
    planet2: 'Moon',
    interpretation: sunMoon
      ? `${sunMoon.type} (${sunMoon.orb}° orb): ${sunMoon.quality === 'harmonious' ? 'Deep soul-level understanding.' : 'Intense connection with growth potential.'}`
      : 'No Sun-Moon aspect. Soul connection develops through nurturing.',
    strength: sunMoon ? (sunMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (sunMoon) rawPoints += sunMoon.quality === 'harmonious' ? 10 : 5;
  
  // TIER 2: Important romantic indicators (8 pts each)
  const venusVenus = checkAspect(chart1, 'Venus', chart2, 'Venus');
  maxPossiblePoints += 8;
  indicators.push({
    name: 'Venus-Venus: Love Languages',
    found: !!venusVenus,
    aspect: venusVenus,
    planet1: 'Venus',
    planet2: 'Venus',
    interpretation: venusVenus
      ? `${venusVenus.type} (${venusVenus.orb}° orb): ${venusVenus.quality === 'harmonious' ? 'Similar love languages - you naturally appreciate each other.' : 'Different but complementary ways of loving.'}`
      : 'No Venus-Venus aspect. Communicate your needs.',
    strength: venusVenus ? (venusVenus.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (venusVenus) rawPoints += venusVenus.quality === 'harmonious' ? 8 : 4;
  
  const moonMoon = checkAspect(chart1, 'Moon', chart2, 'Moon');
  maxPossiblePoints += 8;
  indicators.push({
    name: 'Moon-Moon: Emotional Home',
    found: !!moonMoon,
    aspect: moonMoon,
    planet1: 'Moon',
    planet2: 'Moon',
    interpretation: moonMoon
      ? `${moonMoon.type} (${moonMoon.orb}° orb): ${moonMoon.quality === 'harmonious' ? 'You feel emotionally safe together.' : 'Emotional needs interact intensely.'}`
      : 'No Moon-Moon aspect. Emotional safety builds through care.',
    strength: moonMoon ? (moonMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (moonMoon) rawPoints += moonMoon.quality === 'harmonious' ? 8 : 4;
  
  // TIER 3: Juno indicators - marriage/commitment (6 pts each, ONLY for romantic)
  const junoSun = checkAspect(chart1, 'Juno', chart2, 'Sun') || checkAspect(chart2, 'Juno', chart1, 'Sun');
  if (chart1.planets.Juno || chart2.planets.Juno) {
    maxPossiblePoints += 6;
    if (junoSun) {
      indicators.push({
        name: '★ Juno-Sun: Marriage Potential',
        found: true,
        aspect: junoSun,
        planet1: 'Juno',
        planet2: 'Sun',
        interpretation: `${junoSun.type} (${junoSun.orb}° orb): Juno (goddess of marriage) connects to the Sun. ${junoSun.quality === 'harmonious' ? 'Strong marriage potential.' : 'Commitment energy that requires working through expectations.'}`,
        strength: 'strong'
      });
      rawPoints += 6;
    }
  }

  const junoVenus = checkAspect(chart1, 'Juno', chart2, 'Venus') || checkAspect(chart2, 'Juno', chart1, 'Venus');
  if ((chart1.planets.Juno || chart2.planets.Juno) && junoVenus) {
    maxPossiblePoints += 6;
    indicators.push({
      name: '★ Juno-Venus: Love & Commitment United',
      found: true,
      aspect: junoVenus,
      planet1: 'Juno',
      planet2: 'Venus',
      interpretation: `${junoVenus.type} (${junoVenus.orb}° orb): Juno (commitment) blends with Venus (love). Love naturally leads to lasting partnership.`,
      strength: 'strong'
    });
    rawPoints += 6;
  }

  // TIER 4: Ceres for nurturing (4 pts each)
  const ceresMoon = checkAspect(chart1, 'Ceres', chart2, 'Moon') || checkAspect(chart2, 'Ceres', chart1, 'Moon');
  if ((chart1.planets.Ceres || chart2.planets.Ceres) && ceresMoon) {
    maxPossiblePoints += 4;
    indicators.push({
      name: 'Ceres-Moon: Deep Nurturing',
      found: true,
      aspect: ceresMoon,
      planet1: 'Ceres',
      planet2: 'Moon',
      interpretation: `${ceresMoon.type} (${ceresMoon.orb}° orb): Ceres connects with the Moon. Deeply nurturing dynamic - excellent for family-building.`,
      strength: 'strong'
    });
    rawPoints += 4;
  }
  
  // Node connections - destiny (5 pts each)
  const nodeVenus = checkAspect(chart1, 'NorthNode', chart2, 'Venus') || checkAspect(chart2, 'NorthNode', chart1, 'Venus');
  if (nodeVenus) {
    maxPossiblePoints += 5;
    indicators.push({
      name: '★ North Node-Venus: Fated Love',
      found: true,
      aspect: nodeVenus,
      planet1: 'NorthNode',
      planet2: 'Venus',
      interpretation: `${nodeVenus.type} (${nodeVenus.orb}° orb): Fated romantic connection. Strong "meant to be" feeling.`,
      strength: 'strong'
    });
    rawPoints += 5;
  }

  // Calculate balanced percentage
  const baseScore = 30;
  const achievedPercentage = maxPossiblePoints > 0 ? (rawPoints / maxPossiblePoints) * 50 : 0;
  const overallStrength = Math.max(15, Math.min(85, Math.round(baseScore + achievedPercentage)));
  
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  const junoIndicators = indicators.filter(i => i.name.includes('Juno'));
  
  return {
    focus: 'romantic',
    title: 'Romantic Compatibility Analysis',
    overallStrength,
    indicators,
    summary: overallStrength >= 65
      ? `High romantic potential! ${strongIndicators.length} love indicators suggest strong chemistry.${junoIndicators.length > 0 ? ` Juno connections point to lasting commitment.` : ''}`
      : overallStrength >= 45
      ? `Solid romantic foundation. Key connections support love with some areas needing nurturing.`
      : `Romance may develop gradually. Build friendship first; attraction grows with understanding.`,
    recommendations: [
      ...(venusMars ? ['Your Venus-Mars chemistry is real - physical affection matters'] : ['Build attraction through shared experiences']),
      ...(sunMoon ? ['Honor your Sun-Moon connection'] : []),
      ...(nodeVenus ? ['This feels fated - trust it while doing the work'] : []),
      ...(junoVenus || junoSun ? ['★ Juno connections indicate marriage potential'] : []),
      ...(ceresMoon ? ['Nurture each other through acts of care'] : []),
      'Communicate love languages explicitly'
    ]
  };
}

// Creative Partnership Analysis - REBALANCED SCORING
function analyzeCreative(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let rawPoints = 0;
  let maxPossiblePoints = 0;
  
  // TIER 1: Core creative indicators (10 pts each)
  const neptuneSun = checkAspect(chart1, 'Neptune', chart2, 'Sun') || checkAspect(chart2, 'Neptune', chart1, 'Sun');
  maxPossiblePoints += 10;
  indicators.push({
    name: 'Neptune-Sun: Shared Vision',
    found: !!neptuneSun,
    aspect: neptuneSun,
    planet1: 'Neptune',
    planet2: 'Sun',
    interpretation: neptuneSun
      ? `${neptuneSun.type} (${neptuneSun.orb}° orb): Neptune inspires the Sun person's creative identity. ${neptuneSun.quality === 'harmonious' ? 'Beautiful imaginative flow.' : 'Intense creative energy - clarify visions together.'}`
      : 'No Neptune-Sun aspect. Creative inspiration comes from other sources.',
    strength: neptuneSun ? (neptuneSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (neptuneSun) rawPoints += neptuneSun.quality === 'harmonious' ? 10 : 5;
  
  const venusVenus = checkAspect(chart1, 'Venus', chart2, 'Venus');
  maxPossiblePoints += 10;
  indicators.push({
    name: 'Venus-Venus: Aesthetic Harmony',
    found: !!venusVenus,
    aspect: venusVenus,
    planet1: 'Venus',
    planet2: 'Venus',
    interpretation: venusVenus
      ? `${venusVenus.type} (${venusVenus.orb}° orb): ${venusVenus.quality === 'harmonious' ? 'Similar aesthetics - you create beauty together.' : 'Different aesthetics can spark innovation.'}`
      : 'No Venus-Venus aspect. Different preferences can enrich collaboration.',
    strength: venusVenus ? (venusVenus.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (venusVenus) rawPoints += venusVenus.quality === 'harmonious' ? 10 : 5;
  
  // TIER 2: Supporting creative indicators (8 pts each)
  const mercuryVenus = checkAspect(chart1, 'Mercury', chart2, 'Venus') || checkAspect(chart2, 'Mercury', chart1, 'Venus');
  maxPossiblePoints += 8;
  indicators.push({
    name: 'Mercury-Venus: Artistic Expression',
    found: !!mercuryVenus,
    aspect: mercuryVenus,
    planet1: 'Mercury',
    planet2: 'Venus',
    interpretation: mercuryVenus
      ? `${mercuryVenus.type} (${mercuryVenus.orb}° orb): Ideas are expressed artistically. Natural creative dialogue.`
      : 'No Mercury-Venus aspect. Creative communication develops through practice.',
    strength: mercuryVenus ? 'strong' : 'weak'
  });
  if (mercuryVenus) rawPoints += 8;
  
  const moonNeptune = checkAspect(chart1, 'Moon', chart2, 'Neptune') || checkAspect(chart2, 'Moon', chart1, 'Neptune');
  maxPossiblePoints += 8;
  indicators.push({
    name: 'Moon-Neptune: Intuitive Creation',
    found: !!moonNeptune,
    aspect: moonNeptune,
    planet1: 'Moon',
    planet2: 'Neptune',
    interpretation: moonNeptune
      ? `${moonNeptune.type} (${moonNeptune.orb}° orb): ${moonNeptune.quality === 'harmonious' ? 'Shared creative stream - almost telepathic.' : 'Powerful emotional creativity.'}`
      : 'No Moon-Neptune aspect. Intuitive creativity develops through experience.',
    strength: moonNeptune ? (moonNeptune.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (moonNeptune) rawPoints += moonNeptune.quality === 'harmonious' ? 8 : 4;
  
  // TIER 3: Innovation indicators (4 pts each)
  const uranusVenus = checkAspect(chart1, 'Uranus', chart2, 'Venus') || checkAspect(chart2, 'Uranus', chart1, 'Venus');
  if (uranusVenus) {
    maxPossiblePoints += 4;
    indicators.push({
      name: 'Uranus-Venus: Creative Innovation',
      found: true,
      aspect: uranusVenus,
      planet1: 'Uranus',
      planet2: 'Venus',
      interpretation: `${uranusVenus.type} (${uranusVenus.orb}° orb): Uranus electrifies creativity. Innovative, ahead-of-the-curve work.`,
      strength: 'moderate'
    });
    rawPoints += 4;
  }
  
  // Calculate balanced percentage
  const baseScore = 30;
  const achievedPercentage = maxPossiblePoints > 0 ? (rawPoints / maxPossiblePoints) * 50 : 0;
  const overallStrength = Math.max(15, Math.min(85, Math.round(baseScore + achievedPercentage)));
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  
  return {
    focus: 'creative',
    title: 'Creative Partnership Analysis',
    overallStrength,
    indicators,
    summary: overallStrength >= 65
      ? `Strong creative partnership! ${strongIndicators.length} key connections support artistic collaboration.`
      : overallStrength >= 45
      ? `Good creative potential. Some synergy exists; others need cultivation.`
      : `Creative collaboration needs structure. Different styles can complement if harnessed well.`,
    recommendations: [
      ...(neptuneSun ? ['Your Neptune-Sun supports shared dreaming'] : []),
      ...(venusVenus ? ['Lean into your shared aesthetic'] : ['Explore each other\'s preferences']),
      ...(mercuryVenus ? ['Use your Mercury-Venus for creative dialogue'] : []),
      'Schedule regular creative sessions together'
    ]
  };
}

// Main analysis function
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
      // Family uses friendship + karmic indicators
      const friendship = analyzeFriendship(chart1, chart2);
      return {
        ...friendship,
        focus: 'family',
        title: 'Family Bond Analysis',
        summary: friendship.summary.replace('Friendship', 'Family connection')
      };
    case 'all':
    default:
      return null;
  }
}
