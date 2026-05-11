// Family System Reading — integrated, group-level reading for 2+ family members.
// All deterministic data is computed on the client. AI writes only prose.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface SharedPlacement {
  planet: string;
  sign: string;
  members: string[];
}

interface RoleAssignment {
  name: string;
  role: string;
  systemRole: string;
  reason: string;
}

interface CrossAspect {
  fromName: string;
  fromPlanet: string;
  fromSign?: string;
  toName: string;
  toPlanet: string;
  toSign?: string;
  aspect: string;
  symbol: string;
  orb: number;
}

interface RequestBody {
  members: { name: string; role: string }[];
  memberSummaries: string[];
  moonElements: { fire: number; earth: number; air: number; water: number };
  sunElements: { fire: number; earth: number; air: number; water: number };
  dominantMoonElement: string | null;
  sharedPlacements: SharedPlacement[];
  roles: RoleAssignment[];
  topFriction: CrossAspect[];
  topBridges: CrossAspect[];
}

interface ReadingPayload {
  familyEssence: string;
  rolesNarrative: { name: string; line: string }[];
  emotionalClimate: string;
  whereEveryoneMeets: string;
  pressurePoints: { headline: string; body: string }[];
  bridges: { headline: string; body: string }[];
  practice: string;
}

function fmtAspect(a: CrossAspect): string {
  return `${a.fromName}'s ${a.fromPlanet} in ${a.fromSign ?? "?"} ${a.symbol} ${a.toName}'s ${a.toPlanet} in ${a.toSign ?? "?"} (${a.aspect}, orb ${a.orb.toFixed(1)}°)`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;
    if (!Array.isArray(body?.members) || body.members.length < 2) {
      return new Response(JSON.stringify({ error: "Need at least 2 members" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const memberList = body.members
      .map((m) => `${m.name} (${m.role})`)
      .join(", ");

    const moonBreakdown = `Fire: ${body.moonElements.fire}, Earth: ${body.moonElements.earth}, Air: ${body.moonElements.air}, Water: ${body.moonElements.water}`;
    const sunBreakdown = `Fire: ${body.sunElements.fire}, Earth: ${body.sunElements.earth}, Air: ${body.sunElements.air}, Water: ${body.sunElements.water}`;

    const sharedLines = body.sharedPlacements
      .map((s) => `- ${s.members.join(" and ")} all have ${s.planet} in ${s.sign}`)
      .join("\n") || "(none)";

    const rolesLines = body.roles
      .map((r) => `- ${r.name} (${r.role}): ${r.systemRole} — ${r.reason}`)
      .join("\n");

    const frictionLines = body.topFriction.map(fmtAspect).join("\n") || "(none significant)";
    const bridgeLines = body.topBridges.map(fmtAspect).join("\n") || "(none significant)";

    const systemPrompt = `You are an experienced family astrologer writing a single integrated reading about how a whole family functions as one system. Not pair by pair. The whole group as a unit.

ABSOLUTE VOICE RULES:
1. Plain English. Sixth-grade reading level. Sound like a wise human friend who happens to know astrology.
2. NEVER use em dashes. Use commas, periods, colons, or parentheses.
3. NEVER use words: wound, heal, vibration, shadow, archetypal, energies, miscues, blurs, clouds, afflicts, harshly, integrate, liminal, sacred, divine, soul-chosen, transformation, honest.
4. Describe what the family will FEEL, DO, or NOTICE. Never abstract verbs like "rebuilds from within" or "dissolves edges".
5. Squares and oppositions are growth, not damage. Frame as "where this family has to translate" or "where the friction lives", not "where you hurt each other".
6. Trines, sextiles, and conjunctions are gifts. Name them and tell the family how to LEAN ON them.
7. Refer to people by their first names. Never "the parent" or "the child".
8. HIERARCHY IS REAL. Parents lead, set tone, and hold the container. Children participate at their developmental level. Never write practices, roles, or climate language as if everyone is a peer. Do not assign emotional regulation work to children. Do not ask a child to "give the parent feedback" or "hold space" for the parent. The parent is the one who steers; the child responds.
9. NEVER write generic parenting advice ("use I-feel statements", "active listening", "validate feelings", "schedule a weekly check-in", "create a safe space"). If the practice could appear in any parenting book without the chart data, it is wrong.
10. Output ONLY valid JSON matching the schema. No markdown fences. No commentary.

JSON SCHEMA (return exactly this shape):
{
  "familyEssence": string (3 sentences naming the overall character of this family as a system, citing at least one specific placement pattern from the data),
  "rolesNarrative": [
    { "name": "PersonName", "line": string (one sentence describing the role they play in the group dynamic in plain real-life terms) }
  ],
  "emotionalClimate": string (one short paragraph, 3-4 sentences, on what it actually feels like to live in this household day-to-day, grounded in the Moon element breakdown),
  "whereEveryoneMeets": string (one short paragraph, 3-4 sentences, naming shared signs and conjunctions across multiple members and what that creates as a household pattern. If no shared placements exist, write about the dominant Sun or Moon element as the meeting point.),
  "pressurePoints": [
    { "headline": string (short, names who and what), "body": string (2-3 sentences in plain English on how the friction shows up in real life and what it asks of the family) }
  ],
  "bridges": [
    { "headline": string, "body": string (2-3 sentences on how this gift shows up in real life and how the family can lean on it more) }
  ],
  "practice": string (one short paragraph, 4-6 sentences. MUST do all of the following: (a) Open by NAMING the specific signature you are targeting, e.g. "Because [ParentName]'s Saturn squares [ChildName]'s Moon" or "Because three of you have Moons in water signs". (b) The action must be something only THIS family would do given THIS data, not generic parenting advice. (c) Assign roles by hierarchy: state what the PARENT(S) initiate and hold, and what the CHILD(REN) are invited to do at their level. Do not flatten the family into peers. (d) Be a concrete weekly or daily ritual with a specific trigger, time, or place, not an abstract principle. (e) Reference at least one real placement or aspect from the data by name.)
}

Generate exactly one rolesNarrative entry per member listed. Generate 2 to 3 pressurePoints and 2 to 3 bridges. If there are no significant friction or bridge aspects, name that honestly in the body and skip filler.`;

    const parents = body.members.filter((m) => /parent|mother|father|mom|dad|stepparent|stepmother|stepfather|guardian/i.test(m.role));
    const children = body.members.filter((m) => /child|son|daughter|stepchild|kid/i.test(m.role));
    const hierarchyLine = parents.length && children.length
      ? `PARENTS (lead, set tone, hold container): ${parents.map((p) => p.name).join(", ")}\nCHILDREN (respond, participate at their level): ${children.map((c) => c.name).join(", ")}`
      : `(no clear parent/child split in this group; treat as adult family members but still honor any age or role differences listed)`;

    const userPrompt = `FAMILY MEMBERS: ${memberList}

${hierarchyLine}

MEMBER CHARTS:
${body.memberSummaries.join("\n\n")}

MOON ELEMENT BREAKDOWN: ${moonBreakdown}
SUN ELEMENT BREAKDOWN: ${sunBreakdown}
DOMINANT MOON ELEMENT: ${body.dominantMoonElement ?? "mixed, no dominant"}

SHARED PLACEMENTS (2+ members with same planet in same sign):
${sharedLines}

DETERMINISTIC ROLE ASSIGNMENTS (use these as a starting point but write in your own voice):
${rolesLines}

TIGHTEST FRICTION ASPECTS (squares and oppositions, tightest first):
${frictionLines}

TIGHTEST BRIDGE ASPECTS (trines, sextiles, conjunctions, tightest first):
${bridgeLines}

Write the integrated family reading. Follow the schema exactly. Use the actual names and placements from the data. Do not invent aspects or placements that are not listed above.`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResp.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await aiResp.text();
      console.error("AI error:", aiResp.status, t);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const raw = aiData?.choices?.[0]?.message?.content ?? "{}";
    let payload: ReadingPayload;
    try {
      payload = JSON.parse(raw);
    } catch (e) {
      console.error("Bad AI JSON:", raw);
      return new Response(JSON.stringify({ error: "AI returned malformed reading" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("family-system-reading error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
