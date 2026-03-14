import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { P } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];
const INK:   Color = [18,  16,  14];
const MUTED: Color = [130, 125, 118];
const RULE:  Color = [200, 195, 188];

const LIFE_THEMES: Record<number, { short: string; detail: string }> = {
  1: { short: 'You', detail: 'your identity, confidence, and how you present yourself to the world' },
  2: { short: 'Money & Worth', detail: 'your finances, possessions, and sense of self-worth' },
  3: { short: 'Communication', detail: 'conversations, learning, writing, and your local world' },
  4: { short: 'Home & Family', detail: 'your home life, family dynamics, and emotional foundations' },
  5: { short: 'Joy & Creativity', detail: 'romance, creative projects, fun, and children' },
  6: { short: 'Health & Routines', detail: 'your daily habits, health, and work life' },
  7: { short: 'Relationships', detail: 'partnerships, commitments, and one-on-one dynamics' },
  8: { short: 'Depth & Change', detail: 'deep transformation, shared resources, and intimacy' },
  9: { short: 'Expansion', detail: 'travel, learning, big-picture thinking, and new perspectives' },
  10: { short: 'Career', detail: 'your professional life, public reputation, and ambitions' },
  11: { short: 'Community', detail: 'friendships, social circles, and your hopes for the future' },
  12: { short: 'Inner Work', detail: 'rest, reflection, spiritual life, and processing what is hidden' },
};

function ord(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function lifeTheme(house: number): string {
  return LIFE_THEMES[house]?.detail || 'general life themes';
}

interface YearHighlight { label: string; timing: string; body: string; icon: string; }

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

function getSignRuler(sign: string): string | null {
  const rulers: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
    Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
    Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Neptune',
  };
  return rulers[sign] || null;
}

function buildHighlights(a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart): YearHighlight[] {
  const highlights: YearHighlight[] = [];
  if (a.profectionYear) {
    const hNum = a.profectionYear.houseNumber;
    const srH = a.profectionYear.timeLordSRHouse;
    highlights.push({ label: `THIS YEAR'S FOCUS`, timing: `${ord(hNum)} House Profection Year`, body: `This year the spotlight lands on ${lifeTheme(hNum)}. Everything significant circles back to this area.${srH ? ` The energy channels most directly into ${lifeTheme(srH)}.` : ''}`, icon: 'KEY' });
  }
  if (a.moonSign && a.moonHouse?.house) {
    highlights.push({ label: `EMOTIONAL CLIMATE`, timing: `Moon in ${ord(a.moonHouse.house)} House`, body: `Your emotional life this year orbits ${getSignFeel(a.moonSign)} themes. The ${ord(a.moonHouse.house)} house is where you feel the most.`, icon: 'FEEL' });
  }
  if (a.stelliums.length > 0) {
    const s = a.stelliums[0];
    highlights.push({ label: `POWER ZONE`, timing: `${s.planets.length}-Planet Stellium`, body: `${s.planets.map(p => P[p] || p).join(', ')} pile into ${s.location}. This is concentrated demand for attention.`, icon: 'POWER' });
  }
  const MAJOR_PLANETS = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
  if (a.srToNatalAspects.length > 0) {
    const strongest = a.srToNatalAspects.find(asp => MAJOR_PLANETS.has(asp.planet1) && MAJOR_PLANETS.has(asp.planet2) && !(asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction'));
    if (strongest) highlights.push({ label: 'YEAR-DEFINING ASPECT', timing: `SR ${P[strongest.planet1] || strongest.planet1} ${strongest.type} Natal ${P[strongest.planet2] || strongest.planet2}`, body: strongest.interpretation, icon: 'SHIFT' });
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
  const timeLordName = P[a.profectionYear?.timeLord || ''] || a.profectionYear?.timeLord || '';
  for (let i = 0; i < 12; i++) {
    const mIdx = (birthMonth + i) % 12;
    const themeH = ((profH - 1 + i) % 12) + 1;
    const theme = LIFE_THEMES[themeH] || LIFE_THEMES[1];
    const year = mIdx < birthMonth ? srYear + 1 : srYear;
    let headline = theme.short;
    if (i === 0) headline = 'Your New Year Begins';
    if (i === 11) headline = 'Wrapping Up & Looking Ahead';
    let body = `This month turns your attention toward ${theme.detail}.`;
    if (i === 0) body = `Fresh energy arrives — your new year begins here. This month highlights ${theme.detail}.`;
    if (i === 11) body = 'The year is winding down. Let the year\'s wisdom settle before the next one begins.';
    forecasts.push({ month: monthNames[mIdx], year, headline, body });
  }
  return forecasts;
}

export function generateHighlightsPage(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart,
) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);

  // ── HIGHLIGHTS ──
  ctx.trackedLabel(doc, '03 · YEAR AT A GLANCE', margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;
  doc.setFont('times', 'bold'); doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text('Your Year at a Glance', margin, ctx.y);
  ctx.y += 8;
  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text('Stick this on your fridge', margin, ctx.y);
  ctx.y += 16;

  const highlights = buildHighlights(a, srChart, natalChart);
  for (const h of highlights) {
    ctx.checkPage(80);
    ctx.trackedLabel(doc, h.label, margin, ctx.y);
    ctx.y += 12;
    doc.setFont('times', 'bold'); doc.setFontSize(16);
    doc.setTextColor(...INK);
    const valLines: string[] = doc.splitTextToSize(h.timing, contentW);
    for (const vl of valLines) { doc.text(vl, margin, ctx.y); ctx.y += 18; }
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...INK);
    const bodyLines: string[] = doc.splitTextToSize(h.body, contentW);
    for (const bl of bodyLines) { doc.text(bl, margin, ctx.y); ctx.y += 14; }
    ctx.y += 4;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 16;
  }

  // ── MONTH-BY-MONTH ──
  doc.addPage(); ctx.y = ctx.margin; ctx.pageBg(doc);
  ctx.trackedLabel(doc, '17 · MONTH BY MONTH', margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;
  doc.setFont('times', 'bold'); doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text('Best Months & Highlights', margin, ctx.y);
  ctx.y += 10;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 14;

  const forecasts = buildPersonalizedMonthlyForecasts(a, srChart, natalChart);
  const halfW = (contentW - 20) / 2;

  for (let i = 0; i < forecasts.length; i++) {
    const f = forecasts[i];
    const col = i % 2;
    const x = margin + col * (halfW + 20);

    if (col === 0) {
      ctx.checkPage(70);
    }

    const baseY = ctx.y;

    // Month + Year
    doc.setFont('times', 'bold'); doc.setFontSize(11);
    doc.setTextColor(...INK);
    doc.text(`${f.month} ${f.year}`, x, baseY);

    // Headline
    doc.setFont('times', 'bolditalic'); doc.setFontSize(12);
    doc.setTextColor(38, 34, 30);
    doc.text(f.headline, x, baseY + 14);

    // Body
    doc.setFont('times', 'normal'); doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const bLines: string[] = doc.splitTextToSize(f.body, halfW - 4);
    bLines.slice(0, 3).forEach((line: string, li: number) => {
      doc.text(line, x, baseY + 28 + li * 13);
    });

    // Hairline rule below
    const entryBottom = baseY + 28 + Math.min(bLines.length, 3) * 13 + 4;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(x, entryBottom, x + halfW, entryBottom);

    // Vertical divider between columns
    if (col === 0) {
      doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
      doc.line(margin + halfW + 10, baseY - 4, margin + halfW + 10, entryBottom);
    }

    if (col === 1) {
      ctx.y = entryBottom + 16;
    }
  }
}
