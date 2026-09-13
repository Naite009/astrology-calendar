/**
 * The canonical composite chart calculator.
 *
 * A composite chart is a midpoint chart: every position is the midpoint of the
 * two natal positions. It describes the relationship as its own symbolic
 * entity. It is NOT synastry (person-to-person contacts) and it is not either
 * person's chart.
 *
 * What this module owns, so no screen has to work it out again:
 *   - the midpoint convention, including wraparound and the exact-opposition
 *     ambiguity, which is resolved deterministically and flagged;
 *   - composite aspects between the major bodies (and the angles when valid),
 *     using the shared orb table, with exact orbs and sign-vs-degree layers;
 *   - composite angles, and *derived* houses only when the geometry actually
 *     supports them (composite MC + mean birth latitude). Never invented;
 *   - a weighted element/modality balance, reported as a pattern rather than a
 *     psychological verdict.
 */

import type { NatalChart } from '@/hooks/useNatalChart';
import { signDegreesToLongitude } from '@/lib/houseCalculations';
import { getEffectiveOrb, MAJOR_ASPECTS } from '@/lib/aspectOrbs';
import {
  analyzeSignVsDegree,
  ZODIAC_ORDER,
  SIGN_ELEMENT,
  SIGN_MODALITY,
  type Element,
  type Modality,
  type SignVsDegreeAnalysis,
} from '@/lib/aspects/outOfSign';
import {
  houseCuspsFromBasis,
  ramcFromMc,
  MEAN_OBLIQUITY,
} from '@/lib/placidusHouses';

/** The bodies a composite reading is built from. Majors only. */
export const COMPOSITE_BODIES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
] as const;

/** Secondary points: shown, never allowed to headline a composite reading. */
export const COMPOSITE_SECONDARY_POINTS = ['NorthNode', 'SouthNode', 'Chiron'] as const;

export const COMPOSITE_ANGLES = ['Ascendant', 'Midheaven'] as const;

const norm360 = (x: number): number => ((x % 360) + 360) % 360;

/** How much each body counts toward the element/modality picture. */
export const COMPOSITE_BALANCE_WEIGHT: Record<string, number> = {
  Sun: 3, Moon: 3,
  Ascendant: 2.5, Midheaven: 2,
  Mercury: 2, Venus: 2, Mars: 2,
  Jupiter: 1, Saturn: 1,
  Uranus: 0.5, Neptune: 0.5, Pluto: 0.5,
};

/** Ranking weight for composite aspects. */
const BODY_WEIGHT: Record<string, number> = {
  Sun: 1, Moon: 1, Ascendant: 0.9, Midheaven: 0.6,
  Mercury: 0.85, Venus: 0.85, Mars: 0.85,
  Jupiter: 0.7, Saturn: 0.7,
  Uranus: 0.45, Neptune: 0.45, Pluto: 0.45,
  NorthNode: 0.4, SouthNode: 0.35, Chiron: 0.35,
};

const ASPECT_WEIGHT: Record<string, number> = {
  conjunction: 1, opposition: 0.85, trine: 0.85, square: 0.85, sextile: 0.6,
};

export type CompositeAspectTone = 'flowing' | 'tense' | 'fusion';

export interface CompositePosition {
  body: string;
  longitude: number;
  sign: string;
  /** Whole degrees within the sign. */
  degree: number;
  minutes: number;
  /** Decimal degrees within the sign. */
  degreeInSign: number;
  element: Element;
  modality: Modality;
  /** Only set when derived composite houses are available. */
  house: number | null;
  /** The two natal longitudes this midpoint came from. */
  sourceA: number;
  sourceB: number;
  /**
   * True when the two source positions were exactly opposite, so both midpoints
   * were equally valid and the documented convention had to pick one.
   */
  midpointAmbiguous: boolean;
  /** "12°34' Taurus" */
  label: string;
}

export interface CompositeAspect {
  fromBody: string;
  toBody: string;
  aspect: string;
  symbol: string;
  aspectAngle: number;
  separation: number;
  orb: number;
  maxOrb: number;
  closeness: number;
  tone: CompositeAspectTone;
  weight: number;
  /** True when both bodies are major planets or angles. */
  isMajorContact: boolean;
  fromSign: string;
  toSign: string;
  signVsDegree: SignVsDegreeAnalysis;
  isOutOfSign: boolean;
  /** "Composite Moon trine composite Saturn (1.4° orb)" */
  label: string;
}

export type CompositeHouseMethod = 'derived-from-mc-and-latitude' | 'unavailable';

export interface CompositeAngles {
  /** Midpoint of the two natal MCs. */
  midheaven: CompositePosition | null;
  /** Midpoint of the two natal Ascendants (the traditional shortcut). */
  ascendantMidpoint: CompositePosition | null;
  /** Ascendant implied by the composite MC at the mean birth latitude. */
  ascendantDerived: CompositePosition | null;
  /** The Ascendant the reading uses: derived when available, else the midpoint. */
  ascendant: CompositePosition | null;
  housesAvailable: boolean;
  houseMethod: CompositeHouseMethod;
  /** Cusp longitudes, index 1..12, only when housesAvailable. */
  cuspLongitudes: number[] | null;
  /** Mean of the two birth latitudes, when both were stored. */
  meanLatitude: number | null;
  /** Degrees between the derived and midpoint Ascendant, when both exist. */
  ascendantDisagreement: number | null;
  /** Plain-language explanation of what was and was not possible. */
  note: string;
}

export interface CompositeBalance {
  elements: Record<Element, number>;
  modalities: Record<Modality, number>;
  totalWeight: number;
  dominantElement: Element | null;
  dominantElementShare: number;
  dominantModality: Modality | null;
  /** Bodies behind the dominant element, heaviest first. */
  dominantElementBodies: string[];
  /** How the weighting works, so the number is never a black box. */
  note: string;
}

export interface CompositeHouseEmphasis {
  house: number;
  bodies: string[];
}

export interface CompositeObservation {
  text: string;
  /** Observations are never conclusions on their own. */
  isConclusion: false;
}

export type CompositeMethod = 'composite' | 'davison';

export interface CompositeModel {
  method: CompositeMethod;
  person1: string;
  person2: string;
  name: string;
  positions: Record<string, CompositePosition>;
  aspects: CompositeAspect[];
  /** Major-body aspects, tightest and heaviest first. */
  topAspects: CompositeAspect[];
  angles: CompositeAngles;
  balance: CompositeBalance;
  houseEmphasis: CompositeHouseEmphasis[];
  observations: CompositeObservation[];
  /** Method sentence for the UI and the PDF. */
  methodNote: string;
}

// ── midpoints ────────────────────────────────────────────────────────────────

export interface MidpointResult {
  longitude: number;
  /** True at an exact 180° separation, where both midpoints are equally valid. */
  ambiguous: boolean;
}

/**
 * The shorter-arc midpoint of two ecliptic longitudes.
 *
 * Convention, stated explicitly so it can never be an accident:
 *   - normally the midpoint of the shorter arc between the two positions;
 *   - at an exact 180° separation there is no shorter arc, so the midpoint is
 *     taken on the arc measured FORWARD (in zodiacal order) from the LOWER of
 *     the two longitudes, and `ambiguous` is set so the reading can say so.
 *     The opposite point is equally valid and is 180° away.
 */
export function compositeMidpoint(lonA: number, lonB: number): MidpointResult {
  const a = norm360(lonA);
  const b = norm360(lonB);
  const forward = norm360(b - a);

  if (Math.abs(forward - 180) < 1e-9) {
    const lower = Math.min(a, b);
    return { longitude: norm360(lower + 90), ambiguous: true };
  }

  const signed = forward > 180 ? forward - 360 : forward;
  return { longitude: norm360(a + signed / 2), ambiguous: false };
}

function positionFromLongitude(
  body: string,
  longitude: number,
  sourceA: number,
  sourceB: number,
  ambiguous: boolean,
): CompositePosition {
  const lon = norm360(longitude);
  const idx = Math.floor(lon / 30) % 12;
  const sign = ZODIAC_ORDER[idx];
  const degreeInSign = lon - idx * 30;
  const degree = Math.floor(degreeInSign);
  const minutes = Math.min(59, Math.round((degreeInSign - degree) * 60));

  return {
    body,
    longitude: Math.round(lon * 10000) / 10000,
    sign,
    degree,
    minutes,
    degreeInSign: Math.round(degreeInSign * 10000) / 10000,
    element: SIGN_ELEMENT[sign],
    modality: SIGN_MODALITY[sign],
    house: null,
    sourceA: Math.round(norm360(sourceA) * 10000) / 10000,
    sourceB: Math.round(norm360(sourceB) * 10000) / 10000,
    midpointAmbiguous: ambiguous,
    label: `${degree}°${String(minutes).padStart(2, '0')}' ${sign}`,
  };
}

/**
 * One natal body as an absolute longitude, or null when it is not stored.
 * Arcseconds are included when present so midpoints stay accurate to the second.
 */
function withSeconds(base: number, seconds?: number): number {
  const s = typeof seconds === 'number' && Number.isFinite(seconds) ? seconds : 0;
  return ((base + s / 3600) % 360 + 360) % 360;
}

function natalLongitude(chart: NatalChart, body: string): number | null {
  if (body === 'Ascendant') {
    const cusp = chart.houseCusps?.house1 ?? chart.planets?.Ascendant;
    if (!cusp?.sign) return null;
    return withSeconds(
      signDegreesToLongitude(cusp.sign, cusp.degree, cusp.minutes),
      (cusp as { seconds?: number }).seconds,
    );
  }
  if (body === 'Midheaven') {
    const mc = chart.houseCusps?.house10;
    if (!mc?.sign) return null;
    return withSeconds(
      signDegreesToLongitude(mc.sign, mc.degree, mc.minutes),
      (mc as { seconds?: number }).seconds,
    );
  }
  const pos = chart.planets?.[body as keyof typeof chart.planets] as
    | { sign?: string; degree?: number; minutes?: number; seconds?: number }
    | undefined;
  if (!pos?.sign) return null;
  return withSeconds(signDegreesToLongitude(pos.sign, pos.degree ?? 0, pos.minutes ?? 0), pos.seconds);
}

// ── angles and houses ────────────────────────────────────────────────────────

const HOUSES_UNAVAILABLE_NOTE =
  'Composite houses are not shown. They can only be derived when both charts store a birth latitude and a valid Midheaven, and that data is missing here, so this is read as a sign-and-aspect chart. House positions are not estimated.';

/**
 * Composite angles, and derived houses when the geometry supports them.
 *
 * Midpointing all twelve natal cusps is not valid geometry: the results are not
 * a consistent house frame. What is valid is to take the composite MC (midpoint
 * of the two natal MCs) as a meridian, and derive the Ascendant and the
 * intermediate cusps for the mean birth latitude. That is what happens here,
 * and only when both latitude and both MCs are available.
 */
export function calculateCompositeAngles(chart1: NatalChart, chart2: NatalChart): CompositeAngles {
  const mc1 = natalLongitude(chart1, 'Midheaven');
  const mc2 = natalLongitude(chart2, 'Midheaven');
  const asc1 = natalLongitude(chart1, 'Ascendant');
  const asc2 = natalLongitude(chart2, 'Ascendant');

  const midheaven =
    mc1 !== null && mc2 !== null
      ? (() => {
          const m = compositeMidpoint(mc1, mc2);
          return positionFromLongitude('Midheaven', m.longitude, mc1, mc2, m.ambiguous);
        })()
      : null;

  const ascendantMidpoint =
    asc1 !== null && asc2 !== null
      ? (() => {
          const m = compositeMidpoint(asc1, asc2);
          return positionFromLongitude('Ascendant', m.longitude, asc1, asc2, m.ambiguous);
        })()
      : null;

  const lat1 = typeof chart1.latitude === 'number' ? chart1.latitude : null;
  const lat2 = typeof chart2.latitude === 'number' ? chart2.latitude : null;
  const meanLatitude = lat1 !== null && lat2 !== null ? (lat1 + lat2) / 2 : null;

  if (!midheaven || meanLatitude === null || Math.abs(meanLatitude) >= 66.5) {
    return {
      midheaven,
      ascendantMidpoint,
      ascendantDerived: null,
      ascendant: ascendantMidpoint,
      housesAvailable: false,
      houseMethod: 'unavailable',
      cuspLongitudes: null,
      meanLatitude,
      ascendantDisagreement: null,
      note: HOUSES_UNAVAILABLE_NOTE,
    };
  }

  const obliquity = MEAN_OBLIQUITY;
  const ramc = ramcFromMc(midheaven.longitude, obliquity);
  const set = houseCuspsFromBasis({ gastHours: 0, ramc, obliquity }, meanLatitude, 'placidus');

  const ascendantDerived = positionFromLongitude(
    'Ascendant',
    set.ascendant,
    asc1 ?? set.ascendant,
    asc2 ?? set.ascendant,
    false,
  );

  let disagreement: number | null = null;
  if (ascendantMidpoint) {
    let diff = Math.abs(ascendantDerived.longitude - ascendantMidpoint.longitude) % 360;
    if (diff > 180) diff = 360 - diff;
    disagreement = Math.round(diff * 10) / 10;
  }

  const baseNote = `Composite houses are derived, not midpointed: the composite Midheaven (${midheaven.label}) is treated as the meridian and the cusps are calculated for the mean birth latitude (${meanLatitude.toFixed(2)}°) using ${set.systemUsed === 'placidus' ? 'Placidus' : set.systemUsed}. Midpointing all twelve natal cusps would not produce a consistent house frame, so it is not done.`;
  const disagreementNote =
    disagreement !== null && disagreement >= 2
      ? ` The simpler Ascendant-midpoint method gives ${ascendantMidpoint?.label} instead, ${disagreement.toFixed(1)}° away. The derived Ascendant is used because it belongs to the same frame as the houses; house placements close to a cusp should be treated as borderline.`
      : '';

  return {
    midheaven,
    ascendantMidpoint,
    ascendantDerived,
    ascendant: ascendantDerived,
    housesAvailable: true,
    houseMethod: 'derived-from-mc-and-latitude',
    cuspLongitudes: set.cusps,
    meanLatitude,
    ascendantDisagreement: disagreement,
    note: baseNote + disagreementNote,
  };
}

/** House number for a longitude against a cusp array (index 1..12). */
export function houseForCusps(longitude: number, cusps: number[] | null): number | null {
  if (!cusps || cusps.length < 13) return null;
  const lon = norm360(longitude);
  for (let i = 1; i <= 12; i++) {
    const start = norm360(cusps[i]);
    let end = norm360(cusps[i === 12 ? 1 : i + 1]);
    if (end <= start) end += 360;
    let d = lon;
    if (d < start) d += 360;
    if (d >= start && d < end) return i;
  }
  return null;
}

// ── aspects ──────────────────────────────────────────────────────────────────

const MAJOR_SET = new Set<string>([...COMPOSITE_BODIES, ...COMPOSITE_ANGLES]);

function toneFor(aspect: string): CompositeAspectTone {
  if (aspect === 'conjunction') return 'fusion';
  if (aspect === 'trine' || aspect === 'sextile') return 'flowing';
  return 'tense';
}

export function calculateCompositeAspects(
  positions: Record<string, CompositePosition>,
): CompositeAspect[] {
  const names = Object.keys(positions);
  const out: CompositeAspect[] = [];

  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const a = positions[names[i]];
      const b = positions[names[j]];
      // The Ascendant and MC are 90°-ish by construction; that is frame
      // geometry, not a relationship statement.
      if (MAJOR_SET.has(a.body) && MAJOR_SET.has(b.body) &&
          ['Ascendant', 'Midheaven'].includes(a.body) &&
          ['Ascendant', 'Midheaven'].includes(b.body)) continue;
      // Nodes are exactly opposite each other by definition.
      if ((a.body === 'NorthNode' && b.body === 'SouthNode') ||
          (a.body === 'SouthNode' && b.body === 'NorthNode')) continue;

      let separation = Math.abs(a.longitude - b.longitude) % 360;
      if (separation > 180) separation = 360 - separation;

      for (const def of MAJOR_ASPECTS) {
        const maxOrb = getEffectiveOrb(a.body, b.body, def.name);
        const orb = Math.abs(separation - def.angle);
        if (orb > maxOrb) continue;

        const closeness = Math.max(0, 1 - orb / maxOrb);
        const weight =
          (((BODY_WEIGHT[a.body] ?? 0.3) + (BODY_WEIGHT[b.body] ?? 0.3)) / 2) *
          (ASPECT_WEIGHT[def.name] ?? 0.5) *
          (0.45 + 0.55 * closeness);
        const rounded = Math.round(orb * 10) / 10;

        const signVsDegree = analyzeSignVsDegree({
          labelA: `composite ${a.body}`,
          signA: a.sign,
          degreeA: a.degreeInSign,
          labelB: `composite ${b.body}`,
          signB: b.sign,
          degreeB: b.degreeInSign,
          aspect: def.name,
          aspectAngle: def.angle,
          separation,
          orb,
        });

        out.push({
          fromBody: a.body,
          toBody: b.body,
          aspect: def.name,
          symbol: def.symbol,
          aspectAngle: def.angle,
          separation: Math.round(separation * 100) / 100,
          orb: rounded,
          maxOrb,
          closeness: Math.round(closeness * 100) / 100,
          tone: toneFor(def.name),
          weight: Math.round(weight * 1000) / 1000,
          isMajorContact: MAJOR_SET.has(a.body) && MAJOR_SET.has(b.body),
          fromSign: a.sign,
          toSign: b.sign,
          signVsDegree,
          isOutOfSign: signVsDegree.isOutOfSign,
          label: `Composite ${a.body} ${def.name} composite ${b.body} (${rounded.toFixed(1)}° orb${
            signVsDegree.isOutOfSign ? ', out of sign' : ''
          })`,
        });
        break; // tightest definition wins for a pair
      }
    }
  }

  return out.sort((x, y) => y.weight - x.weight);
}

/** The composite contacts a main conclusion may lean on. */
export function majorCompositeAspects(aspects: CompositeAspect[]): CompositeAspect[] {
  return aspects.filter((a) => a.isMajorContact);
}

export function aspectsInvolving(aspects: CompositeAspect[], ...bodies: string[]): CompositeAspect[] {
  return aspects.filter((a) => bodies.includes(a.fromBody) || bodies.includes(a.toBody));
}

export function aspectBetween(
  aspects: CompositeAspect[],
  groupA: string[],
  groupB: string[],
): CompositeAspect[] {
  return aspects.filter(
    (a) =>
      (groupA.includes(a.fromBody) && groupB.includes(a.toBody)) ||
      (groupB.includes(a.fromBody) && groupA.includes(a.toBody)),
  );
}

// ── balance ──────────────────────────────────────────────────────────────────

const BALANCE_NOTE =
  'Element and modality totals here are weighted, not a headcount: the Sun and Moon count most, then the Ascendant and Midheaven, then Mercury, Venus and Mars, then Jupiter and Saturn, and Uranus, Neptune and Pluto count least because a whole generation shares them. A balance figure is background texture; on its own it is not a conclusion about how the relationship feels.';

export function calculateCompositeBalance(
  positions: Record<string, CompositePosition>,
): CompositeBalance {
  const elements: Record<Element, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const modalities: Record<Modality, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  const perElementBodies: Record<Element, Array<{ body: string; w: number }>> = {
    Fire: [], Earth: [], Air: [], Water: [],
  };
  let totalWeight = 0;

  for (const pos of Object.values(positions)) {
    const w = COMPOSITE_BALANCE_WEIGHT[pos.body] ?? 0;
    if (!w) continue; // secondary points do not shape the balance picture
    elements[pos.element] += w;
    modalities[pos.modality] += w;
    perElementBodies[pos.element].push({ body: pos.body, w });
    totalWeight += w;
  }

  const elementEntries = (Object.entries(elements) as Array<[Element, number]>)
    .sort((a, b) => b[1] - a[1]);
  const modalityEntries = (Object.entries(modalities) as Array<[Modality, number]>)
    .sort((a, b) => b[1] - a[1]);

  const topElement = elementEntries[0];
  const tiedElement = elementEntries[1] && Math.abs(elementEntries[1][1] - topElement[1]) < 0.01;
  const topModality = modalityEntries[0];
  const tiedModality = modalityEntries[1] && Math.abs(modalityEntries[1][1] - topModality[1]) < 0.01;

  const share = totalWeight > 0 ? topElement[1] / totalWeight : 0;

  return {
    elements,
    modalities,
    totalWeight: Math.round(totalWeight * 100) / 100,
    dominantElement: tiedElement || share < 0.3 ? null : topElement[0],
    dominantElementShare: Math.round(share * 100) / 100,
    dominantModality: tiedModality ? null : topModality[0],
    dominantElementBodies: perElementBodies[topElement[0]]
      .sort((a, b) => b.w - a.w)
      .map((x) => x.body),
    note: BALANCE_NOTE,
  };
}

// ── observations (never conclusions) ────────────────────────────────────────

function collectObservations(
  positions: Record<string, CompositePosition>,
  aspects: CompositeAspect[],
): CompositeObservation[] {
  const out: CompositeObservation[] = [];
  const sun = positions.Sun;
  const moon = positions.Moon;
  const venus = positions.Venus;
  const mars = positions.Mars;

  const aspectBetweenBodies = (a: string, b: string) =>
    aspects.find(
      (x) => (x.fromBody === a && x.toBody === b) || (x.fromBody === b && x.toBody === a),
    );

  if (sun && moon && sun.sign === moon.sign) {
    const asp = aspectBetweenBodies('Sun', 'Moon');
    out.push({
      text: `Composite Sun and Moon are both in ${sun.sign} (${sun.label} and ${moon.label}). Sharing a sign is an observation about tone, not an aspect: ${
        asp ? `they are also ${asp.aspect} by degree, ${asp.orb.toFixed(1)}° from exact, which is the part that carries weight.` : 'by degree they are not close enough to form an aspect, so this stays a background note.'
      }`,
      isConclusion: false,
    });
  }
  if (venus && mars && venus.sign === mars.sign) {
    const asp = aspectBetweenBodies('Venus', 'Mars');
    out.push({
      text: `Composite Venus and Mars are both in ${venus.sign} (${venus.label} and ${mars.label}). ${
        asp ? `They are also ${asp.aspect} by degree, ${asp.orb.toFixed(1)}° from exact.` : 'By degree they form no aspect, so warmth and drive simply share a flavour rather than being linked.'
      }`,
      isConclusion: false,
    });
  }

  const ambiguous = Object.values(positions).filter((p) => p.midpointAmbiguous);
  if (ambiguous.length) {
    out.push({
      text: `${ambiguous
        .map((p) => p.body)
        .join(', ')}: the two natal positions were exactly opposite, so both midpoints are equally valid. The chart shows the midpoint measured forward from the earlier degree; the alternative sits 180° away in ${ambiguous
        .map((p) => ZODIAC_ORDER[(Math.floor(p.longitude / 30) + 6) % 12])
        .join(', ')}. Read anything resting on it as provisional.`,
      isConclusion: false,
    });
  }

  return out;
}

function houseEmphasisFrom(positions: Record<string, CompositePosition>): CompositeHouseEmphasis[] {
  const byHouse = new Map<number, string[]>();
  for (const pos of Object.values(positions)) {
    if (pos.house === null) continue;
    if (!(COMPOSITE_BODIES as readonly string[]).includes(pos.body)) continue;
    const list = byHouse.get(pos.house) ?? [];
    list.push(pos.body);
    byHouse.set(pos.house, list);
  }
  return [...byHouse.entries()]
    .filter(([, bodies]) => bodies.length >= 3)
    .map(([house, bodies]) => ({ house, bodies }))
    .sort((a, b) => b.bodies.length - a.bodies.length);
}

const COMPOSITE_METHOD_NOTE =
  'Composite method: every position is the midpoint of the two natal positions, so this chart describes the relationship itself as a third thing rather than either person. It is read separately from synastry, which is about how the two people affect each other.';

const DAVISON_METHOD_NOTE =
  'Davison method: positions are the real planetary positions for the midpoint in time between the two births, so this chart has a moment of its own rather than being an average of degrees.';

/** Assemble a model from a finished set of positions. Shared with Davison. */
export function compositeModelFromPositions(
  positions: Record<string, CompositePosition>,
  angles: CompositeAngles,
  meta: { method: CompositeMethod; person1: string; person2: string },
): CompositeModel {
  const withHouses: Record<string, CompositePosition> = {};
  for (const [key, pos] of Object.entries(positions)) {
    withHouses[key] = { ...pos, house: houseForCusps(pos.longitude, angles.cuspLongitudes) };
  }

  const aspects = calculateCompositeAspects(withHouses);
  const majors = majorCompositeAspects(aspects);

  return {
    method: meta.method,
    person1: meta.person1,
    person2: meta.person2,
    name: `${meta.person1} & ${meta.person2} ${meta.method === 'composite' ? 'Composite' : 'Davison'}`,
    positions: withHouses,
    aspects,
    topAspects: majors.slice(0, 8),
    angles,
    balance: calculateCompositeBalance(withHouses),
    houseEmphasis: houseEmphasisFrom(withHouses),
    observations: collectObservations(withHouses, aspects),
    methodNote: meta.method === 'composite' ? COMPOSITE_METHOD_NOTE : DAVISON_METHOD_NOTE,
  };
}

/** The canonical composite model for two natal charts. */
export function calculateCompositeModel(chart1: NatalChart, chart2: NatalChart): CompositeModel {
  const angles = calculateCompositeAngles(chart1, chart2);
  const positions: Record<string, CompositePosition> = {};

  for (const body of [...COMPOSITE_BODIES, ...COMPOSITE_SECONDARY_POINTS]) {
    const a = natalLongitude(chart1, body);
    const b = natalLongitude(chart2, body);
    if (a === null || b === null) continue;
    const m = compositeMidpoint(a, b);
    positions[body] = positionFromLongitude(body, m.longitude, a, b, m.ambiguous);
  }

  // Derive the South Node opposite the North Node when it is not stored.
  if (positions.NorthNode && !positions.SouthNode) {
    const opposite = norm360(positions.NorthNode.longitude + 180);
    positions.SouthNode = positionFromLongitude(
      'SouthNode',
      opposite,
      positions.NorthNode.sourceA + 180,
      positions.NorthNode.sourceB + 180,
      positions.NorthNode.midpointAmbiguous,
    );
  }

  if (angles.ascendant) positions.Ascendant = angles.ascendant;
  if (angles.midheaven) positions.Midheaven = angles.midheaven;

  return compositeModelFromPositions(positions, angles, {
    method: 'composite',
    person1: chart1.name,
    person2: chart2.name,
  });
}

/** Symbols for composite bodies and angles. */
export function compositeBodySymbol(body: string): string {
  const symbols: Record<string, string> = {
    Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
    Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
    Ascendant: 'AC', Midheaven: 'MC', NorthNode: '☊', SouthNode: '☋', Chiron: '⚷',
  };
  return symbols[body] || body.charAt(0);
}

const DAVISON_HOUSES_NOTE =
  'Davison houses are not shown here. Valid Davison angles need the midpoint moment together with the midpoint location on the globe, and the stored charts do not carry a resolved midpoint place, so this is read as a sign-and-aspect chart. House positions are not estimated.';

/**
 * A Davison model from already-computed ephemeris longitudes.
 * Aspects, balance and observations then follow the same rules as composite.
 */
export function davisonModelFromLongitudes(
  longitudes: Record<string, number>,
  person1: string,
  person2: string,
): CompositeModel {
  const positions: Record<string, CompositePosition> = {};
  for (const [body, lon] of Object.entries(longitudes)) {
    if (typeof lon !== 'number' || !Number.isFinite(lon)) continue;
    positions[body] = positionFromLongitude(body, norm360(lon), norm360(lon), norm360(lon), false);
  }
  const angles: CompositeAngles = {
    midheaven: null,
    ascendantMidpoint: null,
    ascendantDerived: null,
    ascendant: null,
    housesAvailable: false,
    houseMethod: 'unavailable',
    cuspLongitudes: null,
    meanLatitude: null,
    ascendantDisagreement: null,
    note: DAVISON_HOUSES_NOTE,
  };
  return compositeModelFromPositions(positions, angles, { method: 'davison', person1, person2 });
}
