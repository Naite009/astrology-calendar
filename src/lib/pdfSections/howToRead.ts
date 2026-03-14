import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];

export function generateHowToReadPage(ctx: PDFContext, doc: jsPDF) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);

  // Section label
  ctx.trackedLabel(doc, '01 · HOW TO READ THIS REPORT', margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;

  // Main heading
  doc.setFont('times', 'bold'); doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text('Your Personal Map for the Year', margin, ctx.y);
  ctx.y += 18;

  // Intro paragraph
  doc.setFont('times', 'normal'); doc.setFontSize(10);
  doc.setTextColor(...INK);
  const intro = 'This report is your personal map for the year. Here are the key concepts you will encounter — no astrology background needed.';
  const introLines: string[] = doc.splitTextToSize(intro, contentW);
  for (const line of introLines) { doc.text(line, margin, ctx.y); ctx.y += 16; }
  ctx.y += 8;

  const concepts: { title: string; body: string; hasAccent?: boolean }[] = [
    {
      title: 'WHAT IS A SOLAR RETURN?',
      body: 'Every year around your birthday, the Sun returns to the exact position it was in when you were born. A chart cast for that moment acts as a blueprint for the year ahead — showing where your energy, attention, and growth will be focused from one birthday to the next.',
    },
    {
      title: 'HOUSES — THE 12 DEPARTMENTS OF LIFE',
      body: 'Think of the 12 houses as departments: identity (1st), money (2nd), communication (3rd), home (4th), creativity and romance (5th), health (6th), partnerships (7th), transformation (8th), travel and beliefs (9th), career (10th), community (11th), and inner life (12th). When a planet lands in a house, it activates that department for the year.',
    },
    {
      title: 'PROFECTIONS — YOUR YEARLY SPOTLIGHT',
      body: 'Starting at House 1 when you are born, each birthday advances the spotlight to the next house. By age 12, you are back at House 1, and the cycle repeats. The activated house tells you which area of life is center stage this year.',
    },
    {
      title: 'TIME LORD — THE PLANET RUNNING YOUR YEAR',
      body: 'The planet that rules your activated profection house becomes your "Time Lord" — the planet setting the agenda for the year. When your Time Lord appears in aspects or important placements, pay close attention.',
    },
    {
      title: 'ASPECTS — HOW PLANETS TALK TO EACH OTHER',
      body: 'Aspects are geometric angles between planets. A conjunction (0°) blends energies. A trine (120°) creates flow. A square (90°) creates tension that forces action. An opposition (180°) creates awareness through contrast.',
      hasAccent: true,
    },
    {
      title: 'THE SR MOON — YOUR EMOTIONAL COMPASS',
      body: 'The Moon in a Solar Return is a snapshot of your emotional world for the entire year. Its SIGN tells you how you process emotions. Its HOUSE tells you where your heart is most invested. Its ASPECTS describe the emotional climate. The Moon\'s phase (New, Full, Balsamic, etc.) sets the overall arc of the year.',
      hasAccent: true,
    },
  ];

  for (const c of concepts) {
    ctx.checkPage(80);

    // Tracked caps label
    ctx.trackedLabel(doc, c.title, margin + (c.hasAccent ? 12 : 0), ctx.y, { charSpace: 3 });
    ctx.y += 10;

    // Left accent border for right-column items
    const bodyStartY = ctx.y;

    // Body
    doc.setFont('times', 'normal'); doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const bodyLines: string[] = doc.splitTextToSize(c.body, contentW - (c.hasAccent ? 16 : 0));
    for (const line of bodyLines) {
      doc.text(line, margin + (c.hasAccent ? 12 : 0), ctx.y);
      ctx.y += 15;
    }

    // Thin left border accent for last two items
    if (c.hasAccent) {
      doc.setDrawColor(...RULE); doc.setLineWidth(1);
      doc.line(margin + 2, bodyStartY - 14, margin + 2, ctx.y - 4);
    }

    ctx.y += 8;
  }

  ctx.y += 6;
}
