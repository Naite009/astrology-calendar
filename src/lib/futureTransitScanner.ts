/**
 * Future Transit Scanner
 * 
 * Pre-computes upcoming outer planet (Jupiter–Pluto) aspects to personal natal planets
 * (Sun, Moon, Mercury, Venus, Mars) over the next 12–18 months.
 * Returns structured data the AI can use to populate timing_section transits.
 */

import * as Astronomy from 'astronomy-engine';
import { getPlanetLongitudeExact, aspectOrb, normalizeLongitude } from './transitMath';

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
  const endMs = now.getTime() + monthsAhead * 30.44 * 86400000;
  const stepMs = 5 * 86400000; // 5-day steps for scanning
  const results: FutureTransitWindow[] = [];

  for (const outer of OUTER_PLANETS) {
    for (const natal of natalPositions) {
      if (!NATAL_TARGETS.includes(natal.name)) continue;

      for (const asp of MAJOR_ASPECTS) {
        // Scan for periods where orb < threshold
        const threshold = asp.orb;
        let inWindow = false;
        let windowEnterMs = 0;
        let windowExitMs = 0;
        let minOrb = 999;
        let minOrbMs = 0;
        const exactHits: { ms: number; orb: number }[] = [];
        let prevOrb = 999;
        let prevPrevOrb = 999;

        for (let ms = now.getTime(); ms <= endMs; ms += stepMs) {
          const lon = getPlanetLongitudeExact(outer.body, new Date(ms));
          const orb = aspectOrb(lon, natal.longitude, asp.angle);

          if (orb <= threshold && !inWindow) {
            inWindow = true;
            windowEnterMs = ms;
            minOrb = orb;
            minOrbMs = ms;
          }

          if (inWindow && orb <= threshold) {
            if (orb < minOrb) {
              minOrb = orb;
              minOrbMs = ms;
            }
            // Detect local minima (exact hits)
            if (prevOrb < prevPrevOrb && prevOrb < orb && prevOrb < 1.0) {
              exactHits.push({ ms: ms - stepMs, orb: prevOrb });
            }
          }

          if (inWindow && orb > threshold) {
            windowExitMs = ms;
            inWindow = false;

            // If no exact hits found but we had a minimum, add it
            if (exactHits.length === 0 && minOrb < 1.5) {
              exactHits.push({ ms: minOrbMs, orb: minOrb });
            }

            if (exactHits.length > 0 || minOrb < 2.0) {
              // Check retrograde at midpoint
              const midMs = (windowEnterMs + windowExitMs) / 2;
              const midDate = new Date(midMs);
              const v1 = getPlanetLongitudeExact(outer.body, midDate);
              const v2 = getPlanetLongitudeExact(outer.body, new Date(midMs + 86400000));
              const isRetro = normalizeLongitude(v2 - v1 + 360) > 180;

              const enterDate = new Date(windowEnterMs);
              const exitDate = new Date(windowExitMs);

              // Label exact hits
              const labeled = exactHits.map((eh, i) => {
                let label = 'single pass';
                if (exactHits.length > 1) {
                  if (i === 0) label = 'Pass 1, Direct';
                  else if (i === exactHits.length - 1) label = `Pass ${i + 1}, Final Direct`;
                  else label = `Pass ${i + 1}, Retrograde`;
                }
                return { date: formatDate(new Date(eh.ms)), label };
              });

              // Build date range string
              const sameYear = enterDate.getFullYear() === exitDate.getFullYear();
              const dateRange = sameYear
                ? `${formatDateShort(enterDate)}–${formatDateShort(exitDate)}, ${enterDate.getFullYear()}`
                : `${formatDate(enterDate)}–${formatDate(exitDate)}`;

              results.push({
                transitPlanet: outer.name,
                aspect: asp.name,
                natalPlanet: natal.name,
                natalDegree: lonToSignDegree(natal.longitude),
                exactDates: labeled,
                dateRange,
                enterDate: formatDate(enterDate),
                exitDate: formatDate(exitDate),
                isRetrograde: isRetro,
              });
            }

            // Reset for next window
            exactHits.length = 0;
            minOrb = 999;
          }

          prevPrevOrb = prevOrb;
          prevOrb = orb;
        }

        // Handle window still open at end of scan
        if (inWindow && exactHits.length > 0) {
          const exitDate = new Date(endMs);
          const enterDate = new Date(windowEnterMs);
          const labeled = exactHits.map((eh, i) => ({
            date: formatDate(new Date(eh.ms)),
            label: exactHits.length === 1 ? 'single pass' : `Pass ${i + 1}`,
          }));
          const sameYear = enterDate.getFullYear() === exitDate.getFullYear();
          const dateRange = sameYear
            ? `${formatDateShort(enterDate)}–${formatDateShort(exitDate)}, ${enterDate.getFullYear()}`
            : `${formatDate(enterDate)}–${formatDate(exitDate)}`;

          results.push({
            transitPlanet: outer.name,
            aspect: asp.name,
            natalPlanet: natal.name,
            natalDegree: lonToSignDegree(natal.longitude),
            exactDates: labeled,
            dateRange,
            enterDate: formatDate(enterDate),
            exitDate: formatDate(exitDate),
            isRetrograde: false,
          });
        }
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
  ctx += 'USE THESE to populate the timing_section transits array. Each entry below is a verified astronomical event.\n\n';
  
  for (const w of windows) {
    ctx += `• ${w.transitPlanet} ${w.aspect} natal ${w.natalPlanet} at ${w.natalDegree}`;
    if (w.isRetrograde) ctx += ' (R)';
    ctx += `\n  Active: ${w.dateRange}\n`;
    for (const eh of w.exactDates) {
      ctx += `  Exact: ${eh.date} — ${eh.label}\n`;
    }
    ctx += '\n';
  }
  
  return ctx;
}
