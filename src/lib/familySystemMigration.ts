// Client-side mirror of supabase/functions/family-system-reading/sanitize.ts.
// Used to migrate older cached readings (which may still contain legacy
// `body` paragraphs on pair entries, or removed top-level fields) into the
// new {composite, bridge, friction, note} pair shape before render.
//
// Keep this file's logic in sync with the edge-function copy. Both are
// covered by Deno tests in supabase/functions/family-system-reading/.

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
]);

const FORBIDDEN_PAIR_KEYS = new Set([
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

const SENTENCE_SPLIT_RE = /(?<=[.!?])\s+/;

function splitLegacyBody(body: string): { composite: string; note?: string } {
  const cleaned = body.replace(/\s+/g, " ").trim();
  if (!cleaned) return { composite: "" };
  const parts = cleaned.split(SENTENCE_SPLIT_RE);
  const first = parts.shift()!.trim();
  const rest = parts.join(" ").trim();
  return rest ? { composite: first, note: rest } : { composite: first };
}

function migratePair(entry: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(entry)) {
    if (FORBIDDEN_PAIR_KEYS.has(k)) continue;
    out[k] = v;
  }
  const hasNew = !!(entry.composite || entry.bridge || entry.friction || entry.note);
  const body = entry.body;
  if (!hasNew && typeof body === "string" && body.trim()) {
    const { composite, note } = splitLegacyBody(body);
    if (composite) out.composite = composite;
    if (note) out.note = note;
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
  return out as unknown as FamilySystemReadingResponse;
}
