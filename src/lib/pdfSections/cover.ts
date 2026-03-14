import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

type Color = [number, number, number];
const CREAM: Color = [250, 247, 242];
const INK:   Color = [18,  16,  14];
const GOLD:  Color = [184, 150, 62];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];
const CARD_BG: Color = [245, 241, 234];

const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
  } catch { return dateStr || ''; }
};

const formatDateShort = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${mm}-${dd}-${d.getFullYear()}`;
  } catch { return dateStr || ''; }
};

const capitalizeLocation = (loc: string | undefined): string => {
  if (!loc) return '';
  return loc.replace(/\b\w+/g, word => {
    if (word.length <= 2) return word.toUpperCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
};

function loadImageDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const c = canvas.getContext('2d');
        if (!c) { resolve(null); return; }
        c.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function generatePDFCover(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart,
  natalChart: NatalChart, birthdayMode: boolean, personalMessage: string,
  cakeImages: Record<string, string>
) {
  const { pw, ph, margin } = ctx;
  const name = natalChart.name || 'Chart';
  const year = srChart.solarReturnYear;

  const natalSun = natalChart.planets?.Sun?.sign || '';
  const natalMoon = natalChart.planets?.Moon?.sign || '';
  const natalRising = natalChart.houseCusps?.house1?.sign || '';
  const srMoon = a.moonSign || '';
  const srRising = a.yearlyTheme?.ascendantSign || '';

  // 1. Full CREAM background
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, pw, ph, 'F');

  // ─── TOP SECTION: Cake + Happy Birthday (side by side) ───
  let y = 30;

  // Top hairline rule (full width, gold-tinted)
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
  doc.line(margin, y, pw - margin, y);
  y += 16;

  // Cake image on left, text on right
  const cakeImgSrc = cakeImages[natalSun];
  const cakeX = margin;
  const cakeW = 200;
  const cakeH = 170;
  const textX = margin + cakeW + 20;

  if (cakeImgSrc) {
    try {
      const dataUrl = await loadImageDataUrl(cakeImgSrc);
      if (dataUrl) {
        doc.addImage(dataUrl, 'PNG', cakeX, y, cakeW, cakeH);
      }
    } catch { /* skip */ }
  }

  // "Happy Birthday!" text — large italic serif, gold/ink
  if (birthdayMode) {
    let ty = y + 30;
    doc.setFont('times', 'italic'); doc.setFontSize(36);
    doc.setTextColor(...INK);
    doc.text('Happy', textX, ty);
    ty += 42;
    doc.setFont('times', 'bolditalic'); doc.setFontSize(42);
    doc.setTextColor(...INK);
    doc.text('Birthday!', textX, ty);

    // Hairline rule under Happy Birthday
    ty += 18;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.line(textX, ty, textX + 160, ty);
    ty += 18;

    // YOUR NATAL CHART label
    doc.setFont('times', 'normal'); doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(2);
    doc.text('YOUR NATAL CHART', textX, ty);
    doc.setCharSpace(0);
    ty += 16;

    // Natal Big Three in gold bold
    doc.setFont('times', 'bold'); doc.setFontSize(13);
    doc.setTextColor(...GOLD);
    doc.text(`${natalSun} Sun`, textX, ty); ty += 18;
    doc.text(`${natalMoon} Moon`, textX, ty); ty += 18;
    doc.text(`${natalRising} Rising`, textX, ty);
  } else {
    // Non-birthday mode: just show name and natal info on the right
    let ty = y + 50;
    doc.setFont('times', 'bold'); doc.setFontSize(28);
    doc.setTextColor(...INK);
    doc.text(name.toUpperCase(), textX, ty);

    ty += 28;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.line(textX, ty, textX + 160, ty);
    ty += 18;

    doc.setFont('times', 'normal'); doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(2);
    doc.text('YOUR NATAL CHART', textX, ty);
    doc.setCharSpace(0);
    ty += 16;

    doc.setFont('times', 'bold'); doc.setFontSize(13);
    doc.setTextColor(...GOLD);
    doc.text(`${natalSun} Sun`, textX, ty); ty += 18;
    doc.text(`${natalMoon} Moon`, textX, ty); ty += 18;
    doc.text(`${natalRising} Rising`, textX, ty);
  }

  // ─── MIDDLE SECTION: SOLAR RETURN / Year / Name ───
  y = y + cakeH + 24;

  // Gold hairline rule
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
  doc.line(margin, y, pw - margin, y);
  y += 28;

  // "SOLAR RETURN" tracked caps centered
  doc.setFont('times', 'normal'); doc.setFontSize(10);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(5);
  doc.text('SOLAR RETURN', pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);
  y += 10;

  // Large bold year
  doc.setFont('times', 'bold'); doc.setFontSize(52);
  doc.setTextColor(...INK);
  doc.text(String(year), pw / 2, y + 38, { align: 'center' });
  y += 56;

  // Diamond separator ◆
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
  doc.line(pw / 2 - 40, y, pw / 2 - 6, y);
  doc.line(pw / 2 + 6, y, pw / 2 + 40, y);
  doc.setFont('times', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text('\u25C6', pw / 2, y + 3, { align: 'center' });
  y += 20;

  // Name — large serif
  doc.setFont('times', 'bold'); doc.setFontSize(26);
  doc.setTextColor(...INK);
  doc.text(name.toUpperCase(), pw / 2, y, { align: 'center' });
  y += 28;

  // ─── BOTTOM SECTION: Two comparison cards side by side ───
  const cardGap = 14;
  const cardW = (pw - margin * 2 - cardGap) / 2;
  const cardH = 105;
  const leftX = margin;
  const rightX = margin + cardW + cardGap;
  const cardY = y;

  // Left card — NATAL CHART
  doc.setFillColor(...CARD_BG);
  doc.roundedRect(leftX, cardY, cardW, cardH, 4, 4, 'F');
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.roundedRect(leftX, cardY, cardW, cardH, 4, 4, 'S');

  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(2.5);
  doc.text('NATAL CHART', leftX + cardW / 2, cardY + 22, { align: 'center' });
  doc.setCharSpace(0);

  doc.setFont('times', 'bold'); doc.setFontSize(13);
  doc.setTextColor(...GOLD);
  doc.text(`${natalSun} Sun`, leftX + cardW / 2, cardY + 44, { align: 'center' });
  doc.text(`${natalMoon} Moon`, leftX + cardW / 2, cardY + 62, { align: 'center' });
  doc.text(`${natalRising} Rising`, leftX + cardW / 2, cardY + 80, { align: 'center' });

  // Right card — SOLAR RETURN [Year]
  doc.setFillColor(...CARD_BG);
  doc.roundedRect(rightX, cardY, cardW, cardH, 4, 4, 'F');
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.roundedRect(rightX, cardY, cardW, cardH, 4, 4, 'S');

  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(2.5);
  doc.text(`SOLAR RETURN ${year}`, rightX + cardW / 2, cardY + 22, { align: 'center' });
  doc.setCharSpace(0);

  doc.setFont('times', 'bold'); doc.setFontSize(13);
  doc.setTextColor(...GOLD);
  doc.text(`${natalSun} Sun`, rightX + cardW / 2, cardY + 44, { align: 'center' });
  doc.text(`${srMoon} Moon`, rightX + cardW / 2, cardY + 62, { align: 'center' });
  doc.text(`${srRising} Rising`, rightX + cardW / 2, cardY + 80, { align: 'center' });

  // ─── Footer info ───
  const footerY = cardY + cardH + 18;
  doc.setFont('times', 'normal'); doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const birthFooter = `Born: ${formatDateShort(natalChart.birthDate)}  |  ${capitalizeLocation(natalChart.birthLocation)}`;
  doc.text(birthFooter, pw / 2, footerY, { align: 'center' });

  const srLoc = (srChart as any).location || (srChart as any).birthLocation || '';
  if (srLoc) {
    doc.text(`SR Location: ${capitalizeLocation(srLoc)}`, pw / 2, footerY + 14, { align: 'center' });
  }

  // Personal message below footer if birthday mode
  if (birthdayMode && personalMessage.trim()) {
    const msgY = footerY + 32;
    const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), pw * 0.6);
    doc.setFont('times', 'italic'); doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    let my = msgY;
    for (const line of msgLines.slice(0, 3)) {
      doc.text(line, pw / 2, my, { align: 'center' });
      my += 14;
    }
  }

  ctx.y = margin;
}
