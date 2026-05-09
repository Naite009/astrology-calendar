import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Placement {
  planet: string;
  sign?: string;
  degree?: number;
  house?: number;
  isRetrograde?: boolean;
}

interface HouseInfo {
  house: number;
  cuspSign?: string;
  cuspDegree?: number;
  ruler?: string;
  rulerSign?: string;
  rulerHouse?: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

interface Payload {
  chartName: string;
  placements: Placement[];
  houses: HouseInfo[]; // 4, 7, 8, 10, 12 specifically
  aspects: Aspect[]; // hard aspects to luminaries/Asc + supportive trines/conjunctions
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const { chartName, placements, houses, aspects } = (await req.json()) as Payload;

    const placementLines = placements
      .map((p) =>
        `${p.planet}: ${p.sign ?? "?"} ${p.degree != null ? p.degree.toFixed(1) + "°" : ""}${
          p.house ? " (House " + p.house + ")" : ""
        }${p.isRetrograde ? " Rx" : ""}`,
      )
      .join("\n");

    const houseLines = houses
      .map(
        (h) =>
          `House ${h.house}: cusp ${h.cuspSign ?? "?"} ${
            h.cuspDegree != null ? h.cuspDegree.toFixed(1) + "°" : ""
          } | ruler ${h.ruler ?? "?"}${h.rulerSign ? " in " + h.rulerSign : ""}${
            h.rulerHouse ? " (House " + h.rulerHouse + ")" : ""
          }`,
      )
      .join("\n");

    const aspectLines = aspects
      .slice(0, 30)
      .map((a) => `${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(1)}° orb)`)
      .join("\n");

    const systemPrompt = `You are an evolutionary astrologer writing a "Soul Agreements" reading. This is a SYMBOLIC, SPIRITUAL layer, NOT predictive astrology.

ABSOLUTE RULES:
- Write so a smart 14-year-old can understand it. If a teenager could not explain it back in plain words, rewrite it.
- Be emotionally intelligent but grounded. Never fortune-telling. Never deterministic. Never predict death or specific events.
- Never imply suffering was "chosen" in a harmful way. Never romanticize trauma. Never use fear language.
- Stay STRICTLY chart-specific. Only reference placements, houses, and aspects PRESENT in the data below. Do NOT invent aspects.
- If data for a section is missing or thin, write a shorter section rather than hallucinating.
- NEVER use em dashes (—). Use commas, periods, colons, or parentheses.
- Cross-sign aspects (e.g. 29° Aries to 1° Taurus) are valid when within orb. Sun/Moon conjunctions valid up to 10°.

JARGON BAN — these words are FORBIDDEN unless you immediately translate them in the same sentence into plain language:
transformation, rebirth, evolution, karmic, soul contract, alchemy, sovereignty, integration, destiny, ego death, shadow work, ascension, awakening.

  BAD:  "You are here for deep transformation."
  GOOD: "You are not meant to stay the same person your whole life. Life will keep pushing you to grow, change, and become more honest about who you are."

  BAD:  "Release old identity structures."
  GOOD: "Let go of old ways of acting that were built to keep other people comfortable."

  BAD:  "Develop sovereignty."
  GOOD: "Learn to trust your own choices even when other people disagree."

REQUIRED SECTION STRUCTURE — every section must have these 4 layers, in this order, inside the "interpretation" field. Use these exact bold sub-headings on their own lines:

**Astrology**
One short paragraph stating the astrological meaning clearly and accurately (planet, sign, house, aspect). 2-4 sentences.

**Plain English**
Translate the astrology above into direct, simple language. Answer: "What does this actually look like in real life?" 3-5 sentences. No jargon. 14-year-old comprehension test.

**Real-Life Examples**
2-4 concrete bullet examples of how this shows up day-to-day. Each bullet is one short sentence describing a recognizable behavior, situation, or pattern. Draw from things like: people-pleasing, avoiding conflict, struggling to say no, overthinking relationships, hiding feelings, needing approval, learning boundaries, speaking up, rebuilding confidence, changing careers, ending unhealthy relationships. Match the examples to the actual chart.

**Reflection**
End with ONE grounded, open-ended question (this also goes in the "question" field separately).

Total length per section: 200-350 words including all 4 layers.

Return STRICT JSON only, matching this schema:
{
  "family": { "interpretation": string, "question": string },
  "wound": { "interpretation": string, "question": string },
  "purpose": { "interpretation": string, "question": string },
  "relationship": { "interpretation": string, "question": string },
  "gift": { "interpretation": string, "question": string },
  "timing": { "interpretation": string, "question": string },
  "legacy": { "interpretation": string, "question": string },
  "summary": {
    "coreLesson": string,
    "coreWound": string,
    "corePurpose": string,
    "coreLegacy": string
  }
}
The "interpretation" field MUST contain all 4 layered sub-headings (Astrology, Plain English, Real-Life Examples, Reflection). The "question" field repeats the reflection question on its own.`;

    const userPrompt = `Chart: ${chartName}

PLACEMENTS:
${placementLines}

KEY HOUSES (4, 7, 8, 10, 12):
${houseLines}

VERIFIED ASPECTS:
${aspectLines || "(none provided)"}

Write the 7 Soul Agreements using ONLY the data above. Every section MUST follow the 4-layer structure (Astrology / Plain English / Real-Life Examples / Reflection):

1. FAMILY AGREEMENT — emotional environment that shaped you growing up. Use Moon, 4th house, ruler of the 4th, aspects to Moon.

2. WOUND AGREEMENT — the pain that became a growth catalyst. Use Chiron, Saturn, 12th house, hard aspects to Sun/Moon/Ascendant.

3. PURPOSE AGREEMENT — what you are growing toward. Use North Node, Sun, 1st house, Midheaven.
   SPECIAL RULE — if North Node is in Scorpio AND in the 1st house, the Plain English layer must include language like:
   "You are not meant to stay the same person your whole life. Life will keep pushing you to change in big ways: learning to stop people-pleasing, saying what you really think, trusting yourself more than outside approval, becoming stronger after hard experiences, and letting go of old versions of yourself that were built just to keep peace. Your purpose is to become more honest, stronger, and more fully yourself."

4. RELATIONSHIP AGREEMENT — who helps you grow through connection.
   STRICT priority order: (1) 7th house placements, (2) ruler of the 7th, (3) Venus, (4) Moon, (5) Mars.
   Juno is OPTIONAL support only. Do NOT lead with Juno or weight it heavily; mention only as a light closing layer if relevant.

5. GIFT AGREEMENT — what you arrived already good at.
   PRIORITIZE Venus, Neptune, Moon. Include intuitive gifts, emotional intelligence, symbolic understanding, creativity, and spiritual sensitivity.
   Use Jupiter and 2nd/5th houses too, but do NOT default Jupiter to "financial talent." Read it as wisdom, generosity, vision, or teaching unless the chart clearly points to material abundance.

6. TIMING AGREEMENT — HOW your growth tends to unfold (style, not events). Use Saturn, Nodes, Pluto, angular planets. Do NOT predict events.

7. LEGACY AGREEMENT — what you tend to leave behind. Use Midheaven, ruler of MC, Sun, Saturn, 10th house.
   SPECIAL RULE — if MC is in Cancer AND Moon is in the 12th house, interpret legacy specifically through:
   - emotional healing
   - unseen support systems
   - helping others feel safe
   - healing emotional patterns
   - compassionate, behind-the-scenes leadership
   Do NOT use generic "nurturing" language.

Then SUMMARY: one plain-English sentence each for core lesson, core wound, core purpose, core legacy. Apply the same jargon ban.

Return ONLY the JSON object. No prose outside JSON. No markdown fences.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("AI gateway error:", resp.status, errText);
      return new Response(JSON.stringify({ error: `AI gateway ${resp.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      // try to recover from accidental fences
      const cleaned = String(content).replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    }

    return new Response(JSON.stringify({ agreements: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("soul-agreements error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
