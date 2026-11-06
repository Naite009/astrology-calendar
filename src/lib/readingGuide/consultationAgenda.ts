import type { PractitionerWalkthrough } from './practitionerSynthesis';
import { getHouseLivedInterpretation } from '@/lib/interpretation/psychologicalFunctions';

/** Delivery view of existing evidence-linked hypotheses, not another portrait. */
export function buildConsultationAgenda(reading: PractitionerWalkthrough) {
  const evidence = new Map(reading.evidence.map(item => [item.id, item]));
  const seen = new Set<string>();
  return reading.themes.flatMap(theme => {
    const ids = theme.evidenceIds.filter(id => evidence.has(id));
    const contacts = ids.filter(id => evidence.get(id)?.kind === 'aspect');
    if (!ids.length || (contacts.length > 0 && contacts.every(id => seen.has(id)))) return [];
    contacts.forEach(id => seen.add(id));
    const question = reading.closing.questions.find(q => q.evidenceIds.some(id => contacts.includes(id)));
    const house = ids.flatMap(id => evidence.get(id)?.houses ?? [])[0];
    const area = getHouseLivedInterpretation(house)?.attention;
    const bodies = [...new Set(contacts.flatMap(id => evidence.get(id)?.bodies ?? []))];
    return [{
      id: theme.id,
      topic: theme.title,
      question: area ? `When you think about ${area}, what stands out from your own experience?` : `When ${bodies.join(' and ')} are read together here, what fits your experience, and what does not?`,
      followUp: 'What did you want to do, what did you actually do, and what mattered most in that choice?',
      hypothesis: question?.hypothesis ?? theme.tension,
      possibleExpression: theme.examples[0] ?? theme.gift,
      alternative: 'If this does not fit, leave it open. Ask about a different setting rather than treating disagreement as hidden proof.',
      takeaway: theme.integration,
      evidenceIds: ids,
    }];
  }).slice(0, 3);
}