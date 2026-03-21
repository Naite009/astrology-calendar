/**
 * Psychological Profile Engine for Solar Return
 * 
 * Calculates bipolar spectrum dimensions (Active/Passive, Emotional/Rational, etc.)
 * from chart data. Supports natal, SR, and blended profiles.
 * 
 * Methodology: Each planet contributes to dimensions based on its sign, house,
 * and aspect patterns. Planet weights follow traditional importance:
 * Sun/Moon/Asc = highest, personal planets = medium, outer = lower.
 */

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'] as const;

const SIGN_ELEMENT: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Leo: 'Fire', Sagittarius: 'Fire',
  Taurus: 'Earth', Virgo: 'Earth', Capricorn: 'Earth',
  Gemini: 'Air', Libra: 'Air', Aquarius: 'Air',
  Cancer: 'Water', Scorpio: 'Water', Pisces: 'Water',
};

const SIGN_MODALITY: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  Aries: 'Cardinal', Cancer: 'Cardinal', Libra: 'Cardinal', Capricorn: 'Cardinal',
  Taurus: 'Fixed', Leo: 'Fixed', Scorpio: 'Fixed', Aquarius: 'Fixed',
  Gemini: 'Mutable', Virgo: 'Mutable', Sagittarius: 'Mutable', Pisces: 'Mutable',
};

/* ── Planet Importance Weights ── */
const PLANET_WEIGHT: Record<string, number> = {
  Sun: 10, Moon: 10, Mercury: 7, Venus: 7, Mars: 7,
  Jupiter: 5, Saturn: 5, Uranus: 3, Neptune: 3, Pluto: 3,
  Chiron: 2, NorthNode: 2, Juno: 1, Ceres: 1, Pallas: 1, Vesta: 1,
};

// ASC and MC get special weight
const ANGLE_WEIGHT = 8;

/* ── Dimension Definitions ── */
// Each dimension has a "left" pole (positive score) and "right" pole (negative score).
// Sign contributions push the score left or right.

export interface DimensionDef {
  id: string;
  left: string;       // positive direction label
  right: string;      // negative direction label
  description: string; // what this measures
}

export const DIMENSIONS: DimensionDef[] = [
  { id: 'active_passive', left: 'Active', right: 'Passive', description: 'How much initiative and outward drive vs. receptivity and waiting' },
  { id: 'emotional_rational', left: 'Emotional', right: 'Rational', description: 'Led by feelings and instincts vs. logic and analysis' },
  { id: 'extroverted_introverted', left: 'Extroverted', right: 'Introverted', description: 'Energy directed outward toward people vs. inward toward reflection' },
  { id: 'independent_cooperative', left: 'Independent', right: 'Cooperative', description: 'Self-reliant and autonomous vs. partnership-oriented and collaborative' },
  { id: 'confident_cautious', left: 'Self-Confident', right: 'Cautious', description: 'Bold self-assurance vs. careful, measured approach' },
  { id: 'optimistic_pessimistic', left: 'Optimistic', right: 'Pessimistic', description: 'Expansive hopefulness vs. realistic caution and concern' },
  { id: 'disciplined_spontaneous', left: 'Disciplined', right: 'Spontaneous', description: 'Structured and controlled vs. impulsive and free-flowing' },
  { id: 'intuitive_analytical', left: 'Intuitive', right: 'Analytical', description: 'Trusting gut feelings and impressions vs. systematic thinking' },
  { id: 'abstract_concrete', left: 'Abstract', right: 'Concrete', description: 'Big-picture thinking and theory vs. practical, hands-on approach' },
  { id: 'stable_changeable', left: 'Stable', right: 'Changeable', description: 'Consistent and resistant to change vs. adaptable and shifting' },
  { id: 'assertive_receptive', left: 'Assertive', right: 'Receptive', description: 'Pushing forward and taking charge vs. allowing and receiving' },
  { id: 'focused_scattered', left: 'Focused', right: 'Scattered', description: 'Deep concentration on few things vs. many interests spread thin' },
];

/* ── Sign → Dimension Contributions ── */
// Positive = pushes LEFT, Negative = pushes RIGHT
// Values are relative contribution per unit of planet weight

type DimContrib = Partial<Record<string, number>>;

const SIGN_DIMENSIONS: Record<string, DimContrib> = {
  Aries: {
    active_passive: 1, extroverted_introverted: 0.7, independent_cooperative: 1,
    confident_cautious: 0.8, optimistic_pessimistic: 0.5, disciplined_spontaneous: -0.7,
    assertive_receptive: 1, focused_scattered: -0.3,
  },
  Taurus: {
    active_passive: -0.6, stable_changeable: 1, disciplined_spontaneous: 0.5,
    abstract_concrete: -0.8, confident_cautious: 0.3, focused_scattered: 0.7,
    assertive_receptive: -0.3,
  },
  Gemini: {
    active_passive: 0.4, extroverted_introverted: 0.8, abstract_concrete: 0.5,
    stable_changeable: -0.8, focused_scattered: -0.8, intuitive_analytical: -0.5,
    independent_cooperative: -0.3,
  },
  Cancer: {
    emotional_rational: 1, extroverted_introverted: -0.7, intuitive_analytical: 0.8,
    active_passive: -0.5, independent_cooperative: -0.5, assertive_receptive: -0.7,
    stable_changeable: -0.3,
  },
  Leo: {
    active_passive: 0.8, extroverted_introverted: 1, confident_cautious: 1,
    optimistic_pessimistic: 0.7, independent_cooperative: 0.5, assertive_receptive: 0.7,
    focused_scattered: 0.5,
  },
  Virgo: {
    disciplined_spontaneous: 0.8, abstract_concrete: -1, intuitive_analytical: -0.8,
    active_passive: -0.3, extroverted_introverted: -0.5, focused_scattered: 0.8,
    confident_cautious: -0.3,
  },
  Libra: {
    independent_cooperative: -1, extroverted_introverted: 0.5, abstract_concrete: 0.3,
    stable_changeable: -0.4, assertive_receptive: -0.5, emotional_rational: -0.3,
    optimistic_pessimistic: 0.3,
  },
  Scorpio: {
    emotional_rational: 0.8, extroverted_introverted: -0.8, focused_scattered: 1,
    stable_changeable: 0.7, intuitive_analytical: 0.7, independent_cooperative: 0.5,
    confident_cautious: 0.3, assertive_receptive: 0.5,
  },
  Sagittarius: {
    active_passive: 0.7, extroverted_introverted: 0.8, optimistic_pessimistic: 1,
    abstract_concrete: 0.8, disciplined_spontaneous: -0.8, independent_cooperative: 0.6,
    focused_scattered: -0.6, assertive_receptive: 0.3,
  },
  Capricorn: {
    disciplined_spontaneous: 1, active_passive: 0.3, confident_cautious: -0.5,
    optimistic_pessimistic: -0.6, abstract_concrete: -0.7, stable_changeable: 0.8,
    focused_scattered: 0.8, assertive_receptive: 0.3,
  },
  Aquarius: {
    independent_cooperative: 0.8, abstract_concrete: 0.8, extroverted_introverted: 0.3,
    stable_changeable: -0.5, intuitive_analytical: -0.3, disciplined_spontaneous: -0.3,
    active_passive: 0.3,
  },
  Pisces: {
    emotional_rational: 0.8, intuitive_analytical: 1, extroverted_introverted: -0.8,
    abstract_concrete: 0.6, active_passive: -0.8, assertive_receptive: -0.8,
    focused_scattered: -0.5, stable_changeable: -0.5,
  },
};

/* ── House → Dimension Contributions ── */
const HOUSE_DIMENSIONS: Record<number, DimContrib> = {
  1:  { active_passive: 0.5, independent_cooperative: 0.5, assertive_receptive: 0.5 },
  2:  { abstract_concrete: -0.3, stable_changeable: 0.3 },
  3:  { extroverted_introverted: 0.3, focused_scattered: -0.3 },
  4:  { extroverted_introverted: -0.4, emotional_rational: 0.3, stable_changeable: 0.3 },
  5:  { extroverted_introverted: 0.4, confident_cautious: 0.3, active_passive: 0.3 },
  6:  { disciplined_spontaneous: 0.3, abstract_concrete: -0.3 },
  7:  { independent_cooperative: -0.5, extroverted_introverted: 0.3 },
  8:  { emotional_rational: 0.3, extroverted_introverted: -0.3, focused_scattered: 0.4 },
  9:  { abstract_concrete: 0.4, optimistic_pessimistic: 0.3 },
  10: { active_passive: 0.3, disciplined_spontaneous: 0.3, confident_cautious: 0.3 },
  11: { independent_cooperative: -0.3, extroverted_introverted: 0.3 },
  12: { extroverted_introverted: -0.5, intuitive_analytical: 0.4, active_passive: -0.3 },
};

/* ── Element & Modality Balance ── */

export interface ElementBalance {
  fire: number;
  earth: number;
  air: number;
  water: number;
  dominant: string;
  missing: string | null;
  description: string;
}

export interface ModalityBalance {
  cardinal: number;
  fixed: number;
  mutable: number;
  dominant: string;
  description: string;
}

export interface HemisphereBalance {
  above: number;  // houses 7-12
  below: number;  // houses 1-6
  east: number;   // houses 10-3 (counterclockwise)
  west: number;   // houses 4-9
  description: string;
}

/* ── Profile Result ── */

export interface DimensionDriver {
  planet: string;
  contribution: number; // positive = left, negative = right
}

export interface DimensionScore {
  id: string;
  left: string;
  right: string;
  description: string;
  /** -10 to +10: positive = left pole, negative = right pole */
  score: number;
  /** 0-1 normalized position for display (0 = full right, 0.5 = center, 1 = full left) */
  position: number;
  /** Which planet(s) drive this most */
  topDrivers: string[];
  /** Full breakdown of all contributing planets */
  drivers: DimensionDriver[];
}

export interface PsychProfile {
  dimensions: DimensionScore[];
  elements: ElementBalance;
  modality: ModalityBalance;
  hemispheres: HemisphereBalance;
}

export interface BlendedDimension extends DimensionScore {
  natalScore: number;
  natalPosition: number;
  srScore: number;
  srPosition: number;
  blendType: 'reinforced' | 'tension' | 'shift';
  blendDescription: string;
}

export interface BlendedProfile {
  dimensions: BlendedDimension[];
  elements: { natal: ElementBalance; sr: ElementBalance };
  modality: { natal: ModalityBalance; sr: ModalityBalance };
  hemispheres: { natal: HemisphereBalance; sr: HemisphereBalance };
}

/* ── Chart Data Interface ── */
interface ChartInput {
  planets: Record<string, { sign: string; degree: number; minutes?: number; retrograde?: boolean } | undefined>;
  houseCusps?: Record<string, { sign: string; degree: number; minutes?: number }>;
}

function getHouseForPlanet(planet: string, chart: ChartInput): number | null {
  // Simple degree-based house placement
  if (!chart.houseCusps) return null;
  const pos = chart.planets[planet];
  if (!pos) return null;
  const idx = SIGNS.indexOf(pos.sign as any);
  if (idx < 0) return null;
  const planetDeg = idx * 30 + (pos.degree || 0) + ((pos.minutes || 0) / 60);
  
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = chart.houseCusps[`house${i}`];
    if (!c) return null;
    const ci = SIGNS.indexOf(c.sign as any);
    if (ci < 0) return null;
    cusps.push(ci * 30 + (c.degree || 0) + ((c.minutes || 0) / 60));
  }
  
  for (let i = 0; i < 12; i++) {
    const next = (i + 1) % 12;
    let start = cusps[i];
    let end = cusps[next];
    let deg = planetDeg;
    if (end < start) { // wraps around 360
      if (deg < start) deg += 360;
      end += 360;
    }
    if (deg >= start && deg < end) return i + 1;
  }
  return 1;
}

/* ── Core Calculation ── */

export function computePsychProfile(chart: ChartInput): PsychProfile {
  const dimScores: Record<string, { total: number; drivers: { planet: string; contrib: number; raw: number }[] }> = {};
  DIMENSIONS.forEach(d => { dimScores[d.id] = { total: 0, drivers: [] }; });
  
  const elementCounts = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalityCounts = { cardinal: 0, fixed: 0, mutable: 0 };
  const hemiCounts = { above: 0, below: 0, east: 0, west: 0 };

  // Process ASC separately
  const asc = chart.houseCusps?.house1;
  if (asc?.sign) {
    const signContrib = SIGN_DIMENSIONS[asc.sign];
    if (signContrib) {
      for (const [dimId, value] of Object.entries(signContrib)) {
        if (dimScores[dimId]) {
          const w = ANGLE_WEIGHT * value;
          dimScores[dimId].total += w;
          dimScores[dimId].drivers.push({ planet: 'Ascendant', contrib: Math.abs(w), raw: w });
        }
      }
    }
    const el = SIGN_ELEMENT[asc.sign];
    if (el) elementCounts[el.toLowerCase() as keyof typeof elementCounts] += ANGLE_WEIGHT;
    const mod = SIGN_MODALITY[asc.sign];
    if (mod) modalityCounts[mod.toLowerCase() as keyof typeof modalityCounts] += ANGLE_WEIGHT;
  }

  // Process MC
  const mc = chart.houseCusps?.house10;
  if (mc?.sign) {
    const signContrib = SIGN_DIMENSIONS[mc.sign];
    if (signContrib) {
      for (const [dimId, value] of Object.entries(signContrib)) {
        if (dimScores[dimId]) {
          const w = 5 * value;
          dimScores[dimId].total += w;
          dimScores[dimId].drivers.push({ planet: 'MC', contrib: Math.abs(w), raw: w });
        }
      }
    }
    const el = SIGN_ELEMENT[mc.sign];
    if (el) elementCounts[el.toLowerCase() as keyof typeof elementCounts] += 5;
    const mod = SIGN_MODALITY[mc.sign];
    if (mod) modalityCounts[mod.toLowerCase() as keyof typeof modalityCounts] += 5;
  }

  // Process each planet
  const planetNames = Object.keys(PLANET_WEIGHT);
  for (const pName of planetNames) {
    const pos = chart.planets[pName];
    if (!pos?.sign) continue;
    const weight = PLANET_WEIGHT[pName] || 1;
    
    // Sign contribution
    const signContrib = SIGN_DIMENSIONS[pos.sign];
    if (signContrib) {
      for (const [dimId, value] of Object.entries(signContrib)) {
        if (dimScores[dimId]) {
          const w = weight * value;
          dimScores[dimId].total += w;
          dimScores[dimId].drivers.push({ planet: pName, contrib: Math.abs(w), raw: w });
        }
      }
    }
    
    // House contribution
    const house = getHouseForPlanet(pName, chart);
    if (house) {
      const houseContrib = HOUSE_DIMENSIONS[house];
      if (houseContrib) {
        for (const [dimId, value] of Object.entries(houseContrib)) {
          if (dimScores[dimId]) {
            const w = weight * value * 0.5; // houses are secondary to signs
            dimScores[dimId].total += w;
          }
        }
      }
      
      // Hemisphere
      if (house >= 7 && house <= 12) hemiCounts.above += weight;
      else hemiCounts.below += weight;
      
      // East = 10,11,12,1,2,3; West = 4,5,6,7,8,9
      if ([10,11,12,1,2,3].includes(house)) hemiCounts.east += weight;
      else hemiCounts.west += weight;
    }
    
    // Element & modality
    const el = SIGN_ELEMENT[pos.sign];
    if (el) elementCounts[el.toLowerCase() as keyof typeof elementCounts] += weight;
    const mod = SIGN_MODALITY[pos.sign];
    if (mod) modalityCounts[mod.toLowerCase() as keyof typeof modalityCounts] += weight;
  }

  // Normalize dimension scores to -10..+10
  const maxRaw = 50; // approximate max possible raw score
  const dimensions: DimensionScore[] = DIMENSIONS.map(dim => {
    const raw = dimScores[dim.id].total;
    const score = Math.max(-10, Math.min(10, (raw / maxRaw) * 10));
    const position = (score + 10) / 20; // 0=full right, 1=full left
    
    // Aggregate drivers by planet (sum raw contributions)
    const driverMap = new Map<string, number>();
    for (const d of dimScores[dim.id].drivers) {
      driverMap.set(d.planet, (driverMap.get(d.planet) || 0) + d.raw);
    }
    const allDrivers: DimensionDriver[] = Array.from(driverMap.entries())
      .map(([planet, contribution]) => ({ planet, contribution }))
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
    
    const sorted = allDrivers.slice(0, 3);
    
    return {
      id: dim.id,
      left: dim.left,
      right: dim.right,
      description: dim.description,
      score: Math.round(score * 10) / 10,
      position: Math.round(position * 100) / 100,
      topDrivers: sorted.map(d => d.planet),
      drivers: allDrivers,
    };
  });

  // Element balance
  const totalEl = elementCounts.fire + elementCounts.earth + elementCounts.air + elementCounts.water;
  const elPcts = {
    fire: totalEl > 0 ? elementCounts.fire / totalEl : 0.25,
    earth: totalEl > 0 ? elementCounts.earth / totalEl : 0.25,
    air: totalEl > 0 ? elementCounts.air / totalEl : 0.25,
    water: totalEl > 0 ? elementCounts.water / totalEl : 0.25,
  };
  const elEntries = Object.entries(elPcts) as [string, number][];
  const domEl = elEntries.sort((a, b) => b[1] - a[1])[0][0];
  const minEl = elEntries[elEntries.length - 1];
  const missingEl = minEl[1] < 0.1 ? minEl[0] : null;

  const elDescs: Record<string, string> = {
    fire: 'Action-oriented, enthusiastic, and driven by inspiration. You lead with passion and initiative.',
    earth: 'Practical, grounded, and focused on tangible results. You build things that last.',
    air: 'Intellectually curious, communicative, and socially engaged. You process life through ideas.',
    water: 'Emotionally attuned, intuitive, and deeply feeling. You navigate by instinct and empathy.',
  };

  // Modality balance
  const totalMod = modalityCounts.cardinal + modalityCounts.fixed + modalityCounts.mutable;
  const modPcts = {
    cardinal: totalMod > 0 ? modalityCounts.cardinal / totalMod : 0.33,
    fixed: totalMod > 0 ? modalityCounts.fixed / totalMod : 0.33,
    mutable: totalMod > 0 ? modalityCounts.mutable / totalMod : 0.33,
  };
  const modEntries = Object.entries(modPcts) as [string, number][];
  const domMod = modEntries.sort((a, b) => b[1] - a[1])[0][0];

  const modDescs: Record<string, string> = {
    cardinal: 'An initiating, action-starting energy. You begin new things but may struggle to finish them.',
    fixed: 'A stabilizing, persistent energy. You follow through powerfully but may resist necessary change.',
    mutable: 'An adaptable, flexible energy. You handle change well but may lack follow-through or direction.',
  };

  // Hemisphere
  const totalHemiV = hemiCounts.above + hemiCounts.below;
  const totalHemiH = hemiCounts.east + hemiCounts.west;
  const hemiParts: string[] = [];
  if (totalHemiV > 0) {
    if (hemiCounts.above / totalHemiV > 0.6) hemiParts.push('Public-facing — energy directed toward the world, career, and social visibility');
    else if (hemiCounts.below / totalHemiV > 0.6) hemiParts.push('Private — energy directed inward toward personal foundations, home, and inner development');
    else hemiParts.push('Balanced between public and private life');
  }
  if (totalHemiH > 0) {
    if (hemiCounts.east / totalHemiH > 0.6) hemiParts.push('Self-directed — you set the agenda and take initiative');
    else if (hemiCounts.west / totalHemiH > 0.6) hemiParts.push('Other-directed — relationships and collaborations shape your path');
    else hemiParts.push('Balanced between self-direction and collaboration');
  }

  return {
    dimensions,
    elements: {
      ...elPcts,
      dominant: domEl.charAt(0).toUpperCase() + domEl.slice(1),
      missing: missingEl ? missingEl.charAt(0).toUpperCase() + missingEl.slice(1) : null,
      description: elDescs[domEl] || '',
    },
    modality: {
      ...modPcts,
      dominant: domMod.charAt(0).toUpperCase() + domMod.slice(1),
      description: modDescs[domMod] || '',
    },
    hemispheres: {
      ...hemiCounts,
      description: hemiParts.join('. ') || 'Balanced distribution across all hemispheres.',
    },
  };
}

/* ── Blended Profile: Natal + SR ── */

export function computeBlendedProfile(
  natalChart: ChartInput,
  srChart: ChartInput,
): BlendedProfile {
  const natal = computePsychProfile(natalChart);
  const sr = computePsychProfile(srChart);

  const dimensions: BlendedDimension[] = natal.dimensions.map((nd, i) => {
    const sd = sr.dimensions[i];
    
    // Blended score: natal is the baseline, SR modifies it
    // NOT a simple average — it's weighted: natal 60% baseline, SR 40% modification
    const blendedScore = nd.score * 0.6 + sd.score * 0.4;
    const blendedPosition = (blendedScore + 10) / 20;
    
    // Determine blend type
    const sameDirection = (nd.score >= 0 && sd.score >= 0) || (nd.score <= 0 && sd.score <= 0);
    const scoreDiff = Math.abs(nd.score - sd.score);
    
    let blendType: 'reinforced' | 'tension' | 'shift';
    let blendDescription: string;
    
    if (sameDirection && scoreDiff < 3) {
      blendType = 'reinforced';
      const pole = blendedScore >= 0 ? nd.left : nd.right;
      blendDescription = `Both your natal chart and this year's chart pull toward ${pole}. This is amplified — you'll feel this strongly.`;
    } else if (!sameDirection && scoreDiff > 4) {
      blendType = 'tension';
      const natalPole = nd.score >= 0 ? nd.left : nd.right;
      const srPole = sd.score >= 0 ? sd.left : sd.right;
      blendDescription = `Your natural ${natalPole} tendency is being challenged by a ${srPole} year. This creates friction — you may feel pulled in two directions. Growth happens in the discomfort.`;
    } else {
      blendType = 'shift';
      const srPole = sd.score >= 0 ? sd.left : sd.right;
      blendDescription = `This year gently shifts you toward ${srPole}. Not a dramatic change, but you'll notice the pull.`;
    }

    return {
      id: nd.id,
      left: nd.left,
      right: nd.right,
      description: nd.description,
      score: Math.round(blendedScore * 10) / 10,
      position: Math.round(blendedPosition * 100) / 100,
      topDrivers: [...new Set([...nd.topDrivers.slice(0, 2), ...sd.topDrivers.slice(0, 2)])],
      drivers: [...nd.drivers, ...sd.drivers].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)),
      natalScore: nd.score,
      natalPosition: nd.position,
      srScore: sd.score,
      srPosition: sd.position,
      blendType,
      blendDescription,
    };
  });

  return {
    dimensions,
    elements: { natal: natal.elements, sr: sr.elements },
    modality: { natal: natal.modality, sr: sr.modality },
    hemispheres: { natal: natal.hemispheres, sr: sr.hemispheres },
  };
}
