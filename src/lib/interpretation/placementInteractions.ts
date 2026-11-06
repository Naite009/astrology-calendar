import type { NatalChart } from '@/hooks/useNatalChart';
import { computeRankedAspects, type RankedAspect } from '@/lib/aspectRanking';
import { chartForHouseReading } from '@/lib/chartSignificance/cuspSensitivityRecord';
import { getHouseLivedInterpretation, getCheckedNatalAspectReading, getNatalSignExpression, getPsychologicalFunction } from './psychologicalFunctions';

const MAJORS = new Set(['conjunction', 'sextile', 'square', 'trine', 'opposition']);
export const combinationAspectName = (aspect: string) => aspect[0].toUpperCase() + aspect.slice(1);

/** Matches are drawn from the same full-precision ranked contacts as Aspects. */
export function verifiedCombinationAspects(chart: NatalChart): RankedAspect[] {
  return computeRankedAspects(chartForHouseReading(chart)).filter(a => MAJORS.has(a.aspect));
}

export function findCombinationAspect(chart: NatalChart, a: string, b: string): RankedAspect | undefined {
  return verifiedCombinationAspects(chart).find(contact =>
    (contact.a === a && contact.b === b) || (contact.a === b && contact.b === a));
}

export function buildPlacementInteraction(contact: RankedAspect) {
  const meaning = getCheckedNatalAspectReading(contact);
  const side = (body: string, sign: string, house: number | null) =>
    `${body} in ${sign}: you may ${getNatalSignExpression(sign)}${house ? ` around ${getHouseLivedInterpretation(house)?.attention ?? `House ${house}`}` : ''}.`;
  return {
    id: `${contact.a}:${contact.aspect}:${contact.b}`,
    title: `${contact.a} + ${contact.b}`,
    evidence: `${contact.a} in ${contact.aSign}${contact.aHouse ? `, House ${contact.aHouse}` : ''} ${contact.aspect} ${contact.b} in ${contact.bSign}${contact.bHouse ? `, House ${contact.bHouse}` : ''}; ${contact.orb.toFixed(3)}° orb${contact.isWide ? ' (wide, secondary emphasis)' : ''}.`,
    contrast: [side(contact.a, contact.aSign, contact.aHouse), side(contact.b, contact.bSign, contact.bHouse)],
    together: meaning.aspectDynamic,
    example: meaning.howThisCanShowUp[0] ?? meaning.aspectDynamic,
    tension: meaning.watchFor,
    integration: meaning.whenIntegrated,
    orb: contact.orb,
  };
}

export function prioritizedPlacementInteractions(chart: NatalChart) {
  return verifiedCombinationAspects(chart).filter(a => !a.isWide &&
    getPsychologicalFunction(a.a) && getPsychologicalFunction(a.b) &&
    ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].some(body => body === a.a || body === a.b))
    .slice(0, 3).map(buildPlacementInteraction);
}