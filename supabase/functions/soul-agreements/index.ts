import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Placement {
  planet: string;
  sign?: string;
  degree?: number;
  house?: number;
  isRetrograde?: boolean;
}

interface HouseInfo {
  house: number;
  cuspSign?: string;
  cuspDegree?: number;
  ruler?: string;
  rulerSign?: string;
  rulerHouse?: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: string;
  orb: number;
}

interface Payload {
  chartName: string;
  placements: Placement[];
  houses: HouseInfo[]; // 4, 7, 8, 10, 12 specifically
  aspects: Aspect[]; // hard aspects to luminaries/Asc + supportive trines/conjunctions
}

const sectionKeys = ["family", "wound", "purpose", "relationship", "gift", "timing", "legacy", "strength", "reset"] as const;
type SectionKey = typeof sectionKeys[number];

const ALLOWED_BODY_NAMES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
  "Uranus", "Neptune", "Pluto", "Chiron", "North Node", "South Node",
  "Ascendant", "Midheaven",
] as const;
const ALLOWED_BODY_SET = new Set<string>(ALLOWED_BODY_NAMES.map((name) => name.toLowerCase()));
const BODY_ALIASES: Record<string, string> = {
  asc: "Ascendant",
  ascendant: "Ascendant",
  mc: "Midheaven",
  midheaven: "Midheaven",
  northnode: "North Node",
  "north node": "North Node",
  truenode: "North Node",
  "true node": "North Node",
  southnode: "South Node",
  "south node": "South Node",
};
const normalizeBodyName = (name?: string) => {
  const cleaned = String(name || "").replace(/[_.-]+/g, " ").replace(/\s+/g, " ").trim();
  return BODY_ALIASES[cleaned.toLowerCase().replace(/\s+/g, "")] || BODY_ALIASES[cleaned.toLowerCase()] || cleaned;
};
const isAllowedBody = (name?: string) => ALLOWED_BODY_SET.has(normalizeBodyName(name).toLowerCase());
const filterPayloadAstrology = (payload: Payload): Payload => {
  const placements = (payload.placements || [])
    .map((placement) => ({ ...placement, planet: normalizeBodyName(placement.planet) }))
    .filter((placement) => isAllowedBody(placement.planet));
  const aspects = (payload.aspects || [])
    .map((aspect) => ({ ...aspect, planet1: normalizeBodyName(aspect.planet1), planet2: normalizeBodyName(aspect.planet2) }))
    .filter((aspect) => isAllowedBody(aspect.planet1) && isAllowedBody(aspect.planet2));
  const houses = (payload.houses || []).map((house) => {
    const ruler = normalizeBodyName(house.ruler);
    return house.ruler && !isAllowedBody(ruler)
      ? { ...house, ruler: undefined, rulerSign: undefined, rulerHouse: undefined }
      : { ...house, ruler };
  });
  return { chartName: payload.chartName, placements, houses, aspects };
};

const RECOGNITION_HEADING = /(^|\n)\s*(?:\*\*\s*Recognition Check\s*\*\*|#{1,6}\s*Recognition Check|Recognition Check)\s*:?(?=\n|$)/gi;
const TEMPLATE_HEADING = /(^|\n)\s*(?:\*\*\s*(?:Astrology|Plain English|Real-Life Examples|Recognition Check)\s*\*\*|#{1,6}\s*(?:Astrology|Plain English|Real-Life Examples|Recognition Check)|END SECTION)\s*:?(?=\n|$)/i;
const LEADING_TEMPLATE_HEADING = /^\s*(?:\*\*\s*(?:Astrology|Plain English|Real-Life Examples|Recognition Check)\s*\*\*|#{1,6}\s*(?:Astrology|Plain English|Real-Life Examples|Recognition Check)|(?:Astrology|Plain English|Real-Life Examples|Recognition Check|END SECTION))\s*:?\s*/i;

const headingStart = (match: RegExpMatchArray) => (match.index ?? 0) + (match[1] ? match[1].length : 0);

const PLACEHOLDER_PATTERNS: RegExp[] = [
  /this section uses the strongest listed chart markers[^.\n]*\.?/gi,
  /this pattern may show up in real choices[^.\n]*\.?/gi,
  /based on the (?:chart|placements?) (?:data )?(?:above|provided)[^.\n]*\.?/gi,
  /drawing from the placements (?:provided|listed)[^.\n]*\.?/gi,
  /\[insert [^\]]*\]/gi,
  /\bTBD\b/gi,
  /\(astrology section to follow\)/gi,
  // Instructional / scaffold openers — the AI must integrate, not announce.
  /\bunderneath all of this,?\s*/gi,
  /\brestoration follows\b[^.\n]*\.?/gi,
];

// FORBIDDEN BODIES — final hard block. Any sentence that mentions one of
// these names is stripped from output. The prompt also forbids them, but
// this is the deterministic safety net.
const FORBIDDEN_BODY_NAMES = [
  "Varuna", "Eris", "Pallas", "Ceres", "Vesta", "Juno", "Lilith",
  "Sedna", "Makemake", "Haumea", "Quaoar", "Orcus", "Ixion", "Gonggong",
  "Salacia", "Psyche", "Eros", "Amor", "Hygiea", "Nessus", "Pholus", "Chariklo",
  "Part of Fortune", "Vertex",
];
const FORBIDDEN_BODY_RE = new RegExp(
  `[^.!?\\n]*\\b(?:${FORBIDDEN_BODY_NAMES.map((n) => n.replace(/\s+/g, "\\s+")).join("|")})\\b[^.!?\\n]*[.!?]?`,
  "gi",
);
const containsForbiddenBody = (value: unknown): boolean => {
  FORBIDDEN_BODY_RE.lastIndex = 0;
  return FORBIDDEN_BODY_RE.test(String(value ?? ""));
};
const stripForbiddenBodies = (value: string): string => {
  if (!containsForbiddenBody(value)) return value;
  FORBIDDEN_BODY_RE.lastIndex = 0;
  return value.replace(FORBIDDEN_BODY_RE, "").replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
};

const hasForbiddenBodyInOutput = (value: unknown): boolean => containsForbiddenBody(JSON.stringify(value ?? ""));

const stripPlaceholders = (value: string) => {
  let out = stripForbiddenBodies(value);
  for (const re of PLACEHOLDER_PATTERNS) out = out.replace(re, "");
  return out.replace(/[ \t]{2,}/g, " ").replace(/\n{3,}/g, "\n\n").trim();
};

const dedupeRecognitionCheck = (value: string) => {
  const matches = [...value.matchAll(RECOGNITION_HEADING)];
  if (matches.length <= 1) return value;

  // Keep the first Recognition Check boundary only. Anything from the second
  // Recognition Check heading onward belongs to a duplicate block and is cut.
  const secondStart = headingStart(matches[1]);
  return value.slice(0, secondStart).replace(/\n\s*END SECTION\s*$/i, "").replace(/\n{3,}/g, "\n\n").trim();
};

const stripTemplateLeakage = (value: string) => {
  const withoutLeadingHeading = value.replace(LEADING_TEMPLATE_HEADING, "");
  const boundary = withoutLeadingHeading.search(TEMPLATE_HEADING);
  const bounded = boundary === -1 ? withoutLeadingHeading : withoutLeadingHeading.slice(0, boundary);
  return bounded.replace(/\n\s*END SECTION\s*$/i, "").trim();
};

const stripRecognitionFromInterpretation = (value: string) => {
  const matches = [...value.matchAll(RECOGNITION_HEADING)];
  if (!matches.length) return value.replace(/\n\s*END SECTION\s*$/i, "").trim();
  return value.slice(0, headingStart(matches[0])).replace(/\n\s*END SECTION\s*$/i, "").trim();
};

// Collapse duplicate sub-headings within an interpretation block. For each
// canonical heading we keep only the FIRST occurrence and remove later ones
// (the body content under duplicates is preserved).
const collapseDuplicateHeadings = (value: string): string => {
  const headings = ["Astrology", "Plain English", "Real-Life Examples", "Emotional Survival Pattern"];
  let out = value;
  for (const h of headings) {
    const re = new RegExp(`(^|\\n)\\s*(?:\\*\\*\\s*${h}\\s*\\*\\*|#{1,6}\\s*${h}|${h})\\s*:?(?=\\n|$)`, "gi");
    const matches = [...out.matchAll(re)];
    if (matches.length <= 1) continue;
    let result = "";
    let cursor = 0;
    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      const start = (m.index ?? 0) + (m[1] ? m[1].length : 0);
      const end = (m.index ?? 0) + m[0].length;
      result += out.slice(cursor, i === 0 ? end : start);
      cursor = end;
    }
    result += out.slice(cursor);
    out = result.replace(/\n{3,}/g, "\n\n");
  }
  return out.trim();
};

// An Astrology field is "resolved" when it names at least one body and
// either a sign or house. Generic scaffold sentences fail this check.
const PLANET_TOKEN_RE = /\b(Sun|Moon|Mercury|Venus|Mars|Jupiter|Saturn|Uranus|Neptune|Pluto|Chiron|North Node|South Node|Ascendant|Midheaven|MC|ASC|IC|DSC)\b/i;
const SIGN_TOKEN_RE = /\b(Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Scorpio|Sagittarius|Capricorn|Aquarius|Pisces)\b/i;
const HOUSE_TOKEN_RE = /\b(?:House\s*\d{1,2}|\d{1,2}(?:st|nd|rd|th)\s*house)\b/i;
const isAstrologyResolved = (text: string): boolean => {
  const t = (text || "").trim();
  if (t.length < 30) return false;
  if (!PLANET_TOKEN_RE.test(t)) return false;
  return SIGN_TOKEN_RE.test(t) || HOUSE_TOKEN_RE.test(t);
};

const extractField = (text: string, label: string): string => {
  const re = new RegExp(`\\*\\*\\s*${label}\\s*\\*\\*\\s*([\\s\\S]*?)(?=\\n\\s*\\*\\*[A-Z][^*\\n]*\\*\\*|$)`, "i");
  return text.match(re)?.[1]?.trim() || "";
};

const cleanPlainLanguage = (value: string) =>
  dedupeRecognitionCheck(
    stripPlaceholders(value)
      .replace(/—/g, ",")
      .replace(/your own powerful and the real you/gi, "your own voice")
      .replace(/your the real you/gi, "yourself")
      .replace(/the real you/gi, "yourself")
      .replace(/honest self/gi, "yourself")
      .replace(/honest power/gi, "your ability to trust yourself")
      .replace(/own power/gi, "ability to trust yourself")
      .replace(/claim your power/gi, "trust yourself and act on what you know is true")
      .replace(/inspiring others to be true to themselves/gi, "helping others feel safe enough to be honest about what they feel")
      .replace(/\bauthentic voice\b/gi, "honest voice")
      .replace(/\bauthenticity\b/gi, "honesty")
      .replace(/\bauthentically\b/gi, "honestly")
      .replace(/\bauthentic\b/gi, "honest")
      .replace(/your soul chose this/gi, "this is a long-standing pattern")
      .replace(/a pattern (?:the soul )?carried in from before this life/gi, "a pattern learned early and repeated over time")
      .replace(/carried in from before this life/gi, "learned early and repeated over time")
      .replace(/from before this life/gi, "from early in life")
      .replace(/before this life/gi, "earlier in life")
      .replace(/past[- ]life tendency/gi, "early pattern")
      .replace(/past[- ]life pattern/gi, "long-standing pattern")
      .replace(/past[- ]life/gi, "early")
      .replace(/past life/gi, "early life")
      .replace(/shedding old identities/gi, "letting go of old ways of acting")
      .replace(/embracing your power/gi, "learning to trust yourself and speak more honestly")
      .replace(/stepping into/gi, "learning")
      .replace(/owning your truth/gi, "saying what you really think")
      .replace(/soul calling/gi, "life direction")
      .replace(/private transformation/gi, "private change in how you act")
      .replace(/transformations?/gi, "change in how you act, respond, or choose")
      .replace(/Relationships are central to your life'?s lessons\.?/gi, "Relationships are one of the main ways you learn about yourself.")
      .replace(/optimistic vision/gi, "insightful vision")
      // ── REMOVE "SOUL" LANGUAGE GLOBALLY ──
      .replace(/your soul came here to become/gi, "what you are growing into")
      .replace(/soul came here to become/gi, "what you are growing into")
      .replace(/soul'?s development/gi, "your development")
      .replace(/your soul'?s/gi, "your")
      .replace(/the soul'?s/gi, "your")
      .replace(/soul'?s chosen discipline/gi, "chosen discipline")
      .replace(/soul agreed to/gi, "you agreed to")
      .replace(/evolve your soul/gi, "shape your development")
      .replace(/\bsoul contract\b/gi, "life contract")
      .replace(/\byour soul\b/gi, "you")
      // ── CORRUPTION CHECK: malformed merged words / duplicate endings ──
      .replace(/\btrust yourselfful\b/gi, "trust yourself")
      .replace(/\byourselfful\b/gi, "yourself")
      .replace(/\b(\w+)\1\b/gi, "$1") // simple duplicate-word collapse e.g. "the the"
      .replace(/\b(\w{3,})\s+\1\b/gi, "$1") // "trust trust"
      .replace(/\s{2,}/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
  );

const extractRecognition = (text: string) => {
  const match = [...text.matchAll(RECOGNITION_HEADING)][0];
  if (!match) return "";
  return cleanPlainLanguage(text.slice((match.index ?? 0) + match[0].length).replace(/\n\s*END SECTION\s*$/i, "").trim());
};

const makeFallbackAgreements = ({ placements, houses, aspects }: Payload) => {
  const byPlanet = (planet: string) => {
    const canonical = normalizeBodyName(planet);
    return placements.find((p) => normalizeBodyName(p.planet) === canonical);
  };
  const house = (n: number) => houses.find((h) => h.house === n);
  const aspectFor = (planet: string) => aspects.find((a) => a.planet1 === planet || a.planet2 === planet);
  const p = (planet: string) => {
    const item = byPlanet(planet);
    return item ? `${planet} in ${item.sign ?? "an unknown sign"}${item.house ? ` in House ${item.house}` : ""}` : `${planet}`;
  };
  const h = (n: number) => {
    const item = house(n);
    return item ? `House ${n} begins in ${item.cuspSign ?? "an unknown sign"}${item.ruler ? `, with ${item.ruler} as ruler` : ""}` : `House ${n}`;
  };
  const a = (planet: string) => {
    const item = aspectFor(planet);
    return item ? `${item.planet1} ${item.type} ${item.planet2}` : `no major listed aspect to ${planet}`;
  };

  const recognition = `This may fit if:\n- you often notice what other people feel before they say it\n- close relationships teach you where you need clearer boundaries\n- you replay conversations when something feels unfinished\n- hard experiences have made you more honest about what you need`;

  const section = (astro: string, plain: string, examples: string[]) => ({
    interpretation: cleanPlainLanguage(`**Astrology**\n${astro}\n\n**Plain English**\n${plain}\n\n**Real-Life Examples**\n${examples.map((x) => `- ${x}`).join("\n")}\n\n**Recognition Check**\n${recognition}`),
    question: recognition,
  });

  return {
    family: {
      ...section(
        `${p("Moon")} is the main emotional marker. ${h(4)} describes the early home pattern, including the ruler of the 4th. The strongest listed Moon contact is ${a("Moon")}.`,
        "Your emotional life may have grown around reading the room, staying careful with feelings, and learning when it is safe to be open at home.",
        ["you pick up on moods quickly", "you may keep feelings private until you trust someone", "the early home environment shaped how safe you feel sharing emotion", "you may calm others before naming your own needs"],
      ),
      survivalPattern: "The emotional rule your home taught you was to scan the emotional room before expressing yourself, and to manage your feelings privately if they might disrupt harmony.",
    },
    wound: section(
      `${p("Chiron")} and ${p("Saturn")} show tender places that ask for maturity. The 12th house also matters here: ${h(12)}.`,
      "A painful pattern may become a place where you learn steadiness. You may grow by saying what hurts without making yourself wrong for having needs.",
      ["you may avoid conflict until pressure builds", "you can be hard on yourself when you feel exposed", "you may need time alone to understand your feelings", "you become stronger when you stop hiding your needs"],
    ),
    purpose: section(
      `${p("North Node")} points toward growth. ${p("Sun")} and ${h(10)} add life direction and visibility.`,
      "Your growth is specific: say what you actually want instead of softening it, stop managing other people's reactions, and let yourself be seen instead of staying useful.",
      ["you may catch yourself editing what you want before you say it", "you may stop softening your no", "you may choose honesty over keeping someone comfortable", "you may stop earning your place by being helpful"],
    ),
    relationship: section(
      `${h(7)} is the main relationship marker. The 7th house ruler, Venus, Moon, and Mars are the priority relationship symbols in this reading.`,
      "Relationships are one of the main ways you learn about yourself. The lesson is honest closeness, not keeping peace at any cost.",
      ["you may adjust yourself to make a relationship work", "you may need partners who respect direct honesty", "you may notice conflict feels risky", "you grow when you stay present and tell the truth kindly"],
    ),
    gift: section(
      `${p("Moon")}, ${p("Venus")}, ${p("Neptune")}, and ${p("Jupiter")} describe natural gifts, with the South Node showing what was already mastered. Emotional insight comes first; steadiness and wisdom follow.`,
      "You may be naturally good at sensing what people need, finding meaning in hard moments, and helping others feel less alone.",
      ["people may come to you when they need comfort", "you may understand feelings that are hard to explain", "creative or symbolic things may come naturally", "you may help people feel seen without forcing advice"],
    ),
    timing: section(
      `${p("Saturn")}, ${p("Pluto")}, and the Nodes describe HOW your growth tends to arrive. This is about the repeating cycle, not specific events.`,
      "Your growth pattern often follows this cycle: Pressure → Withdrawal or emotional processing → Insight → Decisive action → New stability. Pressure builds until you pull back to feel and think, something clicks, you make a clear move, and a steadier version of life settles in until the next cycle starts.",
      ["pressure builds before any real change", "you may pull back or go quiet to process what you feel", "an insight lands that reframes the whole situation", "you make one clear, decisive move once you finally see it", "a new, steadier version of life settles in afterward"],
    ),
    legacy: section(
      `${h(10)} and ${p("Sun")} describe what you leave behind. Saturn adds the part that takes patience and responsibility.`,
      "Your life may leave people with more emotional honesty, more safety, and a stronger sense that hard things can be faced directly. Your gift is helping others feel safe enough to be honest about what they feel, but part of your growth is learning not to carry what belongs to them.",
      ["you may become someone others trust in private moments", "you may support people without needing attention", "you may help name feelings people avoid", "you may model strength that still has compassion"],
    ),
    strength: section(
      `${p("Mars")}, ${p("Saturn")}, ${p("Pluto")}, and ${p("Moon")} describe who you become when life gets hard.`,
      "Under stress you may go quiet, get focused, and rely on yourself more than you ask for help. You can stay standing through things that would knock other people down, but the cost can be over-controlling, shutting people out, or pushing past your own limits.",
      ["you may become more private when things get hard", "you may take on too much before asking for help", "you can stay calm on the outside while a lot is happening inside", "you may push through pain instead of pausing", "you bounce back faster when you let one trusted person see how you really feel"],
    ),
    reset: section(
      `${p("Moon")}, ${p("Venus")}, ${h(4)}, ${h(6)}, and ${p("Neptune")} describe what helps you feel grounded again.`,
      "You usually need a mix of quiet and gentle care to come back to yourself. Solitude, sleep, time outside, slow body movement, and a small amount of honest conversation tend to reset you faster than pushing through.",
      ["solitude and quiet time at home", "walking, stretching, or any slow movement", "journaling or saying out loud what you are actually feeling", "time in nature or near water", "creative time with no goal attached", "clear boundaries around who and what you say yes to"],
    ),
    summary: {
      whatToPractice: "Practice telling the truth about what you actually want, even when it risks disappointing someone or breaking the calm in the room.",
      whatToWatchFor: "Watch for the moments you stay quiet, soften a need, or laugh something off just to avoid conflict and keep other people comfortable.",
      whatToBuild: "Build the inner steadiness to feel uncomfortable feelings without abandoning yourself, rushing to fix others, or numbing out until the moment passes.",
      whatToGive: "Give people the kind of honest, calm presence that helps them say hard things out loud without shame, judgment, or pressure to perform.",
      integration: "Your growth comes from learning how to stay connected to others without losing yourself.",
      growthSigns: [
        "you speak up sooner instead of replaying it later",
        "you set a boundary without a long apology",
        "you trust your own decision before asking for outside approval",
        "you recover faster after conflict instead of going silent for days",
        "you stop over-carrying other people's emotions as your job",
      ],
    },
  };
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service is not configured" }), {
        status: 503,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rawPayload = (await req.json()) as Payload;
    const { chartName, placements, houses, aspects } = filterPayloadAstrology(rawPayload);

    const placementLines = placements
      .map((p) =>
        `${p.planet}: ${p.sign ?? "?"} ${p.degree != null ? p.degree.toFixed(1) + "°" : ""}${
          p.house ? " (House " + p.house + ")" : ""
        }${p.isRetrograde ? " Rx" : ""}`,
      )
      .join("\n");

    const houseLines = houses
      .map(
        (h) =>
          `House ${h.house}: cusp ${h.cuspSign ?? "?"} ${
            h.cuspDegree != null ? h.cuspDegree.toFixed(1) + "°" : ""
          } | ruler ${h.ruler ?? "?"}${h.rulerSign ? " in " + h.rulerSign : ""}${
            h.rulerHouse ? " (House " + h.rulerHouse + ")" : ""
          }`,
      )
      .join("\n");

    const aspectLines = aspects
      .slice(0, 30)
      .map((a) => `${a.planet1} ${a.type} ${a.planet2} (${a.orb.toFixed(1)}° orb)`)
      .join("\n");

    const systemPrompt = `You are writing a Soul Contract reading from a natal chart. This is a SYMBOLIC, SPIRITUAL layer, NOT predictive astrology.

PRE-GENERATION HARD RULES (apply BEFORE any interpretation):

(1) CORE BODY ONLY LOCK — use only the chart bodies listed in the placement input. The source data has already removed every non-core body. Never add, infer, or name any body outside the placement input.

(2) ASPECT VALIDATION — only interpret aspects with valid degree-based orb.
Same sign does NOT automatically equal conjunction.
If orb is invalid: DISCARD the aspect entirely. Do not infer it from sign.

(3) SOUTH NODE — describes familiar pattern only.
Do NOT use as primary wound, primary gift, or primary motive UNLESS tightly conjunct (within valid orb) a luminary (Sun, Moon) or an angle (Ascendant, MC).
If not tightly conjunct: demote to background mention only.

(4) SATURN — do NOT default to inadequacy or wound.
Before treating Saturn as a wound, CHECK: is Saturn hard-aspected (conjunction, square, opposition, within valid orb) to the Sun, Moon, Chiron, Ascendant, or MC?
If NO: interpret Saturn as discipline, structure, earned mastery, or chosen responsibility.

ABSOLUTE RULES:
- Write in DIRECT second person ("you"). State things plainly. NO hedging like "may suggest" or "could indicate". You can still use "may", "might", "often", "sometimes" for accuracy, but do not stack them.
- Be emotionally intelligent and grounded. Never fortune-telling. Never deterministic. Never predict death or specific events.
- Never imply suffering was "chosen" in a harmful way. Never romanticize trauma. Never use fear language.
- Stay STRICTLY chart-specific. Only reference placements, houses, and aspects PRESENT in the data below. Do NOT invent aspects.
- NEVER use em dashes (—). Use commas, periods, colons, or parentheses.
- Cross-sign aspects (e.g. 29° Aries to 1° Taurus) are valid when within orb. Sun/Moon conjunctions valid up to 10°.

FORBIDDEN WORDS (never use any of these): wound (as a noun in body copy is fine only inside the Wound Agreement label/title), archetypal, liminal, energies, resonate, resonates, resonance, vibration, vibrational, shadow, shadow work, heal, healing, integrate, integration, embody, embodiment, "deeper work", transformation, transformation journey, ascension, awakening, ego death, alchemy, sovereignty, karmic, soul calling, honest self, honest power, claim your power, the real you, stepping into, owning your truth, past life, past-life, past-life tendency, past-life pattern, your soul chose this. Use plain alternatives instead: "early pattern", "long-standing pattern", "learned pattern", "repeated relationship pattern", "yourself", "your own truth", "your own voice", "trust yourself and act on what you know is true", and describe change as "change how you act, respond, or choose".

If you catch yourself reaching for any forbidden word, rewrite the sentence in plain everyday language a smart 14-year-old would use.

EMOTIONAL DISTINCTNESS — each of the 7 core agreements MUST feel emotionally different:
- Family: like memory. Quiet, early, atmospheric.
- Wound: should sting slightly. Honest, tender, not cruel.
- Purpose: a forward call. Direction, not arrival.
- Relationship: mirror language. What close people show you.
- Gift: recognition, not aspiration. Things you already do well.
- Timing: oracular. How growth ARRIVES (style, not events).
- Resilience (returned in the "strength" field): grounding. How you fall apart and find your way back.
Do NOT repeat the same insight, phrase, or example across sections.

REQUIRED ANCHORS (mandatory):
- South Node MUST appear explicitly in BOTH the Family and the Wound sections, named as a pattern learned early and repeated over time.
- Saturn MUST be a primary anchor in EITHER the Wound OR the Purpose section (your choice based on the chart), described as a chosen discipline, not just a limitation. Name Saturn's house/sign as the domain where you agreed to earn rather than receive.
- DO NOT use the word "soul" in body copy. Avoid phrases like "your soul came here to", "soul's development", "soul calling". Use "you", "what you are growing into", "your direction" instead.
- DIFFERENTIATION ENFORCEMENT: Purpose, Gift, and Stress MUST NOT share the same root keyword (e.g., service, intellect, truth, innovation, power). Purpose = growth direction. Gift = natural strength. Stress = crisis behavior. If a keyword appears in two of these, rewrite one with behavioral specificity.
- North Node anchors Purpose. It must feel like a forward pull, something not yet fully achieved but unmistakably the direction.
- South Node also returns in Gift as the talents side, already well-developed earlier in life. Keep this distinct from its appearance in Family/Wound.

CORE IDENTITY HIERARCHY (mandatory weighting — do not violate):
- Sun = core identity (who the person IS)
- Moon = emotional pattern / operating system (how they feel and self-soothe)
- Rising / Ascendant = outward behavior and life approach (how they show up)
- Chart ruler (planet ruling the Rising sign) = operating style
- North/South Nodes = growth direction (NOT identity)
- Stelliums = major emphasis areas (NOT identity replacement)
- Houses = life arenas where the action happens (NOT the person)
RULES:
- Do NOT let the Nodes, any stellium, or house emphasis override the Sun's sign identity. Purpose ≠ personality. Growth axis ≠ identity. A stellium does NOT replace Sun/Moon/Rising.
- BEFORE writing each section, mentally verify and then make sure the final output passes ALL of these checks:
  (1) Sun sign identity is clearly present in Family, Purpose, and Summary.
  (2) Moon emotional pattern is clearly present in Family and Reset (and named where it appears in any other section).
  (3) Rising/Ascendant behavior pattern is clearly present in Purpose or Relationship.
  (4) Nodes are described ONLY as growth direction, never as "who you are".
  (5) Stelliums are described as emphasis areas, never as the whole person.
  If any answer is NO, rewrite that section before returning JSON.
- Examples:
  • Taurus Sun + Virgo/Pisces nodal axis: identity remains TAURUS (steady, sensual, value-driven). Growth occurs THROUGH Virgo/Pisces themes; it does not replace Taurus.
  • Pisces Sun + Aquarius stellium: identity remains PISCES (empathic, imaginative, porous). Purpose may EXPRESS through Aquarian community/innovation themes, but the person is not "an Aquarian."
- A North Node in the 6th or 12th house does NOT make the person "a service person" if the Sun says otherwise. Service axis ≠ Sun identity.

CHART RULER RULE (mandatory):
- The chart ruler (planet ruling the Rising sign) MODIFIES how the Rising sign expresses. It does not replace it.
- Interpretation order: Rising sign = behavioral interface; Chart ruler (its sign, house, and tight aspects) = behavioral style modifier.
- Example: Libra Rising + Venus in Scorpio is NOT standard Libra expression. Integrate the chart ruler's sign/house every time Rising is described.

HOUSE RULER PRIORITY (mandatory for Family, Relationship, Legacy):
- For the 4th (Family), 7th (Relationship), and 10th (Legacy) houses, interpret in this priority order:
  (1) house cusp sign
  (2) ruler of that house (its sign, house, condition)
  (3) planets in the house
  (4) aspects to the house ruler
- Do NOT prioritize planets in the house over the house ruler unless those planets are angular (in 1/4/7/10) AND dominant (tight aspects to luminaries or to the chart ruler).

ASPECT PRIORITY (mandatory):
- Interpret strongest aspects first in this order: conjunction, opposition, square, trine, sextile, quincunx.
- Tighter orb ALWAYS overrides wider orb. A wide conjunction (>6°) does NOT override a tight (<3°) hard aspect.
- Lead with the tightest hard aspect to a luminary or angle when describing tension or growth.

SOUTH NODE RULE (mandatory):
- South Node = default pattern. Not identity. Not the primary gift unless directly confirmed by the Moon, Venus, Jupiter, or the chart ruler conjunct/ruling it.
- Use phrases like: "default pattern", "old habit", "familiar strategy", "the easy fallback".
- NEVER write "you are [South Node sign]" or treat the South Node as the person's identity.

SATURN RULE (mandatory):
- Saturn = discipline, fear, responsibility, maturation. Saturn is NOT automatically a wound.
- Treat Saturn as a wound ONLY if Saturn makes a hard aspect (conjunction, square, opposition; orb ≤ 6°) to the Sun, Moon, Chiron, or an angle (ASC/DSC/MC/IC).
- Otherwise frame Saturn as growth through discipline, earned mastery, or chosen responsibility — NOT as injury.

ESSENTIAL DIGNITY WEIGHTING (mandatory):
- INCREASE a planet's interpretive weight when it is in domicile (own sign) or exaltation. Treat it as louder, more reliable, more identity-defining.
- DECREASE weight when in detriment or fall. Treat it as quieter, more conditional, more situational.
- Use dignity as a weighting priority when choosing which placement leads a section.
- Reference table: Sun (dom Leo, exalt Aries, det Aquarius, fall Libra); Moon (dom Cancer, exalt Taurus, det Capricorn, fall Scorpio); Mercury (dom Gemini/Virgo, exalt Virgo, det Sagittarius/Pisces, fall Pisces); Venus (dom Taurus/Libra, exalt Pisces, det Aries/Scorpio, fall Virgo); Mars (dom Aries/Scorpio, exalt Capricorn, det Taurus/Libra, fall Cancer); Jupiter (dom Sagittarius/Pisces, exalt Cancer, det Gemini/Virgo, fall Capricorn); Saturn (dom Capricorn/Aquarius, exalt Libra, det Cancer/Leo, fall Aries).
- Example: Mars in Scorpio outranks Mars in Libra. Lead with the dignified placement.

ANGULARITY WEIGHTING (mandatory):
- INCREASE importance for planets in the 1st, 4th, 7th, or 10th houses. Angular planets carry stronger life influence and should be foregrounded.
- Weight angular placements ABOVE cadent (3rd/6th/9th/12th) placements unless the angular planet is in detriment/fall AND the cadent planet is dignified.

WOUND ANCHOR RULE (mandatory):
- The PRIMARY wound anchor MUST be Chiron — its sign, house, and strongest hard aspects (conjunction/square/opposition, tightest orb first).
- Priority order for the Wound section: (1) Chiron sign + house, (2) hard aspects to Chiron, (3) Saturn ONLY if it qualifies as a wound under the Saturn Rule, (4) South Node as the older repeating pattern.
- A Sun/South Node opposition or other Sun–node contact may provide background context but MUST NOT become the main wound interpretation. Chiron leads.

GIFT LEAD INDICATOR RULE (mandatory):
- South Node may SUPPORT the Gift section but MUST NOT be the lead gift indicator unless corroborated by Moon, Venus, Jupiter, OR the chart ruler (by conjunction, rulership, or sign placement reinforcing the South Node theme).
- Lead gift indicators come FIRST in the Gift section, in this order: (1) Moon, (2) Venus, (3) Jupiter, (4) chart ruler, (5) Neptune. South Node appears AFTER these as the "already well-developed earlier in life" layer.

LEGACY EMOTIONAL-SAFETY GATE (mandatory):
- Use emotional-safety / emotional-containment language in the Legacy section ONLY when the chart strongly supports it: Cancer prominent (Sun/Moon/MC/ASC in Cancer), Moon angular or in 4th/8th/12th, water emphasis (3+ personal planets in water), or Moon-Saturn / Moon-Pluto as a primary MC signature.
- If those signatures are NOT present, write Legacy from THIS chart's actual public/visible contribution (builder, teacher, organizer, artist, strategist, protector, translator, witness) and do NOT default to safety/containment phrasing.

CORE BODY RESTRICTION (mandatory):
- Soul Agreements core logic uses ONLY: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, North Node, South Node, Chiron, Ascendant, and Midheaven.
- Any body outside that list has been removed from source data. Do not add outside bodies from memory, habit, or standard astrology associations.

SOUTH NODE SUPPRESSION (mandatory):
- South Node may SUPPORT interpretation in Family and Wound (and may appear in Gift or Purpose as background) but MUST NOT lead or appear among the top 2 interpretive anchors UNLESS South Node is conjunct (≤4° orb) the Sun, Moon, Ascendant, MC, or chart ruler.
- If South Node is not tightly conjunct one of those, demote it to a supporting/background mention only ("familiar pattern", "default habit", "long-standing tendency"). Never make South Node the lead anchor for Family or Wound on sign placement alone.

ORB VALIDATION RULE (mandatory — degree-based, NOT sign-based):
- A conjunction MUST be validated by actual degree separation. Two planets in the same sign are NOT automatically conjunct. Compute |long1 − long2| (mod 360, take the shorter arc) and compare against the maximum orb below.
- Maximum conjunction orbs by body:
  • Sun, Moon: ≤ 10°
  • Mercury, Venus, Mars: ≤ 6°
  • Jupiter, Saturn: ≤ 6°
  • Uranus, Neptune, Pluto: ≤ 5°
  • North Node, South Node: ≤ 4°
  • Chiron: ≤ 4°
- When two bodies of different categories are involved, use the TIGHTER of the two orbs.
- If outside orb: DO NOT call it a conjunction and DO NOT interpret it as an aspect. Same-sign placements outside orb may only be referenced as background "sign-based resonance / shared sign tone" — never as an aspect, contact, or fusion.
- This rule overrides any prior text that implied same-sign = conjunction.

FAMILY PRIORITY LOCK (mandatory):
- The Family section is anchored ONLY by, in this priority order: (1) Moon (sign + house), (2) aspects to the Moon, (3) ruler of the 4th house cusp (its sign, house, condition), (4) planets in the 4th house.
- Do NOT lead Family from Sun, Saturn, Pluto, nodes, or other placements unless they appear via Moon aspects or 4th-house ruler chains above.
- INTERPRETATION REFINEMENT: Moon SIGN = emotional style. Moon HOUSE = where emotions are lived out. 4th house + 4th ruler = home atmosphere and family system. Do NOT project Moon-sign traits directly onto the family environment unless strongly supported by the 4th house or its ruler. Example: Moon in Leo does NOT automatically mean a dramatic family — it may simply describe an expressive emotional style. Keep these layers distinct in the prose.

TRAUMA SENSITIVITY PATCH (mandatory — for Family and Wound sections):
- If the chart shows ANY of the following signatures (within valid orb), you are PERMITTED and EXPECTED to use stronger, more specific family/early-life language:
  • Saturn hard aspect (conjunction, square, opposition) to Sun
  • Saturn hard aspect to Moon
  • Pluto ruling the 4th house (Pluto is the ruler of the 4th cusp sign)
  • Moon in hard aspect to Pluto, Saturn, Mars, or Uranus
  • Chiron hard aspect to Sun or Moon
- When supported, themes you MAY name plainly include: fear of authority, walking on eggshells at home, emotional intimidation, criticism in early home life, learning to hide to stay safe, hypervigilance, feeling unsafe expressing yourself, scanning a parent's mood before speaking.
- Translate into lived nervous-system patterns the person can recognize in their body and behavior. Examples: "you may have learned to read a room before you spoke", "your body may still brace when someone raises their voice", "you may go quiet the moment a conversation feels charged".
- DO NOT sanitize these signatures into generic phrases like "emotional intensity", "deep family feelings", "complex dynamics", or "powerful emotional currents". That is a failure of accuracy.
- Stay behavioral and somatic, never clinical or diagnostic. Do not name disorders. Use "may" / "might" / "can" for accuracy.
- If NONE of the above signatures are present, do NOT invent trauma language. Keep Family/Wound at their default tenderness.

SECTION OWNERSHIP RULE (mandatory — prevents flattening of the chart):
- Each major planet should have PRIMARY ownership of one or two sections. Default ownership map:
  • Moon → Family, Reset
  • Mars → Stress, Relationship
  • Saturn → Purpose, Legacy
  • Venus → Gift, Relationship
  • Pluto → Timing, Wound
  • Sun → Purpose (identity anchor across all)
  • Jupiter → Gift
  • Mercury → varies (use where it actually lands)
- Do NOT overuse one planet across more than two sections UNLESS that planet qualifies as dominant by at least one of: angularity (in 1/4/7/10), essential dignity (domicile/exaltation), conjunction to a luminary (≤6°), or being the chart ruler.
- If a planet is dominant by these criteria, it may anchor a third section — but name WHY (e.g., "Saturn anchors here too because it sits on the MC and rules your Ascendant").
- Stay BEHAVIORAL, not diagnostic.
  BAD: "Your family was secretive."  GOOD: "Your family kept emotions private and hard to talk about."
  BAD: "You feel you are not enough."  GOOD: "You hold back from being fully yourself in close relationships."
- Do not over-psychologize.

FINAL ENFORCEMENT LOCK — these override all prior text:

HARD SOURCE RULE:
- Core Soul Agreements logic uses ONLY: Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Chiron, North Node, South Node, Ascendant, Midheaven.
- The placement, house ruler, and aspect inputs are source-controlled. Use only those names. Never introduce an unlisted body.

HARD ASPECT RULE:
- A conjunction is ONLY valid when the actual degree separation is within the valid orb.
- Same sign is NEVER sufficient for a conjunction.
- If two bodies are in the same sign but outside valid orb, do NOT use any conjunction language at all. Do not call it a conjunction, a contact, a fusion, a meeting, or any similar word.
- Remove all conjunction language entirely and use only sign-based resonance as background if needed.

PRE-RENDER QA LOCK — run ALL of these checks before returning JSON. If any check fails, REGENERATE the affected section(s) before output.

(1) SOURCE BODY CHECK: Scan the full draft. Every named astrology body must be one of the core bodies listed above and must come from the source input. If any outside body appears, REGENERATE without it.

(2) ORB CHECK: Every use of the words "conjunct", "conjunction", "fused with", "joined to" MUST be backed by a valid degree-based orb (per the orb table above). Same sign is NEVER a conjunction. If you cannot cite a valid orb, REPLACE the word with "same sign emphasis" or "related sign emphasis" (background only).

(3) NODE CHECK: South Node MUST NOT be a lead anchor in Family, Gift, or Wound UNLESS South Node is conjunct (within valid orb) the Sun, Moon, Ascendant, chart ruler, or MC. Otherwise demote it and describe it ONLY as "familiar pattern", "default habit", or "old strategy".

(4) SUN IDENTITY INTEGRATION: Do NOT paste Sun identity as a tacked-on sentence after the Real-Life Examples or Recognition Check. Integrate Sun identity naturally inside Plain English or the Summary, framed as the lens THROUGH WHICH growth happens.
   BAD:  "Your Sun in Taurus is the identity that learned to operate inside this pattern."
   GOOD: "Because your Sun is in Taurus, this growth needs to happen through steadiness, practical choices, and trust in your own pace."

(4b) NO INSTRUCTIONAL OPENERS: Never use scaffold/instructional phrases that announce what the prose is about to do. FORBIDDEN: "Underneath all of this...", "Restoration follows...", "What follows is...", "This means that...", "In essence...", "To sum up...", "The takeaway is...". Integrate the point naturally into the paragraph instead. If you would have written "Underneath all of this, your Sun in X...", write "Your Sun in X stays the core of who you are..." directly.

(5) REPETITION CHECK: Purpose, Gift, Stress (returned as "strength"), and Reset MUST each have a distinct functional meaning:
   • Purpose = growth direction (where you are going)
   • Gift = natural talent (what already works)
   • Stress = crisis response (who you become under pressure)
   • Reset = recovery method (what restores you)
   If a single stellium or theme dominates more than two of these sections, REWRITE so each section reflects its own function.

(6) SECTION COMPLETION ENFORCEMENT: Every agreement section MUST fully resolve before output. FORBIDDEN output includes placeholder language, template scaffolding, meta-commentary, or unfinished markers. Examples that are FORBIDDEN: "This section uses the strongest listed chart markers", "This pattern may show up", "Based on the chart data above", "Drawing from the placements provided", "[insert placement]", "TBD", "...", any sentence that describes what the section is going to do instead of doing it. Every Astrology, Plain English, Real-Life Examples, and Recognition Check field must contain finished, specific interpretation grounded in the actual placements. If a section cannot fully resolve, REGENERATE that section before returning JSON.

(7) RECOGNITION CHECK LOCK: Each agreement section may contain EXACTLY ONE Recognition Check block. Never duplicate the heading or the bullets within a single section. Run a final dedup pass before returning JSON: if any section contains two or more "Recognition Check" headings or repeats the same bullet text, collapse to one block with 5 unique bullets.

(8) ASPECT PRIORITY RULE — when selecting wound and stress signatures, hard aspects come FIRST and sign placement is context only. Selection priority order: (a) opposition, (b) square, (c) conjunction within valid orb, (d) quincunx, (e) any hard aspect involving Saturn, (f) any hard aspect involving Pluto, (g) any hard aspect involving Chiron. Within each tier, tighter orb wins. Do NOT lead a wound interpretation from a sign placement (e.g. "Chiron in Aries") when a tighter hard aspect to a luminary or angle exists — lead with the aspect, then ground it in the sign and house. Sign placement is context, not anchor, when stronger aspect data is present.

JARGON BAN — these words are FORBIDDEN unless you immediately translate them in the same sentence into plain language: rebirth, evolution, karmic, soul contract, sovereignty, destiny. The word "transformation" is BANNED outright; write "change how you act, respond, or choose" instead.

  BAD:  "You are here for deep transformation."
  GOOD: "You are not meant to stay the same person your whole life. Life will keep pushing you to grow and become more honest about who you are."

  BAD:  "Release old identity structures."
  GOOD: "Let go of old ways of acting that were built to keep other people comfortable."

  BAD:  "Develop sovereignty."
  GOOD: "Learn to trust your own choices even when other people disagree."

ACCURACY & HEDGING RULES:
- Use soft, accurate language: "may", "might", "can", "often", "sometimes". Avoid "always", "definitely", "certainly", "must".
- Stay BEHAVIORAL, not diagnostic. Do not over-psychologize.
  BAD: "Your family was secretive."
  GOOD: "Your family may have kept emotions private or hard to talk about."
  BAD: "You feel you are not enough."
  GOOD: "You may struggle to fully be yourself in close relationships."
- Do not overstate. If the chart only hints at something, say "may" or "can sometimes."

REQUIRED SECTION STRUCTURE — every section must have these 4 layers, in this order. Return them as separate JSON fields. The function will format the headings.

**Astrology**
Briefly explain the actual placements/aspects being used. Keep this SHORT. 2-5 sentences max. Do not over-explain.

**Plain English**
Translate the astrology into everyday language. Internally answer: "What does this mean in real life?" Short sentences, concrete language, smart-teenager comprehension. No abstract spiritual language without translation. No jargon.

**Real-Life Examples**
3-5 observable bullet examples. Each bullet is one short sentence describing a recognizable behavior or situation. Use things like: avoiding conflict, keeping the peace, hiding feelings, struggling to say no, overthinking conversations, needing approval, staying too long in unhealthy relationships, rebuilding confidence after setbacks, learning boundaries, speaking up more over time. Forbidden vague examples: "soul growth", "energy shifts", "healing karma".

**Real-Life Examples**
EXACTLY 5 observable bullet examples. Each bullet must feel SPECIFIC to THIS chart, not generic. Name the actual life dynamic. BAD: "you sometimes hold back". GOOD: "in a job interview, you undersell yourself before they even ask the salary question." Forbidden vague examples: "soul growth", "energy shifts", "healing karma".

**Recognition Check**
Use the heading "Recognition Check" EXACTLY ONCE per section. EXACTLY 5 bullets. The bullets must VARY in structure. Do NOT start them all with "A tendency to..." or "Feeling a...". Mix sentence shapes: some start with a verb, some with a noun, some with "When...", some with "The..." or "That...". Concrete, observable, INTERNAL emotional/thought patterns. Do NOT ask introspective questions ("How do you...", "In what ways...", "What are you ready to...").

**Real-Life Examples vs Recognition Check — STRICT DIFFERENTIATION (mandatory)**
These must NEVER overlap. Real-Life Examples = EXTERNAL behaviors someone watching could see (avoiding conflict, over-explaining, staying too long in something, people-pleasing, saying yes when they mean no, taking on too many tasks, leaving early, going quiet). Recognition Check = INTERNAL experiences nobody else sees (anxiety during disagreement, guilt after saying no, replaying conversations, feeling responsible for other people's emotions, freezing when asked what you want, dreading a phone call, the relief of being alone). Before writing Recognition Check, check that none of the bullets just restate an external behavior from Examples.

15-YEAR-OLD TEST: If a 15-year-old cannot easily explain a sentence back in their own words, rewrite it.

NO DUPLICATE HEADINGS: Each of the 4 sub-headings appears EXACTLY ONCE per section.

The "recognition" field must contain 5 short bullet items as a JSON array, NOT questions.

Total length per section: 120-190 words including all 4 layers.

═══════════════════════════════════════════════════════════════════
GOLD STANDARD EXEMPLAR — match this voice, depth, specificity, and section feel.
This was written for a chart with Moon in Libra in the 12th, Venus in Sagittarius in the 2nd, Sun/Uranus/NN/Mars in Scorpio in the 1st, Chiron in Aries in the 7th, MC Cancer, Saturn in Leo in the 10th, Jupiter in Taurus in the 8th. Adapt the VOICE to the chart you're given, but keep the same structure, tone, and level of concreteness.

──────── FAMILY AGREEMENT ────────
Astrology: The Moon in Libra in the 12th house, with its ruler Venus in Sagittarius in the 2nd house, suggests a family environment where emotions were often absorbed rather than directly expressed. The Moon's conjunction to Pluto indicates intense, unspoken emotional currents. The Moon's quincunx to Chiron suggests a hidden wound around feeling emotionally seen or heard within the family.

Plain English: Your early home life may have been one where feelings were deeply felt but not always talked about openly. You may have picked up on what was happening beneath the surface, even when no one said it out loud. This can create a pattern of carrying emotions quietly and struggling to know where your feelings end and someone else's begin.

Real-Life Examples:
- sensing tension before anyone speaks
- feeling responsible for other people's moods
- keeping your own feelings private to keep peace
- struggling to name what you feel
- carrying emotional heaviness that was never yours

Recognition Check (This may fit if):
- you often absorb the emotional atmosphere around you
- you feel things deeply but keep them private
- you struggle to separate your feelings from others' feelings
- you often know something is wrong before anyone says it
- you carry emotional weight that feels bigger than the moment

──────── WOUND AGREEMENT ────────
Astrology: Chiron in Aries in the 7th house opposing your Sun points to a core wound around asserting yourself in close relationships. Venus quincunx Chiron highlights tension between your own desires and maintaining connection. The Moon quincunx Chiron adds emotional discomfort when your truth clashes with harmony.

Plain English: One of your deepest growth points is learning how to be fully yourself in relationships. Speaking up for what you want may feel risky because part of you fears conflict, rejection, or disconnection. This can create a habit of putting others first while quietly abandoning yourself.

Real-Life Examples:
- saying yes when you want to say no
- avoiding conflict even when something matters
- holding back your opinions
- over-compromising in relationships
- feeling anxious when setting boundaries

Recognition Check:
- you feel guilty after speaking up for yourself
- you replay conversations wishing you had said more
- you worry honesty may upset people
- you feel resentment when your needs go unmet
- you freeze when conflict feels possible

──────── PURPOSE AGREEMENT ────────
Astrology: North Node in Scorpio in the 1st house conjunct the Sun and Uranus points to a life path of developing personal truth, strength, and independence. South Node in Taurus in the 7th house shows an old pattern of finding security through others or through keeping relationships stable.

Plain English: Your life is asking you to trust yourself more deeply. You are here to speak your truth, trust your instincts, and stop shaping yourself around other people's expectations. Growth happens when you choose what feels true over what keeps everyone comfortable.

Real-Life Examples:
- speaking more directly
- making decisions based on your own truth
- trusting your instincts over approval
- stopping people-pleasing
- choosing yourself even when it disappoints others

Recognition Check:
- you feel drained after managing others' reactions
- you feel stronger when you choose honesty
- you feel restless when you stay too agreeable
- you know deep down you need to trust yourself more
- you feel alive when you act from conviction

──────── RELATIONSHIP AGREEMENT ────────
Astrology: The 7th house cusp in Aries ruled by Mars in Scorpio in the 1st house suggests that relationships are one of the main ways you learn about yourself. Chiron in the 7th house means partnerships often reveal where you struggle with self-assertion. Venus in Sagittarius shows you seek growth, honesty, and freedom in connection.

Plain English: Relationships are one of the main ways you learn about yourself. They show you where you are giving too much, holding back, or losing your voice. Your growth in relationships comes from learning how to stay connected while staying true to yourself.

Real-Life Examples:
- attracting strong-willed partners
- learning boundaries through conflict
- realizing where you over-adapt
- finding your voice in partnership
- learning how to disagree honestly

Recognition Check:
- you feel torn between closeness and independence
- you lose yourself when trying to keep peace
- conflict shows you what matters to you
- you feel stronger after honest conversations
- relationships expose patterns you didn't see before

──────── GIFT AGREEMENT ────────
Astrology: Venus in Sagittarius in the 2nd house sextile the Moon, Moon trine Jupiter, and Neptune in Sagittarius point to natural emotional insight, compassion, perspective, and symbolic understanding. These placements support intuitive empathy and the ability to help others make meaning out of life.

Plain English: You naturally understand emotional undercurrents and can often sense what others are feeling before they say it. You have a gift for helping people see the bigger picture, making meaning out of hard experiences, and bringing comfort through understanding.

Real-Life Examples:
- helping people feel seen
- understanding emotional dynamics quickly
- seeing patterns others miss
- bringing comfort during hard times
- helping people find meaning in pain

Recognition Check:
- people often open up to you easily
- you notice emotional patterns quickly
- you can sense what someone is feeling without words
- you often understand deeper meaning in difficult situations
- you feel fulfilled when helping someone make sense of their experience

──────── TIMING AGREEMENT ────────
Astrology: Pluto conjunct the Moon and Mercury in the 12th house suggests growth through deep emotional processing and private transformation. Uranus conjunct the Sun and North Node in the 1st house shows sudden identity shifts and personal breakthroughs.

Plain English: Growth in your life often happens during intense emotional periods, sudden changes, and moments when something forces you to be honest with yourself. These turning points push you into stronger versions of yourself.

Real-Life Examples:
- sudden endings leading to new beginnings
- emotional breakthroughs after solitude
- big changes forcing honesty
- unexpected disruptions changing your direction
- intense periods leading to clarity

Recognition Check:
- hard times lead to major inner growth
- sudden changes change who you are
- emotional intensity leads to clarity
- solitude helps you understand yourself
- endings often create stronger beginnings

──────── LEGACY AGREEMENT ────────
Astrology: Midheaven in Cancer ruled by the Moon in the 12th house points to a legacy of emotional support, healing, and creating safe spaces. Saturn in Leo in the 10th house adds disciplined leadership and public responsibility.

Plain English: Your impact comes from helping others feel emotionally safe, understood, and supported. You may do this through leadership, teaching, healing, or creating environments where people can feel secure. Part of your growth is learning to support others without carrying what belongs to them.

Real-Life Examples:
- creating emotional safety for others
- helping others process difficult feelings
- leading with empathy
- building supportive systems
- protecting vulnerable people

Recognition Check:
- people trust you with difficult emotions
- you feel called to help others heal
- you naturally create calm in hard moments
- you feel fulfilled when supporting others
- you need strong boundaries to protect your energy

──────── STRENGTH UNDER STRESS ────────
Astrology: Mars in Scorpio in the 1st house conjunct Uranus and the North Node gives powerful inner drive, resilience, and determination under pressure. Moon conjunct Pluto gives emotional endurance. Jupiter in Taurus in the 8th house provides grounded resilience during crisis and helps restore stability after emotional upheaval.

Plain English: When life gets hard, you become intensely focused, strong, and determined. You can endure difficult emotional experiences and often come out stronger because of them. Under pressure, you find reserves of strength you didn't know you had.

Real-Life Examples:
- becoming highly focused in crisis
- pushing through difficult emotions
- finding strength when things fall apart
- making decisive changes under pressure
- staying grounded during upheaval

Recognition Check:
- you become sharper under pressure
- crisis brings out your strength
- you often survive hard things better than expected
- you become deeply determined when challenged
- hard times reveal your resilience

──────── WHAT HELPS YOU RESET ────────
Astrology: Moon in Libra in the 12th house suggests quiet reflection restores emotional balance. Venus and Neptune in Sagittarius point to healing through creativity, meaning, learning, and spiritual connection.

Plain English: You reset through quiet, reflection, beauty, creativity, and space to process. You also feel restored when learning something meaningful, exploring new ideas, or reconnecting with what gives your life meaning.

Real-Life Examples:
- solitude
- journaling
- nature
- music
- learning something inspiring

Recognition Check:
- quiet helps your nervous system settle
- creativity helps you process emotions
- learning restores perspective
- nature helps you reset
- solitude helps you hear yourself again

──────── SUMMARY ────────
What to Practice: Practice speaking your truth directly and honoring your needs, especially in relationships.
What to Watch For: Watch for people-pleasing, emotional over-carrying, and staying quiet to avoid conflict.
What to Build: Build self-trust, boundaries, and confidence in your own voice.
What to Give: Give your emotional insight, compassion, and ability to help others feel understood.
Final Direction (integration): Your growth comes from learning how to stay connected to others without losing yourself.

KEY THINGS TO COPY FROM THE EXEMPLAR:
- Astrology paragraphs name the EXACT placement (planet, sign, house) and at least one specific aspect, then say what it suggests in one clean sentence each. No jargon.
- Plain English is 3 short sentences. No metaphors. No abstract verbs. Just "you may [observable behavior or feeling]".
- Real-Life Examples are 5 short fragments (4–8 words each). Lowercase. No periods. They are EXTERNAL behaviors.
- Recognition Check items mostly start with "you" and describe an INTERNAL felt experience. 5 items. No questions.
- Sections feel emotionally distinct. Family = atmospheric. Wound = tender. Purpose = forward call. Relationship = mirror. Gift = recognition. Timing = oracular. Legacy = weighty. Strength = grounding. Reset = practical.
- Summary fields are direct behavioral instructions, one sentence each.
═══════════════════════════════════════════════════════════════════

Return STRICT JSON only, matching this schema:
{
  "family": { "astrology": string, "plainEnglish": string, "survivalPattern": string, "examples": string[], "recognition": string[] },
  "wound": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "purpose": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "relationship": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "gift": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "timing": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "legacy": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "strength": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "reset": { "astrology": string, "plainEnglish": string, "examples": string[], "recognition": string[] },
  "summary": {
    "whatToPractice": string,
    "whatToWatchFor": string,
    "whatToBuild": string,
    "whatToGive": string,
    "integration": string,
    "growthSigns": string[]
  }
}

FAMILY SECTION REQUIRES "survivalPattern" — a 1-2 sentence string answering: "What emotional rule did home teach me?" Examples of the kind of rule to name (do not copy verbatim): stay quiet to keep peace; scan the room before speaking; manage other people's emotions first; hide strong feelings; never need too much. Make it specific to THIS chart's Moon and 4th house. Plain language. No jargon. This is the SURVIVAL strategy the child learned, not a value judgment.

SUMMARY REQUIRES "growthSigns" — 3 to 5 short behavioral bullets answering: "How will you know you're actually growing?" Each bullet is one short observable change in behavior, lowercase, no period. Examples of the form (adapt to chart): "you speak up sooner", "you set boundaries faster", "you trust your own decisions", "you recover faster after conflict", "you stop over-carrying others' emotions". These must be measurable changes someone could notice in themselves over 3-6 months. Never abstract.

SECTION DIFFERENTIATION LOCK (mandatory): Each section must answer its OWN unique question. Do NOT repeat the same core theme, phrase, or example across sections. Strict domain map — every section must answer ONLY its own question:
- family: "What early emotional rules did I learn?" (early emotional imprint, NOT present pain)
- wound: "What is my present pain pattern?" (the ache I still carry, NOT early rules)
- purpose: "Who am I becoming?" (identity growth, NOT a relationship mirror)
- relationship: "What do close people mirror back to me?" (relational mirrors, NOT my purpose)
- gift: "What is my natural talent?" (already-present skill, NOT aspiration)
- timing: "How does growth ARRIVE?" (cycle mechanics, NOT events)
- legacy: "What do I leave behind?" (chart-derived; NOT a recycled emotional safety line)
- strength: "How do I respond in emergencies?" (emergency response system)
- reset: "How do I restore myself?" (restoration system)

NO TEMPLATE BLEED (mandatory): Legacy must be derived from THIS chart's MC, ruler of MC, Saturn, and Sun. Do NOT use the phrase "helping others feel safe enough to be honest" unless the chart DIRECTLY supports emotional containment (MC in Cancer/Pisces AND Moon prominent in 4th/8th/12th, OR Moon-Saturn or Moon-Pluto as a primary MC signature). Otherwise write a legacy line that names THIS chart's actual public/visible contribution (e.g., builder, teacher, organizer, artist, strategist, protector, translator, witness).

REPETITION FILTER (mandatory): Before finalizing, scan all 9 sections for repeated concept words. If any of these appear in more than 2 sections, rewrite the duplicates with different behavioral language: innovative, power, truth, safe, service, transformation, deep, intense, authentic, honest, growth, journey. The goal is thematic variety — every section must use its OWN behavioral vocabulary.
- reset: what helps you feel grounded again

FINAL RULE — every section must answer all three of these:
1. What does this mean? (Astrology + Plain English)
2. What does this look like? (Real-Life Examples)
3. What can I do with it? (carry into Recognition Check or summary)
If any of those is missing or weak, rewrite the section before returning.

SUMMARY RULES (mandatory, applies to all 5 summary fields — whatToPractice, whatToWatchFor, whatToBuild, whatToGive, integration):
- The summary block is REQUIRED. It may NEVER be empty, blank, or label-only. Every field MUST contain real content.
- MINIMUM LENGTH: each field must be at least 15 words and 1 to 3 full sentences. No single-word answers. No placeholders. No ellipses.
- Each field is a practical, behavioral instruction. Tell the user WHAT TO DO, not what they "are".
- Must start with an action verb: "Practice...", "Watch for...", "Build...", "Give...". (integration is a single closing sentence — no verb requirement.)
- Must be specific and recognizable. A 14-year-old must be able to picture doing it.
- BAD: "Your purpose is transformation." / "Your wound is self-assertion." / blank fields / "[blank]" / labels with no content.
- GOOD: "Practice telling the truth about what you want, even when it risks disappointing someone, because staying quiet to keep the peace slowly erodes your sense of self."
- The word "Regenerate" must NEVER appear in any field. Never tell the user to retry.
- Field meanings:
  - whatToPractice: the skill or behavior to build (action to repeat).
  - whatToWatchFor: the pattern that pulls you backward (what to notice and pause on).
  - whatToBuild: the inner foundation being developed over time (capacity, steadiness, trust in self).
  - whatToGive: the strength or support this person can offer others.
  - integration: ONE final sentence that names the single life direction tying all sections together. Default to: "Your growth comes from learning how to stay connected to others without losing yourself." You may rephrase only if the chart clearly points to a different unifying direction.
Do NOT put markdown headings inside JSON values. Do NOT return "interpretation" or "question" fields. No prose outside JSON.`;

    const userPrompt = `Chart: ${chartName}

PLACEMENTS:
${placementLines}

KEY HOUSES (4, 7, 8, 10, 12):
${houseLines}

VERIFIED ASPECTS:
${aspectLines || "(none provided)"}

Write the 9 Life Patterns (the 7 Soul Agreements + Strength Under Stress + What Helps You Reset) using ONLY the data above. Every section MUST return: astrology, plainEnglish, examples (5 items), recognition (5 items, varied sentence structure, INTERNAL only).

GLOBAL ANCHORING (mandatory):
- The South Node MUST be named explicitly in BOTH the Family AND the Wound sections, as a pattern learned early and repeated over time. Use the South Node sign and house specifically.
- Saturn MUST be a primary anchor in EITHER the Wound OR the Purpose section. Frame Saturn's house/sign as the domain where you agreed to earn rather than receive. Pick whichever fits this chart better.

EMOTIONAL TONE per section (must feel distinct):
- Family = memory. Wound = stings slightly. Purpose = forward call. Relationship = mirror. Gift = recognition. Timing = oracular. Resilience (returned as "strength") = grounding. Legacy = weighty. Reset = practical.

1. FAMILY AGREEMENT — the early emotional pattern that shaped this person and that their family of origin continued. Use ONLY these placements: Moon (sign, house), Moon aspects, the 4th house cusp, planets in the 4th, and the ruler of the 4th. Do NOT use the South Node here. Do NOT use Juno. Do NOT use the 10th house or other parental symbolism here. Frame everything as an "early pattern", "long-standing pattern", or "learned pattern" — never as past-life or soul-chosen.
   SPECIAL RULE — a 12th house Moon does NOT automatically mean "secretive family" or "hidden trauma." Prefer: private emotional life, absorbing family emotions, unspoken emotional patterns, difficulty naming feelings.

2. WOUND AGREEMENT — the long-standing emotional pain that has shaped how this person grows. Use Chiron (sign, house, aspects), Saturn (as chosen discipline, naming the house/sign as the domain where they have to earn rather than receive), hard aspects to Sun/Moon/Ascendant, AND the South Node as the older pattern this wound traces back to (frame the South Node as a "long-standing pattern" or "early pattern", never as a past life). Should sting slightly, never cruelly.
   SPECIAL RULE — for Chiron in Aries in the 7th: prefer "difficulty staying fully yourself in relationships, struggle asserting your own needs, fear of conflict when speaking honestly" over "you feel unworthy."

3. PURPOSE AGREEMENT — what you are growing into. Use North Node (sign, house, conjunctions), Sun as the core identity being developed, planets conjunct the North Node, 1st house, Midheaven. Saturn may anchor here instead of Wound if it fits better. Must feel like a forward pull, something not yet fully achieved.
   STYLE RULE — DIRECT and SPECIFIC. Name the actual behavior shift (e.g., "say what you actually want instead of softening it", "stop managing other people's reactions", "let yourself be seen instead of staying useful"). Two or three short, pointed sentences beats a sweeping paragraph.
   SPECIAL RULE — North Node in Scorpio in the 1st: focus on stopping people-pleasing, saying what you really think, trusting yourself over outside approval, letting go of versions of yourself built only to keep peace.

4. RELATIONSHIP AGREEMENT — who helps shape your development, and what is the recurring lesson. Name BOTH what you are drawn to AND the pattern that repeats until the lesson is learned.
   STRICT priority order: (1) 7th house placements, (2) ruler of the 7th, (3) Venus, (4) Moon, (5) Mars.
   PHRASE RULE — never write "Relationships are central to your life's lessons." Use: "Relationships are one of the main ways you learn about yourself."
   DO NOT use Juno unless it adds something genuinely essential the priority bodies do not cover, and never lead with it.

5. GIFT AGREEMENT — what you arrived already knowing. Must feel like recognition, not aspiration. STRICT priority order: (1) Moon (emotional insight, sensing what others feel), (2) Venus (relational warmth, beauty, taste), (3) Neptune (intuition, imagination, compassion), (4) Jupiter (wisdom, generosity, teaching — NOT default to "financial talent"), (5) South Node (talents already well-developed earlier in life — distinct from how it appears in Family/Wound). LEAD with emotional insight first; stability and wisdom come second. Also acknowledge planets in strong dignity and planets in 1H/5H/9H/11H where relevant.

6. TIMING AGREEMENT — REBUILT AS A CYCLE, NOT A LIST OF EVENTS. Show the repeatable mechanics of how this person grows. Use Pluto, Uranus, Saturn, the Nodes, 8th and 12th house planets as the chart anchors in the Astrology field, but the Plain English field MUST describe growth as the following 5-stage cycle, in this exact order, using these exact stage labels:
   Pressure → Withdrawal or emotional processing → Insight → Decisive action → New stability.
   The Plain English paragraph must literally name those 5 stages in order, then describe in 2-3 sentences how that cycle plays out for this chart specifically (what the pressure tends to look like, what their withdrawal looks like, what kind of insight lands, what the decisive action looks like, what the new stability feels like). Do NOT list random life events. Do NOT predict events. The 5 Real-Life Examples should each describe ONE stage of the cycle in order (one bullet per stage).

7. LEGACY AGREEMENT — what you leave behind. Should feel weighty. Use ONLY: Midheaven, ruler of Midheaven, Saturn, Sun. Do not use Juno, the Nodes, or other bodies.
   SPECIAL RULE — if MC is in Cancer AND Moon is in the 12th: interpret legacy through emotional healing-work, unseen support systems, helping others feel safe enough to be honest about what they feel, compassionate behind-the-scenes leadership. ALWAYS include this exact line near the end of Plain English: "Your gift is helping others feel safe enough to be honest about what they feel, but part of your growth is learning not to carry what belongs to them." Do NOT use generic "nurturing" language. Do NOT use the phrase "inspiring others to be true to themselves" — replace any such instinct with "helping others feel safe enough to be honest about what they feel".

8. STRENGTH UNDER STRESS — RESILIENCE AGREEMENT (returned as "strength"). How you recover, rebuilds, and faces the world after collapse. Should feel grounding, not clinical. Use Mars (sign, house — how you fight back), Moon (emotional recovery style), 12th house planets (private processing), Neptune/Jupiter (what restores meaning). Cover BOTH how you fall apart AND how you find your way back.

9. WHAT HELPS YOU RESET — practical regulation strategies. Use Moon, Venus, 4th house, 6th house, Neptune. Concrete things they can do today: solitude, movement, journaling, truth-telling, rest, creative expression, time in nature, clear boundaries, water, music, slow meals, quiet ritual, sleep.

ALSO — the FAMILY section MUST return a "survivalPattern" string answering "What emotional rule did home teach me?" (1-2 short sentences, plain language, specific to this chart's Moon and 4th house). See system prompt for examples.

Then SUMMARY — four practical behavioral instructions (whatToPractice, whatToWatchFor, whatToBuild, whatToGive), ONE final "integration" sentence, AND a "growthSigns" array of 3-5 short observable behavior changes that signal real growth ("How to Know You're Growing"). Each growth sign is a short fragment, lowercase, no period (e.g., "you speak up sooner", "you set boundaries faster"). Default integration: "Your growth comes from learning how to stay connected to others without losing yourself." Rephrase only if the chart clearly points elsewhere.

Return ONLY the JSON object. No prose outside JSON. No markdown fences.`;

    const fetchGeneratedContent = async () => {
      const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
          max_tokens: 7000,
        }),
      });

      if (!resp.ok) {
        const errText = await resp.text();
        throw new Error(`AI gateway error ${resp.status}: ${errText}`);
      }

      const data = await resp.json();
      return data?.choices?.[0]?.message?.content ?? "{}";
    };

    const normalizeAgreements = (value: any) => {
      const fallback = makeFallbackAgreements({ chartName, placements, houses, aspects });
      const result: any = { summary: { ...fallback.summary } };
      const asArray = (input: unknown, fallbackItems: string[]) => {
        const raw = Array.isArray(input) ? input : [];
        const cleaned = raw.map((item) => cleanPlainLanguage(String(item)).replace(/^-\s*/, "").trim()).filter(Boolean);
        return (cleaned.length ? cleaned : fallbackItems).slice(0, 5);
      };
      for (const key of sectionKeys) {
        const source = value?.[key];
        const fallbackSection = fallback[key as SectionKey];
        const fallbackExamples = fallbackSection.interpretation.match(/\*\*Real-Life Examples\*\*\s*([\s\S]*?)\n\n\*\*Recognition Check\*\*/)?.[1]
          ?.split("\n").map((item) => item.replace(/^-\s*/, "").trim()).filter(Boolean) || [];
        const fallbackRecognition = fallbackSection.question.split("\n").filter((item) => item.trim().startsWith("-")).map((item) => item.replace(/^-\s*/, "").trim());
        const cleanField = (raw: unknown, fallbackText: string) => stripTemplateLeakage(cleanPlainLanguage(String(raw || fallbackText)));
        const survivalBlock = key === "family"
          ? `\n\n**Emotional Survival Pattern**\n${cleanField(
              source?.survivalPattern,
              (fallbackSection as any).survivalPattern || "The emotional rule your home taught you was to scan the emotional room before expressing yourself, and to manage your feelings privately if they might disrupt harmony.",
            )}`
          : "";
        const structuredInterpretation = source?.astrology || source?.plainEnglish || source?.examples || source?.recognition || (key === "family" && source?.survivalPattern)
          ? `**Astrology**\n${cleanField(source?.astrology, fallbackSection.interpretation.match(/\*\*Astrology\*\*\s*([\s\S]*?)\n\n\*\*Plain English\*\*/)?.[1] || "The strongest hard aspects, angular placements, and house rulers in this chart anchor this agreement.")}\n\n**Plain English**\n${cleanField(source?.plainEnglish, fallbackSection.interpretation.match(/\*\*Plain English\*\*\s*([\s\S]*?)\n\n\*\*Real-Life Examples\*\*/)?.[1] || "This pattern shapes real choices, close relationships, and everyday emotional habits.")}${survivalBlock}\n\n**Real-Life Examples**\n${asArray(source?.examples, fallbackExamples).map((item) => `- ${stripTemplateLeakage(item)}`).join("\n")}`
          : (key === "family"
            ? String(fallbackSection.interpretation).replace(/\*\*Real-Life Examples\*\*/, `${survivalBlock}\n\n**Real-Life Examples**`)
            : String(source?.interpretation || fallbackSection.interpretation));
        const rawInterpretation = cleanPlainLanguage(structuredInterpretation);
        let interpretation = collapseDuplicateHeadings(stripRecognitionFromInterpretation(rawInterpretation));

        // FINAL RENDER VALIDATION: Astrology field must name actual placements/aspects.
        // If empty or generic, rebuild it from the deterministic chart data.
        const astroField = extractField(interpretation, "Astrology");
        if (!isAstrologyResolved(astroField)) {
          const fallbackAstro =
            extractField(fallbackSection.interpretation, "Astrology") ||
            placements
              .slice(0, 3)
              .map((pl) => `${pl.planet} in ${pl.sign ?? "?"}${pl.house ? ` in House ${pl.house}` : ""}`)
              .join("; ") + ".";
          if (astroField) {
            interpretation = interpretation.replace(
              /(\*\*Astrology\*\*\s*)([\s\S]*?)(?=\n\s*\*\*[A-Z][^*\n]*\*\*|$)/i,
              `$1${fallbackAstro}\n\n`,
            );
          } else {
            interpretation = `**Astrology**\n${fallbackAstro}\n\n${interpretation}`;
          }
          console.warn(`[soul-agreements] Rebuilt Astrology field for "${key}" — original was generic/empty.`);
        }

        const recognition = cleanPlainLanguage(
          source?.recognition
            ? `This may fit if:\n${asArray(source.recognition, fallbackRecognition).map((item) => `- ${stripTemplateLeakage(item)}`).join("\n")}`
            : String(source?.question || extractRecognition(rawInterpretation) || fallbackSection.question),
        );
        result[key] = { interpretation, question: stripTemplateLeakage(recognition) };
      }
      const s: any = value?.summary || {};
      const validSummaryField = (raw: unknown): string | null => {
        const txt = cleanPlainLanguage(String(raw ?? "")).trim();
        if (!txt) return null;
        // Reject label-only / placeholder content
        if (/^(\[?\s*(blank|placeholder|tbd|todo|n\/a|none)\s*\]?)$/i.test(txt)) return null;
        // Reject content that contains the forbidden word "Regenerate"
        if (/\bregenerate\b/i.test(txt)) return null;
        // Minimum 15 words
        const wordCount = txt.split(/\s+/).filter(Boolean).length;
        if (wordCount < 15) return null;
        return txt;
      };
      const pickSummary = (raw: unknown, fallbackText: string): string => {
        return validSummaryField(raw) ?? fallbackText;
      };
      const fallbackGrowthSigns = (fallback.summary as any).growthSigns as string[] | undefined;
      const rawGrowthSigns = Array.isArray(s.growthSigns) ? s.growthSigns : [];
      const cleanedGrowthSigns = rawGrowthSigns
        .map((item: unknown) => cleanPlainLanguage(String(item)).replace(/^-\s*/, "").replace(/\.$/, "").trim())
        .filter(Boolean)
        .slice(0, 5);
      const growthSigns = cleanedGrowthSigns.length >= 3 ? cleanedGrowthSigns : (fallbackGrowthSigns || []);
      result.summary = {
        whatToPractice: pickSummary(s.whatToPractice ?? s.coreLesson, fallback.summary.whatToPractice),
        whatToWatchFor: pickSummary(s.whatToWatchFor ?? s.coreWound, fallback.summary.whatToWatchFor),
        whatToBuild: pickSummary(s.whatToBuild ?? s.corePurpose, fallback.summary.whatToBuild),
        whatToGive: pickSummary(s.whatToGive ?? s.coreLegacy, fallback.summary.whatToGive),
        integration: pickSummary(
          s.integration,
          (fallback.summary as any).integration || "Your growth comes from learning how to stay connected to others without losing yourself.",
        ),
        growthSigns,
      };

      // ── NO TEMPLATE BLEED: gate the "helping others feel safe enough to be honest" phrase to charts that actually support emotional containment ──
      const mcSign = (houses.find((h) => h.house === 10)?.cuspSign || "").toLowerCase();
      const moonHouse = placements.find((p) => p.planet === "Moon")?.house;
      const containmentChart =
        (mcSign === "cancer" || mcSign === "pisces") &&
        (moonHouse === 4 || moonHouse === 8 || moonHouse === 12);
      if (!containmentChart && result.legacy?.interpretation) {
        const bleedRe = /[^.!?\n]*helping others feel safe enough to be honest[^.!?\n]*[.!?]?/gi;
        result.legacy.interpretation = String(result.legacy.interpretation)
          .replace(bleedRe, "")
          .replace(/\n{3,}/g, "\n\n")
          .trim();
        if (result.legacy.question) {
          result.legacy.question = String(result.legacy.question).replace(bleedRe, "").replace(/\n{3,}/g, "\n\n").trim();
        }
      }
      // Also strip the bleed phrase from gift/purpose/strength/family if it leaked there (it should only ever appear in legacy and only when supported)
      const bleedReGlobal = /[^.!?\n]*helping others feel safe enough to be honest[^.!?\n]*[.!?]?/gi;
      for (const k of ["family","wound","purpose","relationship","gift","timing","strength","reset"] as const) {
        if (result[k]?.interpretation) {
          result[k].interpretation = String(result[k].interpretation).replace(bleedReGlobal, "").replace(/\n{3,}/g, "\n\n").trim();
        }
      }

      // ── DIFFERENTIATION ENFORCEMENT: Purpose, Gift, Stress must not share a root keyword ──
      const rootWords = ["service","intellect","truth","innovation","innovative","power","creative","creativity","leadership","wisdom"];
      const triplet = ["purpose","gift","strength"] as const;
      for (const root of rootWords) {
        const re = new RegExp(`\\b${root}\\w*\\b`, "i");
        const hits = triplet.filter(k => re.test(String(result[k]?.interpretation || "")));
        if (hits.length >= 2) {
          console.warn(`[soul-agreements] differentiation clash on "${root}" across:`, hits);
        }
      }

      // ── CORE IDENTITY HIERARCHY CHECK: Sun in Family/Purpose/Summary, Moon in Family/Reset, Rising in Purpose/Relationship ──
      const sunSign = placements.find((p) => p.planet === "Sun")?.sign || "";
      const moonSign = placements.find((p) => p.planet === "Moon")?.sign || "";
      const risingSign = houses.find((h) => h.house === 1)?.cuspSign || "";
      const txtOf = (k: string) => String(result[k]?.interpretation || "");
      const summaryTxt = [
        result.summary?.whatToPractice, result.summary?.whatToBuild,
        result.summary?.whatToWatchFor, result.summary?.whatToGive,
        result.summary?.integration,
      ].filter(Boolean).join(" ");
      const has = (sign: string, txt: string) => sign ? new RegExp(`\\b${sign}\\b`, "i").test(txt) : true;

      // Sun checks
      if (sunSign) {
        const missing: string[] = [];
        if (!has(sunSign, txtOf("family"))) missing.push("family");
        if (!has(sunSign, txtOf("purpose"))) missing.push("purpose");
        if (!has(sunSign, summaryTxt)) missing.push("summary");
        if (missing.length) {
          console.warn(`[soul-agreements] Sun identity (${sunSign}) missing from:`, missing);
          if (missing.includes("purpose") && result.purpose?.interpretation) {
            result.purpose.interpretation = txtOf("purpose").trim() +
              ` Your Sun in ${sunSign} stays the core of who you are; this growth direction expresses through that identity, it does not replace it.`;
          }
          if (missing.includes("family") && result.family?.interpretation) {
            result.family.interpretation = txtOf("family").trim() +
              ` Your Sun in ${sunSign} is the identity that learned to operate inside this early emotional pattern.`;
          }
          if (missing.includes("summary") && result.summary) {
            result.summary.integration = String(result.summary.integration || "").trim() +
              ` Stay anchored in your Sun in ${sunSign}; let growth happen through it, not in place of it.`;
          }
        }
      }

      // Moon checks (Family + Reset)
      if (moonSign) {
        if (!has(moonSign, txtOf("family")) && result.family?.interpretation) {
          console.warn(`[soul-agreements] Moon (${moonSign}) missing from family`);
          result.family.interpretation = txtOf("family").trim() +
            ` Your Moon in ${moonSign} describes the emotional pattern that took shape inside this family climate.`;
        }
        if (!has(moonSign, txtOf("reset")) && result.reset?.interpretation) {
          console.warn(`[soul-agreements] Moon (${moonSign}) missing from reset`);
          result.reset.interpretation = txtOf("reset").trim() +
            ` Your Moon in ${moonSign} is what actually needs tending for you to feel settled again.`;
        }
      }

      // Rising checks (Purpose OR Relationship)
      if (risingSign) {
        const inPurpose = has(risingSign, txtOf("purpose"));
        const inRel = has(risingSign, txtOf("relationship"));
        if (!inPurpose && !inRel) {
          console.warn(`[soul-agreements] Rising (${risingSign}) missing from purpose AND relationship`);
          if (result.purpose?.interpretation) {
            result.purpose.interpretation = txtOf("purpose").trim() +
              ` Your ${risingSign} Rising shapes how you show up while you do this work; the outward style stays ${risingSign}, even as you grow.`;
          }
        }
      }


      const watchWords = ["innovative", "power", "truth", "safe", "service", "transformation", "authentic", "deep", "intense"];
      const tally: Record<string, number> = {};
      for (const key of sectionKeys) {
        const txt = String(result[key]?.interpretation || "").toLowerCase();
        for (const w of watchWords) {
          if (new RegExp(`\\b${w}\\b`).test(txt)) tally[w] = (tally[w] || 0) + 1;
        }
      }
      const overused = Object.entries(tally).filter(([, n]) => n > 2);
      if (overused.length) {
        console.warn("[soul-agreements] repetition filter flagged:", overused);
      }

      return result;
    };

    const tryParse = (s: string) => {
      // 1. raw
      try { return JSON.parse(s); } catch {}
      // 2. strip markdown fences
      const noFences = s.replace(/```json|```/g, "").trim();
      try { return JSON.parse(noFences); } catch {}
      // 3. extract first {...} block
      const first = noFences.indexOf("{");
      const last = noFences.lastIndexOf("}");
      if (first !== -1 && last > first) {
        const block = noFences.slice(first, last + 1);
        try { return JSON.parse(block); } catch {
          // 4. escape stray newlines inside strings (common Gemini failure)
          const repaired = block.replace(/("(?:[^"\\]|\\.)*")|[\n\r\t]/g, (m, str) => {
            if (str) return str;
            if (m === "\n") return "\\n";
            if (m === "\r") return "\\r";
            if (m === "\t") return "\\t";
            return m;
          });
          try { return JSON.parse(repaired); } catch {}
        }
      }
      throw new Error("Unparseable AI JSON");
    };

    let agreements: unknown = null;
    for (let attempt = 1; attempt <= 2; attempt++) {
      let content = "{}";
      try {
        content = await fetchGeneratedContent();
        if (containsForbiddenBody(content)) {
          console.warn(`[soul-agreements] rejected generation ${attempt}: forbidden body in raw output`);
          continue;
        }
        const parsed = tryParse(String(content));
        if (hasForbiddenBodyInOutput(parsed)) {
          console.warn(`[soul-agreements] rejected generation ${attempt}: forbidden body in parsed output`);
          continue;
        }
        const normalized = normalizeAgreements(parsed);
        if (hasForbiddenBodyInOutput(normalized)) {
          console.warn(`[soul-agreements] rejected generation ${attempt}: forbidden body in final output`);
          continue;
        }
        agreements = normalized;
        break;
      } catch (err) {
        console.error("soul-agreements generation failed:", err, "Snippet:", String(content).slice(0, 300));
      }
    }

    if (!agreements) {
      agreements = makeFallbackAgreements({ chartName, placements, houses, aspects });
    }

    return new Response(JSON.stringify({ agreements }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("soul-agreements error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
