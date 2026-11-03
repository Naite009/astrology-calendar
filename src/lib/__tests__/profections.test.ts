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
});

describe('lastBirthday', () => {
  it('returns the same day when today is the birthday', () => {
    const d = lastBirthday(BIRTH, new Date(2026, 5, 15))!;
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5);
    expect(d.getDate()).toBe(15);
  });
});
