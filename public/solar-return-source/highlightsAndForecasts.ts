import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { P } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const GOLD:  Color = [184, 150, 62];
const RULE:  Color = [200, 195, 188];
const CARD_BG: Color = [245, 241, 234];
const CREAM: Color = [250, 247, 242];

const LIFE_THEMES: Record<number, { short: string; detail: string }> = {
  1: { short: 'Your New Year Begins', detail: 'your identity, confidence, and how you present yourself to the world' },
  2: { short: 'Money & Worth', detail: 'your finances, possessions, and sense of self-worth' },
  3: { short: 'Communication', detail: 'conversations, learning, writing, and your local world' },
  4: { short: 'Home & Family', detail: 'your home life, family dynamics, and emotional foundations' },
  5: { short: 'Joy & Creativity', detail: 'romance, creative projects, fun, and children' },
  6: { short: 'Body Check-In', detail: 'your daily habits, health, and work life' },
  7: { short: 'Relationships', detail: 'partnerships, commitments, and one-on-one dynamics' },
  8: { short: 'Going Deeper', detail: 'deep transformation, shared resources, and intimacy' },
  9: { short: 'Broaden Your Horizons', detail: 'travel, learning, big-picture thinking, and new perspectives' },
  10: { short: 'Career in Focus', detail: 'your professional life, public reputation, and ambitions' },
  11: { short: 'Your People', detail: 'friendships, social circles, and your hopes for the future' },
  12: { short: 'Quiet Time', detail: 'rest, reflection, spiritual life, and processing what is hidden' },
};

function ord(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function lifeTheme(house: number): string {
  return LIFE_THEMES[house]?.detail || 'general life themes';
}

interface YearHighlight { label: string; timing: string; body: string; }

function getSignFeel(sign: string): string {
  const feels: Record<string, string> = {
    Aries: 'urgency, independence, impatience, raw courage', Taurus: 'groundedness, sensuality, stubbornness, comfort-seeking',
    Gemini: 'curiosity, restlessness, quick connections', Cancer: 'deep nurturing, protectiveness, mood swings',
    Leo: 'warmth, pride, generosity, need for recognition', Virgo: 'analytical processing, self-improvement, anxiety about details',
    Libra: 'harmony-seeking, people-pleasing, romantic idealism', Scorpio: 'intensity, obsessive focus, emotional extremes',
    Sagittarius: 'optimism, restless seeking, need for freedom', Capricorn: 'controlled emotions, ambition channeling feelings',
    Aquarius: 'detachment, unconventional processing', Pisces: 'boundless empathy, escapism, spiritual sensitivity',
  };
  return feels[sign] || 'mixed emotional tones';
}

function buildHighlights(a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart): YearHighlight[] {
  const highlights: YearHighlight[] = [];
  if (a.profectionYear) {
    const hNum = a.profectionYear.houseNumber;
    const srH = a.profectionYear.timeLordSRHouse;
    highlights.push({ label: `THIS YEAR'S FOCUS`, timing: `${ord(hNum)} House Profection Year`, body: `This year the spotlight lands on ${lifeTheme(hNum)}. Everything significant circles back to this area.${srH ? ` The energy channels most directly into ${lifeTheme(srH)}.` : ''}` });
  }
  if (a.moonSign && a.moonHouse?.house) {
    highlights.push({ label: `EMOTIONAL CLIMATE`, timing: `Moon in ${ord(a.moonHouse.house)} House`, body: `Your emotional life this year orbits ${getSignFeel(a.moonSign)} themes. The ${ord(a.moonHouse.house)} house is where you feel the most.` });
  }
  if (a.stelliums.length > 0) {
    const s = a.stelliums[0];
    highlights.push({ label: `POWER ZONE`, timing: `${s.planets.length}-Planet Stellium`, body: `${s.planets.map(p => P[p] || p).join(', ')} pile into ${s.location} — a concentrated demand for attention.` });
  }
  const MAJOR_PLANETS = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
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
      body = `Fresh energy arrives. Pay attention to ${theme.detail} — that is where this year lands first.`;
      if (themeH === 5) body += ' This month highlights romance, creative projects, fun, and children.';
    }
    if (i === 11) body = 'The year is winding down. Let the year\'s wisdom settle before the next one begins.';

    // Add stellium context for early months
    if (stelliums.length > 0 && i < 3) {
      const s = stelliums[0];
      body += ` With ${s.planets.map(p => P[p] || p).join(', ')} concentrated in ${s.location}, expect intense activity in that area.`;
    }

    // Add retrograde context for mid-year
    if (retros.length > 0 && i >= 3 && i <= 5) {
      body += ` ${retros.map(r => P[r] || r).join(' ')} retrograde asks you to revisit something unfinished before moving forward.`;
    }

    // Add moon sign emotional context
    if (moonSign && i >= 6 && i <= 9) {
      const moonFeelShort: Record<string, string> = {
        Aries: 'direct emotional energy', Taurus: 'steady emotional presence', Gemini: 'verbal emotional processing',
        Cancer: 'deep emotional sensitivity', Leo: 'warm emotional expression', Virgo: 'analytical emotional processing',
        Libra: 'harmony-seeking feelings', Scorpio: 'intense emotional honesty', Sagittarius: 'restless emotional energy',
        Capricorn: 'discipline around how you present yourself continues to pay off', Aquarius: 'detached emotional clarity',
        Pisces: 'heightened empathy and compassion',
      };
      body += ` ${moonSign} Moon — ${moonFeelShort[moonSign] || 'mixed emotional tones'}.`;
    }

    // Add 12th house sun context for relevant months
    if (sunH === 12 && i >= 4 && i <= 7) {
      body += ' The 12th house energy is at its strongest — bold moves made quietly are the most effective.';
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

  // ── HIGHLIGHTS ──
  ctx.sectionTitle(doc, 'YEAR AT A GLANCE', 'Your Year at a Glance');
  ctx.y += 2;
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Stick this on your fridge', margin, ctx.y);
  ctx.y += 18;

  const highlights = buildHighlights(a, srChart, natalChart);
  for (const h of highlights) {
    ctx.drawCard(doc, () => {
      ctx.trackedLabel(doc, h.label, margin + 14, ctx.y, { size: 7, charSpace: 2.5 });
      ctx.y += 14;
      doc.setFont('times', 'bold'); doc.setFontSize(18);
      doc.setTextColor(...INK);
      const valLines: string[] = doc.splitTextToSize(h.timing, contentW - 28);
      for (const vl of valLines) { doc.text(vl, margin + 14, ctx.y); ctx.y += 22; }
      doc.setFont('times', 'normal'); doc.setFontSize(10.5);
      doc.setTextColor(...INK);
      const bodyLines: string[] = doc.splitTextToSize(h.body, contentW - 28);
      for (const bl of bodyLines) { doc.text(bl, margin + 14, ctx.y); ctx.y += 16; }
    });
  }

  // ── MONTH-BY-MONTH on new page ──
  const clampLines = (lines: string[], max: number): string[] => {
    if (lines.length <= max) return lines;
    const clipped = lines.slice(0, max);
    clipped[max - 1] = clipped[max - 1].replace(/[.,;:!?]?$/, '…');
    return clipped;
  };

  const drawMonthHeader = (continued = false) => {
    if (!continued) {
      ctx.sectionTitle(doc, 'MONTH BY MONTH', 'Best Months & Highlights');
      ctx.drawRule(doc);
      ctx.y += 16;
      return;
    }

    ctx.pageBg(doc);
    ctx.trackedLabel(doc, 'MONTH BY MONTH · CONTINUED', margin, ctx.y, { size: 7.2, charSpace: 2.8 });
    ctx.y += 10;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 16;

    doc.setFont('times', 'normal'); doc.setFontSize(24);
    doc.setTextColor(...INK);
    doc.text('Best Months & Highlights', margin, ctx.y);
    ctx.y += 10;

    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 16;
  };

  doc.addPage();
  ctx.y = ctx.margin;
  ctx.pageBg(doc);
  drawMonthHeader(false);

  const forecasts = buildPersonalizedMonthlyForecasts(a, srChart, natalChart);
  const columnGap = 16;
  const rowGap = 16;
  const cardW = (contentW - columnGap) / 2;
  const cardPadX = 16;
  const cardPadTop = 18;
  const cardPadBottom = 16;
  const maxBodyLines = 6;
  const bodyLineH = 15.5;
  const headlineLineH = 22;

  const measureCard = (f: MonthForecast | undefined) => {
    if (!f) return { bodyLines: [] as string[], headLines: [] as string[], height: 0 };
    const bodyLines = clampLines(doc.splitTextToSize(f.body, cardW - cardPadX * 2), maxBodyLines);
    const headLines = doc.splitTextToSize(f.headline, cardW - cardPadX * 2) as string[];
    const height = Math.max(
      126,
      cardPadTop + 12 + 6 + headLines.length * headlineLineH + 6 + bodyLines.length * bodyLineH + cardPadBottom,
    );
    return { bodyLines, headLines, height };
  };

  const drawCard = (
    f: MonthForecast,
    bodyLines: string[],
    headLines: string[],
    cardH: number,
    x: number,
    rowY: number,
  ) => {
    doc.setFillColor(...CARD_BG);
    doc.roundedRect(x, rowY, cardW, cardH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.roundedRect(x, rowY, cardW, cardH, 3, 3, 'S');

    doc.setFillColor(...GOLD);
    doc.rect(x, rowY, 3, cardH, 'F');

    let cy = rowY + cardPadTop;
    ctx.trackedLabel(doc, `${f.month} ${f.year}`, x + cardPadX, cy, { size: 7.8, charSpace: 2.6 });
    cy += 14;

    doc.setFont('times', 'bold'); doc.setFontSize(15.5);
    doc.setTextColor(...INK);
    for (const line of headLines) {
      doc.text(line, x + cardPadX, cy);
      cy += headlineLineH;
    }

    doc.setFont('times', 'normal'); doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    for (const line of bodyLines) {
      doc.text(line, x + cardPadX, cy);
      cy += bodyLineH;
    }
  };

  let index = 0;
  while (index < forecasts.length) {
    const left = forecasts[index];
    const right = forecasts[index + 1];

    const leftMeasured = measureCard(left);
    const rightMeasured = measureCard(right);
    const rowH = Math.max(leftMeasured.height, rightMeasured.height, 126);

    if (ctx.y + rowH > ph - 62) {
      doc.addPage();
      ctx.y = ctx.margin;
      drawMonthHeader(true);
    }

    const rowY = ctx.y;
    drawCard(left, leftMeasured.bodyLines, leftMeasured.headLines, rowH, margin, rowY);

    if (right) {
      const rightX = margin + cardW + columnGap;
      drawCard(right, rightMeasured.bodyLines, rightMeasured.headLines, rowH, rightX, rowY);
    }

    ctx.y = rowY + rowH + rowGap;
    index += 2;
  }
}
