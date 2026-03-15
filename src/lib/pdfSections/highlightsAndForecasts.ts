import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { P } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];
const INK:   Color = [58,  54,  50];
const MUTED: Color = [130, 125, 118];
const GOLD:  Color = [184, 150, 62];
const RULE:  Color = [200, 195, 188];
const CARD_BG: Color = [245, 241, 234];
const CREAM: Color = [250, 247, 242];

const LIFE_THEMES: Record<number, { short: string; detail: string }> = {
  1: { short: 'Your New Year Begins', detail: 'your identity, confidence, and how you present yourself to the world' },
  2: { short: 'Money and Worth', detail: 'your finances, possessions, and sense of self-worth' },
  3: { short: 'Communication', detail: 'conversations, learning, writing, and your local world' },
  4: { short: 'Home and Family', detail: 'your home life, family dynamics, and emotional foundations' },
  5: { short: 'Joy and Creativity', detail: 'romance, creative projects, fun, and children' },
  6: { short: 'Body Check-In', detail: 'your daily habits, health, and work life' },
  7: { short: 'Relationships', detail: 'partnerships, commitments, and one-on-one dynamics' },
  8: { short: 'Going Deeper', detail: 'deep transformation, shared resources, and intimacy' },
  9: { short: 'Broaden Your Horizons', detail: 'travel, learning, big-picture thinking, and new perspectives' },
  10: { short: 'Career in Focus', detail: 'your professional life, public reputation, and ambitions' },
  11: { short: 'Your People', detail: 'friendships, social circles, and your hopes for the future' },
  12: { short: 'Quiet Time', detail: 'rest, reflection, spiritual life, and processing what is hidden' },
};

function ord(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

function lifeTheme(house: number): string {
  return LIFE_THEMES[house]?.detail || 'general life themes';
}

function getSignFeel(sign: string): string {
  const feels: Record<string, string> = {
    Aries: 'urgency, independence, raw courage', Taurus: 'groundedness, sensuality, comfort-seeking',
    Gemini: 'curiosity, restlessness, quick connections', Cancer: 'deep nurturing, protectiveness',
    Leo: 'warmth, pride, generosity', Virgo: 'analytical processing, self-improvement',
    Libra: 'harmony-seeking, romantic idealism', Scorpio: 'intensity, obsessive focus',
    Sagittarius: 'optimism, restless seeking', Capricorn: 'controlled emotions, ambition',
    Aquarius: 'detachment, unconventional processing', Pisces: 'boundless empathy, spiritual sensitivity',
  };
  return feels[sign] || 'mixed emotional tones';
}

function extractEnergySummary(fullText: string): { energy: string; powerMove: string } {
  const sentences = fullText.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
  const energy = sentences[0] || fullText.slice(0, 120) + '...';
  const actionWords = ['build', 'create', 'trust', 'channel', 'lean', 'step', 'say', 'make', 'let', 'use', 'ask', 'show', 'take', 'start', 'stop', 'choose', 'embrace', 'release', 'focus', 'walk'];
  let powerMove = '';
  for (const s of sentences.slice(1)) {
    if (actionWords.some(w => s.toLowerCase().includes(w))) { powerMove = s; break; }
  }
  if (!powerMove && sentences.length > 1) powerMove = sentences[sentences.length - 1];
  if (!powerMove) powerMove = 'Pay attention to what shifts here -- it matters.';
  return { energy: energy.trim(), powerMove: powerMove.trim() };
}

interface YearHighlight { label: string; timing: string; body: string; }

function buildHighlights(a: SolarReturnAnalysis, _srChart: SolarReturnChart, _natalChart: NatalChart): YearHighlight[] {
  const highlights: YearHighlight[] = [];
  const MAJOR_PLANETS = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
  if (a.profectionYear) {
    const hNum = a.profectionYear.houseNumber;
    const srH = a.profectionYear.timeLordSRHouse;
    highlights.push({ label: "THIS YEAR'S FOCUS", timing: `${ord(hNum)} House Profection Year`, body: `This year the spotlight lands on ${lifeTheme(hNum)}. Everything significant circles back to this area.${srH ? ` The energy channels most directly into ${lifeTheme(srH)}.` : ''}` });
  }
  if (a.moonSign && a.moonHouse?.house) {
    highlights.push({ label: 'EMOTIONAL CLIMATE', timing: `Moon in ${ord(a.moonHouse.house)} House`, body: `Your emotional life this year orbits ${getSignFeel(a.moonSign)} themes. The ${ord(a.moonHouse.house)} house is where you feel the most.` });
  }
  if (a.stelliums.length > 0) {
    const s = a.stelliums[0];
    const notableExtras = (s.extras || []).filter((e: string) => e === 'Chiron' || e === 'NorthNode');
    const extrasNote = notableExtras.length > 0
      ? ` Also contains ${notableExtras.map((e: string) => e === 'NorthNode' ? 'North Node' : e).join(' and ')}.`
      : '';
    highlights.push({ label: 'POWER ZONE', timing: `${s.planets.length}-Planet Stellium`, body: `${s.planets.map(p => P[p] || p).join(', ')} pile into ${s.location} -- a concentrated demand for attention.${extrasNote}` });
  }
  if (a.srToNatalAspects.length > 0) {
    const strongest = a.srToNatalAspects.find(asp => MAJOR_PLANETS.has(asp.planet1) && MAJOR_PLANETS.has(asp.planet2) && !(asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction'));
    if (strongest) highlights.push({ label: 'YEAR-DEFINING ASPECT', timing: `SR ${P[strongest.planet1] || strongest.planet1} ${strongest.type} Natal ${P[strongest.planet2] || strongest.planet2}`, body: strongest.interpretation });
  }
  return highlights.slice(0, 4);
}

interface MonthForecast { month: string; year: number; headline: string; body: string; }

function buildPersonalizedMonthlyForecasts(a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart): MonthForecast[] {
  const forecasts: MonthForecast[] = [];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const srYear = srChart.solarReturnYear || new Date().getFullYear();
  let birthMonth = 2;
  if (natalChart.birthDate) {
    const parts = natalChart.birthDate.split(/[-/]/);
    if (parts.length >= 2) {
      const candidate = parts[0].length === 4 ? parseInt(parts[1], 10) - 1 : parseInt(parts[0], 10) - 1;
      if (candidate >= 0 && candidate <= 11) birthMonth = candidate;
    }
  }
  const profH = a.profectionYear?.houseNumber || 0;
  const moonSign = a.moonSign || '';
  const stelliums = a.stelliums || [];
  const retros = a.retrogrades?.planets || [];
  const sunH = a.sunHouse?.house || 1;

  for (let i = 0; i < 12; i++) {
    const mIdx = (birthMonth + i) % 12;
    const themeH = ((profH - 1 + i) % 12) + 1;
    const theme = LIFE_THEMES[themeH] || LIFE_THEMES[1];
    const year = mIdx < birthMonth ? srYear + 1 : srYear;
    let headline = theme.short;
    if (i === 0) headline = 'Your New Year Begins';
    if (i === 11) headline = 'Wrapping Up';

    let body = `Your attention turns toward ${theme.detail}.`;
    if (i === 0) {
      body = `Fresh energy arrives. Your attention turns toward ${theme.detail} -- that is where this year lands first.`;
      if (stelliums.length > 0) {
        const s = stelliums[0];
        const notableExtras = (s.extras || []).filter((e: string) => e === 'Chiron' || e === 'NorthNode');
        const extrasNote = notableExtras.length > 0
          ? ` (also with ${notableExtras.map((e: string) => e === 'NorthNode' ? 'North Node' : e).join(' and ')})`
          : '';
        body += ` With ${s.planets.map(p => P[p] || p).join(', ')} concentrated in ${s.location}${extrasNote}, expect intense activity in that area.`;
      }
    }
    if (i === 1) {
      body = `Your attention turns toward ${theme.detail}.`;
      if (stelliums.length > 0) {
        const s = stelliums[0];
        const notableExtras = (s.extras || []).filter((e: string) => e === 'Chiron' || e === 'NorthNode');
        const extrasNote = notableExtras.length > 0
          ? ` (also with ${notableExtras.map((e: string) => e === 'NorthNode' ? 'North Node' : e).join(' and ')})`
          : '';
        body += ` With ${s.planets.map(p => P[p] || p).join(', ')} concentrated in ${s.location}${extrasNote}, expect intense activity in that area.`;
      }
    }
    if (i === 11) body = 'The year is winding down. Let the year wisdom settle before the next one begins.';
    if (i >= 2 && i < 11) {
      if (stelliums.length > 0 && i < 4) {
        const s = stelliums[0];
        const notableExtras = (s.extras || []).filter((e: string) => e === 'Chiron' || e === 'NorthNode');
        const extrasNote = notableExtras.length > 0
          ? ` (also with ${notableExtras.map((e: string) => e === 'NorthNode' ? 'North Node' : e).join(' and ')})`
          : '';
        body += ` With ${s.planets.map(p => P[p] || p).join(', ')} concentrated in ${s.location}${extrasNote}, expect intense activity in that area.`;
      }
      if (retros.length > 0 && i >= 3 && i <= 5) {
        body += ` ${retros.map(r => P[r] || r).join(' ')} retrograde asks you to revisit something unfinished before moving forward.`;
      }
      if (moonSign && i >= 6 && i <= 9) {
        const moonFeelShort: Record<string, string> = {
          Aries: 'direct emotional energy', Taurus: 'steady emotional presence', Gemini: 'verbal emotional processing',
          Cancer: 'deep emotional sensitivity', Leo: 'warm emotional expression', Virgo: 'analytical emotional processing',
          Libra: 'harmony-seeking feelings', Scorpio: 'intense emotional honesty', Sagittarius: 'restless emotional energy',
          Capricorn: 'discipline around how you present yourself continues to pay off', Aquarius: 'detached emotional clarity',
          Pisces: 'heightened empathy and compassion',
        };
        body += ` ${moonSign} Moon -- ${moonFeelShort[moonSign] || 'mixed emotional tones'}.`;
      }
      if (sunH === 12 && i >= 4 && i <= 7) {
        body += ' The 12th house energy is at its strongest -- bold moves made quietly are the most effective.';
      }
    }
    forecasts.push({ month: monthNames[mIdx], year, headline, body });
  }
  return forecasts;
}

export function generateHighlightsPage(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart,
) {
  const { pw, ph, margin, contentW } = ctx;

  ctx.pageBg(doc);

  // Section header
  ctx.y += 28;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('HIGHLIGHTS', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 10;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 28;

  doc.setFont('times', 'normal'); doc.setFontSize(32);
  doc.setTextColor(...INK);
  doc.text('Year at a Glance', margin, ctx.y);
  ctx.y += 14;

  doc.setFont('times', 'italic'); doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('Your key themes and where the year concentrates', margin, ctx.y);
  ctx.y += 30;

  // Highlights as condensed cards
  const highlights = buildHighlights(a, srChart, natalChart);
  for (const h of highlights) {
    const { energy, powerMove } = extractEnergySummary(h.body);

    ctx.checkPage(120);

    ctx.drawCard(doc, () => {
      ctx.trackedLabel(doc, h.label, margin + 14, ctx.y, { size: 7, charSpace: 2.5 });
      ctx.y += 14;

      doc.setFont('times', 'bold'); doc.setFontSize(14);
      doc.setTextColor(...INK);
      const valLines: string[] = doc.splitTextToSize(h.timing, contentW - 28);
      for (const vl of valLines) { doc.text(vl, margin + 14, ctx.y); ctx.y += 18; }
      ctx.y += 6;

      // The Energy
      doc.setFont('times', 'bold'); doc.setFontSize(7);
      doc.setTextColor(...GOLD);
      doc.setCharSpace(2);
      doc.text('THE ENERGY', margin + 14, ctx.y);
      doc.setCharSpace(0);
      ctx.y += 12;
      doc.setFont('times', 'normal'); doc.setFontSize(10);
      doc.setTextColor(...INK);
      const elines: string[] = doc.splitTextToSize(energy, contentW - 28);
      for (const l of elines.slice(0, 2)) { doc.text(l, margin + 14, ctx.y); ctx.y += 14; }
      ctx.y += 6;

      // The Power Move
      doc.setFont('times', 'bold'); doc.setFontSize(7);
      doc.setTextColor(...GOLD);
      doc.setCharSpace(2);
      doc.text('THE POWER MOVE', margin + 14, ctx.y);
      doc.setCharSpace(0);
      ctx.y += 12;
      doc.setFont('times', 'italic'); doc.setFontSize(10);
      doc.setTextColor(...INK);
      const plines: string[] = doc.splitTextToSize(powerMove, contentW - 28);
      for (const l of plines.slice(0, 2)) { doc.text(l, margin + 14, ctx.y); ctx.y += 14; }
    });
  }

  // MONTH-BY-MONTH — fit all 12 on ONE page, full-width cards
  doc.addPage();
  ctx.y = ctx.margin;
  ctx.pageBg(doc);

  // Header
  ctx.y += 16;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('MONTHLY FORECAST', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 16;
  doc.setFont('times', 'normal'); doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text('Month by Month', margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 10;

  const forecasts = buildPersonalizedMonthlyForecasts(a, srChart, natalChart);
  const columnGap = 10;
  const rowGap = 5;
  const cardW = (contentW - columnGap) / 2;
  const cardPadX = 10;
  const cardPadTop = 8;
  const bodyLineH = 8.5;

  // Calculate available height for cards
  const availH = ph - ctx.y - margin - 10;
  const numRows = 6;
  const maxRowH = Math.floor((availH - rowGap * (numRows - 1)) / numRows);

  const measureCard = (f: MonthForecast | undefined) => {
    if (!f) return { bodyLines: [] as string[], height: 0 };
    const fullText = `${f.body}`;
    const bodyLines = doc.splitTextToSize(fullText, cardW - cardPadX * 2) as string[];
    return { bodyLines, height: cardPadTop + 16 + bodyLines.length * bodyLineH + 4 };
  };

  const drawMonthCard = (f: MonthForecast, bodyLines: string[], cardH: number, x: number, rowY: number) => {
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(x, rowY, cardW, cardH, 2, 2, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.2);
    doc.roundedRect(x, rowY, cardW, cardH, 2, 2, 'S');
    doc.setFillColor(...GOLD);
    doc.rect(x, rowY, 2.5, cardH, 'F');

    let cy = rowY + cardPadTop;

    // Month name — bigger and bolder
    doc.setFont('times', 'bold'); doc.setFontSize(14);
    doc.setTextColor(...INK);
    doc.text(f.month, x + cardPadX, cy);

    // Year right-flush
    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(String(f.year), x + cardW - cardPadX, cy, { align: 'right' });
    cy += 14;

    // Body text — no truncation
    doc.setFont('times', 'normal'); doc.setFontSize(7.5);
    doc.setTextColor(...INK);
    for (const line of bodyLines) { doc.text(line, x + cardPadX, cy); cy += bodyLineH; }
  };

  let index = 0;
  while (index < forecasts.length) {
    const left = forecasts[index];
    const right = forecasts[index + 1];
    const leftMeasured = measureCard(left);
    const rightMeasured = measureCard(right);
    const rowH = Math.max(leftMeasured.height, rightMeasured?.height || 0, 50);

    const rowY = ctx.y;
    drawMonthCard(left, leftMeasured.bodyLines, rowH, margin, rowY);
    if (right) {
      drawMonthCard(right, rightMeasured.bodyLines, rowH, margin + cardW + columnGap, rowY);
    }
    ctx.y = rowY + rowH + rowGap;
    index += 2;
  }
}
