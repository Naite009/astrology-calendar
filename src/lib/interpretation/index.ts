/**
 * The one place the app reaches for interpretation quality rules.
 *
 * - `INTERPRETATION_STANDARD` / `withInterpretationStandard`: prompt-level rules,
 *   shared byte-for-byte with the edge functions.
 * - `lintInterpretiveText`: deterministic check on text that already exists
 *   (AI output or template copy).
 * - `softenClaim` / `stripForbiddenClaim` / `interpretive`: sentence-level phrasing
 *   guard that turns absolute claims into tendencies and drops forbidden
 *   deterministic topics. Originally written for the Vedic tab, now the app-wide
 *   helper for any deterministic copy generator.
 * - `INTERPRETATION_SECTION_ORDER`: the canonical full-chart section sequence for
 *   client-side report builders, matching the prompt-level structure block.
 */

export {
  INTERPRETATION_STANDARD,
  INTERPRETATION_OUTPUT_STRUCTURE,
  INTERPRETATION_REQUIREMENTS,
  auditInterpretationStandard,
  withInterpretationStandard,
} from './interpretationStandard';

export type {
  InterpretationRequirement,
  InterpretationRequirementId,
  StandardAudit,
  StandardOptions,
} from './interpretationStandard';

export { lintInterpretiveText, isInterpretationSafe } from './interpretationGuard';
export type { GuardCategory, GuardFinding, GuardResult, GuardOptions } from './interpretationGuard';

export {
  hedge as softenClaim,
  guard as stripForbiddenClaim,
  interpretive,
} from '@/lib/vedic/interpretations/hedge';

/**
 * Canonical section sequence for a FULL chart interpretation. Features may rename
 * the labels for their surface; the order and interpretive intent stay fixed.
 */
export const INTERPRETATION_SECTION_ORDER = [
  { key: 'core_temperament', label: 'Core temperament', intent: 'how the person tends to operate at baseline' },
  { key: 'emotional_style', label: 'Emotional style', intent: 'how feeling is processed and shown' },
  { key: 'communication', label: 'Communication and thinking', intent: 'how information is taken in and expressed' },
  { key: 'relationships', label: 'Relationships and connection', intent: 'what closeness needs in order to work' },
  { key: 'motivation', label: 'Motivation and drive', intent: 'what starts and sustains action' },
  { key: 'strengths', label: 'Strengths and natural assets', intent: 'what already works well, with the factors behind it' },
  { key: 'growth_edges', label: 'Growth edges', intent: 'what becomes harder under stress, phrased as a tendency' },
  { key: 'integrated', label: 'Integrated expression', intent: 'the mature version of the same pattern' },
  { key: 'synthesis', label: 'Final synthesis', intent: 'one coherent portrait drawn from several independent factors' },
] as const;

export type InterpretationSectionKey = (typeof INTERPRETATION_SECTION_ORDER)[number]['key'];
