import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { encodeBase64 } from "jsr:@std/encoding/base64";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();

    if (!documentId) {
      return new Response(
        JSON.stringify({ error: "documentId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Validate user token
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    const userId = claimsData?.claims?.sub;

    if (claimsError || !userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ensure the document belongs to the authenticated user
    const { data: document, error: documentError } = await supabase
      .from("astrology_documents")
      .select("id, file_path")
      .eq("id", documentId)
      .eq("user_id", userId)
      .single();

    if (documentError || !document?.file_path) {
      return new Response(
        JSON.stringify({ error: "Document not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update status to extracting
    await supabase
      .from("astrology_documents")
      .update({ extraction_status: "extracting" })
      .eq("id", documentId)
      .eq("user_id", userId);

    // Download file and build a data URL (PDF/Word are not accepted as remote image URLs)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("astrology-docs")
      .download(document.file_path);

    if (downloadError || !fileData) {
      await supabase
        .from("astrology_documents")
        .update({ extraction_status: "error" })
        .eq("id", documentId)
        .eq("user_id", userId);
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    const ext = document.file_path.split(".").pop()?.toLowerCase();
    const mimeType =
      ext === "pdf"
        ? "application/pdf"
        : ext === "doc"
          ? "application/msword"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    const bytes = new Uint8Array(await fileData.arrayBuffer());
    const base64 = encodeBase64(bytes);
    const dataUrl = `data:${mimeType};base64,${base64}`;

    // Use Gemini with a data URL payload (accepted for non-image formats)
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are a document text extractor. Extract ALL text content from the uploaded document.
Preserve structure: chapter headings, section titles, paragraphs, and lists.
Return markdown with headings where useful.
Do NOT summarize. Output extracted text only.`,
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
                  url: dataUrl,
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
          .eq("id", documentId)
          .eq("user_id", userId);
        return new Response(
          JSON.stringify({ error: "Rate limited — please try again in a minute" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        await supabase
          .from("astrology_documents")
          .update({ extraction_status: "error" })
          .eq("id", documentId)
          .eq("user_id", userId);
        return new Response(
          JSON.stringify({ error: "AI credits exhausted" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabase
        .from("astrology_documents")
        .update({ extraction_status: "error" })
        .eq("id", documentId)
        .eq("user_id", userId);
      throw new Error(`AI extraction failed: ${aiResponse.status} - ${errText}`);
    }

    const aiData = await aiResponse.json();
    const extractedText = aiData.choices?.[0]?.message?.content || "";

    if (!extractedText) {
      await supabase
        .from("astrology_documents")
        .update({ extraction_status: "error" })
        .eq("id", documentId)
        .eq("user_id", userId);
      throw new Error("No text extracted from document");
    }

    // Store extracted text
    const { error: updateError } = await supabase
      .from("astrology_documents")
      .update({
        extracted_text: extractedText,
        extraction_status: "complete",
      })
      .eq("id", documentId)
      .eq("user_id", userId);

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
