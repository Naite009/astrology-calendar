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
}

const SYSTEM = `You are writing a short, personal Cosmic Weather email letter for ONE specific person, using their natal chart and the current sky.

VOICE
- Warm, intimate, second person. Write to them, not about them.
- Plain language at a 3rd-grade reading level. No jargon, no archetypal mush.
- NEVER use em dashes. Use commas, periods, colons, or parentheses.
- Every astrological claim must describe what the person will FEEL, NOTICE, or DO today. Never use vague verbs like "dissolves," "activates," "rebuilds from within."
- No "the chart shows," no "this transit," no horoscope filler closers.
- No author citations. No generic trait labels.

ACCURACY (HARD GATE)
- Use ONLY the chart context provided below. If a fact is not in the context, do not state it.
- Do not invent stations, ingresses, or aspect dates.
- A planet is retrograde ONLY if the chart context marks it (R).
- Reference natal placements with their actual sign + house from the context.

LENGTH
- Total email body should be roughly 250–400 words. Tight, not padded.

STRUCTURE — output EXACTLY these four sections, in this order, using "## " headers and nothing else:

## Today at a glance
2–3 sentences. The felt-sense headline of the day for THIS person.

## What the sky is doing
2–4 sentences. Today's Sun and Moon (sign + degree from context). Then the 1–2 tightest perfecting transits in the sky right now. Name any retrograde planet only if the context marks it (R). Do not list every transit.

## What it means for you
The heart of the letter. Choose the 2 MOST PERSONALLY RELEVANT active transit aspects to the natal chart from the context (smallest orbs, strongest natal points: angles, luminaries, chart ruler, personal planets). For EACH chosen transit, write 3–5 sentences that:
1) Name the transit in plain English (e.g., "Uranus is sitting right on top of your natal Jupiter").
2) Tell them what their NATAL placement actually means for them (sign + house, in lived terms, not textbook).
3) Tell them what they will likely feel, notice, or be tempted to do TODAY because of it.
Do NOT list more than 2 transits. Do NOT include any transit not in the context.

## A small move
One concrete, doable thing for today. One sentence, two max. It should connect to what you said in "What it means for you."

OUTPUT
Return only the email body. No preamble, no sign-off, no subject line.`;

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
