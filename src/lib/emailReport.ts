/**
 * Short-and-sweet Cosmic Weather email.
 *
 * Structure (kept tight on purpose):
 *  1. Header with the exact moment used (local midnight of the chosen day)
 *  2. A clean "where the planets are" snapshot (one line per body, with glyphs,
 *     sign + degree, retrograde flag) — the email version of the calendar's
 *     front-page positions.
 *  3. 2 paragraphs of GENERAL weather (Sun/Moon, top tight aspects, retrogrades,
 *     plus one mention of any exact lunar phase or ingress that day).
 *  4. 2 paragraphs of PERSONAL weather IF a natal chart is provided — only the
 *     transits that actually perfect WITHIN THIS DAY (fast bodies: Moon, Sun,
 *     Mercury, Venus, Mars). Each one tells you the approximate exact hour and
 *     a one-line "how it feels" note.
 */

import {
  getPlanetaryPositions,
  getMoonPhase,
  getExactLunarPhase,
  isPlanetRetrograde,
  calculateDailyAspects,
  type PlanetaryPositions,
} from './astrology';
import * as Astronomy from 'astronomy-engine';
import { calculateTransitAspects, type TransitAspect } from './transitAspects';
import { getVOCMoonDetails } from './voidOfCourseMoon';
import { getHouseForLongitude, signDegreesToLongitude } from './houseCalculations';
import type { NatalChart } from '@/hooks/useNatalChart';

// ─── Constants ────────────────────────────────────────────────────────

const PLANET_GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
  NorthNode: '☊', Chiron: '⚷', Lilith: '⚸',
  Ascendant: 'AC', Midheaven: 'MC',
};

const ASPECT_GLYPH: Record<string, string> = {
  conjunction: '☌', opposition: '☍', trine: '△', square: '□',
  sextile: '⚹', quincunx: '⚻', semisextile: '⚺',
};

const FAST_BODIES = new Set(['Moon', 'Sun', 'Mercury', 'Venus', 'Mars']);

const PLANET_BODIES: Array<[string, Astronomy.Body]> = [
  ['Sun', Astronomy.Body.Sun], ['Moon', Astronomy.Body.Moon],
  ['Mercury', Astronomy.Body.Mercury], ['Venus', Astronomy.Body.Venus],
  ['Mars', Astronomy.Body.Mars], ['Jupiter', Astronomy.Body.Jupiter],
  ['Saturn', Astronomy.Body.Saturn], ['Uranus', Astronomy.Body.Uranus],
  ['Neptune', Astronomy.Body.Neptune], ['Pluto', Astronomy.Body.Pluto],
];

// ─── Formatters ───────────────────────────────────────────────────────

const fmtDate = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

const fmtTime = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

const fmtDegMin = (deg: number, min: number = 0) =>
  `${deg}°${String(Math.round(min)).padStart(2, '0')}'`;

function planetLine(name: string, p: any, retro: boolean): string {
  if (!p) return '';
  const pos = fmtDegMin(p.degree, p.minutes || 0);
  const glyph = PLANET_GLYPH[name] || '';
  const tag = retro ? '  ℞' : '';
  return `  ${glyph}  ${name.padEnd(8)} ${pos.padStart(7)}  ${p.signName}${tag}`;
}

// Concrete behavioral copy per transit→natal pair, modulated by aspect tone.
// Voice: tell the reader what they will FEEL or DO today. No jargon, no
// abstract verbs ("dissolves edges"), no astrology school terms.

type AspectTone = 'easy' | 'tense' | 'meeting';
function toneOf(aspect: string): AspectTone {
  if (aspect === 'trine' || aspect === 'sextile') return 'easy';
  if (aspect === 'square' || aspect === 'opposition' || aspect === 'quincunx') return 'tense';
  return 'meeting'; // conjunction & semisextile
}

// Plain-English meaning of each natal point (the "what part of you")
const NATAL_MEANING: Record<string, string> = {
  Sun: 'core identity, the "this is me" part',
  Moon: 'feelings, gut, what soothes you',
  Mercury: 'thinking and talking',
  Venus: 'love, money, taste, what you find pleasant',
  Mars: 'drive, anger, sex, what you go after',
  Jupiter: 'beliefs, hope, the part that wants more',
  Saturn: 'discipline, fear, the rules you live by',
  Uranus: 'where you break the mold',
  Neptune: 'dreams, imagination, what blurs',
  Pluto: 'power, control, what you obsess over',
  Ascendant: 'how you show up to people',
  Midheaven: 'career, public reputation',
  NorthNode: 'growth direction',
  SouthNode: 'old patterns you fall back on',
  Chiron: 'tender spot, the old wound',
};

// Plain-English meaning of each fast transit body (the "what gets activated")
const TRANSIT_FLAVOR: Record<string, { easy: string; tense: string; meeting: string }> = {
  Moon: {
    easy: 'a soft mood lands on',
    tense: 'a touchy mood scrapes against',
    meeting: 'today\'s mood lands right on',
  },
  Sun: {
    easy: 'today\'s spotlight warms up',
    tense: 'today\'s spotlight clashes with',
    meeting: 'today\'s spotlight sits on',
  },
  Mercury: {
    easy: 'a useful conversation or message moves through',
    tense: 'a misfired message or argument pokes at',
    meeting: 'a conversation or message lands directly on',
  },
  Venus: {
    easy: 'a sweet or pleasant moment touches',
    tense: 'a sticky relationship or money moment rubs',
    meeting: 'a love, money, or taste moment lands on',
  },
  Mars: {
    easy: 'a clean push of energy moves through',
    tense: 'a flash of anger, urgency or push lands on',
    meeting: 'a strong drive or impulse fires up',
  },
};

function pairCopy(transit: string, natal: string, aspect: string): string {
  const tone = toneOf(aspect);
  const meaning = NATAL_MEANING[natal] || `your natal ${natal}`;
  const flavor = TRANSIT_FLAVOR[transit];
  if (!flavor) return `${transit} contacts your natal ${natal} (${meaning}).`;
  const opener = flavor[tone];
  // Aspect-specific behavioral tail
  const tail = (() => {
    switch (aspect) {
      case 'conjunction': return `That part of you gets switched on, you'll notice it more than usual.`;
      case 'opposition': return `Expect a back-and-forth with someone (or with yourself) about it. Don't pick the fight, name what's actually being asked.`;
      case 'square': return `Use the friction. Do one concrete thing in that area instead of stewing.`;
      case 'trine': return `Door is open in that area. Start the thing, ask for the thing, send the thing.`;
      case 'sextile': return `Small opening, you have to lean in. It won't come find you.`;
      case 'quincunx': return `Something in that area needs a small adjustment, not a big move.`;
      case 'semisextile': return `Quiet background note in that area today.`;
      default: return '';
    }
  })();
  return `${opener} your ${meaning}. ${tail}`;
}

// ─── Station helpers ──────────────────────────────────────────────────

const STATION_MEANING: Record<string, { retrograde: string; direct: string }> = {
  Mercury: {
    retrograde: 'Communication, plans, and tech go under review for about 3 weeks. Re-read, re-check, expect delays.',
    direct: 'Communication and plans pick up speed again. Decisions and travel get traction.',
  },
  Venus: {
    retrograde: 'Love, money, values, and taste get a rewind. Old people and old wants resurface for a second look.',
    direct: 'Love, money, and values move forward again. You know what (and who) you actually want.',
  },
  Mars: {
    retrograde: 'Drive and action stall. Don\'t push, regroup, fix what\'s broken under the hood.',
    direct: 'Energy and drive come back online. You can push, fight, or start the thing.',
  },
  Jupiter: {
    retrograde: 'Growth pulls inward. Beliefs, big plans, and "more" get re-examined for a few months.',
    direct: 'The growth lane opens back up. Say yes, expand, take the bigger room.',
  },
  Saturn: {
    retrograde: 'Structure, responsibility, and the rules loosen so they can re-set. Audit the foundation.',
    direct: 'Structure and discipline solidify. Time to build and commit.',
  },
  Uranus: {
    retrograde: 'The disrupter quiets externally. Internal change picks up. You feel the itch before others see it.',
    direct: 'External shake-ups become more likely again. Surprises pick up speed.',
  },
  Neptune: {
    retrograde: 'Dreams, illusions, and spiritual fog reset. What\'s been hazy starts clarifying over the coming months.',
    direct: 'The dream world re-engages. Imagination, art, and intuition flow outward again.',
  },
  Pluto: {
    retrograde: 'Power and obsession themes turn inward. The deep work happens privately, not in public.',
    direct: 'Power dynamics surface again externally. What\'s been brewing underground starts moving.',
  },
};

// Find exact station moment by binary-searching velocity zero-crossing in ±3 days.
function findExactStationTime(body: Astronomy.Body, anchor: Date): Date | null {
  const span = 3 * 86400000; // ±3 days
  const stepMs = 6 * 3600000; // 6h
  const start = new Date(anchor.getTime() - span);
  const end = new Date(anchor.getTime() + span);

  const velocity = (t: Date): number => {
    const e0 = Astronomy.Ecliptic(Astronomy.GeoVector(body, t, false)).elon;
    const e1 = Astronomy.Ecliptic(Astronomy.GeoVector(body, new Date(t.getTime() + 3600000), false)).elon;
    let d = e1 - e0;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d; // °/hour
  };

  // Find sign-change in velocity
  let prev = start;
  let prevV = velocity(prev);
  for (let t = start.getTime() + stepMs; t <= end.getTime(); t += stepMs) {
    const cur = new Date(t);
    const curV = velocity(cur);
    if ((prevV > 0 && curV <= 0) || (prevV < 0 && curV >= 0)) {
      // Binary search
      let lo = prev.getTime(), hi = cur.getTime();
      while (hi - lo > 60000) {
        const mid = (lo + hi) / 2;
        const mV = velocity(new Date(mid));
        if ((prevV > 0 && mV > 0) || (prevV < 0 && mV < 0)) lo = mid; else hi = mid;
      }
      return new Date((lo + hi) / 2);
    }
    prev = cur;
    prevV = curV;
  }
  return null;
}

const HOUSE_THEME: Record<number, string> = {
  1: 'self, body, how you show up',
  2: 'money, possessions, self-worth',
  3: 'communication, siblings, daily errands',
  4: 'home, family, roots',
  5: 'creativity, romance, kids, play',
  6: 'daily work, health, routines',
  7: 'partnership, one-to-one relationships',
  8: 'shared resources, intimacy, depth',
  9: 'travel, beliefs, big-picture learning',
  10: 'career, public reputation',
  11: 'friends, groups, future hopes',
  12: 'inner life, retreat, the unseen',
};

const STATION_NATAL_POINTS = [
  'Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn',
  'Uranus','Neptune','Pluto','NorthNode','SouthNode','Chiron',
] as const;

const MAJOR_ASPECT_DEFS = [
  { name: 'conjunction', angle: 0, symbol: '☌' },
  { name: 'sextile', angle: 60, symbol: '⚹' },
  { name: 'square', angle: 90, symbol: '□' },
  { name: 'trine', angle: 120, symbol: '△' },
  { name: 'opposition', angle: 180, symbol: '☍' },
];

interface StationHit {
  natal: string;
  aspect: string;
  symbol: string;
  orb: number;
  natalSign: string;
  natalHouse: number | null;
}

function findStationHits(stationLon: number, chart: NatalChart): StationHit[] {
  const hits: StationHit[] = [];
  for (const point of STATION_NATAL_POINTS) {
    const p = chart.planets[point as keyof typeof chart.planets];
    if (!p?.sign) continue;
    const lon = signDegreesToLongitude(p.sign, p.degree, p.minutes || 0);
    let diff = Math.abs(stationLon - lon);
    if (diff > 180) diff = 360 - diff;
    for (const a of MAJOR_ASPECT_DEFS) {
      const orb = Math.abs(diff - a.angle);
      if (orb <= 3) {
        const natalHouse = chart.houseCusps ? getHouseForLongitude(lon, chart) : null;
        hits.push({ natal: point, aspect: a.name, symbol: a.symbol, orb: parseFloat(orb.toFixed(1)), natalSign: p.sign, natalHouse });
        break;
      }
    }
  }
  // Asc/MC from house cusps
  if (chart.houseCusps) {
    const angles: Array<[string, any]> = [
      ['Ascendant', chart.houseCusps.house1],
      ['Midheaven', chart.houseCusps.house10],
    ];
    for (const [name, cusp] of angles) {
      if (!cusp?.sign) continue;
      const lon = signDegreesToLongitude(cusp.sign, cusp.degree, cusp.minutes || 0);
      let diff = Math.abs(stationLon - lon);
      if (diff > 180) diff = 360 - diff;
      for (const a of MAJOR_ASPECT_DEFS) {
        const orb = Math.abs(diff - a.angle);
        if (orb <= 3) {
          hits.push({ natal: name, aspect: a.name, symbol: a.symbol, orb: parseFloat(orb.toFixed(1)), natalSign: cusp.sign, natalHouse: null });
          break;
        }
      }
    }
  }
  return hits.sort((a, b) => a.orb - b.orb);
}

const fmtStationDateTime = (d: Date) =>
  d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });

// ─── Public API ───────────────────────────────────────────────────────

export interface BuildReportOptions {
  date: Date;
  recipientName?: string;
  /** Optional natal chart — if provided, the personal section is included. */
  natalChart?: NatalChart | null;
}

export function buildCosmicWeatherEmail(opts: BuildReportOptions): { subject: string; body: string } {
  const { date, recipientName, natalChart } = opts;

  // Anchor: local midnight of the chosen day, plus the same-day end (for "perfects today" filter)
  const anchor = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const endOfDay = new Date(anchor.getTime() + 24 * 60 * 60 * 1000);
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const planets = getPlanetaryPositions(anchor);
  const moonPhase = getMoonPhase(anchor);
  const exactLunar = getExactLunarPhase(anchor);
  const aspects = calculateDailyAspects(planets);

  // Retrograde flags
  const retro: Record<string, boolean> = {};
  for (const [name, body] of PLANET_BODIES) {
    if (name === 'Sun' || name === 'Moon') continue;
    retro[name] = isPlanetRetrograde(body, anchor);
  }
  const retroNow = Object.entries(retro).filter(([, v]) => v).map(([k]) => k);

  // Top 3 tightest sky-to-sky aspects
  const topAspects = [...aspects]
    .filter(a => parseFloat(a.orb) <= 4)
    .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))
    .slice(0, 3);

  // ── Personal transits perfecting TODAY ──
  // Strict filters so we don't spam asteroid noise:
  //  - Transit body must be a fast personal body (Moon/Sun/Mercury/Venus/Mars)
  //  - Natal endpoint must be a personal point (planets, angles, nodes, Chiron)
  //  - Tight orb at moment of email: Moon ≤ 6°, Sun/Mercury/Venus/Mars ≤ 3°
  //    (Moon allowance is wider because Moon moves ~13°/day, so a 6° orb
  //     still means the aspect perfects within ~11 hours — same day.)
  //  - Must be applying AND perfect within 24h
  const NATAL_OK = new Set([
    'Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn',
    'Uranus','Neptune','Pluto','Ascendant','Midheaven','NorthNode','SouthNode','Chiron',
  ]);
  const orbCap = (transit: string) => transit === 'Moon' ? 6 : 3;
  let perfectingToday: TransitAspect[] = [];
  if (natalChart) {
    const all = calculateTransitAspects(anchor, planets, natalChart);
    perfectingToday = all.filter(a => {
      if (!FAST_BODIES.has(a.transitPlanet)) return false;
      if (!NATAL_OK.has(a.natalPlanet)) return false;
      if (parseFloat(a.orb) > orbCap(a.transitPlanet)) return false;
      if (!a.applying) return false;
      return a.daysToExact >= 0 && a.daysToExact < 1;
    }).sort((a, b) => a.daysToExact - b.daysToExact).slice(0, 5);
  }

  // ─── BUILD BODY ───────────────────────────────────────────────────
  const lines: string[] = [];

  lines.push(`COSMIC WEATHER: ${fmtDate(anchor)}`);
  lines.push('═'.repeat(60));
  if (recipientName) {
    lines.push('');
    lines.push(`Hi ${recipientName},`);
  }
  lines.push('');
  lines.push(`(All positions calculated for local midnight: ${fmtTime(anchor)} on ${fmtDate(anchor)}, timezone ${tzName}.)`);
  lines.push('');

  // ── 1. WHERE THE PLANETS ARE (snapshot) ──
  lines.push('WHERE THE PLANETS ARE');
  lines.push('─'.repeat(60));
  for (const [name] of PLANET_BODIES) {
    const key = name.toLowerCase() as keyof PlanetaryPositions;
    lines.push(planetLine(name, (planets as any)[key], retro[name] || false));
  }
  // Points
  if ((planets as any).northNode) lines.push(planetLine('NorthNode', (planets as any).northNode, false));
  if ((planets as any).chiron) lines.push(planetLine('Chiron', (planets as any).chiron, false));
  lines.push('');
  lines.push(`  Moon phase: ${moonPhase.phaseName} (${(moonPhase.illumination * 100).toFixed(0)}% lit)`);
  if (exactLunar) {
    lines.push(`  ✦ EXACT ${exactLunar.type} today at ${fmtTime(exactLunar.time)} (${exactLunar.position})`);
  }
  lines.push('');

  // ── 1b. TODAY'S HEADLINES (sky news worth knowing first) ──
  const headlines: string[] = [];

  // Stations: any planet within ~0.05°/day of zero motion is stationing
  for (const [name, body] of PLANET_BODIES) {
    if (name === 'Sun' || name === 'Moon') continue;
    try {
      const ecl0 = Astronomy.Ecliptic(Astronomy.GeoVector(body, anchor, false)).elon;
      const ecl1 = Astronomy.Ecliptic(Astronomy.GeoVector(body, new Date(anchor.getTime() + 86400000), false)).elon;
      let delta = ecl1 - ecl0;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      if (Math.abs(delta) < 0.05) {
        const p = (planets as any)[name.toLowerCase()];
        const dir = retro[name] ? 'direct' : 'retrograde';
        const pos = p ? `${p.degree}° ${p.signName}` : '';
        const glyph = PLANET_GLYPH[name] || '';

        // Exact station moment + meaning
        const exact = findExactStationTime(body, anchor);
        const exactStr = exact ? ` Exact ${fmtStationDateTime(exact)}.` : '';
        const meaningPair = STATION_MEANING[name];
        const meaning = meaningPair ? (dir === 'retrograde' ? meaningPair.retrograde : meaningPair.direct) : '';

        const block: string[] = [];
        block.push(`✦ ${glyph} ${name} stations ${dir} at ${pos}.${exactStr}`);
        if (meaning) block.push(`   What it means: ${meaning}`);

        // Personalize if natal chart available
        if (natalChart && p) {
          const stationLon = signDegreesToLongitude(p.signName, p.degree, p.minutes || 0);
          const house = natalChart.houseCusps ? getHouseForLongitude(stationLon, natalChart) : null;
          if (house) {
            block.push(`   For you: ${pos} is in your ${house}${ordSuffix(house)} house (${HOUSE_THEME[house]}).`);
          }
          const hits = findStationHits(stationLon, natalChart);
          if (hits.length) {
            const hitStr = hits.slice(0, 3).map(h => {
              const where = h.natalHouse ? `${h.natalSign} (${h.natalHouse}${ordSuffix(h.natalHouse)} house)` : h.natalSign;
              return `${h.aspect} your ${h.natal} in ${where}, orb ${h.orb}°`;
            }).join('; ');
            block.push(`   Hits in your chart: ${hitStr}.`);
          } else if (natalChart.houseCusps) {
            block.push(`   Hits in your chart: nothing tight, the house placement is the main story.`);
          }
        }
        headlines.push(block.join('\n'));
      }
    } catch {}
  }

  // Void of course Moon today
  const voc = getVOCMoonDetails(anchor);
  if (voc.isVOC && voc.start && voc.end) {
    const startStr = voc.start.getTime() < anchor.getTime() ? 'all day' : `from ${fmtTime(voc.start)}`;
    const endStr = voc.end.getTime() > endOfDay.getTime() ? `into tomorrow` : `until ${fmtTime(voc.end)}`;
    const lastAsp = voc.lastAspect
      ? `, after its last aspect (☽ ${voc.lastAspect.symbol} ${PLANET_GLYPH[voc.lastAspect.planet] || voc.lastAspect.planet} at ${fmtTime(voc.lastAspect.time)})`
      : ` (no major aspect made in this sign)`;
    headlines.push(`✦ ☽ Moon is void of course ${startStr} ${endStr}${lastAsp}. Make a list, handle small things, don't start anything new.`);
  }

  // Exact lunar phase today
  if (exactLunar) {
    headlines.push(`✦ ${exactLunar.type} exact at ${fmtTime(exactLunar.time)} (${exactLunar.position}).`);
  }

  if (headlines.length) {
    lines.push("TODAY'S HEADLINES");
    lines.push('─'.repeat(60));
    headlines.forEach(h => { lines.push(h); lines.push(''); });
  }

  // ── 2. GENERAL WEATHER (2 paragraphs) ──
  lines.push('GENERAL WEATHER');
  lines.push('─'.repeat(60));

  // Paragraph 1: the mood — season + Moon sign combo (Tara's signature)
  const sunSign = (planets.sun as any).signName;
  const moonSign = (planets.moon as any).signName;
  const sunPos = `${(planets.sun as any).degree}° ${sunSign}`;
  const moonPos = `${(planets.moon as any).degree}° ${moonSign}`;
  const para1: string[] = [];
  para1.push(
    `It's ${sunSign} season and we have a ${moonSign} Moon. Sun ${sunPos}, Moon ${moonPos} (${moonPhase.phaseName}). ` +
    `The feel-good medicine of the day is doing ${moonSign} things: ${signFlavor(moonSign)}. ` +
    `Look at where ${moonSign} falls in your natal chart — that area of life will feel good to act on today.`
  );
  if (exactLunar) {
    para1.push(`The ${exactLunar.type} perfects at ${fmtTime(exactLunar.time)}, so the energy peaks around then.`);
  }
  lines.push(para1.join(' '));
  lines.push('');

  // Paragraph 2: notable aspects + retrogrades
  const para2: string[] = [];
  if (topAspects.length) {
    const list = topAspects.map(a => {
      const p1 = a.planet1.charAt(0).toUpperCase() + a.planet1.slice(1);
      const p2 = a.planet2.charAt(0).toUpperCase() + a.planet2.slice(1);
      return `${p1} ${a.symbol} ${p2} (${a.orb}°)`;
    }).join(', ');
    para2.push(`The tightest sky-to-sky aspects are: ${list}.`);
    para2.push(`${aspectFlavor(topAspects[0].type)}`);
  } else {
    para2.push(`No tight aspects in the sky today, things are quiet at the macro level.`);
  }
  if (retroNow.length) {
    para2.push(`Currently retrograde: ${retroNow.join(', ')} (slow down, revisit, review in those areas).`);
  } else {
    para2.push(`All planets are direct, the river is flowing forward.`);
  }
  lines.push(para2.join(' '));
  lines.push('');

  // ── 3. YOUR DAY (2 paragraphs) ──
  if (natalChart) {
    lines.push(`YOUR DAY${recipientName ? `: ${recipientName}` : ''}`);
    lines.push('─'.repeat(60));

    if (perfectingToday.length === 0) {
      lines.push(
        `No fast transits perfect on your chart today. The general weather above is what you'll mostly feel. ` +
        `Background slow transits (if any) are still in play but they're slow burn, not "today" stories.`
      );
      lines.push('');
      lines.push(
        `Use the day for whatever the general mood supports. Without a sharp transit hitting one of your natal points, you're driving, not being driven.`
      );
    } else {
      const items = perfectingToday.map(a => {
        const exactTime = new Date(anchor.getTime() + a.daysToExact * 24 * 60 * 60 * 1000);
        const tg = PLANET_GLYPH[a.transitPlanet] || '';
        const ng = PLANET_GLYPH[a.natalPlanet] || '';
        const ag = ASPECT_GLYPH[a.aspect] || '';
        return `• ${fmtTime(exactTime)}  ${tg} t-${a.transitPlanet} ${ag} ${ng} natal ${a.natalPlanet} (${a.aspect}, orb ${a.orb}°)\n    ${pairCopy(a.transitPlanet, a.natalPlanet, a.aspect)}`;
      });
      lines.push(`Your transits today:`);
      lines.push('');
      lines.push(items.join('\n'));
      lines.push('');
      const headliner = perfectingToday[0];
      const exactTimeStr = fmtTime(new Date(anchor.getTime() + headliner.daysToExact * 24 * 60 * 60 * 1000));
      lines.push(
        `Headline: around ${exactTimeStr}, transiting ${headliner.transitPlanet} ${headliner.aspect}s your natal ${headliner.natalPlanet}. ` +
        `${pairCopy(headliner.transitPlanet, headliner.natalPlanet, headliner.aspect)} ` +
        `Aim the day's most loaded conversation, decision, or first move at that window.`
      );
    }
    lines.push('');
  }

  const subject = `Cosmic Weather: ${fmtDate(anchor)}`;
  return { subject, body: lines.join('\n') };
}

// ─── Tiny flavor helpers (kept short, felt-sense) ─────────────────────

function signFlavor(sign: string): string {
  const map: Record<string, string> = {
    Aries: 'restless, want-to-start, short-fuse energy',
    Taurus: 'slow, sensory, comfort-seeking energy',
    Gemini: 'curious, scattered, conversation-hungry energy',
    Cancer: 'tender, home-pulled, mood-driven energy',
    Leo: 'warm, expressive, want-to-be-seen energy',
    Virgo: 'tidy, problem-solving, fix-it energy',
    Libra: 'relational, fair-minded, smooth-it-over energy',
    Scorpio: 'intense, private, get-to-the-bottom-of-it energy',
    Sagittarius: 'big-picture, restless, get-out-of-here energy',
    Capricorn: 'serious, productive, climb-the-ladder energy',
    Aquarius: 'detached, future-facing, do-it-differently energy',
    Pisces: 'dreamy, porous, easily-moved energy',
  };
  return map[sign] || 'a steady, ordinary mood';
}

function aspectFlavor(type: string): string {
  const map: Record<string, string> = {
    conjunction: 'That conjunction is the loudest signal in the day, expect it to color most things.',
    opposition: 'That opposition asks you to balance two things instead of pick one.',
    square: 'That square is friction that wants action, do something with it.',
    trine: 'That trine is an open door, walk through it.',
    sextile: 'That sextile is a small offer, you have to lean toward it.',
    quincunx: 'That quincunx is awkward, plan for one small adjustment.',
  };
  return map[type] || '';
}

// ─── Recipients (saved to localStorage) ───────────────────────────────

export interface EmailRecipient {
  name: string;
  email: string;
}

const RECIPIENTS_KEY = 'cosmic-weather-email-recipients';

export function loadRecipients(): EmailRecipient[] {
  try {
    const raw = localStorage.getItem(RECIPIENTS_KEY);
    return raw ? (JSON.parse(raw) as EmailRecipient[]) : [];
  } catch {
    return [];
  }
}

export function saveRecipient(r: EmailRecipient): EmailRecipient[] {
  const list = loadRecipients();
  const existing = list.findIndex(x => x.email.toLowerCase() === r.email.toLowerCase());
  if (existing >= 0) list[existing] = r;
  else list.push(r);
  localStorage.setItem(RECIPIENTS_KEY, JSON.stringify(list));
  return list;
}

export function deleteRecipient(email: string): EmailRecipient[] {
  const list = loadRecipients().filter(r => r.email.toLowerCase() !== email.toLowerCase());
  localStorage.setItem(RECIPIENTS_KEY, JSON.stringify(list));
  return list;
}
