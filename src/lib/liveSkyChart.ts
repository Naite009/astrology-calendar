// Generates a NatalChart-like object from the current sky using astronomy-engine
// Uses natural zodiac (Aries rising, equal 30° houses) for collective/educational view

import * as Astronomy from 'astronomy-engine';
import type { NatalChart } from '@/hooks/useNatalChart';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

const PLANET_BODIES: { key: string; body: Astronomy.Body }[] = [
  { key: 'Sun', body: Astronomy.Body.Sun },
  { key: 'Moon', body: Astronomy.Body.Moon },
  { key: 'Mercury', body: Astronomy.Body.Mercury },
  { key: 'Venus', body: Astronomy.Body.Venus },
  { key: 'Mars', body: Astronomy.Body.Mars },
  { key: 'Jupiter', body: Astronomy.Body.Jupiter },
  { key: 'Saturn', body: Astronomy.Body.Saturn },
  { key: 'Uranus', body: Astronomy.Body.Uranus },
  { key: 'Neptune', body: Astronomy.Body.Neptune },
  { key: 'Pluto', body: Astronomy.Body.Pluto },
];

function lonToSignDegree(lon: number): { sign: string; degree: number; minutes: number } {
  const normalized = ((lon % 360) + 360) % 360;
  const signIdx = Math.floor(normalized / 30);
  const inSign = normalized - signIdx * 30;
  const degree = Math.floor(inSign);
  const minutes = Math.round((inSign - degree) * 60);
  return { sign: ZODIAC_SIGNS[signIdx], degree, minutes };
}

export function buildLiveSkyChart(date: Date = new Date()): NatalChart {
  const planets: Record<string, { sign: string; degree: number; minutes: number; retrograde?: boolean }> = {};

  for (const { key, body } of PLANET_BODIES) {
    try {
      const vector = Astronomy.GeoVector(body, date, true);
      const ecliptic = Astronomy.Ecliptic(vector);
      const pos = lonToSignDegree(ecliptic.elon);

      // Check retrograde (compare to 1 day ago)
      let retrograde = false;
      if (key !== 'Sun' && key !== 'Moon') {
        try {
          const yesterday = new Date(date.getTime() - 86400000);
          const prevVector = Astronomy.GeoVector(body, yesterday, true);
          const prevEcliptic = Astronomy.Ecliptic(prevVector);
          let diff = ecliptic.elon - prevEcliptic.elon;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          retrograde = diff < 0;
        } catch { /* ignore */ }
      }

      planets[key] = { ...pos, retrograde };
    } catch { /* skip on error */ }
  }

  // North Node via Moon's ascending node
  try {
    const nodeResult = Astronomy.SearchMoonNode(new Date(date.getTime() - 30 * 86400000));
    if (nodeResult) {
      // Approximate: get Moon's node longitude
      // Use a simpler approach — the mean node moves ~19.3° per year retrograde
      const j2000 = new Date('2000-01-01T12:00:00Z');
      const daysSinceJ2000 = (date.getTime() - j2000.getTime()) / 86400000;
      const meanNodeLon = (125.044522 - 0.0529539 * daysSinceJ2000) % 360;
      const normalizedNode = ((meanNodeLon % 360) + 360) % 360;
      planets['NorthNode'] = lonToSignDegree(normalizedNode);
    }
  } catch {
    // Fallback mean node calculation
    const j2000 = new Date('2000-01-01T12:00:00Z');
    const daysSinceJ2000 = (date.getTime() - j2000.getTime()) / 86400000;
    const meanNodeLon = ((125.044522 - 0.0529539 * daysSinceJ2000) % 360 + 360) % 360;
    planets['NorthNode'] = lonToSignDegree(meanNodeLon);
  }

  // Natural zodiac: Aries rising, equal houses at 0° of each sign
  const houseCusps: Record<string, { sign: string; degree: number; minutes: number }> = {};
  for (let i = 0; i < 12; i++) {
    houseCusps[`house${i + 1}`] = { sign: ZODIAC_SIGNS[i], degree: 0, minutes: 0 };
  }

  return {
    id: '__live_sky__',
    name: 'Current Sky',
    birthDate: date.toISOString().slice(0, 10),
    birthTime: date.toTimeString().slice(0, 5),
    birthPlace: '',
    birthLocation: '',
    planets,
    houseCusps,
  } as unknown as NatalChart;
}
