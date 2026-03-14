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
  const { pw, ph, margin, contentW } = ctx;
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

  // ─── LAYOUT: Match v3 editorial spacing exactly ───
  // Page is 792pt tall. Generous top margin.

  // "✦  SOLAR RETURN  ✦" — gold tracked caps at ~18% down
  let y = 142;
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('\u2726   SOLAR RETURN   \u2726', pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);

  // Large serif name — 60pt below the label
  y += 60;
  doc.setFont('times', 'normal'); doc.setFontSize(40);
  doc.setTextColor(...INK);
  const nameLines: string[] = doc.splitTextToSize(name.toUpperCase(), contentW + 40);
  for (const line of nameLines) {
    doc.text(line, pw / 2, y, { align: 'center' });
    y += 46;
  }

  // Birth info — tight under name
  y += 4;
  const birthInfo = `BORN ${formatDate(natalChart.birthDate)}  \u00B7  ${capitalizeLocation(natalChart.birthLocation).toUpperCase()}`;
  doc.setFont('times', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(2);
  doc.text(birthInfo, pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);

  // "SOLAR RETURN" label — well below birth info
  y += 50;
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(4);
  doc.text('SOLAR RETURN', pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);

  // Massive year — directly below label
  y += 8;
  doc.setFont('times', 'bold'); doc.setFontSize(82);
  doc.setTextColor(...INK);
  doc.text(String(year), pw / 2, y + 58, { align: 'center' });
  y += 72;

  // Cake image — centered below the year
  const cakeImgSrc = cakeImages[natalSun];
  if (cakeImgSrc) {
    try {
      const dataUrl = await loadImageDataUrl(cakeImgSrc);
      if (dataUrl) {
        const imgW = 220;
        const imgH = 186;
        const imgX = (pw - imgW) / 2;
        doc.addImage(dataUrl, 'PNG', imgX, y, imgW, imgH);
        y += imgH + 16;
      }
    } catch { /* skip */ }
  }

  // ─── Comparison table: BORN WITH | THIS YEAR ───
  // Position it in the lower portion of the page
  const tableW = contentW * 0.82;
  const tableX = (pw - tableW) / 2;
  const tableH = 120;
  const tableY = Math.max(y + 10, ph * 0.70);
  const midX = tableX + tableW / 2;

  // Table background
  doc.setFillColor(...CARD_BG);
  doc.roundedRect(tableX, tableY, tableW, tableH, 4, 4, 'F');
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.roundedRect(tableX, tableY, tableW, tableH, 4, 4, 'S');

  // Vertical divider
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(midX, tableY + 14, midX, tableY + tableH - 14);

  // Headers — tracked caps
  doc.setFont('times', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(3);
  doc.text('BORN WITH', tableX + (tableW / 4), tableY + 28, { align: 'center' });
  doc.text('THIS YEAR', midX + (tableW / 4), tableY + 28, { align: 'center' });
  doc.setCharSpace(0);

  // Big Three comparison — generous 14pt font, 22pt line spacing
  const entries = [
    { natal: `${natalSun} Sun`, sr: `${natalSun} Sun` },
    { natal: `${natalMoon} Moon`, sr: `${srMoon} Moon` },
    { natal: `${natalRising} Rising`, sr: `${srRising} Rising` },
  ];

  doc.setFont('times', 'normal'); doc.setFontSize(14);
  entries.forEach((e, i) => {
    const ey = tableY + 52 + i * 22;
    doc.setTextColor(...INK);
    doc.text(e.natal, tableX + (tableW / 4), ey, { align: 'center' });
    doc.setTextColor(...GOLD);
    doc.text(e.sr, midX + (tableW / 4), ey, { align: 'center' });
  });

  // Personal message below table
  if (birthdayMode && personalMessage.trim()) {
    const msgY = tableY + tableH + 16;
    const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW * 0.6);
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
