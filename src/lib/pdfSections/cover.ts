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

export async function generatePDFCover(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart,
  natalChart: NatalChart, birthdayMode: boolean, personalMessage: string,
  _cakeImages: Record<string, string>
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

  // 2. "✦  SOLAR RETURN  ✦" centered tracked caps — upper third
  let y = ph * 0.18;
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('\u2726   SOLAR RETURN   \u2726', pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);

  // 3. HUGE serif name
  y += 30;
  doc.setFont('times', 'normal'); doc.setFontSize(38);
  doc.setTextColor(...INK);
  // Split long names
  const nameLines: string[] = doc.splitTextToSize(name.toUpperCase(), contentW);
  for (const line of nameLines) {
    doc.text(line, pw / 2, y, { align: 'center' });
    y += 44;
  }

  // 4. Birth info tracked caps
  y += 4;
  const birthInfo = `BORN ${formatDate(natalChart.birthDate)}  ·  ${capitalizeLocation(natalChart.birthLocation).toUpperCase()}`;
  doc.setFont('times', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(2);
  doc.text(birthInfo, pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);

  // 5. "SOLAR RETURN" label + massive year
  y += 40;
  doc.setFont('times', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(4);
  doc.text('SOLAR RETURN', pw / 2, y, { align: 'center' });
  doc.setCharSpace(0);

  y += 30;
  doc.setFont('times', 'bold'); doc.setFontSize(72);
  doc.setTextColor(...INK);
  doc.text(String(year), pw / 2, y, { align: 'center' });

  // 6. Comparison table at bottom — "BORN WITH" | "THIS YEAR"
  const tableY = ph * 0.72;
  const tableW = contentW * 0.7;
  const tableX = (pw - tableW) / 2;
  const tableH = 100;
  const midX = tableX + tableW / 2;

  // Table background
  doc.setFillColor(...CARD_BG);
  doc.roundedRect(tableX, tableY, tableW, tableH, 3, 3, 'F');
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.roundedRect(tableX, tableY, tableW, tableH, 3, 3, 'S');

  // Vertical divider
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(midX, tableY + 8, midX, tableY + tableH - 8);

  // Headers
  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(2.5);
  doc.text('BORN WITH', tableX + (tableW / 4), tableY + 20, { align: 'center' });
  doc.text('THIS YEAR', midX + (tableW / 4), tableY + 20, { align: 'center' });
  doc.setCharSpace(0);

  // Big Three comparison
  const entries = [
    { natal: `${natalSun} Sun`, sr: `${natalSun} Sun` },
    { natal: `${natalMoon} Moon`, sr: `${srMoon} Moon` },
    { natal: `${natalRising} Rising`, sr: `${srRising} Rising` },
  ];

  doc.setFont('times', 'normal'); doc.setFontSize(11);
  entries.forEach((e, i) => {
    const ey = tableY + 40 + i * 18;
    doc.setTextColor(...INK);
    doc.text(e.natal, tableX + (tableW / 4), ey, { align: 'center' });
    doc.setTextColor(...GOLD);
    doc.text(e.sr, midX + (tableW / 4), ey, { align: 'center' });
  });

  // 7. Personal message (birthday mode)
  if (birthdayMode && personalMessage.trim()) {
    const msgY = tableY + tableH + 20;
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
