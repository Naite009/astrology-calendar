/**
 * Life Domain Scores — tone-aware scoring
 * Measures ACTIVITY LEVEL (0-10) + TONE (supportive/challenging/transformative/mixed)
 * Planet nature matters: benefics boost positively, malefics signal challenge, outers signal transformation
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';

/* ── Planet Nature Classification ── */

type PlanetNature = 'benefic' | 'malefic' | 'outer' | 'wound-healer' | 'neutral' | 'luminary';

const PLANET_NATURE: Record<string, PlanetNature> = {
  Sun: 'luminary',
  Moon: 'luminary',
  Mercury: 'neutral',
  Venus: 'benefic',
  Jupiter: 'benefic',
  Mars: 'malefic',
  Saturn: 'malefic',
  Uranus: 'outer',
  Neptune: 'outer',
  Pluto: 'outer',
  Chiron: 'wound-healer',
  NorthNode: 'neutral',
  Juno: 'neutral',
  MC: 'neutral',
};

const PLANET_EFFECT: Record<string, Record<string, string>> = {
  Venus: { default: 'attraction & harmony' },
  Jupiter: { default: 'expansion & opportunity' },
  Saturn: { default: 'restructuring & hard lessons' },
  Mars: { default: 'drive & friction' },
  Uranus: { default: 'sudden change & disruption' },
  Neptune: { default: 'dissolving illusions' },
  Pluto: { default: 'deep transformation' },
  Chiron: { default: 'healing old wounds' },
  Sun: { default: 'core focus & identity' },
  Moon: { default: 'emotional needs' },
  Mercury: { default: 'communication & analysis' },
  NorthNode: { default: 'growth direction' },
  Juno: { default: 'partnership commitment' },
  MC: { default: 'public direction' },
};

/* ── Types ── */

export interface DriverDetail {
  planet: string;
  house: number;
  effect: string;
  nature: PlanetNature;
  points: number;
}

export interface ScoreContribution {
  source: string;
  points: number;
  reason: string;
  nature?: PlanetNature;
}

export type DomainTone = 'supportive' | 'challenging' | 'transformative' | 'mixed' | 'quiet';

export interface LifeDomainScore {
  domain: string;
  activityLevel: number;   // 0-10 raw activation
  score: number;            // kept for backward compat (= activityLevel)
  tone: DomainTone;
  label: string;            // e.g. "Highly Active — Demanding"
  drivers: DriverDetail[];
  driverSummaries: string[]; // short strings for backward compat
  advice: string;
  breakdown: ScoreContribution[];
}

export interface LifeDomainScores {
  career: LifeDomainScore;
  love: LifeDomainScore;
  health: LifeDomainScore;
  growth: LifeDomainScore;
}

/* ── Domain Configuration ── */

const DOMAIN_HOUSES: Record<string, number[]> = {
  career: [2, 6, 10],
  love: [5, 7, 8],
  health: [1, 6, 12],
  growth: [3, 9, 12],
};

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
  Chiron: 'where your deepest wound becomes your greatest healing',
  MC: 'your career direction and public role',
};

// Activity weight — how much each planet activates a domain (regardless of tone)
const PLANET_ACTIVITY_WEIGHT: Record<string, Record<string, number>> = {
  career: { Sun: 2, Saturn: 2, Jupiter: 1.5, Mars: 1.5, MC: 2, Venus: 1, Mercury: 1 },
  love: { Venus: 2.5, Moon: 1.5, Sun: 1.5, Mars: 1.5, Jupiter: 1, Juno: 1.5, Pluto: 1.5, Saturn: 1.5, Neptune: 1.5, Chiron: 1, Uranus: 1 },
  health: { Mars: 1.5, Saturn: 1.5, Moon: 1, Sun: 1, Neptune: 1, Chiron: 1 },
  growth: { Jupiter: 2, Neptune: 1.5, Pluto: 1.5, NorthNode: 2, Uranus: 1, Chiron: 1 },
};

const BENEFIC_ASPECTS = ['Trine', 'Sextile'];
const MALEFIC_ASPECTS = ['Square', 'Opposition', 'Quincunx'];

/* ── Helpers ── */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getNature(planet: string): PlanetNature {
  return PLANET_NATURE[planet] || 'neutral';
}

function getEffect(planet: string): string {
  return PLANET_EFFECT[planet]?.default || 'activation';
}

/* ── Tone Calculation ── */

function calculateTone(drivers: DriverDetail[]): DomainTone {
  if (drivers.length === 0) return 'quiet';

  let beneficWeight = 0;
  let maleficWeight = 0;
  let outerWeight = 0;
  let woundWeight = 0;

  for (const d of drivers) {
    const w = Math.abs(d.points);
    switch (d.nature) {
      case 'benefic': beneficWeight += w; break;
      case 'malefic': maleficWeight += w; break;
      case 'outer': outerWeight += w; break;
      case 'wound-healer': woundWeight += w; break;
    }
  }

  const total = beneficWeight + maleficWeight + outerWeight + woundWeight;
  if (total === 0) return 'quiet';

  const beneficRatio = beneficWeight / total;
  const challengeRatio = (maleficWeight + woundWeight) / total;
  const outerRatio = outerWeight / total;

  if (outerRatio > 0.5) return 'transformative';
  if (challengeRatio > 0.6) return 'challenging';
  if (beneficRatio > 0.6) return 'supportive';
  return 'mixed';
}

/* ── Label Generation ── */

function activityLabel(level: number, tone: DomainTone): string {
  const intensity = level >= 8 ? 'Highly Active' : level >= 5 ? 'Active' : level >= 3 ? 'Lightly Active' : 'Quiet';
  const toneWord: Record<DomainTone, string> = {
    supportive: 'Supportive',
    challenging: 'Demanding',
    transformative: 'Transformative',
    mixed: 'Complex',
    quiet: '',
  };
  const tw = toneWord[tone];
  return tw ? `${intensity} — ${tw}` : intensity;
}

/* ── Advice Generation ── */

function generateAdvice(domain: string, level: number, tone: DomainTone): string {
  if (domain === 'career') {
    if (tone === 'challenging') return 'Career is active but demanding — expect restructuring, harder lessons, and the need to prove yourself. Growth comes through persistence, not luck.';
    if (tone === 'transformative') return 'Your career is undergoing deep shifts — old roles or ambitions may need to die so new ones can emerge. Stay open to radical redirection.';
    if (tone === 'supportive' && level >= 6) return 'Professional momentum is real this year — benefic planets are supporting your work houses, making this a time to advance and expand.';
    if (level < 3) return 'Your career houses are quiet this year — focus on skill-building and preparation rather than big launches.';
    return 'Some career energy is present — stay engaged and responsive to what emerges without forcing big moves.';
  }
  if (domain === 'love') {
    if (tone === 'challenging') return 'Relationships are under intense pressure — expect hard conversations, boundary-setting, and restructuring of how you partner. This is maturation, not romance.';
    if (tone === 'transformative') return 'Love and intimacy are being transformed at a deep level — old patterns are breaking down. What emerges will be more authentic but the process is intense.';
    if (tone === 'supportive' && level >= 6) return 'Relationship houses are lit up by benefic planets — genuine warmth, connection, and romantic opportunity are available this year.';
    if (level < 3) return 'Relationship houses are quiet — invest in self-knowledge and let partnerships breathe.';
    return 'Some relationship energy is present — existing bonds may deepen and new connections can emerge, but check the tone for how.';
  }
  if (domain === 'health') {
    if (tone === 'challenging') return 'Health requires active attention — stress, overwork, or ignored signals may surface. Prevention and boundaries around energy are essential.';
    if (tone === 'transformative') return 'Your body and wellness routines want a complete overhaul — what worked before may not work now. Listen to unfamiliar signals.';
    if (tone === 'supportive' && level >= 6) return 'Supportive energy in your health houses — a good year to establish new wellness habits that actually stick.';
    if (level < 3) return 'Health houses are quiet — steady maintenance is your best strategy.';
    return 'Health is moderately active — maintain routines and listen when your body sends signals.';
  }
  // growth
  if (tone === 'challenging') return 'Growth comes through difficulty this year — the lessons are real but uncomfortable. What you learn under pressure will last.';
  if (tone === 'transformative') return 'Expect real shifts in how you see the world — through travel, study, crisis, or inner work. Your worldview is being rebuilt.';
  if (tone === 'supportive' && level >= 6) return 'Expansion and learning flow naturally — opportunities for education, travel, or spiritual deepening are genuinely available.';
  if (level < 3) return 'Inner growth is subtle this year — seeds planted now will become visible in future cycles.';
  return 'Growth is happening through steady learning and gradually expanding your perspective.';
}

/* ── Main Scoring Engine ── */

/**
 * Scoring philosophy: Activity level 0-10 should feel like a real spread.
 * - 0-2: Quiet — very few planets touching this area
 * - 3-4: Lightly Active — some energy but not a focus
 * - 5-6: Active — real things happening here
 * - 7-8: Highly Active — this is a major theme of the year
 * - 9-10: Exceptional — rare, requires stellium + angular + multiple aspects
 *
 * Most domains for most charts should land 2-6. Hitting 8+ should be uncommon.
 */

export function calculateLifeDomainScores(analysis: SolarReturnAnalysis): LifeDomainScores {
  const domainKeys = ['career', 'love', 'health', 'growth'] as const;
  const results: Record<string, LifeDomainScore> = {};

  for (const domain of domainKeys) {
    let activity = 0; // start at zero — earn every point
    const allDrivers: DriverDetail[] = [];
    const breakdown: ScoreContribution[] = [];
    const houses = DOMAIN_HOUSES[domain];
    const activityWeights = PLANET_ACTIVITY_WEIGHT[domain];
    const houseReasons = HOUSE_REASONS[domain];

    // 1. House occupancy — only planets with explicit weight for this domain count significantly
    let houseOccupantCount = 0;
    for (const overlay of analysis.houseOverlays) {
      const h = overlay.srHouse || 0;
      if (houses.includes(h)) {
        const explicitWeight = activityWeights[overlay.planet];
        if (explicitWeight && explicitWeight > 0) {
          // Diminishing returns: first 2 planets full weight, then halved
          const diminish = houseOccupantCount >= 2 ? 0.5 : 1;
          const w = Math.min(explicitWeight, 1.5) * diminish; // cap individual contribution
          activity += w;
          houseOccupantCount++;
          const nature = getNature(overlay.planet);
          const effect = getEffect(overlay.planet);
          const houseDesc = houseReasons[h] || `house ${h}`;
          const planetDesc = PLANET_PLAIN[overlay.planet] || overlay.planet;

          allDrivers.push({ planet: overlay.planet, house: h, effect, nature, points: Math.round(w * 10) / 10 });
          breakdown.push({
            source: `${overlay.planet} in ${ordinal(h)} House`,
            points: Math.round(w * 10) / 10,
            reason: `${overlay.planet} (${planetDesc}) is in your ${ordinal(h)} House — ${houseDesc}. Nature: ${nature}.${diminish < 1 ? ' (diminishing returns — 3rd+ planet in domain houses)' : ''}`,
            nature,
          });
        }
        // Planets without explicit weight for this domain: minimal contribution
        else {
          const w = 0.2;
          activity += w;
          const nature = getNature(overlay.planet);
          allDrivers.push({ planet: overlay.planet, house: h, effect: getEffect(overlay.planet), nature, points: w });
          breakdown.push({
            source: `${overlay.planet} in ${ordinal(h)} House`,
            points: w,
            reason: `${overlay.planet} is present but not a key planet for ${domain} — minor activation`,
            nature,
          });
        }
      }
    }

    // 2. Sun/Moon bonus ONLY if in domain houses AND not already counted
    const sunH = analysis.sunHouse.house;
    if (sunH && houses.includes(sunH) && !allDrivers.some(d => d.planet === 'Sun')) {
      const w = 1.0;
      activity += w;
      const nature = getNature('Sun');
      allDrivers.push({ planet: 'Sun', house: sunH, effect: getEffect('Sun'), nature, points: w });
      breakdown.push({
        source: `Sun in ${ordinal(sunH)} House`,
        points: w,
        reason: `Your Sun (core identity for the year) lands in the ${ordinal(sunH)} House — ${houseReasons[sunH] || ''}. This makes ${domain} a central theme.`,
        nature,
      });
    }
    const moonH = analysis.moonHouse.house;
    if (moonH && houses.includes(moonH) && !allDrivers.some(d => d.planet === 'Moon')) {
      const w = 0.7;
      activity += w;
      const nature = getNature('Moon');
      allDrivers.push({ planet: 'Moon', house: moonH, effect: getEffect('Moon'), nature, points: w });
      breakdown.push({
        source: `Moon in ${ordinal(moonH)} House`,
        points: w,
        reason: `Your Moon (emotional needs) is in the ${ordinal(moonH)} House — your feelings are drawn here.`,
        nature,
      });
    }

    // 3. Stelliums — meaningful but not overwhelming
    for (const st of analysis.stelliums) {
      if (st.locationType === 'house') {
        const hNum = parseInt(st.location, 10);
        if (!isNaN(hNum) && houses.includes(hNum)) {
          activity += 1.0;
          breakdown.push({
            source: `Stellium in ${ordinal(hNum)} House`,
            points: 1.0,
            reason: `3+ planets clustered in your ${ordinal(hNum)} House (${houseReasons[hNum] || ''}) — concentrated energy`,
          });
        }
      }
    }

    // 4. Aspects — ONLY count aspects where BOTH planets are relevant to this domain
    // AND apply heavy diminishing returns (max 2 pts total from aspects)
    const allAspects = [...analysis.srToNatalAspects, ...analysis.srInternalAspects];
    let aspectBoost = 0;
    const aspectDetails: string[] = [];
    const MAX_ASPECT_CONTRIBUTION = 2.0;
    for (const asp of allAspects) {
      if (aspectBoost >= MAX_ASPECT_CONTRIBUTION) break;
      const p1w = activityWeights[asp.planet1] || 0;
      const p2w = activityWeights[asp.planet2] || 0;
      // At least one planet must be a key player for this domain
      if (p1w > 0 || p2w > 0) {
        let weight: number;
        if (BENEFIC_ASPECTS.includes(asp.type)) {
          weight = 0.15; // small per aspect
        } else if (MALEFIC_ASPECTS.includes(asp.type)) {
          weight = 0.1;
        } else {
          weight = 0.05; // conjunctions etc
        }
        const remaining = MAX_ASPECT_CONTRIBUTION - aspectBoost;
        weight = Math.min(weight, remaining);
        activity += weight;
        aspectBoost += weight;
        aspectDetails.push(`${asp.planet1}-${asp.planet2} ${asp.type}`);
      }
    }
    if (aspectBoost > 0) {
      breakdown.push({
        source: `Aspects (${aspectDetails.length} relevant)`,
        points: Math.round(aspectBoost * 10) / 10,
        reason: `Relevant aspects add activation — capped at ${MAX_ASPECT_CONTRIBUTION} total. ${aspectDetails.slice(0, 4).join('; ')}${aspectDetails.length > 4 ? ` + ${aspectDetails.length - 4} more` : ''}`,
      });
    }

    // 5. Angular planets — only if they matter for this domain
    for (const ap of analysis.angularPlanets) {
      if ((activityWeights[ap] || 0) > 0) {
        const w = 0.4;
        activity += w;
        const nature = getNature(ap);
        allDrivers.push({ planet: ap, house: 0, effect: 'angular emphasis', nature, points: w });
        breakdown.push({
          source: `${ap} angular`,
          points: w,
          reason: `${ap} (${PLANET_PLAIN[ap] || ap}) is on a chart angle — angular planets are louder in your year`,
          nature,
        });
      }
    }

    // 6. Saturn focus — adds a touch if in domain houses
    if (analysis.saturnFocus?.house && houses.includes(analysis.saturnFocus.house)) {
      if (!allDrivers.some(d => d.planet === 'Saturn')) {
        activity += 0.3;
        allDrivers.push({ planet: 'Saturn', house: analysis.saturnFocus.house, effect: getEffect('Saturn'), nature: 'malefic', points: 0.3 });
        breakdown.push({
          source: `Saturn focus in ${ordinal(analysis.saturnFocus.house)} House`,
          points: 0.3,
          reason: `Saturn brings serious work — it activates this area through demand, not ease`,
          nature: 'malefic',
        });
      }
    }

    const finalActivity = clamp(Math.round(activity * 10) / 10, 0, 10);
    const tone = calculateTone(allDrivers);

    results[domain] = {
      domain: domain.charAt(0).toUpperCase() + domain.slice(1),
      activityLevel: finalActivity,
      score: finalActivity,
      tone,
      label: activityLabel(finalActivity, tone),
      drivers: allDrivers,
      driverSummaries: allDrivers.slice(0, 6).map(d => `${d.planet} in ${ordinal(d.house)} House`),
      advice: generateAdvice(domain, finalActivity, tone),
      breakdown,
    };
  }

  return results as unknown as LifeDomainScores;
}
