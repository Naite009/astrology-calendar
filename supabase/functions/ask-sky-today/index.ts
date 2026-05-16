// ask-sky-today
// Chart-independent "Today's Cosmic Weather" reading for the Ask tab.
// Use case: a friend calls asking "why do I feel anxious right now" and the
// user doesn't have her natal chart. This reads ONLY the live sky — transits,
// Moon phase, Void-of-Course window, planetary hour, anything rare overhead —
// and returns a plain-language explanation of what is actually happening
// cosmically that could explain the mood.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SkyBody {
  recipientLabel?: string;
  userSituation?: string;
  dateLabel: string;
  transitingPlanets: Array<{ name: string; sign: string; degree: number; retrograde?: boolean }>;
  moon: {
    sign: string;
    phase: string;
    illumination?: number;
    isVOC: boolean;
    isCurrentlyVOC?: boolean;
    vocStart?: string | null;
    vocEnd?: string | null;
    moonEntersSign?: string | null;
    lastAspect?: { planet: string; aspect: string } | null;
  };
  dailyAspects?: Array<{ p1: string; aspect: string; p2: string; orb: number; applying?: boolean }>;
  notableFixedStars?: Array<{ star: string; conjunctPlanet: string; orb: number; meaning: string }>;
  planetaryHour?: { ruler: string; meaning?: string };
  notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = (await req.json()) as SkyBody;
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Missing LOVABLE_API_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const skyJSON = JSON.stringify(body, null, 2);

    const system = `You are a professional astrologer answering "what is happening cosmically RIGHT NOW that could explain how someone is feeling." You do NOT have anyone's natal chart for this question. You are reading the live sky only.

VOICE RULES (NON-NEGOTIABLE):
- Second person, plain English, conversational. The reader could be on the phone with a friend who just said "I suddenly feel anxious and want to turn around and go home — what is going on?"
- Behavior-first. Open every section with what the day FEELS LIKE or what tends to HAPPEN, then name the placement.
- Translate every astrological signal into a real-life moment. Never lecture.
- If the Moon is Void of Course right now, the FIRST paragraph must be about it. That is the single most likely explanation for "I suddenly feel like nothing is landing and I want to abandon what I started."
- If something rare is overhead (a fixed star contact, a station, an exact outer-planet aspect, 0° or 29° of a sign, an eclipse degree), call it out by name.
- FORBIDDEN words: "wound", "metabolized", "archetypal", "portal", "liminal", "activation" (say "this transit"), "calling" as a noun, "energy" as a vague catch-all.
- No em dashes. Use commas, periods, colons, or parentheses.
- Do NOT pad. If only 2 things are actually live, give 2.
- Do NOT reference any natal chart, "your chart", or personal placements — there is no chart here.
- Do NOT invent data. Only cite what appears in the SKY DATA block below.

OUTPUT FORMAT (markdown):
Open with ONE short paragraph (no heading) that directly answers what the person is feeling or asking. Plain prose. Do NOT write "The Headline" or any header before this opening. Just speak.

Then use these exact headings, in this order. Skip any heading that has no real signal and say briefly why.

## The Moon Right Now
Moon sign, phase, and Void-of-Course status. If VOC, explain it in plain words and name the exact window. Say what the VOC tends to feel like (sudden urge to bail, nothing landing, abandoning plans, turning around). If not VOC, name the next aspect the Moon is making and what tone that sets.

## Today's Tightest Aspects
The 1 to 3 tightest sky-to-sky aspects right now from the SKY DATA. For each: name the two planets and the aspect, the orb, and ONE concrete real-life scenario the pairing tends to produce collectively (e.g., "Mars square Saturn at 0°42' tends to feel like hitting a wall when you push, short tempers, traffic, things not moving").

## Anything Rare Overhead
Cite any fixed star contact, station, exact eclipse degree, or 0°/29° placement from the SKY DATA. If nothing rare, write one short line: "Nothing unusual overhead right now."

## Why Today Might Feel Off (or On)
One honest paragraph weaving the Moon status + the tightest aspects + anything rare into a real answer to "why does the day feel like this." Specific to TODAY, not generic horoscope language.

## What to Do With the Rest of the Day
3 to 5 short, concrete moves calibrated to what is actually live. Examples: "if the Moon is void until 6:14pm, do not sign or send anything important, reschedule"; "with Mars square Saturn this tight, eat before any hard conversation and skip the impulse purchase."

End there. No closing summary. No meta sentences.`;

    const situationBlock = body.userSituation && body.userSituation.trim()
      ? `\n\nWHAT THE PERSON IS EXPERIENCING (answer this directly in The Headline and Why Today Might Feel Off):\n"${body.userSituation.trim()}"\n`
      : "";

    const userPrompt = `Date and time: ${body.dateLabel}
${situationBlock}
SKY DATA (pre-computed, authoritative — cite only from this):
${skyJSON}

Write the reading now using ONLY the sky data above.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      console.error("[ask-sky-today] gateway error", resp.status, text);
      const status = resp.status === 429 || resp.status === 402 ? resp.status : 200;
      return new Response(
        JSON.stringify({
          error:
            resp.status === 429
              ? "Rate limited. Try again in a moment."
              : resp.status === 402
                ? "AI credits exhausted. Add credits in workspace settings."
                : "Could not generate reading.",
        }),
        { status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await resp.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[ask-sky-today] error", err);
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
