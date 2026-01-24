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

// Business Partnership Analysis
function analyzeBusinessPartnership(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let score = 0;
  
  // *** KARMIC BUSINESS INDICATORS - Saturn-Node connections ***
  const saturnNorthNode = checkAspect(chart1, 'Saturn', chart2, 'NorthNode') || checkAspect(chart2, 'Saturn', chart1, 'NorthNode');
  if (saturnNorthNode) {
    indicators.push({
      name: '★ KARMIC: Saturn-North Node',
      found: true,
      aspect: saturnNorthNode,
      planet1: 'Saturn',
      planet2: 'NorthNode',
      interpretation: `${saturnNorthNode.type} (${saturnNorthNode.orb}° orb): **HIGHLY SIGNIFICANT for business.** This is a fated connection where Saturn provides the structure, discipline, and long-term commitment the North Node person needs for their destiny path. ${saturnNorthNode.type === 'conjunction' ? 'The conjunction is especially powerful—Saturn acts as a karmic teacher, providing exactly the professional lessons needed for growth. This partnership has "meant to be" energy around shared work and building something lasting.' : 'This aspect indicates a destined professional relationship with important lessons around responsibility, structure, and achievement.'}`,
      strength: 'strong'
    });
    // Saturn-Node conjunction is a MAJOR business indicator
    score += saturnNorthNode.type === 'conjunction' ? 25 : 18;
  } else {
    indicators.push({
      name: 'Karmic: Saturn-North Node',
      found: false,
      interpretation: 'No Saturn-Node aspect. The partnership lacks the "fated business lesson" signature, but can still be successful through other connections.',
      strength: 'absent'
    });
  }
  
  const saturnSouthNode = checkAspect(chart1, 'Saturn', chart2, 'SouthNode') || checkAspect(chart2, 'Saturn', chart1, 'SouthNode');
  if (saturnSouthNode) {
    indicators.push({
      name: 'Past-Life: Saturn-South Node',
      found: true,
      aspect: saturnSouthNode,
      planet1: 'Saturn',
      planet2: 'SouthNode',
      interpretation: `${saturnSouthNode.type} (${saturnSouthNode.orb}° orb): You've likely worked together before in a past life. There's a familiar professional dynamic—you may fall into established roles easily. The challenge is to not repeat old patterns that limited growth before.`,
      strength: 'moderate'
    });
    score += 10;
  }
  
  // Saturn aspects - structure and commitment
  const saturnSun = checkAspect(chart1, 'Saturn', chart2, 'Sun') || checkAspect(chart2, 'Saturn', chart1, 'Sun');
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
  if (saturnSun) score += saturnSun.quality === 'harmonious' ? 15 : 10;
  
  const saturnMercury = checkAspect(chart1, 'Saturn', chart2, 'Mercury') || checkAspect(chart2, 'Saturn', chart1, 'Mercury');
  indicators.push({
    name: 'Saturn-Mercury: Practical Communication',
    found: !!saturnMercury,
    aspect: saturnMercury,
    planet1: 'Saturn',
    planet2: 'Mercury',
    interpretation: saturnMercury
      ? `${saturnMercury.type} (${saturnMercury.orb}° orb): Business communications are ${saturnMercury.quality === 'harmonious' ? 'grounded and productive' : 'sometimes tense, but ultimately clarifying'}. Saturn adds weight to Mercury's ideas.`
      : 'No Saturn-Mercury aspect. Communication style may be less formal - ensure important agreements are documented.',
    strength: saturnMercury ? (saturnMercury.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (saturnMercury) score += saturnMercury.quality === 'harmonious' ? 12 : 8;
  
  // Mercury aspects - communication
  const mercuryMercury = checkAspect(chart1, 'Mercury', chart2, 'Mercury');
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
  if (mercuryMercury) score += mercuryMercury.quality === 'harmonious' ? 12 : 6;
  
  // Jupiter aspects - expansion and opportunity
  const jupiterSun = checkAspect(chart1, 'Jupiter', chart2, 'Sun') || checkAspect(chart2, 'Jupiter', chart1, 'Sun');
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
  if (jupiterSun) score += jupiterSun.quality === 'harmonious' ? 15 : 8;
  
  // Jupiter-Saturn - balance of expansion and structure (great for business!)
  const jupiterSaturn = checkAspect(chart1, 'Jupiter', chart2, 'Saturn') || checkAspect(chart2, 'Jupiter', chart1, 'Saturn');
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
    score += jupiterSaturn.quality === 'harmonious' ? 18 : 10;
  }
  
  // Pluto aspects - power dynamics (important for business)
  const plutoSun = checkAspect(chart1, 'Pluto', chart2, 'Sun') || checkAspect(chart2, 'Pluto', chart1, 'Sun');
  indicators.push({
    name: 'Pluto-Sun: Power Dynamics',
    found: !!plutoSun,
    aspect: plutoSun,
    planet1: 'Pluto',
    planet2: 'Sun',
    interpretation: plutoSun
      ? `${plutoSun.type} (${plutoSun.orb}° orb): Intense power dynamics. ${plutoSun.quality === 'tense' ? 'Power struggles possible - requires mature handling and clear boundaries.' : 'Transformative partnership potential - you empower each other.'}`
      : 'No Pluto-Sun aspect. Power dynamics are less intense, which can be easier to navigate.',
    strength: plutoSun ? (plutoSun.quality === 'harmonious' ? 'moderate' : 'moderate') : 'absent'
  });
  if (plutoSun) score += 5; // Neutral - powerful but can be tricky
  
  // Mars aspects - action and drive
  const marsMars = checkAspect(chart1, 'Mars', chart2, 'Mars');
  indicators.push({
    name: 'Mars-Mars: Shared Drive',
    found: !!marsMars,
    aspect: marsMars,
    planet1: 'Mars',
    planet2: 'Mars',
    interpretation: marsMars
      ? `${marsMars.type} (${marsMars.orb}° orb): Your action styles ${marsMars.quality === 'harmonious' ? 'align well - you energize each other' : 'clash - different approaches to getting things done'}. ${marsMars.type === 'conjunction' ? 'Very similar drive!' : ''}`
      : 'No Mars-Mars aspect. Your working styles are different enough to require understanding.',
    strength: marsMars ? (marsMars.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (marsMars) score += marsMars.quality === 'harmonious' ? 12 : 4;
  
  // Pallas for strategy (business asteroid!)
  const pallasSun = checkAspect(chart1, 'Pallas', chart2, 'Sun') || checkAspect(chart2, 'Pallas', chart1, 'Sun');
  if (pallasSun) {
    indicators.push({
      name: 'Pallas-Sun: Strategic Vision',
      found: true,
      aspect: pallasSun,
      planet1: 'Pallas',
      planet2: 'Sun',
      interpretation: `${pallasSun.type} (${pallasSun.orb}° orb): Pallas is the asteroid of strategy and pattern recognition. This aspect enhances your ability to plan and strategize together. The Pallas person sees patterns that help the Sun person shine.`,
      strength: 'moderate'
    });
    score += 8;
  }
  
  // 2nd/10th house overlays (money/career houses)
  // Simplified check - look for Saturn, Jupiter, or Sun in relevant positions
  const saturnSaturn = checkAspect(chart1, 'Saturn', chart2, 'Saturn');
  if (saturnSaturn) {
    indicators.push({
      name: 'Saturn-Saturn: Generational Work Ethic',
      found: true,
      aspect: saturnSaturn,
      planet1: 'Saturn',
      planet2: 'Saturn',
      interpretation: `${saturnSaturn.type} (${saturnSaturn.orb}° orb): Similar generational approach to responsibility and structure. ${saturnSaturn.quality === 'harmonious' ? 'Shared values around work and commitment.' : 'Different but related lessons around responsibility.'}`,
      strength: saturnSaturn.quality === 'harmonious' ? 'strong' : 'moderate'
    });
    if (saturnSaturn.quality === 'harmonious') score += 10;
  }
  
  // Calculate overall strength
  const overallStrength = Math.min(100, Math.round(score));
  
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  const karmicIndicators = indicators.filter(i => i.name.includes('KARMIC') || i.name.includes('Past-Life'));
  const challenges = indicators.filter(i => i.aspect?.quality === 'tense');
  
  return {
    focus: 'business',
    title: 'Business Partnership Analysis',
    overallStrength,
    indicators,
    summary: overallStrength >= 70 
      ? `Strong business partnership potential! You have ${strongIndicators.length} key indicators for professional success. ${karmicIndicators.length > 0 ? `This includes ${karmicIndicators.length} karmic indicator(s) suggesting a fated professional connection.` : ''}`
      : overallStrength >= 50
      ? `Moderate business potential. ${karmicIndicators.length > 0 ? `Your ${karmicIndicators[0].name} is significant - there's a destined quality to this work relationship.` : 'Some structure exists, but conscious effort needed.'} ${challenges.length > 0 ? 'Watch for tension points.' : ''}`
      : `Business partnership would require conscious effort. ${karmicIndicators.length > 0 ? `However, your karmic connection suggests there may be important lessons to learn through working together.` : 'Consider defining very clear roles and expectations.'}`,
    recommendations: [
      ...(saturnNorthNode ? ['★ Your Saturn-North Node connection is a MAJOR karmic business indicator. This partnership has a fated quality - Saturn provides exactly the structure and lessons the Node person needs for their professional destiny.'] : []),
      ...(saturnSun ? ['Use your Saturn-Sun dynamic to establish clear authority structures'] : ['Create explicit agreements about decision-making authority']),
      ...(mercuryMercury ? ['Leverage your Mercury connection for regular strategy sessions'] : ['Schedule regular check-ins to bridge different communication styles']),
      ...(jupiterSun ? ['Pursue growth opportunities together - your Jupiter-Sun aspect supports expansion'] : ['Set specific growth targets to stay aligned']),
      ...(jupiterSaturn ? ['Balance your Jupiter-Saturn dynamic: let the visionary dream big while the pragmatist ensures execution'] : []),
      ...(challenges.length > 0 ? ['Address potential friction points proactively - your challenging aspects are growth edges'] : [])
    ]
  };
}

// Friendship Analysis
function analyzeFriendship(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let score = 0;
  
  // Mercury aspects - communication and mental connection
  const mercuryMercury = checkAspect(chart1, 'Mercury', chart2, 'Mercury');
  indicators.push({
    name: 'Mercury-Mercury: Conversation Flow',
    found: !!mercuryMercury,
    aspect: mercuryMercury,
    planet1: 'Mercury',
    planet2: 'Mercury',
    interpretation: mercuryMercury
      ? `${mercuryMercury.type} (${mercuryMercury.orb}° orb): ${mercuryMercury.quality === 'harmonious' ? 'You could talk for hours! Natural mental rapport and easy conversation.' : 'Stimulating but sometimes challenging discussions. You make each other think.'}`
      : 'No direct Mercury aspect. Conversation may require more effort but can still be rewarding.',
    strength: mercuryMercury ? (mercuryMercury.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (mercuryMercury) score += mercuryMercury.quality === 'harmonious' ? 15 : 8;
  
  // Jupiter aspects - fun and growth
  const jupiterMoon = checkAspect(chart1, 'Jupiter', chart2, 'Moon') || checkAspect(chart2, 'Jupiter', chart1, 'Moon');
  indicators.push({
    name: 'Jupiter-Moon: Emotional Uplift',
    found: !!jupiterMoon,
    aspect: jupiterMoon,
    planet1: 'Jupiter',
    planet2: 'Moon',
    interpretation: jupiterMoon
      ? `${jupiterMoon.type} (${jupiterMoon.orb}° orb): You make each other feel good! Jupiter expands and uplifts Moon's emotional world. ${jupiterMoon.quality === 'harmonious' ? 'Naturally supportive and encouraging.' : 'Sometimes too much optimism, but generally positive.'}`
      : 'No Jupiter-Moon aspect. Emotional support exists but may need conscious cultivation.',
    strength: jupiterMoon ? 'strong' : 'weak'
  });
  if (jupiterMoon) score += 15;
  
  // Sun-Moon - emotional understanding
  const sunMoon = checkAspect(chart1, 'Sun', chart2, 'Moon') || checkAspect(chart2, 'Sun', chart1, 'Moon');
  indicators.push({
    name: 'Sun-Moon: Core Understanding',
    found: !!sunMoon,
    aspect: sunMoon,
    planet1: 'Sun',
    planet2: 'Moon',
    interpretation: sunMoon
      ? `${sunMoon.type} (${sunMoon.orb}° orb): ${sunMoon.quality === 'harmonious' ? 'You "get" each other at a fundamental level. Natural emotional attunement.' : 'Your core natures interact intensely - sometimes understanding, sometimes friction.'}`
      : 'No Sun-Moon aspect. Understanding requires more conscious effort but can deepen over time.',
    strength: sunMoon ? (sunMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (sunMoon) score += sunMoon.quality === 'harmonious' ? 15 : 8;
  
  // Venus aspects - affection and shared pleasures
  const venusVenus = checkAspect(chart1, 'Venus', chart2, 'Venus');
  indicators.push({
    name: 'Venus-Venus: Shared Pleasures',
    found: !!venusVenus,
    aspect: venusVenus,
    planet1: 'Venus',
    planet2: 'Venus',
    interpretation: venusVenus
      ? `${venusVenus.type} (${venusVenus.orb}° orb): Similar tastes and values! ${venusVenus.quality === 'harmonious' ? 'You enjoy the same things - easy companionship.' : 'Different but complementary aesthetics and values.'}`
      : 'No Venus-Venus aspect. You may have different tastes, which can introduce each other to new things.',
    strength: venusVenus ? (venusVenus.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (venusVenus) score += venusVenus.quality === 'harmonious' ? 12 : 6;
  
  // Uranus aspects - excitement and uniqueness
  const uranusSun = checkAspect(chart1, 'Uranus', chart2, 'Sun') || checkAspect(chart2, 'Uranus', chart1, 'Sun');
  indicators.push({
    name: 'Uranus-Sun: Excitement Factor',
    found: !!uranusSun,
    aspect: uranusSun,
    planet1: 'Uranus',
    planet2: 'Sun',
    interpretation: uranusSun
      ? `${uranusSun.type} (${uranusSun.orb}° orb): Never boring! Uranus electrifies the Sun person. ${uranusSun.quality === 'harmonious' ? 'Exciting adventures and shared uniqueness.' : 'Unpredictable but stimulating - keeps things interesting.'}`
      : 'No Uranus-Sun aspect. Excitement comes from other sources in your friendship.',
    strength: uranusSun ? 'moderate' : 'absent'
  });
  if (uranusSun) score += 10;
  
  // Moon-Moon - emotional resonance
  const moonMoon = checkAspect(chart1, 'Moon', chart2, 'Moon');
  indicators.push({
    name: 'Moon-Moon: Emotional Resonance',
    found: !!moonMoon,
    aspect: moonMoon,
    planet1: 'Moon',
    planet2: 'Moon',
    interpretation: moonMoon
      ? `${moonMoon.type} (${moonMoon.orb}° orb): ${moonMoon.quality === 'harmonious' ? 'Deep emotional understanding - you feel safe with each other.' : 'Your emotional needs interact intensely - requires mutual awareness.'}`
      : 'No Moon-Moon aspect. Emotional attunement develops through shared experiences.',
    strength: moonMoon ? (moonMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (moonMoon) score += moonMoon.quality === 'harmonious' ? 15 : 6;
  
  const overallStrength = Math.min(100, Math.round(score * 1.1));
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  
  return {
    focus: 'friendship',
    title: 'Friendship Compatibility Analysis',
    overallStrength,
    indicators,
    summary: overallStrength >= 70
      ? `Strong friendship potential! ${strongIndicators.length} key connections support natural companionship and mutual understanding.`
      : overallStrength >= 50
      ? `Good friendship foundation. You have areas of natural connection that can deepen with shared experiences.`
      : `Friendship may require more conscious effort, but can still be rewarding. Focus on shared activities and interests.`,
    recommendations: [
      ...(mercuryMercury ? ['Use your Mercury connection for long conversations and idea-sharing'] : ['Find topics you both enjoy discussing']),
      ...(jupiterMoon ? ['Your Jupiter-Moon supports emotional encouragement - lean into uplifting each other'] : []),
      ...(venusVenus ? ['Plan activities around your shared tastes and pleasures'] : ['Explore each other\'s interests to broaden your friendship']),
      'Shared experiences build the strongest friendships'
    ]
  };
}

// Romantic Analysis
function analyzeRomantic(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let score = 0;
  
  // Venus-Mars - sexual chemistry
  const venusMars1 = checkAspect(chart1, 'Venus', chart2, 'Mars');
  const venusMars2 = checkAspect(chart2, 'Venus', chart1, 'Mars');
  const venusMars = venusMars1 || venusMars2;
  indicators.push({
    name: 'Venus-Mars: Sexual Chemistry',
    found: !!venusMars,
    aspect: venusMars,
    planet1: 'Venus',
    planet2: 'Mars',
    interpretation: venusMars
      ? `${venusMars.type} (${venusMars.orb}° orb): Classic attraction! ${venusMars.quality === 'harmonious' ? 'Natural romantic and sexual chemistry flows easily.' : 'Intense attraction with friction that can be exciting or challenging.'}`
      : 'No Venus-Mars aspect. Attraction may build through other connections or develop over time.',
    strength: venusMars ? 'strong' : 'weak'
  });
  if (venusMars) score += 20;
  
  // Sun-Moon - fundamental compatibility
  const sunMoon = checkAspect(chart1, 'Sun', chart2, 'Moon') || checkAspect(chart2, 'Sun', chart1, 'Moon');
  indicators.push({
    name: 'Sun-Moon: Soul Connection',
    found: !!sunMoon,
    aspect: sunMoon,
    planet1: 'Sun',
    planet2: 'Moon',
    interpretation: sunMoon
      ? `${sunMoon.type} (${sunMoon.orb}° orb): ${sunMoon.quality === 'harmonious' ? 'Deep soul-level understanding. One\'s identity nourishes the other\'s emotions.' : 'Intense connection with growth edges - you challenge each other to evolve.'}`
      : 'No Sun-Moon aspect. Soul connection develops through conscious nurturing.',
    strength: sunMoon ? (sunMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (sunMoon) score += sunMoon.quality === 'harmonious' ? 18 : 10;
  
  // Venus-Venus - shared values in love
  const venusVenus = checkAspect(chart1, 'Venus', chart2, 'Venus');
  indicators.push({
    name: 'Venus-Venus: Love Languages',
    found: !!venusVenus,
    aspect: venusVenus,
    planet1: 'Venus',
    planet2: 'Venus',
    interpretation: venusVenus
      ? `${venusVenus.type} (${venusVenus.orb}° orb): ${venusVenus.quality === 'harmonious' ? 'Similar love languages and values. You naturally appreciate each other.' : 'Different but complementary ways of loving. Learning each other\'s style is key.'}`
      : 'No Venus-Venus aspect. You may express love differently - communicate your needs.',
    strength: venusVenus ? (venusVenus.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (venusVenus) score += venusVenus.quality === 'harmonious' ? 15 : 8;
  
  // Moon-Moon - emotional compatibility
  const moonMoon = checkAspect(chart1, 'Moon', chart2, 'Moon');
  indicators.push({
    name: 'Moon-Moon: Emotional Home',
    found: !!moonMoon,
    aspect: moonMoon,
    planet1: 'Moon',
    planet2: 'Moon',
    interpretation: moonMoon
      ? `${moonMoon.type} (${moonMoon.orb}° orb): ${moonMoon.quality === 'harmonious' ? 'You feel emotionally safe together - a sense of home.' : 'Emotional needs interact intensely - understanding each other\'s triggers is essential.'}`
      : 'No Moon-Moon aspect. Emotional safety builds through consistent care.',
    strength: moonMoon ? (moonMoon.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (moonMoon) score += moonMoon.quality === 'harmonious' ? 15 : 8;
  
  // Juno aspects - marriage/commitment indicator
  const junoSun = checkAspect(chart1, 'Juno', chart2, 'Sun') || checkAspect(chart2, 'Juno', chart1, 'Sun');
  if (chart1.planets.Juno || chart2.planets.Juno) {
    indicators.push({
      name: 'Juno-Sun: Marriage Potential',
      found: !!junoSun,
      aspect: junoSun,
      planet1: 'Juno',
      planet2: 'Sun',
      interpretation: junoSun
        ? `${junoSun.type} (${junoSun.orb}° orb): Juno (goddess of marriage) connects to the Sun. ${junoSun.quality === 'harmonious' ? 'Strong marriage potential - one sees the other as "the one."' : 'Intense commitment energy that may require working through expectations.'}`
        : 'No Juno-Sun aspect. Commitment builds through other connections.',
      strength: junoSun ? 'strong' : 'absent'
    });
    if (junoSun) score += 15;
  }
  
  // Node connections - destiny
  const nodeVenus = checkAspect(chart1, 'NorthNode', chart2, 'Venus') || checkAspect(chart2, 'NorthNode', chart1, 'Venus');
  indicators.push({
    name: 'North Node-Venus: Fated Love',
    found: !!nodeVenus,
    aspect: nodeVenus,
    planet1: 'NorthNode',
    planet2: 'Venus',
    interpretation: nodeVenus
      ? `${nodeVenus.type} (${nodeVenus.orb}° orb): Fated romantic connection. The Venus person embodies the love the Node person is destined to experience. Strong "meant to be" feeling.`
      : 'No Node-Venus aspect. The relationship is less "fated" but can still be deeply fulfilling.',
    strength: nodeVenus ? 'strong' : 'absent'
  });
  if (nodeVenus) score += 18;
  
  const overallStrength = Math.min(100, Math.round(score * 1.0));
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  
  return {
    focus: 'romantic',
    title: 'Romantic Compatibility Analysis',
    overallStrength,
    indicators,
    summary: overallStrength >= 75
      ? `High romantic potential! ${strongIndicators.length} major love indicators suggest strong chemistry and compatibility.`
      : overallStrength >= 50
      ? `Solid romantic foundation with room to grow. Key connections support love, with some areas requiring conscious nurturing.`
      : `Romance may develop more slowly. Focus on building friendship first; attraction can grow through deeper understanding.`,
    recommendations: [
      ...(venusMars ? ['Your Venus-Mars chemistry is real - physical affection is important'] : ['Build attraction through shared experiences and emotional intimacy']),
      ...(sunMoon ? ['Honor your Sun-Moon connection through emotional attunement'] : []),
      ...(nodeVenus ? ['This feels fated - trust the connection while doing the work'] : []),
      'Communicate love languages explicitly'
    ]
  };
}

// Creative Partnership Analysis
function analyzeCreative(chart1: NatalChart, chart2: NatalChart): FocusAnalysis {
  const indicators: FocusIndicator[] = [];
  let score = 0;
  
  // Neptune aspects - inspiration and imagination
  const neptuneSun = checkAspect(chart1, 'Neptune', chart2, 'Sun') || checkAspect(chart2, 'Neptune', chart1, 'Sun');
  indicators.push({
    name: 'Neptune-Sun: Shared Vision',
    found: !!neptuneSun,
    aspect: neptuneSun,
    planet1: 'Neptune',
    planet2: 'Sun',
    interpretation: neptuneSun
      ? `${neptuneSun.type} (${neptuneSun.orb}° orb): Neptune inspires the Sun person's creative identity. ${neptuneSun.quality === 'harmonious' ? 'Beautiful imaginative flow and shared dreams.' : 'Intense but potentially confusing creative energy - clarify visions together.'}`
      : 'No Neptune-Sun aspect. Creative inspiration comes from other sources.',
    strength: neptuneSun ? (neptuneSun.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (neptuneSun) score += neptuneSun.quality === 'harmonious' ? 18 : 10;
  
  // Venus aspects - aesthetic harmony
  const venusVenus = checkAspect(chart1, 'Venus', chart2, 'Venus');
  indicators.push({
    name: 'Venus-Venus: Aesthetic Harmony',
    found: !!venusVenus,
    aspect: venusVenus,
    planet1: 'Venus',
    planet2: 'Venus',
    interpretation: venusVenus
      ? `${venusVenus.type} (${venusVenus.orb}° orb): ${venusVenus.quality === 'harmonious' ? 'Similar aesthetic sensibilities - you naturally create beauty together.' : 'Different but stimulating aesthetics - creative tension can spark innovation.'}`
      : 'No Venus-Venus aspect. You may have different artistic preferences, which can enrich collaboration.',
    strength: venusVenus ? (venusVenus.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (venusVenus) score += venusVenus.quality === 'harmonious' ? 15 : 8;
  
  // Mercury-Venus - creative communication
  const mercuryVenus = checkAspect(chart1, 'Mercury', chart2, 'Venus') || checkAspect(chart2, 'Mercury', chart1, 'Venus');
  indicators.push({
    name: 'Mercury-Venus: Artistic Expression',
    found: !!mercuryVenus,
    aspect: mercuryVenus,
    planet1: 'Mercury',
    planet2: 'Venus',
    interpretation: mercuryVenus
      ? `${mercuryVenus.type} (${mercuryVenus.orb}° orb): Beautiful communication! Ideas are expressed artistically. ${mercuryVenus.quality === 'harmonious' ? 'Natural creative dialogue and artistic expression together.' : 'Stimulating creative discussions with occasional friction.'}`
      : 'No Mercury-Venus aspect. Creative communication develops through practice.',
    strength: mercuryVenus ? 'strong' : 'weak'
  });
  if (mercuryVenus) score += 15;
  
  // Uranus aspects - innovation and uniqueness
  const uranusVenus = checkAspect(chart1, 'Uranus', chart2, 'Venus') || checkAspect(chart2, 'Uranus', chart1, 'Venus');
  indicators.push({
    name: 'Uranus-Venus: Creative Innovation',
    found: !!uranusVenus,
    aspect: uranusVenus,
    planet1: 'Uranus',
    planet2: 'Venus',
    interpretation: uranusVenus
      ? `${uranusVenus.type} (${uranusVenus.orb}° orb): Uranus electrifies Venus's creativity. ${uranusVenus.quality === 'harmonious' ? 'Innovative, ahead-of-the-curve creative work.' : 'Unpredictable but exciting creative bursts.'}`
      : 'No Uranus-Venus aspect. Innovation comes from conscious experimentation.',
    strength: uranusVenus ? 'moderate' : 'absent'
  });
  if (uranusVenus) score += 12;
  
  // Moon-Neptune - emotional/intuitive creativity
  const moonNeptune = checkAspect(chart1, 'Moon', chart2, 'Neptune') || checkAspect(chart2, 'Moon', chart1, 'Neptune');
  indicators.push({
    name: 'Moon-Neptune: Intuitive Creation',
    found: !!moonNeptune,
    aspect: moonNeptune,
    planet1: 'Moon',
    planet2: 'Neptune',
    interpretation: moonNeptune
      ? `${moonNeptune.type} (${moonNeptune.orb}° orb): Deeply intuitive creative connection. ${moonNeptune.quality === 'harmonious' ? 'You tap into a shared creative stream - almost telepathic inspiration.' : 'Powerful but sometimes overwhelming emotional creativity.'}`
      : 'No Moon-Neptune aspect. Intuitive creativity develops through shared experience.',
    strength: moonNeptune ? (moonNeptune.quality === 'harmonious' ? 'strong' : 'moderate') : 'weak'
  });
  if (moonNeptune) score += moonNeptune.quality === 'harmonious' ? 15 : 8;
  
  const overallStrength = Math.min(100, Math.round(score * 1.2));
  const strongIndicators = indicators.filter(i => i.strength === 'strong');
  
  return {
    focus: 'creative',
    title: 'Creative Partnership Analysis',
    overallStrength,
    indicators,
    summary: overallStrength >= 70
      ? `Strong creative partnership potential! ${strongIndicators.length} key connections support artistic collaboration and shared vision.`
      : overallStrength >= 45
      ? `Good creative potential. Some natural synergy exists; others require conscious cultivation.`
      : `Creative collaboration may require more structure and explicit goal-setting. Different creative styles can complement if harnessed well.`,
    recommendations: [
      ...(neptuneSun ? ['Your Neptune-Sun connection supports shared dreaming - use vision boards and brainstorming'] : []),
      ...(venusVenus ? ['Lean into your shared aesthetic - create in your mutual style'] : ['Explore each other\'s aesthetic preferences']),
      ...(mercuryVenus ? ['Your Mercury-Venus supports artistic dialogue - talk through creative ideas together'] : []),
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
