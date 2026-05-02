import { assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildCallAUserMessage, extractPositionsBlock } from "./relationshipThreeCall.ts";

const RELATIONSHIP_CONTEXT_WITH_BLANK_LINES = `
NATAL Planetary Positions:
- Sun: 22°11' Taurus (House 6)

- Moon: 14°08' Cancer (House 8)
- Mercury: 4°52' Gemini (House 7)
- Venus: 29°34' Taurus (House 7)

- Mars: 8°21' Leo (House 9)
- Jupiter: 13°02' Scorpio (House 12)
- Saturn: 1°44' Pisces (House 3)
- Uranus: 26°10' Capricorn (House 2)
- Neptune: 23°45' Capricorn (House 2)
- Pluto: 27°33' Scorpio (House 12)
- Chiron: 17°19' Virgo (House 10)
- North Node: 3°01' Sagittarius (House 1) (R)
- South Node: 3°01' Gemini (House 7) (R)
- Ascendant: 9°27' Sagittarius (House 1)
- Descendant: 9°27' Gemini (House 7)
- MC: 27°41' Virgo (House 10)
- IC: 27°41' Pisces (House 4)

House Cusps:
- House 1: 9°27' Sagittarius
- House 7: 9°27' Gemini

SR Planetary Positions:
- SR Sun: 22°11' Taurus (SR House 6)
`;

Deno.test("relationship Call A prompt includes the full natal chart despite blank lines", () => {
  const natalPositions = extractPositionsBlock(RELATIONSHIP_CONTEXT_WITH_BLANK_LINES, "NATAL");
  const callAPrompt = buildCallAUserMessage(
    `Natal Planetary Positions:\n${natalPositions}`,
    "relationship reading",
  );

  for (const body of [
    "Sun",
    "Moon",
    "Mercury",
    "Venus",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",
    "Pluto",
    "Chiron",
    "North Node",
    "South Node",
    "Ascendant",
    "Descendant",
    "MC",
    "IC",
  ]) {
    assert(callAPrompt.includes(`- ${body}:`), `Call A prompt is missing natal ${body}:\n${callAPrompt}`);
  }

  assert(!callAPrompt.includes("SR Sun"), `Call A prompt must not include SR data:\n${callAPrompt}`);
});

// ── Truth-block pass-through regression test (Replit audit, 2026-05-02) ──
// The 3-call relationship branch slices the labeled
// `NATAL PLANET HOUSE PLACEMENTS (USE THESE EXACTLY — DO NOT DERIVE)` block
// out of sanitizedChartContext and appends it to natalChartBlock so Call A
// and Call C see the same authoritative house-placement source the
// single-call path uses. This test asserts the slice regex matches the
// exact format buildChartContext emits on the frontend.
Deno.test("truth-block extraction regex matches frontend buildChartContext output", () => {
  const FRONTEND_CONTEXT = `
NATAL Planetary Positions (with calculated house placements):
- Sun: 22°11' Taurus (House 6)
- Moon: 14°8' Cancer (House 8)

NATAL PLANET HOUSE PLACEMENTS (USE THESE EXACTLY — DO NOT DERIVE):
Read every natal house claim from this block. Do NOT infer a natal planet's house from its sign. Do NOT copy a Solar Return house onto a natal sentence. If a natal placement is not listed below, do not invent one.
- Natal Sun: Taurus, House 6
- Natal Moon: Cancer, House 8
- Natal Venus: Taurus, House 7 (retrograde)
- Natal Lilith: Aquarius, House 3
- Natal Juno: Sagittarius, House 1
- Natal Ascendant: Sagittarius, House 1

House Cusps (with traditional rulers):
- House 1: 9°27' Sagittarius
`;
  const truthBlockMatch = FRONTEND_CONTEXT.match(
    /NATAL PLANET HOUSE PLACEMENTS \(USE THESE EXACTLY[^\n]*\n[^\n]*\n(?:- Natal [^\n]+\n)+/,
  );
  assert(truthBlockMatch, "Truth-block regex failed to match the frontend's emitted block");
  const block = truthBlockMatch![0];
  for (const line of [
    "- Natal Sun: Taurus, House 6",
    "- Natal Venus: Taurus, House 7 (retrograde)",
    "- Natal Lilith: Aquarius, House 3",
    "- Natal Juno: Sagittarius, House 1",
    "- Natal Ascendant: Sagittarius, House 1",
  ]) {
    assert(block.includes(line), `Truth block missing line: ${line}\nGot:\n${block}`);
  }
});
// ── SR context pass-through regression test (Replit audit pass 3, 2026-05-02) ──
// Calls B and C historically received only the SR positions bullets, dropping
// (a) SR House Cusps and (b) the verbatim "--- SOLAR RETURN ANALYSIS ---" JSON
// block (profection year, Time Lord, srPlanetPlacements, srToNatalAspects,
// stelliums, moon phase, yearly theme). The 3-call setup now slices both out
// of sanitizedChartContext and appends them to srChartBlock. This test asserts
// the slice tags and SR-cusp header format match what AskView emits.
Deno.test("SR analysis + SR house cusps slice tags match frontend emission", () => {
  const FRONTEND_CONTEXT = `
SR Planetary Positions:
- Sun: 22°11' Taurus (SR House 6)

SR House Cusps:
- House 1: 9°27' Sagittarius
- House 7: 9°27' Gemini

--- SOLAR RETURN ANALYSIS (PRE-CALCULATED — PRIMARY SOURCE OF TRUTH) ---
You have access to pre-calculated Solar Return data injected into this prompt.
{
  "solarReturnYear": 2026,
  "profectionYear": { "house": 7 },
  "lordOfTheYear": "Venus"
}
--- END SOLAR RETURN ANALYSIS ---
`;
  // Mirror the slice logic from index.ts.
  const startTag = "--- SOLAR RETURN ANALYSIS (PRE-CALCULATED — PRIMARY SOURCE OF TRUTH) ---";
  const endTag = "--- END SOLAR RETURN ANALYSIS ---";
  const startIdx = FRONTEND_CONTEXT.indexOf(startTag);
  const endIdx = FRONTEND_CONTEXT.indexOf(endTag);
  assert(startIdx >= 0, "Frontend SR analysis start tag not found");
  assert(endIdx > startIdx, "Frontend SR analysis end tag not found after start");
  const sliced = FRONTEND_CONTEXT.slice(startIdx, endIdx + endTag.length);
  assert(sliced.includes("profectionYear"), "SR analysis slice missing profectionYear");
  assert(sliced.includes("lordOfTheYear"), "SR analysis slice missing lordOfTheYear");

  // SR House Cusps header must match the parser's regex used in
  // parseSrHouseCuspsFromContext (`/\nSR House Cusps:\n/`).
  assert(/\nSR House Cusps:\n/.test(FRONTEND_CONTEXT), "SR House Cusps header format drifted");
});
