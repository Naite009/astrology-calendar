// ============================================================================
// ERIS INTERPRETATIONS - Feminine Warrior for Soul Purpose
// Based on Henry Seltzer's research: "The Tenth Planet: Revelations from the Astrological Eris"
// ============================================================================

// ============================================================================
// ERIS IN HOUSES - Where Your Soul Purpose Manifests
// ============================================================================

export const ERIS_HOUSE_INTERPRETATIONS: Record<number, {
  theme: string;
  core: string;
  soul_purpose: string;
  shadow: string;
  evolved: string;
}> = {
  1: {
    theme: "Identity as Warrior",
    core: "Your very presence is an act of disruption. You are someone whose identity is wrapped up in breaking molds and pioneering new territory. There is no hiding who you are—your soul purpose radiates from your physical being.",
    soul_purpose: "To embody authenticity so fiercely that others are inspired to drop their masks. You are here to demonstrate what it looks like to be unapologetically yourself.",
    shadow: "You may struggle with being seen as 'too much' or constantly creating friction simply by existing. There can be a compulsion to fight for your right to be yourself that alienates others.",
    evolved: "You become a living symbol of authentic self-expression, giving others permission to be who they truly are simply by witnessing you."
  },
  2: {
    theme: "Fighting for Authentic Values",
    core: "Your resources, talents, and sense of self-worth are the battleground. You are someone who will not compromise when it comes to what you truly value, even if it means material instability.",
    soul_purpose: "To discover and defend what genuinely matters to you, independent of societal expectations about money, success, or worth.",
    shadow: "You may sabotage financial stability to prove you cannot be bought. There can be chronic insecurity around resources despite genuine talents.",
    evolved: "You develop an unshakeable sense of inherent worth that no amount of money or lack thereof can touch. You help others discover what they truly value."
  },
  3: {
    theme: "Communication That Disrupts the Status Quo",
    core: "Your mind and voice are instruments of necessary chaos. You cannot help but speak truths that others avoid, and your curiosity leads you into territory that disrupts comfortable assumptions.",
    soul_purpose: "To give voice to the unspeakable, to name what others cannot or will not name. Your words carry the power to shift paradigms.",
    shadow: "You may create conflict through careless speech or mistake intellectual provocation for wisdom. Relationships with siblings or neighbors can be fractured.",
    evolved: "You become a messenger for truths that heal by first disturbing. Your communication catalyzes awakening in those ready to hear."
  },
  4: {
    theme: "Warrior Lineage & Ancestral Fire",
    core: "Your soul purpose is rooted in your family line. You may be working out ancestral battles or carrying forward a legacy of fighters and paradigm-shifters. Home and security are complicated territories.",
    soul_purpose: "To transform ancestral wounds into ancestral wisdom. To fight for a sense of belonging that honors both your lineage and your individuality.",
    shadow: "You may be estranged from family or constantly battling for emotional security. There can be a pattern of never feeling truly at home anywhere.",
    evolved: "You become the ancestor your descendants will point to as the one who broke the cycle. You create home wherever you are."
  },
  5: {
    theme: "Creative Self-Expression as Soul Mission",
    core: "Your creativity, your children, your romance, your play—these are not pastimes, they are your soul's work. You simply cannot not express yourself, and when you try to suppress this, you suffer.",
    soul_purpose: "To create from the deepest center of who you are. To express yourself so authentically that your art, children, or creative projects carry your soul's signature.",
    shadow: "You may seek recognition through drama rather than genuine creativity. There can be struggles with children or romantic partners who mirror your own need to be seen.",
    evolved: "Your creative output becomes a legacy that outlives you. What you birth into the world carries medicine for others."
  },
  6: {
    theme: "Service Work as Activism",
    core: "Your daily work, health practices, and acts of service are where your warrior nature lives. You cannot simply hold a job—you must fight for something meaningful through your work.",
    soul_purpose: "To transform the mundane into the sacred through devoted service. To bring your soul's fire into the everyday world of work and health.",
    shadow: "You may experience health crises that force you to stop fighting. You can burn out by treating every workplace as a battleground.",
    evolved: "You develop healing practices that actually heal, and work that serves not just employers but humanity. You teach others to infuse sacred purpose into daily life."
  },
  7: {
    theme: "Partnership with Fellow Warriors",
    core: "Your committed relationships are with those who share your fire or oppose it—there is no lukewarm partnership for you. You attract others who trigger your deepest growth or join your crusade.",
    soul_purpose: "To learn the alchemy of partnership: how two warriors can fight together rather than against each other. To find your equal.",
    shadow: "You may attract enemies masquerading as partners, or pick fights with allies. Open enemies can be weirdly easier to deal with than intimacy.",
    evolved: "You become someone who can hold space for another's full warrior nature while maintaining your own. Your partnerships become vehicles for collective soul work."
  },
  8: {
    theme: "Deep Soul Transformation Through Crisis",
    core: "Intimacy, shared resources, death, rebirth—these Plutonian realms are where your Eris lives. You are no stranger to the underworld, and your soul purpose is forged in crisis.",
    soul_purpose: "To die and be reborn repeatedly, accumulating wisdom each time. To become a guide for others navigating the darkness.",
    shadow: "You may become obsessed with power or control as a response to early experiences of powerlessness. Sexual or financial manipulation can be shadow expressions.",
    evolved: "You become a midwife to transformation—for yourself and others. You understand that true power comes from surrendering to the death-rebirth cycle."
  },
  9: {
    theme: "Philosophy and Belief as Battleground",
    core: "Your soul purpose lives in the realm of meaning, truth, and wisdom. You are a philosophical warrior, someone whose beliefs are not just ideas but lived convictions worth fighting for.",
    soul_purpose: "To expand consciousness—your own and humanity's. To publish, teach, or travel in ways that shift paradigms.",
    shadow: "You may become dogmatic or preachy, mistaking your truth for THE truth. There can be restlessness that prevents deep wisdom from developing.",
    evolved: "You become a wisdom keeper and paradigm shifter. Your philosophy is proven by your life, not just your words."
  },
  10: {
    theme: "Public Role as Paradigm Shifter",
    core: "Your career and public reputation are inseparable from your soul purpose. You are meant to be visible, to hold a position of influence that disrupts and transforms your field.",
    soul_purpose: "To achieve mastery in a way that redefines what mastery means. To leave a legacy that changes how your profession or field operates.",
    shadow: "You may court controversy for its own sake or become so identified with your public role that you lose your private self. Fame can become addiction.",
    evolved: "You become an authority whose power comes from authentic alignment with soul purpose. Your career is your calling."
  },
  11: {
    theme: "Community Activism & Social Causes",
    core: "Your soul purpose is collective. You are here to fight for the future, for humanity, for your chosen tribe. Your friendships and group affiliations are where your warrior nature expresses.",
    soul_purpose: "To organize, galvanize, and lead movements that serve human evolution. To find your true community of fellow paradigm shifters.",
    shadow: "You may become a revolutionary without a cause, fighting everything and achieving nothing. There can be loneliness within groups—the outsider among outsiders.",
    evolved: "You become a catalyst for collective awakening. Your presence in a group shifts its trajectory toward greater authenticity and purpose."
  },
  12: {
    theme: "Spiritual Warrior & Collective Unconscious",
    core: "Your soul purpose is hidden even from yourself, operating from the realm of dreams, the unconscious, and the spiritual. You are a warrior for what cannot be named.",
    soul_purpose: "To dissolve the ego enough to serve as a channel for collective healing. To fight for the invisible, the forgotten, the silenced.",
    shadow: "You may struggle with self-undoing, victimhood, or feeling persecuted by invisible enemies. There can be spiritual bypassing that avoids necessary confrontation.",
    evolved: "You become a mystic warrior—someone whose very being is a prayer for humanity. Your battles are won in meditation and dreams."
  }
};

// ============================================================================
// ERIS ASPECTS - How the Feminine Warrior Connects
// ============================================================================

export const ERIS_ASPECT_INTERPRETATIONS: Record<string, Record<string, {
  meaning: string;
  manifestation: string;
  integration: string;
}>> = {
  sun: {
    conjunction: {
      meaning: "Your identity IS the feminine warrior. You cannot separate who you are from your soul mission.",
      manifestation: "Born iconoclast who thrives when odds are against them. Unbeatable when aligned with soul purpose.",
      integration: "Accept that your life is not meant to be comfortable. Your discomfort is your gift to the world."
    },
    opposition: {
      meaning: "Others trigger your warrior nature. You project your soul purpose onto partners or enemies.",
      manifestation: "May see others as either allies or obstacles to your mission. Relationships are battlegrounds for authenticity.",
      integration: "Recognize the warrior in the mirror. Own what you fight in others."
    },
    trine: {
      meaning: "Your soul purpose flows naturally through your identity. Easy access to your inner warrior.",
      manifestation: "Natural paradigm shifter who doesn't need to try. Authentic self-expression comes easily.",
      integration: "Don't waste this gift on small battles. Channel it toward what truly matters."
    },
    square: {
      meaning: "Tension between who you think you are and who your soul demands you become.",
      manifestation: "May feel at war with yourself. Identity crises that catalyze growth. Friction that forges character.",
      integration: "Embrace the struggle as the path. Your discomfort is the chrysalis."
    },
    sextile: {
      meaning: "Opportunities to express your warrior nature through your identity.",
      manifestation: "Can step into soul purpose when circumstances invite it. Not pushy, but available.",
      integration: "Say yes to the invitations. They are rarer than you think."
    }
  },
  moon: {
    conjunction: {
      meaning: "Your emotions ARE warrior fuel. You feel your soul purpose in your body.",
      manifestation: "Deeply sensitive warrior who fights from instinct. Protective like a mother tiger.",
      integration: "Honor the wisdom of your emotional responses. They know what your mind doesn't."
    },
    opposition: {
      meaning: "Emotions and soul purpose seem to conflict. You may feel you must choose between nurturing and fighting.",
      manifestation: "Others trigger your deepest protective instincts. Family and soul mission can feel at odds.",
      integration: "Learn that true nurturing sometimes requires fierce protection. Both serve love."
    },
    trine: {
      meaning: "Emotional intelligence flows into warrior wisdom. You fight for what you feel.",
      manifestation: "Intuitive warrior who senses what's needed. Natural ability to mother causes and people.",
      integration: "Trust your feelings as guidance for where to direct your fire."
    },
    square: {
      meaning: "Internal battle between emotional needs and soul demands.",
      manifestation: "May suppress feelings to fight, or avoid fighting to feel safe. Inner conflict.",
      integration: "Make space for both. Your vulnerability makes you a more effective warrior."
    },
    sextile: {
      meaning: "Gentle opportunities to align emotions with purpose.",
      manifestation: "Can access warrior energy when emotionally activated. Not constant, but available.",
      integration: "Notice when your heart opens a door your mind didn't see."
    }
  },
  venus: {
    conjunction: {
      meaning: "Your values and aesthetics ARE your warrior expression. Beauty as revolution.",
      manifestation: "Refined tastes combined with untamed spirit. Love is not tame for you.",
      integration: "Let your art and relationships carry your soul's fire."
    },
    opposition: {
      meaning: "Love and war seem opposed. You may attract partners who embody what you fight.",
      manifestation: "Relationships with paradigm shifters or with those who trigger your warrior nature.",
      integration: "Find the warrior in your lover, the lover in your battles."
    },
    trine: {
      meaning: "Harmony between what you love and what you fight for.",
      manifestation: "Natural ability to infuse beauty into activism. Art as medicine.",
      integration: "Your aesthetic vision serves your soul purpose. Let them merge."
    },
    square: {
      meaning: "Tension between peace and disruption. You want harmony but create chaos.",
      manifestation: "May sabotage relationships to stay true to self. Love vs. soul purpose.",
      integration: "Learn that love can contain conflict. Peace is not the absence of fire."
    },
    sextile: {
      meaning: "Opportunities to express soul purpose through love and beauty.",
      manifestation: "Can channel warrior energy into artistic expression when invited.",
      integration: "Let beauty be a vehicle for truth."
    }
  },
  mars: {
    conjunction: {
      meaning: "Your drive and desires ARE feminine warrior energy. Pure soul-aligned action.",
      manifestation: "Unstoppable when aligned with purpose. Take-no-prisoners attitude from the core.",
      integration: "Channel this fire carefully. You can destroy or create—choose creation."
    },
    opposition: {
      meaning: "Others embody the warrior you must integrate. External battles mirror internal ones.",
      manifestation: "Conflict with assertive people. Your anger is projected until owned.",
      integration: "Own your fire. Stop fighting others for what's yours."
    },
    trine: {
      meaning: "Drive flows naturally into soul purpose. Easy access to warrior energy.",
      manifestation: "Natural fighter for just cause. Energy and purpose aligned.",
      integration: "Don't waste this gift on petty battles. Save it for what matters."
    },
    square: {
      meaning: "Tension between ego-driven action and soul-aligned action.",
      manifestation: "May fight for wrong reasons or suppress fighting altogether. Internal friction.",
      integration: "Learn the difference between Mars alone (ego) and Mars-Eris (soul). Let Eris guide Mars."
    },
    sextile: {
      meaning: "Opportunities to align action with soul purpose.",
      manifestation: "Can take warrior action when circumstances invite it.",
      integration: "Notice the openings. Act on them."
    }
  },
  jupiter: {
    conjunction: {
      meaning: "Your faith and expansion ARE warrior wisdom. Big vision for soul purpose.",
      manifestation: "Philosophical warrior with grand vision. May become teacher or publisher of paradigm-shifting ideas.",
      integration: "Think big. Your soul purpose is not small."
    },
    opposition: {
      meaning: "Others challenge your beliefs and expand your warrior vision.",
      manifestation: "Teachers and mentors who trigger your growth. Belief systems tested by relationship.",
      integration: "Let others expand your understanding of your own purpose."
    },
    trine: {
      meaning: "Faith and purpose flow together. Lucky warrior.",
      manifestation: "Natural ability to see the bigger picture of your battles. Optimistic fighter.",
      integration: "Trust that the universe supports your soul mission. It does."
    },
    square: {
      meaning: "Tension between expansion and disruption. May over-extend in service of purpose.",
      manifestation: "Can become preachy or dogmatic. Beliefs too big for current container.",
      integration: "Balance vision with groundedness. Big doesn't mean right."
    },
    sextile: {
      meaning: "Opportunities for purpose to expand through learning and travel.",
      manifestation: "Can grow soul mission when adventure calls.",
      integration: "Say yes to the journeys. They serve your purpose."
    }
  },
  saturn: {
    conjunction: {
      meaning: "Your discipline and mastery ARE warrior training. Soul purpose forged in time and effort.",
      manifestation: "Late bloomer whose purpose crystallizes with age. Authority earned through struggle.",
      integration: "Embrace the slow path. Your purpose takes time to build."
    },
    opposition: {
      meaning: "Authority figures or structures challenge your purpose. External limits test your fire.",
      manifestation: "Conflict with systems, institutions, or father figures. Must earn respect.",
      integration: "Build your own structure that serves your soul, not society's expectations."
    },
    trine: {
      meaning: "Discipline supports purpose naturally. Structured warrior.",
      manifestation: "Natural ability to work hard for what matters. Patient fighter.",
      integration: "Your commitment to the long game is your superpower."
    },
    square: {
      meaning: "Tension between structure and disruption. May rebel against all limits.",
      manifestation: "Difficulty with authority. Feels constrained by necessary structures.",
      integration: "Learn that some limits serve freedom. Choose your constraints wisely."
    },
    sextile: {
      meaning: "Opportunities to build lasting structures for soul purpose.",
      manifestation: "Can work within systems when they serve the mission.",
      integration: "Use structure as scaffolding, not prison."
    }
  },
  uranus: {
    conjunction: {
      meaning: "Your freedom and rebellion ARE soul purpose. Double revolutionary.",
      manifestation: "Freedom is lifeblood. Synchronicity as guide. Tuned to hidden cosmos.",
      integration: "Trust the unexpected. It carries messages about your purpose."
    },
    opposition: {
      meaning: "Others embody the freedom you seek. Relationships catalyze awakening.",
      manifestation: "Partners or groups trigger your revolutionary nature.",
      integration: "Recognize that what disrupts you from outside lives inside too."
    },
    trine: {
      meaning: "Revolution and purpose flow together. Easy access to awakening.",
      manifestation: "Natural paradigm shifter. Innovation serves soul mission.",
      integration: "Let your uniqueness lead. It knows the way."
    },
    square: {
      meaning: "Tension between different revolutionary impulses. Rebel without clear cause.",
      manifestation: "May fight everything and achieve nothing. Restless without direction.",
      integration: "Focus your revolutionary energy. Pick your battles."
    },
    sextile: {
      meaning: "Opportunities for unexpected awakening to serve purpose.",
      manifestation: "Synchronicity opens doors when you're paying attention.",
      integration: "Notice the coincidences. They're guidance."
    }
  },
  neptune: {
    conjunction: {
      meaning: "Your spirituality and imagination ARE warrior wisdom. Mystical fighter.",
      manifestation: "Ethereal warrior. May struggle to ground purpose in reality.",
      integration: "Let your dreams guide your battles. Art and spirit as weapons."
    },
    opposition: {
      meaning: "Confusion vs. clarity around purpose. Others inspire or confuse your mission.",
      manifestation: "May idealize causes or people. Boundaries between self and collective blur.",
      integration: "Trust your intuition but verify with reality. Not all visions are true."
    },
    trine: {
      meaning: "Spirituality supports purpose naturally. Compassionate warrior.",
      manifestation: "Natural ability to fight for the invisible, the suffering, the forgotten.",
      integration: "Let compassion guide your fire. Fight for what cannot fight for itself."
    },
    square: {
      meaning: "Tension between fighting and surrendering. May escape rather than engage.",
      manifestation: "Confusion about purpose. Victimhood as shadow. Addiction as escape from mission.",
      integration: "Learn that surrender can be strength. Not all battles require fighting."
    },
    sextile: {
      meaning: "Opportunities for spiritual insight to guide purpose.",
      manifestation: "Dreams and intuitions offer guidance when listened to.",
      integration: "Pay attention to the subtle messages. They know things."
    }
  },
  pluto: {
    conjunction: {
      meaning: "Your power and transformation ARE soul purpose. Double intensity.",
      manifestation: "Intense stamina. Evolutionary call. Drive for self-mastery that won't quit.",
      integration: "Your transformation is your gift. What you survive, you teach."
    },
    opposition: {
      meaning: "Others hold power over your purpose until you claim it. Projection of shadow warrior.",
      manifestation: "Power struggles that force you to own your fire. Others trigger your depths.",
      integration: "Reclaim what you've given away. Your power is yours."
    },
    trine: {
      meaning: "Transformation and purpose flow together. Deep power accessed easily.",
      manifestation: "Natural ability to transform self and situations in service of soul mission.",
      integration: "Don't underestimate your power. Use it wisely."
    },
    square: {
      meaning: "Tension between control and soul alignment. May manipulate or be manipulated.",
      manifestation: "Power struggles, obsession, attempts to control what can't be controlled.",
      integration: "True power is letting go of control while staying aligned with purpose."
    },
    sextile: {
      meaning: "Opportunities for deep transformation in service of purpose.",
      manifestation: "Can access regenerative power when circumstances call for it.",
      integration: "Let the deaths come. They serve the rebirths."
    }
  }
};

// ============================================================================
// ERIS GUIDANCE GENERATOR - Working With Your Feminine Warrior
// ============================================================================

export interface ErisGuidance {
  soulPurposeTheme: string;
  chaosCreationStyle: string;
  shadowWarning: string;
  activationPractice: string;
  affirmation: string;
}

export const generateErisGuidance = (
  house: number | null,
  aspectPlanets: { planet: string; aspectType: string }[],
  isWellAspected: boolean
): ErisGuidance => {
  const houseData = ERIS_HOUSE_INTERPRETATIONS[house || 1];
  
  // Find strongest aspect
  const strongestAspect = aspectPlanets.find(a => 
    a.aspectType === 'conjunction' || a.aspectType === 'opposition'
  ) || aspectPlanets[0];
  
  const aspectData = strongestAspect 
    ? ERIS_ASPECT_INTERPRETATIONS[strongestAspect.planet.toLowerCase()]?.[strongestAspect.aspectType]
    : null;

  // Determine chaos creation style based on house
  const chaosStyles: Record<number, string> = {
    1: "You disrupt simply by being yourself. Your presence shifts the room.",
    2: "You disrupt through your values and what you refuse to compromise on.",
    3: "You disrupt through what you say and how you think. Your words are catalysts.",
    4: "You disrupt family patterns and ancestral wounds. Home is your battleground.",
    5: "You disrupt through creative expression. Your art carries medicine.",
    6: "You disrupt through your work and service. Every day is activism.",
    7: "You disrupt through relationship. Who you partner with changes everything.",
    8: "You disrupt through intimacy and power. You're not afraid of the dark.",
    9: "You disrupt through belief and philosophy. Your worldview shifts paradigms.",
    10: "You disrupt through public role and career. Your work is your platform.",
    11: "You disrupt through community and collective action. You organize change.",
    12: "You disrupt from the invisible realm. Your spirit work shifts the collective unconscious."
  };

  // Activation practices by house
  const practices: Record<number, string> = {
    1: "Stand in your full presence for 5 minutes. Take up space. Feel your body as a vessel for soul purpose.",
    2: "List what you would never sell out for. Feel the fire around these values. They're not negotiable.",
    3: "Write or speak the truth you've been holding back. Let words be arrows of awakening.",
    4: "Explore your ancestral line. Who were the warriors? Whose battles are you finishing?",
    5: "Create something from your deepest center. Don't censor. Let soul speak through art.",
    6: "Examine your daily work. Where does it serve your soul purpose? Where does it betray it?",
    7: "Reflect on your partnerships. Are you with fellow warriors or people you're fighting?",
    8: "Sit with your power. Feel where you've given it away. Call it back.",
    9: "Question your deepest beliefs. Which ones are truly yours? Which were inherited?",
    10: "Envision your legacy. What will you be known for? Is it aligned with your soul?",
    11: "Find your tribe. Who shares your fire? Who will fight alongside you?",
    12: "Meditate on the collective wound you're here to heal. Ask for guidance in dreams."
  };

  // Affirmations by aspect condition
  const affirmation = isWellAspected
    ? "My soul purpose flows through me with power and grace. I fight for what matters with natural authority."
    : "My struggles are forging my warrior nature. Every friction polishes my soul's diamond edge.";

  return {
    soulPurposeTheme: houseData?.theme || "The Feminine Warrior",
    chaosCreationStyle: chaosStyles[house || 1] || chaosStyles[1],
    shadowWarning: houseData?.shadow || "Be aware of fighting for fighting's sake.",
    activationPractice: practices[house || 1] || practices[1],
    affirmation
  };
};

// ============================================================================
// ERIS SIGN EXPRESSIONS (Eris in Aries 1926-2048)
// ============================================================================

export const ERIS_SIGN_EXPRESSIONS: Record<string, string> = {
  'Eris-Aries': "= Primal warrior. Eris in her home sign—pure pioneering disruption. Your soul purpose is to be first, to fight for the right to exist, to blaze trails that others couldn't imagine.",
  'Eris-Pisces': "= Spiritual warrior (before 1926). The fight for compassion, for the invisible, for dissolution of false structures.",
  'Eris-Taurus': "= Material warrior (after 2048). The fight for authentic values, sustainable resources, and what truly matters materially."
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getErisHouseInterpretation = (house: number | null): string => {
  if (!house) return "Eris's house placement is unknown. Enter complete birth data for full interpretation.";
  const data = ERIS_HOUSE_INTERPRETATIONS[house];
  return `**${data.theme}**: ${data.core}\n\n**Soul Purpose**: ${data.soul_purpose}`;
};

export const getErisAspectInterpretation = (planet: string, aspectType: string): string => {
  const aspectData = ERIS_ASPECT_INTERPRETATIONS[planet.toLowerCase()]?.[aspectType];
  if (!aspectData) {
    return `Eris ${aspectType}s your ${planet}, bringing soul-purpose energy to your ${planet} expression.`;
  }
  return `${aspectData.meaning}\n\n**Manifestation**: ${aspectData.manifestation}\n\n**Integration**: ${aspectData.integration}`;
};

export const getErisMeaning = (): { symbol: string; name: string; essence: string; represents: string } => ({
  symbol: '⯰',
  name: 'Eris',
  essence: "Your Feminine Warrior energy and soul purpose. Where you fight for what you believe in and cannot NOT do what your soul demands.",
  represents: "discord that reveals truth, feminine warrior, soul purpose, paradigm shifting, outsider power, necessary chaos, what you cannot not do"
});
