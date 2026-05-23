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
  Cancer: "they feel the emotional weather of a room before anything else",
  Leo: "they need to be seen as themselves, not as a role they're playing",
  Virgo: "they need things to actually work, and they'll notice what's off",
  Libra: "they're tracking fairness and the connection in the room at all times",
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
  Libra: "settles in a calm room where fairness has been named out loud",
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
  Libra: "a calm room and fairness named out loud",
  Scorpio: "privacy, one-on-one trust, and the real story",
  Sagittarius: "honesty, room to roam, and the big-picture why",
  Capricorn: "clear structure and being treated as capable",
  Aquarius: "being treated as their own person, logic over guilt",
  Pisces: "low stimulation, soft sensory input, and rest",
};

const MARS_RESET: Record<string, string> = {
  Aries: "discharge first (run, jump, hit something safe), talk second",
  Taurus: "a physical anchor, food, blanket, ground — pace down",
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
    actuallyIs: "they think by talking, so the conversation is the thinking — not a report on it",
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
    looksLike: "changing their answer based on who's in the room, or stalling on a decision",
    actuallyIs: "they're tracking how the choice will land on every person before they commit to one",
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
  oneSentence: string;
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

  // ── 1. ONE-SENTENCE PORTRAIT ────────────────────────────────────────────────
  // Concrete, behavioral, about WHO this person is. No "learning / regulates"
  // teacher framing. No abstract verbs. If you read it out loud, it should
  // sound like a real person you know.
  const SUN_PERSON: Record<string, string> = {
    Aries:       `${name} is built to move first and ask questions later. Fast starts, hot reactions, and the energy is gone almost as soon as it lands.`,
    Taurus:      `${name} moves at their own pace and will not be rushed. Once they have planted in a thing, getting them to switch course takes time and a real reason.`,
    Gemini:      `${name} thinks by talking and skips between angles, often before anyone realizes they have started. They need to say it out loud to know what they actually believe.`,
    Cancer:      `${name} reads the mood of a room before anyone speaks. What they pick up usually turns out to be accurate, even when no one else sees it.`,
    Leo:         `${name} runs on warmth. Sincere attention and they open up; a flat or dismissive response and they go quiet in a hurt way, not a calm one.`,
    Virgo:       `${name} can see what is not working in almost any situation, and they have a hard time relaxing until the small thing actually gets fixed.`,
    Libra:       `${name} is constantly tracking how a choice will land on every person in the room. What looks like stalling is usually that tracking happening in the background.`,
    Scorpio:     `${name} watches a situation before they speak, gives you the edited version first, and only shows the real version once they trust the room.`,
    Sagittarius: `${name} needs the bigger reason or the rule does not mean anything to them. They will leave a thing they don't believe in faster than they will fake interest in it.`,
    Capricorn:   `${name} carries weight other people don't see and takes the long view by default. They would rather do something alone than watch it be done badly.`,
    Aquarius:    `${name} questions the rule itself before they follow it. They prefer their own method, and they pull back when they feel pushed into a box that doesn't fit.`,
    Pisces:      `${name} absorbs the feelings of a room without meaning to. They need real time alone to figure out which of those feelings are actually theirs.`,
  };
  const houseHints: Record<number, string> = {
    1: "and most of this lives right on the surface, in how they show up the second they walk in",
    2: "and a lot of it runs through what they own, what they're worth, and what feels safe in the body",
    3: "and most of this comes out through how they talk and the small daily back-and-forth",
    4: "and a lot of it stays in the home and inside the family, not out in public",
    5: "and most of this comes out through play, creating, performing, or the kids and crushes in their life",
    6: "and most of this gets worked out through daily routine, work, and the body",
    7: "and a lot of it only shows up in close one-on-one relationships, not on their own",
    8: "and a lot of it lives in the private, intense, sharing-with-one-person layer of life",
    9: "and a lot of it pushes them toward travel, big ideas, and chasing what they believe in",
    10: "and most of it shows up in their public role and what they end up being known for",
    11: "and a lot of it lives in their friend group and the future they're trying to build",
    12: "and a lot of it happens behind a curtain — they need time alone before it can come out",
  };
  const baseSentence =
    (sunSign && SUN_PERSON[sunSign]) ||
    `${name} is a specific person, not a chart of placements, and what follows is the shape of how they actually move.`;
  const houseTail = sunHouse && houseHints[sunHouse] ? ` ${houseHints[sunHouse].replace(/^and /, "And ")}.` : "";
  const oneSentence = `${baseSentence}${houseTail}`;

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
  let trigger: { label: string; detail: string };
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
      "Sun|Mercury": `when you ask ${name} a direct question in the moment, the answer may not show up right away — not because ${name} is avoiding it, but because the part that feels and the part that thinks need a beat to catch up to each other. Giving ${name} a little space works because it lets those two parts meet.`,
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

  // Themes picked (for transparency)
  const themesPicked = [
    "developmental anchor",
    p.chartRuler ? "chart ruler" : null,
    sunSign ? "sun core" : null,
    bridge ? `bridge: ${bridge.placements.join(" + ")}` : null,
    tightAspects.length ? `${tightAspects.length} tight aspect(s)` : null,
    p.cloakingNote ? "12th-house cloaking" : null,
    p.masterySpot.saturn ? "saturn pattern" : null,
    p.masterySpot.chiron ? "chiron pattern" : null,
  ].filter(Boolean) as string[];

  return {
    oneSentence,
    systemMechanism,
    bridge,
    stageAsk,
    misreads: misreads.slice(0, 3),
    whatHelps,
    chartStory,
    themesPicked,
  };
}
