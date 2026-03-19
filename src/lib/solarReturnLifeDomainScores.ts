/**
 * Life Domain Scores (0-10)
 * Career, Love, Health, Growth — based on house emphasis and aspect patterns
 */

import { SolarReturnAnalysis, SRKeyAspect } from './solarReturnAnalysis';

export interface LifeDomainScore {
  domain: string;
  score: number;         // 0-10
  label: string;         // "Strong", "Moderate", etc.
  drivers: string[];     // what's feeding this score
  advice: string;        // 1 sentence
}

export interface LifeDomainScores {
  career: LifeDomainScore;
  love: LifeDomainScore;
  health: LifeDomainScore;
  growth: LifeDomainScore;
}

// Which houses feed each domain
const DOMAIN_HOUSES: Record<string, number[]> = {
  career: [2, 6, 10],
  love: [5, 7, 8],
  health: [1, 6, 12],
  growth: [3, 9, 12],
};

// Benefic/malefic aspect weighting
const BENEFIC_ASPECTS = ['Trine', 'Sextile'];
const MALEFIC_ASPECTS = ['Square', 'Opposition', 'Quincunx'];

// Planet weights per domain
const PLANET_DOMAIN_WEIGHTS: Record<string, Record<string, number>> = {
  career: { Sun: 2, Saturn: 2, Jupiter: 1.5, Mars: 1, MC: 2 },
  love: { Venus: 2.5, Moon: 1.5, Mars: 1, Jupiter: 1, Juno: 1.5 },
  health: { Mars: 1.5, Saturn: 1, Moon: 1, Sun: 1 },
  growth: { Jupiter: 2, Neptune: 1.5, Pluto: 1.5, NorthNode: 2, Uranus: 1 },
};

function scoreLabel(s: number): string {
  if (s >= 8) return 'Exceptional';
  if (s >= 6) return 'Strong';
  if (s >= 4) return 'Moderate';
  if (s >= 2) return 'Quiet';
  return 'Dormant';
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function calculateLifeDomainScores(analysis: SolarReturnAnalysis): LifeDomainScores {
  const domains = ['career', 'love', 'health', 'growth'] as const;
  const results: Record<string, LifeDomainScore> = {};

  for (const domain of domains) {
    let score = 3; // baseline
    const drivers: string[] = [];
    const houses = DOMAIN_HOUSES[domain];
    const planetWeights = PLANET_DOMAIN_WEIGHTS[domain];

    // 1. House occupancy — planets in domain houses
    for (const overlay of analysis.houseOverlays) {
      if (houses.includes(overlay.srHouse || 0)) {
        const w = planetWeights[overlay.planet] || 0.5;
        score += w;
        drivers.push(`${overlay.planet} in ${ordinal(overlay.srHouse!)} House`);
      }
    }

    // 2. Sun/Moon in domain houses
    if (analysis.sunHouse.house && houses.includes(analysis.sunHouse.house)) {
      score += 1.5;
      if (!drivers.some(d => d.startsWith('Sun'))) drivers.push(`Sun in ${ordinal(analysis.sunHouse.house)} House`);
    }
    if (analysis.moonHouse.house && houses.includes(analysis.moonHouse.house)) {
      score += 1;
      if (!drivers.some(d => d.startsWith('Moon'))) drivers.push(`Moon in ${ordinal(analysis.moonHouse.house)} House`);
    }

    // 3. Stelliums in domain houses
    for (const st of analysis.stelliums) {
      if (st.locationType === 'house') {
        const hNum = parseInt(st.location, 10);
        if (!isNaN(hNum) && houses.includes(hNum)) {
          score += 1.5;
          drivers.push(`Stellium in ${ordinal(hNum)} House`);
        }
      }
    }

    // 4. Aspects involving domain-relevant planets
    const allAspects = [...analysis.srToNatalAspects, ...analysis.srInternalAspects];
    for (const asp of allAspects) {
      const p1w = planetWeights[asp.planet1] || 0;
      const p2w = planetWeights[asp.planet2] || 0;
      if (p1w > 0 || p2w > 0) {
        const weight = Math.max(p1w, p2w) * 0.3;
        if (BENEFIC_ASPECTS.includes(asp.type)) {
          score += weight;
        } else if (MALEFIC_ASPECTS.includes(asp.type)) {
          score -= weight * 0.5; // challenges reduce but don't eliminate
        }
      }
    }

    // 5. Angular planets boost
    for (const ap of analysis.angularPlanets) {
      if ((planetWeights[ap] || 0) > 0) {
        score += 0.5;
        drivers.push(`${ap} angular`);
      }
    }

    // 6. Saturn in domain houses adds challenge but engagement
    if (analysis.saturnFocus?.house && houses.includes(analysis.saturnFocus.house)) {
      score += 0.5; // Saturn engages the domain even if hard
      drivers.push(`Saturn focus in ${ordinal(analysis.saturnFocus.house)} House`);
    }

    const finalScore = clamp(Math.round(score * 10) / 10, 0, 10);

    results[domain] = {
      domain: domain.charAt(0).toUpperCase() + domain.slice(1),
      score: Math.round(finalScore * 10) / 10,
      label: scoreLabel(finalScore),
      drivers: drivers.slice(0, 4),
      advice: generateAdvice(domain, finalScore),
    };
  }

  return results as LifeDomainScores;
}

function generateAdvice(domain: string, score: number): string {
  if (domain === 'career') {
    if (score >= 7) return 'This is a year of significant professional momentum — lean into visibility and ambition.';
    if (score >= 4) return 'Career developments are present but not the primary story — stay engaged without forcing.';
    return 'Career is in a quieter cycle — focus on skill-building and preparation rather than big moves.';
  }
  if (domain === 'love') {
    if (score >= 7) return 'Relationships are highly activated — be open to deep connection and meaningful encounters.';
    if (score >= 4) return 'Love is gently present — existing bonds deepen and new connections emerge organically.';
    return 'Romance is not the headline this year — invest in self-love and let partnerships breathe.';
  }
  if (domain === 'health') {
    if (score >= 7) return 'Physical vitality is emphasized — your body wants attention, movement, and intentional care.';
    if (score >= 4) return 'Health is steady — maintain routines and listen to subtle body signals.';
    return 'Health runs quietly in the background — preventative maintenance is your best strategy.';
  }
  // growth
  if (score >= 7) return 'This is a major growth year — expect paradigm shifts, new beliefs, and expanded horizons.';
  if (score >= 4) return 'Growth is happening through steady learning and incremental expansion of perspective.';
  return 'Inner growth is subtle this year — trust that seeds planted now will bloom in future cycles.';
}

function ordinal(n: number): string {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
