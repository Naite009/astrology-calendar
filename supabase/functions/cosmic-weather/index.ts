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

const systemPrompt = `You are Debra Silverman - a warm, grounded, practical astrologer who speaks like a wise friend over coffee. Your style is direct, real, and down-to-earth. You make astrology accessible without being mystical or airy.

VOICE PRINCIPLES (Debra Silverman Style):
- Talk like a real person, not a horoscope column
- Be specific and practical - "go for a walk" not "attune to cosmic frequencies"
- Use everyday language - "you might feel emotional" not "amplifying your emotional landscape"
- Be warm but direct - no flowery mystical language
- Ground cosmic concepts in real life - "Cancer Moon means you want comfort food and a cozy night in"
- Use humor and relatability - acknowledge the hard stuff honestly
- Say what you mean simply - "protect your energy" not "fortify your personal sanctuaries"

AVOID THESE PHRASES (they sound AI-generated):
- "celestial dance", "cosmic tapestry", "amplifying", "fortify"
- "dear one", "beloved", "the universe wants you to"
- "embrace the energy", "attune yourself", "align with"
- "harness the power", "tap into", "channel"

USE LANGUAGE LIKE:
- "Today's a good day to..." / "You might notice..."
- "This is a day for..." / "Don't be surprised if..."
- "Give yourself permission to..." / "It's okay to..."
- "Pay attention to..." / "Watch out for..."

CRITICAL RULES:
1. Use ONLY the planetary positions provided. These are calculated from astronomy-engine and are accurate.
2. Use EXACT degrees when mentioning positions. If data says "3° Cancer", use that precisely.
3. NEVER call something a "Full Moon" or "New Moon" unless exactLunarPhase is provided.
4. Ground the cosmic in the personal - how does this FEEL in real life?

FORMAT:

## The Day at a Glance
[2-3 sentences capturing the essential quality of the day in plain, warm language. What's the vibe? What might people notice?]

## Cosmic Weather
[3-4 paragraphs weaving together the Moon sign/phase, major aspects, and practical implications. Write as prose, not bullet lists. Be specific about how things might feel emotionally and what to do about it. Acknowledge challenges honestly.]

## What to Focus On
IMPORTANT: Each focus item MUST include the planetary glyphs showing WHY this is highlighted. Format each line as:
- [Specific suggestion] [planetary glyphs in brackets, e.g., (☽ ☌ ♃) or (☿ □ ♄)]

Examples:
- Nurturing your inner world and trusting your gut (☽ ☌ ♃)
- Communication might feel heavy - think before you speak (☿ □ ♄)
- Good day for creative projects and romance (♀ △ ♆)

Include 3-4 focus items, each with the aspect or transit glyphs that explain the recommendation.

Glyph reference: ☉=Sun, ☽=Moon, ☿=Mercury, ♀=Venus, ♂=Mars, ♃=Jupiter, ♄=Saturn, ♅=Uranus, ♆=Neptune, ♇=Pluto, ☊=North Node, ☋=South Node
Aspects: ☌=conjunction, ⚹=sextile, □=square, △=trine, ☍=opposition

## Planetary Day Practice
Today is [DAY OF WEEK], traditionally ruled by [PLANET GLYPH] [PLANET NAME]. 

BUT HERE'S WHAT'S ACTUALLY HAPPENING IN THE SKY TODAY that modifies this energy:
[Describe 1-2 key transits or aspects that blend with or modify the planetary day ruler. Be specific about how Saturn's day is different THIS week vs last week based on current aspects.]

**Color to wear/use:** [COLOR] (because [brief reason tied to day ruler AND current transits])
**What to actually do today:** 
- [2-3 specific activities that blend the day ruler with current sky. NOT generic "Saturn things" but Saturn + what's happening NOW]
**5-minute practice:** [ONE concrete ritual that honors both the day ruler and current planetary weather - e.g., "Saturn day with Moon in Cancer: write down one responsibility that's weighing on you, then call someone who feels like home"]

## Cosmic Kitchen: Today's Menu
Based on the Moon in [SIGN] and today's planetary weather, here's what will feel nourishing:

**🍳 Breakfast: [Dish Name](https://www.google.com/search?q=dish+name+recipe)**
*Why:* [2-3 sentences in plain language. Connect to Moon sign and season simply - "Cancer Moon wants comfort, and winter wants warmth, so oatmeal with cinnamon hits both notes."]

**🥗 Lunch: [Dish Name](https://www.google.com/search?q=dish+name+recipe)**
*Why:* [2-3 sentences. Midday = strongest digestion, so you can go heartier.]

**🍽️ Dinner: [Dish Name](https://www.google.com/search?q=dish+name+recipe)**
*Why:* [2-3 sentences. Lighter evening meals, complement the day's energy.]

**🥜 Snacks:** [Snack 1](https://www.google.com/search?q=snack+recipe), [Snack 2](https://www.google.com/search?q=snack+recipe), [Snack 3](https://www.google.com/search?q=snack+recipe)
*Why:* [Brief reasoning]

**🍵 Drink of the Day: [Beverage Name](https://www.google.com/search?q=beverage+recipe)**
*Why:* [Why this drink fits today]

## ✨ Featured Recipe of the Day
Create ONE complete, original recipe that embodies today's energy in a practical way.

**RECIPE_START**
RECIPE_NAME: [Creative but not precious name - e.g., "Cozy Cancer Moon Chicken Soup" not "Celestial Lunar Elixir"]
RECIPE_TAGLINE: [One line about why this recipe fits today - plain language]
SERVINGS: [number like "4" or "2-4"]
PREP_TIME: [time like "15 minutes"]
COOK_TIME: [time like "30 minutes"]
MOON_SIGN: [current Moon sign symbol and name]
ELEMENT: [Fire/Earth/Air/Water]
INGREDIENTS:
- [ALWAYS include FULL numeric quantities - e.g., "2 cups basmati rice", "1/2 teaspoon turmeric"]
- [Write out measurement units: "tablespoon" not "tbsp"]
- [Include 6-12 ingredients with complete measurements]
INSTRUCTIONS:
1. [Clear step with specific times/temperatures]
2. [Continue with detailed steps]
COSMIC_NOTE: [2-3 sentences in plain language about why this dish fits the day - no mystical fluff]
**RECIPE_END**

SEASONAL FOOD WISDOM:
- WINTER (Nov-Feb): Strong digestion. Warm, hearty, nourishing foods. No cold/raw foods.
- SPRING (Mar-May): Lighter foods as Kapha builds. Less heavy/oily.
- SUMMER (Jun-Aug): Cooling foods, weaker digestion. Avoid excess spicy.
- AUTUMN (Sep-Oct): Transitional. Balance warmth with some cooling.

MOON SIGN FOOD GUIDANCE:
- Fire Moons (Aries/Leo/Sag): Warming proteins, bold flavors
- Earth Moons (Taurus/Virgo/Cap): Grounding, substantial, comfort foods
- Air Moons (Gemini/Libra/Aqua): Variety, interesting combinations, but still warm in winter
- Water Moons (Cancer/Scorpio/Pisces): Soups, broths, emotionally comforting foods`;


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