import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { NatalChart } from '@/hooks/useNatalChart';
import { P, MOON_PHASE_EXPLANATIONS } from '@/components/SolarReturnPDFExport';
import { getMoonPhaseBlending } from '@/lib/solarReturnMoonData';

type Color = [number, number, number];
const INK:   Color = [58,  54,  50]; // Charcoal grey
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];
const GOLD:  Color = [184, 150, 62];
const CARD_BG: Color = [245, 241, 234];
const WARM_CREAM: Color = [252, 249, 244];
const SOFT_GOLD: Color = [248, 242, 228];
const CHARCOAL: Color = [58, 54, 50];

const HOUSE_FOCUS: Record<number, string> = {
  1: 'Identity & Self', 2: 'Money & Values', 3: 'Communication', 4: 'Home & Family',
  5: 'Joy & Creativity', 6: 'Health & Daily Work', 7: 'Partnerships',
  8: 'Transformation & Shared Resources', 9: 'Travel & Higher Learning', 10: 'Career & Public Life',
  11: 'Friends & Community', 12: 'Spirituality & Inner Work',
};

const HOUSE_FELT: Record<number, string> = {
  1: 'You feel a pull to redefine who you are. Decisions feel personal. Your body, appearance, and sense of self demand attention.',
  2: 'You feel focused on money, security, and what you truly value. Financial decisions carry extra weight this year.',
  3: 'Your mind is buzzing. Conversations, writing, and learning feel more significant. Your neighborhood and siblings may play a role.',
  4: 'Home and family are where your heart is. You may feel drawn to move, renovate, or address family dynamics.',
  5: 'You crave joy, creativity, and romance. Self-expression feels essential, not optional. Play and pleasure are the assignment.',
  6: 'Daily routines and health demand your attention. Your body is sending messages. Work systems need refinement.',
  7: 'Relationships take center stage. Partnerships -- romantic, business, or creative -- require a new level of engagement.',
  8: 'Something deep is shifting. Shared resources, intimacy, and psychological transformation are the themes.',
  9: 'You feel restless for meaning. Travel, education, or a philosophical shift expands your world.',
  10: 'Career and public reputation are in the spotlight. Professional responsibilities increase but so does recognition.',
  11: 'Friendships and community involvement feel more important. Your social circle is being restructured.',
  12: 'You need more solitude than usual. Inner work, spiritual practice, and rest are not extras -- they are the curriculum.',
};

const MOON_SIGN_FELT: Record<string, string> = {
  Aries: 'Emotions are fast, reactive, and honest. You process feelings through action and may feel impatient with slowness.',
  Taurus: 'Emotional needs center on comfort, stability, and sensory pleasure. You crave predictability and physical grounding.',
  Gemini: 'You process emotions by talking them through. Mental stimulation soothes you. Restlessness is the signal something needs attention.',
  Cancer: 'Emotions run deep. You feel everything intensely and need safe spaces to process. Nurturing others is how you cope.',
  Leo: 'You need to feel seen and appreciated. Creative expression is emotional medicine. Warmth radiates from you.',
  Virgo: 'You process emotions practically -- analyzing, organizing, fixing. Anxiety may spike when things feel out of control.',
  Libra: 'Emotional balance depends on harmony in relationships. Discord is physically uncomfortable. Beauty soothes.',
  Scorpio: 'Emotional intensity is at maximum. You feel everything at full depth. Trust is earned slowly; betrayal cuts deep.',
  Sagittarius: 'You process emotions through meaning-making. Adventure and philosophy are your emotional outlets.',
  Capricorn: 'Emotions are managed through structure and discipline. You carry more than you show. Vulnerability feels risky.',
  Aquarius: 'You step back from emotions to analyze them. Detachment is your default coping mechanism. Community connections matter.',
  Pisces: 'You absorb the emotional atmosphere of every room. Boundaries blur. Intuition is heightened but so is overwhelm.',
};

const ASC_SIGN_FELT: Record<string, string> = {
  Aries: 'You come across as bold, direct, and action-oriented. People see you as a leader this year.',
  Taurus: 'You project calm reliability. People experience you as steady and aesthetically aware.',
  Gemini: 'You appear quick-witted and socially versatile. Communication opens every door.',
  Cancer: 'You seem warm, approachable, and emotionally attuned. People feel safe around you.',
  Leo: 'You radiate confidence and warmth. People are drawn to your generous energy.',
  Virgo: 'You appear competent, detail-oriented, and thoughtful. People trust your analysis.',
  Libra: 'You project grace, charm, and balance. Social situations feel natural.',
  Scorpio: 'You appear intense, perceptive, and magnetic. People sense your depth immediately.',
  Sagittarius: 'You seem adventurous, honest, and inspiring. Your optimism is contagious.',
  Capricorn: 'You project maturity, competence, and quiet authority. People take you seriously.',
  Aquarius: 'You appear unique, intellectually fascinating, and refreshingly unconventional.',
  Pisces: 'You come across as gentle, intuitive, and creatively inspired. People sense your sensitivity.',
};

const MOON_PHASE_FELT: Record<string, string> = {
  'New Moon': 'You feel a strong impulse to start something new. Energy is raw and initiatory. Trust your instincts even when the path is unclear.',
  'Crescent': 'You feel resistance as you push toward something new. Doubt may arise early but momentum is building.',
  'First Quarter': 'You feel pressure to make decisions. External events force your hand. Action is required.',
  'Gibbous': 'You feel the need to refine and adjust. Something is almost ready but not quite. Patience and fine-tuning are key.',
  'Full Moon': 'Everything feels heightened and visible. Relationships demand attention. What you have been building reaches a peak.',
  'Disseminating': 'You feel called to share what you know. Teaching, giving back, and social engagement increase.',
  'Last Quarter': 'You feel the pull to release old structures. Internal shifts matter more than external events.',
  'Balsamic': 'You feel a deep need for rest and solitude. The old cycle is ending. Surrender and inner processing are the work.',
};

export function generatePDFYearAtAGlance(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart
) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);

  // ── Section header ─────────
  ctx.y += 24;

  // Tracked label
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('YOUR YEAR', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 12;

  // Hairline
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 42;

  // Large serif title
  doc.setFont('times', 'normal'); doc.setFontSize(36);
  doc.setTextColor(...INK);
  doc.text('At a Glance', margin, ctx.y);
  ctx.y += 20;

  // Subtitle
  doc.setFont('times', 'italic'); doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('Stick this on your fridge', margin, ctx.y);
  ctx.y += 44;

  // ── TOP ROW: 3-column info box grid ──────────────────────────────
  const col3Gap = 14;
  const col3W = (contentW - col3Gap * 2) / 3;
  const boxH = 155; // Taller boxes for proper spacing

  const houseNum = a.profectionYear?.houseNumber || 1;
  const topStellium = a.stelliums[0];

  ctx.drawInfoBox(doc, margin, ctx.y, col3W, boxH,
    "THIS YEAR'S FOCUS",
    HOUSE_FOCUS[houseNum] || `House ${houseNum}`,
    HOUSE_FELT[houseNum] || `${houseNum}th House Profection Year`,
    SOFT_GOLD,
  );

  ctx.drawInfoBox(doc, margin + col3W + col3Gap, ctx.y, col3W, boxH,
    'EMOTIONAL CLIMATE',
    a.moonSign || '--',
    MOON_SIGN_FELT[a.moonSign || ''] || `Moon in House ${a.moonHouse?.house || '--'}`,
    CARD_BG,
  );

  const stelliumExtrasNote = topStellium?.extras?.filter((e: string) => e === 'Chiron' || e === 'NorthNode');
  const stelliumSubtitle = topStellium
    ? `${topStellium.planets.length}-Planet Stellium${stelliumExtrasNote && stelliumExtrasNote.length > 0 ? ` + ${stelliumExtrasNote.map((e: string) => e === 'NorthNode' ? 'North Node' : e).join(', ')}` : ''}`
    : 'Element Balance';
  ctx.drawInfoBox(doc, margin + (col3W + col3Gap) * 2, ctx.y, col3W, boxH,
    topStellium ? 'POWER ZONE' : 'DOMINANT ELEMENT',
    topStellium ? topStellium.location : (a.elementBalance?.dominant || '--'),
    stelliumSubtitle,
    WARM_CREAM,
  );

  ctx.y += boxH + 28;

  // ── YEAR-DEFINING ASPECT — cream hero card (print-friendly) ──────
  if (a.srToNatalAspects.length > 0) {
    const yda = a.srToNatalAspects[0];
    ctx.checkPage(160);

    const heroH = 140;
    const heroY = ctx.y;

    // Cream background with charcoal border (no black)
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, heroY, contentW, heroH, 4, 4, 'F');
    doc.setDrawColor(...CHARCOAL); doc.setLineWidth(0.5);
    doc.roundedRect(margin, heroY, contentW, heroH, 4, 4, 'S');

    // Gold top accent line
    doc.setFillColor(...GOLD);
    doc.rect(margin, heroY, contentW, 2.5, 'F');

    let hy = heroY + 28;

    // Tracked label
    doc.setFont('times', 'bold'); doc.setFontSize(6.5);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(4);
    doc.text('YEAR-DEFINING ASPECT', margin + 22, hy);
    doc.setCharSpace(0);
    hy += 26;

    // Large aspect name in charcoal
    doc.setFont('times', 'bold'); doc.setFontSize(22);
    doc.setTextColor(...CHARCOAL);
    doc.text(`SR ${P[yda.planet1] || yda.planet1} ${yda.type} Natal ${P[yda.planet2] || yda.planet2}`, margin + 22, hy);
    hy += 16;

    // Orb detail
    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...GOLD);
    doc.text(`${yda.orb} degree orb -- Felt all year`, margin + 22, hy);
    hy += 22;

    // Interpretation
    if (yda.interpretation) {
      doc.setFont('times', 'normal'); doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      const interpLines: string[] = doc.splitTextToSize(yda.interpretation, contentW - 44);
      for (const line of interpLines.slice(0, 3)) { doc.text(line, margin + 22, hy); hy += 15; }
    }

    ctx.y = heroY + heroH + 28;
  }

  // ── Two-column: SR ASCENDANT + MOON PHASE (with felt-sense body text) ──
  if (a.yearlyTheme) {
    ctx.checkPage(200);
    const col2Gap = 16;
    const col2W = (contentW - col2Gap) / 2;
    const pairH = 170; // Taller to fit descriptive text
    const pairY = ctx.y;

    const ascSign = a.yearlyTheme.ascendantSign || '';
    const ascFelt = ASC_SIGN_FELT[ascSign] || 'The year opens through this sign\'s energy.';
    ctx.drawInfoBox(doc, margin, pairY, col2W, pairH,
      'SR ASCENDANT',
      `${ascSign} Rising`,
      `Ruler: ${P[a.yearlyTheme.ascendantRuler] || a.yearlyTheme.ascendantRuler} in ${(a.yearlyTheme.ascendantRulerSign || '').toUpperCase()}. ${ascFelt}`,
      CARD_BG,
    );

    const moonPhase = a.moonPhase?.phase || '';
    const sunSign = srChart.planets.Sun?.sign || '';
    const blending = getMoonPhaseBlending(
      moonPhase, a.moonSign || '', sunSign,
      a.moonHouse?.house ?? null, a.sunHouse?.house ?? null,
    );
    const phaseFelt = MOON_PHASE_FELT[moonPhase] || '';
    ctx.drawInfoBox(doc, margin + col2W + col2Gap, pairY, col2W, pairH,
      'SR MOON PHASE',
      moonPhase || 'Moon Phase',
      `${blending.cycleStage}. ${phaseFelt} Releasing: ${blending.releasing}. Emerging: ${blending.emerging}.`,
      SOFT_GOLD,
    );

    ctx.y = pairY + pairH + 28;
  }

  // ── WHERE THIS YEAR PLAYS OUT — accent card ──────────────────────
  if (a.srAscRulerInNatal) {
    ctx.checkPage(130);
    ctx.drawCard(doc, () => {
      ctx.trackedLabel(doc, 'WHERE THIS YEAR PLAYS OUT', margin + 14, ctx.y, { charSpace: 2.5, size: 7.5 });
      ctx.y += 20;
      doc.setFont('times', 'bold'); doc.setFontSize(16);
      doc.setTextColor(...INK);
      doc.text(`${P[a.srAscRulerInNatal!.rulerPlanet] || a.srAscRulerInNatal!.rulerPlanet} in ${a.srAscRulerInNatal!.rulerNatalSign || '--'} -- Natal House ${a.srAscRulerInNatal!.rulerNatalHouse || '--'}`, margin + 14, ctx.y);
      ctx.y += 24;
      doc.setFont('times', 'normal'); doc.setFontSize(11);
      doc.setTextColor(...INK);
      const interpLines: string[] = doc.splitTextToSize(a.srAscRulerInNatal!.interpretation, contentW - 28);
      for (const line of interpLines) { doc.text(line, margin + 14, ctx.y); ctx.y += 17; }
    });
  }

  // Editorial divider
  ctx.sectionDivider(doc);
}