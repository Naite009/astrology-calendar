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

const sectionKeys = ["family", "wound", "purpose", "relationship", "gift", "timing", "legacy", "strength", "reset"] as const;
type SectionKey = typeof sectionKeys[number];

const dedupeRecognitionCheck = (value: string) => {
  // HARD RULE: "Recognition Check" may appear once and only once per section.
  // Match the heading in any common form the model emits:
  //   **Recognition Check**, ## Recognition Check, # Recognition Check,
  //   or a bare "Recognition Check" line on its own.
  const HEADING = /(^|\n)\s*(?:\*\*\s*Recognition Check\s*\*\*|#{1,6}\s*Recognition Check|Recognition Check)\s*(?=\n|:|$)/gi;
  // Any heading that ends a Recognition Check block: another **Heading**,
  // a markdown ## heading, or end of string.
  const NEXT_HEADING = /\n\s*(?:\*\*[^*\n]+\*\*|#{1,6}\s+[^\n]+)\s*(?:\n|$)/;

  const matches = [...value.matchAll(HEADING)];
  if (matches.length <= 1) return value;

  // Walk through occurrences. Keep the FIRST block (heading + body until next
  // heading). For every subsequent occurrence, drop the heading and its body,
  // but preserve any non-Recognition content that sat between duplicates.
  let out = "";
  let cursor = 0;
  matches.forEach((m, i) => {
    const headingStart = (m.index ?? 0) + (m[1] ? m[1].length : 0);
    const headingEnd = (m.index ?? 0) + m[0].length;
    const after = value.slice(headingEnd);
    const nextRel = after.search(NEXT_HEADING);
    const blockEnd = nextRel === -1 ? value.length : headingEnd + nextRel;

    if (i === 0) {
      // Keep everything up to and including this first block.
      out += value.slice(cursor, blockEnd);
    } else {
      // Preserve content between previous cursor and this duplicate's heading.
      if (headingStart > cursor) out += value.slice(cursor, headingStart);
      // Skip the duplicate heading + its body entirely.
    }
    cursor = blockEnd;
  });
  if (cursor < value.length) out += value.slice(cursor);
  return out;
};

const cleanPlainLanguage = (value: string) =>
  dedupeRecognitionCheck(
    value
      .replace(/—/g, ",")
      .replace(/shedding old identities/gi, "letting go of old ways of acting")
      .replace(/embracing your power/gi, "learning to trust yourself and speak more honestly")
      .replace(/authentic self/gi, "the real you")
      .replace(/stepping into/gi, "learning")
      .replace(/owning your truth/gi, "saying what you really think")
      .replace(/soul calling/gi, "life direction")
  );

const extractRecognition = (text: string) => {
  const match = text.match(/\*\*Recognition Check\*\*\s*([\s\S]*)$/i);
  return cleanPlainLanguage((match?.[1] ?? "").trim());
};

const makeFallbackAgreements = ({ placements, houses, aspects }: Payload) => {
  const byPlanet = (planet: string) => placements.find((p) => p.planet === planet);
  const house = (n: number) => houses.find((h) => h.house === n);
  const aspectFor = (planet: string) => aspects.find((a) => a.planet1 === planet || a.planet2 === planet);
  const p = (planet: string) => {
    const item = byPlanet(planet);
    return item ? `${planet} in ${item.sign ?? "an unknown sign"}${item.house ? ` in House ${item.house}` : ""}` : `${planet}`;
  };
  const h = (n: number) => {
    const item = house(n);
    return item ? `House ${n} begins in ${item.cuspSign ?? "an unknown sign"}${item.ruler ? `, with ${item.ruler} as ruler` : ""}` : `House ${n}`;
  };
  const a = (planet: string) => {
    const item = aspectFor(planet);
    return item ? `${item.planet1} ${item.type} ${item.planet2}` : `no major listed aspect to ${planet}`;
  };

  const recognition = `This may fit if:\n- you often notice what other people feel before they say it\n- close relationships teach you where you need clearer boundaries\n- you replay conversations when something feels unfinished\n- hard experiences have made you more honest about what you need`;

  const section = (astro: string, plain: string, examples: string[]) => ({
    interpretation: cleanPlainLanguage(`**Astrology**\n${astro}\n\n**Plain English**\n${plain}\n\n**Real-Life Examples**\n${examples.map((x) => `- ${x}`).join("\n")}\n\n**Recognition Check**\n${recognition}`),
    question: recognition,
  });

  return {
    family: section(
      `${p("Moon")} is the main emotional marker. ${h(4)} describes the early home pattern. The strongest listed Moon contact is ${a("Moon")}.`,
      "Your emotional life may have grown around reading the room, staying careful with feelings, and learning when it is safe to be open.",
      ["you pick up on moods quickly", "you may keep feelings private until you trust someone", "family patterns can affect how safe you feel", "you may calm others before naming your own needs"],
    ),
    wound: section(
      `${p("Chiron")} and ${p("Saturn")} show tender places that ask for maturity. The 12th house also matters here: ${h(12)}.`,
      "A painful pattern may become a place where you learn steadiness. You may grow by saying what hurts without making yourself wrong for having needs.",
      ["you may avoid conflict until pressure builds", "you can be hard on yourself when you feel exposed", "you may need time alone to understand your feelings", "you become stronger when you stop hiding your needs"],
    ),
    purpose: section(
      `${p("NorthNode")} points toward growth. ${p("Sun")} and ${h(10)} add life direction and visibility.`,
      "You are not meant to stay the same person your whole life. Life may keep asking you to trust yourself, speak more honestly, and let go of old ways of acting that only keep the peace.",
      ["you may outgrow roles that once kept others comfortable", "you may learn to say no more clearly", "you may choose honesty over approval", "you may feel stronger after periods of big change"],
    ),
    relationship: section(
      `${h(7)} is the main relationship marker. The 7th house ruler, Venus, Moon, and Mars are the priority relationship symbols in this reading.`,
      "Relationships may teach you how to stay connected without disappearing into someone else's needs. The lesson is honest closeness, not keeping peace at any cost.",
      ["you may adjust yourself to make a relationship work", "you may need partners who respect direct honesty", "you may notice conflict feels risky", "you grow when you stay present and tell the truth kindly"],
    ),
    gift: section(
      `${p("Venus")}, ${p("Neptune")}, and ${p("Moon")} describe natural gifts. Jupiter can add wisdom, generosity, or teaching ability.`,
      "You may be naturally good at sensing what people need, finding meaning in hard moments, and helping others feel less alone.",
      ["people may come to you when they need comfort", "you may understand feelings that are hard to explain", "creative or symbolic things may come naturally", "you may help people feel seen without forcing advice"],
    ),
    timing: section(
      `${p("Saturn")}, ${p("Pluto")}, and the Nodes describe HOW your growth tends to arrive. This is about style, not fixed events.`,
      "Growth often comes through pressure, endings, truth-telling moments, taking on real responsibility, and emotional turning points. You may change slowly at first, then make a clear decision once you finally know what is no longer working.",
      ["growth often arrives after a hard ending or a forced choice", "you may resist change until the cost of staying the same is bigger", "honest conversations can mark the real turning points", "taking on more responsibility can speed up your growth", "you may trust yourself more after a setback you did not collapse under"],
    ),
    legacy: section(
      `${h(10)} and ${p("Sun")} describe what you leave behind. Saturn adds the part that takes patience and responsibility.`,
      "Your life may leave people with more emotional honesty, more safety, and a stronger sense that hard things can be faced directly. Your gift is helping others feel safe and supported, but part of your growth is learning not to carry what belongs to them.",
      ["you may become someone others trust in private moments", "you may support people without needing attention", "you may help name feelings people avoid", "you may model strength that still has compassion"],
    ),
    strength: section(
      `${p("Mars")}, ${p("Saturn")}, ${p("Pluto")}, and ${p("Moon")} describe who you become when life gets hard.`,
      "Under stress you may go quiet, get focused, and rely on yourself more than you ask for help. You can stay standing through things that would knock other people down, but the cost can be over-controlling, shutting people out, or pushing past your own limits.",
      ["you may become more private when things get hard", "you may take on too much before asking for help", "you can stay calm on the outside while a lot is happening inside", "you may push through pain instead of pausing", "you bounce back faster when you let one trusted person see how you really feel"],
    ),
    reset: section(
      `${p("Moon")}, ${p("Venus")}, ${h(4)}, ${h(6)}, and ${p("Neptune")} describe what helps you feel grounded again.`,
      "You usually need a mix of quiet and gentle care to come back to yourself. Solitude, sleep, time outside, slow body movement, and a small amount of honest conversation tend to reset you faster than pushing through.",
      ["solitude and quiet time at home", "walking, stretching, or any slow movement", "journaling or saying out loud what you are actually feeling", "time in nature or near water", "creative time with no goal attached", "clear boundaries around who and what you say yes to"],
    ),
    summary: {
      whatToPractice: "Practice telling the truth about what you want, even when it risks disappointing someone.",
      whatToWatchFor: "Watch for moments when you stay quiet to avoid conflict or hide a need to keep the peace.",
      whatToBuild: "Build the inner steadiness to feel uncomfortable feelings without abandoning yourself or rushing to fix others.",
      whatToGive: "Give people the kind of honest, calm presence that helps them say hard things out loud without shame.",
      integration: "Your growth comes from learning how to stay connected to others without losing yourself.",
    },
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service is not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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

REQUIRED SECTION STRUCTURE — every section must have these 4 layers, in this order. Return them as separate JSON fields. The function will format the headings.

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

**Real-Life Examples vs Recognition Check — STRICT DIFFERENTIATION (mandatory)**
These two sections must NEVER overlap. They cover different territory:

Real-Life Examples = EXTERNAL behaviors and observable actions that someone watching the person could see. Examples to draw from: avoiding conflict, over-explaining, staying too long in something, people-pleasing, saying yes when they mean no, taking on too many tasks, leaving early, going quiet, asking the same question twice.

Recognition Check = INTERNAL experiences: emotional patterns and thought patterns nobody else sees from outside. Examples to draw from: anxiety during disagreement, feeling guilty after saying no, replaying conversations in your head, feeling responsible for other people's emotions, freezing when asked what you want, dreading a phone call, the relief of being alone.

Before writing Recognition Check, look at your Real-Life Examples list and make sure NONE of the Recognition Check items repeat the same idea. If a Recognition Check bullet is just an external behavior in different words, rewrite it as the inner feeling or thought that drives it.

LANGUAGE REPLACEMENTS (mandatory across ALL sections):
- Replace "shedding old identities" → "letting go of old ways of acting"
- Replace "embracing your power" → "learning to trust yourself and speak more honestly"
- Replace "authentic self" → "the real you"
- Also avoid: "stepping into", "owning your truth", "soul calling" — use plain everyday phrasing.

15-YEAR-OLD TEST: If a 15-year-old cannot easily explain a sentence back in their own words, rewrite it.

NO DUPLICATE HEADINGS: Each of the 4 sub-headings (Astrology, Plain English, Real-Life Examples, Recognition Check) appears EXACTLY ONCE per section. Do not repeat them inside the body text.

The "recognition" field must contain 4 short bullet items as a JSON array, NOT questions.

Total length per section: 120-190 words including all 4 layers.

Return STRICT JSON only, matching this schema:
{
  "family": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "wound": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "purpose": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "relationship": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "gift": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "timing": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "legacy": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "strength": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "reset": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "summary": {
    "whatToPractice": string,
    "whatToWatchFor": string,
    "whatToBuild": string,
    "whatToGive": string,
    "integration": string
  }
}

SECTION DISTINCTION RULE (mandatory): Each section must feel distinct. Do NOT repeat the same theme or example across sections. Domain map:
- family: early emotional imprint
- wound: pain patterns that became growth catalysts
- purpose: identity and becoming
- relationship: relationship mirrors and lessons
- gift: natural strengths
- timing: HOW growth happens (style, not events)
- legacy: what you leave behind
- strength: who you become when life gets hard
- reset: what helps you feel grounded again

FINAL RULE — every section must answer all three of these:
1. What does this mean? (Astrology + Plain English)
2. What does this look like? (Real-Life Examples)
3. What can I do with it? (carry into Recognition Check or summary)
If any of those is missing or weak, rewrite the section before returning.

SUMMARY RULES (mandatory, applies to all 5 summary fields — whatToPractice, whatToWatchFor, whatToBuild, whatToGive, integration):
- The summary block is REQUIRED. It may NEVER be empty, blank, or label-only. Every field MUST contain real content.
- MINIMUM LENGTH: each field must be at least 15 words and 1 to 3 full sentences. No single-word answers. No placeholders. No ellipses.
- Each field is a practical, behavioral instruction. Tell the user WHAT TO DO, not what they "are".
- Must start with an action verb: "Practice...", "Watch for...", "Build...", "Give...". (integration is a single closing sentence — no verb requirement.)
- Must be specific and recognizable. A 14-year-old must be able to picture doing it.
- BAD: "Your purpose is transformation." / "Your wound is self-assertion." / blank fields / "[blank]" / labels with no content.
- GOOD: "Practice telling the truth about what you want, even when it risks disappointing someone, because staying quiet to keep the peace slowly erodes your sense of self."
- The word "Regenerate" must NEVER appear in any field. Never tell the user to retry.
- Field meanings:
  - whatToPractice: the skill or behavior to build (action to repeat).
  - whatToWatchFor: the pattern that pulls you backward (what to notice and pause on).
  - whatToBuild: the inner foundation being developed over time (capacity, steadiness, trust in self).
  - whatToGive: the strength or support this person can offer others.
  - integration: ONE final sentence that names the single life direction tying all sections together. Default to: "Your growth comes from learning how to stay connected to others without losing yourself." You may rephrase only if the chart clearly points to a different unifying direction.
Do NOT put markdown headings inside JSON values. Do NOT return "interpretation" or "question" fields. No prose outside JSON.`;

    const userPrompt = `Chart: ${chartName}

PLACEMENTS:
${placementLines}

KEY HOUSES (4, 7, 8, 10, 12):
${houseLines}

VERIFIED ASPECTS:
${aspectLines || "(none provided)"}

Write the 9 Life Patterns (Soul Agreements + Strength Under Stress + What Helps You Reset) using ONLY the data above. Every section MUST return: astrology, plainEnglish, examples, recognition. The recognition array is concrete INTERNAL emotional/thought patterns — never reflective questions, never duplicates of the external behaviors in examples:

1. FAMILY AGREEMENT — early emotional imprint. Use Moon, 4th house, ruler of the 4th, aspects to Moon.
   SPECIAL RULE — a 12th house Moon does NOT automatically mean a "secretive family" or "hidden trauma." Prefer language like: private emotional life, absorbing family emotions, unspoken emotional patterns, difficulty naming feelings. Avoid "secretive family", "hidden trauma", "emotional manipulation" unless clearly supported by hard aspects in the data.

2. WOUND AGREEMENT — pain patterns that became a growth catalyst. Use Chiron, Saturn, 12th house, hard aspects to Sun/Moon/Ascendant.
   SPECIAL RULE — for Chiron in Aries in the 7th house, prefer: difficulty staying fully yourself in relationships, struggle asserting your own needs, fear of conflict when speaking honestly. Avoid "you feel unworthy" or "you are not enough" unless strongly supported elsewhere in the chart.

3. PURPOSE AGREEMENT — identity and becoming (what you are growing toward). Use North Node, Sun, 1st house, Midheaven. Do NOT overlap with the relationship section.
   SPECIAL RULE — if North Node is in Scorpio AND in the 1st house, the Plain English layer must include language like:
   "You are not meant to stay the same person your whole life. Life will keep pushing you to change in big ways: learning to stop people-pleasing, saying what you really think, trusting yourself more than outside approval, becoming stronger after hard experiences, and letting go of old versions of yourself that were built just to keep peace. Your purpose is to become more honest, stronger, and more fully yourself."

4. RELATIONSHIP AGREEMENT — relationship mirrors and lessons (who helps you grow through connection).
   STRICT priority order: (1) 7th house placements, (2) ruler of the 7th, (3) Venus, (4) Moon, (5) Mars.
   DO NOT use Juno in core relationship interpretation. Omit Juno entirely unless it adds something genuinely essential that the priority bodies above do not already cover, and even then never lead with it.

5. GIFT AGREEMENT — natural strengths you arrived already good at.
   PRIORITIZE Venus, Neptune, Moon. Include intuitive gifts, emotional intelligence, symbolic understanding, creativity, and spiritual sensitivity.
   Use Jupiter and 2nd/5th houses too, but do NOT default Jupiter to "financial talent." Read it as wisdom, generosity, vision, or teaching unless the chart clearly points to material abundance.

6. TIMING AGREEMENT — HOW growth tends to arrive (style, not events). Use Saturn, Nodes, Pluto, angular planets.
   REQUIRED STRUCTURE — explicitly say something like "Growth often comes through:" and then concretely name which of these are strongest in this chart: pressure, endings, truth-telling moments, taking on real responsibility, emotional turning points. Be concrete. Avoid vague phrasing like "growth happens in waves" or "things unfold in cycles." Do NOT predict events.

7. LEGACY AGREEMENT — what you leave behind. Use Midheaven, ruler of MC, Sun, Saturn, 10th house.
   SPECIAL RULE — if MC is in Cancer AND Moon is in the 12th house, interpret legacy specifically through emotional healing, unseen support systems, helping others feel safe, healing emotional patterns, and compassionate behind-the-scenes leadership. ALWAYS include this exact emotional-boundary line near the end of the Plain English layer: "Your gift is helping others feel safe and supported, but part of your growth is learning not to carry what belongs to them." Do NOT use generic "nurturing" language.

8. STRENGTH UNDER STRESS — who you become when life gets hard. Use Mars, Saturn, Pluto, Moon (sign, house, and hard aspects).
   Show resilience patterns: how this person braces, focuses, isolates, or pushes through under pressure, plus the cost of those patterns. Recognition Check should focus on the inner experience under stress (the inner clamp, the urge to handle it alone, the late-night replay), not just outer behavior.

9. WHAT HELPS YOU RESET — what helps this person feel grounded again. Use Moon, Venus, 4th house, 6th house, Neptune.
   Output must be PRACTICAL regulation strategies, not abstract advice. Draw concrete examples from this list when the chart supports it: solitude, movement, journaling, truth-telling, rest, creative expression, time in nature, clear boundaries, water, music, slow meals, prayer or quiet ritual, sleep. Tell the user actual things they can do today.

Then SUMMARY: one practical, behavioral instruction for whatToPractice, whatToWatchFor, whatToBuild, whatToGive, plus a final "integration" sentence (default: "Your growth comes from learning how to stay connected to others without losing yourself."). Apply the same jargon ban.

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
        max_tokens: 7000,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error("AI gateway error:", resp.status, errText);
      return new Response(JSON.stringify({ agreements: makeFallbackAgreements({ chartName, placements, houses, aspects }), fallback: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";

    const normalizeAgreements = (value: any) => {
      const fallback = makeFallbackAgreements({ chartName, placements, houses, aspects });
      const result: any = { summary: { ...fallback.summary } };
      const asArray = (input: unknown, fallbackItems: string[]) => {
        const raw = Array.isArray(input) ? input : [];
        const cleaned = raw.map((item) => cleanPlainLanguage(String(item)).replace(/^-\s*/, "").trim()).filter(Boolean);
        return (cleaned.length ? cleaned : fallbackItems).slice(0, 5);
      };
      for (const key of sectionKeys) {
        const source = value?.[key];
        const fallbackSection = fallback[key as SectionKey];
        const fallbackExamples = fallbackSection.interpretation.match(/\*\*Real-Life Examples\*\*\s*([\s\S]*?)\n\n\*\*Recognition Check\*\*/)?.[1]
          ?.split("\n").map((item) => item.replace(/^-\s*/, "").trim()).filter(Boolean) || [];
        const fallbackRecognition = fallbackSection.question.split("\n").filter((item) => item.trim().startsWith("-")).map((item) => item.replace(/^-\s*/, "").trim());
        const structuredInterpretation = source?.astrology || source?.plainEnglish || source?.examples || source?.recognition
          ? `**Astrology**\n${cleanPlainLanguage(String(source?.astrology || "This section uses the strongest listed chart markers for this agreement."))}\n\n**Plain English**\n${cleanPlainLanguage(String(source?.plainEnglish || fallbackSection.interpretation.match(/\*\*Plain English\*\*\s*([\s\S]*?)\n\n\*\*Real-Life Examples\*\*/)?.[1] || "This pattern may show up in real choices, relationships, and emotional habits."))}\n\n**Real-Life Examples**\n${asArray(source?.examples, fallbackExamples).map((item) => `- ${item}`).join("\n")}\n\n**Recognition Check**\nThis may fit if:\n${asArray(source?.recognition, fallbackRecognition).map((item) => `- ${item}`).join("\n")}`
          : String(source?.interpretation || fallbackSection.interpretation);
        const interpretation = cleanPlainLanguage(structuredInterpretation);
        const recognition = cleanPlainLanguage(
          source?.recognition
            ? `This may fit if:\n${asArray(source.recognition, fallbackRecognition).map((item) => `- ${item}`).join("\n")}`
            : String(source?.question || extractRecognition(interpretation) || fallbackSection.question),
        );
        result[key] = { interpretation, question: recognition.replace(/^\*\*Recognition Check\*\*\s*/i, "").trim() };
      }
      const s: any = value?.summary || {};
      result.summary = {
        whatToPractice: cleanPlainLanguage(String(s.whatToPractice || s.coreLesson || fallback.summary.whatToPractice)),
        whatToWatchFor: cleanPlainLanguage(String(s.whatToWatchFor || s.coreWound || fallback.summary.whatToWatchFor)),
        whatToBuild: cleanPlainLanguage(String(s.whatToBuild || s.corePurpose || fallback.summary.whatToBuild)),
        whatToGive: cleanPlainLanguage(String(s.whatToGive || s.coreLegacy || fallback.summary.whatToGive)),
        integration: cleanPlainLanguage(String(s.integration || (fallback.summary as any).integration || "Your growth comes from learning how to stay connected to others without losing yourself.")),
      };
      return result;
    };

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
      console.error("soul-agreements JSON parse failed; using deterministic fallback. Snippet:", String(content).slice(0, 300));
      parsed = makeFallbackAgreements({ chartName, placements, houses, aspects });
    }

    return new Response(JSON.stringify({ agreements: normalizeAgreements(parsed) }), {
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
