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
  | 'Tripod'
  | 'Fan'
  | 'GrandCross'
  | 'Kite'
  | 'TSquare'
  | 'StarOfDavid'
  | 'Yod'
  | 'MysticRectangle'
  | 'Unknown';

export interface SecondaryShapeInfo {
  type: ChartShapeType;
  confidence: number;
  description: string;
  personality: string;
  gift: string;
  challenge: string;
  teaching: string;
  involvedPlanets?: string[];
  leadPlanet?: string;
}

export interface ChartShape {
  type: ChartShapeType;
  confidence: number; // 0-100
  description: string;
  personality: string;
  gift: string;
  challenge: string;
  teaching: string;
  leadPlanet?: string;
  emptyArea?: string;
  involvedPlanets?: string[];
  secondaryShapes?: SecondaryShapeInfo[];
  // Legacy compat
  secondaryShape?: {
    type: ChartShapeType;
    confidence: number;
    description: string;
  };
}

// ============================================================================
// SHAPE DEFINITIONS
// ============================================================================

interface ShapeInfo {
  description: string;
  personality: string;
  gift: string;
  challenge: string;
  teaching: string;
}

const SHAPE_DATA: Record<ChartShapeType, ShapeInfo> = {
  Bowl: {
    description: 'All planets occupy 180° or less of the zodiac, leaving half the chart empty.',
    personality: 'You are a CONTAINER. Your energy is focused, directed, and purposeful. You carry a half of life within you that you\'ve mastered, while perpetually gazing at the empty half—the unlived life, the unexplored territory, the "other" you haven\'t integrated.',
    gift: 'Concentrated focus, clear purpose, ability to hold and contain energy, self-containment',
    challenge: 'Obsession with what\'s missing, feeling incomplete, projection onto others who represent the empty half',
    teaching: 'The Bowl native carries a deep sense of purpose born from limitation. Half the zodiac is empty — and that emptiness is not lack, it is longing. You are here to master what you carry, and to learn what you don\'t through others. The rim planets (first and last in the occupied half) are your gatekeepers — they define how you engage with the unknown. Your life question is: "What am I here to hold, and what am I here to reach toward?"',
  },
  Bucket: {
    description: 'A Bowl pattern with one planet (the "handle") isolated on the opposite side.',
    personality: 'You have focused energy (the Bowl) with a SINGLE OUTLET (the handle planet). All your concentrated power flows through one channel. The handle planet is your point of release, your funnel for expression, your key to the world.',
    gift: 'Powerful focus with a clear outlet, ability to channel concentrated energy, distinctive impact point',
    challenge: 'Over-reliance on the handle planet, if that area is blocked you feel stuck, potential for obsession',
    teaching: 'The Bucket is one of the most dynamic chart shapes. You have concentrated energy (the Bowl portion) with a single release valve — the handle planet. ALL of your focused power eventually flows through this one channel. If you know someone with a Bucket, watch the handle planet: it\'s their key to the world, their point of maximum impact. When the handle is blocked, the entire system stalls. When it flows, they are unstoppable.',
  },
  Bundle: {
    description: 'All planets are concentrated within 120° or less (one-third of the zodiac).',
    personality: 'You are INTENSELY SPECIALIZED. Your entire being is focused on one area of life. You have laser focus, deep expertise, and powerful concentration—but a very narrow range of experience.',
    gift: 'Extreme specialization, mastery of a focused area, powerful concentration of energy',
    challenge: 'Lack of perspective, difficulty with areas outside your focus, potential for obsession, missing whole life areas',
    teaching: 'The Bundle is the rarest and most intensely focused chart shape. Everything you are lives in one-third of the zodiac. This creates extraordinary specialization but also profound blind spots. You are a laser, not a floodlight. The teaching here is radical acceptance: you are not meant to do everything. You are meant to do one thing with terrifying depth.',
  },
  Locomotive: {
    description: 'Planets span about 240° (two-thirds of zodiac), leaving one-third empty.',
    personality: 'You are a TRAIN—powerful, driven, always moving toward the empty space. The leading planet (at the front of the empty space, moving clockwise) drives the whole engine. You have momentum, purpose, and an endless drive to fill what\'s missing.',
    gift: 'Tremendous drive, self-motivation, ability to pull others along, natural momentum',
    challenge: 'Never satisfied, always chasing, difficulty resting, can run over obstacles (and people)',
    teaching: 'The Locomotive is driven by what\'s missing. One-third of your zodiac is empty, and you spend your life building toward that void. The leading planet (clockwise edge of the empty space) is your engine — it pulls everything forward. You have natural momentum that others lack. The danger is never stopping, never resting, always chasing the horizon. The gift is that you actually get there.',
  },
  Seesaw: {
    description: 'Planets form two groups roughly opposite each other, with two empty areas.',
    personality: 'You live in POLARITIES. You see both sides of everything, swing between opposites, and seek balance through oscillation. You are the diplomat, the mediator, the one who understands both perspectives—but also the one who can\'t decide.',
    gift: 'Objectivity, ability to see all perspectives, diplomatic skills, balance through integration of opposites',
    challenge: 'Indecision, feeling pulled apart, projection, difficulty committing to one path',
    teaching: 'The Seesaw native lives in polarities. Two groups of planets face off across the chart, creating an oscillating dynamic. You see both sides of everything — which makes you a natural mediator, diplomat, and counselor. But it also means you can be paralyzed by indecision, endlessly weighing options. The teaching: you are not here to choose one side. You are here to integrate both. The planets that form each group tell you what you\'re balancing.',
  },
  Splash: {
    description: 'Planets are scattered relatively evenly around the entire zodiac.',
    personality: 'You are a RENAISSANCE SOUL. You have fingers in every pie, interests in every direction, and the ability to engage with all of life. Nothing is foreign to you. You are versatile, adaptable, and universally capable.',
    gift: 'Versatility, adaptability, broad competence, ability to understand and engage with anything',
    challenge: 'Scattered energy, jack of all trades/master of none, difficulty focusing, overwhelm from too many options',
    teaching: 'The Splash is the Renaissance soul. Planets everywhere, interests everywhere, competence everywhere. You can talk to anyone about anything. But this breadth comes at a cost: depth. The Splash native must learn that being interested in everything is not the same as being committed to something. Your gift is universal empathy; your challenge is meaningful focus.',
  },
  Splay: {
    description: 'Planets form irregular clusters (stelliums) with uneven spacing.',
    personality: 'You are an INDIVIDUAL. You don\'t fit patterns. Your chart has distinct power centers (the clusters) and gaps. You are strong-willed, independent, and resist categorization. Your life has specific focal points of intensity.',
    gift: 'Individuality, strong will, ability to resist conformity, distinct power centers',
    challenge: 'Stubbornness, difficulty cooperating, uneven development, gaps in life experience',
    teaching: 'The Splay defies categorization — which IS the point. Irregular stellium clusters with gaps create distinct "power centers" in your chart. You are strong-willed, independent, and refuse to be boxed in. Each cluster represents a concentrated area of life mastery, while the gaps represent territories you simply don\'t engage with. This is not weakness — it\'s specialization by instinct.',
  },
  Tripod: {
    description: 'Three distinct planet clusters roughly 120° apart, forming a triangular distribution.',
    personality: 'You are a THREE-LEGGED FOUNDATION. Your life rests on three distinct pillars of experience. You have natural balance through triangulation—when one leg falters, the other two compensate. You see life in threes: thesis, antithesis, synthesis.',
    gift: 'Natural stability, ability to synthesize different areas of life, creative problem-solving through triangulation',
    challenge: 'May compartmentalize life into separate "zones," difficulty integrating all three areas simultaneously',
    teaching: 'Three clusters, roughly 120° apart, create triangular stability. You have three distinct "legs" supporting your life — and if one leg falters, the other two compensate. This creates remarkable resilience. The teaching: identify your three pillars. They likely correspond to three different life domains. Honor all three; neglect none.',
  },
  Fan: {
    description: 'Planets spread across about 180° with one planet at the focal point, creating a fan or wedge shape.',
    personality: 'You are a FOCUSED BEAM. Your energy spreads out from a single focal point (the apex planet). Like a flashlight, you project concentrated energy outward. The apex planet is your antenna, your teacher, your point of life direction.',
    gift: 'Directed purpose, ability to channel diverse energies through one point, clear life direction',
    challenge: 'Pressure on the apex planet, if that planet is challenged the whole pattern destabilizes',
    teaching: 'The Fan concentrates diverse planetary energies through a single focal point — the apex planet. Like a magnifying glass focusing sunlight, this creates intense, directed power. The apex planet becomes your life\'s antenna, receiving and transmitting all other planetary signals. Pressure on the apex is enormous; if it\'s challenged by aspects, the whole pattern destabilizes.',
  },
  GrandCross: {
    description: 'Four planets in a square pattern, forming two oppositions that cross each other at 90°.',
    personality: 'You are a CRUCIBLE OF TENSION. Four corners of your chart pull in different directions, creating constant internal pressure. You are forged by friction, shaped by conflict, and driven by the need to resolve irreconcilable tensions.',
    gift: 'Tremendous drive from inner tension, ability to handle pressure, dynamic energy that prevents stagnation',
    challenge: 'Chronic stress, feeling pulled apart, tendency to create crisis, difficulty finding peace',
    teaching: 'The Grand Cross is forged in fire. Four planets, four squares, two oppositions — constant internal tension that never fully resolves. You are the person who thrives under pressure because pressure is your natural state. This tension is not a problem to solve. It is a dynamo to harness. The four planets involved represent four competing drives that, when integrated, produce extraordinary power.',
  },
  Kite: {
    description: 'A Grand Trine with one planet opposing the apex, creating a kite-like shape with sextiles.',
    personality: 'You are a GROUNDED GIFT. The Grand Trine provides natural talent and flow, while the opposing planet grounds this gift into practical expression. You have innate abilities that can actually be used in the real world.',
    gift: 'Natural talents with a productive outlet, harmonious energy with direction, gifts that can manifest practically',
    challenge: 'The opposition point creates tension that must be consciously integrated, lazy reliance on talents',
    teaching: 'The Kite takes natural talent (Grand Trine) and gives it a direction (the opposition). Without the opposition planet, the Grand Trine is lazy — gifts that never manifest. The Kite\'s apex planet opposes one trine point and sextiles the other two, creating a focused channel for flow. This is the "grounded gift" pattern: you have innate abilities AND the drive to use them.',
  },
  TSquare: {
    description: 'Two planets in opposition, both squaring a third (the focal/apex planet), creating a triangle of dynamic tension.',
    personality: 'You are an ENGINE OF ACHIEVEMENT. The opposition creates awareness, but the apex planet (the one being squared by both) is where all the pressure concentrates. This is your point of maximum drive, maximum frustration, and maximum accomplishment.',
    gift: 'Powerful drive toward achievement, ability to accomplish through tension, focused ambition channeled through the apex planet',
    challenge: 'Chronic tension at the apex, tendency to overcompensate, the "empty leg" (the point opposite the apex) is where you unconsciously seek release',
    teaching: 'The T-Square is the engine of achievement. Two planets in opposition, both squaring a third (the apex or focal planet), create a triangle of dynamic tension. The apex planet is where all the pressure concentrates — and therefore where all the action happens. People with T-Squares accomplish more than people without them because the tension demands resolution through action. The empty leg (the point opposite the apex) is your point of release — the area of life where relief can be found.',
  },
  StarOfDavid: {
    description: 'Two interlocking Grand Trines forming a hexagonal pattern — six planets, each roughly 60° apart.',
    personality: 'You carry one of the rarest configurations in astrology. Six planets in harmonious flow create a field of extraordinary natural talent. You have access to gifts others spend lifetimes developing. But this ease is your greatest danger — without friction, there is no growth.',
    gift: 'Extraordinary natural harmony, multiple talents flowing simultaneously, a sense of being "blessed" or cosmically supported',
    challenge: 'Complacency, lack of motivation to develop talents, taking gifts for granted, potential for spiritual laziness',
    teaching: 'The Star of David (Grand Sextile / two interlocking Grand Trines) is one of the rarest and most powerful configurations in astrology. Six planets, each 60° apart, create a hexagonal pattern of perfect flow. This is extraordinary natural harmony — but also the danger of complacency. You have so much innate talent flowing so easily that you may never be pushed to develop it. The teaching: discipline is what turns this gift from latent potential into lived mastery.',
  },
  Yod: {
    description: 'Two planets in sextile (60°), both forming quincunxes (150°) to a third planet — the "Finger of God."',
    personality: 'You carry a sense of SPIRITUAL MISSION. The apex planet feels fated, pressured, and purposeful in ways you can\'t fully explain. Two supporting planets (the sextile base) provide the skills, but the apex is where destiny concentrates. You are being pointed somewhere.',
    gift: 'Sense of purpose and destiny, ability to channel diverse skills toward a singular mission, spiritual clarity',
    challenge: 'Health issues at the apex planet, feeling "chosen" in uncomfortable ways, constant need for adjustment, crisis at the apex',
    teaching: 'The Yod — the "Finger of God" — is an arrow of fate pointing at one planet (the apex). Two planets in sextile (60°) both quincunx (150°) a third, creating an isoceles triangle of spiritual pressure. The apex planet carries a sense of destiny, mission, and often crisis. Yod natives often feel "chosen" — not in an ego sense, but in a "there\'s something I must do and I can\'t explain why" sense. The quincunx is the aspect of necessary adjustment: you must constantly adapt to fulfill the Yod\'s purpose.',
  },
  MysticRectangle: {
    description: 'Four planets forming a rectangle — two oppositions connected by sextiles and trines.',
    personality: 'You have INTEGRATED TENSION. Two opposing forces are bridged by harmonious aspects, creating a stable pattern that balances dynamism with flow. You naturally resolve conflicts that paralyze others because your chart has built-in bridges between opposites.',
    gift: 'Natural balance between opposing forces, ability to resolve conflicts, productive tension, diplomatic genius',
    challenge: 'Can feel too balanced (stasis vs dynamism), may avoid necessary conflict, passive where action is needed',
    teaching: 'The Mystic Rectangle combines two oppositions with sextiles and trines into a balanced rectangular formation. This creates a rare integration of tension (oppositions) and flow (trines/sextiles). You have natural balance between opposing forces — but this balance can feel like stasis rather than dynamism. The teaching: the oppositions give you awareness; the trines give you talent; your job is to activate both consciously.',
  },
  Unknown: {
    description: 'No clear pattern emerges from the planetary distribution.',
    personality: 'Your chart doesn\'t conform to a single recognized pattern, which may indicate unique complexity or a combination of tendencies.',
    gift: 'Uniqueness, complexity, freedom from categorical limitations',
    challenge: 'May lack the focused expression that clearer patterns provide',
    teaching: 'Your chart doesn\'t conform to a single recognized pattern. This isn\'t a deficit — it may indicate a unique combination of partial patterns, or a distribution that resists easy categorization. Look to the individual aspects and stelliums for your story.',
  }
};

// ============================================================================
// DETECTION FUNCTIONS
// ============================================================================

function getPlanetPositions(planets: ChartPlanet[]): { name: string; degree: number }[] {
  const excludeList = ['Ascendant', 'Midheaven', 'NorthNode', 'SouthNode'];
  return planets
    .filter(p => !excludeList.includes(p.name))
    .map(p => ({ name: p.name, degree: toAbsoluteDegree(p.sign, p.degree) }))
    .sort((a, b) => a.degree - b.degree);
}

function calculateSpan(positions: { name: string; degree: number }[]): {
  span: number; largestGap: number; leadingPlanet: string; trailingPlanet: string; emptyStart: number; emptyEnd: number;
} {
  if (positions.length < 2) return { span: 0, largestGap: 360, leadingPlanet: '', trailingPlanet: '', emptyStart: 0, emptyEnd: 360 };
  let largestGap = 0, gapStart = 0, gapEnd = 0, leadingPlanet = '', trailingPlanet = '';
  for (let i = 0; i < positions.length; i++) {
    const current = positions[i], next = positions[(i + 1) % positions.length];
    let gap = next.degree - current.degree;
    if (gap < 0) gap += 360;
    if (gap > largestGap) { largestGap = gap; gapStart = current.degree; gapEnd = next.degree; trailingPlanet = current.name; leadingPlanet = next.name; }
  }
  return { span: 360 - largestGap, largestGap, leadingPlanet, trailingPlanet, emptyStart: gapStart, emptyEnd: gapEnd };
}

function countSignificantGaps(positions: { name: string; degree: number }[], threshold = 60): number {
  let gaps = 0;
  for (let i = 0; i < positions.length; i++) {
    let gap = positions[(i + 1) % positions.length].degree - positions[i].degree;
    if (gap < 0) gap += 360;
    if (gap >= threshold) gaps++;
  }
  return gaps;
}

function findIsolatedPlanet(positions: { name: string; degree: number }[], mainSpan: { start: number; end: number }): string | null {
  for (const planet of positions) {
    let inEmptyArea = false;
    if (mainSpan.start < mainSpan.end) { inEmptyArea = planet.degree < mainSpan.start || planet.degree > mainSpan.end; }
    else { inEmptyArea = planet.degree < mainSpan.start && planet.degree > mainSpan.end; }
    if (inEmptyArea) {
      let isAlone = true;
      for (const other of positions) {
        if (other.name === planet.name) continue;
        let dist = Math.abs(other.degree - planet.degree);
        if (dist > 180) dist = 360 - dist;
        if (dist < 30) { isAlone = false; break; }
      }
      if (isAlone) return planet.name;
    }
  }
  return null;
}

function countStelliums(positions: { name: string; degree: number }[]): number {
  let stelliums = 0;
  const counted = new Set<string>();
  for (let i = 0; i < positions.length; i++) {
    if (counted.has(positions[i].name)) continue;
    const cluster = [positions[i]];
    for (let j = i + 1; j < positions.length; j++) {
      let dist = positions[j].degree - positions[i].degree;
      if (dist < 0) dist += 360;
      if (dist <= 30) cluster.push(positions[j]);
    }
    if (cluster.length >= 3) { stelliums++; cluster.forEach(p => counted.add(p.name)); }
  }
  return stelliums;
}

// Helper: angular distance
function angDist(a: number, b: number): number {
  let d = Math.abs(a - b);
  return d > 180 ? 360 - d : d;
}

function detectGrandCross(positions: { name: string; degree: number }[]): { found: boolean; planets: string[] } {
  const orb = 10;
  for (let i = 0; i < positions.length - 3; i++) {
    for (let j = i + 1; j < positions.length - 2; j++) {
      for (let k = j + 1; k < positions.length - 1; k++) {
        for (let l = k + 1; l < positions.length; l++) {
          const angles = [positions[i], positions[j], positions[k], positions[l]].sort((a, b) => a.degree - b.degree);
          const g1 = angles[1].degree - angles[0].degree, g2 = angles[2].degree - angles[1].degree;
          const g3 = angles[3].degree - angles[2].degree, g4 = (360 - angles[3].degree) + angles[0].degree;
          const sq = (g: number) => g >= 90 - orb && g <= 90 + orb;
          if (sq(g1) && sq(g2) && sq(g3) && sq(g4)) {
            return { found: true, planets: [positions[i].name, positions[j].name, positions[k].name, positions[l].name] };
          }
        }
      }
    }
  }
  return { found: false, planets: [] };
}

function detectGrandTrine(positions: { name: string; degree: number }[]): { found: boolean; planets: string[] } {
  const orb = 8;
  for (let i = 0; i < positions.length - 2; i++) {
    for (let j = i + 1; j < positions.length - 1; j++) {
      for (let k = j + 1; k < positions.length; k++) {
        const d1 = angDist(positions[i].degree, positions[j].degree);
        const d2 = angDist(positions[j].degree, positions[k].degree);
        const d3 = angDist(positions[k].degree, positions[i].degree);
        if (d1 >= 120 - orb && d1 <= 120 + orb && d2 >= 120 - orb && d2 <= 120 + orb && d3 >= 120 - orb && d3 <= 120 + orb) {
          return { found: true, planets: [positions[i].name, positions[j].name, positions[k].name] };
        }
      }
    }
  }
  return { found: false, planets: [] };
}

function detectKite(positions: { name: string; degree: number }[]): { found: boolean; apex: string; trinePlanets: string[] } {
  const gt = detectGrandTrine(positions);
  if (!gt.found) return { found: false, apex: '', trinePlanets: [] };
  const orb = 8;
  const tps = positions.filter(p => gt.planets.includes(p.name));
  for (const tp of tps) {
    for (const other of positions) {
      if (gt.planets.includes(other.name)) continue;
      if (angDist(other.degree, tp.degree) >= 180 - orb && angDist(other.degree, tp.degree) <= 180 + orb) {
        return { found: true, apex: other.name, trinePlanets: gt.planets };
      }
    }
  }
  return { found: false, apex: '', trinePlanets: [] };
}

/**
 * T-Square: Two planets in opposition, both square a third (apex)
 */
function detectTSquare(positions: { name: string; degree: number }[]): { found: boolean; apex: string; oppositionPlanets: string[] } {
  const orb = 8;
  // Find oppositions first
  for (let i = 0; i < positions.length - 1; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const oppDist = angDist(positions[i].degree, positions[j].degree);
      if (oppDist >= 180 - orb && oppDist <= 180 + orb) {
        // Found an opposition — look for a planet squaring both
        for (const other of positions) {
          if (other.name === positions[i].name || other.name === positions[j].name) continue;
          const sq1 = angDist(other.degree, positions[i].degree);
          const sq2 = angDist(other.degree, positions[j].degree);
          if (sq1 >= 90 - orb && sq1 <= 90 + orb && sq2 >= 90 - orb && sq2 <= 90 + orb) {
            return { found: true, apex: other.name, oppositionPlanets: [positions[i].name, positions[j].name] };
          }
        }
      }
    }
  }
  return { found: false, apex: '', oppositionPlanets: [] };
}

/**
 * Yod (Finger of God): Two planets in sextile (60°), both quincunx (150°) a third
 */
function detectYod(positions: { name: string; degree: number }[]): { found: boolean; apex: string; basePlanets: string[] } {
  const orb = 6;
  for (let i = 0; i < positions.length - 1; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const sextDist = angDist(positions[i].degree, positions[j].degree);
      if (sextDist >= 60 - orb && sextDist <= 60 + orb) {
        for (const other of positions) {
          if (other.name === positions[i].name || other.name === positions[j].name) continue;
          const q1 = angDist(other.degree, positions[i].degree);
          const q2 = angDist(other.degree, positions[j].degree);
          if (q1 >= 150 - orb && q1 <= 150 + orb && q2 >= 150 - orb && q2 <= 150 + orb) {
            return { found: true, apex: other.name, basePlanets: [positions[i].name, positions[j].name] };
          }
        }
      }
    }
  }
  return { found: false, apex: '', basePlanets: [] };
}

/**
 * Mystic Rectangle: Two oppositions connected by sextiles and trines
 */
function detectMysticRectangle(positions: { name: string; degree: number }[]): { found: boolean; planets: string[] } {
  const orb = 8;
  for (let i = 0; i < positions.length - 3; i++) {
    for (let j = i + 1; j < positions.length - 2; j++) {
      for (let k = j + 1; k < positions.length - 1; k++) {
        for (let l = k + 1; l < positions.length; l++) {
          const ps = [positions[i], positions[j], positions[k], positions[l]];
          // Try all orderings to find rectangle
          const orderings = [[0,1,2,3],[0,1,3,2],[0,2,1,3],[0,2,3,1],[0,3,1,2],[0,3,2,1]];
          for (const [a,b,c,d] of orderings) {
            const d1 = angDist(ps[a].degree, ps[c].degree); // opposition 1
            const d2 = angDist(ps[b].degree, ps[d].degree); // opposition 2
            const s1 = angDist(ps[a].degree, ps[b].degree); // sextile
            const s2 = angDist(ps[c].degree, ps[d].degree); // sextile
            const t1 = angDist(ps[a].degree, ps[d].degree); // trine
            const t2 = angDist(ps[b].degree, ps[c].degree); // trine
            const isOpp = (v: number) => v >= 180 - orb && v <= 180 + orb;
            const isSxt = (v: number) => v >= 60 - orb && v <= 60 + orb;
            const isTri = (v: number) => v >= 120 - orb && v <= 120 + orb;
            if (isOpp(d1) && isOpp(d2) && isSxt(s1) && isSxt(s2) && isTri(t1) && isTri(t2)) {
              return { found: true, planets: ps.map(p => p.name) };
            }
          }
        }
      }
    }
  }
  return { found: false, planets: [] };
}

/**
 * Star of David: Two interlocking Grand Trines (6 planets each ~60° apart)
 */
function detectStarOfDavid(positions: { name: string; degree: number }[]): { found: boolean; planets: string[] } {
  const orb = 8;
  // Need 6+ planets
  if (positions.length < 6) return { found: false, planets: [] };
  
  for (let i = 0; i < positions.length - 5; i++) {
    for (let j = i+1; j < positions.length - 4; j++) {
      for (let k = j+1; k < positions.length - 3; k++) {
        for (let l = k+1; l < positions.length - 2; l++) {
          for (let m = l+1; m < positions.length - 1; m++) {
            for (let n = m+1; n < positions.length; n++) {
              const ps = [positions[i],positions[j],positions[k],positions[l],positions[m],positions[n]].sort((a,b)=>a.degree-b.degree);
              // Check if all consecutive are ~60° apart
              let valid = true;
              for (let x = 0; x < 6; x++) {
                const d = angDist(ps[x].degree, ps[(x+1)%6].degree);
                if (d < 60 - orb || d > 60 + orb) { valid = false; break; }
              }
              if (valid) return { found: true, planets: ps.map(p=>p.name) };
            }
          }
        }
      }
    }
  }
  return { found: false, planets: [] };
}

function detectTripod(positions: { name: string; degree: number }[]): boolean {
  const clusters: { name: string; degree: number }[][] = [];
  const assigned = new Set<string>();
  for (const planet of positions) {
    if (assigned.has(planet.name)) continue;
    const cluster = [planet]; assigned.add(planet.name);
    for (const other of positions) {
      if (assigned.has(other.name)) continue;
      if (angDist(other.degree, planet.degree) <= 30) { cluster.push(other); assigned.add(other.name); }
    }
    clusters.push(cluster);
  }
  if (clusters.length !== 3) return false;
  const centers = clusters.map(c => c.reduce((s,p)=>s+p.degree,0)/c.length).sort((a,b)=>a-b);
  const g1 = centers[1]-centers[0], g2 = centers[2]-centers[1], g3 = (360-centers[2])+centers[0];
  const isTri = (g: number) => g >= 100 && g <= 140;
  return isTri(g1) && isTri(g2) && isTri(g3);
}

function detectFan(positions: { name: string; degree: number }[]): { found: boolean; apex: string } {
  const { span, largestGap } = calculateSpan(positions);
  if (span >= 150 && span <= 200 && largestGap >= 160) {
    const sorted = [...positions].sort((a, b) => a.degree - b.degree);
    const firstGap = sorted.length > 1 ? sorted[1].degree - sorted[0].degree : 0;
    const lastGap = sorted.length > 1 ? sorted[sorted.length - 1].degree - sorted[sorted.length - 2].degree : 0;
    if (firstGap > 40 || lastGap > 40) {
      return { found: true, apex: firstGap > lastGap ? sorted[0].name : sorted[sorted.length-1].name };
    }
  }
  return { found: false, apex: '' };
}

// ============================================================================
// Seesaw group detection — identifies which planets form each side
// ============================================================================
function getSeesawGroups(positions: { name: string; degree: number }[]): { group1: string[]; group2: string[] } {
  // Find the two largest gaps
  const gaps: { index: number; size: number }[] = [];
  for (let i = 0; i < positions.length; i++) {
    let gap = positions[(i + 1) % positions.length].degree - positions[i].degree;
    if (gap < 0) gap += 360;
    gaps.push({ index: i, size: gap });
  }
  gaps.sort((a, b) => b.size - a.size);
  
  if (gaps.length < 2) return { group1: positions.map(p=>p.name), group2: [] };
  
  const gap1Idx = gaps[0].index;
  const gap2Idx = gaps[1].index;
  const [startIdx, endIdx] = gap1Idx < gap2Idx ? [gap1Idx, gap2Idx] : [gap2Idx, gap1Idx];
  
  const group1: string[] = [];
  const group2: string[] = [];
  
  for (let i = 0; i < positions.length; i++) {
    if (i > startIdx && i <= endIdx) group1.push(positions[i].name);
    else group2.push(positions[i].name);
  }
  
  return { group1, group2 };
}

// ============================================================================
// MAIN DETECTION
// ============================================================================

interface CandidateShape extends ChartShape {
  _score: number;
}

export function detectChartShape(planets: ChartPlanet[]): ChartShape {
  const positions = getPlanetPositions(planets);
  
  if (positions.length < 4) {
    return { type: 'Unknown', confidence: 0, ...SHAPE_DATA.Unknown };
  }
  
  const { span, largestGap, leadingPlanet, emptyStart, emptyEnd } = calculateSpan(positions);
  const significantGaps = countSignificantGaps(positions);
  const stelliums = countStelliums(positions);
  const candidates: CandidateShape[] = [];

  const addCandidate = (type: ChartShapeType, confidence: number, extra: Partial<ChartShape> = {}) => {
    candidates.push({
      type, confidence, _score: confidence,
      ...SHAPE_DATA[type],
      ...extra,
    });
  };

  // --- Aspect-based patterns (detected by geometry, not span) ---
  
  const grandCross = detectGrandCross(positions);
  if (grandCross.found) {
    addCandidate('GrandCross', 95, {
      involvedPlanets: grandCross.planets,
      emptyArea: `Your chart contains a Grand Cross involving ${grandCross.planets.join(', ')}—a powerful pattern of dynamic tension.`
    });
  }
  
  const starOfDavid = detectStarOfDavid(positions);
  if (starOfDavid.found) {
    addCandidate('StarOfDavid', 97, {
      involvedPlanets: starOfDavid.planets,
      emptyArea: `Six planets form two interlocking Grand Trines: ${starOfDavid.planets.join(', ')}. This is exceptionally rare.`
    });
  }

  const kite = detectKite(positions);
  if (kite.found) {
    addCandidate('Kite', 93, {
      leadPlanet: kite.apex,
      involvedPlanets: [...kite.trinePlanets, kite.apex],
      emptyArea: `Your Grand Trine (${kite.trinePlanets.join(', ')}) has ${kite.apex} as the grounding apex, creating a Kite formation.`
    });
  }
  
  const mysticRect = detectMysticRectangle(positions);
  if (mysticRect.found) {
    addCandidate('MysticRectangle', 91, {
      involvedPlanets: mysticRect.planets,
      emptyArea: `Four planets form a Mystic Rectangle: ${mysticRect.planets.join(', ')} — two oppositions bridged by trines and sextiles.`
    });
  }

  const tSquare = detectTSquare(positions);
  if (tSquare.found) {
    addCandidate('TSquare', 90, {
      leadPlanet: tSquare.apex,
      involvedPlanets: [...tSquare.oppositionPlanets, tSquare.apex],
      emptyArea: `${tSquare.oppositionPlanets.join(' and ')} oppose each other, both squaring ${tSquare.apex} — the focal point where pressure concentrates and achievement happens.`
    });
  }

  const yod = detectYod(positions);
  if (yod.found) {
    addCandidate('Yod', 92, {
      leadPlanet: yod.apex,
      involvedPlanets: [...yod.basePlanets, yod.apex],
      emptyArea: `${yod.basePlanets.join(' and ')} (sextile) both point to ${yod.apex} — the Finger of God, your point of fated mission.`
    });
  }

  if (detectTripod(positions)) {
    addCandidate('Tripod', 88, {
      emptyArea: 'Your planets form three distinct clusters roughly 120° apart—a stable triangular foundation.'
    });
  }

  const fan = detectFan(positions);
  if (fan.found) {
    addCandidate('Fan', 85, {
      leadPlanet: fan.apex,
      emptyArea: `Your planets spread in a fan shape with ${fan.apex} as the focal apex.`
    });
  }

  // --- Span-based patterns ---
  
  if (span <= 130) {
    const conf = span <= 120 ? 97 : Math.round(97 - (span - 120) * 2);
    addCandidate('Bundle', conf, {
      emptyArea: `Two-thirds of your zodiac (${Math.round(largestGap)}°) is empty—uncharted territory in your life.`
    });
  }
  
  // Bucket — check broadly (span 140-220)
  if (span >= 140 && span <= 220) {
    const isolatedPlanet = findIsolatedPlanet(positions, { start: emptyStart, end: emptyEnd });
    if (isolatedPlanet && largestGap >= 120) {
      const gapQ = Math.min(1, (largestGap - 120) / 40);
      const spanQ = 1 - Math.abs(180 - span) / 50;
      const conf = Math.round(75 + 22 * Math.min(gapQ, spanQ));
      addCandidate('Bucket', conf, {
        leadPlanet: isolatedPlanet,
        involvedPlanets: positions.filter(p => p.name !== isolatedPlanet).map(p => p.name),
        emptyArea: `Your chart has a bowl shape with ${isolatedPlanet} as the "handle"—your point of focused release. All concentrated energy funnels through ${isolatedPlanet}.`
      });
    }
  }
  
  // Bowl
  if (span >= 130 && span <= 195) {
    const conf = Math.max(60, Math.round(95 - Math.abs(180 - span) * 1.2));
    addCandidate('Bowl', conf, {
      emptyArea: `Half your zodiac (${Math.round(largestGap)}°) is empty—the unlived half of life you gaze toward.`
    });
  }
  
  // Locomotive
  if (span >= 200 && span <= 280 && largestGap >= 80 && largestGap <= 160) {
    const spanFit = 1 - Math.abs(240 - span) / 50;
    const gapFit = 1 - Math.abs(120 - largestGap) / 50;
    const conf = Math.max(60, Math.round(70 + 28 * Math.min(1, (spanFit + gapFit) / 2)));
    addCandidate('Locomotive', conf, {
      leadPlanet: leadingPlanet,
      emptyArea: `One-third of your zodiac (${Math.round(largestGap)}°) is empty—the void you're always driving toward, with ${leadingPlanet} as your engine.`
    });
  }
  
  // Seesaw
  if (significantGaps >= 2 && largestGap >= 60 && largestGap <= 150) {
    const groups = getSeesawGroups(positions);
    const conf = Math.min(95, Math.round(80 + 15 * Math.min(1, (significantGaps - 1))));
    addCandidate('Seesaw', conf, {
      involvedPlanets: [...groups.group1, '|', ...groups.group2] as string[], // '|' as separator
      emptyArea: `Your planets form two opposing groups: [${groups.group1.join(', ')}] vs [${groups.group2.join(', ')}], creating a dynamic of polarities and balance-seeking.`
    });
  }
  
  // Splay
  if (stelliums >= 1) {
    const conf = stelliums >= 2 ? 85 : (significantGaps >= 2 ? 78 : 65);
    addCandidate('Splay', conf, {
      emptyArea: 'Your chart has distinct power centers (stelliums) with irregular spacing—a highly individual pattern.'
    });
  }
  
  // Splash
  if (largestGap < 90 && significantGaps <= 1) {
    const evenness = 1 - (largestGap / 90);
    addCandidate('Splash', Math.round(70 + 25 * evenness), {
      emptyArea: 'Your planets are scattered across the zodiac—you have access to all areas of life experience.'
    });
  }
  
  // Sort by confidence
  candidates.sort((a, b) => b._score - a._score);
  
  if (candidates.length === 0) {
    return { type: 'Unknown', confidence: 40, ...SHAPE_DATA.Unknown };
  }
  
  // Primary result
  const { _score: _, ...result } = candidates[0];
  
  // Up to 3 runner-ups (different types)
  const seen = new Set<ChartShapeType>([result.type]);
  const secondaryShapes: SecondaryShapeInfo[] = [];
  for (const c of candidates) {
    if (seen.has(c.type)) continue;
    seen.add(c.type);
    secondaryShapes.push({
      type: c.type,
      confidence: c.confidence,
      description: c.description,
      personality: c.personality,
      gift: c.gift,
      challenge: c.challenge,
      teaching: c.teaching,
      involvedPlanets: c.involvedPlanets,
      leadPlanet: c.leadPlanet,
    });
    if (secondaryShapes.length >= 3) break;
  }
  
  result.secondaryShapes = secondaryShapes;
  
  // Legacy compat
  if (secondaryShapes.length > 0) {
    result.secondaryShape = {
      type: secondaryShapes[0].type,
      confidence: secondaryShapes[0].confidence,
      description: secondaryShapes[0].description,
    };
  }
  
  return result;
}

export function getShapeSummary(shape: ChartShape): string {
  return `${shape.type} pattern: ${shape.personality.split('.')[0]}.`;
}
