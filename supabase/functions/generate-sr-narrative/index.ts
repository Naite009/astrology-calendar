import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysisData, chartName, srYear, referenceExcerpts = '' } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const a = analysisData;

    // Build a comprehensive prompt from all the analysis data
    let dataContext = `SOLAR RETURN ANALYSIS FOR: ${chartName} — SR Year ${srYear}\n\n`;

    // Year theme
    if (a.yearlyTheme) {
      dataContext += `SR ASCENDANT: ${a.yearlyTheme.ascendantSign} Rising, ruled by ${a.yearlyTheme.ascendantRuler} in ${a.yearlyTheme.ascendantRulerSign}${a.yearlyTheme.ascendantRulerHouse ? ` (SR House ${a.yearlyTheme.ascendantRulerHouse})` : ''}\n`;
    }

    // SR Ascendant Ruler in Natal Houses (J-B Morin technique)
    if (a.srAscRulerInNatal) {
      dataContext += `SR ASC RULER IN NATAL: ${a.srAscRulerInNatal.rulerPlanet} (ruler of ${a.srAscRulerInNatal.srAscSign}) in ${a.srAscRulerInNatal.rulerSRSign}${a.srAscRulerInNatal.rulerSRHouse ? ` (SR House ${a.srAscRulerInNatal.rulerSRHouse})` : ''} → falls in Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '—'} (${a.srAscRulerInNatal.rulerNatalHouseTheme || ''})\n`;
      if (a.srAscRulerInNatal.interpretation) {
        dataContext += `  Interpretation: ${a.srAscRulerInNatal.interpretation}\n`;
      }
    }

    // SR Ascendant degree in Natal House (Lynn Bell)
    if (a.srAscInNatalHouse) {
      dataContext += `SR ASC DEGREE IN NATAL: The SR Ascendant falls in Natal House ${a.srAscInNatalHouse.natalHouse} (${a.srAscInNatalHouse.natalHouseTheme || ''})\n`;
    }

    // Lord of the Year
    if (a.lordOfTheYear) {
      dataContext += `LORD OF THE YEAR: ${a.lordOfTheYear.planet} in ${a.lordOfTheYear.srSign} ${a.lordOfTheYear.srDegree}${a.lordOfTheYear.srHouse ? ` (SR House ${a.lordOfTheYear.srHouse})` : ''} — ${a.lordOfTheYear.dignity}${a.lordOfTheYear.isRetrograde ? ' Rx' : ''}\n`;
      dataContext += `Natal Rising Sign: ${a.lordOfTheYear.natalRisingSign}\n`;
    }

    // Profection
    if (a.profectionYear) {
      dataContext += `PROFECTION: Age ${a.profectionYear.age}, House ${a.profectionYear.houseNumber} year, Time Lord: ${a.profectionYear.timeLord} in ${a.profectionYear.timeLordSRSign || '—'}${a.profectionYear.timeLordSRHouse ? ` (SR House ${a.profectionYear.timeLordSRHouse})` : ''}${a.profectionYear.overlap ? ' — OVERLAPS with chart ruler' : ''}\n`;
    }

    // Sun & Moon
    dataContext += `\nSUN: SR House ${a.sunHouse?.house || '—'} (Natal overlay: House ${a.sunNatalHouse?.house || '—'})\n`;
    dataContext += `MOON: ${a.moonSign} in SR House ${a.moonHouse?.house || '—'} (Natal overlay: House ${a.moonNatalHouse?.house || '—'})\n`;

    // Moon Phase
    if (a.moonPhase) {
      dataContext += `MOON PHASE: ${a.moonPhase.phase}${a.moonPhase.isEclipse ? ' (near eclipse axis)' : ''}\n`;
    }

    // Angular planets
    if (a.angularPlanets?.length > 0) {
      dataContext += `ANGULAR PLANETS: ${a.angularPlanets.join(', ')}\n`;
    }

    // Stelliums
    if (a.stelliums?.length > 0) {
      dataContext += `STELLIUMS: ${a.stelliums.map((s: any) => {
        let desc = `${s.planets.join(', ')} in ${s.location}`;
        if (s.extraBodies?.length > 0) {
          desc += ` (also present: ${s.extraBodies.join(', ')})`;
        }
        return desc;
      }).join('; ')}\n`;
    }

    // Element & Modality
    if (a.elementBalance) {
      dataContext += `ELEMENT BALANCE: Fire ${a.elementBalance.fire}, Earth ${a.elementBalance.earth}, Air ${a.elementBalance.air}, Water ${a.elementBalance.water} — Dominant: ${a.elementBalance.dominant}${a.elementBalance.missing?.length > 0 ? `, Missing: ${a.elementBalance.missing.join(', ')}` : ''}\n`;
    }
    if (a.modalityBalance) {
      dataContext += `MODALITY: Cardinal ${a.modalityBalance.cardinal}, Fixed ${a.modalityBalance.fixed}, Mutable ${a.modalityBalance.mutable} — Dominant: ${a.modalityBalance.dominant}\n`;
    }

    // Retrogrades
    if (a.retrogrades) {
      dataContext += `RETROGRADES: ${a.retrogrades.count > 0 ? a.retrogrades.planets.join(', ') : 'None'}\n`;
    }

    // Saturn
    if (a.saturnFocus) {
      dataContext += `SATURN: ${a.saturnFocus.sign} in SR House ${a.saturnFocus.house || '—'}${a.saturnFocus.isRetrograde ? ' Rx' : ''}\n`;
    }

    // Nodes
    if (a.nodesFocus) {
      dataContext += `NORTH NODE: ${a.nodesFocus.sign} in SR House ${a.nodesFocus.house || '—'}\n`;
    }

    // Repeated themes
    if (a.repeatedThemes?.length > 0) {
      dataContext += `REPEATED NATAL THEMES: ${a.repeatedThemes.map((t: any) => t.description).join('; ')}\n`;
    }

    // Hemispheric
    if (a.hemisphericEmphasis) {
      dataContext += `HEMISPHERES: Upper ${a.hemisphericEmphasis.upper}, Lower ${a.hemisphericEmphasis.lower}, East ${a.hemisphericEmphasis.east}, West ${a.hemisphericEmphasis.west}\n`;
      dataContext += `Vertical: ${a.hemisphericEmphasis.verticalLabel || ''}\n`;
      dataContext += `Horizontal: ${a.hemisphericEmphasis.horizontalLabel || ''}\n`;
      if (a.hemisphericEmphasis.combinedInsight) dataContext += `Combined: ${a.hemisphericEmphasis.combinedInsight}\n`;
    }

    // Natal Degree Conduits (Lynn Bell)
    if (a.natalDegreeConduits?.length > 0) {
      dataContext += `\nNATAL DEGREE CONDUITS (SR planet on natal planet's degree ±2°):\n`;
      a.natalDegreeConduits.forEach((c: any) => {
        dataContext += `- SR ${c.srPlanet} at ${c.srDegree}° ${c.srSign} sits on Natal ${c.natalPlanet} at ${c.natalDegree}° ${c.natalSign} (${c.orbDiff}° orb)\n`;
      });
    }

    // SR Moon Aspects (frozen snapshot — emotional climate for the year)
    if (a.moonVOC) {
      dataContext += `\nSR MOON VOID OF COURSE (UNASPECTED): The SR Moon makes NO major aspects to any other SR planet. This is rare and significant — the emotional life this year operates in isolation, without planetary dialogue. Feelings are vivid but untethered. The person must consciously name and honor emotional needs, as the world won't automatically reflect them back. Creative expression, journaling, and therapy become essential containers.\n`;
    }
    if (a.srMoonAspects?.length > 0) {
      dataContext += `\nSR MOON ASPECTS (emotional climate — these are static aspects at the SR moment, NOT advancing):\n`;
      a.srMoonAspects.slice(0, 8).forEach((e: any) => {
        dataContext += `- Moon ${e.aspectType} ${e.targetPlanet} (${e.orb}' orb): ${e.interpretation}\n`;
      });
    }
    if (a.moonAngularity) {
      dataContext += `Moon Angularity: ${a.moonAngularity} (${a.moonAngularity === 'angular' ? 'reactive, instinctive' : a.moonAngularity === 'succedent' ? 'stable, grounded' : 'adaptive, internal'})\n`;
    }
    if (a.moonLateDegree) {
      dataContext += `Moon is in late degrees (25+) — signals emotional endings or transitions\n`;
    }

    // Top SR-to-Natal aspects
    if (a.srToNatalAspects?.length > 0) {
      const topAspects = a.srToNatalAspects.slice(0, 10);
      dataContext += `\nTOP SR-TO-NATAL ASPECTS:\n`;
      topAspects.forEach((asp: any) => {
        dataContext += `- SR ${asp.planet1} ${asp.type} Natal ${asp.planet2} (orb ${asp.orb}°)\n`;
      });
    }

    // Top SR internal aspects
    if (a.srInternalAspects?.length > 0) {
      const topInternal = a.srInternalAspects.slice(0, 8);
      dataContext += `\nTOP SR INTERNAL ASPECTS:\n`;
      topInternal.forEach((asp: any) => {
        dataContext += `- ${asp.planet1} ${asp.type} ${asp.planet2} (orb ${asp.orb}°)\n`;
      });
    }

    // House overlays
    if (a.houseOverlays?.length > 0) {
      dataContext += `\nHOUSE OVERLAYS (SR planets in natal houses):\n`;
      a.houseOverlays.forEach((o: any) => {
        dataContext += `- ${o.planet}: ${o.srSign} ${o.srDegree} → SR House ${o.srHouse || '—'}, Natal House ${o.natalHouse || '—'} (${o.houseTheme || ''})\n`;
      });
    }

    // Append reference material from user's uploaded books if available
    const refBlock = referenceExcerpts
      ? "\n\nREFERENCE LIBRARY (the user has uploaded astrological reference books — use these to enrich and ground your Solar Return interpretation. When you draw from this material, briefly cite the source):\n" + referenceExcerpts
      : '';

    const systemPrompt = `You are a senior professional astrologer writing a comprehensive Solar Return interpretation for a client. Your voice is warm, grounded, psychologically rich, and actionable — like a trusted advisor who deeply understands both astrology and human nature.${refBlock}

Write a cohesive year-ahead narrative that SYNTHESIZES all the data below into a flowing, insightful reading. Do NOT just list each factor separately — weave them together into themes. Structure with markdown headers:

## The Year Ahead: [Your 3-5 word theme title]

Start with the overall energy and tone of the year (1-2 paragraphs drawing from SR Ascendant, Moon Phase, and element/modality balance).

## Where This Year's Energy Lands
Focus on the SR Ascendant ruler and where it falls in the NATAL chart — this is the J-B Morin technique and is THE most important indicator of where the year plays out. Also weave in the SR Ascendant degree's natal house overlay (Lynn Bell), Sun house, Lord of the Year house, and Profection themes. These together tell the story of WHERE energy flows this year.

## Emotional Landscape
Moon sign, house, and phase. What emotional climate to expect and how to work with it.

## Key Players & Power Points
Angular planets, stelliums (including any extra bodies like Chiron or North Node that amplify the stellium), and the most significant SR-to-natal aspects. What is being activated in the natal chart?

## Natal Degree Connections
If any SR planets sit on natal planet degrees (conduits), explain how these reawaken natal themes — these are among the strongest activations in any Solar Return.

## House Overlays — SR Planets in Your Natal Houses
Briefly describe where each major SR planet falls in the natal houses. This shows which life areas each planet's energy flows into for the year.

## Saturn's Assignment
What Saturn demands this year — the area of responsibility and growth.

## Growth Edge
North Node focus — where the soul is being pulled toward evolution.

## Retrogrades & Review Periods
If retrogrades exist, what areas need revision. If none, note the forward momentum.

## Moon Timing — When Things Happen
If Moon timing events are provided, describe when key aspects perfect through the year (the SR Moon advances ~1° per month). This gives the client a month-by-month sense of activation.

## What to Watch For
2-3 specific, concrete things to pay attention to this year based on the strongest patterns.

## The Bottom Line
A punchy 2-3 sentence summary capturing the essence of the entire year.

RULES:
- Maximum 1200 words total
- Use bold for key planet/sign names
- Every claim must come directly from the data provided — NO fabricated placements
- Use plain language with technical terms explained naturally
- Be specific about house themes — don't just say "relationships" when you can say "partnerships, contracts, and how you show up for others"
- If a repeated natal theme exists, emphasize it as a confirmed/reinforced energy
- When discussing the SR Ascendant ruler in natal houses, make it clear this is the CENTRAL technique for reading the SR`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: dataContext },
        ],
        temperature: 0.4,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    const narrative = result.choices?.[0]?.message?.content || result.message?.content || '';

    return new Response(
      JSON.stringify({ narrative }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error generating SR narrative:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
