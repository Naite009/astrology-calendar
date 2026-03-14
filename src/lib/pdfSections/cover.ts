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

  // ── flowing y cursor — everything stacks from top ─────────────────
  let y = 56;

  // ── Centered top label ─────────────────────────────────────────────
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text('✶  SOLAR RETURN  ✶', pw / 2, y, { align: 'center' });
  y += 50;

  // ── LARGE NAME ────────────────────────────────────────────────────
  doc.setFont('times', 'normal'); doc.setFontSize(40);
  doc.setTextColor(...INK);
  const nameLines: string[] = doc.splitTextToSize(name.toUpperCase(), contentW + 40);
  for (const line of nameLines) {
    doc.text(line, pw / 2, y, { align: 'center' });
    y += 46;
  }

  // ── Birth info ────────────────────────────────────────────────────
  y += 2;
  const birthInfo = `BORN ${formatDate(natalChart.birthDate)}  ·  ${capitalizeLocation(natalChart.birthLocation).toUpperCase()}`;
  doc.setFont('times', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text(birthInfo, pw / 2, y, { align: 'center' });
  y += 34;

  // ── Centered "SOLAR RETURN" label ───────────────────────────────
  doc.setFont('times', 'normal'); doc.setFontSize(9.5);
  doc.setTextColor(...MUTED);
  doc.text('SOLAR RETURN', pw / 2, y, { align: 'center' });
  y += 14;

  // ── Massive centered year ─────────────────────────────────────────
  doc.setFont('times', 'bold'); doc.setFontSize(84);
  doc.setTextColor(...INK);
  doc.text(String(year), pw / 2, y + 56, { align: 'center' });
  y += 78;

  // ── Cake image ────────────────────────────────────────────────────
  const cakeImgSrc = cakeImages[natalSun];
  if (cakeImgSrc) {
    try {
      const dataUrl = await loadImageDataUrl(cakeImgSrc);
      if (dataUrl) {
        const imgW = 200;
        const imgH = 169; // maintain aspect ratio ~1.18:1
        const imgX = (pw - imgW) / 2;
        y += 8;
        doc.addImage(dataUrl, 'PNG', imgX, y, imgW, imgH);
        y += imgH + 10;
      }
    } catch { /* skip image */ }
  }

  // ── Personal message — directly under cake ────────────────────────
  if (birthdayMode && personalMessage.trim()) {
    y += 6;
    const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), contentW * 0.72);
    doc.setFont('times', 'italic'); doc.setFontSize(10.5);
    doc.setTextColor(...MUTED);
    for (const line of msgLines.slice(0, 4)) {
      doc.text(line, pw / 2, y, { align: 'center' });
      y += 15;
    }
    y += 4;
  }

  // ── Thin gold rule above comparison table ────────────────────────
  y += 10;
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.4);
  doc.line(margin + 40, y, pw - margin - 40, y);
  y += 14;

  // ── BORN WITH / THIS YEAR comparison table ────────────────────────
  const tableW  = contentW * 0.82;
  const tableX  = (pw - tableW) / 2;
  const tableH  = 136;
  const tableY  = Math.min(y, ph - margin - tableH - 16);
  const midX    = tableX + tableW / 2;

  // Table background
  doc.setFillColor(...CARD_BG);
  doc.roundedRect(tableX, tableY, tableW, tableH, 4, 4, 'F');
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.roundedRect(tableX, tableY, tableW, tableH, 4, 4, 'S');

  // Vertical divider
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(midX, tableY + 16, midX, tableY + tableH - 16);

  // Column headers
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(3);
  doc.text('BORN WITH', tableX + (tableW / 4), tableY + 30, { align: 'center' });
  doc.text('THIS YEAR', midX + (tableW / 4),   tableY + 30, { align: 'center' });
  doc.setCharSpace(0);

  // Thin rule under headers
  doc.setDrawColor(...RULE); doc.setLineWidth(0.2);
  doc.line(tableX + 10, tableY + 38, tableX + tableW - 10, tableY + 38);

  // Big Three rows — larger font
  const entries = [
    { natal: `${natalSun} Sun`,     sr: `${natalSun} Sun`  },
    { natal: `${natalMoon} Moon`,   sr: `${srMoon} Moon`   },
    { natal: `${natalRising} Rising`, sr: `${srRising} Rising` },
  ];

  doc.setFont('times', 'normal'); doc.setFontSize(16);
  entries.forEach((e, i) => {
    const ey = tableY + 60 + i * 26;
    doc.setTextColor(...INK);
    doc.text(e.natal, tableX + (tableW / 4), ey, { align: 'center' });
    doc.setTextColor(...GOLD);
    doc.text(e.sr,    midX + (tableW / 4),   ey, { align: 'center' });
  });

  ctx.y = margin;
}
