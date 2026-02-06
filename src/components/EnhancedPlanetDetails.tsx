import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { NatalPlanetPosition } from '@/hooks/useNatalChart';
import {
  PLANET_DIGNITIES,
  SIGN_PROPERTIES,
  HOUSE_TYPES,
  TRIPLICITY_RULERS,
  AVERAGE_SPEEDS,
  SATURN_SYMBOLS,
  getElementSymbol,
  getDecanName,
  getTermRuler,
  getDecanRuler,
  getDignityStatus,
  getSectStatus,
  getHousesRuled,
  calculateDeclination,
  EGYPTIAN_TERMS,
  DECAN_RULERS
} from '@/lib/planetDignities';
import { SABIAN_SYMBOLS } from '@/lib/sabianSymbols';

// ============================================================================
// PERSONALIZED INTERPRETATION GENERATORS
// ============================================================================

// Term ruler interpretations - how the bound ruler colors a planet's expression
const TERM_FLAVOR: Record<string, string> = {
  Jupiter: "expansive optimism and a natural sense of opportunity",
  Venus: "social grace, aesthetic sensitivity, and relational warmth",
  Mercury: "intellectual curiosity, adaptability, and communicative flair",
  Mars: "assertive drive, competitive edge, and decisive action",
  Saturn: "disciplined focus, mature restraint, and lasting endurance"
};

// Decan ruler interpretations - the sub-ruler's influence
const DECAN_RULER_FLAVOR: Record<string, string> = {
  Sun: "creative confidence, leadership presence, and radiant self-expression",
  Moon: "emotional attunement, instinctual responses, and nurturing awareness",
  Mercury: "mental agility, curious exploration, and verbal skill",
  Venus: "harmony-seeking, aesthetic appreciation, and diplomatic charm",
  Mars: "bold initiative, courageous action, and competitive spirit",
  Jupiter: "philosophical breadth, generous outlook, and faith-driven expansion",
  Saturn: "serious responsibility, patient building, and structured discipline"
};

const getPositionInterpretation = (planet: string, degree: number, sign: string): string => {
  const decanNum = Math.floor(degree / 10) + 1;
  const decanDescriptions: Record<string, Record<number, string>> = {
    Aries: {
      1: "pioneering energy and raw courage",
      2: "creative leadership and heart-centered action", 
      3: "diplomatic assertion and refined initiative"
    },
    Taurus: {
      1: "intellectual grounding and practical thinking",
      2: "emotional security and nurturing stability",
      3: "disciplined building and structured growth"
    },
    Gemini: {
      1: "expansive curiosity and optimistic communication",
      2: "dynamic ideas and energetic expression",
      3: "radiant intellect and creative thinking"
    },
    Cancer: {
      1: "harmonious nurturing and beautiful care",
      2: "communicative emotions and mental sensitivity",
      3: "intuitive depth and emotional wisdom"
    },
    Leo: {
      1: "structured creativity and disciplined expression",
      2: "generous expansion and joyful abundance",
      3: "passionate action and bold creativity"
    },
    Virgo: {
      1: "illuminated service and conscious improvement",
      2: "harmonious analysis and beautiful precision",
      3: "intellectual refinement and communicative skill"
    },
    Libra: {
      1: "intuitive balance and emotional diplomacy",
      2: "structured harmony and committed partnership",
      3: "expansive justice and philosophical fairness"
    },
    Scorpio: {
      1: "intense transformation and powerful depth",
      2: "illuminated mystery and conscious power",
      3: "passionate intensity and harmonious transformation"
    },
    Sagittarius: {
      1: "grounded wisdom and practical philosophy",
      2: "emotional faith and intuitive expansion",
      3: "disciplined seeking and structured belief"
    },
    Capricorn: {
      1: "abundant ambition and expansive achievement",
      2: "dynamic mastery and energetic building",
      3: "radiant authority and creative leadership"
    },
    Aquarius: {
      1: "harmonious innovation and beautiful vision",
      2: "intellectual revolution and communicative change",
      3: "intuitive humanity and emotional idealism"
    },
    Pisces: {
      1: "structured spirituality and disciplined surrender",
      2: "expansive compassion and abundant faith",
      3: "transformative transcendence and deep mysticism"
    }
  };

  const decanQuality = decanDescriptions[sign]?.[decanNum] || "unique expression";
  
  // Get term (bound) ruler for this degree
  const termRuler = getTermRuler(sign, degree);
  const termFlavor = termRuler ? TERM_FLAVOR[termRuler] : null;
  
  // Get decan ruler
  const decanRulers = DECAN_RULERS[sign];
  const decanRuler = decanRulers ? decanRulers[decanNum - 1] : null;
  const decanRulerFlavor = decanRuler ? DECAN_RULER_FLAVOR[decanRuler] : null;
  
  // Get Sabian symbol for this degree (Sabian uses degree + 1)
  const sabianDegree = Math.floor(degree) + 1;
  const sabianKey = `${sabianDegree}-${sign}`;
  const sabian = SABIAN_SYMBOLS[sabianKey];
  
  // Build the interpretation with actual degree-specific meaning
  let interpretation = `Your ${planet} at ${degree}° ${sign} sits in the ${decanNum === 1 ? 'first' : decanNum === 2 ? 'second' : 'third'} decan, expressing through ${decanQuality}.`;
  
  // Add Term influence
  if (termRuler && termFlavor) {
    interpretation += ` At this specific degree, your ${planet} operates within ${termRuler}'s term (bound), adding a layer of ${termFlavor}.`;
  }
  
  // Add Decan ruler influence
  if (decanRuler && decanRulerFlavor && decanRuler !== termRuler) {
    interpretation += ` The ${decanRuler}-ruled decan brings ${decanRulerFlavor}.`;
  }
  
  // Add Sabian Symbol meaning
  if (sabian) {
    interpretation += `\n\n**Sabian Symbol (${sabianDegree}° ${sign}):** "${sabian.symbol}" — ${sabian.meaning}`;
  }
  
  return interpretation;
};

const getElementInterpretation = (planet: string, element: string, sign: string): string => {
  const elementFeelings: Record<string, Record<string, string>> = {
    Fire: {
      Sun: `**How you FEEL this:** Your identity burns bright—you need action, movement, and creative expression to feel alive. Sitting still for too long makes you restless. You feel most yourself when taking initiative, leading, or doing something bold. Boredom is your enemy; passion is your fuel.`,
      Moon: `**How you FEEL this:** Your emotions are quick, hot, and dramatic. You process feelings through action—you might need to move, exercise, or DO something when upset. Emotional stagnation feels suffocating. You crave excitement and can get moody when life feels too routine.`,
      Mercury: `**How you FEEL this:** Your mind is fast, enthusiastic, and impatient. You think by talking, often figuring things out mid-sentence. Slow, detailed explanations bore you—you want the big picture NOW. Ideas excite you physically; you might gesture wildly when inspired.`,
      Venus: `**How you FEEL this:** In love and pleasure, you want intensity, adventure, and passion. Lukewarm relationships bore you. You're attracted to confidence, boldness, and people who can match your energy. You show love through grand gestures and spontaneous acts.`,
      Mars: `**How you FEEL this:** Your drive is pure and direct. When you want something, you GO for it—hesitation feels foreign. Anger comes fast but usually burns out quickly. Physical activity is essential; you might feel anxious or irritable without it.`,
      Jupiter: `**How you FEEL this:** Your optimism is active and infectious. You believe through DOING—faith means taking leaps. You grow through adventure, risk-taking, and bold expansion. Playing it safe feels like a slow death.`,
      Saturn: `**How you FEEL this:** Responsibility and structure are things you want to conquer actively. You approach discipline like a warrior—attacking goals head-on. Delays frustrate you more than most; you want to BUILD and see results NOW.`
    },
    Earth: {
      Sun: `**How you FEEL this:** You feel most yourself when grounded, productive, and building something tangible. Abstract identity doesn't appeal—you ARE what you DO and CREATE. Security matters. You need to see, touch, and use results to feel real accomplishment.`,
      Moon: `**How you FEEL this:** Emotional security comes through physical comfort, routine, and material stability. When stressed, you might eat, organize, or work with your hands. You process feelings slowly and need time to digest experiences. Chaos is deeply unsettling.`,
      Mercury: `**How you FEEL this:** Your thinking is methodical and practical—you want to APPLY knowledge, not just discuss it. Abstract theories frustrate you unless they lead somewhere useful. You learn by doing and remember through physical or sensory experience.`,
      Venus: `**How you FEEL this:** Love needs to be reliable, sensual, and demonstrated through consistent actions. Grand words mean little without follow-through. You appreciate quality—fine textures, good food, beautiful objects. You show love through practical care and physical presence.`,
      Mars: `**How you FEEL this:** Your drive is steady and persistent rather than explosive. You build momentum over time. Once committed, you're nearly unstoppable, but starting requires clear purpose. You prefer working toward concrete, measurable goals.`,
      Jupiter: `**How you FEEL this:** Growth and opportunity feel real when they produce tangible results—money, resources, skills you can use. Philosophical expansion for its own sake doesn't excite you; you want wisdom that WORKS.`,
      Saturn: `**How you FEEL this:** Structure and discipline come naturally—you understand that slow, steady effort builds empires. You're patient with long-term goals but might struggle with abstract ambitions. You need to see the practical path.`
    },
    Air: {
      Sun: `**How you FEEL this:** You feel most alive in your MIND. Ideas, conversations, and intellectual connections define you more than emotional intensity or physical achievements. You might feel detached from your body or emotions—identity lives in your thoughts and social connections.`,
      Moon: `**How you FEEL this:** You intellectualize emotions rather than drowning in them. When upset, you analyze WHY you feel that way. Raw emotional expression might feel uncomfortable or embarrassing. You process feelings through talking, writing, or thinking them through. People might say you're "in your head"—and you are. That's where you feel safe.`,
      Mercury: `**How you FEEL this:** This is your natural element! Your mind is quick, curious, and constantly making connections. Ideas excite you viscerally. You might think in multiple streams simultaneously, enjoy wordplay, and feel genuinely energized by good conversation.`,
      Venus: `**How you FEEL this:** Attraction starts in the mind. Intellectual connection is foreplay. You need someone you can TALK to, who stimulates your thinking. Purely physical or emotional relationships feel shallow. You show love through communication and shared ideas.`,
      Mars: `**How you FEEL this:** You fight with words and strategy, not fists. Your drive is mental—you attack problems intellectually. Anger often manifests as sharp words or cutting logic. You're motivated by ideas, causes, and mental challenges rather than purely physical goals.`,
      Jupiter: `**How you FEEL this:** Your growth comes through learning, connecting with diverse people, and spreading ideas. You're optimistic about humanity's potential for reason. Knowledge feels like wealth; a good library feels like a treasure chest.`,
      Saturn: `**How you FEEL this:** You take ideas seriously. Mental discipline, structured thinking, and intellectual rigor matter to you. You might fear being seen as stupid or uninformed. Your greatest achievements likely involve communication, teaching, or sharing knowledge.`
    },
    Water: {
      Sun: `**How you FEEL this:** You feel most yourself when emotionally connected and intuitively tuned in. Pure logic without feeling seems hollow. You might struggle to articulate who you ARE because identity feels fluid—you sense yourself more than define yourself.`,
      Moon: `**How you FEEL this:** This is your natural element! Emotions are powerful, deep, and often overwhelming. You absorb others' feelings like a sponge. You need solitude to process and discharge what you've absorbed. Intuition is strong—you know things without knowing how you know.`,
      Mercury: `**How you FEEL this:** You think with your feelings. Logic follows intuition, not the other way around. You might struggle to explain HOW you arrived at conclusions because the knowing came through sensing, not reasoning. You remember how things FELT, not just what happened.`,
      Venus: `**How you FEEL this:** Love is deep, merging, and all-consuming. You don't do shallow connections. Intimacy means emotional nakedness—knowing someone's soul. You're attracted to emotional depth and can sense when someone is hiding their true self.`,
      Mars: `**How you FEEL this:** Your drive is connected to emotional motivation. You fight for what you CARE about. Anger can be passive-aggressive or explosive depending on how long it's been building. You're motivated by protecting those you love and pursuing what moves you.`,
      Jupiter: `**How you FEEL this:** Growth comes through emotional and spiritual experiences. Travel or education mean nothing without FEELING the expansion. You grow through love, healing, and deep connection. Compassion is your philosophy.`,
      Saturn: `**How you FEEL this:** Emotional boundaries are your life lesson. You might fear vulnerability or have experienced early emotional hardship that taught you to protect yourself. Your greatest mastery involves learning to feel deeply while staying boundaried.`
    }
  };

  const planetFeeling = elementFeelings[element]?.[planet];
  if (!planetFeeling) {
    return `Your ${planet} in ${sign} operates through the ${element} element. This colors how you experience ${planet} themes—through ${element === 'Fire' ? 'action and inspiration' : element === 'Earth' ? 'practical, tangible experience' : element === 'Air' ? 'thought and communication' : 'feeling and intuition'}.`;
  }

  return `Your ${planet} in ${sign} operates through the ${element} element.

${planetFeeling}`;
};

const getModeInterpretation = (planet: string, mode: string, sign: string): string => {
  const modeFeelings: Record<string, Record<string, string>> = {
    Cardinal: {
      Sun: `**How you FEEL this:** You feel most alive when STARTING something. The beginning of projects, relationships, or adventures energizes you. Once things become routine, you might lose interest or want to start something new. Leadership and initiative feel natural.`,
      Moon: `**How you FEEL this:** Emotionally, you need fresh starts and new beginnings. Stagnant emotional situations feel suffocating. You might be the one who initiates emotional conversations or pushes for change in relationships. You process feelings by taking action.`,
      Mercury: `**How you FEEL this:** Your mind is oriented toward new ideas and initiating conversations. You think quickly and want to share ideas immediately. Planning feels exciting; execution can feel tedious. You're an idea-starter.`,
      Venus: `**How you FEEL this:** In love, you're drawn to new connections and the excitement of beginnings. You might pursue what you want actively rather than waiting to be chosen. You bring initiative and freshness to relationships.`,
      Mars: `**How you FEEL this:** Your drive is about launching, initiating, and being FIRST. Competition energizes you. You're a self-starter who doesn't need external motivation. Waiting for others to begin feels frustrating.`,
      Jupiter: `**How you FEEL this:** Your growth comes through launching new ventures, starting journeys, and pioneering paths. You're optimistic about new beginnings and see opportunity in fresh starts.`,
      Saturn: `**How you FEEL this:** Your ambition is about founding, establishing, and creating structures. You take responsibility for initiating change and building from scratch.`
    },
    Fixed: {
      Sun: `**How you FEEL this:** You feel most yourself when deeply committed and consistent. Constant change feels destabilizing—you need continuity to know who you are. Others see you as reliable and stubborn. You resist being pushed.`,
      Moon: `**How you FEEL this:** Emotionally, you're steady and don't shift easily. Your moods are consistent—for better or worse. Once attached, you're loyal for life. Emotional change comes slowly and resistance to feeling differently is strong.`,
      Mercury: `**How you FEEL this:** Your thinking is thorough and persistent. You don't change your mind easily—you need serious evidence. You prefer to master one subject deeply rather than skip around. Mental habits are hard to break.`,
      Venus: `**How you FEEL this:** In love, you're loyal, possessive, and committed. You don't fall in or out of love quickly. Relationships are long-term investments. You value stability over excitement and can be quite stubborn about what you want.`,
      Mars: `**How you FEEL this:** Your drive is about endurance and follow-through. You might start slowly, but once committed, nothing stops you. Your willpower is formidable. You finish what you start.`,
      Jupiter: `**How you FEEL this:** Growth comes through deepening, not spreading. You expand by going deeper into what you already have rather than constantly seeking new opportunities. Stability is wealth.`,
      Saturn: `**How you FEEL this:** Discipline and persistence are your superpowers. You understand that lasting achievement requires sustained effort. You're not afraid of long-term commitment.`
    },
    Mutable: {
      Sun: `**How you FEEL this:** Your identity is flexible and adaptable. You might feel like a different person in different contexts—and that's okay. Rigidity feels stifling. You define yourself through your ability to adjust and connect different worlds.`,
      Moon: `**How you FEEL this:** Your emotions are changeable and responsive to your environment. You pick up on others' moods easily and might have trouble distinguishing your feelings from theirs. You process by talking or moving.`,
      Mercury: `**How you FEEL this:** Your mind is versatile and quick to adapt. You can see multiple perspectives easily—sometimes too easily, leading to indecision. You love variety and get bored with repetition.`,
      Venus: `**How you FEEL this:** In love, you're flexible and value mental connection. You can adapt to different partners and situations. Variety in relationships appeals to you; routine can feel stifling.`,
      Mars: `**How you FEEL this:** Your drive adapts to circumstances. You're strategic rather than forceful, working around obstacles instead of through them. You might start many things without finishing all of them.`,
      Jupiter: `**How you FEEL this:** Growth comes through learning, traveling, and synthesizing diverse experiences. You expand by connecting different worlds and translating between them.`,
      Saturn: `**How you FEEL this:** Your discipline is about mastering adaptability—learning to be consistent while remaining flexible. Structure serves learning and communication.`
    }
  };

  const planetFeeling = modeFeelings[mode]?.[planet];
  if (!planetFeeling) {
    return `Your ${planet} in ${sign} is in ${mode} mode. This means your ${planet} expresses through ${mode === 'Cardinal' ? 'initiation and leadership' : mode === 'Fixed' ? 'persistence and determination' : 'adaptability and flexibility'}.`;
  }

  return `Your ${planet} in ${sign} is in ${mode} mode.

${planetFeeling}`;
};

const getAngularityInterpretation = (planet: string, houseType: string, house: number): string => {
  const angularFeelings: Record<string, Record<string, string>> = {
    Angular: {
      Sun: `**How you FEEL this:** Your identity is VISIBLE. People notice you, for better or worse. You can't hide who you are—and you probably don't want to. You feel most alive when in the spotlight, taking action, or actively shaping your world.`,
      Moon: `**How you FEEL this:** Your emotions are front and center in your life. You can't hide how you feel—it shows on your face. Emotional situations find you, and you actively engage with nurturing, family, or public life.`,
      Mercury: `**How you FEEL this:** Your thinking and communication are prominent features of who you are. You're known for your ideas, your words, or your intellect. Mental activity is central to your life direction.`,
      Venus: `**How you FEEL this:** Your values, aesthetics, and relationships are highly visible parts of your identity. You might be known for your taste, your charm, or your partnerships. Love and beauty play a central role.`,
      Mars: `**How you FEEL this:** Your drive and assertiveness are powerful and obvious. You're known for your energy, ambition, or competitive spirit. Action is a central theme—you make things happen.`,
      Jupiter: `**How you FEEL this:** Your optimism, wisdom, or expansiveness is a visible part of who you are. You might be known for teaching, traveling, or big-picture thinking. Growth happens in obvious, public ways.`,
      Saturn: `**How you FEEL this:** Your responsibilities, ambitions, and structures are central to your life. You're known for your discipline, achievements, or authority. Career and public standing matter greatly.`
    },
    Succedent: {
      Sun: `**How you FEEL this:** Your identity develops through building resources and value over time. You might not seek the spotlight, but you accumulate power steadily. Your sense of self is connected to what you own or create.`,
      Moon: `**How you FEEL this:** Emotional security comes through building stability—financial, material, or in terms of values. You invest emotionally in what you're building. Security grows over time.`,
      Mercury: `**How you FEEL this:** Your thinking is oriented toward practical value and building knowledge systematically. You prefer deep understanding to quick impressions. Mental resources accumulate.`,
      Venus: `**How you FEEL this:** Love and pleasure connect to what you're building. Relationships are investments. You value quality over quantity and appreciate steady, accumulating beauty.`,
      Mars: `**How you FEEL this:** Your drive works steadily toward building something of value. You're not in a hurry—you're building for the long term. Power accumulates through persistent effort.`,
      Jupiter: `**How you FEEL this:** Growth comes through investment—of time, money, energy. You expand your resources rather than just your horizons. Opportunity builds on opportunity.`,
      Saturn: `**How you FEEL this:** You understand that real achievement takes sustained effort. You're building structures that last. Responsibility is an investment that pays off over time.`
    },
    Cadent: {
      Sun: `**How you FEEL this:** Your identity expresses through learning, thinking, and adapting. You might feel like a perpetual student or helper. Your sense of self develops through mental activity and service.`,
      Moon: `**How you FEEL this:** You process emotions through analysis, communication, or helping others. Feelings need to be understood, not just felt. You might be drawn to healing or supportive roles.`,
      Mercury: `**How you FEEL this:** This is comfortable territory! Your mind is in its natural habitat—learning, communicating, analyzing, adapting. Intellectual and mental activities feel like home.`,
      Venus: `**How you FEEL this:** Love and beauty connect to learning, communication, or service. You might find pleasure in helping, teaching, or intellectual pursuits. Relationships involve mental connection.`,
      Mars: `**How you FEEL this:** Your drive expresses through mental effort, communication, or adaptive strategies. You work smarter, not just harder. Action serves learning or helping.`,
      Jupiter: `**How you FEEL this:** Growth comes through learning, teaching, and intellectual expansion. Travel or education might be literal or metaphorical. Wisdom develops through processing experience.`,
      Saturn: `**How you FEEL this:** Your discipline applies to mental work, learning, or service. You take communication and analysis seriously. Mastery comes through dedicated study and practice.`
    }
  };

  const planetFeeling = angularFeelings[houseType]?.[planet];
  if (!planetFeeling) {
    return `Your ${planet} in the ${house}${getOrdinal(house)} house is in a ${houseType.toLowerCase()} position—${houseType === 'Angular' ? 'powerful and visible' : houseType === 'Succedent' ? 'building and accumulating' : 'learning and adapting'}.`;
  }

  return `Your ${planet} in the ${house}${getOrdinal(house)} house is in a ${houseType} position—${houseType === 'Angular' ? 'the most powerful and visible' : houseType === 'Succedent' ? 'a place of building and resources' : 'a place of learning and adaptation'}.

${planetFeeling}`;
};

const getMotionInterpretation = (planet: string, isRetrograde: boolean): string => {
  const retrogradeFeelings: Record<string, string> = {
    Mercury: `**How you FEEL this:** Your thinking works differently—more reflective, internal, and nonlinear. You might struggle to express ideas clearly on the first try, but your inner processing is rich. You may have been misunderstood as a child or feel like your mind works in a way others don't quite get. Writing, revising, and refining thoughts comes naturally.`,
    Venus: `**How you FEEL this:** Love and value operate internally first. You might not show affection obviously or pursue relationships conventionally. Your aesthetic sense is personal rather than mainstream. You may have felt unloved or undervalued early on, developing a rich inner relationship with beauty and worth.`,
    Mars: `**How you FEEL this:** Your drive turns inward before expressing outward. You might hesitate before acting, processing anger internally, or take indirect routes to goals. Others might see you as passive, but there's a furnace inside. Your assertiveness developed later or in unconventional ways.`,
    Jupiter: `**How you FEEL this:** Your growth and faith developed through inner journeys rather than outer adventures. You find wisdom through reflection, not just experience. Optimism might not come easily—you had to develop it consciously. Your philosophy is personal and hard-won.`,
    Saturn: `**How you FEEL this:** Discipline and structure are internal matters. External authority might feel oppressive while your inner authority is strong. You set your own standards. Others' expectations matter less than your own, which can be even more demanding.`
  };

  const directFeelings: Record<string, string> = {
    Mercury: `**How you FEEL this:** Your thinking flows naturally outward. You process by talking or writing, expressing ideas readily. Communication feels natural and others generally understand your mental approach.`,
    Venus: `**How you FEEL this:** Love and pleasure express naturally. You can show affection, pursue what you value, and connect with beauty in straightforward ways. Your aesthetic sense aligns with how you present it.`,
    Mars: `**How you FEEL this:** Your drive expresses directly. When you want something, you go for it. Anger comes out rather than turning inward. Others recognize your energy and assertiveness.`,
    Jupiter: `**How you FEEL this:** Growth and opportunity flow outward. You expand through external experiences, travel, education, and sharing wisdom. Optimism comes naturally.`,
    Saturn: `**How you FEEL this:** You work with external structures and authorities relatively smoothly. Discipline manifests in visible achievements. The rules make sense to you, even when challenging.`
  };

  if (isRetrograde) {
    const feeling = retrogradeFeelings[planet] || `Your internal processing of ${planet} themes is rich, but external expression may take extra effort.`;
    return `Your ${planet} is retrograde (℞), meaning its energy turns inward first.

${feeling}

**The gift:** Retrograde planets often develop profound, unique perspectives through deep internal work. What others do automatically, you've had to consciously develop—making you an eventual master.`;
  }

  const feeling = directFeelings[planet] || `Your ${planet} expresses its energy outwardly in natural, recognizable ways.`;
  return `Your ${planet} is direct, moving forward through the zodiac naturally.

${feeling}`;
};

const getSpeedInterpretation = (planet: string, isRetrograde: boolean): string => {
  const speedNotes: Record<string, string> = {
    Sun: "moves approximately 1° per day, marking your solar return each year",
    Moon: "is the fastest-moving body, changing signs every 2-3 days and cycling through the zodiac monthly",
    Mercury: "moves quickly but retrogrades 3 times yearly, revisiting themes of communication",
    Venus: "moves moderately, spending about a month in each sign, with a retrograde every 18 months",
    Mars: "takes about 2 years to complete the zodiac, with a retrograde every 2 years",
    Jupiter: "spends about a year in each sign, bringing expansion to that area annually",
    Saturn: "spends 2-3 years per sign, bringing long-term lessons and structure",
    Uranus: "spends 7 years per sign, marking generational shifts in innovation",
    Neptune: "spends 14 years per sign, creating generational spiritual themes",
    Pluto: "spends 12-30 years per sign (varying due to elliptical orbit), transforming generations"
  };

  const note = speedNotes[planet] || "moves through the zodiac at its own pace";
  const retroNote = isRetrograde ? " Currently retrograde, it appears to slow or pause from Earth's view." : "";

  return `Your ${planet} ${note}.${retroNote} This rhythm affects how quickly ${planet} themes unfold in your life—faster planets bring rapid changes while slower planets indicate long-term processes.`;
};

const getDignityInterpretation = (planet: string, sign: string, dignityType: string): string => {
  const dignityFeelings: Record<string, Record<string, string>> = {
    Ruler: {
      Sun: `**How you FEEL this:** Your identity is clear and powerful. You know who you are. Confidence comes naturally, and others sense your authenticity. Being yourself doesn't require effort—you simply ARE.`,
      Moon: `**How you FEEL this:** Your emotional nature flows easily. You feel your feelings fully and naturally nurture yourself and others. Emotional intelligence is instinctive, not learned.`,
      Mercury: `**How you FEEL this:** Your mind works smoothly and powerfully. Thinking, communicating, and learning feel natural. You're in your element when processing information and expressing ideas.`,
      Venus: `**How you FEEL this:** Love, beauty, and pleasure flow naturally. You know what you value and attract it easily. Relationships and aesthetics come effortlessly.`,
      Mars: `**How you FEEL this:** Your drive and assertiveness are strong and effective. When you want something, you know how to get it. Energy flows freely and actions succeed.`,
      Jupiter: `**How you FEEL this:** Optimism and growth come naturally. Opportunities find you, and expansion feels effortless. Faith is easy; luck seems to follow you.`,
      Saturn: `**How you FEEL this:** Discipline and structure feel natural, not restrictive. You understand how to build, achieve, and take responsibility. Authority fits you like a glove.`
    },
    Exaltation: {
      Sun: `**How you FEEL this:** Your identity is celebrated and elevated. You feel special, honored, and capable of greatness. Confidence comes with a sense of being destined for something.`,
      Moon: `**How you FEEL this:** Your emotional nature is refined and honored. Feelings have depth and meaning. You're sensitive in a way that's valued, not dismissed.`,
      Mercury: `**How you FEEL this:** Your mind is sharp and elevated. Ideas come with extra clarity and significance. Communication has grace and impact.`,
      Venus: `**How you FEEL this:** Love and beauty feel exquisite. You experience pleasure deeply and attract admiration. There's a refinement to how you love and value.`,
      Mars: `**How you FEEL this:** Your drive is purposeful and honored. Action feels meaningful and directed toward worthy goals. Energy is controlled and effective.`,
      Jupiter: `**How you FEEL this:** Growth and wisdom feel blessed. You're on a fortunate path, and expansion brings genuine elevation—not just more, but better.`,
      Saturn: `**How you FEEL this:** Discipline leads to genuine mastery. Hard work is rewarded and recognized. You build things that command respect.`
    },
    Detriment: {
      Sun: `**How you FEEL this:** Your identity might feel unclear or like you have to prove yourself. Others might not "get" you at first. You've developed a unique sense of self through overcoming this—one that's truly yours, not borrowed from expectations.`,
      Moon: `**How you FEEL this:** Emotions might feel inconvenient or mismatched with your environment. Nurturing doesn't come automatically—you had to learn it consciously. This gives you emotional wisdom others lack.`,
      Mercury: `**How you FEEL this:** Your thinking might work differently than expected, and communication can require extra effort. But you've developed unique mental perspectives through this challenge.`,
      Venus: `**How you FEEL this:** Love and pleasure might not flow easily or look conventional. You've had to consciously develop your values and relationship skills. This makes your connections more intentional.`,
      Mars: `**How you FEEL this:** Your drive might feel blocked or misdirected at times. Assertiveness requires conscious effort. But you've learned strategic, thoughtful action rather than mere impulse.`,
      Jupiter: `**How you FEEL this:** Growth and opportunity require work. Optimism isn't automatic—you've had to cultivate it. This makes your faith harder-won but more genuine.`,
      Saturn: `**How you FEEL this:** Structure and authority might feel alien or oppressive. You've had to find your own path to discipline. This can create unique, unconventional achievements.`
    },
    Fall: {
      Sun: `**How you FEEL this:** Your identity might have been diminished or overlooked early on. You've had to actively BUILD who you are rather than just being it. This creates remarkable inner strength and self-knowledge.`,
      Moon: `**How you FEEL this:** Emotional needs might have been unmet or dismissed. You've learned to nurture yourself. This can make you an exceptional caretaker—because you KNOW what's missing.`,
      Mercury: `**How you FEEL this:** Your thinking might have been criticized or undervalued. Mental confidence was hard-won. But you've developed careful, thorough thought processes as a result.`,
      Venus: `**How you FEEL this:** Love or self-worth might have felt out of reach. You've had to consciously learn to value yourself and be valued. This creates deep, authentic relationships when you find them.`,
      Mars: `**How you FEEL this:** Your drive might have been crushed or redirected. Direct assertion felt risky. You've learned subtle, strategic ways to pursue goals that are remarkably effective.`,
      Jupiter: `**How you FEEL this:** Faith and optimism might have been tested severely. You know what it is to lose hope and rebuild it. This gives you a wisdom about growth that the naturally lucky never develop.`,
      Saturn: `**How you FEEL this:** Authority and structure might have been destructive or absent. You had to learn discipline without good models. This can create either remarkable self-teaching or a complete rejection of conventions.`
    },
    Peregrine: {
      Sun: `**How you FEEL this:** Your identity is flexible—not locked into one way of being. You adapt. This can feel like lacking a clear sense of self, or like having freedom others don't have.`,
      Moon: `**How you FEEL this:** Your emotional nature takes its color from aspects and house placement more than sign. You're emotionally adaptable, neither naturally supported nor challenged.`,
      Mercury: `**How you FEEL this:** Your mind is versatile, shaped more by experience and aspects than by any essential nature. You can think in many different styles.`,
      Venus: `**How you FEEL this:** Love and values are shaped by context. You're neither naturally gifted nor challenged in relationships—your experiences and choices matter more.`,
      Mars: `**How you FEEL this:** Your drive is neutral territory, shaped by what aspects it and where it lives. You have flexibility in how you assert and pursue.`,
      Jupiter: `**How you FEEL this:** Growth depends on circumstances and choices rather than innate luck. You make your own opportunities rather than having them given or withheld.`,
      Saturn: `**How you FEEL this:** Discipline and structure are tools you can use flexibly. Neither naturally aligned nor opposed, Saturn's lessons come through specific life circumstances.`
    }
  };

  const planetFeeling = dignityFeelings[dignityType]?.[planet];
  if (!planetFeeling) {
    return `Your ${planet} in ${sign} is in ${dignityType} condition—${dignityType === 'Ruler' ? 'at home and powerful' : dignityType === 'Exaltation' ? 'elevated and honored' : dignityType === 'Detriment' ? 'working through challenge' : dignityType === 'Fall' ? 'building strength through difficulty' : 'neutral and flexible'}.`;
  }

  const baseDescription = {
    Ruler: `Your ${planet} is in its own sign of ${sign}—a position of rulership! Like being at home, it expresses its nature purely.`,
    Exaltation: `Your ${planet} is exalted in ${sign}—a position of honor! It functions at a high, celebrated level here.`,
    Detriment: `Your ${planet} is in detriment in ${sign}—working against its natural grain. This creates challenge but also unique strength.`,
    Fall: `Your ${planet} is in fall in ${sign}—facing its greatest challenge. But fallen planets often develop the deepest mastery.`,
    Peregrine: `Your ${planet} in ${sign} has no essential dignity—it's "peregrine" or wandering. This gives flexibility in expression.`
  };

  return `${baseDescription[dignityType as keyof typeof baseDescription] || ''}

${planetFeeling}`;
};

const getDispositorInterpretation = (
  planet: string, 
  sign: string, 
  dispositor: string,
  allPlanets?: Record<string, NatalPlanetPosition>
): string => {
  if (planet === dispositor) {
    return `Your ${planet} is in its own sign, so it "disposes itself"—no other planet is its boss. 

**How you FEEL this:** There's an independence and self-sufficiency to how your ${planet} works. You don't need permission or support from elsewhere to express ${planet} themes. This can feel like confidence, autonomy, or sometimes isolation—you ARE your own authority here.`;
  }
  
  const dispositorFeelings: Record<string, string> = {
    Sun: `You experience your ${planet} through the lens of identity, visibility, and self-expression. Your ${planet} works best when it connects to who you ARE and when you're getting recognition.`,
    Moon: `You experience your ${planet} through emotional needs, nurturing, and intuition. Your ${planet} is colored by your moods, your need for security, and your instinctive responses.`,
    Mercury: `You experience your ${planet} through thinking, communicating, and learning. Your ${planet} wants to be UNDERSTOOD and expressed through words, ideas, and mental activity.`,
    Venus: `You experience your ${planet} through values, relationships, and pleasure. Your ${planet} works best when it's connected to what you love, what feels beautiful, and who you're relating to.`,
    Mars: `You experience your ${planet} through action, desire, and assertion. Your ${planet} is energized by drive, competition, and the courage to go after what you want.`,
    Jupiter: `You experience your ${planet} through growth, optimism, and meaning-making. Your ${planet} wants to expand, to mean something, to connect to a bigger picture.`,
    Saturn: `You experience your ${planet} through structure, discipline, and responsibility. Your ${planet} is shaped by what you're building, your ambitions, and the rules you follow.`
  };

  // Concrete development practices for each planet when challenged
  const developmentPractices: Record<string, string> = {
    Sun: `**How to strengthen Sun support:** Practice visible self-expression — share your work publicly, take leadership roles even in small ways, do one thing daily that makes you feel proud of who you are. Ask yourself: "Where am I hiding when I could be seen?"`,
    Moon: `**How to strengthen Moon support:** Build emotional awareness — journal your feelings daily, create reliable self-care rituals, notice what makes you feel safe vs. anxious. Practice saying "I need..." out loud to trusted people.`,
    Mercury: `**How to strengthen Mercury support:** Exercise your communication — write daily (even just 5 minutes), read widely, practice explaining complex ideas simply. Take a class, learn a new skill, or start conversations with curious questions instead of statements.`,
    Venus: `**How to strengthen Venus support:** Cultivate beauty and connection — spend time on aesthetics that please YOU, practice receiving compliments without deflecting, invest in relationships that feel reciprocal. Ask: "What do I actually find beautiful/valuable?"`,
    Mars: `**How to strengthen Mars support:** Build your action muscle — exercise regularly, practice saying no, take on competitive or physical challenges. When you want something, practice asking for it directly instead of hinting or waiting.`,
    Jupiter: `**How to strengthen Jupiter support:** Expand your perspective — travel (even locally), study philosophy or religion, seek mentors, practice optimism by listing 3 possibilities in any difficult situation. Ask: "What could this mean?"`,
    Saturn: `**How to strengthen Saturn support:** Build sustainable structure — create routines and stick to them, set realistic long-term goals, practice delayed gratification. Take responsibility for one area of life you've been avoiding.`
  };

  const feeling = dispositorFeelings[dispositor] || `${dispositor} colors and directs how your ${planet} expresses.`;

  // Analyze the actual dispositor's condition in the chart
  let dispositorAnalysis = "";
  
  if (allPlanets && dispositor) {
    const dispositorData = allPlanets[dispositor];
    if (dispositorData?.sign) {
      const dispositorDignity = getDignityStatus(dispositor, dispositorData.sign);
      const isStrong = dispositorDignity.type === 'Ruler' || dispositorDignity.type === 'Exaltation';
      const isWeak = dispositorDignity.type === 'Detriment' || dispositorDignity.type === 'Fall';
      const isRetrograde = dispositorData.isRetrograde;
      
      let strengthDesc = "";
      if (isStrong) {
        strengthDesc = `**Your ${dispositor} is STRONG** — it's in ${dispositorData.sign} (${dispositorDignity.type}). This means excellent support for your ${planet}! ${dispositor} is well-positioned and can fully "back up" your ${planet}'s expression. You likely experience ${planet} themes flowing naturally, with ${dispositor}'s energy readily available when needed.`;
      } else if (isWeak) {
        const practice = developmentPractices[dispositor] || "";
        strengthDesc = `**Your ${dispositor} is CHALLENGED** — it's in ${dispositorData.sign} (${dispositorDignity.type}). This means your ${planet} needs you to consciously develop ${dispositor}'s expression first.

${practice}

The good news: working on a challenged dispositor often builds unique strength and depth that others with "easy" placements never develop.`;
      } else {
        strengthDesc = `**Your ${dispositor} is NEUTRAL** — it's in ${dispositorData.sign} (no major dignity or debility). ${dispositor}'s support for your ${planet} is moderate and depends more on aspects and house placement.`;
      }
      
      if (isRetrograde) {
        strengthDesc += `\n\n*${dispositor} is retrograde (℞):* Its support works more internally — you may need to reflect, journal, or process privately before ${dispositor}'s backing becomes available externally.`;
      }
      
      dispositorAnalysis = `

${strengthDesc}`;
    }
  }

  return `Your ${planet} in ${sign} is "disposed" by ${dispositor} (${sign}'s ruler). Think of ${dispositor} as the landlord of the house where your ${planet} lives.

**How you FEEL this:** ${feeling}${dispositorAnalysis}`;
};

const getTriplicityInterpretation = (
  planet: string, 
  element: string, 
  rulers: { day: string; night: string; participating: string }, 
  isDayChart: boolean | null,
  allPlanets?: Record<string, NatalPlanetPosition>
): string => {
  // Detailed meanings for each planet as triplicity ruler
  const planetMeanings: Record<string, string> = {
    Sun: "brings visibility, vitality, and conscious awareness",
    Moon: "brings intuition, emotional attunement, and nurturing support",
    Mercury: "brings mental agility, communication skills, and adaptability",
    Venus: "brings harmony, attraction, pleasure, and relational ease",
    Mars: "brings drive, courage, initiative, and competitive edge",
    Jupiter: "brings expansion, optimism, opportunity, and faith",
    Saturn: "brings structure, discipline, endurance, and long-term planning"
  };

  // Development practices for challenged rulers
  const developmentPractices: Record<string, string> = {
    Sun: "Practice visible self-expression, take small leadership roles, share your work publicly.",
    Moon: "Build emotional awareness through journaling, create reliable self-care rituals, practice asking for what you need.",
    Mercury: "Write daily, read widely, take courses, practice explaining ideas clearly to others.",
    Venus: "Cultivate beauty in your environment, practice receiving gracefully, invest in reciprocal relationships.",
    Mars: "Exercise regularly, practice direct communication, take on physical or competitive challenges.",
    Jupiter: "Travel or explore new perspectives, study philosophy, seek mentors, practice optimistic reframing.",
    Saturn: "Create routines and stick to them, set long-term goals, take responsibility in one area you've been avoiding."
  };

  // Helper to analyze a ruler's condition
  const analyzeRuler = (rulerName: string, isPrimary: boolean = false): string => {
    if (!allPlanets || !rulerName) return "";
    const rulerData = allPlanets[rulerName];
    if (!rulerData?.sign) return "";
    
    const dignity = getDignityStatus(rulerName, rulerData.sign);
    const isStrong = dignity.type === 'Ruler' || dignity.type === 'Exaltation';
    const isWeak = dignity.type === 'Detriment' || dignity.type === 'Fall';
    const retrograde = rulerData.isRetrograde ? " (℞)" : "";
    
    if (isStrong) {
      return `**${rulerName} is STRONG** in ${rulerData.sign} (${dignity.type})${retrograde} — excellent support for your ${planet}!`;
    } else if (isWeak) {
      const practice = isPrimary ? `\n*To strengthen:* ${developmentPractices[rulerName] || "Work consciously with this energy."}` : "";
      return `**${rulerName} is CHALLENGED** in ${rulerData.sign} (${dignity.type})${retrograde} — needs conscious development.${practice}`;
    } else {
      return `**${rulerName} is NEUTRAL** in ${rulerData.sign}${retrograde} — moderate support.`;
    }
  };

  if (isDayChart === null) {
    return `Your ${planet} is in a ${element} sign with triplicity rulers: ${rulers.day} (day), ${rulers.night} (night), and ${rulers.participating} (participating). These planets support your ${planet}'s expression. Check if your chart is day or night to know which ruler is primary.`;
  }

  const primaryRuler = isDayChart ? rulers.day : rulers.night;
  const secondaryRuler = isDayChart ? rulers.night : rulers.day;
  const primaryMeaning = planetMeanings[primaryRuler] || "supports your planet";
  const secondaryMeaning = planetMeanings[secondaryRuler] || "offers secondary support";
  const partMeaning = planetMeanings[rulers.participating] || "provides backup";
  
  // Analyze all three rulers (primary gets development tips if challenged)
  const primaryAnalysis = analyzeRuler(primaryRuler, true);
  const secondaryAnalysis = analyzeRuler(secondaryRuler, false);
  const partAnalysis = analyzeRuler(rulers.participating, false);
  
  const chartType = isDayChart ? "DAY" : "NIGHT";
  const sunPosition = isDayChart ? "above" : "below";
  
  return `You have a ${chartType} CHART (Sun ${sunPosition} horizon), so **${primaryRuler}** is your primary ${element} triplicity ruler for your ${planet}.

**Primary Support — ${primaryRuler}:** ${primaryMeaning} to your ${planet}.
${primaryAnalysis}

**Secondary Support — ${secondaryRuler}:** ${secondaryMeaning}.
${secondaryAnalysis}

**Participating — ${rulers.participating}:** ${partMeaning} as backup.
${partAnalysis}`;
};

const getTermInterpretation = (
  planet: string, 
  termRuler: string, 
  degree: number, 
  sign: string,
  allPlanets?: Record<string, NatalPlanetPosition>
): string => {
  // Development practices for challenged term rulers
  const developmentPractices: Record<string, string> = {
    Sun: "Practice visible self-expression, take small leadership roles, share your work publicly.",
    Moon: "Build emotional awareness through journaling, create reliable self-care rituals.",
    Mercury: "Write daily, read widely, take courses, practice explaining ideas clearly.",
    Venus: "Cultivate beauty in your environment, practice receiving gracefully.",
    Mars: "Exercise regularly, practice direct communication, take on challenges.",
    Jupiter: "Explore new perspectives, study philosophy, seek mentors.",
    Saturn: "Create routines, set long-term goals, take responsibility in avoided areas."
  };

  let termRulerAnalysis = "";
  
  if (allPlanets && termRuler) {
    const rulerData = allPlanets[termRuler];
    if (rulerData?.sign) {
      const rulerDignity = getDignityStatus(termRuler, rulerData.sign);
      const isStrong = rulerDignity.type === 'Ruler' || rulerDignity.type === 'Exaltation';
      const isWeak = rulerDignity.type === 'Detriment' || rulerDignity.type === 'Fall';
      
      if (isStrong) {
        termRulerAnalysis = `

**Your ${termRuler}:** In ${rulerData.sign} (${rulerDignity.type}) — STRONG! This term ruler effectively supports your ${planet}. You likely experience ${planet} themes flowing smoothly with ${termRuler}'s energy naturally available.`;
      } else if (isWeak) {
        const practice = developmentPractices[termRuler] || "";
        termRulerAnalysis = `

**Your ${termRuler}:** In ${rulerData.sign} (${rulerDignity.type}) — CHALLENGED. Its support for your ${planet} needs conscious development.
*To strengthen:* ${practice}`;
      } else {
        termRulerAnalysis = `

**Your ${termRuler}:** In ${rulerData.sign} (neutral). Moderate support — depends more on aspects and house placement.`;
      }
    }
  }
  
  return `At ${degree}° ${sign}, your ${planet} falls in the terms (bounds) of ${termRuler}. Terms are ancient dignity divisions—think of ${termRuler} as a "minor landlord" for this specific degree, adding its subtle flavor to your ${planet}.${termRulerAnalysis}`;
};

const getDecanInterpretation = (
  planet: string, 
  decanRuler: string, 
  decanIndex: number, 
  sign: string,
  allPlanets?: Record<string, NatalPlanetPosition>
): string => {
  const decanName = decanIndex === 0 ? "first" : decanIndex === 1 ? "second" : "third";
  const degreeRange = `${decanIndex * 10}°-${(decanIndex + 1) * 10}°`;
  
  // How each planet as decan ruler FEELS
  const decanFeelings: Record<string, string> = {
    Sun: "a drive for recognition, leadership, and shining brightly in ${planet} matters",
    Moon: "emotional sensitivity, intuitive responses, and nurturing instincts in ${planet} areas",
    Mercury: "mental curiosity, communication needs, and adaptability in how ${planet} expresses",
    Venus: "a desire for harmony, beauty, and pleasure connected to ${planet} themes",
    Mars: "assertiveness, competitive drive, and action-orientation in ${planet} expression",
    Jupiter: "optimism, expansion, and a generous, philosophical approach to ${planet} matters",
    Saturn: "seriousness, discipline, and a need for structure in ${planet} expression"
  };

  let rulerAnalysis = "";
  const feeling = decanFeelings[decanRuler]?.replace('${planet}', planet) || `${decanRuler} qualities`;
  
  if (allPlanets && decanRuler) {
    const rulerData = allPlanets[decanRuler];
    if (rulerData?.sign) {
      const rulerDignity = getDignityStatus(decanRuler, rulerData.sign);
      const isStrong = rulerDignity.type === 'Ruler' || rulerDignity.type === 'Exaltation';
      
      if (isStrong) {
        rulerAnalysis = `

**YOUR ${decanRuler} is in ${rulerData.sign} (${rulerDignity.type})** — strong! This amplifies the ${decanRuler} flavor in your ${planet}. You likely FEEL this as: ${feeling}. This comes naturally to you.`;
      } else if (rulerDignity.type === 'Detriment' || rulerDignity.type === 'Fall') {
        rulerAnalysis = `

**YOUR ${decanRuler} is in ${rulerData.sign} (${rulerDignity.type})** — challenged. The ${decanRuler} sub-tone in your ${planet} may feel like something you have to work at. You might experience: ${feeling}, but it requires conscious effort to express smoothly.`;
      } else {
        rulerAnalysis = `

**YOUR ${decanRuler} is in ${rulerData.sign}** (neutral). The ${decanRuler} flavor adds ${feeling}. This influence is moderate—neither amplified nor diminished.`;
      }
    }
  }
  
  return `Your ${planet} at ${degreeRange} ${sign} is in the ${decanName} decan, ruled by ${decanRuler}. 

**How you FEEL this:** The decan ruler adds a secondary "flavor" to your ${planet}. With ${decanRuler} ruling this decan, you experience ${feeling}.${rulerAnalysis}`;
};

const getHouseRulershipInterpretation = (planet: string, housesRuled: string): string => {
  if (housesRuled === 'None' || housesRuled === 'Unknown') {
    return `Your ${planet} doesn't rule any house cusps in your chart (based on traditional rulership). Its influence flows through aspects and its house placement rather than through house lordship.`;
  }
  return `Your ${planet} rules the ${housesRuled} house${housesRuled.includes(',') ? 's' : ''} in your chart. This means ${planet} themes directly connect to those life areas. When ${planet} is activated by transit or progression, those house matters come into focus. ${planet} is a "lord" of those domains.`;
};

const getSectInterpretation = (planet: string, sectStatus: string, isDayChart: boolean | null): string => {
  // Experiential descriptions of out-of-sect planets
  const outOfSectFeelings: Record<string, string> = {
    Sun: `**How you might FEEL this:** Your core identity and vitality may feel like they have to fight for expression. In a night chart, the Sun's need for visibility and recognition doesn't get automatic support from the environment. You might experience:
• Feeling like you have to work harder to be seen or acknowledged
• Your confidence coming in waves rather than being steady
• A sense that your true self is sometimes misunderstood
• Developing resilience and self-validation skills others don't have to develop

**The gift:** People with out-of-sect Suns often develop profound inner strength and don't rely on external validation. You know who you are regardless of recognition.`,
    
    Moon: `**How you might FEEL this:** Your emotional needs and instincts may feel at odds with your environment. In a day chart, the Moon's need for nurturing and security doesn't flow as naturally. You might experience:
• Emotions feeling inconvenient or poorly timed
• Having to consciously create emotional safety
• Nurturing instincts that don't always get validated
• Learning to trust your feelings despite external dismissal

**The gift:** You develop emotional self-sufficiency and can nurture yourself and others deliberately.`,
    
    Jupiter: `**How you might FEEL this:** Your optimism and growth opportunities may require more effort. In a night chart, Jupiter's gifts don't arrive as easily. You might experience:
• Having to work for luck rather than it finding you
• Faith and optimism requiring conscious cultivation
• Growth coming through effort rather than grace
• Needing to create your own opportunities

**The gift:** You develop earned wisdom and appreciation for what you achieve.`,
    
    Saturn: `**How you might FEEL this:** Your discipline and structure may feel heavy or restrictive. In a night chart, Saturn's challenges are more prominent. You might experience:
• Responsibilities feeling burdensome rather than purposeful
• Authority figures being more critical or demanding
• Delays and obstacles feeling more frustrating
• Having to prove yourself repeatedly

**The gift:** You develop exceptional resilience and unshakeable competence through overcoming real obstacles.`,
    
    Venus: `**How you might FEEL this:** Your relationship needs and values may feel unsupported. In a day chart, Venus's gifts require more cultivation. You might experience:
• Harmony not coming naturally in relationships
• Having to work at pleasure and enjoyment
• Aesthetic sensibilities that others don't immediately appreciate
• Learning to value yourself independently

**The gift:** You develop authentic self-worth and conscious relationship skills.`,
    
    Mars: `**How you might FEEL this:** Your assertiveness and drive may feel misplaced or excessive. In a day chart, Mars's fire doesn't harmonize as well. You might experience:
• Anger or frustration being harder to channel productively
• Initiative sometimes coming across as aggressive
• Having to learn when to push and when to pause
• Competitive instincts needing conscious management

**The gift:** You develop controlled power and strategic action rather than reactive impulse.`
  };

  const inSectFeelings: Record<string, string> = {
    Sun: `**How you FEEL this:** Your identity shines naturally in a day chart. Visibility, confidence, and vitality flow more easily. Others recognize and validate who you are without you having to fight for it.`,
    Moon: `**How you FEEL this:** Your emotions and nurturing instincts are supported in a night chart. Intuition flows, emotional needs get met more easily, and caring for others feels natural.`,
    Jupiter: `**How you FEEL this:** Luck and expansion come more gracefully in a day chart. Opportunities appear, optimism is rewarded, and growth happens through trust and openness.`,
    Saturn: `**How you FEEL this:** Discipline and responsibility feel purposeful in a day chart. Hard work pays off, structures support you, and authority figures are helpful rather than obstructive.`,
    Venus: `**How you FEEL this:** Love, beauty, and pleasure flow easily in a night chart. Relationships harmonize naturally, and your values attract appreciation.`,
    Mars: `**How you FEEL this:** Action and assertion work smoothly in a night chart. Your drive gets results, anger is productive, and initiative is well-received.`
  };
  
  if (sectStatus.includes('In Sect')) {
    const feeling = inSectFeelings[planet] || `Your ${planet} functions smoothly—its positive qualities are supported by your chart type.`;
    return `Your ${planet} is "in sect," meaning it matches your chart type (${isDayChart ? 'day' : 'night'} chart). In-sect planets work WITH the flow of the chart.

${feeling}`;
  } else if (sectStatus.includes('Out of Sect')) {
    const feeling = outOfSectFeelings[planet] || `Your ${planet} works harder to express its gifts and may face more challenges. However, this builds character and unique strengths.`;
    return `Your ${planet} is "out of sect," meaning it doesn't match your chart type (${isDayChart ? 'day' : 'night'} chart). Out-of-sect planets swim against the current—but this builds strength.

${feeling}`;
  }
  return `${planet} (Mercury and outer planets) is neutral regarding sect—it works with both day and night charts. It adapts to whatever environment it's in, taking on the qualities of planets it aspects.`;
};

const getDeclinationInterpretation = (planet: string, declination: string): string => {
  const isNorth = declination.includes('N');
  const direction = isNorth ? "north" : "south";
  
  // Extract numeric value
  const degreeMatch = declination.match(/(\d+)/);
  const degreeValue = degreeMatch ? parseInt(degreeMatch[1]) : 0;
  const isOutOfBounds = degreeValue > 23;
  
  let oobFeeling = "";
  if (isOutOfBounds) {
    const oobFeelings: Record<string, string> = {
      Sun: `Your identity operates outside normal bounds—you might feel like you don't fit conventional molds, and your self-expression is amplified, unique, or extreme in some way.`,
      Moon: `Your emotions go to extremes that others don't experience. You might feel things more intensely than those around you, for better and worse.`,
      Mercury: `Your thinking goes places others' minds don't reach. Genius-level insights are possible, but you might also struggle to communicate in "normal" ways.`,
      Venus: `Your desires and values are unconventional or extreme. What you love, you LOVE. What you find beautiful might confuse others.`,
      Mars: `Your drive and assertiveness operate beyond normal limits. You might have extraordinary energy or struggle to keep it within acceptable bounds.`,
      Jupiter: `Your optimism and growth instincts go to extremes. Huge faith, huge risks, huge possibilities—but also potential for overreach.`,
      Saturn: `Your relationship with structure and authority is extreme—either hypercontrolled or completely rejecting of limits.`
    };
    oobFeeling = `

**OUT OF BOUNDS! How you FEEL this:** ${oobFeelings[planet] || 'This planet operates outside normal limits, expressing in amplified or unusual ways.'}`;
  }
  
  return `Your ${planet} has a declination of ${declination}, meaning it sits ${direction} of the celestial equator. ${isOutOfBounds ? '⚠️ This is OUT OF BOUNDS (beyond 23°)!' : ''}${oobFeeling}`;
};

const getSaturnSymbolInterpretation = (sign: string, symbol: { symbol: string; meaning: string }): string => {
  return `Saturn in ${sign} carries special symbolism: ${symbol.symbol}. ${symbol.meaning}. This represents your particular Saturn lesson—the area where you're called to develop mastery, accept responsibility, and eventually become an authority through dedicated effort over time.`;
};

// ============================================================================
// HELPER
// ============================================================================

const getOrdinal = (n: number): string => {
  if (n === 1 || n === 21 || n === 31) return 'st';
  if (n === 2 || n === 22) return 'nd';
  if (n === 3 || n === 23) return 'rd';
  return 'th';
};

// ============================================================================
// COMPONENTS
// ============================================================================

interface DetailRowProps {
  label: string;
  value: string;
  description?: string;
  interpretation?: string;
}

const DetailRow = ({ label, value, description, interpretation }: DetailRowProps) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="py-3 border-b border-border/50">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-foreground mb-0.5">
            {label}
          </div>
          <div className="text-sm text-foreground/80">
            {value}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground mt-0.5 italic">
              {description}
            </div>
          )}
        </div>
        {interpretation && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="text-xs text-primary hover:underline flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <Info size={10} />
            {showMore ? 'Hide' : 'What does this mean?'}
          </button>
        )}
      </div>
      {showMore && interpretation && (
        <div className="mt-2 p-3 bg-primary/5 rounded text-xs text-foreground/80 leading-relaxed border-l-2 border-primary/30">
          {interpretation}
        </div>
      )}
    </div>
  );
};

interface EnhancedPlanetDetailsProps {
  planetName: string;
  planetData: NatalPlanetPosition;
  house: number | null;
  sunHouse?: number | null;
  houseCusps?: Record<string, { sign: string; degree: number; minutes?: number }>;
  allPlanets?: Record<string, NatalPlanetPosition>;
}

export const EnhancedPlanetDetails = ({
  planetName,
  planetData,
  house,
  sunHouse,
  houseCusps,
  allPlanets
}: EnhancedPlanetDetailsProps) => {
  const [expanded, setExpanded] = useState(false);

  const sign = planetData.sign;
  const degree = planetData.degree;
  const isRetrograde = planetData.isRetrograde;

  // Get sign properties
  const signProps = SIGN_PROPERTIES[sign];
  if (!signProps) return null;

  // Get house type
  const houseType = house ? HOUSE_TYPES[house] : null;

  // Get dignities
  const dignities = PLANET_DIGNITIES[planetName];
  const dignityStatus = getDignityStatus(planetName, sign);

  // Get dispositor (ruler of the sign)
  const dispositor = signProps.ruler;

  // Get triplicity rulers
  const triplicityRulers = TRIPLICITY_RULERS[signProps.element];

  // Get decan ruler
  const decanIndex = Math.min(2, Math.floor(degree / 10));
  const decanRuler = getDecanRuler(sign, degree);

  // Get term ruler
  const termRuler = getTermRuler(sign, degree);

  // Calculate speed with retrograde consideration
  const baseSpeed = AVERAGE_SPEEDS[planetName] || 'Unknown';
  const speed = isRetrograde ? `-${baseSpeed}` : `+${baseSpeed}`;

  // Determine if day chart (Sun above horizon = houses 7-12)
  const isDayChart = sunHouse ? sunHouse >= 7 : null;

  // Get sect status
  const sectInfo = getSectStatus(planetName, sunHouse || null, isDayChart);

  // Get houses ruled
  const housesRuled = getHousesRuled(planetName, houseCusps);

  // Get declination
  const declination = calculateDeclination(sign, degree);

  // Saturn symbol (only for Saturn)
  const saturnSymbol = planetName === 'Saturn' ? SATURN_SYMBOLS[sign] : null;

  return (
    <div className="mt-3">
      {/* Expand/Collapse Button */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-secondary/50 hover:bg-secondary rounded text-xs font-medium text-foreground/80 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          🔍 View Details
        </span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* Expanded Technical Details */}
      {expanded && (
        <div className="mt-3 p-4 bg-secondary/30 rounded-md space-y-0">
          {/* Position & Movement Section */}
          <div className="pb-2 mb-2 border-b-2 border-primary/20">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
              Position & Movement
            </h4>
          </div>

          <DetailRow
            label="Position"
            value={`${degree}° ${sign}`}
            interpretation={getPositionInterpretation(planetName, degree, sign)}
          />

          <DetailRow
            label="Element"
            value={`${getElementSymbol(signProps.element)} ${signProps.element}`}
            interpretation={getElementInterpretation(planetName, signProps.element, sign)}
          />

          <DetailRow
            label="Mode"
            value={signProps.mode}
            interpretation={getModeInterpretation(planetName, signProps.mode, sign)}
          />

          {houseType && house && (
            <DetailRow
              label="Angularity"
              value={houseType}
              description={`${house}${getOrdinal(house)} house is ${houseType.toLowerCase()}`}
              interpretation={getAngularityInterpretation(planetName, houseType, house)}
            />
          )}

          <DetailRow
            label="Motion"
            value={isRetrograde ? `Retrograde ℞` : 'Direct'}
            description={isRetrograde ? "Planet appears to move backward from Earth's perspective" : 'Planet moving forward in normal direction'}
            interpretation={getMotionInterpretation(planetName, isRetrograde || false)}
          />

          <DetailRow
            label="Speed"
            value={speed}
            interpretation={getSpeedInterpretation(planetName, isRetrograde || false)}
          />

          {/* Dignity Status Section */}
          {dignities && (
            <>
              <div className="pt-4 pb-2 mb-2 border-b-2 border-primary/20">
                <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
                  Dignity Status
                </h4>
              </div>

              <DignityBox 
                planetName={planetName}
                sign={sign}
                dignityStatus={dignityStatus} 
                dignities={dignities} 
              />
            </>
          )}

          {/* Rulership Chain Section */}
          <div className="pt-4 pb-2 mb-2 border-b-2 border-primary/20">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
              Rulership Chain
            </h4>
          </div>

          <DetailRow
            label="Dispositor"
            value={dispositor}
            description={`${sign} is ruled by ${dispositor}`}
            interpretation={getDispositorInterpretation(planetName, sign, dispositor, allPlanets)}
          />

          {triplicityRulers && (
            <DetailRow
              label="Triplicity Rulers"
              value={`${triplicityRulers.day}, ${triplicityRulers.night}, ${triplicityRulers.participating}`}
              description={`Day: ${triplicityRulers.day} | Night: ${triplicityRulers.night} | Participating: ${triplicityRulers.participating}`}
              interpretation={getTriplicityInterpretation(planetName, signProps.element, triplicityRulers, isDayChart, allPlanets)}
            />
          )}

          <DetailRow
            label="Term Ruler"
            value={termRuler}
            description={`Egyptian/Ptolemaic terms for ${degree}° ${sign}`}
            interpretation={getTermInterpretation(planetName, termRuler, degree, sign, allPlanets)}
          />

          <DetailRow
            label="Decan Ruler"
            value={decanRuler}
            description={`${degree}° is in the ${getDecanName(decanIndex)} decan (${decanIndex * 10}°-${(decanIndex + 1) * 10}°)`}
            interpretation={getDecanInterpretation(planetName, decanRuler, decanIndex, sign, allPlanets)}
          />

          <DetailRow
            label="Houses Ruled"
            value={housesRuled}
            description="Houses where this planet is the traditional ruler"
            interpretation={getHouseRulershipInterpretation(planetName, housesRuled)}
          />

          {/* Condition Section */}
          <div className="pt-4 pb-2 mb-2 border-b-2 border-primary/20">
            <h4 className="text-[10px] uppercase tracking-widest text-primary font-semibold mb-2">
              Condition
            </h4>
          </div>

          <DetailRow
            label="Sect Status"
            value={sectInfo.status}
            description={sectInfo.description}
            interpretation={getSectInterpretation(planetName, sectInfo.status, isDayChart)}
          />

          <DetailRow
            label="Declination"
            value={declination}
            interpretation={getDeclinationInterpretation(planetName, declination)}
          />

          {/* Saturn Symbol (only for Saturn) */}
          {saturnSymbol && (
            <DetailRow
              label="Saturn Symbol"
              value={saturnSymbol.symbol}
              description={saturnSymbol.meaning}
              interpretation={getSaturnSymbolInterpretation(sign, saturnSymbol)}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Separate component for the dignity box with its own interpretation
const DignityBox = ({ 
  planetName,
  sign,
  dignityStatus, 
  dignities 
}: { 
  planetName: string;
  sign: string;
  dignityStatus: { type: string; color: string; bgColor: string };
  dignities: { rulership: string | string[]; exaltation: string; detriment: string | string[]; fall: string };
}) => {
  const [showMore, setShowMore] = useState(false);
  const interpretation = getDignityInterpretation(planetName, sign, dignityStatus.type);

  return (
    <div 
      className="p-3 rounded mb-3"
      style={{ 
        backgroundColor: dignityStatus.bgColor,
        borderLeft: `4px solid ${dignityStatus.color}`
      }}
    >
      <div className="text-sm font-bold mb-2" style={{ color: dignityStatus.color }}>
        {dignityStatus.type === 'Ruler' && '🏛️ '}
        {dignityStatus.type === 'Exaltation' && '⬆️ '}
        {dignityStatus.type === 'Detriment' && '⬇️ '}
        {dignityStatus.type === 'Fall' && '❌ '}
        {dignityStatus.type === 'Peregrine' && '⚪ '}
        Rulership Status: {dignityStatus.type}
      </div>
      <div className="text-xs space-y-1.5 text-foreground/80">
        <div>
          <span className="font-medium">🏛️ Ruler:</span>{' '}
          {Array.isArray(dignities.rulership) ? dignities.rulership.join(', ') : dignities.rulership}
          <span className="text-muted-foreground ml-1">(home sign)</span>
        </div>
        <div>
          <span className="font-medium">⬆️ Exaltation:</span> {dignities.exaltation}
          <span className="text-muted-foreground ml-1">(peak power degree)</span>
        </div>
        <div>
          <span className="font-medium">⬇️ Detriment:</span>{' '}
          {Array.isArray(dignities.detriment) ? dignities.detriment.join(', ') : dignities.detriment}
          <span className="text-muted-foreground ml-1">(opposite home)</span>
        </div>
        <div>
          <span className="font-medium">❌ Fall:</span> {dignities.fall}
          <span className="text-muted-foreground ml-1">(lowest power degree)</span>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground italic border-t border-border/30 pt-2">
        💡 The degrees shown (like 19°) are the <strong>exact exaltation/fall points</strong> from ancient astrology—where the planet reaches peak strength or greatest challenge. The closer your planet is to that exact degree, the more intensely you experience the dignity.
      </div>
      <button
        onClick={() => setShowMore(!showMore)}
        className="text-xs text-primary hover:underline mt-2 inline-flex items-center gap-1"
      >
        <Info size={10} />
        {showMore ? 'Hide' : 'What does this mean for me?'}
      </button>
      {showMore && (
        <div className="mt-2 p-3 bg-background/50 rounded text-xs text-foreground/80 leading-relaxed border-l-2 border-primary/30">
          {interpretation}
        </div>
      )}
    </div>
  );
};
