import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const GOLD:  Color = [184, 150, 62];
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
  ctx.y += 20;

  // "Table of Contents" large serif heading
  doc.setFont('times', 'normal'); doc.setFontSize(24);
  doc.setTextColor(...INK);
  doc.text('Table of Contents', margin, ctx.y);
  ctx.y += 24;

  // Hairline rule below heading
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 14;

  // Build sections list
  const sections: { title: string; desc: string }[] = [];
  sections.push({ title: 'How to Read This Report', desc: 'Key concepts explained in plain language' });
  sections.push({ title: 'Your Big Three', desc: 'Sun, Moon, and Rising — strengths, shadow, and activation' });
  
  sections.push({ title: 'Lunar Phase Timeline', desc: '29-year developmental cycle with recurring patterns' });
  sections.push({ title: 'Natal Overlay & Angle Activations', desc: 'How SR angles (ASC/MC) contact natal planets and vice versa' });
  sections.push({ title: 'Year Priority Engine', desc: 'Life areas ranked by planetary emphasis' });
  if (a.moonSign) sections.push({ title: 'Moon Sign Shift', desc: 'How your emotional processing changes this year' });
  sections.push({ title: 'Natal vs Solar Return', desc: 'Side-by-side comparison of all planet positions' });
  if (a.stelliums.length > 0) sections.push({ title: 'Stelliums', desc: 'Where 3+ planets cluster' });
  if (a.elementBalance) sections.push({ title: 'Element & Modality Balance', desc: 'Fire/Earth/Air/Water and Cardinal/Fixed/Mutable' });
  if (a.hemisphericEmphasis) sections.push({ title: 'Where Your Energy Lives', desc: 'Hemispheric distribution' });
  if (a.lordOfTheYear || a.profectionYear) sections.push({ title: 'Your Time Lord (Lord of the Year)', desc: 'The planet running the show this year' });
  sections.push({ title: 'Profection Wheel & Your Profection Year', desc: 'Visual diagram and activated house' });
  if (a.profectionYear) sections.push({ title: 'Key Dates', desc: 'Exact dates when your Time Lord activates natal planets' });
  if (a.saturnFocus || a.nodesFocus) sections.push({ title: 'Saturn & North Node', desc: 'Where you are being tested and growing' });
  if (a.srToNatalAspects.length > 0) sections.push({ title: 'Key Aspects', desc: 'Planet-to-planet contacts between SR and natal charts' });
  
  if (a.vertex) sections.push({ title: 'Vertex', desc: 'Fated encounters and destined meetings' });
  sections.push({ title: 'Planet Spotlight', desc: 'Deep dive into key planets by house placement' });
  sections.push({ title: 'Best Months & Highlights', desc: 'Peak months for love, luck, and action' });
  sections.push({ title: 'Your Year in Four Seasons', desc: 'Key themes for each quarter' });
  if (birthdayMode) sections.push({ title: 'Take This With You', desc: 'Your natal strength, this year\'s ask, and a closing note' });

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    ctx.checkPage(20);
    const entryY = ctx.y;

    // Bold gold number
    doc.setFont('times', 'bold'); doc.setFontSize(8.5);
    doc.setTextColor(...GOLD);
    doc.text(String(i + 1).padStart(2, '0'), margin, ctx.y + 2);

    // Title in regular serif
    doc.setFont('times', 'normal'); doc.setFontSize(9.75);
    doc.setTextColor(...INK);
    doc.text(section.title, margin + 18, ctx.y + 2);

    tocEntries.push({ title: section.title, desc: section.desc, y: entryY });

    ctx.y += 13;

    // Hairline rule after every entry
    doc.setDrawColor(...RULE); doc.setLineWidth(0.15);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 9;
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
      doc.setFont('times', 'normal'); doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(`${targetPage}`, pw - margin, entry.y + 2, { align: 'right' });
      doc.link(margin, entry.y - 4, contentW, 16, { pageNumber: targetPage });
    }
  }
}
