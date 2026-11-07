import { describe, expect, it } from 'vitest';
import type { NatalChart } from '@/hooks/useNatalChart';
import { getEssentialDignity, DOMICILE_SIGNS, DETRIMENT_SIGNS, EXALTATION_SIGNS, FALL_SIGNS } from '@/lib/essentialDignity';
import { getAllCombinations } from '@/lib/planetaryCombinations';
import { moonSignCombinations } from '@/lib/planetaryCombinationsExpanded';
import { checkedCombination } from '@/lib/interpretation/checkedCombination';
import { checkedLegacyDisplay, checkedLegacyText, unsupportedLegacyClaim } from '@/lib/interpretation/legacyClaimGate';
import { buildSymbolicDevelopment } from '@/lib/interpretation/symbolicDevelopment';
import { calculateNatalFromInput, toStoredPosition } from '@/lib/natalChartCalculation';
import { PLANET_DIGNITIES } from '@/lib/planetDignities';

const makeChart = (date: string, time: string): NatalChart => {
  const input = { birthDate: date, birthTime: time, birthLocation: 'Livingston, NJ', latitude: 40.8, longitude: -74.31666666666666, timezoneId: 'America/New_York', houseSystem: 'placidus' as const };
  const result = calculateNatalFromInput(input);
  return { ...input, name: 'Reference', id: date, planets: Object.fromEntries(Object.entries(result.positions).map(([body, p]) => [body, toStoredPosition(p)])), houseCusps: result.houseCusps ?? undefined };
};

describe('Phase 3 checked legacy claims', () => {
  it('Moon Aquarius is not detriment, Capricorn is, including the active library entry', () => {
    expect(getEssentialDignity('Moon', 'Aquarius')).toBe('Peregrine');
    expect(getEssentialDignity('Moon', 'Capricorn')).toBe('Detriment');
    const entry = moonSignCombinations.find(e => e.id === 'moon-aquarius');
    if (!entry) throw new Error('Moon Aquarius entry missing');
    expect(entry.tags).not.toContain('detriment');
    expect(checkedCombination(entry).summary).toContain('Traditional essential dignity: peregrine');
    expect(checkedLegacyText('Moon in detriment in Aquarius creates unusual emotions.')).toBe('');
  });
  it('checks all twelve signs and seven traditional planets against actual assignments', () => {
    const signs = Object.keys(DOMICILE_SIGNS).flatMap(body => DOMICILE_SIGNS[body]);
    for (const body of Object.keys(DOMICILE_SIGNS)) for (const sign of new Set([...signs, 'Aries', 'Libra'])) {
      for (const [claim, allowed] of Object.entries({ domicile: DOMICILE_SIGNS[body]?.includes(sign), detriment: DETRIMENT_SIGNS[body]?.includes(sign), exaltation: EXALTATION_SIGNS[body] === sign, fall: FALL_SIGNS[body] === sign })) {
        // Mercury has both domicile and exaltation in Virgo; the display uses domicile priority.
        const text = `${body} in ${claim} in ${sign}.`;
        const expected = getEssentialDignity(body, sign).toLowerCase() === claim;
        expect(Boolean(checkedLegacyText(text))).toBe(expected && Boolean(allowed));
      }
    }
  });
  it('does not assign traditional dignity to modern planets', () => {
    for (const body of ['Uranus', 'Neptune', 'Pluto']) {
      expect(getEssentialDignity(body, 'Aquarius')).toBe('NotAssigned');
      expect(checkedLegacyText(`${body} in domicile in Aquarius.`)).toBe('');
      expect(PLANET_DIGNITIES[body].rulership).toEqual([]);
      expect(PLANET_DIGNITIES[body].exaltation).toBe('');
    }
  });
  it.each([
    'You have natural psychic abilities.', 'Dreams are prophetic.', 'You can channel the dead.',
    'Inherited grief or trauma responses.', 'Your past-life occupation was a healer.',
    'Your father may have been absent.', 'The inner child felt unloved or unseen.',
    'Your soul destiny is spiritual work.', 'Clairvoyance comes naturally.',
    'Moon in Capricorn causes depression.', 'This guarantees a lottery win.',
  ])('withholds unsupported ability, biography or fate: %s', text => {
    expect(unsupportedLegacyClaim(text)).toBe(true);
    expect(checkedLegacyText(text)).toBe('');
  });
  it('preserves safe neighboring meaning and structural ids without mutating source', () => {
    const value = { id: 'psychic-reference', factors: ['Moon', 'Neptune'], summary: 'Dreams are prophetic. You may keep a notebook to compare impressions with facts.', energies: ['Inherited trauma responses.', 'Pause before agreeing to a request.'] };
    const before = JSON.stringify(value);
    const copy = checkedLegacyDisplay(value);
    expect(copy.id).toBe(value.id); expect(copy.factors).toEqual(value.factors);
    expect(copy.summary).toBe('You may keep a notebook to compare impressions with facts.');
    expect(copy.energies).toEqual(['Pause before agreeing to a request.']);
    expect(JSON.stringify(value)).toBe(before);
  });
  it('every rendered combination preserves factor identity and excludes unsupported sentences', () => {
    for (const entry of getAllCombinations()) {
      const checked = checkedCombination(entry);
      expect(checked.factors).toEqual(entry.factors);
      expect(checked.id).toBe(entry.id);
      expect(unsupportedLegacyClaim(checked.summary)).toBe(false);
      for (const e of checked.energies) expect(unsupportedLegacyClaim(e.expression)).toBe(false);
    }
  });
  it('factor order cannot change dignity or traditional versus modern ruler labels', () => {
    const entry = moonSignCombinations.find(e => e.id === 'moon-aquarius');
    if (!entry) throw new Error('Moon Aquarius entry missing');
    const a = checkedCombination(entry);
    const b = checkedCombination({ ...entry, factors: [...entry.factors].reverse() });
    expect(a.summary).toBe(b.summary);
    expect(a.summary).toContain('traditionally ruled by Saturn, with Uranus as modern co-ruler');
  });
});

describe('checked symbolic development rather than biography', () => {
  const maria = makeChart('1974-08-30', '04:10');
  const other = makeChart('1993-11-07', '11:30');
  it('counts exactly the ten majors and preserves stored chart facts', () => {
    const before = JSON.stringify(maria);
    const reading = buildSymbolicDevelopment(maria);
    expect(Object.values(reading.elements.counts).reduce((a, b) => a + b, 0)).toBe(10);
    expect(reading.saturn?.evidence).toContain('Saturn in Cancer');
    expect(JSON.stringify(maria)).toBe(before);
  });
  it('growth provides observable practice and contact-specific integration without invented history', () => {
    for (const c of [maria, other]) {
      const r = buildSymbolicDevelopment(c);
      expect(r.saturn?.example).toContain('one responsibility you can complete');
      expect(r.saturn?.takeaway).toContain('state what done means');
      expect(r.saturn?.contacts.length).toBeGreaterThan(0);
      for (const contact of r.saturn?.contacts ?? []) {
        expect(contact.evidence).toContain('Saturn');
        expect(contact.integration.length).toBeGreaterThan(20);
        expect(unsupportedLegacyClaim(contact.integration)).toBe(false);
      }
      expect(JSON.stringify(r.saturn)).not.toMatch(/something.*missing|psyche.*lopsided|nothing was given freely|fate.*destroy/i);
    }
  });
  it('retains tie-aware canonical elements and distinct Saturn evidence', () => {
    expect(buildSymbolicDevelopment(maria).saturn?.evidence).not.toBe(buildSymbolicDevelopment(other).saturn?.evidence);
    expect(buildSymbolicDevelopment(maria).elements.counts).not.toEqual(buildSymbolicDevelopment(other).elements.counts);
  });
  it('private-house reflection uses full degree cusps, not matching sign', () => {
    const c = { ...maria, houseCusps: { ...maria.houseCusps, house12: { sign: 'Cancer', degree: 20, minutes: 0 }, house1: { sign: 'Leo', degree: 20, minutes: 0 } }, planets: { ...maria.planets, Sun: { sign: 'Cancer', degree: 10, minutes: 0 }, Moon: { sign: 'Leo', degree: 10, minutes: 0 } } } as NatalChart;
    const names = buildSymbolicDevelopment(c).privateFactors.map(p => p.body);
    expect(names).not.toContain('Sun'); expect(names).toContain('Moon');
  });
  it('unknown time keeps Saturn sign and omits house-specific interpretation', () => {
    const reading = buildSymbolicDevelopment({ ...maria, birthTimeReliability: 'unknown' });
    expect(reading.saturn?.evidence).not.toContain('House');
    expect(reading.privateFactors).toEqual([]);
    expect(reading.saturn?.contacts.every(c => !/House/.test(c.evidence))).toBe(true);
  });
});