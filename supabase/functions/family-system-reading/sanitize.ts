// Pure sanitizer + migrator for the family-system-reading payload.
// No Deno-specific imports — safe to load from tests and (with a parallel
// copy in src/lib/familySystemMigration.ts) the client.
//
// Jobs:
//  1) Migrate legacy cached pair entries (with a `body` paragraph or plain-string
//     composite/bridge/friction) to the new role-aware object shape.
//  2) Strip forbidden / deprecated top-level fields and forbidden pair keys.
//  3) Validate the new shape (composite/bridge/friction are objects, identical
//     forA/forB are flagged, no legacy fields remain).

export interface PairCompositeBlock {
  shared: string;
  feelsLikeForA: string | null;
  feelsLikeForB: string | null;
}

export interface PairAspectBlock {
  aspect: string;
  forA: string | null;
  forB: string | null;
}

export type PairEntry = {
  composite?: PairCompositeBlock | string | null;
  bridge?: PairAspectBlock | string | null;
  friction?: PairAspectBlock | string | null;
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

/** Lift a legacy plain-string composite into the new object shape. */
function liftCompositeString(s: string): PairCompositeBlock {
  return { shared: s.trim(), feelsLikeForA: null, feelsLikeForB: null };
}

/** Lift a legacy plain-string bridge/friction into the new object shape. */
function liftAspectString(s: string): PairAspectBlock {
  return { aspect: s.trim(), forA: null, forB: null };
}

function normalizeComposite(v: unknown): PairCompositeBlock | null | undefined {
  if (v == null) return v as null | undefined;
  if (typeof v === "string") {
    const t = v.trim();
    return t ? liftCompositeString(t) : null;
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return {
      shared: typeof o.shared === "string" ? o.shared : "",
      feelsLikeForA: typeof o.feelsLikeForA === "string" && o.feelsLikeForA.trim() ? o.feelsLikeForA : null,
      feelsLikeForB: typeof o.feelsLikeForB === "string" && o.feelsLikeForB.trim() ? o.feelsLikeForB : null,
    };
  }
  return undefined;
}

function normalizeAspect(v: unknown): PairAspectBlock | null | undefined {
  if (v == null) return v as null | undefined;
  if (typeof v === "string") {
    const t = v.trim();
    return t ? liftAspectString(t) : null;
  }
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    return {
      aspect: typeof o.aspect === "string" ? o.aspect : "",
      forA: typeof o.forA === "string" && o.forA.trim() ? o.forA : null,
      forB: typeof o.forB === "string" && o.forB.trim() ? o.forB : null,
    };
  }
  return undefined;
}

/** Migrate one pair entry: legacy `body` → composite/note, lift legacy strings, drop forbidden keys. */
export function migratePairEntry<T extends PairEntry>(entry: T): T {
  const out: PairEntry = {};
  for (const [k, v] of Object.entries(entry)) {
    if (FORBIDDEN_PAIR_KEYS.has(k)) continue;
    out[k] = v;
  }

  const hasNew = !!(entry.composite || entry.bridge || entry.friction || entry.note);

  // legacy body → composite shared + note
  if (!hasNew && typeof entry.body === "string" && entry.body.trim()) {
    const { composite, note } = splitLegacyBody(entry.body);
    if (composite) out.composite = liftCompositeString(composite);
    if (note) out.note = note;
  }

  // Normalize composite / bridge / friction (string → object lift, object → cleaned)
  if ("composite" in out) {
    const c = normalizeComposite(out.composite);
    if (c === undefined) delete out.composite;
    else out.composite = c;
  }
  if ("bridge" in out) {
    const b = normalizeAspect(out.bridge);
    if (b === undefined) delete out.bridge;
    else out.bridge = b;
  }
  if ("friction" in out) {
    const f = normalizeAspect(out.friction);
    if (f === undefined) delete out.friction;
    else out.friction = f;
  }
  if ("note" in out) {
    if (typeof out.note !== "string" || !out.note.trim()) out.note = null;
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

  // whatAlreadyWorks: lift legacy { pair, line } into { pair, aspect, forA, forB }
  const waw = out.whatAlreadyWorks;
  if (Array.isArray(waw)) {
    out.whatAlreadyWorks = waw
      .map((item: unknown) => {
        if (!item) return null;
        if (typeof item === "string") {
          return { pair: "", aspect: null, forA: null, forB: null, line: item };
        }
        if (typeof item === "object") {
          const o = item as Record<string, unknown>;
          const aspect = typeof o.aspect === "string" ? o.aspect : null;
          const forA = typeof o.forA === "string" && o.forA.trim() ? o.forA : null;
          const forB = typeof o.forB === "string" && o.forB.trim() ? o.forB : null;
          const legacyLine = typeof o.line === "string" ? o.line : null;
          return {
            pair: String(o.pair ?? ""),
            aspect: aspect ?? (legacyLine && !forA && !forB ? legacyLine : null),
            forA,
            forB,
            line: legacyLine,
          };
        }
        return null;
      })
      .filter((x: unknown) => !!x);
  } else if (waw != null) {
    out.whatAlreadyWorks = [];
  }

  return {
    payload: out as T,
    droppedTopLevel,
    migratedPairs,
    droppedPairKeys: [...droppedPairKeys],
  };
}

/** True iff every pair entry conforms to the new shape (objects, no legacy keys, distinct perspectives). */
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
      // composite must be an object (or null) — string composites are legacy and rejected here
      if (entry.composite != null) {
        if (typeof entry.composite !== "object" || Array.isArray(entry.composite)) {
          errors.push(`${field}[${i}].composite must be an object with shared/feelsLikeForA/feelsLikeForB`);
        } else {
          const c = entry.composite as Record<string, unknown>;
          if (typeof c.shared !== "string" || !c.shared.trim()) {
            errors.push(`${field}[${i}].composite.shared missing`);
          }
          if (
            typeof c.feelsLikeForA === "string" &&
            typeof c.feelsLikeForB === "string" &&
            c.feelsLikeForA.trim() &&
            c.feelsLikeForA.trim().toLowerCase() === c.feelsLikeForB.trim().toLowerCase()
          ) {
            errors.push(`${field}[${i}].composite feelsLikeForA and feelsLikeForB are identical`);
          }
        }
      }
      for (const key of ["bridge", "friction"] as const) {
        const v = entry[key];
        if (v == null) continue;
        if (typeof v !== "object" || Array.isArray(v)) {
          errors.push(`${field}[${i}].${key} must be an object with aspect/forA/forB`);
          continue;
        }
        const b = v as Record<string, unknown>;
        if (typeof b.aspect !== "string" || !b.aspect.trim()) {
          errors.push(`${field}[${i}].${key}.aspect missing`);
        }
        if (
          typeof b.forA === "string" &&
          typeof b.forB === "string" &&
          b.forA.trim() &&
          b.forA.trim().toLowerCase() === b.forB.trim().toLowerCase()
        ) {
          errors.push(`${field}[${i}].${key} forA and forB are identical`);
        }
      }
    });
  }
  return { ok: errors.length === 0, errors };
}
