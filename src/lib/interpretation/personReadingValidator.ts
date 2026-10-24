/** Client entry for the shared person-reading validator (single copy lives in supabase/functions/_shared). */
export {
  validatePersonReading,
  cleanPersonReading,
  cleanPersonText,
  findAspectMentions,
  findPlacementClaims,
  findRulerClaims,
} from '../../../supabase/functions/_shared/personReadingValidator';
export type {
  PersonReading,
  PersonSignature,
  PersonCollision,
  PersonTransitNote,
  ValidationContext,
} from '../../../supabase/functions/_shared/personReadingValidator';

import type { ChartStoryMap } from './chartStoryMap';
import { contextFromStoryMap } from '../../../supabase/functions/_shared/personReadingContext';
import type { ValidationContext } from '../../../supabase/functions/_shared/personReadingValidator';

export function validationContextFor(map: ChartStoryMap): ValidationContext {
  return contextFromStoryMap(map);
}
