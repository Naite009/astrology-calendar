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

    const prompt = `Extract planetary positions and house cusps from this astrological chart ${isPDF || isWord ? 'document' : 'image'}.

CRITICAL - READ THE PRINTED TABLE(S), NOT THE WHEEL:
- There is usually a PRINTED TABLE of planet positions below or beside the wheel. READ THAT TABLE EXACTLY.
- Many charts also include a PRINTED TABLE of HOUSE CUSPS (1..12 or AC/MC/11/12). READ THAT TABLE EXACTLY.
- Copy values EXACTLY as printed. Do not guess or approximate.

DEGREE / MINUTES - DO NOT SWAP:
- Degrees are 0..29 and minutes are 0..59.
- Example: "21°47' Aries" must be degree=21, minutes=47.
- If you are unsure, prefer returning null/omitting that cusp rather than guessing.

RETROGRADE DETECTION - BE VERY CAREFUL:
- DEFAULT: Set isRetrograde: false for ALL planets UNLESS you see an explicit retrograde marker.
- Only set isRetrograde: true if you see one of these markers DIRECTLY NEXT TO the planet symbol or name: R, ℞, Rx, (R), or the word "retrograde".
- If there is NO marker next to a planet, it is DIRECT (isRetrograde: false).
- DO NOT GUESS. If unsure, set isRetrograde: false.

ASCENDANT (AC) - VERY IMPORTANT:
- The Ascendant is often labeled "AC", "Asc", or "ASC" in the table or on the chart.
- It may appear in the house cusps section as "I" or "1" for the 1st house cusp.
- Include it in planets as "Ascendant" with sign, degree, minutes.

NODES - READ CAREFULLY:
- North Node may be labeled: ☊, "True Node", "Mean Node", "North Node", or "Rahu"
- South Node may be labeled: ☋, "South Node", or "Ketu" 
- Read their degrees from the TABLE, not the wheel position.

SELECTING THE RIGHT CHART:
- Extract ONLY the NATAL/RADIX/BIRTH chart, not transits or progressions.
- If multiple charts exist, use the one with birth info (date, time, place).

Extract birth info if visible:
- Name (usually at top)
- Birth date (convert to YYYY-MM-DD format)
- Birth time (convert to 24-hour HH:MM)
- Birth location

Return this exact JSON structure (no markdown, no commentary):
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
    "Ascendant": { "sign": "Leo", "degree": 5, "minutes": 30, "isRetrograde": false }
  },
  "houseCusps": {
    "house1": { "sign": "Leo", "degree": 5, "minutes": 30 },
    "house2": { "sign": "Virgo", "degree": 2, "minutes": 15 },
    "house3": { "sign": "Libra", "degree": 1, "minutes": 0 },
    "house4": { "sign": "Scorpio", "degree": 1, "minutes": 0 },
    "house5": { "sign": "Sagittarius", "degree": 25, "minutes": 0 },
    "house6": { "sign": "Aries", "degree": 21, "minutes": 47 },
    "house7": { "sign": "Aquarius", "degree": 5, "minutes": 30 },
    "house8": { "sign": "Pisces", "degree": 2, "minutes": 15 },
    "house9": { "sign": "Aries", "degree": 1, "minutes": 0 },
    "house10": { "sign": "Aquarius", "degree": 5, "minutes": 30 },
    "house11": { "sign": "Pisces", "degree": 2, "minutes": 15 },
    "house12": { "sign": "Aries", "degree": 1, "minutes": 0 }
  },
  "astroComCusps": {
    "AC": { "sign": "Leo", "degree": 5, "minutes": 30 },
    "house2": { "sign": "Virgo", "degree": 2, "minutes": 15 },
    "house3": { "sign": "Libra", "degree": 1, "minutes": 0 },
    "MC": { "sign": "Aquarius", "degree": 5, "minutes": 30 },
    "house11": { "sign": "Pisces", "degree": 2, "minutes": 15 },
    "house12": { "sign": "Aries", "degree": 1, "minutes": 0 }
  },
  "warnings": ["optional issues encountered"]
}

Rules:
- READ THE TABLE EXACTLY - do not approximate degrees.
- Ascendant MUST be included in planets if visible anywhere on the chart.
- RETROGRADE DEFAULT IS FALSE - only true with explicit marker (R, ℞, Rx, (R)).
- NorthNode and SouthNode degrees must match the table exactly.
- birthDate: YYYY-MM-DD format.
- birthTime: 24-hour HH:MM format.
- Planet names: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Ascendant, NorthNode, SouthNode, Chiron, Lilith, Ceres, Pallas, Juno, Vesta, PartOfFortune, Vertex, Eris, Sedna, Makemake, Haumea, Quaoar, Orcus, Ixion, Varuna.
- Signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.

For Astro.com charts: if you only see 6 cusps printed (AC, 2, 3, MC, 11, 12), extract those into astroComCusps. If you see all 12 printed, prefer filling houseCusps directly.

Return ONLY the JSON object.`;

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
          // Use a stronger multimodal model for higher OCR + table accuracy.
          model: "google/gemini-2.5-pro",
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
      console.error("AI API error:", response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Failed to analyze file" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Safely parse response body
    const responseText = await response.text();
    if (!responseText || responseText.trim() === "") {
      console.error("AI API returned empty response");
      return new Response(JSON.stringify({ error: "AI returned empty response. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let data: any;
    try {
      data = JSON.parse(responseText);
    } catch (parseErr) {
      console.error("Failed to parse AI gateway response:", responseText.slice(0, 500));
      return new Response(JSON.stringify({ error: "Invalid response from AI. Please try again." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

    // If the model already returned full houseCusps, keep them as-is.
    // Otherwise, deterministically derive ALL 12 house cusps from Astro.com's printed 6-cusp format.
    // Printed: AC=1, 2=2, 3=3, MC=10, 11=11, 12=12.
    // Derived by opposites: 4↔10, 5↔11, 6↔12, 7↔1, 8↔2, 9↔3.
    const hasFullHouseCusps = (hc: any): boolean => {
      if (!hc || typeof hc !== 'object') return false;
      for (let i = 1; i <= 12; i++) {
        const c = hc[`house${i}`];
        if (!c?.sign) return false;
      }
      return true;
    };

    if (!hasFullHouseCusps(parsedData?.houseCusps) && parsedData?.astroComCusps && typeof parsedData.astroComCusps === "object") {
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

        // Detect intercepted signs by checking which signs are "skipped" between consecutive house cusps
        const signOrder = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
                          "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
        const interceptedSigns: string[] = [];

        for (let h = 1; h <= 12; h++) {
          const currentHouse = houseCusps[`house${h}`];
          const nextHouse = houseCusps[`house${h === 12 ? 1 : h + 1}`];

          if (currentHouse?.sign && nextHouse?.sign) {
            const currentIdx = signOrder.indexOf(currentHouse.sign);
            const nextIdx = signOrder.indexOf(nextHouse.sign);

            if (currentIdx !== -1 && nextIdx !== -1) {
              // Calculate how many signs between current and next cusp
              const signsBetween = (nextIdx - currentIdx + 12) % 12;

              // If more than 1 sign between cusps, the skipped sign(s) are intercepted
              if (signsBetween > 1) {
                for (let s = 1; s < signsBetween; s++) {
                  const interceptedIdx = (currentIdx + s) % 12;
                  const interceptedSign = signOrder[interceptedIdx];
                  if (!interceptedSigns.includes(interceptedSign)) {
                    interceptedSigns.push(interceptedSign);
                  }
                }
              }
            }
          }
        }

        if (interceptedSigns.length > 0) {
          parsedData.interceptedSigns = interceptedSigns;
        }
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
