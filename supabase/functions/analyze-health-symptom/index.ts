import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are a medical astrology expert trained in the traditions of Kira Sutherland (Astrology of Health) and Heather Eland (Health Astrology).

You analyze symptoms through the lens of natal chart placements and current planetary transits. Your goal is to identify astrological correlations and provide holistic support recommendations.

IMPORTANT DISCLAIMER: Always remind users this is for educational/self-awareness purposes only and does not replace professional medical advice.

When analyzing a symptom, provide:

1. PRIMARY CAUSE - Is this natal (chronic tendency), transit-triggered (temporary), or both?

2. ASTROLOGICAL MECHANISM - Which specific placements and transits create this pattern? Be specific about planets, signs, houses, and aspects involved.

3. BODY SYSTEM BREAKDOWN - Which planets govern the affected area? Which signs rule the body part? Which houses show this type of health issue?

4. TIMELINE - If transit-triggered: when did it likely begin, when will it peak, when will relief arrive? If natal: what transits tend to activate it?

5. ROOT CAUSE (Holistic) - Emotional/mental component, physical component, lifestyle factors, stress factors.

6. SUPPORT PROTOCOL with specific recommendations:
   - VITAMINS & MINERALS: Specific nutrients with dosages and which planetary placement they support
   - HERBS & SUPPLEMENTS: With explanation of how they support the affected planet/sign
   - LIFESTYLE: Do's, Don'ts, best timing for healing activities (planetary days/moon phases)
   - EMOTIONAL/MENTAL: If Moon, Mercury, or Neptune are involved, address the mind-body connection

FORMAT your response with clear sections using emoji headers:
🎯 PRIMARY CAUSE
📍 ASTROLOGICAL MECHANISM  
⏰ TIMELINE
🧬 BODY SYSTEM BREAKDOWN
🌿 SUPPORT PROTOCOL (with sub-sections for Vitamins, Herbs, Lifestyle, Emotional)

Be specific about planetary correspondences. Reference medical astrology principles.
If the symptom could indicate something serious (chest pain, severe headache, etc.), lead with: "⚠️ IMPORTANT: This symptom may require immediate medical attention. Please consult a healthcare provider. Here is the astrological context..."

HYBRID CLARITY RULE: For each insight, follow this sequence: (1) Start with a real-life situation — what actually happens in the body. (2) Describe how it feels. (3) Briefly explain why. Do not say "energetic imbalance" or "transformative healing process." Instead: "you may notice the headaches get worse when you skip meals or push through exhaustion — it feels like pressure building behind your eyes, because your body is signaling it needs rest before anything else." The reader should think "yes, that's exactly what happens to me."`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptom, chartContext, transitContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!symptom || !chartContext) {
      return new Response(JSON.stringify({ error: "Missing symptom or chart data" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userMessage = `SYMPTOM: "${symptom}"

--- NATAL CHART DATA ---
${chartContext}

--- CURRENT TRANSITS ---
${transitContext || "No specific transit data available. Do NOT guess current planetary positions — state that transit data was not provided and focus on natal chart patterns only."}

Please analyze this symptom through my natal chart and current transits. Determine if it's natal, transit-triggered, or both. Provide a complete support protocol with vitamins, herbs, and lifestyle recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI analysis unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Unable to generate analysis.";

    return new Response(JSON.stringify({ analysis: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-health-symptom error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
