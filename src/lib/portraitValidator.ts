// Global astrology validation layer for ComposedPortrait.
//
// Rules enforced (mirrors the GLOBAL ASTROLOGY VALIDATION LAYER spec):
//  1. Planet jobs stay separate (Mercury=words, Mars=body, Moon=reset,
//     Sun=identity, Saturn=audit, Chiron=sore spot, Chart Ruler=OS).
//  2. House meanings stay house-specific (e.g. 11th ≠ "daily rhythm";
//     that is 6th).
//  3. Timing wording must not claim sign-based speed.
//  4. Mutual reception must be technically correct and must NOT use the
//     phrase "authority passes back and forth".
//  5. Final authority must be chart-specific (no universal Chiron default
//     when the chart's pressure point is something else).
//  6. Life-stage anchor is the chapter, not the whole chart.
//  7. The composed output must pass A–H before display; violations are
//     auto-stripped when possible and otherwise flagged.

import type { ComposedPortrait } from "./portraitComposer";

export type ValidationViolation = {
  rule: "planet-job" | "house-meaning" | "mutual-reception" | "final-authority" | "sign-speed" | "life-stage-erasure";
  location: string;
  found: string;
  expected: string;
};

export type ValidationResult = {
  ok: boolean;
  violations: ValidationViolation[];
};

// ── Banned-phrase tables ───────────────────────────────────────────────────

// (regex, location-label-hint, expected-message) — these are PLANET JOB
// crossovers. Each entry's regex is checked against every string field.
const PLANET_JOB_BANS: Array<{
  re: RegExp;
  rule: ValidationViolation["rule"];
  expected: string;
}> = [
  // Moon must not produce "I should have said…" — that is Mercury.
  {
    re: /Moon[^.]{0,80}(I should have said|the words come|deliver(?:s|ed)? (?:the )?words|produce[sd]? (?:the )?(?:words|language|sentence))/i,
    rule: "planet-job",
    expected: "Moon = regulation/reset only. 'I should have said' belongs to Mercury, not the Moon.",
  },
  // Mars must not produce words/language.
  {
    re: /Mars[^.]{0,80}(produce[sd]? (?:the )?(?:words|language|sentence|answer)|deliver(?:s|ed)? (?:the )?(?:words|language|sentence))/i,
    rule: "planet-job",
    expected: "Mars = body reaction only. Words/language are Mercury's job.",
  },
  // Mercury must not regulate emotions.
  {
    re: /Mercury[^.]{0,80}(regulate[sd]?|reset(?:s|ting)?) (?:the )?(?:emotion|feeling|nervous system|mood)/i,
    rule: "planet-job",
    expected: "Mercury = words/processing. Regulation belongs to the Moon.",
  },
  // Sun must not deliver language.
  {
    re: /Sun[^.]{0,80}(deliver(?:s|ed)? (?:the )?(?:words|language|sentence)|produce[sd]? (?:the )?(?:words|language|sentence))/i,
    rule: "planet-job",
    expected: "Sun = identity filter. Words are delivered by Mercury.",
  },
  // Generic mutual-reception phrasing banned.
  {
    re: /authority (?:passes|hands|circulates) (?:back and forth|between)/i,
    rule: "mutual-reception",
    expected: "Replace with 'traditional mutual reception — a closed loop between [planet A function] and [planet B function]'.",
  },
];

// (regex, expected) — these are HOUSE MEANING misuses.
const HOUSE_MEANING_BANS: Array<{
  re: RegExp;
  rule: ValidationViolation["rule"];
  expected: string;
}> = [
  // 11th house ≠ daily rhythm (that's 6th).
  {
    re: /11th house[^.]{0,80}(daily rhythm|nervous system|body strain|habits)/i,
    rule: "house-meaning",
    expected: "11th house = friends, teams, belonging, peer groups. 'Daily rhythm' is the 6th house.",
  },
  // 6th house ≠ belonging/groups.
  {
    re: /6th house[^.]{0,80}(group|belonging|peer|friend network|community)/i,
    rule: "house-meaning",
    expected: "6th house = nervous system, habits, daily friction. Belonging/groups is the 11th house.",
  },
  // 12th house ≠ public visibility.
  {
    re: /12th house[^.]{0,80}(public|visible|broadcast|on display)/i,
    rule: "house-meaning",
    expected: "12th house = hidden/submerged/delayed. Public visibility is the 10th house.",
  },
];

// SIGN-as-SPEED bans: sign names paired with speed adjectives.
const SIGN_SPEED_BANS: Array<{ re: RegExp; rule: ValidationViolation["rule"]; expected: string }> = [
  {
    re: /Mercury in (?:Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces) (?:is|runs) (?:fast|slow|quick|delayed) (?:thinking|processing)/i,
    rule: "sign-speed",
    expected: "Timing comes from HOUSE/ASPECTS, not sign. Sign describes style only.",
  },
  {
    re: /Mars in (?:Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces) (?:is|runs) (?:fast|slow|quick) (?:reaction|action)/i,
    rule: "sign-speed",
    expected: "Mars speed comes from HOUSE, not sign.",
  },
];

// FINAL-AUTHORITY universals: ban "Chiron permission" as the final authority
// unless the chart actually has a tight Sun–Chiron aspect. We can't check the
// chart from a pure string scan, so we just flag the phrase for human review;
// the composer is responsible for setting it correctly per-chart.
const FINAL_AUTHORITY_BANS: Array<{ re: RegExp; rule: ValidationViolation["rule"]; expected: string }> = [
  {
    re: /Final authority\s*=\s*Mercury timing \+ Chiron permission/i,
    rule: "final-authority",
    expected: "Default 'Mercury timing + Chiron permission' only when Sun–Chiron is the tight pressure point. Otherwise use the chart's actual pressure gate (e.g. Mercury/Saturn loop, Sun–Saturn check).",
  },
];

const ALL_BANS = [
  ...PLANET_JOB_BANS,
  ...HOUSE_MEANING_BANS,
  ...SIGN_SPEED_BANS,
  ...FINAL_AUTHORITY_BANS,
];

// Walk every string leaf in the portrait and yield [path, value] pairs.
function* walkStrings(obj: unknown, path = ""): Generator<[string, string]> {
  if (obj == null) return;
  if (typeof obj === "string") {
    yield [path, obj];
    return;
  }
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      yield* walkStrings(obj[i], `${path}[${i}]`);
    }
    return;
  }
  if (typeof obj === "object") {
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      yield* walkStrings(v, path ? `${path}.${k}` : k);
    }
  }
}

export function validateComposedPortrait(portrait: ComposedPortrait): ValidationResult {
  const violations: ValidationViolation[] = [];
  for (const [loc, value] of walkStrings(portrait)) {
    for (const ban of ALL_BANS) {
      const m = ban.re.exec(value);
      if (m) {
        violations.push({
          rule: ban.rule,
          location: loc,
          found: m[0].slice(0, 160),
          expected: ban.expected,
        });
      }
    }
  }
  return { ok: violations.length === 0, violations };
}

// Chart-specific final-authority resolver. Pass in the detected signatures
// and get the correct sentence back. Use this whenever a section needs to
// state "Final authority = ..." so the wording matches the chart.
export type FinalAuthorityInputs = {
  mercSatReception?: boolean;        // Mercury+Saturn in each other's traditional signs
  venusJupReception?: boolean;       // Venus+Jupiter mutual reception
  mercJupReception?: boolean;        // Mercury+Jupiter mutual reception
  sunSaturnTight?: boolean;          // Sun–Saturn hard aspect under ~3°
  sunChironTight?: boolean;          // Sun–Chiron hard aspect under ~2.5°
  sunPlutoTight?: boolean;           // Sun–Pluto hard aspect under ~3°
  marsDominant?: boolean;            // Mars is the dominant/elevated planet
  mercury12th?: boolean;             // Mercury in the 12th house
  lifeStageLabel?: string | null;    // active phase label, e.g. "Mars life-stage"
};

export function resolveFinalAuthority(i: FinalAuthorityInputs): { line: string; rank: string } {
  // Mutual receptions take priority — they define the actual decision loop.
  if (i.mercSatReception) {
    return {
      line: `Final authority sits with the Mercury/Saturn loop: Mercury produces the answer, Saturn audits whether it is correct enough to say. Neither overrides the other; they hand the decision back and forth until both sign off${i.lifeStageLabel ? `, with ${i.lifeStageLabel} adding the pressure of the moment` : ""}.`,
      rank: `Final authority = Mercury/Saturn loop${i.lifeStageLabel ? ` + ${i.lifeStageLabel} pressure` : ""}.`,
    };
  }
  if (i.mercJupReception) {
    return {
      line: `Final authority sits with the Mercury/Jupiter loop: Jupiter supplies the meaning and big-picture frame, Mercury supplies the words. The decision is "is this true AND explainable?" before it exits.`,
      rank: `Final authority = Mercury/Jupiter loop.`,
    };
  }
  if (i.venusJupReception) {
    return {
      line: `Final authority sits with the Venus/Jupiter loop: Venus weighs honesty/worth, Jupiter weighs safety/meaning. Decisions oscillate between "what is honest" and "what is safe" until both clear.`,
      rank: `Final authority = Venus/Jupiter loop.`,
    };
  }
  // Tight pressure aspects — strongest wins.
  if (i.sunSaturnTight) {
    return {
      line: `Final authority sits with the Sun–Saturn pressure check: whether the version that exits is accurate and worth standing behind. Mars and what got said in the heat do not have the last word.`,
      rank: `Final authority = Sun–Saturn pressure check${i.lifeStageLabel ? ` + ${i.lifeStageLabel}` : ""}.`,
    };
  }
  if (i.sunPlutoTight) {
    return {
      line: `Final authority sits with the Sun–Pluto pressure check: who controls the room if this is said. The answer is filtered through a power/trust audit before it exits${i.marsDominant ? ", with Mars carrying the physical charge underneath" : ""}.`,
      rank: `Final authority = Sun–Pluto pressure check${i.marsDominant ? " + Mars dominance" : ""}.`,
    };
  }
  if (i.sunChironTight) {
    return {
      line: `Final authority sits with Mercury's timing and the Sun–Chiron permission check ("is this allowed to be said?"). Mars and what got said in the moment do not have the last word.`,
      rank: `Final authority = Mercury timing + Sun–Chiron permission${i.mercury12th ? " (Mercury 12th amplifies the delay)" : ""}.`,
    };
  }
  // Mars dominance fallback (e.g. Ike-style chart).
  if (i.marsDominant) {
    return {
      line: `Final authority sits with Mars carrying the body charge while Mercury tries to keep up with words. The decision is made in the body first; the explanation arrives after.`,
      rank: `Final authority = Mars dominance, Mercury catches up.`,
    };
  }
  // Default: Mercury timing.
  return {
    line: `Final authority sits with Mercury's timing — the full version arrives once the words finish forming. Not with Mars, not with what got said in the moment.`,
    rank: `Final authority = Mercury timing.`,
  };
}
