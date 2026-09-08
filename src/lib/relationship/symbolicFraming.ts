/**
 * CANONICAL framing for the optional symbolic / spiritual relationship layer.
 *
 * The app's karmic scoring is an internal weighting of specific chart contacts.
 * It is NOT an empirical probability of anything, so nothing here may be
 * presented as a measured likelihood ("33% past life probability") or as an
 * opaque verdict ("Twin Flame Connection"). Every symbolic statement must be
 * clearly labelled interpretive and must name the contacts that produced it.
 */

export const SYMBOLIC_LENS_HEADING = 'Symbolic spiritual theme (optional lens)';

export const SYMBOLIC_LENS_NOTE =
  'This is an interpretive symbolic lens, not a measurement. The numbers below are this app\u2019s internal weighting of specific chart contacts, not probabilities, evidence of past lives, or predictions. Read it as imagery you can take or leave.';

export type SymbolicThemeKey =
  | 'twin_flame'
  | 'completion'
  | 'catalyst'
  | 'soul_family'
  | 'karmic_lesson'
  | 'new_contract';

export interface SymbolicTheme {
  /** Plain, non-diagnostic label. */
  label: string;
  /** What the theme means, phrased as a possibility. */
  description: string;
  /** Which chart factors push a pair into this theme, in plain English. */
  chartBasis: string;
}

export const SYMBOLIC_THEMES: Record<SymbolicThemeKey, SymbolicTheme> = {
  twin_flame: {
    label: 'Mirror and intensity theme',
    description:
      'Symbolically, this pairing is often read as a mirror: each may see something of themselves in the other, and the connection tends not to feel casual. That is imagery about intensity, not a category either person belongs to.',
    chartBasis:
      'Produced by close Pluto and Sun/Moon contacts between the two charts, usually together with a nodal contact.',
  },
  completion: {
    label: 'Unfinished-business theme',
    description:
      'Symbolically read as picking up something that feels already in progress. In practice it often shows up as familiar-feeling patterns that both keep choosing, which either can change.',
    chartBasis:
      'Produced mainly by South Node and Saturn contacts between the two charts.',
  },
  catalyst: {
    label: 'Catalyst theme',
    description:
      'Symbolically read as a connection that speeds things up and shifts how each person sees things. It says nothing about how long the relationship lasts.',
    chartBasis:
      'Produced by close Uranus and Pluto contacts to personal planets between the two charts.',
  },
  soul_family: {
    label: 'Ease and support theme',
    description:
      'Symbolically read as a comfortable, supportive pairing where being around each other takes little effort. Ease still has to be maintained by how both behave.',
    chartBasis:
      'Produced by flowing contacts between personal planets, with few hard Saturn or Pluto contacts.',
  },
  karmic_lesson: {
    label: 'Learning and maturity theme',
    description:
      'Symbolically read as a pairing where each may develop patience, skill or perspective over time. That is growth language, not a debt to be paid.',
    chartBasis:
      'Produced mainly by Saturn contacts to personal planets between the two charts.',
  },
  new_contract: {
    label: 'Fresh-start theme',
    description:
      'Symbolically read as something being built from scratch rather than repeated. Few of the heavier symbolic markers appear between these charts.',
    chartBasis:
      'Assigned when node, Saturn and Pluto contacts between the charts are sparse or wide.',
  },
};

export function symbolicTheme(key: string): SymbolicTheme {
  return SYMBOLIC_THEMES[key as SymbolicThemeKey] ?? SYMBOLIC_THEMES.new_contract;
}

/** Word label for the internal weighting. Never a percentage of likelihood. */
export function symbolicEmphasisLabel(score: number): string {
  if (score >= 60) return 'strong symbolic emphasis';
  if (score >= 30) return 'moderate symbolic emphasis';
  return 'light symbolic emphasis';
}

/** Sentence used wherever the old "Past Life Probability: 33%" line appeared. */
export function symbolicEmphasisLine(score: number, supportingContacts: string[] = []): string {
  const base = `This pair shows ${symbolicEmphasisLabel(score)} on the symbolic markers this app tracks (internal weighting ${Math.round(
    score
  )} of 100, not a probability).`;
  if (supportingContacts.length === 0) return base;
  return `${base} It comes from: ${supportingContacts.slice(0, 4).join('; ')}.`;
}

/** Label for the internal share numbers, so no one reads them as measured odds. */
export function symbolicShareLine(label: string, pct: number): string {
  return `${label}: ${pct}% of this app\u2019s symbolic weighting for this pair (an internal share of the contacts found, not a probability).`;
}

/** Phrases that must never be used as factual classifications anywhere. */
export const FORBIDDEN_SYMBOLIC_PHRASES = [
  'twin flame',
  'past life probability',
  'fated love',
  'destined romantic meeting',
  'meant to be',
  'soul contract',
  'karmic debt',
  'obsessive',
  'obsessed',
  "can't keep hands off",
  'cant keep hands off',
  'dominance and surrender',
];
