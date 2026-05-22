// Portrait Composer
// Reads the deterministic ChildPortrait data and selects the 3–5 most important
// themes for this specific person at this specific life stage. Produces the
// 6-section output structure the UI renders.
//
// NO new astrology math here — all numbers come from buildChildPortrait().
// This file is presentation-layer prioritization only.

import type { ChildPortrait } from "./childPortrait";

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
export function composePortrait(p: ChildPortrait): ComposedPortrait {
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
  const moonSign = p.moonPhaseProfile ? undefined : undefined; // moon sign isn't on portrait directly
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

  // Themes picked (for transparency)
  const themesPicked = [
    "developmental anchor",
    p.chartRuler ? "chart ruler" : null,
    sunSign ? "sun core" : null,
    tightAspects.length ? `${tightAspects.length} tight aspect(s)` : null,
    p.cloakingNote ? "12th-house cloaking" : null,
    p.masterySpot.saturn ? "saturn pattern" : null,
    p.masterySpot.chiron ? "chiron pattern" : null,
  ].filter(Boolean) as string[];

  return {
    oneSentence,
    stageAsk,
    misreads: misreads.slice(0, 3),
    whatHelps,
    chartStory,
    themesPicked,
  };
}
