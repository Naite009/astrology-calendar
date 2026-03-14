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

  // 2. "✦  SOLAR RETURN  ✦" centered tracked caps
  let y = ph * 0.10;
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('\u2726   SOLAR RETURN   \u2726', pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);

  // 3. HUGE serif name
  y += 24;
  doc.setFont('times', 'normal'); doc.setFontSize(42);
  doc.setTextColor(...INK);
  const nameLines: string[] = doc.splitTextToSize(name.toUpperCase(), contentW + 20);
  for (const line of nameLines) {
    doc.text(line, pw / 2, y, { align: 'center' });
    y += 48;
  }

  // 4. Birth info tracked caps
  y += 2;
  const birthInfo = `BORN ${formatDate(natalChart.birthDate)}  \u00B7  ${capitalizeLocation(natalChart.birthLocation).toUpperCase()}`;
  doc.setFont('times', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(2);
  doc.text(birthInfo, pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);

  // 5. Massive year with "SOLAR RETURN" behind it in lighter text
  y += 18;
  // "SOLAR RETURN" in very light muted behind the year
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...RULE);
  doc.setCharSpace(6);
  doc.text('SOLAR RETURN', pw / 2, y + 18, { align: 'center' });
  doc.setCharSpace(0);

  // Large bold year on top
  doc.setFont('times', 'bold'); doc.setFontSize(90);
  doc.setTextColor(...INK);
  doc.text(String(year), pw / 2, y + 36, { align: 'center' });

  // 6. Cake image — centered in the middle area
  const cakeY = y + 56;
  const cakeImgSrc = cakeImages[natalSun];
  if (cakeImgSrc) {
    try {
      const dataUrl = await loadImageDataUrl(cakeImgSrc);
      if (dataUrl) {
        const imgW = 200;
        const imgH = 170;
        const imgX = (pw - imgW) / 2;
        doc.addImage(dataUrl, 'PNG', imgX, cakeY, imgW, imgH);
      }
    } catch {
      // silently skip if image fails
    }
  }

  // 7. Comparison table — BORN WITH | THIS YEAR — large and prominent
  const tableY = ph * 0.62;
  const tableW = contentW * 0.78;
  const tableX = (pw - tableW) / 2;
  const tableH = 130;
  const midX = tableX + tableW / 2;

  // Table background
  doc.setFillColor(...CARD_BG);
  doc.roundedRect(tableX, tableY, tableW, tableH, 3, 3, 'F');
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.roundedRect(tableX, tableY, tableW, tableH, 3, 3, 'S');

  // Vertical divider
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(midX, tableY + 12, midX, tableY + tableH - 12);

  // Headers — tracked caps
  doc.setFont('times', 'normal'); doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(3);
  doc.text('BORN WITH', tableX + (tableW / 4), tableY + 28, { align: 'center' });
  doc.text('THIS YEAR', midX + (tableW / 4), tableY + 28, { align: 'center' });
  doc.setCharSpace(0);

  // Big Three comparison — larger font
  const entries = [
    { natal: `${natalSun} Sun`, sr: `${natalSun} Sun` },
    { natal: `${natalMoon} Moon`, sr: `${srMoon} Moon` },
    { natal: `${natalRising} Rising`, sr: `${srRising} Rising` },
  ];

  doc.setFont('times', 'normal'); doc.setFontSize(14);
  entries.forEach((e, i) => {
    const ey = tableY + 52 + i * 24;
    doc.setTextColor(...INK);
    doc.text(e.natal, tableX + (tableW / 4), ey, { align: 'center' });
    doc.setTextColor(...GOLD);
    doc.text(e.sr, midX + (tableW / 4), ey, { align: 'center' });
  });

  // 8. Personal message (birthday mode) — right below table
  if (birthdayMode && personalMessage.trim()) {
    const msgY = tableY + tableH + 16;
    const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW * 0.6);
    doc.setFont('times', 'italic'); doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    let my = msgY;
    for (const line of msgLines.slice(0, 3)) {
      doc.text(line, pw / 2, my, { align: 'center' });
      my += 15;
    }
  }

  ctx.y = margin;
}
