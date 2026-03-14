import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

/**
 * Birthday Affirmation Card — ONE powerful takeaway quote for the year.
 * Synthesizes natal Sun gift + profection house verb + SR Moon tone
 * into a single, frameable sentence. No planet names. No jargon.
 */

function getSunEssence(sign: string): string {
  const essences: Record<string, string> = {
    Aries: 'You start things others only talk about.',
    Taurus: 'You build things that last.',
    Gemini: 'You connect dots no one else can see.',
    Cancer: 'You feel what others cannot put into words.',
    Leo: 'You make people feel seen just by being in the room.',
    Virgo: 'You notice what everyone else overlooks — and you make it better.',
    Libra: 'You hold space for both sides without losing yourself.',
    Scorpio: 'You go where others are afraid to look.',
    Sagittarius: 'You trust that life is taking you somewhere meaningful.',
    Capricorn: 'You show up even when no one is watching.',
    Aquarius: 'You see what the world could be, not just what it is.',
    Pisces: 'You carry a sensitivity that changes the people around you.',
  };
  return essences[sign] || 'You bring something irreplaceable.';
}

function getYearVerb(profHouse: number): string {
  const verbs: Record<number, string> = {
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
  return verbs[profHouse] || 'move forward with clarity';
}

function getMoonTone(sign: string): string {
  const tones: Record<string, string> = {
    Aries: 'Trust the urgency.',
    Taurus: 'Trust the pace.',
    Gemini: 'Trust the curiosity.',
    Cancer: 'Trust what you feel.',
    Leo: 'Trust what lights you up.',
    Virgo: 'Trust the process.',
    Libra: 'Trust the connection.',
    Scorpio: 'Trust the depth.',
    Sagittarius: 'Trust the direction.',
    Capricorn: 'Trust the discipline.',
    Aquarius: 'Trust the vision.',
    Pisces: 'Trust the surrender.',
  };
  return tones[sign] || 'Trust yourself.';
}

export function generateAffirmationCard(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart,
) {
  const { pw, ph, margin, contentW, colors } = ctx;
  const name = natalChart.name || 'Beautiful Soul';
  const sunSign = natalChart.planets?.Sun?.sign || 'Aries';
  const srMoonSign = a.moonSign || sunSign;
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
  let cardY = 120;
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
  cardY += 60;

  // ── THE SINGLE TAKEAWAY QUOTE ──
  const textW = contentW - 80;

  // Line 1: Who you are (Sun essence)
  const essence = getSunEssence(sunSign);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(13);
  doc.setTextColor(...colors.bodyText);
  const essenceLines = doc.splitTextToSize(essence, textW);
  essenceLines.forEach((line: string) => {
    doc.text(line, pw / 2, cardY, { align: 'center' });
    cardY += 20;
  });
  cardY += 16;

  // Line 2: What this year is asking (profection verb — no planet name)
  const yearLine = `This year is asking you to ${getYearVerb(profH)}.`;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.setTextColor(...colors.gold);
  const yearLines = doc.splitTextToSize(yearLine, textW);
  yearLines.forEach((line: string) => {
    doc.text(line, pw / 2, cardY, { align: 'center' });
    cardY += 20;
  });
  cardY += 16;

  // Line 3: Emotional tone for the year (SR Moon — no planet name)
  const moonTone = getMoonTone(srMoonSign);
  doc.setFont('helvetica', 'italic'); doc.setFontSize(13);
  doc.setTextColor(...colors.deepBrown);
  doc.text(moonTone, pw / 2, cardY, { align: 'center' });

  // Bottom stars
  const bottomStarY = ph - 80;
  doc.setFillColor(...colors.gold);
  [pw / 2 - 60, pw / 2 - 30, pw / 2, pw / 2 + 30, pw / 2 + 60].forEach(x => {
    doc.circle(x, bottomStarY, 2, 'F');
  });

  // Set y past this page
  ctx.y = ph;
}
