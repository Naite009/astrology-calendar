// Wave 1: Divine Feminine Bodies personalizer.
// Given the active chart + which body was clicked, returns a 4-part reading:
// placement, tightest aspects, blended reading, and one behavioral action.
// Deterministic — no AI calls, no math tricks; reads stored chart data.

import type { NatalChart } from "@/hooks/useNatalChart";
import {
  houseForLongitude,
  toAbsoluteLongitude,
  ordinal,
  HOUSE_ARENA,
  SIGN_NAMES,
} from "@/lib/houseForLongitude";
import { STANDARD_ASPECTS, getEffectiveOrb } from "@/lib/aspectOrbs";

export type DivineFemBody =
  | "NorthNode"
  | "SouthNode"
  | "Chiron"
  | "Lilith"
  | "Ceres"
  | "Pallas"
  | "Juno"
  | "Vesta";

export interface AspectHit {
  natalBody: string;
  aspect: string;
  orb: number;
  symbol: string;
}

export interface PersonalReading {
  title: string;         // Human title, e.g. "Your North Node"
  placement: string;     // "Scorpio, 1st house — 12°34'"
  aspects: AspectHit[];  // tightest first
  reading: string;       // blended paragraph
  doThis: string;        // one-line action
  missing?: string;      // set when chart data is missing this body
}

// Bodies to scan for aspect contacts (the ones people care about).
const CORE_CONTACTS = [
  "Sun", "Moon", "Ascendant", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
] as const;

const MAJOR_ASPECT_NAMES = ["conjunction", "opposition", "square", "trine", "sextile"];

const angleBetween = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

const findAspects = (
  chart: NatalChart,
  targetAbs: number,
  targetName: string,
): AspectHit[] => {
  const hits: AspectHit[] = [];
  for (const key of CORE_CONTACTS) {
    const p = (chart.planets as any)?.[key];
    const abs = toAbsoluteLongitude(p);
    if (abs == null) continue;
    const sep = angleBetween(targetAbs, abs);
    for (const asp of STANDARD_ASPECTS) {
      if (!MAJOR_ASPECT_NAMES.includes(asp.name)) continue;
      const orb = Math.abs(sep - asp.angle);
      const allowed = getEffectiveOrb(targetName, key, asp.name);
      if (orb <= allowed) {
        hits.push({ natalBody: key, aspect: asp.name, orb: Number(orb.toFixed(2)), symbol: asp.symbol });
      }
    }
  }
  // Sort: conjunctions first, then hard, then soft; within each, tightest orb.
  const rank: Record<string, number> = { conjunction: 0, opposition: 1, square: 2, trine: 3, sextile: 4 };
  return hits.sort((a, b) => {
    const r = (rank[a.aspect] ?? 9) - (rank[b.aspect] ?? 9);
    if (r !== 0) return r;
    return a.orb - b.orb;
  }).slice(0, 4);
};

// ---------- Sign flavors (short lived-experience clauses) ----------
const SIGN_FLAVOR: Record<string, string> = {
  Aries: "moving first, acting on instinct, refusing to wait for permission",
  Taurus: "building slowly, trusting the body, wanting things that last",
  Gemini: "asking questions, gathering information, holding two ideas at once",
  Cancer: "protecting people, tending to home and family, feeling everything through the gut",
  Leo: "being seen, taking creative risks, leading with warmth",
  Virgo: "refining the details, being useful, quietly running the systems that hold everything together",
  Libra: "weighing fairness, choosing beauty, learning when to stop trying to please everyone",
  Scorpio: "going all in, sitting with the uncomfortable truth, refusing surface-level anything",
  Sagittarius: "seeking meaning, telling the honest story, needing room to move",
  Capricorn: "building the structure, playing the long game, taking responsibility no one asked you to take",
  Aquarius: "seeing the whole system, refusing to conform, caring about the group",
  Pisces: "feeling the unseen, dissolving edges, trusting what can't be proven",
};

// ---------- Body-specific meaning templates ----------
interface BodyMeaning {
  title: string;                     // Modal title
  headline: (sign: string) => string; // one-sentence identity of the body for this sign
  houseFrame: string;                 // how to frame the house arena
  action: (sign: string, house: number | null) => string;
}

const MEANINGS: Record<DivineFemBody, BodyMeaning> = {
  NorthNode: {
    title: "Your North Node",
    headline: (sign) => `Where you're headed in this lifetime is toward ${SIGN_FLAVOR[sign]}.`,
    houseFrame: "The arena where that growth is actually asked of you is",
    action: (_s, _h) =>
      "When a situation feels uncomfortable in this arena, that's usually the sign you're moving in the right direction. Lean in for one deliberate step.",
  },
  SouthNode: {
    title: "Your South Node",
    headline: (sign) =>
      `What you already know how to do, almost too well, is ${SIGN_FLAVOR[sign]}. It's your comfort zone and, when overused, your escape hatch.`,
    houseFrame: "The area of life where you tend to fall back into that old pattern is",
    action: () =>
      "Notice when you reach for this move automatically. It works, but it isn't growth. Ask what the North Node arena would ask of you instead.",
  },
  Chiron: {
    title: "Your Chiron",
    headline: (sign) =>
      `Your deepest wound and your greatest healing gift shows up around ${SIGN_FLAVOR[sign]} — the place you were hurt is the place you can quietly help others.`,
    houseFrame: "The area of life where the wound keeps surfacing is",
    action: () =>
      "You don't have to fix this wound to be useful. Tell the truth about it in the room you're in. That's the healing.",
  },
  Lilith: {
    title: "Your Lilith (Black Moon)",
    headline: (sign) =>
      `Your untamed, refuses-to-be-managed self expresses through ${SIGN_FLAVOR[sign]}. This is the part of you that will not be softened for anyone's comfort.`,
    houseFrame: "The area of life where you keep hitting the line between owning your power and being punished for it is",
    action: () =>
      "Stop apologizing for the version of you that lives here. Say the true thing, once, without a disclaimer.",
  },
  Ceres: {
    title: "Your Ceres",
    headline: (sign) =>
      `You feel nurtured, and know how to nurture other people, through ${SIGN_FLAVOR[sign]}.`,
    houseFrame: "The area of life where care, feeding, and loss keep showing up is",
    action: () =>
      "Give yourself the exact kind of care you tend to give away. This week, one time, on purpose.",
  },
  Pallas: {
    title: "Your Pallas",
    headline: (sign) =>
      `Your strategic intelligence and pattern-recognition move through ${SIGN_FLAVOR[sign]}. This is where you see the plan before anyone else in the room.`,
    houseFrame: "The area of life where your strategy is most useful is",
    action: () =>
      "Trust the pattern you're seeing even before you can explain it. Sketch it out on paper before someone talks you out of it.",
  },
  Juno: {
    title: "Your Juno",
    headline: (sign) =>
      `What you need in a real long-term partnership is ${SIGN_FLAVOR[sign]}. Not a personality type — a felt experience.`,
    houseFrame: "The area of life where partnership dynamics keep playing out is",
    action: () =>
      "Name one non-negotiable this placement points to. Say it out loud to the person, not just to yourself.",
  },
  Vesta: {
    title: "Your Vesta",
    headline: (sign) =>
      `The thing you can pour focused devotion into, and be nourished by rather than drained, involves ${SIGN_FLAVOR[sign]}.`,
    houseFrame: "The area of life where that sacred focus wants to live is",
    action: () =>
      "Protect the time this asks for. Say no to one thing this week to keep the flame lit.",
  },
};

const bodyDisplayName = (b: DivineFemBody): string =>
  b === "NorthNode" ? "North Node" :
  b === "SouthNode" ? "South Node" : b;

const formatAspectSentence = (hit: AspectHit, bodyLabel: string): string => {
  const verb: Record<string, string> = {
    conjunction: `sits right on top of your natal ${hit.natalBody}, fusing the two`,
    opposition:  `stands across from your natal ${hit.natalBody}, asking you to hold both sides`,
    square:      `squares your natal ${hit.natalBody}, creating the friction that forces a real choice`,
    trine:       `trines your natal ${hit.natalBody}, giving you an easy channel to use`,
    sextile:     `sextiles your natal ${hit.natalBody}, offering a doorway you have to walk through on purpose`,
  };
  return `${bodyLabel} ${verb[hit.aspect] || `is in contact with your natal ${hit.natalBody}`} (orb ${hit.orb}°).`;
};

export const personalizeDivineFeminineBody = (
  chart: NatalChart | null | undefined,
  body: DivineFemBody,
): PersonalReading => {
  const meaning = MEANINGS[body];
  const label = bodyDisplayName(body);

  if (!chart) {
    return {
      title: meaning.title,
      placement: "",
      aspects: [],
      reading: "",
      doThis: "",
      missing: "Select a chart in the Chart Library to see this reading for you.",
    };
  }

  // South Node: derive from North Node if not stored separately (they're exactly opposite).
  let point = (chart.planets as any)[body];
  if (!point && body === "SouthNode") {
    const nn = chart.planets.NorthNode;
    if (nn?.sign) {
      const nnIdx = SIGN_NAMES.findIndex((s) => s.toLowerCase() === nn.sign!.toLowerCase());
      if (nnIdx >= 0) {
        const oppSign = SIGN_NAMES[(nnIdx + 6) % 12];
        point = { sign: oppSign, degree: nn.degree, minutes: nn.minutes };
      }
    }
  }

  if (!point?.sign) {
    return {
      title: meaning.title,
      placement: "",
      aspects: [],
      reading: "",
      doThis: "",
      missing: `Your chart doesn't have ${label} entered yet. Add it under Chart Library → Extended Bodies to see this reading.`,
    };
  }

  const abs = toAbsoluteLongitude(point);
  const house = houseForLongitude(chart, abs);
  const houseText = house ? `${ordinal(house)} house — ${HOUSE_ARENA[house]}` : null;
  const degText =
    point.degree != null
      ? `${point.degree}°${point.minutes != null ? String(point.minutes).padStart(2, "0") + "'" : ""}`
      : "";

  const placement = houseText
    ? `${point.sign}${degText ? " " + degText : ""}, ${houseText}`
    : `${point.sign}${degText ? " " + degText : ""}`;

  const aspects = abs != null ? findAspects(chart, abs, label) : [];

  const headline = meaning.headline(point.sign);
  const houseSentence = house
    ? `${meaning.houseFrame} ${HOUSE_ARENA[house]}.`
    : `The house placement isn't confirmed in this chart yet, so the arena is unclear until house cusps are entered.`;
  const aspectSentence = aspects.length
    ? formatAspectSentence(aspects[0], `Your ${label}`)
    : `No planet is currently within orb of your ${label}, so the theme runs quietly in the background rather than getting activated by another placement.`;

  const reading = `${headline} ${houseSentence} ${aspectSentence}`;

  return {
    title: meaning.title,
    placement,
    aspects,
    reading,
    doThis: meaning.action(point.sign, house),
  };
};
