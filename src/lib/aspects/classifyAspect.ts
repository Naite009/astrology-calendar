/**
 * Canonical natal aspect classifier: aspect type comes ONLY from the actual
 * angular separation of the two ecliptic longitudes. Signs never decide the
 * aspect, and a tight orb to a disabled aspect (e.g. quincunx when only majors
 * are enabled) never borrows some other label.
 */
export interface AspectDef { name: string; angle: number }

export function angularSeparation(absA: number, absB: number): number {
  let sep = Math.abs((((absA - absB) % 360) + 360) % 360);
  if (sep > 180) sep = 360 - sep;
  return sep;
}

/** Tightest enabled aspect within its orb, or null. */
export function classifyAspect(
  sep: number,
  aspects: readonly AspectDef[],
  orbFor: (aspectName: string) => number,
): { name: string; angle: number; orb: number } | null {
  let best: { name: string; angle: number; orb: number } | null = null;
  for (const a of aspects) {
    const orb = Math.abs(sep - a.angle);
    if (orb > orbFor(a.name)) continue;
    if (!best || orb < best.orb) best = { name: a.name, angle: a.angle, orb };
  }
  return best;
}
