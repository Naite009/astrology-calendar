/**
 * SHARED — Timing window dedup.
 *
 * Canonical source of truth for label-key normalization and duplicate-window
 * merging. Used by THREE call sites — they MUST all import from here (or its
 * byte-identical Deno mirror) so they can never drift:
 *
 *   1. `src/lib/deterministicTiming.ts` → `buildDeterministicTimingData`
 *   2. `src/lib/preExportValidator.ts` → `validateAndPrepareReadingsForExport`
 *   3. `supabase/functions/ask-astrology/index.ts` → `sanitizeDeterministicTiming`
 *
 * Deno mirror: `supabase/functions/_shared/timingWindowDedup.ts`. If you change
 * this file, change that one in the same commit.
 *
 * RECONCILIATION (Replit audit v1, item #2):
 * The old logic keyed on date-range OR normalized label first, so two windows
 * with identical descriptions but slightly different labels/ranges shipped as
 * separate cards (windows [0,1,2], [7,8], [12,13] all duplicated in the Lauren
 * Newman export). The canonical strategy now matches `dedupeWindowDescriptions()`
 * in index.ts: composite key is description-first (when description is
 * substantive), falling back to date-range, then label. When descriptions
 * match, labels are joined with " · ".
 */

const MONTH_MAP: Record<string, string> = {
  january: 'jan', february: 'feb', march: 'mar', april: 'apr',
  may: 'may', june: 'jun', july: 'jul', august: 'aug',
  september: 'sep', sept: 'sep', october: 'oct', november: 'nov', december: 'dec',
};

const MONTH_REGEX = /\b(january|february|march|april|may|june|july|august|september|sept|october|november|december)\b/g;

export function normalizeLabelKey(label: string): string {
  let s = label.toLowerCase().replace(/[,.]/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(MONTH_REGEX, (m) => MONTH_MAP[m] ?? m);
  s = s.replace(/\b(\d+)(st|nd|rd|th)\b/g, '$1');
  s = s.replace(/\s+to\s+/g, '-').replace(/\s*[–—-]\s*/g, '-');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

export function dateRangeKey(dr: unknown): string {
  if (!dr || typeof dr !== 'object') return '';
  const obj = dr as { start?: unknown; end?: unknown };
  const start = typeof obj.start === 'string' ? obj.start.slice(0, 10) : '';
  const end = typeof obj.end === 'string' ? obj.end.slice(0, 10) : '';
  if (!start && !end) return '';
  return `${start}__${end}`;
}

function normalizeDescription(desc: string): string {
  return desc.toLowerCase().replace(/\s+/g, ' ').trim();
}

export type WindowEntry = {
  label: string;
  description: string;
  dateRange?: unknown;
};

export type MergedWindow = { label: string; description: string; dateRange?: unknown };

export type DedupResult = {
  windows: MergedWindow[];
  mergedCount: number;
  mergeStats: Array<{ key: string; label: string; mergedCount: number }>;
};

/**
 * Canonical dedup: composite key prefers description (when ≥40 chars), then
 * dateRange, then normalized label as a last-resort fallback.
 *
 * Two windows with the same description collapse into one row regardless of
 * label or date-range differences (label joined with " · "). This matches
 * the intent of `dedupeWindowDescriptions()` in index.ts.
 */
export function dedupWindows(rawWindows: readonly WindowEntry[]): DedupResult {
  type Bucket = {
    labels: string[];
    description: string;
    dateRange?: unknown;
    mergedCount: number;
    key: string;
  };
  const map = new Map<string, Bucket>();

  for (const entry of rawWindows) {
    const label = typeof entry.label === 'string' ? entry.label.trim() : '';
    const description = typeof entry.description === 'string' ? entry.description.trim() : '';
    if (!label && !description) continue;

    const normDesc = normalizeDescription(description);
    let key: string;
    if (normDesc.length >= 40) {
      key = `desc:${normDesc}`;
    } else if (dateRangeKey(entry.dateRange)) {
      key = `daterange:${dateRangeKey(entry.dateRange)}`;
    } else {
      key = `label:${normalizeLabelKey(label)}`;
    }

    const existing = map.get(key);
    if (existing) {
      if (label && !existing.labels.includes(label)) existing.labels.push(label);
      existing.mergedCount += 1;
      continue;
    }
    map.set(key, {
      labels: label ? [label] : [],
      description,
      dateRange: entry.dateRange,
      mergedCount: 1,
      key,
    });
  }

  const buckets = Array.from(map.values());
  const totalMerged = buckets.reduce((sum, b) => sum + (b.mergedCount - 1), 0);

  return {
    windows: buckets.map((b) => ({
      label: b.labels.join(' · '),
      description: b.description,
      dateRange: b.dateRange,
    })),
    mergedCount: totalMerged,
    mergeStats: buckets.map((b) => ({
      key: b.key,
      label: b.labels.join(' · '),
      mergedCount: b.mergedCount,
    })),
  };
}
