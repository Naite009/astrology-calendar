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

interface MemberCtx {
  name: string;
  role: string;
  age: number | null;
  moonPhase?: { label: string; separationDeg: number; regulationCue: string } | null;
  sect?: { sect: "day" | "night"; sunHouse: number | null; leadingLuminary: "Sun" | "Moon" } | null;
  rulers?: { house: number; cuspSign: string; ruler: string; rulerSign: string | null; rulerHouse: number | null; rulerRetrograde: boolean }[];
  retrograde?: { mercuryRx: boolean; marsRx: boolean; saturnRx: boolean; venusRx: boolean; notes: string[] };
  profection?: { ageYears: number; profectedHouse: number; cuspSign: string | null; yearLordPlanet: string | null; yearLordSign: string | null; yearLordHouse: number | null; themeNote: string } | null;
}

interface ParentActivationGroup {
  parentName: string;
  childName: string;
  hits: { parentPlanet: string; parentSign?: string; childPlanet: string; childSign?: string; aspect: string; symbol: string; orb: number; parentTrigger: string }[];
}

interface CrossChartTSquare {
  apex: { name: string; planet: string; sign?: string };
  endA: { name: string; planet: string; sign?: string };
  endB: { name: string; planet: string; sign?: string };
  orb: number;
}

interface CompositeChart {
  Sun?: { sign: string; degree: number };
  Moon?: { sign: string; degree: number };
  Mercury?: { sign: string; degree: number };
  Venus?: { sign: string; degree: number };
  Mars?: { sign: string; degree: number };
  Jupiter?: { sign: string; degree: number };
  Saturn?: { sign: string; degree: number };
  Ascendant?: { sign: string; degree: number };
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
  memberContext?: MemberCtx[];
  parentActivations?: ParentActivationGroup[];
  crossChartTSquares?: CrossChartTSquare[];
  householdComposite?: CompositeChart;
  pairComposites?: { pairType: "parent-child" | "sibling"; nameA: string; nameB: string; composite: CompositeChart }[];
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

12b. NATAL VS SYNASTRY DISAMBIGUATION (HARD RULE). NEVER write "[Person]'s Mercury-Saturn conjunction" or "[Person]'s Moon-Pluto square" etc. as if it were a single natal aspect unless that exact aspect appears in that person's own MEMBER CHART summary. When the contact is a SYNASTRY aspect between two family members, you MUST phrase it explicitly as a between-people aspect, naming both people and both planets, e.g. "Lauren's Mercury conjunct Max's Saturn" or "Ben's Moon square Lauren's Mars". Never collapse a cross-chart contact into a possessive "her Mercury-Saturn conjunction" phrasing — that reads as a natal aspect and is a hallucination. If you are not 100% sure whether an aspect is natal or synastry, look at the source: items in MEMBER CHARTS are natal; items in TIGHTEST FRICTION ASPECTS or TIGHTEST BRIDGE ASPECTS are synastry. Cite synastry items in the format "FromName's Planet [aspect] ToName's Planet" every single time.

13. OBSERVATIONAL, NOT MYTHIC. The Family System tab is NOT personality typing, birth-order psychology, or family-therapy narrative fiction. It IS emotional climate, adaptation patterns, translation differences, bridges, pressure points, and regulation styles. Stay observational. Describe what someone could actually watch happen in the room. No mythic, archetypal, or "every family has a..." framings.

13b. PARENT CAPACITY REALISM RULE (applies to whatHelps and whatEscalates and any guidance the parent will read). Do NOT write as if the parent(s) have unlimited bandwidth, regulation, patience, or nervous-system capacity. Acknowledge parent overwhelm, shutdown, exhaustion, guilt, fear of failing the child, inherited stress patterns, emotional depletion, and survival-mode parenting when the chart context supports it (Saturn-Moon, Moon-Pluto, 12th-house parent emphasis, hard Mars contacts, repeated friction with multiple children, etc.). Recommendations must feel realistically achievable for a stressed parent on a hard day. PREFER tiny repeatable actions, reducing escalation, shorter repair moments, less pressure, realistic (not perfect) consistency, and low-intensity connection. AVOID advice that quietly assumes a fully regulated adult, an emotionally expressive household, high-capacity parenting at all times, or constant calm discussion. The parent should feel understood and supported, not subtly judged or overwhelmed. If a suggestion would only work for a fully resourced, calm, well-slept parent, rewrite it smaller.

15. EVIDENCE-CARD ARCHITECTURE (HARD RULE). Before writing any prose, internally build evidence cards from the supplied data:
  (A) PARENT REGULATOR PATTERN — for each parent, list: their Moon (sign + element), their Mercury (sign), their Saturn (sign + any hard aspect to luminaries), and any 4th- or 10th-house emphasis visible in their summary.
  (B) CHILD ADAPTATION PATTERN — for EACH child separately, list: their Moon (sign + element), Saturn or Chiron sensitivities (placement and any hard aspect), Mercury and Mars pressure pattern, and the strongest cross-aspects between THIS child and EACH parent (pulled from the friction and bridge lists by name).
  (C) SIBLING PRESSURE / BRIDGE PATTERNS — only exact synastry aspects between siblings, by name. No birth-order assumptions.
  (D) HOUSEHOLD CLIMATE — only patterns that REPEAT across two or more evidence cards above (e.g. "three of four members have Moon in water", "both children have Saturn hard-aspecting a parent's Moon").
Every sentence in the output must be traceable to one of these cards. If a claim cannot be traced to a specific card and cited placement, DELETE it. It is better to say "no strong shared signature here" than to invent.

16. OUTPUT IS SHORT, EVIDENCE-BASED, OBSERVATIONAL. Not a story. Not a myth. Not a personality essay. Forbidden phrases include but are not limited to: "buzzing household", "adventurous family", "vibrant home", "the oldest…", "the youngest…", "the middle child…", any sentence whose meaning depends only on an element or sign label, and any generic family goal that is not tied to a named placement. Keep each prose field tight. Cut filler. Cite at least one named placement or aspect per pressure point and per bridge.

REAL-TIME SCENARIO VALIDATION RULE (applies to childAdaptations[].inTheMoment AND householdInTheMoment):
- Each scenario MUST be derived from THIS family's actual chart evidence: a named parent-child or sibling cross-aspect from the friction/bridge lists, a high-weight pressure signature (Saturn / Chiron / Mars / Pluto / out-of-bounds Moon / retrograde Mercury or Mars), the household composite Moon or Saturn, a cross-chart T-square apex, or a pattern already named earlier in this reading.
- The scenario MUST be writeable as "When [observable behavior] (driven by [named placement, aspect with orb, or composite signature])". You do not have to print the parenthetical, but if you cannot write it, DO NOT include the scenario.
- FORBIDDEN default scenarios when not chart-supported: "one child shuts down while another gets loud", "voices stack on top of each other", generic "why" question backlash, generic transition meltdowns, generic dinner-table shutdowns, generic sibling escalation. These are only allowed when the chart explicitly supports them (e.g. one child's Moon-Saturn for shutdown PLUS another's Mars-Sun for loud reactivity, or a composite Moon square Saturn for stacked-voices overload).
- If only ONE qualifying signature exists for a child or for the household, return ONE scenario. If TWO exist, return TWO. Do NOT pad to 4. If NONE exist, return an empty array []. Accuracy over completeness.
- Every scenario must pass: "Would this realistically happen in THIS family based on the chart?" If not, omit it.

JSON SCHEMA (return exactly this shape, NEW SECTION STRUCTURE):
{
  "householdRegulationPattern": string (one short paragraph, 4-6 sentences. Describe how the parent(s) set the emotional tone, conflict style, and repair pattern of the household. Anchor every claim to specific parent placements: their Moon (sign + element), Mercury (communication style), Saturn (where they enforce structure or shut down), and any 4th- or 10th-house emphasis. If two parents are present, briefly contrast how each one sets tone. Do NOT describe children here. Do NOT use sign or element stereotypes; translate behaviorally.),
  "childAdaptations": [
    { "name": "ChildName", "line": string (3-4 sentences. For THIS specific child, describe their regulation and adaptation style based on: their Moon (sign + element), Saturn or Chiron sensitivities, Mercury/Mars pressure pattern, and the strongest named cross-aspects between THIS child and EACH parent. Reference age or developmental stage when relevant: young children absorb, adolescents differentiate, adult children reinterpret. NO birth-order labels. NO generic sibling archetypes. Each child's line MUST cite at least one named placement and at least one named parent-child synastry aspect. HARD REQUIREMENT: Every entry MUST end with one concrete sentence beginning "Responds best to…" or "Responds best when…" that tells the parent what to DO differently. The "responds best" line must match THIS child's specific signatures, not be generic.), "respondsBestWhen": [string, string, ...4-6 short behavioral leverage points for THIS child (no leading "Responds best", just the condition itself, e.g. "given choices instead of commands", "corrected privately instead of publicly", "allowed processing time before answering", "pressure is lowered before discussion", "connection happens side-by-side"). Each item MUST be a concrete, observable interaction the parent can actually do. FORBIDDEN symbolic wording: "needs freedom", "craves validation", "values harmony", "wants to be seen", "seeks adventure".], "inTheMoment": [ { "scenario": string (one short, concrete escalation moment THIS child has, plain parent language, calibrated to this child's Moon/Mars/Mercury/Saturn pattern), "actions": [string, ...2-4 immediate de-escalation actions, verbs first, simple enough to remember when stressed. FORBIDDEN: long therapy scripts, multi-sentence dialogue, anything requiring a fully calm parent. Each action must work on a hard day.] } ...generate 0-4 scenarios per child, ONLY those backed by the chart per the REAL-TIME SCENARIO VALIDATION RULE; return [] if none qualify; do not pad ], "whatMakesItWorse": [string, ...3-5 specific parent behaviors to AVOID with THIS child because they reliably escalate this child's dysregulation. Verb-first, concrete, calibrated to this child's Moon/Mercury/Mars/Saturn/Chiron pattern and the parent-child synastry aspects. Examples: "asking 'why did you do that?' when they're already overwhelmed", "stacking multiple instructions at once", "correcting in front of siblings", "matching their volume", "pushing for an answer instead of giving processing time", "lecturing during escalation". FORBIDDEN: vague language, therapy phrasing, symbolic astrology. Parent should think "oh… I do that… and that's making it worse."] }
  ],
  "siblingPressurePoints": [
    { "name": "ChildName", "body": string (one short paragraph per child, written from THIS child's perspective. Describe how THIS child experiences each of their siblings, one sibling at a time, in the order they appear in the family. For each sibling: name the sibling, cite the EXACT sibling-to-sibling synastry aspect from the friction/bridge lists (e.g. "Ben's Mercury opposite Max's Moon"), and describe how that aspect FEELS for the child whose section this is (not for the sibling). What does the other sibling DO that lands hard, soothes, or confuses THIS child? What might THIS child misread the sibling as doing? Plain English, observational, 2-3 sentences per sibling relationship. NO birth-order stereotypes. If there are no exact synastry aspects between this child and a particular sibling, say so plainly in one sentence rather than invent. Generate exactly one entry per CHILD in the family, in the order children appear in the input.) }
  ],
  "whatEscalates": [
    { "name": "MemberName", "body": string (one short paragraph per family member, written from THIS person's perspective. Describe (a) what specifically escalates THIS person (what tips them into dysregulation, shutdown, withdrawal, louder behavior, defensiveness, or overstimulation) and (b) how THIS person, once activated, then affects the rest of the household. Anchor every claim to THIS person's own named placements (Moon, Mercury, Mars, Saturn, Chiron, 4th/8th/12th house) and to specific named cross-aspects from the friction/bridge lists between them and other family members. Do NOT mix two people's placements as the cause and then suddenly describe a third person's reaction inside the same paragraph; stay with one perspective per entry. 2-4 sentences. Plain English, observational. Generate exactly one entry per FAMILY MEMBER (parents and children, in the order they appear in the input).) }
  ],
  "whatHelps": string (one short paragraph, 4-6 sentences. Realistic, low-pressure practices that fit THIS family's nervous systems. MUST: (a) open by naming a specific repeated signature you are targeting; (b) describe what the parent(s) initiate and hold, with each child meeting it at their own level; (c) be concrete actions a parent can do in real life this week, not abstract principles; (d) reference at least one named placement or aspect. Forbidden: weekly emotional sharing circles unless group-processing aspects clearly support it, public praise rituals by default, generic goals like "everyone wants to get along".),
  "householdInTheMoment": [
    { "scenario": string (one common WHOLE-FAMILY escalation scenario rooted in the household's actual cross-aspect pattern — examples: "When two siblings escalate at each other", "When one child shuts down at the dinner table", "When voices stack on top of each other", "When a transition turns into a meltdown", "When one parent and one child collide". Calibrate to the named friction aspects, T-square apex, or composite Moon/Saturn signatures.),
      "actions": [string, ...2-4 immediate, simple actions the parent(s) can do in the moment. Verbs first. De-escalation over explanation. Examples: "separate first, explain later", "do not force resolution in the moment", "lower your tone instead of matching volume", "stop explaining and reduce words", "do not correct one child in front of the others", "name what's happening in one short sentence and step back". Each action must work on a hard day for a stressed parent.] }
    // generate 0-4 scenarios total, ONLY those backed by the chart per the REAL-TIME SCENARIO VALIDATION RULE; return [] if none qualify; do not pad
  ],
  "householdMakesItWorse": [string, ...3-5 specific household-level patterns or parent behaviors to AVOID because they reliably escalate the WHOLE system, anchored to the household's actual friction aspects, T-square apex, or composite Moon/Saturn. Verb-first, concrete, real-life. Examples: "trying to resolve conflict while everyone is still escalated", "forcing a group discussion to 'clear the air' before bodies regulate", "comparing siblings out loud", "correcting one child in front of another", "stacking transitions back-to-back without a buffer", "asking everyone to share feelings around the dinner table when two members shut down under group attention". FORBIDDEN: vague language, therapy phrasing, symbolic astrology. Parent should immediately recognize the pattern.]
}

Generate exactly one childAdaptations entry per CHILD (not per member; parents do not get an entry here). Generate exactly one siblingPressurePoints entry per CHILD, in the same order as childAdaptations, written from THAT child's perspective covering each of their siblings (skip if only one child in the family — return an empty array). Generate exactly one whatEscalates entry per FAMILY MEMBER (parents and children together), in the order they appear in the input, written from THAT person's perspective. If a section has no real evidence, return an empty array or a one-sentence honest note rather than inventing filler.`;

    const parents = body.members.filter((m) => /parent|mother|father|mom|dad|stepparent|stepmother|stepfather|guardian/i.test(m.role));
    const children = body.members.filter((m) => /child|son|daughter|stepchild|kid/i.test(m.role));
    const hierarchyLine = parents.length && children.length
      ? `PARENTS (lead, set tone, hold container): ${parents.map((p) => p.name).join(", ")}\nCHILDREN (respond, participate at their level): ${children.map((c) => c.name).join(", ")}`
      : `(no clear parent/child split in this group; treat as adult family members but still honor any age or role differences listed)`;

    // ─── Astrology context blocks ─────────────────────────────────────────
    const memberCtxBlock = (body.memberContext ?? []).map((m) => {
      const lines: string[] = [];
      lines.push(`### ${m.name} (${m.role}${m.age != null ? `, age ${m.age}` : ""})`);
      if (m.moonPhase) lines.push(`- Moon phase at birth: ${m.moonPhase.label} (Sun→Moon ${m.moonPhase.separationDeg}°). Cue: ${m.moonPhase.regulationCue}`);
      if (m.sect) lines.push(`- Sect: ${m.sect.sect.toUpperCase()} chart (Sun H${m.sect.sunHouse}). Leading luminary: ${m.sect.leadingLuminary}.`);
      if (m.rulers?.length) {
        lines.push(`- House rulers chain:`);
        for (const r of m.rulers) lines.push(`    • H${r.house} (${r.cuspSign}) → ${r.ruler} in ${r.rulerSign ?? "?"}${r.rulerHouse ? ` H${r.rulerHouse}` : ""}${r.rulerRetrograde ? " R" : ""}`);
      }
      if (m.retrograde?.notes?.length) {
        lines.push(`- Retrograde flags:`);
        for (const n of m.retrograde.notes) lines.push(`    • ${n}`);
      }
      if (m.profection) lines.push(`- This year: H${m.profection.profectedHouse} profection in ${m.profection.cuspSign}, year-lord ${m.profection.yearLordPlanet} in ${m.profection.yearLordSign ?? "?"}${m.profection.yearLordHouse ? ` H${m.profection.yearLordHouse}` : ""}. Theme: ${m.profection.themeNote}`);
      return lines.join("\n");
    }).join("\n\n") || "(no per-member context)";

    const activationBlock = (body.parentActivations ?? []).flatMap((g) => {
      if (!g.hits.length) return [];
      return [`${g.parentName} → ${g.childName}:`, ...g.hits.map((h) => `  - ${g.parentName}'s ${h.parentPlanet} in ${h.parentSign ?? "?"} ${h.symbol} ${g.childName}'s ${h.childPlanet} in ${h.childSign ?? "?"} (${h.aspect}, orb ${h.orb}°). Activates IN parent: ${h.parentTrigger}`)];
    }).join("\n") || "(no Saturn/Chiron hard hits from parents to children's Sun/Moon/Mars)";

    const tsqBlock = (body.crossChartTSquares ?? []).length
      ? body.crossChartTSquares!.map((t) => `- T-square: ${t.endA.name}'s ${t.endA.planet} in ${t.endA.sign ?? "?"} ↔ ${t.endB.name}'s ${t.endB.planet} in ${t.endB.sign ?? "?"} (opposition), apex ${t.apex.name}'s ${t.apex.planet} in ${t.apex.sign ?? "?"} squaring both (avg orb ${t.orb}°). The apex carries the household's released pressure.`).join("\n")
      : "(no cross-chart T-squares found in this family)";

    const c = body.householdComposite ?? {};
    const compositeBlock = c && (c.Sun || c.Moon)
      ? [`- Composite Sun: ${c.Sun?.sign ?? "?"} ${c.Sun?.degree ?? ""}°`,
         `- Composite Moon: ${c.Moon?.sign ?? "?"} ${c.Moon?.degree ?? ""}° (light snapshot of a possible shared tendency — supporting tone only)`,
         `- Composite Mercury: ${c.Mercury?.sign ?? "?"} ${c.Mercury?.degree ?? ""}°`,
         `- Composite Venus: ${c.Venus?.sign ?? "?"} ${c.Venus?.degree ?? ""}°`,
         `- Composite Mars: ${c.Mars?.sign ?? "?"} ${c.Mars?.degree ?? ""}°`,
         `- Composite Saturn: ${c.Saturn?.sign ?? "?"} ${c.Saturn?.degree ?? ""}° (where the household tends to tighten or stall — supporting tone only)`,
         `- Composite Ascendant: ${c.Ascendant?.sign ?? "?"} ${c.Ascendant?.degree ?? ""}°`,
        ].join("\n")
      : "(no composite chart available)";

    const pairCompositeBlock = (body.pairComposites ?? []).length
      ? body.pairComposites!.map((pc) => {
          const cc = pc.composite;
          const bits: string[] = [];
          if (cc.Sun) bits.push(`Sun ${cc.Sun.sign} ${cc.Sun.degree}°`);
          if (cc.Moon) bits.push(`Moon ${cc.Moon.sign} ${cc.Moon.degree}°`);
          if (cc.Mercury) bits.push(`Mercury ${cc.Mercury.sign} ${cc.Mercury.degree}°`);
          if (cc.Venus) bits.push(`Venus ${cc.Venus.sign} ${cc.Venus.degree}°`);
          if (cc.Mars) bits.push(`Mars ${cc.Mars.sign} ${cc.Mars.degree}°`);
          if (cc.Saturn) bits.push(`Saturn ${cc.Saturn.sign} ${cc.Saturn.degree}°`);
          return `- ${pc.pairType} composite (${pc.nameA} + ${pc.nameB}): ${bits.join(", ")}`;
        }).join("\n")
      : "(no pair composites available)";

    const userPrompt = `FAMILY MEMBERS: ${memberList}

${hierarchyLine}

MEMBER CHARTS:
${body.memberSummaries.join("\n\n")}

PER-MEMBER ASTROLOGICAL CONTEXT (Moon phase, sect, house rulers chain, retrograde flags, current profected house). You MUST cite at least one of these per child in childAdaptations:
${memberCtxBlock}

PARENT ACTIVATION MAP (where each child's chart triggers each parent's Chiron/Saturn — describes what gets stirred IN THE PARENT, not the child):
${activationBlock}

CROSS-CHART T-SQUARES (apex carries the household's pressure release point — recurring family pattern, not just one-off aspects):
${tsqBlock}

HOUSEHOLD COMPOSITE CHART (light snapshot only — secondary, supporting tone, NEVER the primary lens):
${compositeBlock}

PAIR COMPOSITES (carry MORE interpretive weight than the whole-family composite — use these to describe the tone of each specific relationship):
${pairCompositeBlock}

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
1. Build a Parent Regulator card for each parent: Moon (with phase + sect), Mercury, Saturn, ASC/4th/10th rulers, retrograde flags, current profected house.
2. Build a Child Adaptation card for EACH child: Moon (with phase + sect), Saturn/Chiron sensitivity, Mercury/Mars pressure, ASC/4th/10th rulers, retrograde flags, current profected house, strongest cross-aspects to each parent.
3. Build a Sibling card from EXACT synastry aspects between siblings only (no birth-order assumptions).
4. Build a Household Climate card using: composite Moon + composite Saturn + composite Ascendant + any cross-chart T-square apex + repeated patterns across 2+ member cards.
Then write the JSON. Every claim must trace to one of those cards. If a card is empty, say so plainly rather than invent.

INLINE CITATION RULE (HARD): Every sentence in householdRegulationPattern, childAdaptations.line, siblingPressurePoints.body, whatEscalates.body, and whatHelps MUST trace to a specific named placement, Moon phase, sect, profected house, ruler chain link, retrograde flag, parent-activation hit, cross-chart T-square apex, composite-chart placement, or named cross-aspect from the data. Inline citation in parentheses preferred (e.g. "(composite Moon in Capricorn)" or "(Lauren's Saturn square Max's Sun, 1.8°)"). A claim with no astrological source MUST be deleted.

FAMILY COMPOSITE WEIGHTING RULE (HARD):
- The whole-family (household) composite is a LIGHT SNAPSHOT and SECONDARY supporting tone only. It is NEVER the primary lens.
- PRIMARY interpretation MUST come from: parent-child synastry, sibling synastry, each child's own Moon / Saturn / Chiron / Mercury / Mars patterns, parent activation hits, and repeated household regulation patterns observed across 2+ member cards.
- The household composite may be cited at most ONCE in householdRegulationPattern, and ONLY with hedged language: "may add a shared tendency toward…", "as a light supporting tone…", "may color the household with…". 
- FORBIDDEN absolutist phrasings about the household composite: "this defines the family", "this means the family is [trait]", "the family IS [sign-flavored adjective]", "the household's shared regulation style is X" stated as fact. If you write any of these, DELETE the sentence.
- If a household composite signature contradicts the synastry / individual chart evidence, the synastry and individual evidence WIN. Do not force-fit the composite.
- PAIR COMPOSITES (parent-child, sibling) carry MORE interpretive weight than the household composite. When describing the tone of a specific relationship in childAdaptations, siblingPressurePoints, or whatHelps, prefer citing that pair's composite (e.g. "Lauren + Max composite Moon in [sign]") over the household composite. Same hedged language still applies ("may add a shared tone of…").
- Do NOT cite the household composite in childAdaptations, siblingPressurePoints, or whatEscalates entries. Those sections are about individuals and pair dynamics, not the family-as-one-entity.

T-SQUARE USAGE: If the CROSS-CHART T-SQUARES block is non-empty, whatEscalates and/or whatHelps MUST reference the apex by name (the apex person carries the household's pressure release).

PROFECTION USAGE: Each childAdaptations.line MUST mention this child's current profected-house theme in at least one sentence ("this year for [name] is a [house] profection — [theme]").

WHAT-HELPS CHECKLIST (the whatHelps field will be rejected if it fails any of these):
- Does it name a specific aspect or placement from the data above by planet and sign?
- Could it ONLY belong to this family, or could you paste it into any parenting blog?
- Does the parent lead and the child respond, or are you treating them as equals?
- Is there a concrete trigger (a moment, a time of day, a recurring situation) rather than a vague principle?

REAL-WORLD FAMILY PRACTICE RULE (also rejected if it fails any of these):
- Do NOT default to idealized family-therapy rituals. Forbidden defaults: forced family circles, mandatory emotional sharing, structured gratitude rituals, spotlight-style praise systems, weekly "feelings check-ins" for the whole household, group emotional processing as a default, public praise as the regulation tool.
- Do NOT assume this family is emotionally expressive, comfortable sharing feelings together, able to process safely as a group, or has the bandwidth for weekly structured rituals.
- PREFER: small repeatable actions, low-pressure connection, side-by-side interaction, individualized support, regulation BEFORE discussion.
- If the chart data shows Saturn-Sun, Chiron, 12th-house, Moon-Neptune, Moon-Pluto, or hard Mars contacts in the children, explicitly avoid spotlight or group-processing recommendations and lean toward private, low-visibility connection.
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

    // ─── Forbidden-symbolic phrase scrub ─────────────────────────────────
    const FORBIDDEN: RegExp[] = [
      /\bneeds? freedom\b/gi, /\bcraves? validation\b/gi, /\bvalues? harmony\b/gi,
      /\bseeks? adventure\b/gi, /\bwants? to be seen\b/gi, /\byearns? for\b/gi,
      /\bsoul[- ]chosen\b/gi, /\bdivine\b/gi, /\bsacred\b/gi,
    ];
    const scrub = (s: unknown): unknown => {
      if (typeof s === "string") {
        let out = s;
        for (const re of FORBIDDEN) out = out.replace(re, "");
        return out.replace(/\s{2,}/g, " ").replace(/ ,/g, ",").trim();
      }
      if (Array.isArray(s)) return s.map(scrub);
      if (s && typeof s === "object") {
        const o: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(s as Record<string, unknown>)) o[k] = scrub(v);
        return o;
      }
      return s;
    };
    payload = scrub(payload) as ReadingPayload;

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
