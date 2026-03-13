import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { P } from '@/components/SolarReturnPDFExport';

/**
 * Birthday Affirmation Card — a frameable, deeply personal birthday letter
 * Uses natal big three, SR placements, time lord, and moon sign to create
 * a one-page message that reads like it was written by someone who truly knows you.
 */

function getSignGift(sign: string): string {
  const gifts: Record<string, string> = {
    Aries: 'the courage to begin before you feel ready',
    Taurus: 'the patience to build something that lasts',
    Gemini: 'the ability to make connections others miss',
    Cancer: 'the instinct to protect what matters most',
    Leo: 'the warmth that makes people feel truly seen',
    Virgo: 'the devotion to getting things right, especially for the people you love',
    Libra: 'the grace to hold two sides of any situation without losing yourself',
    Scorpio: 'the willingness to go where others are afraid to look',
    Sagittarius: 'the faith that life is leading you somewhere meaningful',
    Capricorn: 'the discipline to show up even when no one is watching',
    Aquarius: 'the vision to see what the world could be, not just what it is',
    Pisces: 'the sensitivity that lets you feel what others cannot put into words',
  };
  return gifts[sign] || 'a depth that makes you irreplaceable';
}

function getMoonNeed(sign: string): string {
  const needs: Record<string, string> = {
    Aries: 'space to act on your feelings without being told to slow down',
    Taurus: 'safety, comfort, and the freedom to take your time',
    Gemini: 'conversation, variety, and someone who keeps up with your mind',
    Cancer: 'a home that feels like your own, and people who show up consistently',
    Leo: 'to be appreciated — not for what you do, but for who you are',
    Virgo: 'to feel useful, and permission to not have everything figured out',
    Libra: 'peace, beauty, and relationships where you feel truly equal',
    Scorpio: 'honesty — even when it is uncomfortable — and real emotional depth',
    Sagittarius: 'adventure, meaning, and room to change your mind',
    Capricorn: 'respect for your ambition and someone who sees past your composure',
    Aquarius: 'freedom to be different and people who love you for exactly that',
    Pisces: 'time alone to recharge, and someone who protects your tenderness',
  };
  return needs[sign] || 'to be understood without having to explain yourself';
}

function getRisingMessage(sign: string): string {
  const msgs: Record<string, string> = {
    Aries: 'People experience you as someone who gets things moving. You walk into a room and the energy shifts.',
    Taurus: 'People experience you as calm, reliable, and grounded. Your presence alone steadies the room.',
    Gemini: 'People experience you as bright, curious, and easy to talk to. You make everything more interesting.',
    Cancer: 'People experience you as warm and approachable. Others feel safe with you before they know why.',
    Leo: 'People experience you as magnetic. There is something about you that draws attention — not because you ask for it, but because you earn it.',
    Virgo: 'People experience you as competent and thoughtful. You notice what others overlook.',
    Libra: 'People experience you as graceful and fair. You have a gift for making others feel at ease.',
    Scorpio: 'People experience you as intense and perceptive. You see through surfaces, and others know it.',
    Sagittarius: 'People experience you as optimistic and adventurous. Your enthusiasm is genuinely contagious.',
    Capricorn: 'People experience you as someone who has it together. You project quiet authority.',
    Aquarius: 'People experience you as original and a little unpredictable. You refuse to be ordinary.',
    Pisces: 'People experience you as gentle and intuitive. You pick up on things others miss entirely.',
  };
  return msgs[sign] || 'You show up in a way that is uniquely yours.';
}

function getYearAheadClosing(timeLord: string, profHouse: number, srMoonSign: string): string {
  const tlName = P[timeLord] || timeLord;
  const houseVerb: Record<number, string> = {
    1: 'redefine who you are',
    2: 'build something of real value',
    3: 'say the things you have been holding back',
    4: 'come home to yourself',
    5: 'create something that did not exist before you made it',
    6: 'take better care of yourself than you ever have',
    7: 'let someone truly meet you',
    8: 'let go of what is already gone',
    9: 'learn something that changes how you see everything',
    10: 'step into the role you have been preparing for',
    11: 'find the people who actually get you',
    12: 'rest, release, and trust the process',
  };
  const verb = houseVerb[profHouse] || 'move forward with clarity';

  return `This year, ${tlName} is running the show — and it is asking you to ${verb}. Your emotional world will be colored by ${srMoonSign} energy all year. Trust that. Work with it. This is your year.`;
}

export function generateAffirmationCard(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart,
) {
  const { pw, ph, margin, contentW, colors } = ctx;
  const name = natalChart.name || 'Beautiful Soul';
  const sunSign = natalChart.planets?.Sun?.sign || 'Aries';
  const moonSign = natalChart.planets?.Moon?.sign || '';
  const risingSign = natalChart.planets?.Ascendant?.sign || natalChart.houseCusps?.[0]?.sign || '';
  const srMoonSign = a.moonSign || '';
  const timeLord = a.profectionYear?.timeLord || '';
  const profH = a.profectionYear?.houseNumber || 1;

  // Outer decorative frame
  doc.setDrawColor(...colors.gold); doc.setLineWidth(3);
  doc.roundedRect(30, 30, pw - 60, ph - 60, 12, 12, 'S');
  doc.setLineWidth(1);
  doc.roundedRect(36, 36, pw - 72, ph - 72, 10, 10, 'S');

  // Inner soft background
  doc.setFillColor(...colors.softGold);
  doc.roundedRect(50, 50, pw - 100, ph - 100, 8, 8, 'F');

  // Stars at top
  doc.setFillColor(...colors.gold);
  const starY = 80;
  [pw / 2 - 60, pw / 2 - 30, pw / 2, pw / 2 + 30, pw / 2 + 60].forEach(x => {
    doc.circle(x, starY, 2, 'F');
  });

  // "Happy Birthday" label
  let cardY = 110;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(12);
  doc.setTextColor(...colors.dimText);
  doc.text('Happy Birthday', pw / 2, cardY, { align: 'center' });
  cardY += 28;

  // Name
  doc.setFont('helvetica', 'bold'); doc.setFontSize(28);
  doc.setTextColor(...colors.gold);
  doc.text(name.toUpperCase(), pw / 2, cardY, { align: 'center' });
  cardY += 12;

  // Decorative line
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1);
  doc.line(pw / 2 - 80, cardY, pw / 2 + 80, cardY);
  cardY += 30;

  // ── THE BIRTHDAY LETTER ──
  const textW = contentW - 100;

  // Paragraph 1: Your Sun — your gift
  const p1 = `You were born with ${getSignGift(sunSign)}. That is not something you learned — it is wired into who you are. It is the thing people remember about you long after you leave the room.`;
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.setTextColor(...colors.bodyText);
  const p1Lines = doc.splitTextToSize(p1, textW);
  p1Lines.forEach((line: string) => {
    doc.text(line, pw / 2, cardY, { align: 'center' });
    cardY += 16;
  });
  cardY += 10;

  // Paragraph 2: Your Moon — what you need
  if (moonSign) {
    const p2 = `What you need — really need — is ${getMoonNeed(moonSign)}. That is not too much to ask. It is the minimum you deserve.`;
    const p2Lines = doc.splitTextToSize(p2, textW);
    p2Lines.forEach((line: string) => {
      doc.text(line, pw / 2, cardY, { align: 'center' });
      cardY += 16;
    });
    cardY += 10;
  }

  // Paragraph 3: Your Rising — how the world sees you
  if (risingSign) {
    const p3 = getRisingMessage(risingSign);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(11);
    doc.setTextColor(...colors.deepBrown);
    const p3Lines = doc.splitTextToSize(p3, textW);
    p3Lines.forEach((line: string) => {
      doc.text(line, pw / 2, cardY, { align: 'center' });
      cardY += 16;
    });
    cardY += 14;
  }

  // Paragraph 4: The year ahead — closing with time lord + SR Moon
  if (timeLord) {
    const p4 = getYearAheadClosing(timeLord, profH, srMoonSign || sunSign);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.setTextColor(...colors.gold);
    const p4Lines = doc.splitTextToSize(p4, textW);
    p4Lines.forEach((line: string) => {
      doc.text(line, pw / 2, cardY, { align: 'center' });
      cardY += 16;
    });
  }

  // Bottom stars
  const bottomStarY = ph - 80;
  doc.setFillColor(...colors.gold);
  [pw / 2 - 60, pw / 2 - 30, pw / 2, pw / 2 + 30, pw / 2 + 60].forEach(x => {
    doc.circle(x, bottomStarY, 2, 'F');
  });

  // Set y past this page
  ctx.y = ph;
}
