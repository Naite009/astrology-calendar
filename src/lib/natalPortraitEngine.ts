/**
 * Natal Portrait Engine — Comprehensive natal chart analysis
 * Produces a structured 12-section report comparable to the Solar Return Birthday Gift
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { getReliableAscendant } from './chartDataValidation';
import { signDegreesToLongitude, getHouseForLongitude } from './houseCalculations';
import { getDecan } from './decans';
import { getSabianSymbol } from './sabianSymbols';
import { detectChartPatterns, ChartPattern } from './chartPatterns';

// ─── Types ──────────────────────────────────────────────────────────

import { calculateNatalDominantPlanets, DominantPlanetsReport } from './dominantPlanetsEngine';

export interface NatalPortrait {
  lifePurpose: LifePurposeSummary;
  topThemes: RankedTheme[];
  relationshipBlueprint: DomainDeepDive;
  careerMoneyMap: DomainDeepDive;
  emotionalArchitecture: DomainDeepDive;
  healthVitality: DomainDeepDive;
  shadowGrowth: DomainDeepDive;
  spiritualKarmic: DomainDeepDive;
  houseEmphasis: HouseEmphasis[];
  powerPortrait: NatalPowerPortrait;
  dominantPlanets: DominantPlanetsReport;
  patterns: ChartPattern[];
  lifetimeWisdom: LifetimeWisdom;
}

export interface LifePurposeSummary {
  sunSign: string;
  moonSign: string;
  risingSign: string;
  sunHouse: number;
  moonHouse: number;
  sunDecan: string;
  moonDecan: string;
  risingDecan: string;
  sunSabian: string;
  moonSabian: string;
  risingSabian: string;
  sect: 'Day' | 'Night';
  coreSynthesis: string;
  identityStatement: string;
  emotionalNeeds: string;
  worldMask: string;
  dominantElement: string;
  dominantModality: string;
  elementBreakdown: Record<string, number>;
  modalityBreakdown: Record<string, number>;
}

export interface RankedTheme {
  rank: number;
  title: string;
  description: string;
  drivers: string[];
  importance: number;
}

export interface DomainDeepDive {
  title: string;
  emoji: string;
  summary: string;
  keyPlanets: DomainPlanet[];
  houseActivations: { house: number; theme: string; planets: string[] }[];
  strengths: string[];
  challenges: string[];
  advice: string;
}

export interface DomainPlanet {
  name: string;
  sign: string;
  house: number;
  isRetrograde: boolean;
  role: string;
}

export interface HouseEmphasis {
  house: number;
  theme: string;
  planets: string[];
  intensity: 'High' | 'Medium' | 'Low' | 'Empty';
  description: string;
}

export interface NatalPowerPortrait {
  driveSource: string;
  driveDrivers: string[];
  sustainStyle: string;
  sustainDrivers: string[];
  burnoutPattern: string;
  burnoutTriggers: string[];
  realignment: string;
  realignmentTools: string[];
  mantra: string;
}

export interface LifetimeWisdom {
  northNodeSign: string;
  northNodeHouse: number;
  southNodeSign: string;
  southNodeHouse: number;
  lifeDirection: string;
  pastLifeGifts: string;
  growthEdge: string;
  saturnSign: string;
  saturnHouse: number;
  saturnLesson: string;
  closingWisdom: string;
}

// ─── Constants ──────────────────────────────────────────────────────

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const ELEMENTS: Record<string, string> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water',
};
const MODALITIES: Record<string, string> = {
  Aries: 'Cardinal', Taurus: 'Fixed', Gemini: 'Mutable', Cancer: 'Cardinal',
  Leo: 'Fixed', Virgo: 'Mutable', Libra: 'Cardinal', Scorpio: 'Fixed',
  Sagittarius: 'Mutable', Capricorn: 'Cardinal', Aquarius: 'Fixed', Pisces: 'Mutable',
};

const SIGN_RULERS: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

const HOUSE_THEMES: Record<number, string> = {
  1: 'Identity & Self-Image',
  2: 'Money, Values & Self-Worth',
  3: 'Communication & Learning',
  4: 'Home, Family & Roots',
  5: 'Creativity, Romance & Joy',
  6: 'Work, Health & Daily Routines',
  7: 'Partnerships & Relationships',
  8: 'Transformation & Shared Resources',
  9: 'Philosophy, Travel & Higher Learning',
  10: 'Career, Public Life & Legacy',
  11: 'Community, Friends & Vision',
  12: 'Spirituality, Dreams & the Unconscious',
};

const MAJOR_PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];

// ─── Sign+House-Aware Role Descriptions ─────────────────────────────
// Every key player role must reference the planet's SIGN flavor and HOUSE life area.

const HOUSE_LIFE_AREA: Record<number, string> = {
  1: 'your identity and how others perceive you',
  2: 'your finances, possessions, and self-worth',
  3: 'your communication style and daily interactions',
  4: 'your home life, family, and emotional foundations',
  5: 'your creativity, romance, and self-expression',
  6: 'your daily routines, health habits, and work environment',
  7: 'your partnerships, marriage, and one-on-one relationships',
  8: 'your shared resources, intimacy, and psychological depths',
  9: 'your beliefs, higher education, and long-distance experiences',
  10: 'your career, public reputation, and legacy',
  11: 'your friendships, community, and future vision',
  12: 'your inner world, solitude, and spiritual life',
};

const SIGN_STYLE: Record<string, string> = {
  Aries: 'with impulsive, action-first energy',
  Taurus: 'with slow, steady, sensory-driven persistence',
  Gemini: 'with curious, mentally restless adaptability',
  Cancer: 'with emotionally protective, nurturing instinct',
  Leo: 'with warm, dramatic, heart-centered confidence',
  Virgo: 'with precise, analytical, service-oriented care',
  Libra: 'with harmony-seeking, aesthetically attuned grace',
  Scorpio: 'with intense, penetrating, all-or-nothing depth',
  Sagittarius: 'with expansive, freedom-loving optimism',
  Capricorn: 'with disciplined, strategic, long-game patience',
  Aquarius: 'with unconventional, independent, future-oriented thinking',
  Pisces: 'with intuitive, compassionate, boundary-dissolving sensitivity',
};

function contextualRole(planetName: string, sign: string, house: number | null, domainHint: string): string {
  const style = SIGN_STYLE[sign] || `through ${sign} energy`;
  const area = house ? HOUSE_LIFE_AREA[house] || `house ${house}` : 'your chart';

  // Health domain
  if (domainHint === 'health') {
    if (planetName === 'Sun') return `Your vitality operates ${style}, and it primarily fuels ${area}`;
    if (planetName === 'Mars') return `Your physical energy and immune response work ${style}, channeled through ${area}`;
    if (planetName === 'Chiron') return `Your vulnerability point lives ${style} in ${area} — healing here transforms your whole body`;
    if (planetName === 'Hygiea') return `Your health awareness pattern is ${style}, focused on ${area}`;
    if (planetName === 'Ceres') return `You nourish yourself ${style}, and your comfort needs center on ${area}`;
  }

  // Relationship domain
  if (domainHint === 'relationship') {
    if (planetName === 'Venus') return `You love and attract ${style}, most active in ${area}`;
    if (planetName === 'Mars') return `You pursue desire ${style}, asserting through ${area}`;
    if (planetName === 'Juno') return `Your committed partnership needs express ${style} in ${area}`;
    if (planetName === 'Eros') return `Your erotic magnetism operates ${style}, activated through ${area}`;
    if (planetName === 'Amor') return `Your unconditional love expresses ${style} in ${area}`;
    if (planetName === 'Lilith') return `Your raw feminine power emerges ${style} through ${area}`;
  }

  // Career domain
  if (domainHint === 'career') {
    if (planetName === 'Sun') return `Your creative leadership shines ${style}, most visible in ${area}`;
    if (planetName === 'Saturn') return `You build mastery ${style}, with your hardest lessons in ${area}`;
    if (planetName === 'Jupiter') return `Opportunity expands ${style}, bringing growth through ${area}`;
    if (planetName === 'Mars') return `Your ambition drives ${style}, channeled into ${area}`;
    if (planetName === 'Pallas') return `Your strategic intelligence works ${style}, applied to ${area}`;
  }

  // Emotional domain
  if (domainHint === 'emotional') {
    if (planetName === 'Moon') return `Your emotional core processes ${style}, most tender around ${area}`;
    if (planetName === 'Neptune') return `Your spiritual sensitivity dissolves boundaries ${style} in ${area}`;
    if (planetName === 'Pluto') return `Your emotional intensity transforms ${style} through ${area}`;
    if (planetName === 'Chiron') return `Your deepest wound lives ${style} in ${area} — and becomes your teaching`;
    if (planetName === 'Ceres') return `Your nurturing instinct expresses ${style}, centered on ${area}`;
  }

  // Shadow domain
  if (domainHint === 'shadow') {
    if (planetName === 'Pluto') return `Your power and compulsions operate ${style}, concentrated in ${area}`;
    if (planetName === 'Saturn') return `Your fear and mastery lesson works ${style} through ${area}`;
    if (planetName === 'Chiron') return `Your wound-to-wisdom path unfolds ${style} in ${area}`;
    if (planetName === 'Lilith') return `Your rejected wildness emerges ${style} through ${area}`;
    if (planetName === 'Nessus') return `Power misuse patterns surface ${style} in ${area}`;
    if (planetName === 'Orcus') return `Your accountability lesson operates ${style} through ${area}`;
  }

  // Spiritual domain
  if (domainHint === 'spiritual') {
    if (planetName === 'Neptune') return `Your spiritual connection opens ${style}, most permeable in ${area}`;
    if (planetName === 'NorthNode') return `Your soul's growth direction points ${style} toward ${area}`;
    if (planetName === 'SouthNode') return `Your past-life gifts operate ${style} through ${area}`;
    if (planetName === 'Chiron') return `Your healing journey unfolds ${style} in ${area}`;
    if (planetName === 'Sedna') return `Your surrender lesson lives ${style} in ${area}`;
    if (planetName === 'Vesta') return `Your sacred devotion burns ${style}, consecrated to ${area}`;
  }

  return `Operates ${style} through ${area}`;
}

const ALL_BODIES = [
  ...MAJOR_PLANETS, 'Chiron','NorthNode','SouthNode','Lilith','PartOfFortune','Vertex',
  'Ceres','Pallas','Juno','Vesta','Psyche','Eros','Amor','Hygiea',
  'Nessus','Pholus','Chariklo','Eris','Sedna','Makemake','Haumea',
  'Quaoar','Orcus','Ixion','Varuna','Gonggong','Salacia',
];

// ─── Helpers ────────────────────────────────────────────────────────

const toAbsDeg = (pos: NatalPlanetPosition): number => {
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return 0;
  return idx * 30 + (pos.degree || 0) + (pos.minutes || 0) / 60;
};

function getPlanetHouseFromChart(chart: NatalChart, planetName: string): number {
  const pos = chart.planets[planetName as keyof typeof chart.planets];
  if (!pos) return 0;
  const absDeg = toAbsDeg(pos);
  if (chart.houseCusps) {
    const h = getHouseForLongitude(absDeg, chart);
    if (h) return h;
  }
  // Whole sign fallback
  const asc = getReliableAscendant(chart);
  if (asc) {
    const ascDeg = toAbsDeg(asc as NatalPlanetPosition);
    return Math.floor(((absDeg - ascDeg + 360) % 360) / 30) + 1;
  }
  return 1;
}

function getBodyData(chart: NatalChart): Array<{ name: string; sign: string; degree: number; house: number; isRetrograde: boolean; absDeg: number }> {
  const result: Array<{ name: string; sign: string; degree: number; house: number; isRetrograde: boolean; absDeg: number }> = [];
  for (const name of ALL_BODIES) {
    const pos = chart.planets[name as keyof typeof chart.planets];
    if (!pos?.sign) continue;
    result.push({
      name,
      sign: pos.sign,
      degree: pos.degree + (pos.minutes || 0) / 60,
      house: getPlanetHouseFromChart(chart, name),
      isRetrograde: pos.isRetrograde || false,
      absDeg: toAbsDeg(pos),
    });
  }
  return result;
}

function countElements(bodies: Array<{ sign: string }>): Record<string, number> {
  const counts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  for (const b of bodies) {
    const el = ELEMENTS[b.sign];
    if (el) counts[el]++;
  }
  return counts;
}

function countModalities(bodies: Array<{ sign: string }>): Record<string, number> {
  const counts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  for (const b of bodies) {
    const m = MODALITIES[b.sign];
    if (m) counts[m]++;
  }
  return counts;
}

function getDominant(counts: Record<string, number>): string {
  let max = 0, dom = '';
  for (const [k, v] of Object.entries(counts)) {
    if (v > max) { max = v; dom = k; }
  }
  return dom;
}

// ─── Identity Descriptions ──────────────────────────────────────────

const SUN_IDENTITY: Record<string, string> = {
  Aries: 'Your core identity is built around courage, initiative, and the need to forge your own path. You feel most alive when starting something new.',
  Taurus: 'Your core identity is built around stability, sensuality, and building lasting value. You need beauty, comfort, and consistency to thrive.',
  Gemini: 'Your core identity is built around curiosity, communication, and connecting ideas. Mental stimulation is oxygen for you.',
  Cancer: 'Your core identity is built around nurturing, emotional security, and belonging. Creating safe spaces for yourself and others is your purpose.',
  Leo: 'Your core identity is built around self-expression, creativity, and being seen. You need to shine authentically and inspire through your unique gifts.',
  Virgo: 'Your core identity is built around service, analysis, and refinement. You find meaning in improving systems and being genuinely useful.',
  Libra: 'Your core identity is built around harmony, partnership, and aesthetic beauty. You thrive when creating balance in relationships and environments.',
  Scorpio: 'Your core identity is built around depth, transformation, and emotional truth. You need intensity, authenticity, and to understand what lies beneath.',
  Sagittarius: 'Your core identity is built around exploration, meaning, and freedom. You need to expand your worldview through travel, study, or philosophical seeking.',
  Capricorn: 'Your core identity is built around achievement, responsibility, and mastery. You earn respect through competence and long-term commitment.',
  Aquarius: 'Your core identity is built around innovation, independence, and serving the collective. You need intellectual freedom and authenticity above all.',
  Pisces: 'Your core identity is built around empathy, creativity, and spiritual connection. You dissolve boundaries to merge with something greater than yourself.',
};

const MOON_NEEDS: Record<string, string> = {
  Aries: 'You feel safe when you can act on impulse, assert yourself, and have autonomy. Stagnation triggers anxiety.',
  Taurus: 'You feel safe with routine, physical comfort, and predictability. You process emotions slowly and thoroughly.',
  Gemini: 'You feel safe when you can talk through feelings, gather information, and stay mentally active. Silence feels uncomfortable.',
  Cancer: 'You feel safe with emotional closeness, familiar surroundings, and being needed. You absorb others\' moods like a sponge.',
  Leo: 'You feel safe when appreciated, seen, and creatively engaged. Emotional neglect or being overlooked cuts deep.',
  Virgo: 'You feel safe when things are organized, useful, and improving. You worry as a way of caring.',
  Libra: 'You feel safe in harmonious relationships and beautiful environments. Conflict and ugliness are deeply disturbing.',
  Scorpio: 'You feel safe through emotional control and deep trust. You need intensity and honesty — surface-level relating feels empty.',
  Sagittarius: 'You feel safe with freedom, optimism, and philosophical perspective. Being confined emotionally triggers restlessness.',
  Capricorn: 'You feel safe through structure, achievement, and emotional self-reliance. You may suppress feelings to maintain control.',
  Aquarius: 'You feel safe through intellectual understanding of emotions. You detach to process and need space to be unconventional.',
  Pisces: 'You feel safe through creative expression, spiritual connection, and compassionate environments. You absorb everything around you.',
};

const RISING_MASK: Record<string, string> = {
  Aries: 'You come across as direct, energetic, and ready for action. People see a fighter and a leader, even when you don\'t feel like one.',
  Taurus: 'You come across as calm, grounded, and reliable. People feel stabilized by your presence and trust your patience.',
  Gemini: 'You come across as curious, adaptable, and social. People are drawn to your wit and conversational range.',
  Cancer: 'You come across as warm, protective, and emotionally aware. People sense they can trust you with vulnerable feelings.',
  Leo: 'You come across as confident, warm, and magnetic. People notice you when you walk into a room.',
  Virgo: 'You come across as thoughtful, competent, and detail-oriented. People rely on your precision and helpfulness.',
  Libra: 'You come across as charming, diplomatic, and aesthetically refined. People feel balanced and at ease around you.',
  Scorpio: 'You come across as intense, perceptive, and private. People sense depth beneath your surface and feel both drawn and cautious.',
  Sagittarius: 'You come across as optimistic, philosophical, and adventurous. People are energized by your enthusiasm and vision.',
  Capricorn: 'You come across as serious, capable, and authoritative. People respect your discipline and assume competence.',
  Aquarius: 'You come across as unique, independent, and intellectually curious. People sense you don\'t follow conventional rules.',
  Pisces: 'You come across as gentle, dreamy, and empathic. People feel your sensitivity and creative imagination.',
};

// ─── Domain Analysis Helpers ────────────────────────────────────────

function buildRelationshipDomain(chart: NatalChart, bodies: ReturnType<typeof getBodyData>): DomainDeepDive {
  const relevantHouses = [5, 7, 8];
  const relevantPlanets = ['Venus', 'Mars', 'Juno', 'Eros', 'Amor', 'Lilith'];
  
  const keyPlanets = bodies.filter(b => relevantPlanets.includes(b.name)).map(b => ({
    name: b.name, sign: b.sign, house: b.house, isRetrograde: b.isRetrograde,
    role: contextualRole(b.name, b.sign, b.house, 'relationship'),
  }));

  const houseActivations = relevantHouses.map(h => ({
    house: h,
    theme: HOUSE_THEMES[h],
    planets: bodies.filter(b => b.house === h).map(b => b.name),
  }));

  const venus = bodies.find(b => b.name === 'Venus');
  const mars = bodies.find(b => b.name === 'Mars');

  return {
    title: 'Relationship Blueprint',
    emoji: '💕',
    summary: `Your relationship style is shaped by Venus in ${venus?.sign || 'unknown'} (how you love) and Mars in ${mars?.sign || 'unknown'} (how you pursue). ${venus?.isRetrograde ? 'Venus retrograde suggests you re-evaluate what you value in love and may attract past-life connections.' : ''} ${mars?.isRetrograde ? 'Mars retrograde means your desire nature works internally first — you strategize before acting.' : ''}`.trim(),
    keyPlanets,
    houseActivations,
    strengths: generateDomainStrengths('relationship', keyPlanets),
    challenges: generateDomainChallenges('relationship', keyPlanets),
    advice: `Focus on the house where Venus sits (House ${venus?.house || '?'}) — that's where love shows up most naturally in your life.`,
  };
}

function buildCareerDomain(chart: NatalChart, bodies: ReturnType<typeof getBodyData>): DomainDeepDive {
  const relevantHouses = [2, 6, 10];
  const relevantPlanets = ['Sun', 'Saturn', 'Jupiter', 'Mars', 'Pallas'];

  const keyPlanets = bodies.filter(b => relevantPlanets.includes(b.name)).map(b => ({
    name: b.name, sign: b.sign, house: b.house, isRetrograde: b.isRetrograde,
    role: contextualRole(b.name, b.sign, b.house, 'career'),
  }));

  const houseActivations = relevantHouses.map(h => ({
    house: h,
    theme: HOUSE_THEMES[h],
    planets: bodies.filter(b => b.house === h).map(b => b.name),
  }));

  const saturn = bodies.find(b => b.name === 'Saturn');
  const mc = chart.houseCusps?.house10;

  return {
    title: 'Career & Money Map',
    emoji: '💼',
    summary: `Saturn in ${saturn?.sign || 'unknown'} (House ${saturn?.house || '?'}) defines your mastery path — what takes years to build but lasts forever. ${mc ? `Your Midheaven in ${mc.sign} points toward ${getMCCareerHint(mc.sign)}.` : ''} ${saturn?.isRetrograde ? 'Saturn retrograde means your authority is earned through internal mastery, not external validation.' : ''}`.trim(),
    keyPlanets,
    houseActivations,
    strengths: generateDomainStrengths('career', keyPlanets),
    challenges: generateDomainChallenges('career', keyPlanets),
    advice: `Your 10th house (public reputation) and 6th house (daily work) tell different stories — align both for career satisfaction.`,
  };
}

function buildEmotionalDomain(chart: NatalChart, bodies: ReturnType<typeof getBodyData>): DomainDeepDive {
  const relevantPlanets = ['Moon', 'Neptune', 'Pluto', 'Chiron', 'Ceres'];

  const keyPlanets = bodies.filter(b => relevantPlanets.includes(b.name)).map(b => ({
    name: b.name, sign: b.sign, house: b.house, isRetrograde: b.isRetrograde,
    role: contextualRole(b.name, b.sign, b.house, 'emotional'),
  }));

  const moon = bodies.find(b => b.name === 'Moon');
  const houseActivations = [4, 8, 12].map(h => ({
    house: h,
    theme: HOUSE_THEMES[h],
    planets: bodies.filter(b => b.house === h).map(b => b.name),
  }));

  return {
    title: 'Emotional Architecture',
    emoji: '🌊',
    summary: `Your Moon in ${moon?.sign || 'unknown'} (House ${moon?.house || '?'}) is your emotional operating system. ${MOON_NEEDS[moon?.sign || ''] || ''} ${moon?.isRetrograde ? '' : ''}`.trim(),
    keyPlanets,
    houseActivations,
    strengths: generateDomainStrengths('emotional', keyPlanets),
    challenges: generateDomainChallenges('emotional', keyPlanets),
    advice: `Honor your Moon sign's needs daily — it's the part of you that determines whether you feel "okay" or not.`,
  };
}

function buildHealthDomain(chart: NatalChart, bodies: ReturnType<typeof getBodyData>): DomainDeepDive {
  const relevantPlanets = ['Mars', 'Chiron', 'Hygiea', 'Ceres', 'Sun'];

  const keyPlanets = bodies.filter(b => relevantPlanets.includes(b.name)).map(b => ({
    name: b.name, sign: b.sign, house: b.house, isRetrograde: b.isRetrograde,
    role: contextualRole(b.name, b.sign, b.house, 'health'),
  }));

  const houseActivations = [1, 6].map(h => ({
    house: h,
    theme: HOUSE_THEMES[h],
    planets: bodies.filter(b => b.house === h).map(b => b.name),
  }));

  const mars = bodies.find(b => b.name === 'Mars');
  return {
    title: 'Health & Vitality',
    emoji: '💪',
    summary: `Mars in ${mars?.sign || 'unknown'} shapes your energy style — ${getMarsFlavor(mars?.sign || '')}. Your 6th house (daily routines) and 1st house (physical body) reveal your health blueprint.`,
    keyPlanets,
    houseActivations,
    strengths: generateDomainStrengths('health', keyPlanets),
    challenges: generateDomainChallenges('health', keyPlanets),
    advice: `Match your exercise style to your Mars sign — it's how your body wants to move.`,
  };
}

function buildShadowDomain(chart: NatalChart, bodies: ReturnType<typeof getBodyData>): DomainDeepDive {
  const relevantPlanets = ['Pluto', 'Saturn', 'Chiron', 'Lilith', 'Nessus', 'Orcus'];

  const keyPlanets = bodies.filter(b => relevantPlanets.includes(b.name)).map(b => ({
    name: b.name, sign: b.sign, house: b.house, isRetrograde: b.isRetrograde,
    role: contextualRole(b.name, b.sign, b.house, 'shadow'),
  }));

  const houseActivations = [8, 12].map(h => ({
    house: h,
    theme: HOUSE_THEMES[h],
    planets: bodies.filter(b => b.house === h).map(b => b.name),
  }));

  const pluto = bodies.find(b => b.name === 'Pluto');
  return {
    title: 'Shadow & Growth Edges',
    emoji: '🌑',
    summary: `Pluto in ${pluto?.sign || 'unknown'} (House ${pluto?.house || '?'}) marks your deepest transformation zone — where you compulsively dig until you find truth. This is where your greatest power hides behind your greatest fear.`,
    keyPlanets,
    houseActivations,
    strengths: generateDomainStrengths('shadow', keyPlanets),
    challenges: generateDomainChallenges('shadow', keyPlanets),
    advice: `Your shadow isn't your enemy — it's the unintegrated part of your power. Meet it with curiosity, not fear.`,
  };
}

function buildSpiritualDomain(chart: NatalChart, bodies: ReturnType<typeof getBodyData>): DomainDeepDive {
  const relevantPlanets = ['Neptune', 'NorthNode', 'SouthNode', 'Chiron', 'Sedna', 'Vesta'];

  const keyPlanets = bodies.filter(b => relevantPlanets.includes(b.name)).map(b => ({
    name: b.name, sign: b.sign, house: b.house, isRetrograde: b.isRetrograde,
    role: contextualRole(b.name, b.sign, b.house, 'spiritual'),
  }));

  const houseActivations = [9, 12].map(h => ({
    house: h,
    theme: HOUSE_THEMES[h],
    planets: bodies.filter(b => b.house === h).map(b => b.name),
  }));

  const nn = bodies.find(b => b.name === 'NorthNode');
  return {
    title: 'Spiritual & Karmic Path',
    emoji: '✨',
    summary: `Your North Node in ${nn?.sign || 'unknown'} (House ${nn?.house || '?'}) is your soul's compass — pointing toward the qualities you're meant to develop this lifetime, even though they feel uncomfortable at first.`,
    keyPlanets,
    houseActivations,
    strengths: generateDomainStrengths('spiritual', keyPlanets),
    challenges: generateDomainChallenges('spiritual', keyPlanets),
    advice: `The South Node shows what comes easily but keeps you small. The North Node shows what's scary but makes you grow. Lean toward the fear.`,
  };
}

// ─── Supporting Helpers ─────────────────────────────────────────────

function getMCCareerHint(sign: string): string {
  const hints: Record<string, string> = {
    Aries: 'entrepreneurship, athletics, or pioneering roles',
    Taurus: 'finance, luxury goods, music, or land/property',
    Gemini: 'writing, teaching, media, or communications',
    Cancer: 'caregiving, real estate, food, or family services',
    Leo: 'entertainment, leadership, creative direction, or education',
    Virgo: 'healthcare, editing, analysis, or service professions',
    Libra: 'law, diplomacy, art, design, or counseling',
    Scorpio: 'psychology, research, finance, or crisis management',
    Sagittarius: 'education, publishing, travel, or philosophy',
    Capricorn: 'management, government, engineering, or tradition',
    Aquarius: 'technology, social causes, innovation, or science',
    Pisces: 'art, healing, spirituality, or compassion-based work',
  };
  return hints[sign] || 'a purpose-driven vocation';
}

function getMarsFlavor(sign: string): string {
  const flavors: Record<string, string> = {
    Aries: 'explosive bursts of energy, needs intense physical activity',
    Taurus: 'slow and steady endurance, prefers routine exercise',
    Gemini: 'needs variety and mental engagement in physical activity',
    Cancer: 'energy fluctuates with emotions, swimming and water activities',
    Leo: 'thrives on performance and group sports, needs to feel impressive',
    Virgo: 'methodical workouts, tracking progress, yoga and precision movement',
    Libra: 'partner activities, dance, aesthetically pleasing environments',
    Scorpio: 'intense, transformative workouts, martial arts, power lifting',
    Sagittarius: 'outdoor adventure, hiking, running, anything expansive',
    Capricorn: 'disciplined training, climbing, long-term fitness goals',
    Aquarius: 'unconventional exercise, tech-assisted, group challenges',
    Pisces: 'swimming, dance, yoga, movement that feels spiritual',
  };
  return flavors[sign] || 'a unique energy expression';
}

function generateDomainStrengths(domain: string, planets: DomainPlanet[]): string[] {
  const strengths: string[] = [];
  for (const p of planets) {
    const el = ELEMENTS[p.sign];
    if (domain === 'relationship') {
      if (p.name === 'Venus' && ['Taurus', 'Libra', 'Pisces'].includes(p.sign)) strengths.push(`Venus in ${p.sign} — natural grace in love, strong aesthetic sense`);
      if (p.name === 'Mars' && ['Aries', 'Scorpio', 'Capricorn'].includes(p.sign)) strengths.push(`Mars in ${p.sign} — powerful, focused desire nature`);
      if (p.name === 'Juno') strengths.push(`Juno in ${p.sign} — clear commitment style and partnership needs`);
    } else if (domain === 'career') {
      if (p.name === 'Saturn' && ['Capricorn', 'Libra', 'Aquarius'].includes(p.sign)) strengths.push(`Saturn in ${p.sign} — natural authority and structural genius`);
      if (p.name === 'Jupiter' && ['Sagittarius', 'Pisces', 'Cancer'].includes(p.sign)) strengths.push(`Jupiter in ${p.sign} — abundant opportunity and expansion`);
    } else if (domain === 'emotional') {
      if (p.name === 'Moon' && ['Cancer', 'Taurus', 'Pisces'].includes(p.sign)) strengths.push(`Moon in ${p.sign} — emotionally fluent and nurturing`);
    } else if (domain === 'health') {
      if (p.name === 'Mars' && el === 'Fire') strengths.push(`Mars in ${p.sign} — strong vitality and quick recovery`);
      if (p.name === 'Hygiea') strengths.push(`Hygiea present — natural health awareness`);
    } else if (domain === 'shadow') {
      if (p.name === 'Pluto') strengths.push(`Pluto in ${p.sign} — regenerative power, ability to transform completely`);
      if (p.name === 'Chiron') strengths.push(`Chiron in ${p.sign} — wounded healer archetype, deep empathy for others' pain`);
    } else if (domain === 'spiritual') {
      if (p.name === 'Neptune') strengths.push(`Neptune in ${p.sign} — spiritual sensitivity and creative imagination`);
      if (p.name === 'NorthNode') strengths.push(`North Node in ${p.sign} — clear soul direction for growth`);
    }
  }
  if (strengths.length === 0) strengths.push('Your unique planetary combination creates a distinctive approach');
  return strengths;
}

function generateDomainChallenges(domain: string, planets: DomainPlanet[]): string[] {
  const challenges: string[] = [];
  for (const p of planets) {
    if (p.isRetrograde) {
      challenges.push(`${p.name} retrograde — this energy works internally first; external expression takes practice`);
    }
    if (domain === 'relationship') {
      if (p.name === 'Venus' && ['Aries', 'Scorpio', 'Virgo'].includes(p.sign)) challenges.push(`Venus in ${p.sign} — may struggle with vulnerability or being too critical in love`);
    } else if (domain === 'career') {
      if (p.name === 'Saturn' && ['Aries', 'Cancer', 'Leo'].includes(p.sign)) challenges.push(`Saturn in ${p.sign} — authority may feel uncomfortable; learning to lead is part of the growth`);
    }
  }
  if (challenges.length === 0) challenges.push('Growth comes through deepening your natural tendencies rather than fighting them');
  return challenges;
}

// ─── Power Portrait ─────────────────────────────────────────────────

function buildPowerPortrait(chart: NatalChart, bodies: ReturnType<typeof getBodyData>): NatalPowerPortrait {
  const mars = bodies.find(b => b.name === 'Mars');
  const sun = bodies.find(b => b.name === 'Sun');
  const moon = bodies.find(b => b.name === 'Moon');
  const saturn = bodies.find(b => b.name === 'Saturn');
  const nn = bodies.find(b => b.name === 'NorthNode');

  const elements = countElements(bodies.filter(b => MAJOR_PLANETS.includes(b.name)));
  const modalities = countModalities(bodies.filter(b => MAJOR_PLANETS.includes(b.name)));
  const domMod = getDominant(modalities);

  return {
    driveSource: mars ? `Mars in ${mars.sign} (House ${mars.house}) — ${getMarsFlavor(mars.sign)}` : 'Mars placement unknown',
    driveDrivers: [
      mars ? `Mars in ${mars.sign}` : '',
      sun ? `Sun in ${sun.sign}` : '',
    ].filter(Boolean),
    sustainStyle: domMod === 'Fixed' ? 'You sustain through stubborn persistence — once committed, nothing shakes you.'
      : domMod === 'Cardinal' ? 'You sustain through starting new phases — momentum is your fuel, but follow-through needs attention.'
      : 'You sustain through adaptation — you keep going by adjusting, not by holding rigid.',
    sustainDrivers: [`Dominant modality: ${domMod}`, saturn ? `Saturn in ${saturn.sign}` : ''].filter(Boolean),
    burnoutPattern: saturn ? `Saturn in ${saturn.sign} (House ${saturn.house}) shows where you over-work, over-control, or deny yourself rest. Your burnout comes from ${saturn.sign === 'Capricorn' ? 'never feeling accomplished enough' : saturn.sign === 'Cancer' ? 'carrying everyone\'s emotional weight' : `taking on too much responsibility in ${HOUSE_THEMES[saturn.house]?.toLowerCase() || 'life'}`}.` : 'Saturn placement reveals your over-work patterns.',
    burnoutTriggers: [saturn ? `Saturn in ${saturn.sign}` : '', '6th house overload'].filter(Boolean),
    realignment: moon ? `Your Moon in ${moon.sign} is your reset button. ${MOON_NEEDS[moon.sign] || ''} When burned out, return to what your Moon needs.` : 'Honor your emotional needs to reset.',
    realignmentTools: [moon ? `Moon in ${moon.sign}` : '', nn ? `North Node in ${nn.sign}` : ''].filter(Boolean),
    mantra: generateMantra(sun?.sign || '', moon?.sign || '', mars?.sign || ''),
  };
}

function generateMantra(sunSign: string, moonSign: string, marsSign: string): string {
  const el = ELEMENTS[sunSign] || 'Fire';
  const mantras: Record<string, string> = {
    Fire: 'I lead with courage and let my light show others the way.',
    Earth: 'I build with patience and trust the process of becoming.',
    Air: 'I connect ideas and people, weaving understanding wherever I go.',
    Water: 'I feel deeply and trust that my sensitivity is my strength.',
  };
  return mantras[el] || 'I honor my unique path and trust my inner compass.';
}

// ─── Top Themes Ranking ─────────────────────────────────────────────

function rankTopThemes(chart: NatalChart, bodies: ReturnType<typeof getBodyData>): RankedTheme[] {
  const themes: Array<{ title: string; score: number; description: string; drivers: string[] }> = [];

  // Count planet density per house
  const houseCounts: Record<number, string[]> = {};
  for (const b of bodies) {
    if (!MAJOR_PLANETS.includes(b.name)) continue;
    if (!houseCounts[b.house]) houseCounts[b.house] = [];
    houseCounts[b.house].push(b.name);
  }

  // Score houses by density
  for (const [hStr, planets] of Object.entries(houseCounts)) {
    const h = parseInt(hStr);
    const score = planets.length * 10 + (([1,4,7,10].includes(h)) ? 5 : 0);
    themes.push({
      title: HOUSE_THEMES[h] || `House ${h}`,
      score,
      description: `${planets.length} planet${planets.length > 1 ? 's' : ''} concentrated in your ${getOrdinal(h)} house — this area demands attention throughout your life.`,
      drivers: planets.map(p => {
        const bd = bodies.find(b => b.name === p);
        return bd ? `${p} in ${bd.sign}` : p;
      }),
    });
  }

  // Add element emphasis
  const elements = countElements(bodies.filter(b => MAJOR_PLANETS.includes(b.name)));
  const domEl = getDominant(elements);
  const missingEls = Object.entries(elements).filter(([, v]) => v === 0).map(([k]) => k);
  if (missingEls.length > 0) {
    themes.push({
      title: `Missing ${missingEls.join(' & ')} Element${missingEls.length > 1 ? 's' : ''}`,
      score: 15,
      description: `You have no planets in ${missingEls.join(' or ')} signs. This doesn't mean weakness — it means you seek these qualities from others or develop them consciously.`,
      drivers: missingEls.map(e => `No ${e} sign placements`),
    });
  }

  // Retrograde emphasis
  const retros = bodies.filter(b => b.isRetrograde && MAJOR_PLANETS.includes(b.name));
  if (retros.length >= 3) {
    themes.push({
      title: 'Strong Inner World (Multiple Retrogrades)',
      score: retros.length * 6,
      description: `${retros.length} personal planets retrograde means much of your life process happens internally. You refine, rethink, and re-do until satisfied.`,
      drivers: retros.map(r => `${r.name} Rx in ${r.sign}`),
    });
  }

  return themes
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((t, i) => ({ ...t, rank: i + 1, importance: t.score }));
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── House Emphasis ─────────────────────────────────────────────────

function buildHouseEmphasis(bodies: ReturnType<typeof getBodyData>): HouseEmphasis[] {
  const majorBodies = bodies.filter(b => MAJOR_PLANETS.includes(b.name));
  
  return Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    const inHouse = majorBodies.filter(b => b.house === h);
    const allInHouse = bodies.filter(b => b.house === h);
    const intensity: HouseEmphasis['intensity'] = inHouse.length >= 3 ? 'High' : inHouse.length >= 1 ? 'Medium' : allInHouse.length > 0 ? 'Low' : 'Empty';
    
    return {
      house: h,
      theme: HOUSE_THEMES[h],
      planets: allInHouse.map(b => b.name),
      intensity,
      description: inHouse.length >= 3 ? `Stellium — major life focus on ${HOUSE_THEMES[h].toLowerCase()}`
        : inHouse.length >= 1 ? `Active — ${inHouse.map(b => b.name).join(', ')} bringing energy here`
        : allInHouse.length > 0 ? `Minor bodies present (${allInHouse.map(b => b.name).join(', ')})`
        : 'No planets — energy flows here through the sign on the cusp',
    };
  });
}

// ─── Lifetime Wisdom ────────────────────────────────────────────────

function buildLifetimeWisdom(chart: NatalChart, bodies: ReturnType<typeof getBodyData>): LifetimeWisdom {
  const nn = bodies.find(b => b.name === 'NorthNode');
  const sn = bodies.find(b => b.name === 'SouthNode');
  const saturn = bodies.find(b => b.name === 'Saturn');

  const nnSign = nn?.sign || 'unknown';
  const snSign = sn?.sign || (nn ? SIGNS[(SIGNS.indexOf(nn.sign) + 6) % 12] : 'unknown');

  const nodeDirections: Record<string, { direction: string; gifts: string; edge: string }> = {
    Aries: { direction: 'Learning to assert yourself, take initiative, and stand alone when necessary', gifts: 'Natural diplomacy, relationship skills, and ability to see others\' perspectives', edge: 'Saying "I want" instead of always asking "What do you want?"' },
    Taurus: { direction: 'Building stability, honoring your body, and creating lasting value', gifts: 'Comfort with intensity, change, and emotional depth', edge: 'Trusting that security doesn\'t mean stagnation' },
    Gemini: { direction: 'Exploring curiosity, communicating ideas, and staying flexible', gifts: 'Big-picture vision, philosophical depth, and teaching ability', edge: 'Getting specific instead of speaking in broad generalizations' },
    Cancer: { direction: 'Creating emotional safety, nurturing, and building a true home', gifts: 'Professional competence, public image mastery, and ambition', edge: 'Letting yourself be vulnerable instead of always being "strong"' },
    Leo: { direction: 'Shining individually, creating, and accepting recognition', gifts: 'Community consciousness, humanitarian vision, and detachment', edge: 'Standing out from the group instead of hiding in the collective' },
    Virgo: { direction: 'Developing practical skills, serving others, and refining your craft', gifts: 'Spiritual sensitivity, artistic imagination, and compassion', edge: 'Getting organized instead of drifting in dreams' },
    Libra: { direction: 'Learning partnership, compromise, and seeing others\' needs', gifts: 'Self-reliance, courage, and pioneering spirit', edge: 'Considering "we" instead of always "me"' },
    Scorpio: { direction: 'Going deep, facing shadows, and transforming through intensity', gifts: 'Stability, comfort, and material security', edge: 'Letting go of what feels safe to find what feels true' },
    Sagittarius: { direction: 'Seeking meaning, exploring philosophy, and expanding your world', gifts: 'Communication skills, adaptability, and intellectual agility', edge: 'Committing to a belief system instead of endlessly gathering data' },
    Capricorn: { direction: 'Building structure, taking responsibility, and leaving a legacy', gifts: 'Emotional intelligence, nurturing instinct, and family bonds', edge: 'Stepping into authority instead of hiding in emotional comfort' },
    Aquarius: { direction: 'Serving the collective, innovating, and honoring your uniqueness', gifts: 'Creative self-expression, personal magnetism, and warmth', edge: 'Thinking about what the group needs, not just your own spotlight' },
    Pisces: { direction: 'Surrendering to something larger, developing faith, and creating art', gifts: 'Analytical precision, work ethic, and practical problem-solving', edge: 'Trusting the unseen instead of only what you can measure' },
  };

  const nodeInfo = nodeDirections[nnSign] || { direction: 'Growing toward your destiny', gifts: 'Innate talents from past experience', edge: 'Moving beyond comfort' };

  const saturnLessons: Record<string, string> = {
    Aries: 'Learning to take action despite fear of being wrong or rejected',
    Taurus: 'Building true security instead of clinging to what\'s familiar',
    Gemini: 'Committing to ideas and following through on communication',
    Cancer: 'Accepting emotional needs as legitimate, not weakness',
    Leo: 'Finding genuine confidence beyond approval-seeking',
    Virgo: 'Accepting imperfection while still striving for excellence',
    Libra: 'Making decisions independently instead of deferring to others',
    Scorpio: 'Trusting others with power and vulnerability',
    Sagittarius: 'Committing to depth over breadth, quality over quantity',
    Capricorn: 'Understanding that success isn\'t just external achievement',
    Aquarius: 'Balancing individuality with genuine community belonging',
    Pisces: 'Setting boundaries while maintaining compassion',
  };

  return {
    northNodeSign: nnSign,
    northNodeHouse: nn?.house || 0,
    southNodeSign: snSign,
    southNodeHouse: sn?.house || (nn ? ((nn.house + 5) % 12 + 1) : 0),
    lifeDirection: nodeInfo.direction,
    pastLifeGifts: nodeInfo.gifts,
    growthEdge: nodeInfo.edge,
    saturnSign: saturn?.sign || 'unknown',
    saturnHouse: saturn?.house || 0,
    saturnLesson: saturnLessons[saturn?.sign || ''] || 'Mastering discipline through patience',
    closingWisdom: `Your chart is a blueprint, not a sentence. Every placement — even the difficult ones — is a tool. The planets don't make you do anything; they show you what you're working with. The question isn't "what will happen to me?" but "how will I use what I've been given?"`,
  };
}

// ─── Main Engine ────────────────────────────────────────────────────

export function generateNatalPortrait(chart: NatalChart): NatalPortrait {
  const bodies = getBodyData(chart);
  const majorBodies = bodies.filter(b => MAJOR_PLANETS.includes(b.name));

  const asc = getReliableAscendant(chart);
  const sun = bodies.find(b => b.name === 'Sun');
  const moon = bodies.find(b => b.name === 'Moon');

  const elements = countElements(majorBodies);
  const modalities = countModalities(majorBodies);

  const sunPos = chart.planets.Sun;
  const moonPos = chart.planets.Moon;

  const sunDecan = sunPos ? getDecan(sunPos.degree, sunPos.sign) : null;
  const moonDecan = moonPos ? getDecan(moonPos.degree, moonPos.sign) : null;
  const risingDecan = asc ? getDecan(asc.degree, asc.sign) : null;

  const sunSabian = sunPos ? getSabianSymbol(sunPos.degree, sunPos.sign) : null;
  const moonSabian = moonPos ? getSabianSymbol(moonPos.degree, moonPos.sign) : null;
  const risingSabian = asc ? getSabianSymbol(asc.degree, asc.sign) : null;

  // Sect: Sun in houses 7-12 = day, 1-6 = night
  const sunHouse = sun?.house || 1;
  const sect: 'Day' | 'Night' = sunHouse >= 7 ? 'Day' : 'Night';

  const lifePurpose: LifePurposeSummary = {
    sunSign: sun?.sign || 'unknown',
    moonSign: moon?.sign || 'unknown',
    risingSign: asc?.sign || 'unknown',
    sunHouse: sun?.house || 0,
    moonHouse: moon?.house || 0,
    sunDecan: sunDecan ? `${sunDecan.number}${sunDecan.number === 1 ? 'st' : sunDecan.number === 2 ? 'nd' : 'rd'} decan (${sunDecan.ruler})` : '',
    moonDecan: moonDecan ? `${moonDecan.number}${moonDecan.number === 1 ? 'st' : moonDecan.number === 2 ? 'nd' : 'rd'} decan (${moonDecan.ruler})` : '',
    risingDecan: risingDecan ? `${risingDecan.number}${risingDecan.number === 1 ? 'st' : risingDecan.number === 2 ? 'nd' : 'rd'} decan (${risingDecan.ruler})` : '',
    sunSabian: sunSabian?.meaning || '',
    moonSabian: moonSabian?.meaning || '',
    risingSabian: risingSabian?.meaning || '',
    sect,
    coreSynthesis: `${SUN_IDENTITY[sun?.sign || ''] || ''}\n\n${MOON_NEEDS[moon?.sign || ''] || ''}\n\n${RISING_MASK[asc?.sign || ''] || ''}`,
    identityStatement: SUN_IDENTITY[sun?.sign || ''] || '',
    emotionalNeeds: MOON_NEEDS[moon?.sign || ''] || '',
    worldMask: RISING_MASK[asc?.sign || ''] || '',
    dominantElement: getDominant(elements),
    dominantModality: getDominant(modalities),
    elementBreakdown: elements,
    modalityBreakdown: modalities,
  };

  return {
    lifePurpose,
    topThemes: rankTopThemes(chart, bodies),
    relationshipBlueprint: buildRelationshipDomain(chart, bodies),
    careerMoneyMap: buildCareerDomain(chart, bodies),
    emotionalArchitecture: buildEmotionalDomain(chart, bodies),
    healthVitality: buildHealthDomain(chart, bodies),
    shadowGrowth: buildShadowDomain(chart, bodies),
    spiritualKarmic: buildSpiritualDomain(chart, bodies),
    houseEmphasis: buildHouseEmphasis(bodies),
    powerPortrait: buildPowerPortrait(chart, bodies),
    dominantPlanets: calculateNatalDominantPlanets(chart),
    patterns: detectChartPatterns(chart),
    lifetimeWisdom: buildLifetimeWisdom(chart, bodies),
  };
}
