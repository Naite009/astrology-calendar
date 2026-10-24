import { solveSolarReturn } from './solarReturnAutoCalculator';
import { computeBody } from './ephemerisEngine';
import * as Astronomy from 'astronomy-engine';
import type { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import type { NatalChart } from '@/hooks/useNatalChart';
import { signPositionToLongitude } from './ephemerisEngine';
import { resolveBirthPlaceOffline } from './geo/birthPlace';
import { calculateSecondaryProgressions, getProgressedMoonInfo, findProgressedAspects } from './secondaryProgressions';

export const SR_REPORT_VERSION = 'sr-integrity-2026-10-17-v1';
/** Never reinterpret the copied natal birthDate/birthTime as a return instant. */
export function resolveSolarReturnProvenance(sr: SolarReturnChart, natal: NatalChart) {
  if (sr.natalChartId && sr.natalChartId !== natal.id) throw new Error('Solar Return belongs to a different natal chart');
  const target = signPositionToLongitude(natal.planets.Sun);
  const location = sr.solarReturnLocation || '';
  const offline = location ? resolveBirthPlaceOffline(location) : null;
  const explicitCoordinates = Number.isFinite(sr.latitude) && Number.isFinite(sr.longitude);
  const place = explicitCoordinates
    ? { latitude: sr.latitude, longitude: sr.longitude, timezone: sr.timezoneId || null, source: 'stored' }
    : offline && !offline.ambiguous && offline.confidence !== 'low' ? offline : null;
  let instant: Date | null = null;
  let instantSource = 'unavailable';
  if (sr.solarReturnDateTime && /(?:Z|[+-]\d{2}:\d{2})$/.test(sr.solarReturnDateTime)) {
    const parsed = new Date(sr.solarReturnDateTime);
    if (Number.isFinite(parsed.getTime()) && parsed.getUTCFullYear() === sr.solarReturnYear) {
      const sun = computeBody('Sun', parsed);
      const longitude = sun.ok ? sun.longitude : NaN;
      const residual = target === null ? Infinity : Math.abs(((longitude - target + 540) % 360) - 180);
      if (residual <= 0.02) { instant = parsed; instantSource = 'stored'; }
    }
  }
  if (!instant && target !== null && /^\d{4}-\d{2}-\d{2}$/.test(natal.birthDate)) {
    const [, month, day] = natal.birthDate.split('-').map(Number);
    const seed = new Date(Date.UTC(sr.solarReturnYear, month - 1, day) - 20 * 86400000);
    try { instant = solveSolarReturn(target, natal.birthDate, sr.solarReturnYear); } catch { instant = null; }
    if (instant) instantSource = 'recalculated-from-stored-natal-sun';
  }
  return {
    natalChartId: natal.id, solarReturnChartId: sr.id, linkedNatalChartId: sr.natalChartId || null,
    returnInstantUTC: instant?.toISOString() || null, instantSource,
    storedReturnInstantUTC: sr.solarReturnDateTime || null,
    location: location || null,
    latitude: place?.latitude ?? null, longitude: place?.longitude ?? null,
    timezone: place?.timezone ?? null, coordinateSource: place?.source ?? 'unavailable',
    houseSystem: sr.houseSystem || null,
    storedEphemeris: (sr as SolarReturnChart & { ephemeris?: string }).ephemeris || null,
    derivedTimingEphemeris: 'astronomy-engine 2.1.19, tropical apparent solar longitude',
    warnings: [instantSource !== 'stored' ? 'Return instant was missing or rejected (year, UTC offset or solar-position mismatch); timing is recalculated from the stored natal Sun, not certified import metadata.' : '', !sr.houseSystem ? 'Imported house system was not recorded; stored cusps are used without relabelling them.' : '', !place ? 'Precise return coordinates are unavailable.' : !explicitCoordinates ? 'Coordinates and timezone resolved from the recorded return location, not from import metadata.' : ''].filter(Boolean),
  };
}

export function buildSolarReturnProgressionContext(sr: SolarReturnChart, natal: NatalChart) {
  const metadata = resolveSolarReturnProvenance(sr, natal);
  if (!metadata.returnInstantUTC) return null;
  const reference = new Date(metadata.returnInstantUTC);
  const result = calculateSecondaryProgressions(natal, reference);
  if (!result) return null;
  const moon = getProgressedMoonInfo(result, natal);
  return { technique: 'secondary progressions, one ephemeris day per 365.25 elapsed days', referenceDate: reference.toISOString(), progressedDate: result.progressedDate.toISOString(), ageInYears: result.ageInYears, planets: result.planets, moonInfo: moon, aspects: findProgressedAspects(result, natal, 2), contextLabel: 'Longer-term progressed context, not a Solar Return placement' };
}