/**
 * SHARED — Timing window label normalization + dedup.
 *
 * Canonical source of truth for label-key normalization and duplicate-window
 * merging. Used by THREE call sites — they MUST all import from here (or its
 * byte-identical Deno mirror) so they can never drift:
 *
 *   1. `src/lib/deterministicTiming.ts` → `buildDeterministicTimingData`
 *      (client-side deterministic builder)
 *   2. `src/lib/preExportValidator.ts` → `validateAndPrepareReadingsForExport`
 *      (pre-export gate, runs immediately before JSON.stringify / PDF render)
 *   3. `supabase/functions/ask-astrology/index.ts` → `sanitizeDeterministicTiming`
 *      (edge-function sanitizer for AI-returned timing sections)
 *
 * The Deno edge function imports the byte-identical mirror at
 * `supabase/functions/_shared/timingWindowDedup.ts`. If you change this file,
 * change that one in the same commit.
 *
 * Rules enforced:
 *   - Label normalization: lowercase, strip commas/periods, collapse whitespace,
 *     month names → 3-letter abbrev, ordinals stripped, range separators
 *     ("to", "–", "—", "-") → "-".
 *   - Optional date-range key: when both ISO start+end are available, those
 *     are used as the dedup key instead of the normalized label (more robust).
 *   - Merge: duplicate-key entries have their descriptions joined by "\n\n".
 */

const MONTH_MAP: Record<string, string> = {
  january: 'jan', february: 'feb', march: 'mar', april: 'apr',
  may: 'may', june: 'jun', july: 'jul', august: 'aug',
  september: 'sep', sept: 'sep', october: 'oct', november: 'nov', december: 'dec',
};

const MONTH_REGEX = /\b(january|february|march|april|may|june|july|august|september|sept|october|november|december)\b/g;

/**
 * Aggressively normalize a window label so two cosmetically-different labels
 * representing the same date range hash to the same key.
 *
 * Examples that all collapse to the same key:
 *   "Feb 1 to Oct 17, 2027"
 *   "February 1 - October 17, 2027"
 *   "feb 1 – oct 17 2027"
 *   "Feb 1st to Oct 17th, 2027"
 */
export function normalizeLabelKey(label: string): string {
  let s = label.toLowerCase().replace(/[,.]/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(MONTH_REGEX, (m) => MONTH_MAP[m] ?? m);
  s = s.replace(/\b(\d+)(st|nd|rd|th)\b/g, '$1');
  s = s.replace(/\s+to\s+/g, '-').replace(/\s*[–—-]\s*/g, '-');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

/**
 * If a window carries a structured `dateRange: { start, end }` (ISO strings),
 * return a deterministic key derived from those dates. Returns `null` when
 * either bound is missing — caller should fall back to `normalizeLabelKey`.
 */
export function dateRangeKey(dr: unknown): string | null {
  if (!dr || typeof dr !== 'object') return null;
  const obj = dr as { start?: unknown; end?: unknown };
  const start = typeof obj.start === 'string' ? obj.start.slice(0, 10) : '';
  const end = typeof obj.end === 'string' ? obj.end.slice(0, 10) : '';
  if (!start || !end) return null;
  return `daterange:${start}__${end}`;
}

export type WindowEntry = {
  label: string;
  description: string;
  /** Optional structured range — used for dedup key when present. */
  dateRange?: unknown;
};

export type MergedWindow = { label: string; description: string };

export type DedupResult = {
  windows: MergedWindow[];
  mergedCount: number;
  /** Per-key merge counts for diagnostic logging. */
  mergeStats: Array<{ key: string; label: string; mergedCount: number }>;
};

/**
 * Dedupe + merge a windows array. Two entries with the same key (date-range
 * if available, otherwise normalized label) are merged into ONE entry whose
 * description is the original descriptions joined by a blank line ("\n\n").
 *
 * Order of first-seen labels is preserved. Empty/missing label or description
 * entries are silently filtered out — callers that need to surface those as
 * errors should validate before calling this function.
 */
export function dedupWindows(rawWindows: readonly WindowEntry[]): DedupResult {
  const map = new Map<string, { label: string; description: string; mergedCount: number; key: string }>();

  for (const entry of rawWindows) {
    const label = typeof entry.label === 'string' ? entry.label.trim() : '';
    const description = typeof entry.description === 'string' ? entry.description.trim() : '';
    if (!label || !description) continue;

    const key = dateRangeKey(entry.dateRange) ?? `label:${normalizeLabelKey(label)}`;
    const existing = map.get(key);
    if (existing) {
      existing.description = `${existing.description}\n\n${description}`;
      existing.mergedCount += 1;
    } else {
      map.set(key, { label, description, mergedCount: 1, key });
    }
  }

  const merged = Array.from(map.values());
  const totalMerged = merged.reduce((sum, m) => sum + (m.mergedCount - 1), 0);

  return {
    windows: merged.map(({ label, description }) => ({ label, description })),
    mergedCount: totalMerged,
    mergeStats: merged.map(({ key, label, mergedCount }) => ({ key, label, mergedCount })),
  };
}
