import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

type Color = [number, number, number];
const CARD_BG: Color = [245, 241, 234];
const INK:   Color = [58,  54,  50];
const MUTED: Color = [130, 125, 118];
const CHARCOAL: Color = [58, 54, 50];
const GOLD:  Color = [184, 150, 62];

function getNatalIdentity(sunSign: string, moonSign: string, risingSign: string): string {
  const sun: Record<string, string> = {
    Aries: 'You were born to lead, to initiate, to move first when everyone else is still deciding.',
    Taurus: 'You were born with the patience to build things that last and the instinct to find beauty in the ordinary.',
    Gemini: 'You were born to make connections others miss -- between ideas, between people, between what is and what could be.',
    Cancer: 'You were born feeling things others cannot name, caring for people before they ask, and creating safety wherever you go.',
    Leo: 'You were born with a warmth that makes people feel seen -- not because you try, but because you genuinely notice them.',
    Virgo: 'You were born with the eye that catches what everyone else overlooks, and the devotion to actually do something about it.',
    Libra: 'You were born with the rare ability to hold two sides of anything without losing yourself -- and to make peace feel possible.',
    Scorpio: 'You were born willing to go where others are afraid to look, and to love with a depth that changes people.',
    Sagittarius: 'You were born with the conviction that life is leading somewhere meaningful -- and the courage to follow it.',
    Capricorn: 'You were born with the discipline to show up even when no one is watching, and the integrity to do it right.',
    Aquarius: 'You were born seeing what the world could be, not just what it is -- and refusing to pretend otherwise.',
    Pisces: 'You were born feeling the world more deeply than most people ever will, absorbing what others cannot even sense.',
  };
  const moon: Record<string, string> = {
    Aries: 'You need space to act on your instincts without being told to slow down.',
    Taurus: 'You need safety, beauty, and time -- none of which are too much to ask.',
    Gemini: 'You need conversation, variety, and someone who keeps up with your mind.',
    Cancer: 'You need a home that feels like your own and people who show up consistently.',
    Leo: 'You need to be appreciated for who you are, not just what you do.',
    Virgo: 'You need to feel useful -- and permission to not have everything figured out.',
    Libra: 'You need peace, fairness, and relationships where you feel truly equal.',
    Scorpio: 'You need honesty, depth, and the rare person who can hold all of you.',
    Sagittarius: 'You need meaning, freedom, and room to keep growing.',
    Capricorn: 'You need respect for your ambition and someone who sees past your composure.',
    Aquarius: 'You need freedom to be exactly yourself -- especially the parts that do not fit.',
    Pisces: 'You need time alone to recharge and someone who protects your tenderness.',
  };
  const rising: Record<string, string> = {
    Aries: 'People experience you as someone who moves things -- energy shifts when you arrive.',
    Taurus: 'People experience you as steady and real -- your presence alone calms the room.',
    Gemini: 'People experience you as bright and curious -- you make everything more interesting.',
    Cancer: 'People experience you as warm and safe -- they trust you before they know why.',
    Leo: 'People experience you as magnetic -- not because you ask for it, because you earn it.',
    Virgo: 'People experience you as competent and thoughtful -- you notice what everyone else misses.',
    Libra: 'People experience you as graceful and fair -- you make others feel at ease.',
    Scorpio: 'People experience you as perceptive and intense -- they know you see through surfaces.',
    Sagittarius: 'People experience you as open and alive -- your enthusiasm is genuinely contagious.',
    Capricorn: 'People experience you as someone who has it together -- you project quiet authority.',
    Aquarius: 'People experience you as original -- you refuse to be ordinary and it shows.',
    Pisces: 'People experience you as gentle and intuitive -- you pick up on things others miss entirely.',
  };
  return `${sun[sunSign] || 'You were born with something rare.'} ${moon[moonSign] || 'What you need is to be understood.'} ${rising[risingSign] || 'You show up in a way that is uniquely yours.'}`;
}

function getYearMessage(
  profHouse: number, timeLord: string, northNodeHouse: number | null,
  hasVenusAngular: boolean, hasJupiterAngular: boolean, moonPhase: string, srSunHouse: number | null
): { body: string; closing: string } {
  const HOUSE_THEME: Record<number, string> = {
    1: 'identity and bold reinvention', 2: 'real worth -- financial and personal',
    3: 'your voice, your ideas, your mind', 4: 'home, roots, and what you are building from the inside out',
    5: 'joy, creativity, and the things that make you come alive', 6: 'your health and the daily work that sustains you',
    7: 'partnership and what you are willing to let be real', 8: 'transformation and releasing what no longer fits',
    9: 'expansion -- a bigger world, a bigger life', 10: 'your work and how the world sees what you have built',
    11: 'your people and the community you belong to', 12: 'rest, reflection, and the invisible work that matters most',
  };
  const LORD_CONDITION: Record<string, string> = {
    Saturn: 'Saturn asks that you show up for it with intention, not just inspiration.',
    Mars: 'Mars asks for courage -- the willingness to act before you feel ready.',
    Jupiter: 'Jupiter opens doors this year. Walk through them.',
    Venus: 'Venus makes this year feel more natural than it has any right to.',
    Mercury: 'Mercury asks you to think clearly, communicate honestly, and trust your own mind.',
    Moon: 'The Moon asks you to feel your way through rather than reason your way through.',
    Sun: 'The Sun asks you to be the main character -- not for performance, but for real.',
    Pluto: 'Pluto asks you to let something fundamental change.',
    Neptune: 'Neptune asks you to trust what you cannot yet prove.',
    Uranus: 'Uranus asks you to stay flexible. The detour is often the point.',
  };
  const houseTheme = HOUSE_THEME[profHouse] || 'the work that matters most this year';
  const lordCondition = LORD_CONDITION[timeLord] || 'The year has conditions. Meet them.';
  const isBalsamic = moonPhase?.toLowerCase().includes('balsamic');
  const is12thSun = srSunHouse === 12;
  const nodeInSurrenderHouse = northNodeHouse === 12 || northNodeHouse === 9;
  let body = `This year calls you toward ${houseTheme}. ${lordCondition}`;
  if (is12thSun || isBalsamic) body += ' The most important work happens quietly this year.';
  if (nodeInSurrenderHouse) body += ' Trust what you cannot see yet. Growth comes through trust in the process, not force.';
  if (hasVenusAngular) body += ' You are more magnetic than you realize.';
  else if (hasJupiterAngular) body += ' Something is expanding in your world. Make room for it.';
  const closings: Record<number, string> = {
    1: 'Becoming is better than being. -- Carol Dweck',
    2: 'Know your worth, then add tax.',
    3: 'The right word may be effective, but no word was ever as effective as a rightly timed pause. -- Mark Twain',
    4: 'Where we love is home -- home that our feet may leave, but not our hearts. -- Oliver Wendell Holmes',
    5: 'You cannot use up creativity. The more you use, the more you have. -- Maya Angelou',
    6: 'Take care of your body. It is the only place you have to live. -- Jim Rohn',
    7: 'The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed. -- C.G. Jung',
    8: 'What we do not need in the midst of struggle is shame for being human. -- Brene Brown',
    9: 'The world is a book, and those who do not travel read only one page. -- Saint Augustine',
    10: 'Whatever you are, be a good one. -- Abraham Lincoln',
    11: 'The glory of friendship is the spiritual inspiration that comes when you discover that someone else believes in you. -- Ralph Waldo Emerson',
    12: 'Almost everything will work again if you unplug it for a few minutes -- including you. -- Anne Lamott',
  };
  return { body, closing: closings[profHouse] || 'Trust yourself. You know more than you think you do. -- Benjamin Spock' };
}

// ── Chart-specific closing send-off ──────────────────────────────────────
// Built from the SR Ascendant, SR Sun house, and the single most powerful
// SR-to-natal aspect. Returns three short paragraphs that read like the
// last thing a trusted astrologer says before you leave the room.
const SR_ASC_THEME: Record<string, string> = {
  Aries: 'a year of starting things and trusting the first move',
  Taurus: 'a year of building something steady and refusing to be rushed',
  Gemini: 'a year of voice, ideas, and saying what you actually think',
  Cancer: 'a year of tending what is yours and letting people in closer',
  Leo: 'a year of stepping forward and being seen on purpose',
  Virgo: 'a year of refining the work and trusting your own standards',
  Libra: 'a year of relationships and the choices they ask of you',
  Scorpio: 'a year of going deeper than you usually let yourself go',
  Sagittarius: 'a year of widening your life and trusting where it points',
  Capricorn: 'a year of building something that holds and showing up for it',
  Aquarius: 'a year of doing it your own way and not apologizing for that',
  Pisces: 'a year of feeling more, sensing more, and trusting what comes through',
};

const SR_SUN_HOUSE_FOCUS: Record<number, string> = {
  1: 'how you show up and who you are becoming',
  2: 'what you are worth and what you actually want to own',
  3: 'your voice and the conversations you are ready to have',
  4: 'home, family, and the foundation you are quietly rebuilding',
  5: 'joy, creativity, and what makes you feel alive',
  6: 'the daily work and the body that carries it',
  7: 'partnership and the people across the table from you',
  8: 'what is ending, what is changing, and what is being shared',
  9: 'a wider life — travel, study, belief, perspective',
  10: 'your work in the world and how it is being seen',
  11: 'your people, your circle, and what you are building together',
  12: 'inner work, rest, and the quiet things that are not yet visible',
};

const ASPECT_ASK: Record<string, string> = {
  Conjunction: 'fuse this part of you with what the year is doing',
  Opposition: 'hold the tension instead of collapsing one side of it',
  Square: 'do the thing the friction is pointing at, not the easier thing',
  Trine: 'use the ease — do not mistake it for permission to coast',
  Sextile: 'take the opening when it shows up; it will not knock twice',
};

function buildClosingSendOff(
  name: string,
  a: SolarReturnAnalysis,
  srChart: SolarReturnChart,
): { line1: string; line2: string; line3: string } {
  const srAscSign =
    a.yearlyTheme?.ascendantSign ||
    srChart.houseCusps?.house1?.sign ||
    srChart.planets?.Ascendant?.sign ||
    '';
  const srSunHouse = a.sunHouse?.house ?? null;
  const ascTheme = SR_ASC_THEME[srAscSign] || 'a year that is asking you to show up as yourself';
  const sunFocus = srSunHouse ? SR_SUN_HOUSE_FOCUS[srSunHouse] || '' : '';

  // Strongest SR-to-natal aspect = tightest orb, preferring outer-planet hits
  // because those carry the year's structural weight. Falls back to the
  // tightest aspect overall.
  const STRUCTURAL = new Set(['Saturn', 'Uranus', 'Neptune', 'Pluto', 'Jupiter']);
  const aspects = Array.isArray(a.srToNatalAspects) ? a.srToNatalAspects : [];
  let strongest: any = null;
  for (const asp of aspects) {
    if (!asp) continue;
    if (!STRUCTURAL.has(asp.planet1) && !STRUCTURAL.has(asp.planet2)) continue;
    if (!strongest || (asp.orb ?? 99) < (strongest.orb ?? 99)) strongest = asp;
  }
  if (!strongest && aspects.length > 0) {
    strongest = [...aspects].sort((x, y) => (x.orb ?? 99) - (y.orb ?? 99))[0];
  }

  let definingTheme: string;
  if (strongest) {
    const aspectAsk = ASPECT_ASK[strongest.type] || `let this ${strongest.type?.toLowerCase() || 'contact'} actually move you`;
    definingTheme =
      `${name}, this Solar Return is ${ascTheme}` +
      (sunFocus ? `, with the year's center of gravity sitting in ${sunFocus}` : '') +
      `. The clearest signal in your chart is SR ${strongest.planet1} ${strongest.type?.toLowerCase()} natal ${strongest.planet2} — that is the one to listen to.`;
  } else {
    definingTheme =
      `${name}, this Solar Return is ${ascTheme}` +
      (sunFocus ? `, with the year's center of gravity sitting in ${sunFocus}` : '') +
      '.';
  }

  const ask = strongest
    ? `What this year is actually asking of you is to ${ASPECT_ASK[strongest.type]?.replace(/^./, c => c.toLowerCase()) || 'meet what is in front of you with both hands'}.`
    : sunFocus
      ? `What this year is actually asking of you is to put your real attention on ${sunFocus}.`
      : `What this year is actually asking of you is to stop hedging and meet it.`;

  // Send-off: specific, warm, earned. References SR Ascendant + Sun house so
  // it reads as written for this chart, not as a template.
  const sendOff = sunFocus
    ? `Go live the year, ${name} — the one with ${srAscSign} on the door and the work happening in ${sunFocus}. I will see you on the other side of it.`
    : `Go live the year, ${name} — the one with ${srAscSign} on the door. I will see you on the other side of it.`;

  return { line1: definingTheme, line2: ask, line3: sendOff };
}

/**
 * Combined closing page: "Take This With You"
 * Merges the affirmation card content + closing letter into a single elegant page.
 */
export function generateAffirmationCard(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, natalChart: NatalChart, srChart: SolarReturnChart,
) {
  const { pw, ph, margin } = ctx;
  const cx = pw / 2;
  const name = natalChart.name || 'Beautiful Soul';
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
  const { body } = getYearMessage(profH, timeLord, northNodeHouse, hasVenusAngular, hasJupiterAngular, moonPhase, srSunHouse);
  const sendOff = buildClosingSendOff(name, a, srChart);

  // Full-bleed white page
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pw, ph, 'F');

  // Diamond ornament
  ctx.y = 46;
  doc.setFillColor(...GOLD);
  doc.triangle(cx, ctx.y - 6, cx - 4, ctx.y, cx + 4, ctx.y, 'F');
  doc.triangle(cx, ctx.y + 6, cx - 4, ctx.y, cx + 4, ctx.y, 'F');
  ctx.y += 18;

  // Title
  doc.setFont('times', 'italic'); doc.setFontSize(28);
  doc.setTextColor(...INK);
  doc.text('Take This With You', cx, ctx.y, { align: 'center' });
  ctx.y += 14;

  // Gold rule
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
  doc.line(cx - 60, ctx.y, cx + 60, ctx.y);
  ctx.y += 20;

  // Opening salutation — chart-specific closing is rendered after the cards.
  doc.setFont('times', 'normal'); doc.setFontSize(10.5);
  doc.setTextColor(...INK);
  doc.text(`${name},`, cx, ctx.y, { align: 'center' });
  ctx.y += 14;

  ctx.y += 14;

  // ── Natal Strength card ──
  const cardW = pw - margin * 2 - 16;
  const cardX = (pw - cardW) / 2;
  const identityLines: string[] = doc.splitTextToSize(identity, cardW - 28);
  const card1H = 22 + identityLines.length * 13 + 10;

  doc.setFillColor(...CARD_BG);
  doc.roundedRect(cardX, ctx.y, cardW, card1H, 2, 2, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(cardX, ctx.y, 2.5, card1H, 'F');

  let cy = ctx.y + 16;
  doc.setFont('times', 'bold'); doc.setFontSize(6);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(2.5);
  doc.text('YOUR NATAL STRENGTH', cardX + 14, cy);
  doc.setCharSpace(0);
  cy += 12;

  doc.setFont('times', 'normal'); doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  for (const line of identityLines) { doc.text(line, cardX + 14, cy); cy += 13; }

  ctx.y += card1H + 14;

  // ── This Year's Ask card ──
  const bodyLines: string[] = doc.splitTextToSize(body, cardW - 28);
  const card2H = 22 + bodyLines.length * 13 + 10;

  doc.setFillColor(...CARD_BG);
  doc.roundedRect(cardX, ctx.y, cardW, card2H, 2, 2, 'F');
  doc.setFillColor(...GOLD);
  doc.rect(cardX, ctx.y, 2.5, card2H, 'F');

  cy = ctx.y + 16;
  doc.setFont('times', 'bold'); doc.setFontSize(6);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(2.5);
  doc.text('THIS YEAR\'S ASK', cardX + 14, cy);
  doc.setCharSpace(0);
  cy += 12;

  doc.setFont('times', 'normal'); doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  for (const line of bodyLines) { doc.text(line, cardX + 14, cy); cy += 13; }

  ctx.y += card2H + 18;

  // ── Closing quote ──
  doc.setDrawColor(...GOLD); doc.setLineWidth(0.3);
  doc.line(cx - 36, ctx.y, cx + 36, ctx.y);

  const dashIdx = closing.lastIndexOf(' -- ');
  const quoteText = dashIdx > 0 ? closing.slice(0, dashIdx) : closing;
  const attribution = dashIdx > 0 ? closing.slice(dashIdx + 4) : '';

  ctx.y += 18;
  doc.setFont('times', 'italic'); doc.setFontSize(14);
  doc.setTextColor(...CHARCOAL);
  const quoteLines: string[] = doc.splitTextToSize(quoteText, pw * 0.55);
  for (const line of quoteLines) {
    doc.text(line, cx, ctx.y, { align: 'center' });
    ctx.y += 18;
  }

  if (attribution) {
    ctx.y += 4;
    doc.setFont('times', 'normal'); doc.setFontSize(7);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(2.5);
    doc.text(`-- ${attribution.toUpperCase()}`, cx, ctx.y, { align: 'center' });
    doc.setCharSpace(0);
  }

  // ── Happy Birthday sign-off ──
  ctx.y += 22;
  doc.setFont('times', 'italic'); doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text('Happy Birthday. Trust your inner wisdom.', cx, ctx.y, { align: 'center' });

  // Bottom diamond
  ctx.y += 20;
  doc.setFillColor(...GOLD);
  doc.triangle(cx, ctx.y - 4, cx - 3, ctx.y, cx + 3, ctx.y, 'F');
  doc.triangle(cx, ctx.y + 4, cx - 3, ctx.y, cx + 3, ctx.y, 'F');

  ctx.y = ph;
}
