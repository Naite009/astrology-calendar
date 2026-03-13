import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { P, MOON_PHASE_EXPLANATIONS } from '@/components/SolarReturnPDFExport';

export function generatePDFYearAtAGlance(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart
) {
  const { pw, margin, contentW, colors } = ctx;

  // Elegant page header
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(2);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 24;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text('YEAR AT A GLANCE', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 8;

  // Sub-ornament
  doc.setLineWidth(0.5);
  doc.line(pw / 2 - 40, ctx.y, pw / 2 + 40, ctx.y);
  ctx.y += 24;

  // Left column info — inset from margin to clear the gold accent bar
  const boxL = margin + 8; // left edge of boxes (inset from accent bar)
  const boxW = contentW - 8; // narrower to stay within page
  const glanceStartY = ctx.y;

  // --- SR Ascendant ---
  if (a.yearlyTheme) {
    doc.setFillColor(colors.softGold[0], colors.softGold[1], colors.softGold[2]);
    doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(1);
    doc.roundedRect(boxL, ctx.y, boxW, 54, 6, 6, 'FD');

    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.setTextColor(colors.dimText[0], colors.dimText[1], colors.dimText[2]);
    doc.text('SR ASCENDANT', boxL + 14, ctx.y + 18);
    doc.setFontSize(16);
    doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    doc.text(`${a.yearlyTheme.ascendantSign} Rising`, boxL + 14, ctx.y + 38);

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.setTextColor(colors.dimText[0], colors.dimText[1], colors.dimText[2]);
    doc.text('Ruler:', pw / 2 + 20, ctx.y + 18);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(12);
    doc.setTextColor(colors.deepBrown[0], colors.deepBrown[1], colors.deepBrown[2]);
    doc.text(`${P[a.yearlyTheme.ascendantRuler] || a.yearlyTheme.ascendantRuler} in ${a.yearlyTheme.ascendantRulerSign}`, pw / 2 + 20, ctx.y + 36);

    ctx.y += 62;
  }

  // --- Where This Year Plays Out ---
  if (a.srAscRulerInNatal) {
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, 'Where This Year Plays Out', colors.deepBrown, 11);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
      doc.text(`${P[a.srAscRulerInNatal!.rulerPlanet] || a.srAscRulerInNatal!.rulerPlanet} in ${a.srAscRulerInNatal!.rulerNatalSign || '--'} -- Natal House ${a.srAscRulerInNatal!.rulerNatalHouse || '--'}`, margin + 8, ctx.y);
      ctx.y += 16;
      ctx.writeBody(doc, a.srAscRulerInNatal!.interpretation, colors.bodyText, 9.5);
    });
  }

  // --- Profection + Time Lord (side by side boxes with explanations) ---
  if (a.profectionYear) {
    const halfW = (boxW - 12) / 2;
    const boxH = 76;

    const HOUSE_FOCUS: Record<number, string> = {
      1: 'Identity & Self', 2: 'Money & Values', 3: 'Communication', 4: 'Home & Family',
      5: 'Creativity, Romance & Children', 6: 'Health & Daily Work', 7: 'Partnerships',
      8: 'Transformation & Shared Resources', 9: 'Travel & Higher Learning', 10: 'Career & Public Life',
      11: 'Friends & Community', 12: 'Spirituality & Inner Work',
    };

    // Profection box
    doc.setFillColor(colors.softGold[0], colors.softGold[1], colors.softGold[2]);
    doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(1);
    doc.roundedRect(boxL, ctx.y, halfW, boxH, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.setTextColor(colors.dimText[0], colors.dimText[1], colors.dimText[2]);
    doc.text('PROFECTION YEAR', boxL + 12, ctx.y + 16);
    doc.setFontSize(18);
    doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    doc.text(`House ${a.profectionYear.houseNumber}`, boxL + 12, ctx.y + 36);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.setTextColor(colors.bodyText[0], colors.bodyText[1], colors.bodyText[2]);
    doc.text(`Age ${a.profectionYear.age}`, boxL + 12, ctx.y + 50);
    // House focus label
    const focusLabel = HOUSE_FOCUS[a.profectionYear.houseNumber] || '';
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
    doc.setTextColor(colors.deepBrown[0], colors.deepBrown[1], colors.deepBrown[2]);
    const focusLines = doc.splitTextToSize(`Focus: ${focusLabel}`, halfW - 24);
    focusLines.forEach((line: string, i: number) => {
      doc.text(line, boxL + 12, ctx.y + 62 + i * 10);
    });

    // Time Lord box
    const tlX = boxL + halfW + 12;
    doc.setFillColor(242, 248, 255);
    doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(1);
    doc.roundedRect(tlX, ctx.y, halfW, boxH, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.setTextColor(colors.dimText[0], colors.dimText[1], colors.dimText[2]);
    doc.text('TIME LORD', tlX + 12, ctx.y + 16);
    doc.setFontSize(18);
    doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
    doc.text(P[a.profectionYear.timeLord] || a.profectionYear.timeLord, tlX + 12, ctx.y + 36);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.setTextColor(colors.bodyText[0], colors.bodyText[1], colors.bodyText[2]);
    doc.text('Planet running your year', tlX + 12, ctx.y + 50);
    // Why this planet
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
    doc.setTextColor(colors.deepBrown[0], colors.deepBrown[1], colors.deepBrown[2]);
    const tlExplain = `Rules the sign on natal House ${a.profectionYear.houseNumber} cusp`;
    doc.text(tlExplain, tlX + 12, ctx.y + 62);

    ctx.y += boxH + 10;
  }

  // --- Moon line + phase ---
  const moonPhaseText = a.moonPhase?.phase || '';

  doc.setFillColor(colors.softGold[0], colors.softGold[1], colors.softGold[2]);
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(1);
  const moonBoxH = 50;
  doc.roundedRect(boxL, ctx.y, boxW, moonBoxH, 6, 6, 'FD');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.setTextColor(colors.dimText[0], colors.dimText[1], colors.dimText[2]);
  doc.text('SR MOON', boxL + 14, ctx.y + 18);
  doc.setFontSize(14);
  doc.setTextColor(colors.gold[0], colors.gold[1], colors.gold[2]);
  doc.text(`${a.moonSign} in House ${a.moonHouse?.house || '--'}`, boxL + 14, ctx.y + 36);

  if (moonPhaseText) {
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.setTextColor(colors.deepBrown[0], colors.deepBrown[1], colors.deepBrown[2]);
    doc.text(moonPhaseText, pw / 2 + 20, ctx.y + 28);
  }
  ctx.y += moonBoxH + 8;

  // Moon phase explanation card
  if (moonPhaseText) {
    const phaseExplanation = MOON_PHASE_EXPLANATIONS[moonPhaseText] || MOON_PHASE_EXPLANATIONS[moonPhaseText.replace(' Moon', '')] || MOON_PHASE_EXPLANATIONS[moonPhaseText + ' Moon'];
    if (phaseExplanation) {
      ctx.drawCard(doc, () => {
        ctx.writeBold(doc, `Moon Phase: ${moonPhaseText}`, colors.gold, 11);
        ctx.y += 2;
        ctx.writeBody(doc, phaseExplanation, colors.bodyText, 10);
      });
    }
  }

  // Gold accent bar on left
  const glanceEndY = ctx.y;
  doc.setDrawColor(colors.gold[0], colors.gold[1], colors.gold[2]); doc.setLineWidth(3);
  doc.line(margin, glanceStartY, margin, glanceEndY);
}
