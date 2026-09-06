/**
 * Regression tests for the birth date/time/place pipeline and the shared
 * ephemeris path.
 *
 * Every chart in the app goes: local civil time at the birthplace -> IANA zone
 * with historical rules -> one UTC instant -> ephemerisEngine. These tests pin
 * the conversion for the tricky cases (DST overlaps and gaps, fractional
 * zones, the date line, the southern hemisphere), the circular longitude
 * comparison, and the rule that every calculator consumes the same instant
 * and coordinates.
 */

import { describe, it, expect } from 'vitest';
import {
  resolveBirthMomentSync,
  parseBirthTime,
  parseBirthDate,
  type BirthInput,
} from '../birthDataNormalization';
import { localToUtc, zoneOffsetSeconds, formatUtcOffset } from '../time/zonedTime';
import { resolveBirthPlaceOffline } from '../geo/birthPlace';
import { calculateNatalFromMoment } from '../natalChartCalculation';
import {
  ALL_BODY_KEYS,
  circularSeparation,
  signedCircularDelta,
  signPositionToLongitude,
  longitudeToSignPosition,
  computeBodies,
  computeAngles,
  norm360,
} from '../ephemerisEngine';
import { verifyChartWithMoment, verifyChartAgainstEphemeris } from '../chartEphemerisVerify';
import { autoFillChartBodies, birthMomentOf } from '../chartAutoFill';
import type { NatalChart } from '@/hooks/useNatalChart';

const utcOf = (input: BirthInput) => {
  const m = resolveBirthMomentSync(input);
  expect(m.status, `${input.birthLocation} ${input.birthDate} ${input.birthTime}: ${m.warnings.join(' | ')}`).toBe('ok');
  return m;
};

const arcmin = (a: number, b: number) => circularSeparation(a, b) * 60;
const lon = (sign: string, deg: number, min: number, sec = 0) =>
  signPositionToLongitude({ sign, degree: deg, minutes: min, seconds: sec })!;

// ── The West Hills regression ───────────────────────────────────────────────

describe('West Hills, California, 2011-05-19 18:06 (Astro.com reference)', () => {
  const input: BirthInput = { birthDate: '2011-05-19', birthTime: '18:06', birthLocation: 'West Hills, California' };

  it('resolves the birthplace to America/Los_Angeles with precise coordinates', () => {
    const m = utcOf(input);
    expect(m.place?.timezone).toBe('America/Los_Angeles');
    expect(m.place?.confidence).toBe('high');
    expect(m.place?.latitude).toBeCloseTo(34.197, 1);
    expect(m.place?.longitude).toBeCloseTo(-118.644, 1);
  });

  it('uses PDT (UTC-7) on that date, not a fixed regional offset', () => {
    const m = utcOf(input);
    expect(m.zone?.id).toBe('America/Los_Angeles');
    expect(m.zone?.abbreviation).toBe('PDT');
    expect(m.zone?.offsetSeconds).toBe(-7 * 3600);
    expect(m.utc?.toISOString()).toBe('2011-05-20T01:06:00.000Z');
    expect(m.timePrecision).toBe('minute');
    expect(m.audit?.offsetAtBirth).toContain('-07:00');
  });

  it('matches the Astro.com Moon (Capricorn 2°45\') to within 3 arc-minutes', () => {
    const calc = calculateNatalFromMoment(utcOf(input));
    const moon = calc.positions.Moon;
    expect(moon.sign).toBe('Capricorn');
    expect(arcmin(moon.longitude, lon('Capricorn', 2, 45))).toBeLessThan(3);
  });

  it('puts the Ascendant in early Scorpio (Astro.com 7°09\'), within 1 degree', () => {
    // Any residual is coordinate choice (neighborhood centroid vs. Astro.com's
    // atlas entry), not a zone or time error. It is reported, not forced.
    const calc = calculateNatalFromMoment(utcOf(input));
    expect(calc.anglesReason).toBeNull();
    const asc = calc.positions.Ascendant;
    expect(asc.sign).toBe('Scorpio');
    expect(arcmin(asc.longitude, lon('Scorpio', 7, 9))).toBeLessThan(60);
  });

  it('verifies the imported values instead of flagging them', () => {
    const report = verifyChartAgainstEphemeris({
      ...input,
      planets: {
        Moon: { sign: 'Capricorn', degree: 2, minutes: 45 },
        Ascendant: { sign: 'Scorpio', degree: 7, minutes: 9 },
      },
    });
    expect(report.readiness).toBe('ready');
    expect(report.audit?.timezoneId).toBe('America/Los_Angeles');
    expect(report.audit?.utcDateTime).toContain('2011-05-20T01:06:00');
    const moon = report.results.find(r => r.body === 'Moon')!;
    expect(moon.status).toBe('verified');
    const asc = report.results.find(r => r.body === 'Ascendant')!;
    expect(['verified', 'close']).toContain(asc.status);
    expect(report.canApplyBodies).toBe(true);
    expect(report.canApplyAngles).toBe(true);
  });
});

// ── Same city, winter vs summer ─────────────────────────────────────────────

describe('DST-observing city, winter vs summer', () => {
  it('New York uses EST (-5) in January and EDT (-4) in July', () => {
    const winter = utcOf({ birthDate: '2010-01-15', birthTime: '10:00', birthLocation: 'New York, NY' });
    const summer = utcOf({ birthDate: '2010-07-15', birthTime: '10:00', birthLocation: 'New York, NY' });
    expect(winter.zone?.abbreviation).toBe('EST');
    expect(winter.utc?.toISOString()).toBe('2010-01-15T15:00:00.000Z');
    expect(summer.zone?.abbreviation).toBe('EDT');
    expect(summer.utc?.toISOString()).toBe('2010-07-15T14:00:00.000Z');
  });

  it('applies the pre-2007 US rule set (no DST on 2006-03-20, DST on 2007-03-20)', () => {
    const before = utcOf({ birthDate: '2006-03-20', birthTime: '12:00', birthLocation: 'Chicago, IL' });
    const after = utcOf({ birthDate: '2007-03-20', birthTime: '12:00', birthLocation: 'Chicago, IL' });
    expect(before.zone?.offsetSeconds).toBe(-6 * 3600);
    expect(after.zone?.offsetSeconds).toBe(-5 * 3600);
  });
});

// ── Fall-back overlap and spring-forward gap ────────────────────────────────

describe('DST overlap (ambiguous) and gap (nonexistent) times', () => {
  const overlap: BirthInput = { birthDate: '2021-11-07', birthTime: '01:30', birthLocation: 'New York, NY' };
  const gap: BirthInput = { birthDate: '2021-03-14', birthTime: '02:30', birthLocation: 'New York, NY' };

  it('does not guess an ambiguous time; it asks for the fold', () => {
    const m = resolveBirthMomentSync(overlap);
    expect(m.status).toBe('needs-fold');
    expect(m.utc).toBeNull();
    expect(m.foldCandidates.map(c => c.utc.toISOString())).toEqual([
      '2021-11-07T05:30:00.000Z',
      '2021-11-07T06:30:00.000Z',
    ]);
    expect(m.foldCandidates.map(c => c.abbreviation)).toEqual(['EDT', 'EST']);
  });

  it('honors the chosen fold', () => {
    expect(utcOf({ ...overlap, dstFold: 'earlier' }).utc?.toISOString()).toBe('2021-11-07T05:30:00.000Z');
    expect(utcOf({ ...overlap, dstFold: 'later' }).utc?.toISOString()).toBe('2021-11-07T06:30:00.000Z');
  });

  it('blocks verification until the fold is chosen', () => {
    const report = verifyChartWithMoment(resolveBirthMomentSync(overlap), {});
    expect(report.readiness).toBe('needs-fold');
    expect(report.blockedReason).toBeTruthy();
    expect(report.results).toHaveLength(0);
    expect(report.foldCandidates).toHaveLength(2);
    expect(report.canApplyBodies).toBe(false);
  });

  it('rejects a nonexistent time and suggests the first real clock reading', () => {
    const m = resolveBirthMomentSync(gap);
    expect(m.status).toBe('nonexistent');
    expect(m.utc).toBeNull();
    expect(m.suggestedLocal?.hour).toBe(3);
    expect(m.suggestedLocal?.minute).toBe(30);
    const report = verifyChartWithMoment(m, {});
    expect(report.readiness).toBe('nonexistent-time');
    expect(report.suggestedTime).toBe('03:30');
  });

  it('localToUtc reports the gap size', () => {
    const r = localToUtc('America/New_York', { year: 2021, month: 3, day: 14, hour: 2, minute: 30, second: 0 });
    expect(r.status).toBe('nonexistent');
    expect(r.gapSeconds).toBe(3600);
  });
});

// ── Zones without DST, fractional zones, the date line, the south ───────────

describe('Non-DST, fractional, date-line and southern-hemisphere zones', () => {
  it('Phoenix never shifts (MST all year)', () => {
    const jan = utcOf({ birthDate: '2015-01-01', birthTime: '12:00', birthLocation: 'Phoenix, AZ' });
    const jul = utcOf({ birthDate: '2015-07-01', birthTime: '12:00', birthLocation: 'Phoenix, AZ' });
    expect(jan.zone?.id).toBe('America/Phoenix');
    expect(jan.zone?.offsetSeconds).toBe(-7 * 3600);
    expect(jul.zone?.offsetSeconds).toBe(-7 * 3600);
  });

  it('India is +05:30 and the half hour survives the conversion', () => {
    const m = utcOf({ birthDate: '1990-06-15', birthTime: '06:30', birthLocation: 'Mumbai, India' });
    expect(m.zone?.id).toBe('Asia/Kolkata');
    expect(m.zone?.offsetSeconds).toBe(5.5 * 3600);
    expect(m.utc?.toISOString()).toBe('1990-06-15T01:00:00.000Z');
    expect(formatUtcOffset(m.zone!.offsetSeconds)).toBe('UTC+05:30');
  });

  it('Nepal is +05:45 (after 1986) and the 45 minutes survive', () => {
    const m = utcOf({ birthDate: '2000-01-01', birthTime: '12:00', birthLocation: 'Kathmandu, Nepal' });
    expect(m.zone?.id).toBe('Asia/Kathmandu');
    expect(m.zone?.offsetSeconds).toBe(5.75 * 3600);
    expect(m.utc?.toISOString()).toBe('2000-01-01T06:15:00.000Z');
  });

  it('Samoa (west of the line after 2011) is +14 and American Samoa (east) is -11 at the same clock time', () => {
    const apia = utcOf({ birthDate: '2012-01-05', birthTime: '12:00', birthLocation: 'Apia, Samoa' });
    const pago = utcOf({ birthDate: '2012-01-05', birthTime: '12:00', birthLocation: 'Pago Pago, American Samoa' });
    expect(apia.zone?.id).toBe('Pacific/Apia');
    expect(apia.utc?.toISOString()).toBe('2012-01-04T22:00:00.000Z');
    expect(pago.zone?.id).toBe('Pacific/Pago_Pago');
    expect(pago.utc?.toISOString()).toBe('2012-01-05T23:00:00.000Z');
    // 25 hours apart on the clock, same day number, opposite sides of the line.
    expect(pago.utc!.getTime() - apia.utc!.getTime()).toBe(25 * 3600 * 1000);
  });

  it('Samoa skipped 30 December 2011 entirely; that date is not silently accepted', () => {
    const m = resolveBirthMomentSync({ birthDate: '2011-12-30', birthTime: '12:00', birthLocation: 'Apia, Samoa' });
    expect(m.status).not.toBe('ok');
    expect(m.utc).toBeNull();
  });

  it('Sydney is AEDT (+11) in January and AEST (+10) in July', () => {
    const jan = utcOf({ birthDate: '2020-01-15', birthTime: '12:00', birthLocation: 'Sydney, Australia' });
    const jul = utcOf({ birthDate: '2020-07-15', birthTime: '12:00', birthLocation: 'Sydney, Australia' });
    expect(jan.zone?.id).toBe('Australia/Sydney');
    expect(jan.zone?.offsetSeconds).toBe(11 * 3600);
    expect(jan.utc?.toISOString()).toBe('2020-01-15T01:00:00.000Z');
    expect(jul.zone?.offsetSeconds).toBe(10 * 3600);
    expect(jul.utc?.toISOString()).toBe('2020-07-15T02:00:00.000Z');
  });

  it('a southern-hemisphere fall-back (Sydney 2020-04-05 02:30) is ambiguous, not guessed', () => {
    const m = resolveBirthMomentSync({ birthDate: '2020-04-05', birthTime: '02:30', birthLocation: 'Sydney, Australia' });
    expect(m.status).toBe('needs-fold');
    expect(m.foldCandidates.map(c => c.offsetSeconds)).toEqual([11 * 3600, 10 * 3600]);
    expect(m.foldCandidates.map(c => c.abbreviation)).toEqual(['AEDT', 'AEST']);
  });

  it('historical offsets come from tzdata, not a modern table (Kolkata 1940 was +06:30 war time)', () => {
    expect(zoneOffsetSeconds('Asia/Kolkata', Date.UTC(1943, 5, 1))).toBe(6.5 * 3600);
  });
});

// ── Region-only places and legacy records ──────────────────────────────────

describe('Low-confidence places and legacy fixed offsets', () => {
  it('a state name resolves the zone but blocks angles and houses', () => {
    const m = utcOf({ birthDate: '1990-03-03', birthTime: '08:00', birthLocation: 'Arizona, USA' });
    expect(m.place?.confidence).toBe('low');
    expect(m.canComputeAngles).toBe(false);
    const calc = calculateNatalFromMoment(m);
    expect(calc.positions.Sun).toBeDefined();
    expect(calc.positions.Ascendant).toBeUndefined();
    expect(calc.houseCusps).toBeNull();
    expect(calc.anglesReason).toMatch(/region|town/i);
  });

  it('an old record with only a numeric offset is computed but never marked verified', () => {
    const m = resolveBirthMomentSync({
      birthDate: '1985-08-01', birthTime: '09:00', birthLocation: 'Unknown Village, Nowhere', timezoneOffset: -5,
    });
    expect(m.status).toBe('ok');
    expect(m.zone?.id).toBe('fixed-offset');
    expect(m.canComputeAngles).toBe(false);
    expect(m.warnings.length).toBeGreaterThan(0);
    const report = verifyChartWithMoment(m, { planets: { Sun: { sign: 'Leo', degree: 9, minutes: 0 } } });
    expect(report.readiness).toBe('legacy-offset');
    expect(report.canApplyBodies).toBe(false);
    expect(report.results.every(r => r.status !== 'verified')).toBe(true);
  });

  it('an unresolvable place with no offset stops instead of guessing', () => {
    const m = resolveBirthMomentSync({ birthDate: '1985-08-01', birthTime: '09:00', birthLocation: 'Unknown Village, Nowhere' });
    expect(m.status).toBe('no-place');
    expect(m.utc).toBeNull();
  });

  it('a missing birth time uses noon, says so, and blocks angles', () => {
    const m = utcOf({ birthDate: '1975-12-25', birthTime: null, birthLocation: 'Paris, France' });
    expect(m.timeAssumed).toBe(true);
    expect(m.local?.hour).toBe(12);
    expect(m.canComputeAngles).toBe(false);
    expect(calculateNatalFromMoment(m).anglesReason).toMatch(/No birth time/);
  });
});

// ── Time precision ─────────────────────────────────────────────────────────

describe('Time parsing keeps the precision the source gave', () => {
  it('HH:MM is minute precision with :00 seconds', () => {
    expect(parseBirthTime('18:06')).toEqual({ hour: 18, minute: 6, second: 0, precision: 'minute' });
  });
  it('HH:MM:SS keeps the seconds', () => {
    expect(parseBirthTime('18:06:42')).toEqual({ hour: 18, minute: 6, second: 42, precision: 'second' });
  });
  it('12-hour clock is accepted', () => {
    expect(parseBirthTime('6:06 PM')).toMatchObject({ hour: 18, minute: 6 });
    expect(parseBirthTime('12:15 AM')).toMatchObject({ hour: 0, minute: 15 });
  });
  it('several date spellings normalize to the same civil date', () => {
    for (const raw of ['2011-05-19', '05/19/2011', 'May 19, 2011', '2011/05/19']) {
      expect(parseBirthDate(raw), raw).toEqual({ year: 2011, month: 5, day: 19 });
    }
  });
  it('seconds flow through to the UTC instant', () => {
    const m = utcOf({ birthDate: '2011-05-19', birthTime: '18:06:42', birthLocation: 'West Hills, California' });
    expect(m.timePrecision).toBe('second');
    expect(m.utc?.toISOString()).toBe('2011-05-20T01:06:42.000Z');
  });
});

// ── Circular longitude comparison ──────────────────────────────────────────

describe('Circular longitude comparison around 0 Aries', () => {
  it('359.5 and 0.5 are one degree apart, in both directions', () => {
    expect(circularSeparation(359.5, 0.5)).toBeCloseTo(1, 9);
    expect(circularSeparation(0.5, 359.5)).toBeCloseTo(1, 9);
    // signedCircularDelta(a, b) is a - b wrapped into (-180, 180].
    expect(signedCircularDelta(359.5, 0.5)).toBeCloseTo(-1, 9);
    expect(signedCircularDelta(0.5, 359.5)).toBeCloseTo(1, 9);
  });

  it('Pisces 29°59\' and Aries 0°01\' verify as the same position', () => {
    const a = lon('Pisces', 29, 59);
    const b = lon('Aries', 0, 1);
    expect(circularSeparation(a, b) * 60).toBeCloseTo(2, 6);
    expect(circularSeparation(a, b)).toBeLessThan(180);
  });

  it('opposite points are 180, never 540 or -180 wrapped wrong', () => {
    expect(circularSeparation(10, 190)).toBeCloseTo(180, 9);
    expect(circularSeparation(350, 170)).toBeCloseTo(180, 9);
  });

  it('sign/degree round-trips do not round before comparing', () => {
    const l = 29.999 + 330; // Pisces 29°59'56"
    const sp = longitudeToSignPosition(l);
    expect(sp.sign).toBe('Pisces');
    expect(signPositionToLongitude(sp)).toBeCloseTo(l, 3);
  });

  it('norm360 handles negatives and multiples', () => {
    expect(norm360(-1)).toBe(359);
    expect(norm360(720.25)).toBeCloseTo(0.25, 9);
  });
});

// ── One instant, one set of coordinates, every calculator ──────────────────

describe('Every calculator consumes the same UTC instant and coordinates', () => {
  const input: BirthInput = { birthDate: '2011-05-19', birthTime: '18:06', birthLocation: 'West Hills, California' };

  it('the natal calculation equals a direct engine call at moment.utc / place', () => {
    const m = utcOf(input);
    const calc = calculateNatalFromMoment(m);
    const direct = computeBodies(m.utc!, ALL_BODY_KEYS, m.settings);
    for (const key of ALL_BODY_KEYS) {
      const d = direct[key];
      if (d.ok) {
        expect(calc.positions[key]?.longitude, key).toBeCloseTo(d.longitude, 9);
      } else {
        expect(calc.positions[key], key).toBeUndefined();
      }
    }
    const angles = computeAngles(m.utc!, m.place!.latitude, m.place!.longitude, m.settings.houseSystem);
    expect(calc.angles?.ascendant).toBeCloseTo(angles.ascendant, 9);
    expect(calc.angles?.mc).toBeCloseTo(angles.mc, 9);
    expect(calc.angles?.vertex).toBeCloseTo(angles.vertex, 9);
    expect(calc.houseCusps?.house1.longitude).toBeCloseTo(angles.ascendant, 9);
    expect(calc.houseCusps?.house10.longitude).toBeCloseTo(angles.mc, 9);
  });

  it('auto-fill derives from the identical instant and never touches typed values', () => {
    const m = utcOf(input);
    const calc = calculateNatalFromMoment(m);
    const typedSun = { sign: 'Gemini', degree: 28, minutes: 30, seconds: 0 };
    const chart = {
      id: 't', name: 'T', birthDate: input.birthDate, birthTime: input.birthTime, birthLocation: input.birthLocation,
      timezoneId: m.zone!.id, latitude: m.place!.latitude, longitude: m.place!.longitude,
      placeName: m.place!.canonicalName, placeConfidence: 'high',
      planets: { Sun: typedSun },
    } as unknown as NatalChart;

    expect(birthMomentOf(chart)?.toISOString()).toBe(m.utc!.toISOString());

    const filled = autoFillChartBodies(chart) as NatalChart & { derivedBodies?: string[] };
    expect(filled.planets.Sun).toEqual(typedSun); // typed value untouched, even though it is wrong
    const chiron = filled.planets.Chiron!;
    expect(signPositionToLongitude(chiron)!).toBeCloseTo(
      signPositionToLongitude(calc.positions.Chiron)!, 3,
    );
    const nn = filled.planets.NorthNode!;
    expect(signPositionToLongitude(nn)!).toBeCloseTo(signPositionToLongitude(calc.positions.NorthNode)!, 3);
    expect(filled.houseCusps?.house1.sign).toBe(calc.positions.Ascendant.sign);
    expect(filled.derivedBodies).toContain('houseCusps');
    expect(filled.derivedBodies).not.toContain('Sun');
  });

  it('the verifier compares against the same calculation', () => {
    const m = utcOf(input);
    const calc = calculateNatalFromMoment(m);
    const report = verifyChartWithMoment(m, {});
    for (const row of report.results) {
      if (row.computedLongitude === null) continue;
      expect(row.computedLongitude, row.body).toBeCloseTo(calc.positions[row.body].longitude, 9);
    }
    expect(report.audit?.utcDateTime.replace(/\.000Z$/, 'Z')).toBe(m.utc!.toISOString().replace(/\.000Z$/, 'Z'));
  });

  it('stored metadata wins over re-resolving the text, and matches the offline result', () => {
    const fromText = utcOf(input);
    const fromStored = utcOf({
      ...input,
      timezoneId: fromText.zone!.id,
      latitude: fromText.place!.latitude,
      longitude: fromText.place!.longitude,
      placeName: fromText.place!.canonicalName,
      placeConfidence: 'high',
    });
    expect(fromStored.place?.source).toBe('stored');
    expect(fromStored.utc?.toISOString()).toBe(fromText.utc?.toISOString());
  });
});

// ── Slow bodies: real data or nothing ──────────────────────────────────────

describe('Chiron and asteroids fail transparently outside the JPL table', () => {
  it('1900 has no Chiron/asteroid values and says why', () => {
    const m = utcOf({ birthDate: '1900-06-01', birthTime: '12:00', birthLocation: 'London, England' });
    const calc = calculateNatalFromMoment(m);
    for (const key of ['Chiron', 'Ceres', 'Pallas', 'Juno', 'Vesta', 'Eris']) {
      expect(calc.positions[key], key).toBeUndefined();
      const u = calc.unavailable.find(x => x.key === key);
      expect(u?.reason, key).toMatch(/1920|range|outside|data/i);
    }
    // Planets and nodes are still computed.
    expect(calc.positions.Sun).toBeDefined();
    expect(calc.positions.NorthNode).toBeDefined();
    const report = verifyChartWithMoment(m, {});
    expect(report.results.find(r => r.body === 'Chiron')?.status).toBe('unavailable');
  });

  it('1990 has Chiron from the table, labelled as such', () => {
    const m = utcOf({ birthDate: '1990-06-01', birthTime: '12:00', birthLocation: 'London, England' });
    const calc = calculateNatalFromMoment(m);
    expect(calc.positions.Chiron?.source).toBe('jpl-horizons-table');
  });
});

// ── Offline resolver sanity ────────────────────────────────────────────────

describe('Offline place resolver', () => {
  it('handles state codes, state names and no-comma forms', () => {
    for (const q of ['West Hills, CA', 'West Hills, California', 'West Hills California', 'west hills, ca, usa']) {
      const p = resolveBirthPlaceOffline(q);
      expect(p?.timezone, q).toBe('America/Los_Angeles');
      expect(p?.confidence, q).toBe('high');
    }
  });
  it('returns null for nonsense rather than a default city', () => {
    expect(resolveBirthPlaceOffline('qwertyuiop')).toBeNull();
  });
});
