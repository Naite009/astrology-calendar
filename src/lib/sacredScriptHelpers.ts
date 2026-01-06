// Sacred Script Helper Functions
// Calculations and data for professional astrology reading framework

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const ELEMENTS: Record<string, string[]> = {
  Fire: ['Aries', 'Leo', 'Sagittarius'],
  Earth: ['Taurus', 'Virgo', 'Capricorn'],
  Air: ['Gemini', 'Libra', 'Aquarius'],
  Water: ['Cancer', 'Scorpio', 'Pisces'],
};

const MODALITIES: Record<string, string[]> = {
  Cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
  Fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
  Mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
};

// Saturn cycle data
export interface SaturnCycle {
  age: number;
  year: number;
  aspectType: 'Square' | 'Opposition' | 'Return';
  description: string;
  question: string;
  isPast: boolean;
  isUpcoming: boolean; // within 3 years
}

// Calculate Saturn cycles for a birth year
export const calculateSaturnCycles = (birthDate: string, currentDate: Date): SaturnCycle[] => {
  const [birthYear] = birthDate.split('-').map(Number);
  const currentAge = Math.floor((currentDate.getTime() - new Date(birthYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  
  const cycles = [
    { age: 7, aspectType: 'Square' as const, description: 'First waxing square - Early authority experiences' },
    { age: 14, aspectType: 'Opposition' as const, description: 'First opposition - Teenage rebellion, identity vs. structure' },
    { age: 21, aspectType: 'Square' as const, description: 'Third waning square - Adulthood entry, taking responsibility' },
    { age: 29, aspectType: 'Return' as const, description: 'Saturn Return - Major life restructuring, becoming yourself' },
    { age: 36, aspectType: 'Square' as const, description: 'Fourth waxing square - Career challenges, mid-30s crisis' },
    { age: 43, aspectType: 'Opposition' as const, description: 'Second opposition - Midlife review, rebalancing' },
    { age: 50, aspectType: 'Square' as const, description: 'Fifth waning square - Legacy questions begin' },
    { age: 59, aspectType: 'Return' as const, description: 'Second Saturn Return - Wisdom elder, life review' },
  ];
  
  return cycles.map(cycle => ({
    ...cycle,
    year: birthYear + cycle.age,
    question: `Tell me what happened around age ${cycle.age}? (year ${birthYear + cycle.age})`,
    isPast: currentAge >= cycle.age,
    isUpcoming: currentAge < cycle.age && currentAge >= cycle.age - 3,
  }));
};

// Get element for a sign
const getElement = (sign: string): string => {
  for (const [element, signs] of Object.entries(ELEMENTS)) {
    if (signs.includes(sign)) return element;
  }
  return 'Unknown';
};

// Get modality for a sign
const getModality = (sign: string): string => {
  for (const [modality, signs] of Object.entries(MODALITIES)) {
    if (signs.includes(sign)) return modality;
  }
  return 'Unknown';
};

// Calculate elemental balance
export interface ElementalBalance {
  Fire: number;
  Earth: number;
  Air: number;
  Water: number;
  planets: Record<string, string[]>;
  dominant: string;
  missing: string[];
  abundant: string[];
  pattern: 'Energized' | 'Grounded' | 'Balanced' | 'Intense' | 'Variable';
}

export const calculateElementalBalance = (chart: NatalChart): ElementalBalance => {
  const balance: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  const planetsByElement: Record<string, string[]> = { Fire: [], Earth: [], Air: [], Water: [] };
  
  const relevantPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  for (const planetName of relevantPlanets) {
    const position = chart.planets[planetName as keyof typeof chart.planets];
    if (position?.sign) {
      const element = getElement(position.sign);
      if (balance[element] !== undefined) {
        balance[element]++;
        planetsByElement[element].push(planetName);
      }
    }
  }
  
  // Find dominant, missing, and abundant
  const entries = Object.entries(balance).sort(([, a], [, b]) => b - a);
  const dominant = entries[0][0];
  const missing = entries.filter(([, count]) => count <= 1).map(([element]) => element);
  const abundant = entries.filter(([, count]) => count >= 4).map(([element]) => element);
  
  // Determine pattern
  const fireAir = balance.Fire + balance.Air;
  const earthWater = balance.Earth + balance.Water;
  let pattern: ElementalBalance['pattern'] = 'Balanced';
  
  if (fireAir >= 7) pattern = 'Energized';
  else if (earthWater >= 7) pattern = 'Grounded';
  else if (balance.Water >= 4 && balance.Fire >= 3) pattern = 'Intense';
  else if (Math.max(...Object.values(balance)) - Math.min(...Object.values(balance)) >= 4) pattern = 'Variable';
  
  return {
    Fire: balance.Fire,
    Earth: balance.Earth,
    Air: balance.Air,
    Water: balance.Water,
    planets: planetsByElement,
    dominant,
    missing,
    abundant,
    pattern,
  };
};

// Modality balance calculation
export interface ModalityBalance {
  Cardinal: number;
  Fixed: number;
  Mutable: number;
  planets: Record<string, string[]>;
  dominant: string;
  missing: string[];
  pattern: 'Initiator' | 'Stabilizer' | 'Adapter' | 'Balanced' | 'Variable';
}

export const calculateModalityBalance = (chart: NatalChart): ModalityBalance => {
  const balance: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  const planetsByModality: Record<string, string[]> = { Cardinal: [], Fixed: [], Mutable: [] };
  
  const relevantPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  
  for (const planetName of relevantPlanets) {
    const position = chart.planets[planetName as keyof typeof chart.planets];
    if (position?.sign) {
      const modality = getModality(position.sign);
      if (balance[modality] !== undefined) {
        balance[modality]++;
        planetsByModality[modality].push(planetName);
      }
    }
  }
  
  const entries = Object.entries(balance).sort(([, a], [, b]) => b - a);
  const dominant = entries[0][0];
  const missing = entries.filter(([, count]) => count <= 1).map(([modality]) => modality);
  
  // Determine pattern
  let pattern: ModalityBalance['pattern'] = 'Balanced';
  const maxCount = Math.max(...Object.values(balance));
  const minCount = Math.min(...Object.values(balance));
  
  if (balance.Cardinal >= 5) pattern = 'Initiator';
  else if (balance.Fixed >= 5) pattern = 'Stabilizer';
  else if (balance.Mutable >= 5) pattern = 'Adapter';
  else if (maxCount - minCount >= 4) pattern = 'Variable';
  
  return {
    Cardinal: balance.Cardinal,
    Fixed: balance.Fixed,
    Mutable: balance.Mutable,
    planets: planetsByModality,
    dominant,
    missing,
    pattern,
  };
};

// Get house number for a planet (based on house cusps)
export const getPlanetHouse = (chart: NatalChart, planetName: string): number | null => {
  if (!chart.houseCusps) return null;
  
  const position = chart.planets[planetName as keyof typeof chart.planets];
  if (!position?.sign) return null;
  
  const planetLongitude = ZODIAC_SIGNS.indexOf(position.sign) * 30 + position.degree + position.minutes / 60;
  
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
    if (cusp) {
      const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
      if (signIndex >= 0) {
        cusps.push(signIndex * 30 + cusp.degree + cusp.minutes / 60);
      }
    }
  }
  
  if (cusps.length !== 12) return null;
  
  const normalizedPlanet = ((planetLongitude % 360) + 360) % 360;
  
  for (let i = 0; i < 12; i++) {
    const cuspStart = cusps[i];
    const cuspEnd = cusps[(i + 1) % 12];
    
    if (cuspEnd > cuspStart) {
      if (normalizedPlanet >= cuspStart && normalizedPlanet < cuspEnd) {
        return i + 1;
      }
    } else {
      if (normalizedPlanet >= cuspStart || normalizedPlanet < cuspEnd) {
        return i + 1;
      }
    }
  }
  
  return null;
};

// Character card data
export interface CharacterCard {
  planet: 'Sun' | 'Moon' | 'Rising';
  sign: string;
  degree: number;
  house: number | null;
  element: string;
  modality: string;
  description: string;
  keywords: string[];
  mantra: string;
  archetypes: string[];
  lifeLessons: string[];
  esotericMeaning: string[];
  rulingPlanet: string;
  bodyPart: string;
}

// Import archetype data
import { SIGN_ARCHETYPES, MODALITY_DESCRIPTIONS } from './debraSilvermanGuide';

export const getCharacterCards = (chart: NatalChart): CharacterCard[] => {
  const cards: CharacterCard[] = [];
  
  const sunPos = chart.planets.Sun;
  if (sunPos?.sign) {
    const archetype = SIGN_ARCHETYPES[sunPos.sign];
    const modality = MODALITY_DESCRIPTIONS[getModality(sunPos.sign)];
    cards.push({
      planet: 'Sun',
      sign: sunPos.sign,
      degree: sunPos.degree,
      house: getPlanetHouse(chart, 'Sun'),
      element: getElement(sunPos.sign),
      modality: getModality(sunPos.sign),
      description: getSunDescription(sunPos.sign, archetype, modality),
      keywords: archetype?.traits || getSunKeywords(sunPos.sign),
      mantra: archetype?.mantras?.[0] || '',
      archetypes: archetype?.archetypes || [],
      lifeLessons: archetype?.lifeLessons || [],
      esotericMeaning: archetype?.esotericMeaning || [],
      rulingPlanet: archetype?.rulingPlanet || '',
      bodyPart: archetype?.bodyPart || '',
    });
  }
  
  const moonPos = chart.planets.Moon;
  if (moonPos?.sign) {
    const archetype = SIGN_ARCHETYPES[moonPos.sign];
    const modality = MODALITY_DESCRIPTIONS[getModality(moonPos.sign)];
    cards.push({
      planet: 'Moon',
      sign: moonPos.sign,
      degree: moonPos.degree,
      house: getPlanetHouse(chart, 'Moon'),
      element: getElement(moonPos.sign),
      modality: getModality(moonPos.sign),
      description: getMoonDescription(moonPos.sign, archetype, modality),
      keywords: getMoonKeywords(moonPos.sign),
      mantra: archetype?.mantras?.[0] || '',
      archetypes: archetype?.archetypes || [],
      lifeLessons: archetype?.lifeLessons || [],
      esotericMeaning: archetype?.esotericMeaning || [],
      rulingPlanet: archetype?.rulingPlanet || '',
      bodyPart: archetype?.bodyPart || '',
    });
  }
  
  const house1Cusp = chart.houseCusps?.house1;
  const ascPos = chart.planets.Ascendant;
  
  const risingSign = house1Cusp?.sign || ascPos?.sign;
  const risingDegree = house1Cusp?.degree ?? ascPos?.degree ?? 0;
  
  if (risingSign) {
    const archetype = SIGN_ARCHETYPES[risingSign];
    const modality = MODALITY_DESCRIPTIONS[getModality(risingSign)];
    cards.push({
      planet: 'Rising',
      sign: risingSign,
      degree: risingDegree,
      house: 1,
      element: getElement(risingSign),
      modality: getModality(risingSign),
      description: getRisingDescription(risingSign, archetype, modality),
      keywords: getRisingKeywords(risingSign),
      mantra: archetype?.mantras?.[0] || '',
      archetypes: archetype?.archetypes || [],
      lifeLessons: archetype?.lifeLessons || [],
      esotericMeaning: archetype?.esotericMeaning || [],
      rulingPlanet: archetype?.rulingPlanet || '',
      bodyPart: archetype?.bodyPart || '',
    });
  }
  
  return cards;
};

// Rich Sun descriptions using Debra Silverman's teachings
const getSunDescription = (sign: string, archetype: any, modality: any): string => {
  const descriptions: Record<string, string> = {
    Aries: `Your Sun in Aries means your CORE IDENTITY is the Warrior—the one who fights for what matters. Your mantra "${archetype?.mantras?.[0]}" speaks to your fundamental need to assert yourself, to be first, to pioneer. You came here to learn courage, to stand up against all odds. Your gift is Self-Esteem—when you trust your impulses, you light the way for others. The shadow? Dominating instead of leading. Your soul's purpose: to fight for love itself.`,
    
    Taurus: `Your Sun in Taurus means your CORE IDENTITY is the Earth Spirit—solid, sensual, deeply connected to nature and beauty. Your mantra "${archetype?.mantras?.[0]}" reveals that you find yourself through what you value, build, and hold. You came here to master patience, to prove that slow and steady wins. Your gift is Strength—the kind that comes from being unmovable in your truth. The shadow? Stubbornness that becomes stagnation. Your soul's purpose: to bring loyalty and consistency to an unstable world.`,
    
    Gemini: `Your Sun in Gemini means your CORE IDENTITY is the Messenger—the one who connects, questions, and communicates. Your mantra "${archetype?.mantras?.[0]}" reveals that your mind IS your identity; you exist through ideas. You came here to still the mind enough to hear truth, then share it. Your gift is Knowledge—not facts, but understanding of human nature. The shadow? Scattered energy, speaking without feeling. Your soul's purpose: to network the tribe, connecting what was separate.`,
    
    Cancer: `Your Sun in Cancer means your CORE IDENTITY is the Mother/Healer—the one who feels everything deeply and nurtures all. Your mantra "${archetype?.mantras?.[0]}" reveals that your emotions ARE your identity; you know yourself through feeling. You came here to accept your tears as wisdom, not weakness. Your gift is Family—creating belonging wherever you go. The shadow? Absorbing others' pain until you lose yourself. Your soul's purpose: to teach humanity that vulnerability is sacred.`,
    
    Leo: `Your Sun in Leo means your CORE IDENTITY is the King/Queen—the radiant one born to shine. Your mantra "${archetype?.mantras?.[0]}" reveals that your will IS your identity; you exist to create and express. You came here to shine brilliantly while remembering the light isn't yours alone. Your gift is Honor—modeling self-respect that inspires others. The shadow? Pride that forgets the source of the light. Your soul's purpose: to display divine creativity so beautifully that others remember their own.`,
    
    Virgo: `Your Sun in Virgo means your CORE IDENTITY is the Sacred Servant—the one who sees what needs fixing and does it. Your mantra "${archetype?.mantras?.[0]}" reveals that you find yourself through discernment, through bringing order to chaos. You came here to learn the difference between perception and judgment. Your gift is Purity of Thought—seeing clearly without cruelty. The shadow? Criticism that wounds rather than heals. Your soul's purpose: to perfect what has been created, gently.`,
    
    Libra: `Your Sun in Libra means your CORE IDENTITY is the Lover and Peacemaker—the one who sees both sides and seeks harmony. Your mantra "${archetype?.mantras?.[0]}" reveals that you find yourself through relationship, through the mirror of the other. You came here to end duality—to marry personality and soul, self and other. Your gift is Love itself—the capacity to create balance in an unbalanced world. The shadow? Losing yourself in others, unable to choose. Your soul's purpose: to bring peace wherever there is discord.`,
    
    Scorpio: `Your Sun in Scorpio means your CORE IDENTITY is the Detective/Transformer—the one who sees beneath all surfaces. Your mantra "${archetype?.mantras?.[0]}" reveals that you know yourself through intensity, through wanting deeply. You came here to destroy what is false so truth can emerge. Your gift is Purpose—forged through your willingness to face the dark. The shadow? Using insight as power over others. Your soul's purpose: to show that destruction and creation are the same force.`,
    
    Sagittarius: `Your Sun in Sagittarius means your CORE IDENTITY is the Philosopher/Gypsy—the eternal seeker. Your mantra "${archetype?.mantras?.[0]}" reveals that you find yourself through the search itself, through expanding beyond all limits. You came here to find your truth first, then share it with laughter. Your gift is Infinite Abundance—the optimism that turns eyes back toward possibility. The shadow? Preaching truth you haven't lived. Your soul's purpose: to awaken others through joy and disruption.`,
    
    Capricorn: `Your Sun in Capricorn means your CORE IDENTITY is the Elder/World Builder—the one who climbs the mountain. Your mantra "${archetype?.mantras?.[0]}" reveals that you know yourself through achievement, through taking responsibility. You came here to carry the weight so others don't have to, and to teach through example. Your gift is Responsibility itself—the willingness to lead when no one else will. The shadow? Ambition that forgets why it's climbing. Your soul's purpose: to embody timeless wisdom, unconcerned with applause.`,
    
    Aquarius: `Your Sun in Aquarius means your CORE IDENTITY is the Revolutionary Genius—the one who sees the future. Your mantra "${archetype?.mantras?.[0]}" reveals that you find yourself through knowing, through seeing what others cannot yet see. You came here to accept your eccentricity as a gift, not a curse. Your gift is Freedom—modeling liberation for humanity. The shadow? Loneliness that comes from being ahead of your time. Your soul's purpose: to pioneer consciousness itself.`,
    
    Pisces: `Your Sun in Pisces means your CORE IDENTITY is the Mystic/Poet—the one who dissolves boundaries between worlds. Your mantra "${archetype?.mantras?.[0]}" reveals that you find yourself through dreams, through merging with the divine. You came here to collect humanity's sorrows and return them to source. Your gift is Understanding—the only sign that truly comprehends the mystery. The shadow? Escapism, losing yourself in the ocean. Your soul's purpose: selfless service to the collective soul.`,
  };
  return descriptions[sign] || `Your core identity expressed through ${sign}`;
};

// Rich Moon descriptions
const getMoonDescription = (sign: string, archetype: any, modality: any): string => {
  const descriptions: Record<string, string> = {
    Aries: `Your Moon in Aries means you EMOTIONALLY NEED action, independence, and the freedom to react immediately. You feel safe when you can fight, move, start something new. Your inner child is a warrior who must express anger cleanly or it turns toxic. You're emotionally honest—what you feel, you show. The work: learning that vulnerability is also courage.`,
    
    Taurus: `Your Moon in Taurus means you EMOTIONALLY NEED security, beauty, and sensory comfort. You feel safe when surrounded by what's familiar, stable, beautiful. Your inner child craves touch, good food, nature. Emotionally, you're steady—but change threatens your foundation. The work: learning that security lives inside you, not in what you hold.`,
    
    Gemini: `Your Moon in Gemini means you EMOTIONALLY NEED mental stimulation, conversation, and variety. You feel safe when you can talk about feelings rather than drowning in them. Your inner child is curious, restless, needing to understand. Emotionally, you can detach—sometimes too easily. The work: learning that some feelings can't be thought away.`,
    
    Cancer: `Your Moon in Cancer means you EMOTIONALLY NEED nurturing, safety, and deep belonging. You feel safe when wrapped in family, home, unconditional acceptance. Your inner child is tender, easily wounded, psychically porous. Emotionally, you absorb everything—the room, the collective, the world. The work: learning whose feelings are actually yours.`,
    
    Leo: `Your Moon in Leo means you EMOTIONALLY NEED recognition, warmth, and creative expression. You feel safe when you're seen, appreciated, celebrated. Your inner child is dramatic, playful, needing attention like oxygen. Emotionally, you're generous—but need others to be generous back. The work: learning to shine even when no one's watching.`,
    
    Virgo: `Your Moon in Virgo means you EMOTIONALLY NEED order, usefulness, and practical routines. You feel safe when things are organized, when you're being helpful. Your inner child worries—about health, details, getting it right. Emotionally, you process through analysis, sometimes critiquing feelings rather than feeling them. The work: learning that imperfection is allowed.`,
    
    Libra: `Your Moon in Libra means you EMOTIONALLY NEED harmony, partnership, and aesthetic beauty. You feel safe in relationship, when peace prevails, when beauty surrounds you. Your inner child cannot bear conflict—it feels like annihilation. Emotionally, you seek balance, but may sacrifice truth for peace. The work: learning that your needs matter as much as theirs.`,
    
    Scorpio: `Your Moon in Scorpio means you EMOTIONALLY NEED depth, intensity, and transformative experiences. You feel safe only when you can trust completely—which is almost never. Your inner child knows too much, sees beneath surfaces, cannot pretend. Emotionally, you're all-or-nothing. The work: learning that vulnerability is safe, that letting go doesn't mean betrayal.`,
    
    Sagittarius: `Your Moon in Sagittarius means you EMOTIONALLY NEED freedom, adventure, and space to explore. You feel safe when you can roam—physically, mentally, spiritually. Your inner child is an optimistic traveler who can't be fenced. Emotionally, you run from heaviness, needing meaning in every experience. The work: learning to stay present even when it's uncomfortable.`,
    
    Capricorn: `Your Moon in Capricorn means you EMOTIONALLY NEED structure, achievement, and emotional control. You feel safe when you've accomplished something, when feelings are managed. Your inner child learned early to be the adult in the room. Emotionally, you're private, controlled, sometimes lonely. The work: learning that needing is not weakness.`,
    
    Aquarius: `Your Moon in Aquarius means you EMOTIONALLY NEED space, independence, and intellectual connection. You feel safe when you can observe feelings rather than be overwhelmed by them. Your inner child is an outsider, different, sometimes feeling like an alien. Emotionally, you're detached—which protects but also isolates. The work: learning that belonging doesn't mean losing yourself.`,
    
    Pisces: `Your Moon in Pisces means you EMOTIONALLY NEED transcendence, creativity, and spiritual connection. You feel safe when merged with music, art, nature, the divine. Your inner child is a mystic who feels everything—yours, theirs, the world's. Emotionally, you're boundaryless, absorbing the ocean. The work: learning that you can close the door without closing your heart.`,
  };
  return descriptions[sign] || `Your emotional nature expressed through ${sign}`;
};

// Rich Rising descriptions
const getRisingDescription = (sign: string, archetype: any, modality: any): string => {
  const descriptions: Record<string, string> = {
    Aries: `With Aries Rising, the world sees you as BOLD, DIRECT, and ready for action. You walk into rooms like you own them—head first, sometimes literally. First impressions: confident, competitive, possibly intimidating. Your body carries Mars energy: athletic, quick, impatient. The mask: the warrior. The lesson: this isn't just a mask—it's the vehicle your soul chose for this life.`,
    
    Taurus: `With Taurus Rising, the world sees you as CALM, STEADY, and sensually present. You walk into rooms like an anchor—grounding, reassuring, unmovable. First impressions: reliable, pleasant, possibly slow. Your body carries Venus energy: often beautiful, sturdy, comfortable in skin. The mask: the earth spirit. The lesson: this isn't just a mask—your soul chose beauty and stability as its vehicle.`,
    
    Gemini: `With Gemini Rising, the world sees you as CURIOUS, QUICK, and eternally youthful. You walk into rooms already talking—or thinking about what you'll say. First impressions: intelligent, witty, possibly scattered. Your body carries Mercury energy: expressive hands, mobile face, restless. The mask: the messenger. The lesson: this isn't just a mask—your soul chose communication as its vehicle.`,
    
    Cancer: `With Cancer Rising, the world sees you as NURTURING, SOFT, and emotionally present. You walk into rooms reading the emotional temperature immediately. First impressions: caring, protective, possibly moody. Your body carries Moon energy: round face, protective posture, receptive. The mask: the mother. The lesson: this isn't just a mask—your soul chose feeling as its vehicle.`,
    
    Leo: `With Leo Rising, the world sees you as RADIANT, COMMANDING, and impossible to ignore. You walk into rooms and the room notices—always. First impressions: dramatic, generous, possibly attention-seeking. Your body carries Sun energy: mane-like hair, proud posture, warm presence. The mask: royalty. The lesson: this isn't just a mask—your soul chose to shine as its vehicle.`,
    
    Virgo: `With Virgo Rising, the world sees you as CAPABLE, MODEST, and impeccably put-together. You walk into rooms already noticing what needs fixing. First impressions: helpful, neat, possibly critical. Your body carries Mercury energy: precise movements, discerning eye, practical dress. The mask: the servant. The lesson: this isn't just a mask—your soul chose sacred service as its vehicle.`,
    
    Libra: `With Libra Rising, the world sees you as CHARMING, GRACEFUL, and socially elegant. You walk into rooms creating harmony just by being there—smoothing edges, making introductions. First impressions: beautiful, diplomatic, possibly indecisive. Your body carries Venus energy: balanced features, graceful movement, aesthetic awareness. The mask: the peacemaker. The lesson: this isn't just a mask—your soul chose relationship and beauty as its vehicle.`,
    
    Scorpio: `With Scorpio Rising, the world sees you as INTENSE, MAGNETIC, and slightly dangerous. You walk into rooms and people feel you before they see you. First impressions: powerful, mysterious, possibly intimidating. Your body carries Pluto energy: penetrating gaze, still presence, transformative aura. The mask: the detective. The lesson: this isn't just a mask—your soul chose depth as its vehicle.`,
    
    Sagittarius: `With Sagittarius Rising, the world sees you as ADVENTUROUS, OPTIMISTIC, and refreshingly honest. You walk into rooms bringing possibilities, laughter, bigger vision. First impressions: jovial, free-spirited, possibly tactless. Your body carries Jupiter energy: tall, athletic, restless, ready to go. The mask: the philosopher. The lesson: this isn't just a mask—your soul chose expansion as its vehicle.`,
    
    Capricorn: `With Capricorn Rising, the world sees you as SERIOUS, COMPETENT, and naturally authoritative. You walk into rooms and people assume you're in charge—or should be. First impressions: mature, reserved, possibly cold. Your body carries Saturn energy: strong bones, aging well, dignified bearing. The mask: the elder. The lesson: this isn't just a mask—your soul chose responsibility as its vehicle.`,
    
    Aquarius: `With Aquarius Rising, the world sees you as UNIQUE, INDEPENDENT, and slightly odd—in the best way. You walk into rooms as the outsider, the observer, the one who's different. First impressions: eccentric, intelligent, possibly detached. Your body carries Uranus energy: unusual features, unpredictable style, electric presence. The mask: the revolutionary. The lesson: this isn't just a mask—your soul chose freedom as its vehicle.`,
    
    Pisces: `With Pisces Rising, the world sees you as DREAMY, GENTLE, and ethereally present. You walk into rooms like you're partly somewhere else—and you are. First impressions: artistic, sensitive, possibly vague. Your body carries Neptune energy: soft features, fluid movement, otherworldly quality. The mask: the mystic. The lesson: this isn't just a mask—your soul chose transcendence as its vehicle.`,
  };
  return descriptions[sign] || `Your outer presentation through ${sign}`;
};

// Sign keywords (kept as fallback)
const getSunKeywords = (sign: string): string[] => {
  const keywords: Record<string, string[]> = {
    Aries: ['pioneer', 'initiator', 'warrior', 'independent'],
    Taurus: ['builder', 'steady', 'sensual', 'determined'],
    Gemini: ['communicator', 'curious', 'versatile', 'witty'],
    Cancer: ['nurturer', 'protective', 'intuitive', 'sentimental'],
    Leo: ['leader', 'creative', 'generous', 'dramatic'],
    Virgo: ['analyst', 'helper', 'practical', 'discerning'],
    Libra: ['diplomat', 'harmonizer', 'aesthetic', 'partnership'],
    Scorpio: ['transformer', 'intense', 'investigator', 'powerful'],
    Sagittarius: ['explorer', 'philosopher', 'optimistic', 'adventurer'],
    Capricorn: ['achiever', 'disciplined', 'responsible', 'ambitious'],
    Aquarius: ['innovator', 'humanitarian', 'independent', 'visionary'],
    Pisces: ['dreamer', 'compassionate', 'intuitive', 'artistic'],
  };
  return keywords[sign] || ['unique', 'individual'];
};

const getMoonKeywords = (sign: string): string[] => {
  const keywords: Record<string, string[]> = {
    Aries: ['needs action', 'emotionally direct', 'quick to react', 'inner warrior'],
    Taurus: ['needs security', 'emotionally stable', 'comfort-seeking', 'sensory'],
    Gemini: ['needs stimulation', 'talks feelings', 'emotionally curious', 'restless'],
    Cancer: ['needs nurturing', 'emotionally deep', 'protective', 'absorbing'],
    Leo: ['needs recognition', 'emotionally warm', 'heart-centered', 'dramatic'],
    Virgo: ['needs usefulness', 'emotionally practical', 'worries', 'service'],
    Libra: ['needs harmony', 'emotionally balanced', 'peace-seeking', 'partnership'],
    Scorpio: ['needs intensity', 'emotionally deep', 'all-or-nothing', 'transformative'],
    Sagittarius: ['needs freedom', 'emotionally optimistic', 'expansive', 'adventurous'],
    Capricorn: ['needs structure', 'emotionally controlled', 'responsible', 'private'],
    Aquarius: ['needs space', 'emotionally detached', 'observer', 'unconventional'],
    Pisces: ['needs transcendence', 'emotionally boundless', 'empathic', 'mystical'],
  };
  return keywords[sign] || ['unique emotional needs'];
};

const getRisingKeywords = (sign: string): string[] => {
  const keywords: Record<string, string[]> = {
    Aries: ['bold entrance', 'warrior mask', 'athletic', 'direct'],
    Taurus: ['calm presence', 'earthy beauty', 'grounding', 'steady'],
    Gemini: ['quick wit', 'youthful', 'curious face', 'expressive'],
    Cancer: ['soft demeanor', 'nurturing aura', 'protective', 'receptive'],
    Leo: ['commanding presence', 'radiant', 'theatrical', 'regal'],
    Virgo: ['neat presentation', 'modest', 'capable', 'discerning'],
    Libra: ['graceful entrance', 'charming', 'beautiful', 'diplomatic'],
    Scorpio: ['magnetic presence', 'penetrating gaze', 'powerful', 'mysterious'],
    Sagittarius: ['jovial entrance', 'open', 'adventurous', 'honest'],
    Capricorn: ['authoritative', 'mature presence', 'composed', 'dignified'],
    Aquarius: ['unique style', 'eccentric', 'detached', 'electric'],
    Pisces: ['ethereal presence', 'dreamy', 'gentle', 'otherworldly'],
  };
  return keywords[sign] || ['unique presentation'];
};

// Life lesson data
export interface LifeLesson {
  saturn: {
    sign: string;
    house: number | null;
    directive: string;
    lesson: string;
  } | null;
  northNode: {
    sign: string;
    house: number | null;
    direction: string;
  } | null;
}

export const getLifeLesson = (chart: NatalChart): LifeLesson => {
  const saturnPos = chart.planets.Saturn;
  const northNodePos = chart.planets.NorthNode;
  
  let saturn: LifeLesson['saturn'] = null;
  if (saturnPos?.sign) {
    saturn = {
      sign: saturnPos.sign,
      house: getPlanetHouse(chart, 'Saturn'),
      directive: getSaturnDirective(saturnPos.sign),
      lesson: getSaturnLesson(saturnPos.sign),
    };
  }
  
  let northNode: LifeLesson['northNode'] = null;
  if (northNodePos?.sign) {
    northNode = {
      sign: northNodePos.sign,
      house: getPlanetHouse(chart, 'NorthNode'),
      direction: getNorthNodeDirection(northNodePos.sign),
    };
  }
  
  return { saturn, northNode };
};

const getSaturnDirective = (sign: string): string => {
  const directives: Record<string, string> = {
    Aries: 'Learn to act independently and trust your own initiative',
    Taurus: 'Build lasting security through patience and persistence',
    Gemini: 'Master communication and commit to learning',
    Cancer: 'Create emotional security and nurture responsibly',
    Leo: 'Develop authentic self-expression and creative authority',
    Virgo: 'Perfect your skills and serve with practical wisdom',
    Libra: 'Master relationships and create balanced partnerships',
    Scorpio: 'Transform through facing shadows and sharing resources',
    Sagittarius: 'Develop wisdom through experience and honest seeking',
    Capricorn: 'Achieve mastery through discipline and integrity',
    Aquarius: 'Innovate within structure and serve the collective',
    Pisces: 'Bring spiritual wisdom into practical form',
  };
  return directives[sign] || 'Master your unique lessons through experience';
};

const getSaturnLesson = (sign: string): string => {
  const lessons: Record<string, string> = {
    Aries: 'You are learning courage, self-reliance, and how to begin things on your own terms.',
    Taurus: 'You are learning stability, self-worth, and how to build something lasting.',
    Gemini: 'You are learning to focus your mind, communicate clearly, and complete what you start.',
    Cancer: 'You are learning to nurture without smothering and create true emotional safety.',
    Leo: 'You are learning authentic self-expression without seeking external validation.',
    Virgo: 'You are learning when good enough is perfect and how to serve without martyrdom.',
    Libra: 'You are learning balance in relationships and how to be fair to yourself and others.',
    Scorpio: 'You are learning to trust, transform, and share power appropriately.',
    Sagittarius: 'You are learning to commit to your truth and follow through on your ideals.',
    Capricorn: 'You are learning mastery through consistent effort and responsible leadership.',
    Aquarius: 'You are learning to be yourself within groups and innovate responsibly.',
    Pisces: 'You are learning healthy boundaries while maintaining compassion and spiritual connection.',
  };
  return lessons[sign] || 'Your Saturn placement reveals your unique life mastery path.';
};

const getNorthNodeDirection = (sign: string): string => {
  const directions: Record<string, string> = {
    Aries: 'Moving toward independence, courage, and self-assertion',
    Taurus: 'Moving toward stability, self-reliance, and simplicity',
    Gemini: 'Moving toward curiosity, communication, and versatility',
    Cancer: 'Moving toward emotional vulnerability and nurturing',
    Leo: 'Moving toward self-expression, creativity, and heart-centered living',
    Virgo: 'Moving toward practical service and attention to detail',
    Libra: 'Moving toward partnership, diplomacy, and balance',
    Scorpio: 'Moving toward depth, transformation, and shared resources',
    Sagittarius: 'Moving toward adventure, meaning, and expansion',
    Capricorn: 'Moving toward achievement, structure, and responsibility',
    Aquarius: 'Moving toward community, innovation, and humanitarian ideals',
    Pisces: 'Moving toward faith, compassion, and spiritual surrender',
  };
  return directions[sign] || 'Moving toward your soul\'s evolutionary path';
};

// Generate final directive
export const generateFinalDirective = (chart: NatalChart, elements: ElementalBalance): string => {
  const lifeLesson = getLifeLesson(chart);
  
  // Priority: Saturn directive, then missing element guidance
  if (lifeLesson.saturn) {
    return lifeLesson.saturn.directive;
  }
  
  if (elements.missing.length > 0) {
    const missingElement = elements.missing[0];
    const guidance: Record<string, string> = {
      Fire: 'Take action. Don\'t wait for permission. Your spark comes from doing.',
      Earth: 'Ground yourself. Build something tangible. Trust the physical world.',
      Air: 'Communicate more. Share your thoughts. Let ideas flow.',
      Water: 'Feel your feelings. Trust your intuition. Allow emotional connection.',
    };
    return guidance[missingElement] || 'Trust your unique path.';
  }
  
  return 'Trust yourself. You have everything you need within.';
};

// Element guidance for missing/abundant
export const getElementGuidance = (element: string, type: 'missing' | 'abundant'): string => {
  const guidance: Record<string, Record<string, string>> = {
    Fire: {
      missing: 'You may need to consciously cultivate initiative, spontaneity, and action. Don\'t overthink—sometimes you just need to do it.',
      abundant: 'You have natural enthusiasm and drive. Channel this energy constructively; avoid burnout through impulsive action.',
    },
    Earth: {
      missing: 'You may struggle with practical matters and follow-through. Create structure and routine. Don\'t forget the physical world.',
      abundant: 'You have natural practicality and persistence. Be careful not to become too rigid or materialistic.',
    },
    Air: {
      missing: 'You may need to consciously develop communication and intellectual analysis. Talk things through. Get perspective.',
      abundant: 'You have natural intellectual gifts. Don\'t live entirely in your head—remember to feel and to act.',
    },
    Water: {
      missing: 'You may struggle with emotional awareness and intuition. Practice feeling. Allow vulnerability and connection.',
      abundant: 'You have natural emotional depth and empathy. Set healthy boundaries. Don\'t drown in feeling.',
    },
  };
  return guidance[element]?.[type] || '';
};

// Calculate age from birth date
export const calculateAge = (birthDate: string): number => {
  const [year, month, day] = birthDate.split('-').map(Number);
  const birth = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Format degree display
export const formatDegree = (position: NatalPlanetPosition): string => {
  return `${position.degree}°${position.minutes}'`;
};
