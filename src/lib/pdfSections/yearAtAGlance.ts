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
const WARM_CREAM: Color = [252, 249, 244];
const SOFT_GOLD: Color = [248, 242, 228];

const HOUSE_FOCUS: Record<number, string> = {
  1: 'Identity & Self', 2: 'Money & Values', 3: 'Communication', 4: 'Home & Family',
  5: 'Joy & Creativity', 6: 'Health & Daily Work', 7: 'Partnerships',
  8: 'Transformation & Shared Resources', 9: 'Travel & Higher Learning', 10: 'Career & Public Life',
  11: 'Friends & Community', 12: 'Spirituality & Inner Work',
};

export function generatePDFYearAtAGlance(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart
) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);

  // Section header
  ctx.sectionTitle(doc, 'YEAR AT A GLANCE', 'Your Year at a Glance');
  ctx.y += 2;
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Stick this on your fridge', margin, ctx.y);
  ctx.y += 22;

  // ── TOP ROW: 3-column info box grid ──────────────────────────────
  const col3Gap = 12;
  const col3W = (contentW - col3Gap * 2) / 3;
  const boxH = 100;

  const houseNum = a.profectionYear?.houseNumber || 1;
  const moonPhase = a.moonPhase?.phase || '';
  const topStellium = a.stelliums[0];

  ctx.drawInfoBox(doc, margin, ctx.y, col3W, boxH,
    "THIS YEAR'S FOCUS",
    HOUSE_FOCUS[houseNum] || `House ${houseNum}`,
    `${houseNum}th House Profection Year`,
    SOFT_GOLD,
  );

  ctx.drawInfoBox(doc, margin + col3W + col3Gap, ctx.y, col3W, boxH,
    'EMOTIONAL CLIMATE',
    a.moonSign || '--',
    `Moon in House ${a.moonHouse?.house || '--'}`,
    CARD_BG,
  );

  ctx.drawInfoBox(doc, margin + (col3W + col3Gap) * 2, ctx.y, col3W, boxH,
    topStellium ? 'POWER ZONE' : 'DOMINANT ELEMENT',
    topStellium ? topStellium.location : (a.elementBalance?.dominant || '--'),
    topStellium ? `${topStellium.planets.length}-Planet Stellium` : 'Element Balance',
    WARM_CREAM,
  );

  ctx.y += boxH + 16;

  // ── YEAR-DEFINING ASPECT — hero dark card ────────────────────────
  if (a.srToNatalAspects.length > 0) {
    const yda = a.srToNatalAspects[0];
    ctx.checkPage(140);

    const heroH = 130;
    const heroY = ctx.y;

    // Dark background
    doc.setFillColor(38, 34, 30);
    doc.roundedRect(margin, heroY, contentW, heroH, 4, 4, 'F');

    // Gold top accent
    doc.setFillColor(...GOLD);
    doc.rect(margin, heroY, contentW, 3, 'F');

    let hy = heroY + 24;
    doc.setFont('times', 'bold'); doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(3);
    doc.text('YEAR-DEFINING ASPECT', margin + 18, hy);
    doc.setCharSpace(0);
    hy += 22;

    doc.setFont('times', 'bold'); doc.setFontSize(20);
    doc.setTextColor(250, 247, 242);
    doc.text(`SR ${P[yda.planet1] || yda.planet1} ${yda.type} Natal ${P[yda.planet2] || yda.planet2}`, margin + 18, hy);
    hy += 14;

    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text(`${yda.orb}° ORB  ·  FELT ALL YEAR`, margin + 18, hy);
    hy += 18;

    if (yda.interpretation) {
      doc.setFont('times', 'normal'); doc.setFontSize(10.5);
      doc.setTextColor(220, 216, 210);
      const interpLines: string[] = doc.splitTextToSize(yda.interpretation, contentW - 36);
      for (const line of interpLines.slice(0, 3)) { doc.text(line, margin + 18, hy); hy += 15; }
    }

    ctx.y = heroY + heroH + 16;
  }

  // ── Two-column: SR ASCENDANT + MOON PHASE ────────────────────────
  if (a.yearlyTheme) {
    ctx.checkPage(140);
    const col2Gap = 14;
    const col2W = (contentW - col2Gap) / 2;
    const pairH = 130;
    const pairY = ctx.y;

    // Left box: SR Ascendant
    ctx.drawInfoBox(doc, margin, pairY, col2W, pairH,
      'SR ASCENDANT',
      `${a.yearlyTheme.ascendantSign} Rising`,
      `Ruler: ${P[a.yearlyTheme.ascendantRuler] || a.yearlyTheme.ascendantRuler} in ${(a.yearlyTheme.ascendantRulerSign || '').toUpperCase()}`,
      CARD_BG,
    );

    // Right box: Moon Phase
    ctx.drawInfoBox(doc, margin + col2W + col2Gap, pairY, col2W, pairH,
      'SR MOON PHASE',
      moonPhase || 'Moon Phase',
      `${a.moonSign || '--'} · House ${a.moonHouse?.house || '--'}`,
      SOFT_GOLD,
    );

    ctx.y = pairY + pairH + 16;
  }

  // ── WHERE THIS YEAR PLAYS OUT — accent card ──────────────────────
  if (a.srAscRulerInNatal) {
    ctx.checkPage(120);
    ctx.drawCard(doc, () => {
      ctx.trackedLabel(doc, 'WHERE THIS YEAR PLAYS OUT', margin + 14, ctx.y, { charSpace: 2.5, size: 7.5 });
      ctx.y += 16;
      doc.setFont('times', 'bold'); doc.setFontSize(14);
      doc.setTextColor(...INK);
      doc.text(`${P[a.srAscRulerInNatal!.rulerPlanet] || a.srAscRulerInNatal!.rulerPlanet} in ${a.srAscRulerInNatal!.rulerNatalSign || '--'} — Natal House ${a.srAscRulerInNatal!.rulerNatalHouse || '--'}`, margin + 14, ctx.y);
      ctx.y += 18;
      doc.setFont('times', 'normal'); doc.setFontSize(11);
      doc.setTextColor(...INK);
      const interpLines: string[] = doc.splitTextToSize(a.srAscRulerInNatal!.interpretation, contentW - 28);
      for (const line of interpLines) { doc.text(line, margin + 14, ctx.y); ctx.y += 17; }
    });
  }

  // Editorial divider before next section
  ctx.sectionDivider(doc);
}
