import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';

/**
 * Birthday Affirmation Card — a standalone frameable page
 */

const signAffirmations: Record<string, string> = {
  Aries: 'I trust my courage. I act on what matters. The fire within me lights the way forward.',
  Taurus: 'I am rooted in my own worth. What I build with patience becomes permanent.',
  Gemini: 'My curiosity is a gift. Every conversation opens a door. My mind is my greatest tool.',
  Cancer: 'My sensitivity is my strength. The love I give returns to me tenfold.',
  Leo: 'I shine without apology. My creative fire warms everyone around me.',
  Virgo: 'My attention to detail is sacred. I improve everything I touch with love.',
  Libra: 'I create harmony wherever I go. My sense of beauty transforms the ordinary.',
  Scorpio: 'My depth is my power. I am not afraid of the truth — it sets me free.',
  Sagittarius: 'My quest for meaning is never wasted. Every experience teaches me something essential.',
  Capricorn: 'My discipline is my freedom. What I build with integrity stands the test of time.',
  Aquarius: 'My uniqueness is my contribution. The future I envision is already becoming real.',
  Pisces: 'My compassion heals. My imagination creates worlds. I trust the current that carries me.',
};

const profectionAffirmations: Record<number, string> = {
  1: 'This year, I choose myself. I am allowed to start again.',
  2: 'This year, I claim my worth. My resources are enough.',
  3: 'This year, I speak my truth. My words carry power.',
  4: 'This year, I build my sanctuary. Home is where I am.',
  5: 'This year, I create with joy. My heart leads the way.',
  6: 'This year, I honor my body. Small acts of care are revolutionary.',
  7: 'This year, I open to partnership. I am worthy of being met fully.',
  8: 'This year, I release what no longer serves me. Transformation is my birthright.',
  9: 'This year, I expand. My world is bigger than I thought possible.',
  10: 'This year, I step into my authority. The world is ready for what I bring.',
  11: 'This year, I find my people. Together, we build something meaningful.',
  12: 'This year, I rest without guilt. What I release makes room for miracles.',
};

export function generateAffirmationCard(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, natalChart: NatalChart
) {
  const { pw, ph, margin, contentW, colors } = ctx;
  const name = natalChart.name || 'Beautiful Soul';
  const sunSign = natalChart.planets?.Sun?.sign || '';
  const houseNum = a.profectionYear?.houseNumber || 1;

  // Start a fresh page — this is designed to be cut out / framed
  ctx.checkPage(ph);

  // Outer decorative frame
  doc.setDrawColor(...colors.gold); doc.setLineWidth(3);
  doc.roundedRect(30, 30, pw - 60, ph - 60, 12, 12, 'S');
  doc.setLineWidth(1);
  doc.roundedRect(36, 36, pw - 72, ph - 72, 10, 10, 'S');

  // Inner soft background
  doc.setFillColor(...colors.softGold);
  doc.roundedRect(50, 50, pw - 100, ph - 100, 8, 8, 'F');

  // Stars / decorative dots at top
  doc.setFillColor(...colors.gold);
  const starY = 80;
  [pw / 2 - 60, pw / 2 - 30, pw / 2, pw / 2 + 30, pw / 2 + 60].forEach(x => {
    doc.circle(x, starY, 2, 'F');
  });

  // "For" label
  let cardY = 120;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(11);
  doc.setTextColor(...colors.dimText);
  doc.text('A Birthday Affirmation for', pw / 2, cardY, { align: 'center' });
  cardY += 30;

  // Name
  doc.setFont('helvetica', 'bold'); doc.setFontSize(28);
  doc.setTextColor(...colors.gold);
  doc.text(name.toUpperCase(), pw / 2, cardY, { align: 'center' });
  cardY += 12;

  // Decorative line
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1);
  doc.line(pw / 2 - 80, cardY, pw / 2 + 80, cardY);
  cardY += 40;

  // Sign affirmation
  const signAff = signAffirmations[sunSign] || 'I trust my path. Every step forward is the right one.';
  doc.setFont('helvetica', 'bolditalic'); doc.setFontSize(16);
  doc.setTextColor(...colors.deepBrown);
  const signLines = doc.splitTextToSize(`"${signAff}"`, contentW - 80);
  signLines.forEach((line: string) => {
    doc.text(line, pw / 2, cardY, { align: 'center' });
    cardY += 24;
  });
  cardY += 20;

  // Profection affirmation
  const profAff = profectionAffirmations[houseNum] || profectionAffirmations[1];
  doc.setFont('helvetica', 'italic'); doc.setFontSize(13);
  doc.setTextColor(...colors.bodyText);
  const profLines = doc.splitTextToSize(profAff, contentW - 100);
  profLines.forEach((line: string) => {
    doc.text(line, pw / 2, cardY, { align: 'center' });
    cardY += 20;
  });
  cardY += 30;

  // Zodiac badge
  doc.setFillColor(...colors.gold);
  doc.circle(pw / 2, cardY, 30, 'F');
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(sunSign.substring(0, 3).toUpperCase(), pw / 2, cardY + 5, { align: 'center' });
  cardY += 50;

  // Year info
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  doc.setTextColor(...colors.dimText);
  const yearText = `House ${houseNum} Profection Year  --  Age ${a.profectionYear?.age || '--'}`;
  doc.text(yearText, pw / 2, cardY, { align: 'center' });
  cardY += 16;
  doc.text(`Time Lord: ${a.profectionYear?.timeLord || '--'}`, pw / 2, cardY, { align: 'center' });

  // Bottom stars
  const bottomStarY = ph - 80;
  doc.setFillColor(...colors.gold);
  [pw / 2 - 60, pw / 2 - 30, pw / 2, pw / 2 + 30, pw / 2 + 60].forEach(x => {
    doc.circle(x, bottomStarY, 2, 'F');
  });

  // Set y past this page
  ctx.y = ph;
}
