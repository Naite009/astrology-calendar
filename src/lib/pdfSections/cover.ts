import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';

type Color = [number, number, number];
const CREAM: Color = [250, 247, 242];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];

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
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch { return dateStr || ''; }
};

const capitalizeLocation = (loc: string | undefined): string => {
  if (!loc) return '';
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
  const { pw, ph, margin, contentW } = ctx;
  const name = natalChart.name || 'Chart';
  const year = srChart.solarReturnYear;
  const natalSun = natalChart.planets?.Sun?.sign || '';

  // 1. Full CREAM background
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, pw, ph, 'F');

  // 2. Dark INK banner — top 22% of page height
  const bannerH = Math.round(ph * 0.22);
  doc.setFillColor(...INK);
  doc.rect(0, 0, pw, bannerH, 'F');

  // "SOLAR RETURN REPORT" tracked caps label in upper half of banner
  const labelY = bannerH * 0.38;
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(230, 225, 218);
  doc.setCharSpace(4);
  doc.text('SOLAR RETURN REPORT', pw / 2, labelY, { align: 'center' });
  doc.setCharSpace(0);

  // Thin rule at 64% of banner height
  const ruleY = bannerH * 0.64;
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  const ruleStart = pw * 0.30;
  const ruleEnd = pw * 0.70;
  // Simulate 25% opacity white by using a light grey
  doc.setDrawColor(200, 198, 195);
  doc.line(ruleStart, ruleY, ruleEnd, ruleY);

  // Year in large numerals below rule
  const yearY = bannerH * 0.82;
  doc.setFont('times', 'bold'); doc.setFontSize(28);
  doc.setTextColor(255, 252, 248);
  doc.text(String(year), pw / 2, yearY, { align: 'center' });

  // 3. Cake image — centered, starts 12pt below banner
  let y = bannerH + 12;
  const cakeImgSrc = cakeImages[natalSun];
  let cakeDataUrl: string | null = null;
  if (cakeImgSrc) cakeDataUrl = await loadImageDataUrl(cakeImgSrc);

  const cakeW = Math.round(pw * 0.58);
  const cakeH = Math.round(ph * 0.38);
  const cakeX = (pw - cakeW) / 2;

  if (cakeDataUrl) {
    doc.addImage(cakeDataUrl, 'PNG', cakeX, y, cakeW, cakeH);
    y += cakeH;
  } else {
    // Placeholder circle
    doc.setDrawColor(...RULE); doc.setLineWidth(0.5);
    doc.circle(pw / 2, y + 80, 60, 'S');
    y += 160;
  }

  // 4. Hairline rule — 35pt below image
  y += 35;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.35);
  doc.line(pw * 0.20, y, pw * 0.80, y);

  // 5. Name — tracked caps, centered
  y += 16;
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.setCharSpace(3.5);
  doc.text(name.toUpperCase(), pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);

  // 6. "Happy Birthday" if birthday mode
  if (birthdayMode) {
    y += 11;
    doc.setFont('times', 'italic'); doc.setFontSize(13);
    doc.setTextColor(...MUTED);
    doc.text('Happy Birthday', pw / 2, y, { align: 'center' });
  }

  // 7. Personal message
  if (birthdayMode && personalMessage.trim()) {
    y += 11;
    const maxW = contentW * 0.62;
    const msgLines: string[] = doc.splitTextToSize(personalMessage.trim(), maxW);
    doc.setFont('times', 'italic'); doc.setFontSize(9.5);
    doc.setTextColor(...MUTED);
    const lineH = 9.5 * 1.65;
    msgLines.slice(0, 3).forEach((line: string) => {
      doc.text(line, pw / 2, y, { align: 'center' });
      y += lineH;
    });
  }

  // 8. Footer
  const footerY = ph - 18;
  // Hairline rule 5pt above footer
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, footerY - 5, pw - margin, footerY - 5);

  // Left: solar return date
  const srDate = formatDate(natalChart.birthDate);
  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(1.5);
  if (srDate) doc.text(srDate, margin, footerY);

  // Right: location
  const loc = capitalizeLocation(natalChart.birthLocation);
  if (loc) doc.text(loc, pw - margin, footerY, { align: 'right' });
  doc.setCharSpace(0);

  ctx.y = margin;
}
