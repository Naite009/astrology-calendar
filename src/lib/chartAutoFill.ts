/**
 * Chart auto-fill: derive the extended bodies from birth data.
 *
 * A user should be able to type in only the raw essentials (10 planets,
 * Ascendant, house cusps, North Node, Chiron) and still get complete reports.
 * Everything else (South Node, Lilith, Ceres, Pallas, Juno, Vesta, Eris,
 * Vertex, Part of Fortune, and Chiron / North Node when skipped) is
 * deterministic from the birth moment, so it is computed here through the
 * shared pipeline (birthDataNormalization -> ephemerisEngine): local civil
 * time at the birthplace, historical zone rules, one UTC instant.
 *
 * Manually entered or imported values always win; only empty slots are
 * filled. Derived values are listed in `derivedBodies` so the UI can label
 * them as calculated. Bodies outside the ephemeris data range are left empty
 * rather than approximated.
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { resolveBirthMomentSync, birthInputFromChart, type BirthMoment } from './birthDataNormalization';
import { calculateNatalFromMoment, toStoredPosition, type CuspKey } from './natalChartCalculation';
import {
  circularSeparation,
  longitudeToSignPosition,
  partOfFortuneLongitude,
  signPositionToLongitude,
  norm360,
} from './ephemerisEngine';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const absDeg = (p?: { sign: string; degree: number; minutes?: number; seconds?: number } | null): number | null =>
  p?.sign ? signPositionToLongitude({ sign: p.sign, degree: p.degree || 0, minutes: p.minutes || 0, seconds: p.seconds || 0 }) : null;

const hasSign = (p?: NatalPlanetPosition | null): boolean => !!p?.sign && SIGNS.includes(p.sign);

/** Normalized birth moment for a stored chart (stored metadata or offline city table). */
export const birthMomentFor = (chart: NatalChart): BirthMoment =>
  // birthInputFromChart forwards every stored field, including any source
  // coordinates the import printed, so they are never dropped on this path.
  resolveBirthMomentSync(birthInputFromChart(chart));

/** UTC birth instant, or null when the record cannot be normalized. Charts without a time use noon local. */
export const birthMomentOf = (chart: NatalChart): Date | null => {
  if (!chart?.birthDate) return null;
  const m = birthMomentFor(chart);
  return m.status === 'ok' ? m.utc : null;
};

/** Bodies this module can fill in when they are missing. */
export const DERIVABLE_BODIES = [
  'NorthNode', 'SouthNode', 'Chiron', 'Lilith', 'Ceres', 'Pallas', 'Juno',
  'Vesta', 'Eris', 'Vertex', 'PartOfFortune',
] as const;

export interface AutoFillResult<T> {
  chart: T;
  derived: string[];
}

const cuspFromLongitude = (lon: number): { sign: string; degree: number; minutes: number } => {
  const sp = longitudeToSignPosition(lon);
  return { sign: sp.sign, degree: sp.degree, minutes: sp.minutes };
};

/**
 * Fill every derivable body that is missing from a chart.
 * Returns the same object reference when nothing had to change.
 */
export function autoFillChartBodies<T extends NatalChart | null>(chart: T): T {
  if (!chart || !chart.planets || !chart.birthDate) return chart;

  const moment = birthMomentFor(chart);
  if (moment.status !== 'ok' || !moment.utc) return chart;

  const calc = calculateNatalFromMoment(moment);
  const planets = { ...chart.planets } as Record<string, NatalPlanetPosition>;
  const derived: string[] = [];
  const add = (name: string, value: NatalPlanetPosition | null | undefined) => {
    if (!value || !hasSign(value)) return;
    planets[name] = value;
    derived.push(name);
  };
  const fromCalc = (key: string): NatalPlanetPosition | null => {
    const p = calc.positions[key];
    if (!p) return null;
    const stored = toStoredPosition(p);
    return { ...stored, isRetrograde: stored.isRetrograde ?? false };
  };

  if (!hasSign(planets.NorthNode)) add('NorthNode', fromCalc('NorthNode'));

  // South Node is always exactly opposite the North Node the user gave us.
  if (!hasSign(planets.SouthNode) && hasSign(planets.NorthNode)) {
    const nn = planets.NorthNode;
    const oppIdx = (SIGNS.indexOf(nn.sign) + 6) % 12;
    add('SouthNode', {
      sign: SIGNS[oppIdx],
      degree: nn.degree,
      minutes: nn.minutes || 0,
      seconds: nn.seconds || 0,
      isRetrograde: nn.isRetrograde ?? true,
    });
  }

  for (const key of ['Chiron', 'Lilith', 'Ceres', 'Pallas', 'Juno', 'Vesta', 'Eris'] as const) {
    if (!hasSign(planets[key])) add(key, fromCalc(key));
  }

  // Angles: only when the shared engine could compute them (precise place,
  // real birth time). A typed Ascendant is exact and always wins.
  let houseCusps = chart.houseCusps;
  const typedAsc = absDeg(planets.Ascendant);
  const calcAsc = calc.angles?.ascendant ?? null;
  const ascAgrees = calcAsc !== null && (typedAsc === null || circularSeparation(calcAsc, typedAsc) < 2);

  // House cusps drive every house-based report, so never leave them empty.
  if (!houseCusps?.house1?.sign) {
    if (calc.houseCusps && ascAgrees) {
      const built: Record<string, { sign: string; degree: number; minutes: number }> = {};
      for (let i = 1; i <= 12; i++) {
        const c = calc.houseCusps[`house${i}` as CuspKey];
        built[`house${i}`] = { sign: c.sign, degree: c.degree, minutes: c.minutes };
      }
      houseCusps = built as NatalChart['houseCusps'];
      derived.push('houseCusps');
    } else if (typedAsc !== null) {
      // Equal houses from the typed Ascendant: exact on house 1, and honest
      // about the fact that the birthplace was not precise enough for Placidus.
      const built: Record<string, { sign: string; degree: number; minutes: number }> = {};
      for (let i = 0; i < 12; i++) built[`house${i + 1}`] = cuspFromLongitude(norm360(typedAsc + i * 30));
      houseCusps = built as NatalChart['houseCusps'];
      derived.push('houseCusps(equal)');
    }
  }

  // Ascendant when neither it nor house 1 was given: take house 1 (filled or typed).
  if (!hasSign(planets.Ascendant) && houseCusps?.house1?.sign) {
    add('Ascendant', { sign: houseCusps.house1.sign, degree: houseCusps.house1.degree, minutes: houseCusps.house1.minutes || 0, seconds: 0, isRetrograde: false });
  }

  if (!hasSign(planets.Vertex) && calc.angles && ascAgrees) add('Vertex', fromCalc('Vertex'));

  // Part of Fortune from the values the chart actually carries (typed Asc,
  // Sun, Moon), so it stays consistent with the source chart.
  if (!hasSign(planets.PartOfFortune)) {
    const asc = absDeg(houseCusps?.house1 || planets.Ascendant);
    const sun = absDeg(planets.Sun);
    const moon = absDeg(planets.Moon);
    if (asc !== null && sun !== null && moon !== null) {
      const pof = partOfFortuneLongitude(asc, sun, moon);
      const sp = longitudeToSignPosition(pof.longitude);
      add('PartOfFortune', { sign: sp.sign, degree: sp.degree, minutes: sp.minutes, seconds: sp.seconds, isRetrograde: false });
    } else {
      add('PartOfFortune', fromCalc('PartOfFortune'));
    }
  }

  if (derived.length === 0) return chart;

  return {
    ...chart,
    planets,
    houseCusps,
    derivedBodies: Array.from(new Set([...(((chart as any).derivedBodies as string[]) || []), ...derived])),
  } as T;
}

/** Which of the essentials are still missing, for a friendly warning in the UI. */
export function missingEssentials(chart: NatalChart | null): string[] {
  if (!chart?.planets) return ['everything'];
  const core = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  const missing = core.filter((k) => !hasSign((chart.planets as any)[k]));
  if (!hasSign(chart.planets.Ascendant) && !chart.houseCusps?.house1?.sign) missing.push('Ascendant');
  return missing;
}
