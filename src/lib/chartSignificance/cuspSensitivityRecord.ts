import type { NatalChart } from '@/hooks/useNatalChart';
import { birthInputFromChart, parseBirthTime, resolveBirthMomentSync } from '@/lib/birthDataNormalization';
import { computeAngles, computeBody, PLANET_KEYS, signedCircularDelta, type BodyKey } from '@/lib/ephemerisEngine';
import { houseForLongitude, toAbsoluteLongitude } from '@/lib/houseForLongitude';
import { getEffectiveOrb } from '@/lib/aspectOrbs';
import { getHouseArena } from '@/lib/interpretation/psychologicalFunctions';
import { type HouseSystem } from '@/lib/placidusHouses';
import { solveBirthTimeSensitivity, describeCrossing, type HouseCrossing } from './birthTimeSensitivity';

export type TimeReliability = NonNullable<NatalChart['birthTimeReliability']>;
export interface TimePolicy {
  reliability: TimeReliability;
  earlierMinutes: number;
  laterMinutes: number;
  provisional: boolean;
}
export interface CuspSensitivityBody {
  body: BodyKey;
  storedHouse: number | null;
  computedHouse: number;
  nearestCusp: number;
  cuspDistanceDegrees: number;
  angleContacts: Array<{ angle: string; orbDegrees: number }>;
  crossings: HouseCrossing[];
  alternateHouses: number[];
  warning: string;
}
export interface CuspSensitivityRecord {
  status: 'checked' | 'unknown-time' | 'unavailable' | 'source-mismatch';
  policy: TimePolicy;
  requestedSystem: HouseSystem;
  systemUsed: HouseSystem | null;
  birthUtc: string | null;
  timezoneId: string | null;
  coordinates: { latitude: number; longitude: number; source: string } | null;
  bodies: CuspSensitivityBody[];
  notice: string;
}

export function birthTimePolicy(chart: NatalChart): TimePolicy {
  const reliability = !parseBirthTime(chart.birthTime) ? 'unknown' : chart.birthTimeReliability ?? 'rounded';
  if (reliability === 'unknown' || reliability === 'verified') return { reliability, earlierMinutes: 0, laterMinutes: 0, provisional: false };
  const actual = chart.birthTimeUncertainty;
  if (actual && Number.isFinite(actual.earlierMinutes) && actual.earlierMinutes >= 0 && Number.isFinite(actual.laterMinutes) && actual.laterMinutes >= 0) {
    return { reliability, ...actual, provisional: false };
  }
  const minutes = reliability === 'approximate' ? 30 : 5;
  return { reliability, earlierMinutes: minutes, laterMinutes: minutes, provisional: true };
}

export const TIME_READING_LIMIT = 'Recognizing yourself in a description cannot establish your birth time. A conjunction to an angle is separate from the house a planet occupies.';

export function withProfileTimePrecision(chart: NatalChart | null, approximate?: boolean): NatalChart | null {
  return chart && approximate && !chart.birthTimeReliability && !chart.birthTimeUncertainty
    ? { ...chart, birthTimeReliability: 'approximate' }
    : chart;
}

/** Nearest of the occupied house's own and next cusp, not a time estimate. */
export function nearestHouseCusp(longitude: number, house: number, cusps: number[]): { cusp: number; distance: number } {
  const own = ((longitude - cusps[house - 1]) % 360 + 360) % 360;
  const next = ((cusps[house % 12] - longitude) % 360 + 360) % 360;
  return next < own ? { cusp: house % 12 + 1, distance: next } : { cusp: house, distance: own };
}

/** Read-only diagnostic. Never overwrites imported positions, houses or birth details. */
export function buildCuspSensitivityRecord(chart: NatalChart): CuspSensitivityRecord {
  const policy = birthTimePolicy(chart);
  const requestedSystem = chart.houseSystem ?? 'placidus';
  const empty: CuspSensitivityRecord = { status: 'unavailable', policy, requestedSystem, systemUsed: null, birthUtc: null, timezoneId: null, coordinates: null, bodies: [], notice: '' };
  if (policy.reliability === 'unknown') return { ...empty, status: 'unknown-time', notice: `Birth time is unknown. Precise houses and angles must not be used as established facts. ${TIME_READING_LIMIT}` };
  const moment = resolveBirthMomentSync(birthInputFromChart(chart));
  if (!moment.utc || !moment.canComputeAngles || !moment.place || !moment.zone || moment.sourceUtcCheck?.matches === false) {
    return { ...empty, notice: `The birth time, source time, location or time zone needs checking before house changes can be calculated. ${TIME_READING_LIMIT}` };
  }
  const utc = moment.utc;
  const coordinates = { latitude: moment.place.latitude, longitude: moment.place.longitude, source: moment.place.source };
  const angles = computeAngles(utc, coordinates.latitude, coordinates.longitude, requestedSystem);
  const base = { ...empty, birthUtc: utc.toISOString(), timezoneId: moment.zone.id, coordinates, systemUsed: angles.systemUsed };
  // Imported positions are authoritative. A diagnostic that disagrees must not
  // silently supply alternate houses for a different chart.
  const storedCusps = Array.from({ length: 12 }, (_, i) => toAbsoluteLongitude(chart.houseCusps?.[`house${i + 1}` as keyof NonNullable<NatalChart['houseCusps']>]));
  if (storedCusps.some((lon, i) => lon !== null && Math.abs(signedCircularDelta(lon, angles.cusps[i + 1])) > 0.02)) {
    return { ...base, status: 'source-mismatch', notice: `The saved cusps differ from this birth-data calculation. Saved chart values are unchanged; alternate-house readings are withheld until the source is checked. ${TIME_READING_LIMIT}` };
  }
  const bodies: CuspSensitivityBody[] = [];
  const window = Math.max(policy.earlierMinutes, policy.laterMinutes);
  try {
    for (const body of PLANET_KEYS) {
      const stored = toAbsoluteLongitude(chart.planets[body]);
      if (stored === null) continue;
      const position = computeBody(body, utc);
      if (!position.ok) throw new Error('Body unavailable');
      if (Math.abs(signedCircularDelta(stored, position.longitude)) > 0.02) return { ...base, status: 'source-mismatch', notice: `The saved ${body} position differs from this birth-data calculation. Saved values are unchanged; alternate-house readings are withheld until the source is checked. ${TIME_READING_LIMIT}` };
      const solved = solveBirthTimeSensitivity(body, utc, coordinates, requestedSystem, window);
      const crossings = [solved.earlier, solved.later].filter((c): c is HouseCrossing => c !== null && c.offsetSeconds >= -policy.earlierMinutes * 60 && c.offsetSeconds <= policy.laterMinutes * 60);
      const cuspDistances = angles.cusps.slice(1, 13).map((lon, i) => ({ cusp: i + 1, distance: Math.abs(signedCircularDelta(position.longitude, lon)) })).sort((a, b) => a.distance - b.distance);
      const nearest = cuspDistances[0];
      const angleContacts = [['Ascendant', angles.ascendant], ['Descendant', angles.descendant], ['Midheaven', angles.mc], ['IC', angles.ic]].flatMap(([angle, lon]) => {
        const orbDegrees = Math.abs(signedCircularDelta(position.longitude, Number(lon)));
        return orbDegrees <= getEffectiveOrb(body, String(angle), 'conjunction') ? [{ angle: String(angle), orbDegrees }] : [];
      });
      const alternateHouses = [...new Set(crossings.map(c => c.toHouse))];
      const warning = crossings.length
        ? `${body} stays in house ${solved.house} at the recorded time; ${crossings.map(describeCrossing).join('; ')}. Those crossings fall inside the stated reading interval. Recorded-house area: ${getHouseArena(solved.house)}. Alternate area: ${alternateHouses.map(getHouseArena).join('; ')}. These are conditional readings, not proof of a different birth time.`
        : `${body} remains in house ${solved.house}${policy.reliability === 'verified' ? ' at the verified time. Proximity does not mean that time is wrong.' : ' throughout the checked interval.'}`;
      bodies.push({ body, storedHouse: houseForLongitude(chart, stored), computedHouse: solved.house, nearestCusp: nearest.cusp, cuspDistanceDegrees: nearest.distance, angleContacts, crossings, alternateHouses, warning });
    }
  } catch {
    return { ...base, notice: `A house boundary could not be verified. Alternate-house readings are withheld, and saved chart values are unchanged. ${TIME_READING_LIMIT}` };
  }
  const interval = policy.reliability === 'verified'
    ? 'Verified birth time: retain the calculated houses. Being close to a cusp or angle does not imply the time is wrong.'
    : `${policy.provisional ? 'Provisional' : 'Supplied'} reading interval: ${policy.earlierMinutes} minutes earlier to ${policy.laterMinutes} minutes later. ${chart.birthTimeReliability ? '' : 'No precision source is saved; five-minute rounding is a provisional check, not a claim about the record. '}`;
  return { ...base, status: 'checked', bodies, notice: `${interval} ${TIME_READING_LIMIT}` };
}

/** Remove only time-dependent fields for reading inputs with explicitly unknown time. */
export function chartForHouseReading(chart: NatalChart): NatalChart {
  if (birthTimePolicy(chart).reliability !== 'unknown') return chart;
  const { Ascendant: _asc, Vertex: _vertex, PartOfFortune: _fortune, ...planets } = chart.planets;
  return { ...chart, birthTime: '', houseCusps: undefined, planets };
}

export function cuspSensitivityContext(record: CuspSensitivityRecord): string {
  return [record.notice, ...record.bodies.filter(b => b.crossings.length > 0 || b.cuspDistanceDegrees < 1).map(b => b.warning)].join('\n');
}