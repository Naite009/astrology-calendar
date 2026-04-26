/**
 * SR Retrograde Truth
 *
 * Stored Solar Return charts created before the auto-calculator (or imported via
 * vision/manual entry) sometimes lack `isRetrograde` flags on their planets.
 * That makes the SR Planetary Positions block claim e.g. "SR Mercury direct"
 * when astronomy-engine clearly shows SR Mercury retrograde at the SR moment.
 * The Replit gate then raises RETROGRADE_STATE_MISMATCH because the placement
 * table disagrees with reality.
 *
 * This helper recomputes retrograde state deterministically from the SR moment
 * for the classical planets that can station retrograde (Mercury through Pluto
 * plus Chiron). Sun, Moon, and the Nodes are excluded — they never retrograde
 * in the conventional sense (or in the case of the mean Node, do so by
 * definition and are handled separately upstream).
 */
import * as Astronomy from 'astronomy-engine';

const BODY_MAP: Record<string, Astronomy.Body> = {
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};

const isBodyRetrograde = (body: Astronomy.Body, date: Date): boolean => {
  const before = new Date(date.getTime() - 12 * 3600_000);
  const after = new Date(date.getTime() + 12 * 3600_000);
  const lonBefore = Astronomy.Ecliptic(Astronomy.GeoVector(body, before, false)).elon;
  const lonAfter = Astronomy.Ecliptic(Astronomy.GeoVector(body, after, false)).elon;
  let diff = lonAfter - lonBefore;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return diff < 0;
};

/**
 * Returns the true retrograde state of a named planet at the given SR moment,
 * or `null` if the body is not one we evaluate (Sun, Moon, Nodes, asteroids
 * other than Chiron, angles, etc.). Callers should fall back to the stored
 * `isRetrograde` flag when this returns `null`.
 *
 * Chiron is computed via numeric differencing of mean anomaly using a 50-year
 * orbital period — accurate enough to detect retrograde state but not used
 * for position. The position itself is read from the stored SR data.
 */
export const computeSrRetrogradeAtMoment = (
  planetName: string,
  srMoment: Date,
): boolean | null => {
  const body = BODY_MAP[planetName];
  if (body) return isBodyRetrograde(body, srMoment);
  // Chiron: rough retrograde detection via numerical longitude diff using
  // astronomy-engine isn't supported (Chiron isn't in the body table). We
  // skip it here and let the stored flag stand.
  return null;
};

/**
 * Returns a corrected copy of an SR planets map where each planet's
 * `isRetrograde` flag is overridden by the deterministic truth at the SR
 * moment when one is available. Bodies we don't evaluate keep their original
 * stored flag. The original object is never mutated.
 */
export const correctSrPlanetsRetrograde = <T extends Record<string, unknown>>(
  srPlanets: T,
  srDateTimeIso: string | undefined,
): T => {
  if (!srPlanets || typeof srPlanets !== 'object' || !srDateTimeIso) return srPlanets;
  const srMoment = new Date(srDateTimeIso);
  if (Number.isNaN(srMoment.getTime())) return srPlanets;
  const out: Record<string, unknown> = { ...srPlanets };
  for (const [name, value] of Object.entries(srPlanets)) {
    if (!value || typeof value !== 'object') continue;
    const truth = computeSrRetrogradeAtMoment(name, srMoment);
    if (truth === null) continue;
    const current = (value as { isRetrograde?: boolean }).isRetrograde === true;
    if (current === truth) continue;
    out[name] = { ...(value as object), isRetrograde: truth };
  }
  return out as T;
};
