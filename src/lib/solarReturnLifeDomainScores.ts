/**
 * Life Domain Scores — nature-weighted, tone-aware scoring
 *
 * Core principle: the NUMBER of planets tells you how ACTIVE an area is.
 * The NATURE of those planets tells you whether that activity is supportive,
 * challenging, or transformative. Saturn in the 7th doesn't mean "Exceptional Love" —
 * it means love is under maximum pressure.
 *
 * Two separate axes:
 *   1. Activity Level (0–10): How much cosmic energy touches this domain
 *   2. Tone Score (negative = challenging, positive = supportive): What KIND of energy
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
  Ceres: 'neutral',
  Pallas: 'neutral',
  Vesta: 'neutral',
  MC: 'neutral',
};

/* ── Tone Weights per planet (signed: positive = supportive, negative = challenging) ── */
/* These are DOMAIN-SPECIFIC for love; other domains use the default column */

interface PlanetWeightEntry {
  default: number;
  love?: number;
  career?: number;
  health?: number;
  growth?: number;
}

const PLANET_TONE_WEIGHTS: Record<string, PlanetWeightEntry> = {
  Venus:     { default: 2,    love: 3,    career: 1 },
  Jupiter:   { default: 2,    love: 2,    career: 2 },
  Sun:       { default: 1.5 },
  Moon:      { default: 1.5 },
  Mercury:   { default: 1 },
  Mars:      { default: -0.5, health: -1 },
  Saturn:    { default: -2,   love: -2,   career: -1.5 },
  Uranus:    { default: -1 },
  Neptune:   { default: -1.5, love: -1.5 },
  Pluto:     { default: -1 },
  Chiron:    { default: -0.5 },
  NorthNode: { default: 0.5 },
  Juno:      { default: 1,    love: 1.5 },
  Ceres:     { default: 0.5 },
  Pallas:    { default: 0 },
  Vesta:     { default: 0 },
  MC:        { default: 0,    career: 1.5 },
};

function getToneWeight(planet: string, domain: string): number {
  const entry = PLANET_TONE_WEIGHTS[planet];
  if (!entry) return 0;
  return (entry as any)[domain] ?? entry.default;
}

/* ── Retrograde modifier: malefic qualities intensify when Rx ── */
function retrogradeMultiplier(planet: string, isRetrograde: boolean): number {
  if (!isRetrograde) return 1;
  const nature = PLANET_NATURE[planet] || 'neutral';
  if (nature === 'malefic') return 1.5;   // Saturn Rx = even more restrictive
  if (nature === 'outer') return 1.3;      // outer Rx = more internalized disruption
  return 1;
}

/* ── Dignity modifier ── */
type Dignity = 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine' | 'none';

function dignityMultiplier(planet: string, dignity: Dignity): number {
  if (dignity === 'domicile' || dignity === 'exaltation') {
    const nature = PLANET_NATURE[planet] || 'neutral';
    // Benefics in dignity = stronger positive; malefics in dignity = stronger negative
    return 1.3;
  }
  if (dignity === 'detriment' || dignity === 'fall') {
    const nature = PLANET_NATURE[planet] || 'neutral';
    // Benefics weakened; malefics more problematic
    if (nature === 'benefic' || nature === 'luminary') return 0.7;
    if (nature === 'malefic') return 1.3;
    return 1;
  }
  return 1;
}

const PLANET_EFFECT: Record<string, Record<string, string>> = {
  Venus: { default: 'attraction & harmony' },
  Jupiter: { default: 'expansion & opportunity' },
  Saturn: { default: 'restriction & hard lessons' },
  Mars: { default: 'conflict & drive' },
  Uranus: { default: 'sudden change & disruption' },
  Neptune: { default: 'confusion & dissolving boundaries' },
  Pluto: { default: 'power struggles & transformation' },
  Chiron: { default: 'surfacing old wounds' },
  Sun: { default: 'core focus & identity' },
  Moon: { default: 'emotional needs' },
  Mercury: { default: 'communication & analysis' },
  NorthNode: { default: 'growth direction' },
  Juno: { default: 'partnership commitment' },
  Ceres: { default: 'nurturing & loss/return' },
  Pallas: { default: 'strategic pattern recognition' },
  Vesta: { default: 'sacred devotion & focus' },
  MC: { default: 'public direction' },
};

/* ── Types ── */

export interface DriverDetail {
  planet: string;
  house: number;
  effect: string;
  nature: PlanetNature;
  points: number;       // activity points (always positive)
  tonePoints: number;   // signed: + = supportive, - = challenging
}

export interface ScoreContribution {
  source: string;
  points: number;
  tonePoints?: number;
  reason: string;
  nature?: PlanetNature;
}

export type DomainTone = 'supportive' | 'challenging' | 'transformative' | 'mixed' | 'quiet';

export interface LifeDomainScore {
  domain: string;
  activityLevel: number;   // 0-10 raw activation (how BUSY this area is)
  toneScore: number;        // signed sum of nature weights (+ = good, - = hard)
  score: number;            // backward compat (= activityLevel)
  tone: DomainTone;
  label: string;
  drivers: DriverDetail[];
  driverSummaries: string[];
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
  Neptune: 'your intuition, illusions, and confusion',
  Pluto: 'deep transformation and power shifts',
  NorthNode: 'your growth direction this lifetime',
  Juno: 'what you need in committed partnership',
  Chiron: 'where your deepest wound becomes your greatest healing',
  Ceres: 'nurturing and cycles of loss and return',
  Pallas: 'strategic intelligence and pattern recognition',
  Vesta: 'sacred focus and devotion',
  MC: 'your career direction and public role',
};

// Activity weight — how much each planet activates a domain (always positive)
const PLANET_ACTIVITY_WEIGHT: Record<string, Record<string, number>> = {
  career: { Sun: 2, Saturn: 2, Jupiter: 1.5, Mars: 1.5, MC: 2, Venus: 1, Mercury: 1, Pluto: 1, Uranus: 1 },
  love: { Venus: 2.5, Moon: 1.5, Sun: 1.5, Mars: 1.5, Jupiter: 1, Juno: 1.5, Pluto: 1.5, Saturn: 2, Neptune: 1.5, Chiron: 1, Uranus: 1.5, Ceres: 0.8 },
  health: { Mars: 1.5, Saturn: 1.5, Moon: 1, Sun: 1, Neptune: 1, Chiron: 1, Pluto: 1 },
  growth: { Jupiter: 2, Neptune: 1.5, Pluto: 1.5, NorthNode: 2, Uranus: 1, Chiron: 1, Mercury: 1 },
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

/* ── Tone Calculation from weighted toneScore ── */

function calculateTone(toneScore: number, activityLevel: number): DomainTone {
  if (activityLevel < 2) return 'quiet';
  // Use ratio of tone to activity to determine overall character
  if (toneScore >= 2) return 'supportive';
  if (toneScore <= -2) return 'challenging';
  if (toneScore <= -0.5) return 'transformative';  // slightly negative = transformative
  return 'mixed';
}

/* ── Label Generation — tone-aware, no false positives ── */

function activityLabel(level: number, tone: DomainTone, toneScore: number): string {
  if (level < 2) return 'Quiet Background';
  if (level < 4) {
    if (tone === 'supportive') return 'Gently Supportive';
    if (tone === 'challenging') return 'Lightly Pressured';
    return 'Lightly Active';
  }
  if (level < 7) {
    if (tone === 'supportive') return 'Steadily Building';
    if (tone === 'challenging') return 'Actively Demanding';
    if (tone === 'transformative') return 'Steadily Transforming';
    return 'Active — Complex';
  }
  // 7+
  if (tone === 'supportive') return 'Flourishing';
  if (tone === 'challenging') return 'Under Intense Pressure';
  if (tone === 'transformative') return 'Deep Transformation';
  return 'Highly Active — Complex';
}

/* ── Advice Generation ── */

function generateAdvice(domain: string, level: number, tone: DomainTone, toneScore: number): string {
  if (domain === 'career') {
    if (tone === 'challenging') return 'Career is active but demanding — expect restructuring, harder lessons, and the need to prove yourself. Growth comes through persistence, not luck.';
    if (tone === 'transformative') return 'Your career is undergoing deep shifts — old roles or ambitions may need to die so new ones can emerge. Stay open to radical redirection.';
    if (tone === 'supportive' && level >= 6) return 'Professional momentum is real this year — benefic planets are supporting your work houses, making this a time to advance and expand.';
    if (level < 3) return 'Your career houses are quiet this year — focus on skill-building and preparation rather than big launches.';
    return 'Some career energy is present — stay engaged and responsive to what emerges without forcing big moves.';
  }
  if (domain === 'love') {
    if (tone === 'challenging') return 'Relationships are under intense pressure — expect hard conversations, boundary-setting, and restructuring of how you partner. This is Saturn\'s testing ground, not Venus\'s garden. Partnerships are being rebuilt from the foundations.';
    if (tone === 'transformative') return 'Love and intimacy are being transformed at a deep level — old patterns are breaking down. What emerges will be more authentic but the process is intense.';
    if (tone === 'supportive' && level >= 6) return 'Relationship houses are lit up by benefic planets — genuine warmth, connection, and romantic opportunity are available this year.';
    if (level < 3) return 'Relationship houses are quiet — invest in self-knowledge and let partnerships breathe.';
    return 'Relationship energy is present but mixed — both support and challenge are in play. Stay honest about what you need.';
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

export function calculateLifeDomainScores(analysis: SolarReturnAnalysis): LifeDomainScores {
  const domainKeys = ['career', 'love', 'health', 'growth'] as const;
  const results: Record<string, LifeDomainScore> = {};

  // Build retrograde lookup from analysis data
  const retrogradeSet = new Set<string>();
  for (const ov of (analysis.houseOverlays || [])) {
    if ((ov as any).retrograde || (ov as any).isRetrograde) {
      retrogradeSet.add(ov.planet);
    }
  }
  // Also check retrogrades array if present
  if ((analysis as any).retrogrades) {
    for (const r of (analysis as any).retrogrades) {
      if (typeof r === 'string') retrogradeSet.add(r);
      else if (r?.planet) retrogradeSet.add(r.planet);
    }
  }

  // Build dignity lookup
  const dignityMap: Record<string, Dignity> = {};
  for (const ov of (analysis.houseOverlays || [])) {
    if ((ov as any).dignity) {
      dignityMap[ov.planet] = (ov as any).dignity as Dignity;
    }
  }

  for (const domain of domainKeys) {
    let activity = 0;
    let toneTotal = 0;
    const allDrivers: DriverDetail[] = [];
    const breakdown: ScoreContribution[] = [];
    const houses = DOMAIN_HOUSES[domain];
    const activityWeights = PLANET_ACTIVITY_WEIGHT[domain];
    const houseReasons = HOUSE_REASONS[domain];

    // 1. House occupancy
    let houseOccupantCount = 0;
    for (const overlay of analysis.houseOverlays) {
      const h = overlay.srHouse || 0;
      if (houses.includes(h)) {
        const explicitWeight = activityWeights[overlay.planet];
        if (explicitWeight && explicitWeight > 0) {
          const diminish = houseOccupantCount >= 2 ? 0.5 : 1;
          const w = Math.min(explicitWeight, 1.5) * diminish;
          activity += w;
          houseOccupantCount++;
          const nature = getNature(overlay.planet);
          const effect = getEffect(overlay.planet);
          const houseDesc = houseReasons[h] || `house ${h}`;
          const planetDesc = PLANET_PLAIN[overlay.planet] || overlay.planet;

          // Tone calculation: apply nature weight + retrograde + dignity modifiers
          let rawTone = getToneWeight(overlay.planet, domain);
          const rxMult = retrogradeMultiplier(overlay.planet, retrogradeSet.has(overlay.planet));
          const digMult = dignityMultiplier(overlay.planet, dignityMap[overlay.planet] || 'none');
          const finalTone = rawTone * rxMult * digMult;
          toneTotal += finalTone;

          const rxNote = retrogradeSet.has(overlay.planet) ? ' (Rx — intensified)' : '';
          const digNote = dignityMap[overlay.planet] ? ` [${dignityMap[overlay.planet]}]` : '';

          allDrivers.push({ planet: overlay.planet, house: h, effect, nature, points: Math.round(w * 10) / 10, tonePoints: Math.round(finalTone * 10) / 10 });
          breakdown.push({
            source: `${overlay.planet}${rxNote} in ${ordinal(h)} House`,
            points: Math.round(w * 10) / 10,
            tonePoints: Math.round(finalTone * 10) / 10,
            reason: `${overlay.planet} (${planetDesc}) in ${ordinal(h)} House — ${houseDesc}. Nature: ${nature}${rxNote}${digNote}.${diminish < 1 ? ' (diminishing returns)' : ''}`,
            nature,
          });
        } else {
          const w = 0.2;
          activity += w;
          const nature = getNature(overlay.planet);
          let rawTone = getToneWeight(overlay.planet, domain) * 0.3; // minor presence = minor tone impact
          const rxMult = retrogradeMultiplier(overlay.planet, retrogradeSet.has(overlay.planet));
          const finalTone = rawTone * rxMult;
          toneTotal += finalTone;

          allDrivers.push({ planet: overlay.planet, house: h, effect: getEffect(overlay.planet), nature, points: w, tonePoints: Math.round(finalTone * 10) / 10 });
          breakdown.push({
            source: `${overlay.planet} in ${ordinal(h)} House`,
            points: w,
            tonePoints: Math.round(finalTone * 10) / 10,
            reason: `${overlay.planet} is present but not a key planet for ${domain} — minor activation`,
            nature,
          });
        }
      }
    }

    // 2. Sun/Moon bonus
    const sunH = analysis.sunHouse.house;
    if (sunH && houses.includes(sunH) && !allDrivers.some(d => d.planet === 'Sun')) {
      const w = 1.0;
      activity += w;
      const nature = getNature('Sun');
      const tp = getToneWeight('Sun', domain);
      toneTotal += tp;
      allDrivers.push({ planet: 'Sun', house: sunH, effect: getEffect('Sun'), nature, points: w, tonePoints: tp });
      breakdown.push({
        source: `Sun in ${ordinal(sunH)} House`,
        points: w,
        tonePoints: tp,
        reason: `Your Sun (core identity) lands in ${ordinal(sunH)} House — ${houseReasons[sunH] || ''}. This makes ${domain} a central theme.`,
        nature,
      });
    }
    const moonH = analysis.moonHouse.house;
    if (moonH && houses.includes(moonH) && !allDrivers.some(d => d.planet === 'Moon')) {
      const w = 0.7;
      activity += w;
      const nature = getNature('Moon');
      const tp = getToneWeight('Moon', domain);
      toneTotal += tp;
      allDrivers.push({ planet: 'Moon', house: moonH, effect: getEffect('Moon'), nature, points: w, tonePoints: tp });
      breakdown.push({
        source: `Moon in ${ordinal(moonH)} House`,
        points: w,
        tonePoints: tp,
        reason: `Your Moon (emotional needs) is in ${ordinal(moonH)} House — your feelings are drawn here.`,
        nature,
      });
    }

    // 3. Stelliums
    for (const st of analysis.stelliums) {
      if (st.locationType === 'house') {
        const hNum = parseInt(st.location, 10);
        if (!isNaN(hNum) && houses.includes(hNum)) {
          activity += 1.0;
          breakdown.push({
            source: `Stellium in ${ordinal(hNum)} House`,
            points: 1.0,
            reason: `3+ planets clustered in ${ordinal(hNum)} House (${houseReasons[hNum] || ''}) — concentrated energy`,
          });
        }
      }
    }

    // 4. Aspects — capped at 2 pts activity, but tone ALSO flows through
    const allAspects = [...analysis.srToNatalAspects, ...analysis.srInternalAspects];
    let aspectBoost = 0;
    let aspectToneBoost = 0;
    const aspectDetails: string[] = [];
    const MAX_ASPECT_CONTRIBUTION = 2.0;
    for (const asp of allAspects) {
      if (aspectBoost >= MAX_ASPECT_CONTRIBUTION) break;
      const p1w = activityWeights[asp.planet1] || 0;
      const p2w = activityWeights[asp.planet2] || 0;
      if (p1w > 0 || p2w > 0) {
        let weight: number;
        if (BENEFIC_ASPECTS.includes(asp.type)) {
          weight = 0.15;
        } else if (MALEFIC_ASPECTS.includes(asp.type)) {
          weight = 0.1;
        } else {
          weight = 0.05;
        }
        const remaining = MAX_ASPECT_CONTRIBUTION - aspectBoost;
        weight = Math.min(weight, remaining);
        activity += weight;
        aspectBoost += weight;

        // Aspect tone: benefic aspects between planets = slightly positive, hard aspects = slightly negative
        const isBeneficAspect = BENEFIC_ASPECTS.includes(asp.type);
        const aspectTone = isBeneficAspect ? 0.2 : -0.2;
        aspectToneBoost += aspectTone;

        aspectDetails.push(`${asp.planet1}-${asp.planet2} ${asp.type}`);
      }
    }
    if (aspectBoost > 0) {
      toneTotal += aspectToneBoost;
      breakdown.push({
        source: `Aspects (${aspectDetails.length} relevant)`,
        points: Math.round(aspectBoost * 10) / 10,
        tonePoints: Math.round(aspectToneBoost * 10) / 10,
        reason: `Relevant aspects: ${aspectDetails.slice(0, 4).join('; ')}${aspectDetails.length > 4 ? ` + ${aspectDetails.length - 4} more` : ''}. Capped at ${MAX_ASPECT_CONTRIBUTION}.`,
      });
    }

    // 5. Angular planets
    for (const ap of analysis.angularPlanets) {
      if ((activityWeights[ap] || 0) > 0) {
        const w = 0.4;
        activity += w;
        const nature = getNature(ap);
        const tp = getToneWeight(ap, domain) * 0.3; // angular = minor tone influence
        toneTotal += tp;
        allDrivers.push({ planet: ap, house: 0, effect: 'angular emphasis', nature, points: w, tonePoints: Math.round(tp * 10) / 10 });
        breakdown.push({
          source: `${ap} angular`,
          points: w,
          tonePoints: Math.round(tp * 10) / 10,
          reason: `${ap} (${PLANET_PLAIN[ap] || ap}) is on a chart angle — angular planets are louder in your year`,
          nature,
        });
      }
    }

    // 6. Saturn focus
    if (analysis.saturnFocus?.house && houses.includes(analysis.saturnFocus.house)) {
      if (!allDrivers.some(d => d.planet === 'Saturn')) {
        activity += 0.3;
        const tp = getToneWeight('Saturn', domain) * 0.5;
        toneTotal += tp;
        allDrivers.push({ planet: 'Saturn', house: analysis.saturnFocus.house, effect: getEffect('Saturn'), nature: 'malefic', points: 0.3, tonePoints: Math.round(tp * 10) / 10 });
        breakdown.push({
          source: `Saturn focus in ${ordinal(analysis.saturnFocus.house)} House`,
          points: 0.3,
          tonePoints: Math.round(tp * 10) / 10,
          reason: `Saturn brings serious work — it activates this area through demand, not ease`,
          nature: 'malefic',
        });
      }
    }

    const finalActivity = clamp(Math.round(activity * 10) / 10, 0, 10);
    const finalTone = Math.round(toneTotal * 10) / 10;
    const tone = calculateTone(finalTone, finalActivity);

    results[domain] = {
      domain: domain.charAt(0).toUpperCase() + domain.slice(1),
      activityLevel: finalActivity,
      toneScore: finalTone,
      score: finalActivity,
      tone,
      label: activityLabel(finalActivity, tone, finalTone),
      drivers: allDrivers,
      driverSummaries: allDrivers.slice(0, 6).map(d => `${d.planet} in ${ordinal(d.house)} House`),
      advice: generateAdvice(domain, finalActivity, tone, finalTone),
      breakdown,
    };
  }

  return results as unknown as LifeDomainScores;
}
