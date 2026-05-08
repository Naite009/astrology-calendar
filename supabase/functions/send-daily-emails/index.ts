import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FROM = "laurenlevin21@gmail.com";
const APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

const RECIPIENTS = [
  { name: "Lauren", email: "laurenlevin21@gmail.com" },
  { name: "Margie", email: "margiehavens@yahoo.com" },
];

function todayET(): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  }).format(new Date());
}

function todayKeyET(): string {
  // YYYY-MM-DD in America/New_York to match formatLocalDateKey on the client.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find(p => p.type === t)?.value || "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

async function fetchCachedReading(): Promise<{ subject: string; body_html: string } | null> {
  const dateKey = todayKeyET();
  const { data, error } = await supabase
    .from("cosmic_weather_cache")
    .select("subject, body_html, created_at")
    .eq("date_key", dateKey)
    .not("body_html", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("cosmic_weather_cache query error:", error.message);
    return null;
  }
  if (!data?.body_html) return null;
  return { subject: data.subject || `Today's Cosmic Weather`, body_html: data.body_html };
}

function placeholderEmail(name: string, dateStr: string) {
  return {
    subject: `Today's Cosmic Weather — ${dateStr}`,
    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
      <h1 style="color:#6B46C1">Cosmic Weather</h1>
      <p style="font-size:14px;color:#888">${dateStr}</p>
      <p>Hi ${name}, no cosmic weather has been generated for today yet. Open the app to generate today's reading.</p>
    </div>`,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const client = new SMTPClient({
    connection: {
      hostname: "smtp.gmail.com",
      port: 465,
      tls: true,
      auth: { username: FROM, password: APP_PASSWORD },
    },
  });

  const dateStr = todayET();
  const results: any[] = [];
  const cached = await fetchCachedReading();

  try {
    for (const r of RECIPIENTS) {
      const { subject, html } = cached
        ? { subject: cached.subject, html: cached.body_html }
        : placeholderEmail(r.name, dateStr);
      try {
        await client.send({
          from: `Astrology Calendar <${FROM}>`,
          to: r.email,
          subject,
          content: "auto",
          html,
        });
        results.push({ to: r.email, subject, ok: true, usedCache: !!cached });
      } catch (e) {
        results.push({ to: r.email, subject, ok: false, error: String(e) });
      }
    }
    await client.close();
    return new Response(JSON.stringify({ sentAt: new Date().toISOString(), usedCache: !!cached, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
