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

Deno.test("migratePairEntry promotes legacy body to composite/note", () => {
  const out = migratePairEntry({
    parent: "Lauren",
    child: "Max",
    body: "Composite Moon in Pisces. Easier when neither is rushed.",
  });
  assertEquals(out.body, undefined);
  assertEquals(out.composite, "Composite Moon in Pisces.");
  assertEquals(out.note, "Easier when neither is rushed.");
  assertEquals(out.parent, "Lauren");
});

Deno.test("migratePairEntry preserves new shape and drops body if both present", () => {
  const out = migratePairEntry({
    parent: "Lauren",
    child: "Max",
    composite: "Composite Sun in Capricorn — steady, slow.",
    bridge: "Lauren's Venus trine Max's Moon (1.2°): easier in low-volume moments.",
    body: "old story essay that should disappear",
  });
  assertEquals(out.body, undefined);
  assertEquals(out.composite, "Composite Sun in Capricorn — steady, slow.");
  assert(out.bridge?.includes("trine"));
});

Deno.test("sanitizeReadingPayload strips forbidden top-level keys", () => {
  const input = {
    atAGlance: [{ name: "Lauren", line: "stays calm" }],
    householdRegulationPattern: "x",
    whatHelps: "y",
    siblingPressurePoints: [{ name: "Max", body: "z" }],
    familyEssence: "essay",
    parentChildConnections: [],
  };
  const { payload, droppedTopLevel } = sanitizeReadingPayload(input);
  for (const k of [
    "householdRegulationPattern",
    "whatHelps",
    "siblingPressurePoints",
    "familyEssence",
  ]) {
    assert(droppedTopLevel.includes(k), `expected ${k} dropped`);
    assert(!(k in payload));
    assert(FORBIDDEN_TOP_LEVEL_KEYS.has(k));
  }
  assertEquals((payload as any).atAGlance.length, 1);
});

Deno.test("sanitizeReadingPayload migrates legacy body in pair arrays", () => {
  const input = {
    parentChildConnections: [
      {
        parent: "Lauren",
        child: "Max",
        body: "Composite Moon in Pisces. They clash when tired.",
      },
    ],
    siblingConnections: [
      {
        siblingA: "Max",
        siblingB: "Ike",
        body: "Old paragraph essay describing dynamics.",
      },
    ],
  };
  const { payload, migratedPairs, droppedPairKeys } = sanitizeReadingPayload(input);
  assertEquals(migratedPairs, 2);
  assert(droppedPairKeys.includes("body"));
  const pc: any = (payload as any).parentChildConnections[0];
  assertEquals(pc.body, undefined);
  assert(pc.composite);
  const sc: any = (payload as any).siblingConnections[0];
  assertEquals(sc.body, undefined);
  assert(sc.composite);
});

Deno.test("validatePairShape passes on new shape", () => {
  const ok = validatePairShape({
    parentChildConnections: [
      {
        parent: "Lauren",
        child: "Max",
        composite: "Composite Sun in Capricorn.",
        bridge: null,
        friction: "Lauren's Mars square Max's Sun (2°): edges spike when tired.",
        note: null,
      },
    ],
    siblingConnections: [],
  });
  assertEquals(ok.errors, []);
  assert(ok.ok);
});

Deno.test("validatePairShape fails when legacy body present", () => {
  const res = validatePairShape({
    parentChildConnections: [
      {
        parent: "Lauren",
        child: "Max",
        composite: "ok",
        body: "should not be here",
      },
    ],
  });
  assert(!res.ok);
  assert(res.errors.some((e) => e.includes('"body"')));
});

Deno.test("sanitize output always passes validatePairShape", () => {
  const messy = {
    parentChildConnections: [
      { parent: "A", child: "B", body: "Legacy. Two sentences.", respondsBestWhen: ["x"] },
      { parent: "A", child: "C", composite: "ok", inTheMoment: [{ scenario: "x", actions: [] }] },
    ],
    siblingConnections: [
      { siblingA: "B", siblingB: "C", body: "Legacy paragraph." },
    ],
    householdRegulationPattern: "x",
  };
  const { payload } = sanitizeReadingPayload(messy);
  const v = validatePairShape(payload as any);
  assertEquals(v.errors, []);
});
