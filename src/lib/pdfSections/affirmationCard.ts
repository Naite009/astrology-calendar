import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

/**
 * Birthday Affirmation Card — warm, personal, inspiring.
 * Paragraphs about who you are (Sun, Moon, Rising) followed by
 * a single closing line about the year ahead. No planet names. No jargon.
 */

function getSignGift(sign: string): string {
  const gifts: Record<string, string> = {
    Aries: 'You were born with the courage to begin before anyone else is ready. That is your gift — the instinct to move first, to trust yourself when the path is unclear. People remember your energy long after you leave the room.',
    Taurus: 'You were born with the patience to build things that last. You bring calm to chaos, beauty to the ordinary, and steadiness to the people lucky enough to be close to you.',
    Gemini: 'You were born with a mind that makes connections others miss entirely. You see patterns, possibilities, and angles that no one else catches. That is not restlessness — it is brilliance.',
    Cancer: 'You were born with the ability to make people feel safe before they even understand why. Your emotional intelligence is extraordinary. People feel held in your presence.',
    Leo: 'You were born with the kind of warmth that makes people feel celebrated. You light up rooms without trying. That generosity of spirit is rare and people are drawn to it.',
    Virgo: 'You were born with the eye that catches what everyone else overlooks. Your devotion to getting things right — especially for the people you love — is your superpower.',
    Libra: 'You were born with the grace to hold two sides of any situation without losing yourself. You bring fairness, beauty, and balance to everything you touch.',
    Scorpio: 'You were born with the willingness to go where others are afraid to look. Your depth, your loyalty, and your refusal to accept anything fake — that is what makes you irreplaceable.',
    Sagittarius: 'You were born with a faith that life is leading you somewhere meaningful. Your optimism is not naivety — it is earned wisdom. You expand whatever you touch.',
    Capricorn: 'You were born with the discipline to show up even when no one is watching. You play the long game, and the people who know you best trust you with everything.',
    Aquarius: 'You were born with the vision to see what the world could be, not just what it is. Your originality is not rebellion — it is a gift that makes room for everyone.',
    Pisces: 'You were born with a sensitivity that changes the people around you. You absorb the emotional frequency of every room. That is not a weakness — it is your greatest strength.',
  };
  return gifts[sign] || 'You bring something to this world that no one else can replicate.';
}

function getMoonNeed(sign: string): string {
  const needs: Record<string, string> = {
    Aries: 'What you need — really need — is the space to act on your feelings without being told to slow down. That is not too much to ask.',
    Taurus: 'What you need — really need — is safety, comfort, and the freedom to take your time. That is not too much to ask.',
    Gemini: 'What you need — really need — is conversation, variety, and someone who keeps up with your mind. That is not too much to ask.',
    Cancer: 'What you need — really need — is a home that feels like your own, and people who show up consistently. That is the minimum you deserve.',
    Leo: 'What you need — really need — is to be appreciated not for what you do, but for who you are. That is not too much to ask.',
    Virgo: 'What you need — really need — is to feel useful, and permission to not have everything figured out. That is not too much to ask.',
    Libra: 'What you need — really need — is peace, beauty, and relationships where you feel truly equal. That is not too much to ask.',
    Scorpio: 'What you need — really need — is honesty, even when it is uncomfortable, and real emotional depth. That is not too much to ask.',
    Sagittarius: 'What you need — really need — is adventure, meaning, and room to change your mind. That is not too much to ask.',
    Capricorn: 'What you need — really need — is respect for your ambition and someone who sees past your composure. That is not too much to ask.',
    Aquarius: 'What you need — really need — is freedom to be different and people who love you for exactly that. That is not too much to ask.',
    Pisces: 'What you need — really need — is time alone to recharge, and someone who protects your tenderness. That is not too much to ask.',
  };
  return needs[sign] || 'What you need is to be understood without having to explain yourself.';
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

/** Warm, inviting year-ahead closing — feels like encouragement, not a task */
function getYearInspiration(profHouse: number, srMoonSign: string): string {
  const themes: Record<number, string> = {
    1: 'This is your year to step more fully into who you are becoming. You do not need to have it figured out — just keep showing up as yourself. The rest will follow.',
    2: 'This is your year to remember what you are worth — and to stop settling for less. You already have everything you need to build something meaningful.',
    3: 'This is your year to speak up, share your ideas, and trust your voice. The things you have been holding back? They are ready to be heard.',
    4: 'This is your year to come home to yourself. Whatever "home" means to you — a place, a feeling, a person — you are allowed to build it exactly the way you need it.',
    5: 'This is your year to follow the joy. Create, play, take the risk that excites you. The things you make this year — art, love, memories — will surprise you with how much they matter.',
    6: 'This is your year to take care of yourself with the same devotion you give everyone else. Small, daily choices will add up to something powerful.',
    7: 'This is your year for real partnership. Let someone truly see you. The right connections will meet you where you are.',
    8: 'This is your year to release what no longer fits. It is not loss — it is making room. What comes next will be worth the space you create.',
    9: 'This is your year to expand. Travel, learn, explore something that changes how you see the world. Your perspective is ready to grow.',
    10: 'This is your year to be seen for what you have built. The work you have done is ready to be recognized. Step forward with confidence.',
    11: 'This is your year to find your people. The friendships and communities that align with who you really are — they are looking for you too.',
    12: 'This is your year to rest, reflect, and trust what is unfolding beneath the surface. Quiet does not mean nothing is happening. Something beautiful is preparing itself.',
  };
  return themes[profHouse] || 'This is your year. Trust yourself.';
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

  // ── THE BIRTHDAY MESSAGE ──
  const textW = contentW - 100;

  // Paragraph 1: Your Sun — who you are
  const p1 = getSignGift(sunSign);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(11);
  doc.setTextColor(...colors.bodyText);
  const p1Lines = doc.splitTextToSize(p1, textW);
  p1Lines.forEach((line: string) => {
    doc.text(line, pw / 2, cardY, { align: 'center' });
    cardY += 15;
  });
  cardY += 8;

  // Paragraph 2: Your Moon — what you need
  if (moonSign) {
    const p2 = getMoonNeed(moonSign);
    const p2Lines = doc.splitTextToSize(p2, textW);
    p2Lines.forEach((line: string) => {
      doc.text(line, pw / 2, cardY, { align: 'center' });
      cardY += 15;
    });
    cardY += 8;
  }

  // Paragraph 3: Your Rising — how the world sees you
  if (risingSign) {
    const p3 = getRisingMessage(risingSign);
    doc.setFont('helvetica', 'italic'); doc.setFontSize(11);
    doc.setTextColor(...colors.deepBrown);
    const p3Lines = doc.splitTextToSize(p3, textW);
    p3Lines.forEach((line: string) => {
      doc.text(line, pw / 2, cardY, { align: 'center' });
      cardY += 15;
    });
    cardY += 12;
  }

  // Paragraph 4: Year-ahead inspiration — warm, inviting, no planet names
  const p4 = getYearInspiration(profH, srMoonSign);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.setTextColor(...colors.gold);
  const p4Lines = doc.splitTextToSize(p4, textW);
  p4Lines.forEach((line: string) => {
    doc.text(line, pw / 2, cardY, { align: 'center' });
    cardY += 15;
  });

  // Bottom stars
  const bottomStarY = ph - 80;
  doc.setFillColor(...colors.gold);
  [pw / 2 - 60, pw / 2 - 30, pw / 2, pw / 2 + 30, pw / 2 + 60].forEach(x => {
    doc.circle(x, bottomStarY, 2, 'F');
  });

  // Set y past this page
  ctx.y = ph;
}
