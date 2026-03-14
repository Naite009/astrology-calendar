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
      canvas.width = img.width; canvas.height = img.height;
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
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return dateStr || ''; }
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

  const natalSun = natalChart.planets?.Sun?.sign || '';
  const natalMoon = natalChart.planets?.Moon?.sign || '';
  const natalRising = natalChart.houseCusps?.house1?.sign || '';
  const srSunSign = srChart.planets.Sun?.sign || natalSun;
  const srMoonSign = a.moonSign || srChart.planets.Moon?.sign || '';
  const srRisingSign = srChart.planets.Ascendant?.sign || a.yearlyTheme?.ascendantSign || '';

  // Page background
  doc.setFillColor(...colors.cream);
  doc.rect(0, 0, pw, ctx.ph, 'F');

  ctx.y = 44;

  // ── TOP SECTION: Cake centered + Happy Birthday below ──
  const cakeImgSrc = cakeImages[natalSun];
  let cakeDataUrl: string | null = null;
  if (cakeImgSrc) cakeDataUrl = await loadImageDataUrl(cakeImgSrc);

  // Cream background for top area
  const cakeW = 200; const cakeH = 170;
  const cakeX = (pw - cakeW) / 2;

  if (cakeDataUrl) {
    // #F5F0E8 background with border-radius
    doc.setFillColor(245, 240, 232);
    doc.roundedRect(cakeX, ctx.y, cakeW, cakeH, 4, 4, 'F');
    doc.addImage(cakeDataUrl, 'PNG', cakeX + 8, ctx.y + 8, cakeW - 16, cakeH - 16);
    ctx.y += cakeH + 10;
  } else {
    ctx.y += 20;
  }

  // "Happy Birthday!" centered below cake
  if (birthdayMode) {
    doc.setFont('Georgia', 'bold'); doc.setFontSize(42);
    doc.setTextColor(201, 168, 76); // #C9A84C
    doc.text('Happy Birthday!', pw / 2, ctx.y + 32, { align: 'center' });
    ctx.y += 48;
  }

  // 20pt gap before dark strip
  ctx.y += 20;

  // ── DARK STRIP ──
  const stripH = 44;
  doc.setFillColor(...colors.deep);
  doc.rect(0, ctx.y, pw, stripH, 'F');

  // Left: SOLAR RETURN
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...colors.lilac);
  doc.setCharSpace(1.2);
  doc.text('SOLAR RETURN', margin, ctx.y + 26);
  doc.setCharSpace(0);

  // Center: YEAR — larger 24pt
  doc.setFont('Georgia', 'bold'); doc.setFontSize(24);
  doc.setTextColor(255, 255, 255);
  doc.text(String(year), pw / 2, ctx.y + 29, { align: 'center' });

  // Right: FULL NAME
  doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
  doc.setTextColor(...colors.gold);
  doc.setCharSpace(0.4);
  doc.text(name.toUpperCase(), pw - margin, ctx.y + 27, { align: 'right' });
  doc.setCharSpace(0);

  ctx.y += stripH;

  // ── COMPARISON SECTION: Born With / This Year ──
  ctx.y += 18;
  const colW = (contentW - 20) / 2;

  // LEFT — BORN WITH
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...colors.dimText); doc.setCharSpace(0.8);
  doc.text('BORN WITH', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 4;
  doc.setDrawColor(...colors.rule); doc.setLineWidth(0.5);
  doc.line(margin, ctx.y, margin + colW, ctx.y);
  ctx.y += 8;

  const lineH = 22;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.setTextColor(...colors.ink);
  if (natalSun) doc.text(`${natalSun} Sun`, margin, ctx.y);
  if (natalMoon) doc.text(`${natalMoon} Moon`, margin, ctx.y + lineH);
  if (natalRising) doc.text(`${natalRising} Rising`, margin, ctx.y + lineH * 2);

  // RIGHT — THIS YEAR
  const rightX = margin + colW + 20;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...colors.dimText); doc.setCharSpace(0.8);
  doc.text('THIS YEAR', rightX, ctx.y - 12);
  doc.setCharSpace(0);
  doc.setDrawColor(...colors.rule); doc.setLineWidth(0.5);
  doc.line(rightX, ctx.y - 8, rightX + colW, ctx.y - 8);

  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.setTextColor(...colors.purple);
  if (srSunSign) doc.text(`${srSunSign} Sun`, rightX, ctx.y);
  if (srMoonSign) doc.text(`${srMoonSign} Moon`, rightX, ctx.y + lineH);
  if (srRisingSign) doc.text(`${srRisingSign} Rising`, rightX, ctx.y + lineH * 2);

  ctx.y += lineH * 3 + 14;

  // ── PERSONAL MESSAGE (birthday mode) ──
  if (birthdayMode && personalMessage.trim()) {
    const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW - 60);
    const msgH = Math.min(msgLines.length, 3) * 16 + 20;
    doc.setFillColor(...colors.warm); doc.setDrawColor(...colors.rule); doc.setLineWidth(0.5);
    doc.roundedRect(margin + 20, ctx.y, contentW - 40, msgH, 3, 3, 'FD');
    doc.setFont('Georgia', 'italic'); doc.setFontSize(10);
    doc.setTextColor(92, 74, 42);
    let msgY = ctx.y + 14;
    for (const line of msgLines.slice(0, 3)) { doc.text(line, pw / 2, msgY, { align: 'center' }); msgY += 16; }
    ctx.y += msgH + 10;
  }

  // ── NAME STRIP ──
  const nameStripH = 36;
  doc.setFillColor(...colors.purple);
  doc.rect(0, ctx.y, pw, nameStripH, 'F');

  doc.setFont('Georgia', 'bold'); doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setCharSpace(0.6);
  const diamondColor = colors.gold;
  // Diamond + name + diamond
  doc.setTextColor(...diamondColor);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(12);
  const nameUpper = name.toUpperCase();
  const nameTextW = doc.getTextWidth(nameUpper);
  // Use text for diamonds since jsPDF triangle is complex
  doc.setFont('Georgia', 'bold'); doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(nameUpper, pw / 2, ctx.y + 22, { align: 'center' });
  doc.setCharSpace(0);

  ctx.y += nameStripH;

  // Birth info below
  ctx.y += 14;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
  doc.setTextColor(...colors.dimText);
  doc.text(`Born ${formatDate(natalChart.birthDate)}  ·  ${capitalizeLocation(natalChart.birthLocation)}`, pw / 2, ctx.y, { align: 'center' });
  ctx.y += 20;
}
