// Portrait Composer
// Reads the deterministic ChildPortrait data and selects the 3–5 most important
// themes for this specific person at this specific life stage. Produces the
// 6-section output structure the UI renders.
//
// NO new astrology math here — all numbers come from buildChildPortrait().
// This file is presentation-layer prioritization only.

import type { ChildPortrait } from "./childPortrait";
import type { NatalChart } from "@/hooks/useNatalChart";
import { validateComposedPortrait, sanitizeComposedPortrait } from "./portraitValidator";
import { detectChartSignature } from "./portraitSignature";

// Optional profile context passed by the caller for pronoun/name handling.
export type PortraitProfile = {
  firstName?: string;
  fullName?: string;
  pronouns?: { subject: string; object: string; possessive: string; reflexive?: string };
  isChild?: boolean;
};

// ── Plain-language "what this placement actually does in real life" ──────────
// These are deliberately concrete and behavioral, so the bridge sentence
// reads like an explanation, not an astrology lookup.

const SUN_FEELS: Record<string, string> = {
  Aries: "they need to move first and be the one who starts things",
  Taurus: "they need things to feel steady and physically safe before they commit",
  Gemini: "they need to talk, ask questions, and try a few angles before settling",
  Cancer: "they notice emotional shifts quickly and try to protect the bond",
  Leo: "they need to be seen as themselves, not as a role they're playing",
  Virgo: "they need things to actually work, and they'll notice what's off",
  Libra: "they need the choice to be fair and still honestly theirs",
  Scorpio: "they need to know what's really going on under the surface",
  Sagittarius: "they need the bigger why before they'll fully buy in",
  Capricorn: "they need a real plan and to be treated as capable",
  Aquarius: "they need to be met as their own person, not a category",
  Pisces: "they absorb everything happening around them, even when they don't show it",
};

const MERCURY_FEELS: Record<string, string> = {
  Aries: "processes fast and out loud, and gets blunt when forced to slow down",
  Taurus: "processes slowly, needs concrete examples, and won't be rushed into an answer",
  Gemini: "processes by talking, comparing, and sampling several ideas at once",
  Cancer: "processes through memory and feeling, so logic comes after the mood is read",
  Leo: "processes through story and self-expression, and needs an audience to think clearly",
  Virgo: "processes by sorting details and checking what's wrong before what's right",
  Libra: "processes by weighing both sides, which can look like indecision",
  Scorpio: "processes privately, goes deep on one thing, and won't share until it's true",
  Sagittarius: "processes through the big picture and gets impatient with small steps",
  Capricorn: "processes by structure and consequence, and won't speak until it's sound",
  Aquarius: "processes logically and needs space to figure out what's true on their own",
  Pisces: "processes through impression and feeling, so words can lag behind what they know",
};

const MOON_FEELS: Record<string, string> = {
  Aries: "settles by doing something physical, not by talking it through",
  Taurus: "settles by predictable rhythm, food, and not being rushed",
  Gemini: "settles by being talked with and given a few options",
  Cancer: "settles by closeness and knowing the plan ahead of time",
  Leo: "settles by warm, sincere attention from someone they trust",
  Virgo: "settles by completing a small, competent task",
  Libra: "settles when the terms are clear, calm, and fair",
  Scorpio: "settles in privacy and one-on-one trust, never in a crowd",
  Sagittarius: "settles when given honesty and room to move",
  Capricorn: "settles when there's clear structure and they have one piece of control",
  Aquarius: "settles when they're treated as their own person and given space",
  Pisces: "settles with low stimulation, soft input, and rest",
};

const MARS_FEELS: Record<string, string> = {
  Aries: "acts fast and physical, so the energy needs an outlet before talking",
  Taurus: "burns slow and steady, but locks in hard once pushed past a limit",
  Gemini: "fires through words and quick switches, and scatters under pressure",
  Cancer: "protects sideways, through care and indirect action, not confrontation",
  Leo: "needs the energy to come out through performance, play, or being seen",
  Virgo: "channels into fixing and improving, and turns critical when blocked",
  Libra: "fights by negotiating, and freezes when forced to pick a side",
  Scorpio: "goes underground with the energy until it can come out one-on-one",
  Sagittarius: "needs to move while it processes, no face-to-face cornering",
  Capricorn: "channels into a plan and pushes through, but quietly resents being managed",
  Aquarius: "acts on principle and refuses guilt as a motivator",
  Pisces: "needs low stimulation to reset; otherwise it leaks out as withdrawal",
};

// ── Plain-language sign lookups for composer-only copy ───────────────────────
const MOON_SAFETY: Record<string, string> = {
  Aries: "physical movement and quick wins",
  Taurus: "predictable rhythm, food, and not being rushed",
  Gemini: "being talked with, given choices, and asked questions",
  Cancer: "physical closeness, soft tone, and knowing the plan",
  Leo: "warm eye contact and being noticed sincerely",
  Virgo: "small competent tasks and clean order",
  Libra: "clear terms, calm tone, and fairness named out loud",
  Scorpio: "privacy, one-on-one trust, and the real story",
  Sagittarius: "honesty, room to roam, and the big-picture why",
  Capricorn: "clear structure and being treated as capable",
  Aquarius: "being treated as their own person, logic over guilt",
  Pisces: "low stimulation, soft sensory input, and rest",
};

const MARS_RESET: Record<string, string> = {
  Aries: "movement first (run, jump, hit something safe), talk second",
  Taurus: "a physical anchor, food, blanket, ground, pace down",
  Gemini: "let them talk it out fast, give words to the feeling",
  Cancer: "co-regulate with closeness or water before discussing",
  Leo: "warmth and acknowledgment first, never shame in front of others",
  Virgo: "give them a small task that restores order",
  Libra: "name what is fair and what is not",
  Scorpio: "go private, low tone, one-on-one",
  Sagittarius: "let them move while talking, no face-to-face cornering",
  Capricorn: "name the plan, give them control of one piece",
  Aquarius: "give them space and logic, no guilt-tripping",
  Pisces: "reduce stimulation, soft light, music, water",
};

const SUN_LEARNING: Record<string, string> = {
  Aries: "how to lead without bulldozing",
  Taurus: "how to hold their own worth without freezing",
  Gemini: "how to use their voice honestly, not just cleverly",
  Cancer: "how to care for others without losing themselves",
  Leo: "how to be seen as themselves, not as a performance",
  Virgo: "how to be useful without being self-critical",
  Libra: "how to advocate for themselves without breaking the peace",
  Scorpio: "how to be honest about what they actually feel",
  Sagittarius: "how to stay when the truth is uncomfortable",
  Capricorn: "how to build something real on their own authority",
  Aquarius: "how to stay connected while being their own person",
  Pisces: "how to stay in the world without losing the inner one",
};

// Behaviors that adults/peers commonly misread, keyed by chart-ruler sign or
// dominant placement. Each entry is { looksLike, actuallyIs }.
const MISREAD_BY_SIGN: Record<string, { looksLike: string; actuallyIs: string }> = {
  Aries: {
    looksLike: "moving before you finish talking, cutting in, or walking off mid-sentence",
    actuallyIs: "their body already knows what it wants to do, and waiting feels physically wrong",
  },
  Taurus: {
    looksLike: "not answering right away, refusing to switch tasks, taking the long way",
    actuallyIs: "they're checking the new thing against the body's sense of safe before they move",
  },
  Gemini: {
    looksLike: "interrupting, jumping topics, asking the same question three different ways",
    actuallyIs: "they think by talking, so the conversation is the thinking, not a report on it",
  },
  Cancer: {
    looksLike: "going quiet after something small, or reacting big to a tone shift you didn't notice",
    actuallyIs: "they already picked up the change in the room before anyone named it",
  },
  Leo: {
    looksLike: "performing, taking over the room, or getting hurt when someone looks away",
    actuallyIs: "they're checking that being seen still gets a warm response back, not a flat one",
  },
  Virgo: {
    looksLike: "pointing out what's wrong, redoing what's already done, getting stuck on a small detail",
    actuallyIs: "they're trying to make the thing actually work, and they can see the gap nobody else can",
  },
  Libra: {
    looksLike: "stalling, giving two answers, or asking what someone else thinks before naming their own answer",
    actuallyIs: "they're trying to make a clean choice without betraying either fairness or their own preference",
  },
  Scorpio: {
    looksLike: "going silent, watching from the corner, or telling you only part of the story",
    actuallyIs: "they're deciding whether the full version is safe to put in your hands",
  },
  Sagittarius: {
    looksLike: "joking through a serious moment, leaving early, or pushing back on the rule itself",
    actuallyIs: "they're checking whether the reason for the rule actually holds up",
  },
  Capricorn: {
    looksLike: "going quiet under pressure, taking over the plan, refusing help",
    actuallyIs: "they're trying to make sure the thing gets done right, and they don't yet trust the room to carry it",
  },
  Aquarius: {
    looksLike: "asking 'why do we do it that way,' going off on their own, or not joining in",
    actuallyIs: "they're testing whether the rule still makes sense to them, not refusing to belong",
  },
  Pisces: {
    looksLike: "drifting off mid-conversation, getting flooded by a loud room, or saying 'I don't know'",
    actuallyIs: "they're taking in more feeling than the room is saying out loud, and it's hard to sort it in the moment",
  },
};

const SATURN_TENDER_MISREAD: Record<string, string> = {
  default: "what looks like putting it off or not caring is usually bracing under pressure while someone is watching",
};

const CHIRON_TENDER_MISREAD =
  "what looks like a big reaction to a small thing is usually an older sore spot getting touched, not the moment itself";

const MOON12_MISREAD =
  "what looks like 'I'm fine' is the feeling going underground because the room didn't feel safe enough to put it down";

// ── Composer types ───────────────────────────────────────────────────────────

export interface ComposedPortrait {
  lifeStageChapter: string;
  corePortrait: string;
  systemMechanism: {
    driver: { label: string; detail: string };
    translator: { label: string; detail: string };
    trigger: { label: string; detail: string; derivation: string };
    reaction: string;
    synthesis: string;
  };
  // NEW: Real-time activation order — what actually fires when the moment hits.
  realTimeSequence?: {
    intro: string;
    priorityNote: string;
    steps: Array<{
      cue: string;       // "In real time:" / "Then:" / "At the same time:" / etc.
      lead: string;      // "Sun in Scorpio (1st house)"
      action: string;    // what it does in the moment
      rank: string;      // why this step was picked (priority rule)
    }>;
  };
  // NEW: Planet Interaction System — Signal → Medium → Collision → Output → Translation.
  planetInteraction?: {
    signals: Array<{ role: string; planet: string; sign: string; house: number | null; fn: string }>;
    mediums: Array<{ planet: string; house: number; medium: string }>;
    timingCollision: { comparison: string; mismatch: string };
    realTimeOutput: { comesOut: string; blocked: string; late: string; othersExperience: string };
    humanTranslation: { looksLike: string; actuallyIs: string; whatHelps: string };
  };
  bridge?: {
    paragraph: string;
    placements: string[];
  };
  stageAsk: { title: string; body: string };
  misreads: Array<{ looksLike: string; actuallyIs: string }>;
  whatHelps: string[];
  chartStory: string;
  chainOfCommand?: {
    steps: Array<{ planet: string; sign: string; house: number | null; reason: string }>;
    finalDispositor?: { planet: string; sign: string; house: number | null };
    loop?: string[];
    mutualReception?: { a: string; b: string; aSign: string; bSign: string };
    narrative: string;
  };
  themesPicked: string[];
  // Global validation result (A–K check). `ok: false` means at least one
  // section violated planet-job / house-meaning / mutual-reception /
  // final-authority / sign-speed / banned-trait / missing-anchor / em-dash
  // / thin-section rules. Surfaced for dev review.
  validation?: import("./portraitValidator").ValidationResult;
}


// Traditional rulerships (matches childPortrait.ts).
const RULER_OF: Record<string, string> = {
  Aries: "Mars", Taurus: "Venus", Gemini: "Mercury", Cancer: "Moon",
  Leo: "Sun", Virgo: "Mercury", Libra: "Venus", Scorpio: "Mars",
  Sagittarius: "Jupiter", Capricorn: "Saturn", Aquarius: "Saturn", Pisces: "Jupiter",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function ord(n: number): string {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Pronoun-aware grammar helper ────────────────────────────────────────────
// Prevents "they is / they has / they feels" and other agreement bugs when
// pronouns are they/them, and guarantees the subject slot is never a bare
// pronoun fallback like "they" or "it".
export interface PortraitGrammar {
  name: string;             // safe display name, never a bare pronoun
  poss: string;             // possessive form of the display name ("Lauren's")
  subj: string;             // subject pronoun ("she" / "he" / "they")
  obj: string;              // object pronoun ("her" / "him" / "them")
  pposs: string;            // possessive pronoun ("her" / "his" / "their")
  refl: string;             // reflexive ("herself" / "himself" / "themself")
  isPlural: boolean;        // true for they/them
  is: string;               // "is" / "are"
  has: string;              // "has" / "have"
  was: string;              // "was" / "were"
  does: string;             // "does" / "do"
  doesnt: string;           // "doesn't" / "don't"
  // Adds third-person singular -s to a base verb when not plural.
  // e.g. v("feel") => "feels" / "feel"; v("watch") => "watches" / "watch".
  v: (base: string) => string;
}

function buildGrammar(rawName: string | undefined, profile?: PortraitProfile): PortraitGrammar {
  const PRONOUN_WORDS = new Set(["they", "she", "he", "them", "her", "him", "it"]);
  let cleaned = (profile?.firstName ?? rawName ?? "").trim();
  if (!cleaned || PRONOUN_WORDS.has(cleaned.toLowerCase())) {
    cleaned = "this person";
  }

  // Name-safe singular fallback: when the profile does NOT provide pronouns,
  // we refuse to assume they/them. We use the person's name in subject slots,
  // singular verb agreement, and neutral possessive/reflexive forms. This
  // prevents "they is", "they has", and wrong-pronoun output until the
  // profile schema carries a real pronoun field.
  const hasPronouns = !!profile?.pronouns?.subject;
  const subj = hasPronouns ? profile!.pronouns!.subject!.toLowerCase() : cleaned;
  const obj  = hasPronouns ? (profile!.pronouns!.object ?? "them").toLowerCase() : cleaned;
  const pposs = hasPronouns
    ? (profile!.pronouns!.possessive ?? "their").toLowerCase()
    : (cleaned === "this person" ? "this person's" : `${cleaned}'s`);
  // Plural verb agreement only when explicit "they" pronouns were provided.
  const isPlural = hasPronouns && subj === "they";
  const refl = profile?.pronouns?.reflexive
    ?? (hasPronouns
      ? (isPlural ? "themself" : subj === "she" ? "herself" : subj === "he" ? "himself" : "themself")
      : "themselves");
  const v = (base: string) => {
    if (isPlural) return base;
    if (/(?:s|x|z|ch|sh|o)$/.test(base)) return base + "es";
    if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + "ies";
    return base + "s";
  };
  const possName = cleaned === "this person" ? "this person's" : `${cleaned}'s`;
  return {
    name: cleaned, poss: possName,
    subj, obj, pposs, refl, isPlural,
    is: isPlural ? "are" : "is",
    has: isPlural ? "have" : "has",
    was: isPlural ? "were" : "was",
    does: isPlural ? "do" : "does",
    doesnt: isPlural ? "don't" : "doesn't",
    v,
  };
}

// ── Composer ─────────────────────────────────────────────────────────────────
export function composePortrait(p: ChildPortrait, chart?: NatalChart, profile?: PortraitProfile): ComposedPortrait {
  const G = buildGrammar(p.name, profile);
  const name = G.name;
  const phase = p.lifePhase;
  const age = p.age;

  const sunSign = p.identityInvitation.sun?.sign;
  const moonAspectsHard = p.mathCheck.moonAspects.filter(
    a => a.aspect === "conjunction" || a.aspect === "opposition" || a.aspect === "square"
  );
  const tightAspects = (p.tightestAspects ?? []).filter(a => a.orb <= 2.5);

  // Sources for the one-sentence + bridge
  const marsSign = p.energyDischarge?.marsSign;
  const marsHouse = p.energyDischarge?.marsHouse ?? null;
  const sunHouse = p.identityInvitation.sun?.house ?? null;

  // ── 1. CORE PORTRAIT ────────────────────────────────────────────────────────
  // Not a stitched-together Sun + house template. This has to explain how the
  // placements blend into one working system, then land in a parent-usable move.

  // Concrete real-life arena per house (what this part of life actually IS,
  // in plain English).
  const HOUSE_ARENA: Record<number, string> = {
    1: "self-direction, body pace, visible preferences, and the right to choose openly",
    2: "what they own, what they're worth, and what their body counts as safe",
    3: "the small daily back-and-forth, talking, texting, siblings, school, errands",
    4: "home, family, and the private inner life nobody at work sees",
    5: "play, creating, performing, romance, and (for parents) their kids",
    6: "daily routine, work, the body, and the small stuff that has to function",
    7: "close one-on-one relationships, partners, best friends, the person across from them",
    8: "the private, intense layer: money shared with someone, sex, grief, what's hidden",
    9: "travel, big ideas, belief, teaching, and what they're chasing meaning-wise",
    10: "their public role, career, and what they end up being known for",
    11: "their friend group, the wider community, and the future they're trying to build",
    12: "what happens behind a curtain, alone, in dreams, in the parts no one sees",
  };

  // What the chart-ruler sign does in motion (engine texture).
  const RULER_TEXTURE: Record<string, string> = {
    Aries: "drives fast and gets impatient when blocked",
    Taurus: "holds ground and won't be hurried",
    Gemini: "darts between options and needs to talk it out",
    Cancer: "moves through feeling and protects sideways",
    Leo: "runs on being seen and needs warmth back",
    Virgo: "tunes by fixing what's off",
    Libra: "weighs every angle before committing",
    Scorpio: "goes deep, private, and all-or-nothing",
    Sagittarius: "needs the bigger why and room to move",
    Capricorn: "builds slowly and won't be managed",
    Aquarius: "tests the rule before following it",
    Pisces: "absorbs everything and needs to drain it out",
  };

  // ── The Sun's LIVE mechanic: what the body does reflexively in real time,
  // before thinking catches up. This is what makes the behavior feel involuntary.
  const SUN_LIVE: Record<string, string> = {
    Aries: "answers before the sentence is fully formed, because the body reads hesitation as losing the moment",
    Taurus: "stalls and goes quiet when the pace shifts, because the body refuses to commit until it has felt the new ground",
    Gemini: "starts talking to think, jumps to a related angle, and then has three half-formed positions on the table at once",
    Cancer: "scans the emotional temperature of the room and softens or sharpens the words to match it, before any of that is conscious",
    Leo: "tracks whether they are being received, and the voice and face adjust to whatever is or is not coming back from the other person",
    Virgo: "spots the one thing that is off and starts mentally fixing it, which pulls attention out of what is actually being said",
    Libra: "reads how the other person will take the answer and edits the wording in real time to keep the table even",
    Scorpio: "goes still and watches, holds the real answer back, and gives a smaller version to see what the other person does with it",
    Sagittarius: "blurts the honest version before the social filter arrives, and then has to manage the room they just disturbed",
    Capricorn: "freezes the face, gives a measured answer, and processes the actual reaction privately later",
    Aquarius: "detaches a half-step, observes the conversation from outside it, and answers from logic rather than from the heat",
    Pisces: "can absorb the emotional tone of whoever is speaking, especially when the relationship matters, and may know the other person's mood before they have fully separated out their own position",
  };

  // ── What the chart ruler ACTUALLY believes underneath. This is the second
  // voice that usually arrives after the moment, the one in the "I should have said..."
  const RULER_BELIEF: Record<string, string> = {
    Aries: "actually believes in the clean, direct answer and resents the diplomatic version once it has been said",
    Taurus: "actually believes the first position was right and that changing it under pressure costs something real",
    Gemini: "actually believes more than one thing at once, and needs to talk it through after the fact to find which one is theirs",
    Cancer: "actually believes the feeling under the words mattered more than the words, and grieves quietly when the feeling got smoothed over",
    Leo: "actually believes their take deserved to be honored as their take, and gets quietly hurt when it was minimized to keep the peace",
    Virgo: "actually believes the precise version was correct and gets stuck reworking the moment to fix what they let slide",
    Libra: "actually believes there was a fairer way to say it and replays the exchange looking for the version that would have held",
    Scorpio: "actually believes the unsaid thing was the truth and feels compromised when the surface answer covered it up",
    Sagittarius: "actually believes in telling the truth out loud and feels off-key for hours after softening it to keep things smooth",
    Capricorn: "actually believes they should have held the position with more authority and quietly downgrades themselves for not doing it",
    Aquarius: "actually believes the unconventional answer was the honest one and feels itchy after defaulting to the expected response",
    Pisces: "actually believes the gentler read was the right one, but cannot always tell whose feeling was driving it",
  };

  // The chart ruler's house, in plain arena language.
  const HOUSE_LIFE_AREA: Record<number, string> = {
    1: "their own self-direction and pace",
    2: "money, body, and what they decide is theirs",
    3: "everyday conversations, siblings, and the small running commentary of life",
    4: "home and family, where the real feelings come out",
    5: "play, creativity, performance, humor, risk-taking, and being seen",
    6: "daily routine, work, and the body",
    7: "their closest one-on-one relationships",
    8: "trust, shared resources, and the private layer they do not show",
    9: "belief, travel, learning, and what they are chasing meaning-wise",
    10: "career, reputation, and how they are seen publicly",
    11: "friend groups and the future they are trying to build",
    12: "solitude, the inner world, and what they process behind a curtain",
  };

  const MOON_NEED: Record<string, string> = {
    Aries: "the feeling settles after the body gets to move",
    Taurus: "the feeling settles when the pace is predictable and the body feels safe",
    Gemini: "the feeling settles after it has words, options, and a chance to ask",
    Cancer: "the feeling settles with softness, closeness, and a clear plan",
    Leo: "the feeling settles when warmth is unmistakable and not performative",
    Virgo: "the feeling settles when one small thing becomes orderly and doable",
    Libra: "the feeling settles when the terms are balanced and fairness is named plainly",
    Scorpio: "the feeling settles in privacy with someone who can handle the truth",
    Sagittarius: "the feeling settles with honesty, movement, and a wider view",
    Capricorn: "the feeling settles when there is structure and one piece they can control",
    Aquarius: "the feeling settles when they are not emotionally crowded or guilted",
    Pisces: "the feeling settles with low stimulation, rest, and fewer signals coming in",
  };

  // NOTE: A previous PACE_FIX table emitted a universal coaching "move" per
  // Sun sign in Section 8. That violated the app's direction (support must
  // come from the actual chart stack, life stage, Mercury/Mars/Moon, and the
  // person's real pressure point — not a generic Sun-sign prescription).
  // The table and its emission have been removed.

  const moonSignEarly = (chart?.planets?.Moon as any)?.sign as string | undefined;
  const liveEdge = tightAspects.find(a => a.quality === "hard" && a.orb <= 2.0);

  // ── Compute Mercury house from chart cusps (mirrors buildChartContext.calcHouse).
  const ZODIAC = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
  ];
  const houseCusps = (chart?.houseCusps ?? {}) as any;
  const cuspLongitudes: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}`];
    if (cusp && typeof cusp === "object" && "sign" in cusp) {
      cuspLongitudes.push(ZODIAC.indexOf(cusp.sign) * 30 + (cusp.degree ?? 0) + ((cusp.minutes ?? 0) / 60));
    }
  }
  const calcHouse = (sign?: string, degree?: number, minutes?: number): number | null => {
    if (!sign || cuspLongitudes.length !== 12) return null;
    const absDeg = ZODIAC.indexOf(sign) * 30 + (degree ?? 0) + ((minutes ?? 0) / 60);
    for (let i = 0; i < 12; i++) {
      const nextI = (i + 1) % 12;
      let start = cuspLongitudes[i];
      let end = cuspLongitudes[nextI];
      if (end < start) end += 360;
      let d = absDeg;
      if (d < start) d += 360;
      if (d >= start && d < end) return i + 1;
    }
    return null;
  };

  const Mercury = (chart?.planets as any)?.Mercury;
  const mercurySign: string | undefined =
    p.cognitiveProfile?.mercurySign || Mercury?.sign;
  const mercuryHouse = calcHouse(Mercury?.sign, Mercury?.degree, Mercury?.minutes);

  // ── Mercury HOUSE delay/texture: how words form vs. how fast the moment moves.
  const MERCURY_HOUSE_DELAY: Record<number, string> = {
    1: "Mercury sits on the Ascendant, so the words come out fast and visible — sometimes before the thought is finished forming",
    4: "Mercury runs in the 4th, so the words form first in the private inner room before they are willing to come out loud",
    6: "Mercury runs in the 6th, so the words come out as the body is actually doing something — talking through the task, not before it",
    8: "Mercury runs in the 8th, so the words form privately and only come out once it feels safe enough to put the real version on the table — the surface version is a placeholder",
    9: "Mercury runs in the 9th, so the words reach for the bigger frame first and the small in-the-moment answer can lag",
    12: "Mercury runs in the 12th, so the words form underneath the surface first — the understanding is there in real time, but the language is not always ready at the same speed as the conversation",
  };

  // ── Mars SIGN as pressure-response amplifier (when something matters).
  const MARS_PRESSURE: Record<string, string> = {
    Aries: "Mars in Aries means pressure makes the response come out faster and sharper, not slower",
    Taurus: "Mars in Taurus means pressure makes the body dig in and refuse to be moved off the position",
    Gemini: "Mars in Gemini means pressure makes the words scatter and multiply instead of consolidating",
    Cancer: "Mars in Cancer means pressure pulls the response sideways into protection rather than direct confrontation",
    Leo: "Mars in Leo means pressure raises the visibility of the response — it cannot be small",
    Virgo: "Mars in Virgo means pressure narrows the response into precision-correction, which can read as criticism",
    Libra: "Mars in Libra means pressure makes the response try to stay fair to both sides, which can read as freezing",
    Scorpio: "Mars in Scorpio means when something matters, the pressure goes up, not down — and that makes it harder to get the words out lightly in the moment, not easier",
    Sagittarius: "Mars in Sagittarius means pressure makes the response want to leave the room and reframe from outside it",
    Capricorn: "Mars in Capricorn means pressure tightens the response into composure and quietly pushes the real reaction down for later",
    Aquarius: "Mars in Aquarius means pressure makes the response detach a step further out, answering from principle rather than from the heat",
    Pisces: "Mars in Pisces means pressure makes the response diffuse and harder to locate, which can look like withdrawal",
  };

  // ── Detect Sun–Chiron tight contact and chart-ruler oppositions/squares to outer/heavy planets.
  const sunChiron = tightAspects.find(
    a => (a.a === "Sun" && a.b === "Chiron") || (a.a === "Chiron" && a.b === "Sun"),
  );
  const rulerName = p.chartRuler?.rulerName;
  const rulerHardCheck = rulerName
    ? tightAspects.find(
        a =>
          (a.a === rulerName || a.b === rulerName) &&
          (a.aspect === "opposition" || a.aspect === "square") &&
          ["Jupiter", "Saturn", "Pluto", "Neptune", "Uranus"].some(
            n => a.a === n || a.b === n,
          ),
      )
    : undefined;
  const rulerCheckOther = rulerHardCheck
    ? rulerHardCheck.a === rulerName
      ? rulerHardCheck.b
      : rulerHardCheck.a
    : undefined;
  const RULER_CHECK_PLAIN: Record<string, string> = {
    Jupiter: "the truth impulse has to pass through a body-and-safety check — will saying this disturb peace, money, comfort, or the room",
    Saturn: "the impulse has to pass through a consequences-and-authority check — is this worth what it will cost",
    Pluto: "the impulse has to pass through a power-and-trust check — who controls the room if I say this",
    Neptune: "the impulse has to pass through a what-is-even-real check, which softens the edge of the answer",
    Uranus: "the impulse has to pass through a will-this-blow-something-up check, which can flip the answer at the last second",
  };

  // ── Life-stage chapter: rendered as its own one-sentence block ABOVE the
  // Core Portrait by the UI. Not concatenated into the portrait paragraph.
  const lifeStageChapter = p.developmentalAnchor?.stage
    ? `Life-stage chapter ${name} is in right now: ${p.developmentalAnchor.stage}. The whole chart bends around this chapter.`
    : "";

  const portraitParts: string[] = [];

  // 1. The live mechanic. Why it feels involuntary.
  // Opener is house-specific so it lands as "this is the exact situation I live in,"
  // not a generic "in live moments" frame. Each opener names the felt context where
  // the Sun actually fires for that person.
  const SUN_HOUSE_OPENER: Record<number, string> = {
    1:  `The second ${name} walks into a room,`,
    2:  `When something ${name} values is on the line,`,
    3:  `When ${name} has to say it out loud,`,
    4:  `When the house gets quiet and it is just ${name},`,
    5:  `When the spotlight turns toward ${name},`,
    6:  `In the middle of the daily grind,`,
    7:  `When someone else is across from ${name},`,
    8:  `When something real is on the line for ${name},`,
    9:  `When the conversation gets bigger than the room,`,
    10: `When people are watching ${name} for the answer,`,
    11: `When the group is forming around ${name},`,
    12: `When no one else is watching,`,
  };
  if (sunSign && SUN_LIVE[sunSign]) {
    const opener = (sunHouse && SUN_HOUSE_OPENER[sunHouse]) || `The way ${name} actually fires,`;
    const marsSignEarly = (chart?.planets as any)?.Mars?.sign;
    const marsHouseEarly = calcHouse((chart?.planets as any)?.Mars?.sign, (chart?.planets as any)?.Mars?.degree, (chart?.planets as any)?.Mars?.minutes);
    if (marsSignEarly === "Aries" && marsHouseEarly === 5) {
      portraitParts.push(`${opener} ${name} ${SUN_LIVE[sunSign]}. Aries Mars in the 5th reads hesitation as losing the spark. ${G.pposs[0].toUpperCase() + G.pposs.slice(1)} body wants to act, answer, move, or express before the private Mercury-in-Pisces part has finished finding the words.`);
    } else if (sunSign === "Pisces") {
      portraitParts.push(`${opener} ${name} ${SUN_LIVE[sunSign]}. That is the Pisces Sun in the 7th house working through relationship first. The room gets loud inside ${G.obj} before ${G.pposs} own answer has fully stepped forward.`);
    } else {
      portraitParts.push(`${opener} ${name} ${SUN_LIVE[sunSign]}. That happens before ${G.pposs} position has fully separated from the other person's mood, so it does not feel like a clear choice yet, it feels like the only available response in the room.`);
    }
  }

  // 2. The dissenting voice. Chart ruler in its sign + its arena.
  if (p.chartRuler && RULER_BELIEF[p.chartRuler.rulerSign]) {
    const arena = p.chartRuler.rulerHouse ? HOUSE_LIFE_AREA[p.chartRuler.rulerHouse] : null;
    const arenaClause = arena ? ` It runs through ${arena}, which is where this second voice has the most weight.` : "";
    portraitParts.push(`Underneath that, the part actually steering is ${p.chartRuler.rulerName} in ${p.chartRuler.rulerSign}, which ${RULER_BELIEF[p.chartRuler.rulerSign]}.${arenaClause}`);
  }

  // 2b. Chart ruler hard-aspected to a heavy: the cost-check the ruler has to pass.
  if (rulerHardCheck && rulerCheckOther && RULER_CHECK_PLAIN[rulerCheckOther]) {
    portraitParts.push(`But the ruler does not get to act alone. ${rulerName} is ${rulerHardCheck.aspect} ${rulerCheckOther} (${rulerHardCheck.orb.toFixed(1)}°), so ${RULER_CHECK_PLAIN[rulerCheckOther]}. The honest answer has to clear that gate before it is allowed out.`);
  }

  // 3. Mercury house: where the words actually form and at what speed.
  if (mercuryHouse && MERCURY_HOUSE_DELAY[mercuryHouse]) {
    const merc = mercurySign ? `${mercurySign} Mercury` : "Mercury";
    portraitParts.push(`Then ${merc} changes the speech timing. ${MERCURY_HOUSE_DELAY[mercuryHouse]}. So the understanding can be fully there in real time and the language still not be ready — and if the moment moves faster than the words form, someone else can take the space before the thought finishes.`);
  }

  // 4. Mars sign as pressure amplifier on top of the speech delay.
  if (marsSign && MARS_PRESSURE[marsSign]) {
    portraitParts.push(`${MARS_PRESSURE[marsSign]}.`);
  }

  // 5. Sun–Chiron specifically: the quiet permission check under every "I want."
  if (sunChiron) {
    portraitParts.push(`And Sun ${sunChiron.aspect} Chiron (${sunChiron.orb.toFixed(1)}°) runs a quiet second-guess under all of it — "is what I am about to say even allowed?" — so the system tightens at the exact moment it would otherwise open. That is why "whether the want is even allowed" lands harder than it should: it is a real pattern in the chart, not a mood.`);
  } else if (liveEdge && !rulerHardCheck) {
    // Fallback: any other live edge worth naming.
    portraitParts.push(`The tightest pressure point is ${liveEdge.a} ${liveEdge.aspect} ${liveEdge.b} (${liveEdge.orb.toFixed(1)}°), which is the version of this pattern that gets loud under stress: ${liveEdge.line}`);
  }
  // 6. SYNTHESIS — Physics version. Hardware Audit + Collision Report.
  // Planet+Sign = Voltage. Planet+House = Medium (density). Collision = Sensation.
  // No personality labels. No topics. Just what the body actually feels.

  type Density = "reflex" | "friction" | "submerged" | "wireless";
  const HOUSE_DENSITY: Record<number, { class: Density; phrase: string }> = {
    1:  { class: "reflex",    phrase: "a reflex 1st-house medium (live wire at the skin, zero latency)" },
    4:  { class: "submerged", phrase: "a submerged 4th-house medium (private inner room, slow to surface)" },
    7:  { class: "reflex",    phrase: "a reflex 7th-house medium (the signal hits whoever is across from them first)" },
    10: { class: "reflex",    phrase: "a reflex 10th-house medium (it broadcasts publicly before it is edited)" },
    6:  { class: "friction",  phrase: "a friction 6th-house medium (hard wired to the nervous system, the body has to conduct it)" },
    2:  { class: "friction",  phrase: "a friction 2nd-house medium (routed through the body and what it counts as safe)" },
    8:  { class: "submerged", phrase: "a submerged 8th-house medium (the real version stays underwater until trust is proven)" },
    12: { class: "submerged", phrase: "a submerged 12th-house medium (the information is there, but underwater, and the words surface late)" },
    3:  { class: "wireless",  phrase: "a wireless 3rd-house medium (thought and speech move at the same speed)" },
    5:  { class: "wireless",  phrase: "a wireless 5th-house medium (it comes out through play and expression with no translation step)" },
    9:  { class: "wireless",  phrase: "a wireless 9th-house medium (it reaches for the big frame fast)" },
    11: { class: "wireless",  phrase: "a wireless 11th-house medium (it broadcasts to the group with low friction)" },
  };

  type VoltageClass = "high-voltage" | "high-pressure" | "balanced" | "diffuse" | "steady" | "live-wire" | "compressed";
  const VOLTAGE: Record<string, { class: VoltageClass; phrase: string }> = {
    "Mercury-Aquarius":   { class: "high-voltage",  phrase: "high-voltage lightning (non-linear, the whole answer arrives at once)" },
    "Mercury-Gemini":     { class: "high-voltage",  phrase: "high-voltage chatter (fast, branching, three angles at once)" },
    "Mercury-Sagittarius":{ class: "high-voltage",  phrase: "high-voltage truth-pulse (the honest version fires before the filter)" },
    "Mercury-Aries":      { class: "high-voltage",  phrase: "high-voltage spark (the first thought is the answer)" },
    "Mercury-Libra":      { class: "balanced",      phrase: "a balanced signal (edited for fairness in real time)" },
    "Mercury-Virgo":      { class: "balanced",      phrase: "a precise signal (sorted and corrected before it is released)" },
    "Mercury-Pisces":     { class: "diffuse",       phrase: "a diffuse signal (arrives as impression first, words second)" },
    "Mercury-Cancer":     { class: "diffuse",       phrase: "a feeling-routed signal (the mood gets read before the words form)" },
    "Mercury-Scorpio":    { class: "compressed",    phrase: "a compressed signal (held back until the real version is safe to release)" },
    "Mercury-Capricorn":  { class: "compressed",    phrase: "a structured signal (will not speak until it is sound)" },
    "Mercury-Taurus":     { class: "steady",        phrase: "a steady signal (slow, concrete, refuses to be rushed)" },
    "Mercury-Leo":        { class: "high-pressure", phrase: "a performance-grade signal (needs an audience to think clearly)" },
    "Mars-Scorpio":       { class: "high-pressure", phrase: "a pressure cooker (the stakes go up when something matters, not down)" },
    "Mars-Aries":         { class: "live-wire",     phrase: "a live-wire discharge (fires before the thought finishes)" },
    "Mars-Capricorn":     { class: "compressed",    phrase: "compressed voltage (the heat gets pushed down to be processed later)" },
    "Mars-Leo":           { class: "high-pressure", phrase: "high-visibility heat (the response cannot be small)" },
    "Mars-Cancer":        { class: "diffuse",       phrase: "sideways pressure (protects by indirection, not confrontation)" },
    "Mars-Libra":         { class: "balanced",      phrase: "fairness-routed pressure (tries to stay even with both sides, which can freeze)" },
    "Mars-Taurus":        { class: "steady",        phrase: "slow-burn pressure (digs in, will not be moved off the position)" },
    "Mars-Gemini":        { class: "high-voltage",  phrase: "scattered voltage (the heat multiplies into words)" },
    "Mars-Virgo":         { class: "balanced",      phrase: "precision pressure (narrows into correction, which can read as criticism)" },
    "Mars-Sagittarius":   { class: "high-voltage",  phrase: "fire-pulse (wants to leave the room and reframe from outside)" },
    "Mars-Aquarius":      { class: "high-voltage",  phrase: "principled voltage (detaches a step and answers from logic)" },
    "Mars-Pisces":        { class: "diffuse",       phrase: "diffuse pressure (hard to locate, often looks like withdrawal)" },
  };

  function describeCollision(v: VoltageClass, d: Density, planet: string): string | null {
    if (d === "wireless") {
      return `With ${planet} on a wireless medium, thought and speech arrive together — what ${name} understands and what ${name} can say tend to land at the same time.`;
    }
    const key = `${v}|${d}`;
    switch (key) {
      case "high-voltage|friction":
        return `That is a data jam. The brain has finished, but the nerves are still grounding the current, so ${name} feels fullness or static in the chest or throat before any words come.`;
      case "high-voltage|submerged":
        return `That is signal fog with sparks. Flashes of total clarity arrive underwater, and it takes time for any one of them to surface as a sentence.`;
      case "high-voltage|reflex":
        return `That is a live-wire broadcast. The thought reaches the skin and the room at the same instant, with no buffer in between.`;
      case "high-pressure|reflex":
        return `That is the wall. The body throws up a shield at the skin level before the mind has finished downloading the actual reply.`;
      case "high-pressure|friction":
        return `That is a pressure cooker held inside the hardware. The heat stays in the body and releases later as an outburst or a shutdown, rarely as a real-time conversation.`;
      case "high-pressure|submerged":
        return `That is buried heat. The intensity is real, but it stays underwater and only the small surface version reaches the room.`;
      case "balanced|submerged":
        return `That is deep-sea lag. The understanding is there in real time, but the language has to travel up from underwater, so the right words arrive after the moment has moved on.`;
      case "balanced|friction":
        return `That is a careful current. Every word gets routed through the nervous system for a fairness check before it leaves the body, which costs seconds the room does not give back.`;
      case "balanced|reflex":
        return `That is a fast edit at the skin. The reply is being shaped for fairness in the same instant it is being said.`;
      case "diffuse|submerged":
        return `That is total absorption underwater. ${name} is taking in more signal than the room is showing, and sorting whose feeling is whose takes time the conversation does not allow.`;
      case "diffuse|reflex":
        return `That is an impression broadcast. Whatever the room is feeling lands on the skin and goes out again before it can be filtered.`;
      case "diffuse|friction":
        return `That is mood routed through the body. ${name} feels the room physically before they can name what was even off.`;
      case "compressed|submerged":
        return `That is double containment. The real answer is held back twice, once by the medium and once by the voltage, so almost nothing surfaces in the moment.`;
      case "compressed|reflex":
        return `That is composure at the skin. The face holds, the voice holds, and the actual reaction gets processed in private hours later.`;
      case "compressed|friction":
        return `That is held current in the hardware. The pressure is real and the body knows it, but the release waits for a private moment.`;
      case "steady|friction":
        return `That is grounded current. Slow, physical, conducted through the body at the body's pace, not the conversation's.`;
      case "steady|submerged":
        return `That is anchored depth. Things settle slowly, underwater, and will not be hurried to the surface.`;
      case "steady|reflex":
        return `That is a slow live wire. The signal reaches the skin, but at the body's pace, not the room's.`;
      case "live-wire|reflex":
        return `That is the system at full discharge. The signal hits the room before any internal review has happened.`;
      case "live-wire|friction":
        return `That is voltage caught in the body. The discharge wants out, but the nervous system makes it physical first.`;
      case "live-wire|submerged":
        return `That is sudden surfacing. The discharge breaks through underwater density in bursts, then goes quiet again.`;
      default:
        return null;
    }
  }

  const hardwareLines: string[] = [];
  const collisionLines: string[] = [];

  const auditPlanet = (planet: string, sign: string | undefined, house: number | null | undefined) => {
    if (!sign || !house) return;
    const med = HOUSE_DENSITY[house];
    const volt = VOLTAGE[`${planet}-${sign}`];
    if (!med || !volt) return;
    hardwareLines.push(`${sign} ${planet} runs as ${volt.phrase} through ${med.phrase}.`);
    const coll = describeCollision(volt.class, med.class, planet);
    if (coll) collisionLines.push(coll);
  };

  auditPlanet("Mercury", mercurySign, mercuryHouse);
  auditPlanet("Mars", marsSign, marsHouse);
  if (p.chartRuler && p.chartRuler.rulerName !== "Mercury" && p.chartRuler.rulerName !== "Mars") {
    auditPlanet(p.chartRuler.rulerName, p.chartRuler.rulerSign, p.chartRuler.rulerHouse ?? null);
  }

  // Precompute editorial-layer (Section 9) flags so older Section 6 blocks
  // can be suppressed when 9a / 9c will fire and say the same thing better.
  const _p9 = (chart?.planets ?? {}) as any;
  const _scorpio1st_pre = (_p9.Sun?.sign === "Scorpio" && sunHouse === 1)
    || (_p9.Mars?.sign === "Scorpio" && marsHouse === 1)
    || _p9.Pluto?.house === 1
    || (p as any)?.ascendant?.sign === "Scorpio";
  const _saturnLeo10_pre = _p9.Saturn?.sign === "Leo" && _p9.Saturn?.house === 10;
  const _libraIdentity_pre = _p9.Sun?.sign === "Libra" || (p as any)?.ascendant?.sign === "Libra";
  const _merc12_pre = mercuryHouse === 12;
  const _venusJupReception_pre = _p9.Venus?.sign && _p9.Jupiter?.sign
    && RULER_OF[_p9.Venus.sign] === "Jupiter" && RULER_OF[_p9.Jupiter.sign] === "Venus";
  const _jup8_pre = _p9.Jupiter?.house === 8;
  const _venus8_pre = _p9.Venus?.house === 8;
  const will9aFire = _scorpio1st_pre && (_saturnLeo10_pre || _libraIdentity_pre || _merc12_pre);
  const will9cFire = !!(_venusJupReception_pre || _jup8_pre || _venus8_pre);

  // Section 6 collision block — suppress when 9a will fire (9a explains the
  // same power/restraint dynamic with proper chart weight). Also strip the
  // mechanism teaser line; that sequencing now lives in In The Moment / How
  // The System Works, not in the Core Portrait.
  if (!will9aFire && collisionLines.length >= 1) {
    const uniqueCollisions = Array.from(new Set(collisionLines));
    portraitParts.push(`In the body, ${uniqueCollisions.join(" ")} That is pressure reaching the body before language has fully caught up — not a personality problem.`);
  }

  // 6b. PHASE PRESSURE — the current developmental stage pairs with one specific
  // planet, and that planet's voltage/medium is the circuit being stress-tested
  // right now. This is what makes the same chart feel different at 17 vs. 47.
  const stageName = p.developmentalAnchor?.stage || "";
  const PHASE_PLANET: Array<{ match: RegExp; planet: string; label: string }> = [
    { match: /Lunar Phase/i,        planet: "Moon",    label: "Lunar Phase" },
    { match: /Mercury Phase/i,      planet: "Mercury", label: "Mercury Phase" },
    { match: /Mars/i,               planet: "Mars",    label: "Mars / Identity Phase" },
    { match: /Saturn Return: Building/i, planet: "Saturn",  label: "First Saturn Return" },
    { match: /Uranus Opposition/i,  planet: "Uranus",  label: "Uranus Opposition" },
    { match: /Chiron Return/i,      planet: "Chiron",  label: "Chiron Return" },
    { match: /Second Saturn Return/i,    planet: "Saturn",  label: "Second Saturn Return" },
  ];
  const activePhase = PHASE_PLANET.find(ph => ph.match.test(stageName));
  if (activePhase) {
    const phPlanetData = (chart?.planets as any)?.[activePhase.planet];
    const phSign = phPlanetData?.sign as string | undefined;
    const phHouse = calcHouse(phPlanetData?.sign, phPlanetData?.degree, phPlanetData?.minutes);
    const phMed = phHouse ? HOUSE_DENSITY[phHouse] : undefined;
    const phVolt = phSign ? VOLTAGE[`${activePhase.planet}-${phSign}`] : undefined;
    if (phMed && phVolt) {
      portraitParts.push(
        `Right now, ${name} is in the ${activePhase.label}, so ${activePhase.planet} is the part of the chart under the most pressure. ${phSign} ${activePhase.planet} in the ${ord(phHouse!)} house shows where this age asks for more capacity. The "pushing back" or "shutting down" you are seeing is not character. It is ${name} meeting more weight in this part of life than the body has carried before, and learning how much it can take before it needs support.`,
      );
    } else if (phSign && phHouse) {
      portraitParts.push(
        `Right now, ${name} is in the ${activePhase.label}, so ${activePhase.planet} in ${phSign} (${ord(phHouse)} house) is the chart part under pressure. The behavior that looks like rebellion or shutdown is ${name} learning what this part of life can carry.`,
      );
    }
  }

  // 6c. MIRROR / MAGNET FLIP — when Sun and Mars sit in houses of different
  // density (especially Sun in a submerged/wireless house and Mars in a reflex
  // or friction house), the system can flip from "absorbing the room" to
  // "broadcasting from the body" to protect itself.
  const sunMed = sunHouse ? HOUSE_DENSITY[sunHouse] : undefined;
  const marsMed = marsHouse ? HOUSE_DENSITY[marsHouse] : undefined;
  if (sunMed && marsMed && sunHouse !== marsHouse && sunMed.class !== marsMed.class) {
    const ABSORB_MODE: Partial<Record<Density, string>> = {
      submerged: `absorbing, because the Sun in the ${ord(sunHouse!)} takes the room in before ${name} knows what to do with it`,
      wireless:  `mirroring, because the Sun in the ${ord(sunHouse!)} reflects what is in the room quickly`,
      reflex:    `tracking, because the Sun in the ${ord(sunHouse!)} reads the room at the skin`,
      friction:  `metabolizing, because the Sun in the ${ord(sunHouse!)} runs the room through the body first`,
    };
    const BROADCAST_MODE: Partial<Record<Density, string>> = {
      reflex:    `showing the reaction immediately, because Mars in the ${ord(marsHouse!)} reaches the surface fast`,
      friction:  `moving the heat through the body, because Mars in the ${ord(marsHouse!)} has to act physically before it can settle`,
      submerged: `going underground, because Mars in the ${ord(marsHouse!)} drops the heat below the surface first`,
      wireless:  `pushing the heat outward fast, because Mars in the ${ord(marsHouse!)} needs expression before reflection`,
    };
    const absorb = ABSORB_MODE[sunMed.class];
    const broadcast = BROADCAST_MODE[marsMed.class];
    if (absorb && broadcast) {
      portraitParts.push(
        `There is a switch between two modes. Default position is ${absorb}. When the room gets too loud inside, ${name} flips to ${broadcast}. What looks like ${name} "going not-nice" or "going cold" is usually protection, not a sudden change in character.`,
      );
    }
  }

  // 6d. MUTUAL RECEPTION — Universal Remote. When Mercury and another personal
  // planet host each other's sign, the inner critic / structure / heat has a
  // direct line into the nervous system, so "doing it wrong" raises the static.
  const planetsAny = (chart?.planets ?? {}) as any;
  const merc = planetsAny.Mercury;
  if (merc?.sign) {
    const partners = ["Saturn", "Mars", "Venus", "Sun", "Moon", "Jupiter"];
    for (const partnerName of partners) {
      const partner = planetsAny[partnerName];
      if (!partner?.sign) continue;
      const mercRuler = RULER_OF[merc.sign];
      const partnerRuler = RULER_OF[partner.sign];
      if (mercRuler === partnerName && partnerRuler === "Mercury") {
        if (partnerName === "Saturn") {
          // Traditional rulership reception: Mercury rules Virgo, Saturn rules Aquarius.
          // Describe as a closed loop between independent thinking and self-correction.
          const satHouse = calcHouse(partner.sign, partner.degree, partner.minutes);
          const satReal = (partner.sign === "Virgo" && satHouse === 1)
            ? ` Saturn in Virgo in the 1st can make ${name} feel like the answer has to be correct before ${name} is allowed to stand behind it. So even when Mercury in ${merc.sign} knows what ${name} thinks, Saturn may still check: "Is that accurate enough? Did I do that right? Will this make me look wrong?"`
            : "";
          portraitParts.push(
            `Mercury and Saturn are in traditional mutual reception (Mercury in ${merc.sign}, ruled by Saturn; Saturn in ${partner.sign}, ruled by Mercury). This creates a closed loop between independent thinking and self-correction. Mercury wants the answer to be original and true; Saturn wants it to be useful, correct, and good enough.${satReal} Nothing exits cleanly until both sign off, so the same thought can get re-checked several times before it is allowed out loud.`,
          );
        } else if (partnerName === "Jupiter") {
          // Mercury–Jupiter mutual reception: impression vs. explanation loop.
          // NOT discipline or correctness (that is Saturn). This is about
          // translating a vibe, image, feeling, or private knowing into words.
          portraitParts.push(
            `Mercury and Jupiter are in mutual reception: Mercury in ${merc.sign} is ruled by Jupiter, and Jupiter in ${partner.sign} is ruled by Mercury. This creates a loop between impression and explanation. ${name} may know something first as a feeling, image, vibe, or private knowing, and only later find the words for it. Jupiter in ${partner.sign} keeps trying to explain, joke, teach, or name the thing, while Mercury in ${merc.sign} keeps absorbing more than can be said cleanly.`,
          );
        } else {
          const PARTNER_VOICE: Record<string, string> = {
            Mars:   "anger and survival heat",
            Venus:  "the love-and-worth voice",
            Sun:    "the core identity voice",
            Moon:   "the emotional regulator",
            Jupiter:"the meaning-and-belief voice",
          };
          portraitParts.push(
            `Mercury and ${partnerName} are in mutual reception (Mercury in ${merc.sign}, ${partnerName} in ${partner.sign}, hosting each other's sign). That gives ${PARTNER_VOICE[partnerName]} direct access to how ${name} thinks and speaks. The upside is that this planet can sharpen ${name}'s words from the inside. The cost is that pressure from ${partnerName} can make the chest and throat tighten right when ${name} needs language most.`,
          );
        }
        break;
      }
    }
  }

  // 6d-ii. VALUE-LOOP RECEPTION — Venus and Jupiter in each other's signs.
  // Venus = truth/honesty/worth. Jupiter = safety/meaning/stability.
  // When they host each other, the value system has no final authority and
  // decisions oscillate between honesty and safety instead of landing.
  {
    const v = (chart?.planets as any)?.Venus;
    const j = (chart?.planets as any)?.Jupiter;
    if (!will9cFire && v?.sign && j?.sign && RULER_OF[v.sign] === "Jupiter" && RULER_OF[j.sign] === "Venus") {
      portraitParts.push(
        `Venus and Jupiter are in mutual reception (Venus in ${v.sign}, Jupiter in ${j.sign}). Venus runs truth, honesty, and worth; Jupiter runs safety, meaning, and stability. With them hosting each other, the value system has no final authority — decisions oscillate between "what is honest" and "what is safe" instead of landing cleanly. That is why ${name} can revisit the same call repeatedly: the loop has no endpoint built in.`,
      );
    }
  }




  // 7. Moon regulation layer (after the mechanism, before the fix).
  if (moonSignEarly && MOON_NEED[moonSignEarly]) {
    const mHouse = calcHouse((chart?.planets as any)?.Moon?.sign, (chart?.planets as any)?.Moon?.degree, (chart?.planets as any)?.Moon?.minutes);
    let privacyNote = "";
    if (moonSignEarly === "Sagittarius" && mHouse === 2) {
      portraitParts.push(`Moon in Sagittarius in the 2nd house regulates through body safety plus a bigger view. ${name} settles when his body feels steady and he is not trapped in a heavy emotional corner. Movement, food, water, humor, honesty, and a wider perspective help him come back to himself.`);
    } else if (mHouse === 12 || mHouse === 8 || mHouse === 4) {
      privacyNote = ` In the ${ord(mHouse!)} house, regulation does not happen in the moment — it happens later, privately, away from the room that triggered it. So the system does not reset on the conversation's timeline; it resets on its own.`;
    } else if (mHouse === 11) {
      privacyNote = ` ${name} settles when ${name} feels emotionally safe and still included. Moon in ${moonSignEarly} in the 11th house means the sign brings the softness and familiarity, and the house ties regulation to trusted belonging. If ${name} thinks ${name} has been pushed outside the circle, logic alone will not reset ${name}. ${name} needs to know ${name} still has a place.`;
    }
    if (moonSignEarly === "Sagittarius" && mHouse === 2) {
      // Exact Sagittarius Moon / 2nd-house line already added above.
    } else if (mHouse === 11) {
      portraitParts.push(privacyNote.trim());
    } else {
      portraitParts.push(`The Moon adds the regulation piece: ${MOON_NEED[moonSignEarly]}.${privacyNote}`);
    }
  }

  // 8. (REMOVED) The Sun-sign PACE_FIX coaching push has been deleted from
  // Core Portrait. Support copy must come from the actual chart stack, life
  // stage, and pressure point — not a Sun-sign prescription.

  // ── 9. EDITORIAL LAYER — major-claim 3-layer paragraphs ─────────────────────
  // Each block runs ONLY when its chart signature is present, so the Core
  // Portrait never repeats the same mechanism twice. Pattern per block:
  // human truth → astrology underneath → lived behavior.
  {
    const _p = (chart?.planets ?? {}) as any;
    const scorpio1st = _p.Sun?.sign === "Scorpio" && sunHouse === 1
      || _p.Mars?.sign === "Scorpio" && marsHouse === 1
      || _p.Pluto?.house === 1
      || (p as any)?.ascendant?.sign === "Scorpio";
    const saturnLeo10 = _p.Saturn?.sign === "Leo" && _p.Saturn?.house === 10;
    const libraIdentity = _p.Sun?.sign === "Libra" || (p as any)?.ascendant?.sign === "Libra";
    const merc12 = mercuryHouse === 12;
    const venusJupReception = _p.Venus?.sign && _p.Jupiter?.sign
      && RULER_OF[_p.Venus.sign] === "Jupiter" && RULER_OF[_p.Jupiter.sign] === "Venus";
    const jup8 = _p.Jupiter?.house === 8;
    const venus8 = _p.Venus?.house === 8;
    const merc6 = mercuryHouse === 6;
    const sun6 = sunHouse === 6;
    const nodes = (p as any)?.nodes ?? (p as any)?.northNode ?? null;

    // 9a. Power + restraint. Ordered: Scorpio 1st (raw presence) → Saturn Leo
    // 10 (visibility brake, the most important weight when present) →
    // Libra identity (relational tax on delivery) → Mercury 12 (private
    // word-formation). Saturn in Leo in the 10th is named first inside the
    // brake clauses because it carries the most weight on why power feels
    // serious, earned, and carefully presented.
    if (scorpio1st && (saturnLeo10 || libraIdentity || merc12)) {
      const pieces: string[] = [];
      pieces.push(`Scorpio at the 1st house gives ${name} force, depth, instinct, and a presence people can feel before ${G.subj} ${G.v("explain")} ${G.refl}.`);
      if (saturnLeo10) {
        pieces.push(`Saturn in Leo in the 10th is the main reason that power does not come out raw. Visibility, public role, and creative authority feel serious to ${name} — like something that has to be earned over time, presented carefully, and held to a higher internal standard than other people seem to use. That is why ${G.subj} ${G.does} not lead with the full force; ${G.subj} ${G.v("present")} a measured version first.`);
      }
      if (libraIdentity) pieces.push(`${(p as any)?.ascendant?.sign === "Libra" ? "Libra Rising" : "Libra Sun"} adds a second filter: the delivery should be graceful, fair, and socially intelligent, not blunt.`);
      if (merc12) pieces.push(`Mercury in the 12th holds the words back until they feel safe, precise, and ready to survive the room.`);
      portraitParts.push(`${name} ${G.is} significantly more powerful than ${G.subj} ${G.v("let")} on, and the chart explains why. ${pieces.join(" ")} So the power is real, but it reaches the room through controlled presentation rather than open force.`);
    }

    // 9b. Saturn in Leo in the 10th — visibility-as-work claim. Only emit if
    // 9a did NOT already name it.
    if (saturnLeo10 && !(scorpio1st && (saturnLeo10 || libraIdentity || merc12))) {
      portraitParts.push(`Saturn in Leo in the 10th makes visibility serious. ${name} may have real creative authority, but ${G.subj} ${G.does} not experience being seen casually. Public recognition, leadership, and creative confidence can feel like things that must be earned, justified, or done correctly. So when ${G.subj} ${G.v("hold")} back, it is not because ${G.subj} ${G.v("lack")} presence. It is because being visible comes with an internal standard.`);
    }

    // 9c. Venus/Jupiter or 2nd/8th loop — consequence-awareness, NOT confusion.
    // House-aware: Venus in the 2nd ties truth to self-worth, money, and what
    // ${name} owns; Venus in Sagittarius in the 2nd specifically wants
    // freedom-of-honesty without surrendering personal resources. Jupiter in
    // the 8th ties trust to shared resources, intimacy, and what happens after
    // disclosure; Jupiter in Taurus in the 8th specifically tracks whether
    // honesty will destabilize a slow-built shared foundation.
    if (venusJupReception || jup8 || venus8) {
      const v = _p.Venus, j = _p.Jupiter;
      const vClauses: string[] = [];
      if (v?.sign && v?.house) {
        if (v.sign === "Sagittarius" && v.house === 2) {
          vClauses.push(`Venus in Sagittarius in the 2nd wants the honest answer AND the freedom not to be financially or personally cornered by it. Truth and self-worth are wired together — saying the false-comfortable thing costs ${name} ${G.pposs} own resource base.`);
        } else if (v.house === 2) {
          vClauses.push(`Venus in ${v.sign} in the 2nd ties honesty to self-worth and personal resources — telling the smaller-true thing costs ${name} something ${G.subj} actually ${G.v("own")}.`);
        } else if (v.house === 8) {
          vClauses.push(`Venus in ${v.sign} in the 8th ties honesty to shared resources, intimacy, and what gets exposed when the truth lands.`);
        } else {
          vClauses.push(`Venus in ${v.sign} wants the clean, honest answer and the freedom not to betray ${G.refl}.`);
        }
      }
      const jClauses: string[] = [];
      if (j?.sign && j?.house) {
        if (j.sign === "Taurus" && j.house === 8) {
          jClauses.push(`Jupiter in Taurus in the 8th tracks whether the truth will destabilize what has been built slowly with another person — money, trust, the body, the shared foundation. ${name} ${G.is} not avoiding honesty; ${G.subj} ${G.is} measuring whether the relationship can carry it without breaking.`);
        } else if (j.house === 8) {
          jClauses.push(`Jupiter in ${j.sign} in the 8th tracks trust, shared resources, and what happens after the truth is spoken inside an intimate or financial bond.`);
        } else if (j.house === 2) {
          jClauses.push(`Jupiter in ${j.sign} in the 2nd tracks whether honesty grows or threatens ${G.pposs} own stability.`);
        } else {
          jClauses.push(`Jupiter in ${j.sign} in the ${ord(j.house)} tracks the meaning, loyalty, and aftermath of what gets said.`);
        }
      }
      portraitParts.push(`${G.poss} conflict is not whether ${G.subj} ${G.v("know")} the truth. ${G.subj.charAt(0).toUpperCase() + G.subj.slice(1)} usually ${G.does}. The conflict is whether telling it will cost too much in the relationship, the shared stability, or the emotional economy of the room. ${vClauses.join(" ")} ${jClauses.join(" ")} So the hesitation is not confusion. It is consequence-awareness — ${G.subj} ${G.is} reading the bill before ${G.subj} ${G.v("speak")}.`);
    }

    // 9d. 6th-house bottleneck — only if no other 6th-house mention has already
    // landed in the portrait so far.
    if ((merc6 || sun6) && !portraitParts.join(" ").includes("6th house")) {
      portraitParts.push(`The 6th house is the bottleneck of workability. The mind may see the pattern quickly, but the 6th house asks: can this fit into the day, the body, the schedule, the task, the nervous system, and the person's real capacity? So the delay is not emptiness. It is the point where insight has to become livable.`);
    }

    // 9e. Nodes — lived pattern, not vague destiny. Only if the chart carries
    // recognizable Node house data.
    if (nodes && typeof nodes === "object") {
      const nHouse = (nodes as any)?.north?.house ?? (nodes as any)?.northHouse;
      const sHouse = (nodes as any)?.south?.house ?? (nodes as any)?.southHouse;
      if (nHouse && sHouse) {
        portraitParts.push(`The South Node in the ${ord(sHouse)} house describes the familiar comfort pattern ${name} keeps returning to under stress. The North Node in the ${ord(nHouse)} house is the growth edge, the part of life that feels less practiced but is where ${G.subj} ${G.v("become")} more of ${G.refl}. The nodes are not destiny; they are the lived tension between what is easy and what is being asked.`);
      }
    }
  }

  const corePortrait = portraitParts.join(" ");

  // ── 1b. SYSTEM MECHANISM ────────────────────────────────────────────────────
  // Driver = chart ruler (engine). Translator = Sun (how it comes out).
  // Trigger = the strongest stress signature. The synthesis MUST bridge the
  // trigger back to the engine so it reads as one connected story, not a list.
  const driver = p.chartRuler
    ? {
        label: `${p.chartRuler.rulerName} in ${p.chartRuler.rulerSign}` +
          (p.chartRuler.rulerHouse ? ` (${ord(p.chartRuler.rulerHouse)} house)` : ""),
        detail: `the engine running underneath everything ${name} does`,
      }
    : sunSign
    ? { label: `${sunSign} Sun`, detail: `the core thing ${name} is here to be` }
    : { label: "their core engine", detail: "the part of them that runs the show" };

  const translator = sunSign
    ? {
        label: `${sunSign} Sun` + (sunHouse ? ` in the ${ord(sunHouse)} house` : ""),
        detail: `how that engine actually shows up out in the world`,
      }
    : p.chartRuler
    ? {
        label: `${p.chartRuler.ascSign} Rising`,
        detail: `the doorway the engine has to walk through to reach other people`,
      }
    : { label: "their outward style", detail: "the way the engine reaches other people" };

  // Pick trigger
  // Ranking rule (corrected): tight aspects under 2° outrank pressure
  // signatures. Sun–Chiron tight contact is treated specifically as the
  // permission gate the whole system runs through, so it goes first.
  const tightHard = tightAspects.find(a => a.quality === "hard");
  const tightMoonHard = moonAspectsHard[0];
  const tightSunChiron = sunChiron && sunChiron.orb < 2 ? sunChiron : undefined;
  let trigger: { label: string; detail: string; derivation: string };
  let reaction: string;
  let bridgeWhy: string; // why this trigger relates to THIS engine
  if (tightSunChiron) {
    trigger = {
      label: `Sun ${tightSunChiron.aspect} Chiron (${tightSunChiron.orb.toFixed(1)}°)`,
      detail: `the permission gate every other planet has to pass through`,
      derivation:
        `Picked because Sun–Chiron is tight (orb ${tightSunChiron.orb.toFixed(1)}°, under 2°), which makes it the ` +
        `permission gate of the chart. It is not "one factor among many" — it is the check ("is this allowed?") ` +
        `that runs underneath Mercury, Mars, Venus, and the ruler. It outranks Mars pressure and Venus filters here.`,
    };
    reaction = `the system runs the "is this allowed?" check before anything else can fully land, so the in-the-moment answer comes out partial or held back`;
    bridgeWhy = `the engine has to clear that permission gate every time it tries to express, which is why the same situation can stall in the same place repeatedly`;
  } else if (tightHard) {
    trigger = {
      label: `${tightHard.a} ${tightHard.aspect} ${tightHard.b} (${tightHard.orb.toFixed(1)}°)`,
      detail: `two internal voices that pull against each other in real time`,
      derivation:
        `Picked because this is the tightest hard aspect in the chart (orb ${tightHard.orb.toFixed(1)}°, under 2.5°). ` +
        `Tight hard aspects outrank pressure signatures because they are loud and active in daily life; they show up ` +
        `as internal arguments that do not resolve.`,
    };
    reaction = tightHard.line || `${name} locks up or over-corrects until one side wins`;
    bridgeWhy = `one of those two voices is the engine itself, so the tug shows up every time ${name} tries to move`;
  } else if (p.pressureSignature) {
    trigger = {
      label: `${p.pressureSignature.body} sitting in the ${p.pressureSignature.trigger}`,
      detail: p.pressureSignature.need,
      derivation:
        `Picked because there is no tight hard aspect or Sun–Chiron contact to outrank it, and ${p.pressureSignature.body} ` +
        `is sitting in ${p.pressureSignature.trigger} — a pressure pattern where the engine itself is under containment, ` +
        `not just meeting resistance. This is the strongest pattern AVAILABLE here, not the strongest in the chart overall.`,
    };
    reaction = p.pressureSignature.consequence;
    bridgeWhy =
      p.pressureSignature.trigger === "12th house"
        ? `the same engine is sitting behind a curtain, so it has to be processed privately before it can come out`
        : p.pressureSignature.trigger === "Scorpio"
        ? `the same engine runs deep and won't let things stay surface, which means small pressures stack up internally`
        : `the same engine is wired straight into Pluto, so ordinary friction lands with extra weight`;
  
  } else if (tightMoonHard) {
    trigger = {
      label: `Moon hard-angled to ${tightMoonHard.to} (${tightMoonHard.orb.toFixed(1)}°)`,
      detail: `the safety system has a tender wire on it`,
      derivation:
        `Picked because no pressure signature or tight planet-to-planet hard aspect was found, but the Moon (the ` +
        `safety system) is taking a hard hit from ${tightMoonHard.to} at ${tightMoonHard.orb.toFixed(1)}° orb. ` +
        `Moon hard aspects show up as the nervous system being slow to settle, even when nothing on the surface looks wrong.`,
    };
    reaction = marsSign && MARS_RESET[marsSign]
      ? `the body needs to discharge first (${MARS_RESET[marsSign]}), and only then can the feeling get named`
      : `the feeling goes underground until the room feels steady enough to set it down`;
    bridgeWhy = `the engine can't relax while the safety system is still bracing, so regulation has to happen before anything else can land`;
  } else if (p.masterySpot.saturn) {
    trigger = {
      label: `Saturn in ${p.masterySpot.saturn.sign}` + (p.masterySpot.saturn.house ? ` (${ord(p.masterySpot.saturn.house)} house)` : ""),
      detail: `the area where the fear of doing it wrong is loudest`,
      derivation:
        `Picked because the chart has no acute pressure signature and no tight hard aspect, so the structural ` +
        `pressure falls back to Saturn's house. Saturn shows where the inner judge is loudest, and that's the ` +
        `area where ${name} most often slows themselves down before someone else can.`,
    };
    reaction = `${name} either freezes, over-prepares, or quietly opts out before anyone has a chance to judge it`;
    bridgeWhy = `the engine wants to move, and Saturn is the part holding it back to make sure it gets done right`;
  } else {
    trigger = {
      label: "stress in their key area",
      detail: "what knocks the system off balance",
      derivation: `No specific structural trigger was found (no pressure signature, tight hard aspect, Moon hard aspect, or Saturn placement strong enough to flag). Stress here is general rather than chart-specific.`,
    };
    reaction = marsSign && MARS_RESET[marsSign]
      ? `the body needs to reset (${MARS_RESET[marsSign]}) before anything else can be processed`
      : `the system goes quiet until it can find ground again`;
    bridgeWhy = `the engine and the stress are wired to each other, so one always activates the other`;
  }

  const synthesis =
    `${name}'s engine is ${driver.label}, and it comes out into the world as ${translator.label}. ` +
    `The pressure point is ${trigger.label}, and ${bridgeWhy}. ` +
    `So when that pressure hits, ${reaction}.`;

  const systemMechanism = { driver, translator, trigger, reaction, synthesis };

  // 2. STAGE ASK — about who this person IS in this chapter, not about adults.
  const stageAsk = {
    title: p.developmentalAnchor.stage,
    body:
      phase === "child"
        ? `This is the chapter ${name} is actually in right now: ${p.developmentalAnchor.body}`
        : phase === "elder"
        ? p.developmentalAnchor.body
        : `This is the cycle ${name} is inside right now (not a generic life stage): ${p.developmentalAnchor.body}`,
  };

  // 3. MISREADS — pick up to 3
  const misreads: Array<{ looksLike: string; actuallyIs: string }> = [];
  const rulerSign = p.chartRuler?.rulerSign;
  if (rulerSign && MISREAD_BY_SIGN[rulerSign]) misreads.push(MISREAD_BY_SIGN[rulerSign]);
  // Add a misread tied to Mars sign if different
  if (marsSign && MISREAD_BY_SIGN[marsSign] && marsSign !== rulerSign) {
    misreads.push(MISREAD_BY_SIGN[marsSign]);
  }
  // Add structural misreads
  if (p.cloakingNote && p.cloakingNote.bodies.some(b => b.name === "Moon")) {
    misreads.push({ looksLike: "'I'm fine' when they're not", actuallyIs: MOON12_MISREAD });
  }
  if (p.masterySpot.chiron && phase !== "elder") {
    misreads.push({ looksLike: "over-reaction to something small", actuallyIs: CHIRON_TENDER_MISREAD });
  }
  if (p.masterySpot.saturn && misreads.length < 3) {
    misreads.push({ looksLike: "avoidance or 'not trying'", actuallyIs: SATURN_TENDER_MISREAD.default });
  }

  // 4. WHAT HELPS — 3–5 concrete sentences
  const whatHelps: string[] = [];
  if (marsSign && MARS_RESET[marsSign]) {
    whatHelps.push(`When ${name} is dysregulated: ${MARS_RESET[marsSign]}.`);
  }
  // Chart ruler instruction
  if (p.chartRuler) {
    whatHelps.push(
      `Their underlying motive runs through ${p.chartRuler.rulerName}` +
        (p.chartRuler.rulerHouse ? ` in the ${ord(p.chartRuler.rulerHouse)} house` : "") +
        `. Give them room to do that work; do not ask them to drop it.`
    );
  }
  // Saturn support
  if (p.masterySpot.saturn?.howToSupport) {
    whatHelps.push(p.masterySpot.saturn.howToSupport);
  }
  // Chiron support
  if (p.masterySpot.chiron?.howToSupport) {
    whatHelps.push(p.masterySpot.chiron.howToSupport);
  }
  // 12th-house cloaking
  if (p.pressureSignature) {
    whatHelps.push(
      `Give ${name} explicit ${p.pressureSignature.needLabel.toLowerCase()}: ${p.pressureSignature.need}.`
    );
  }
  // Trim to 5
  whatHelps.splice(5);

  // 5. CHART STORY — the only place astrology is named
  const storyParts: string[] = [];
  if (p.chartRuler) {
    storyParts.push(
      `Rising sign is ${p.chartRuler.ascSign}, so the chart ruler is ${p.chartRuler.rulerName} in ${p.chartRuler.rulerSign}` +
        (p.chartRuler.rulerHouse ? ` in the ${ord(p.chartRuler.rulerHouse)} house` : "") +
        `. That is the engine running underneath everything else.`
    );
  }
  if (p.identityInvitation.sun) {
    storyParts.push(
      `Sun in ${p.identityInvitation.sun.sign}` +
        (p.identityInvitation.sun.house ? ` in the ${ord(p.identityInvitation.sun.house)} house` : "") +
        ` is the core thing being practiced.`
    );
  }
  if (tightAspects.length > 0) {
    const fmt = (a: typeof tightAspects[number]) => `${a.a} ${a.aspect} ${a.b} (${a.orb.toFixed(1)}°)`;
    const mainPressure = tightAspects.find(a => a.quality === "hard");
    const softResources = tightAspects.filter(a => a.quality !== "hard").slice(0, 2);
    const parts: string[] = [];
    if (mainPressure) {
      parts.push(`The main pressure conversation is ${fmt(mainPressure)}.`);
    }
    if (softResources.length > 0) {
      parts.push(`The strongest emotional resources are ${softResources.map(fmt).join(" and ")}.`);
    }
    if (parts.length === 0) {
      // No hard/soft split available — fall back to listing the tightest.
      parts.push(
        `The tightest active conversations in the chart are: ` +
          tightAspects.slice(0, 2).map(fmt).join("; ") + `.`
      );
    }
    storyParts.push(parts.join(" "));
  }
  // Life-stage planet
  if (phase === "adult" && age != null) {
    if (age >= 27 && age <= 31) storyParts.push(`Saturn Return is the active life-stage transit right now.`);
    else if (age >= 40 && age <= 44) storyParts.push(`Uranus opposition is the active life-stage transit right now.`);
    else if (age >= 48 && age <= 52) storyParts.push(`Chiron Return is the active life-stage transit right now.`);
    else if (age >= 57 && age <= 61) storyParts.push(`Second Saturn Return is the active life-stage transit right now.`);
  }
  const chartStory = storyParts.join(" ");

  // 5b. BRIDGE — "Why This Works": connect 2 real placements to a real behavior,
  // in plain language, no jargon. This is the most important section.
  const moonSign = (chart?.planets?.Moon as any)?.sign || undefined;

  type Anchor = { label: string; feel: string };
  const anchors: Record<string, Anchor> = {};
  if (sunSign && SUN_FEELS[sunSign]) {
    anchors.Sun = { label: `Sun in ${sunSign}`, feel: SUN_FEELS[sunSign] };
  }
  if (mercurySign && MERCURY_FEELS[mercurySign]) {
    anchors.Mercury = { label: `Mercury in ${mercurySign}`, feel: MERCURY_FEELS[mercurySign] };
  }
  if (moonSign && MOON_FEELS[moonSign]) {
    anchors.Moon = { label: `Moon in ${moonSign}`, feel: MOON_FEELS[moonSign] };
  }
  if (marsSign && MARS_FEELS[marsSign]) {
    anchors.Mars = { label: `Mars in ${marsSign}`, feel: MARS_FEELS[marsSign] };
  }

  // Priority pairings: pick the first pair where both anchors exist.
  const pairings: Array<[string, string]> = [
    ["Sun", "Mercury"],
    ["Sun", "Moon"],
    ["Moon", "Mercury"],
    ["Sun", "Mars"],
    ["Moon", "Mars"],
    ["Mercury", "Mars"],
  ];

  let bridge: ComposedPortrait["bridge"] = undefined;
  const pair = pairings.find(([x, y]) => anchors[x] && anchors[y]);
  if (pair) {
    const [aKey, bKey] = pair;
    const a = anchors[aKey];
    const b = anchors[bKey];

    // Behavior + "what helps" tail tuned to which pair we picked.
    const behaviorByPair: Record<string, string> = {
      "Sun|Mercury": `when you ask ${name} a direct question in the moment, the answer may not show up right away, not because ${name} is avoiding it, but because the part that feels and the part that thinks need a beat to catch up to each other. Giving ${name} a little space works because it lets those two parts meet.`,
      "Sun|Moon": `when something hard happens, what ${name} needs to feel safe is not always the same as what ${name} is trying to be in the world. Both have to be honored, or the system stays on edge. Naming the difference out loud is what brings it down.`,
      "Moon|Mercury": `${name} can talk about a feeling clearly and still not feel settled, because thinking it through and actually calming down are two different jobs. Help with both, in that order, and the system lands.`,
      "Sun|Mars": `${name} can know what they want and still get stuck on how to push for it, because the wanting and the doing run on different fuel. Giving the body its outlet first usually unlocks the rest.`,
      "Moon|Mars": `when ${name} is upset, the body needs to move before the heart can talk. If you try to discuss the feeling first, it will stall. Discharge first, talk second.`,
      "Mercury|Mars": `${name}'s thinking and ${name}'s drive can pull in different directions, so the words and the action don't always line up. Slowing down one and letting the other catch up is what makes both make sense.`,
    };
    const tail = behaviorByPair[`${aKey}|${bKey}`] ?? `the two parts have to be allowed to do their separate jobs before they line up.`;

    const paragraph =
      `${name}'s ${a.label}, which means ${a.feel}. ` +
      `But ${name}'s ${b.label}, which ${b.feel}. ` +
      `So ${tail}`;

    bridge = { paragraph, placements: [a.label, b.label] };
  }

  // ── CHAIN OF COMMAND ────────────────────────────────────────────────────────
  // Walk: chart ruler -> ruler of its sign -> ruler of that planet's sign -> ...
  // Stops when a planet lands in its own sign (final dispositor), or when the
  // walk re-enters a planet already visited (a loop / mutual reception).
  // This is the "who reports to whom" of the chart, and it tells you what's
  // really pulling the strings underneath the chart ruler.
  let chainOfCommand: ComposedPortrait["chainOfCommand"] = undefined;
  const allPlanets = chart?.planets as Record<string, any> | undefined;
  if (p.chartRuler && allPlanets) {
    const steps: Array<{ planet: string; sign: string; house: number | null; reason: string }> = [];
    const seen = new Map<string, number>(); // planet name -> step index
    let currentName: string | undefined = p.chartRuler.rulerName;
    let currentSign: string | undefined = p.chartRuler.rulerSign;
    let currentHouse: number | null = p.chartRuler.rulerHouse;
    let finalDispositor: { planet: string; sign: string; house: number | null } | undefined;
    let loop: string[] | undefined;
    let mutualReception: { a: string; b: string; aSign: string; bSign: string } | undefined;

    // Push step 0: the Rising sign itself (the doorway every situation enters through).
    steps.push({
      planet: `${p.chartRuler.ascSign} Rising`,
      sign: p.chartRuler.ascSign,
      house: 1,
      reason: `Every situation enters through ${p.chartRuler.ascSign}'s filter first — that's the doorway. ${p.chartRuler.ascSign} is ruled by ${currentName}, so the doorway hands authority to ${currentName}.`,
    });
    // Push step 1: the chart ruler (the planet that runs the doorway).
    steps.push({
      planet: currentName!,
      sign: currentSign!,
      house: currentHouse,
      reason: `Chart ruler. This is the planet ${name} actually reports to, because it runs the Rising sign.`,
    });
    seen.set(currentName!, 1);

    let safety = 0;
    while (safety++ < 12 && currentSign) {
      const nextName = RULER_OF[currentSign];
      if (!nextName) break;
      // Self-rulership: planet lives in the sign it rules. Final dispositor reached.
      if (nextName === currentName) {
        finalDispositor = { planet: currentName, sign: currentSign, house: currentHouse };
        break;
      }
      const nextPlanet = allPlanets[nextName];
      if (!nextPlanet?.sign) break;
      const nextHouse: number | null = ((): number | null => {
        // approximate: re-derive from chart house cusps via the same helper isn't
        // available here; fall back to null. Sign-level chain is the important part.
        return null;
      })();

      // Mutual reception: A is in B's sign AND B is in A's sign.
      if (RULER_OF[nextPlanet.sign] === currentName) {
        mutualReception = {
          a: currentName!, aSign: currentSign,
          b: nextName, bSign: nextPlanet.sign,
        };
        steps.push({
          planet: nextName, sign: nextPlanet.sign, house: nextHouse,
          reason: `Mutual reception with ${currentName}. Each one is sitting in the other's sign, which creates a loop with no final authority — decisions do not land cleanly, they oscillate between the two.`,
        });
        break;
      }

      // Loop detection: we've been here before.
      if (seen.has(nextName)) {
        const startIdx = seen.get(nextName)!;
        loop = steps.slice(startIdx).map(s => s.planet).concat(nextName);
        steps.push({
          planet: nextName, sign: nextPlanet.sign, house: nextHouse,
          reason: `Closes the loop. ${loop.join(" -> ")} all point at each other, so the system has no single final boss; it forms a closed loop between their separate jobs.`,
        });
        break;
      }

      steps.push({
        planet: nextName, sign: nextPlanet.sign, house: nextHouse,
        reason: `${currentName} is in ${currentSign}, and ${nextName} rules ${currentSign}. So ${currentName} hands authority up to ${nextName}.`,
      });
      seen.set(nextName, steps.length - 1);
      currentName = nextName;
      currentSign = nextPlanet.sign;
      currentHouse = nextHouse;
    }

    // Build a plain-language narrative.
    const chainLine = steps.map(s => `${s.planet} in ${s.sign}`).join(" -> ");
    let narrative = `Walk the chain of command from the top down: ${chainLine}. `;
    if (mutualReception) {
      const pair = new Set([mutualReception.a, mutualReception.b]);
      const isMercSat = pair.has("Mercury") && pair.has("Saturn");
      if (isMercSat) {
        const mercSign = mutualReception.a === "Mercury" ? mutualReception.aSign : mutualReception.bSign;
        const satSign = mutualReception.a === "Saturn" ? mutualReception.aSign : mutualReception.bSign;
        narrative +=
          `Mercury and Saturn are in traditional mutual reception: Mercury is in ${mercSign}, ruled by Saturn traditionally, ` +
          `and Saturn is in ${satSign}, ruled by Mercury. This creates a closed loop between independent thinking and ` +
          `self-correction. Mercury wants the answer to be original and true; Saturn wants it to be useful, accurate, and ` +
          `good enough to stand behind. Decisions involving these two do not land cleanly — they oscillate until both sign off.`;
      } else {
        narrative +=
          `${mutualReception.a} and ${mutualReception.b} are in traditional mutual reception — a closed loop between ` +
          `${mutualReception.a}'s job and ${mutualReception.b}'s job (${mutualReception.a} sits in ${mutualReception.aSign}, ` +
          `and ${mutualReception.b} sits in ${mutualReception.bSign}). Decisions involving these two do not land cleanly; ` +
          `they oscillate until both sign off, with neither fully overriding the other.`;
      }
    } else if (loop) {
      narrative +=
        `There is no single final boss. ${loop.join(", ")} all point at each other in a closed loop between their ` +
        `separate jobs. In daily life, this means ${name} doesn't have one fixed "true north" inside; the same situation ` +
        `can be run by a different planet each time, depending on which one got activated first. It can feel like ` +
        `running on a wheel that keeps handing off the steering, which is why ${name} sometimes ends up back where they started.`;
    } else if (finalDispositor) {
      narrative +=
        `${finalDispositor.planet} is the final dispositor (it sits in ${finalDispositor.sign}, the sign it already rules). ` +
        `That means every other planet in the chain eventually reports to ${finalDispositor.planet}. ` +
        `In real life, ${finalDispositor.planet} is the part of ${name} that has the last word when decisions get hard. ` +
        `When ${name} is unsure, the answer their system will quietly default to is whatever ${finalDispositor.planet}'s job is.`;
    } else {
      narrative += `The chain runs but doesn't close cleanly; treat the last planet in the chain as the working boss for now.`;
    }

    chainOfCommand = { steps, finalDispositor, loop, mutualReception, narrative };
  }

  // ── WHAT ACTUALLY RUNS THE MOMENT ──────────────────────────────────────────
  // Ranked, sequential activation order. Priority rule:
  //  1. Tight hard aspects under 2° (override everything)
  //  2. Life-stage anchor planet (Chiron/Saturn/Mars/etc.)
  //  3. Mercury (speech timing, especially 12th house)
  //  4. Chart ruler (how the person operates)
  //  5. Oppositions/squares (conflict patterns)
  //  6. Mars (pressure response)
  let realTimeSequence: ComposedPortrait["realTimeSequence"] = undefined;
  {
    const seqSteps: NonNullable<ComposedPortrait["realTimeSequence"]>["steps"] = [];

    // Pick the tightest hard aspect under 2° (overrides everything if present).
    const overrideAspect = tightAspects.find(
      a => a.orb < 2 && (a.aspect === "conjunction" || a.aspect === "opposition" || a.aspect === "square"),
    );

    // Life-stage anchor planet (already computed earlier as activePhase).
    const stagePlanet = activePhase?.planet;
    const stagePlanetData = stagePlanet ? (chart?.planets as any)?.[stagePlanet] : undefined;
    const stagePlanetSign = stagePlanetData?.sign as string | undefined;
    const stagePlanetHouse = calcHouse(stagePlanetData?.sign, stagePlanetData?.degree, stagePlanetData?.minutes);

    // Detect Sun–Saturn hard aspect as an alternative pressure gate.
    const sunSaturn = tightAspects.find(
      a =>
        ((a.a === "Sun" && a.b === "Saturn") || (a.a === "Saturn" && a.b === "Sun")) &&
        (a.aspect === "opposition" || a.aspect === "square" || a.aspect === "conjunction"),
    );
    const sunPluto = tightAspects.find(
      a =>
        ((a.a === "Sun" && a.b === "Pluto") || (a.a === "Pluto" && a.b === "Sun")) &&
        (a.aspect === "opposition" || a.aspect === "square" || a.aspect === "conjunction"),
    );
    // Detect Mercury–Saturn traditional mutual reception (Mercury in Aquarius/Capricorn
    // hosted by Saturn, Saturn in Gemini/Virgo hosted by Mercury).
    const mercPlanet = (chart?.planets as any)?.Mercury;
    const satPlanet = (chart?.planets as any)?.Saturn;
    const mercSatReception =
      mercPlanet?.sign && satPlanet?.sign &&
      RULER_OF[mercPlanet.sign] === "Saturn" && RULER_OF[satPlanet.sign] === "Mercury";
    const jupiterPlanetForReception = (chart?.planets as any)?.Jupiter;
    const mercJupReception =
      mercPlanet?.sign && jupiterPlanetForReception?.sign &&
      RULER_OF[mercPlanet.sign] === "Jupiter" && RULER_OF[jupiterPlanetForReception.sign] === "Mercury";
    const ikeAuthorityPattern =
      marsSign === "Aries" && mercurySign === "Pisces" && Boolean(sunPluto && sunPluto.orb < 3) && Boolean(mercJupReception);

    // STEP 1 — TURNS ON FIRST
    // Priority order for the gate: (a) Sun–Saturn tight hard aspect (real
    // pressure point) > (b) Sun–Chiron tight (permission check) > (c) any
    // other tight hard aspect > (d) life-stage anchor.
    const permissionGate = sunChiron && sunChiron.orb < 2.5 ? sunChiron : undefined;
    if (sunSaturn && sunSaturn.orb < 3) {
      seqSteps.push({
        cue: "In real time:",
        lead: `Sun ${sunSaturn.aspect} Saturn (${sunSaturn.orb.toFixed(1)}°)`,
        action: `runs first as the pressure gate. Before anything else can land, the system runs a "is this correct enough, accurate enough, worth saying" check. That audit sits under every other planet — it is not one factor among many, it is the check the rest of the chart has to pass through.`,
        rank: "Priority 1: Sun–Saturn pressure gate. Everything else routes through this audit first.",
      });
    } else if (permissionGate) {
      seqSteps.push({
        cue: "In real time:",
        lead: `Sun ${permissionGate.aspect} Chiron (${permissionGate.orb.toFixed(1)}°)`,
        action: `runs first as the permission gate. Before anything else can boot — before the body reacts, before words form, before the ruler weighs in — the system checks "is this allowed to be said or done?" That check sits underneath every other planet. It is not one factor among many; it is the gate everything else has to pass through.`,
        rank: "Priority 1: Sun–Chiron permission gate. Everything else routes through this check first.",
      });
    } else if (overrideAspect) {
      seqSteps.push({
        cue: "In real time:",
        lead: `${overrideAspect.a} ${overrideAspect.aspect} ${overrideAspect.b} (${overrideAspect.orb.toFixed(1)}°)`,
        action: `fires first because it is the tightest hard aspect in the chart, so it is already on before anything else can boot up. ${overrideAspect.line || `the friction between ${overrideAspect.a} and ${overrideAspect.b} is the first thing the system has to deal with`}.`,
        rank: "Priority 1: tight hard aspect under 2° (overrides everything).",
      });
    } else if (stagePlanet && stagePlanetSign && stagePlanetHouse) {
      seqSteps.push({
        cue: "In real time:",
        lead: `${stagePlanetSign} ${stagePlanet} (${ord(stagePlanetHouse)} house)`,
        action: `turns on first because ${name} is in the ${activePhase!.label} right now, so this planet is already carrying load before the moment starts.`,
        rank: "Priority 2: life-stage anchor planet for this chapter.",
      });
    } else if (sunSign && SUN_LIVE[sunSign]) {
      seqSteps.push({
        cue: "In real time:",
        lead: `${sunSign} Sun${sunHouse ? ` (${ord(sunHouse)} house)` : ""}`,
        action: `turns on first and ${SUN_LIVE[sunSign]}. This happens before thinking catches up.`,
        rank: "Priority fallback: Sun's reflex mechanic.",
      });
    }

    // STEP 1b — BODY REACTION (Mars). House decides timing. 1st house = body-first
    // reflex; 6th = friction-routed through the nervous system; 8th = compressed
    // and released at once; 12th/4th = submerged. Sign describes style, not speed.
    if (marsSign && marsHouse) {
      const marsHouseLine: Record<number, string> = {
        1: "the body reacts before any sentence forms (1st house: immediate, reflex, body-first)",
        2: "the body reacts through what it counts as safe (2nd house)",
        3: "the body reacts at conversational pace (3rd house)",
        4: "the body reacts privately first and surfaces later (4th house: internal)",
        5: "the body reacts through expression or play (5th house)",
        6: "the body reacts through friction and strain (6th house: routed through the nervous system before it can land)",
        7: "the body reacts off the other person (7th house: mirror)",
        8: "the body holds the reaction compressed until trust, then releases at once (8th house)",
        9: "the body reacts through movement and reframing (9th house)",
        10: "the body reacts in public view (10th house: broadcast)",
        11: "the body reacts against the group context (11th house)",
        12: "the body's reaction goes underground first (12th house: submerged)",
      };
      seqSteps.push({
        cue: "Then immediately:",
        lead: `Mars in ${marsSign} (${ord(marsHouse)} house)`,
        action: `${marsHouseLine[marsHouse] ?? "the body reacts on its own clock"}. This is the BODY responding, not the words. ${marsSign === "Aries" && mercurySign === "Pisces" ? `What gets blocked is the slower, more private Mercury-in-Pisces explanation. Mars in Aries may act first, while Mercury is still translating the feeling into language.` : `Mars may activate before Mercury has the language ready.`}`,
        rank: "Priority 2: Mars — the physical response, timed by house. The body moves before the sentence forms.",
      });
    }

    // STEP 2 — MERCURY (processing speed vs delivery lag)
    if (mercurySign && mercuryHouse && MERCURY_HOUSE_DELAY[mercuryHouse]) {
      const merc = `${mercurySign} Mercury (${ord(mercuryHouse)} house)`;
      seqSteps.push({
        cue: "Then:",
        lead: merc,
        action: `attempts the words. ${MERCURY_HOUSE_DELAY[mercuryHouse]}. So the understanding can be fully there in real time while the language is not. What exits at this stage is often partial, edited, or delayed — not wrong, just incomplete.`,
        rank: mercuryHouse === 12
          ? "Priority 3: Mercury in the 12th — output is partial/delayed because expression lags behind comprehension."
          : "Priority 3: Mercury attempts the output; house gates how complete it is.",
      });
    } else if (mercurySign) {
      seqSteps.push({
        cue: "Then:",
        lead: `${mercurySign} Mercury`,
        action: `attempts the words — these are the actual output of the system, and they have to clear the value/safety filters next before they exit cleanly.`,
        rank: "Priority 3: Mercury attempts the output.",
      });
    }

    // STEP 3 — VALUE / SAFETY FILTERS (Venus = truth/honesty, Jupiter = safety/meaning)
    // For Ike pattern (Mercury Pisces + Jupiter Gemini in mutual reception), the
    // main loop is Mercury/Jupiter translation, not Venus/Jupiter value filtering.
    const venusPlanet = (chart?.planets as any)?.Venus;
    const jupiterPlanet = (chart?.planets as any)?.Jupiter;
    const mercJupTranslationLoop =
      mercurySign === "Pisces" && jupiterPlanet?.sign === "Gemini";
    if (mercJupTranslationLoop) {
      seqSteps.push({
        cue: "Filtered through:",
        lead: `Mercury in Pisces and Jupiter in Gemini`,
        action: `Mercury carries the impression, feeling, or private knowing. Jupiter in Gemini tries to name it, explain it, joke with it, or turn it into a thought someone else can understand. The words are not just delayed; they are being translated from feeling into language.`,
        rank: "Priority 4: Mercury/Jupiter translation loop — feeling being rendered into language, not a value filter.",
      });
    } else if (venusPlanet?.sign && jupiterPlanet?.sign) {
      seqSteps.push({
        cue: "Filtered through:",
        lead: `Venus in ${venusPlanet.sign} and Jupiter in ${jupiterPlanet.sign}`,
        action: `Venus runs the truth/honesty filter; Jupiter runs the safety/meaning filter. Mercury's words get shaped by both before they exit, which is why the in-the-moment answer is calibrated for the room — not edited to please, but weighted between honesty and safety.`,
        rank: "Priority 4: value filters (Venus = truth, Jupiter = safety/meaning) that shape Mercury's output.",
      });
    }

    // STEP 4 — CHART RULER (operating-system gate)
    if (p.chartRuler) {
      const rulerLabel = `${p.chartRuler.rulerName} in ${p.chartRuler.rulerSign}` +
        (p.chartRuler.rulerHouse ? ` (${ord(p.chartRuler.rulerHouse)} house)` : "");
      const belief = RULER_BELIEF[p.chartRuler.rulerSign];
      seqSteps.push({
        cue: "At the same time:",
        lead: rulerLabel,
        action: belief
          ? `runs underneath as the operating system and ${belief}. That second voice keeps editing the in-the-moment answer, so what reaches the room is not the whole truth, and the unsaid part keeps running in the background.`
          : `runs underneath as the operating system, which keeps editing the in-the-moment answer.`,
        rank: "Priority 5: chart ruler — the operating system gate.",
      });
    }

    // STEP 5 — IDENTITY FILTER (Sun) — NOT the deliverer. The Sun shapes what
    // the system is even WILLING to claim out loud, but the words themselves
    // come from Mercury.
    if (sunSign) {
      const sunLive = SUN_LIVE[sunSign];
      seqSteps.push({
        cue: "Identity filter:",
        lead: `${sunSign} Sun${sunHouse ? ` in the ${ord(sunHouse)} house` : ""}`,
        action: sunLive
          ? `does not deliver the words — Mercury does that. The Sun decides what is allowed to be claimed as "me" in the answer. ${name} ${sunLive}, and whatever does not fit that gets quietly cut from the version that exits.`
          : `does not deliver the words. It filters what the system is willing to claim as "me" before Mercury releases the sentence.`,
        rank: "Identity filter: what the system is willing to claim, applied to Mercury's output.",
      });
    }

    // STEP 6 — RESULT (partial / incomplete output)
    seqSteps.push({
      cue: "Result:",
      lead: `Mercury delivers, filtered`,
      action: `what reaches the room is Mercury's words after passing through the value filters, the ruler's gate, and the identity filter. It is not wrong — it is incomplete. The full version arrives later, after pressure drops.`,
      rank: "What the room gets: a partial answer, not the full underlying signal.",
    });

    // STEP 7 — AFTER THE MOMENT (chart ruler finishes offline).
    // Final-authority framing depends on what is actually carrying it in the chart:
    //   - Mercury/Saturn mutual reception → the loop itself has final authority
    //   - Sun–Saturn tight hard aspect → pressure-check has final authority
    //   - Sun–Chiron tight → permission check has final authority
    //   - otherwise → Mercury's timing has it
    if (p.chartRuler && RULER_BELIEF[p.chartRuler.rulerSign]) {
      let finalAuthorityLine: string;
      let finalAuthorityRank: string;
      if (mercSatReception) {
        finalAuthorityLine = `Final authority sits with Mercury trying to produce the answer while Saturn audits whether it is correct enough to say. Neither one overrides the other — they hand the decision back and forth until both sign off.`;
        finalAuthorityRank = `Closing: the deeper read arrives later, privately. Final authority = Mercury/Saturn loop${activePhase ? ` + ${activePhase.label} life-stage pressure` : ""}.`;
      } else if (ikeAuthorityPattern) {
        finalAuthorityLine = `Final authority = Mars in Aries + Sun/Pluto pressure + Mercury/Jupiter translation loop. Mercury explains later; Mars moves first.`;
        finalAuthorityRank = `Closing: the deeper read arrives later, privately. Final authority = Mars in Aries + Sun/Pluto pressure + Mercury/Jupiter translation loop. Mercury explains later; Mars moves first.`;
      } else if (sunSaturn && sunSaturn.orb < 3) {
        finalAuthorityLine = `Final authority on the outcome sits with the Sun–Saturn pressure check — whether the version that exits is accurate and worth standing behind — not with Mars or with what got said in the heat of it.`;
        finalAuthorityRank = `Closing: the deeper read arrives later, privately. Final authority = Sun–Saturn pressure check.`;
      } else if (permissionGate) {
        finalAuthorityLine = `Final authority on the outcome sits with Mercury's timing and the Sun–Chiron permission check, not with Mars or with what got said.`;
        finalAuthorityRank = `Closing: the deeper read arrives later, privately. Final authority = Mercury timing + Sun–Chiron permission.`;
      } else {
        finalAuthorityLine = `Final authority on the outcome sits with Mercury's timing — the full version arrives once the words finish forming — not with Mars or with what got said in the moment.`;
        finalAuthorityRank = `Closing: the deeper read arrives later, privately. Final authority = Mercury timing.`;
      }
      seqSteps.push({
        cue: "After the moment:",
        lead: ikeAuthorityPattern ? `Mercury in Pisces` : `${p.chartRuler.rulerName} in ${p.chartRuler.rulerSign}`,
        action: ikeAuthorityPattern
          ? `Mercury in Pisces tries to put words around what Mars already did. The action may have spoken first, and the explanation may arrive later, once the pressure has dropped and the private inner-room processing has caught up. ${finalAuthorityLine}`
          : `the deeper read arrives later, privately — ${RULER_BELIEF[p.chartRuler.rulerSign]}. This is ${p.chartRuler.rulerName} in ${p.chartRuler.rulerSign} surfacing the full version once the pressure has dropped. ${finalAuthorityLine}`,
        rank: finalAuthorityRank,
      });
    }

    if (seqSteps.length >= 2) {
      realTimeSequence = {
        intro: `When everything in ${name}'s chart fires at once, the planets do not all hit at the same volume. They activate in a specific order, and the order is what makes the moment feel the way it does.`,
        priorityNote: `Ranked by HOUSE and ASPECTS (not sign): (1) Sun–Saturn pressure gate or Sun–Chiron permission gate when tight, (2) tightest hard aspect or life-stage anchor, (3) Mars — the physical response, timed by house, (4) Mercury delivery timed by house (12th/4th delayed, 6th strained, 1st/3rd immediate), (5) Venus + Jupiter value filters, (6) chart ruler as the background operating system, (7) Sun as identity filter. Mercury delivers the words; Mars carries the physical response (not language); Moon regulates after, not during.`,
        steps: seqSteps,
      };
    }
  }

  // ── PLANET INTERACTION SYSTEM ──────────────────────────────────────────────
  // Timing comes from HOUSE (and aspects), not from sign. Signs describe STYLE
  // only. Planet functions are strict: Mercury = words/expression, Mars =
  // the physical response (not words), Moon = regulation/reset (not speech), Sun =
  // identity filter, chart ruler = operating system.
  let planetInteraction: ComposedPortrait["planetInteraction"] = undefined;
  {
    // Mercury EXPRESSION timing by house (delivery, not understanding).
    type MercTiming = "immediate" | "balanced" | "strained" | "delayed" | "private";
    const MERC_HOUSE_TIMING: Record<number, MercTiming> = {
      1: "immediate", 3: "immediate",
      5: "balanced", 7: "balanced", 9: "balanced", 10: "balanced", 11: "balanced", 2: "balanced",
      6: "strained",
      4: "private", 8: "private",
      12: "delayed",
    };
    // Mars BODY-REACTION timing by house (reaction, not language).
    type MarsTiming = "immediate" | "strained" | "compressed" | "submerged" | "balanced";
    const MARS_HOUSE_TIMING: Record<number, MarsTiming> = {
      1: "immediate",
      3: "balanced", 5: "balanced", 7: "balanced", 9: "balanced", 10: "balanced", 11: "balanced", 2: "balanced",
      6: "strained",
      8: "compressed",
      4: "submerged", 12: "submerged",
    };
    // Moon REGULATION timing by house (reset, not speech).
    type MoonTiming = "in-the-moment" | "balanced" | "private" | "delayed" | "belonging";
    const MOON_HOUSE_TIMING: Record<number, MoonTiming> = {
      1: "in-the-moment", 7: "in-the-moment",
      3: "balanced", 5: "balanced", 9: "balanced", 10: "balanced", 2: "balanced", 6: "balanced",
      11: "belonging",
      4: "private", 8: "private",
      12: "delayed",
    };

    // House-as-medium phrasing (processing condition, NOT life area).
    const HOUSE_MEDIUM: Record<number, string> = {
      1: "immediate, reflex, body-first: the signal hits the surface before it is screened",
      2: "routed through what the body counts as safe: the signal stalls if safety is in question",
      3: "direct verbal processing: the signal forms in words and exits at conversational pace",
      4: "private inner-room processing: the signal forms underground first and surfaces only when home-base is steady",
      5: "expressive processing: the signal has to come out as performance, play, or creation to fully form",
      6: "friction wiring: the signal has to be conducted through the nervous system and the body before it lands as words",
      7: "mirror processing: the signal does not finalize until it is bounced off the person across from them",
      8: "pressurized and guarded: the signal stays compressed until trust is proven, then arrives at once",
      9: "wide-frame processing: the signal reaches for the bigger context first and the small in-the-moment answer lags",
      10: "broadcast medium: the signal goes public before it gets edited",
      11: "group-channel processing: the signal forms by checking it against the wider network",
      12: "delayed and submerged, not fully conscious: the understanding is there in real time, the language is not",
    };

    // SIGN as STYLE only (not speed). Brief style descriptors.
    const MERC_STYLE: Record<string, string> = {
      Aries: "blunt, first-thought-out", Taurus: "concrete, refuses to be rushed", Gemini: "branching, multi-angle",
      Cancer: "feeling-routed", Leo: "audience-aware", Virgo: "precise, edited for correctness",
      Libra: "edited for fairness in real time", Scorpio: "held back until the real version is safe",
      Sagittarius: "reaches for the honest frame", Capricorn: "will not speak until it is sound",
      Aquarius: "non-linear, the whole answer arrives at once", Pisces: "impression first, words second",
    };
    const MARS_STYLE: Record<string, string> = {
      Aries: "direct, sharp", Taurus: "digs in, will not be moved", Gemini: "scatters into words",
      Cancer: "sideways, protective", Leo: "visible, cannot be small", Virgo: "narrows into correction",
      Libra: "tries to stay fair, can freeze", Scorpio: "intense and contained, raises stakes",
      Sagittarius: "wants to leave the room and reframe", Capricorn: "composed, pushes the real reaction down",
      Aquarius: "detaches and answers from principle", Pisces: "diffuse, hard to locate",
    };
    const MOON_STYLE: Record<string, string> = {
      Aries: "discharges through action", Taurus: "settles through routine and the body",
      Gemini: "settles by talking it through", Cancer: "settles by retreat and home", Leo: "settles by being seen",
      Virgo: "settles by ordering the next step", Libra: "settles by re-balancing the room",
      Scorpio: "settles by going inward to process privately", Sagittarius: "settles by movement and bigger frame",
      Capricorn: "settles by getting back to structure", Aquarius: "settles by stepping back to logic",
      Pisces: "settles by dissolving into rest",
    };

    // Build SIGNAL list (planet+sign as function; timing from house).
    const signals: NonNullable<ComposedPortrait["planetInteraction"]>["signals"] = [];
    const moonPlanet = (chart?.planets as any)?.Moon;
    const moonHouseHere = calcHouse(moonPlanet?.sign, moonPlanet?.degree, moonPlanet?.minutes);

    const mercTiming: MercTiming = mercuryHouse ? (MERC_HOUSE_TIMING[mercuryHouse] ?? "balanced") : "balanced";
    const marsTiming: MarsTiming = marsHouse ? (MARS_HOUSE_TIMING[marsHouse] ?? "balanced") : "balanced";
    const moonTiming: MoonTiming = moonHouseHere ? (MOON_HOUSE_TIMING[moonHouseHere] ?? "balanced") : "balanced";

    if (mercurySign) {
      const style = MERC_STYLE[mercurySign] ?? "";
      const timingPhrase = {
        immediate: "delivery is immediate because of the house",
        balanced: "delivery runs at conversational pace",
        strained: "delivery is strained, has to be worked through the body before the words land",
        private: "delivery happens privately first, then surfaces",
        delayed: "delivery is delayed, the words arrive later than the understanding does",
      }[mercTiming];
      signals.push({
        role: "Words and expression (output)",
        planet: "Mercury",
        sign: mercurySign,
        house: mercuryHouse,
        fn: `is the words. Sign sets STYLE (${style}); house sets TIMING. Here, ${timingPhrase}${mercuryHouse ? ` (${ord(mercuryHouse)} house)` : ""}.`,
      });
    }
    if (marsSign) {
      const style = MARS_STYLE[marsSign] ?? "";
      const timingPhrase = {
        immediate: "the body reacts immediately, before any sentence forms",
        balanced: "the body reacts at a normal pace",
        strained: "the body reacts through friction, has to be worked out physically",
        compressed: "the body holds the reaction compressed until trust is established, then releases at once",
        submerged: "the body's reaction goes underground first, surfaces later",
      }[marsTiming];
      signals.push({
        role: "Physical response, not words",
        planet: "Mars",
        sign: marsSign,
        house: marsHouse,
        fn: `is the body's reaction, NOT the words. Sign sets STYLE (${style}); house sets TIMING. Here, ${timingPhrase}${marsHouse ? ` (${ord(marsHouse)} house)` : ""}.`,
      });
    }
    if (moonSignEarly) {
      const style = MOON_STYLE[moonSignEarly] ?? "";
      const timingPhrase = moonSignEarly === "Sagittarius" && moonHouseHere === 2
        ? `Moon in Sagittarius in the 2nd house regulates through body safety plus a bigger view. ${name} settles when his body feels steady and he is not trapped in a heavy emotional corner. Movement, food, water, humor, honesty, and a wider perspective help him come back to himself.`
        : moonHouseHere === 2
        ? `regulation depends on body safety, steadiness, food, water, and enough physical calm for the feeling to come down`
        : ({
        "in-the-moment": "regulation can happen in the room",
        balanced: "regulation happens after the moment through ordinary settling cues",
        private: "regulation happens privately, away from the room that triggered it",
        delayed: "regulation happens later and underground, not in the moment",
        belonging: `regulation depends on trusted belonging — ${name} resets only when ${name} feels included, accepted, and still part of the group, not just because the conversation is over`,
      }[moonTiming]);
      signals.push({
        role: "Regulation and reset (not speech)",
        planet: "Moon",
        sign: moonSignEarly,
        house: moonHouseHere,
        fn: `is the reset, NOT language. Sign sets STYLE (${style}); house sets WHEN it can reset. Here, ${timingPhrase}${moonHouseHere ? ` (${ord(moonHouseHere)} house)` : ""}.`,
      });
    }
    if (sunSign) {
      signals.push({
        role: "Identity filter (what is allowed to be 'me')",
        planet: "Sun",
        sign: sunSign,
        house: sunHouse,
        fn: `is the identity filter. It does NOT deliver words; it decides what the system is willing to claim as "me" before Mercury releases the sentence.`,
      });
    }
    if (p.chartRuler) {
      signals.push({
        role: "Operating system (background driver)",
        planet: p.chartRuler.rulerName,
        sign: p.chartRuler.rulerSign,
        house: p.chartRuler.rulerHouse,
        fn: `is the chart ruler — the background operating system. Every other planet's output passes through this filter.`,
      });
    }
    if (activePhase) {
      const ph = (chart?.planets as any)?.[activePhase.planet];
      if (ph?.sign) {
        signals.push({
          role: "Current life-stage focus",
          planet: activePhase.planet,
          sign: ph.sign,
          house: calcHouse(ph.sign, ph.degree, ph.minutes),
          fn: `is the planet under active load right now because of the ${activePhase.label}; this chapter is asking that planet to carry more pressure.`,
        });
      }
    }

    // Build MEDIUM list (house as processing condition).
    const mediums: NonNullable<ComposedPortrait["planetInteraction"]>["mediums"] = [];
    const addMedium = (planet: string, house: number | null) => {
      if (house && HOUSE_MEDIUM[house]) mediums.push({ planet, house, medium: HOUSE_MEDIUM[house] });
    };
    addMedium("Mercury", mercuryHouse);
    addMedium("Mars", marsHouse);
    addMedium("Moon", moonHouseHere);
    if (p.chartRuler?.rulerName && !["Mercury","Mars","Moon"].includes(p.chartRuler.rulerName)) {
      addMedium(p.chartRuler.rulerName, p.chartRuler.rulerHouse);
    }

    // TIMING COLLISION — compare Mars physical-response timing vs Mercury
    // delivery timing. Both derive from HOUSE, not sign.
    const timingOrder: Record<string, number> = {
      "immediate": 4, "balanced": 3, "strained": 2, "compressed": 2, "private": 1, "submerged": 1, "delayed": 0,
    };
    const marsRank = timingOrder[marsTiming];
    const mercRank = timingOrder[mercTiming];
    const bodyFirst = marsRank > mercRank;
    const wordsFirst = mercRank > marsRank;

    let comparison: string;
    let mismatch: string;
    if (bodyFirst) {
      comparison = `Mars in the ${marsHouse ? ord(marsHouse) : "?"} house gives the body a ${marsTiming} reaction, while Mercury in the ${mercuryHouse ? ord(mercuryHouse) : "?"} house has a ${mercTiming} delivery for the words.`;
      mismatch = `The body reacts first. The words arrive after. Understanding can be fully present in real time while expression lags. To the room, the reaction can read as out of nowhere when it is actually accurate processing arriving on a slower delivery clock.`;
    } else if (wordsFirst) {
      comparison = `Mercury in the ${mercuryHouse ? ord(mercuryHouse) : "?"} house delivers the words ${mercTiming}, while Mars in the ${marsHouse ? ord(marsHouse) : "?"} house gives the body a ${marsTiming} reaction.`;
      mismatch = `The words arrive before the body is ready. That shows up as sounding articulate in the moment, then noticing later that the body never agreed. Pressure sits in the gap between what was said and what the body actually did with it.`;
    } else {
      comparison = `Mercury (${mercTiming} delivery) and Mars (${marsTiming} reaction) sit at similar timing here.`;
      mismatch = `Reaction and expression arrive close together with little buffer. Whatever surfaces in the moment is the version the room keeps; the second voice arrives later, if at all.`;
    }
    // Moon regulation note — AFTER the moment, not during.
    const moonNote = moonSignEarly === "Sagittarius" && moonHouseHere === 2
      ? ` His reset comes through the Moon: body steadiness first, then humor, movement, honesty, and a wider frame.`
      : moonHouseHere === 2
      ? ` The Moon in the 2nd house regulates through body safety: steadiness, food, water, and enough physical calm for the feeling to come down.`
      : moonTiming === "delayed" || moonTiming === "private"
      ? ` The Moon in the ${moonHouseHere ? ord(moonHouseHere) : "?"} house does not regulate in the room; reset happens later, privately, on its own timeline.`
      : moonTiming === "in-the-moment"
      ? ` The Moon in the ${moonHouseHere ? ord(moonHouseHere) : "?"} house can regulate in the room itself, which closes the loop faster than the words or the body can.`
      : moonTiming === "belonging"
      ? ` The Moon in the 11th house resets through trusted belonging — ${name} settles when ${name} feels still included and accepted by the group, not just because the moment has ended.`
      : ` The Moon regulates after the moment, on its own rhythm.`;
    mismatch += moonNote;

    // Detect Mercury–Saturn traditional mutual reception here too, so the
    // "late" copy can name the loop instead of pointing at the Moon.
    const _mercP = (chart?.planets as any)?.Mercury;
    const _satP = (chart?.planets as any)?.Saturn;
    const mercSatReceptionLocal =
      _mercP?.sign && _satP?.sign &&
      RULER_OF[_mercP.sign] === "Saturn" && RULER_OF[_satP.sign] === "Mercury";

    // REAL-TIME OUTPUT — Mercury delivers WORDS. Sun is identity filter, not
    // the deliverer. Venus/Jupiter shape value/safety filtering. Ruler gates.
    const firstOut = bodyFirst ? "Mars (a physical response)" : wordsFirst ? "Mercury (the words)" : "Mercury and Mars together";
    const moonRegLine = moonSignEarly === "Sagittarius" && moonHouseHere === 2
      ? `His reset comes through the Moon: body steadiness first, then humor, movement, honesty, and a wider frame.`
      : moonHouseHere === 2
      ? `The Moon in the 2nd house regulates through body safety: steadiness, food, water, and enough physical calm for the feeling to come down.`
      : moonTiming === "belonging"
      ? `The Moon in ${moonSignEarly} in the 11th settles only when ${name} feels emotionally safe and still included.`
      : moonTiming === "delayed" || moonTiming === "private"
      ? `The Moon in ${moonSignEarly} resets later, privately, on its own timeline.`
      : moonTiming === "in-the-moment"
      ? `The Moon in ${moonSignEarly} can reset in the room itself.`
      : `The Moon in ${moonSignEarly} resets on its own rhythm after the moment.`;
    const lateLine = mercSatReceptionLocal
      ? `What shows up late: The Mercury/Saturn loop keeps reviewing the answer after the moment. That is the "I should have said…" or "was that accurate enough?" replay. What regulates late: ${moonRegLine}`
      : `What shows up late: The processing loop keeps reviewing the answer after the moment ("I should have said…" or "was that accurate enough?"). What regulates late: ${moonRegLine}`;
    const realTimeOutput = {
      comesOut: `What exits first is ${firstOut}. ${bodyFirst ? `A physical reaction or shift in tone hits the room before any sentence forms.` : wordsFirst ? `A sentence reaches the room before the body has caught up to it.` : `Speech and reaction arrive together.`} Mercury then delivers the words, shaped by the ${mercuryHouse ? `${ord(mercuryHouse)}-house` : "Mercury"} medium${mercTiming === "delayed" ? " (output is partial or arrives later than the understanding)" : mercTiming === "strained" ? " (output has to be worked through the body before it lands)" : ""}.`,
      blocked: p.chartRuler
          ? marsSign === "Aries" && mercurySign === "Pisces"
            ? `What gets blocked is the slower, more private Mercury-in-Pisces explanation. Mars in Aries may act first, while Mercury is still translating the feeling into language.`
            : `What gets blocked is the answer that feels too expected, too emotionally blurred, or not accurate enough to stand behind. Mercury wants the answer to be true to ${name}'s own thinking, and ${p.chartRuler.rulerName} in ${p.chartRuler.rulerSign} checks whether it is precise enough to release. The full version is held back until it clears that check.`
        : `What gets blocked is the part of the response that has not finished forming; the system will not release it half-formed.`,
      late: lateLine,
      othersExperience: `What others experience is the ${firstOut} version, not the whole signal. They see the first layer and do not see the second voice arriving offline, which is why their read of the moment can be very different from ${name}'s.`,
    };

    // HUMAN TRANSLATION — kept consistent: understanding ≠ expression ≠
    // reaction ≠ regulation. Each described as its own job.
    const isParenting = phase === "child";
    const humanTranslation = {
      looksLike: bodyFirst
        ? `${name} can react physically (walking out, going silent, snapping, a posture shift) before ${G.subj} can explain why. The explanation only arrives later.`
        : wordsFirst
        ? `${name} can sound articulate and "fine" in the moment and then notice a physical drop (tiredness, irritability, going quiet) hours later, when the body finally registers what was said.`
        : `${name} can say and do the appropriate thing in the moment and still be carrying the unprocessed version of it well after the moment is over.`,
      actuallyIs: `Understanding, expression, reaction, and regulation are four different jobs on four different clocks. ${bodyFirst ? `Here, Mars (body) arrives before Mercury (words).` : wordsFirst ? `Here, Mercury (words) arrives before Mars (body).` : `Here, Mercury and Mars arrive together.`} ${moonTiming === "delayed" || moonTiming === "private" ? `The Moon does not regulate in the room; reset is a separate, later step.` : `The Moon regulates after, not during.`}`,
      whatHelps: isParenting
        ? `${bodyFirst ? `Let ${name} have the body-reset first (movement, water, low stimulation), then ask for the words. Asking for the explanation before the body is reset will stall.` : wordsFirst ? `Do not assume ${name}'s articulate in-the-moment answer is the whole story. Check back in once the body has had time to catch up; that is when the real version arrives.` : `Adults should create the pause for ${name} instead of demanding ${name} create it under pressure. Say, "You don't have to answer perfectly right now. Think it through and come back." That protects the ${mercSatReceptionLocal ? "Mercury/Saturn loop" : "processing loop"} from turning into self-criticism.`} Regulation timing is set by the Moon, not by the conversation; honor it${moonTiming === "belonging" ? ` — and remember the 11th-house Moon needs to feel still included before it can fully reset` : ""}.`
        : `${bodyFirst ? `Reset the body before retrying the words. The explanation will not form while the body is still activated.` : wordsFirst ? `Treat the first articulate answer as a draft, not the final. Check back with the body an hour or a day later; that is where the rest of the signal lives.` : `Build a pause in on purpose. The whole signal needs more than the moment is giving it.`} Regulation timing is set by the Moon, not by the room.`,
    };

    if (signals.length >= 2 && mediums.length >= 1) {
      planetInteraction = { signals, mediums, timingCollision: { comparison, mismatch }, realTimeOutput, humanTranslation };
    }
  }


  // Themes picked (for transparency)
  const themesPicked = [
    "developmental anchor",
    p.chartRuler ? "chart ruler" : null,
    sunSign ? "sun core" : null,
    bridge ? `bridge: ${bridge.placements.join(" + ")}` : null,
    chainOfCommand?.mutualReception ? "mutual reception" : null,
    chainOfCommand?.loop ? "dispositor loop" : null,
    chainOfCommand?.finalDispositor ? `final dispositor: ${chainOfCommand.finalDispositor.planet}` : null,
    tightAspects.length ? `${tightAspects.length} tight aspect(s)` : null,
    p.cloakingNote ? "12th-house cloaking" : null,
    p.masterySpot.saturn ? "saturn pattern" : null,
    p.masterySpot.chiron ? "chiron pattern" : null,
  ].filter(Boolean) as string[];

  const composed: ComposedPortrait = {
    lifeStageChapter,
    corePortrait,
    systemMechanism,
    realTimeSequence,
    planetInteraction,
    bridge,
    stageAsk,
    misreads: misreads.slice(0, 3),
    whatHelps,
    chartStory,
    chainOfCommand,
    themesPicked,
  };

  // GLOBAL VALIDATION LAYER — runs the chart-signature detector then the
  // full A–K check + sentence sanitizer with diff log.
  try {
    const signature = detectChartSignature(chart, tightAspects as any);
    const planetsForCtx = (chart?.planets as any) ?? {};
    // Name-safe singular fallback: if the caller did NOT pass an explicit
    // profile with pronouns, we deliberately omit `profile` from the validator
    // context. This prevents the sanitizer from collapsing 2nd+ name mentions
    // into "they/them/their" (which produces "they is", "they does", etc.).
    // When pronouns ARE supplied, we honor them and pass the full first name
    // (and full name for fullName→firstName collapse).
    const hasRealProfile = !!profile?.pronouns?.subject;
    const firstName = hasRealProfile
      ? ((profile!.firstName ?? name ?? "").trim().split(/\s+/)[0] || name)
      : undefined;
    const ctx = {
      saturnCentral: signature.saturnCentral,
      chironCentral: signature.chironCentral,
      ikeAuthorityPattern: signature.ikeAuthorityPattern,
      signature,
      mutualReceptionPair: signature.mutualReceptionPair,
      profile: hasRealProfile && firstName
        ? {
            firstName,
            fullName: profile?.fullName ?? name,
            pronouns: profile!.pronouns!,
            isChild: profile?.isChild ?? (phase === "child"),
          }
        : undefined,
      placements: {
        mercuryHouse: planetsForCtx.Mercury?.house ?? null,
        marsHouse: planetsForCtx.Mars?.house ?? marsHouse,
        moonHouse: planetsForCtx.Moon?.house ?? null,
        mercurySign: planetsForCtx.Mercury?.sign ?? null,
        marsSign: planetsForCtx.Mars?.sign ?? marsSign ?? null,
        moonSign: planetsForCtx.Moon?.sign ?? null,
      },
    };
    composed.validation = validateComposedPortrait(composed, ctx);
    if (typeof console !== "undefined" && !composed.validation.ok) {
      console.warn(`[portraitComposer] validation failed for ${name}:`, composed.validation.violations);
    }
    // FINAL QA PASS — sentence-level sanitizer with diff log.
    const sanitized = sanitizeComposedPortrait(composed, ctx);
    // Preserve original violations; sanitizer attaches diff log.
    sanitized.validation = {
      ...composed.validation,
      sanitizationDiff: sanitized.validation?.sanitizationDiff ?? [],
    };
    return sanitized;
  } catch (e) {
    if (typeof console !== "undefined") console.warn("[portraitComposer] validator error", e);
  }

  return composed;
}
