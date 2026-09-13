/**
 * Symbolic-contact analysis for relationship readings (historically "karmic analysis").
 *
 * This module deliberately does NOT:
 *  - classify a relationship as a twin flame / catalyst / karmic completion / soul family,
 *  - predict how long a connection lasts or when it "completes",
 *  - publish a total score, a points value, or a "past life probability",
 *  - infer danger, abuse, control or clinical risk from any aspect,
 *  - assert past lives, trauma, wounds, telepathy, secrets or destiny as facts.
 *
 * It DOES: reuse the canonical relationship aspect engine (exact orbs, out-of-sign
 * information) and the canonical house overlay engine, keep the owner of every planet
 * and house explicit, label each contact with a neutral technical category first, and
 * offer any spiritual reading as clearly optional symbolic imagery.
 */

import { NatalChart } from '@/hooks/useNatalChart';
import { FamilyRelationshipContext, getFamilyAspectInterpretation } from './familyRelationshipTypes';
import {
  calculateCrossAspects,
  type CrossAspect,
} from './relationship/synastryEngine';
import {
  calculateHouseOverlaysAccurate,
  type HouseOverlayContact,
} from './relationship/houseOverlayEngine';

export type RelationshipFocus = 'romance' | 'friendship' | 'business' | 'family' | 'creative';

export type KarmicIndicatorType =
  | 'south_node'
  | 'north_node'
  | 'saturn'
  | 'pluto'
  | 'chiron'
  | 'twelfth_house'
  | 'eighth_house'
  | 'vertex';

/** Neutral, technical first-line label for each contact family. */
export const TECHNICAL_CATEGORY: Record<KarmicIndicatorType, string> = {
  north_node: 'Node contact',
  south_node: 'Node contact',
  saturn: 'Saturn contact',
  pluto: 'Pluto contact',
  chiron: 'Chiron contact',
  twelfth_house: '12th-house overlay',
  eighth_house: '8th-house overlay',
  vertex: 'Vertex contact',
};

export interface KarmicIndicator {
  type: KarmicIndicatorType;
  /** Neutral technical label shown before any interpretive wording. */
  technicalCategory: string;
  planet1: string;
  planet2: string;
  aspect?: string;
  /** Exact orb in degrees for aspect contacts (undefined for house overlays). */
  orb?: number;
  /** True when the aspect holds by degree but the signs disagree. */
  isOutOfSign?: boolean;
  /** Plain sentence describing the sign-versus-degree situation, when relevant. */
  signVsDegreeNote?: string;
  /** Name of the person whose chart contributes planet1 (or the placed body). */
  owner1?: string;
  /** Name of the person whose chart contributes planet2, or whose house is overlaid. */
  owner2?: string;
  /**
   * Internal ranking relevance only. Never displayed, never summed into a headline
   * number, never presented as points or a measurement.
   */
  weight: number;
  /** Grounded, directional description: who contacts whom and what each may notice. */
  interpretation: string;
  /** What tends to support the connection through this contact. */
  supports: string;
  /** What can strain the connection through this contact. */
  strains: string;
  /** Optional, explicitly symbolic reading of the same contact. */
  optionalSymbolic?: string;
  /**
   * Internal grouping key kept for existing consumers. These are interpretive
   * traditions, not detected facts; the UI must lead with `technicalCategory`.
   */
  theme: 'past_life' | 'soul_growth' | 'karmic_debt' | 'transformation' | 'healing' | 'fated';
  familyAdvice?: {
    forUser: string;
    forOther: string;
    generationalPattern: string;
  };
}

export interface KarmicAnalysis {
  indicators: KarmicIndicator[];
  /** Grounded, evidence-derived statements. Never durations or verdicts. */
  supportingFactors: string[];
  strainingFactors: string[];
  /** Neutral "worth a little care/awareness" notes. Never danger or safety claims. */
  careAreas: string[];
  /** What this connection emphasizes, written from the detected contacts. */
  emphasis: string;
  /** Things each person may get to practise, derived from actual contacts. */
  practiceFocus: string[];
  recommendedApproach: string;
  /** Optional symbolic lens. Never a detected relationship type. */
  optionalSymbolicLens: {
    label: string;
    explanation: string;
    derivedFrom: string[];
  } | null;
  /** Internal lens key retained for compatibility. Never shown as a classification. */
  karmicType: 'completion' | 'new_contract' | 'soul_family' | 'catalyst' | 'karmic_lesson';
  focus: RelationshipFocus;
  familyContext?: FamilyRelationshipContext;
}

const SUBJECT_BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant', 'Midheaven'];
const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];

const CONTACT_BODY: Record<string, KarmicIndicatorType> = {
  NorthNode: 'north_node',
  SouthNode: 'south_node',
  Saturn: 'saturn',
  Pluto: 'pluto',
  Chiron: 'chiron',
  Vertex: 'vertex',
};

const THEME_BY_TYPE: Record<KarmicIndicatorType, KarmicIndicator['theme']> = {
  north_node: 'soul_growth',
  south_node: 'past_life',
  saturn: 'karmic_debt',
  pluto: 'transformation',
  chiron: 'healing',
  twelfth_house: 'past_life',
  eighth_house: 'transformation',
  vertex: 'fated',
};

/** Ranking tier: tighter, major-planet contacts must outrank overlays and points. */
const TIER: Record<KarmicIndicatorType, number> = {
  saturn: 0,
  pluto: 0,
  north_node: 1,
  south_node: 1,
  chiron: 1,
  vertex: 2,
  twelfth_house: 3,
  eighth_house: 3,
};

export function prettyBody(body: string): string {
  if (body === 'NorthNode') return 'North Node';
  if (body === 'SouthNode') return 'South Node';
  if (body === 'Midheaven') return 'Midheaven';
  return body;
}

const TONE_WORD: Record<string, string> = {
  conjunction: 'sits right on',
  opposition: 'sits opposite',
  square: 'sits at a tense angle to',
  trine: 'sits at an easy angle to',
  sextile: 'sits at a mild supportive angle to',
};

function isTense(aspect: string | undefined): boolean {
  return aspect === 'square' || aspect === 'opposition';
}

function subjectPhrase(body: string): string {
  switch (body) {
    case 'Sun':
      return 'sense of self';
    case 'Moon':
      return 'feelings and need for comfort';
    case 'Mercury':
      return 'way of talking and thinking';
    case 'Venus':
      return 'sense of what they like and value';
    case 'Mars':
      return 'drive and how they push for what they want';
    case 'Ascendant':
      return 'first impressions and outward manner';
    case 'Midheaven':
      return 'direction and public role';
    default:
      return `${prettyBody(body)} themes`;
  }
}

interface ContactCopy {
  interpretation: string;
  supports: string;
  strains: string;
  optionalSymbolic?: string;
}

/**
 * Grounded directional copy per contact family. Wording is qualified (may / can /
 * often), never diagnostic, never fatalistic, never sexualised, and never claims
 * a specific past event.
 */
function contactCopy(
  type: KarmicIndicatorType,
  contactOwner: string,
  contactBody: string,
  subjectOwner: string,
  subjectBody: string,
  aspect: string | undefined,
  focus: RelationshipFocus
): ContactCopy {
  const A = contactOwner || 'Person A';
  const B = subjectOwner || 'Person B';
  const motion = TONE_WORD[aspect || 'conjunction'] || 'contacts';
  const head = `${A}'s ${prettyBody(contactBody)} ${motion} ${B}'s ${prettyBody(subjectBody)}`;
  const subject = subjectPhrase(subjectBody);
  const tense = isTense(aspect);
  const together = focus === 'business' ? 'working together' : 'spending time together';

  switch (type) {
    case 'north_node':
    case 'south_node':
      return {
        interpretation: `${head}. Node contacts sit on one axis, so this is one piece of geometry rather than two findings. ${B} may notice their ${subject} being nudged in a slightly different direction around ${A}, and ${A} may find themselves acting as the reason ${B} tries something new. Some of it may also feel oddly familiar and easy from early on.`,
        supports: `${together} can make it easier for ${B} to try something a little outside their usual habits, with ${A} as the prompt.`,
        strains: tense
          ? `The stretch can feel like pressure rather than encouragement, and the familiar version of the pattern can be the easier place to fall back to.`
          : `Because it feels comfortable quickly, both may settle into the easy version of the pattern instead of the new one.`,
        optionalSymbolic: `Some astrologers read node contacts as a sense of shared direction. That is imagery about the pattern, not information about anyone's history.`,
      };
    case 'saturn':
      return {
        interpretation: `${head}. Saturn contacts read as seriousness, structure and patience rather than debt or punishment. ${A} may bring a steadier, more careful tone to ${B}'s ${subject}, and ${B} may feel either supported by that or slowed down by it, depending on the day.`,
        supports: `Reliability, follow-through and taking each other seriously. Commitments made here tend to be kept.`,
        strains: tense
          ? `${B} can feel judged, corrected or held back, and ${A} can end up carrying the responsible role more often than either wants.`
          : `The steadying tone can tip into caution, so new or playful things may need deliberate effort.`,
        optionalSymbolic: `Saturn is sometimes read symbolically as maturing work. It is not a debt owed by either person.`,
      };
    case 'pluto':
      return {
        interpretation: `${head}. Pluto contacts read first as intensity and investment: ${B}'s ${subject} may matter more than usual around ${A}, and ${A} may find their attention unusually focused on ${B}. Depth and influence run both ways here.`,
        supports: `Both may take the connection seriously and be willing to go past small talk into what actually matters.`,
        strains: tense
          ? `Ordinary moments can feel higher-stakes than they are, and strong reactions can arrive faster than either expects. Naming that early usually helps.`
          : `Even in the easier version, the level of investment can be uneven, so it is worth checking that both want the same intensity.`,
        optionalSymbolic: `Pluto contacts are sometimes described as transformative. That is a symbolic frame, not a prediction about either person's behaviour.`,
      };
    case 'chiron':
      return {
        interpretation: `${head}. Chiron contacts read as sensitivity, not injury: ${B}'s ${subject} may be a tender area here, and ${A} may touch it without meaning to. Understanding often builds through how carefully both handle that spot.`,
        supports: `Real understanding is available on a subject where each may feel less sure of themselves.`,
        strains: tense
          ? `Offhand comments or jokes about this subject may land harder than intended, in either direction.`
          : `The tenderness can be easy to overlook precisely because the tone is gentle.`,
        optionalSymbolic: `Chiron is often described as a place of growth through sensitivity. Nothing here says a specific hurt happened.`,
      };
    case 'twelfth_house':
      return {
        interpretation: `${A}'s ${prettyBody(contactBody)} falls in ${B}'s 12th house, which this app reads as the private, less-visible part of ${B}'s chart. ${B} may find that ${A} touches things they do not usually put into words, and some of what happens between them may take a while to become clear to either of them.`,
        supports: `Privacy and quiet trust: ${B} may share things here they normally keep internal.`,
        strains: `A lot may go unsaid, so assumptions can build. Saying things out loud plainly helps more than usual.`,
        optionalSymbolic: `Some traditions read the 12th house as a spiritual or unconscious area. That is an optional lens, not a claim about past lives, psychic ability or secrets.`,
      };
    case 'eighth_house':
      return {
        interpretation: `${A}'s ${prettyBody(contactBody)} falls in ${B}'s 8th house, which this app reads as trust, privacy, emotional depth and anything shared rather than separate. ${B} may find the connection reaches past the surface fairly quickly, and ${A} may notice their presence carries more weight here than in other settings.`,
        supports: `Honesty and depth: this is an area where guarded things can be talked about once trust exists.`,
        strains: `Because trust is the subject, small breaches of it can register strongly. Clear agreements matter here.`,
        optionalSymbolic: `Older texts frame the 8th house as transformation. That is an optional symbolic reading, not a statement about intimacy or money.`,
      };
    case 'vertex':
      return {
        interpretation: `${A}'s Vertex is contacted by ${B}'s ${prettyBody(subjectBody)}. Some astrologers read the Vertex as a point associated with encounters that stand out, so it is offered here as a secondary, optional marker that stays below the major planets and angles.`,
        supports: `If the timing of meeting felt notable to either of them, this is the marker that reflects that impression.`,
        strains: `It is a single point with a tight orb, so it should not carry an interpretation on its own.`,
        optionalSymbolic: `Read symbolically at most. It does not mark destiny, a soul plan or a required meeting.`,
      };
    default:
      return {
        interpretation: head,
        supports: 'No specific supporting note for this contact.',
        strains: 'No specific strain note for this contact.',
      };
  }
}

function tighterFirst(a: KarmicIndicator, b: KarmicIndicator): number {
  const tierDiff = TIER[a.type] - TIER[b.type];
  if (tierDiff !== 0) return tierDiff;
  if (b.weight !== a.weight) return b.weight - a.weight;
  return (a.orb ?? 99) - (b.orb ?? 99);
}

/** Which side of the aspect is the "contact" body (node/Saturn/Pluto/Chiron/Vertex). */
function classifyAspect(a: CrossAspect):
  | {
      type: KarmicIndicatorType;
      contactBody: string;
      contactOwner: string;
      subjectBody: string;
      subjectOwner: string;
    }
  | null {
  const fromType = CONTACT_BODY[a.fromBody];
  const toType = CONTACT_BODY[a.toBody];
  if (fromType && SUBJECT_BODIES.includes(a.toBody)) {
    return {
      type: fromType,
      contactBody: a.fromBody,
      contactOwner: a.fromOwner,
      subjectBody: a.toBody,
      subjectOwner: a.toOwner,
    };
  }
  if (toType && SUBJECT_BODIES.includes(a.fromBody)) {
    return {
      type: toType,
      contactBody: a.toBody,
      contactOwner: a.toOwner,
      subjectBody: a.fromBody,
      subjectOwner: a.fromOwner,
    };
  }
  return null;
}

/**
 * North Node and South Node are the same axis by construction. Keep only the
 * tighter of the two for any (node owner, subject body, subject owner) triple so
 * one piece of geometry cannot be counted twice.
 */
function dedupeNodeAxis(list: KarmicIndicator[]): KarmicIndicator[] {
  const best = new Map<string, KarmicIndicator>();
  const out: KarmicIndicator[] = [];
  for (const ind of list) {
    if (ind.type !== 'north_node' && ind.type !== 'south_node') {
      out.push(ind);
      continue;
    }
    const key = `${ind.owner1}|${ind.owner2}|${ind.planet2}`;
    const existing = best.get(key);
    if (!existing || (ind.orb ?? 99) < (existing.orb ?? 99)) best.set(key, ind);
  }
  return [...out, ...best.values()];
}

function buildAspectIndicators(
  chart1: NatalChart,
  chart2: NatalChart,
  focus: RelationshipFocus
): KarmicIndicator[] {
  const aspects = calculateCrossAspects(chart1, chart2, { includeAdvancedBodies: true });
  const built: KarmicIndicator[] = [];

  for (const a of aspects) {
    const info = classifyAspect(a);
    if (!info) continue;
    // The Vertex is a single point: only a tight conjunction is worth listing.
    if (info.type === 'vertex' && (a.aspect !== 'conjunction' || a.orb > 2)) continue;

    const copy = contactCopy(
      info.type,
      info.contactOwner,
      info.contactBody,
      info.subjectOwner,
      info.subjectBody,
      a.aspect,
      focus
    );

    built.push({
      type: info.type,
      technicalCategory: TECHNICAL_CATEGORY[info.type],
      planet1: info.contactBody,
      planet2: info.subjectBody,
      aspect: a.aspect,
      orb: a.orb,
      isOutOfSign: a.isOutOfSign,
      signVsDegreeNote: a.isOutOfSign ? a.signVsDegree?.synthesisLine : undefined,
      owner1: info.contactOwner,
      owner2: info.subjectOwner,
      weight: a.weight,
      interpretation: copy.interpretation,
      supports: copy.supports,
      strains: copy.strains,
      optionalSymbolic: copy.optionalSymbolic,
      theme: THEME_BY_TYPE[info.type],
    });
  }

  return dedupeNodeAxis(built);
}

function buildOverlayIndicators(
  chart1: NatalChart,
  chart2: NatalChart,
  focus: RelationshipFocus
): KarmicIndicator[] {
  let overlays: HouseOverlayContact[] = [];
  try {
    overlays = calculateHouseOverlaysAccurate(chart1, chart2, {
      bodies: PERSONAL_PLANETS,
    });
  } catch {
    return [];
  }

  return overlays
    .filter((o) => o.house === 8 || o.house === 12)
    .map((o) => {
      const type: KarmicIndicatorType = o.house === 12 ? 'twelfth_house' : 'eighth_house';
      const copy = contactCopy(type, o.bodyOwner, o.body, o.houseOwner, o.body, undefined, focus);
      return {
        type,
        technicalCategory: TECHNICAL_CATEGORY[type],
        planet1: o.body,
        planet2: o.house === 12 ? '12th House' : '8th House',
        owner1: o.bodyOwner,
        owner2: o.houseOwner,
        weight: 0.2,
        interpretation:
          copy.interpretation +
          (o.approximationNote ? ` ${o.approximationNote}` : ''),
        supports: copy.supports,
        strains: copy.strains,
        optionalSymbolic: copy.optionalSymbolic,
        theme: THEME_BY_TYPE[type],
      } satisfies KarmicIndicator;
    });
}

function contactLabel(ind: KarmicIndicator): string {
  const a = ind.owner1 || 'Person A';
  const b = ind.owner2 || 'Person B';
  if (ind.planet2 === '12th House' || ind.planet2 === '8th House') {
    return `${a}'s ${prettyBody(ind.planet1)} in ${b}'s ${ind.planet2.toLowerCase()}`;
  }
  const orb = ind.orb === undefined ? '' : ` (${ind.orb.toFixed(1)}\u00b0 orb)`;
  return `${a}'s ${prettyBody(ind.planet1)} ${ind.aspect} ${b}'s ${prettyBody(ind.planet2)}${orb}`;
}

/**
 * Internal lens key only. Chosen from which contact families are present, never
 * from a score threshold, and never surfaced as "this relationship IS an X".
 */
function lensKey(indicators: KarmicIndicator[]): KarmicAnalysis['karmicType'] {
  if (indicators.length === 0) return 'new_contract';
  const has = (t: KarmicIndicatorType) => indicators.some((i) => i.type === t);
  if (has('pluto') && has('saturn')) return 'karmic_lesson';
  if (has('pluto')) return 'catalyst';
  if (has('north_node') || has('south_node')) return 'soul_family';
  if (has('chiron') || has('saturn')) return 'completion';
  return 'new_contract';
}

function emphasisSentence(indicators: KarmicIndicator[], focus: RelationshipFocus): string {
  if (indicators.length === 0) {
    return 'None of the contacts this section looks for appear between these two charts, so there is nothing here to build an interpretation on.';
  }
  const top = [...indicators].sort(tighterFirst).slice(0, 3);
  const families = Array.from(new Set(top.map((i) => i.technicalCategory)));
  const arena =
    focus === 'business'
      ? 'how the two of them work together'
      : focus === 'family'
        ? 'how the two of them relate day to day'
        : 'how the two of them get along day to day';
  return `What stands out here is ${families.join(', ').toLowerCase()}, based on ${top
    .map(contactLabel)
    .join('; ')}. Those are the contacts worth weighing when reading ${arena}.`;
}

export function calculateKarmicAnalysis(
  chart1: NatalChart,
  chart2: NatalChart,
  focus: RelationshipFocus = 'romance',
  familyContext?: FamilyRelationshipContext
): KarmicAnalysis {
  const indicators = [
    ...buildAspectIndicators(chart1, chart2, focus),
    ...buildOverlayIndicators(chart1, chart2, focus),
  ].sort(tighterFirst);

  if (focus === 'family' && familyContext) {
    indicators.forEach((indicator) => {
      const familyInterpretation = getFamilyAspectInterpretation(
        indicator.planet1,
        indicator.planet2,
        indicator.aspect || 'conjunction',
        familyContext
      );
      indicator.interpretation = familyInterpretation.interpretation;
      indicator.familyAdvice = {
        forUser: familyInterpretation.forUser,
        forOther: familyInterpretation.forOther,
        generationalPattern: familyInterpretation.generationalPattern,
      };
    });
  }

  const ranked = [...indicators].sort(tighterFirst);

  const supportingFactors = ranked
    .slice(0, 5)
    .map((ind) => `${contactLabel(ind)}: ${ind.supports}`);

  const strainingFactors = ranked
    .filter((ind) => isTense(ind.aspect) || ind.type === 'twelfth_house')
    .slice(0, 5)
    .map((ind) => `${contactLabel(ind)}: ${ind.strains}`);

  const careAreas = ranked
    .filter((ind) => isTense(ind.aspect) && (ind.type === 'saturn' || ind.type === 'pluto'))
    .slice(0, 3)
    .map(
      (ind) =>
        `${contactLabel(ind)} is an area worth a little extra awareness, mostly around tone and timing.`
    );

  // Only real evidence produces items. No filler is added to reach a target count.
  const practiceFocus = ranked
    .slice(0, 4)
    .map((ind) => {
      switch (ind.type) {
        case 'saturn':
          return `${contactLabel(ind)}: practising patience and saying clearly what each of them can and cannot commit to.`;
        case 'pluto':
          return `${contactLabel(ind)}: practising naming strong reactions out loud instead of acting from them.`;
        case 'chiron':
          return `${contactLabel(ind)}: practising care with a subject that may be tender for one or both.`;
        case 'north_node':
        case 'south_node':
          return `${contactLabel(ind)}: practising trying the newer response rather than the familiar one.`;
        case 'twelfth_house':
        case 'eighth_house':
          return `${contactLabel(ind)}: practising saying things out loud that would otherwise stay private.`;
        default:
          return `${contactLabel(ind)}: worth noticing, kept as a secondary marker.`;
      }
    });

  const derivedFrom = ranked.slice(0, 4).map(contactLabel);
  const key = lensKey(ranked);
  const optionalSymbolicLens =
    ranked.length > 0
      ? {
          label: 'Optional symbolic lens',
          explanation:
            'Some astrologers describe contacts like these with spiritual language. It is offered as imagery for the contacts listed below, not as a type of relationship, a purpose, or anything about how long a connection lasts.',
          derivedFrom,
        }
      : null;

  let recommendedApproach =
    ranked.length === 0
      ? 'There is little here to work from, so read the rest of the chart comparison instead of this section.'
      : 'Read the listed contacts as tendencies, not rules. Each one names something that may show up; none of them decides anything.';

  if (focus === 'family' && familyContext) {
    recommendedApproach += familyContext.isBloodRelated
      ? ' Some of these patterns may look familiar from the wider family.'
      : ' As chosen family, both of them have room to set their own patterns.';
  }

  return {
    indicators: ranked,
    supportingFactors,
    strainingFactors,
    careAreas,
    emphasis: emphasisSentence(ranked, focus),
    practiceFocus,
    recommendedApproach,
    optionalSymbolicLens,
    karmicType: key,
    focus,
    familyContext,
  };
}

export default calculateKarmicAnalysis;
