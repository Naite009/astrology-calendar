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
  ctx.y += 16;

  // Tracked label
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('YOUR YEAR', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 8;

  // Hairline
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 28;

  // Large serif title
  doc.setFont('times', 'normal'); doc.setFontSize(32);
  doc.setTextColor(...INK);
  doc.text('Your Personal Map', margin, ctx.y);
  ctx.y += 14;

  // Subtitle
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Stick this on your fridge', margin, ctx.y);
  ctx.y += 28;

  // ── TOP ROW: 3-column info box grid ──────────────────────────────
  const col3Gap = 10;
  const col3W = (contentW - col3Gap * 2) / 3;
  const boxH = 112;

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

  ctx.y += boxH + 12;

  // ── YEAR-DEFINING ASPECT — compact hero card ─────────────────────
  if (a.srToNatalAspects.length > 0) {
    const yda = a.srToNatalAspects[0];
    ctx.checkPage(100);

    const heroH = 94;
    const heroY = ctx.y;

    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, heroY, contentW, heroH, 4, 4, 'F');
    doc.setDrawColor(...CHARCOAL); doc.setLineWidth(0.4);
    doc.roundedRect(margin, heroY, contentW, heroH, 4, 4, 'S');
    doc.setFillColor(...GOLD);
    doc.rect(margin, heroY, contentW, 2, 'F');

    let hy = heroY + 17;

    doc.setFont('times', 'bold'); doc.setFontSize(6);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(3.5);
    doc.text('YEAR-DEFINING ASPECT', margin + 14, hy);
    doc.setCharSpace(0);
    hy += 16;

    doc.setFont('times', 'bold'); doc.setFontSize(15);
    doc.setTextColor(...CHARCOAL);
    const aspectLine = `Solar Return ${P[yda.planet1] || yda.planet1} ${yda.type} Natal ${P[yda.planet2] || yda.planet2}`;
    const aspectLines: string[] = doc.splitTextToSize(aspectLine, contentW - 28);
    for (const line of aspectLines.slice(0, 2)) { doc.text(line, margin + 14, hy); hy += 12; }

    doc.setFont('times', 'normal'); doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.text(`${yda.orb} degree orb -- Felt all year`, margin + 14, hy);
    hy += 13;

    if (yda.interpretation) {
      doc.setFont('times', 'normal'); doc.setFontSize(8.8);
      doc.setTextColor(...INK);
      const interpLines: string[] = doc.splitTextToSize(yda.interpretation, contentW - 28);
      for (const line of interpLines.slice(0, 2)) { doc.text(line, margin + 14, hy); hy += 11; }
    }

    ctx.y = heroY + heroH + 12;
  }

  // ── Two-column row: Solar Return ASCENDANT + MOON PHASE ─────────
  if (a.yearlyTheme) {
    ctx.checkPage(122);
    const col2Gap = 12;
    const col2W = (contentW - col2Gap) / 2;
    const pairH = 112;
    const pairY = ctx.y;

    const ascSign = a.yearlyTheme.ascendantSign || '';
    const ascFelt = ASC_SIGN_FELT[ascSign] || 'The year opens through this sign\'s energy.';
    ctx.drawInfoBox(doc, margin, pairY, col2W, pairH,
      'SOLAR RETURN ASCENDANT',
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
      'SOLAR RETURN MOON PHASE',
      moonPhase || 'Moon Phase',
      `${blending.cycleStage}. ${phaseFelt}`,
      SOFT_GOLD,
    );

    ctx.y = pairY + pairH + 10;
  }

  // ── Time Lord strip (explicitly includes both names) ──────────────
  if (a.profectionYear?.timeLord) {
    ctx.checkPage(56);
    const stripH = 44;
    doc.setFillColor(...WARM_CREAM);
    doc.roundedRect(margin, ctx.y, contentW, stripH, 3, 3, 'F');
    doc.setFillColor(...GOLD);
    doc.rect(margin, ctx.y, 3, stripH, 'F');

    let sy = ctx.y + 15;
    doc.setFont('times', 'bold'); doc.setFontSize(6.5);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(2.5);
    doc.text('TIME LORD / LORD OF THE YEAR', margin + 12, sy);
    doc.setCharSpace(0);

    sy += 16;
    doc.setFont('times', 'bold'); doc.setFontSize(11.5);
    doc.setTextColor(...INK);
    doc.text(`${P[a.profectionYear.timeLord] || a.profectionYear.timeLord} in Solar Return House ${a.profectionYear.timeLordSRHouse || '--'}`, margin + 12, sy);

    ctx.y += stripH + 10;
  }

  // ── WHERE THIS YEAR PLAYS OUT — compact box ───────────────────────
  if (a.srAscRulerInNatal) {
    ctx.checkPage(96);
    const boxH = 86;
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, ctx.y, contentW, boxH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.roundedRect(margin, ctx.y, contentW, boxH, 3, 3, 'S');
    doc.setFillColor(...GOLD);
    doc.rect(margin, ctx.y, 3, boxH, 'F');

    let py = ctx.y + 14;
    ctx.trackedLabel(doc, 'WHERE THIS YEAR PLAYS OUT', margin + 12, py, { charSpace: 2.2, size: 6.8 });
    py += 14;

    doc.setFont('times', 'bold'); doc.setFontSize(11.5);
    doc.setTextColor(...INK);
    const title = `${P[a.srAscRulerInNatal.rulerPlanet] || a.srAscRulerInNatal.rulerPlanet} in ${a.srAscRulerInNatal.rulerNatalSign || '--'} -- Natal House ${a.srAscRulerInNatal.rulerNatalHouse || '--'}`;
    const titleLines: string[] = doc.splitTextToSize(title, contentW - 24);
    for (const line of titleLines.slice(0, 1)) { doc.text(line, margin + 12, py); py += 12; }

    doc.setFont('times', 'normal'); doc.setFontSize(8.6);
    doc.setTextColor(...INK);
    const interpLines: string[] = doc.splitTextToSize(a.srAscRulerInNatal.interpretation, contentW - 24);
    for (const line of interpLines.slice(0, 3)) { doc.text(line, margin + 12, py); py += 10; }

    ctx.y += boxH + 8;
  }

  // Editorial divider
  ctx.sectionDivider(doc);
}