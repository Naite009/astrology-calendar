import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';

/** How To Read This Report — beginner-friendly intro page */

export function generateHowToReadPage(ctx: PDFContext, doc: jsPDF) {
  const { pw, margin, contentW, colors } = ctx;

  // Title
  doc.setDrawColor(...colors.gold); doc.setLineWidth(2);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 24;

  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.setTextColor(...colors.gold);
  doc.text('HOW TO READ THIS REPORT', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 6;
  doc.setLineWidth(0.5); doc.line(pw / 2 - 50, ctx.y, pw / 2 + 50, ctx.y);
  ctx.y += 20;

  doc.setFont('helvetica', 'italic'); doc.setFontSize(10);
  doc.setTextColor(...colors.bodyText);
  const intro = 'This report is your personal map for the year. Here are the key concepts you will encounter — no astrology background needed.';
  const introLines = doc.splitTextToSize(intro, contentW - 16);
  introLines.forEach((line: string) => { doc.text(line, margin + 8, ctx.y); ctx.y += 14; });
  ctx.y += 10;

  const concepts: { title: string; body: string }[] = [
    {
      title: 'What Is a Solar Return?',
      body: 'Every year around your birthday, the Sun returns to the exact position it was in when you were born. A chart cast for that precise moment — called a Solar Return — acts as a blueprint for the year ahead. It shows where your energy, attention, and growth will be focused from one birthday to the next.',
    },
    {
      title: 'Houses — The 12 Departments of Life',
      body: 'Think of the 12 houses as 12 departments of your life: identity (1st), money (2nd), communication (3rd), home (4th), creativity and romance (5th), daily work and health (6th), partnerships (7th), shared resources and transformation (8th), travel and beliefs (9th), career (10th), community (11th), and inner life (12th). When a planet lands in a house, it activates that department for the year.',
    },
    {
      title: 'Profections — Your Yearly Spotlight',
      body: 'Annual Profections are a timing technique from ancient astrology. Starting at House 1 when you are born, each birthday advances the spotlight to the next house. By age 12, you are back at House 1, and the cycle repeats. The house that is activated tells you which area of life is center stage this year.',
    },
    {
      title: 'Time Lord — The Planet Running Your Year',
      body: 'The planet that rules your activated profection house becomes your "Time Lord" — the planet setting the agenda for the entire year. When your Time Lord shows up in aspects, transits, or important placements, pay close attention. That is where your year\'s most important story is being told.',
    },
    {
      title: 'Aspects — How Planets Talk to Each Other',
      body: 'Aspects are geometric angles between planets. A conjunction (0 degrees) blends energies. A trine (120 degrees) creates flow and ease. A square (90 degrees) creates tension that forces action. An opposition (180 degrees) creates awareness through contrast. None are "good" or "bad" — they describe HOW energies interact.',
    },
    {
      title: 'The Moon — Your Emotional Clock',
      body: 'The Moon in a Solar Return shows your emotional processing style for the year. Its sign tells you HOW you will feel; its house tells you WHERE those feelings get activated. The Moon also acts as a timing device — advancing roughly one degree per month through the chart, triggering aspects as it goes.',
    },
  ];

  for (const c of concepts) {
    ctx.checkPage(100);
    ctx.drawCard(doc, () => {
      ctx.writeBold(doc, c.title, colors.gold, 11);
      ctx.y += 4;
      ctx.writeBody(doc, c.body, colors.bodyText, 9.5, 14);
    });
  }

  ctx.y += 10;
}
