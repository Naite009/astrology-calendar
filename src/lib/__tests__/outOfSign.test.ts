import { describe, it, expect } from 'vitest';
import { analyzeSignVsDegree, isOutOfSignAspect } from '@/lib/aspects/outOfSign';

describe('sign vs degree (out of sign) analysis', () => {
  it('flags the Ava/Max Sun trine across Taurus and Aquarius', () => {
    const a = analyzeSignVsDegree({
      labelA: "Ava's Sun",
      signA: 'Taurus',
      degreeA: 28,
      minutesA: 42,
      labelB: "Max's Sun",
      signB: 'Aquarius',
      degreeB: 1,
      minutesB: 17,
      aspect: 'trine',
      aspectAngle: 120,
    });

    expect(a.isOutOfSign).toBe(true);
    expect(a.badge).toBe('Out of sign');
    // real positions, with minutes
    expect(a.positionA).toContain("28°42' Taurus");
    expect(a.positionB).toContain("1°17' Aquarius");
    // separation ~117°25', orb ~2°35'
    expect(a.aspectLine).toContain("117°25'");
    expect(a.aspectLine).toContain("2°35'");
    // sign layer: square-style, Earth vs Air, both fixed
    expect(a.signAspect).toBe('square');
    expect(a.signLine).toMatch(/square-style tension/);
    expect(a.signLine).toMatch(/Earth vs Air/);
    expect(a.signLine).toMatch(/both fixed/);
    expect(a.sameElement).toBe(false);
    expect(a.sameModality).toBe(true);
    // degree layer + synthesis holds both truths
    expect(a.degreeLine).toMatch(/By degree:/);
    expect(a.synthesisLine).toMatch(/Synthesis:/);
    expect(a.synthesisLine).toMatch(/Taurus\/Aquarius/);
    expect(a.lines.join(' ')).toContain('OUT OF SIGN');
  });

  it('does not flag an in-sign trine', () => {
    const a = analyzeSignVsDegree({
      labelA: 'Moon',
      signA: 'Taurus',
      degreeA: 10,
      labelB: 'Saturn',
      signB: 'Virgo',
      degreeB: 12,
      aspect: 'trine',
      aspectAngle: 120,
    });
    expect(a.isOutOfSign).toBe(false);
    expect(a.badge).toBeNull();
    expect(a.sameElement).toBe(true);
    expect(a.synthesisLine).toMatch(/agree/);
  });

  it('detects out-of-sign conjunction across a sign boundary', () => {
    const a = analyzeSignVsDegree({
      labelA: 'Venus',
      signA: 'Pisces',
      degreeA: 29,
      minutesA: 30,
      labelB: 'Mars',
      signB: 'Aries',
      degreeB: 1,
      minutesB: 0,
      aspect: 'conjunction',
      aspectAngle: 0,
    });
    expect(a.isOutOfSign).toBe(true);
    expect(a.signAspect).toBe('semisextile');
    expect(a.degreeLine).toMatch(/one unit/);
  });

  it('detects out-of-sign sextile, square and opposition', () => {
    const sextile = analyzeSignVsDegree({
      labelA: 'Mercury',
      signA: 'Gemini',
      degreeA: 0,
      labelB: 'Jupiter',
      signB: 'Cancer',
      degreeB: 28,
      aspect: 'sextile',
      aspectAngle: 60,
    });
    expect(sextile.isOutOfSign).toBe(true);
    expect(sextile.signAspect).toBe('semisextile');

    const square = analyzeSignVsDegree({
      labelA: 'Sun',
      signA: 'Aries',
      degreeA: 29,
      labelB: 'Saturn',
      signB: 'Leo',
      degreeB: 0,
      aspect: 'square',
      aspectAngle: 90,
    });
    expect(square.isOutOfSign).toBe(true);
    expect(square.signAspect).toBe('trine');
    // a trine BY SIGN must never be presented as elemental harmony when the
    // degrees make a square
    expect(square.synthesisLine).toMatch(/friction is real/);

    const opposition = analyzeSignVsDegree({
      labelA: 'Moon',
      signA: 'Virgo',
      degreeA: 29,
      labelB: 'Pluto',
      signB: 'Aquarius',
      degreeB: 0,
      aspect: 'opposition',
      aspectAngle: 180,
    });
    expect(opposition.isOutOfSign).toBe(true);
    expect(opposition.signAspect).toBe('quincunx');
  });

  it('isOutOfSignAspect is generic and boundary safe', () => {
    expect(isOutOfSignAspect('Taurus', 'Aquarius', 120)).toBe(true);
    expect(isOutOfSignAspect('Taurus', 'Virgo', 120)).toBe(false);
    expect(isOutOfSignAspect('Aries', 'Aries', 0)).toBe(false);
    expect(isOutOfSignAspect('', 'Aries', 0)).toBe(false);
  });
});
