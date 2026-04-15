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
      cycleDegree,
      phaseName,
      chartName,
      intentions,
      natalPlanets,
      newMoonHouse,
      natalAspects,
      whatIsSurfacing,
      // Synthesis mode
      synthesize,
      tarotCardName,
      oracleCardName,
      tarotInterpretation,
      oracleInterpretation,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // ═══ SYNTHESIS MODE ═══
    if (synthesize) {
      const synthesisSystemPrompt = `You are a wise spiritual guide who synthesizes multiple card pulls into a unified message. You blend tarot, oracle, astrology, and lunar wisdom into a single cohesive takeaway.

Your synthesis should:
- Find the common thread or tension between the two cards
- Weave in the current lunar cycle energy and the querent's natal chart
- End with ONE powerful, memorable takeaway sentence — like a fortune cookie but deeper
- Keep it to 2-3 short paragraphs maximum
- Be warm, specific, and practical — not generic
- Use the querent's actual natal placements when connecting themes

REWRITE FOR RECOGNITION: Every sentence must feel like something the reader has actually experienced. Do not use abstract phrases like "profound invitation" or "deep calling." Describe what actually happens: "you may notice old worries coming back at night", "this is the part where you stop waiting for permission and just begin."

CRITICAL: Use the EXACT house positions provided in the natal data. Do NOT infer houses from zodiac signs. The house positions have been calculated from the actual birth chart house cusps.`;

      const synthesisUserPrompt = `TAROT CARD: ${tarotCardName}
ORACLE CARD: ${oracleCardName}

TAROT INTERPRETATION SUMMARY:
${tarotInterpretation ? tarotInterpretation.substring(0, 600) : 'Not yet interpreted'}

ORACLE INTERPRETATION SUMMARY:
${oracleInterpretation ? oracleInterpretation.substring(0, 600) : 'Not yet interpreted'}

LUNAR CYCLE: ${cycleSign} New Moon${cycleDegree ? ` at ${cycleDegree}°` : ''}, ${phaseName} phase
${newMoonHouse ? `New Moon in ${newMoonHouse}${getOrdinalSuffix(parseInt(newMoonHouse))} House` : ''}
${chartName ? `Reading for: ${chartName}` : ''}
${natalPlanets ? `\nNATAL CHART: ${natalPlanets}` : ''}
${intentions ? `\nINTENTIONS: "${intentions}"` : ''}
${whatIsSurfacing ? `\nWHAT IS SURFACING: "${whatIsSurfacing}"` : ''}

Synthesize these two cards into a unified message. Find the thread that connects them. End with a single powerful takeaway sentence.`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: synthesisSystemPrompt },
            { role: "user", content: synthesisUserPrompt }
          ],
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error("Failed to generate synthesis");
      }

      const data = await response.json();
      const synthesis = data.choices?.[0]?.message?.content || "Unable to generate synthesis.";
      return new Response(JSON.stringify({ synthesis }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ═══ SINGLE CARD INTERPRETATION MODE ═══
    const isReversed = cardName.includes('(Reversed)');
    const cleanCardName = cardName.replace(' (Reversed)', '').trim();

    const cardContext = cardType === 'tarot' 
      ? `The user drew the Tarot card: "${cleanCardName}"${isReversed ? ' in the REVERSED position' : ' UPRIGHT'}`
      : `The user drew the Oracle card: "${cleanCardName}" from the "${deckName || 'unknown'}" deck`;

    const reversalGuidance = isReversed ? `

IMPORTANT: This card appeared REVERSED. A reversed card does NOT simply mean the opposite of the upright meaning. Reversals indicate:
- The energy is internalized, blocked, delayed, or being resisted
- A shadow expression of the card's archetype
- An invitation to look inward rather than outward
- Sometimes: the energy is just beginning to emerge or is fading out

Weave the reversal meaning throughout your interpretation. Be specific about what the reversal changes about the card's usual message.` : '';

    // Build rich natal chart context
    let natalChartBlock = '';
    if (natalPlanets) {
      natalChartBlock += `\n\nNATAL CHART PLACEMENTS (for ${chartName || 'the querent'}):\n${natalPlanets}`;
    }
    if (newMoonHouse) {
      natalChartBlock += `\n- This New Moon falls in the native's ${newMoonHouse}${getOrdinalSuffix(parseInt(newMoonHouse))} House`;
      const houseTheme = HOUSE_THEMES[parseInt(newMoonHouse)];
      if (houseTheme) natalChartBlock += ` (${houseTheme})`;
    }
    if (natalAspects) {
      natalChartBlock += `\n- New Moon aspects to natal planets: ${natalAspects}`;
    }

    const systemPrompt = `You are a wise and compassionate spiritual guide who interprets cards through the lens of astrology, lunar cycles, and personal growth. You blend traditional card meanings with deep astrological insight and intuitive, soul-centered guidance.

CRITICAL ACCURACY RULES:
- Use the EXACT house positions provided in the natal data (e.g., "Venus: 15° Taurus (House 2)"). Do NOT infer or guess house placements from zodiac signs. The houses have been calculated from actual birth chart cusps and are DEFINITIVE.
- If the data says "Saturn: 22° Leo (House 10)" then Saturn is in the 10TH house, NOT the 5th house. Sign ≠ House.
- Always cite the actual house number from the parentheses in the natal data.

WRITING STYLE RULES:
- Each interpretation must feel UNIQUE. Do not reuse phrases like "profound invitation" or "deep calling" across multiple readings.
- Vary your opening, your metaphors, and your framing for each card type (tarot vs oracle).
- For tarot: ground the interpretation in the card's visual symbolism and archetypal narrative
- For oracle: focus on the card's direct message and how it speaks to the current moment

REWRITE FOR RECOGNITION: Every sentence must describe something the reader has actually lived through. Do not say "this card invites transformation" — say "this is about the moment you realize something in your life has already changed and you can't go back." The reader should think "that's exactly what I'm going through" — not "that sounds interesting."

Your interpretations should:
- Connect the card's symbolism to the current lunar phase, zodiac energy, AND the querent's natal chart
- Reference specific natal placements WITH their correct houses (e.g., "With your Venus in Taurus in your 2nd house...")
- Explain how the current lunar phase activates specific houses and planets in their chart
- Note any natal aspects the New Moon makes to their planets and what that amplifies
- Offer practical, actionable guidance personalized to their chart
- Be warm and encouraging without being superficial
- Reference the user's stated intentions and current life themes if provided
- Keep the interpretation focused (3-4 paragraphs)${reversalGuidance}

TAROT-ASTROLOGY CORRESPONDENCES (use when relevant):
Major Arcana: The Fool=Uranus, Magician=Mercury, High Priestess=Moon, Empress=Venus, Emperor=Aries, Hierophant=Taurus, Lovers=Gemini, Chariot=Cancer, Strength=Leo, Hermit=Virgo, Wheel of Fortune=Jupiter, Justice=Libra, Hanged Man=Neptune, Death=Scorpio, Temperance=Sagittarius, Devil=Capricorn, Tower=Mars, Star=Aquarius, Moon=Pisces, Sun=Sun, Judgement=Pluto, World=Saturn.
Wands=Fire (Aries/Leo/Sagittarius), Cups=Water (Cancer/Scorpio/Pisces), Swords=Air (Gemini/Libra/Aquarius), Pentacles=Earth (Taurus/Virgo/Capricorn).
Court Cards: Pages=Earth of suit, Knights=Air/Fire of suit, Queens=Water of suit, Kings=Fire of suit.`;

    const userPrompt = `${cardContext}

LUNAR CYCLE CONTEXT:
- Current Lunar Cycle: ${cycleSign} New Moon${cycleDegree ? ` at ${cycleDegree}°` : ''}
- Current Phase: ${phaseName}
${newMoonHouse ? `- New Moon House in Natal Chart: ${newMoonHouse}${getOrdinalSuffix(parseInt(newMoonHouse))} House` : ''}
${natalAspects ? `- New Moon Aspects to Natal Planets: ${natalAspects}` : ''}
${chartName ? `- Reading for: ${chartName}` : ''}
${natalChartBlock}
${intentions ? `\nSTATED INTENTIONS FOR THIS CYCLE: "${intentions}"` : ''}
${whatIsSurfacing ? `\nCURRENT LIFE THEMES (what is surfacing): "${whatIsSurfacing}"` : ''}

REMINDER: Use ONLY the house numbers shown in parentheses in the natal data above. Do NOT map signs to "natural" houses.

Please provide a rich astrological interpretation of this card. Weave together:
1. The card's traditional meaning and its astrological ruler/element
2. How it connects to the ${cycleSign} New Moon energy at the ${phaseName} phase
3. What it means specifically for this person given their natal placements${newMoonHouse ? ` and ${newMoonHouse}${getOrdinalSuffix(parseInt(newMoonHouse))} house activation` : ''}
4. Practical guidance for working with this energy during this lunar cycle`;

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

function getOrdinalSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

const HOUSE_THEMES: Record<number, string> = {
  1: 'identity, body, self-presentation',
  2: 'money, values, security, self-worth',
  3: 'communication, siblings, local travel, learning',
  4: 'home, family, roots, emotional foundation',
  5: 'creativity, romance, children, play, joy',
  6: 'work, health, daily routines, service',
  7: 'relationships, partnerships, agreements',
  8: 'intimacy, shared resources, transformation, death/rebirth',
  9: 'beliefs, higher education, travel, philosophy',
  10: 'career, public role, reputation, calling',
  11: 'friendships, groups, future goals, community',
  12: 'spirituality, retreat, the unconscious, endings',
};
