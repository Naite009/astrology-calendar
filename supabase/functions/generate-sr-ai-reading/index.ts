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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fullJson } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const d = fullJson;
    const age = calculateAge(d.birthDate, d.solarReturnYear || new Date().getFullYear());
    const group = ageGroup(age);
    const ageInstructions = ageContextInstructions(group, age);

    // Build comprehensive context from ALL available data
    let ctx = `PERSON: ${d.name || 'Unknown'}`;
    if (age) ctx += `, turning ${age} this year`;
    ctx += `\nBorn: ${d.birthDate || ''}, ${d.birthLocation || ''}\n`;
    ctx += `Solar Return Year: ${d.solarReturnYear || ''}\n\n`;

    // === CORE CHART DATA (translated to plain language for the AI) ===
    ctx += `--- CHART BASICS ---\n`;
    ctx += `Their personality type (natal Sun): ${d.natalSun}\n`;
    ctx += `Their emotional nature (natal Moon): ${d.natalMoon}\n`;
    ctx += `How others see them (natal Rising): ${d.natalRising}\n\n`;

    ctx += `This year's energy direction (SR Sun): ${d.srSun}\n`;
    ctx += `This year's emotional tone (SR Moon): ${d.srMoon}\n`;
    ctx += `How they'll come across this year (SR Rising): ${d.srRising}\n\n`;

    // Year theme
    if (d.yearlyTheme) {
      ctx += `--- YEAR'S THEME ---\n`;
      ctx += `This year's persona: ${d.yearlyTheme.ascendantSign} Rising\n`;
      ctx += `The planet driving this year: ${d.yearlyTheme.ascendantRuler} in ${d.yearlyTheme.ascendantRulerSign} (life area ${d.yearlyTheme.ascendantRulerHouse || '—'})\n\n`;
    }

    // Lord of the Year
    if (d.lordOfTheYear) {
      ctx += `The planet "in charge" this year: ${d.lordOfTheYear.planet} in ${d.lordOfTheYear.srSign} (life area ${d.lordOfTheYear.srHouse || '—'}), condition: ${d.lordOfTheYear.dignity}${d.lordOfTheYear.isRetrograde ? ' (reviewing/rethinking mode)' : ''}\n`;
    }

    // Profection
    if (d.profectionYear) {
      ctx += `Annual focus area: House ${d.profectionYear.houseNumber || d.profectionYear.house} topics, guided by ${d.profectionYear.timeLord}\n`;
    }

    // Sun & Moon placement details
    ctx += `\n--- WHERE ENERGY LANDS ---\n`;
    ctx += `Sun (main focus): SR life area ${d.sunHouse?.house || '—'}\n`;
    ctx += `Sun overlays natal life area: ${d.sunNatalHouse?.house || '—'}\n`;
    ctx += `Moon (emotional needs): ${d.srMoon} in SR life area ${d.moonHouse?.house || '—'}\n`;
    ctx += `Moon phase: ${d.moonPhase?.phase || '—'}\n`;
    if (d.moonAngularity) ctx += `Moon is prominent/angular: ${d.moonAngularity}\n`;
    if (d.moonVOC) ctx += `Moon has NO major connections to other planets — emotional isolation or independence theme\n`;

    // Moon aspects
    if (d.srMoonAspects?.length > 0) {
      ctx += `\n--- EMOTIONAL CONNECTIONS ---\n`;
      d.srMoonAspects.slice(0, 8).forEach((a: any) => {
        ctx += `- Emotions connect ${a.aspectType === 'conjunction' ? 'intensely' : a.aspectType === 'trine' || a.aspectType === 'sextile' ? 'smoothly' : 'with friction'} to ${a.targetPlanet}: ${a.interpretation || ''}\n`;
      });
    }

    // Angular planets
    if (d.angularPlanets?.length > 0) {
      ctx += `\nMost visible/active energies this year: ${d.angularPlanets.join(', ')}\n`;
    }

    // Stelliums
    if (d.stelliums?.length > 0) {
      ctx += `Energy concentrations: ${d.stelliums.map((s: any) => `${s.planets.join(', ')} clustered in ${s.location}`).join('; ')}\n`;
    }

    // Elements
    if (d.elementBalance) ctx += `\nEnergy mix: Action/fire=${d.elementBalance.fire}, Practical/earth=${d.elementBalance.earth}, Mental/air=${d.elementBalance.air}, Emotional/water=${d.elementBalance.water} — Strongest: ${d.elementBalance.dominant}\n`;

    // Saturn & Nodes
    if (d.saturnFocus) ctx += `\n--- DISCIPLINE & RESPONSIBILITY ---\nSaturn (hard work required): ${d.saturnFocus.sign} in life area ${d.saturnFocus.house || '—'}${d.saturnFocus.isRetrograde ? ' (reviewing past commitments)' : ''}\n`;
    if (d.nodesFocus) ctx += `Growth direction (North Node): ${d.nodesFocus.sign} in life area ${d.nodesFocus.house || '—'}\n`;

    // Retrogrades
    if (d.retrogrades?.count > 0) ctx += `Planets in review/rethinking mode: ${d.retrogrades.planets.join(', ')}\n`;

    // === IDENTITY SHIFT (detailed) ===
    if (d.identityShift) {
      ctx += `\n--- WHO THEY ARE BECOMING ---\n`;
      ctx += `Headline: ${d.identityShift.headline || ''}\n`;
      ctx += `Narrative: ${d.identityShift.becomingNarrative || ''}\n`;
      if (d.identityShift.pillars?.length) {
        d.identityShift.pillars.forEach((p: any) => {
          ctx += `- ${p.label || p.name}: ${p.placement || ''} — ${p.keyword || ''}: ${p.description || ''}\n`;
        });
      }
      if (d.identityShift.tensionNote) ctx += `Internal tension: ${d.identityShift.tensionNote}\n`;
    }

    // === EXECUTIVE SUMMARY (detailed) ===
    if (d.executiveSummary) {
      const es = d.executiveSummary;
      ctx += `\n--- TOP OPPORTUNITIES ---\n`;
      if (es.opportunities?.length) {
        es.opportunities.forEach((o: any) => {
          ctx += `- ${o.title || o}: ${o.description || ''}\n`;
        });
      }
      ctx += `\n--- THINGS TO WATCH OUT FOR ---\n`;
      if (es.challenges?.length) {
        es.challenges.forEach((c: any) => {
          ctx += `- ${c.title || c}: ${c.description || ''}\n`;
        });
      }
    }

    // === LIFE DOMAIN SCORES (detailed with breakdowns) ===
    if (d.lifeDomainScores) {
      ctx += `\n--- LIFE AREA RATINGS (out of 10) ---\n`;
      Object.entries(d.lifeDomainScores).forEach(([k, v]: [string, any]) => {
        if (typeof v === 'object' && v?.score !== undefined) {
          ctx += `${k}: ${v.score}/10 — ${v.summary || ''}\n`;
          if (v.breakdown?.length) {
            v.breakdown.forEach((b: any) => {
              ctx += `  • ${b.source}: ${b.points > 0 ? '+' : ''}${b.points} (${b.reason})\n`;
            });
          }
        }
      });
    }

    // === CONTRADICTIONS ===
    if (d.contradictions?.length > 0) {
      ctx += `\n--- INTERNAL CONTRADICTIONS (opposing pulls) ---\n`;
      d.contradictions.forEach((c: any) => {
        ctx += `- ${c.title || ''}: ${c.narrative || c.description || ''}\n`;
        if (c.resolution) ctx += `  Resolution: ${c.resolution}\n`;
      });
    }

    // === ACTION GUIDANCE (detailed per planet) ===
    if (d.actionGuidance?.length > 0) {
      ctx += `\n--- ACTION GUIDANCE (per energy) ---\n`;
      d.actionGuidance.forEach((g: any) => {
        ctx += `${g.planetSymbol || ''} ${g.placement || ''}:\n`;
        ctx += `  Lean into: ${g.leanInto || ''}\n`;
        ctx += `  Avoid: ${g.avoid || ''}\n`;
        ctx += `  Best use: ${g.bestUse || ''}\n`;
        if (g.timing) ctx += `  Timing: ${g.timing}\n`;
      });
    }

    // === ACTIVATION WINDOWS ===
    if (d.activationWindows) {
      const aw = d.activationWindows;
      if (aw.peakPeriods?.length) {
        ctx += `\n--- PEAK PERIODS (when things heat up) ---\n`;
        aw.peakPeriods.forEach((p: any) => {
          ctx += `- ${p.label || p.month || ''}: ${p.description || p.reason || ''}\n`;
        });
      }
      if (aw.monthlyThemes?.length) {
        ctx += `\n--- MONTH-BY-MONTH THEMES ---\n`;
        aw.monthlyThemes.forEach((m: any) => {
          const hitCount = m.transitHits?.length || 0;
          ctx += `- ${m.label || m.month}: ${m.theme || ''} (${hitCount} transit activations)\n`;
        });
      }
    }

    // === LUNAR WEATHER MAP ===
    if (d.lunarWeatherMap?.months?.length > 0) {
      ctx += `\n--- EMOTIONAL WEATHER BY MONTH ---\n`;
      d.lunarWeatherMap.months.slice(0, 12).forEach((m: any) => {
        ctx += `- ${m.label || m.month}: ${m.theme || m.emotionalTone || ''}\n`;
      });
    }

    // === QUARTERLY FOCUS ===
    if (d.quarterlyFocus?.length > 0) {
      ctx += `\n--- QUARTERLY RHYTHM ---\n`;
      d.quarterlyFocus.forEach((q: any) => {
        ctx += `- Q${q.quarter}: ${q.theme || q.focus || ''}${q.description ? ' — ' + q.description : ''}\n`;
      });
    }

    // === TOP ASPECTS (translated) ===
    if (d.srToNatalAspects?.length > 0) {
      ctx += `\n--- KEY CONNECTIONS BETWEEN THIS YEAR AND BIRTH CHART ---\n`;
      d.srToNatalAspects.slice(0, 12).forEach((a: any) => {
        const aspectWord = (a.aspect || a.type || '').toLowerCase();
        let relationship = 'connects to';
        if (aspectWord.includes('trine') || aspectWord.includes('sextile')) relationship = 'flows supportively with';
        else if (aspectWord.includes('square')) relationship = 'creates tension with';
        else if (aspectWord.includes('opposition')) relationship = 'pulls against';
        else if (aspectWord.includes('conjunction')) relationship = 'merges intensely with';
        ctx += `- This year's ${a.srPlanet || a.planet1} ${relationship} their birth ${a.natalPlanet || a.planet2} (${a.orb}° orb)${a.interpretation ? ': ' + a.interpretation : ''}\n`;
      });
    }

    // === DIGNITY REPORT ===
    if (d.dignityReport?.length > 0) {
      ctx += `\n--- PLANET STRENGTH/CONDITION ---\n`;
      d.dignityReport.slice(0, 8).forEach((dr: any) => {
        ctx += `- ${dr.planet}: ${dr.label || ''} (strength score ${dr.score})\n`;
      });
    }

    // === HEMISPHERIC EMPHASIS ===
    if (d.hemisphericEmphasis) {
      ctx += `\n--- LIFE ORIENTATION ---\n`;
      const h = d.hemisphericEmphasis;
      if (h.dominant) ctx += `Dominant orientation: ${h.dominant}\n`;
      if (h.description) ctx += `${h.description}\n`;
    }

    // === REPEATED THEMES ===
    if (d.repeatedThemes?.length > 0) {
      ctx += `\n--- REPEATED THEMES (showing up multiple ways) ---\n`;
      d.repeatedThemes.forEach((t: any) => {
        ctx += `- ${typeof t === 'string' ? t : t.theme || t.description || JSON.stringify(t)}\n`;
      });
    }

    const systemPrompt = `You write personalized yearly readings for people. You are NOT an astrologer speaking to a client — you are a wise, practical life advisor who happens to have deep knowledge of cycles and timing.

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
5. Write in SHORT, PUNCHY paragraphs. No paragraph longer than 3 sentences. Use line breaks generously.
6. Be HONEST about difficult periods. Don't sugarcoat. But always include what they can do about it.
7. Use the person's name naturally, but sparingly (2-3 times total).

STRUCTURE (use these exact headers):

## What This Year Is About
2-3 sentences. The single biggest theme. No buildup — just say it.

## How You'll Feel Different
The emotional shift this year. What changes internally. Be specific about what they'll notice day-to-day.

## Your Biggest Opportunities
The top 2-3 specific opportunities. For each one: what it is, why this year, and one concrete action to take advantage of it.

## What Will Be Hard
The top 1-2 challenges. No euphemisms. Name the difficulty, explain why it's happening, and give a specific coping strategy.

## Your Year Quarter by Quarter
Break the year into 4 seasons. For each: 1-2 sentences on what to expect and one specific action item.

## The Timing That Matters
Name the 2-3 most important months/periods and what makes them significant. Be specific: "March-April is when career opportunities peak" not "spring brings new energy."

## What To Do With All This
3-5 bullet points of specific, actionable advice. Each one must be something they can literally do tomorrow. Age-appropriate. Practical. No metaphors.

Keep the total reading between 800-1200 words. Every word must earn its place.`;

    const userPrompt = `Write a personalized yearly reading for ${d.name || 'this person'}${age ? ` who is turning ${age}` : ''}. Use ALL the data below — every score, every theme, every timing window. Translate everything into plain language with zero astrological terms.\n\n${ctx}`;

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
        temperature: 0.4,
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
