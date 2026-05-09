// cosmic-weather-collective
// Live LLM generator for the "What everyone is living under" section of the
// daily cosmic weather email. Replaces the deterministic template that was
// emitting banned phrases ("Today is more reflective than active", "People
// are processing", "Imagination opens", "X is bringing…", "cooler day",
// "principles outrun feelings").
//
// Input: a small, clean data envelope (top sky aspects + moon phase + retros).
// Output: { html: string } — 3-5 short sentences of plain spoken language
// describing what people may FEEL, how they may ACT, and what today is
// GOOD FOR. No astrology jargon, ever.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SkyAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: string | number;
  applying?: boolean;
}

interface Body {
  dateLabel?: string;
  moonPhaseName?: string;
  moonSign?: string;
  /** Personal-planet sign positions today: { Sun, Moon, Mercury, Venus, Mars }. */
  personalPositions?: Record<string, string>;
  topAspects?: SkyAspect[];        // up to ~5
  retrogrades?: string[];          // names of planets currently retrograde
}

const SYSTEM = `You write the "What everyone is living under" section for a daily astrology email. This is the COLLECTIVE sky — what most people are likely to feel today, anchored in the ACTUAL transits in the sky right now.

CORE JOB
You will be given the tightest planet-to-planet aspects in the sky right now (with orbs), the current Moon phase, the Moon sign, the personal-planet sign positions, and any retrogrades. Write 3 to 5 short sentences that describe what TODAY actually feels like, grounded in those specific aspects. The output must change day to day with the sky.

HARD ANTI-GENERIC RULES (auto-fail if violated)
- DO NOT write something that could apply to any Saturday. Anchor in the specific aspects given.
- DO NOT write a vague mood paragraph. Tie each sentence to a real planetary contact.
- DO read the strongest aspect first and let it set the dominant feeling, then layer in the others.
- DO use the planet meanings below internally (do NOT name the planets in the output text):
    Sun = identity, what people want to be seen for
    Moon = mood, comfort, emotional needs
    Mercury = thinking, talking, decisions, plans, messages
    Venus = love, money, taste, who and what people want
    Mars = drive, anger, push, picking fights, taking action
    Jupiter = wanting more, going bigger, optimism, overdoing it
    Saturn = limits, tiredness, accountability, having to deal with it
    Uranus = sudden change, surprises, the urge to break a pattern
    Neptune = softening, blurring, dreaminess, longing, escapism
    Pluto = power, control, what is hidden under the surface
    Chiron = an old sore spot getting touched
- DO use the aspect meanings below internally:
    conjunction = fused, hard to separate
    opposition = tug-of-war, often via another person
    square = pressure that wants something to give
    trine = easy flow, may pass without notice
    sextile = an opening if you reach for it
    quincunx = off-axis, two parts not speaking the same language
- DO let RETROGRADES color the day as background pressure (re-thinking, going back over things).
- DO NOT name signs, planets, houses, or aspect names in the output text. Translate them into FELT EXPERIENCE.

OUTPUT RULES
- 3 to 5 short sentences. Total under 100 words.
- Plain spoken language. A smart 15-year-old must understand instantly.
- Describe OBSERVABLE BEHAVIOR. What people may FEEL. How people may ACT. What today is GOOD FOR.
- End with a sentence starting "Best use:" naming what today actually supports.
- Never use em dashes. Use commas, periods, colons, parentheses.
- Use soft hedges: may, might, can, often.

ABSOLUTELY FORBIDDEN WORDS / PHRASES (auto-fail if any appear):
reflective, processing, integrating, "cooler day", cooler, "principles outrun feelings", principles, energy, energies, themes, alignment, "imagination opens", friction, atmosphere, dynamic, vibe, frequency, shift, undercurrent, "tone of the day", invitations, "X is bringing", "is bringing", restless.

REWRITE TABLE (use this register, not the BAD column):
- BAD "reflective"             GOOD "people may pull back" / "people may want quiet"
- BAD "people are processing"  GOOD "people may not know how to explain what they feel yet"
- BAD "imagination opens"      GOOD "music, memories, or quiet time may hit harder than usual"
- BAD "friction"               GOOD "small things may set people off"
- BAD "cooler day"             GOOD "people may be a little more guarded today"
- BAD "X is bringing"          GOOD "today may feel…" / "people may notice…"
- BAD "restless"               GOOD "wanting more space than usual" / "harder to sit still"

EXAMPLE (target register, when the sky has Moon-Saturn pressure + Mercury-Mars square):
"People may feel a little heavier or harder to cheer up today, like a weight they cannot quite name. Conversations may sharpen faster than expected, and small disagreements can flare up before anyone notices. Anything that needs patience or being told no may go better than usual. Best use: finishing one real thing, having an honest conversation you have been avoiding, and going easy on yourself."

Return ONLY a JSON object: { "text": "..." }`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured", text: "" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lines: string[] = [];
    if (body.dateLabel) lines.push(`DATE: ${body.dateLabel}.`);
    if (body.moonPhaseName) lines.push(`MOON PHASE: ${body.moonPhaseName}.`);
    if (body.moonSign) lines.push(`MOON SIGN: ${body.moonSign}.`);
    if (body.personalPositions && Object.keys(body.personalPositions).length) {
      lines.push("PERSONAL-PLANET SIGN POSITIONS TODAY (use to color the day, do not name in output):");
      for (const [planet, sign] of Object.entries(body.personalPositions)) {
        lines.push(`  - ${planet} in ${sign}`);
      }
    }
    if (body.topAspects && body.topAspects.length) {
      lines.push("");
      lines.push("TIGHTEST SKY ASPECTS RIGHT NOW (this is the primary signal — synthesize across them, weighting tighter orbs more heavily, but do NOT name them in the output):");
      for (const a of body.topAspects.slice(0, 5)) {
        lines.push(`  - ${a.planet1} ${a.type} ${a.planet2}, orb ${a.orb}°${a.applying ? " applying" : " separating"}`);
      }
    } else {
      lines.push("NO TIGHT SKY ASPECTS TODAY: this is a structurally quiet day. Say so honestly in plain language.");
    }
    if (body.retrogrades && body.retrogrades.length) {
      lines.push("");
      lines.push(`PLANETS RETROGRADE (background pressure of going back over things — do not name): ${body.retrogrades.join(", ")}.`);
    }
    lines.push("");
    lines.push("WRITE THE SECTION NOW. 3 to 5 short sentences anchored in the SPECIFIC aspects above. The output must be different from a generic Saturday — it must reflect THESE specific contacts. End with a 'Best use:' sentence.");
    lines.push('Return JSON only: { "text": "..." }');

    const userPrompt = lines.join("\n");

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
      console.error("collective LLM error", resp.status, txt);
      return new Response(JSON.stringify({ error: `AI ${resp.status}`, text: "" }), {
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

    // Defensive scrub: if the model slipped a banned token through, blank it
    // so the deterministic 1-line fallback in the digest takes over.
    const BANNED = /\b(reflective|processing|integrating|cooler day|cooler|principles outrun feelings|principles|energies|themes|alignment|imagination opens|friction|atmosphere|dynamic|vibe|frequency|undercurrent|tone of the day|invitations|is bringing|restless)\b/i;
    if (BANNED.test(text)) {
      console.warn("collective text contained banned word, returning empty:", text);
      text = "";
    }

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cosmic-weather-collective error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", text: "" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
