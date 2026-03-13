import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { P } from '@/components/SolarReturnPDFExport';

/**
 * Year-Ahead Highlights + Monthly One-Line Forecasts
 */

interface YearHighlight {
  label: string;
  timing: string;
  reason: string;
  icon: string; // emoji-safe text label
}

function buildHighlights(a: SolarReturnAnalysis): YearHighlight[] {
  const highlights: YearHighlight[] = [];

  // Best months from Moon timing
  if (a.moonTimingEvents.length > 0) {
    // Find Jupiter aspects = best opportunities
    const jupiterHit = a.moonTimingEvents.find(e => e.targetPlanet === 'Jupiter');
    if (jupiterHit) {
      highlights.push({
        label: 'Best Month for Opportunities',
        timing: jupiterHit.approximateMonth,
        reason: `Moon activates Jupiter — doors open, luck peaks, say YES to invitations`,
        icon: 'LUCK',
      });
    }

    // Venus aspect = best for love
    const venusHit = a.moonTimingEvents.find(e => e.targetPlanet === 'Venus');
    if (venusHit) {
      highlights.push({
        label: 'Best Month for Love & Beauty',
        timing: venusHit.approximateMonth,
        reason: `Moon activates Venus — romance, beauty, social connections at their peak`,
        icon: 'LOVE',
      });
    }

    // Mars aspect = best for action
    const marsHit = a.moonTimingEvents.find(e => e.targetPlanet === 'Mars');
    if (marsHit) {
      highlights.push({
        label: 'Best Month for Bold Action',
        timing: marsHit.approximateMonth,
        reason: `Moon activates Mars — energy, courage, and initiative are supercharged`,
        icon: 'ACTION',
      });
    }

    // Saturn aspect = most challenging
    const saturnHit = a.moonTimingEvents.find(e => e.targetPlanet === 'Saturn');
    if (saturnHit) {
      highlights.push({
        label: 'Most Important Growth Month',
        timing: saturnHit.approximateMonth,
        reason: `Moon meets Saturn — a turning point that rewards discipline and honesty`,
        icon: 'GROWTH',
      });
    }

    // Sun aspect = most visible
    const sunHit = a.moonTimingEvents.find(e => e.targetPlanet === 'Sun');
    if (sunHit) {
      highlights.push({
        label: 'Peak Visibility Month',
        timing: sunHit.approximateMonth,
        reason: `Moon activates the Sun — you are seen, recognized, and your light shines brightest`,
        icon: 'SHINE',
      });
    }
  }

  return highlights.slice(0, 5);
}

const monthThemes: Record<number, string> = {
  1: 'Setting intentions and adjusting to new energy.',
  2: 'Building momentum. What you start now gains traction.',
  3: 'Communication and connections intensify.',
  4: 'Home and emotional foundations demand attention.',
  5: 'Creative energy peaks. Express yourself boldly.',
  6: 'Health and daily routines need refinement.',
  7: 'Relationships take center stage.',
  8: 'Deep transformation. Something shifts permanently.',
  9: 'Expansion through travel, learning, or new perspectives.',
  10: 'Career and public reputation are the focus.',
  11: 'Community and friendship bring unexpected gifts.',
  12: 'Integration and preparation for the next cycle.',
};

function buildMonthlyForecasts(a: SolarReturnAnalysis): { month: string; forecast: string }[] {
  const months: string[] = [];
  // Determine starting month from SR date
  const srDate = a.yearlyTheme ? new Date() : new Date(); // fallback
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Build 12 months of forecasts
  const forecasts: { month: string; forecast: string }[] = [];
  const timingMap = new Map<string, string>();
  for (const evt of a.moonTimingEvents) {
    if (!timingMap.has(evt.approximateMonth)) {
      const planet = P[evt.targetPlanet] || evt.targetPlanet;
      timingMap.set(evt.approximateMonth, `Moon activates ${planet} — ${(evt.interpretation || '').substring(0, 60)}`);
    }
  }

  for (let i = 0; i < 12; i++) {
    const mIdx = (srDate.getMonth() + i) % 12;
    const mName = monthNames[mIdx];
    const fromTiming = timingMap.get(mName);
    forecasts.push({
      month: mName.substring(0, 3).toUpperCase(),
      forecast: fromTiming || monthThemes[i + 1] || 'A month of steady progress.',
    });
  }
  return forecasts;
}

export function generateHighlightsPage(ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis) {
  const { pw, margin, contentW, colors } = ctx;

  // ── YEAR-AHEAD HIGHLIGHTS ──
  doc.setDrawColor(...colors.gold); doc.setLineWidth(2);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 24;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
  doc.setTextColor(...colors.gold);
  doc.text('YOUR BEST MONTHS THIS YEAR', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 8;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...colors.dimText);
  doc.text('Stick this on your fridge', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 20;

  const highlights = buildHighlights(a);
  for (const h of highlights) {
    ctx.checkPage(70);
    const boxY = ctx.y;
    doc.setFillColor(...colors.softGold);
    doc.setDrawColor(...colors.gold); doc.setLineWidth(1);
    doc.roundedRect(margin, boxY, contentW, 56, 6, 6, 'FD');

    // Icon badge
    doc.setFillColor(...colors.gold);
    doc.roundedRect(margin + 10, boxY + 10, 50, 22, 4, 4, 'F');
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(h.icon, margin + 35, boxY + 24, { align: 'center' });

    // Timing
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
    doc.setTextColor(...colors.gold);
    doc.text(h.timing, margin + 70, boxY + 24);

    // Label
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
    doc.setTextColor(...colors.deepBrown);
    doc.text(h.label, margin + 160, boxY + 18);

    // Reason
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(...colors.bodyText);
    const reasonLines = doc.splitTextToSize(h.reason, contentW - 170);
    reasonLines.slice(0, 2).forEach((line: string, i: number) => {
      doc.text(line, margin + 160, boxY + 32 + i * 11);
    });

    ctx.y = boxY + 62;
  }

  // ── MONTHLY ONE-LINE FORECASTS ──
  ctx.y += 16;
  ctx.checkPage(300);
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1.5);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(14);
  doc.setTextColor(...colors.gold);
  doc.text('MONTH-BY-MONTH AT A GLANCE', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 20;

  const forecasts = buildMonthlyForecasts(a);
  const colW = (contentW - 8) / 2;
  const rowH = 36;

  for (let i = 0; i < forecasts.length; i++) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    if (col === 0) ctx.checkPage(rowH + 10);

    const x = margin + col * (colW + 8);
    const y = ctx.y + row * rowH;

    // Alternating background
    if (row % 2 === 0) {
      doc.setFillColor(...colors.softGold);
      doc.roundedRect(x, y, colW, rowH - 4, 4, 4, 'F');
    }

    // Month label
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
    doc.setTextColor(...colors.gold);
    doc.text(forecasts[i].month, x + 8, y + 14);

    // Forecast
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...colors.bodyText);
    const fLines = doc.splitTextToSize(forecasts[i].forecast, colW - 50);
    fLines.slice(0, 2).forEach((line: string, li: number) => {
      doc.text(line, x + 42, y + 12 + li * 10);
    });
  }

  ctx.y += Math.ceil(forecasts.length / 2) * rowH + 10;
}
