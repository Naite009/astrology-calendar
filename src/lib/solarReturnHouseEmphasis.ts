/**
 * House Emphasis Summary
 * Identifies the 3 most active houses and provides theme descriptions.
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';

export interface HouseEmphasis {
  mostActiveHouses: number[];
  themes: Record<string, string>;
  summary: string;
}

const HOUSE_THEMES: Record<number, string> = {
  1: 'Identity, body, personal direction',
  2: 'Money, self-worth, income',
  3: 'Learning, communication, daily movement',
  4: 'Home, family, emotional roots',
  5: 'Creativity, romance, children, fun',
  6: 'Health, work routines, daily habits',
  7: 'Partnerships, marriage, contracts',
  8: 'Transformation, shared money, intimacy',
  9: 'Travel, education, philosophy, publishing',
  10: 'Career, public reputation, ambition',
  11: 'Friends, community, hopes, social networks',
  12: 'Spirituality, hidden matters, solitude, inner work',
};

const HOUSE_SHORT: Record<number, string> = {
  1: 'identity', 2: 'money', 3: 'communication', 4: 'home', 5: 'creativity',
  6: 'health', 7: 'relationships', 8: 'transformation', 9: 'expansion',
  10: 'career', 11: 'community', 12: 'inner work',
};

const MAJOR_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

export function buildHouseEmphasis(analysis: SolarReturnAnalysis): HouseEmphasis {
  const houseCounts: Record<number, number> = {};
  const planetSRHouses = analysis.planetSRHouses || {};

  // Count major planets per house
  for (const [planet, house] of Object.entries(planetSRHouses)) {
    if (!MAJOR_PLANETS.includes(planet)) continue;
    const h = typeof house === 'number' ? house : parseInt(String(house), 10);
    if (h >= 1 && h <= 12) {
      houseCounts[h] = (houseCounts[h] || 0) + 1;
    }
  }

  // Also count stelliums
  for (const stellium of (analysis.stelliums || [])) {
    const h = (stellium as any).house;
    if (h >= 1 && h <= 12) {
      houseCounts[h] = (houseCounts[h] || 0) + 1; // bonus for stellium
    }
  }

  // Angular houses get slight boost if they have planets
  for (const angH of [1, 4, 7, 10]) {
    if (houseCounts[angH]) houseCounts[angH] += 0.5;
  }

  const sorted = Object.entries(houseCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([h]) => parseInt(h));

  const themes: Record<string, string> = {};
  for (const h of sorted) {
    themes[String(h)] = HOUSE_THEMES[h] || `House ${h}`;
  }

  const summary = sorted.length > 0
    ? `This is primarily a ${sorted.map(h => ordinal(h)).join(', ')} house year — focused on ${sorted.map(h => HOUSE_SHORT[h] || '').filter(Boolean).join(', ')}.`
    : 'Activity is evenly distributed across the chart — no single life area dominates.';

  return { mostActiveHouses: sorted, themes, summary };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  if (v >= 11 && v <= 13) return n + 'th';
  return n + (s[v % 10] || s[0]);
}
