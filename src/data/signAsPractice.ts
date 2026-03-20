// Sign-as-Practice Layer — lived prompts, shadow prompts, ritual ideas per sign

export interface SignPractice {
  sign: string;
  keywords: string[];
  prompts: string[];
  shadowPrompts: string[];
  ritualIdeas: string[];
}

export const SIGN_PRACTICES: Record<string, SignPractice> = {
  Aries: {
    sign: "Aries",
    keywords: ["courage", "initiation", "independence", "directness", "passion", "new beginnings", "self-assertion"],
    prompts: [
      "Where am I being asked to go first?",
      "What new beginning wants my courage?",
      "Where do I need to stop waiting for permission?",
      "What would I do if I weren't afraid of conflict?",
    ],
    shadowPrompts: [
      "Where am I acting impulsively instead of courageously?",
      "Where is my anger masking vulnerability?",
      "What am I fighting that actually needs tenderness?",
    ],
    ritualIdeas: ["physical movement", "bold first step", "fire ceremony", "speak a boundary aloud"],
  },
  Taurus: {
    sign: "Taurus",
    keywords: ["stability", "pleasure", "groundedness", "patience", "self-worth", "beauty", "embodiment"],
    prompts: [
      "What does my body need right now?",
      "What simple pleasure would restore me?",
      "Where do I need to slow down and trust the timing?",
      "What am I building that deserves my patience?",
    ],
    shadowPrompts: [
      "Where am I clinging to comfort instead of growing?",
      "Where is stubbornness blocking something better?",
      "What am I hoarding out of fear of scarcity?",
    ],
    ritualIdeas: ["nature walk", "cook nourishing food", "touch earth", "self-care ritual", "scent or essential oils"],
  },
  Gemini: {
    sign: "Gemini",
    keywords: ["curiosity", "communication", "versatility", "learning", "connection", "voice", "ideas"],
    prompts: [
      "What conversation needs to happen?",
      "What am I curious about right now?",
      "Where do I need to speak my truth?",
      "What idea wants to be expressed?",
    ],
    shadowPrompts: [
      "Where am I scattered instead of focused?",
      "What am I avoiding by staying busy or talking around it?",
      "Where is information replacing genuine understanding?",
    ],
    ritualIdeas: ["write a letter", "voice note to self", "read something inspiring", "sibling or neighbor outreach"],
  },
  Cancer: {
    sign: "Cancer",
    keywords: ["nurturing", "emotional safety", "home", "roots", "healing", "sensitivity", "inner life"],
    prompts: [
      "What does emotional safety look like for me right now?",
      "What needs healing in my inner world?",
      "How can I nurture myself the way I nurture others?",
      "What is my heart quietly asking for?",
    ],
    shadowPrompts: [
      "Where am I withdrawing instead of reaching out?",
      "Where is caretaking replacing my own needs?",
      "What old wound am I protecting instead of healing?",
    ],
    ritualIdeas: ["cook comfort food", "home altar", "bath ritual", "journal about family patterns", "moonlight time"],
  },
  Leo: {
    sign: "Leo",
    keywords: ["courage", "joy", "play", "creativity", "visibility", "heart-led expression", "leadership", "inner child"],
    prompts: [
      "Where am I being asked to shine instead of hide?",
      "What would feel joyful, brave, and fully mine?",
      "Where do I need to stop shrinking?",
      "What creative act wants to be born through me?",
      "What would it look like to wear the crown in this area of life?",
    ],
    shadowPrompts: [
      "Where am I afraid to be seen?",
      "Where am I giving away my power because of fear or other people's opinions?",
      "What old fear gets activated when I imagine taking up more space?",
    ],
    ritualIdeas: ["mirror work", "speak intentions aloud", "creative self-expression", "adornment ritual", "inner child play"],
  },
  Virgo: {
    sign: "Virgo",
    keywords: ["service", "refinement", "health", "skill", "discernment", "sacred routine", "improvement"],
    prompts: [
      "What daily practice would serve my growth?",
      "Where can I be more skillful or precise?",
      "What needs editing, simplifying, or healing?",
      "How can I be of service without depleting myself?",
    ],
    shadowPrompts: [
      "Where is perfectionism blocking progress?",
      "Where am I criticizing myself instead of being compassionate?",
      "What am I trying to control that needs acceptance?",
    ],
    ritualIdeas: ["organize a space", "body scan", "herbal tea ceremony", "refine a craft or skill", "health inventory"],
  },
  Libra: {
    sign: "Libra",
    keywords: ["harmony", "relationships", "balance", "beauty", "justice", "partnership", "diplomacy"],
    prompts: [
      "Where do I need more balance in my life?",
      "What relationship is asking for attention?",
      "Where do I need to choose instead of compromise?",
      "What beauty would restore my peace?",
    ],
    shadowPrompts: [
      "Where am I people-pleasing instead of being honest?",
      "Where have I lost myself in someone else's needs?",
      "What decision am I avoiding because I fear conflict?",
    ],
    ritualIdeas: ["create beauty", "art or music", "relationship check-in", "mediation or justice practice", "balance exercise"],
  },
  Scorpio: {
    sign: "Scorpio",
    keywords: ["depth", "transformation", "intimacy", "truth", "power", "surrender", "rebirth"],
    prompts: [
      "What am I afraid to feel?",
      "What emotional truth am I avoiding?",
      "Where do I need to surrender control?",
      "What is dying so something new can be born?",
    ],
    shadowPrompts: [
      "Where am I holding onto resentment?",
      "Where is my need for control rooted in fear?",
      "What vulnerability am I hiding behind intensity?",
    ],
    ritualIdeas: ["breathwork", "journal the unspeakable", "release ceremony", "shadow work meditation", "transformative conversation"],
  },
  Sagittarius: {
    sign: "Sagittarius",
    keywords: ["meaning", "adventure", "expansion", "wisdom", "truth-seeking", "optimism", "freedom"],
    prompts: [
      "What larger meaning is trying to emerge?",
      "Where do I need more freedom or adventure?",
      "What belief is ready to be outgrown?",
      "What truth am I circling around?",
    ],
    shadowPrompts: [
      "Where am I running instead of landing?",
      "Where is restlessness masking fear of commitment?",
      "What am I preaching instead of practicing?",
    ],
    ritualIdeas: ["explore somewhere new", "philosophical journaling", "travel or outdoor adventure", "teach someone something", "vision quest"],
  },
  Capricorn: {
    sign: "Capricorn",
    keywords: ["structure", "responsibility", "achievement", "integrity", "mastery", "legacy", "discipline"],
    prompts: [
      "What worthy work am I being called to?",
      "Where do I need more structure or discipline?",
      "What am I building for the long term?",
      "Where do I need to take myself more seriously?",
    ],
    shadowPrompts: [
      "Where is ambition replacing connection?",
      "Where am I being too hard on myself?",
      "What pressure am I carrying that isn't mine?",
    ],
    ritualIdeas: ["goal review", "mountain or hill walk", "commit to a practice", "mentor or seek mentorship", "legacy journaling"],
  },
  Aquarius: {
    sign: "Aquarius",
    keywords: ["individuality", "innovation", "community", "freedom", "vision", "revolution", "authenticity"],
    prompts: [
      "Where am I conforming when I should be pioneering?",
      "What future am I working toward?",
      "Where does my community need me to show up differently?",
      "What would true freedom look like here?",
    ],
    shadowPrompts: [
      "Where is detachment replacing genuine connection?",
      "Where am I rebelling for its own sake?",
      "What group identity am I hiding behind?",
    ],
    ritualIdeas: ["brainstorm freely", "connect with like-minded people", "volunteer", "technology detox", "envision the future"],
  },
  Pisces: {
    sign: "Pisces",
    keywords: ["compassion", "dreams", "sensitivity", "intuition", "spirituality", "creativity", "surrender", "flow"],
    prompts: [
      "Where do I need rest instead of effort?",
      "Where am I pushing when I should surrender?",
      "What is my body asking for?",
      "What am I sensing but not acting on?",
      "Where do I need more compassion for myself?",
    ],
    shadowPrompts: [
      "Where am I escaping instead of feeling?",
      "Where have I dissolved my boundaries?",
      "What am I martyring myself for?",
    ],
    ritualIdeas: ["water ritual", "guided meditation", "art or music without outcome", "dream journaling", "compassion practice"],
  },
};

export function getSignPractice(sign: string): SignPractice | undefined {
  return SIGN_PRACTICES[sign];
}
