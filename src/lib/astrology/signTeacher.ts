export type Element = "Fire" | "Earth" | "Air" | "Water";
export type Modality = "Cardinal" | "Fixed" | "Mutable";

export type ZodiacSign =
  | "Aries" | "Taurus" | "Gemini" | "Cancer"
  | "Leo" | "Virgo" | "Libra" | "Scorpio"
  | "Sagittarius" | "Capricorn" | "Aquarius" | "Pisces";

export type SignProfile = {
  coreQuestion: string;
  superpower: string;
  shadow: string;
};

export type SignInfo = {
  sign: ZodiacSign;
  element: Element;
  modality: Modality;
  opposite: ZodiacSign;
};

const SIGNS: Record<ZodiacSign, SignInfo> = {
  Aries: { sign: "Aries", element: "Fire", modality: "Cardinal", opposite: "Libra" },
  Taurus: { sign: "Taurus", element: "Earth", modality: "Fixed", opposite: "Scorpio" },
  Gemini: { sign: "Gemini", element: "Air", modality: "Mutable", opposite: "Sagittarius" },
  Cancer: { sign: "Cancer", element: "Water", modality: "Cardinal", opposite: "Capricorn" },
  Leo: { sign: "Leo", element: "Fire", modality: "Fixed", opposite: "Aquarius" },
  Virgo: { sign: "Virgo", element: "Earth", modality: "Mutable", opposite: "Pisces" },
  Libra: { sign: "Libra", element: "Air", modality: "Cardinal", opposite: "Aries" },
  Scorpio: { sign: "Scorpio", element: "Water", modality: "Fixed", opposite: "Taurus" },
  Sagittarius: { sign: "Sagittarius", element: "Fire", modality: "Mutable", opposite: "Gemini" },
  Capricorn: { sign: "Capricorn", element: "Earth", modality: "Cardinal", opposite: "Cancer" },
  Aquarius: { sign: "Aquarius", element: "Air", modality: "Fixed", opposite: "Leo" },
  Pisces: { sign: "Pisces", element: "Water", modality: "Mutable", opposite: "Virgo" },
};

const SIGN_GLYPHS: Record<ZodiacSign, string> = {
  Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
  Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
  Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓',
};

const ELEMENT_ICONS: Record<Element, string> = {
  Fire: '🔥', Earth: '🌍', Air: '💨', Water: '🌊',
};

const ELEMENT_MEANINGS: Record<Element, { title: string; body: string }> = {
  Fire: {
    title: "Fire = Vitality & Will",
    body: "Fire signs describe creative force: motivation, courage, desire, leadership, risk, and the spark that initiates action.",
  },
  Earth: {
    title: "Earth = The Reality Layer",
    body: "Earth signs describe the physical life we have to manage: the body, health, food, work, money, schedules, tools, and the systems that keep life running.",
  },
  Air: {
    title: "Air = Mind & Meaning-Making",
    body: "Air signs describe thought and connection: language, ideas, perspective, social exchange, learning, and how we interpret reality.",
  },
  Water: {
    title: "Water = Emotion & Bonding",
    body: "Water signs describe inner life: feelings, attachment, intuition, sensitivity, memory, and the need for emotional safety and belonging.",
  },
};

const MODALITY_MEANINGS: Record<Modality, { title: string; body: string }> = {
  Cardinal: {
    title: "Cardinal = Initiation",
    body: "Cardinal signs begin. They set things in motion, establish direction, and create a first version of the structure or storyline.",
  },
  Fixed: {
    title: "Fixed = Stabilization",
    body: "Fixed signs sustain. They build endurance, protect what works, deepen investment, and resist change until it's truly necessary.",
  },
  Mutable: {
    title: "Mutable = Adjustment & Refinement",
    body: "Mutable signs adapt. They tweak, edit, reorganize, and respond—small adjustments compound over time into visible outcomes.",
  },
};

const ELEMENT_TRIADS: Record<Element, { Cardinal: ZodiacSign; Fixed: ZodiacSign; Mutable: ZodiacSign }> = {
  Fire: { Cardinal: "Aries", Fixed: "Leo", Mutable: "Sagittarius" },
  Earth: { Cardinal: "Capricorn", Fixed: "Taurus", Mutable: "Virgo" },
  Air: { Cardinal: "Libra", Fixed: "Aquarius", Mutable: "Gemini" },
  Water: { Cardinal: "Cancer", Fixed: "Scorpio", Mutable: "Pisces" },
};

const MODE_ROLE_COPY: Record<Modality, string> = {
  Cardinal: "Builds structures. Creates frameworks. Sets the long-term plan.",
  Fixed: "Stabilizes resources. Preserves what works. Protects what's valuable.",
  Mutable: "Optimizes function. Refines the system. Fixes friction so life actually works.",
};

const SIGN_PROFILES: Partial<Record<ZodiacSign, SignProfile>> = {
  Virgo: { coreQuestion: "What is actually working — and what am I maintaining out of habit, obligation, or fear of change?", superpower: "Virgo's knowing is rooted in the gut — not how things feel, but discernment built from observation, pattern recognition, and lived experience. Virgo sees what others miss: what makes practical sense, and what is wishful thinking dressed up as a plan.", shadow: "Perfectionism as a coping mechanism. Over-optimizing the outer system while neglecting the inner one. Becoming efficient at functioning inside someone else's expectations while losing touch with your own rhythm." },
  Pisces: { coreQuestion: "What is the deeper meaning behind what I'm doing — and am I connected to something larger than my daily tasks?", superpower: "Pisces can sense what's beneath the surface — the emotional undercurrents, the unspoken needs, the spiritual significance of seemingly ordinary events.", shadow: "Escapism, avoidance of practical reality, dissolving into others' needs at the expense of one's own, chronic vagueness about direction." },
  Aries: { coreQuestion: "Who am I, and what do I actually want — separate from what others expect of me?", superpower: "Aries can begin without a map. It has the courage to move into the unknown before conditions are perfect.", shadow: "Impulsiveness, self-centeredness, burning hot and fast without follow-through." },
  Libra: { coreQuestion: "Where am I giving too much or too little — and what does genuine equality in my relationships actually look like?", superpower: "Libra can see all sides of a situation and hold space for complexity without rushing to judgment.", shadow: "Indecision, people-pleasing, losing oneself in the needs and opinions of others." },
  Leo: { coreQuestion: "Am I living from my heart — or am I performing a version of myself to gain approval?", superpower: "Leo has the gift of genuine warmth and the courage to shine — not from ego, but from the belief that life is meant to be celebrated.", shadow: "Ego inflation, needing constant validation, losing authenticity to the performance." },
  Aquarius: { coreQuestion: "Where am I conforming to fit in — and where am I called to stand for something larger than personal comfort?", superpower: "Aquarius can detach from personal emotion to see the big picture — what a system needs, what a group needs, what the future requires.", shadow: "Emotional detachment, contrarianism for its own sake, rigidity disguised as principle." },
  Cancer: { coreQuestion: "Where do I truly feel safe — and am I nourishing myself with the same devotion I give to others?", superpower: "Cancer's emotional intelligence and attunement creates profound bonds and safe spaces where people feel genuinely held.", shadow: "Clinginess, emotional manipulation, retreating into the shell when vulnerability is needed." },
  Capricorn: { coreQuestion: "Am I climbing the right mountain — or am I achieving for achievement's sake, disconnected from what actually matters?", superpower: "Capricorn's extraordinary capacity for long-term thinking and disciplined effort allows it to build what others can only dream about.", shadow: "Workaholism, emotional suppression, defining worth entirely through status and achievement." },
};

const AXIS_TEACHER: Record<ZodiacSign, { title: string; bullets: string[] }> = {
  Aries: { title: "Aries: Self & Initiative", bullets: ["Identity and courage", "Decisive action", "Independence and self-definition"] },
  Libra: { title: "Libra: Relationship & Balance", bullets: ["Partnership and negotiation", "Fairness and reciprocity", "Harmony and shared decisions"] },
  Taurus: { title: "Taurus: Stability & Value", bullets: ["Resources and self-worth", "Simplicity and steadiness", "What's sustainable"] },
  Scorpio: { title: "Scorpio: Transformation & Truth", bullets: ["Depth and honesty", "Release and renewal", "Shared power and trust"] },
  Gemini: { title: "Gemini: Information & Choice", bullets: ["Curiosity and learning", "Multiple options", "Communication and agility"] },
  Sagittarius: { title: "Sagittarius: Meaning & Direction", bullets: ["Beliefs and bigger picture", "Truth-seeking", "Growth through experience"] },
  Cancer: { title: "Cancer: Home & Safety", bullets: ["Nurturing and protection", "Roots and belonging", "Emotional security"] },
  Capricorn: { title: "Capricorn: Structure & Responsibility", bullets: ["Boundaries and maturity", "Goals and authority", "Long-term building"] },
  Leo: { title: "Leo: Heart & Expression", bullets: ["Creativity and pride", "Visibility and leadership", "Joy and self-expression"] },
  Aquarius: { title: "Aquarius: Community & Future", bullets: ["Groups and networks", "Innovation and ideals", "The bigger social system"] },
  Virgo: { title: "Virgo: Function & Discernment", bullets: ["Habits and routines", "Health and service", "Practical improvement"] },
  Pisces: { title: "Pisces: Meaning & Surrender", bullets: ["Intuition and faith", "Compassion and sensitivity", "Letting go of noise and urgency"] },
};

export function getSignGlyph(sign: ZodiacSign): string {
  return SIGN_GLYPHS[sign] || '';
}

export function getSignInfo(sign: ZodiacSign): SignInfo {
  return SIGNS[sign];
}

export function buildSignTeaching(sign: ZodiacSign) {
  const info = getSignInfo(sign);
  const elementCard = { ...ELEMENT_MEANINGS[info.element], icon: ELEMENT_ICONS[info.element] };
  const modalityCard = MODALITY_MEANINGS[info.modality];

  const triad = ELEMENT_TRIADS[info.element];
  const comparison = (["Cardinal", "Fixed", "Mutable"] as Modality[]).map((m) => {
    const s = triad[m];
    return {
      sign: s,
      glyph: SIGN_GLYPHS[s],
      title: `${s} (${m} ${info.element})`,
      body: MODE_ROLE_COPY[m],
      isCurrent: s === sign,
    };
  });

  const closingLine =
    `${sign} doesn't ` +
    (info.modality === "Cardinal"
      ? `sustain the system (${triad.Fixed}) or refine it (${triad.Mutable}) — ${sign} starts the cycle.`
      : info.modality === "Fixed"
      ? `start the system (${triad.Cardinal}) or refine it (${triad.Mutable}) — ${sign} sustains and protects it.`
      : `build the system (${triad.Cardinal}) or preserve it (${triad.Fixed}) — ${sign} makes sure the system actually functions.`);

  const signProfile = SIGN_PROFILES[sign] || null;

  return { info, elementCard, modalityCard, comparison, closingLine, signProfile };
}

export function buildAxisTeaching(sign: ZodiacSign) {
  const info = getSignInfo(sign);
  const left = AXIS_TEACHER[sign];
  const right = AXIS_TEACHER[info.opposite];
  const leftGlyph = SIGN_GLYPHS[sign];
  const rightGlyph = SIGN_GLYPHS[info.opposite];

  const integrationQuestion = `Does my daily life support my deeper purpose — or am I functioning efficiently inside expectations that don't fit me?`;

  const axisStirredLine = (eclipseSign: ZodiacSign) =>
    eclipseSign === sign
      ? `Axis stirred: ${sign} (${left.title.split(': ')[1]?.toLowerCase() || ''}) + ${info.opposite} (${right.title.split(': ')[1]?.toLowerCase() || ''})`
      : `Axis stirred: ${info.opposite} (${right.title.split(': ')[1]?.toLowerCase() || ''}) + ${sign} (${left.title.split(': ')[1]?.toLowerCase() || ''})`;

  const closingLine = `On this axis, alignment is the bridge between ${right.title.split(': ')[1] || info.opposite} (${info.opposite}) and ${left.title.split(': ')[1] || sign} (${sign}).`;

  return { info, left, right, leftGlyph, rightGlyph, integrationQuestion, axisStirredLine, closingLine };
}
