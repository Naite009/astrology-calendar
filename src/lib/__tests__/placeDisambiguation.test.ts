/**
 * Regression guard for birthplace disambiguation and source-coordinate
 * handling in the import / verification pipeline.
 *
 * The bug: an Astro.com chart for Franklin (Sussex County), NJ (US) was
 * resolved by the old resolver as Franklin, Tennessee (first name match in a
 * 10-result geocoder page), giving America/Chicago, UTC 23:45 instead of
 * 22:45, a Moon 35' off and an Ascendant 7 degrees off. Nothing the source
 * printed (county, state, country, coordinates, universal time) survived
 * import.
 *
 * Reference values are from the Astro.com chart for Mike Sanders:
 *   born 29 Aug 1964, 6:45 p.m., Franklin (Sussex County), NJ (US),
 *   74w35, 41n07, Univ.Time 22:45, Placidus
 *   Sun 6 Virgo 35, Moon 0 Gemini 52, True Node 29 Gemini 35'42",
 *   Ascendant 18 Aquarius 38.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  parseSourceCoordinates,
  stripCoordinateText,
  parseAstroComHeader,
  isRicherPlaceText,
} from '@/lib/geo/sourcePlace';
import {
  parsePlaceQuery,
  resolveBirthPlaceOffline,
  resolveBirthPlace,
  checkPlaceAgainstText,
  clearBirthPlaceCache,
  placeFromCandidate,
} from '@/lib/geo/birthPlace';
import { isInsideUsState } from '@/lib/geo/regionBounds';
import {
  resolveBirthMomentSync,
  resolveBirthMoment,
  birthInputFromChart,
  type BirthInput,
} from '@/lib/birthDataNormalization';
import { calculateNatalFromMoment } from '@/lib/natalChartCalculation';
import { verifyChartAgainstEphemeris, verifyChartAgainstEphemerisAsync, type VerifyPosition } from '@/lib/chartEphemerisVerify';
import { signPositionToLongitude } from '@/lib/ephemerisEngine';

// ── helpers ────────────────────────────────────────────────────────────────

const arcmin = (a: number, b: number): number => {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d * 60;
};

const lon = (sign: string, degree: number, minutes = 0, seconds = 0): number =>
  signPositionToLongitude({ sign, degree, minutes, seconds });

const MIKE_TEXT = 'Franklin (Sussex County), NJ (US)';
const MIKE_LAT = 41 + 7 / 60;
const MIKE_LON = -(74 + 35 / 60);

const mikeInput = (overrides: Partial<BirthInput> = {}): BirthInput => ({
  birthDate: '1964-08-29',
  birthTime: '18:45',
  birthLocation: MIKE_TEXT,
  sourceLatitude: MIKE_LAT,
  sourceLongitude: MIKE_LON,
  sourceCoordinatesText: '74w35, 41n07',
  sourceUniversalTime: '22:45',
  houseSystem: 'placidus',
  nodeVariant: 'true',
  ...overrides,
});

/** Franklin, TN: what the old resolver wrongly saved for this chart. */
const STALE_FRANKLIN_TN = {
  timezoneId: 'America/Chicago',
  latitude: 35.9251,
  longitude: -86.8689,
  placeName: 'Franklin, Tennessee, United States',
  placeConfidence: 'high' as const,
  placeSource: 'geocoder' as const,
};

// Fake Open-Meteo pages. Franklin, NJ sits far down the list on purpose,
// exactly as it does on the real service.
type Hit = {
  name: string; latitude: number; longitude: number; timezone: string; feature_code: string;
  country_code: string; country: string; admin1: string; admin2?: string; population?: number;
};
const FRANKLINS: Hit[] = [
  { name: 'Franklin', latitude: 35.9251, longitude: -86.8689, timezone: 'America/Chicago', feature_code: 'PPLA2', country_code: 'US', country: 'United States', admin1: 'Tennessee', admin2: 'Williamson', population: 83454 },
  { name: 'Franklin', latitude: 39.4795, longitude: -86.0550, timezone: 'America/Indiana/Indianapolis', feature_code: 'PPLA2', country_code: 'US', country: 'United States', admin1: 'Indiana', admin2: 'Johnson', population: 25313 },
  { name: 'Franklin', latitude: 42.0834, longitude: -71.3967, timezone: 'America/New_York', feature_code: 'PPL', country_code: 'US', country: 'United States', admin1: 'Massachusetts', admin2: 'Norfolk', population: 33261 },
  { name: 'Franklin', latitude: 42.8886, longitude: -88.0384, timezone: 'America/Chicago', feature_code: 'PPL', country_code: 'US', country: 'United States', admin1: 'Wisconsin', admin2: 'Milwaukee', population: 36013 },
  { name: 'Franklin', latitude: 35.1823, longitude: -83.3815, timezone: 'America/New_York', feature_code: 'PPLA2', country_code: 'US', country: 'United States', admin1: 'North Carolina', admin2: 'Macon', population: 4175 },
  { name: 'Franklin', latitude: 40.0842, longitude: -74.7100, timezone: 'America/New_York', feature_code: 'PPL', country_code: 'US', country: 'United States', admin1: 'New Jersey', admin2: 'Gloucester', population: 16820 },
  { name: 'Franklin', latitude: 30.6941, longitude: -91.7562, timezone: 'America/Chicago', feature_code: 'PPLA2', country_code: 'US', country: 'United States', admin1: 'Louisiana', admin2: 'St. Mary', population: 6819 },
  { name: 'Franklin', latitude: 41.0976, longitude: -79.8312, timezone: 'America/New_York', feature_code: 'PPLA2', country_code: 'US', country: 'United States', admin1: 'Pennsylvania', admin2: 'Venango', population: 6198 },
  { name: 'Franklin', latitude: 43.4473, longitude: -71.6473, timezone: 'America/New_York', feature_code: 'PPL', country_code: 'US', country: 'United States', admin1: 'New Hampshire', admin2: 'Merrimack', population: 8741 },
  { name: 'Franklin', latitude: 39.5539, longitude: -84.3041, timezone: 'America/New_York', feature_code: 'PPL', country_code: 'US', country: 'United States', admin1: 'Ohio', admin2: 'Warren', population: 11690 },
  { name: 'Franklin Park', latitude: 41.9353, longitude: -87.8656, timezone: 'America/Chicago', feature_code: 'PPL', country_code: 'US', country: 'United States', admin1: 'Illinois', admin2: 'Cook', population: 18333 },
  { name: 'Franklin', latitude: 41.1220, longitude: -74.5804, timezone: 'America/New_York', feature_code: 'PPL', country_code: 'US', country: 'United States', admin1: 'New Jersey', admin2: 'Sussex', population: 5045 },
  { name: 'Franklin', latitude: 36.6779, longitude: -76.9225, timezone: 'America/New_York', feature_code: 'PPL', country_code: 'US', country: 'United States', admin1: 'Virginia', population: 8582 },
  { name: 'Franklin', latitude: 44.9958, longitude: -71.4234, timezone: 'America/New_York', feature_code: 'PPL', country_code: 'US', country: 'United States', admin1: 'Vermont', admin2: 'Franklin', population: 1400 },
];
const SPRINGFIELDS: Hit[] = [
  { name: 'Springfield', latitude: 37.2153, longitude: -93.2982, timezone: 'America/Chicago', feature_code: 'PPLA2', country_code: 'US', country: 'United States', admin1: 'Missouri', admin2: 'Greene', population: 169176 },
  { name: 'Springfield', latitude: 42.1015, longitude: -72.5898, timezone: 'America/New_York', feature_code: 'PPLA2', country_code: 'US', country: 'United States', admin1: 'Massachusetts', admin2: 'Hampden', population: 155929 },
  { name: 'Springfield', latitude: 39.8017, longitude: -89.6437, timezone: 'America/Chicago', feature_code: 'PPLA', country_code: 'US', country: 'United States', admin1: 'Illinois', admin2: 'Sangamon', population: 116250 },
  { name: 'Springfield', latitude: 44.0462, longitude: -123.0220, timezone: 'America/Los_Angeles', feature_code: 'PPL', country_code: 'US', country: 'United States', admin1: 'Oregon', admin2: 'Lane', population: 62353 },
  { name: 'Springfield', latitude: 39.9242, longitude: -83.8088, timezone: 'America/New_York', feature_code: 'PPLA2', country_code: 'US', country: 'United States', admin1: 'Ohio', admin2: 'Clark', population: 58662 },
];

const fakeFetch = (pages: Record<string, Hit[]>) =>
  vi.fn(async (url: string) => {
    const name = decodeURIComponent(new URL(url).searchParams.get('name') || '').toLowerCase();
    const results = pages[name] || [];
    return { ok: true, status: 200, json: async () => ({ results }) } as unknown as Response;
  });

// ── 1. Source coordinate parsing ───────────────────────────────────────────

describe('parseSourceCoordinates', () => {
  it('reads the Astro.com form "74w35, 41n07"', () => {
    const c = parseSourceCoordinates('74w35, 41n07');
    expect(c).not.toBeNull();
    expect(c!.latitude).toBeCloseTo(MIKE_LAT, 5);
    expect(c!.longitude).toBeCloseTo(MIKE_LON, 5);
    expect(c!.precision).toBe('minute');
  });

  it('reads Astro.com forms with seconds and in either order', () => {
    const a = parseSourceCoordinates("41n07'12 74w35'40");
    expect(a!.latitude).toBeCloseTo(41 + 7 / 60 + 12 / 3600, 6);
    expect(a!.longitude).toBeCloseTo(-(74 + 35 / 60 + 40 / 3600), 6);
    expect(a!.precision).toBe('second');
    const b = parseSourceCoordinates('118w39, 34n12'); // West Hills, CA
    expect(b!.latitude).toBeCloseTo(34.2, 5);
    expect(b!.longitude).toBeCloseTo(-118.65, 5);
  });

  it('reads southern and eastern hemispheres', () => {
    const c = parseSourceCoordinates('151e12, 33s52'); // Sydney
    expect(c!.latitude).toBeCloseTo(-(33 + 52 / 60), 5);
    expect(c!.longitude).toBeCloseTo(151.2, 5);
  });

  it('reads DMS with trailing and leading hemisphere letters', () => {
    const t = parseSourceCoordinates("41°07'N 74°35'W");
    expect(t!.latitude).toBeCloseTo(MIKE_LAT, 5);
    expect(t!.longitude).toBeCloseTo(MIKE_LON, 5);
    const l = parseSourceCoordinates("N41°07'12\" W074°35'40\"");
    expect(l!.latitude).toBeCloseTo(41 + 7 / 60 + 12 / 3600, 6);
    expect(l!.longitude).toBeCloseTo(-(74 + 35 / 60 + 40 / 3600), 6);
  });

  it('reads decimal forms', () => {
    expect(parseSourceCoordinates('41.1167N 74.5833W')!.longitude).toBeCloseTo(-74.5833, 4);
    expect(parseSourceCoordinates('Latitude: 41.1167 Longitude: -74.5833')!.latitude).toBeCloseTo(41.1167, 4);
    const pair = parseSourceCoordinates('41.1167, -74.5833');
    expect(pair!.latitude).toBeCloseTo(41.1167, 4);
    expect(pair!.longitude).toBeCloseTo(-74.5833, 4);
  });

  it('never turns stray numbers (degrees, dates, times) into a location', () => {
    expect(parseSourceCoordinates("Sun 6°35' Virgo, Moon 0°52' Gemini")).toBeNull();
    expect(parseSourceCoordinates('29 Aug 1964, 18:45')).toBeNull();
    expect(parseSourceCoordinates('Franklin, NJ')).toBeNull();
    expect(parseSourceCoordinates('house 12, 34')).toBeNull();
  });

  it('rejects impossible values', () => {
    expect(parseSourceCoordinates('95n10, 74w35')).toBeNull();
    expect(parseSourceCoordinates('41n70, 74w35')).toBeNull();
  });

  it('strips coordinate tokens from a place string and keeps every qualifier', () => {
    expect(stripCoordinateText('Franklin (Sussex County), NJ (US), 74w35, 41n07')).toBe(MIKE_TEXT);
    expect(stripCoordinateText("West Hills, CA (US) 34°12'N 118°39'W")).toBe('West Hills, CA (US)');
  });
});

// ── 2. Astro.com header parsing ────────────────────────────────────────────

describe('parseAstroComHeader', () => {
  it('keeps the full qualified place, coordinates, universal time and house system (one-line data row)', () => {
    const h = parseAstroComHeader(
      'Mike Sanders, born 29 Aug 1964, 6:45 p.m., Franklin (Sussex County), NJ (US), 74w35, 41n07, Univ.Time 22:45, Sid. Time 16:00:11, Placidus\n' +
      "Sun 6°35' Virgo\nMoon 0°52' Gemini\n",
    );
    expect(h.name).toBe('Mike Sanders');
    expect(h.birthDate).toBe('1964-08-29');
    expect(h.birthTime).toBe('18:45');
    expect(h.placeText).toBe(MIKE_TEXT);
    expect(h.coordinates?.latitude).toBeCloseTo(MIKE_LAT, 5);
    expect(h.coordinates?.longitude).toBeCloseTo(MIKE_LON, 5);
    expect(h.universalTime).toBe('22:45');
    expect(h.houseSystem).toBe('placidus');
  });

  it('parses the multi-line Astro.com chart-drawing header', () => {
    const h = parseAstroComHeader(
      'Mike Sanders (male)\n' +
      'born on 29 August 1964 at 6:45 pm in Franklin (Sussex County), NJ (US)\n' +
      'Univ.Time 22:45  Sid.Time 15:59:40  Long: 74w35  Lat: 41n07\n' +
      'Method: Web Style / Placidus\n' +
      "Sun 6°35' Virgo\n",
    );
    expect(h.name).toBe('Mike Sanders');
    expect(h.sex).toBe('male');
    expect(h.birthDate).toBe('1964-08-29');
    expect(h.birthTime).toBe('18:45');
    expect(h.placeText).toBe(MIKE_TEXT);
    expect(h.coordinates?.latitude).toBeCloseTo(MIKE_LAT, 5);
    expect(h.universalTime).toBe('22:45');
    expect(h.houseSystem).toBe('placidus');
  });

  it('never mistakes the universal or sidereal time for the birth time', () => {
    const h = parseAstroComHeader('Test Person, born 19 May 2011, Univ.Time 01:06, 6:06 p.m., West Hills, CA (US), 118w39, 34n12');
    expect(h.birthTime).toBe('18:06');
    expect(h.universalTime).toBe('01:06');
    expect(h.placeText).toBe('West Hills, CA (US)');
  });

  it('handles 24-hour times and a place without coordinates', () => {
    const h = parseAstroComHeader('Ann Example, born 3 March 1990, 07:15 in Springfield, Illinois, USA');
    expect(h.birthDate).toBe('1990-03-03');
    expect(h.birthTime).toBe('07:15');
    expect(h.placeText).toBe('Springfield, Illinois, USA');
    expect(h.coordinates).toBeNull();
  });

  it('isRicherPlaceText upgrades a bare town to the qualified one and never the reverse', () => {
    expect(isRicherPlaceText(MIKE_TEXT, 'Franklin')).toBe(true);
    expect(isRicherPlaceText(MIKE_TEXT, 'Franklin, NJ')).toBe(true);
    expect(isRicherPlaceText('Franklin', MIKE_TEXT)).toBe(false);
    expect(isRicherPlaceText('Franklin, TN', 'Franklin, NJ')).toBe(false);
  });
});

// ── 3. Place-text parsing keeps county / state / country ──────────────────

describe('parsePlaceQuery', () => {
  it('preserves county, state and country from "Franklin (Sussex County), NJ (US)"', () => {
    const p = parsePlaceQuery(MIKE_TEXT);
    expect(p.city).toBe('franklin');
    expect(p.county).toBe('sussex');
    expect(p.state?.code).toBe('NJ');
    expect(p.country).toBe('united states');
    expect(p.countryCode?.toUpperCase()).toBe('US');
  });

  it('lifts embedded coordinates out of the text', () => {
    const p = parsePlaceQuery('Franklin (Sussex County), NJ (US), 74w35, 41n07');
    expect(p.city).toBe('franklin');
    expect(p.state?.code).toBe('NJ');
    expect(p.coordinates?.longitude).toBeCloseTo(MIKE_LON, 5);
  });

  it('distinguishes "Franklin, TN" from "Franklin, NJ"', () => {
    expect(parsePlaceQuery('Franklin, TN').state?.code).toBe('TN');
    expect(parsePlaceQuery('Franklin, New Jersey').state?.code).toBe('NJ');
    expect(parsePlaceQuery('Franklin NJ').state?.code).toBe('NJ');
  });

  it('does not read a foreign country code as a US state', () => {
    const p = parsePlaceQuery('London, ON, Canada');
    expect(p.state).toBeUndefined();
    expect(p.country).toBe('canada');
  });

  it('two-letter tokens that are both a US state and a country code read as the state', () => {
    // The old parser turned "West Hills, CA" into Canada and "Springfield, IL" into Israel.
    expect(parsePlaceQuery('West Hills, CA').state?.code).toBe('CA');
    expect(parsePlaceQuery('West Hills, CA').country).toBe('united states');
    expect(parsePlaceQuery('Springfield, IL').state?.code).toBe('IL');
    expect(parsePlaceQuery('Bloomington, IN').state?.code).toBe('IN');
    expect(parsePlaceQuery('Wilmington, DE').state?.code).toBe('DE');
    expect(parsePlaceQuery('Denver, CO').state?.code).toBe('CO');
    expect(parsePlaceQuery('Boise, ID').state?.code).toBe('ID');
    expect(parsePlaceQuery('Omaha, NE').state?.code).toBe('NE');
  });

  it('...but a named foreign country or a Canadian province still wins', () => {
    expect(parsePlaceQuery('Toronto, ON, CA').country).toBe('canada');
    expect(parsePlaceQuery('Toronto, ON, CA').state).toBeUndefined();
    expect(parsePlaceQuery('Vancouver, BC, Canada').country).toBe('canada');
    expect(parsePlaceQuery('Tel Aviv, Israel').country).toBe('israel');
    expect(parsePlaceQuery('Berlin, Germany').country).toBe('germany');
    expect(parsePlaceQuery('Munich, DE, Germany').state).toBeUndefined();
  });
});

// ── 4. Offline resolution never collapses to a same-name town elsewhere ───

describe('resolveBirthPlaceOffline', () => {
  it('uses printed coordinates in the text over any lookup', () => {
    const p = resolveBirthPlaceOffline('Franklin (Sussex County), NJ (US), 74w35, 41n07');
    expect(p?.source).toBe('source-coordinates');
    expect(p?.latitude).toBeCloseTo(MIKE_LAT, 5);
    expect(p?.longitude).toBeCloseTo(MIKE_LON, 5);
    expect(p?.timezone).toBe('America/New_York');
    expect(p?.ambiguous).toBeFalsy();
  });

  it('a New Jersey town missing from the offline table falls back to New Jersey, never to Tennessee', () => {
    const p = resolveBirthPlaceOffline(MIKE_TEXT);
    expect(p).not.toBeNull();
    expect(p!.timezone).toBe('America/New_York');
    expect(isInsideUsState(p!.latitude, p!.longitude, 'NJ')).toBe(true);
    expect(p!.confidence).toBe('low'); // state center: no angles from this
    expect(p!.canonicalName).not.toMatch(/tennessee/i);
  });

  it('"Franklin, TN" and "Franklin, NJ" resolve to different states', () => {
    const tn = resolveBirthPlaceOffline('Franklin, TN')!;
    const nj = resolveBirthPlaceOffline('Franklin, NJ')!;
    expect(isInsideUsState(tn.latitude, tn.longitude, 'TN')).toBe(true);
    expect(isInsideUsState(nj.latitude, nj.longitude, 'NJ')).toBe(true);
    expect(tn.timezone).not.toBe(nj.timezone);
  });

  it('a qualified offline city hit must sit inside the named state', () => {
    // "portland" is in the offline table as Portland, Oregon.
    const or = resolveBirthPlaceOffline('Portland, OR')!;
    expect(or.source).toBe('offline-city');
    expect(or.timezone).toBe('America/Los_Angeles');
    const me = resolveBirthPlaceOffline('Portland, ME')!;
    expect(me.source).not.toBe('offline-city'); // Oregon coordinates rejected
    expect(isInsideUsState(me.latitude, me.longitude, 'ME')).toBe(true);
    expect(me.timezone).toBe('America/New_York');
  });
});

// ── 5. Stale stored metadata is detected, not trusted ─────────────────────

describe('stale stored place metadata', () => {
  it('checkPlaceAgainstText rejects Franklin, Tennessee coordinates for New Jersey text', () => {
    const r = checkPlaceAgainstText(
      { latitude: STALE_FRANKLIN_TN.latitude, longitude: STALE_FRANKLIN_TN.longitude, canonicalName: STALE_FRANKLIN_TN.placeName },
      MIKE_TEXT,
    );
    expect(r.consistent).toBe(false);
  });

  it('rejects the stale coordinates even when no canonical name was saved', () => {
    const r = checkPlaceAgainstText(
      { latitude: STALE_FRANKLIN_TN.latitude, longitude: STALE_FRANKLIN_TN.longitude, canonicalName: null },
      MIKE_TEXT,
    );
    expect(r.consistent).toBe(false);
  });

  it('accepts coordinates that agree with the text', () => {
    expect(checkPlaceAgainstText({ latitude: 41.122, longitude: -74.5804, canonicalName: 'Franklin, Sussex County, New Jersey, United States' }, MIKE_TEXT).consistent).toBe(true);
    expect(checkPlaceAgainstText({ latitude: 34.2, longitude: -118.65, canonicalName: 'West Hills, California, United States' }, 'West Hills, CA').consistent).toBe(true);
  });

  it('resolveBirthMomentSync ignores stale stored coordinates and reports the conflict', () => {
    const m = resolveBirthMomentSync({
      birthDate: '1964-08-29',
      birthTime: '18:45',
      birthLocation: MIKE_TEXT,
      ...STALE_FRANKLIN_TN,
    });
    expect(m.storedPlaceConflict).toMatch(/does not fit/i);
    expect(m.zone?.id).not.toBe('America/Chicago');
    expect(m.place?.source).not.toBe('stored');
    if (m.place) expect(isInsideUsState(m.place.latitude, m.place.longitude, 'NJ')).toBe(true);
  });

  it('source coordinates outrank stale stored metadata outright', () => {
    const m = resolveBirthMomentSync(mikeInput(STALE_FRANKLIN_TN));
    expect(m.status).toBe('ok');
    expect(m.place?.source).toBe('source-coordinates');
    expect(m.zone?.id).toBe('America/New_York');
    expect(m.utc?.toISOString()).toBe('1964-08-29T22:45:00.000Z');
  });

  it('birthInputFromChart forwards source coordinates and universal time', () => {
    const input = birthInputFromChart({
      birthDate: '1964-08-29', birthTime: '18:45', birthLocation: MIKE_TEXT,
      ...STALE_FRANKLIN_TN,
      sourceLatitude: MIKE_LAT, sourceLongitude: MIKE_LON, sourceCoordinatesText: '74w35, 41n07', sourceUniversalTime: '22:45',
    });
    expect(input.sourceLatitude).toBeCloseTo(MIKE_LAT, 6);
    expect(input.sourceUniversalTime).toBe('22:45');
    const m = resolveBirthMomentSync(input);
    expect(m.zone?.id).toBe('America/New_York');
    expect(m.utc?.toISOString()).toBe('1964-08-29T22:45:00.000Z');
  });
});

// ── 6. Mike Sanders end to end ─────────────────────────────────────────────

describe('Mike Sanders regression (Franklin, NJ; Astro.com reference)', () => {
  it('normalizes to America/New_York, EDT, 1964-08-29T22:45Z from the printed coordinates', () => {
    const m = resolveBirthMomentSync(mikeInput());
    expect(m.status).toBe('ok');
    expect(m.zone?.id).toBe('America/New_York');
    expect(m.zone?.offsetSeconds).toBe(-4 * 3600);
    expect(m.utc?.toISOString()).toBe('1964-08-29T22:45:00.000Z');
    expect(m.place?.source).toBe('source-coordinates');
    expect(m.place?.latitude).toBeCloseTo(41.1167, 3);
    expect(m.place?.longitude).toBeCloseTo(-74.5833, 3);
    expect(m.canComputeAngles).toBe(true);
    expect(m.sourceUtcCheck?.matches).toBe(true);
    expect(m.audit?.timezoneId).toBe('America/New_York');
  });

  it('calculates Moon, Sun, True Node and Ascendant within arcminutes of Astro.com', () => {
    const m = resolveBirthMomentSync(mikeInput());
    const calc = calculateNatalFromMoment(m);
    const moon = calc.positions.Moon!.longitude;
    const sun = calc.positions.Sun!.longitude;
    const node = calc.positions.NorthNode!.longitude;
    expect(arcmin(moon, lon('Gemini', 0, 52))).toBeLessThan(2);
    expect(arcmin(sun, lon('Virgo', 6, 35))).toBeLessThan(2);
    expect(arcmin(node, lon('Gemini', 29, 35, 42))).toBeLessThan(2);
    expect(calc.angles).not.toBeNull();
    expect(arcmin(calc.angles!.ascendant, lon('Aquarius', 18, 38))).toBeLessThan(3);
    // And nothing like the old wrong answer.
    expect(arcmin(moon, lon('Gemini', 1, 27))).toBeGreaterThan(30);
    expect(arcmin(calc.angles!.ascendant, lon('Aquarius', 25, 44))).toBeGreaterThan(6 * 60);
  });

  it('the verifier marks the imported rows verified and does not flag the node for a missing R', () => {
    const planets: Record<string, VerifyPosition> = {
      Sun: { sign: 'Virgo', degree: 6, minutes: 35 },
      Moon: { sign: 'Gemini', degree: 0, minutes: 52 },
      NorthNode: { sign: 'Gemini', degree: 29, minutes: 35, seconds: 42 }, // no motion marker printed
      SouthNode: { sign: 'Sagittarius', degree: 29, minutes: 36 },
      Ascendant: { sign: 'Aquarius', degree: 18, minutes: 38 },
    };
    const report = verifyChartAgainstEphemeris({ ...mikeInput(), planets, houseCusps: {} });
    expect(report.readiness).toBe('ready');
    const row = (k: string) => report.results.find(r => r.body === k)!;
    expect(row('Sun').status).toBe('verified');
    expect(row('Moon').status).toBe('verified');
    expect(row('Ascendant').status).toBe('verified');
    expect(row('NorthNode').status).toBe('verified');
    expect(row('NorthNode').retrogradeMismatch).toBeFalsy();
    expect(row('SouthNode').retrogradeMismatch).toBeFalsy();
    expect(row('Ascendant').note || '').not.toMatch(/1 degree every 4 minutes/i);
  });

  it('an explicit retrograde marker on a body that calculates direct is still flagged', () => {
    // Mars was direct on 1964-08-29; a printed "R" would be a real discrepancy.
    const report = verifyChartAgainstEphemeris({ ...mikeInput(), planets: { Mars: { sign: 'Leo', degree: 5, minutes: 0, isRetrograde: true } }, houseCusps: {} });
    const mars = report.results.find(r => r.body === 'Mars')!;
    expect(mars.retrogradeMismatch).toBe(true);
  });

  it('a wrong universal time printed by the source is reported, not used', () => {
    const m = resolveBirthMomentSync(mikeInput({ sourceUniversalTime: '23:45' }));
    expect(m.utc?.toISOString()).toBe('1964-08-29T22:45:00.000Z');
    expect(m.sourceUtcCheck?.matches).toBe(false);
  });
});

// ── 7. Geocoder disambiguation (duplicate town names) ──────────────────────

describe('duplicate town names through the geocoder', () => {
  const realFetch = globalThis.fetch;
  beforeEach(() => {
    clearBirthPlaceCache();
    globalThis.fetch = fakeFetch({ franklin: FRANKLINS, springfield: SPRINGFIELDS }) as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
    clearBirthPlaceCache();
  });

  it('"Franklin" alone is ambiguous: no silent pick, candidates offered', async () => {
    const p = await resolveBirthPlace('Franklin');
    expect(p?.ambiguous).toBe(true);
    expect(p!.candidates!.length).toBeGreaterThan(5);
    expect(p!.candidates!.some(c => c.admin1 === 'New Jersey' && c.admin2 === 'Sussex')).toBe(true);
    expect(p!.candidates!.every(c => c.name === 'Franklin')).toBe(true); // "Franklin Park" excluded
  });

  it('"Franklin, NJ" never resolves to Tennessee; two NJ Franklins stay ambiguous until the county is given', async () => {
    const p = await resolveBirthPlace('Franklin, NJ');
    expect(p).not.toBeNull();
    expect(p!.timezone).toBe('America/New_York');
    expect(p!.ambiguous).toBe(true); // Sussex County vs Gloucester County
    expect(p!.candidates!.every(c => c.admin1 === 'New Jersey')).toBe(true);
  });

  it('"Franklin (Sussex County), NJ (US)" resolves to the Sussex County town', async () => {
    const p = await resolveBirthPlace(MIKE_TEXT);
    expect(p?.ambiguous).toBeFalsy();
    expect(p?.source).toBe('geocoder');
    expect(p?.admin1).toBe('New Jersey');
    expect(p?.admin2).toBe('Sussex');
    expect(p?.latitude).toBeCloseTo(41.122, 2);
    expect(p?.longitude).toBeCloseTo(-74.5804, 2);
    expect(p?.timezone).toBe('America/New_York');
    expect(p?.confidence).toBe('high');
  });

  it('"Franklin, TN" resolves to Tennessee', async () => {
    const p = await resolveBirthPlace('Franklin, TN');
    expect(p?.ambiguous).toBeFalsy();
    expect(p?.admin1).toBe('Tennessee');
    expect(p?.timezone).toBe('America/Chicago');
  });

  it('second cross-state case: Springfield', async () => {
    const bare = await resolveBirthPlace('Springfield');
    expect(bare?.ambiguous).toBe(true);
    const il = await resolveBirthPlace('Springfield, IL');
    expect(il?.ambiguous).toBeFalsy();
    expect(il?.admin1).toBe('Illinois');
    expect(il?.timezone).toBe('America/Chicago');
    const ma = await resolveBirthPlace('Springfield, Massachusetts, USA');
    expect(ma?.admin1).toBe('Massachusetts');
    expect(ma?.timezone).toBe('America/New_York');
    const or = await resolveBirthPlace('Springfield, OR');
    expect(or?.timezone).toBe('America/Los_Angeles');
  });

  it('a state with no such town gives no place from another state', async () => {
    const p = await resolveBirthPlace('Springfield, NJ');
    // Falls back to the New Jersey region only; never Missouri.
    expect(p?.timezone).toBe('America/New_York');
    expect(p?.source).toBe('offline-region');
    expect(p?.confidence).toBe('low');
  });

  it('cache keys keep the qualifiers apart', async () => {
    const tn = await resolveBirthPlace('Franklin, TN');
    const nj = await resolveBirthPlace(MIKE_TEXT);
    expect(tn?.admin1).toBe('Tennessee');
    expect(nj?.admin1).toBe('New Jersey');
    const again = await resolveBirthPlace(MIKE_TEXT);
    expect(again?.admin1).toBe('New Jersey');
  });

  it('an ambiguous place blocks the birth moment and the verifier', async () => {
    const m = await resolveBirthMoment({ birthDate: '1964-08-29', birthTime: '18:45', birthLocation: 'Franklin' });
    expect(m.status).toBe('ambiguous-place');
    expect(m.utc).toBeNull();
    expect(m.canComputeAngles).toBe(false);
    expect(m.placeCandidates.length).toBeGreaterThan(1);

    const report = await verifyChartAgainstEphemerisAsync({
      birthDate: '1964-08-29', birthTime: '18:45', birthLocation: 'Franklin',
      planets: { Sun: { sign: 'Virgo', degree: 6, minutes: 35 } }, houseCusps: {},
    });
    expect(report.readiness).toBe('ambiguous-place');
    expect(report.moment.placeCandidates.length).toBeGreaterThan(1);
  });

  it('choosing a candidate produces a confirmed place that calculates correctly', async () => {
    const m = await resolveBirthMoment({ birthDate: '1964-08-29', birthTime: '18:45', birthLocation: 'Franklin' });
    const sussex = m.placeCandidates.find(c => c.admin1 === 'New Jersey' && c.admin2 === 'Sussex')!;
    const place = placeFromCandidate('Franklin', sussex);
    expect(place.source).toBe('confirmed');
    const confirmed = resolveBirthMomentSync({
      birthDate: '1964-08-29', birthTime: '18:45', birthLocation: 'Franklin',
      timezoneId: place.timezone, latitude: place.latitude, longitude: place.longitude,
      placeName: place.canonicalName, placeConfidence: 'high', placeSource: 'confirmed',
    });
    expect(confirmed.status).toBe('ok');
    expect(confirmed.utc?.toISOString()).toBe('1964-08-29T22:45:00.000Z');
    const calc = calculateNatalFromMoment(confirmed);
    expect(arcmin(calc.positions.Moon!.longitude, lon('Gemini', 0, 52))).toBeLessThan(2);
    // The geocoder point is ~0.3' of longitude from the printed one: Ascendant within a few arcminutes.
    expect(arcmin(calc.angles!.ascendant, lon('Aquarius', 18, 38))).toBeLessThan(6);
  });

  it('a stale Franklin, TN record for Franklin, NJ text is re-resolved through the geocoder', async () => {
    const m = await resolveBirthMoment({
      birthDate: '1964-08-29', birthTime: '18:45', birthLocation: MIKE_TEXT, ...STALE_FRANKLIN_TN,
    });
    expect(m.storedPlaceConflict).toBeTruthy();
    expect(m.status).toBe('ok');
    expect(m.zone?.id).toBe('America/New_York');
    expect(m.utc?.toISOString()).toBe('1964-08-29T22:45:00.000Z');
    expect(m.place?.admin2).toBe('Sussex');
  });
});
