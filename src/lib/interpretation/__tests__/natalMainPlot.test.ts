import { describe, expect, it } from 'vitest';
import { buildNatalMainPlot, type PlotSource } from '../../../../supabase/functions/_shared/natalMainPlot';
import { validatePersonReading, type PersonReading } from '../personReadingValidator';
import { contextFromStoryMap } from '../../../../supabase/functions/_shared/personReadingContext';

const source: PlotSource = {
  placements: { Sun: { sign: 'Libra', longitude: 208, house: 1 }, Moon: { sign: 'Libra', longitude: 183, house: 12 }, Ascendant: { sign: 'Libra', longitude: 205, house: 1 }, Venus: { sign: 'Sagittarius', longitude: 241, house: 2 }, Saturn: { sign: 'Leo', longitude: 135, house: null }, Pluto: { sign: 'Libra', longitude: 192, house: null } },
  houseRulers: { 1: { traditional: 'Venus' }, 10: { traditional: 'Moon' } },
  evidence: {
    'placement:Sun': { id: 'placement:Sun', kind: 'placement', bodies: ['Sun'] },
    'placement:Moon': { id: 'placement:Moon', kind: 'placement', bodies: ['Moon'] },
    'placement:Venus': { id: 'placement:Venus', kind: 'placement', bodies: ['Venus'] },
    'angle:Ascendant': { id: 'angle:Ascendant', kind: 'angle', bodies: ['Ascendant'] },
    'sign:Saturn': { id: 'sign:Saturn', kind: 'sign', bodies: ['Saturn'] },
    'sign:Pluto': { id: 'sign:Pluto', kind: 'sign', bodies: ['Pluto'] },
    'rulership:chart-ruler': { id: 'rulership:chart-ruler', kind: 'rulership', bodies: ['Venus'] },
    'rulership:dispositors-Sun': { id: 'rulership:dispositors-Sun', kind: 'rulership', bodies: ['Sun', 'Venus'] },
    'rulership:dispositors-Moon': { id: 'rulership:dispositors-Moon', kind: 'rulership', bodies: ['Moon', 'Venus'] },
    'rulership:dispositors-Venus': { id: 'rulership:dispositors-Venus', kind: 'rulership', bodies: ['Venus'] },
    'concentration:big-three': { id: 'concentration:big-three', kind: 'concentration', bodies: ['Sun', 'Moon', 'Ascendant'] },
    'aspect:Sun-square-Moon': { id: 'aspect:Sun-square-Moon', kind: 'aspect', bodies: ['Sun', 'Moon'], aspect: { a: 'Sun', b: 'Moon', type: 'square', orb: 0.3 } },
  },
  chains: [{ id: 'chain:sun', steps: ['placement:Sun'], bodies: ['Sun'] }, { id: 'chain:moon', steps: ['placement:Moon'], bodies: ['Moon'] }, { id: 'chain:rising', steps: ['angle:Ascendant'], bodies: ['Ascendant'] }],
  tensions: [{ id: 'tension:sun-moon', fact: 'Two different legitimate needs', evidenceIds: ['placement:Sun', 'placement:Moon', 'aspect:Sun-square-Moon'], mustAddress: true }],
};
describe('main plot before prose', () => {
  it('chart ruler and luminaries outrank isolated slow-planet signs', () => {
    const p = buildNatalMainPlot(source);
    expect(p.hierarchy.find(h => h.body === 'Venus')?.tier).toBe('primary');
    expect(p.hierarchy.find(h => h.body === 'Sun')?.weight).toBeGreaterThan(p.hierarchy.find(h => h.body === 'Pluto')?.weight ?? 0);
    expect(p.hierarchy.find(h => h.body === 'Saturn')?.tier).toBe('background');
    expect(p.candidates.some(t => t.indicatorBodies.includes('Pluto'))).toBe(false);
    expect(p.chartRuler?.evidenceIds).toContain('rulership:dispositors-Venus');
  });
  it('three independent structural indicators earn main-story candidacy, two earn meaningful support', () => {
    const p = buildNatalMainPlot(source);
    expect(p.candidates.find(t => t.id === 'plot:concentration:big-three')?.strength).toBe('main-story');
    expect(p.candidates.find(t => t.id === 'plot:aspect:Sun-square-Moon')?.indicatorCount).toBe(2);
    expect(p.candidates.find(t => t.id === 'plot:aspect:Sun-square-Moon')?.strength).toBe('meaningful');
  });
  it('one body cannot become a theme by duplicating sign, condition or chain membership', () => {
    const p = buildNatalMainPlot({ ...source, evidence: { ...source.evidence, duplicate: { id: 'duplicate', kind: 'concentration', bodies: ['Saturn', 'Saturn', 'Saturn'] } } });
    expect(p.candidates.some(t => t.id === 'plot:duplicate')).toBe(false);
  });
  it('preserves competing needs and exact evidence instead of subtracting away one side', () => {
    const p = buildNatalMainPlot(source);
    const t = p.candidates.find(t => t.id === 'plot:concentration:big-three');
    expect(t?.contradictions[0]?.id).toBe('tension:sun-moon');
    expect(t?.evidenceIds).toContain('aspect:Sun-square-Moon');
  });
  it('shared ruler routes retain distinct source planets and deterministic selection', () => {
    const p = buildNatalMainPlot(source);
    expect(p.candidates.find(t => t.id === 'plot:ruler-convergence-Venus')?.indicatorBodies).toEqual(['Sun', 'Moon', 'Venus']);
    expect(buildNatalMainPlot({ ...source, evidence: Object.fromEntries(Object.entries(source.evidence).reverse()) })).toEqual(p);
  });
  it('fails prose that substitutes an unsupported sign-level major theme', () => {
    const ctx = contextFromStoryMap({ ...source, version: 4, transits: [], allowedAspects: [] });
    const sig = { themeId: 'plot:sign:Saturn', name: 'World Changer', plainMeaning: 'Saturn in Leo means she is here to change the world.', chainIds: ['chain:sun', 'chain:moon'], evidenceIds: ['sign:Saturn', 'placement:Sun', 'placement:Moon'], howItWorks: 'Saturn in Leo means her life purpose is visibility.', inWork: 'She can work.', inRelationships: 'She may cooperate.', underStress: 'She may pause.', tension: 'She may need privacy.', tensionEvidenceIds: [], healthyExpression: 'She can consider both.' };
    const r = { headline: 'She may stand out.', centralTension: 'She may want privacy.', signatures: [sig, { ...sig, name: 'B' }, { ...sig, name: 'C' }], collisions: [], whenLost: 'She may pause.', whatSteadies: 'She may think.', transitsNow: [], clientQuestions: [] } as PersonReading;
    const errors = validatePersonReading(r, ctx);
    expect(errors.some(e => e.includes('selected structural theme'))).toBe(true);
    expect(errors.some(e => e.includes('main plot'))).toBe(true);
    expect(errors.some(e => e.includes('Fixed-fate'))).toBe(true);
  });
  it('rejects a selected theme when its own contradiction or independent evidence is omitted', () => {
    const ctx = contextFromStoryMap({ ...source, version: 4, transits: [], allowedAspects: [source.evidence['aspect:Sun-square-Moon'].aspect] });
    const plot = buildNatalMainPlot(source);
    const chosen = plot.selectedThemeIds.slice(0, 3).map(id => plot.candidates.find(t => t.id === id)).filter(t => Boolean(t));
    const signatures = chosen.map((t, i) => {
      if (!t) throw new Error('Missing theme');
      const text = 'She may consider another person, but can need time to decide privately.';
      const ids = t.evidenceIds;
      return { themeId: t.id, name: `Pattern ${i}`, plainMeaning: text, chainIds: t.chainIds, evidenceIds: ids, howItWorks: 'Sun at 28° Libra in the 1st house and Moon at 3° Libra in the 12th house may connect outward choices with private reflection. Their dispositor is Venus.', inWork: text, inRelationships: text, underStress: text, tension: text, tensionEvidenceIds: ['aspect:Sun-square-Moon'], healthyExpression: text, conclusionEvidence: Object.fromEntries(['plainMeaning', 'howItWorks', 'inWork', 'inRelationships', 'underStress', 'tension', 'healthyExpression'].map(f => [f, ids])) };
    });
    const r: PersonReading = { mainPlotThemeId: plot.primaryThemeId ?? undefined, headline: 'She may weigh connection and independence.', centralTension: 'She may want both.', signatures, collisions: [], whenLost: 'She may pause.', whatSteadies: 'She may reflect.', transitsNow: [], clientQuestions: [] };
    expect(validatePersonReading(r, ctx).filter(e => /theme|main plot|competing needs/.test(e))).toEqual([]);
    r.signatures[0].tensionEvidenceIds = [];
    expect(validatePersonReading(r, ctx).some(e => e.includes('salient competing needs'))).toBe(true);
    r.signatures[0].conclusionEvidence = { ...r.signatures[0].conclusionEvidence, plainMeaning: ['placement:Sun', 'rulership:dispositors-Sun'] };
    expect(validatePersonReading(r, ctx).some(e => e.includes('two independent structural indicators'))).toBe(true);
  });
});