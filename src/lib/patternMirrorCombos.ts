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

  // ============== MARS PATTERNS ==============

  // COMBO 9: The Combustible Will
  {
    id: 'combustible-will',
    title: 'The Combustible Will',
    patternType: 'aspect',
    planets: ['Mars', 'Uranus'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition'],
    summary: 'Mars-Uranus contacts electrify the will and action principle. There is an instinctive rebellion against restriction, and energy arrives in bursts rather than steady streams.',
    lightExpressions: [
      'Courageous innovation',
      'Quick reflexes and responses',
      'Ability to act decisively under pressure',
      'Pioneering spirit and originality',
    ],
    coreExpressions: [
      'Action is sudden, unpredictable',
      'Strong need for autonomy and freedom',
      'Boredom with routine or slowness',
    ],
    shadowExpressions: [
      'Impulsive or reckless action',
      'Explosive temper or volatility',
      'Difficulty with sustained effort',
      'Accidents through impatience',
    ],
    thematicTags: ['nervous-system', 'control-power', 'perception'],
  },

  // COMBO 10: The Smoldering Fire
  {
    id: 'smoldering-fire',
    title: 'The Smoldering Fire',
    patternType: 'aspect',
    planets: ['Mars', 'Pluto'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition', 'Sextile', 'Trine'],
    summary: 'Mars-Pluto contacts create concentrated willpower and intensity. Anger and desire run deep, often hidden, with the potential for profound transformation through action.',
    lightExpressions: [
      'Extraordinary determination',
      'Capacity to regenerate after defeat',
      'Powerful focused action',
      'Ability to confront taboos and shadows',
    ],
    coreExpressions: [
      'Will is intense, often operating beneath the surface',
      'Strong survival instincts',
      'Action connected to power dynamics',
    ],
    shadowExpressions: [
      'Suppressed rage or resentment',
      'Power struggles and control issues',
      'Ruthlessness or manipulation',
      'Self-destructive intensity',
    ],
    thematicTags: ['control-power', 'inheritance-patterns', 'vigilance'],
  },

  // COMBO 11: The Disciplined Warrior
  {
    id: 'disciplined-warrior',
    title: 'The Disciplined Warrior',
    patternType: 'aspect',
    planets: ['Mars', 'Saturn'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition', 'Sextile', 'Trine'],
    summary: 'Mars-Saturn contacts create tension between impulse and restraint. Action is filtered through caution, creating either disciplined endurance or frustrated inhibition.',
    lightExpressions: [
      'Strategic patience',
      'Disciplined work ethic',
      'Ability to pace oneself for long-term goals',
      'Controlled strength and endurance',
    ],
    coreExpressions: [
      'Action requires justification or permission',
      'Fear of failure shapes initiative',
      'Lessons around timing and patience',
    ],
    shadowExpressions: [
      'Suppressed anger or passive aggression',
      'Fear of taking action',
      'Chronic frustration or resentment',
      'Harsh self-criticism for mistakes',
    ],
    thematicTags: ['responsibility', 'control-power', 'emotional-regulation'],
  },

  // ============== VENUS PATTERNS ==============

  // COMBO 12: The Intense Bond
  {
    id: 'intense-bond',
    title: 'The Intense Bond',
    patternType: 'aspect',
    planets: ['Venus', 'Pluto'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition'],
    summary: 'Venus-Pluto contacts create intensity in love and relating. Attractions are powerful, often transformative, with themes of possession, merging, and deep vulnerability.',
    lightExpressions: [
      'Profound capacity for intimacy',
      'Transformative relationships',
      'Depth of love and passion',
      'Ability to love past surface appearances',
    ],
    coreExpressions: [
      'Love is all-or-nothing',
      'Attractions carry weight and significance',
      'Relationships involve power dynamics',
    ],
    shadowExpressions: [
      'Possessiveness or jealousy',
      'Fear of abandonment or betrayal',
      'Obsessive attachments',
      'Using love as control',
    ],
    thematicTags: ['attachment', 'control-power', 'emotional-boundaries'],
  },

  // COMBO 13: The Idealized Heart
  {
    id: 'idealized-heart',
    title: 'The Idealized Heart',
    patternType: 'aspect',
    planets: ['Venus', 'Neptune'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition', 'Sextile', 'Trine'],
    summary: 'Venus-Neptune contacts infuse love with imagination, idealism, and longing. There is a desire for transcendent connection, which can manifest as profound devotion or chronic disappointment.',
    lightExpressions: [
      'Romantic idealism and devotion',
      'Artistic sensitivity in love',
      'Compassion and selfless giving',
      'Spiritual connection in relationships',
    ],
    coreExpressions: [
      'Love carries dreams and projections',
      'Reality vs. fantasy tension in relating',
      'Sensitivity to beauty and aesthetics',
    ],
    shadowExpressions: [
      'Idealizing partners beyond reality',
      'Chronic disappointment when reality intrudes',
      'Self-sacrifice or martyrdom in love',
      'Escapism through romance',
    ],
    thematicTags: ['attachment', 'dissolution-sensitivity', 'intuition'],
  },

  // COMBO 14: The Cautious Heart
  {
    id: 'cautious-heart',
    title: 'The Cautious Heart',
    patternType: 'aspect',
    planets: ['Venus', 'Saturn'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition', 'Sextile', 'Trine'],
    summary: 'Venus-Saturn contacts create seriousness in love. Relationships are approached with caution, often requiring time and proof before trust develops. Worth may feel conditional.',
    lightExpressions: [
      'Loyalty and commitment',
      'Love that deepens with time',
      'Realistic relationship expectations',
      'Appreciation earned through effort',
    ],
    coreExpressions: [
      'Love feels earned rather than freely given',
      'Fear of rejection shapes relating',
      'Preference for substance over superficiality',
    ],
    shadowExpressions: [
      'Fear of not being lovable',
      'Emotional distance or coldness',
      'Staying in difficult relationships too long',
      'Difficulty receiving affection',
    ],
    thematicTags: ['attachment', 'responsibility', 'emotional-boundaries'],
  },

  // ============== MERCURY PATTERNS ==============

  // COMBO 15: The Penetrating Mind
  {
    id: 'penetrating-mind',
    title: 'The Penetrating Mind',
    patternType: 'aspect',
    planets: ['Mercury', 'Pluto'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition', 'Sextile', 'Trine'],
    summary: 'Mercury-Pluto contacts create depth and intensity in thought. The mind probes beneath surfaces, seeking hidden truths, with a capacity for research, investigation, and transformation through understanding.',
    lightExpressions: [
      'Psychological insight',
      'Research and investigative ability',
      'Persuasive communication',
      'Ability to grasp hidden meanings',
    ],
    coreExpressions: [
      'Thinking is intense and penetrating',
      'Need to understand what lies beneath',
      'Words carry power and impact',
    ],
    shadowExpressions: [
      'Obsessive thinking patterns',
      'Suspicion or paranoia',
      'Manipulative communication',
      'Difficulty with light conversation',
    ],
    thematicTags: ['perception', 'vigilance', 'control-power'],
  },

  // COMBO 16: The Scattered Brilliance
  {
    id: 'scattered-brilliance',
    title: 'The Scattered Brilliance',
    patternType: 'aspect',
    planets: ['Mercury', 'Uranus'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition'],
    summary: 'Mercury-Uranus contacts electrify the mind with sudden insights and unconventional thinking. Ideas arrive in flashes, and the thinking style resists conventional patterns.',
    lightExpressions: [
      'Brilliant insights and breakthroughs',
      'Original thinking and problem-solving',
      'Quick mental processing',
      'Comfort with unconventional ideas',
    ],
    coreExpressions: [
      'Mind operates in non-linear ways',
      'Boredom with routine thinking',
      'Need for mental stimulation and novelty',
    ],
    shadowExpressions: [
      'Mental restlessness or anxiety',
      'Difficulty with sustained focus',
      'Nervousness and overthinking',
      'Contrarian for its own sake',
    ],
    thematicTags: ['perception', 'nervous-system', 'intuition'],
  },

  // COMBO 17: The Visionary Mind
  {
    id: 'visionary-mind',
    title: 'The Visionary Mind',
    patternType: 'aspect',
    planets: ['Mercury', 'Neptune'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition', 'Sextile', 'Trine'],
    summary: 'Mercury-Neptune contacts dissolve the boundaries of ordinary thinking. The mind accesses imagination, intuition, and subtle perceptions, but may struggle with precision and clarity.',
    lightExpressions: [
      'Poetic and artistic expression',
      'Intuitive knowing',
      'Ability to sense unspoken dynamics',
      'Creative imagination',
    ],
    coreExpressions: [
      'Thinking is impressionistic rather than linear',
      'Boundaries between thought and feeling are thin',
      'Receptive to atmospheres and moods',
    ],
    shadowExpressions: [
      'Mental fog or confusion',
      'Difficulty with facts and details',
      'Susceptibility to deception',
      'Escapism through fantasy',
    ],
    thematicTags: ['intuition', 'dissolution-sensitivity', 'perception'],
  },

  // ============== SUN PATTERNS ==============

  // COMBO 18: The Hidden Self
  {
    id: 'hidden-self',
    title: 'The Hidden Self',
    patternType: 'house-placement',
    planets: ['Sun'],
    house: 12,
    summary: 'Sun in the 12th house creates a private sense of identity. The self may feel hidden, diffuse, or connected to something larger than personal ego. Visibility can feel uncomfortable.',
    lightExpressions: [
      'Deep spiritual sensitivity',
      'Ability to work behind the scenes',
      'Compassion and service orientation',
      'Rich inner imaginative life',
    ],
    coreExpressions: [
      'Identity forms in solitude and reflection',
      'Sense of self can feel elusive',
      'Connection to the collective or transpersonal',
    ],
    shadowExpressions: [
      'Difficulty claiming personal power',
      'Self-sabotage or invisibility',
      'Confusion about identity',
      'Fear of visibility or recognition',
    ],
    thematicTags: ['dissolution-sensitivity', 'intuition', 'emotional-boundaries'],
  },

  // COMBO 19: The Transformative Identity
  {
    id: 'transformative-identity',
    title: 'The Transformative Identity',
    patternType: 'aspect',
    planets: ['Sun', 'Pluto'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition'],
    summary: 'Sun-Pluto contacts create intensity around identity and self-expression. The sense of self undergoes cycles of death and rebirth, with themes of power, control, and transformation.',
    lightExpressions: [
      'Powerful presence and charisma',
      'Capacity for personal transformation',
      'Depth of character and self-awareness',
      'Ability to influence and inspire',
    ],
    coreExpressions: [
      'Identity is forged through crisis',
      'Strong will and determination',
      'Themes of power in self-expression',
    ],
    shadowExpressions: [
      'Control issues around identity',
      'Power struggles in self-expression',
      'Fear of vulnerability or exposure',
      'Compulsive need to transform',
    ],
    thematicTags: ['control-power', 'inheritance-patterns', 'vigilance'],
  },

  // COMBO 20: The Unconventional Self
  {
    id: 'unconventional-self',
    title: 'The Unconventional Self',
    patternType: 'aspect',
    planets: ['Sun', 'Uranus'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition'],
    summary: 'Sun-Uranus contacts create an identity that resists convention. There is a strong need to be authentic and unique, even if it means standing apart from the crowd.',
    lightExpressions: [
      'Authentic self-expression',
      'Innovative and original personality',
      'Independence and freedom',
      'Comfort being different',
    ],
    coreExpressions: [
      'Identity forms against expectations',
      'Strong need for personal freedom',
      'Discomfort with conformity',
    ],
    shadowExpressions: [
      'Chronic outsider feeling',
      'Rebellion for its own sake',
      'Difficulty with intimacy or closeness',
      'Destabilized sense of self',
    ],
    thematicTags: ['perception', 'emotional-boundaries', 'nervous-system'],
  },

  // COMBO 21: The Burdened Self
  {
    id: 'burdened-self',
    title: 'The Burdened Self',
    patternType: 'aspect',
    planets: ['Sun', 'Saturn'],
    aspectTypes: ['Conjunction', 'Square', 'Opposition'],
    summary: 'Sun-Saturn contacts create seriousness around identity. The sense of self develops through effort, responsibility, and often early challenges. Self-worth may feel like something to be earned.',
    lightExpressions: [
      'Strong sense of responsibility',
      'Mature self-discipline',
      'Reliable and trustworthy character',
      'Achievement through sustained effort',
    ],
    coreExpressions: [
      'Identity shaped by challenges',
      'Self-worth tied to accomplishment',
      'Serious approach to self-expression',
    ],
    shadowExpressions: [
      'Chronic self-doubt or criticism',
      'Fear of failure or inadequacy',
      'Difficulty feeling "good enough"',
      'Suppressed vitality or joy',
    ],
    thematicTags: ['responsibility', 'attachment', 'emotional-regulation'],
  },

  // ============== ADDITIONAL HOUSE PLACEMENTS ==============

  // COMBO 22: The Public Emotional Self
  {
    id: 'public-emotional-self',
    title: 'The Public Emotional Self',
    patternType: 'house-placement',
    planets: ['Moon'],
    house: 10,
    summary: 'Moon in the 10th house places emotional needs in the public arena. There is a need to be seen, recognized, and perhaps nurtured by the world, while personal feelings are on display.',
    lightExpressions: [
      'Emotional intelligence in career',
      'Nurturing public presence',
      'Ability to connect emotionally with audiences',
      'Career that fulfills emotional needs',
    ],
    coreExpressions: [
      'Emotions tied to reputation and status',
      'Public life and private feelings intertwined',
      'Need for recognition and validation',
    ],
    shadowExpressions: [
      'Emotional vulnerability in public',
      'Fluctuating public image',
      'Difficulty separating work and personal life',
      'Fear of public judgment',
    ],
    thematicTags: ['attachment', 'emotional-boundaries', 'responsibility'],
  },

  // COMBO 23: The Relational Healer
  {
    id: 'relational-healer',
    title: 'The Relational Healer',
    patternType: 'house-placement',
    planets: ['Chiron'],
    house: 7,
    summary: 'Chiron in the 7th house places wounds and healing in the realm of partnership. Relationships become the arena for both vulnerability and wisdom about connection.',
    lightExpressions: [
      'Deep empathy for partners',
      'Wisdom about relationship dynamics',
      'Ability to help others heal in partnership',
      'Authentic relating despite wounds',
    ],
    coreExpressions: [
      'Relationships touch core wounds',
      'Learning about self through partnership',
      'Healing through connection',
    ],
    shadowExpressions: [
      'Repeated painful relationship patterns',
      'Fear of commitment or partnership',
      'Attracting partners who need healing',
      'Difficulty receiving support in relationships',
    ],
    thematicTags: ['attachment', 'inheritance-patterns', 'emotional-boundaries'],
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