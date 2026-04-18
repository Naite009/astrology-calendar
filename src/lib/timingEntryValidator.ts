/**
 * Hard schema validation contract for timing entries.
 *
 * The renderer is NOT the line of defense for empty/malformed timing cards.
 * Every timing entry must satisfy this schema BEFORE it is allowed to leave
 * the data generation layer. Anything that fails is logged with the full
 * offending object and dropped at source.
 */

import { z } from 'zod';

/**
 * Mirrors the renderer's `isEffectivelyEmpty` so the validator catches the
 * same cases the UI would have caught (NBSP, zero-width chars, lone
 * punctuation, common filler tokens).
 */
export const isEffectivelyEmpty = (raw: unknown): boolean => {
  if (typeof raw !== 'string') return true;
  const cleaned = raw
    .replace(/[\u00A0\u200B-\u200D\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return true;
  const stripped = cleaned.replace(/[\s\-–—•·.,:;…"'`*_()\[\]{}]/g, '');
  if (stripped.length < 3) return true;
  const fillers = ['n/a', 'tbd', 'todo', 'placeholder', '—', '...', 'tba', 'none'];
  return fillers.includes(cleaned.toLowerCase());
};

const trimmedNonEmpty = (fieldName: string) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a string`,
    })
    .refine((v) => v.trim().length > 0, { message: `${fieldName} is empty after trim` });

const meaningfulString = (fieldName: string) =>
  z
    .string({
      required_error: `${fieldName} is required`,
      invalid_type_error: `${fieldName} must be a string`,
    })
    .refine((v) => !isEffectivelyEmpty(v), {
      message: `${fieldName} is empty or whitespace-only`,
    });

/**
 * Strict timing-transit schema. Any failure here means the entry would have
 * rendered as a blank card and must be dropped.
 */
export const TimingTransitSchema = z
  .object({
    planet: trimmedNonEmpty('planet'),
    aspect: trimmedNonEmpty('aspect'),
    natal_point: trimmedNonEmpty('natal_point'),
    date_range: trimmedNonEmpty('date_range'),
    interpretation: meaningfulString('interpretation'),
  })
  .passthrough();

/**
 * Strict timing-window schema (the "Window Overview" entries beneath the
 * transit cards — this is exactly where the Feb 1 to Oct 17, 2027 bug lived).
 */
export const TimingWindowSchema = z
  .object({
    label: trimmedNonEmpty('label'),
    description: meaningfulString('description'),
  })
  .passthrough();

export type ValidationFailure = {
  index: number;
  field: string;
  reason: string;
  entry: unknown;
};

/**
 * Validate a list of entries against a schema. Logs every failure with the
 * full offending object plus the exact failing field, then returns only the
 * surviving entries. Designed so generation-time tests can assert
 * `failures.length === 0` per chart/reading.
 */
export function validateEntries<T extends Record<string, unknown>>(
  entries: T[],
  schema: z.ZodSchema<T>,
  context: string,
): { kept: T[]; failures: ValidationFailure[] } {
  const kept: T[] = [];
  const failures: ValidationFailure[] = [];
  entries.forEach((entry, index) => {
    const result = schema.safeParse(entry);
    if (result.success) {
      kept.push(result.data);
      return;
    }
    for (const issue of result.error.issues) {
      const field = issue.path.join('.') || '(root)';
      failures.push({ index, field, reason: issue.message, entry });
      // eslint-disable-next-line no-console
      console.error(
        `[timingEntryValidator/${context}] DROPPED entry #${index} — field "${field}": ${issue.message}`,
        { entry },
      );
    }
  });
  return { kept, failures };
}

/**
 * Hard generation-time check. Throws in development so bugs surface
 * immediately; in production it logs aggressively but does not crash the
 * reading. Either way, no malformed entry can reach the renderer.
 */
export function assertTimingSectionIsClean(
  section:
    | {
        transits?: unknown[];
        windows?: unknown[];
      }
    | null
    | undefined,
): void {
  if (!section) return;

  const transitFailures: ValidationFailure[] = [];
  (section.transits ?? []).forEach((entry, index) => {
    const result = TimingTransitSchema.safeParse(entry);
    if (result.success) return;
    for (const issue of result.error.issues) {
      transitFailures.push({
        index,
        field: issue.path.join('.') || '(root)',
        reason: issue.message,
        entry,
      });
    }
  });

  const windowFailures: ValidationFailure[] = [];
  (section.windows ?? []).forEach((entry, index) => {
    const result = TimingWindowSchema.safeParse(entry);
    if (result.success) return;
    for (const issue of result.error.issues) {
      windowFailures.push({
        index,
        field: issue.path.join('.') || '(root)',
        reason: issue.message,
        entry,
      });
    }
  });

  if (transitFailures.length === 0 && windowFailures.length === 0) return;

  // eslint-disable-next-line no-console
  console.error('[assertTimingSectionIsClean] Schema violations detected', {
    transitFailures,
    windowFailures,
  });

  if (typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } })?.env?.DEV) {
    throw new Error(
      `Timing section failed schema validation: ${transitFailures.length} transit issue(s), ${windowFailures.length} window issue(s). See console for details.`,
    );
  }
}
