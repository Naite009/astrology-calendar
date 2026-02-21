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

    const noviceSystemPrompt = `You are a no-nonsense I Ching reader. Give straight answers with zero fluff.

Rules:
- NO greetings, no "my dear friend," no "let's explore," no filler whatsoever
- Answer their question directly in the FIRST sentence — yes, no, wait, or it depends
- Use **bold** for key takeaways
- Use bullet points to break things down
- Plain language — no jargon, no poetic fluff
- If they asked about a job, talk about the job. If about love, talk about love
- 150-250 words max
- End with a bold **Bottom Line:** one-sentence verdict
- Be honest — if the answer is no, say no`;

    const proSystemPrompt = `You are a master-level I Ching reader. Give thorough, professional readings with zero filler.

Rules:
- NO greetings, no "my dear friend," no "let's dive in," no warm-up sentences
- Start immediately with the answer to their question
- Be specific and practical — relate every symbol directly to their question
- If they asked about a job, talk about the job. If about a relationship, talk about the relationship
- Use the changing lines to show trajectory — where things are heading
- Include specific advice: what to do, what to avoid, what to watch for
- End with a clear, actionable takeaway
- 400-600 words, paragraph form
- Be honest — the I Ching does not always say yes`;

    const systemPrompt = isNovice ? noviceSystemPrompt : proSystemPrompt;

    const userPrompt = `The querent asked: "${question || "No specific question — give a general life reading."}"

PRIMARY HEXAGRAM (Present Situation):
- Number: ${primaryHexagram.number}
- Name: ${primaryHexagram.name} (${primaryHexagram.chinese})
- Judgment: ${primaryHexagram.judgment}
- Image: ${primaryHexagram.image}
- Meaning: ${primaryHexagram.meaning}
- Keywords: ${primaryHexagram.keywords.join(", ")}
${changingLinesText}
${transformedText}

Give a full, deeply personal interpretation that directly answers their question using the wisdom of these hexagrams. Explain what each hexagram means IN THE CONTEXT of their specific question. If there is a transformed hexagram, explain the journey from present to future.`;

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
