import { validateVerifiedReading, verifiedFactsFromSolarReturnReport } from "../_shared/verifiedReadingFacts.ts";
import { validateSolarReturnReport, validateSolarReturnReading } from '../_shared/solarReturnReportValidation.ts';
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SOLAR_RETURN_PROSE_STANDARD, generateCheckedSolarReturnProse } from "../_shared/solarReturnProseQuality.ts";
import { withInterpretationStandard } from "../_shared/interpretationStandard.ts";

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

function calculateAge(birthDate: string, srYear: number): number | null {
  if (!birthDate) return null;
  const parts = birthDate.split('-');
  if (parts.length < 3) return null;
  const birthYear = parseInt(parts[0], 10);
  return srYear - birthYear;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
    const auth = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_ANON_KEY') || '');
    const { data: userData, error: authError } = token ? await auth.auth.getUser(token) : { data: { user: null }, error: new Error('Missing token') };
    if (authError || !userData.user) return new Response(JSON.stringify({ error: 'Sign in to generate a reading' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { fullJson, mode = 'plain' } = await req.json();
    if (!fullJson || typeof fullJson !== 'object' || !['plain', 'astro'].includes(mode)) return new Response(JSON.stringify({ error: 'Invalid report request' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const errors = validateSolarReturnReport(fullJson);
    if (errors.length) return new Response(JSON.stringify({ error: `Report blocked: ${errors.join('; ')}` }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const d = fullJson;
    const verifiedFacts = verifiedFactsFromSolarReturnReport(d);
    const age = calculateAge(d.birthDate, d.solarReturnYear || new Date().getFullYear());
    // Only validated evidence reaches the prose writer. Legacy tables and
    // unverified eclipse/quarter templates are not treated as calculated facts.
    // Fact-safe interpretation units: each meaning already passed the shared prose gate
    // deterministically. The model only connects and organizes them; it never restates
    // placements, so it cannot mix natal and Solar Return layers.
    const units = (d.prioritizedSynthesis?.themes || []).slice(0, 4)
      .filter((t: any) => typeof t?.meaning === 'string' && t.meaning.trim())
      .map((t: any, i: number) => ({ unit: i + 1, heading: String(t.title || `Priority ${i + 1}`), meaning: t.meaning, layer: t.layer || '' }));
    const longer = d.prioritizedSynthesis?.longerTerm?.meaning ? { meaning: d.prioritizedSynthesis.longerTerm.meaning, note: 'Longer-term progressed context, not a return placement.' } : null;
    if (!units.length) return new Response(JSON.stringify({ error: 'Reading withheld: no validated interpretation units' }), { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const ctx = JSON.stringify({ name: d.name, year: d.solarReturnYear, units, longerTerm: longer });
    const systemPrompt = `${SOLAR_RETURN_PROSE_STANDARD}
Age: ${age ?? 'unknown'}. Adapt examples to age without assuming marriage, children, occupation or life events. Keep minors' examples nonsexual and age appropriate.
TASK: You receive numbered interpretation units whose meaning has already been checked against the chart. Write exactly one "## " section per unit, in the given order, using the unit heading (you may shorten it to plain words), then ${longer ? 'one "## Longer-term context" section from longerTerm, then ' : ''}one "## How these fit together" section.
For each unit section: 2 or 3 sentences, at most 70 words, written to "you". Keep the unit's life area and its concrete example (the specific thing you might do, review, discuss, schedule or choose), and say why it may matter this year. You may reword for flow but must not add new events, people, outcomes, health, money amounts or predictions.
"How these fit together": 2 or 3 sentences naming one practical way two of the units connect in an ordinary week (for example the same plan, conversation or schedule decision). Do not invent a conflict or tension, and do not use bridge phrases.
NEVER write degrees, signs, house numbers, aspect names, orbs, dates, "natal", "Solar Return", "return chart", retrograde or dignity. ${mode === 'astro' ? 'You may name a planet only if it appears in the unit heading.' : 'Use no astrological terms at all.'}
Use "may", "might" or "could"; no certainty words (will, always, never, guaranteed, destined, inevitable). No em dashes.`;
    const userPrompt = `Write the yearly reading for ${d.name || 'this person'}${age ? ` (turning ${age})` : ''} from these units only.\n\n${ctx}`;

    const requestDraft = async (feedback: string[]) => {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-pro-preview",
        messages: [
          { role: "system", content: withInterpretationStandard(systemPrompt, { fullChart: false }) },
          { role: "user", content: userPrompt },
          ...(feedback.length ? [{ role: "user", content: `Regenerate from the SAME verified facts. Fix these failed checks, do not delete factual evidence or add new claims: ${feedback.join("; ")}` }] : []),
        ],
        temperature: 0.3,
        stream: true,
      }),
      signal: req.signal,
    });

    if (!response.ok) throw new Error(`AI service returned ${response.status}`);
    return response;
    };

    // Consume the upstream stream, but never display unvalidated prose to the client.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const text = await generateCheckedSolarReturnProse(async (feedback) => {
          const response = await requestDraft(feedback);
          const reader = response.body?.getReader();
          if (!reader) throw new Error('Missing model response');
          const decoder = new TextDecoder(); let buffer = '', text = '';
          while (true) {
            const { done, value } = await reader.read(); if (done) break;
            buffer += decoder.decode(value, { stream: true });
            let end: number;
            while ((end = buffer.indexOf('\n')) >= 0) {
              const line = buffer.slice(0, end).trim(); buffer = buffer.slice(end + 1);
              if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
              const data = JSON.parse(line.slice(6));
              if (data.error) throw new Error('Model response failed');
              text += data.choices?.[0]?.delta?.content || '';
            }
          }
          return text;
          }, text => validateVerifiedReading(text, verifiedFacts), validateSolarReturnReading);
          // Exact evidence already appears in the shared UI/JSON synthesis. Do not
          // concatenate cross-chart labels into prose sentences with ambiguous layer scope.
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`));
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Reading withheld' })}\n\n`));
        } finally { controller.close(); }
      }
    });
    return new Response(stream, { headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'X-SR-Model': 'google/gemini-3.1-pro-preview' } });
  } catch (error) {
    console.error("generate-sr-ai-reading error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
