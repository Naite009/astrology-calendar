import { describe, it, expect } from "vitest";
import {
  validateComposedPortrait,
  sanitizeComposedPortrait,
  type ChartValidationContext,
} from "../portraitValidator";
import type { ComposedPortrait } from "../portraitComposer";

const baseLong =
  "This child meets the world body-first, and the words come a beat after the body has already moved. " +
  "Before any sentence, the reflex fires at the skin and the room feels the shift before the explanation. " +
  "When several things hit at once, it may look like overreaction, but inside they are trying to move, be seen, " +
  "protect their power, and find words all at the same time. The translation surfaces later, in private.";

const makePortrait = (overrides: Partial<ComposedPortrait> = {}): ComposedPortrait => ({
  lifeStageChapter: "Early childhood",
  corePortrait: baseLong,
  systemMechanism: {
    driver: { label: "Sun in Scorpio (1st house)", detail: "needs to know what is really going on" },
    translator: { label: "Mercury in Pisces (12th house)", detail: "words surface underwater, delayed" },
    trigger: { label: "Mars in Aries (1st house)", detail: "reflex at the skin", derivation: "rising ruler" },
    reaction: "body moves before words.",
    synthesis: "Mars acts first, before any sentence forms. Mercury in Pisces drafts the words underwater and surfaces them later, in private, after the body has already moved. The room sees the reflex; the explanation lands hours later.",
  },
  stageAsk: { title: "Ask", body: "Give space for the body to settle before asking what happened." },
  misreads: [
    {
      looksLike: "moving before they finish talking, cutting in, or walking off mid-sentence",
      actuallyIs: "their body already knows what it wants to do, and waiting feels physically wrong",
    },
  ],
  whatHelps: ["movement first, talk second"],
  chartStory: "Mars on the rising fires first. Mercury in Pisces in the 12th drafts the sentence underwater.",
  themesPicked: ["body-first", "delayed words"],
  ...overrides,
});

const ikeCtx: ChartValidationContext = {
  placements: { mercuryHouse: 12, marsHouse: 1, moonHouse: null },
  mutualReceptionPair: "merc-jup",
  profile: { firstName: "Ike", pronouns: { subject: "he", object: "him", possessive: "his" } },
};

describe("validateComposedPortrait", () => {
  it("passes a clean Ike-style portrait", () => {
    const result = validateComposedPortrait(makePortrait(), ikeCtx);
    const blocking = result.violations.filter(
      (v) => v.rule !== "missing-placement-anchor",
    );
    expect(blocking).toEqual([]);
  });

  it("flags Mars producing words (planet-job leak)", () => {
    const bad = makePortrait({
      systemMechanism: {
        ...makePortrait().systemMechanism,
        synthesis: "Mars produces the words and finishes the sentence offline.",
      },
    });
    const result = validateComposedPortrait(bad, ikeCtx);
    expect(result.violations.some((v) => v.rule === "planet-job")).toBe(true);
  });

  it("flags the banned 'authority passes back and forth' phrase", () => {
    const bad = makePortrait({
      chartStory: "The authority passes back and forth between Mercury and Jupiter.",
    });
    const result = validateComposedPortrait(bad, ikeCtx);
    expect(result.violations.some((v) => v.rule === "mutual-reception")).toBe(true);
  });

  it("flags em-dashes in user-facing copy", () => {
    const bad = makePortrait({ corePortrait: baseLong + " This — right here — is the pattern." });
    const result = validateComposedPortrait(bad, ikeCtx);
    expect(result.violations.some((v) => v.rule === "em-dash")).toBe(true);
  });

  it("flags a missing Mercury-12th anchor", () => {
    const bad = makePortrait({
      corePortrait: "Generic copy about being thoughtful and aware.".repeat(8),
      systemMechanism: {
        ...makePortrait().systemMechanism,
        translator: { label: "Mercury", detail: "thinks carefully" },
        synthesis: "Generic synthesis with no anchor signal.",
      },
    });
    const result = validateComposedPortrait(bad, ikeCtx);
    expect(
      result.violations.some(
        (v) => v.rule === "missing-placement-anchor" && /Mercury in 12th/.test(v.expected),
      ),
    ).toBe(true);
  });
});

describe("sanitizeComposedPortrait", () => {
  it("strips em-dashes from output", () => {
    const dirty = makePortrait({ corePortrait: baseLong + " This — right here — is it." });
    const cleaned = sanitizeComposedPortrait(dirty, ikeCtx);
    expect(cleaned.corePortrait).not.toMatch(/—/);
  });

  it("collapses name loops to a pronoun", () => {
    const dirty = makePortrait({
      corePortrait: "Ike feels Ike. Ike then asks Ike what Ike wants. " + baseLong,
    });
    const cleaned = sanitizeComposedPortrait(dirty, ikeCtx);
    // After normalization, "Ike Ike Ike" should not survive verbatim.
    expect(/Ike (feels|then asks) Ike/.test(cleaned.corePortrait)).toBe(false);
  });

  it("backfills corePortrait with chart-specific fallback if gutted under 200 chars", () => {
    const dirty = makePortrait({ corePortrait: "Short." });
    const cleaned = sanitizeComposedPortrait(dirty, ikeCtx);
    expect(cleaned.corePortrait.length).toBeGreaterThanOrEqual(200);
    // Should pull from systemMechanism.synthesis or chartStory.
    expect(
      cleaned.corePortrait.includes("Mars acts") ||
        cleaned.corePortrait.includes("Mars on the rising"),
    ).toBe(true);
  });

  it("attaches a sanitizationDiff log for dev review", () => {
    const dirty = makePortrait({ corePortrait: baseLong + " A — b — c." });
    const cleaned = sanitizeComposedPortrait(dirty, ikeCtx);
    expect(cleaned.validation?.sanitizationDiff).toBeDefined();
  });

  it("removes banned family-reading trait words", () => {
    const dirty = makePortrait({
      chartStory: "She is a dreamer and tends to be scattered and moody around peers.",
    });
    const cleaned = sanitizeComposedPortrait(dirty, ikeCtx);
    expect(cleaned.chartStory).not.toMatch(/dreamer|scattered|moody/i);
  });
});
