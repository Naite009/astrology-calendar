import { describe, expect, it } from 'vitest';
import { buildSolarReturnReadingDocument } from '../solarReturnReadingDocument';
import { buildFullJsonStandalone } from '@/components/SolarReturnPDFExport';
import { analyzeSolarReturn } from '../solarReturnAnalysis';
import { solarReturnHouseMeaning } from '../solarReturnClientMeaning';
import { validateSolarReturnProse } from '../../../supabase/functions/_shared/solarReturnProseQuality';
import { laurenNatal, laurenReturn } from '@/test/fixtures/solarReturnLauren';

describe('checked Solar Return reading PDF', () => {
  const analysis = analyzeSolarReturn(laurenReturn, laurenNatal);
  const reading = `## Your year\n\n${solarReturnHouseMeaning(3, 'Jupiter')}`;
  const report = buildFullJsonStandalone(analysis, laurenReturn, laurenNatal, { plain: reading, astro: reading });

  it('includes accepted readings and every exact contact label and orb without editing report facts', () => {
    const before = JSON.stringify(report);
    const document = buildSolarReturnReadingDocument(report);
    const text = JSON.stringify(document);
    expect(text).toContain(solarReturnHouseMeaning(3, 'Jupiter'));
    for (const contact of [...report.srToNatalAspects, ...report.srInternalAspects]) {
      expect(text).toContain(contact.label);
      expect(text).toContain(`orb ${contact.orb} degrees`);
    }
    expect(JSON.stringify(report)).toBe(before);
  });
  it('blocks missing rather than withheld AI readings', () => {
    expect(() => buildSolarReturnReadingDocument({ ...report, aiReadingPlain: '' })).toThrow('Missing accepted');
  });
  it('blocks rejected AI prose instead of drawing it in a PDF', () => {
    expect(() => buildSolarReturnReadingDocument({ ...report, aiReadingAstro: 'Your dreams are prophetic.' })).toThrow('Reading PDF blocked');
  });
  it('blocks unverified factual claims even when the paragraph has a concrete scene', () => {
    expect(() => buildSolarReturnReadingDocument({ ...report, aiReadingAstro: `## Your year\n\nYour Solar Return Moon is in Aries in House 10. You may discuss a project with your partner.` })).toThrow('Reading PDF blocked');
  });
  it('all Lauren major-planet contacts have a concrete checked meaning; minor bodies remain fact-only', () => {
    const majors = new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']);
    const contacts = [...report.srToNatalAspects, ...report.srInternalAspects];
    const supported = contacts.filter(c => majors.has(c.planet1) && majors.has(c.planet2));
    expect(supported.length).toBeGreaterThan(20);
    for (const contact of supported) {
      expect(contact.interpretation.length).toBeGreaterThan(0);
      expect(validateSolarReturnProse(contact.interpretation)).toEqual([]);
    }
    expect(contacts.find(c => c.planet1 === 'Chiron')?.interpretation).toBe('');
  });
  it.each(['Your daily routines will strongly influence your feelings.', 'Mercury is near your most visible angle.', 'You can expect noticeable events this year.'])('rejects residual unsupported certainty: %s', text => {
    expect(validateSolarReturnProse(text)).toContain('Paragraph 1: Unsupported event, medical or psychological claim');
  });
});