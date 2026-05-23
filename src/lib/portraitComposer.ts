// Portrait Composer
// Reads the deterministic ChildPortrait data and selects the 3–5 most important
// themes for this specific person at this specific life stage. Produces the
// 6-section output structure the UI renders.
//
// NO new astrology math here — all numbers come from buildChildPortrait().
// This file is presentation-layer prioritization only.

import type { ChildPortrait } from "./childPortrait";
import type { NatalChart } from "@/hooks/useNatalChart";

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
  Aries: "discharges fast and physical, so the energy needs an outlet before talking",
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
  Aries: "discharge first (run, jump, hit something safe), talk second",
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
    actuallyIs: "they're taking in more signal than the room is showing, and it's hard to sort it in the moment",
  },
};

const SATURN_TENDER_MISREAD: Record<string, string> = {
  default: "what looks like putting it off or not caring is usually fear of doing it wrong while someone is watching",
};

const CHIRON_TENDER_MISREAD =
  "what looks like a big reaction to a small thing is usually an older sore spot getting touched, not the moment itself";

const MOON12_MISREAD =
  "what looks like 'I'm fine' is the feeling going underground because the room didn't feel safe enough to put it down";

// ── Composer types ───────────────────────────────────────────────────────────

export interface ComposedPortrait {
  corePortrait: string;
  systemMechanism: {
    driver: { label: string; detail: string };
    translator: { label: string; detail: string };
    trigger: { label: string; detail: string; derivation: string };
    reaction: string;
    synthesis: string;
  };
  bridge?: {
    paragraph: string;
    placements: string[];
  };
  stageAsk: { title: string; body: string };
  misreads: Array<{ looksLike: string; actuallyIs: string }>;
  whatHelps: string[];
  chartStory: string;
  // NEW: Dispositor chain walked from chart ruler to its final boss.
  chainOfCommand?: {
    steps: Array<{ planet: string; sign: string; house: number | null; reason: string }>;
    finalDispositor?: { planet: string; sign: string; house: number | null };
    loop?: string[];                  // names of planets in the cycle
    mutualReception?: { a: string; b: string; aSign: string; bSign: string };
    narrative: string;                // full plain-language explanation
  };
  themesPicked: string[];
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

// ── Composer ─────────────────────────────────────────────────────────────────
export function composePortrait(p: ChildPortrait, chart?: NatalChart): ComposedPortrait {
  const name = p.name;
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
    Pisces: "absorbs the mood of whoever is speaking and starts feeling what they feel, which blurs where their own position even was",
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
    5: "play, creative work, romance, and their kids if they have them",
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

  // The pace-based fix, per Sun sign. Not "change who you are" but "buy the
  // seconds the second voice needs to arrive on time."
  const PACE_FIX: Record<string, string> = {
    Aries: `The move is to slow the first sentence by one breath. "Let me think about that for a second" gives the considered answer time to load before the impulsive one wins.`,
    Taurus: `The move is to name the stall instead of disappearing into it. "I need a minute on that" buys the body the time it actually needs without it reading as refusal.`,
    Gemini: `The move is to pick one position out loud and label it as the working answer, so the other two get held for later instead of all three getting argued at once.`,
    Cancer: `The move is to name the feeling first, then the position. "That landed as ___, and what I actually think is ___" stops the protective version from becoming the only version.`,
    Leo: `The move is to ask if their take has been received before adjusting it. "Does that land?" buys a second to see if the smaller version was even needed.`,
    Virgo: `The move is to let the imperfect first answer stand and add to it instead of fixing it. The correction can come as a second sentence, it does not need to overwrite the first.`,
    Libra: `The move is to buy 20 to 30 seconds before answering. "Let me sit with that" or "I want to come back to that" gives the scale time to finish weighing, which is where the real answer lives.`,
    Scorpio: `The move is to say the smaller true thing rather than the smaller safe thing. The full version can wait, but the partial version should not be a decoy.`,
    Sagittarius: `The move is to add the context before the verdict instead of after. Leading with the reason gives the honest answer somewhere to land that is not a grenade.`,
    Capricorn: `The move is to give the unfiltered reaction one sentence of air before the composed one takes over. The composed answer is fine, but it should not be the only one in the room.`,
    Aquarius: `The move is to name that the unconventional take exists, even if not defending it fully in the moment. "There is a different way to look at this, I want to think it through" keeps the signal alive.`,
    Pisces: `The move is to separate whose feeling it is before answering. One internal check, "is this mine or theirs," then respond from what is actually yours.`,
  };

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

  // ── Life-stage anchor: name the chapter that frames the whole portrait.
  const lifeStageOpener = p.developmentalAnchor?.stage
    ? `The life-stage chapter ${name} is actually inside right now is ${p.developmentalAnchor.stage.toLowerCase()}, and the whole chart bends around that chapter.`
    : "";

  const portraitParts: string[] = [];
  if (lifeStageOpener) portraitParts.push(lifeStageOpener);

  // 1. The live mechanic. Why it feels involuntary.
  if (sunSign && SUN_LIVE[sunSign]) {
    portraitParts.push(`In live moments, ${name} ${SUN_LIVE[sunSign]}. That happens before thinking catches up, which is why it does not feel like a choice — it feels like the only available response.`);
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
    portraitParts.push(`And Sun ${sunChiron.aspect} Chiron (${sunChiron.orb.toFixed(1)}°) runs a quiet second-guess under all of it — "is what I am about to say even allowed?" — so the system tightens at the exact moment it would otherwise open. That is why "whether the want is even allowed" lands harder than it should: it is a real wire in the chart, not a mood.`);
  } else if (liveEdge && !rulerHardCheck) {
    // Fallback: any other live edge worth naming.
    portraitParts.push(`The tightest pressure point is ${liveEdge.a} ${liveEdge.aspect} ${liveEdge.b} (${liveEdge.orb.toFixed(1)}°), which is the version of this pattern that gets loud under stress: ${liveEdge.line}`);
  }

  // 6. SYNTHESIS — the "what is actually happening" stack, in one tight beat.
  // This is the part the user asked for: a compressed list of every active wire,
  // in plain language, so the whole mechanism is visible at once.
  const stackLines: string[] = [];
  if (sunSign) stackLines.push(`${sunSign} Sun${sunHouse ? ` in the ${ord(sunHouse)}` : ""} is tracking the room and ${name} at the same time.`);
  if (p.chartRuler) stackLines.push(`${p.chartRuler.rulerName} in ${p.chartRuler.rulerSign} wants the clean, true version of the answer.`);
  if (rulerHardCheck && rulerCheckOther) stackLines.push(`${rulerCheckOther} hard-angles the ruler, so the answer has to clear a cost check first.`);
  if (mercuryHouse && MERCURY_HOUSE_DELAY[mercuryHouse] && [4,6,8,9,12].includes(mercuryHouse)) {
    stackLines.push(`${mercurySign ? `${mercurySign} ` : ""}Mercury in the ${ord(mercuryHouse)} delays the words — they form underneath first.`);
  }
  if (marsSign && (marsSign === "Scorpio" || marsSign === "Capricorn" || marsSign === "Aries" || marsSign === "Libra")) {
    stackLines.push(`Mars in ${marsSign} raises the pressure when it matters, instead of dropping it.`);
  }
  if (sunChiron) stackLines.push(`Sun ${sunChiron.aspect} Chiron asks whether the want is even allowed.`);
  if (stackLines.length >= 3) {
    portraitParts.push(
      `So the actual pattern in real life is not "people pleasing" or "stalling." It is this: ${stackLines.join(" ")} That is too many chart functions trying to speak through one moment — which is why the right words usually arrive after the conversation is over, not during it. The frustration is not lack of thought. It is a processing-timing issue.`,
    );
  }

  // 7. Moon regulation layer (after the mechanism, before the fix).
  if (moonSignEarly && MOON_NEED[moonSignEarly]) {
    portraitParts.push(`The Moon adds the regulation piece: ${MOON_NEED[moonSignEarly]}. When that need is missing, every layer above gets louder and none of them land cleanly.`);
  }

  // 8. The pace fix. Timing change, not personality change.
  if (sunSign && PACE_FIX[sunSign]) {
    portraitParts.push(PACE_FIX[sunSign]);
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
  const tightHard = tightAspects.find(a => a.quality === "hard");
  const tightMoonHard = moonAspectsHard[0];
  let trigger: { label: string; detail: string; derivation: string };
  let reaction: string;
  let bridgeWhy: string; // why this trigger relates to THIS engine
  if (p.pressureSignature) {
    trigger = {
      label: `${p.pressureSignature.body} sitting in the ${p.pressureSignature.trigger}`,
      detail: p.pressureSignature.need,
      derivation:
        `Picked because ${p.pressureSignature.body} (one of the engine planets) is sitting in ${p.pressureSignature.trigger}, ` +
        `which is the strongest pressure pattern in the chart. Pressure signatures override aspects and Saturn here ` +
        `because they describe where the engine itself is under containment, not just where it meets resistance.`,
    };
    reaction = p.pressureSignature.consequence;
    bridgeWhy =
      p.pressureSignature.trigger === "12th house"
        ? `the same engine is sitting behind a curtain, so it has to be processed privately before it can come out`
        : p.pressureSignature.trigger === "Scorpio"
        ? `the same engine runs deep and won't let things stay surface, which means small pressures stack up internally`
        : `the same engine is wired straight into Pluto, so ordinary friction lands with extra weight`;
  } else if (tightHard) {
    trigger = {
      label: `${tightHard.a} ${tightHard.aspect} ${tightHard.b} (${tightHard.orb.toFixed(1)}°)`,
      detail: `two internal voices that pull against each other in real time`,
      derivation:
        `Picked because this is the tightest hard aspect in the chart (orb ${tightHard.orb.toFixed(1)}°, under 2.5°), ` +
        `which means it's loud and active in daily life. Tight squares, oppositions, and conjunctions are felt as ` +
        `internal arguments that don't resolve, so they show up as repeated friction points.`,
    };
    reaction = tightHard.line || `${name} locks up or over-corrects until one side wins`;
    bridgeWhy = `one of those two voices is the engine itself, so the tug shows up every time ${name} tries to move`;
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
    const top = tightAspects.slice(0, 2);
    storyParts.push(
      `The tightest active conversations in the chart are: ` +
        top.map(a => `${a.a} ${a.aspect} ${a.b} (${a.orb.toFixed(1)}°)`).join("; ") +
        `. Those are the loudest internal dynamics.`
    );
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

    // Push step 0 (chart ruler itself).
    steps.push({
      planet: currentName!,
      sign: currentSign!,
      house: currentHouse,
      reason: `Chart ruler. This is the planet ${name} reports to before anyone else, because it rules the Rising sign (${p.chartRuler.ascSign}).`,
    });
    seen.set(currentName!, 0);

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
          reason: `Mutual reception with ${currentName}. They host each other's sign, so they trade authority back and forth instead of one being the final boss.`,
        });
        break;
      }

      // Loop detection: we've been here before.
      if (seen.has(nextName)) {
        const startIdx = seen.get(nextName)!;
        loop = steps.slice(startIdx).map(s => s.planet).concat(nextName);
        steps.push({
          planet: nextName, sign: nextPlanet.sign, house: nextHouse,
          reason: `Closes the loop. ${loop.join(" -> ")} all point at each other, so the system has no single final boss; authority circulates.`,
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
      narrative +=
        `${mutualReception.a} and ${mutualReception.b} are in mutual reception (${mutualReception.a} sits in ${mutualReception.aSign}, ` +
        `and ${mutualReception.b} sits in ${mutualReception.bSign}). They both host each other's sign, which means they ` +
        `borrow each other's strength. In real life this looks like ${name} being able to switch between two different ways ` +
        `of operating depending on the situation, without losing themselves in either. Neither one is the boss; they are ` +
        `partners running the show together.`;
    } else if (loop) {
      narrative +=
        `There is no single final boss. ${loop.join(", ")} all point at each other in a loop, so authority circulates ` +
        `between them. In daily life, this means ${name} doesn't have one fixed "true north" inside; the same situation ` +
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

  return {
    corePortrait,
    systemMechanism,
    bridge,
    stageAsk,
    misreads: misreads.slice(0, 3),
    whatHelps,
    chartStory,
    chainOfCommand,
    themesPicked,
  };
}
