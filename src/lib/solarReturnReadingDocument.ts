import { validateSolarReturnReport, validateSolarReturnReading } from '../../supabase/functions/_shared/solarReturnReportValidation';
import { validateVerifiedReading, verifiedFactsFromSolarReturnReport } from '../../supabase/functions/_shared/verifiedReadingFacts';
import { validateSolarReturnProse } from '../../supabase/functions/_shared/solarReturnProseQuality';

export interface ReadingDocumentSection { title: string; paragraphs: string[] }
export interface ReadingDocument { title: string; sections: ReadingDocumentSection[] }
type Report = Record<string, any>;

/** A PDF is a view of accepted report fields, never a second prose author. */
export function buildSolarReturnReadingDocument(report: Report): ReadingDocument {
  const errors = validateSolarReturnReport(report);
  for (const key of ['aiReadingPlain', 'aiReadingAstro']) {
    const text = report[key];
    if (typeof text !== 'string' || !text.trim()) errors.push(`Missing accepted ${key}`);
    else errors.push(...validateSolarReturnReading(text), ...validateVerifiedReading(text, verifiedFactsFromSolarReturnReport(report)));
  }
  if (errors.length) throw new Error(`Reading PDF blocked: ${errors.join('; ')}`);
  const sections: ReadingDocumentSection[] = [];
  for (const theme of report.prioritizedSynthesis?.themes ?? []) {
    if (validateSolarReturnProse(theme.meaning).length) throw new Error('Reading PDF blocked: invalid synthesis');
    sections.push({ title: theme.title, paragraphs: [theme.meaning, ...(theme.evidence ?? []).map((e: string) => `Evidence: ${e}`)] });
  }
  for (const [key, title] of [['aiReadingPlain', 'Plain Language Reading'], ['aiReadingAstro', 'Astrology Reading']]) {
    sections.push({ title, paragraphs: [] });
    for (const block of report[key].split(/\n\s*\n/)) {
      const header = block.match(/^##\s+([^\n]+)(?:\n|$)/);
      const body = header ? block.slice(header[0].length).trim() : block.trim();
      if (header) sections.push({ title: header[1], paragraphs: body ? [body] : [] });
      else if (body) sections[sections.length - 1].paragraphs.push(body);
    }
  }
  sections.push({ title: 'Chart Sources and Method', paragraphs: [JSON.stringify(report.calculationMetadata, null, 2), JSON.stringify(report.rulers, null, 2)] });
  sections.push({ title: 'Verified Placements', paragraphs: (report.planetPositions ?? []).map((p: Report) => `${p.planet}: Solar Return ${p.srPosition || 'not supplied'}${p.srHouse ? `, House ${p.srHouse}` : ''}; natal ${p.natalPosition || 'not supplied'}${p.natalHouse ? `, House ${p.natalHouse}` : ''}.`) });
  for (const [key, title] of [['srToNatalAspects', 'Solar Return to Natal Contacts'], ['srInternalAspects', 'Solar Return Internal Contacts']]) {
    const paragraphs: string[] = [];
    for (const contact of report[key] ?? []) {
      paragraphs.push(`${contact.label}; orb ${contact.orb} degrees. Source: ${contact.source}.`);
      if (contact.interpretation) {
        if (validateSolarReturnProse(contact.interpretation).length) throw new Error('Reading PDF blocked: invalid contact meaning');
        paragraphs.push(contact.interpretation);
      }
    }
    sections.push({ title, paragraphs });
  }
  return { title: `${report.name} | Solar Return ${report.solarReturnYear}`, sections };
}