import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

async function loadImageDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const c2 = canvas.getContext('2d');
      if (!c2) { resolve(null); return; }
      c2.drawImage(img, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '--';
  const parts = dateStr.split('-');
  if (parts.length === 3 && parts[0].length === 4) return `${parts[1]}-${parts[2]}-${parts[0]}`;
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}-${d.getFullYear()}`;
  } catch { /* */ }
  return dateStr;
};

const capitalizeLocation = (loc: string | undefined): string => {
  if (!loc) return '--';
  return loc.replace(/\b\w+/g, word => {
    if (word.length <= 2) return word.toUpperCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

export async function generatePDFCover(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart,
  natalChart: NatalChart, birthdayMode: boolean, personalMessage: string,
  cakeImages: Record<string, string>
) {
  const { pw, margin, contentW, colors } = ctx;
  const name = natalChart.name || 'Chart';
  const year = srChart.solarReturnYear;
  const srSunSign = srChart.planets.Sun?.sign || natalChart.planets.Sun?.sign || '';
  const srMoonSign = a.moonSign || srChart.planets.Moon?.sign || '';
  const srRisingSign = srChart.planets.Ascendant?.sign || a.yearlyTheme?.ascendantSign || '';

  ctx.y = 50;

  if (birthdayMode) {
    const cakeImgSrc = cakeImages[srSunSign];
    let cakeDataUrl: string | null = null;
    if (cakeImgSrc) cakeDataUrl = await loadImageDataUrl(cakeImgSrc);

    doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(2);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 30;

    const cakeW = 200; const cakeH = 170;
    const textStartX = margin + cakeW + 30;

    if (cakeDataUrl) doc.addImage(cakeDataUrl, 'PNG', margin, ctx.y - 10, cakeW, cakeH);

    doc.setFont('times', 'bolditalic'); doc.setFontSize(44); doc.setTextColor(188, 120, 60);
    doc.text('Happy', textStartX, ctx.y + 30);
    doc.setFontSize(52); doc.text('Birthday!', textStartX, ctx.y + 75);

    doc.setFontSize(16); doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    doc.text('*  .  *  .  *', textStartX, ctx.y + 95);

    const big3Y = ctx.y + 116;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.setTextColor(colors.deepBrown[0], colors.deepBrown[1], colors.deepBrown[2]);
    if (srSunSign) doc.text(`${srSunSign} Sun`, textStartX, big3Y);
    if (srMoonSign) doc.text(`${srMoonSign} Moon`, textStartX, big3Y + 20);
    if (srRisingSign) doc.text(`${srRisingSign} Rising`, textStartX, big3Y + 40);

    ctx.y += cakeH + 10;

    if (personalMessage.trim()) {
      ctx.y += 8;
      const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW - 60);
      const msgH = msgLines.length * 16 + 28;
      doc.setFillColor(252, 248, 240); doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(1);
      doc.roundedRect(margin + 20, ctx.y, contentW - 40, msgH, 8, 8, 'FD');
      doc.setFont('times', 'italic'); doc.setFontSize(12); doc.setTextColor(100, 80, 50);
      let msgY = ctx.y + 18;
      for (const line of msgLines) { doc.text(line, pw / 2, msgY, { align: 'center' }); msgY += 16; }
      ctx.y += msgH + 12;
    }

    doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(2);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 24;
  }

  // --- TITLE AREA ---
  if (!birthdayMode) {
    doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(2.5);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 1; doc.setLineWidth(0.5);
    doc.line(margin, ctx.y + 2, pw - margin, ctx.y + 2);
    ctx.y += 45;
  }

  doc.setFont('helvetica', 'normal'); doc.setFontSize(13);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text('S O L A R   R E T U R N', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 32;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(32);
  doc.setTextColor(colors.darkText[0], colors.darkText[1], colors.darkText[2]);
  doc.text(String(year), pw / 2, ctx.y, { align: 'center' });
  ctx.y += 28;

  // Ornament
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(0.5);
  doc.line(pw / 2 - 60, ctx.y, pw / 2 - 8, ctx.y);
  doc.line(pw / 2 + 8, ctx.y, pw / 2 + 60, ctx.y);
  doc.setFillColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.triangle(pw / 2, ctx.y - 3, pw / 2 - 3, ctx.y, pw / 2 + 3, ctx.y, 'F');
  doc.triangle(pw / 2, ctx.y + 3, pw / 2 - 3, ctx.y, pw / 2 + 3, ctx.y, 'F');
  ctx.y += 26;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  doc.setTextColor(colors.deepBrown[0], colors.deepBrown[1], colors.deepBrown[2]);
  doc.text(name.toUpperCase(), pw / 2, ctx.y, { align: 'center' });
  ctx.y += 24;

  // Big 3
  if (srSunSign || srMoonSign || srRisingSign) {
    const big3BoxW = 220; const big3BoxH = 78;
    const big3X = (pw - big3BoxW) / 2;
    doc.setFillColor(colors.softGold[0], colors.softGold[1], colors.softGold[2]);
    doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(1.5);
    doc.roundedRect(big3X, ctx.y, big3BoxW, big3BoxH, 8, 8, 'FD');

    doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
    doc.setTextColor(colors.deepBrown[0], colors.deepBrown[1], colors.deepBrown[2]);
    let by = ctx.y + 22;
    if (srSunSign) { doc.text(`SUN:  ${srSunSign}`, pw / 2, by, { align: 'center' }); by += 20; }
    if (srMoonSign) { doc.text(`MOON:  ${srMoonSign}`, pw / 2, by, { align: 'center' }); by += 20; }
    if (srRisingSign) { doc.text(`RISING:  ${srRisingSign}`, pw / 2, by, { align: 'center' }); }
    ctx.y += big3BoxH + 14;
  }

  // Birth info
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.setTextColor(colors.dimText[0], colors.dimText[1], colors.dimText[2]);
  doc.text(`Born: ${formatDate(natalChart.birthDate)}   |   ${capitalizeLocation(natalChart.birthLocation)}`, pw / 2, ctx.y, { align: 'center' });
  if (srChart.solarReturnLocation) {
    ctx.y += 14;
    doc.text(`SR Location: ${capitalizeLocation(srChart.solarReturnLocation)}`, pw / 2, ctx.y, { align: 'center' });
  }
  ctx.y += 24;
}
