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
  /** Full set of active outer-planet transits to personal points (≤ 3° orb),
   *  ordered tightest first. The model SYNTHESIZES across all of them. */
  outerTransits?: LongerTransit[];
  /** Deprecated single-aspect field. Ignored when outerTransits has items. */
  topLongerTransit?: LongerTransit | null;
}

const HOUSE_DOMAINS: Record<number, string> = {
  1: "your sense of self, body, and how you show up",
  2: "self-worth, stability, what feels solid, your values, what grounds you (do NOT default to money — only mention money if the transit clearly points there)",
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

const SYSTEM = `You write the "Your Weather Today" section for ONE specific person. Tight 3-part block: Cause, Effect, Best use.

CORE JOB
The reader has multiple OUTER-PLANET TRANSITS active right now (e.g. Neptune opposing natal Moon, Uranus opposing natal Venus, Chiron quincunx natal Venus). Your job is to read those AS A COMBINATION and write what the OVERLAP means for THIS person TODAY. Not one transit in isolation. Not a generic mood warning. The intersection.

INPUTS YOU WILL RECEIVE
A. Transiting Moon's house in the reader's natal chart (sets today's daily focus area).
B. The single strongest Moon-to-natal aspect today (sets today's emotional flavor).
C. A list of ALL active outer-planet transits to personal points within 3°. THIS IS THE PRIMARY SIGNAL. Synthesize across the whole list, weighting tighter orbs more heavily.

OUTPUT FORMAT (return JSON exactly like this):
{ "cause": "...", "effect": "...", "bestUse": "..." }

- cause:    1 to 2 sentences. Name the COMBINATION of outer transits in plain words and what they share (e.g. "Right now Neptune is softening your moods while Uranus and Chiron are both pressing on your love and money sense — three different long pressures all touching how you feel about closeness and worth this week."). No glyphs, no degree symbols, no aspect names like "square" or "trine" — translate them into pressure / softening / loosening / pressing / pulling words. You MAY name planets and natal points in plain English (e.g. "natal Moon", "your Venus") so the reader recognizes which long-running transits are landing.
- effect:   2 to 3 sentences. Describe how the COMBINATION may FEEL today specifically. Concrete behavior and recognizable moments only. Tie it to the parts of life the natal points touch (Moon = feelings, comfort, home; Venus = love, worth, money, taste; Sun = identity; Mars = drive, anger; Mercury = thinking, talking; Ascendant = self-presentation; MC = public role). Soft hedges (may, might, can, often).
- bestUse:  1 short sentence naming what today actually supports given the combination. Concrete: e.g. "slow honest conversations about what you actually want", "rest and gentle music", "fixing one small thing rather than starting a big thing", "letting a relationship question sit one more day".

HARD ANTI-GENERIC RULES (auto-fail if violated):
- DO NOT write a generic mood paragraph that could apply to anyone on any Saturday.
- DO NOT write "you might feel on edge, pausing before speaking can help" or anything like it.
- DO NOT pick one transit and ignore the others when several are active.
- DO reference at LEAST 2 of the named outer transits when 2 or more are present.
- DO name the natal point being touched (e.g. "your Moon", "your Venus") so the reader sees it is about THEM.

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
If Neptune is in aspect to the Moon, never reduce it to "imagination". Use: emotional softness, memory, nostalgia, music, grief, intuition, longing, blurred emotional edges. Example — BAD "Imagination opens." GOOD "You may feel more sensitive than usual, and memories or music may hit harder than expected."

VENUS + URANUS / CHIRON RULE:
If Uranus or Chiron is in aspect to Venus, do not write generic "edginess". Translate to: a real question about a relationship or about your sense of worth, an old Venus bruise being pressed (Chiron), or a sudden urge to want something different in love or money (Uranus). Be concrete.

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
      outerTransits,
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

    // Build the active outer-transit list. If outerTransits has items, use it
    // (the new path that lets the AI synthesize across the full set). Fall
    // back to the legacy single-aspect field for old callers.
    const outerList = (outerTransits && outerTransits.length)
      ? outerTransits
      : (topLongerTransit ? [topLongerTransit] : []);

    const outerTransitsBlock = outerList.length
      ? [
          `ACTIVE OUTER-PLANET TRANSITS (synthesize ALL of them — this is the primary signal). Tighter orbs matter more:`,
          ...outerList.map((t, i) =>
            `  ${i + 1}. Transiting ${t.transitPlanet} ${t.aspect} natal ${t.natalPlanet}${
              t.natalSign ? ` in ${t.natalSign}` : ""
            }${t.natalHouse ? ` (the ${t.natalHouse}th house: ${HOUSE_DOMAINS[t.natalHouse] || ""})` : ""}, orb ${t.orb}°${t.applying ? " applying" : " separating"}.`
          ),
        ].join("\n")
      : "No major outer-planet transits currently within 3° orb.";

    const userPrompt = [
      dateLabel ? `Date: ${dateLabel}.` : "",
      recipientName ? `Reader: ${recipientName}.` : "",
      "",
      "USE ONLY THIS DATA. Translate it into lived feelings. Synthesize across the outer transits — do not pick one and ignore the rest.",
      "",
      moonLine,
      moonAspectLine,
      "",
      outerTransitsBlock,
      "",
      `WRITE FOR ${recipientName || "this reader"} TODAY (${dateLabel || ""}). Reference the natal points being touched (e.g. "your Moon", "your Venus") so the reader recognizes it is about them. Combine the outer transits into one coherent picture.`,
      'Return JSON only: { "cause": "...", "effect": "...", "bestUse": "..." }',
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
      return new Response(JSON.stringify({ error: `AI error ${resp.status}`, cause: "", effect: "", bestUse: "", text: "" }), {
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
    const clean = (s: any) => String(s || "").replace(/—/g, ", ").trim();
    const cause = clean(parsed?.cause);
    const effect = clean(parsed?.effect ?? parsed?.text);
    const bestUse = clean(parsed?.bestUse ?? parsed?.best_use);
    // Backward-compat single-string field for any legacy caller.
    const text = [effect, bestUse ? `Best use: ${bestUse}` : ""].filter(Boolean).join(" ");

    return new Response(JSON.stringify({ cause, effect, bestUse, text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("your-weather-today error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", cause: "", effect: "", bestUse: "", text: "" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
