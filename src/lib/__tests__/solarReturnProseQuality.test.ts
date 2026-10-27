import { describe, expect, it, vi } from 'vitest';
import { generateCheckedSolarReturnProse, validateSolarReturnProse } from '../../../supabase/functions/_shared/solarReturnProseQuality';
import { validateSolarReturnReading, validateSolarReturnReport } from '../../../supabase/functions/_shared/solarReturnReportValidation';
import { solarReturnHouseMeaning, solarReturnProfectionMeaning } from '../solarReturnClientMeaning';
import { buildSolarReturnEvidenceSynthesis } from '../solarReturnEvidenceSynthesis';
import { buildYearStory } from '../solarReturnYearStory';
import { analyzeSolarReturn } from '../solarReturnAnalysis';
import { buildFullJsonStandalone } from '@/components/SolarReturnPDFExport';
import { laurenNatal, laurenReturn } from '@/test/fixtures/solarReturnLauren';
import { laurenRejectedReportExcerpts } from '@/test/fixtures/solarReturnLaurenRejectedProse';
import { srOverlayNarrative, srSunInHouse, srMoonInHouse, srMoonInSign, srPlanetInHouse, angularPlanetMeaning } from '../solarReturnInterpretations';
import { generateExecutiveSummary } from '../solarReturnExecutiveSummary';
import { srJupiterInHouseDeep, srSaturnInHouseDeep } from '../solarReturnPlanetInHouseDeep';
import { auditSolarReturnProse, guardSolarReturnProse } from '../solarReturnProseBoundary';

const bad = 'Attention may return to questions, words, school or everyday information, siblings or peers, and the details people exchange each day. The return placement of Jupiter connects this with building a worldview large enough to guide your choices. The point is how those areas meet in actual choices, not that one cancels the other.';
describe('Solar Return client-meaning gate', () => {
  it.each(laurenRejectedReportExcerpts)('rejects supplied Lauren report excerpt: %s', text => {
    expect(validateSolarReturnProse(text)).not.toEqual([]);
  });
  it('every SR/natal house overlay uses a practical connection, never external versus emotional rooms', () => {
    for (let sr = 1; sr <= 12; sr++) for (let natal = 1; natal <= 12; natal++) {
      const text = srOverlayNarrative('The Moon', sr, natal);
      expect(validateSolarReturnProse(text)).toEqual([]);
      expect(text).not.toMatch(/two.*rooms|gap|double activation|external|emotional hit/);
    }
    expect(srOverlayNarrative('Sun', null, 4)).toBe('');
    expect(srOverlayNarrative('Sun', 11, 1)).toMatch(/team project/);
    expect(srOverlayNarrative('Sun', 11, 1)).toMatch(/introduce yourself/);
  });
  it('current prediction tables and deep banks cannot leak medical, fate or sign-only claims', () => {
    expect(srMoonInSign).toEqual({});
    expect(auditSolarReturnProse([srSunInHouse,srMoonInHouse,srPlanetInHouse,angularPlanetMeaning,srJupiterInHouseDeep,srSaturnInHouseDeep])).toEqual([]);
    for (const row of Object.values(srSunInHouse)) for (const field of ['overview','experience','focus','caution'] as const) expect(validateSolarReturnProse(row[field])).toEqual([]);
  });
  it('executive summary retains ranked story evidence, not benefic events or invented conflicts', () => {
    const analysis = analyzeSolarReturn(laurenReturn,laurenNatal);
    const summary = generateExecutiveSummary(analysis,laurenNatal);
    expect(summary.coreFocus).toBe(buildYearStory(analysis).coreStory);
    expect(summary.challenges).toEqual([]);
    expect(summary.patterns).toEqual([]);
    expect(auditSolarReturnProse(summary)).toEqual([]);
    expect(summary.opportunities[0].source.length).toBeGreaterThan(0);
  });
  it('withholding composed prose leaves deterministic facts and source labels byte-identical', () => {
    const raw = {orb:0.267, source:'sr-to-natal', label:'SR Moon square natal Venus', date:'2026-10-21', sign:'Pisces', house:3, narrative:'Dreams are prophetic.'};
    expect(guardSolarReturnProse(raw)).toEqual({...raw,narrative:''});
  });
  it('rejects the reported deterministic paragraph rather than cleaning it into a false interpretation', () => {
    expect(validateSolarReturnProse(bad)).toContain('Paragraph 1: empty meta-synthesis or astrology machinery');
    expect(validateSolarReturnProse(bad)).toContain('Paragraph 1: no concrete life manifestation');
  });
  it.each(['the point is how these areas meet', 'neither cancels the other', 'these themes interact', 'balance both', 'integrate these energies', 'this connects with', 'themes related to'])('rejects empty bridge: %s', phrase => {
    expect(validateSolarReturnProse(`You may review your budget this year. ${phrase}.`)).not.toEqual([]);
  });
  it.each([
    [3, 'Jupiter', 9, /study a skill/, /take a course/],
    [7, 'Saturn', 6, /discuss expectations/, /change your schedule/],
    [2, 'Venus', 11, /review your budget/, /join a group/],
    [4, 'Moon', 2, /rearrange your home/, /compare what you earn/],
    [10, 'Mars', 7, /apply for a role/, /renegotiate an agreement/],
    [5, 'Sun', 10, /creative project/, /current job/],
    [9, 'Mercury', 3, /plan a trip/, /ask clearer questions/],
    [11, 'Jupiter', 5, /team project/, /hobby with a friend/],
    [12, 'Saturn', 4, /clear time to rest/, /family responsibilities/],
  ] as const)('translates profection H%s, %s in SR H%s into lived possibilities', (house, lord, route, primary, linked) => {
    const text = solarReturnProfectionMeaning(house, lord, route);
    expect(text).toMatch(primary);
    expect(text).toMatch(linked);
    expect(validateSolarReturnProse(text)).toEqual([]);
    expect(text).not.toMatch(/conflict|cancel|energies|worldview|return placement|\u2014/);
  });
  it.each(Array.from({ length: 12 }, (_, i) => i + 1))('all twelve houses provide more than keyword labels: %s', house => {
    for (const planet of ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']) expect(validateSolarReturnProse(solarReturnHouseMeaning(house, planet))).toEqual([]);
  });
  it('rejects keywords with second person but no actual scene', () => {
    expect(validateSolarReturnProse('Your communication, siblings, learning and worldview may expand this year.')).toContain('Paragraph 1: no concrete life manifestation');
  });
  it('does not count evidence lines as client paragraphs', () => {
    expect(validateSolarReturnProse(`${solarReturnHouseMeaning(3, 'Jupiter')}\n\nEvidence: SR Jupiter in House 9.`)).toEqual([]);
  });
  it('regenerates once with feedback without weakening either gate', async () => {
    const good = `## Your year\n\n${solarReturnHouseMeaning(3, 'Jupiter')}`;
    const writer = vi.fn().mockResolvedValueOnce(bad).mockResolvedValueOnce(good);
    const facts = vi.fn(() => []);
    expect(await generateCheckedSolarReturnProse(writer, facts, validateSolarReturnProse)).toBe(good);
    expect(writer).toHaveBeenCalledTimes(2);
    expect(writer.mock.calls[1][0].length).toBeGreaterThan(0);
    expect(facts).toHaveBeenCalledTimes(2);
  });
  it('fails closed on recurring factual failure even when prose is readable', async () => {
    const writer = vi.fn(async () => solarReturnHouseMeaning(3, 'Jupiter'));
    await expect(generateCheckedSolarReturnProse(writer, () => ['Unverified aspect claim'], validateSolarReturnProse)).rejects.toThrow('Unverified aspect claim');
    expect(writer).toHaveBeenCalledTimes(2);
  });
  it('uses corrected source in actual Lauren UI/JSON and PDF year-story paths, without changing facts', () => {
    const analysis = analyzeSolarReturn(laurenReturn, laurenNatal);
    const synthesis = buildSolarReturnEvidenceSynthesis(analysis, laurenReturn, laurenNatal);
    expect(synthesis.themes[0].meaning).toMatch(/study a skill/);
    expect(synthesis.themes[0].meaning).toMatch(/take a course/);
    expect(validateSolarReturnProse(synthesis.themes[0].meaning)).toEqual([]);
    expect(synthesis.themes[0].evidence.join(' ')).toMatch(/whole-sign House 3/);
    for (const theme of buildYearStory(analysis).themes) expect(validateSolarReturnProse(theme.summary)).toEqual([]);
    const json = buildFullJsonStandalone(analysis, laurenReturn, laurenNatal);
    expect(json.prioritizedSynthesis).toEqual(synthesis);
    expect(validateSolarReturnReport(json)).toEqual([]);
    expect(validateSolarReturnReading(`## Your year\n\n${bad}`)).not.toEqual([]);
  });
});