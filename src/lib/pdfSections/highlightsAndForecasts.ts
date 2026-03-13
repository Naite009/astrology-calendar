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

function buildHighlights(a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart): YearHighlight[] {
  const highlights: YearHighlight[] = [];

  // 1. Time Lord / Profection — the most important single factor
  if (a.profectionYear) {
    const tl = P[a.profectionYear.timeLord] || a.profectionYear.timeLord;
    const hNum = a.profectionYear.houseNumber;
    const hTheme = getHouseActionTheme(hNum);
    const srH = a.profectionYear.timeLordSRHouse;
    highlights.push({
      label: `${tl} RUNS YOUR YEAR`,
      timing: `Profection: ${ordinal(hNum)} House Year`,
      body: `${tl} is your Time Lord — the planet steering every major decision. Its home base is your natal ${ordinal(hNum)} house (${hTheme}).${srH ? ` This year it operates from SR House ${srH}, channeling that energy into ${getHouseActionTheme(srH)}.` : ''}`,
      icon: 'KEY',
    });
  }

  // 2. SR Moon — the emotional climate snapshot
  if (a.moonSign && a.moonHouse?.house) {
    const moonSign = a.moonSign;
    const moonH = a.moonHouse.house;
    const angLabel = a.moonAngularity === 'angular' ? ' Angular Moon = emotionally intense, visible year.' : a.moonAngularity === 'cadent' ? ' Cadent Moon = quieter inner processing this year.' : '';
    const vocNote = a.moonVOC ? ' Void-of-Course Moon: your emotional radar works differently — trust gut instinct over logic.' : '';
    const lateNote = a.moonLateDegree ? ' Late-degree Moon: an emotional chapter is completing; major feelings will crystallize and resolve.' : '';
    highlights.push({
      label: `EMOTIONAL CLIMATE: ${moonSign.toUpperCase()}`,
      timing: `Moon in ${ordinal(moonH)} House`,
      body: `Your emotional life this year orbits ${getSignFeel(moonSign)} themes. House ${moonH} (${getHouseActionTheme(moonH)}) is where you feel the most — this is your emotional home base.${angLabel}${vocNote}${lateNote}`,
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
      body: `${planets} pile into ${s.location}. This is not subtle — it is a concentrated demand for attention. ${s.blendMeaning || s.interpretation}`,
      icon: 'POWER',
    });
  }

  // 4. Strongest SR-to-Natal aspect
  if (a.srToNatalAspects.length > 0) {
    const strongest = a.srToNatalAspects[0];
    highlights.push({
      label: `YEAR-DEFINING ASPECT`,
      timing: `SR ${P[strongest.planet1] || strongest.planet1} ${strongest.type} Natal ${P[strongest.planet2] || strongest.planet2}`,
      body: strongest.interpretation,
      icon: 'SHIFT',
    });
  }

  // 5. Saturn focus — the mastery demand
  if (a.saturnFocus) {
    const satH = a.saturnFocus.house;
    const satSign = a.saturnFocus.sign;
    highlights.push({
      label: `SATURN'S DEMAND: ${satSign.toUpperCase()}`,
      timing: satH ? `${ordinal(satH)} House — ${getHouseActionTheme(satH)}` : `In ${satSign}`,
      body: a.saturnFocus.interpretation,
      icon: 'WORK',
    });
  }

  return highlights.slice(0, 4); // Max 4 to keep it tight
}

// ─── Personalized monthly forecasts ───

interface MonthForecast {
  month: string;
  headline: string;
  body: string;
}

function buildPersonalizedMonthlyForecasts(
  a: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
): MonthForecast[] {
  const forecasts: MonthForecast[] = [];
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  // Determine starting month from SR year
  const srYear = srChart.solarReturnYear || new Date().getFullYear();
  const birthMonth = natalChart.planets?.Sun ? getMonthFromSign(natalChart.planets.Sun.sign) : new Date().getMonth();

  // Gather data layers for monthly assignment
  const timeLord = a.profectionYear?.timeLord || '';
  const timeLordName = P[timeLord] || timeLord;
  const profH = a.profectionYear?.houseNumber || 0;
  const srSunH = a.sunHouse?.house || 0;
  const srMoonH = a.moonHouse?.house || 0;
  const moonSign = a.moonSign || '';
  const srAscRuler = a.srAscRulerInNatal;
  const stelliums = a.stelliums;
  const retros = a.retrogrades?.planets || [];
  const nodesFocus = a.nodesFocus;
  const saturnFocus = a.saturnFocus;
  const elementDom = a.elementBalance?.dominant || '';
  const repeatedThemes = a.repeatedThemes || [];

  // Build thematic arcs based on SR house sequence from profection
  // Each month maps to profection house + 0..11 (monthly sub-profection)
  for (let i = 0; i < 12; i++) {
    const mIdx = (birthMonth + i) % 12;
    const subH = ((profH - 1 + i) % 12) + 1; // Monthly sub-profection house

    const headline = getMonthHeadline(i, subH, timeLordName, a);
    const body = getMonthBody(i, subH, timeLordName, a, srChart, natalChart);

    forecasts.push({
      month: monthNames[mIdx],
      headline,
      body,
    });
  }

  return forecasts;
}

function getMonthHeadline(monthIdx: number, subHouse: number, timeLord: string, a: SolarReturnAnalysis): string {
  // First month and last month get special treatment
  if (monthIdx === 0) return `${timeLord} Activates — Your Year Begins`;
  if (monthIdx === 11) return `Integration Before the Next Cycle`;

  // Check for stellium activation in this sub-house
  const stellium = a.stelliums.find(s => s.locationType === 'house' && s.location.includes(String(subHouse)));
  if (stellium) return `Stellium Ignites: ${stellium.location}`;

  // Use sub-profection house for thematic headline
  return `${timeLord} Meets the ${ordinal(subHouse)} House`;
}

function getMonthBody(
  monthIdx: number, subHouse: number, timeLord: string,
  a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart
): string {
  const hTheme = getHouseActionTheme(subHouse);
  const srSunH = a.sunHouse?.house || 0;
  const moonSign = a.moonSign || '';
  const retros = a.retrogrades?.planets || [];

  if (monthIdx === 0) {
    const ascRuler = a.srAscRulerInNatal;
    return `New solar year energy floods in. ${timeLord} is now actively steering. ${ascRuler ? `The SR Ascendant ruler (${P[ascRuler.rulerPlanet] || ascRuler.rulerPlanet}) points to natal House ${ascRuler.rulerNatalHouse} — that is where this year lands first.` : ''} Focus on ${hTheme.toLowerCase()}.`;
  }

  if (monthIdx === 11) {
    return `The year's lessons consolidate. What ${timeLord} brought — in ${getHouseActionTheme(a.profectionYear?.houseNumber || 1).toLowerCase()} — now becomes part of who you are. Prepare for the next annual chapter.`;
  }

  // Build contextual body
  const parts: string[] = [];
  parts.push(`Sub-profection activates your ${ordinal(subHouse)} house: ${hTheme}.`);

  // Add specific chart data per month phase
  if (monthIdx === 1 || monthIdx === 2) {
    // Early months — foundations
    if (a.stelliums.length > 0) {
      const s = a.stelliums[0];
      parts.push(`Your ${s.location} stellium energy is building — pay attention to ${s.blendMeaning ? s.blendMeaning.substring(0, 80) : 'concentrated themes'}.`);
    }
  } else if (monthIdx >= 3 && monthIdx <= 5) {
    // Mid-year — action
    if (srSunH) {
      parts.push(`SR Sun in House ${srSunH} peaks — ${getHouseActionTheme(srSunH).toLowerCase()} demands bold moves.`);
    }
    if (retros.length > 0) {
      parts.push(`${retros.map(r => P[r] || r).join(', ')} retrograde asks you to revisit unfinished business.`);
    }
  } else if (monthIdx >= 6 && monthIdx <= 8) {
    // Second half — emotional recalibration
    parts.push(`Moon in ${moonSign} colors your feelings: ${getSignFeel(moonSign).toLowerCase()}.`);
    if (a.saturnFocus?.house) {
      parts.push(`Saturn in House ${a.saturnFocus.house} tightens — discipline pays off in ${getHouseActionTheme(a.saturnFocus.house).toLowerCase()}.`);
    }
  } else {
    // Final stretch — harvest & integration
    if (a.nodesFocus?.house) {
      parts.push(`North Node in House ${a.nodesFocus.house} pulls you toward growth: ${getHouseActionTheme(a.nodesFocus.house).toLowerCase()}.`);
    }
    if (a.repeatedThemes.length > 0) {
      parts.push(`Repeated theme: ${a.repeatedThemes[0].description}`);
    }
  }

  return parts.join(' ');
}

// ─── Lookup helpers ───

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getHouseActionTheme(house: number): string {
  const themes: Record<number, string> = {
    1: 'Your identity, body, and how you show up',
    2: 'Money, possessions, and self-worth',
    3: 'Daily conversations, siblings, and local connections',
    4: 'Home, family, and emotional roots',
    5: 'Romance, creativity, children, and joy',
    6: 'Health routines, daily work, and service',
    7: 'Committed partnerships and one-on-one relationships',
    8: 'Shared finances, intimacy, and psychological depth',
    9: 'Travel, higher learning, and expanding your worldview',
    10: 'Career ambitions, public role, and reputation',
    11: 'Friendships, community, and future visions',
    12: 'Solitude, spiritual practice, and hidden patterns',
  };
  return themes[house] || 'General life themes';
}

function getSignFeel(sign: string): string {
  const feels: Record<string, string> = {
    Aries: 'Urgency, independence, impatience, raw courage',
    Taurus: 'Groundedness, sensuality, stubbornness, comfort-seeking',
    Gemini: 'Curiosity, restlessness, quick connections, mental stimulation',
    Cancer: 'Deep nurturing, protectiveness, mood swings, home-centered feelings',
    Leo: 'Warmth, pride, generosity, need for recognition',
    Virgo: 'Analytical processing, self-improvement, anxiety about details',
    Libra: 'Harmony-seeking, people-pleasing, romantic idealism',
    Scorpio: 'Intensity, obsessive focus, emotional extremes, transformative depth',
    Sagittarius: 'Optimism, restless seeking, philosophical feelings, need for freedom',
    Capricorn: 'Controlled emotions, ambition channeling feelings, fear of vulnerability',
    Aquarius: 'Detachment, unconventional processing, humanitarian feelings',
    Pisces: 'Boundless empathy, escapism, spiritual sensitivity, absorbing others\' pain',
  };
  return feels[sign] || 'Mixed emotional tones';
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
    doc.setDrawColor(...colors.gold); doc.setLineWidth(0.8);
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

  doc.setDrawColor(...colors.gold); doc.setLineWidth(1.5);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.setTextColor(...colors.gold);
  doc.text('MONTH-BY-MONTH AT A GLANCE', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 6;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
  doc.setTextColor(...colors.dimText);
  doc.text('Based on your natal chart, solar return, and annual profection', pw / 2, ctx.y, { align: 'center' });
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

      // Month badge
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
      doc.setTextColor(...colors.gold);
      doc.text(f.month, x + 8, y + 14);

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
