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

  const SUN_CORE_MOTIVE: Record<string, string> = {
    Aries: "make a clean move before doubt takes over",
    Taurus: "stay steady long enough to know what is actually worth keeping",
    Gemini: "turn experience into words, questions, and connections",
    Cancer: "protect what feels emotionally real without becoming responsible for everything",
    Leo: "be visibly themselves and receive warmth without performing for it",
    Virgo: "make life work in a concrete way without shrinking into constant correction",
    Libra: "make a clean choice that stays fair without erasing their own preference",
    Scorpio: "trust the real story without having to control how much everyone else sees",
    Sagittarius: "live by a truth big enough to keep moving toward",
    Capricorn: "build a life that proves capable because it is actually theirs",
    Aquarius: "keep their own signal clear while still staying connected",
    Pisces: "stay open-hearted without absorbing more than their system can sort",
  };

  const SUN_HOUSE_TASK: Record<number, string> = {
    1: "That work has to become visible as a real preference, a pace, a yes or no, and a way of moving through the day.",
    2: "That work is tested through body safety, money, appetite, ownership, and what they decide is worth protecting.",
    3: "That work comes through daily language, school, siblings, texts, questions, and the small exchanges that shape a day.",
    4: "That work gets most honest at home, where family patterns and private needs cannot be hidden for long.",
    5: "That work comes alive through play, performance, romance, creativity, and the right to enjoy what they make.",
    6: "That work is practiced through routine, health, tasks, skill, and the small things that either regulate or irritate the body.",
    7: "That work gets revealed through one-on-one bonds, where another person's response becomes a mirror and a test.",
    8: "That work comes through trust, shared resources, grief, intimacy, and the private conversations that change a person.",
    9: "That work grows through truth, study, travel, faith, teaching, and the search for a larger frame.",
    10: "That work becomes public through vocation, reputation, responsibility, and the name they are willing to put on their work.",
    11: "That work moves through friends, groups, causes, and the future they are trying to build with others.",
    12: "That work happens quietly through solitude, dreams, retreat, and the parts of life that need privacy before they can speak.",
  };

  const RULER_SIGN_NEED: Record<string, string> = {
    Aries: "freedom to act before the moment goes cold",
    Taurus: "proof that the body can trust the pace",
    Gemini: "language, movement, and more than one angle",
    Cancer: "emotional safety before action",
    Leo: "warmth, pride, and a reason to show up wholeheartedly",
    Virgo: "usefulness, precision, and something practical to improve",
    Libra: "fairness, proportion, and a choice that can stand up in daylight",
    Scorpio: "truth, privacy, and no fake answer",
    Sagittarius: "truth, room, and a bigger reason",
    Capricorn: "structure, competence, and respect for the long game",
    Aquarius: "logic, distance from pressure, and permission to do it differently",
    Pisces: "quiet, imagination, and time to separate their feeling from the atmosphere",
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

  const supportBySun: Record<string, string> = {
    Libra: `Do not push ${name} to decide faster. Name the actual choices, name what would be fair, then ask which option still feels honest when ${name} is allowed to want something too.`,
    Aries: `Do not turn every impulse into a lecture. Give ${name} a safe first move, then help ${name} look back and choose the next move with more aim.`,
    Taurus: `Do not rush the shift. Give ${name} a concrete reason, a body anchor, and enough time for the new choice to feel safe.`,
    Gemini: `Do not demand one final answer too early. Let ${name} talk through the options, then help ${name} pick the one that still makes sense after the talking is done.`,
    Cancer: `Do not dismiss the feeling as too much. Name the emotional stake first, then help ${name} choose without carrying everyone else's mood.`,
    Leo: `Do not shame the need to be seen. Give warm attention first, then help ${name} choose from pride rather than performance.`,
    Virgo: `Do not make perfection the price of moving. Name the next useful step, then let good enough become real progress.`,
    Scorpio: `Do not force disclosure. Build trust, ask the real question quietly, and let ${name} choose what is safe to share.`,
    Sagittarius: `Do not trap ${name} in small rules with no reason. Give the larger why, then ask what truth ${name} is willing to act on.`,
    Capricorn: `Do not confuse caution with coldness. Give ${name} responsibility that is clear, earned, and not loaded with extra judgment.`,
    Aquarius: `Do not use guilt to create closeness. Give ${name} space to think, then invite connection without asking them to copy the group.`,
    Pisces: `Do not add more noise when ${name} is flooded. Lower the input, separate what belongs to ${name}, and choose after the feeling has drained.`,
  };

  const moonSignEarly = (chart?.planets?.Moon as any)?.sign as string | undefined;
  const liveEdge = tightAspects.find(a => a.quality === "hard" && a.orb <= 2.0);
  const identityWork = sunSign ? SUN_CORE_MOTIVE[sunSign] : null;
  const houseTask = sunHouse ? SUN_HOUSE_TASK[sunHouse] : null;

  const portraitParts: string[] = [];
  if (identityWork) {
    portraitParts.push(`${name}'s core work is to ${identityWork}. ${houseTask ?? "This shows up through the ordinary choices where identity has to become behavior."}`);
  } else {
    portraitParts.push(`${name}'s chart shows a specific inner rhythm, and the rest of this portrait explains how that rhythm becomes behavior.`);
  }

  if (p.chartRuler) {
    const rulerNeed = RULER_SIGN_NEED[p.chartRuler.rulerSign] || RULER_TEXTURE[p.chartRuler.rulerSign] || "a very specific kind of permission";
    const rulerArena = p.chartRuler.rulerHouse ? HOUSE_ARENA[p.chartRuler.rulerHouse] : null;
    portraitParts.push(
      `${p.chartRuler.rulerName} in ${p.chartRuler.rulerSign} steers the system, so ${name} cannot simply perform the Sun sign on command. The deeper engine needs ${rulerNeed}` +
        (rulerArena ? `, especially around ${rulerArena}.` : ".")
    );
  }

  if (moonSignEarly && MOON_NEED[moonSignEarly]) {
    portraitParts.push(`The Moon adds the regulation key: ${MOON_NEED[moonSignEarly]}. If that need is ignored, the choice may look mental, but the body is still trying to get safe.`);
  }

  if (liveEdge) {
    const involvesChiron = liveEdge.a === "Chiron" || liveEdge.b === "Chiron";
    const involvesSun = liveEdge.a === "Sun" || liveEdge.b === "Sun";
    if (involvesSun && involvesChiron) {
      portraitParts.push(`The tender wire is ${liveEdge.a} ${liveEdge.aspect} ${liveEdge.b} (${liveEdge.orb.toFixed(1)}°): ${name} is practicing how to have a clear want without turning that want into a trial about whether it is selfish, too much, or allowed.`);
    } else {
      portraitParts.push(`The tightest pressure point is ${liveEdge.a} ${liveEdge.aspect} ${liveEdge.b} (${liveEdge.orb.toFixed(1)}°), so this pattern gets louder under stress: ${liveEdge.line}`);
    }
  }

  portraitParts.push(sunSign && supportBySun[sunSign] ? supportBySun[sunSign] : `The landing is practical: name what is happening, reduce pressure, and help ${name} choose the next honest step instead of asking for a perfect explanation.`);

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
  const mercurySign =
    p.cognitiveProfile?.mercurySign ||
    (chart?.planets?.Mercury as any)?.sign ||
    undefined;
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
