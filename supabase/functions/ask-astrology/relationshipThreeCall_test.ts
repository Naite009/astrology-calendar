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