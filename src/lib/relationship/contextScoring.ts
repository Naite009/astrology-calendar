/**
 * Context-specific relationship scoring.
 *
 * The old model averaged romantic + friendship + business + creative + family
 * scores and called the result "Overall Compatibility". That number is meaningless
 * for siblings (and for most real relationships), so it is gone.
 *
 * Here, each relationship kind has its OWN dimensions. The headline figure is only
 * produced for a single chosen kind, is explicitly an app-defined interpretive
 * index, is rounded to steps of 5 to avoid false precision, and always ships with
 * the contacts that produced it.
 */

import { CrossAspect, coreAspects, involves, involvesBoth, describeAspect } from './synastryEngine';
import { RelationshipContext, RelationshipKind } from './relationshipContext';

export type DimensionKey =
  | 'emotionalFit'
  | 'communication'
  | 'mutualSupport'
  | 'frictionRecovery'
  | 'sharedTemperament'
  | 'contactDepth'
  | 'warmthAndAttraction'
  | 'commitmentAndStability'
  | 'workAlignment'
  | 'creativeSpark';

export type ScoreBand = 'strong' | 'workable' | 'mixed' | 'needs-attention';

export interface ScoredDimension {
  key: DimensionKey;
  label: string;
  /** 5–95 index value in steps of 5. Not a probability. */
  score: number;
  band: ScoreBand;
  /** What the dimension measures, in plain language. */
  meaning: string;
  /** The exact contacts that moved this number. */
  evidence: string[];
}

export interface ContextScore {
  profile: RelationshipKind;
  /** e.g. "Sibling connection index". */
  label: string;
  /** null for the neutral profile — incompatible categories are never averaged. */
  overall: number | null;
  dimensions: ScoredDimension[];
  /** Always shown next to any number. */
  disclaimer: string;
  /** How the headline index was weighted, in plain words. */
  weightingNote: string;
}

const LUMINARIES = ['Sun', 'Moon'];
const MOON = ['Moon'];
const MERCURY = ['Mercury'];
const VENUS = ['Venus'];
const MARS = ['Mars'];
const SATURN = ['Saturn'];
const JUPITER = ['Jupiter'];
const SUN = ['Sun'];
const OUTER = ['Uranus', 'Neptune', 'Pluto'];
const PERSONAL = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const ANGLES = ['Ascendant', 'Midheaven'];
const SOFT = ['Venus', 'Jupiter', 'Moon'];

interface DimensionSpec {
  key: DimensionKey;
  label: string;
  meaning: string;
  /** Which contacts count, and how much. */
  match: (a: CrossAspect) => number;
}

/** A contact's supportive/tense contribution, before dimension weighting. */
function signedValue(a: CrossAspect): number {
  if (a.tone === 'flowing') return 1;
  if (a.tone === 'tense') return -0.7;
  if (a.tone === 'fusion') {
    // A conjunction is not automatically "powerful and good" — it depends on the bodies.
    const bodies = [a.fromBody, a.toBody];
    const easy = bodies.some((b) => SOFT.includes(b));
    const heavy = bodies.filter((b) => OUTER.includes(b) || b === 'Saturn').length;
    if (heavy >= 1 && !easy) return -0.2;
    if (heavy >= 1 && easy) return 0.3;
    return 0.8;
  }
  return 0.1;
}

const SPECS: Record<DimensionKey, DimensionSpec> = {
  emotionalFit: {
    key: 'emotionalFit',
    label: 'Emotional fit',
    meaning: 'How easily each person reads and settles the other\u2019s moods.',
    match: (a) =>
      involves(a, ...MOON) ? (involvesBoth(a, MOON, [...LUMINARIES, ...VENUS, 'Neptune', 'Moon']) ? 1 : 0.7) : 0,
  },
  communication: {
    key: 'communication',
    label: 'Communication',
    meaning: 'How information, explanations and everyday talk travel between them.',
    match: (a) => (involves(a, ...MERCURY) ? 1 : involves(a, 'Ascendant') && involves(a, ...MERCURY) ? 0.6 : 0),
  },
  mutualSupport: {
    key: 'mutualSupport',
    label: 'Mutual encouragement',
    meaning: 'How much each person\u2019s confidence grows in the other\u2019s company.',
    match: (a) =>
      involvesBoth(a, [...SUN, ...JUPITER, ...VENUS], [...PERSONAL, ...JUPITER, ...ANGLES]) ? 0.9 : 0,
  },
  frictionRecovery: {
    key: 'frictionRecovery',
    label: 'Friction & recovery',
    meaning: 'How disagreements start and how easily the pair comes back together.',
    match: (a) => (involves(a, ...MARS, ...SATURN, ...OUTER) ? 1 : 0),
  },
  sharedTemperament: {
    key: 'sharedTemperament',
    label: 'Shared temperament',
    meaning: 'How much of their basic rhythm and style overlaps.',
    match: (a) => (a.fromBody === a.toBody && PERSONAL.includes(a.fromBody) ? 1 : 0),
  },
  contactDepth: {
    key: 'contactDepth',
    label: 'Depth of contact',
    meaning: 'How much the two charts actually touch each other at all.',
    match: (a) => (a.weight >= 0.3 ? 0.6 : 0.2),
  },
  warmthAndAttraction: {
    key: 'warmthAndAttraction',
    label: 'Warmth & attraction',
    meaning: 'The pull toward each other and how affection is expressed.',
    match: (a) => (involvesBoth(a, VENUS, [...MARS, ...SUN, ...MOON, ...ANGLES, ...VENUS]) ? 1 : 0),
  },
  commitmentAndStability: {
    key: 'commitmentAndStability',
    label: 'Steadiness over time',
    meaning: 'Whether the bond has structure that holds when things get ordinary.',
    match: (a) => (involvesBoth(a, SATURN, [...PERSONAL, ...SATURN, ...ANGLES]) ? 1 : 0),
  },
  workAlignment: {
    key: 'workAlignment',
    label: 'Working alignment',
    meaning: 'How well effort, planning and follow-through line up.',
    match: (a) =>
      involvesBoth(a, [...SATURN, ...MARS, ...MERCURY, ...JUPITER], [...PERSONAL, ...SATURN, ...JUPITER, 'Midheaven'])
        ? 0.9
        : 0,
  },
  creativeSpark: {
    key: 'creativeSpark',
    label: 'Creative spark',
    meaning: 'How much imagination and fresh ideas the pair generates together.',
    match: (a) =>
      involvesBoth(a, [...VENUS, ...JUPITER, 'Neptune', 'Uranus', ...MERCURY], [...PERSONAL, 'Neptune', 'Uranus'])
        ? 0.9
        : 0,
  },
};

const PROFILE_DIMENSIONS: Record<RelationshipKind, DimensionKey[]> = {
  family: ['emotionalFit', 'communication', 'mutualSupport', 'frictionRecovery', 'sharedTemperament', 'contactDepth'],
  friendship: ['sharedTemperament', 'communication', 'mutualSupport', 'emotionalFit', 'frictionRecovery'],
  romantic: ['warmthAndAttraction', 'emotionalFit', 'communication', 'commitmentAndStability', 'frictionRecovery'],
  business: ['workAlignment', 'communication', 'commitmentAndStability', 'frictionRecovery', 'mutualSupport'],
  creative: ['creativeSpark', 'communication', 'sharedTemperament', 'mutualSupport', 'frictionRecovery'],
  neutral: [
    'emotionalFit',
    'communication',
    'mutualSupport',
    'frictionRecovery',
    'sharedTemperament',
    'contactDepth',
  ],
};

const TEEN_ROMANTIC_DIMENSIONS: DimensionKey[] = [
  'warmthAndAttraction',
  'emotionalFit',
  'communication',
  'mutualSupport',
  'frictionRecovery',
];

const PROFILE_LABEL: Record<RelationshipKind, string> = {
  family: 'Family connection index',
  friendship: 'Friendship index',
  romantic: 'Romantic connection index',
  business: 'Working-partnership index',
  creative: 'Creative-partnership index',
  neutral: 'Multi-dimensional profile',
};

const DISCLAIMER =
  'This is an app-defined interpretive index, not a scientific measurement, a probability, or a verdict. It is built only from the chart contacts listed beside it.';

function band(score: number): ScoreBand {
  if (score >= 70) return 'strong';
  if (score >= 55) return 'workable';
  if (score >= 40) return 'mixed';
  return 'needs-attention';
}

function round5(n: number): number {
  return Math.max(5, Math.min(95, Math.round(n / 5) * 5));
}

function scoreDimension(key: DimensionKey, aspects: CrossAspect[]): ScoredDimension {
  const spec = SPECS[key];
  const contributions = aspects
    .map((a) => ({ a, relevance: spec.match(a) }))
    .filter((c) => c.relevance > 0)
    .map((c) => ({ ...c, value: c.relevance * c.a.weight * signedValue(c.a) }));

  // Friction & recovery reads tension as its subject matter, not as a penalty:
  // lots of tense contacts lower it, but soft contacts elsewhere raise recovery.
  let raw = 50;
  for (const c of contributions) raw += c.value * 22;

  if (key === 'frictionRecovery') {
    const soothing = aspects.filter(
      (a) => (a.tone === 'flowing' || a.tone === 'fusion') && involves(a, ...SOFT)
    );
    raw += Math.min(15, soothing.length * 3);
  }

  const evidence = contributions
    .sort((x, y) => Math.abs(y.value) - Math.abs(x.value))
    .slice(0, 4)
    .map((c) => `${describeAspect(c.a)} — ${c.value >= 0 ? 'supports' : 'adds friction to'} this`);

  const score = round5(raw);
  return {
    key,
    label: spec.label,
    meaning: spec.meaning,
    score,
    band: band(score),
    evidence:
      evidence.length > 0
        ? evidence
        : ['No close contacts in this area, so this reads as neutral rather than strong or weak.'],
  };
}

/**
 * Score a pairing for ONE relationship context.
 * Only core bodies count — advanced points can never move a headline number.
 */
export function scoreRelationship(aspects: CrossAspect[], ctx: RelationshipContext): ContextScore {
  const core = coreAspects(aspects);
  // Teen dating is scored on age-appropriate dimensions: liking, emotional fit,
  // talking, encouragement and recovery after friction — never long-term
  // "steadiness over time", which is an adult-partnership question.
  const keys = ctx.isTeenRomance
    ? TEEN_ROMANTIC_DIMENSIONS
    : PROFILE_DIMENSIONS[ctx.scoringProfile];
  const dimensions = keys.map((k) => scoreDimension(k, core));

  const overall =
    ctx.scoringProfile === 'neutral'
      ? null
      : round5(dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length);

  const weightingNote =
    ctx.scoringProfile === 'neutral'
      ? 'Neutral mode shows each dimension on its own. Different relationship kinds are never averaged into a single number, because they measure different things.'
      : `The headline index is the plain average of the ${dimensions.length} dimensions below, each scored from the contacts listed under it. It is specific to a ${ctx.label.toLowerCase()} reading and is not comparable to a score from a different relationship kind.`;

  return {
    profile: ctx.scoringProfile,
    label: PROFILE_LABEL[ctx.scoringProfile],
    overall,
    dimensions,
    disclaimer: DISCLAIMER,
    weightingNote,
  };
}
