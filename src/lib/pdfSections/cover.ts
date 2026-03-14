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
  const { pw, ph, margin, contentW, colors } = ctx;
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
  doc.rect(0, 0, pw, ph, 'F');

  // ── CAKE IMAGE — large, centered ──
  const cakeImgSrc = cakeImages[natalSun];
  let cakeDataUrl: string | null = null;
  if (cakeImgSrc) cakeDataUrl = await loadImageDataUrl(cakeImgSrc);

  const cakeW = 260;
  const cakeH = 240;
  const cakeX = (pw - cakeW) / 2;
  ctx.y = 36;

  if (cakeDataUrl) {
    doc.addImage(cakeDataUrl, 'PNG', cakeX, ctx.y, cakeW, cakeH);
    ctx.y += cakeH + 14;
  } else {
    ctx.y += 20;
  }

  // ── HAPPY BIRTHDAY ──
  if (birthdayMode) {
    doc.setFont('Georgia', 'bold');
    doc.setFontSize(42);
    doc.setTextColor(...colors.gold);
    doc.text('Happy Birthday!', pw / 2, ctx.y, { align: 'center' });
    ctx.y += 18;
  }

  // ── PERSONAL MESSAGE — plain italic, no box ──
  if (birthdayMode && personalMessage.trim()) {
    ctx.y += 10;
    const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW - 80);
    doc.setFont('Georgia', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(92, 74, 42);
    msgLines.slice(0, 3).forEach((line: string) => {
      doc.text(line, pw / 2, ctx.y, { align: 'center' });
      ctx.y += 16;
    });
    ctx.y += 6;
  }

  // ── SINGLE DARK BANNER — name left, solar return year right ──
  ctx.y += 12;
  const stripH = 56;
  doc.setFillColor(...colors.deep);
  doc.rect(0, ctx.y, pw, stripH, 'F');

  // Name + birth info stacked on left
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(name.toUpperCase(), margin, ctx.y + 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(180, 170, 150);
  doc.text(
    `Born ${formatDate(natalChart.birthDate)}  ·  ${capitalizeLocation(natalChart.birthLocation)}`,
    margin, ctx.y + 34
  );

  // Solar Return + year stacked on right
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...colors.gold);
  doc.setCharSpace(1.2);
  doc.text('SOLAR RETURN', pw - margin, ctx.y + 18, { align: 'right' });
  doc.setCharSpace(0);

  doc.setFont('Georgia', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(...colors.gold);
  doc.text(String(year), pw - margin, ctx.y + 40, { align: 'right' });

  ctx.y += stripH + 22;

  // ── BORN WITH / THIS YEAR comparison ──
  const colW = (contentW - 20) / 2;
  const lineH = 22;

  // LEFT — BORN WITH
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...colors.dimText);
  doc.setCharSpace(0.8);
  doc.text('BORN WITH', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 4;
  doc.setDrawColor(...colors.rule);
  doc.setLineWidth(0.5);
  doc.line(margin, ctx.y, margin + colW, ctx.y);
  ctx.y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.ink);
  if (natalSun) doc.text(`${natalSun} Sun`, margin, ctx.y);
  if (natalMoon) doc.text(`${natalMoon} Moon`, margin, ctx.y + lineH);
  if (natalRising) doc.text(`${natalRising} Rising`, margin, ctx.y + lineH * 2);

  // RIGHT — THIS YEAR
  const rightX = margin + colW + 20;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...colors.dimText);
  doc.setCharSpace(0.8);
  doc.text('THIS YEAR', rightX, ctx.y - 14);
  doc.setCharSpace(0);
  doc.setDrawColor(...colors.rule);
  doc.setLineWidth(0.5);
  doc.line(rightX, ctx.y - 10, rightX + colW, ctx.y - 10);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.purple);
  if (srSunSign) doc.text(`${srSunSign} Sun`, rightX, ctx.y);
  if (srMoonSign) doc.text(`${srMoonSign} Moon`, rightX, ctx.y + lineH);
  if (srRisingSign) doc.text(`${srRisingSign} Rising`, rightX, ctx.y + lineH * 2);

  ctx.y += lineH * 3 + 20;
}
