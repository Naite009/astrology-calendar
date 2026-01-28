// Structural Stress & Release - Copy Templates
// Trauma-informed, non-deterministic language for transit interpretation

import { PhaseLabel, MeaningDialMode } from './structuralStressEngine';

// ============== SATURN IN SIGN TEMPLATES ==============

export const SATURN_IN_SIGN: Record<string, { asks: string; quality: string; need: string }> = {
  Aries: {
    asks: "Where are you seeking courage from others instead of building it in yourself?",
    quality: "self-reliance",
    need: "independence"
  },
  Taurus: {
    asks: "Where have you been building security through accumulation rather than self-worth?",
    quality: "stability",
    need: "groundedness"
  },
  Gemini: {
    asks: "Where have you been scattered, avoiding the depth that focus requires?",
    quality: "clear communication",
    need: "mental discipline"
  },
  Cancer: {
    asks: "Where have you been seeking safety from others instead of providing it for yourself?",
    quality: "emotional security",
    need: "self-nurturing"
  },
  Leo: {
    asks: "Where have you been seeking validation instead of developing genuine self-expression?",
    quality: "authentic creativity",
    need: "self-respect"
  },
  Virgo: {
    asks: "Where has perfectionism become a prison rather than a practice?",
    quality: "discernment",
    need: "useful service"
  },
  Libra: {
    asks: "Where have you been confusing obligation with love?",
    quality: "fairness",
    need: "balanced partnership"
  },
  Scorpio: {
    asks: "Where have you been holding control rather than trusting transformation?",
    quality: "emotional honesty",
    need: "authentic intimacy"
  },
  Sagittarius: {
    asks: "Where have you been seeking freedom without responsibility?",
    quality: "earned wisdom",
    need: "meaningful purpose"
  },
  Capricorn: {
    asks: "Where has ambition become a substitute for authentic achievement?",
    quality: "mature authority",
    need: "lasting accomplishment"
  },
  Aquarius: {
    asks: "Where have you been different for its own sake rather than for authentic expression?",
    quality: "principled innovation",
    need: "contribution to community"
  },
  Pisces: {
    asks: "Where have you been escaping rather than transcending?",
    quality: "grounded spirituality",
    need: "compassion with boundaries"
  }
};

// ============== SATURN IN HOUSE TEMPLATES ==============

export const SATURN_IN_HOUSE: Record<number, { asks: string; domain: string }> = {
  1: {
    asks: "What structures are you building around your identity—and which ones were imposed by others?",
    domain: "self-image and independence"
  },
  2: {
    asks: "What is the true cost of your security—and what would genuine self-worth look like?",
    domain: "resources and values"
  },
  3: {
    asks: "What beliefs about your mind and voice have limited your expression?",
    domain: "communication and learning"
  },
  4: {
    asks: "What family patterns have become foundations—and which need rebuilding?",
    domain: "home and emotional roots"
  },
  5: {
    asks: "Where has fear blocked joy, creativity, or authentic self-expression?",
    domain: "creativity and pleasure"
  },
  6: {
    asks: "What routines serve your health—and which ones are obligations you never chose?",
    domain: "health and daily work"
  },
  7: {
    asks: "What structures are you building in partnerships—and which ones are you maintaining out of obligation?",
    domain: "relationships and commitments"
  },
  8: {
    asks: "Where have power dynamics replaced genuine intimacy—and what would trust require?",
    domain: "shared resources and transformation"
  },
  9: {
    asks: "What beliefs have become cages—and which ones are ready to become bridges?",
    domain: "meaning and worldview"
  },
  10: {
    asks: "Whose definition of success have you been chasing—and what would your own look like?",
    domain: "career and public role"
  },
  11: {
    asks: "What communities have held you—and which ones have demanded conformity instead of contribution?",
    domain: "community and aspirations"
  },
  12: {
    asks: "What patterns run in the background of your life—and which ones are ready to surface and heal?",
    domain: "rest and unconscious patterns"
  }
};

// ============== PHASE COPY TEMPLATES ==============

export const PHASE_COPY: Record<PhaseLabel, { title: string; body: string }> = {
  Containment: {
    title: "Containment Phase",
    body: "Saturn is emphasizing structure, duty, and long-term consequences. This is a time when commitment pressure rises, and 'holding things together' can feel necessary. If it feels heavy, that doesn't mean you're failing—Saturn periods are designed to show what's sustainable."
  },
  'Structural Stress': {
    title: "Structural Stress Phase",
    body: "Pluto increases intensity and raises the cost of avoidance. Power dynamics, control themes, or deep fear patterns may surface—not as punishment, but as exposure. This often correlates with 'I can't keep paying this price' moments."
  },
  Release: {
    title: "Release Phase",
    body: "Uranus agitates what's stuck. You may feel restless, awakened, or suddenly clear about what can't continue. This isn't always 'sudden chaos'—sometimes it's a quiet internal switch: 'I'm done.'"
  },
  Activation: {
    title: "Activation Phase",
    body: "Mars and eclipse triggers tend to externalize what's been building internally. This can show up as decisive action, confrontation, or events that force a choice. The point isn't drama—it's clarity."
  },
  Mixed: {
    title: "Mixed Phase",
    body: "Multiple forces are active simultaneously. This period combines containment, stress, and release dynamics. The pressure may feel complex, with competing needs for stability and change."
  }
};

// ============== AXIS HEADLINE TEMPLATES ==============

export const AXIS_HEADLINES: Record<string, { tension: string; question: string }> = {
  "1st↔7th": {
    tension: "Self-definition vs Partnership",
    question: "How do I honor my needs without abandoning connection—or lose myself in relationship?"
  },
  "2nd↔8th": {
    tension: "Self-worth vs Shared power",
    question: "How do I maintain my resources and values while sharing power with others?"
  },
  "3rd↔9th": {
    tension: "Daily mind vs Higher meaning",
    question: "How do I balance practical thinking with larger beliefs and purpose?"
  },
  "4th↔10th": {
    tension: "Private foundation vs Public role",
    question: "How do I balance career demands without sacrificing home safety and emotional needs?"
  },
  "5th↔11th": {
    tension: "Personal joy vs Community goals",
    question: "How do I pursue my creative expression while contributing to something larger?"
  },
  "6th↔12th": {
    tension: "Health and service vs Rest and healing",
    question: "How do I serve without depleting myself—and rest without avoiding life?"
  }
};

// ============== MEANING DIAL VARIANTS ==============

export const MEANING_DIAL_VARIANTS: Record<MeaningDialMode, { tone: string; prompts: string[] }> = {
  Insight: {
    tone: "Understanding these dynamics can illuminate patterns without prescribing outcomes.",
    prompts: [
      "What pattern is becoming visible that wasn't before?",
      "What has this period revealed about your limits or needs?",
      "What would you tell someone else going through this?"
    ]
  },
  Practical: {
    tone: "Focus on concrete next steps and sustainable decisions.",
    prompts: [
      "What is one boundary you can set this week?",
      "What decision have you been avoiding—and what information do you need?",
      "Who can provide real-world support right now?"
    ]
  },
  'Emotional Support': {
    tone: "You're navigating something difficult. Your feelings make sense given the pressures.",
    prompts: [
      "What would it feel like to give yourself permission to feel this fully?",
      "What do you need that you haven't been able to ask for?",
      "What part of yourself needs acknowledgment right now?"
    ]
  },
  'Shadow Work': {
    tone: "Look at the patterns running beneath the surface—without judgment, with curiosity.",
    prompts: [
      "Where have you been people-pleasing at the cost of your own needs?",
      "What authority pattern from your past is playing out now?",
      "Where have you given away power—and why did that feel necessary?"
    ]
  }
};

// ============== CONTEXT TAG LABELS ==============

export const CONTEXT_TAG_LABELS: Record<string, string> = {
  relationship: "Relationship dynamics",
  marriage: "Marriage/commitment",
  breakup: "Breakup/divorce",
  parenting: "Parenting/caregiving",
  grief: "Grief/loss",
  career: "Career/status",
  home: "Home/relocation",
  health: "Health changes",
  legal: "Legal/financial",
  identity: "Identity shift",
  safety: "Safety boundary",
  other: "Other"
};

// ============== MANIFESTATION BY HOUSE ==============

export const MANIFESTATION_BY_HOUSE: Record<number, string[]> = {
  1: [
    "Identity redefinition",
    "Self-image restructuring",
    "Personal boundary enforcement",
    "Physical appearance changes"
  ],
  2: [
    "Financial restructuring",
    "Values clarification",
    "Resource reallocation",
    "Self-worth recalibration"
  ],
  3: [
    "Communication pattern shifts",
    "Sibling or neighbor dynamics",
    "Learning new skills",
    "Local environment changes"
  ],
  4: [
    "Home or family restructuring",
    "Foundational security questions",
    "Parent relationships",
    "Emotional root work"
  ],
  5: [
    "Creative blocks or breakthroughs",
    "Romance dynamics",
    "Children-related decisions",
    "Joy and pleasure reassessment"
  ],
  6: [
    "Health interventions",
    "Work routine changes",
    "Service role adjustments",
    "Daily structure overhaul"
  ],
  7: [
    "Partnership renegotiation",
    "Commitment decisions",
    "Relationship endings or beginnings",
    "Contract or agreement changes"
  ],
  8: [
    "Shared resource division",
    "Intimacy and trust issues",
    "Debt or inheritance matters",
    "Psychological transformation"
  ],
  9: [
    "Belief system overhaul",
    "Travel or relocation",
    "Educational transitions",
    "Meaning and purpose questions"
  ],
  10: [
    "Career restructuring",
    "Public role changes",
    "Authority figure dynamics",
    "Professional reputation matters"
  ],
  11: [
    "Community or group shifts",
    "Friendship reassessment",
    "Goal revision",
    "Social network changes"
  ],
  12: [
    "Hidden pattern surfacing",
    "Rest and retreat needs",
    "Spiritual or psychological work",
    "Institutional involvement"
  ]
};

// ============== ACTION TEMPLATES BY PHASE ==============

export const ACTION_TEMPLATES: Record<PhaseLabel, string[]> = {
  Containment: [
    "Simplify one area of life that has become overcommitted",
    "Formalize a boundary that has been informal or unclear",
    "Build a support structure before the pressure increases",
    "Accept one limit without resisting it—see what space opens"
  ],
  'Structural Stress': [
    "Name the true cost of one pattern you've been maintaining",
    "Stop negotiating with a reality that isn't negotiable",
    "Reclaim authority in one area where you've been overextended",
    "Allow something unsustainable to end without forcing it to continue"
  ],
  Release: [
    "Make room for change by reducing one rigid expectation",
    "Choose freedom in one area—but make sure it's safe and stable",
    "Trust the impulse toward authenticity, even if it's uncomfortable",
    "Experiment with one small freedom before committing to a large one"
  ],
  Activation: [
    "Act cleanly on one decision you've been avoiding",
    "Plan ahead for situations that might escalate",
    "Prioritize safety and support in all choices",
    "Use the clarity this period offers—don't waste it on drama"
  ],
  Mixed: [
    "Identify which force feels strongest right now and work with it",
    "Balance structure-building with room for change",
    "Accept that multiple needs are valid simultaneously",
    "Focus on one priority at a time rather than trying to address everything"
  ]
};

// ============== CLUSTER NARRATIVE ==============

export const CLUSTER_NARRATIVES: Record<string, string> = {
  'saturn-pluto': "When containment meets stress, structures often reach a point where continuation requires too high a cost. This can look like revelations about what's unsustainable, or boundaries that become non-negotiable.",
  'saturn-uranus': "When containment meets release, the tension between stability and freedom intensifies. This can look like sudden insights about what structures serve you versus what structures trap you.",
  'pluto-uranus': "When stress meets release, pressure and liberation combine. This can look like forced changes that ultimately free you, or breakthroughs that come through breakdown.",
  'saturn-pluto-uranus': "When containment, stress, and release converge, structures often reach a threshold where maintaining them costs too much. This can look like revelations, sudden boundary shifts, or a decisive exit impulse."
};

// ============== SAFETY GUARDRAIL ==============

export const SAFETY_COPY = "If you feel unsafe, prioritize real-world support and safety planning. This interpretation offers insight, not prescription—and your safety always comes first.";
