import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { P } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const GOLD:  Color = [184, 150, 62];
const RULE:  Color = [200, 195, 188];
const CARD_BG: Color = [245, 241, 234];
const CHARCOAL: Color = [58, 54, 50];

const PROFECTION_DEEP: Record<number, string> = {
  1: 'House 1 profection years are the most personal. Your body, appearance, health, and sense of identity are the focal point.',
  2: 'House 2 profection years center on money, material security, and self-worth. Financial decisions set the tone for years to come.',
  3: 'House 3 profection years activate your mind, communication, and immediate environment. Ideas carry unusual weight.',
  4: 'House 4 profection years bring focus to home, family, roots, and emotional foundations.',
  5: 'House 5 profection years activate creativity, romance, children, and self-expression. Joy is the curriculum.',
  6: 'House 6 profection years focus on daily routines, physical health, and work. The mundane is the spiritual path.',
  7: 'House 7 profection years are defined by partnerships and one-on-one relationships.',
  8: 'House 8 profection years bring intensity, transformation, and encounters with shared resources.',
  9: 'House 9 profection years expand your world through travel, education, or philosophical exploration.',
  10: 'House 10 profection years put career, public reputation, and legacy in the spotlight.',
  11: 'House 11 profection years activate friendships, community, and collective purpose.',
  12: 'House 12 profection years are the most deeply internal. Solitude and spiritual practice are the focus.',
};

const TIME_LORD_ENERGY: Record<string, string> = {
  Sun: 'Your IDENTITY is the story. Everything filters through: who am I becoming?',
  Moon: 'This is fundamentally an EMOTIONAL year. Your feelings are the primary navigation system.',
  Mercury: 'Your MIND is at the center. How you think and communicate determines the quality of the year.',
  Venus: 'This is a year about LOVE, VALUES, and BEAUTY. Relationships are the primary arena.',
  Mars: 'Raw ENERGY, DRIVE, and potentially CONFLICT. You have more fuel than usual.',
  Jupiter: 'EXPANSION, OPPORTUNITY, and GROWTH are the themes. Doors open.',
  Saturn: 'A SERIOUS year. Structures are tested. Shortcuts fail. What is real survives.',
  Uranus: 'DISRUPTION, INNOVATION, and sudden change. Plans may be overturned.',
  Neptune: 'Boundaries dissolve between real and imagined. Creativity and intuition heightened.',
  Pluto: 'Deep TRANSFORMATION and encounters with power. Something is being fundamentally restructured.',
};

const TIME_LORD_POWER_MOVE: Record<string, string> = {
  Sun: 'Step into the spotlight deliberately. Be the main character — not for performance, but for real.',
  Moon: 'Trust your instincts over logic this year. What you feel is more accurate than what you think.',
  Mercury: 'Write it down. Say it out loud. The clarity you need comes through communication.',
  Venus: 'Invest in what you genuinely love — people, experiences, beauty. The returns are real.',
  Mars: 'Channel the energy into one clear project or goal. Scattered aggression costs; focused drive wins.',
  Jupiter: 'Say yes to the thing that scares you a little. Overreach is the only real risk.',
  Saturn: 'Do the hard thing first. Every morning. Build the structure your future self will thank you for.',
  Uranus: 'Stay flexible. The detour is the point. Trust the disruption.',
  Neptune: 'Create something. Meditate. Trust what you cannot yet prove.',
  Pluto: 'Let something die. Resistance is the only thing that makes transformation painful.',
};

const HOUSE_FOCUS: Record<number, string> = {
  1: 'Identity & Self', 2: 'Money & Values', 3: 'Communication', 4: 'Home & Family',
  5: 'Creativity & Love', 6: 'Health & Daily Work', 7: 'Partnerships',
  8: 'Transformation', 9: 'Travel & Learning', 10: 'Career & Legacy',
  11: 'Friends & Community', 12: 'Spirituality & Inner Work',
};

function ord(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function generateProfectionPersonalSection(
  ctx: PDFContext, doc: jsPDF,
  houseNumber: number, timeLord: string, age: number,
  timeLordSRHouse: number | null, timeLordSRSign: string
) {
  const { pw, margin, contentW } = ctx;
  const tlName = P[timeLord] || timeLord;

  ctx.pageBg(doc);

  // ── Magazine editorial header with extra top padding ──
  ctx.y += 36;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('THE TIME LORD', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 12;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 32;

  // ── Large serif display: "Lord of the Year" ──
  doc.setFont('times', 'normal'); doc.setFontSize(36);
  doc.setTextColor(...INK);
  doc.text('Lord of the Year', margin, ctx.y);
  ctx.y += 46;

  // ── HERO CARD: cream bg with charcoal border (no black) ──
  const heroH = 100;
  const heroY = ctx.y;
  doc.setFillColor(...CARD_BG);
  doc.roundedRect(margin, heroY, contentW, heroH, 4, 4, 'F');
  doc.setDrawColor(...CHARCOAL); doc.setLineWidth(0.5);
  doc.roundedRect(margin, heroY, contentW, heroH, 4, 4, 'S');
  doc.setFillColor(...GOLD);
  doc.rect(margin, heroY, contentW, 2.5, 'F');

  let hy = heroY + 30;
  doc.setFont('times', 'bold'); doc.setFontSize(42);
  doc.setTextColor(...CHARCOAL);
  doc.text(tlName, margin + 22, hy);

  // Right-aligned details
  doc.setFont('times', 'normal'); doc.setFontSize(9);
  doc.setTextColor(...GOLD);
  doc.text(`${ord(houseNumber)} House Profection Year → Age ${age}`, pw - margin - 22, heroY + 24, { align: 'right' });
  doc.text(HOUSE_FOCUS[houseNumber] || '', pw - margin - 22, heroY + 38, { align: 'right' });

  if (timeLordSRHouse && timeLordSRSign) {
    doc.text(`SR House ${timeLordSRHouse} → ${timeLordSRSign}`, pw - margin - 22, heroY + 52, { align: 'right' });
  }

  // THE ENERGY
  hy += 22;
  doc.setFont('times', 'bold'); doc.setFontSize(6.5);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(2);
  doc.text('THE ENERGY', margin + 22, hy);
  doc.setCharSpace(0);
  hy += 12;
  doc.setFont('times', 'normal'); doc.setFontSize(10);
  doc.setTextColor(...INK);
  const energyText = TIME_LORD_ENERGY[timeLord] || `${tlName} sets the agenda for the year.`;
  const eLines: string[] = doc.splitTextToSize(energyText, contentW - 44);
  for (const l of eLines.slice(0, 2)) { doc.text(l, margin + 22, hy); hy += 14; }

  ctx.y = heroY + heroH + 26;

  // ── THE POWER MOVE — pull-quote style ──
  ctx.checkPage(80);
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.6);
  doc.line(margin + 4, ctx.y, margin + 4, ctx.y + 36);

  doc.setFont('times', 'bold'); doc.setFontSize(6.5);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(2);
  doc.text('THE POWER MOVE', margin + 16, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 16;

  doc.setFont('times', 'italic'); doc.setFontSize(13);
  doc.setTextColor(...INK);
  const pmText = TIME_LORD_POWER_MOVE[timeLord] || 'Pay attention to what this planet demands.';
  const pmLines: string[] = doc.splitTextToSize(pmText, contentW - 30);
  for (const l of pmLines.slice(0, 2)) { doc.text(l, margin + 16, ctx.y); ctx.y += 18; }
  ctx.y += 20;

  // ── House deep dive — editorial body text ──
  if (PROFECTION_DEEP[houseNumber]) {
    ctx.checkPage(80);
    doc.setFont('times', 'bold'); doc.setFontSize(7);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(2);
    doc.text('THE PROFECTION HOUSE', margin, ctx.y);
    doc.setCharSpace(0);
    ctx.y += 16;

    doc.setFont('times', 'normal'); doc.setFontSize(11);
    doc.setTextColor(...INK);
    const lines: string[] = doc.splitTextToSize(PROFECTION_DEEP[houseNumber], contentW);
    for (const line of lines) {
      ctx.checkPage(18);
      doc.text(line, margin, ctx.y);
      ctx.y += 17;
    }
    ctx.y += 14;
  }

  // ── WHY [PLANET] IS YOUR TIME LORD ──
  ctx.checkPage(80);
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(2);
  doc.text(`WHY ${tlName.toUpperCase()} IS YOUR TIME LORD`, margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 16;

  doc.setFont('times', 'normal'); doc.setFontSize(11);
  doc.setTextColor(...INK);
  const whyText = `Your natal ${ord(houseNumber)} house cusp falls in a sign ruled by ${tlName}. In Hellenistic astrology, the planet that rules the sign on your activated profection house cusp becomes the "Time Lord" — the planet whose agenda dominates the year.`;
  const whyLines: string[] = doc.splitTextToSize(whyText, contentW);
  for (const line of whyLines) {
    ctx.checkPage(18);
    doc.text(line, margin, ctx.y);
    ctx.y += 17;
  }
  ctx.y += 10;

  // ── Where Time Lord sits in SR ──
  if (timeLordSRHouse && timeLordSRSign) {
    ctx.checkPage(60);
    const houseArea = timeLordSRHouse === 1 ? 'your identity and personal presentation' : timeLordSRHouse === 2 ? 'finances and values' : timeLordSRHouse === 3 ? 'communication and learning' : timeLordSRHouse === 4 ? 'home and family' : timeLordSRHouse === 5 ? 'creativity, romance, and self-expression' : timeLordSRHouse === 6 ? 'daily routines and health' : timeLordSRHouse === 7 ? 'partnerships and relationships' : timeLordSRHouse === 8 ? 'transformation and shared resources' : timeLordSRHouse === 9 ? 'travel, education, and beliefs' : timeLordSRHouse === 10 ? 'career and public reputation' : timeLordSRHouse === 11 ? 'friendships and community' : 'solitude and inner work';

    ctx.drawCard(doc, () => {
      ctx.trackedLabel(doc, `${tlName.toUpperCase()} IN SR HOUSE ${timeLordSRHouse}`, margin + 14, ctx.y, { size: 7 });
      ctx.y += 16;
      doc.setFont('times', 'bold'); doc.setFontSize(14);
      doc.setTextColor(...INK);
      doc.text(`${timeLordSRSign} → ${ord(timeLordSRHouse)} House`, margin + 14, ctx.y);
      ctx.y += 20;
      doc.setFont('times', 'normal'); doc.setFontSize(11);
      doc.setTextColor(...INK);
      const srText = `The Time Lord's agenda plays out primarily through ${houseArea}. Watch this area of life for the year's defining moments.`;
      const srLines: string[] = doc.splitTextToSize(srText, contentW - 28);
      for (const line of srLines) { doc.text(line, margin + 14, ctx.y); ctx.y += 17; }
    });
  }

  // Bottom rule
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 10;
}
