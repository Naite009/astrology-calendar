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

// ── Real pronoun support ─────────────────────────────────────────────────
// When a PortraitProfile carries explicit pronouns, the grammar helper
// should use them with correct singular / plural verb agreement and
// reflexives, while the name-safe singular fallback continues to work
// when pronouns are missing.

const collect = (result: any): string =>
  [
    result.corePortrait,
    result.systemMechanism?.synthesis ?? "",
    result.chartStory ?? "",
    result.stageAsk?.body ?? "",
  ].join("\n");

describe("composePortrait — explicit pronoun rendering", () => {
  it("renders she / her / herself with singular agreement", () => {
    const result = composePortrait(makePortrait("Lauren Newman"), makeChart(), {
      firstName: "Lauren",
      fullName: "Lauren Newman",
      pronouns: { subject: "she", object: "her", possessive: "her", reflexive: "herself" },
    });
    const text = collect(result).toLowerCase();
    // Some occurrence of she + singular verb agreement
    expect(text).toMatch(/\bshe (is|knows|has|feels|speaks|lets|does)\b/);
    // Reflexive
    expect(text).not.toMatch(/\bhimself\b|\bthemself\b|\bthemselves\b/);
    // No mis-agreement
    expect(text).not.toMatch(/\bshe are\b/);
    expect(text).not.toMatch(/\bshe have\b/);
    expect(text).not.toMatch(/\bshe do\b/);
    // No leaked default "they"
    expect(text).not.toMatch(/\bthey is\b/);
  });

  it("renders he / him / himself with singular agreement", () => {
    const result = composePortrait(makePortrait("Ben Levin"), makeChart(), {
      firstName: "Ben",
      fullName: "Ben Levin",
      pronouns: { subject: "he", object: "him", possessive: "his", reflexive: "himself" },
    });
    const text = collect(result).toLowerCase();
    expect(text).toMatch(/\bhe (is|knows|has|feels|speaks|lets|does)\b/);
    expect(text).not.toMatch(/\bherself\b|\bthemself\b|\bthemselves\b/);
    expect(text).not.toMatch(/\bhe are\b/);
    expect(text).not.toMatch(/\bhe have\b/);
    expect(text).not.toMatch(/\bhe do\b/);
  });

  it("renders they / them / themself with plural agreement", () => {
    const result = composePortrait(makePortrait("Sam Rivera"), makeChart(), {
      firstName: "Sam",
      fullName: "Sam Rivera",
      pronouns: { subject: "they", object: "them", possessive: "their", reflexive: "themself" },
    });
    const text = collect(result).toLowerCase();
    // Plural agreement present
    expect(text).toMatch(/\bthey (are|have|know|feel|speak|let|do)\b/);
    // No singular-on-they leakage
    expect(text).not.toMatch(/\bthey is\b/);
    expect(text).not.toMatch(/\bthey has\b/);
    expect(text).not.toMatch(/\bthey knows\b/);
    expect(text).not.toMatch(/\bthey does\b/);
    // Reflexive consistent
    expect(text).not.toMatch(/\bherself\b|\bhimself\b/);
  });

  it("falls back safely to name + singular verbs when pronouns are missing", () => {
    const result = composePortrait(makePortrait("Lauren Newman"), makeChart(), {
      firstName: "Lauren",
      fullName: "Lauren Newman",
      // no pronouns
    });
    const text = collect(result);
    expect(text).toMatch(/Lauren/);
    expect(text.toLowerCase()).not.toMatch(/\bthey is\b/);
    expect(text.toLowerCase()).not.toMatch(/\bthey has\b/);
    expect(text.toLowerCase()).not.toMatch(/\bthey knows\b/);
  });
});

// ── Name-specific pronoun rendering (Lauren / Ben / Ike) ─────────────────
// Verifies the validator's legacy-plural rewriter converts hardcoded
// they/them/their copy into the configured singular pronouns alongside
// the grammar helper.
describe("composePortrait — named profiles render correct pronouns", () => {
  it("Lauren (she/her): no 'they' subjects, uses she/her/herself", () => {
    const result = composePortrait(makePortrait("Lauren Newman"), makeChart(), {
      firstName: "Lauren",
      fullName: "Lauren Newman",
      pronouns: { subject: "she", object: "her", possessive: "her", reflexive: "herself" },
    });
    const text = collect(result);
    const lower = text.toLowerCase();
    expect(lower).not.toMatch(/\bthey (is|are|has|have|knows|feels|does|do|lets)\b/);
    expect(lower).not.toMatch(/\bthemselves?\b/);
    // wrong-gender pronouns must not leak
    expect(lower).not.toMatch(/\bhimself\b/);
    expect(lower).not.toMatch(/\bhe (is|knows|feels|lets|has|does)\b/);
    // correct pronouns present
    expect(lower).toMatch(/\bshe (is|knows|feels|has|does|lets|speaks)\b/);
    expect(text).toMatch(/Lauren/);
  });

  it("Ben (he/him): no 'they' subjects, uses he/his/himself", () => {
    const result = composePortrait(makePortrait("Ben Levin"), makeChart(), {
      firstName: "Ben",
      fullName: "Ben Levin",
      pronouns: { subject: "he", object: "him", possessive: "his", reflexive: "himself" },
    });
    const text = collect(result);
    const lower = text.toLowerCase();
    expect(lower).not.toMatch(/\bthey (is|are|has|have|knows|feels|does|do|lets)\b/);
    expect(lower).not.toMatch(/\bthemselves?\b/);
    expect(lower).not.toMatch(/\bherself\b/);
    expect(lower).not.toMatch(/\bshe (is|knows|feels|lets|has|does)\b/);
    expect(lower).toMatch(/\bhe (is|knows|feels|has|does|lets|speaks)\b/);
    expect(text).toMatch(/Ben/);
  });

  it("Ike (he/him): no 'they' subjects, uses he/his/himself", () => {
    const result = composePortrait(makePortrait("Ike Levin"), makeChart(), {
      firstName: "Ike",
      fullName: "Ike Levin",
      pronouns: { subject: "he", object: "him", possessive: "his", reflexive: "himself" },
    });
    const text = collect(result);
    const lower = text.toLowerCase();
    expect(lower).not.toMatch(/\bthey (is|are|has|have|knows|feels|does|do|lets)\b/);
    expect(lower).not.toMatch(/\bthemselves?\b/);
    expect(lower).not.toMatch(/\bherself\b/);
    expect(lower).toMatch(/\bhe (is|knows|feels|has|does|lets|speaks)\b/);
    expect(text).toMatch(/Ike/);
  });

  it("Missing pronouns: full name preserved, no plural-on-singular agreement", () => {
    const result = composePortrait(makePortrait("Lauren Newman"), makeChart());
    const text = collect(result);
    expect(text).toMatch(/Lauren Newman/);
    const lower = text.toLowerCase();
    expect(lower).not.toMatch(/\bthey is\b/);
    expect(lower).not.toMatch(/\bthey has\b/);
    expect(lower).not.toMatch(/\bthey knows\b/);
  });
});
