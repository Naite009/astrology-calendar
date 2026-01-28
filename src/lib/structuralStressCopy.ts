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

// ============== LIFE EVENT INTERPRETATIONS ==============

export const LIFE_EVENT_LABELS: Record<string, string> = {
  relationship_began: "Relationship began",
  relationship_ended: "Relationship ended",
  marriage: "Marriage / Commitment",
  breakup: "Breakup / Divorce",
  grief: "Grief / Loss",
  job_change: "Job change",
  relocation: "Move / Relocation",
  health_event: "Health event",
  identity_shift: "Identity shift",
  safety: "Safety boundary",
  other: "Other"
};

export const LIFE_EVENT_INTERPRETATIONS: Record<string, Record<string, string>> = {
  relationship_began: {
    containment: "Saturn's containment energy often correlates with relationships that feel 'serious' from the start—binding, destined, or duty-laden. These connections can have longevity but may also come with heavy expectations or a sense of obligation from the beginning.",
    stress: "Pluto's intensity at relationship beginnings can indicate powerful, transformative bonds—but also ones where power dynamics are present from the start. Early attraction may feel fated or obsessive. Consider: what drew you in, and what patterns were established?",
    release: "Uranus energy at relationship start suggests awakening, excitement, or a sudden 'this changes everything' quality. These beginnings often feel liberating but may also indicate instability or commitment resistance built into the foundation.",
    trigger: "Mars or nodal activation at relationship start points to decisive action, fated timing, or external events that pushed the connection forward. The beginning was likely marked by urgency or clear directional momentum.",
    default: "This date carries transit significance that colored how the relationship began. The planetary themes active at the start often become themes that play out throughout the connection."
  },
  relationship_ended: {
    containment: "Saturn endings often correlate with the weight of commitment becoming unsustainable, or structures that couldn't flex. The end may have felt like 'the responsible choice' or 'what had to happen' rather than a dramatic rupture.",
    stress: "Pluto endings involve transformation through destruction—power dynamics reached a breaking point, something unsustainable was finally exposed, or the cost of staying became impossible to ignore. These endings often feel like death and rebirth.",
    release: "Uranus endings carry the 'I'm done' energy—sudden clarity, liberation impulse, or the system simply refusing to continue. These endings may have surprised everyone, or felt like waking up from a pattern you didn't realize you were in.",
    trigger: "Mars or eclipse activation at endings suggests events that forced the issue—confrontation, external circumstances, or action that couldn't be undone. The ending was likely marked by decisive moves rather than gradual fade.",
    default: "The transits active at this ending reveal the nature of what was released and why the structure could no longer hold."
  },
  marriage: {
    containment: "Saturn active at commitment ceremonies often indicates marriages built on duty, stability, or 'the right thing to do.' These unions can be lasting but may carry weight—the question is whether that weight feels grounding or constraining.",
    stress: "Pluto at marriage points to transformative union—but also to power dynamics being formalized. Consider what you were giving away or gaining access to through this commitment.",
    release: "Uranus at marriage is unusual—it suggests a commitment made to liberate rather than contain, or one that defied convention. The marriage itself may have felt like a break from the expected path.",
    trigger: "Mars or nodal energy at marriage indicates decisive action, fated timing, or external pressure that accelerated the commitment. The 'why now?' is worth examining.",
    default: "Commitments made under these transits carry their signature forward. The themes active at the ceremony often become themes of the marriage itself."
  },
  breakup: {
    containment: "Saturn breakups often happen when the structure outlives its function—duty without love, form without substance. These endings can feel like 'finally' or like a slow collapse of something that should have been rebuilt earlier.",
    stress: "Pluto breakups emerge from pressure that couldn't be ignored—betrayal, power imbalance, or the cost of staying becoming visible. These endings transform everything and rarely leave things as they were.",
    release: "Uranus breakups carry liberation energy—the 'I woke up' moment, sudden clarity, or the system simply refusing to continue. These endings often feel shocking but also freeing.",
    trigger: "Mars or eclipse energy at breakup suggests events that forced action—confrontation, disclosure, or circumstances that made continuation impossible.",
    default: "The transits at breakup reveal what was being released and why the structure reached its limit."
  },
  grief: {
    containment: "Saturn during grief emphasizes the weight of loss—the structures that are now absent, the responsibilities that shift. This is sobering, maturing grief that asks you to carry something heavy for a while.",
    stress: "Pluto grief is transformative loss—the kind that changes you fundamentally, that exposes what was hidden, that makes the old life impossible to return to. This is death-and-rebirth territory.",
    release: "Uranus during grief may feel disorienting—liberation you didn't want, or sudden awareness that comes through loss. The ground shifts, and you're not who you were before.",
    trigger: "Mars or nodal energy during grief points to decisive events, fate-like timing, or action required in the midst of loss. Something was triggered that couldn't be undone.",
    default: "Grief under these transits carries their signature. The way you processed this loss is connected to what was being restructured in your life."
  },
  job_change: {
    containment: "Saturn career changes often involve restructuring toward sustainability—leaving something that wasn't working, or building something that can last. Responsibility themes are prominent.",
    stress: "Pluto career changes involve power dynamics—being pushed out, seizing authority, or transforming your public role through intensity. These transitions often feel forced or fated.",
    release: "Uranus career changes carry awakening energy—suddenly knowing what you don't want, or liberating yourself from a role that constrained your authentic expression.",
    trigger: "Mars or nodal energy at job change points to decisive action or fated timing. The move was likely marked by urgency or clear external catalysts.",
    default: "Career transitions under these transits are shaped by the planetary themes active. The reasons for leaving and what you're moving toward carry this signature."
  },
  relocation: {
    containment: "Saturn moves often involve necessity—building stability somewhere new, or leaving because the old structure couldn't hold. These relocations tend to be for practical reasons.",
    stress: "Pluto relocations are transformative—leaving behind something that can't continue, or moving toward something that will change you fundamentally. Power or survival themes may be present.",
    release: "Uranus moves carry liberation energy—escaping constraint, seeking freedom, or the restless urge for change manifesting as physical relocation.",
    trigger: "Mars or nodal energy at relocation points to decisive action or fated timing. The move happened because something pushed or pulled with urgency.",
    default: "Relocations under these transits carry their signature. Where you went and why you left are connected to what was being restructured."
  },
  health_event: {
    containment: "Saturn health events often involve the body demanding attention to structure, limits, or sustainability. What was being pushed too hard? What needs better boundaries?",
    stress: "Pluto health events can be transformative crises—the body exposing what the mind avoided, or power over your own physical existence being tested.",
    release: "Uranus health events may come suddenly, as wake-up calls or unexpected shifts in physical reality. The body disrupts to liberate or to demand authenticity.",
    trigger: "Mars or eclipse energy at health events points to acute presentations, decisive interventions, or timing that felt fated.",
    default: "Health events under these transits are connected to the planetary themes active. The body often mirrors what's happening structurally in life."
  },
  identity_shift: {
    containment: "Saturn identity shifts involve maturing—becoming your own authority, accepting limits, or restructuring who you thought you were around what's actually sustainable.",
    stress: "Pluto identity shifts are transformations—the death of an old self, exposure of shadow aspects, or the emergence of a more powerful (or more honest) version of you.",
    release: "Uranus identity shifts are awakenings—suddenly seeing yourself differently, liberating from old self-concepts, or becoming someone new through disruption.",
    trigger: "Mars or nodal energy at identity shifts points to decisive moments, action that changed how you see yourself, or fate-like encounters that altered your sense of who you are.",
    default: "Identity shifts under these transits are shaped by the planetary themes. Who you became and why you changed are connected to what was being restructured."
  },
  safety: {
    containment: "If safety was a concern during Saturn periods, the theme is often structures that trapped rather than protected. Saturn can indicate staying too long because of duty or fear of leaving.",
    stress: "Pluto and safety concerns often involve power dynamics—control, intensity, or pressure that became threatening. These transits can correlate with situations where the cost of staying was exposed.",
    release: "Uranus and safety often correlates with breaking free—sudden clarity that you needed to leave, or circumstances that enabled escape. Liberation may have been the survival mechanism.",
    trigger: "Mars or eclipse energy with safety concerns points to acute events, confrontations, or decisive moments that shifted the safety equation.",
    default: "If safety was compromised during this period, prioritize real-world support. Astrology offers insight but never justifies harm or obligation to endure it."
  },
  other: {
    default: "The transits active during this period colored whatever events occurred. Saturn brings structure and weight, Pluto brings intensity and transformation, Uranus brings awakening and disruption, Mars brings action and triggers."
  }
};
