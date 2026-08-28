/**
 * Planetary condition and strength in the Jyotish sense.
 *
 * This module computes the classical condition markers that decide how well a
 * graha can actually deliver what its placement promises:
 *
 *  - Baladi avastha: the five-fold maturity state by degree within the sign.
 *  - Combustion (asta): too close to the Sun to act freely.
 *  - Planetary war (graha yuddha): two non-luminaries inside one degree.
 *  - Dig bala: directional strength measured in virupas from the cardinal points.
 *  - Cheshta: retrograde motion, which classical texts read as strong but wilful.
 *  - Varga bala: how many of the divisional charts keep the graha dignified.
 *  - Drik: benefic versus malefic glances landing on it.
 *
 * These six components are combined into an honest 0 to 100 CONDITION INDEX.
 * It is deliberately not called Shadbala: full Shadbala also requires kala
 * bala sub-components that need sunrise, sunset and ayana data this app does
 * not compute for every chart. The index is labeled as a condition index
 * everywhere it is displayed, and its components are always shown alongside it.
 */

import { VedicChart, VedicBody } from './siderealChart';
import { VedicPlanet } from './nakshatras';
import { VedicDignity } from './vedicDignity';
import { drishtiBalance } from './drishti';
import { VargaKey, buildVarga, VargaChart } from './divisionalCharts';

const SIGN_ORDER = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

/* ---------------------------------------------------------------- */
/* Baladi avastha                                                    */
/* ---------------------------------------------------------------- */

export type Avastha = 'infant' | 'adolescent' | 'adult' | 'old' | 'dead';

const AVASTHA_PLAIN: Record<Avastha, string> = {
  infant: 'Bala, the infant state. Classical texts read this as a function that arrives late and needs time before it works reliably.',
  adolescent: 'Kumara, the adolescent state. The function works but unevenly, stronger in bursts than in steady output.',
  adult: 'Yuva, the adult state. This is the strongest of the five: the function tends to work when called on.',
  old: 'Vriddha, the old state. The function is experienced but tired, and tends to work through habit rather than fresh drive.',
  dead: 'Mrita, the last state. Classical texts read the function as having very little independent push, so it usually needs support from elsewhere in the chart.',
};

/** Odd signs run infant to dead forward; even signs run in reverse. */
export function baladiAvastha(body: VedicBody, signIdx: number): { state: Avastha; plain: string } {
  const order: Avastha[] = ['infant', 'adolescent', 'adult', 'old', 'dead'];
  const band = Math.min(4, Math.floor(body.degree / 6));
  const isOddSign = signIdx % 2 === 0; // Aries is index 0 and is odd in Jyotish
  const state = isOddSign ? order[band] : order[4 - band];
  return { state, plain: AVASTHA_PLAIN[state] };
}

/* ---------------------------------------------------------------- */
/* Combustion                                                        */
/* ---------------------------------------------------------------- */

const COMBUST_ORB: Partial<Record<VedicPlanet, number>> = {
  Moon: 12, Mars: 17, Mercury: 14, Jupiter: 11, Venus: 10, Saturn: 15,
};

export function combustion(chart: VedicChart, body: VedicBody): { combust: boolean; separation: number; plain: string } | null {
  const sun = chart.byName.Sun;
  const orb = COMBUST_ORB[body.name];
  if (!sun || !orb || body.name === 'Sun') return null;
  let sep = Math.abs(body.longitude - sun.longitude);
  if (sep > 180) sep = 360 - sep;
  const combust = sep <= orb;
  return {
    combust,
    separation: sep,
    plain: combust
      ? `${body.name} sits ${sep.toFixed(1)} degrees from the Sun, inside the classical combustion range of ${orb} degrees. Jyotish reads a combust graha as working under someone else's agenda: the function still operates, but it has trouble being seen or acting on its own initiative.`
      : `${body.name} is ${sep.toFixed(1)} degrees from the Sun, clear of the ${orb} degree combustion range, so it acts in its own right.`,
  };
}

/* ---------------------------------------------------------------- */
/* Planetary war                                                     */
/* ---------------------------------------------------------------- */

export interface PlanetaryWar {
  winner: VedicPlanet;
  loser: VedicPlanet;
  separation: number;
  plain: string;
}

/** Two visible planets inside one degree. The one with the lower longitude wins. */
export function planetaryWars(chart: VedicChart): PlanetaryWar[] {
  const visible = chart.bodies.filter(b => !['Sun', 'Moon', 'Rahu', 'Ketu'].includes(b.name));
  const out: PlanetaryWar[] = [];
  for (let i = 0; i < visible.length; i++) {
    for (let j = i + 1; j < visible.length; j++) {
      const a = visible[i];
      const b = visible[j];
      let sep = Math.abs(a.longitude - b.longitude);
      if (sep > 180) sep = 360 - sep;
      if (sep <= 1) {
        const winner = a.longitude < b.longitude ? a : b;
        const loser = winner === a ? b : a;
        out.push({
          winner: winner.name,
          loser: loser.name,
          separation: sep,
          plain: `${a.name} and ${b.name} are within ${(sep * 60).toFixed(0)} arc minutes of each other, which classical texts call graha yuddha, a planetary war. ${winner.name} is read as carrying the position and ${loser.name} as having to work through it. In practice these two functions rarely operate separately in this chart.`,
        });
      }
    }
  }
  return out;
}

/* ---------------------------------------------------------------- */
/* Dig bala                                                          */
/* ---------------------------------------------------------------- */

/** Direction of full strength for each graha, expressed as a house cusp. */
const DIG_BALA_HOUSE: Partial<Record<VedicPlanet, number>> = {
  Jupiter: 1, Mercury: 1,   // east, the ascendant
  Sun: 10, Mars: 10,        // south, the midheaven
  Saturn: 7,                // west, the descendant
  Moon: 4, Venus: 4,        // north, the base
};

const DIRECTION_NAME: Record<number, string> = {
  1: 'the eastern point, the rising degree',
  4: 'the northern point, the base of the chart',
  7: 'the western point, the setting degree',
  10: 'the southern point, the top of the chart',
};

/**
 * Dig bala, computed the classical way rather than estimated from the house
 * number. Each graha has a point of full strength and the point opposite it is
 * its point of zero strength. Strength is the angular distance from the zero
 * point, scaled to the classical maximum of 60 virupas.
 *
 * The four cardinal points are taken from the lagna degree (rising degree, and
 * then 90, 180 and 270 degrees from it). That is the equal-cusp convention. A
 * chart using a quadrant house system would place the southern point at the
 * actual midheaven instead, which can shift a value by a few virupas.
 */
export function digBala(
  chart: VedicChart,
  body: VedicBody,
): { virupas: number; score: number; plain: string } | null {
  const best = DIG_BALA_HOUSE[body.name];
  if (!best) return null;
  if (chart.lagnaDegree === null || !chart.lagnaSign) return null;

  const lagnaLon = ((SIGN_ORDER.indexOf(chart.lagnaSign) * 30 + chart.lagnaDegree) % 360 + 360) % 360;
  // House 1 = lagna, house 4 = lagna + 90, house 7 = +180, house 10 = +270.
  const fullPoint = (lagnaLon + (best - 1) * 30) % 360;
  const zeroPoint = (fullPoint + 180) % 360;

  let arc = Math.abs(body.longitude - zeroPoint);
  if (arc > 180) arc = 360 - arc;
  const virupas = arc / 3; // 180 degrees maps to the classical 60 virupas
  const score = virupas / 60;

  const where = DIRECTION_NAME[best];
  const plain = `${body.name} gains its full directional strength at ${where}, and loses it at the point opposite. It sits ${arc.toFixed(1)} degrees from that weak point, which is ${virupas.toFixed(1)} of the 60 virupas dig bala can give. ${
    score > 0.75
      ? 'That is close to full directional strength, so this function acts without much friction.'
      : score < 0.25
        ? 'That is near the bottom of the range, so this function has to be worked at deliberately rather than run on instinct.'
        : 'That is mid-range, so this function works but not effortlessly.'
  }`;
  return { virupas, score, plain };
}

/* ---------------------------------------------------------------- */
/* Varga bala                                                        */
/* ---------------------------------------------------------------- */

const DIGNITY_WEIGHT: Record<VedicDignity, number> = {
  exalted: 1, moolatrikona: 0.85, 'own sign': 0.75, neutral: 0.4, debilitated: 0.1,
};

export interface VargaBala {
  checked: VargaKey[];
  strongIn: VargaKey[];
  weakIn: VargaKey[];
  score: number;
  plain: string;
}

export function vargaBala(chart: VedicChart, body: VedicBody, vargas: Partial<Record<VargaKey, VargaChart>>): VargaBala {
  const keys = Object.keys(vargas) as VargaKey[];
  const strongIn: VargaKey[] = [];
  const weakIn: VargaKey[] = [];
  let total = 0;
  let count = 0;

  for (const k of keys) {
    const v = vargas[k];
    const p = v?.placements.find(pl => pl.name === body.name);
    if (!p) continue;
    count++;
    total += DIGNITY_WEIGHT[p.dignity] ?? 0.4;
    if (p.dignity === 'exalted' || p.dignity === 'own sign' || p.dignity === 'moolatrikona') strongIn.push(k);
    if (p.dignity === 'debilitated') weakIn.push(k);
  }

  const score = count ? total / count : 0.4;
  const natalStrong = body.dignity === 'exalted' || body.dignity === 'own sign' || body.dignity === 'moolatrikona';
  const natalWeak = body.dignity === 'debilitated';

  let plain: string;
  if (strongIn.length >= 2) {
    plain = natalWeak
      ? `${body.name} is weak in the birth chart but picks up a dignified sign in ${strongIn.join(', ')}, so the divisional charts partly offset the birth chart rather than confirming it.`
      : natalStrong
        ? `${body.name} keeps a dignified sign in ${strongIn.join(', ')} as well as the birth chart, which classical texts read as real durability rather than a one-chart accident.`
        : `${body.name} is neutral in the birth chart but dignified in ${strongIn.join(', ')}, so the divisional charts add strength the birth chart alone does not show.`;
  } else if (weakIn.length >= 2) {
    plain = natalWeak
      ? `${body.name} loses dignity again in ${weakIn.join(' and ')}, so the birth chart difficulty is repeated rather than cancelled.`
      : `${body.name} is not weak in the birth chart, but it loses dignity in ${weakIn.join(' and ')}, so the divisional charts hold it back rather than backing it up.`;
  } else {
    plain = `${body.name} holds an average position across the divisional charts, so nothing there strongly amplifies or cancels its birth chart condition.`;
  }

  return { checked: keys, strongIn, weakIn, score, plain };
}

/* ---------------------------------------------------------------- */
/* Vargottama                                                        */
/* ---------------------------------------------------------------- */

/* ---------------------------------------------------------------- */
/* Combined condition index                                         */
/* ---------------------------------------------------------------- */

export interface PlanetCondition {
  body: VedicPlanet;
  sign: string;
  house: number | null;
  dignity: VedicDignity;
  avastha: { state: Avastha; plain: string };
  combust: { combust: boolean; separation: number; plain: string } | null;
  war: PlanetaryWar | null;
  dig: { virupas: number; score: number; plain: string } | null;
  retrograde: boolean;
  vargaBala: VargaBala;
  drishti: ReturnType<typeof drishtiBalance>;
  /** 0-100 condition index. Never called Shadbala. */
  index: number;
  band: 'strong' | 'workable' | 'strained';
  /** The components, always shown next to the number */
  components: { label: string; note: string }[];
}

const BAND = (i: number): PlanetCondition['band'] =>
  i >= 66 ? 'strong' : i >= 40 ? 'workable' : 'strained';

const AVASTHA_SCORE: Record<Avastha, number> = {
  infant: 0.35, adolescent: 0.6, adult: 1, old: 0.55, dead: 0.2,
};

export function planetCondition(
  chart: VedicChart,
  body: VedicBody,
  vargas: Partial<Record<VargaKey, VargaChart>>,
  signIdx: number,
  wars: PlanetaryWar[],
): PlanetCondition {
  const avastha = baladiAvastha(body, signIdx);
  const combust = combustion(chart, body);
  const dig = digBala(chart, body);
  const vb = vargaBala(chart, body, vargas);
  const dk = drishtiBalance(chart, body);
  const war = wars.find(w => w.winner === body.name || w.loser === body.name) || null;

  const parts: { weight: number; value: number }[] = [
    { weight: 0.26, value: DIGNITY_WEIGHT[body.dignity] ?? 0.4 },
    { weight: 0.18, value: AVASTHA_SCORE[avastha.state] },
    { weight: 0.16, value: vb.score },
    { weight: 0.14, value: dig ? dig.score : 0.5 },
    { weight: 0.14, value: dk.verdict === 'supported' ? 0.9 : dk.verdict === 'mixed' ? 0.55 : dk.verdict === 'pressured' ? 0.3 : 0.5 },
    { weight: 0.12, value: combust?.combust ? 0.25 : 0.8 },
  ];
  let raw = parts.reduce((s, p) => s + p.weight * p.value, 0);
  if (war && war.loser === body.name) raw *= 0.85;
  if (body.retrograde && !['Rahu', 'Ketu'].includes(body.name)) raw = Math.min(1, raw * 1.05);

  const index = Math.round(Math.max(0, Math.min(1, raw)) * 100);

  const components = [
    { label: 'Sign dignity', note: body.dignity === 'neutral' ? `${body.name} is in a neutral sign by classical dignity.` : `${body.name} is ${body.dignity} in ${body.sign}.` },
    { label: 'Maturity state', note: avastha.plain },
    { label: 'Divisional durability', note: vb.plain },
    ...(dig ? [{ label: 'Directional strength', note: dig.plain }] : []),
    { label: 'Attention from other grahas', note: dk.plain },
    ...(combust ? [{ label: 'Closeness to the Sun', note: combust.plain }] : []),
    ...(war ? [{ label: 'Planetary war', note: war.plain }] : []),
    ...(body.retrograde && !['Rahu', 'Ketu'].includes(body.name)
      ? [{ label: 'Retrograde', note: `${body.name} is retrograde. Jyotish calls this cheshta bala and reads it as extra force applied inward: the function is strong but does things its own way rather than the expected way.` }]
      : []),
  ];

  return {
    body: body.name,
    sign: body.sign,
    house: body.house,
    dignity: body.dignity,
    avastha,
    combust,
    war,
    dig,
    retrograde: body.retrograde,
    vargaBala: vb,
    drishti: dk,
    index,
    band: BAND(index),
    components,
  };
}

export const CONDITION_INDEX_NOTE =
  'This condition index combines the classical strength markers Jyotish actually uses: sign dignity, the maturity state by degree, whether the graha holds up across the divisional charts, directional strength measured in virupas from the cardinal points, which grahas are looking at it, closeness to the Sun, planetary war and retrograde motion. It is not the full six-fold Shadbala, because that also needs sunrise and seasonal data, so it is reported as a condition index and every component is shown next to it.';

export function buildConditions(
  chart: VedicChart,
  vargas: Partial<Record<VargaKey, VargaChart>>,
): PlanetCondition[] {
  const wars = planetaryWars(chart);
  const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  return chart.bodies
    .map(b => planetCondition(chart, b, vargas, SIGNS.indexOf(b.sign), wars))
    .sort((a, b) => b.index - a.index);
}

export { buildVarga };
