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
  topAspects?: SkyAspect[];        // up to ~3
  retrogrades?: string[];          // names of outer planets currently retrograde
}

const SYSTEM = `You write the "What everyone is living under" section for a daily astrology email. This is the COLLECTIVE sky — what most people are likely to feel today.

HARD RULES (non-negotiable)
- 3 to 5 short sentences. Total under 90 words.
- Plain spoken language. A smart 15-year-old must understand instantly.
- Describe OBSERVABLE BEHAVIOR. What people may FEEL. How people may ACT. What today is GOOD FOR.
- Never name signs, planets, houses, or aspects in the output.
- Never use em dashes. Use commas, periods, colons, or parentheses.
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

REQUIRED SHAPE (combine in 3-5 sentences):
1. What people may feel today (one concrete emotional sentence).
2. How people may act (behavior — quieter, snappier, more open, more guarded, etc.).
3. What today is GOOD FOR (one practical sentence: e.g. slow conversations, finishing things, fixing things, giving people space, paperwork, rest).
4. (Optional) One brief sentence on what to watch out for.

EXAMPLE (this is the target register):
"People may be quieter or harder to read today. Small frustrations can build faster if someone feels pushed. Best use: slower conversations, fixing things, and giving people space."

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
    if (body.dateLabel) lines.push(`Date: ${body.dateLabel}.`);
    if (body.moonPhaseName) lines.push(`Moon phase: ${body.moonPhaseName}.`);
    if (body.moonSign) lines.push(`Moon is in ${body.moonSign} (use this only as flavor, do not name it).`);
    if (body.topAspects && body.topAspects.length) {
      lines.push("Tightest sky aspects right now (translate into felt experience, do not name):");
      for (const a of body.topAspects.slice(0, 3)) {
        lines.push(`- ${a.planet1} ${a.type} ${a.planet2}, orb ${a.orb}°${a.applying ? " applying" : " separating"}`);
      }
    }
    if (body.retrogrades && body.retrogrades.length) {
      lines.push(`Outer planets retrograde (background pressure, do not name): ${body.retrogrades.join(", ")}.`);
    }
    lines.push("");
    lines.push("Write 3-5 short sentences. Describe what people may feel, how people may act, and what today is good for. End with a 'Best use:' line if it fits naturally.");
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
