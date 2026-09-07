/**
 * Client-side entry point for the shared interpretation standard.
 *
 * The canonical text lives in `supabase/functions/_shared/interpretationStandard.ts`
 * so that Deno edge functions and the browser bundle read the SAME rules from the
 * same file. Nothing is re-worded here — this is a re-export only.
 */

export {
  INTERPRETATION_STANDARD,
  INTERPRETATION_OUTPUT_STRUCTURE,
  INTERPRETATION_REQUIREMENTS,
  auditInterpretationStandard,
  withInterpretationStandard,
} from '../../../supabase/functions/_shared/interpretationStandard';

export type {
  InterpretationRequirement,
  InterpretationRequirementId,
  StandardAudit,
  StandardOptions,
} from '../../../supabase/functions/_shared/interpretationStandard';
