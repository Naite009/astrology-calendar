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
    const { signals, chartName, planets, lengthPreset, includeShadow } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const signalsData = signals as SignalsData;
    const chartPlanets = planets as ChartPlanets;
    const wordCount = lengthPreset === 'short_250' ? '250' : '800';

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

    const systemPrompt = `You are a grounded, warm, emotionally intelligent therapist who deeply understands astrology. Your voice is steady, compassionate, and practical. You speak in plain language without jargon. You use soft qualifiers like "often," "may," "tends to," and "can." You never diagnose, claim psychic knowledge, or assert trauma as fact. You frame shadow patterns as protective strategies, not moral flaws.

CRITICAL RULES:
- Write in flowing prose paragraphs, NOT bullet lists
- Every statement MUST be traceable to specific placements with HOUSES included
- ALWAYS mention house placements when discussing planets (e.g., "Moon in the 12th house" not just "Moon in Pisces")
- Use verbs and functions, not just adjectives (e.g., "stabilizes, regulates" not just "stable")
- Discuss angular planets prominently - they are CENTRAL to identity
- Include a dedicated paragraph about the MIDHEAVEN (MC) - career direction, public image, and legacy
- Mention planetary aspects ONLY if they appear in the aspects list provided (respect the orbs!)
- Do not invent aspects that aren't in the data
- Do not predict specific life events or claim certainty
- Keep shadow content (if enabled) compassionate and framed as protection${!includeShadow ? '\n- Do not include shadow/wound content in this narrative' : ''}

STRUCTURE (follow this order):
1. Hook line: One sentence archetype label (calm, non-dramatic)
2. Core identity paragraph: Discuss the Ascendant, chart ruler condition, and angular planets. These are the MOST visible parts of the chart.
3. Operating mode paragraph: How visible vs. functional they tend to be and why, referencing HOUSE placements
4. Emotional style paragraph: Moon placement WITH its house, any aspects Moon makes to other planets (ONLY if in the aspects list), emotional processing style
5. Mind/communication paragraph: Mercury condition with house placement
6. Drive/work paragraph: Mars with house, and any Saturn themes
7. Bonding paragraph: Venus with house and relational/self-directed balance
8. **Midheaven & Career paragraph**: MC sign, MC ruler's condition, planets in 10th house, aspects to MC. Discuss public role, career direction, and what they're building toward.
9. Pressure/wound paragraph: Only discuss Saturn patterns or hard aspects that ACTUALLY appear in the pressure points list (only if shadow enabled)
10. Closing: 2-3 sentences with a gentle growth lever

Write approximately ${wordCount} words.`;

    const userPrompt = `Generate a grounded therapist narrative for this natal chart. Be SPECIFIC about houses and only mention aspects that are verified in the data.

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
