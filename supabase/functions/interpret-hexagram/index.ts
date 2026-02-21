import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { question, primaryHexagram, transformedHexagram, changingLines } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const changingLinesText = changingLines && changingLines.length > 0
      ? `Changing lines at positions: ${changingLines.join(", ")}. These lines transform the primary hexagram into the future hexagram.`
      : "No changing lines — the situation is stable.";

    const transformedText = transformedHexagram
      ? `\n\nFUTURE/TRANSFORMED HEXAGRAM:\n- Number: ${transformedHexagram.number}\n- Name: ${transformedHexagram.name} (${transformedHexagram.chinese})\n- Judgment: ${transformedHexagram.judgment}\n- Image: ${transformedHexagram.image}\n- Meaning: ${transformedHexagram.meaning}\n- Keywords: ${transformedHexagram.keywords.join(", ")}`
      : "";

    const systemPrompt = `You are a master I Ching scholar and counselor with 40 years of experience. You provide deeply personal, specific, and practical readings that directly address the querent's question.

Your style:
- Speak directly to the person ("you")
- Be specific and practical — relate every symbol directly to their question
- Explain the hexagram's wisdom as it APPLIES to their situation, not in abstract terms
- If they asked about a job, talk about the job. If they asked about a relationship, talk about the relationship
- Use the changing lines to show the trajectory — where things are heading
- Include specific advice: what to do, what to avoid, what to watch for
- End with a clear, actionable takeaway
- Write 400-600 words
- Use paragraph form, not bullet points
- Be warm but honest — the I Ching does not always say "yes"`;

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
