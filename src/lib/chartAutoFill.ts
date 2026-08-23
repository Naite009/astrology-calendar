/**
 * Chart auto-fill: derive the extended bodies from birth data.
 *
 * A user should be able to type in only the raw essentials (10 planets,
 * Ascendant, house cusps, North Node, Chiron) and still get complete reports.
 * Everything else (South Node, Lilith, Ceres, Pallas, Juno, Vesta, Eris,
 * Vertex, Part of Fortune, and Chiron / North Node when skipped) is
 * deterministic from the birth moment, so we compute it here with
 * astronomy-engine and the ephemeris tables instead of asking for it.
 *
 * Manually entered values always win. Derived values are listed in
 * `derivedBodies` so the UI can label them as calculated.
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import {
  getDetailedNodePosition,
  getDetailedChironPosition,
  getDetailedLilithPosition,
  getDetailedCeresPosition,
  getDetailedPallasPosition,
  getDetailedJunoPosition,
  getDetailedVestaPosition,
  calculateVertex,
  calculatePartOfFortune,
  getCoordinatesFromLocation,
  calculatePlacidusHouseCusps,
} from './astrology';
import { getAccurateAsteroidPosition } from './asteroidEphemeris';

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const absDeg = (p?: { sign: string; degree: number; minutes?: number }): number | null => {
  if (!p?.sign) return null;
  const idx = SIGNS.indexOf(p.sign);
  if (idx === -1) return null;
  return idx * 30 + (p.degree || 0) + (p.minutes || 0) / 60;
};

const toPos = (
  p: { sign: string; degree: number; minutes: number; seconds?: number; isRetrograde?: boolean },
): NatalPlanetPosition => ({
  sign: p.sign,
  degree: p.degree,
  minutes: p.minutes,
  seconds: p.seconds ?? 0,
  isRetrograde: p.isRetrograde ?? false,
});

const hasSign = (p?: NatalPlanetPosition | null): boolean => !!p?.sign && SIGNS.includes(p.sign);

/** UTC birth moment. Charts without a birth time fall back to noon local. */
export const birthMomentOf = (chart: NatalChart): Date | null => {
  if (!chart?.birthDate) return null;
  const [y, m, d] = chart.birthDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  const [hh, mm] = (chart.birthTime || '12:00').split(':').map(Number);
  const offset = typeof chart.timezoneOffset === 'number' ? chart.timezoneOffset : 0;
  // Offsets can be fractional (+05:30, +07:30), and Date.UTC truncates a
  // fractional hour argument, so convert the whole offset to minutes first.
  return new Date(Date.UTC(y, m - 1, d, hh || 0, (mm || 0) - Math.round(offset * 60)));
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

/**
 * Fill every derivable body that is missing from a chart.
 * Returns the same object reference when nothing had to change.
 */
export function autoFillChartBodies<T extends NatalChart | null>(chart: T): T {
  if (!chart || !chart.planets || !chart.birthDate) return chart;

  const date = birthMomentOf(chart);
  if (!date || isNaN(date.getTime())) return chart;

  const planets = { ...chart.planets };
  const derived: string[] = [];
  const add = (name: string, value: NatalPlanetPosition | null) => {
    if (!value || !hasSign(value)) return;
    (planets as Record<string, NatalPlanetPosition>)[name] = value;
    derived.push(name);
  };

  const safe = <R,>(fn: () => R): R | null => {
    try {
      return fn();
    } catch {
      return null;
    }
  };

  if (!hasSign(planets.NorthNode)) {
    const nn = safe(() => getDetailedNodePosition(date));
    add('NorthNode', nn ? toPos({ ...nn, isRetrograde: true }) : null);
  }

  // South Node is always exactly opposite the North Node.
  if (!hasSign(planets.SouthNode) && hasSign(planets.NorthNode)) {
    const nn = planets.NorthNode!;
    const oppIdx = (SIGNS.indexOf(nn.sign) + 6) % 12;
    add('SouthNode', {
      sign: SIGNS[oppIdx],
      degree: nn.degree,
      minutes: nn.minutes || 0,
      seconds: nn.seconds || 0,
      isRetrograde: true,
    });
  }

  if (!hasSign(planets.Chiron)) add('Chiron', safe(() => toPos(getDetailedChironPosition(date))));
  if (!hasSign(planets.Lilith)) add('Lilith', safe(() => toPos(getDetailedLilithPosition(date) as any)));
  if (!hasSign(planets.Ceres)) add('Ceres', safe(() => toPos(getDetailedCeresPosition(date))));
  if (!hasSign(planets.Pallas)) add('Pallas', safe(() => toPos(getDetailedPallasPosition(date))));
  if (!hasSign(planets.Juno)) add('Juno', safe(() => toPos(getDetailedJunoPosition(date))));
  if (!hasSign(planets.Vesta)) add('Vesta', safe(() => toPos(getDetailedVestaPosition(date))));
  if (!hasSign(planets.Eris)) {
    add('Eris', safe(() => toPos(getAccurateAsteroidPosition('eris', date))));
  }

  // Angles-dependent points need coordinates and a real birth time.
  const coords = chart.birthLocation ? safe(() => getCoordinatesFromLocation(chart.birthLocation)) : null;
  let houseCusps = chart.houseCusps;

  // House cusps drive every house-based report, so never leave them empty.
  if (!houseCusps?.house1?.sign) {
    const placidus = coords && chart.birthTime
      ? safe(() => calculatePlacidusHouseCusps(date, coords.lat, coords.lon))
      : null;
    const typedAsc = absDeg(planets.Ascendant);
    const placidusAsc = placidus ? absDeg((placidus as any).house1) : null;

    // Placidus from the birth data, but only when it agrees with a typed
    // Ascendant (city-level coordinates are approximate, a typed Asc is exact).
    const agrees =
      placidusAsc !== null &&
      (typedAsc === null || Math.abs(((placidusAsc - typedAsc + 540) % 360) - 180) < 2);

    if (placidus && agrees) {
      const built: Record<string, { sign: string; degree: number; minutes: number }> = {};
      for (let i = 1; i <= 12; i++) {
        const c = (placidus as any)[`house${i}`];
        if (c?.sign) built[`house${i}`] = { sign: c.sign, degree: c.degree ?? 0, minutes: c.minutes ?? 0 };
      }
      if (built.house1) {
        houseCusps = built as NatalChart['houseCusps'];
        derived.push('houseCusps');
      }
    } else if (typedAsc !== null) {
      // Equal houses from the typed Ascendant: exact on house 1 and never wrong
      // about which sign each house starts in by more than the system choice.
      const built: Record<string, { sign: string; degree: number; minutes: number }> = {};
      for (let i = 0; i < 12; i++) {
        const lon = (typedAsc + i * 30) % 360;
        const deg = lon % 30;
        const d = Math.floor(deg);
        built[`house${i + 1}`] = {
          sign: SIGNS[Math.floor(lon / 30)],
          degree: d,
          minutes: Math.round((deg - d) * 60),
        };
      }
      houseCusps = built as NatalChart['houseCusps'];
      derived.push('houseCusps(equal)');
    }
  }


  if (coords && chart.birthTime && !hasSign(planets.Vertex)) {
    add('Vertex', safe(() => toPos(calculateVertex(date, coords.lat, coords.lon))));
  }

  if (!hasSign(planets.PartOfFortune)) {
    const asc = absDeg(houseCusps?.house1 || planets.Ascendant);
    const sun = absDeg(planets.Sun);
    const moon = absDeg(planets.Moon);
    if (asc !== null && sun !== null && moon !== null) {
      add('PartOfFortune', safe(() => toPos(calculatePartOfFortune(asc, sun, moon, date, coords?.lat ?? 0))));
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
