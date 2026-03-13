import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

export function generatePDFTableOfContents(ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, narrative: string) {
  const { pw, margin, contentW, colors } = ctx;

  // Title
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(1.5);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 30;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text('TABLE OF CONTENTS', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 12;

  // Ornament
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(0.5);
  doc.line(pw / 2 - 50, ctx.y, pw / 2 + 50, ctx.y);
  ctx.y += 30;

  // Build sections list
  const sections: { title: string; desc: string }[] = [
    { title: 'Year at a Glance', desc: 'SR Ascendant, ruler, profection, time lord, and moon phase' },
    { title: 'Profection Wheel', desc: 'Visual diagram of your annual profection and activated house' },
  ];

  if (a.moonSign) sections.push({ title: 'Moon Sign Shift', desc: 'How your emotional processing changes this year' });
  sections.push({ title: 'Solar Return vs Natal', desc: 'Side-by-side comparison of all planet positions' });
  if (a.stelliums.length > 0) sections.push({ title: 'Stelliums', desc: 'Where 3+ planets cluster — your year\'s power zones' });
  if (a.elementBalance) sections.push({ title: 'Element & Modality', desc: 'Fire/Earth/Air/Water and Cardinal/Fixed/Mutable balance' });
  if (a.hemisphericEmphasis) sections.push({ title: 'Where Your Energy Lives', desc: 'Upper/Lower and Eastern/Western planet distribution' });
  if (a.angularPlanets?.length) sections.push({ title: 'Angular Planets', desc: 'The most powerful and visible planets this year' });
  if (a.lordOfTheYear) sections.push({ title: 'Lord of the Year', desc: 'Your Time Lord — the planet running the show' });
  if (a.saturnFocus || a.nodesFocus) sections.push({ title: 'Saturn & North Node', desc: 'Where you\'re being tested and where your soul is growing' });
  if (a.srToNatalAspects.length > 0) sections.push({ title: 'Key Aspects', desc: 'How SR planets activate your natal chart' });
  if (a.moonTimingEvents.length > 0) sections.push({ title: 'Moon Timing', desc: 'Month-by-month activation calendar' });
  if (a.vertex) sections.push({ title: 'Vertex', desc: 'Fated encounters and destined meetings' });
  sections.push({ title: 'Planet Spotlight', desc: 'Deep dive into key planets by house placement' });
  if (narrative) sections.push({ title: 'Year-Ahead Reading', desc: 'AI-generated narrative synthesis of your year' });

  // Render
  let num = 1;
  for (const section of sections) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.setTextColor(colors.deepBrown[0], colors.deepBrown[1], colors.deepBrown[2]);

    // Number circle
    doc.setFillColor(colors.softGold[0], colors.softGold[1], colors.softGold[2]);
    doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(0.5);
    doc.circle(margin + 12, ctx.y - 3, 10, 'FD');
    doc.setFontSize(9);
    doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    doc.text(String(num), margin + 12, ctx.y, { align: 'center' });

    // Title
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.setTextColor(colors.deepBrown[0], colors.deepBrown[1], colors.deepBrown[2]);
    doc.text(section.title, margin + 30, ctx.y);

    // Dots
    const titleW = doc.getTextWidth(section.title);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.setTextColor(colors.warmBorder[0], colors.warmBorder[1], colors.warmBorder[2]);
    const dotsStart = margin + 32 + titleW;
    const dotsEnd = pw - margin - 10;
    if (dotsEnd > dotsStart + 10) {
      let dx = dotsStart;
      while (dx < dotsEnd) { doc.text('.', dx, ctx.y); dx += 4; }
    }

    ctx.y += 4;

    // Description
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(colors.dimText[0], colors.dimText[1], colors.dimText[2]);
    doc.text(section.desc, margin + 30, ctx.y);

    ctx.y += 22;
    num++;
  }

  // Bottom ornament
  ctx.y += 10;
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(1.5);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
}
