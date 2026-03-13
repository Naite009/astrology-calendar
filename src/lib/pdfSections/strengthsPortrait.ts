import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { NatalChart } from '@/hooks/useNatalChart';

/** Natal strengths portrait — what makes THIS person special */

const signGifts: Record<string, string> = {
  Aries: 'courage, initiative, and the ability to start what others only dream about',
  Taurus: 'steadiness, sensory wisdom, and the patience to build things that last',
  Gemini: 'mental agility, curiosity, and the gift of making connections others miss',
  Cancer: 'emotional intelligence, nurturing instinct, and the ability to create safety for others',
  Leo: 'warmth, creative fire, and the ability to make people feel seen and celebrated',
  Virgo: 'discernment, practical intelligence, and the ability to improve everything you touch',
  Libra: 'grace, diplomatic skill, and the ability to create beauty and harmony from chaos',
  Scorpio: 'emotional depth, transformative power, and the ability to see what others hide',
  Sagittarius: 'optimism, philosophical wisdom, and the ability to find meaning in everything',
  Capricorn: 'discipline, strategic vision, and the ability to build lasting legacies',
  Aquarius: 'originality, humanitarian vision, and the ability to see the future before others do',
  Pisces: 'compassion, creative imagination, and the ability to feel what the world needs',
};

const moonGifts: Record<string, string> = {
  Aries: 'Your emotional reactions are fast, honest, and courageous. You process feelings through action — when something bothers you, you DO something about it.',
  Taurus: 'Your emotional world is grounded and steady. You bring calm to chaos. Others feel safe around you because your emotional presence is solid and warm.',
  Gemini: 'You process feelings through talking, writing, and thinking. Your emotional intelligence includes the rare gift of being able to NAME what you feel with precision.',
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

  // Title
  doc.setDrawColor(...colors.gold); doc.setLineWidth(2);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 24;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.setTextColor(...colors.gold);
  doc.text(`WHAT MAKES ${name.toUpperCase()} EXTRAORDINARY`, pw / 2, ctx.y, { align: 'center' });
  ctx.y += 8;
  doc.setLineWidth(0.5); doc.line(pw / 2 - 60, ctx.y, pw / 2 + 60, ctx.y);
  ctx.y += 20;

  // Intro
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10.5);
  doc.setTextColor(...colors.bodyText);
  const intro = `Before we look at the year ahead, let's ground this in who ${name} actually IS. These are the gifts you were born with — the foundation that every Solar Return year builds upon.`;
  const introLines = doc.splitTextToSize(intro, contentW - 16);
  introLines.forEach((line: string) => { doc.text(line, margin + 8, ctx.y); ctx.y += 14; });
  ctx.y += 12;

  // Sun
  if (sunSign && signGifts[sunSign]) {
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, `Sun in ${sunSign} — Your Core Identity`, colors.gold, 12);
      ctx.y += 4;
      ctx.writeBody(doc, `Your essential nature is built on ${signGifts[sunSign]}. This is not something you have to develop — it is who you ARE. Every achievement in your life traces back to this core fire.`, colors.bodyText, 10);
    });
  }

  // Moon
  if (moonSign && moonGifts[moonSign]) {
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, `Moon in ${moonSign} — Your Emotional Genius`, colors.gold, 12);
      ctx.y += 4;
      ctx.writeBody(doc, moonGifts[moonSign], colors.bodyText, 10);
    });
  }

  // Rising
  if (risingSign && risingGifts[risingSign]) {
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, `${risingSign} Rising — How the World Sees You`, colors.gold, 12);
      ctx.y += 4;
      ctx.writeBody(doc, risingGifts[risingSign], colors.bodyText, 10);
    });
  }

  // Closing affirmation
  ctx.y += 10;
  doc.setFillColor(...colors.softGold);
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1.5);
  doc.roundedRect(margin + 20, ctx.y, contentW - 40, 50, 8, 8, 'FD');
  doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(11);
  doc.setTextColor(...colors.deepBrown);
  const affirmText = `${name}, these gifts are yours for life. The year ahead shows you new ways to USE them.`;
  const affirmLines = doc.splitTextToSize(affirmText, contentW - 80);
  affirmLines.forEach((line: string, i: number) => {
    doc.text(line, pw / 2, ctx.y + 22 + i * 15, { align: 'center' });
  });
  ctx.y += 60;
}
