import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';

type Color = [number, number, number];

const CREAM: Color = [250, 247, 242];
const INK: Color = [18, 16, 14];
const MUTED: Color = [130, 125, 118];
const GOLD: Color = [184, 150, 62];
const RULE: Color = [200, 195, 188];
const DARK: Color = [38, 34, 30];

/* ── Pull-quote one-liners per house ── */
const saturnPullQuote: Record<number, string> = {
  1: 'You are the project.',
  2: 'Earn your own worth.',
  3: 'Say only what is true.',
  4: 'Build the real foundation.',
  5: 'Create without applause.',
  6: 'Master the daily discipline.',
  7: 'Commit or walk away.',
  8: 'Face what you owe.',
  9: 'Earn your philosophy.',
  10: 'Carry the mantle.',
  11: 'Serve the collective.',
  12: 'Confront the invisible.',
};

const nodePullQuote: Record<number, string> = {
  1: 'Choose yourself.',
  2: 'Trust your own worth.',
  3: 'Stay curious.',
  4: 'Come home to yourself.',
  5: 'Let yourself be seen.',
  6: 'Serve with precision.',
  7: 'Learn to partner.',
  8: 'Go deeper.',
  9: 'Expand your world.',
  10: 'Step into authority.',
  11: 'Think bigger than you.',
  12: 'Trust the unseen.',
};

/* ── Short body text per house ── */
const saturnBody: Record<number, string> = {
  1: 'Identity is being restructured. You feel heavier, more serious. Others see authority forming. Health demands attention. The gift: self-authority no one can take.',
  2: 'Finances and values are under the microscope. Distinguish needs from wants. Build real security through discipline, not comfort-seeking.',
  3: 'Communication demands precision. Superficial learning fails. Contracts and daily interactions require depth and accountability.',
  4: 'Home and family carry weight. Roots are being stress-tested. Build genuine emotional foundations, not inherited patterns.',
  5: 'Creative confidence is tested. Self-expression feels risky. The work: creating something real without needing applause.',
  6: 'Daily routines and health are audited. Systems that don\'t work are exposed. Rebuild from the ground up, one habit at a time.',
  7: 'Partnerships demand accountability. Relationships built on convenience dissolve. Those built on genuine commitment strengthen.',
  8: 'Shared resources and emotional debts surface. Power dynamics can no longer be avoided. Financial entanglements require honest renegotiation.',
  9: 'Beliefs are tested against reality. Education and philosophy require commitment. Wisdom is earned through experience, not enthusiasm.',
  10: 'Career and reputation carry full weight. Ambition is focused. Authority is earned through consistent, visible effort.',
  11: 'Social circles are audited. Community involvement requires structure. Innovation without discipline produces nothing lasting.',
  12: 'The invisible interior is being restructured. Solitude becomes productive. Spiritual bypassing is replaced by disciplined inner work.',
};

const nodeBody: Record<number, string> = {
  1: 'Your soul is pulled toward independence. Stop deferring. The universe rewards authentic self-assertion — not selfish, but necessary.',
  2: 'Growth through building your own resources. What do you genuinely value? Develop financial and material independence on your own terms.',
  3: 'Growth through curiosity and communication. Ask more questions. Engage with your immediate world. Learn new skills without needing a grand purpose.',
  4: 'Growth through vulnerability and nurturing. Create emotional safety — for yourself first. Let yourself feel without needing to fix.',
  5: 'Growth through creative self-expression and emotional risk. Step into the spotlight. Allow yourself to be seen, imperfect and alive.',
  6: 'Growth through practical service and daily mastery. The details matter. Bring order to chaos one small system at a time.',
  7: 'Growth through genuine partnership. Consider others as seriously as yourself. Collaboration and diplomacy are the skills being developed.',
  8: 'Growth through emotional depth and shared vulnerability. Allow transformation even when it feels like loss. Trust the process.',
  9: 'Growth through direct experience. Travel, study, form your own philosophy. Stop borrowing others\' beliefs — live your way into wisdom.',
  10: 'Growth through public responsibility. Build something that outlasts your comfort zone. Take on the role that asks more of you.',
  11: 'Growth through community and collective purpose. Detach from personal drama. The bigger picture needs your contribution.',
  12: 'Growth through trusting your inner wisdom. Surrender the need to control every outcome. Artistic and spiritual expression are the path.',
};

interface PortraitData {
  sign: string;
  house: number;
  isRetrograde?: boolean;
}

/**
 * Renders a dramatic full-width portrait card for Saturn or North Node.
 * Large house number, pull-quote, clean body text — one card per half-page.
 */
function drawPortraitCard(
  doc: jsPDF, ctx: PDFContext, margin: number, contentW: number, pw: number,
  type: 'saturn' | 'node', data: PortraitData,
) {
  const house = data.house || 1;
  const cardH = 310;
  ctx.checkPage(cardH + 20);

  const startY = ctx.y;
  const isSaturn = type === 'saturn';
  const accentColor: Color = isSaturn ? DARK : GOLD;

  // Card background
  doc.setFillColor(...CREAM);
  doc.roundedRect(margin, startY, contentW, cardH, 4, 4, 'F');

  // Left accent bar
  doc.setFillColor(...accentColor);
  doc.rect(margin, startY, 4, cardH, 'F');

  // ── Tracked label at top ──
  const label = isSaturn ? 'WHERE YOU ARE TESTED' : 'WHERE YOUR SOUL IS GROWING';
  ctx.trackedLabel(doc, label, margin + 20, startY + 28, { size: 7, charSpace: 3.5 });

  // ── Giant house number ──
  doc.setFont('times', 'bold');
  doc.setFontSize(96);
  doc.setTextColor(...accentColor);
  const houseStr = String(house);
  doc.text(houseStr, pw - margin - 24, startY + 100, { align: 'right' });

  // ── Planet name + sign ──
  const planetName = isSaturn ? 'Saturn' : 'North Node';
  const rxLabel = isSaturn && data.isRetrograde ? '  ℞' : '';
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(...INK);
  doc.text(`${planetName} in ${data.sign}${rxLabel}`, margin + 20, startY + 80);

  // ── "House X" subtitle ──
  doc.setFont('times', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(...MUTED);
  doc.text(`House ${house}`, margin + 20, startY + 100);

  // ── Pull-quote ──
  const quote = isSaturn ? saturnPullQuote[house] : nodePullQuote[house];
  if (quote) {
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.6);
    doc.line(margin + 20, startY + 125, margin + 20, startY + 145);

    doc.setFont('times', 'italic');
    doc.setFontSize(18);
    doc.setTextColor(...INK);
    doc.text(`"${quote}"`, margin + 28, startY + 139);
  }

  // ── Body text ──
  const body = isSaturn ? saturnBody[house] : nodeBody[house];
  if (body) {
    doc.setFont('times', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...INK);
    const lines: string[] = doc.splitTextToSize(body, contentW - 48);
    let ty = startY + 175;
    for (const line of lines.slice(0, 8)) {
      doc.text(line, margin + 20, ty);
      ty += 17;
    }
  }

  // ── Retrograde badge ──
  if (isSaturn && data.isRetrograde) {
    const badgeY = startY + cardH - 50;
    doc.setFillColor(245, 241, 234);
    doc.roundedRect(margin + 20, badgeY, 140, 28, 3, 3, 'F');
    doc.setDrawColor(...RULE);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin + 20, badgeY, 140, 28, 3, 3, 'S');
    doc.setFont('times', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text('Retrograde — the testing is internal', margin + 30, badgeY + 18);
  }

  // Outer border
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, startY, contentW, cardH, 4, 4, 'S');

  ctx.y = startY + cardH + 16;
}

/**
 * Generate the full Saturn & North Node section with dramatic portrait cards.
 */
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
  ctx.sectionTitle(doc, 'SATURN & NORTH NODE');

  // Saturn portrait card
  if (saturnFocus) {
    drawPortraitCard(doc, ctx, margin, contentW, pw, 'saturn', saturnFocus);
  }

  // North Node portrait card
  if (nodesFocus) {
    drawPortraitCard(doc, ctx, margin, contentW, pw, 'node', nodesFocus);
  }

  // Synthesis line if both exist
  if (saturnFocus && nodesFocus) {
    ctx.checkPage(60);
    const cx = pw / 2;
    // Gold diamond divider
    doc.setFillColor(...GOLD);
    for (const offset of [-12, 0, 12]) {
      const dx = cx + offset;
      doc.triangle(dx, ctx.y - 2, dx + 2.5, ctx.y + 1, dx, ctx.y + 4, 'F');
      doc.triangle(dx, ctx.y - 2, dx - 2.5, ctx.y + 1, dx, ctx.y + 4, 'F');
    }
    ctx.y += 16;

    doc.setFont('times', 'italic');
    doc.setFontSize(11);
    doc.setTextColor(...MUTED);
    const synth = `Saturn in House ${saturnFocus.house || '--'} is where you are made stronger. The North Node in House ${nodesFocus.house || '--'} is where you are made wiser. That tension drives the year.`;
    const synthLines: string[] = doc.splitTextToSize(synth, contentW - 60);
    for (const line of synthLines) {
      doc.text(line, cx, ctx.y, { align: 'center' });
      ctx.y += 16;
    }
    ctx.y += 10;
  }
}
