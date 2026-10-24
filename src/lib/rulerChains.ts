import type { NatalChart } from '@/hooks/useNatalChart';
import { TRADITIONAL_RULER } from './interpretation/chartRuler';
import { houseForLongitude, toAbsoluteLongitude } from './houseForLongitude';
export function buildRulerChain(chart: NatalChart, house: number) {
  const cusp = chart.houseCusps?.[`house${house}` as keyof typeof chart.houseCusps];
  const steps: { planet: string; sign: string; longitude: number; house: number | null; retrograde: boolean | null; dispositor: string }[] = [];
  let ruler = cusp ? TRADITIONAL_RULER[cusp.sign] : undefined;
  const seen = new Set<string>();
  let termination: 'self-dispositor' | 'loop' | 'unavailable' = 'unavailable';
  while (ruler) {
    if (seen.has(ruler)) { termination = 'loop'; break; }
    seen.add(ruler);
    const p = chart.planets[ruler as keyof typeof chart.planets];
    const longitude = toAbsoluteLongitude(p);
    if (!p || longitude === null) break;
    const dispositor = TRADITIONAL_RULER[p.sign];
    if (!dispositor) break;
    steps.push({ planet: ruler, sign: p.sign, longitude, house: houseForLongitude(chart, longitude), retrograde: p.isRetrograde ?? null, dispositor });
    if (ruler === dispositor) { termination = 'self-dispositor'; break; }
    ruler = dispositor;
  }
  return { house, cuspSign: cusp?.sign ?? null, traditionalRuler: cusp ? TRADITIONAL_RULER[cusp.sign] ?? null : null, steps, termination };
}
export const buildAllRulerChains = (chart: NatalChart) => Array.from({ length: 12 }, (_, i) => buildRulerChain(chart, i + 1));
export function relationshipTargetPriority(chart: NatalChart, name: string): number {
  if (name === 'Descendant' || name === 'DSC' || name === 'Venus') return 0;
  if ([buildRulerChain(chart, 7).traditionalRuler, buildRulerChain(chart, 5).traditionalRuler].includes(name)) return 1;
  if (['Moon','Mars'].includes(name)) return 2;
  if (['NorthNode','North Node','SouthNode','South Node'].includes(name)) return 3;
  return 5;
}
