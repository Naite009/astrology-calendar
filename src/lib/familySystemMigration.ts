// Client-side mirror of supabase/functions/family-system-reading/sanitize.ts.
// Migrates older cached readings (legacy `body` paragraphs, plain-string
// composite/bridge/friction, removed top-level fields) into the new role-aware
// pair shape before render. Keep in sync with the edge-function copy.

import type { FamilySystemReadingResponse } from "./familySystemSynastry";

const FORBIDDEN_TOP_LEVEL_KEYS = new Set([
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
  // Hard-removed in the final spec: no child-adaptation, no advice, no protocols.
  "childAdaptations",
  "whatHelpsWholeFamily",
  "whatHelpsRationale",
  "whatToAvoid",
  "bestFamilyPractice",
  "inTheMoment",
]);

// `whatHelps` and `respondsBestWhen` are no longer forbidden as pair keys —
// `whatHelps` is now a per-pair field (Section 4/5), and `respondsBestWhen`
// lives on childAdaptations (still forbidden inside pair entries).
const FORBIDDEN_PAIR_KEYS = new Set([
  "body",
  "respondsBestWhen",
  "inTheMoment",
  "scenario",
  "scenarios",
  "story",
  "essay",
  "paragraph",
]);

const SIBLING_PATTERN_TYPES = new Set([
  "translation problem",
  "pacing friction",
  "competition risk",
  "quiet co-regulation",
  "mirror match",
  "role split",
]);

const SENTENCE_SPLIT_RE = /(?<=[.!?])\s+/;

function splitLegacyBody(body: string): { composite: string; note?: string } {
  const cleaned = body.replace(/\s+/g, " ").trim();
  if (!cleaned) return { composite: "" };
  const parts = cleaned.split(SENTENCE_SPLIT_RE);
  const first = parts.shift()!.trim();
  const rest = parts.join(" ").trim();
  return rest ? { composite: first, note: rest } : { composite: first };
}

function liftCompositeString(s: string) {
  return { shared: s.trim(), feelsLikeForA: null, feelsLikeForB: null };
}
function liftAspectString(s: string) {
  return { aspect: s.trim(), forA: null, forB: null };
}

function normalizeComposite(v: unknown) {
  if (v == null) return v;
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

function normalizeAspect(v: unknown) {
  if (v == null) return v;
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

function normalizeInteractionPattern(v: unknown) {
  if (v == null) return v;
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

function migratePair(entry: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(entry)) {
    if (FORBIDDEN_PAIR_KEYS.has(k)) continue;
    out[k] = v;
  }
  const hasNew = !!(entry.composite || entry.bridge || entry.friction || entry.note || entry.dynamic);
  const body = entry.body;
  if (!hasNew && typeof body === "string" && body.trim()) {
    const { composite, note } = splitLegacyBody(body);
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
    } else if (DEAD_NOTE_RE.test(out.note as string)) {
      out.note = null;
    }
  }
  return out;
}

/**
 * Migrate any cached/legacy reading payload into the current shape.
 * Safe to call on already-current payloads (no-op).
 */
export function migrateFamilySystemReading(
  raw: unknown,
): FamilySystemReadingResponse {
  if (!raw || typeof raw !== "object") return raw as FamilySystemReadingResponse;
  const input = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (FORBIDDEN_TOP_LEVEL_KEYS.has(k)) continue;
    out[k] = v;
  }
  for (const field of ["parentChildConnections", "siblingConnections"] as const) {
    const arr = out[field];
    if (Array.isArray(arr)) {
      out[field] = arr.map((e) =>
        e && typeof e === "object" ? migratePair(e as Record<string, unknown>) : e,
      );
    }
  }
  // whatAlreadyWorks: lift legacy { pair, line } and string entries into role-aware shape.
  const waw = out.whatAlreadyWorks;
  if (waw && !Array.isArray(waw)) {
    out.whatAlreadyWorks = [];
  } else if (Array.isArray(waw)) {
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
  }
  return out as unknown as FamilySystemReadingResponse;
}
