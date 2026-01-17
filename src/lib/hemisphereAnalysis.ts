// Hemisphere and Quadrant Analysis
// Analyzes the distribution of planets across the chart's four quadrants

import { ChartPlanet } from './chartDecoderLogic';

// ============================================================================
// TYPES
// ============================================================================

export interface QuadrantData {
  planets: string[];
  count: number;
  percentage: number;
}

export interface HemisphereData {
  upper: QuadrantData;  // Houses 7-12 (above horizon)
  lower: QuadrantData;  // Houses 1-6 (below horizon)
  eastern: QuadrantData; // Houses 10-12 & 1-3 (self-initiative)
  western: QuadrantData; // Houses 4-9 (other-oriented)
}

export interface QuadrantAnalysis {
  q1: QuadrantData & { theme: string; description: string }; // Houses 1-3
  q2: QuadrantData & { theme: string; description: string }; // Houses 4-6
  q3: QuadrantData & { theme: string; description: string }; // Houses 7-9
  q4: QuadrantData & { theme: string; description: string }; // Houses 10-12
  hemispheres: HemisphereData;
  dominantQuadrant: string;
  dominantHemispheres: string[];
  interpretation: string;
}

// ============================================================================
// QUADRANT MEANINGS
// ============================================================================

const QUADRANT_THEMES = {
  q1: {
    theme: 'Self-Development',
    description: 'Houses 1-3: Personal identity, resources, and communication. This is the most PERSONAL quadrant—about discovering and expressing who YOU are.',
    heavy: 'Your chart is weighted toward self-development. Your life journey centers on discovering your identity, building your resources, and finding your voice. You learn best through personal experience. The challenge: don\'t become so self-focused that you miss the larger world.',
    light: 'Fewer planets in the self-development quadrant suggests you\'re less focused on personal identity work. Your purpose involves others and the wider world more than internal self-discovery.'
  },
  q2: {
    theme: 'Security & Service',
    description: 'Houses 4-6: Home, creativity, and daily work. This quadrant is about creating FOUNDATIONS—emotional security, creative expression, and meaningful work.',
    heavy: 'Your chart is weighted toward security and service. Your life journey centers on building a home, expressing creativity, and perfecting your craft. You need solid foundations before you can expand outward. The challenge: don\'t get so rooted that you fear expansion.',
    light: 'Fewer planets in the security quadrant suggests you\'re less focused on building foundations. Your purpose may involve more public/relational work than private building.'
  },
  q3: {
    theme: 'Relationship & Expansion',
    description: 'Houses 7-9: Partnership, transformation, and higher learning. This quadrant is about growing through OTHERS—relationships, depth work, and expanded horizons.',
    heavy: 'Your chart is weighted toward relationship and expansion. Your life journey centers on partnerships, deep transformation, and discovering meaning through broader perspectives. You learn best through engagement with others and ideas beyond yourself. The challenge: don\'t lose yourself in others or philosophies.',
    light: 'Fewer planets in the relationship quadrant suggests your primary work isn\'t about partnership or expansion. Your purpose may be more personal or career-focused.'
  },
  q4: {
    theme: 'Career & Legacy',
    description: 'Houses 10-12: Public role, community, and transcendence. This quadrant is about your CONTRIBUTION—what you leave behind, how you serve the collective.',
    heavy: 'Your chart is weighted toward career and legacy. Your life journey centers on public achievement, community involvement, and spiritual transcendence. You\'re meant to be visible and to contribute to something larger than yourself. The challenge: don\'t neglect personal/private life for public success.',
    light: 'Fewer planets in the career quadrant suggests your purpose is less about public achievement. Your work may be more private, personal, or relational.'
  }
};

const HEMISPHERE_MEANINGS = {
  upper: {
    theme: 'Public & External',
    heavy: 'Most of your planets are ABOVE the horizon (houses 7-12). You are meant to be visible, public-facing, and engaged with the outer world. Your purpose unfolds in relationships, career, and collective involvement. You may feel most alive when others are watching.',
    light: 'With fewer planets above the horizon, your work is more internal and private. You develop yourself before presenting to the world.'
  },
  lower: {
    theme: 'Private & Internal',
    heavy: 'Most of your planets are BELOW the horizon (houses 1-6). You are meant to be more private, internal, and focused on personal development. Your purpose unfolds through self-discovery, building foundations, and perfecting your craft. The outer world receives the finished product.',
    light: 'With fewer planets below the horizon, your work is more public and external. You develop through engagement with others.'
  },
  eastern: {
    theme: 'Self-Initiated',
    heavy: 'Most of your planets are in the EASTERN hemisphere (houses 10-12 & 1-3). You are meant to INITIATE—to act from your own will, to start things, to lead. You don\'t wait for permission or for others to invite you. Your life is self-directed.',
    light: 'With fewer planets in the Eastern hemisphere, your work unfolds through response and collaboration rather than solo initiative.'
  },
  western: {
    theme: 'Other-Oriented',
    heavy: 'Most of your planets are in the WESTERN hemisphere (houses 4-9). You are meant to RESPOND—to collaborate, to partner, to let others initiate. You find yourself through relationship and reaction. Your life unfolds through connection with others.',
    light: 'With fewer planets in the Western hemisphere, your work is more self-directed. You don\'t need others to get moving.'
  }
};

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Get which quadrant a house belongs to
 */
function getQuadrant(house: number): 'q1' | 'q2' | 'q3' | 'q4' {
  if (house >= 1 && house <= 3) return 'q1';
  if (house >= 4 && house <= 6) return 'q2';
  if (house >= 7 && house <= 9) return 'q3';
  return 'q4'; // 10-12
}

/**
 * Analyze the distribution of planets across hemispheres and quadrants
 */
export function analyzeQuadrants(planets: ChartPlanet[]): QuadrantAnalysis {
  // Filter to planets with house positions (exclude planets without houses)
  const planetsWithHouses = planets.filter(p => p.house !== null && p.house !== undefined);
  
  // Exclude angles from count (Ascendant, Midheaven are points not planets)
  const countablePlanets = planetsWithHouses.filter(p => 
    !['Ascendant', 'Midheaven'].includes(p.name)
  );
  
  const total = countablePlanets.length;
  
  // Initialize quadrants
  const quadrants: Record<'q1' | 'q2' | 'q3' | 'q4', string[]> = {
    q1: [],
    q2: [],
    q3: [],
    q4: []
  };
  
  // Initialize hemispheres
  const hemispheres = {
    upper: [] as string[],  // 7-12
    lower: [] as string[],  // 1-6
    eastern: [] as string[], // 10-12, 1-3
    western: [] as string[]  // 4-9
  };
  
  // Distribute planets
  for (const planet of countablePlanets) {
    const house = planet.house!;
    const quadrant = getQuadrant(house);
    
    quadrants[quadrant].push(planet.name);
    
    // Hemisphere distribution
    if (house >= 7 && house <= 12) {
      hemispheres.upper.push(planet.name);
    } else {
      hemispheres.lower.push(planet.name);
    }
    
    if (house >= 10 || house <= 3) {
      hemispheres.eastern.push(planet.name);
    } else {
      hemispheres.western.push(planet.name);
    }
  }
  
  // Calculate percentages
  const calcPercentage = (count: number) => total > 0 ? Math.round((count / total) * 100) : 0;
  
  // Build analysis
  const q1Data = {
    planets: quadrants.q1,
    count: quadrants.q1.length,
    percentage: calcPercentage(quadrants.q1.length),
    ...QUADRANT_THEMES.q1
  };
  
  const q2Data = {
    planets: quadrants.q2,
    count: quadrants.q2.length,
    percentage: calcPercentage(quadrants.q2.length),
    ...QUADRANT_THEMES.q2
  };
  
  const q3Data = {
    planets: quadrants.q3,
    count: quadrants.q3.length,
    percentage: calcPercentage(quadrants.q3.length),
    ...QUADRANT_THEMES.q3
  };
  
  const q4Data = {
    planets: quadrants.q4,
    count: quadrants.q4.length,
    percentage: calcPercentage(quadrants.q4.length),
    ...QUADRANT_THEMES.q4
  };
  
  const hemisphereData: HemisphereData = {
    upper: {
      planets: hemispheres.upper,
      count: hemispheres.upper.length,
      percentage: calcPercentage(hemispheres.upper.length)
    },
    lower: {
      planets: hemispheres.lower,
      count: hemispheres.lower.length,
      percentage: calcPercentage(hemispheres.lower.length)
    },
    eastern: {
      planets: hemispheres.eastern,
      count: hemispheres.eastern.length,
      percentage: calcPercentage(hemispheres.eastern.length)
    },
    western: {
      planets: hemispheres.western,
      count: hemispheres.western.length,
      percentage: calcPercentage(hemispheres.western.length)
    }
  };
  
  // Determine dominant quadrant
  const quadrantCounts = [
    { name: 'Q1 (Self-Development)', count: q1Data.count },
    { name: 'Q2 (Security & Service)', count: q2Data.count },
    { name: 'Q3 (Relationship & Expansion)', count: q3Data.count },
    { name: 'Q4 (Career & Legacy)', count: q4Data.count }
  ];
  
  const maxCount = Math.max(...quadrantCounts.map(q => q.count));
  const dominantQuadrant = quadrantCounts.filter(q => q.count === maxCount).map(q => q.name).join(' & ');
  
  // Determine dominant hemispheres
  const dominantHemispheres: string[] = [];
  
  if (hemisphereData.upper.percentage > 60) {
    dominantHemispheres.push('Upper (Public/External)');
  } else if (hemisphereData.lower.percentage > 60) {
    dominantHemispheres.push('Lower (Private/Internal)');
  }
  
  if (hemisphereData.eastern.percentage > 60) {
    dominantHemispheres.push('Eastern (Self-Initiated)');
  } else if (hemisphereData.western.percentage > 60) {
    dominantHemispheres.push('Western (Other-Oriented)');
  }
  
  // Generate interpretation
  let interpretation = '';
  
  // Quadrant interpretation
  if (maxCount >= 4) {
    const dominantQ = quadrantCounts.find(q => q.count === maxCount);
    if (dominantQ) {
      const qKey = dominantQ.name.split(' ')[0].toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4';
      interpretation += QUADRANT_THEMES[qKey].heavy + ' ';
    }
  } else {
    interpretation += 'Your planets are relatively balanced across quadrants, giving you versatility across life areas. ';
  }
  
  // Hemisphere interpretation
  if (hemisphereData.upper.percentage > 65) {
    interpretation += HEMISPHERE_MEANINGS.upper.heavy + ' ';
  } else if (hemisphereData.lower.percentage > 65) {
    interpretation += HEMISPHERE_MEANINGS.lower.heavy + ' ';
  }
  
  if (hemisphereData.eastern.percentage > 65) {
    interpretation += HEMISPHERE_MEANINGS.eastern.heavy;
  } else if (hemisphereData.western.percentage > 65) {
    interpretation += HEMISPHERE_MEANINGS.western.heavy;
  }
  
  if (!interpretation.trim()) {
    interpretation = 'Your chart shows a balanced distribution of planets across all areas of life. You have access to both public and private realms, can initiate and respond, and have resources for all life domains.';
  }
  
  return {
    q1: q1Data,
    q2: q2Data,
    q3: q3Data,
    q4: q4Data,
    hemispheres: hemisphereData,
    dominantQuadrant,
    dominantHemispheres,
    interpretation
  };
}

/**
 * Get a simple hemisphere summary for display
 */
export function getHemisphereSummary(analysis: QuadrantAnalysis): string[] {
  const summary: string[] = [];
  
  if (analysis.hemispheres.upper.percentage > 55) {
    summary.push(`${analysis.hemispheres.upper.percentage}% above horizon → Public-facing, visible path`);
  } else if (analysis.hemispheres.lower.percentage > 55) {
    summary.push(`${analysis.hemispheres.lower.percentage}% below horizon → Private, internal path`);
  }
  
  if (analysis.hemispheres.eastern.percentage > 55) {
    summary.push(`${analysis.hemispheres.eastern.percentage}% Eastern → Self-initiating, independent`);
  } else if (analysis.hemispheres.western.percentage > 55) {
    summary.push(`${analysis.hemispheres.western.percentage}% Western → Collaborative, responsive`);
  }
  
  if (summary.length === 0) {
    summary.push('Balanced distribution → Versatility across all life areas');
  }
  
  return summary;
}
