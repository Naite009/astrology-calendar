/**
 * Canonical relationship CONTEXT.
 *
 * Context comes before analysis. Every relationship surface (screen, card, PDF)
 * derives its vocabulary, visible sections and scoring profile from this object,
 * so a sibling reading can never inherit romantic/sexual/marriage framing and a
 * neutral reading can never silently fall back to "romantic".
 */

import { NatalChart } from '@/hooks/useNatalChart';
import { AgeStage, calculateAgeYears, stageForAge } from '@/lib/readingGuide/ageContext';

/** Relationship kinds the app supports. `neutral` = "all types", genuinely neutral. */
export type RelationshipKind =
  | 'neutral'
  | 'romantic'
  | 'friendship'
  | 'business'
  | 'creative'
  | 'family';

/** Exact family relation. Required (in the UI) whenever kind === 'family'. */
export type FamilyRelation =
  | 'siblings'
  | 'parent-child'
  | 'grandparent-grandchild'
  | 'extended-family'
  | 'chosen-family'
  | 'in-law'
  | 'other-family';

export const FAMILY_RELATION_LABELS: Record<FamilyRelation, string> = {
  siblings: 'Siblings',
  'parent-child': 'Parent & child',
  'grandparent-grandchild': 'Grandparent & grandchild',
  'extended-family': 'Extended family (aunt/uncle/cousin)',
  'chosen-family': 'Chosen family',
  'in-law': 'In-laws',
  'other-family': 'Other family relation',
};

export interface PersonContext {
  name: string;
  /** Age in whole years when it can be derived from stored chart metadata. */
  age: number | null;
  stage: AgeStage;
  isMinor: boolean;
}

/** Section keys for the pair-reading hierarchy. */
export type RelationshipSectionKey =
  | 'context'
  | 'atAGlance'
  | 'worksNaturally'
  | 'misreadEachOther'
  | 'communication'
  | 'emotionalFit'
  | 'energyAndRepair'
  | 'houseOverlays'
  | 'strongestAspects'
  | 'advanced'
  | 'bottomLine'
  // context-gated extras
  | 'romanticAttraction'
  | 'longTermPartnership'
  | 'trustAndSupport'
  | 'sharedInterests'
  | 'conflictAndRecovery'
  | 'boundariesAndPacing'
  | 'confidenceAndGrowth'
  | 'businessCollaboration'
  | 'symbolicNodes';

export interface RelationshipContext {
  kind: RelationshipKind;
  familyRelation: FamilyRelation | null;
  /** Human label, e.g. "Family — Siblings". */
  label: string;
  people: [PersonContext, PersonContext];
  /** True when either person's stored data shows they are under 18. */
  involvesMinor: boolean;
  /** Youngest developmental stage in the pair — drives vocabulary. */
  stage: AgeStage;
  /** Romantic framing permitted at all? */
  allowRomantic: boolean;
  /** Romantic context where at least one person is a teen: age-appropriate romance. */
  isTeenRomance: boolean;
  /** Sexual / erotic / intimacy framing permitted? Never for family or minors. */
  allowSexual: boolean;
  /** Marriage / long-term-couple framing permitted? */
  allowMarriage: boolean;
  /** Business / financial-collaboration framing permitted? */
  allowBusiness: boolean;
  /** Symbolic (nodes/karmic) layer permitted, always clearly labelled as symbolic. */
  allowSymbolic: boolean;
  /** Sections that should render for this context, in reading order. */
  sections: RelationshipSectionKey[];
  /** Scoring profile id used by contextScoring. */
  scoringProfile: RelationshipKind;
  /** One-line note explaining how context shaped the reading. */
  contextNote: string;
}

const BASE_SECTIONS: RelationshipSectionKey[] = [
  'context',
  'atAGlance',
  'worksNaturally',
  'misreadEachOther',
  'communication',
  'emotionalFit',
  'energyAndRepair',
  'houseOverlays',
  'strongestAspects',
];

export function personContext(chart: NatalChart | null | undefined, at: Date = new Date()): PersonContext {
  const name = chart?.name || 'This person';
  const age = chart?.birthDate ? calculateAgeYears(chart.birthDate, at) : null;
  const stage = stageForAge(age);
  return { name, age, stage, isMinor: age !== null && age < 18 };
}

/** Youngest stage wins: child < teen < adult. */
function youngestStage(a: AgeStage, b: AgeStage): AgeStage {
  const rank: Record<AgeStage, number> = { child: 0, teen: 1, adult: 2 };
  return rank[a] <= rank[b] ? a : b;
}

export interface BuildContextOptions {
  kind: RelationshipKind;
  familyRelation?: FamilyRelation | null;
  chart1: NatalChart | null | undefined;
  chart2: NatalChart | null | undefined;
  /** Explicit override when the app deliberately enables age-appropriate teen romance. */
  teenRomanceExplicitlySelected?: boolean;
  /** Manual age overrides (years) when stored metadata has no usable birth date. */
  ageOverrides?: [number | null, number | null];
  now?: Date;
}

export function buildRelationshipContext(opts: BuildContextOptions): RelationshipContext {
  const now = opts.now ?? new Date();
  const p1 = personContext(opts.chart1, now);
  const p2 = personContext(opts.chart2, now);

  const override = (p: PersonContext, years: number | null | undefined): PersonContext => {
    if (years === null || years === undefined) return p;
    return { ...p, age: years, stage: stageForAge(years), isMinor: years < 18 };
  };
  const people: [PersonContext, PersonContext] = [
    override(p1, opts.ageOverrides?.[0]),
    override(p2, opts.ageOverrides?.[1]),
  ];

  const kind = opts.kind;
  const familyRelation = kind === 'family' ? (opts.familyRelation ?? null) : null;
  const involvesMinor = people.some((p) => p.isMinor);
  const stage = youngestStage(people[0].stage, people[1].stage);

  const isFamily = kind === 'family';
  // Family and business are never romantic. Neutral is neutral: it does NOT
  // fall back to romantic interpretation.
  // Romance is a valid, selectable context for teens. It is read in
  // age-appropriate, non-sexualised language rather than being switched off, and
  // it is never re-labelled as family: nothing about age or names implies siblings.
  const allowRomantic = kind === 'romantic' && (!involvesMinor || stage === 'teen');
  const isTeenRomance = allowRomantic && involvesMinor;
  const allowSexual = allowRomantic && !involvesMinor;
  const allowMarriage = allowRomantic && !involvesMinor;
  const allowBusiness = kind === 'business' || (kind === 'creative' && !involvesMinor);

  const sections: RelationshipSectionKey[] = [...BASE_SECTIONS];
  if (allowRomantic) {
    sections.splice(sections.indexOf('emotionalFit') + 1, 0, 'romanticAttraction');
    if (isTeenRomance) {
      // Developmentally appropriate priorities replace adult-partnership material.
      sections.splice(sections.indexOf('romanticAttraction') + 1, 0, 'trustAndSupport');
      sections.push('sharedInterests', 'conflictAndRecovery', 'boundariesAndPacing', 'confidenceAndGrowth');
    }
    if (allowMarriage) sections.push('longTermPartnership');
  }
  if (allowBusiness) sections.push('businessCollaboration');
  sections.push('advanced', 'bottomLine');

  const label = isTeenRomance
    ? 'Dating — teen (age-appropriate)'
    : isFamily
    ? `Family — ${familyRelation ? FAMILY_RELATION_LABELS[familyRelation] : 'relation not selected'}`
    : kind === 'neutral'
      ? 'All types (neutral)'
      : kind.charAt(0).toUpperCase() + kind.slice(1);

  const stageWord = stage === 'child' ? 'child-appropriate' : stage === 'teen' ? 'teen-appropriate' : 'adult';

  const contextNote = isTeenRomance
    ? 'Read as a teen dating relationship, in teen-appropriate language. The chart maths is identical to an adult reading; only the wording and priorities change. Sexual, marriage, cohabitation, family-building and financial-partnership material is switched off.'
    : isFamily
    ? `Read as a family relationship${familyRelation === 'siblings' ? ' between siblings' : ''}, in ${stageWord} language. Romantic, sexual, marriage and business-partnership material is switched off for this context.`
    : kind === 'neutral'
      ? 'Read neutrally. Each dimension is shown on its own; nothing is interpreted as romance by default.'
      : `Read as a ${kind} relationship, in ${stageWord} language.`;

  return {
    kind,
    familyRelation,
    label,
    people,
    involvesMinor,
    stage,
    allowRomantic,
    isTeenRomance,
    allowSexual,
    allowMarriage,
    allowBusiness,
    allowSymbolic: true,
    sections,
    scoringProfile: kind,
    contextNote,
  };
}

export function isSectionVisible(ctx: RelationshipContext, key: RelationshipSectionKey): boolean {
  return ctx.sections.includes(key);
}

/** True when the exact relation still needs to be chosen before analysis is meaningful. */
export function needsFamilyRelation(ctx: RelationshipContext): boolean {
  return ctx.kind === 'family' && ctx.familyRelation === null;
}
