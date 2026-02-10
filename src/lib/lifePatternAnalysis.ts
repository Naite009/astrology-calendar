/**
 * Life Pattern Analysis Engine
 * 7 modules: Dominant Planet, Psychic Abilities, Children/Creativity,
 * Career Sweet Spot, Lucky Days, Self-Sabotage, Guardian Angel
 */
import { NatalChart } from '@/hooks/useNatalChart';
import { getNatalPlanetHouse, signDegreesToLongitude } from '@/lib/houseCalculations';
import { PLANET_DIGNITIES } from '@/lib/planetDignities';

// ──────────────────────────────────────────
// Shared helpers
// ──────────────────────────────────────────

const ZODIAC_SIGNS = [
  'Aries','Taurus','Gemini','Cancer','Leo','Virgo',
  'Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'
];

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune'
};

const TRADITIONAL_RULERS: Record<string, string> = {
  ...SIGN_RULERS,
  Scorpio: 'Mars', Aquarius: 'Saturn', Pisces: 'Jupiter'
};

const WATER_SIGNS = ['Cancer', 'Scorpio', 'Pisces'];
const EARTH_SIGNS = ['Taurus', 'Virgo', 'Capricorn'];
const FIRE_SIGNS = ['Aries', 'Leo', 'Sagittarius'];
const AIR_SIGNS = ['Gemini', 'Libra', 'Aquarius'];

const ALL_PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

interface PlanetPos {
  name: string;
  sign: string;
  degree: number; // absolute 0-360
  house: number | null;
  isRetrograde: boolean;
}

function extractPlanetData(chart: NatalChart): PlanetPos[] {
  const data: PlanetPos[] = [];
  for (const name of ALL_PLANETS) {
    const pos = chart.planets?.[name as keyof typeof chart.planets];
    if (!pos?.sign) continue;
    const deg = (typeof pos.degree === 'number' ? pos.degree : Number(pos.degree)) || 0;
    const min = (typeof pos.minutes === 'number' ? pos.minutes : Number(pos.minutes)) || 0;
    const sec = (typeof pos.seconds === 'number' ? pos.seconds : Number(pos.seconds)) || 0;
    const absDeg = signDegreesToLongitude(pos.sign, deg + min/60 + sec/3600);
    const house = getNatalPlanetHouse(name, chart);
    data.push({ name, sign: pos.sign, degree: absDeg, house, isRetrograde: !!pos.isRetrograde });
  }
  return data;
}

function getAscendantSign(chart: NatalChart): string | null {
  const asc = chart.houseCusps?.house1;
  if (asc?.sign) return asc.sign;
  return chart.planets?.Ascendant?.sign || null;
}

function getMCSign(chart: NatalChart): string | null {
  const mc = chart.houseCusps?.house10;
  if (mc?.sign) return mc.sign;
  return (chart.planets as Record<string, any>)?.Midheaven?.sign || null;
}

function getHouseCuspSign(chart: NatalChart, house: number): string | null {
  const cusp = chart.houseCusps?.[`house${house}` as keyof typeof chart.houseCusps];
  return cusp?.sign || null;
}

function calcAspect(deg1: number, deg2: number): { type: string; orb: number } | null {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  const aspects = [
    { type: 'Conjunction', target: 0, orb: 8 },
    { type: 'Sextile', target: 60, orb: 6 },
    { type: 'Square', target: 90, orb: 8 },
    { type: 'Trine', target: 120, orb: 8 },
    { type: 'Opposition', target: 180, orb: 8 },
  ];
  for (const a of aspects) {
    const orbDiff = Math.abs(diff - a.target);
    if (orbDiff <= a.orb) return { type: a.type, orb: orbDiff };
  }
  return null;
}

function isHardAspect(type: string): boolean {
  return type === 'Square' || type === 'Opposition' || type === 'Conjunction';
}

function getPlanetByName(planets: PlanetPos[], name: string): PlanetPos | undefined {
  return planets.find(p => p.name === name);
}

function countPlanetsInHouse(planets: PlanetPos[], house: number): number {
  return planets.filter(p => p.house === house).length;
}

function countPlanetsInSign(planets: PlanetPos[], sign: string): number {
  return planets.filter(p => p.sign === sign).length;
}

function countPlanetsInSigns(planets: PlanetPos[], signs: string[]): number {
  return planets.filter(p => signs.includes(p.sign)).length;
}

// ──────────────────────────────────────────
// 1. DOMINANT PLANET CALCULATOR
// ──────────────────────────────────────────

export interface DominantPlanetResult {
  planet: string;
  score: number;
  reasons: string[];
}

export function calculateDominantPlanets(chart: NatalChart): DominantPlanetResult[] {
  const planets = extractPlanetData(chart);
  const ascSign = getAscendantSign(chart);
  const scores = new Map<string, { score: number; reasons: string[] }>();

  for (const p of ALL_PLANETS) {
    scores.set(p, { score: 0, reasons: [] });
  }

  const addScore = (planet: string, pts: number, reason: string) => {
    const entry = scores.get(planet);
    if (entry) { entry.score += pts; entry.reasons.push(reason); }
  };

  // Chart ruler: planet ruling the Ascendant sign (+10)
  if (ascSign) {
    const ruler = SIGN_RULERS[ascSign];
    if (ruler) addScore(ruler, 10, `Rules your Ascendant (${ascSign})`);
  }

  // Sun sign ruler (+7)
  const sun = getPlanetByName(planets, 'Sun');
  if (sun) {
    const ruler = SIGN_RULERS[sun.sign];
    if (ruler && ruler !== 'Sun') addScore(ruler, 7, `Rules your Sun sign (${sun.sign})`);
  }

  // Moon sign ruler (+7)
  const moon = getPlanetByName(planets, 'Moon');
  if (moon) {
    const ruler = SIGN_RULERS[moon.sign];
    if (ruler && ruler !== 'Moon') addScore(ruler, 7, `Rules your Moon sign (${moon.sign})`);
  }

  for (const p of planets) {
    // Dignified: planet in home sign (+5)
    const dignity = PLANET_DIGNITIES[p.name];
    if (dignity) {
      const rulers = Array.isArray(dignity.rulership) ? dignity.rulership : [dignity.rulership];
      if (rulers.includes(p.sign)) addScore(p.name, 5, `Dignified in home sign (${p.sign})`);
    }

    // Angular houses
    if (p.house === 1) addScore(p.name, 6, 'Placed in 1st house (identity)');
    else if (p.house === 10) addScore(p.name, 4, 'Placed in 10th house (public life)');
    else if (p.house === 4 || p.house === 7) addScore(p.name, 3, `Placed in angular ${p.house}th house`);

    // Count aspects to this planet
    let aspectCount = 0;
    for (const other of planets) {
      if (other.name === p.name) continue;
      if (calcAspect(p.degree, other.degree)) aspectCount++;
    }
    if (aspectCount >= 5) addScore(p.name, 2 * (aspectCount - 4), `Makes ${aspectCount} major aspects (highly connected)`);

    // Conjunct Sun, Moon, or Ascendant
    if (p.name !== 'Sun' && sun) {
      const asp = calcAspect(p.degree, sun.degree);
      if (asp?.type === 'Conjunction') addScore(p.name, 4, 'Conjunct your Sun');
    }
    if (p.name !== 'Moon' && moon) {
      const asp = calcAspect(p.degree, moon.degree);
      if (asp?.type === 'Conjunction') addScore(p.name, 4, 'Conjunct your Moon');
    }
  }

  return Array.from(scores.entries())
    .map(([planet, data]) => ({ planet, ...data }))
    .filter(d => d.score > 0)
    .sort((a, b) => b.score - a.score);
}

function getDominantPlanetMeaning(planet: string): string {
  const meanings: Record<string, string> = {
    Sun: "Your life force radiates outward. You're meant to be seen, to lead, to express your authentic self without apology. Your vitality, confidence, and creative fire are the engine of your entire chart.",
    Moon: "Your emotional world runs the show. You process everything through feeling first, and your intuition is your most reliable compass. Nurturing, memory, and emotional intelligence are your superpowers.",
    Mercury: "Your mind never stops. You process the world through analysis, communication, and connection. Words are your currency — whether written, spoken, or thought. You're the eternal student and teacher.",
    Venus: "Beauty, harmony, and connection are your lifeblood. You have a natural gift for making things — and people — feel good. Your values and aesthetic sense shape every decision you make.",
    Mars: "You run on drive, ambition, and raw energy. You're built to take action, compete, and pioneer. Your courage and directness are gifts, even when they feel like too much for the room.",
    Jupiter: "You're wired for expansion, meaning, and growth. Optimism carries you through what would break others. You're the one who sees the bigger picture when everyone else is stuck in the weeds.",
    Saturn: "Discipline, structure, and long-term thinking define you. You earn everything the hard way — and keep it. Your authority comes from lived experience, not inherited privilege.",
    Uranus: "You're the pattern-breaker. Convention doesn't hold you because you see systems that others don't. Your genius is in disruption, innovation, and the willingness to be different.",
    Neptune: "You live between worlds. Your sensitivity, imagination, and spiritual depth are extraordinary — but you need to learn what's yours and what belongs to everyone else. Creativity and compassion are your channels.",
    Pluto: "Transformation is your birthright. You don't do surface-level anything. Your power lies in regeneration — the ability to walk through destruction and emerge stronger, taking others with you."
  };
  return meanings[planet] || '';
}

// ──────────────────────────────────────────
// 2. PSYCHIC ABILITY INDICATORS (enhanced)
// ──────────────────────────────────────────

export interface PsychicIndicatorResult {
  level: 'High' | 'Moderate' | 'Emerging';
  score: number;
  indicators: { name: string; description: string; modality?: string }[];
  primaryModality: string;
  developmentPath: string;
}

export function analyzePsychicAbilities(chart: NatalChart): PsychicIndicatorResult {
  const planets = extractPlanetData(chart);
  const indicators: { name: string; description: string; modality?: string }[] = [];

  const neptune = getPlanetByName(planets, 'Neptune');
  const moon = getPlanetByName(planets, 'Moon');
  const mercury = getPlanetByName(planets, 'Mercury');
  const pluto = getPlanetByName(planets, 'Pluto');

  // Neptune house placements
  if (neptune && [1,8,9,12].includes(neptune.house || 0)) {
    indicators.push({ name: `Neptune in ${neptune.house}th house`, description: `Your Neptune sits in one of the most psychically sensitive houses. The ${neptune.house}th house amplifies your ability to perceive beyond the physical.`, modality: 'Clairvoyance' });
  }

  // Moon in 8th or 12th
  if (moon && [8,12].includes(moon.house || 0)) {
    indicators.push({ name: `Moon in ${moon.house}th house`, description: `Your emotional body is tuned to the invisible. You absorb information from environments, dreams, and the emotional states of others without trying.`, modality: 'Clairsentience' });
  }

  // Moon in water signs
  if (moon && WATER_SIGNS.includes(moon.sign)) {
    indicators.push({ name: `Moon in ${moon.sign}`, description: `Your emotional antenna is naturally calibrated to pick up what others miss. You feel the room before you think about it.`, modality: 'Clairsentience' });
  }

  // Sun or Moon conjunct Neptune
  const sunPos = getPlanetByName(planets, 'Sun');
  if (neptune && sunPos) {
    const asp = calcAspect(neptune.degree, sunPos.degree);
    if (asp?.type === 'Conjunction') {
      indicators.push({ name: 'Sun conjunct Neptune', description: 'Your identity is fused with the transcendent. You may struggle with boundaries precisely because your consciousness naturally extends beyond your body.', modality: 'Clairvoyance' });
    }
  }
  if (neptune && moon) {
    const asp = calcAspect(neptune.degree, moon.degree);
    if (asp) {
      const label = asp.type === 'Conjunction' ? 'conjunct' : asp.type === 'Trine' ? 'trine' : asp.type === 'Sextile' ? 'sextile' : asp.type;
      indicators.push({ name: `Moon ${label} Neptune`, description: `Your feelings and your imagination are directly wired together. Dreams, hunches, and "knowings" that prove accurate are your norm, not your exception.`, modality: asp.type === 'Trine' || asp.type === 'Sextile' ? 'Clairsentience' : 'Prophetic dreams' });
    }
  }

  // Mercury-Neptune aspects
  if (mercury && neptune) {
    const asp = calcAspect(mercury.degree, neptune.degree);
    if (asp) {
      indicators.push({ name: `Mercury ${asp.type.toLowerCase()} Neptune`, description: 'Your mind receives information from non-linear channels. You may hear guidance, download ideas whole, or know things you were never taught.', modality: 'Clairaudience' });
    }
  }

  // Mercury in Pisces
  if (mercury?.sign === 'Pisces') {
    indicators.push({ name: 'Mercury in Pisces', description: 'Your thinking process is non-linear and receptive. Information comes to you in images, feelings, and symbolic impressions rather than logical steps.', modality: 'Clairaudience' });
  }

  // Strong 12th house (3+ planets)
  const twelfthCount = countPlanetsInHouse(planets, 12);
  if (twelfthCount >= 3) {
    indicators.push({ name: `${twelfthCount} planets in 12th house`, description: 'A crowded 12th house means a significant portion of your psyche operates below conscious awareness. You have access to collective and ancestral information that most people never touch.', modality: 'Prophetic dreams' });
  }

  // Strong 8th house
  const eighthCount = countPlanetsInHouse(planets, 8);
  if (eighthCount >= 2) {
    indicators.push({ name: `${eighthCount} planets in 8th house`, description: 'The 8th house governs the invisible exchange of energy between people. You naturally perceive hidden motivations, unspoken dynamics, and what people carry beneath their surface.', modality: 'Mediumship' });
  }

  // Moon conjunct Pluto
  if (moon && pluto) {
    const asp = calcAspect(moon.degree, pluto.degree);
    if (asp?.type === 'Conjunction') {
      indicators.push({ name: 'Moon conjunct Pluto', description: 'You feel everything at maximum depth. This gives you x-ray emotional perception — you see through pretense instinctively. The challenge is not absorbing others\' darkness.', modality: 'Mediumship' });
    }
  }

  // Water/Scorpio/Pisces/Cancer stellium
  const waterCount = countPlanetsInSigns(planets, WATER_SIGNS);
  if (waterCount >= 3) {
    indicators.push({ name: `${waterCount}-planet water stellium`, description: 'Your chart is saturated with emotional and psychic sensitivity. You live in the feeling realm and have natural access to information that bypasses rational thought.' });
  }

  // North Node in 8th or 12th
  const nn = chart.planets?.NorthNode;
  if (nn?.sign) {
    const nnHouse = getNatalPlanetHouse('NorthNode', chart);
    if (nnHouse && [8,12].includes(nnHouse)) {
      indicators.push({ name: `North Node in ${nnHouse}th house`, description: `Your soul's growth direction points toward developing your psychic and intuitive gifts. This isn't optional — it's your evolutionary trajectory.` });
    }
  }

  // Uranus-Mercury aspects (claircognizance)
  const uranus = getPlanetByName(planets, 'Uranus');
  if (mercury && uranus) {
    const asp = calcAspect(mercury.degree, uranus.degree);
    if (asp) {
      indicators.push({ name: `Mercury ${asp.type.toLowerCase()} Uranus`, description: 'You receive sudden flashes of insight — complete ideas that arrive fully formed. This is claircognizance: knowing without knowing how you know.', modality: 'Claircognizance' });
    }
  }

  const score = indicators.length;
  const level = score >= 3 ? 'High' : score >= 1 ? 'Moderate' : 'Emerging';

  // Determine primary modality
  const modalityCounts = new Map<string, number>();
  indicators.forEach(i => { if (i.modality) modalityCounts.set(i.modality, (modalityCounts.get(i.modality) || 0) + 1); });
  const primaryModality = [...modalityCounts.entries()].sort((a,b) => b[1]-a[1])[0]?.[0] || 'General intuition';

  const devPaths: Record<string, string> = {
    'Clairvoyance': 'Practice visualization exercises and pay attention to images that appear during meditation. Your "third eye" is already active — you just need to trust what you see.',
    'Clairsentience': 'Your body is your instrument. Practice distinguishing your emotions from others\'. Before entering any space, ask: "What am I feeling right now?" Then notice what shifts.',
    'Claircognizance': 'Keep a journal of your sudden "downloads" and track their accuracy. Your gift works best when you don\'t try to rationalize it. Trust the knowing.',
    'Clairaudience': 'Pay attention to the voice in your mind that sounds different from your inner critic. Meditative practices, especially with sound, will strengthen this channel.',
    'Mediumship': 'Work with an experienced mentor before opening this channel further. Your boundaries are essential — learn to say "not now" to unseen presences.',
    'Prophetic dreams': 'Keep a dream journal beside your bed and write immediately upon waking. Your unconscious mind is a direct line to information your waking mind can\'t access.',
    'General intuition': 'Practice stillness. Your gifts emerge when you stop trying to figure things out and simply allow impressions to arrive.'
  };

  return {
    level,
    score,
    indicators,
    primaryModality,
    developmentPath: devPaths[primaryModality] || devPaths['General intuition']
  };
}

// ──────────────────────────────────────────
// 3. CHILDREN & CREATIVITY INDICATORS
// ──────────────────────────────────────────

export interface ChildrenResult {
  fifthHouseSign: string | null;
  fifthHousePlanets: string[];
  fifthHouseRuler: { planet: string; sign: string | null; house: number | null } | null;
  fertilityLevel: string;
  fertilityDescription: string;
  parentingStyle: string;
  creativeExpression: string;
}

export function analyzeChildren(chart: NatalChart): ChildrenResult {
  const planets = extractPlanetData(chart);
  const fifthSign = getHouseCuspSign(chart, 5);
  const fifthPlanets = planets.filter(p => p.house === 5);
  
  let fifthRuler: ChildrenResult['fifthHouseRuler'] = null;
  if (fifthSign) {
    const rulerName = SIGN_RULERS[fifthSign];
    if (rulerName) {
      const rulerPos = getPlanetByName(planets, rulerName);
      fifthRuler = { planet: rulerName, sign: rulerPos?.sign || null, house: rulerPos?.house || null };
    }
  }

  // Fertility level
  let fertilityLevel = 'Moderate';
  let fertilityDesc = 'Standard creative and fertility potential.';
  const beneficsIn5th = fifthPlanets.filter(p => ['Moon','Venus','Jupiter'].includes(p.name));
  const challengersIn5th = fifthPlanets.filter(p => ['Saturn','Uranus','Pluto'].includes(p.name));

  if (beneficsIn5th.length > 0 || (fifthSign && ['Cancer','Taurus','Pisces'].includes(fifthSign))) {
    fertilityLevel = 'High';
    const reasons = [];
    if (beneficsIn5th.length > 0) reasons.push(`${beneficsIn5th.map(p => p.name).join(' and ')} in your 5th house bring natural ease`);
    if (fifthSign && ['Cancer','Taurus','Pisces'].includes(fifthSign)) reasons.push(`${fifthSign} on the 5th cusp favors nurturing and fertility`);
    fertilityDesc = `Strong creative and fertility indicators. ${reasons.join('. ')}.`;
  } else if (challengersIn5th.length > 0 || (fifthSign && AIR_SIGNS.includes(fifthSign))) {
    fertilityLevel = 'Complex';
    fertilityDesc = challengersIn5th.length > 0 
      ? `${challengersIn5th.map(p => p.name).join(' and ')} in the 5th suggest a more deliberate, intentional relationship with children and creativity. This doesn't mean difficulty — it means depth.`
      : `Air sign on the 5th cusp suggests an intellectual, communicative approach to creativity and children.`;
  }

  // Parenting style
  const parentingParts: string[] = [];
  for (const p of fifthPlanets) {
    const styles: Record<string, string> = {
      Sun: 'You parent with pride and creative encouragement — your children bring you vitality',
      Moon: 'Deep emotional bonding defines your parenting. You create safety through presence',
      Mercury: 'Your connection with children is intellectual and communicative — you teach through conversation',
      Venus: 'You create beauty and harmony for your children. The relationship is joyful and affectionate',
      Mars: 'Active, energetic parenting. Sports, competition, and physical play are your bonding language',
      Jupiter: 'Generous, expansive parenting with emphasis on education, travel, and philosophical exploration',
      Saturn: 'You take parenting seriously — perhaps too seriously. Structure and responsibility define your approach, but so does lasting commitment',
      Uranus: 'Unconventional parenting. You encourage independence, individuality, and thinking outside the box',
      Neptune: 'Deeply spiritual and imaginative connection with children. Creative play and fantasy are central',
      Pluto: 'Intensely transformative parent-child bond. Your children catalyze your deepest growth'
    };
    if (styles[p.name]) parentingParts.push(styles[p.name]);
  }
  if (parentingParts.length === 0 && fifthSign) {
    const signStyles: Record<string, string> = {
      Aries: 'Independent, pioneering parenting — you encourage courage and self-reliance',
      Taurus: 'Stable, sensory-rich parenting — security, nature, and comfort are your gifts',
      Gemini: 'Communicative, adaptable parenting — books, conversation, and variety keep things alive',
      Cancer: 'Deeply nurturing — you create an emotional haven for your children',
      Leo: 'Warm, playful, proud parenting — your children are extensions of your creative expression',
      Virgo: 'Attentive, detail-oriented parenting — health, routine, and practical skills matter',
      Libra: 'Harmony-seeking parenting — you model fairness, beauty, and relationship skills',
      Scorpio: 'Intense, protective parenting — you see your children\'s depths and honor their complexity',
      Sagittarius: 'Adventurous, philosophical parenting — travel, big questions, and freedom to explore',
      Capricorn: 'Structured, ambitious parenting — you build a solid foundation for your children\'s future',
      Aquarius: 'Progressive, unique parenting — you encourage individuality and independent thinking',
      Pisces: 'Imaginative, compassionate parenting — creativity, spirituality, and emotional attunement'
    };
    parentingParts.push(signStyles[fifthSign] || 'Your parenting style is shaped by the broader chart dynamics.');
  }

  // Creative expression
  let creative = 'Your 5th house shows how you play, create, and express joy.';
  if (fifthSign) {
    const creativeStyles: Record<string, string> = {
      Aries: 'You create with urgency and fire — competitive arts, physical performance, starting things',
      Taurus: 'Sensory creativity — cooking, gardening, music, anything you can touch and build slowly',
      Gemini: 'Writing, speaking, multimedia — your creativity needs variety and intellectual stimulation',
      Cancer: 'Emotionally rich creation — memoir, cooking, home arts, anything rooted in feeling',
      Leo: 'Performing, leading creative projects, drama, anything where your personality shines',
      Virgo: 'Craftsmanship — detail-oriented work, editing, health arts, perfecting a skill',
      Libra: 'Design, collaboration, aesthetic curation — beauty is your creative language',
      Scorpio: 'Intense, transformative art — psychology-driven writing, dark aesthetics, depth work',
      Sagittarius: 'Teaching, publishing, travel content, philosophical exploration through creative form',
      Capricorn: 'Building lasting creative structures — business as art, legacy projects',
      Aquarius: 'Innovation, technology-driven creation, social commentary, avant-garde expression',
      Pisces: 'Channeled creativity — music, poetry, film, anything that dissolves boundaries'
    };
    creative = creativeStyles[fifthSign] || creative;
  }

  return {
    fifthHouseSign: fifthSign,
    fifthHousePlanets: fifthPlanets.map(p => p.name),
    fifthHouseRuler: fifthRuler,
    fertilityLevel,
    fertilityDescription: fertilityDesc,
    parentingStyle: parentingParts.join('. ') + '.',
    creativeExpression: creative
  };
}

// ──────────────────────────────────────────
// 4. CAREER SWEET SPOT
// ──────────────────────────────────────────

export interface CareerResult {
  topPaths: { field: string; reason: string }[];
  idealEnvironment: string;
  incomeStyle: string;
  mcSign: string | null;
  sixthHouseSign: string | null;
  secondHouseSign: string | null;
}

export function analyzeCareer(chart: NatalChart): CareerResult {
  const planets = extractPlanetData(chart);
  const mcSign = getMCSign(chart);
  const sixthSign = getHouseCuspSign(chart, 6);
  const secondSign = getHouseCuspSign(chart, 2);
  const tenthPlanets = planets.filter(p => p.house === 10);
  const sixthPlanets = planets.filter(p => p.house === 6);

  // Score career archetypes
  const archetypeScores = new Map<string, { score: number; reasons: string[] }>();
  const addCareer = (key: string, pts: number, reason: string) => {
    if (!archetypeScores.has(key)) archetypeScores.set(key, { score: 0, reasons: [] });
    const entry = archetypeScores.get(key)!;
    entry.score += pts;
    entry.reasons.push(reason);
  };

  const careerMap: Record<string, { planets: string[]; signs: string[]; houses: number[] }> = {
    'Healing, counseling, spirituality, photography, film, music': { planets: ['Neptune'], signs: ['Pisces'], houses: [12] },
    'Writing, teaching, analysis, communication, health services': { planets: ['Mercury'], signs: ['Gemini','Virgo'], houses: [3,6] },
    'Arts, design, beauty, counseling, luxury goods, finance': { planets: ['Venus'], signs: ['Libra','Taurus'], houses: [2,7] },
    'Athletics, entrepreneurship, leadership, pioneering': { planets: ['Mars'], signs: ['Aries'], houses: [1] },
    'Education, publishing, law, travel, philosophy': { planets: ['Jupiter'], signs: ['Sagittarius'], houses: [9] },
    'Management, government, architecture, real estate, tradition': { planets: ['Saturn'], signs: ['Capricorn'], houses: [10] },
    'Technology, innovation, social causes, astrology, reform': { planets: ['Uranus'], signs: ['Aquarius'], houses: [11] },
    'Psychology, research, transformation, investigation': { planets: ['Pluto'], signs: ['Scorpio'], houses: [8] },
    'Caregiving, real estate, food, family business': { planets: ['Moon'], signs: ['Cancer'], houses: [4] },
    'Performance, entertainment, leadership, creativity': { planets: ['Sun'], signs: ['Leo'], houses: [5] },
  };

  for (const [field, config] of Object.entries(careerMap)) {
    // MC sign match
    if (mcSign && config.signs.includes(mcSign)) addCareer(field, 5, `${mcSign} Midheaven`);
    // Planets in 10th matching
    for (const tp of tenthPlanets) {
      if (config.planets.includes(tp.name)) addCareer(field, 4, `${tp.name} in 10th house`);
    }
    // Planet sign placements
    for (const p of planets) {
      if (config.planets.includes(p.name) && config.signs.includes(p.sign)) addCareer(field, 2, `${p.name} in ${p.sign}`);
      if (config.houses.includes(p.house || 0) && config.planets.includes(p.name)) addCareer(field, 3, `${p.name} in ${p.house}th house`);
    }
    // Strong houses
    for (const h of config.houses) {
      const count = countPlanetsInHouse(planets, h);
      if (count >= 2) addCareer(field, count * 2, `${count} planets in ${h}th house`);
    }
  }

  const sorted = [...archetypeScores.entries()]
    .map(([field, data]) => ({ field, ...data }))
    .sort((a, b) => b.score - a.score);

  const topPaths = sorted.slice(0, 3).map(s => ({ field: s.field, reason: s.reasons.join('; ') }));
  if (topPaths.length === 0) {
    topPaths.push({ field: 'Multiple options — your chart is versatile', reason: 'No single archetype dominates, giving you flexibility' });
  }

  // Ideal work environment from 6th house
  let idealEnv = 'Your daily work needs variety and meaning.';
  if (sixthSign) {
    const envStyles: Record<string, string> = {
      Aries: 'Fast-paced, autonomous. You need freedom to lead and make quick decisions. Avoid micromanagement.',
      Taurus: 'Stable, comfortable, well-compensated. You thrive with consistency and tangible results.',
      Gemini: 'Varied, social, mentally stimulating. No two days should look the same.',
      Cancer: 'Nurturing, emotionally safe, small team. A workplace that feels like family.',
      Leo: 'Creative, recognized, expressive. You need to be valued and have room to shine.',
      Virgo: 'Organized, detail-oriented, purposeful. You thrive when improving systems.',
      Libra: 'Beautiful, collaborative, balanced. Aesthetics and teamwork matter to you.',
      Scorpio: 'Private, intense, meaningful. Surface-level work drains you — depth sustains you.',
      Sagittarius: 'Freedom-oriented, educational, international. You need room to grow and explore.',
      Capricorn: 'Structured, ambitious, hierarchical. You respect competence and clear advancement paths.',
      Aquarius: 'Innovative, progressive, cause-driven. You need to believe in the mission.',
      Pisces: 'Flexible, creative, service-oriented. Rigid schedules and harsh environments exhaust you.'
    };
    idealEnv = envStyles[sixthSign] || idealEnv;
  }

  // Income style from 2nd house
  let incomeStyle = 'Your earning potential is shaped by your values and self-worth.';
  if (secondSign) {
    const incomeStyles: Record<string, string> = {
      Aries: 'You earn best through initiative, competition, and being first. Self-employment suits you.',
      Taurus: 'Steady accumulation. You build wealth slowly but surely through tangible assets.',
      Gemini: 'Multiple income streams, communication-based earning, versatility pays.',
      Cancer: 'Earning through care, nurturing, real estate, or family enterprises.',
      Leo: 'Generous earning and spending. Leadership roles and creativity drive income.',
      Virgo: 'Earning through service, skill mastery, and practical problem-solving.',
      Libra: 'Partnerships boost income. Beauty, design, and mediation are lucrative.',
      Scorpio: 'Other people\'s money, investments, research. You earn through depth and transformation.',
      Sagittarius: 'Teaching, publishing, international work. Your enthusiasm attracts abundance.',
      Capricorn: 'Disciplined saving, corporate advancement, long-term investments.',
      Aquarius: 'Unconventional income sources, technology, humanitarian work that also pays.',
      Pisces: 'Intuitive earning. Creative work, healing arts, spiritual services.'
    };
    incomeStyle = incomeStyles[secondSign] || incomeStyle;
  }

  return { topPaths, idealEnvironment: idealEnv, incomeStyle, mcSign, sixthHouseSign: sixthSign, secondHouseSign: secondSign };
}

// ──────────────────────────────────────────
// 5. LUCKIEST DAY OF WEEK
// ──────────────────────────────────────────

export interface LuckyDayResult {
  primaryDay: string;
  primaryPlanet: string;
  primaryReason: string;
  secondaryDays: { day: string; planet: string; reason: string }[];
}

const DAY_RULERS: Record<string, string> = {
  Sun: 'Sunday', Moon: 'Monday', Mars: 'Tuesday', Mercury: 'Wednesday',
  Jupiter: 'Thursday', Venus: 'Friday', Saturn: 'Saturday'
};

const PLANET_TO_DAY = Object.fromEntries(Object.entries(DAY_RULERS).map(([p,d]) => [p,d]));

export function analyzeLuckyDays(chart: NatalChart): LuckyDayResult {
  const planets = extractPlanetData(chart);
  const ascSign = getAscendantSign(chart);
  const dominant = calculateDominantPlanets(chart);

  const candidates: { planet: string; day: string; score: number; reason: string }[] = [];

  // Jupiter placement = primary luck
  const jupiter = getPlanetByName(planets, 'Jupiter');
  if (jupiter) {
    const jupiterSignRuler = SIGN_RULERS[jupiter.sign];
    if (jupiterSignRuler && PLANET_TO_DAY[jupiterSignRuler]) {
      candidates.push({ planet: jupiterSignRuler, day: PLANET_TO_DAY[jupiterSignRuler], score: 10, reason: `Jupiter (your luck planet) is in ${jupiter.sign}, ruled by ${jupiterSignRuler}` });
    }
    if (PLANET_TO_DAY['Jupiter']) {
      candidates.push({ planet: 'Jupiter', day: 'Thursday', score: 8, reason: 'Thursday is Jupiter\'s own day — universally favorable for expansion and opportunity' });
    }
  }

  // Chart ruler
  if (ascSign) {
    const chartRuler = SIGN_RULERS[ascSign];
    if (chartRuler && PLANET_TO_DAY[chartRuler]) {
      candidates.push({ planet: chartRuler, day: PLANET_TO_DAY[chartRuler], score: 7, reason: `${chartRuler} rules your Ascendant (${ascSign}) — this is your personal power day` });
    }
  }

  // Dominant planet
  if (dominant.length > 0 && PLANET_TO_DAY[dominant[0].planet]) {
    candidates.push({ planet: dominant[0].planet, day: PLANET_TO_DAY[dominant[0].planet], score: 6, reason: `${dominant[0].planet} is your dominant planet — its day amplifies your natural strengths` });
  }

  // Most elevated planet (closest to MC / house 10)
  const inTenth = planets.filter(p => p.house === 10);
  if (inTenth.length > 0 && PLANET_TO_DAY[inTenth[0].name]) {
    candidates.push({ planet: inTenth[0].name, day: PLANET_TO_DAY[inTenth[0].name], score: 5, reason: `${inTenth[0].name} is elevated in your 10th house — its day brings public recognition` });
  }

  candidates.sort((a, b) => b.score - a.score);

  const primary = candidates[0] || { planet: 'Jupiter', day: 'Thursday', score: 0, reason: 'Thursday (Jupiter\'s day) is universally favorable' };
  const seen = new Set([primary.day]);
  const secondary = candidates.filter(c => { if (seen.has(c.day)) return false; seen.add(c.day); return true; }).slice(0, 2);

  return {
    primaryDay: primary.day,
    primaryPlanet: primary.planet,
    primaryReason: primary.reason,
    secondaryDays: secondary.map(s => ({ day: s.day, planet: s.planet, reason: s.reason }))
  };
}

// ──────────────────────────────────────────
// 6. SELF-SABOTAGE PATTERNS
// ──────────────────────────────────────────

export interface SabotagePattern {
  name: string;
  pattern: string;
  trigger: string;
  healingPath: string;
  severity: 'primary' | 'secondary';
}

export function analyzeSelfSabotage(chart: NatalChart): SabotagePattern[] {
  const planets = extractPlanetData(chart);
  const patterns: SabotagePattern[] = [];

  const sun = getPlanetByName(planets, 'Sun');
  const moon = getPlanetByName(planets, 'Moon');
  const mercury = getPlanetByName(planets, 'Mercury');
  const venus = getPlanetByName(planets, 'Venus');
  const mars = getPlanetByName(planets, 'Mars');
  const saturn = getPlanetByName(planets, 'Saturn');
  const neptune = getPlanetByName(planets, 'Neptune');
  const pluto = getPlanetByName(planets, 'Pluto');

  // Saturn-Sun hard aspects
  if (sun && saturn) {
    const asp = calcAspect(sun.degree, saturn.degree);
    if (asp && isHardAspect(asp.type)) {
      patterns.push({
        name: `Sun ${asp.type.toLowerCase()} Saturn`,
        pattern: 'Authority issues, fear of success, imposter syndrome. You unconsciously hold yourself back from the spotlight because part of you believes you haven\'t earned it yet.',
        trigger: '"I\'m not good enough" / "Who am I to want this?"',
        healingPath: 'Recognize that your standards are impossibly high. Saturn here asks you to build authority slowly — not avoid it entirely. Every small step of visibility counts.',
        severity: 'primary'
      });
    }
  }

  // Neptune-Mercury hard aspects
  if (mercury && neptune) {
    const asp = calcAspect(mercury.degree, neptune.degree);
    if (asp && isHardAspect(asp.type)) {
      patterns.push({
        name: `Mercury ${asp.type.toLowerCase()} Neptune`,
        pattern: 'Mental fog, escapism, avoiding difficult conversations. When reality gets uncomfortable, your mind drifts to fantasy or numbing behaviors.',
        trigger: '"I need to escape" / avoiding direct communication',
        healingPath: 'Build routines that ground your thinking. Journaling, structured planning, and honest communication practices counterbalance the fog. Your imagination is a gift — not an escape hatch.',
        severity: 'primary'
      });
    }
  }

  // Pluto-Venus aspects
  if (venus && pluto) {
    const asp = calcAspect(venus.degree, pluto.degree);
    if (asp) {
      patterns.push({
        name: `Venus ${asp.type.toLowerCase()} Pluto`,
        pattern: 'Intensity addiction in relationships. You may sabotage good, stable connections because they don\'t feel "deep enough." You confuse drama with depth.',
        trigger: 'Seeking intensity, testing partners, power dynamics in love',
        healingPath: 'Recognize that real intimacy doesn\'t require crisis. Practice staying present in calm moments. Depth can exist without destruction.',
        severity: 'primary'
      });
    }
  }

  // Saturn in 1st house
  if (saturn?.house === 1) {
    patterns.push({
      name: 'Saturn in 1st house',
      pattern: 'Self-restriction and delayed self-expression. You feel like you need permission to take up space, show up, or be seen.',
      trigger: '"I should wait until I\'m more ready/qualified/prepared"',
      healingPath: 'You will never feel "ready enough." Saturn in the 1st matures beautifully with age — your authority and presence deepen over time. Start now, imperfectly.',
      severity: 'primary'
    });
  }

  // 12th house Sun
  if (sun?.house === 12) {
    patterns.push({
      name: 'Sun in 12th house',
      pattern: 'Hiding your light. You may unconsciously make yourself invisible, play a supporting role, or feel like your true self is meant to stay private.',
      trigger: '"I\'m not meant to be seen" / disappearing in groups',
      healingPath: 'Your Sun in the 12th doesn\'t mean you can\'t shine — it means your light works differently. You radiate through service, spirituality, and behind-the-scenes impact. Own that as power, not limitation.',
      severity: 'primary'
    });
  }

  // Mars-Saturn hard aspects
  if (mars && saturn) {
    const asp = calcAspect(mars.degree, saturn.degree);
    if (asp && isHardAspect(asp.type)) {
      patterns.push({
        name: `Mars ${asp.type.toLowerCase()} Saturn`,
        pattern: 'Blocked action and anger turned inward. You stop yourself before starting, often rationalizing inaction as "being responsible."',
        trigger: '"What\'s the point anyway?" / chronic procrastination',
        healingPath: 'Your energy works best in structured bursts, not spontaneous combustion. Create containers for action (timed sprints, clear goals). Movement — physical movement — unlocks the block.',
        severity: 'secondary'
      });
    }
  }

  // Moon-Saturn hard aspects
  if (moon && saturn) {
    const asp = calcAspect(moon.degree, saturn.degree);
    if (asp && isHardAspect(asp.type)) {
      patterns.push({
        name: `Moon ${asp.type.toLowerCase()} Saturn`,
        pattern: 'Emotional restriction and a harsh inner critic. You learned early that feelings are weakness, so you manage them rather than feel them.',
        trigger: '"I don\'t deserve to feel good" / emotional shutdown under stress',
        healingPath: 'Your emotions aren\'t weakness — they\'re data. Allow yourself to feel without judging the feeling. Practice self-compassion as discipline, not indulgence.',
        severity: 'secondary'
      });
    }
  }

  // Chiron in 1st, 6th, or 12th
  const chiron = chart.planets?.Chiron;
  if (chiron?.sign) {
    const chironHouse = getNatalPlanetHouse('Chiron', chart);
    if (chironHouse && [1, 6, 12].includes(chironHouse)) {
      patterns.push({
        name: `Chiron in ${chironHouse}${chironHouse === 1 ? 'st' : chironHouse === 6 ? 'th' : 'th'} house`,
        pattern: chironHouse === 1 
          ? 'Your core wound is about identity and self-worth. You may overcompensate by helping others while neglecting your own needs.'
          : chironHouse === 6
          ? 'Your wound shows up in daily routines, health, and service. You may sacrifice your body or wellbeing for others\' benefit.'
          : 'Your deepest wound operates below conscious awareness. You may carry ancestral or collective pain without realizing it\'s not yours.',
        trigger: 'Self-sacrifice disguised as generosity',
        healingPath: 'The wound is the gift. Your pain has given you insight that others need — but only if you heal yourself first. You cannot pour from an empty cup.',
        severity: 'secondary'
      });
    }
  }

  return patterns;
}

// ──────────────────────────────────────────
// 7. GUARDIAN ANGEL PLACEMENTS
// ──────────────────────────────────────────

export interface GuardianAngelResult {
  primaryProtection: { placement: string; description: string } | null;
  protectionStyle: string;
  blessingZones: { area: string; description: string }[];
  protectionIndicators: { name: string; description: string }[];
}

export function analyzeGuardianAngel(chart: NatalChart): GuardianAngelResult {
  const planets = extractPlanetData(chart);
  const indicators: { name: string; description: string; score: number }[] = [];

  const jupiter = getPlanetByName(planets, 'Jupiter');
  const venus = getPlanetByName(planets, 'Venus');
  const sun = getPlanetByName(planets, 'Sun');
  const moon = getPlanetByName(planets, 'Moon');

  // Jupiter house placements
  if (jupiter) {
    const jupHouseMeanings: Record<number, string> = {
      1: 'Protected identity. You walk through life with an invisible shield — optimism and resilience are built into your personality. Things that would break others bounce off you.',
      2: 'Protected resources. Money and material needs have a way of working out. You may not always be wealthy, but you rarely go without.',
      4: 'Family protection. Your home life, even if complicated, carries a thread of safety. You have deep emotional security to draw from.',
      9: 'Protected during travel and expansion. The universe supports your growth, education, and philosophical exploration. Foreign places feel like home.',
      10: 'Career protection. Your public life is blessed — recognition comes, often without you seeking it. Authority figures tend to support you.',
      11: 'Community protection. Friends and groups rally around you. Your social network is your safety net.',
      12: 'Hidden blessings and spiritual protection. When everything looks hopeless, something — or someone — appears to catch you. Your guardian energy works behind the scenes.'
    };
    if (jupiter.house && jupHouseMeanings[jupiter.house]) {
      indicators.push({ name: `Jupiter in ${jupiter.house}th house`, description: jupHouseMeanings[jupiter.house], score: 10 });
    }
  }

  // Jupiter trine/sextile Sun or Moon
  if (jupiter && sun) {
    const asp = calcAspect(jupiter.degree, sun.degree);
    if (asp && (asp.type === 'Trine' || asp.type === 'Sextile' || asp.type === 'Conjunction')) {
      indicators.push({ name: `Jupiter ${asp.type.toLowerCase()} Sun`, description: 'Confidence carries you through what would stop others. You have a "things work out" energy that isn\'t naive — it\'s cosmically supported. When you trust yourself, doors open.', score: 8 });
    }
    if (asp && (asp.type === 'Square' || asp.type === 'Opposition')) {
      indicators.push({ name: `Jupiter ${asp.type.toLowerCase()} Sun`, description: 'Protection through challenge. Your growth comes through overabundance or overcommitment — but even in excess, Jupiter ensures you land on your feet.', score: 4 });
    }
  }

  if (jupiter && moon) {
    const asp = calcAspect(jupiter.degree, moon.degree);
    if (asp && (asp.type === 'Trine' || asp.type === 'Sextile' || asp.type === 'Conjunction')) {
      indicators.push({ name: `Jupiter ${asp.type.toLowerCase()} Moon`, description: 'Emotional safety net. Your needs have a way of being met — sometimes at the last minute, sometimes through unexpected generosity. Your emotional resilience is extraordinary.', score: 8 });
    }
  }

  // Venus grace
  if (venus && [1, 7, 10].includes(venus.house || 0)) {
    indicators.push({ name: `Venus in ${venus.house}th house`, description: 'Likability protects you. People want to help you, hire you, love you. Doors open through charm, grace, and genuine warmth — not manipulation.', score: 7 });
  }

  if (venus?.house === 12) {
    indicators.push({ name: 'Venus in 12th house', description: 'Secret admirers and invisible help. Kindness arrives from unexpected sources. Someone is always looking out for you — even when you can\'t see them.', score: 6 });
  }

  // Venus trine Jupiter
  if (venus && jupiter) {
    const asp = calcAspect(venus.degree, jupiter.degree);
    if (asp && (asp.type === 'Trine' || asp.type === 'Sextile')) {
      indicators.push({ name: `Venus ${asp.type.toLowerCase()} Jupiter`, description: 'Double blessing. Social grace meets expansive luck. Relationships bring opportunity, beauty opens doors, and generosity comes back multiplied.', score: 9 });
    }
  }

  // Benefics in angular houses
  const angularBenefics = planets.filter(p => ['Venus','Jupiter'].includes(p.name) && [1,4,7,10].includes(p.house || 0));
  if (angularBenefics.length >= 2) {
    indicators.push({ name: 'Multiple benefics angular', description: 'Visible, obvious protection. Your blessings aren\'t hidden — they\'re on display. Support shows up in tangible, undeniable ways.', score: 7 });
  }

  // 9th house stellium
  const ninthCount = countPlanetsInHouse(planets, 9);
  if (ninthCount >= 3) {
    indicators.push({ name: `${ninthCount} planets in 9th house`, description: 'Philosophical protection. Your belief system is your shield. Meaning sustains you through anything. Higher guidance is always available when you ask.', score: 6 });
  }

  // Sort by score
  indicators.sort((a, b) => b.score - a.score);

  const primary = indicators[0] || null;

  // Protection style
  let style = 'Your protection operates through ordinary kindness and quiet resilience.';
  if (indicators.some(i => i.name.includes('12th'))) {
    style = 'Your guardian energy works behind the scenes. Last-minute rescues, unexpected kindness from strangers, and dreams that warn you — these are your signs. You\'re protected in ways you can\'t always see.';
  } else if (indicators.some(i => i.name.includes('1st') || i.name.includes('angular'))) {
    style = 'Your protection is visible and obvious. People notice how things "just work out" for you. It\'s not luck — it\'s cosmic placement working in your favor.';
  } else if (indicators.some(i => i.name.includes('Jupiter') && i.name.includes('Moon'))) {
    style = 'Your protection is emotional. When you\'re in danger of losing hope, something always appears to sustain you. Your feelings are your compass — trust them.';
  } else if (indicators.some(i => i.name.includes('9th'))) {
    style = 'Your protection comes through meaning and belief. Faith — in yourself, in something larger — is literally your shield. Philosophy sustains you when nothing else can.';
  }

  // Blessing zones
  const zones: { area: string; description: string }[] = [];
  if (jupiter?.house) {
    const houseAreas: Record<number, string> = {
      1: 'Personal resilience', 2: 'Financial security', 3: 'Communication & learning',
      4: 'Home & family', 5: 'Creativity & romance', 6: 'Health & daily work',
      7: 'Partnerships', 8: 'Shared resources & transformation', 9: 'Travel & philosophy',
      10: 'Career & reputation', 11: 'Community & friendships', 12: 'Spiritual life & solitude'
    };
    zones.push({ area: houseAreas[jupiter.house] || `${jupiter.house}th house matters`, description: `Jupiter blesses this area of your life with expansion, protection, and opportunity.` });
  }
  if (venus?.house) {
    const venusAreas: Record<number, string> = {
      1: 'Self-image & first impressions', 2: 'Earning & values', 3: 'Daily connections',
      4: 'Domestic harmony', 5: 'Creative joy', 6: 'Workplace harmony',
      7: 'Love & partnership', 8: 'Intimate connection', 9: 'Cultural appreciation',
      10: 'Public charm', 11: 'Social circles', 12: 'Hidden grace'
    };
    zones.push({ area: venusAreas[venus.house] || `${venus.house}th house beauty`, description: 'Venus brings ease, pleasure, and natural attraction to this area.' });
  }

  return {
    primaryProtection: primary ? { placement: primary.name, description: primary.description } : null,
    protectionStyle: style,
    blessingZones: zones,
    protectionIndicators: indicators.map(i => ({ name: i.name, description: i.description }))
  };
}
