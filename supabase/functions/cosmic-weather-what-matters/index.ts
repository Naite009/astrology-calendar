// cosmic-weather-what-matters
// Generates 3–5 "What Matters Most" items for today, grounded in:
//   - the user's full natal chart (planets/signs/houses/degrees)
//   - the FULL pre-calculated transit list for the day (planet → natal aspects
//     across ALL planets, not just Moon hits)
//
// Hard rule: every item must cite a transit (transitPlanet, aspect,
// natalPlanet, orb, natalSign, natalHouse) that is present in the input
// `transits` array. Items that fail this whitelist are dropped server-side.
//
// Returns: { items: [{ headline, body, transitKey, orb, natalHouse }] }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NatalPlanet {
  name: string;
  sign: string;
  degree: number;
  minutes?: number;
  house?: number | null;
  retrograde?: boolean;
}

interface TransitItem {
  transitPlanet: string;
  aspect: string;
  natalPlanet: string;
  orb: string | number;
  natalSign?: string;
  natalHouse?: number | null;
  applying?: boolean;
}

interface Body {
  natalPlanets: NatalPlanet[];           // entire chart
  houseCusps?: Record<string, { sign: string; degree: number }>;
  stelliums?: Array<{ sign: string; planets: string[]; house?: number | null }>;
  loadedHouses?: Array<{ house: number; planets: string[] }>;
  transits: TransitItem[];               // FULL day transit list
  moonHouseToday?: number | null;
  dateLabel: string;
  recipientName?: string;
}

const SYSTEM = `You write the "What Matters Most" section of a personal daily astrology email. The reader is one specific person. Your only job: pick the 3 to 5 most significant things happening in THEIR chart today and explain them in plain, grounded language.

HARD RULES (non-negotiable)
1. You may ONLY reference transits that appear in the TRANSITS list provided. Do not invent any transit. Do not "remember" a transit from training.
2. Every item must cite a real transit by exact transitKey (format: "{transitPlanet}|{aspect}|{natalPlanet}"). If you can't point to one in TRANSITS, do not write the item.
3. Use the natal sign/house/degree EXACTLY as given in NATAL_PLANETS. No inference.
4. The Moon is one input among many. Prioritize: outer-planet transits to angles, luminaries, chart ruler, and personal planets; tight orbs (under 3°); applying aspects; loaded houses; stelliums.
5. Plain language. 3rd-grade reading level. Describe what the person will FEEL, NOTICE, or DO. No jargon. No "energies" / "archetypal" / "shadow work" / "transformation journey". Never use em dashes.
6. Each item: one short headline (under 14 words, naming the transit and the natal house in plain English), then 2–3 sentences of body that say what it actually feels like and where it tends to land in daily life.

OUTPUT FORMAT
Return ONLY a JSON object, no prose around it:
{
  "items": [
    {
      "transitKey": "Saturn|square|Sun",
      "headline": "Saturn is squaring your natal Sun in the 10th house.",
      "body": "..."
    }
  ]
}

Choose 3 to 5 items, ordered by significance.`;

function pickTopTransits(transits: TransitItem[]): TransitItem[] {
  // Light pre-filter: tight orbs first, then prefer outer planets and angles/luminaries.
  const weight = (t: TransitItem) => {
    const orb = parseFloat(String(t.orb)) || 99;
    const slow = ["Pluto","Neptune","Uranus","Saturn","Jupiter","Chiron","NorthNode","SouthNode"].includes(t.transitPlanet) ? -2 : 0;
    const personal = ["Sun","Moon","Mercury","Venus","Mars","Ascendant","Midheaven","Descendant","IC"].includes(t.natalPlanet) ? -1 : 0;
    return orb + slow + personal;
  };
  return [...transits].sort((a,b)=>weight(a)-weight(b)).slice(0, 12);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const body = (await req.json()) as Body;
    const { natalPlanets = [], transits = [], moonHouseToday, stelliums = [], loadedHouses = [], dateLabel, recipientName } = body;

    if (!Array.isArray(natalPlanets) || !Array.isArray(transits)) {
      return new Response(JSON.stringify({ error: "natalPlanets and transits arrays required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const validKeys = new Set(transits.map(t => `${t.transitPlanet}|${t.aspect}|${t.natalPlanet}`));
    const top = pickTopTransits(transits);

    const natalBlock = natalPlanets.map(p =>
      `- ${p.name}: ${p.sign} ${p.degree}°${p.minutes ?? 0}'${p.retrograde ? " R" : ""}${p.house != null ? `, house ${p.house}` : ""}`
    ).join("\n");

    const transitsBlock = top.map(t =>
      `- key="${t.transitPlanet}|${t.aspect}|${t.natalPlanet}" | ${t.transitPlanet} ${t.aspect} natal ${t.natalPlanet} (${t.natalSign || "?"}, house ${t.natalHouse ?? "?"}) · orb ${t.orb}°${t.applying ? " applying" : ""}`
    ).join("\n");

    const stelliumBlock = stelliums.length ? "STELLIUMS:\n" + stelliums.map(s => `- ${s.sign}${s.house ? ` (house ${s.house})` : ""}: ${s.planets.join(", ")}`).join("\n") : "";
    const loadedBlock = loadedHouses.length ? "LOADED HOUSES:\n" + loadedHouses.map(h => `- house ${h.house}: ${h.planets.join(", ")}`).join("\n") : "";

    const userPrompt = [
      `Date: ${dateLabel}.`,
      recipientName ? `Reader: ${recipientName}.` : "",
      moonHouseToday ? `Moon spends most of today in the reader's house ${moonHouseToday}.` : "",
      "",
      "NATAL_PLANETS (source of truth for sign/house/degree):",
      natalBlock,
      "",
      "TRANSITS (the ONLY transits you may reference; copy transitKey verbatim):",
      transitsBlock || "(none)",
      "",
      stelliumBlock,
      loadedBlock,
      "",
      "Return JSON only.",
    ].filter(Boolean).join("\n");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      console.error("Lovable AI error:", resp.status, txt);
      return new Response(JSON.stringify({ error: `AI error ${resp.status}`, items: [] }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await resp.json();
    let text = (data?.choices?.[0]?.message?.content || "").trim();
    let parsed: any = {};
    try { parsed = JSON.parse(text); } catch {
      const m = text.match(/\{[\s\S]*\}/);
      if (m) { try { parsed = JSON.parse(m[0]); } catch {} }
    }

    const rawItems: any[] = Array.isArray(parsed?.items) ? parsed.items : [];
    // STRICT WHITELIST: drop any item whose transitKey isn't in the input transits.
    const items = rawItems
      .filter(it => it && typeof it.transitKey === "string" && validKeys.has(it.transitKey))
      .map(it => {
        const t = transits.find(x => `${x.transitPlanet}|${x.aspect}|${x.natalPlanet}` === it.transitKey)!;
        return {
          transitKey: it.transitKey,
          headline: String(it.headline || "").replace(/—/g, ", ").trim(),
          body: String(it.body || "").replace(/—/g, ", ").trim(),
          orb: t.orb,
          natalHouse: t.natalHouse ?? null,
        };
      })
      .slice(0, 5);

    return new Response(JSON.stringify({ items, droppedCount: rawItems.length - items.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("cosmic-weather-what-matters error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown", items: [] }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
