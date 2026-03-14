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

  // 1. Time Lord / Profection — the most important single factor
  if (a.profectionYear) {
    const tl = P[a.profectionYear.timeLord] || a.profectionYear.timeLord;
    const hNum = a.profectionYear.houseNumber;
    const srH = a.profectionYear.timeLordSRHouse;
    highlights.push({
      label: `${tl} RUNS YOUR YEAR`,
      timing: `${ord(hNum)} House Profection Year`,
      body: `${tl} is your Time Lord -- the planet steering every major decision. Its home base is your natal ${ord(hNum)} house (${lifeTheme(hNum)}).${srH ? ` This year it channels that energy into ${lifeTheme(srH)}.` : ''}`,
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

  // 4. Strongest SR-to-Natal aspect (skip Sun conjunct Sun — that's the Solar Return itself)
  if (a.srToNatalAspects.length > 0) {
    const strongest = a.srToNatalAspects.find(asp =>
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

  // 5. Saturn focus — the mastery demand
  if (a.saturnFocus) {
    const satH = a.saturnFocus.house;
    const satSign = a.saturnFocus.sign;
    highlights.push({
      label: `SATURN'S DEMAND: ${satSign.toUpperCase()}`,
      timing: satH ? `${ord(satH)} House -- ${lifeTheme(satH)}` : `In ${satSign}`,
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
  const birthMonth = natalChart.planets?.Sun ? getMonthFromSign(natalChart.planets.Sun.sign) : new Date().getMonth();

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
    let opener = `Fresh energy arrives. ${timeLord} is running the show now.`;
    if (ascRuler) {
      opener += ` Pay attention to ${LIFE_THEMES[ascRuler.rulerNatalHouse]?.detail || 'key life areas'} -- that is where this year lands first.`;
    }
    opener += ` This month highlights ${theme.detail}.`;
    return opener;
  }

  if (monthIdx === 11) {
    return `The year is winding down. Look back at what ${timeLord} brought you -- the lessons, the growth, the hard-won clarity. This is integration time. Let the year's wisdom settle before the next chapter begins.`;
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

function getMonthFromSign(sign: string): number {
  const signMonths: Record<string, number> = {
    Aries: 2, Taurus: 3, Gemini: 4, Cancer: 5, Leo: 6, Virgo: 7,
    Libra: 8, Scorpio: 9, Sagittarius: 10, Capricorn: 11, Aquarius: 0, Pisces: 1,
  };
  return signMonths[sign] ?? 0;
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
  for (const h of highlights) {
    const bodyLines = doc.splitTextToSize(h.body, contentW - 30);
    const cardH = 24 + bodyLines.length * 12 + 12;
    ctx.checkPage(cardH + 10);

    const boxY = ctx.y;
    doc.setFillColor(...colors.softGold);
    doc.setDrawColor(...colors.warmBorder); doc.setLineWidth(0.4);
    doc.roundedRect(margin, boxY, contentW, cardH, 6, 6, 'FD');

    // Icon badge
    doc.setFillColor(...colors.gold);
    doc.roundedRect(margin + 8, boxY + 8, 40, 18, 4, 4, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(h.icon, margin + 28, boxY + 19, { align: 'center' });

    // Label (after badge, with clear gap)
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.setTextColor(...colors.gold);
    doc.text(h.label, margin + 56, boxY + 19);

    // Timing subtitle
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
    doc.setTextColor(...colors.deepBrown);
    doc.text(h.timing, margin + 56, boxY + 30);

    // Body text — below the header area
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(...colors.bodyText);
    bodyLines.forEach((line: string, i: number) => {
      doc.text(line, margin + 14, boxY + 42 + i * 12);
    });

    ctx.y = boxY + cardH + 6;
  }

  // ── MONTH-BY-MONTH AT A GLANCE ──
  ctx.y += 8;
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
  ctx.y += 16;

  const forecasts = buildPersonalizedMonthlyForecasts(a, srChart, natalChart);
  const colW = (contentW - 10) / 2;

  for (let i = 0; i < forecasts.length; i += 2) {
    // Calculate row height from the taller of the two cards
    const leftLines = doc.splitTextToSize(forecasts[i].body, colW - 52);
    const rightLines = i + 1 < forecasts.length ? doc.splitTextToSize(forecasts[i + 1].body, colW - 52) : [];
    const leftHeadLines = doc.splitTextToSize(forecasts[i].headline, colW - 52);
    const rightHeadLines = i + 1 < forecasts.length ? doc.splitTextToSize(forecasts[i + 1].headline, colW - 52) : [];

    const leftH = 14 + leftHeadLines.length * 11 + 4 + leftLines.length * 10 + 10;
    const rightH = i + 1 < forecasts.length ? 14 + rightHeadLines.length * 11 + 4 + rightLines.length * 10 + 10 : 0;
    const rowH = Math.max(leftH, rightH);

    ctx.checkPage(rowH + 6);

    for (let col = 0; col < 2; col++) {
      const fi = i + col;
      if (fi >= forecasts.length) break;
      const f = forecasts[fi];
      const x = margin + col * (colW + 10);
      const y = ctx.y;

      // Card background
      doc.setFillColor(...colors.softGold);
      doc.roundedRect(x, y, colW, rowH - 2, 4, 4, 'F');

      // Month + Year badge
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.setTextColor(...colors.gold);
      doc.text(`${f.month} ${f.year}`, x + 8, y + 14);

      // Headline
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
      doc.setTextColor(...colors.deepBrown);
      const hLines = doc.splitTextToSize(f.headline, colW - 52);
      hLines.forEach((line: string, li: number) => {
        doc.text(line, x + 42, y + 13 + li * 11);
      });

      // Body
      doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
      doc.setTextColor(...colors.bodyText);
      const bLines = doc.splitTextToSize(f.body, colW - 52);
      const bodyStartY = y + 13 + hLines.length * 11 + 4;
      bLines.forEach((line: string, li: number) => {
        doc.text(line, x + 42, bodyStartY + li * 10);
      });
    }

    ctx.y += rowH + 4;
  }
}
