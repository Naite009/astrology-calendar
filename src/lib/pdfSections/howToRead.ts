import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';

/** How To Read This Report — beginner-friendly intro page, fits on one page */

export function generateHowToReadPage(ctx: PDFContext, doc: jsPDF) {
  const { pw, margin, contentW, colors } = ctx;

  // Title
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 22;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.setTextColor(...colors.gold);
  doc.text('HOW TO READ THIS REPORT', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 6;
  doc.setLineWidth(0.5); doc.line(pw / 2 - 50, ctx.y, pw / 2 + 50, ctx.y);
  ctx.y += 16;

  doc.setFont('helvetica', 'italic'); doc.setFontSize(10.5);
  doc.setTextColor(...colors.bodyText);
  const intro = 'This report is your personal map for the year. Here are the key concepts you will encounter — no astrology background needed.';
  const introLines = doc.splitTextToSize(intro, contentW - 16);
  introLines.forEach((line: string) => { doc.text(line, margin + 8, ctx.y); ctx.y += 14; });
  ctx.y += 8;

  const concepts: { title: string; body: string }[] = [
    {
      title: 'What Is a Solar Return?',
      body: 'Every year around your birthday, the Sun returns to the exact position it was in when you were born. A chart cast for that moment acts as a blueprint for the year ahead — showing where your energy, attention, and growth will be focused from one birthday to the next.',
    },
    {
      title: 'Houses — The 12 Departments of Life',
      body: 'Think of the 12 houses as departments: identity (1st), money (2nd), communication (3rd), home (4th), creativity and romance (5th), health (6th), partnerships (7th), transformation (8th), travel and beliefs (9th), career (10th), community (11th), and inner life (12th). When a planet lands in a house, it activates that department for the year.',
    },
    {
      title: 'Profections — Your Yearly Spotlight',
      body: 'Starting at House 1 when you are born, each birthday advances the spotlight to the next house. By age 12, you are back at House 1, and the cycle repeats. The activated house tells you which area of life is center stage this year.',
    },
    {
      title: 'Time Lord — The Planet Running Your Year',
      body: 'The planet that rules your activated profection house becomes your "Time Lord" — the planet setting the agenda for the year. When your Time Lord appears in aspects or important placements, pay close attention.',
    },
    {
      title: 'Aspects — How Planets Talk to Each Other',
      body: 'Aspects are geometric angles between planets. A conjunction (0°) blends energies. A trine (120°) creates flow. A square (90°) creates tension that forces action. An opposition (180°) creates awareness through contrast.',
    },
    {
      title: 'The SR Moon — Your Emotional Compass',
      body: 'The Moon in a Solar Return is a snapshot of your emotional world for the entire year. Its SIGN tells you how you process emotions. Its HOUSE tells you where your heart is most invested. Its ASPECTS describe the emotional climate. The Moon\'s phase (New, Full, Balsamic, etc.) sets the overall arc of the year.',
    },
  ];

  for (const c of concepts) {
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, c.title, colors.gold, 11.5);
      ctx.y += 3;
      ctx.writeBody(doc, c.body, colors.bodyText, 10, 13.5);
    });
  }

  ctx.y += 6;
}
