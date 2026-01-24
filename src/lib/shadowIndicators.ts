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
export function analyzeShadowDynamics(chart1: NatalChart, chart2: NatalChart): ShadowAnalysis {
  const indicators: ShadowIndicator[] = [];

  // ============================================
  // POWER & CONTROL PATTERNS
  // ============================================

  // Pluto-Sun (Power over identity)
  const plutoSun1 = checkAspect(chart1, 'Pluto', chart2, 'Sun');
  const plutoSun2 = checkAspect(chart2, 'Pluto', chart1, 'Sun');
  const plutoSun = plutoSun1 || plutoSun2;
  if (plutoSun && (plutoSun.type === 'square' || plutoSun.type === 'opposition' || plutoSun.type === 'conjunction')) {
    indicators.push({
      name: 'Pluto-Sun: Power Over Identity',
      category: 'power-control',
      riskLevel: plutoSun.type === 'square' ? 'significant' : 'caution',
      description: `${plutoSun.type} (${plutoSun.orb}° orb): Pluto seeks to transform or control Sun's core identity.`,
      dynamicExplanation: `The Pluto person may unconsciously attempt to reshape, dominate, or "improve" the Sun person's sense of self. The Sun person may initially be fascinated by Pluto's intensity but over time feel their individuality is being erased. Pluto can use psychological insight as a weapon. The Sun person may feel they can never fully be themselves.`,
      healthyExpression: 'Pluto empowers Sun to embrace their shadow and become more authentic. Sun helps Pluto soften their intensity. Both transform together rather than one dominating.',
      warningBehaviors: [
        'Pluto criticizes Sun\'s friends, interests, or self-expression',
        'Sun starts changing who they are to please Pluto',
        'Pluto uses emotional intensity to "win" arguments',
        'Sun feels smaller or less confident over time',
        'Pluto monitors or controls Sun\'s activities'
      ],
      healingPath: 'Sun must maintain strong boundaries around identity. Pluto must examine their need for control through individual therapy. If feeling unsafe, prioritize your own well-being and seek support independently.',
      planets: ['Pluto', 'Sun'],
      aspect: plutoSun
    });
  }

  // Pluto-Moon (Emotional control/manipulation)
  const plutoMoon1 = checkAspect(chart1, 'Pluto', chart2, 'Moon');
  const plutoMoon2 = checkAspect(chart2, 'Pluto', chart1, 'Moon');
  const plutoMoon = plutoMoon1 || plutoMoon2;
  if (plutoMoon && (plutoMoon.type === 'square' || plutoMoon.type === 'opposition' || plutoMoon.type === 'conjunction')) {
    indicators.push({
      name: 'Pluto-Moon: Emotional Manipulation Risk',
      category: 'manipulation',
      riskLevel: plutoMoon.type === 'square' ? 'significant' : 'caution',
      description: `${plutoMoon.type} (${plutoMoon.orb}° orb): Intense emotional dynamics with potential for psychological manipulation.`,
      dynamicExplanation: `The Pluto person can easily access the Moon person's deepest emotional vulnerabilities. This creates profound intimacy but also danger—Pluto may use emotional knowledge to control, manipulate, or gaslight the Moon person. The Moon person becomes emotionally dependent and may lose touch with their own feelings. Jealousy, possessiveness, and emotional blackmail can emerge.`,
      healthyExpression: 'Deep emotional transformation and healing. Pluto helps Moon access buried feelings safely. Moon teaches Pluto emotional vulnerability without loss of power.',
      warningBehaviors: [
        'Pluto uses "I know you better than you know yourself" to override Moon\'s feelings',
        'Moon feels crazy, confused, or doubts their own emotional reality',
        'Pluto creates dramatic emotional scenes to regain control',
        'Moon walks on eggshells to avoid Pluto\'s reactions',
        'Pluto isolates Moon from other emotional support'
      ],
      healingPath: 'Moon must maintain external support systems and trust their own feelings. Pluto must commit to therapy addressing control patterns. This aspect requires conscious work to remain healthy.',
      planets: ['Pluto', 'Moon'],
      aspect: plutoMoon
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
      description: `${marsPluto.type} (${marsPluto.orb}° orb): Intense power struggles with potential for explosive confrontations.`,
      dynamicExplanation: `This combination creates intense sexual chemistry but also volatile anger. Mars wants direct action; Pluto wants total control. Power struggles can escalate into physical or emotional violence. Both may "push each other's buttons" deliberately. Rage can feel intoxicating. Making up after fights can create an addictive cycle.`,
      healthyExpression: 'Channeled into passionate creative or physical projects together. Both committed to non-violent communication. Intensity expressed sexually with full consent.',
      warningBehaviors: [
        'Arguments escalate quickly to yelling or physical intimidation',
        'Either person has broken objects during fights',
        'Make-up sex replaces actual resolution of conflicts',
        'Feeling like you "can\'t control" your anger around this person',
        'Physical grabbing, pushing, or blocking exits during arguments'
      ],
      healingPath: 'Both parties need individual anger management. Establish clear "time-out" protocols. Consider if this relationship is physically safe. Zero tolerance for physical escalation.',
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
      name: 'Neptune-Sun: Reality Confusion',
      category: 'manipulation',
      riskLevel: 'caution',
      description: `${neptuneSun.type} (${neptuneSun.orb}° orb): Potential for idealization, deception, or reality distortion.`,
      dynamicExplanation: `Neptune casts a fog over Sun's clarity. The Sun person may not see the Neptune person clearly—either idealizing them or being deceived by them. Neptune may lie (to themselves or Sun) without malicious intent, but the effect is the same: Sun loses touch with reality in this relationship. The Sun person may question their own perceptions.`,
      healthyExpression: 'Spiritual connection and creative inspiration. Neptune helps Sun access imagination and compassion. Sun helps Neptune ground their dreams in reality.',
      warningBehaviors: [
        'Sun discovers Neptune has been dishonest about important matters',
        'Sun feels confused about what is real in the relationship',
        'Neptune makes promises they don\'t keep',
        'Sun\'s friends express concern about the relationship',
        'Sun ignores red flags because "love is blind"'
      ],
      healingPath: 'Sun must maintain reality checks with trusted outside sources. Neptune must commit to radical honesty. Document important conversations if gaslighting is suspected.',
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
      name: 'Neptune-Moon: Victim-Savior Dynamic',
      category: 'codependency',
      riskLevel: 'caution',
      description: `${neptuneMoon.type} (${neptuneMoon.orb}° orb): Risk of codependent "rescuer" dynamics and emotional boundary confusion.`,
      dynamicExplanation: `This creates deep compassion but also confusion about where one person ends and the other begins. One person may take the "savior" role while the other plays "victim." The Moon person may absorb Neptune's pain as their own. Neptune may drain Moon's emotional resources. Both may enable unhealthy behaviors in the name of "unconditional love."`,
      healthyExpression: 'Profound spiritual-emotional connection. Both maintain separate identities while offering genuine compassion. Neither needs to be "fixed" by the other.',
      warningBehaviors: [
        'One person constantly "rescues" the other from problems they create',
        'Moon feels responsible for Neptune\'s happiness/sobriety/success',
        'Neptune\'s crises always take priority over Moon\'s needs',
        'Moon can\'t tell the difference between their feelings and Neptune\'s',
        'Either person uses illness or crisis to avoid responsibility'
      ],
      healingPath: 'Establish individual therapy for both parties. Practice healthy detachment with love. Moon must learn that enabling is not helping.',
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
      name: 'Saturn-Sun: Critical Suppression',
      category: 'power-control',
      riskLevel: 'watch',
      description: `${saturnSun.type} (${saturnSun.orb}° orb): Saturn's criticism may diminish Sun's confidence and self-expression.`,
      dynamicExplanation: `Saturn sees Sun's flaws clearly and may constantly point them out "for their own good." Over time, the Sun person may feel they can never meet Saturn's standards. Saturn may restrict Sun's freedom, ambitions, or self-expression through disapproval. Sun may feel like a child being judged by a parent.`,
      healthyExpression: 'Saturn provides structure and wisdom that helps Sun mature. Sun brings warmth and joy that softens Saturn. Mutual respect despite different approaches.',
      warningBehaviors: [
        'Saturn frequently criticizes Sun\'s choices, appearance, or abilities',
        'Sun feels less confident than before the relationship',
        'Saturn controls finances or "practical" decisions unilaterally',
        'Sun feels they need permission to pursue their goals',
        'Saturn withholds approval as a form of control'
      ],
      healingPath: 'Saturn must examine if criticism stems from genuine care or need for control. Sun must maintain sources of external validation and not depend solely on Saturn\'s approval.',
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
      name: 'Saturn-Venus: Love as Obligation',
      category: 'boundary',
      riskLevel: 'watch',
      description: `${saturnVenus.type} (${saturnVenus.orb}° orb): Affection may be conditional or withheld as punishment.`,
      dynamicExplanation: `Venus seeks love and appreciation; Saturn may withhold it until "earned." Love becomes transactional—Saturn gives affection as reward for good behavior. Venus may feel they can never be lovable enough. Saturn may view Venus's needs as frivolous or weak.`,
      healthyExpression: 'Committed, stable love that stands the test of time. Saturn shows love through loyalty and dedication. Venus helps Saturn express affection more freely.',
      warningBehaviors: [
        'Saturn withdraws affection as punishment',
        'Venus feels they must "earn" love through sacrifice',
        'Saturn dismisses Venus\'s emotional or romantic needs',
        'Love feels like a duty rather than a joy',
        'Venus stays out of obligation rather than genuine desire'
      ],
      healingPath: 'Saturn must learn that love is not a reward for good behavior. Venus must voice needs directly and not accept crumbs. Both examine family patterns around conditional love.',
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
      name: 'Lilith-Mars: Shadow Sexuality',
      category: 'boundary',
      riskLevel: 'watch',
      description: `${lilithMars.type} (${lilithMars.orb}° orb): Intense sexual energy with potential boundary issues.`,
      dynamicExplanation: `This creates magnetic, primal sexual attraction but also brings out the shadow side of desire. Power games, jealousy, and sexual manipulation can emerge. One person may use sex as a weapon or withhold it for control. Taboo desires may surface that challenge both people's comfort zones.`,
      healthyExpression: 'Liberating exploration of sexuality within clear consent. Both feel empowered rather than exploited. Dark desires expressed safely without harm.',
      warningBehaviors: [
        'Sex is used as a bargaining chip or punishment',
        'One person pushes sexual boundaries without consent',
        'Jealousy leads to possessive or stalking behavior',
        'Sexual encounters leave one person feeling used or degraded',
        'Affairs or sexual deception patterns'
      ],
      healingPath: 'Explicit consent conversations before exploring edges. Both examine personal sexual wounds in therapy. Clear agreements about exclusivity or non-exclusivity.',
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
      name: 'Mars-Saturn: Frustrated Aggression',
      category: 'rage',
      riskLevel: marsSaturn.type === 'square' ? 'caution' : 'watch',
      description: `${marsSaturn.type} (${marsSaturn.orb}° orb): Mars feels blocked by Saturn, building resentment that can explode.`,
      dynamicExplanation: `Saturn's constant "no" meets Mars's desire for action. Mars feels controlled, restricted, and increasingly resentful. The frustration builds over time until Mars explodes—often disproportionately to the triggering event. Saturn then feels justified in their caution ("See? You can't control yourself.") This creates a toxic cycle.`,
      healthyExpression: 'Mars gains discipline and focus from Saturn. Saturn becomes more assertive through Mars. Frustration channeled into productive achievement.',
      warningBehaviors: [
        'Mars feels constant low-grade anger in the relationship',
        'Small disagreements trigger disproportionate rage',
        'Saturn uses "you\'re too aggressive" to shut down legitimate concerns',
        'Mars gives up on goals or desires to avoid Saturn\'s disapproval',
        'Cold war silences punctuated by explosive fights'
      ],
      healingPath: 'Both need outlets for frustration outside the relationship (exercise, individual hobbies). Clear communication about needs and limitations. Mars must speak up before resentment builds.',
      planets: ['Mars', 'Saturn'],
      aspect: marsSaturn
    });
  }

  // Moon-Pluto combined with Neptune (Ultimate manipulation cocktail)
  if (plutoMoon && neptuneMoon) {
    indicators.push({
      name: 'Pluto + Neptune on Moon: Psychological Vulnerability',
      category: 'manipulation',
      riskLevel: 'significant',
      description: 'Combined Pluto and Neptune aspects to the Moon create extreme emotional vulnerability.',
      dynamicExplanation: 'This rare combination indicates the Moon person may be particularly susceptible to psychological manipulation, gaslighting, and reality distortion. They may lose touch with their own emotional truth entirely. This requires extra vigilance and strong external support systems.',
      healthyExpression: 'With consciousness, this can create profound psychic/spiritual connection. Requires exceptional emotional health from all parties.',
      warningBehaviors: [
        'All warnings from both Pluto-Moon and Neptune-Moon apply',
        'Moon person shows signs of losing grip on reality',
        'Moon person isolated from friends and family',
        'Moon person\'s personality has significantly changed'
      ],
      healingPath: 'Individual therapy for Moon person is essential. Consider relationship therapy with a trauma-informed specialist. External reality checks are critical.',
      planets: ['Pluto', 'Neptune', 'Moon']
    });
  }

  // Neptune with addiction-prone signs/placements
  const neptuneMars1 = checkAspect(chart1, 'Neptune', chart2, 'Mars');
  const neptuneMars2 = checkAspect(chart2, 'Neptune', chart1, 'Mars');
  const neptuneMars = neptuneMars1 || neptuneMars2;
  if (neptuneMars && (neptuneMars.type === 'square' || neptuneMars.type === 'opposition' || neptuneMars.type === 'conjunction')) {
    indicators.push({
      name: 'Neptune-Mars: Addiction Enabling',
      category: 'addiction',
      riskLevel: 'caution',
      description: `${neptuneMars.type} (${neptuneMars.orb}° orb): Potential for enabling addictive behaviors or escapism.`,
      dynamicExplanation: `Mars's drive becomes diffused by Neptune's desire to escape. One or both partners may enable substance use, workaholism, or other addictive patterns. "Checking out" through alcohol, drugs, fantasy, or other escapes becomes normalized. Reality is avoided rather than faced together.`,
      healthyExpression: 'Creative and spiritual action. Mars pursues inspired goals. Neptune provides vision without escapism. Shared artistic or healing work.',
      warningBehaviors: [
        'Substance use increases during the relationship',
        'Partners "party" together to avoid dealing with problems',
        'Excuses are made for concerning behavior',
        'One partner covers for the other\'s irresponsibility',
        'Fantasy/gaming/porn used excessively to escape reality'
      ],
      healingPath: 'Honest assessment of addictive patterns. Clear boundaries around substance use. Support groups if needed. Examine what reality is being escaped.',
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