import jsPDF from 'jspdf';
import * as Astronomy from 'astronomy-engine';
import { PDFContext } from './pdfContext';
import { NatalChart } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { signDegreesToLongitude } from '@/lib/houseCalculations';
import { angularSeparation, getPlanetLongitudeExact } from '@/lib/transitMath';
import { P } from '@/components/SolarReturnPDFExport';

/**
 * Key Dates: When the Time Lord (Saturn or other) makes exact aspects to natal planets
 * during the Solar Return year. Calculates real ephemeris-based dates.
 */

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const PLANET_BODIES: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

const ASPECTS = [
  { name: 'Conjunction', angle: 0, orb: 3, symbol: '☌', nature: 'fusion' },
  { name: 'Opposition', angle: 180, orb: 3, symbol: '☍', nature: 'tension' },
  { name: 'Trine', angle: 120, orb: 2.5, symbol: '△', nature: 'flow' },
  { name: 'Square', angle: 90, orb: 3, symbol: '□', nature: 'challenge' },
  { name: 'Sextile', angle: 60, orb: 2, symbol: '⚹', nature: 'opportunity' },
] as const;

const NATAL_TARGETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Ascendant'];

interface TimeLordDate {
  date: Date;
  natalPlanet: string;
  aspectName: string;
  aspectSymbol: string;
  nature: string;
  orb: number;
  transitSign: string;
  transitDegree: number;
  interpretation: string;
}

const lonToSign = (lon: number): { sign: string; degree: number } => {
  const n = ((lon % 360) + 360) % 360;
  return { sign: ZODIAC_SIGNS[Math.floor(n / 30)], degree: Math.floor(n % 30) };
};

/** Saturn-specific transit interpretations by natal planet */
const saturnTransitInterps: Record<string, Record<string, string>> = {
  Sun: {
    Conjunction: 'Identity restructuring. You feel the full weight of Saturn on your sense of self — who you are is being tested and rebuilt. Authority figures demand accountability. Health and vitality require attention. The gift: genuine self-authority earned through real effort.',
    Opposition: 'Others hold the mirror. Relationships with authority figures, bosses, or partners force you to define who you are vs. who they need you to be. External pressures reveal internal strength or weakness.',
    Square: 'Friction between what you want and what reality allows. Ego meets limitation. Progress feels blocked but the obstacles are showing you where your foundation is weak. Strengthen it.',
    Trine: 'Disciplined effort pays off naturally. Authority figures support you. Career and personal identity align. This is when Saturn rewards the work you have already done.',
    Sextile: 'Opportunities through structure and patience. A mentor or system appears that helps you organize your ambitions. Take the practical path — it leads somewhere real.',
  },
  Moon: {
    Conjunction: 'Emotional heaviness. Saturn sits on your emotional body — feelings are muted, serious, or delayed. You may feel isolated or emotionally self-reliant. Family obligations weigh. The growth: emotional maturity and the ability to self-soothe.',
    Opposition: 'Tension between emotional needs and responsibilities. You cannot have both comfort and achievement without conscious negotiation. Home vs. career. Safety vs. ambition.',
    Square: 'Emotional frustration. What you need and what you get are mismatched. Mood may be heavy. Relationships with women or mother figures may feel strained. The lesson: you are responsible for your own emotional wellbeing.',
    Trine: 'Emotional stability earned through maturity. Family relationships feel solid. Your ability to handle difficult feelings is at its best. Practical domestic decisions work out.',
    Sextile: 'A quiet opportunity to build emotional security. Therapy, journaling, or structured self-care produces lasting results. Someone older may offer genuine emotional wisdom.',
  },
  Mercury: {
    Conjunction: 'Thinking becomes serious and focused. Mental discipline is sharp but communication may feel heavy or slow. Contracts, legal matters, and important decisions demand careful attention. Good for structured learning.',
    Opposition: 'Others challenge your ideas. Negotiations require patience. What you think you know is being tested against reality. Listen more than you speak.',
    Square: 'Mental stress. Too many obligations compete for attention. Miscommunication under pressure. Documents and contracts require triple-checking. The growth: learning to say no.',
    Trine: 'Clear, structured thinking. Writing, planning, and strategic communication flow easily. Good for signing contracts, making plans, and having productive serious conversations.',
    Sextile: 'An opportunity to learn something that has lasting value. A course, mentor, or book arrives at the right time. Practical knowledge over theory.',
  },
  Venus: {
    Conjunction: 'Love gets real. Relationships are tested for substance — surface attraction is not enough. Financial caution is wise. You may feel less playful but more discerning about what (and who) you actually value.',
    Opposition: 'Relationship tension around commitment, money, or values. What you want vs. what you can realistically have. A partnership may feel restrictive or may solidify into something permanent.',
    Square: 'Love and money under pressure. Relationships feel like work. Financial limitations force hard choices. The lesson: real love survives difficulty; infatuation does not.',
    Trine: 'Committed love deepens naturally. Financial stability through practical decisions. Art or creative projects benefit from discipline and structure. Relationships with age differences may thrive.',
    Sextile: 'An opportunity to solidify a relationship or financial plan. A practical romantic gesture means more than grand displays. Build value slowly.',
  },
  Mars: {
    Conjunction: 'Controlled power. Your drive is focused and relentless but may feel frustrated by restrictions. Physical discipline (exercise, martial arts, intense work) channels the energy productively. Anger surfaces where boundaries have been crossed.',
    Opposition: 'Conflict with authority. Someone pushes your limits. The test: can you assert yourself without aggression? Power struggles are likely but also illuminating.',
    Square: 'Frustration and blocked action. What you want to DO meets what you are ALLOWED to do. Patience is required but feels impossible. Channel anger into productive physical or professional outlets.',
    Trine: 'Disciplined action produces tangible results. Physical endurance is strong. Professional assertiveness is well-received. The military principle: controlled, strategic force wins.',
    Sextile: 'An opportunity to take structured action. A project that requires sustained effort and physical energy comes together. Good for starting a disciplined fitness routine.',
  },
  Jupiter: {
    Conjunction: 'Expansion meets contraction. Big plans require real structure to succeed. The tension: wanting MORE while reality insists on LESS. The gift: sustainable growth rather than overextension.',
    Opposition: 'Optimism vs. realism. Faith is tested by facts. Financial expansion needs grounding. The lesson: believe in what you can actually build, not just what you can imagine.',
    Square: 'Growth pains. Ambitions bump against limitations. Legal, educational, or philosophical pursuits require more effort than expected. The answer: persistence, not volume.',
    Trine: 'Wise expansion. Growth that is both ambitious and realistic. Professional, educational, or financial progress built on solid ground. The rare combination of luck and discipline.',
    Sextile: 'A practical opportunity for growth. An institution, mentor, or system helps you expand responsibly. Say yes to structured opportunity.',
  },
  Saturn: {
    Conjunction: 'Saturn Return energy activated. The structures of your life are being audited. What is real and functional survives. What is held together by habit, fear, or inertia does not. This is rebuilding from foundation up.',
    Opposition: 'The halfway point of a Saturn cycle. What you built at the last conjunction is being tested from the outside. Relationships, career, and commitments reveal whether they are strong enough to continue.',
    Square: 'Saturn squaring itself brings a crisis of structure. Something you built needs modification. The choice: adapt and strengthen, or let it crumble. Neither path is easy but one leads forward.',
    Trine: 'Structural harmony. What you have been building is working. Routines, career, and long-term plans feel aligned. The payoff for patience and discipline.',
    Sextile: 'A quiet opportunity to refine your structures. Small adjustments to routines, career plans, or long-term goals yield lasting improvement.',
  },
  Ascendant: {
    Conjunction: 'Saturn crosses your Ascendant — you appear more serious, authoritative, and mature to others. Physical aging may be noticeable. New responsibilities shape your identity. This is a defining year.',
    Opposition: 'Saturn on the Descendant — partnerships are the testing ground. Commitments are demanded or dissolved. Others hold you accountable. The question: are your closest relationships built on reality?',
    Square: 'Identity under pressure from both internal and external demands. How you present yourself clashes with what life requires. Adjust your self-image to match who you are actually becoming.',
    Trine: 'Your public presence and personal authority feel natural and earned. Others respect you without being asked. Professional and personal identity align.',
    Sextile: 'An opportunity to present yourself with more authority and maturity. A role or title that fits who you are becoming. Step into it.',
  },
};

/** Generic Time Lord transit interpretations for non-Saturn planets */
function getGenericTimeLordInterp(timeLord: string, natalPlanet: string, aspect: string): string {
  const lordName = P[timeLord] || timeLord;
  const natalName = P[natalPlanet] || natalPlanet;
  const flowAspects = ['Trine', 'Sextile'];
  const hardAspects = ['Square', 'Opposition'];
  
  if (aspect === 'Conjunction') {
    return `${lordName} merges with your natal ${natalName} — the Time Lord's agenda directly activates ${natalName}'s themes in your life. This is a peak activation point where the year's dominant story intensifies through ${natalName}'s domain.`;
  } else if (flowAspects.includes(aspect)) {
    return `${lordName} supports your natal ${natalName} — the Time Lord's themes flow easily through ${natalName}'s area of your life. Progress comes naturally in this domain during this period.`;
  } else if (hardAspects.includes(aspect)) {
    return `${lordName} creates tension with your natal ${natalName} — the Time Lord's demands clash with ${natalName}'s comfort zone. Growth happens through friction. The discomfort is productive if you don't resist the lesson.`;
  }
  return `${lordName} activates your natal ${natalName} — watch for this domain to become unusually prominent during this period.`;
}

export function generateKeyDatesSection(
  ctx: PDFContext, doc: jsPDF,
  timeLord: string,
  natalChart: NatalChart,
  srChart: SolarReturnChart,
) {
  const { colors, margin, contentW, pw } = ctx;
  const body = PLANET_BODIES[timeLord];
  if (!body) return;

  // Calculate the SR year window (birthday to birthday)
  const srYear = srChart.solarReturnYear;
  // Use a full calendar year approximation: March of srYear to March of srYear+1
  const startDate = new Date(srYear, 2, 1); // Start scanning from March
  const endDate = new Date(srYear + 1, 3, 1); // Through March next year

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

  // Scan for aspects: sample every 3 days (Saturn moves ~0.03°/day)
  const events: TimeLordDate[] = [];
  const foundKeys = new Set<string>();

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 3)) {
    const date = new Date(d);
    let tlLon: number;
    try {
      tlLon = getPlanetLongitudeExact(body, date);
    } catch { continue; }

    for (const [natalPlanet, natalLon] of Object.entries(natalLons)) {
      if (natalPlanet === timeLord) continue; // Skip self (handled separately as Saturn-Saturn)
      
      for (const asp of ASPECTS) {
        const orb = Math.abs(angularSeparation(tlLon, natalLon) - asp.angle);
        if (orb <= asp.orb) {
          const key = `${natalPlanet}-${asp.name}`;
          if (foundKeys.has(key)) continue;

          // Refine to exact date
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

          const tlSign = lonToSign(getPlanetLongitudeExact(body, bestDate));
          
          // Get interpretation
          let interp = '';
          if (timeLord === 'Saturn' && saturnTransitInterps[natalPlanet]?.[asp.name]) {
            interp = saturnTransitInterps[natalPlanet][asp.name];
          } else {
            interp = getGenericTimeLordInterp(timeLord, natalPlanet, asp.name);
          }

          events.push({
            date: bestDate,
            natalPlanet,
            aspectName: asp.name,
            aspectSymbol: asp.symbol,
            nature: asp.nature,
            orb: Math.round(bestOrb * 10) / 10,
            transitSign: tlSign.sign,
            transitDegree: tlSign.degree,
            interpretation: interp,
          });
          foundKeys.add(key);
        }
      }
    }
  }

  // Sort by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());

  if (events.length === 0) return;

  // Render the section
  const tlName = P[timeLord] || timeLord;
  doc.addPage(); ctx.y = margin; ctx.pageBg(doc);
  ctx.sectionPages.set('KEY DATES', doc.getNumberOfPages());
  ctx.sectionTitle(doc, `KEY DATES — WHEN ${tlName.toUpperCase()} ACTIVATES YOUR CHART`,
    `Exact and near-exact aspects from transiting ${tlName} to your natal planets during the SR year`);

  // Intro card
  ctx.drawCard(doc, () => {
    ctx.writeBold(doc, 'Why These Dates Matter');
    ctx.y += 4;
    ctx.writeBody(doc, `As your Time Lord, ${tlName} is the planet running the show this year. Every time transiting ${tlName} makes an exact aspect to one of your natal planets, the Time Lord's agenda ACTIVATES that area of your life. These are the dates when the year's themes become tangible -- when you feel the pressure, the opportunity, or the shift. Mark them.`);
  });

  // Month grouping for visual clarity
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  for (const event of events) {
    const monthName = months[event.date.getMonth()];
    const dayNum = event.date.getDate();
    const yearNum = event.date.getFullYear();
    const isHard = ['challenge', 'tension'].includes(event.nature);
    const isFlow = ['flow', 'opportunity'].includes(event.nature);
    const accentColor: [number, number, number] = isHard ? [180, 100, 60] : isFlow ? colors.accentGreen : colors.gold;
    const bgColor: [number, number, number] = isHard ? [255, 245, 240] : isFlow ? [240, 252, 245] : colors.softGold;

      ctx.checkPage(180);
      ctx.drawCard(doc, () => {
        // Date + aspect header bar — ensure it stays within card bounds
        const cardInner = contentW - 24; // safe inner width
        doc.setFillColor(...bgColor);
        doc.roundedRect(margin + 8, ctx.y - 4, cardInner, 34, 4, 4, 'F');
        
        // Date on left
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
        doc.setTextColor(...accentColor);
        doc.text(`${monthName} ${dayNum}, ${yearNum}`, margin + 16, ctx.y + 10);
        
        // Aspect name below date
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5);
        doc.setTextColor(...colors.deepBrown);
        const natalName = P[event.natalPlanet] || event.natalPlanet;
        const aspectTitle = `${tlName} ${event.aspectName} Natal ${natalName}`;
        doc.text(aspectTitle, margin + 16, ctx.y + 24);
        
        // Nature badge — plain text, no Unicode
        const natureBadge = isHard ? 'PRESSURE POINT' : isFlow ? 'GREEN LIGHT' : event.nature.toUpperCase();
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7);
        doc.setTextColor(...accentColor);
        const badgeX = margin + cardInner - 8;
        doc.text(natureBadge, badgeX, ctx.y + 10, { align: 'right' });
        
        // Orb + sign info
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5);
        doc.setTextColor(...colors.dimText);
        doc.text(`${event.orb}' orb  |  ${event.transitSign} ${event.transitDegree}'`, badgeX, ctx.y + 22, { align: 'right' });
        
        ctx.y += 40;

        // Interpretation — properly wrapped
        ctx.writeBody(doc, event.interpretation, colors.bodyText, 9, 13);
      }, accentColor);
  }
}
