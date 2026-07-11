// Wave 2: Retrograde personalizer.
// For each planet, returns a reading built from the user's natal chart:
//   - natal sign + house
//   - whether they were born with the planet retrograde
//   - tightest natal aspects to that planet
//   - the next upcoming retrograde in the sky (dates, sign, transiting house
//     for THIS chart), plus what natal planets it will re-cross
//   - one behavioral action

import * as Astronomy from "astronomy-engine";
import type { NatalChart } from "@/hooks/useNatalChart";
import {
  houseForLongitude,
  toAbsoluteLongitude,
  ordinal,
  HOUSE_ARENA,
  SIGN_NAMES,
} from "@/lib/houseForLongitude";
import { STANDARD_ASPECTS, getEffectiveOrb } from "@/lib/aspectOrbs";
import type { PersonalReading, AspectHit } from "./divineFeminine";
import { getRetrogradePeriods, type RetrogradeInfo } from "@/lib/retrogradePatterns";

export type RetroPlanet =
  | "Mercury" | "Venus" | "Mars"
  | "Jupiter" | "Saturn"
  | "Uranus" | "Neptune" | "Pluto"
  | "Chiron";

const BODY_MAP: Record<RetroPlanet, Astronomy.Body | null> = {
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
  Chiron: null, // no sky computation; still uses natal placement
};

const CORE_CONTACTS = [
  "Sun", "Moon", "Ascendant", "Mercury", "Venus", "Mars",
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto",
] as const;

const MAJOR = ["conjunction", "opposition", "square", "trine", "sextile"];

const angleBetween = (a: number, b: number): number => {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
};

const findAspects = (chart: NatalChart, targetAbs: number, targetName: string): AspectHit[] => {
  const hits: AspectHit[] = [];
  for (const key of CORE_CONTACTS) {
    if (key === targetName) continue;
    const p = (chart.planets as any)?.[key];
    const abs = toAbsoluteLongitude(p);
    if (abs == null) continue;
    const sep = angleBetween(targetAbs, abs);
    for (const asp of STANDARD_ASPECTS) {
      if (!MAJOR.includes(asp.name)) continue;
      const orb = Math.abs(sep - asp.angle);
      const allowed = getEffectiveOrb(targetName, key, asp.name);
      if (orb <= allowed) {
        hits.push({ natalBody: key, aspect: asp.name, orb: Number(orb.toFixed(2)), symbol: asp.symbol });
      }
    }
  }
  const rank: Record<string, number> = { conjunction: 0, opposition: 1, square: 2, trine: 3, sextile: 4 };
  return hits
    .sort((a, b) => (rank[a.aspect] - rank[b.aspect]) || (a.orb - b.orb))
    .slice(0, 4);
};

// Sign-flavored one-liners for what THIS retrograde asks (per natal sign).
const SIGN_REVIEW: Record<string, string> = {
  Aries: "how you start things, how quickly you react, where you fight when you don't need to",
  Taurus: "what you're holding onto out of habit, your relationship with money and comfort, what's actually stable",
  Gemini: "the stories you tell, the tabs you keep open, which conversations you keep avoiding",
  Cancer: "your family patterns, what feels like home, how you protect versus who you protect",
  Leo: "where you're performing versus being, what you create for you, what you make for applause",
  Virgo: "the systems you run, what you're over-analyzing, where useful becomes self-erasure",
  Libra: "who you keep the peace for, which relationships are actually mutual, where fairness costs you",
  Scorpio: "what you're not saying out loud, the trust you gave that isn't being returned, where you're hiding power",
  Sagittarius: "what you believe versus what you've inherited, which trips or plans are avoidance, the honest story",
  Capricorn: "which structures still deserve your loyalty, what you're building for approval, the long game",
  Aquarius: "which groups still fit, where you're detaching to avoid feeling, the future you actually want",
  Pisces: "what you've been dissolving into, where you're rescuing when you should be resting, the boundary you keep skipping",
};

interface Meta {
  title: string;
  glyph: string;
  frequency: string;
  domain: string;
  gift: string;   // what re-work here unlocks
  action: (sign: string, natalHouse: number | null) => string;
}

const META: Record<RetroPlanet, Meta> = {
  Mercury: {
    title: "Mercury Retrograde for You",
    glyph: "☿℞",
    frequency: "3 to 4 times per year, about 3 weeks each",
    domain: "communication, contracts, tech, travel, plans, and the way you think",
    gift: "clarity that only comes from re-reading, re-editing, and having the conversation again",
    action: (_s, _h) => "Pick one message, document, or decision you rushed and go back to it before signing off.",
  },
  Venus: {
    title: "Venus Retrograde for You",
    glyph: "♀℞",
    frequency: "about every 18 months, roughly 6 weeks",
    domain: "love, money, values, aesthetics, and how you receive care",
    gift: "an honest audit of what you actually want versus what looked nice from the outside",
    action: (_s, _h) => "Name one relationship or purchase you've been performing enthusiasm around. Say the truer thing.",
  },
  Mars: {
    title: "Mars Retrograde for You",
    glyph: "♂℞",
    frequency: "about every 2 years, roughly 10 weeks",
    domain: "action, drive, anger, desire, and how you fight",
    gift: "the chance to redirect force you were burning without a target",
    action: (_s, _h) => "Instead of starting something new, finish one thing you already committed to. Then look at what you're actually angry about.",
  },
  Jupiter: {
    title: "Jupiter Retrograde for You",
    glyph: "♃℞",
    frequency: "annually, about 4 months",
    domain: "growth, meaning, teachers, travel, and where you're expanding",
    gift: "a check on which growth is real and which is just louder",
    action: (_s, _h) => "Cut the promise you can't keep. Keep the one you can. Growth without integrity is inflation.",
  },
  Saturn: {
    title: "Saturn Retrograde for You",
    glyph: "♄℞",
    frequency: "annually, about 4.5 months",
    domain: "structure, discipline, adulthood, responsibility, and the walls you've built",
    gift: "a chance to fix the foundation before you keep building on top of it",
    action: (_s, _h) => "Pick the responsibility you keep dodging. Do the one boring hour of it this week. That's the work.",
  },
  Uranus: {
    title: "Uranus Retrograde for You",
    glyph: "♅℞",
    frequency: "annually, about 5 months",
    domain: "your freedom, awakenings, disruption, and where you refuse to conform",
    gift: "quiet inner rebellion instead of the loud kind that blows up the wrong things",
    action: (_s, _h) => "Where are you tolerating something that isn't yours? Change one small rule instead of exploding the whole system.",
  },
  Neptune: {
    title: "Neptune Retrograde for You",
    glyph: "♆℞",
    frequency: "annually, about 5 to 6 months",
    domain: "dreams, illusions, spirituality, and what you don't want to see clearly",
    gift: "the fog thins, and you get to see one thing you've been romanticizing",
    action: (_s, _h) => "Ask what you've been telling yourself that a friend would gently push back on. Write it down before you talk yourself out of it.",
  },
  Pluto: {
    title: "Pluto Retrograde for You",
    glyph: "♇℞",
    frequency: "annually, about 5 to 6 months",
    domain: "power, control, transformation, and what quietly runs your life",
    gift: "an inner-level cleanup of a dynamic you've been performing outwardly",
    action: (_s, _h) => "Notice one place you keep giving your power away, or grabbing at someone else's. Name it. Do not fix it yet.",
  },
  Chiron: {
    title: "Chiron Retrograde for You",
    glyph: "⚷℞",
    frequency: "annually, about 5 months",
    domain: "your core wound and the healing you do for others through it",
    gift: "old grief resurfaces with less charge, so you can meet it as an adult now",
    action: (_s, _h) => "Say the true sentence about the wound out loud, once, to yourself or one safe person. That is the medicine.",
  },
};

const stationSignAt = (body: Astronomy.Body, date: Date): string | null => {
  try {
    const v = Astronomy.GeoVector(body, date, false);
    const e = Astronomy.Ecliptic(v);
    const idx = Math.floor(((e.elon % 360) + 360) % 360 / 30) % 12;
    return SIGN_NAMES[idx];
  } catch { return null; }
};

const stationAbsAt = (body: Astronomy.Body, date: Date): number | null => {
  try {
    const v = Astronomy.GeoVector(body, date, false);
    const e = Astronomy.Ecliptic(v);
    return ((e.elon % 360) + 360) % 360;
  } catch { return null; }
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Natal planets re-hit by the retrograde zone (between rxDegree and dDegree
// via retrograde motion). Returns natal body names.
const natalHitsInRetroBand = (chart: NatalChart, rx: number, d: number): string[] => {
  // Retro band: planet moves from rx down to d (backward). Cover the arc from d up to rx.
  const start = Math.min(rx, d);
  const end = Math.max(rx, d);
  // Handle wrap
  const inBand = (x: number) => {
    if (end - start < 180) {
      return x >= start && x <= end;
    }
    // wrap case (rare over ~30° retros)
    return x >= end || x <= start;
  };
  const hits: string[] = [];
  for (const key of CORE_CONTACTS) {
    const p = (chart.planets as any)?.[key];
    const abs = toAbsoluteLongitude(p);
    if (abs == null) continue;
    if (inBand(abs)) hits.push(key);
  }
  return hits;
};

export const personalizeRetrograde = (
  chart: NatalChart | null | undefined,
  planet: RetroPlanet,
): PersonalReading => {
  const meta = META[planet];

  if (!chart) {
    return {
      title: meta.title,
      placement: "",
      aspects: [],
      reading: "",
      doThis: "",
      missing: "Select a chart in the Chart Library to see this reading for you.",
    };
  }

  const natal = (chart.planets as any)[planet];
  if (!natal?.sign) {
    return {
      title: meta.title,
      placement: "",
      aspects: [],
      reading: "",
      doThis: "",
      missing: `Your chart doesn't have ${planet} entered yet. Add it under Chart Library → Extended Bodies to see this reading.`,
    };
  }

  const abs = toAbsoluteLongitude(natal);
  const natalHouse = houseForLongitude(chart, abs);
  const degText = natal.degree != null
    ? `${natal.degree}°${natal.minutes != null ? String(natal.minutes).padStart(2, "0") + "'" : ""}`
    : "";
  const bornRx = natal.isRetrograde === true;
  const placementBits = [
    `${natal.sign}${degText ? " " + degText : ""}`,
    natalHouse ? `${ordinal(natalHouse)} house: ${HOUSE_ARENA[natalHouse]}` : null,
    bornRx ? "retrograde at birth" : null,
  ].filter(Boolean);
  const placement = placementBits.join(", ");

  const aspects = abs != null ? findAspects(chart, abs, planet) : [];

  // Upcoming sky retrograde
  const body = BODY_MAP[planet];
  let skySentence = "";
  let doThis = meta.action(natal.sign, natalHouse);

  if (body) {
    const now = new Date();
    const periods = getRetrogradePeriods(body, now);
    const next: RetrogradeInfo | undefined =
      periods.find((p) => now >= p.preStart && now <= p.postEnd) ||
      periods.find((p) => p.start > now);

    if (next) {
      const inProgress = now >= next.start && now <= next.end;
      const inShadow = now >= next.preStart && now < next.start;
      const rxSign = stationSignAt(body, next.start);
      const dSign = stationSignAt(body, next.end);
      const rxAbs = next.rxDegree ?? stationAbsAt(body, next.start);
      const dAbs = next.dDegree ?? stationAbsAt(body, next.end);

      const transitHouse = rxAbs != null ? houseForLongitude(chart, rxAbs) : null;
      const hits =
        rxAbs != null && dAbs != null ? natalHitsInRetroBand(chart, rxAbs, dAbs) : [];

      const window = `${fmtDate(next.start)} to ${fmtDate(next.end)}`;
      const signPhrase =
        rxSign && dSign && rxSign !== dSign
          ? `${rxSign} back into ${dSign}`
          : (rxSign || dSign || "");
      const phaseLabel = inProgress ? "Right now" : inShadow ? "The pre-shadow is already here" : "The next one";

      const houseClause = transitHouse
        ? ` It happens in your ${ordinal(transitHouse)} house, so this one lands in ${HOUSE_ARENA[transitHouse]}.`
        : "";

      const hitsClause = hits.length
        ? ` During the retrograde it will re-cross your natal ${hits.join(", ")}, so those areas get an honest second look.`
        : ` No natal planet sits inside the retrograde band, so it stays more atmospheric than direct.`;

      skySentence = `${phaseLabel}: ${planet} goes retrograde ${signPhrase ? "in " + signPhrase : ""} from ${window}.${houseClause}${hitsClause}`;
    } else {
      skySentence = `No ${planet} retrograde is currently scheduled in the window this calculator holds.`;
    }
  } else {
    // Chiron: no sky compute
    skySentence = `Chiron retrogrades once a year for about 5 months. It moves slowly, so the effect is a long inward tone rather than a sharp event.`;
  }

  const houseArenaClause = natalHouse
    ? `Because your natal ${planet} lives in ${HOUSE_ARENA[natalHouse]}, that's the area of life this planet keeps asking you to re-work every time it goes retrograde.`
    : `Your natal house for ${planet} isn't confirmed, so the retrograde arena stays general until house cusps are entered.`;

  const bornRxClause = bornRx
    ? ` You were born with ${planet} retrograde, which means this planet already runs inward for you. Sky retrogrades feel less disruptive and more like coming home.`
    : "";

  const signReview = SIGN_REVIEW[natal.sign] || "";
  const signClause = signReview
    ? ` For you specifically, ${planet} retrograde is a review of ${signReview}.`
    : "";

  const giftClause = ` The gift, when you cooperate with it, is ${meta.gift}.`;

  const reading =
    `${planet} rules ${meta.domain}, and it goes retrograde ${meta.frequency}. ` +
    houseArenaClause +
    bornRxClause +
    signClause +
    giftClause +
    (skySentence ? ` ${skySentence}` : "");

  return {
    title: meta.title,
    placement,
    aspects,
    reading,
    doThis,
    cadence: PLANET_CADENCE[planet],
  };
};

// How long each planet takes to move through one sign, and how personal that sign is to you
// versus how much it's shared with your generation / peer group.
const PLANET_CADENCE: Record<RetroPlanet, string> = {
  Mercury:
    "Mercury moves through a sign in about 2 to 4 weeks (longer when retrograde). It's a personal placement: a friend born a few weeks before or after you can easily have a different Mercury sign. The sign here is genuinely yours.",
  Venus:
    "Venus moves through a sign in about 3 to 5 weeks (longer when retrograde). Personal: close friends born a month apart often have different Venus signs. The sign here is yours.",
  Mars:
    "Mars moves through a sign in about 6 to 7 weeks on average, but can stay up to 7 months when retrograde. Semi-personal: same-year friends can share it, but often don't.",
  Jupiter:
    "Jupiter spends about 12 to 13 months in each sign. Everyone born in your birth-year cohort shares your Jupiter sign, so this is a peer-group placement. The house is what makes it personal to you.",
  Saturn:
    "Saturn spends about 2.5 years in each sign. Everyone born within that ~2.5-year window shares your Saturn sign, so this is a generational-peer marker. The house is where it becomes yours.",
  Uranus:
    "Uranus spends about 7 years in each sign. This is a generational placement: your whole age cohort shares it. The house is what makes it personal.",
  Neptune:
    "Neptune spends about 14 years in each sign. Purely generational: it defines a whole class of people your age. The house is the personal marker.",
  Pluto:
    "Pluto spends anywhere from 12 to 30 years in a sign (its orbit is very uneven). Fully generational: entire birth-cohorts share it. The house tells you where the transformation lives for you specifically.",
  Chiron:
    "Chiron moves slowly and spends about 2 to 8 years in a sign. Your age cohort likely shares your Chiron sign, so the wound theme is generational. The house makes it yours.",
};

export const RETRO_PLANETS: Array<{ key: RetroPlanet; glyph: string; name: string; blurb: string }> = [
  { key: "Mercury", glyph: "☿℞", name: "Mercury", blurb: "3–4 times a year. Communication, contracts, tech, plans, and how you think." },
  { key: "Venus",   glyph: "♀℞", name: "Venus",   blurb: "Every 18 months. Love, money, values, and how you receive care." },
  { key: "Mars",    glyph: "♂℞", name: "Mars",    blurb: "Every 2 years. Action, drive, anger, desire, and how you fight." },
  { key: "Jupiter", glyph: "♃℞", name: "Jupiter", blurb: "Annually, ~4 months. Growth, meaning, and where you keep expanding." },
  { key: "Saturn",  glyph: "♄℞", name: "Saturn",  blurb: "Annually, ~4.5 months. Structure, responsibility, and the walls you've built." },
  { key: "Uranus",  glyph: "♅℞", name: "Uranus",  blurb: "Annually, ~5 months. Freedom, awakenings, and where you refuse to conform." },
  { key: "Neptune", glyph: "♆℞", name: "Neptune", blurb: "Annually, ~5–6 months. Dreams, illusions, and what you don't want to see clearly." },
  { key: "Pluto",   glyph: "♇℞", name: "Pluto",   blurb: "Annually, ~5–6 months. Power, control, and what quietly runs your life." },
  { key: "Chiron",  glyph: "⚷℞", name: "Chiron",  blurb: "Annually, ~5 months. Your core wound and the healing you do through it." },
];
