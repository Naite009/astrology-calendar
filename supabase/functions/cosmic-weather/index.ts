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
    const { date, moonPhase, moonSign, exactLunarPhase, stelliums, rareAspects, nodeAspects, mercuryRetro, aspects, planetPositions } = await req.json();
    
    console.log("Received cosmic weather request:", { date, moonPhase, moonSign, exactLunarPhase, planetPositions });
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build planetary positions text - this is the ground truth
    const planetText = planetPositions?.length > 0
      ? `Current Planetary Positions (VERIFIED ASTRONOMICAL DATA):
${planetPositions.map((p: any) => `- ${p.name}: ${p.degree}° ${p.sign}`).join('\n')}`
      : '';

    // Build the astrological context for the prompt
    const stelliumText = stelliums?.length > 0 
      ? `Stelliums: ${stelliums.map((s: any) => `${s.count} planets in ${s.sign} (${s.planets.map((p: any) => p.name).join(', ')})`).join('; ')}`
      : '';
    
    const rareAspectText = rareAspects?.length > 0
      ? `Rare Aspects: ${rareAspects.map((a: any) => `${a.planet1} ${a.type} ${a.planet2}`).join('; ')}`
      : '';
    
    const nodeAspectText = nodeAspects?.length > 0
      ? `Destiny Aspects: ${nodeAspects.map((a: any) => `${a.planet} ${a.type} ${a.node} Node`).join('; ')}`
      : '';

    const aspectsText = aspects?.length > 0
      ? `Major Aspects: ${aspects.slice(0, 5).map((a: any) => `${a.planet1} ${a.symbol} ${a.planet2}`).join('; ')}`
      : '';

    // Find significant conjunctions (Moon with outer planets)
    const moonPlanet = planetPositions?.find((p: any) => p.name === 'Moon');
    const jupiterPlanet = planetPositions?.find((p: any) => p.name === 'Jupiter');
    let moonJupiterConjunction = '';
    if (moonPlanet && jupiterPlanet && moonPlanet.sign === jupiterPlanet.sign) {
      moonJupiterConjunction = `SIGNIFICANT: Moon and Jupiter are BOTH in ${moonPlanet.sign} - this is a powerful conjunction for abundance, optimism, and emotional expansion!`;
    }

    // Build exact lunar phase information if present
    let exactPhaseText = '';
    if (exactLunarPhase) {
      exactPhaseText = `EXACT LUNAR EVENT (FIXED TIMESTAMP): ${exactLunarPhase.type} at ${exactLunarPhase.position} ${exactLunarPhase.sign} at ${exactLunarPhase.time}`;
      if (exactLunarPhase.name) {
        exactPhaseText += ` (${exactLunarPhase.name})`;
      }
      if (exactLunarPhase.isSupermoon) {
        exactPhaseText += ' - SUPERMOON';
      }
      exactPhaseText += `\nIMPORTANT: Use this EXACT degree (${exactLunarPhase.position}) when mentioning the ${exactLunarPhase.type}. This is a fixed astronomical event.`;
    }

const systemPrompt = `You are a sophisticated professional astrologer in the tradition of Liz Greene, Chris Brennan, and Chani Nicholas. Your voice is warm but grounded, psychologically insightful but accessible. You speak directly to the reader as if they're a trusted client.

WRITING STYLE:
- Write like the daily horoscopes from The Mountain Astrologer, Chani Nicholas, or Astrology Hub
- Lead with the FEELING and INVITATION of the day, not technical jargon
- Use poetic-but-practical language - evocative but not airy-fairy
- Include psychological depth - what are the inner dynamics at play?
- Give specific, actionable guidance for real life
- Reference the planetary positions naturally within the narrative
- End with an empowering takeaway

CRITICAL RULES:
1. Use ONLY the planetary positions provided. These are calculated from astronomy-engine and are accurate.
2. Use EXACT degrees when mentioning positions. If data says "3° Cancer", use that precisely.
3. NEVER call something a "Full Moon" or "New Moon" unless exactLunarPhase is provided.
4. No mystical clichés like "dear one" or "the universe wants you to..."
5. Ground the cosmic in the personal - how does this FEEL in real life?

FORMAT:
## The Day at a Glance
[2-3 evocative sentences capturing the essential quality of the day's energy]

## Cosmic Weather
[3-4 paragraphs weaving together the Moon sign/phase, major aspects, and practical implications. Write as prose, not bullet lists. Include psychological insights and how this might manifest emotionally and practically.]

## What to Focus On
- [Specific, actionable suggestion #1]
- [Specific, actionable suggestion #2]  
- [Specific, actionable suggestion #3]

## The Invitation
[A short, empowering closing thought - 2 sentences max]`;


    const userPrompt = `Generate cosmic weather for ${date}.

${planetText}

${exactPhaseText ? `${exactPhaseText}` : `Moon Phase: ${moonPhase}`}
Current Moon Sign: ${moonSign}
${moonJupiterConjunction}
Mercury Retrograde: ${mercuryRetro ? 'Yes' : 'No'}
${stelliumText}
${rareAspectText}
${nodeAspectText}
${aspectsText}

CRITICAL: Use EXACT degrees provided. If a Full Moon is at 13° Cancer, say "Full Moon at 13° Cancer" - not 9° or any other number. Be direct and practical. No mystical fluff or greetings.`;

    console.log("Sending prompt to AI:", userPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
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
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const insight = data.choices?.[0]?.message?.content || "Unable to generate insights at this time.";

    return new Response(JSON.stringify({ insight }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Cosmic weather error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});