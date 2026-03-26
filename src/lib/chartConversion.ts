/**
 * Shared helper to convert NatalChart data to ChartPlanet format
 * Used by both Chart Decoder and Life Patterns
 */
import { ChartPlanet } from './chartDecoderLogic';
import { NatalChart } from '@/hooks/useNatalChart';

const PLANET_NAMES = [
  'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto',
  'Chiron', 'NorthNode', 'SouthNode', 'Lilith', 'PartOfFortune', 'Vertex',
  'Ceres', 'Pallas', 'Juno', 'Vesta',
  'Psyche', 'Eros', 'Amor', 'Hygiea', 'Nessus', 'Pholus', 'Chariklo',
  'Eris', 'Sedna', 'Makemake', 'Haumea', 'Quaoar', 'Orcus', 'Ixion', 'Varuna', 'Gonggong', 'Salacia',
] as const;

const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];

const toAbsoluteDegree = (sign: string, degree: number): number => {
  const signIndex = SIGNS.indexOf(sign);
  return signIndex === -1 ? 0 : signIndex * 30 + degree;
};

const calculateHouse = (planetSign: string, planetDegree: number, chart: NatalChart): number | null => {
  if (!chart.houseCusps) return null;
  const planetAbsDeg = toAbsoluteDegree(planetSign, planetDegree);
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
    if (cusp) cusps.push(toAbsoluteDegree(cusp.sign, cusp.degree + (cusp.minutes || 0) / 60));
    else return null;
  }
  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i];
    const nextCusp = cusps[(i + 1) % 12];
    if (nextCusp < currentCusp) {
      if (planetAbsDeg >= currentCusp || planetAbsDeg < nextCusp) return i + 1;
    } else {
      if (planetAbsDeg >= currentCusp && planetAbsDeg < nextCusp) return i + 1;
    }
  }
  return 1;
};

export function convertToChartPlanets(chart: NatalChart): ChartPlanet[] {
  const planets: ChartPlanet[] = [];
  for (const name of PLANET_NAMES) {
    const pos = chart.planets[name as keyof typeof chart.planets];
    if (pos) {
      const degree = pos.degree + (pos.minutes || 0) / 60;
      planets.push({
        name,
        sign: pos.sign,
        degree,
        retrograde: pos.isRetrograde || false,
        house: calculateHouse(pos.sign, degree, chart)
      });
    }
  }
  return planets;
}
