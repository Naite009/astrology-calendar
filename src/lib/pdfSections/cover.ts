import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

type Color = [number, number, number];
const CREAM:   Color = [250, 247, 242];
const INK:     Color = [18,  16,  14];
const GOLD:    Color = [184, 150, 62];
const MUTED:   Color = [130, 125, 118];
const RULE:    Color = [200, 195, 188];
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

  const natalSun  = natalChart.planets?.Sun?.sign  || '';
  const natalMoon = natalChart.planets?.Moon?.sign || '';
  const natalRising = natalChart.houseCusps?.house1?.sign || '';
  const srMoon    = a.moonSign || '';
  const srRising  = a.yearlyTheme?.ascendantSign || '';

  // ── Full cream background ──────────────────────────────────────────
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, pw, ph, 'F');

  // ── Thin gold border frame ────────────────────────────────────────
  const frameInset = 18;
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
  doc.rect(frameInset, frameInset, pw - frameInset * 2, ph - frameInset * 2);

  // ── Top-left: small "SOLAR RETURN" masthead ────────────────────────
  let y = frameInset + 30;
  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('SOLAR RETURN', frameInset + 22, y);
  doc.setCharSpace(0);

  // ── Top-right: year as small accent ────────────────────────────────
  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text(String(year), pw - frameInset - 22, y, { align: 'right' });
  doc.setCharSpace(0);

  // ── Hairline under masthead ────────────────────────────────────────
  y += 10;
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
  doc.line(frameInset + 22, y, pw - frameInset - 22, y);

  // ── MASSIVE "Happy Birthday" — the focal point ────────────────────
  if (birthdayMode) {
    y += 62;
    doc.setFont('times', 'italic'); doc.setFontSize(58);
    doc.setTextColor(...INK);
    doc.text('Happy', pw / 2, y, { align: 'center' });
    y += 62;
    doc.setFont('times', 'italic'); doc.setFontSize(58);
    doc.text('Birthday', pw / 2, y, { align: 'center' });
    y += 14;

    // Gold flourish line
    doc.setDrawColor(...GOLD); doc.setLineWidth(0.6);
    doc.line(pw / 2 - 80, y, pw / 2 + 80, y);
    y += 30;
  } else {
    y += 50;
    doc.setFont('times', 'bold'); doc.setFontSize(72);
    doc.setTextColor(...INK);
    doc.text(String(year), pw / 2, y + 50, { align: 'center' });
    y += 80;
  }

  // ── Name — centered, elegant, smaller, tracked ────────────────────
  doc.setFont('times', 'normal'); doc.setFontSize(14);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(6);
  doc.text(name.toUpperCase(), pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);
  y += 22;

  // ── Birth info — very quiet ───────────────────────────────────────
  const birthInfo = `${formatDate(natalChart.birthDate)}  →  ${capitalizeLocation(natalChart.birthLocation).toUpperCase()}`;
  doc.setFont('times', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.text(birthInfo, pw / 2, y, { align: 'center' });
  y += 36;

  // ── Cake image — framed like a magazine feature, larger ───────────
  const cakeImgSrc = cakeImages[natalSun];
  if (cakeImgSrc) {
    try {
      const dataUrl = await loadImageDataUrl(cakeImgSrc);
      if (dataUrl) {
        const imgW = 200;
        const imgH = 169;
        const imgX = (pw - imgW) / 2;

        // Subtle shadow frame behind image
        doc.setFillColor(235, 230, 222);
        doc.roundedRect(imgX - 3, y - 3, imgW + 6, imgH + 6, 2, 2, 'F');
        doc.setDrawColor(...RULE); doc.setLineWidth(0.4);
        doc.roundedRect(imgX - 3, y - 3, imgW + 6, imgH + 6, 2, 2, 'S');

        doc.addImage(dataUrl, 'PNG', imgX, y, imgW, imgH);
        y += imgH + 16;
      }
    } catch { /* skip image */ }
  }

  // ── Personal message — understated italic ─────────────────────────
  if (birthdayMode && personalMessage.trim()) {
    y += 4;
    const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW * 0.65);
    doc.setFont('times', 'italic'); doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    for (const line of msgLines.slice(0, 3)) {
      doc.text(line, pw / 2, y, { align: 'center' });
      y += 14;
    }
    y += 8;
  }

  // ── BORN WITH / THIS YEAR comparison — editorial table ────────────
  const tableW  = contentW * 0.78;
  const tableX  = (pw - tableW) / 2;
  const tableH  = 120;
  const tableY  = Math.min(y + 6, ph - frameInset - tableH - 30);
  const midX    = tableX + tableW / 2;

  // Soft background
  doc.setFillColor(...CARD_BG);
  doc.roundedRect(tableX, tableY, tableW, tableH, 3, 3, 'F');
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.roundedRect(tableX, tableY, tableW, tableH, 3, 3, 'S');

  // Vertical divider
  doc.setDrawColor(...RULE); doc.setLineWidth(0.2);
  doc.line(midX, tableY + 14, midX, tableY + tableH - 14);

  // Column headers
  doc.setFont('times', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(3);
  doc.text('BORN WITH', tableX + (tableW / 4), tableY + 24, { align: 'center' });
  doc.text('THIS YEAR', midX + (tableW / 4),   tableY + 24, { align: 'center' });
  doc.setCharSpace(0);

  // Thin rule under headers
  doc.setDrawColor(...RULE); doc.setLineWidth(0.15);
  doc.line(tableX + 8, tableY + 32, tableX + tableW - 8, tableY + 32);

  // Big Three rows
  const entries = [
    { natal: `${natalSun} Sun`,     sr: `${natalSun} Sun`  },
    { natal: `${natalMoon} Moon`,   sr: `${srMoon} Moon`   },
    { natal: `${natalRising} Rising`, sr: `${srRising} Rising` },
  ];

  doc.setFont('times', 'normal'); doc.setFontSize(15);
  entries.forEach((e, i) => {
    const ey = tableY + 52 + i * 24;
    doc.setTextColor(...INK);
    doc.text(e.natal, tableX + (tableW / 4), ey, { align: 'center' });
    doc.setTextColor(...GOLD);
    doc.text(e.sr,    midX + (tableW / 4),   ey, { align: 'center' });
  });

  ctx.y = margin;
}
