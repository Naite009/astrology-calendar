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
  
  // Calculate planet's absolute longitude (0-360)
  const planetSignIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (planetSignIndex === -1) return null;
  const planetLongitude = planetSignIndex * 30 + position.degree + (position.minutes || 0) / 60;
  
  // Build array of house cusp longitudes
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
    if (cusp) {
      const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
      if (signIndex >= 0) {
        cusps.push(signIndex * 30 + cusp.degree + (cusp.minutes || 0) / 60);
      }
    }
  }
  
  if (cusps.length !== 12) return null;
  
  // Normalize planet longitude to 0-360
  const normalizedPlanet = ((planetLongitude % 360) + 360) % 360;
  
  // Find which house the planet is in
  // A planet is in house N if it's between cusp N and cusp N+1
  for (let i = 0; i < 12; i++) {
    const cuspStart = ((cusps[i] % 360) + 360) % 360;
    const cuspEnd = ((cusps[(i + 1) % 12] % 360) + 360) % 360;
    
    // Handle wrap-around at 0°/360°
    if (cuspEnd <= cuspStart) {
      // House crosses 0° Aries
      if (normalizedPlanet >= cuspStart || normalizedPlanet < cuspEnd) {
        return i + 1;
      }
    } else {
      // Normal case - house doesn't cross 0°
      if (normalizedPlanet >= cuspStart && normalizedPlanet < cuspEnd) {
        return i + 1;
      }
    }
  }
  
  // Fallback: if we somehow didn't find a house, check if planet is very close to a cusp
  // This handles edge cases with floating point precision
  for (let i = 0; i < 12; i++) {
    const cuspDeg = ((cusps[i] % 360) + 360) % 360;
    const diff = Math.abs(normalizedPlanet - cuspDeg);
    if (diff < 0.01 || diff > 359.99) {
      return i + 1; // On the cusp, assign to that house
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

// Stellium detection for natal charts (3+ planets in same sign)
export interface NatalStellium {
  sign: string;
  planets: { name: string; symbol: string; degree: number }[];
  count: number;
  element: string;
  meaning: string;
}

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
  Jupiter: '♃',
  Saturn: '♄',
  Uranus: '♅',
  Neptune: '♆',
  Pluto: '♇',
  NorthNode: '☊',
  Chiron: '⚷',
};

const STELLIUM_INTERPRETATIONS: Record<string, string> = {
  Aries: 'A concentration of energy around identity, initiative, and independence. This person leads with boldness and needs to pioneer. Life lessons revolve around courage, self-assertion, and learning when to fight and when to yield.',
  Taurus: 'A concentration of energy around stability, values, and sensuality. This person builds with patience and needs material security. Life lessons revolve around worth, pleasure, and learning the difference between having and being.',
  Gemini: 'A concentration of energy around communication, learning, and connection. This person processes life through information and ideas. Life lessons revolve around curiosity, duality, and learning to focus scattered brilliance.',
  Cancer: 'A concentration of energy around nurturing, belonging, and emotional security. This person leads from the heart and needs deep roots. Life lessons revolve around family, vulnerability, and learning to mother without smothering.',
  Leo: 'A concentration of energy around self-expression, creativity, and recognition. This person radiates and needs to be seen. Life lessons revolve around pride, generosity, and learning the difference between attention and love.',
  Virgo: 'A concentration of energy around service, improvement, and analysis. This person perfects and needs to be useful. Life lessons revolve around discernment, health, and learning that good enough is sometimes enough.',
  Libra: 'A concentration of energy around relationships, balance, and beauty. This person harmonizes and needs partnership. Life lessons revolve around fairness, diplomacy, and learning to choose yourself sometimes.',
  Scorpio: 'A concentration of energy around transformation, depth, and power. This person probes and needs intensity. Life lessons revolve around trust, control, and learning to let die what must die.',
  Sagittarius: 'A concentration of energy around meaning, expansion, and truth. This person explores and needs freedom. Life lessons revolve around faith, excess, and learning that some questions have no answers.',
  Capricorn: 'A concentration of energy around achievement, structure, and mastery. This person builds and needs respect. Life lessons revolve around ambition, responsibility, and learning that the summit is not the journey.',
  Aquarius: 'A concentration of energy around innovation, community, and individuality. This person reforms and needs intellectual freedom. Life lessons revolve around belonging, detachment, and learning to be human, not just humane.',
  Pisces: 'A concentration of energy around transcendence, compassion, and creativity. This person dissolves and needs spiritual meaning. Life lessons revolve around boundaries, surrender, and learning when to escape and when to stay.'
};

export const detectNatalStelliums = (chart: NatalChart): NatalStellium[] => {
  const signGroups: Record<string, { name: string; symbol: string; degree: number }[]> = {};
  
  // Check each planet in the chart
  const planetsToCheck = [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto', 'NorthNode', 'Chiron'
  ];
  
  planetsToCheck.forEach(planetName => {
    const planet = chart.planets[planetName as keyof typeof chart.planets];
    if (planet && planet.sign) {
      if (!signGroups[planet.sign]) {
        signGroups[planet.sign] = [];
      }
      signGroups[planet.sign].push({
        name: planetName,
        symbol: PLANET_SYMBOLS[planetName] || planetName[0],
        degree: planet.degree
      });
    }
  });
  
  // Return signs with 3+ planets
  return Object.entries(signGroups)
    .filter(([, planets]) => planets.length >= 3)
    .map(([sign, planets]) => ({
      sign,
      planets: planets.sort((a, b) => a.degree - b.degree),
      count: planets.length,
      element: getElement(sign),
      meaning: STELLIUM_INTERPRETATIONS[sign] || `Concentrated energy in ${sign}.`
    }))
    .sort((a, b) => b.count - a.count); // Most planets first
};

// Goddess asteroid descriptions
export interface GoddessDescription {
  name: string;
  symbol: string;
  archetype: string;
  keywords: string[];
  signMeaning: (sign: string) => string;
  houseMeaning: (house: number) => string;
}

export const GODDESS_ASTEROIDS: Record<string, GoddessDescription> = {
  Ceres: {
    name: 'Ceres',
    symbol: '⚳',
    archetype: 'The Great Mother',
    keywords: ['nurturing', 'nourishment', 'loss', 'cycles', 'unconditional love'],
    signMeaning: (sign: string) => {
      const meanings: Record<string, string> = {
        Aries: 'Nurtures through encouraging independence and initiative. May push loved ones to fight their own battles. Learns to soften the warrior approach to care.',
        Taurus: 'Nurtures through physical comfort, good food, and material security. Creates sanctuary. May over-attach to loved ones as possessions.',
        Gemini: 'Nurtures through communication, stories, and mental stimulation. Talks through problems. May intellectualize emotions instead of feeling them.',
        Cancer: 'Nurtures in the most archetypal way—through food, home, and emotional attunement. Deep maternal instincts. May struggle with over-protectiveness.',
        Leo: 'Nurtures through celebration, creativity, and making loved ones feel special. Generous and warm. May need recognition for caregiving efforts.',
        Virgo: 'Nurtures through practical help, health awareness, and improvement. Shows love by fixing problems. May criticize when trying to help.',
        Libra: 'Nurtures through creating harmony, beauty, and balanced relationships. Diplomatic caregiver. May avoid necessary confrontation in family matters.',
        Scorpio: 'Nurtures through emotional depth, transformation, and fierce protection. Intense bonding. May struggle with control in nurturing relationships.',
        Sagittarius: 'Nurtures through teaching, adventure, and expanding horizons. Encourages growth. May be physically or emotionally absent while exploring.',
        Capricorn: 'Nurtures through structure, responsibility, and practical guidance. Teaches discipline. May withhold warmth while providing materially.',
        Aquarius: 'Nurtures through acceptance, intellectual support, and freedom. Unconventional parenting. May seem emotionally detached while deeply caring.',
        Pisces: 'Nurtures through compassion, spiritual connection, and unconditional acceptance. Deeply empathic. May sacrifice self or enable unhealthy patterns.'
      };
      return meanings[sign] || 'Expresses nurturing in unique ways aligned with this sign\'s energy.';
    },
    houseMeaning: (house: number) => {
      const meanings: Record<number, string> = {
        1: 'Your identity is tied to nurturing. You appear caring and maternal/paternal to others.',
        2: 'You nurture through resources and material support. Self-worth tied to ability to provide.',
        3: 'You nurture through communication and mental support. Caring siblings or neighbors.',
        4: 'Strong need for home and family nurturing. Deep connection to mother or homeland.',
        5: 'You nurture through creativity and play. Children are a significant life theme.',
        6: 'You nurture through service and health support. May work in caregiving fields.',
        7: 'You seek nurturing partnerships. Marriage has strong parental or caregiving themes.',
        8: 'Deep transformation through nurturing losses. Inheritance or shared resources from caregivers.',
        9: 'You nurture through teaching and philosophical guidance. Foreign mother figure possible.',
        10: 'Career involves nurturing or care. Public image as a provider or mother figure.',
        11: 'You nurture friends and communities. Group involvement has caring, supportive quality.',
        12: 'Hidden or institutional nurturing. May have had absent mother or sacrificed for others.'
      };
      return meanings[house] || 'Ceres influences this life area with themes of nurturing and care.';
    }
  },
  Pallas: {
    name: 'Pallas Athena',
    symbol: '⚴',
    archetype: 'The Strategist & Creative Intelligence',
    keywords: ['wisdom', 'pattern recognition', 'strategy', 'creative intelligence', 'healing'],
    signMeaning: (sign: string) => {
      const meanings: Record<string, string> = {
        Aries: 'Strategic mind works through bold initiative. Sees patterns in competitive situations. Creative intelligence expressed through pioneering action.',
        Taurus: 'Strategic mind works through patience and persistence. Sees patterns in material resources. Creative intelligence expressed through building and crafting.',
        Gemini: 'Strategic mind works through communication and ideas. Sees patterns in information. Creative intelligence expressed through writing and speaking.',
        Cancer: 'Strategic mind works through emotional intelligence. Sees patterns in family dynamics. Creative intelligence expressed through nurturing and home.',
        Leo: 'Strategic mind works through creative expression. Sees patterns in performance. Creative intelligence expressed through drama and leadership.',
        Virgo: 'Strategic mind works through analysis and refinement. Sees patterns in details others miss. Creative intelligence expressed through healing and service.',
        Libra: 'Strategic mind works through diplomacy and balance. Sees patterns in relationships. Creative intelligence expressed through art and justice.',
        Scorpio: 'Strategic mind works through depth and investigation. Sees patterns in hidden dynamics. Creative intelligence expressed through transformation.',
        Sagittarius: 'Strategic mind works through philosophy and vision. Sees patterns in belief systems. Creative intelligence expressed through teaching and travel.',
        Capricorn: 'Strategic mind works through structure and long-term planning. Sees patterns in systems. Creative intelligence expressed through achievement.',
        Aquarius: 'Strategic mind works through innovation and reform. Sees patterns in social systems. Creative intelligence expressed through humanitarian efforts.',
        Pisces: 'Strategic mind works through intuition and imagination. Sees patterns in the collective unconscious. Creative intelligence expressed through art and healing.'
      };
      return meanings[sign] || 'Expresses strategic wisdom in ways aligned with this sign\'s energy.';
    },
    houseMeaning: (house: number) => {
      const meanings: Record<number, string> = {
        1: 'You present as wise and strategic. Others see your intelligence immediately.',
        2: 'Your wisdom applies to finances and values. Strategic approach to resources.',
        3: 'Brilliant communicator and thinker. Strategic mind in daily interactions.',
        4: 'Wisdom about home and family. Strategic approach to creating security.',
        5: 'Creative intelligence in full bloom. Strategic in romance and with children.',
        6: 'Wisdom in work and health matters. Strategic problem-solver in daily life.',
        7: 'Seeks wise, strategic partners. Brings intelligence to all relationships.',
        8: 'Deep strategic understanding of power and transformation. Investigative mind.',
        9: 'Wisdom seeker through education and travel. Strategic philosopher.',
        10: 'Career involves strategy and wisdom. Known publicly for intelligence.',
        11: 'Strategic approach to groups and causes. Wise counselor to friends.',
        12: 'Hidden wisdom. Intuitive strategic abilities. May work behind the scenes.'
      };
      return meanings[house] || 'Pallas influences this area with strategic wisdom and creative intelligence.';
    }
  },
  Juno: {
    name: 'Juno',
    symbol: '⚵',
    archetype: 'The Sacred Partner',
    keywords: ['commitment', 'marriage', 'equality', 'jealousy', 'sacred union'],
    signMeaning: (sign: string) => {
      const meanings: Record<string, string> = {
        Aries: 'Needs independence within partnership. Attracted to bold, assertive partners. Marriage must honor individual identity.',
        Taurus: 'Needs stability and sensuality in partnership. Attracted to reliable, grounded partners. Marriage built on shared values and comfort.',
        Gemini: 'Needs intellectual stimulation in partnership. Attracted to communicative, curious partners. Marriage requires constant conversation.',
        Cancer: 'Needs emotional security in partnership. Attracted to nurturing, family-oriented partners. Marriage is about creating home together.',
        Leo: 'Needs recognition and romance in partnership. Attracted to generous, expressive partners. Marriage must celebrate both people.',
        Virgo: 'Needs practical support in partnership. Attracted to helpful, health-conscious partners. Marriage involves serving each other.',
        Libra: 'Needs balance and beauty in partnership. Attracted to harmonious, aesthetic partners. Marriage as true equal partnership.',
        Scorpio: 'Needs depth and intensity in partnership. Attracted to powerful, transformative partners. Marriage involves complete merging.',
        Sagittarius: 'Needs freedom and growth in partnership. Attracted to adventurous, philosophical partners. Marriage must expand horizons.',
        Capricorn: 'Needs structure and commitment in partnership. Attracted to ambitious, responsible partners. Marriage as a serious institution.',
        Aquarius: 'Needs friendship and freedom in partnership. Attracted to unique, humanitarian partners. Unconventional approach to marriage.',
        Pisces: 'Needs spiritual connection in partnership. Attracted to compassionate, artistic partners. Marriage as soul union.'
      };
      return meanings[sign] || 'Seeks partnership qualities aligned with this sign\'s energy.';
    },
    houseMeaning: (house: number) => {
      const meanings: Record<number, string> = {
        1: 'Identity strongly tied to partnership. May define self through relationships.',
        2: 'Partnership tied to values and resources. May share finances deeply.',
        3: 'Partnership involves communication and learning. Sibling-like bond with partner.',
        4: 'Home and family central to partnership. Deep roots with committed partner.',
        5: 'Romance and creativity important in partnership. Playful, dramatic relationships.',
        6: 'Partnership involves daily work and service. May meet partner at work.',
        7: 'Partnership is a central life theme. Strong marriage focus.',
        8: 'Deep, transformative partnerships. Shared resources and sexuality central.',
        9: 'Partnership involves growth and travel. May marry someone from different background.',
        10: 'Partnership affects career and public image. Power couple potential.',
        11: 'Partnership involves shared ideals and friendships. Community-oriented coupling.',
        12: 'Hidden or karmic partnerships. May sacrifice for partner or experience loss.'
      };
      return meanings[house] || 'Juno influences this area with themes of committed partnership.';
    }
  },
  Vesta: {
    name: 'Vesta',
    symbol: '⚶',
    archetype: 'The Sacred Flame',
    keywords: ['devotion', 'focus', 'sacred sexuality', 'self-sufficiency', 'ritual'],
    signMeaning: (sign: string) => {
      const meanings: Record<string, string> = {
        Aries: 'Devoted to independence and personal projects. Sacred focus on self-development and pioneering work.',
        Taurus: 'Devoted to material security and sensual pleasures. Sacred focus on building lasting value and comfort.',
        Gemini: 'Devoted to learning and communication. Sacred focus on ideas, writing, and mental development.',
        Cancer: 'Devoted to home and family. Sacred focus on nurturing, ancestry, and emotional security.',
        Leo: 'Devoted to creative expression and children. Sacred focus on self-expression and being seen.',
        Virgo: 'Devoted to service and improvement. Sacred focus on health, work, and perfecting skills.',
        Libra: 'Devoted to relationships and beauty. Sacred focus on harmony, art, and partnership.',
        Scorpio: 'Devoted to transformation and depth. Sacred focus on psychology, healing, and hidden truths.',
        Sagittarius: 'Devoted to truth and exploration. Sacred focus on philosophy, travel, and meaning.',
        Capricorn: 'Devoted to achievement and structure. Sacred focus on career, legacy, and mastery.',
        Aquarius: 'Devoted to humanity and reform. Sacred focus on community, innovation, and ideals.',
        Pisces: 'Devoted to spirituality and compassion. Sacred focus on transcendence, art, and healing.'
      };
      return meanings[sign] || 'Expresses sacred devotion in ways aligned with this sign\'s energy.';
    },
    houseMeaning: (house: number) => {
      const meanings: Record<number, string> = {
        1: 'Your identity is tied to sacred work. You appear focused and self-contained.',
        2: 'Devoted focus on resources and values. May be self-sufficient financially.',
        3: 'Devoted focus on communication and learning. Sacred relationship with siblings.',
        4: 'Devoted focus on home and family. The home itself may be a sacred space.',
        5: 'Devoted focus on creativity and children. Sacred approach to self-expression.',
        6: 'Devoted focus on work and health. May have ritualistic daily practices.',
        7: 'Devoted focus on partnerships. May alternate between solitude and deep relating.',
        8: 'Devoted focus on transformation. Deep, sacred approach to intimacy and shared resources.',
        9: 'Devoted focus on higher learning and travel. Sacred relationship with truth.',
        10: 'Career is a sacred calling. Publicly devoted to work and achievement.',
        11: 'Devoted focus on community and ideals. Sacred relationship with groups.',
        12: 'Devoted focus on spiritual life. May need significant solitude and retreat time.'
      };
      return meanings[house] || 'Vesta influences this area with themes of sacred devotion and focus.';
    }
  }
};

export const getGoddessDescription = (asteroidName: string, sign: string, house?: number): {
  archetype: string;
  keywords: string[];
  signInterpretation: string;
  houseInterpretation?: string;
} | null => {
  const goddess = GODDESS_ASTEROIDS[asteroidName];
  if (!goddess) return null;
  
  return {
    archetype: goddess.archetype,
    keywords: goddess.keywords,
    signInterpretation: goddess.signMeaning(sign),
    houseInterpretation: house ? goddess.houseMeaning(house) : undefined
  };
};

// =====================================
// PSYCHIC/MEDIUMSHIP INDICATORS
// =====================================

export interface PsychicIndicator {
  name: string;
  symbol: string;
  description: string;
  clientDescription: string;
  strength: 'strong' | 'moderate' | 'subtle';
  category: 'neptune' | 'twelfth-house' | 'eighth-house' | 'water' | 'pluto-moon' | 'aspect' | 'nodes' | 'chiron' | 'angular' | 'midpoint' | 'tno';
}

// Detect psychic and mediumship indicators in a natal chart
export const detectPsychicIndicators = (chart: NatalChart): PsychicIndicator[] => {
  const indicators: PsychicIndicator[] = [];
  
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];
  const psychicHouses = [8, 12, 4]; // 8th (mediumship), 12th (spiritual), 4th (ancestral)
  
  // Helper to get planet house
  const getPlanetHouse = (planet: NatalPlanetPosition): number | null => {
    if (!chart.houseCusps) return null;
    
    const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const planetLon = ZODIAC.indexOf(planet.sign) * 30 + planet.degree + planet.minutes / 60;
    
    const cusps: number[] = [];
    for (let i = 1; i <= 12; i++) {
      const cusp = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
      if (cusp) {
        cusps.push(ZODIAC.indexOf(cusp.sign) * 30 + cusp.degree + cusp.minutes / 60);
      }
    }
    
    if (cusps.length !== 12) return null;
    
    for (let i = 0; i < 12; i++) {
      const start = cusps[i];
      const end = cusps[(i + 1) % 12];
      
      if (end > start) {
        if (planetLon >= start && planetLon < end) return i + 1;
      } else {
        if (planetLon >= start || planetLon < end) return i + 1;
      }
    }
    return null;
  };
  
  // Helper to calculate aspect
  const hasAspect = (planet1: NatalPlanetPosition, planet2: NatalPlanetPosition, aspectAngle: number, orb: number = 8): boolean => {
    const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const lon1 = ZODIAC.indexOf(planet1.sign) * 30 + planet1.degree + planet1.minutes / 60;
    const lon2 = ZODIAC.indexOf(planet2.sign) * 30 + planet2.degree + planet2.minutes / 60;
    let diff = Math.abs(lon1 - lon2);
    if (diff > 180) diff = 360 - diff;
    return Math.abs(diff - aspectAngle) <= orb;
  };
  
  // Helper to get absolute degree for midpoint calculations
  const getAbsoluteDegree = (planet: NatalPlanetPosition): number => {
    const ZODIAC = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    return ZODIAC.indexOf(planet.sign) * 30 + planet.degree + (planet.minutes || 0) / 60;
  };
  
  // 1. NEPTUNE ASPECTS TO PERSONAL PLANETS
  const neptune = chart.planets.Neptune;
  const moon = chart.planets.Moon;
  const sun = chart.planets.Sun;
  const mercury = chart.planets.Mercury;
  
  if (neptune && moon) {
    // Neptune conjunct Moon
    if (hasAspect(neptune, moon, 0, 8)) {
      indicators.push({
        name: 'Neptune Conjunct Moon',
        symbol: '♆☌☽',
        description: 'The classic psychic signature. Emotional body is attuned to subtle realms. May receive impressions, dreams, or feelings from beyond the physical.',
        clientDescription: 'You have a natural psychic sensitivity. Your emotional body picks up on energies, feelings, and impressions that others miss. Dreams are often prophetic or meaningful. You may sense spirits or the feelings of those who have passed.',
        strength: 'strong',
        category: 'neptune'
      });
    }
    // Neptune opposite Moon
    if (hasAspect(neptune, moon, 180, 8)) {
      indicators.push({
        name: 'Neptune Opposite Moon',
        symbol: '♆☍☽',
        description: 'Psychic sensitivity through relationships and projections. May absorb others\' emotions or experience mediumship through others.',
        clientDescription: 'You are deeply empathic and may struggle to distinguish your own emotions from others\'. This is actually a psychic gift — you can sense what people are feeling, even what they\'re not saying. Learn to shield and ground.',
        strength: 'strong',
        category: 'neptune'
      });
    }
    // Neptune square Moon
    if (hasAspect(neptune, moon, 90, 6)) {
      indicators.push({
        name: 'Neptune Square Moon',
        symbol: '♆□☽',
        description: 'Friction between intuition and emotions creates heightened sensitivity but also confusion. Must learn to trust and refine psychic impressions.',
        clientDescription: 'You have psychic sensitivity, but it may feel confusing or overwhelming. Your intuition is real, but you\'re still learning to trust it. Meditation and grounding practices help you refine this gift.',
        strength: 'moderate',
        category: 'neptune'
      });
    }
    // Neptune trine/sextile Moon
    if (hasAspect(neptune, moon, 120, 8) || hasAspect(neptune, moon, 60, 6)) {
      indicators.push({
        name: 'Neptune Harmonious to Moon',
        symbol: '♆△☽',
        description: 'Easy flow between intuition and emotional awareness. Natural psychic ability that feels comfortable.',
        clientDescription: 'You have a natural, comfortable psychic sensitivity. Intuition flows easily. You may take this for granted because it\'s always been there. Trust those hunches — they\'re usually right.',
        strength: 'moderate',
        category: 'neptune'
      });
    }
  }
  
  if (neptune && sun) {
    if (hasAspect(neptune, sun, 0, 8)) {
      indicators.push({
        name: 'Neptune Conjunct Sun',
        symbol: '♆☌☉',
        description: 'Identity is merged with the spiritual and mystical. Natural channel for higher consciousness.',
        clientDescription: 'You are naturally connected to spiritual realms. Your sense of self is permeable — you may feel like a channel or vessel. Creative and mystical abilities are core to who you are.',
        strength: 'strong',
        category: 'neptune'
      });
    }
  }
  
  if (neptune && mercury) {
    if (hasAspect(neptune, mercury, 0, 8) || hasAspect(neptune, mercury, 120, 8) || hasAspect(neptune, mercury, 60, 6)) {
      indicators.push({
        name: 'Neptune-Mercury Connection',
        symbol: '♆-☿',
        description: 'Clairaudient potential. May receive information through words, songs, or inner knowing.',
        clientDescription: 'You may receive psychic information through words, thoughts, or "downloads." Clairaudience (clear hearing) is possible. Pay attention to songs that pop into your head or words that come unbidden.',
        strength: 'moderate',
        category: 'neptune'
      });
    }
  }
  
  // 2. PLUTO-MOON ASPECTS (Mediumship, seeing the dead)
  const pluto = chart.planets.Pluto;
  
  if (pluto && moon) {
    if (hasAspect(pluto, moon, 0, 8)) {
      indicators.push({
        name: 'Pluto Conjunct Moon',
        symbol: '♇☌☽',
        description: 'Deep psychological attunement. Connection to the underworld and those who have passed. Classic mediumship indicator.',
        clientDescription: 'You have a powerful connection to the realm of the dead and the depths of the psyche. You may sense spirits, have intense dreams about deceased loved ones, or be drawn to work with death and transformation.',
        strength: 'strong',
        category: 'pluto-moon'
      });
    }
    if (hasAspect(pluto, moon, 180, 8) || hasAspect(pluto, moon, 90, 6)) {
      indicators.push({
        name: 'Pluto Hard Aspect to Moon',
        symbol: '♇-☽',
        description: 'Intense emotional depth that connects to hidden realms. May experience encounters with spirits or the dying.',
        clientDescription: 'You have an intense emotional nature that can perceive what others cannot. You may have had experiences with spirits or the dying. This can be overwhelming until you learn to work with it.',
        strength: 'strong',
        category: 'pluto-moon'
      });
    }
  }
  
  // 3. PLANETS IN 12TH HOUSE
  const personalPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'];
  personalPlanets.forEach(planetName => {
    const planet = chart.planets[planetName as keyof typeof chart.planets];
    if (planet) {
      const house = getPlanetHouse(planet);
      if (house === 12) {
        const symbol = planetName === 'Sun' ? '☉' : planetName === 'Moon' ? '☽' : planetName === 'Mercury' ? '☿' : planetName === 'Venus' ? '♀' : '♂';
        indicators.push({
          name: `${planetName} in 12th House`,
          symbol: `${symbol} in 12H`,
          description: `${planetName} operates in the hidden, spiritual realm. Natural connection to the unconscious and unseen worlds.`,
          clientDescription: `Your ${planetName} energy works behind the scenes, in dreams, and in spiritual dimensions. You may have psychic gifts related to ${planetName === 'Moon' ? 'emotions and clairsentience' : planetName === 'Mercury' ? 'clairaudience and channeling information' : planetName === 'Sun' ? 'spiritual identity and being a beacon for spirits' : planetName === 'Venus' ? 'sensing love and beauty from beyond' : 'taking action in dreams or astral realms'}.`,
          strength: planetName === 'Moon' || planetName === 'Sun' ? 'strong' : 'moderate',
          category: 'twelfth-house'
        });
      }
      // Also check 8th house for mediumship
      if (house === 8 && (planetName === 'Moon' || planetName === 'Sun')) {
        const symbol = planetName === 'Sun' ? '☉' : '☽';
        indicators.push({
          name: `${planetName} in 8th House`,
          symbol: `${symbol} in 8H`,
          description: `${planetName} in the house of death, transformation, and the occult. Natural mediumship abilities.`,
          clientDescription: `Your ${planetName === 'Moon' ? 'emotional nature' : 'core identity'} is attuned to death, transformation, and hidden realms. You may naturally sense spirits or be drawn to work with the dying. This is a classic mediumship placement.`,
          strength: 'strong',
          category: 'eighth-house'
        });
      }
    }
  });
  
  // 4. WATER SIGN EMPHASIS (3+ planets)
  let waterCount = 0;
  Object.entries(chart.planets).forEach(([, planet]) => {
    if (planet && planet.sign && waterSigns.includes(planet.sign)) {
      waterCount++;
    }
  });
  
  if (waterCount >= 4) {
    indicators.push({
      name: 'Strong Water Emphasis',
      symbol: '♋♏♓',
      description: `${waterCount} planets in water signs. Highly intuitive and emotionally sensitive nature.`,
      clientDescription: 'You have a very strong water element in your chart, making you naturally intuitive, empathic, and emotionally sensitive. You feel things deeply and may pick up on energies and emotions that others miss entirely.',
      strength: 'strong',
      category: 'water'
    });
  } else if (waterCount >= 3) {
    indicators.push({
      name: 'Water Emphasis',
      symbol: '♋♏♓',
      description: `${waterCount} planets in water signs. Intuitive and emotionally attuned.`,
      clientDescription: 'You have significant water energy in your chart. You\'re naturally intuitive and emotionally aware. Trust your feelings — they often contain information your logical mind hasn\'t processed yet.',
      strength: 'moderate',
      category: 'water'
    });
  }
  
  // 5. PISCES PLACEMENTS (especially Moon, Ascendant, Sun)
  if (moon && moon.sign === 'Pisces') {
    indicators.push({
      name: 'Moon in Pisces',
      symbol: '☽♓',
      description: 'Emotional nature is porous and psychically sensitive. Dreams are meaningful.',
      clientDescription: 'Your Moon in Pisces makes you extremely sensitive to energies, emotions, and subtle impressions. You likely have vivid, meaningful dreams. You may absorb others\' feelings unconsciously.',
      strength: 'strong',
      category: 'water'
    });
  }
  
  if (sun && sun.sign === 'Pisces') {
    indicators.push({
      name: 'Sun in Pisces',
      symbol: '☉♓',
      description: 'Core identity is connected to the mystical and spiritual realms.',
      clientDescription: 'As a Pisces Sun, you are naturally connected to spiritual and intuitive realms. Your identity includes a sense of connection to something larger than yourself.',
      strength: 'moderate',
      category: 'water'
    });
  }
  
  // Check Ascendant for Pisces
  if (chart.houseCusps?.house1?.sign === 'Pisces') {
    indicators.push({
      name: 'Pisces Rising',
      symbol: 'ASC♓',
      description: 'Presents to the world with a mystical, permeable quality. Others may sense your psychic nature.',
      clientDescription: 'With Pisces Rising, you appear to others as mystical, dreamy, and spiritually attuned. People may sense something otherworldly about you. You attract spiritual and creative experiences.',
      strength: 'moderate',
      category: 'water'
    });
  }
  
  // 6. SCORPIO PLACEMENTS (connection to the underworld)
  if (moon && moon.sign === 'Scorpio') {
    indicators.push({
      name: 'Moon in Scorpio',
      symbol: '☽♏',
      description: 'Emotional nature is intense and penetrating. Natural ability to sense hidden truths and the presence of the dead.',
      clientDescription: 'Your Moon in Scorpio gives you powerful emotional radar. You sense what others try to hide, including the presence of spirits. You may have had encounters with the deceased or intense psychic experiences.',
      strength: 'strong',
      category: 'water'
    });
  }
  
  // 7. NORTH NODE IN 12TH HOUSE
  const northNode = chart.planets.NorthNode;
  if (northNode) {
    const nnHouse = getPlanetHouse(northNode);
    if (nnHouse === 12) {
      indicators.push({
        name: 'North Node in 12th House',
        symbol: '☊ in 12H',
        description: 'Soul\'s direction points toward spiritual service, intuition, and transcendence. The psychic path IS the life path.',
        clientDescription: 'Your soul\'s purpose in this lifetime involves developing your spiritual and intuitive gifts. You\'re meant to move beyond the material world toward transcendence, compassion, and connection to the divine. Trust your inner guidance—it\'s your destiny.',
        strength: 'strong',
        category: 'nodes'
      });
    }
    // North Node in 8th also
    if (nnHouse === 8) {
      indicators.push({
        name: 'North Node in 8th House',
        symbol: '☊ in 8H',
        description: 'Soul\'s direction involves transformation, depth psychology, and the mysteries of death/rebirth.',
        clientDescription: 'Your path involves going deep—into psychology, into transformation, into the mysteries of death and rebirth. Mediumship, healing work with trauma, or working with the dying may be part of your purpose.',
        strength: 'moderate',
        category: 'nodes'
      });
    }
  }
  
  // 8. CHIRON IN PISCES OR 12TH HOUSE
  const chiron = chart.planets.Chiron;
  if (chiron) {
    if (chiron.sign === 'Pisces') {
      indicators.push({
        name: 'Chiron in Pisces',
        symbol: '⚷♓',
        description: 'The wound is spiritual: feeling disconnected from Source, boundaries too porous, or gifts feeling like burdens. Healing through embracing psychic sensitivity.',
        clientDescription: 'Your deepest wound relates to feeling too sensitive for this world, or cut off from the spiritual connection you crave. Healing comes through accepting your psychic sensitivity as a gift, not a curse. You may be a powerful healer for others with similar wounds.',
        strength: 'strong',
        category: 'chiron'
      });
    }
    const chironHouse = getPlanetHouse(chiron);
    if (chironHouse === 12) {
      indicators.push({
        name: 'Chiron in 12th House',
        symbol: '⚷ in 12H',
        description: 'The wound is hidden, often from past lives or collective karma. Natural healer who works with the unconscious.',
        clientDescription: 'You carry wounds that may feel inexplicable—from past lives, ancestors, or the collective unconscious. This makes you a natural healer for others\' hidden pain. Trust your ability to sense and heal what cannot be seen.',
        strength: 'moderate',
        category: 'chiron'
      });
    }
  }
  
  // 9. NEPTUNE IN ANGULAR HOUSES (1, 4, 7, 10)
  if (neptune) {
    const neptuneHouse = getPlanetHouse(neptune);
    if (neptuneHouse === 1) {
      indicators.push({
        name: 'Neptune in 1st House',
        symbol: '♆ in 1H',
        description: 'Psychic nature is part of the identity and visible to others. May appear otherworldly or mystical.',
        clientDescription: 'Your psychic sensitivity is woven into who you ARE. People see you as mystical, dreamy, or otherworldly. You may seem to fade in and out, or be hard for others to pin down. This is your nature—embrace the mystery.',
        strength: 'strong',
        category: 'angular'
      });
    }
    if (neptuneHouse === 10) {
      indicators.push({
        name: 'Neptune in 10th House',
        symbol: '♆ in 10H',
        description: 'Career and public role involve spirituality, intuition, or artistic/healing work. The mystic path IS the career path.',
        clientDescription: 'You are meant to be publicly known for spiritual, intuitive, or artistic work. Your career path may involve healing, psychic work, art, music, or compassionate service. Don\'t try to fit into a "normal" career—your path is extraordinary.',
        strength: 'strong',
        category: 'angular'
      });
    }
    if (neptuneHouse === 4) {
      indicators.push({
        name: 'Neptune in 4th House',
        symbol: '♆ in 4H',
        description: 'Home and family have mystical undertones. May have grown up with psychic family members or in a spiritually unusual environment.',
        clientDescription: 'Your home life carries a mystical quality. You may have grown up with psychic family members, or in an environment where boundaries were unclear. Create a home that honors your spiritual needs—it\'s your sanctuary.',
        strength: 'moderate',
        category: 'angular'
      });
    }
    if (neptuneHouse === 7) {
      indicators.push({
        name: 'Neptune in 7th House',
        symbol: '♆ in 7H',
        description: 'Psychic sensitivity operates through relationships. May attract spiritual partners or experience idealization/dissolution in partnership.',
        clientDescription: 'Your psychic gifts activate through relationship. You may attract spiritual or artistic partners, or experience unusual psychic bonds. Be careful of idealization—see partners clearly while honoring the mystical connection.',
        strength: 'moderate',
        category: 'angular'
      });
    }
  }
  
  // 10. MOON/NEPTUNE MIDPOINT ACTIVATIONS
  if (moon && neptune) {
    const moonDeg = getAbsoluteDegree(moon);
    const neptuneDeg = getAbsoluteDegree(neptune);
    const midpoint = ((moonDeg + neptuneDeg) / 2) % 360;
    
    // Check if Sun, Ascendant, MC, or Mercury activates this midpoint
    const checkPoints = [
      { name: 'Sun', pos: sun },
      { name: 'Mercury', pos: mercury },
    ];
    
    checkPoints.forEach(point => {
      if (point.pos) {
        const pointDeg = getAbsoluteDegree(point.pos);
        const diff = Math.abs(pointDeg - midpoint);
        const normalizedDiff = diff > 180 ? 360 - diff : diff;
        
        if (normalizedDiff <= 3) {
          indicators.push({
            name: `${point.name} on Moon/Neptune Midpoint`,
            symbol: `${point.name === 'Sun' ? '☉' : '☿'}=☽/♆`,
            description: `${point.name} activates the psychic midpoint. Deep integration of intuitive and conscious awareness.`,
            clientDescription: `Your ${point.name === 'Sun' ? 'core identity' : 'thinking mind'} is directly connected to your psychic sensitivity. You naturally integrate intuition with ${point.name === 'Sun' ? 'who you are' : 'how you think and communicate'}. This is a powerful configuration for channeling or receiving guidance.`,
            strength: 'strong',
            category: 'midpoint'
          });
        }
      }
    });
    
    // Check Ascendant
    if (chart.houseCusps?.house1) {
      const ascDeg = ZODIAC_SIGNS.indexOf(chart.houseCusps.house1.sign) * 30 + chart.houseCusps.house1.degree + (chart.houseCusps.house1.minutes || 0) / 60;
      const diff = Math.abs(ascDeg - midpoint);
      const normalizedDiff = diff > 180 ? 360 - diff : diff;
      
      if (normalizedDiff <= 3) {
        indicators.push({
          name: 'Ascendant on Moon/Neptune Midpoint',
          symbol: 'ASC=☽/♆',
          description: 'The psychic midpoint is how you present to the world. Others immediately sense your intuitive nature.',
          clientDescription: 'People see your psychic sensitivity immediately upon meeting you. You may appear dreamy, mystical, or otherworldly. This configuration makes you a natural channel—information flows through you to others.',
          strength: 'strong',
          category: 'midpoint'
        });
      }
    }
  }
  
  // 11. TRANS-NEPTUNIAN OBJECTS (TNOs) related to psychic gifts
  // Sedna - connection to deep collective trauma and ancestral wisdom
  const sedna = chart.planets.Sedna;
  if (sedna) {
    if (moon && hasAspect(sedna, moon, 0, 5)) {
      indicators.push({
        name: 'Sedna Conjunct Moon',
        symbol: '⯲☌☽',
        description: 'Deep connection to ancestral trauma and feminine wisdom from the collective unconscious.',
        clientDescription: 'You have access to very deep, ancestral knowledge—particularly around feminine suffering and wisdom. You may channel information from the collective unconscious or have past-life recall related to trauma and healing.',
        strength: 'moderate',
        category: 'tno'
      });
    }
  }
  
  // Orcus - underworld guide, death/rebirth
  const orcus = chart.planets.Orcus;
  if (orcus) {
    if (moon && hasAspect(orcus, moon, 0, 5)) {
      indicators.push({
        name: 'Orcus Conjunct Moon',
        symbol: '⯳☌☽',
        description: 'Connection to the underworld through the emotional body. May sense the dying or deceased.',
        clientDescription: 'You have a natural connection to the underworld and the realm of the dead through your emotions. You may sense when someone is dying, or feel the presence of those who have passed. This can make you an excellent death doula or grief counselor.',
        strength: 'moderate',
        category: 'tno'
      });
    }
  }
  
  // Eris - feminine rage and shadow integration
  const eris = chart.planets.Eris;
  if (eris && moon && hasAspect(eris, moon, 0, 5)) {
    indicators.push({
      name: 'Eris Conjunct Moon',
      symbol: '⯰☌☽',
      description: 'Access to shadow feminine wisdom. May channel information about injustice or hidden truths.',
      clientDescription: 'You have a gift for sensing hidden injustices and shadow truths, especially related to feminine power. You may channel information that disrupts comfortable illusions. Use this gift wisely—truth can be uncomfortable.',
      strength: 'subtle',
      category: 'tno'
    });
  }
  
  // 12. GODDESS ASTEROIDS for intuitive gifts
  // Ceres in 12th or Pisces
  const ceres = chart.planets.Ceres;
  if (ceres) {
    const ceresHouse = getPlanetHouse(ceres);
    if (ceresHouse === 12 || ceres.sign === 'Pisces') {
      indicators.push({
        name: 'Ceres in 12th/Pisces',
        symbol: '⚳♓',
        description: 'Nurturing gifts work through the spiritual realm. May channel maternal energy or nurture through intuitive guidance.',
        clientDescription: 'Your nurturing gifts are spiritual in nature. You may intuitively know what others need, or channel maternal/caring energy from beyond. You nurture best through acceptance, spiritual support, and unconditional love.',
        strength: 'subtle',
        category: 'tno'
      });
    }
  }
  
  // Vesta in 12th or 8th (sacred flame keeper)
  const vesta = chart.planets.Vesta;
  if (vesta) {
    const vestaHouse = getPlanetHouse(vesta);
    if (vestaHouse === 12 || vestaHouse === 8) {
      indicators.push({
        name: `Vesta in ${vestaHouse === 12 ? '12th' : '8th'} House`,
        symbol: `⚶ in ${vestaHouse}H`,
        description: `Devotion to spiritual practice and sacred mysteries. The inner flame burns in the realm of the ${vestaHouse === 12 ? 'unconscious' : 'occult'}.`,
        clientDescription: `You have a deep, devoted relationship with spiritual practice. Your sacred flame burns in the ${vestaHouse === 12 ? 'hidden, spiritual realms' : 'mysteries of death, sex, and transformation'}. Solitary spiritual practice feeds your soul.`,
        strength: 'subtle',
        category: 'tno'
      });
    }
  }
  
  // Sort by strength
  const strengthOrder = { strong: 0, moderate: 1, subtle: 2 };
  return indicators.sort((a, b) => strengthOrder[a.strength] - strengthOrder[b.strength]);
};
