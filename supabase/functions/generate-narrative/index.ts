import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PlanetHouseInfo {
  planet: string;
  sign: string;
  degree: number;
  house: number;
  isAngular: boolean;
  isRetrograde: boolean;
}

interface NatalAspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
  isOutOfSign: boolean;
}

interface MidheavenAnalysis {
  sign: string;
  degree: number;
  ruler: string;
  rulerSign: string;
  rulerHouse: number;
  rulerIsAngular: boolean;
  rulerIsRetrograde: boolean;
  tenthHousePlanets: string[];
  mcAspects: NatalAspect[];
  careerThemes: string[];
}

interface SignalsData {
  operatingMode: {
    visibility: number;
    functionality: number;
    expressive: number;
    contained: number;
    relational: number;
    selfDirected: number;
  };
  pressurePointsRanked: Array<{
    type: string;
    planet?: string;
    description: string;
    weight: number;
    details: string;
  }>;
  absenceSignals: {
    missingElements: string[];
    missingModalities: string[];
    fewAngularPlanets: boolean;
    angularPlanetCount: number;
  };
  planetHouses: PlanetHouseInfo[];
  natalAspects: NatalAspect[];
  angularPlanets: string[];
  dominantElement: string;
  dominantModality: string;
  midheaven: MidheavenAnalysis | null;
}

interface ChartPlanets {
  [key: string]: {
    sign: string;
    degree: number;
    minutes: number;
    isRetrograde?: boolean;
  } | undefined;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { signals, chartName, planets, lengthPreset, includeShadow, voiceStyle = 'grounded_therapist', referenceExcerpts = '' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const signalsData = signals as SignalsData;
    const chartPlanets = planets as ChartPlanets;
    const wordCount = lengthPreset === 'short_250' ? '250' : '800';

    // Voice style prompts
    const voicePrompts: Record<string, string> = {
      grounded_therapist: "You are a grounded, warm, emotionally intelligent therapist who deeply understands astrology. Your voice is steady, compassionate, and practical. You speak in plain language without jargon. You use soft qualifiers like 'often,' 'may,' 'tends to,' and 'can.' You never diagnose, claim psychic knowledge, or assert trauma as fact. You frame shadow patterns as protective strategies, not moral flaws.",
      
      spiritual_guide: "You are a spiritual guide who sees astrology as a sacred map of the soul's journey. Your voice carries ancestral wisdom and divine timing. You speak of karma, dharma, and soul contracts with reverence but not certainty. You reference cosmic cycles as invitations from the universe. Your language is soulful and uplifting, seeing challenges as spiritual initiations. You honor both light and shadow as teachers.",
      
      motherly_supportive: "You are a nurturing, motherly presence who offers gentle encouragement and practical wisdom. Your voice is warm, supportive, and reassuring. You give actionable advice like a caring friend who happens to understand astrology deeply. You focus on what someone can DO with their chart energy. You normalize struggles and celebrate strengths with genuine warmth.",
      
      direct_practical: "You are blunt and direct. No metaphors, no poetic language. Say exactly what the chart means in plain, concrete terms. Use short sentences. State facts, then state what the person should do. Shadow content is stated plainly as behavioral patterns.",
      
      mystical_poetic: "You are a mystical poet who sees astrology through archetypal and mythological lenses. Your voice is evocative, lyrical, and rich with imagery. You might reference Greek myths, tarot archetypes, or celestial poetry. You paint pictures with words, making the abstract tangible through metaphor. Even shadow content becomes a hero's journey.",
      
      analytical_technical: "You are a technical traditional astrologer who values precision and classical technique. You reference essential dignities, accidental dignities, sect, and house rulership systems. Your voice is scholarly but accessible. You explain WHY a planet is strong or weak using traditional criteria.",

      plain_human: "You are a deeply perceptive person who understands human nature at its core. You are writing for someone who has ZERO knowledge of astrology and has never heard of signs, planets, houses, aspects, retrogrades, or any cosmic terminology.\\\n\\\nABSOLUTE RULES FOR THIS VOICE:\\\n- NEVER use ANY astrological symbol\\\n- NEVER mention planet names (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto)\\\n- NEVER mention zodiac signs (Aries, Taurus, Gemini, etc.)\\\n- NEVER mention houses (1st house, 10th house, etc.)\\\n- NEVER mention aspects (conjunct, square, trine, opposition, sextile)\\\n- NEVER mention retrogrades, degrees, or any technical terms\\\n- NEVER reference astrology, birth charts, or cosmic anything\\\n\\\nInstead, write as someone who deeply KNOWS this person, like a wise best friend or therapist who has watched them live their life. Describe:\\\n- Why they were born, what they came here to learn, experience, and contribute\\\n- What makes them feel most alive and purposeful\\\n- Their deepest fears and the protective walls they build\\\n- How they love and what they need to feel safe in relationships\\\n- Their natural gifts and what comes effortlessly to them\\\n- Where they get stuck and the patterns they repeat\\\n- What their soul is hungry for, even if they cannot name it yet\\\n- How they process emotions and what triggers them\\\n- Their relationship with work, purpose, and leaving a mark on the world\\\n\\\nUse warm, vivid, down-to-earth language. Use metaphors from everyday life: kitchens, gardens, storms, roads, conversations. Write so that the reader thinks 'How do you KNOW me?' Make every sentence feel personally relatable. This should read like the most insightful journal entry someone never knew they needed."
    };

    const selectedVoice = voicePrompts[voiceStyle] || voicePrompts.grounded_therapist;

    // Build detailed planet summary with houses
    const planetHouseSummary = signalsData.planetHouses
      ?.map(ph => ph.planet + ": " + ph.degree + "deg " + ph.sign + " in house " + ph.house + (ph.isAngular ? ' (angular)' : '') + (ph.isRetrograde ? ' Rx' : ''))
      .join('\n') || Object.entries(chartPlanets)
        .filter(([_, pos]) => pos)
        .map(([name, pos]) => name + ": " + pos!.degree + "deg " + pos!.sign + (pos!.isRetrograde ? ' Rx' : ''))
        .join('\n');

    // Build aspects summary (only verified ones)
    const aspectsSummary = signalsData.natalAspects
      ?.slice(0, 15)
      .map(a => a.planet1 + " " + a.type + " " + a.planet2 + " (" + a.orb + "deg orb)" + (a.isOutOfSign ? ' [out of sign]' : ''))
      .join('\n') || 'No aspects calculated';

    // Build angular planets summary
    const angularSummary = signalsData.angularPlanets?.length > 0 
      ? "Angular planets: " + signalsData.angularPlanets.join(', ')
      : 'No angular planets (few planets in houses 1, 4, 7, 10)';

    // Build scores summary
    const scores = signalsData.operatingMode;
    const scoresSummary = "Visibility: " + scores.visibility + "/100, Functionality: " + scores.functionality + "/100, Expressive: " + scores.expressive + "/100, Contained: " + scores.contained + "/100, Relational: " + scores.relational + "/100, Self-Directed: " + scores.selfDirected + "/100";

    // Build pressure points
    const pressurePoints = signalsData.pressurePointsRanked
      .map(p => "- " + p.description + ": " + p.details)
      .join('\n');

    // Build absence notes
    const absences = signalsData.absenceSignals;
    let absenceNotes = '';
    if (absences.missingElements.length > 0) {
      absenceNotes += "Missing elements: " + absences.missingElements.join(', ') + ". ";
    }
    if (absences.missingModalities.length > 0) {
      absenceNotes += "Missing modalities: " + absences.missingModalities.join(', ') + ". ";
    }
    if (absences.fewAngularPlanets) {
      absenceNotes += "Few angular planets (" + absences.angularPlanetCount + "). ";
    }

    // Dominant patterns
    const dominantPatterns = "Dominant element: " + (signalsData.dominantElement || 'balanced') + ". Dominant modality: " + (signalsData.dominantModality || 'balanced') + ".";

    // Build MC analysis summary
    const midheaven = signalsData.midheaven;
    let mcSummary = 'MC analysis not available.';
    if (midheaven) {
      mcSummary = "MC in " + midheaven.sign + " at " + midheaven.degree + "deg. MC ruler " + midheaven.ruler + " in " + midheaven.rulerSign + " (house " + midheaven.rulerHouse + ")" + (midheaven.rulerIsAngular ? ' - ANGULAR' : '') + (midheaven.rulerIsRetrograde ? ' Rx' : '') + ". ";
      if (midheaven.tenthHousePlanets?.length > 0) {
        mcSummary += "Planets in 10th house: " + midheaven.tenthHousePlanets.join(', ') + ". ";
      }
      if (midheaven.mcAspects?.length > 0) {
        mcSummary += "Aspects to MC: " + midheaven.mcAspects.map(a => a.planet1 + " " + a.type + " (" + a.orb + "deg)").join(', ') + ". ";
      }
      mcSummary += "Career themes: " + (midheaven.careerThemes?.join(', ') || 'standard for sign') + ".";
    }

    // Build Saturn context for Greene framework
    const saturnPlacement = signalsData.planetHouses?.find(ph => ph.planet === 'Saturn');
    const saturnAspects = signalsData.natalAspects?.filter(a => a.planet1 === 'Saturn' || a.planet2 === 'Saturn') || [];
    let saturnGreeneContext = '';
    if (saturnPlacement) {
      saturnGreeneContext = "\nSATURN PSYCHOLOGICAL FRAMEWORK (Liz Greene 'Beast & Prince'):\n";
      saturnGreeneContext += "Saturn in " + saturnPlacement.sign + " (house " + saturnPlacement.house + ")" + (saturnPlacement.isRetrograde ? ' Rx' : '') + ".\n";
      saturnGreeneContext += "When discussing Saturn, use a DUAL framework: the 'Beast' (unconscious/shadow — how Saturn's lessons manifest when resisted) and the 'Prince' (conscious/gold — what emerges when Saturn's work is done). Saturn is not malefic — it is the psychic process where pain becomes consciousness. Frame Saturn's house as WHERE the lesson plays out, and Saturn's sign as HOW the lesson is experienced.\n";
      saturnGreeneContext += "CRITICAL: The FIRST time you mention the Beast/Prince framework, you MUST briefly explain what it means in plain language — e.g. 'Every Saturn placement has two sides: the \"Beast\" — the default pain or fear pattern you run on autopilot — and the \"Prince\" — what that same energy becomes when you face it consciously and do the inner work.' Do NOT just drop the terms 'Beast' and 'Prince' and assume the reader knows what they mean. After the initial explanation, you can use the terms freely.\n";
      if (saturnAspects.length > 0) {
        saturnGreeneContext += "Saturn aspects: " + saturnAspects.map(a => {
          const other = a.planet1 === 'Saturn' ? a.planet2 : a.planet1;
          return "Saturn " + a.type + " " + other + " (" + a.orb + "° orb)";
        }).join(', ') + ". For each Saturn aspect, briefly note both the shadow pattern and the earned wisdom.\n";
      }
    }

    const isPlainHuman = voiceStyle === 'plain_human';

    let structureBlock = '';
    let userPrompt = '';

    if (isPlainHuman) {
      structureBlock = "\nSTRUCTURE (follow this order):\n1. Opening: Who this person IS at their core - their essence, their energy when they walk into a room\n2. Purpose: Why they were born. What they came here to learn and give. What their soul is reaching toward.\n3. Emotional world: How they feel, how they process, what overwhelms them, what soothes them\n4. How they think: Their mental style, how they make decisions, what keeps them up at night\n5. Drive and ambition: What motivates them, how they work, what kind of legacy they want\n6. Love and connection: How they bond, what they need in relationships, their attachment patterns\n7. Gifts and shadows: Their natural strengths AND the patterns that trip them up — for the life lesson/growth area, use a dual lens: what the protective pattern looks like (the 'beast') and what emerges when the work is done (the 'prince')\n8. Closing: A warm, empowering message about their path forward\n\nWrite approximately " + wordCount + " words. Remember: ZERO astrological terminology. Write as pure human insight.";

      userPrompt = "Write a deeply personal narrative for " + chartName + ". Use the chart data below ONLY as your source of insight, but NEVER mention any of it directly. Translate everything into pure human experience.\n\nINTERNAL REFERENCE DATA (DO NOT MENTION ANY OF THIS, use it only to understand the person):\n" + planetHouseSummary + "\n" + angularSummary + "\n" + aspectsSummary + "\n" + dominantPatterns + "\n" + mcSummary + "\nScores: " + scoresSummary + "\nPressure points: " + (pressurePoints || "None") + "\nAbsences: " + (absenceNotes || "None") + saturnGreeneContext + "\n\nNow write the narrative as if you are a wise friend who simply KNOWS this person. Describe who they are, why they are here, what drives them, what scares them, how they love, and where they are headed. All in plain, warm, relatable language. No astrology. No jargon. Just truth.";
    } else {
      const shadowLine = !includeShadow ? '\n- Do not include shadow/wound content in this narrative' : '';
      structureBlock = "\nCRITICAL RULES - EVERY SENTENCE MUST BE SOURCED:\n- EVERY sentence you write MUST reference a specific placement, aspect, house, or score from the chart data\n- DO NOT write generic opening sentences without citing WHY\n- Start every paragraph with a specific placement or aspect, then interpret\n- ALWAYS mention house placements when discussing planets\n- Use verbs and functions, not just adjectives\n- Discuss angular planets prominently - they are CENTRAL to identity\n- Include a dedicated paragraph about the MIDHEAVEN (MC)\n- Mention planetary aspects ONLY if they appear in the aspects list provided\n- Do not invent aspects that are not in the data\n- Do not predict specific life events or claim certainty\n- Keep shadow content (if enabled) compassionate and framed as protection\n- SATURN FRAMEWORK: When discussing Saturn, use Liz Greene's 'Beast & Prince' duality — describe both the unconscious shadow pattern (the 'Beast') and the conscious gold that emerges through inner work (the 'Prince'). Saturn is not punitive; it is the psychic process where pain becomes consciousness. IMPORTANT: The FIRST time you use the Beast/Prince terms, briefly define them for the reader — e.g. explain that the 'Beast' is the default fear/pain pattern and the 'Prince' is what emerges when that energy is faced consciously. Do not assume the reader already knows this framework." + shadowLine + "\n\nSTRUCTURE (follow this order - every section MUST cite specific chart factors):\n1. Hook line: MUST cite the most prominent placement\n2. Core identity paragraph: Ascendant sign + degree, chart ruler condition, angular planets\n3. Operating mode paragraph: House placements that create the visibility/functionality balance\n4. Emotional style paragraph: Moon placement WITH its house AND any aspects Moon makes\n5. Mind/communication paragraph: Mercury condition with house placement and aspects\n6. Drive/work paragraph: Mars with house, and any Saturn themes — use Beast/Prince duality here\n7. Bonding paragraph: Venus with house and relational/self-directed balance\n8. Midheaven and Career paragraph: MC sign, ruler condition, planets in 10th house, aspects to MC\n9. Pressure/wound paragraph: Only discuss patterns that ACTUALLY appear in the pressure points list\n10. Closing: 2-3 sentences with a gentle growth lever\n\nWrite approximately " + wordCount + " words. Remember: NO sentence without a chart citation.";

      userPrompt = "Generate a narrative for this natal chart. Be SPECIFIC about houses and only mention aspects that are verified in the data.\n\nCHART: " + chartName + "\n\nPLANET PLACEMENTS WITH HOUSES:\n" + planetHouseSummary + "\n\n" + angularSummary + "\n\nVERIFIED ASPECTS (only reference these):\n" + aspectsSummary + "\n\n" + dominantPatterns + "\n\nMIDHEAVEN (MC) ANALYSIS:\n" + mcSummary + "\n\nOPERATING MODE SCORES (0-100): " + scoresSummary + "\n\nPRESSURE POINTS (ranked by significance):\n" + (pressurePoints || "None identified") + "\n\nABSENCES: " + (absenceNotes || "None notable") + saturnGreeneContext + "\n\nWrite the narrative now as flowing prose paragraphs. Remember: always include house numbers when discussing planets, only mention aspects that appear in the verified aspects list above, and include a dedicated paragraph about the Midheaven/career direction.";
    }

    // Append reference material from user's uploaded books if available
    const refBlock = referenceExcerpts
      ? "\n\nREFERENCE LIBRARY (the user has uploaded astrological reference books — use these to enrich, deepen, and ground your interpretations with authoritative sourced insights. When you draw from this material, briefly cite the source):\n" + referenceExcerpts
      : '';

    const recognitionRule = "\n\nHYBRID CLARITY RULE: For each key insight, follow this sequence: (1) Start with a real-life situation or experience — what actually happens. (2) Then describe how it feels. (3) Then briefly explain why in simple terms. Do not lead with traits alone. Avoid abstract descriptions of personality or 'types of people.' Each sentence should combine what happens, how it feels, and what pattern it reflects. If a phrase sounds like astrology language, rewrite it into a concrete, real-life scenario. Do not stack multiple abstract descriptors in one sentence. The reader should think 'that's exactly what happens to me.'";

    const systemPrompt = selectedVoice + "\n" + structureBlock + recognitionRule + refBlock;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + LOVABLE_API_KEY,
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

    // Generate source map by matching sentences to triggers
    const sentences = narrativeText.split(/(?<=[.!?])\s+/).filter((s: string) => s.trim().length > 0);
    const sourceMap = sentences.map((sentence: string) => {
      const triggers: Array<{type: string; object: string; details: string}> = [];
      const lowerSentence = sentence.toLowerCase();
      
      // Check which planets are mentioned and include house info
      const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'Chiron', 'NorthNode'];
      for (const planet of planetNames) {
        if (lowerSentence.includes(planet.toLowerCase())) {
          const houseInfo = signalsData.planetHouses?.find(ph => ph.planet === planet);
          if (houseInfo) {
            triggers.push({
              type: 'placement',
              object: planet,
              details: planet + " at " + houseInfo.degree + "deg " + houseInfo.sign + " in house " + houseInfo.house + (houseInfo.isAngular ? ' (angular)' : '') + (houseInfo.isRetrograde ? ' Rx' : '')
            });
          } else {
            const pos = chartPlanets[planet];
            if (pos) {
              triggers.push({
                type: 'placement',
                object: planet,
                details: planet + " in " + pos.sign + " at " + pos.degree + "deg" + (pos.isRetrograde ? ' Rx' : '')
              });
            }
          }
        }
      }

      // Check for aspect mentions
      const aspectTypes = ['conjunct', 'square', 'trine', 'sextile', 'opposite', 'opposition'];
      for (const aspectType of aspectTypes) {
        if (lowerSentence.includes(aspectType)) {
          const matchingAspect = signalsData.natalAspects?.find(a => 
            lowerSentence.includes(a.planet1.toLowerCase()) && 
            lowerSentence.includes(a.planet2.toLowerCase())
          );
          if (matchingAspect) {
            triggers.push({
              type: 'aspect',
              object: matchingAspect.planet1 + "-" + matchingAspect.planet2,
              details: matchingAspect.planet1 + " " + matchingAspect.type + " " + matchingAspect.planet2 + " (" + matchingAspect.orb + "deg orb)" + (matchingAspect.isOutOfSign ? ' [out of sign]' : '')
            });
          }
        }
      }

      // Check for house mentions
      const housePattern = /\b(1st|2nd|3rd|4th|5th|6th|7th|8th|9th|10th|11th|12th)\s*house\b/gi;
      const houseMatches = sentence.match(housePattern);
      if (houseMatches) {
        for (const match of houseMatches) {
          const houseNum = match.match(/\d+/)?.[0];
          if (houseNum) {
            const planetsInHouse = signalsData.planetHouses?.filter(ph => ph.house === parseInt(houseNum));
            if (planetsInHouse && planetsInHouse.length > 0) {
              triggers.push({
                type: 'house',
                object: "House " + houseNum,
                details: "Contains: " + planetsInHouse.map(p => p.planet).join(', ')
              });
            }
          }
        }
      }

      // Check for operating mode references
      if (lowerSentence.includes('visib')) {
        triggers.push({ type: 'score', object: 'visibility', details: "Visibility score: " + scores.visibility + "/100" });
      }
      if (lowerSentence.includes('function') || lowerSentence.includes('practical')) {
        triggers.push({ type: 'score', object: 'functionality', details: "Functionality score: " + scores.functionality + "/100" });
      }

      // Check for pressure point references
      for (const pp of signalsData.pressurePointsRanked) {
        if (pp.planet && lowerSentence.includes(pp.planet.toLowerCase().split('-')[0])) {
          triggers.push({ type: 'pressure_point', object: pp.description, details: pp.details });
          break;
        }
      }

      return { sentence, triggers };
    });

    return new Response(JSON.stringify({ 
      narrativeText, 
      sourceMap 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-narrative error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
