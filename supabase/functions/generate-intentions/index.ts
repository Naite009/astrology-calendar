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
      cycleSign,
      cycleDegree,
      chartName,
      natalPlanets,
      newMoonHouse,
      natalAspects,
      intentionWords
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const hasNatalContext = chartName && (natalPlanets || newMoonHouse);

    const systemPrompt = `You are a soul-centered astrologer who helps people craft meaningful, personalized intentions for lunar cycles. Your guidance is warm, practical, and deeply rooted in astrological symbolism.

CRITICAL: When natal chart data is provided, use the EXACT house positions shown in parentheses (e.g., "Venus: 15° Taurus (House 2)"). Do NOT infer houses from zodiac signs. Sign ≠ House. The houses have been calculated from actual birth chart cusps.`;

    let userPrompt = `Generate 3-4 soul-centered intention suggestions for the ${cycleSign} New Moon at ${cycleDegree}°.

`;

    if (hasNatalContext) {
      userPrompt += `This is a PERSONALIZED reading for ${chartName}.
${newMoonHouse ? `The New Moon falls in their ${newMoonHouse}th House.` : ''}
${natalAspects ? `Natal aspects to this New Moon: ${natalAspects}` : ''}
${natalPlanets ? `Their natal chart includes: ${natalPlanets}` : ''}

`;
    }

    if (intentionWords && intentionWords.length > 0) {
      userPrompt += `Suggested intention words for this sign: ${intentionWords.join(', ')}

`;
    }

    userPrompt += `Format your response as a numbered list of 3-4 specific, actionable intentions. Each should be:
- Written as an "I am" or "I embrace" or "I allow" statement
- Specific to the ${cycleSign} energy and themes
${hasNatalContext ? `- Personalized for ${chartName}'s chart activation` : ''}
- Practical yet spiritually meaningful

Example format:
1. I embrace [specific intention related to sign themes]...
2. I allow [specific intention]...
3. I am open to [specific intention]...`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
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
    const suggestions = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ suggestions }), {
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
