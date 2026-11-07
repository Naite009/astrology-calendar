import type { CombinationEntry } from '@/lib/planetaryCombinations';
import { getEssentialDignity } from '@/lib/essentialDignity';
import { TRADITIONAL_RULER, MODERN_CORULER } from './chartRuler';
import { checkedLegacyDisplay } from './legacyClaimGate';
import { getNatalSignExpression, getPsychologicalFunction } from './psychologicalFunctions';

export function checkedCombination(entry: CombinationEntry): CombinationEntry {
  const copy = checkedLegacyDisplay(entry);
  const body = entry.factors.find(f => getPsychologicalFunction(f));
  const sign = entry.factors.find(f => TRADITIONAL_RULER[f]);
  if (body && sign && entry.factors.length === 2) {
    const dignity = getEssentialDignity(body, sign);
    copy.title = `${body} in ${sign}`;
    copy.tags = (entry.tags ?? []).filter(tag => !['domicile', 'detriment', 'exaltation', 'fall'].includes(tag));
    if (!['Peregrine', 'NotAssigned'].includes(dignity)) copy.tags.push(dignity.toLowerCase());
    copy.summary = `${body} concerns ${getPsychologicalFunction(body)?.shortFunction.toLowerCase()}. In ${sign}, you may ${getNatalSignExpression(sign)}. Traditional essential dignity: ${dignity === 'NotAssigned' ? 'not assigned' : dignity.toLowerCase()}. ${sign} is traditionally ruled by ${TRADITIONAL_RULER[sign]}${MODERN_CORULER[sign] ? `, with ${MODERN_CORULER[sign]} as modern co-ruler` : ''}.`;
  }
  if (!copy.summary) copy.summary = 'The matched factors are shown above. A checked interpretation is not yet available for this library entry.';
  return copy;
}