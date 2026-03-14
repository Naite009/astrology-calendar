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
      ? `${monthNames[0]} – ${monthNames[2]} ${yearForFirst}`
      : `${monthNames[0]} ${yearForFirst} – ${monthNames[2]} ${yearForLast}`;
    const houses = [0, 1, 2].map(i => ((profH - 1 + startIdx + i) % 12) + 1);
    const houseThemes = houses.map(h => LIFE_THEMES[h]?.short || 'Life themes');
    const sentences: string[] = [];
    const tags: string[] = [];
    if (timeLord && q === 0) sentences.push(`${timeLordName} as Time Lord sets the agenda from the start — ${LIFE_THEMES[profH]?.detail || 'key themes'} are activated immediately.`);
    if (q === 0 && sunH) sentences.push(`The Solar Return Sun in the ${ord(sunH)} house directs core vitality toward ${LIFE_THEMES[sunH]?.detail || 'this area'}.`);
    if (stelliums.length > 0 && q === 0) { const s = stelliums[0]; sentences.push(`Your ${s.planets.length}-planet stellium in ${s.location} concentrates energy early.`); }
    if (retros.length > 0 && q === 1) { sentences.push(`${retros.map(r => P[r] || r).join(', ')} retrograde signals a revision period.`); tags.push('MERCURY RX'); }
    if (saturnH && q === 2) { sentences.push(`Saturn in the ${ord(saturnH)} house (${saturnSign}) asks for sustained discipline.`); if (saturnRx) tags.push('SATURN RX'); }
    if (moonSign && q === 2) { const moonFeels: Record<string, string> = { Aries: 'directness', Taurus: 'stability', Gemini: 'mental stimulation', Cancer: 'emotional depth', Leo: 'warmth', Virgo: 'analytical precision', Libra: 'harmony-seeking', Scorpio: 'psychological intensity', Sagittarius: 'restlessness', Capricorn: 'emotional discipline', Aquarius: 'detached clarity', Pisces: 'heightened empathy' }; sentences.push(`The SR Moon in ${moonSign} colors emotional responses with ${moonFeels[moonSign] || 'distinctive energy'}.`); }
    if (nodeH && q === 3) sentences.push(`The North Node in the ${ord(nodeH)} house pulls growth toward ${LIFE_THEMES[nodeH]?.detail || 'unfamiliar territory'}.`);
    if (sentences.length === 0) sentences.push(`The focus remains on ${houseThemes.join(', ').toLowerCase()}.`);
    let headline = '';
    if (q === 0 && timeLord) headline = `${timeLordName} Sets the Pace`;
    else if (q === 1 && retros.length > 0) headline = 'Review and Revision Period';
    else if (q === 2 && saturnH) headline = 'Saturn Tests What You\'ve Built';
    else if (q === 3 && nodeH) headline = 'Growth Edge Crystallizes';
    else headline = `${houseThemes[0]} Takes Center Stage`;
    quarters.push({ months: monthsLabel, headline, body: sentences.join(' '), tags });
  }
  return quarters;
}

export function generateQuarterlySummary(
  ctx: PDFContext, doc: jsPDF, a: SolarReturnAnalysis, srChart: SolarReturnChart, natalChart: NatalChart,
) {
  const { pw, margin, contentW } = ctx;

  ctx.pageBg(doc);
  ctx.trackedLabel(doc, '18 · YOUR YEAR IN FOUR SEASONS', margin, ctx.y);
  ctx.y += 8;
  doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 18;
  doc.setFont('times', 'bold'); doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text('Built from Your Chart', margin, ctx.y);
  ctx.y += 20;

  const quarters = buildDataRichQuarters(a, srChart, natalChart);

  for (let i = 0; i < 4; i++) {
    const q = quarters[i];
    ctx.checkPage(100);

    // Season date label
    doc.setFont('times', 'bold'); doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.setCharSpace(2);
    doc.text(q.months.toUpperCase(), margin, ctx.y);
    doc.setCharSpace(0);

    // Mercury Rx inline badge
    if (q.tags.length > 0) {
      const tagText = q.tags.join('  ');
      ctx.trackedLabel(doc, tagText, pw - margin, ctx.y, { align: 'right', size: 7 });
    }
    ctx.y += 14;

    // Season headline
    doc.setFont('times', 'bolditalic'); doc.setFontSize(14);
    doc.setTextColor(38, 34, 30);
    doc.text(q.headline, margin, ctx.y);
    ctx.y += 14;

    // Body
    doc.setFont('times', 'normal'); doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    const bodyLines: string[] = doc.splitTextToSize(q.body, contentW);
    for (const line of bodyLines) { doc.text(line, margin, ctx.y); ctx.y += 14; }

    // Hairline rule between seasons
    ctx.y += 6;
    doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
    doc.line(margin, ctx.y, pw - margin, ctx.y);
    ctx.y += 14;
  }
}
