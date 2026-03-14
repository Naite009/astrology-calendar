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
    if (stelliums.length > 0 && q === 0) { const s = stelliums[0]; sentences.push(`Your ${s.planets.length}-planet stellium in ${s.location} concentrates energy early — lean into this concentration rather than scattering your focus.`); }
    if (retros.length > 0 && q === 1) { sentences.push(`${retros.map(r => P[r] || r).join(', ')} retrograde in the SR chart signals a revision period — review and refine rather than launching new initiatives. This is not a slowdown; it is an invitation to perfect what you have already started. Revisit projects, relationships, and decisions from the first season with fresh eyes.`); tags.push('MERCURY RX'); }
    if (saturnH && q === 2) { sentences.push(`Saturn in the ${ord(saturnH)} house (${saturnSign}) asks for sustained discipline around ${LIFE_THEMES[saturnH]?.detail || 'key areas'} and how you show up.`); if (saturnRx) tags.push('SATURN RX'); }
    if (moonSign && q === 2) {
      const moonFeels: Record<string, string> = { Aries: 'directness', Taurus: 'stability', Gemini: 'mental stimulation', Cancer: 'emotional depth', Leo: 'warmth', Virgo: 'analytical precision', Libra: 'harmony-seeking', Scorpio: 'psychological intensity', Sagittarius: 'restlessness', Capricorn: 'emotional discipline and pragmatism', Aquarius: 'detached clarity', Pisces: 'heightened empathy' };
      sentences.push(`The SR Moon in ${moonSign} colors emotional responses with ${moonFeels[moonSign] || 'distinctive energy'}. What you built in the first half of the year is now being tested for durability.`);
    }
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
  const { pw, ph, margin, contentW } = ctx;

  ctx.pageBg(doc);
  ctx.sectionTitle(doc, 'YOUR YEAR IN FOUR SEASONS', 'Built from Your Chart');
  ctx.drawGoldRule(doc);
  ctx.y += 20;

  const quarters = buildDataRichQuarters(a, srChart, natalChart);

  for (let i = 0; i < 4; i++) {
    const q = quarters[i];

    const tagText = q.tags.join('  ');
    doc.setFont('times', 'bold'); doc.setFontSize(7);
    const tagW = tagText ? doc.getTextWidth(tagText) + 16 : 0;

    const headlineMaxW = contentW - 44 - (tagW > 0 ? tagW + 14 : 0);
    const headLines: string[] = doc.splitTextToSize(q.headline, Math.max(220, headlineMaxW));
    const bodyLines: string[] = doc.splitTextToSize(q.body, contentW - 44);

    const cardH = Math.max(
      120,
      24 + 18 + headLines.length * 24 + 8 + bodyLines.length * 16.5 + 20,
    );

    ctx.checkPage(cardH + 18);
    const startY = ctx.y;

    doc.setFillColor(...CARD_BG);
    doc.roundedRect(margin, startY, contentW, cardH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.3);
    doc.roundedRect(margin, startY, contentW, cardH, 3, 3, 'S');

    doc.setFillColor(...GOLD);
    doc.rect(margin, startY, 3, cardH, 'F');

    let cy = startY + 24;
    ctx.trackedLabel(doc, q.months.toUpperCase(), margin + 16, cy, { size: 7.8, charSpace: 2.8 });

    if (tagW > 0) {
      const tagX = margin + contentW - 18 - tagW;
      doc.setDrawColor(...GOLD); doc.setLineWidth(0.5);
      doc.roundedRect(tagX, cy - 9, tagW, 15, 3, 3, 'S');
      doc.setTextColor(...GOLD);
      doc.setCharSpace(2);
      doc.text(tagText, tagX + 8, cy);
      doc.setCharSpace(0);
    }

    cy += 18;

    doc.setFont('times', 'bold'); doc.setFontSize(20);
    doc.setTextColor(...INK);
    for (const hl of headLines) {
      doc.text(hl, margin + 16, cy);
      cy += 24;
    }

    cy += 4;

    doc.setFont('times', 'normal'); doc.setFontSize(10.5);
    doc.setTextColor(...INK);
    for (const line of bodyLines) {
      doc.text(line, margin + 16, cy);
      cy += 16.5;
    }

    ctx.y = startY + cardH + 16;
  }
}
