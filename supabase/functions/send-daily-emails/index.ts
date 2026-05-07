import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FROM = "laurenlevin21@gmail.com";
const APP_PASSWORD = Deno.env.get("GMAIL_APP_PASSWORD")!;

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

function personalEmail(name: string, dateStr: string) {
  return {
    subject: `${name}'s Personal Cosmic Weather — ${dateStr}`,
    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
      <h1 style="color:#6B46C1">Good morning, ${name}</h1>
      <p style="font-size:14px;color:#888">${dateStr}</p>
      <h2>Your personal weather today</h2>
      <p>This is your personalized daily reading. Content will be tailored to your natal chart.</p>
      <p style="margin-top:30px;font-size:12px;color:#999">Sent with love from your Astrology Calendar</p>
    </div>`,
  };
}

function generalEmail(name: string, dateStr: string) {
  return {
    subject: `Today's Cosmic Weather — ${dateStr}`,
    html: `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:20px;color:#333">
      <h1 style="color:#6B46C1">Cosmic Weather</h1>
      <p style="font-size:14px;color:#888">${dateStr}</p>
      <h2>What the sky is doing today</h2>
      <p>Hi ${name}, here is the general cosmic weather for everyone today.</p>
      <p style="margin-top:30px;font-size:12px;color:#999">Sent with love from your Astrology Calendar</p>
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

  try {
    for (const r of RECIPIENTS) {
      for (const builder of [personalEmail, generalEmail]) {
        const { subject, html } = builder(r.name, dateStr);
        try {
          await client.send({
            from: `Astrology Calendar <${FROM}>`,
            to: r.email,
            subject,
            content: "auto",
            html,
          });
          results.push({ to: r.email, subject, ok: true });
        } catch (e) {
          results.push({ to: r.email, subject, ok: false, error: String(e) });
        }
      }
    }
    await client.close();
    return new Response(JSON.stringify({ sentAt: new Date().toISOString(), results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e), results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
