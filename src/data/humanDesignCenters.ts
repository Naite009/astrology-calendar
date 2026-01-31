// Complete Human Design Centers Encyclopedia
// All 9 Centers with comprehensive defined/undefined interpretations

export interface HDCenterData {
  name: string;
  biologicalCorrelation: string;
  theme: string;
  frequency: string; // % of population with definition
  definedDescription: string;
  undefinedDescription: string;
  gates: number[];
  defined: {
    header: string;
    consistentEnergy: string;
    gifts: string[];
    howToUse: string;
    shadow: string;
  };
  undefined: {
    header: string;
    wisdomPotential: string;
    conditioningPatterns: string[];
    questionsYouAsk: string[];
    howToAvoidConditioning: string;
    amplificationAwareness: string;
  };
}

export const CENTERS_DATA: Record<string, HDCenterData> = {
  Head: {
    name: "Head Center",
    biologicalCorrelation: "Pineal gland",
    theme: "Inspiration & Mental Pressure",
    frequency: "30% defined",
    gates: [64, 61, 63],
    definedDescription: "The Head Center is the center of inspiration and mental pressure. When defined, you have consistent access to inspiration and questions that drive inquiry.",
    undefinedDescription: "An undefined Head Center takes in and amplifies mental pressure from others. You can be deeply inspired by others' questions and ideas.",
    defined: {
      header: "Your Head Center is Defined",
      consistentEnergy: "You have a reliable connection to inspiration and mental pressure. Your mind consistently generates questions and ideas that inspire you to think and explore. This pressure is yours - it doesn't fluctuate based on who you're around.",
      gifts: [
        "Consistent source of inspiration",
        "Reliable mental pressure that drives inquiry",
        "Not overwhelmed by others' mental energy",
        "Clear sense of what questions matter to you"
      ],
      howToUse: "Trust your own inspiration. When you feel mental pressure to explore or understand something, follow that thread. Your questions are meant to inspire others, not necessarily be answered by you personally. Share your inspirations without attachment to whether others take them up.",
      shadow: "When overused, defined Head energy can become obsessive thinking or putting too much pressure on yourself to 'figure everything out.' You might feel like you should have all the answers to your own questions."
    },
    undefined: {
      header: "Your Head Center is Open",
      wisdomPotential: "You have the potential to become wise about inspiration itself - understanding which questions truly matter and which are just mental noise. You can sample many different types of inspiration and discern what's valuable.",
      conditioningPatterns: [
        "Trying to answer everyone else's questions",
        "Feeling pressure to be interested in what others find interesting",
        "Getting lost in mental loops that aren't yours",
        "Thinking you need to figure out things that don't matter to you"
      ],
      questionsYouAsk: [
        "What should I be thinking about?",
        "Is this question worth pursuing?",
        "Am I inspired enough?",
        "What if I'm missing something important?"
      ],
      howToAvoidConditioning: "Notice when you feel unusual mental pressure - it's likely coming from someone else. You don't need to pursue every interesting question. Wait and see which inspirations remain after you've had time alone. Your own inspirations will feel gentle and persistent, not urgent.",
      amplificationAwareness: "You take in and amplify others' mental pressure. In groups, you might feel overwhelmed by swirling ideas. Give yourself space to let go of mental energy that isn't yours."
    }
  },
  
  Ajna: {
    name: "Ajna Center",
    biologicalCorrelation: "Anterior and posterior pituitary glands",
    theme: "Conceptualization & Mental Processing",
    frequency: "47% defined",
    gates: [47, 24, 4, 17, 43, 11],
    definedDescription: "The Ajna Center is where we process information and form concepts. When defined, you have a consistent way of thinking and organizing information.",
    undefinedDescription: "An undefined Ajna is flexible in how it processes information. You can see things from many perspectives and think in many different ways.",
    defined: {
      header: "Your Ajna Center is Defined",
      consistentEnergy: "Your mind works in a fixed, reliable way. Whether you think logically, abstractly, or individually, you have a consistent mental framework. You don't need to adapt how you think to match others.",
      gifts: [
        "Mental certainty in how you process",
        "Reliable thought patterns",
        "Consistent opinions and concepts",
        "Not swayed by others' ways of thinking"
      ],
      howToUse: "Trust your way of thinking. Your mental process is correct for you, even if others think differently. Share your perspective without needing everyone to agree. Use your reliable thinking as a foundation, not a cage.",
      shadow: "Fixed thinking can become rigid thinking. You might dismiss perspectives that don't fit your mental framework or feel frustrated when others don't 'get' your logic. Mental certainty isn't the same as being right."
    },
    undefined: {
      header: "Your Ajna Center is Open",
      wisdomPotential: "You can become wise about thinking itself - understanding that there are many valid ways to process information. You can see patterns in how others think and adapt your perspective to understand different viewpoints.",
      conditioningPatterns: [
        "Pretending to be certain when you're not",
        "Trying to think the 'right' way",
        "Holding onto opinions that aren't yours",
        "Feeling mentally inferior or superior to others"
      ],
      questionsYouAsk: [
        "Am I sure about this?",
        "What's the right way to think about this?",
        "Do my opinions make sense?",
        "Am I smart enough?"
      ],
      howToAvoidConditioning: "Celebrate your mental flexibility. You're not meant to have fixed opinions - you're meant to explore many perspectives. Don't pressure yourself to 'know' things. Being uncertain is your gift, not your weakness.",
      amplificationAwareness: "You amplify others' mental energy and certainty. In debates, you might feel very convinced of a position that isn't naturally yours. Notice when you leave conversations feeling mentally exhausted."
    }
  },
  
  Throat: {
    name: "Throat Center",
    biologicalCorrelation: "Thyroid and parathyroid glands",
    theme: "Expression & Manifestation",
    frequency: "72% defined",
    gates: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
    definedDescription: "The Throat Center is where energy becomes expression and action. When defined, you have consistent access to your voice and ability to manifest.",
    undefinedDescription: "An undefined Throat is flexible in expression. You can speak in many different ways and are not attached to a fixed voice.",
    defined: {
      header: "Your Throat Center is Defined",
      consistentEnergy: "You have reliable access to expression and manifestation. Whether through speaking, singing, or doing, you have a consistent way of bringing things into reality. Your voice is dependable.",
      gifts: [
        "Consistent voice and expression",
        "Reliable ability to manifest",
        "Clear communication style",
        "Natural initiating or expressing energy"
      ],
      howToUse: "Trust your voice. Speak when you feel moved to, following your Strategy and Authority. Your consistent expression is a gift - use it to bring things into being. Notice which gates connect to your Throat and express through those themes.",
      shadow: "Talking too much, especially when not invited or asked. Using your voice to dominate conversations rather than contribute. Manifesting things that aren't correct for you because you can."
    },
    undefined: {
      header: "Your Throat Center is Open",
      wisdomPotential: "You can become wise about communication itself - understanding what truly needs to be said and when. You can speak in many voices and adapt your expression to the situation.",
      conditioningPatterns: [
        "Talking to get attention",
        "Speaking before it's time",
        "Trying to be heard at all costs",
        "Feeling invisible or voiceless"
      ],
      questionsYouAsk: [
        "Will anyone hear me?",
        "Am I saying the right thing?",
        "Should I speak up?",
        "Why don't people listen to me?"
      ],
      howToAvoidConditioning: "Wait to be asked or invited to speak. Your silence is valuable - when you do speak, people will listen. Don't force expression; let it come naturally. Quality over quantity in communication.",
      amplificationAwareness: "You amplify others' need to express. Around big talkers, you might feel pressure to match their energy. Notice when you're speaking just to fill silence or match someone's verbal intensity."
    }
  },
  
  G: {
    name: "G Center (Self/Identity)",
    biologicalCorrelation: "Liver, blood",
    theme: "Identity, Direction & Love",
    frequency: "57% defined",
    gates: [1, 13, 25, 46, 2, 15, 10, 7],
    definedDescription: "The G Center is where identity and direction live. When defined, you have a fixed sense of self and reliable inner GPS for direction.",
    undefinedDescription: "An undefined G Center is fluid in identity. You experience yourself differently in different environments and can adapt your sense of self.",
    defined: {
      header: "Your G Center is Defined",
      consistentEnergy: "You have a reliable sense of who you are and where you're going. Your identity doesn't shift based on who you're with. You have an inner compass that guides your direction in life and love.",
      gifts: [
        "Stable sense of identity",
        "Clear inner direction",
        "Consistent love and self-love",
        "Not lost in others' identities"
      ],
      howToUse: "Trust your sense of self and direction. You don't need to explain or justify who you are. Follow your inner GPS even when it doesn't make logical sense. Your consistent identity can help ground others who are searching for themselves.",
      shadow: "Rigidity in identity - thinking you can only be one way. Resistance to growth or change. Imposing your sense of direction on others who need to find their own way."
    },
    undefined: {
      header: "Your G Center is Open",
      wisdomPotential: "You can become wise about identity itself - understanding that who we are is fluid and beautiful in its adaptability. You can see and love many different aspects of people, including yourself.",
      conditioningPatterns: [
        "Constantly searching for 'who you really are'",
        "Feeling lost or directionless",
        "Taking on others' identities",
        "Staying in wrong environments hoping to find yourself"
      ],
      questionsYouAsk: [
        "Who am I?",
        "Where am I going?",
        "Am I lovable?",
        "Where do I belong?"
      ],
      howToAvoidConditioning: "Stop searching for a fixed identity - you're meant to be fluid. Place matters enormously for you; the right environment will help you feel like yourself. You don't need to know who you are all the time.",
      amplificationAwareness: "You deeply feel others' identity struggles and direction. In relationships, you might take on your partner's sense of self. Make sure you have regular time alone to reconnect with your own fluid nature."
    }
  },
  
  Heart: {
    name: "Heart/Ego Center",
    biologicalCorrelation: "Heart, stomach, gall bladder, thymus",
    theme: "Willpower, Value & Worth",
    frequency: "37% defined",
    gates: [51, 21, 40, 26],
    definedDescription: "The Heart/Ego Center is about willpower, material resources, and self-worth. When defined, you have consistent access to willpower and a reliable sense of your value.",
    undefinedDescription: "An undefined Heart Center doesn't have consistent willpower. You can be wise about what's worth fighting for and what's truly valuable.",
    defined: {
      header: "Your Heart Center is Defined",
      consistentEnergy: "You have reliable willpower and a consistent sense of your own worth. You can make and keep promises. Material success and proving yourself comes more naturally to you. Your ego is healthy and stable.",
      gifts: [
        "Consistent willpower",
        "Reliable promise-keeping ability",
        "Healthy self-worth",
        "Competitive strength when needed"
      ],
      howToUse: "Use your willpower wisely - it's a finite resource even when defined. Keep only promises that are correct for you. Trust your sense of worth without needing constant external validation. Rest your heart - literally and figuratively.",
      shadow: "Making promises you shouldn't keep. Pushing through with willpower when you should stop. Dominating others with your ego. Overworking to prove your worth."
    },
    undefined: {
      header: "Your Heart Center is Open",
      wisdomPotential: "You can become wise about willpower and value itself - understanding what's truly worth your energy and what's just ego. You can see the ego games others play with great clarity.",
      conditioningPatterns: [
        "Making promises you can't keep to prove yourself",
        "Feeling worthless or not enough",
        "Over-committing and burning out",
        "Constantly trying to prove your value"
      ],
      questionsYouAsk: [
        "Am I worthy?",
        "Do I have what it takes?",
        "Am I proving myself enough?",
        "What's my value?"
      ],
      howToAvoidConditioning: "Stop trying to prove yourself. You have nothing to prove. Don't make promises based on willpower - you don't have consistent access to it. Your worth is inherent, not earned. Rest more than you think you need to.",
      amplificationAwareness: "You amplify the ego and willpower of those around you. In competitive environments, you might feel driven to compete beyond what's healthy. Notice when you feel pressure to prove yourself in ways that exhaust you."
    }
  },
  
  Sacral: {
    name: "Sacral Center",
    biologicalCorrelation: "Ovaries, testes",
    theme: "Life Force, Work & Sexuality",
    frequency: "66% defined",
    gates: [5, 14, 29, 59, 9, 3, 42, 27, 34],
    definedDescription: "The Sacral Center is the motor of life force energy. When defined (Generators and Manifesting Generators), you have sustainable energy for work, sex, and life itself.",
    undefinedDescription: "An undefined Sacral doesn't have consistent life force energy. You're not designed to work in the same way as Sacral beings and need more rest.",
    defined: {
      header: "Your Sacral Center is Defined",
      consistentEnergy: "You have a powerful motor of life force energy that regenerates through correct work. When you're doing what you love, your energy is sustainable and consistent. Your gut response (uh-huh/uhn-uhn) is your guide.",
      gifts: [
        "Sustainable work energy",
        "Powerful life force",
        "Clear gut responses",
        "Capacity for mastery through repetition"
      ],
      howToUse: "Follow your Sacral response. Only commit to things that give you an 'uh-huh' response. Work at what you love and your energy will be endless. Go to bed exhausted so you can regenerate fully. Your satisfaction comes from correct work.",
      shadow: "Overriding your Sacral response and saying yes to everything. Working at things that drain rather than energize you. Ignoring the need for physical rest and proper sleep. Frustration from not responding correctly."
    },
    undefined: {
      header: "Your Sacral Center is Open",
      wisdomPotential: "You can become wise about life force and work - understanding when enough is enough and what sustainable work really looks like. You can sense when others are working correctly or burning out.",
      conditioningPatterns: [
        "Not knowing when enough is enough",
        "Working like a Generator when you're not",
        "Burning out from over-work",
        "Feeling guilty for needing more rest"
      ],
      questionsYouAsk: [
        "Do I know when enough is enough?",
        "Am I working too much or too little?",
        "Is this sustainable?",
        "Am I lazy?"
      ],
      howToAvoidConditioning: "You need more rest than Sacral beings - honor that. Work in focused bursts, not marathon sessions. Don't measure your productivity against Generators. Your efficiency comes from wisdom, not endurance.",
      amplificationAwareness: "You take in and amplify others' Sacral energy. Around Generators, you might feel superhuman energy that isn't sustainable. Make sure to discharge Sacral energy before sleeping - gentle activity, not more work."
    }
  },
  
  SolarPlexus: {
    name: "Solar Plexus Center",
    biologicalCorrelation: "Kidneys, prostate, pancreas, nervous system",
    theme: "Emotions, Feelings & Spirit",
    frequency: "53% defined",
    gates: [6, 37, 22, 36, 30, 55, 49],
    definedDescription: "The Solar Plexus is the center of emotional awareness. When defined, you experience emotions as a wave with highs and lows, and need time for clarity.",
    undefinedDescription: "An undefined Solar Plexus takes in and amplifies the emotions of others. You can sense the emotional truth of any environment.",
    defined: {
      header: "Your Solar Plexus is Defined",
      consistentEnergy: "You experience life through an emotional wave - times of hope and times of pain, creativity and melancholy. This wave is your Authority if you're emotional. There's no truth in the now for you; clarity comes with time.",
      gifts: [
        "Emotional depth and richness",
        "Creativity through emotional experience",
        "Passion and feeling",
        "Ability to wait for clarity"
      ],
      howToUse: "Never make decisions in the high or low of your wave. Wait for clarity - 'sleep on it' or wait longer for big decisions. Track your wave to understand your patterns. Your emotions are not wrong; they're your navigation system.",
      shadow: "Making impulsive decisions in emotional highs or lows. Taking your emotions out on others. Waiting so long for clarity that you never act. Becoming emotionally manipulative."
    },
    undefined: {
      header: "Your Solar Plexus is Open",
      wisdomPotential: "You can become wise about emotions themselves - understanding emotional truth beyond personal waves. You can read the emotional temperature of any room and know what's really going on beneath the surface.",
      conditioningPatterns: [
        "Avoiding confrontation at all costs",
        "Taking on others' emotions as your own",
        "Becoming an emotional sponge",
        "Making decisions to avoid emotional discomfort"
      ],
      questionsYouAsk: [
        "Am I avoiding truth to keep the peace?",
        "Is this my emotion or someone else's?",
        "Why am I so affected by others' moods?",
        "Should I say something or stay quiet?"
      ],
      howToAvoidConditioning: "Learn to distinguish your emotions from others'. You're not meant to carry the emotional weight of the world. Don't avoid truth just to keep peace. Let emotions move through you without holding them.",
      amplificationAwareness: "You amplify others' emotions intensely. A slightly annoyed person might feel rageful to you; slightly sad might feel devastating. Create space between feeling an emotion and believing it's yours or acting on it."
    }
  },
  
  Spleen: {
    name: "Spleen Center",
    biologicalCorrelation: "Spleen, lymph system, T-cells",
    theme: "Intuition, Survival & Health",
    frequency: "55% defined",
    gates: [48, 57, 44, 50, 32, 28, 18],
    definedDescription: "The Spleen Center is about survival, intuition, and immune response. When defined, you have reliable instincts and moment-to-moment intuitive awareness.",
    undefinedDescription: "An undefined Spleen doesn't have consistent access to intuition and may hold onto things (and people) past their time.",
    defined: {
      header: "Your Spleen Center is Defined",
      consistentEnergy: "You have reliable, in-the-moment intuition. Your body knows what's healthy and safe without needing to think about it. You have good instincts for survival - both physical and situational.",
      gifts: [
        "Reliable intuition",
        "Strong immune function",
        "Survival instincts",
        "Spontaneous knowing"
      ],
      howToUse: "Trust your first instinct - the Spleen speaks once, quietly, and doesn't repeat. Honor your body's signals about health, safety, and timing. Your intuition is designed to protect you; don't override it with logic.",
      shadow: "Ignoring intuitive hits because they don't make logical sense. Taking your health for granted. Acting impulsively without checking with other aspects of your design."
    },
    undefined: {
      header: "Your Spleen Center is Open",
      wisdomPotential: "You can become wise about fear and intuition - understanding the difference between genuine warning and conditioned fear. You can sense what's truly healthy versus what people just think is healthy.",
      conditioningPatterns: [
        "Holding onto things, people, and situations too long",
        "Not knowing what's healthy for you",
        "Ignoring physical warning signs",
        "Living with fear-based thinking"
      ],
      questionsYouAsk: [
        "Should I hold on or let go?",
        "Is this healthy for me?",
        "Am I safe?",
        "Is this fear real or imagined?"
      ],
      howToAvoidConditioning: "Don't hold onto things just because they feel familiar. Check in regularly about whether relationships and situations are still healthy for you. Create consistent health routines since you can't rely on spontaneous knowing.",
      amplificationAwareness: "You amplify others' fears and survival instincts. Around scared people, you might feel terrified. This can make you very sensitive to others' health issues. Be careful not to adopt others' phobias or health anxieties."
    }
  },
  
  Root: {
    name: "Root Center",
    biologicalCorrelation: "Adrenal glands",
    theme: "Pressure, Drive & Stress",
    frequency: "60% defined",
    gates: [53, 60, 52, 19, 39, 41, 38, 54, 58],
    definedDescription: "The Root Center is about adrenaline pressure and the drive to move, grow, and evolve. When defined, you have consistent internal pressure that drives you forward.",
    undefinedDescription: "An undefined Root takes in and amplifies external pressure. You might rush to finish things just to relieve pressure.",
    defined: {
      header: "Your Root Center is Defined",
      consistentEnergy: "You have a reliable internal pressure that drives action and movement. This pressure is yours - it doesn't fluctuate based on external circumstances. You have a consistent relationship with stress and adrenaline.",
      gifts: [
        "Consistent drive and pressure",
        "Ability to handle stress",
        "Reliable momentum",
        "Not destabilized by external pressure"
      ],
      howToUse: "Use your internal pressure as fuel, not as a whip. You don't need to do everything now - your pressure will still be there tomorrow. Channel your drive into correct activities. Regular physical activity helps manage your consistent adrenaline.",
      shadow: "Using pressure to push yourself unsustainably. Creating unnecessary urgency for yourself and others. Mistaking adrenaline for importance. Burning out from constant internal pressure."
    },
    undefined: {
      header: "Your Root Center is Open",
      wisdomPotential: "You can become wise about pressure and stress - understanding what's truly urgent versus what just feels urgent. You can sense when others are driven by unhealthy pressure and help them find peace.",
      conditioningPatterns: [
        "Rushing to finish things to relieve pressure",
        "Taking on others' urgency as your own",
        "Feeling like everything is urgent",
        "Collapsing under pressure or becoming addicted to it"
      ],
      questionsYouAsk: [
        "How do I handle pressure?",
        "Is this really urgent?",
        "Why am I so stressed?",
        "Can I slow down?"
      ],
      howToAvoidConditioning: "Not everything is urgent. Practice sitting with pressure without acting on it. Notice when you're rushing just to relieve discomfort, not because something actually needs to be done now. Build in buffer time.",
      amplificationAwareness: "You amplify others' stress and pressure. In high-pressure environments, you might feel like you're going to explode. Create pressure-free zones in your life. Don't mistake amplified urgency for reality."
    }
  }
};

// Helper function to get center data by name
export const getCenterData = (centerName: string): HDCenterData | undefined => {
  return CENTERS_DATA[centerName];
};

// Get all center names
export const ALL_CENTERS = Object.keys(CENTERS_DATA);
