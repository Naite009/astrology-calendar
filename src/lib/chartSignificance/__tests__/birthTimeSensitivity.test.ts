import { describe, it, expect } from 'vitest';
import { solveBirthTimeSensitivity } from '../birthTimeSensitivity';
import { localToUtc } from '@/lib/time/zonedTime';
import { computeBody } from '@/lib/ephemerisEngine';

// Maria: Aug 30 1974, 4:10 AM, Livingston NJ, Placidus.
const coords = { latitude: 40.7959, longitude: -74.3149 };

describe('birth-time sensitivity solver', () => {
  const r = localToUtc('America/New_York', { year: 1974, month: 8, day: 30, hour: 4, minute: 10, second: 0 });
  const resolved = r.resolved;
  if (!resolved) throw new Error('Maria birth instant did not resolve');

  it('resolves 1974 New Jersey as EDT (UTC-4)', () => {
    expect(r.status).toBe('ok');
    expect(resolved.offsetSeconds).toBe(-4 * 3600);
  });

  it('places Maria\'s Moon in Aquarius 6th and solves the 7th-cusp crossing earlier', () => {
    const utc = resolved.utc;
    const moon = computeBody('Moon', utc);
    expect(moon.ok && Math.floor(moon.longitude / 30)).toBe(10); // Aquarius
    const s = solveBirthTimeSensitivity('Moon', utc, coords, 'placidus');
    expect(s.house).toBe(6);
    expect(s.earlier).not.toBeNull();
    if (!s.earlier) throw new Error('Moon crossing missing');
    expect(s.earlier.toHouse).toBe(7);
    expect(s.earlier.cusp).toBe(7);
    expect(s.earlier.residualDegrees).toBeLessThan(0.00001);
    // Bounded to a few minutes earlier; exact seconds come from the solver.
    expect(s.earlier.offsetSeconds).toBeLessThan(-132);
    expect(s.earlier.offsetSeconds).toBeGreaterThan(-135);
    // eslint-disable-next-line no-console
    console.log('Maria Moon crossing offset (s):', s.earlier.offsetSeconds, s.earlier.utc.toISOString());
  });
});
