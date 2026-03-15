/**
 * Visual card-per-planet layout replacing the dense Natal vs SR table.
 * Each planet gets a split card: left = natal position, right = SR position,
 * with planet image centered and a shift narrative below.
 */
import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { P, S } from '@/components/SolarReturnPDFExport';
import { getPlanetSignHouseFelt } from './planetSignHouseFelt';

type Color = [number, number, number];
const INK:   Color = [58,  54,  50];
const MUTED: Color = [130, 125, 118];
const GOLD:  Color = [184, 150, 62];
const RULE:  Color = [200, 195, 188];
const WHITE: Color = [255, 255, 255];
const CREAM: Color = [250, 247, 240];
const ARROW_GOLD: Color = [200, 168, 80];

const PLANET_ORDER = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];

// One-line shift narratives: what changes when a planet moves signs
const SHIFT_FEEL: Record<string, Record<string, string>> = {
  Sun: {
    same: 'Identity stays consistent — deepening what you already know about yourself.',
    different: 'Your sense of self shifts this year. Who you are becoming looks different from who you\'ve been.',
  },
  Moon: {
    same: 'Emotional responses feel familiar — your instincts are amplified, not changed.',
    different: 'Your emotional processing recalibrates. What soothes you, what triggers you — it all shifts.',
  },
  Mercury: {
    same: 'Your thinking style stays sharp in familiar territory.',
    different: 'Your mind works differently this year. New thought patterns, new way of speaking.',
  },
  Venus: {
    same: 'What you love and value remains constant — relationships feel steady.',
    different: 'What attracts you is changing. Beauty, money, love — all filtered through a new lens.',
  },
  Mars: {
    same: 'Your drive and fight stay on the same channel — push harder.',
    different: 'Your anger, ambition, and desire find new outlets this year.',
  },
  Jupiter: {
    same: 'Growth continues along familiar lines — expansion meets experience.',
    different: 'Your growth edge shifts. Opportunity arrives from an unexpected direction.',
  },
  Saturn: {
    same: 'The test continues — same lesson, deeper level.',
    different: 'New territory is being structured. A different part of life demands discipline.',
  },
  Uranus: {
    same: 'The disruption is ongoing — but you\'re learning to ride the wave.',
    different: 'A new area of life gets shaken loose. Expect surprises in unfamiliar places.',
  },
  Neptune: {
    same: 'The dream deepens — more of the same dissolving and imagining.',
    different: 'Your imagination and confusion shift arenas. Different illusions, different inspirations.',
  },
  Pluto: {
    same: 'Transformation continues to work the same territory — go deeper.',
    different: 'The crucible moves. A different life area undergoes profound renovation.',
  },
  Chiron: {
    same: 'The wound you\'re healing stays in focus — keep going.',
    different: 'A different old wound surfaces this year, asking for attention.',
  },
  NorthNode: {
    same: 'Soul growth continues along the same trajectory — persist.',
    different: 'Your soul\'s growth direction shifts — lean into the unfamiliar.',
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

  // Force new page
  doc.addPage();
  ctx.y = margin;
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pw, ph, 'F');

  // Compact section header
  ctx.y += 12;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('YOUR PLANETARY SHIFTS', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 6;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 16;

  doc.setFont('times', 'normal'); doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text('Natal vs Solar Return', margin, ctx.y);
  ctx.y += 8;

  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Where each planet was — and where it is now', margin, ctx.y);
  ctx.y += 14;

  // 3-column grid for compactness while allowing readable text
  const cols = 3;
  const gapX = 8;
  const gapY = 6;
  const cardW = (contentW - gapX * (cols - 1)) / cols;
  const imgSize = 20;
  const cardH = 100;

  let gridStartY = ctx.y;

  const planets = PLANET_ORDER.filter(p => {
    const srPos = srChart.planets[p as keyof typeof srChart.planets];
    const natPos = natalChart.planets[p as keyof typeof natalChart.planets];
    return !!srPos || !!natPos;
  });

  for (let i = 0; i < planets.length; i++) {
    const planet = planets[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cardX = margin + col * (cardW + gapX);
    const cardY = gridStartY + row * (cardH + gapY);

    // Page break check
    if (cardY + cardH > ph - 60 && col === 0) {
      doc.addPage();
      doc.setFillColor(...WHITE);
      doc.rect(0, 0, pw, ph, 'F');
      gridStartY = margin + 20 - row * (cardH + gapY);
    }

    const recalcY = gridStartY + row * (cardH + gapY);
    drawShiftCard(doc, ctx, planet, analysis, natalChart, srChart, planetImages,
      cardX, recalcY, cardW, cardH, imgSize);
  }

  const totalRows = Math.ceil(planets.length / cols);
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
  doc.setFillColor(...WHITE);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, 'S');

  // Gold top accent
  doc.setFillColor(...GOLD);
  doc.rect(x, y, w, 2, 'F');

  // Planet image — top left
  const imgKey = planet.toLowerCase().replace('northnode', 'northnode');
  const imgSrc = planetImages[imgKey];
  if (imgSrc) {
    try {
      doc.addImage(imgSrc, 'PNG', x + 6, y + 6, imgSize, imgSize);
    } catch {
      doc.setFillColor(...GOLD);
      doc.circle(x + 6 + imgSize / 2, y + 6 + imgSize / 2, imgSize / 3, 'F');
    }
  }

  // Planet name — right of image
  let tx = x + imgSize + 10;
  let ty = y + 14;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(1.5);
  doc.text((P[planet] || planet).toUpperCase(), tx, ty);
  doc.setCharSpace(0);

  // Shift indicator badge
  if (isSameSign) {
    doc.setFillColor(225, 245, 225);
    doc.roundedRect(x + w - 32, y + 5, 26, 10, 2, 2, 'F');
    doc.setFont('times', 'bold'); doc.setFontSize(5.5);
    doc.setTextColor(80, 140, 80);
    doc.text('SAME', x + w - 19, y + 12, { align: 'center' });
  } else if (natSign !== '--' && srSign !== '--') {
    doc.setFillColor(255, 235, 220);
    doc.roundedRect(x + w - 32, y + 5, 26, 10, 2, 2, 'F');
    doc.setFont('times', 'bold'); doc.setFontSize(5.5);
    doc.setTextColor(180, 120, 60);
    doc.text('SHIFT', x + w - 19, y + 12, { align: 'center' });
  }

  // Natal → SR inline
  ty = y + imgSize + 10;
  doc.setFont('times', 'bold'); doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text(natSign, x + 6, ty);

  // Arrow
  const arrowX1 = x + 6 + doc.getTextWidth(natSign) + 4;
  const arrowX2 = arrowX1 + 14;
  const arrowMidY = ty - 2.5;
  doc.setDrawColor(...ARROW_GOLD); doc.setLineWidth(0.5);
  doc.line(arrowX1, arrowMidY, arrowX2, arrowMidY);
  doc.line(arrowX2 - 3, arrowMidY - 2, arrowX2, arrowMidY);
  doc.line(arrowX2 - 3, arrowMidY + 2, arrowX2, arrowMidY);

  doc.setFont('times', 'bold'); doc.setFontSize(8.5);
  doc.setTextColor(...INK);
  doc.text(srSign, arrowX2 + 3, ty);
  ty += 10;

  // Degrees + houses
  doc.setFont('times', 'normal'); doc.setFontSize(7);
  doc.setTextColor(...MUTED);
  const detailLine = `${natDeg}${natH ? ` H${natH}` : ''}  →  ${srDeg}${srH ? ` H${srH}` : ''}`;
  doc.text(detailLine, x + 6, ty);
  ty += 10;

  // Shift narrative — readable size
  const shiftFeel = SHIFT_FEEL[planet];
  if (shiftFeel) {
    const narrative = isSameSign ? shiftFeel.same : shiftFeel.different;
    doc.setFont('times', 'italic'); doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    const lines = doc.splitTextToSize(narrative, w - 12);
    for (const line of lines.slice(0, 3)) {
      doc.text(line, x + 6, ty);
      ty += 9;
    }
  }
}
