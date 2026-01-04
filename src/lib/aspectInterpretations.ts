// Deep aspect interpretations - HOW different aspects feel and manifest between planets

export interface AspectInterpretation {
  keyword: string;
  symbol: string;
  feeling: string;
  manifestation: string;
  challenge?: string;
  gift?: string;
}

export const ASPECT_INTERPRETATIONS: Record<string, AspectInterpretation> = {
  conjunction: {
    keyword: 'Fusion',
    symbol: '☌',
    feeling: 'These energies merge into ONE force. You can\'t separate them—they act together, amplifying each other. It\'s intense, focused, and personal.',
    manifestation: 'The transit planet BECOMES part of the natal planet\'s expression during this time. Whatever the transit planet represents is now fused with your natal planet\'s themes.',
    challenge: 'It can be overwhelming when too much energy concentrates in one place. Hard to get perspective.',
    gift: 'Maximum power and focus. A reset or new beginning in this area of life.',
  },
  opposition: {
    keyword: 'Awareness',
    symbol: '☍',
    feeling: 'You\'re pulled between two poles, forced to find balance. Others may embody what the transit is bringing, creating relationship dynamics.',
    manifestation: 'What was unconscious becomes conscious through contrast. You see both sides clearly. External situations mirror internal tensions.',
    challenge: 'Projection onto others, conflict, feeling torn between extremes.',
    gift: 'Integration of opposites, relationship insights, objectivity through polarity.',
  },
  trine: {
    keyword: 'Flow',
    symbol: '△',
    feeling: 'Easy, natural, harmonious. These energies support each other effortlessly. Talents and gifts emerge without struggle.',
    manifestation: 'Things just work. Opportunities appear naturally. The transit brings ease and grace to the natal planet\'s expression.',
    challenge: 'Can be too easy—growth without effort may not build strength. Potential for laziness.',
    gift: 'Natural talent, smooth progress, luck, creative flow, things falling into place.',
  },
  square: {
    keyword: 'Tension',
    symbol: '□',
    feeling: 'Friction, pressure, and frustration. Something must change but doesn\'t want to. Crisis demands action.',
    manifestation: 'Conflict between what you want and what\'s happening. External obstacles force internal growth. Stress produces results.',
    challenge: 'Frustration, conflict, feeling blocked, anger, forced changes.',
    gift: 'Growth through struggle, motivation, strength built through resistance, breakthroughs.',
  },
  sextile: {
    keyword: 'Opportunity',
    symbol: '⚹',
    feeling: 'Gentle openings and helpful connections. Potential waits to be activated. A friendly nudge rather than a push.',
    manifestation: 'Doors open if you knock. Skills combine usefully. Conversations and connections facilitate progress.',
    challenge: 'Requires initiative—opportunities pass if not seized.',
    gift: 'Helpful connections, practical opportunities, skills that complement each other.',
  },
  quincunx: {
    keyword: 'Adjustment',
    symbol: '⚻',
    feeling: 'Something\'s off but you can\'t quite name it. Requires constant fine-tuning. An itch you can\'t scratch directly.',
    manifestation: 'Health issues, timing problems, situations that require adaptation. What works for one part doesn\'t work for another.',
    challenge: 'Frustrating lack of resolution, health sensitivities, constant adjustments needed.',
    gift: 'Refined awareness, creative problem-solving, learning flexibility.',
  },
  semisextile: {
    keyword: 'Nudge',
    symbol: '⚺',
    feeling: 'Subtle irritation or slight opportunity. Adjacent energies that don\'t quite mesh but can learn from each other.',
    manifestation: 'Minor adjustments, small openings, subliminal influences.',
    challenge: 'Easy to ignore, may create low-grade tension.',
    gift: 'Subtle growth, awareness of nuance, incremental progress.',
  },
  sesquisquare: {
    keyword: 'Agitation',
    symbol: '⚼',
    feeling: 'Restless tension seeking outlet. More uncomfortable than a square but less dramatic.',
    manifestation: 'External irritations, compulsive actions, difficulty settling.',
    challenge: 'Chronic dissatisfaction, scattered energy.',
    gift: 'Motivation for change, breaking stagnation.',
  },
  semisquare: {
    keyword: 'Friction',
    symbol: '∠',
    feeling: 'Minor but persistent tension. Like a pebble in your shoe.',
    manifestation: 'Small conflicts, minor obstacles, internal tension.',
    challenge: 'Irritability, impatience with small things.',
    gift: 'Awareness of what needs adjustment, motivation for minor changes.',
  },
  quintile: {
    keyword: 'Creativity',
    symbol: 'Q',
    feeling: 'Special talent or creative gift. A unique way these energies combine to produce something original.',
    manifestation: 'Creative breakthroughs, unique abilities, artistic expression.',
    challenge: 'May feel different or misunderstood.',
    gift: 'Genuine creative talent, unique perspective, artistic gifts.',
  },
};

// Get detailed interpretation for a specific planet-to-planet aspect
export const getAspectInterpretation = (
  transitPlanet: string,
  natalPlanet: string,
  aspectType: string
): string => {
  const aspect = ASPECT_INTERPRETATIONS[aspectType] || ASPECT_INTERPRETATIONS.conjunction;
  
  const transitName = transitPlanet.charAt(0).toUpperCase() + transitPlanet.slice(1).toLowerCase();
  const natalName = natalPlanet.charAt(0).toUpperCase() + natalPlanet.slice(1).toLowerCase();
  
  // Specific planet-to-planet combinations
  const combos: Record<string, Record<string, Record<string, string>>> = {
    conjunction: {
      Pluto: {
        Venus: 'Pluto conjunct Venus TRANSFORMS your love nature. Relationships intensify dramatically—obsessive attractions, power dynamics in love, or a complete metamorphosis of what you value. Old loves may die to make way for more authentic connections.',
        Sun: 'Pluto conjunct Sun is a profound identity transformation. The person you were dissolves; who you\'re becoming emerges through crisis. Power issues, confrontations with authority, or a complete rebirth of purpose.',
        Moon: 'Pluto conjunct Moon excavates your emotional depths. Intense feelings surface that you may have buried for years. Family dynamics transform. Emotional purging and healing at the root level.',
        Mars: 'Pluto conjunct Mars is volcanic energy. Incredible power to act, but watch for power struggles, rage, or ruthless ambition. Used consciously, this is unstoppable transformative action.',
        Mercury: 'Pluto conjunct Mercury transforms your thinking. Obsessive thoughts, deep research, or conversations that change everything. Words carry power—speak with awareness.',
      },
      Saturn: {
        Venus: 'Saturn conjunct Venus tests love through reality. Relationships that aren\'t built to last may end. Those that survive become more committed. Learning the difference between love and fantasy.',
        Sun: 'Saturn conjunct Sun is a maturity checkpoint. You confront limitations, take on more responsibility, and define your authentic authority. Hard work, yes—but lasting achievement.',
        Moon: 'Saturn conjunct Moon asks for emotional maturity. Loneliness or emotional restriction may surface so you can develop inner security. Mothering themes, especially around limitation.',
      },
      Jupiter: {
        Venus: 'Jupiter conjunct Venus brings LUCK in love and money. Generosity flows, pleasure expands, and relationships bring growth. A blessed time for anything Venusian.',
        Sun: 'Jupiter conjunct Sun is your personal lucky streak. Confidence expands, opportunities appear, and life feels meaningful. Growth through being authentically yourself.',
      },
      Neptune: {
        Venus: 'Neptune conjunct Venus dissolves the boundary between self and love. Transcendent romance possible—but also confusion, idealization, or loving someone who isn\'t who they seem. Spiritual love lessons.',
        Sun: 'Neptune conjunct Sun dissolves ego boundaries. Spiritual awakening, creative inspiration, but also potential for confusion about identity. Who are you beneath all the roles?',
      },
      Uranus: {
        Venus: 'Uranus conjunct Venus ELECTRIFIES your love life. Sudden attractions, breakups, or a complete revolution in what you value. Freedom in relationship becomes essential.',
        Sun: 'Uranus conjunct Sun is an identity awakening. Suddenly, you can\'t pretend to be who you\'re not. Liberation from false selves. Expect the unexpected in self-expression.',
      },
    },
    sextile: {
      Pluto: {
        Venus: 'Pluto sextile Venus offers opportunities for deepening love. Relationships can transform—but gently, if you engage the process. Easier access to your own magnetism and power in love.',
        Sun: 'Pluto sextile Sun provides opportunities to access your deeper power. Transformation is available if you reach for it. Empowering connections with authority figures or mentors.',
        Moon: 'Pluto sextile Moon offers emotional empowerment. Healing opportunities arise naturally. You can access deeper feelings without being overwhelmed.',
        Mars: 'Pluto sextile Mars channels power into effective action. Strategic opportunities appear. Your drive is supported by hidden resources.',
      },
      Saturn: {
        Venus: 'Saturn sextile Venus supports practical relationship building. Stability and commitment flow more easily. Good for formalizing love.',
        Sun: 'Saturn sextile Sun supports disciplined achievement. Hard work flows more easily. Recognition for steady effort.',
      },
      Jupiter: {
        Venus: 'Jupiter sextile Venus opens doors in love and finances. Opportunities for pleasure and growth appear through social connections.',
        Sun: 'Jupiter sextile Sun brings helpful opportunities for expansion. Growth feels natural and supported.',
      },
      Neptune: {
        Venus: 'Neptune sextile Venus inspires artistic romance and spiritual love connections. Creativity in relationship flows easily.',
        Sun: 'Neptune sextile Sun opens channels to inspiration and spiritual identity. Dreams feel more accessible.',
      },
      Uranus: {
        Venus: 'Uranus sextile Venus brings exciting but manageable changes in love. New connections that stimulate without overwhelming.',
        Sun: 'Uranus sextile Sun offers opportunities for authentic self-expression. Freedom feels accessible.',
      },
    },
    trine: {
      Pluto: {
        Venus: 'Pluto trine Venus flows transformative power through love with ease. Deep connections form naturally. Your magnetism is working for you.',
        Sun: 'Pluto trine Sun channels power into self-expression effortlessly. You access your depths without struggle. Natural charisma and influence.',
        Moon: 'Pluto trine Moon flows emotional healing naturally. Deep feelings support rather than overwhelm. Intuition is powerful.',
        Mars: 'Pluto trine Mars gives you access to tremendous power for action. Whatever you pursue, you pursue with relentless effectiveness.',
      },
      Saturn: {
        Venus: 'Saturn trine Venus stabilizes love naturally. Commitment feels easy. Relationships age well.',
        Sun: 'Saturn trine Sun supports achievement without excessive struggle. Discipline flows into lasting results.',
      },
      Jupiter: {
        Venus: 'Jupiter trine Venus is luck and grace in love and money. Pleasure expands naturally. One of the most fortunate transits.',
        Sun: 'Jupiter trine Sun is natural expansion and luck. Confidence and opportunity flow together.',
      },
    },
    square: {
      Pluto: {
        Venus: 'Pluto square Venus creates CRISIS in love. Power struggles, obsessive attractions, or the death of a relationship force transformation. What you value is being pressure-tested.',
        Sun: 'Pluto square Sun is an identity crisis through power confrontation. External forces challenge who you think you are. Ego death and breakthrough.',
        Moon: 'Pluto square Moon brings emotional crisis. Family dynamics may explode. Deep feelings demand expression. Intense but ultimately healing if you allow it.',
        Mars: 'Pluto square Mars is power struggle incarnate. Explosive anger, confrontations, or ruthless action. Dangerous if unconscious, transformative if channeled.',
      },
      Saturn: {
        Venus: 'Saturn square Venus tests love through hardship. Loneliness, rejection, or relationship obstacles force you to examine what you truly value.',
        Sun: 'Saturn square Sun is a hard reality check on identity and achievements. Obstacles demand maturity. Breaking through requires accepting responsibility.',
      },
      Uranus: {
        Venus: 'Uranus square Venus shocks the love life. Sudden attractions or breakups. Freedom vs. commitment tension reaches crisis point.',
        Sun: 'Uranus square Sun disrupts your sense of self. Restless need for change. Breaking free from limiting self-concepts.',
      },
      Neptune: {
        Venus: 'Neptune square Venus confuses love. Idealization, deception, or dissolution in relationships. The rose-colored glasses crack.',
        Sun: 'Neptune square Sun dissolves identity confusion. Who am I really? Ego boundaries blur. Requires grounding.',
      },
    },
    opposition: {
      Pluto: {
        Venus: 'Pluto opposite Venus projects power dynamics into relationships. Others embody the intensity. Partners may be controlling—or you attract your shadow.',
        Sun: 'Pluto opposite Sun brings power confrontations with others. External forces challenge your identity. Who has the power—you or them?',
        Moon: 'Pluto opposite Moon externalizes emotional intensity. Family or domestic situations become battlegrounds for transformation.',
      },
      Saturn: {
        Venus: 'Saturn opposite Venus externalizes relationship tests through others. Partners may seem cold or limiting. Finding balance between love and duty.',
        Sun: 'Saturn opposite Sun projects authority onto others. Confrontations with bosses, fathers, or the system. Finding your own authority.',
      },
      Uranus: {
        Venus: 'Uranus opposite Venus brings relationship earthquakes through others. Partners may leave or demand freedom. Liberation through separation.',
        Sun: 'Uranus opposite Sun brings awakening through others. People disrupt your identity. Individuation through contrast.',
      },
    },
  };
  
  const specificInterpretation = combos[aspectType]?.[transitName]?.[natalName];
  
  if (specificInterpretation) {
    return specificInterpretation;
  }
  
  // Generic fallback
  return `Transit ${transitName} ${aspect.keyword.toLowerCase()}s with your natal ${natalName}. ${aspect.feeling} ${aspect.manifestation}`;
};

// Get the feeling/experience of an aspect
export const getAspectFeeling = (aspectType: string): string => {
  const aspect = ASPECT_INTERPRETATIONS[aspectType];
  if (!aspect) return '';
  
  return `${aspect.symbol} ${aspect.keyword}: ${aspect.feeling}`;
};

// Get the challenge and gift of an aspect
export const getAspectDynamics = (aspectType: string): { challenge: string; gift: string } => {
  const aspect = ASPECT_INTERPRETATIONS[aspectType] || ASPECT_INTERPRETATIONS.conjunction;
  return {
    challenge: aspect.challenge || '',
    gift: aspect.gift || '',
  };
};
