// Pure sanitizer + migrator for the family-system-reading payload.
// No Deno-specific imports — safe to load from tests and (with a parallel
// copy in src/lib/familySystemMigration.ts) the client.

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

export interface InteractionPatternBlock {
  forA: string;
  forB: string;
  why: string;
}

export type PairEntry = {
  composite?: PairCompositeBlock | string | null;
  bridge?: PairAspectBlock | string | null;
  friction?: PairAspectBlock | string | null;
  interactionPattern?: InteractionPatternBlock | null;
  dynamic?: string | null;
  whatCanFeelHard?: string | null;
  whatHelps?: string | null;
  patternType?: string | null;
  note?: string | null;
  // legacy
  body?: string;
  [k: string]: unknown;
};

export const SIBLING_PATTERN_TYPES = new Set([
  "translation problem",
  "pacing friction",
  "competition risk",
  "quiet co-regulation",
  "mirror match",
  "role split",
]);

export const ALLOWED_PAIR_KEYS = new Set([
  "composite",
  "bridge",
  "friction",
  "interactionPattern",
  "dynamic",
  "whatCanFeelHard",
  "whatHelps",
  "patternType",
  "note",
  "parent",
  "child",
  "siblingA",
  "siblingB",
]);

// Legacy/forbidden pair-only keys. NOTE: `whatHelps` and `respondsBestWhen` are
// NO LONGER forbidden as pair keys — `whatHelps` is now a per-pair field, and
// `respondsBestWhen` lives on childAdaptations (still forbidden inside pairs).
export const FORBIDDEN_PAIR_KEYS = new Set([
  "body",
  "respondsBestWhen",
  "inTheMoment",
  "scenario",
  "scenarios",
  "story",
  "essay",
  "paragraph",
]);

// Legacy top-level keys we strip on sanitize. NOTE: top-level `whatHelps`
// (essay form) is removed — Section 6 now uses `whatHelpsWholeFamily` (array)
// and `whatHelpsRationale` (one sentence).
export const FORBIDDEN_TOP_LEVEL_KEYS = new Set([
  "whatAlreadyWorks",
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

/** Range markers — at least one must appear in dynamic / interactionPattern / bridge / friction text. */
export const RANGE_MARKER_RE =
  /(can show up as[\s\S]+?but can also|may[\s\S]+?though it can also|at its best[\s\S]+?on a hard day|sometimes[\s\S]+?and other times|tends to[\s\S]+?but doesn'?t always|on a good day[\s\S]+?on a hard day|at its best[\s\S]+?on a hard day|under stress)/i;

/** Verdict phrases — banned in pair text (single-outcome claims). */
export const VERDICT_PHRASE_RES: RegExp[] = [
  /\bthis (creates|brings|gives|results in|leads to)\b/i,
  /\bthis is where it goes wrong\b/i,
  /\bthis damages\b/i,
  /\bstrong bond\b/i,
  /\bthey connect easily\b/i,
  /\bthey clash\b/i,
];

/** Clean 6-label pair format: Shared Pattern + How this can show up + 3 levels + Where connection can happen. */
const PAIR_LABELS_IN_ORDER = [
  { label: "Shared Pattern:", maxWords: 20, hasContent: true },
  { label: "How this can show up:", maxWords: 0, hasContent: false }, // header only
  { label: "At its best:", maxWords: 25, hasContent: true },
  { label: "More commonly:", maxWords: 25, hasContent: true },
  { label: "Under stress:", maxWords: 32, hasContent: true },
  { label: "Where connection can happen:", maxWords: 18, hasContent: true },
] as const;

export function validateTelegraphDynamic(text: string): string[] {
  const errors: string[] = [];
  const lines = text.split(/\r?\n/).map((l) => l.trim());

  // Find each label's line index in order.
  let cursor = 0;
  const indices: number[] = [];
  for (const spec of PAIR_LABELS_IN_ORDER) {
    const idx = lines.findIndex(
      (l, i) => i >= cursor && l.toLowerCase().startsWith(spec.label.toLowerCase()),
    );
    if (idx === -1) {
      errors.push(`missing label "${spec.label}"`);
      indices.push(-1);
      continue;
    }
    indices.push(idx);
    cursor = idx + 1;
  }

  // Word-count check for content labels.
  PAIR_LABELS_IN_ORDER.forEach((spec, i) => {
    if (!spec.hasContent) return;
    const idx = indices[i];
    if (idx === -1) return;
    const afterInline = lines[idx].slice(spec.label.length).trim();
    let value = afterInline;
    if (!value) {
      // Content is on subsequent lines until the next known label or blank gap end.
      const collected: string[] = [];
      const nextLabelIdx = indices.slice(i + 1).find((n) => n !== -1) ?? lines.length;
      for (let j = idx + 1; j < nextLabelIdx; j++) {
        const ln = lines[j];
        if (!ln) {
          if (collected.length) break;
          continue;
        }
        collected.push(ln);
      }
      value = collected.join(" ").trim();
    }
    if (!value) {
      errors.push(`"${spec.label}" has no content`);
      return;
    }
    const wc = value.split(/\s+/).filter(Boolean).length;
    if (wc > spec.maxWords) {
      errors.push(`"${spec.label}" has ${wc} words (max ${spec.maxWords}): "${value.slice(0, 80)}..."`);
    }
  });

  return errors;
}

/** Split a legacy paragraph into a composite-tone first sentence and a note. */
export function splitLegacyBody(body: string): { composite: string; note?: string } {
  const cleaned = body.replace(/\s+/g, " ").trim();
  if (!cleaned) return { composite: "" };
  const parts = cleaned.split(SENTENCE_SPLIT_RE);
  const first = parts.shift()!.trim();
  const rest = parts.join(" ").trim();
  return rest ? { composite: first, note: rest } : { composite: first };
}

function liftCompositeString(s: string): PairCompositeBlock {
  return { shared: s.trim(), feelsLikeForA: null, feelsLikeForB: null };
}
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

const DEAD_NOTE_RE = /no tight aspects|no significant connection|no meaningful aspects|limited connection/i;

function normalizeInteractionPattern(v: unknown): InteractionPatternBlock | null | undefined {
  if (v == null) return v as null | undefined;
  if (typeof v !== "object" || Array.isArray(v)) return undefined;
  const o = v as Record<string, unknown>;
  const forA = typeof o.forA === "string" ? o.forA.trim() : "";
  const forB = typeof o.forB === "string" ? o.forB.trim() : "";
  const why = typeof o.why === "string" ? o.why.trim() : "";
  if (!forA && !forB && !why) return null;
  return { forA, forB, why };
}

function normalizeStr(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t ? t : null;
}

/** Migrate one pair entry: legacy `body` → composite/note, lift legacy strings, drop forbidden keys. */
export function migratePairEntry<T extends PairEntry>(entry: T): T {
  const out: PairEntry = {};
  for (const [k, v] of Object.entries(entry)) {
    if (FORBIDDEN_PAIR_KEYS.has(k)) continue;
    out[k] = v;
  }

  const hasNew = !!(entry.composite || entry.bridge || entry.friction || entry.note || entry.dynamic);

  if (!hasNew && typeof entry.body === "string" && entry.body.trim()) {
    const { composite, note } = splitLegacyBody(entry.body);
    if (composite) out.composite = liftCompositeString(composite);
    if (note) out.note = note;
  }

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
  if ("interactionPattern" in out) {
    const ip = normalizeInteractionPattern(out.interactionPattern);
    if (ip === undefined) delete out.interactionPattern;
    else out.interactionPattern = ip;
  }
  if ("dynamic" in out) out.dynamic = normalizeStr(out.dynamic);
  if ("whatCanFeelHard" in out) out.whatCanFeelHard = normalizeStr(out.whatCanFeelHard);
  if ("whatHelps" in out) out.whatHelps = normalizeStr(out.whatHelps);
  if ("patternType" in out) {
    const p = normalizeStr(out.patternType);
    out.patternType = p && SIBLING_PATTERN_TYPES.has(p.toLowerCase()) ? p.toLowerCase() : null;
  }
  if ("note" in out) {
    if (typeof out.note !== "string" || !out.note.trim()) {
      out.note = null;
    } else if (DEAD_NOTE_RE.test(out.note)) {
      out.note = null;
    }
  }

  return out as T;
}

export interface SanitizeResult<T> {
  payload: T;
  droppedTopLevel: string[];
  migratedPairs: number;
  droppedPairKeys: string[];
}

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

  // whatAlreadyWorks is forbidden and stripped before this point.
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

/** Returns true if the line contains at least one allowed range marker. */
export function hasRangeMarker(s: string | null | undefined): boolean {
  if (!s || typeof s !== "string") return false;
  return RANGE_MARKER_RE.test(s);
}

/** Returns the first matching verdict phrase, or null. */
export function firstVerdictPhrase(s: string | null | undefined): string | null {
  if (!s || typeof s !== "string") return null;
  for (const re of VERDICT_PHRASE_RES) {
    const m = s.match(re);
    if (m) return m[0];
  }
  return null;
}

/** Validates the new pair shape + Section 4/5/6/7/8 requirements. */
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

      // composite: object only
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
        // Verdict-phrase scan on bridge/friction text
        for (const sideKey of ["forA", "forB"] as const) {
          const side = b[sideKey];
          const v = firstVerdictPhrase(typeof side === "string" ? side : null);
          if (v) errors.push(`${field}[${i}].${key}.${sideKey} contains verdict phrase: "${v}"`);
        }
      }

      // TELEGRAPH FORMAT — dynamic is the entire pair output.
      const dyn = entry.dynamic;
      if (typeof dyn !== "string" || !dyn.trim()) {
        errors.push(`${field}[${i}].dynamic missing (required)`);
      } else {
        const telegraphErrors = validateTelegraphDynamic(dyn);
        for (const e of telegraphErrors) errors.push(`${field}[${i}].dynamic ${e}`);
      }
    });
  }

  // Section 2: parentRegulationCenter shape
  const prc = payload.parentRegulationCenter;
  if (prc !== undefined && prc !== null) {
    if (!Array.isArray(prc)) {
      errors.push("parentRegulationCenter must be an array");
    } else {
      prc.forEach((raw, i) => {
        if (!raw || typeof raw !== "object") {
          errors.push(`parentRegulationCenter[${i}] not an object`);
          return;
        }
        const o = raw as Record<string, unknown>;
        if (typeof o.name !== "string" || !o.name.trim()) errors.push(`parentRegulationCenter[${i}].name missing`);
        if (typeof o.body !== "string" || !o.body.trim()) errors.push(`parentRegulationCenter[${i}].body missing`);
        if (typeof o.whatThisMeansInRealLife !== "string" || !o.whatThisMeansInRealLife.trim()) {
          errors.push(`parentRegulationCenter[${i}].whatThisMeansInRealLife missing`);
        }
      });
    }
  }

  // Section 3: childAdaptations need respondsBestWhen (string OR non-empty array)
  const ca = payload.childAdaptations;
  if (Array.isArray(ca)) {
    ca.forEach((raw, i) => {
      if (!raw || typeof raw !== "object") return;
      const o = raw as Record<string, unknown>;
      const rbw = o.respondsBestWhen;
      const hasRbw =
        (typeof rbw === "string" && rbw.trim()) ||
        (Array.isArray(rbw) && rbw.some((x) => typeof x === "string" && x.trim()));
      if (!hasRbw) errors.push(`childAdaptations[${i}].respondsBestWhen missing (required)`);
      const adaptOrLine =
        (typeof o.adaptation === "string" && o.adaptation.trim()) ||
        (typeof o.line === "string" && o.line.trim());
      if (!adaptOrLine) errors.push(`childAdaptations[${i}].adaptation (or legacy line) missing`);
    });
  }

  // Section 6/7/8
  if (payload.whatHelpsWholeFamily !== undefined && !Array.isArray(payload.whatHelpsWholeFamily)) {
    errors.push("whatHelpsWholeFamily must be an array of strings");
  }
  if (payload.whatToAvoid !== undefined && !Array.isArray(payload.whatToAvoid)) {
    errors.push("whatToAvoid must be an array of strings");
  }
  const bfp = payload.bestFamilyPractice;
  if (bfp !== undefined && bfp !== null) {
    if (typeof bfp !== "object" || Array.isArray(bfp)) {
      errors.push("bestFamilyPractice must be an object");
    } else {
      const o = bfp as Record<string, unknown>;
      if (typeof o.sequence !== "string" || !o.sequence.trim()) {
        errors.push("bestFamilyPractice.sequence missing");
      }
      if (!Array.isArray(o.steps) || o.steps.length === 0) {
        errors.push("bestFamilyPractice.steps must be a non-empty array");
      }
    }
  }

  return { ok: errors.length === 0, errors };
}
