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

// v3 quarter accent colors
const QUARTER_COLORS: Color[] = [
  [107, 79, 160],  // Q1: purple
  [201, 168, 76],  // Q2: gold
  [196, 98, 45],   // Q3: rust
  [155, 142, 196], // Q4: lilac
];

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

function ord(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

interface QuarterData {
  months: string;
  headline: string;
  body: string;
  tags: string[];
  accentColor: Color;
}

/**
 * Build data-rich quarterly content from REAL chart data only.
 * Every sentence must trace to a specific planet, aspect, date, or house.
 * Generic language ("new beginnings", "birthday season", "spring energy") is BANNED.
 */
function buildDataRichQuarters(
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
  const sunH = a.sunHouse?.house || 1;
  const saturnH = a.saturnFocus?.house;
  const saturnSign = a.saturnFocus?.sign || '';
  const saturnRx = a.saturnFocus?.isRetrograde || false;
  const nodeH = a.nodesFocus?.house;

  // Determine key dates from analysis if available
  const keyDates = a.keyDates || [];

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

    const houses = [0, 1, 2].map(i => ((profH - 1 + startIdx + i) % 12) + 1);
    const houseThemes = houses.map(h => LIFE_THEMES[h]?.short || 'Life themes');

    const sentences: string[] = [];
    const tags: string[] = [];

    // 1. Time Lord activations in this quarter
    if (timeLord && q === 0) {
      sentences.push(`${timeLordName} as Time Lord sets the agenda from the start — ${LIFE_THEMES[profH]?.detail || 'key themes'} are activated immediately.`);
    }

    // 2. Sun house context
    if (q === 0 && sunH) {
      sentences.push(`The Solar Return Sun in the ${ord(sunH)} house directs core vitality toward ${LIFE_THEMES[sunH]?.detail || 'this area'}.`);
    }

    // 3. Stellium peaks
    if (stelliums.length > 0 && q === 0) {
      const s = stelliums[0];
      const planets = s.planets.map(pp => P[pp] || pp).join(', ');
      sentences.push(`Your ${s.planets.length}-planet stellium in ${s.location} (${planets}) concentrates energy early — lean into this concentration.`);
    }

    // 4. Retrograde planets
    if (retros.length > 0 && q === 1) {
      const rxNames = retros.map(r => P[r] || r).join(', ');
      sentences.push(`${rxNames} retrograde in the SR chart signals a revision period — review and refine rather than launching new initiatives.`);
      tags.push('Rx');
    }

    // 5. Saturn position and discipline
    if (saturnH && q === 2) {
      sentences.push(`Saturn in the ${ord(saturnH)} house (${saturnSign}) asks for sustained discipline around ${LIFE_THEMES[saturnH]?.detail || 'responsibilities'}.`);
      if (saturnRx) {
        sentences.push(`Saturn stations retrograde during this period — structures built earlier are now tested for authenticity.`);
        tags.push('Saturn Rx');
      }
    }

    // 6. Moon emotional climate
    if (moonSign && q === 2) {
      const moonFeels: Record<string, string> = {
        Aries: 'directness and urgency', Taurus: 'stability and sensory grounding',
        Gemini: 'mental stimulation and verbal processing', Cancer: 'emotional depth and intuitive responses',
        Leo: 'warmth and the need for creative expression', Virgo: 'analytical precision and self-improvement',
        Libra: 'harmony-seeking and relationship sensitivity', Scorpio: 'psychological intensity and truth-seeking',
        Sagittarius: 'restlessness and philosophical questioning', Capricorn: 'emotional discipline and pragmatism',
        Aquarius: 'detached clarity and unconventional responses', Pisces: 'heightened empathy and boundary dissolution',
      };
      sentences.push(`The SR Moon in ${moonSign} colors emotional responses with ${moonFeels[moonSign] || 'distinctive energy'}.`);
    }

    // 7. Balsamic Moon phase context
    if (a.moonPhase?.phase && q === 3) {
      const phase = a.moonPhase.phase;
      if (phase === 'Balsamic' || phase === 'Balsamic Moon') {
        sentences.push(`The Balsamic Moon phase colors the entire year toward completion — Q4 is especially important for release and preparation.`);
      } else if (phase === 'Full Moon') {
        sentences.push(`The Full Moon phase brings this quarter toward culmination — what was seeded earlier now reaches full visibility.`);
      }
    }

    // 8. Nodes
    if (nodeH && q === 3) {
      sentences.push(`The North Node in the ${ord(nodeH)} house pulls growth toward ${LIFE_THEMES[nodeH]?.detail || 'unfamiliar territory'} as the year closes.`);
    }

    // If quarter is genuinely quiet, say so
    if (sentences.length === 0) {
      if (q === 1) {
        sentences.push(`No major Time Lord activations dominate this quarter — a steadier stretch for consolidating what Q1 established in ${houseThemes.join(' and ').toLowerCase()}.`);
      } else if (q === 3) {
        sentences.push(`This quarter resolves themes from ${houseThemes[0].toLowerCase()} and ${houseThemes[2].toLowerCase()}. The year's lessons settle and integrate.`);
      } else {
        sentences.push(`The focus remains on ${houseThemes.join(', ').toLowerCase()} — the profection rotation brings these themes into active play.`);
      }
    }

    // Build headline from dominant data point
    let headline = '';
    if (q === 0 && timeLord) {
      headline = `${timeLordName} sets the pace`;
    } else if (q === 1 && retros.length > 0) {
      headline = `Review and revision period`;
    } else if (q === 2 && saturnH) {
      headline = `Saturn tests what you\'ve built`;
    } else if (q === 3 && nodeH) {
      headline = `Growth edge crystallizes`;
    } else {
      headline = `${houseThemes[0]} takes center stage`;
    }

    quarters.push({
      months: monthsLabel,
      headline,
      body: sentences.join(' '),
      tags,
      accentColor: QUARTER_COLORS[q],
    });
  }

  return quarters;
}

export function generateQuarterlySummary(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis,
  srChart: SolarReturnChart, natalChart: NatalChart,
) {
  const { pw, margin, contentW, colors } = ctx;

  // v3 section header
  ctx.sectionTitle(doc, 'YOUR YEAR IN FOUR CHAPTERS', 'Built from your chart');

  const quarters = buildDataRichQuarters(a, srChart, natalChart);

  // Stacked cards (not 2x2 grid) — each card uses left accent bar in quarter color
  for (let i = 0; i < 4; i++) {
    const q = quarters[i];
    ctx.checkPage(130);

    const cardStartY = ctx.y;
    ctx.y += 12;

    // Month range label
    doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
    doc.setTextColor(...colors.ink);
    doc.setCharSpace(0.6);
    doc.text(q.months.toUpperCase(), margin + 16, ctx.y);
    doc.setCharSpace(0);
    ctx.y += 14;

    // Headline
    doc.setFont('Georgia', 'bold'); doc.setFontSize(11);
    doc.setTextColor(...colors.ink);
    doc.text(q.headline, margin + 16, ctx.y);
    ctx.y += 8;

    // Body
    doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...colors.bodyText);
    const bodyLines: string[] = doc.splitTextToSize(q.body, contentW - 32);
    for (const line of bodyLines.slice(0, 6)) {
      ctx.y += 13;
      doc.text(line, margin + 16, ctx.y);
    }
    ctx.y += 8;

    // Tags
    if (q.tags.length > 0) {
      let tagX = margin + 16;
      for (const tag of q.tags) {
        const tw = doc.getTextWidth(tag) + 14;
        doc.setFillColor(237, 229, 247);
        doc.roundedRect(tagX, ctx.y - 3, tw, 14, 2, 2, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
        doc.setTextColor(74, 45, 138);
        doc.text(tag, tagX + 7, ctx.y + 6);
        tagX += tw + 6;
      }
      ctx.y += 16;
    }

    ctx.y += 8;

    // Draw card border and left accent bar
    const cardH = ctx.y - cardStartY;
    doc.setDrawColor(...colors.border); doc.setLineWidth(0.5);
    doc.roundedRect(margin, cardStartY, contentW, cardH, 4, 4, 'S');
    doc.setFillColor(...q.accentColor);
    doc.rect(margin, cardStartY, 3, cardH, 'F');

    ctx.y += 8;
  }
}
