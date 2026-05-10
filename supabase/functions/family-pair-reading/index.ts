// Family Pair Reading — AI-generated, sign/house/age-aware parent→child synastry.
// Replaces the static template lookup. Aspects are computed deterministically on
// the client and passed in; the AI only writes prose.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CrossAspect {
  fromPlanet: string;
  fromSign?: string;
  fromHouse?: number | null;
  fromRetro?: boolean;
  toPlanet: string;
  toSign?: string;
  toHouse?: number | null;
  toRetro?: boolean;
  aspect: string; // conjunction / opposition / trine / square / sextile
  symbol: string;
  orb: number;
}

interface RequestBody {
  fromName: string;
  fromRole: string;
  fromPlanetsSummary: string;
  toName: string;
  toRole: string;
  toPlanetsSummary: string;
  toBirthDate?: string;
  toAgeYears?: number | null;
  parentMoonSummary?: string;
  childMoonSummary?: string;
  aspects: CrossAspect[];
}

interface ReadingSection {
  heading: string; // "FROM's Mercury square TO's Moon"
  badge: string; // "Square · 3.6°"
  howItLands: string; // 1-2 sentences from the child's POV in plain language
  blindSpot: string; // 1 sentence — what the parent doesn't see
  whatHelps: string[]; // 2-3 concrete actions, age-calibrated
}

interface SoulContract {
  whyTheseTwo: string;
  childLesson: string;
  parentLesson: string;
  contractSentence: string;
}

interface ReadingPayload {
  essence: string[]; // 3-5 bullet headlines, plain English
  ageNote: string; // short framing of developmental stage
  sections: ReadingSection[];
  practice: string; // one focused 90-day practice for the parent
  soulContract?: SoulContract;
  moonBridge?: { summary: string; translation: string };
}

function ageStage(years: number | null | undefined): string {
  if (years == null || !isFinite(years)) return "no age provided — write for general developmental range 5–12";
  if (years < 2) return `${years} years old — pre-verbal infancy. Child reads tone, body, and presence, not words.`;
  if (years < 6) return `${years} years old — early childhood. Sensory and emotional. Words matter less than felt safety.`;
  if (years < 12) return `${years} years old — middle childhood. Beginning to verbalize feelings; rules and fairness matter.`;
  if (years < 18) return `${years} years old — adolescence. Identity formation. Privacy, autonomy, and respect are the currency.`;
  return `${years} years old — adult child. The dynamic is voluntary; the parent's job is invitation, not instruction.`;
}

function computeAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  const now = new Date();
  let age = now.getFullYear() - y;
  const beforeBirthday =
    now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d);
  if (beforeBirthday) age--;
  return age;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;
    if (!body?.fromName || !body?.toName || !Array.isArray(body.aspects)) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ageYears = body.toAgeYears ?? computeAge(body.toBirthDate);
    const stage = ageStage(ageYears);

    // Trim to top 8 tightest aspects to keep prompt focused.
    const aspects = body.aspects.slice(0, 8);
    const aspectLines = aspects
      .map((a) => {
        const fromHouse = a.fromHouse ? ` (H${a.fromHouse})` : "";
        const toHouse = a.toHouse ? ` (H${a.toHouse})` : "";
        const fromRetro = a.fromRetro ? " R" : "";
        const toRetro = a.toRetro ? " R" : "";
        return `- ${body.fromName}'s ${a.fromPlanet} in ${a.fromSign ?? "?"}${fromHouse}${fromRetro} ${a.symbol} ${body.toName}'s ${a.toPlanet} in ${a.toSign ?? "?"}${toHouse}${toRetro} — ${a.aspect}, orb ${a.orb.toFixed(1)}°`;
      })
      .join("\n");

    const fromRoleLabel = body.fromRole;
    const toRoleLabel = body.toRole;

    const systemPrompt = `You are an experienced family astrologer writing for a real parent reading about their real child. Your voice is warm, specific, plain-spoken, and useful. You speak the way a trusted friend who happens to know astrology would — never clinical, never doom-y, never jargon-heavy.

ABSOLUTE RULES:
1. NEVER use words like "miscues", "rubs against", "blurs", "clouds", "wounds", "afflicts", "harshly". These were the words that made the previous version feel awful. Forbidden.
2. NEVER write a sentence whose only content is the aspect name (e.g. "Mercury squares Moon"). Always describe what it FEELS like in real family life.
3. Every interpretation must reference the SPECIFIC signs (and houses if given) of the two planets. Sun in Pisces square Neptune in Sagittarius reads differently from Sun in Leo square Neptune in Scorpio. Use the elements and modes to flavor the reading.
4. Calibrate language to the child's developmental stage. A 4-year-old does not "feel unmoored by vague guidance" — they cry when plans change. A 14-year-old experiences the same aspect as a parent who "doesn't get how serious this is."
5. Squares and oppositions are growth, not damage. Frame them as "where you two have to translate" not "where you hurt them."
6. Trines and sextiles are gifts. Name them as such and tell the parent how to LEAN ON them.
7. Conjunctions can go either way — read the planets, not the geometry, to decide tone.
8. Write in second person to the parent: "your Mercury", "your daughter feels...", "what helps".
9. Plain English. 6th-grade reading level. No astrological jargon in the prose unless naming a specific placement.
10. Output ONLY valid JSON matching the schema. No markdown fences, no commentary.

DEVELOPMENTAL STAGE FOR THIS CHILD:
${stage}

JSON SCHEMA:
{
  "essence": [string, ...3-5 items, each one sentence headlining the most important dynamic in plain English, no jargon],
  "ageNote": string (1-2 sentences naming the developmental stage and how it shapes the reading),
  "sections": [
    {
      "heading": "FROM_NAME's PLANET ASPECT TO_NAME's PLANET" (use the actual names and aspect word, e.g. "Lauren's Mercury square Ben's Moon"),
      "badge": "Aspect · X.X°",
      "howItLands": string (2-3 sentences from the child's lived experience at this age, sign-specific),
      "blindSpot": string (1 sentence the parent likely doesn't see, warm and non-blaming),
      "whatHelps": [string, string, ...2-3 concrete things the parent can DO, not feel — verbs, not adjectives]
    }
  ],
  "practice": string (1 short paragraph naming ONE focused practice for the parent for the next 90 days based on the tightest or most pressing cross-aspect),
  "soulContract": {
    "whyTheseTwo": string (2-3 sentences on the karmic pull that brought these two souls into this family),
    "childLesson": string (1-2 sentences: what this child agreed to learn through this parent),
    "parentLesson": string (1-2 sentences: what this parent agreed to learn through this child),
    "contractSentence": string (one sentence naming the central agreement, must name BOTH people learning)
  },
  "moonBridge": {
    "summary": string (2 sentences explaining how the parent and child Moon signs interact as emotional languages),
    "translation": string (one sentence in the format: "When [childName] does [specific behavior], they are actually saying [what they need]." Specific to the child's Moon sign, not generic.)
  }
}

SOUL CONTRACT RULES:
- whyTheseTwo: Look at the child's North Node and Chiron cross-aspects to the parent's chart. State plainly what karmic agreement brought these two souls together. Do not use mystical language, write it like you are telling someone something true.
- childLesson: Based on the child's North Node direction and the tightest challenging cross-aspects, name what this child is here to learn specifically through this parent.
- parentLesson: Look at what the child's chart activates in the parent, especially if the child's Sun or Moon aspects the parent's Saturn, Chiron, or South Node. Name what this parent is here to learn through this child.
- contractSentence: One sentence. Plain English. Must name both people learning something, not just the child learning from the parent. Example format: "They came to teach each other that [truth]."
- NEVER use the words: wound, heal, archetypal, energies, vibration, shadow, integrate, liminal.
- Speak in terms of what the soul CHOSE, not what happened TO them. Active voice always.

MOON BRIDGE: Write 2 sentences (summary) explaining how these two Moon signs interact as emotional languages. Then write one sentence (translation) in the format: "When ${body.toName} does [specific behavior], they are actually saying [what they need]." Make the translation specific to the child's Moon sign, not generic.`;

    const userPrompt = `PARENT (${fromRoleLabel}): ${body.fromName}
${body.fromPlanetsSummary}

CHILD (${toRoleLabel}): ${body.toName}${ageYears != null ? ` — age ${ageYears}` : " — age unknown"}
${body.toPlanetsSummary}

MOON BRIDGE INPUTS:
- Parent: ${body.parentMoonSummary ?? "unknown"}
- Child: ${body.childMoonSummary ?? "unknown"}

CROSS-ASPECTS (already verified, tightest first):
${aspectLines}

Write the reading. One section per cross-aspect above, in the same order. Generate 3-5 essence bullets that name the headline pattern of the relationship in real-life terms. Then the practice. Then the soulContract object following the SOUL CONTRACT RULES. Then the moonBridge object following the MOON BRIDGE rule.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const raw = aiData?.choices?.[0]?.message?.content ?? "{}";
    let payload: ReadingPayload;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      console.error("Bad AI JSON:", raw);
      return new Response(JSON.stringify({ error: "AI returned malformed reading" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ...payload,
        ageYears,
        aspectsUsed: aspects.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("family-pair-reading error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
