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

    const isPDF = fileType === 'pdf' || imageBase64.includes('application/pdf');
    const isWord = fileType === 'word' || imageBase64.includes('application/vnd.openxmlformats') || imageBase64.includes('application/msword');
    const isImage = !isPDF && !isWord;

    const prompt = `Extract Human Design chart data from this ${isPDF || isWord ? 'document' : 'image'}.

LOOK FOR HUMAN DESIGN SPECIFIC DATA:
- Type: Generator, Manifesting Generator, Projector, Manifestor, or Reflector
- Profile: Two numbers like 1/3, 2/4, 3/5, 4/6, 5/1, 6/2, etc.
- Strategy: Wait to respond, Inform before acting, Wait for invitation, Wait lunar cycle
- Authority: Emotional (Solar Plexus), Sacral, Splenic, Ego Manifested, Ego Projected, Self-Projected, Mental/Environmental, Lunar (None)
- Definition: Single, Split, Triple Split, Quadruple Split, No Definition
- Incarnation Cross: Usually 4 numbers like "Right Angle Cross of Planning (37/40 | 9/16)"

BIRTH DATA - Extract if visible:
- Name (person's name on the chart)
- Birth date (convert to YYYY-MM-DD)
- Birth time (convert to 24-hour HH:MM)
- Birth location (city, country)

PLANETARY GATE ACTIVATIONS - This is the key data:
Look for two columns of planetary positions, usually labeled:
- "Design" or "Unconscious" (red) - calculated 88 days before birth
- "Personality" or "Conscious" (black) - calculated at birth

For each planet (Sun, Earth, Moon, North Node, South Node, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto), extract:
- Gate number (1-64)
- Line number (1-6)
- Whether it's Design/Unconscious or Personality/Conscious

CENTERS - If visible:
- Which of the 9 centers are defined (colored) vs undefined (white)
- Centers: Head, Ajna, Throat, G, Heart/Will/Ego, Sacral, Solar Plexus, Spleen, Root

CHANNELS - If visible:
- Which channels are defined (connecting two centers)

Return this exact JSON structure (no markdown, no commentary):
{
  "birthInfo": {
    "name": "Person Name",
    "birthDate": "1990-01-15",
    "birthTime": "14:30",
    "birthLocation": "New York, NY, USA"
  },
  "hdType": "Generator",
  "profile": "4/6",
  "strategy": "Wait to respond",
  "authority": "Emotional (Solar Plexus)",
  "definition": "Split",
  "incarnationCross": "Right Angle Cross of Planning (37/40 | 9/16)",
  "designActivations": [
    { "planet": "Sun", "gate": 37, "line": 4 },
    { "planet": "Earth", "gate": 40, "line": 4 },
    { "planet": "Moon", "gate": 22, "line": 3 }
  ],
  "personalityActivations": [
    { "planet": "Sun", "gate": 9, "line": 6 },
    { "planet": "Earth", "gate": 16, "line": 6 },
    { "planet": "Moon", "gate": 55, "line": 2 }
  ],
  "definedCenters": ["Sacral", "Solar Plexus", "G", "Throat"],
  "definedChannels": ["37-40", "22-12"],
  "warnings": ["optional notes about parsing issues"]
}

CRITICAL RULES:
- Gate numbers are 1-64
- Line numbers are 1-6
- There should be 13 planets in each column (Design and Personality): Sun, Earth, Moon, North Node, South Node, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto
- Earth is always opposite Sun (180°), so its gate is determinable from Sun's position
- If you can't read a value clearly, note it in warnings but make your best attempt
- If the chart shows both astrology AND Human Design data, extract the Human Design data specifically

Return ONLY the JSON object.`;

    let messageContent: any[];
    
    if (isPDF) {
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

    let parsedData: any = null;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      }
    } catch {
      console.error("Failed to parse AI response as JSON:", content);
    }

    return new Response(
      JSON.stringify({ success: true, data: parsedData, raw: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error in parse-hd-chart:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
