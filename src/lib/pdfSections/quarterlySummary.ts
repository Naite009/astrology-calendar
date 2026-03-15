import jsPDF from 'jspdf';
import { PDFContext } from './pdfContext';
import { SolarReturnAnalysis } from '@/lib/solarReturnAnalysis';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { P } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];
const INK:   Color = [58,  54,  50]; // Charcoal grey
const MUTED: Color = [130, 125, 118];
const GOLD:  Color = [184, 150, 62];
const RULE:  Color = [200, 195, 188];
const CARD_BG: Color = [245, 241, 234];
const SOFT_GOLD: Color = [248, 242, 228];

const LIFE_THEMES: Record<number, { short: string; detail: string }> = {
  1: { short: 'Identity', detail: 'your identity, confidence, and how you show up' },
  2: { short: 'Money and Worth', detail: 'finances, possessions, and self-worth' },
  3: { short: 'Communication', detail: 'conversations, learning, and your local world' },
  4: { short: 'Home and Family', detail: 'home, family, and emotional foundations' },
  5: { short: 'Joy and Creativity', detail: 'romance, creative projects, and self-expression' },
  6: { short: 'Health and Routines', detail: 'daily habits, health, and work life' },
  7: { short: 'Relationships', detail: 'partnerships, commitments, and one-on-one dynamics' },
  8: { short: 'Depth and Change', detail: 'deep transformation, shared resources, and intimacy' },
  9: { short: 'Expansion', detail: 'travel, learning, and big-picture thinking' },
  10: { short: 'Career', detail: 'professional life, reputation, and ambitions' },
  11: { short: 'Community', detail: 'friendships, social circles, and future hopes' },
  12: { short: 'Inner Work', detail: 'rest, reflection, and spiritual life' },
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const SEASON_LABELS = ['Spring', 'Summer', 'Autumn', 'Winter'];

function ord(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`;
  const last = n % 10;
  if (last === 1) return `${n}st`;
  if (last === 2) return `${n}nd`;
  if (last === 3) return `${n}rd`;
  return `${n}th`;
}

interface QuarterData {
  months: string;
  headline: string;
  tags: string[];
  energy: string;
  powerMove: string;
}

function buildDataRichQuarters(a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart): QuarterData[] {
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
  const quarters: QuarterData[] = [];

  for (let q = 0; q < 4; q++) {
    const startIdx = q * 3;
    const monthIndices = [0, 1, 2].map(i => (birthMonth + startIdx + i) % 12);
    const monthNames = monthIndices.map(m => MONTH_NAMES[m]);
    const yearForFirst = monthIndices[0] < birthMonth ? srYear + 1 : srYear;
    const yearForLast = monthIndices[2] < birthMonth ? srYear + 1 : srYear;
    const monthsLabel = yearForFirst === yearForLast
      ? `${monthNames[0]} - ${monthNames[2]} ${yearForFirst}`
      : `${monthNames[0]} ${yearForFirst} - ${monthNames[2]} ${yearForLast}`;
    const houses = [0, 1, 2].map(i => ((profH - 1 + startIdx + i) % 12) + 1);
    const houseThemes = houses.map(h => LIFE_THEMES[h]?.short || 'Life themes');
    const sentences: string[] = [];
    const tags: string[] = [];

    if (timeLord && q === 0) sentences.push(`${timeLordName} as Time Lord sets the agenda from the start -- ${LIFE_THEMES[profH]?.detail || 'key themes'} are activated immediately.`);
    if (q === 0 && sunH) sentences.push(`The Solar Return Sun in the ${ord(sunH)} house directs core vitality toward ${LIFE_THEMES[sunH]?.detail || 'this area'}.`);
    if (stelliums.length > 0 && q === 0) { const s = stelliums[0]; const notableExtras = (s.extras || []).filter((e: string) => e === 'Chiron' || e === 'NorthNode'); const extrasNote = notableExtras.length > 0 ? ` (also with ${notableExtras.map((e: string) => e === 'NorthNode' ? 'North Node' : e).join(' and ')})` : ''; sentences.push(`Your ${s.planets.length}-planet stellium in ${s.location}${extrasNote} concentrates energy early.`); }
    if (retros.length > 0 && q === 1) { sentences.push(`${retros.map(r => P[r] || r).join(', ')} retrograde signals a revision period -- review and refine.`); tags.push('RETROGRADE'); }
    if (saturnH && q === 2) { sentences.push(`Saturn in the ${ord(saturnH)} house (${saturnSign}) asks for sustained discipline around ${LIFE_THEMES[saturnH]?.detail || 'key areas'}.`); if (saturnRx) tags.push('SATURN RX'); }
    if (moonSign && q === 2) {
      const moonFeels: Record<string, string> = { Aries: 'directness', Taurus: 'stability', Gemini: 'mental stimulation', Cancer: 'emotional depth', Leo: 'warmth', Virgo: 'analytical precision', Libra: 'harmony-seeking', Scorpio: 'psychological intensity', Sagittarius: 'restlessness', Capricorn: 'emotional discipline and pragmatism', Aquarius: 'detached clarity', Pisces: 'heightened empathy' };
      sentences.push(`The SR Moon in ${moonSign} colors emotional responses with ${moonFeels[moonSign] || 'distinctive energy'}.`);
    }
    if (nodeH && q === 3) sentences.push(`The North Node in the ${ord(nodeH)} house pulls growth toward ${LIFE_THEMES[nodeH]?.detail || 'unfamiliar territory'}.`);
    if (sentences.length === 0) sentences.push(`The focus remains on ${houseThemes.join(', ').toLowerCase()}.`);

    let headline = '';
    if (q === 0 && timeLord) headline = `${timeLordName} Sets the Pace`;
    else if (q === 1 && retros.length > 0) headline = 'Review and Revision';
    else if (q === 2 && saturnH) headline = 'Saturn Tests What You Have Built';
    else if (q === 3 && nodeH) headline = 'Growth Edge Crystallizes';
    else headline = `${houseThemes[0]} Takes Center Stage`;

    const energy = sentences[0] || 'Pay attention to what shows up here.';
    const actionSentences = sentences.filter(s => /build|create|trust|channel|lean|step|pay|use|ask|show|focus|walk|let|embrace|release/i.test(s));
    const powerMove = actionSentences[actionSentences.length - 1] || sentences[sentences.length - 1] || 'Stay present to what shifts.';

    quarters.push({ months: monthsLabel, headline, tags, energy, powerMove });
  }
  return quarters;
}

export function generateQuarterlySummary(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart,
) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);

  // Section header
  ctx.y += 36;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text('SEASONAL FORECAST', margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 12;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 32;

  doc.setFont('times', 'normal'); doc.setFontSize(32);
  doc.setTextColor(...INK);
  doc.text('Your Year in Four Seasons', margin, ctx.y);
  ctx.y += 16;

  doc.setFont('times', 'italic'); doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text('Built from your chart', margin, ctx.y);
  ctx.y += 38;

  const quarters = buildDataRichQuarters(a, srChart, natalChart);

  // 2x2 GRID LAYOUT
  const gridGapX = 18;
  const gridGapY = 18;
  const cellW = (contentW - gridGapX) / 2;
  const cellH = 230;

  ctx.checkPage(cellH * 2 + gridGapY + 20);

  for (let i = 0; i < 4; i++) {
    const q = quarters[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cellX = margin + col * (cellW + gridGapX);
    const cellY = ctx.y + row * (cellH + gridGapY);

    const isOdd = i % 2 === 1;
    const bgColor: Color = isOdd ? SOFT_GOLD : CARD_BG;

    doc.setFillColor(...bgColor);
    doc.roundedRect(cellX, cellY, cellW, cellH, 4, 4, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.roundedRect(cellX, cellY, cellW, cellH, 4, 4, 'S');

    // Gold top accent
    doc.setFillColor(...GOLD);
    doc.rect(cellX, cellY, cellW, 2.5, 'F');

    let cy = cellY + 24;

    // Season label
    doc.setFont('times', 'bold'); doc.setFontSize(14);
    doc.setTextColor(...GOLD);
    doc.text(SEASON_LABELS[i] || `Q${i + 1}`, cellX + 14, cy);
    cy += 20;

    // Months label
    doc.setFont('times', 'bold'); doc.setFontSize(6.5);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(2.5);
    doc.text(q.months.toUpperCase(), cellX + 14, cy);
    doc.setCharSpace(0);
    cy += 18;

    // Headline
    doc.setFont('times', 'bold'); doc.setFontSize(16);
    doc.setTextColor(...INK);
    const headLines: string[] = doc.splitTextToSize(q.headline, cellW - 28);
    for (const hl of headLines.slice(0, 2)) { doc.text(hl, cellX + 14, cy); cy += 20; }
    cy += 10;

    // THE ENERGY
    doc.setFont('times', 'bold'); doc.setFontSize(6.5);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(2);
    doc.text('THE ENERGY', cellX + 14, cy);
    doc.setCharSpace(0);
    cy += 12;
    doc.setFont('times', 'normal'); doc.setFontSize(9);
    doc.setTextColor(...INK);
    const eLines: string[] = doc.splitTextToSize(q.energy, cellW - 28);
    for (const l of eLines.slice(0, 3)) { doc.text(l, cellX + 14, cy); cy += 12; }
    cy += 10;

    // THE POWER MOVE
    doc.setFont('times', 'bold'); doc.setFontSize(6.5);
    doc.setTextColor(...GOLD);
    doc.setCharSpace(2);
    doc.text('THE POWER MOVE', cellX + 14, cy);
    doc.setCharSpace(0);
    cy += 12;
    doc.setFont('times', 'italic'); doc.setFontSize(9);
    doc.setTextColor(...INK);
    const pLines: string[] = doc.splitTextToSize(q.powerMove, cellW - 28);
    for (const l of pLines.slice(0, 2)) { doc.text(l, cellX + 14, cy); cy += 12; }

    // Tags
    if (q.tags.length > 0) {
      cy += 8;
      for (const tag of q.tags) {
        const tagW = doc.getTextWidth(tag) + 12;
        doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
        doc.roundedRect(cellX + 14, cy - 8, tagW, 14, 3, 3, 'S');
        doc.setFont('times', 'bold'); doc.setFontSize(6.5);
        doc.setTextColor(...GOLD);
        doc.text(tag, cellX + 20, cy);
        cy += 16;
      }
    }
  }

  ctx.y += cellH * 2 + gridGapY + 24;
}
