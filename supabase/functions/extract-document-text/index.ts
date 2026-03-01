import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId, filePath } = await req.json();

    if (!documentId || !filePath) {
      return new Response(
        JSON.stringify({ error: "documentId and filePath are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update status to extracting
    await supabase
      .from("astrology_documents")
      .update({ extraction_status: "extracting" })
      .eq("id", documentId);

    // Generate a signed URL instead of downloading the file (avoids memory issues)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("astrology-docs")
      .createSignedUrl(filePath, 3600);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      await supabase
        .from("astrology_documents")
        .update({ extraction_status: "error" })
        .eq("id", documentId);
      throw new Error(`Failed to create signed URL: ${signedUrlError?.message}`);
    }

    // Use Gemini with the file URL — no need to load into memory
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a document text extractor. Extract ALL text content from the uploaded document. 
Preserve the structure: chapter headings, section titles, paragraphs, lists, and tables.
Use markdown formatting to maintain hierarchy (# for main titles, ## for chapters, ### for sections).
Do NOT summarize or interpret — extract the complete text as faithfully as possible.
If the document is very long, extract as much as you can.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all text from this document. Preserve structure and formatting.",
              },
              {
                type: "image_url",
                image_url: {
                  url: signedUrlData.signedUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 100000,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI extraction error:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        await supabase
          .from("astrology_documents")
          .update({ extraction_status: "rate_limited" })
          .eq("id", documentId);
        return new Response(
          JSON.stringify({ error: "Rate limited — please try again in a minute" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        await supabase
          .from("astrology_documents")
          .update({ extraction_status: "error" })
          .eq("id", documentId);
        return new Response(
          JSON.stringify({ error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("astrology_documents")
        .update({ extraction_status: "error" })
        .eq("id", documentId);
      throw new Error(`AI extraction failed: ${aiResponse.status} - ${errText}`);
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || "";

    if (!extractedText) {
      await supabase
        .from("astrology_documents")
        .update({ extraction_status: "error" })
        .eq("id", documentId);
      throw new Error("No text extracted from document");
    }

    // Store extracted text
    const { error: updateError } = await supabase
      .from("astrology_documents")
      .update({
        extracted_text: extractedText,
        extraction_status: "complete",
      })
      .eq("id", documentId);

    if (updateError) {
      throw new Error(`Failed to store extracted text: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        textLength: extractedText.length,
        preview: extractedText.substring(0, 500),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Error in extract-document-text:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
