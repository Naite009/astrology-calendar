/**
 * Pre-export validation pass.
 *
 * Runs over the FULL readings payload right before any export (JSON or PDF)
 * leaves Lovable. Enforces three hard rules:
 *
 *   1. Every transit must have: planet, aspect, natal_point, date_range,
 *      interpretation, symbol, tag — all non-empty after trimming.
 *   2. Every window must have a non-empty label and non-empty description.
 *   3. No two windows in the same timing section may share a label. Duplicates
 *      are merged in place (descriptions joined by a blank line) before export.
 *
 * On rule 1 or 2 failure, throws a visible Error so the caller can surface it
 * via toast and abort the export. Rule 3 is auto-fixed (merge) and logged.
 */

const REQUIRED_TRANSIT_FIELDS = [
  'planet',
  'aspect',
  'natal_point',
  'date_range',
  'interpretation',
  'symbol',
  'tag',
] as const;

const isNonEmptyString = (v: unknown): boolean =>
  typeof v === 'string' && v.trim().length > 0;

const MONTH_MAP: Record<string, string> = {
  january: 'jan', february: 'feb', march: 'mar', april: 'apr',
  may: 'may', june: 'jun', july: 'jul', august: 'aug',
  september: 'sep', sept: 'sep', october: 'oct', november: 'nov', december: 'dec',
};

/**
 * Aggressive label normalization so two windows representing the same
 * date range hash to the same key regardless of cosmetic formatting:
 *   - lowercase, trim, collapse whitespace
 *   - strip commas and periods
 *   - normalize month names → 3-letter abbrev (february → feb)
 *   - normalize range separators ("to", "–", "—", "-") → "-"
 *   - strip ordinal suffixes (1st → 1, 2nd → 2)
 */
const normalizeLabelKey = (label: string): string => {
  let s = label.toLowerCase().replace(/[,.]/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.replace(/\b(january|february|march|april|may|june|july|august|september|sept|october|november|december)\b/g, (m) => MONTH_MAP[m] ?? m);
  s = s.replace(/\b(\d+)(st|nd|rd|th)\b/g, '$1');
  s = s.replace(/\s*[–—-]\s*/g, '-').replace(/\s+to\s+/g, '-');
  s = s.replace(/\s+/g, ' ').trim();
  return s;
};

export type PreExportFailure = {
  scope: 'transit' | 'window';
  readingIndex: number;
  sectionIndex: number;
  entryIndex: number;
  field: string;
  entry: unknown;
};

export class PreExportValidationError extends Error {
  failures: PreExportFailure[];
  constructor(failures: PreExportFailure[]) {
    const summary = failures
      .slice(0, 5)
      .map(
        (f) =>
          `${f.scope}#${f.entryIndex} (reading ${f.readingIndex}, section ${f.sectionIndex}) missing/empty "${f.field}"`,
      )
      .join('; ');
    super(
      `Pre-export validation failed (${failures.length} issue${failures.length === 1 ? '' : 's'}): ${summary}${failures.length > 5 ? '…' : ''}`,
    );
    this.name = 'PreExportValidationError';
    this.failures = failures;
  }
}

/**
 * Mutates the readings payload to merge duplicate-label windows, then throws
 * if any required-field rule is violated. Returns the same (possibly merged)
 * payload on success.
 */
export function validateAndPrepareReadingsForExport<T extends { sections?: unknown[] }>(
  readings: T[],
): T[] {
  const failures: PreExportFailure[] = [];

  readings.forEach((reading, readingIndex) => {
    const sections = Array.isArray(reading?.sections) ? reading.sections : [];
    sections.forEach((section, sectionIndex) => {
      if (!section || typeof section !== 'object') return;
      const s = section as { type?: string; transits?: unknown[]; windows?: unknown[] };
      if (s.type !== 'timing_section') return;

      // ── Rule 1: transit required fields ─────────────────────────────
      const transits = Array.isArray(s.transits) ? s.transits : [];
      transits.forEach((entry, entryIndex) => {
        if (!entry || typeof entry !== 'object') {
          failures.push({
            scope: 'transit', readingIndex, sectionIndex, entryIndex,
            field: '(root)', entry,
          });
          return;
        }
        const obj = entry as Record<string, unknown>;
        for (const field of REQUIRED_TRANSIT_FIELDS) {
          if (!isNonEmptyString(obj[field])) {
            failures.push({
              scope: 'transit', readingIndex, sectionIndex, entryIndex,
              field, entry,
            });
          }
        }
      });

      // ── Rule 2 & 3: window required fields + dedup ─────────────────
      const windows = Array.isArray(s.windows) ? s.windows : [];
      const merged = new Map<string, { label: string; description: string; mergedCount: number }>();
      windows.forEach((entry, entryIndex) => {
        if (!entry || typeof entry !== 'object') {
          failures.push({
            scope: 'window', readingIndex, sectionIndex, entryIndex,
            field: '(root)', entry,
          });
          return;
        }
        const obj = entry as Record<string, unknown>;
        const labelOk = isNonEmptyString(obj.label);
        const descOk = isNonEmptyString(obj.description);
        if (!labelOk) {
          failures.push({
            scope: 'window', readingIndex, sectionIndex, entryIndex,
            field: 'label', entry,
          });
        }
        if (!descOk) {
          failures.push({
            scope: 'window', readingIndex, sectionIndex, entryIndex,
            field: 'description', entry,
          });
        }
        if (!labelOk || !descOk) return;

        const label = (obj.label as string).trim();
        const description = (obj.description as string).trim();
        const key = normalizeLabelKey(label);
        const existing = merged.get(key);
        if (existing) {
          existing.description = `${existing.description}\n\n${description}`;
          existing.mergedCount += 1;
          // eslint-disable-next-line no-console
          console.info(
            `[preExportValidator] Merged duplicate-label window "${label}" (reading ${readingIndex}, section ${sectionIndex}); total merged: ${existing.mergedCount}`,
          );
        } else {
          merged.set(key, { label, description, mergedCount: 1 });
        }
      });

      // Replace the windows array with the deduped version. This is the
      // ONLY mutation we make — nothing exports two same-labeled windows.
      s.windows = Array.from(merged.values()).map(({ label, description }) => ({
        label,
        description,
      }));
    });
  });

  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error('[preExportValidator] BLOCKING EXPORT — validation failures', failures);
    throw new PreExportValidationError(failures);
  }

  return readings;
}
