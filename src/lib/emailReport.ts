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

function ordSuffix(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return 'th';
  switch (n % 10) { case 1: return 'st'; case 2: return 'nd'; case 3: return 'rd'; default: return 'th'; }
}

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

  // (personal transits computed below in DATA PREP)

  // ─── DATA PREP ────────────────────────────────────────────────────

  // Stations today (any planet whose daily motion is < 0.05°/day)
  interface StationData {
    name: string;
    direction: 'retrograde' | 'direct';
    pos: string;            // "3° Aries"
    sign: string;
    degree: number;
    longitude: number;
    exact: Date | null;
    meaning: string;
    natalHouse: number | null;
    hits: StationHit[];
  }
  const stations: StationData[] = [];
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
        if (!p) continue;
        const direction: 'retrograde' | 'direct' = retro[name] ? 'direct' : 'retrograde';
        const lon = signDegreesToLongitude(p.signName, p.degree, p.minutes || 0);
        const meaningPair = STATION_MEANING[name];
        const meaning = meaningPair ? meaningPair[direction] : '';
        const natalHouse = natalChart?.houseCusps ? getHouseForLongitude(lon, natalChart) : null;
        const hits = natalChart ? findStationHits(lon, natalChart) : [];
        stations.push({
          name, direction,
          pos: `${p.degree}° ${p.signName}`,
          sign: p.signName, degree: p.degree, longitude: lon,
          exact: findExactStationTime(body, anchor),
          meaning, natalHouse, hits,
        });
      }
    } catch {}
  }

  // VOC Moon today
  const voc = getVOCMoonDetails(anchor);

  // Personal transits perfecting today, STRICT under 2° orb
  const NATAL_OK = new Set([
    'Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn',
    'Uranus','Neptune','Pluto','Ascendant','Midheaven','NorthNode','SouthNode','Chiron',
  ]);
  let personalTransits: TransitAspect[] = [];
  if (natalChart) {
    const all = calculateTransitAspects(anchor, planets, natalChart);
    personalTransits = all
      .filter(a => NATAL_OK.has(a.natalPlanet) && parseFloat(a.orb) < 2)
      .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))
      .slice(0, 5);
  }

  // ─── BUILD BODY ───────────────────────────────────────────────────
  const lines: string[] = [];

  const sunSign = (planets.sun as any).signName;
  const moonSign = (planets.moon as any).signName;
  const sunPos = `${(planets.sun as any).degree}° ${sunSign}`;
  const moonPos = `${(planets.moon as any).degree}° ${moonSign}`;

  if (recipientName) {
    lines.push(`Hi ${recipientName},`);
    lines.push('');
  }

  // ── SECTION 1: THE SKY TODAY ──────────────────────────────────────
  lines.push('THE SKY TODAY');
  lines.push('─'.repeat(50));

  const sky: string[] = [];

  // Moon line
  let moonLine = `Moon is in ${moonSign} (${moonPhase.phaseName}, ${moonPos}). ${signCollective(moonSign)}.`;
  if (voc.isVOC && voc.start && voc.end) {
    const startH = voc.start.getHours();
    if (startH >= 6 && startH < 24) {
      const lastA = voc.lastAspect ? ` after Moon ${voc.lastAspect.aspectName} ${voc.lastAspect.planet}` : '';
      moonLine += ` Void of course from ${fmtTime(voc.start)} to ${fmtTime(voc.end)}${lastA}, drifting time.`;
    }
  }
  sky.push(moonLine);

  // Stations
  for (const s of stations) {
    const exactStr = s.exact ? ` Exact ${fmtStationDateTime(s.exact)}.` : '';
    sky.push(`${s.name} stations ${s.direction} at ${s.pos}.${exactStr} ${s.meaning}`);
  }

  // Tightest sky-to-sky aspects under 2°
  const tight = [...aspects]
    .filter(a => parseFloat(a.orb) < 2)
    .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))
    .slice(0, 3);
  if (tight.length) {
    const tightStrs = tight.map(a => {
      const p1 = cap(a.planet1);
      const p2 = cap(a.planet2);
      const s1 = (planets as any)[a.planet1.toLowerCase()]?.signName || '';
      const s2 = (planets as any)[a.planet2.toLowerCase()]?.signName || '';
      return `${p1} in ${s1} ${a.type} ${p2} in ${s2} (${a.orb}°): ${pairLived(p1, p2, a.type)}`;
    });
    sky.push(tightStrs.join(' '));
  }

  // Sun / season backdrop
  sky.push(`Sun at ${sunPos} sets a ${sunSeasonBackdrop(sunSign)} backdrop.`);

  sky.forEach(p => { lines.push(p); lines.push(''); });

  // ── SECTION 2: YOUR CHART ─────────────────────────────────────────
  if (natalChart) {
    lines.push(`YOUR CHART${recipientName ? ` — ${recipientName}` : ''}`);
    lines.push('─'.repeat(50));

    const yourEntries: string[] = [];

    // Stations land first (always included regardless of orb)
    for (const s of stations) {
      const houseLabel = s.natalHouse ? `your ${s.natalHouse}${ordSuffix(s.natalHouse)} house (${HOUSE_THEME[s.natalHouse]})` : 'your chart';
      const ruler = TRADITIONAL_RULER[s.sign];
      const rulerNatalHouse = ruler && natalChart.planets[ruler as keyof typeof natalChart.planets]
        ? getNatalHouseOf(ruler, natalChart) : null;
      const rulerSign = ruler ? (natalChart.planets[ruler as keyof typeof natalChart.planets] as any)?.sign : null;
      const rulerLine = ruler && rulerNatalHouse
        ? ` The ruler of that house is ${ruler} in your ${rulerNatalHouse}${ordSuffix(rulerNatalHouse)} house in ${rulerSign}, so this lands as ${rulerExpression(ruler, rulerNatalHouse)}.`
        : '';
      const hitLine = s.hits.length
        ? ` It also touches your natal ${s.hits[0].natal} in ${s.hits[0].natalSign}${s.hits[0].natalHouse ? ` (${s.hits[0].natalHouse}${ordSuffix(s.hits[0].natalHouse)} house)` : ''} by ${s.hits[0].aspect}, orb ${s.hits[0].orb}°: ${pairLived(s.name, s.hits[0].natal, s.hits[0].aspect)}.`
        : '';
      const advice = stationAdvice(s.name, s.direction);
      yourEntries.push(
        `${s.name} stationing ${s.direction} at ${s.pos} sits in ${houseLabel}.${rulerLine}${hitLine} ${advice}`
      );
    }

    // Personal transits sorted tightest first (already filtered <2°)
    for (const a of personalTransits) {
      const tHouse = (a as any).transitHouse as number | null;
      const nHouse = (a as any).natalHouse as number | null;
      const tHouseLabel = tHouse ? `your ${tHouse}${ordSuffix(tHouse)} house (${HOUSE_THEME[tHouse]})` : '';
      const nHouseLabel = nHouse ? `${nHouse}${ordSuffix(nHouse)} house (${HOUSE_THEME[nHouse]})` : '';
      const ruler = TRADITIONAL_RULER[a.transitSign];
      const rulerNatalHouse = ruler ? getNatalHouseOf(ruler, natalChart) : null;
      const rulerSign = ruler ? (natalChart.planets[ruler as keyof typeof natalChart.planets] as any)?.sign : null;
      const rulerLine = ruler && rulerNatalHouse
        ? ` The ruler of ${a.transitSign} is ${ruler}, sitting natally in your ${rulerNatalHouse}${ordSuffix(rulerNatalHouse)} house in ${rulerSign}, so this expresses as ${rulerExpression(ruler, rulerNatalHouse)}.`
        : '';
      const advice = transitAdvice(a.transitPlanet, a.aspect);
      yourEntries.push(
        `${a.transitPlanet} at ${a.transitDegree}° ${a.transitSign} in ${tHouseLabel} ${a.aspect}s your natal ${a.natalPlanet} in ${a.natalSign}${nHouseLabel ? ' in your ' + nHouseLabel : ''} (orb ${a.orb}°): ${pairLived(a.transitPlanet, a.natalPlanet, a.aspect)}.${rulerLine} ${advice}`
      );
    }

    if (yourEntries.length === 0) {
      lines.push(`No tight transits on your chart today (under 2° orb). The collective weather above is the main story.`);
      lines.push('');
    } else {
      yourEntries.forEach(e => { lines.push(e); lines.push(''); });
    }
  }

  // ── SECTION 3: TODAY'S DECODER ────────────────────────────────────
  lines.push("TODAY'S DECODER");
  lines.push('─'.repeat(50));

  const decoder: string[] = [];

  // Stations → personalized decoder line
  for (const s of stations) {
    if (s.hits.length && natalChart) {
      const h = s.hits[0];
      decoder.push(`Foggy, off, or oddly tired for no clear reason → ${s.name} stationing ${s.direction}, sitting on your ${h.natal}.`);
    } else {
      decoder.push(`A collective shift around ${stationTheme(s.name)} → ${s.name} stationing ${s.direction} at ${s.pos}.`);
    }
  }

  // Tight sky aspect lines
  for (const a of tight.slice(0, 2)) {
    decoder.push(`${aspectNoticeable(cap(a.planet1), cap(a.planet2), a.type)} → ${cap(a.planet1)} ${a.type} ${cap(a.planet2)}.`);
  }

  // Personal transit lines
  for (const a of personalTransits.slice(0, 3)) {
    decoder.push(`${personalNoticeable(a.transitPlanet, a.natalPlanet, a.aspect)} → transiting ${a.transitPlanet} ${a.aspect} your ${a.natalPlanet}.`);
  }

  // VOC line
  if (voc.isVOC && voc.start && voc.end) {
    const startH = voc.start.getHours();
    if (startH >= 6 && startH < 24) {
      decoder.push(`Plans made after ${fmtTime(voc.start)} fall sideways or fizzle → Moon void of course until ${fmtTime(voc.end)}, don't start anything new.`);
    }
  }

  // Mars-in-Aries shortcut if present
  if ((planets.mars as any)?.signName === 'Aries') {
    decoder.push(`Aggressive drivers, short fuses, people acting before thinking → Mars in Aries.`);
  }

  decoder.slice(0, 8).forEach(d => lines.push(d));

  // Subject
  const subject = `${anchor.toLocaleDateString('en-US', { weekday: 'long' })}, ${anchor.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} · ${moonSign} Moon · ${dayPunch(stations, voc, tight, moonSign)}`;

  return { subject, body: lines.join('\n') };
}

// ─── Helpers for the new 3-section format ─────────────────────────────

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const TRADITIONAL_RULER: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

function getNatalHouseOf(planet: string, chart: NatalChart): number | null {
  const p = chart.planets[planet as keyof typeof chart.planets] as any;
  if (!p?.sign || !chart.houseCusps) return null;
  const lon = signDegreesToLongitude(p.sign, p.degree, p.minutes || 0);
  return getHouseForLongitude(lon, chart);
}

function rulerExpression(ruler: string, house: number): string {
  const fuel: Record<string, string> = {
    Sun: 'visibility and identity',
    Moon: 'mood and instinct',
    Mercury: 'words, schedule, and thinking',
    Venus: 'money, taste, and relationships',
    Mars: 'drive, action, and friction',
    Jupiter: 'expansion and beliefs',
    Saturn: 'structure, duty, and limits',
  };
  return `${fuel[ruler] || 'energy'} routed through ${HOUSE_THEME[house] || 'that area'}`;
}

function signCollective(sign: string): string {
  const map: Record<string, string> = {
    Aries: 'Collectively people are restless, blunt, and quick to react',
    Taurus: 'Collectively the mood is slow, body-based, comfort-seeking',
    Gemini: 'Collectively people are talkative, scattered, info-hungry',
    Cancer: 'Collectively the mood is tender, family-pulled, moody',
    Leo: 'Collectively people want warmth, attention, and a little drama',
    Virgo: 'Collectively the mood is tidy, useful, fix-it focused',
    Libra: 'Collectively people are relational, fair-minded, smoothing things over',
    Scorpio: 'Collectively the mood is intense, private, get-to-the-bottom-of-it',
    Sagittarius: 'Collectively people want out, want big, want freedom',
    Capricorn: 'Collectively the mood is serious, grown-up, get-things-done',
    Aquarius: 'Collectively people are detached, future-facing, doing it differently',
    Pisces: 'Collectively the mood is dreamy, porous, easily moved',
  };
  return map[sign] || 'A steady ordinary mood';
}

function sunSeasonBackdrop(sign: string): string {
  const map: Record<string, string> = {
    Aries: 'starting-fresh, push-forward', Taurus: 'slow-down, build-and-enjoy',
    Gemini: 'curious, social, fast-moving', Cancer: 'home, family, comfort-first',
    Leo: 'shine, celebrate, warm-hearted', Virgo: 'tidy-up, refine, return-to-routines',
    Libra: 'relationship, balance, beauty', Scorpio: 'intensity, depth, transformation',
    Sagittarius: 'big-picture, travel, meaning', Capricorn: 'work, structure, ambition',
    Aquarius: 'community, vision, reinvention', Pisces: 'rest, dream, dissolve',
  };
  return map[sign] || 'steady';
}

function pairLived(p1: string, p2: string, aspect: string): string {
  const tone = toneOf(aspect);
  const combo = `${p1}-${p2}`.toLowerCase();
  // A few high-signal combos
  const map: Record<string, Record<AspectTone, string>> = {
    'mars-venus': { tense: 'attraction tangled with conflict, hot-and-cold dynamics', easy: 'flirty, magnetic, easy chemistry', meeting: 'desire and money concentrate' },
    'sun-saturn': { tense: 'feels heavy, judged, or slowed down', easy: 'steady focus, you can commit', meeting: 'reality check on identity' },
    'moon-neptune': { tense: 'emotional fog, can\'t locate the feeling', easy: 'soft, intuitive, kind', meeting: 'feelings blur into imagination' },
    'mercury-uranus': { tense: 'jumpy thoughts, surprise news, tech glitches', easy: 'lightbulb ideas, quick insight', meeting: 'sudden new thinking' },
    'venus-pluto': { tense: 'obsessive love or money pressure', easy: 'deep desire, magnetic pull', meeting: 'a relationship or value gets very loaded' },
    'mars-pluto': { tense: 'power struggles, road rage, force', easy: 'concentrated drive', meeting: 'an intense push' },
  };
  if (map[combo]) return map[combo][tone];
  // Generic fallback
  if (tone === 'tense') return `friction between ${planetVoice(p1)} and ${planetVoice(p2)}`;
  if (tone === 'easy') return `flow between ${planetVoice(p1)} and ${planetVoice(p2)}`;
  return `${planetVoice(p1)} meets ${planetVoice(p2)}`;
}

function planetVoice(p: string): string {
  const v: Record<string, string> = {
    Sun: 'identity', Moon: 'feelings', Mercury: 'thinking', Venus: 'love and money',
    Mars: 'drive', Jupiter: 'expansion', Saturn: 'structure', Uranus: 'disruption',
    Neptune: 'fog and dreams', Pluto: 'power', NorthNode: 'growth', SouthNode: 'old patterns',
    Chiron: 'the old wound', Ascendant: 'how you show up', Midheaven: 'your public face',
  };
  return v[p] || p;
}

function transitAdvice(transit: string, aspect: string): string {
  const tone = toneOf(aspect);
  if (tone === 'tense') return `Do: name what's actually being asked. Don't: react fast or pick the fight.`;
  if (tone === 'easy') return `Do: send the message, ask, or start. Don't: wait for it to come find you.`;
  return `Do: notice what gets switched on and use it. Don't: ignore the signal.`;
}

function stationAdvice(planet: string, direction: 'retrograde' | 'direct'): string {
  if (direction === 'retrograde') return `Do: review, revisit, audit. Don't: launch or commit.`;
  return `Do: move the thing forward. Don't: keep waiting.`;
}

function stationTheme(planet: string): string {
  const m: Record<string, string> = {
    Mercury: 'plans and communication', Venus: 'money and love', Mars: 'drive and action',
    Jupiter: 'growth and beliefs', Saturn: 'structure and limits', Uranus: 'sudden change',
    Neptune: 'dreams and fog', Pluto: 'power and control',
  };
  return m[planet] || 'energy';
}

function aspectNoticeable(p1: string, p2: string, aspect: string): string {
  const tone = toneOf(aspect);
  if (tone === 'tense') return `Tension, short tempers, or things scraping in the world`;
  if (tone === 'easy') return `Doors opening, easier conversations, smoother moments`;
  return `A loud combined signal of ${planetVoice(p1)} and ${planetVoice(p2)}`;
}

function personalNoticeable(transit: string, natal: string, aspect: string): string {
  const tone = toneOf(aspect);
  const part = NATAL_MEANING[natal] || `your ${natal}`;
  if (tone === 'tense') return `Friction or restlessness in ${part}`;
  if (tone === 'easy') return `An opening in ${part}`;
  return `Your ${part} switches on more than usual`;
}

function dayPunch(stations: any[], voc: any, tight: any[], moonSign: string): string {
  if (stations.length) return `${stations[0].name} stations ${stations[0].direction}`;
  if (tight.length) return `${cap(tight[0].planet1)} ${tight[0].type} ${cap(tight[0].planet2)}`;
  if (voc?.isVOC) return `Void Moon, hold the small stuff`;
  return `${moonSign} Moon mood`;
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
