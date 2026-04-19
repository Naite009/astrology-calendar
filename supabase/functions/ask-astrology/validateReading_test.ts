// Unit tests for validateReading — locks in the 4 prior bugfixes plus the
// expanded aspect-phrasing coverage and deep nested-field walking.
//
// Run with: deno test supabase/functions/ask-astrology/validateReading_test.ts

import { assert, assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateReading } from "./validateReading.ts";

// ── Test fixtures ──────────────────────────────────────────────────
// A chart context where:
//   Sun @ 0° Aries   = 0
//   Moon @ 5° Cancer = 95   (Sun-Moon separation 95° → square within 7° orb ✅)
//   Mars @ 0° Libra  = 180  (Sun-Mars separation 180° → opposition ✅)
//   Venus @ 0° Taurus = 30  (Sun-Venus separation 30° → NOT a major aspect)
const CHART_CONTEXT = `
  Sun: 0°00' Aries
  Moon: 5°00' Cancer
  Mars: 0°00' Libra
  Venus: 0°00' Taurus
  Mercury: 10°00' Aries
`;

const baseTimingSection = () => ({
  type: "timing_section",
  title: "Key Transits",
  transits: [
    {
      planet: "Saturn",
      aspect: "square",
      natal_point: "Sun",
      date_range: "Feb 2 to Oct 18, 2027",
      interpretation: "Test transit.",
      symbol: "♄",
      tag: "challenge",
    },
  ],
  windows: [],
});

// ── Bug #1: count rewriting ────────────────────────────────────────
Deno.test("counts: rewrites mismatched element count in narrative prose", () => {
  const reading = {
    sections: [
      {
        type: "modality_element",
        title: "Balance",
        elements: [
          { name: "Fire", count: 3 },
          { name: "Earth", count: 2 },
          { name: "Air", count: 2 },
          { name: "Water", count: 3 },
        ],
        balance_interpretation: "You have four Water placements anchoring you.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const fixed = (reading.sections[0] as any).balance_interpretation;
  assert(fixed.includes("three Water"), `expected "three Water" in: ${fixed}`);
  assertEquals((reading as any)._validation.fixed_counts.length, 1);
  assertEquals((reading as any)._validation.drift_count, 1);
});

Deno.test("counts: rewrites numeric digit form too (4 Water → 3 Water)", () => {
  const reading = {
    sections: [
      {
        type: "modality_element",
        title: "Balance",
        elements: [{ name: "Water", count: 3 }],
        balance_interpretation: "You have 4 Water placements.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const fixed = (reading.sections[0] as any).balance_interpretation;
  assert(fixed.includes("3 Water"), `expected "3 Water" in: ${fixed}`);
});

Deno.test("counts: leaves correct counts alone — drift_count stays 0", () => {
  const reading = {
    sections: [
      {
        type: "modality_element",
        title: "Balance",
        elements: [{ name: "Water", count: 3 }],
        balance_interpretation: "You have three Water placements.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  assertEquals((reading as any)._validation.drift_count, 0);
});

// ── Bug #2: aspect strip ───────────────────────────────────────────
Deno.test("aspects: strips fabricated aspect (Venus square Saturn not in chart)", () => {
  const reading = {
    sections: [
      {
        ...baseTimingSection(),
        // narrative paragraph claims Sun trine Moon (actual sep 95° → false)
        body: "This year is intense. Your Sun trine Moon brings ease. Saturn shows up.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const finalBody = (reading.sections[0] as any).body;
  assert(!finalBody.includes("Sun trine Moon"), `expected strip, got: ${finalBody}`);
  assert(finalBody.includes("This year is intense"), "kept first sentence");
  assert(finalBody.includes("Saturn shows up"), "kept last sentence");
  assertEquals((reading as any)._validation.stripped_aspects.length, 1);
});

Deno.test("aspects: keeps valid aspect (Sun square Moon — actual orb 5°)", () => {
  const reading = {
    sections: [
      {
        ...baseTimingSection(),
        body: "Your Sun square Moon creates inner tension.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[0] as any).body;
  assert(body.includes("Sun square Moon"), `should keep valid aspect, got: ${body}`);
  assertEquals((reading as any)._validation.stripped_aspects.length, 0);
});

// ── NEW: aspect phrasing variants ──────────────────────────────────
Deno.test("aspects: catches possessive form (Sun's trine to the Moon)", () => {
  const reading = {
    sections: [
      {
        ...baseTimingSection(),
        body: "The Sun's trine to the Moon brings flow. Other things happen.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[0] as any).body;
  assert(!body.toLowerCase().includes("sun's trine"), `should strip possessive form, got: ${body}`);
});

Deno.test("aspects: catches hyphenated pair form (Sun-Moon trine)", () => {
  const reading = {
    sections: [
      {
        ...baseTimingSection(),
        body: "The Sun-Moon trine is a gift. Other paragraph follows.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[0] as any).body;
  assert(!body.includes("Sun-Moon trine"), `should strip hyphenated form, got: ${body}`);
});

Deno.test("aspects: catches reversed form (trine between Sun and Moon)", () => {
  const reading = {
    sections: [
      {
        ...baseTimingSection(),
        body: "There is a trine between Sun and Moon here. Next sentence stays.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[0] as any).body;
  assert(!body.includes("trine between Sun and Moon"), `should strip reversed form, got: ${body}`);
  assert(body.includes("Next sentence stays"));
});

Deno.test("aspects: catches 'in [aspect] to' form (Sun in trine to Moon)", () => {
  const reading = {
    sections: [
      {
        ...baseTimingSection(),
        body: "Your Sun in trine to the Moon eases conflict.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[0] as any).body;
  assert(!body.toLowerCase().includes("sun in trine to"), `should strip "in trine to" form, got: ${body}`);
});

// ── Bug #3: date parser handles "Feb 2 to Oct 18, 2027" ────────────
Deno.test("dates: keeps a date that falls within a 'Feb 2 to Oct 18, 2027' range", () => {
  const reading = {
    sections: [
      baseTimingSection(),
      {
        type: "narrative_section",
        title: "Year Ahead",
        body: "Around June 2027 expect a key shift.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[1] as any).body;
  assert(body.includes("June 2027"), `should keep in-range date, got: ${body}`);
  assertEquals((reading as any)._validation.stripped_dates.length, 0);
});

Deno.test("dates: strips a date far outside any timing window", () => {
  const reading = {
    sections: [
      baseTimingSection(),
      {
        type: "narrative_section",
        title: "Year Ahead",
        body: "By December 2099 you will see results. The next paragraph stays.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[1] as any).body;
  assert(!body.includes("December 2099"), `should strip out-of-range date, got: ${body}`);
});

// ── NEW: nested-field coverage (subsections, deep arrays) ──────────
Deno.test("nested: validates strings inside subsections[].body two levels deep", () => {
  const reading = {
    sections: [
      {
        type: "modality_element",
        title: "Balance",
        elements: [{ name: "Water", count: 3 }],
        subsections: [
          { title: "Detail", body: "You have four Water placements right here." },
        ],
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const subBody = (reading.sections[0] as any).subsections[0].body;
  assert(subBody.includes("three Water"), `expected nested fix, got: ${subBody}`);
  assertEquals((reading as any)._validation.fixed_counts.length, 1);
});

Deno.test("nested: validates strings inside arbitrary deep arrays (cities[].pros[])", () => {
  const reading = {
    sections: [
      {
        type: "modality_element",
        title: "Balance",
        elements: [{ name: "Water", count: 3 }],
      },
      {
        type: "relocation",
        title: "Cities",
        cities: [
          {
            name: "Lisbon",
            pros: ["You have four Water placements there."],
          },
        ],
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const pro = (reading.sections[1] as any).cities[0].pros[0];
  assert(pro.includes("three Water"), `expected deep-array fix, got: ${pro}`);
});

Deno.test("nested: skips structured fields like 'name' / 'planet' / 'symbol'", () => {
  const reading = {
    sections: [
      baseTimingSection(),
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  // Structured fields untouched
  const t = (reading.sections[0] as any).transits[0];
  assertEquals(t.planet, "Saturn");
  assertEquals(t.aspect, "square");
  assertEquals(t.symbol, "♄");
});

// ── Bug #4: _validation block always present ───────────────────────
Deno.test("report: _validation block is always attached, even on a clean reading", () => {
  const reading = { sections: [{ type: "narrative_section", body: "All good." }] };
  validateReading(reading, CHART_CONTEXT);
  assertExists((reading as any)._validation);
  assertEquals((reading as any)._validation.drift_count, 0);
});

Deno.test("report: drift_count equals sum of all four buckets", () => {
  const reading = {
    sections: [
      {
        type: "modality_element",
        elements: [{ name: "Water", count: 3 }],
        balance_interpretation: "You have four Water placements.",
      },
      {
        ...baseTimingSection(),
        body: "Your Sun trine Moon is gentle. By December 2099 things shift.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const v = (reading as any)._validation;
  const sum =
    v.fixed_counts.length +
    v.stripped_aspects.length +
    v.stripped_dates.length +
    v.stripped_planets.length;
  assertEquals(v.drift_count, sum);
  assert(v.drift_count >= 2, "expected at least one count-fix and one strip");
});

// ── Defensive: malformed inputs don't throw ────────────────────────
Deno.test("defensive: empty reading doesn't throw", () => {
  const reading = {};
  validateReading(reading, CHART_CONTEXT);
  assertExists((reading as any)._validation);
});

Deno.test("defensive: missing chartContext doesn't throw and returns clean", () => {
  const reading = {
    sections: [{ type: "narrative_section", body: "Some prose with no numbers." }],
  };
  validateReading(reading, undefined);
  assertEquals((reading as any)._validation.drift_count, 0);
});
