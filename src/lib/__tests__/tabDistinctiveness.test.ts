import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { calculateNatalFromInput, toStoredPosition } from '@/lib/natalChartCalculation';
import { computeRankedAspects } from '@/lib/aspectRanking';
import { buildAspectCopy, dissociateExplanation } from '@/lib/aspectPersonalization';
import { buildPlacementInteraction, verifiedCombinationAspects, findCombinationAspect } from '@/lib/interpretation/placementInteractions';
import { getCheckedNatalAspectReading } from '@/lib/interpretation/psychologicalFunctions';
import { buildReadingGuide } from '@/lib/readingGuide/readingGuideEngine';
import { buildConsultationAgenda } from '@/lib/readingGuide/consultationAgenda';

function chart(name: string, date: string, time: string): NatalChart {
  const input = { birthDate: date, birthTime: time, birthLocation: 'Livingston, NJ', latitude: 40.8, longitude: -74.31666666666666, timezoneId: 'America/New_York', houseSystem: 'placidus' as const };
  const result = calculateNatalFromInput(input);
  return { ...input, name, id: name, planets: Object.fromEntries(Object.entries(result.positions).map(([body, p]) => [body, toStoredPosition(p)])), houseCusps: result.houseCusps ?? undefined };
}
const maria = chart('Maria', '1974-08-30', '04:10');
const other = chart('Distinct adult reference', '1993-11-07', '11:30');
const now = new Date('2026-11-06T12:00:00Z');

describe('distinct natal output responsibilities', () => {
  it('Combos has exactly the canonical major contacts and orbs for Maria and another chart', () => {
    for (const c of [maria, other]) {
      const ranked = computeRankedAspects(c).filter(a => ['conjunction', 'square', 'opposition', 'trine', 'sextile'].includes(a.aspect));
      expect(verifiedCombinationAspects(c)).toEqual(ranked);
      expect(ranked.length).toBeGreaterThan(0);
    }
  });
  it('does not label the former 10-degree false square as present in Combos', () => {
    const c = { id: 'outside', name: 'Outside orb', birthTime: '12:00', planets: { Mercury: { sign: 'Aries', degree: 0, minutes: 0, seconds: 0 }, Mars: { sign: 'Cancer', degree: 9, minutes: 0, seconds: 0 } } } as NatalChart;
    expect(findCombinationAspect(c, 'Mercury', 'Mars')).toBeUndefined();
  });
  it('matches full precision instead of rounded printed minutes', () => {
    const c = { id: 'precision', name: 'Precision', birthTime: '12:00', planets: { Mercury: { sign: 'Aries', degree: 0, minutes: 0, seconds: 0, longitude: 0 }, Mars: { sign: 'Cancer', degree: 7, minutes: 0, seconds: 0, longitude: 97.0001 } } } as NatalChart;
    expect(findCombinationAspect(c, 'Mercury', 'Mars')).toBeUndefined();
  });
  it('individual aspects use pair mechanisms and examples, not the repeated energy template', () => {
    for (const c of [maria, other]) for (const a of computeRankedAspects(c)) {
      const copy = buildAspectCopy(a);
      expect(copy.mechanic).toBe(getCheckedNatalAspectReading(a).aspectDynamic);
      expect(copy.examples).toEqual(getCheckedNatalAspectReading(a).howThisCanShowUp);
      expect(JSON.stringify(copy)).not.toMatch(/covers,|two energies|rest of your life|stop outsourcing|the room opens|you feel them together or not at all/i);
    }
  });
  it('minute formatting carries 60 minutes to the next degree', () => {
    const a = computeRankedAspects(maria)[0];
    expect(buildAspectCopy({ ...a, orb: 1.9999 }).subline).toContain("Orb 2°00'");
  });
  it('keeps wide contacts explicitly secondary and retrogrades factual', () => {
    const a = computeRankedAspects(other)[0];
    const copy = buildAspectCopy({ ...a, aRetro: true, isWide: true });
    expect(copy.subline).toContain('wide, lower weight');
    expect(copy.evidenceNote).toContain('does not prove emotional withdrawal or a life event');
  });
  it('out-of-sign explanations do not infer software settings or lived certainty', () => {
    const text = dissociateExplanation('square');
    expect(text).toContain('settings');
    expect(text).not.toMatch(/Astro.com.*leaves|You feel it|exactly where this contact lives/i);
  });
  it('Combos compares specific placement responses and separates synthesis from evidence', () => {
    const a = verifiedCombinationAspects(maria).find(a => a.a === 'Moon' || a.b === 'Moon');
    if (!a) throw new Error('Maria Moon contact missing');
    const interaction = buildPlacementInteraction(a);
    expect(interaction.contrast[0]).toContain(a.aSign);
    expect(interaction.contrast[1]).toContain(a.bSign);
    expect(interaction.together).toBe(getCheckedNatalAspectReading(a).aspectDynamic);
    expect(interaction.evidence).toContain(`${a.orb.toFixed(3)}° orb`);
    expect(interaction.contrast[0]).not.toBe(interaction.contrast[1]);
  });
  it('consultation preserves every original section and evidence while adding distinct open questions', () => {
    for (const c of [maria, other]) {
      const reading = buildReadingGuide(c, { now }).practitioner;
      const before = JSON.stringify(reading);
      const agenda = buildConsultationAgenda(reading);
      expect(agenda.length).toBeGreaterThan(0);
      expect(agenda.length).toBeLessThanOrEqual(3);
      expect(JSON.stringify(reading)).toBe(before);
      for (const item of agenda) {
        expect(item.evidenceIds.every(id => reading.evidence.some(e => e.id === id))).toBe(true);
        expect(item.question).not.toBe(reading.themes.find(t => t.id === item.id)?.synthesis);
        expect(item.alternative).toContain('rather than treating disagreement as hidden proof');
        expect(item.question).not.toMatch(/Did you learn|childhood|trauma|must|always/);
      }
    }
  });
  it('distinct charts do not receive identical interaction or consultation output', () => {
    expect(verifiedCombinationAspects(maria).slice(0, 3).map(buildPlacementInteraction)).not.toEqual(verifiedCombinationAspects(other).slice(0, 3).map(buildPlacementInteraction));
    expect(buildConsultationAgenda(buildReadingGuide(maria, { now }).practitioner).map(a => a.question)).not.toEqual(buildConsultationAgenda(buildReadingGuide(other, { now }).practitioner).map(a => a.question));
  });
  it('unknown-time contacts do not assert angle or house interpretations', () => {
    const contacts = verifiedCombinationAspects({ ...maria, birthTimeReliability: 'unknown' });
    expect(contacts.length).toBeGreaterThan(0);
    for (const contact of contacts) {
      expect(contact.aHouse).toBeNull(); expect(contact.bHouse).toBeNull();
      expect([contact.a, contact.b]).not.toContain('Ascendant');
      expect([contact.a, contact.b]).not.toContain('MC');
    }
  });
  it('Maria remains Moon Aquarius house 6 with a separate Ascendant opposition', () => {
    const contact = computeRankedAspects(maria).find(a => a.a === 'Moon' && a.b === 'Ascendant');
    expect(contact).toMatchObject({ aSign: 'Aquarius', aHouse: 6, aspect: 'opposition' });
    expect(contact?.orb).toBeCloseTo(0.419, 2);
    const before = JSON.stringify(maria);
    buildPlacementInteraction(contact ?? computeRankedAspects(maria)[0]);
    expect(JSON.stringify(maria)).toBe(before);
  });
});