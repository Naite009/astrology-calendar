import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

export function generatePDFTableOfContents(ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, narrative: string, birthdayMode?: boolean) {
  const { pw, margin, contentW, colors } = ctx;

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

  // Build sections list
  const sections: { title: string; desc: string }[] = [];

  if (birthdayMode) sections.push({ title: 'Personal Strengths Portrait', desc: 'Your natal gifts — the foundation your year builds upon' });
  sections.push({ title: 'Year at a Glance', desc: 'SR Ascendant, ruler, profection, time lord, and moon phase' });
  sections.push({ title: 'Profection Wheel', desc: 'Visual diagram of your annual profection and activated house' });
  if (a.moonSign) sections.push({ title: 'Moon Sign Shift', desc: 'How your emotional processing changes this year' });
  sections.push({ title: 'Solar Return vs Natal', desc: 'Side-by-side comparison of all planet positions' });
  if (a.stelliums.length > 0) sections.push({ title: 'Stelliums', desc: 'Where 3+ planets cluster — your year\'s power zones' });
  if (a.elementBalance) sections.push({ title: 'Element and Modality', desc: 'Fire/Earth/Air/Water and Cardinal/Fixed/Mutable balance' });
  if (a.hemisphericEmphasis) sections.push({ title: 'Where Your Energy Lives', desc: 'Upper/Lower and Eastern/Western planet distribution' });
  if (a.angularPlanets?.length) sections.push({ title: 'Angular Planets', desc: 'The most powerful and visible planets this year' });
  if (a.lordOfTheYear) sections.push({ title: 'Lord of the Year', desc: 'Your Time Lord — the planet running the show' });
  if (a.saturnFocus || a.nodesFocus) sections.push({ title: 'Saturn and North Node', desc: 'Where you\'re being tested and where your soul is growing' });
  if (a.srToNatalAspects.length > 0) sections.push({ title: 'Key Aspects', desc: 'How SR planets activate your natal chart' });
  if (a.moonTimingEvents.length > 0) sections.push({ title: 'Moon Timing', desc: 'Month-by-month activation calendar' });
  if (a.vertex) sections.push({ title: 'Vertex', desc: 'Fated encounters and destined meetings' });
  sections.push({ title: 'Planet Spotlight', desc: 'Deep dive into key planets by house placement' });
  if (narrative) sections.push({ title: 'Year-Ahead Reading', desc: 'AI-generated narrative synthesis of your year' });
  sections.push({ title: 'Best Months & Highlights', desc: 'Peak months for love, luck, and action' });
  if (birthdayMode) sections.push({ title: 'Birthday Affirmation Card', desc: 'A personalized affirmation to carry with you all year' });

  // Render in two columns for cleaner layout
  const colW = (contentW - 30) / 2;
  const leftX = margin;
  const rightX = margin + colW + 30;
  const itemH = 38; // height per item
  const half = Math.ceil(sections.length / 2);

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const isRight = i >= half;
    const col = isRight ? 1 : 0;
    const row = isRight ? i - half : i;
    const x = col === 0 ? leftX : rightX;
    const itemY = ctx.y + row * itemH;

    // Check page
    if (itemY + itemH > ctx.ph - 55) break;

    // Number badge
    const badgeX = x + 14;
    const badgeY = itemY + 6;
    doc.setFillColor(...colors.softGold);
    doc.setDrawColor(...colors.gold); doc.setLineWidth(0.8);
    doc.roundedRect(badgeX - 11, badgeY - 9, 22, 18, 4, 4, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.setTextColor(...colors.gold);
    doc.text(String(i + 1), badgeX, badgeY + 2, { align: 'center' });

    // Title
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5);
    doc.setTextColor(...colors.deepBrown);
    doc.text(section.title, x + 30, itemY + 6);

    // Description
    doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
    doc.setTextColor(...colors.dimText);
    const descLines = doc.splitTextToSize(section.desc, colW - 34);
    descLines.slice(0, 2).forEach((line: string, li: number) => {
      doc.text(line, x + 30, itemY + 18 + li * 10);
    });
  }

  ctx.y += half * itemH + 16;

  // Bottom ornament
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1.5);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
}
