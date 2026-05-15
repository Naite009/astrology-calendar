import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  sanitizeReadingPayload,
  migratePairEntry,
  validatePairShape,
  splitLegacyBody,
  FORBIDDEN_TOP_LEVEL_KEYS,
} from "./sanitize.ts";

Deno.test("splitLegacyBody splits multi-sentence body", () => {
  const { composite, note } = splitLegacyBody(
    "The pair composite is Sun in Capricorn. They tend to clash when tired.",
  );
  assertEquals(composite, "The pair composite is Sun in Capricorn.");
  assertEquals(note, "They tend to clash when tired.");
});

Deno.test("migratePairEntry promotes legacy body to composite object + note", () => {
  const out: any = migratePairEntry({
    parent: "Lauren",
    child: "Max",
    body: "Composite Moon in Pisces. Easier when neither is rushed.",
  });
  assertEquals(out.body, undefined);
  assertEquals(out.composite.shared, "Composite Moon in Pisces.");
  assertEquals(out.composite.feelsLikeForA, null);
  assertEquals(out.composite.feelsLikeForB, null);
  assertEquals(out.note, "Easier when neither is rushed.");
});

Deno.test("migratePairEntry lifts legacy string composite/bridge/friction into objects", () => {
  const out: any = migratePairEntry({
    parent: "Lauren",
    child: "Max",
    composite: "Composite Sun in Capricorn — steady, slow.",
    bridge: "Lauren's Venus trine Max's Moon (1.2°): easier in low-volume moments.",
    friction: "Lauren's Mars square Max's Sun (2°): edges spike when tired.",
  });
  assertEquals(out.composite.shared, "Composite Sun in Capricorn — steady, slow.");
  assertEquals(out.composite.feelsLikeForA, null);
  assertEquals(out.bridge.aspect.includes("trine"), true);
  assertEquals(out.bridge.forA, null);
  assertEquals(out.friction.forB, null);
});

Deno.test("migratePairEntry preserves new object shape", () => {
  const out: any = migratePairEntry({
    parent: "Lauren",
    child: "Ben",
    composite: {
      shared: "Pair composite Sun in Capricorn — steady but heavy.",
      feelsLikeForA: "Lauren tends to feel responsible for fixing things.",
      feelsLikeForB: "Ben can experience the same moments as pressure.",
    },
    bridge: null,
    friction: { aspect: "Lauren's Mars square Ben's Sun (2°)", forA: "Lauren may push.", forB: "Ben may pull away." },
  });
  assertEquals(out.composite.feelsLikeForA, "Lauren tends to feel responsible for fixing things.");
  assertEquals(out.bridge, null);
  assertEquals(out.friction.forB, "Ben may pull away.");
});

Deno.test("sanitizeReadingPayload strips forbidden top-level keys", () => {
  const input = {
    atAGlance: [{ name: "Lauren", line: "stays calm" }],
    householdRegulationPattern: "x",
    whatHelps: "y",
    familyEssence: "essay",
    parentChildConnections: [],
  };
  const { payload, droppedTopLevel } = sanitizeReadingPayload(input);
  for (const k of ["householdRegulationPattern", "whatHelps", "familyEssence"]) {
    assert(droppedTopLevel.includes(k));
    assert(!(k in payload));
    assert(FORBIDDEN_TOP_LEVEL_KEYS.has(k));
  }
});

Deno.test("sanitizeReadingPayload migrates legacy body in pair arrays", () => {
  const input = {
    parentChildConnections: [
      { parent: "Lauren", child: "Max", body: "Composite Moon in Pisces. They clash when tired." },
    ],
    siblingConnections: [
      { siblingA: "Max", siblingB: "Ike", body: "Old paragraph essay." },
    ],
  };
  const { payload, migratedPairs, droppedPairKeys } = sanitizeReadingPayload(input);
  assertEquals(migratedPairs, 2);
  assert(droppedPairKeys.includes("body"));
  const pc: any = (payload as any).parentChildConnections[0];
  assertEquals(pc.body, undefined);
  assert(pc.composite.shared);
});

const VALID_IP = {
  forA: "Lauren tends to lean toward fixing or steering, especially under stress.",
  forB: "Ben can experience that as pressure on a hard day, or as care on a calmer one.",
  why: "Lauren's Capricorn Moon meeting Ben's Pisces Moon — earth-water emotional style mismatch.",
};

Deno.test("validatePairShape passes on new role-aware object shape with interactionPattern", () => {
  const ok = validatePairShape({
    parentChildConnections: [
      {
        parent: "Lauren",
        child: "Ben",
        composite: {
          shared: "Pair composite Sun in Capricorn — steady but heavy.",
          feelsLikeForA: "Lauren may feel responsible for steering.",
          feelsLikeForB: "Ben can experience that as pressure.",
        },
        bridge: null,
        friction: { aspect: "Lauren's Mars square Ben's Sun (2°)", forA: "Lauren may push.", forB: "Ben may pull away." },
        interactionPattern: VALID_IP,
        note: null,
      },
    ],
    siblingConnections: [],
  });
  assertEquals(ok.errors, []);
  assert(ok.ok);
});

Deno.test("validatePairShape fails when interactionPattern is missing", () => {
  const res = validatePairShape({
    parentChildConnections: [
      {
        parent: "Lauren",
        child: "Ben",
        composite: { shared: "ok", feelsLikeForA: "a", feelsLikeForB: "b" },
        bridge: null,
        friction: null,
      },
    ],
  });
  assert(!res.ok);
  assert(res.errors.some((e) => e.includes("interactionPattern missing")));
});

Deno.test("validatePairShape flags identical interactionPattern forA/forB", () => {
  const res = validatePairShape({
    parentChildConnections: [
      {
        parent: "Lauren",
        child: "Ben",
        composite: { shared: "ok", feelsLikeForA: "a", feelsLikeForB: "b" },
        interactionPattern: { forA: "Same line.", forB: "Same line.", why: "ok" },
      },
    ],
  });
  assert(!res.ok);
  assert(res.errors.some((e) => e.includes("interactionPattern forA and forB are identical")));
});

Deno.test("validatePairShape fails when composite is a plain string (legacy)", () => {
  const res = validatePairShape({
    parentChildConnections: [
      { parent: "Lauren", child: "Ben", composite: "Just a sentence", interactionPattern: VALID_IP },
    ],
  });
  assert(!res.ok);
  assert(res.errors.some((e) => e.includes("composite must be an object")));
});

Deno.test("validatePairShape flags identical forA and forB on bridge", () => {
  const res = validatePairShape({
    parentChildConnections: [
      {
        parent: "Lauren",
        child: "Ben",
        composite: { shared: "ok", feelsLikeForA: "a", feelsLikeForB: "b" },
        bridge: { aspect: "Lauren's Venus trine Ben's Moon (1°)", forA: "Same line.", forB: "Same line." },
        interactionPattern: VALID_IP,
      },
    ],
  });
  assert(!res.ok);
  assert(res.errors.some((e) => e.includes("forA and forB are identical")));
});

Deno.test("validatePairShape fails when legacy body present", () => {
  const res = validatePairShape({
    parentChildConnections: [
      { parent: "Lauren", child: "Max", composite: { shared: "ok", feelsLikeForA: null, feelsLikeForB: null }, body: "should not be here", interactionPattern: VALID_IP },
    ],
  });
  assert(!res.ok);
  assert(res.errors.some((e) => e.includes('"body"')));
});

Deno.test("sanitizer drops banned 'no tight aspects' note", () => {
  const out: any = migratePairEntry({
    parent: "Lauren",
    child: "Ben",
    composite: { shared: "ok", feelsLikeForA: "a", feelsLikeForB: "b" },
    note: "No tight aspects between personal planets in this pair.",
  });
  assertEquals(out.note, null);
});

Deno.test("sanitize output of legacy payload (without interactionPattern) flags missing IP", () => {
  // Legacy payloads will fail strict validation now — by design — so the UI
  // can show a regenerate hint instead of a dead "no aspects" line.
  const messy = {
    parentChildConnections: [
      { parent: "A", child: "B", body: "Legacy. Two sentences." },
      { parent: "A", child: "C", composite: "old plain string composite" },
    ],
    siblingConnections: [
      { siblingA: "B", siblingB: "C", body: "Legacy paragraph." },
    ],
    householdRegulationPattern: "x",
  };
  const { payload } = sanitizeReadingPayload(messy);
  const v = validatePairShape(payload as any);
  assert(!v.ok);
  assert(v.errors.some((e) => e.includes("interactionPattern missing")));
});
