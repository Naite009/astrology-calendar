 import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
 };
 
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
 
     // Build planet summary
     const planetSummary = Object.entries(chartPlanets)
       .filter(([_, pos]) => pos)
       .map(([name, pos]) => `${name}: ${pos!.degree}° ${pos!.sign}${pos!.isRetrograde ? ' Rx' : ''}`)
       .join(', ');
 
     // Build scores summary
     const scores = signalsData.operatingMode;
     const scoresSummary = `Visibility: ${scores.visibility}, Functionality: ${scores.functionality}, Expressive: ${scores.expressive}, Contained: ${scores.contained}, Relational: ${scores.relational}, Self-Directed: ${scores.selfDirected}`;
 
     // Build pressure points
     const pressurePoints = signalsData.pressurePointsRanked
       .map(p => `${p.description} (${p.details})`)
       .join('; ');
 
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
 
     const systemPrompt = `You are a grounded, warm, emotionally intelligent therapist who also deeply understands astrology. Your voice is steady, compassionate, and practical. You speak in plain language without jargon. You use soft qualifiers like "often," "may," "tends to," and "can." You never diagnose, claim psychic knowledge, or assert trauma as fact. You frame shadow patterns as protective strategies, not moral flaws.
 
 CRITICAL RULES:
 - Write in flowing prose paragraphs, NOT bullet lists
 - Every statement should be traceable to specific placements
 - Use verbs and functions, not just adjectives (e.g., "stabilizes, regulates" not just "stable")
 - Do not predict specific life events or claim certainty
 - Keep shadow content (if enabled) compassionate and framed as protection${!includeShadow ? '\n- Do not include shadow/wound content in this narrative' : ''}
 
 STRUCTURE (follow this order):
 1. Hook line: One sentence archetype label (calm, non-dramatic)
 2. Operating mode paragraph: How visible vs. functional they tend to be and why
 3. Emotional style paragraph: Moon placement and contained/expressive balance
 4. Mind/communication paragraph: Mercury condition
 5. Drive/work paragraph: Mars and work-related signatures
 6. Bonding paragraph: Venus and relational/self-directed balance
 7. Pressure/wound paragraph: Saturn patterns and pressure points (only if shadow enabled)
 8. Closing: 2-3 sentences with a gentle growth lever
 
 Write approximately ${wordCount} words.`;
 
     const userPrompt = `Generate a grounded therapist narrative for this natal chart:
 
 CHART: ${chartName}
 
 PLANETS: ${planetSummary}
 
 OPERATING MODE SCORES (0-100): ${scoresSummary}
 
 PRESSURE POINTS (ranked): ${pressurePoints || 'None identified'}
 
 ABSENCES: ${absenceNotes || 'None notable'}
 
 Write the narrative now as flowing prose paragraphs.`;
 
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
       
       // Check which planets are mentioned
       const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Ascendant'];
       for (const planet of planetNames) {
         if (sentence.toLowerCase().includes(planet.toLowerCase())) {
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
 
       // Check for operating mode references
       if (sentence.toLowerCase().includes('visib')) {
         triggers.push({ type: 'score', object: 'visibility', details: `Visibility score: ${scores.visibility}` });
       }
       if (sentence.toLowerCase().includes('function') || sentence.toLowerCase().includes('practical')) {
         triggers.push({ type: 'score', object: 'functionality', details: `Functionality score: ${scores.functionality}` });
       }
 
       // Check for pressure point references
       for (const pp of signalsData.pressurePointsRanked) {
         if (pp.planet && sentence.toLowerCase().includes(pp.planet.toLowerCase())) {
           triggers.push({ type: 'pressure_point', object: pp.description, details: pp.details });
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