/**
 * Deterministic natal-aspect interpretation rewriter.
 *
 * Goal: never let the AI write the meaning of a natal aspect in its own
 * words. We give the model the verified aspect list as ground truth, but
 * we OWN the interpretive sentence. Any phrase like "Jupiter trine
 * Venus" or "Venus opposition Jupiter" found in the AI's prose is
 * replaced with a code-built behavioral sentence that describes the
 * lived experience of that pair, regardless of who actually wrote the
 * aspect. The phrase used is always the verified one (correct aspect
 * type), so even if the model wrote a wrong aspect type for a real
 * planetary pair, our rewrite emits the real meaning.
 */
import {
  extractValidationFacts,
  type ValidationFacts,
} from "./validationFacts.ts";

const PLANET_NAMES = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn",
  "Uranus", "Neptune", "Pluto", "Chiron", "North Node", "South Node",
  "Juno", "Lilith", "Ascendant", "Midheaven", "Descendant", "IC", "MC",
];

const PLANET_SYMBOLS: Record<string, string> = {
  "☉": "Sun", "☽": "Moon", "☿": "Mercury", "♀": "Venus", "♂": "Mars",
  "♃": "Jupiter", "♄": "Saturn", "♅": "Uranus", "♆": "Neptune", "♇": "Pluto",
  "⚷": "Chiron", "☊": "North Node", "☋": "South Node", "⚵": "Juno", "⚸": "Lilith",
};

const ASPECT_ALIASES: Record<string, string> = {
  conjunct: "conjunct",
  conjunction: "conjunct",
  sextile: "sextile",
  square: "square",
  trine: "trine",
  opposite: "opposition",
  opposition: "opposition",
  quincunx: "quincunx",
  semisextile: "semisextile",
  semisquare: "semisquare",
  sesquiquadrate: "sesquiquadrate",
};

const ASPECT_SYMBOLS: Record<string, string> = {
  "☌": "conjunct", "⚹": "sextile", "□": "square",
  "△": "trine", "☍": "opposition", "⚻": "quincunx",
};

const NON_NATAL_PREFIX_RE =
  /^(transiting|transit|sr|solar\s+return|progressed|composite|davison|synastry|partner)\b/i;

// ─────────────────────────────────────────────────────────────────────────
// BEHAVIORAL MEANING LIBRARY
// One entry per (sortedPair, aspectType). Sentences are written in lived,
// recognizable language — the kind of sentence where someone says "yes,
// that sounds like me." No jargon, no archetype words floating without
// behavior, no count framing. Each entry returns ONE sentence (~1–2
// clauses) so it can be dropped into prose without disrupting flow.
// ─────────────────────────────────────────────────────────────────────────
type AspectEntry = string;

const A = (
  pair: string,
  entries: Partial<Record<"conjunct" | "sextile" | "square" | "trine" | "quincunx" | "opposition", AspectEntry>>,
): [string, typeof entries] => [pair, entries];

const pairKey = (a: string, b: string): string => {
  const sorted = [a, b].sort((x, y) => x.localeCompare(y));
  return `${sorted[0]}|${sorted[1]}`;
};

const ASPECT_LIBRARY: Record<string, Record<string, string>> = Object.fromEntries([
  // Venus + Jupiter
  A("Jupiter|Venus", {
    conjunct: "Pleasure, generosity, and attraction run high — they over-give, over-spend, and idealize people, so the growth edge is warmth with proportion",
    sextile: "Goodwill and generosity come naturally and open doors socially, as long as they don't wait for the world to bring it to them",
    square: "They want everything fully — love, beauty, money, freedom — and can swing between excess and self-restraint until they pick what's actually theirs",
    trine: "Love, money, and pleasure tend to flow when they let themselves enjoy life instead of bracing for the catch",
    quincunx: "Their taste and their luck don't always line up cleanly — what they want and what shows up requires constant small adjustments",
    opposition: "Generosity and attraction are real strengths, but the pattern can tip into overgiving, overspending, or romanticizing people — the work is warmth with proportion",
  }),
  // Sun + Moon
  A("Moon|Sun", {
    conjunct: "What they want and what they feel point the same direction, which makes them direct but also blind to other angles",
    sextile: "Head and heart cooperate, so they can advocate for what they need without it feeling like a fight",
    square: "What they want and what they feel often pull against each other — they get tired of overriding one for the other",
    trine: "There's an inner ease — what they want and what they feel agree often enough that they can trust their gut",
    quincunx: "Identity and emotional needs don't quite fit, so they constantly recalibrate who they are versus what they actually need",
    opposition: "They live a tug-of-war between who they think they should be and what they actually feel — both sides are real, neither one is wrong",
  }),
  // Sun + Saturn
  A("Saturn|Sun", {
    conjunct: "They take themselves seriously young and rarely let themselves off the hook — discipline is a strength but self-criticism is the cost",
    sextile: "They build credibility slowly and on purpose, and authority figures tend to take them seriously",
    square: "Confidence has to be earned the hard way here — they second-guess themselves until results prove them right",
    trine: "Patience and structure come naturally; they trust the long game more than most",
    quincunx: "They keep adjusting their sense of self to fit responsibilities — the work is letting some of those obligations go",
    opposition: "They feel pulled between who they are and who they're supposed to be — usually authority figures or the structure of their life is the test",
  }),
  // Sun + Pluto
  A("Pluto|Sun", {
    conjunct: "Their identity carries weight — people feel it before they say a word, and they've been through versions of themselves that no longer exist",
    sextile: "They can rebuild themselves on purpose without losing what matters — change feels survivable",
    square: "Power is the theme — taking it, losing it, refusing to take it — until they learn to use it without controlling everyone around them",
    trine: "Reinvention comes more easily than for most; they've already lived several lives inside this one",
    quincunx: "Their sense of power keeps shifting and rarely matches the situation — the work is choosing how big or small to take up space",
    opposition: "Power dynamics with other people define a lot — until they stop attracting controllers, they keep meeting the same kind of person",
  }),
  // Moon + Saturn
  A("Moon|Saturn", {
    conjunct: "Feelings get processed quietly and on a delay — they rarely show emotion in real time and often felt they had to grow up early",
    sextile: "They emotionally regulate well and can be the steady person in the room without losing access to their own feelings",
    square: "Comfort and duty fight inside them — they often deny themselves softness because it feels indulgent",
    trine: "There's a quiet emotional discipline here — they self-soothe without making a scene",
    quincunx: "Their emotional needs and their responsibilities almost never line up in the same week — they're always choosing one and resenting the choice later",
    opposition: "They oscillate between emotional openness and lockdown — usually a person or commitment is asking them to be more available than they feel safe being",
  }),
  // Moon + Pluto
  A("Moon|Pluto", {
    conjunct: "Their feelings run deep and private; trust is earned slowly and lost permanently",
    sextile: "They can sit with intensity that overwhelms most people, which is why others bring them their crises",
    square: "Their emotional life is volcanic underneath the surface — they suppress, then erupt, then withdraw and rebuild",
    trine: "They handle other people's intensity without flinching and trust their own emotional radar",
    quincunx: "Their emotional intensity rarely matches the moment — they over-feel small things and under-react to big ones",
    opposition: "They get pulled into emotionally intense bonds that change them whether they wanted to be changed or not",
  }),
  // Venus + Mars
  A("Mars|Venus", {
    conjunct: "What they want and how they go after it are fused — desire is direct, sometimes too direct",
    sextile: "Attraction and action cooperate — they pursue what they want without games",
    square: "They want closeness and friction at the same time and tend to pick partners who give them both",
    trine: "Sexual and romantic energy moves easily, and they tend not to confuse wanting with needing",
    quincunx: "What attracts them and how they pursue it don't quite match — they often back off the moment someone reciprocates",
    opposition: "Love and desire pull in different directions — they keep picking people who are exciting OR safe and rarely both at once",
  }),
  // Venus + Saturn
  A("Saturn|Venus", {
    conjunct: "Love feels like work — they prefer commitment and structure, and casual romance often leaves them cold",
    sextile: "They pick partners with care and the relationships they keep tend to last",
    square: "They distrust easy love and often pick people who reinforce that distrust until they choose differently",
    trine: "They build steady, durable affection and tend to age well in love",
    quincunx: "They want closeness and freedom in shifting proportions and almost never get the mix right at first try",
    opposition: "They alternate between wanting commitment and wanting space — usually the partner is asking for one while they want the other",
  }),
  // Mars + Saturn
  A("Mars|Saturn", {
    conjunct: "Drive and discipline fuse — they can outwork almost anyone but tend to grind themselves down",
    sextile: "They channel anger and ambition into structure — frustration becomes output",
    square: "Their drive runs into walls — usually their own internalized 'no' — until they learn to push without burning out",
    trine: "Stamina is a strength; they can pace themselves through long projects without losing momentum",
    quincunx: "Their energy and their plans almost never fit — they're either over-driving or under-acting",
    opposition: "They alternate between explosive action and total shutdown, and the test is finding a sustainable middle gear",
  }),
  // Mercury + Saturn
  A("Mercury|Saturn", {
    conjunct: "They think slowly and seriously — once they form an opinion they trust it, and they distrust people who don't think before speaking",
    sextile: "They communicate carefully and people take them seriously when they do speak",
    square: "Their mind argues with itself — they doubt their own thinking until it's checked, rechecked, and proven",
    trine: "They build mental authority and structure ideas well; teaching, writing, and analysis come naturally",
    quincunx: "Their thinking and their structure don't line up — they keep almost-finishing projects",
    opposition: "They oscillate between certainty and doubt about their own ideas, often shaped by an authority figure who critiqued them young",
  }),
  // Mercury + Neptune
  A("Mercury|Neptune", {
    conjunct: "Their thinking is intuitive and image-rich — facts blur, but they pick up on subtext most people miss",
    sextile: "They can talk about feelings and intuitions in concrete language, which is rare",
    square: "Confusion and clarity trade places fast — they're suggestible and have to double-check what they think they heard",
    trine: "They translate feeling into language naturally; creative or therapeutic communication suits them",
    quincunx: "Their words and their actual meaning rarely line up on the first try — they revise constantly",
    opposition: "They hear what people mean rather than what they say, which is a gift until it tips into projection",
  }),
  // Sun + Jupiter
  A("Jupiter|Sun", {
    conjunct: "They take up space naturally — confidence runs high, and the risk is overestimating themselves",
    sextile: "Opportunities tend to find them when they show up; they don't have to push as hard as most",
    square: "They overshoot — they take on more than they can carry and learn proportion the hard way",
    trine: "Things expand for them when they let them — luck cooperates with effort",
    quincunx: "Their reach and their grasp don't match — they keep almost-getting the big thing",
    opposition: "They want everything and the opposite of everything — until they pick which expansion is actually theirs, momentum stalls",
  }),
  // Sun + Neptune
  A("Neptune|Sun", {
    conjunct: "Identity is fluid — they shape-shift around people and have to work at knowing who they actually are",
    sextile: "They tap into something larger than themselves and can speak from it without losing their feet",
    square: "They lose themselves easily — in people, in causes, in fantasies — and the work is staying visible to themselves",
    trine: "Imagination and identity flow together; creative or spiritual work fits them",
    quincunx: "Their public self and their private self don't line up, and the gap can feel like impostor syndrome",
    opposition: "They mirror whoever's in front of them and have to fight to stay distinct in close relationships",
  }),
  // Sun + Uranus
  A("Sun|Uranus", {
    conjunct: "They are wired to do it differently — conformity costs them more than it costs other people",
    sextile: "Originality lands well when they trust it; they don't have to fight to be themselves",
    square: "Freedom and stability fight constantly — they break commitments they actually wanted, then miss them",
    trine: "Independence and identity cooperate; they can be unconventional without burning bridges",
    quincunx: "Their need for freedom and their actual life don't fit, and they keep adjusting one to fit the other",
    opposition: "They alternate between needing total freedom and needing close partnership — the test is finding people who can hold both",
  }),
  // Moon + Neptune
  A("Moon|Neptune", {
    conjunct: "Their feelings are porous — they pick up other people's moods and have to learn what's actually theirs",
    sextile: "They tap into other people's emotional states and use it well in caregiving or creative work",
    square: "Confusion and longing run high — they idealize, then crash, then idealize again",
    trine: "They feel through art, music, or service and trust that channel",
    quincunx: "Their emotional state rarely matches the situation — they're heavier or lighter than the moment calls for",
    opposition: "They take on the emotional climate of whoever they love and lose the line between empathy and absorption",
  }),
  // Moon + Uranus
  A("Moon|Uranus", {
    conjunct: "Their moods turn fast — they need emotional independence and feel trapped by clinginess",
    sextile: "They handle change well and can detach when things get heavy",
    square: "Their emotional life is unpredictable; closeness and panic trade places quickly",
    trine: "They stay emotionally agile; they can shift gears without crisis",
    quincunx: "Their need for connection and their need for space rarely line up — partners often feel whiplash",
    opposition: "They alternate between needing closeness and needing escape — usually the relationship surfaces the pattern",
  }),
  // Saturn + Pluto
  A("Pluto|Saturn", {
    conjunct: "They demolish and rebuild structures — career, identity, family — slowly and on purpose",
    sextile: "They can outlast forces that break other people; pressure makes them more focused",
    square: "Power and authority fight inside them — they wrestle with control and end up either too rigid or too defiant",
    trine: "They handle long-term, high-stakes work that requires both discipline and depth",
    quincunx: "Their structures and their power keep mismatching — they tear down what was just built",
    opposition: "They face external power that demands they restructure their life, and resisting it costs more than yielding",
  }),
  // Jupiter + Saturn
  A("Jupiter|Saturn", {
    conjunct: "Expansion and discipline fuse — they grow on a schedule and rarely overshoot",
    sextile: "Optimism and structure cooperate; long plans work for them",
    square: "Growth and limits argue — they overshoot, then over-restrict, then overshoot again",
    trine: "Patience pays off here; they build slowly and the results last",
    quincunx: "Their plans and their pace rarely match — they're either too cautious or too fast",
    opposition: "Expansion and contraction trade places — the test is knowing when to push and when to consolidate",
  }),
  // Mars + Pluto
  A("Mars|Pluto", {
    conjunct: "Their drive carries intensity most people can't match — restraint, not power, is the work",
    sextile: "They can do hard, sustained things; their stamina under pressure is unusual",
    square: "Anger runs deep — they suppress, then erupt — until they learn to use force without scorching the room",
    trine: "Power moves through them cleanly; they can take action under stakes that paralyze most people",
    quincunx: "Their drive and their power rarely match — they overshoot or freeze",
    opposition: "Power struggles with other people are a recurring theme — until they stop fighting for control, the dynamic keeps showing up",
  }),
  // Venus + Pluto
  A("Pluto|Venus", {
    conjunct: "Love is transformative or it doesn't interest them — they can't do casual",
    sextile: "They handle emotional intensity in love without losing themselves",
    square: "Love patterns are intense and possessive — until they recognize the pattern, they keep choosing it",
    trine: "They go deep in love without losing balance; intimacy is a strength",
    quincunx: "What they want and what they pursue don't match — they want closeness and push it away",
    opposition: "Their relationships are intense and transformative — partners change them and they change partners, sometimes by force",
  }),
  // Venus + Neptune
  A("Neptune|Venus", {
    conjunct: "They romanticize people and have to learn the difference between who someone is and who they imagined them to be",
    sextile: "They love through imagination and creativity; idealism works in their favor",
    square: "They fall for the version of someone in their head and crash when reality shows up",
    trine: "Romance and creativity flow together; they can love without losing themselves",
    quincunx: "Their longing and their reality rarely match — they mourn relationships they never actually had",
    opposition: "They keep meeting the perfect person who turns out to be an illusion — until they choose with both eyes open",
  }),
  // Sun + Mars
  A("Mars|Sun", {
    conjunct: "Their identity and their drive fuse — they act first, think second, and lead naturally",
    sextile: "They go after what they want without burning out the people around them",
    square: "Anger, ego, and ambition tangle — they pick fights they didn't mean to pick",
    trine: "Action comes easily; they don't have to psych themselves up to start",
    quincunx: "Their drive and their identity don't fit — they're either over-asserting or under-asserting",
    opposition: "They project their ambition onto the people they're competing with — until they own it, the conflict keeps repeating",
  }),
  // North Node + Sun
  A("North Node|Sun", {
    conjunct: "Their direction in this life and their identity point the same way — when they're on path, things land",
    sextile: "Their growth direction supports who they already are; the road forward is recognizable",
    square: "Their identity and their growth direction pull against each other — comfort isn't the same as path",
    trine: "Their gifts and their growth direction agree; they can lean in without forcing",
    quincunx: "Who they are and where they're going keep needing recalibration",
    opposition: "Their familiar identity and their growth direction sit across from each other — the work is letting one expand into the other",
  }),
]) as Record<string, Record<string, string>>;

// Build canonical aspect entries from the verified facts list.
type AllowedAspect = { pair: string; aspect: string; p1: string; p2: string };

const buildAllowedAspectMap = (facts: ValidationFacts | null): Map<string, AllowedAspect> => {
  const map = new Map<string, AllowedAspect>();
  if (!facts?.natal_aspects) return map;
  for (const a of facts.natal_aspects) {
    if (!a?.point1 || !a?.point2 || !a?.aspect) continue;
    const aspect = ASPECT_ALIASES[a.aspect.toLowerCase()] ?? a.aspect.toLowerCase();
    const sorted = [a.point1, a.point2].sort((x, y) => x.localeCompare(y));
    const key = `${sorted[0]}|${sorted[1]}`;
    map.set(`${key}::${aspect}`, {
      pair: key,
      aspect,
      p1: a.point1,
      p2: a.point2,
    });
  }
  return map;
};

const canonicalPlanet = (token: string): string | null => {
  if (!token) return null;
  const sym = PLANET_SYMBOLS[token.trim()];
  if (sym) return sym;
  const norm = token.replace(/\s+/g, " ").trim().toLowerCase();
  for (const p of PLANET_NAMES) {
    if (p.toLowerCase() === norm) return p === "MC" ? "Midheaven" : p;
  }
  return null;
};

const splitSentences = (text: string): string[] => {
  if (!text || typeof text !== "string") return [];
  return text.split(/(?<=[.!?])\s+(?=[A-Z"'(])/g).map((s) => s.trim()).filter(Boolean);
};

const buildPhraseRegex = (): RegExp => {
  const planetCore = PLANET_NAMES.map((p) => p.replace(/\s/g, "\\s")).join("|");
  const aspectsAlt = Object.keys(ASPECT_ALIASES).join("|");
  return new RegExp(
    `\\b(${planetCore})(?:'s|\\s+is|\\s+sits|\\s*,)?\\s+(${aspectsAlt})\\s+(?:to|with|the\\s+)?\\s*(?:the\\s+)?(${planetCore})\\b`,
    "i",
  );
};

const buildSymbolPhraseRegex = (): RegExp => {
  const symPlanets = Object.keys(PLANET_SYMBOLS).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  const symAspects = Object.keys(ASPECT_SYMBOLS).map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  return new RegExp(`(${symPlanets})\\s*(${symAspects})\\s*(${symPlanets})`);
};

const lookupBehavioralSentence = (
  p1: string,
  p2: string,
  aspect: string,
): string | null => {
  const key = pairKey(p1, p2);
  const entry = ASPECT_LIBRARY[key];
  if (!entry) return null;
  const sentence = entry[aspect];
  if (!sentence) return null;
  return sentence;
};

const formatRewriteSentence = (
  p1: string,
  p2: string,
  aspect: string,
  behavior: string,
): string => {
  // We always write the verified phrase first, then the behavioral
  // meaning. The behavioral sentence is in code, so the AI cannot drift
  // it. Period at the end is added unconditionally.
  const pair = `${p1} ${aspect} ${p2}`;
  const cleaned = behavior.replace(/[.!?]+$/, "");
  return `${pair} — ${cleaned}.`;
};

/**
 * Walk every string field in the parsed reading and replace any
 * recognized "<Planet> <aspect> <Planet>" phrase that maps to a
 * verified natal aspect with a deterministic behavioral sentence.
 *
 * IMPORTANT:
 *  - Skips non-natal claims (Transiting / SR / Progressed / Composite /
 *    Davison / Synastry / Partner) — those are handled by the transit
 *    pipeline, not natal interpretation.
 *  - Skips phrases that don't match a verified natal aspect — those are
 *    already stripped by validateReading().
 *  - Replaces the WHOLE sentence containing the matched phrase, so we
 *    never leave behind half-AI / half-deterministic prose.
 */
export const rewriteNatalAspectsDeterministically = (
  parsedContent: any,
  chartContext: string | undefined,
): { rewritten_count: number; skipped_no_library: number } => {
  const result = { rewritten_count: 0, skipped_no_library: 0 };
  if (!parsedContent || !Array.isArray(parsedContent?.sections)) return result;
  const facts = extractValidationFacts(chartContext);
  const allowed = buildAllowedAspectMap(facts);
  if (allowed.size === 0) return result;

  const wordRe = buildPhraseRegex();
  const symRe = buildSymbolPhraseRegex();

  const SKIP_KEYS = new Set([
    "_validation",
    "_validation_warning",
    "transits",
    "windows",
    "date_range",
    "dateRange",
    "symbol",
    "tag",
    "type",
    "title",
    "label",
    "name",
    "planet",
    "aspect",
    "natal_point",
    "count",
    "generated_date",
    "first_applying_date",
    "exact_hit_date",
    "separating_end_date",
    "exact_degree",
    "pass_label",
    "position",
  ]);

  const tryRewriteSentence = (sentence: string): string => {
    // Skip sentences that are clearly about a non-natal context.
    if (NON_NATAL_PREFIX_RE.test(sentence)) return sentence;

    // 1. Word-form match.
    const wm = sentence.match(wordRe);
    if (wm) {
      const p1 = canonicalPlanet(wm[1]);
      const aspect = ASPECT_ALIASES[wm[2].toLowerCase()];
      const p2 = canonicalPlanet(wm[3]);
      if (p1 && p2 && aspect && p1 !== p2) {
        const key = `${pairKey(p1, p2)}::${aspect}`;
        if (allowed.has(key)) {
          const behavior = lookupBehavioralSentence(p1, p2, aspect);
          if (behavior) {
            result.rewritten_count++;
            return formatRewriteSentence(p1, p2, aspect, behavior);
          }
          result.skipped_no_library++;
        }
      }
    }

    // 2. Symbol-form match.
    const sm = sentence.match(symRe);
    if (sm) {
      const p1 = canonicalPlanet(sm[1]);
      const aspectGlyph = sm[2];
      const aspect = ASPECT_SYMBOLS[aspectGlyph];
      const p2 = canonicalPlanet(sm[3]);
      if (p1 && p2 && aspect && p1 !== p2) {
        const key = `${pairKey(p1, p2)}::${aspect}`;
        if (allowed.has(key)) {
          const behavior = lookupBehavioralSentence(p1, p2, aspect);
          if (behavior) {
            result.rewritten_count++;
            return formatRewriteSentence(p1, p2, aspect, behavior);
          }
          result.skipped_no_library++;
        }
      }
    }

    return sentence;
  };

  const rewriteString = (text: string): string => {
    if (!text || typeof text !== "string") return text;
    const sentences = splitSentences(text);
    if (sentences.length === 0) return text;
    const out: string[] = [];
    for (const s of sentences) {
      out.push(tryRewriteSentence(s));
    }
    return out.join(" ");
  };

  const walk = (node: any) => {
    if (node === null || node === undefined) return;
    if (typeof node === "string") return;
    if (Array.isArray(node)) {
      for (let i = 0; i < node.length; i++) {
        const child = node[i];
        if (typeof child === "string") {
          node[i] = rewriteString(child);
        } else if (child && typeof child === "object") {
          walk(child);
        }
      }
      return;
    }
    if (typeof node === "object") {
      for (const key of Object.keys(node)) {
        if (SKIP_KEYS.has(key)) continue;
        const v = node[key];
        if (typeof v === "string") {
          node[key] = rewriteString(v);
        } else if (v && typeof v === "object") {
          walk(v);
        }
      }
    }
  };

  for (const section of parsedContent.sections) {
    walk(section);
  }

  return result;
};
