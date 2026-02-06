/**
 * Deep Aspect Interpretations
 * 
 * This module provides TEACHING-QUALITY aspect interpretations that explain:
 * 1. What this aspect FEELS like in daily life
 * 2. HOW the friction/harmony actually manifests in behavior
 * 3. Real-life examples and patterns
 * 
 * Unlike generic "friction drives growth" phrases, these explain the MECHANISM.
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
 */
export const DEEP_ASPECT_INTERPRETATIONS: Record<string, AspectInterpretationSet> = {
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

  'Saturn-Sun': {
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
