// Personalized aspect ranking for a natal chart.
// Surfaces every aspect (including dissociate / out-of-sign) ordered by importance,
// not just orb tightness.

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { signDegreesToLongitude, getNatalPlanetHouse, getHouseForLongitude } from '@/lib/houseCalculations';
import { getEffectiveOrb, STANDARD_ASPECTS } from '@/lib/aspectOrbs';

export type AspectName =
  | 'conjunction' | 'opposition' | 'trine' | 'square'
  | 'sextile' | 'quincunx' | 'semisextile';

export interface RankedAspect {
  a: string;                 // planet name (chart key)
  b: string;
  aSign: string;
  bSign: string;
  aHouse: number | null;
  bHouse: number | null;
  aRetro: boolean;
  bRetro: boolean;
  aspect: AspectName;
  symbol: string;
  exactAngle: number;        // 0, 60, 90, 120, 150, 180...
  separation: number;        // actual angular separation (0-180)
  orb: number;               // |separation - exactAngle|
  maxOrb: number;            // allowed orb for this pairing
  applying: boolean;         // true = applying, false = separating (heuristic by retro state)
  dissociate: boolean;       // true if signs don't match the natural by-sign geometry
  stackedWithA: string[];    // other bodies within 3° of planet A
  stackedWithB: string[];    // other bodies within 3° of planet B
  score: number;
}

// Bodies we care about for ranking (skip the deep Kuiper / centaur list unless present and major).
const RANKED_BODIES = [
  'Sun', 'Moon', 'Ascendant', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'NorthNode', 'SouthNode', 'Chiron', 'Lilith',
  // include MC if present via houseCusps house10 (handled separately)
];

const PLANET_WEIGHT: Record<string, number> = {
  Sun: 10, Moon: 10,
  Ascendant: 8, MC: 8,
  Mercury: 7, Venus: 7, Mars: 7,
  Jupiter: 5, Saturn: 5,
  Uranus: 4, Neptune: 4, Pluto: 4,
  NorthNode: 5, SouthNode: 5, Chiron: 5,
  Lilith: 3,
};

const ASPECT_WEIGHT: Record<AspectName, number> = {
  conjunction: 10,
  opposition: 9,
  square: 8,
  trine: 7,
  sextile: 5,
  quincunx: 4,
  semisextile: 2,
};

export const ASPECT_SYMBOLS: Record<AspectName, string> = {
  conjunction: '☌',
  opposition: '☍',
  trine: '△',
  square: '□',
  sextile: '⚹',
  quincunx: '⚻',
  semisextile: '⚺',
};

const ZODIAC = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const GLYPH_TO_NAME: Record<string,string> = {
  '♈':'Aries','♉':'Taurus','♊':'Gemini','♋':'Cancer','♌':'Leo','♍':'Virgo',
  '♎':'Libra','♏':'Scorpio','♐':'Sagittarius','♑':'Capricorn','♒':'Aquarius','♓':'Pisces',
};
const normalizeSign = (s: string) => GLYPH_TO_NAME[(s||'').trim()] || (s||'').trim();
const signIndex = (s: string) => ZODIAC.indexOf(normalizeSign(s));

// Number of sign-steps expected between two planets for each aspect type when "in-sign".
const ASPECT_SIGN_DISTANCE: Record<AspectName, number[]> = {
  conjunction: [0],
  opposition: [6],
  trine: [4],
  square: [3],
  sextile: [2],
  quincunx: [5],
  semisextile: [1],
};

function isDissociate(aspect: AspectName, signA: string, signB: string): boolean {
  const ia = signIndex(signA);
  const ib = signIndex(signB);
  if (ia < 0 || ib < 0) return false;
  const diff = Math.min(Math.abs(ia - ib), 12 - Math.abs(ia - ib));
  return !ASPECT_SIGN_DISTANCE[aspect].includes(diff);
}

function getBodyLongitude(chart: NatalChart, name: string): number | null {
  if (name === 'MC') {
    const c = chart.houseCusps?.house10;
    if (!c?.sign) return null;
    return signDegreesToLongitude(c.sign, c.degree, c.minutes);
  }
  if (name === 'Ascendant') {
    const c = chart.houseCusps?.house1;
    if (c?.sign) return signDegreesToLongitude(c.sign, c.degree, c.minutes);
  }
  const p = chart.planets[name as keyof typeof chart.planets] as NatalPlanetPosition | undefined;
  if (!p?.sign) return null;
  return signDegreesToLongitude(p.sign, p.degree, p.minutes);
}

function getBodySign(chart: NatalChart, name: string): string {
  if (name === 'MC') return chart.houseCusps?.house10?.sign || '';
  if (name === 'Ascendant') return chart.houseCusps?.house1?.sign || '';
  const p = chart.planets[name as keyof typeof chart.planets] as NatalPlanetPosition | undefined;
  return p?.sign || '';
}

function getBodyHouse(chart: NatalChart, name: string): number | null {
  if (name === 'Ascendant') return 1;
  if (name === 'MC') return 10;
  const lon = getBodyLongitude(chart, name);
  if (lon == null) return null;
  return getHouseForLongitude(lon, chart);
}

function isAngular(house: number | null): boolean {
  return house === 1 || house === 4 || house === 7 || house === 10;
}

function shortestSeparation(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function computeRankedAspects(chart: NatalChart): RankedAspect[] {
  if (!chart?.planets) return [];

  // Build the set of bodies actually present.
  const bodies: { name: string; lon: number }[] = [];
  for (const name of RANKED_BODIES) {
    const lon = getBodyLongitude(chart, name);
    if (lon != null) bodies.push({ name, lon });
  }
  // MC if available
  if (chart.houseCusps?.house10?.sign) {
    const lon = getBodyLongitude(chart, 'MC');
    if (lon != null) bodies.push({ name: 'MC', lon });
  }

  // Pre-compute stack neighbors (any body within 3° of each body, conjunction-feel).
  const stackOf: Record<string, string[]> = {};
  for (const b of bodies) {
    stackOf[b.name] = bodies
      .filter(o => o.name !== b.name && shortestSeparation(b.lon, o.lon) <= 3)
      .map(o => o.name);
  }

  const out: RankedAspect[] = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const A = bodies[i];
      const B = bodies[j];
      // Skip Node-axis pair (always 180° by construction, not informative).
      if ((A.name === 'NorthNode' && B.name === 'SouthNode') ||
          (A.name === 'SouthNode' && B.name === 'NorthNode')) continue;

      const sep = shortestSeparation(A.lon, B.lon);

      for (const aspectDef of STANDARD_ASPECTS) {
        const orb = Math.abs(sep - aspectDef.angle);
        const maxOrb = getEffectiveOrb(A.name, B.name, aspectDef.name);
        if (orb > maxOrb) continue;

        const aspect = aspectDef.name as AspectName;
        const signA = getBodySign(chart, A.name);
        const signB = getBodySign(chart, B.name);
        const dissociate = isDissociate(aspect, signA, signB);

        const aHouse = getBodyHouse(chart, A.name);
        const bHouse = getBodyHouse(chart, B.name);
        const pA = chart.planets[A.name as keyof typeof chart.planets] as NatalPlanetPosition | undefined;
        const pB = chart.planets[B.name as keyof typeof chart.planets] as NatalPlanetPosition | undefined;

        // Scoring
        const planetSum = (PLANET_WEIGHT[A.name] ?? 3) + (PLANET_WEIGHT[B.name] ?? 3);
        const aspectW = ASPECT_WEIGHT[aspect];
        const tightnessFactor = 1 + (1 - orb / Math.max(maxOrb, 0.5)) * 0.6; // 1.0 .. 1.6
        let score = planetSum * aspectW * tightnessFactor;
        if (isAngular(aHouse)) score += 8;
        if (isAngular(bHouse)) score += 8;
        if (dissociate) score *= 0.92; // small penalty: real but more diffuse

        out.push({
          a: A.name,
          b: B.name,
          aSign: signA,
          bSign: signB,
          aHouse,
          bHouse,
          aRetro: !!pA?.isRetrograde,
          bRetro: !!pB?.isRetrograde,
          aspect,
          symbol: ASPECT_SYMBOLS[aspect],
          exactAngle: aspectDef.angle,
          separation: sep,
          orb,
          maxOrb,
          applying: false, // natal: not meaningful, kept for API symmetry
          dissociate,
          stackedWithA: stackOf[A.name] || [],
          stackedWithB: stackOf[B.name] || [],
          score,
        });
        break; // a pair can only match one aspect cleanly
      }
    }
  }

  return out.sort((x, y) => y.score - x.score);
}
