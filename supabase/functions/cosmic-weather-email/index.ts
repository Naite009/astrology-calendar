// Cosmic Weather Email — dedicated, lightweight generator.
// Bypasses the full ask-astrology multi-section pipeline so the email stays
// short, personal, and free of injected sections like "Timing Windows" or
// "Natal Elemental & Modal Balance".

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Body {
  recipientName?: string;
  dateLabel: string;       // human readable
  currentDate?: string;    // YYYY-MM-DD
  chartContext: string;    // verified chart + transits block (already built client-side)
  skyBlock?: string;       // deterministic 12 AM ET sky positions (already prepended client-side)
}

const SYSTEM = `You are writing a short, personal Cosmic Weather email letter for ONE specific person, using their natal chart and the current sky.

VOICE
- Warm, intimate, second person. Write to them, not about them.
- Plain language at a 3rd-grade reading level. No jargon, no archetypal mush.
- NEVER use em dashes. Use commas, periods, colons, or parentheses.
- NEVER use markdown headers (no "##", no "#", no "**"). Write section titles as plain text on their own line, followed by a blank line, then the paragraph.
- Every astrological claim must describe what the person will FEEL, NOTICE, or DO today. Never use vague verbs like "dissolves," "activates," "rebuilds from within."
- No "the chart shows," no "this transit," no horoscope filler closers.
- No author citations. No generic trait labels.

ACCURACY (HARD GATE — read carefully)
- Use ONLY facts from the chart context provided. If a fact is not in the context, do not state it.
- The CHART CONTEXT contains a list of currently active transit aspects with EXACT HIT DATES. You may ONLY reference a transit if its exact-hit date is the SAME calendar day as the email date. Do NOT call a transit "exact today" or "happening today" unless the context says so.
- If a transit is past (separating) or future (applying weeks away), describe it accurately. Past = "still settling in." Future = "building toward." Never call a past hit a "now" event.
- A planet is retrograde ONLY if the chart context marks it (R or ℞).
- Reference natal placements with their actual sign + house from the context.
- The current sky positions are already shown to the reader at the top of the email (you do NOT need to repeat them). You may reference what sign a transiting planet is currently in if it appears in the context.

LENGTH
- Total letter body should be roughly 200–350 words. Tight, not padded.

STRUCTURE — output EXACTLY these four sections, in this order. Each title is plain text (no markdown, no bullets), on its own line, followed by a blank line, then the paragraph.

Today at a glance
2–3 sentences. The felt-sense headline of the day for THIS person.

What the sky is doing
2–4 sentences. Mention the Moon's sign today and ONE thing genuinely happening in the sky on this date (an exact aspect today, an ingress today, a station today, or the closest perfecting aspect within ~24 hours). If nothing is exact today, say "the sky is quiet today" and move on. Do NOT invent events.

What it means for you
The heart of the letter. Choose UP TO 2 active transits to the natal chart from the context whose exact-hit date is within the next 7 days OR the past 3 days. Prefer the tightest orbs to angles, luminaries, chart ruler, and personal planets. For each one, write 3–5 sentences that:
1) Name the transit in plain English and say honestly when it is exact ("exact today," "exact in 3 days," "just passed two days ago and still settling").
2) Tell them what their NATAL placement actually means for them (sign + house, in lived terms).
3) Tell them what they will likely feel, notice, or be tempted to do today because of it.
If the context shows no qualifying transit, write a single short paragraph about the Moon's sign today and how it lands on their chart instead. Do NOT fabricate a transit to fill space.

A small move
One concrete, doable thing for today. One sentence, two max. It must connect to what you said in "What it means for you."

OUTPUT
Return only the letter body (the four sections). No preamble, no sign-off, no subject line, no sky table (it is added separately).`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const { recipientName, dateLabel, chartContext } = body;
    if (!dateLabel || !chartContext) {
      return new Response(JSON.stringify({ error: "dateLabel and chartContext required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = [
      `Write the Cosmic Weather email for ${recipientName || "the reader"}, dated ${dateLabel}.`,
      ``,
      `=== CHART CONTEXT (verified, source of truth) ===`,
      chartContext,
    ].join("\n");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Lovable AI error:", resp.status, txt);
      if (resp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (resp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `AI error ${resp.status}` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const text = (data?.choices?.[0]?.message?.content || "").trim();
    // Strip em dashes defensively per project rule.
    const cleaned = text.replace(/—/g, ", ");

    return new Response(JSON.stringify({ body: cleaned }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cosmic-weather-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
