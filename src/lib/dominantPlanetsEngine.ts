/**
 * Shared Dominant Planets Engine — 5-factor scoring
 * Used by both Natal (Life Patterns, Natal Portrait) and Solar Return
 * 
 * Factors:
 * 1. Sign dignity (0-5): Domicile=5, Exaltation=4, others=0
 * 2. House placement (1-5): Angular=5, Succedent=3, Cadent=1
 * 3. Angle proximity (0-6): (8-orb)/8*6 for planets within 8° of ASC/MC/DSC/IC
 * 4. Rulership (0-9): ASC ruler +4, MC ruler +3, Sun sign ruler +1, Moon sign ruler +1
 * 5. Aspect connectivity (0-10 capped): weighted by type and orb
 */

import { NatalChart } from '@/hooks/useNatalChart';
import { signDegreesToLongitude, getHouseForLongitude } from './houseCalculations';

// ─── Types ──────────────────────────────────────────────────────────

export interface DominantPlanetBreakdown {
  sign: number;
  house: number;
  angle: number;
  ruler: number;
  aspects: number;
}

export interface DominantPlanetEntry {
  planet: string;
  rank: number;
  totalScore: number;
  percentage: number;
  breakdown: DominantPlanetBreakdown;
  dignity: string;
  tags: string[];
  meaning: string;
}

export interface DominantPlanetsReport {
  entries: DominantPlanetEntry[];
  captain: string;
  starPlayer: string;
  billboard: string;
  captainScore: number;
  interpretation: string;
}

// ─── Constants ──────────────────────────────────────────────────────

const SCORED_BODIES = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto','Chiron','NorthNode'];

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

const TRADITIONAL_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

const DOMICILE_SIGNS: Record<string, string[]> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mercury: ['Gemini','Virgo'], Venus: ['Taurus','Libra'],
  Mars: ['Aries','Scorpio'], Jupiter: ['Sagittarius','Pisces'], Saturn: ['Capricorn','Aquarius'],
  Uranus: ['Aquarius'], Neptune: ['Pisces'], Pluto: ['Scorpio'],
};

const EXALTATION_SIGNS: Record<string, string> = {
  Sun: 'Aries', Moon: 'Taurus', Mercury: 'Virgo', Venus: 'Pisces',
  Mars: 'Capricorn', Jupiter: 'Cancer', Saturn: 'Libra',
};

const PLANET_MEANINGS: Record<string, string> = {
  Sun: "Your life force radiates outward. You're meant to be seen, to lead, to express your authentic self without apology. Your vitality, confidence, and creative fire are the engine of your entire chart.",
  Moon: "Your emotional world runs the show. You process everything through feeling first, and your intuition is your most reliable compass. Nurturing, memory, and emotional intelligence are your superpowers.",
  Mercury: "Your mind never stops. You process the world through analysis, communication, and connection. Words are your currency — whether written, spoken, or thought.",
  Venus: "Beauty, harmony, and connection are your lifeblood. You have a natural gift for making things — and people — feel good. Your values and aesthetic sense shape every decision.",
  Mars: "You run on drive, ambition, and raw energy. You're built to take action, compete, and pioneer. Your courage and directness are gifts.",
  Jupiter: "You're wired for expansion, meaning, and growth. Optimism carries you through what would break others. You see the bigger picture when everyone else is stuck.",
  Saturn: "Discipline, structure, and long-term thinking define you. You earn everything the hard way — and keep it. Your authority comes from lived experience.",
  Uranus: "You're the pattern-breaker. Convention doesn't hold you because you see systems others don't. Your genius is in disruption and innovation.",
  Neptune: "You live between worlds. Your sensitivity, imagination, and spiritual depth are extraordinary. Creativity and compassion are your channels.",
  Pluto: "Transformation is your birthright. You don't do surface-level anything. Your power lies in regeneration — walking through destruction and emerging stronger.",
  Chiron: "Your deepest wound becomes your greatest teaching. Where you've been hurt most is exactly where you heal others. The wounded healer archetype lives through you.",
  NorthNode: "Your soul's growth direction shapes everything. The North Node isn't a planet but a compass — pulling you toward what you came here to learn and become.",
};

// ─── Helpers ────────────────────────────────────────────────────────

function getDignity(planet: string, sign: string): string {
  if (DOMICILE_SIGNS[planet]?.includes(sign)) return 'Domicile';
  if (EXALTATION_SIGNS[planet] === sign) return 'Exaltation';
  return 'Peregrine';
}

function signToLongitude(sign: string, degree: number): number {
  const idx = SIGNS.indexOf(sign);
  return idx === -1 ? 0 : idx * 30 + degree;
}

interface PlanetData {
  name: string;
  sign: string;
  degree: number; // absolute 0-360
  house: number | null;
}

function extractPlanets(chart: NatalChart): PlanetData[] {
  const result: PlanetData[] = [];
  for (const name of SCORED_BODIES) {
    const pos = chart.planets?.[name as keyof typeof chart.planets];
    if (!pos?.sign) continue;
    const deg = (typeof pos.degree === 'number' ? pos.degree : Number(pos.degree)) || 0;
    const min = (typeof pos.minutes === 'number' ? pos.minutes : Number(pos.minutes)) || 0;
    const absDeg = signToLongitude(pos.sign, deg + min / 60);
    
    // Calculate house
    let house: number | null = null;
    if (chart.houseCusps) {
      const cusps: number[] = [];
      for (let i = 1; i <= 12; i++) {
        const cusp = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
        if (cusp) cusps.push(signToLongitude(cusp.sign, cusp.degree + (cusp.minutes || 0) / 60));
      }
      if (cusps.length === 12) {
        for (let i = 0; i < 12; i++) {
          const cur = cusps[i];
          const next = cusps[(i + 1) % 12];
          if (next < cur) {
            if (absDeg >= cur || absDeg < next) { house = i + 1; break; }
          } else {
            if (absDeg >= cur && absDeg < next) { house = i + 1; break; }
          }
        }
        if (house === null) house = 1;
      }
    }
    
    result.push({ name, sign: pos.sign, degree: absDeg, house });
  }
  return result;
}

function getAngleDegrees(chart: NatalChart): { name: string; degree: number }[] {
  const angles: { name: string; degree: number }[] = [];
  const h1 = chart.houseCusps?.house1;
  const h4 = chart.houseCusps?.house4;
  const h7 = chart.houseCusps?.house7;
  const h10 = chart.houseCusps?.house10;
  
  if (h1) angles.push({ name: 'ASC', degree: signToLongitude(h1.sign, h1.degree + (h1.minutes || 0) / 60) });
  if (h4) angles.push({ name: 'IC', degree: signToLongitude(h4.sign, h4.degree + (h4.minutes || 0) / 60) });
  if (h7) angles.push({ name: 'DSC', degree: signToLongitude(h7.sign, h7.degree + (h7.minutes || 0) / 60) });
  if (h10) angles.push({ name: 'MC', degree: signToLongitude(h10.sign, h10.degree + (h10.minutes || 0) / 60) });
  
  return angles;
}

function angularDifference(a: number, b: number): number {
  let diff = Math.abs(a - b);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

// ─── Main Engine ────────────────────────────────────────────────────

export function calculateNatalDominantPlanets(chart: NatalChart): DominantPlanetsReport {
  const planets = extractPlanets(chart);
  const angles = getAngleDegrees(chart);
  
  const ascSign = chart.houseCusps?.house1?.sign || '';
  const mcSign = chart.houseCusps?.house10?.sign || '';
  const sunSign = chart.planets?.Sun?.sign || '';
  const moonSign = chart.planets?.Moon?.sign || '';

  // Aspect calculation
  const ASPECT_TARGETS = [
    { type: 'Conjunction', target: 0, orb: 8 },
    { type: 'Sextile', target: 60, orb: 6 },
    { type: 'Square', target: 90, orb: 8 },
    { type: 'Trine', target: 120, orb: 8 },
    { type: 'Opposition', target: 180, orb: 8 },
    { type: 'Semi-Sextile', target: 30, orb: 2 },
    { type: 'Quincunx', target: 150, orb: 3 },
    { type: 'Semi-Square', target: 45, orb: 2 },
    { type: 'Sesquiquadrate', target: 135, orb: 2 },
  ];

  const ASPECT_BASE: Record<string, number> = {
    'Conjunction': 2, 'Opposition': 1.5, 'Trine': 1.5, 'Square': 1.5, 'Sextile': 1.5,
    'Semi-Sextile': 0.5, 'Quincunx': 0.5, 'Semi-Square': 0.5, 'Sesquiquadrate': 0.5,
  };

  // Find all aspects
  const allAspects: { p1: string; p2: string; type: string; orb: number }[] = [];
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const diff = angularDifference(planets[i].degree, planets[j].degree);
      for (const asp of ASPECT_TARGETS) {
        const orbDiff = Math.abs(diff - asp.target);
        if (orbDiff <= asp.orb) {
          allAspects.push({ p1: planets[i].name, p2: planets[j].name, type: asp.type, orb: orbDiff });
          break;
        }
      }
    }
  }

  const results: { planet: string; breakdown: DominantPlanetBreakdown; dignity: string; tags: string[] }[] = [];

  for (const p of planets) {
    const tags: string[] = [];

    // 1. Sign dignity (0-5)
    const dignity = getDignity(p.name, p.sign);
    const signScore = dignity === 'Domicile' ? 5 : dignity === 'Exaltation' ? 4 : 0;
    if (dignity === 'Domicile') tags.push('Domicile');
    if (dignity === 'Exaltation') tags.push('Exaltation');

    // 2. House placement (1-5)
    let houseScore = 1;
    if (p.house) {
      if ([1, 4, 7, 10].includes(p.house)) { houseScore = 5; tags.push('Angular'); }
      else if ([2, 5, 8, 11].includes(p.house)) houseScore = 3;
    }

    // 3. Angle proximity (0-6)
    let angleScore = 0;
    for (const angle of angles) {
      const orb = angularDifference(p.degree, angle.degree);
      if (orb <= 8) {
        const score = (8 - orb) / 8 * 6;
        if (score > angleScore) angleScore = score;
      }
    }
    if (angleScore > 3) tags.push('On Angle');
    angleScore = Math.round(angleScore * 10) / 10;

    // 4. Rulership (0-9)
    let rulerScore = 0;
    // Use both modern and traditional rulers for chart ruler
    if (ascSign && (SIGN_RULERS[ascSign] === p.name || TRADITIONAL_RULERS[ascSign] === p.name)) {
      rulerScore += 4; tags.push('Chart Ruler');
    }
    if (mcSign && (SIGN_RULERS[mcSign] === p.name || TRADITIONAL_RULERS[mcSign] === p.name)) {
      rulerScore += 3; tags.push('MC Ruler');
    }
    // Hybrid bonus: Sun/Moon sign rulership (+1 each)
    if (sunSign && SIGN_RULERS[sunSign] === p.name && p.name !== 'Sun') rulerScore += 1;
    if (moonSign && SIGN_RULERS[moonSign] === p.name && p.name !== 'Moon') rulerScore += 1;

    // 5. Aspect connectivity (0-10, capped)
    let aspectScore = 0;
    for (const asp of allAspects) {
      if (asp.p1 !== p.name && asp.p2 !== p.name) continue;
      const base = ASPECT_BASE[asp.type] || 0.5;
      const orbFactor = Math.max(0.3, (8 - asp.orb) / 8);
      aspectScore += base * orbFactor;
    }
    aspectScore = Math.min(10, Math.round(aspectScore * 10) / 10);
    if (aspectScore >= 7) tags.push('Highly Connected');

    results.push({
      planet: p.name,
      breakdown: { sign: signScore, house: houseScore, angle: angleScore, ruler: rulerScore, aspects: aspectScore },
      dignity,
      tags,
    });
  }

  // Calculate totals and rank
  const scored = results.map(r => ({
    ...r,
    totalScore: Math.round((r.breakdown.sign + r.breakdown.house + r.breakdown.angle + r.breakdown.ruler + r.breakdown.aspects) * 10) / 10,
  }));
  scored.sort((a, b) => b.totalScore - a.totalScore);

  const maxScore = scored[0]?.totalScore || 1;
  const entries: DominantPlanetEntry[] = scored.map((s, i) => ({
    planet: s.planet,
    rank: i + 1,
    totalScore: s.totalScore,
    percentage: Math.round((s.totalScore / maxScore) * 100),
    breakdown: s.breakdown,
    dignity: s.dignity,
    tags: s.tags,
    meaning: PLANET_MEANINGS[s.planet] || '',
  }));

  const captain = entries[0]?.planet || '';
  const starPlayer = [...entries].sort((a, b) => b.breakdown.sign - a.breakdown.sign)[0]?.planet || '';

  // Billboard = closest to MC
  let billboard = '';
  let closestMCOrb = 999;
  const mcAngle = angles.find(a => a.name === 'MC');
  if (mcAngle) {
    for (const p of planets) {
      const orb = angularDifference(p.degree, mcAngle.degree);
      if (orb < closestMCOrb) {
        closestMCOrb = orb;
        billboard = p.name;
      }
    }
  }
  if (!billboard) billboard = entries[0]?.planet || '';

  const top3 = entries.slice(0, 3).map(e => e.planet);
  const captainTags = entries[0]?.tags.length ? entries[0].tags.join(', ').toLowerCase() : 'placement and aspects';
  const interpretation = `${captain} is your most dominant planet with ${entries[0]?.totalScore} points — it has the most influence over your chart through a combination of ${captainTags}. ${
    starPlayer !== captain ? `${starPlayer} is your strongest planet by dignity — most comfortable in its sign. ` : ''
  }${billboard !== captain ? `${billboard} is your most elevated planet (closest to the Midheaven) — what the world sees first. ` : ''
  }Your top three: ${top3.join(', ')}.`;

  return {
    entries,
    captain,
    starPlayer,
    billboard,
    captainScore: entries[0]?.totalScore || 0,
    interpretation,
  };
}
