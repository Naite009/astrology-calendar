import { assert, assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { validateReading } from "./validateReading.ts";
import { ASK_VALIDATION_FACTS_END, ASK_VALIDATION_FACTS_START } from "./validationFacts.ts";

const FACTS = {
  version: 1,
  counted_planets: ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"],
  natal_counts: {
    elements: {
      Fire: { count: 3, planets: ["Sun", "Mercury", "Mars"] },
      Earth: { count: 2, planets: ["Venus", "Jupiter"] },
      Air: { count: 2, planets: ["Uranus", "Pluto"] },
      Water: { count: 3, planets: ["Moon", "Saturn", "Neptune"] },
    },
    modalities: {
      Cardinal: { count: 4, planets: ["Sun", "Moon", "Mercury", "Saturn"] },
      Fixed: { count: 2, planets: ["Venus", "Uranus"] },
      Mutable: { count: 4, planets: ["Mars", "Jupiter", "Neptune", "Pluto"] },
    },
    polarity: {
      Masculine: { count: 5, planets: ["Sun", "Mercury", "Mars", "Uranus", "Pluto"] },
      Feminine: { count: 5, planets: ["Moon", "Venus", "Jupiter", "Saturn", "Neptune"] },
      Yang: { count: 5, planets: ["Sun", "Mercury", "Mars", "Uranus", "Pluto"] },
      Yin: { count: 5, planets: ["Moon", "Venus", "Jupiter", "Saturn", "Neptune"] },
      Active: { count: 5, planets: ["Sun", "Mercury", "Mars", "Uranus", "Pluto"] },
      Receptive: { count: 5, planets: ["Moon", "Venus", "Jupiter", "Saturn", "Neptune"] },
    },
    dominant_element: "Fire",
    dominant_modality: "Cardinal",
    dominant_polarity: "Masculine",
  },
  natal_aspects: [
    { point1: "Moon", point2: "Saturn", aspect: "conjunct", orb: 1.42, separation: 1.42 },
    { point1: "Sun", point2: "Moon", aspect: "square", orb: 5, separation: 95 },
    { point1: "Sun", point2: "Midheaven", aspect: "conjunct", orb: 2, separation: 2 },
  ],
  natal_aspects_meta: {
    orb_policy: {
      conjunct: 8,
      sextile: 5,
      square: 7,
      trine: 7,
      opposition: 8,
      quincunx: 3,
      semisextile: 2,
      semisquare: 2,
      sesquiquadrate: 2,
    },
    house_system: "Placidus",
    zodiac: "tropical",
  },
  positions: [
    { name: "Sun", sign: "Aries", degree: 0, minutes: 0, abs_degree: 0, house: 10, is_retrograde: false },
    { name: "Moon", sign: "Cancer", degree: 5, minutes: 0, abs_degree: 95, house: 1, is_retrograde: false },
    { name: "Saturn", sign: "Cancer", degree: 6, minutes: 25, abs_degree: 96.42, house: 1, is_retrograde: false },
    { name: "Mercury", sign: "Aries", degree: 10, minutes: 0, abs_degree: 10, house: 10, is_retrograde: false },
    { name: "Venus", sign: "Taurus", degree: 0, minutes: 0, abs_degree: 30, house: 11, is_retrograde: false },
    { name: "Mars", sign: "Libra", degree: 0, minutes: 0, abs_degree: 180, house: 4, is_retrograde: false },
    { name: "Midheaven", sign: "Aries", degree: 2, minutes: 0, abs_degree: 2, house: 10, is_retrograde: false },
    { name: "Ascendant", sign: "Cancer", degree: 0, minutes: 0, abs_degree: 90, house: 1, is_retrograde: false },
  ],
};

const buildChartContext = () => `
  Sun: 0°00' Aries
  Moon: 5°00' Cancer
  Saturn: 6°25' Cancer
  Mercury: 10°00' Aries
  Venus: 0°00' Taurus
  Mars: 0°00' Libra
  Midheaven: 2°00' Aries
  Ascendant: 0°00' Cancer
  ${ASK_VALIDATION_FACTS_START}
  ${JSON.stringify(FACTS, null, 2)}
  ${ASK_VALIDATION_FACTS_END}
`;

const CHART_CONTEXT = buildChartContext();

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
  windows: [
    { label: "Feb 2 to Oct 18, 2027", description: "Structured support window." },
  ],
});

Deno.test("counts: rewrites mismatched element count in narrative prose", () => {
  const reading = {
    sections: [
      {
        type: "modality_element",
        title: "Balance",
        elements: [
          { name: "Fire", count: 0 },
          { name: "Earth", count: 0 },
          { name: "Air", count: 0 },
          { name: "Water", count: 0 },
        ],
        balance_interpretation: "You have four Water placements anchoring you.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const fixed = (reading.sections[0] as any).balance_interpretation;
  assert(fixed.includes("three Water"), `expected \"three Water\" in: ${fixed}`);
  assertEquals((reading as any)._validation.fixed_counts.length, 1);
});

Deno.test("counts: rewrites Yang/Yin from machine-readable facts", () => {
  const reading = {
    sections: [
      {
        type: "modality_element",
        title: "Balance",
        polarity: [
          { name: "Yang (Active)", count: 0 },
          { name: "Yin (Receptive)", count: 0 },
        ],
        balance_interpretation: "You have six Yang planets and four Yin planets.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const fixed = (reading.sections[0] as any).balance_interpretation;
  assert(fixed.includes("five Yang"), `expected corrected Yang count, got: ${fixed}`);
  assert(fixed.includes("five Yin"), `expected corrected Yin count, got: ${fixed}`);
});

Deno.test("aspects: keeps real Moon conjunct Saturn from natal_aspects source-of-truth", () => {
  const reading = {
    sections: [
      {
        type: "narrative_section",
        title: "The Essence",
        body: "Your Moon conjunct Saturn makes closeness feel serious and real.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[0] as any).body;
  assert(body.includes("Moon conjunct Saturn"), `should keep real aspect, got: ${body}`);
  assertEquals((reading as any)._validation.stripped_aspects.length, 0);
});

Deno.test("aspects: keeps real glyph aspect ☽☌♄ from natal_aspects source-of-truth", () => {
  const reading = {
    sections: [
      {
        type: "narrative_section",
        title: "The Essence",
        body: "That emotional gravity is right there in ☽☌♄.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[0] as any).body;
  assert(body.includes("☽☌♄"), `should keep real glyph aspect, got: ${body}`);
  assertEquals((reading as any)._validation.stripped_aspects.length, 0);
});

Deno.test("aspects: strips fake Mars conjunct Ascendant when not present in natal_aspects", () => {
  const reading = {
    sections: [
      {
        type: "narrative_section",
        title: "The Essence",
        body: "Your Mars conjunct Ascendant makes you come on strong. The next sentence stays.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[0] as any).body;
  assert(!body.includes("Mars conjunct Ascendant"), `should strip fake aspect, got: ${body}`);
  assert(body.includes("The next sentence stays"));
  assertEquals((reading as any)._validation.stripped_aspects.length, 1);
  assert((reading as any)._validation.stripped_aspects[0].reason.includes("natal_aspects source-of-truth"));
});

Deno.test("aspects: keeps valid Sun conjunct Midheaven angle aspect", () => {
  const reading = {
    sections: [
      {
        type: "narrative_section",
        title: "Career",
        body: "Your Sun conjunct Midheaven is visible in everything you build.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[0] as any).body;
  assert(body.includes("Sun conjunct Midheaven"), `should keep valid angle aspect, got: ${body}`);
});

Deno.test("dates: keeps a date that falls inside structured timing", () => {
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

Deno.test("dates: strips unsupported date and logs the nearest structured window", () => {
  const reading = {
    sections: [
      baseTimingSection(),
      {
        type: "summary_box",
        title: "Strategy Summary",
        value: "If you miss these windows, Nov 5, 2026 offers a supportive settling-in period. Keep the rest.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const value = (reading.sections[1] as any).value;
  assert(!value.includes("Nov 5, 2026"), `should strip unsupported date, got: ${value}`);
  const stripped = (reading as any)._validation.stripped_dates[0];
  assertEquals(stripped.phrase, "Nov 5, 2026");
  assert(stripped.reason.includes("nearest structured window"), `expected explicit reason, got: ${stripped.reason}`);
});

Deno.test("dates: strips bare-month claim (e.g. 'May 2026') outside any structured window", () => {
  const reading = {
    sections: [
      baseTimingSection(),
      {
        type: "summary_box",
        title: "Strategy Summary",
        value: "Consider relocating in May 2026, Jun 2026, or Aug 2026 for best results. This sentence is unrelated.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const value = (reading.sections[1] as any).value;
  assert(!value.includes("May 2026"), `should strip bare-month May 2026, got: ${value}`);
  const stripped = (reading as any)._validation.stripped_dates;
  assert(stripped.length >= 1, `expected at least 1 strip, got ${stripped.length}`);
  assert(
    stripped[0].reason.includes("bare-month") || stripped[0].reason.includes("nearest structured window"),
    `expected bare-month reason, got: ${stripped[0].reason}`,
  );
});

Deno.test("dates: logs every stripped month when one sentence contains multiple unsupported month claims", () => {
  const reading = {
    sections: [
      baseTimingSection(),
      {
        type: "summary_box",
        title: "Strategy Summary",
        value: "Consider relocating in May 2026, Jun 2026, or Aug 2026 for best results.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const stripped = (reading as any)._validation.stripped_dates;
  assertEquals(stripped.length, 3);
  assertEquals(stripped.map((item: any) => item.phrase), ["May 2026", "Jun 2026", "Aug 2026"]);
  assert(stripped.every((item: any) => item.reason.includes("bare-month") || item.reason.includes("timing window")));
});

Deno.test("dates: keeps bare-month claim that overlaps a structured window", () => {
  const reading = {
    sections: [
      baseTimingSection(),
      {
        type: "narrative_section",
        title: "Year Ahead",
        body: "March 2027 is when things shift for you.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[1] as any).body;
  assert(body.includes("March 2027"), `should keep covered bare-month, got: ${body}`);
});

// ─────────────────────────────────────────────────────────────────────────
// Range-parser regression tests — these are the formats Lovable's parser
// was missing in the wild, causing valid bare-month claims to be stripped.
// ─────────────────────────────────────────────────────────────────────────

Deno.test("dates: single-year-endpoint range covers a bare-month inside it ('Apr 19 to May 24, 2026' covers May 2026)", () => {
  const reading = {
    sections: [
      {
        type: "timing_section",
        title: "Windows",
        transits: [],
        windows: [{ label: "Apr 19 to May 24, 2026", description: "Active band." }],
      },
      {
        type: "summary_box",
        title: "Strategy Summary",
        value: "May 2026 is the right time to act.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const value = (reading.sections[1] as any).value;
  assert(value.includes("May 2026"), `should keep May 2026 covered by 'Apr 19 to May 24, 2026', got: ${value}`);
});

Deno.test("dates: en-dash range without spaces covers bare-month ('Feb 1–Apr 20, 2026' covers Mar 2026)", () => {
  const reading = {
    sections: [
      {
        type: "timing_section",
        title: "Windows",
        transits: [{
          planet: "Pluto", aspect: "square", natal_point: "Moon",
          date_range: "Feb 1–Apr 20, 2026",
          interpretation: "Pass 1.",
        }],
        windows: [],
      },
      {
        type: "narrative_section",
        title: "Spring",
        body: "March 2026 is when things shift.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const body = (reading.sections[1] as any).body;
  assert(body.includes("March 2026"), `should keep March 2026 covered by 'Feb 1–Apr 20, 2026', got: ${body}`);
});

Deno.test("dates: year-rollover range parses correctly ('Nov 15 to Feb 10, 2027' covers Dec 2026 AND Jan 2027)", () => {
  const reading = {
    sections: [
      {
        type: "timing_section",
        title: "Windows",
        transits: [],
        windows: [{ label: "Nov 15 to Feb 10, 2027", description: "Cross-year band." }],
      },
      {
        type: "summary_box",
        title: "Strategy Summary",
        value: "Plan for Dec 2026. Also Jan 2027.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const value = (reading.sections[1] as any).value;
  assert(value.includes("Dec 2026"), `should keep Dec 2026 in year-rollover window, got: ${value}`);
  assert(value.includes("Jan 2027"), `should keep Jan 2027 in year-rollover window, got: ${value}`);
});

Deno.test("dates: applying→separating endpoints synthesize a coverage range when date_range is missing", () => {
  const reading = {
    sections: [
      {
        type: "timing_section",
        title: "Windows",
        transits: [{
          planet: "Jupiter", aspect: "conjunct", natal_point: "Venus",
          first_applying_date: "May 8, 2026",
          exact_hit_date: "May 18, 2026",
          separating_end_date: "Jun 2, 2026",
          interpretation: "Single pass.",
          // NOTE: no date_range field — must be synthesized.
        }],
        windows: [],
      },
      {
        type: "summary_box",
        title: "Strategy",
        value: "May 2026 is the window.",
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const value = (reading.sections[1] as any).value;
  assert(value.includes("May 2026"), `should keep May 2026 from synthesized applying→separating range, got: ${value}`);
});

Deno.test("nested: validates strings inside subsections[].body", () => {
  const reading = {
    sections: [
      {
        type: "modality_element",
        title: "Balance",
        elements: [{ name: "Water", count: 0 }],
        subsections: [
          { title: "Detail", body: "You have four Water placements right here." },
        ],
      },
    ],
  };
  validateReading(reading, CHART_CONTEXT);
  const subBody = (reading.sections[0] as any).subsections[0].body;
  assert(subBody.includes("three Water"), `expected nested fix, got: ${subBody}`);
});

Deno.test("report: _validation block is always attached, even on a clean reading", () => {
  const reading = { sections: [{ type: "narrative_section", body: "All good." }] };
  validateReading(reading, CHART_CONTEXT);
  assertExists((reading as any)._validation);
});

Deno.test("report: drift_count equals sum of all buckets", () => {
  const reading = {
    sections: [
      {
        type: "modality_element",
        elements: [{ name: "Water", count: 0 }],
        balance_interpretation: "You have four Water placements.",
      },
      {
        ...baseTimingSection(),
        body: "Your Mars conjunct Ascendant is obvious. By Nov 5, 2026 things shift.",
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
  assert(v.drift_count >= 3, "expected count fix plus aspect/date strips");
});
