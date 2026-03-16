/**
 * Natal vs Solar Return — compact 4x3 grid, all 12 planets on ONE page.
 * Readable narrative font (8.5pt), sign names at 9pt.
 */
import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { P } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];
const INK:   Color = [58,  54,  50];
const MUTED: Color = [130, 125, 118];
const GOLD:  Color = [184, 150, 62];
const RULE:  Color = [200, 195, 188];
const WHITE: Color = [255, 255, 255];
const ARROW_GOLD: Color = [200, 168, 80];

const PLANET_ORDER = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];

const SHIFT_FEEL: Record<string, Record<string, string>> = {
  Sun: {
    same: 'Identity stays consistent — deepening what you already know.',
    different: 'Your sense of self shifts. Who you are becoming looks different.',
  },
  Moon: {
    same: 'Emotional responses feel familiar — instincts amplified.',
    different: 'Emotional processing recalibrates. What soothes you shifts.',
  },
  Mercury: {
    same: 'Thinking style stays sharp in familiar territory.',
    different: 'Your mind works differently. New thought patterns emerge.',
  },
  Venus: {
    same: 'What you love and value remains constant.',
    different: 'What attracts you is changing — beauty, love, money, all shift.',
  },
  Mars: {
    same: 'Your drive and fight stay on the same channel.',
    different: 'Anger, ambition, and desire find new outlets.',
  },
  Jupiter: {
    same: 'Growth continues along familiar lines.',
    different: 'Opportunity arrives from an unexpected direction.',
  },
  Saturn: {
    same: 'Same lesson, deeper level. The test continues.',
    different: 'A different part of life demands discipline.',
  },
  Uranus: {
    same: 'The disruption continues — you\'re learning to ride it.',
    different: 'A new area of life gets shaken loose.',
  },
  Neptune: {
    same: 'The dream deepens — same dissolving and imagining.',
    different: 'Different illusions, different inspirations.',
  },
  Pluto: {
    same: 'Transformation works the same territory — go deeper.',
    different: 'A different life area undergoes profound renovation.',
  },
  Chiron: {
    same: 'The wound you\'re healing stays in focus.',
    different: 'A different old wound surfaces, asking for attention.',
  },
  NorthNode: {
    same: 'Soul growth continues the same trajectory.',
    different: 'Your soul\'s growth direction shifts.',
  },
};

export function generateNatalVsSRCards(
  ctx: PDFContext, doc: jsPDF,
  analysis: SolarReturnAnalysis,
  natalChart: NatalChart,
  srChart: SolarReturnChart,
  planetImages: Record<string, string>,
) {
  const { pw, margin, contentW } = ctx;
  const ph = doc.internal.pageSize.getHeight();

  doc.addPage();
  ctx.y = margin;
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pw, ph, 'F');

  // Compact header
  ctx.y += 10;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('YOUR PLANETARY SHIFTS', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 5;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 12;

  doc.setFont('times', 'normal'); doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text('Natal vs Solar Return', margin, ctx.y);
  ctx.y += 7;

  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Where each planet was — and where it is now', margin, ctx.y);
  ctx.y += 10;

  // 3-column x 4-row grid — calculated to fit ALL 12 on one page
  const cols = 3;
  const gapX = 7;
  const gapY = 5;
  const cardW = (contentW - gapX * (cols - 1)) / cols;
  const imgSize = 16;
  
  // Calculate available height for 4 rows
  const availableH = ph - ctx.y - margin - 10;
  const cardH = Math.floor((availableH - gapY * 3) / 4);

  const gridStartY = ctx.y;

  const planets = PLANET_ORDER.filter(p => {
    const srPos = srChart.planets[p as keyof typeof srChart.planets];
    const natPos = natalChart.planets[p as keyof typeof natalChart.planets];
    return !!srPos || !!natPos;
  });

  for (let i = 0; i < Math.min(planets.length, 12); i++) {
    const planet = planets[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cardX = margin + col * (cardW + gapX);
    const cardY = gridStartY + row * (cardH + gapY);

    drawShiftCard(doc, ctx, planet, analysis, natalChart, srChart, planetImages,
      cardX, cardY, cardW, cardH, imgSize);
  }

  const totalRows = Math.ceil(Math.min(planets.length, 12) / cols);
  ctx.y = gridStartY + totalRows * (cardH + gapY) + 10;
}

function drawShiftCard(
  doc: jsPDF, ctx: PDFContext,
  planet: string,
  analysis: SolarReturnAnalysis,
  natalChart: NatalChart,
  srChart: SolarReturnChart,
  planetImages: Record<string, string>,
  x: number, y: number, w: number, h: number, imgSize: number,
) {
  const srPos = srChart.planets[planet as keyof typeof srChart.planets];
  const natPos = natalChart.planets[planet as keyof typeof natalChart.planets];
  if (!srPos && !natPos) return;

  const natSign = natPos?.sign || '--';
  const srSign = srPos?.sign || '--';
  const natDeg = natPos ? `${natPos.degree}°` : '';
  const srDeg = srPos ? `${srPos.degree}°` : '';
  const srH = analysis.planetSRHouses?.[planet];
  const overlay = analysis.houseOverlays?.find(o => o.planet === planet);
  const natH = overlay?.natalHouse;
  const isSameSign = natSign === srSign && natSign !== '--';

  // Card background
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, w, h, 2, 2, 'F');
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.roundedRect(x, y, w, h, 2, 2, 'S');

  // Gold top accent
  doc.setFillColor(...GOLD);
  doc.rect(x, y, w, 1.5, 'F');

  // Planet image — top left, compact
  const imgKey = planet.toLowerCase().replace('northnode', 'northnode');
  const imgSrc = planetImages[imgKey];
  if (imgSrc) {
    try {
      doc.addImage(imgSrc, 'PNG', x + 4, y + 5, imgSize, imgSize);
    } catch {
      doc.setFillColor(...GOLD);
      doc.circle(x + 4 + imgSize / 2, y + 5 + imgSize / 2, imgSize / 3, 'F');
    }
  }

  // Planet name — right of image
  let tx = x + imgSize + 8;
  let ty = y + 12;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(1);
  doc.text((P[planet] || planet).toUpperCase(), tx, ty);
  doc.setCharSpace(0);

  // SAME/SHIFT badge
  if (isSameSign) {
    doc.setFillColor(225, 245, 225);
    doc.roundedRect(x + w - 28, y + 4, 22, 9, 2, 2, 'F');
    doc.setFont('times', 'bold'); doc.setFontSize(5.5);
    doc.setTextColor(80, 140, 80);
    doc.text('SAME', x + w - 17, y + 10, { align: 'center' });
  } else if (natSign !== '--' && srSign !== '--') {
    doc.setFillColor(255, 235, 220);
    doc.roundedRect(x + w - 28, y + 4, 22, 9, 2, 2, 'F');
    doc.setFont('times', 'bold'); doc.setFontSize(5.5);
    doc.setTextColor(180, 120, 60);
    doc.text('SHIFT', x + w - 17, y + 10, { align: 'center' });
  }

  // Natal → SR signs with arrow
  ty = y + imgSize + 10;
  doc.setFont('times', 'bold'); doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(natSign, x + 4, ty);

  const arrowX1 = x + 4 + doc.getTextWidth(natSign) + 3;
  const arrowX2 = arrowX1 + 12;
  const arrowMidY = ty - 2.5;
  doc.setDrawColor(...ARROW_GOLD); doc.setLineWidth(0.4);
  doc.line(arrowX1, arrowMidY, arrowX2, arrowMidY);
  doc.line(arrowX2 - 2.5, arrowMidY - 1.5, arrowX2, arrowMidY);
  doc.line(arrowX2 - 2.5, arrowMidY + 1.5, arrowX2, arrowMidY);

  doc.setFont('times', 'bold'); doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(srSign, arrowX2 + 2, ty);
  ty += 9;

  // Degrees + houses
  doc.setFont('times', 'normal'); doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  const detailLine = `${natDeg}${natH ? ` H${natH}` : ''}  →  ${srDeg}${srH ? ` H${srH}` : ''}`;
  doc.text(detailLine, x + 4, ty);
  ty += 8;

  // Shift narrative — READABLE size (8.5pt)
  const shiftFeel = SHIFT_FEEL[planet];
  if (shiftFeel) {
    const narrative = isSameSign ? shiftFeel.same : shiftFeel.different;
    doc.setFont('times', 'italic'); doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(narrative, w - 8);
    const maxLines = Math.min(lines.length, Math.floor((h - (ty - y) - 4) / 10));
    for (let li = 0; li < maxLines; li++) {
      doc.text(lines[li], x + 4, ty);
      ty += 10;
    }
  }
}
