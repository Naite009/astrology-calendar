import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';

type Color = [number, number, number];

const CREAM: Color = [250, 247, 242];
const INK: Color = [18, 16, 14];
const MUTED: Color = [130, 125, 118];
const GOLD: Color = [184, 150, 62];
const RULE: Color = [200, 195, 188];
const DARK: Color = [38, 34, 30];

const saturnPullQuote: Record<number, string> = {
  1: 'You are the project.', 2: 'Earn your own worth.', 3: 'Say only what is true.',
  4: 'Build the real foundation.', 5: 'Create without applause.', 6: 'Master the daily discipline.',
  7: 'Commit or walk away.', 8: 'Face what you owe.', 9: 'Earn your philosophy.',
  10: 'Carry the mantle.', 11: 'Serve the collective.', 12: 'Confront the invisible.',
};

const nodePullQuote: Record<number, string> = {
  1: 'Choose yourself.', 2: 'Trust your own worth.', 3: 'Stay curious.',
  4: 'Come home to yourself.', 5: 'Let yourself be seen.', 6: 'Serve with precision.',
  7: 'Learn to partner.', 8: 'Go deeper.', 9: 'Expand your world.',
  10: 'Step into authority.', 11: 'Think bigger than you.', 12: 'Trust the unseen.',
};

const saturnBody: Record<number, string> = {
  1: 'Identity is being restructured. You feel heavier, more serious. The gift: self-authority no one can take.',
  2: 'Finances and values are under the microscope. Build real security through discipline, not comfort-seeking.',
  3: 'Communication demands precision. Contracts and daily interactions require depth and accountability.',
  4: 'Home and family carry weight. Build genuine emotional foundations, not inherited patterns.',
  5: 'Creative confidence is tested. The work: creating something real without needing applause.',
  6: 'Daily routines and health are audited. Rebuild from the ground up, one habit at a time.',
  7: 'Partnerships demand accountability. Those built on genuine commitment strengthen.',
  8: 'Shared resources and emotional debts surface. Financial entanglements require honest renegotiation.',
  9: 'Beliefs are tested against reality. Wisdom is earned through experience, not enthusiasm.',
  10: 'Career and reputation carry full weight. Authority is earned through consistent, visible effort.',
  11: 'Social circles are audited. Innovation without discipline produces nothing lasting.',
  12: 'The invisible interior is being restructured. Spiritual bypassing is replaced by disciplined inner work.',
};

const nodeBody: Record<number, string> = {
  1: 'Your soul is pulled toward independence. The universe rewards authentic self-assertion.',
  2: 'Growth through building your own resources. Develop financial and material independence.',
  3: 'Growth through curiosity and communication. Engage with your immediate world.',
  4: 'Growth through vulnerability and nurturing. Create emotional safety — for yourself first.',
  5: 'Growth through creative self-expression and emotional risk. Allow yourself to be seen.',
  6: 'Growth through practical service and daily mastery. The details matter.',
  7: 'Growth through genuine partnership. Collaboration and diplomacy are the skills being developed.',
  8: 'Growth through emotional depth and shared vulnerability. Trust the process.',
  9: 'Growth through direct experience. Travel, study, form your own philosophy.',
  10: 'Growth through public responsibility. Take on the role that asks more of you.',
  11: 'Growth through community and collective purpose. The bigger picture needs your contribution.',
  12: 'Growth through trusting your inner wisdom. Surrender the need to control every outcome.',
};

interface PortraitData {
  sign: string;
  house: number;
  isRetrograde?: boolean;
}

/**
 * Compact portrait card — fits BOTH on one page with synthesis.
 */
function drawPortraitCard(
  doc: jsPDF, ctx: PDFContext, margin: number, contentW: number, pw: number,
  type: 'saturn' | 'node', data: PortraitData,
) {
  const house = data.house || 1;
  const cardH = 210; // Compact enough for both + synthesis on one page

  const startY = ctx.y;
  const isSaturn = type === 'saturn';
  const accentColor: Color = isSaturn ? DARK : GOLD;

  doc.setFillColor(...CREAM);
  doc.roundedRect(margin, startY, contentW, cardH, 4, 4, 'F');
  doc.setFillColor(...accentColor);
  doc.rect(margin, startY, 4, cardH, 'F');

  // Tracked label
  const label = isSaturn ? 'WHERE YOU ARE TESTED' : 'WHERE YOUR SOUL IS GROWING';
  ctx.trackedLabel(doc, label, margin + 18, startY + 18, { size: 6.5, charSpace: 3 });

  // Giant house number
  doc.setFont('times', 'bold'); doc.setFontSize(60);
  doc.setTextColor(...accentColor);
  doc.text(String(house), pw - margin - 18, startY + 68, { align: 'right' });

  // Planet name + sign
  const planetName = isSaturn ? 'Saturn' : 'North Node';
  const rxLabel = isSaturn && data.isRetrograde ? '  ℞' : '';
  doc.setFont('times', 'bold'); doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(`${planetName} in ${data.sign}${rxLabel}`, margin + 18, startY + 55);

  doc.setFont('times', 'normal'); doc.setFontSize(11);
  doc.setTextColor(...MUTED);
  doc.text(`House ${house}`, margin + 18, startY + 70);

  // Pull-quote
  const quote = isSaturn ? saturnPullQuote[house] : nodePullQuote[house];
  if (quote) {
    doc.setDrawColor(...accentColor); doc.setLineWidth(0.6);
    doc.line(margin + 18, startY + 86, margin + 18, startY + 100);
    doc.setFont('times', 'italic'); doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(`"${quote}"`, margin + 26, startY + 97);
  }

  // Body text
  const body = isSaturn ? saturnBody[house] : nodeBody[house];
  if (body) {
    doc.setFont('times', 'normal'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    const lines: string[] = doc.splitTextToSize(body, contentW - 36);
    let ty = startY + 120;
    for (const line of lines.slice(0, 5)) {
      doc.text(line, margin + 18, ty);
      ty += 13;
    }
  }

  // Retrograde badge
  if (isSaturn && data.isRetrograde) {
    const badgeY = startY + cardH - 30;
    doc.setFillColor(245, 241, 234);
    doc.roundedRect(margin + 18, badgeY, 140, 20, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.roundedRect(margin + 18, badgeY, 140, 20, 3, 3, 'S');
    doc.setFont('times', 'italic'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('Retrograde — the testing is internal', margin + 28, badgeY + 13);
  }

  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.roundedRect(margin, startY, contentW, cardH, 4, 4, 'S');

  ctx.y = startY + cardH + 10;
}

export function generateSaturnNodePortrait(
  doc: jsPDF, ctx: PDFContext, margin: number, contentW: number, pw: number,
  saturnFocus: PortraitData | null | undefined,
  nodesFocus: PortraitData | null | undefined,
) {
  if (!saturnFocus && !nodesFocus) return;

  doc.addPage();
  ctx.y = margin;
  ctx.pageBg(doc);
  ctx.sectionPages.set('SATURN AND NORTH NODE', doc.getNumberOfPages());

  // Compact header
  ctx.y += 8;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('SATURN & NORTH NODE', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 5;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 12;
  doc.setFont('times', 'normal'); doc.setFontSize(18);
  doc.setTextColor(...INK);
  doc.text('Strength & Wisdom', margin, ctx.y);
  ctx.y += 12;

  if (saturnFocus) {
    drawPortraitCard(doc, ctx, margin, contentW, pw, 'saturn', saturnFocus);
  }

  if (nodesFocus) {
    drawPortraitCard(doc, ctx, margin, contentW, pw, 'node', nodesFocus);
  }

  // Synthesis
  if (saturnFocus && nodesFocus) {
    const cx = pw / 2;
    doc.setFillColor(...GOLD);
    for (const offset of [-12, 0, 12]) {
      const dx = cx + offset;
      doc.triangle(dx, ctx.y - 2, dx + 2.5, ctx.y + 1, dx, ctx.y + 4, 'F');
      doc.triangle(dx, ctx.y - 2, dx - 2.5, ctx.y + 1, dx, ctx.y + 4, 'F');
    }
    ctx.y += 10;

    doc.setFont('times', 'italic'); doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    const synth = `Saturn in House ${saturnFocus.house || '--'} is where you are made stronger. North Node in House ${nodesFocus.house || '--'} is where you are made wiser.`;
    const synthLines: string[] = doc.splitTextToSize(synth, contentW - 40);
    for (const line of synthLines) {
      doc.text(line, cx, ctx.y, { align: 'center' });
      ctx.y += 12;
    }
    ctx.y += 4;
  }
}
