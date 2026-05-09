// your-weather-today
// Generates the "Your Weather Today" bridge: 2-3 sentences (40-65 words)
// connecting the collective sky to the user's specific chart, using:
//   - transiting Moon sign + house in the natal chart
//   - the strongest Moon-to-natal aspect today
//   - the strongest longer transit (outer planet to personal point) active now

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MoonAspect {
  natalPlanet: string;
  aspect: string;
  natalSign?: string;
  natalHouse?: number | null;
  orb: string | number;
}

interface LongerTransit {
  transitPlanet: string;
  aspect: string;
  natalPlanet: string;
  natalSign?: string;
  natalHouse?: number | null;
  orb: string | number;
  applying?: boolean;
}

interface Body {
  recipientName?: string;
  dateLabel?: string;
  transitMoonSign: string;
  transitMoonHouse: number | null;
  topMoonAspect?: MoonAspect | null;
  topLongerTransit?: LongerTransit | null;
}

const HOUSE_DOMAINS: Record<number, string> = {
  1: "your sense of self, body, and how you show up",
  2: "money, values, self-worth, and what you own",
  3: "conversations, siblings, short trips, and daily thinking",
  4: "home, family, your inner world, and emotional roots",
  5: "creativity, romance, kids, fun, and self-expression",
  6: "work routines, health habits, and daily tasks",
  7: "close relationships, partnership, and one-on-one dynamics",
  8: "intimacy, shared resources, deep emotional territory",
  9: "travel, beliefs, big-picture thinking, and learning",
  10: "career, public role, and how you're seen by the world",
  11: "friends, groups, and long-term hopes",
  12: "rest, solitude, your inner life, and what's behind the scenes",
};

const SYSTEM = `You write the "Your Weather Today" section for one specific person. It bridges the collective sky and their personal chart.

HARD RULES (non-negotiable)
- Output 2 to 3 sentences. Total 40 to 65 words. Never more.
- Plain human language a smart 15-year-old understands instantly.
- Describe what the person will FEEL, NOTICE, or DO today.
- Never use em dashes. Use commas, periods, or parentheses.
- No jargon. Forbidden words: energy, energies, processing, integrating, themes, alignment, atmosphere, dynamic, vibe, frequency, shadow work, transformation journey, authentic self, reflective, processing, restless, friction, principles outrun feelings, imagination opens.
- Never explain astrology. Never name aspects, signs, houses, or planets in the output. Translate them into lived experience.
- Use soft hedges: may, might, can, often.

LANGUAGE RULE — RECOGNIZABLE HUMAN MOMENTS (critical):
Do NOT translate astrology into vague concepts. Translate into recognizable lived moments.
BAD (banned): "reflective", "processing", "restless", "friction", "imagination opens", "principles outrun feelings".
GOOD (use this register): "harder to say what you feel", "wanting space", "feeling misunderstood", "wanting comfort", "feeling emotionally full", "wanting to pull back", "feeling heavier than usual", "feeling clearer than usual".

2ND HOUSE RULE:
If the relevant house is the 2nd house, do NOT default to money. Interpret it first as self-worth, stability, what grounds you, what feels solid. Only mention money if the specific transit clearly points there.

MOON + NEPTUNE RULE:
If the data involves the Moon with Neptune (any aspect), never reduce it to "imagination". Interpret it as some mix of: emotional softness, memory, nostalgia, music, grief, intuition, longing, blurred emotional edges.
Example rewrite — BAD: "Imagination opens." GOOD: "You may feel more sensitive than usual, and memories or music may hit harder than expected."
Example rewrite — BAD: "restless at home." GOOD: "You may want more quiet or space than usual, even if you can't explain why."

REQUIRED SHAPE (combine all three in 2-3 sentences):
1. Emotional tone of today for this person, in recognizable human language.
2. Where it shows up in life (the life area from the Moon's house, applying the 2nd house rule when relevant).
3. One concrete thing to watch or notice.

GOAL: The reader feels understood in under 15 seconds. They should recognize the moment in their own day.

Return ONLY a JSON object: { "text": "..." }`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    const {
      recipientName,
      dateLabel,
      transitMoonSign,
      transitMoonHouse,
      topMoonAspect,
      topLongerTransit,
    } = body;

    if (!transitMoonSign) {
      return new Response(JSON.stringify({ error: "transitMoonSign required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const houseDomain = transitMoonHouse ? HOUSE_DOMAINS[transitMoonHouse] : null;

    const moonLine = `Transiting Moon is in ${transitMoonSign}${
      transitMoonHouse ? `, moving through the reader's ${transitMoonHouse}th house (${houseDomain})` : ""
    }.`;

    const moonAspectLine = topMoonAspect
      ? `Strongest Moon-to-natal aspect today: Moon ${topMoonAspect.aspect} natal ${topMoonAspect.natalPlanet}${
          topMoonAspect.natalSign ? ` in ${topMoonAspect.natalSign}` : ""
        }${topMoonAspect.natalHouse ? ` (house ${topMoonAspect.natalHouse}: ${HOUSE_DOMAINS[topMoonAspect.natalHouse] || ""})` : ""} · orb ${topMoonAspect.orb}°.`
      : "No tight Moon-to-natal aspect today.";

    const longerLine = topLongerTransit
      ? `Strongest longer transit active now: ${topLongerTransit.transitPlanet} ${topLongerTransit.aspect} natal ${topLongerTransit.natalPlanet}${
          topLongerTransit.natalSign ? ` in ${topLongerTransit.natalSign}` : ""
        }${topLongerTransit.natalHouse ? ` (house ${topLongerTransit.natalHouse}: ${HOUSE_DOMAINS[topLongerTransit.natalHouse] || ""})` : ""} · orb ${topLongerTransit.orb}°${topLongerTransit.applying ? " applying" : ""}.`
      : "No major longer transit currently within tight orb.";

    const userPrompt = [
      dateLabel ? `Date: ${dateLabel}.` : "",
      recipientName ? `Reader: ${recipientName}.` : "",
      "",
      "USE ONLY THIS DATA (do not invent). Translate it into lived feelings and one concrete area of life:",
      moonLine,
      moonAspectLine,
      longerLine,
      "",
      "Write 2-3 sentences, 40-65 words, plain human language. Combine emotional tone, where it shows up in life, and one thing to watch. Never name signs, houses, planets, or aspects in the output.",
      "",
      "Return JSON only: { \"text\": \"...\" }",
    ].filter(Boolean).join("\n");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Lovable AI error:", resp.status, txt);
      return new Response(JSON.stringify({ error: `AI error ${resp.status}`, text: "" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    let raw = (data?.choices?.[0]?.message?.content || "").trim();
    let parsed: any = {};
    try { parsed = JSON.parse(raw); } catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
    }
    let text = String(parsed?.text || "").replace(/—/g, ", ").trim();

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("your-weather-today error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", text: "" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
