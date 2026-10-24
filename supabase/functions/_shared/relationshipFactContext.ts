import { VERIFIED_FACTS_START, VERIFIED_FACTS_END, type VerifiedReadingFacts } from './verifiedReadingFacts.ts';
/** Isolate chart layers without dropping deterministic aspects, chains or timing. */
export function relationshipFactContext(facts: VerifiedReadingFacts, scope: 'natal' | 'sr' | 'timing'): string {
  const relationship = facts.relationship;
  const placements = facts.placements.filter(p => scope === 'natal' ? p.layer === 'natal' : true);
  const contacts = facts.contacts.filter(c => scope === 'natal' ? c.layer === 'natal' : scope === 'sr' ? c.layer !== 'natal' : true);
  const required = (relationship?.requiredEvidenceIds ?? []).filter(id => contacts.some(c => c.id === id));
  return `STRUCTURED RELATIONSHIP FACTS: interpret these precomputed values only. Do not discover aspects, houses, ruler chains or dates from prose. Include every requiredEvidenceId as [evidence:ID] beside its explanation. Empty exactDates means no verified exact hit. A close-approach is a near miss in that window, not an exact transit. Missing Solar Return stops that section with an unavailable notice. No invented personal history.\n${VERIFIED_FACTS_START}\n${JSON.stringify({ ...facts, placements, contacts, rulerChains: scope === 'sr' ? [] : facts.rulerChains, relationship: relationship ? { ...relationship, natalPoints: scope === 'sr' ? [] : relationship.natalPoints, solarReturn: scope === 'natal' ? null : relationship.solarReturn, qualifyingTransits: scope === 'natal' ? [] : relationship.qualifyingTransits, requiredEvidenceIds: required } : null })}\n${VERIFIED_FACTS_END}`;
}