import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { withInterpretationStandard } from '../_shared/interpretationStandard.ts';
import { cleanPersonReading, validatePersonReading, type PersonReading } from '../_shared/personReadingValidator.ts';
import { contextFromStoryMap } from '../_shared/personReadingContext.ts';

const DEFAULT_MODEL = 'google/gemini-3.1-pro-preview';
/** Side-by-side evaluation only; the app always uses DEFAULT_MODEL. */
const EVAL_MODELS = ['openai/gpt-5.2', 'openai/gpt-5', 'google/gemini-2.5-pro'];
let MODEL = DEFAULT_MODEL;

const Evidence = z.object({ id: z.string(), kind: z.string(), fact: z.string(), bodies: z.array(z.string()) }).passthrough();
const Body = z.object({
  /** Repair pass: a previous draft plus the checker's errors (keeps each call under the time limit). */
  repair: z.object({ draft: z.unknown(), errors: z.array(z.string()).max(40) }).optional(),
  evalModel: z.enum(EVAL_MODELS as [string, ...string[]]).optional(),
  name: z.string().min(1).max(120),
  age: z.number().int().min(0).max(120).nullable().optional(),
  map: z.object({
    version: z.number().optional(),
    evidence: z.record(Evidence),
    chains: z.array(z.object({ id: z.string(), anchor: z.string(), label: z.string(), steps: z.array(z.string()), bodies: z.array(z.string()), salience: z.number().optional() })).max(40),
    reinforcements: z.array(z.object({ id: z.string(), fact: z.string(), chainIds: z.array(z.string()), evidenceIds: z.array(z.string()) })).max(12).optional(),
    tensions: z.array(z.object({ id: z.string(), between: z.array(z.string()), fact: z.string(), evidenceIds: z.array(z.string()), salience: z.number().optional(), mustAddress: z.boolean().optional() })).max(12),
    placements: z.record(z.object({ sign: z.string(), longitude: z.number(), house: z.number().nullable() }).passthrough()).optional(),
    houseRulers: z.record(z.object({ traditional: z.string(), modern: z.string().optional() })).optional(),
    personalization: z.record(z.unknown()).optional(),
    houseOccupancy: z.record(z.array(z.string())).optional(),
    transits: z.array(z.object({ id: z.string(), headline: z.string(), fact: z.string(), nextExact: z.string().nullable(), isActiveNow: z.boolean(), chainIds: z.array(z.string()) }).passthrough()).max(12),
    allowedAspects: z.array(z.object({ a: z.string(), b: z.string(), type: z.string(), orb: z.number().optional() }).passthrough()).max(300),
  }),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

function systemPrompt(age: number | null | undefined): string {
  const teen = typeof age === 'number' && age < 18;
  const ageRule = teen
    ? `This person is ${age}, a minor. Speak about school, interests, friendships and future direction instead of career and partnership. Nothing sexual, no marriage or finances.`
    : 'Speak to an adult about work, relationships and money where the evidence supports it.';
  return `You are a master natal astrologer writing for a practitioner who is about to read for this client. Your job: show who this person is, in depth, so specifically that they recognize themselves.

HOW TO READ
- The evidence is the WHOLE chart: every major planet has its own chain (placement, sign ruler, the houses it rules, its dispositor chain, its tight aspects), plus the angles (Rising, Descendant, Midheaven, IC), all twelve house rulers, concentrations and balance. Chains carry a salience score; start from the most salient, but use any planet whose evidence matters. Do not ignore Mercury, Mars or Saturn just because they are not the Sun, Moon or Rising.
- Read every signature through this chain: PLACEMENT -> what the SIGN does -> the HOUSE arena -> the RULER / DISPOSITOR chain -> TIGHT ASPECTS -> what REINFORCES or CONTRADICTS it elsewhere -> concrete BEHAVIOR.
- 4 to 6 NAMED SIGNATURES. Name: plain and memorable, a stranger understands it instantly ("Fierce Independent", "The Peacekeeper Who Keeps Score"). No metaphors (banned: velvet, silk, glass, mirror, storm, shadow, garden, alchemist, labyrinth, cathedral, tapestry, ember, tide). Invent from this chart, never copy examples.
- Every signature must draw on at least TWO DIFFERENT chains (different planets), e.g. a Venus chain plus a Saturn aspect. One placement never earns a signature.
- plainMeaning: 1-2 everyday sentences stating the defining pattern or the apparent contradiction, e.g. "{Name} has the signature of someone who craves partnership and harmony, but when relying on someone feels uncertain, she would rather take over and do it herself." No astrology words here.
- howItWorks (THE ASTROLOGY): a walkthrough in the form "Because X ... then Y ... but Z ...", naming exact placements with degrees, houses, the ruler or dispositor chain and the aspect with its orb exactly as supplied.
- inLife, inRelationships, inWork, underStress, inDecisions (HOW IT SHOWS UP): concrete scenes of what the person does, says, chooses, avoids. "When a plan changes last minute, she quietly redoes it herself" beats "she is independent".
- tension (THE TENSION): which competing placement wants something different, and how that feels. tensionEvidenceIds cites that competing placement's evidence ids (from a different chain).
- healthyExpression (HEALTHY EXPRESSION): how both sides can work together, concretely.
- Never write fate, destiny, "here to", "meant to", "you always" or invented life history. A high support index is not permission to make a certain life-purpose claim.
- PERSONALIZATION HIERARCHY: Saturn by sign is cohort background; Uranus, Neptune and Pluto by sign are generational background. A sign alone NEVER earns an individualized signature. House personalizes the life area; traditional house rulership carries other areas; tight personal-planet/angle aspects, angularity, chart-ruler involvement and repeated independent chains give stronger support. A dispositor name alone is not enough.
- Whenever you explain Saturn/Uranus/Neptune/Pluto in a sign, explicitly call the sign layer background or cohort/generational tone, THEN explain why it matters to THIS chart using its supplied house, actual house rulership, angle or personal aspect with orb. Do not say "Pluto in Libra means relationships transform her" or "Saturn in Leo gives her a visibility lesson". Explain which real links earn the interpretation.
- conclusionEvidence: for EACH field (plainMeaning, howItWorks, inLife, inWork, inRelationships, underStress, inDecisions, tension, healthyExpression), list at least two concrete evidence IDs supporting THAT conclusion, all also declared in evidenceIds or tensionEvidenceIds. Cite BOTH sides of each contradiction. Unrelated citations cannot rescue a weak assertion. The checker computes strength; do not invent a score. Strong wording (defining, powerful, deeply, strongly, dominant) needs a strong support index. Otherwise use may/can/could/often/tends to.
- Reinforcements are verified places where separate chains point the same way; use them to explain why a pattern is strong (cite their evidenceIds, never the reinforce: id itself). Each signature cites at least 3 evidence ids from at least 2 chains.
- Start from the Big Three / strongest baseline, then show which verified placements sharpen or complicate it.
- Tensions marked mustAddress are the strongest contradictions in the chart. Each one MUST be cited (its aspect evidence id) in a signature's tensionEvidenceIds or a collision.
- Collisions: where one signature wants what another resists.
- Name what they likely do when they feel lost and what genuinely steadies them.
- Link each supplied current transit to the signature it presses on. Use only supplied transit ids and dates. Skip transits that do not connect.
- 3 to 5 client questions a practitioner could ask to check the reading.

ACCURACY
- Use ONLY the supplied evidence. Every signature cites evidenceIds (at least 2) and chainIds from the input.
- Name an aspect only if it appears in allowedAspects, with the same type and the supplied orb. Descendant and IC contacts are listed explicitly.
- A sign, degree, house or ruler you mention must match the supplied facts exactly. The checker compares every one. If an aspect is out of sign, say the degrees connect across different signs. Never call planets in different signs conjunct unless the aspect is listed.
- Houses are Placidus from the supplied facts. Sign is not house.
- Chart ruler is the traditional ruler; a modern co-ruler is a second layer.
- Tight orb means "may be especially noticeable", never certainty.

VOICE
- Plain, warm, specific English. Translate any astrology term in the same sentence.
- Say "may", "often", "tends to", "can". Never "you will", "you are meant to", "you are built for", "destined".
- No diagnoses, trauma, abuse, addiction or mental-health labels. No em dashes or en dashes.
- Constructive expression before the challenge.
- Write about the client in the third person by name (the practitioner reads this before the session). Client questions address the client as "you".
- Use "exactly" only for orbs under 1 degree.
- ${ageRule}

OUTPUT: only JSON, no markdown fences, exactly this shape:
{"headline": "2-3 sentences naming the central dynamic of this person",
 "centralTension": "2-4 sentences",
 "signatures": [{"name": "...", "plainMeaning": "1-2 everyday sentences", "chainIds": [], "evidenceIds": [], "conclusionEvidence": {"plainMeaning": [], "howItWorks": [], "inLife": [], "inWork": [], "inRelationships": [], "underStress": [], "inDecisions": [], "tension": [], "healthyExpression": []}, "howItWorks": "4-7 sentences: Because... then... but...", "inLife": "2 sentences", "inRelationships": "2 sentences", "inWork": "2 sentences", "underStress": "2 sentences", "inDecisions": "1-2 sentences", "tension": "2-3 sentences", "tensionEvidenceIds": [], "healthyExpression": "2 sentences"}],
 "collisions": [{"between": ["signature name", "signature name"], "description": "2-4 sentences", "evidenceIds": []}],
 "whenLost": "2-3 sentences", "whatSteadies": "2-3 sentences",
 "transitsNow": [{"transitId": "", "signatureName": "", "meaning": "2-3 sentences"}],
 "clientQuestions": ["..."]}`;
}

function extractJson(text: string): unknown {
  const s = text.replace(/^```(?:json)?/m, '').replace(/```\s*$/m, '');
  const start = s.indexOf('{');
  const end = s.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('No JSON object in model output');
  return JSON.parse(s.slice(start, end + 1));
}

async function callModel(apiKey: string, messages: { role: string; content: string }[], signal: AbortSignal): Promise<{ ok: true; text: string } | { ok: false; status: number; message: string }> {
  const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, messages, stream: true, response_format: { type: 'json_object' } }),
    signal,
  });
  if (!res.ok) {
    const t = await res.text();
    let message = 'The reading service rejected the request.';
    try { const e = JSON.parse(t); message = e.message || e.error?.message || message; } catch { /* keep default */ }
    if (res.status === 429) message = 'Too many readings at once. Please try again in a minute.';
    if (res.status === 402) message = 'AI credits are used up. Add credits in Settings, Plans & credits.';
    console.error('gateway error', res.status, t.slice(0, 500));
    return { ok: false, status: res.status, message };
  }
  if (!res.body) return { ok: false, status: 502, message: 'The reading service returned no content.' };
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = '', text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!line.startsWith('data:')) continue;
      const data = line.slice(5).trim();
      if (data === '[DONE]') continue;
      try { text += JSON.parse(data).choices?.[0]?.delta?.content ?? ''; } catch { /* partial */ }
    }
  }
  return { ok: true, text };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Invalid request', details: parsed.error.flatten().fieldErrors }, 400);
    const { name, age, map, repair, evalModel } = parsed.data;
    MODEL = evalModel ?? DEFAULT_MODEL;
    const started = Date.now();
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) return json({ error: 'Reading service is not configured.' }, 500);

    const ctx = contextFromStoryMap(map);
    const input = {
      client: { name, age: age ?? null },
      evidence: map.evidence,
      personalization: map.personalization,
      houseOccupancy: map.houseOccupancy,
      chains: map.chains.map((c) => ({ id: c.id, label: c.label, salience: c.salience ?? null, steps: c.steps.map((id) => ({ id, fact: map.evidence[id]?.fact })) })),
      houseRulers: Object.entries(map.houseRulers ?? {}).map(([h, r]) => ({ house: Number(h), id: `rulership:house-${h}`, ...r })),
      tensions: map.tensions,
      reinforcements: map.reinforcements ?? [],
      balance: ['balance:elements', 'balance:modalities'].map((id) => map.evidence[id]).filter(Boolean),
      transitsNow: map.transits.map((t) => ({ id: t.id, fact: t.fact, nextExact: t.nextExact, activeNow: t.isActiveNow, chainIds: t.chainIds })),
      allowedAspects: map.allowedAspects,
    };

    const messages = [
      { role: 'system', content: withInterpretationStandard(systemPrompt(age), { fullChart: true }) },
      { role: 'user', content: `Write the reading for ${name}. Evidence:\n${JSON.stringify(input)}` },
    ];

    if (repair) {
      messages.push(
        { role: 'assistant', content: JSON.stringify(repair.draft).slice(0, 30000) },
        { role: 'user', content: `Fix these problems and return the full corrected JSON only:\n- ${repair.errors.slice(0, 25).join('\n- ')}` },
      );
    }
    let lastErrors: string[] = [];
    let lastDraft: unknown = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      // Stay inside the function time limit: a slow first pass hands the repair to a second call.
      if (attempt > 1 && Date.now() - started > 55000) {
        return json({ needsRepair: true, draft: lastDraft, errors: lastErrors, model: MODEL });
      }
      const out = await callModel(apiKey, messages, req.signal);
      if (!out.ok) return json({ error: out.message }, out.status === 402 || out.status === 429 || out.status === 403 ? out.status : 502);
      let reading: PersonReading;
      try { reading = cleanPersonReading(extractJson(out.text) as PersonReading); } catch (e) {
        lastErrors = [`Output was not valid JSON: ${(e as Error).message}`];
        messages.push({ role: 'assistant', content: out.text.slice(0, 4000) }, { role: 'user', content: 'Return only the JSON object in the required shape.' });
        continue;
      }
      const errors = validatePersonReading(reading, ctx);
      if (!errors.length) return json({ reading, model: MODEL, attempts: attempt, repaired: !!repair });
      lastErrors = errors;
      lastDraft = reading;
      messages.push(
        { role: 'assistant', content: JSON.stringify(reading) },
        { role: 'user', content: `Fix these problems and return the full corrected JSON only:\n- ${errors.slice(0, 25).join('\n- ')}` },
      );
    }
    return json({ error: 'The written reading did not pass the accuracy check.', errors: lastErrors }, 422);
  } catch (e) {
    if ((e as Error).name === 'AbortError') return json({ error: 'Cancelled' }, 499);
    console.error(e);
    return json({ error: (e as Error).message || 'Unexpected error' }, 500);
  }
});
