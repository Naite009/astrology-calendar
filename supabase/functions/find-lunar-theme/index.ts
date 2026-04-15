import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      cycleSign, cycleDegree, chartName, natalHouse,
      whatIsSurfacing, balsamicDreams, balsamicMorningThoughts,
      balsamicNeedsToEnd, bodySignals, emotionalReactions,
      surpriseEvent, whatHappened, conversations, synchronicities,
      newMoonFeelings, fatigue, withdrawal,
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Build context from user reflections
    const fragments: string[] = [];
    if (whatIsSurfacing) fragments.push(`What is surfacing: "${whatIsSurfacing}"`);
    if (balsamicDreams) fragments.push(`Dreams: "${balsamicDreams}"`);
    if (balsamicMorningThoughts) fragments.push(`Morning thoughts: "${balsamicMorningThoughts}"`);
    if (balsamicNeedsToEnd) fragments.push(`What needs to end: "${balsamicNeedsToEnd}"`);
    if (bodySignals) fragments.push(`Body signals: "${bodySignals}"`);
    if (emotionalReactions) fragments.push(`Emotional reactions: "${emotionalReactions}"`);
    if (surpriseEvent) fragments.push(`Surprise event: "${surpriseEvent}"`);
    if (whatHappened) fragments.push(`What happened: "${whatHappened}"`);
    if (conversations) fragments.push(`Important conversations: "${conversations}"`);
    if (synchronicities) fragments.push(`Synchronicities: "${synchronicities}"`);
    if (newMoonFeelings) fragments.push(`Emotional theme: "${newMoonFeelings}"`);
    if (fatigue) fragments.push(`Fatigue level: ${fatigue}/10`);
    if (withdrawal) fragments.push(`Withdrawal desire: ${withdrawal}/10`);

    const reflectionContext = fragments.join("\n");

    const systemPrompt = `You are a gentle, emotionally intelligent lunar cycle guide. You help people discover what their current Moon cycle is really about — not by diagnosing or labeling, but by reflecting back what they have shared and suggesting possible themes.

CRITICAL RULES:
- Never present themes as "the answer." Present them as possibilities.
- Use warm, grounded language. No jargon. No dramatic spiritual language.
- Ground every suggestion in something the user actually said or described.
- If the user seems unclear, that is VALID. Do not force clarity.
- Body signals, dreams, repeated thoughts, and emotional charges are your primary evidence.
- Draft intention stems should use "I" language and feel achievable, not grandiose.

HYBRID CLARITY RULE: For each theme: (1) Start with a real-life situation. (2) Describe how it feels. (3) Briefly explain why. Do not say "a cycle of deep inner transformation." Instead: "you may be noticing that things you used to care about just don't matter the same way anymore — it feels like outgrowing something, because this cycle is clearing space for what's actually next."`;

    const userPrompt = `This person is in a ${cycleSign} New Moon cycle at ${cycleDegree}°.${natalHouse ? ` It activates their ${natalHouse}th natal house.` : ""}${chartName ? ` Their name is ${chartName}.` : ""}

Here is what they have shared so far:
${reflectionContext}

Based ONLY on what they shared (do not invent information), generate:

1. THEME CANDIDATES: 2-4 possible emerging themes. For each:
- title: a short, human phrase (3-6 words)
- whySuggested: 1-2 sentences explaining why this theme may be surfacing, grounding it in what the user said
- bodyClues: relevant body signals they mentioned (or empty string if none)
- lifeClues: relevant life events, conversations, or surprises they mentioned (or empty string if none)
- draftIntentionStem: a gentle "I am..." or "I allow..." or "I begin..." statement

2. SHIFT AREAS: 2-3 things that may need to shift. For each:
- area: a short label (2-5 words)
- description: 1 sentence explaining how this showed up in their reflections

Respond in this exact JSON format:
{
  "candidates": [
    { "title": "", "whySuggested": "", "bodyClues": "", "lifeClues": "", "draftIntentionStem": "" }
  ],
  "shiftAreas": [
    { "area": "", "description": "" }
  ]
}`;

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
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("Failed to generate theme suggestions");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      console.error("Failed to parse AI JSON:", content);
      throw new Error("Invalid AI response format");
    }

    return new Response(JSON.stringify({
      candidates: parsed.candidates || [],
      shiftAreas: parsed.shiftAreas || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("find-lunar-theme error:", error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Unknown error",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
