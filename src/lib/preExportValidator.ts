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

import { normalizeLabelKey, dedupWindows } from './timingWindowDedup';

const isNonEmptyString = (v: unknown): boolean =>
  typeof v === 'string' && v.trim().length > 0;

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

      // ── Rule 2 & 3: window required fields + dedup (shared helper) ─
      const windows = Array.isArray(s.windows) ? s.windows : [];

      // Diagnostic: log every raw window label + computed dedup key BEFORE merging.
      // eslint-disable-next-line no-console
      console.info(
        `[preExportValidator] Section ${sectionIndex} (reading ${readingIndex}) raw windows BEFORE dedup:`,
        windows.map((w, i) => {
          const o = (w && typeof w === 'object') ? (w as Record<string, unknown>) : {};
          const lbl = typeof o.label === 'string' ? o.label : '';
          return { i, label: lbl, key: lbl ? normalizeLabelKey(lbl) : '(empty)' };
        }),
      );

      // First pass — record validation failures for missing/empty fields.
      // (Dedup happens in a second pass via the shared helper.)
      const cleanForDedup: Array<{ label: string; description: string; dateRange?: unknown }> = [];
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
        cleanForDedup.push({
          label: (obj.label as string).trim(),
          description: (obj.description as string).trim(),
          dateRange: obj.dateRange ?? obj.date_range,
        });
      });

      // Single source of truth for dedup — same helper used by the
      // deterministic builder and the edge function sanitizer.
      const dedupResult = dedupWindows(cleanForDedup);
      for (const stat of dedupResult.mergeStats) {
        if (stat.mergedCount > 1) {
          // eslint-disable-next-line no-console
          console.info(
            `[preExportValidator] ✅ MERGED duplicate window. Label="${stat.label}" key="${stat.key}" (reading ${readingIndex}, section ${sectionIndex}); merged count: ${stat.mergedCount}`,
          );
        }
      }
      const finalWindows = dedupResult.windows;

      // Diagnostic: log final deduped windows that will actually be exported.
      // eslint-disable-next-line no-console
      console.info(
        `[preExportValidator] Section ${sectionIndex} (reading ${readingIndex}) FINAL windows AFTER dedup (${finalWindows.length} of ${windows.length}):`,
        finalWindows.map((w) => w.label),
      );

      s.windows = finalWindows;
    });
  });

  if (failures.length > 0) {
    // eslint-disable-next-line no-console
    console.error('[preExportValidator] BLOCKING EXPORT — validation failures', failures);
    throw new PreExportValidationError(failures);
  }

  return readings;
}
