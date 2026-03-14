import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { P, MOON_PHASE_EXPLANATIONS } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];
const GOLD:  Color = [184, 150, 62];
const CARD_BG: Color = [245, 241, 234];

export function generatePDFYearAtAGlance(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart
) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);

  // Section header
  ctx.trackedLabel(doc, '03 · YEAR AT A GLANCE', margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;

  // Large serif display title
  doc.setFont('times', 'normal'); doc.setFontSize(24);
  doc.setTextColor(...INK);
  doc.text('Your Year at a Glance', margin, ctx.y);
  ctx.y += 8;

  // Sub-label
  doc.setFont('times', 'normal'); doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.setCharSpace(2.5);
  doc.text('STICK THIS ON YOUR FRIDGE', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 10;

  // Hairline rule
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 16;

  const HOUSE_FOCUS: Record<number, string> = {
    1: 'Identity & Self', 2: 'Money & Values', 3: 'Communication', 4: 'Home & Family',
    5: 'Joy & Creativity', 6: 'Health & Daily Work', 7: 'Partnerships',
    8: 'Transformation & Shared Resources', 9: 'Travel & Higher Learning', 10: 'Career & Public Life',
    11: 'Friends & Community', 12: 'Spirituality & Inner Work',
  };

  // ── THIS YEAR'S FOCUS — large card ──
  if (a.profectionYear) {
    ctx.drawCard(doc, () => {
      ctx.trackedLabel(doc, "THIS YEAR'S FOCUS", margin + 14, ctx.y, { charSpace: 2.5, size: 7.5 });
      ctx.y += 16;
      doc.setFont('times', 'bold'); doc.setFontSize(22);
      doc.setTextColor(...INK);
      doc.text(HOUSE_FOCUS[a.profectionYear.houseNumber] || `House ${a.profectionYear.houseNumber}`, margin + 14, ctx.y);
      ctx.y += 10;
      doc.setFont('times', 'normal'); doc.setFontSize(8.5);
      doc.setTextColor(...MUTED);
      doc.setCharSpace(1.5);
      doc.text(`${a.profectionYear.houseNumber}TH HOUSE PROFECTION YEAR`, margin + 14, ctx.y);
      doc.setCharSpace(0);
      ctx.y += 14;
      doc.setFont('times', 'normal'); doc.setFontSize(10);
      doc.setTextColor(...INK);
      const focusText = `This year the spotlight lands on ${(HOUSE_FOCUS[a.profectionYear.houseNumber] || '').toLowerCase()}. Everything significant circles back to this area. The energy channels most directly into your identity, confidence, and how you present yourself to the world.`;
      const focusLines: string[] = doc.splitTextToSize(focusText, contentW - 28);
      for (const line of focusLines) { doc.text(line, margin + 14, ctx.y); ctx.y += 15; }
    });
  }

  // ── Two-column: EMOTIONAL CLIMATE + POWER ZONE ──
  {
    const halfW = (contentW - 16) / 2;
    const startY = ctx.y;
    const estimatedH = 180;

    // Full-width card background
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, startY, contentW, estimatedH, 3, 3, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(margin, startY, 3, estimatedH, 'F');

    // Left: Emotional Climate
    let leftY = startY + 16;
    ctx.trackedLabel(doc, 'EMOTIONAL CLIMATE', margin + 14, leftY, { charSpace: 2.5, size: 7 });
    leftY += 16;
    doc.setFont('times', 'bold'); doc.setFontSize(18);
    doc.setTextColor(...INK);
    doc.text(a.moonSign || '--', margin + 14, leftY);
    leftY += 10;
    const moonHouseNum = a.moonHouse?.house || 0;
    const moonHouseLabel = moonHouseNum ? `MOON IN ${moonHouseNum}TH HOUSE` : '';
    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(moonHouseLabel, margin + 14, leftY);
    leftY += 14;
    doc.setFont('times', 'normal'); doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const moonPhaseText = a.moonPhase?.phase || '';
    const moonBody = moonPhaseText ? (MOON_PHASE_EXPLANATIONS[moonPhaseText]?.substring(0, 200) || '') : '';
    const moonLines: string[] = doc.splitTextToSize(moonBody, halfW - 16);
    for (const line of moonLines.slice(0, 5)) { doc.text(line, margin + 14, leftY); leftY += 14; }

    // Right: Power Zone (stellium or dominant element)
    const rightX = margin + halfW + 16;
    let rightY = startY + 16;
    ctx.trackedLabel(doc, 'POWER ZONE', rightX, rightY, { charSpace: 2.5, size: 7 });
    rightY += 16;
    const topStellium = a.stelliums[0];
    if (topStellium) {
      doc.setFont('times', 'bold'); doc.setFontSize(18);
      doc.setTextColor(...INK);
      doc.text(topStellium.location, rightX, rightY);
      rightY += 10;
      doc.setFont('times', 'normal'); doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`${topStellium.planets.length}-PLANET STELLIUM`, rightX, rightY);
      rightY += 14;
      doc.setFont('times', 'normal'); doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      const stellText = `${topStellium.planets.map(p => P[p] || p).join(', ')} pile into ${topStellium.location} \u2014 a concentrated demand for attention.`;
      const stellLines: string[] = doc.splitTextToSize(stellText, halfW - 16);
      for (const line of stellLines.slice(0, 5)) { doc.text(line, rightX, rightY); rightY += 14; }
    } else {
      doc.setFont('times', 'bold'); doc.setFontSize(18);
      doc.setTextColor(...INK);
      doc.text(a.elementBalance?.dominant || '--', rightX, rightY);
      rightY += 10;
      doc.setFont('times', 'normal'); doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text('DOMINANT ELEMENT', rightX, rightY);
    }

    // Vertical divider
    const maxY = Math.max(leftY, rightY);
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(margin + halfW + 8, startY + 12, margin + halfW + 8, maxY);

    const actualH = maxY - startY + 14;
    // Erase excess
    doc.setFillColor(250, 247, 242);
    doc.rect(margin - 1, startY + actualH, contentW + 2, estimatedH - actualH + 10, 'F');
    // Border
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.roundedRect(margin, startY, contentW, actualH, 3, 3, 'S');
    doc.setFillColor(...GOLD);
    doc.rect(margin, startY, 3, actualH, 'F');

    ctx.y = startY + actualH + 10;
  }

  // ── YEAR-DEFINING ASPECT (use strongest SR-to-natal aspect if available) ──
  if (a.srToNatalAspects.length > 0) {
    const yda = a.srToNatalAspects[0];
    ctx.drawCard(doc, () => {
      ctx.trackedLabel(doc, 'YEAR-DEFINING ASPECT', margin + 14, ctx.y, { charSpace: 2.5, size: 7.5 });
      ctx.y += 16;
      doc.setFont('times', 'bold'); doc.setFontSize(16);
      doc.setTextColor(...INK);
      doc.text(`SR ${P[yda.planet1] || yda.planet1} ${yda.type} Natal ${P[yda.planet2] || yda.planet2}`, margin + 14, ctx.y);
      ctx.y += 10;
      doc.setFont('times', 'normal'); doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`${yda.orb}\u00b0 ORB  ·  FELT ALL YEAR`, margin + 14, ctx.y);
      ctx.y += 14;
      if (yda.interpretation) {
        doc.setFont('times', 'normal'); doc.setFontSize(10);
        doc.setTextColor(...INK);
        const interpLines: string[] = doc.splitTextToSize(yda.interpretation, contentW - 28);
        for (const line of interpLines.slice(0, 4)) { doc.text(line, margin + 14, ctx.y); ctx.y += 15; }
      }
    });
  }

  // ── SR ASCENDANT OVERVIEW ──
  if (a.yearlyTheme) {
    ctx.trackedLabel(doc, 'SR ASCENDANT OVERVIEW', margin, ctx.y);
    ctx.y += 12;

    const halfW = (contentW - 16) / 2;
    const overviewStartY = ctx.y;
    const overviewH = 120;

    // Full-width card
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, overviewStartY, contentW, overviewH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.roundedRect(margin, overviewStartY, contentW, overviewH, 3, 3, 'S');

    // Left: SR Ascendant
    let ly = overviewStartY + 16;
    ctx.trackedLabel(doc, 'SR ASCENDANT', margin + 14, ly, { charSpace: 2.5, size: 7 });
    ly += 16;
    doc.setFont('times', 'bold'); doc.setFontSize(16);
    doc.setTextColor(...INK);
    doc.text(`${a.yearlyTheme.ascendantSign} Rising`, margin + 14, ly);
    ly += 12;
    doc.setFont('times', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(`RULER: ${P[a.yearlyTheme.ascendantRuler] || a.yearlyTheme.ascendantRuler} IN ${(a.yearlyTheme.ascendantRulerSign || '').toUpperCase()}`, margin + 14, ly);
    ly += 14;
    if (a.srAscRulerInNatal?.interpretation) {
      doc.setFont('times', 'normal'); doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      const rulerLines: string[] = doc.splitTextToSize(a.srAscRulerInNatal.interpretation.substring(0, 180), halfW - 16);
      for (const line of rulerLines.slice(0, 3)) { doc.text(line, margin + 14, ly); ly += 13; }
    }

    // Vertical divider
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(margin + halfW + 8, overviewStartY + 12, margin + halfW + 8, overviewStartY + overviewH - 12);

    // Right: SR Moon Phase
    const rightX = margin + halfW + 16;
    let ry = overviewStartY + 16;
    ctx.trackedLabel(doc, 'SR MOON PHASE', rightX, ry, { charSpace: 2.5, size: 7 });
    ry += 16;
    const moonPhaseText = a.moonPhase?.phase || '';
    doc.setFont('times', 'bold'); doc.setFontSize(16);
    doc.setTextColor(...INK);
    doc.text(moonPhaseText || 'Moon Phase', rightX, ry);
    ry += 12;
    doc.setFont('times', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(`${a.moonSign || '--'} · HOUSE ${a.moonHouse?.house || '--'}`, rightX, ry);
    ry += 14;
    if (moonPhaseText && MOON_PHASE_EXPLANATIONS[moonPhaseText]) {
      doc.setFont('times', 'normal'); doc.setFontSize(9.5);
      doc.setTextColor(...INK);
      const phaseLines: string[] = doc.splitTextToSize(MOON_PHASE_EXPLANATIONS[moonPhaseText].substring(0, 180), halfW - 16);
      for (const line of phaseLines.slice(0, 3)) { doc.text(line, rightX, ry); ry += 13; }
    }

    ctx.y = overviewStartY + overviewH + 10;
  }

  // ── Where This Year Plays Out ──
  if (a.srAscRulerInNatal) {
    ctx.checkPage(80);
    ctx.drawCard(doc, () => {
      ctx.trackedLabel(doc, 'WHERE THIS YEAR PLAYS OUT', margin + 14, ctx.y, { charSpace: 2.5, size: 7.5 });
      ctx.y += 14;
      doc.setFont('times', 'bold'); doc.setFontSize(12);
      doc.setTextColor(...INK);
      doc.text(`${P[a.srAscRulerInNatal!.rulerPlanet] || a.srAscRulerInNatal!.rulerPlanet} in ${a.srAscRulerInNatal!.rulerNatalSign || '--'} \u2014 Natal House ${a.srAscRulerInNatal!.rulerNatalHouse || '--'}`, margin + 14, ctx.y);
      ctx.y += 14;
      doc.setFont('times', 'normal'); doc.setFontSize(10);
      doc.setTextColor(...INK);
      const interpLines: string[] = doc.splitTextToSize(a.srAscRulerInNatal!.interpretation, contentW - 28);
      for (const line of interpLines) { doc.text(line, margin + 14, ctx.y); ctx.y += 15; }
    });
  }
}
