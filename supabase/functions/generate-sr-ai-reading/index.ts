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
    const ctx = JSON.stringify({ reportVersion:d.reportVersion, name:d.name, year:d.solarReturnYear,
      rulers:{natalChartRuler:d.rulers?.natalChartRuler,solarReturnChartRuler:d.rulers?.solarReturnChartRuler,profectionLord:d.rulers?.profectionLord},
      moonPhase:d.moonPhase,
      provenance:d.calculationMetadata,
      prioritizedSynthesis:{themes:d.prioritizedSynthesis?.themes,longerTerm:d.prioritizedSynthesis?.longerTerm},
      verifiedFacts,
      timingStatus:'Only the supplied progression ingress dates are permitted. Other forecasts are withheld.' });
    const systemPrompt = `${SOLAR_RETURN_PROSE_STANDARD}
Age: ${age ?? 'unknown'}. Adapt examples to age without assuming marriage, children, occupation or life events. Keep minors' examples nonsexual and age appropriate.
Use ## headings. Each section has at most 3 sentences and 80 words. Explain the main annual priorities first, then supported modifiers and what you may notice. Do not require a central tension unless verified contacts actually establish it. Progressions are separate longer-term context, never return placements. No fabricated dates, VOC, dignity, retrograde status or new aspects. Keep chart source labels in separate Evidence lines. Put each chart layer's placement in its own sentence with its explicit source, never combine natal and return positions in one sentence. Do not attach a placement to a named ruler unless its layer is supplied. Longer-term dates belong in Evidence lines; the paragraph itself must explain what you could notice.
${mode === 'astro' ? 'Include supplied exact source labels and orbs after plain meaning.' : 'Use ordinary language for experience, with supplied facts only in separate Evidence lines.'}`;

    const userPrompt = mode === 'astro'
      ? `Write a concise Solar Return synthesis for ${d.name || 'this person'}${age ? ` (turning ${age})` : ''}. Use FULL astrological terminology and prioritize the strongest verified placements, tight aspects, and relevant dignity facts from the data below. Use only the supplied theme evidence and distinct ruler names.\n\n${ctx}`
      : `Write a personalized yearly reading for ${d.name || 'this person'}${age ? ` who is turning ${age}` : ''}. Use the prioritized evidence below. Choose only the strongest themes; do not recite every technique or score. Translate everything into plain language with zero astrological terms.\n\n${ctx}`;

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
        temperature: mode === 'astro' ? 0.3 : 0.4,
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
