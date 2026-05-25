import { describe, it, expect } from "vitest";
import { composePortrait } from "../portraitComposer";

// Minimal ChildPortrait/NatalChart fixture that triggers the Section 9
// editorial blocks (9a Power+Restraint and 9c Consequence-Awareness) where
// the grammar helpers (G.is / G.subj / G.v / G.refl / G.pposs / G.does) are
// densely used. The goal is to assert that when `composePortrait` is called
// WITHOUT a profile, the name-safe singular fallback in buildGrammar() is
// active, so we never see "they is", "they lets", "they knows", etc.
const makePortrait = (name = "Lauren Newman") =>
  ({
    name,
    age: 47,
    lifePhase: "adult",
    developmentalAnchor: {
      stage: "Midlife integration",
      focus: "integration",
      body: "the integration chapter",
    },
    identityInvitation: {
      sun: { sign: "Libra", house: 1, line: "" },
    },
    masterySpot: {
      saturn: {
        sign: "Leo",
        house: 10,
        struggle: "",
        howToSupport: "",
      },
    },
    mathCheck: { moonAspects: [] },
    tightestAspects: [],
    energyDischarge: { marsSign: "Libra", marsHouse: 1 },
    chartRuler: {
      rulerName: "Venus",
      rulerSign: "Sagittarius",
      rulerHouse: 2,
      ascSign: "Libra",
      line: "",
    },
    cognitiveProfile: { mercurySign: "Libra" },
    ascendant: { sign: "Libra" },
  }) as any;

const makeChart = () =>
  ({
    planets: {
      Sun: { sign: "Libra", house: 1, degree: 10, minutes: 0 },
      Moon: { sign: "Sagittarius", house: 2, degree: 10, minutes: 0 },
      Mercury: { sign: "Libra", house: 1, degree: 8, minutes: 0 },
      Venus: { sign: "Sagittarius", house: 2, degree: 5, minutes: 0 },
      Mars: { sign: "Libra", house: 1, degree: 12, minutes: 0 },
      Jupiter: { sign: "Taurus", house: 8, degree: 4, minutes: 0 },
      Saturn: { sign: "Leo", house: 10, degree: 20, minutes: 0 },
    },
    houseCusps: {
      house1: { sign: "Libra", degree: 0, minutes: 0 },
      house2: { sign: "Scorpio", degree: 0, minutes: 0 },
      house3: { sign: "Sagittarius", degree: 0, minutes: 0 },
      house4: { sign: "Capricorn", degree: 0, minutes: 0 },
      house5: { sign: "Aquarius", degree: 0, minutes: 0 },
      house6: { sign: "Pisces", degree: 0, minutes: 0 },
      house7: { sign: "Aries", degree: 0, minutes: 0 },
      house8: { sign: "Taurus", degree: 0, minutes: 0 },
      house9: { sign: "Gemini", degree: 0, minutes: 0 },
      house10: { sign: "Cancer", degree: 0, minutes: 0 },
      house11: { sign: "Leo", degree: 0, minutes: 0 },
      house12: { sign: "Virgo", degree: 0, minutes: 0 },
    },
  }) as any;

describe("composePortrait — name-safe singular pronoun fallback", () => {
  const result = composePortrait(makePortrait(), makeChart());
  const haystack = [
    result.corePortrait,
    result.systemMechanism?.synthesis ?? "",
    result.chartStory ?? "",
    result.stageAsk?.body ?? "",
  ]
    .join("\n")
    .toLowerCase();

  it("does NOT contain plural agreement on 'they'", () => {
    const banned = [
      /\bthey is\b/,
      /\bthey has\b/,
      /\bthey was\b/,
      /\bthey does\b/,
      /\bthey lets\b/,
      /\bthey knows\b/,
      /\bthey speaks\b/,
      /\bthey explains\b/,
      /\bthey feels\b/,
      /\bthey owns\b/,
      /\bthey becomes\b/,
      /\bthey presents\b/,
      /\bthey holds\b/,
      /\bthey lacks\b/,
    ];
    for (const re of banned) {
      expect(haystack, `banned phrase ${re} found in output`).not.toMatch(re);
    }
  });

  it("does NOT use a standalone 'they' subject in name-safe fallback mode", () => {
    // No bare "they " followed by a verb in the rendered copy when fallback fires.
    expect(haystack).not.toMatch(/\bthey \w+s\b/);
  });

  it("uses the person's name in subject and possessive slots", () => {
    expect(result.corePortrait).toMatch(/Lauren Newman/);
    // possessive form should be "Lauren Newman's"
    expect(result.corePortrait).toMatch(/Lauren Newman'?s/);
  });

  it("renders singular verb agreement with the name as subject", () => {
    // e.g. "Lauren Newman is significantly more powerful than Lauren Newman lets on"
    expect(result.corePortrait).toMatch(/Lauren Newman is/);
  });
});
