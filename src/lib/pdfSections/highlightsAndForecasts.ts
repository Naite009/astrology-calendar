import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { P } from '@/components/SolarReturnPDFExport';

/**
 * Personalized Year-Ahead Highlights + Month-by-Month Forecasts
 * Uses natal chart, SR chart, profection, time lord, aspects, stelliums, etc.
 */

// ─── Personalized highlight cards from actual SR data ───

interface YearHighlight {
  label: string;
  timing: string;
  body: string;
  icon: string;
}

function ord(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function lifeTheme(house: number): string {
  return LIFE_THEMES[house]?.detail || 'general life themes';
}

function buildHighlights(a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart): YearHighlight[] {
  const highlights: YearHighlight[] = [];

  // 1. Time Lord / Profection — describe by theme, not planet name
  if (a.profectionYear) {
    const hNum = a.profectionYear.houseNumber;
    const srH = a.profectionYear.timeLordSRHouse;
    const theme = LIFE_THEMES[hNum];
    highlights.push({
      label: `THIS YEAR'S FOCUS: ${theme?.short?.toUpperCase() || 'YOUR PATH'}`,
      timing: `${ord(hNum)} House Profection Year`,
      body: `This year the spotlight lands on ${lifeTheme(hNum)}. Everything significant circles back to this area.${srH ? ` The energy channels most directly into ${lifeTheme(srH)}.` : ''}`,
      icon: 'KEY',
    });
  }

  // 2. SR Moon — the emotional climate snapshot
  if (a.moonSign && a.moonHouse?.house) {
    const moonSign = a.moonSign;
    const moonH = a.moonHouse.house;
    const angLabel = a.moonAngularity === 'angular' ? ' Angular Moon = emotionally intense, visible year.' : a.moonAngularity === 'cadent' ? ' Cadent Moon = quieter inner processing this year.' : '';
    const vocNote = a.moonVOC ? ' Void-of-Course Moon: your emotional radar works differently -- trust gut instinct over logic.' : '';
    const lateNote = a.moonLateDegree ? ' Late-degree Moon: an emotional chapter is completing; major feelings will crystallize and resolve.' : '';
    highlights.push({
      label: `EMOTIONAL CLIMATE: ${moonSign.toUpperCase()}`,
      timing: `Moon in ${ord(moonH)} House`,
      body: `Your emotional life this year orbits ${getSignFeel(moonSign)} themes. The ${ord(moonH)} house (${lifeTheme(moonH)}) is where you feel the most -- this is your emotional home base.${angLabel}${vocNote}${lateNote}`,
      icon: 'FEEL',
    });
  }

  // 3. Stelliums — concentrated energy zones
  if (a.stelliums.length > 0) {
    const s = a.stelliums[0];
    const planets = s.planets.map(p => P[p] || p).join(', ');
    highlights.push({
      label: `POWER ZONE: ${s.location.toUpperCase()}`,
      timing: `${s.planets.length}-Planet Stellium`,
      body: `${planets} pile into ${s.location}. This is not subtle -- it is a concentrated demand for attention. ${s.blendMeaning || s.interpretation}`,
      icon: 'POWER',
    });
  }

  // 4. Strongest SR-to-Natal aspect (skip Sun conjunct Sun; only major 10 planets)
  const MAJOR_PLANETS = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto']);
  if (a.srToNatalAspects.length > 0) {
    const strongest = a.srToNatalAspects.find(asp =>
      MAJOR_PLANETS.has(asp.planet1) && MAJOR_PLANETS.has(asp.planet2) &&
      !(asp.planet1 === 'Sun' && asp.planet2 === 'Sun' && asp.type === 'Conjunction')
    );
    if (strongest) {
      highlights.push({
        label: `YEAR-DEFINING ASPECT`,
        timing: `SR ${P[strongest.planet1] || strongest.planet1} ${strongest.type} Natal ${P[strongest.planet2] || strongest.planet2}`,
        body: strongest.interpretation,
        icon: 'SHIFT',
      });
    }
  }

  // 5. Natal Chart Ruler — how your birth chart's core energy interacts with this year
  if (natalChart.planets?.Ascendant) {
    const ascSign = natalChart.planets.Ascendant.sign;
    const chartRuler = getSignRuler(ascSign);
    const timeLord = a.profectionYear?.timeLord || '';
    if (chartRuler && chartRuler !== timeLord) {
      const rulerName = P[chartRuler] || chartRuler;
      const natalPos = (natalChart.planets as any)?.[chartRuler];
      const srPlanets = (srChart as any)?.planets || {};
      const srPos = srPlanets[chartRuler];
      let body = `${rulerName} rules your Ascendant (${ascSign}), making it your natal chart ruler — the planet that represents YOU.`;
      if (natalPos?.sign) body += ` Born with ${rulerName} in ${natalPos.sign}`;
      if (natalPos?.house) body += ` (${ord(natalPos.house)} house)`;
      if (natalPos?.sign) body += `.`;
      if (srPos?.sign) body += ` This year ${rulerName} moves through ${srPos.sign}`;
      if (srPos?.house) body += ` in your ${ord(srPos.house)} house`;
      if (srPos?.sign) body += ` — watch how ${LIFE_THEMES[srPos.house]?.detail || 'that area'} responds.`;
      highlights.push({
        label: `YOUR CHART RULER: ${rulerName.toUpperCase()}`,
        timing: `${ascSign} Rising → ${rulerName}`,
        body,
        icon: 'STAR',
      });
    }
  }

  // 5. Saturn focus — reframe without naming Saturn repeatedly
  if (a.saturnFocus) {
    const satH = a.saturnFocus.house;
    highlights.push({
      label: `WHERE DISCIPLINE IS REQUIRED`,
      timing: satH ? `${ord(satH)} House -- ${lifeTheme(satH)}` : '',
      body: a.saturnFocus.interpretation,
      icon: 'WORK',
    });
  }

  return highlights.slice(0, 4); // Max 4 to keep it tight
}

// ─── Personalized monthly forecasts ───

interface MonthForecast {
  month: string;
  year: number;
  headline: string;
  body: string;
}

/** Plain-language life themes by house number — no jargon */
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

function buildPersonalizedMonthlyForecasts(
  a: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
): MonthForecast[] {
  const forecasts: MonthForecast[] = [];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const srYear = srChart.solarReturnYear || new Date().getFullYear();
  // Use actual birth date to determine birth month, not sign approximation
  let birthMonth = 2; // default March
  if (natalChart.birthDate) {
    const parts = natalChart.birthDate.split(/[-/]/);
    // Try parsing as YYYY-MM-DD or MM/DD/YYYY
    if (parts.length >= 2) {
      const candidate = parts[0].length === 4 ? parseInt(parts[1], 10) - 1 : parseInt(parts[0], 10) - 1;
      if (candidate >= 0 && candidate <= 11) birthMonth = candidate;
    }
  }

  const timeLord = a.profectionYear?.timeLord || '';
  const timeLordName = P[timeLord] || timeLord;
  const profH = a.profectionYear?.houseNumber || 0;
  const moonSign = a.moonSign || '';
  const retros = a.retrogrades?.planets || [];

  for (let i = 0; i < 12; i++) {
    const mIdx = (birthMonth + i) % 12;
    const themeH = ((profH - 1 + i) % 12) + 1;
    const theme = LIFE_THEMES[themeH] || LIFE_THEMES[1];

    // Determine correct year: months before birthday month belong to next year
    const year = mIdx < birthMonth ? srYear + 1 : srYear;

    const headline = getFriendlyHeadline(i, theme, timeLordName, a);
    const body = getFriendlyBody(i, theme, timeLordName, a, srChart, natalChart);

    forecasts.push({
      month: monthNames[mIdx],
      year,
      headline,
      body,
    });
  }

  return forecasts;
}

function getFriendlyHeadline(monthIdx: number, theme: { short: string; detail: string }, timeLord: string, a: SolarReturnAnalysis): string {
  if (monthIdx === 0) return 'Your New Year Begins';
  if (monthIdx === 11) return 'Wrapping Up & Looking Ahead';

  // Check for stellium activation
  const stellium = a.stelliums[0];
  if (monthIdx === 2 && stellium) return `${stellium.location} Energy Peaks`;

  // Friendly theme-based headlines
  const friendlyLabels: Record<string, string> = {
    'You': 'Focus on Yourself',
    'Money & Worth': 'Money Moves',
    'Communication': 'Speak Up',
    'Home & Family': 'Home Base',
    'Joy & Creativity': 'Follow the Fun',
    'Health & Routines': 'Body Check-In',
    'Relationships': 'Relationship Weather',
    'Depth & Change': 'Going Deeper',
    'Expansion': 'Broaden Your Horizons',
    'Career': 'Career in Focus',
    'Community': 'Your People',
    'Inner Work': 'Quiet Time',
  };

  return friendlyLabels[theme.short] || theme.short;
}

function getFriendlyBody(
  monthIdx: number, theme: { short: string; detail: string }, timeLord: string,
  a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart
): string {
  const moonSign = a.moonSign || '';
  const retros = a.retrogrades?.planets || [];
  const srSunH = a.sunHouse?.house || 0;

  if (monthIdx === 0) {
    const ascRuler = a.srAscRulerInNatal;
    let opener = `Fresh energy arrives — your new year begins here.`;
    if (ascRuler) {
      opener += ` Pay attention to ${LIFE_THEMES[ascRuler.rulerNatalHouse]?.detail || 'key life areas'} -- that is where this year lands first.`;
    }
    opener += ` This month highlights ${theme.detail}.`;
    return opener;
  }

  if (monthIdx === 11) {
    return `The year is winding down. Look back at what this chapter brought you -- the lessons, the growth, the hard-won clarity. This is integration time. Let the year's wisdom settle before the next one begins.`;
  }

  // Build natural-language body
  const parts: string[] = [];
  parts.push(`This month turns your attention toward ${theme.detail}.`);

  if (monthIdx === 1 || monthIdx === 2) {
    if (a.stelliums.length > 0) {
      const s = a.stelliums[0];
      const planetNames = s.planets.map(p => P[p] || p).join(', ');
      parts.push(`With ${planetNames} concentrated in ${s.location}, expect intense activity in that area.`);
    }
  } else if (monthIdx >= 3 && monthIdx <= 5) {
    if (srSunH) {
      parts.push(`Energy around ${LIFE_THEMES[srSunH]?.detail || 'your core focus'} is at its strongest -- time for bold moves.`);
    }
    if (retros.length > 0) {
      parts.push(`${retros.map(r => P[r] || r).join(' and ')} retrograde asks you to revisit something unfinished before moving forward.`);
    }
  } else if (monthIdx >= 6 && monthIdx <= 8) {
    if (moonSign) {
      parts.push(`Emotionally, you are running on ${moonSign} energy: ${getSignFeel(moonSign).toLowerCase()}.`);
    }
    if (a.saturnFocus?.house) {
      parts.push(`Discipline around ${LIFE_THEMES[a.saturnFocus.house]?.detail || 'responsibilities'} pays off now.`);
    }
  } else {
    if (a.nodesFocus?.house) {
      parts.push(`Growth is pulling you toward ${LIFE_THEMES[a.nodesFocus.house]?.detail || 'new territory'}.`);
    }
    if (a.repeatedThemes?.length > 0) {
      parts.push(`A recurring theme this year: ${a.repeatedThemes[0].description}`);
    }
  }

  return parts.join(' ');
}

function getSignFeel(sign: string): string {
  const feels: Record<string, string> = {
    Aries: 'urgency, independence, impatience, raw courage',
    Taurus: 'groundedness, sensuality, stubbornness, comfort-seeking',
    Gemini: 'curiosity, restlessness, quick connections, mental stimulation',
    Cancer: 'deep nurturing, protectiveness, mood swings, home-centered feelings',
    Leo: 'warmth, pride, generosity, need for recognition',
    Virgo: 'analytical processing, self-improvement, anxiety about details',
    Libra: 'harmony-seeking, people-pleasing, romantic idealism',
    Scorpio: 'intensity, obsessive focus, emotional extremes, transformative depth',
    Sagittarius: 'optimism, restless seeking, philosophical feelings, need for freedom',
    Capricorn: 'controlled emotions, ambition channeling feelings, fear of vulnerability',
    Aquarius: 'detachment, unconventional processing, humanitarian feelings',
    Pisces: 'boundless empathy, escapism, spiritual sensitivity, absorbing others\' pain',
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

// ─── PDF Rendering ───

export function generateHighlightsPage(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis,
  srChart: SolarReturnChart, natalChart: NatalChart,
) {
  const { pw, margin, contentW, colors } = ctx;

  // ── SECTION HEADER ──
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 24;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.setTextColor(...colors.gold);
  doc.text('YOUR YEAR AT A GLANCE', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 8;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...colors.dimText);
  doc.text('Stick this on your fridge', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 20;

  // ── HIGHLIGHT CARDS ──
  const highlights = buildHighlights(a, srChart, natalChart);
  for (let i = 0; i < highlights.length; i++) {
    const h = highlights[i];
    const bodyLines = doc.splitTextToSize(h.body, contentW - 24);
    ctx.checkPage(100);

    if (i === 0) {
      // HERO card — full bleed gold bar with large label, white text
      const heroH = 16 + bodyLines.length * 12 + 20;
      doc.setFillColor(...colors.deep);
      doc.roundedRect(margin, ctx.y, contentW, heroH, 6, 6, 'F');

      doc.setFont('helvetica', 'normal'); doc.setFontSize(7);
      doc.setTextColor(...colors.gold);
      doc.setCharSpace(1.5);
      doc.text(h.icon, margin + 16, ctx.y + 14);
      doc.setCharSpace(0);

      doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
      doc.setTextColor(...colors.gold);
      doc.text(h.label, margin + 16, ctx.y + 24);

      doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
      doc.setTextColor(200, 190, 160);
      doc.text(h.timing, margin + 16, ctx.y + 35);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
      doc.setTextColor(235, 230, 215);
      bodyLines.forEach((line: string, li: number) => {
        doc.text(line, margin + 16, ctx.y + 48 + li * 12);
      });
      ctx.y += heroH + 10;

    } else if (i === 1) {
      // PULL QUOTE style — large italic statement, no box
      ctx.y += 8;
      doc.setDrawColor(...colors.gold); doc.setLineWidth(2);
      doc.line(margin, ctx.y, margin + 3, ctx.y + 40);
      
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.setTextColor(...colors.gold);
      doc.setCharSpace(1.2);
      doc.text(h.label, margin + 12, ctx.y + 10);
      doc.setCharSpace(0);

      doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
      doc.setTextColor(...colors.deepBrown);
      doc.text(h.timing, margin + 12, ctx.y + 20);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(9.5);
      doc.setTextColor(...colors.bodyText);
      bodyLines.forEach((line: string, li: number) => {
        doc.text(line, margin + 12, ctx.y + 32 + li * 13);
      });
      ctx.y += 40 + bodyLines.length * 13 + 14;

    } else {
      // STANDARD card — lighter treatment
      const cardH = 20 + bodyLines.length * 11 + 14;
      doc.setFillColor(250, 248, 244);
      doc.setDrawColor(...colors.warmBorder); doc.setLineWidth(0.3);
      doc.roundedRect(margin, ctx.y, contentW, cardH, 4, 4, 'FD');
      doc.setDrawColor(...colors.gold); doc.setLineWidth(1.5);
      doc.line(margin, ctx.y + 4, margin, ctx.y + cardH - 4);

      doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
      doc.setTextColor(...colors.gold);
      doc.text(h.label, margin + 12, ctx.y + 13);

      doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5);
      doc.setTextColor(...colors.deepBrown);
      doc.text(h.timing, margin + 12, ctx.y + 23);

      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
      doc.setTextColor(...colors.bodyText);
      bodyLines.forEach((line: string, li: number) => {
        doc.text(line, margin + 12, ctx.y + 34 + li * 11);
      });
      ctx.y += cardH + 6;
    }
  }

  // ── MONTH-BY-MONTH AT A GLANCE — all 12 on one page ──
  doc.addPage(); ctx.y = margin;

  doc.setDrawColor(...colors.gold); doc.setLineWidth(1);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.setTextColor(...colors.gold);
  doc.text('MONTH-BY-MONTH AT A GLANCE', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 6;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
  doc.setTextColor(...colors.dimText);
  doc.text('What to expect each month, based on your chart', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 14;

  const forecasts = buildPersonalizedMonthlyForecasts(a, srChart, natalChart);

  // 3 columns × 4 rows grid — use full width with minimal gaps
  const cols = 3;
  const rows = 4;
  const gap = 6;
  const colW = (contentW - gap * (cols - 1)) / cols;
  const availH = ctx.ph - ctx.y - 30; // leave bottom margin
  const rowH = (availH - gap * (rows - 1)) / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const fi = row * cols + col;
      if (fi >= forecasts.length) break;
      const f = forecasts[fi];
      const x = margin + col * (colW + gap);
      const y = ctx.y + row * (rowH + gap);

      // Card background
      doc.setFillColor(...colors.softGold);
      doc.setDrawColor(...colors.warmBorder); doc.setLineWidth(0.3);
      doc.roundedRect(x, y, colW, rowH, 4, 4, 'FD');

      // Gold left accent
      doc.setDrawColor(...colors.gold); doc.setLineWidth(1.5);
      doc.line(x + 1, y + 3, x + 1, y + rowH - 3);

      // Month + Year header
      let curY = y + 11;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
      doc.setTextColor(...colors.gold);
      doc.text(`${f.month} ${f.year}`, x + 8, curY);
      curY += 10;

      // Headline
      doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
      doc.setTextColor(...colors.deepBrown);
      const hLines: string[] = doc.splitTextToSize(f.headline, colW - 16);
      hLines.forEach((line: string, li: number) => {
        doc.text(line, x + 8, curY + li * 8);
      });
      curY += hLines.length * 8 + 3;

      // Body — fill remaining card space
      doc.setFont('helvetica', 'normal'); doc.setFontSize(6.5);
      doc.setTextColor(...colors.bodyText);
      const maxBodyY = y + rowH - 6;
      const bodyW = colW - 16;
      const bLines: string[] = doc.splitTextToSize(f.body, bodyW);
      for (const line of bLines) {
        if (curY > maxBodyY) break; // clip to card bounds
        doc.text(line, x + 8, curY);
        curY += 7.5;
      }
    }
  }

  ctx.y = ctx.y + rows * (rowH + gap);
}
