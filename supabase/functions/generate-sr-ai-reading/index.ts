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
    const { fullJson } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const d = fullJson;

    // Build a rich context from the full JSON
    let ctx = `SOLAR RETURN READING FOR: ${d.name || 'Unknown'}\n`;
    ctx += `Birth: ${d.birthDate || ''}, ${d.birthLocation || ''}\n`;
    ctx += `Solar Return Year: ${d.solarReturnYear || ''}\n\n`;

    // Big Three
    ctx += `NATAL: Sun ${d.natalSun}, Moon ${d.natalMoon}, Rising ${d.natalRising}\n`;
    ctx += `SR: Sun ${d.srSun}, Moon ${d.srMoon}, Rising ${d.srRising}\n\n`;

    // Year theme
    if (d.yearlyTheme) {
      ctx += `SR ASCENDANT: ${d.yearlyTheme.ascendantSign} Rising, ruler ${d.yearlyTheme.ascendantRuler} in ${d.yearlyTheme.ascendantRulerSign} (House ${d.yearlyTheme.ascendantRulerHouse || '—'})\n`;
    }

    // Lord of the Year
    if (d.lordOfTheYear) {
      ctx += `LORD OF THE YEAR: ${d.lordOfTheYear.planet} in ${d.lordOfTheYear.srSign} (House ${d.lordOfTheYear.srHouse || '—'}), dignity: ${d.lordOfTheYear.dignity}${d.lordOfTheYear.isRetrograde ? ' Rx' : ''}\n`;
    }

    // Profection
    if (d.profectionYear) {
      ctx += `PROFECTION: Age ${d.profectionYear.age}, House ${d.profectionYear.houseNumber || d.profectionYear.house} year, Time Lord: ${d.profectionYear.timeLord}\n`;
    }

    // Sun & Moon houses
    ctx += `SUN: SR House ${d.sunHouse?.house || '—'}, Natal overlay House ${d.sunNatalHouse?.house || '—'}\n`;
    ctx += `MOON: ${d.srMoon} SR House ${d.moonHouse?.house || '—'}, Phase: ${d.moonPhase?.phase || '—'}\n`;
    if (d.moonAngularity) ctx += `Moon Angularity: ${d.moonAngularity}\n`;
    if (d.moonVOC) ctx += `Moon is VOID OF COURSE (unaspected) — emotional isolation theme\n`;

    // Moon aspects
    if (d.srMoonAspects?.length > 0) {
      ctx += `\nMOON ASPECTS:\n`;
      d.srMoonAspects.slice(0, 8).forEach((a: any) => {
        ctx += `- Moon ${a.aspectType} ${a.targetPlanet} (${a.orb}' orb): ${a.interpretation || ''}\n`;
      });
    }

    // Angular planets
    if (d.angularPlanets?.length > 0) ctx += `\nANGULAR PLANETS: ${d.angularPlanets.join(', ')}\n`;

    // Stelliums
    if (d.stelliums?.length > 0) {
      ctx += `STELLIUMS: ${d.stelliums.map((s: any) => `${s.planets.join(', ')} in ${s.location}`).join('; ')}\n`;
    }

    // Element & Modality
    if (d.elementBalance) ctx += `ELEMENTS: Fire ${d.elementBalance.fire}, Earth ${d.elementBalance.earth}, Air ${d.elementBalance.air}, Water ${d.elementBalance.water} — Dominant: ${d.elementBalance.dominant}\n`;
    if (d.modalityBalance) ctx += `MODALITY: Cardinal ${d.modalityBalance.cardinal}, Fixed ${d.modalityBalance.fixed}, Mutable ${d.modalityBalance.mutable}\n`;

    // Saturn & Nodes
    if (d.saturnFocus) ctx += `SATURN: ${d.saturnFocus.sign} House ${d.saturnFocus.house || '—'}${d.saturnFocus.isRetrograde ? ' Rx' : ''}\n`;
    if (d.nodesFocus) ctx += `NORTH NODE: ${d.nodesFocus.sign} House ${d.nodesFocus.house || '—'}\n`;

    // Retrogrades
    if (d.retrogrades?.count > 0) ctx += `RETROGRADES: ${d.retrogrades.planets.join(', ')}\n`;

    // Top aspects
    if (d.srToNatalAspects?.length > 0) {
      ctx += `\nTOP SR-TO-NATAL ASPECTS:\n`;
      d.srToNatalAspects.slice(0, 10).forEach((a: any) => {
        ctx += `- SR ${a.srPlanet || a.planet1} ${a.aspect || a.type} Natal ${a.natalPlanet || a.planet2} (${a.orb}° orb)\n`;
      });
    }

    // Executive Summary
    if (d.executiveSummary) {
      const es = d.executiveSummary;
      if (es.opportunities?.length) ctx += `\nTOP OPPORTUNITIES: ${es.opportunities.map((o: any) => o.title || o).join('; ')}\n`;
      if (es.challenges?.length) ctx += `TOP CHALLENGES: ${es.challenges.map((c: any) => c.title || c).join('; ')}\n`;
    }

    // Identity Shift
    if (d.identityShift) {
      ctx += `\nIDENTITY SHIFT — "Who you are becoming":\n`;
      if (d.identityShift.pillars) {
        d.identityShift.pillars.forEach((p: any) => ctx += `- ${p.name}: ${p.narrative || ''}\n`);
      }
      if (d.identityShift.creativeTension) ctx += `Creative Tension: ${d.identityShift.creativeTension}\n`;
    }

    // Life Domain Scores
    if (d.lifeDomainScores) {
      ctx += `\nLIFE DOMAIN SCORES:\n`;
      Object.entries(d.lifeDomainScores).forEach(([k, v]: [string, any]) => {
        if (typeof v === 'object' && v?.score !== undefined) {
          ctx += `- ${k}: ${v.score}/10 — ${v.summary || ''}\n`;
        }
      });
    }

    // Contradictions
    if (d.contradictions?.length > 0) {
      ctx += `\nCONTRADICTIONS (opposing energies):\n`;
      d.contradictions.forEach((c: any) => {
        ctx += `- ${c.title || ''}: ${c.narrative || ''}\n`;
      });
    }

    // Action Guidance
    if (d.actionGuidance) {
      const ag = d.actionGuidance;
      if (ag.leanInto?.length) ctx += `\nLEAN INTO: ${ag.leanInto.join('; ')}\n`;
      if (ag.avoid?.length) ctx += `AVOID: ${ag.avoid.join('; ')}\n`;
      if (ag.bestUse?.length) ctx += `BEST USE: ${ag.bestUse.join('; ')}\n`;
    }

    // Dignity Report
    if (d.dignityReport?.length > 0) {
      ctx += `\nDIGNITY REPORT:\n`;
      d.dignityReport.slice(0, 8).forEach((dr: any) => {
        ctx += `- ${dr.planet}: ${dr.sign}, score ${dr.score} (${dr.label || ''})\n`;
      });
    }

    // Quarterly Focus
    if (d.quarterlyFocus?.length > 0) {
      ctx += `\nQUARTERLY FOCUS:\n`;
      d.quarterlyFocus.forEach((q: any) => {
        ctx += `- Q${q.quarter}: ${q.theme || q.focus || ''}\n`;
      });
    }

    // Activation Windows summary
    if (d.activationWindows) {
      const aw = d.activationWindows;
      if (aw.peakPeriods?.length) {
        ctx += `\nPEAK ACTIVATION PERIODS: ${aw.peakPeriods.map((p: any) => `${p.label || p.month || ''}`).join(', ')}\n`;
      }
      ctx += `Total transit hits: ${aw.transitHitCount || 0}\n`;
    }

    // Lunar Weather Map summary
    if (d.lunarWeatherMap?.months?.length > 0) {
      ctx += `\nLUNAR EMOTIONAL WEATHER (12-month summary):\n`;
      d.lunarWeatherMap.months.slice(0, 12).forEach((m: any) => {
        ctx += `- ${m.label || m.month}: Moon in ${m.moonSign || '—'}, theme: ${m.theme || m.emotionalTone || ''}\n`;
      });
    }

    const systemPrompt = `You are a master astrologer with 40 years of experience writing deeply personalized solar return readings. You have access to the COMPLETE analysis dataset — every calculation, every score, every synthesis layer. Your task is to weave ALL of this into a cohesive, flowing narrative that reads like a personal letter.

STRUCTURE YOUR READING AS FOLLOWS:

## The Year at a Glance
A vivid 2-paragraph summary of the year's defining energy — the SR Ascendant, Lord of the Year, Profection house, and their interplay.

## Who You Are Becoming
Use the Identity Shift data to describe the transformation arc. Name the three pillars and any creative tension.

## Your Emotional Landscape
The SR Moon — sign, house, phase, aspects, angularity. What does this year FEEL like emotionally? How does it differ from the natal Moon?

## The Central Tensions
Use the Contradictions data. Name opposing forces and how to integrate them. "You may feel pulled between X and Y because..."

## Life Domains This Year
Walk through Career, Love, Health, and Growth scores with specific planetary justifications.

## Saturn's Assignment
What Saturn demands this year — the discipline, the test, the reward.

## The Soul's Growth Edge
North Node placement — what the soul is being pulled toward.

## Key Activation Windows
When the year heats up — peak periods and notable transit hits.

## Quarterly Rhythm
Break the year into four seasonal themes.

## Guidance for the Year
Lean into / Avoid / Best use — practical advice grounded in the chart.

VOICE: Direct, warm, specific, honest. No generic affirmations. Every statement must be traceable to the chart data. If something is hard, name it with compassion. If something is a gift, name it precisely. Write in flowing paragraphs, not bullet points. Use the person's name naturally. Aim for 1200-1500 words total.

CRITICAL: Do NOT invent any planetary positions, aspects, or house placements not in the data. The SR Moon does NOT advance through the year — it is a frozen snapshot.`;

    const userPrompt = `Write a comprehensive personalized Solar Return reading for ${d.name || 'this person'} using ALL the chart data below. Every statement must be grounded in the data provided.\n\n${ctx}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add AI credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("generate-sr-ai-reading error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
