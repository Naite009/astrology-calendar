/**
 * Interpretation transparency + evidence hierarchy — the one place the app decides
 * how strong a claim is allowed to be, what may outrank what, and what a signature
 * does NOT mean.
 *
 * Every interpretive surface (natal portrait, Reading Guide, synastry, composite,
 * PDF/report builders) imports from here instead of re-deciding locally.
 *
 * Three rules it enforces:
 *   1. EVIDENCE TIERS — primary (majors, angles, real aspects/houses/patterns) >
 *      secondary (nodes, Chiron) > supplemental (asteroids, Lilith, Vertex, PoF,
 *      Eros...). Supplemental factors can never outrank a primary signature.
 *   2. SIGNAL STRENGTH — a plain evidence-strength label, never a probability.
 *   3. "WHAT THIS DOES NOT MEAN" — concise, reusable clarifications for the
 *      signatures readers most often over-read.
 */

import { MAJOR_PLANETS, isMajorPlanet } from './bodyTaxonomy';

// ── 1. Evidence hierarchy ───────────────────────────────────────────────────

export type EvidenceTier = 'primary' | 'secondary' | 'supplemental';

export const PRIMARY_ANGLES = ['Ascendant', 'Descendant', 'MC', 'IC', 'DC', 'Midheaven'] as const;

/** Meaningful, but must not automatically outrank several major-planet factors. */
export const SECONDARY_POINTS = ['NorthNode', 'SouthNode', 'Chiron', 'North Node', 'South Node'] as const;

const ANGLE_SET = new Set<string>(PRIMARY_ANGLES);
const SECONDARY_SET = new Set<string>(SECONDARY_POINTS);

export const EVIDENCE_TIER_LABEL: Record<EvidenceTier, string> = {
  primary: 'Primary evidence',
  secondary: 'Secondary evidence',
  supplemental: 'Supplemental detail',
};

export const EVIDENCE_TIER_NOTE: Record<EvidenceTier, string> = {
  primary:
    'Major planets, the angles, real aspects between them, angularity, genuine house concentrations, the chart ruler and major patterns. These lead a reading.',
  secondary:
    'The lunar nodes and Chiron. Worth mentioning, but they do not outrank several major-planet factors pointing the other way.',
  supplemental:
    'Minor bodies and points (Juno, Ceres, Pallas, Vesta, Lilith, Vertex, Part of Fortune, Eros and similar). Supporting colour only, unless a minor-body deep dive was chosen.',
};

/** Numeric weight used for ranking. Ordering only, not a score shown to users. */
export const EVIDENCE_TIER_WEIGHT: Record<EvidenceTier, number> = {
  primary: 1,
  secondary: 0.55,
  supplemental: 0.2,
};

export function evidenceTier(body: string): EvidenceTier {
  const name = (body || '').trim();
  if (isMajorPlanet(name) || ANGLE_SET.has(name)) return 'primary';
  if (SECONDARY_SET.has(name)) return 'secondary';
  return 'supplemental';
}

/** Tier of a contact/pattern: the lowest tier of the bodies involved. */
export function contactTier(bodies: string[]): EvidenceTier {
  const tiers = bodies.map(evidenceTier);
  if (tiers.includes('supplemental')) return 'supplemental';
  if (tiers.includes('secondary')) return 'secondary';
  return 'primary';
}

export interface TieredItem {
  /** Bodies/points the item rests on. */
  bodies: string[];
  /** Local importance, any positive scale. */
  weight?: number;
}

/**
 * Rank by tier first, then by local weight. Guarantees that no number of
 * supplemental contacts can float above a primary one in a summary.
 */
export function rankByEvidence<T extends TieredItem>(items: T[]): T[] {
  return [...items]
    .map((item, index) => ({ item, index, tier: contactTier(item.bodies) }))
    .sort((a, b) => {
      const t = EVIDENCE_TIER_WEIGHT[b.tier] - EVIDENCE_TIER_WEIGHT[a.tier];
      if (t !== 0) return t;
      const w = (b.item.weight ?? 0) - (a.item.weight ?? 0);
      if (w !== 0) return w;
      return a.index - b.index;
    })
    .map((entry) => entry.item);
}

// ── 2. Top factors first ────────────────────────────────────────────────────

export const TOP_FACTOR_MIN = 5;
export const TOP_FACTOR_MAX = 8;

export const EXPLORE_DEEPER_LABEL = 'Explore deeper';
export const EXPLORE_DEEPER_NOTE =
  'Full aspect lists, minor bodies, technical detail and secondary themes live here so the main reading stays readable.';

/**
 * Split a ranked list into the handful that actually explains the story and the
 * rest, which belongs under "Explore deeper".
 */
export function splitTopFactors<T extends TieredItem>(
  items: T[],
  max: number = TOP_FACTOR_MAX
): { top: T[]; exploreDeeper: T[] } {
  const limit = Math.min(Math.max(max, TOP_FACTOR_MIN), TOP_FACTOR_MAX);
  const ranked = rankByEvidence(items);
  return { top: ranked.slice(0, limit), exploreDeeper: ranked.slice(limit) };
}

// ── 3. Signal strength ──────────────────────────────────────────────────────

export type SignalLevel = 'strong' | 'moderate' | 'single';

export const SIGNAL_LABEL: Record<SignalLevel, string> = {
  strong: 'Strong signal',
  moderate: 'Moderate signal',
  single: 'Single-placement clue',
};

export const SIGNAL_MEANING: Record<SignalLevel, string> = {
  strong: 'Four or more independent major chart factors, or one very tight and central major signature, point the same way.',
  moderate: 'Two or three supporting factors point the same way.',
  single: 'One placement only. Interesting, but it should not lead the reading on its own.',
};

export const SIGNAL_DISCLAIMER =
  'Signal strength describes how much chart evidence supports a statement. It is an interpretation-support label, not a probability or a measurement of how true something is.';

export interface SignalInput {
  /** Independent primary-tier factors (majors, angles, real aspects/houses/patterns). */
  primaryFactors: number;
  /** Nodes / Chiron factors. */
  secondaryFactors?: number;
  /** Minor bodies and points. */
  supplementalFactors?: number;
  /** True for a very tight (typically <=1°) aspect to a luminary, angle or chart ruler. */
  tightCentralSignature?: boolean;
}

export function signalLevel(input: SignalInput): SignalLevel {
  const primary = Math.max(0, input.primaryFactors);
  const secondary = Math.max(0, input.secondaryFactors ?? 0);
  const supplemental = Math.max(0, input.supplementalFactors ?? 0);

  // Supplemental factors add colour only: they can lift nothing above "moderate",
  // and they never create a strong signal by weight of numbers.
  const effective = primary + secondary * 0.5;

  if (primary >= 4 || (input.tightCentralSignature && primary >= 1)) return 'strong';
  if (effective >= 2) return 'moderate';
  if (primary + secondary + supplemental > 0) return 'single';
  return 'single';
}

export function signalLabel(input: SignalInput): string {
  return SIGNAL_LABEL[signalLevel(input)];
}

/** Bridge for surfaces that already count "supporting factors" only. */
export function signalLevelFromCount(count: number, tightCentralSignature = false): SignalLevel {
  return signalLevel({ primaryFactors: count, tightCentralSignature });
}

// ── 4. "What this does not mean" ────────────────────────────────────────────

export type MisreadKey =
  | 'pluto'
  | 'saturn'
  | 'chiron'
  | 'nodes'
  | 'house8'
  | 'house12'
  | 'retrograde'
  | 'intercepted'
  | 'tenseAspect'
  | 'outOfSign'
  | 'summaryIndex';

export const WHAT_THIS_DOES_NOT_MEAN: Record<MisreadKey, string> = {
  pluto:
    'Pluto contact means intensity and focus. It does not mean fixation, control over another person, mistreatment or a doomed connection.',

  saturn:
    'Saturn contact adds structure, patience and follow-through. It does not mean coldness, punishment, failure or that something is destined to be hard.',
  chiron:
    'Chiron marks a sensitive area that may be understood well over time. It does not prove trauma, and no chart shows that one person will heal another.',
  nodes:
    'A nodal contact is a traditional symbolic layer. It does not prove destiny, a past life, or that a relationship was meant to happen.',
  house8:
    'Eighth-house emphasis points to shared resources, trust and things that matter deeply. It does not predict death, crisis or danger.',
  house12:
    'Twelfth-house emphasis points to private, inward and behind-the-scenes areas. It does not prove secrets, deception, psychic bonding or past-life ties.',
  retrograde:
    'A retrograde planet describes an inward or reviewing style of working. It does not mean the function is broken, delayed or unlucky.',
  intercepted:
    'An intercepted sign means a sign sits entirely inside one house. It describes emphasis and timing, not a blocked or missing part of life.',
  tenseAspect:
    'A tense aspect describes friction and effort between two drives. It does not diagnose a personality problem, a disorder or a harmful relationship.',

  outOfSign:
    'An out-of-sign aspect is real by degree. It does not mean the two signs suddenly share an element or temperament.',
  summaryIndex:
    'Any number shown here is a model-generated summary index built from the listed contacts. It is not an objective compatibility measurement or a probability.',
};

export interface MisreadContext {
  bodies?: string[];
  houses?: number[];
  aspectTone?: 'flowing' | 'tense' | 'fusion' | 'neutral' | string;
  isRetrograde?: boolean;
  isIntercepted?: boolean;
  isOutOfSign?: boolean;
  hasSummaryIndex?: boolean;
}

/** The concise clarifications relevant to a given signature, in reading order. */
export function doesNotMeanFor(ctx: MisreadContext): string[] {
  const keys: MisreadKey[] = [];
  const bodies = (ctx.bodies ?? []).map((b) => (b || '').trim());
  const has = (name: string) => bodies.some((b) => b === name);

  if (has('Pluto')) keys.push('pluto');
  if (has('Saturn')) keys.push('saturn');
  if (has('Chiron')) keys.push('chiron');
  if (bodies.some((b) => SECONDARY_SET.has(b) && b !== 'Chiron')) keys.push('nodes');
  if ((ctx.houses ?? []).includes(8)) keys.push('house8');
  if ((ctx.houses ?? []).includes(12)) keys.push('house12');
  if (ctx.isRetrograde) keys.push('retrograde');
  if (ctx.isIntercepted) keys.push('intercepted');
  if (ctx.aspectTone === 'tense') keys.push('tenseAspect');
  if (ctx.isOutOfSign) keys.push('outOfSign');
  if (ctx.hasSummaryIndex) keys.push('summaryIndex');

  return keys.map((k) => WHAT_THIS_DOES_NOT_MEAN[k]);
}

export const DOES_NOT_MEAN_HEADING = 'What this does not mean';

// ── 5. Reusable card anatomy ────────────────────────────────────────────────

/**
 * The shared visual grammar for any named conclusion, so a reader learns the
 * system instead of memorising canned interpretations.
 */
export interface EvidenceCardModel {
  /** Named synthesis / headline. */
  headline: string;
  tier: EvidenceTier;
  signal: SignalLevel;
  signalLabel: string;
  /** Exact chart factors: placements, aspects with orbs, house overlays. */
  evidence: string[];
  /** How those factors combine, in plain language. */
  derivation: string[];
  /** Plain-English interpretation. */
  interpretation: string;
  /** Spoken line (Reading Guide). */
  say?: string;
  /** Directional "who feels what" (synastry only). */
  directional?: { aRole: string; aFeels: string; bRole: string; bFeels: string; mutual: string };
  /** Concise clarifications for easily misread signatures. */
  doesNotMean: string[];
  /** Technical / secondary detail. */
  exploreDeeper?: string[];
}

export interface EvidenceCardInput extends MisreadContext {
  headline: string;
  evidence: string[];
  derivation?: string[];
  interpretation: string;
  say?: string;
  directional?: EvidenceCardModel['directional'];
  exploreDeeper?: string[];
  signal?: SignalInput;
}

export function buildEvidenceCard(input: EvidenceCardInput): EvidenceCardModel {
  const tier = contactTier(input.bodies ?? []);
  const signalInput: SignalInput =
    input.signal ??
    {
      primaryFactors: (input.bodies ?? []).filter((b) => evidenceTier(b) === 'primary').length,
      secondaryFactors: (input.bodies ?? []).filter((b) => evidenceTier(b) === 'secondary').length,
      supplementalFactors: (input.bodies ?? []).filter((b) => evidenceTier(b) === 'supplemental').length,
    };
  const signal = signalLevel(signalInput);
  return {
    headline: input.headline,
    tier,
    signal,
    signalLabel: SIGNAL_LABEL[signal],
    evidence: input.evidence,
    derivation: input.derivation ?? [],
    interpretation: input.interpretation,
    say: input.say,
    directional: input.directional,
    doesNotMean: doesNotMeanFor(input),
    exploreDeeper: input.exploreDeeper,
  };
}

// ── 6. Compatibility framing ────────────────────────────────────────────────

/** The interpretable dimensions a relationship reading should lead with. */
export const RELATIONSHIP_DIMENSION_LABELS = [
  'Emotional fit',
  'Communication',
  'Affection and attraction',
  'Conflict and repair',
  'Trust and security',
  'Shared pace and values',
  'Growth and support',
] as const;

export const SUMMARY_INDEX_DISCLAIMER = WHAT_THIS_DOES_NOT_MEAN.summaryIndex;

/** Labels the app must never present as measured facts. */
export const FORBIDDEN_PSEUDO_METRICS = [
  'past life probability',
  'karmic probability',
  'destiny score',
  'twin flame',
  'soul contract probability',
  'soul growth focus',
  'fated love',
  'compatibility probability',
];


export function isPseudoMetricLabel(text: string): boolean {
  const t = (text || '').toLowerCase();
  return FORBIDDEN_PSEUDO_METRICS.some((p) => t.includes(p));
}

/** Audit helper used by tests and QA: everything a transparent card must carry. */
export function auditEvidenceCard(card: EvidenceCardModel): string[] {
  const problems: string[] = [];
  if (!card.evidence.length) problems.push('card has no exact chart evidence');
  if (!card.interpretation.trim()) problems.push('card has no plain-language interpretation');
  if (card.signal === 'strong' && card.evidence.length < 2) {
    problems.push('strong signal claimed without multiple pieces of evidence');
  }
  if (isPseudoMetricLabel(card.headline)) problems.push(`pseudo-metric label in headline: ${card.headline}`);
  return problems;
}

export const MAJOR_PLANET_LIST = MAJOR_PLANETS;
