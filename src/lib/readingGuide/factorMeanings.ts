/**
 * Plain-language meanings for the Reading Guide translation chain.
 *
 * Every line here is written to be spoken out loud, and to be short enough to
 * sit on a chip: "Moon = emotional needs", "Capricorn = competence, progress".
 * Only the core bodies used by this tab appear (10 planets, Ascendant, nodes,
 * Chiron) so the flow cannot quietly widen to asteroids.
 */

export const CORE_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Ascendant', 'NorthNode', 'SouthNode', 'Chiron',
] as const;

export type CoreBody = typeof CORE_BODIES[number];

/** Bodies that can legitimately create a house concentration. */
export const HOUSE_CLUSTER_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const;

export const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'] as const;
export const OUTER_PLANETS = ['Uranus', 'Neptune', 'Pluto'] as const;

export const BODY_LABELS: Record<string, string> = {
  Sun: 'Sun',
  Moon: 'Moon',
  Mercury: 'Mercury',
  Venus: 'Venus',
  Mars: 'Mars',
  Jupiter: 'Jupiter',
  Saturn: 'Saturn',
  Uranus: 'Uranus',
  Neptune: 'Neptune',
  Pluto: 'Pluto',
  Ascendant: 'Ascendant',
  NorthNode: 'North Node',
  SouthNode: 'South Node',
  Chiron: 'Chiron',
};

export const BODY_MEANINGS: Record<string, string> = {
  Sun: 'core identity, what lights someone up',
  Moon: 'emotional needs, what feels comforting',
  Mercury: 'thinking and talking style',
  Venus: 'what feels good, how affection and taste work',
  Mars: 'drive, energy, how effort gets started',
  Jupiter: 'where growth and opportunity come more easily',
  Saturn: 'where patience and real skill build over time',
  Uranus: 'where a different approach appeals',
  Neptune: 'imagination, sensitivity, what blurs',
  Pluto: 'depth, intensity, what matters at full strength',
  Ascendant: 'first impression, the way of entering a situation',
  NorthNode: 'qualities worth developing alongside what is already easy',
  SouthNode: 'familiar skills and habits already in reserve',
  Chiron: 'an area of sensitivity that tends to become understanding',
};

export const SIGN_MEANINGS: Record<string, string> = {
  Aries: 'directness, starting things, quick action',
  Taurus: 'steadiness, comfort, doing things at a solid pace',
  Gemini: 'curiosity, variety, talking things through',
  Cancer: 'care, closeness, protecting what matters',
  Leo: 'warmth, presence, wanting effort to be seen',
  Virgo: 'precision, usefulness, improving the details',
  Libra: 'fairness, balance, wanting things to feel pleasant',
  Scorpio: 'depth, privacy, all-in focus',
  Sagittarius: 'freedom, big questions, wanting room to explore',
  Capricorn: 'responsibility, competence, visible progress',
  Aquarius: 'independence, fresh angles, doing it a different way',
  Pisces: 'imagination, empathy, soft edges',
};

export const SIGN_ELEMENT: Record<string, string> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

export const SIGN_MODALITY: Record<string, string> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

export const SIGN_RULER: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

export const ELEMENT_MEANINGS: Record<string, string> = {
  Fire: 'action, enthusiasm, momentum',
  Earth: 'tangible, practical results you can point at',
  Air: 'ideas, words, thinking it through',
  Water: 'feeling, atmosphere, emotional current',
};

export const MODALITY_MEANINGS: Record<string, string> = {
  Cardinal: 'starting things and setting direction',
  Fixed: 'staying with something once it is chosen',
  Mutable: 'adjusting and switching as things change',
};

/** How a low element reads — as a pattern, never as a missing human quality. */
export const LOW_ELEMENT_READING: Record<string, { headline: string; lines: string[] }> = {
  Water: {
    headline: 'Feelings may not be the first language used',
    lines: [
      'feelings are usually there, they just may not be the first thing put into words',
      'processing often happens through doing, thinking, organising, or holding it privately first',
      'emotional expression can be selective — shown to a few people rather than broadly',
    ],
  },
  Fire: {
    headline: 'Momentum may build rather than ignite',
    lines: [
      'enthusiasm can be real but quieter, and may show in follow-through more than in a spark',
      'a reason to act often matters more than a burst of excitement',
      'encouragement and a clear first step can help more than being told to just go for it',
    ],
  },
  Earth: {
    headline: 'Practical structure may be learned rather than automatic',
    lines: [
      'ideas and feelings can arrive faster than the plan that carries them',
      'routines, checklists, and physical anchors often help more than willpower',
      'finishing can feel less interesting than starting, so visible progress markers help',
    ],
  },
  Air: {
    headline: 'Explaining may come after knowing',
    lines: [
      'a conclusion can be reached by feel or by doing before it can be put into words',
      'thinking out loud with someone trusted often helps sort things out',
      'time to draft an answer may produce a much clearer one than being asked on the spot',
    ],
  },
};

export const HOUSE_KEYWORDS: Record<number, string> = {
  1: 'self, presence, first impressions',
  2: 'value, security, self-worth',
  3: 'talking, learning, everyday exchange',
  4: 'home, family, private life, emotional foundation',
  5: 'creativity, fun, hobbies, confidence, self-expression',
  6: 'routines, practice, skill-building, responsibility',
  7: 'one-to-one closeness, trust, fairness',
  8: 'depth, privacy, trust, what is shared',
  9: 'beliefs, big-picture learning, exploring',
  10: 'direction, being seen for competence',
  11: 'friends, groups, belonging, hopes',
  12: 'inner life, imagination, rest',
};

export function bodyLabel(name: string): string {
  return BODY_LABELS[name] ?? name;
}

export function factorChip(name: string): string {
  const meaning = BODY_MEANINGS[name];
  return meaning ? `${bodyLabel(name)} = ${meaning}` : bodyLabel(name);
}
