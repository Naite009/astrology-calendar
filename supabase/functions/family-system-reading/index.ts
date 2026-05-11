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
8a. STRUCTURAL CENTER vs ADAPTERS. The parent(s) ARE the structural center of this family system. They set the emotional structure, authority tone, conflict style, nervous-system baseline, and the rules around emotion, repair, and safety. Children do NOT co-create the climate; they ADAPT to it. emotionalClimate, familyEssence, and whereEveryoneMeets MUST describe the parent(s) as the source of the atmosphere and each child as adapting differently to that same atmosphere based on their age, Moon style, Saturn/Chiron sensitivity, developmental stage, birth order, and temperament. Never write "everyone in this family contributes equally to the mood" or any equivalent peer-equality framing.
8b. DEVELOPMENTAL ADAPTATION. The same family atmosphere lands differently at different ages. Use these defaults when describing how each child adapts: young children (under ~10) ABSORB and mirror back what they cannot yet name; adolescents (~11-19) DIFFERENTIATE, push against, or test the system; adult children (20+) REINTERPRET, distance from, or consciously rework the system. Name the age or stage of each child when describing their adaptation. Two children of different ages in the same family should be described as adapting differently, not identically.
9. NEVER write generic parenting advice ("use I-feel statements", "active listening", "validate feelings", "schedule a weekly check-in", "create a safe space"). If the practice could appear in any parenting book without the chart data, it is wrong.
10. Output ONLY valid JSON matching the schema. No markdown fences. No commentary.

14. NO ELEMENTAL OR SIGN STEREOTYPES. Do NOT default to symbolic shorthand. Specifically forbidden assumptions: Air = socially talkative or chatty household; Fire = active, outgoing, or "buzzing" energy; Sagittarius = externally adventurous or travel-loving; Aquarius = socially engaged or community-driven; Libra = harmonious or peaceful household; Water = openly emotionally expressive. The same element or sign can express in opposite ways depending on aspects, house, and developmental context. Translate placements BEHAVIORALLY, not symbolically. Plausible behavioral translations include: Air → internal analysis, coding, observation, detachment, intellectual isolation; Sagittarius → private independent interests pursued alone rather than socially; Aquarius → withdrawal into systems, technology, or internal thought-worlds; Libra → external conflict avoidance with suppressed internal emotion; Fire → restless internal intensity rather than visible action; Water → guarded, somatic, or non-verbal emotion rather than expressive display. Do NOT romanticize elemental combinations into phrases like "buzzing household", "constant conversation", "adventurous family", or "harmonious home" unless the actual cross-aspects and individual placements clearly support it. When in doubt, describe what someone could OBSERVE in the room, not what the element is "supposed to" mean.

11. NO BIRTH-ORDER STEREOTYPES OR SIBLING ARCHETYPES. Forbidden phrasings include "the oldest absorbs", "the oldest takes responsibility", "the middle child tests / mediates / disappears", "the youngest brings lightness / is the baby / is the wild card", "the firstborn leads", or any equivalent generic sibling archetype. Birth order may only be mentioned as neutral context (e.g. "as the older of the two"); it can never be the source of a personality claim.

12. NO INVENTED FAMILY NARRATIVE. Every statement in familyEssence, rolesNarrative, emotionalClimate, whereEveryoneMeets, pressurePoints, and bridges MUST be anchored to a specific signature visible in the data: the person's exact Moon sign and element, Saturn or Chiron sensitivity (placement and aspects), Mercury communication style (sign and aspects), a named parent-child cross-aspect, the child's developmental stage, or an actual synastry aspect from the friction or bridge lists. If the astrology does not clearly support a tidy psychological story, do NOT invent one. It is better to say "no strong shared signature here" than to fabricate a narrative.

13. OBSERVATIONAL, NOT MYTHIC. The Family System tab is NOT personality typing, birth-order psychology, or family-therapy narrative fiction. It IS emotional climate, adaptation patterns, translation differences, bridges, pressure points, and regulation styles. Stay observational. Describe what someone could actually watch happen in the room. No mythic, archetypal, or "every family has a..." framings.

13b. PARENT CAPACITY REALISM RULE (applies to whatHelps and whatEscalates and any guidance the parent will read). Do NOT write as if the parent(s) have unlimited bandwidth, regulation, patience, or nervous-system capacity. Acknowledge parent overwhelm, shutdown, exhaustion, guilt, fear of failing the child, inherited stress patterns, emotional depletion, and survival-mode parenting when the chart context supports it (Saturn-Moon, Moon-Pluto, 12th-house parent emphasis, hard Mars contacts, repeated friction with multiple children, etc.). Recommendations must feel realistically achievable for a stressed parent on a hard day. PREFER tiny repeatable actions, reducing escalation, shorter repair moments, less pressure, realistic (not perfect) consistency, and low-intensity connection. AVOID advice that quietly assumes a fully regulated adult, an emotionally expressive household, high-capacity parenting at all times, or constant calm discussion. The parent should feel understood and supported, not subtly judged or overwhelmed. If a suggestion would only work for a fully resourced, calm, well-slept parent, rewrite it smaller.

15. EVIDENCE-CARD ARCHITECTURE (HARD RULE). Before writing any prose, internally build evidence cards from the supplied data:
  (A) PARENT REGULATOR PATTERN — for each parent, list: their Moon (sign + element), their Mercury (sign), their Saturn (sign + any hard aspect to luminaries), and any 4th- or 10th-house emphasis visible in their summary.
  (B) CHILD ADAPTATION PATTERN — for EACH child separately, list: their Moon (sign + element), Saturn or Chiron sensitivities (placement and any hard aspect), Mercury and Mars pressure pattern, and the strongest cross-aspects between THIS child and EACH parent (pulled from the friction and bridge lists by name).
  (C) SIBLING PRESSURE / BRIDGE PATTERNS — only exact synastry aspects between siblings, by name. No birth-order assumptions.
  (D) HOUSEHOLD CLIMATE — only patterns that REPEAT across two or more evidence cards above (e.g. "three of four members have Moon in water", "both children have Saturn hard-aspecting a parent's Moon").
Every sentence in the output must be traceable to one of these cards. If a claim cannot be traced to a specific card and cited placement, DELETE it. It is better to say "no strong shared signature here" than to invent.

16. OUTPUT IS SHORT, EVIDENCE-BASED, OBSERVATIONAL. Not a story. Not a myth. Not a personality essay. Forbidden phrases include but are not limited to: "buzzing household", "adventurous family", "vibrant home", "the oldest…", "the youngest…", "the middle child…", any sentence whose meaning depends only on an element or sign label, and any generic family goal that is not tied to a named placement. Keep each prose field tight. Cut filler. Cite at least one named placement or aspect per pressure point and per bridge.

JSON SCHEMA (return exactly this shape, NEW SECTION STRUCTURE):
{
  "householdRegulationPattern": string (one short paragraph, 4-6 sentences. Describe how the parent(s) set the emotional tone, conflict style, and repair pattern of the household. Anchor every claim to specific parent placements: their Moon (sign + element), Mercury (communication style), Saturn (where they enforce structure or shut down), and any 4th- or 10th-house emphasis. If two parents are present, briefly contrast how each one sets tone. Do NOT describe children here. Do NOT use sign or element stereotypes; translate behaviorally.),
  "childAdaptations": [
    { "name": "ChildName", "line": string (2-3 sentences. For THIS specific child, describe their regulation and adaptation style based on: their Moon (sign + element), Saturn or Chiron sensitivities, Mercury/Mars pressure pattern, and the strongest named cross-aspects between THIS child and EACH parent. Reference age or developmental stage when relevant: young children absorb, adolescents differentiate, adult children reinterpret. NO birth-order labels. NO generic sibling archetypes. Each child's line MUST cite at least one named placement and at least one named parent-child synastry aspect.) }
  ],
  "siblingPressurePoints": [
    { "headline": string (names which siblings and which exact aspect), "body": string (2-3 sentences. ONLY use exact sibling-to-sibling synastry aspects from the friction/bridge lists. Describe what someone could OBSERVE between these two specific children. NO birth-order stereotypes ("the oldest…", "the youngest…", "the middle child…"). If there are no significant sibling aspects, return an empty array.) }
  ],
  "whatEscalates": [
    { "headline": string (short label of the escalation pattern), "body": string (2-3 sentences naming a specific repeated chart pattern that increases dysregulation, comparison, shutdown, defensiveness, or overstimulation in this household. Anchor each item to a named placement or repeated aspect. Examples of valid framings: "When [Parent]'s Mars squares [Child]'s Moon, raising voice triggers shutdown", "Three water Moons under one roof means unspoken moods spread fast". 2-4 items max.) }
  ],
  "whatHelps": string (one short paragraph, 4-6 sentences. Realistic, low-pressure practices that fit THIS family's nervous systems. MUST: (a) open by naming a specific repeated signature you are targeting; (b) describe what the parent(s) initiate and hold, with each child meeting it at their own level; (c) be concrete actions a parent can do in real life this week, not abstract principles; (d) reference at least one named placement or aspect. Forbidden: weekly emotional sharing circles unless group-processing aspects clearly support it, public praise rituals by default, generic goals like "everyone wants to get along".)
}

Generate exactly one childAdaptations entry per CHILD (not per member; parents do not get an entry here). Generate 0 to 3 siblingPressurePoints based ONLY on exact sibling synastry. Generate 2 to 4 whatEscalates items, each tied to a named pattern. If a section has no real evidence, return an empty array or a one-sentence honest note rather than inventing filler.`;

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

Write the integrated family reading. Follow the schema exactly. Use the actual names and placements from the data. Do not invent aspects or placements that are not listed above.

EVIDENCE-CARD STEP (do this BEFORE writing any prose):
1. Build a Parent Regulator card for each parent: Moon, Mercury, Saturn, 4th/10th emphasis.
2. Build a Child Adaptation card for EACH child: Moon, Saturn/Chiron sensitivity, Mercury/Mars pressure, strongest cross-aspects to each parent (cite by name from the friction/bridge lists).
3. Build a Sibling card from EXACT synastry aspects between siblings only (no birth-order assumptions).
4. Build a Household Climate card from ONLY patterns that repeat across 2+ of the cards above.
Then write the JSON. Every claim must trace to one of those cards. If a card is empty, say so plainly rather than invent.

WHAT-HELPS CHECKLIST (the whatHelps field will be rejected if it fails any of these):
- Does it name a specific aspect or placement from the data above by planet and sign?
- Could it ONLY belong to this family, or could you paste it into any parenting blog?
- Does the parent lead and the child respond, or are you treating them as equals?
- Is there a concrete trigger (a moment, a time of day, a recurring situation) rather than a vague principle?

REAL-WORLD FAMILY PRACTICE RULE (also rejected if it fails any of these):
- Do NOT default to idealized family-therapy rituals. Forbidden defaults: forced family circles, mandatory emotional sharing, structured gratitude rituals, spotlight-style praise systems, weekly "feelings check-ins" for the whole household, group emotional processing as a default, public praise as the regulation tool.
- Do NOT assume this family is emotionally expressive, comfortable sharing feelings together, able to process safely as a group, or has the bandwidth for weekly structured rituals. Many families have nervous-system overwhelm, sibling dynamics that punish visibility, attention sensitivity, trauma adaptation, emotional shutdown, overstimulation from being watched, or plain exhaustion.
- PREFER: small repeatable actions, low-pressure connection, side-by-side interaction (cooking, walking, driving), individualized support, regulation BEFORE discussion, practical emotional safety. Concrete examples to draw from when appropriate to the data: short one-on-one moments, low-intensity consistency, calm transitions, PRIVATE encouragement instead of public praise, brief repair after conflict, reducing public correction, individualized connection styles for each child.
- If the chart data shows Saturn-Sun, Chiron, 12th-house, Moon-Neptune, Moon-Pluto, or hard Mars contacts in the children, explicitly avoid spotlight or group-processing recommendations and lean toward private, low-visibility connection.
- A practice that "sounds emotionally healthy" is NOT automatically right for THIS family. The signature in the chart must support that the family can actually hold the practice.
If any answer is wrong, rewrite before returning.`;

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
