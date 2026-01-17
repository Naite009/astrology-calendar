// Chart Shape Detection
// Identifies the overall pattern/shape formed by planetary distribution

import { ChartPlanet, toAbsoluteDegree } from './chartDecoderLogic';

// ============================================================================
// TYPES
// ============================================================================

export type ChartShapeType = 
  | 'Bowl'
  | 'Bucket'
  | 'Bundle'
  | 'Locomotive'
  | 'Seesaw'
  | 'Splash'
  | 'Splay'
  | 'Unknown';

export interface ChartShape {
  type: ChartShapeType;
  confidence: number; // 0-100
  description: string;
  personality: string;
  gift: string;
  challenge: string;
  leadPlanet?: string; // For Bucket/Locomotive patterns
  emptyArea?: string; // Description of the empty portion
}

// ============================================================================
// SHAPE DEFINITIONS
// ============================================================================

const SHAPE_DATA: Record<ChartShapeType, Omit<ChartShape, 'type' | 'confidence' | 'leadPlanet' | 'emptyArea'>> = {
  Bowl: {
    description: 'All planets occupy 180° or less of the zodiac, leaving half the chart empty.',
    personality: 'You are a CONTAINER. Your energy is focused, directed, and purposeful. You carry a half of life within you that you\'ve mastered, while perpetually gazing at the empty half—the unlived life, the unexplored territory, the "other" you haven\'t integrated.',
    gift: 'Concentrated focus, clear purpose, ability to hold and contain energy, self-containment',
    challenge: 'Obsession with what\'s missing, feeling incomplete, projection onto others who represent the empty half'
  },
  Bucket: {
    description: 'A Bowl pattern with one planet (the "handle") isolated on the opposite side.',
    personality: 'You have focused energy (the Bowl) with a SINGLE OUTLET (the handle planet). All your concentrated power flows through one channel. The handle planet is your point of release, your funnel for expression, your key to the world.',
    gift: 'Powerful focus with a clear outlet, ability to channel concentrated energy, distinctive impact point',
    challenge: 'Over-reliance on the handle planet, if that area is blocked you feel stuck, potential for obsession'
  },
  Bundle: {
    description: 'All planets are concentrated within 120° or less (one-third of the zodiac).',
    personality: 'You are INTENSELY SPECIALIZED. Your entire being is focused on one area of life. You have laser focus, deep expertise, and powerful concentration—but a very narrow range of experience.',
    gift: 'Extreme specialization, mastery of a focused area, powerful concentration of energy',
    challenge: 'Lack of perspective, difficulty with areas outside your focus, potential for obsession, missing whole life areas'
  },
  Locomotive: {
    description: 'Planets span about 240° (two-thirds of zodiac), leaving one-third empty.',
    personality: 'You are a TRAIN—powerful, driven, always moving toward the empty space. The leading planet (at the front of the empty space, moving clockwise) drives the whole engine. You have momentum, purpose, and an endless drive to fill what\'s missing.',
    gift: 'Tremendous drive, self-motivation, ability to pull others along, natural momentum',
    challenge: 'Never satisfied, always chasing, difficulty resting, can run over obstacles (and people)'
  },
  Seesaw: {
    description: 'Planets form two groups roughly opposite each other, with two empty areas.',
    personality: 'You live in POLARITIES. You see both sides of everything, swing between opposites, and seek balance through oscillation. You are the diplomat, the mediator, the one who understands both perspectives—but also the one who can\'t decide.',
    gift: 'Objectivity, ability to see all perspectives, diplomatic skills, balance through integration of opposites',
    challenge: 'Indecision, feeling pulled apart, projection, difficulty committing to one path'
  },
  Splash: {
    description: 'Planets are scattered relatively evenly around the entire zodiac.',
    personality: 'You are a RENAISSANCE SOUL. You have fingers in every pie, interests in every direction, and the ability to engage with all of life. Nothing is foreign to you. You are versatile, adaptable, and universally capable.',
    gift: 'Versatility, adaptability, broad competence, ability to understand and engage with anything',
    challenge: 'Scattered energy, jack of all trades/master of none, difficulty focusing, overwhelm from too many options'
  },
  Splay: {
    description: 'Planets form irregular clusters (stelliums) with uneven spacing.',
    personality: 'You are an INDIVIDUAL. You don\'t fit patterns. Your chart has distinct power centers (the clusters) and gaps. You are strong-willed, independent, and resist categorization. Your life has specific focal points of intensity.',
    gift: 'Individuality, strong will, ability to resist conformity, distinct power centers',
    challenge: 'Stubbornness, difficulty cooperating, uneven development, gaps in life experience'
  },
  Unknown: {
    description: 'No clear pattern emerges from the planetary distribution.',
    personality: 'Your chart doesn\'t conform to a single recognized pattern, which may indicate unique complexity or a combination of tendencies.',
    gift: 'Uniqueness, complexity, freedom from categorical limitations',
    challenge: 'May lack the focused expression that clearer patterns provide'
  }
};

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

/**
 * Get absolute positions of all planets
 */
function getPlanetPositions(planets: ChartPlanet[]): { name: string; degree: number }[] {
  // Exclude angles and points that aren't "real" planets for shape detection
  const excludeList = ['Ascendant', 'Midheaven', 'NorthNode', 'SouthNode'];
  
  return planets
    .filter(p => !excludeList.includes(p.name))
    .map(p => ({
      name: p.name,
      degree: toAbsoluteDegree(p.sign, p.degree)
    }))
    .sort((a, b) => a.degree - b.degree);
}

/**
 * Calculate the span of planets (largest gap)
 */
function calculateSpan(positions: { name: string; degree: number }[]): {
  span: number;
  largestGap: number;
  leadingPlanet: string;
  trailingPlanet: string;
  emptyStart: number;
  emptyEnd: number;
} {
  if (positions.length < 2) {
    return { span: 0, largestGap: 360, leadingPlanet: '', trailingPlanet: '', emptyStart: 0, emptyEnd: 360 };
  }
  
  let largestGap = 0;
  let gapStart = 0;
  let gapEnd = 0;
  let leadingPlanet = '';
  let trailingPlanet = '';
  
  // Check gaps between consecutive planets
  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const next = positions[(i + 1) % positions.length];
    
    let gap = next.degree - current.degree;
    if (gap < 0) gap += 360; // Handle wrap-around
    
    if (gap > largestGap) {
      largestGap = gap;
      gapStart = current.degree;
      gapEnd = next.degree;
      trailingPlanet = current.name; // Planet before the gap
      leadingPlanet = next.name; // Planet after the gap (leads the occupied section)
    }
  }
  
  const span = 360 - largestGap;
  
  return {
    span,
    largestGap,
    leadingPlanet,
    trailingPlanet,
    emptyStart: gapStart,
    emptyEnd: gapEnd
  };
}

/**
 * Count the number of significant gaps in the chart
 */
function countSignificantGaps(positions: { name: string; degree: number }[], threshold: number = 60): number {
  let gaps = 0;
  
  for (let i = 0; i < positions.length; i++) {
    const current = positions[i];
    const next = positions[(i + 1) % positions.length];
    
    let gap = next.degree - current.degree;
    if (gap < 0) gap += 360;
    
    if (gap >= threshold) {
      gaps++;
    }
  }
  
  return gaps;
}

/**
 * Check if there's a single planet isolated (for Bucket pattern)
 */
function findIsolatedPlanet(
  positions: { name: string; degree: number }[],
  mainSpan: { start: number; end: number }
): string | null {
  // Look for a planet that's significantly separated from the main group
  // This planet should be in the "empty" half with no nearby companions
  
  for (const planet of positions) {
    // Check if this planet is in the empty area
    let inEmptyArea = false;
    
    if (mainSpan.start < mainSpan.end) {
      // Normal case
      inEmptyArea = planet.degree < mainSpan.start || planet.degree > mainSpan.end;
    } else {
      // Wrap-around case
      inEmptyArea = planet.degree < mainSpan.start && planet.degree > mainSpan.end;
    }
    
    if (inEmptyArea) {
      // Check if it's alone (no other planets within 30°)
      let isAlone = true;
      for (const other of positions) {
        if (other.name === planet.name) continue;
        
        let dist = Math.abs(other.degree - planet.degree);
        if (dist > 180) dist = 360 - dist;
        
        if (dist < 30) {
          isAlone = false;
          break;
        }
      }
      
      if (isAlone) {
        return planet.name;
      }
    }
  }
  
  return null;
}

/**
 * Check for stelliums (3+ planets within 30°)
 */
function countStelliums(positions: { name: string; degree: number }[]): number {
  let stelliums = 0;
  const counted = new Set<string>();
  
  for (let i = 0; i < positions.length; i++) {
    if (counted.has(positions[i].name)) continue;
    
    const cluster = [positions[i]];
    
    for (let j = i + 1; j < positions.length; j++) {
      let dist = positions[j].degree - positions[i].degree;
      if (dist < 0) dist += 360;
      
      if (dist <= 30) {
        cluster.push(positions[j]);
      }
    }
    
    if (cluster.length >= 3) {
      stelliums++;
      cluster.forEach(p => counted.add(p.name));
    }
  }
  
  return stelliums;
}

/**
 * Detect the chart shape
 */
export function detectChartShape(planets: ChartPlanet[]): ChartShape {
  const positions = getPlanetPositions(planets);
  
  if (positions.length < 4) {
    return {
      type: 'Unknown',
      confidence: 0,
      ...SHAPE_DATA.Unknown
    };
  }
  
  const { span, largestGap, leadingPlanet, emptyStart, emptyEnd } = calculateSpan(positions);
  const significantGaps = countSignificantGaps(positions);
  const stelliums = countStelliums(positions);
  
  // Determine shape based on span and gaps
  
  // BUNDLE: Span 120° or less
  if (span <= 130) {
    return {
      type: 'Bundle',
      confidence: Math.min(95, 100 - (span - 90)),
      ...SHAPE_DATA.Bundle,
      emptyArea: `Two-thirds of your zodiac (${Math.round(largestGap)}°) is empty—uncharted territory in your life.`
    };
  }
  
  // BOWL: Span 180° or less (but more than bundle)
  if (span <= 190) {
    // Check for Bucket (Bowl + handle)
    const isolatedPlanet = findIsolatedPlanet(positions, { start: emptyStart, end: emptyEnd });
    
    if (isolatedPlanet && largestGap > 150) {
      return {
        type: 'Bucket',
        confidence: 85,
        ...SHAPE_DATA.Bucket,
        leadPlanet: isolatedPlanet,
        emptyArea: `Your chart has a bowl shape with ${isolatedPlanet} as the "handle"—your point of focused release.`
      };
    }
    
    return {
      type: 'Bowl',
      confidence: Math.min(90, 100 - Math.abs(180 - span)),
      ...SHAPE_DATA.Bowl,
      emptyArea: `Half your zodiac (${Math.round(largestGap)}°) is empty—the unlived half of life you gaze toward.`
    };
  }
  
  // LOCOMOTIVE: Span ~240° (2/3 of zodiac)
  if (span >= 200 && span <= 270 && largestGap >= 90 && largestGap <= 160) {
    return {
      type: 'Locomotive',
      confidence: Math.min(85, 100 - Math.abs(240 - span) / 2),
      ...SHAPE_DATA.Locomotive,
      leadPlanet: leadingPlanet,
      emptyArea: `One-third of your zodiac (${Math.round(largestGap)}°) is empty—the void you're always driving toward, with ${leadingPlanet} as your engine.`
    };
  }
  
  // SEESAW: Two significant gaps (two groups opposite)
  if (significantGaps === 2 && largestGap >= 60 && largestGap <= 150) {
    return {
      type: 'Seesaw',
      confidence: 80,
      ...SHAPE_DATA.Seesaw,
      emptyArea: 'Your planets form two opposing groups, creating a dynamic of polarities and balance-seeking.'
    };
  }
  
  // SPLAY: Irregular clusters (stelliums with gaps)
  if (stelliums >= 2 || (stelliums >= 1 && significantGaps >= 2)) {
    return {
      type: 'Splay',
      confidence: 75,
      ...SHAPE_DATA.Splay,
      emptyArea: 'Your chart has distinct power centers (stelliums) with irregular spacing—a highly individual pattern.'
    };
  }
  
  // SPLASH: Relatively even distribution
  if (largestGap < 90 && significantGaps <= 1) {
    return {
      type: 'Splash',
      confidence: 70,
      ...SHAPE_DATA.Splash,
      emptyArea: 'Your planets are scattered across the zodiac—you have access to all areas of life experience.'
    };
  }
  
  // Default to Splay or Unknown for unclear patterns
  if (stelliums >= 1) {
    return {
      type: 'Splay',
      confidence: 60,
      ...SHAPE_DATA.Splay
    };
  }
  
  return {
    type: 'Unknown',
    confidence: 40,
    ...SHAPE_DATA.Unknown
  };
}

/**
 * Get a brief summary of the chart shape
 */
export function getShapeSummary(shape: ChartShape): string {
  return `${shape.type} pattern: ${shape.personality.split('.')[0]}.`;
}
