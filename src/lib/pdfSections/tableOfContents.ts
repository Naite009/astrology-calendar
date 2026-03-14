import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

export interface TOCEntry {
  title: string;
  desc: string;
  y: number; // Y position of the entry on the TOC page
}

export function generatePDFTableOfContents(ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, narrative: string, birthdayMode?: boolean): TOCEntry[] {
  const { pw, margin, contentW, colors } = ctx;
  const tocEntries: TOCEntry[] = [];

  // Title — compact spacing to fit all entries on one page
  ctx.y += 8;
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1.5);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 16;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.setTextColor(...colors.gold);
  doc.text('TABLE OF CONTENTS', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 6;

  // Ornament
  doc.setDrawColor(...colors.gold); doc.setLineWidth(0.5);
  doc.line(pw / 2 - 40, ctx.y, pw / 2 + 40, ctx.y);
  ctx.y += 12;

  // Build sections list — MUST match actual page order in SolarReturnPDFExport.tsx
  const sections: { title: string; desc: string }[] = [];

  sections.push({ title: 'How To Read This Report', desc: 'Key concepts explained in plain language' });
  sections.push({ title: 'Your Big Three', desc: 'Sun, Moon, and Rising — strengths, shadow, and how the year activates them' });
  sections.push({ title: 'Year at a Glance', desc: 'SR Ascendant, ruler, profection, time lord, and moon phase' });
  sections.push({ title: 'Profection Wheel', desc: 'Visual diagram of your annual profection and activated house' });
  if (a.profectionYear) sections.push({ title: 'Your Profection Year — What To Expect', desc: 'Detailed analysis of your profection house and Time Lord for the year' });
  if (a.profectionYear) sections.push({ title: 'Key Dates', desc: 'Exact dates when your Time Lord activates natal planets — when the year\'s themes become tangible' });
  if (a.moonSign) sections.push({ title: 'Moon Sign Shift', desc: 'How your emotional processing changes this year' });
  sections.push({ title: 'Solar Return vs Natal', desc: 'Side-by-side comparison of all planet positions' });
  if (a.stelliums.length > 0) sections.push({ title: 'Stelliums', desc: 'Where 3+ planets cluster -- your year\'s power zones' });
  if (a.elementBalance) sections.push({ title: 'Element and Modality', desc: 'Fire/Earth/Air/Water and Cardinal/Fixed/Mutable balance' });
  if (a.hemisphericEmphasis) sections.push({ title: 'Where Your Energy Lives', desc: 'Hemispheric distribution and angular planets' });
  if (a.lordOfTheYear) sections.push({ title: 'Lord of the Year', desc: 'Your Time Lord -- the planet running the show' });
  if (a.saturnFocus || a.nodesFocus) sections.push({ title: 'Saturn and North Node', desc: 'Where you\'re being tested and where your soul is growing' });
  if (a.srToNatalAspects.length > 0) sections.push({ title: 'Key Aspects', desc: 'How SR planets activate your natal chart' });
  sections.push({ title: 'Your Moon This Year', desc: 'Emotional climate, angularity, and SR Moon aspects' });
  if (a.vertex) sections.push({ title: 'Vertex', desc: 'Fated encounters and destined meetings' });
  sections.push({ title: 'Planet Spotlight', desc: 'Deep dive into key planets by house placement' });
  if (narrative) sections.push({ title: 'Year-Ahead Reading', desc: 'Narrative synthesis of your year' });
  sections.push({ title: 'Best Months and Highlights', desc: 'Peak months for love, luck, and action' });
  sections.push({ title: 'Your Year in Four Seasons', desc: 'Key themes for each quarter of your solar return year' });
  if (birthdayMode) sections.push({ title: 'Birthday Affirmation Card', desc: 'A personalized affirmation to carry with you all year' });

  // Numbered list with bold titles — page numbers added in second pass
  const entryH = Math.min(14, Math.max(11, Math.floor((ctx.ph - ctx.y - 30) / sections.length)));

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    ctx.checkPage(entryH + 2);

    const entryY = ctx.y;

    // Number
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.setTextColor(...colors.gold);
    doc.text(String(i + 1).padStart(2, ' ') + '.', margin + 4, ctx.y + 2);

    // Title
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.setTextColor(...colors.deepBrown);
    doc.text(section.title, margin + 22, ctx.y + 2);

    // Dot leader + "Page __" placeholder area (right-aligned, filled in addTOCLinks)
    const titleW = doc.getTextWidth(section.title);
    const dotsStart = margin + 22 + titleW + 4;
    const dotsEnd = pw - margin - 30;
    if (dotsEnd > dotsStart + 10) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      doc.setTextColor(...colors.dimText);
      const dotStr = '.'.repeat(Math.floor((dotsEnd - dotsStart) / 2.2));
      doc.text(dotStr, dotsStart, ctx.y + 2);
    }

    tocEntries.push({ title: section.title, desc: section.desc, y: entryY });

    ctx.y += entryH;
  }

  ctx.y += 6;

  // Bottom ornament
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1.5);
  doc.line(margin, ctx.y, pw - margin, ctx.y);

  return tocEntries;
}

/**
 * After the full PDF is generated, go back to the TOC page and add clickable internal links.
 * Maps TOC entry titles → section page numbers tracked in ctx.sectionPages.
 */
export function addTOCLinks(doc: jsPDF, tocPageNumber: number, tocEntries: TOCEntry[], ctx: PDFContext) {
  const { pw, margin, contentW, sectionPages } = ctx;

  // Normalize: strip ampersands vs "and", trim, uppercase for robust matching
  const normalize = (s: string) => s.toUpperCase().replace(/&/g, 'AND').replace(/\s+/g, ' ').trim();

  for (const entry of tocEntries) {
    const normTitle = normalize(entry.title);
    let targetPage: number | undefined;

    for (const [key, page] of sectionPages) {
      const normKey = normalize(key);
      const normKeyBase = normKey.split(' -- ')[0].trim();
      if (normKey === normTitle || normKeyBase === normTitle || normKey.includes(normTitle) || normTitle.includes(normKeyBase)) {
        targetPage = page;
        break;
      }
    }

    if (targetPage) {
      doc.setPage(tocPageNumber);
      // Print page number right-aligned
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.setTextColor(...ctx.colors.deepBrown);
      doc.text(`${targetPage}`, pw - margin - 4, entry.y + 2, { align: 'right' });
      // Clickable link over the whole row
      doc.link(margin, entry.y - 4, contentW, 16, { pageNumber: targetPage });
    }
  }
}
