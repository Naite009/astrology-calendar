import type { NatalChart } from '@/hooks/useNatalChart';
import { chartForHouseReading } from '@/lib/chartSignificance/cuspSensitivityRecord';
import { houseForLongitude, toAbsoluteLongitude } from '@/lib/houseForLongitude';
import { getEssentialDignity } from '@/lib/essentialDignity';
import { buildElementBalanceReading, type ElementName } from './elementBalance';
import { getHouseLivedInterpretation, getNatalSignExpression } from './psychologicalFunctions';
import { buildPlacementInteraction, verifiedCombinationAspects } from './placementInteractions';

const SIGN_ELEMENT: Record<string, ElementName> = { Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water', Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water', Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water' };
const MAJORS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

/** Symbolic growth projects checked natal facts, not a new biography or timing engine. */
export function buildSymbolicDevelopment(original: NatalChart) {
  const chart = chartForHouseReading(original);
  const placements = MAJORS.flatMap(body => {
    const p = chart.planets[body as keyof NatalChart['planets']];
    return p?.sign && SIGN_ELEMENT[p.sign] ? [{ body, sign: p.sign, house: houseForLongitude(chart, toAbsoluteLongitude(p)) }] : [];
  });
  const counts: Record<ElementName, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  placements.forEach(p => { counts[SIGN_ELEMENT[p.sign]] += 1; });
  const elements = buildElementBalanceReading(counts, placements);
  const saturn = placements.find(p => p.body === 'Saturn');
  const house = saturn?.house ? getHouseLivedInterpretation(saturn.house) : null;
  return {
    frame: 'Symbolic growth, not a prediction or proof of your history. Keep what matches your experience; disagreement is not evidence of a hidden problem.',
    elements,
    saturn: saturn ? {
      evidence: `Saturn in ${saturn.sign}${saturn.house ? `, House ${saturn.house}` : ''}. Traditional essential dignity: ${getEssentialDignity('Saturn', saturn.sign).toLowerCase()}.`,
      practice: `When a task matters, you may ${getNatalSignExpression(saturn.sign)}. A useful growth question is whether a clear standard helps you finish, or makes you postpone until you can do it perfectly.`,
      example: house ? `Around ${house.attention}, try naming one responsibility you can complete and one limit you need to state. ${house.question}` : 'Try naming one responsibility you can complete and one limit you need to state. House-specific guidance is withheld without a known birth time.',
      takeaway: 'Choose a manageable promise, state what done means, and review the result without turning one mistake into a verdict on yourself.',
      contacts: verifiedCombinationAspects(chart).filter(a => (a.a === 'Saturn' || a.b === 'Saturn') && !a.isWide).slice(0, 2).map(buildPlacementInteraction),
    } : null,
    privateFactors: placements.filter(p => p.house === 12),
  };
}