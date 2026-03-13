import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { NatalChart } from '@/hooks/useNatalChart';

/** Natal strengths portrait — grounded astrological summary of natal Big 3 */

const signElement: Record<string, string> = {
  Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
  Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
  Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water',
};

const sunCore: Record<string, string> = {
  Aries: 'Your essential nature is built on initiative, courage, and the drive to start what others only imagine. You lead by acting first.',
  Taurus: 'Your essential nature is built on steadiness, sensory awareness, and the patience to build things that endure. You know what lasts.',
  Gemini: 'Your essential nature is built on mental agility, curiosity, and the ability to make connections others miss. You think in networks.',
  Cancer: 'Your essential nature is built on emotional intelligence, protective instinct, and the ability to create emotional safety for the people around you.',
  Leo: 'Your essential nature is built on warmth, creative authority, and the capacity to make others feel celebrated. You lead by heart.',
  Virgo: 'Your essential nature is built on discernment, analytical precision, and the drive to improve everything you touch. You see what needs fixing.',
  Libra: 'Your essential nature is built on relational awareness, aesthetic intelligence, and the ability to hold opposing truths without collapsing into one.',
  Scorpio: 'Your essential nature is built on emotional depth, penetrating perception, and the refusal to accept anything at face value. You find what is hidden.',
  Sagittarius: 'Your essential nature is built on philosophical reach, restless honesty, and the need to find meaning in everything. You teach by living.',
  Capricorn: 'Your essential nature is built on strategic patience, structural thinking, and the ability to build legacies. You take the long view.',
  Aquarius: 'Your essential nature is built on original thinking, humanitarian awareness, and the ability to see systemic patterns others miss.',
  Pisces: 'Your essential nature is built on compassion, creative imagination, and profound sensitivity to what the world needs. You absorb and transmute.',
};

const moonGifts: Record<string, string> = {
  Aries: 'Your emotional reactions are fast, honest, and courageous. You process feelings through action — when something bothers you, you DO something about it.',
  Taurus: 'Your emotional world is grounded and steady. You bring calm to chaos. Others feel safe around you because your emotional presence is solid and warm.',
  Gemini: 'You process feelings through talking, writing, and thinking. Your emotional intelligence includes the rare gift of naming what you feel with precision.',
  Cancer: 'Your emotional capacity is enormous. You feel everything deeply and remember everything that matters. Your nurturing instinct is your greatest gift to others.',
  Leo: 'Your emotional warmth lights up rooms. You process feelings through creative expression and generosity. When you love, you love with your whole heart.',
  Virgo: 'You process emotions practically — by fixing, helping, and improving. Your emotional intelligence includes knowing exactly what someone needs before they ask.',
  Libra: 'Your emotional world seeks harmony and beauty. You process feelings through relationship and dialogue. Your gift is seeing both sides without losing your own center.',
  Scorpio: 'Your emotional depth is extraordinary. You feel everything at full intensity and your loyalty is absolute. Your gift is transforming pain into wisdom.',
  Sagittarius: 'Your emotional resilience is remarkable. You process feelings through meaning-making and adventure. Your optimism is not naivety — it is earned wisdom.',
  Capricorn: 'Your emotional strength is quiet but immense. You carry responsibilities others cannot. Your gift is showing up consistently, especially when it is hard.',
  Aquarius: 'Your emotional intelligence is innovative. You see patterns in feelings that others miss. Your gift is caring deeply about humanity while maintaining your independence.',
  Pisces: 'Your emotional sensitivity is a superpower. You absorb the feelings of others and reflect them back with compassion. Your gift is making people feel truly understood.',
};

const risingGifts: Record<string, string> = {
  Aries: 'People experience you as bold, direct, and energizing. You walk into a room and things start happening.',
  Taurus: 'People experience you as calm, reliable, and aesthetically aware. Your presence is grounding.',
  Gemini: 'People experience you as quick, interesting, and mentally stimulating. Conversations with you are never boring.',
  Cancer: 'People experience you as warm, approachable, and emotionally perceptive. People trust you instinctively.',
  Leo: 'People experience you as radiant, confident, and generous. You have a natural presence that draws attention.',
  Virgo: 'People experience you as competent, helpful, and thoughtfully observant. You notice what others miss.',
  Libra: 'People experience you as charming, balanced, and socially graceful. You put people at ease.',
  Scorpio: 'People experience you as intense, magnetic, and deeply perceptive. Your gaze sees through pretense.',
  Sagittarius: 'People experience you as adventurous, honest, and inspiring. Your enthusiasm is contagious.',
  Capricorn: 'People experience you as mature, capable, and quietly authoritative. People respect you immediately.',
  Aquarius: 'People experience you as unique, intellectually fascinating, and refreshingly unconventional.',
  Pisces: 'People experience you as gentle, intuitive, and creatively inspired. You have an otherworldly quality.',
};

export function generateStrengthsPortrait(
  ctx: PDFContext, doc: jsPDF, natalChart: NatalChart
) {
  const { pw, margin, contentW, colors } = ctx;
  const name = natalChart.name || 'You';
  const sunSign = natalChart.planets?.Sun?.sign || '';
  const moonSign = natalChart.planets?.Moon?.sign || '';
  const risingSign = natalChart.houseCusps?.house1?.sign || '';

  // Combined intro with affirmation at top
  doc.setDrawColor(...colors.gold); doc.setLineWidth(2);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 24;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.setTextColor(...colors.gold);
  doc.text('YOUR NATAL FOUNDATION', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 6;
  doc.setLineWidth(0.5); doc.line(pw / 2 - 50, ctx.y, pw / 2 + 50, ctx.y);
  ctx.y += 18;

  // Affirmation line at top — combines old bottom box with intro
  doc.setFillColor(...colors.softGold);
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1);
  doc.roundedRect(margin + 10, ctx.y, contentW - 20, 40, 6, 6, 'FD');
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10);
  doc.setTextColor(...colors.deepBrown);
  const affirmText = `These are the gifts ${name} was born with. The year ahead shows new ways to use them.`;
  const affirmLines = doc.splitTextToSize(affirmText, contentW - 60);
  affirmLines.forEach((line: string, i: number) => {
    doc.text(line, pw / 2, ctx.y + 18 + i * 13, { align: 'center' });
  });
  ctx.y += 52;

  // Sun
  if (sunSign && sunCore[sunSign]) {
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, `Sun in ${sunSign}`, colors.gold, 12);
      ctx.y += 4;
      ctx.writeBody(doc, sunCore[sunSign], colors.bodyText, 10);
    });
  }

  // Moon
  if (moonSign && moonGifts[moonSign]) {
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, `Moon in ${moonSign}`, colors.gold, 12);
      ctx.y += 4;
      ctx.writeBody(doc, moonGifts[moonSign], colors.bodyText, 10);
    });
  }

  // Rising
  if (risingSign && risingGifts[risingSign]) {
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, `${risingSign} Rising`, colors.gold, 12);
      ctx.y += 4;
      ctx.writeBody(doc, risingGifts[risingSign], colors.bodyText, 10);
    });
  }

  ctx.y += 10;
}
