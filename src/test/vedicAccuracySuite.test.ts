import { describe, it, expect } from 'vitest';
import { runVedicAccuracySuite, auditVedicPerson } from '@/lib/qa/vedicAccuracy';
import { REFERENCE_PEOPLE } from '@/test/fixtures/referencePeople';
import { AYANAMSA_MODE_LIST, ayanamsaFor } from '@/lib/vedic/ayanamsa';

const report = runVedicAccuracySuite();

describe('Vedic accuracy suite', () => {
  it('grades all twenty reference charts', () => {
    expect(report.totals.peopleCount).toBe(20);
    expect(report.totals.bodyChecks).toBeGreaterThan(150);
  });

  it('places every graha inside tolerance in sidereal longitude', () => {
    const off = report.people.flatMap(p =>
      p.bodies.filter(b => b.status !== 'pass').map(b => `${p.name} ${b.body} ${b.deltaArcmin?.toFixed(1)}'`),
    );
    expect(off).toEqual([]);
  });

  it('assigns sign, nakshatra, pada and whole-sign house consistently', () => {
    expect(report.totals.signPass).toBe(report.totals.signChecks);
    expect(report.totals.nakshatraPass).toBe(report.totals.nakshatraChecks);
    expect(report.totals.housePass).toBe(report.totals.houseChecks);
  });

  it('holds every structural invariant, including dasha and ashtakavarga', () => {
    const broken = report.people.flatMap(p =>
      p.invariants.filter(i => !i.ok).map(i => `${p.name}: ${i.name}. ${i.detail}`),
    );
    expect(broken).toEqual([]);
  });

  it('keeps every ayanamsa school inside a sane spread for every chart', () => {
    for (const person of REFERENCE_PEOPLE) {
      const utc = new Date(person.utc);
      const values = AYANAMSA_MODE_LIST.map(m => ayanamsaFor(utc, m));
      for (const v of values) {
        expect(v).toBeGreaterThan(19);
        expect(v).toBeLessThan(27);
      }
      expect(Math.max(...values) - Math.min(...values)).toBeLessThan(2);
    }
  });

  it('produces the same result on a second run', () => {
    const again = auditVedicPerson(REFERENCE_PEOPLE[0]);
    const first = report.people[0];
    expect(again.score).toBeCloseTo(first.score, 10);
    expect(again.bodies.map(b => b.actualSidereal)).toEqual(first.bodies.map(b => b.actualSidereal));
  });
});
