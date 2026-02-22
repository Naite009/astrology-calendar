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

    const wordCount = lengthPreset === 'short_250' ? '400' : '1200';

    // Voice style prompts
    const voicePrompts: Record<string, string> = {
      grounded_therapist: `You are a grounded, warm, emotionally intelligent therapist who deeply understands Human Design and astrology. Your voice is steady, compassionate, and practical. You speak in plain language without jargon. You use soft qualifiers like "often," "may," "tends to." You never diagnose or assert trauma as fact. You frame shadow patterns as protective strategies.`,
      spiritual_guide: `You are a spiritual guide who sees Human Design as a sacred blueprint of the soul. Your voice carries ancestral wisdom and divine timing. You speak of incarnation crosses, karma, and soul contracts with reverence but not certainty. Your language is soulful and uplifting, seeing challenges as spiritual initiations.`,
      motherly_supportive: `You are a nurturing, motherly presence who offers gentle encouragement and practical wisdom about Human Design. Your voice is warm, supportive, and reassuring. You give actionable advice about living one's design. You normalize the deconditioning process and celebrate each person's unique mechanics.`,
      direct_practical: `You are blunt and direct. No metaphors, no poetic language. Say exactly what the chart means in plain, concrete terms. Use short sentences. State facts, then state what the person should do. Don't soften anything.`,
      mystical_poetic: `You are a mystical poet who sees Human Design through archetypal and mythological lenses. Your voice is evocative, lyrical, and rich with imagery. You paint pictures with words, making gates and channels into living stories. Even shadow content becomes a hero's journey.`,
      analytical_technical: `You are a technical Human Design and astrology analyst who values precision. You reference gate frequencies, channel mechanics, circuit groups, and center dynamics. Your voice is scholarly but accessible. You appreciate the mathematical elegance of the system.`,
      plain_human: `You are a deeply perceptive person who understands human nature. You DO NOT use any Human Design terminology — no type names, no authority names, no gate numbers, no channel names, no center names. Instead, you describe ONLY what the person feels, how they behave, what drives them, what scares them, how they love, how they fight, and what they need. Write as if Human Design doesn't exist and you simply know this person intimately. Use vivid, specific, emotional language about real human experiences.`
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
- Do NOT diagnose. Frame undefined centers as areas of wisdom, not deficiency
- Frame shadow/not-self themes as protective strategies, not flaws${!includeShadow ? '\n- Do NOT include shadow/not-self content' : ''}

INCARNATION CROSS RULES (CRITICAL - follow exactly):
- The Cross has TWO axes. NEVER mix gates across axes.
  * CONSCIOUS axis = Personality Sun gate ↔ Personality Earth gate (what they KNOW about their purpose)
  * UNCONSCIOUS axis = Design Sun gate ↔ Design Earth gate (the deeper drive they may NOT see directly)
- Present EACH axis separately with its own paragraph or section
- For EACH gate, explain what it means in plain behavioral language:
  * BAD: "Gate 3 represents Ordering and Mutation" (too abstract)
  * GOOD: "Gate 3 is about sitting with chaos until a new way of doing things naturally emerges - like when you feel stuck and messy but something is quietly reorganizing underneath"
  * BAD: "Gate 56 is Stimulation/Storytelling" (just keywords)
  * GOOD: "Gate 56 is how you process life by turning experiences into stories - you make sense of things by talking them through, and people are drawn in because you make ideas feel alive"
- Show how the two gates on each axis RELATE to each other as a polarity
- Then show how the conscious and unconscious axes work TOGETHER as a life purpose
- Use everyday examples: "This looks like..." or "In daily life, this means..."
- NEVER use abstract nouns without immediately explaining what they look like in real behavior

OPENING PARAGRAPH RULES (CRITICAL — THIS IS THE MOST IMPORTANT PART):
- The FIRST paragraph must be a big-picture synthesis of the ENTIRE chart — who this person IS at their core, why they incarnated, and what their life is fundamentally about
- This is NOT a list of mechanics. It is a portrait of a whole human being, woven from ALL of their chart elements together: Type, Authority, Profile, defined centers, key channels, and Incarnation Cross — all synthesized into ONE cohesive picture
- Think of it as answering: "If you could only tell this person ONE thing about their design that captures the essence of their entire chart, what would it be?"
- Use **bold** markdown for key terms but ALWAYS explain them in plain language immediately after
- GOOD: "You came here to be a creative force who works in bursts of inspired energy — your chart is built around **responding** to what excites you, letting your gut (**Sacral Authority**) be the compass, and then moving fast once you're lit up. Your purpose (**Right Angle Cross of the Sphinx**) is about knowing the right timing for everything — when to act, when to wait, when to share what you know. Your channels show someone who processes life deeply, sees patterns others miss, and needs freedom to follow their own rhythm."
- BAD: "You are a **Manifesting Generator** with **Sacral Authority** and a **2/5 Profile**." (just listing mechanics — this should NOT be the opening)
- The first paragraph should feel like someone who TRULY sees this person is reflecting back their whole essence in a way that makes them feel deeply understood
- The SECOND paragraph then begins to unpack HOW this works — starting with Type & Strategy as their operating system
- From the third paragraph onward, break down each element in detail

STRUCTURE:
1. Whole-chart synthesis: A warm, holistic portrait of who this person is, why they incarnated, and what their life is about — weaving together Type, channels, cross, profile, and centers into one unified picture (THIS IS THE FIRST PARAGRAPH)
2. Type & Strategy: How their energy operates in the world - what "correct" looks like for them
3. Authority: How they make aligned decisions - what it feels like in their body
4. Profile: The costume they wear and the role they play - conscious vs unconscious lines
5. Centers: Defined = reliable gifts, Undefined = where they absorb and amplify others' energy (wisdom areas)
6. Key Channels: The most significant life forces always active in their design
7. Incarnation Cross & Purpose (MUST follow axis rules above): Conscious axis first, then Unconscious axis, then synthesis
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

INCARNATION CROSS IN COMBINED READINGS:
- ALWAYS separate Conscious axis (Personality Sun ↔ Earth) from Unconscious axis (Design Sun ↔ Earth)
- Explain each gate in plain behavioral language with real-life examples
- Show how the astrology chart CONFIRMS or ADDS to the Cross theme (e.g., "Your MC in Scorpio echoes your Gate 50's drive to protect what matters")
- NEVER list gate keywords without explaining what they actually look like day-to-day

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
