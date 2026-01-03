import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `Analyze this astrological chart image and extract all planet positions.

For each planet you can identify, provide the data in this exact JSON format:
{
  "planets": {
    "Sun": { "sign": "Aries", "degree": 15, "minutes": 23, "isRetrograde": false },
    "Moon": { "sign": "Cancer", "degree": 8, "minutes": 12, "isRetrograde": false },
    ...
  },
  "astroComCusps": {
    "AC": { "sign": "Leo", "degree": 5, "minutes": 30 },
    "house2": { "sign": "Virgo", "degree": 2, "minutes": 15 },
    "house3": { "sign": "Libra", "degree": 1, "minutes": 0 },
    "MC": { "sign": "Aquarius", "degree": 5, "minutes": 30 },
    "house11": { "sign": "Pisces", "degree": 2, "minutes": 15 },
    "house12": { "sign": "Aries", "degree": 1, "minutes": 0 }
  }
}

Planet names to look for: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Ascendant (or ASC), NorthNode (or North Node, NN, True Node), SouthNode, Chiron, Lilith (Black Moon Lilith), Ceres, Pallas, Juno, Vesta, PartOfFortune, Vertex, Eris, Sedna, Makemake, Haumea, Quaoar, Orcus, Ixion, Varuna.

Signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.

If a planet shows retrograde (R, ℞, or Rx), set isRetrograde to true.

IMPORTANT - Astro.com House Cusp Format (as printed at the bottom of the chart):
- Astro.com prints: AC (this is House 1), House 2, House 3, then MC (this is House 4), House 11 (this is House 5), House 12 (this is House 6).
- You must extract ONLY these 6 printed cusps into astroComCusps.
- Do NOT try to output house4-house12 directly.

Return ONLY the JSON object, no other text.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "image_url", image_url: { url: imageBase64 } },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to analyze image" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const oppositeSign = (sign: string): string | null => {
      const map: Record<string, string> = {
        Aries: "Libra",
        Taurus: "Scorpio",
        Gemini: "Sagittarius",
        Cancer: "Capricorn",
        Leo: "Aquarius",
        Virgo: "Pisces",
        Libra: "Aries",
        Scorpio: "Taurus",
        Sagittarius: "Gemini",
        Capricorn: "Cancer",
        Aquarius: "Leo",
        Pisces: "Virgo",
      };
      return map[sign] ?? null;
    };

    // Try to extract JSON from the response
    let parsedData: any = null;
    try {
      // Look for JSON in the response (might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
    }

    // Deterministically derive ALL 12 house cusps from Astro.com's printed 6-cusp format.
    // Printed: AC=1, house2=2, house3=3, MC=4, house11=5, house12=6.
    // Derived by opposites: 7↔1, 8↔2, 9↔3, 10↔4, 11↔5, 12↔6.
    if (parsedData?.astroComCusps && typeof parsedData.astroComCusps === "object") {
      const c = parsedData.astroComCusps;
      const cusp1 = c.AC;
      const cusp2 = c.house2;
      const cusp3 = c.house3;
      const cusp4 = c.MC;
      const cusp5 = c.house11;
      const cusp6 = c.house12;

      const makeOpp = (src: any) => {
        if (!src?.sign) return null;
        const opp = oppositeSign(src.sign);
        if (!opp) return null;
        return { sign: opp, degree: src.degree, minutes: src.minutes };
      };

      const houseCusps: any = {
        house1: cusp1,
        house2: cusp2,
        house3: cusp3,
        house4: cusp4,
        house5: cusp5,
        house6: cusp6,
        house7: makeOpp(cusp1),
        house8: makeOpp(cusp2),
        house9: makeOpp(cusp3),
        house10: makeOpp(cusp4),
        house11: makeOpp(cusp5),
        house12: makeOpp(cusp6),
      };

      // Only attach if we at least have the 3 key printed cusps.
      if (houseCusps.house1 && houseCusps.house2 && houseCusps.house3) {
        parsedData.houseCusps = houseCusps;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedData,
        raw: content,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in parse-chart-image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
