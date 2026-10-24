/** Solar Returns use the SAME apparent Sun longitude as the chart engine. */
import { computeBody, computeAngles, longitudeToSignPosition, signedCircularDelta, signPositionToLongitude, ENGINE_INFO, type SignPosition } from './ephemerisEngine';
import type { NatalChart } from '@/hooks/useNatalChart';

export const SR_SOLVER_TOLERANCE_DEG = 0.000001;
export interface AutoSRPlanet extends SignPosition { isRetrograde?: boolean }
export interface AutoSRResult {
  srDateTimeUTC: string;
  srDateTimeLabel: string;
  planets: Record<string, AutoSRPlanet>;
  houseCusps: Record<string, SignPosition>;
  housesAvailable: boolean;
  houseSystem: string | null;
  targetLongitude: number;
  residualDegrees: number;
  ephemeris: typeof ENGINE_INFO;
}
const DAY = 86400000;
const sunAt = (ms: number): number => {
  const result = computeBody('Sun', new Date(ms));
  if (!result.ok) throw new Error(result.reason);
  return result.longitude;
};
export function solveSolarReturn(targetLongitude: number, birthDate: string, year: number): Date {
  if (!Number.isFinite(targetLongitude) || targetLongitude < 0 || targetLongitude >= 360) throw new Error('Invalid natal Sun longitude');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate) || !Number.isInteger(year)) throw new Error('A valid birth date and return year are required');
  const [, month, day] = birthDate.split('-').map(Number);
  const start = Date.UTC(year, month - 1, day) - 20 * DAY;
  let lo = start;
  let previous = signedCircularDelta(sunAt(lo), targetLongitude);
  for (let i = 1; i <= 40; i++) {
    let hi = start + i * DAY;
    const current = signedCircularDelta(sunAt(hi), targetLongitude);
    if (previous <= 0 && current >= 0 && current - previous < 5) {
      for (let j = 0; j < 45 && hi - lo > 1; j++) {
        const mid = (hi + lo) / 2;
        const delta = signedCircularDelta(sunAt(mid), targetLongitude);
        if (delta < 0) lo = mid; else hi = mid;
      }
      const result = new Date(Math.round((lo + hi) / 2));
      if (Math.abs(signedCircularDelta(sunAt(result.getTime()), targetLongitude)) > SR_SOLVER_TOLERANCE_DEG) throw new Error('Solar Return solver did not reach exactitude');
      return result;
    }
    lo = hi; previous = current;
  }
  throw new Error('No Solar Return found in the birthday search interval');
}
export function calculateSolarReturnFromLongitude(targetLongitude: number, birthDate: string, year: number, coords: { latitude: number; longitude: number } | null = null): AutoSRResult {
  if (coords && (!Number.isFinite(coords.latitude) || Math.abs(coords.latitude) > 90 || !Number.isFinite(coords.longitude) || Math.abs(coords.longitude) > 180)) throw new Error('Invalid return coordinates');
  const date = solveSolarReturn(targetLongitude, birthDate, year);
  const planets: Record<string, AutoSRPlanet> = {};
  for (const name of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','NorthNode','SouthNode','Chiron'] as const) {
    const body = computeBody(name, date);
    if (!body.ok) throw new Error(body.reason);
    planets[name] = { ...longitudeToSignPosition(body.longitude), ...(name === 'NorthNode' || name === 'SouthNode' ? {} : { isRetrograde: body.retrograde }) };
  }
  const houseCusps: Record<string, SignPosition> = {};
  const angles = coords ? computeAngles(date, coords.latitude, coords.longitude, 'placidus') : null;
  // Never mislabel the polar-circle fallback as Placidus.
  if (angles?.systemUsed === 'placidus') {
    for (let h = 1; h <= 12; h++) houseCusps[`house${h}`] = longitudeToSignPosition(angles.cusps[h]);
    planets.Ascendant = { ...houseCusps.house1 };
    planets.Midheaven = { ...houseCusps.house10 };
    planets.Descendant = { ...houseCusps.house7 };
    planets.IC = { ...houseCusps.house4 };
  }
  return { srDateTimeUTC: date.toISOString(), srDateTimeLabel: date.toISOString().replace('T',' ').replace('Z',' UTC'), planets, houseCusps, housesAvailable: Object.keys(houseCusps).length === 12, houseSystem: Object.keys(houseCusps).length === 12 ? 'placidus' : null, targetLongitude, residualDegrees: Math.abs(signedCircularDelta(planets.Sun.longitude, targetLongitude)), ephemeris: ENGINE_INFO };
}
export function calculateSolarReturnForChart(chart: NatalChart, year: number, coords: { latitude: number; longitude: number } | null = null): AutoSRResult {
  const target = signPositionToLongitude(chart.planets.Sun);
  if (target === null) throw new Error('Natal Sun position is unavailable');
  return calculateSolarReturnFromLongitude(target, chart.birthDate, year, coords);
}
/** Backward-compatible adapter, including seconds and unrounded longitude. */
export function calculateSolarReturnAuto(sign: string, degree: number, minutes: number, birthDate: string, year: number, lat?: number, lng?: number, seconds = 0, longitude?: number): AutoSRResult {
  const target = signPositionToLongitude({ sign, degree, minutes, seconds, longitude });
  if (target === null) throw new Error('Invalid natal Sun');
  return calculateSolarReturnFromLongitude(target, birthDate, year, lat !== undefined && lng !== undefined ? { latitude: lat, longitude: lng } : null);
}
