import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { computeLunarPhaseTimeline, detectTimelinePatterns, generateTimelineSummary, TimelineEntry } from '@/lib/solarReturnLunarTimeline';
import { getMoonPhaseBlending } from '@/lib/solarReturnMoonData';

type Color = [number, number, number];
const INK:   Color = [58,  54,  50];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];
const GOLD:  Color = [184, 150, 62];
const CARD_BG: Color = [245, 241, 234];
const SOFT_GOLD: Color = [248, 242, 228];

// Phase dot colors for the PDF (RGB)
const PHASE_DOT_RGB: Record<string, Color> = {
  beginning:    [34, 139, 34],    // forest green
  growth:       [60, 179, 113],   // medium sea green
  action:       [220, 120, 50],   // warm orange
  refinement:   [100, 149, 237],  // cornflower blue
  culmination:  [218, 165, 32],   // goldenrod
  sharing:      [147, 112, 219],  // medium purple
  reevaluation: [169, 169, 169],  // dark grey
  completion:   [130, 125, 118],  // muted
};

const PHASE_EMOJI: Record<string, string> = {
  'New Moon': 'O',
  'Crescent': ')',
  'First Quarter': 'D',
  'Gibbous': 'O',
  'Full Moon': '@',
  'Disseminating': 'O',
  'Last Quarter': 'D',
  'Balsamic': '(',
};

export function generatePDFLunarTimeline(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart
) {
  const sun = natalChart.planets.Sun;
  if (!sun) return;

  const { pw, margin, contentW } = ctx;

  // Compute timeline
  const timeline = computeLunarPhaseTimeline(
    sun.sign, sun.degree, sun.minutes,
    natalChart.birthDate, srChart.solarReturnYear,
    14, 14
  );
  if (timeline.length === 0) return;

  const patterns = detectTimelinePatterns(timeline);
  const summary = generateTimelineSummary(timeline, srChart.solarReturnYear);
  const currentEntry = timeline.find(e => e.isCurrent);

  // ── New page ──
  ctx.pageBg(doc);

  ctx.y += 16;

  // Tracked label
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('LUNAR PHASE', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 8;

  // Hairline
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 22;

  // Large title
  doc.setFont('times', 'normal'); doc.setFontSize(26);
  doc.setTextColor(...INK);
  doc.text('Solar Return Moon Phase by Year', margin, ctx.y);
  ctx.y += 12;

  // Subtitle
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Your developmental cycle mapped year by year', margin, ctx.y);
  ctx.y += 16;

  // Summary — compact
  doc.setFont('times', 'normal'); doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  const summaryLines: string[] = doc.splitTextToSize(summary, contentW);
  for (const line of summaryLines.slice(0, 3)) {
    doc.text(line, margin, ctx.y); ctx.y += 13;
  }
  ctx.y += 8;

  // ── Current Year Highlight Card ──
  if (currentEntry) {
    const cardH = 55;
    ctx.checkPage(cardH + 14);

    doc.setFillColor(...SOFT_GOLD);
    doc.roundedRect(margin, ctx.y, contentW, cardH, 3, 3, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(margin, ctx.y, contentW, 2, 'F');

    let cy = ctx.y + 16;
    doc.setFont('times', 'bold'); doc.setFontSize(6.5);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(3);
    doc.text('CURRENT YEAR', margin + 14, cy);
    doc.setCharSpace(0);
    cy += 16;

    doc.setFont('times', 'bold'); doc.setFontSize(16);
    doc.setTextColor(...INK);
    doc.text(`${currentEntry.year} -- ${currentEntry.phase}`, margin + 14, cy);

    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`${currentEntry.cycleStage} -- Age ${currentEntry.age}`, margin + contentW / 2, cy, { align: 'center' });

    ctx.y += cardH + 10;
  }

  // ── Visual timeline: dot strip with years ──
  ctx.checkPage(60);

  // Show ~15 years around current (fit on page)
  const nearEntries = timeline.filter(e => Math.abs(e.year - srChart.solarReturnYear) <= 7);
  const dotSpacing = Math.min(contentW / nearEntries.length, 34);
  const startX = margin + (contentW - dotSpacing * nearEntries.length) / 2;

  // Year labels
  doc.setFont('times', 'normal'); doc.setFontSize(6.5);
  doc.setTextColor(...MUTED);
  nearEntries.forEach((entry, i) => {
    const x = startX + i * dotSpacing + dotSpacing / 2;
    doc.text(`'${entry.year.toString().slice(2)}`, x - 4, ctx.y);
  });
  ctx.y += 10;

  // Dots
  nearEntries.forEach((entry, i) => {
    const x = startX + i * dotSpacing + dotSpacing / 2;
    const color = PHASE_DOT_RGB[entry.colorLabel] || MUTED;
    const radius = entry.isCurrent ? 4.5 : entry.isMajorTransition ? 3.5 : 2.5;
    doc.setFillColor(...color);
    doc.circle(x, ctx.y, radius, 'F');

    if (entry.isCurrent) {
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.8);
      doc.circle(x, ctx.y, radius + 2, 'S');
    }
  });
  ctx.y += 10;

  // Stage labels for key years
  doc.setFont('times', 'italic'); doc.setFontSize(5.5);
  doc.setTextColor(...MUTED);
  nearEntries.forEach((entry, i) => {
    if (entry.isCurrent || entry.isMajorTransition) {
      const x = startX + i * dotSpacing + dotSpacing / 2;
      const label = entry.cycleStage.length > 8 ? entry.cycleStage.slice(0, 7) + '.' : entry.cycleStage;
      doc.text(label, x - 6, ctx.y);
    }
  });
  ctx.y += 16;

  // ── Recurring Patterns grid ──
  ctx.checkPage(120);

  doc.setFont('times', 'bold'); doc.setFontSize(6.5);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(3);
  doc.text('RECURRING PATTERNS', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 12;

  const col2W = (contentW - 16) / 2;
  const patternBoxH = 48;

  const patternSets: { label: string; years: number[]; color: Color }[] = [
    { label: 'NEW BEGINNINGS', years: patterns.newCycleYears, color: PHASE_DOT_RGB.beginning },
    { label: 'GROWTH YEARS', years: patterns.crescentYears, color: PHASE_DOT_RGB.growth },
    { label: 'ACTION & DECISION', years: patterns.actionYears, color: PHASE_DOT_RGB.action },
    { label: 'REFINEMENT', years: patterns.refinementYears, color: PHASE_DOT_RGB.refinement },
    { label: 'CULMINATION', years: patterns.culminationYears, color: PHASE_DOT_RGB.culmination },
    { label: 'SHARING & TEACHING', years: patterns.sharingYears, color: PHASE_DOT_RGB.sharing },
    { label: 'REEVALUATION', years: patterns.turningPointYears, color: PHASE_DOT_RGB.reevaluation },
    { label: 'RELEASE & COMPLETION', years: patterns.releaseYears, color: MUTED },
  ].filter(ps => ps.years.length > 0);

  // Draw in 2-column rows with page break awareness
  let gridIdx = 0;
  while (gridIdx < patternSets.length) {
    // Draw up to 2 per row
    const rowItems = patternSets.slice(gridIdx, gridIdx + 2);
    ctx.checkPage(patternBoxH + 12);

    rowItems.forEach((ps, col) => {
      const x = margin + col * (col2W + 16);
      const y = ctx.y;

      doc.setFillColor(...CARD_BG);
      doc.roundedRect(x, y, col2W, patternBoxH, 2, 2, 'F');

      // Left accent bar
      doc.setFillColor(...ps.color);
      doc.rect(x, y, 3, patternBoxH, 'F');

      doc.setFont('times', 'bold'); doc.setFontSize(6.5);
      doc.setTextColor(...ps.color);
      doc.setCharSpace(2);
      doc.text(ps.label, x + 10, y + 14);
      doc.setCharSpace(0);

      doc.setFont('times', 'normal'); doc.setFontSize(9);
      doc.setTextColor(...INK);
      const yearsText = ps.years.join(', ');
      const wrappedYears: string[] = doc.splitTextToSize(yearsText, col2W - 20);
      wrappedYears.slice(0, 2).forEach((line, li) => {
        doc.text(line, x + 10, y + 26 + li * 10);
      });
    });

    ctx.y += patternBoxH + 8;
    gridIdx += 2;
  }

  // ── Balsamic "Ending / Emerging" section (if current year is Balsamic) ──
  if (currentEntry?.phase === 'Balsamic') {
    ctx.checkPage(180);

    const blending = getMoonPhaseBlending(
      'Balsamic', currentEntry.moonSign, currentEntry.sunSign, null, null
    );

    doc.setFont('times', 'bold'); doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(3);
    doc.text('WHAT IS ENDING AND WHAT IS EMERGING', margin, ctx.y);
    doc.setCharSpace(0);
    ctx.y += 20;

    // Two-column: Releasing | Emerging
    const colW = (contentW - 16) / 2;

    // Releasing card
    const relH = 100;
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, ctx.y, colW, relH, 3, 3, 'F');
    doc.setFillColor(...MUTED);
    doc.rect(margin, ctx.y, 3, relH, 'F');

    let ry = ctx.y + 18;
    doc.setFont('times', 'bold'); doc.setFontSize(6.5);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(2);
    doc.text(`RELEASING -- ${currentEntry.moonSign.toUpperCase()}`, margin + 10, ry);
    doc.setCharSpace(0);
    ry += 16;
    doc.setFont('times', 'normal'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    const relLines: string[] = doc.splitTextToSize(blending.releasing, colW - 20);
    relLines.slice(0, 4).forEach(line => { doc.text(line, margin + 10, ry); ry += 14; });

    // Emerging card
    doc.setFillColor(...SOFT_GOLD);
    doc.roundedRect(margin + colW + 16, ctx.y, colW, relH, 3, 3, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(margin + colW + 16, ctx.y, 3, relH, 'F');

    let ey = ctx.y + 18;
    doc.setFont('times', 'bold'); doc.setFontSize(6.5);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(2);
    doc.text(`EMERGING -- ${currentEntry.sunSign.toUpperCase()}`, margin + colW + 26, ey);
    doc.setCharSpace(0);
    ey += 16;
    doc.setFont('times', 'normal'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    const emLines: string[] = doc.splitTextToSize(blending.emerging, colW - 20);
    emLines.slice(0, 4).forEach(line => { doc.text(line, margin + colW + 26, ey); ey += 14; });

    ctx.y += relH + 16;

    // Closing message
    ctx.checkPage(40);
    doc.setFont('times', 'italic'); doc.setFontSize(10);
    doc.setTextColor(...MUTED);
    const closingMsg = 'This is not a year to force momentum. It is a year to trust release, inner work, and preparation for the next cycle.';
    const closingLines: string[] = doc.splitTextToSize(closingMsg, contentW);
    closingLines.forEach(line => { doc.text(line, margin, ctx.y); ctx.y += 15; });
    ctx.y += 8;
  }

  ctx.sectionDivider(doc);
}
