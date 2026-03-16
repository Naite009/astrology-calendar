import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { P } from '@/components/SolarReturnPDFExport';
import { getPlanetSignHouseFelt } from './planetSignHouseFelt';

type Color = [number, number, number];
const INK:   Color = [58,  54,  50];
const MUTED: Color = [130, 125, 118];
const GOLD:  Color = [184, 150, 62];
const RULE:  Color = [200, 195, 188];
const WHITE: Color = [255, 255, 255];

const GRID_ORDER = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];

export function generatePlanetGallery(
  ctx: PDFContext, doc: jsPDF, analysis: SolarReturnAnalysis,
  planetImages: Record<string, string>,
  srChart: any,
) {
  const { pw, margin, contentW } = ctx;
  const ph = doc.internal.pageSize.getHeight();

  doc.addPage();
  ctx.y = margin;
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pw, ph, 'F');

  // Section header — compact
  ctx.y += 8;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('PLANET SPOTLIGHT', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 5;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 12;

  doc.setFont('times', 'normal'); doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text('Your Planets This Year', margin, ctx.y);
  ctx.y += 7;

  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Each placement in your Solar Return', margin, ctx.y);
  ctx.y += 10;

  const planets = GRID_ORDER.filter(p => {
    const srPos = srChart.planets[p as keyof typeof srChart.planets];
    return !!srPos;
  });

  // 3 columns, calculate row height to fit all on available space
  const cols = 3;
  const gapX = 8;
  const gapY = 8;
  const cellW = (contentW - gapX * (cols - 1)) / cols;
  const imgSize = 28;
  
  const totalRows = Math.ceil(Math.min(planets.length, 12) / cols);
  const availableH = ph - ctx.y - margin - 10;
  const cellH = Math.floor((availableH - gapY * (totalRows - 1)) / totalRows);

  const gridStartY = ctx.y;

  for (let i = 0; i < Math.min(planets.length, 12); i++) {
    const planet = planets[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellX = margin + col * (cellW + gapX);
    const cellY = gridStartY + row * (cellH + gapY);

    // Page break if needed
    if (cellY + cellH > ph - 40 && col === 0) {
      doc.addPage();
      doc.setFillColor(...WHITE);
      doc.rect(0, 0, pw, ph, 'F');
    }

    drawPlanetCell(doc, ctx, planet, analysis, srChart, planetImages,
      cellX, cellY, cellW, cellH, imgSize);
  }

  ctx.y = gridStartY + totalRows * (cellH + gapY) + 10;
}

function drawPlanetCell(
  doc: jsPDF, ctx: PDFContext,
  planet: string, analysis: SolarReturnAnalysis, srChart: any,
  planetImages: Record<string, string>,
  x: number, y: number, w: number, h: number, imgSize: number,
) {
  const srPos = srChart.planets[planet as keyof typeof srChart.planets];
  if (!srPos) return;

  const srH = analysis.planetSRHouses?.[planet];
  const sign = srPos.sign || '--';
  const houseLabel = srH ? `H${srH}` : '';

  // White box with subtle border
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.roundedRect(x, y, w, h, 3, 3, 'S');

  // Gold top accent
  doc.setFillColor(...GOLD);
  doc.rect(x, y, w, 2, 'F');

  // Planet image centered
  const imgKey = planet.toLowerCase().replace('northnode', 'northnode');
  const imgSrc = planetImages[imgKey];
  if (imgSrc) {
    try {
      const imgX = x + (w - imgSize) / 2;
      doc.addImage(imgSrc, 'PNG', imgX, y + 5, imgSize, imgSize);
    } catch {
      doc.setFillColor(...GOLD);
      doc.circle(x + w / 2, y + 5 + imgSize / 2, imgSize / 3, 'F');
    }
  }

  let cy = y + imgSize + 10;

  // Planet name - centered, tracked caps — BIGGER
  doc.setFont('times', 'bold'); doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(2);
  doc.text((P[planet] || planet).toUpperCase(), x + w / 2, cy, { align: 'center' });
  doc.setCharSpace(0);
  cy += 12;

  // Sign + House - centered — BIGGER (12pt)
  doc.setFont('times', 'bold'); doc.setFontSize(12);
  doc.setTextColor(...INK);
  const posText = `${sign} ${houseLabel}`;
  doc.text(posText, x + w / 2, cy, { align: 'center' });
  cy += 10;

  // Evocative name — BIGGER (9pt)
  const { name, description } = getPlanetSignHouseFelt(planet, sign, srH);
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text(`"${name}"`, x + w / 2, cy, { align: 'center' });
  cy += 10;

  // Felt-sense description — READABLE (9pt)
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  const descLines = doc.splitTextToSize(description, w - 10);
  const maxLines = Math.min(descLines.length, Math.floor((h - (cy - y) - 4) / 10));
  for (let li = 0; li < maxLines; li++) {
    doc.text(descLines[li], x + w / 2, cy, { align: 'center' });
    cy += 10;
  }
}
