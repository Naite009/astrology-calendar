/**
 * Pattern Mirror Combinations
 * 
 * A new approach to chart interpretation:
 * - Pattern detector (yes/no: does this chart have it?)
 * - Felt experience descriptor (not a diagnosis)
 * - Layered: Light / Core / Shadow
 * - Never absolute, never predictive — just revealing
 * 
 * You're basically building a pattern mirror.
 */

export interface PatternMirrorCombo {
  id: string;
  title: string;
  // What triggers this pattern (e.g., Moon-Uranus aspect, Moon in 4th House)
  patternType: 'aspect' | 'house-placement' | 'sign-placement' | 'combined';
  // For aspects: which planets/points
  planets?: string[];
  // For aspects: which aspect types trigger this (conjunction, square, opposition, etc.)
  aspectTypes?: string[];
  // For house placements: which house
  house?: number;
  // For sign placements: which sign(s)
  signs?: string[];
  // The core felt-experience description
  summary: string;
  // Three-layer expression system
  lightExpressions: string[];
  coreExpressions: string[];
  shadowExpressions: string[];
  // Theme-based tags for filtering
  thematicTags: string[];
}

// ============== THEMATIC CATEGORIES ==============

export const THEMATIC_CATEGORIES = [
  { id: 'perception', label: 'Perception', icon: '👁️' },
  { id: 'attachment', label: 'Attachment', icon: '🔗' },
  { id: 'nervous-system', label: 'Nervous System', icon: '⚡' },
  { id: 'family-imprint', label: 'Family Imprint', icon: '🏠' },
  { id: 'emotional-boundaries', label: 'Emotional Boundaries', icon: '🛡️' },
  { id: 'intuition', label: 'Intuition', icon: '✨' },
  { id: 'control-power', label: 'Control / Power', icon: '👑' },
  { id: 'dissolution-sensitivity', label: 'Dissolution / Sensitivity', icon: '🌊' },
  { id: 'vigilance', label: 'Vigilance', icon: '🔍' },
  { id: 'inheritance-patterns', label: 'Inheritance Patterns', icon: '🧬' },
  { id: 'emotional-regulation', label: 'Emotional Regulation', icon: '🌡️' },
  { id: 'responsibility', label: 'Responsibility', icon: '⚖️' },
  { id: 'sensitivity', label: 'Sensitivity', icon: '🌸' },
  { id: 'emotional-memory', label: 'Emotional Memory', icon: '📖' },
] as const;

// ============== PATTERN MIRROR COMBOS ==============

export const patternMirrorCombos: PatternMirrorCombo[] = [
  // COMBO 1: Lunar Voltage
  {
    id: 'lunar-voltage',
    title: 'Lunar Voltage',
    patternType: 'aspect',
    planets: ['Moon', 'Uranus'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition'],
    summary: 'The Moon in dynamic contact with Uranus creates a highly responsive emotional system. Feelings arrive suddenly, often without a clear narrative, and can shift just as quickly. Emotional awareness is instantaneous rather than linear.',
    lightExpressions: [
      'Rapid emotional insight',
      'Strong intuitive flashes',
      'Comfort with emotional truth, even when it\'s unconventional',
      'Emotional independence and originality',
    ],
    coreExpressions: [
      'Emotions register faster than conscious thought',
      'Sensitivity to environments, people, and unspoken dynamics',
      'Needs freedom and space to process feelings',
    ],
    shadowExpressions: [
      'Emotional nervousness or restlessness',
      'Difficulty settling or feeling emotionally "safe"',
      'Sudden withdrawal or detachment when overwhelmed',
      'Trouble sleeping or switching off emotionally',
    ],
    thematicTags: ['perception', 'nervous-system', 'intuition', 'emotional-regulation'],
  },

  // COMBO 2: Inherited Emotional Climate
  {
    id: 'inherited-emotional-climate',
    title: 'Inherited Emotional Climate',
    patternType: 'house-placement',
    planets: ['Moon'],
    house: 4,
    summary: 'With the Moon rooted in the 4th house, emotional patterns are deeply shaped by early home life. Feelings often feel "old," familiar, or pre-existing, as if they were absorbed rather than chosen.',
    lightExpressions: [
      'Strong emotional memory',
      'Deep attunement to family dynamics',
      'Natural caretaker or emotional anchor',
      'Strong need for emotional security',
    ],
    coreExpressions: [
      'Emotions tied to safety, home, and belonging',
      'Early emotional conditioning plays a lasting role',
      'Private emotional life',
    ],
    shadowExpressions: [
      'Difficulty separating personal feelings from family mood',
      'Emotional responses that feel inherited rather than current',
      'Strong reactions to instability or displacement',
    ],
    thematicTags: ['family-imprint', 'attachment', 'emotional-memory'],
  },

  // COMBO 3: The Weight of Feeling
  {
    id: 'weight-of-feeling',
    title: 'The Weight of Feeling',
    patternType: 'aspect',
    planets: ['Moon', 'Saturn'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition', 'Sextile', 'Trine'],
    summary: 'Moon–Saturn contacts create emotional seriousness and responsibility. Feelings are real, but often experienced as something to manage, contain, or earn rather than freely express.',
    lightExpressions: [
      'Emotional maturity',
      'Reliability and loyalty',
      'Capacity to hold others emotionally',
      'Strong inner discipline',
    ],
    coreExpressions: [
      'Feelings are filtered through responsibility',
      'Emotional self-control developed early',
      'Security comes from structure',
    ],
    shadowExpressions: [
      'Emotional inhibition or self-denial',
      'Difficulty asking for support',
      'Feeling emotionally alone even when connected',
      'Fear of being a burden',
    ],
    thematicTags: ['attachment', 'emotional-boundaries', 'responsibility'],
  },

  // COMBO 4: Functional Bonding
  {
    id: 'functional-bonding',
    title: 'Functional Bonding',
    patternType: 'combined',
    planets: ['Moon', 'Ascendant'],
    signs: ['Virgo'],
    summary: 'Virgo lunar or rising placements often form bonds through usefulness, reliability, and care. Emotional connection is built by being needed, helpful, or competent rather than purely expressive.',
    lightExpressions: [
      'Attentive, caring, and responsive',
      'Shows love through service',
      'Emotionally perceptive to others\' needs',
      'Strong sense of duty and care',
    ],
    coreExpressions: [
      'Attachment formed through roles and responsibility',
      'Feels safest when contributing or fixing',
      'Emotional worth tied to usefulness',
    ],
    shadowExpressions: [
      'Difficulty receiving care',
      'Over-identification with caretaker role',
      'Anxiety when not needed',
      'Subtle emotional entanglement through obligation',
    ],
    thematicTags: ['attachment', 'family-imprint', 'emotional-boundaries'],
  },

  // COMBO 5: Porous Emotional Boundaries
  {
    id: 'porous-emotional-boundaries',
    title: 'Porous Emotional Boundaries',
    patternType: 'combined',
    planets: ['Moon', 'Neptune'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition', 'Sextile', 'Trine'],
    signs: ['Pisces'],
    house: 12,
    summary: 'This pattern creates emotional permeability. Feelings flow easily between self and others, making it difficult at times to tell what originates internally versus what is absorbed.',
    lightExpressions: [
      'Deep compassion',
      'Emotional empathy',
      'Rich inner imaginative life',
      'Strong emotional intuition',
    ],
    coreExpressions: [
      'Highly sensitive emotional field',
      'Emotions respond to atmosphere and tone',
      'Needs solitude to reset',
    ],
    shadowExpressions: [
      'Emotional overwhelm',
      'Absorbing others\' moods as one\'s own',
      'Difficulty with emotional boundaries',
      'Escapism or emotional fog',
    ],
    thematicTags: ['intuition', 'emotional-boundaries', 'sensitivity', 'dissolution-sensitivity'],
  },

  // COMBO 6: Controlled Intensity
  {
    id: 'controlled-intensity',
    title: 'Controlled Intensity',
    patternType: 'aspect',
    planets: ['Moon', 'Pluto'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition'],
    summary: 'Moon-Pluto contacts create depth and intensity in the emotional world. Feelings run deep, often hidden, and carry transformative power. There is an instinct to control emotional exposure.',
    lightExpressions: [
      'Profound emotional depth',
      'Capacity for emotional transformation',
      'Penetrating insight into others\' feelings',
      'Emotional resilience through crisis',
    ],
    coreExpressions: [
      'Emotions are powerful and not easily shared',
      'Early experiences of emotional intensity shape patterns',
      'Strong need for emotional privacy and control',
    ],
    shadowExpressions: [
      'Fear of emotional vulnerability',
      'Tendency to manipulate or test emotional bonds',
      'Difficulty trusting emotional safety',
      'Compulsive emotional patterns',
    ],
    thematicTags: ['control-power', 'inheritance-patterns', 'emotional-boundaries'],
  },

  // COMBO 7: The Watchful Heart
  {
    id: 'watchful-heart',
    title: 'The Watchful Heart',
    patternType: 'house-placement',
    planets: ['Moon'],
    house: 8,
    summary: 'Moon in the 8th house creates emotional vigilance. There is an awareness of emotional undercurrents, hidden dynamics, and the unspoken aspects of relationships.',
    lightExpressions: [
      'Deep emotional perception',
      'Comfort with emotional complexity',
      'Capacity for emotional healing work',
      'Strong intuition about others\' true feelings',
    ],
    coreExpressions: [
      'Emotions are experienced intensely and privately',
      'Strong awareness of power dynamics in relationships',
      'Needs emotional depth in connections',
    ],
    shadowExpressions: [
      'Emotional hypervigilance or suspicion',
      'Difficulty with emotional lightness',
      'Fear of betrayal or emotional exposure',
      'Tendency to probe others emotionally',
    ],
    thematicTags: ['vigilance', 'control-power', 'perception'],
  },

  // COMBO 8: Ancestral Echoes
  {
    id: 'ancestral-echoes',
    title: 'Ancestral Echoes',
    patternType: 'aspect',
    planets: ['Moon', 'South Node'],
    aspectTypes: ['Conjunction'],
    summary: 'Moon conjunct South Node suggests emotional patterns that feel ancient or inherited. The emotional style may mirror family patterns going back generations.',
    lightExpressions: [
      'Natural emotional wisdom',
      'Strong family intuition',
      'Comfort in tradition and continuity',
      'Emotional gifts passed down through lineage',
    ],
    coreExpressions: [
      'Emotions carry ancestral weight',
      'Familiar patterns feel comfortable but may limit growth',
      'Strong connection to family emotional legacy',
    ],
    shadowExpressions: [
      'Repeating family emotional patterns unconsciously',
      'Difficulty creating new emotional responses',
      'Feeling emotionally "stuck" in the past',
      'Inherited grief or trauma responses',
    ],
    thematicTags: ['inheritance-patterns', 'family-imprint', 'emotional-memory'],
  },
];

// ============== PATTERN DETECTION HELPERS ==============

/**
 * Check if a chart has a specific pattern mirror combo
 */
export const detectPatternInChart = (
  combo: PatternMirrorCombo,
  chartData: {
    planets: Record<string, { sign: string; degree: number; house?: number }>;
    houseCusps?: Record<string, { sign: string; degree: number }>;
    aspects?: { planet1: string; planet2: string; aspectType: string }[];
  }
): boolean => {
  if (!chartData?.planets) return false;

  switch (combo.patternType) {
    case 'aspect': {
      if (!combo.planets || combo.planets.length < 2 || !combo.aspectTypes) return false;
      const [p1, p2] = combo.planets;
      // Check if these planets have the specified aspect types
      if (chartData.aspects) {
        return chartData.aspects.some(
          (a) =>
            ((a.planet1 === p1 && a.planet2 === p2) ||
              (a.planet1 === p2 && a.planet2 === p1)) &&
            combo.aspectTypes!.includes(a.aspectType)
        );
      }
      return false;
    }

    case 'house-placement': {
      if (!combo.planets || !combo.house) return false;
      const planet = combo.planets[0];
      const planetData = chartData.planets[planet];
      return planetData?.house === combo.house;
    }

    case 'sign-placement': {
      if (!combo.planets || !combo.signs) return false;
      const planet = combo.planets[0];
      const planetData = chartData.planets[planet];
      return planetData?.sign ? combo.signs.includes(planetData.sign) : false;
    }

    case 'combined': {
      // Combined patterns can match multiple ways
      let matched = false;

      // Check sign placement
      if (combo.planets && combo.signs) {
        for (const planet of combo.planets) {
          const planetData = chartData.planets[planet];
          if (planetData?.sign && combo.signs.includes(planetData.sign)) {
            matched = true;
            break;
          }
        }
      }

      // Check house placement
      if (!matched && combo.planets && combo.house) {
        for (const planet of combo.planets) {
          const planetData = chartData.planets[planet];
          if (planetData?.house === combo.house) {
            matched = true;
            break;
          }
        }
      }

      // Check aspects
      if (!matched && combo.planets && combo.aspectTypes && chartData.aspects) {
        const [p1, p2] = combo.planets;
        matched = chartData.aspects.some(
          (a) =>
            ((a.planet1 === p1 && a.planet2 === p2) ||
              (a.planet1 === p2 && a.planet2 === p1)) &&
            combo.aspectTypes!.includes(a.aspectType)
        );
      }

      return matched;
    }

    default:
      return false;
  }
};

/**
 * Find all pattern mirror combos that match a chart
 */
export const findMatchingPatterns = (
  chartData: {
    planets: Record<string, { sign: string; degree: number; house?: number }>;
    houseCusps?: Record<string, { sign: string; degree: number }>;
    aspects?: { planet1: string; planet2: string; aspectType: string }[];
  }
): PatternMirrorCombo[] => {
  return patternMirrorCombos.filter((combo) => detectPatternInChart(combo, chartData));
};

/**
 * Find pattern combos by thematic tag
 */
export const findPatternsByTheme = (theme: string): PatternMirrorCombo[] => {
  return patternMirrorCombos.filter((combo) => combo.thematicTags.includes(theme));
};