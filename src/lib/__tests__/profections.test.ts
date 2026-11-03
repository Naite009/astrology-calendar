import { describe, it, expect } from 'vitest';
import {
  getAnnualProfection,
  getMonthlyProfections,
  getYearTransits,
  lastBirthday,
  TRADITIONAL_RULERS,
} from '../profections';

const BIRTH = '1985-06-15'; // Gemini rising chart owner

describe('getAnnualProfection', () => {
  it('maps age to house: age 0 is house 1, age 12 is house 1 again', () => {
    const atBirth = getAnnualProfection(BIRTH, 'Gemini', new Date(1985, 5, 15));
    expect(atBirth?.age).toBe(0);
    expect(atBirth?.house).toBe(1);
    expect(atBirth?.sign).toBe('Gemini');
    expect(atBirth?.timeLord).toBe('Mercury');

    const at12 = getAnnualProfection(BIRTH, 'Gemini', new Date(1997, 6, 1));
    expect(at12?.age).toBe(12);
    expect(at12?.house).toBe(1);
  });

  it('advances one whole sign per year from the rising sign', () => {
    // Age 40 (June 2025-June 2026): house 5, Gemini + 4 = Libra, lord Venus
    const p = getAnnualProfection(BIRTH, 'Gemini', new Date(2026, 2, 1));
    expect(p?.age).toBe(40);
    expect(p?.house).toBe(5);
    expect(p?.sign).toBe('Libra');
    expect(p?.timeLord).toBe('Venus');
  });

  it('runs birthday to birthday, not January to January', () => {
    // One day before the 2026 birthday: still the age-40 year
    const before = getAnnualProfection(BIRTH, 'Gemini', new Date(2026, 5, 14));
    expect(before?.age).toBe(40);
    expect(before?.yearStart.getFullYear()).toBe(2025);
    // On the birthday: the age-41 year begins
    const after = getAnnualProfection(BIRTH, 'Gemini', new Date(2026, 5, 15));
    expect(after?.age).toBe(41);
    expect(after?.house).toBe(6);
  });

  it('returns null without a birth date or rising sign', () => {
    expect(getAnnualProfection('', 'Gemini')).toBeNull();
    expect(getAnnualProfection(BIRTH, undefined)).toBeNull();
  });
});

describe('getMonthlyProfections', () => {
  it('builds 12 months starting on the birthday, advancing one sign each', () => {
    const annual = getAnnualProfection(BIRTH, 'Gemini', new Date(2026, 2, 1))!;
    const months = getMonthlyProfections(annual, 'Gemini', new Date(2026, 2, 1));
    expect(months).toHaveLength(12);
    expect(months[0].house).toBe(annual.house);
    expect(months[0].sign).toBe(annual.sign);
    expect(months[1].house).toBe(annual.house + 1);
    expect(months[11].house).toBe(((annual.house - 1 + 11) % 12) + 1);
    // Month 0 starts on the birthday
    expect(months[0].start.getDate()).toBe(15);
    expect(months[0].start.getMonth()).toBe(5); // June
  });

  it('flags exactly one current month', () => {
    const annual = getAnnualProfection(BIRTH, 'Gemini', new Date(2026, 2, 1))!;
    const months = getMonthlyProfections(annual, 'Gemini', new Date(2026, 2, 1));
    const current = months.filter((m) => m.isCurrent);
    expect(current).toHaveLength(1);
    // March 1, 2026 is in the month that started Feb 15, 2026 (index 8)
    expect(current[0].monthIndex).toBe(8);
  });

  it('every monthly lord is the traditional ruler of its sign', () => {
    const annual = getAnnualProfection(BIRTH, 'Gemini', new Date(2026, 2, 1))!;
    const months = getMonthlyProfections(annual, 'Gemini');
    for (const m of months) {
      expect(m.lord).toBe(TRADITIONAL_RULERS[m.sign]);
    }
  });
});

describe('getYearTransits', () => {
  it('returns the five slow planets with valid signs and houses', () => {
    const annual = getAnnualProfection(BIRTH, 'Gemini', new Date(2026, 2, 1))!;
    const transits = getYearTransits(annual, 'Gemini');
    expect(transits.map((t) => t.planet)).toEqual(['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
    for (const t of transits) {
      expect(t.startHouse).toBeGreaterThanOrEqual(1);
      expect(t.startHouse).toBeLessThanOrEqual(12);
      expect(t.startSign.length).toBeGreaterThan(0);
    }
  });

  it('maps signs to whole-sign houses from the rising sign', () => {
    const annual = getAnnualProfection(BIRTH, 'Gemini', new Date(2026, 2, 1))!;
    const transits = getYearTransits(annual, 'Gemini');
    const pluto = transits.find((t) => t.planet === 'Pluto')!;
    // Pluto is in Aquarius in 2025-26; Aquarius is the 9th whole-sign house from Gemini
    expect(pluto.startSign).toBe('Aquarius');
    expect(pluto.startHouse).toBe(9);
  });

  it('solves exact ingress dates, including retrograde dips in and back out', () => {
    // Year: June 15, 2025 to June 15, 2026. Uranus enters Gemini in July 2025,
    // retrogrades back into Taurus in November 2025, and re-enters Gemini in
    // April 2026. All three crossings must appear, in order.
    const annual = getAnnualProfection(BIRTH, 'Gemini', new Date(2025, 11, 1))!;
    expect(annual.yearStart.getFullYear()).toBe(2025);
    const transits = getYearTransits(annual, 'Gemini');
    const uranus = transits.find((t) => t.planet === 'Uranus')!;

    expect(uranus.startSign).toBe('Taurus');
    expect(uranus.endSign).toBe('Gemini');
    expect(uranus.ingresses.length).toBe(3);

    const [into, backOut, reEntry] = uranus.ingresses;
    // Into Gemini: early July 2025, direct motion
    expect(into.toSign).toBe('Gemini');
    expect(into.date.getMonth()).toBe(6); // July
    expect(into.retrograde).toBe(false);
    // Back into Taurus: November 2025, retrograde
    expect(backOut.toSign).toBe('Taurus');
    expect(backOut.date.getMonth()).toBe(10); // November
    expect(backOut.retrograde).toBe(true);
    // Re-entry into Gemini: spring 2026, direct
    expect(reEntry.toSign).toBe('Gemini');
    expect(reEntry.date.getFullYear()).toBe(2026);
    expect(reEntry.retrograde).toBe(false);
    // Ingresses are chronological
    expect(into.date.getTime()).toBeLessThan(backOut.date.getTime());
    expect(backOut.date.getTime()).toBeLessThan(reEntry.date.getTime());
  });

  it('reports no ingresses for a planet that holds its sign all year', () => {
    const annual = getAnnualProfection(BIRTH, 'Gemini', new Date(2026, 2, 1))!;
    const transits = getYearTransits(annual, 'Gemini');
    const pluto = transits.find((t) => t.planet === 'Pluto')!;
    expect(pluto.changesSign).toBe(false);
    expect(pluto.ingresses).toHaveLength(0);
  });
});

describe('lastBirthday', () => {
  it('returns the same day when today is the birthday', () => {
    const d = lastBirthday(BIRTH, new Date(2026, 5, 15))!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(15);
  });
});
