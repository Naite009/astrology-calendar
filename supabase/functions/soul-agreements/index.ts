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
- Use plain, grounded language. No vague spiritual clichés ("the universe is calling you").
- Translate astrology into LIVED, behavioral experience. Give concrete examples of how it shows up day-to-day.
- Be emotionally intelligent but grounded. Never fortune-telling.
- Never deterministic. Never imply fixed fate. Never predict death or specific events.
- Never imply suffering was "chosen" in a harmful way. Never romanticize trauma.
- Never use fear language. Keep tone empowering.
- Stay STRICTLY chart-specific. Only reference placements, houses, and aspects PRESENT in the data below. Do NOT invent aspects.
- If data for a section is missing or thin, write a shorter section rather than hallucinating.
- NEVER use em dashes (—). Use commas, periods, colons, or parentheses.
- Each section: 120-250 words.
- End each section with ONE reflective question (open-ended, second-person).
- Do NOT echo planet/sign/house labels in the body unless they add real meaning. Lead with the lived experience.
- Prefer soft, invitational phrasing like "This may suggest…" or "You might notice…" over hard-certainty phrases like "There was likely…" or "This means…".
- Cross-sign aspects (e.g. 29° Aries to 1° Taurus) are valid and significant when within orb. Do not dismiss them.
- Luminary aspects involving the Sun or Moon may be considered valid with orbs up to 10° for conjunctions. Do not dismiss a wide-but-present luminary aspect.

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
}`;

    const userPrompt = `Chart: ${chartName}

PLACEMENTS:
${placementLines}

KEY HOUSES (4, 7, 8, 10, 12):
${houseLines}

VERIFIED ASPECTS:
${aspectLines || "(none provided)"}

Write the 7 Soul Agreements using ONLY the data above:

1. FAMILY AGREEMENT — emotional environment that shaped the soul. Use Moon, 4th house, ruler of the 4th, aspects to Moon.
2. WOUND AGREEMENT — pain that became growth catalyst. Use Chiron, Saturn, 12th house, hard aspects to Sun/Moon/Ascendant.
3. PURPOSE AGREEMENT — what the soul came here to become. Use North Node, Sun, 1st house, Midheaven.
4. RELATIONSHIP AGREEMENT — who helps evolve the soul. STRICT priority order: (1) 7th house placements, (2) ruler of the 7th, (3) Venus, (4) Moon, (5) Mars. Juno is OPTIONAL and may only appear as a light supporting layer at the end if relevant; do NOT lead with Juno or weight it heavily.
5. GIFT AGREEMENT — what was brought in already developed. Weight Venus and Neptune strongly for intuitive, symbolic, artistic, healing, and spiritual gifts. Use Jupiter and the 2nd/5th houses as well, but do NOT default Jupiter to "financial talent" — read it as wisdom, generosity, vision, or teaching unless the chart clearly points to material abundance. Include supportive trines/conjunctions.
6. TIMING AGREEMENT — HOW growth tends to unfold (style, not events). Use Saturn, Nodes, Pluto, angular planets. Do NOT predict events.
7. LEGACY AGREEMENT — what is left behind. Use Midheaven, ruler of MC, Sun, Saturn, 10th house. SPECIAL RULE: if the MC is in Cancer AND the Moon is in the 12th house, interpret legacy specifically through emotional healing, invisible care systems, behind-the-scenes psychological support, and the quiet infrastructure that holds others — go beyond generic "nurturing" language.

Then SUMMARY: one sentence each for core lesson, core wound, core purpose, core legacy.

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
