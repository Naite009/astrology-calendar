import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { NatalChart } from '@/hooks/useNatalChart';

/** Your Strengths & This Year — natal Big 3 with SR house context */

const signElement: Record<string, string> = {
  Aries: 'fire', Taurus: 'earth', Gemini: 'air', Cancer: 'water',
  Leo: 'fire', Virgo: 'earth', Libra: 'air', Scorpio: 'water',
  Sagittarius: 'fire', Capricorn: 'earth', Aquarius: 'air', Pisces: 'water',
};

const sunCore: Record<string, string> = {
  Aries: 'Your essential nature is built on initiative, courage, and the drive to start what others only imagine.',
  Taurus: 'Your essential nature is built on steadiness, sensory awareness, and the patience to build things that endure.',
  Gemini: 'Your essential nature is built on mental agility, curiosity, and the ability to make connections others miss.',
  Cancer: 'Your essential nature is built on emotional intelligence, protective instinct, and the ability to create safety for others.',
  Leo: 'Your essential nature is built on warmth, creative authority, and the capacity to make others feel celebrated.',
  Virgo: 'Your essential nature is built on discernment, analytical precision, and the drive to improve everything you touch.',
  Libra: 'Your essential nature is built on relational awareness, aesthetic intelligence, and the ability to hold opposing truths.',
  Scorpio: 'Your essential nature is built on emotional depth, penetrating perception, and the refusal to accept anything at face value.',
  Sagittarius: 'Your essential nature is built on philosophical reach, restless honesty, and the need to find meaning in everything.',
  Capricorn: 'Your essential nature is built on strategic patience, structural thinking, and the ability to build legacies.',
  Aquarius: 'Your essential nature is built on original thinking, humanitarian awareness, and the ability to see systemic patterns.',
  Pisces: 'Your essential nature is built on compassion, creative imagination, and profound sensitivity to what the world needs.',
};

const sunYearAhead: Record<number, string> = {
  1: 'This year your identity is front and center — use your natural strengths to reinvent how you show up in the world.',
  2: 'This year your strengths are channeled into building financial security and clarifying what you truly value.',
  3: 'This year your gifts shine through communication — writing, teaching, or conversations that change perspectives.',
  4: 'This year your strengths serve your home and family — building emotional foundations and creating sanctuary.',
  5: 'This year your creative gifts demand expression — romance, art, and joyful risk-taking are the assignment.',
  6: 'This year your strengths are applied to daily life — health routines, work systems, and practical service.',
  7: 'This year your gifts are activated through partnership — what you bring to relationships defines the year.',
  8: 'This year your strengths guide you through transformation — deep change, shared resources, and psychological growth.',
  9: 'This year your gifts expand through travel, education, and the search for meaning beyond your usual world.',
  10: 'This year your strengths are visible to the world — career advancement and public recognition are the theme.',
  11: 'This year your gifts serve the collective — friendships, community involvement, and shared purpose.',
  12: 'This year your strengths work quietly — inner growth, spiritual practice, and healing behind the scenes.',
};

const moonGifts: Record<string, string> = {
  Aries: 'Your emotional reactions are fast, honest, and courageous. You process feelings through action.',
  Taurus: 'Your emotional world is grounded and steady. You bring calm to chaos and make others feel safe.',
  Gemini: 'You process feelings through talking, writing, and thinking — naming what you feel with precision.',
  Cancer: 'Your emotional capacity is enormous. You feel everything deeply and your nurturing instinct is your greatest gift.',
  Leo: 'Your emotional warmth lights up rooms. You process feelings through creative expression and generosity.',
  Virgo: 'You process emotions practically — knowing exactly what someone needs before they ask.',
  Libra: 'Your emotional world seeks harmony. You process feelings through relationship and dialogue.',
  Scorpio: 'Your emotional depth is extraordinary. You feel everything at full intensity and your loyalty is absolute.',
  Sagittarius: 'Your emotional resilience is remarkable. You process feelings through meaning-making and adventure.',
  Capricorn: 'Your emotional strength is quiet but immense. You carry responsibilities others cannot.',
  Aquarius: 'Your emotional intelligence is innovative. You see patterns in feelings that others miss.',
  Pisces: 'Your emotional sensitivity is a superpower. You make people feel truly understood.',
};

const risingGifts: Record<string, string> = {
  Aries: 'People experience you as bold, direct, and energizing. You walk into a room and things start happening.',
  Taurus: 'People experience you as calm, reliable, and aesthetically aware. Your presence is grounding.',
  Gemini: 'People experience you as quick, interesting, and mentally stimulating.',
  Cancer: 'People experience you as warm, approachable, and emotionally perceptive. People trust you instinctively.',
  Leo: 'People experience you as radiant, confident, and generous. You have a natural presence that draws attention.',
  Virgo: 'People experience you as competent, helpful, and thoughtfully observant.',
  Libra: 'People experience you as charming, balanced, and socially graceful.',
  Scorpio: 'People experience you as intense, magnetic, and deeply perceptive.',
  Sagittarius: 'People experience you as adventurous, honest, and inspiring.',
  Capricorn: 'People experience you as mature, capable, and quietly authoritative.',
  Aquarius: 'People experience you as unique, intellectually fascinating, and refreshingly unconventional.',
  Pisces: 'People experience you as gentle, intuitive, and creatively inspired.',
};

export function generateStrengthsPortrait(
  ctx: PDFContext, doc: jsPDF, natalChart: NatalChart, srSunHouse?: number
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

  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.setTextColor(...colors.gold);
  doc.text('YOUR STRENGTHS & THIS YEAR', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 6;
  doc.setLineWidth(0.5); doc.line(pw / 2 - 50, ctx.y, pw / 2 + 50, ctx.y);
  ctx.y += 18;

  // Intro
  doc.setFillColor(...colors.softGold);
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1);
  doc.roundedRect(margin + 10, ctx.y, contentW - 20, 40, 6, 6, 'FD');
  doc.setFont('helvetica', 'italic'); doc.setFontSize(10);
  doc.setTextColor(...colors.deepBrown);
  const affirmText = `These are the strengths ${name} was born with — and how the year ahead activates them.`;
  const affirmLines = doc.splitTextToSize(affirmText, contentW - 60);
  affirmLines.forEach((line: string, i: number) => {
    doc.text(line, pw / 2, ctx.y + 18 + i * 13, { align: 'center' });
  });
  ctx.y += 52;

  // Sun — with SR house context
  if (sunSign && sunCore[sunSign]) {
    ctx.drawCard(doc, () => {
      const houseLabel = srSunHouse ? ` (SR House ${srSunHouse})` : '';
      ctx.writeBold(doc, `Sun in ${sunSign}${houseLabel}`, colors.gold, 12);
      ctx.y += 4;
      ctx.writeBody(doc, sunCore[sunSign], colors.bodyText, 10);
      if (srSunHouse && sunYearAhead[srSunHouse]) {
        ctx.y += 4;
        ctx.writeCardSection(doc, 'This Year', sunYearAhead[srSunHouse], colors.accentGreen);
      }
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
