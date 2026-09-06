/**
 * Natal chart calculation on top of the shared pipeline:
 *
 *   BirthInput ─► birthDataNormalization (local civil time + IANA zone + place)
 *              ─► one UTC instant + precise coordinates
 *              ─► ephemerisEngine (bodies, angles, houses, Vertex, Part of Fortune)
 *              ─► sign/degree/minute/second records the rest of the app stores.
 *
 * Nothing here parses dates, guesses zones or reads region tables. If the
 * moment cannot be normalized, or the place is not precise, the result says
 * so instead of producing a number.
 */

import {
  type BirthInput,
  type BirthMoment,
  resolveBirthMoment,
  resolveBirthMomentSync,
} from './birthDataNormalization';
import {
  ALL_BODY_KEYS,
  computeAngles,
  computeBodies,
  longitudeToSignPosition,
  norm360,
  partOfFortuneLongitude,
  type AnglesResult,
  type BodyKey,
  type BodyResult,
  type BodySource,
  type EphemerisSettings,
} from './ephemerisEngine';

export interface CalculatedPosition {
  sign: string;
  degree: number;
  minutes: number;
  seconds: number;
  isRetrograde?: boolean;
  /** Unrounded tropical longitude, degrees 0-360. */
  longitude: number;
  source: BodySource | 'derived';
  variant?: string;
}

export interface CalculatedCusp {
  sign: string;
  degree: number;
  minutes: number;
  seconds: number;
  longitude: number;
}

export type CuspKey = `house${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12}`;

export interface NatalCalculation {
  moment: BirthMoment;
  /** Only bodies and points that were actually calculated. */
  positions: Record<string, CalculatedPosition>;
  /** Null when angles could not be calculated (see anglesReason). */
  houseCusps: Record<CuspKey, CalculatedCusp> | null;
  angles: AnglesResult | null;
  /** Bodies that were requested but are not available, with the reason. */
  unavailable: Array<{ key: string; reason: string }>;
  /** Why Ascendant, MC, houses, Vertex and Part of Fortune were skipped. */
  anglesReason: string | null;
  settings: EphemerisSettings;
}

const toPosition = (r: BodyResult & { ok: true }): CalculatedPosition => {
  const sp = longitudeToSignPosition(r.longitude);
  return {
    sign: sp.sign,
    degree: sp.degree,
    minutes: sp.minutes,
    seconds: sp.seconds,
    isRetrograde: r.retrograde,
    longitude: r.longitude,
    source: r.source,
    ...(r.variant ? { variant: r.variant } : {}),
  };
};

const derived = (longitude: number, variant?: string): CalculatedPosition => {
  const sp = longitudeToSignPosition(longitude);
  return { sign: sp.sign, degree: sp.degree, minutes: sp.minutes, seconds: sp.seconds, longitude: norm360(longitude), source: 'derived', ...(variant ? { variant } : {}) };
};

const anglesBlockedReason = (moment: BirthMoment): string | null => {
  if (moment.status !== 'ok' || !moment.utc) return 'The birth moment could not be normalized.';
  if (moment.timeAssumed) return 'No birth time was given, so the Ascendant, Midheaven, houses, Vertex and Part of Fortune are not calculated.';
  if (!moment.place) return 'The birthplace could not be resolved to coordinates, so angles and houses are not calculated.';
  if (moment.place.confidence === 'low') return `Only a region ("${moment.place.canonicalName}") was recognized, not a town, so angles and houses are not calculated.`;
  if (!moment.canComputeAngles) return 'Angles and houses need a precise birthplace and a real birth time.';
  return null;
};

/**
 * Calculate from an already-normalized moment. Pure and synchronous.
 * `bodies` defaults to everything the engine knows.
 */
export const calculateNatalFromMoment = (
  moment: BirthMoment,
  bodies: BodyKey[] = ALL_BODY_KEYS,
): NatalCalculation => {
  const settings = moment.settings;
  const positions: Record<string, CalculatedPosition> = {};
  const unavailable: Array<{ key: string; reason: string }> = [];

  if (moment.status !== 'ok' || !moment.utc) {
    return {
      moment, positions, houseCusps: null, angles: null,
      unavailable: bodies.map(key => ({ key, reason: moment.warnings[0] || 'The birth moment could not be normalized.' })),
      anglesReason: anglesBlockedReason(moment),
      settings,
    };
  }

  const utc = moment.utc;
  const results = computeBodies(utc, bodies, settings);
  for (const key of bodies) {
    const r = results[key];
    if (r.ok === true) positions[key] = toPosition(r);
    else unavailable.push({ key, reason: r.reason });
  }

  const anglesReason = anglesBlockedReason(moment);
  let angles: AnglesResult | null = null;
  let houseCusps: NatalCalculation['houseCusps'] = null;

  if (!anglesReason && moment.place) {
    angles = computeAngles(utc, moment.place.latitude, moment.place.longitude, settings.houseSystem);
    positions.Ascendant = derived(angles.ascendant);
    positions.Midheaven = derived(angles.mc);
    positions.Vertex = derived(angles.vertex);
    houseCusps = {} as Record<CuspKey, CalculatedCusp>;
    for (let h = 1; h <= 12; h++) {
      const lon = angles.cusps[h];
      const sp = longitudeToSignPosition(lon);
      houseCusps[`house${h}` as CuspKey] = { sign: sp.sign, degree: sp.degree, minutes: sp.minutes, seconds: sp.seconds, longitude: norm360(lon) };
    }
    const sun = results.Sun;
    const moon = results.Moon;
    if (sun?.ok && moon?.ok) {
      const pof = partOfFortuneLongitude(angles.ascendant, sun.longitude, moon.longitude);
      positions.PartOfFortune = derived(pof.longitude, `${pof.sect} formula`);
    } else {
      unavailable.push({ key: 'PartOfFortune', reason: 'Needs Sun, Moon and Ascendant.' });
    }
  }

  return { moment, positions, houseCusps, angles, unavailable, anglesReason, settings };
};

/** Synchronous: stored place metadata or offline city tables only. */
export const calculateNatalFromInput = (input: BirthInput, bodies?: BodyKey[]): NatalCalculation =>
  calculateNatalFromMoment(resolveBirthMomentSync(input), bodies);

/** Asynchronous: may consult the geocoder for an unknown place. */
export const calculateNatalFromInputAsync = async (
  input: BirthInput,
  options: { network?: boolean; signal?: AbortSignal } = {},
  bodies?: BodyKey[],
): Promise<NatalCalculation> =>
  calculateNatalFromMoment(await resolveBirthMoment(input, options), bodies);

/**
 * Strip the calculation-only fields so a position can be stored on a chart
 * record exactly like a typed or imported one.
 */
export const toStoredPosition = (p: CalculatedPosition): { sign: string; degree: number; minutes: number; seconds: number; isRetrograde?: boolean } => ({
  sign: p.sign,
  degree: p.degree,
  minutes: p.minutes,
  seconds: p.seconds,
  ...(p.isRetrograde !== undefined ? { isRetrograde: p.isRetrograde } : {}),
});

export const toStoredCusp = (c: CalculatedCusp): { sign: string; degree: number; minutes: number; seconds: number } => ({
  sign: c.sign, degree: c.degree, minutes: c.minutes, seconds: c.seconds,
});
