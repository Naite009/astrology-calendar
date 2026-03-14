import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];

export interface TOCEntry {
  title: string;
  desc: string;
  y: number;
}

export function generatePDFTableOfContents(ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, narrative: string, birthdayMode?: boolean): TOCEntry[] {
  const { pw, margin, contentW } = ctx;
  const tocEntries: TOCEntry[] = [];

  ctx.pageBg(doc);

  // "CONTENTS" tracked caps label centered
  ctx.y += 8;
  ctx.trackedLabel(doc, 'CONTENTS', pw / 2, ctx.y, { align: 'center', charSpace: 4 });
  ctx.y += 6;

  // Hairline rule
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 16;

  // "Table of Contents" heading
  doc.setFont('times', 'bold'); doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text('Table of Contents', margin, ctx.y);
  ctx.y += 20;

  // Build sections list
  const sections: { title: string; desc: string }[] = [];
  sections.push({ title: 'How To Read This Report', desc: 'Key concepts explained in plain language' });
  sections.push({ title: 'Your Big Three', desc: 'Sun, Moon, and Rising — strengths, shadow, and how the year activates them' });
  sections.push({ title: 'Year at a Glance', desc: 'SR Ascendant, ruler, profection, time lord, and moon phase' });
  sections.push({ title: 'Profection Wheel', desc: 'Visual diagram of your annual profection and activated house' });
  if (a.profectionYear) sections.push({ title: 'Your Profection Year — What To Expect', desc: 'Detailed analysis of your profection house and Time Lord for the year' });
  if (a.profectionYear) sections.push({ title: 'Key Dates', desc: 'Exact dates when your Time Lord activates natal planets' });
  if (a.moonSign) sections.push({ title: 'Moon Sign Shift', desc: 'How your emotional processing changes this year' });
  sections.push({ title: 'Solar Return vs Natal', desc: 'Side-by-side comparison of all planet positions' });
  if (a.stelliums.length > 0) sections.push({ title: 'Stelliums', desc: 'Where 3+ planets cluster — your year\'s power zones' });
  if (a.elementBalance) sections.push({ title: 'Element and Modality', desc: 'Fire/Earth/Air/Water and Cardinal/Fixed/Mutable balance' });
  if (a.hemisphericEmphasis) sections.push({ title: 'Where Your Energy Lives', desc: 'Hemispheric distribution and angular planets' });
  if (a.lordOfTheYear) sections.push({ title: 'Lord of the Year', desc: 'Your Time Lord — the planet running the show' });
  if (a.saturnFocus || a.nodesFocus) sections.push({ title: 'Saturn and North Node', desc: 'Where you\'re being tested and where your soul is growing' });
  if (a.srToNatalAspects.length > 0) sections.push({ title: 'Key Aspects', desc: 'How SR planets activate your natal chart' });
  sections.push({ title: 'Your Moon This Year', desc: 'Emotional climate, angularity, and SR Moon aspects' });
  if (a.vertex) sections.push({ title: 'Vertex', desc: 'Fated encounters and destined meetings' });
  sections.push({ title: 'Planet Spotlight', desc: 'Deep dive into key planets by house placement' });
  if (narrative) sections.push({ title: 'Year-Ahead Reading', desc: 'Narrative synthesis of your year' });
  sections.push({ title: 'Best Months and Highlights', desc: 'Peak months for love, luck, and action' });
  sections.push({ title: 'Your Year in Four Seasons', desc: 'Key themes for each quarter of your solar return year' });
  if (birthdayMode) sections.push({ title: 'Birthday Affirmation Card', desc: 'A personalized affirmation to carry with you all year' });

  const entryH = Math.min(14, Math.max(11, Math.floor((ctx.ph - ctx.y - 30) / sections.length)));

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    ctx.checkPage(entryH + 2);
    const entryY = ctx.y;

    // Number — italic
    doc.setFont('times', 'italic'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(String(i + 1).padStart(2, '0'), margin, ctx.y + 2);

    // Title
    doc.setFont('times', 'normal'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(section.title, margin + 14, ctx.y + 2);

    // Dot leader
    const titleW = doc.getTextWidth(section.title);
    const dotsStart = margin + 14 + titleW + 4;
    const dotsEnd = pw - margin - 30;
    if (dotsEnd > dotsStart + 10) {
      doc.setFont('times', 'normal'); doc.setFontSize(7);
      doc.setTextColor(...RULE);
      const dotStr = '.'.repeat(Math.floor((dotsEnd - dotsStart) / 2.2));
      doc.text(dotStr, dotsStart, ctx.y + 2);
    }

    tocEntries.push({ title: section.title, desc: section.desc, y: entryY });

    // Hairline rule below every 5th entry
    if ((i + 1) % 5 === 0 && i < sections.length - 1) {
      ctx.y += entryH - 2;
      doc.setDrawColor(...RULE); doc.setLineWidth(0.2);
      doc.line(margin, ctx.y, pw - margin, ctx.y);
      ctx.y += 4;
    } else {
      ctx.y += entryH;
    }
  }

  return tocEntries;
}

export function addTOCLinks(doc: jsPDF, tocPageNumber: number, tocEntries: TOCEntry[], ctx: PDFContext) {
  const { pw, margin, contentW, sectionPages } = ctx;
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
      doc.setFont('times', 'normal'); doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`${targetPage}`, pw - margin - 4, entry.y + 2, { align: 'right' });
      doc.link(margin, entry.y - 4, contentW, 16, { pageNumber: targetPage });
    }
  }
}
