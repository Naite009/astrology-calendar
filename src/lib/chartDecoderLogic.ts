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
 * When useTraditional is false, modern outer planet rulerships are considered
 */
export function computeDignity(planetName: string, sign: string, useTraditional: boolean = true): DignityType {
  const dignities = PLANET_DIGNITIES[planetName];
  
  // For modern rulerships: check if this planet rules this sign in modern astrology
  if (!useTraditional) {
    // Modern rulers: Pluto rules Scorpio, Uranus rules Aquarius, Neptune rules Pisces
    const modernRulerships: Record<string, string> = {
      Pluto: 'Scorpio',
      Uranus: 'Aquarius', 
      Neptune: 'Pisces'
    };
    
    if (modernRulerships[planetName] === sign) {
      return 'rulership';
    }
    
    // Modern detriments (opposite of modern rulerships)
    const modernDetriments: Record<string, string> = {
      Pluto: 'Taurus',
      Uranus: 'Leo',
      Neptune: 'Virgo'
    };
    
    if (modernDetriments[planetName] === sign) {
      return 'detriment';
    }
  }
  
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
            // Note: for natal charts, "applying" indicates the slower planet is ahead
            // This is based on zodiacal degree order at birth (not motion)
            applying: deg1 < deg2
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
      explanations.push(`Your ${planet.name} in ${planet.sign} is a free agent — no special advantage or disadvantage from the sign itself.`);
      if (planet.house) {
        const houseDescriptions: Record<number, string> = {
          1: 'front and center in your identity and first impressions',
          2: 'tied to your values, money, and sense of security',
          3: 'woven into daily communication, learning, and local connections',
          4: 'rooted in home, family, and emotional foundations',
          5: 'expressing through creativity, romance, and self-expression',
          6: 'active in daily routines, health, and service to others',
          7: 'playing out in partnerships and one-on-one relationships',
          8: 'diving into shared resources, intimacy, and transformation',
          9: 'reaching toward philosophy, travel, and higher learning',
          10: 'visible in career, public reputation, and life direction',
          11: 'operating through groups, friendships, and future visions',
          12: 'working behind the scenes through solitude, dreams, and the unconscious'
        };
        explanations.push(`In the ${planet.house}${planet.house === 1 ? 'st' : planet.house === 2 ? 'nd' : planet.house === 3 ? 'rd' : 'th'} house, this energy is ${houseDescriptions[planet.house] || 'expressing in this life area'}.`);
      }
      explanations.push(`This placement gets its color from aspects — how it relates to other planets in your chart.`);
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
 * Detailed experiential descriptions for planets as final dispositors
 */
const FINAL_DISPOSITOR_EXPERIENCES: Record<string, { selfRuled: string; rulingOthers: string }> = {
  Sun: {
    selfRuled: "Your Sun answers to no one. Your identity is SELF-DETERMINED. You don't need external permission to be who you are. When you walk into a room, you bring your own light—you're not borrowing it from anyone. This is rare and powerful. The challenge? You must actually CLAIM this. Many people with self-ruling Suns still look outside themselves for validation out of habit. Stop. You are the authority on you.",
    rulingOthers: "All roads in your chart lead to your Sun—your IDENTITY. Every decision, every emotion, every thought ultimately asks: 'Does this serve who I AM?' You experience life through the lens of self-expression and authenticity. When something feels off, it's usually because you've compromised your core identity for something else."
  },
  Moon: {
    selfRuled: "Your Moon answers to no one. Your emotional nature is SELF-SOURCING. You don't need others to make you feel safe—you create your own emotional home wherever you go. Your feelings are valid simply because you feel them; they don't require external justification. This is profound self-nurturing. The gift: emotional autonomy. The work: not isolating or refusing to let others in.",
    rulingOthers: "All roads lead to your Moon—your EMOTIONAL NEEDS. Every choice filters through 'Does this make me feel safe? Nourished? At home?' Your identity, your thoughts, your relationships—all ultimately serve your emotional wellbeing. When life feels wrong, check: are you honoring what you actually NEED?"
  },
  Mercury: {
    selfRuled: "Your Mercury answers to no one. Your mind is SELF-VALIDATING. You don't need others to confirm your ideas for them to be valid. Your way of thinking, learning, and communicating is its own authority. This gives you intellectual independence—but also the responsibility to use your mind wisely, since no one else is checking your work.",
    rulingOthers: "All roads lead to Mercury—THINKING and COMMUNICATION. Every feeling, every drive, every identity question eventually becomes: 'What do I think about this? How do I understand it?' You process life through analysis and articulation. If you can't explain something, you haven't fully integrated it."
  },
  Venus: {
    selfRuled: "Your Venus answers to no one. Your values and love style are SELF-DEFINED. You don't need others to validate what you find beautiful, worthy, or lovable. Your aesthetic and relational preferences are their own authority. This is creative and romantic autonomy—you love what you love without apology.",
    rulingOthers: "All roads lead to Venus—VALUES and LOVE. Every action, every thought, every emotion ultimately serves: 'Is this beautiful? Is this aligned with what I value? Does this feel like love?' You experience life through the lens of attraction and worth. Decisions that ignore your values feel hollow."
  },
  Mars: {
    selfRuled: "Your Mars answers to no one. Your drive and assertion are SELF-DIRECTED. You don't wait for permission to act or need others to motivate you. Your anger is valid, your desire is valid, your boundaries are valid—simply because they're yours. This is warrior energy that doesn't negotiate its existence.",
    rulingOthers: "All roads lead to Mars—ACTION and DESIRE. Every thought, value, and emotion eventually asks: 'What am I going to DO about this?' You experience life through the lens of initiative and boundary. Passivity feels like death to you. You need to be MOVING toward something."
  },
  Jupiter: {
    selfRuled: "Your Jupiter answers to no one. Your beliefs and sense of meaning are SELF-GENERATED. You don't need a teacher, guru, or institution to tell you what life means. Your faith—in yourself, in life, in possibility—is its own authority. This is philosophical independence. The work: not becoming preachy or missing wisdom from others.",
    rulingOthers: "All roads lead to Jupiter—MEANING and EXPANSION. Every action, emotion, and thought ultimately serves: 'What does this MEAN? How does this help me GROW?' You experience life as a quest for understanding and expansion. Anything that feels small, contracted, or meaningless drains you."
  },
  Saturn: {
    selfRuled: "Your Saturn answers to no one. Your authority is SELF-CONSTRUCTED. You don't need external validation to feel competent or worthy of responsibility. Your rules, your standards, your discipline—they come from within. This is mature self-governance. The challenge: not becoming rigidly self-critical or refusing help.",
    rulingOthers: "All roads lead to Saturn—RESPONSIBILITY and STRUCTURE. Every emotion, desire, and idea eventually asks: 'Is this MATURE? Is this BUILDING something? Am I being RESPONSIBLE?' You experience life through the lens of duty and long-term consequence. Choices that lack discipline feel reckless to you."
  },
  Neptune: {
    selfRuled: "Your Neptune answers to no one. Your spirituality and imagination are SELF-SOURCING. You don't need an external tradition to connect with the divine—you ARE the portal. Your dreams, your intuition, your artistic vision—they require no permission. The challenge: staying grounded enough to translate your visions into reality.",
    rulingOthers: "All roads lead to Neptune—TRANSCENDENCE and IMAGINATION. Every practical concern, every relationship, every identity question eventually dissolves into: 'What is the DEEPER meaning? What is the SOUL of this?' You experience life through a mystical, artistic lens. Pure logic or harsh reality feels spiritually suffocating."
  },
  Uranus: {
    selfRuled: "Your Uranus answers to no one. Your uniqueness and freedom are SELF-AUTHORIZED. You don't need anyone's permission to be different, to break rules, to innovate. Your originality is its own validation. This is radical authenticity. The challenge: not rejecting everything conventional just because it's conventional.",
    rulingOthers: "All roads lead to Uranus—FREEDOM and INNOVATION. Every emotion, every responsibility, every relationship eventually asks: 'Am I FREE here? Is this AUTHENTIC? Am I being MYSELF?' You experience life through the lens of liberation and originality. Conformity feels like spiritual death."
  },
  Pluto: {
    selfRuled: "Your Pluto answers to no one. Your power and transformation are SELF-DIRECTED. You don't need external crises to evolve—you can choose depth whenever you want. Your intensity, your psychological insight, your capacity for rebirth—they're entirely yours to wield. The challenge: not using this power destructively.",
    rulingOthers: "All roads lead to Pluto—TRANSFORMATION and POWER. Every thought, every feeling, every action eventually asks: 'What is the TRUTH beneath the surface? What needs to DIE for something new to live?' You experience life through the lens of depth psychology. Superficiality is intolerable."
  }
};

/**
 * How it FEELS when a planet reports to another
 */
const DISPOSITOR_RELATIONSHIP_FEELINGS: Record<string, Record<string, string>> = {
  Sun: {
    Moon: "Your identity (Sun) reports to your emotional needs (Moon). You can't feel like 'yourself' unless you feel emotionally safe first. Your sense of self fluctuates with your moods. Before you can shine, you need to feel nourished. This is the performer who needs to feel 'at home' before going on stage.",
    Mercury: "Your identity (Sun) reports to your mind (Mercury). You understand who you are through THINKING about it. Self-knowledge comes through analysis, conversation, and learning. You might over-intellectualize your identity or struggle to 'just be' without understanding why.",
    Venus: "Your identity (Sun) reports to your values (Venus). You feel like yourself when you're surrounded by beauty, love, and things you value. Your self-worth is tied to relationships and aesthetics. You shine brightest when you feel loved and appreciated.",
    Mars: "Your identity (Sun) reports to your drive (Mars). You feel most yourself when you're DOING something, competing, or fighting for something. Passivity makes you feel invisible. Your identity is expressed through action and courage.",
    Jupiter: "Your identity (Sun) reports to your beliefs (Jupiter). You feel like yourself when you're growing, learning, exploring meaning. Your sense of self expands with your worldview. You need to believe in something bigger to feel alive.",
    Saturn: "Your identity (Sun) reports to your sense of duty (Saturn). You feel like yourself when you're being RESPONSIBLE, achieving, building something that lasts. Your self-worth is earned through discipline and accomplishment. Fun for its own sake might feel frivolous.",
    Neptune: "Your identity (Sun) reports to your imagination and spirituality (Neptune). You feel like yourself when you're connected to something transcendent—art, music, meditation, compassion. Your identity is diffuse, shape-shifting, and tied to the collective. You might struggle to know where 'you' end and others begin.",
    Uranus: "Your identity (Sun) reports to your need for freedom (Uranus). You feel like yourself when you're being DIFFERENT, breaking from convention, innovating. Conformity makes you feel like you're dying inside. Your identity is tied to your uniqueness.",
    Pluto: "Your identity (Sun) reports to your need for transformation (Pluto). You feel like yourself when you're going DEEP—facing shadows, transforming, wielding power. Superficial living makes you feel dead. Your identity regenerates through crisis and rebirth."
  },
  Moon: {
    Sun: "Your emotional needs (Moon) report to your identity (Sun). You feel safe when you feel like YOURSELF. Emotional security comes from self-expression and recognition. You're nourished by being seen and acknowledged.",
    Mercury: "Your emotional needs (Moon) report to your mind (Mercury). You feel safe when you UNDERSTAND things. Talking through feelings, analyzing them, learning about them—this is how you process emotion. You might over-think feelings instead of just feeling them.",
    Venus: "Your emotional needs (Moon) report to your values (Venus). You feel safe when surrounded by beauty, love, and harmony. Ugly environments or conflict disturb you deeply. Relationships and aesthetics are how you self-soothe.",
    Mars: "Your emotional needs (Moon) report to your drive (Mars). You feel safe when you're DOING something about your situation. Passivity increases anxiety. Action, competition, and physical activity are how you process emotion.",
    Jupiter: "Your emotional needs (Moon) report to your beliefs (Jupiter). You feel safe when life has MEANING, when you're growing and expanding. Stagnation or meaninglessness feels emotionally threatening. Faith and optimism are your security blanket.",
    Saturn: "Your emotional needs (Moon) report to Saturn. You feel safe when you're being RESPONSIBLE, when things are structured and predictable. Chaos is emotionally threatening. You might suppress emotions to 'be mature.'",
    Neptune: "Your emotional needs (Moon) report to Neptune. You feel safe through transcendence—music, art, meditation, merging with something larger. Boundaries are emotionally difficult. You absorb others' feelings easily.",
    Uranus: "Your emotional needs (Moon) report to Uranus. You feel safe when you're FREE, when you can be different, when things are exciting and unpredictable. Routine feels emotionally stifling. Your need for independence might conflict with need for closeness.",
    Pluto: "Your emotional needs (Moon) report to Pluto. You feel safe through INTENSITY and truth. Superficial emotions don't register. You need to go deep, even if it's uncomfortable. Transformation is emotionally necessary."
  }
};

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
        `**MUTUAL RECEPTION: ${p1} ↔ ${p2}**`
      );
      experiences.push(
        `These two planets hold each other's keys—they're in each other's signs. This creates a POWER COUPLE at the center of your chart.`
      );
      experiences.push(
        `When you try to express your ${planet.name} (${planetMeaning}), you naturally filter it through BOTH ${p1} (${meaning1}) and ${p2} (${meaning2}). Neither one is complete without the other.`
      );
      experiences.push(
        `**How this feels:** You might notice that honoring just one of these planets leaves you feeling incomplete. A decision that serves your ${meaning1} but ignores your ${meaning2} (or vice versa) will nag at you until you integrate both.`
      );
      experiences.push(
        `**The gift:** These planets strengthen each other. When ${p1} struggles, ${p2} can help—and vice versa. You have an internal support system.`
      );
    }
    return experiences;
  }
  
  // Handle single ruler (planet in own sign)
  if (chain.loopType === 'single_ruler') {
    const finalExp = FINAL_DISPOSITOR_EXPERIENCES[chain.finalDispositor];
    
    if (planet.name === chain.finalDispositor) {
      // The planet IS the final dispositor (in its own sign)
      experiences.push(
        `**${planet.name} IN ITS OWN SIGN — SELF-RULING**`
      );
      if (finalExp) {
        experiences.push(finalExp.selfRuled);
      }
      experiences.push(
        `**How this feels in daily life:** Your ${planetMeaning.toLowerCase()} doesn't ask permission. It doesn't look to other parts of your chart for validation. When you express ${planet.name} energy, it's direct, unfiltered, and entirely YOURS.`
      );
      
      // Add sign-specific flavor
      if (planet.name === 'Moon' && planet.sign === 'Cancer') {
        experiences.push(
          `**Moon in Cancer specifically:** Your emotional nature is self-nurturing at the deepest level. You instinctively know what you need to feel safe. Your home, your family (chosen or biological), your capacity to nurture—these come from an endless internal well. You don't need someone else to "make" you feel secure. The challenge is letting others nurture YOU, and not using self-sufficiency as a wall against intimacy.`
        );
      } else if (planet.name === 'Sun' && planet.sign === 'Leo') {
        experiences.push(
          `**Sun in Leo specifically:** Your identity radiates from within. You ARE the light, not reflecting someone else's. Creative self-expression isn't optional—it's how you exist. The challenge is shining without needing applause (though applause is nice).`
        );
      } else if (planet.name === 'Mercury' && (planet.sign === 'Gemini' || planet.sign === 'Virgo')) {
        experiences.push(
          `**Mercury in ${planet.sign} specifically:** Your mind is a precision instrument that validates itself. You think the way YOU think, and you don't need anyone to tell you it's right. Intellectual independence is your birthright.`
        );
      } else if (planet.name === 'Venus' && (planet.sign === 'Taurus' || planet.sign === 'Libra')) {
        experiences.push(
          `**Venus in ${planet.sign} specifically:** Your sense of beauty, value, and love is self-authorizing. You know what you like. You know what you're worth. You don't need trends or others' opinions to validate your aesthetic or relational choices.`
        );
      } else if (planet.name === 'Mars' && (planet.sign === 'Aries' || planet.sign === 'Scorpio')) {
        experiences.push(
          `**Mars in ${planet.sign} specifically:** Your drive, anger, and desire are YOURS. You don't wait for permission to act, fight, or want. Your boundaries are clear because YOU set them, not because someone told you to.`
        );
      } else if (planet.name === 'Jupiter' && (planet.sign === 'Sagittarius' || planet.sign === 'Pisces')) {
        experiences.push(
          `**Jupiter in ${planet.sign} specifically:** Your beliefs, your faith, your sense of meaning—these are self-generated. You don't need a religion or guru to tell you what life means. You're your own philosopher.`
        );
      } else if (planet.name === 'Saturn' && (planet.sign === 'Capricorn' || planet.sign === 'Aquarius')) {
        experiences.push(
          `**Saturn in ${planet.sign} specifically:** Your authority, discipline, and responsibility come from within. You don't need external rules to be structured—you create your own. You're the boss of you.`
        );
      }
    } else {
      // This planet reports to a self-ruling planet
      experiences.push(
        `**${planet.name} → ${chain.finalDispositor} (final authority)**`
      );
      experiences.push(
        `Your ${planet.name} reports directly to ${chain.finalDispositor}—and ${chain.finalDispositor} answers to no one.`
      );
      if (finalExp) {
        experiences.push(finalExp.rulingOthers);
      }
      
      // Add specific relationship feeling
      const relationshipFeel = DISPOSITOR_RELATIONSHIP_FEELINGS[planet.name]?.[chain.finalDispositor];
      if (relationshipFeel) {
        experiences.push(`**How this specifically feels:**`);
        experiences.push(relationshipFeel);
      }
    }
    return experiences;
  }
  
  // Handle regular chain (multiple steps)
  if (chain.chain.length > 1) {
    const immediateDispositor = chain.chain[1]?.split(' (')[0].replace('→ ', '') || '';
    const dispositorMeaning = PLANET_MEANINGS[immediateDispositor]?.split(',')[0]?.toLowerCase() || immediateDispositor.toLowerCase();
    
    experiences.push(
      `**DISPOSITOR CHAIN: ${chain.chain.join(' ')}**`
    );
    experiences.push(
      `Your ${planet.name} (${planetMeaning}) doesn't operate independently. It looks to ${immediateDispositor} for direction.`
    );
    
    // Add specific relationship feeling if available
    const relationshipFeel = DISPOSITOR_RELATIONSHIP_FEELINGS[planet.name]?.[immediateDispositor];
    if (relationshipFeel) {
      experiences.push(`**How this feels:**`);
      experiences.push(relationshipFeel);
    } else {
      experiences.push(
        `**How this feels:** When you try to express your ${planetMeaning}, you automatically route it through ${dispositorMeaning} themes. You might not even realize you're doing it.`
      );
    }
    
    // Explain the full chain if longer
    if (chain.chain.length > 2 && chain.finalDispositor && !chain.finalDispositor.includes('Loop')) {
      const finalMeaning = PLANET_MEANINGS[chain.finalDispositor]?.split(',')[0]?.toLowerCase() || chain.finalDispositor.toLowerCase();
      const finalExp = FINAL_DISPOSITOR_EXPERIENCES[chain.finalDispositor];
      
      experiences.push(
        `**The chain ultimately ends at ${chain.finalDispositor}** (${finalMeaning}). This is the FINAL AUTHORITY that your ${planet.name} ultimately serves.`
      );
      if (finalExp) {
        experiences.push(finalExp.rulingOthers);
      }
      experiences.push(
        `**The full journey:** Your ${planetMeaning} → filters through ${dispositorMeaning} → ultimately serves ${finalMeaning}. Each step adds a layer of translation.`
      );
    }
  }
  
  return experiences;
}

/**
 * Generate overall summary narrative
 */
export function generateSummaryNarrative(planets: ChartPlanet[], useTraditional: boolean = true): string[] {
  const bullets: string[] = [
    "Tap any planet to see: what it wants, how it acts in its sign, whether it is in fall/detriment, its key aspects, and who it reports to (dispositor).",
    "Important: fall/detriment are NOT bad. They describe where you build skill and self-trust through practice."
  ];

  // Check for Sun in fall
  const sun = planets.find(p => p.name === 'Sun');
  if (sun && computeDignity('Sun', sun.sign, useTraditional) === 'fall') {
    bullets.push(`☀️ Your Sun is in ${sun.sign} (fall) — your identity and confidence are built through practice, not handed to you. Check the Sun card for more.`);
  }

  // Check for mutual receptions
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p1 = planets[i];
      const p2 = planets[j];
      const ruler1 = getSignRuler(p1.sign, useTraditional);
      const ruler2 = getSignRuler(p2.sign, useTraditional);
      
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
export function generateDignityRows(planets: ChartPlanet[], useTraditional: boolean = true): Array<{
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
      const dignity = computeDignity(planet.name, planet.sign, useTraditional);
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
