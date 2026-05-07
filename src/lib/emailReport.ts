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
      // Sample velocities across a ±3-day window to detect a true station
      // (sign change of daily motion) rather than just "currently slow."
      const dayMs = 86400000;
      const samples: { t: Date; v: number }[] = [];
      for (let off = -3; off <= 3; off++) {
        const t = new Date(anchor.getTime() + off * dayMs);
        const e0 = Astronomy.Ecliptic(Astronomy.GeoVector(body, t, false)).elon;
        const e1 = Astronomy.Ecliptic(Astronomy.GeoVector(body, new Date(t.getTime() + dayMs), false)).elon;
        let d = e1 - e0;
        if (d > 180) d -= 360;
        if (d < -180) d += 360;
        samples.push({ t, v: d });
      }
      // Find a velocity sign change inside the window
      let stationDirection: 'retrograde' | 'direct' | null = null;
      let stationIdx = -1;
      for (let i = 1; i < samples.length; i++) {
        const a = samples[i - 1].v, b = samples[i].v;
        if (a > 0 && b <= 0) { stationDirection = 'retrograde'; stationIdx = i; break; }
        if (a < 0 && b >= 0) { stationDirection = 'direct'; stationIdx = i; break; }
      }
      if (!stationDirection) continue;

      // Only include if the exact station moment falls within ±2 days of anchor
      const exact = findExactStationTime(body, anchor);
      if (!exact) continue;
      const daysFromAnchor = (exact.getTime() - anchor.getTime()) / dayMs;
      if (Math.abs(daysFromAnchor) > 2) continue;

      const p = (planets as any)[name.toLowerCase()];
      if (!p) continue;
      const lon = signDegreesToLongitude(p.signName, p.degree, p.minutes || 0);
      const meaningPair = STATION_MEANING[name];
      const meaning = meaningPair ? meaningPair[stationDirection] : '';
      const natalHouse = natalChart?.houseCusps ? getHouseForLongitude(lon, natalChart) : null;
      const hits = natalChart ? findStationHits(lon, natalChart) : [];
      stations.push({
        name,
        direction: stationDirection,
        pos: `${p.degree}° ${p.signName}`,
        sign: p.signName, degree: p.degree, longitude: lon,
        exact,
        meaning, natalHouse, hits,
      });
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
  const DIV = '────────────────────────';

  const sunSign = (planets.sun as any).signName;
  const moonSign = (planets.moon as any).signName;
  const sunPos = `${(planets.sun as any).degree}° ${sunSign}`;
  const moonPos = `${(planets.moon as any).degree}° ${moonSign}`;

  // ── SECTION 1: THE SKY TODAY ──────────────────────────────────────
  lines.push('THE SKY TODAY');
  lines.push(DIV);

  // Moon line — one sentence
  let moonLine = `Moon in ${moonSign} (${moonPhase.phaseName}, ${moonPos}). ${signCollective(moonSign)}.`;
  if (voc.isVOC && voc.start && voc.end) {
    const startH = voc.start.getHours();
    if (startH >= 6 && startH < 24) {
      const nextSign = nextZodiac(moonSign);
      const last = voc.lastAspect
        ? `Moon makes its last aspect, a ${voc.lastAspect.aspectName} to ${voc.lastAspect.planet}, at ${fmtTime(voc.lastAspect.time)}, then drifts void of course until it enters ${nextSign} at ${fmtTime(voc.end)}`
        : `Moon goes void of course at ${fmtTime(voc.start)} until it enters ${nextSign} at ${fmtTime(voc.end)}`;
      moonLine += ` ${last}. Don't start anything new in that window.`;
    }
  }
  lines.push(moonLine);
  lines.push('');

  // Stations — one sentence each, with accurate timing relative to "today"
  for (const s of stations) {
    const when = stationWhen(s.exact, anchor);
    const verb = when.kind === 'past' ? `stationed ${s.direction}` : `stations ${s.direction}`;
    const exactStr = s.exact ? ` Exact ${fmtStationDateTime(s.exact)}.` : '';
    lines.push(`${s.name} ${verb} ${when.label} at ${s.pos}.${exactStr} ${s.meaning}`);
    lines.push('');
  }

  // Tightest 2 sky-to-sky aspects under 2°
  const tight = [...aspects]
    .filter(a => parseFloat(a.orb) < 2)
    .sort((a, b) => parseFloat(a.orb) - parseFloat(b.orb))
    .slice(0, 2);
  for (const a of tight) {
    const p1 = cap(a.planet1);
    const p2 = cap(a.planet2);
    const s1 = (planets as any)[a.planet1.toLowerCase()]?.signName || '';
    const s2 = (planets as any)[a.planet2.toLowerCase()]?.signName || '';
    lines.push(`${p1} in ${s1} ${aspectVerb(a.type)} ${p2} in ${s2} — ${pairLived(p1, p2, a.type)}.`);
    lines.push('');
  }

  // Sun / season backdrop
  lines.push(`Sun at ${sunPos} sets a ${sunSeasonBackdrop(sunSign)} backdrop.`);
  lines.push('');

  // ── SECTION 2: YOUR CHART ─────────────────────────────────────────
  if (natalChart) {
    lines.push(DIV);
    lines.push(`YOUR CHART${recipientName ? ` — ${recipientName}` : ''}`);
    lines.push(DIV);

    const yourEntries: string[] = [];

    // Stations land first (always included regardless of orb)
    for (const s of stations) {
      const houseLabel = s.natalHouse
        ? `your ${s.natalHouse}${ordSuffix(s.natalHouse)} house of ${HOUSE_THEME[s.natalHouse]}`
        : 'your chart';
      const ruler = TRADITIONAL_RULER[s.sign];
      const rulerNatalHouse = ruler && natalChart.planets[ruler as keyof typeof natalChart.planets]
        ? getNatalHouseOf(ruler, natalChart) : null;
      const rulerSign = ruler ? (natalChart.planets[ruler as keyof typeof natalChart.planets] as any)?.sign : null;

      const swhen = stationWhen(s.exact, anchor);
      const sverb = swhen.kind === 'past' ? `stationed ${s.direction} ${swhen.label}` : `stationing ${s.direction} ${swhen.label}`;
      let entry = `${s.name} ${sverb} at ${s.pos} sits in ${houseLabel}`;
      if (s.hits.length) {
        const h = s.hits[0];
        const hHouseLabel = h.natalHouse ? ` in your ${h.natalHouse}${ordSuffix(h.natalHouse)} house of ${HOUSE_THEME[h.natalHouse]}` : '';
        entry += `, ${aspectVerb(h.aspect)} your natal ${h.natal} in ${h.natalSign}${hHouseLabel}`;
      }
      entry += '.';
      if (ruler && rulerNatalHouse && rulerSign) {
        entry += ` The ruler of that house is ${ruler} sitting natally in your ${rulerNatalHouse}${ordSuffix(rulerNatalHouse)} house in ${rulerSign}, so this lands as ${rulerExpression(ruler, rulerNatalHouse)}.`;
      }
      const adv = concreteAdvice(s.name, s.hits[0]?.natal || '', s.hits[0]?.aspect || 'station');
      entry += ` Do: ${adv.do}. Don't: ${adv.dont}.`;
      yourEntries.push(entry);
    }

    // Personal transits sorted tightest first (already filtered <2°)
    for (const a of personalTransits) {
      const tHouse = (a as any).transitHouse as number | null;
      const nHouse = (a as any).natalHouse as number | null;
      const tHouseLabel = tHouse ? `your ${tHouse}${ordSuffix(tHouse)} house of ${HOUSE_THEME[tHouse]}` : 'your chart';
      const nHouseLabel = nHouse ? ` in your ${nHouse}${ordSuffix(nHouse)} house of ${HOUSE_THEME[nHouse]}` : '';
      const ruler = TRADITIONAL_RULER[a.transitSign];
      const rulerNatalHouse = ruler ? getNatalHouseOf(ruler, natalChart) : null;
      const rulerSign = ruler ? (natalChart.planets[ruler as keyof typeof natalChart.planets] as any)?.sign : null;

      let entry = `${a.transitPlanet} at ${a.transitDegree}° ${a.transitSign} moving through ${tHouseLabel} ${aspectVerb(a.aspect)} your natal ${a.natalPlanet} in ${a.natalSign}${nHouseLabel}.`;
      if (ruler && rulerNatalHouse && rulerSign) {
        entry += ` The ruler of that transit house is ${ruler}, sitting natally in your ${rulerNatalHouse}${ordSuffix(rulerNatalHouse)} house in ${rulerSign}, so this expresses as ${rulerExpression(ruler, rulerNatalHouse)}.`;
      }
      const adv = concreteAdvice(a.transitPlanet, a.natalPlanet, a.aspect);
      entry += ` Do: ${adv.do}. Don't: ${adv.dont}.`;
      yourEntries.push(entry);
    }

    if (yourEntries.length === 0) {
      lines.push(`No tight personal hits today — the collective weather above is the story.`);
      lines.push('');
    } else {
      yourEntries.forEach(e => { lines.push(e); lines.push(''); });
    }
  }

  // ── SECTION 3: TODAY'S DECODER ────────────────────────────────────
  lines.push(DIV);
  lines.push("TODAY'S DECODER");
  lines.push(DIV);

  const decoder: string[] = [];

  // Stations first — personalized if hits, collective otherwise
  for (const s of stations) {
    const dwhen = stationWhen(s.exact, anchor);
    const dverb = dwhen.kind === 'past' ? `stationed ${s.direction} ${dwhen.label}` : `stationing ${s.direction}`;
    if (s.hits.length && natalChart) {
      const h = s.hits[0];
      decoder.push(`${decoderNotice(s.name, h.natal, h.aspect, true)} → ${s.name} ${dverb} on your ${h.natal}.`);
    } else {
      decoder.push(`${decoderStationCollective(s.name)} → ${s.name} ${dverb} at ${s.pos}.`);
    }
  }

  // Personal transit lines (tightest first)
  for (const a of personalTransits.slice(0, 4)) {
    decoder.push(`${decoderNotice(a.transitPlanet, a.natalPlanet, a.aspect, true)} → transiting ${a.transitPlanet} ${aspectVerb(a.aspect)} your ${a.natalPlanet}.`);
  }

  // Tight sky aspect lines
  for (const a of tight) {
    const p1 = cap(a.planet1);
    const p2 = cap(a.planet2);
    decoder.push(`${decoderNotice(p1, p2, a.type, false)} → ${p1} ${aspectVerb(a.type)} ${p2}.`);
  }

  // Mars-in-Aries shortcut if present and not already covered
  if ((planets.mars as any)?.signName === 'Aries' && !decoder.some(d => d.includes('Mars'))) {
    decoder.push(`Aggressive drivers, short fuses, people acting before thinking → Mars in Aries.`);
  }

  // VOC line — last
  if (voc.isVOC && voc.start && voc.end) {
    const startH = voc.start.getHours();
    if (startH >= 6 && startH < 24) {
      decoder.push(`Plans made after ${fmtTime(voc.start)} fall sideways or fizzle → Moon void of course until ${fmtTime(voc.end)}, don't start anything new.`);
    }
  }

  // Cap at 8, dedupe
  const seen = new Set<string>();
  const decoderFinal = decoder.filter(d => {
    const key = d.split('→')[1]?.trim() || d;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 8);
  decoderFinal.forEach(d => lines.push(d));

  // Subject
  const subject = `${anchor.toLocaleDateString('en-US', { weekday: 'long' })}, ${anchor.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} · ${moonSign} Moon · ${dayPunch(stations, voc, tight, personalTransits, moonSign)}`;

  // Final scrubbing: banned words and 400-word cap
  let body = lines.join('\n');
  body = scrubBanned(body);
  body = capWords(body, 400);

  return { subject, body };
}

// ─── Helpers for the new 3-section format ─────────────────────────────

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Describe a station's timing relative to the email's anchor day. */
function stationWhen(exact: Date | null, anchor: Date): { kind: 'past' | 'today' | 'future'; label: string } {
  if (!exact) return { kind: 'today', label: 'today' };
  const dayMs = 86400000;
  const anchorDay = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate()).getTime();
  const exactDay = new Date(exact.getFullYear(), exact.getMonth(), exact.getDate()).getTime();
  const diff = Math.round((exactDay - anchorDay) / dayMs);
  if (diff === 0) return { kind: 'today', label: 'today' };
  if (diff === -1) return { kind: 'past', label: 'yesterday' };
  if (diff === 1) return { kind: 'future', label: 'tomorrow' };
  if (diff < 0) return { kind: 'past', label: `${Math.abs(diff)} days ago` };
  return { kind: 'future', label: `in ${diff} days` };
}

const ZODIAC_ORDER = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
function nextZodiac(sign: string): string {
  const i = ZODIAC_ORDER.indexOf(sign);
  return i < 0 ? sign : ZODIAC_ORDER[(i + 1) % 12];
}

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

function dayPunch(stations: any[], voc: any, tight: any[], personals: any[], moonSign: string): string {
  if (stations.length) {
    const s = stations[0];
    return `${s.name} stations ${s.direction} at ${s.pos}`;
  }
  const veryTight = tight.find(a => parseFloat(a.orb) < 1);
  if (veryTight) return `${cap(veryTight.planet1)} ${aspectVerb(veryTight.type)} ${cap(veryTight.planet2)}`;
  if (personals && personals.length) {
    const p = personals[0];
    return `${p.transitPlanet} on your ${p.natalPlanet}`;
  }
  if (voc?.isVOC) return `Void Moon, hold the small stuff`;
  return `${moonSign} Moon, ${signCollective(moonSign).toLowerCase().replace('collectively ', '')}`;
}

// ─── New helpers for 3-section glance ─────────────────────────────────

function aspectVerb(aspect: string): string {
  const m: Record<string, string> = {
    conjunction: 'joins', opposition: 'opposes', trine: 'trines',
    square: 'squares', sextile: 'sextiles', quincunx: 'awkwardly tilts at',
    semisextile: 'brushes', station: 'lands on',
  };
  return m[aspect] || aspect;
}

function concreteAdvice(transit: string, natal: string, aspect: string): { do: string; dont: string } {
  const key = `${transit}-${natal}`.toLowerCase();
  const map: Record<string, { do: string; dont: string }> = {
    'neptune-moon': { do: 'rest, audit, review what you started in the last six months', dont: 'launch anything new, sign anything, or trust your read on people today' },
    'neptune-sun': { do: 'soften the schedule, let things blur a little', dont: 'force a decision about who you are right now' },
    'neptune-venus': { do: 'romanticize quietly, make art, dream', dont: 'commit money or confess love today' },
    'uranus-venus': { do: 'let what you\'ve outgrown go', dont: 'blow up the relationship or the budget today' },
    'uranus-jupiter': { do: 'stay open to a surprise opportunity', dont: 'overcommit on the news of the moment' },
    'uranus-mars': { do: 'move your body, channel the jolt', dont: 'pick a fight or speed' },
    'saturn-mercury': { do: 'say the hard true thing slowly', dont: 'agree to anything you can\'t deliver' },
    'saturn-moon': { do: 'name the heavy feeling and let it pass', dont: 'isolate or doom-spiral' },
    'pluto-venus': { do: 'tell the truth about what you actually want', dont: 'manipulate or test someone' },
    'pluto-sun': { do: 'sit with the power question honestly', dont: 'give your power away to keep peace' },
    'jupiter-sun': { do: 'say yes to the bigger room', dont: 'over-promise' },
    'jupiter-venus': { do: 'enjoy something generously', dont: 'overspend on the high' },
    'mars-mars': { do: 'use the surge — workout, deep work, hard task', dont: 'react fast in conversation' },
  };
  if (map[key]) return map[key];
  // Tone fallback
  const tone = toneOf(aspect);
  if (tone === 'tense') return { do: 'name what\'s actually being asked', dont: 'react fast or pick the fight' };
  if (tone === 'easy') return { do: 'send the message, ask, or start the thing', dont: 'wait for it to come find you' };
  if (aspect === 'station') return { do: 'review and audit', dont: 'launch or commit' };
  return { do: 'notice what gets switched on and use it', dont: 'ignore the signal' };
}

function decoderNotice(p1: string, p2: string, aspect: string, personal: boolean): string {
  const key = `${p1}-${p2}`.toLowerCase();
  const personalMap: Record<string, string> = {
    'neptune-moon': 'Foggy, exhausted, or emotionally off for no clear reason',
    'neptune-sun': 'Unsure who you are today, edges blurred',
    'neptune-venus': 'Romantic haze, can\'t read someone clearly',
    'uranus-venus': 'Restless about money or a relationship, urge to blow something up',
    'uranus-jupiter': 'Unexpected news about shared money, debt, or a financial agreement',
    'uranus-mars': 'Jumpy, accident-prone, sudden physical urgency',
    'saturn-mercury': 'Conversations feel heavier, words carry more weight',
    'saturn-moon': 'Mood is heavy, lonely, or older than the day warrants',
    'pluto-venus': 'A relationship or value feels loaded, intense, or obsessive',
    'pluto-sun': 'A power dynamic surfaces, someone is testing you',
    'jupiter-sun': 'A doorway opens, things expand around your name',
    'jupiter-venus': 'Generosity, money in, easy pleasure',
  };
  const collectiveMap: Record<string, string> = {
    'mars-saturn': 'Things feel blocked, drive meets a wall',
    'mars-pluto': 'Power struggles, road rage, force in the air',
    'venus-jupiter': 'People are unusually generous, easy money or affection',
    'mercury-uranus': 'Surprise news, tech glitches, jumpy thoughts',
    'sun-saturn': 'The day feels heavier, slower, more weight on what you do',
    'moon-neptune': 'Collective fog, can\'t locate the feeling',
  };
  if (personal && personalMap[key]) return personalMap[key];
  if (!personal && collectiveMap[key]) return collectiveMap[key];
  // Tone fallback
  const tone = toneOf(aspect);
  if (personal) {
    const part = NATAL_MEANING[p2] || `your ${p2}`;
    if (tone === 'tense') return `Friction or restlessness in ${part}`;
    if (tone === 'easy') return `An opening in ${part}`;
    return `Your ${part} switches on more than usual`;
  }
  if (tone === 'tense') return `Tension and short tempers in the day`;
  if (tone === 'easy') return `Doors opening, easier conversations`;
  return `A loud combined signal of ${planetVoice(p1)} and ${planetVoice(p2)}`;
}

function decoderStationCollective(planet: string): string {
  const m: Record<string, string> = {
    Mercury: 'Plans, messages, and tech glitch or get re-read',
    Venus: 'Old loves, old wants, old money questions resurface',
    Mars: 'Drive stalls or fires up depending on direction',
    Jupiter: 'A bigger plan reverses or opens up',
    Saturn: 'A structure loosens or solidifies',
    Uranus: 'Sudden change quiets or speeds up',
    Neptune: 'Things you can\'t quite read or trust today, perception is unreliable',
    Pluto: 'Buried power dynamics surface or go underground',
  };
  return m[planet] || 'A collective shift';
}

function scrubBanned(text: string): string {
  return text
    .replace(/\bmetabolize\w*/gi, 'process')
    .replace(/\barchetypal\b/gi, 'classic')
    .replace(/\bportal\b/gi, 'opening')
    .replace(/\bliminal\b/gi, 'in-between')
    .replace(/\bintegrate\b/gi, 'absorb')
    .replace(/\bwound (you|me|us|him|her|them)\b/gi, 'tender spot in $1');
}

function capWords(text: string, max: number): string {
  const words = text.split(/\s+/);
  if (words.length <= max) return text;
  // Trim from end at line boundaries until under cap
  const lines = text.split('\n');
  while (lines.join(' ').split(/\s+/).filter(Boolean).length > max && lines.length > 6) {
    // Drop trailing non-empty line that isn't a divider/header
    for (let i = lines.length - 1; i >= 0; i--) {
      const l = lines[i].trim();
      if (l && !l.startsWith('─') && l !== "TODAY'S DECODER" && l !== 'THE SKY TODAY' && !l.startsWith('YOUR CHART')) {
        lines.splice(i, 1);
        break;
      }
    }
  }
  return lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd();
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
