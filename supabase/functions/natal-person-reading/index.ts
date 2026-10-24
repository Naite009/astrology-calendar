import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';
import { withInterpretationStandard } from '../_shared/interpretationStandard.ts';
import { cleanPersonReading, validatePersonReading, type PersonReading } from '../_shared/personReadingValidator.ts';

const MODEL = 'google/gemini-3.1-pro-preview';

const Evidence = z.object({ id: z.string(), kind: z.string(), fact: z.string(), bodies: z.array(z.string()) }).passthrough();
const Body = z.object({
  name: z.string().min(1).max(120),
  age: z.number().int().min(0).max(120).nullable().optional(),
  map: z.object({
    evidence: z.record(Evidence),
    chains: z.array(z.object({ id: z.string(), anchor: z.string(), label: z.string(), steps: z.array(z.string()), bodies: z.array(z.string()) })).max(20),
    tensions: z.array(z.object({ id: z.string(), between: z.array(z.string()), fact: z.string(), evidenceIds: z.array(z.string()) })).max(12),
    transits: z.array(z.object({ id: z.string(), headline: z.string(), fact: z.string(), nextExact: z.string().nullable(), isActiveNow: z.boolean(), chainIds: z.array(z.string()) }).passthrough()).max(12),
    allowedAspects: z.array(z.object({ a: z.string(), b: z.string(), type: z.string() }).passthrough()).max(200),
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
- Follow CHAINS, not lists. Each chain starts at an anchor (Rising, Midheaven, Sun, Moon, or a concentration) and runs through its ruler to that ruler's sign, house, condition and aspects. Explain each step as the cause of the next: "Because X, Y; and because Y sits in Z, ..."
- Combine several chains into 4 to 6 NAMED SIGNATURES. A signature name is a plain, literal title in the form "The ___" that a stranger understands instantly without explanation, naming a recognizable kind of person or behavior (good: "The Perpetual Student", "The Peacekeeper Who Keeps Score", "The Planner Who Hates Being Rushed"). NO metaphors or poetic images (banned: velvet, silk, glass, mirror, fire, storm, shadow, garden, alchemist, labyrinth, cathedral). Never copy example names; invent from this chart. The name must be earned by at least two pieces of evidence that reinforce each other.
- Each signature's "plainMeaning" is ONE short sentence saying what the name means in everyday words, and the first sentence of "howItWorks" must list the exact placements with degrees (for example "Sun 28° Libra in the 10th, ruled by Venus at 3° Scorpio in the 11th...").
- Every signature ends in BEHAVIOR: what the person actually does, says, chooses, avoids, repeats. Concrete scenes beat adjectives. "When a job turns routine, they start browsing courses" beats "they are restless".
- Show COLLISIONS: where one signature wants what another resists. Use the supplied tensions.
- Name what they likely do when they feel lost and what genuinely steadies them.
- Link each supplied current transit to the signature it presses on, saying what may be stirred now. Use only supplied transit ids and dates. Skip transits that do not connect.
- 3 to 5 client questions a practitioner could ask to check the reading.

ACCURACY
- Use ONLY the supplied evidence. Every signature cites evidenceIds (at least 2) and chainIds from the input.
- Name an aspect only if it appears in allowedAspects, with the same type. If an aspect is out of sign, say the degrees connect across different signs. Never call planets in different signs conjunct unless the aspect is listed.
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
 "signatures": [{"name": "The ...", "chainIds": [], "evidenceIds": [], "howItWorks": "4-6 sentences following the chain", "inWork": "2-3 sentences", "inRelationships": "2-3 sentences", "underStress": "2-3 sentences", "strength": "1-2 sentences", "stuckPoint": "1-2 sentences"}],
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
  const reader = res.body!.getReader();
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
    const { name, age, map } = parsed.data;
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) return json({ error: 'Reading service is not configured.' }, 500);

    const ctx = {
      evidenceIds: Object.keys(map.evidence),
      chainIds: map.chains.map((c) => c.id),
      transitIds: map.transits.map((t) => t.id),
      allowedAspects: map.allowedAspects,
    };
    const input = {
      client: { name, age: age ?? null },
      chains: map.chains.map((c) => ({ id: c.id, label: c.label, steps: c.steps.map((id) => ({ id, fact: map.evidence[id]?.fact })) })),
      tensions: map.tensions,
      balance: ['balance:elements', 'balance:modalities'].map((id) => map.evidence[id]).filter(Boolean),
      transitsNow: map.transits.map((t) => ({ id: t.id, fact: t.fact, nextExact: t.nextExact, activeNow: t.isActiveNow, chainIds: t.chainIds })),
      allowedAspects: map.allowedAspects.map((a) => `${a.a} ${a.type} ${a.b}`),
    };

    const messages = [
      { role: 'system', content: withInterpretationStandard(systemPrompt(age), { fullChart: true }) },
      { role: 'user', content: `Write the reading for ${name}. Evidence:\n${JSON.stringify(input)}` },
    ];

    let lastErrors: string[] = [];
    for (let attempt = 1; attempt <= 2; attempt++) {
      const out = await callModel(apiKey, messages, req.signal);
      if (!out.ok) return json({ error: out.message }, out.status === 402 || out.status === 429 || out.status === 403 ? out.status : 502);
      let reading: PersonReading;
      try { reading = cleanPersonReading(extractJson(out.text) as PersonReading); } catch (e) {
        lastErrors = [`Output was not valid JSON: ${(e as Error).message}`];
        messages.push({ role: 'assistant', content: out.text.slice(0, 4000) }, { role: 'user', content: 'Return only the JSON object in the required shape.' });
        continue;
      }
      const errors = validatePersonReading(reading, ctx);
      if (!errors.length) return json({ reading, model: MODEL, attempts: attempt });
      lastErrors = errors;
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
