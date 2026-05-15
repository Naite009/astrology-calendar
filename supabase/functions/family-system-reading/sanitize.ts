// Pure sanitizer + migrator for the family-system-reading payload.
// No Deno-specific imports — safe to load from tests and (with a parallel
// copy in src/lib/familySystemMigration.ts) the client.
//
// Two jobs:
//  1) Migrate legacy cached pair entries (with a `body` paragraph) to the
//     new {composite, bridge, friction, note} shape.
//  2) Strip forbidden / deprecated top-level fields the AI sometimes still
//     emits, and strip forbidden keys from every pair entry.

export type PairEntry = {
  composite?: string | null;
  bridge?: string | null;
  friction?: string | null;
  note?: string | null;
  // legacy
  body?: string;
  [k: string]: unknown;
};

export const ALLOWED_PAIR_KEYS = new Set([
  "composite",
  "bridge",
  "friction",
  "note",
  // identity keys preserved by callers
  "parent",
  "child",
  "siblingA",
  "siblingB",
]);

export const FORBIDDEN_PAIR_KEYS = new Set([
  "body",
  "respondsBestWhen",
  "inTheMoment",
  "whatHelps",
  "scenario",
  "scenarios",
  "story",
  "essay",
  "paragraph",
]);

export const FORBIDDEN_TOP_LEVEL_KEYS = new Set([
  "householdRegulationPattern",
  "whatHelps",
  "siblingPressurePoints",
  "householdInTheMoment",
  "householdMakesItWorse",
  "familyEssence",
  "rolesNarrative",
  "emotionalClimate",
  "whereEveryoneMeets",
  "pressurePoints",
  "bridges",
  "practice",
]);

const SENTENCE_SPLIT_RE = /(?<=[.!?])\s+/;

/** Split a legacy paragraph into a composite-tone first sentence and a note. */
export function splitLegacyBody(body: string): { composite: string; note?: string } {
  const cleaned = body.replace(/\s+/g, " ").trim();
  if (!cleaned) return { composite: "" };
  const parts = cleaned.split(SENTENCE_SPLIT_RE);
  const first = parts.shift()!.trim();
  const rest = parts.join(" ").trim();
  return rest ? { composite: first, note: rest } : { composite: first };
}

/** Migrate one pair entry: legacy `body` → composite/note, drop forbidden keys. */
export function migratePairEntry<T extends PairEntry>(entry: T): T {
  const out: PairEntry = {};
  for (const [k, v] of Object.entries(entry)) {
    if (FORBIDDEN_PAIR_KEYS.has(k)) continue;
    out[k] = v;
  }
  const hasNew = !!(entry.composite || entry.bridge || entry.friction || entry.note);
  if (!hasNew && typeof entry.body === "string" && entry.body.trim()) {
    const { composite, note } = splitLegacyBody(entry.body);
    if (composite) out.composite = composite;
    if (note) out.note = note;
  }
  return out as T;
}

export interface SanitizeResult<T> {
  payload: T;
  droppedTopLevel: string[];
  migratedPairs: number;
  droppedPairKeys: string[];
}

/** Sanitize a full reading payload and migrate legacy pair shapes. */
export function sanitizeReadingPayload<T extends Record<string, unknown>>(input: T): SanitizeResult<T> {
  const droppedTopLevel: string[] = [];
  const droppedPairKeys = new Set<string>();
  let migratedPairs = 0;

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input ?? {})) {
    if (FORBIDDEN_TOP_LEVEL_KEYS.has(k)) {
      droppedTopLevel.push(k);
      continue;
    }
    out[k] = v;
  }

  for (const field of ["parentChildConnections", "siblingConnections"] as const) {
    const arr = out[field];
    if (!Array.isArray(arr)) continue;
    out[field] = arr.map((raw) => {
      if (!raw || typeof raw !== "object") return raw;
      const entry = raw as PairEntry;
      for (const k of Object.keys(entry)) {
        if (FORBIDDEN_PAIR_KEYS.has(k)) droppedPairKeys.add(k);
      }
      const before = JSON.stringify(entry);
      const migrated = migratePairEntry(entry);
      if (JSON.stringify(migrated) !== before) migratedPairs += 1;
      return migrated;
    });
  }

  return {
    payload: out as T,
    droppedTopLevel,
    migratedPairs,
    droppedPairKeys: [...droppedPairKeys],
  };
}

/** True iff every pair entry conforms to the new shape (no `body`, identity + allowed keys only). */
export function validatePairShape(payload: Record<string, unknown>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const field of ["parentChildConnections", "siblingConnections"] as const) {
    const arr = payload[field];
    if (arr === undefined || arr === null) continue;
    if (!Array.isArray(arr)) {
      errors.push(`${field} must be an array`);
      continue;
    }
    arr.forEach((raw, i) => {
      if (!raw || typeof raw !== "object") {
        errors.push(`${field}[${i}] not an object`);
        return;
      }
      const entry = raw as Record<string, unknown>;
      for (const k of Object.keys(entry)) {
        if (!ALLOWED_PAIR_KEYS.has(k)) {
          errors.push(`${field}[${i}] has forbidden key "${k}"`);
        }
      }
    });
  }
  return { ok: errors.length === 0, errors };
}
