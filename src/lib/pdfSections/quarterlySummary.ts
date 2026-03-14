import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { P } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];

const LIFE_THEMES: Record<number, { short: string; detail: string }> = {
  1: { short: 'Identity', detail: 'your identity, confidence, and how you show up' },
  2: { short: 'Money & Worth', detail: 'finances, possessions, and self-worth' },
  3: { short: 'Communication', detail: 'conversations, learning, and your local world' },
  4: { short: 'Home & Family', detail: 'home, family, and emotional foundations' },
  5: { short: 'Joy & Creativity', detail: 'romance, creative projects, and self-expression' },
  6: { short: 'Health & Routines', detail: 'daily habits, health, and work life' },
  7: { short: 'Relationships', detail: 'partnerships, commitments, and one-on-one dynamics' },
  8: { short: 'Depth & Change', detail: 'deep transformation, shared resources, and intimacy' },
  9: { short: 'Expansion', detail: 'travel, learning, and big-picture thinking' },
  10: { short: 'Career', detail: 'professional life, reputation, and ambitions' },
  11: { short: 'Community', detail: 'friendships, social circles, and future hopes' },
  12: { short: 'Inner Work', detail: 'rest, reflection, and spiritual life' },
};

const QUARTER_LABELS = ['Q1 — LAUNCHING', 'Q2 — BUILDING', 'Q3 — HARVESTING', 'Q4 — INTEGRATING'];
const QUARTER_ICONS = ['🌱', '🔨', '🌾', '🪞'];
const SEASON_COLORS: Color[] = [
  [45, 140, 90],   // green — spring/launch
  [180, 120, 40],  // amber — building
  [160, 80, 50],   // rust — harvest
  [80, 100, 140],  // slate blue — integration
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

interface QuarterData {
  label: string;
  months: string;
  houseThemes: string[];
  keyTheme: string;
  guidance: string;
  accentColor: Color;
}

function getSignFeel(sign: string): string {
  const feels: Record<string, string> = {
    Aries: 'courage and urgency', Taurus: 'stability and groundedness',
    Gemini: 'curiosity and mental stimulation', Cancer: 'nurturing and emotional depth',
    Leo: 'warmth, pride, and creative spark', Virgo: 'precision and self-improvement',
    Libra: 'harmony and partnership', Scorpio: 'intensity and transformation',
    Sagittarius: 'optimism and adventure', Capricorn: 'discipline and ambition',
    Aquarius: 'innovation and independence', Pisces: 'intuition and compassion',
  };
  return feels[sign] || 'mixed energy';
}

function buildQuarters(
  a: SolarReturnAnalysis,
  srChart: SolarReturnChart,
  natalChart: NatalChart,
): QuarterData[] {
  const srYear = srChart.solarReturnYear || new Date().getFullYear();
  let birthMonth = 2;
  if (natalChart.birthDate) {
    const parts = natalChart.birthDate.split(/[-/]/);
    if (parts.length >= 2) {
      const candidate = parts[0].length === 4 ? parseInt(parts[1], 10) - 1 : parseInt(parts[0], 10) - 1;
      if (candidate >= 0 && candidate <= 11) birthMonth = candidate;
    }
  }

  const profH = a.profectionYear?.houseNumber || 1;
  const timeLord = a.profectionYear?.timeLord || '';
  const timeLordName = P[timeLord] || timeLord;
  const moonSign = a.moonSign || '';
  const retros = a.retrogrades?.planets || [];
  const stelliums = a.stelliums || [];

  const quarters: QuarterData[] = [];

  for (let q = 0; q < 4; q++) {
    const startIdx = q * 3;
    const monthIndices = [0, 1, 2].map(i => (birthMonth + startIdx + i) % 12);
    const monthNames = monthIndices.map(m => MONTH_NAMES[m]);
    const yearForFirst = monthIndices[0] < birthMonth ? srYear + 1 : srYear;
    const yearForLast = monthIndices[2] < birthMonth ? srYear + 1 : srYear;
    const monthsLabel = yearForFirst === yearForLast
      ? `${monthNames[0]} – ${monthNames[2]} ${yearForFirst}`
      : `${monthNames[0]} ${yearForFirst} – ${monthNames[2]} ${yearForLast}`;

    // House themes rotating from profection house
    const houses = [0, 1, 2].map(i => ((profH - 1 + startIdx + i) % 12) + 1);
    const houseThemes = houses.map(h => LIFE_THEMES[h]?.short || 'Life themes');

    let keyTheme = '';
    let guidance = '';

    if (q === 0) {
      // Q1: Launch — opening energy, Time Lord, ASC ruler
      keyTheme = `The year opens with ${timeLordName} setting the pace.`;
      const ascRuler = a.srAscRulerInNatal;
      if (ascRuler) {
        keyTheme += ` Your chart ruler points toward ${LIFE_THEMES[ascRuler.rulerNatalHouse]?.detail || 'key areas'} as the year's landing zone.`;
      }
      if (stelliums.length > 0) {
        const s = stelliums[0];
        guidance = `Concentrated energy in ${s.location} demands early attention. Lean into ${houseThemes[0].toLowerCase()} and ${houseThemes[1].toLowerCase()} — this is where momentum builds.`;
      } else {
        guidance = `Focus on ${houseThemes[0].toLowerCase()} and ${houseThemes[1].toLowerCase()}. The energy is fresh — plant seeds deliberately rather than scattering in every direction.`;
      }
    } else if (q === 1) {
      // Q2: Building — Sun house, retrogrades
      const srSunH = a.sunHouse?.house;
      if (srSunH) {
        keyTheme = `Your Solar Return Sun in the ${srSunH}${srSunH === 1 ? 'st' : srSunH === 2 ? 'nd' : srSunH === 3 ? 'rd' : 'th'} house brings core vitality to ${LIFE_THEMES[srSunH]?.detail || 'this area'}.`;
      } else {
        keyTheme = `Mid-year energy builds as early themes solidify into tangible form.`;
      }
      if (retros.length > 0) {
        guidance = `${retros.map(r => P[r] || r).join(' and ')} retrograde may slow external progress — use this to refine, not to push harder. The themes of ${houseThemes.join(', ').toLowerCase()} benefit from revision.`;
      } else {
        guidance = `Steady momentum in ${houseThemes.join(', ').toLowerCase()}. This is the quarter to build on what you started — commit rather than restart.`;
      }
    } else if (q === 2) {
      // Q3: Harvesting — Moon emotional climate, Saturn discipline
      if (moonSign) {
        keyTheme = `Emotionally, ${moonSign} energy colors this quarter with ${getSignFeel(moonSign)}.`;
      } else {
        keyTheme = `The emotional landscape deepens as the year matures.`;
      }
      if (a.saturnFocus?.house) {
        guidance = `Saturn in your ${a.saturnFocus.house}${a.saturnFocus.house === 1 ? 'st' : a.saturnFocus.house === 2 ? 'nd' : a.saturnFocus.house === 3 ? 'rd' : 'th'} house asks for discipline around ${LIFE_THEMES[a.saturnFocus.house]?.detail || 'responsibilities'}. What you've built is being tested — stay steady.`;
      } else {
        guidance = `Results from earlier efforts become visible. Pay attention to ${houseThemes.join(' and ').toLowerCase()} — this is where you see what's working.`;
      }
    } else {
      // Q4: Integration — Nodes, repeated themes, closing
      if (a.nodesFocus?.house) {
        keyTheme = `Growth is pulling you toward ${LIFE_THEMES[a.nodesFocus.house]?.detail || 'new territory'}. The soul's assignment becomes clearer as the year closes.`;
      } else {
        keyTheme = `The year is drawing to a close — patterns that emerged in Q1 now reveal their deeper purpose.`;
      }
      if (a.repeatedThemes?.length > 0) {
        guidance = `A recurring theme this year — ${a.repeatedThemes[0].description} — reaches its resolution. Let the lessons settle. Release what no longer serves the next chapter.`;
      } else {
        guidance = `Integration time. Look back at what this year taught you about ${houseThemes[0].toLowerCase()} and ${houseThemes[2].toLowerCase()}. The wisdom you carry forward matters more than any single event.`;
      }
    }

    quarters.push({
      label: QUARTER_LABELS[q],
      months: monthsLabel,
      houseThemes,
      keyTheme,
      guidance,
      accentColor: SEASON_COLORS[q],
    });
  }

  return quarters;
}

export function generateQuarterlySummary(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis,
  srChart: SolarReturnChart, natalChart: NatalChart,
) {
  const { pw, margin, contentW, colors } = ctx;

  // Section header
  doc.setDrawColor(...colors.gold); doc.setLineWidth(1);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 22;
  doc.setFont('helvetica', 'bold'); doc.setFontSize(18);
  doc.setTextColor(...colors.gold);
  doc.text('YOUR YEAR IN FOUR SEASONS', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 8;
  doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...colors.dimText);
  doc.text('Key themes for each quarter of your solar return year', pw / 2, ctx.y, { align: 'center' });
  ctx.y += 20;

  const quarters = buildQuarters(a, srChart, natalChart);

  // 2×2 grid layout
  const cols = 2;
  const gap = 10;
  const colW = (contentW - gap) / cols;
  const availH = ctx.ph - ctx.y - 40;
  const rowH = (availH - gap) / 2;

  for (let i = 0; i < 4; i++) {
    const q = quarters[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (colW + gap);
    const y = ctx.y + row * (rowH + gap);

    // Card background
    doc.setFillColor(...colors.softGold);
    doc.setDrawColor(...colors.warmBorder); doc.setLineWidth(0.4);
    doc.roundedRect(x, y, colW, rowH, 5, 5, 'FD');

    // Colored top accent bar
    doc.setFillColor(...q.accentColor);
    doc.roundedRect(x, y, colW, 4, 5, 5, 'F');
    // Cover bottom corners of accent with card color
    doc.setFillColor(...colors.softGold);
    doc.rect(x, y + 2, colW, 4, 'F');

    let curY = y + 18;

    // Quarter label
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
    doc.setTextColor(...q.accentColor);
    doc.text(q.label, x + 10, curY);
    curY += 12;

    // Months range
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...colors.dimText);
    doc.text(q.months, x + 10, curY);
    curY += 14;

    // House theme tags
    doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
    let tagX = x + 10;
    for (const theme of q.houseThemes) {
      const tw = doc.getTextWidth(theme) + 12;
      if (tagX + tw > x + colW - 6) { tagX = x + 10; curY += 14; }
      doc.setFillColor(...q.accentColor);
      doc.roundedRect(tagX, curY - 7, tw, 12, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.text(theme, tagX + 6, curY + 1);
      tagX += tw + 4;
    }
    curY += 16;

    // Key theme paragraph
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.setTextColor(...colors.bodyText);
    const themeLines: string[] = doc.splitTextToSize(q.keyTheme, colW - 20);
    const maxY = y + rowH - 50;
    for (const line of themeLines) {
      if (curY > maxY) break;
      doc.text(line, x + 10, curY);
      curY += 11;
    }
    curY += 4;

    // Guidance paragraph (slightly dimmer)
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8);
    doc.setTextColor(...colors.deepBrown);
    const guidanceLines: string[] = doc.splitTextToSize(q.guidance, colW - 20);
    const maxGY = y + rowH - 8;
    for (const line of guidanceLines) {
      if (curY > maxGY) break;
      doc.text(line, x + 10, curY);
      curY += 10;
    }
  }

  ctx.y = ctx.y + 2 * (rowH + gap) + 10;
}
