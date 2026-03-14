import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { P } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];

const HOUSE_THEMES: Record<number, string> = {
  1: 'Self & Identity', 2: 'Money & Values', 3: 'Communication', 4: 'Home & Family',
  5: 'Creativity & Love', 6: 'Health & Work', 7: 'Partnerships', 8: 'Transformation',
  9: 'Travel & Learning', 10: 'Career & Legacy', 11: 'Friends & Community', 12: 'Spirituality & Rest',
};

export function drawProfectionWheel(ctx: PDFContext, doc: jsPDF, age: number, activeHouse: number, timeLord: string) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);
  ctx.sectionTitle(doc, 'Profection Wheel');

  const centerX = pw / 2;
  const centerY = ctx.y + 110;
  const outerR = 100;
  const innerR = 50;
  const labelR = 78;

  // Draw outer circle
  doc.setDrawColor(...RULE); doc.setLineWidth(0.5);
  doc.circle(centerX, centerY, outerR);
  doc.setLineWidth(0.25);
  doc.circle(centerX, centerY, innerR);

  // Draw 12 segments
  for (let i = 0; i < 12; i++) {
    const house = i + 1;
    const angle = (i * 30 - 90) * Math.PI / 180;

    const x1 = centerX + innerR * Math.cos(angle);
    const y1 = centerY + innerR * Math.sin(angle);
    const x2 = centerX + outerR * Math.cos(angle);
    const y2 = centerY + outerR * Math.sin(angle);
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(x1, y1, x2, y2);

    const isActive = house === activeHouse;
    if (isActive) {
      const midAngle = ((i * 30 + 15) - 90) * Math.PI / 180;
      const fillX = centerX + labelR * Math.cos(midAngle);
      const fillY = centerY + labelR * Math.sin(midAngle);
      doc.setFillColor(...INK);
      doc.circle(fillX, fillY, 14, 'F');
    }

    const midAngle = ((i * 30 + 15) - 90) * Math.PI / 180;
    const numX = centerX + labelR * Math.cos(midAngle);
    const numY = centerY + labelR * Math.sin(midAngle);

    doc.setFont('times', isActive ? 'bold' : 'normal');
    doc.setFontSize(isActive ? 12 : 9);
    doc.setTextColor(...(isActive ? [250, 247, 242] as Color : INK));
    doc.text(String(house), numX, numY + 3, { align: 'center' });

    const themeR = outerR + 28;
    const themeX = centerX + themeR * Math.cos(midAngle);
    const themeY = centerY + themeR * Math.sin(midAngle);
    const theme = HOUSE_THEMES[house] || '';
    doc.setFont('times', isActive ? 'bold' : 'normal');
    doc.setFontSize(isActive ? 7.5 : 6.5);
    doc.setTextColor(...(isActive ? INK : MUTED));

    const angleDeg = (i * 30 + 15 - 90);
    let align: 'center' | 'left' | 'right' = 'center';
    if (angleDeg > -45 && angleDeg < 45) align = 'left';
    else if (angleDeg > 135 || angleDeg < -135) align = 'right';
    doc.text(theme, themeX, themeY + 2, { align });
  }

  // Center: Age display
  doc.setFillColor(...INK);
  doc.circle(centerX, centerY, 20, 'F');
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(250, 247, 242);
  doc.text('AGE', centerX, centerY - 5, { align: 'center' });
  doc.setFontSize(16);
  doc.text(String(age), centerX, centerY + 9, { align: 'center' });

  ctx.y = centerY + outerR + 40;

  // Active house callout — editorial style (no filled box)
  ctx.trackedLabel(doc, `HOUSE ${activeHouse}: ${HOUSE_THEMES[activeHouse] || ''}`, margin, ctx.y);
  ctx.y += 12;
  doc.setFont('times', 'normal'); doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(`Time Lord: ${P[timeLord] || timeLord}  |  Age ${age}`, margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 14;
}
