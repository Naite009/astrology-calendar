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
  rule:
    | "planet-job"
    | "house-meaning"
    | "mutual-reception"
    | "final-authority"
    | "sign-speed"
    | "life-stage-erasure"
    | "saturn-leak"
    | "chiron-leak"
    | "mechanical-voice"
    | "parenting-burden";
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
  // 2nd house ≠ daily rhythm / groups.
  {
    re: /2nd house[^.]{0,80}(daily rhythm|group|belonging|public)/i,
    rule: "house-meaning",
    expected: "2nd house = body safety, worth, resources, sustainability. Not daily rhythm (6th), not groups (11th).",
  },
  // 4th house ≠ public expression.
  {
    re: /4th house[^.]{0,80}(public|visible|on display|broadcast|performance)/i,
    rule: "house-meaning",
    expected: "4th house = private inner room, family imprint, emotional root. Public/visible is the 10th house.",
  },
  // 7th-house "other person's mood" language outside the 7th.
  {
    re: /(?:in the )?(?:1st|2nd|3rd|4th|5th|6th|8th|9th|10th|11th|12th) house[^.]{0,120}other person'?s mood/i,
    rule: "house-meaning",
    expected: "'Other person's mood' is 7th-house framing. Do not apply to non-7th-house placements.",
  },
  // Group/belonging language attached to non-11th placements.
  {
    re: /(?:in the )?(?:1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|12th) house[^.]{0,120}(group belonging|trusted circle|peer field|still part of the group)/i,
    rule: "house-meaning",
    expected: "Group belonging language belongs to the 11th house only.",
  },
  // Body-safety language attached to non-2nd placements.
  {
    re: /(?:in the )?(?:1st|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th) house[^.]{0,120}(body safety|sustainability|what feels sustainable)/i,
    rule: "house-meaning",
    expected: "Body-safety / sustainability language belongs to the 2nd house only.",
  },
  // Nervous-system friction language attached to non-6th placements.
  {
    re: /(?:in the )?(?:1st|2nd|3rd|4th|5th|7th|8th|9th|10th|11th|12th) house[^.]{0,120}(nervous system friction|routed through the nervous system|body strain)/i,
    rule: "house-meaning",
    expected: "Nervous-system friction belongs to the 6th house only.",
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

// MECHANICAL-VOICE bans for the main Portrait text. These words may appear
// inside the deep-dive "mechanism" layer but must not show up in core/parent
// paragraphs. Detected via field paths; see validateComposedPortrait below.
const MECHANICAL_WORDS = /(?:circuit|voltage|hardware|the (?:signal|output)|discharges the circuit|firing the circuit)/i;
const MECHANICAL_BAN = {
  re: MECHANICAL_WORDS,
  rule: "mechanical-voice" as const,
  expected:
    "Main Portrait must read human. Translate mechanical wording into: what it feels like, what it looks like, what helps. Reserve circuit/voltage/signal for the deep-dive layer.",
};

// PARENTING-BURDEN bans: child must not be told to self-regulate or
// self-pause. Adults create the pause and lower the pressure.
const PARENTING_BANS: Array<{ re: RegExp; rule: ValidationViolation["rule"]; expected: string }> = [
  {
    re: /\b(the child|he|she|they) should (pause|regulate|self-?regulate|slow down|calm down)\b/i,
    rule: "parenting-burden",
    expected: "Reframe as adult action: 'Adults should create the pause' / 'Adults should lower the pressure and give space.'",
  },
  {
    re: /\bbuild in a pause on purpose\b/i,
    rule: "parenting-burden",
    expected: "Reframe as adult-directed: 'Adults should create the pause for them instead of demanding they create it under pressure.'",
  },
];

const ALL_BANS = [
  ...PLANET_JOB_BANS,
  ...HOUSE_MEANING_BANS,
  ...SIGN_SPEED_BANS,
  ...FINAL_AUTHORITY_BANS,
  ...PARENTING_BANS,
];

// Field paths where mechanical wording is NOT allowed (main Portrait, parent
// translation, headlines). The "deepDive" / "mechanism" / "chartStory" paths
// are exempt because that's where the technical layer lives.
const MECHANICAL_PROTECTED_PATHS = /^(corePortrait|parentTranslation|headline|tagline|liveMechanic|finalAuthority)/i;

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

// Optional chart context for chart-aware leak detection. When provided, we
// flag Saturn audit language / Chiron permission language that appears in
// charts where those planets are NOT actually central.
export type ChartValidationContext = {
  saturnCentral?: boolean; // tight Sun–Saturn, Merc–Sat reception, or Saturn angular
  chironCentral?: boolean; // tight Sun–Chiron, Chiron angular, or Chiron on a luminary
  ikeAuthorityPattern?: boolean; // Mars Aries + Sun/Pluto pressure + Mercury/Jupiter loop
  // Pronoun / name normalization. When supplied, repeated full-name and
  // self-referential constructions ("Ben Levin feels Ben Levin still has a
  // place") get collapsed into pronoun-correct prose.
  profile?: {
    firstName: string;
    fullName?: string;
    pronouns?: {
      subject: string;      // he / she / they
      object: string;       // him / her / them
      possessive: string;   // his / her / their
      reflexive?: string;   // himself / herself / themself
    };
    isChild?: boolean;
  };
  // The ONE actual mutual-reception pair active in this chart. Used to keep
  // generic "closed loop" wording from drifting into the wrong pair's
  // interpretation. Set to null when there is no mutual reception.
  mutualReceptionPair?: "merc-sat" | "merc-jup" | "venus-jup" | "mars-merc" | null;
};

// Canonical "closed loop between …" phrasing per mutual-reception pair.
// These are the only allowed completions when describing the loop.
const MR_LOOP_TEXT: Record<NonNullable<ChartValidationContext["mutualReceptionPair"]>, string> = {
  "merc-sat": "a closed loop between original thinking and self-correction",
  "merc-jup": "a closed loop between impression and explanation",
  "venus-jup": "a closed loop between truth/freedom and safety/stability",
  "mars-merc": "a closed loop between action and language",
};

const SATURN_LEAK_RE = /\b(audit|correct enough|doing it wrong|standards check|self-correction)\b/i;
const CHIRON_LEAK_RE = /\b(permission wound|allowed to be said|Chiron permission|permission check)\b/i;

export function validateComposedPortrait(
  portrait: ComposedPortrait,
  ctx?: ChartValidationContext,
): ValidationResult {
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
    // Mechanical-voice only flagged in main/parent-facing fields.
    if (MECHANICAL_PROTECTED_PATHS.test(loc)) {
      const m = MECHANICAL_BAN.re.exec(value);
      if (m) {
        violations.push({
          rule: MECHANICAL_BAN.rule,
          location: loc,
          found: m[0].slice(0, 160),
          expected: MECHANICAL_BAN.expected,
        });
      }
    }
    // Chart-aware Saturn / Chiron leak detection.
    if (ctx) {
      if (ctx.saturnCentral === false) {
        const m = SATURN_LEAK_RE.exec(value);
        if (m) {
          violations.push({
            rule: "saturn-leak",
            location: loc,
            found: m[0].slice(0, 160),
            expected:
              "Saturn-flavored audit/correctness language is only allowed when Saturn is actually central (tight Sun–Saturn, Merc–Sat reception, or angular Saturn). Replace with the chart's actual pressure gate.",
          });
        }
      }
      if (ctx.chironCentral === false) {
        const m = CHIRON_LEAK_RE.exec(value);
        if (m) {
          violations.push({
            rule: "chiron-leak",
            location: loc,
            found: m[0].slice(0, 160),
            expected:
              "Chiron permission-wound language is only allowed when Chiron is actually central. Replace with the chart's actual permission/authority source.",
          });
        }
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

// ─────────────────────────────────────────────────────────────────────────
// FINAL QA PASS — sentence-level auto-sanitizer
//
// Per the "10/10 VALIDATION MODE" spec, do NOT rewrite the whole Portrait.
// We walk every string field, split on sentence boundaries, and rewrite or
// drop ONLY the sentences that fail Check 1–7. Everything else is preserved
// byte-for-byte. The depth/structure/sections stay intact.
// ─────────────────────────────────────────────────────────────────────────

type SentenceFix =
  | { kind: "drop" }
  | { kind: "replace"; with: string };

// Each rule returns either null (sentence passes) or a SentenceFix.
type SentenceRule = (s: string, loc: string, ctx: ChartValidationContext | undefined) => SentenceFix | null;

const PARENT_BURDEN_REWRITES: Array<[RegExp, string]> = [
  [/\b(the child|he|she|they) should pause\b[^.]*\./gi,
    "Adults should create the pause instead of asking the child to create it under pressure."],
  [/\b(the child|he|she|they) should (regulate|self-?regulate|calm down|slow down)\b[^.]*\./gi,
    "Adults should lower the pressure and give space until the child's regulation need has been met."],
  [/\bbuild in a pause on purpose\b[^.]*\./gi,
    "Adults should create the pause for them instead of demanding they create it under pressure."],
];

const SENTENCE_RULES: SentenceRule[] = [
  // FINAL IKE QA — exact broken role/template lines
  (s) => /Mars in Aries processes the words BEFORE they exit/i.test(s)
    ? { kind: "replace", with: "What gets blocked is the slower, more private Mercury-in-Pisces explanation. Mars in Aries may act first, while Mercury is still translating the feeling into language." }
    : null,
  (s, _loc, ctx) => ctx?.ikeAuthorityPattern === true && /Final authority\s*=\s*Mercury timing\.?/i.test(s)
    ? { kind: "replace", with: "Final authority = Mars in Aries + Sun/Pluto pressure + Mercury/Jupiter translation loop. Mercury explains later; Mars moves first." }
    : null,
  (s) => /Moon in Sagittarius[^.]{0,80}regulation happens in ordinary daily rhythm/i.test(s) || /regulation happens in ordinary daily rhythm[^.]*\(2nd house\)/i.test(s)
    ? { kind: "drop" }
    : null,

  // CHECK 2 — planet roles
  (s) => /Moon[^.]{0,100}(I should have said|deliver(?:s|ed)? the words|produce[sd]? the (?:words|language|sentence))/i.test(s)
    ? { kind: "drop" } : null,
  (s) => /Mars[^.]{0,100}(produce[sd]? the (?:words|language|sentence|answer)|deliver(?:s|ed)? the (?:words|language|sentence))/i.test(s)
    ? { kind: "drop" } : null,
  (s) => /Mercury[^.]{0,100}(regulate[sd]?|reset(?:s|ting)?)\s+(?:the\s+)?(?:emotion|feeling|nervous system|mood)/i.test(s)
    ? { kind: "drop" } : null,
  (s) => /\bSun[^.]{0,100}(deliver(?:s|ed)? the (?:words|language|sentence)|produce[sd]? the (?:words|language|sentence))/i.test(s)
    ? { kind: "drop" } : null,

  // CHECK 1 — Saturn / Chiron leaks (chart-aware)
  (s, _loc, ctx) => {
    if (!ctx || ctx.saturnCentral !== false) return null;
    return /\b(audit|correct enough|doing it wrong|standards check|self-correction)\b/i.test(s) ? { kind: "drop" } : null;
  },
  (s, _loc, ctx) => {
    if (!ctx || ctx.chironCentral !== false) return null;
    return /\b(permission wound|Chiron permission|permission check|allowed to be said)\b/i.test(s) ? { kind: "drop" } : null;
  },

  // CHECK 3 — house meaning leaks (cross-house misuse)
  (s) => /11th house[^.]{0,80}(daily rhythm|nervous system|body strain|habits)/i.test(s) ? { kind: "drop" } : null,
  (s) => /6th house[^.]{0,80}(group belonging|peer field|trusted circle|friend network)/i.test(s) ? { kind: "drop" } : null,
  (s) => /12th house[^.]{0,80}(public|visible|broadcast|on display)/i.test(s) ? { kind: "drop" } : null,
  (s) => /4th house[^.]{0,80}(public|visible|on display|broadcast|performance)/i.test(s) ? { kind: "drop" } : null,
  (s) => /(?:in the )?(?:1st|2nd|3rd|4th|5th|6th|8th|9th|10th|11th|12th) house[^.]{0,120}other person'?s mood/i.test(s) ? { kind: "drop" } : null,
  (s) => /(?:in the )?(?:1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|12th) house[^.]{0,120}(still part of the group|trusted belonging|peer field)/i.test(s) ? { kind: "drop" } : null,
  (s) => /(?:in the )?(?:1st|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th) house[^.]{0,120}(body safety|what feels sustainable)/i.test(s) ? { kind: "drop" } : null,

  // CHECK 4 — banned generic mutual-reception wording
  (s) => /authority (?:passes|hands|circulates) (?:back and forth|between)/i.test(s)
    ? { kind: "replace", with: s.replace(/authority (?:passes|hands|circulates) (?:back and forth|between)[^.]*/i,
        "they form a closed loop between their separate jobs") }
    : null,

  // CHECK 6 — mechanical voice, only in main/parent fields
  (s, loc) => {
    if (!MECHANICAL_PROTECTED_PATHS.test(loc)) return null;
    return /\b(discharges the circuit|firing the circuit|the (?:signal|output)|voltage|hardware|circuit)\b/i.test(s)
      ? { kind: "drop" } : null;
  },

  // CHECK 4b — mutual-reception PAIR meaning must match this chart's pair.
  // If a sentence describes a "closed loop between …" with the wrong pair,
  // rewrite the trailing phrase to the canonical pair text.
  (s, _loc, ctx) => {
    if (!ctx?.mutualReceptionPair) return null;
    if (!/closed loop between/i.test(s)) return null;
    const canonical = MR_LOOP_TEXT[ctx.mutualReceptionPair];
    const fixed = s.replace(/a closed loop between[^.]*/i, canonical);
    return fixed === s ? null : { kind: "replace", with: fixed };
  },

  // CHECK 6b — expanded mechanical voice (main/parent-facing fields only).
  // Adds: system, gate, medium, discharge, output, signal — these may
  // appear in deep-dive sections, never in the main human-voice prose.
  (s, loc) => {
    if (!MECHANICAL_PROTECTED_PATHS.test(loc)) return null;
    return /\b(load tests?|operating manual|nervous system gate|the medium|the gate|the system runs|run as (?:a )?(?:signal|circuit|voltage))\b/i.test(s)
      ? { kind: "drop" }
      : null;
  },

  // CHECK 1b — self-referential repeated-name constructions that the
  // pronoun pre-pass can't always collapse cleanly. e.g. "Ben Levin feels
  // Ben Levin still has a place." These are dropped so the surrounding
  // paragraph re-reads naturally on the next render.
  (s, _loc, ctx) => {
    const first = ctx?.profile?.firstName;
    if (!first) return null;
    const re = new RegExp(`\\b${escapeRe(first)}\\b[^.]{0,40}\\b${escapeRe(first)}\\b[^.]{0,40}\\b${escapeRe(first)}\\b`, "i");
    return re.test(s) ? { kind: "drop" } : null;
  },
];

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Split on sentence boundaries while preserving the trailing punctuation.
// IMPORTANT: if a string has no sentence terminator (e.g. a short label like
// "In real time:" or a lead like "Mars in Aries (5th house)"), we must
// return the WHOLE string as a single "sentence" — otherwise we silently
// drop everything before the last non-whitespace token.
function splitSentences(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== "." && ch !== "!" && ch !== "?") continue;
    const prev = text[i - 1];
    const next = text[i + 1];
    if (/\d/.test(prev ?? "") && /\d/.test(next ?? "")) continue;
    let end = i + 1;
    while (/["')\]]/.test(text[end] ?? "")) end++;
    out.push(text.slice(start, end));
    start = end;
  }
  if (start < text.length) out.push(text.slice(start));
  return out.length ? out : [text];
}

// Pronoun / name normalization for a single string field. Applied BEFORE
// sentence-level rules so they see clean text.
//   1. Collapse fullName → firstName everywhere.
//   2. Within one sentence, replace 2nd+ occurrences of firstName with the
//      profile's subject pronoun (lower-case; sentence start stays as name).
//   3. Collapse "<name> <verb> <name>" reflexive loops to pronoun form.
function normalizePronouns(value: string, ctx: ChartValidationContext | undefined): string {
  const profile = ctx?.profile;
  if (!profile) return value;
  const first = profile.firstName;
  const full = profile.fullName;
  const subj = profile.pronouns?.subject ?? "they";
  const poss = profile.pronouns?.possessive ?? "their";
  let out = value;

  // 1. Fullname → first name.
  if (full && full !== first) {
    out = out.replace(new RegExp(`\\b${escapeRe(full)}\\b`, "g"), first);
  }

  // 2. Collapse "<First> ... <First>" within a sentence to "<First> ... <subj>".
  //    Only collapse the second+ occurrence per sentence to avoid breaking
  //    headlines or quoted speech.
  const sentenceRe = /[^.!?]+[.!?]?/g;
  out = out.replace(sentenceRe, (sent) => {
    let count = 0;
    return sent.replace(new RegExp(`\\b${escapeRe(first)}\\b('s)?`, "g"), (m, s) => {
      count++;
      if (count === 1) return m;
      return s ? poss : subj;
    });
  });

  // 3. Collapse explicit reflexive constructions left over from templating.
  //    e.g. "may look like Ike is reacting" — already fine; but
  //    "feels <First> still has" → "feels <subj> still has".
  out = out.replace(
    new RegExp(`\\b(feels|knows|thinks|believes|sees|wants|needs)\\s+${escapeRe(first)}\\b`, "gi"),
    `$1 ${subj}`,
  );

  return out;
}

function sanitizeString(value: string, loc: string, ctx: ChartValidationContext | undefined): string {
  const pre = normalizePronouns(value, ctx);
  const sentences = splitSentences(pre);
  const out: string[] = [];
  for (let sentence of sentences) {
    let dropped = false;
    for (const rule of SENTENCE_RULES) {
      const fix = rule(sentence, loc, ctx);
      if (!fix) continue;
      if (fix.kind === "drop") { dropped = true; break; }
      sentence = fix.with;
    }
    if (!dropped) out.push(sentence);
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}

function sanitizeWalk(obj: unknown, ctx: ChartValidationContext | undefined, path = ""): unknown {
  if (obj == null) return obj;
  if (typeof obj === "string") return sanitizeString(obj, path, ctx);
  if (Array.isArray(obj)) return obj.map((v, i) => sanitizeWalk(v, ctx, `${path}[${i}]`));
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      out[k] = sanitizeWalk(v, ctx, path ? `${path}.${k}` : k);
    }
    return out;
  }
  return obj;
}

/**
 * Final QA pass. Walks every string field of the Portrait and rewrites or
 * drops ONLY sentences that fail Checks 1–7. Returns a new ComposedPortrait
 * with the same shape — sections, depth, and structure are preserved.
 */
export function sanitizeComposedPortrait(
  portrait: ComposedPortrait,
  ctx?: ChartValidationContext,
): ComposedPortrait {
  const sanitized = sanitizeWalk(portrait, ctx) as ComposedPortrait;
  sanitized.misreads = (sanitized.misreads ?? []).filter(
    (m) => m.looksLike?.trim().length > 0 && m.actuallyIs?.trim().length > 0,
  );
  return sanitized;
}
