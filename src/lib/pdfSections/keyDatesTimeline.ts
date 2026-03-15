import jsPDF from 'jspdf';
import * as Astronomy from 'astronomy-engine';
import { PDFContext } from './pdfContext';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { signDegreesToLongitude } from '@/lib/houseCalculations';
import { angularSeparation, getPlanetLongitudeExact } from '@/lib/transitMath';
import { P } from '@/components/SolarReturnPDFExport';

type Color = [number, number, number];
const INK:     Color = [58,  54,  50];
const MUTED:   Color = [130, 125, 118];
const GOLD:    Color = [184, 150, 62];
const RULE:    Color = [200, 195, 188];
const WHITE:   Color = [255, 255, 255];

const NATURE_COLORS: Record<string, { bg: Color; text: Color; label: string }> = {
  fusion:      { bg: [248, 242, 228], text: [140, 120, 50],  label: 'FUSION' },
  tension:     { bg: [252, 235, 232], text: [160, 60,  40],  label: 'PRESSURE' },
  flow:        { bg: [232, 248, 240], text: [40,  120, 80],  label: 'FLOW' },
  challenge:   { bg: [252, 240, 230], text: [160, 90,  30],  label: 'CHALLENGE' },
  opportunity: { bg: [235, 242, 252], text: [50,  80,  140], label: 'OPPORTUNITY' },
};

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_BODIES: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun, Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury, Venus: Astronomy.Body.Venus, Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter, Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus, Neptune: Astronomy.Body.Neptune, Pluto: Astronomy.Body.Pluto,
};

const ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 3, nature: 'fusion' },
  { name: 'Opposition', angle: 180, orb: 3, nature: 'tension' },
  { name: 'Trine', angle: 120, orb: 2.5, nature: 'flow' },
  { name: 'Square', angle: 90, orb: 3, nature: 'challenge' },
  { name: 'Sextile', angle: 60, orb: 2, nature: 'opportunity' },
] as const;

const NATAL_TARGETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Ascendant'];

interface TimelineEvent {
  date: Date; natalPlanet: string; aspectName: string;
  nature: string; summary: string;
}

const lonToSign = (lon: number): { sign: string; degree: number } => {
  const n = ((lon % 360) + 360) % 360;
  return { sign: ZODIAC_SIGNS[Math.floor(n / 30)], degree: Math.floor(n % 30) };
};

function get5WordSummary(timeLord: string, natalPlanet: string, aspect: string): string {
  const summaries: Record<string, Record<string, string>> = {
    Conjunction: {
      Sun: 'Identity merges with year theme',
      Moon: 'Emotions intensify and demand attention',
      Mercury: 'Thinking aligns with year agenda',
      Venus: 'Love activates the year theme',
      Mars: 'Drive peaks with full force',
      Jupiter: 'Expansion meets the year story',
      Saturn: 'Structure tests what you built',
      Ascendant: 'Public image transforms this month',
    },
    Opposition: {
      Sun: 'Others mirror your core truth',
      Moon: 'Emotional tension reveals hidden needs',
      Mercury: 'Ideas challenged by outside voices',
      Venus: 'Relationship dynamics demand honest reckoning',
      Mars: 'Conflict reveals what matters most',
      Jupiter: 'Optimism tested by hard facts',
      Saturn: 'Responsibilities and freedom pull apart',
      Ascendant: 'Partnerships hold the mirror up',
    },
    Trine: {
      Sun: 'Confidence flows naturally this month',
      Moon: 'Emotional ease supports your growth',
      Mercury: 'Clear thinking opens right doors',
      Venus: 'Love and beauty arrive easily',
      Mars: 'Action produces results without friction',
      Jupiter: 'Lucky break rewards patient effort',
      Saturn: 'Discipline pays off with results',
      Ascendant: 'Presence and purpose feel aligned',
    },
    Square: {
      Sun: 'Ego meets uncomfortable growth pressure',
      Moon: 'Emotional friction forces honest change',
      Mercury: 'Mental stress demands clear priorities',
      Venus: 'Love and money under pressure',
      Mars: 'Frustration channels into breakthrough action',
      Jupiter: 'Growth pains push past limits',
      Saturn: 'Structure cracks reveal weak points',
      Ascendant: 'Identity crisis sparks real evolution',
    },
    Sextile: {
      Sun: 'Quiet opportunity for self-expression opens',
      Moon: 'Emotional support appears when needed',
      Mercury: 'Useful information arrives at right time',
      Venus: 'Small romantic or financial opening',
      Mars: 'Practical action opportunity presents itself',
      Jupiter: 'Modest growth through structured effort',
      Saturn: 'Steady progress through patient refinement',
      Ascendant: 'Subtle shift in how others see you',
    },
  };
  return summaries[aspect]?.[natalPlanet] || 'Key activation point this month';
}

export function generateKeyDatesTimeline(
  ctx: PDFContext, doc: jsPDF,
  timeLord: string,
  natalChart: NatalChart,
  srChart: SolarReturnChart,
) {
  const { margin, contentW, pw } = ctx;
  const ph = doc.internal.pageSize.getHeight();
  const body = PLANET_BODIES[timeLord];
  if (!body) return;

  const srYear = srChart.solarReturnYear;
  const startDate = new Date(srYear, 2, 1);
  const endDate = new Date(srYear + 1, 3, 1);

  // Get natal planet longitudes
  const natalLons: Record<string, number> = {};
  for (const planet of NATAL_TARGETS) {
    if (planet === 'Ascendant') {
      const asc = natalChart.houseCusps?.house1;
      if (asc) {
        const idx = ZODIAC_SIGNS.indexOf(asc.sign);
        if (idx >= 0) natalLons[planet] = idx * 30 + (asc.degree || 0) + ((asc as any).minutes || 0) / 60;
      }
    } else {
      const p = natalChart.planets[planet as keyof typeof natalChart.planets];
      if (p?.sign) {
        natalLons[planet] = signDegreesToLongitude(p.sign, p.degree, p.minutes || 0);
      }
    }
  }

  // Scan for events
  const events: TimelineEvent[] = [];
  const foundKeys = new Set<string>();

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 3)) {
    const date = new Date(d);
    let tlLon: number;
    try { tlLon = getPlanetLongitudeExact(body, date); } catch { continue; }

    for (const [natalPlanet, natalLon] of Object.entries(natalLons)) {
      if (natalPlanet === timeLord) continue;
      for (const asp of ASPECTS) {
        const orb = Math.abs(angularSeparation(tlLon, natalLon) - asp.angle);
        if (orb <= asp.orb) {
          const key = `${natalPlanet}-${asp.name}`;
          if (foundKeys.has(key)) continue;

          let bestDate = date;
          let bestOrb = orb;
          for (let offset = -3; offset <= 3; offset++) {
            const testDate = new Date(date);
            testDate.setDate(testDate.getDate() + offset);
            try {
              const testLon = getPlanetLongitudeExact(body, testDate);
              const testOrb = Math.abs(angularSeparation(testLon, natalLon) - asp.angle);
              if (testOrb < bestOrb) { bestOrb = testOrb; bestDate = testDate; }
            } catch { /* skip */ }
          }

          events.push({
            date: bestDate, natalPlanet, aspectName: asp.name,
            nature: asp.nature,
            summary: get5WordSummary(timeLord, natalPlanet, asp.name),
          });
          foundKeys.add(key);
        }
      }
    }
  }

  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  if (events.length === 0) return;

  const tlName = P[timeLord] || timeLord;

  // New page — white bg
  doc.addPage();
  ctx.y = margin;
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pw, ph, 'F');
  ctx.sectionPages.set('KEY DATES', doc.getNumberOfPages());

  // Section header
  ctx.y += 20;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text(`KEY DATES -- ${tlName.toUpperCase()}`, margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 8;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 22;

  doc.setFont('times', 'normal'); doc.setFontSize(25);
  doc.setTextColor(...INK);
  doc.text('When Your Year Activates', margin, ctx.y);
  ctx.y += 12;

  doc.setFont('times', 'italic'); doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`Transiting ${tlName} to your natal planets`, margin, ctx.y);
  ctx.y += 16;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const colGap = 12;
  const colW = (contentW - colGap) / 2;
  const cardH = 44;
  const rowGap = 8;

  const availableH = ph - 62 - ctx.y;
  const maxRows = Math.max(1, Math.floor((availableH + rowGap) / (cardH + rowGap)));
  const maxEvents = maxRows * 2;
  const visibleEvents = events.slice(0, maxEvents);

  for (let i = 0; i < visibleEvents.length; i++) {
    const event = visibleEvents[i];
    const row = Math.floor(i / 2);
    const col = i % 2;
    const x = margin + col * (colW + colGap);
    const y = ctx.y + row * (cardH + rowGap);

    const nature = NATURE_COLORS[event.nature] || NATURE_COLORS.fusion;
    const dateStr = `${months[event.date.getMonth()]} ${event.date.getDate()}`;
    const natalName = P[event.natalPlanet] || event.natalPlanet;
    const aspectTitle = `${tlName} ${event.aspectName} ${natalName}`;

    doc.setFillColor(...nature.bg);
    doc.roundedRect(x, y, colW, cardH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.2);
    doc.roundedRect(x, y, colW, cardH, 3, 3, 'S');
    doc.setFillColor(...GOLD);
    doc.rect(x, y, 2.5, cardH, 'F');

    doc.setFont('times', 'bold'); doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    doc.text(dateStr, x + 10, y + 13);

    doc.setFont('times', 'bold'); doc.setFontSize(6);
    doc.setTextColor(...nature.text);
    doc.setCharSpace(1.2);
    doc.text(nature.label, x + colW - 8, y + 13, { align: 'right' });
    doc.setCharSpace(0);

    doc.setFont('times', 'bold'); doc.setFontSize(8.5);
    doc.setTextColor(...INK);
    const titleLines = doc.splitTextToSize(aspectTitle, colW - 20);
    doc.text(titleLines[0] || aspectTitle, x + 10, y + 26);

    doc.setFont('times', 'normal'); doc.setFontSize(7.5);
    doc.setTextColor(...MUTED);
    const summaryLines = doc.splitTextToSize(event.summary, colW - 20);
    doc.text(summaryLines[0] || event.summary, x + 10, y + 37);
  }

  const usedRows = Math.ceil(visibleEvents.length / 2);
  ctx.y += usedRows * (cardH + rowGap);

  if (events.length > visibleEvents.length) {
    doc.setFont('times', 'italic'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text(`Showing ${visibleEvents.length} strongest activations in this one-page view.`, margin, ctx.y + 2);
    ctx.y += 12;
  }

  ctx.y += 4;
}
