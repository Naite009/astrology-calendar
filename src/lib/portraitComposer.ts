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
    looksLike: "defiance, impatience, or being rude",
    actuallyIs: "a need to move first and not feel controlled",
  },
  Taurus: {
    looksLike: "stubbornness or being slow",
    actuallyIs: "a need to feel safe in the body before changing course",
  },
  Gemini: {
    looksLike: "not listening, talking too much, or being scattered",
    actuallyIs: "a brain that processes by talking out loud and sampling everything",
  },
  Cancer: {
    looksLike: "moodiness or being too sensitive",
    actuallyIs: "an accurate read on the emotional weather in the room",
  },
  Leo: {
    looksLike: "showing off or needing attention",
    actuallyIs: "checking that they are still loved when they take up space",
  },
  Virgo: {
    looksLike: "criticism, fussiness, or anxiety",
    actuallyIs: "trying to make the situation actually work",
  },
  Libra: {
    looksLike: "people-pleasing or being indecisive",
    actuallyIs: "tracking fairness and trying not to break the connection",
  },
  Scorpio: {
    looksLike: "shutting down, being secretive, or intense",
    actuallyIs: "checking whether it's safe to show the real thing",
  },
  Sagittarius: {
    looksLike: "being blunt, restless, or not taking it seriously",
    actuallyIs: "needing the bigger why before they'll commit",
  },
  Capricorn: {
    looksLike: "being cold, controlling, or too serious",
    actuallyIs: "trying to make the plan real and not waste effort",
  },
  Aquarius: {
    looksLike: "being detached, contrarian, or weird",
    actuallyIs: "needing to be met as their own person, not a role",
  },
  Pisces: {
    looksLike: "spacing out, being overwhelmed, or avoiding",
    actuallyIs: "absorbing more input than the room can see",
  },
};

const SATURN_TENDER_MISREAD: Record<string, string> = {
  // When Saturn is a dominant theme, the "lazy / not trying" misread is common.
  default: "what looks like avoidance or not trying is often fear of doing it wrong in front of someone",
};

const CHIRON_TENDER_MISREAD =
  "what looks like over-reaction to a small thing is usually an old wound getting touched, not the current moment";

const MOON12_MISREAD =
  "what looks like 'I'm fine' is often the feeling going underground because the room didn't feel safe to show it";

// ── Composer types ───────────────────────────────────────────────────────────

export interface ComposedPortrait {
  oneSentence: string;
  systemMechanism: {
    driver: { label: string; detail: string };       // what runs the system
    translator: { label: string; detail: string };   // how it gets expressed
    trigger: { label: string; detail: string };      // what breaks it
    reaction: string;                                 // what the system does
    synthesis: string;                                // the one-paragraph "working system" sentence
  };
  bridge?: {
    // Plain-language paragraph connecting 2+ placements to a real behavior.
    paragraph: string;
    // The placements it linked, for transparency.
    placements: string[];
  };
  stageAsk: {
    title: string;
    body: string;
  };
  misreads: Array<{ looksLike: string; actuallyIs: string }>;
  whatHelps: string[];
  chartStory: string;
  themesPicked: string[]; // for debugging / display
}

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

  // 1. THESIS: "At this stage, X is learning ___, but they regulate best through ___."
  const learning =
    (sunSign && SUN_LEARNING[sunSign]) ||
    "what this season is actually asking of them";

  // Regulation source: prefer explicit Mars house discharge, then Moon-sign safety,
  // then 12th-house cloaking note.
  // moon sign is read later from `chart` when computing the bridge.
  // We derive moon-sign regulation from Moon hard aspects' presence; otherwise fall back to Mars sign.
  const marsSign = p.energyDischarge?.marsSign;
  const regulationParts: string[] = [];
  if (marsSign && MARS_RESET[marsSign]) regulationParts.push(MARS_RESET[marsSign]);
  // Pull a moon-sign safety hint from the cognitive profile if not available; otherwise generic.
  if (regulationParts.length === 0) regulationParts.push("steady rhythm, honest tone, and a body that has been moved");
  const regulation = regulationParts[0];

  const stageWord =
    phase === "child" ? "this stage of childhood"
    : phase === "elder" ? "this eldering chapter"
    : "this chapter of adulthood";

  const oneSentence = `At ${stageWord}, ${name} is learning ${learning}, but regulates best through ${regulation}.`;

  // 1b. SYSTEM MECHANISM — driver / translator / trigger / reaction.
  // Show how placements interact, not as separate traits.
  // Driver: chart ruler (what runs the system). Fallback: Sun.
  // Translator: Sun-sign expression OR Rising (how it gets out into the world).
  // Trigger: tightest hard aspect, else pressure signature, else Moon hard aspect,
  //          else Saturn placement.
  // Reaction: Mars-sign discharge / pressure consequence / Moon hard-aspect note.
  const driver = p.chartRuler
    ? {
        label: `${p.chartRuler.rulerName} in ${p.chartRuler.rulerSign}` +
          (p.chartRuler.rulerHouse ? ` (${ord(p.chartRuler.rulerHouse)} house)` : ""),
        detail: `the chart ruler, the engine running underneath everything ${name} does`,
      }
    : sunSign
    ? { label: `${sunSign} Sun`, detail: `the core motive ${name} is here to practice` }
    : { label: "their core engine", detail: "the part of them that runs the show" };

  const translator = sunSign
    ? {
        label: `${sunSign} Sun` + (p.identityInvitation.sun?.house ? ` in the ${ord(p.identityInvitation.sun.house)} house` : ""),
        detail: `how that engine actually comes out in the world (${SUN_LEARNING[sunSign] ?? "their way of being seen"})`,
      }
    : p.chartRuler
    ? {
        label: `${p.chartRuler.ascSign} Rising`,
        detail: `the doorway the engine has to walk through to reach other people`,
      }
    : { label: "their outward style", detail: "the way the engine reaches other people" };

  // Pick the strongest stress trigger
  const tightHard = tightAspects.find(a => a.quality === "hard");
  const tightMoonHard = moonAspectsHard[0];
  let trigger: { label: string; detail: string };
  let reaction: string;
  if (p.pressureSignature) {
    trigger = {
      label: `${p.pressureSignature.body} under ${p.pressureSignature.trigger} pressure`,
      detail: `the engine is in a place that needs ${p.pressureSignature.needLabel.toLowerCase()}`,
    };
    reaction = p.pressureSignature.consequence;
  } else if (tightHard) {
    trigger = {
      label: `${tightHard.a} ${tightHard.aspect} ${tightHard.b} (${tightHard.orb.toFixed(1)}°)`,
      detail: `the two strongest internal voices pulling against each other`,
    };
    reaction = tightHard.line || `${name}'s system locks up or over-corrects until one side wins`;
  } else if (tightMoonHard) {
    trigger = {
      label: `Moon ${tightMoonHard.aspect} ${tightMoonHard.to} (${tightMoonHard.orb.toFixed(1)}°)`,
      detail: `the safety system has a tender wire on it`,
    };
    reaction = marsSign && MARS_RESET[marsSign]
      ? `the body needs to discharge before anything else lands (${MARS_RESET[marsSign]})`
      : `the feeling goes underground until the room feels safe again`;
  } else if (p.masterySpot.saturn) {
    trigger = {
      label: `Saturn in ${p.masterySpot.saturn.sign}` + (p.masterySpot.saturn.house ? ` (${ord(p.masterySpot.saturn.house)} house)` : ""),
      detail: `the area where ${name} fears doing it wrong in front of someone`,
    };
    reaction = `${name} either freezes, over-prepares, or quietly opts out before being judged`;
  } else {
    trigger = { label: "stress in their key area", detail: "what knocks the system off balance" };
    reaction = marsSign && MARS_RESET[marsSign]
      ? `the body needs to reset (${MARS_RESET[marsSign]})`
      : `the system goes quiet until it can find ground again`;
  }

  const synthesis =
    `${name} is driven by ${driver.label}, ` +
    `but expresses through ${translator.label}, ` +
    `so when ${trigger.label} shows up, the system reacts by ${reaction}.`;

  const systemMechanism = { driver, translator, trigger, reaction, synthesis };

  // 2. STAGE ASK
  const stageAsk = {
    title: p.developmentalAnchor.stage,
    body:
      phase === "child"
        ? `What the adults around ${name} need to understand right now: ${p.developmentalAnchor.body}`
        : phase === "elder"
        ? p.developmentalAnchor.body
        : `This is not a generic personality read. This is the developmental cycle ${name} is actually inside: ${p.developmentalAnchor.body}`,
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
