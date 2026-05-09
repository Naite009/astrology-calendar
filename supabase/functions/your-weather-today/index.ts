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
  2: "self-worth, stability, what grounds you, and what feels solid (only money if clearly indicated)",
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

const SYSTEM = `You write the "Your Weather Today" section for one specific person. Tight 3-part block: Cause, Effect, Best use.

INPUTS YOU WILL RECEIVE (use ONLY these — do not add other transits):
A. The transiting Moon's house in the reader's natal chart.
B. The single strongest Moon-to-natal aspect today.
C. The single strongest outer-planet transit currently inside 1 degree.
(Any of B or C may be missing. Work with whatever is given.)

OUTPUT FORMAT (return JSON exactly like this):
{ "cause": "...", "effect": "...", "bestUse": "..." }

- cause:    1 short sentence naming the actual transit in plain words (e.g. "Moon moving through your home life today" or "Saturn pressing on your sense of self this week"). No glyphs, no degree symbols, no aspect names like "square" or "trine" — translate them into pressure / ease / tension / support words.
- effect:   1 to 2 short sentences. Describe how it MAY FEEL today. Plain spoken language a 15-year-old gets instantly. Soft hedges (may, might, can, often). Recognizable human moments only.
- bestUse:  1 short sentence naming what today actually supports. Concrete: e.g. "slower conversations", "fixing things", "rest", "honest one-on-ones", "paperwork", "giving people space".

ABSOLUTELY FORBIDDEN WORDS (auto-fail):
energy, energies, processing, integrating, themes, alignment, atmosphere, dynamic, vibe, frequency, shadow work, transformation journey, authentic self, reflective, restless, friction, principles outrun feelings, imagination opens, "is bringing", cooler day.

REWRITE TABLE (use the GOOD register):
- BAD "reflective"            GOOD "harder to say what you feel" / "wanting space"
- BAD "processing"            GOOD "may not know how to explain what they feel yet"
- BAD "imagination opens"     GOOD "music, memories, or quiet time may hit harder than expected"
- BAD "restless"              GOOD "harder to sit still" / "wanting more space than usual"
- BAD "friction"              GOOD "small things may set you off"

2ND HOUSE RULE (critical):
If the relevant house is the 2nd house, do NOT default to money. Lead with: self-worth, stability, what grounds you, what feels solid, your values. Mention money ONLY if the specific transit clearly points there.

MOON + NEPTUNE RULE:
If the data involves the Moon with Neptune in any aspect, never reduce it to "imagination". Use: emotional softness, memory, nostalgia, music, grief, intuition, longing, blurred emotional edges. Example — BAD "Imagination opens." GOOD "You may feel more sensitive than usual, and memories or music may hit harder than expected."

Never use em dashes anywhere. Use commas, periods, colons, parentheses.

Return ONLY the JSON object: { "cause": "...", "effect": "...", "bestUse": "..." }`;

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
