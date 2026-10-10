/**
 * Major Transits & Exact Dates engine.
 *
 * Real ephemeris (astronomy-engine, geocentric ecliptic longitude) sampled
 * daily, with exact passes found by sign-change root finding and refined by
 * bisection. No average speeds, no assumed pass counts: if the sky makes one
 * exact hit, one is reported; if it makes five, five are reported.
 */

import * as Astronomy from 'astronomy-engine';
import type { NatalChart } from '@/hooks/useNatalChart';
import { getPlanetLongitudeExact, normalizeLongitude, aspectOrb } from '@/lib/transitMath';
import { houseForLongitude, toAbsoluteLongitude } from '@/lib/houseForLongitude';
import { getNatalAngleTargets } from '@/lib/transitAspects';

const DAY = 86400000;
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

export const MAJOR_TRANSIT_BODIES = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
export type MajorTransitBody = typeof MAJOR_TRANSIT_BODIES[number];

const BODY: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun, Mercury: Astronomy.Body.Mercury, Venus: Astronomy.Body.Venus, Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter, Saturn: Astronomy.Body.Saturn, Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune, Pluto: Astronomy.Body.Pluto,
};

export const GLYPH: Record<string, string> = {
  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂', Jupiter: '♃', Saturn: '♄', Uranus: '♅',
  Neptune: '♆', Pluto: '♇', Ascendant: 'ASC', Midheaven: 'MC', IC: 'IC', Descendant: 'DSC',
};

export const ASPECTS = [
  { name: 'conjunction', angle: 0, glyph: '☌', weight: 1 },
  { name: 'opposition', angle: 180, glyph: '☍', weight: 0.95 },
  { name: 'square', angle: 90, glyph: '□', weight: 0.9 },
  { name: 'trine', angle: 120, glyph: '△', weight: 0.7 },
  { name: 'sextile', angle: 60, glyph: '⚹', weight: 0.55 },
] as const;
export type MajorAspectName = typeof ASPECTS[number]['name'];

/** Orb that defines the active window for each transiting planet. */
const ACTIVE_ORB: Record<MajorTransitBody, number> = { Jupiter: 2, Saturn: 2.5, Uranus: 2.5, Neptune: 2, Pluto: 2 };
const MEAN_SPEED: Record<MajorTransitBody, number> = { Jupiter: 0.083, Saturn: 0.034, Uranus: 0.012, Neptune: 0.006, Pluto: 0.004 };
const TRANSIT_WEIGHT: Record<MajorTransitBody, number> = { Pluto: 5, Neptune: 5, Uranus: 5, Saturn: 4.5, Jupiter: 3 };
const TARGET_WEIGHT: Record<string, number> = {
  Sun: 5, Moon: 5, Ascendant: 5, Midheaven: 5, IC: 4.5, Descendant: 4.5,
  Mercury: 3, Venus: 3, Mars: 3, Jupiter: 2, Saturn: 2,
};
const NATAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];

export type MajorTransitStatus = 'Applying' | 'Exact' | 'Separating' | 'Upcoming';
export type MajorTransitMotion = 'Direct' | 'Retrograde' | 'Stationing';

export interface ExactPassInfo {
  date: Date;
  motion: 'Direct' | 'Retrograde';
  label: string; // "1st pass (direct)"
  isPast: boolean;
}

export interface MajorTransit {
  id: string;
  transitPlanet: MajorTransitBody;
  aspect: MajorAspectName;
  aspectGlyph: string;
  target: string;
  targetLabel: string;
  isAngle: boolean;
  headline: string; // "♄ Saturn ☌ IC"
  transitPosition: string; // current "12°04′ Aries"
  targetPosition: string;
  currentOrb: number;
  status: MajorTransitStatus;
  motion: MajorTransitMotion;
  passes: ExactPassInfo[];
  nextExact: Date | null;
  windowStart: Date;
  windowEnd: Date;
  windowOpenEnded: boolean;
  durationLabel: string;
  isActiveNow: boolean;
  natalHouse: number | null;
  transitHouse: number | null;
  lifeArea: string;
  meaning: string;
  watchFor: string;
  axisNote: string | null;
  priority: number;
}

export interface MajorTransitOptions {
  now?: Date;
  horizonDays?: number; // default 365
  lookbackDays?: number; // default 540, so earlier passes of an active window are shown
}

function formatPos(lon: number): string {
  const l = normalizeLongitude(lon);
  const s = Math.floor(l / 30);
  const d = l - s * 30;
  let deg = Math.floor(d);
  let min = Math.round((d - deg) * 60);
  if (min === 60) { deg += 1; min = 0; }
  return `${deg}°${String(min).padStart(2, '0')}′ ${SIGNS[s]}`;
}

const norm180 = (x: number) => { const v = normalizeLongitude(x); return v > 180 ? v - 360 : v; };
const ordinal = (n: number) => `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;

interface Target { name: string; label: string; lon: number; isAngle: boolean }

export function getMajorTransitTargets(chart: NatalChart): Target[] {
  const out: Target[] = [];
  for (const name of NATAL_PLANETS) {
    const lon = toAbsoluteLongitude((chart.planets as Record<string, { sign?: string; degree?: number; minutes?: number }>)?.[name]);
    if (lon !== null) out.push({ name, label: name, lon, isAngle: false });
  }
  for (const a of getNatalAngleTargets(chart)) {
    out.push({ name: a.name, label: a.name === 'Midheaven' ? 'MC' : a.name === 'Descendant' ? 'DSC' : a.name === 'Ascendant' ? 'ASC' : a.name, lon: a.longitude, isAngle: true });
  }
  return out;
}

/** Exact hits of `body` to target longitude within [startMs, endMs]. */
export function findExactHits(body: string, targetLon: number, startMs: number, endMs: number, lonAt: (ms: number) => number): { ms: number; motion: 'Direct' | 'Retrograde' }[] {
  const hits: { ms: number; motion: 'Direct' | 'Retrograde' }[] = [];
  let prevMs = startMs;
  let prev = norm180(lonAt(prevMs) - targetLon);
  for (let ms = startMs + DAY; ms <= endMs; ms += DAY) {
    const cur = norm180(lonAt(ms) - targetLon);
    if (Math.abs(prev) < 5 && Math.abs(cur) < 5 && (prev === 0 || Math.sign(prev) !== Math.sign(cur))) {
      let lo = prevMs, hi = ms, flo = prev;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2;
        const fm = norm180(getPlanetLongitudeExact(BODY[body], new Date(mid)) - targetLon);
        if (Math.sign(fm) === Math.sign(flo)) { lo = mid; flo = fm; } else hi = mid;
      }
      hits.push({ ms: (lo + hi) / 2, motion: cur > prev ? 'Direct' : 'Retrograde' });
    }
    prevMs = ms; prev = cur;
  }
  return hits;
}

// ── Interpretation dictionaries ─────────────────────────────────────

const PLANET_TRANSIT: Record<MajorTransitBody, { theme: string; notice: string; kind: string }> = {
  Jupiter: { theme: 'growth, opportunity, generosity, and a wider view', notice: 'offers, invitations, learning, travel, or a sense that more is possible; also over-committing or overspending', kind: 'an expansion transit' },
  Saturn: { theme: 'structure, responsibility, limits, and long-term commitment', notice: 'more responsibility, slower progress, clearer priorities, and the need to set or respect boundaries', kind: 'a structural, maturing transit, not a punishment' },
  Uranus: { theme: 'change, independence, and breaking routine', notice: 'unexpected news, restlessness, a wish for more freedom, or a sudden new idea', kind: 'a change-and-freedom transit' },
  Neptune: { theme: 'imagination, sensitivity, ideals, and softened boundaries', notice: 'inspiration, compassion, or creativity; also confusion, tiredness, or seeing a situation as you hope it is', kind: 'a slow, sensitizing transit' },
  Pluto: { theme: 'depth, power, and long-term change', notice: 'intense focus, letting go of what no longer fits, and conversations about control or trust', kind: 'a slow, deep-change transit' },
};

const TARGET_TOPIC: Record<string, string> = {
  Sun: 'your identity, direction, and vitality',
  Moon: 'your emotional security, home life, and daily comfort',
  Mercury: 'how you think, learn, and communicate',
  Venus: 'relationships, values, money, and what you enjoy',
  Mars: 'your drive, energy, and how you assert yourself',
  Jupiter: 'your beliefs, growth, and opportunities',
  Saturn: 'your responsibilities, standards, and long-term plans',
  Ascendant: 'how you present yourself, your body, and your personal direction',
  Descendant: 'close partnerships and one-on-one relationships',
  Midheaven: 'career, reputation, and public direction',
  IC: 'home, family, parents, roots, and your private foundation',
};

const AXIS: Record<string, { opposite: string; text: string }> = {
  IC: { opposite: 'MC', text: 'The IC sits exactly opposite the MC, so this also activates the home/private life versus career/public life axis. Changes at home and in your public direction often affect each other.' },
  Midheaven: { opposite: 'IC', text: 'The MC sits exactly opposite the IC, so this also activates the career/public life versus home/private life axis. Changes at work and at home often affect each other.' },
  Ascendant: { opposite: 'DSC', text: 'The Ascendant sits exactly opposite the Descendant, so this also activates the self versus partnership axis. How you show up and how your close relationships work tend to shift together.' },
  Descendant: { opposite: 'ASC', text: 'The Descendant sits exactly opposite the Ascendant, so this also activates the partnership versus self axis. Your relationships and your own personal direction tend to shift together.' },
};

const ASPECT_TONE: Record<MajorAspectName, string> = {
  conjunction: 'puts this directly on top of',
  opposition: 'pulls against, bringing awareness through other people or outside events, to',
  square: 'adds pressure that asks for adjustment to',
  trine: 'supports and eases',
  sextile: 'opens practical opportunities around',
};

const SPECIAL: Record<string, { meaning: string; watch: string }> = {
  'Saturn-conjunction-IC': {
    meaning: 'Saturn crossing the IC is a major home, family, and private-foundation transit. It can coincide with taking home, family, parents, property, your living situation, boundaries, roots, or emotional security more seriously. Old family roles or private structures may need restructuring so they can hold up for the long term. This is a structural, maturing transit, not a punishment, and it does not predict a specific event.',
    watch: 'More responsibility at home or toward family, decisions about where or how you live, repairs or long-term plans for a property, and a clearer sense of which family roles you want to keep.',
  },
  'Saturn-conjunction-Midheaven': {
    meaning: 'Saturn crossing the MC is a major career and reputation transit. It can coincide with more responsibility, recognition for sustained effort, or a clearer, more realistic sense of your long-term public direction. It is a structural transit, not a forecast of success or failure.',
    watch: 'Bigger responsibilities at work, evaluations or milestones, and decisions about which goals deserve your long-term effort.',
  },
  'Saturn-conjunction-Ascendant': {
    meaning: 'Saturn crossing the Ascendant marks a period of taking yourself, your health habits, and your personal direction more seriously. It often feels like growing into a more grounded version of yourself.',
    watch: 'Wanting more structure in daily life, being seen as more serious or responsible, and choosing commitments more carefully.',
  },
  'Saturn-conjunction-Descendant': {
    meaning: 'Saturn crossing the Descendant puts commitment and realism into close partnerships. Relationships may be clarified, formalized, or restructured so they rest on clear agreements.',
    watch: 'Conversations about commitment, fairness, and expectations with partners or close collaborators.',
  },
};

function durationLabel(start: Date, end: Date, openEnded: boolean): string {
  const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / DAY));
  const txt = days < 45 ? `about ${Math.round(days / 7)} week${Math.round(days / 7) === 1 ? '' : 's'}` : days < 540 ? `about ${Math.round(days / 30.44)} month${Math.round(days / 30.44) === 1 ? '' : 's'}` : `about ${(days / 365.25).toFixed(1)} years`;
  return openEnded ? `${txt}+ (continues past the scan window)` : txt;
}

/**
 * Personalized slow-planet transits for the selected chart, ordered by
 * priority (importance × tightness). Active-now transits stay visible even
 * when their next exact pass is later.
 */
export function computeMajorTransits(chart: NatalChart | null | undefined, opts: MajorTransitOptions = {}): MajorTransit[] {
  if (!chart?.planets) return [];
  const now = opts.now ?? new Date();
  const nowMs = now.getTime();
  const horizon = opts.horizonDays ?? 365;
  const lookback = opts.lookbackDays ?? 540;
  const startMs = nowMs - lookback * DAY;
  const endMs = nowMs + (horizon + 120) * DAY; // extra tail to find window ends
  const targets = getMajorTransitTargets(chart);
  const results: MajorTransit[] = [];

  for (const planet of MAJOR_TRANSIT_BODIES) {
    const body = BODY[planet];
    const series = new Map<number, number>();
    const lonAt = (ms: number) => {
      const key = Math.round(ms);
      let v = series.get(key);
      if (v === undefined) { v = getPlanetLongitudeExact(body, new Date(ms)); series.set(key, v); }
      return v;
    };
    const lonNow = getPlanetLongitudeExact(body, now);
    const lonTomorrow = getPlanetLongitudeExact(body, new Date(nowMs + DAY));
    const speed = norm180(lonTomorrow - lonNow);
    const motion: MajorTransitMotion = Math.abs(speed) < MEAN_SPEED[planet] * 0.12 ? 'Stationing' : speed > 0 ? 'Direct' : 'Retrograde';
    const orbLimit = ACTIVE_ORB[planet];

    for (const t of targets) {
      for (const asp of ASPECTS) {
        const pointLons = asp.angle === 0 || asp.angle === 180
          ? [normalizeLongitude(t.lon + asp.angle)]
          : [normalizeLongitude(t.lon + asp.angle), normalizeLongitude(t.lon - asp.angle)];
        const orbAt = (ms: number) => aspectOrb(lonAt(ms), t.lon, asp.angle);
        // Find the window (orb <= limit) that contains now or the first upcoming one.
        let wStart: number | null = null, wEnd: number | null = null;
        let inside = false, runStart = 0;
        for (let ms = startMs; ms <= endMs; ms += DAY) {
          const o = orbAt(ms);
          if (o <= orbLimit && !inside) { inside = true; runStart = ms; }
          if (o > orbLimit && inside) {
            inside = false;
            if (ms >= nowMs) { wStart = runStart; wEnd = ms; break; }
          }
        }
        if (wStart === null && inside) { wStart = runStart; wEnd = null; }
        if (wStart === null) continue;
        if (wStart > nowMs + horizon * DAY) continue;
        const winEnd = wEnd ?? endMs;
        const hits = pointLons
          .flatMap(p => findExactHits(planet, p, Math.max(startMs, wStart! - DAY), winEnd, lonAt))
          .sort((a, b) => a.ms - b.ms);
        if (!hits.length) continue; // a near-miss window without an exact hit is not a major exact transit
        const passes: ExactPassInfo[] = hits.map((h, i) => ({
          date: new Date(h.ms),
          motion: h.motion,
          label: hits.length === 1 ? `Exact (${h.motion.toLowerCase()})` : `${ordinal(i + 1)} pass (${h.motion.toLowerCase()})`,
          isPast: h.ms < nowMs,
        }));
        const next = passes.find(p => !p.isPast)?.date ?? null;
        const isActiveNow = wStart <= nowMs && winEnd >= nowMs;
        if (!isActiveNow && !next) continue;
        if (!isActiveNow && next && next.getTime() > nowMs + horizon * DAY) continue;

        const orb = orbAt(nowMs);
        const orbNext = aspectOrb(lonTomorrow, t.lon, asp.angle);
        const status: MajorTransitStatus = !isActiveNow ? 'Upcoming' : orb <= 0.25 ? 'Exact' : orbNext < orb ? 'Applying' : 'Separating';
        const natalHouse = t.isAngle ? null : houseForLongitude(chart, t.lon);
        const transitHouse = houseForLongitude(chart, lonNow);
        const key = `${planet}-${asp.name}-${t.name}`;
        const special = SPECIAL[key];
        const pt = PLANET_TRANSIT[planet];
        const topic = TARGET_TOPIC[t.name] ?? t.name;
        const houseCtx = natalHouse ? ` Your natal ${t.name} sits in the ${ordinal(natalHouse)} house, so this shows up through ${HOUSE_AREA[natalHouse]}.` : '';
        const transitCtx = transitHouse ? ` Transiting ${planet} is moving through your ${ordinal(transitHouse)} house (${HOUSE_AREA[transitHouse]}).` : '';
        const meaning = special?.meaning
          ?? `Transiting ${planet} ${ASPECT_TONE[asp.name]} ${topic}. ${planet} brings ${pt.theme}; this is ${pt.kind}.${houseCtx}`;
        const watchFor = special?.watch ?? `Around ${topic.replace(/^your /, 'your ')}: ${pt.notice}.`;
        const tightness = Math.max(0, 1 - orb / orbLimit);
        const soon = next ? Math.max(0, 1 - (next.getTime() - nowMs) / (horizon * DAY)) : 0.5;
        const priority = TRANSIT_WEIGHT[planet] * (TARGET_WEIGHT[t.name] ?? 2) * asp.weight * (1 + (isActiveNow ? tightness : 0) + 0.3 * soon);
        results.push({
          id: key,
          transitPlanet: planet,
          aspect: asp.name,
          aspectGlyph: asp.glyph,
          target: t.name,
          targetLabel: t.label,
          isAngle: t.isAngle,
          headline: `${GLYPH[planet]} ${planet} ${asp.glyph} ${t.isAngle ? t.label : `${GLYPH[t.name] ?? ''} ${t.name}`.trim()}`,
          transitPosition: formatPos(lonNow),
          targetPosition: formatPos(t.lon),
          currentOrb: Math.round(orb * 100) / 100,
          status,
          motion,
          passes,
          nextExact: next,
          windowStart: new Date(wStart),
          windowEnd: new Date(winEnd),
          windowOpenEnded: wEnd === null,
          durationLabel: durationLabel(new Date(wStart), new Date(winEnd), wEnd === null),
          isActiveNow,
          natalHouse,
          transitHouse,
          lifeArea: t.isAngle ? topic : natalHouse ? `${topic}, through ${HOUSE_AREA[natalHouse]} (${ordinal(natalHouse)} house)` : topic,
          meaning: `${meaning}${special ? '' : transitCtx}`,
          watchFor,
          axisNote: t.isAngle ? AXIS[t.name]?.text ?? null : null,
          priority,
        });
      }
    }
  }
  // An opposition to one angle is the same event as a conjunction to the
  // opposite angle; keep the conjunction (its card explains both ends).
  const OPP: Record<string, string> = { Ascendant: 'Descendant', Descendant: 'Ascendant', IC: 'Midheaven', Midheaven: 'IC' };
  const ids = new Set(results.map(r => r.id));
  const deduped = results.filter(r => !(r.isAngle && r.aspect === 'opposition' && ids.has(`${r.transitPlanet}-conjunction-${OPP[r.target]}`)));
  return deduped.sort((a, b) => b.priority - a.priority);
}

const HOUSE_AREA: Record<number, string> = {
  1: 'self-presentation and personal direction', 2: 'money, possessions, and self-worth', 3: 'communication, siblings, and daily learning',
  4: 'home, family, and roots', 5: 'creativity, romance, children, and play', 6: 'work routines and health habits',
  7: 'partnerships and one-on-one relationships', 8: 'shared money, trust, and intimacy', 9: 'study, travel, and beliefs',
  10: 'career and public reputation', 11: 'friends, groups, and future goals', 12: 'rest, privacy, and behind-the-scenes work',
};

/** Real exact passes of any planet Sun..Pluto to a natal longitude in a window, for detailed views. */
export function realExactPasses(transitPlanet: string, natalLon: number, aspectAngle: number, center: Date, spanDays: number): ExactPassInfo[] {
  const body = BODY[transitPlanet];
  if (!body) return [];
  const startMs = center.getTime() - spanDays * DAY;
  const endMs = center.getTime() + spanDays * DAY;
  const lonAt = (ms: number) => getPlanetLongitudeExact(body, new Date(ms));
  const points = aspectAngle === 0 || aspectAngle === 180 ? [natalLon + aspectAngle] : [natalLon + aspectAngle, natalLon - aspectAngle];
  const hits = points.flatMap(p => findExactHits(transitPlanet, normalizeLongitude(p), startMs, endMs, lonAt)).sort((a, b) => a.ms - b.ms);
  return hits.map((h, i) => ({
    date: new Date(h.ms), motion: h.motion, isPast: h.ms < center.getTime(),
    label: hits.length === 1 ? `Exact (${h.motion.toLowerCase()})` : `${ordinal(i + 1)} pass (${h.motion.toLowerCase()})`,
  }));
}
