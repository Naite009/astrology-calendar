import { describe, it, expect } from 'vitest';
import {
  bigThreeCard,
  blendCard,
  emphasisCard,
  isVagueLabel,
  shorthandLabel,
} from '@/lib/interpretation/shorthandDescriptor';

describe('shorthand descriptor standard', () => {
  it('gives a 1-3 word chart-specific label for a Big Three combination', () => {
    const card = bigThreeCard({ sunSign: 'Libra', moonSign: 'Libra', risingSign: 'Capricorn' })!;
    expect(card.label.split(' ').length).toBeLessThanOrEqual(3);
    expect(isVagueLabel(card.label)).toBe(false);
    // teaches the hierarchy
    expect(card.factors.map((f) => f.contributes).join(' ')).toContain('what they need emotionally');
    expect(card.why).toContain('Sun in Libra');
    expect(card.blend).toContain('Capricorn rising');
    expect(card.whatToSay.length).toBeGreaterThan(20);
    expect(card.howItMayShowUp.length).toBeGreaterThan(1);
    expect(card.growthEdge).toMatch(/usually|edge/i);
  });

  it('carries the tension in the label when two factors conflict', () => {
    const card = bigThreeCard({ sunSign: 'Scorpio', moonSign: 'Leo', risingSign: 'Aquarius' })!;
    expect(card.label).toBe('Magnetic Leader');
    const conflicted = shorthandLabel(
      { label: 'Moon in Aquarius', contributes: '', sign: 'Aquarius' },
      { label: 'Sun in Taurus', contributes: '', sign: 'Taurus' }
    );
    expect(conflicted.tension).toBe(true);
    expect(conflicted.label).toBe('Steady Rebel');
  });

  it('answers "so what?" for an element emphasis instead of reporting a count', () => {
    const card = emphasisCard({ kind: 'element', value: 'Air', count: 5, total: 11, secondary: 'Earth' })!;
    expect(card.label).toBe('Idea-Driven Communicator');
    expect(card.blend).toContain('5 of 11');
    expect(card.howItMayShowUp.join(' ')).toMatch(/Strengths/);
    expect(card.howItMayShowUp.join(' ')).toMatch(/needed/);
    expect(card.growthEdge).toContain('overuse pattern');
  });

  it('never returns a vague label from a generic blend', () => {
    const card = blendCard({
      factors: [
        { label: 'Mars in Capricorn, 10th', contributes: 'how they push and act', sign: 'Capricorn', body: 'Mars' },
        { label: 'Saturn in Libra', contributes: 'where they build slowly', sign: 'Libra', body: 'Saturn' },
      ],
    })!;
    expect(isVagueLabel(card.label)).toBe(false);
    expect(card.why).toContain('Mars in Capricorn');
  });

  it('rejects vague labels', () => {
    ['Complex Person', 'unique energy', 'Balanced Individual', ''].forEach((l) =>
      expect(isVagueLabel(l)).toBe(true)
    );
    expect(isVagueLabel('Grounded Rebel')).toBe(false);
  });
});
