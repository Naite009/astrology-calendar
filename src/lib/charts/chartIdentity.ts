/**
 * Why two saved charts are, or are not, the same record.
 *
 * Charts used to be collapsed by name alone, both when loading storage and when
 * building the pickers. Any second chart sharing a name — a client with the same
 * first and last name, a relative, or a re-import of the same person with a
 * corrected birth time — silently disappeared, and because the collapsed list is
 * written back to storage the dropped record could be lost for good.
 *
 * Identity is now the whole birth record: name plus date, time and place. Same
 * person, same moment = one record (keep the fuller one). Anything else stays
 * visible, with the birth date shown next to the name so the two can be told
 * apart.
 */

import { normalizeName } from '@/lib/nameMatching';

export interface ChartLike {
  id?: string;
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthLocation?: string;
  placeName?: string;
  planets?: Record<string, unknown>;
}

const norm = (v: string | undefined) => (v || '').toLowerCase().trim().replace(/\s+/g, ' ');

/** Name only — used for display grouping, never for dropping records. */
export const chartNameKey = (chart: ChartLike): string => normalizeName(chart.name || '');

/** Full birth record. Two charts collapse only when every part matches. */
export const chartIdentityKey = (chart: ChartLike): string =>
  [
    chartNameKey(chart),
    norm(chart.birthDate),
    norm(chart.birthTime),
    norm(chart.placeName || chart.birthLocation),
  ].join('|');

const bodyCount = (chart: ChartLike): number =>
  chart.planets ? Object.keys(chart.planets).length : 0;

/**
 * Collapse only true duplicates (identical birth record), keeping whichever copy
 * carries more placements. Order is preserved so "most recently added" stays
 * meaningful.
 */
export function dedupeChartsByIdentity<T extends ChartLike>(charts: T[]): T[] {
  const index = new Map<string, number>();
  const out: T[] = [];
  for (const chart of charts) {
    const key = chartIdentityKey(chart);
    if (!chartNameKey(chart)) continue; // a nameless record cannot be selected
    const at = index.get(key);
    if (at === undefined) {
      index.set(key, out.length);
      out.push(chart);
      continue;
    }
    if (bodyCount(chart) > bodyCount(out[at])) out[at] = chart;
  }
  return out;
}

const shortDate = (iso: string | undefined): string => {
  if (!iso) return 'no birth date';
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim());
  if (!m) return iso.trim();
  return `${Number(m[2])}/${Number(m[3])}/${m[1]}`;
};

/**
 * Labels for a picker: plain name when unique, name plus birth date when two
 * different people (or two versions of a record) share a name.
 */
export function chartPickerLabels<T extends ChartLike>(charts: T[]): Map<T, string> {
  const counts = new Map<string, number>();
  for (const c of charts) {
    const k = chartNameKey(c);
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const labels = new Map<T, string>();
  for (const c of charts) {
    const name = (c.name || '').trim();
    labels.set(c, (counts.get(chartNameKey(c)) ?? 0) > 1 ? `${name} (${shortDate(c.birthDate)})` : name);
  }
  return labels;
}

/** Why a stored record is not offered in a natal picker, or null when it is. */
export function chartHiddenReason(chart: ChartLike & { solarReturnYear?: number }): string | null {
  if (!chart) return 'The record is empty.';
  if (!chartNameKey(chart)) return 'The record has no name, so it cannot be listed.';
  if (chart.solarReturnYear) return `Saved as a Solar Return for ${chart.solarReturnYear}, not a birth chart.`;
  if (chart.id?.startsWith('hd_')) return 'Saved as a Human Design record only, with no birth chart placements.';
  if (bodyCount(chart) === 0) return 'The record has no planet placements saved.';
  return null;
}
