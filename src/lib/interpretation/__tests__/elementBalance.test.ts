import { describe, expect, it } from 'vitest';
import { buildElementBalanceReading, buildModalityBalanceReading } from '@/lib/interpretation/elementBalance';

const placements = [
  { body: 'Sun', sign: 'Leo', house: 5 },
  { body: 'Moon', sign: 'Aquarius', house: 11 },
  { body: 'Mercury', sign: 'Gemini', house: 3 },
  { body: 'Venus', sign: 'Libra', house: 7 },
  { body: 'Mars', sign: 'Aries', house: 1 },
  { body: 'Jupiter', sign: 'Sagittarius', house: 9 },
  { body: 'Saturn', sign: 'Cancer', house: 4 },
  { body: 'Uranus', sign: 'Aquarius', house: 11 },
  { body: 'Neptune', sign: 'Aries', house: 1 },
  { body: 'Pluto', sign: 'Libra', house: 7 },
];

describe('concrete element balance interpretation', () => {
  it.each([
    ['Earth', /schedule|steps|money|materials|follow-through/i, /thinking|feeling|enthusiasm/i, /calendar|lists|deadlines|routines|budgets/i],
    ['Water', /feelings may not be the first thing/i, /private|selective|after some time/i, /quiet time|journaling|trusted person/i],
    ['Air', /know something before being able to explain/i, /feeling|experience|instinct|action|evidence/i, /writing|time to think|diagram/i],
    ['Fire', /instant confidence|just go for it/i, /reason|plan|invitation|deadline|outside spark/i, /encouragement|first step/i],
  ] as const)('makes low %s concrete', (element, behavior, alternative, support) => {
    const counts = { Fire: 4, Earth: 3, Air: 3, Water: 3, [element]: 0 };
    const reading = buildElementBalanceReading(counts, placements).individual.find((item) => item.element === element);
    expect(reading?.behavior).toMatch(behavior);
    expect(reading?.alternative).toMatch(alternative);
    expect(reading?.support).toMatch(support);
    expect(reading?.compensation).toMatch(/compensation|modified by/i);
  });

  it('synthesizes both light elements and names the stronger replacement channel', () => {
    const reading = buildElementBalanceReading({ Fire: 5, Earth: 1, Air: 4, Water: 0 }, placements);
    expect(reading.combined?.elements).toEqual(['Water', 'Earth']);
    expect(reading.combined?.label.split(/\s+/).length).toBeLessThanOrEqual(3);
    expect(reading.combined?.synthesis).toMatch(/feelings.*schedule|schedule.*feelings/i);
    expect(reading.combined?.alternative).toMatch(/Fire|action|enthusiasm/i);
    expect(reading.combined?.compensation).toMatch(/compensation|modified by/i);
  });

  it('uses actual placements when a low count is strongly compensated', () => {
    const reading = buildElementBalanceReading(
      { Fire: 5, Earth: 1, Air: 4, Water: 1 },
      [{ body: 'Saturn', sign: 'Cancer', house: 10 }, { body: 'Moon', sign: 'Aquarius', house: 4 }],
    );
    expect(reading.individual.find((item) => item.element === 'Earth')?.compensation).toMatch(/Saturn in the 10th house/i);
    expect(reading.individual.find((item) => item.element === 'Water')?.compensation).toMatch(/Moon in the 4th house/i);
  });

  it('never emits internal authoring guidance', () => {
    const element = buildElementBalanceReading({ Fire: 5, Earth: 1, Air: 4, Water: 1 }, placements);
    const modality = buildModalityBalanceReading({ Cardinal: 6, Fixed: 4, Mutable: 0 }, placements);
    expect(JSON.stringify({ element, modality })).not.toMatch(/Frame it as a pattern|missing quality|may take more deliberate effort/i);
  });
});

describe('concrete modality balance interpretation', () => {
  it.each([
    ['Cardinal', /blank page|request|deadline|reason to begin/i],
    ['Fixed', /boredom|delay|move on before/i],
    ['Mutable', /changing plans midstream|concrete reason to revise/i],
  ] as const)('makes low %s behavior concrete', (low, expected) => {
    const counts = { Cardinal: 5, Fixed: 5, Mutable: 5, [low]: 0 };
    const reading = buildModalityBalanceReading(counts, placements);
    expect(reading.low).toContain(low);
    expect(reading.summary).toMatch(expected);
    expect(reading.compensation).toMatch(/compensate|No strong/i);
  });
});