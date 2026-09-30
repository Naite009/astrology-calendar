import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { buildSelectableCharts, resolveSelectedChart } from '@/lib/charts/chartSelection';

const chart = (id: string, name: string, birthTime = '10:00'): NatalChart => ({
  id,
  name,
  birthDate: '2000-01-01',
  birthTime,
  birthLocation: 'London, United Kingdom',
  planets: {},
} as NatalChart);

describe('exact natal chart selection', () => {
  it('does not silently substitute the first person for a stale selected id', () => {
    const charts = [chart('ava', 'Ava'), chart('max', 'Max')];
    expect(resolveSelectedChart(charts, 'removed-person')).toBeNull();
    expect(resolveSelectedChart(charts, 'max')?.name).toBe('Max');
  });

  it('uses one identity-deduped list for picker and reading content', () => {
    const primary = chart('primary', 'Ava');
    const duplicate = chart('duplicate', 'Ava');
    const distinct = chart('max', 'Max', '11:00');
    expect(buildSelectableCharts(primary, [duplicate, distinct]).map((item) => item.id))
      .toEqual(['primary', 'max']);
  });

  it('keeps same-name charts when their birth records differ', () => {
    const charts = buildSelectableCharts(null, [chart('one', 'Alex', '10:00'), chart('two', 'Alex', '10:01')]);
    expect(charts.map((item) => item.id)).toEqual(['one', 'two']);
  });
});