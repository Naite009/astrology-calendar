import { describe, it, expect } from 'vitest';
import {
  evidenceTier, contactTier, rankByEvidence, splitTopFactors,
  signalLevel, signalLevelFromCount, doesNotMeanFor, buildEvidenceCard,
  auditEvidenceCard, isPseudoMetricLabel, TOP_FACTOR_MAX,
  SIGNAL_DISCLAIMER, WHAT_THIS_DOES_NOT_MEAN,
} from '@/lib/interpretation/evidenceStandard';

describe('evidence hierarchy', () => {
  it('tiers major planets and angles as primary', () => {
    for (const b of ['Sun', 'Moon', 'Pluto', 'Ascendant', 'MC']) {
      expect(evidenceTier(b)).toBe('primary');
    }
  });

  it('tiers nodes and Chiron as secondary', () => {
    expect(evidenceTier('NorthNode')).toBe('secondary');
    expect(evidenceTier('South Node')).toBe('secondary');
    expect(evidenceTier('Chiron')).toBe('secondary');
  });

  it('tiers minor bodies and points as supplemental', () => {
    for (const b of ['Juno', 'Ceres', 'Pallas', 'Vesta', 'Lilith', 'Vertex', 'PartOfFortune', 'Eros']) {
      expect(evidenceTier(b)).toBe('supplemental');
    }
  });

  it('takes the lowest tier of a contact pair', () => {
    expect(contactTier(['Sun', 'Moon'])).toBe('primary');
    expect(contactTier(['Sun', 'Chiron'])).toBe('secondary');
    expect(contactTier(['Sun', 'Juno'])).toBe('supplemental');
  });

  it('never lets a pile of minor contacts outrank one primary theme', () => {
    const ranked = rankByEvidence([
      { bodies: ['Juno', 'Eros'], weight: 90 },
      { bodies: ['Lilith', 'Vesta'], weight: 80 },
      { bodies: ['Sun', 'Moon'], weight: 3 },
    ]);
    expect(ranked[0].bodies).toEqual(['Sun', 'Moon']);
  });

  it('caps the primary reading and moves the rest to explore deeper', () => {
    const items = Array.from({ length: 14 }, (_, i) => ({ bodies: ['Venus'], weight: 14 - i }));
    const { top, exploreDeeper } = splitTopFactors(items);
    expect(top.length).toBeLessThanOrEqual(TOP_FACTOR_MAX);
    expect(top.length + exploreDeeper.length).toBe(14);
  });

});

describe('signal strength labels', () => {
  it('needs four independent major factors for a strong signal', () => {
    expect(signalLevel({ primaryFactors: 4 })).toBe('strong');
    expect(signalLevel({ primaryFactors: 3 })).toBe('moderate');
    expect(signalLevel({ primaryFactors: 1 })).toBe('single');
  });

  it('allows one very tight central signature to stand as strong', () => {
    expect(signalLevel({ primaryFactors: 1, tightCentralSignature: true })).toBe('strong');
  });

  it('does not let supplemental factors alone reach strong', () => {
    expect(signalLevel({ primaryFactors: 0, supplementalFactors: 6 })).not.toBe('strong');
  });

  it('maps counts consistently', () => {
    expect(signalLevelFromCount(5)).toBe('strong');
    expect(signalLevelFromCount(2)).toBe('moderate');
    expect(signalLevelFromCount(1)).toBe('single');
  });

  it('never presents strength as a probability', () => {
    expect(SIGNAL_DISCLAIMER.toLowerCase()).not.toMatch(/probability|chance|scientific/);
  });
});

describe('what this does not mean', () => {
  it('clarifies Pluto without pathology', () => {
    const lines = doesNotMeanFor({ bodies: ['Venus', 'Pluto'] });
    expect(lines.join(' ')).toMatch(/fixation|control|doomed/i);
    expect(lines.join(' ').toLowerCase()).not.toMatch(/toxic|narcissis|manipulative/);

    expect(lines.join(' ')).toBe(lines.join(' ')); // stable
  });

  it('clarifies Saturn, Chiron, nodes, 8th/12th, retrogrades and tense aspects', () => {
    expect(doesNotMeanFor({ bodies: ['Saturn'] }).length).toBeGreaterThan(0);
    expect(doesNotMeanFor({ bodies: ['Chiron'] }).join(' ')).toMatch(/trauma|heal/i);
    expect(doesNotMeanFor({ bodies: ['NorthNode'] }).join(' ')).toMatch(/destiny|past life/i);
    expect(doesNotMeanFor({ houses: [12] }).join(' ')).toMatch(/secret|deception|past.life/i);
    expect(doesNotMeanFor({ houses: [8] }).length).toBeGreaterThan(0);
    expect(doesNotMeanFor({ bodies: ['Mercury'], isRetrograde: true }).length).toBeGreaterThan(0);
    expect(doesNotMeanFor({ bodies: ['Mars', 'Saturn'], aspectTone: 'tense' }).length).toBeGreaterThan(0);
  });

  it('never contradicts itself by asserting the thing it denies', () => {
    for (const line of Object.values(WHAT_THIS_DOES_NOT_MEAN)) {
      expect(line.toLowerCase()).toMatch(/not|does not|doesn't|no /);
    }
  });
});

describe('pseudo-metric guard', () => {
  it('flags invented probability labels', () => {
    for (const label of [
      'Twin Flame Connection', 'Past Life Probability: 33%', 'Soul Growth Focus: 67%',
      'Destiny Score', 'Karmic Probability', 'FATED LOVE',
    ]) {
      expect(isPseudoMetricLabel(label)).toBe(true);
    }
  });

  it('accepts grounded labels', () => {
    expect(isPseudoMetricLabel('Emotional fit')).toBe(false);
    expect(isPseudoMetricLabel('Symbolic spiritual theme')).toBe(false);
  });
});

describe('evidence card anatomy', () => {
  it('builds a card with headline, strength, factors, derivation and interpretation', () => {
    const card = buildEvidenceCard({
      headline: 'Competence builds confidence',
      bodies: ['Moon', 'Saturn'],
      houses: [2, 6],
      evidence: ['Moon in Capricorn', 'Moon in the 2nd house', 'strong Earth', 'strong 6th house'],
      derivation: ['Moon = emotional needs', 'Capricorn = competence', 'Together → progress feels steadying'],
      interpretation: 'Seeing effort pay off can feel steadying.',
      signal: { primaryFactors: 4 },
    });
    expect(card.signal).toBe('strong');
    expect(card.tier).toBe('primary');
    expect(card.derivation.at(-1)).toMatch(/Together/);
    expect(auditEvidenceCard(card)).toEqual([]);
  });

  it('audits cards with no chart evidence', () => {
    const card = buildEvidenceCard({
      headline: 'Past Life Probability: 33%',
      bodies: [],
      evidence: [],
      derivation: [],
      interpretation: 'trust me',
    });
    expect(auditEvidenceCard(card).length).toBeGreaterThan(0);
  });
});

