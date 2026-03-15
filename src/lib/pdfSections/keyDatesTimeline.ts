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
  doc.addPage(); ctx.y = margin;
  doc.setFillColor(...WHITE);
  doc.rect(0, 0, pw, ph, 'F');
  ctx.sectionPages.set('KEY DATES', doc.getNumberOfPages());

  // Section header
  ctx.y += 24;
  doc.setFont('times', 'bold'); doc.setFontSize(7);
  doc.setTextColor(...GOLD);
  doc.setCharSpace(4);
  doc.text(`KEY DATES -- ${tlName.toUpperCase()}`, margin, ctx.y);
  doc.setCharSpace(0);
  ctx.y += 8;

  doc.setDrawColor(...RULE); doc.setLineWidth(0.25);
  doc.line(margin, ctx.y, pw - margin, ctx.y);
  ctx.y += 28;

  doc.setFont('times', 'normal'); doc.setFontSize(28);
  doc.setTextColor(...INK);
  doc.text('When Your Year Activates', margin, ctx.y);
  ctx.y += 14;

  doc.setFont('times', 'italic'); doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Transiting ${tlName} to your natal planets`, margin, ctx.y);
  ctx.y += 40;

  // Vertical timeline
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const timelineX = margin + 60; // Vertical line X position
  const eventW = contentW - 80;
  const eventH = 44;
  const eventGap = 8;

  for (const event of events) {
    // Check page
    if (ctx.y + eventH + eventGap > ph - 60) {
      doc.addPage();
      doc.setFillColor(...WHITE);
      doc.rect(0, 0, pw, ph, 'F');
      ctx.y = margin + 20;
      // Continuation label
      doc.setFont('times', 'bold'); doc.setFontSize(7);
      doc.setTextColor(...GOLD);
      doc.setCharSpace(3);
      doc.text('KEY DATES (CONTINUED)', margin, ctx.y);
      doc.setCharSpace(0);
      ctx.y += 16;
    }

    const nature = NATURE_COLORS[event.nature] || NATURE_COLORS.fusion;
    const dateStr = `${months[event.date.getMonth()]} ${event.date.getDate()}`;
    const natalName = P[event.natalPlanet] || event.natalPlanet;
    const aspectTitle = `${tlName} ${event.aspectName} ${natalName}`;

    // Date label (left of timeline)
    doc.setFont('times', 'bold'); doc.setFontSize(10);
    doc.setTextColor(...INK);
    doc.text(dateStr, timelineX - 14, ctx.y + 14, { align: 'right' });

    // Vertical line segment
    doc.setDrawColor(...RULE); doc.setLineWidth(0.5);
    doc.line(timelineX, ctx.y, timelineX, ctx.y + eventH);

    // Gold dot
    doc.setFillColor(...GOLD);
    doc.circle(timelineX, ctx.y + 14, 4, 'F');

    // Event card (right of timeline)
    const cardX = timelineX + 14;
    const cardInnerW = eventW - 20; // Ensure content stays inside card
    doc.setFillColor(...nature.bg);
    doc.roundedRect(cardX, ctx.y, eventW, eventH, 3, 3, 'F');
    doc.setDrawColor(...RULE); doc.setLineWidth(0.2);
    doc.roundedRect(cardX, ctx.y, eventW, eventH, 3, 3, 'S');

    // Nature badge (right side) — draw FIRST to know how much space to reserve
    const badgeW = doc.getTextWidth(nature.label) + 10;
    doc.setFont('times', 'bold'); doc.setFontSize(6);
    doc.setTextColor(...nature.text);
    doc.setCharSpace(1.5);
    doc.text(nature.label, cardX + eventW - 10, ctx.y + 16, { align: 'right' });
    doc.setCharSpace(0);

    // Aspect title — constrained to not overlap badge
    doc.setFont('times', 'bold'); doc.setFontSize(9);
    doc.setTextColor(...INK);
    const titleMaxW = cardInnerW - badgeW - 10;
    const titleLines = doc.splitTextToSize(aspectTitle, titleMaxW);
    doc.text(titleLines[0] || aspectTitle, cardX + 10, ctx.y + 16);

    // 5-word summary
    doc.setFont('times', 'normal'); doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    const summaryLines = doc.splitTextToSize(event.summary, cardInnerW);
    doc.text(summaryLines[0] || event.summary, cardX + 10, ctx.y + 30);

    ctx.y += eventH + eventGap;
  }

  ctx.y += 10;
}
