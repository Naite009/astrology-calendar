/** Client entry for the shared person-reading validator (single copy lives in supabase/functions/_shared). */
export {
  validatePersonReading,
  cleanPersonReading,
  cleanPersonText,
  findAspectMentions,
} from '../../../supabase/functions/_shared/personReadingValidator';
export type {
  PersonReading,
  PersonSignature,
  PersonCollision,
  PersonTransitNote,
  ValidationContext,
} from '../../../supabase/functions/_shared/personReadingValidator';

import type { ChartStoryMap } from './chartStoryMap';
import type { ValidationContext } from '../../../supabase/functions/_shared/personReadingValidator';

export function validationContextFor(map: ChartStoryMap): ValidationContext {
  return {
    evidenceIds: Object.keys(map.evidence),
    chainIds: map.chains.map((c) => c.id),
    transitIds: map.transits.map((t) => t.id),
    allowedAspects: map.allowedAspects.filter(Boolean) as ValidationContext['allowedAspects'],
  };
}
