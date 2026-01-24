/**
 * Shadow & Risk Factor Analysis for Synastry
 * 
 * This module analyzes potentially challenging dynamics that require awareness:
 * - Domestic abuse risk factors (power/control patterns)
 * - Manipulation/Gaslighting indicators
 * - Codependency patterns
 * - Boundary issues
 * - Addiction enabling dynamics
 * 
 * IMPORTANT DISCLAIMER: These are energetic patterns, not predictions.
 * Awareness + consciousness can transform any pattern.
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

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

export type RiskLevel = 'watch' | 'caution' | 'significant';

export interface ShadowIndicator {
  name: string;
  category: 'power-control' | 'manipulation' | 'codependency' | 'boundary' | 'rage' | 'addiction';
  riskLevel: RiskLevel;
  description: string;
  dynamicExplanation: string;
  healthyExpression: string;
  warningBehaviors: string[];
  healingPath: string;
  planets: string[];
  aspect?: AspectResult;
  // NEW: Track who owns which planet
  planetOwnership?: {
    planet1: string;
    planet1Owner: string;
    planet2: string;
    planet2Owner: string;
  };
}

export interface ShadowAnalysis {
  indicators: ShadowIndicator[];
  overallRiskLevel: RiskLevel | 'low';
  summary: string;
  disclaimer: string;
}

/**
 * Analyze shadow dynamics and risk factors in synastry
 */
export function analyzeShadowDynamics(chart1: NatalChart, chart2: NatalChart, chart1Name?: string, chart2Name?: string): ShadowAnalysis {
  const indicators: ShadowIndicator[] = [];
  const name1 = chart1Name || chart1.name || 'Person 1';
  const name2 = chart2Name || chart2.name || 'Person 2';

  // ============================================
  // POWER & CONTROL PATTERNS
  // ============================================

  // Pluto-Sun (Power over identity)
  const plutoSun1 = checkAspect(chart1, 'Pluto', chart2, 'Sun');
  const plutoSun2 = checkAspect(chart2, 'Pluto', chart1, 'Sun');
  const plutoSun = plutoSun1 || plutoSun2;
  const plutoSunOwnership = plutoSun1 
    ? { planet1: 'Pluto', planet1Owner: name1, planet2: 'Sun', planet2Owner: name2 }
    : { planet1: 'Pluto', planet1Owner: name2, planet2: 'Sun', planet2Owner: name1 };
    
  if (plutoSun && (plutoSun.type === 'square' || plutoSun.type === 'opposition' || plutoSun.type === 'conjunction')) {
    indicators.push({
      name: 'Pluto-Sun: Power Over Identity',
      category: 'power-control',
      riskLevel: plutoSun.type === 'square' ? 'significant' : 'caution',
      description: `${plutoSun.type} (${plutoSun.orb}° orb): ${plutoSunOwnership.planet1Owner}'s Pluto ♇ aspects ${plutoSunOwnership.planet2Owner}'s Sun ☉`,
      dynamicExplanation: `${plutoSunOwnership.planet1Owner} (Pluto) may unconsciously attempt to reshape, dominate, or "improve" ${plutoSunOwnership.planet2Owner}'s (Sun) sense of self. ${plutoSunOwnership.planet2Owner} may initially be fascinated by ${plutoSunOwnership.planet1Owner}'s intensity but over time feel their individuality is being erased.`,
      healthyExpression: `${plutoSunOwnership.planet1Owner} empowers ${plutoSunOwnership.planet2Owner} to embrace their shadow and become more authentic. ${plutoSunOwnership.planet2Owner} helps ${plutoSunOwnership.planet1Owner} soften their intensity. Both transform together rather than one dominating.`,
      warningBehaviors: [
        `${plutoSunOwnership.planet1Owner} criticizes ${plutoSunOwnership.planet2Owner}'s friends, interests, or self-expression`,
        `${plutoSunOwnership.planet2Owner} starts changing who they are to please ${plutoSunOwnership.planet1Owner}`,
        `${plutoSunOwnership.planet1Owner} uses emotional intensity to "win" arguments`,
        `${plutoSunOwnership.planet2Owner} feels smaller or less confident over time`
      ],
      healingPath: `${plutoSunOwnership.planet2Owner} must maintain strong boundaries around identity. ${plutoSunOwnership.planet1Owner} must examine their need for control through individual therapy.`,
      planets: ['Pluto', 'Sun'],
      aspect: plutoSun,
      planetOwnership: plutoSunOwnership
    });
  }

  // Pluto-Moon (Emotional control/manipulation)
  const plutoMoon1 = checkAspect(chart1, 'Pluto', chart2, 'Moon');
  const plutoMoon2 = checkAspect(chart2, 'Pluto', chart1, 'Moon');
  const plutoMoon = plutoMoon1 || plutoMoon2;
  const plutoMoonOwnership = plutoMoon1 
    ? { planet1: 'Pluto', planet1Owner: name1, planet2: 'Moon', planet2Owner: name2 }
    : { planet1: 'Pluto', planet1Owner: name2, planet2: 'Moon', planet2Owner: name1 };
    
  if (plutoMoon && (plutoMoon.type === 'square' || plutoMoon.type === 'opposition' || plutoMoon.type === 'conjunction')) {
    indicators.push({
      name: 'Pluto-Moon: Emotional Manipulation Risk',
      category: 'manipulation',
      riskLevel: plutoMoon.type === 'square' ? 'significant' : 'caution',
      description: `${plutoMoon.type} (${plutoMoon.orb}° orb): ${plutoMoonOwnership.planet1Owner}'s Pluto ♇ aspects ${plutoMoonOwnership.planet2Owner}'s Moon ☽`,
      dynamicExplanation: `${plutoMoonOwnership.planet1Owner} (Pluto) can easily access ${plutoMoonOwnership.planet2Owner}'s (Moon) deepest emotional vulnerabilities. This creates profound intimacy but also danger—${plutoMoonOwnership.planet1Owner} may use emotional knowledge to control or gaslight ${plutoMoonOwnership.planet2Owner}.`,
      healthyExpression: `Deep emotional transformation and healing. ${plutoMoonOwnership.planet1Owner} helps ${plutoMoonOwnership.planet2Owner} access buried feelings safely. ${plutoMoonOwnership.planet2Owner} teaches ${plutoMoonOwnership.planet1Owner} emotional vulnerability without loss of power.`,
      warningBehaviors: [
        `${plutoMoonOwnership.planet1Owner} uses "I know you better than you know yourself" to override ${plutoMoonOwnership.planet2Owner}'s feelings`,
        `${plutoMoonOwnership.planet2Owner} feels crazy, confused, or doubts their own emotional reality`,
        `${plutoMoonOwnership.planet1Owner} creates dramatic emotional scenes to regain control`,
        `${plutoMoonOwnership.planet2Owner} walks on eggshells to avoid ${plutoMoonOwnership.planet1Owner}'s reactions`
      ],
      healingPath: `Both can practice naming emotions clearly and checking in with outside perspectives. ${plutoMoonOwnership.planet2Owner} benefits from maintaining trusted friendships; ${plutoMoonOwnership.planet1Owner} benefits from self-reflection on emotional patterns.`,
      planets: ['Pluto', 'Moon'],
      aspect: plutoMoon,
      planetOwnership: plutoMoonOwnership
    });
  }

  // Mars-Pluto (Rage and violence potential)
  const marsPluto1 = checkAspect(chart1, 'Mars', chart2, 'Pluto');
  const marsPluto2 = checkAspect(chart2, 'Mars', chart1, 'Pluto');
  const marsPluto = marsPluto1 || marsPluto2;
  if (marsPluto && (marsPluto.type === 'square' || marsPluto.type === 'opposition' || marsPluto.type === 'conjunction')) {
    indicators.push({
      name: 'Mars-Pluto: Explosive Anger Dynamics',
      category: 'rage',
      riskLevel: marsPluto.type === 'square' ? 'significant' : 'caution',
      description: `${marsPluto.type} (${marsPluto.orb}° orb): Intense energy that can fuel passion or create power struggles.`,
      dynamicExplanation: `This combination creates intense chemistry but requires conscious handling of anger. Mars represents direct action; Pluto adds depth and intensity. When channeled constructively, this becomes transformative passion; when unconscious, it can lead to power struggles.`,
      healthyExpression: 'Channeled into passionate creative or physical projects together. Both committed to honest communication. Intensity expressed through shared adventures and mutual support.',
      warningBehaviors: [
        'Arguments escalate quickly without resolution',
        'Feeling like conflicts become competitions to "win"',
        'Difficulty letting go of old grievances',
        'The relationship feels exhausting rather than energizing'
      ],
      healingPath: 'Practice pausing before reacting. Channel the intense energy into shared physical activities or creative projects. Agree on communication ground rules.',
      planets: ['Mars', 'Pluto'],
      aspect: marsPluto
    });
  }

  // Neptune-Personal Planets (Gaslighting/Reality distortion)
  const neptuneSun1 = checkAspect(chart1, 'Neptune', chart2, 'Sun');
  const neptuneSun2 = checkAspect(chart2, 'Neptune', chart1, 'Sun');
  const neptuneSun = neptuneSun1 || neptuneSun2;
  if (neptuneSun && (neptuneSun.type === 'square' || neptuneSun.type === 'opposition')) {
    indicators.push({
      name: 'Neptune-Sun: Dreamy Connection',
      category: 'manipulation',
      riskLevel: 'caution',
      description: `${neptuneSun.type} (${neptuneSun.orb}° orb): Strong imagination and idealism in the connection.`,
      dynamicExplanation: `Neptune brings a dreamy, imaginative quality to how the Sun person is perceived. This can create beautiful romanticization but may also blur practical clarity. Both partners may see each other through rose-colored glasses initially.`,
      healthyExpression: 'Spiritual connection and creative inspiration. Neptune helps Sun access imagination and compassion. Sun helps Neptune ground their dreams in reality.',
      warningBehaviors: [
        'Expectations feel unclear or constantly shifting',
        'Difficulty having practical conversations about the future',
        'One person feels confused about where they stand',
        'Promises made are hard to pin down or follow through on'
      ],
      healingPath: 'Practice clear, direct communication about expectations. Check in regularly about practical matters. Balance dreaming together with grounded planning.',
      planets: ['Neptune', 'Sun'],
      aspect: neptuneSun
    });
  }

  // Neptune-Moon (Emotional confusion/victim-savior)
  const neptuneMoon1 = checkAspect(chart1, 'Neptune', chart2, 'Moon');
  const neptuneMoon2 = checkAspect(chart2, 'Neptune', chart1, 'Moon');
  const neptuneMoon = neptuneMoon1 || neptuneMoon2;
  if (neptuneMoon && (neptuneMoon.type === 'square' || neptuneMoon.type === 'opposition' || neptuneMoon.type === 'conjunction')) {
    indicators.push({
      name: 'Neptune-Moon: Deep Empathy',
      category: 'codependency',
      riskLevel: 'caution',
      description: `${neptuneMoon.type} (${neptuneMoon.orb}° orb): Profound emotional sensitivity between partners.`,
      dynamicExplanation: `This creates exceptional empathy and emotional attunement. Both partners feel each other's emotions deeply, sometimes blurring the lines between whose feelings are whose. This beautiful sensitivity requires healthy boundaries to remain balanced.`,
      healthyExpression: 'Profound spiritual-emotional connection. Both maintain separate identities while offering genuine compassion. Neither needs to be "fixed" by the other.',
      warningBehaviors: [
        'Difficulty distinguishing your emotions from your partner\'s',
        'One person consistently prioritizes the other\'s needs over their own',
        'Feeling responsible for your partner\'s emotional state',
        'Losing touch with your own wants and preferences'
      ],
      healingPath: 'Practice identifying and naming your own emotions separately. Maintain friendships and activities outside the relationship. Remember that supporting someone is different from fixing them.',
      planets: ['Neptune', 'Moon'],
      aspect: neptuneMoon
    });
  }

  // Saturn-Personal Planets (Control through criticism/limitation)
  const saturnSun1 = checkAspect(chart1, 'Saturn', chart2, 'Sun');
  const saturnSun2 = checkAspect(chart2, 'Saturn', chart1, 'Sun');
  const saturnSun = saturnSun1 || saturnSun2;
  if (saturnSun && (saturnSun.type === 'square' || saturnSun.type === 'opposition')) {
    indicators.push({
      name: 'Saturn-Sun: Structure & Growth',
      category: 'power-control',
      riskLevel: 'watch',
      description: `${saturnSun.type} (${saturnSun.orb}° orb): One partner brings structure and high standards to the relationship.`,
      dynamicExplanation: `Saturn naturally sees areas for improvement and may offer feedback that feels critical. When balanced, this helps Sun grow and mature. When unbalanced, Sun may feel they can never measure up to Saturn's expectations.`,
      healthyExpression: 'Saturn provides structure and wisdom that helps Sun mature. Sun brings warmth and joy that softens Saturn. Mutual respect despite different approaches.',
      warningBehaviors: [
        'Feedback feels more critical than supportive',
        'One partner feels they need approval before making decisions',
        'The relationship has an unequal teacher/student dynamic',
        'One person\'s standards overshadow the other\'s preferences'
      ],
      healingPath: 'Practice offering feedback as suggestions rather than corrections. Celebrate each other\'s successes regularly. Ensure both partners have equal voice in decisions.',
      planets: ['Saturn', 'Sun'],
      aspect: saturnSun
    });
  }

  // Saturn-Venus (Love through obligation/withholding)
  const saturnVenus1 = checkAspect(chart1, 'Saturn', chart2, 'Venus');
  const saturnVenus2 = checkAspect(chart2, 'Saturn', chart1, 'Venus');
  const saturnVenus = saturnVenus1 || saturnVenus2;
  if (saturnVenus && (saturnVenus.type === 'square' || saturnVenus.type === 'opposition')) {
    indicators.push({
      name: 'Saturn-Venus: Committed Love',
      category: 'boundary',
      riskLevel: 'watch',
      description: `${saturnVenus.type} (${saturnVenus.orb}° orb): Love expressed through dedication and loyalty.`,
      dynamicExplanation: `Saturn brings seriousness and commitment to Venus's desire for love. This can create enduring, stable partnerships where love is demonstrated through actions and reliability. The challenge is ensuring affection flows freely rather than feeling earned.`,
      healthyExpression: 'Committed, stable love that stands the test of time. Saturn shows love through loyalty and dedication. Venus helps Saturn express affection more freely.',
      warningBehaviors: [
        'Affection feels conditional on performance or behavior',
        'One partner feels they must prove their worthiness for love',
        'Romance and playfulness get lost in practicality',
        'Love feels more like duty than joy'
      ],
      healingPath: 'Schedule regular quality time for fun and romance. Express appreciation verbally and often. Remember that love given freely strengthens the bond more than love that must be earned.',
      planets: ['Saturn', 'Venus'],
      aspect: saturnVenus
    });
  }

  // Lilith aspects (Shadow sexuality, power through seduction)
  const lilithMars1 = checkAspect(chart1, 'Lilith', chart2, 'Mars');
  const lilithMars2 = checkAspect(chart2, 'Lilith', chart1, 'Mars');
  const lilithMars = lilithMars1 || lilithMars2;
  if (lilithMars && (lilithMars.type === 'conjunction' || lilithMars.type === 'square' || lilithMars.type === 'opposition')) {
    indicators.push({
      name: 'Lilith-Mars: Magnetic Attraction',
      category: 'boundary',
      riskLevel: 'watch',
      description: `${lilithMars.type} (${lilithMars.orb}° orb): Strong primal attraction and chemistry.`,
      dynamicExplanation: `This creates powerful, magnetic attraction with a raw, authentic quality. Both partners may discover new aspects of their desires through this connection. This intensity is a gift when channeled consciously.`,
      healthyExpression: 'Liberating exploration of authentic connection. Both feel empowered and accepted. Desires expressed openly with mutual respect.',
      warningBehaviors: [
        'Attraction feels overwhelming or all-consuming',
        'Difficulty maintaining other priorities when together',
        'Jealousy or possessiveness emerging',
        'Feeling like the connection is more physical than emotional'
      ],
      healingPath: 'Build emotional intimacy alongside physical connection. Communicate openly about desires and boundaries. Maintain individual identities and friendships outside the relationship.',
      planets: ['Lilith', 'Mars'],
      aspect: lilithMars
    });
  }

  // Mars-Saturn (Blocked action, frustration leading to explosion)
  const marsSaturn1 = checkAspect(chart1, 'Mars', chart2, 'Saturn');
  const marsSaturn2 = checkAspect(chart2, 'Mars', chart1, 'Saturn');
  const marsSaturn = marsSaturn1 || marsSaturn2;
  if (marsSaturn && (marsSaturn.type === 'square' || marsSaturn.type === 'opposition' || marsSaturn.type === 'conjunction')) {
    indicators.push({
      name: 'Mars-Saturn: Disciplined Action',
      category: 'rage',
      riskLevel: marsSaturn.type === 'square' ? 'caution' : 'watch',
      description: `${marsSaturn.type} (${marsSaturn.orb}° orb): One partner brings drive, the other brings caution.`,
      dynamicExplanation: `Mars provides energy and initiative; Saturn provides caution and structure. This can be a productive combination when balanced—enthusiasm meets practicality. The challenge is ensuring both approaches are valued equally.`,
      healthyExpression: 'Mars gains discipline and focus from Saturn. Saturn becomes more assertive through Mars. Frustration channeled into productive achievement.',
      warningBehaviors: [
        'One partner feels constantly slowed down or blocked',
        'Small frustrations build up without being addressed',
        'Difficulty finding a pace that works for both',
        'One person\'s caution feels like criticism of the other\'s enthusiasm'
      ],
      healingPath: 'Appreciate the value of both approaches—drive AND caution. Create outlets for energy (exercise, hobbies). Address frustrations early before they compound.',
      planets: ['Mars', 'Saturn'],
      aspect: marsSaturn
    });
  }

  // Moon-Pluto combined with Neptune (Deep emotional intensity)
  if (plutoMoon && neptuneMoon) {
    indicators.push({
      name: 'Pluto + Neptune on Moon: Profound Emotional Depth',
      category: 'manipulation',
      riskLevel: 'caution',
      description: 'Combined Pluto and Neptune aspects to the Moon create exceptional emotional intensity.',
      dynamicExplanation: 'This combination indicates profound emotional and psychic sensitivity in the relationship. The depth of feeling is extraordinary, which can create both beautiful intimacy and the need for strong personal boundaries.',
      healthyExpression: 'With awareness, this creates profound spiritual and emotional connection. The relationship feels deeply meaningful and transformative for both partners.',
      warningBehaviors: [
        'Emotions feel overwhelming at times',
        'Difficulty maintaining perspective during intense moments',
        'Other relationships may feel shallow by comparison',
        'Strong pull to merge identities'
      ],
      healingPath: 'Maintain friendships and activities outside the relationship. Practice grounding techniques during intense emotional periods. Celebrate the depth while honoring individual needs.',
      planets: ['Pluto', 'Neptune', 'Moon']
    });
  }

  // Neptune with addiction-prone signs/placements
  const neptuneMars1 = checkAspect(chart1, 'Neptune', chart2, 'Mars');
  const neptuneMars2 = checkAspect(chart2, 'Neptune', chart1, 'Mars');
  const neptuneMars = neptuneMars1 || neptuneMars2;
  if (neptuneMars && (neptuneMars.type === 'square' || neptuneMars.type === 'opposition' || neptuneMars.type === 'conjunction')) {
    indicators.push({
      name: 'Neptune-Mars: Inspired Action',
      category: 'addiction',
      riskLevel: 'watch',
      description: `${neptuneMars.type} (${neptuneMars.orb}° orb): Creative energy that benefits from grounding.`,
      dynamicExplanation: `Neptune adds imagination and vision to Mars's drive and action. This can fuel beautiful creative or spiritual endeavors together. The key is ensuring that inspiration translates into concrete action rather than remaining purely in the realm of dreams.`,
      healthyExpression: 'Creative and spiritual action. Mars pursues inspired goals. Neptune provides vision and meaning. Shared artistic or healing work.',
      warningBehaviors: [
        'Plans remain dreams without concrete steps',
        'Escapism feels more appealing than tackling challenges',
        'Difficulty staying motivated for practical tasks',
        'Using fantasy or entertainment to avoid problems'
      ],
      healingPath: 'Balance dreaming with doing—set small, achievable goals. Support each other\'s practical pursuits. Address challenges directly rather than escaping into activities.',
      planets: ['Neptune', 'Mars'],
      aspect: neptuneMars
    });
  }

  // Determine overall risk level
  let overallRiskLevel: RiskLevel | 'low' = 'low';
  const significantCount = indicators.filter(i => i.riskLevel === 'significant').length;
  const cautionCount = indicators.filter(i => i.riskLevel === 'caution').length;
  
  if (significantCount >= 2 || (significantCount >= 1 && cautionCount >= 2)) {
    overallRiskLevel = 'significant';
  } else if (significantCount >= 1 || cautionCount >= 2) {
    overallRiskLevel = 'caution';
  } else if (cautionCount >= 1 || indicators.length >= 2) {
    overallRiskLevel = 'watch';
  }

  // Generate summary
  let summary: string;
  if (overallRiskLevel === 'significant') {
    summary = `This synastry shows ${indicators.length} shadow indicators including ${significantCount} significant pattern(s). These are energetic tendencies—not predictions—that benefit from self-awareness and individual support. If any patterns feel concerning, prioritize your safety and well-being above all else.`;
  } else if (overallRiskLevel === 'caution') {
    summary = `This synastry shows ${indicators.length} shadow pattern(s) that warrant awareness. With consciousness and communication, these can be navigated successfully. Pay attention to the warning behaviors listed and address patterns early.`;
  } else if (overallRiskLevel === 'watch') {
    summary = `Minor shadow patterns present. All relationships have growth edges—these are yours. Awareness is the first step toward healthy expression.`;
  } else {
    summary = `No significant shadow patterns detected in the primary aspects analyzed. This doesn't mean the relationship is without challenges, but the classic high-risk dynamics are not prominently featured.`;
  }

  return {
    indicators,
    overallRiskLevel,
    summary,
    disclaimer: `IMPORTANT: Astrological patterns indicate energetic tendencies, not guaranteed outcomes. These indicators promote awareness, not labels. If you are experiencing abuse or feel unsafe, couples therapy is NOT recommended—please prioritize your safety and contact the National Domestic Violence Hotline (1-800-799-7233) or seek individual professional support.`
  };
}