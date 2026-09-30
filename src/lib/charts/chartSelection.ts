import type { NatalChart } from '@/hooks/useNatalChart';
import { chartIdentityKey, dedupeChartsByIdentity } from './chartIdentity';

/** One canonical picker/content list: the primary chart stays first and true duplicates stay hidden. */
export function buildSelectableCharts(userChart: NatalChart | null, savedCharts: NatalChart[]): NatalChart[] {
  const primaryIdentity = userChart ? chartIdentityKey(userChart) : null;
  const saved = dedupeChartsByIdentity(savedCharts).filter(
    (chart) => !primaryIdentity || chartIdentityKey(chart) !== primaryIdentity,
  );
  return userChart ? [userChart, ...saved] : saved;
}

/** Never substitute another person's chart while a stale id is being repaired. */
export function resolveSelectedChart(charts: NatalChart[], selectedId: string): NatalChart | null {
  if (!selectedId) return null;
  return charts.find((chart) => chart.id === selectedId) ?? null;
}