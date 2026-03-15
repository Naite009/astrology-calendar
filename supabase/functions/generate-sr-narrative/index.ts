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

    // SR Ascendant Ruler in Natal Houses
    if (a.srAscRulerInNatal) {
      dataContext += `SR ASC RULER IN NATAL: ${a.srAscRulerInNatal.rulerPlanet} (ruler of ${a.srAscRulerInNatal.srAscSign}) in ${a.srAscRulerInNatal.rulerSRSign}${a.srAscRulerInNatal.rulerSRHouse ? ` (SR House ${a.srAscRulerInNatal.rulerSRHouse})` : ''} → falls in Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '—'} (${a.srAscRulerInNatal.rulerNatalHouseTheme || ''})\n`;
      if (a.srAscRulerInNatal.interpretation) {
        dataContext += `  Interpretation: ${a.srAscRulerInNatal.interpretation}\n`;
      }
    }

    // SR Ascendant degree in Natal House
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
    // CRITICAL: The SR Moon is a STATIC SNAPSHOT — it does NOT advance 1°/month.
    // Do NOT send moonTimingEvents to the AI — that data is deprecated and inaccurate.
    if (a.moonVOC) {
      dataContext += `\nSR MOON VOID OF COURSE (UNASPECTED): The SR Moon makes NO major aspects to any other SR planet. This is rare and significant — the emotional life this year operates in isolation, without planetary dialogue. Feelings are vivid but untethered. The person must consciously name and honor emotional needs, as the world won't automatically reflect them back. Creative expression, journaling, and therapy become essential containers.\n`;
    }
    if (a.srMoonAspects?.length > 0) {
      dataContext += `\nSR MOON ASPECTS (STATIC emotional climate — these aspects exist at the moment of the Solar Return and describe the YEAR-LONG emotional tone, NOT month-by-month timing):\n`;
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
    dataContext += `\nCRITICAL ACCURACY NOTE: The SR Moon does NOT advance 1 degree per month. It is a frozen snapshot. Do NOT create a "Moon Timing" section or suggest the Moon "moves" through aspects during the year. The Moon's aspects in the SR chart describe the ENTIRE year's emotional climate, not specific monthly timing.\n`;

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

    const systemPrompt = `You are a master astrologer with 40 years of experience writing a personalized solar return reading. Write in flowing paragraphs with warmth and authority. No bullet points. No section headers inside the narrative. No technical jargon lists. Every sentence must be grounded in the chart data provided. Never invent placements or aspects not in the data.${refBlock}`;

    // Build structured user prompt with interpolated data
    const srAsc = a.yearlyTheme?.ascendantSign || '—';
    const srAscRuler = a.yearlyTheme?.ascendantRuler || '—';
    const srAscRulerSign = a.yearlyTheme?.ascendantRulerSign || '—';
    const srAscRulerHouse = a.yearlyTheme?.ascendantRulerHouse || '—';
    const srAscRulerNatalHouse = a.srAscRulerInNatal?.rulerNatalHouse || '—';
    const profectionHouse = a.profectionYear?.houseNumber || '—';
    const timeLord = a.profectionYear?.timeLord || a.lordOfTheYear?.planet || '—';
    const timeLordSign = a.lordOfTheYear?.srSign || a.profectionYear?.timeLordSRSign || '—';
    const timeLordHouse = a.lordOfTheYear?.srHouse || a.profectionYear?.timeLordSRHouse || '—';
    const timeLordDignity = a.lordOfTheYear?.dignity || 'Peregrine';
    const timeLordRx = a.lordOfTheYear?.isRetrograde ? 'yes' : 'no';
    const srMoonSign = a.moonSign || '—';
    const srMoonHouse = a.moonHouse?.house || '—';
    const moonPhase = a.moonPhase?.phase || '—';
    const stelliumsStr = a.stelliums?.length > 0
      ? a.stelliums.map((s: any) => `${s.planets.join(', ')} in ${s.location}`).join('; ')
      : 'None';
    const top5 = a.srToNatalAspects?.slice(0, 5).map((asp: any) =>
      `SR ${asp.planet1} ${asp.type} Natal ${asp.planet2} (${asp.orb}° orb)`
    ).join('; ') || 'None';
    const repeatedStr = a.repeatedThemes?.length > 0
      ? a.repeatedThemes.map((t: any) => t.description).join('; ')
      : 'None';

    const userPrompt = `Write a 400-word year-ahead reading for ${chartName} using ONLY the chart data provided. Do not invent any planet positions, signs, or house placements that are not explicitly in this data.

CHART DATA:
- SR Ascendant: ${srAsc}, ruled by ${srAscRuler} in ${srAscRulerSign} in SR house ${srAscRulerHouse}, falling in natal house ${srAscRulerNatalHouse}
- Profection year: House ${profectionHouse}, Time Lord: ${timeLord} in ${timeLordSign}, SR House ${timeLordHouse}, dignity ${timeLordDignity}, retrograde ${timeLordRx}
- SR Moon: ${srMoonSign}, House ${srMoonHouse}, phase ${moonPhase}
- Stelliums: ${stelliumsStr}
- Strongest aspects: ${top5}
- Repeated themes: ${repeatedStr}

CRITICAL INSTRUCTION — THE PROFECTION/TIME LORD TENSION:
The profection house describes what this year is ASKING FOR. The Time Lord describes the CONDITIONS under which it must be pursued. These are not always comfortable together — and that tension is the most important thing to name.

In this chart: House ${profectionHouse} is asking for ${profectionHouse === 1 ? 'identity and bold self-definition' : profectionHouse === 2 ? 'financial stability and real self-worth' : profectionHouse === 3 ? 'communication and mental clarity' : profectionHouse === 4 ? 'home, roots, and emotional foundations' : profectionHouse === 5 ? 'creativity, joy, and authentic self-expression' : profectionHouse === 6 ? 'health, service, and sustainable routines' : profectionHouse === 7 ? 'partnership and deep one-on-one connection' : profectionHouse === 8 ? 'transformation and release of what is dead' : profectionHouse === 9 ? 'expansion, meaning, and new horizons' : profectionHouse === 10 ? 'career achievement and public recognition' : profectionHouse === 11 ? 'community, friendship, and shared vision' : 'rest, spiritual depth, and inner preparation'}. The Time Lord ${timeLord} ${timeLord === 'Saturn' ? 'demands that this be EARNED — through structure, discipline, and real effort. Joy and ease are not denied; they are behind the door marked "do the actual work first." Saturn years feel heavier than the house theme suggests. That is not a mistake — it is the point.' : timeLord === 'Mars' ? 'demands courage and direct action. Nothing arrives without effort. Conflict may be the path to the reward.' : timeLord === 'Jupiter' ? 'expands what the house promises — but rewards faith and punishes overreach.' : timeLord === 'Venus' ? 'softens the year and opens social and creative doors with relative ease.' : timeLord === 'Mercury' ? 'puts the mind and communication at the center of how this year unfolds.' : timeLord === 'Moon' ? 'makes emotional attunement the key to unlocking what this year offers.' : timeLord === 'Sun' ? 'makes identity and purpose the engine of the year.' : timeLord === 'Pluto' ? 'demands deep transformation before the house promise can be accessed.' : timeLord === 'Neptune' ? 'dissolves certainty and asks for faith over control.' : timeLord === 'Uranus' ? 'disrupts the expected path and demands flexibility and innovation.' : 'sets the conditions for how the year unfolds.'}

ACCURACY RULES:
- ${timeLord} is in ${timeLordSign} in SR House ${timeLordHouse}. Use ONLY these positions when mentioning ${timeLord}.
- The SR Moon is in ${srMoonSign} in House ${srMoonHouse}. Do not place it anywhere else.
- The SR Sun is in House ${a.sunHouse?.house || '—'}. Do not move it.
- Every planet position you mention must come from the Full chart data below.

Write 4 paragraphs:
1. The single defining pattern of this year — name the profection house theme AND the Time Lord's conditions in one honest statement. What is this year actually about?
2. The emotional landscape — what the SR Moon in ${srMoonSign} in House ${srMoonHouse} with a ${moonPhase} phase means for how this person will feel day to day.
3. The central tension — what two energies are pulling against each other and what that friction is asking them to do.
4. The soul-level ask — what this year wants from this person at the deepest level, named with specificity not generality.

Voice: direct, warm, honest. If something is hard, say so with compassion. If something is a gift, name it precisely. No hedging. No generic affirmations. No invented placements.

Full chart data for reference:
${dataContext}`;

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
          { role: "user", content: userPrompt },
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
    let narrative = result.choices?.[0]?.message?.content || result.message?.content || '';

    // ── POST-CORRECTION: Strip Moon timing hallucinations ──
    // Remove any "Moon Timing" section the AI may have generated despite instructions
    narrative = narrative.replace(/## Moon Timing[^\n]*\n[\s\S]*?(?=##|$)/gi, '');
    // Remove sentences claiming the Moon advances 1°/month in the SR
    narrative = narrative.replace(/[^.]*(?:moon advances|moon moves|moon progresses|1[°\s]*(?:degree|deg)[\s/]*(?:per\s)?month|month[s]?\s+(?:in|from|after)\s+(?:the\s+)?(?:solar\s+)?return)[^.]*\./gi, '');
    // Remove "Around X months in" timing patterns
    narrative = narrative.replace(/[^.]*(?:around\s+\d+[-–]\d+\s+months?\s+in|early\s+in\s+the\s+year.*?SR\s+Moon|months?\s+(?:from|after)\s+(?:your\s+)?birthday)[^.]*\./gi, '');

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
