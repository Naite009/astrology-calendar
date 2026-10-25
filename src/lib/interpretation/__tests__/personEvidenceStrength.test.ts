import { describe, expect, it } from 'vitest';
import { scorePersonEvidence, type StrengthContext } from '../../../../supabase/functions/_shared/personEvidenceStrength';
import { validatePersonReading, type PersonReading } from '../personReadingValidator';
import { contextFromStoryMap } from '../../../../supabase/functions/_shared/personReadingContext';

const evidence = {
  'sign:Saturn': { id: 'sign:Saturn', kind: 'sign', bodies: ['Saturn'] },
  'sign:Pluto': { id: 'sign:Pluto', kind: 'sign', bodies: ['Pluto'] },
  'sign:Neptune': { id: 'sign:Neptune', kind: 'sign', bodies: ['Neptune'] },
  'placement:Saturn': { id: 'placement:Saturn', kind: 'placement', bodies: ['Saturn'] },
  'placement:Sun': { id: 'placement:Sun', kind: 'placement', bodies: ['Sun'] },
  'placement:Mars': { id: 'placement:Mars', kind: 'placement', bodies: ['Mars'] },
  'rulership:Saturn-rules': { id: 'rulership:Saturn-rules', kind: 'rulership', bodies: ['Saturn'] },
  'aspect:Sun-square-Saturn': { id: 'aspect:Sun-square-Saturn', kind: 'aspect', bodies: ['Sun', 'Saturn'], aspect: { a: 'Sun', b: 'Saturn', type: 'square', orb: 0.3 } },
  'aspect:Sun-ASC': { id: 'aspect:Sun-ASC', kind: 'aspect', bodies: ['Sun', 'Ascendant'], aspect: { a: 'Sun', b: 'Ascendant', type: 'conjunction', orb: 0.3 } },
  'aspect:Sun-DSC': { id: 'aspect:Sun-DSC', kind: 'aspect', bodies: ['Sun', 'Descendant'], aspect: { a: 'Sun', b: 'Descendant', type: 'opposition', orb: 0.3, derived: true } },
};
const strength: StrengthContext = { evidence, placements: { Saturn: { sign: 'Leo', longitude: 135, house: 10 }, Sun: { sign: 'Taurus', longitude: 45, house: 7 }, Mars: { sign: 'Aries', longitude: 5, house: 1 }, Pluto: { sign: 'Libra', longitude: 195, house: null }, Neptune: { sign: 'Sagittarius', longitude: 255, house: null } }, houseRulers: { 4: { traditional: 'Saturn' }, 5: { traditional: 'Saturn' } } };
const map = { version: 3, evidence, placements: strength.placements, houseRulers: strength.houseRulers, chains: [{ id: 'saturn', steps: Object.keys(evidence), bodies: ['Saturn'] }, { id: 'sun', steps: ['placement:Sun'], bodies: ['Sun'] }], tensions: [], transits: [], allowedAspects: [evidence['aspect:Sun-square-Saturn'].aspect] };
const ctx = contextFromStoryMap(map);
const ids = ['placement:Saturn', 'placement:Sun', 'rulership:Saturn-rules', 'aspect:Sun-square-Saturn'];
const fields = ['plainMeaning', 'howItWorks', 'inLife', 'inWork', 'inRelationships', 'underStress', 'inDecisions', 'tension', 'healthyExpression'];
function reading(text = 'She may want to work together, but can take over when a plan stalls.'): PersonReading {
 const s = { name: 'Shared Effort', chainIds: ['saturn', 'sun'], evidenceIds: ids, plainMeaning: text, howItWorks: 'Saturn in Leo is background cohort tone. Its 10th-house placement and rulership personalize it, alongside Sun square Saturn (0.3° orb).', inWork: text, inRelationships: text, underStress: text, tension: text, tensionEvidenceIds: ['placement:Mars'], healthyExpression: text, conclusionEvidence: Object.fromEntries(fields.map(f => [f, ids])) };
 return { headline: text, centralTension: text, signatures: [s, { ...s, name: 'Steady Builder' }, { ...s, name: 'Careful Organizer' }], collisions: [], whenLost: text, whatSteadies: text, transitsNow: [], clientQuestions: [] };
}
describe('deterministic personalization strength', () => {
 it.each(['Saturn', 'Pluto', 'Neptune'])('%s sign alone remains background even with house data elsewhere', body => {
   const r = scorePersonEvidence([`sign:${body}`], strength);
   expect(r.level).toBe('background'); expect(r.personalizedBodies).not.toContain(body); expect(r.components.background).toBe(0.25);
 });
 it('house + rulership + tight personal aspect earns stronger support', () => {
   const r = scorePersonEvidence(ids, strength); expect(r.level).toBe('strong'); expect(r.personalizedBodies).toContain('Saturn'); expect(r.components.rulers).toBe(1.5);
 });
 it('a wide personal aspect weighs less than a tight one', () => {
   const weak = { ...strength, evidence: { ...evidence, 'aspect:Sun-square-Saturn': { ...evidence['aspect:Sun-square-Saturn'], aspect: { ...evidence['aspect:Sun-square-Saturn'].aspect, orb: 6 } } } };
   expect(scorePersonEvidence(ids, weak).components.aspects).toBeLessThan(scorePersonEvidence(ids, strength).components.aspects);
 });
 it('duplicate citations and mirrored angle contacts do not inflate support', () => {
   expect(scorePersonEvidence(['aspect:Sun-ASC', 'aspect:Sun-DSC'], strength).score).toBe(scorePersonEvidence(['aspect:Sun-ASC'], strength).score);
   expect(scorePersonEvidence([...ids, ...ids], strength)).toEqual(scorePersonEvidence(ids, strength));
 });
 it('accepts personally grounded Saturn with background qualification', () => expect(validatePersonReading(reading(), ctx)).toEqual([]));
 it.each([
   ['Saturn', 'Saturn in Leo means you are here to change the world.'],
   ['Pluto', 'Pluto in Libra means relationships transform you.'],
   ['Neptune', 'Neptune in Sagittarius means spirituality is your destiny.'],
 ])('blocks %s sign-only life claims even with unrelated strong signature evidence', (body, text) => {
   const r = reading(); r.signatures[0].howItWorks = text; r.signatures[0].evidenceIds.push(`sign:${body}`); r.signatures[0].conclusionEvidence = { ...r.signatures[0].conclusionEvidence, howItWorks: [`sign:${body}`, 'placement:Mars'] };
   expect(validatePersonReading(r, ctx).some(e => e.includes(`blocked ${body} sign-only`))).toBe(true);
 });
 it('rejects strong wording on a low-scored conclusion', () => {
   const r = reading(); r.signatures[0].plainMeaning = 'She strongly needs partnership but fiercely rejects depending on anyone.';
   r.signatures[0].conclusionEvidence = { ...r.signatures[0].conclusionEvidence, plainMeaning: ['sign:Saturn', 'placement:Sun'] };
   expect(validatePersonReading(r, ctx).some(e => e.includes('strong wording beyond'))).toBe(true);
 });
 it('requires per-conclusion citations instead of borrowing the whole signature', () => {
   const r = reading(); delete r.signatures[0].conclusionEvidence; expect(validatePersonReading(r, ctx).some(e => e.includes('conclusionEvidence.plainMeaning'))).toBe(true);
 });
});