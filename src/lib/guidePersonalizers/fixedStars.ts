// Guide personalizer for Fixed Stars.
// Given the active chart + which star was clicked, checks whether any eligible
// natal point (Asc, MC, Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, NN)
// is within orb of the star's precessed position. Returns the same
// PersonalReading shape used by Divine Feminine + Retrogrades.

import type { NatalChart } from "@/hooks/useNatalChart";
import {
  FIXED_STARS,
  precessedLongitude,
  type FixedStar,
} from "@/lib/fixedStars";
import { toAbsoluteLongitude } from "@/lib/houseForLongitude";
import type { PersonalReading, AspectHit } from "./divineFeminine";

const SIGNS = [
  "Aries","Taurus","Gemini","Cancer","Leo","Virgo",
  "Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces",
];

const POINT_LABEL: Record<string, string> = {
  Ascendant: "Ascendant",
  Midheaven: "Midheaven",
  Sun: "Sun", Moon: "Moon",
  Mercury: "Mercury", Venus: "Venus", Mars: "Mars",
  Jupiter: "Jupiter", Saturn: "Saturn",
  NorthNode: "North Node",
};

const POINT_ORB: Record<string, number> = {
  Ascendant: 2, Midheaven: 2,
  Sun: 2, Moon: 2,
  Mercury: 1.5, Venus: 1.5, Mars: 1.5,
  Jupiter: 1, Saturn: 1, NorthNode: 1,
};

const POINT_FLAVOR: Record<string, string> = {
  Ascendant: "your body, your first impression, the way you arrive in a room",
  Midheaven: "your public role and how the world names you",
  Sun: "your core sense of self and life direction",
  Moon: "your emotional baseline and what feels like safety",
  Mercury: "how you think, speak, and process",
  Venus: "what you love, what you find beautiful, and how you relate",
  Mars: "your drive and how you fight for what you want",
  Jupiter: "what you believe and where you tend to expand",
  Saturn: "your discipline and where life tests you over the long haul",
  "North Node": "the growth edge your life keeps pointing you toward",
};

const fmt = (lon: number) => {
  const n = ((lon % 360) + 360) % 360;
  const idx = Math.floor(n / 30);
  const inSign = n - idx * 30;
  let deg = Math.floor(inSign);
  let min = Math.round((inSign - deg) * 60);
  if (min === 60) { deg += 1; min = 0; }
  return `${deg}°${String(min).padStart(2, "0")}' ${SIGNS[idx % 12]}`;
};

const birthYear = (chart: NatalChart): number => {
  const m = (chart.birthDate || "").match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : new Date().getFullYear();
};

const pointLon = (chart: NatalChart, key: string): number | null => {
  if (key === "Ascendant") {
    const c = chart.houseCusps?.house1;
    if (c) {
      const idx = SIGNS.indexOf(c.sign);
      if (idx >= 0) return idx * 30 + c.degree + (c.minutes || 0) / 60;
    }
  }
  if (key === "Midheaven") {
    const c = chart.houseCusps?.house10;
    if (c) {
      const idx = SIGNS.indexOf(c.sign);
      if (idx >= 0) return idx * 30 + c.degree + (c.minutes || 0) / 60;
    }
  }
  const p = (chart.planets as any)?.[key];
  return toAbsoluteLongitude(p);
};

export const FIXED_STAR_CADENCE =
  "Fixed stars drift only about 1° every 72 years, so their zodiac position is almost identical for everyone alive today. What makes a star personal to you is whether one of your natal points (Ascendant, Midheaven, Sun, Moon, or a personal planet) sits within a tight 1–2° orb of it. Without that contact, the star is just background sky.";

export const personalizeFixedStar = (
  chart: NatalChart | null | undefined,
  starName: string,
): PersonalReading => {
  const star = FIXED_STARS.find((s) => s.name === starName);
  const title = `${starName} in your chart`;

  if (!star) {
    return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "This star isn't in the database yet." };
  }
  if (!chart) {
    return { title, placement: "", aspects: [], reading: "", doThis: "", missing: "Select a chart above to see whether this star is activated for you." };
  }

  const year = birthYear(chart);
  const starLon = precessedLongitude(star.j2000Lon, year);
  const starPos = fmt(starLon);

  const hits: Array<{ point: string; orb: number; pos: string }> = [];
  for (const key of Object.keys(POINT_ORB)) {
    const lon = pointLon(chart, key);
    if (lon == null) continue;
    let diff = Math.abs(starLon - lon);
    if (diff > 180) diff = 360 - diff;
    if (diff <= POINT_ORB[key]) {
      hits.push({
        point: POINT_LABEL[key],
        orb: Math.round(diff * 100) / 100,
        pos: fmt(lon),
      });
    }
  }
  hits.sort((a, b) => a.orb - b.orb);

  const placement = `${starPos} (precessed to ${year})`;

  if (!hits.length) {
    return {
      title,
      placement,
      aspects: [],
      reading:
        `${starName} sits at ${starPos} in the sky. In your chart, none of the eligible natal points (Ascendant, Midheaven, Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, or North Node) fall within the tight orb this star needs to activate — so ${starName}'s theme (${star.theme}) runs as background sky rather than a personal signature.`,
      doThis:
        "This one isn't a personal signature for you. Read it as sky context, not as a headline about you.",
      cadence: FIXED_STAR_CADENCE,
    };
  }

  const primary = hits[0];
  const flavor = POINT_FLAVOR[primary.point] || "";
  const reading =
    `${starName} sits at ${starPos}, and in your chart it lands right on your ${primary.point} at ${primary.pos} (orb ${primary.orb}°). ` +
    `Its nature — ${star.theme} — imprints directly onto ${flavor}. ` +
    (hits.length > 1
      ? `It also touches your ${hits.slice(1).map((h) => `${h.point} (orb ${h.orb}°)`).join(" and ")}, which widens the reach of the theme.`
      : `Because no other natal point is inside the orb, this is a clean one-point signature rather than a diffuse influence.`);

  const aspects: AspectHit[] = hits.map((h) => ({
    natalBody: h.point,
    aspect: "conjunction",
    orb: h.orb,
    symbol: "☌",
  }));

  return {
    title,
    placement,
    aspects,
    reading,
    doThis:
      `Own this. When situations touch ${primary.point.toLowerCase()} themes for you, remember that ${starName}'s signature is part of what you're carrying, and act from it on purpose instead of by accident.`,
    cadence: FIXED_STAR_CADENCE,
  };
};

export interface FixedStarCard {
  key: string;      // star name
  glyph: string;
  name: string;     // display, includes zodiac position
  blurb: string;
  badge?: string;
  badgeClass?: string;
}

// Curated set matching the existing Fixed Stars content in GuideView.
export const FIXED_STAR_CARDS: FixedStarCard[] = [
  { key: "Aldebaran",  glyph: "⭐", name: "Aldebaran (Guardian of the East)",  blurb: "The Bull's Eye. Integrity, honor, eloquence. Success through integrity; military honors, courage, passion for truth." },
  { key: "Regulus",    glyph: "⭐", name: "Regulus (Guardian of the North)",    blurb: "Heart of the Lion. Royal power, leadership, fame — success if revenge is avoided. Nobility, positions of power." },
  { key: "Antares",    glyph: "⭐", name: "Antares (Guardian of the West)",     blurb: "Rival of Mars. Warrior spirit, obsession, intensity. Success through persistence. Heart of the Scorpion." },
  { key: "Fomalhaut",  glyph: "⭐", name: "Fomalhaut (Guardian of the South)",  blurb: "The Mouth of the Fish. Idealism, mysticism, fame. The 'fallen angel' star — capable of both rise and fall." },
  { key: "Sirius",     glyph: "⭐", name: "Sirius (Brightest Star)",            blurb: "The Dog Star. Spiritual wisdom, success, fame. Ancient Egyptian sacred star. Divine downloads, kundalini awakening.", badge: "Brightest", badgeClass: "text-amber-600 dark:text-amber-400" },
  { key: "Algol",      glyph: "⭐", name: "Algol (Most Infamous)",              blurb: "Medusa's head. Transformation through facing the shadow. Feminine rage transmuted into power.", badge: "Most Infamous", badgeClass: "text-red-600 dark:text-red-400" },
  { key: "Spica",      glyph: "⭐", name: "Spica (Most Benefic)",               blurb: "The Wheat Sheaf. Gifts, talents, protection. Venus-Jupiter nature. Artistic success, harvest of efforts. The priestess star.", badge: "Most Benefic", badgeClass: "text-green-600 dark:text-green-400" },
  { key: "Vega",       glyph: "⭐", name: "Vega",                                blurb: "The Falling Vulture. Charisma, the arts, magnetism. Success that comes in waves." },
  { key: "Arcturus",   glyph: "⭐", name: "Arcturus",                            blurb: "The Guardian and Pathfinder. Success through walking a different path. Steady prosperity." },
  { key: "Alcyone",    glyph: "⭐", name: "Alcyone (Pleiades)",                  blurb: "'Something to cry about.' Eyes, vision, sorrow that becomes wisdom. Sensitivity and second sight." },
  { key: "Betelgeuse", glyph: "⭐", name: "Betelgeuse",                          blurb: "Warrior's crown. Great success and lasting honor, with a risk of a public fall if integrity slips." },
  { key: "Canopus",    glyph: "⭐", name: "Canopus",                             blurb: "The Old Voyager. Long journeys, navigation, leadership earned by experience." },
];
