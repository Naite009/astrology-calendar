import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

type Color = [number, number, number];
const CREAM: Color = [250, 247, 242];
const CARD_BG: Color = [245, 241, 234];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const DARK:  Color = [38,  34,  30];
const GOLD:  Color = [184, 150, 62];
const RULE:  Color = [200, 195, 188];

function getNatalIdentity(sunSign: string, moonSign: string, risingSign: string): string {
  const sun: Record<string, string> = {
    Aries: 'You were born to lead, to initiate, to move first when everyone else is still deciding.',
    Taurus: 'You were born with the patience to build things that last and the instinct to find beauty in the ordinary.',
    Gemini: 'You were born to make connections others miss — between ideas, between people, between what is and what could be.',
    Cancer: 'You were born feeling things others cannot name, caring for people before they ask, and creating safety wherever you go.',
    Leo: 'You were born with a warmth that makes people feel seen — not because you try, but because you genuinely notice them.',
    Virgo: 'You were born with the eye that catches what everyone else overlooks, and the devotion to actually do something about it.',
    Libra: 'You were born with the rare ability to hold two sides of anything without losing yourself — and to make peace feel possible.',
    Scorpio: 'You were born willing to go where others are afraid to look, and to love with a depth that changes people.',
    Sagittarius: 'You were born with the faith that life is leading somewhere meaningful — and the courage to follow it.',
    Capricorn: 'You were born with the discipline to show up even when no one is watching, and the integrity to do it right.',
    Aquarius: 'You were born seeing what the world could be, not just what it is — and refusing to pretend otherwise.',
    Pisces: 'You were born feeling the world more deeply than most people ever will, absorbing what others cannot even sense.',
  };
  const moon: Record<string, string> = {
    Aries: 'You need space to act on your instincts without being told to slow down.',
    Taurus: 'You need safety, beauty, and time — none of which are too much to ask.',
    Gemini: 'You need conversation, variety, and someone who keeps up with your mind.',
    Cancer: 'You need a home that feels like your own and people who show up consistently.',
    Leo: 'You need to be appreciated for who you are, not just what you do.',
    Virgo: 'You need to feel useful — and permission to not have everything figured out.',
    Libra: 'You need peace, fairness, and relationships where you feel truly equal.',
    Scorpio: 'You need honesty, depth, and the rare person who can hold all of you.',
    Sagittarius: 'You need meaning, freedom, and room to keep growing.',
    Capricorn: 'You need respect for your ambition and someone who sees past your composure.',
    Aquarius: 'You need freedom to be exactly yourself — especially the parts that don\'t fit.',
    Pisces: 'You need time alone to recharge and someone who protects your tenderness.',
  };
  const rising: Record<string, string> = {
    Aries: 'People experience you as someone who moves things — energy shifts when you arrive.',
    Taurus: 'People experience you as steady and real — your presence alone calms the room.',
    Gemini: 'People experience you as bright and curious — you make everything more interesting.',
    Cancer: 'People experience you as warm and safe — they trust you before they know why.',
    Leo: 'People experience you as magnetic — not because you ask for it, because you earn it.',
    Virgo: 'People experience you as competent and thoughtful — you notice what everyone else misses.',
    Libra: 'People experience you as graceful and fair — you make others feel at ease.',
    Scorpio: 'People experience you as perceptive and intense — they know you see through surfaces.',
    Sagittarius: 'People experience you as open and alive — your enthusiasm is genuinely contagious.',
    Capricorn: 'People experience you as someone who has it together — you project quiet authority.',
    Aquarius: 'People experience you as original — you refuse to be ordinary and it shows.',
    Pisces: 'People experience you as gentle and intuitive — you pick up on things others miss entirely.',
  };
  const s = sun[sunSign] || 'You were born with something rare.';
  const m = moon[moonSign] || 'What you need is to be understood.';
  const r = rising[risingSign] || 'You show up in a way that is uniquely yours.';
  return `${s} ${m} ${r}`;
}

function getYearMessage(
  profHouse: number, timeLord: string, northNodeHouse: number | null,
  hasVenusAngular: boolean, hasJupiterAngular: boolean, moonPhase: string, srSunHouse: number | null
): { body: string; closing: string } {
  const HOUSE_THEME: Record<number, string> = {
    1: 'identity and bold reinvention', 2: 'real worth — financial and personal',
    3: 'your voice, your ideas, your mind', 4: 'home, roots, and what you are building from the inside out',
    5: 'joy, creativity, and the things that make you come alive', 6: 'your health and the daily work that sustains you',
    7: 'partnership and what you are willing to let be real', 8: 'transformation and releasing what no longer fits',
    9: 'expansion — a bigger world, a bigger life', 10: 'your work and how the world sees what you have built',
    11: 'your people and the community you belong to', 12: 'rest, reflection, and the invisible work that matters most',
  };
  const LORD_CONDITION: Record<string, string> = {
    Saturn: 'Saturn asks that you show up for it with intention, not just inspiration. The joy you build deliberately is the kind that stays.',
    Mars: 'Mars asks for courage — not recklessness, but the willingness to act before you feel ready.',
    Jupiter: 'Jupiter opens doors this year. Walk through them. Overreach is the only real risk.',
    Venus: 'Venus makes this year feel more natural than it has any right to. Use that ease to build something real.',
    Mercury: 'Mercury asks you to think clearly, communicate honestly, and trust your own mind.',
    Moon: 'The Moon asks you to feel your way through this year rather than reason your way through it.',
    Sun: 'The Sun asks you to be the main character — not for performance, but for real.',
    Pluto: 'Pluto asks you to let something fundamental change. Resistance is the only thing that makes it hard.',
    Neptune: 'Neptune asks you to trust what you cannot yet prove.',
    Uranus: 'Uranus asks you to stay flexible. The detour is often the point.',
  };
  const houseTheme = HOUSE_THEME[profHouse] || 'the work that matters most this year';
  const lordCondition = LORD_CONDITION[timeLord] || 'The year has conditions. Meet them.';
  const isBalsamic = moonPhase?.toLowerCase().includes('balsamic');
  const is12thSun = srSunHouse === 12;
  const nodeInSurrenderHouse = northNodeHouse === 12 || northNodeHouse === 9;
  let body = `This year calls you toward ${houseTheme}. ${lordCondition}`;
  if (is12thSun || isBalsamic) body += ' The most important work happens quietly this year — in private, in the pauses, in what you choose to release.';
  if (nodeInSurrenderHouse) body += ' Trust what you cannot see yet. Growth this year comes through faith, not force.';
  if (hasVenusAngular) body += ' You are more magnetic than you realize. Let people find you.';
  else if (hasJupiterAngular) body += ' Something is expanding in your world. Make room for it.';
  const closings: Record<number, string> = {
    1: '\"Becoming is better than being.\" — Carol Dweck',
    2: '\"Know your worth, then add tax.\" — Unknown',
    3: '\"The right word may be effective, but no word was ever as effective as a rightly timed pause.\" — Mark Twain',
    4: '\"Where we love is home — home that our feet may leave, but not our hearts.\" — Oliver Wendell Holmes',
    5: '\"You can\'t use up creativity. The more you use, the more you have.\" — Maya Angelou',
    6: '\"Take care of your body. It\'s the only place you have to live.\" — Jim Rohn',
    7: '\"The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed.\" — C.G. Jung',
    8: '\"What we don\'t need in the midst of struggle is shame for being human.\" — Brene Brown',
    9: '\"The world is a book, and those who do not travel read only one page.\" — Saint Augustine',
    10: '\"Whatever you are, be a good one.\" — Abraham Lincoln',
    11: '\"The glory of friendship is not the outstretched hand, not the kindly smile — it is the spiritual inspiration that comes to one when you discover that someone else believes in you.\" — Ralph Waldo Emerson',
    12: '\"Almost everything will work again if you unplug it for a few minutes — including you.\" — Anne Lamott',
  };
  return { body, closing: closings[profHouse] || '\"Trust yourself. You know more than you think you do.\" — Benjamin Spock' };
}

export function generateAffirmationCard(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart,
) {
  const { pw, ph, margin } = ctx;
  const name = natalChart.name || 'Beautiful Soul';
  const year = srChart.solarReturnYear;
  const sunSign = natalChart.planets?.Sun?.sign || 'Pisces';
  const moonSign = natalChart.planets?.Moon?.sign || '';
  const risingSign = natalChart.planets?.Ascendant?.sign || natalChart.houseCusps?.[0]?.sign || '';
  const profH = a.profectionYear?.houseNumber || 1;
  const timeLord = a.profectionYear?.timeLord || '';
  const northNodeHouse = a.nodesFocus?.house || null;
  const moonPhase = a.moonPhase?.phase || '';
  const srSunHouse = a.sunHouse?.house || null;
  const hasVenusAngular = a.angularPlanets?.includes('Venus') || false;
  const hasJupiterAngular = a.angularPlanets?.includes('Jupiter') || false;

  const identity = getNatalIdentity(sunSign, moonSign, risingSign);
  const { body, closing } = getYearMessage(profH, timeLord, northNodeHouse, hasVenusAngular, hasJupiterAngular, moonPhase, srSunHouse);

  doc.setFillColor(...CREAM);
  doc.rect(0, 0, pw, ph, 'F');

  ctx.y = 58;
  ctx.trackedLabel(doc, `FINAL TAKEAWAY · ${year}`, margin, ctx.y, { size: 7.5, charSpace: 3.2 });
  ctx.y += 10;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 24;

  doc.setFont('times', 'normal'); doc.setFontSize(42);
  doc.setTextColor(...INK);
  const headingLines: string[] = doc.splitTextToSize('Carry This With You', pw - margin * 2);
  for (const line of headingLines) {
    doc.text(line, margin, ctx.y);
    ctx.y += 42;
  }

  doc.setFont('times', 'italic'); doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  doc.text(`${name} · ${sunSign} Sun${moonSign ? ` · ${moonSign} Moon` : ''}${risingSign ? ` · ${risingSign} Rising` : ''}`, margin, ctx.y);
  ctx.y += 18;

  const drawTakeawayCard = (label: string, text: string, maxLines: number) => {
    const rawLines = doc.splitTextToSize(text, pw - margin * 2 - 32) as string[];
    const lines = rawLines.length > maxLines
      ? [...rawLines.slice(0, maxLines - 1), rawLines[maxLines - 1].replace(/[.,;:!?]?$/, '…')]
      : rawLines;

    const cardH = Math.max(118, 24 + 14 + lines.length * 16 + 18);
    if (ctx.y + cardH > ph - 140) {
      doc.addPage();
      ctx.pageBg(doc);
      ctx.y = margin;
      ctx.trackedLabel(doc, 'FINAL TAKEAWAY · CONTINUED', margin, ctx.y, { size: 7.2, charSpace: 3 });
      ctx.y += 10;
      doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
      doc.line(margin, ctx.y, pw - margin, ctx.y);
      ctx.y += 18;
    }

    const startY = ctx.y;
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, startY, pw - margin * 2, cardH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.roundedRect(margin, startY, pw - margin * 2, cardH, 3, 3, 'S');
    doc.setFillColor(...GOLD);
    doc.rect(margin, startY, 3, cardH, 'F');

    let cy = startY + 24;
    ctx.trackedLabel(doc, label, margin + 16, cy, { size: 7.4, charSpace: 2.6 });
    cy += 14;

    doc.setFont('times', 'normal'); doc.setFontSize(10.8);
    doc.setTextColor(...INK);
    for (const line of lines) {
      doc.text(line, margin + 16, cy);
      cy += 16;
    }

    ctx.y = startY + cardH + 14;
  };

  drawTakeawayCard('YOUR NATAL STRENGTH', identity, 9);
  drawTakeawayCard('THIS YEAR ASK', body, 10);

  ctx.checkPage(90);
  ctx.y += 4;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;

  const quoteText = closing.replace(/^\"/, '').replace(/\" — .*$/, '');
  doc.setFont('times', 'italic'); doc.setFontSize(13);
  doc.setTextColor(...DARK);
  const quoteLines: string[] = doc.splitTextToSize(quoteText, pw * 0.64);
  for (const line of quoteLines) {
    doc.text(line, pw / 2, ctx.y, { align: 'center' });
    ctx.y += 18;
  }

  const attribution = closing.match(/— (.+)$/)?.[1];
  if (attribution) {
    ctx.y += 2;
    doc.setFont('times', 'normal'); doc.setFontSize(8.2);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(2);
    doc.text(`— ${attribution.toUpperCase()}`, pw / 2, ctx.y, { align: 'center' });
    doc.setCharSpace(0);
  }

  const footerY = Math.min(ph - 26, ctx.y + 16);
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, footerY, pw - margin, footerY);

  ctx.y = ph;
}
