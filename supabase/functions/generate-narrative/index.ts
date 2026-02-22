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
    const { signals, chartName, planets, lengthPreset, includeShadow, voiceStyle = 'grounded_therapist' } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const signalsData = signals as SignalsData;
    const chartPlanets = planets as ChartPlanets;
    const wordCount = lengthPreset === 'short_250' ? '250' : '800';

    // Voice style prompts
    const voicePrompts: Record<string, string> = {
      grounded_therapist: `You are a grounded, warm, emotionally intelligent therapist who deeply understands astrology. Your voice is steady, compassionate, and practical. You speak in plain language without jargon. You use soft qualifiers like "often," "may," "tends to," and "can." You never diagnose, claim psychic knowledge, or assert trauma as fact. You frame shadow patterns as protective strategies, not moral flaws.`,
      
      spiritual_guide: `You are a spiritual guide who sees astrology as a sacred map of the soul's journey. Your voice carries ancestral wisdom and divine timing. You speak of karma, dharma, and soul contracts with reverence but not certainty. You reference cosmic cycles as invitations from the universe. Your language is soulful and uplifting, seeing challenges as spiritual initiations. You honor both light and shadow as teachers.`,
      
      motherly_supportive: `You are a nurturing, motherly presence who offers gentle encouragement and practical wisdom. Your voice is warm, supportive, and reassuring. You give actionable advice like a caring friend who happens to understand astrology deeply. You focus on what someone can DO with their chart energy. You normalize struggles and celebrate strengths with genuine warmth. You might say things like "This is a good day to organize" or "Consider taking time for yourself."`,
      
      direct_practical: `You are blunt and direct. No metaphors, no poetic language, no "stability over flash" type phrases. Say exactly what the chart means in plain, concrete terms. Use short sentences. State facts, then state what the person should do. Don't soften anything. Shadow content is stated plainly as behavioral patterns.`,
      
      mystical_poetic: `You are a mystical poet who sees astrology through archetypal and mythological lenses. Your voice is evocative, lyrical, and rich with imagery. You might reference Greek myths, tarot archetypes, or celestial poetry. You paint pictures with words, making the abstract tangible through metaphor. You see beauty in complexity and mystery in the mundane. Even shadow content becomes a hero's journey.`,
      
      analytical_technical: `You are a technical traditional astrologer who values precision and classical technique. You reference essential dignities, accidental dignities, sect, and house rulership systems. Your voice is scholarly but accessible. You explain WHY a planet is strong or weak using traditional criteria. You appreciate the mathematical elegance of astrology while making it understandable. You might reference Hellenistic or Medieval techniques.`,

      plain_human: `You are a deeply perceptive person who understands human nature. You DO NOT use any astrological terminology whatsoever — no planet names, no sign names, no house numbers, no aspects. Instead, you describe ONLY what the person feels, how they behave, what drives them, what scares them, how they love, how they fight, and what they need. Write as if astrology doesn't exist and you simply know this person intimately. Use vivid, specific, emotional language about real human experiences. Describe inner tensions, desires, fears, and patterns in purely psychological and behavioral terms.`
    };

    const selectedVoice = voicePrompts[voiceStyle] || voicePrompts.grounded_therapist;

    // Build detailed planet summary with houses
    const planetHouseSummary = signalsData.planetHouses
      ?.map(ph => `${ph.planet}: ${ph.degree}° ${ph.sign} in house ${ph.house}${ph.isAngular ? ' (angular)' : ''}${ph.isRetrograde ? ' Rx' : ''}`)
      .join('\n') || Object.entries(chartPlanets)
        .filter(([_, pos]) => pos)
        .map(([name, pos]) => `${name}: ${pos!.degree}° ${pos!.sign}${pos!.isRetrograde ? ' Rx' : ''}`)
        .join('\n');

    // Build aspects summary (only verified ones)
    const aspectsSummary = signalsData.natalAspects
      ?.slice(0, 15)
      .map(a => `${a.planet1} ${a.type} ${a.planet2} (${a.orb}° orb)${a.isOutOfSign ? ' [out of sign]' : ''}`)
      .join('\n') || 'No aspects calculated';

    // Build angular planets summary
    const angularSummary = signalsData.angularPlanets?.length > 0 
      ? `Angular planets: ${signalsData.angularPlanets.join(', ')}`
      : 'No angular planets (few planets in houses 1, 4, 7, 10)';

    // Build scores summary
    const scores = signalsData.operatingMode;
    const scoresSummary = `Visibility: ${scores.visibility}/100, Functionality: ${scores.functionality}/100, Expressive: ${scores.expressive}/100, Contained: ${scores.contained}/100, Relational: ${scores.relational}/100, Self-Directed: ${scores.selfDirected}/100`;

    // Build pressure points
    const pressurePoints = signalsData.pressurePointsRanked
      .map(p => `• ${p.description}: ${p.details}`)
      .join('\n');

    // Build absence notes
    const absences = signalsData.absenceSignals;
    let absenceNotes = '';
    if (absences.missingElements.length > 0) {
      absenceNotes += `Missing elements: ${absences.missingElements.join(', ')}. `;
    }
    if (absences.missingModalities.length > 0) {
      absenceNotes += `Missing modalities: ${absences.missingModalities.join(', ')}. `;
    }
    if (absences.fewAngularPlanets) {
      absenceNotes += `Few angular planets (${absences.angularPlanetCount}). `;
    }

    // Dominant patterns
    const dominantPatterns = `Dominant element: ${signalsData.dominantElement || 'balanced'}. Dominant modality: ${signalsData.dominantModality || 'balanced'}.`;

    // Build MC analysis summary
    const midheaven = signalsData.midheaven;
    let mcSummary = 'MC analysis not available.';
    if (midheaven) {
      mcSummary = `MC in ${midheaven.sign} at ${midheaven.degree}°. MC ruler ${midheaven.ruler} in ${midheaven.rulerSign} (house ${midheaven.rulerHouse})${midheaven.rulerIsAngular ? ' - ANGULAR' : ''}${midheaven.rulerIsRetrograde ? ' Rx' : ''}. `;
      if (midheaven.tenthHousePlanets?.length > 0) {
        mcSummary += `Planets in 10th house: ${midheaven.tenthHousePlanets.join(', ')}. `;
      }
      if (midheaven.mcAspects?.length > 0) {
        mcSummary += `Aspects to MC: ${midheaven.mcAspects.map(a => `${a.planet1} ${a.type} (${a.orb}°)`).join(', ')}. `;
      }
      mcSummary += `Career themes: ${midheaven.careerThemes?.join(', ') || 'standard for sign'}.`;
    }

    const systemPrompt = `${selectedVoice}

CRITICAL RULES - EVERY SENTENCE MUST BE SOURCED:
- EVERY sentence you write MUST reference a specific placement, aspect, house, or score from the chart data
- DO NOT write generic opening sentences like "You navigate the world as a quiet force" without citing WHY (e.g., "With your Moon in Scorpio in the 12th house...")
- Start every paragraph with a specific placement or aspect, then interpret
- Format: "[Placement/Aspect] → [Interpretation]" logic, even if prose flows naturally
- ALWAYS mention house placements when discussing planets (e.g., "Moon in the 12th house" not just "Moon in Pisces")
- Use verbs and functions, not just adjectives (e.g., "stabilizes, regulates" not just "stable")
- Discuss angular planets prominently - they are CENTRAL to identity
- Include a dedicated paragraph about the MIDHEAVEN (MC) - career direction, public image, and legacy
- Mention planetary aspects ONLY if they appear in the aspects list provided (respect the orbs!)
- Do not invent aspects that aren't in the data
- Do not predict specific life events or claim certainty
- Keep shadow content (if enabled) compassionate and framed as protection${!includeShadow ? '\n- Do not include shadow/wound content in this narrative' : ''}

STRUCTURE (follow this order - every section MUST cite specific chart factors):
1. Hook line: MUST cite the most prominent placement (e.g., "With Sun conjunct Pluto in your 10th house, you...")
2. Core identity paragraph: Discuss the Ascendant sign + degree, chart ruler condition, and angular planets. These are the MOST visible parts.
3. Operating mode paragraph: Reference specific house placements that create the visibility/functionality balance
4. Emotional style paragraph: Moon placement WITH its house AND any aspects Moon makes (ONLY if in the aspects list)
5. Mind/communication paragraph: Mercury condition with house placement and any aspects
6. Drive/work paragraph: Mars with house, and any Saturn themes (cite the aspects)
7. Bonding paragraph: Venus with house and relational/self-directed balance
8. **Midheaven & Career paragraph**: MC sign, MC ruler's condition, planets in 10th house, aspects to MC
9. Pressure/wound paragraph: Only discuss patterns that ACTUALLY appear in the pressure points list (only if shadow enabled)
10. Closing: 2-3 sentences with a gentle growth lever, citing a specific placement as the "leverage point"

Write approximately ${wordCount} words. Remember: NO sentence without a chart citation.`;

    const userPrompt = `Generate a narrative for this natal chart. Be SPECIFIC about houses and only mention aspects that are verified in the data.

CHART: ${chartName}

PLANET PLACEMENTS WITH HOUSES:
${planetHouseSummary}

${angularSummary}

VERIFIED ASPECTS (only reference these):
${aspectsSummary}

${dominantPatterns}

MIDHEAVEN (MC) ANALYSIS:
${mcSummary}

OPERATING MODE SCORES (0-100): ${scoresSummary}

PRESSURE POINTS (ranked by significance):
${pressurePoints || 'None identified'}

ABSENCES: ${absenceNotes || 'None notable'}

Write the narrative now as flowing prose paragraphs. Remember: always include house numbers when discussing planets, only mention aspects that appear in the verified aspects list above, and include a dedicated paragraph about the Midheaven/career direction.`;

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
        temperature: 0.3, // Lower temperature for more consistent narratives
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
              details: `${planet} at ${houseInfo.degree}° ${houseInfo.sign} in house ${houseInfo.house}${houseInfo.isAngular ? ' (angular)' : ''}${houseInfo.isRetrograde ? ' Rx' : ''}`
            });
          } else {
            const pos = chartPlanets[planet];
            if (pos) {
              triggers.push({
                type: 'placement',
                object: planet,
                details: `${planet} in ${pos.sign} at ${pos.degree}°${pos.isRetrograde ? ' Rx' : ''}`
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
              object: `${matchingAspect.planet1}-${matchingAspect.planet2}`,
              details: `${matchingAspect.planet1} ${matchingAspect.type} ${matchingAspect.planet2} (${matchingAspect.orb}° orb)${matchingAspect.isOutOfSign ? ' [out of sign]' : ''}`
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
                object: `House ${houseNum}`,
                details: `Contains: ${planetsInHouse.map(p => p.planet).join(', ')}`
              });
            }
          }
        }
      }

      // Check for operating mode references
      if (lowerSentence.includes('visib')) {
        triggers.push({ type: 'score', object: 'visibility', details: `Visibility score: ${scores.visibility}/100` });
      }
      if (lowerSentence.includes('function') || lowerSentence.includes('practical')) {
        triggers.push({ type: 'score', object: 'functionality', details: `Functionality score: ${scores.functionality}/100` });
      }

      // Check for pressure point references
      for (const pp of signalsData.pressurePointsRanked) {
        if (pp.planet && lowerSentence.includes(pp.planet.toLowerCase().split('-')[0])) {
          triggers.push({ type: 'pressure_point', object: pp.description, details: pp.details });
          break; // Only one pressure point per sentence to avoid clutter
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
