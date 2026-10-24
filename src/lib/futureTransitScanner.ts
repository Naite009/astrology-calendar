/**
 * Future Transit Scanner
 * 
 * Pre-computes upcoming outer planet (Jupiter–Pluto) aspects to personal natal planets
 * (Sun, Moon, Mercury, Venus, Mars) over the next 12–18 months.
 * Returns structured data the AI can use to populate timing_section transits.
 */

import * as Astronomy from 'astronomy-engine';
import { getPlanetLongitudeExact, aspectOrb, normalizeLongitude } from './transitMath';
import { findExactHits } from './transits/majorTransits';

const ZODIAC = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const OUTER_PLANETS: { name: string; body: Astronomy.Body }[] = [
  { name: 'Jupiter', body: Astronomy.Body.Jupiter },
  { name: 'Saturn', body: Astronomy.Body.Saturn },
  { name: 'Uranus', body: Astronomy.Body.Uranus },
  { name: 'Neptune', body: Astronomy.Body.Neptune },
  { name: 'Pluto', body: 'Pluto' as Astronomy.Body },
];

// Personal planets + chart angles + slow planets + nodes + Chiron.
// Including outer planets here lets us catch Jupiter Returns, Saturn Returns,
// Jupiter→Saturn, Jupiter→MC, transits to the Node, etc. — all of which
// were previously invisible because only the 5 personal planets were scanned.
const NATAL_TARGETS = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars',
  'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Chiron', 'NorthNode', 'North Node', 'SouthNode', 'South Node',
  'Ascendant', 'ASC', 'Midheaven', 'MC', 'Descendant', 'DSC', 'IC',
];

const MAJOR_ASPECTS = [
  { name: 'conjunction', angle: 0, orb: 3 },
  { name: 'sextile', angle: 60, orb: 2.5 },
  { name: 'square', angle: 90, orb: 3 },
  { name: 'trine', angle: 120, orb: 2.5 },
  { name: 'opposition', angle: 180, orb: 3 },
];

interface FutureTransitWindow {
  transitPlanet: string;
  aspect: string;
  natalPlanet: string;
  natalDegree: string; // e.g. "5°16' Cancer"
  exactDates: { date: string; label: string }[]; // exact hit dates with pass labels
  dateRange: string; // e.g. "Feb 1–Apr 20, 2026"
  enterDate: string;
  exitDate: string;
  isRetrograde: boolean;
  classification: 'exact-hit' | 'close-approach';
  closestOrb: number;
  closestDate: string;
}

function lonToSignDegree(lon: number): string {
  const normalized = normalizeLongitude(lon);
  const signIdx = Math.floor(normalized / 30);
  const deg = normalized - signIdx * 30;
  const wholeDeg = Math.floor(deg);
  const mins = Math.round((deg - wholeDeg) * 60);
  return `${wholeDeg}°${mins.toString().padStart(2, '0')}' ${ZODIAC[signIdx]}`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Scan future transits from outer planets to natal positions.
 * Returns structured windows for the AI to use.
 */
export function scanFutureTransits(
  natalPositions: { name: string; longitude: number }[],
  monthsAhead: number = 18,
): FutureTransitWindow[] {
  const now = new Date();
  const startMs = now.getTime();
  const endMs = startMs + monthsAhead * 30.44 * 86400000;
  const stepMs = 86400000;
  const results: FutureTransitWindow[] = [];
  for (const outer of OUTER_PLANETS) {
    const cache = new Map<number, number>();
    const lonAt = (ms: number) => {
      let lon = cache.get(ms);
      if (lon === undefined) { lon = getPlanetLongitudeExact(outer.body, new Date(ms)); cache.set(ms, lon); }
      return lon;
    };
    for (const natal of natalPositions) {
      if (!NATAL_TARGETS.includes(natal.name)) continue;
      for (const asp of MAJOR_ASPECTS) {
        let enter: number | null = null;
        let minOrb = Infinity, minMs = startMs;
        const finish = (exit: number) => {
          if (enter === null) return;
          const points = asp.angle === 0 || asp.angle === 180 ? [natal.longitude + asp.angle] : [natal.longitude + asp.angle, natal.longitude - asp.angle];
          const hits = points.flatMap(p => findExactHits(outer.name, normalizeLongitude(p), enter ?? startMs, exit, lonAt)).sort((a,b) => a.ms - b.ms);
          // Refine the actual closest approach; a station minimum is not an exact pass.
          let lo = Math.max(enter, minMs - stepMs), hi = Math.min(exit, minMs + stepMs);
          for (let j = 0; j < 35; j++) {
            const a = lo + (hi-lo)/3, b = hi - (hi-lo)/3;
            if (aspectOrb(lonAt(a), natal.longitude, asp.angle) < aspectOrb(lonAt(b), natal.longitude, asp.angle)) hi = b; else lo = a;
          }
          const closest = (lo+hi)/2;
          const closestOrb = aspectOrb(lonAt(closest), natal.longitude, asp.angle);
          results.push({ transitPlanet: outer.name, aspect: asp.name, natalPlanet: natal.name, natalDegree: lonToSignDegree(natal.longitude), exactDates: hits.map((h,i) => ({ date: new Date(h.ms).toISOString(), label: `Pass ${i+1}, ${h.motion}` })), dateRange: `${formatDate(new Date(enter))} to ${formatDate(new Date(exit))}`, enterDate: formatDate(new Date(enter)), exitDate: formatDate(new Date(exit)), isRetrograde: normalizeLongitude(lonAt(closest+3600000)-lonAt(closest-3600000)) > 180, classification: hits.length ? 'exact-hit' : 'close-approach', closestOrb, closestDate: new Date(closest).toISOString() });
          enter = null; minOrb = Infinity;
        };
        for (let ms = startMs; ms <= endMs; ms += stepMs) {
          const orb = aspectOrb(lonAt(ms), natal.longitude, asp.angle);
          if (orb <= asp.orb) {
            if (enter === null) enter = ms;
            if (orb < minOrb) { minOrb = orb; minMs = ms; }
          } else if (enter !== null) finish(ms);
        }
        if (enter !== null) finish(endMs);
      }
    }
  }

  // Sort by enter date
  results.sort((a, b) => new Date(a.enterDate).getTime() - new Date(b.enterDate).getTime());
  return results;
}

/**
 * Format future transits as a context string for the AI prompt.
 */
export function formatFutureTransitsContext(windows: FutureTransitWindow[]): string {
  if (windows.length === 0) return '';
  
  let ctx = '\n--- UPCOMING TRANSIT WINDOWS (next 18 months) ---\n';
  ctx += 'USE THESE to populate the timing_section transits array. Exact dates below are solver-confirmed. Close approaches are NOT exact hits; absence of a hit applies only to the scanned interval.\n\n';
  
  for (const w of windows) {
    ctx += `• ${w.transitPlanet} ${w.aspect} natal ${w.natalPlanet} at ${w.natalDegree}`;
    if (w.isRetrograde) ctx += ' (R)';
    ctx += `\n  Active: ${w.dateRange}\n`;
    if (!w.exactDates.length) ctx += `  Close approach only: ${w.closestDate}, minimum orb ${w.closestOrb.toFixed(4)}°. No exact hit in this window.\n`;
    for (const eh of w.exactDates) {
      ctx += `  Exact: ${eh.date}: ${eh.label}\n`;
    }
    ctx += '\n';
  }
  
  return ctx;
}
