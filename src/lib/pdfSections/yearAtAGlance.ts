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

export function generatePDFYearAtAGlance(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart
) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);

  // Section label
  ctx.trackedLabel(doc, '03 · YEAR AT A GLANCE', margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;

  // Heading
  doc.setFont('times', 'bold'); doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text('Your Year at a Glance', margin, ctx.y);
  ctx.y += 8;

  // Sub-label
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Stick this on your fridge', margin, ctx.y);
  ctx.y += 10;

  // Hairline rule
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 16;

  const HOUSE_FOCUS: Record<number, string> = {
    1: 'Identity & Self', 2: 'Money & Values', 3: 'Communication', 4: 'Home & Family',
    5: 'Creativity, Romance & Children', 6: 'Health & Daily Work', 7: 'Partnerships',
    8: 'Transformation & Shared Resources', 9: 'Travel & Higher Learning', 10: 'Career & Public Life',
    11: 'Friends & Community', 12: 'Spirituality & Inner Work',
  };

  // 2x2 grid of data blocks — NO filled cards
  const halfW = (contentW - 20) / 2;
  const blockH = 80;

  interface DataBlock {
    label: string;
    value: string;
    subvalue: string;
    body: string;
  }

  const blocks: DataBlock[] = [];

  // Block 1: This Year's Focus (Profection)
  if (a.profectionYear) {
    blocks.push({
      label: "THIS YEAR'S FOCUS",
      value: HOUSE_FOCUS[a.profectionYear.houseNumber] || `House ${a.profectionYear.houseNumber}`,
      subvalue: `${a.profectionYear.houseNumber}TH HOUSE PROFECTION YEAR`,
      body: `Age ${a.profectionYear.age} — the spotlight lands here.`,
    });
  }

  // Block 2: Time Lord
  if (a.profectionYear?.timeLord) {
    blocks.push({
      label: 'TIME LORD',
      value: P[a.profectionYear.timeLord] || a.profectionYear.timeLord,
      subvalue: 'PLANET RUNNING YOUR YEAR',
      body: `Rules your profection house cusp. Every transit to this planet hits harder.`,
    });
  }

  // Block 3: SR Ascendant
  if (a.yearlyTheme) {
    blocks.push({
      label: 'SR ASCENDANT',
      value: `${a.yearlyTheme.ascendantSign} Rising`,
      subvalue: `RULER: ${P[a.yearlyTheme.ascendantRuler] || a.yearlyTheme.ascendantRuler} IN ${(a.yearlyTheme.ascendantRulerSign || '').toUpperCase()}`,
      body: 'How this year presents itself to the world.',
    });
  }

  // Block 4: SR Moon
  const moonPhaseText = a.moonPhase?.phase || '';
  blocks.push({
    label: 'SR MOON',
    value: `${a.moonSign || '--'} in House ${a.moonHouse?.house || '--'}`,
    subvalue: moonPhaseText ? moonPhaseText.toUpperCase() : '',
    body: moonPhaseText ? (MOON_PHASE_EXPLANATIONS[moonPhaseText]?.substring(0, 100) + '...') || '' : '',
  });

  // Render blocks in 2x2 grid
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (halfW + 20);
    const baseY = ctx.y + row * (blockH + 16);

    // Tracked caps label
    ctx.trackedLabel(doc, b.label, x, baseY);

    // Large value
    doc.setFont('times', 'bold'); doc.setFontSize(16);
    doc.setTextColor(...INK);
    doc.text(b.value, x, baseY + 18);

    // Subvalue
    if (b.subvalue) {
      doc.setFont('times', 'italic'); doc.setFontSize(9);
      doc.setTextColor(...MUTED);
      doc.text(b.subvalue, x, baseY + 30);
    }

    // Body
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...INK);
    const bodyLines: string[] = doc.splitTextToSize(b.body, halfW - 8);
    bodyLines.slice(0, 2).forEach((line: string, li: number) => {
      doc.text(line, x, baseY + 42 + li * 14);
    });

    // Hairline rule below block
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(x, baseY + blockH - 4, x + halfW, baseY + blockH - 4);
  }

  const totalRows = Math.ceil(blocks.length / 2);
  ctx.y += totalRows * (blockH + 16) + 10;

  // SR ASCENDANT OVERVIEW section — two side-by-side items
  if (a.yearlyTheme && a.moonSign) {
    ctx.trackedLabel(doc, 'SR ASCENDANT OVERVIEW', margin, ctx.y);
    ctx.y += 12;

    // Left: SR Ascendant
    doc.setFont('times', 'bold'); doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(`${a.yearlyTheme.ascendantSign} Rising`, margin, ctx.y);
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`Ruler: ${P[a.yearlyTheme.ascendantRuler] || a.yearlyTheme.ascendantRuler} in ${a.yearlyTheme.ascendantRulerSign}`, margin, ctx.y + 14);

    // Thin vertical rule divider
    const midX = pw / 2;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(midX, ctx.y - 10, midX, ctx.y + 20);

    // Right: SR Moon Phase
    doc.setFont('times', 'bold'); doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(moonPhaseText || 'Moon Phase', midX + 16, ctx.y);
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text(`${a.moonSign} in House ${a.moonHouse?.house || '--'}`, midX + 16, ctx.y + 14);

    ctx.y += 32;
  }

  // Where This Year Plays Out — if available
  if (a.srAscRulerInNatal) {
    ctx.checkPage(80);
    ctx.trackedLabel(doc, 'WHERE THIS YEAR PLAYS OUT', margin, ctx.y);
    ctx.y += 10;
    doc.setFont('times', 'bold'); doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(`${P[a.srAscRulerInNatal.rulerPlanet] || a.srAscRulerInNatal.rulerPlanet} in ${a.srAscRulerInNatal.rulerNatalSign || '--'} — Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '--'}`, margin, ctx.y);
    ctx.y += 14;
    doc.setFont('times', 'normal'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    const interpLines: string[] = doc.splitTextToSize(a.srAscRulerInNatal.interpretation, contentW);
    for (const line of interpLines) { doc.text(line, margin, ctx.y); ctx.y += 16; }
    ctx.y += 8;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 8;
  }
}
