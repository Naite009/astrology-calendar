import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { NatalChart } from '@/hooks/useNatalChart';
import { getNatalPlanetHouse } from '@/lib/houseCalculations';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];
const GOLD:  Color = [184, 150, 62];
const CARD_BG: Color = [245, 241, 234];

function ord(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

// ─── Natal Sun ──────────────────────────────────────
const sunStrength: Record<string, string> = {
  Aries: 'Initiative, courage, and the drive to start what others only imagine. You act first and think later -- and it usually works.',
  Taurus: 'Steadiness, sensory awareness, and the patience to build things that endure. You are the rock others lean on.',
  Gemini: 'Mental agility, curiosity, and the ability to make connections others miss. You process information faster than anyone in the room.',
  Cancer: 'Emotional intelligence, protective instinct, and the ability to create safety for others. People trust you before they know why.',
  Leo: 'Warmth, creative authority, and the capacity to make others feel celebrated. You light up rooms without trying.',
  Virgo: 'Discernment, analytical precision, and the drive to improve everything you touch. You see what needs fixing.',
  Libra: 'Relational awareness, aesthetic intelligence, and the ability to hold opposing truths without collapsing.',
  Scorpio: 'Emotional depth, penetrating perception, and the refusal to accept anything at face value. You see through pretense.',
  Sagittarius: 'Philosophical reach, restless honesty, and the need to find meaning in everything. You expand whatever you touch.',
  Capricorn: 'Strategic patience, structural thinking, and the ability to build legacies. You play the long game.',
  Aquarius: 'Original thinking, humanitarian awareness, and the ability to see systemic patterns others ignore.',
  Pisces: 'Compassion, creative imagination, and profound sensitivity to what the world needs. You absorb the emotional frequency of every room.',
};
const sunShadow: Record<string, string> = {
  Aries: 'Impatience, impulsivity, and a tendency to bulldoze through situations that require diplomacy.',
  Taurus: 'Stubbornness that masquerades as stability. Resistance to necessary change.',
  Gemini: 'Scattered attention, superficiality when depth is required, and using wit to deflect emotional vulnerability.',
  Cancer: 'Emotional manipulation through guilt or withdrawal. Smothering under the guise of nurturing.',
  Leo: 'Need for validation that undermines authentic self-expression. Can become domineering when feeling unseen.',
  Virgo: 'Paralysis through perfectionism. Critical inner voice that extends outward. Anxiety disguised as productivity.',
  Libra: 'People-pleasing that erodes identity. Avoiding conflict until it explodes.',
  Scorpio: 'Controlling behavior driven by fear of betrayal. Holding grudges as emotional armor.',
  Sagittarius: 'Restlessness that prevents commitment. Brutal honesty without empathy.',
  Capricorn: 'Emotional unavailability disguised as strength. Measuring self-worth through achievement.',
  Aquarius: 'Emotional detachment presented as objectivity. Contrarianism for its own sake.',
  Pisces: 'Boundary dissolution that leads to enmeshment. Escapism through substances, fantasy, or spiritual bypassing.',
};

// ─── SR Sun in House ────────────────────────────────
const srSunHouseBody: Record<number, string> = {
  1: 'Your core identity is being refreshed and redefined. People see a more authentic version of you emerging — the year amplifies who you really are. The 1st house placement puts you at the center of your own story.',
  2: 'Your energy this year flows toward finances, possessions, and defining what you truly value. The 2nd house Sun draws attention to material security and self-worth in practical, tangible ways.',
  3: 'Your mind and voice are the main characters. The 3rd house Sun activates learning, communication, writing, and everyday connections. Ideas carry unusual weight this year.',
  4: 'Home, family, and emotional roots demand your full attention. The 4th house Sun turns energy inward — toward ancestry, domestic life, and the foundations that hold everything else together.',
  5: 'Joy, creativity, and self-expression light up this year. The 5th house Sun pulls you toward play, creative risk-taking, and emotional vulnerability.',
  6: 'Daily routines, health, and work efficiency are being restructured. Small, consistent changes produce the biggest results.',
  7: 'Relationships define this year. The 7th house Sun places partnerships at the center. Growth happens through the mirror of another person.',
  8: 'Transformation runs deep. The 8th house Sun activates shared resources, psychological depth, and emotional honesty.',
  9: 'Your world is expanding through travel, education, or a fundamental shift in perspective. The 9th house Sun seeks meaning beyond the familiar.',
  10: 'Career and public reputation are the priority. The 10th house Sun makes you more visible — professional responsibilities increase, but so does recognition.',
  11: 'Community, friendship, and collective purpose shape the year. The 11th house Sun redirects personal ambition toward something larger.',
  12: 'The most introspective placement. The 12th house Sun turns energy toward solitude, spiritual practice, and unconscious patterns. Rest and inner work are the curriculum.',
};

// ─── SR Moon by Sign ────────────────────────────────
const srMoonBody: Record<string, string> = {
  Aries: 'Your emotional landscape shifts toward directness and independence. The emotional body wants action, speed, and autonomy.',
  Taurus: 'Your emotional world craves stability, comfort, and sensory grounding. Feelings are processed slowly and deliberately.',
  Gemini: 'Your emotional processing becomes more verbal and social. Conversation and writing become emotional outlets.',
  Cancer: 'Emotional sensitivity deepens significantly. Intuition sharpens, and the need for emotional safety becomes non-negotiable.',
  Leo: 'Your emotional world warms and expands. The need to feel seen, appreciated, and creatively expressed intensifies.',
  Virgo: 'Your emotional processing becomes more analytical and service-oriented. Feelings are channeled into practical improvements.',
  Libra: 'Your emotional world seeks balance and harmony. Discord feels physically disruptive, and the pull toward partnership strengthens.',
  Scorpio: 'Your emotional world intensifies. Surface-level engagement becomes intolerable — you crave psychological honesty.',
  Sagittarius: 'Your emotional world opens. Restlessness increases, optimism grows, and routine feels suffocating.',
  Capricorn: 'Your emotional world becomes more disciplined and pragmatic. Emotional maturity deepens.',
  Aquarius: 'Your emotional processing becomes more detached and cerebral. You observe feelings from a slight distance, preferring clarity over intensity.',
  Pisces: 'Your emotional world becomes fluid and permeable. Boundaries thin, empathy deepens, and the unconscious sends vivid signals.',
};

// ─── SR Moon by House ───────────────────────────────
const srMoonHouseBody: Record<number, string> = {
  1: 'Your emotional needs are front and center — visible to everyone.',
  2: 'Emotional security is tied to finances and material stability.',
  3: 'You process emotions through conversation, writing, and thinking.',
  4: 'Home and family are the emotional center of the year.',
  5: 'Emotional fulfillment comes through creativity, romance, and play.',
  6: 'Emotional state directly affects physical health — body and mood are linked.',
  7: 'Emotional needs are met (or frustrated) through partnerships.',
  8: 'Deep emotional processing, intimacy, and shared vulnerability define the year.',
  9: 'Emotional growth through travel, study, or exposure to different worldviews.',
  10: 'Emotional investment in career and public role — your heart is at work.',
  11: 'Emotional fulfillment through friendships and community belonging.',
  12: 'Emotions are internalized. Solitude is needed for processing.',
};

// ─── SR Rising by Sign ──────────────────────────────
const srRisingBody: Record<string, string> = {
  Aries: 'Your public presence shifts toward boldness and initiative. Others perceive you as more courageous and action-oriented.',
  Taurus: 'Your public presence becomes more grounded, patient, and reliable. You feel most effective when building slowly.',
  Gemini: 'Your public presence becomes lighter and more verbally agile. You naturally become a connector of ideas and people.',
  Cancer: 'Your public presence softens and becomes more nurturing. Doors open through emotional intelligence.',
  Leo: 'Your public presence becomes more visible, warm, and magnetic. Hiding feels uncomfortable and counterproductive.',
  Virgo: 'Your public presence sharpens and becomes more purposeful. Competence and precision earn respect.',
  Libra: 'Your public presence becomes more diplomatic and partnership-oriented. Doors open through collaboration.',
  Scorpio: 'Your public presence deepens and becomes more intense. You carry a magnetic, transformative quality.',
  Sagittarius: 'Your public presence becomes more expansive and philosophical. Big ideas and enthusiasm open doors.',
  Capricorn: 'Your public presence becomes more authoritative and structured. Others naturally defer to your judgment.',
  Aquarius: 'Your public presence becomes more unconventional and forward-thinking. You attract opportunities through originality.',
  Pisces: 'Your public presence becomes gentler and more intuitive. Others sense your empathy and creative depth.',
};

// ─── Natal Moon ─────────────────────────────────────
const moonStrength: Record<string, string> = {
  Aries: 'Emotional reactions are fast, honest, and courageous. You process feelings through action.',
  Taurus: 'Emotional world is grounded and steady. You bring calm to chaos.',
  Gemini: 'You process feelings through talking, writing, and thinking.',
  Cancer: 'Emotional capacity is enormous. You feel everything deeply.',
  Leo: 'Emotional warmth lights up rooms. You process feelings through creative expression.',
  Virgo: 'You process emotions practically — knowing exactly what someone needs before they ask.',
  Libra: 'Emotional world seeks harmony. You process feelings through relationship and dialogue.',
  Scorpio: 'Emotional depth is extraordinary. You feel everything at full intensity.',
  Sagittarius: 'Emotional resilience is remarkable. You process feelings through meaning-making.',
  Capricorn: 'Emotional strength is quiet but immense. You carry responsibilities others cannot.',
  Aquarius: 'Emotional intelligence is innovative. You see patterns in feelings that others miss.',
  Pisces: 'Emotional sensitivity is a superpower. You absorb the emotional atmosphere of every space.',
};
const moonShadow: Record<string, string> = {
  Aries: 'Emotional impulsivity — reacting before processing. Anger as a default emotion.',
  Taurus: 'Emotional rigidity. Refusing to feel what is uncomfortable.',
  Gemini: 'Intellectualizing emotions to avoid feeling them.',
  Cancer: 'Emotional flooding, mood swings, and using guilt to maintain closeness.',
  Leo: 'Needing to be the emotional center of attention. Dramatizing feelings.',
  Virgo: 'Anxiety as the dominant emotional state. Self-criticism that erodes confidence.',
  Libra: 'Suppressing negative emotions to keep the peace.',
  Scorpio: 'Emotional intensity that overwhelms partners. Trust issues.',
  Sagittarius: 'Avoiding deep emotional processing by staying busy or leaving.',
  Capricorn: 'Suppressing emotions as weakness. Difficulty being vulnerable.',
  Aquarius: 'Detaching from emotions when they become inconvenient.',
  Pisces: 'Absorbing others emotions and losing yourself. Escapism.',
};

// ─── Natal Rising ───────────────────────────────────
const risingStrength: Record<string, string> = {
  Aries: 'People experience you as bold, direct, and energizing.',
  Taurus: 'People experience you as calm, reliable, and aesthetically aware.',
  Gemini: 'People experience you as quick, interesting, and mentally stimulating.',
  Cancer: 'People experience you as warm, approachable, and emotionally perceptive.',
  Leo: 'People experience you as radiant, confident, and generous.',
  Virgo: 'People experience you as competent, helpful, and thoughtfully observant.',
  Libra: 'People experience you as charming, balanced, and socially graceful.',
  Scorpio: 'People experience you as intense, magnetic, and deeply perceptive.',
  Sagittarius: 'People experience you as adventurous, honest, and inspiring.',
  Capricorn: 'People experience you as mature, capable, and quietly authoritative.',
  Aquarius: 'People experience you as unique, intellectually fascinating, and refreshingly unconventional.',
  Pisces: 'People experience you as gentle, intuitive, and creatively inspired.',
};
const risingShadow: Record<string, string> = {
  Aries: 'Can come across as aggressive, impatient, or self-centered without realizing it.',
  Taurus: 'Can appear stubborn, slow to engage, or overly materialistic.',
  Gemini: 'Can seem scattered, unreliable, or superficial.',
  Cancer: 'Can appear moody, clingy, or overly protective.',
  Leo: 'Can come across as attention-seeking, dramatic, or dominating conversations.',
  Virgo: 'Can appear critical, anxious, or overly cautious.',
  Libra: 'Can seem indecisive, people-pleasing, or conflict-avoidant.',
  Scorpio: 'Can appear intimidating, suspicious, or emotionally guarded.',
  Sagittarius: 'Can seem preachy, tactless, or unable to take things seriously.',
  Capricorn: 'Can appear cold, unapproachable, or overly serious.',
  Aquarius: 'Can seem detached, contrarian, or emotionally unavailable.',
  Pisces: 'Can appear vague, passive, or easily overwhelmed.',
};

export function generateStrengthsPortrait(
  ctx: PDFContext, doc: jsPDF, natalChart: NatalChart, analysis: SolarReturnAnalysis,
  srChart?: SolarReturnChart,
) {
  const { pw, margin, contentW } = ctx;
  const sunSign = natalChart.planets?.Sun?.sign || '';
  const moonSign = natalChart.planets?.Moon?.sign || '';
  const risingSign = natalChart.houseCusps?.house1?.sign || '';
  const srSunHouse = analysis.planetSRHouses?.['Sun'] || analysis.sunHouse?.house;
  const srMoonHouse = analysis.planetSRHouses?.['Moon'];
  const srAscSign = analysis.yearlyTheme?.ascendantSign || srChart?.planets?.Ascendant?.sign || '';
  const srMoonSign = analysis.moonSign || srChart?.planets?.Moon?.sign || '';
  const srSunSign = srChart?.planets?.Sun?.sign || sunSign;

  ctx.pageBg(doc);
  ctx.y += 8;

  // Section header
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('YOUR BIG THREE', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 6;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 22;

  doc.setFont('times', 'normal'); doc.setFontSize(24);
  doc.setTextColor(...INK);
  doc.text('The Natal-to-Return Shift', margin, ctx.y);
  ctx.y += 12;

  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('How this year activates your natal strengths', margin, ctx.y);
  ctx.y += 16;

  // ──────────────────────────────────────────────────
  // Shared renderer for each planet
  // ──────────────────────────────────────────────────
  const renderPlanet = (
    planetName: string,
    natalSign: string,
    srSign: string,
    srHouse: number | undefined,
    natalStrength: string,
    natalShadow: string,
    srBodyText: string,
    srHouseText: string,
  ) => {
    ctx.checkPage(160);

    // ── Header strip ──
    const stripH = 44;
    const stripY = ctx.y;
    const innerPad = 12;
    const rightPad = 14;
    const maxRightW = contentW * 0.35;
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, stripY, contentW, stripH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.roundedRect(margin, stripY, contentW, stripH, 3, 3, 'S');
    doc.setFillColor(...GOLD);
    doc.rect(margin, stripY, 3.5, stripH, 'F');

    // Planet label — top left
    doc.setFont('times', 'bold'); doc.setFontSize(6);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(3);
    doc.text(planetName.toUpperCase(), margin + innerPad, stripY + 12);
    doc.setCharSpace(0);

    // Natal sign — large heading left
    doc.setFont('times', 'bold'); doc.setFontSize(16);
    doc.setTextColor(...INK);
    doc.text(`${natalSign}`, margin + innerPad, stripY + 30);

    // SR placement — right side, use smaller font and constrain to box
    const srParts: string[] = [];
    if (srSign) srParts.push(srSign);
    if (srHouse) srParts.push(`${ord(srHouse)} House`);
    const srTagText = srParts.join(', ');

    if (srTagText) {
      // Position "THIS YEAR" label and value left of center, not right-aligned
      const srLabelX = margin + contentW * 0.5;
      doc.setFont('times', 'bold'); doc.setFontSize(6);
      doc.setTextColor(...GOLD);
      doc.setCharSpace(2);
      doc.text('THIS YEAR', srLabelX, stripY + 12);
      doc.setCharSpace(0);
      doc.setFont('times', 'bold'); doc.setFontSize(11);
      doc.setTextColor(...GOLD);
      doc.text(srTagText, srLabelX, stripY + 28);
    }

    // Shift arrow line
    if (srSign && srSign !== natalSign) {
      doc.setFont('times', 'normal'); doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`${natalSign}  -->  ${srSign}${srHouse ? ' H' + srHouse : ''}`, margin + innerPad, stripY + 40);
    } else if (srHouse) {
      doc.setFont('times', 'normal'); doc.setFontSize(8);
      doc.setTextColor(...MUTED);
      doc.text(`${natalSign} --> ${ord(srHouse)} House`, margin + innerPad, stripY + 40);
    }

    ctx.y = stripY + stripH + 8;

    // ── NATAL STRENGTH ──
    doc.setFont('times', 'bold'); doc.setFontSize(6);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(2);
    doc.text('NATAL STRENGTH', margin + 8, ctx.y);
    doc.setCharSpace(0);
    ctx.y += 9;
    ctx.writeBody(doc, natalStrength, INK, 8.5, 11);
    ctx.y += 4;

    // ── SHADOW ──
    doc.setFont('times', 'bold'); doc.setFontSize(6);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(2);
    doc.text('SHADOW', margin + 8, ctx.y);
    doc.setCharSpace(0);
    ctx.y += 9;
    ctx.writeBody(doc, natalShadow, INK, 8.5, 11);
    ctx.y += 4;

    // ── THIS YEAR'S ACTIVATION ──
    if (srBodyText) {
      doc.setFont('times', 'bold'); doc.setFontSize(6);
      doc.setTextColor(...GOLD);
      doc.setCharSpace(2);
      doc.text('THIS YEAR\'S ACTIVATION', margin + 8, ctx.y);
      doc.setCharSpace(0);
      ctx.y += 9;
      ctx.writeBody(doc, srBodyText, INK, 8.5, 11);
      ctx.y += 3;
    }

    // ── SR HOUSE FOCUS ──
    if (srHouseText && srHouse) {
      doc.setFont('times', 'bold'); doc.setFontSize(6);
      doc.setTextColor(...GOLD);
      doc.setCharSpace(2);
      doc.text(`${ord(srHouse).toUpperCase()} HOUSE FOCUS`, margin + 8, ctx.y);
      doc.setCharSpace(0);
      ctx.y += 9;
      ctx.writeBody(doc, srHouseText, INK, 8.5, 11);
    }

    ctx.y += 4;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.15);
    doc.line(margin + 20, ctx.y, pw - margin - 20, ctx.y);
    ctx.y += 10;
  };

  // ═══ SUN ═══
  if (sunSign && sunStrength[sunSign]) {
    renderPlanet(
      'Sun', sunSign, srSunSign, srSunHouse,
      sunStrength[sunSign], sunShadow[sunSign] || '',
      srSunHouse ? (srSunHouseBody[srSunHouse] || '') : '',
      srSunHouse ? (srMoonHouseBody[srSunHouse] || '') : '',
    );
  }

  // ═══ MOON ═══
  if (moonSign && moonStrength[moonSign]) {
    renderPlanet(
      'Moon', moonSign, srMoonSign, srMoonHouse,
      moonStrength[moonSign], moonShadow[moonSign] || '',
      srMoonBody[srMoonSign] || '',
      srMoonHouse ? (srMoonHouseBody[srMoonHouse] || '') : '',
    );
  }

  // ═══ RISING ═══
  if (risingSign && risingStrength[risingSign]) {
    renderPlanet(
      'Rising', risingSign, srAscSign, undefined,
      risingStrength[risingSign], risingShadow[risingSign] || '',
      srRisingBody[srAscSign] || '', '',
    );
  }

  ctx.sectionDivider(doc);
}
