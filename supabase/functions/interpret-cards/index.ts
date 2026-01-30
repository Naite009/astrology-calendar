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
      cardType, 
      cardName, 
      deckName,
      cycleSign, 
      phaseName,
      chartName,
      intentions 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const cardContext = cardType === 'tarot' 
      ? `The user drew the Tarot card: "${cardName}"`
      : `The user drew the Oracle card: "${cardName}" from the "${deckName || 'unknown'}" deck`;

    const systemPrompt = `You are a wise and compassionate spiritual guide who interprets cards in the context of lunar cycles and personal growth. You blend traditional card meanings with intuitive, soul-centered guidance.

Your interpretations should:
- Connect the card's symbolism to the current lunar phase and zodiac energy
- Offer practical, actionable guidance
- Be warm and encouraging without being superficial
- Reference the user's stated intentions if provided
- Keep the interpretation focused (2-3 paragraphs)`;

    const userPrompt = `${cardContext}

Context:
- Current Lunar Cycle: ${cycleSign} New Moon
- Current Phase: ${phaseName}
${chartName ? `- Reading for: ${chartName}` : ''}
${intentions ? `- User's Stated Intentions: "${intentions}"` : ''}

Please provide an interpretation of this card in the context of the current lunar cycle and phase. What message does this card hold for the journey ahead? How does it relate to the ${cycleSign} energy and the ${phaseName} phase?`;

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
      throw new Error("Failed to get interpretation");
    }

    const data = await response.json();
    const interpretation = data.choices?.[0]?.message?.content || "Unable to generate interpretation.";

    return new Response(JSON.stringify({ interpretation }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("interpret-cards error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
