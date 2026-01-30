/**
 * Retrograde Planet-Sign Combinations Library
 * 
 * Based on research from:
 * - Steven Forrest (Evolutionary Astrology)
 * - Liz Greene (Psychological Astrology)
 * - Chani Nicholas (Modern Psychological)
 * - Erin Sullivan (Retrograde Planets: Traversing the Inner Landscape)
 * - Traditional Hellenistic sources (Chris Brennan)
 */

export interface RetrogradeSignCombo {
  planet: string;
  sign: string;
  title: string;
  summary: string;
  gifts: string[];
  challenges: string[];
  internalExpression: string;
  sources?: string[];
}

// Core retrograde modifiers for each planet (applies regardless of sign)
export const RETROGRADE_PLANET_MODIFIERS: Record<string, {
  internal: string;
  coreGifts: string[];
  coreChallenges: string[];
  evolutionaryPurpose: string;
}> = {
  Mercury: {
    internal: "The mind turns inward, processing information through reflection rather than reaction. Communication becomes more considered, often emerging as writing, poetry, or deep listening. Past conversations and unfinished mental threads resurface for integration.",
    coreGifts: [
      "Profound introspection before speaking",
      "Non-linear, creative thinking patterns",
      "Ability to catch what others miss",
      "Deep revision and editing skills",
      "Immunity to 'group think' (Steven Forrest)",
    ],
    coreChallenges: [
      "Thoughts percolate longer before expression",
      "May be perceived as slow or hesitant",
      "Second-guessing decisions",
      "Mental processing requires more time",
    ],
    evolutionaryPurpose: "To develop inner intellectual authority and think independently from the collective narrative.",
  },
  Venus: {
    internal: "Love and values become an inner journey. Self-worth is cultivated from within rather than through external validation. Aesthetics and relationships require deeper contemplation before commitment.",
    coreGifts: [
      "Deep self-love cultivation",
      "Refined, personal aesthetic sense",
      "Values that resist social pressure",
      "Capacity for profound intimacy once opened",
      "Recognition of soul connections",
    ],
    coreChallenges: [
      "May seem reserved in expressing affection",
      "Slower to commit in relationships",
      "Past relationship patterns resurface",
      "Financial decisions need more reflection",
    ],
    evolutionaryPurpose: "To heal ancient heart wounds and discover what truly brings lasting pleasure beyond social conditioning.",
  },
  Mars: {
    internal: "Drive and assertion turn inward. Action is preceded by strategic reflection. Anger becomes a teacher rather than an automatic response. Energy is conserved for what truly matters.",
    coreGifts: [
      "Strategic patience and timing",
      "Internal motivation that doesn't need external validation",
      "Ability to finish what others start",
      "Channeled anger as fuel for transformation",
      "Non-competitive strength",
    ],
    coreChallenges: [
      "May hesitate before initiating",
      "Energy can feel blocked or redirected",
      "Past conflicts arise for resolution",
      "Physical vitality needs conscious cultivation",
    ],
    evolutionaryPurpose: "To master the warrior energy within, learning when NOT to act is as powerful as action.",
  },
  Jupiter: {
    internal: "Growth and expansion become internal quests. Wisdom is sought through contemplation rather than external adventure. Faith is questioned, refined, and ultimately deepened through inner work.",
    coreGifts: [
      "Inner abundance not dependent on external success",
      "Philosophical depth through quiet reflection",
      "Wisdom that emerges from life review",
      "Spiritual growth through introspection",
      "Teaching through being rather than doing",
    ],
    coreChallenges: [
      "Opportunities may bloom later (Steven Forrest: 'million dollar ideas' held within)",
      "Faith in the universe needs periodic renewal",
      "External luck seems delayed",
      "May doubt their own vision",
    ],
    evolutionaryPurpose: "To discover that true abundance is an inside job—prosperity consciousness that doesn't depend on circumstances.",
  },
  Saturn: {
    internal: "Authority and structure are internalized. Self-discipline emerges from within rather than external enforcement. Karmic lessons from past lives resurface for final mastery.",
    coreGifts: [
      "Internal authority that doesn't need external approval",
      "Self-imposed discipline and structure",
      "Mastery of lessons from the past",
      "Boundary-setting from inner knowing",
      "Wisdom beyond their years (internalized elder)",
    ],
    coreChallenges: [
      "Self-criticism can be harsh",
      "May feel tested or blocked",
      "Old fears resurface for healing",
      "Rewards come through inner work first",
    ],
    evolutionaryPurpose: "To become one's own authority, completing karmic contracts and building internal foundations.",
  },
  Uranus: {
    internal: "Revolution happens within before it manifests externally. Liberation from internal limitations takes precedence over external rebellion. Insights arrive as sudden downloads from the unconscious.",
    coreGifts: [
      "Internal liberation from conditioning",
      "Sudden insights and downloads",
      "Freedom from needing to be 'normal'",
      "Revolutionary thinking kept private until ready",
      "Authentic self-discovery process",
    ],
    coreChallenges: [
      "May feel different but unable to express it",
      "Inner restlessness without clear outlet",
      "Unexpected internal shifts",
      "Difficulty with sudden external changes",
    ],
    evolutionaryPurpose: "To break free from ancestral and societal programming from the inside out.",
  },
  Neptune: {
    internal: "Spirituality and creativity plunge deeply inward. Dreams and visions become more vivid and meaningful. The mystical journey is primarily a private, interior experience.",
    coreGifts: [
      "Profound inner visions and dreams",
      "Shamanic inward intensity (Steven Forrest)",
      "Subconscious healing abilities",
      "Artistic inspiration from deep within",
      "Dissolving inner illusions before outer ones",
    ],
    coreChallenges: [
      "Boundary between inner and outer can blur",
      "May struggle to manifest dreams externally",
      "Escapism into inner worlds",
      "Confusion about reality vs. imagination",
    ],
    evolutionaryPurpose: "To access the collective unconscious and bring back treasures for healing and art.",
  },
  Pluto: {
    internal: "Transformation is deeply personal and private. Power is discovered within the psyche. Shadow work becomes the primary path to empowerment.",
    coreGifts: [
      "Deep psychological insight",
      "Internal power reclamation",
      "Private transformation process",
      "Ancestral healing work",
      "Releasing hidden fears from within",
    ],
    coreChallenges: [
      "Obsessive thought patterns may intensify",
      "Power dynamics play out internally",
      "Difficulty sharing the transformation process",
      "Intense inner processing required",
    ],
    evolutionaryPurpose: "To reclaim power that was lost in past lives through deep internal alchemy.",
  },
  Chiron: {
    internal: "The wounded healer turns healing inward first. Past wounds resurface for final integration. Teaching comes through embodied healing, not theoretical knowledge.",
    coreGifts: [
      "Self-healing mastery",
      "Integration of old wounds",
      "Teaching from healed experience",
      "Deep compassion for self",
    ],
    coreChallenges: [
      "Old wounds reopen for healing",
      "May feel 'unhealable' temporarily",
      "Resistance to accepting help",
    ],
    evolutionaryPurpose: "To complete the healing journey begun in past lives and become a wounded healer.",
  },
};

// Specific Retrograde Planet + Sign combinations with detailed interpretations
export const RETROGRADE_SIGN_COMBOS: RetrogradeSignCombo[] = [
  // JUPITER RETROGRADE COMBOS (Based on user request + research)
  {
    planet: "Jupiter",
    sign: "Taurus",
    title: "The Internal Abundance Builder",
    summary: "Jupiter retrograde in Taurus creates a soul that must build prosperity consciousness from within before external wealth can stabilize. The 'million dollar ideas' (Steven Forrest) are there, but they bloom through patient internal cultivation rather than aggressive external pursuit.",
    gifts: [
      "Deep, sustainable abundance mindset",
      "Values that prioritize quality over quantity",
      "Slow-building wealth that lasts",
      "Appreciation of simple, sensual pleasures",
      "Teaching others about true security",
    ],
    challenges: [
      "Financial growth feels slower than peers",
      "Must overcome inherited scarcity beliefs",
      "Tendency to undervalue their gifts",
      "May hoard ideas instead of acting on them",
    ],
    internalExpression: "Abundance is not something to chase—it's something to cultivate within. Your sense of prosperity must grow from internal roots before the external garden can flourish. You may have 'Taurean wealth karma' to resolve from past lives where resources were misused or hoarded.",
    sources: ["Steven Forrest", "Liz Greene"],
  },
  {
    planet: "Jupiter",
    sign: "Pisces",
    title: "The Mystic's Faith Journey",
    summary: "Jupiter retrograde in Pisces (one of Jupiter's home signs) creates profound spiritual depth that unfolds through inner mystical experiences. Faith is tested internally before being shared, creating genuine spiritual authority.",
    gifts: [
      "Profound inner mystical experiences",
      "Faith that survives doubt",
      "Intuition that operates quietly but accurately",
      "Compassion rooted in inner wisdom",
      "Artistic/spiritual vision that matures slowly",
    ],
    challenges: [
      "Spiritual bypassing temptation",
      "May doubt their genuine spiritual gifts",
      "Boundaries in spiritual practice",
      "Overwhelm from psychic impressions",
    ],
    internalExpression: "Your faith must be born from inner knowing, not external teachings. You carry spiritual wisdom from past lives that needs to be remembered rather than learned. The divine speaks to you in dreams and quiet moments.",
    sources: ["Chani Nicholas", "Erin Sullivan"],
  },
  {
    planet: "Jupiter",
    sign: "Sagittarius",
    title: "The Philosopher's Inner Quest",
    summary: "Jupiter retrograde in its home sign of Sagittarius creates a philosopher whose greatest journeys are internal. Truth-seeking happens through contemplation rather than external adventure. Teaching emerges from lived wisdom.",
    gifts: [
      "Philosophical depth through inner exploration",
      "Teaching from embodied experience",
      "Faith tested and proven true",
      "Wisdom that transcends cultural conditioning",
      "Vision that develops through patience",
    ],
    challenges: [
      "May feel restless without external adventure",
      "Doubt about their own truth",
      "Difficulty sharing insights publicly",
      "Impatience with slow belief development",
    ],
    internalExpression: "The greatest journey is inward. Your truth must be discovered through inner questioning before you can become a genuine teacher. You are meant to think independently from collective beliefs.",
    sources: ["Steven Forrest"],
  },

  // MERCURY RETROGRADE COMBOS
  {
    planet: "Mercury",
    sign: "Pisces",
    title: "The Dreaming Mind",
    summary: "Mercury retrograde in Pisces (its fall and detriment) creates a mind that thinks in images, symbols, and feelings rather than linear logic. This placement excels at artistic and intuitive communication that bypasses ordinary consciousness.",
    gifts: [
      "Thinking in symbols and metaphors",
      "Poetry and artistic expression",
      "Psychic/intuitive communication",
      "Understanding beyond words",
      "Creative non-linear problem-solving",
    ],
    challenges: [
      "Linear thinking feels foreign",
      "May be misunderstood when speaking",
      "Mental boundaries with others' thoughts",
      "Grounding abstract impressions",
    ],
    internalExpression: "Your mind operates through the dreamscape. Logical thinking is not your native language—imagery, music, and feeling-tones are. Trust the impressions that come through the back door of consciousness.",
    sources: ["Liz Greene", "Steven Forrest"],
  },
  {
    planet: "Mercury",
    sign: "Gemini",
    title: "The Internal Dialogue Master",
    summary: "Mercury retrograde in its home sign of Gemini creates a mind in constant internal dialogue. Ideas are refined through extensive inner processing before being shared. Writing and editing become natural strengths.",
    gifts: [
      "Masterful internal dialogue",
      "Excellent editing and revision skills",
      "Thinks several moves ahead",
      "Deep listener who catches nuance",
      "Versatile but considered thinking",
    ],
    challenges: [
      "May seem quiet when thinking deeply",
      "Over-processing before speaking",
      "Internal debates can delay decisions",
      "Others may not see the internal brilliance",
    ],
    internalExpression: "Your mind is a constant conversation with itself—refining, questioning, playing with ideas before they emerge. The novelist with reams of unpublished poetry (Steven Forrest) could be your archetype if you don't learn to share.",
    sources: ["Steven Forrest"],
  },
  {
    planet: "Mercury",
    sign: "Virgo",
    title: "The Internal Analyst",
    summary: "Mercury retrograde in its home sign of Virgo creates a mind that analyzes everything internally before speaking. Criticism is turned inward first, creating either self-improvement mastery or harsh self-judgment.",
    gifts: [
      "Meticulous internal analysis",
      "Catches errors others miss",
      "Self-improvement through reflection",
      "Practical wisdom that develops slowly",
      "Discrimination refined through experience",
    ],
    challenges: [
      "Self-criticism can be excessive",
      "Perfectionism delays expression",
      "May analyze instead of act",
      "Health concerns processed internally",
    ],
    internalExpression: "Your analytical gifts are directed inward first. You must learn discernment about what criticism serves growth versus what is merely self-attack. Your practical wisdom emerges from lived experience.",
    sources: ["Liz Greene"],
  },

  // VENUS RETROGRADE COMBOS
  {
    planet: "Venus",
    sign: "Scorpio",
    title: "The Alchemist of Love",
    summary: "Venus retrograde in Scorpio (its detriment) creates a soul that transforms through intimate relationship experiences. Love becomes a crucible for psychological depth. Past-life love karma surfaces intensely.",
    gifts: [
      "Profound emotional intimacy once trust is earned",
      "Transformative power in relationships",
      "Psychological insight into love patterns",
      "Intensity that creates lasting bonds",
      "Healing others through deep relating",
    ],
    challenges: [
      "Trust is slowly, carefully given",
      "Past betrayals may resurface",
      "Jealousy or possessiveness as protection",
      "Fear of vulnerability in love",
    ],
    internalExpression: "Love for you is never casual—it's alchemical. You must transform your relationship with desire, trust, and power before external love can fully blossom. Past-life love wounds are here for final healing.",
    sources: ["Erin Sullivan", "Liz Greene"],
  },
  {
    planet: "Venus",
    sign: "Libra",
    title: "The Inner Aesthete",
    summary: "Venus retrograde in its home sign of Libra creates refined aesthetic sense and relationship values that develop through internal contemplation. Harmony is sought within before it can be created externally.",
    gifts: [
      "Refined personal aesthetic",
      "Relationship values immune to trends",
      "Diplomatic wisdom from inner reflection",
      "Beauty appreciation that deepens over time",
      "Partnership ideals worth waiting for",
    ],
    challenges: [
      "May delay relationships seeking perfection",
      "Internal debates about partnership choices",
      "Harmony with self must come first",
      "Others may not see the inner beauty work",
    ],
    internalExpression: "Your sense of beauty and harmony must be discovered within before you can create it in relationships and art. You are refining your aesthetic over lifetimes.",
    sources: ["Chani Nicholas"],
  },
  {
    planet: "Venus",
    sign: "Aries",
    title: "The Independent Lover",
    summary: "Venus retrograde in Aries (its detriment) creates a soul learning to balance fierce independence with intimate relating. Self-love must be established before partnership can thrive.",
    gifts: [
      "Strong sense of self in relationships",
      "Courage to love authentically",
      "Independence within partnership",
      "Pioneering in matters of love",
      "Honest, direct affection",
    ],
    challenges: [
      "May struggle with relationship give-and-take",
      "Self-focus can overshadow partner",
      "Impatience with relationship process",
      "Learning to receive as well as give",
    ],
    internalExpression: "Your journey is to discover that self-love and loving another are not opposites. Independence and intimacy must be woven together through inner work.",
    sources: ["Chani Nicholas"],
  },

  // SATURN RETROGRADE COMBOS
  {
    planet: "Saturn",
    sign: "Capricorn",
    title: "The Internal Authority",
    summary: "Saturn retrograde in its home sign creates a soul building internal authority through self-discipline. External success comes only after internal structures are sound. May feel tested repeatedly until mastery is achieved.",
    gifts: [
      "Unshakeable internal discipline",
      "Authority that doesn't need titles",
      "Mastery through patient practice",
      "Wisdom beyond their years",
      "Leadership through being, not demanding",
    ],
    challenges: [
      "Self-imposed standards may be harsh",
      "External recognition comes slowly",
      "Feeling constantly tested",
      "May resist external authority",
    ],
    internalExpression: "You are becoming your own authority—not by defeating external figures, but by building unshakeable internal structures. The world will recognize what you've built within.",
    sources: ["Steven Forrest", "Liz Greene"],
  },
  {
    planet: "Saturn",
    sign: "Aquarius",
    title: "The Revolutionary Elder",
    summary: "Saturn retrograde in Aquarius creates a soul working on internal liberation from social conditioning. The inner rebel must mature before external change-making can be effective.",
    gifts: [
      "Freedom from group-think",
      "Revolutionary ideas developed internally",
      "Humanitarian vision that matures slowly",
      "Detachment that serves wisdom",
      "Future-oriented thinking grounded in self-knowledge",
    ],
    challenges: [
      "May feel alienated from groups",
      "Difficulty implementing visionary ideas",
      "Internal conflict between belonging and freedom",
      "Old conditioning about 'fitting in' resurfaces",
    ],
    internalExpression: "You must liberate yourself from internalized social programming before you can help liberate others. Your unique genius needs time to develop in private.",
    sources: ["Steven Forrest"],
  },

  // MARS RETROGRADE COMBOS
  {
    planet: "Mars",
    sign: "Aries",
    title: "The Internal Warrior",
    summary: "Mars retrograde in its home sign creates a warrior whose battles are primarily internal. Action is preceded by strategic internal preparation. Physical energy may need conscious cultivation.",
    gifts: [
      "Strategic internal preparation",
      "Action that emerges from deep consideration",
      "Courage that doesn't need to prove itself",
      "Internal fire that burns steady",
      "Knowing when NOT to act",
    ],
    challenges: [
      "May hesitate at crucial moments",
      "Internal anger needs conscious processing",
      "Physical energy fluctuates",
      "Others may underestimate their power",
    ],
    internalExpression: "Your warrior energy is directed inward first. You are learning that true strength includes the power to wait, to not react, to choose your battles from wisdom rather than impulse.",
    sources: ["Steven Forrest"],
  },
  {
    planet: "Mars",
    sign: "Scorpio",
    title: "The Psychological Warrior",
    summary: "Mars retrograde in Scorpio (traditional ruler) creates intense internal transformation through facing psychological depths. Power is reclaimed through shadow work rather than external conquest.",
    gifts: [
      "Psychological depth and fearlessness",
      "Transformation through internal alchemy",
      "Strategic patience in conflict",
      "Power reclaimed from the depths",
      "Ability to face what others avoid",
    ],
    challenges: [
      "Intensity can be overwhelming internally",
      "Old rage may surface for healing",
      "Power dynamics play out in the psyche",
      "Trust issues with own instincts",
    ],
    internalExpression: "Your power is found in the psychological depths. You must face your own shadow—your fears, your rage, your desire for control—before you can wield power wisely in the world.",
    sources: ["Liz Greene", "Erin Sullivan"],
  },
  {
    planet: "Mars",
    sign: "Cancer",
    title: "The Emotional Warrior",
    summary: "Mars retrograde in Cancer (its fall) creates a warrior whose battles involve emotional territory—family, home, belonging. Protective instincts are processed internally before action.",
    gifts: [
      "Fierce protector of loved ones",
      "Emotional courage",
      "Fighting for home and family",
      "Nurturing strength",
      "Tenacity in emotional matters",
    ],
    challenges: [
      "Anger may be suppressed or passive",
      "Family patterns of conflict resurface",
      "Difficulty with direct confrontation",
      "Emotional battles may feel exhausting",
    ],
    internalExpression: "Your warrior energy is channeled through emotional and family realms. You must heal old wounds around home and belonging before you can protect others effectively.",
    sources: ["Liz Greene"],
  },

  // NEPTUNE RETROGRADE COMBOS
  {
    planet: "Neptune",
    sign: "Pisces",
    title: "The Deep Mystic",
    summary: "Neptune retrograde in its home sign creates 'shamanic inward intensity' (Steven Forrest). Mystical experiences are profound and private. Artistic and spiritual gifts develop through deep inner work.",
    gifts: [
      "Profound mystical experiences",
      "Direct access to the collective unconscious",
      "Artistic vision from inner depths",
      "Healing presence without effort",
      "Dreams as spiritual guidance",
    ],
    challenges: [
      "Boundaries between self and other blur",
      "May get lost in inner worlds",
      "Difficulty manifesting spiritual gifts",
      "Overwhelm from psychic sensitivity",
    ],
    internalExpression: "You are a mystic whose primary temple is within. Your spiritual experiences are too profound for ordinary language. Learn to trust your inner visions without needing external validation.",
    sources: ["Steven Forrest"],
  },

  // PLUTO RETROGRADE COMBOS
  {
    planet: "Pluto",
    sign: "Scorpio",
    title: "The Internal Alchemist",
    summary: "Pluto retrograde in its home sign creates a soul doing deep transformative work in private. Power is reclaimed through internal shadow integration. The phoenix rises from internal ashes.",
    gifts: [
      "Profound psychological insight",
      "Transformation through inner alchemy",
      "Power reclaimed from the depths",
      "Fearlessness with shadow material",
      "Regeneration through inner work",
    ],
    challenges: [
      "Intensity can be isolating",
      "Obsessive thought patterns",
      "Difficulty sharing transformation journey",
      "Old traumas surface for healing",
    ],
    internalExpression: "Your transformation is an inside job. You are doing the deepest shadow work, reclaiming power that was lost in past lives. The world will see the results without knowing the process.",
    sources: ["Erin Sullivan", "Liz Greene"],
  },

  // URANUS RETROGRADE COMBOS
  {
    planet: "Uranus",
    sign: "Aquarius",
    title: "The Internal Revolutionary",
    summary: "Uranus retrograde in its home sign creates a revolutionary whose liberation happens within first. Original ideas develop privately before emerging to change the world.",
    gifts: [
      "Original thinking immune to trends",
      "Inner freedom from conditioning",
      "Revolutionary insights developed in private",
      "Genius that emerges unexpectedly",
      "Humanitarian vision refined internally",
    ],
    challenges: [
      "May feel alien without knowing why",
      "Difficulty expressing unique perspective",
      "Inner restlessness seeking outlet",
      "Resistance to being 'normalized'",
    ],
    internalExpression: "You are liberating yourself from within. Your unique genius needs time to develop privately before it can change the outer world. Trust the strange insights that come through.",
    sources: ["Steven Forrest"],
  },
];

// Helper function to find retrograde combo by planet and sign
export const findRetrogradeSignCombo = (planet: string, sign: string): RetrogradeSignCombo | undefined => {
  return RETROGRADE_SIGN_COMBOS.find(
    combo => combo.planet === planet && combo.sign === sign
  );
};

// Helper function to get base retrograde modifier for a planet
export const getRetrogradePlanetModifier = (planet: string) => {
  return RETROGRADE_PLANET_MODIFIERS[planet];
};

// Get combined interpretation for planet + sign retrograde
export const getRetrogradeInterpretation = (planet: string, sign: string): {
  hasSpecificCombo: boolean;
  modifier: typeof RETROGRADE_PLANET_MODIFIERS[string] | undefined;
  signCombo: RetrogradeSignCombo | undefined;
  synthesizedInterpretation: string;
} => {
  const modifier = RETROGRADE_PLANET_MODIFIERS[planet];
  const signCombo = findRetrogradeSignCombo(planet, sign);
  
  // Create synthesized interpretation if no specific combo exists
  let synthesizedInterpretation = "";
  if (!signCombo && modifier) {
    synthesizedInterpretation = `${planet} retrograde in ${sign}: ${modifier.internal} The ${sign} influence adds its particular coloring to this internal process, expressing the ${planet} archetype through a more contemplative, reflective lens.`;
  }
  
  return {
    hasSpecificCombo: !!signCombo,
    modifier,
    signCombo,
    synthesizedInterpretation,
  };
};
