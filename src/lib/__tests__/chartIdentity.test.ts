import { describe, it, expect } from 'vitest';
import {
  dedupeChartsByIdentity, chartIdentityKey, chartPickerLabels, chartHiddenReason,
} from '../charts/chartIdentity';

const chart = (over: Record<string, unknown> = {}) => ({
  id: String(Math.random()),
  name: 'Karina Client',
  birthDate: '1979-03-12',
  birthTime: '14:20',
  birthLocation: 'La Serena, Chile',
  planets: { Sun: {}, Moon: {}, Ascendant: {} },
  ...over,
}) as any;

describe('saved chart identity', () => {
  it('keeps two different people who share a name', () => {
    const a = chart({ id: 'a', birthDate: '1979-03-12' });
    const b = chart({ id: 'b', birthDate: '1991-07-04' });
    const kept = dedupeChartsByIdentity([a, b]).map(c => c.id);
    expect(kept).toEqual(['a', 'b']);
  });

  it('keeps a re-import with a corrected birth time', () => {
    const kept = dedupeChartsByIdentity([
      chart({ id: 'a', birthTime: '14:20' }),
      chart({ id: 'b', birthTime: '14:02' }),
    ]);
    expect(kept).toHaveLength(2);
  });

  it('keeps the same person born in a different town', () => {
    const kept = dedupeChartsByIdentity([
      chart({ id: 'a', birthLocation: 'La Serena, Coquimbo, Chile' }),
      chart({ id: 'b', birthLocation: 'La Serena, Araucania, Chile' }),
    ]);
    expect(kept).toHaveLength(2);
  });

  it('collapses a true duplicate and keeps the fuller record', () => {
    const thin = chart({ id: 'thin', planets: { Sun: {} } });
    const full = chart({ id: 'full', planets: { Sun: {}, Moon: {}, Mars: {}, Venus: {} } });
    const kept = dedupeChartsByIdentity([thin, full]);
    expect(kept).toHaveLength(1);
    expect(kept[0].id).toBe('full');
  });

  it('treats name spacing and case as the same person', () => {
    expect(chartIdentityKey(chart({ name: '  karina   client ' })))
      .toBe(chartIdentityKey(chart({ name: 'Karina Client' })));
  });

  it('drops nameless records only', () => {
    expect(dedupeChartsByIdentity([chart({ name: '' }), chart()])).toHaveLength(1);
  });

  it('labels same-named charts with their birth dates', () => {
    const a = chart({ id: 'a', birthDate: '1979-03-12' });
    const b = chart({ id: 'b', birthDate: '1991-07-04' });
    const solo = chart({ id: 'c', name: 'Ava Kravitz' });
    const labels = chartPickerLabels([a, b, solo]);
    expect(labels.get(a)).toBe('Karina Client (3/12/1979)');
    expect(labels.get(b)).toBe('Karina Client (7/4/1991)');
    expect(labels.get(solo)).toBe('Ava Kravitz');
  });

  it('explains why a record is not listed as a birth chart', () => {
    expect(chartHiddenReason(chart())).toBeNull();
    expect(chartHiddenReason(chart({ solarReturnYear: 2026 }))).toMatch(/Solar Return/);
    expect(chartHiddenReason(chart({ id: 'hd_1' }))).toMatch(/Human Design/);
    expect(chartHiddenReason(chart({ planets: {} }))).toMatch(/no planet placements/);
    expect(chartHiddenReason(chart({ name: '   ' }))).toMatch(/no name/);
  });
});
