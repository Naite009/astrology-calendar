/**
 * Life Domain Scores (0-10)
 * Career, Love, Health, Growth — based on house emphasis and aspect patterns
 * Every score shows exactly WHERE it came from in the chart
 */

import { SolarReturnAnalysis, SRKeyAspect } from './solarReturnAnalysis';

export interface ScoreContribution {
  source: string;       // e.g. "Venus in 7th House"
  points: number;       // how much it added/subtracted
  reason: string;       // plain English why this matters
}

export interface LifeDomainScore {
  domain: string;
  score: number;         // 0-10
  label: string;         // "Strong", "Moderate", etc.
  drivers: string[];     // what's feeding this score
  advice: string;        // 1 sentence
  breakdown: ScoreContribution[];  // full transparent math
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

// Plain-English house reasons per domain
const HOUSE_REASONS: Record<string, Record<number, string>> = {
  career: {
    2: 'income and earning power',
    6: 'daily work routines and job duties',
    10: 'public reputation and career direction',
  },
  love: {
    5: 'romance, dating, and creative self-expression',
    7: 'committed partnerships and one-on-one relationships',
    8: 'deep intimacy, shared resources, and emotional merging',
  },
  health: {
    1: 'your physical body and vitality',
    6: 'daily health habits and wellness routines',
    12: 'rest, recovery, and things you might ignore',
  },
  growth: {
    3: 'learning, curiosity, and new skills',
    9: 'big-picture beliefs, travel, and higher education',
    12: 'spiritual development and inner wisdom',
  },
};

// Benefic/malefic aspect weighting
const BENEFIC_ASPECTS = ['Trine', 'Sextile'];
const MALEFIC_ASPECTS = ['Square', 'Opposition', 'Quincunx'];

// Planet weights per domain — Sun now counts for love (identity IS part of relationships)
const PLANET_DOMAIN_WEIGHTS: Record<string, Record<string, number>> = {
  career: { Sun: 2, Saturn: 2, Jupiter: 1.5, Mars: 1, MC: 2 },
  love: { Venus: 2.5, Moon: 1.5, Sun: 1.5, Mars: 1, Jupiter: 1, Juno: 1.5, Pluto: 1 },
  health: { Mars: 1.5, Saturn: 1, Moon: 1, Sun: 1 },
  growth: { Jupiter: 2, Neptune: 1.5, Pluto: 1.5, NorthNode: 2, Uranus: 1 },
};

// What each planet actually does in plain English
const PLANET_PLAIN: Record<string, string> = {
  Sun: 'your identity and sense of self',
  Moon: 'your emotions and daily feelings',
  Mercury: 'how you think and communicate',
  Venus: 'what you love and value',
  Mars: 'your drive, energy, and desire',
  Jupiter: 'where you get lucky and expand',
  Saturn: 'where you work hardest and face tests',
  Uranus: 'where sudden changes happen',
  Neptune: 'your intuition and imagination',
  Pluto: 'deep transformation and power shifts',
  NorthNode: 'your growth direction this lifetime',
  Juno: 'what you need in committed partnership',
  MC: 'your career direction and public role',
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
    const breakdown: ScoreContribution[] = [];
    const houses = DOMAIN_HOUSES[domain];
    const planetWeights = PLANET_DOMAIN_WEIGHTS[domain];
    const houseReasons = HOUSE_REASONS[domain];

    breakdown.push({ source: 'Baseline', points: 3, reason: 'Every domain starts at 3 — a neutral starting point' });

    // 1. House occupancy — planets in domain houses
    for (const overlay of analysis.houseOverlays) {
      if (houses.includes(overlay.srHouse || 0)) {
        const w = planetWeights[overlay.planet] || 0.5;
        score += w;
        const houseDesc = houseReasons[overlay.srHouse!] || `house ${overlay.srHouse}`;
        const planetDesc = PLANET_PLAIN[overlay.planet] || overlay.planet;
        drivers.push(`${overlay.planet} in ${ordinal(overlay.srHouse!)} House`);
        breakdown.push({
          source: `${overlay.planet} in ${ordinal(overlay.srHouse!)} House`,
          points: w,
          reason: `${overlay.planet} (${planetDesc}) is sitting in your ${ordinal(overlay.srHouse!)} House — the house of ${houseDesc}`,
        });
      }
    }

    // 2. Sun/Moon in domain houses
    if (analysis.sunHouse.house && houses.includes(analysis.sunHouse.house)) {
      if (!drivers.some(d => d.startsWith('Sun'))) {
        score += 1.5;
        const houseDesc = houseReasons[analysis.sunHouse.house] || `house ${analysis.sunHouse.house}`;
        drivers.push(`Sun in ${ordinal(analysis.sunHouse.house)} House`);
        breakdown.push({
          source: `Sun in ${ordinal(analysis.sunHouse.house)} House`,
          points: 1.5,
          reason: `Your Sun (core identity for the year) lands in the ${ordinal(analysis.sunHouse.house)} House — ${houseDesc}. This makes ${domain} a central theme.`,
        });
      }
    }
    if (analysis.moonHouse.house && houses.includes(analysis.moonHouse.house)) {
      if (!drivers.some(d => d.startsWith('Moon'))) {
        score += 1;
        const houseDesc = houseReasons[analysis.moonHouse.house] || `house ${analysis.moonHouse.house}`;
        drivers.push(`Moon in ${ordinal(analysis.moonHouse.house)} House`);
        breakdown.push({
          source: `Moon in ${ordinal(analysis.moonHouse.house)} House`,
          points: 1,
          reason: `Your Moon (emotional needs) is in the ${ordinal(analysis.moonHouse.house)} House — ${houseDesc}. Your feelings are drawn here.`,
        });
      }
    }

    // 3. Stelliums in domain houses
    for (const st of analysis.stelliums) {
      if (st.locationType === 'house') {
        const hNum = parseInt(st.location, 10);
        if (!isNaN(hNum) && houses.includes(hNum)) {
          score += 1.5;
          const houseDesc = houseReasons[hNum] || `house ${hNum}`;
          drivers.push(`Stellium in ${ordinal(hNum)} House`);
          breakdown.push({
            source: `Stellium in ${ordinal(hNum)} House`,
            points: 1.5,
            reason: `3+ planets clustered in your ${ordinal(hNum)} House (${houseDesc}) — this is a major concentration of energy`,
          });
        }
      }
    }

    // 4. Aspects involving domain-relevant planets
    const allAspects = [...analysis.srToNatalAspects, ...analysis.srInternalAspects];
    let aspectBoost = 0;
    let aspectPenalty = 0;
    const aspectDetails: string[] = [];
    for (const asp of allAspects) {
      const p1w = planetWeights[asp.planet1] || 0;
      const p2w = planetWeights[asp.planet2] || 0;
      if (p1w > 0 || p2w > 0) {
        const weight = Math.max(p1w, p2w) * 0.3;
        if (BENEFIC_ASPECTS.includes(asp.type)) {
          score += weight;
          aspectBoost += weight;
          aspectDetails.push(`${asp.planet1}-${asp.planet2} ${asp.type} (+${weight.toFixed(1)})`);
        } else if (MALEFIC_ASPECTS.includes(asp.type)) {
          score -= weight * 0.5;
          aspectPenalty += weight * 0.5;
          aspectDetails.push(`${asp.planet1}-${asp.planet2} ${asp.type} (-${(weight * 0.5).toFixed(1)})`);
        }
      }
    }
    if (aspectBoost > 0 || aspectPenalty > 0) {
      const net = aspectBoost - aspectPenalty;
      breakdown.push({
        source: `Aspects (${aspectDetails.length} relevant)`,
        points: Math.round(net * 10) / 10,
        reason: `Helpful aspects (trines, sextiles) between ${domain}-related planets add points. Challenging aspects (squares, oppositions) subtract a smaller amount. Details: ${aspectDetails.slice(0, 5).join('; ')}${aspectDetails.length > 5 ? ` + ${aspectDetails.length - 5} more` : ''}`,
      });
    }

    // 5. Angular planets boost
    for (const ap of analysis.angularPlanets) {
      if ((planetWeights[ap] || 0) > 0) {
        score += 0.5;
        const planetDesc = PLANET_PLAIN[ap] || ap;
        drivers.push(`${ap} angular`);
        breakdown.push({
          source: `${ap} angular (on an angle)`,
          points: 0.5,
          reason: `${ap} (${planetDesc}) is on one of the 4 chart angles (Ascendant, MC, etc.) — angular planets are louder and more visible in your year`,
        });
      }
    }

    // 6. Saturn in domain houses adds challenge but engagement
    if (analysis.saturnFocus?.house && houses.includes(analysis.saturnFocus.house)) {
      score += 0.5;
      const houseDesc = houseReasons[analysis.saturnFocus.house] || `house ${analysis.saturnFocus.house}`;
      drivers.push(`Saturn focus in ${ordinal(analysis.saturnFocus.house)} House`);
      breakdown.push({
        source: `Saturn in ${ordinal(analysis.saturnFocus.house)} House`,
        points: 0.5,
        reason: `Saturn brings serious work and responsibility to ${houseDesc} — it activates this area even though it's demanding`,
      });
    }

    const finalScore = clamp(Math.round(score * 10) / 10, 0, 10);

    results[domain] = {
      domain: domain.charAt(0).toUpperCase() + domain.slice(1),
      score: Math.round(finalScore * 10) / 10,
      label: scoreLabel(finalScore),
      drivers: drivers.slice(0, 6),
      advice: generateAdvice(domain, finalScore),
      breakdown,
    };
  }

  return results as unknown as LifeDomainScores;
}

function generateAdvice(domain: string, score: number): string {
  if (domain === 'career') {
    if (score >= 7) return 'Multiple planets are activating your work and career houses — professional momentum is real this year.';
    if (score >= 4) return 'Some career energy is present but it\'s not the loudest theme — stay engaged without forcing big moves.';
    return 'Your career houses are quiet this year — focus on skill-building and preparation rather than big launches.';
  }
  if (domain === 'love') {
    if (score >= 7) return 'Your relationship houses (5th, 7th, 8th) have significant planetary activity — partnerships and intimacy are a headline story.';
    if (score >= 4) return 'Some relationship energy is present — existing bonds may deepen and new connections can emerge naturally.';
    return 'Your relationship houses don\'t have heavy planetary traffic this year — invest in self-knowledge and let partnerships breathe.';
  }
  if (domain === 'health') {
    if (score >= 7) return 'Planets are landing in your body and wellness houses (1st, 6th, 12th) — your physical self wants attention and care.';
    if (score >= 4) return 'Health is steady — maintain your routines and listen when your body sends signals.';
    return 'Your health houses are quiet — preventative maintenance and steady habits are your best strategy.';
  }
  // growth
  if (score >= 7) return 'Your 9th and 12th houses are activated — expect real shifts in how you see the world, possibly through travel, study, or inner work.';
  if (score >= 4) return 'Growth is happening through steady learning and gradually expanding your perspective.';
  return 'Inner growth is subtle this year — seeds planted now will become visible in future cycles.';
}

function ordinal(n: number): string {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
