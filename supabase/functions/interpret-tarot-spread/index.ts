import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SpreadCard {
  position: string;
  positionMeaning: string;
  card: string; // e.g. "The Fool" or "Three of Wands"
  suit: string; // Wands | Cups | Swords | Pentacles | Major
  reversed: boolean;
}

interface RequestBody {
  spreadType: "three-card" | "celtic-cross";
  question: string;
  cards: SpreadCard[];
  // user function profile from natal chart
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
        const orientationTag = c.reversed ? " (REVERSED)" : "";
        const lensTag = suitLens(c.suit, body.superiorSuit, body.inferiorSuit);
        return `${i + 1}. Position "${c.position}" (${c.positionMeaning}) — ${c.card}${orientationTag} [Suit: ${c.suit}${lensTag}]`;
      })
      .join("\n");

    const systemPrompt = `You are a wise, plain-spoken tarot reader who interprets every spread through the querent's Jungian function profile (derived from their natal chart). You translate symbolism into real-life situations they will recognize, never abstract spiritual jargon.

CORE INTERPRETATION LENS — apply to EVERY card:
- Superior Function = comfort zone (effortless strength, can become a trap)
- Inferior Function = blind spot / growth edge (where the real lesson lives)
- Auxiliary Functions = supporting tools (helpful but secondary)

When a card's suit matches their SUPERIOR suit → name it as their familiar territory and ask whether they are leaning on it as a crutch.
When a card's suit matches their INFERIOR suit → flag it as the heart of the message; their discomfort IS the signal.
When a card's suit is auxiliary → frame it as a supporting resource they can draw on.
When a Major Arcana appears → treat it as a soul-level theme that overrides ordinary suit logic.
When a card is REVERSED → energy is internalized, blocked, delayed, or shadow-expressed. Do NOT just say "the opposite."

HYBRID CLARITY RULE: For each card: (1) describe the real-life situation it points to, (2) name how it feels, (3) briefly explain why. No "profound invitations" or "deep callings." Use second person ("you").

STRUCTURE — return clean markdown only:
## The Question
One short sentence reflecting their question back to them.

## Card by Card
For each card, a level-2 subheading like \`### 1. {Position}: {Card Name}{ (Reversed) if reversed}\` followed by 2–3 short paragraphs that explicitly tie the card to THEIR function profile.

## The Through-Line
1 paragraph naming the pattern across the whole spread (which suits dominate? does their inferior suit appear? where?).

## What to Actually Do
3 concrete bullet actions tailored to their question and function profile. No platitudes.

Keep total length tight: roughly 350–550 words for a 3-card spread, 700–1000 words for Celtic Cross.`;

    const userPrompt = `QUERENT: ${body.chartName || "the querent"}
SUN SIGN: ${body.sunSign} (ruled by ${body.ruler}, currently in ${body.rulerSign})

THEIR JUNGIAN FUNCTION PROFILE (from natal chart):
- Superior Function: ${body.superiorFunction} (${body.superiorElement} / ${body.superiorSuit}) — their natural strength
- Inferior Function: ${body.inferiorFunction} (${body.inferiorElement} / ${body.inferiorSuit}) — their blind spot / growth edge
- Auxiliary Functions: ${auxFunctions}

THEIR QUESTION: "${body.question.trim()}"

SPREAD TYPE: ${body.spreadType === "three-card" ? "Three-Card (Past / Present / Future)" : "Celtic Cross (10 positions)"}

CARDS DRAWN:
${cardsBlock}

Interpret this spread for them now, following the structure exactly. Reference their superior/inferior functions by name in the card-by-card breakdown — do not be generic.`;

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
