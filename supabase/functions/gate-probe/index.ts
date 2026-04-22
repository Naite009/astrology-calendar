// Standalone diagnostic: tests REPLIT_GATE_URL/TOKEN from inside the
// Supabase edge runtime (where the real secrets live) and returns the
// result as JSON. No DB writes, no AI calls. Safe to invoke ad-hoc.
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const url = Deno.env.get("REPLIT_GATE_URL");
  const tok = Deno.env.get("REPLIT_GATE_TOKEN");
  const out: any = {
    hasUrl: !!url,
    hasTok: !!tok,
    urlLen: url?.length ?? 0,
    tokLen: tok?.length ?? 0,
    storedHost: "",
    storedPath: "",
    attempts: [] as any[],
  };

  if (!url || !tok) {
    return new Response(JSON.stringify({ ...out, error: "missing_secrets" }, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }

  try { const u = new URL(url); out.storedHost = u.host; out.storedPath = u.pathname; } catch { /* */ }

  const base = url.replace(/\/$/, "").replace(/\/check-reading$/i, "");
  const candidates = Array.from(new Set([
    `${base}/check-reading`,
    `${base}/api/check-reading`,
  ]));

  for (const c of candidates) {
    const t0 = Date.now();
    let path = "";
    try { path = new URL(c).pathname; } catch { /* */ }
    try {
      const r = await fetch(c, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ sections: [], subject: "probe" }),
        signal: AbortSignal.timeout(8000),
      });
      const txt = await r.text();
      out.attempts.push({
        path,
        status: r.status,
        ms: Date.now() - t0,
        body_snippet: txt.slice(0, 300),
      });
    } catch (e) {
      out.attempts.push({
        path,
        threw: true,
        error_name: (e as Error).name,
        error_msg: (e as Error).message,
        ms: Date.now() - t0,
      });
    }
  }

  return new Response(JSON.stringify(out, null, 2), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
