import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { P } from '@/components/SolarReturnPDFExport';

const HOUSE_THEMES: Record<number, string> = {
  1: 'Self & Identity',
  2: 'Money & Values',
  3: 'Communication',
  4: 'Home & Family',
  5: 'Creativity & Love',
  6: 'Health & Work',
  7: 'Partnerships',
  8: 'Transformation',
  9: 'Travel & Learning',
  10: 'Career & Legacy',
  11: 'Friends & Community',
  12: 'Spirituality & Rest',
};

export function drawProfectionWheel(ctx: PDFContext, doc: jsPDF, age: number, activeHouse: number, timeLord: string) {
  const { pw, margin, contentW, colors } = ctx;

  // Section title
  ctx.sectionTitle(doc, 'Profection Wheel');

  const centerX = pw / 2;
  const centerY = ctx.y + 120;
  const outerR = 110;
  const innerR = 55;
  const labelR = 85;

  // Draw outer circle
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(2);
  doc.circle(centerX, centerY, outerR);
  doc.setLineWidth(0.5);
  doc.circle(centerX, centerY, innerR);

  // Draw 12 segments
  for (let i = 0; i < 12; i++) {
    const house = i + 1;
    const angle = (i * 30 - 90) * Math.PI / 180; // start at top
    const nextAngle = ((i + 1) * 30 - 90) * Math.PI / 180;

    // Spoke lines
    const x1 = centerX + innerR * Math.cos(angle);
    const y1 = centerY + innerR * Math.sin(angle);
    const x2 = centerX + outerR * Math.cos(angle);
    const y2 = centerY + outerR * Math.sin(angle);
    doc.setDrawColor(colors.warmBorder[0], colors.warmBorder[1], colors.warmBorder[2]); doc.setLineWidth(0.5);
    doc.line(x1, y1, x2, y2);

    // Highlight active house
    const isActive = house === activeHouse;
    if (isActive) {
      // Fill the segment
      const midAngle = ((i * 30 + 15) - 90) * Math.PI / 180;
      const fillX = centerX + labelR * Math.cos(midAngle);
      const fillY = centerY + labelR * Math.sin(midAngle);
      doc.setFillColor(colors.softGold[0], colors.softGold[1], colors.softGold[2]);
      doc.circle(fillX, fillY, 14, 'F');
    }

    // House number in segment
    const midAngle = ((i * 30 + 15) - 90) * Math.PI / 180;
    const numX = centerX + labelR * Math.cos(midAngle);
    const numY = centerY + labelR * Math.sin(midAngle);

    doc.setFont('helvetica', isActive ? 'bold' : 'normal');
    doc.setFontSize(isActive ? 12 : 9);
    if (isActive) {
      doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    } else {
      doc.setTextColor(colors.bodyText[0], colors.bodyText[1], colors.bodyText[2]);
    }
    doc.text(String(house), numX, numY + 3, { align: 'center' });

    // House theme outside the wheel
    const themeR = outerR + 16;
    const themeX = centerX + themeR * Math.cos(midAngle);
    const themeY = centerY + themeR * Math.sin(midAngle);
    const theme = HOUSE_THEMES[house] || '';
    doc.setFont('helvetica', isActive ? 'bold' : 'normal');
    doc.setFontSize(isActive ? 7.5 : 6.5);
    if (isActive) {
      doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    } else {
      doc.setTextColor(colors.dimText[0], colors.dimText[1], colors.dimText[2]);
    }

    // Rotate text alignment based on position
    const angleDeg = (i * 30 + 15 - 90);
    let align: 'center' | 'left' | 'right' = 'center';
    if (angleDeg > -45 && angleDeg < 45) align = 'left';
    else if (angleDeg > 135 || angleDeg < -135) align = 'right';

    doc.text(theme, themeX, themeY + 2, { align });
  }

  // Center: Age display
  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.circle(centerX, centerY, 22, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('AGE', centerX, centerY - 6, { align: 'center' });
  doc.setFontSize(18);
  doc.text(String(age), centerX, centerY + 10, { align: 'center' });

  ctx.y = centerY + outerR + 30;

  // Active house callout
  doc.setFillColor(colors.softGold[0], colors.softGold[1], colors.softGold[2]);
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(1);
  doc.roundedRect(margin, ctx.y, contentW, 44, 6, 6, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text(`House ${activeHouse}: ${HOUSE_THEMES[activeHouse] || ''}`, margin + 14, ctx.y + 18);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.setTextColor(colors.bodyText[0], colors.bodyText[1], colors.bodyText[2]);
  doc.text(`Time Lord: ${P[timeLord] || timeLord}  |  Age ${age}`, margin + 14, ctx.y + 34);
  ctx.y += 54;
}
