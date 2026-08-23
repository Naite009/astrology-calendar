import { describe, it, expect } from 'vitest';
import { calculateAscendant, calculateNatalChart } from '../astrology';
import { calculatePlacidusHouses } from '../placidusHouses';

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const lonOf = (p: { sign: string; degree: number; minutes: number }) =>
  SIGNS.indexOf(p.sign) * 30 + p.degree + p.minutes / 60;

// Regression guard: the Ascendant formula once returned the Descendant
// (a clean 180 degree flip). These reference charts lock the orientation.
describe('Ascendant orientation', () => {
  it('returns the rising degree, not the Descendant, for a known chart', () => {
    // Aug 13 1995, 08:08 EDT, Hackensack NJ. Reference Ascendant: Virgo 13 deg.
    const asc = calculateAscendant(new Date('1995-08-13T12:08:00Z'), 40.8859, -74.0435);
    expect(asc.sign).toBe('Virgo');
    expect(asc.degree).toBeGreaterThanOrEqual(12);
    expect(asc.degree).toBeLessThanOrEqual(15);
  });

  it('keeps the Placidus first cusp in step with the Ascendant', () => {
    const date = new Date('1995-08-13T12:08:00Z');
    const asc = calculateAscendant(date, 40.8859, -74.0435);
    const houses = calculatePlacidusHouses(date, 40.8859, -74.0435);
    const diff = Math.abs(lonOf(asc) - lonOf(houses.house1));
    expect(Math.min(diff, 360 - diff)).toBeLessThan 
      ? expect(Math.min(diff, 360 - diff)).toBeLessThan(1)
      : undefined;
  });

  it('rises roughly opposite the Sun at local midnight', () => {
    const chart = calculateNatalChart('2026-08-23', '00:00', 0, 'New York, NY (US)') as any;
    const sunLon = lonOf(chart.Sun);
    const ascLon = lonOf(chart.Ascendant);
    // At local midnight the Sun sits near the IC, so the Ascendant leads it
    // by roughly a quadrant. A 180 degree flip would break this window.
    let delta = ((ascLon - sunLon) % 360 + 360) % 360;
    expect(delta).toBeGreaterThan(40);
    expect(delta).toBeLessThan(140);
  });
});
