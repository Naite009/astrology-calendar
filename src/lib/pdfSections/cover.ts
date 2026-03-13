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
  
  // Natal Big 3
  const natalSun = natalChart.planets?.Sun?.sign || '';
  const natalMoon = natalChart.planets?.Moon?.sign || '';
  const natalRising = natalChart.houseCusps?.house1?.sign || '';
  
  // SR Big 3
  const srSunSign = srChart.planets.Sun?.sign || natalSun;
  const srMoonSign = a.moonSign || srChart.planets.Moon?.sign || '';
  const srRisingSign = srChart.planets.Ascendant?.sign || a.yearlyTheme?.ascendantSign || '';

  ctx.y = 50;

  if (birthdayMode) {
    const cakeImgSrc = cakeImages[natalSun];
    let cakeDataUrl: string | null = null;
    if (cakeImgSrc) cakeDataUrl = await loadImageDataUrl(cakeImgSrc);

    doc.setDrawColor(...colors.gold); doc.setLineWidth(2);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 30;

    const cakeW = 190; const cakeH = 160;
    const textStartX = margin + cakeW + 30;

    if (cakeDataUrl) doc.addImage(cakeDataUrl, 'PNG', margin, ctx.y - 10, cakeW, cakeH);

    doc.setFont('times', 'bolditalic'); doc.setFontSize(42); doc.setTextColor(188, 120, 60);
    doc.text('Happy', textStartX, ctx.y + 28);
    doc.setFontSize(50); doc.text('Birthday!', textStartX, ctx.y + 70);

    doc.setFontSize(14); doc.setTextColor(...colors.gold);
    doc.setLineWidth(0.5);
    doc.line(textStartX, ctx.y + 88, textStartX + 120, ctx.y + 88);

    // Natal Big 3 on cover (right of cake)
    const big3Y = ctx.y + 108;
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...colors.dimText);
    doc.text('YOUR NATAL CHART', textStartX, big3Y);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13);
    doc.setTextColor(...colors.deepBrown);
    if (natalSun) doc.text(`${natalSun} Sun`, textStartX, big3Y + 16);
    if (natalMoon) doc.text(`${natalMoon} Moon`, textStartX, big3Y + 32);
    if (natalRising) doc.text(`${natalRising} Rising`, textStartX, big3Y + 48);

    ctx.y += cakeH + 10;

    if (personalMessage.trim()) {
      ctx.y += 8;
      const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW - 60);
      const msgH = msgLines.length * 16 + 28;
      doc.setFillColor(252, 248, 240); doc.setDrawColor(...colors.gold); doc.setLineWidth(1);
      doc.roundedRect(margin + 20, ctx.y, contentW - 40, msgH, 8, 8, 'FD');
      doc.setFont('times', 'italic'); doc.setFontSize(12); doc.setTextColor(100, 80, 50);
      let msgY = ctx.y + 18;
      for (const line of msgLines) { doc.text(line, pw / 2, msgY, { align: 'center' }); msgY += 16; }
      ctx.y += msgH + 12;
    }

    doc.setDrawColor(...colors.gold); doc.setLineWidth(2);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 24;
  }

  // --- TITLE AREA ---
  if (!birthdayMode) {
    doc.setDrawColor(...colors.gold); doc.setLineWidth(2.5);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 1; doc.setLineWidth(0.5);
    doc.line(margin, ctx.y + 2, pw - margin, ctx.y + 2);
    ctx.y += 45;
  }

  doc.setFont('helvetica', 'normal'); doc.setFontSize(13);
  doc.setTextColor(...colors.gold);
  doc.text('S O L A R   R E T U R N', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 32;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(32);
  doc.setTextColor(...colors.darkText);
  doc.text(String(year), pw / 2, ctx.y, { align: 'center' });
  ctx.y += 28;

  // Ornament
  doc.setDrawColor(...colors.gold); doc.setLineWidth(0.5);
  doc.line(pw / 2 - 60, ctx.y, pw / 2 - 8, ctx.y);
  doc.line(pw / 2 + 8, ctx.y, pw / 2 + 60, ctx.y);
  doc.setFillColor(...colors.gold);
  doc.triangle(pw / 2, ctx.y - 3, pw / 2 - 3, ctx.y, pw / 2 + 3, ctx.y, 'F');
  doc.triangle(pw / 2, ctx.y + 3, pw / 2 - 3, ctx.y, pw / 2 + 3, ctx.y, 'F');
  ctx.y += 26;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  doc.setTextColor(...colors.deepBrown);
  doc.text(name.toUpperCase(), pw / 2, ctx.y, { align: 'center' });
  ctx.y += 28;

  // --- NATAL & SR BIG 3 BOXES ---
  const gap = 16;
  const boxW = (contentW - gap) / 2;
  const boxH = 90;
  const startX = margin;

  // Natal box
  doc.setFillColor(...colors.softGold);
  doc.setDrawColor(...colors.warmBorder); doc.setLineWidth(0.5);
  doc.roundedRect(startX, ctx.y, boxW, boxH, 8, 8, 'FD');

  doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  doc.setTextColor(...colors.dimText);
  doc.text('N A T A L   C H A R T', startX + boxW / 2, ctx.y + 16, { align: 'center' });

  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.setTextColor(...colors.deepBrown);
  let ny = ctx.y + 34;
  if (natalSun) { doc.text(`${natalSun} Sun`, startX + boxW / 2, ny, { align: 'center' }); ny += 18; }
  if (natalMoon) { doc.text(`${natalMoon} Moon`, startX + boxW / 2, ny, { align: 'center' }); ny += 18; }
  if (natalRising) { doc.text(`${natalRising} Rising`, startX + boxW / 2, ny, { align: 'center' }); }

  // SR box
  const srBoxX = startX + boxW + gap;
  doc.setFillColor(...colors.softBlue);
  doc.setDrawColor(...colors.warmBorder); doc.setLineWidth(0.5);
  doc.roundedRect(srBoxX, ctx.y, boxW, boxH, 8, 8, 'FD');

  doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
  doc.setTextColor(...colors.dimText);
  doc.text(`S O L A R   R E T U R N   ${year}`, srBoxX + boxW / 2, ctx.y + 16, { align: 'center' });

  doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
  doc.setTextColor(...colors.deepBrown);
  let sy = ctx.y + 34;
  if (srSunSign) { doc.text(`${srSunSign} Sun`, srBoxX + boxW / 2, sy, { align: 'center' }); sy += 18; }
  if (srMoonSign) { doc.text(`${srMoonSign} Moon`, srBoxX + boxW / 2, sy, { align: 'center' }); sy += 18; }
  if (srRisingSign) { doc.text(`${srRisingSign} Rising`, srBoxX + boxW / 2, sy, { align: 'center' }); }

  ctx.y += boxH + 18;

  // Birth info
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...colors.dimText);
  doc.text(`Born: ${formatDate(natalChart.birthDate)}   |   ${capitalizeLocation(natalChart.birthLocation)}`, pw / 2, ctx.y, { align: 'center' });
  if (srChart.solarReturnLocation) {
    ctx.y += 14;
    doc.text(`SR Location: ${capitalizeLocation(srChart.solarReturnLocation)}`, pw / 2, ctx.y, { align: 'center' });
  }
  ctx.y += 24;
}
