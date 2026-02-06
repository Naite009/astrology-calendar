/**
 * Deep Aspect Interpretations
 * 
 * This module provides TEACHING-QUALITY aspect interpretations that explain:
 * 1. What this aspect FEELS like in daily life
 * 2. HOW the friction/harmony actually manifests in behavior
 * 3. Real-life examples and patterns
 * 
 * Unlike generic "friction drives growth" phrases, these explain the MECHANISM.
 * 
 * COMPLETE COVERAGE: All 45 planet pair combinations for the 10 major planets.
 */

export interface DeepAspectInterpretation {
  whatItFeelsLike: string;       // The subjective experience
  howItManifests: string;        // Observable behavioral patterns
  realLifeExamples: string[];    // Concrete examples
  growthPath?: string;           // How to work with this aspect
}

export interface AspectInterpretationSet {
  conjunction: DeepAspectInterpretation;
  opposition: DeepAspectInterpretation;
  trine: DeepAspectInterpretation;
  sextile: DeepAspectInterpretation;
  square: DeepAspectInterpretation;
}

/**
 * Get a context-aware interpretation by incorporating sign/house information
 */
export const getContextualAspectInterpretation = (
  planet1: string,
  planet2: string,
  aspectType: string,
  planet1Sign?: string,
  planet1House?: number,
  planet2Sign?: string,
  planet2House?: number
): string => {
  const baseInterp = getDeepAspectInterpretation(planet1, planet2, aspectType);
  if (!baseInterp) return '';

  let contextual = `**What this feels like:** ${baseInterp.whatItFeelsLike}\n\n`;
  contextual += `**How it shows up:** ${baseInterp.howItManifests}\n\n`;
  
  if (baseInterp.realLifeExamples.length > 0) {
    contextual += `**Examples:** ${baseInterp.realLifeExamples.join(' • ')}`;
  }

  if (baseInterp.growthPath) {
    contextual += `\n\n**The path forward:** ${baseInterp.growthPath}`;
  }

  return contextual;
};

/**
 * Get deep interpretation for a specific aspect
 */
export const getDeepAspectInterpretation = (
  planet1: string,
  planet2: string,
  aspectType: string
): DeepAspectInterpretation | null => {
  // Normalize to find in either order
  let interps = DEEP_ASPECT_INTERPRETATIONS[`${planet1}-${planet2}`];
  if (!interps) {
    interps = DEEP_ASPECT_INTERPRETATIONS[`${planet2}-${planet1}`];
  }
  if (!interps) return null;

  const normalized = aspectType.toLowerCase();
  return interps[normalized as keyof AspectInterpretationSet] || null;
};

/**
 * The database of deep aspect interpretations
 * Each explains MECHANISM, not just outcome
 * 
 * COMPLETE: All 45 planet pairs covered
 */
export const DEEP_ASPECT_INTERPRETATIONS: Record<string, AspectInterpretationSet> = {
  
  // ============================================================================
  // SUN ASPECTS
  // ============================================================================
  
  'Sun-Moon': {
    conjunction: {
      whatItFeelsLike: "What you WANT and what you NEED feel like the same thing. You have a strong sense of self because your ego and emotions are aligned. But this can mean blind spots—you assume everyone else is this integrated too.",
      howItManifests: "You're decisive about who you are. You don't question your right to exist. But you may not understand people who feel split inside, or who say one thing and feel another.",
      realLifeExamples: [
        "Knowing what you want without long deliberation",
        "Confusion when others seem 'conflicted'",
        "Strong presence—people know who you are",
        "Difficulty understanding 'I want to but I can't'"
      ],
      growthPath: "Your gift is self-unity. Your growth is empathy—understanding that most people experience a gap between desire and need that you don't."
    },
    square: {
      whatItFeelsLike: "An inner tug-of-war between what you consciously WANT to be and what you emotionally NEED. Your goals fight with your feelings. You might push toward achievement while secretly craving rest—or prioritize comfort while feeling guilty about ambition.",
      howItManifests: "Self-sabotage when you're about to succeed. Starting something excited, then losing motivation when it demands emotional sacrifice. Parents may have modeled conflicting values. You build drive through friction.",
      realLifeExamples: [
        "Getting promoted then immediately wanting to quit",
        "Craving independence but feeling lonely when you get it",
        "Parents wanted different things from you (or for you)",
        "Accomplishing goals but not feeling satisfied"
      ],
      growthPath: "The friction IS the fuel. You're not broken—you're complex. The goal isn't to eliminate the tension but to use it. Achievement AND emotional honoring, not either/or."
    },
    opposition: {
      whatItFeelsLike: "You see yourself most clearly in relationships. Others mirror your inner conflicts. You may project either your ego (Sun) or your needs (Moon) onto partners, then wonder why they don't fulfill you.",
      howItManifests: "Relationships are where you grow. You might attract partners who embody what you've disowned in yourself. Full Moon births often have strong objectivity—you can see yourself from outside.",
      realLifeExamples: [
        "Attracting partners who are everything you're not",
        "Seeing yourself through your partner's eyes",
        "Relationship patterns that repeat until you 'get' the lesson",
        "Strong awareness of masculine/feminine dynamics"
      ],
      growthPath: "Stop outsourcing your wholeness. What you keep seeking in partners is actually IN you. The mirror is helpful—but eventually you must own both sides."
    },
    trine: {
      whatItFeelsLike: "Inner peace. What you want and what you need harmonize naturally. Life feels supportive. You may not understand why others struggle with self-acceptance—for you it's just... natural.",
      howItManifests: "Easy self-acceptance. Supportive early home environment likely. You heal well from setbacks. But you may not develop the grit that comes from internal friction.",
      realLifeExamples: [
        "Feeling comfortable in your own skin without trying",
        "Parents who modeled healthy partnership",
        "Natural emotional resilience",
        "Taking inner peace for granted"
      ],
      growthPath: "Don't mistake ease for development. Your gift is baseline stability—now BUILD on it. Challenge yourself beyond comfort. Harmony is your floor, not your ceiling."
    },
    sextile: {
      whatItFeelsLike: "The potential for inner harmony exists, but requires conscious cultivation. You CAN align your wants and needs—it's just not automatic.",
      howItManifests: "With effort, you integrate well. Therapy, journaling, or self-reflection pays off. You respond well to practices that align head and heart.",
      realLifeExamples: [
        "Therapy helping you understand your patterns",
        "Journaling clarifying what you really want",
        "Growth through intentional self-development",
        "Inner work yielding real results"
      ],
      growthPath: "Integration is available—you just have to choose it. The bridge between ego and emotion is buildable. Invest in the inner work; it's your ticket to coherence."
    }
  },

  'Sun-Mercury': {
    conjunction: {
      whatItFeelsLike: "Your identity and your mind are FUSED. You ARE your thoughts. When you speak, you're expressing your core self. Your mind isn't separate from you—it IS you.",
      howItManifests: "You communicate naturally and often. Thinking is self-expression. But you may over-identify with your opinions—a disagreement feels personal. Objectivity can be hard when ideas feel like identity.",
      realLifeExamples: [
        "Taking criticism of your ideas as criticism of YOU",
        "Needing to verbalize to know what you think",
        "Being known as the 'talker' or 'thinker'",
        "Difficulty separating logic from ego"
      ],
      growthPath: "Your gift is authentic self-expression. Your growth edge is learning that your thoughts are TOOLS, not YOU. You can change your mind without losing yourself."
    },
    square: {
      whatItFeelsLike: "Your conscious self and your thinking process are at odds. You may feel misunderstood, like your words don't capture who you really are. Inner critic is loud.",
      howItManifests: "Saying things you don't mean, or failing to say what you do mean. Communication breakdowns. Feeling smarter inside than you appear outside. Working hard to be understood.",
      realLifeExamples: [
        "Writing being clearer than speaking",
        "Replaying conversations and regretting what you said",
        "Feeling like people 'get' you wrong",
        "Inner thoughts not matching outer expression"
      ],
      growthPath: "The gap between inner and outer is the work. Practice: slow down before speaking. Your authentic voice exists—you're developing the bridge to express it clearly."
    },
    opposition: {
      whatItFeelsLike: "You understand yourself through dialogue with others. Ideas come alive in conversation. You may project intelligence onto others or feel your thinking is 'out there' rather than inside.",
      howItManifests: "Needing sounding boards. Learning through debate. May attract very mental/verbal people. Understanding yourself through how others receive your communication.",
      realLifeExamples: [
        "Not knowing what you think until you talk it out",
        "Attracting intellectual partners or friends",
        "Defining yourself through your ideas in relationship",
        "Mind coming alive in dialogue"
      ],
      growthPath: "Dialogue is your thinking style—honor it. But develop internal clarity too. You can know your own mind without needing external confirmation."
    },
    trine: {
      whatItFeelsLike: "Self-expression flows naturally. Speaking, writing, and thinking feel like extensions of who you are. Communication is effortless and authentic.",
      howItManifests: "Natural communicator. Words match intent. May take verbal ease for granted. Others see you as articulate and clear.",
      realLifeExamples: [
        "People understanding you easily",
        "Writing or speaking coming naturally",
        "Being the person who 'just says it'",
        "Comfortable in intellectual environments"
      ],
      growthPath: "Flow is your gift—now develop depth. Easy expression can stay superficial. Challenge yourself to communicate about harder things, not just easy ones."
    },
    sextile: {
      whatItFeelsLike: "Communication skills are available when you develop them. You CAN express yourself clearly—it just takes practice and intention.",
      howItManifests: "Responds well to communication training. Writing improves with effort. Public speaking gets easier with practice. The capacity is there, awaiting activation.",
      realLifeExamples: [
        "A writing class that unlocked something",
        "Getting better at speaking with practice",
        "Developing your voice over time",
        "Expression improving with intention"
      ],
      growthPath: "Your opportunity is development. The articulate self is buildable. Take the class, do the practice, find the mentor. Expression is a skill you can develop."
    }
  },

  'Sun-Venus': {
    conjunction: {
      whatItFeelsLike: "Your identity is wrapped up in love, beauty, and values. You ARE charming—it's not an act. Being appreciated feels like being SEEN. Rejection hits your core.",
      howItManifests: "Natural attractiveness and social grace. May need to be liked to feel good about yourself. Creative or aesthetic gifts. Identity expressed through relationships and beauty.",
      realLifeExamples: [
        "Feeling best when you look good",
        "Needing relationships to feel complete",
        "Natural eye for beauty and design",
        "Taking rejection very personally"
      ],
      growthPath: "Your gift is magnetism. Your growth is learning that your worth isn't dependent on being liked. You're valuable even when not appreciated."
    },
    square: {
      whatItFeelsLike: "Tension between who you are and what you value. Your self-expression may clash with your aesthetics or your relationships. Wanting love but doing things that push it away.",
      howItManifests: "Relationship patterns that repeat. Creative blocks. Feeling unattractive despite evidence otherwise. Self-worth issues that play out through love or money.",
      realLifeExamples: [
        "Attracting people who aren't good for you",
        "Knowing what you want but not feeling worthy",
        "Creative potential that feels blocked",
        "Love that requires compromise of self"
      ],
      growthPath: "The friction is teaching you that you're worthy AS YOU ARE—not as you think you should be to be loved. Self-love first, then love from others can land."
    },
    opposition: {
      whatItFeelsLike: "You experience your beauty, worth, and love nature through relationships. Partners reflect your Venus. You may project desirability onto others rather than owning it.",
      howItManifests: "Defining yourself through relationships. Attracting very Venusian (beautiful, artistic, charming) partners. Learning self-worth through being valued by others.",
      realLifeExamples: [
        "Partners who are strikingly attractive",
        "Feeling incomplete without relationship",
        "Learning to value yourself through being valued",
        "Art coming alive through collaboration"
      ],
      growthPath: "Stop outsourcing your beauty. You ARE the Venus energy you keep finding in others. Own your worth directly; stop needing external mirrors."
    },
    trine: {
      whatItFeelsLike: "Natural grace, charm, and attractiveness. Love and self-expression flow together. Beauty enhances your identity. You're easy to like.",
      howItManifests: "Social ease. Artistic gifts that feel natural. Love comes without struggle. May take charm for granted or not develop depth.",
      realLifeExamples: [
        "Always having romantic options",
        "People naturally liking you",
        "Aesthetic gifts that flow",
        "Assuming love should be easy (because for you it is)"
      ],
      growthPath: "Ease can become shallowness. Your gift is natural attractiveness—now develop substance. Being loved for who you REALLY are requires showing that."
    },
    sextile: {
      whatItFeelsLike: "Charm and social grace are available when you make effort. Relationships and creativity can enhance your identity—but require cultivation.",
      howItManifests: "Social skills improve with practice. Creative potential that blooms with effort. Love available when you reach for it.",
      realLifeExamples: [
        "Getting more comfortable socially over time",
        "Artistic skills developed through practice",
        "Love arriving when you show up for it",
        "Charm that grows with confidence"
      ],
      growthPath: "Your opportunity is cultivation. The grace is there—it needs development. Invest in your aesthetic sense, social skills, and relationship capacity."
    }
  },

  'Sun-Mars': {
    conjunction: {
      whatItFeelsLike: "Your identity and your drive are ONE. You ARE action. Sitting still feels like dying. You need to DO to feel like yourself. Courage is core to who you are.",
      howItManifests: "High energy. Leadership through action. May be competitive or combative. Difficulty relaxing. Identity expressed through initiative and physical engagement.",
      realLifeExamples: [
        "Needing physical activity to feel like yourself",
        "Being first or fastest matters",
        "Resting feels like giving up",
        "Others see you as intense or driven"
      ],
      growthPath: "Your gift is natural drive. Your growth edge is learning that you don't have to prove yourself through constant action. You can BE without DOING."
    },
    square: {
      whatItFeelsLike: "Your will and your drive clash. You want something but your energy either blocks it or attacks it. Frustration is familiar. Anger may be misdirected—at yourself or at goals.",
      howItManifests: "Self-sabotage through aggression or impatience. Starting strong and burning out. Conflict between who you are and what you want. Drive that feels like a battle.",
      realLifeExamples: [
        "Getting angry at yourself for not achieving",
        "Pushing so hard you exhaust yourself",
        "Wanting peace but creating conflict",
        "Success that feels like war"
      ],
      growthPath: "The friction is your fuel—but learn to use it, not be used by it. Your anger has information. Channel intensity rather than letting it scatter."
    },
    opposition: {
      whatItFeelsLike: "Your drive and assertion come out through others. You may attract competitive or aggressive partners. Conflicts show you your own warrior.",
      howItManifests: "Projecting action onto partners. Learning assertion through conflict in relationships. May attract Mars-types (athletes, fighters, doers) or become that for others.",
      realLifeExamples: [
        "Partners who are very driven or aggressive",
        "Fights that reveal what you really want",
        "Learning to act through relationship friction",
        "Projecting ambition or anger onto others"
      ],
      growthPath: "Own your Mars. The drive you keep finding in partners is YOURS. Stop outsourcing your warrior. Assert directly, not through relationship drama."
    },
    trine: {
      whatItFeelsLike: "Natural confidence and drive. Action and identity flow together. You pursue goals without inner conflict. Courage comes easily.",
      howItManifests: "Athletic or energetic nature. Leadership without ego battles. Things you want come through effort that doesn't feel like struggle.",
      realLifeExamples: [
        "Competitors who seem effortlessly ahead",
        "Goals that feel achievable",
        "Physical confidence",
        "Drive that doesn't feel like fighting"
      ],
      growthPath: "Ease can become complacency. Your gift is natural drive—now direct it at something worthy. Effortless action needs a worthy target."
    },
    sextile: {
      whatItFeelsLike: "Drive and initiative are available when you activate them. You CAN be assertive—it just takes conscious choice.",
      howItManifests: "Responds well to physical challenge. Confidence builds through action. Initiative pays off when you take it.",
      realLifeExamples: [
        "Sports improving with practice",
        "Confidence growing through doing",
        "Assertion available when you choose it",
        "Action yielding results"
      ],
      growthPath: "Your opportunity is activation. The drive is there—dormant until you use it. Take initiative; it gets easier each time."
    }
  },

  'Sun-Jupiter': {
    conjunction: {
      whatItFeelsLike: "Your identity is BIG. You feel destined for more, meant for growth, here for a reason. Optimism is core to who you are. You believe in yourself—sometimes too much.",
      howItManifests: "Natural confidence and expansiveness. May over-promise or over-extend. Generous but can be excessive. Identity wrapped up in meaning, belief, or vision.",
      realLifeExamples: [
        "Feeling like you're meant for something big",
        "Optimism that borders on naiveté",
        "Taking on too much because you believe you can",
        "Others seeing you as lucky or blessed"
      ],
      growthPath: "Your gift is natural faith. Your growth edge is learning that bigger isn't always better. Expansion needs grounding to become real."
    },
    square: {
      whatItFeelsLike: "Your ambitions and beliefs exceed your current reality. You feel destined for more but frustrated by limits. Over-extending, then feeling let down.",
      howItManifests: "Promising more than you can deliver. Big dreams, inconsistent follow-through. Faith that outpaces evidence. Restlessness with ordinary life.",
      realLifeExamples: [
        "Signing up for everything, finishing nothing",
        "Believing you're special but not doing the work",
        "Disappointment when reality doesn't match vision",
        "Restless until you find your 'big thing'"
      ],
      growthPath: "The friction is between vision and reality. You're not delusional—you're ahead of yourself. Learn to build the bridge between what you see and what you can do NOW."
    },
    opposition: {
      whatItFeelsLike: "Your sense of meaning and expansion comes through others. You may project 'teacher' or 'guru' onto partners. Beliefs get tested through relationship.",
      howItManifests: "Attracting philosophical or expansive partners. Learning faith through dialogue. May idolize or idealize. Growth through relationship challenges to your beliefs.",
      realLifeExamples: [
        "Partners who are teachers, travelers, or believers",
        "Relationships that challenge your worldview",
        "Learning to believe through others' faith",
        "Projecting wisdom onto partners"
      ],
      growthPath: "You are your own guru. The wisdom you keep finding in others is YOURS. Stop outsourcing meaning. Your beliefs are valid without external authority."
    },
    trine: {
      whatItFeelsLike: "Natural optimism and luck. Opportunities come easily. Faith feels justified by experience. Life tends to work out.",
      howItManifests: "Good fortune that seems natural. Confidence without arrogance. Growth opportunities that appear. May take luck for granted.",
      realLifeExamples: [
        "Things working out better than expected",
        "Opportunities appearing at right moments",
        "Natural faith in life",
        "Others seeing you as blessed"
      ],
      growthPath: "Luck without effort is shallow. Your gift is natural opportunity—now do something meaningful with it. Fortune favors the prepared."
    },
    sextile: {
      whatItFeelsLike: "Growth and opportunity are available when you reach for them. Optimism is buildable. Faith develops through action.",
      howItManifests: "Responds well to expansion opportunities. Travel or education enhance identity. Belief grows with positive experiences.",
      realLifeExamples: [
        "Travel that changed you",
        "Education expanding your sense of self",
        "Opportunities arriving when you seek them",
        "Faith building through experience"
      ],
      growthPath: "Your opportunity is expansion through effort. The luck is there—it needs activation. Seek growth; it's available when you ask."
    }
  },

  'Sun-Saturn': {
    conjunction: {
      whatItFeelsLike: "Your identity carries WEIGHT. You feel responsible for being someone, achieving something, proving yourself. Even as a child, you were 'serious.' Fun requires permission.",
      howItManifests: "Ambitious, disciplined, but potentially harsh on yourself. May have had heavy expectations from father or authority. Accomplishes much—but rarely feels 'enough.'",
      realLifeExamples: [
        "Feeling like the 'adult' even as a kid",
        "Imposter syndrome despite achievements",
        "Father who was absent, critical, or burdened",
        "Defining yourself through work and responsibility"
      ],
      growthPath: "You don't need to EARN the right to exist. Your seriousness is a gift—but so is play. Authority comes naturally once you stop proving yourself to the internal critic."
    },
    square: {
      whatItFeelsLike: "Confidence vs. self-doubt in constant friction. You're driven to achieve because you never feel like you've 'made it.' Every success reveals another mountain.",
      howItManifests: "Stop-start patterns with goals. Authority figures challenge you. Father wounds may appear as either rebellion or desperate approval-seeking. Builds incredible strength through struggle.",
      realLifeExamples: [
        "Achieving something and immediately focusing on what's lacking",
        "Conflicts with bosses until you become your own boss",
        "Feeling blocked when close to success",
        "Hard-won confidence that's actually real"
      ],
      growthPath: "The friction is the forge. Your authority is EARNED through exactly this struggle. Stop seeing obstacles as signs of failure—they're the curriculum."
    },
    opposition: {
      whatItFeelsLike: "You encounter authority through OTHERS. Partners, bosses, or mentors carry your Saturn until you own it yourself. May feel either controlled or abandoned by father figures.",
      howItManifests: "Attracts Saturnian (disciplined, limiting, authoritative) people. May project either competence or inadequacy. Relationships are where you learn about responsibility.",
      realLifeExamples: [
        "Partners who are older, more serious, or 'together'",
        "Bosses who either develop you or block you",
        "Learning discipline through relationship",
        "Feeling like others have it together while you don't"
      ],
      growthPath: "The authority you keep finding in others lives in you. Stop outsourcing your inner father. You ARE capable of structure, discipline, and mastery—without needing someone else to enforce it."
    },
    trine: {
      whatItFeelsLike: "Discipline feels natural. You're comfortable with responsibility and structure. Achievement flows without constant friction. Authority is assumed, not fought for.",
      howItManifests: "Natural leadership without ego battles. Patience comes easily. May have had supportive father figures. Success builds steadily over time.",
      realLifeExamples: [
        "People just assuming you're in charge",
        "Discipline without willpower battles",
        "Father who was present and supportive",
        "Long-term plans that actually work"
      ],
      growthPath: "Don't mistake ease for development. Your natural authority is a gift—now use it for something. Comfort doesn't equal growth. Seek challenges worthy of your stability."
    },
    sextile: {
      whatItFeelsLike: "Structure and discipline are AVAILABLE when you choose them. You can develop authority—it's just not automatic. Mentors help.",
      howItManifests: "Responds well to guidance and structure. Can build discipline with effort. May need external accountability to develop inner authority.",
      realLifeExamples: [
        "A mentor who helped you grow up",
        "Structure that felt supportive rather than oppressive",
        "Building confidence through practice",
        "Authority available when you claim it"
      ],
      growthPath: "Your opportunity is development. The capacity is there—it needs cultivation. Seek teachers, take responsibility, build the muscle. It's learnable."
    }
  },

  'Sun-Uranus': {
    conjunction: {
      whatItFeelsLike: "Your identity IS different. You're not trying to be unique—you just ARE. Fitting in feels like death. Authenticity is survival.",
      howItManifests: "Rebellious or eccentric by nature. May have felt like an outsider from childhood. Needs freedom to be yourself. Others see you as unusual, innovative, or disruptive.",
      realLifeExamples: [
        "Never fitting in with 'normal'",
        "Rebellion as self-expression, not just resistance",
        "Feeling allergic to convention",
        "Others calling you 'weird' as compliment or criticism"
      ],
      growthPath: "Your gift is authentic uniqueness. Your growth is learning that different doesn't mean disconnected. You can belong without conforming."
    },
    square: {
      whatItFeelsLike: "Tension between who you are and your need for freedom. You want to be yourself but it causes disruption. Sudden breaks from stability.",
      howItManifests: "Self-sabotage through sudden changes. Restlessness with anything stable. Rebellion that surprises even you. Creating chaos to feel free.",
      realLifeExamples: [
        "Quitting jobs suddenly when feeling trapped",
        "Relationships that break unexpectedly",
        "Feeling suffocated by commitment",
        "Freedom that disrupts connection"
      ],
      growthPath: "The friction is between stability and authenticity. You're learning that real freedom isn't about escaping—it's about being fully yourself WITHIN connection."
    },
    opposition: {
      whatItFeelsLike: "Your uniqueness and freedom come out through others. Partners are unusual or create sudden changes. Relationships teach you about authenticity.",
      howItManifests: "Attracting eccentric or unstable partners. Learning to be yourself through relationship disruption. May project rebel onto others.",
      realLifeExamples: [
        "Partners who are unconventional",
        "Relationships that end suddenly",
        "Learning freedom through others' independence",
        "Attracting chaos you're avoiding within"
      ],
      growthPath: "The rebel you keep finding in partners is YOU. Own your uniqueness directly instead of encountering it through relationship drama."
    },
    trine: {
      whatItFeelsLike: "Natural originality. Being different feels comfortable, not stressful. Innovation comes easily. You're unique without trying.",
      howItManifests: "Effortless authenticity. Creative and innovative without rebellion. Change feels exciting rather than destabilizing.",
      realLifeExamples: [
        "Being accepted as different",
        "Innovation that comes naturally",
        "Change as adventure, not crisis",
        "Uniqueness that doesn't alienate"
      ],
      growthPath: "Easy uniqueness can lack depth. Your gift is natural originality—now use it for something. Being different without purpose is just style."
    },
    sextile: {
      whatItFeelsLike: "Originality and independence are available when you cultivate them. You CAN be innovative—it just takes conscious choice.",
      howItManifests: "Responds well to creative freedom. Innovation blooms with permission. Authenticity develops over time.",
      realLifeExamples: [
        "Creative environments unlocking something",
        "Permission to be different helping",
        "Innovation growing with practice",
        "Authenticity developing with safety"
      ],
      growthPath: "Your opportunity is conscious uniqueness. The original self is there—it needs permission and cultivation. Seek environments that welcome difference."
    }
  },

  'Sun-Neptune': {
    conjunction: {
      whatItFeelsLike: "Your identity is FLUID. You don't have fixed edges. You're whoever you're with, whatever you're dreaming, wherever you're imagining. Boundaries between self and fantasy blur.",
      howItManifests: "Artistic, spiritual, or chameleon-like. Strong imagination but unclear sense of self. May be a natural actor, artist, or healer—or feel chronically confused about identity.",
      realLifeExamples: [
        "Not knowing who you are without others",
        "Creative gifts that feel like channeling",
        "Difficulty saying 'this is ME'",
        "Feeling everything, identifying with everyone"
      ],
      growthPath: "Your gift is permeability—you sense what others can't. Your growth is learning that fluid doesn't mean formless. You can have both imagination AND identity."
    },
    square: {
      whatItFeelsLike: "Friction between who you are and who you imagine being. Chronic confusion about identity. Reality disappoints because it's not as magical as your inner world.",
      howItManifests: "Escapism when reality is hard. Illusions about self—grandiose or victimized. Creative blocks or creative brilliance. Disillusionment as a recurring theme.",
      realLifeExamples: [
        "Creating fantasy lives to escape ordinary self",
        "Confusion about your real abilities",
        "Addiction or escapism patterns",
        "Creative genius blocked by confusion"
      ],
      growthPath: "The friction is between fantasy and reality. You're not delusional—you're visionary. But vision needs GROUND. Learn to bring dreams into form, not just dream."
    },
    opposition: {
      whatItFeelsLike: "You experience your imaginative, spiritual self through others. Partners carry your Neptune. You may idealize or be disillusioned by relationships.",
      howItManifests: "Attracting artistic, spiritual, or confusing partners. Projecting ideals onto relationships. Learning about your own imagination through disillusionment.",
      realLifeExamples: [
        "Partners who seem magical then disappointing",
        "Relationships with artists, addicts, or healers",
        "Learning about fantasy through love",
        "Idealizing then demonizing partners"
      ],
      growthPath: "The magic you keep finding—and losing—in others is YOURS. Own your Neptune. Your imagination belongs to you, not to those you project it onto."
    },
    trine: {
      whatItFeelsLike: "Natural imagination, spirituality, and creativity. The dream world enhances rather than confuses identity. Fantasy and self flow together.",
      howItManifests: "Artistic gifts that feel natural. Spiritual sense that's grounded. Imagination that serves rather than escapes. Natural healer or artist.",
      realLifeExamples: [
        "Creative work that flows",
        "Intuition that's reliable",
        "Spirituality that feels like home",
        "Fantasy that enriches life"
      ],
      growthPath: "Flow can lack rigor. Your gift is natural imagination—now discipline it. Easy creativity still needs craft. Develop the skill to match the vision."
    },
    sextile: {
      whatItFeelsLike: "Imagination and spirituality are available when you cultivate them. Creative or intuitive gifts can develop—they're not automatic.",
      howItManifests: "Responds well to artistic or spiritual training. Imagination blooms with encouragement. Creative capacity grows with practice.",
      realLifeExamples: [
        "Art classes that opened something",
        "Meditation practice that developed intuition",
        "Creativity growing with encouragement",
        "Spiritual sense developing over time"
      ],
      growthPath: "Your opportunity is cultivation. The imaginative self is there—it needs invitation. Seek creative and spiritual contexts that develop your vision."
    }
  },

  'Sun-Pluto': {
    conjunction: {
      whatItFeelsLike: "Your identity is INTENSE. You're not casual about anything, especially yourself. You feel everything deeply. Power—having it, fearing it, using it—is central to who you are.",
      howItManifests: "Magnetic presence. Others feel your intensity. May have survived something that forged you. Control issues, power dynamics, and transformation are constant themes.",
      realLifeExamples: [
        "People sensing your presence before you speak",
        "Surviving experiences that would break others",
        "Power dynamics in every interaction",
        "Intensity that attracts and repels"
      ],
      growthPath: "Your gift is transformative presence. Your growth is learning that power doesn't require control. You can be powerful AND surrendered. Intensity doesn't have to isolate."
    },
    square: {
      whatItFeelsLike: "Constant friction between your will and forces that overpower it. Power struggles—internal and external. Crises that force you to become who you really are.",
      howItManifests: "Life events that break and remake you. Authority conflicts. Intensity that feels like survival. The self that emerges is forged, not inherited.",
      realLifeExamples: [
        "Crises that completely changed you",
        "Power struggles with father or authority",
        "Feeling destroyed and reborn repeatedly",
        "Intensity that exhausts you and others"
      ],
      growthPath: "The friction IS the forging. You're not being punished—you're being made. Every crisis is initiation. The power you build through this is REAL."
    },
    opposition: {
      whatItFeelsLike: "You encounter power and intensity through others. Partners carry your Pluto. Power struggles in relationships teach you about your own depth.",
      howItManifests: "Attracting powerful or controlling partners. Learning about your own intensity through relationship. Projection of power dynamics.",
      realLifeExamples: [
        "Partners who are intense, controlling, or transformative",
        "Power struggles as relationship pattern",
        "Learning your own depth through others",
        "Relationships that completely change you"
      ],
      growthPath: "The power you keep finding in others is YOURS. Own your Pluto. Stop outsourcing intensity. You are the transformer, not just the transformed."
    },
    trine: {
      whatItFeelsLike: "Natural depth and power. Intensity feels manageable. You transform without crisis. Others sense your substance without being threatened.",
      howItManifests: "Natural psychological insight. Power used well. Transformation through evolution rather than crisis. Magnetic without being overwhelming.",
      realLifeExamples: [
        "Depth that doesn't overwhelm",
        "Power that serves rather than dominates",
        "Transformation as natural growth",
        "Intensity that others trust"
      ],
      growthPath: "Easy depth can lack testing. Your gift is natural power—but is it tempered? Seek challenges that test your transformation. Untested power stays unconscious."
    },
    sextile: {
      whatItFeelsLike: "Depth and power are available when you cultivate them. Transformation is possible through conscious engagement.",
      howItManifests: "Responds well to depth work. Therapy, research, or inner work develops power. Transformation through intention rather than crisis.",
      realLifeExamples: [
        "Therapy that genuinely transformed you",
        "Choosing to go deep",
        "Power developed through practice",
        "Transformation through conscious choice"
      ],
      growthPath: "Your opportunity is intentional depth. The power is there—it needs development. Seek experiences that draw out your intensity constructively."
    }
  },

  // ============================================================================
  // MOON ASPECTS
  // ============================================================================

  'Moon-Mercury': {
    conjunction: {
      whatItFeelsLike: "Your mind and emotions are FUSED. You think about feelings and feel about thoughts. Emotions are articulated easily—sometimes too easily. Can't stop analyzing how you feel.",
      howItManifests: "Strong emotional intelligence. May over-think feelings. Writing or talking about emotions helps process. Memory tied to emotional states.",
      realLifeExamples: [
        "Journaling to process feelings",
        "Anxiety from over-analyzing emotions",
        "Good at expressing how you feel",
        "Remembering based on how you felt"
      ],
      growthPath: "Your gift is emotional articulation. Your growth is learning to FEEL without immediately THINKING about it. Sometimes feelings just need to be felt, not processed."
    },
    square: {
      whatItFeelsLike: "Head and heart clash. What you think and what you feel don't match. Logic interrupts emotion; emotion overwhelms logic. Anxiety lives here.",
      howItManifests: "Saying things you don't feel. Feeling things you can't explain. Anxiety, nervousness, or mental restlessness. Conflict between reason and intuition.",
      realLifeExamples: [
        "Knowing something is wrong but can't explain it",
        "Talking yourself out of feelings",
        "Nervous habits when emotional",
        "Overthinking emotional situations"
      ],
      growthPath: "The friction is the integration work. Head and heart don't have to agree—they have to communicate. Practice: let feelings exist before analyzing them."
    },
    opposition: {
      whatItFeelsLike: "You understand your feelings through dialogue. Others help you process emotions. May project emotion onto logic or vice versa.",
      howItManifests: "Needing to talk to know how you feel. Attracting very mental or very emotional people. Learning emotional articulation through relationship.",
      realLifeExamples: [
        "Not knowing feelings until talking about them",
        "Partners who are very rational or very emotional",
        "Communication as emotional processing",
        "Learning to express through dialogue"
      ],
      growthPath: "Dialogue is your processing style—honor it. But develop internal emotional clarity too. You can know your heart without external translation."
    },
    trine: {
      whatItFeelsLike: "Natural emotional intelligence. Speaking about feelings comes easily. Mind and heart work together without effort.",
      howItManifests: "Easy communication about emotional matters. Natural counselor or listener. Thoughts and feelings harmonize.",
      realLifeExamples: [
        "Being the person people talk to",
        "Expressing emotions clearly",
        "Thinking that feels natural",
        "Emotional communication as gift"
      ],
      growthPath: "Easy doesn't mean deep. Your gift is natural emotional expression—now go deeper. Surface fluency can avoid the hard feelings."
    },
    sextile: {
      whatItFeelsLike: "Emotional articulation is available when you practice. You CAN express feelings—it develops over time.",
      howItManifests: "Responds well to emotional communication training. Writing about feelings helps. Communication skills grow with effort.",
      realLifeExamples: [
        "Journaling improving emotional clarity",
        "Learning to express through practice",
        "Communication getting easier with effort",
        "Emotional vocabulary developing"
      ],
      growthPath: "Your opportunity is development. The emotional-mental bridge is buildable. Practice expression; it gets easier."
    }
  },

  'Moon-Venus': {
    conjunction: {
      whatItFeelsLike: "Your emotional needs and your love nature are ONE. Being loved IS feeling secure. Affection and safety are inseparable. You need beauty to feel okay.",
      howItManifests: "Strong need for love and comfort. Emotional security through relationship. May be dependent on being loved. Natural warmth and grace.",
      realLifeExamples: [
        "Feeling unsafe when unloved",
        "Need for physical affection",
        "Comfort through beauty and pleasure",
        "Nurturing through appreciation"
      ],
      growthPath: "Your gift is natural warmth. Your growth is learning that you're lovable even when alone. Self-love before requiring love from others."
    },
    square: {
      whatItFeelsLike: "What you need emotionally and what you want romantically clash. Attracted to people who don't meet your needs. Needing love but not feeling worthy.",
      howItManifests: "Love patterns that repeat painfully. Self-worth issues in relationships. Needing comfort but attracting challenge. Emotional-relational friction.",
      realLifeExamples: [
        "Wanting love from people who can't give it",
        "Feeling unworthy of the love you get",
        "Relationship patterns that hurt",
        "Comfort and desire at odds"
      ],
      growthPath: "The friction is teaching you self-worth. You're learning to love yourself the way you need, not the way others approve. Self-love first."
    },
    opposition: {
      whatItFeelsLike: "You experience love and nurturing through others. Partners carry your Venus. Relationships are where you learn about emotional-romantic balance.",
      howItManifests: "Attracting very Venusian partners. Learning self-worth through relationship. May give too much or expect too much.",
      realLifeExamples: [
        "Partners who are very loving or very beautiful",
        "Learning worth through being valued",
        "Relationships that teach about needs",
        "Projection of love nature onto others"
      ],
      growthPath: "The love you keep seeking in others is YOURS. Own your Venus. Stop outsourcing your worth. You are already lovable."
    },
    trine: {
      whatItFeelsLike: "Natural emotional grace. Love and security flow together. Relationships feel easy and nurturing. Warmth comes naturally.",
      howItManifests: "Easy affection. Comfortable with love. Natural charm and emotional grace. Relationships that feel supportive.",
      realLifeExamples: [
        "People feeling comfortable around you",
        "Love that comes without drama",
        "Natural appreciation for beauty",
        "Emotional warmth that flows"
      ],
      growthPath: "Easy love can lack depth. Your gift is natural affection—now develop it. Comfortable isn't the same as deep. Seek love that challenges and grows you."
    },
    sextile: {
      whatItFeelsLike: "Love and emotional security are available when you cultivate them. Affection grows with effort and openness.",
      howItManifests: "Responds well to loving environments. Relationships improve with effort. Emotional-romantic skills develop over time.",
      realLifeExamples: [
        "Relationships improving with work",
        "Love available when you reach for it",
        "Affection growing with practice",
        "Worth developing through experience"
      ],
      growthPath: "Your opportunity is cultivation. The loving capacity is there—it needs development. Open your heart; it gets easier with practice."
    }
  },

  'Moon-Mars': {
    conjunction: {
      whatItFeelsLike: "Your emotions and actions are FUSED. You feel something and you ACT on it immediately. Emotional reactions are fast, physical, sometimes volcanic.",
      howItManifests: "Quick emotional responses. Protective instincts. May have temper issues. Feelings expressed through action. 'Mama bear' energy.",
      realLifeExamples: [
        "Acting before thinking when upset",
        "Physical exercise when emotional",
        "Quick to defend loved ones",
        "Feelings that need movement"
      ],
      growthPath: "Your gift is emotional courage. Your growth is learning to feel without immediately reacting. Pause between feeling and action."
    },
    square: {
      whatItFeelsLike: "Emotions and actions clash. Anger that doesn't know where to go. Feeling frustrated but not knowing how to express it. Volatility.",
      howItManifests: "Misdirected anger. Emotional outbursts. Difficulty with asserting needs. Suppressed rage or explosive temper.",
      realLifeExamples: [
        "Getting angry at the wrong people",
        "Rage that surprises you",
        "Difficulty asking for what you need",
        "Moods that swing to anger"
      ],
      growthPath: "The friction is teaching healthy assertion. Your anger has information—it tells you what you need. Learn to express needs before they become rage."
    },
    opposition: {
      whatItFeelsLike: "Your emotional reactions come out through others. Partners trigger your anger. Relationships involve passion and conflict.",
      howItManifests: "Attracting aggressive or assertive partners. Learning to defend yourself through relationship. Projection of anger.",
      realLifeExamples: [
        "Partners who are angry or competitive",
        "Fights in relationships as pattern",
        "Learning assertion through others",
        "Projecting your anger onto partners"
      ],
      growthPath: "The warrior you keep finding in partners is YOURS. Own your Mars. Assert directly instead of encountering it through relationship conflict."
    },
    trine: {
      whatItFeelsLike: "Emotions and actions flow together naturally. You can defend yourself without drama. Feelings move into action smoothly.",
      howItManifests: "Natural emotional courage. Asserting needs comes easily. Protective without being aggressive. Healthy anger expression.",
      realLifeExamples: [
        "Speaking up naturally",
        "Healthy boundaries",
        "Exercise helping emotions",
        "Action that feels instinctive"
      ],
      growthPath: "Easy assertion can lack depth. Your gift is natural emotional courage—now direct it. What are you fighting FOR?"
    },
    sextile: {
      whatItFeelsLike: "Emotional courage is available when you develop it. You CAN assert your needs—it takes practice.",
      howItManifests: "Responds well to assertiveness training. Physical activity helps emotions. Courage develops over time.",
      realLifeExamples: [
        "Getting better at boundaries with practice",
        "Sports helping emotional regulation",
        "Assertiveness growing with effort",
        "Learning to stand up for yourself"
      ],
      growthPath: "Your opportunity is development. The courage is there—it needs practice. Assert your needs; it gets easier."
    }
  },

  'Moon-Jupiter': {
    conjunction: {
      whatItFeelsLike: "Your emotions are BIG. You feel everything abundantly—joy, sorrow, hope. Optimism is emotional. You BELIEVE with your whole heart.",
      howItManifests: "Generous emotional nature. May over-give emotionally. Nurturing through expansion and encouragement. Feelings that overflow.",
      realLifeExamples: [
        "Feeling everything intensely",
        "Optimism that's felt, not just thought",
        "Generosity that doesn't know limits",
        "Emotional abundance"
      ],
      growthPath: "Your gift is emotional generosity. Your growth is learning boundaries. You can feel big without giving away everything."
    },
    square: {
      whatItFeelsLike: "Your need for security clashes with your need for growth. You want comfort AND expansion but they conflict. Emotional restlessness.",
      howItManifests: "Feeling stuck then overcompensating. Comfort that feels stifling. Growth that feels destabilizing. Promise more emotional support than you can give.",
      realLifeExamples: [
        "Restless in security",
        "Comfort that becomes a cage",
        "Over-promising care",
        "Growth that disrupts safety"
      ],
      growthPath: "The friction is between security and expansion. You can have both—but not by swinging between extremes. Stable growth, not chaotic expansion."
    },
    opposition: {
      whatItFeelsLike: "Your emotional expansion comes through others. Partners carry your Jupiter. Relationships involve growth and abundance.",
      howItManifests: "Attracting philosophical or generous partners. Learning faith through relationship. May project optimism onto others.",
      realLifeExamples: [
        "Partners who are teachers or travelers",
        "Relationships that expand your world",
        "Learning to believe through others",
        "Projection of faith onto partners"
      ],
      growthPath: "The abundance you keep finding in others is YOURS. Own your Jupiter. Your faith is valid without external confirmation."
    },
    trine: {
      whatItFeelsLike: "Natural emotional abundance. Faith feels emotionally true. Generosity flows without effort. Optimism as emotional baseline.",
      howItManifests: "Easy emotional generosity. Faith that feels natural. Nurturing through growth. Lucky in emotional matters.",
      realLifeExamples: [
        "Things working out emotionally",
        "Natural generosity of spirit",
        "Faith that feels like home",
        "Emotional support that flows"
      ],
      growthPath: "Easy abundance can lack depth. Your gift is natural emotional generosity—now develop boundaries. Infinite giving depletes you."
    },
    sextile: {
      whatItFeelsLike: "Emotional growth and faith are available when you cultivate them. Optimism develops through positive experiences.",
      howItManifests: "Responds well to emotional expansion. Faith builds with effort. Generosity grows through practice.",
      realLifeExamples: [
        "Positive experiences building faith",
        "Learning to be generous",
        "Optimism growing over time",
        "Emotional wisdom developing"
      ],
      growthPath: "Your opportunity is cultivation. The emotional abundance is there—it needs development. Seek experiences that grow your heart."
    }
  },

  'Moon-Saturn': {
    conjunction: {
      whatItFeelsLike: "Emotions feel heavy, controlled, or restricted. You learned early that feelings need to be managed—maybe because showing them wasn't safe. Responsible with your heart.",
      howItManifests: "Emotional maturity but also emotional restriction. Mother may have been cold, burdened, or needed YOU to parent HER. Depression, stoicism, or 'old soul' energy. Deep loyalty once trust is earned.",
      realLifeExamples: [
        "Being the emotional support for your parent as a child",
        "Difficulty crying or asking for comfort",
        "Deep loyalty but slow to trust",
        "Feeling like emotions are a burden"
      ],
      growthPath: "You CAN feel. The restriction was a survival skill—it's not who you are. Safety now exists. Allow emotions without immediately managing them."
    },
    square: {
      whatItFeelsLike: "A battle between the need for emotional security and forces that seem to deny it. You want comfort but feel you can't have it—or shouldn't. Guilt around emotional needs.",
      howItManifests: "Depression patterns. Fear of vulnerability. May have had critical or unavailable mother. Learns self-sufficiency the hard way. Eventually develops profound emotional wisdom.",
      realLifeExamples: [
        "Feeling guilty for having needs",
        "Mother who was critical, depressed, or absent",
        "Earning love through being 'good'",
        "Fear that love is conditional"
      ],
      growthPath: "Your needs are LEGITIMATE. The guilt isn't truth—it's programming. Healing means letting yourself receive without earning it first."
    },
    opposition: {
      whatItFeelsLike: "Emotional coldness or warmth gets projected onto relationships. You may attract Saturnian (cold, responsible, withholding) people—or become the cold one yourself.",
      howItManifests: "Mother/father split plays out through partners. Learning emotional responsibility through relationship. May feel partners either control your feelings or can't handle them.",
      realLifeExamples: [
        "Partners who are emotionally unavailable",
        "Being the 'practical' one in relationships",
        "Feeling like you carry emotional responsibility",
        "Learning to balance nurturing and limits"
      ],
      growthPath: "Stop splitting feeling and duty. You can be BOTH emotionally present AND responsible. The opposition resolves when you stop outsourcing one pole."
    },
    trine: {
      whatItFeelsLike: "Emotional steadiness. Your feelings are reliable, patient, and grounded. Not dramatic—but deep. You provide solid emotional presence for others.",
      howItManifests: "Natural emotional maturity. Calm in crisis. May have had stable early home life. Wisdom about emotional needs comes naturally. Loyal beyond measure.",
      realLifeExamples: [
        "Being the calm one in emotional situations",
        "Stable home environment growing up",
        "People trusting you with their vulnerability",
        "Emotions that feel manageable"
      ],
      growthPath: "Stability is your gift. Now deepen it. Your groundedness can become rigidity if you don't keep growing. Stay open to emotional experience, not just emotional management."
    },
    sextile: {
      whatItFeelsLike: "Emotional maturity is available through effort. You CAN develop stability, patience, and groundedness—it just requires conscious work.",
      howItManifests: "Responds well to emotional guidance. Can build healthy coping patterns. Therapy or mentorship helps. Growing into emotional wisdom over time.",
      realLifeExamples: [
        "Therapy that genuinely helped",
        "Learning emotional skills that weren't modeled",
        "Developing patience through practice",
        "Support systems that taught you safety"
      ],
      growthPath: "The stability is learnable. You may not have been raised with emotional wisdom—but you can cultivate it. The skills are available; invest in them."
    }
  },

  'Moon-Uranus': {
    conjunction: {
      whatItFeelsLike: "Your emotions are UNPREDICTABLE—even to you. Feelings arrive suddenly, change rapidly. What you needed yesterday isn't what you need today. Emotional freedom is essential.",
      howItManifests: "Unusual relationship with mother or home. Emotional independence or detachment. Needs space to feel. Uncomfortable with emotional routine.",
      realLifeExamples: [
        "Mother who was absent or unconventional",
        "Feeling emotions that surprise you",
        "Need for space in relationships",
        "Comfort with change"
      ],
      growthPath: "Your gift is emotional independence. Your growth is learning that freedom doesn't require detachment. You can be close AND free."
    },
    square: {
      whatItFeelsLike: "Security and freedom at war. You want stability but feel trapped by it. Sudden emotional disruptions. Need for change that destabilizes you.",
      howItManifests: "Breaking from relationships suddenly. Emotional volatility. Sabotaging security. Mother relationship may have been unstable.",
      realLifeExamples: [
        "Leaving when things get too comfortable",
        "Emotional outbursts that surprise you",
        "Need for change conflicting with need for safety",
        "Relationships ending suddenly"
      ],
      growthPath: "The friction is between stability and freedom. You can have both—but it requires conscious integration. Build security that includes change."
    },
    opposition: {
      whatItFeelsLike: "Your need for freedom comes out through others. Partners are unpredictable. Relationships bring sudden change to your emotional life.",
      howItManifests: "Attracting unusual or unstable partners. Learning about freedom through relationship disruption. Projection of restlessness.",
      realLifeExamples: [
        "Partners who are erratic or freedom-loving",
        "Relationships that end unexpectedly",
        "Others bringing change to your stability",
        "Learning independence through others"
      ],
      growthPath: "The freedom you keep finding in others is YOURS. Own your Uranus. Be your own source of change rather than attracting it through partners."
    },
    trine: {
      whatItFeelsLike: "Emotional freedom feels natural. Change is exciting, not destabilizing. You're comfortable with unconventional needs. Intuitive flashes guide feelings.",
      howItManifests: "Easy with emotional change. Unusual but stable emotional nature. Intuition flows naturally. Comfort with difference.",
      realLifeExamples: [
        "Change that feels refreshing",
        "Intuitive hits that prove accurate",
        "Emotional independence without coldness",
        "Unconventional but stable"
      ],
      growthPath: "Easy freedom can lack commitment. Your gift is emotional independence—now build something with it. Freedom for its own sake is empty."
    },
    sextile: {
      whatItFeelsLike: "Emotional freedom is available when you cultivate it. You CAN be independent without detachment—it develops with practice.",
      howItManifests: "Responds well to new emotional experiences. Change can be managed. Independence grows with safety.",
      realLifeExamples: [
        "Learning to be comfortable alone",
        "Change becoming less scary",
        "Independence developing over time",
        "New experiences helping growth"
      ],
      growthPath: "Your opportunity is conscious independence. The freedom is there—it needs development. Seek experiences that build healthy emotional autonomy."
    }
  },

  'Moon-Neptune': {
    conjunction: {
      whatItFeelsLike: "Your emotions are OCEANIC. You feel everything—yours and everyone else's. Boundaries between self and other blur. Psychic impressions, artistic feelings, spiritual sensitivity.",
      howItManifests: "Strong intuition. May absorb others' emotions. Creative or spiritual emotional nature. Difficulty distinguishing your feelings from others'.",
      realLifeExamples: [
        "Knowing what others feel without being told",
        "Feeling exhausted in crowds",
        "Dreams that carry emotional information",
        "Confusion about whose feelings are whose"
      ],
      growthPath: "Your gift is emotional permeability. Your growth is learning BOUNDARIES. You can sense without absorbing. Feel without drowning."
    },
    square: {
      whatItFeelsLike: "Emotional confusion. Is this my feeling or someone else's? Am I sad or picking up sadness? Reality and imagination blur in uncomfortable ways.",
      howItManifests: "Emotional escapism. Addiction patterns. Confusion about needs. May have had confusing mother relationship. Seeks escape when emotions overwhelm.",
      realLifeExamples: [
        "Not knowing if feelings are real or imagined",
        "Escaping through substances or fantasy",
        "Mother who was confusing or absent",
        "Feeling lost in others' emotions"
      ],
      growthPath: "The friction is between feeling and confusion. You're learning discernment—what's yours, what's not. Grounding practices help. Feeling isn't the same as being lost."
    },
    opposition: {
      whatItFeelsLike: "Your sensitivity comes out through others. Partners are confusing, artistic, or addictive. Relationships blur boundaries.",
      howItManifests: "Attracting Neptunian (dreamy, confusing, spiritual) partners. Learning about your own sensitivity through relationship. Projection of ideals or illusions.",
      realLifeExamples: [
        "Partners who are artists, addicts, or healers",
        "Relationships that confuse you",
        "Learning about sensitivity through others",
        "Idealization and disillusionment patterns"
      ],
      growthPath: "The sensitivity you keep finding in partners is YOURS. Own your Neptune. Your intuition is valid. Stop projecting it onto others."
    },
    trine: {
      whatItFeelsLike: "Natural emotional intuition. Sensitivity that works for you rather than overwhelming you. Dreams and feelings in harmony.",
      howItManifests: "Psychic impressions that are reliable. Creative emotional expression. Spiritual sensitivity that's grounded. Natural healer energy.",
      realLifeExamples: [
        "Intuition that's accurate",
        "Creative gifts that flow",
        "Sensing without being overwhelmed",
        "Spiritual feelings that guide"
      ],
      growthPath: "Easy sensitivity can lack boundaries. Your gift is natural intuition—now protect it. Being open doesn't mean being unguarded."
    },
    sextile: {
      whatItFeelsLike: "Intuition and sensitivity are available when you cultivate them. You CAN develop psychic or creative gifts—they're not automatic.",
      howItManifests: "Responds well to intuitive training. Meditation helps. Creativity blooms with encouragement. Sensitivity develops safely.",
      realLifeExamples: [
        "Meditation opening intuition",
        "Art classes developing creativity",
        "Sensitivity growing with practice",
        "Dreams becoming more meaningful"
      ],
      growthPath: "Your opportunity is cultivation. The intuitive capacity is there—it needs development. Seek practices that develop sensitivity with boundaries."
    }
  },

  'Moon-Pluto': {
    conjunction: {
      whatItFeelsLike: "Emotions don't just pass through you—they CLAIM you. Feelings are volcanic, consuming, transformative. You can't do 'light' emotions. Joy is ecstatic, grief is annihilating, love is obsessive.",
      howItManifests: "Intensity in all emotional bonds. Mother relationship likely complex—either enmeshed or painful or both. You sense undercurrents others miss. Jealousy, possessiveness, or fear of abandonment may appear.",
      realLifeExamples: [
        "Loving someone so intensely it scares you",
        "Knowing what people are feeling before they say it",
        "Mother was controlling, transformative, or absent",
        "Emotional experiences that completely changed you"
      ],
      growthPath: "Your feelings ARE power. The question is: do they control you or do you channel them? Learning to hold intensity without drowning in it IS the work."
    },
    square: {
      whatItFeelsLike: "A war between your need for emotional security and forces that keep dismantling it. Just when you feel safe, something rips it away. Crisis is familiar. You expect the other shoe to drop.",
      howItManifests: "Trust issues. Emotional volatility that erupts unexpectedly. May have experienced early trauma around safety, mother, or home. You develop incredible resilience—but at what cost?",
      realLifeExamples: [
        "Homes that didn't feel safe",
        "Learning to read emotional 'weather' as survival skill",
        "Relationships that swing between intense closeness and devastating rupture",
        "The feeling that relaxing makes you vulnerable"
      ],
      growthPath: "The crisis pattern ends when you stop bracing for impact. Security isn't about controlling outcomes—it's about knowing you can survive them. You already proved you can."
    },
    opposition: {
      whatItFeelsLike: "Emotional power dynamics play out through relationships. You may attract controlling partners—or become controlling yourself. The push-pull between intimacy and autonomy is constant.",
      howItManifests: "Others trigger your deepest emotional material. Power struggles in close relationships. You may project your own intensity onto partners, or find yourself in dynamics with strong plutonian people.",
      realLifeExamples: [
        "Partners who are jealous, controlling, or transformative",
        "Feeling like relationships change you completely—for better or worse",
        "Difficulty finding 'equal' emotional footing",
        "Intimacy that feels like life-or-death"
      ],
      growthPath: "What you keep finding in others lives in you. Own your power directly instead of encountering it through relationship dramas. Become the transformer, not just the transformed."
    },
    trine: {
      whatItFeelsLike: "Emotional depth is natural and manageable. You handle intense feelings well. Psychological insight comes easily. You're the friend people trust with their secrets.",
      howItManifests: "Natural therapist or healer energy. You transform through feelings without being destroyed by them. Intense experiences integrate smoothly. Resilience feels natural.",
      realLifeExamples: [
        "Being the person others confide their darkest things to",
        "Handling crisis with eerie calm",
        "Feeling renewed after experiences that wreck others",
        "Intuition that just 'knows'"
      ],
      growthPath: "Don't undervalue what comes easily. Your emotional alchemy is a gift others spend years developing. Now USE it—your depth can heal beyond yourself."
    },
    sextile: {
      whatItFeelsLike: "Emotional depth is accessible when you reach for it. Transformation is available through conscious engagement with your feelings, not just automatic.",
      howItManifests: "Therapy works well for you. Deep conversations leave you feeling better. You CAN access psychological insight—it just takes intention.",
      realLifeExamples: [
        "A powerful therapy experience",
        "Crisis that you actively chose to grow from",
        "Choosing depth over distraction",
        "Emotional healing through engagement"
      ],
      growthPath: "The depth is there when you invite it. Don't avoid the dark—it transforms when you turn toward it. Your gift activates through choice."
    }
  },

  // ============================================================================
  // MERCURY ASPECTS
  // ============================================================================

  'Mercury-Venus': {
    conjunction: {
      whatItFeelsLike: "Your mind is drawn to beauty, harmony, and relationship. You think about love. You communicate with grace. Aesthetics matter to how you process information.",
      howItManifests: "Charming communicator. May prioritize pleasantness over truth. Artistic thinking. Relationships on your mind. Diplomatic speech.",
      realLifeExamples: [
        "Smoothing over conflict in conversation",
        "Thinking about relationships a lot",
        "Beautiful handwriting or speaking voice",
        "Avoiding 'ugly' topics"
      ],
      growthPath: "Your gift is graceful communication. Your growth is learning that truth matters more than harmony sometimes. Beautiful lies are still lies."
    },
    square: {
      whatItFeelsLike: "Friction between thinking and loving. What you say and what you value clash. Communication causes relationship problems. Saying things that hurt love.",
      howItManifests: "Foot-in-mouth disease in love. Values that don't match your words. Communication style that creates friction in relationships.",
      realLifeExamples: [
        "Saying the wrong thing to partners",
        "Thinking you're being charming when you're not",
        "Communication breakdowns in love",
        "Values vs. logic conflicts"
      ],
      growthPath: "The friction is between truth and harmony. You're learning that authentic communication serves love better than false sweetness. Say what you mean kindly."
    },
    opposition: {
      whatItFeelsLike: "You understand love through dialogue. Partners teach you about beauty and values. Communication happens in relationship.",
      howItManifests: "Learning to communicate through partnership. Attracting artistic or charming communicators. Dialogue about values.",
      realLifeExamples: [
        "Partners who teach you about love",
        "Communication that happens best with others",
        "Learning values through dialogue",
        "Relationship as communication school"
      ],
      growthPath: "The grace you keep finding in partners is YOURS. Own your Venus in communication. You can be charming and authentic without needing others to show you how."
    },
    trine: {
      whatItFeelsLike: "Natural charm in communication. Words flow pleasantly. Beauty and mind harmonize. Social grace feels effortless.",
      howItManifests: "Easy communicator. Artistic expression flows. Diplomatic without trying. People like how you speak.",
      realLifeExamples: [
        "Saying the right thing naturally",
        "Creative communication",
        "Social ease in conversation",
        "Natural diplomacy"
      ],
      growthPath: "Easy charm can be superficial. Your gift is graceful communication—now develop depth. Pleasant isn't the same as true."
    },
    sextile: {
      whatItFeelsLike: "Communication grace is available when you cultivate it. You CAN be charming—it develops with practice.",
      howItManifests: "Responds well to communication coaching. Diplomatic skills grow. Artistic expression develops over time.",
      realLifeExamples: [
        "Getting better at social situations",
        "Artistic skills developing",
        "Diplomacy improving with practice",
        "Charm growing over time"
      ],
      growthPath: "Your opportunity is development. The social grace is there—it needs cultivation. Practice charm; it becomes natural."
    }
  },

  'Mercury-Mars': {
    conjunction: {
      whatItFeelsLike: "Your mind is FAST and SHARP. Thoughts come quickly, words are direct. You say what you think—immediately. Mental debate energizes you.",
      howItManifests: "Quick thinking. May be argumentative. Sharp wit or sharp tongue. Mental energy needs outlet. Words as weapons or tools.",
      realLifeExamples: [
        "Winning arguments easily",
        "Speaking before thinking",
        "Quick comebacks",
        "Debates as recreation"
      ],
      growthPath: "Your gift is mental speed and directness. Your growth is learning that being right isn't the same as being kind. Slow down before speaking."
    },
    square: {
      whatItFeelsLike: "Thoughts and actions clash. You say things you don't do or do things you don't say. Mental frustration. Anger comes out through words.",
      howItManifests: "Aggressive communication. Saying things you regret. Thoughts that don't translate to action. Mental restlessness.",
      realLifeExamples: [
        "Angry emails you wish you hadn't sent",
        "Great ideas poor execution",
        "Verbal aggression",
        "Thinking about doing more than doing"
      ],
      growthPath: "The friction is between thinking and acting. Learn to channel mental energy into action. Words have consequences—use them wisely."
    },
    opposition: {
      whatItFeelsLike: "Your assertive communication comes out through others. Partners are direct or argumentative. Debate happens in relationship.",
      howItManifests: "Attracting sharp communicators. Learning assertion through dialogue. May project aggression onto others.",
      realLifeExamples: [
        "Partners who speak bluntly",
        "Arguments in relationships",
        "Learning directness through others",
        "Projecting anger into communication"
      ],
      growthPath: "The sharpness you keep finding in partners is YOURS. Own your mental assertiveness. Speak directly rather than encountering directness through others."
    },
    trine: {
      whatItFeelsLike: "Natural mental quickness. Thoughts become action smoothly. Communication is direct without being harsh. Energy and intellect flow together.",
      howItManifests: "Quick thinking that works. Assertive communication that lands. Mental energy channeled well. Debate that's productive.",
      realLifeExamples: [
        "Good at quick thinking",
        "Directness that doesn't offend",
        "Mental energy that's channeled",
        "Action following thought naturally"
      ],
      growthPath: "Easy quickness can be superficial. Your gift is mental speed—now develop depth. Quick isn't the same as wise."
    },
    sextile: {
      whatItFeelsLike: "Mental assertiveness is available when you develop it. You CAN think fast and speak directly—it takes practice.",
      howItManifests: "Responds well to debate training. Assertive communication develops. Mental energy grows with direction.",
      realLifeExamples: [
        "Getting better at speaking up",
        "Debate skills improving",
        "Mental energy finding outlets",
        "Directness developing safely"
      ],
      growthPath: "Your opportunity is development. The mental sharpness is there—it needs practice. Learn to assert through words."
    }
  },

  'Mercury-Jupiter': {
    conjunction: {
      whatItFeelsLike: "Your mind doesn't just think—it EXPANDS. Every idea branches into ten more. You see connections everywhere and want to share them ALL, right now, before you forget.",
      howItManifests: "You speak in big pictures, often skipping steps that seem obvious to you but confuse others. Teachers said 'great ideas, but needs to focus.' You start sentences in the middle because the beginning is already obvious to you.",
      realLifeExamples: [
        "Interrupting because you're afraid you'll lose the thought",
        "Explaining something and going on three tangents before getting to the point",
        "Reading the introduction of 12 books instead of finishing one",
        "Over-promising because in the moment it all feels possible"
      ],
      growthPath: "Learn that what's obvious to you isn't obvious to others. Practice: finish the sentence before starting the next one. Your gift is synthesis—but people need the steps."
    },
    square: {
      whatItFeelsLike: "Having a mind that overflows faster than it can organize. Your thoughts race with meaning, ideas, and connections—but they arrive ALL AT ONCE, creating constant tension between inspiration and overwhelm. You're often pulled between trusting your intuitive knowing and doubting whether you've said too much, misunderstood something, or promised more than your words can realistically carry.",
      howItManifests: "You think you explained something clearly, but people are confused. You're CERTAIN about ideas that turn out to be half-baked. You commit to things in the excited moment, then realize you over-promised. Your enthusiasm outruns your precision.",
      realLifeExamples: [
        "Confidently giving directions that are completely wrong",
        "Signing up for a course, conference, AND project in the same week",
        "Arguing passionately for an opinion you'll completely change tomorrow",
        "Starting to speak before you know how the sentence ends"
      ],
      growthPath: "Your gift is VISION. The friction is that vision without grounding leads to scattered brilliance. Practice: 'Let me think about that and get back to you.' Your ideas need time to land."
    },
    opposition: {
      whatItFeelsLike: "You learn best through dialogue—your ideas don't fully form until you bounce them off someone else. But this can mean you project your 'wise teacher' onto others, or become preachy when you finally DO know something.",
      howItManifests: "You need to talk things out to understand them. Arguments are how you learn (you might take the opposite position just to clarify your own). You may attract know-it-alls or become one yourself.",
      realLifeExamples: [
        "Calling a friend to 'think out loud' before making decisions",
        "Playing devil's advocate so often people think you're disagreeable",
        "Lecturing when you should be listening",
        "Needing an audience to crystallize your thoughts"
      ],
      growthPath: "Dialogue is your learning style—honor it. But practice letting others teach YOU without immediately countering. Sometimes the lesson is in receiving."
    },
    trine: {
      whatItFeelsLike: "Ideas and meaning flow easily. You're a natural teacher because you effortlessly connect specific facts to bigger pictures. Learning feels good. People say you're 'wise' or 'articulate.'",
      howItManifests: "You pick up concepts quickly and explain them to others naturally. Writing and speaking come easily. You may not realize how hard others work for clarity that's effortless for you.",
      realLifeExamples: [
        "Being the friend who explains things so everyone gets it",
        "Good grades without studying as hard as others",
        "Naturally 'getting' philosophy, religion, or big-picture topics",
        "People seeking you out to help them understand things"
      ],
      growthPath: "Don't take your gift for granted. Easy doesn't mean developed. Challenge yourself to go DEEPER, not just wider. Your natural gift becomes wisdom with rigor."
    },
    sextile: {
      whatItFeelsLike: "When you CHOOSE to engage, you can connect details to meaning beautifully. But it takes intentional effort—it's a skill you can develop, not automatic.",
      howItManifests: "You have the capacity for big-picture thinking but need to cultivate it. Given the right teacher or topic, you expand rapidly. May not naturally seek philosophy, but responds well when exposed.",
      realLifeExamples: [
        "Blooming under a mentor who 'gets' you",
        "Traveling and suddenly understanding yourself better",
        "A book or class that changes how you think",
        "Wisdom available when you ask for it"
      ],
      growthPath: "Your opportunity is ACTIVATION. The gift is there but needs choosing. Seek mentors, take the class, read the book. When you invest, you expand."
    }
  },

  'Mercury-Saturn': {
    conjunction: {
      whatItFeelsLike: "Your mind is SERIOUS. Thoughts are weighed carefully before speaking. You may have felt 'slow' as a child—actually you were just thorough. Fear of saying the wrong thing.",
      howItManifests: "Careful, structured thinking. May have had early learning difficulties or speech issues. Develops authority in communication over time. Perfectionism about words.",
      realLifeExamples: [
        "Thinking before speaking (always)",
        "Fear of being wrong",
        "Late bloomer intellectually",
        "Expertise developing over decades"
      ],
      growthPath: "Your gift is depth and precision. Your growth is learning that mistakes in communication are okay. You don't have to be perfect to speak."
    },
    square: {
      whatItFeelsLike: "Friction between your thoughts and your ability to express them. Mental blocks. Feeling stupid when you're not. Harsh inner critic about communication.",
      howItManifests: "Communication anxiety. Feeling like words fail you. Blocked thinking. May have had critical teachers or early learning trauma. Eventually develops mastery through struggle.",
      realLifeExamples: [
        "Freezing up when speaking",
        "Knowing something but can't explain it",
        "Fear of sounding stupid",
        "Communication that improves with age"
      ],
      growthPath: "The friction is the forge. Your mental authority is EARNED through this struggle. Every block is building something. Trust the process."
    },
    opposition: {
      whatItFeelsLike: "Your mental discipline comes out through others. Partners are serious thinkers. Learning structure through dialogue.",
      howItManifests: "Attracting structured or critical thinkers. Learning discipline through relationship. May project mental authority onto others.",
      realLifeExamples: [
        "Partners who think carefully",
        "Learning structure from others",
        "Dialogue that teaches discipline",
        "Projecting expertise onto partners"
      ],
      growthPath: "The mental authority you keep finding in others is YOURS. Own your Saturn. You have expertise—stop outsourcing it."
    },
    trine: {
      whatItFeelsLike: "Natural mental discipline. Structured thinking comes easily. You're comfortable with serious subjects. Authority in communication feels natural.",
      howItManifests: "Easy with complex or serious material. Natural teacher of difficult subjects. Thinking that's organized without effort.",
      realLifeExamples: [
        "Good at hard subjects",
        "Natural structure in thinking",
        "Comfortable with serious topics",
        "Mental discipline without struggle"
      ],
      growthPath: "Easy discipline can become rigid. Your gift is natural structure—now keep it flexible. Precision shouldn't kill creativity."
    },
    sextile: {
      whatItFeelsLike: "Mental discipline is available when you develop it. You CAN think systematically—it takes practice.",
      howItManifests: "Responds well to structured learning. Discipline develops over time. Gets better at serious subjects with effort.",
      realLifeExamples: [
        "Study skills improving with practice",
        "Structure helping thinking",
        "Discipline developing safely",
        "Learning serious subjects over time"
      ],
      growthPath: "Your opportunity is development. The mental discipline is there—it needs cultivation. Seek structure; it helps you."
    }
  },

  'Mercury-Uranus': {
    conjunction: {
      whatItFeelsLike: "Your mind is ELECTRIC. Ideas arrive as downloads, flashes, sudden knowing. You think differently than others—literally. Linear thinking feels foreign.",
      howItManifests: "Genius-level thinking or scattered brilliance. May have been labeled ADD/ADHD. Revolutionary ideas. Difficulty with routine mental tasks. Technological affinity.",
      realLifeExamples: [
        "Ideas that arrive fully formed",
        "Boredom with step-by-step processes",
        "Being ahead of your time",
        "Natural with technology"
      ],
      growthPath: "Your gift is original thinking. Your growth is learning to communicate in ways others can follow. Genius needs translation."
    },
    square: {
      whatItFeelsLike: "Friction between conventional thinking and revolutionary insight. Your mind wants to break free but systems constrain it. Restlessness and frustration.",
      howItManifests: "Genius that disrupts. Thinking that doesn't fit boxes. May have struggled in traditional education. Brilliance that creates chaos.",
      realLifeExamples: [
        "Being too smart for conventional school",
        "Ideas that threaten the status quo",
        "Restlessness with routine",
        "Brilliance that doesn't land"
      ],
      growthPath: "The friction is between innovation and integration. Your ideas need bridges. Learn to translate genius into terms others can use."
    },
    opposition: {
      whatItFeelsLike: "Your originality comes out through others. Partners are unusual thinkers. Dialogue brings breakthroughs.",
      howItManifests: "Attracting eccentric thinkers. Learning innovation through relationship. May project genius onto others.",
      realLifeExamples: [
        "Partners who think differently",
        "Breakthroughs through dialogue",
        "Learning originality from others",
        "Projecting brilliance onto partners"
      ],
      growthPath: "The genius you keep finding in others is YOURS. Own your Uranus. Your original thinking is valid—stop outsourcing it."
    },
    trine: {
      whatItFeelsLike: "Natural original thinking. Innovation comes easily. Unusual ideas flow without disruption. Genius that works.",
      howItManifests: "Easy innovation. Original thinking that's accepted. Technology comes naturally. Genius without alienation.",
      realLifeExamples: [
        "Ideas that are both new and welcome",
        "Natural with innovation",
        "Original thinking that works",
        "Genius without isolation"
      ],
      growthPath: "Easy brilliance can lack grounding. Your gift is natural innovation—now apply it. Original ideas need implementation."
    },
    sextile: {
      whatItFeelsLike: "Original thinking is available when you cultivate it. You CAN innovate—it takes conscious development.",
      howItManifests: "Responds well to creative freedom. Innovation develops with permission. Original thinking grows in right environments.",
      realLifeExamples: [
        "Creativity unlocked by permission",
        "Innovation growing with practice",
        "Original thinking developing safely",
        "Genius emerging over time"
      ],
      growthPath: "Your opportunity is cultivation. The innovative capacity is there—it needs environments that welcome difference."
    }
  },

  'Mercury-Neptune': {
    conjunction: {
      whatItFeelsLike: "Mind and imagination are FUSED. Thoughts arrive as images, symbols, or 'knowings' without clear origin. You don't think in straight lines—you think in impressions, vibes, and pattern-clouds.",
      howItManifests: "Difficulty with step-by-step logic. Strong creativity, intuition, or psychic impressions. May struggle with reading, detail work, or 'proving' what you know. Truth feels truer than it explains.",
      realLifeExamples: [
        "Knowing something without knowing HOW you know",
        "Words coming out as poetry when you meant to be practical",
        "Zoning out in boring conversations—but catching the emotional undercurrent",
        "Difficulty with instructions, tests, or linear tasks"
      ],
      growthPath: "Your gift is TRANSLATION—moving between symbolic and literal reality. Build bridges: learn to name what you sense, even imperfectly. Structure doesn't kill your magic; it gives it form."
    },
    square: {
      whatItFeelsLike: "You see EVERYTHING at once—then have to translate it into words, which feel inadequate. There's friction between your knowing and your ability to explain. Frustrating brilliance.",
      howItManifests: "Confusion in early education. May have been told you're 'smart but scattered' or had reading/spelling challenges. Actually: you process MEANING before SYMBOLS, which standard teaching reverses.",
      realLifeExamples: [
        "Getting the 'wrong' answer through the 'right' intuition",
        "Dyslexia, dysgraphia, or 'processing' differences",
        "Feeling stupid in school but smart in life",
        "Art, music, or imagery where words fail"
      ],
      growthPath: "You're not broken—you're wired for whole-to-part learning. Once you find YOUR way to structure information (mind maps, colors, stories), your genius has a channel."
    },
    opposition: {
      whatItFeelsLike: "Your understanding shows up through OTHERS. You project clarity or confusion onto people, then learn through dialogue. Misunderstandings in early life become teaching moments later.",
      howItManifests: "Learning through relationship. Needing to talk things out. May attract confusing OR wise communicators. Develops extraordinary discernment through navigating projection.",
      realLifeExamples: [
        "Being misunderstood, then becoming expert at understanding",
        "Needing a sounding board to think clearly",
        "Attracting Neptunian (dreamy, confusing) people",
        "Your best insights come through conversation"
      ],
      growthPath: "Dialogue is your thinking style—honor it. But eventually, trust YOUR inner knowing without needing external confirmation. The mirror is training wheels."
    },
    trine: {
      whatItFeelsLike: "Symbolic thinking flows without confusion. You're naturally poetic, musical, or intuitive—and it WORKS. Imagination enhances rather than disrupts communication.",
      howItManifests: "Natural artist or poet. Metaphor comes easily. You 'translate' feelings into language gracefully. Intuition is reliable without being confusing.",
      realLifeExamples: [
        "Writing that people say 'touched' them",
        "Picking up languages, music, or symbolism easily",
        "Dreams that offer guidance",
        "Sensing what people mean beyond their words"
      ],
      growthPath: "Don't take this for granted. Flow is not the same as development. Your gift becomes profound with discipline—study the craft, not just the gift."
    },
    sextile: {
      whatItFeelsLike: "Imagination is AVAILABLE when you reach for it. Creative or intuitive thinking can be developed—it's not automatic, but it's accessible.",
      howItManifests: "Responds well to artistic or spiritual instruction. Can learn to 'turn on' intuition. May need permission or structure to express imagination.",
      realLifeExamples: [
        "A creative class that 'unlocked' something",
        "Meditation practice that opened intuition",
        "Needing a framework to access creativity",
        "Gifts that bloom with encouragement"
      ],
      growthPath: "The channel exists—you just have to open it. Seek teachers, practices, or contexts that invite your symbolic mind. It's dormant, not absent."
    }
  },

  'Mercury-Pluto': {
    conjunction: {
      whatItFeelsLike: "Your mind goes DEEP. Surface thinking doesn't satisfy—you need to understand the hidden layers, the unconscious motives, the real truth under the presented one.",
      howItManifests: "Penetrating insight. May become obsessed with ideas. Research or detective capacity. Can be mentally manipulative or brilliantly perceptive. Sees through lies.",
      realLifeExamples: [
        "Knowing when people are lying",
        "Researching until you find the real answer",
        "Obsessive thinking patterns",
        "Mental intensity that exhausts others"
      ],
      growthPath: "Your gift is psychological perception. Your growth is learning when to stop digging. Not every truth needs to be uncovered. Depth can become control."
    },
    square: {
      whatItFeelsLike: "Friction between your mind and forces that feel threatening. Power struggles through communication. Thoughts that feel dangerous or obsessive.",
      howItManifests: "Mental power struggles. Paranoid thinking or brilliant perception. May have experienced intellectual trauma. Communication becomes a battle.",
      realLifeExamples: [
        "Words as weapons or protection",
        "Feeling like information is power",
        "Obsessive thoughts that won't stop",
        "Intellectual battles for survival"
      ],
      growthPath: "The friction is between knowing and controlling. You're learning that insight doesn't require power over others. See deeply without needing to dominate."
    },
    opposition: {
      whatItFeelsLike: "Your mental depth comes out through others. Partners are intense thinkers. Dialogue becomes psychological excavation.",
      howItManifests: "Attracting deep or manipulative thinkers. Learning about your own depth through relationship. Projection of mental power.",
      realLifeExamples: [
        "Partners who think intensely",
        "Power struggles in dialogue",
        "Learning depth through others",
        "Projecting perception onto partners"
      ],
      growthPath: "The depth you keep finding in others is YOURS. Own your Pluto mind. Your penetrating insight is valid—use it directly."
    },
    trine: {
      whatItFeelsLike: "Natural psychological depth. Seeing beneath surfaces comes easily. Research and investigation flow. Deep thinking that works.",
      howItManifests: "Easy with hidden information. Natural researcher or psychologist. Depth that doesn't overwhelm. Insight that serves.",
      realLifeExamples: [
        "Natural detective abilities",
        "Comfortable with dark subjects",
        "Insight that helps rather than threatens",
        "Deep thinking that flows"
      ],
      growthPath: "Easy depth can lack ethics. Your gift is natural perception—now use it wisely. Seeing through doesn't mean manipulating."
    },
    sextile: {
      whatItFeelsLike: "Mental depth is available when you cultivate it. You CAN think psychologically—it develops with practice.",
      howItManifests: "Responds well to depth psychology. Research skills develop. Perception grows over time.",
      realLifeExamples: [
        "Therapy developing insight",
        "Research skills growing",
        "Learning to see beneath surfaces",
        "Depth developing safely"
      ],
      growthPath: "Your opportunity is cultivation. The depth is there—it needs development. Seek practices that deepen perception ethically."
    }
  },

  // ============================================================================
  // VENUS ASPECTS
  // ============================================================================

  'Venus-Mars': {
    conjunction: {
      whatItFeelsLike: "What you want and what you attract are the same thing. Desire is unified—you pursue what you love without hesitation. Sexual and romantic energies are fused. Magnetic.",
      howItManifests: "Strong romantic and creative presence. You attract through confidence. But attraction and pursuit collapse into one—you may confuse love and lust, or burn through relationships quickly.",
      realLifeExamples: [
        "Attracting people easily but committing with difficulty",
        "Intense creative bursts",
        "Acting on attraction immediately",
        "Relationship intensity that's exciting but exhausting"
      ],
      growthPath: "Slow down. The rush of unified desire is seductive—but lasting love needs space for the other person to also be a subject, not just your desire's object."
    },
    square: {
      whatItFeelsLike: "A frustrating disconnect between what you attract and what you chase. Love and lust don't align. You may want what you can't have, then lose interest when you get it.",
      howItManifests: "Push-pull in relationships. Fights may precede connection. Passion through conflict. You might be attracted to people who create friction, or you create it yourself.",
      realLifeExamples: [
        "Fighting that leads to making up (on repeat)",
        "Wanting someone until they want you back",
        "Creative energy that requires tension to flow",
        "Relationships that are 'complicated'"
      ],
      growthPath: "The friction IS the desire. You're not doing it wrong—this is how YOUR passion works. But notice if you're creating unnecessary drama because peace feels boring."
    },
    opposition: {
      whatItFeelsLike: "You project either the lover (Venus) or the pursuer (Mars) onto partners, then play the opposite role. Relationships are a dance of attraction and pursuit—but you keep switching parts.",
      howItManifests: "May attract aggressive or passive partners (depending on which pole you own). Relationships feel polarized. Learning to be BOTH the receptive and the active force.",
      realLifeExamples: [
        "Always attracting 'chasers' if you're more receptive",
        "Always chasing 'catches' if you're more assertive",
        "Relationships that balance through opposition",
        "Learning to pursue AND receive"
      ],
      growthPath: "Stop splitting. You can be both desirable AND desiring. The opposition resolves when you own your full range instead of outsourcing half of it."
    },
    trine: {
      whatItFeelsLike: "Romantic and creative flow. Attraction and pursuit harmonize naturally. You're charming without trying. Love comes easy—maybe too easy.",
      howItManifests: "Natural magnetism. Flirtation is effortless. Creative expression flows. But easy can mean undeveloped—you may not learn to fight for love because you didn't have to.",
      realLifeExamples: [
        "Always having romantic options",
        "Artistic gifts that flow without struggle",
        "Assuming love should be easy (because for you it is)",
        "Natural grace in relating"
      ],
      growthPath: "Don't coast. Your gift is flow—but depth requires friction you may need to consciously invite. Passion that's never tested stays shallow."
    },
    sextile: {
      whatItFeelsLike: "Romantic and creative potential that activates with effort. When you reach for love or art, the flow comes—it's just not automatic.",
      howItManifests: "Initiative pays off romantically. Taking creative action yields results. The gift is there but requires activation.",
      realLifeExamples: [
        "Asking someone out and it going well",
        "Creative projects that flourish when you commit",
        "Love arriving when you show up for it",
        "Needing to make the first move"
      ],
      growthPath: "Your opportunity is action. The harmony is available—you just have to reach for it. Initiative unlocks what's dormant."
    }
  },

  'Venus-Jupiter': {
    conjunction: {
      whatItFeelsLike: "Love and abundance are FUSED. You attract good things naturally. Generosity is your romantic language. You may expect love to be easy—and it often is.",
      howItManifests: "Natural good fortune in relationships. May over-indulge or expect too much. Generous in love. Attracts wealth and beauty. Can be excessive.",
      realLifeExamples: [
        "Relationships that come easily",
        "Generosity that knows no bounds",
        "Expecting the best and getting it",
        "Excess in pleasure or spending"
      ],
      growthPath: "Your gift is natural abundance. Your growth is learning that more isn't always better. Love needs limits to deepen."
    },
    square: {
      whatItFeelsLike: "Wanting MORE from love than reality provides. Restlessness with what you have. Expectations that exceed experience.",
      howItManifests: "Chronic dissatisfaction in love. Always wanting the next best thing. May overspend on pleasure. Love that disappoints because it can't match fantasy.",
      realLifeExamples: [
        "Relationships that start great then feel 'not enough'",
        "Spending more than you have on beauty",
        "Always looking for something better",
        "Love that can't match the fantasy"
      ],
      growthPath: "The friction is between desire and reality. You're learning that real love is better than ideal love. What you have might actually be enough."
    },
    opposition: {
      whatItFeelsLike: "Your sense of romantic abundance comes through others. Partners carry your Jupiter. Relationships teach you about generosity and excess.",
      howItManifests: "Attracting generous or excessive partners. Learning abundance through relationship. May project faith onto lovers.",
      realLifeExamples: [
        "Partners who are very giving",
        "Learning generosity through others",
        "Relationships that expand your world",
        "Projecting optimism onto love"
      ],
      growthPath: "The abundance you keep finding in others is YOURS. Own your Jupiter in love. Your capacity for joy is valid—express it directly."
    },
    trine: {
      whatItFeelsLike: "Natural good fortune in love. Abundance flows without effort. Generosity feels easy. You're lucky in romance.",
      howItManifests: "Easy attraction. Natural generosity. Love that works out. May take romantic fortune for granted.",
      realLifeExamples: [
        "Relationships working out well",
        "Natural generosity in love",
        "Good fortune in romance",
        "Assuming love is easy (because it has been)"
      ],
      growthPath: "Easy fortune can lack depth. Your gift is natural abundance—now develop it. Lucky love still needs conscious tending."
    },
    sextile: {
      whatItFeelsLike: "Romantic abundance is available when you cultivate it. Generosity grows with practice. Love expands with effort.",
      howItManifests: "Responds well to romantic expansion. Generosity develops over time. Love grows with investment.",
      realLifeExamples: [
        "Relationships improving with growth",
        "Generosity developing over time",
        "Love expanding with effort",
        "Abundance available when sought"
      ],
      growthPath: "Your opportunity is cultivation. The romantic abundance is there—it needs development. Invest in love; it expands."
    }
  },

  'Venus-Saturn': {
    conjunction: {
      whatItFeelsLike: "Love feels SERIOUS. Commitment matters deeply. You may have learned early that love has conditions—or that you must earn it.",
      howItManifests: "Slow to love, loyal forever. May fear rejection intensely. Serious about relationships. Love that lasts but starts slowly.",
      realLifeExamples: [
        "Taking a long time to commit",
        "Fear of rejection stopping you from trying",
        "Relationships that improve with age",
        "Love feeling like a responsibility"
      ],
      growthPath: "Your gift is lasting love. Your growth is learning that you don't have to earn affection. You're lovable as you are, not as you prove yourself."
    },
    square: {
      whatItFeelsLike: "Friction between desire for love and fear of it. Feeling unworthy or blocked. Love that feels hard to access.",
      howItManifests: "Rejection wounds. Self-worth issues in love. May attract unavailable partners or become unavailable yourself. Love that requires work.",
      realLifeExamples: [
        "Choosing partners who can't fully commit",
        "Feeling unworthy of the love you want",
        "Relationships that are hard work",
        "Love improving over long time"
      ],
      growthPath: "The friction is teaching you self-worth. The love you're looking for starts inside. When you value yourself, others can too."
    },
    opposition: {
      whatItFeelsLike: "Your experience of love's limits comes through others. Partners are older, colder, or more responsible. Relationships teach about boundaries.",
      howItManifests: "Attracting Saturnian partners. Learning about love's limits through relationship. May project seriousness onto others.",
      realLifeExamples: [
        "Partners who are older or more serious",
        "Learning limits through relationship",
        "Love that feels restricted by others",
        "Projection of coldness onto partners"
      ],
      growthPath: "The restriction you keep finding in others is your own fear. Own your Saturn. Set your own limits instead of finding them in partners."
    },
    trine: {
      whatItFeelsLike: "Natural maturity in love. Commitment feels comfortable. Relationships that build over time. Love as a lasting structure.",
      howItManifests: "Easy loyalty. Comfortable with commitment. Love that grows steadily. Natural patience in relationships.",
      realLifeExamples: [
        "Long-term relationships that work",
        "Patience in love",
        "Commitment without struggle",
        "Love improving with time"
      ],
      growthPath: "Easy commitment can become stagnant. Your gift is lasting love—keep it growing. Stability shouldn't mean boring."
    },
    sextile: {
      whatItFeelsLike: "Mature love is available when you cultivate it. Commitment develops over time. Patience grows with practice.",
      howItManifests: "Responds well to steady relationship work. Loyalty develops over time. Love matures with effort.",
      realLifeExamples: [
        "Relationships improving with work",
        "Learning patience in love",
        "Commitment developing over time",
        "Maturity growing with practice"
      ],
      growthPath: "Your opportunity is development. The lasting love capacity is there—it needs cultivation. Invest in long-term; it pays off."
    }
  },

  'Venus-Uranus': {
    conjunction: {
      whatItFeelsLike: "Your love nature is ELECTRIC. You're attracted to the unusual, the different, the unexpected. Routine in love feels like death.",
      howItManifests: "Sudden attractions and departures. Need for freedom in relationship. Attracted to unconventional people. May struggle with commitment.",
      realLifeExamples: [
        "Love at first sight (repeatedly)",
        "Relationships that start suddenly and end suddenly",
        "Need for space in partnership",
        "Attracted to unusual people"
      ],
      growthPath: "Your gift is authentic love. Your growth is learning that freedom and commitment can coexist. You can be close AND free."
    },
    square: {
      whatItFeelsLike: "Friction between stability and freedom in love. Wanting closeness but feeling trapped. Sabotaging security.",
      howItManifests: "Relationship instability. Sudden breakups. Boredom with conventional love. Creating drama to feel alive.",
      realLifeExamples: [
        "Breaking up when things get serious",
        "Attracted to unavailable people",
        "Creating chaos in stable relationships",
        "Freedom conflicting with love"
      ],
      growthPath: "The friction is between intimacy and autonomy. You can have both—but it requires conscious integration. Build freedom INTO relationships, not against them."
    },
    opposition: {
      whatItFeelsLike: "Your need for excitement in love comes through others. Partners are unpredictable. Relationships bring sudden change.",
      howItManifests: "Attracting unstable or exciting partners. Learning about freedom through relationship. May project restlessness onto others.",
      realLifeExamples: [
        "Partners who are erratic",
        "Relationships ending suddenly",
        "Learning independence through others",
        "Projecting your restlessness onto partners"
      ],
      growthPath: "The excitement you keep finding in others is YOURS. Own your Uranus. Be your own source of aliveness rather than seeking it through unstable partners."
    },
    trine: {
      whatItFeelsLike: "Natural freedom in love. Unconventional relationships work. You're comfortable with change in love. Authentic without drama.",
      howItManifests: "Easy with unusual relationship structures. Change doesn't destabilize love. Authenticity that partners appreciate.",
      realLifeExamples: [
        "Unconventional relationships that work",
        "Freedom that doesn't threaten love",
        "Change that refreshes rather than destabilizes",
        "Authentic without alienating"
      ],
      growthPath: "Easy freedom can avoid depth. Your gift is authentic love—now commit to something. Freedom without stakes is empty."
    },
    sextile: {
      whatItFeelsLike: "Freedom in love is available when you cultivate it. You CAN have authentic relationships—it takes conscious development.",
      howItManifests: "Responds well to unconventional relationship models. Authenticity develops with safety. Change becomes manageable.",
      realLifeExamples: [
        "Learning to be authentic in love",
        "Change becoming less threatening",
        "Finding freedom within commitment",
        "Unconventional working over time"
      ],
      growthPath: "Your opportunity is conscious freedom. The authentic love is there—it needs safe environments to develop. Seek relationships that welcome uniqueness."
    }
  },

  'Venus-Neptune': {
    conjunction: {
      whatItFeelsLike: "Love is TRANSCENDENT. You don't just love—you merge, dissolve, become one. Romantic idealism. Art and spirituality as love languages.",
      howItManifests: "Idealistic in love. May idealize partners or be disillusioned. Artistic or spiritual approach to beauty. Boundary issues in relationships.",
      realLifeExamples: [
        "Falling in love with your fantasy of someone",
        "Artistic gifts around beauty",
        "Spiritual experiences through love",
        "Not seeing partners clearly"
      ],
      growthPath: "Your gift is transcendent love. Your growth is learning to love real people, not ideals. The human IS divine—you don't need to add fantasy."
    },
    square: {
      whatItFeelsLike: "Friction between romantic ideals and reality. Chronic disappointment when love doesn't match the dream. Escapism through relationships.",
      howItManifests: "Disillusionment in love. Addiction patterns in relationship. Seeing what you want to see, not what is. Art that comes from longing.",
      realLifeExamples: [
        "Partners who disappoint when you see clearly",
        "Escaping through romance or substances",
        "Beauty that covers pain",
        "Love as escape from reality"
      ],
      growthPath: "The friction is between dream and reality. Real love is messier and better than the fantasy. Disillusionment is the teacher—it clears your vision."
    },
    opposition: {
      whatItFeelsLike: "Your romantic idealism comes through others. Partners carry your Neptune. Relationships involve fantasy and disillusionment.",
      howItManifests: "Attracting confusing or artistic partners. Learning about illusion through relationship. Projection of ideals.",
      realLifeExamples: [
        "Partners who seem magical then ordinary",
        "Learning to see clearly through disillusionment",
        "Idealizing then demonizing",
        "Art coming through relationship"
      ],
      growthPath: "The magic you keep finding—and losing—in others is YOURS. Own your Neptune. Your capacity for transcendent love belongs to you."
    },
    trine: {
      whatItFeelsLike: "Natural romantic sensitivity. Love and spirituality flow together. Artistic gifts in relationship. Idealism that works.",
      howItManifests: "Easy with romantic fantasy. Art flows through love. Spiritual love that's grounded. Sensitivity that enhances rather than confuses.",
      realLifeExamples: [
        "Relationships that feel spiritual",
        "Art coming easily through love",
        "Romantic intuition that's accurate",
        "Fantasy that enhances reality"
      ],
      growthPath: "Easy idealism can avoid hard truths. Your gift is transcendent love—but keep one foot on the ground. Dreams need real soil."
    },
    sextile: {
      whatItFeelsLike: "Romantic sensitivity is available when you cultivate it. You CAN love spiritually—it develops with practice.",
      howItManifests: "Responds well to artistic or spiritual love expression. Romantic intuition develops over time. Idealism becomes grounded.",
      realLifeExamples: [
        "Art opening the heart",
        "Spiritual practices enhancing love",
        "Romantic sensitivity growing",
        "Idealism becoming realistic"
      ],
      growthPath: "Your opportunity is cultivation. The transcendent love is there—it needs grounding. Seek practices that develop romantic spirituality safely."
    }
  },

  'Venus-Pluto': {
    conjunction: {
      whatItFeelsLike: "Love is INTENSE. Not casual, not light. When you love, you love completely. Obsession, jealousy, and transformation through relationship.",
      howItManifests: "Powerful attractions. May become obsessive or possessive. Transforms through love. Magnetic romantic presence.",
      realLifeExamples: [
        "Love that takes over your life",
        "Jealousy you can't control",
        "Relationships that transform you completely",
        "Intensity that attracts and repels"
      ],
      growthPath: "Your gift is deep, transformative love. Your growth is learning that love doesn't require control. You can love intensely AND let go."
    },
    square: {
      whatItFeelsLike: "Power struggles in love. Friction between desire and control. Intense attractions that feel dangerous. Love as battlefield.",
      howItManifests: "Jealousy and possessiveness. Attractions to powerful or controlling people. Love that feels like survival. Transformation through crisis.",
      realLifeExamples: [
        "Relationships with power dynamics",
        "Love that feels obsessive",
        "Attractions you can't control",
        "Transformation through painful love"
      ],
      growthPath: "The friction is between love and control. You're learning that real intimacy requires vulnerability, not power. Let go to go deep."
    },
    opposition: {
      whatItFeelsLike: "Your intensity in love comes through others. Partners are powerful or controlling. Relationships involve power dynamics.",
      howItManifests: "Attracting intense or plutonian partners. Learning about power through relationship. Projection of intensity.",
      realLifeExamples: [
        "Partners who are intense or controlling",
        "Power struggles as relationship pattern",
        "Learning about your own depth through others",
        "Relationships that transform you"
      ],
      growthPath: "The intensity you keep finding in others is YOURS. Own your Pluto. Your power in love is valid—use it directly, not through projection."
    },
    trine: {
      whatItFeelsLike: "Natural depth in love. Intensity that works. Transformation through relationship that doesn't destroy. Magnetic without being threatening.",
      howItManifests: "Easy with deep relationships. Power used well in love. Transformation as natural growth. Intensity that partners trust.",
      realLifeExamples: [
        "Deep relationships that don't overwhelm",
        "Power in love used constructively",
        "Natural magnetism",
        "Transformation through love that's gentle"
      ],
      growthPath: "Easy intensity can stay unconscious. Your gift is natural depth—now bring it to light. Conscious power serves love better than instinctive power."
    },
    sextile: {
      whatItFeelsLike: "Depth in love is available when you cultivate it. You CAN love intensely—it develops with conscious engagement.",
      howItManifests: "Responds well to deep relationship work. Intensity develops safely. Power in love becomes conscious.",
      realLifeExamples: [
        "Therapy deepening love capacity",
        "Learning about power dynamics",
        "Intensity developing with awareness",
        "Transformation through conscious love"
      ],
      growthPath: "Your opportunity is cultivation. The depth is there—it needs safe development. Seek relationships that welcome intensity consciously."
    }
  },

  // ============================================================================
  // MARS ASPECTS
  // ============================================================================

  'Mars-Jupiter': {
    conjunction: {
      whatItFeelsLike: "Your drive is ENORMOUS. You don't just act—you ACT BIG. Faith and action are fused. You believe in yourself and it shows in how you move.",
      howItManifests: "Natural adventurer. May overextend or take excessive risks. Acts on faith. Crusader energy. Confidence that borders on recklessness.",
      realLifeExamples: [
        "Taking on more than seems possible",
        "Acting on belief without hesitation",
        "Athletic or adventurous pursuits",
        "Confidence that sometimes goes too far"
      ],
      growthPath: "Your gift is enthusiastic action. Your growth is learning that bigger isn't always better. Sometimes strategic patience outperforms bold moves."
    },
    square: {
      whatItFeelsLike: "Friction between action and expansion. Your drive exceeds your capacity. Wanting to do more than you can. Restlessness.",
      howItManifests: "Over-promising and under-delivering. Taking on too much. Reckless action. Drive that creates excess. Burnout from overextension.",
      realLifeExamples: [
        "Committing to things you can't complete",
        "Reckless decisions you regret",
        "Energy that doesn't know limits",
        "Enthusiasm crashing into reality"
      ],
      growthPath: "The friction is between ambition and capacity. You're learning right-sized action. Your energy is a gift—but it needs direction, not just volume."
    },
    opposition: {
      whatItFeelsLike: "Your faith in action comes through others. Partners are adventurous or excessive. Relationships involve risk and expansion.",
      howItManifests: "Attracting bold or reckless partners. Learning about faith through relationship. Projection of enthusiasm.",
      realLifeExamples: [
        "Partners who are adventurous",
        "Learning to take risks through others",
        "Relationships that expand your world",
        "Projecting boldness onto partners"
      ],
      growthPath: "The adventurer you keep finding in others is YOURS. Own your Jupiter-Mars. Your capacity for bold action is valid—use it directly."
    },
    trine: {
      whatItFeelsLike: "Natural luck in action. Efforts succeed easily. Faith and drive flow together. Enthusiasm that works out.",
      howItManifests: "Easy success in physical pursuits. Natural athlete or adventurer. Efforts that pay off. Confidence that's justified.",
      realLifeExamples: [
        "Things working out when you act",
        "Natural sports ability",
        "Confidence that pays off",
        "Lucky action"
      ],
      growthPath: "Easy success can create complacency. Your gift is natural luck in action—now aim higher. Fortune without challenge stays small."
    },
    sextile: {
      whatItFeelsLike: "Successful action is available when you take initiative. Luck develops through effort. Faith grows with experience.",
      howItManifests: "Responds well to challenge. Success builds with effort. Confidence develops through doing.",
      realLifeExamples: [
        "Action paying off when you try",
        "Confidence growing with experience",
        "Luck available when you act",
        "Faith developing through success"
      ],
      growthPath: "Your opportunity is action. The luck is there—it activates with initiative. Take the risk; it's more likely to work than you think."
    }
  },

  'Mars-Saturn': {
    conjunction: {
      whatItFeelsLike: "Drive meets restriction. You have incredible endurance—but also incredible frustration. It's like driving with the brake on: powerful engine, constant resistance.",
      howItManifests: "Controlled energy. Discipline and determination. But also potential for suppressed anger, harsh self-criticism, or stop-start patterns. The breakthrough, when it comes, is solid.",
      realLifeExamples: [
        "Working harder than anyone for slower results",
        "Anger that builds invisibly then explodes",
        "Incredible persistence when others would quit",
        "Harsh inner voice about effort and achievement"
      ],
      growthPath: "Your engine is POWERFUL—the brake is learned. As you trust yourself more, the resistance lessens. Endurance is your gift; ease is your growth edge."
    },
    square: {
      whatItFeelsLike: "Constant friction between your drive and the limits on it. It feels like every push meets resistance. Authority figures may have blocked or punished your assertion.",
      howItManifests: "Frustrated ambition. Conflicts with bosses or systems. Energy that surges then gets blocked. Anger management issues (either too much or too suppressed). Builds strength through repeated challenge.",
      realLifeExamples: [
        "Getting fired right before a promotion",
        "Clashing with authority until you become the authority",
        "Suppressed rage or explosive temper",
        "Things that 'should' be easy being inexplicably hard"
      ],
      growthPath: "The resistance is the workout. You're building strength through friction that others never develop. Eventually YOU become the immovable force, not the victim of it."
    },
    opposition: {
      whatItFeelsLike: "Energy and discipline feel opposed. You may attract restrictive people—or become the one who restricts others. Relationships are where you learn to balance drive and limit.",
      howItManifests: "Partners who feel blocking or whom you feel blocked by. Learning when to push and when to yield through relationship. May project either force or control onto others.",
      realLifeExamples: [
        "Partners who seem to limit your freedom",
        "Being seen as either too aggressive or too passive",
        "Learning self-discipline through external limits",
        "Finding balance through opposition"
      ],
      growthPath: "You can be BOTH driven AND disciplined without splitting it between you and partners. The opposition resolves when you own your own limits and your own power."
    },
    trine: {
      whatItFeelsLike: "Controlled power. Your energy is focused, disciplined, and effective. You can sustain effort without burning out. Ambition feels manageable.",
      howItManifests: "Natural strategic ability. Works smart, not just hard. Accomplishes through steady effort. May have had supportive structure around your drive.",
      realLifeExamples: [
        "Sustained effort that others can't match",
        "Knowing when to push and when to wait",
        "Achievements that build on each other",
        "Discipline without willpower battles"
      ],
      growthPath: "Your gift is sustained power. Now direct it. Easy effectiveness can become complacency. Seek goals worthy of your unusual capacity for disciplined action."
    },
    sextile: {
      whatItFeelsLike: "Disciplined action is available when you choose it. You can develop strategic effectiveness—it's just not automatic. Structure helps.",
      howItManifests: "Responds well to training and guidance. Can build effective work habits. May need external accountability to develop inner discipline.",
      realLifeExamples: [
        "A coach who helped you focus",
        "Training programs that worked",
        "Building discipline through practice",
        "Structure that felt supportive"
      ],
      growthPath: "The strategic power is learnable. Seek mentors, systems, and practices that develop your capacity for sustained, effective action. It's a skill, not just a trait."
    }
  },

  'Mars-Uranus': {
    conjunction: {
      whatItFeelsLike: "Your energy is ELECTRIC. Action happens in flashes. You don't warm up—you ignite. Revolutionary, inventive, unpredictable.",
      howItManifests: "Sudden, explosive action. May be accident-prone. Innovative drive. Breaks patterns. Can be reckless or brilliantly original.",
      realLifeExamples: [
        "Acting on impulse in ways that change everything",
        "Accidents from moving too fast",
        "Revolutionary ideas put into action",
        "Unpredictable energy patterns"
      ],
      growthPath: "Your gift is breakthrough energy. Your growth is learning to channel it. Lightning can illuminate or destroy—the difference is direction."
    },
    square: {
      whatItFeelsLike: "Friction between your drive and your need to break free. Energy that explodes unpredictably. Conflicts with authority from sheer restlessness.",
      howItManifests: "Explosive temper. Accident-prone through recklessness. Sudden breaks from constraints. Rebellion as action. May have trouble with sustained effort.",
      realLifeExamples: [
        "Rage that surprises you",
        "Accidents from impulsive action",
        "Quitting suddenly when frustrated",
        "Energy that can't be contained"
      ],
      growthPath: "The friction is between control and chaos. You're learning to channel your breakthrough energy rather than being channeled by it. Structure isn't your enemy—it's your container."
    },
    opposition: {
      whatItFeelsLike: "Your revolutionary energy comes through others. Partners are unpredictable or explosive. Relationships bring sudden change.",
      howItManifests: "Attracting erratic or exciting partners. Learning about your own electricity through relationship. Projection of restlessness.",
      realLifeExamples: [
        "Partners who are unstable or brilliant",
        "Relationships ending explosively",
        "Learning about your own wildness through others",
        "Projecting rebellion onto partners"
      ],
      growthPath: "The chaos you keep finding in others is YOURS. Own your Uranus-Mars. Your revolutionary energy is valid—use it directly, not through explosive relationships."
    },
    trine: {
      whatItFeelsLike: "Natural breakthrough energy that works. Innovation in action. Rebellion that's productive. Change that excites rather than destabilizes.",
      howItManifests: "Easy innovation. Acts on inspiration successfully. Revolutionary energy channeled well. Change as ally.",
      realLifeExamples: [
        "Breaking patterns that needed breaking",
        "Innovation that works smoothly",
        "Energy that inspires rather than alarms",
        "Change as natural partner"
      ],
      growthPath: "Easy rebellion can lack stakes. Your gift is natural breakthrough—now commit to something. Revolution needs cause, not just restlessness."
    },
    sextile: {
      whatItFeelsLike: "Breakthrough energy is available when you develop it. You CAN innovate in action—it takes conscious cultivation.",
      howItManifests: "Responds well to innovative environments. Rebellion develops constructively. Revolutionary capacity grows with direction.",
      realLifeExamples: [
        "Learning to channel restlessness",
        "Innovation developing with practice",
        "Rebellion becoming productive",
        "Change becoming manageable"
      ],
      growthPath: "Your opportunity is directed breakthrough. The revolutionary energy is there—it needs direction. Seek environments that welcome innovation."
    }
  },

  'Mars-Neptune': {
    conjunction: {
      whatItFeelsLike: "Your drive is INSPIRED—or confused. Action guided by vision, intuition, faith. You act on dreams. But sometimes the dream obscures the action.",
      howItManifests: "Spiritual warrior energy. May be passive or escapist. Acts on intuition. Creative action. Energy that needs meaning to flow.",
      realLifeExamples: [
        "Fighting for causes bigger than yourself",
        "Difficulty with purely practical action",
        "Energy that needs inspiration to flow",
        "Acting on faith rather than evidence"
      ],
      growthPath: "Your gift is inspired action. Your growth is learning to act even when inspiration doesn't come. Sometimes you move first and meaning follows."
    },
    square: {
      whatItFeelsLike: "Friction between action and surrender. Energy that dissipates or misdirects. Confusion about what to fight for. May feel weak or lost.",
      howItManifests: "Action that doesn't land. Confusion about goals. May be deceptive or passive-aggressive. Energy lost to escapism. Creative frustration.",
      realLifeExamples: [
        "Efforts that seem to dissolve",
        "Confusion about what you want to do",
        "Escaping through substances or fantasy",
        "Feeling powerless to act"
      ],
      growthPath: "The friction is between will and surrender. You're learning that inspired action requires BOTH—vision AND effort. Neither alone is enough."
    },
    opposition: {
      whatItFeelsLike: "Your inspired action comes through others. Partners are artists, addicts, or healers. Relationships involve surrender and action.",
      howItManifests: "Attracting Neptunian partners. Learning about faith through relationship. Projection of inspiration or confusion.",
      realLifeExamples: [
        "Partners who are spiritual or escapist",
        "Learning to surrender through others",
        "Relationships that confuse action",
        "Projecting vision onto partners"
      ],
      growthPath: "The inspiration you keep finding in others is YOURS. Own your Neptune-Mars. Your capacity for inspired action is valid—use it directly."
    },
    trine: {
      whatItFeelsLike: "Natural inspired action. Vision and effort flow together. Spiritual warrior energy that works. Faith in action.",
      howItManifests: "Easy with inspired effort. Acts on intuition successfully. Creative action that flows. Energy guided by vision.",
      realLifeExamples: [
        "Acting on intuition and it working",
        "Creative work flowing",
        "Effort inspired by meaning",
        "Faith that guides action"
      ],
      growthPath: "Easy inspiration can avoid discipline. Your gift is natural inspired action—now develop craft. Vision needs technique to manifest."
    },
    sextile: {
      whatItFeelsLike: "Inspired action is available when you cultivate it. You CAN act on vision—it develops with practice.",
      howItManifests: "Responds well to creative environments. Inspiration develops with invitation. Vision-guided action grows over time.",
      realLifeExamples: [
        "Creative work developing with practice",
        "Inspiration available when sought",
        "Faith growing through action",
        "Vision becoming actionable"
      ],
      growthPath: "Your opportunity is cultivation. The inspired action is there—it needs development. Seek environments that welcome vision-guided effort."
    }
  },

  'Mars-Pluto': {
    conjunction: {
      whatItFeelsLike: "Your drive is VOLCANIC. When you want something, you want it completely. Willpower is immense. Power, for good or ill, moves through you.",
      howItManifests: "Powerful ambition. May be ruthless or unstoppable. Transforms through effort. Control issues. Magnetism that commands.",
      realLifeExamples: [
        "Getting what you want through sheer will",
        "Intensity that others find overwhelming",
        "Power struggles as way of life",
        "Accomplishing through force of will"
      ],
      growthPath: "Your gift is extraordinary willpower. Your growth is learning that power doesn't require domination. You can be strong WITHOUT controlling everything."
    },
    square: {
      whatItFeelsLike: "Friction between your drive and forces that feel life-or-death. Power struggles everywhere. Intensity that feels like survival.",
      howItManifests: "Compulsive drive. Power struggles with authority. May be violent, coercive, or survivor of violence. Energy that feels dangerous.",
      realLifeExamples: [
        "Battles for power everywhere",
        "Intensity that's hard to manage",
        "Rage that feels volcanic",
        "Transformation through crisis"
      ],
      growthPath: "The friction is between control and transformation. You're learning that true power doesn't require destruction. Channel intensity; don't be channeled by it."
    },
    opposition: {
      whatItFeelsLike: "Your power and intensity come through others. Partners are controlling or transformative. Relationships involve power dynamics.",
      howItManifests: "Attracting powerful or controlling partners. Learning about your own intensity through relationship. Projection of power.",
      realLifeExamples: [
        "Partners who are intense or dominating",
        "Power struggles in relationships",
        "Learning about your own power through others",
        "Projecting intensity onto partners"
      ],
      growthPath: "The power you keep finding in others is YOURS. Own your Pluto-Mars. Your capacity for intense action is valid—use it directly, not through projection."
    },
    trine: {
      whatItFeelsLike: "Natural powerful action. Intensity that works. Transformation through effort that doesn't destroy. Strategic power.",
      howItManifests: "Easy with power dynamics. Actions that transform situations. Intensity channeled well. Powerful without threatening.",
      realLifeExamples: [
        "Power used constructively",
        "Intensity that serves",
        "Transformation through effort",
        "Strategic action that works"
      ],
      growthPath: "Easy power can be unconscious. Your gift is natural intensity—bring it to consciousness. Power serves best when you see it clearly."
    },
    sextile: {
      whatItFeelsLike: "Powerful action is available when you develop it. You CAN transform through effort—it takes conscious engagement.",
      howItManifests: "Responds well to intense environments. Power develops constructively. Transformation through conscious effort.",
      realLifeExamples: [
        "Learning to use intensity",
        "Power developing with awareness",
        "Transformation through chosen effort",
        "Intensity becoming manageable"
      ],
      growthPath: "Your opportunity is conscious power. The intensity is there—it needs direction. Seek challenges that develop your transformative capacity safely."
    }
  },

  // ============================================================================
  // OUTER PLANET ASPECTS (Jupiter through Pluto)
  // ============================================================================

  'Jupiter-Saturn': {
    conjunction: {
      whatItFeelsLike: "Expansion meets restriction in a single impulse. You feel both limitless and limited simultaneously. The visionary meets the realist—inside you.",
      howItManifests: "Major life cycle begins. Building something substantial. Growth within structure. May feel pulled between hope and fear.",
      realLifeExamples: [
        "Starting a major life project",
        "Building something that requires both vision and discipline",
        "Feeling both optimistic and realistic",
        "New 20-year cycle beginning"
      ],
      growthPath: "Your gift is grounded expansion. Your growth is learning that vision and structure serve each other. You can dream big AND build solid."
    },
    square: {
      whatItFeelsLike: "Friction between hope and fear, growth and limits. You want to expand but something holds you back. Faith tested by reality.",
      howItManifests: "Tension between taking risks and playing safe. Growth that meets resistance. Learning to balance optimism with prudence.",
      realLifeExamples: [
        "Wanting to leap but fear stopping you",
        "Growth meeting real-world obstacles",
        "Faith tested by setbacks",
        "Learning balanced expansion"
      ],
      growthPath: "The friction is between what's possible and what's practical. You're learning realistic optimism. Dreams need foundations."
    },
    opposition: {
      whatItFeelsLike: "Your expansion and limitation come through others. Partners carry one end while you hold the other. Relationships balance vision and reality.",
      howItManifests: "Attracting optimistic or pessimistic partners. Learning about balance through relationship. Projection of either faith or fear.",
      realLifeExamples: [
        "Partners who are very hopeful or very cautious",
        "Learning about limits through others",
        "Relationships that balance expansion",
        "Projecting either vision or structure"
      ],
      growthPath: "Both the dreamer and the builder live in you. Own both. Stop outsourcing either your optimism or your realism."
    },
    trine: {
      whatItFeelsLike: "Natural balance between growth and structure. Expansion that lasts. Optimism that's grounded. Building that includes vision.",
      howItManifests: "Easy success through patient building. Wise expansion. Growth that's sustainable. Natural balance between risk and caution.",
      realLifeExamples: [
        "Long-term success",
        "Growth that lasts",
        "Vision that manifests",
        "Balance coming naturally"
      ],
      growthPath: "Easy balance can lack urgency. Your gift is sustainable growth—now accelerate it consciously. Balance shouldn't mean stagnation."
    },
    sextile: {
      whatItFeelsLike: "Balanced growth is available when you develop it. You CAN expand sustainably—it takes conscious work.",
      howItManifests: "Responds well to structured growth opportunities. Expansion develops with guidance. Balance builds over time.",
      realLifeExamples: [
        "Mentors helping balanced growth",
        "Expansion through structured effort",
        "Learning sustainable building",
        "Balance developing with practice"
      ],
      growthPath: "Your opportunity is conscious balance. The capacity for grounded expansion is there—develop it intentionally."
    }
  },

  'Jupiter-Uranus': {
    conjunction: {
      whatItFeelsLike: "Breakthrough expansion. Your growth is REVOLUTIONARY. You expand through sudden change, invention, and breaking from convention.",
      howItManifests: "Lucky breaks. Sudden opportunities. Revolutionary ideas that succeed. Growth through innovation. May be restless without change.",
      realLifeExamples: [
        "Sudden luck that changes everything",
        "Innovative ideas that work",
        "Growth through breaking patterns",
        "Opportunities from unexpected directions"
      ],
      growthPath: "Your gift is breakthrough expansion. Your growth is learning to sustain innovation. Lightning strikes need follow-through."
    },
    square: {
      whatItFeelsLike: "Friction between conventional growth and revolutionary change. Restlessness that disrupts stability. Sudden changes in beliefs or direction.",
      howItManifests: "Disruptive expansion. Growth that destabilizes. Beliefs that change suddenly. May waste opportunities through impatience.",
      realLifeExamples: [
        "Opportunities missed through restlessness",
        "Beliefs changing dramatically",
        "Growth that disrupts stability",
        "Revolutionary impulses causing chaos"
      ],
      growthPath: "The friction is between expansion and disruption. You're learning that change serves growth when it's channeled. Innovation needs direction."
    },
    opposition: {
      whatItFeelsLike: "Your innovative expansion comes through others. Partners are unconventional or revolutionary. Relationships bring unexpected growth.",
      howItManifests: "Attracting unusual or innovative partners. Learning about breakthrough through relationship. Projection of revolutionary energy.",
      realLifeExamples: [
        "Partners who change your worldview",
        "Unexpected growth through relationship",
        "Learning to innovate through others",
        "Projecting revolutionary beliefs"
      ],
      growthPath: "The revolutionary you keep finding in partners is YOURS. Own your innovative expansion. Your breakthrough capacity is valid—use it directly."
    },
    trine: {
      whatItFeelsLike: "Natural innovative expansion. Breakthroughs that feel lucky. Change that brings growth. Revolutionary ideas that work.",
      howItManifests: "Easy innovation. Lucky breaks. Growth through change that doesn't destabilize. Natural inventor or visionary.",
      realLifeExamples: [
        "Innovation that just works",
        "Lucky timing",
        "Change that brings opportunity",
        "Revolutionary ideas that land"
      ],
      growthPath: "Easy breakthrough can lack follow-through. Your gift is natural innovation—now sustain it. Lucky breaks need building on."
    },
    sextile: {
      whatItFeelsLike: "Innovative expansion is available when you seek it. You CAN grow through breakthrough—it requires initiative.",
      howItManifests: "Responds well to innovative opportunities. Change becomes productive with effort. Revolutionary capacity develops.",
      realLifeExamples: [
        "Opportunities through innovation",
        "Learning to embrace change",
        "Revolutionary capacity developing",
        "Growth through conscious innovation"
      ],
      growthPath: "Your opportunity is conscious innovation. The breakthrough capacity is there—activate it. Seek change that serves growth."
    }
  },

  'Jupiter-Neptune': {
    conjunction: {
      whatItFeelsLike: "Expansion through transcendence. Your growth is SPIRITUAL. You expand through faith, imagination, and dissolving boundaries.",
      howItManifests: "Spiritual or artistic expansion. May be idealistic or escapist. Growth through vision. Faith that expands reality.",
      realLifeExamples: [
        "Spiritual experiences that change your life",
        "Artistic expansion",
        "Faith that moves mountains",
        "Growth through imagination"
      ],
      growthPath: "Your gift is transcendent expansion. Your growth is learning that infinite vision needs grounded expression. Dreams must land."
    },
    square: {
      whatItFeelsLike: "Friction between vision and reality. Faith that exceeds evidence. Disappointment when expansion doesn't match the dream.",
      howItManifests: "Inflation or deflation of beliefs. May be gullible or disillusioned. Growth blocked by fantasy. Faith tested by reality.",
      realLifeExamples: [
        "Believing too much in the wrong thing",
        "Disappointment when reality doesn't match vision",
        "Faith that creates confusion",
        "Growth blocked by escapism"
      ],
      growthPath: "The friction is between vision and manifestation. You're learning grounded faith. Transcendence needs roots."
    },
    opposition: {
      whatItFeelsLike: "Your spiritual expansion comes through others. Partners are visionary or confusing. Relationships involve faith and disillusionment.",
      howItManifests: "Attracting spiritual or escapist partners. Learning about faith through relationship. Projection of ideals.",
      realLifeExamples: [
        "Partners who are spiritual or addictive",
        "Learning about faith through others",
        "Idealizing then being disillusioned",
        "Projecting vision onto partners"
      ],
      growthPath: "The transcendence you keep finding in others is YOURS. Own your spiritual expansion. Your capacity for faith is valid—express it directly."
    },
    trine: {
      whatItFeelsLike: "Natural spiritual expansion. Faith that works. Vision that manifests. Growth through transcendence that's grounded.",
      howItManifests: "Easy spiritual growth. Faith that's justified. Artistic or spiritual gifts that flow. Expansion through imagination.",
      realLifeExamples: [
        "Spiritual experiences that enhance life",
        "Faith that proves out",
        "Vision that manifests",
        "Growth through inspiration"
      ],
      growthPath: "Easy transcendence can lack grounding. Your gift is natural faith—now express it. Spiritual growth needs earthly expression."
    },
    sextile: {
      whatItFeelsLike: "Spiritual expansion is available when you cultivate it. You CAN grow through faith—it develops with practice.",
      howItManifests: "Responds well to spiritual guidance. Faith develops with experience. Vision grows with encouragement.",
      realLifeExamples: [
        "Spiritual practices that help",
        "Faith developing over time",
        "Vision growing with cultivation",
        "Expansion through conscious spirituality"
      ],
      growthPath: "Your opportunity is conscious faith. The spiritual expansion is there—develop it. Seek practices that grow grounded transcendence."
    }
  },

  'Jupiter-Pluto': {
    conjunction: {
      whatItFeelsLike: "Expansion through power. Your growth is MASSIVE. When you want something, you want it completely and you have the capacity to achieve it.",
      howItManifests: "Powerful ambition. May become wealthy or influential. Growth through transformation. The capacity for significant impact.",
      realLifeExamples: [
        "Achieving power or wealth",
        "Transformative expansion",
        "Influence that grows exponentially",
        "Growth through intensity"
      ],
      growthPath: "Your gift is powerful expansion. Your growth is learning that power serves best when it's used for more than personal gain."
    },
    square: {
      whatItFeelsLike: "Friction between expansion and transformation. Power struggles around beliefs. Growth that requires confronting shadows.",
      howItManifests: "Intense ambition that creates conflict. Beliefs challenged by power dynamics. Growth through crisis. May attract or become fanatical.",
      realLifeExamples: [
        "Power struggles over beliefs",
        "Growth through confronting shadows",
        "Ambition that creates enemies",
        "Transformation through philosophical crisis"
      ],
      growthPath: "The friction is between expansion and intensity. You're learning that power and wisdom need each other. Growth without ethics is dangerous."
    },
    opposition: {
      whatItFeelsLike: "Your powerful expansion comes through others. Partners are ambitious or transformative. Relationships involve power and growth.",
      howItManifests: "Attracting powerful or intense partners. Learning about your own ambition through relationship. Projection of power.",
      realLifeExamples: [
        "Partners who are influential",
        "Learning about power through others",
        "Relationships that transform beliefs",
        "Projecting ambition onto partners"
      ],
      growthPath: "The power you keep finding in others is YOURS. Own your Jupiter-Pluto. Your capacity for significant impact is valid—use it directly."
    },
    trine: {
      whatItFeelsLike: "Natural powerful expansion. Growth that transforms. Influence that comes easily. Power used for growth.",
      howItManifests: "Easy with power and influence. Growth that feels natural and transformative. Impact that builds steadily.",
      realLifeExamples: [
        "Influence that grows naturally",
        "Power used constructively",
        "Growth through transformation",
        "Impact that serves"
      ],
      growthPath: "Easy power can be unconscious. Your gift is natural influence—bring consciousness to it. Power serves best when it's aware."
    },
    sextile: {
      whatItFeelsLike: "Powerful expansion is available when you develop it. You CAN achieve significant impact—it takes conscious effort.",
      howItManifests: "Responds well to power and influence opportunities. Transformation develops with guidance. Impact grows with intention.",
      realLifeExamples: [
        "Learning to use influence",
        "Power developing constructively",
        "Growth through conscious transformation",
        "Impact building over time"
      ],
      growthPath: "Your opportunity is conscious power. The capacity for significant impact is there—develop it intentionally."
    }
  },

  'Saturn-Uranus': {
    conjunction: {
      whatItFeelsLike: "Structure meets revolution. You feel both the need to build and the need to break. The builder meets the revolutionary—inside you.",
      howItManifests: "Innovative structure. May reform systems. Builds new patterns. Tension between tradition and change.",
      realLifeExamples: [
        "Reforming systems from within",
        "Building new structures",
        "Tradition meeting innovation",
        "Structure that includes change"
      ],
      growthPath: "Your gift is structured innovation. Your growth is learning that change and stability can serve each other. Revolution needs foundations."
    },
    square: {
      whatItFeelsLike: "Friction between security and freedom. Structures that crack. Revolution meeting resistance. The old fighting the new.",
      howItManifests: "Breakdowns and breakthroughs. Tension between conformity and authenticity. Systems under stress. Personal or collective crisis.",
      realLifeExamples: [
        "Structures breaking down",
        "Freedom vs. security conflicts",
        "Old ways meeting new",
        "Crisis forcing change"
      ],
      growthPath: "The friction is between stability and change. You're learning that both are necessary. Transformation needs structure; structure needs renewal."
    },
    opposition: {
      whatItFeelsLike: "Your structure and freedom come through others. Partners embody either tradition or revolution. Relationships balance old and new.",
      howItManifests: "Attracting conventional or unconventional partners. Learning about change through relationship. Projection of either stability or chaos.",
      realLifeExamples: [
        "Partners who are either very stable or very chaotic",
        "Learning about tradition through rebellion",
        "Relationships that balance old and new",
        "Projecting either structure or change"
      ],
      growthPath: "Both the builder and the breaker live in you. Own both. Stop outsourcing either your stability or your need for change."
    },
    trine: {
      whatItFeelsLike: "Natural balance between structure and change. Innovation that lasts. Tradition that adapts. Reform that works.",
      howItManifests: "Easy with reform. Structure that allows innovation. Change that builds on foundations. Natural reformer.",
      realLifeExamples: [
        "Reform that works",
        "Structures that adapt",
        "Change that's sustainable",
        "Innovation within tradition"
      ],
      growthPath: "Easy reform can lack urgency. Your gift is balanced change—now push it further. Sustainable reform still needs direction."
    },
    sextile: {
      whatItFeelsLike: "Balanced reform is available when you develop it. You CAN integrate structure and change—it takes effort.",
      howItManifests: "Responds well to reform opportunities. Innovation develops within structure. Change becomes constructive.",
      realLifeExamples: [
        "Learning to reform constructively",
        "Structure that welcomes innovation",
        "Change that builds rather than destroys",
        "Balance developing over time"
      ],
      growthPath: "Your opportunity is conscious reform. The capacity for structured change is there—develop it intentionally."
    }
  },

  'Saturn-Neptune': {
    conjunction: {
      whatItFeelsLike: "Reality meets dream. You feel both the need to build and the need to transcend. The realist meets the visionary—inside you.",
      howItManifests: "Grounded spirituality. May build dreams or dissolve structures. Creative work that requires discipline. Vision that needs form.",
      realLifeExamples: [
        "Manifesting dreams through discipline",
        "Spiritual practice that's grounded",
        "Art that requires structure",
        "Vision meeting reality"
      ],
      growthPath: "Your gift is grounded transcendence. Your growth is learning that dreams need structure and structure needs vision."
    },
    square: {
      whatItFeelsLike: "Friction between reality and fantasy. Dreams that dissolve. Structure that feels soulless. Confusion about what's real.",
      howItManifests: "Disillusionment or escapism. Reality feeling oppressive. Dreams that don't manifest. Tension between practical and spiritual.",
      realLifeExamples: [
        "Dreams not manifesting",
        "Reality crushing vision",
        "Confusion about what's real",
        "Spirituality vs. practicality"
      ],
      growthPath: "The friction is between dream and reality. You're learning that both matter. Vision without form dissipates; form without vision is dead."
    },
    opposition: {
      whatItFeelsLike: "Your structure and dreams come through others. Partners embody either reality or fantasy. Relationships balance grounding and transcendence.",
      howItManifests: "Attracting practical or dreamy partners. Learning about manifestation through relationship. Projection of either reality or fantasy.",
      realLifeExamples: [
        "Partners who are either very grounded or very dreamy",
        "Learning about dreams through structure",
        "Relationships that balance vision and reality",
        "Projecting either fantasy or limitation"
      ],
      growthPath: "Both the dreamer and the builder live in you. Own both. Stop outsourcing either your vision or your practicality."
    },
    trine: {
      whatItFeelsLike: "Natural balance between reality and dream. Visions that manifest. Structure that has soul. Grounded transcendence.",
      howItManifests: "Easy with manifestation. Dreams that become real. Practical spirituality. Natural ability to give form to vision.",
      realLifeExamples: [
        "Dreams that manifest",
        "Practical spirituality",
        "Art that works",
        "Vision with form"
      ],
      growthPath: "Easy manifestation can lack ambition. Your gift is grounded vision—now dream bigger. Manifestation capacity deserves worthy vision."
    },
    sextile: {
      whatItFeelsLike: "Grounded vision is available when you develop it. You CAN manifest dreams—it takes conscious effort.",
      howItManifests: "Responds well to disciplined visioning. Dreams develop with structure. Manifestation grows with practice.",
      realLifeExamples: [
        "Learning to manifest",
        "Structure helping vision",
        "Dreams developing with discipline",
        "Practical spirituality growing"
      ],
      growthPath: "Your opportunity is conscious manifestation. The capacity for grounded vision is there—develop it intentionally."
    }
  },

  'Saturn-Pluto': {
    conjunction: {
      whatItFeelsLike: "Structure meets power. Intense, heavy, transformative. You feel the weight of fundamental change. Building through destruction.",
      howItManifests: "Major structural transformation. Power meeting limits. Building on new foundations. Confronting fundamental realities.",
      realLifeExamples: [
        "Structures fundamentally changing",
        "Power meeting resistance",
        "Building on what's been destroyed",
        "Confronting deep realities"
      ],
      growthPath: "Your gift is transformative building. Your growth is learning that destruction serves creation. Build what will last beyond you."
    },
    square: {
      whatItFeelsLike: "Friction between structure and power. Control meeting resistance. Fundamental tension that forces change. Crisis that restructures.",
      howItManifests: "Power struggles around structures. Systems under intense pressure. Transformation through restriction. Crisis forcing rebuilding.",
      realLifeExamples: [
        "Structures under attack",
        "Power meeting hard limits",
        "Crisis forcing change",
        "Transformation through pressure"
      ],
      growthPath: "The friction is between control and transformation. You're learning that some things must break to become stronger. Crisis is the forge."
    },
    opposition: {
      whatItFeelsLike: "Your structural power comes through others. Partners embody either authority or transformation. Relationships involve fundamental change.",
      howItManifests: "Attracting powerful or controlling partners. Learning about structure through transformation. Projection of power or control.",
      realLifeExamples: [
        "Partners who are powerful or controlling",
        "Learning about power through relationship",
        "Relationships that force transformation",
        "Projecting either authority or intensity"
      ],
      growthPath: "Both the controller and the transformer live in you. Own both. Stop outsourcing either your authority or your intensity."
    },
    trine: {
      whatItFeelsLike: "Natural transformative authority. Structure that transforms. Power that builds. Intensity channeled constructively.",
      howItManifests: "Easy with power and structure. Transformation that builds. Authority used well. Deep change that's sustainable.",
      realLifeExamples: [
        "Power used constructively",
        "Transformation that builds",
        "Deep change that works",
        "Authority with depth"
      ],
      growthPath: "Easy power can be unconscious. Your gift is natural transformative authority—bring consciousness to it."
    },
    sextile: {
      whatItFeelsLike: "Transformative authority is available when you develop it. You CAN build through intensity—it takes conscious effort.",
      howItManifests: "Responds well to deep structural change. Transformation develops with discipline. Power builds over time.",
      realLifeExamples: [
        "Learning to use power constructively",
        "Transformation developing with structure",
        "Authority growing with depth",
        "Building through intensity"
      ],
      growthPath: "Your opportunity is conscious power. The capacity for transformative building is there—develop it intentionally."
    }
  },

  'Uranus-Neptune': {
    conjunction: {
      whatItFeelsLike: "Innovation meets transcendence. Generational mark: you're part of a wave bringing new spiritual or technological consciousness.",
      howItManifests: "Generational spiritual awakening. Technology and transcendence merge. New ways of seeing reality. Collective consciousness shift.",
      realLifeExamples: [
        "Part of a spiritual generation",
        "Technology opening new consciousness",
        "Innovative spirituality",
        "Collective awakening"
      ],
      growthPath: "Your gift is innovative transcendence. Your growth is grounding generational gifts in personal practice."
    },
    square: {
      whatItFeelsLike: "Friction between innovation and transcendence. Technology vs. spirituality. Awakening through disruption. Generational tension.",
      howItManifests: "Confusion about technology and spirit. Awakening through crisis. Innovation that dissolves boundaries uncomfortably.",
      realLifeExamples: [
        "Technology creating spiritual confusion",
        "Awakening through disruption",
        "Innovation challenging meaning",
        "Generational spiritual crisis"
      ],
      growthPath: "The friction is between innovation and transcendence. You're learning to integrate both. Technology and spirit can serve each other."
    },
    opposition: {
      whatItFeelsLike: "Your innovation and transcendence come through others. Partners embody either technology or spirituality. Relationships balance both.",
      howItManifests: "Attracting innovative or spiritual partners. Learning about consciousness through relationship. Projection of either.",
      realLifeExamples: [
        "Partners who are either techy or spiritual",
        "Learning about transcendence through innovation",
        "Relationships that balance both",
        "Projecting one onto others"
      ],
      growthPath: "Both the innovator and the mystic live in you. Own both. Stop outsourcing either your innovation or your transcendence."
    },
    trine: {
      whatItFeelsLike: "Natural balance between innovation and transcendence. Technology that serves spirit. Spirituality that embraces change.",
      howItManifests: "Easy with innovative spirituality. Technology and transcendence in harmony. Natural visionary with technical capacity.",
      realLifeExamples: [
        "Technology serving consciousness",
        "Innovative spirituality",
        "Vision with technical capacity",
        "Transcendence through innovation"
      ],
      growthPath: "Easy synthesis can lack grounding. Your gift is innovative transcendence—now apply it. Vision needs action."
    },
    sextile: {
      whatItFeelsLike: "Innovative transcendence is available when you develop it. You CAN integrate technology and spirit—it takes effort.",
      howItManifests: "Responds well to innovative spiritual practice. Technology and transcendence develop together. Integration grows.",
      realLifeExamples: [
        "Learning to integrate technology and spirit",
        "Innovative practice developing",
        "Transcendence through technology growing",
        "Balance developing over time"
      ],
      growthPath: "Your opportunity is conscious integration. The capacity is there—develop it intentionally."
    }
  },

  'Uranus-Pluto': {
    conjunction: {
      whatItFeelsLike: "Revolution meets transformation. Generational mark: you're part of a wave of fundamental change. Revolutionary transformation.",
      howItManifests: "Generational revolutionary energy. Fundamental change in power structures. Transformative breakthrough. Collective evolution.",
      realLifeExamples: [
        "Part of a revolutionary generation",
        "Power structures fundamentally changing",
        "Revolutionary transformation",
        "Collective breakthrough"
      ],
      growthPath: "Your gift is revolutionary transformation. Your growth is channeling generational energy constructively."
    },
    square: {
      whatItFeelsLike: "Friction between revolution and power. Intense pressure for change. Breakthrough through crisis. Fundamental disruption.",
      howItManifests: "Revolutionary crisis. Power meeting revolutionary change. Transformation through disruption. Intense generational pressure.",
      realLifeExamples: [
        "Revolutionary pressure",
        "Power structures under attack",
        "Transformation through crisis",
        "Intense generational change"
      ],
      growthPath: "The friction is between revolution and transformation. You're learning that change requires both destruction and creation."
    },
    opposition: {
      whatItFeelsLike: "Your revolution and transformation come through others. Partners embody either revolutionary or transformative energy.",
      howItManifests: "Attracting revolutionary or intense partners. Learning about transformation through relationship. Projection of power or change.",
      realLifeExamples: [
        "Partners who are revolutionary or transformative",
        "Learning about change through others",
        "Relationships that transform everything",
        "Projecting intensity onto partners"
      ],
      growthPath: "Both the revolutionary and the transformer live in you. Own both. Stop outsourcing either your innovation or your power."
    },
    trine: {
      whatItFeelsLike: "Natural revolutionary transformation. Change that empowers. Power that innovates. Breakthrough that transforms.",
      howItManifests: "Easy with revolutionary change. Transformation that empowers. Innovation with depth. Natural catalyst.",
      realLifeExamples: [
        "Revolutionary change that works",
        "Transformation through innovation",
        "Power used for change",
        "Natural evolutionary catalyst"
      ],
      growthPath: "Easy revolutionary power can be unconscious. Your gift is natural transformation—bring awareness to it."
    },
    sextile: {
      whatItFeelsLike: "Revolutionary transformation is available when you develop it. You CAN be a catalyst for change—it takes effort.",
      howItManifests: "Responds well to transformative innovation. Revolutionary capacity develops. Change becomes empowering.",
      realLifeExamples: [
        "Learning to catalyze change",
        "Revolutionary capacity developing",
        "Transformation becoming empowering",
        "Change capacity growing"
      ],
      growthPath: "Your opportunity is conscious revolution. The transformative capacity is there—develop it intentionally."
    }
  },

  'Neptune-Pluto': {
    conjunction: {
      whatItFeelsLike: "Transcendence meets transformation. Generational mark affecting the collective unconscious over very long cycles. Spiritual evolution.",
      howItManifests: "Very long cycle. Collective unconscious transformation. Spiritual evolution at deepest levels. Generational soul evolution.",
      realLifeExamples: [
        "Part of deep collective evolution",
        "Spiritual transformation at soul level",
        "Collective unconscious shifting",
        "Generational spiritual evolution"
      ],
      growthPath: "Your gift is deep spiritual transformation. This is generational work—your growth is personal expression of collective evolution."
    },
    square: {
      whatItFeelsLike: "Friction between transcendence and power. Spiritual transformation through crisis. Dissolution meeting intensity.",
      howItManifests: "Deep spiritual crisis. Transformation through spiritual confrontation. Power dynamics around transcendence.",
      realLifeExamples: [
        "Spiritual crisis",
        "Power meeting spirituality",
        "Transformation through dissolution",
        "Intense spiritual confrontation"
      ],
      growthPath: "The friction is between transcendence and transformation. Both are forms of letting go—of ego or of form."
    },
    opposition: {
      whatItFeelsLike: "Your spirituality and power come through others. Partners embody either transcendence or intensity.",
      howItManifests: "Attracting spiritual or intense partners. Learning about transformation through transcendence. Projection of either.",
      realLifeExamples: [
        "Partners who are spiritual or intense",
        "Learning about power through spirituality",
        "Relationships that transform through transcendence",
        "Projecting depth onto others"
      ],
      growthPath: "Both the mystic and the transformer live in you. Own both. Stop outsourcing either your transcendence or your power."
    },
    trine: {
      whatItFeelsLike: "Natural spiritual transformation. Transcendence that empowers. Power that transcends. Deep evolution.",
      howItManifests: "Easy with deep spiritual work. Transformation through transcendence. Power used for spiritual evolution.",
      realLifeExamples: [
        "Spiritual work that transforms",
        "Transcendence with power",
        "Deep evolution",
        "Natural spiritual depth"
      ],
      growthPath: "Easy depth can stay unconscious. Your gift is natural spiritual transformation—bring it to light."
    },
    sextile: {
      whatItFeelsLike: "Spiritual transformation is available. Current generational aspect: spirituality supports collective evolution.",
      howItManifests: "Responds well to deep spiritual practice. Transformation develops through transcendence. Collective evolution supported.",
      realLifeExamples: [
        "Spiritual practice transforming you",
        "Transcendence developing power",
        "Evolution through spiritual work",
        "Deep practice becoming accessible"
      ],
      growthPath: "Your opportunity is conscious spiritual evolution. The depth is there—engage with it."
    }
  }
};

/**
 * Get formatted interpretation for Narrative display
 */
export const getFormattedAspectNarrative = (
  planet1: string,
  planet2: string,
  aspectType: string,
  sign1?: string,
  sign2?: string
): string => {
  const interp = getDeepAspectInterpretation(planet1, planet2, aspectType);
  
  if (!interp) {
    // Fallback for missing pairs
    return getFallbackInterpretation(planet1, planet2, aspectType);
  }

  // Format as teaching narrative
  let narrative = `**What this feels like:** ${interp.whatItFeelsLike}\n\n`;
  narrative += `**How it manifests:** ${interp.howItManifests}`;
  
  if (interp.realLifeExamples.length > 0) {
    narrative += `\n\n**Real-life patterns:** ${interp.realLifeExamples.slice(0, 3).join(' • ')}`;
  }
  
  if (interp.growthPath) {
    narrative += `\n\n**Growth path:** ${interp.growthPath}`;
  }

  return narrative;
};

/**
 * Fallback for aspects not yet in database
 */
const getFallbackInterpretation = (
  planet1: string,
  planet2: string,
  aspectType: string
): string => {
  const aspectMeaning: Record<string, string> = {
    conjunction: `${planet1} and ${planet2} energies are MERGED—they act as a single force. Whatever this combination represents is core to who you are, not optional.`,
    square: `${planet1} and ${planet2} create FRICTION that demands resolution. This isn't about elimination—it's about integration. The tension forces development that comfort never would.`,
    opposition: `${planet1} and ${planet2} face each other across your chart. You may project one onto others, or oscillate between them. The growth is OWNING both, not choosing sides.`,
    trine: `${planet1} and ${planet2} flow together easily. This is a gift—but gifts taken for granted don't develop. The ease is your floor, not your ceiling.`,
    sextile: `${planet1} and ${planet2} SUPPORT each other when you make effort. This is potential, not automatic. Initiative activates what's dormant.`
  };

  return aspectMeaning[aspectType.toLowerCase()] || 
    `${planet1} and ${planet2} in ${aspectType}: These energies interact in ways that shape your experience. Look at the houses involved for specifics.`;
};
