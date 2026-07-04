import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SpreadCard {
  position: string;
  positionMeaning: string;
  card: string;
  suit: string; // Wands | Cups | Swords | Pentacles | Major
  reversed: boolean;
}

interface RequestBody {
  spreadType: "three-card" | "celtic-cross" | "monthly";
  question: string;
  cards: SpreadCard[];
  superiorFunction: string;
  superiorSuit: string;
  superiorElement: string;
  inferiorFunction: string;
  inferiorSuit: string;
  inferiorElement: string;
  auxiliaryElements: string[];
  sunSign: string;
  ruler: string;
  rulerSign: string;
  chartName?: string;
}

// Marjaan XI numbering: Justice = XI (reduces to 2), Strength = VIII.
const MAJOR_NUMBER: Record<string, number> = {
  "The Fool": 0, "The Magician": 1, "The High Priestess": 2, "The Empress": 3,
  "The Emperor": 4, "The Hierophant": 5, "The Lovers": 6, "The Chariot": 7,
  "Strength": 8, "The Hermit": 9, "Wheel of Fortune": 10, "Justice": 11,
  "The Hanged Man": 12, "Death": 13, "Temperance": 14, "The Devil": 15,
  "The Tower": 16, "The Star": 17, "The Moon": 18, "The Sun": 19,
  "Judgement": 20, "The World": 21,
};

function reduceToDigit(n: number): number {
  while (n > 9) n = String(n).split("").reduce((a, c) => a + Number(c), 0);
  return n;
}

function pipNumber(cardName: string): number | null {
  const m = cardName.match(/^(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten) of /);
  if (!m) return null;
  const map: Record<string, number> = { Ace:1, Two:2, Three:3, Four:4, Five:5, Six:6, Seven:7, Eight:8, Nine:9, Ten:10 };
  return map[m[1]];
}

function buildPatternHints(cards: SpreadCard[]): string {
  const suits: Record<string, number> = {};
  let majors = 0, reversed = 0;
  const digits: Record<number, string[]> = {};
  for (const c of cards) {
    if (c.suit === "Major") {
      majors++;
      const n = MAJOR_NUMBER[c.card];
      if (n !== undefined) {
        const r = reduceToDigit(n === 0 ? 0 : n);
        (digits[r] ||= []).push(`${c.card} (XX=${n} → ${r})`);
      }
    } else {
      suits[c.suit] = (suits[c.suit] || 0) + 1;
      const p = pipNumber(c.card);
      if (p !== null) (digits[p] ||= []).push(`${c.card} (${p})`);
    }
    if (c.reversed) reversed++;
  }
  const lines: string[] = [];
  lines.push(`- Suit tally: ${Object.entries(suits).map(([s,n]) => `${s}:${n}`).join(", ") || "none"}, Major:${majors}`);
  lines.push(`- Reversed count: ${reversed}/${cards.length}`);
  const shared = Object.entries(digits).filter(([_, arr]) => arr.length >= 2);
  if (shared.length) {
    lines.push(`- Repeated numeric reductions (mention ONLY if genuinely relevant): ${shared.map(([d, arr]) => `digit ${d}: ${arr.join(" + ")}`).join("; ")}`);
  } else {
    lines.push(`- No repeated numeric pattern across cards.`);
  }
  return lines.join("\n");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as RequestBody;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const auxFunctions = body.auxiliaryElements
      .map((el) => `${ELEMENT_FUNCTION[el]} (${el}/${ELEMENT_SUIT[el]})`)
      .join(" + ");

    const cardsBlock = body.cards
      .map((c, i) => {
        const orientationTag = c.reversed ? " (REVERSED)" : " (Upright)";
        const lensTag = suitLens(c.suit, body.superiorSuit, body.inferiorSuit);
        return `${i + 1}. Position "${c.position}" — ${c.positionMeaning}\n   Card: ${c.card}${orientationTag} [Suit: ${c.suit}${lensTag}]`;
      })
      .join("\n");

    const patternHints = buildPatternHints(body.cards);

    const isMonthly = body.spreadType === "monthly";

    const universalRules = `
UNIVERSAL INTERPRETATION RULES — apply to every reading:

1. NUANCE OVER CERTAINTY. Never state that a specific event will definitely happen. Never guarantee outcomes, betrayals, breakups, financial gains, or "justice." Use language such as: "may," "could," "suggests," "points toward," "you may notice," "the invitation is," "this card asks you to consider."
   - Wrong: "You are going to get a fair result."
   - Right: "A situation may ask for a fair, honest, or carefully considered decision. The gift is greater clarity about what is right — even if the result is not exactly what you hoped for."

2. NO GENERIC ADVICE. Ban phrases like "pick a lane," "make some real moves," "get your house in order," "trust the universe," "stay positive," "manifest your dreams." Every piece of guidance must be tied to the specific card AND its specific position.

3. CARDS SPEAK TO ONE ANOTHER. Do not produce isolated card definitions. Show transitions: what the person is moving away from, what is entering, and how a later card answers or complicates an earlier one.

4. REVERSED ≠ OPPOSITE. Choose contextually from: blocked energy, internalized energy, excess, avoidance, delay, release, recovery, or a lesson still being learned. Briefly explain WHY that reading fits the position and neighbors.

5. HIERARCHY. Not every card carries equal weight. Name the primary cards clearly.

6. NUMBER PATTERNS. Only mention a numeric pattern if it is actually present. Show the math (e.g. "Judgement is XX = 20 → 2 + 0 = 2; Justice is XI = 11 → 2; Two of Pentacles is directly a 2"). Account for deck numbering (Justice = XI in Rider-Waite-Smith). Never claim a pattern the cards do not support.

7. HYBRID CLARITY. For each insight: (1) real-life situation, (2) how it feels, (3) briefly why. No abstract mysticism.

8. WRITE TO "YOU." Warm, grounded, plain language. No em dashes.

9. RESPECT ORIENTATION. Every card named in prose MUST match the exact orientation listed in the spread. Never silently flip a card. Never invent a card that was not drawn.

10. NO CATASTROPHIZING and no guaranteed rewards. Negative-looking cards get honest, non-alarming treatment; positive-looking cards are opportunities, not promises.
`;

    const monthlyStructure = `
STRUCTURE — Monthly 7-Card Spread. Return clean markdown. Target 2,500–4,000 words total.

## Your Cards
Bullet list of all 7 cards with their position titles, clearly marking reversed cards.

## The Overall Message for the Month
4–7 short paragraphs telling the connected story of the spread BEFORE analyzing individual cards. Identify: what the person is moving away from, what they are entering, the main emotional or practical tension, the most important guidance, and the likely purpose of the month. End this section with a line formatted exactly:

> **The central message for your month is …**

## Position 1 — Foundation
### Position 2 — The New Season
### Position 3 — Your Inner Energy
### Position 4 — Your Outer Energy
### Position 5 — What Needs Clearer Action or Awareness
### Position 6 — Hidden Opportunity
### Position 7 — North Star

For EACH of the 7 sections above use a level-3 heading with the exact position title AND the drawn card name and orientation, e.g. \`### 5. What Needs Clearer Action or Awareness — Judgement (Upright)\`. Inside each section include:
- A clear plain-language explanation of the card.
- What it means specifically in THIS position.
- 2–3 realistic examples of how it may show up (life/work/relationships/inner life — pick whichever fits).
- A short subsection titled **What this card wants you to know** with a compassionate 2–4 sentence takeaway.
- 1–2 reflective questions when useful.
- If it connects meaningfully to another card in the spread, name that connection.
Do NOT repeat the same advice across sections.

## How the Cards Work Together
Explain the strongest relationships in the spread using ordinary language: repeated suits, repeated numbers (with the math), Major Arcana concentration, several reversed cards, elemental movement, tension, one card answering another, or contrast between what is leaving and what is entering. Only claim a numeric pattern if the numbers actually support it.

## What the Month May Feel Like
Describe the likely emotional texture without guaranteed predictions. Name both what may feel hard AND the positive development underneath.

## Practical Guidance for the Month
5–7 specific, realistic actions tied to specific cards (mention which card each action comes from). No platitudes. Examples of the RIGHT tone: "delay a nonurgent decision until you have more information," "compare promises with actual behavior," "identify one pattern that repeatedly drains you."

## Your Most Important Message
One concise paragraph naming the single most important takeaway (usually anchored in the North Star, sometimes in Position 5).

## Closing
A supportive 100–175 word closing that ties the whole spread together in warm, non-mystical language.

HIERARCHY REMINDER: Position 2 sets the season, Position 5 flags what needs attention, Position 7 is the practical guide. Positions 3 and 4 describe how your energy behaves. Position 6 reveals what is not obvious. Position 1 is context. Weight your prose accordingly.
`;

    const shortStructure = `
STRUCTURE — return clean markdown only:

## The Question
One short sentence reflecting the question back.

## The Overall Story
2–3 paragraphs telling the connected story across all cards BEFORE the card-by-card breakdown. Name transitions between cards.

## Card by Card
For each card, a level-3 heading like \`### 1. {Position}: {Card Name} ({Upright|Reversed})\` followed by 2–3 short paragraphs that (a) explain the card in ordinary language, (b) tie it to THIS position and to the neighboring cards, (c) explicitly connect to their function profile when relevant.

## How the Cards Work Together
1–2 paragraphs on the strongest pattern (suits, numbers with math shown, reversals, Major concentration, tension). Only claim patterns the cards actually support.

## What This May Feel Like
1 paragraph on the likely emotional texture — no guaranteed predictions.

## What to Actually Do
3–5 specific bullet actions tied to specific cards. No platitudes.

Target length: ~500–700 words for three-card, ~1,100–1,600 words for Celtic Cross.
`;

    const interpretationCheck = `
INTERPRETATION CHECK — perform SILENTLY before writing (do NOT show this to the user):
- All ${body.cards.length} cards named in your prose match the spread exactly (name AND orientation).
- Each card's meaning fits its assigned position.
- No outcome is stated as guaranteed anywhere.
- Reversed cards were interpreted contextually with brief justification.
- ${isMonthly ? "The North Star is used in the practical guidance." : "The final actions are tied to specific cards."}
- The overall message is consistent with the individual sections.
- Advice is not repeated unnecessarily across sections.
If any check fails, silently revise before returning.
`;

    const systemPrompt = `You are a wise, plain-spoken tarot reader who reads a spread as ONE connected story about the querent's life. You interpret every card through the querent's Jungian function profile (from their natal chart) AND through the exact spread position each card lands in.

CORE FUNCTION LENS:
- Superior Function = comfort zone (effortless strength, can become a trap)
- Inferior Function = blind spot / growth edge (where the real lesson lives)
- Auxiliary Functions = supporting tools
- Major Arcana = soul-level theme that overrides ordinary suit logic
- Suit matching superior → familiar territory, ask whether it is a crutch
- Suit matching inferior → the heart of the message; the discomfort IS the signal
${universalRules}
${isMonthly ? monthlyStructure : shortStructure}
${interpretationCheck}`;

    const userPrompt = `QUERENT: ${body.chartName || "the querent"}
SUN SIGN: ${body.sunSign} (ruled by ${body.ruler}, currently in ${body.rulerSign})

THEIR JUNGIAN FUNCTION PROFILE (from natal chart):
- Superior Function: ${body.superiorFunction} (${body.superiorElement} / ${body.superiorSuit}) — their natural strength
- Inferior Function: ${body.inferiorFunction} (${body.inferiorElement} / ${body.inferiorSuit}) — their blind spot / growth edge
- Auxiliary Functions: ${auxFunctions}

THEIR QUESTION / FOCUS: "${(body.question || (isMonthly ? "Read my month" : "")).trim()}"

SPREAD TYPE: ${
      isMonthly
        ? "Monthly 7-Card Spread"
        : body.spreadType === "three-card"
        ? "Three-Card (Past / Present / Future)"
        : "Celtic Cross (10 positions)"
    }

CARDS DRAWN (this is the source of truth — never change a card or orientation):
${cardsBlock}

PATTERN HINTS (computed from the actual cards — use only what is genuinely relevant, and show the math if you mention numbers):
${patternHints}

Interpret this spread now, following the structure exactly. Reference the superior/inferior functions by name in the card-by-card breakdown. Do the silent Interpretation Check before returning the final markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get spread interpretation");
    }

    const data = await response.json();
    const interpretation = data.choices?.[0]?.message?.content || "Unable to generate interpretation.";

    return new Response(JSON.stringify({ interpretation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("interpret-tarot-spread error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

const ELEMENT_FUNCTION: Record<string, string> = {
  Fire: "Intuition",
  Water: "Feeling",
  Air: "Thinking",
  Earth: "Sensation",
};

const ELEMENT_SUIT: Record<string, string> = {
  Fire: "Wands",
  Water: "Cups",
  Air: "Swords",
  Earth: "Pentacles",
};

function suitLens(suit: string, superiorSuit: string, inferiorSuit: string): string {
  if (suit === "Major") return " — MAJOR ARCANA, soul-level theme";
  if (suit === superiorSuit) return " — SUPERIOR / comfort zone";
  if (suit === inferiorSuit) return " — INFERIOR / growth edge";
  return " — auxiliary support";
}
