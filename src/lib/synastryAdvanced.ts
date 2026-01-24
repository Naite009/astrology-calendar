/**
 * Advanced Synastry Analysis Library
 * 
 * Professional-grade relationship analysis including:
 * - Karmic indicators (North/South Node, Chiron)
 * - House overlays
 * - Relationship type classification
 * - Anger/conflict triggers
 * - Energy dynamics
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

// ============================================
// TYPES
// ============================================

export type RelationshipType = 'romantic' | 'business' | 'friendship' | 'teacher-student' | 'karmic' | 'creative';

export interface RelationshipTypeScore {
  type: RelationshipType;
  score: number;
  label: string;
  description: string;
  icon: string;
  indicators: string[];
}

export interface KarmicIndicator {
  name: string;
  planet1: string;
  planet2: string;
  aspectType: string;
  orb: number;
  interpretation: string;
  pastLifeTheme?: string;
  lessonToLearn: string;
  healingPotential: string;
}

export interface ConflictTrigger {
  name: string;
  planets: string[];
  aspectType: string;
  triggerDescription: string;
  emotionalPattern: string;
  resolution: string;
  intensity: 'mild' | 'moderate' | 'intense';
}

export interface AttractionDynamic {
  name: string;
  description: string;
  chemistry: 'magnetic' | 'slow-burn' | 'comfort' | 'electric' | 'deep';
  planets: string[];
  energy: string;
}

export interface HouseOverlay {
  planet: string;
  planetOwner: string;
  house: number;
  houseOwner: string;
  interpretation: string;
  lifeArea: string;
  impact: 'activating' | 'challenging' | 'nurturing' | 'transformative';
}

export interface AdvancedSynastryReport {
  // Core scores
  overallCompatibility: number;
  romanticScore: number;
  businessScore: number;
  friendshipScore: number;
  karmicScore: number;
  teacherStudentScore: number;
  creativeScore: number;
  
  // Relationship type recommendation
  bestRelationshipTypes: RelationshipTypeScore[];
  
  // Karmic analysis
  karmicIndicators: KarmicIndicator[];
  soulContractTheme: string;
  pastLifeConnection: string;
  
  // Dynamics
  attractionDynamics: AttractionDynamic[];
  conflictTriggers: ConflictTrigger[];
  
  // House overlays
  houseOverlays: HouseOverlay[];
  
  // Summary narratives
  whyDrawnTogether: string;
  relationshipPurpose: string;
  growthOpportunities: string[];
  watchOutFor: string[];
}

// ============================================
// ZODIAC & CALCULATIONS
// ============================================

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ASPECT_ORBS = {
  conjunction: { angle: 0, orb: 8 },
  opposition: { angle: 180, orb: 8 },
  trine: { angle: 120, orb: 8 },
  square: { angle: 90, orb: 7 },
  sextile: { angle: 60, orb: 6 },
  quincunx: { angle: 150, orb: 3 }
};

function toAbsoluteDegree(position: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return (signIndex * 30) + position.degree + (position.minutes / 60);
}

function calculateAngle(pos1: NatalPlanetPosition, pos2: NatalPlanetPosition): number {
  const deg1 = toAbsoluteDegree(pos1);
  const deg2 = toAbsoluteDegree(pos2);
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function getAspectType(angle: number): { type: string; orb: number } | null {
  for (const [type, def] of Object.entries(ASPECT_ORBS)) {
    const orb = Math.abs(angle - def.angle);
    if (orb <= def.orb) {
      return { type, orb: Math.round(orb * 10) / 10 };
    }
  }
  return null;
}

function hasAspect(chart1: NatalChart, planet1: string, chart2: NatalChart, planet2: string, aspectTypes?: string[]): { type: string; orb: number } | null {
  const pos1 = chart1.planets[planet1 as keyof typeof chart1.planets];
  const pos2 = chart2.planets[planet2 as keyof typeof chart2.planets];
  if (!pos1 || !pos2) return null;
  
  const angle = calculateAngle(pos1, pos2);
  const aspect = getAspectType(angle);
  
  if (!aspect) return null;
  if (aspectTypes && !aspectTypes.includes(aspect.type)) return null;
  
  return aspect;
}

// ============================================
// CHIRON INTERPRETATIONS
// ============================================

const CHIRON_SYNASTRY: Record<string, Record<string, string>> = {
  'Chiron-Sun': {
    conjunction: "The Chiron person sees into the Sun person's deepest wounds around identity and ego. This creates an intense healing dynamic where the Sun person may initially feel exposed but ultimately finds profound self-acceptance. The Chiron person acts as a 'wounded healer,' helping the Sun person integrate shadow aspects of their personality.",
    opposition: "There's a mirror effect—each person reflects the other's core wounds back. The Sun person may trigger the Chiron person's old pain, while Chiron challenges the Sun person's ego defenses. Growth comes through accepting vulnerability.",
    trine: "Natural healing flows between you. The Chiron person gently helps the Sun person heal identity wounds without triggering defensiveness. This is a supportive, nurturing connection.",
    square: "Healing comes through friction. The Chiron person may unintentionally poke the Sun person's sore spots, but this ultimately leads to growth if both are willing to do the work."
  },
  'Chiron-Moon': {
    conjunction: "Deep emotional healing potential. The Chiron person understands the Moon person's emotional wounds intuitively. Old mother/nurturing wounds may surface for healing. Tears and breakthroughs are likely.",
    opposition: "Emotional vulnerabilities are exposed. The Moon person may feel their safety is threatened by Chiron's presence, but this exposure leads to emotional healing if embraced.",
    trine: "Comforting, nurturing healing. The Chiron person provides emotional safety that allows the Moon person to process old wounds. A very therapeutic connection.",
    square: "Emotional buttons get pushed. The Chiron person may trigger the Moon person's abandonment or nurturing wounds. Healing is possible but requires conscious work."
  },
  'Chiron-Venus': {
    conjunction: "Love wounds surface for healing. The Chiron person helps Venus heal old relationship trauma, self-worth issues, or fears around being lovable. Initially painful, ultimately liberating.",
    opposition: "Attraction mixed with old love pain. Venus may project past relationship wounds onto Chiron. This aspect asks: 'Can you love someone who sees your wounds?'",
    trine: "Gentle healing around love and self-worth. Venus feels accepted by Chiron despite flaws. A beautiful aspect for healing the heart.",
    square: "Love triggers pain. Venus's romantic overtures may reopen Chiron's old wounds, while Chiron's wisdom can feel like criticism to Venus. Handle with care."
  },
  'Chiron-Mars': {
    conjunction: "Action, anger, and assertion wounds emerge. The Chiron person may help Mars heal rage issues, fear of conflict, or wounds around masculinity/agency. Intense but transformative.",
    opposition: "Mars may feel their energy is being 'diagnosed' by Chiron. This can feel threatening but offers healing around how we assert ourselves.",
    trine: "Supportive healing of action wounds. Chiron helps Mars find healthy expressions of anger and desire. Good for healing warrior wounds.",
    square: "Anger may flare as old wounds surface. Mars can feel attacked by Chiron's insights. Healing comes through recognizing the gift in the trigger."
  },
  'Chiron-Chiron': {
    conjunction: "Same generational wound. You understand each other's deepest pain on an instinctive level because you share it. Powerful mutual healing potential.",
    opposition: "Your wounds are in opposite life areas, creating tension but also complementary healing. You can help each other in areas where the other struggles.",
    trine: "Your wounds harmonize rather than clash. Easy understanding and natural ability to support each other's healing journeys.",
    square: "Your healing journeys create friction. What helps one may not help the other. Learning to honor different healing paths is key."
  }
};

// ============================================
// NORTH NODE / SOUTH NODE INTERPRETATIONS
// ============================================

const NODE_SYNASTRY: Record<string, Record<string, { interpretation: string; pastLife: string; lesson: string }>> = {
  'NorthNode-Sun': {
    conjunction: {
      interpretation: "The Sun person embodies exactly what the Node person needs to become. This is a fated connection where the Sun person acts as a beacon for the Node person's evolution. The Node person is deeply drawn to the Sun person's core identity.",
      pastLife: "The Sun person may have been a leader, authority figure, or role model the Node person admired in a past life.",
      lesson: "The Node person is learning to embody the Sun person's confidence and self-expression."
    },
    opposition: {
      interpretation: "The Sun person represents the Node person's past—comfortable but limiting. There's attraction mixed with a sense that staying in this dynamic would prevent growth.",
      pastLife: "You likely played similar roles before. The Sun person represents a familiar pattern the Node person needs to evolve beyond.",
      lesson: "Release attachment to past identity patterns. The Sun person shows what to leave behind."
    },
    trine: {
      interpretation: "Natural support for destiny. The Sun person encourages the Node person's growth without pushing. An easy, flowing connection to life purpose.",
      pastLife: "A supportive connection from the past that continues to help in this life.",
      lesson: "Allow the Sun person's encouragement to guide you toward your North Node expression."
    }
  },
  'NorthNode-Moon': {
    conjunction: {
      interpretation: "The Moon person provides the emotional nourishment the Node person needs to fulfill their destiny. Deep emotional safety allows for soul growth. The Node person feels 'at home' with the Moon person in a destiny-aligned way.",
      pastLife: "The Moon person may have been a mother, caretaker, or emotional anchor in a past life.",
      lesson: "Learning that emotional security supports rather than hinders growth."
    },
    opposition: {
      interpretation: "The Moon person's emotional patterns represent the Node person's comfort zone—familiar but potentially limiting. There may be emotional dependency to outgrow.",
      pastLife: "Emotional patterns from past lives that feel safe but no longer serve growth.",
      lesson: "Evolve beyond familiar emotional dynamics while honoring the connection."
    }
  },
  'NorthNode-Venus': {
    conjunction: {
      interpretation: "FATED LOVE. The Venus person embodies the love the Node person is meant to experience. This is one of the strongest indicators of a destined romantic connection. Venus shows the Node person a new way to love.",
      pastLife: "A love connection that was interrupted or incomplete in past lives, now returning for fulfillment.",
      lesson: "Learning to receive and give love in alignment with soul growth."
    },
    opposition: {
      interpretation: "The Venus person represents past-life love patterns. There's strong attraction but a sense that this love style is familiar rather than growth-inducing.",
      pastLife: "A romantic connection from the past that was comfortable but may have kept both people from evolving.",
      lesson: "Appreciate the love while also growing beyond old romantic patterns."
    }
  },
  'NorthNode-Mars': {
    conjunction: {
      interpretation: "The Mars person energizes the Node person's destiny path. Mars motivates, challenges, and pushes the Node person toward their North Node. A dynamic, activating connection.",
      pastLife: "The Mars person may have been a warrior, competitor, or catalyst in a past life.",
      lesson: "Learning to take action toward destiny, using Mars's energy as fuel."
    }
  },
  'NorthNode-Saturn': {
    conjunction: {
      interpretation: "A karmic teacher connection. Saturn provides structure, lessons, and sometimes limitations that serve the Node person's growth. Can feel heavy but is deeply purposeful.",
      pastLife: "Saturn may have been an authority figure, parent, or teacher in a past life.",
      lesson: "Accepting necessary limitations and structure as part of soul growth."
    }
  },
  'NorthNode-Chiron': {
    conjunction: {
      interpretation: "The Chiron person's wounds are connected to the Node person's destiny. Healing Chiron's pain is somehow linked to the Node person's life purpose. A profound healing-destiny connection.",
      pastLife: "Wounds from past lives that need healing as part of this lifetime's growth.",
      lesson: "Integrating wound healing into life purpose. The healing IS the path."
    }
  }
};

// ============================================
// CONFLICT TRIGGERS
// ============================================

const CONFLICT_PATTERNS: Record<string, { trigger: string; emotion: string; resolution: string; intensity: 'mild' | 'moderate' | 'intense' }> = {
  'Mars-Mars-square': {
    trigger: "Both people feel their way of taking action is 'right.' Competing desires and methods clash. Small disagreements can escalate quickly because both feel their agency is being threatened.",
    emotion: "Anger, frustration, feeling blocked or challenged. The competitive edge can feel exciting at first but become exhausting.",
    resolution: "Channel the energy into shared projects or physical activities. Take space when heated. Recognize you're both strong-willed and neither needs to 'win.'",
    intensity: 'intense'
  },
  'Mars-Mars-opposition': {
    trigger: "Opposite approaches to action. One pushes while the other pulls. Can feel like working at cross-purposes even when goals align.",
    emotion: "Frustration at feeling opposed. The push-pull dynamic can create sexual tension or outright conflict.",
    resolution: "Find the middle ground. Both approaches have value. Take turns leading.",
    intensity: 'moderate'
  },
  'Mars-Saturn-square': {
    trigger: "Saturn blocks or criticizes Mars's actions. Mars feels controlled, limited, or judged. Saturn feels Mars is reckless or immature.",
    emotion: "Mars feels frustrated, angry, or diminished. Saturn feels anxious about Mars's impulsiveness.",
    resolution: "Saturn can offer structure without control. Mars can accept guidance without feeling diminished. Timing is key—Saturn slows things down for a reason.",
    intensity: 'intense'
  },
  'Mars-Pluto-square': {
    trigger: "Power struggles. Both want control. Pluto's intensity meets Mars's action drive, creating a combustible mix. Manipulation or domination attempts may occur.",
    emotion: "Deep rage, feeling dominated or manipulated. The intensity can be intoxicating but also destructive.",
    resolution: "Acknowledge the power dynamic openly. Neither person should try to control the other. Channel the intensity into transformation, not destruction.",
    intensity: 'intense'
  },
  'Moon-Mars-square': {
    trigger: "Mars's action style hurts Moon's feelings. Moon's emotional needs feel like demands to Mars. Mars may be 'too rough' emotionally.",
    emotion: "Moon feels hurt, unsafe, or attacked. Mars feels nagged or emotionally manipulated.",
    resolution: "Mars needs to soften their approach. Moon needs to express needs clearly without expecting mind-reading. Both need patience.",
    intensity: 'moderate'
  },
  'Moon-Saturn-square': {
    trigger: "Saturn's coldness or criticism wounds Moon's emotional nature. Moon may feel emotionally rejected or 'not enough.'",
    emotion: "Moon feels unloved, criticized, or emotionally abandoned. Saturn may feel overwhelmed by Moon's needs.",
    resolution: "Saturn needs to offer more warmth. Moon needs to understand Saturn shows love through stability, not just emotional expression.",
    intensity: 'moderate'
  },
  'Sun-Pluto-square': {
    trigger: "Ego versus control. Pluto may try to dominate or transform Sun's identity. Sun may resist or feel their sense of self is under attack.",
    emotion: "Sun feels threatened, controlled. Pluto feels Sun won't evolve or surrender ego.",
    resolution: "Pluto should influence, not control. Sun should be open to transformation without losing self. The intensity can be empowering if handled with maturity.",
    intensity: 'intense'
  },
  'Venus-Saturn-square': {
    trigger: "Love feels blocked, criticized, or insufficient. Saturn may withhold affection or criticize how Venus loves. Venus may feel unloved or rejected.",
    emotion: "Venus feels inadequate, unloved, or judged. Saturn may feel Venus is frivolous or not serious enough.",
    resolution: "Saturn needs to express love, not just provide stability. Venus needs to appreciate Saturn's form of devotion. Build trust slowly.",
    intensity: 'moderate'
  }
};

// ============================================
// ATTRACTION DYNAMICS
// ============================================

function getAttractionDynamics(chart1: NatalChart, chart2: NatalChart): AttractionDynamic[] {
  const dynamics: AttractionDynamic[] = [];
  
  // Venus-Mars aspects = sexual chemistry
  if (hasAspect(chart1, 'Venus', chart2, 'Mars', ['conjunction', 'opposition', 'trine', 'square'])) {
    dynamics.push({
      name: 'Venus-Mars Magnetism',
      description: `${chart1.name}'s Venus draws ${chart2.name}'s Mars like a moth to flame. This is classic romantic and sexual attraction—the archetypal feminine allure meeting masculine desire.`,
      chemistry: 'magnetic',
      planets: ['Venus', 'Mars'],
      energy: "The 'can't keep hands off each other' dynamic. Physical attraction is undeniable."
    });
  }
  if (hasAspect(chart2, 'Venus', chart1, 'Mars', ['conjunction', 'opposition', 'trine', 'square'])) {
    dynamics.push({
      name: 'Mars-Venus Pull',
      description: `${chart2.name}'s Venus captivates ${chart1.name}'s Mars. ${chart1.name} pursues while ${chart2.name} attracts. Classic romantic polarity.`,
      chemistry: 'magnetic',
      planets: ['Mars', 'Venus'],
      energy: 'Natural romantic pursuit and attraction pattern.'
    });
  }
  
  // Sun-Moon = soul recognition
  if (hasAspect(chart1, 'Sun', chart2, 'Moon', ['conjunction', 'trine', 'sextile'])) {
    dynamics.push({
      name: 'Sun-Moon Soul Bond',
      description: `${chart1.name}'s core identity (Sun) harmonizes with ${chart2.name}'s emotional nature (Moon). You feel like you 'fit' together on a deep level.`,
      chemistry: 'comfort',
      planets: ['Sun', 'Moon'],
      energy: 'The feeling of coming home. Natural understanding.'
    });
  }
  
  // Venus-Pluto = obsessive attraction
  if (hasAspect(chart1, 'Venus', chart2, 'Pluto', ['conjunction', 'opposition', 'square'])) {
    dynamics.push({
      name: 'Venus-Pluto Obsession',
      description: `Intense, transformative attraction. ${chart2.name}'s Pluto sees through ${chart1.name}'s Venus, creating a compelling but potentially overwhelming dynamic.`,
      chemistry: 'deep',
      planets: ['Venus', 'Pluto'],
      energy: 'All-consuming passion that transforms both people. Can feel fated but also obsessive.'
    });
  }
  
  // Mars-Pluto = power chemistry
  if (hasAspect(chart1, 'Mars', chart2, 'Pluto', ['conjunction', 'trine', 'opposition'])) {
    dynamics.push({
      name: 'Power Dynamic',
      description: `Raw power meets primal desire. This combination creates intense physical chemistry with undertones of dominance and surrender.`,
      chemistry: 'electric',
      planets: ['Mars', 'Pluto'],
      energy: 'Intense, potentially volatile chemistry. Handle with awareness.'
    });
  }
  
  // Venus-Neptune = soulmate feeling
  if (hasAspect(chart1, 'Venus', chart2, 'Neptune', ['conjunction', 'trine'])) {
    dynamics.push({
      name: 'Soulmate Illusion/Reality',
      description: `Dreamy, romantic, spiritual attraction. You may feel you've known each other forever. Beautiful but needs grounding to avoid disappointment.`,
      chemistry: 'deep',
      planets: ['Venus', 'Neptune'],
      energy: 'Fairy-tale romance feeling. Keep some reality checks in place.'
    });
  }
  
  // Uranus-Venus = electric excitement
  if (hasAspect(chart1, 'Venus', chart2, 'Uranus', ['conjunction', 'opposition', 'square'])) {
    dynamics.push({
      name: 'Electric Attraction',
      description: `Exciting, unpredictable, never boring. The attraction comes in waves—intense then distant. Freedom-loving connection that resists routine.`,
      chemistry: 'electric',
      planets: ['Venus', 'Uranus'],
      energy: 'Rollercoaster romance. Exciting but needs stability anchors.'
    });
  }
  
  // Moon-Moon = emotional compatibility
  const moonAspect = hasAspect(chart1, 'Moon', chart2, 'Moon', ['conjunction', 'trine', 'sextile']);
  if (moonAspect) {
    dynamics.push({
      name: 'Emotional Twins',
      description: `Your emotional natures resonate. You process feelings similarly and provide mutual nurturing. The relationship feels emotionally safe.`,
      chemistry: 'comfort',
      planets: ['Moon', 'Moon'],
      energy: 'Deep emotional understanding. Home together.'
    });
  }
  
  return dynamics;
}

// ============================================
// CONFLICT TRIGGER DETECTION
// ============================================

function getConflictTriggers(chart1: NatalChart, chart2: NatalChart): ConflictTrigger[] {
  const triggers: ConflictTrigger[] = [];
  
  const checkConflict = (p1: string, p2: string, aspects: string[]) => {
    const asp1 = hasAspect(chart1, p1, chart2, p2, aspects);
    const asp2 = hasAspect(chart2, p1, chart1, p2, aspects);
    
    if (asp1) {
      const key = `${p1}-${p2}-${asp1.type}`;
      const pattern = CONFLICT_PATTERNS[key];
      if (pattern) {
        triggers.push({
          name: `${chart1.name}'s ${p1} ${asp1.type} ${chart2.name}'s ${p2}`,
          planets: [p1, p2],
          aspectType: asp1.type,
          triggerDescription: pattern.trigger,
          emotionalPattern: pattern.emotion,
          resolution: pattern.resolution,
          intensity: pattern.intensity
        });
      }
    }
    if (asp2 && JSON.stringify(asp1) !== JSON.stringify(asp2)) {
      const key = `${p1}-${p2}-${asp2.type}`;
      const pattern = CONFLICT_PATTERNS[key];
      if (pattern) {
        triggers.push({
          name: `${chart2.name}'s ${p1} ${asp2.type} ${chart1.name}'s ${p2}`,
          planets: [p1, p2],
          aspectType: asp2.type,
          triggerDescription: pattern.trigger,
          emotionalPattern: pattern.emotion,
          resolution: pattern.resolution,
          intensity: pattern.intensity
        });
      }
    }
  };
  
  // Check all conflict-prone combinations
  checkConflict('Mars', 'Mars', ['square', 'opposition']);
  checkConflict('Mars', 'Saturn', ['square', 'opposition', 'conjunction']);
  checkConflict('Mars', 'Pluto', ['square', 'opposition']);
  checkConflict('Moon', 'Mars', ['square', 'opposition']);
  checkConflict('Moon', 'Saturn', ['square', 'opposition']);
  checkConflict('Sun', 'Pluto', ['square', 'opposition']);
  checkConflict('Venus', 'Saturn', ['square', 'opposition']);
  
  return triggers;
}

// ============================================
// KARMIC INDICATOR DETECTION
// ============================================

function getKarmicIndicators(chart1: NatalChart, chart2: NatalChart): KarmicIndicator[] {
  const indicators: KarmicIndicator[] = [];
  
  const karmicPlanets = ['NorthNode', 'SouthNode', 'Chiron', 'Saturn', 'Pluto'];
  const personalPlanets = ['Sun', 'Moon', 'Venus', 'Mars', 'Mercury'];
  
  for (const karmic of karmicPlanets) {
    for (const personal of personalPlanets) {
      // Check both directions
      const asp1 = hasAspect(chart1, karmic, chart2, personal);
      const asp2 = hasAspect(chart2, karmic, chart1, personal);
      
      if (asp1) {
        const nodeData = NODE_SYNASTRY[`${karmic}-${personal}`]?.[asp1.type] || 
                         NODE_SYNASTRY[`NorthNode-${personal}`]?.[asp1.type];
        const chironData = CHIRON_SYNASTRY[`Chiron-${personal}`]?.[asp1.type];
        
        if (nodeData) {
          indicators.push({
            name: `${chart1.name}'s ${karmic} ${asp1.type} ${chart2.name}'s ${personal}`,
            planet1: karmic,
            planet2: personal,
            aspectType: asp1.type,
            orb: asp1.orb,
            interpretation: nodeData.interpretation,
            pastLifeTheme: nodeData.pastLife,
            lessonToLearn: nodeData.lesson,
            healingPotential: karmic === 'Chiron' ? chironData || '' : 'Growth through destiny alignment'
          });
        } else if (chironData && karmic === 'Chiron') {
          indicators.push({
            name: `${chart1.name}'s Chiron ${asp1.type} ${chart2.name}'s ${personal}`,
            planet1: 'Chiron',
            planet2: personal,
            aspectType: asp1.type,
            orb: asp1.orb,
            interpretation: chironData,
            lessonToLearn: 'Healing through relationship',
            healingPotential: chironData
          });
        }
      }
      
      if (asp2 && JSON.stringify(asp1) !== JSON.stringify(asp2)) {
        const nodeData = NODE_SYNASTRY[`${karmic}-${personal}`]?.[asp2.type];
        const chironData = CHIRON_SYNASTRY[`Chiron-${personal}`]?.[asp2.type];
        
        if (nodeData) {
          indicators.push({
            name: `${chart2.name}'s ${karmic} ${asp2.type} ${chart1.name}'s ${personal}`,
            planet1: karmic,
            planet2: personal,
            aspectType: asp2.type,
            orb: asp2.orb,
            interpretation: nodeData.interpretation,
            pastLifeTheme: nodeData.pastLife,
            lessonToLearn: nodeData.lesson,
            healingPotential: karmic === 'Chiron' ? chironData || '' : 'Growth through destiny alignment'
          });
        }
      }
    }
  }
  
  return indicators.sort((a, b) => a.orb - b.orb);
}

// ============================================
// RELATIONSHIP TYPE CLASSIFICATION
// ============================================

function calculateRelationshipTypes(chart1: NatalChart, chart2: NatalChart): RelationshipTypeScore[] {
  const scores: Record<RelationshipType, { points: number; indicators: string[] }> = {
    romantic: { points: 0, indicators: [] },
    business: { points: 0, indicators: [] },
    friendship: { points: 0, indicators: [] },
    'teacher-student': { points: 0, indicators: [] },
    karmic: { points: 0, indicators: [] },
    creative: { points: 0, indicators: [] }
  };
  
  // ROMANTIC INDICATORS
  if (hasAspect(chart1, 'Venus', chart2, 'Mars')) {
    scores.romantic.points += 25;
    scores.romantic.indicators.push('Venus-Mars: Classic romantic/sexual chemistry');
  }
  if (hasAspect(chart2, 'Venus', chart1, 'Mars')) {
    scores.romantic.points += 25;
    scores.romantic.indicators.push('Venus-Mars (reverse): Mutual attraction');
  }
  if (hasAspect(chart1, 'Sun', chart2, 'Moon', ['conjunction', 'trine', 'sextile'])) {
    scores.romantic.points += 20;
    scores.romantic.indicators.push('Sun-Moon harmony: Deep emotional-identity connection');
  }
  if (hasAspect(chart1, 'Venus', chart2, 'Pluto', ['conjunction', 'trine'])) {
    scores.romantic.points += 15;
    scores.romantic.indicators.push('Venus-Pluto: Intense, transformative love');
  }
  if (hasAspect(chart1, 'Moon', chart2, 'Venus', ['conjunction', 'trine'])) {
    scores.romantic.points += 15;
    scores.romantic.indicators.push('Moon-Venus: Emotional and romantic nurturing');
  }
  if (hasAspect(chart1, 'NorthNode', chart2, 'Venus', ['conjunction'])) {
    scores.romantic.points += 20;
    scores.romantic.indicators.push('North Node-Venus: Fated love connection');
  }
  
  // BUSINESS INDICATORS
  if (hasAspect(chart1, 'Saturn', chart2, 'Sun', ['conjunction', 'trine', 'sextile'])) {
    scores.business.points += 20;
    scores.business.indicators.push('Saturn-Sun: Structured leadership dynamic');
  }
  if (hasAspect(chart1, 'Jupiter', chart2, 'Mercury', ['conjunction', 'trine'])) {
    scores.business.points += 20;
    scores.business.indicators.push('Jupiter-Mercury: Expansive communication and ideas');
  }
  if (hasAspect(chart1, 'Saturn', chart2, 'Mercury', ['conjunction', 'trine', 'sextile'])) {
    scores.business.points += 15;
    scores.business.indicators.push('Saturn-Mercury: Practical thinking and planning');
  }
  if (hasAspect(chart1, 'Jupiter', chart2, 'Saturn', ['conjunction', 'trine', 'sextile'])) {
    scores.business.points += 20;
    scores.business.indicators.push('Jupiter-Saturn: Expansion meets structure—excellent for business');
  }
  if (hasAspect(chart1, 'Mars', chart2, 'Jupiter', ['conjunction', 'trine'])) {
    scores.business.points += 15;
    scores.business.indicators.push('Mars-Jupiter: Energetic, lucky action together');
  }
  
  // FRIENDSHIP INDICATORS
  if (hasAspect(chart1, 'Mercury', chart2, 'Mercury', ['conjunction', 'trine', 'sextile'])) {
    scores.friendship.points += 20;
    scores.friendship.indicators.push('Mercury-Mercury: Easy communication and mental rapport');
  }
  if (hasAspect(chart1, 'Moon', chart2, 'Moon', ['conjunction', 'trine', 'sextile'])) {
    scores.friendship.points += 20;
    scores.friendship.indicators.push('Moon-Moon: Emotional understanding and comfort');
  }
  if (hasAspect(chart1, 'Sun', chart2, 'Sun', ['conjunction', 'trine', 'sextile'])) {
    scores.friendship.points += 15;
    scores.friendship.indicators.push('Sun-Sun: Similar core identities and goals');
  }
  if (hasAspect(chart1, 'Jupiter', chart2, 'Sun', ['conjunction', 'trine'])) {
    scores.friendship.points += 15;
    scores.friendship.indicators.push('Jupiter-Sun: You bring each other joy and optimism');
  }
  if (hasAspect(chart1, 'Venus', chart2, 'Venus', ['conjunction', 'trine'])) {
    scores.friendship.points += 15;
    scores.friendship.indicators.push('Venus-Venus: Shared values and aesthetic tastes');
  }
  
  // TEACHER-STUDENT INDICATORS
  if (hasAspect(chart1, 'Saturn', chart2, 'Moon', ['conjunction'])) {
    scores['teacher-student'].points += 20;
    scores['teacher-student'].indicators.push('Saturn-Moon: Emotional lessons and maturity');
  }
  if (hasAspect(chart1, 'Jupiter', chart2, 'Sun', ['conjunction'])) {
    scores['teacher-student'].points += 20;
    scores['teacher-student'].indicators.push('Jupiter-Sun: Wisdom expands identity');
  }
  if (hasAspect(chart1, 'Saturn', chart2, 'Sun', ['conjunction', 'opposition'])) {
    scores['teacher-student'].points += 15;
    scores['teacher-student'].indicators.push('Saturn-Sun: Authority/mentorship dynamic');
  }
  if (hasAspect(chart1, 'Chiron', chart2, 'Sun', ['conjunction'])) {
    scores['teacher-student'].points += 15;
    scores['teacher-student'].indicators.push('Chiron-Sun: Wounded healer teaches through experience');
  }
  if (hasAspect(chart1, 'NorthNode', chart2, 'Saturn', ['conjunction'])) {
    scores['teacher-student'].points += 15;
    scores['teacher-student'].indicators.push('North Node-Saturn: Karmic teacher connection');
  }
  
  // KARMIC INDICATORS
  if (hasAspect(chart1, 'NorthNode', chart2, 'Sun', ['conjunction'])) {
    scores.karmic.points += 25;
    scores.karmic.indicators.push('North Node-Sun: Fated destiny connection');
  }
  if (hasAspect(chart1, 'NorthNode', chart2, 'Moon', ['conjunction'])) {
    scores.karmic.points += 20;
    scores.karmic.indicators.push('North Node-Moon: Emotionally fated bond');
  }
  if (hasAspect(chart1, 'Chiron', chart2, 'Sun', ['conjunction', 'opposition'])) {
    scores.karmic.points += 20;
    scores.karmic.indicators.push('Chiron-Sun: Deep healing purpose');
  }
  if (hasAspect(chart1, 'Saturn', chart2, 'Venus', ['conjunction'])) {
    scores.karmic.points += 15;
    scores.karmic.indicators.push('Saturn-Venus: Karmic love lessons');
  }
  if (hasAspect(chart1, 'Pluto', chart2, 'Moon', ['conjunction', 'opposition'])) {
    scores.karmic.points += 15;
    scores.karmic.indicators.push('Pluto-Moon: Intense transformative emotional bond');
  }
  
  // CREATIVE INDICATORS
  if (hasAspect(chart1, 'Neptune', chart2, 'Venus', ['conjunction', 'trine'])) {
    scores.creative.points += 25;
    scores.creative.indicators.push('Neptune-Venus: Artistic and imaginative harmony');
  }
  if (hasAspect(chart1, 'Uranus', chart2, 'Mercury', ['conjunction', 'trine'])) {
    scores.creative.points += 20;
    scores.creative.indicators.push('Uranus-Mercury: Innovative thinking together');
  }
  if (hasAspect(chart1, 'Neptune', chart2, 'Mercury', ['conjunction', 'trine'])) {
    scores.creative.points += 15;
    scores.creative.indicators.push('Neptune-Mercury: Imaginative communication');
  }
  if (hasAspect(chart1, 'Venus', chart2, 'Neptune', ['conjunction', 'trine'])) {
    scores.creative.points += 15;
    scores.creative.indicators.push('Venus-Neptune: Artistic and spiritual beauty');
  }
  
  // Normalize and create results
  const maxPossible = 100;
  const results: RelationshipTypeScore[] = [
    {
      type: 'romantic',
      score: Math.min(100, Math.round((scores.romantic.points / maxPossible) * 100 + 20)),
      label: 'Romantic Partnership',
      description: 'Intimate, romantic, and potentially long-term love connection',
      icon: '💕',
      indicators: scores.romantic.indicators
    },
    {
      type: 'business',
      score: Math.min(100, Math.round((scores.business.points / maxPossible) * 100 + 20)),
      label: 'Business Partnership',
      description: 'Professional collaboration, shared ventures, career synergy',
      icon: '💼',
      indicators: scores.business.indicators
    },
    {
      type: 'friendship',
      score: Math.min(100, Math.round((scores.friendship.points / maxPossible) * 100 + 20)),
      label: 'Friendship',
      description: 'Platonic connection, companionship, mutual enjoyment',
      icon: '🤝',
      indicators: scores.friendship.indicators
    },
    {
      type: 'teacher-student',
      score: Math.min(100, Math.round((scores['teacher-student'].points / maxPossible) * 100 + 10)),
      label: 'Teacher-Student / Mentor',
      description: 'One person guides, teaches, or mentors the other',
      icon: '📚',
      indicators: scores['teacher-student'].indicators
    },
    {
      type: 'karmic',
      score: Math.min(100, Math.round((scores.karmic.points / maxPossible) * 100 + 15)),
      label: 'Karmic / Soul Contract',
      description: 'Deep past-life connection with lessons to learn together',
      icon: '🌙',
      indicators: scores.karmic.indicators
    },
    {
      type: 'creative',
      score: Math.min(100, Math.round((scores.creative.points / maxPossible) * 100 + 15)),
      label: 'Creative Partnership',
      description: 'Artistic collaboration, inspiration, imaginative projects',
      icon: '🎨',
      indicators: scores.creative.indicators
    }
  ];
  
  return results.sort((a, b) => b.score - a.score);
}

// ============================================
// HOUSE OVERLAY ANALYSIS
// ============================================

const HOUSE_LIFE_AREAS: Record<number, string> = {
  1: 'Self-Image & First Impressions',
  2: 'Money, Values & Self-Worth',
  3: 'Communication & Daily Life',
  4: 'Home, Family & Emotional Foundation',
  5: 'Romance, Creativity & Fun',
  6: 'Health, Work & Daily Routines',
  7: 'Partnership & Marriage',
  8: 'Intimacy, Shared Resources & Transformation',
  9: 'Philosophy, Travel & Higher Learning',
  10: 'Career, Reputation & Public Image',
  11: 'Friendships, Groups & Future Vision',
  12: 'Spirituality, Secrets & Subconscious'
};

const PLANET_HOUSE_OVERLAYS: Record<string, Record<number, { interpretation: string; impact: 'activating' | 'challenging' | 'nurturing' | 'transformative' }>> = {
  Sun: {
    1: { interpretation: "They light up your sense of self. You feel more confident and alive around them. They see the 'real' you.", impact: 'activating' },
    2: { interpretation: "They boost your self-worth and may impact your finances or values. Their presence feels stabilizing.", impact: 'nurturing' },
    3: { interpretation: "Stimulating conversations. They make you think and communicate more. Mental connection is strong.", impact: 'activating' },
    4: { interpretation: "They feel like home. Deep emotional comfort. May trigger family patterns or desire for domestic life together.", impact: 'nurturing' },
    5: { interpretation: "Romance and fun! They bring out your playful, creative side. Strong romantic and creative chemistry.", impact: 'activating' },
    6: { interpretation: "They impact your daily life and health routines. May feel like a helpful but sometimes critical presence.", impact: 'challenging' },
    7: { interpretation: "Strong partnership indicator. They embody what you seek in a partner. Relationship-oriented connection.", impact: 'activating' },
    8: { interpretation: "Intense, transformative connection. Deep intimacy and shared resources. Powerful psychological impact.", impact: 'transformative' },
    9: { interpretation: "They expand your worldview. Travel, learning, and philosophical discussions together. Growth-oriented.", impact: 'activating' },
    10: { interpretation: "They impact your career or public image. May help your reputation or inspire professional growth.", impact: 'activating' },
    11: { interpretation: "Friendship first. They fit naturally into your social circle and share your hopes for the future.", impact: 'nurturing' },
    12: { interpretation: "Spiritual, subconscious connection. May bring up hidden patterns. Private, behind-the-scenes relationship.", impact: 'transformative' }
  },
  Moon: {
    1: { interpretation: "They intuitively understand your persona. Emotional connection to your identity and appearance.", impact: 'nurturing' },
    2: { interpretation: "They affect your emotional security around money and values. May nurture or destabilize self-worth.", impact: 'nurturing' },
    3: { interpretation: "Emotional communication flows. They understand your thought patterns and daily concerns.", impact: 'nurturing' },
    4: { interpretation: "Deeply nurturing. They feel like family. Strong domestic and emotional foundation together.", impact: 'nurturing' },
    5: { interpretation: "Emotional creativity and romance. They nurture your inner child and bring out playfulness.", impact: 'nurturing' },
    6: { interpretation: "They care about your health and daily wellbeing. May mother you—for better or worse.", impact: 'nurturing' },
    7: { interpretation: "Emotional partnership needs are met. They instinctively understand what you need in relationship.", impact: 'nurturing' },
    8: { interpretation: "Deep emotional intimacy. They access your vulnerabilities. Transformative emotional experiences together.", impact: 'transformative' },
    9: { interpretation: "Emotional expansion through beliefs, travel, and learning. They nurture your growth.", impact: 'nurturing' },
    10: { interpretation: "They emotionally support your career. Your reputation and their emotions are connected.", impact: 'nurturing' },
    11: { interpretation: "Emotionally supportive friendship. They care about your dreams and social connections.", impact: 'nurturing' },
    12: { interpretation: "Subconscious emotional bond. Past-life feeling. May bring up buried emotions for healing.", impact: 'transformative' }
  },
  Venus: {
    1: { interpretation: "Strong attraction. They find you beautiful/charming. Your appearance pleases them.", impact: 'activating' },
    2: { interpretation: "Shared values and financial harmony. They appreciate what you have and are.", impact: 'nurturing' },
    3: { interpretation: "Sweet, harmonious communication. Pleasant conversations. They love how you think.", impact: 'nurturing' },
    4: { interpretation: "Domestic bliss potential. They love your home life and family. Comfortable togetherness.", impact: 'nurturing' },
    5: { interpretation: "ROMANCE! Strong romantic and creative attraction. They bring love and fun into your life.", impact: 'activating' },
    6: { interpretation: "They appreciate your work ethic and daily habits. Love through service and care.", impact: 'nurturing' },
    7: { interpretation: "Ideal partner placement. They embody your relationship ideals. Strong marriage indicator.", impact: 'activating' },
    8: { interpretation: "Intense, passionate love. Deep bonding around intimacy and shared resources. Magnetic.", impact: 'transformative' },
    9: { interpretation: "Love of learning and adventure together. They share your philosophy of love.", impact: 'activating' },
    10: { interpretation: "They enhance your public image. May be a 'power couple' dynamic. Career harmony.", impact: 'activating' },
    11: { interpretation: "Love through friendship. They fit your social ideals and support your dreams.", impact: 'nurturing' },
    12: { interpretation: "Hidden or private love. Spiritual romance. May involve secrets or karmic patterns.", impact: 'transformative' }
  },
  Mars: {
    1: { interpretation: "Physical attraction. They energize and sometimes challenge your identity. Sparks fly.", impact: 'activating' },
    2: { interpretation: "They activate your earning potential or challenge your values. Financial drive together.", impact: 'activating' },
    3: { interpretation: "Stimulating debates. They challenge how you think and communicate. Mental sparring.", impact: 'challenging' },
    4: { interpretation: "May activate family issues or drive to create home together. Emotional passion.", impact: 'challenging' },
    5: { interpretation: "Passionate romance and creative fire. Strong sexual and creative chemistry.", impact: 'activating' },
    6: { interpretation: "They push you to work harder or improve health. Can feel demanding.", impact: 'challenging' },
    7: { interpretation: "Partnership drive. May be competitive or passionate. They push you toward commitment.", impact: 'activating' },
    8: { interpretation: "Intense sexual chemistry. Power dynamics around intimacy and shared resources.", impact: 'transformative' },
    9: { interpretation: "Adventure together! They inspire action toward growth, travel, and new experiences.", impact: 'activating' },
    10: { interpretation: "Career drive. They push your professional ambitions. May compete or collaborate publicly.", impact: 'activating' },
    11: { interpretation: "Active friendship. They energize your social life and fight for your dreams.", impact: 'activating' },
    12: { interpretation: "Hidden drives activated. May bring up subconscious anger or spiritual warrior energy.", impact: 'transformative' }
  },
  Jupiter: {
    1: { interpretation: "They expand your self-expression. You feel luckier and more confident around them.", impact: 'activating' },
    5: { interpretation: "Joy and abundance in romance and creativity. They bring luck to your love life.", impact: 'activating' },
    7: { interpretation: "Expansive partnership. They bring growth and opportunity to committed relationships.", impact: 'activating' },
    10: { interpretation: "Career luck! They expand your professional opportunities and public standing.", impact: 'activating' }
  },
  Saturn: {
    1: { interpretation: "They may feel critical of your self-expression but offer structure and maturity.", impact: 'challenging' },
    4: { interpretation: "Serious about home and family. May trigger family responsibility or restriction.", impact: 'challenging' },
    7: { interpretation: "Commitment-focused but may feel limiting. Long-term relationship potential with work.", impact: 'challenging' },
    10: { interpretation: "Career lessons. They may be a mentor or authority figure. Professional structure.", impact: 'challenging' }
  }
};

function calculateHouseOverlays(chart1: NatalChart, chart2: NatalChart): HouseOverlay[] {
  const overlays: HouseOverlay[] = [];
  
  // We need house cusps to do proper overlays
  // For now, we'll use whole sign houses based on Ascendant
  if (!chart1.planets.Ascendant || !chart2.planets.Ascendant) {
    return overlays;
  }
  
  const getHouseForPlanet = (planetPos: NatalPlanetPosition, ascSign: string): number => {
    const planetSignIndex = ZODIAC_SIGNS.indexOf(planetPos.sign);
    const ascSignIndex = ZODIAC_SIGNS.indexOf(ascSign);
    if (planetSignIndex === -1 || ascSignIndex === -1) return 1;
    
    let house = ((planetSignIndex - ascSignIndex + 12) % 12) + 1;
    return house;
  };
  
  const planets = ['Sun', 'Moon', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  
  // Chart1's planets in Chart2's houses
  for (const planet of planets) {
    const planetPos = chart1.planets[planet as keyof typeof chart1.planets];
    if (!planetPos) continue;
    
    const house = getHouseForPlanet(planetPos, chart2.planets.Ascendant.sign);
    const overlayData = PLANET_HOUSE_OVERLAYS[planet]?.[house];
    
    if (overlayData) {
      overlays.push({
        planet,
        planetOwner: chart1.name,
        house,
        houseOwner: chart2.name,
        interpretation: overlayData.interpretation,
        lifeArea: HOUSE_LIFE_AREAS[house],
        impact: overlayData.impact
      });
    }
  }
  
  // Chart2's planets in Chart1's houses
  for (const planet of planets) {
    const planetPos = chart2.planets[planet as keyof typeof chart2.planets];
    if (!planetPos) continue;
    
    const house = getHouseForPlanet(planetPos, chart1.planets.Ascendant.sign);
    const overlayData = PLANET_HOUSE_OVERLAYS[planet]?.[house];
    
    if (overlayData) {
      overlays.push({
        planet,
        planetOwner: chart2.name,
        house,
        houseOwner: chart1.name,
        interpretation: overlayData.interpretation,
        lifeArea: HOUSE_LIFE_AREAS[house],
        impact: overlayData.impact
      });
    }
  }
  
  return overlays;
}

// ============================================
// MAIN REPORT GENERATOR
// ============================================

export function generateAdvancedSynastryReport(chart1: NatalChart, chart2: NatalChart): AdvancedSynastryReport {
  const relationshipTypes = calculateRelationshipTypes(chart1, chart2);
  const karmicIndicators = getKarmicIndicators(chart1, chart2);
  const attractionDynamics = getAttractionDynamics(chart1, chart2);
  const conflictTriggers = getConflictTriggers(chart1, chart2);
  const houseOverlays = calculateHouseOverlays(chart1, chart2);
  
  // Extract scores
  const romanticScore = relationshipTypes.find(r => r.type === 'romantic')?.score || 50;
  const businessScore = relationshipTypes.find(r => r.type === 'business')?.score || 50;
  const friendshipScore = relationshipTypes.find(r => r.type === 'friendship')?.score || 50;
  const karmicScore = relationshipTypes.find(r => r.type === 'karmic')?.score || 50;
  const teacherStudentScore = relationshipTypes.find(r => r.type === 'teacher-student')?.score || 50;
  const creativeScore = relationshipTypes.find(r => r.type === 'creative')?.score || 50;
  
  const overallCompatibility = Math.round(
    (romanticScore * 0.2) + 
    (friendshipScore * 0.2) + 
    (karmicScore * 0.2) +
    (businessScore * 0.15) +
    (teacherStudentScore * 0.1) +
    (creativeScore * 0.15)
  );
  
  // Generate narrative summaries
  const topTypes = relationshipTypes.slice(0, 2);
  const whyDrawnTogether = generateAttractionNarrative(chart1, chart2, attractionDynamics, karmicIndicators);
  const relationshipPurpose = generatePurposeNarrative(topTypes, karmicIndicators);
  
  const growthOpportunities = [
    ...karmicIndicators.slice(0, 3).map(k => k.lessonToLearn),
    ...conflictTriggers.slice(0, 2).map(c => c.resolution)
  ].filter(Boolean);
  
  const watchOutFor = conflictTriggers.map(c => 
    `${c.name}: ${c.triggerDescription.split('.')[0]}`
  );
  
  // Determine soul contract theme
  const soulContractTheme = karmicIndicators.length > 0
    ? `Your soul contract centers on ${karmicIndicators[0].lessonToLearn.toLowerCase()}. ${karmicIndicators[0].interpretation.split('.')[0]}.`
    : topTypes[0].type === 'romantic'
      ? 'You are here to explore deep romantic love and partnership.'
      : topTypes[0].type === 'business'
        ? 'Your connection is designed for building something tangible together.'
        : 'Your souls have connected to support mutual growth and evolution.';
  
  const pastLifeConnection = karmicIndicators.find(k => k.pastLifeTheme)?.pastLifeTheme || 
    'While specific past-life indicators are subtle, the depth of your connection suggests you have met before in some capacity.';
  
  return {
    overallCompatibility,
    romanticScore,
    businessScore,
    friendshipScore,
    karmicScore,
    teacherStudentScore,
    creativeScore,
    bestRelationshipTypes: relationshipTypes,
    karmicIndicators,
    soulContractTheme,
    pastLifeConnection,
    attractionDynamics,
    conflictTriggers,
    houseOverlays,
    whyDrawnTogether,
    relationshipPurpose,
    growthOpportunities,
    watchOutFor
  };
}

function generateAttractionNarrative(
  chart1: NatalChart, 
  chart2: NatalChart, 
  dynamics: AttractionDynamic[],
  karmic: KarmicIndicator[]
): string {
  if (dynamics.length === 0 && karmic.length === 0) {
    return `${chart1.name} and ${chart2.name} share a subtle but real connection. While there may not be explosive chemistry, there is a steady compatibility that can build over time.`;
  }
  
  const parts: string[] = [];
  
  if (dynamics.find(d => d.chemistry === 'magnetic')) {
    parts.push(`There is undeniable magnetic attraction between you—the kind that makes it hard to stay away from each other.`);
  }
  
  if (karmic.find(k => k.planet1 === 'NorthNode' && k.aspectType === 'conjunction')) {
    parts.push(`This is a fated connection. ${chart1.name} and ${chart2.name} are drawn together by destiny, not just preference.`);
  }
  
  if (dynamics.find(d => d.chemistry === 'comfort')) {
    parts.push(`You feel instantly comfortable with each other, like you've known each other for years.`);
  }
  
  if (dynamics.find(d => d.chemistry === 'deep')) {
    parts.push(`The connection runs deep—perhaps deeper than either of you initially realized.`);
  }
  
  if (karmic.find(k => k.planet1 === 'Chiron')) {
    parts.push(`There is a healing purpose to this connection. Old wounds surface not to harm, but to finally heal.`);
  }
  
  return parts.length > 0 
    ? parts.join(' ') 
    : `${chart1.name} and ${chart2.name} are drawn together by a mix of compatibility factors that create genuine connection.`;
}

function generatePurposeNarrative(
  topTypes: RelationshipTypeScore[],
  karmic: KarmicIndicator[]
): string {
  const primary = topTypes[0];
  
  const purposes: Record<RelationshipType, string> = {
    romantic: 'explore deep romantic love, intimacy, and partnership',
    business: 'build something tangible together—a project, business, or shared legacy',
    friendship: 'enjoy companionship, mutual support, and shared experiences',
    'teacher-student': 'facilitate learning and growth through mentorship',
    karmic: 'complete unfinished business from past lives and heal old patterns',
    creative: 'inspire each other artistically and bring imaginative visions to life'
  };
  
  let purpose = `The primary purpose of this connection is to ${purposes[primary.type]}.`;
  
  if (topTypes[1] && topTypes[1].score > 50) {
    purpose += ` There is also strong potential for ${topTypes[1].label.toLowerCase()}.`;
  }
  
  if (karmic.length > 0) {
    purpose += ` Karmically, you are here to learn: ${karmic[0].lessonToLearn}`;
  }
  
  return purpose;
}
