// Chart Decoder Logic - Computes dignity, dispositor chains, aspects, and interpretations

import { PLANET_DIGNITIES, SIGN_PROPERTIES, getDignityStatus } from './planetDignities';

// ============================================================================
// TYPES
// ============================================================================

export interface ChartPlanet {
  name: string;
  sign: string;
  degree: number;
  retrograde: boolean;
  house: number | null;
}

export interface ChartAspect {
  planet1: string;
  planet2: string;
  aspectType: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx';
  orb: number;
  applying: boolean;
}

export interface ChartData {
  planets: ChartPlanet[];
  aspects: ChartAspect[];
  houseSystem?: 'placidus' | 'whole_sign' | 'auto_from_chart';
}

export interface AspectOrbs {
  conjunction: number;
  opposition: number;
  trine: number;
  square: number;
  sextile: number;
  quincunx: number;
}

export type DignityType = 'rulership' | 'exaltation' | 'detriment' | 'fall' | 'peregrine';

export interface DispositorChainResult {
  chain: string[];
  finalDispositor: string;
  loopType: 'mutual_reception' | 'single_ruler' | 'chain' | null;
  notes: string[];
}

// ============================================================================
// ASTRO REFERENCE DATA
// ============================================================================

export const TRADITIONAL_RULERS: Record<string, string> = {
  Aries: 'Mars',
  Taurus: 'Venus',
  Gemini: 'Mercury',
  Cancer: 'Moon',
  Leo: 'Sun',
  Virgo: 'Mercury',
  Libra: 'Venus',
  Scorpio: 'Mars',
  Sagittarius: 'Jupiter',
  Capricorn: 'Saturn',
  Aquarius: 'Saturn',
  Pisces: 'Jupiter'
};

export const MODERN_RULERS: Record<string, string> = {
  Scorpio: 'Pluto',
  Aquarius: 'Uranus',
  Pisces: 'Neptune'
};

export const EXALTATIONS: Record<string, string> = {
  Sun: 'Aries',
  Moon: 'Taurus',
  Mercury: 'Virgo',
  Venus: 'Pisces',
  Mars: 'Capricorn',
  Jupiter: 'Cancer',
  Saturn: 'Libra'
};

export const DETRIMENTS: Record<string, string[]> = {
  Sun: ['Aquarius'],
  Moon: ['Capricorn'],
  Mercury: ['Sagittarius', 'Pisces'],
  Venus: ['Aries', 'Scorpio'],
  Mars: ['Taurus', 'Libra'],
  Jupiter: ['Gemini', 'Virgo'],
  Saturn: ['Cancer', 'Leo']
};

export const FALLS: Record<string, string> = {
  Sun: 'Libra',
  Moon: 'Scorpio',
  Mercury: 'Pisces',
  Venus: 'Virgo',
  Mars: 'Cancer',
  Jupiter: 'Capricorn',
  Saturn: 'Aries'
};

export const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  quincunx: 150,
  opposition: 180
};

export const DEFAULT_ORBS: AspectOrbs = {
  conjunction: 8,
  opposition: 8,
  trine: 7,
  square: 7,
  sextile: 5,
  quincunx: 3
};

// ============================================================================
// PLANET MEANINGS
// ============================================================================

export const PLANET_MEANINGS: Record<string, string> = {
  Sun: 'Identity, vitality, confidence, purpose, and how you lead with your will.',
  Moon: 'Emotions, needs, nervous system comfort, attachment patterns, and what refuels you.',
  Mercury: 'Thinking, learning style, communication, decision-making.',
  Venus: "Love style, values, aesthetics, money patterns, what you're drawn to.",
  Mars: 'Drive, boundaries, anger, courage, how you initiate.',
  Jupiter: 'Growth, faith, opportunity, meaning, mentors, expansion.',
  Saturn: 'Discipline, fear, mastery, responsibility, long-term building.',
  Uranus: 'Freedom, breakthroughs, shocks, individuality.',
  Neptune: 'Intuition, ideals, imagination, spirituality, fog/escapism patterns.',
  Pluto: 'Power, transformation, intensity, psychological depth.',
  Chiron: 'Core wound and healing gift — where pain becomes wisdom.',
  NorthNode: 'Soul direction, growth edge, what feels unfamiliar but calling.',
  Ascendant: 'How you appear to others, first impressions, physical presence.',
  Midheaven: 'Public role, career direction, reputation, legacy.'
};

// ============================================================================
// DIGNITY EXPLAINERS
// ============================================================================

export const DIGNITY_EXPLAINERS: Record<DignityType, string> = {
  rulership: 'This planet is in its home sign. It tends to express cleanly and consistently.',
  exaltation: 'This planet is in a sign that uplifts it. It can feel amplified, idealized, or easier to access at a high level.',
  detriment: 'This planet is in the sign opposite its home sign. It can still be strong, but it usually needs more conscious effort and strategy.',
  fall: 'This planet is in the sign opposite its exaltation. It can feel touchier, less supported, or like you must earn confidence through practice.',
  peregrine: 'This planet has no essential dignity in this sign — neutral territory. It operates based on aspects and house placement.'
};

// ============================================================================
// COMPUTED FUNCTIONS
// ============================================================================

/**
 * Compute the dignity status of a planet in a sign
 */
export function computeDignity(planetName: string, sign: string): DignityType {
  const dignities = PLANET_DIGNITIES[planetName];
  if (!dignities) return 'peregrine';

  // Check rulership
  const rulership = dignities.rulership;
  if (Array.isArray(rulership)) {
    if (rulership.includes(sign)) return 'rulership';
  } else {
    if (rulership === sign) return 'rulership';
  }

  // Check exaltation (strip degree info)
  const exaltSign = dignities.exaltation.split(' ')[0];
  if (exaltSign === sign) return 'exaltation';

  // Check detriment
  const detriment = dignities.detriment;
  if (Array.isArray(detriment)) {
    if (detriment.includes(sign)) return 'detriment';
  } else {
    if (detriment === sign) return 'detriment';
  }

  // Check fall (strip degree info)
  const fallSign = dignities.fall.split(' ')[0];
  if (fallSign === sign) return 'fall';

  return 'peregrine';
}

/**
 * Get the ruler of a sign (traditional or modern based on setting)
 */
export function getSignRuler(sign: string, useTraditional: boolean = true): string {
  if (!useTraditional && MODERN_RULERS[sign]) {
    return MODERN_RULERS[sign];
  }
  return TRADITIONAL_RULERS[sign] || 'Unknown';
}

/**
 * Compute dispositor chain for a planet
 */
export function computeDispositorChain(
  planet: ChartPlanet,
  allPlanets: ChartPlanet[],
  useTraditional: boolean = true,
  maxDepth: number = 10
): DispositorChainResult {
  const chain: string[] = [];
  const notes: string[] = [];
  let current = planet;
  const visited = new Set<string>();

  chain.push(`${current.name} (${current.sign})`);
  visited.add(current.name);

  for (let i = 0; i < maxDepth; i++) {
    const ruler = getSignRuler(current.sign, useTraditional);
    
    // Check if the planet rules its own sign (final dispositor)
    if (ruler === current.name) {
      return {
        chain,
        finalDispositor: current.name,
        loopType: 'single_ruler',
        notes: [`${current.name} is in its own sign — it's the final dispositor.`]
      };
    }

    // Find the ruling planet in the chart
    const rulerPlanet = allPlanets.find(p => p.name === ruler);
    if (!rulerPlanet) {
      chain.push(`→ ${ruler} (not in chart)`);
      return {
        chain,
        finalDispositor: ruler,
        loopType: 'chain',
        notes: [`Dispositor chain ends at ${ruler} (planet not in main chart).`]
      };
    }

    // Check for mutual reception
    if (visited.has(ruler)) {
      const loopStart = chain.findIndex(c => c.startsWith(ruler));
      if (loopStart !== -1) {
        // Determine if it's mutual reception (two planets trading signs)
        const firstInLoop = ruler;
        const prevPlanet = current.name;
        
        if (getSignRuler(rulerPlanet.sign, useTraditional) === prevPlanet) {
          notes.push(`Mutual reception: ${prevPlanet} ↔ ${firstInLoop} — they swap keys and help each other.`);
          return {
            chain,
            finalDispositor: `Loop: ${prevPlanet} ↔ ${firstInLoop}`,
            loopType: 'mutual_reception',
            notes
          };
        }
      }
      
      chain.push(`→ ${ruler} (loop)`);
      notes.push(`Dispositor chain loops back to ${ruler}.`);
      return {
        chain,
        finalDispositor: `Loop at ${ruler}`,
        loopType: 'chain',
        notes
      };
    }

    chain.push(`→ ${ruler} (${rulerPlanet.sign})`);
    visited.add(ruler);
    current = rulerPlanet;
  }

  notes.push('Chain exceeded maximum depth.');
  return {
    chain,
    finalDispositor: 'Unknown',
    loopType: null,
    notes
  };
}

/**
 * Convert sign + degree to absolute zodiac degree (0-359.999)
 */
export function toAbsoluteDegree(sign: string, degree: number): number {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  const signIndex = signs.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree;
}

/**
 * Compute all aspects between planets
 */

// Luminaries and angles get wider orbs (10° for major aspects)
const LUMINARY_PLANETS = ['Sun', 'Moon', 'Ascendant'];

/**
 * Get the appropriate orb based on which planets are involved
 * Sun, Moon, and Ascendant get 10° orbs for conjunctions/oppositions
 */
export function getOrb(
  planet1: string,
  planet2: string,
  aspectType: keyof AspectOrbs,
  baseOrbs: AspectOrbs = DEFAULT_ORBS
): number {
  const isLuminaryAspect = 
    LUMINARY_PLANETS.includes(planet1) || 
    LUMINARY_PLANETS.includes(planet2);
  
  const baseOrb = baseOrbs[aspectType];
  
  if (isLuminaryAspect) {
    // Sun, Moon, Ascendant get 10° for conjunction/opposition
    if (aspectType === 'conjunction' || aspectType === 'opposition') {
      return 10;
    }
    // Proportionally wider for other aspects (add 2°, max 8°)
    return Math.min(baseOrb + 2, 8);
  }
  
  return baseOrb;
}

export function computeAspects(
  planets: ChartPlanet[],
  orbs: AspectOrbs = DEFAULT_ORBS
): ChartAspect[] {
  const aspects: ChartAspect[] = [];
  const aspectTypes = Object.keys(ASPECT_ANGLES) as Array<keyof typeof ASPECT_ANGLES>;

  // Include Ascendant for aspects (it's one of the "big three"), exclude only Midheaven
  const aspectingPlanets = planets.filter(p => p.name !== 'Midheaven');

  for (let i = 0; i < aspectingPlanets.length; i++) {
    for (let j = i + 1; j < aspectingPlanets.length; j++) {
      const p1 = aspectingPlanets[i];
      const p2 = aspectingPlanets[j];
      
      const deg1 = toAbsoluteDegree(p1.sign, p1.degree);
      const deg2 = toAbsoluteDegree(p2.sign, p2.degree);
      
      let delta = Math.abs(deg1 - deg2);
      if (delta > 180) delta = 360 - delta;

      for (const aspectType of aspectTypes) {
        const exactAngle = ASPECT_ANGLES[aspectType];
        // Use tiered orbs based on planets involved
        const allowedOrb = getOrb(p1.name, p2.name, aspectType as keyof AspectOrbs, orbs);
        const actualOrb = Math.abs(delta - exactAngle);
        
        if (actualOrb <= allowedOrb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            aspectType: aspectType as ChartAspect['aspectType'],
            orb: Math.round(actualOrb * 100) / 100,
            applying: deg1 < deg2 // simplified
          });
          break; // Only one aspect type per planet pair
        }
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
}

/**
 * Get aspects for a specific planet
 */
export function getAspectsForPlanet(planetName: string, aspects: ChartAspect[]): ChartAspect[] {
  return aspects.filter(a => a.planet1 === planetName || a.planet2 === planetName);
}

/**
 * Get aspect symbol
 */
export function getAspectSymbol(aspectType: string): string {
  const symbols: Record<string, string> = {
    conjunction: '☌',
    opposition: '☍',
    trine: '△',
    square: '□',
    sextile: '✱',
    quincunx: '⚻'
  };
  return symbols[aspectType] || aspectType;
}

/**
 * Get aspect nature (flowing/challenging)
 */
export function getAspectNature(aspectType: string): 'flowing' | 'challenging' | 'neutral' {
  if (['trine', 'sextile'].includes(aspectType)) return 'flowing';
  if (['square', 'opposition', 'quincunx'].includes(aspectType)) return 'challenging';
  return 'neutral'; // conjunction
}

/**
 * Get brief aspect meaning for planet combinations
 */
export function getAspectMeaning(planet1: string, planet2: string, aspectType: string): string {
  // Normalize order alphabetically for consistent lookup
  const [p1, p2] = [planet1, planet2].sort();
  
  const conjunctionMeanings: Record<string, string> = {
    'Mars-Sun': 'Identity fused with drive — you lead with action and courage. Can be bold or combative.',
    'Sun-Uranus': 'Identity electrified by rebellion — you need freedom and originality to feel like yourself.',
    'Mars-Uranus': 'Sudden, explosive action — innovative but needs outlets or it becomes restless.',
    'Moon-Sun': 'Emotional and identity needs aligned — what you want matches what you need.',
    'Mercury-Sun': 'Mind and identity merged — you think and communicate as an expression of self.',
    'Sun-Venus': 'Identity expressed through beauty, love, and values — charming, artistic nature.',
    'Jupiter-Sun': 'Expansive identity — optimism, growth-oriented, can overcommit.',
    'Saturn-Sun': 'Identity shaped by responsibility — serious, disciplined, may feel burdened by expectations.',
    'Neptune-Sun': 'Identity blurred with ideals — imaginative, spiritual, but can lose boundaries.',
    'Pluto-Sun': 'Intense, transformative identity — power struggles, depth, regeneration.',
    'Mars-Moon': 'Emotions trigger action — reactive, passionate, needs physical outlets for feelings.',
    'Moon-Venus': 'Emotional needs tied to love and beauty — nurturing through aesthetics and connection.',
  };
  
  const squareMeanings: Record<string, string> = {
    'Mars-Sun': 'Tension between will and action — inner conflict that drives achievement when mastered.',
    'Sun-Uranus': 'Restlessness with authority — rebellious streak that disrupts but also innovates.',
    'Saturn-Sun': 'Confidence vs. self-doubt — hard-won authority that builds through discipline.',
    'Moon-Sun': 'Emotional needs conflict with identity goals — internal tug-of-war.',
    'Mars-Moon': 'Emotions and drive clash — impulsive reactions need conscious management.',
  };
  
  const oppositionMeanings: Record<string, string> = {
    'Mars-Sun': 'Identity projected onto others — may attract conflict or strong partners.',
    'Sun-Uranus': 'Freedom needs challenge identity — learning to integrate independence.',
    'Moon-Sun': 'Awareness of emotional vs. ego needs — relationships mirror this balance.',
  };

  const trineMeanings: Record<string, string> = {
    'Mars-Sun': 'Natural flow between will and action — confident initiative.',
    'Sun-Uranus': 'Comfortable with uniqueness — innovation comes naturally.',
    'Jupiter-Sun': 'Luck and expansion feel natural — optimism is a strength.',
    'Moon-Venus': 'Emotional intelligence in relationships — nurturing comes easily.',
  };

  const key = p1 + '-' + p2;
  
  switch (aspectType) {
    case 'conjunction':
      return conjunctionMeanings[key] || `${planet1} and ${planet2} energies are merged — they act as one force.`;
    case 'square':
      return squareMeanings[key] || `${planet1} and ${planet2} create friction that demands integration.`;
    case 'opposition':
      return oppositionMeanings[key] || `${planet1} and ${planet2} seek balance — often projected onto relationships.`;
    case 'trine':
      return trineMeanings[key] || `${planet1} and ${planet2} flow together easily — a natural gift.`;
    case 'sextile':
      return `${planet1} and ${planet2} support each other — opportunities when you take action.`;
    case 'quincunx':
      return `${planet1} and ${planet2} need adjustment — they do not naturally understand each other.`;
    default:
      return '';
  }
}

/**
 * Generate plain English explanation for a planet placement
 */
export function generatePlainEnglish(planet: ChartPlanet, dignity: DignityType): string[] {
  const explanations: string[] = [];
  
  // Special case: Sun in Libra (fall)
  if (planet.name === 'Sun' && planet.sign === 'Libra') {
    return [
      "You become most 'you' when you stop asking 'What do they want?' first and start with 'What do I value?'",
      "Your superpower is relational intelligence — seeing angles, making things fair, making things beautiful and workable.",
      "The practice: decide your non-negotiables, then collaborate."
    ];
  }

  // General explanations based on dignity
  switch (dignity) {
    case 'rulership':
      explanations.push(`Your ${planet.name} operates naturally in ${planet.sign}. This energy flows easily.`);
      explanations.push(`Trust your instincts here — you don't need to overthink how to express this planet.`);
      break;
    case 'exaltation':
      explanations.push(`Your ${planet.name} is elevated in ${planet.sign} — it can reach high expressions.`);
      explanations.push(`This placement often feels like a gift or natural talent.`);
      break;
    case 'detriment':
      explanations.push(`Your ${planet.name} in ${planet.sign} needs more conscious navigation.`);
      explanations.push(`You may feel pulled between the planet's nature and the sign's expression.`);
      explanations.push(`Strategy: lean into the sign's strengths while honoring what the planet needs.`);
      break;
    case 'fall':
      explanations.push(`Your ${planet.name} in ${planet.sign} requires earned confidence through practice.`);
      explanations.push(`This isn't weakness — it's where you develop mastery over time.`);
      explanations.push(`The work is real, but so is the payoff once you integrate it.`);
      break;
    case 'peregrine':
      explanations.push(`Your ${planet.name} in ${planet.sign} is in neutral territory.`);
      explanations.push(`Look to aspects and house placement for how this energy expresses.`);
      break;
  }

  if (planet.retrograde) {
    explanations.push(`${planet.name} retrograde suggests an internal, reflective expression of this energy.`);
  }

  return explanations;
}

/**
 * Generate remedies/practical support for a planet
 */
export function generateRemedies(planet: ChartPlanet, dignity: DignityType): string[] {
  const remedies: string[] = [];

  // Special case: Sun in fall
  if (planet.name === 'Sun' && dignity === 'fall') {
    return [
      "Do 1 daily 'self-decision rep' (tiny choices made without polling anyone).",
      "Name your top 3 values weekly; use them as a filter for decisions.",
      "When stuck: write 'My preference is…' before you write 'Their preference is…'"
    ];
  }

  // General remedies based on planet
  switch (planet.name) {
    case 'Sun':
      remedies.push('Practice speaking your preferences out loud, even small ones.');
      remedies.push('Spend time in sunlight. Move your body with purpose.');
      break;
    case 'Moon':
      remedies.push('Track your emotional rhythms through the lunar cycle.');
      remedies.push('Create rituals around nourishment and rest.');
      break;
    case 'Mercury':
      remedies.push('Journal or voice-memo your thoughts regularly.');
      remedies.push('Learn something new that challenges your current thinking.');
      break;
    case 'Venus':
      remedies.push('Surround yourself with beauty that feels authentic to you.');
      remedies.push('Clarify your values — what you would pay for without regret.');
      break;
    case 'Mars':
      remedies.push('Move your body daily — this planet needs physical outlet.');
      remedies.push('Practice saying no without over-explaining.');
      break;
    case 'Jupiter':
      remedies.push('Connect with mentors or teachers who expand your worldview.');
      remedies.push('Travel (physically or intellectually) to broaden perspective.');
      break;
    case 'Saturn':
      remedies.push('Commit to one long-term project with measurable milestones.');
      remedies.push('Build structure before seeking freedom.');
      break;
    default:
      remedies.push(`Work with ${planet.name} themes through reflection and intentional action.`);
  }

  // Add dignity-specific remedies
  if (dignity === 'detriment' || dignity === 'fall') {
    remedies.push(`Since ${planet.name} is in ${dignity}, extra patience and self-compassion help.`);
  }

  return remedies;
}

/**
 * Generate experiential explanation for a dispositor chain
 * Explains how the client FEELS this chain in their life
 */
export function generateDispositorExperience(
  planet: ChartPlanet,
  chain: DispositorChainResult,
  allPlanets: ChartPlanet[]
): string[] {
  const experiences: string[] = [];
  const planetMeaning = PLANET_MEANINGS[planet.name]?.split(',')[0]?.toLowerCase() || planet.name.toLowerCase();
  
  // Handle mutual reception
  if (chain.loopType === 'mutual_reception') {
    const parts = chain.finalDispositor.replace('Loop: ', '').split(' ↔ ');
    if (parts.length === 2) {
      const [p1, p2] = parts;
      const meaning1 = PLANET_MEANINGS[p1]?.split(',')[0]?.toLowerCase() || p1.toLowerCase();
      const meaning2 = PLANET_MEANINGS[p2]?.split(',')[0]?.toLowerCase() || p2.toLowerCase();
      
      experiences.push(
        `When you try to express your ${planet.name} (${planetMeaning}), you naturally filter it through both ${p1} (${meaning1}) and ${p2} (${meaning2}).`
      );
      experiences.push(
        `These two planets trade keys — they support and strengthen each other. Together, they're your chart's command center.`
      );
      experiences.push(
        `In practice: Your ${planetMeaning} feels most "right" when it serves both of these themes. Choices that honor only one may feel incomplete.`
      );
    }
    return experiences;
  }
  
  // Handle single ruler (planet in own sign)
  if (chain.loopType === 'single_ruler') {
    experiences.push(
      `Your ${planet.name} reports directly to ${chain.finalDispositor} — and that planet answers to no one.`
    );
    experiences.push(
      `This is a clean, direct chain. Your ${planetMeaning} expresses through ${chain.finalDispositor}'s themes without dilution.`
    );
    return experiences;
  }
  
  // Handle regular chain
  if (chain.chain.length > 1) {
    const dispositor = chain.chain[1]?.split(' (')[0].replace('→ ', '') || chain.finalDispositor;
    const dispositorMeaning = PLANET_MEANINGS[dispositor]?.split(',')[0]?.toLowerCase() || dispositor.toLowerCase();
    
    experiences.push(
      `Your ${planet.name} (${planetMeaning}) relies on ${dispositor} (${dispositorMeaning}) for direction.`
    );
    experiences.push(
      `How you feel this: When expressing your ${planetMeaning}, you naturally do it through ${dispositorMeaning} themes. For example, you may not feel fully "yourself" until those themes are honored.`
    );
    
    if (chain.finalDispositor && !chain.finalDispositor.includes('Loop')) {
      const finalMeaning = PLANET_MEANINGS[chain.finalDispositor]?.split(',')[0]?.toLowerCase() || chain.finalDispositor.toLowerCase();
      experiences.push(
        `The chain ends at ${chain.finalDispositor} (${finalMeaning}) — this is the "final boss" that all this energy ultimately serves.`
      );
    }
  }
  
  return experiences;
}

/**
 * Generate overall summary narrative
 */
export function generateSummaryNarrative(planets: ChartPlanet[]): string[] {
  const bullets: string[] = [
    "Tap any planet to see: what it wants, how it acts in its sign, whether it is in fall/detriment, its key aspects, and who it reports to (dispositor).",
    "Important: fall/detriment are NOT bad. They describe where you build skill and self-trust through practice."
  ];

  // Check for Sun in fall
  const sun = planets.find(p => p.name === 'Sun');
  if (sun && computeDignity('Sun', sun.sign) === 'fall') {
    bullets.push(`☀️ Your Sun is in ${sun.sign} (fall) — your identity and confidence are built through practice, not handed to you. Check the Sun card for more.`);
  }

  // Check for mutual receptions
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const ruler1 = getSignRuler(p1.sign, true);
      const ruler2 = getSignRuler(p2.sign, true);
      
      if (ruler1 === p2.name && ruler2 === p1.name) {
        bullets.push(`✨ Mutual reception: ${p1.name} ↔ ${p2.name} — these planets support each other.`);
      }
    }
  }

  return bullets;
}

/**
 * Get planet symbol
 */
export function getPlanetSymbol(name: string): string {
  const symbols: Record<string, string> = {
    Sun: '☉',
    Moon: '☽',
    Mercury: '☿',
    Venus: '♀',
    Mars: '♂',
    Jupiter: '♃',
    Saturn: '♄',
    Uranus: '♅',
    Neptune: '♆',
    Pluto: '♇',
    Chiron: '⚷',
    NorthNode: '☊',
    SouthNode: '☋',
    Ascendant: 'AC',
    Midheaven: 'MC'
  };
  return symbols[name] || name.substring(0, 2);
}

/**
 * Get sign symbol
 */
export function getSignSymbol(sign: string): string {
  const symbols: Record<string, string> = {
    Aries: '♈',
    Taurus: '♉',
    Gemini: '♊',
    Cancer: '♋',
    Leo: '♌',
    Virgo: '♍',
    Libra: '♎',
    Scorpio: '♏',
    Sagittarius: '♐',
    Capricorn: '♑',
    Aquarius: '♒',
    Pisces: '♓'
  };
  return symbols[sign] || sign.substring(0, 3);
}

/**
 * Generate dignity table rows for all planets
 */
export function generateDignityRows(planets: ChartPlanet[]): Array<{
  planet: string;
  sign: string;
  degree: string;
  dignity: DignityType;
  dignityLabel: string;
  color: string;
}> {
  return planets
    .filter(p => !['Ascendant', 'Midheaven', 'NorthNode', 'SouthNode'].includes(p.name))
    .map(planet => {
      const dignity = computeDignity(planet.name, planet.sign);
      const status = getDignityStatus(planet.name, planet.sign);
      return {
        planet: planet.name,
        sign: planet.sign,
        degree: `${planet.degree.toFixed(1)}°`,
        dignity,
        dignityLabel: status.type,
        color: status.color
      };
    });
}

/**
 * Default chart data from the spec
 */
export const DEFAULT_CHART_DATA: ChartPlanet[] = [
  { name: 'Sun', sign: 'Libra', degree: 28.0, retrograde: false, house: null },
  { name: 'Moon', sign: 'Libra', degree: 3.0, retrograde: false, house: null },
  { name: 'Mercury', sign: 'Libra', degree: 16.0, retrograde: false, house: null },
  { name: 'Venus', sign: 'Sagittarius', degree: 0.0, retrograde: false, house: null },
  { name: 'Mars', sign: 'Scorpio', degree: 8.0, retrograde: false, house: null },
  { name: 'Jupiter', sign: 'Taurus', degree: 29.0, retrograde: true, house: null },
  { name: 'Saturn', sign: 'Leo', degree: 15.0, retrograde: false, house: null },
  { name: 'Uranus', sign: 'Scorpio', degree: 6.0, retrograde: false, house: null },
  { name: 'Neptune', sign: 'Sagittarius', degree: 12.0, retrograde: false, house: null },
  { name: 'Pluto', sign: 'Libra', degree: 12.0, retrograde: false, house: null },
  { name: 'Chiron', sign: 'Aries', degree: 29.0, retrograde: true, house: null },
  { name: 'NorthNode', sign: 'Scorpio', degree: 3.0, retrograde: true, house: null },
  { name: 'Ascendant', sign: 'Libra', degree: 24.0, retrograde: false, house: null },
  { name: 'Midheaven', sign: 'Cancer', degree: 28.0, retrograde: false, house: null }
];
