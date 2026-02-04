/**
 * Aspect Modifiers for Planet-Planet Combinations
 * 
 * This module provides aspect-specific interpretations that modify the universal
 * energy of planet-planet combinations. Each planet pair has a core signature,
 * and the aspect determines HOW that energy manifests.
 */

export interface AspectModifier {
  aspectType: 'Conjunction' | 'Sextile' | 'Square' | 'Trine' | 'Opposition';
  symbol: string;
  name: string;
  tone: string; // The signature/feel of this aspect
  description: string;
  gifts: string[];
  challenges: string[];
}

export interface PlanetPairAspects {
  planet1: string;
  planet2: string;
  coreSignature: string; // Universal energy regardless of aspect
  coreDescription: string;
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
      ]
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
      ]
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
      ]
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
      ]
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
      ]
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

// ============== COLLECTION ==============

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
