// Family Pair Reading — AI-generated, sign/house/age-aware parent→child synastry.
// Replaces the static template lookup. Aspects are computed deterministically on
// the client and passed in; the AI only writes prose.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CrossAspect {
  fromPlanet: string;
  fromSign?: string;
  fromHouse?: number | null;
  fromRetro?: boolean;
  toPlanet: string;
  toSign?: string;
  toHouse?: number | null;
  toRetro?: boolean;
  aspect: string; // conjunction / opposition / trine / square / sextile
  symbol: string;
  orb: number;
}

interface RequestBody {
  fromName: string;
  fromRole: string;
  fromPlanetsSummary: string;
  toName: string;
  toRole: string;
  toPlanetsSummary: string;
  toBirthDate?: string;
  toAgeYears?: number | null;
  parentMoonSummary?: string;
  childMoonSummary?: string;
  aspects: CrossAspect[];
}

interface ReadingSection {
  heading: string; // "FROM's Mercury square TO's Moon"
  badge: string; // "Square · 3.6°"
  howItLands: string; // 1-2 sentences from the child's POV in plain language
  blindSpot: string; // 1 sentence — what the parent doesn't see
  whatHelps: string[]; // 2-3 concrete actions, age-calibrated
}

interface SoulContract {
  whyTheseTwo: string;
  childLesson: string;
  parentLesson: string;
  contractSentence: string;
}

interface ReadingPayload {
  essence: string[]; // 3-5 bullet headlines, plain English
  ageNote: string; // short framing of developmental stage
  sections: ReadingSection[];
  practice: string; // one focused 90-day practice for the parent
  soulContract?: SoulContract;
  moonBridge?: { summary: string; translation: string };
  pressureProfile?: {
    title: string;
    astrology: string;
    plainEnglish: string;
    whatTheParentMayNotice: string[];
    whatHelps: string[];
  };
  repairProfile?: {
    title: string;
    astrology: string;
    plainEnglish: string;
    whatTheParentMayNotice: string[];
    whatHelps: string[];
  };
  perceptionTranslation?: {
    title: string;
    misread: string;
    underneath: string;
    whatHelps: string[];
  };
}

function ageStage(years: number | null | undefined): string {
  if (years == null || !isFinite(years)) return "no age provided — write for general developmental range 5–12";
  if (years < 2) return `${years} years old — pre-verbal infancy. Child reads tone, body, and presence, not words.`;
  if (years < 6) return `${years} years old — early childhood. Sensory and emotional. Words matter less than felt safety.`;
  if (years < 12) return `${years} years old — middle childhood. Beginning to verbalize feelings; rules and fairness matter.`;
  if (years < 18) return `${years} years old — adolescence. Identity formation. Privacy, autonomy, and respect are the currency.`;
  return `${years} years old — adult child. The dynamic is voluntary; the parent's job is invitation, not instruction.`;
}

function computeAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const [y, m, d] = birthDate.split("-").map(Number);
  if (!y || !m || !d) return null;
  const now = new Date();
  let age = now.getFullYear() - y;
  const beforeBirthday =
    now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d);
  if (beforeBirthday) age--;
  return age;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = (await req.json()) as RequestBody;
    if (!body?.fromName || !body?.toName || !Array.isArray(body.aspects)) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
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

    const ageYears = body.toAgeYears ?? computeAge(body.toBirthDate);
    const stage = ageStage(ageYears);

    // Deterministic signature weighting (run BEFORE prompt assembly).
    const HARD = new Set(["conjunction", "opposition", "square"]);
    const SOFT = new Set(["trine", "sextile"]);
    function scoreAspect(a: CrossAspect): number {
      const f = a.fromPlanet, t = a.toPlanet, asp = a.aspect;
      const isHard = HARD.has(asp);
      const involves = (p1: string, p2: string) =>
        (f === p1 && t === p2) || (f === p2 && t === p1);
      const involvesAny = (set: string[], other: string) =>
        (set.includes(f) && t === other) || (set.includes(t) && f === other);
      // Saturn hard Sun/Moon = +5
      if (isHard && involvesAny(["Saturn"], "Sun")) return 5;
      if (isHard && involvesAny(["Saturn"], "Moon")) return 5;
      // Chiron hard Sun/Moon = +4
      if (isHard && involvesAny(["Chiron"], "Sun")) return 4;
      if (isHard && involvesAny(["Chiron"], "Moon")) return 4;
      // Pluto → Moon = +4 (any aspect)
      if (involves("Pluto", "Moon")) return 4;
      // Moon-Neptune hard = +3
      if (isHard && involves("Moon", "Neptune")) return 3;
      // Mercury-Chiron = +3 (any aspect, treat as sensitive contact)
      if (involves("Mercury", "Chiron")) return 3;
      // Mars-Saturn hard = +3
      if (isHard && involves("Mars", "Saturn")) return 3;
      // Node contacts = +2
      if (f === "NorthNode" || t === "NorthNode" || f === "SouthNode" || t === "SouthNode") return 2;
      // Soft aspects = +1
      if (SOFT.has(asp)) return 1;
      // Default qualifying hard contact
      return 2;
    }
    function intensityLabel(total: number, count: number): "mild" | "moderate" | "strong" | "dominant" {
      if (count >= 3 && total >= 12) return "dominant";
      if (count >= 2 && total >= 8) return "strong";
      if (total >= 4) return "moderate";
      return "mild";
    }

    // Reduced default aspect count: 4-6 strongest only. Allow up to 6 if extra
    // aspects have very tight orb (<3°) OR add new planet pair information.
    const allRanked = [...body.aspects]
      .map((a) => ({ a, score: scoreAspect(a), tightness: 10 - Math.min(a.orb, 10) }))
      .sort((x, y) => (y.score + y.tightness * 0.4) - (x.score + x.tightness * 0.4));
    const seen = new Set<string>();
    const picked: CrossAspect[] = [];
    for (const { a } of allRanked) {
      if (picked.length >= 6) break;
      const key = `${a.fromPlanet}|${a.toPlanet}`;
      const isTight = a.orb < 3;
      const isNewPair = !seen.has(key);
      if (picked.length < 4 || isTight || isNewPair) {
        picked.push(a);
        seen.add(key);
      }
    }
    const aspects = picked;

    // Hard orb gate for qualifying signatures (used by pressureProfile / repairProfile / perceptionTranslation).
    // Anything outside these limits is invisible to the AI for those sections.
    const MAX_ORB: Record<string, number> = {
      Sun: 10, Moon: 10,
      Mercury: 6, Venus: 6, Mars: 6,
      Jupiter: 6, Saturn: 6,
      Uranus: 5, Neptune: 5, Pluto: 5,
      Chiron: 4, NorthNode: 4, SouthNode: 4, Node: 4,
    };
    const orbLimitFor = (planet: string): number => MAX_ORB[planet] ?? 6;
    const isOrbValid = (a: CrossAspect): boolean => {
      const limit = Math.min(orbLimitFor(a.fromPlanet), orbLimitFor(a.toPlanet));
      return a.orb <= limit;
    };
    const qualifying = body.aspects.filter(isOrbValid);
    const qualifyingLines = qualifying
      .map((a) => {
        const fromHouse = a.fromHouse ? ` (H${a.fromHouse})` : "";
        const toHouse = a.toHouse ? ` (H${a.toHouse})` : "";
        return `- ${body.fromName}'s ${a.fromPlanet} in ${a.fromSign ?? "?"}${fromHouse} ${a.symbol} ${body.toName}'s ${a.toPlanet} in ${a.toSign ?? "?"}${toHouse} (${a.aspect}, orb ${a.orb.toFixed(1)}°)`;
      })
      .join("\n") || "(no cross-aspects pass the orb gate for this pair)";

    // Scored summary (passed to AI for prioritisation).
    const scored = aspects.map((a) => ({ a, s: scoreAspect(a) }));
    const totalScore = scored.reduce((sum, x) => sum + x.s, 0);
    const highWeightCount = scored.filter((x) => x.s >= 4).length;
    const overallIntensity = intensityLabel(totalScore, highWeightCount);

    const aspectLines = scored
      .map(({ a, s }) => {
        const fromHouse = a.fromHouse ? ` (H${a.fromHouse})` : "";
        const toHouse = a.toHouse ? ` (H${a.toHouse})` : "";
        const fromRetro = a.fromRetro ? " R" : "";
        const toRetro = a.toRetro ? " R" : "";
        return `- [weight ${s}] ${body.fromName}'s ${a.fromPlanet} in ${a.fromSign ?? "?"}${fromHouse}${fromRetro} ${a.symbol} ${body.toName}'s ${a.toPlanet} in ${a.toSign ?? "?"}${toHouse}${toRetro} — ${a.aspect}, orb ${a.orb.toFixed(1)}°`;
      })
      .join("\n");

    const fromRoleLabel = body.fromRole;
    const toRoleLabel = body.toRole;

    const systemPrompt = `You are an experienced family astrologer writing for a real parent reading about their real child. Your voice is warm, specific, plain-spoken, and useful. You speak the way a trusted friend who happens to know astrology would — never clinical, never doom-y, never jargon-heavy.

ABSOLUTE RULES:
1. NEVER use words like "miscues", "rubs against", "blurs", "clouds", "wounds", "afflicts", "harshly". These were the words that made the previous version feel awful. Forbidden.
2. NEVER write a sentence whose only content is the aspect name (e.g. "Mercury squares Moon"). Always describe what it FEELS like in real family life.
3. Every interpretation must reference the SPECIFIC signs (and houses if given) of the two planets. Sun in Pisces square Neptune in Sagittarius reads differently from Sun in Leo square Neptune in Scorpio. Use the elements and modes to flavor the reading.
4. Calibrate language to the child's developmental stage. A 4-year-old does not "feel unmoored by vague guidance" — they cry when plans change. A 14-year-old experiences the same aspect as a parent who "doesn't get how serious this is."
5. Squares and oppositions are growth, not damage. Frame them as "where you two have to translate" not "where you hurt them."
6. Trines and sextiles are gifts. Name them as such and tell the parent how to LEAN ON them.
7. Conjunctions can go either way — read the planets, not the geometry, to decide tone.
8. Write in second person to the parent: "your Mercury", "your daughter feels...", "what helps".
9. Plain English. 6th-grade reading level. No astrological jargon in the prose unless naming a specific placement.
10. Output ONLY valid JSON matching the schema. No markdown fences, no commentary.

PRECISION & WEIGHTING RULES (apply to pressureProfile, repairProfile, and perceptionTranslation):
- Each cross-aspect in CROSS-ASPECTS arrives pre-scored with [weight N]. Higher = more central.
  Saturn hard Sun/Moon = 5; Chiron hard Sun/Moon = 4; Pluto–Moon = 4; Moon–Neptune hard = 3;
  Mercury–Chiron = 3; Mars–Saturn hard = 3; Node contacts = 2; soft aspects = 1.
- PressureProfile and RepairProfile MUST be built from the highest-scoring signatures only.
  Do not give equal weight to a +1 soft aspect and a +5 Saturn–Sun square.
- Use intensity language matching the OVERALL INTENSITY label provided in the user prompt:
  • mild → "may occasionally", "sometimes notices", "a small thread of"
  • moderate → "can show up as", "tends to lean toward"
  • strong → "often", "is a real pattern here"
  • dominant → "is a defining feature", "shows up across most situations"
- OVERCONFIRMATION PROTECTION: If only ONE qualifying high-weight signature exists (count of weight ≥3 is 1),
  do NOT use strong fear/shutdown/freeze language. Use "may occasionally..." rather than "this child often...".
  Reserve "often / consistently / dominant" wording for cases with 2+ high-weight signatures clustering.
- Do not stack adjectives. One precise sentence beats three dramatic ones.

HUMAN CONTRADICTION RULE (hard requirement):
- Real children are internally mixed. Do NOT flatten this child into a single emotional theme.
- At least ONE meaningful internal contradiction MUST appear in either pressureProfile.plainEnglish, repairProfile.plainEnglish, OR one of the essence bullets.
- A contradiction names two true things in tension, e.g.: "wants closeness but pulls away when overwhelmed", "highly intelligent but freezes under visible pressure", "deeply sensitive but hides emotion behind logic or humor", "wants recognition but fears exposure", "strong-willed but shuts down under criticism", "independent externally but emotionally dependent internally", "confident in private but hesitant in public", "caring toward others but harsh toward self".
- Do NOT reduce the child to a single adjective like "sensitive", "emotional", "creative", or "strong" without naming the tension or counter-current alongside it.
- The contradiction must be grounded in this child's actual chart signatures, not pasted in as a generic phrase.

DEVELOPMENTAL STAGE FOR THIS CHILD:
${stage}

JSON SCHEMA:
{
  "essence": [string, ...3-5 items, each one sentence headlining the most important dynamic in plain English, no jargon],
  "ageNote": string (1-2 sentences naming the developmental stage and how it shapes the reading),
  "sections": [
    {
      "heading": "FROM_NAME's PLANET ASPECT TO_NAME's PLANET" (use the actual names and aspect word, e.g. "Lauren's Mercury square Ben's Moon"),
      "badge": "HumanLabel · X.X°" (use ONE of these human-readable category labels — never the bare astrology word. Pick the one that best fits the aspect's emotional meaning for a parent: "Different Emotional Languages" (Moon-Mercury, Moon-Sun, or Moon-Moon hard/quincunx where styles clash), "This Pushes Growth" (Saturn, Chiron, or North Node hard contacts that stretch the child), "Needs Extra Understanding" (Moon-Neptune, Moon-Pluto, or 12th-house contacts where feelings are hidden or hard to read), "Natural Emotional Flow" (Moon trines/sextiles, Venus trines/sextiles, easy luminary contacts), "You Trigger Similar Feelings" (conjunctions or same-sign emphasis where both feel the same thing at once), "Sensitive Spot" (Mars-Saturn, Pluto, or Chiron hard contacts that bruise easily), "Easy Support Between You" (Jupiter, Venus, or Sun trines/sextiles that make help land naturally). Format: "Different Emotional Languages · 7.7°"),
      "howItLands": string (2-3 sentences from the child's lived experience at this age, sign-specific),
      "blindSpot": string (1 sentence the parent likely doesn't see, warm and non-blaming),
      "whatHelps": [string, string, ...2-3 concrete things the parent can DO, not feel — verbs, not adjectives]
    }
  ],
  "practice": string (1 short paragraph naming ONE focused practice for the parent for the next 90 days based on the tightest or most pressing cross-aspect),
  "soulContract": {
    "whyTheseTwo": string (2-3 sentences on the karmic pull that brought these two souls into this family),
    "childLesson": string (1-2 sentences: what this child agreed to learn through this parent),
    "parentLesson": string (1-2 sentences: what this parent agreed to learn through this child),
    "contractSentence": string (one sentence naming the central agreement, must name BOTH people learning)
  },
  "moonBridge": {
    "summary": string (2 sentences explaining how the parent and child Moon signs interact as emotional languages),
    "translation": string (one sentence in the format: "When [childName] does [specific behavior], they are actually saying [what they need]." Specific to the child's Moon sign, not generic.)
  },
  "pressureProfile": {
    "title": "How This Child Handles Pressure",
    "astrology": string (1-3 sentences naming the EXACT signatures present in the child's chart and parent cross-aspects that drive this profile — list aspect + valid degree orb. If no qualifying signatures are present, set this to "" and leave all other fields empty arrays/strings),
    "plainEnglish": string (2-4 sentences translating the signatures into likely lived behavior under pressure, calibrated to the child's age),
    "whatTheParentMayNotice": [string, ...3-5 short concrete observable behaviors, e.g. "smart but hesitant", "freezes when watched"],
    "whatHelps": [string, ...3-5 short supportive parenting/coaching responses, verbs first, e.g. "praise effort before outcome", "reduce public correction"]
  },
  "repairProfile": {
    "title": "What Repair Requires for This Child",
    "astrology": string (1-3 sentences naming the EXACT signatures driving this child's repair style — Sun/Saturn condition, 4th/10th houses and their rulers, Pluto links to 4th/10th, 8th/12th emphasis, Moon-Chiron, Moon-Neptune, Mercury hard aspects. Include valid degree orbs. If no qualifying signatures, return "" and empty arrays/strings),
    "plainEnglish": string (2-4 sentences describing this child's repair style and what would need to be true for trust to rebuild — age-calibrated, uses "may"/"might"/"can". NEVER predicts forgiveness one way or the other),
    "whatTheParentMayNotice": [string, ...3-5 short concrete observable behaviors during/after rupture, e.g. "shuts down when pressured", "asks logical questions instead of showing emotion"],
    "whatHelps": [string, ...3-5 short supportive parenting responses, verbs first, e.g. "apologize without demanding forgiveness", "show change through repeated behavior", "let them set the pace of closeness"]
  },
  "perceptionTranslation": {
    "title": "What May Be Happening Underneath",
    "misread": string (1-2 sentences describing how this child's behavior may APPEAR to the parent on the outside, in plain parenting language. If no qualifying nervous-system signatures, return ""),
    "underneath": string (1-2 sentences describing what the child may actually be experiencing internally. Use "may"/"might"/"can". If empty, return ""),
    "whatHelps": [string, ...2-4 concrete parenting responses, verbs first. If empty, return []]
  }
}

SOUL CONTRACT RULES (psychological framing, NOT mystical):
- Lead with PSYCHOLOGY, not destiny. Prefer "what each person helps bring out in the other" over "why these souls chose each other."
- whyTheseTwo: Look at the child's North Node and Chiron cross-aspects to the parent's chart. State plainly what each person helps the other notice, learn, or grow through. Avoid "fated", "destined", "karmic agreement", "souls chose", "cosmic", "past life". Write it the way a thoughtful therapist would.
- childLesson: Based on the child's North Node direction and the strongest challenging cross-aspects, name a real-world growth edge this child gets to practice through this parent.
- parentLesson: Look at what the child's chart activates in the parent (especially child's Sun/Moon to parent's Saturn, Chiron, or South Node). Name a real-world growth edge this parent gets to practice through this child.
- contractSentence: One plain-English sentence naming what each one helps bring out in the other. Format: "[Parent] helps [child] [verb], and [child] helps [parent] [verb]."
- NEVER use the words: wound, heal, archetypal, energies, vibration, shadow, integrate, liminal, fated, destined, karmic, cosmic, past life, soul agreement.
- Active voice always. Specific over poetic.

MOON BRIDGE: Write 2 sentences (summary) explaining how these two Moon signs interact as emotional languages. Then write one sentence (translation) in the format: "When ${body.toName} does [specific behavior], they are actually saying [what they need]." Make the translation specific to the child's Moon sign, not generic.

PRESSURE PROFILE — "How This Child Handles Pressure" (only fill if ${body.toName} is the child in this pair; otherwise return empty strings/arrays):

Purpose: Help the parent understand how this child may experience authority pressure, fear, protection, inhibition, and performance confidence. Stay careful. Do NOT diagnose abuse. Do NOT claim abuse happened from the chart. If harsh parenting is already known from context, you may describe how the child experienced and adapted to it. Always use "may", "might", "can".

Evaluate these signatures using the cross-aspects and the child's own chart (only count aspects with valid degree-based orb — Sun/Moon ≤10°, Mercury/Venus/Mars ≤6°, Jupiter/Saturn ≤6°, Uranus/Neptune/Pluto ≤5°, Chiron ≤4°, Nodes ≤4°. Same-sign is NOT an aspect.):

1. AUTHORITY PRESSURE SIGNATURE — Saturn hard aspect (conjunction, opposition, square, tight quincunx within orb) to the child's Sun. Possible patterns: fear of disappointing authority, feeling criticized, needing to earn approval, self-criticism, perfection pressure, hesitating when watched, low confidence despite ability, fear of visible mistakes.

2. MOTHER / HOME DIFFERENTIATION — Do NOT collapse Mother and Home into one meaning. Moon SIGN = emotional style. Moon HOUSE = where emotions are lived out. 4th house = home atmosphere. 4th ruler = deeper family system. A protective Moon can show a loving caregiver while a difficult 4th house/ruler can still show a tense or unsafe home atmosphere. Do NOT project Moon-sign traits directly onto the family environment unless strongly supported by the 4th house or its ruler. Example: Moon in Leo does NOT automatically mean a dramatic family — it may describe an expressive emotional style instead. Name the distinction explicitly when relevant.

3. FEARFUL CHILD SIGNATURE — Several of: Saturn hard aspect Sun, Saturn hard aspect Moon, Saturn hard aspect Ascendant, Pluto connected to 4th house/ruler, Scorpio IC or Scorpio Rising, Moon in Cancer or Pisces under stress, Chiron hard aspect Sun/Moon/Mercury/Mars, Mars/Chiron contact, Mercury/Chiron contact. Patterns: hypervigilance, walking on eggshells, fear of being wrong/yelled at, shutting down under pressure, avoiding visibility, overthinking before acting, underperforming despite intelligence.

4. PERFORMANCE EXPOSURE — Chiron conjunct Mercury, Chiron hard aspect Mars, Saturn hard aspect Mars, Saturn hard aspect Mercury, Scorpio Rising, Mars under hard Saturn/Chiron/Neptune influence, 5th house Chiron, Aries placements under Chiron/Saturn pressure. Patterns: plays well defensively but avoids the shot, passes quickly instead of initiating, avoids being center of attention, rushed choices under pressure, freezes when success requires visible action, hides full ability because failure would be public. Frame as "not lack of talent — fear of visible failure."

5. DIFFERENT CHILDREN, SAME PARENT — Do not assume siblings respond the same way. Read THIS child's chart as THIS child's adaptation (freeze/fawn/withdraw vs fight/defiance vs performance avoidance).

6. SPORTS CONFIDENCE TRANSLATION — If the child has strong fire or Mars but still avoids performance, check Chiron-Mercury, Chiron-Mars, Saturn-Mars, Saturn-Sun, Scorpio Rising, 5th house wounds, 12th house fear/inhibition. Translate as: drive exists, but visibility may trigger nervous-system safety response.

OUTPUT FORMAT for pressureProfile:
- "astrology": Name the exact qualifying signatures with their orbs (e.g. "Saturn square Sun within 2.1°", "Chiron conjunct Mars within 1.4°"). If NO qualifying signatures exist, return "" for astrology, "" for plainEnglish, [] for both arrays.
- "plainEnglish": Translate to likely behavior, age-calibrated, using "may"/"might"/"can".
- "whatTheParentMayNotice": 3-5 short observable behaviors (e.g. "smart but hesitant", "strong defense but avoids shooting", "freezes when watched", "passes responsibility quickly", "gets upset after correction").
- "whatHelps": 3-5 short supportive responses, verbs first (e.g. "praise effort before outcome", "reduce public correction", "give one simple instruction at a time", "practice pressure moments privately first", "name the fear without shaming it", "build confidence through safe repetition").

FINAL RULE: Always translate astrology into parenting behavior. Never end on "this child has Saturn opposite Sun." End on what to DO and what the child NEEDS.

REPAIR PROFILE — "What Repair Requires for This Child" (only fill if ${body.toName} is the child in this pair; otherwise return empty strings/arrays):

Purpose: Help the parent understand how this child may experience parental absence, harsh authority, repair, forgiveness, learning differences, and emotional safety. Stay careful. Do NOT diagnose abuse. Do NOT diagnose learning disabilities. Use "may"/"might"/"can". DO NOT predict whether this child will or will not forgive — describe what repair would REQUIRE for this child.

Evaluate using the child's chart and parent cross-aspects (orb-validated only):

1. PARENTAL ABSENCE / RUPTURE SIGNATURES — Sun condition, Saturn condition, 10th house, 4th house, ruler of 4th, ruler of 10th, Pluto links to 4th/10th, 8th house emphasis, 12th house emphasis. Possible themes: emotional distance from a parent, parent experienced as unavailable / unsafe / absent / hard to reach, early pressure to grow up, difficulty trusting authority, guardedness around repair, needing proof through consistent action not promises.

2. REPAIR STYLE BY CHILD TYPE — Do NOT assume siblings repair the same way. Match the child's chart to ONE primary style:
   • Fear-based child (Saturn–Sun/Moon hard, Chiron–Sun/Moon, Scorpio Rising/IC, Pluto–4th): needs safety, calm, predictability, NO pressure to forgive.
   • Intellectual child (Aquarius/Mercury emphasis, Mercury–Saturn, Mercury–Uranus, 3rd/9th emphasis): needs honest explanation, consistency, space to decide what they think.
   • Anger / protection child (Mars strong, Mars–Pluto, Aries/Scorpio emphasis, Mars–Saturn): needs validation of anger, respect for boundaries, NO forced reconciliation.
   • Sensitive / merging child (Pisces/Cancer emphasis, Moon–Neptune, 12th emphasis): needs help separating their feelings from the parent's feelings.
   • Performance-sensitive child (Chiron–Mercury/Mars, Saturn–Mercury/Mars, 5th house Chiron): needs repair through encouragement, not criticism.

3. FORGIVENESS RULE (HARD) — FORBIDDEN to write "this child will forgive" or "this child will not forgive". Use only conditional language: "Repair may be possible when safety is consistent, accountability is real, the child is not pressured, boundaries are respected, and the parent's behavior changes over time."

4. LEARNING DIFFERENCE / NONSTANDARD PROCESSING — Do NOT diagnose learning disabilities. If the chart shows Aquarius emphasis, strong Uranus, Mercury hard aspects, Mercury–Pluto, Mercury–Neptune, Mercury–Chiron, 12th-house Jupiter/Neptune/Mercury, Saturn stress to Mercury or Sun, Moon–Chiron, or Moon–Neptune, you MAY gently flag: possible nonstandard learning style, sensitivity to pressure, difficulty performing when watched, deep thinking but uneven output, intuitive/visual learning, needs time to process, may underperform when anxious, may know more than they can show on demand. Always frame as possibility, never diagnosis.

5. SELF-CONTAINED / OBSERVANT CHILD PATTERN — If chart shows several of: Aquarius Sun, Capricorn MC, Saturn emphasis, 8th house North Node, 12th house Jupiter/Neptune, Moon–Chiron — note this child may become self-contained, observant, emotionally private; understands more than they say; may look detached but is processing deeply; may forgive mentally before trusting emotionally; may need proof not promises.

OUTPUT FORMAT for repairProfile:
- "astrology": Name the exact qualifying signatures with valid orbs. If NO qualifying signatures, return "" and empty arrays.
- "plainEnglish": Describe this child's repair style and what trust would REQUIRE. Never predict forgiveness.
- "whatTheParentMayNotice": 3-5 short observable behaviors during/after rupture (e.g. "shuts down when pressured", "asks logical questions instead of showing emotion", "seems detached but remembers everything", "needs time before trusting again").
- "whatHelps": 3-5 short supportive responses, verbs first (e.g. "apologize without demanding forgiveness", "show change through repeated behavior", "keep conversations calm and brief", "respect their boundaries", "let them decide the pace of closeness").

PARENT PERCEPTION TRANSLATION — "What May Be Happening Underneath" (only fill if ${body.toName} is the child in this pair; otherwise return "" and []):

Purpose: Help the parent distinguish between the child's actual internal experience and the behavior the parent may accidentally interpret. This module is a TRANSLATION of nervous-system behavior into plain parenting language. Never excuses harmful behavior. Never villainizes the parent. Goal is translation, not blame.

Pull from the same chart signatures already evaluated for pressureProfile and repairProfile (Saturn–Sun/Moon, Chiron–Mercury/Mars, Moon–Neptune, Moon–Chiron, 12th-house emphasis, Pluto links, hard Mars contacts, hard Mercury aspects, Aquarius/Pisces/Cancer/Scorpio Moon under stress). Pick the ONE most central misread for THIS child.

Translation pairs to draw from (use whichever fit the chart, do not list more than one):
- fear may look like laziness
- overwhelm may look like defiance
- shutdown may look like indifference
- performance anxiety may look like lack of effort
- emotional flooding may look dramatic
- intellectual processing may look detached
- sensitivity may look manipulative
- hypervigilance may look controlling

OUTPUT FORMAT for perceptionTranslation:
- "misread": 1-2 sentences naming how this child's behavior may APPEAR to the parent on the outside, in plain parenting language.
- "underneath": 1-2 sentences naming what the child may actually be experiencing internally. Use "may"/"might"/"can" only.
- "whatHelps": 2-4 short concrete parenting responses, verbs first (e.g. "name what you are seeing without labeling it", "lower the stakes before asking again", "give them a private exit instead of public correction").
- If no qualifying nervous-system signatures, return "" for misread, "" for underneath, [] for whatHelps.
- HARD RULE: Never excuse harmful behavior (hitting, cruelty, etc.). Never blame the parent. Stay descriptive, not accusatory.`;

    const userPrompt = `PARENT (${fromRoleLabel}): ${body.fromName}
${body.fromPlanetsSummary}

CHILD (${toRoleLabel}): ${body.toName}${ageYears != null ? ` — age ${ageYears}` : " — age unknown"}
${body.toPlanetsSummary}

MOON BRIDGE INPUTS:
- Parent: ${body.parentMoonSummary ?? "unknown"}
- Child: ${body.childMoonSummary ?? "unknown"}

CROSS-ASPECTS (pre-scored, ranked by weight × tightness — bracketed weight is deterministic):
${aspectLines}

OVERALL INTENSITY: ${overallIntensity} (total signature weight = ${totalScore}, high-weight count = ${highWeightCount})
INTENSITY RULE: Calibrate language in pressureProfile, repairProfile, and perceptionTranslation to this label. If high-weight count is 0 or 1, use overconfirmation-protection wording ("may occasionally...") and do NOT escalate to "often" / "consistently".

QUALIFYING SIGNATURES (the ONLY cross-aspects you may cite in pressureProfile, repairProfile, or perceptionTranslation — every other aspect is OUT OF ORB and INVISIBLE for those sections):
${qualifyingLines}

ORB GATE (hard rule, no exceptions):
- Sun/Moon ≤ 10°, Mercury/Venus/Mars/Jupiter/Saturn ≤ 6°, Uranus/Neptune/Pluto ≤ 5°, Chiron ≤ 4°, Nodes ≤ 4°.
- The pair limit is the TIGHTER of the two planets' limits. A Chiron-Mercury aspect at 5.0° is OUT (Chiron caps at 4°). Do not cite it. Do not paraphrase it. Do not allude to it.
- If a signature is not in the QUALIFYING SIGNATURES block above, it does not exist for this reading.

NAMING RULE (hard rule for pressureProfile.astrology, repairProfile.astrology, and any astrology sentence in perceptionTranslation):
- Every astrology sentence must name BOTH planets with their signs AND the exact aspect AND the exact orb to one decimal.
- Required form: "[Name]'s [Planet] in [Sign] [aspect] [Name]'s [Planet] in [Sign] within [X.X]°".
- Forbidden: vague phrasings like "Cancer Moon being in a challenging aspect to your chart", "your sensitive placements clash", "the heavy Saturn energy between you", "general tension in the synastry". Reject and rewrite any sentence that does not name a specific aspect with its orb.

Write the reading. One section per cross-aspect above, in the same order. Generate 3-5 essence bullets that name the headline pattern of the relationship in real-life terms. Then the practice. Then the soulContract object following the SOUL CONTRACT RULES. Then the moonBridge object following the MOON BRIDGE rule. Then the pressureProfile object following the PRESSURE PROFILE rules. Then the perceptionTranslation object following the PARENT PERCEPTION TRANSLATION rules. Then the repairProfile object following the REPAIR PROFILE rules. Only fill pressureProfile, perceptionTranslation, and repairProfile if ${toRoleLabel} indicates the recipient is a child (roles like "child", "son", "daughter", "stepchild"); otherwise return empty strings and empty arrays for every field in those three objects.`;

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

    return new Response(
      JSON.stringify({
        ...payload,
        ageYears,
        aspectsUsed: aspects.length,
        overallIntensity,
        totalSignatureScore: totalScore,
        highWeightCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("family-pair-reading error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
