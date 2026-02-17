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
    const { 
      readingType, // 'human_design' or 'combined'
      hdChart, 
      astroSignals, 
      astroPlanets, 
      chartName,
      lengthPreset, 
      includeShadow, 
      voiceStyle = 'grounded_therapist' 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const wordCount = lengthPreset === 'short_250' ? '250' : '800';

    // Voice style prompts
    const voicePrompts: Record<string, string> = {
      grounded_therapist: `You are a grounded, warm, emotionally intelligent therapist who deeply understands Human Design and astrology. Your voice is steady, compassionate, and practical. You speak in plain language without jargon. You use soft qualifiers like "often," "may," "tends to." You never diagnose or assert trauma as fact. You frame shadow patterns as protective strategies.`,
      spiritual_guide: `You are a spiritual guide who sees Human Design as a sacred blueprint of the soul. Your voice carries ancestral wisdom and divine timing. You speak of incarnation crosses, karma, and soul contracts with reverence but not certainty. Your language is soulful and uplifting, seeing challenges as spiritual initiations.`,
      motherly_supportive: `You are a nurturing, motherly presence who offers gentle encouragement and practical wisdom about Human Design. Your voice is warm, supportive, and reassuring. You give actionable advice about living one's design. You normalize the deconditioning process and celebrate each person's unique mechanics.`,
      direct_practical: `You are a no-nonsense Human Design analyst who values clarity and action. Your voice is direct, efficient, and practical. You tell people what their chart shows plainly and what they can do about it. You respect people's intelligence and don't over-explain.`,
      mystical_poetic: `You are a mystical poet who sees Human Design through archetypal and mythological lenses. Your voice is evocative, lyrical, and rich with imagery. You paint pictures with words, making gates and channels into living stories. Even shadow content becomes a hero's journey.`,
      analytical_technical: `You are a technical Human Design analyst who values precision. You reference gate frequencies, channel mechanics, circuit groups, and center dynamics. Your voice is scholarly but accessible. You appreciate the mathematical elegance of the system.`
    };

    const selectedVoice = voicePrompts[voiceStyle] || voicePrompts.grounded_therapist;

    // Build HD chart summary
    let hdSummary = '';
    if (hdChart) {
      hdSummary = `TYPE: ${hdChart.type}
STRATEGY: ${hdChart.strategy}
AUTHORITY: ${hdChart.authority}
PROFILE: ${hdChart.profile}
DEFINITION: ${hdChart.definitionType}

INCARNATION CROSS: ${hdChart.incarnationCross?.name || 'Unknown'} (${hdChart.incarnationCross?.type || ''})
Cross Gates: Conscious Sun ${hdChart.incarnationCross?.gates?.consciousSun}, Conscious Earth ${hdChart.incarnationCross?.gates?.consciousEarth}, Unconscious Sun ${hdChart.incarnationCross?.gates?.unconsciousSun}, Unconscious Earth ${hdChart.incarnationCross?.gates?.unconsciousEarth}
Quarter: ${hdChart.incarnationCross?.quarter || 'Unknown'}

DEFINED CENTERS: ${hdChart.definedCenters?.join(', ') || 'None'}
UNDEFINED CENTERS: ${hdChart.undefinedCenters?.join(', ') || 'None'}
DEFINED CHANNELS: ${hdChart.definedChannels?.join(', ') || 'None'}

PERSONALITY (CONSCIOUS) ACTIVATIONS:
${hdChart.personalityActivations?.map((a: any) => `  ${a.planet}: Gate ${a.gate}.${a.line}`).join('\n') || 'None'}

DESIGN (UNCONSCIOUS) ACTIVATIONS:
${hdChart.designActivations?.map((a: any) => `  ${a.planet}: Gate ${a.gate}.${a.line}`).join('\n') || 'None'}`;

      if (hdChart.variables) {
        hdSummary += `\n\nVARIABLES (PHS):
  Determination: ${hdChart.variables.determination?.arrow} arrow (Color ${hdChart.variables.determination?.color}, Tone ${hdChart.variables.determination?.tone})
  Environment: ${hdChart.variables.environment?.arrow} arrow (Color ${hdChart.variables.environment?.color}, Tone ${hdChart.variables.environment?.tone})
  Perspective: ${hdChart.variables.perspective?.arrow} arrow (Color ${hdChart.variables.perspective?.color}, Tone ${hdChart.variables.perspective?.tone})
  Motivation: ${hdChart.variables.motivation?.arrow} arrow (Color ${hdChart.variables.motivation?.color}, Tone ${hdChart.variables.motivation?.tone})`;
      }
    }

    // Build astrology summary for combined reading
    let astroSummary = '';
    if (readingType === 'combined' && astroSignals && astroPlanets) {
      const planetHouseSummary = astroSignals.planetHouses
        ?.map((ph: any) => `${ph.planet}: ${ph.degree}° ${ph.sign} in house ${ph.house}${ph.isAngular ? ' (angular)' : ''}${ph.isRetrograde ? ' Rx' : ''}`)
        .join('\n') || Object.entries(astroPlanets)
          .filter(([_, pos]) => pos)
          .map(([name, pos]: [string, any]) => `${name}: ${pos.degree}° ${pos.sign}${pos.isRetrograde ? ' Rx' : ''}`)
          .join('\n');

      const aspectsSummary = astroSignals.natalAspects
        ?.slice(0, 15)
        .map((a: any) => `${a.planet1} ${a.type} ${a.planet2} (${a.orb}° orb)`)
        .join('\n') || 'No aspects calculated';

      const mcSummary = astroSignals.midheaven 
        ? `MC in ${astroSignals.midheaven.sign} at ${astroSignals.midheaven.degree}°. MC ruler ${astroSignals.midheaven.ruler} in ${astroSignals.midheaven.rulerSign} (house ${astroSignals.midheaven.rulerHouse}).`
        : 'MC analysis not available.';

      astroSummary = `
NATAL PLANET PLACEMENTS:
${planetHouseSummary}

VERIFIED NATAL ASPECTS:
${aspectsSummary}

MIDHEAVEN: ${mcSummary}

Dominant element: ${astroSignals.dominantElement || 'balanced'}
Dominant modality: ${astroSignals.dominantModality || 'balanced'}`;
    }

    // Build the system prompt based on reading type
    let systemPrompt = '';
    let userPrompt = '';

    if (readingType === 'human_design') {
      systemPrompt = `${selectedVoice}

You are generating a deep, personalized Human Design narrative reading. 

CRITICAL RULES:
- EVERY sentence must reference specific chart mechanics (type, authority, centers, gates, channels, cross, profile)
- Start with their Type and Strategy as the foundational operating system
- Discuss Authority as their decision-making compass
- Profile lines describe HOW they engage with the world
- Defined centers = reliable energy; Undefined centers = wisdom through openness (NOT weakness)
- Channels are life forces that are always "on" - discuss the most significant ones
- Incarnation Cross is their life purpose - give it weight and depth
- Do NOT diagnose. Frame undefined centers as areas of wisdom, not deficiency
- Frame shadow/not-self themes as protective strategies, not flaws${!includeShadow ? '\n- Do NOT include shadow/not-self content' : ''}

STRUCTURE:
1. Opening hook: Reference their Type + a defining gate or channel
2. Type & Strategy: How their energy operates in the world - what "correct" looks like for them
3. Authority: How they make aligned decisions - what it feels like in their body
4. Profile: The costume they wear and the role they play - conscious vs unconscious lines
5. Centers: Defined = reliable gifts, Undefined = where they absorb and amplify others' energy (wisdom areas)
6. Key Channels: The most significant life forces always active in their design
7. Incarnation Cross & Purpose: Their life theme, karma, and contribution
8. Deconditioning guidance: Practical steps for living their design${includeShadow ? '\n9. Shadow/Not-Self patterns: Where conditioning pulls them off-track (frame compassionately)' : ''}
10. Integration: How all the pieces create a coherent picture of who they are

Write approximately ${wordCount} words.`;

      userPrompt = `Generate a Human Design narrative reading for ${chartName}.

HUMAN DESIGN CHART DATA:
${hdSummary}

Write the reading now as flowing prose, grounded in every specific mechanic from their chart.`;

    } else if (readingType === 'combined') {
      systemPrompt = `${selectedVoice}

You are generating the ultimate unified reading that weaves together Western Astrology AND Human Design into one coherent portrait. This is the most complete picture possible of a person's design, purpose, shadows, and potential.

CRITICAL RULES:
- Reference BOTH systems throughout - don't just do astrology then HD separately
- WEAVE them together: e.g., "Your Scorpio Moon in the 8th house echoes your undefined Solar Plexus - both point to emotional depth that needs space to process"
- Show where the systems CONFIRM each other (convergence = strong theme)
- Show where they ADD nuance (one system fills gaps the other doesn't cover)
- EVERY sentence must cite specific data from one or both charts
- Do NOT invent aspects or placements not in the data
- Frame shadow content compassionately as protective strategies${!includeShadow ? '\n- Do NOT include shadow/wound content' : ''}

STRUCTURE:
1. Opening synthesis: The single most striking convergence between their astrology and HD (e.g., "A Projector with a Scorpio stellium - your entire design says: wait, watch, then transform")
2. Core identity: Astro Ascendant + HD Type = how they show up. Sun sign + Incarnation Cross = their purpose thread
3. Emotional architecture: Moon sign/house + HD Authority + defined/undefined Solar Plexus = how they feel and decide
4. Mind & communication: Mercury + HD Ajna/Throat centers + defined channels = how they think and express
5. Drive & work: Mars + HD Sacral/Root centers + type strategy = how they use energy
6. Relationships & bonding: Venus + HD profile lines + relational channels = how they connect
7. Life purpose synthesis: MC + Incarnation Cross + North Node = their dharmic path
8. Karma & shadows: Saturn/Pluto/Chiron aspects + Not-Self themes + undefined centers = growth edges${!includeShadow ? ' (skip shadow content)' : ''}
9. Unique gifts: Angular planets + defined channels + strongest placements = their superpowers
10. Living the design: Practical integration of both systems - what does "correct" daily life look like?

Write approximately ${wordCount === '250' ? '400' : '1200'} words. This is the most comprehensive reading - give it appropriate depth.`;

      userPrompt = `Generate a unified Astrology + Human Design narrative for ${chartName}. Weave both systems together into one coherent portrait.

--- WESTERN ASTROLOGY CHART ---
${astroSummary}

--- HUMAN DESIGN CHART ---
${hdSummary}

Write the combined reading now, weaving both systems together in every paragraph.`;
    }

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const narrativeText = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ narrativeText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-hd-narrative error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
