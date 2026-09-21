import { describe, it, expect } from 'vitest';
import { pairAspectReading, aspectFamilyOf, CURATED_PAIR_KEYS } from '../aspectPairLibrary';
import { CORE_BODIES } from '../factorMeanings';
import { FORBIDDEN_INTERPRETIVE_PHRASES } from '@/lib/interpretation/languagePolicy';

const ASPECTS = ['conjunction', 'trine', 'sextile', 'square', 'opposition'];

describe('aspect pair library', () => {
  it('maps aspects to the right family', () => {
    expect(aspectFamilyOf('conjunction')).toBe('conjunction');
    expect(aspectFamilyOf('Trine')).toBe('flowing');
    expect(aspectFamilyOf('sextile')).toBe('flowing');
    expect(aspectFamilyOf('square')).toBe('hard');
    expect(aspectFamilyOf('opposition')).toBe('hard');
  });

  it('gives Mars conjunct Mercury real content, not just the geometry', () => {
    const r = pairAspectReading('Mars', 'Mercury', 'conjunction', 2.8);
    expect(r.curated).toBe(true);
    const all = [r.headline, ...r.howItWorks, ...r.mayShowUp, r.watchFor, r.whatToSay].join(' ').toLowerCase();
    expect(all).not.toContain('work as one unit');
    expect(all).toMatch(/sharp|harsh|irritation|quick/);
    expect(r.mayShowUp.length).toBeGreaterThanOrEqual(3);
    expect(r.strengthNote).toContain('2.8');
  });

  it('gives Mercury conjunct Jupiter fast-and-wide mind content', () => {
    const r = pairAspectReading('Mercury', 'Jupiter', 'conjunction', 1.2);
    const all = [r.headline, ...r.howItWorks, ...r.mayShowUp].join(' ').toLowerCase();
    expect(all).toMatch(/fast|wide|big/);
    expect(r.curated).toBe(true);
  });

  it('gives Saturn opposite Moon restriction/rules content without blaming a parent', () => {
    const r = pairAspectReading('Saturn', 'Moon', 'opposition', 1.6);
    const all = [r.headline, ...r.howItWorks, ...r.mayShowUp, r.watchFor].join(' ');
    expect(all.toLowerCase()).toMatch(/restrict|reserved|rule-heavy|demanding|allowed/);
    // remembered experience, never asserted as fact about a family member
    expect(all).toMatch(/remember|experienc/i);
    expect(all.toLowerCase()).not.toMatch(/harsh mother|abusive|neglect/);
    expect(r.doesNotMean.join(' ')).toMatch(/not a factual claim about any family member/);
  });

  it('adds square vs opposition nuance', () => {
    const sq = pairAspectReading('Saturn', 'Moon', 'square', 2).howItWorks.join(' ');
    const op = pairAspectReading('Saturn', 'Moon', 'opposition', 2).howItWorks.join(' ');
    expect(sq).toContain('square');
    expect(op).toContain('opposition');
  });

  it('labels orb tightness honestly and never as a probability', () => {
    expect(pairAspectReading('Sun', 'Moon', 'trine', 0.4).strengthNote).toMatch(/close to exact/);
    expect(pairAspectReading('Sun', 'Moon', 'trine', 7.5).strengthNote).toMatch(/wide/);
    for (const orb of [0.4, 3, 7.5]) {
      expect(pairAspectReading('Sun', 'Moon', 'trine', orb).strengthNote).not.toMatch(/%|probab/);
    }
  });

  it('covers every core-body pair and aspect with usable copy', () => {
    for (let i = 0; i < CORE_BODIES.length; i++) {
      for (let j = i + 1; j < CORE_BODIES.length; j++) {
        for (const asp of ASPECTS) {
          const r = pairAspectReading(CORE_BODIES[i], CORE_BODIES[j], asp, 2);
          expect(r.headline.length).toBeGreaterThan(10);
          expect(r.howItWorks.length).toBeGreaterThanOrEqual(2);
          expect(r.mayShowUp.length).toBeGreaterThanOrEqual(1);
          expect(r.watchFor.length).toBeGreaterThan(10);
          expect(r.whatToSay.length).toBeGreaterThan(10);
          expect(r.doesNotMean.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('keeps Pluto and Chiron copy free of harm, trauma and clinical claims', () => {
    for (const other of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Saturn']) {
      for (const body of ['Pluto', 'Chiron']) {
        for (const asp of ASPECTS) {
          const r = pairAspectReading(body, other, asp, 2);
          const text = JSON.stringify(r).toLowerCase();
          expect(text).not.toMatch(/abuse|trauma|diagnos|disorder|manipulat|dangerous/);
        }
      }
    }
  });

  it('avoids deterministic and forbidden phrasing everywhere', () => {
    for (const key of CURATED_PAIR_KEYS) {
      const [a, b] = key.split('|');
      for (const asp of ASPECTS) {
        const text = JSON.stringify(pairAspectReading(a, b, asp, 2));
        for (const re of FORBIDDEN_INTERPRETIVE_PHRASES) {
          expect(re.test(text)).toBe(false);
        }
        expect(text).not.toMatch(/\bwill always\b|\bguaranteed\b|\bmeans you will\b/i);
      }
    }
  });
});
