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
    feeling: 'These two energies become one thing for the duration. You cannot feel one without the other turning on. It runs hot, personal, and hard to step back from.',
    manifestation: 'Whatever the transit planet does, it now does it through your natal planet. If transit Pluto hits natal Venus, your love life is the place where Pluto rebuilds you. You will not be able to compartmentalize it.',
    challenge: 'Too much energy in one spot. You lose perspective, and the people around you feel the intensity even when you think you are hiding it.',
    gift: 'A clean slate in this part of your life. Whatever has been half-dead here gets restarted from scratch.',
  },
  opposition: {
    keyword: 'Awareness',
    symbol: '☍',
    feeling: 'You feel torn between two things you both want, or you keep meeting the exact person who is the part of you you have not owned yet. Relationships heat up.',
    manifestation: 'A partner, client, family member, or rival shows up acting out the side of you that is harder to admit you have. The fight or attraction with them is really the fight inside you.',
    challenge: 'Blaming the other person, swinging from one extreme to the other, or feeling stuck in the middle of two real needs.',
    gift: 'You can finally see yourself from the outside. The relationship that is pushing your buttons is showing you exactly what to integrate.',
  },
  trine: {
    keyword: 'Flow',
    symbol: '△',
    feeling: 'Things click without effort here. Doors open, the right person calls, the project flows. It is easy enough that you might sleep through it.',
    manifestation: 'You only get the benefit if you actually walk through the door. Trines do not knock loudly. Send the email, take the meeting, say yes to the trip.',
    challenge: 'Coasting. Because nothing forces you, nothing happens unless you move.',
    gift: 'A stretch of low resistance. Use it to get the thing you have been putting off because the friction is finally gone.',
  },
  square: {
    keyword: 'Tension',
    symbol: '□',
    feeling: 'Pressure that will not let up. Something has to change and you cannot ignore it anymore. You may feel cornered, irritable, or like every day brings the same fight.',
    manifestation: 'A deadline, a conflict, a body symptom, or an external obstacle keeps showing up until you actually do something different. The discomfort is the engine.',
    challenge: 'Picking fights, blowing up, freezing, or blaming circumstances instead of making the change the situation is asking for.',
    gift: 'Real growth. You build a muscle here you would not have built if life had stayed comfortable.',
  },
  sextile: {
    keyword: 'Opportunity',
    symbol: '⚹',
    feeling: 'A small, easy-to-miss opening. A useful conversation, a small intro, a small idea. Quiet, not dramatic.',
    manifestation: 'It only pays off if you reach out, ask, or follow up. If you wait for it to come to you, it passes.',
    challenge: 'Looks too small to bother with, so you skip it.',
    gift: 'A low-stakes way to take a real step forward in this area.',
  },
  quincunx: {
    keyword: 'Adjustment',
    symbol: '⚻',
    feeling: 'Something is off and you cannot name it. A low-grade itch, a body symptom, a timing issue, a relationship that almost works but does not quite.',
    manifestation: 'You keep having to tweak. Move the meeting. Change the dose. Reword the sentence. Two parts of your life will not cooperate, no matter how you arrange them.',
    challenge: 'Frustration, weird health stuff, the sense that you are doing everything right and it still does not fit.',
    gift: 'You learn to adapt on the fly and to stop trying to force two incompatible things to merge.',
  },
  semisextile: {
    keyword: 'Nudge',
    symbol: '⚺',
    feeling: 'A small bit of static in the background. Easy to dismiss, but it keeps tapping you on the shoulder.',
    manifestation: 'A small adjustment to a routine, a slightly new way of saying something, a tiny shift in what you eat or who you text.',
    challenge: 'You ignore it because it is so small.',
    gift: 'Small change here today saves you a big course correction later.',
  },
  sesquisquare: {
    keyword: 'Agitation',
    symbol: '⚼',
    feeling: 'Restless, fidgety, cannot sit still. The kind of irritation that makes you snap at the person closest to you for something tiny.',
    manifestation: 'You overdo it: too many tabs open, too many texts, too much caffeine, too many small decisions you keep redoing.',
    challenge: 'Burning energy in the wrong direction and exhausting yourself without solving the actual issue.',
    gift: 'The agitation will not let you stay stuck. Use it to finally move on the thing you have been avoiding.',
  },
  semisquare: {
    keyword: 'Friction',
    symbol: '∠',
    feeling: 'A pebble in your shoe. Not a crisis, just a low-level annoyance that keeps showing up in the same area.',
    manifestation: 'Small misunderstandings, small delays, small expenses, the same tiny thing going wrong twice.',
    challenge: 'Snapping at people over things that are not really their fault.',
    gift: 'A heads-up that something small needs adjusting before it grows.',
  },
  quintile: {
    keyword: 'Creativity',
    symbol: 'Q',
    feeling: 'A weird, specific knack you have that other people do not. The combination only works because it is yours.',
    manifestation: 'A creative shortcut, an unusual angle on a problem, an idea that sounds odd until people see the result.',
    challenge: 'Feeling like a freak, or hiding the gift because no one else does it your way.',
    gift: 'Originality. Use it on purpose instead of dismissing it.',
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
        Venus: 'Neptune conjunct Venus blurs the line between you and the person you are falling for. You will romanticize them, ignore red flags, and confuse longing with love. Beautiful art and music can come from this; bad financial and relationship decisions can too. Keep one trusted friend on speed-dial to fact-check you.',
        Sun: 'Neptune conjunct Sun makes you less sure of who you are. You will feel more sensitive, more tired, more pulled toward sleep, daydreams, screens, alcohol, or anything that softens the edges. Creative and spiritual work flows; deadlines and hard decisions feel impossible. Lower your output, raise your rest.',
      },
      Uranus: {
        Venus: 'Uranus conjunct Venus shakes up your love life and your bank account suddenly. You will want out of a relationship that feels boring, want into one that feels exciting, or both in the same week. Either avoid signing anything, or expect to renegotiate it within the year.',
        Sun: 'Uranus conjunct Sun is the moment you cannot pretend anymore. You quit the job, leave the relationship, come out, move cities, change your hair, change your name. Whatever you have been faking, you stop faking. Try to leave a soft landing instead of burning it all in one night.',
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
        Venus: 'Neptune square Venus is the romantic confusion transit. You will fall for someone who is not who they seem, idealize a partner past the point of seeing them, or get scammed financially. Do not lend money, do not sign a lease together, do not believe the version of them in your head.',
        Sun: 'Neptune square Sun makes your sense of yourself slippery. You will second-guess what you actually want, lose motivation, and feel pulled toward escape (sleep, scrolling, drinking). Cut your to-do list, name what is real on paper, ask one trusted person if you sound like yourself.',
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
