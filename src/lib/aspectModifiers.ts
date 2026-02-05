/**
 * Aspect Modifiers for Planet-Planet Combinations
 * 
 * This module provides aspect-specific interpretations that modify the universal
 * energy of planet-planet combinations. Each planet pair has a core signature,
 * and the aspect determines HOW that energy manifests.
 */

export interface LearningStyle {
  name: string;
  bestMethods: string[];
  avoid: string[];
  designNote: string;
}

export interface AspectModifier {
  aspectType: 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition';
  symbol: string;
  name: string;
  tone: string; // The signature/feel of this aspect
  description: string;
  gifts: string[];
  challenges: string[];
  learningStyle?: LearningStyle; // Optional learning style for educational aspects
}

export interface PlanetPairAspects {
  planet1: string;
  planet2: string;
  coreSignature: string; // Universal energy regardless of aspect
  coreDescription: string;
  universalLearningTraits?: string[]; // Universal learning traits for this combo
  aspects: AspectModifier[];
}

// Symbol lookup
export const ASPECT_SYMBOLS: Record<string, string> = {
  'Conjunction': '☌',
  'Sextile': '⚹',
  'Square': '□',
  'Trine': '△',
  'Opposition': '☍',
};

/**
 * Mercury-Neptune: The Symbol Reader
 */
const MERCURY_NEPTUNE: PlanetPairAspects = {
  planet1: 'Mercury',
  planet2: 'Neptune',
  coreSignature: 'The Symbol Reader',
  coreDescription: 'Mercury + Neptune = thinking in images, metaphors, vibes, and impressions. This combination processes language non-linearly, thinking in symbols, feelings, and pattern clouds. Meaning is translated before words. Porous to tone, mood, myth, music, and subtext. Linked to dyslexia/atypical reading paths, poetry, music, astrology, tarot, and visual thinking. Intuitive "knowing" without being able to explain how.',
  universalLearningTraits: [
    'Learns top-down, not step-by-step',
    'Needs context before details',
    'Thrives with imagery, story, music, metaphor',
    'Struggles with rote memorization or phonics-first teaching',
    'Processes: Meaning → pattern → words (not the other way around)'
  ],
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Channel',
      tone: '"I don\'t think — I receive."',
      description: 'This is the purest form of the signature. Mind and imagination are fused. Words arrive as images, dreams, or symbols. Can feel psychic without calling it that. Boundaries between thought and intuition dissolve.',
      gifts: [
        'Pure channeling ability',
        'Words arrive as complete visions',
        'Natural medium or intuitive',
        'Inspired creative expression'
      ],
      challenges: [
        'Confusion and overwhelm',
        'Losing the thread of logic',
        'Difficulty with linear instruction',
        'Rigid language systems feel foreign'
      ],
      learningStyle: {
        name: 'Immersive Learning',
        bestMethods: [
          'Audio and guided imagery',
          'Storytelling and narrative',
          'Learning by being inside the material',
          'Vibes over outlines'
        ],
        avoid: [
          'Cold instruction manuals',
          'Over-structuring too early',
          'Phonics-first approaches'
        ],
        designNote: 'Use "enter the experience" language. Let them feel it before naming it.'
      }
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Static',
      tone: '"I see everything at once and then have to translate it."',
      description: 'Very strong symbol processing, but with friction. Mind wants clarity; Neptune dissolves it. High likelihood of early confusion around language or learning. Incredible creative potential once structure is learned. The aspect most associated with dyslexia—not because of lack of intelligence, but because the brain processes meaning before letters and phonetic systems feel backwards.',
      gifts: [
        'Profound creative potential',
        'Sees the whole before the parts',
        'Genius through integration',
        'Becomes bridge between worlds'
      ],
      challenges: [
        'Early confusion around language',
        'Friction between logic and intuition',
        'Meaning arrives faster than words',
        'Must build structure to channel gifts'
      ],
      learningStyle: {
        name: 'Gestalt Learning',
        bestMethods: [
          'Big-picture first, details later',
          'Color-coding and diagrams',
          'Mind maps and visual organizers',
          'Repetition with variation'
        ],
        avoid: [
          'Phonics-only or linear drills',
          '"Just follow these steps" teaching',
          'Sequential instruction without context'
        ],
        designNote: 'Offer reassurance: confusion ≠ failure. The fog is part of the process.'
      }
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Mirror',
      tone: '"I understand meaning through relationship."',
      description: 'Meaning shows up through others. Projection in communication. Misunderstandings early in life. Strong storyteller, listener, counselor, interpreter of symbols. Often develops extraordinary discernment later because they have to.',
      gifts: [
        'Extraordinary discernment develops over time',
        'Natural storyteller and counselor',
        'Interprets symbols through dialogue',
        'Sees others\' meaning clearly'
      ],
      challenges: [
        'Projects meaning onto others',
        'Misunderstandings in early life',
        'Communication feels like a mirror',
        'Must learn to own their own knowing'
      ],
      learningStyle: {
        name: 'Dialogic Learning',
        bestMethods: [
          'Discussion and teaching others',
          'Socratic questioning',
          'Reflective journaling',
          'Study groups and verbal processing'
        ],
        avoid: [
          'Isolated, silent learning environments',
          'Learning in complete solitude',
          'No-feedback situations'
        ],
        designNote: 'Build "talk it out" or "mirror back" prompts. They learn by hearing it reflected.'
      }
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Fluent Poet',
      tone: '"Meaning flows."',
      description: 'This is the smoothest version. Symbolic thinking with less confusion. Natural poetic, musical, or spiritual language. Often reads and writes beautifully, but still thinks visually. Less likely to experience dyslexia—more likely to be lyrical, imaginative, and subtle in expression.',
      gifts: [
        'Fluent in symbolic language',
        'Lyrical, imaginative expression',
        'Natural poet or musician',
        'Subtle, refined communication'
      ],
      challenges: [
        'May take gifts for granted',
        'Could avoid developing structure',
        'Needs activation to fully use',
        'Can drift without focus'
      ],
      learningStyle: {
        name: 'Creative Flow Learning',
        bestMethods: [
          'Writing, music, and art integration',
          'Gentle structure with creative freedom',
          'Learning through beauty and aesthetics',
          'Poetic or musical mnemonics'
        ],
        avoid: [
          'Excessive rigidity or time pressure',
          'Purely functional instruction',
          'Stripping beauty from learning'
        ],
        designNote: 'Let elegance be the teacher. They absorb what feels beautiful.'
      }
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Translator',
      tone: '"I can move between worlds."',
      description: 'A supportive but optional channel. Can switch between linear and symbolic modes. Often drawn to metaphysical or artistic language. Needs intention to activate fully. Has the gift of translation—moving between practical and intuitive realms.',
      gifts: [
        'Bridges logical and intuitive',
        'Conscious access to symbolic language',
        'Drawn to metaphysical studies',
        'Can "turn on" the gift at will'
      ],
      challenges: [
        'Requires intention to activate',
        'May not naturally develop gift',
        'Can stay in either mode too long',
        'Needs practice to master translation'
      ],
      learningStyle: {
        name: 'Bilingual Learning',
        bestMethods: [
          'Switching modes: logic ↔ intuition',
          'Translating concepts into images',
          'Applying knowledge creatively',
          'Multi-modal instruction'
        ],
        avoid: [
          'Staying only in one mode',
          'Purely linear OR purely intuitive approaches',
          'Neglecting either hemisphere'
        ],
        designNote: 'Offer "translate this" or "reframe symbolically" exercises. They thrive on switching.'
      }
    }
  ]
};

/**
 * Sun-Moon: The Lights
 */
const SUN_MOON: PlanetPairAspects = {
  planet1: 'Sun',
  planet2: 'Moon',
  coreSignature: 'The Inner Marriage',
  coreDescription: 'Sun + Moon = the relationship between conscious will and emotional needs. This aspect shows how well the inner masculine and feminine, day self and night self, ego and soul work together. Fundamental to feeling at home in one\'s own skin.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Unified Self',
      tone: '"What I want and what I need are the same."',
      description: 'New Moon birth—identity and emotions are fused. Strong sense of self but may lack objectivity. What you feel IS who you are. Can be intensely focused but may struggle to see other perspectives.',
      gifts: [
        'Strong sense of identity',
        'Unified purpose and emotion',
        'Natural self-knowledge',
        'Clear personal direction'
      ],
      challenges: [
        'Difficulty with objectivity',
        'Blind spots about self',
        'May not understand others\' duality',
        'Can be self-focused'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Inner Tension',
      tone: '"What I want fights with what I need."',
      description: 'Quarter Moon birth—internal friction between ego and emotional needs. Early life may show conflict between parents. Creates drive and ambition through working to integrate opposing inner forces.',
      gifts: [
        'Drive from internal tension',
        'Ambition and achievement',
        'Growth through integration',
        'Develops strong willpower'
      ],
      challenges: [
        'Inner conflict and stress',
        'Parents may have been at odds',
        'Push-pull between head and heart',
        'Must consciously work on integration'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Full Illumination',
      tone: '"I see myself through others."',
      description: 'Full Moon birth—maximum objectivity about self. Strong awareness of inner masculine/feminine dynamics. May project parts of self onto partners. Relationships are the mirror for self-understanding.',
      gifts: [
        'Strong self-awareness',
        'Understands relationship dynamics',
        'Balanced perspective',
        'Can see all sides'
      ],
      challenges: [
        'May project onto partners',
        'Relationships can feel polarized',
        'Others reflect inner conflict',
        'Can over-rely on external validation'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Easy Flow',
      tone: '"I feel comfortable being myself."',
      description: 'Harmonious integration of will and emotion. Natural self-acceptance. May take inner peace for granted. Usually indicates supportive early home environment.',
      gifts: [
        'Natural self-acceptance',
        'Inner harmony',
        'Comfortable in own skin',
        'Supportive early life'
      ],
      challenges: [
        'May lack drive from friction',
        'Could take ease for granted',
        'Less motivated by internal tension',
        'May not develop through struggle'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Cooperative Self',
      tone: '"I can align what I want with what I need."',
      description: 'Opportunity for integration that requires conscious effort. Can develop strong self-understanding through intentional work. Early life provides building blocks for self-acceptance.',
      gifts: [
        'Ability to integrate consciously',
        'Builds self-understanding over time',
        'Adaptive and flexible',
        'Can harmonize different parts of self'
      ],
      challenges: [
        'Requires effort to activate',
        'Easy to coast without developing',
        'May not naturally introspect',
        'Integration is a skill to build'
      ]
    }
  ]
};

/**
 * Venus-Mars: The Lovers
 */
const VENUS_MARS: PlanetPairAspects = {
  planet1: 'Venus',
  planet2: 'Mars',
  coreSignature: 'The Passionate Heart',
  coreDescription: 'Venus + Mars = the dance between attraction and desire, receptivity and pursuit, feminine and masculine within. This combination governs romantic style, creative passion, and how actively or passively we pursue what we value.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Unified Desire',
      tone: '"What I want and what I attract are one."',
      description: 'Powerful romantic and creative magnetism. Attracts through confidence. Unites receptive and assertive energies into one force. High creative and sexual energy. May struggle with impulse control in love.',
      gifts: [
        'Magnetic romantic presence',
        'Strong creative drive',
        'Unified masculine/feminine energy',
        'Attracts through authenticity'
      ],
      challenges: [
        'Impulsive in love',
        'Quick attraction, quick boredom',
        'May confuse love and lust',
        'Difficulty with patience in romance'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Friction of Desire',
      tone: '"I fight for love."',
      description: 'Tension between what you want and how you pursue it. Passionate but may create conflict in relationships. Strong creative drive born from inner friction. Learns to balance assertion with reception.',
      gifts: [
        'Passionate creative drive',
        'Fights for what they value',
        'Dynamic relationship energy',
        'Grows through romantic challenges'
      ],
      challenges: [
        'Creates conflict in love',
        'Push-pull dynamics',
        'Aggressive pursuit or withdrawal',
        'Must learn balance'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Attraction-Pursuit Dance',
      tone: '"I attract what I chase, I chase what attracts me."',
      description: 'Projects either Venus or Mars onto partners. May attract aggressive types or pursue unavailable loves. Through relationships, learns to own both receptive and assertive sides.',
      gifts: [
        'Strong relationship magnetism',
        'Learns balance through others',
        'Aware of attraction dynamics',
        'Can develop healthy partnerships'
      ],
      challenges: [
        'Projects desire onto partners',
        'May attract inappropriate types',
        'Relationships feel polarized',
        'Must own both energies'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Easy Charm',
      tone: '"Love comes naturally."',
      description: 'Effortless integration of attraction and desire. Natural romantic ease. Creative expression flows. May not develop pursuit skills due to things coming easily.',
      gifts: [
        'Natural romantic charisma',
        'Effortless creative flow',
        'Balanced relationship approach',
        'Comfortable with desire'
      ],
      challenges: [
        'May take love for granted',
        'Doesn\'t develop pursuit skills',
        'Could coast on charm',
        'Less growth through challenge'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Opportunity for Passion',
      tone: '"When I try, love responds."',
      description: 'Potential for harmonious romantic and creative expression that needs activation. Can develop strong relationship skills with effort. Good balance between giving and taking.',
      gifts: [
        'Develops romantic skills',
        'Creative potential when activated',
        'Can balance pursuit and attraction',
        'Good relationship instincts'
      ],
      challenges: [
        'Must make effort in love',
        'Potential not automatic',
        'Could miss creative opportunities',
        'Needs intentional development'
      ]
    }
  ]
};

/**
 * Mercury-Uranus: The Genius
 */
const MERCURY_URANUS: PlanetPairAspects = {
  planet1: 'Mercury',
  planet2: 'Uranus',
  coreSignature: 'The Lightning Mind',
  coreDescription: 'Mercury + Uranus = rapid, non-linear thinking. The mind receives flashes of insight, downloads of information, and makes intuitive leaps others can\'t follow. Associated with ADHD patterns, genius, technological affinity, and unconventional communication.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Genius Channel',
      tone: '"Ideas arrive like lightning."',
      description: 'Pure fusion of mind and higher mind. Brilliant, original, electric thinking. May speak too fast or jump topics. Technical or scientific aptitude. Nervous system runs hot.',
      gifts: [
        'Brilliant original insights',
        'Lightning-fast connections',
        'Technical genius',
        'Ahead of the times'
      ],
      challenges: [
        'Nervous system overload',
        'Difficulty with slow thinkers',
        'Jumps topics mid-sentence',
        'May seem eccentric or scattered'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Disruptive Thinker',
      tone: '"My mind won\'t stay in the box."',
      description: 'Strong innovative capacity with friction. Mind rebels against conventional learning. Often associated with ADHD—not deficit, but different operating system. Needs freedom to learn in non-linear ways.',
      gifts: [
        'Breaks through mental barriers',
        'Innovative problem-solving',
        'Cannot be mentally confined',
        'Sees what others miss'
      ],
      challenges: [
        'Attention that resists structure',
        'May seem oppositional',
        'Frustration with conventional learning',
        'Nervous tension and restlessness'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Idea Exchanger',
      tone: '"Others awaken my genius."',
      description: 'Brilliant insights through dialogue and debate. May project genius onto others or attract unusual thinkers. Needs intellectual stimulation from relationships.',
      gifts: [
        'Ideas spark through conversation',
        'Attracts brilliant minds',
        'Awakens others\' genius',
        'Develops through dialogue'
      ],
      challenges: [
        'May dismiss own brilliance',
        'Needs others to think clearly',
        'Can be mentally contrarian',
        'Debates for the sake of it'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Innovator',
      tone: '"Original thinking flows easily."',
      description: 'Effortless access to innovative ideas. Natural aptitude for technology and future thinking. Creative problem-solving feels natural. May not recognize own uniqueness.',
      gifts: [
        'Effortless original thinking',
        'Natural with technology',
        'Comfortable being different',
        'Ideas flow without effort'
      ],
      challenges: [
        'May take genius for granted',
        'Could be mentally lazy',
        'Not challenged to develop',
        'Ideas may stay unrealized'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Innovation Potential',
      tone: '"I can access genius when I choose."',
      description: 'Opportunity for original thinking that needs cultivation. Can develop innovative skills with practice. Good at connecting ideas from different fields.',
      gifts: [
        'Can develop genius',
        'Bridges different fields',
        'Learns unconventionally well',
        'Activated innovation'
      ],
      challenges: [
        'Must practice original thinking',
        'Genius not automatic',
        'Could settle for conventional',
        'Needs stimulating environment'
      ]
    }
  ]
};

/**
 * Moon-Pluto: The Depth Seeker
 */
const MOON_PLUTO: PlanetPairAspects = {
  planet1: 'Moon',
  planet2: 'Pluto',
  coreSignature: 'The Emotional Phoenix',
  coreDescription: 'Moon + Pluto = emotional intensity, transformation through feeling, and psychological depth. This combination experiences emotions at the extremes. Often indicates early experiences that forced emotional survival. Grants access to the unconscious and capacity for profound healing—of self and others.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Intensity',
      tone: '"I feel everything to the bone."',
      description: 'Emotions and transformation are fused. Experiences feelings at extremes. May have had intense early relationship with mother. Powerful emotional presence that others feel immediately. Natural healer or depth psychologist.',
      gifts: [
        'Profound emotional depth',
        'Natural healer',
        'Transformative presence',
        'Cannot be emotionally fooled'
      ],
      challenges: [
        'Overwhelming emotional intensity',
        'May have had intense mother',
        'Power dynamics in close relationships',
        'Must learn emotional regulation'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Emotional Crucible',
      tone: '"I transform through emotional crisis."',
      description: 'Friction between emotional needs and survival instincts. Early life may have required emotional survival skills. Creates powerful psychological understanding through struggle. Eventually becomes source of wisdom.',
      gifts: [
        'Forged through emotional fire',
        'Deep psychological wisdom',
        'Resilience and survival capacity',
        'Transforms others through understanding'
      ],
      challenges: [
        'Early emotional crisis',
        'Power struggles in family',
        'May control or be controlled',
        'Trust issues requiring healing'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Emotional Mirror',
      tone: '"Others bring my depths to the surface."',
      description: 'Emotional intensity projected onto or triggered by others. Relationships are the catalyst for transformation. May attract powerful or controlling partners. Through partnership, learns to own emotional power.',
      gifts: [
        'Relationships are transformative',
        'Attracts deep partners',
        'Grows through intimacy',
        'Learns to own power through others'
      ],
      challenges: [
        'May attract controlling types',
        'Projects intensity onto partners',
        'Power dynamics in relationship',
        'Must own emotional depths'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Depth',
      tone: '"Deep feelings come naturally."',
      description: 'Easy access to emotional depths. Natural psychological understanding. Feels the undercurrents without being overwhelmed. May not recognize intensity as unusual.',
      gifts: [
        'Natural depth without drama',
        'Easy psychological insight',
        'Emotional resilience',
        'Comfortable with shadows'
      ],
      challenges: [
        'May take depth for granted',
        'Could avoid necessary intensity',
        'Doesn\'t develop through struggle',
        'Depth can become comfortable rut'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Transformative Opportunity',
      tone: '"I can access depth when I choose."',
      description: 'Potential for emotional transformation that needs activation. Can develop healing abilities with intention. Good at supporting others through crisis when called.',
      gifts: [
        'Can access depth consciously',
        'Develops healing skills',
        'Supportive in crisis',
        'Transforms when needed'
      ],
      challenges: [
        'Depth requires intention',
        'May avoid transformation',
        'Could stay on surface',
        'Needs practice with intensity'
      ]
    }
  ]
};

/**
 * Sun-Saturn: The Authority
 */
const SUN_SATURN: PlanetPairAspects = {
  planet1: 'Sun',
  planet2: 'Saturn',
  coreSignature: 'The Responsible Self',
  coreDescription: 'Sun + Saturn = identity shaped by responsibility, limitation, and the need to prove worth. This combination takes life seriously. Often indicates demanding or absent father figures. Eventually develops authority, discipline, and lasting achievement.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Old Soul',
      tone: '"I was born responsible."',
      description: 'Identity and responsibility are fused. Often felt adult from childhood. May have carried family burdens early. Takes time to learn to play. Becomes true authority figure later in life.',
      gifts: [
        'Natural authority',
        'Takes responsibility seriously',
        'Builds lasting structures',
        'Wisdom beyond years'
      ],
      challenges: [
        'Difficulty relaxing or playing',
        'May have felt burdened early',
        'Self-worth tied to achievement',
        'Harsh inner critic'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Proving Ground',
      tone: '"I must prove my worth."',
      description: 'Friction between self-expression and authority figures. May have had demanding or critical father. Creates drive to succeed through overcoming obstacles. Eventually masters what once limited.',
      gifts: [
        'Drive to prove self',
        'Overcomes obstacles',
        'Builds through adversity',
        'Eventually masters limitations'
      ],
      challenges: [
        'Critical father or authority',
        'Self-doubt and fear of failure',
        'May work too hard',
        'Rigid expectations of self'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Authority Projection',
      tone: '"I see authority in others."',
      description: 'Projects authority or limitation onto others. May attract demanding partners or bosses. Through relationships, learns to own inner authority and set healthy limits.',
      gifts: [
        'Learns authority through others',
        'Develops clear boundaries',
        'Grows into leadership',
        'Understands power dynamics'
      ],
      challenges: [
        'Attracts demanding figures',
        'May feel limited by others',
        'Projects father onto partners',
        'Must own inner authority'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Authority',
      tone: '"Responsibility comes easily."',
      description: 'Easy integration of identity and responsibility. Natural maturity and discipline. May take authority for granted. Usually had supportive father figure.',
      gifts: [
        'Natural discipline',
        'Easy authority',
        'Supportive father influence',
        'Comfortable with responsibility'
      ],
      challenges: [
        'May not develop through struggle',
        'Could take position for granted',
        'Less drive from friction',
        'Authority can become rigidity'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Building Authority',
      tone: '"I can develop discipline."',
      description: 'Opportunity to develop mature self-expression. Can build authority with effort. Good at working within structures when chosen.',
      gifts: [
        'Can develop discipline',
        'Builds authority over time',
        'Works well within structure',
        'Grows in responsibility'
      ],
      challenges: [
        'Authority requires effort',
        'May avoid responsibility',
        'Needs conscious discipline',
        'Could stay in comfort zone'
      ]
    }
  ]
};

/**
 * Venus-Neptune: The Romantic Mystic
 */
const VENUS_NEPTUNE: PlanetPairAspects = {
  planet1: 'Venus',
  planet2: 'Neptune',
  coreSignature: 'The Divine Lover',
  coreDescription: 'Venus + Neptune = love as spiritual experience. Beauty, art, and romance carry transcendent quality. This combination seeks ideal love and may idealize partners. Exceptional artistic gifts, especially music. Can confuse human and divine love.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Romantic Poet',
      tone: '"Love is my religion."',
      description: 'Love and spirituality are fused. Exceptional artistic and musical gifts. May idealize partners to the point of delusion. Experiences beauty as transcendent. Needs to learn human love has limits.',
      gifts: [
        'Exceptional artistic gifts',
        'Experiences divine in beauty',
        'Deep romantic capacity',
        'Musical or visual genius'
      ],
      challenges: [
        'Idealizes partners',
        'Confusion about love',
        'May escape into fantasy',
        'Boundaries in relationship unclear'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Romantic Struggle',
      tone: '"I long for love that doesn\'t exist."',
      description: 'Friction between real and ideal love. May fall for unavailable or inappropriate partners. Artistic gifts emerge through struggle. Eventually learns to ground spiritual ideals in human relationship.',
      gifts: [
        'Artistic depth from longing',
        'Learns discernment in love',
        'Creates from romantic struggle',
        'Eventually grounds the ideal'
      ],
      challenges: [
        'Attracted to unavailable',
        'Romantic disappointment',
        'Confusion about boundaries',
        'May escape through substances or fantasy'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Romantic Mirror',
      tone: '"I see the divine in my beloved."',
      description: 'Projects spiritual ideals onto partners. May attract artists, healers, or addicts. Through relationship, learns to own artistic and spiritual nature.',
      gifts: [
        'Sees beauty in others',
        'Attracts artistic types',
        'Learns spirituality through love',
        'Develops discrimination'
      ],
      challenges: [
        'Projects ideal onto partner',
        'May attract escapists or victims',
        'Romantic disillusionment',
        'Must own own spirituality'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Effortless Artist',
      tone: '"Beauty flows through me."',
      description: 'Natural artistic and romantic gifts. Experiences love as naturally spiritual. May not recognize talent as unusual. Less prone to romantic confusion than other aspects.',
      gifts: [
        'Effortless artistic expression',
        'Natural romantic grace',
        'Beauty without struggle',
        'Spiritual love comes easily'
      ],
      challenges: [
        'May not develop gifts fully',
        'Could take beauty for granted',
        'Less depth from struggle',
        'Artistic potential unrealized'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Artist',
      tone: '"I can access the muse when I try."',
      description: 'Artistic and romantic gifts that need cultivation. Can develop spiritual approach to love and beauty with practice. Good at bringing inspiration into form.',
      gifts: [
        'Can develop artistic gifts',
        'Learns spiritual love',
        'Brings inspiration to form',
        'Grows romantic capacity'
      ],
      challenges: [
        'Gifts need cultivation',
        'May not naturally create',
        'Could settle for ordinary',
        'Requires intentional practice'
      ]
    }
  ]
};

/**
 * Mars-Pluto: The Powerhouse
 */
const MARS_PLUTO: PlanetPairAspects = {
  planet1: 'Mars',
  planet2: 'Pluto',
  coreSignature: 'The Unstoppable Force',
  coreDescription: 'Mars + Pluto = extreme drive, power, and intensity. This combination is either unstoppable or self-destructive. Deep reserves of energy. Issues around power, control, and survival. Can transform through will or become dominated by rage. The most powerful aspect for manifestation—must be used consciously.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Power Fusion',
      tone: '"I cannot be stopped."',
      description: 'Action and power are fused. Extraordinary drive and determination. May have experienced violence or power struggles. Can accomplish the impossible. Must develop conscious relationship with aggression.',
      gifts: [
        'Unstoppable when focused',
        'Accomplishes the impossible',
        'Transforms through action',
        'Extraordinary willpower'
      ],
      challenges: [
        'Rage and destruction potential',
        'May have experienced violence',
        'Power struggles in relationships',
        'Must master aggression'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Power Struggle',
      tone: '"I fight against control."',
      description: 'Friction between will and power. May have battled authority or experienced abuse. Creates tremendous drive through struggle. Eventually masters own power after difficult lessons.',
      gifts: [
        'Forged through power struggles',
        'Cannot be dominated',
        'Develops iron will',
        'Eventually masters power'
      ],
      challenges: [
        'Battles with authority',
        'May have experienced abuse',
        'Control issues',
        'Explosive anger potential'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Power Mirror',
      tone: '"I attract powerful people."',
      description: 'Power dynamics play out through others. May attract dominating partners or become the controller. Through relationship struggles, learns to own and balance personal power.',
      gifts: [
        'Learns power through others',
        'Develops balanced strength',
        'Grows from conflict',
        'Eventually owns power'
      ],
      challenges: [
        'Attracts controlling types',
        'May become the controller',
        'Power dynamics in love',
        'Must own strength'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Power',
      tone: '"Strength comes naturally."',
      description: 'Easy access to power and drive. Natural leader and transformer. May not recognize own intensity. Can accomplish through flow rather than force.',
      gifts: [
        'Natural power and drive',
        'Leadership through ease',
        'Transforms without drama',
        'Comfortable with intensity'
      ],
      challenges: [
        'May take power for granted',
        'Could become complacent',
        'Less growth through struggle',
        'Intensity can seem normal'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Activated Power',
      tone: '"I can access power when needed."',
      description: 'Power and drive available when intentionally activated. Can develop leadership abilities. Good at focused bursts of transformative action.',
      gifts: [
        'Can access power at will',
        'Develops leadership',
        'Focused transformation',
        'Power when needed'
      ],
      challenges: [
        'Power requires activation',
        'May avoid intensity',
        'Could stay comfortable',
        'Needs challenge to develop'
      ]
    }
  ]
};

/**
 * Jupiter-Saturn: The Builder
 */
const JUPITER_SATURN: PlanetPairAspects = {
  planet1: 'Jupiter',
  planet2: 'Saturn',
  coreSignature: 'The Grounded Visionary',
  coreDescription: 'Jupiter + Saturn = the balance between expansion and contraction, optimism and realism, vision and structure. This combination builds lasting things. The "great social planets" together show capacity to create enduring structures that benefit many.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Master Builder',
      tone: '"I build what lasts."',
      description: 'Expansion and structure are fused. Creates enduring institutions and legacies. Balance of vision and practicality. Born during major social shift (these conjunctions mark generational turning points).',
      gifts: [
        'Builds lasting structures',
        'Balances vision and reality',
        'Creates enduring work',
        'Social architect'
      ],
      challenges: [
        'Tension between growth and limits',
        'May feel stuck or blocked',
        'Must find rhythm of expansion/contraction',
        'Born during social instability'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Vision-Reality Tension',
      tone: '"I struggle between dreams and reality."',
      description: 'Friction between optimism and realism. May alternate between overreach and restriction. Creates through the struggle to balance hope with hard work.',
      gifts: [
        'Forged through balancing dreams and reality',
        'Develops practical wisdom',
        'Learns sustainable growth',
        'Eventually masters manifestation'
      ],
      challenges: [
        'Alternates between inflation and depression',
        'May overcommit then restrict',
        'Tension between faith and fear',
        'Must learn right timing'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Balance Point',
      tone: '"I see both sides of every expansion."',
      description: 'Full awareness of growth and limits. May project either optimism or pessimism onto others. Through relationships and career, learns to integrate vision with structure.',
      gifts: [
        'Sees both expansion and limits',
        'Learns balance through others',
        'Develops measured optimism',
        'Understands cycles'
      ],
      challenges: [
        'May project onto others',
        'Partners seem too optimistic or pessimistic',
        'Career reflects inner tension',
        'Must integrate both within'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Builder',
      tone: '"Growth and structure flow together."',
      description: 'Easy integration of expansion and limitation. Natural business sense. Knows when to grow and when to consolidate. May not recognize gift for timing.',
      gifts: [
        'Natural timing for growth',
        'Easy manifestation',
        'Business instincts',
        'Balanced ambition'
      ],
      challenges: [
        'May take success for granted',
        'Could avoid necessary challenges',
        'Less learning from struggle',
        'Natural gifts undeveloped'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Strategic Grower',
      tone: '"I can learn to balance vision and reality."',
      description: 'Opportunity to develop manifestation skills. Can learn to balance expansion and contraction with practice. Good at strategic planning when intentional.',
      gifts: [
        'Can develop timing',
        'Learns manifestation',
        'Strategic when activated',
        'Grows capacity for balance'
      ],
      challenges: [
        'Skills require development',
        'May not naturally balance',
        'Could avoid strategic thinking',
        'Needs practice to master'
      ]
    }
  ]
};

/**
 * Moon-Neptune: The Psychic Channel
 */
const MOON_NEPTUNE: PlanetPairAspects = {
  planet1: 'Moon',
  planet2: 'Neptune',
  coreSignature: 'The Emotional Mystic',
  coreDescription: 'Moon + Neptune = emotional sensitivity extended into spiritual realms. This combination feels everything—including what isn\'t said, what\'s in the room, what\'s in the collective. Psychic, artistic, and compassionate, but must learn boundaries or drowns in feeling.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Mystic Child',
      tone: '"I feel the invisible world."',
      description: 'Emotions and spiritual sensitivity are fused. One of the strongest indicators for psychic ability. May have had confusing or absent mother. Highly artistic and empathic but needs strong boundaries.',
      gifts: [
        'Natural psychic ability',
        'Exceptional empathy',
        'Artistic and musical gifts',
        'Feels the collective'
      ],
      challenges: [
        'Mother may have been absent or confusing',
        'Boundaries easily dissolved',
        'Can absorb others\' emotions',
        'Escapism tendencies'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Emotional Confusion',
      tone: '"I struggle to know what I truly feel."',
      description: 'Friction between emotions and intuition. May have had deceptive or addicted mother. Creates deep empathy through struggle. Eventually learns to distinguish own feelings from others\'.',
      gifts: [
        'Develops deep discernment',
        'Empathy forged through confusion',
        'Learns emotional boundaries',
        'Grows into psychic clarity'
      ],
      challenges: [
        'Confusion about feelings',
        'May have experienced deception',
        'Escapism under stress',
        'Takes time to trust intuition'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Empathic Mirror',
      tone: '"I feel what others feel."',
      description: 'Projects emotional or spiritual nature onto others. May attract artists, healers, or addicts as partners. Through relationships, learns to own psychic gifts and establish boundaries.',
      gifts: [
        'Strong empathic attunement',
        'Attracts spiritual types',
        'Learns discernment through others',
        'Develops protective boundaries'
      ],
      challenges: [
        'May attract troubled partners',
        'Projects sensitivity onto others',
        'Relationship confusion',
        'Must own psychic nature'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Empath',
      tone: '"Psychic feelings come easily."',
      description: 'Easy access to emotional and psychic realms. Natural empathy without overwhelm. May not recognize intuitive gifts as unusual. Comfortable in spiritual environments.',
      gifts: [
        'Natural psychic sensitivity',
        'Empathy without drowning',
        'Comfortable with subtle realms',
        'Effortless spiritual awareness'
      ],
      challenges: [
        'May not develop gifts consciously',
        'Could take intuition for granted',
        'Less growth through struggle',
        'Gifts may remain unconscious'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Psychic',
      tone: '"I can access intuition when I try."',
      description: 'Potential for empathic and psychic gifts that need cultivation. Can develop spiritual awareness through practice. Good at tuning in when intentional.',
      gifts: [
        'Can develop intuition',
        'Learns psychic skills',
        'Grows empathic capacity',
        'Activated spiritual awareness'
      ],
      challenges: [
        'Gifts require development',
        'May not naturally intuit',
        'Could stay on surface',
        'Needs spiritual practice'
      ]
    }
  ]
};

/**
 * Venus-Saturn: The Serious Heart
 */
const VENUS_SATURN: PlanetPairAspects = {
  planet1: 'Venus',
  planet2: 'Saturn',
  coreSignature: 'The Committed Lover',
  coreDescription: 'Venus + Saturn = love that takes time, commitment, and maturity. This combination delays gratification in love but builds lasting bonds. May experience early rejection or limitation around love, beauty, or money. Eventually develops deep loyalty and enduring relationships.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Devoted One',
      tone: '"Love is serious business."',
      description: 'Love and responsibility are fused. Takes relationships extremely seriously. May have felt unloved or unworthy early in life. Develops deep capacity for commitment. Often attracts or is attracted to older partners.',
      gifts: [
        'Profound loyalty and commitment',
        'Love that endures time',
        'Values quality over quantity',
        'Builds lasting partnerships'
      ],
      challenges: [
        'May feel unlovable',
        'Early experiences of rejection',
        'Difficulty expressing affection',
        'Fear of intimacy or vulnerability'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Love Lesson',
      tone: '"I must earn love."',
      description: 'Friction between desire for love and fear of rejection. May have experienced coldness from parents. Creates depth through romantic struggle. Eventually learns self-worth is not dependent on others\' approval.',
      gifts: [
        'Develops self-worth through struggle',
        'Learns to love unconditionally',
        'Builds character through rejection',
        'Eventually becomes deeply loyal partner'
      ],
      challenges: [
        'Fear of rejection creates walls',
        'May choose unavailable partners',
        'Self-worth tied to relationships',
        'Can become cold or withholding'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Relationship Mirror',
      tone: '"Partners teach me about commitment."',
      description: 'Projects either coldness or neediness onto partners. May attract older, more serious, or unavailable partners. Through relationships, learns to balance affection with appropriate boundaries.',
      gifts: [
        'Learns commitment through others',
        'Develops healthy boundaries',
        'Grows into mature love',
        'Understands relationship dynamics'
      ],
      challenges: [
        'Attracts cold or distant partners',
        'May project own fears onto beloved',
        'Relationships feel like tests',
        'Must own capacity for commitment'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Loyalist',
      tone: '"Commitment comes easily."',
      description: 'Easy integration of love and responsibility. Natural maturity in relationships. May not struggle with commitment the way others do. Values substance over surface.',
      gifts: [
        'Natural relationship maturity',
        'Easy commitment',
        'Stable love nature',
        'Values depth in relationships'
      ],
      challenges: [
        'May take loyalty for granted',
        'Could become too serious',
        'Less growth through romantic struggle',
        'Comfort can become routine'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Commitment',
      tone: '"I can learn to build lasting love."',
      description: 'Opportunity to develop mature love that needs conscious effort. Can build lasting relationships with practice. Good at practical aspects of partnership.',
      gifts: [
        'Can develop commitment skills',
        'Learns relationship maturity',
        'Practical approach to love',
        'Grows loyalty over time'
      ],
      challenges: [
        'Commitment requires effort',
        'May avoid depth initially',
        'Could settle for convenience',
        'Needs conscious relationship work'
      ]
    }
  ]
};

/**
 * Mars-Neptune: The Spiritual Warrior
 */
const MARS_NEPTUNE: PlanetPairAspects = {
  planet1: 'Mars',
  planet2: 'Neptune',
  coreSignature: 'The Inspired Actor',
  coreDescription: 'Mars + Neptune = action guided by vision, imagination, or spiritual purpose. This combination can be the artist, the healer, the spiritual warrior—or the escapist who can\'t follow through. Drive is tied to dreams. When aligned, accomplishes the impossible through inspiration. When misaligned, energy dissipates into fantasy.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Dream Warrior',
      tone: '"I act on inspiration."',
      description: 'Action and imagination are fused. Can accomplish seemingly impossible things when inspired. May struggle with consistent energy or clear direction. Exceptional for artists, healers, and spiritual practitioners.',
      gifts: [
        'Action guided by vision',
        'Artistic and healing abilities',
        'Fights for the underdog',
        'Inspired creative drive'
      ],
      challenges: [
        'Energy fluctuates mysteriously',
        'May lack clear direction',
        'Escapism through action or inaction',
        'Confusion about what you really want'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Frustrated Idealist',
      tone: '"My dreams and my actions don\'t align."',
      description: 'Friction between what you want and what you imagine. May start projects that never finish. Creates depth through struggle to align vision with action. Eventually learns to ground inspiration in practical steps.',
      gifts: [
        'Learns to ground visions',
        'Develops discernment about action',
        'Creates through frustration',
        'Eventually bridges dream and reality'
      ],
      challenges: [
        'Starts but doesn\'t finish',
        'Energy leaks into fantasy',
        'May feel victimized or weak',
        'Addiction or escapism potential'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Action Mirror',
      tone: '"Others inspire or drain my energy."',
      description: 'Projects either the warrior or the victim onto others. May attract charismatic but unreliable partners. Through relationships, learns to own inspired action and set boundaries.',
      gifts: [
        'Learns action through others',
        'Develops inspired boundaries',
        'Grows through collaboration',
        'Understands motivation dynamics'
      ],
      challenges: [
        'May attract energy vampires',
        'Projects weakness onto others',
        'Confused about own desires',
        'Must own inner warrior'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Healer',
      tone: '"Inspired action flows naturally."',
      description: 'Easy access to inspired action. Natural healer or artist. Energy flows when connected to meaningful purpose. May not recognize gift as unusual.',
      gifts: [
        'Natural healing presence',
        'Effortless inspired action',
        'Creative flow states',
        'Compassionate strength'
      ],
      challenges: [
        'May take gifts for granted',
        'Could avoid necessary conflict',
        'Less clarity from struggle',
        'Gifts may remain passive'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Visionary',
      tone: '"I can learn to act on inspiration."',
      description: 'Opportunity for inspired action that needs cultivation. Can develop healing or artistic abilities with practice. Good at occasional acts of inspired service.',
      gifts: [
        'Can develop inspired action',
        'Learns healing abilities',
        'Grows visionary capacity',
        'Activated compassion'
      ],
      challenges: [
        'Inspiration requires activation',
        'May not naturally flow',
        'Could stay practical only',
        'Needs spiritual practice'
      ]
    }
  ]
};

/**
 * Sun-Uranus: The Individualist
 */
const SUN_URANUS: PlanetPairAspects = {
  planet1: 'Sun',
  planet2: 'Uranus',
  coreSignature: 'The Awakener',
  coreDescription: 'Sun + Uranus = identity that demands freedom and authenticity. This combination cannot conform. The self is linked to originality, rebellion, and sudden changes. May have had disrupted relationship with father or experienced sudden life changes. Becomes the agent of awakening for others.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Revolutionary Self',
      tone: '"I am here to break the mold."',
      description: 'Identity and freedom are fused. Cannot be conventional. May have experienced sudden disruptions or unusual father. Natural innovator who awakens others. Lives on the edge of the new.',
      gifts: [
        'Powerfully original',
        'Awakens others naturally',
        'Pioneering vision',
        'Authentic no matter the cost'
      ],
      challenges: [
        'Cannot commit to convention',
        'Disruptive life changes',
        'May have had absent or unusual father',
        'Difficulty with stability'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Inner Rebel',
      tone: '"I fight for my right to be different."',
      description: 'Friction between identity and need for freedom. May rebel against self or authority. Creates breakthroughs through tension. Eventually integrates individuality with functional life.',
      gifts: [
        'Breakthroughs through tension',
        'Cannot be suppressed',
        'Develops resilient individuality',
        'Eventually owns uniqueness'
      ],
      challenges: [
        'Self-sabotage through rebellion',
        'Nervous system tension',
        'Fights authority reflexively',
        'Disrupts own success'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Freedom Mirror',
      tone: '"Others awaken or disrupt me."',
      description: 'Projects originality or chaos onto others. May attract unusual or unstable partners. Through relationships, learns to own inner genius and need for independence.',
      gifts: [
        'Learns freedom through others',
        'Develops balanced independence',
        'Grows through relationship disruption',
        'Understands awakening dynamics'
      ],
      challenges: [
        'Attracts unstable partners',
        'Projects genius onto others',
        'Relationships disrupt identity',
        'Must own inner revolutionary'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Original',
      tone: '"Being different comes easily."',
      description: 'Easy access to originality. Natural innovator without the drama. Comfortable being different. May not recognize uniqueness as unusual.',
      gifts: [
        'Effortless originality',
        'Natural innovator',
        'Comfortable with change',
        'Unique without trying'
      ],
      challenges: [
        'May take genius for granted',
        'Could avoid necessary stability',
        'Less growth through disruption',
        'Originality can become superficial'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Innovator',
      tone: '"I can learn to embrace my uniqueness."',
      description: 'Opportunity for originality that needs activation. Can develop innovative abilities with practice. Good at occasional acts of breakthrough.',
      gifts: [
        'Can develop uniqueness',
        'Learns innovation skills',
        'Grows individuality consciously',
        'Activated originality'
      ],
      challenges: [
        'Genius requires activation',
        'May default to convention',
        'Could avoid necessary change',
        'Needs stimulating environment'
      ]
    }
  ]
};

/**
 * Mercury-Saturn: The Serious Mind
 */
const MERCURY_SATURN: PlanetPairAspects = {
  planet1: 'Mercury',
  planet2: 'Saturn',
  coreSignature: 'The Disciplined Thinker',
  coreDescription: 'Mercury + Saturn = the mind shaped by structure, limitation, and the need for authority. This combination thinks carefully and speaks with weight. May have experienced early criticism or learning difficulties. Eventually becomes the expert, the author, the respected voice.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Authority Mind',
      tone: '"My words carry weight."',
      description: 'Thinking and responsibility are fused. Takes communication seriously. May have felt stupid or been criticized early. Develops authoritative expertise over time.',
      gifts: [
        'Authoritative communication',
        'Disciplined thinking',
        'Becomes respected expert',
        'Words carry lasting weight'
      ],
      challenges: [
        'Fear of speaking or writing',
        'May have felt intellectually inadequate',
        'Worry and negative thinking',
        'Harsh inner critic'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Mental Struggle',
      tone: '"I must prove my intelligence."',
      description: 'Friction between thoughts and self-doubt. May have experienced learning challenges or criticism. Creates depth through mental struggle. Eventually becomes the one who teaches what was hardest to learn.',
      gifts: [
        'Teaches what was hard to learn',
        'Develops mental discipline',
        'Builds expertise through struggle',
        'Eventually trusted authority'
      ],
      challenges: [
        'Learning difficulties possible',
        'Speech anxiety or blocks',
        'Negative thought patterns',
        'Harsh self-criticism'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Communication Mirror',
      tone: '"Others judge or validate my thinking."',
      description: 'Projects intellectual authority onto others. May attract critical or knowledgeable partners. Through relationships, learns to own mental authority.',
      gifts: [
        'Learns authority through dialogue',
        'Develops balanced confidence',
        'Grows through intellectual exchange',
        'Understands communication dynamics'
      ],
      challenges: [
        'May feel intellectually inferior',
        'Attracts critical partners',
        'Projects authority onto others',
        'Must own inner expert'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Scholar',
      tone: '"Structured thinking comes easily."',
      description: 'Easy access to disciplined thought. Natural student and teacher. Mental organization comes naturally. May not recognize gift for serious thinking.',
      gifts: [
        'Natural mental discipline',
        'Easy learning and teaching',
        'Comfortable with complexity',
        'Authoritative without effort'
      ],
      challenges: [
        'May take intellect for granted',
        'Could become too serious',
        'Less growth through mental struggle',
        'Discipline can become rigidity'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Authority',
      tone: '"I can build mental discipline."',
      description: 'Opportunity for structured thinking that needs cultivation. Can develop expertise with practice. Good at focused study when motivated.',
      gifts: [
        'Can develop expertise',
        'Learns mental discipline',
        'Grows authority over time',
        'Activated scholarship'
      ],
      challenges: [
        'Discipline requires effort',
        'May avoid serious study',
        'Could stay superficial',
        'Needs structured environment'
      ]
    }
  ]
};

/**
 * Sun-Neptune: The Mystic Identity
 */
const SUN_NEPTUNE: PlanetPairAspects = {
  planet1: 'Sun',
  planet2: 'Neptune',
  coreSignature: 'The Dreamer',
  coreDescription: 'Sun + Neptune = identity infused with imagination, spirituality, and longing. This combination may struggle to know who they truly are, but has exceptional capacity for compassion, artistry, and spiritual connection. Often associated with absent or idealized fathers. Becomes the artist, healer, or mystic.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Mystic Self',
      tone: '"I am connected to something greater."',
      description: 'Identity and spirituality are fused. May have difficulty with ego boundaries. Exceptional artistic and spiritual sensitivity. Often had absent, addicted, or idealized father.',
      gifts: [
        'Deep spiritual connection',
        'Exceptional artistic gifts',
        'Compassionate presence',
        'Channels higher inspiration'
      ],
      challenges: [
        'Unclear sense of self',
        'Father absent or idealized',
        'Escapism and addiction potential',
        'Difficulty with practical life'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Identity Confusion',
      tone: '"I struggle to know who I am."',
      description: 'Friction between ego and dissolution. May feel lost or undefined. Creates depth through spiritual struggle. Eventually finds identity through surrendering the need for fixed identity.',
      gifts: [
        'Develops through spiritual crisis',
        'Learns ego flexibility',
        'Creates from confusion',
        'Eventually finds transcendent identity'
      ],
      challenges: [
        'Identity confusion and crisis',
        'Deception or self-deception',
        'May feel like a fraud',
        'Escapism under stress'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Spiritual Mirror',
      tone: '"Others reflect my spirituality or confusion."',
      description: 'Projects spiritual nature onto others. May attract artists, healers, or lost souls. Through relationships, learns to own inner mystic.',
      gifts: [
        'Learns spirituality through others',
        'Develops discernment',
        'Grows through relationship mirrors',
        'Understands projection'
      ],
      challenges: [
        'Attracts confusing partners',
        'May be deceived by others',
        'Projects idealism onto beloved',
        'Must own inner mystic'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Mystic',
      tone: '"Spiritual connection comes easily."',
      description: 'Easy access to spiritual and artistic realms. Natural compassion without overwhelm. May not recognize gifts as unusual.',
      gifts: [
        'Effortless spiritual connection',
        'Natural artistic gifts',
        'Comfortable with mystery',
        'Compassionate without losing self'
      ],
      challenges: [
        'May take gifts for granted',
        'Could avoid necessary definition',
        'Less growth through struggle',
        'Gifts may remain unconscious'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Mystic',
      tone: '"I can learn to trust my spiritual nature."',
      description: 'Opportunity for spiritual and artistic development that needs cultivation. Can develop intuitive abilities with practice.',
      gifts: [
        'Can develop spiritual gifts',
        'Learns artistic expression',
        'Grows intuitive capacity',
        'Activated imagination'
      ],
      challenges: [
        'Gifts require development',
        'May stay too practical',
        'Could avoid spiritual path',
        'Needs creative practice'
      ]
    }
  ]
};

/**
 * Mars-Saturn: The Disciplined Warrior
 */
const MARS_SATURN: PlanetPairAspects = {
  planet1: 'Mars',
  planet2: 'Saturn',
  coreSignature: 'The Controlled Force',
  coreDescription: 'Mars + Saturn = action that is controlled, disciplined, and often delayed. This combination builds endurance and persistence. May experience frustration, blocked anger, or conflict with authority. Eventually develops iron will and lasting achievement.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Iron Will',
      tone: '"I achieve through persistence."',
      description: 'Action and discipline are fused. Exceptional endurance and determination. May suppress anger or face authority conflicts. Accomplishes through sheer persistence.',
      gifts: [
        'Iron determination',
        'Exceptional endurance',
        'Controlled strength',
        'Achieves long-term goals'
      ],
      challenges: [
        'Suppressed anger',
        'Conflict with authority',
        'May feel blocked or frustrated',
        'Cold or harsh expression'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Frustrated Will',
      tone: '"I fight against limitation."',
      description: 'Friction between desire and restriction. May experience blocked action or anger issues. Creates strength through frustration. Eventually learns to channel force productively.',
      gifts: [
        'Builds strength through resistance',
        'Cannot be stopped when determined',
        'Develops exceptional discipline',
        'Eventually channels force wisely'
      ],
      challenges: [
        'Anger and frustration issues',
        'May feel constantly blocked',
        'Conflict with authority figures',
        'Physical tension and stress'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Authority Conflict',
      tone: '"Others block or challenge my will."',
      description: 'Projects either aggression or limitation onto others. May attract controlling partners or battles with authority. Through conflict, learns to own inner discipline.',
      gifts: [
        'Learns discipline through others',
        'Develops balanced assertion',
        'Grows through conflict',
        'Understands power dynamics'
      ],
      challenges: [
        'Attracts controlling figures',
        'Battles with authority',
        'Projects anger onto others',
        'Must own inner discipline'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Disciplinarian',
      tone: '"Controlled action comes easily."',
      description: 'Easy integration of action and discipline. Natural endurance. Accomplishes without excessive friction. May not recognize gift for controlled force.',
      gifts: [
        'Natural discipline in action',
        'Easy endurance',
        'Comfortable with hard work',
        'Achieves without drama'
      ],
      challenges: [
        'May take discipline for granted',
        'Could become rigid',
        'Less growth through friction',
        'Discipline can become cold'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Discipline',
      tone: '"I can learn to channel my force."',
      description: 'Opportunity for disciplined action that needs cultivation. Can develop endurance and persistence with practice.',
      gifts: [
        'Can develop discipline',
        'Learns controlled action',
        'Grows persistence',
        'Activated endurance'
      ],
      challenges: [
        'Discipline requires effort',
        'May avoid hard work',
        'Could stay impulsive',
        'Needs structured challenges'
      ]
    }
  ]
};

/**
 * Jupiter-Uranus: The Breakthrough
 */
const JUPITER_URANUS: PlanetPairAspects = {
  planet1: 'Jupiter',
  planet2: 'Uranus',
  coreSignature: 'The Lucky Rebel',
  coreDescription: 'Jupiter + Uranus = expansion through breakthrough and innovation. This combination brings sudden luck, unexpected opportunities, and liberation. Cannot be contained by convention. Often experiences dramatic reversals of fortune—both up and down.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Breakthrough Moment',
      tone: '"I am here for the breakthrough."',
      description: 'Expansion and liberation are fused. Born during times of major collective breakthrough. Experiences sudden luck and opportunities. Natural innovator and freedom-seeker.',
      gifts: [
        'Sudden luck and opportunity',
        'Natural innovator',
        'Born during breakthrough times',
        'Cannot be contained'
      ],
      challenges: [
        'Restless and never satisfied',
        'Over-promises liberation',
        'May not follow through',
        'Luck can reverse suddenly'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Restless Expansion',
      tone: '"I fight for freedom to grow."',
      description: 'Friction between expansion and liberation. May experience sudden ups and downs. Creates breakthroughs through tension. Eventually learns to stabilize innovation.',
      gifts: [
        'Breakthroughs through tension',
        'Cannot be suppressed',
        'Develops resilient optimism',
        'Eventually grounds innovation'
      ],
      challenges: [
        'Wild fluctuations in fortune',
        'Restless and scattered',
        'Over-extends then crashes',
        'Difficulty with stability'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Freedom-Growth Balance',
      tone: '"Others bring breakthrough or chaos."',
      description: 'Projects either expansion or liberation onto others. May attract adventurous but unreliable partners. Through relationships, learns to balance growth with stability.',
      gifts: [
        'Learns balance through others',
        'Develops grounded freedom',
        'Grows through partnership adventures',
        'Understands breakthrough dynamics'
      ],
      challenges: [
        'Attracts unreliable types',
        'Projects restlessness onto others',
        'Relationships disrupt growth',
        'Must own inner innovator'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Lucky Rebel',
      tone: '"Breakthrough comes easily."',
      description: 'Easy access to sudden opportunity. Natural innovator without the chaos. Lucky in unconventional pursuits.',
      gifts: [
        'Effortless breakthrough',
        'Lucky in innovation',
        'Comfortable with change',
        'Natural rebel with results'
      ],
      challenges: [
        'May take luck for granted',
        'Could avoid necessary commitment',
        'Less growth through struggle',
        'Luck can create complacency'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Innovator',
      tone: '"I can learn to create breakthrough."',
      description: 'Opportunity for breakthrough that needs activation. Can develop innovative abilities with practice.',
      gifts: [
        'Can develop breakthrough skills',
        'Learns to innovate',
        'Grows through calculated risks',
        'Activated luck'
      ],
      challenges: [
        'Luck requires activation',
        'May default to safety',
        'Could avoid necessary risks',
        'Needs stimulating environment'
      ]
    }
  ]
};

/**
 * Venus-Pluto: The Obsessive Heart
 */
const VENUS_PLUTO: PlanetPairAspects = {
  planet1: 'Venus',
  planet2: 'Pluto',
  coreSignature: 'The Transformative Lover',
  coreDescription: 'Venus + Pluto = love that transforms, obsesses, and regenerates. This combination experiences love at extremes—passionate, possessive, healing, or destructive. Relationships serve as vehicles for profound transformation. May have experienced early loss or betrayal in love.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Magnetic Heart',
      tone: '"Love transforms me utterly."',
      description: 'Love and transformation are fused. Powerfully magnetic. Experiences intense, all-consuming attractions. May have experienced betrayal or loss. Loves heal or destroy—no middle ground.',
      gifts: [
        'Profoundly transformative love',
        'Magnetic attraction',
        'Heals through intimacy',
        'Intensity creates depth'
      ],
      challenges: [
        'Obsessive attachments',
        'May have experienced betrayal',
        'Jealousy and possession',
        'All-or-nothing in love'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Love Crisis',
      tone: '"Love brings me to my knees."',
      description: 'Friction between love and power. Relationships trigger deep transformation. May experience painful endings that lead to rebirth. Eventually learns healthy intimacy through crisis.',
      gifts: [
        'Transformed through love\'s fire',
        'Develops authentic intimacy',
        'Cannot do superficial love',
        'Eventually becomes powerful healer'
      ],
      challenges: [
        'Painful relationship patterns',
        'Jealousy and power struggles',
        'May attract or become controlling',
        'Trust issues in love'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Intensity Mirror',
      tone: '"Partners transform or destroy me."',
      description: 'Projects intensity or obsession onto partners. May attract powerful, controlling, or transformative lovers. Through relationships, learns to own inner power.',
      gifts: [
        'Transformed through partnership',
        'Develops balanced power in love',
        'Grows through intense relating',
        'Understands intimacy dynamics'
      ],
      challenges: [
        'Attracts controlling partners',
        'Power dynamics in relationships',
        'Projects obsession onto others',
        'Must own inner intensity'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Transformer',
      tone: '"Deep love comes naturally."',
      description: 'Easy access to transformative love. Natural depth in relationships without the drama. Comfortable with intimacy and intensity.',
      gifts: [
        'Natural depth in love',
        'Easy intimacy',
        'Comfortable with intensity',
        'Transforms without crisis'
      ],
      challenges: [
        'May take depth for granted',
        'Could avoid necessary growth',
        'Less transformation through struggle',
        'Intensity can become comfortable rut'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Depth',
      tone: '"I can learn to love deeply."',
      description: 'Opportunity for transformative love that needs cultivation. Can develop depth and intimacy with practice.',
      gifts: [
        'Can develop love\'s depth',
        'Learns transformative intimacy',
        'Grows through conscious relating',
        'Activated passion'
      ],
      challenges: [
        'Depth requires effort',
        'May stay on surface',
        'Could avoid intensity',
        'Needs committed practice'
      ]
    }
  ]
};

/**
 * Jupiter-Neptune: The Visionary Faith
 */
const JUPITER_NEPTUNE: PlanetPairAspects = {
  planet1: 'Jupiter',
  planet2: 'Neptune',
  coreSignature: 'The Spiritual Expansion',
  coreDescription: 'Jupiter + Neptune = faith and imagination combined. This combination dreams big and believes deeply. May struggle with discernment between inspiration and delusion. Exceptional for spiritual teachers, artists, and visionaries. Can achieve the impossible through faith—or lose everything through misplaced trust.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Infinite Dreamer',
      tone: '"I believe in the impossible."',
      description: 'Faith and imagination are fused. Born during times of collective spiritual awakening. Exceptional visionary capacity. May struggle to distinguish hope from delusion.',
      gifts: [
        'Infinite imagination',
        'Profound spiritual faith',
        'Visionary capacity',
        'Believes miracles into being'
      ],
      challenges: [
        'May believe anything',
        'Lack of discernment',
        'Over-idealistic promises',
        'Can be deceived or deceive'
      ]
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Faith Crisis',
      tone: '"My beliefs are tested by reality."',
      description: 'Friction between hope and confusion. May experience spiritual crisis or disillusionment. Creates wisdom through spiritual struggle. Eventually develops discerning faith.',
      gifts: [
        'Wisdom through spiritual testing',
        'Develops discerning faith',
        'Learns from disappointment',
        'Eventually becomes grounded mystic'
      ],
      challenges: [
        'Spiritual confusion',
        'Over-promises and under-delivers',
        'May be victim of spiritual fraud',
        'Faith tested repeatedly'
      ]
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Belief Mirror',
      tone: '"Others reflect my faith or confusion."',
      description: 'Projects spiritual nature onto others. May attract inspiring or deluded partners. Through relationships, develops balanced faith.',
      gifts: [
        'Learns spirituality through others',
        'Develops balanced belief',
        'Grows through shared vision',
        'Understands faith dynamics'
      ],
      challenges: [
        'Attracts spiritual charlatans',
        'Projects idealism onto partners',
        'May enable others\' delusions',
        'Must own inner visionary'
      ]
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Visionary',
      tone: '"Faith and imagination flow together."',
      description: 'Easy access to spiritual vision. Natural faith without excessive confusion. Comfortable with the unseen.',
      gifts: [
        'Effortless spiritual vision',
        'Natural faith',
        'Comfortable with mystery',
        'Inspires without overwhelming'
      ],
      challenges: [
        'May take faith for granted',
        'Could avoid discernment',
        'Less wisdom from spiritual struggle',
        'Vision can remain unfocused'
      ]
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Visionary',
      tone: '"I can learn to trust my vision."',
      description: 'Opportunity for spiritual development that needs cultivation. Can develop visionary abilities with practice.',
      gifts: [
        'Can develop spiritual vision',
        'Learns balanced faith',
        'Grows intuitive capacity',
        'Activated imagination'
      ],
      challenges: [
        'Vision requires development',
        'May stay too practical',
        'Could avoid spiritual path',
        'Needs faith practice'
      ]
    }
  ]
};

// ============== COLLECTION ==============

/**
 * Moon-Saturn: The Weight of Feeling
 */
const MOON_SATURN: PlanetPairAspects = {
  planet1: 'Moon',
  planet2: 'Saturn',
  coreSignature: 'The Weight of Feeling',
  coreDescription: 'Moon + Saturn = emotional seriousness and responsibility. Feelings are real but often experienced as something to manage, contain, or earn rather than freely express. Early emotional conditioning plays a lasting role.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Stoic Heart',
      tone: '"Feelings are facts to be managed."',
      description: 'Emotions and responsibility are fused. Natural emotional maturity but may have felt old as a child. Capacity to hold others emotionally. Security comes from structure and reliability.',
      gifts: ['Deep emotional maturity', 'Reliable and loyal', 'Natural counselor', 'Emotional endurance'],
      challenges: ['Emotional inhibition', 'Difficulty with vulnerability', 'May feel emotionally alone', 'Self-denial patterns']
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Inner Critic',
      tone: '"I fight to feel worthy of love."',
      description: 'Friction between emotional needs and sense of duty. May have experienced cold or critical early environment. Develops strength through emotional challenges. Must learn self-compassion.',
      gifts: ['Builds emotional resilience', 'Develops through hardship', 'Strong inner discipline', 'Earns self-respect'],
      challenges: ['Inner critical voice', 'Fear of emotional rejection', 'Difficulty asking for support', 'May attract cold partners']
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Duty-Care Balance',
      tone: '"I see my emotional limits through others."',
      description: 'Projects either emotional neediness or cold authority onto partners. Relationships teach the balance between nurturing and responsibility. May attract parental figures or become one.',
      gifts: ['Learns balance through relationships', 'Understands authority dynamics', 'Develops healthy boundaries', 'Matures through partnership'],
      challenges: ['Attracts cold or critical partners', 'May parent partners', 'Relationships feel heavy', 'Must own both nurturing and authority']
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Grounded Heart',
      tone: '"Emotional security comes naturally."',
      description: 'Easy integration of feelings and responsibility. Natural emotional stability. Comfortable with commitment and long-term bonds. May take emotional steadiness for granted.',
      gifts: ['Natural emotional stability', 'Comfortable with commitment', 'Grounded and reliable', 'Healthy emotional boundaries'],
      challenges: ['May avoid emotional risks', 'Could become too cautious', 'Less growth through challenge', 'May settle for security over passion']
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Anchor',
      tone: '"I can learn to trust my emotional foundation."',
      description: 'Opportunity to build emotional security through conscious effort. Can develop healthy boundaries and self-discipline with practice.',
      gifts: ['Builds emotional security over time', 'Develops healthy structures', 'Learns from elders', 'Creates lasting bonds'],
      challenges: ['Requires effort to feel secure', 'May avoid emotional work', 'Stability needs cultivation', 'Could miss grounding opportunities']
    }
  ]
};

/**
 * Moon-Uranus: Lunar Voltage
 */
const MOON_URANUS: PlanetPairAspects = {
  planet1: 'Moon',
  planet2: 'Uranus',
  coreSignature: 'Lunar Voltage',
  coreDescription: 'Moon + Uranus = a highly responsive emotional system. Feelings arrive suddenly, often without a clear narrative, and can shift just as quickly. Emotional awareness is instantaneous rather than linear. Needs freedom and space to process.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Electric Heart',
      tone: '"I feel everything at once."',
      description: 'Emotions and intuition are fused into one electric current. Highly sensitive to environments and unspoken dynamics. Needs unusual amount of emotional freedom. May have had unconventional early home life.',
      gifts: ['Rapid emotional insight', 'Strong intuitive flashes', 'Emotional originality', 'Comfortable with change'],
      challenges: ['Emotional nervousness', 'Difficulty settling', 'Sudden withdrawal when overwhelmed', 'Sleep or nervous system issues']
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Restless Heart',
      tone: '"My feelings want freedom but my needs want safety."',
      description: 'Friction between need for security and need for independence. Emotions can be erratic or surprising. May have experienced disruptions in early life. Learns to honor both stability and change.',
      gifts: ['Breakthrough emotional insights', 'Develops unique self-care', 'Learns emotional flexibility', 'Creates innovative support systems'],
      challenges: ['Emotional unpredictability', 'Relationship instability', 'Fight or flight responses', 'Difficulty with routine nurturing']
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Freedom-Security Dance',
      tone: '"Others awaken my emotional independence."',
      description: 'Projects either emotional neediness or detachment onto partners. Relationships teach the balance between closeness and space. May attract unconventional or unreliable partners until lesson is learned.',
      gifts: ['Learns freedom through relationship', 'Develops emotional independence', 'Understands attachment patterns', 'Grows through awakening partners'],
      challenges: ['Attracts emotionally unavailable types', 'Push-pull dynamics', 'Fear of engulfment', 'Must own need for both closeness and space']
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Intuitive Heart',
      tone: '"Emotional freedom comes naturally."',
      description: 'Easy integration of intuition and emotional needs. Natural comfort with change and unconventional feelings. Strong psychic or intuitive gifts. May take emotional flexibility for granted.',
      gifts: ['Natural intuitive gifts', 'Comfortable with change', 'Emotional originality flows', 'Adapts easily'],
      challenges: ['May avoid deep emotional work', 'Could be too detached', 'Takes intuition for granted', 'May not develop stability']
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Awakening Heart',
      tone: '"I can learn to trust my emotional insights."',
      description: 'Opportunity to develop intuitive emotional awareness with conscious effort. Can cultivate unique self-care practices and emotional independence.',
      gifts: ['Develops intuition over time', 'Learns emotional independence', 'Creates unique support systems', 'Grows through change'],
      challenges: ['Intuition needs development', 'May avoid emotional innovation', 'Requires effort to trust insights', 'Could stay too conventional']
    }
  ]
};

/**
 * Saturn-Uranus: The Revolutionary Structure
 */
const SATURN_URANUS: PlanetPairAspects = {
  planet1: 'Saturn',
  planet2: 'Uranus',
  coreSignature: 'The Revolutionary Structure',
  coreDescription: 'Saturn + Uranus = tension between tradition and innovation, old and new, structure and freedom. This combination must learn to honor both stability and change, building new structures that allow for evolution.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Architect of Change',
      tone: '"I build the new within the old."',
      description: 'Structure and revolution are fused. Natural ability to innovate within systems. May feel torn between tradition and progress. Generational marker for systemic change.',
      gifts: ['Builds lasting innovations', 'Bridges old and new', 'Practical revolutionary', 'Structural genius'],
      challenges: ['Internal tension between freedom and duty', 'May feel stuck between generations', 'Difficulty with pure tradition OR pure rebellion', 'Must integrate opposing forces']
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Tension of Progress',
      tone: '"The old and new fight within me."',
      description: 'Strong friction between need for security and need for change. Life may alternate between restriction and breakthrough. Develops strength through integrating opposing forces.',
      gifts: ['Powerful drive for meaningful change', 'Breaks through limitations', 'Develops innovative solutions', 'Learns from both stability and chaos'],
      challenges: ['Life feels like a series of upheavals', 'Authority conflicts', 'Difficulty with both tradition and rebellion', 'Must consciously integrate']
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Authority-Freedom Mirror',
      tone: '"Others reflect my relationship with rules."',
      description: 'Projects either rigid authority or chaotic rebellion onto others. Relationships teach the balance between structure and freedom. May attract controlling or unreliable partners.',
      gifts: ['Learns balance through relationships', 'Understands authority dynamics', 'Develops healthy autonomy', 'Grows through partnership challenges'],
      challenges: ['Attracts controlling or chaotic partners', 'Relationships test freedom vs commitment', 'May rebel against or submit to partners', 'Must own both inner authority and freedom']
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Innovator',
      tone: '"Change and stability work together for me."',
      description: 'Easy integration of tradition and innovation. Natural ability to update systems without destroying them. Comfortable with gradual evolution.',
      gifts: ['Effortless innovation', 'Updates tradition naturally', 'Comfortable with change', 'Bridges generations'],
      challenges: ['May not push hard enough for change', 'Could accept inadequate structures', 'Less drive from friction', 'May not fully develop either quality']
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Reformer',
      tone: '"I can learn to build better systems."',
      description: 'Opportunity to develop innovative approaches to structure with conscious effort. Can become skilled at reform and gradual change.',
      gifts: ['Develops reform skills', 'Learns to innovate within systems', 'Builds bridges between old and new', 'Grows through structured change'],
      challenges: ['Reform requires effort', 'May avoid either tradition or innovation', 'Needs conscious development', 'Could stay too comfortable']
    }
  ]
};

/**
 * Saturn-Pluto: The Power Structure
 */
const SATURN_PLUTO: PlanetPairAspects = {
  planet1: 'Saturn',
  planet2: 'Pluto',
  coreSignature: 'The Power Structure',
  coreDescription: 'Saturn + Pluto = confrontation with power, authority, and deep structural transformation. This combination deals with control, survival, and the complete rebuilding of foundations. Associated with generational trauma, institutional power, and phoenix-like rebirth.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Transformer',
      tone: '"I am forged in the fire of necessity."',
      description: 'Structure and transformation are fused. Natural ability to endure and rebuild. May carry ancestral or generational weight. Immense capacity for lasting change.',
      gifts: ['Immense endurance', 'Rebuilds from destruction', 'Natural authority', 'Transforms systems'],
      challenges: ['May carry heavy burdens', 'Control issues', 'Fear of powerlessness', 'Difficulty trusting']
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Power Struggle',
      tone: '"I fight for control of my own destiny."',
      description: 'Friction between need for security and forces of transformation. Life may involve power struggles with authority. Develops strength through confronting shadow.',
      gifts: ['Develops through crisis', 'Learns to reclaim power', 'Builds unshakeable foundations', 'Transforms through challenge'],
      challenges: ['Power struggles with authority', 'May attract controlling situations', 'Fear of losing control', 'Must learn healthy power use']
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Authority-Power Mirror',
      tone: '"Others reflect my relationship with power."',
      description: 'Projects either controlling authority or victimhood onto partners. Relationships teach the balance between power and surrender. May attract powerful or manipulative partners.',
      gifts: ['Learns power dynamics through relationship', 'Develops healthy authority', 'Understands shadow projection', 'Transforms through partnership'],
      challenges: ['Attracts controlling partners', 'Power struggles in relationships', 'May dominate or submit', 'Must own inner power']
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Authority',
      tone: '"Power and structure work together for me."',
      description: 'Easy integration of authority and transformation. Natural ability to navigate power dynamics. Comfortable with deep structural change.',
      gifts: ['Natural authority', 'Navigates power easily', 'Transforms without drama', 'Enduring strength'],
      challenges: ['May not question power enough', 'Could enable unhealthy structures', 'Less growth through crisis', 'May avoid necessary confrontation']
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Power',
      tone: '"I can learn to wield power wisely."',
      description: 'Opportunity to develop healthy relationship with power and authority with conscious effort. Can become skilled at deep structural transformation.',
      gifts: ['Develops healthy authority', 'Learns power dynamics', 'Builds transformative skills', 'Grows through structure'],
      challenges: ['Power requires development', 'May avoid transformation', 'Needs conscious effort', 'Could stay surface-level']
    }
  ]
};

/**
 * Sun-Pluto: The Phoenix Identity
 */
const SUN_PLUTO: PlanetPairAspects = {
  planet1: 'Sun',
  planet2: 'Pluto',
  coreSignature: 'The Phoenix Identity',
  coreDescription: 'Sun + Pluto = identity forged through transformation, crisis, and rebirth. The ego must die and be reborn multiple times. Associated with intensity, charisma, power dynamics, and the capacity to completely reinvent oneself.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Intense Self',
      tone: '"I am transformation itself."',
      description: 'Identity and transformation are fused. Magnetic, intense presence. May have experienced early crisis that shaped identity. Capacity for complete self-reinvention.',
      gifts: ['Magnetic charisma', 'Transformative presence', 'Natural depth', 'Regenerative power'],
      challenges: ['Intensity can overwhelm', 'Control issues with identity', 'May dominate without realizing', 'Fear of powerlessness']
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Crisis Identity',
      tone: '"I am forged through fire."',
      description: 'Friction between ego and forces of transformation. Life may involve power struggles and identity crises. Develops strength through confronting shadow aspects of self.',
      gifts: ['Develops through crisis', 'Builds unshakeable identity', 'Learns power through challenge', 'Transforms limitations'],
      challenges: ['Power struggles', 'Identity crises', 'May attract intense situations', 'Must integrate shadow']
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Power Mirror',
      tone: '"Others reflect my hidden power."',
      description: 'Projects intensity or power onto partners. Relationships involve transformation and power dynamics. May attract intense, controlling, or transformative partners.',
      gifts: ['Transforms through relationship', 'Develops power through others', 'Understands projection', 'Grows through intensity'],
      challenges: ['Attracts intense partners', 'Power struggles in relationships', 'May project shadow', 'Must own inner power']
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Depth',
      tone: '"Transformation comes naturally."',
      description: 'Easy integration of identity and transformative power. Natural charisma and depth. Comfortable with intensity and change.',
      gifts: ['Natural magnetism', 'Effortless depth', 'Comfortable with power', 'Transforms easily'],
      challenges: ['May not develop power consciously', 'Could take intensity for granted', 'Less growth through crisis', 'May avoid necessary struggle']
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Phoenix',
      tone: '"I can learn to rise from the ashes."',
      description: 'Opportunity to develop transformative power with conscious effort. Can cultivate depth, charisma, and regenerative capacity.',
      gifts: ['Develops transformative power', 'Learns to use intensity', 'Builds depth over time', 'Grows through conscious shadow work'],
      challenges: ['Transformation requires effort', 'May avoid intensity', 'Power needs cultivation', 'Could stay surface-level']
    }
  ]
};

/**
 * Mercury-Pluto: The Depth Thinker
 */
const MERCURY_PLUTO: PlanetPairAspects = {
  planet1: 'Mercury',
  planet2: 'Pluto',
  coreSignature: 'The Depth Thinker',
  coreDescription: 'Mercury + Pluto = mind that penetrates to the core. Thinking is investigative, obsessive, and transformative. Associated with research, psychology, detective work, and the capacity to uncover hidden truths.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Mind Detective',
      tone: '"I think in depths."',
      description: 'Mind and transformative power are fused. Natural investigator who uncovers hidden truths. Thoughts are intense and penetrating. May have experienced early mental pressure or secrets.',
      gifts: ['Penetrating insight', 'Natural researcher', 'Uncovers hidden truths', 'Transformative communication'],
      challenges: ['Obsessive thinking', 'Difficulty with light topics', 'May intimidate with intensity', 'Mental control issues']
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Mental Transformer',
      tone: '"My thoughts must go deep or nowhere."',
      description: 'Friction between surface communication and need for depth. May experience power struggles around ideas or information. Develops profound insight through mental challenges.',
      gifts: ['Develops profound insight', 'Transforms through understanding', 'Breaks through mental barriers', 'Powerful persuasion'],
      challenges: ['Mental power struggles', 'Obsessive thought patterns', 'Difficulty trusting information', 'May manipulate with words']
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Truth Mirror',
      tone: '"Others reveal what I hide from myself."',
      description: 'Projects mental intensity or hidden agendas onto others. Relationships teach about power dynamics in communication. May attract secretive or manipulative communicators.',
      gifts: ['Learns depth through dialogue', 'Develops truth-seeking', 'Understands hidden motivations', 'Transforms through conversation'],
      challenges: ['Projects mental intensity onto others', 'May attract manipulative communicators', 'Trust issues in communication', 'Must own inner detective']
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Investigator',
      tone: '"Deep thinking comes naturally."',
      description: 'Easy integration of mind and transformative depth. Natural researcher and psychologist. Comfortable with hidden or taboo subjects.',
      gifts: ['Natural depth of thought', 'Effortless investigation', 'Comfortable with taboo topics', 'Transforms easily through understanding'],
      challenges: ['May not develop insight consciously', 'Could take depth for granted', 'Less mental growth through challenge', 'May avoid necessary confrontation']
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Analyst',
      tone: '"I can learn to think with power."',
      description: 'Opportunity to develop penetrating insight with conscious effort. Can cultivate research skills, psychological understanding, and transformative communication.',
      gifts: ['Develops investigative skills', 'Learns psychological insight', 'Builds depth over time', 'Grows through mental challenges'],
      challenges: ['Depth requires effort', 'May avoid intense topics', 'Insight needs cultivation', 'Could stay surface-level']
    }
  ]
};

/**
 * Mercury-Mars: The Sharp Mind
 */
const MERCURY_MARS: PlanetPairAspects = {
  planet1: 'Mercury',
  planet2: 'Mars',
  coreSignature: 'The Sharp Mind',
  coreDescription: 'Mercury + Mars = quick, assertive, competitive thinking. The mind is sharp, direct, and action-oriented. Associated with debate, strategy, quick wit, and the capacity to think on one\'s feet.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Mental Warrior',
      tone: '"I think fast and speak direct."',
      description: 'Mind and action are fused. Thinks quickly and speaks directly. Natural debater and strategist. May speak before thinking.',
      gifts: ['Quick thinking', 'Direct communication', 'Strategic mind', 'Mental courage'],
      challenges: ['Speaks before thinking', 'Argumentative', 'Mental impatience', 'May wound with words']
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Mental Fighter',
      tone: '"My thoughts battle for expression."',
      description: 'Friction between thinking and acting. May experience conflict around communication. Develops sharp intellect through mental challenges.',
      gifts: ['Develops sharp wit', 'Learns strategic thinking', 'Builds mental courage', 'Fights for ideas'],
      challenges: ['Mental conflicts', 'Argumentative tendencies', 'Frustration in communication', 'Must learn diplomacy']
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Debate Mirror',
      tone: '"Others sharpen my thinking."',
      description: 'Projects mental aggression or sharpness onto others. Relationships involve intellectual sparring. May attract argumentative or direct communicators.',
      gifts: ['Learns through debate', 'Develops balanced assertion', 'Understands mental dynamics', 'Grows through intellectual challenge'],
      challenges: ['Attracts arguments', 'Relationships involve mental conflict', 'May project aggression', 'Must own inner warrior']
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Strategist',
      tone: '"Quick thinking comes naturally."',
      description: 'Easy integration of mind and action. Natural strategist and quick thinker. Comfortable with direct communication.',
      gifts: ['Natural quick wit', 'Effortless strategy', 'Comfortable with directness', 'Mental agility'],
      challenges: ['May not develop diplomacy', 'Could take sharpness for granted', 'Less growth through mental challenge', 'May avoid necessary patience']
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Strategist',
      tone: '"I can learn to think and act together."',
      description: 'Opportunity to develop quick thinking and strategic communication with conscious effort.',
      gifts: ['Develops strategic thinking', 'Learns assertive communication', 'Builds mental courage', 'Grows through action'],
      challenges: ['Sharpness requires development', 'May avoid directness', 'Strategy needs cultivation', 'Could stay too passive']
    }
  ]
};

/**
 * Mercury-Venus: The Charming Mind
 */
const MERCURY_VENUS: PlanetPairAspects = {
  planet1: 'Mercury',
  planet2: 'Venus',
  coreSignature: 'The Charming Mind',
  coreDescription: 'Mercury + Venus = thinking oriented toward harmony, beauty, and connection. The mind seeks balance, artistic expression, and pleasant communication. Associated with diplomacy, art, writing, and social grace.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Graceful Communicator',
      tone: '"I think in beauty."',
      description: 'Mind and aesthetic sense are fused. Natural charm in communication. Thinks about relationships, art, and harmony. May avoid conflict in communication.',
      gifts: ['Natural charm', 'Beautiful expression', 'Diplomatic thinking', 'Artistic mind'],
      challenges: ['May avoid difficult truths', 'Could prioritize pleasantness over honesty', 'Conflict avoidance', 'Surface-level communication']
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Harmony Seeker',
      tone: '"I struggle to balance truth and tact."',
      description: 'Friction between honest expression and desire for harmony. May experience tension in relationships around communication. Develops diplomatic skills through challenge.',
      gifts: ['Develops true diplomacy', 'Learns balanced communication', 'Builds social skills', 'Finds beauty through struggle'],
      challenges: ['Tension between truth and tact', 'Social anxiety', 'Difficulty with direct communication', 'Must learn authentic charm']
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Relationship Mirror',
      tone: '"Others teach me about connection."',
      description: 'Projects charm or social needs onto others. Relationships teach about balanced communication. May attract charming or superficial communicators.',
      gifts: ['Learns diplomacy through others', 'Develops relationship skills', 'Understands social dynamics', 'Grows through partnership'],
      challenges: ['Projects social needs', 'May attract superficial connections', 'Relationships involve communication lessons', 'Must own inner charm']
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Diplomat',
      tone: '"Charm comes naturally."',
      description: 'Easy integration of mind and social grace. Natural diplomat and artist. Comfortable with beautiful expression.',
      gifts: ['Natural social grace', 'Effortless charm', 'Artistic communication', 'Harmonious thinking'],
      challenges: ['May avoid depth', 'Could take charm for granted', 'Less growth through social challenge', 'May prioritize form over substance']
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Charmer',
      tone: '"I can learn to communicate with grace."',
      description: 'Opportunity to develop diplomatic and artistic communication with conscious effort.',
      gifts: ['Develops social skills', 'Learns artistic expression', 'Builds diplomatic capacity', 'Grows through connection'],
      challenges: ['Charm requires development', 'May avoid social situations', 'Grace needs cultivation', 'Could stay too blunt']
    }
  ]
};

/**
 * Sun-Mars: The Warrior Spirit
 */
const SUN_MARS: PlanetPairAspects = {
  planet1: 'Sun',
  planet2: 'Mars',
  coreSignature: 'The Warrior Spirit',
  coreDescription: 'Sun + Mars = identity fueled by action, courage, and assertion. The ego is active, competitive, and willing to fight for what it believes. Associated with leadership, athleticism, and the capacity to take initiative.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Natural Leader',
      tone: '"I am what I do."',
      description: 'Identity and action are fused. Natural leader who leads from the front. High energy and competitive drive. May struggle with patience or receiving.',
      gifts: ['Natural leadership', 'High energy', 'Courage and initiative', 'Competitive strength'],
      challenges: ['Impatience', 'May dominate without realizing', 'Difficulty receiving', 'Anger issues']
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Driven Identity',
      tone: '"I fight to become myself."',
      description: 'Friction between identity and assertion. May experience conflicts with male figures or authority. Develops strength and courage through challenges.',
      gifts: ['Develops through challenge', 'Builds courage', 'Learns healthy assertion', 'Grows stronger through conflict'],
      challenges: ['Conflicts with authority', 'May attract fights', 'Anger management', 'Must learn strategic action']
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Action Mirror',
      tone: '"Others reflect my warrior self."',
      description: 'Projects assertion or aggression onto others. Relationships involve competition or conflict. May attract aggressive or assertive partners.',
      gifts: ['Learns assertion through others', 'Develops balanced action', 'Understands competition', 'Grows through partnership challenge'],
      challenges: ['Attracts conflict', 'Competitive relationships', 'May project aggression', 'Must own inner warrior']
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Easy Warrior',
      tone: '"Action comes naturally."',
      description: 'Easy integration of identity and action. Natural confidence and initiative. Comfortable with competition and assertion.',
      gifts: ['Natural confidence', 'Effortless initiative', 'Comfortable with action', 'Easy leadership'],
      challenges: ['May not develop patience', 'Could take courage for granted', 'Less growth through conflict', 'May avoid necessary struggle']
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Warrior',
      tone: '"I can learn to act with courage."',
      description: 'Opportunity to develop leadership and assertive capacity with conscious effort.',
      gifts: ['Develops courage over time', 'Learns healthy assertion', 'Builds initiative', 'Grows through action'],
      challenges: ['Courage requires development', 'May avoid conflict', 'Assertion needs cultivation', 'Could stay too passive']
    }
  ]
};

/**
 * Sun-Venus: The Loving Heart
 */
const SUN_VENUS: PlanetPairAspects = {
  planet1: 'Sun',
  planet2: 'Venus',
  coreSignature: 'The Loving Heart',
  coreDescription: 'Sun + Venus = identity centered on love, beauty, and connection. The ego seeks harmony, appreciation, and aesthetic expression. Associated with charm, artistry, and the capacity to attract what one values.',
  aspects: [
    {
      aspectType: 'Conjunction',
      symbol: '☌',
      name: 'The Magnetic Self',
      tone: '"I am what I love."',
      description: 'Identity and values are fused. Natural charm and attractiveness. Draws what they value toward them. May over-identify with being loved or appreciated.',
      gifts: ['Natural magnetism', 'Strong sense of values', 'Artistic identity', 'Attracts what they value'],
      challenges: ['May need constant appreciation', 'Could be vain or superficial', 'Over-identifies with being loved', 'Difficulty with rejection']
    },
    {
      aspectType: 'Square',
      symbol: '□',
      name: 'The Value Struggle',
      tone: '"I fight for what I love."',
      description: 'Friction between identity and values. May experience challenges in love or around self-worth. Develops true values through struggle.',
      gifts: ['Develops authentic values', 'Learns self-worth through challenge', 'Builds genuine charm', 'Finds true love after struggle'],
      challenges: ['Self-worth challenges', 'Love life difficulties', 'May attract value conflicts', 'Must learn true appreciation']
    },
    {
      aspectType: 'Opposition',
      symbol: '☍',
      name: 'The Love Mirror',
      tone: '"Others reflect my capacity to love."',
      description: 'Projects charm or value needs onto partners. Relationships teach about self-worth and love. May attract beautiful or vain partners.',
      gifts: ['Learns love through relationship', 'Develops balanced values', 'Understands attraction', 'Grows through partnership'],
      challenges: ['Projects value needs onto others', 'May attract superficial partners', 'Relationships involve worth lessons', 'Must own inner beauty']
    },
    {
      aspectType: 'Trine',
      symbol: '△',
      name: 'The Natural Charmer',
      tone: '"Love comes naturally."',
      description: 'Easy integration of identity and love. Natural charm and artistic sensibility. Comfortable with beauty and appreciation.',
      gifts: ['Natural attractiveness', 'Effortless charm', 'Comfortable with love', 'Artistic ease'],
      challenges: ['May take love for granted', 'Could be lazy in relationships', 'Less growth through love challenges', 'May not develop depth']
    },
    {
      aspectType: 'Sextile',
      symbol: '⚹',
      name: 'The Developing Heart',
      tone: '"I can learn to love and be loved."',
      description: 'Opportunity to develop charm, artistry, and loving capacity with conscious effort.',
      gifts: ['Develops charm over time', 'Learns artistic expression', 'Builds loving capacity', 'Grows through appreciation'],
      challenges: ['Love requires development', 'May avoid vulnerability', 'Charm needs cultivation', 'Could stay too independent']
    }
  ]
};

export const ALL_ASPECT_MODIFIERS: PlanetPairAspects[] = [
  MERCURY_NEPTUNE,
  SUN_MOON,
  VENUS_MARS,
  MERCURY_URANUS,
  MOON_PLUTO,
  SUN_SATURN,
  VENUS_NEPTUNE,
  MARS_PLUTO,
  JUPITER_SATURN,
  MOON_NEPTUNE,
  // New additions
  VENUS_SATURN,
  MARS_NEPTUNE,
  SUN_URANUS,
  MERCURY_SATURN,
  SUN_NEPTUNE,
  MARS_SATURN,
  JUPITER_URANUS,
  VENUS_PLUTO,
  JUPITER_NEPTUNE,
  // Additional coverage
  MOON_SATURN,
  MOON_URANUS,
  SATURN_URANUS,
  SATURN_PLUTO,
  SUN_PLUTO,
  MERCURY_PLUTO,
  MERCURY_MARS,
  MERCURY_VENUS,
  SUN_MARS,
  SUN_VENUS,
];

/**
 * Find aspect modifiers for a planet pair (order-insensitive)
 */
export function findAspectModifiers(planet1: string, planet2: string): PlanetPairAspects | null {
  return ALL_ASPECT_MODIFIERS.find(
    pair => 
      (pair.planet1 === planet1 && pair.planet2 === planet2) ||
      (pair.planet1 === planet2 && pair.planet2 === planet1)
  ) || null;
}

/**
 * Get specific aspect modifier for a planet pair and aspect type
 */
export function getAspectModifier(
  planet1: string, 
  planet2: string, 
  aspectType: string
): AspectModifier | null {
  const pair = findAspectModifiers(planet1, planet2);
  if (!pair) return null;
  
  return pair.aspects.find(a => a.aspectType === aspectType) || null;
}
