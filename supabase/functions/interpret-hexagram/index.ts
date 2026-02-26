import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, primaryHexagram, transformedHexagram, changingLines, style } = await req.json();
    const isNovice = style === 'novice';

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const changingLinesText = changingLines && changingLines.length > 0
      ? `Changing lines at positions: ${changingLines.join(", ")}. These lines transform the primary hexagram into the future hexagram.`
      : "No changing lines — the situation is stable.";

    const transformedText = transformedHexagram
      ? `\n\nFUTURE/TRANSFORMED HEXAGRAM:\n- Number: ${transformedHexagram.number}\n- Name: ${transformedHexagram.name} (${transformedHexagram.chinese})\n- Judgment: ${transformedHexagram.judgment}\n- Image: ${transformedHexagram.image}\n- Meaning: ${transformedHexagram.meaning}\n- Keywords: ${transformedHexagram.keywords.join(", ")}`
      : "";

    const noviceSystemPrompt = `You are a practical, modern I Ching reader. You translate ancient wisdom into everyday language that anyone can understand.

Rules:
- NO greetings, no "my dear friend," no "let's explore," no filler whatsoever
- NO flowery eastern mysticism language. No "the waters of the abyss," no "the superior man," no "the sage"
- Write like you're texting a smart friend — casual, clear, direct
- Answer their question directly in the FIRST sentence — yes, no, wait, or it depends
- Use **bold** for key takeaways
- Use bullet points to break things down
- If they asked about a job, talk about the job. If about love, talk about love
- Translate every symbol into a real-life example. "Water over Water" → "You're dealing with back-to-back challenges — like one problem isn't even done before the next shows up"
- 150-250 words max
- End with a bold **Bottom Line:** one-sentence verdict
- Be honest — if the answer is no, say no`;

    const proSystemPrompt = `You are a modern, psychologically-informed I Ching reader. You translate traditional hexagram wisdom into clear, actionable life guidance. Think therapist meets strategist — not monk on a mountain.

Rules:
- NO greetings, no "my dear friend," no "let's dive in," no warm-up sentences
- NO archaic language. Never say "the superior man," "the abyss," "the sage counsels," or any fortune-cookie phrasing
- Write in clear, contemporary English. Think New Yorker article, not ancient scroll
- Start immediately with the answer to their question
- Translate EVERY symbol into plain behavioral terms:
  - "Water" = emotional depth, uncertainty, things you can't fully control
  - "Mountain" = boundaries, pause, knowing when to stop
  - "Thunder" = sudden change, wake-up call, energy burst
  - "Wind" = gradual influence, persistence, flexibility
  - "Fire" = clarity, visibility, passion that can burn out
  - "Lake" = joy, connection, but also excess if unchecked
  - "Heaven" = authority, ambition, big-picture thinking
  - "Earth" = patience, support, doing the groundwork
- If they asked about a job, talk about the job. If about a relationship, talk about the relationship
- Use the changing lines to show trajectory — where things are heading
- Include specific advice: what to do, what to avoid, what to watch for
- End with a clear, actionable takeaway
- 400-600 words, paragraph form
- Be honest — the I Ching does not always say yes`;

    const systemPrompt = isNovice ? noviceSystemPrompt : proSystemPrompt;

    const hasQuestion = question && question.trim().length > 0;

    const userPrompt = hasQuestion
      ? `The person asked: "${question}"

PRIMARY HEXAGRAM (Where they are now):
- Number: ${primaryHexagram.number}
- Name: ${primaryHexagram.name} (${primaryHexagram.chinese})
- Judgment: ${primaryHexagram.judgment}
- Image: ${primaryHexagram.image}
- Meaning: ${primaryHexagram.meaning}
- Keywords: ${primaryHexagram.keywords.join(", ")}
${changingLinesText}
${transformedText}

Give a reading that DIRECTLY answers their specific question. Every paragraph should relate back to what they asked. Translate all imagery into plain terms they can apply to their situation today. If there is a transformed hexagram, explain what's shifting and what that means for their question.`
      : `No specific question was asked. Give a general life reading — a snapshot of where they are right now and what energy is present.

PRIMARY HEXAGRAM (Current energy):
- Number: ${primaryHexagram.number}
- Name: ${primaryHexagram.name} (${primaryHexagram.chinese})
- Judgment: ${primaryHexagram.judgment}
- Image: ${primaryHexagram.image}
- Meaning: ${primaryHexagram.meaning}
- Keywords: ${primaryHexagram.keywords.join(", ")}
${changingLinesText}
${transformedText}

Give a reading about what this hexagram says about their current chapter of life. What themes are active? What should they pay attention to? If there is a transformed hexagram, explain where things are heading. Keep it practical and grounded — this should feel like advice from a wise friend, not a fortune cookie.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("interpret-hexagram error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
