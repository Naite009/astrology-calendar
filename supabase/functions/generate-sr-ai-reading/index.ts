import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function calculateAge(birthDate: string, srYear: number): number | null {
  if (!birthDate) return null;
  const parts = birthDate.split('-');
  if (parts.length < 3) return null;
  const birthYear = parseInt(parts[0], 10);
  return srYear - birthYear;
}

function ageGroup(age: number | null): string {
  if (!age) return 'adult';
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 25) return 'young_adult';
  if (age <= 40) return 'adult';
  if (age <= 55) return 'midlife';
  if (age <= 70) return 'senior';
  return 'elder';
}

function ageContextInstructions(group: string, age: number | null): string {
  const ageStr = age ? `${age} years old` : 'unknown age';
  switch (group) {
    case 'child':
      return `This person is ${ageStr}. Write as if explaining to a smart child. Use simple words, short sentences. Talk about school, friends, family, hobbies, sports, imagination. No romance, career pressure, or adult responsibilities. Frame challenges as "things that might feel confusing or hard."`;
    case 'teen':
      return `This person is ${ageStr}. They care about identity, friendships, school, fitting in, independence from parents. Mention dating only lightly. Career = "what you might want to do someday." Frame growth as self-discovery. Use casual but respectful tone.`;
    case 'young_adult':
      return `This person is ${ageStr}. They're navigating early career, relationships, possibly first serious partnerships, finding independence, maybe grad school or first jobs. Be direct and actionable. "This is a year to..." format works well.`;
    case 'adult':
      return `This person is ${ageStr}. They likely have established relationships, career momentum, possibly children. Focus on deepening existing commitments, career advancement, work-life balance, and personal fulfillment beyond achievement.`;
    case 'midlife':
      return `This person is ${ageStr}. They may be reassessing life direction, dealing with aging parents, children leaving home, career pivots, health awareness, and legacy questions. Focus on wisdom, recalibration, and "what matters most now." Don't assume they're slowing down — many people this age are starting new chapters.`;
    case 'senior':
      return `This person is ${ageStr}. Focus on wisdom, mentorship, health and vitality, relationships with grandchildren or community, creative pursuits, travel, legacy, and enjoying life on their own terms. Physical activity suggestions should be realistic (walking, yoga, swimming, dance classes — not extreme sports). Don't patronize. Many people this age are vibrant and active. Frame this year's energy around what brings joy, meaning, and connection.`;
    case 'elder':
      return `This person is ${ageStr}. Focus on legacy, spiritual meaning, close relationships, comfort, health management, creativity, and peace. Suggestions should be gentle and dignified. Honor their life experience. Frame the year around reflection, connection, and savoring life.`;
    default:
      return `This person is ${ageStr}. Write for a general adult audience with practical, grounded advice.`;
  }
}

function buildContext(d: any, age: number | null): string {
  let ctx = `PERSON: ${d.name || 'Unknown'}`;
  if (age) ctx += `, turning ${age} this year`;
  ctx += `\nBorn: ${d.birthDate || ''}, ${d.birthLocation || ''}\n`;
  ctx += `Solar Return Year: ${d.solarReturnYear || ''}\n\n`;

  ctx += `--- CHART BASICS ---\n`;
  ctx += `Natal Sun: ${d.natalSun}\n`;
  ctx += `Natal Moon: ${d.natalMoon}\n`;
  ctx += `Natal Rising: ${d.natalRising}\n\n`;
  ctx += `SR Sun: ${d.srSun}\n`;
  ctx += `SR Moon: ${d.srMoon}\n`;
  ctx += `SR Rising: ${d.srRising}\n\n`;

  if (d.yearlyTheme) {
    ctx += `--- YEAR THEME ---\n`;
    ctx += `SR Ascendant: ${d.yearlyTheme.ascendantSign}\n`;
    ctx += `SR Asc Ruler: ${d.yearlyTheme.ascendantRuler} in ${d.yearlyTheme.ascendantRulerSign} (house ${d.yearlyTheme.ascendantRulerHouse || '—'})\n\n`;
  }

  if (d.lordOfTheYear) {
    ctx += `Lord of the Year: ${d.lordOfTheYear.planet} in ${d.lordOfTheYear.srSign} (house ${d.lordOfTheYear.srHouse || '—'}), dignity: ${d.lordOfTheYear.dignity}${d.lordOfTheYear.isRetrograde ? ' (Rx)' : ''}\n`;
  }

  if (d.profectionYear) {
    ctx += `Profection: House ${d.profectionYear.houseNumber || d.profectionYear.house}, Time Lord: ${d.profectionYear.timeLord}\n`;
  }

  ctx += `\n--- PLACEMENTS ---\n`;
  ctx += `Sun: SR house ${d.sunHouse?.house || '—'}, overlays natal house ${d.sunNatalHouse?.house || '—'}\n`;
  ctx += `Moon: ${d.srMoon} in SR house ${d.moonHouse?.house || '—'}, phase: ${d.moonPhase?.phase || '—'}\n`;
  if (d.moonAngularity) ctx += `Moon angularity: ${d.moonAngularity}\n`;
  if (d.moonVOC) ctx += `Moon is void of course — emotional independence/isolation theme\n`;

  if (d.srMoonAspects?.length > 0) {
    ctx += `\n--- MOON ASPECTS ---\n`;
    d.srMoonAspects.slice(0, 8).forEach((a: any) => {
      ctx += `- Moon ${a.aspectType} ${a.targetPlanet} (${a.orb}°): ${a.interpretation || ''}\n`;
    });
  }

  if (d.angularPlanets?.length > 0) {
    ctx += `\nAngular planets: ${d.angularPlanets.join(', ')}\n`;
  }

  if (d.stelliums?.length > 0) {
    ctx += `Stelliums: ${d.stelliums.map((s: any) => `${s.planets.join(', ')} in ${s.location}`).join('; ')}\n`;
  }

  if (d.elementBalance) ctx += `\nElement balance: Fire=${d.elementBalance.fire}, Earth=${d.elementBalance.earth}, Air=${d.elementBalance.air}, Water=${d.elementBalance.water} — Dominant: ${d.elementBalance.dominant}\n`;

  if (d.saturnFocus) ctx += `\nSaturn: ${d.saturnFocus.sign} in house ${d.saturnFocus.house || '—'}${d.saturnFocus.isRetrograde ? ' (Rx)' : ''}\n`;
  if (d.nodesFocus) ctx += `North Node: ${d.nodesFocus.sign} in house ${d.nodesFocus.house || '—'}\n`;
  if (d.retrogrades?.count > 0) ctx += `Retrogrades: ${d.retrogrades.planets.join(', ')}\n`;

  if (d.identityShift) {
    ctx += `\n--- IDENTITY SHIFT ---\n`;
    ctx += `Headline: ${d.identityShift.headline || ''}\n`;
    ctx += `Narrative: ${d.identityShift.becomingNarrative || ''}\n`;
    if (d.identityShift.pillars?.length) {
      d.identityShift.pillars.forEach((p: any) => {
        ctx += `- ${p.label || p.name}: ${p.placement || ''} — ${p.keyword || ''}: ${p.description || ''}\n`;
      });
    }
    if (d.identityShift.tensionNote) ctx += `Tension: ${d.identityShift.tensionNote}\n`;
  }

  if (d.executiveSummary) {
    const es = d.executiveSummary;
    if (es.opportunities?.length) {
      ctx += `\n--- OPPORTUNITIES ---\n`;
      es.opportunities.forEach((o: any) => { ctx += `- ${o.title || o}: ${o.description || ''}\n`; });
    }
    if (es.challenges?.length) {
      ctx += `\n--- CHALLENGES ---\n`;
      es.challenges.forEach((c: any) => { ctx += `- ${c.title || c}: ${c.description || ''}\n`; });
    }
  }

  if (d.lifeDomainScores) {
    ctx += `\n--- LIFE DOMAIN SCORES (out of 10) ---\n`;
    Object.entries(d.lifeDomainScores).forEach(([k, v]: [string, any]) => {
      if (typeof v === 'object' && v?.score !== undefined) {
        ctx += `${k}: ${v.score}/10 — ${v.summary || ''}\n`;
        if (v.breakdown?.length) {
          v.breakdown.forEach((b: any) => { ctx += `  • ${b.source}: ${b.points > 0 ? '+' : ''}${b.points} (${b.reason})\n`; });
        }
      }
    });
  }

  if (d.contradictions?.length > 0) {
    ctx += `\n--- CONTRADICTIONS ---\n`;
    d.contradictions.forEach((c: any) => {
      ctx += `- ${c.title || ''}: ${c.narrative || c.description || ''}\n`;
      if (c.resolution) ctx += `  Resolution: ${c.resolution}\n`;
    });
  }

  if (d.actionGuidance?.length > 0) {
    ctx += `\n--- ACTION GUIDANCE ---\n`;
    d.actionGuidance.forEach((g: any) => {
      ctx += `${g.planetSymbol || ''} ${g.placement || ''}:\n`;
      ctx += `  Lean into: ${g.leanInto || ''}\n`;
      ctx += `  Avoid: ${g.avoid || ''}\n`;
      ctx += `  Best use: ${g.bestUse || ''}\n`;
      if (g.timing) ctx += `  Timing: ${g.timing}\n`;
    });
  }

  if (d.activationWindows) {
    const aw = d.activationWindows;
    if (aw.peakPeriods?.length) {
      ctx += `\n--- PEAK PERIODS ---\n`;
      aw.peakPeriods.forEach((p: any) => { ctx += `- ${p.label || p.month || ''}: ${p.description || p.reason || ''}\n`; });
    }
    if (aw.monthlyThemes?.length) {
      ctx += `\n--- MONTHLY THEMES ---\n`;
      aw.monthlyThemes.forEach((m: any) => {
        ctx += `- ${m.label || m.month}: ${m.theme || ''} (${m.transitHits?.length || 0} transits)\n`;
      });
    }
  }

  if (d.lunarWeatherMap?.months?.length > 0) {
    ctx += `\n--- LUNAR WEATHER ---\n`;
    d.lunarWeatherMap.months.slice(0, 12).forEach((m: any) => {
      ctx += `- ${m.label || m.month}: ${m.theme || m.emotionalTone || ''}\n`;
    });
  }

  if (d.quarterlyFocus?.length > 0) {
    ctx += `\n--- QUARTERLY FOCUS ---\n`;
    d.quarterlyFocus.forEach((q: any) => {
      ctx += `- Q${q.quarter}: ${q.theme || q.focus || ''}${q.description ? ' — ' + q.description : ''}\n`;
    });
  }

  if (d.srToNatalAspects?.length > 0) {
    ctx += `\n--- SR-TO-NATAL ASPECTS ---\n`;
    d.srToNatalAspects.slice(0, 12).forEach((a: any) => {
      ctx += `- SR ${a.srPlanet || a.planet1} ${a.aspect || a.type || ''} Natal ${a.natalPlanet || a.planet2} (${a.orb}°)${a.interpretation ? ': ' + a.interpretation : ''}\n`;
    });
  }

  if (d.dignityReport?.length > 0) {
    ctx += `\n--- DIGNITY REPORT ---\n`;
    d.dignityReport.slice(0, 8).forEach((dr: any) => {
      ctx += `- ${dr.planet}: ${dr.label || ''} (score ${dr.score})\n`;
    });
  }

  if (d.hemisphericEmphasis) {
    ctx += `\n--- HEMISPHERIC EMPHASIS ---\n`;
    const h = d.hemisphericEmphasis;
    if (h.dominant) ctx += `Dominant: ${h.dominant}\n`;
    if (h.description) ctx += `${h.description}\n`;
  }

  if (d.repeatedThemes?.length > 0) {
    ctx += `\n--- REPEATED THEMES ---\n`;
    d.repeatedThemes.forEach((t: any) => {
      ctx += `- ${typeof t === 'string' ? t : t.theme || t.description || JSON.stringify(t)}\n`;
    });
  }

  if (d.yearPriorities?.length > 0) {
    ctx += `\n--- YEAR PRIORITIES (ranked) ---\n`;
    d.yearPriorities.slice(0, 8).forEach((p: any, i: number) => {
      ctx += `${i + 1}. ${p.label || p.category}: score ${p.score || ''}, confidence ${p.confidence || ''}\n`;
      if (p.signals?.length) {
        p.signals.slice(0, 4).forEach((s: any) => {
          ctx += `   • ${typeof s === 'string' ? s : s.source || s.label || JSON.stringify(s)}\n`;
        });
      }
    });
  }

  if (d.lunarPhaseTimeline?.length > 0) {
    const currentPhase = d.lunarPhaseTimeline.find((e: any) => e.isCurrent);
    if (currentPhase) {
      ctx += `\n--- 29-YEAR EMOTIONAL CYCLE ---\n`;
      ctx += `Phase: ${currentPhase.phase} (${currentPhase.cycleStage})\n`;
      ctx += `Meaning: ${currentPhase.shortMeaning || ''}\n`;
    }
  }

  if (d.houseOverlays?.length > 0) {
    ctx += `\n--- HOUSE OVERLAYS (SR planets in natal houses) ---\n`;
    const houseCounts: Record<number, string[]> = {};
    d.houseOverlays.forEach((ov: any) => {
      const overlayH = ov.srInNatalHouse ?? ov.natalHouse;
      if (overlayH) {
        if (!houseCounts[overlayH]) houseCounts[overlayH] = [];
        houseCounts[overlayH].push(ov.planet);
      }
    });
    Object.entries(houseCounts).sort(([,a], [,b]) => b.length - a.length).forEach(([house, planets]) => {
      const hNum = parseInt(house);
      const meaning = d.lookups?.houseMeanings?.[hNum] || '';
      const examples = d.lookups?.houseExamples?.[hNum] || '';
      ctx += `House ${house} (${meaning}): ${planets.join(', ')}. Examples: ${examples}\n`;
    });
  }

  if (d.srAscRulerInNatal) {
    const r = d.srAscRulerInNatal;
    ctx += `\nSR Asc ruler ${r.rulerPlanet} lands in natal house ${r.rulerNatalHouse || '—'} (${r.rulerNatalSign || ''})\n`;
  }

  if (d.executiveSummary?.patterns?.length > 0) {
    ctx += `\n--- PATTERNS ---\n`;
    d.executiveSummary.patterns.forEach((p: any) => {
      ctx += `- ${p.pattern}: ${p.description} Connection: ${p.connection}\n`;
    });
  }

  if (d.eclipseSensitivity?.length > 0) {
    ctx += `\n--- ECLIPSE ACTIVATIONS ---\n`;
    d.eclipseSensitivity.forEach((e: any) => {
      ctx += `- ${e.description || e.type || JSON.stringify(e)}\n`;
    });
  }

  if (d.mutualReceptions?.length > 0) {
    ctx += `\n--- MUTUAL RECEPTIONS ---\n`;
    d.mutualReceptions.forEach((mr: any) => {
      ctx += `- ${mr.planet1 || ''} & ${mr.planet2 || ''}: ${mr.description || mr.interpretation || ''}\n`;
    });
  }

  return ctx;
}

function plainSystemPrompt(ageInstructions: string): string {
  return `You write personalized yearly readings for people. You are NOT an astrologer speaking to a client — you are a wise, practical life advisor who happens to have deep knowledge of cycles and timing.

${ageInstructions}

  ABSOLUTE RULES:
  1. NEVER use astrological jargon. No planet names, sign names, house numbers, aspects, degrees, dignities, or any technical terms. Translate EVERYTHING into plain life language.
     - Instead of "Sun in the 7th house" → "Your main focus this year is partnerships and close relationships"
     - Instead of "Saturn square Moon" → "You may feel emotionally tested around responsibilities"
     - Instead of "North Node in the 10th" → "You're being pulled toward career growth and public visibility"
     - Instead of "Pisces Rising" → "You'll come across as more intuitive and gentle this year"
  2. NEVER start with "Dear [Name]", "Dear soul", or any greeting. Jump straight into the content.
  3. NEVER use vague language like "lean into the energy", "doors will open", "embrace the flow", "align with your truth", "the universe is asking you to". Every sentence must answer: WHAT specifically should they DO or EXPECT?
  4. Every suggestion must be AGE-APPROPRIATE and PRACTICAL. Give specific examples they can actually act on.
     - Bad: "Express your creativity" → Good for age 64: "Take that watercolor class you've been thinking about, join a writing group, or finally organize your photos into the book you've been meaning to make"
     - Bad: "Focus on partnerships" → Good for age 64: "Deepen conversations with your spouse or closest friend — schedule a weekly dinner date, take a trip together, or start a shared hobby"
  5. Each section must be exactly 3 sentences, maximum 80 words. Be specific to this chart — no generic statements. Every sentence must reference something unique to THIS person's data.
  6. Write in SHORT, PUNCHY paragraphs. Use line breaks generously.
  7. Be HONEST about difficult periods. Don't sugarcoat. But always include what they can do about it.
  8. Use the person's name naturally, but sparingly (2-3 times total).
  9. Do not use markdown formatting anywhere in the response. No ##, #, bullets, asterisks, or other markup symbols.
  10. Use plain-text section titles only, with each title on its own line and the paragraph text starting on the next line.

  Structure your response with exactly these four plain-text section titles, each on its own line: What This Year Is About, How You'll Feel Different, Your Biggest Opportunities, What Will Be Hard.

  Formatting requirements:
  - Output those four section titles once each, in that exact order.
  - Do not include any other section titles.
  - Do not use ## anywhere in the response.
  - Do not use markdown formatting anywhere in the response.
  - After each title, start the content on a new line, not on the same line as the title.
  - Each section should be 2-3 short paragraphs, maximum 4 sentences per paragraph.
  - Write with warmth and directness. Be specific to the chart data provided. No generic statements that could apply to anyone.

  Keep the total reading between 500-700 words. Every word must earn its place. Brevity is strength.`;
}

function astroSystemPrompt(ageInstructions: string): string {
  return `You are a master astrologer writing a comprehensive Solar Return synthesis. Your reader has astrological knowledge and wants the full technical picture — placements, aspects, dignities, timing, and chart-level pattern recognition. You are writing to impress a professional astrologer with the depth and specificity of your analysis.

${ageInstructions}

ABSOLUTE RULES:
1. USE full astrological terminology: planet names, sign names, house numbers, aspect names (conjunction, trine, square, opposition, sextile), orbs, dignities (domicile, exaltation, detriment, fall), retrogrades, angular/succedent/cadent, sect, mutual receptions.
2. Reference SPECIFIC placements. "SR Mars in Libra in the 1st house square natal Pluto at 3.4°" — not "an assertive energy comes through."
3. NEVER start with "Dear [Name]" or any greeting. Jump straight into the technical synthesis.
4. Every claim must be grounded in the chart data provided. Cite the exact placement or aspect that drives each point.
5. Integrate MULTIPLE data layers: cross-reference profection year + time lord + SR Asc ruler chain + dignity conditions + house overlays. Show the reader how these layers converge or conflict.
6. Address contradictions explicitly: if the data shows opposing pulls (e.g., stellium in 12th but angular Mars), name the tension and explain how it resolves or must be held.
7. Use the Life Domain Scores, Year Priorities, and Activation Windows data to prioritize what matters most — don't give equal weight to everything.
8. Mention the 29-year lunar phase cycle position and Metonic echoes if the data includes them.
9. Still be AGE-APPROPRIATE in practical suggestions even though the language is technical.

STRUCTURE (use these exact headers):

## Year Overview: The Chart Speaks
3-4 sentences synthesizing the SR Ascendant, its ruler's condition and natal house placement, the profection house and Time Lord, and the dominant element/modality. This should feel like opening a chart and immediately seeing the story.

## The Ruler Chain & Profection
Deep dive into the SR Asc ruler: what planet, what sign/house in the SR, where it lands in the natal chart, its dignity condition. How does this connect to the profection year's Time Lord? Do they support or conflict with each other? What does the ruler chain tell us about WHERE the year plays out?

## Identity & Becoming (SR Sun, Moon, Asc)
The SR Sun's house placement and natal overlay. The SR Moon's sign, phase, house, aspects (especially conjunctions and squares). Moon angularity and void-of-course status. How these three pillars create the year's emotional and identity landscape.

## The Aspect Web
The most potent SR-to-natal aspects. Organize by type: hard aspects (squares, oppositions) vs. flowing (trines, sextiles) vs. fusion (conjunctions). For each major aspect: the exact orb, what it activates, and when it peaks (if activation window data is available).

## Dignity Conditions & Planet Strength
Which SR planets are dignified, debilitated, or accidentally strong/weak? How does this affect which planets can "deliver" and which ones struggle? Any mutual receptions that create hidden support channels?

## Life Domain Analysis
Reference the scored life domains (career, relationships, health, etc.). Which areas score highest and why? Which are challenged? Connect each score back to specific placements and aspects.

## Timing Windows & Activation
The peak event windows from the activation data. Month-by-month transit rhythm. When do the SR angles get hit? When does the Time Lord get activated? Eclipse sensitivity points.

## Contradictions & Resolutions
Name the chart's internal contradictions. How do opposing pulls resolve? What does the reader need to hold in tension vs. what will resolve naturally?

## Practical Synthesis
Despite being technical, end with 4-6 concrete, age-appropriate actions grounded in the chart. Each should reference the specific placement that motivates it.

Aim for 1200-1800 words. Be technically dense but readable. Show mastery through specificity, not through jargon for jargon's sake.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullJson, mode = 'plain' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const d = fullJson;
    const age = calculateAge(d.birthDate, d.solarReturnYear || new Date().getFullYear());
    const group = ageGroup(age);
    const ageInstructions = ageContextInstructions(group, age);
    const ctx = buildContext(d, age);

    const systemPrompt = mode === 'astro'
      ? astroSystemPrompt(ageInstructions)
      : plainSystemPrompt(ageInstructions);

    const userPrompt = mode === 'astro'
      ? `Write a technically comprehensive Solar Return synthesis for ${d.name || 'this person'}${age ? ` (turning ${age})` : ''}. Use FULL astrological terminology and reference every relevant placement, aspect, and dignity condition from the data below. Cross-reference profection, ruler chain, house overlays, and activation windows.\n\n${ctx}`
      : `Write a personalized yearly reading for ${d.name || 'this person'}${age ? ` who is turning ${age}` : ''}. Use ALL the data below — every score, every theme, every timing window. Translate everything into plain language with zero astrological terms.\n\n${ctx}`;

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
        temperature: mode === 'astro' ? 0.3 : 0.4,
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
