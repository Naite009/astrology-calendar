import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are an expert astrologer with deep knowledge of traditional and modern astrology. You help interpret natal charts and answer questions about astrological readings.

Your expertise includes:
- Planetary dignities, debilities, and rulerships
- House meanings and planetary placements
- Aspect interpretation (conjunctions, squares, trines, oppositions, sextiles)
- Psychic and spiritual indicators in charts (Neptune, 12th house, water signs, Pluto aspects)
- Fixed stars and their influences
- Medical astrology and health indicators
- Karmic patterns (nodes, Saturn, Pluto)
- Timing techniques (transits, progressions, solar arcs)

When answering questions:
1. Reference the specific placements in the chart provided
2. Explain the astrological reasoning behind your interpretation
3. Consider both traditional and psychological perspectives
4. Be specific about degrees, signs, and houses when relevant
5. If asked about psychic abilities, consider: 12th house planets, Neptune aspects, water sign emphasis, Pluto-Moon aspects, and nodal connections
6. NEVER restate or echo back the user's question. Jump straight into the astrological answer with the real data. For example, if asked "Does Aries rule my 7th house?", do NOT write "You asked about Aries ruling your 7th house." Instead, immediately state the actual ruler: "Your 7th house cusp is in Capricorn at 15°, ruled by Saturn..."
7. Always lead with the specific chart data first, then interpret. Every answer should be dense with degrees, signs, houses, and aspects — not generic summaries.

CRITICAL ANTI-HALLUCINATION RULES:
- The chart data includes BOTH natal positions AND current transit positions.
- If the user asks "where is Jupiter" or any planet RIGHT NOW, use the CURRENT TRANSITS section, NOT their natal chart.
- NEVER guess or recall planetary positions from memory. ONLY use the data provided.
- Clearly distinguish between natal placements (birth chart) and current transits (today's sky).
- Use the EXACT house positions shown in parentheses next to each planet (e.g., "Venus: 15°00' Taurus (House 2)"). Do NOT infer houses from zodiac signs. Sign ≠ House. The house positions have been calculated from actual birth chart cusps and are DEFINITIVE.
- If a planet says "(House 10)" then it is in the 10th house, regardless of what sign it's in.

Important: You have the chart data in context. Use it to give specific, personalized interpretations.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, chartContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the system message with chart context
    const systemMessage = chartContext 
      ? `${SYSTEM_PROMPT}\n\n--- CHART DATA ---\n${chartContext}`
      : SYSTEM_PROMPT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemMessage },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add AI credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("ask-astrology error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
