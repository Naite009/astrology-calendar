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
  computeBodies,
  type BodyKey,
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

/** Bodies whose retrograde flag is derived from the ephemeris (never Sun, Moon, or Nodes). */
const RETRO_CAPABLE = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron'] as const;

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
/**
 * Ephemeris retrograde status for the retrograde-capable planets. Uses the
 * exact birth instant when it resolves; otherwise checks the whole span of
 * possible UTC instants for the local date/time (UTC-14..UTC+14) and only
 * reports a status when it is the same across that span.
 */
export function ephemerisRetrogradeStatus(chart: NatalChart, moment?: BirthMoment): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  const m = moment ?? birthMomentFor(chart);
  const keys = [...RETRO_CAPABLE] as BodyKey[];
  if (m.status === 'ok' && m.utc) {
    const r = computeBodies(m.utc, keys);
    for (const k of keys) { const x = r[k]; if (x.ok === true) out[k] = x.retrograde; }
    return out;
  }
  const dm = /^(\d{4})-(\d{2})-(\d{2})/.exec(chart.birthDate || '');
  if (!dm) return out;
  const tm = /^(\d{1,2}):(\d{2})/.exec(chart.birthTime || '12:00') || ['', '12', '00'];
  const base = Date.UTC(+dm[1], +dm[2] - 1, +dm[3], +tm[1], +tm[2]);
  const early = computeBodies(new Date(base - 14 * 3600e3), keys);
  const late = computeBodies(new Date(base + 14 * 3600e3), keys);
  for (const k of keys) {
    const a = early[k], b = late[k];
    if (a.ok === true && b.ok === true && a.retrograde === b.retrograde) out[k] = a.retrograde;
  }
  return out;
}

function applyRetrogradeStatus(planets: Record<string, NatalPlanetPosition>, status: Record<string, boolean>): boolean {
  let changed = false;
  for (const key of RETRO_CAPABLE) {
    const stored = planets[key];
    if (!hasSign(stored) || status[key] === undefined) continue;
    if (Boolean(stored.isRetrograde) !== status[key]) {
      planets[key] = { ...stored, isRetrograde: status[key] };
      changed = true;
    }
  }
  return changed;
}

export function autoFillChartBodies<T extends NatalChart | null>(chart: T): T {
  if (!chart || !chart.planets || !chart.birthDate) return chart;

  const moment = birthMomentFor(chart);
  if (moment.status !== 'ok' || !moment.utc) {
    const planets = { ...chart.planets } as Record<string, NatalPlanetPosition>;
    if (!applyRetrogradeStatus(planets, ephemerisRetrogradeStatus(chart, moment))) return chart;
    return { ...chart, planets } as T;
  }

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

  // Retrograde status from the ephemeris for planets that can actually go
  // retrograde. Imported tables often omit the ℞ marker, so a stored "direct"
  // is not trusted when the calculated position agrees with the stored one.
  // Sun/Moon never retrograde; Nodes keep their existing convention.
  const retroChanged = applyRetrogradeStatus(planets, ephemerisRetrogradeStatus(chart, moment));

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

  if (derived.length === 0 && !retroChanged) return chart;

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
