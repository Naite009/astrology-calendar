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

  // Title with elegant spacing
  ctx.y += 20;
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1.5);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 28;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.setTextColor(...colors.gold);
  doc.text('TABLE OF CONTENTS', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 10;

  // Ornament
  doc.setDrawColor(...colors.gold); doc.setLineWidth(0.5);
  doc.line(pw / 2 - 40, ctx.y, pw / 2 + 40, ctx.y);
  ctx.y += 24;

  // Build sections list — MUST match actual page order in SolarReturnPDFExport.tsx
  const sections: { title: string; desc: string }[] = [];

  sections.push({ title: 'How To Read This Report', desc: 'Key concepts explained in plain language' });
  if (birthdayMode) sections.push({ title: 'Your Natal Foundation', desc: 'Your natal gifts -- the foundation your year builds upon' });
  sections.push({ title: 'Year at a Glance', desc: 'SR Ascendant, ruler, profection, time lord, and moon phase' });
  sections.push({ title: 'Profection Wheel', desc: 'Visual diagram of your annual profection and activated house' });
  if (a.moonSign) sections.push({ title: 'Moon Sign Shift', desc: 'How your emotional processing changes this year' });
  sections.push({ title: 'Solar Return vs Natal', desc: 'Side-by-side comparison of all planet positions' });
  if (a.stelliums.length > 0) sections.push({ title: 'Stelliums', desc: 'Where 3+ planets cluster -- your year\'s power zones' });
  if (a.elementBalance) sections.push({ title: 'Element and Modality', desc: 'Fire/Earth/Air/Water and Cardinal/Fixed/Mutable balance' });
  if (a.hemisphericEmphasis) sections.push({ title: 'Where Your Energy Lives', desc: 'Upper/Lower and Eastern/Western planet distribution' });
  if (a.angularPlanets?.length) sections.push({ title: 'Angular Planets', desc: 'The most powerful and visible planets this year' });
  if (a.lordOfTheYear) sections.push({ title: 'Lord of the Year', desc: 'Your Time Lord -- the planet running the show' });
  if (a.saturnFocus || a.nodesFocus) sections.push({ title: 'Saturn and North Node', desc: 'Where you\'re being tested and where your soul is growing' });
  if (a.srToNatalAspects.length > 0) sections.push({ title: 'Key Aspects', desc: 'How SR planets activate your natal chart' });
  sections.push({ title: 'Your Moon This Year', desc: 'Emotional climate, angularity, and SR Moon aspects' });
  if (a.vertex) sections.push({ title: 'Vertex', desc: 'Fated encounters and destined meetings' });
  sections.push({ title: 'Planet Spotlight', desc: 'Deep dive into key planets by house placement' });
  if (narrative) sections.push({ title: 'Year-Ahead Reading', desc: 'Narrative synthesis of your year' });
  sections.push({ title: 'Best Months and Highlights', desc: 'Peak months for love, luck, and action' });
  if (birthdayMode) sections.push({ title: 'Birthday Affirmation Card', desc: 'A personalized affirmation to carry with you all year' });

  // Single-column numbered list — clean, readable, no overlap
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    ctx.checkPage(36);

    const entryY = ctx.y;

    // Number circle
    const circleX = margin + 14;
    const circleY = ctx.y + 2;
    doc.setFillColor(...colors.softGold);
    doc.setDrawColor(...colors.gold); doc.setLineWidth(0.8);
    doc.circle(circleX, circleY, 9, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.setTextColor(...colors.gold);
    doc.text(String(i + 1), circleX, circleY + 3, { align: 'center' });

    // Title
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.setTextColor(...colors.deepBrown);
    doc.text(section.title, margin + 30, ctx.y + 2);

    // Description — same line or just below
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...colors.dimText);
    doc.text(section.desc, margin + 30, ctx.y + 14);

    tocEntries.push({ title: section.title, desc: section.desc, y: entryY });

    ctx.y += 32;
  }

  ctx.y += 10;

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
  const { margin, contentW, sectionPages } = ctx;

  // Normalize title matching: TOC titles are mixed case, sectionPages keys are UPPERCASE
  // Also handle titles that don't go through sectionTitle (manually registered)
  for (const entry of tocEntries) {
    const upperTitle = entry.title.toUpperCase();
    // Try exact match first, then partial match
    let targetPage: number | undefined = sectionPages.get(upperTitle);
    
    if (!targetPage) {
      // Try matching with " -- " separator stripped
      for (const [key, page] of sectionPages) {
        if (key.includes(upperTitle) || upperTitle.includes(key.split(' -- ')[0])) {
          targetPage = page;
          break;
        }
      }
    }

    if (targetPage) {
      // Add an internal link on the TOC page at this entry's Y position
      doc.setPage(tocPageNumber);
      doc.link(margin + 28, entry.y - 8, contentW - 28, 28, { pageNumber: targetPage });
    }
  }
}
