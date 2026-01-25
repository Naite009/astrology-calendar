import { NatalChart } from '@/hooks/useNatalChart';

// Karmic weight constants
const KARMIC_WEIGHTS = {
  southNode: {
    conjunction: 15,
    opposition: 10,
    square: 8,
    trine: 6,
    sextile: 4
  },
  northNode: {
    conjunction: 12,
    opposition: 8,
    square: 6,
    trine: 5,
    sextile: 3
  },
  saturn: {
    conjunction: 12,
    opposition: 10,
    square: 10,
    trine: 5,
    sextile: 3
  },
  pluto: {
    conjunction: 14,
    opposition: 12,
    square: 11,
    trine: 6,
    sextile: 4
  },
  chiron: {
    conjunction: 10,
    opposition: 8,
    square: 7,
    trine: 4,
    sextile: 3
  },
  twelfthHouse: 8,
  eighthHouse: 6,
  vertex: 10
};

// Personal planets for karmic analysis
const PERSONAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
const KARMIC_PLANETS = ['Saturn', 'Pluto', 'NorthNode', 'SouthNode', 'Chiron'];

export interface KarmicIndicator {
  type: 'south_node' | 'north_node' | 'saturn' | 'pluto' | 'chiron' | 'twelfth_house' | 'eighth_house' | 'vertex';
  planet1: string;
  planet2: string;
  aspect?: string;
  weight: number;
  interpretation: string;
  theme: 'past_life' | 'soul_growth' | 'karmic_debt' | 'transformation' | 'healing' | 'fated';
}

export interface KarmicAnalysis {
  totalKarmicScore: number;
  pastLifeProbability: number; // 0-100
  karmicType: 'completion' | 'new_contract' | 'soul_family' | 'catalyst' | 'twin_flame' | 'karmic_lesson';
  indicators: KarmicIndicator[];
  dangerFlags: string[];
  healingOpportunities: string[];
  soulPurpose: string;
  recommendedApproach: string;
  timeline: {
    likely_duration: string;
    key_lessons: string[];
    completion_indicators: string[];
  };
}

export function calculateKarmicAnalysis(chart1: NatalChart, chart2: NatalChart): KarmicAnalysis {
  const indicators: KarmicIndicator[] = [];
  const dangerFlags: string[] = [];
  const healingOpportunities: string[] = [];

  // Analyze South Node connections (past life indicators)
  analyzeSouthNodeConnections(chart1, chart2, indicators);
  analyzeSouthNodeConnections(chart2, chart1, indicators);

  // Analyze North Node connections (soul growth)
  analyzeNorthNodeConnections(chart1, chart2, indicators);
  analyzeNorthNodeConnections(chart2, chart1, indicators);

  // Analyze Saturn karma
  analyzeSaturnKarma(chart1, chart2, indicators, dangerFlags);
  analyzeSaturnKarma(chart2, chart1, indicators, dangerFlags);

  // Analyze Pluto transformation/power dynamics
  analyzePlutoTransformation(chart1, chart2, indicators, dangerFlags);
  analyzePlutoTransformation(chart2, chart1, indicators, dangerFlags);

  // Analyze Chiron healing
  analyzeChironHealing(chart1, chart2, indicators, healingOpportunities);
  analyzeChironHealing(chart2, chart1, indicators, healingOpportunities);

  // Analyze 12th house overlays (hidden/spiritual/past life)
  analyzeTwelfthHouseOverlays(chart1, chart2, indicators);
  analyzeTwelfthHouseOverlays(chart2, chart1, indicators);

  // Analyze 8th house overlays (trauma bonding/transformation)
  analyzeEighthHouseOverlays(chart1, chart2, indicators, dangerFlags);
  analyzeEighthHouseOverlays(chart2, chart1, indicators, dangerFlags);

  // Analyze Vertex contacts (fated encounters)
  analyzeVertexContacts(chart1, chart2, indicators);

  // Calculate scores
  const totalKarmicScore = indicators.reduce((sum, ind) => sum + ind.weight, 0);
  const pastLifeScore = indicators
    .filter(ind => ind.theme === 'past_life')
    .reduce((sum, ind) => sum + ind.weight, 0);
  
  const pastLifeProbability = Math.min(100, Math.round((pastLifeScore / 80) * 100));

  // Determine karmic type
  const karmicType = determineKarmicType(indicators, totalKarmicScore);

  // Generate soul purpose and recommendations
  const soulPurpose = generateSoulPurpose(indicators, karmicType);
  const recommendedApproach = generateRecommendedApproach(karmicType, dangerFlags, indicators);
  const timeline = generateTimeline(karmicType, indicators);

  return {
    totalKarmicScore,
    pastLifeProbability,
    karmicType,
    indicators,
    dangerFlags,
    healingOpportunities,
    soulPurpose,
    recommendedApproach,
    timeline
  };
}

function analyzeSouthNodeConnections(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[]) {
  const southNode1 = chart1.planets.SouthNode;
  if (!southNode1) return;

  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;

    const aspect = calculateAspect(southNode1, planet2);
    if (aspect) {
      const weight = KARMIC_WEIGHTS.southNode[aspect] || 0;
      indicators.push({
        type: 'south_node',
        planet1: 'SouthNode',
        planet2: planetName,
        aspect,
        weight,
        interpretation: getSouthNodeInterpretation(planetName, aspect),
        theme: 'past_life'
      });
    }
  });
}

function analyzeNorthNodeConnections(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[]) {
  const northNode1 = chart1.planets.NorthNode;
  if (!northNode1) return;

  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;

    const aspect = calculateAspect(northNode1, planet2);
    if (aspect) {
      const weight = KARMIC_WEIGHTS.northNode[aspect] || 0;
      indicators.push({
        type: 'north_node',
        planet1: 'NorthNode',
        planet2: planetName,
        aspect,
        weight,
        interpretation: getNorthNodeInterpretation(planetName, aspect),
        theme: 'soul_growth'
      });
    }
  });
}

function analyzeSaturnKarma(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[], dangerFlags: string[]) {
  const saturn1 = chart1.planets.Saturn;
  if (!saturn1) return;

  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;

    const aspect = calculateAspect(saturn1, planet2);
    if (aspect) {
      const weight = KARMIC_WEIGHTS.saturn[aspect] || 0;
      indicators.push({
        type: 'saturn',
        planet1: 'Saturn',
        planet2: planetName,
        aspect,
        weight,
        interpretation: getSaturnInterpretation(planetName, aspect),
        theme: 'karmic_debt'
      });

      // Flag dangerous Saturn aspects
      if ((aspect === 'conjunction' || aspect === 'square' || aspect === 'opposition') && 
          (planetName === 'Moon' || planetName === 'Sun' || planetName === 'Venus')) {
        dangerFlags.push(`Saturn ${aspect} ${planetName}: Potential for emotional restriction, criticism, or controlling behavior. This can manifest as emotional unavailability or power imbalances.`);
      }
    }
  });
}

function analyzePlutoTransformation(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[], dangerFlags: string[]) {
  const pluto1 = chart1.planets.Pluto;
  if (!pluto1) return;

  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;

    const aspect = calculateAspect(pluto1, planet2);
    if (aspect) {
      const weight = KARMIC_WEIGHTS.pluto[aspect] || 0;
      indicators.push({
        type: 'pluto',
        planet1: 'Pluto',
        planet2: planetName,
        aspect,
        weight,
        interpretation: getPlutoInterpretation(planetName, aspect),
        theme: 'transformation'
      });

      // Flag dangerous Pluto aspects
      if ((aspect === 'conjunction' || aspect === 'square' || aspect === 'opposition') && 
          (planetName === 'Venus' || planetName === 'Mars' || planetName === 'Moon')) {
        dangerFlags.push(`Pluto ${aspect} ${planetName}: Intense power dynamics. Can manifest as obsession, possessiveness, jealousy, or manipulation. Requires high consciousness to navigate healthily.`);
      }
    }
  });
}

function analyzeChironHealing(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[], healingOpportunities: string[]) {
  const chiron1 = chart1.planets.Chiron;
  if (!chiron1) return;

  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;

    const aspect = calculateAspect(chiron1, planet2);
    if (aspect) {
      const weight = KARMIC_WEIGHTS.chiron[aspect] || 0;
      indicators.push({
        type: 'chiron',
        planet1: 'Chiron',
        planet2: planetName,
        aspect,
        weight,
        interpretation: getChironInterpretation(planetName, aspect),
        theme: 'healing'
      });

      healingOpportunities.push(`Chiron ${aspect} ${planetName}: ${getChironHealingOpportunity(planetName, aspect)}`);
    }
  });
}

function analyzeTwelfthHouseOverlays(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[]) {
  // Find 12th house cusp
  const twelfthHouseCusp = chart1.houseCusps?.[12];
  if (!twelfthHouseCusp) return;

  const nextHouseCusp = chart1.houseCusps?.[1]; // Ascendant
  if (!nextHouseCusp) return;

  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;

    if (isPlanetInHouse(planet2, twelfthHouseCusp, nextHouseCusp)) {
      indicators.push({
        type: 'twelfth_house',
        planet1: planetName,
        planet2: '12th House',
        weight: KARMIC_WEIGHTS.twelfthHouse,
        interpretation: `${planetName} in 12th house: ${getTwelfthHouseInterpretation(planetName)}`,
        theme: 'past_life'
      });
    }
  });
}

function analyzeEighthHouseOverlays(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[], dangerFlags: string[]) {
  const eighthHouseCusp = chart1.houseCusps?.[8];
  if (!eighthHouseCusp) return;

  const ninthHouseCusp = chart1.houseCusps?.[9];
  if (!ninthHouseCusp) return;

  let eighthHouseCount = 0;

  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;

    if (isPlanetInHouse(planet2, eighthHouseCusp, ninthHouseCusp)) {
      eighthHouseCount++;
      indicators.push({
        type: 'eighth_house',
        planet1: planetName,
        planet2: '8th House',
        weight: KARMIC_WEIGHTS.eighthHouse,
        interpretation: `${planetName} in 8th house: ${getEighthHouseInterpretation(planetName)}`,
        theme: 'transformation'
      });
    }
  });

  if (eighthHouseCount >= 3) {
    dangerFlags.push(`Multiple planets in 8th house: High intensity, potential for power struggles, trauma bonding, or difficulty maintaining boundaries. This can be deeply transformative or destructive depending on consciousness.`);
  }
}

function analyzeVertexContacts(chart1: NatalChart, chart2: NatalChart, indicators: KarmicIndicator[]) {
  const vertex1 = chart1.planets.Vertex;
  if (!vertex1) return;

  PERSONAL_PLANETS.forEach(planetName => {
    const planet2 = chart2.planets[planetName];
    if (!planet2) return;

    const aspect = calculateAspect(vertex1, planet2);
    if (aspect === 'conjunction') {
      indicators.push({
        type: 'vertex',
        planet1: 'Vertex',
        planet2: planetName,
        aspect: 'conjunction',
        weight: KARMIC_WEIGHTS.vertex,
        interpretation: `Vertex conjunct ${planetName}: Fated encounter. This person was "meant" to appear in your life at this time for a specific purpose.`,
        theme: 'fated'
      });
    }
  });
}

// Helper function to calculate aspects
function calculateAspect(planet1: any, planet2: any): string | null {
  const pos1 = planet1.sign * 30 + planet1.degree + (planet1.minutes / 60);
  const pos2 = planet2.sign * 30 + planet2.degree + (planet2.minutes / 60);
  
  let diff = Math.abs(pos1 - pos2);
  if (diff > 180) diff = 360 - diff;

  const orbs = {
    conjunction: 8,
    opposition: 8,
    trine: 8,
    square: 7,
    sextile: 6
  };

  if (diff <= orbs.conjunction) return 'conjunction';
  if (Math.abs(diff - 180) <= orbs.opposition) return 'opposition';
  if (Math.abs(diff - 120) <= orbs.trine) return 'trine';
  if (Math.abs(diff - 90) <= orbs.square) return 'square';
  if (Math.abs(diff - 60) <= orbs.sextile) return 'sextile';

  return null;
}

function isPlanetInHouse(planet: any, houseCusp: any, nextHouseCusp: any): boolean {
  const planetPos = planet.sign * 30 + planet.degree + (planet.minutes / 60);
  const cuspPos = houseCusp.sign * 30 + houseCusp.degree + (houseCusp.minutes / 60);
  let nextCuspPos = nextHouseCusp.sign * 30 + nextHouseCusp.degree + (nextHouseCusp.minutes / 60);

  // Handle wraparound
  if (nextCuspPos < cuspPos) nextCuspPos += 360;
  let adjustedPlanetPos = planetPos;
  if (adjustedPlanetPos < cuspPos) adjustedPlanetPos += 360;

  return adjustedPlanetPos >= cuspPos && adjustedPlanetPos < nextCuspPos;
}

function determineKarmicType(indicators: KarmicIndicator[], totalScore: number): KarmicAnalysis['karmicType'] {
  const pastLifeCount = indicators.filter(i => i.theme === 'past_life').length;
  const transformationCount = indicators.filter(i => i.theme === 'transformation').length;
  const fatedCount = indicators.filter(i => i.theme === 'fated').length;
  const growthCount = indicators.filter(i => i.theme === 'soul_growth').length;

  if (totalScore >= 100 && pastLifeCount >= 4 && transformationCount >= 3) return 'twin_flame';
  if (pastLifeCount >= 5) return 'completion';
  if (transformationCount >= 4 && totalScore >= 60) return 'catalyst';
  if (fatedCount >= 2 || (growthCount >= 4 && pastLifeCount <= 2)) return 'soul_family';
  if (totalScore >= 50 && pastLifeCount >= 2) return 'karmic_lesson';
  return 'new_contract';
}

// Interpretation functions
function getSouthNodeInterpretation(planet: string, aspect: string): string {
  const interpretations: Record<string, string> = {
    Sun: `Past life connection to identity/purpose. You've known each other's essence before. ${aspect === 'conjunction' ? 'Extremely familiar, but may feel like repeating old patterns.' : 'Recognition across lifetimes.'}`,
    Moon: `Deep emotional familiarity from past lives. ${aspect === 'conjunction' ? 'You instinctively understand each other\'s emotional needs, but may replay old emotional dynamics.' : 'Emotional resonance that transcends this lifetime.'}`,
    Venus: `Past life love connection. ${aspect === 'conjunction' ? 'Strong sense of having loved before. Can be beautiful but watch for falling into old relationship patterns.' : 'Affection that feels ancient and familiar.'}`,
    Mars: `Past life action/passion connection. ${aspect === 'conjunction' ? 'You know how to activate each other. May replay past conflicts or passions.' : 'Dynamic energy that feels rehearsed.'}`,
    Mercury: `Past life mental connection. ${aspect === 'conjunction' ? 'Communication feels telepathic. You\'ve shared ideas before.' : 'Understanding that goes beyond words.'}`
  };
  return interpretations[planet] || `Past life connection with ${planet}`;
}

function getNorthNodeInterpretation(planet: string, aspect: string): string {
  const interpretations: Record<string, string> = {
    Sun: `This person illuminates your soul path. ${aspect === 'conjunction' ? 'They are here to help you step into your destiny.' : 'They support your evolutionary journey.'}`,
    Moon: `This person nurtures your soul growth. ${aspect === 'conjunction' ? 'They help you emotionally evolve into who you\'re meant to become.' : 'Emotional support for your path forward.'}`,
    Venus: `This person teaches you about love in new ways. ${aspect === 'conjunction' ? 'They show you what healthy love looks like for your evolution.' : 'Love that helps you grow.'}`,
    Mars: `This person activates your forward momentum. ${aspect === 'conjunction' ? 'They push you toward your destiny, sometimes uncomfortably.' : 'Energy that propels your growth.'}`,
    Mercury: `This person teaches you new ways of thinking. ${aspect === 'conjunction' ? 'Communication with them expands your mind toward your purpose.' : 'Mental evolution through dialogue.'}`
  };
  return interpretations[planet] || `Soul growth through ${planet}`;
}

function getSaturnInterpretation(planet: string, aspect: string): string {
  const hard = aspect === 'conjunction' || aspect === 'square' || aspect === 'opposition';
  const interpretations: Record<string, string> = {
    Sun: hard ? 'Karmic authority dynamic. May feel criticized or restricted. Lesson: own your power without approval.' : 'Supportive structure for identity. They help you build solid self-worth.',
    Moon: hard ? 'Emotional karma. May feel emotionally cold, criticized, or unsafe. Lesson: self-validate emotions without needing their approval.' : 'Emotional stability and maturity. They teach responsible emotional expression.',
    Venus: hard ? 'Love lesson. May feel unloved, not good enough, or restricted. Lesson: self-worth independent of their validation.' : 'Committed, stable love. They teach you about long-term devotion.',
    Mars: hard ? 'Action blocked. May feel your energy/sexuality is criticized or controlled. Lesson: healthy assertion of desires.' : 'Disciplined action. They help you channel energy productively.',
    Mercury: hard ? 'Communication shut down. May feel unheard or intellectually inadequate. Lesson: trust your mind.' : 'Structured thinking. They help you organize and focus your thoughts.'
  };
  return interpretations[planet] || `Karmic lesson through ${planet}`;
}

function getPlutoInterpretation(planet: string, aspect: string): string {
  const hard = aspect === 'conjunction' || aspect === 'square' || aspect === 'opposition';
  const interpretations = {
    Sun: hard ? `Power struggle over identity. Potential for control, manipulation, or obsession. Transformation through reclaiming personal power.` : `Empowering transformation. They help you step into authentic power.`,
    Moon: hard ? `Emotional intensity/manipulation. Potential for emotional abuse or trauma bonding. Transformation requires emotional sovereignty.` : `Deep emotional healing. They help you access and transform buried feelings.`,
    Venus: hard ? `Obsessive love. Jealousy, possessiveness, or power games in romance. Can't-leave-even-when-toxic energy. Requires conscious work.` : `Transformative love. Deep, passionate connection that changes you both.`,
    Mars: hard ? `Sexual power dynamics. Potential for aggression, sexual manipulation, or violent passion. Requires healthy boundaries.` : `Powerful chemistry. Passionate, transformative physical connection.`,
    Mercury: hard ? `Mental control. May experience gaslighting, psychological manipulation, or obsessive thinking. Guard your mental sovereignty.` : `Transformative communication. Deep, probing conversations that change perspectives.`
  };
  return interpretations[planet] || `Transformation through ${planet}`;
}

function getChironInterpretation(planet: string, aspect: string): string {
  const interpretations = {
    Sun: `They trigger your core wound around identity/visibility. Can heal or retraumatize depending on their awareness.`,
    Moon: `They touch your emotional wound. Opportunity to heal childhood/maternal wounds or replay them.`,
    Venus: `They activate your love wound. Chance to heal unworthiness or repeat the pattern of not being chosen.`,
    Mars: `They trigger your wound around anger/assertion. Opportunity to heal and express healthy anger.`,
    Mercury: `They touch your wound around being heard/understood. Chance to finally feel intellectually validated.`
  };
  return interpretations[planet] || `Healing opportunity through ${planet}`;
}

function getChironHealingOpportunity(planet: string, aspect: string): string {
  return `This contact offers healing of your ${planet.toLowerCase()} wound. Be conscious of whether you're being retraumatized or genuinely supported in healing.`;
}

function getTwelfthHouseInterpretation(planet: string): string {
  const interpretations = {
    Sun: `Their identity/ego operates in your unconscious realm. Psychic connection, but you may not "see" them clearly. Hidden aspects.`,
    Moon: `Their emotions affect you subconsciously. You pick up their feelings without them saying anything. Can be draining or healing.`,
    Venus: `Secret love, hidden affection. What you love about them may be unconscious or hidden from others. Private intimacy.`,
    Mars: `Their actions/desires operate behind the scenes. Sexual attraction may be secret or suppressed. Hidden motivations.`,
    Mercury: `Telepathic communication. You understand without words. Shared dreams, hidden messages.`
  };
  return interpretations[planet] || `Hidden, spiritual, or past-life connection through ${planet}`;
}

function getEighthHouseInterpretation(planet: string): string {
  const interpretations = {
    Sun: `Their identity merges with your deepest self. Intense intimacy, potential for loss of boundaries.`,
    Moon: `Emotional fusion. Deep psychic bond but risk of enmeshment or emotional manipulation.`,
    Venus: `Intense, possessive love. Sexual and emotional depth. Can be healing or create unhealthy attachment.`,
    Mars: `Powerful sexual attraction. Potential for sexual power dynamics or transformative passion.`,
    Mercury: `They communicate about taboo topics, secrets, psychology. Deep mental intimacy or invasion.`
  };
  return interpretations[planet] || `Intense transformation through ${planet}`;
}

function generateSoulPurpose(indicators: KarmicIndicator[], type: KarmicAnalysis['karmicType']): string {
  const purposes = {
    twin_flame: `This is a mirror relationship designed to show you your deepest wounds and highest potential. The soul purpose is radical self-awareness and transformation. You're here to heal what you couldn't heal alone.`,
    completion: `You've shared past lives and are here to complete unfinished business. The soul purpose is to resolve old patterns, forgive, release karma, and move forward free of this dynamic.`,
    catalyst: `This person is a catalyst for your transformation. The soul purpose is rapid growth through intensity. They shake up your world so you become who you're meant to be, then the relationship often completes.`,
    soul_family: `This is a supportive soul connection. The soul purpose is mutual growth, companionship on the path, and helping each other evolve with love and encouragement.`,
    karmic_lesson: `This person teaches a specific karmic lesson you need to learn. The soul purpose is to master this lesson and integrate it, which may or may not require staying in the relationship long-term.`,
    new_contract: `This is a new soul agreement without heavy past-life karma. The soul purpose is to create something new together and support each other's present-life goals.`
  };
  return purposes[type];
}

function generateRecommendedApproach(type: KarmicAnalysis['karmicType'], dangerFlags: string[], indicators: KarmicIndicator[]): string {
  const hasPlutoWarnings = dangerFlags.some(f => f.includes('Pluto'));
  const hasSaturnWarnings = dangerFlags.some(f => f.includes('Saturn'));
  const has8thHouseWarnings = dangerFlags.some(f => f.includes('8th house'));

  let approach = '';

  if (dangerFlags.length >= 3) {
    approach = `⚠️ HIGH ALERT: Multiple danger indicators present. This relationship has potential for psychological/emotional harm. Proceed with extreme caution, maintain strong boundaries, seek professional support, and be willing to leave if patterns become abusive. `;
  } else if (dangerFlags.length > 0) {
    approach = `⚠️ CAUTION: Some challenging dynamics present. `;
  }

  const typeApproaches = {
    twin_flame: `This requires both people to be in active healing/growth. If one person is unconscious, it becomes toxic. Requires therapy, boundaries, and willingness to do deep shadow work.`,
    completion: `Focus on what needs to be resolved, forgiven, or released. This may be a shorter relationship meant to free both of you. Don't force it to be more than it is.`,
    catalyst: `Embrace the transformation but protect yourself. These relationships are often temporary and intense. Extract the lesson without destroying yourself.`,
    soul_family: `Nurture this connection. These are rare and precious. Support each other's growth and enjoy the journey together.`,
    karmic_lesson: `Stay conscious of the lesson. Once learned and integrated, the intensity often naturally decreases. Don't stay stuck repeating the pattern.`,
    new_contract: `Build something healthy from the ground up. You have freedom to create new patterns without karmic baggage weighing you down.`
  };

  approach += typeApproaches[type];

  if (hasPlutoWarnings && hasSaturnWarnings) {
    approach += ` The Pluto-Saturn combination indicates potential for long-term trauma bonding patterns. This requires conscious awareness and possibly professional support to navigate safely.`;
  }

  return approach;
}

function generateTimeline(type: KarmicAnalysis['karmicType'], indicators: KarmicIndicator[]): KarmicAnalysis['timeline'] {
  const timelines = {
    twin_flame: {
      likely_duration: '7-14 years of intense cycles, or lifetime if both commit to growth',
      key_lessons: ['Self-love', 'Healthy boundaries', 'Shadow integration', 'Sovereignty in union'],
      completion_indicators: ['Both people have healed core wounds', 'Drama decreases significantly', 'Relationship feels peaceful', 'You can be apart without anxiety']
    },
    completion: {
      likely_duration: '6 months to 3 years',
      key_lessons: ['Forgiveness', 'Release', 'Pattern completion', 'Karmic freedom'],
      completion_indicators: ['Feeling of resolution', 'No more emotional charge', 'Natural drift apart', 'Sense of completion/peace']
    },
    catalyst: {
      likely_duration: '3 months to 2 years',
      key_lessons: ['Rapid transformation', 'Breaking old patterns', 'Claiming authentic self'],
      completion_indicators: ['Major life change occurs', 'You become unrecognizable from before', 'Intensity naturally fades', 'Mission accomplished feeling']
    },
    soul_family: {
      likely_duration: 'Potentially lifetime',
      key_lessons: ['Unconditional love', 'Mutual support', 'Joyful growth'],
      completion_indicators: ['Continues to feel nourishing', 'Grows and evolves naturally', 'No expiration date']
    },
    karmic_lesson: {
      likely_duration: '1-5 years',
      key_lessons: ['Specific wound healing', 'New behavior patterns', 'Integration of lesson'],
      completion_indicators: ['Lesson is mastered', 'Pattern no longer triggers', 'Growth feels complete', 'May naturally transition']
    },
    new_contract: {
      likely_duration: 'Variable - no karmic timeline',
      key_lessons: ['Present-moment relating', 'Co-creation', 'Fresh start'],
      completion_indicators: ['Based on compatibility and choice', 'Not karmically predetermined']
    }
  };

  return timelines[type];
}

export default calculateKarmicAnalysis;
