import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];
const GOLD:  Color = [184, 150, 62];

export function generateHowToReadPage(ctx: PDFContext, doc: jsPDF) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);

  // Section header
  ctx.trackedLabel(doc, '01 · HOW TO READ THIS REPORT', margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;

  // Large serif display title
  doc.setFont('times', 'normal'); doc.setFontSize(24);
  doc.setTextColor(...INK);
  doc.text('Your Personal Map for the Year', margin, ctx.y);
  ctx.y += 14;

  // Hairline rule
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 14;

  // Intro card
  ctx.drawCard(doc, () => {
    doc.setFont('times', 'normal'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    const intro = 'This report is your personal map for the year ahead. No astrology background is needed \u2014 every concept is explained as you go.';
    const introLines: string[] = doc.splitTextToSize(intro, contentW - 28);
    for (const line of introLines) { doc.text(line, margin + 14, ctx.y); ctx.y += 16; }
  });

  const concepts: { title: string; body: string }[] = [
    {
      title: 'WHAT IS A SOLAR RETURN?',
      body: 'Every year around your birthday, the Sun returns to the exact position it held when you were born. A chart cast for that moment acts as a blueprint for the year ahead \u2014 showing where your energy, attention, and growth will be focused from one birthday to the next.',
    },
    {
      title: 'HOUSES \u2014 THE 12 DEPARTMENTS OF LIFE',
      body: 'Think of the 12 houses as departments of life: identity (1st), money (2nd), communication (3rd), home (4th), creativity and romance (5th), health (6th), partnerships (7th), transformation (8th), travel and beliefs (9th), career (10th), community (11th), and inner life (12th). When a planet lands in a house, it activates that department for the year.',
    },
    {
      title: 'PROFECTIONS \u2014 YOUR YEARLY SPOTLIGHT',
      body: 'Starting at House 1 when you are born, each birthday advances the spotlight to the next house. By age 12 you are back at House 1, and the cycle repeats. The activated house tells you which area of life is center stage this year.',
    },
    {
      title: 'TIME LORD \u2014 THE PLANET RUNNING YOUR YEAR',
      body: 'The planet that rules your activated profection house becomes your Time Lord \u2014 the planet setting the agenda for the year. When your Time Lord appears in aspects or important placements, pay close attention.',
    },
    {
      title: 'ASPECTS \u2014 HOW PLANETS TALK',
      body: 'Aspects are geometric angles between planets. A conjunction (0\u00b0) blends energies. A trine (120\u00b0) creates flow. A square (90\u00b0) creates tension that forces action. An opposition (180\u00b0) creates awareness through contrast.',
    },
    {
      title: 'THE SR MOON \u2014 YOUR EMOTIONAL COMPASS',
      body: 'The Moon in your Solar Return is a snapshot of your emotional world for the entire year. Its sign tells you how you process emotions. Its house tells you where your heart is most invested. Its aspects describe the emotional climate.',
    },
  ];

  for (const c of concepts) {
    ctx.checkPage(100);
    ctx.drawCard(doc, () => {
      ctx.trackedLabel(doc, c.title, margin + 14, ctx.y, { charSpace: 2.5, size: 7.5 });
      ctx.y += 14;
      doc.setFont('times', 'normal'); doc.setFontSize(10);
      doc.setTextColor(...INK);
      const bodyLines: string[] = doc.splitTextToSize(c.body, contentW - 28);
      for (const line of bodyLines) { doc.text(line, margin + 14, ctx.y); ctx.y += 15; }
    });
  }

  ctx.y += 6;
}
