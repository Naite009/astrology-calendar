import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';

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
const sunYearAhead: Record<number, string> = {
  1: 'Your identity is front and center. This is a year of personal reinvention.',
  2: 'Your strengths are channeled into building financial security and clarifying what you truly value.',
  3: 'Your gifts shine through communication -- writing, teaching, or conversations that change perspectives.',
  4: 'Your strengths serve your home and family -- building emotional foundations and creating sanctuary.',
  5: 'Creative gifts demand expression -- romance, art, children, and joyful risk-taking are the assignment.',
  6: 'Your strengths are applied to daily life -- health routines, work systems, and practical service.',
  7: 'Your gifts are activated through partnership -- what you bring to relationships defines the year.',
  8: 'Your strengths guide you through transformation -- deep change, shared resources, and psychological growth.',
  9: 'Your gifts expand through travel, education, and the search for meaning beyond your usual world.',
  10: 'Your strengths are visible to the world -- career advancement and public recognition are the theme.',
  11: 'Your gifts serve the collective -- friendships, community involvement, and shared purpose.',
  12: 'Your strengths work behind the scenes this year. Inner growth, spiritual practice, and healing take priority.',
};
const moonStrength: Record<string, string> = {
  Aries: 'Emotional reactions are fast, honest, and courageous. You process feelings through action.',
  Taurus: 'Emotional world is grounded and steady. You bring calm to chaos.',
  Gemini: 'You process feelings through talking, writing, and thinking.',
  Cancer: 'Emotional capacity is enormous. You feel everything deeply and your nurturing instinct is your greatest gift.',
  Leo: 'Emotional warmth lights up rooms. You process feelings through creative expression.',
  Virgo: 'You process emotions practically -- knowing exactly what someone needs before they ask.',
  Libra: 'Emotional world seeks harmony. You process feelings through relationship and dialogue.',
  Scorpio: 'Emotional depth is extraordinary. You feel everything at full intensity.',
  Sagittarius: 'Emotional resilience is remarkable. You process feelings through meaning-making and adventure.',
  Capricorn: 'Emotional strength is quiet but immense. You carry responsibilities others cannot.',
  Aquarius: 'Emotional intelligence is innovative. You see patterns in feelings that others miss.',
  Pisces: 'Emotional sensitivity is a superpower. You absorb the emotional atmosphere of every space.',
};
const moonShadow: Record<string, string> = {
  Aries: 'Emotional impulsivity -- reacting before processing. Anger as a default emotion.',
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
const moonYearAhead: Record<number, string> = {
  1: 'Emotional needs are front and center.',
  2: 'Emotional security is tied to finances and material stability this year.',
  3: 'Emotional processing happens through conversation and writing.',
  4: 'Home and family are the emotional center.',
  5: 'Emotional fulfillment comes through creativity, romance, and play.',
  6: 'Emotional state directly affects physical health.',
  7: 'Emotional needs are met (or frustrated) through partnerships.',
  8: 'Deep emotional processing, intimacy, and shared vulnerability define the year.',
  9: 'Emotional growth through travel, study, or exposure to different worldviews.',
  10: 'Emotional investment in career and public role.',
  11: 'Emotional fulfillment through friendships and community.',
  12: 'Emotions are internalized. Solitude is needed for processing.',
};
const srMoonSignActivation: Record<string, (natalSign: string) => string> = {
  Aries: (natal) => `Your SR Moon in Aries pushes your natal ${natal} Moon toward action and independence.`,
  Taurus: (natal) => `Your SR Moon in Taurus grounds your natal ${natal} Moon in physical comfort and stability.`,
  Gemini: (natal) => `Your SR Moon in Gemini activates your natal ${natal} Moon through communication.`,
  Cancer: (natal) => `Your SR Moon in Cancer amplifies your natal ${natal} Moon deepest needs.`,
  Leo: (natal) => `Your SR Moon in Leo activates your natal ${natal} Moon through creative self-expression.`,
  Virgo: (natal) => `Your SR Moon in Virgo channels your natal ${natal} Moon into practical service.`,
  Libra: (natal) => `Your SR Moon in Libra filters your natal ${natal} Moon through relationships.`,
  Scorpio: (natal) => `Your SR Moon in Scorpio intensifies your natal ${natal} Moon dramatically.`,
  Sagittarius: (natal) => `Your SR Moon in Sagittarius expands your natal ${natal} Moon toward adventure.`,
  Capricorn: (natal) => `Your SR Moon in Capricorn disciplines your natal ${natal} Moon. Emotions are managed through structure and achievement.`,
  Aquarius: (natal) => `Your SR Moon in Aquarius detaches your natal ${natal} Moon just enough to see patterns clearly.`,
  Pisces: (natal) => `Your SR Moon in Pisces dissolves boundaries around your natal ${natal} Moon. Intuition is heightened.`,
};
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
const risingYearAhead: Record<string, string> = {
  Aries: 'The year energy enters through bold action and initiative.',
  Taurus: 'The year unfolds slowly and deliberately.',
  Gemini: 'Communication drives the year.',
  Cancer: 'Emotional and domestic themes dominate.',
  Leo: 'The year demands creative self-expression and visibility.',
  Virgo: 'The year enters through detailed analysis and practical improvement.',
  Libra: 'Relationships are the gateway to the year.',
  Scorpio: 'The year enters through intensity, transformation, and depth.',
  Sagittarius: 'The year opens through expansion -- travel, education, or philosophical growth.',
  Capricorn: 'The year enters through structure, responsibility, and ambition.',
  Aquarius: 'The year opens through innovation, community, and breaking from convention.',
  Pisces: 'The year enters through intuition, creativity, and spiritual sensitivity.',
};

export function generateStrengthsPortrait(
  ctx: PDFContext, doc: jsPDF, natalChart: NatalChart, analysis: SolarReturnAnalysis
) {
  const { pw, margin, contentW } = ctx;
  const sunSign = natalChart.planets?.Sun?.sign || '';
  const moonSign = natalChart.planets?.Moon?.sign || '';
  const risingSign = natalChart.houseCusps?.house1?.sign || '';
  const srSunHouse = analysis.planetSRHouses?.['Sun'];
  const srMoonHouse = analysis.planetSRHouses?.['Moon'];
  const srAscSign = analysis.yearlyTheme?.ascendantSign || '';
  const srMoonSign = analysis.moonSign || '';

  // Force new page for this section
  ctx.pageBg(doc);
  ctx.y += 28;

  // Tracked label
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('YOUR BIG THREE', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 12;

  // Hairline
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 32;

  // Large serif display title
  doc.setFont('times', 'normal'); doc.setFontSize(32);
  doc.setTextColor(...INK);
  doc.text('The Natal-to-Return Shift', margin, ctx.y);
  ctx.y += 16;

  doc.setFont('times', 'italic'); doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text('How this year activates your natal strengths', margin, ctx.y);
  ctx.y += 30;

  // Compact rendering: All three planets on minimal pages
  // Each planet gets a header strip + condensed strength/shadow + year text
  const renderCompactPlanet = (
    planetLabel: string,
    natalTag: string,
    srTag: string,
    heading: string,
    strengthText: string,
    shadowText: string,
    yearLabel: string,
    yearText: string,
  ) => {
    ctx.checkPage(180);

    // Header strip — cream bg, no black
    const stripH = 48;
    const stripY = ctx.y;
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, stripY, contentW, stripH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.roundedRect(margin, stripY, contentW, stripH, 3, 3, 'S');

    // Gold accent bar on left
    doc.setFillColor(...GOLD);
    doc.rect(margin, stripY, 3, stripH, 'F');

    // Planet label in gold — bigger
    doc.setFont('times', 'bold'); doc.setFontSize(7.5);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(3);
    doc.text(planetLabel, margin + 14, stripY + 18);
    doc.setCharSpace(0);

    // Large heading — bigger font
    doc.setFont('times', 'bold'); doc.setFontSize(22);
    doc.setTextColor(...INK);
    doc.text(heading, margin + 14, stripY + 38);

    // Natal to SR tags on right — clean arrow
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...GOLD);
    const tagText = srTag ? `${natalTag}  -->  ${srTag}` : natalTag;
    doc.text(tagText, pw - margin - 14, stripY + 38, { align: 'right' });

    ctx.y = stripY + stripH + 18;

    // STRENGTH — condensed
    doc.setFont('times', 'bold'); doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(2);
    doc.text('STRENGTH', margin + 8, ctx.y);
    doc.setCharSpace(0);
    ctx.y += 12;
    ctx.writeBody(doc, strengthText, INK, 10, 14);
    ctx.y += 8;

    // SHADOW — condensed
    doc.setFont('times', 'bold'); doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(2);
    doc.text('SHADOW', margin + 8, ctx.y);
    doc.setCharSpace(0);
    ctx.y += 12;
    ctx.writeBody(doc, shadowText, INK, 10, 14);
    ctx.y += 8;

    // Year activation — inline, not nested card
    if (yearText) {
      doc.setFont('times', 'bold'); doc.setFontSize(7);
      doc.setTextColor(...GOLD);
      doc.setCharSpace(2);
      doc.text(yearLabel.toUpperCase(), margin + 8, ctx.y);
      doc.setCharSpace(0);
      ctx.y += 12;
      ctx.writeBody(doc, yearText, INK, 10, 14);
    }

    // Thin divider
    ctx.y += 8;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.15);
    doc.line(margin + 20, ctx.y, pw - margin - 20, ctx.y);
    ctx.y += 16;
  };

  // SUN
  if (sunSign && sunStrength[sunSign]) {
    const houseLabel = srSunHouse ? `SR ${ord(srSunHouse)} House` : '';
    renderCompactPlanet(
      `SUN IN ${sunSign.toUpperCase()}`,
      sunSign,
      houseLabel,
      `Sun in ${sunSign}`,
      sunStrength[sunSign],
      sunShadow[sunSign] || '',
      'What This Means For Your Year',
      srSunHouse ? (sunYearAhead[srSunHouse] || '') : '',
    );
  }

  // MOON
  if (moonSign && moonStrength[moonSign]) {
    const moonHouseLabel = srMoonHouse ? `SR ${ord(srMoonHouse)} House` : '';
    renderCompactPlanet(
      `MOON IN ${moonSign.toUpperCase()}`,
      moonSign,
      srMoonSign ? `${srMoonSign} Moon, ${moonHouseLabel}` : moonHouseLabel,
      `Moon in ${moonSign}`,
      moonStrength[moonSign],
      moonShadow[moonSign] || '',
      'Emotional Climate This Year',
      srMoonHouse ? (moonYearAhead[srMoonHouse] || '') : '',
    );
  }

  // RISING
  if (risingSign && risingStrength[risingSign]) {
    renderCompactPlanet(
      `RISING IN ${risingSign.toUpperCase()}`,
      risingSign,
      `${srAscSign} Rising`,
      `${risingSign} Rising`,
      risingStrength[risingSign],
      risingShadow[risingSign] || '',
      'How You Show Up This Year',
      risingYearAhead[srAscSign] || '',
    );
  }

  ctx.sectionDivider(doc);
}
