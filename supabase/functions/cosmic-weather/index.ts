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
    const { date, moonPhase, moonSign, exactLunarPhase, stelliums, rareAspects, nodeAspects, mercuryRetro, aspects, planetPositions, customPrompt } = await req.json();
    
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
- [Specific suggestion tied to the Moon sign/phase]
- [Specific suggestion tied to the day's major aspects]  
- [Specific suggestion tied to any retrogrades or notable transits]

## Planetary Day Practice
Today is [DAY OF WEEK], ruled by [PLANET]. 
**Color to wear/use:** [COLOR]
**Activities favored:** [2-3 specific activities this planet supports - e.g., Mars days favor exercise, negotiations, confronting issues; Venus days favor art, beautifying spaces, connecting with loved ones]
**Simple ritual:** [ONE concrete 5-minute practice - e.g., "Light a red candle and write down one thing you've been avoiding confronting" or "Arrange fresh flowers or tidy one corner of your space"]

## Cosmic Kitchen: Today's Menu
Based on the Moon in [SIGN], today's planetary weather, AND Ayurvedic Ritucharya (seasonal wisdom), here's what to nourish yourself with:

**🍳 Breakfast: [Dish Name](https://www.google.com/search?q=dish+name+recipe)**
*Why:* [2-3 sentences weaving BOTH astrological AND Ayurvedic reasoning. Consider: Moon sign element, current season's dosha, digestive fire (Agni) in the morning, and warming/cooling properties of foods.]

**🥗 Lunch: [Dish Name](https://www.google.com/search?q=dish+name+recipe)**
*Why:* [2-3 sentences explaining both cosmic and Ayurvedic alignment. Midday = strongest Agni, so heavier foods are appropriate. Connect to planetary hours if relevant.]

**🍽️ Dinner: [Dish Name](https://www.google.com/search?q=dish+name+recipe)**
*Why:* [2-3 sentences for evening meal. Ayurveda recommends lighter evening meals. How does this complement the day's cosmic themes while honoring digestion?]

**🥜 Snacks:** [Snack 1](https://www.google.com/search?q=snack+recipe), [Snack 2](https://www.google.com/search?q=snack+recipe), [Snack 3](https://www.google.com/search?q=snack+recipe)
*Why:* [Brief Ayurvedic + astrological reasoning for each snack choice]

**🍵 Drink of the Day: [Beverage Name](https://www.google.com/search?q=beverage+recipe)**
*Why:* [Why this drink matches cosmic weather AND current seasonal dosha needs]

## ✨ Featured Recipe of the Day
Create ONE complete, original recipe that embodies today's cosmic and Ayurvedic energy. This should be a simple, shareable recipe.

**RECIPE_START**
RECIPE_NAME: [Creative name incorporating the Moon sign or planetary theme - e.g., "Cancer Moon Comfort Kitchari" or "Mars Day Warming Dal"]
RECIPE_TAGLINE: [One poetic line about why this recipe aligns with today's energy]
SERVINGS: [number]
PREP_TIME: [time]
COOK_TIME: [time]
MOON_SIGN: [current Moon sign symbol and name]
ELEMENT: [Fire/Earth/Air/Water]
INGREDIENTS:
- [ingredient 1 with amount]
- [ingredient 2 with amount]
- [ingredient 3 with amount]
- [continue for all ingredients, typically 6-12 items]
INSTRUCTIONS:
1. [Step 1]
2. [Step 2]
3. [Step 3]
- [continue for all steps]
COSMIC_NOTE: [2-3 sentences explaining the astrological and Ayurvedic significance of this dish]
**RECIPE_END**

IMPORTANT: Make all dish/food names clickable markdown links using this format: [Dish Name](https://www.google.com/search?q=dish+name+recipe) - replace spaces with + in the URL.

INTEGRATED COSMIC-AYURVEDIC FOOD WISDOM:

SEASONAL CONTEXT (Ritucharya) - ALWAYS CONSIDER:
- WINTER (Nov-Feb, Hemanta/Shishira): Vata season. Agni is STRONG. Favor warm, oily, heavy, sweet, sour, salty foods. AVOID cold, raw, dry foods (no cold cucumber, raw salads, ice water). Ghee, soups, stews, root vegetables, warm spices (ginger, cinnamon, black pepper), sesame oil, nuts, whole grains.
- SPRING (Mar-May, Vasanta): Kapha accumulates. Favor light, dry, warming, bitter, pungent, astringent. Reduce heavy, oily, sweet. Honey, barley, millet, leafy greens, ginger tea.
- SUMMER (Jun-Aug, Grishma): Pitta season. Agni is WEAK. Favor cooling, sweet, light, liquid foods. Cucumber, melons, coconut, mint, coriander, sweet fruits, dairy (if tolerated). Avoid excess spicy, sour, salty.
- AUTUMN (Sep-Oct, Sharad): Pitta releasing. Favor sweet, bitter, astringent, cooling. Ghee to balance accumulated heat. Pomegranates, grapes, rice, wheat.

ZODIAC-DOSHA FOOD CORRESPONDENCES:
- FIRE SIGNS (Aries, Leo, Sagittarius): Pitta constitution tendency. Cool the fire with sweet, bitter, astringent. Cooling spices (coriander, fennel, mint). BUT in winter, they still need warming base with cooling accents.
- EARTH SIGNS (Taurus, Virgo, Capricorn): Kapha/Vata mix. Ground with warm, nourishing foods. Avoid excess heavy/oily if Kapha, avoid excess dry/cold if Vata. Root vegetables, grains, warming spices.
- AIR SIGNS (Gemini, Libra, Aquarius): Vata constitution tendency. Ground and warm! Favor warm, moist, oily, grounding. Ghee, soups, stews, root vegetables, warm grains. AVOID cold, dry, raw, light foods.
- WATER SIGNS (Cancer, Scorpio, Pisces): Kapha tendency with emotional depth. Balance with warming spices, light cooking. Avoid excess dairy, sweet, heavy. Ginger, turmeric, light proteins, cooked vegetables.

MOON SIGN DAILY GUIDANCE (integrate with seasonal awareness):
- Aries Moon: Pitta-activating day. In winter, warming proteins with cooling herbs (cilantro garnish). In summer, lighter fare.
- Taurus Moon: Venus indulgence meets groundedness. Sensory-rich but seasonally appropriate. Winter: hearty comfort. Summer: sweet fruits.
- Gemini Moon: Variable appetite, Vata energy. Multiple small warm meals. Avoid raw/cold regardless of season. Warming teas.
- Cancer Moon: Deep nourishment, Kapha-Water. Warm soups, broths, comfort foods. In summer, lighter versions. Avoid cold despite water sign association.
- Leo Moon: Heart-centered, Pitta. Golden foods (turmeric, saffron). In winter, warming with ghee. In summer, cooling with coconut.
- Virgo Moon: Digestive focus, Mercury-ruled. Clean, easily digestible. Kitchari, steamed vegetables, cumin, fennel for digestion.
- Libra Moon: Balance and beauty. Harmonious flavor combinations. Venus sweetness balanced with bitter greens.
- Scorpio Moon: Transformation, detox-friendly. Bitter greens, fermented foods, warming spices. Supports release.
- Sagittarius Moon: Expansive Jupiter. International flavors but grounded. Warming curries in winter, lighter global fare in summer.
- Capricorn Moon: Structure and tradition. Bone broths, slow-cooked, deeply nourishing. Saturn builds with patience.
- Aquarius Moon: Innovation meets Vata. Unusual combinations but ALWAYS warm and grounding. Avoid raw/cold.
- Pisces Moon: Oceanic fluidity. Warm soups, gentle spices, easy-to-digest. Avoid heavy, favor warm liquids. Ginger-lemon tea.

CRITICAL SEASONAL OVERRIDE:
- In WINTER: Never recommend cold foods (cucumber, raw salads, cold smoothies, ice cream) even for water signs or "cooling" Moon signs. The body needs WARMTH.
- In SUMMER: Fire sign Moons can have more cooling foods. Still avoid ice-cold.
- ALWAYS honor Agni (digestive fire): warm breakfast to kindle it, largest meal at lunch when Agni peaks, lighter dinner.`;


    // Determine Ayurvedic season based on date
    const getAyurvedicSeason = (dateStr: string): string => {
      const d = new Date(dateStr);
      const month = d.getMonth(); // 0-indexed
      if (month >= 10 || month <= 1) return "WINTER (Hemanta/Shishira) - Vata season, strong Agni. Favor warm, oily, heavy, nourishing foods. AVOID cold, raw, dry foods.";
      if (month >= 2 && month <= 4) return "SPRING (Vasanta) - Kapha accumulating. Favor light, dry, warming, bitter, pungent. Reduce heavy/oily/sweet.";
      if (month >= 5 && month <= 7) return "SUMMER (Grishma) - Pitta season, weak Agni. Favor cooling, sweet, light foods. Avoid excess spicy/sour.";
      return "AUTUMN (Sharad) - Pitta releasing. Favor sweet, bitter, astringent, cooling. Ghee for balance.";
    };
    
    const currentSeason = getAyurvedicSeason(date);

    // Use custom prompt if provided, otherwise use the default daily prompt
    const userPrompt = customPrompt ? `${customPrompt}

${planetText}
${moonJupiterConjunction}` : `Generate cosmic weather for ${date}.

${planetText}

${exactPhaseText ? `${exactPhaseText}` : `Moon Phase: ${moonPhase}`}
Current Moon Sign: ${moonSign}
${moonJupiterConjunction}
Mercury Retrograde: ${mercuryRetro ? 'Yes' : 'No'}
${stelliumText}
${rareAspectText}
${nodeAspectText}
${aspectsText}

AYURVEDIC SEASON: ${currentSeason}

CRITICAL: Use EXACT degrees provided. If a Full Moon is at 13° Cancer, say "Full Moon at 13° Cancer" - not 9° or any other number. Be direct and practical. No mystical fluff or greetings. For Cosmic Kitchen, ALWAYS honor the current Ayurvedic season - in winter, NEVER suggest cold/raw foods like cucumber or cold smoothies.`;

    console.log("Sending prompt to AI:", userPrompt.substring(0, 500) + "...");

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