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
    const { imageBase64, fileType, fileName } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No file provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine the content type based on fileType or base64 header
    const isPDF = fileType === 'pdf' || imageBase64.includes('application/pdf');
    const isWord = fileType === 'word' || imageBase64.includes('application/vnd.openxmlformats') || imageBase64.includes('application/msword');
    const isImage = !isPDF && !isWord;

    const prompt = `Analyze this astrological chart ${isPDF || isWord ? 'document' : 'image'} and extract all information.

IMPORTANT: Extract the person's birth information if visible on the chart. Look for:
- Name (often at the top of the chart)
- Birth date (may be formatted as "Jan 15, 1990" or "15.01.1990" or "1990-01-15")
- Birth time (may be "2:30 PM" or "14:30" or "2:30 am")
- Birth location/place (city, state/country)

For each planet you can identify, provide the data in this exact JSON format:
{
  "birthInfo": {
    "name": "Person's Name",
    "birthDate": "1990-01-15",
    "birthTime": "14:30",
    "birthLocation": "New York, NY, USA"
  },
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

For birthInfo:
- birthDate MUST be in YYYY-MM-DD format (e.g., "1990-01-15")
- birthTime MUST be in 24-hour HH:MM format (e.g., "14:30" for 2:30 PM)
- If you can't find certain birth info, omit that field (don't include empty strings)

Planet names to look for: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Ascendant (or ASC), NorthNode (or North Node, NN, True Node), SouthNode, Chiron, Lilith (Black Moon Lilith), Ceres, Pallas, Juno, Vesta, PartOfFortune, Vertex, Eris, Sedna, Makemake, Haumea, Quaoar, Orcus, Ixion, Varuna.

Signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.

If a planet shows retrograde (R, ℞, or Rx), set isRetrograde to true.

IMPORTANT - Astro.com House Cusp Format:
- At the bottom, astro.com prints 6 cusps: AC, 2, 3, MC, 11, 12.
- Interpret these as: AC=house1, house2=house2, house3=house3, MC=house10, house11=house11, house12=house12.
- Extract ONLY these 6 printed cusps into astroComCusps.

Return ONLY the JSON object, no other text.`;

    // Build the message content based on file type
    let messageContent: any[];
    
    if (isPDF) {
      // For PDFs, include both the document and ask AI to extract text
      messageContent = [
        { type: "text", text: prompt },
        { 
          type: "file", 
          file: { 
            filename: fileName || "chart.pdf",
            file_data: imageBase64 
          } 
        },
      ];
    } else if (isWord) {
      // For Word docs, similar approach
      messageContent = [
        { type: "text", text: prompt },
        { 
          type: "file", 
          file: { 
            filename: fileName || "chart.docx",
            file_data: imageBase64 
          } 
        },
      ];
    } else {
      // For images, use image_url format
      messageContent = [
        { type: "text", text: prompt },
        { type: "image_url", image_url: { url: imageBase64 } },
      ];
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
              content: messageContent,
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      return new Response(JSON.stringify({ error: "Failed to analyze file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
    }

    // Deterministically derive ALL 12 house cusps from Astro.com's printed 6-cusp format.
    // Printed: AC=1, 2=2, 3=3, MC=10, 11=11, 12=12.
    // Derived by opposites: 4↔10, 5↔11, 6↔12, 7↔1, 8↔2, 9↔3.
    if (parsedData?.astroComCusps && typeof parsedData.astroComCusps === "object") {
      const c = parsedData.astroComCusps;
      const cusp1 = c.AC;
      const cusp2 = c.house2;
      const cusp3 = c.house3;
      const cusp10 = c.MC;
      const cusp11 = c.house11;
      const cusp12 = c.house12;

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
        house4: makeOpp(cusp10),
        house5: makeOpp(cusp11),
        house6: makeOpp(cusp12),
        house7: makeOpp(cusp1),
        house8: makeOpp(cusp2),
        house9: makeOpp(cusp3),
        house10: cusp10,
        house11: cusp11,
        house12: cusp12,
      };

      // Attach if we have the 3 key printed cusps + MC.
      if (houseCusps.house1 && houseCusps.house2 && houseCusps.house3 && houseCusps.house10) {
        parsedData.houseCusps = houseCusps;
      }
    }

    return new Response(
      JSON.stringify({ success: true, data: parsedData, raw: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in parse-chart-image:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
