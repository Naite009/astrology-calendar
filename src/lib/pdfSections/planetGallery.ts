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

  // Force new page, white background
  doc.addPage();
  ctx.y = margin;
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pw, doc.internal.pageSize.getHeight(), 'F');

  // Section header
  ctx.y += 20;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('PLANET SPOTLIGHT', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 8;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 24;

  doc.setFont('times', 'normal'); doc.setFontSize(26);
  doc.setTextColor(...INK);
  doc.text('Your Planets This Year', margin, ctx.y);
  ctx.y += 12;

  doc.setFont('times', 'italic'); doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('Each placement in your Solar Return', margin, ctx.y);
  ctx.y += 30;

  // Build planet data
  const planets = GRID_ORDER.filter(p => {
    const srPos = srChart.planets[p as keyof typeof srChart.planets];
    return !!srPos;
  });

  // 3 columns x 4 rows grid — bigger cells for readable text
  const cols = 3;
  const gapX = 10;
  const gapY = 10;
  const cellW = (contentW - gapX * (cols - 1)) / cols;
  const imgSize = 36;
  const cellH = imgSize + 100;

  const ph = doc.internal.pageSize.getHeight();
  let gridStartY = ctx.y;

  for (let i = 0; i < Math.min(planets.length, 12); i++) {
    const planet = planets[i];
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cellX = margin + col * (cellW + gapX);
    const cellY = gridStartY + row * (cellH + gapY);

    // Check if we need a new page for this row
    if (cellY + cellH > ph - 60 && col === 0) {
      doc.addPage();
      doc.setFillColor(...WHITE);
      doc.rect(0, 0, pw, ph, 'F');
      gridStartY = margin + 20 - row * (cellH + gapY);
    }

    const recalcY = gridStartY + row * (cellH + gapY);
    drawPlanetCell(doc, ctx, planet, analysis, srChart, planetImages,
      cellX, recalcY, cellW, cellH, imgSize);
  }

  const totalRows = Math.ceil(Math.min(planets.length, 12) / cols);
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
      doc.addImage(imgSrc, 'PNG', imgX, y + 6, imgSize, imgSize);
    } catch {
      doc.setFillColor(...GOLD);
      doc.circle(x + w / 2, y + 6 + imgSize / 2, imgSize / 3, 'F');
    }
  }

  let cy = y + imgSize + 12;

  // Planet name - centered, tracked caps
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(2);
  doc.text((P[planet] || planet).toUpperCase(), x + w / 2, cy, { align: 'center' });
  doc.setCharSpace(0);
  cy += 12;

  // Sign + House - centered
  doc.setFont('times', 'bold'); doc.setFontSize(10);
  doc.setTextColor(...INK);
  const posText = `${sign} ${houseLabel}`;
  doc.text(posText, x + w / 2, cy, { align: 'center' });
  cy += 10;

  // Evocative name
  const { name, description } = getPlanetSignHouseFelt(planet, sign, srH);
  doc.setFont('times', 'italic'); doc.setFontSize(7.5);
  doc.setTextColor(...GOLD);
  doc.text(`"${name}"`, x + w / 2, cy, { align: 'center' });
  cy += 10;

  // Felt-sense description — READABLE size
  doc.setFont('times', 'normal'); doc.setFontSize(7.5);
  doc.setTextColor(...MUTED);
  const descLines = doc.splitTextToSize(description, w - 12);
  for (const line of descLines.slice(0, 4)) {
    doc.text(line, x + w / 2, cy, { align: 'center' });
    cy += 9;
  }
}
