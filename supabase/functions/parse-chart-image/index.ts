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
    const { imageBase64, fileType, fileName, chartType } = await req.json();

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

    const isSolarReturn = chartType === 'solar-return';
    const docType = isPDF || isWord ? 'document' : 'image';

    const chartSelectionInstructions = isSolarReturn
      ? `SELECTING THE RIGHT CHART:
- This is a SOLAR RETURN chart. Extract the Solar Return planetary positions as the PRIMARY "planets" data.
- The Solar Return chart shows where the planets were when the Sun returned to its natal degree.
- Do NOT confuse the natal birth data sidebar with the SR chart positions — the SR WHEEL and SR TABLE are what matter.
- If the chart shows both natal and SR data (bi-wheel), extract the OUTER ring (Solar Return) positions into "planets".
- The location shown is the Solar Return location, not necessarily the birth location.
- Extract the SR date (the birthday return date) if visible.`
      : `SELECTING THE RIGHT CHART:
- Extract the NATAL/RADIX/BIRTH chart as primary.
- ALSO extract progressions and transits if they appear on the same chart.
- If multiple charts exist, use the one with birth info (date, time, place).`;

    const prompt = `Extract planetary positions, house cusps, PROGRESSIONS, and TRANSITS from this astrological ${isSolarReturn ? 'SOLAR RETURN ' : ''}chart ${docType}.

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

EXTENDED CELESTIAL BODIES - EXTRACT ALL THAT ARE VISIBLE:
- Goddess asteroids: Ceres (⚳), Pallas (⚴), Juno (⚵), Vesta (⚶)
- Love/health asteroids: Psyche, Eros, Amor, Hygiea
- Centaurs: Chiron (⚷), Pholus, Nessus, Chariklo
- Dwarf planets/TNOs: Eris, Sedna, Makemake, Haumea, Quaoar, Orcus, Ixion, Varuna, Gonggong, Salacia
- Points: Lilith (Mean Lilith ⚸), Part of Fortune (⊕ or Fortuna), Vertex (Vx)
- If ANY of these appear in the table or chart, extract them with the same sign/degree/minutes format.

PROGRESSIONS (AC pr, MC pr, planets) - IMPORTANT:
- Look for a section labeled "Progressions", "Secondary Progressions", "Progressed", or "pr" suffix.
- Common locations: small box to the right of the wheel, or in a separate table section.
- "AC pr" or "Asc pr" = Progressed Ascendant
- "MC pr" = Progressed Midheaven
- Progressed planets may be listed with "pr" suffix (e.g., "Sun pr", "Moon pr")
- Extract ALL progressed positions you can find.

TRANSITS - IMPORTANT:
- Look for a section labeled "Transits", "Current Transits", or "Transit" prefix.
- These show current planetary positions at the time the chart was generated.
- Often in an outer ring on the wheel or in a separate table.
- Extract transit positions if visible.

${chartSelectionInstructions}

Extract birth info if visible:
- Name (usually at top)
- Birth date (convert to YYYY-MM-DD format)
- Birth time (convert to 24-hour HH:MM)
- Birth location
- Progression/Transit date if shown (the "current" date the chart was calculated for)${isSolarReturn ? '\n- Solar Return date (the date of the Sun return)' : ''}

Return this exact JSON structure (no markdown, no commentary):
{
  "birthInfo": {
    "name": "Person's Name",
    "birthDate": "1990-01-15",
    "birthTime": "14:30",
    "birthLocation": "New York, NY, USA",
    "progressionDate": "2025-02-06"${isSolarReturn ? ',\n    "solarReturnDate": "2025-01-15",\n    "solarReturnLocation": "Houston, TX, USA"' : ''}
  },
  "planets": {
    "Sun": { "sign": "Aries", "degree": 15, "minutes": 23, "isRetrograde": false },
    "Moon": { "sign": "Cancer", "degree": 8, "minutes": 12, "isRetrograde": false },
    "Ascendant": { "sign": "Leo", "degree": 5, "minutes": 30, "isRetrograde": false },
    "Chiron": { "sign": "Aries", "degree": 20, "minutes": 5, "isRetrograde": false },
    "Ceres": { "sign": "Taurus", "degree": 12, "minutes": 30, "isRetrograde": false },
    "Juno": { "sign": "Gemini", "degree": 8, "minutes": 15, "isRetrograde": false },
    "Pallas": { "sign": "Virgo", "degree": 3, "minutes": 45, "isRetrograde": false },
    "Vesta": { "sign": "Scorpio", "degree": 18, "minutes": 22, "isRetrograde": false },
    "Lilith": { "sign": "Cancer", "degree": 15, "minutes": 10, "isRetrograde": false },
    "PartOfFortune": { "sign": "Leo", "degree": 22, "minutes": 5, "isRetrograde": false },
    "Psyche": { "sign": "Libra", "degree": 7, "minutes": 30, "isRetrograde": false },
    "Eros": { "sign": "Pisces", "degree": 14, "minutes": 20, "isRetrograde": false }
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
  "progressions": {
    "AC": { "sign": "Virgo", "degree": 12, "minutes": 45 },
    "MC": { "sign": "Gemini", "degree": 8, "minutes": 30 },
    "Sun": { "sign": "Taurus", "degree": 20, "minutes": 15 },
    "Moon": { "sign": "Scorpio", "degree": 3, "minutes": 42 }
  },
  "transits": {
    "Sun": { "sign": "Aquarius", "degree": 17, "minutes": 22 },
    "Moon": { "sign": "Gemini", "degree": 5, "minutes": 10 },
    "Mercury": { "sign": "Aquarius", "degree": 28, "minutes": 15 }
  },

  // OPTIONAL BUT STRONGLY PREFERRED (for accuracy):
  // Provide the exact cusp lines you read, verbatim, so the system can re-parse degrees/minutes deterministically.
  // Examples of acceptable lines:
  // "5  Sagittarius 25°04'"  or  "11  Gemini 25 04"  or  "MC  Taurus 25°19'"
  "rawCuspLines": ["..."] ,

  "warnings": ["optional issues encountered"]
}

Rules:
- READ THE TABLE EXACTLY - do not approximate degrees.
- Ascendant MUST be included in planets if visible anywhere on the chart.
- RETROGRADE DEFAULT IS FALSE - only true with explicit marker (R, ℞, Rx, (R)).
- NorthNode and SouthNode degrees must match the table exactly.
- birthDate: YYYY-MM-DD format.
- birthTime: 24-hour HH:MM format.
- Planet names: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Ascendant, NorthNode, SouthNode, Chiron, Lilith, Ceres, Pallas, Juno, Vesta, PartOfFortune, Vertex, Eris, Sedna, Makemake, Haumea, Quaoar, Orcus, Ixion, Varuna, Psyche, Eros, Amor, Hygiea, Nessus, Pholus, Chariklo, Gonggong, Salacia.
- Signs: Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces.
- For progressions: Include AC, MC, and any progressed planets visible.
- For transits: Include any transit positions visible on the chart.
- EXTRACT EVERY celestial body visible in the table — do not skip asteroids, centaurs, or dwarf planets.

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

    const SIGN_SET = new Set([
      "Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
    ]);

    const coerceInt = (v: unknown): number | null => {
      if (typeof v === 'number' && Number.isFinite(v)) return Math.trunc(v);
      if (typeof v === 'string') {
        const m = v.match(/-?\d+/);
        if (!m) return null;
        const n = parseInt(m[0], 10);
        return Number.isFinite(n) ? n : null;
      }
      return null;
    };

    const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

    const parseCuspLine = (line: string): { key: string; sign: string; degree: number; minutes: number } | null => {
      // Expected examples:
      // "5 Sagittarius 25°04'" | "11 Gemini 25 04" | "MC Taurus 25°19'" | "AC Virgo 00°32'"
      const clean = line.replace(/\s+/g, ' ').trim();
      if (!clean) return null;

      const upper = clean.toUpperCase();
      let key: string | null = null;
      if (/\bAC\b|\bASC\b/.test(upper)) key = 'house1';
      else if (/\bMC\b/.test(upper)) key = 'house10';
      else {
        const m = clean.match(/\b(1[0-2]|[1-9])\b/);
        if (m) key = `house${m[1]}`;
      }
      if (!key) return null;

      const sign = Array.from(SIGN_SET).find(s => new RegExp(`\\b${s}\\b`, 'i').test(clean));
      if (!sign) return null;

      // Prefer degree/minute patterns with explicit symbols, but fall back to two numbers.
      // 25°04' OR 25° 4' OR 25 04
      let degree: number | null = null;
      let minutes: number | null = null;

      const sym = clean.match(/(\d{1,2})\s*°\s*(\d{1,2})\s*['′]/);
      if (sym) {
        degree = coerceInt(sym[1]);
        minutes = coerceInt(sym[2]);
      } else {
        const two = clean.match(/\b(\d{1,2})\b[^\d]+\b(\d{1,2})\b/);
        if (two) {
          degree = coerceInt(two[1]);
          minutes = coerceInt(two[2]);
        }
      }

      if (degree === null || minutes === null) return null;
      if (degree < 0 || degree > 29) return null;
      if (minutes < 0 || minutes > 59) return null;

      return { key, sign, degree, minutes };
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

    // If provided, deterministically re-parse cusps from rawCuspLines to avoid degree/minute swaps.
    if (parsedData?.rawCuspLines && Array.isArray(parsedData.rawCuspLines)) {
      const derivedCusps: any = {};
      for (const line of parsedData.rawCuspLines) {
        if (typeof line !== 'string') continue;
        const parsed = parseCuspLine(line);
        if (!parsed) continue;
        derivedCusps[parsed.key] = { sign: parsed.sign, degree: parsed.degree, minutes: parsed.minutes };
      }
      if (Object.keys(derivedCusps).length > 0) {
        parsedData.houseCusps = { ...(parsedData.houseCusps || {}), ...derivedCusps };
      }
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
