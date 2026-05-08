/**
 * Pre-calculates every timed celestial event in the next 24 hours so the
 * cosmic-weather AI receives a complete, deterministic event list and never
 * has to infer or recall a time itself.
 *
 * STRICT RULE: every time field here is computed by astronomy-engine via
 * getPlanetaryPositions sampling. The AI is forbidden to invent, recall, or
 * compute its own times — it may only quote times from this array.
 */

import { getPlanetaryPositions, calculateDailyAspects } from './astrology';
import { findNextMoonSignChange, getVOCMoonDetails } from './voidOfCourseMoon';

export type TimedEventKind =
  | 'sign_ingress'
  | 'aspect_exact'
  | 'voc_start'
  | 'voc_end'
  | 'lunar_phase';

export interface TimedEvent {
  kind: TimedEventKind;
  iso: string;        // UTC ISO for ordering
  localTime: string;  // already-formatted in user's tz, e.g. "5:32 PM EST"
  description: string;
  // Optional structured fields per kind:
  planet?: string;
  fromSign?: string;
  toSign?: string;
  planet1?: string;
  planet2?: string;
  aspectType?: string;
  phaseName?: string;
}

const SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces',
];

const SIGN_GLYPH_TO_NAME: Record<string, string> = {
  '♈':'Aries','♉':'Taurus','♊':'Gemini','♋':'Cancer','♌':'Leo','♍':'Virgo',
  '♎':'Libra','♏':'Scorpio','♐':'Sagittarius','♑':'Capricorn','♒':'Aquarius','♓':'Pisces',
};

const ASPECT_ANGLES: Record<string, number> = {
  conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
};

const PLANET_KEYS = [
  'sun','moon','mercury','venus','mars','jupiter','saturn',
  'uranus','neptune','pluto','chiron',
] as const;

function planetSignName(p: any): string | null {
  if (!p) return null;
  return p.signName || SIGN_GLYPH_TO_NAME[p.sign] || p.sign || null;
}

function planetAbsLongitude(p: any): number | null {
  const sign = planetSignName(p);
  if (!sign) return null;
  const idx = SIGNS.indexOf(sign);
  if (idx < 0) return null;
  const deg = typeof p.rawDegree === 'number' ? p.rawDegree
    : typeof p.degree === 'number' ? p.degree
    : parseFloat(String(p.degree || 0));
  return idx * 30 + deg;
}

function angularSeparation(a: number, b: number): number {
  let d = Math.abs(a - b) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function fmtLocalTime(d: Date, tz: string, tzAbbr: string): string {
  return d.toLocaleTimeString('en-US', {
    timeZone: tz, hour: 'numeric', minute: '2-digit',
  }) + ' ' + tzAbbr;
}

interface BuildArgs {
  now: Date;
  userTimezone: string;
  userTzAbbr: string;
  /** Aspects already detected as currently active (with motion). */
  currentAspects: Array<{
    planet1: string; planet2: string; type: string;
    motion?: string; orb?: string | number;
  }>;
  /** Pre-known events from the existing pipeline. */
  moonSignChange?: { fromSign: string; toSign: string; time: string; iso?: string } | null;
  imminentSignChanges?: Array<{
    planet: string; currentSign: string; nextSign: string;
    ingressTime?: string; ingressIso?: string;
  }>;
  exactLunarPhase?: { type?: string; time?: string; iso?: string; name?: string } | null;
}

/**
 * Build the master 24h event list. Pure function — does no AI work.
 */
export function buildEvents24h(args: BuildArgs): TimedEvent[] {
  const { now, userTimezone, userTzAbbr } = args;
  const out: TimedEvent[] = [];
  const horizonMs = 24 * 60 * 60 * 1000;
  const end = new Date(now.getTime() + horizonMs);

  // 1) Pre-known: Moon sign change (already computed upstream).
  if (args.moonSignChange) {
    out.push({
      kind: 'sign_ingress',
      iso: args.moonSignChange.iso || new Date(args.moonSignChange.time).toISOString(),
      localTime: args.moonSignChange.time,
      description: `Moon enters ${args.moonSignChange.toSign}`,
      planet: 'Moon',
      fromSign: args.moonSignChange.fromSign,
      toSign: args.moonSignChange.toSign,
    });
  }

  // 2) Pre-known: Imminent ingresses for other planets.
  for (const c of args.imminentSignChanges || []) {
    if (!c.ingressTime) continue;
    out.push({
      kind: 'sign_ingress',
      iso: c.ingressIso || new Date(c.ingressTime).toISOString(),
      localTime: c.ingressTime,
      description: `${c.planet} enters ${c.nextSign}`,
      planet: c.planet,
      fromSign: c.currentSign,
      toSign: c.nextSign,
    });
  }

  // 3) Pre-known: Exact lunar phase (if today).
  if (args.exactLunarPhase?.time && args.exactLunarPhase.type) {
    out.push({
      kind: 'lunar_phase',
      iso: args.exactLunarPhase.iso || new Date(args.exactLunarPhase.time).toISOString(),
      localTime: args.exactLunarPhase.time,
      description: args.exactLunarPhase.name || args.exactLunarPhase.type,
      phaseName: args.exactLunarPhase.type,
    });
  }

  // 4) VOC start + end. We always recompute against ephemeris so the AI
  //    receives both endpoints as discrete events, even when the VOC straddles
  //    midnight or starts later in the day.
  try {
    const voc = getVOCMoonDetails(now);
    if (voc.isVOC && voc.start) {
      out.push({
        kind: 'voc_start',
        iso: voc.start.toISOString(),
        localTime: fmtLocalTime(voc.start, userTimezone, userTzAbbr),
        description: 'Moon goes void of course',
      });
    }
    if (voc.end && voc.end.getTime() <= end.getTime()) {
      out.push({
        kind: 'voc_end',
        iso: voc.end.toISOString(),
        localTime: fmtLocalTime(voc.end, userTimezone, userTzAbbr),
        description: voc.moonEntersSign
          ? `Moon enters ${voc.moonEntersSign} (VOC ends)`
          : 'Moon void of course ends',
      });
    }
  } catch { /* tolerate missing VOC data */ }

  // 5) Exact aspect perfection times for the active aspects, scanned by
  //    sampling planet longitudes every 10 min over the next 24h.
  const STEP_MS = 10 * 60 * 1000;
  const samples: Array<{ t: Date; pos: any }> = [];
  for (let t = now.getTime(); t <= end.getTime(); t += STEP_MS) {
    const dt = new Date(t);
    samples.push({ t: dt, pos: getPlanetaryPositions(dt) });
  }

  const lowerKey = (name: string) => {
    const k = name.charAt(0).toLowerCase() + name.slice(1);
    return k === 'northnode' ? 'northNode' : k === 'southnode' ? 'southNode' : k;
  };

  for (const a of args.currentAspects || []) {
    const target = ASPECT_ANGLES[a.type?.toLowerCase?.() || ''];
    if (target == null) continue;
    const k1 = lowerKey(a.planet1);
    const k2 = lowerKey(a.planet2);

    let bestIdx = -1;
    let bestDelta = Infinity;
    for (let i = 0; i < samples.length; i++) {
      const p1 = (samples[i].pos as any)[k1];
      const p2 = (samples[i].pos as any)[k2];
      const l1 = planetAbsLongitude(p1);
      const l2 = planetAbsLongitude(p2);
      if (l1 == null || l2 == null) continue;
      const sep = angularSeparation(l1, l2);
      const delta = Math.abs(sep - target);
      if (delta < bestDelta) { bestDelta = delta; bestIdx = i; }
    }
    // Only emit if perfection actually occurs in window (delta near zero).
    if (bestIdx >= 0 && bestDelta <= 0.25) {
      const t = samples[bestIdx].t;
      out.push({
        kind: 'aspect_exact',
        iso: t.toISOString(),
        localTime: fmtLocalTime(t, userTimezone, userTzAbbr),
        description: `${a.planet1} ${a.type} ${a.planet2} (exact)`,
        planet1: a.planet1,
        planet2: a.planet2,
        aspectType: a.type,
      });
    }
  }

  // De-dupe by (kind|description|iso minute) and sort chronologically.
  const seen = new Set<string>();
  const deduped: TimedEvent[] = [];
  for (const e of out) {
    const minuteIso = e.iso.slice(0, 16);
    const k = `${e.kind}|${e.description}|${minuteIso}`;
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(e);
  }
  deduped.sort((a, b) => a.iso.localeCompare(b.iso));
  return deduped;
}

/**
 * Render the event list as a strict text block for AI prompts.
 * The AI is told it MAY NOT use any time not present here.
 */
export function eventsToPromptBlock(events: TimedEvent[]): string {
  if (!events.length) {
    return `EVENTS_24H: (no timed celestial events in the next 24 hours — do NOT mention any specific times)`;
  }
  const lines = events.map(e => `- [${e.localTime}] ${e.description}`);
  return [
    `EVENTS_24H (the ONLY timed events allowed in your response):`,
    ...lines,
    ``,
    `STRICT RULE: every time you mention in your response MUST appear above.`,
    `If an event is not in this list, you MAY describe it generically without a time.`,
    `You may NOT calculate, recall, infer, or invent any time. No exceptions.`,
  ].join('\n');
}
