/**
 * Life Domain Scores — nature-weighted, tone-aware scoring
 *
 * 10 life domains scored on two axes:
 *   1. Activity Level (0–10): How much cosmic energy touches this domain
 *   2. Tone Score (signed float): What KIND of energy (positive = supportive, negative = challenging)
 */

import { SolarReturnAnalysis } from './solarReturnAnalysis';

const HOUSE_PLAIN_LDS: Record<number, string> = {
  1: 'identity and self-image', 2: 'finances and self-worth', 3: 'communication and learning',
  4: 'home and family', 5: 'creativity and romance', 6: 'health and daily routines',
  7: 'partnerships and relationships', 8: 'shared resources and deep change', 9: 'travel and big-picture goals',
  10: 'career and public role', 11: 'friendships and community', 12: 'inner work and quiet reflection',
};

/* ── Planet Nature Classification ── */

type PlanetNature = 'benefic' | 'malefic' | 'outer' | 'wound-healer' | 'neutral' | 'luminary';

const PLANET_NATURE: Record<string, PlanetNature> = {
  Sun: 'luminary', Moon: 'luminary', Mercury: 'neutral', Venus: 'benefic',
  Jupiter: 'benefic', Mars: 'malefic', Saturn: 'malefic', Uranus: 'outer',
  Neptune: 'outer', Pluto: 'outer', Chiron: 'wound-healer', NorthNode: 'neutral',
  Juno: 'neutral', Ceres: 'neutral', Pallas: 'neutral', Vesta: 'neutral', MC: 'neutral',
};

/* ── Tone Weights per planet (domain-specific overrides) ── */

interface PlanetWeightEntry {
  default: number;
  love?: number; career?: number; health?: number; growth?: number;
  money?: number; home?: number; friendships?: number; creativity?: number;
  spirituality?: number; power?: number;
}

const PLANET_TONE_WEIGHTS: Record<string, PlanetWeightEntry> = {
  Venus:     { default: 2,    love: 3,    career: 1,  creativity: 2.5, friendships: 2, money: 1.5 },
  Jupiter:   { default: 2,    love: 2,    career: 2,  money: 2.5, friendships: 2, spirituality: 2 },
  Sun:       { default: 1.5,  creativity: 2 },
  Moon:      { default: 1.5,  home: 2.5,  health: 1 },
  Mercury:   { default: 1,    growth: 1.5 },
  Mars:      { default: -0.5, health: -1, power: 0.5 },
  Saturn:    { default: -2,   love: -2,   career: -1.5, home: -1.5, power: -1 },
  Uranus:    { default: -1,   creativity: 0.5 },
  Neptune:   { default: -1.5, love: -1.5, spirituality: 2, creativity: 1 },
  Pluto:     { default: -1,   power: 1.5, spirituality: 0.5 },
  Chiron:    { default: -0.5, spirituality: 1, health: -1 },
  NorthNode: { default: 0.5,  growth: 1.5, spirituality: 1 },
  Juno:      { default: 1,    love: 1.5 },
  Ceres:     { default: 0.5,  home: 1.5 },
  Pallas:    { default: 0,    career: 0.5 },
  Vesta:     { default: 0,    spirituality: 1 },
  MC:        { default: 0,    career: 1.5 },
};

function getToneWeight(planet: string, domain: string): number {
  const entry = PLANET_TONE_WEIGHTS[planet];
  if (!entry) return 0;
  return (entry as any)[domain] ?? entry.default;
}

/* ── Retrograde & Dignity modifiers ── */

function retrogradeMultiplier(planet: string, isRetrograde: boolean): number {
  if (!isRetrograde) return 1;
  const nature = PLANET_NATURE[planet] || 'neutral';
  if (nature === 'malefic') return 1.5;
  if (nature === 'outer') return 1.3;
  return 1;
}

type Dignity = 'domicile' | 'exaltation' | 'detriment' | 'fall' | 'peregrine' | 'none';

function dignityMultiplier(planet: string, dignity: Dignity): number {
  if (dignity === 'domicile' || dignity === 'exaltation') return 1.3;
  if (dignity === 'detriment' || dignity === 'fall') {
    const nature = PLANET_NATURE[planet] || 'neutral';
    if (nature === 'benefic' || nature === 'luminary') return 0.7;
    if (nature === 'malefic') return 1.3;
  }
  return 1;
}

const PLANET_EFFECT: Record<string, string> = {
  Venus: 'attraction & harmony', Jupiter: 'expansion & opportunity',
  Saturn: 'restriction & hard lessons', Mars: 'conflict & drive',
  Uranus: 'sudden change & disruption', Neptune: 'confusion & dissolving boundaries',
  Pluto: 'power struggles & transformation', Chiron: 'surfacing old wounds',
  Sun: 'core focus & identity', Moon: 'emotional needs',
  Mercury: 'communication & analysis', NorthNode: 'growth direction',
  Juno: 'partnership commitment', Ceres: 'nurturing & loss/return',
  Pallas: 'strategic pattern recognition', Vesta: 'sacred devotion & focus',
  MC: 'public direction',
};

/* ── Types ── */

export interface DriverDetail {
  planet: string;
  house: number;
  effect: string;
  nature: PlanetNature;
  points: number;
  tonePoints: number;
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
  domainKey: string;
  activityLevel: number;
  toneScore: number;
  score: number;
  tone: DomainTone;
  label: string;
  drivers: DriverDetail[];
  driverSummaries: string[];
  advice: string;
  breakdown: ScoreContribution[];
}

export type DomainKey = 'career' | 'love' | 'health' | 'growth' | 'money' | 'home' | 'friendships' | 'creativity' | 'spirituality' | 'power';

export interface LifeDomainScores {
  career: LifeDomainScore;
  love: LifeDomainScore;
  health: LifeDomainScore;
  growth: LifeDomainScore;
  money: LifeDomainScore;
  home: LifeDomainScore;
  friendships: LifeDomainScore;
  creativity: LifeDomainScore;
  spirituality: LifeDomainScore;
  power: LifeDomainScore;
}

/* ── Domain Configuration — 10 domains ── */

const DOMAIN_CONFIG: Record<DomainKey, {
  label: string;
  houses: number[];
  houseReasons: Record<number, string>;
  activityWeights: Record<string, number>;
  advice: Record<string, string>;
}> = {
  career: {
    label: 'Career & Public Role',
    houses: [6, 10],
    houseReasons: {
      6: 'daily work routines and job duties',
      10: 'public reputation and career direction',
    },
    activityWeights: { Sun: 2, Saturn: 2, Jupiter: 1.5, Mars: 1.5, MC: 2, Venus: 1, Mercury: 1, Pluto: 1, Uranus: 1 },
    advice: {
      challenging: 'Your career is getting your full attention this year — expect a growth area where you refine your direction, prove what you\'re capable of, and build toward something that lasts.',
      transformative: 'Your career path is evolving — old roles or ambitions are making room for something that fits the real you better.',
      supportive: 'Professional momentum is real this year — doors are opening, and this is a great time to step up and advance.',
      quiet: 'Career is on a slow simmer — focus on skill-building and preparation rather than big launches.',
      mixed: 'Some career energy is present — stay engaged and responsive without forcing big moves.',
    },
  },
  love: {
    label: 'Love & Relationships',
    houses: [5, 7],
    houseReasons: {
      5: 'romance, dating, and creative self-expression',
      7: 'committed partnerships and one-on-one relationships',
    },
    activityWeights: { Venus: 2.5, Moon: 1.5, Sun: 1.5, Mars: 1.5, Jupiter: 1, Juno: 1.5, Pluto: 1.5, Saturn: 2, Neptune: 1.5, Chiron: 1, Uranus: 1.5, Ceres: 0.8 },
    advice: {
      challenging: 'Relationships are in the spotlight this year — expect meaningful conversations, honest boundary-setting, and a chance to build something more real. The connections that matter most get stronger.',
      transformative: 'Love and intimacy are evolving at a deep level — old patterns are making room for something more authentic.',
      supportive: 'Genuine warmth, connection, and romantic opportunity are flowing this year — say yes to love.',
      quiet: 'Relationships are quieter — invest in self-knowledge and let partnerships breathe naturally.',
      mixed: 'Relationship energy is present but nuanced — both support and growth areas are in play.',
    },
  },
  health: {
    label: 'Health & Vitality',
    houses: [1, 6],
    houseReasons: {
      1: 'your physical body and vitality',
      6: 'daily health habits and wellness routines',
    },
    activityWeights: { Mars: 1.5, Saturn: 1.5, Moon: 1, Sun: 1, Neptune: 1, Chiron: 1, Pluto: 1 },
    advice: {
      challenging: 'Your body is asking for more attention this year — it\'s a great time to start new routines, listen to what your body needs, and make wellness a priority.',
      transformative: 'Your body and wellness routines are ready for an upgrade — try new approaches, listen to what feels right, and trust the signals your body sends.',
      supportive: 'Great energy for building new wellness habits that stick — your body is on your side this year.',
      quiet: 'Health is steady — gentle maintenance and consistency are your best strategy.',
      mixed: 'Health is moderately active — maintain your routines and respond when your body asks for attention.',
    },
  },
  growth: {
    label: 'Learning & Expansion',
    houses: [3, 9],
    houseReasons: {
      3: 'learning, curiosity, communication, and new skills',
      9: 'big-picture beliefs, travel, and higher education',
    },
    activityWeights: { Jupiter: 2, Neptune: 1.5, Pluto: 1.5, NorthNode: 2, Uranus: 1, Chiron: 1, Mercury: 1.5 },
    advice: {
      challenging: 'Growth comes through difficulty — the lessons are real but uncomfortable.',
      transformative: 'Expect real shifts in how you see the world — your worldview is being rebuilt.',
      supportive: 'Expansion and learning flow naturally — education, travel, or spiritual deepening are available.',
      quiet: 'Inner growth is subtle this year — seeds planted now become visible in future cycles.',
      mixed: 'Growth is happening through steady learning and gradually expanding your perspective.',
    },
  },
  money: {
    label: 'Money & Resources',
    houses: [2, 8],
    houseReasons: {
      2: 'your income, earning power, and personal values',
      8: 'shared resources, debts, investments, and other people\'s money',
    },
    activityWeights: { Venus: 1.5, Jupiter: 2, Saturn: 1.5, Pluto: 1.5, Mars: 1, Sun: 1, Mercury: 1, Uranus: 1 },
    advice: {
      challenging: 'Financial pressure is real — debts, restructuring, or losses may require hard decisions. Budget carefully.',
      transformative: 'Your relationship with money is being fundamentally rebuilt — old financial patterns are dying.',
      supportive: 'Financial opportunity is present — benefic planets support your money houses. Time to invest in yourself.',
      quiet: 'Money houses are quiet — maintain existing financial habits and avoid big risks.',
      mixed: 'Mixed financial energy — some gains, some setbacks. Stay flexible and avoid overcommitting.',
    },
  },
  home: {
    label: 'Home & Family',
    houses: [4, 10],
    houseReasons: {
      4: 'home, family roots, emotional foundations, and living situation',
      10: 'parental role, family legacy, and authority figures',
    },
    activityWeights: { Moon: 2, Saturn: 1.5, Ceres: 1.5, Pluto: 1, Sun: 1, Venus: 1, Mars: 1, Neptune: 1, Uranus: 1.5 },
    advice: {
      challenging: 'Home and family are getting your full attention — big conversations, potential moves, or honest moments with loved ones can lead to a stronger foundation.',
      transformative: 'Your living situation or family dynamics are evolving into something that fits who you are now.',
      supportive: 'Home life feels nourishing — a great year for moves, renovations, or deepening family bonds.',
      quiet: 'Home life is stable and steady — that foundation lets you focus on other priorities.',
      mixed: 'Mixed energy at home — some comfort and some adjustments. Stay flexible about living arrangements.',
    },
  },
  friendships: {
    label: 'Friendships & Community',
    houses: [11, 3],
    houseReasons: {
      11: 'friendships, social circles, hopes, and group involvement',
      3: 'neighbors, siblings, and your immediate social environment',
    },
    activityWeights: { Venus: 1.5, Jupiter: 1.5, Mercury: 1.5, Sun: 1, Uranus: 1.5, Mars: 1, Saturn: 1, Neptune: 1 },
    advice: {
      challenging: 'Social life is demanding — friendships may be tested, or you may outgrow certain groups.',
      transformative: 'Your social world is shifting — expect to leave old circles and find new ones that fit who you\'re becoming.',
      supportive: 'Social life is thriving — new connections, community involvement, and supportive friendships.',
      quiet: 'Social sector is quiet — a few deep connections matter more than a wide network.',
      mixed: 'Mixed social energy — some friendships deepen while others fade. Quality over quantity.',
    },
  },
  creativity: {
    label: 'Creativity & Self-Expression',
    houses: [5, 3],
    houseReasons: {
      5: 'creative projects, artistic expression, play, and joy',
      3: 'writing, communication, and intellectual creativity',
    },
    activityWeights: { Venus: 2, Sun: 1.5, Neptune: 1.5, Mercury: 1, Moon: 1, Mars: 1, Uranus: 1.5, Jupiter: 1 },
    advice: {
      challenging: 'Creative expression may feel like it\'s pushing you — the effort is building something new and more authentically yours.',
      transformative: 'Your creative voice is evolving — old styles are making room for fresh, exciting new forms of expression.',
      supportive: 'Creative energy is flowing beautifully — this is a genuinely wonderful year to make, write, perform, or create.',
      quiet: 'Creative energy is building quietly — consume inspiration now and create when it feels ready.',
      mixed: 'Creative energy comes in waves — follow the bursts of inspiration when they arrive.',
    },
  },
  spirituality: {
    label: 'Spirituality & Inner Life',
    houses: [12, 9],
    houseReasons: {
      12: 'the unconscious, spiritual practice, retreat, and surrender',
      9: 'higher meaning, philosophy, and faith',
    },
    activityWeights: { Neptune: 2, Jupiter: 1.5, Pluto: 1.5, NorthNode: 1.5, Chiron: 1.5, Moon: 1, Vesta: 1.5, Saturn: 1, Sun: 0.5 },
    advice: {
      challenging: 'Your inner life is going through a meaningful clearing — old beliefs that no longer fit are making room for deeper understanding and peace.',
      transformative: 'A profound inner shift is happening — your sense of meaning, purpose, and connection to something larger is being renewed.',
      supportive: 'Inner growth flows naturally — meditation, quiet reflection, and spiritual exploration feel especially rewarding.',
      quiet: 'Inner life is gentle this year — grounding in everyday life takes priority, and that\'s perfectly right.',
      mixed: 'Your inner path has moments of clarity and moments of searching — trust the process and be patient with yourself.',
    },
  },
  power: {
    label: 'Power & Transformation',
    houses: [8, 1],
    houseReasons: {
      8: 'deep change, shared resources, and personal transformation',
      1: 'personal power, confidence, and how you show up in the world',
    },
    activityWeights: { Pluto: 2.5, Mars: 1.5, Saturn: 1.5, Sun: 1, Uranus: 1.5, Chiron: 1, NorthNode: 1 },
    advice: {
      challenging: 'You\'re in a growth area around personal power — learning to set stronger boundaries, speak up, and trust your own authority.',
      transformative: 'Something fundamental about how you move through the world is changing — this is you stepping into a new chapter.',
      supportive: 'You\'re stepping into genuine personal confidence — owning your strengths feels natural this year.',
      quiet: 'Personal power is steady and stable — a year for maintaining what\'s working rather than big shifts.',
      mixed: 'Some areas feel empowering while others ask you to let go of control — learn to read which is which.',
    },
  },
};

const PLANET_PLAIN: Record<string, string> = {
  Sun: 'your identity and sense of self', Moon: 'your emotions and daily feelings',
  Mercury: 'how you think and communicate', Venus: 'what you love and value',
  Mars: 'your drive, energy, and desire', Jupiter: 'where you get lucky and expand',
  Saturn: 'where you work hardest and face tests', Uranus: 'where sudden changes happen',
  Neptune: 'your intuition, illusions, and confusion', Pluto: 'deep transformation and power shifts',
  NorthNode: 'your growth direction this lifetime', Juno: 'what you need in committed partnership',
  Chiron: 'where your deepest wound becomes your greatest healing',
  Ceres: 'nurturing and cycles of loss and return', Pallas: 'strategic intelligence',
  Vesta: 'sacred focus and devotion', MC: 'your career direction and public role',
};

const BENEFIC_ASPECTS = ['Trine', 'Sextile'];
const MALEFIC_ASPECTS = ['Square', 'Opposition', 'Quincunx'];

/* ── Helpers ── */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function ordinal(n: number): string {
  if (n === 0) return '';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function getNature(planet: string): PlanetNature {
  return PLANET_NATURE[planet] || 'neutral';
}

function getEffect(planet: string): string {
  return PLANET_EFFECT[planet] || 'activation';
}

/* ── Tone → Label ── */

function calculateTone(toneScore: number, activityLevel: number): DomainTone {
  if (activityLevel < 2) return 'quiet';
  if (toneScore >= 2) return 'supportive';
  if (toneScore <= -2) return 'challenging';
  if (toneScore <= -0.5) return 'transformative';
  return 'mixed';
}

function activityLabel(level: number, tone: DomainTone): string {
  if (level < 2) return 'Quiet Background';
  if (level < 4) {
    if (tone === 'supportive') return 'Gently Supportive';
    if (tone === 'challenging') return 'Getting Real';
    return 'Gently Active';
  }
  if (level < 7) {
    if (tone === 'supportive') return 'Steadily Building';
    if (tone === 'challenging') return 'Deeply Engaged';
    if (tone === 'transformative') return 'Evolving';
    return 'In Motion';
  }
  if (tone === 'supportive') return 'Flourishing';
  if (tone === 'challenging') return 'In the Spotlight';
  if (tone === 'transformative') return 'Major Evolution';
  return 'Highly Active';
}

/* ── Main Scoring Engine ── */

const ALL_DOMAIN_KEYS: DomainKey[] = ['career', 'love', 'health', 'growth', 'money', 'home', 'friendships', 'creativity', 'spirituality', 'power'];

export function calculateLifeDomainScores(analysis: SolarReturnAnalysis): LifeDomainScores {
  const results: Record<string, LifeDomainScore> = {};

  // Build retrograde lookup
  const retrogradeSet = new Set<string>();
  for (const ov of (analysis.houseOverlays || [])) {
    if ((ov as any).retrograde || (ov as any).isRetrograde) {
      retrogradeSet.add(ov.planet);
    }
  }
  if (Array.isArray((analysis as any).retrogrades)) {
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

  for (const domain of ALL_DOMAIN_KEYS) {
    const config = DOMAIN_CONFIG[domain];
    let activity = 0;
    let toneTotal = 0;
    const allDrivers: DriverDetail[] = [];
    const breakdown: ScoreContribution[] = [];
    const { houses, activityWeights, houseReasons } = config;

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

          let rawTone = getToneWeight(overlay.planet, domain);
          const rxMult = retrogradeMultiplier(overlay.planet, retrogradeSet.has(overlay.planet));
          const digMult = dignityMultiplier(overlay.planet, dignityMap[overlay.planet] || 'none');
          const finalTone = rawTone * rxMult * digMult;
          toneTotal += finalTone;

          const rxNote = retrogradeSet.has(overlay.planet) ? ' (in review mode — intensified)' : '';
          const digNote = '';  // suppress technical dignity labels in user-facing text

          allDrivers.push({ planet: overlay.planet, house: h, effect, nature, points: Math.round(w * 10) / 10, tonePoints: Math.round(finalTone * 10) / 10 });
          breakdown.push({
            source: `${overlay.planet}${rxNote} in your ${HOUSE_PLAIN_LDS[h] || ordinal(h) + ' House'}`,
            points: Math.round(w * 10) / 10,
            tonePoints: Math.round(finalTone * 10) / 10,
            reason: `${overlay.planet} (${planetDesc}) in your ${HOUSE_PLAIN_LDS[h] || ordinal(h) + ' House'} — ${houseDesc}. Nature: ${nature}${rxNote}.${diminish < 1 ? ' (diminishing returns)' : ''}`,
            nature,
          });
        } else {
          // Minor bodies / asteroids that aren't in the domain's activityWeights
          // get near-zero activity to prevent score inflation.
          const MAJOR_PLANETS = new Set(['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto']);
          const isMajor = MAJOR_PLANETS.has(overlay.planet);
          const w = isMajor ? 0.15 : 0.02;  // asteroids/points get almost nothing
          activity += w;
          const nature = getNature(overlay.planet);
          let rawTone = getToneWeight(overlay.planet, domain) * (isMajor ? 0.3 : 0.1);
          const rxMult = retrogradeMultiplier(overlay.planet, retrogradeSet.has(overlay.planet));
          const finalTone = rawTone * rxMult;
          toneTotal += finalTone;

          if (isMajor) {
            allDrivers.push({ planet: overlay.planet, house: h, effect: getEffect(overlay.planet), nature, points: w, tonePoints: Math.round(finalTone * 10) / 10 });
            breakdown.push({
              source: `${overlay.planet} in ${ordinal(h)} House`,
              points: w,
              tonePoints: Math.round(finalTone * 10) / 10,
              reason: `${overlay.planet} is present but not a key planet for ${config.label} — minor activation`,
              nature,
            });
          }
          // Asteroids/points silently contribute near-zero and don't appear as drivers
        }
      }
    }

    // 2. Sun/Moon bonus
    const sunH = analysis.sunHouse.house;
    if (sunH && houses.includes(sunH) && !allDrivers.some(d => d.planet === 'Sun')) {
      const w = 1.0;
      activity += w;
      const tp = getToneWeight('Sun', domain);
      toneTotal += tp;
      allDrivers.push({ planet: 'Sun', house: sunH, effect: getEffect('Sun'), nature: 'luminary', points: w, tonePoints: tp });
      breakdown.push({ source: `Sun in ${ordinal(sunH)} House`, points: w, tonePoints: tp, reason: `Sun (core identity) in ${ordinal(sunH)} House — makes ${config.label} a central theme.`, nature: 'luminary' });
    }
    const moonH = analysis.moonHouse.house;
    if (moonH && houses.includes(moonH) && !allDrivers.some(d => d.planet === 'Moon')) {
      const w = 0.7;
      activity += w;
      const tp = getToneWeight('Moon', domain);
      toneTotal += tp;
      allDrivers.push({ planet: 'Moon', house: moonH, effect: getEffect('Moon'), nature: 'luminary', points: w, tonePoints: tp });
      breakdown.push({ source: `Moon in ${ordinal(moonH)} House`, points: w, tonePoints: tp, reason: `Moon (emotional needs) in ${ordinal(moonH)} House — feelings are drawn here.`, nature: 'luminary' });
    }

    // 3. Stelliums
    for (const st of analysis.stelliums) {
      if (st.locationType === 'house') {
        const hNum = parseInt(st.location, 10);
        if (!isNaN(hNum) && houses.includes(hNum)) {
          activity += 1.0;
          breakdown.push({ source: `Stellium in ${ordinal(hNum)} House`, points: 1.0, reason: `3+ planets clustered in ${ordinal(hNum)} House (${houseReasons[hNum] || ''}) — concentrated energy` });
        }
      }
    }

    // 4. Aspects (capped at 2 pts activity)
    const allAspects = [...analysis.srToNatalAspects, ...analysis.srInternalAspects];
    let aspectBoost = 0;
    let aspectToneBoost = 0;
    const aspectDetails: string[] = [];
    const MAX_ASPECT = 2.0;
    for (const asp of allAspects) {
      if (aspectBoost >= MAX_ASPECT) break;
      const p1w = activityWeights[asp.planet1] || 0;
      const p2w = activityWeights[asp.planet2] || 0;
      if (p1w > 0 || p2w > 0) {
        let weight = BENEFIC_ASPECTS.includes(asp.type) ? 0.15 : MALEFIC_ASPECTS.includes(asp.type) ? 0.1 : 0.05;
        weight = Math.min(weight, MAX_ASPECT - aspectBoost);
        activity += weight;
        aspectBoost += weight;
        const aspectTone = BENEFIC_ASPECTS.includes(asp.type) ? 0.2 : -0.2;
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
        reason: `Relevant aspects: ${aspectDetails.slice(0, 4).join('; ')}${aspectDetails.length > 4 ? ` + ${aspectDetails.length - 4} more` : ''}`,
      });
    }

    // 5. Angular planets — preserve the planet's ACTUAL SR house in the driver
    // (never use 0, which renders as "H0" and looks like a bug).
    for (const ap of analysis.angularPlanets) {
      if ((activityWeights[ap] || 0) > 0) {
        const w = 0.4;
        activity += w;
        const nature = getNature(ap);
        const tp = getToneWeight(ap, domain) * 0.3;
        toneTotal += tp;
        const apSrHouse = analysis.houseOverlays?.find(o => o.planet === ap)?.srHouse || null;
        // If we already added this planet as a house occupant, just upgrade its
        // tags/score there instead of pushing a duplicate driver row with house 0.
        const existing = allDrivers.find(d => d.planet === ap);
        if (existing) {
          existing.points = Math.round((existing.points + w) * 10) / 10;
          existing.tonePoints = Math.round((existing.tonePoints + tp) * 10) / 10;
          existing.effect = `${existing.effect} (also angular)`;
        } else if (apSrHouse) {
          allDrivers.push({ planet: ap, house: apSrHouse, effect: 'angular emphasis', nature, points: w, tonePoints: Math.round(tp * 10) / 10 });
        }
        breakdown.push({ source: `${ap} angular${apSrHouse ? ` (in ${ordinal(apSrHouse)} House)` : ''}`, points: w, tonePoints: Math.round(tp * 10) / 10, reason: `${ap} on a chart angle — louder in your year`, nature });
      }
    }

    // 6. Saturn focus
    if (analysis.saturnFocus?.house && houses.includes(analysis.saturnFocus.house)) {
      if (!allDrivers.some(d => d.planet === 'Saturn')) {
        activity += 0.3;
        const tp = getToneWeight('Saturn', domain) * 0.5;
        toneTotal += tp;
        allDrivers.push({ planet: 'Saturn', house: analysis.saturnFocus.house, effect: getEffect('Saturn'), nature: 'malefic', points: 0.3, tonePoints: Math.round(tp * 10) / 10 });
        breakdown.push({ source: `Saturn focus in ${ordinal(analysis.saturnFocus.house)} House`, points: 0.3, tonePoints: Math.round(tp * 10) / 10, reason: `Saturn activates through demand, not ease`, nature: 'malefic' });
      }
    }

    const finalActivity = clamp(Math.round(activity * 10) / 10, 0, 10);
    const finalTone = Math.round(toneTotal * 10) / 10;
    const tone = calculateTone(finalTone, finalActivity);
    const adviceMap = config.advice;
    const adviceKey = tone === 'quiet' ? 'quiet' : tone;

    results[domain] = {
      domain: config.label,
      domainKey: domain,
      activityLevel: finalActivity,
      toneScore: finalTone,
      score: finalActivity,
      tone,
      label: activityLabel(finalActivity, tone),
      drivers: allDrivers,
      driverSummaries: allDrivers.slice(0, 6).map(d => `${d.planet} in ${ordinal(d.house)} House`),
      advice: adviceMap[adviceKey] || adviceMap.mixed || '',
      breakdown,
    };
  }

  return results as unknown as LifeDomainScores;
}
