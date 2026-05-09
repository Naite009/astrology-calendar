import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Placement {
  planet: string;
  sign?: string;
  degree?: number;
  house?: number;
  isRetrograde?: boolean;
}

interface HouseInfo {
  house: number;
  cuspSign?: string;
  cuspDegree?: number;
  ruler?: string;
  rulerSign?: string;
  rulerHouse?: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

interface Payload {
  chartName: string;
  placements: Placement[];
  houses: HouseInfo[]; // 4, 7, 8, 10, 12 specifically
  aspects: Aspect[]; // hard aspects to luminaries/Asc + supportive trines/conjunctions
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const { chartName, placements, houses, aspects } = (await req.json()) as Payload;

    const placementLines = placements
      .map((p) =>
        `${p.planet}: ${p.sign ?? "?"} ${p.degree != null ? p.degree.toFixed(1) + "°" : ""}${
          p.house ? " (House " + p.house + ")" : ""
        }${p.isRetrograde ? " Rx" : ""}`,
      )
      .join("\n");

    const houseLines = houses
      .map(
        (h) =>
          `House ${h.house}: cusp ${h.cuspSign ?? "?"} ${
            h.cuspDegree != null ? h.cuspDegree.toFixed(1) + "°" : ""
          } | ruler ${h.ruler ?? "?"}${h.rulerSign ? " in " + h.rulerSign : ""}${
            h.rulerHouse ? " (House " + h.rulerHouse + ")" : ""
          }`,
      )
      .join("\n");

    const aspectLines = aspects
      .slice(0, 30)
      .map((a) => `${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(1)}° orb)`)
      .join("\n");

    const systemPrompt = `You are an evolutionary astrologer writing a "Soul Agreements" reading. This is a SYMBOLIC, SPIRITUAL layer, NOT predictive astrology.

ABSOLUTE RULES:
- Write so a smart 14-year-old can understand it. If a teenager could not explain it back in plain words, rewrite it.
- Be emotionally intelligent but grounded. Never fortune-telling. Never deterministic. Never predict death or specific events.
- Never imply suffering was "chosen" in a harmful way. Never romanticize trauma. Never use fear language.
- Stay STRICTLY chart-specific. Only reference placements, houses, and aspects PRESENT in the data below. Do NOT invent aspects.
- If data for a section is missing or thin, write a shorter section rather than hallucinating.
- NEVER use em dashes (—). Use commas, periods, colons, or parentheses.
- Cross-sign aspects (e.g. 29° Aries to 1° Taurus) are valid when within orb. Sun/Moon conjunctions valid up to 10°.

JARGON BAN — these words are FORBIDDEN unless you immediately translate them in the same sentence into plain language:
transformation, rebirth, evolution, karmic, soul contract, alchemy, sovereignty, integration, destiny, ego death, shadow work, ascension, awakening.

  BAD:  "You are here for deep transformation."
  GOOD: "You are not meant to stay the same person your whole life. Life will keep pushing you to grow, change, and become more honest about who you are."

  BAD:  "Release old identity structures."
  GOOD: "Let go of old ways of acting that were built to keep other people comfortable."

  BAD:  "Develop sovereignty."
  GOOD: "Learn to trust your own choices even when other people disagree."

ACCURACY & HEDGING RULES:
- Use soft, accurate language: "may", "might", "can", "often", "sometimes". Avoid "always", "definitely", "certainly", "must".
- Stay BEHAVIORAL, not diagnostic. Do not over-psychologize.
  BAD: "Your family was secretive."
  GOOD: "Your family may have kept emotions private or hard to talk about."
  BAD: "You feel you are not enough."
  GOOD: "You may struggle to fully be yourself in close relationships."
- Do not overstate. If the chart only hints at something, say "may" or "can sometimes."

REQUIRED SECTION STRUCTURE — every section must have these 4 layers, in this order, inside the "interpretation" field. Use these exact bold sub-headings on their own lines:

**Astrology**
Briefly explain the actual placements/aspects being used. Keep this SHORT. 2-5 sentences max. Do not over-explain.

**Plain English**
Translate the astrology into everyday language. Internally answer: "What does this mean in real life?" Short sentences, concrete language, smart-teenager comprehension. No abstract spiritual language without translation. No jargon.

**Real-Life Examples**
3-5 observable bullet examples. Each bullet is one short sentence describing a recognizable behavior or situation. Use things like: avoiding conflict, keeping the peace, hiding feelings, struggling to say no, overthinking conversations, needing approval, staying too long in unhealthy relationships, rebuilding confidence after setbacks, learning boundaries, speaking up more over time. Forbidden vague examples: "soul growth", "energy shifts", "healing karma".

**Recognition Check**
Use the heading "Recognition Check" EXACTLY ONCE per section. Never repeat the title inside the body. Format exactly:

This may fit if:
- [behavior pattern]
- [relationship pattern]
- [emotional pattern]
- [life pattern]

Rules: concrete, observable, behavior-based, emotionally recognizable. Do NOT ask introspective questions. Forbidden phrasings: "How do you...", "In what ways...", "What are you ready to...". Offer recognizable life patterns the reader either notices in themselves or doesn't. Recognition first; reflection happens naturally.

LANGUAGE REPLACEMENTS (mandatory across ALL sections):
- Replace "shedding old identities" → "letting go of old ways of acting"
- Replace "embracing your power" → "learning to trust yourself and speak more honestly"
- Replace "authentic self" → "the real you"
- Also avoid: "stepping into", "owning your truth", "soul calling" — use plain everyday phrasing.

15-YEAR-OLD TEST: If a 15-year-old cannot easily explain a sentence back in their own words, rewrite it.

NO DUPLICATE HEADINGS: Each of the 4 sub-headings (Astrology, Plain English, Real-Life Examples, Recognition Check) appears EXACTLY ONCE per section. Do not repeat them inside the body text.

The "question" field must contain the same "This may fit if:" block (with bullets), NOT a question.

Total length per section: 200-350 words including all 4 layers.

Return STRICT JSON only, matching this schema:
{
  "family": { "interpretation": string, "question": string },
  "wound": { "interpretation": string, "question": string },
  "purpose": { "interpretation": string, "question": string },
  "relationship": { "interpretation": string, "question": string },
  "gift": { "interpretation": string, "question": string },
  "timing": { "interpretation": string, "question": string },
  "legacy": { "interpretation": string, "question": string },
  "summary": {
    "coreLesson": string,
    "coreWound": string,
    "corePurpose": string,
    "coreLegacy": string
  }
}
The "interpretation" field MUST contain all 4 layered sub-headings (Astrology, Plain English, Real-Life Examples, Recognition Check). The "question" field repeats the "This may fit if:" bullet block — never a question.`;

    const userPrompt = `Chart: ${chartName}

PLACEMENTS:
${placementLines}

KEY HOUSES (4, 7, 8, 10, 12):
${houseLines}

VERIFIED ASPECTS:
${aspectLines || "(none provided)"}

Write the 7 Soul Agreements using ONLY the data above. Every section MUST follow the 4-layer structure (Astrology / Plain English / Real-Life Examples / Recognition Check). The Recognition Check is a "This may fit if:" bullet list of concrete behavioral/emotional/relationship patterns — NEVER a reflective question:

1. FAMILY AGREEMENT — emotional environment that shaped you growing up. Use Moon, 4th house, ruler of the 4th, aspects to Moon.
   SPECIAL RULE — a 12th house Moon does NOT automatically mean a "secretive family" or "hidden trauma." Prefer language like: private emotional life, absorbing family emotions, unspoken emotional patterns, difficulty naming feelings. Avoid "secretive family", "hidden trauma", "emotional manipulation" unless clearly supported by hard aspects in the data.

2. WOUND AGREEMENT — the pain that became a growth catalyst. Use Chiron, Saturn, 12th house, hard aspects to Sun/Moon/Ascendant.
   SPECIAL RULE — for Chiron in Aries in the 7th house, prefer: difficulty staying fully yourself in relationships, struggle asserting your own needs, fear of conflict when speaking honestly. Avoid "you feel unworthy" or "you are not enough" unless strongly supported elsewhere in the chart.

3. PURPOSE AGREEMENT — what you are growing toward. Use North Node, Sun, 1st house, Midheaven.
   SPECIAL RULE — if North Node is in Scorpio AND in the 1st house, the Plain English layer must include language like:
   "You are not meant to stay the same person your whole life. Life will keep pushing you to change in big ways: learning to stop people-pleasing, saying what you really think, trusting yourself more than outside approval, becoming stronger after hard experiences, and letting go of old versions of yourself that were built just to keep peace. Your purpose is to become more honest, stronger, and more fully yourself."

4. RELATIONSHIP AGREEMENT — who helps you grow through connection.
   STRICT priority order: (1) 7th house placements, (2) ruler of the 7th, (3) Venus, (4) Moon, (5) Mars.
   DO NOT use Juno in core relationship interpretation. Omit Juno entirely unless it adds something genuinely essential that the priority bodies above do not already cover — and even then, never lead with it.

5. GIFT AGREEMENT — what you arrived already good at.
   PRIORITIZE Venus, Neptune, Moon. Include intuitive gifts, emotional intelligence, symbolic understanding, creativity, and spiritual sensitivity.
   Use Jupiter and 2nd/5th houses too, but do NOT default Jupiter to "financial talent." Read it as wisdom, generosity, vision, or teaching unless the chart clearly points to material abundance.

6. TIMING AGREEMENT — HOW your growth tends to unfold (style, not events). Use Saturn, Nodes, Pluto, angular planets. Do NOT predict events.

7. LEGACY AGREEMENT — what you tend to leave behind. Use Midheaven, ruler of MC, Sun, Saturn, 10th house.
   SPECIAL RULE — if MC is in Cancer AND Moon is in the 12th house, interpret legacy specifically through:
   - emotional healing
   - unseen support systems
   - helping others feel safe
   - healing emotional patterns
   - compassionate, behind-the-scenes leadership
   Do NOT use generic "nurturing" language.

Then SUMMARY: one plain-English sentence each for core lesson, core wound, core purpose, core legacy. Apply the same jargon ban.

Return ONLY the JSON object. No prose outside JSON. No markdown fences.`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 16000,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("AI gateway error:", resp.status, errText);
      return new Response(JSON.stringify({ error: `AI gateway ${resp.status}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";

    const tryParse = (s: string) => {
      // 1. raw
      try { return JSON.parse(s); } catch {}
      // 2. strip markdown fences
      const noFences = s.replace(/```json|```/g, "").trim();
      try { return JSON.parse(noFences); } catch {}
      // 3. extract first {...} block
      const first = noFences.indexOf("{");
      const last = noFences.lastIndexOf("}");
      if (first !== -1 && last > first) {
        const block = noFences.slice(first, last + 1);
        try { return JSON.parse(block); } catch {
          // 4. escape stray newlines inside strings (common Gemini failure)
          const repaired = block.replace(/("(?:[^"\\]|\\.)*")|[\n\r\t]/g, (m, str) => {
            if (str) return str;
            if (m === "\n") return "\\n";
            if (m === "\r") return "\\r";
            if (m === "\t") return "\\t";
            return m;
          });
          try { return JSON.parse(repaired); } catch {}
        }
      }
      throw new Error("Unparseable AI JSON");
    };

    let parsed: unknown;
    try {
      parsed = tryParse(String(content));
    } catch (parseErr) {
      console.error("soul-agreements JSON parse failed; retrying AI once. Snippet:", String(content).slice(2700, 2850));
      // Retry once with a stricter instruction
      const retryResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt + "\n\nCRITICAL: Output STRICT JSON only. Escape all internal quotes as \\\". Do not include real newlines inside string values — use spaces. No markdown." },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_tokens: 16000,
        }),
      });
      if (!retryResp.ok) {
        const t = await retryResp.text();
        console.error("Retry AI gateway error:", retryResp.status, t);
        return new Response(JSON.stringify({ error: "AI returned malformed JSON" }), {
          status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const retryData = await retryResp.json();
      const retryContent = retryData?.choices?.[0]?.message?.content ?? "{}";
      parsed = tryParse(String(retryContent));
    }

    return new Response(JSON.stringify({ agreements: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("soul-agreements error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
