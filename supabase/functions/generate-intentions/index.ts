import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      mode,
      cycleSign,
      cycleDegree,
      chartName,
      natalPlanets,
      newMoonHouse,
      natalAspects,
      natalAspectsDetailed,
      skyContext,
      rulerContext,
      phaseDates,
      whatIsSurfacing,
      intentionWords,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const hasNatalContext = chartName && (natalPlanets || newMoonHouse);
    const isExamples = mode === 'examples';

    const baseVoice = `NON-NEGOTIABLE VOICE RULES:
- Never use em dashes. Use commas, periods, colons or parentheses.
- No chitchat openers, no hype, no addressing the person by name, no "Hey you", no "Let's talk about".
- Plain language a 12 year old could follow. No jargon inside the intention text itself (no "square", "trine", "12th house" wording in the intention paragraph).
- Never invent facts about the person's life. Describe situations that are plausible for the placements you were given, and phrase them as openings, not predictions.
- Every sentence must describe something the person would FEEL, DO or NOTICE.`;

    const systemPrompt = isExamples
      ? `You are a working astrologer who writes New Moon intentions. You calculate like an astrologer and explain like a human.

You will be given: the New Moon sign and degree, its ruler and that ruler's condition, the aspects the New Moon makes in the sky, the house the New Moon falls in for this person, that person's natal placements with their exact houses, and the aspects the New Moon makes to their natal chart (with the natal house of each contacted planet).

Use ALL of it. Sign tells you the style, house tells you the arena, aspects tell you the pressure and the support, the ruler tells you how the cycle unfolds over the month.

CRITICAL: use the EXACT house numbers given. Sign is not house. Never infer a house from a sign.

${baseVoice}

Each example intention must:
- Be one paragraph, roughly 60 to 110 words.
- Open with an "I am" / "I allow" / "I choose" / "I am letting" line that is specific, not generic.
- Then name the concrete real-life arena it belongs to (the house arena you were given), in ordinary words.
- Then name the friction or the support honestly (from the aspects you were given), described as how it will feel, not as astrology terms.
- Then close with one small repeatable action for the month.
- Be clearly DIFFERENT from the other two: one grounded in the New Moon's own house arena, one grounded in the tightest natal contact, one grounded in the ruler's condition and how the month unfolds.

Return ONLY valid JSON, no markdown fence, in this exact shape:
{"examples":[{"title":"3 to 5 word label","basis":"one short line of the astrology behind it, plain notation allowed here","intention":"the paragraph"}]}
Exactly 3 items.`
      : `You are a soul-centered astrologer who helps people craft meaningful, personalized intentions for lunar cycles.

CRITICAL: When natal chart data is provided, use the EXACT house positions shown in parentheses. Sign is not house.

${baseVoice}`;

    const context = `NEW MOON: ${cycleSign} ${cycleDegree}°
${rulerContext ? `RULER OF THIS NEW MOON: ${rulerContext}` : ''}
${skyContext ? `WHAT THE NEW MOON IS DOING IN THE SKY: ${skyContext}` : ''}
${phaseDates ? `HOW THE MONTH UNFOLDS: ${phaseDates}` : ''}
${newMoonHouse ? `FOR THIS PERSON THE NEW MOON FALLS IN HOUSE ${newMoonHouse} (use this arena, not the sign).` : ''}
${natalAspectsDetailed ? `NEW MOON CONTACTS TO THEIR NATAL CHART (tightest first, with the natal house of each planet): ${natalAspectsDetailed}` : natalAspects ? `NEW MOON CONTACTS TO THEIR NATAL CHART: ${natalAspects}` : ''}
${natalPlanets ? `THEIR FULL NATAL PLACEMENTS WITH HOUSES: ${natalPlanets}` : ''}
${whatIsSurfacing ? `WHAT THEY ALREADY WROTE IS SURFACING FOR THEM (reflect it, do not repeat it back word for word): ${whatIsSurfacing}` : ''}
${intentionWords?.length ? `USABLE ${cycleSign} INTENTION WORDS: ${intentionWords.join(', ')}` : ''}`;

    const userPrompt = isExamples
      ? `${context}

Write exactly 3 example intentions this person can copy and edit. Follow the JSON shape exactly.`
      : `Generate 3-4 intention suggestions for the ${cycleSign} New Moon at ${cycleDegree}°.

${context}

Format as a numbered list. Each written as an "I am" / "I allow" / "I choose" statement, specific and practical.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.7-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to generate intentions");
    }

    const data = await response.json();
    let content: string = data.choices?.[0]?.message?.content || "";
    content = content.replace(/—/g, ", ");

    if (isExamples) {
      const cleaned = content.replace(/^```(?:json)?/i, '').replace(/```$/,'').trim();
      let examples: unknown = null;
      try {
        const parsed = JSON.parse(cleaned);
        examples = Array.isArray(parsed) ? parsed : parsed?.examples;
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) {
          try { examples = JSON.parse(match[0])?.examples; } catch { /* ignore */ }
        }
      }
      if (!Array.isArray(examples) || examples.length === 0) {
        return new Response(JSON.stringify({ error: "Could not parse examples", raw: content }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ examples }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ suggestions: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-intentions error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
