import { NatalChart, NatalPlanetPosition, HouseCusp } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';

// ─── helpers ────────────────────────────────────────────────────────
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const PLANETS_CORE = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
const PLANETS_EXTENDED = ['Chiron','Juno','Ceres','Pallas','Vesta','Lilith','Eris'] as const;
const ALL_PLANETS = [...PLANETS_CORE, ...PLANETS_EXTENDED] as const;

const toAbsDeg = (pos: NatalPlanetPosition | HouseCusp | undefined): number | null => {
  if (!pos) return null;
  const idx = SIGNS.indexOf(pos.sign);
  if (idx < 0) return null;
  return idx * 30 + (pos.degree || 0) + ((pos as any).minutes || 0) / 60;
};

// Traditional rulerships (Step 2 requirement)
const traditionalRuler: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Mars',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Saturn', Pisces: 'Jupiter',
};

// Modern rulerships (kept for SR ascendant ruler display)
const signRuler: Record<string, string> = {
  Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
  Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
  Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
};

const houseThemes: Record<number, string> = {
  1: 'Identity, self-image, personal initiative',
  2: 'Finances, values, self-worth, material security',
  3: 'Communication, siblings, short travel, learning',
  4: 'Home, family, roots, emotional foundation',
  5: 'Creativity, romance, children, self-expression',
  6: 'Daily routines, health, service, work habits',
  7: 'Partnerships, marriage, contracts, open enemies',
  8: 'Transformation, shared resources, intimacy, endings',
  9: 'Higher education, travel, philosophy, publishing',
  10: 'Career, public reputation, ambition, authority',
  11: 'Friends, community, hopes, social networks',
  12: 'Spirituality, hidden matters, solitude, endings',
};

// ─── House placement (Step 1 — fixed logic) ─────────────────────────
const findHouseInCusps = (planetDeg: number, cusps: number[]): number | null => {
  if (cusps.length !== 12) return null;
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const end = cusps[(i + 1) % 12];
    if (end > start) {
      if (planetDeg >= start && planetDeg < end) return i + 1;
    } else {
      // wrap-around (e.g. house 12 crossing 0°)
      if (planetDeg >= start || planetDeg < end) return i + 1;
    }
  }
  return 1;
};

const extractCusps = (chart: { houseCusps?: any }): number[] | null => {
  if (!chart.houseCusps) return null;
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const c = chart.houseCusps[`house${i}`];
    if (!c) return null;
    const deg = toAbsDeg(c);
    if (deg === null) return null;
    cusps.push(deg);
  }
  return cusps.length === 12 ? cusps : null;
};

const findNatalHouse = (planetDeg: number, natal: NatalChart): number | null => {
  const cusps = extractCusps(natal);
  return cusps ? findHouseInCusps(planetDeg, cusps) : null;
};

const findSRHouse = (planetDeg: number, srChart: SolarReturnChart): number | null => {
  const cusps = extractCusps(srChart);
  return cusps ? findHouseInCusps(planetDeg, cusps) : null;
};

// ─── Dignity calculation (Step 2) ───────────────────────────────────
const domicileSigns: Record<string, string[]> = {
  Sun: ['Leo'], Moon: ['Cancer'], Mercury: ['Gemini','Virgo'], Venus: ['Taurus','Libra'],
  Mars: ['Aries','Scorpio'], Jupiter: ['Sagittarius','Pisces'], Saturn: ['Capricorn','Aquarius'],
  Uranus: ['Aquarius'], Neptune: ['Pisces'], Pluto: ['Scorpio'],
};
const exaltationSigns: Record<string, string> = {
  Sun: 'Aries', Moon: 'Taurus', Mercury: 'Virgo', Venus: 'Pisces',
  Mars: 'Capricorn', Jupiter: 'Cancer', Saturn: 'Libra',
};
const detrimentSigns: Record<string, string[]> = {
  Sun: ['Aquarius'], Moon: ['Capricorn'], Mercury: ['Sagittarius','Pisces'], Venus: ['Aries','Scorpio'],
  Mars: ['Taurus','Libra'], Jupiter: ['Gemini','Virgo'], Saturn: ['Cancer','Leo'],
};
const fallSigns: Record<string, string> = {
  Sun: 'Libra', Moon: 'Scorpio', Mercury: 'Pisces', Venus: 'Virgo',
  Mars: 'Cancer', Jupiter: 'Capricorn', Saturn: 'Aries',
};

const getDignity = (planet: string, sign: string): string => {
  if (domicileSigns[planet]?.includes(sign)) return 'Domicile';
  if (exaltationSigns[planet] === sign) return 'Exaltation';
  if (detrimentSigns[planet]?.includes(sign)) return 'Detriment';
  if (fallSigns[planet] === sign) return 'Fall';
  return 'Peregrine';
};

// ─── Lord of Year house interpretations (Step 2) ────────────────────
const lordHouseInterps: Record<number, string> = {
  1: "Your core self and natal ruler are in the same place this year — identity, physical presence, and personal reinvention are the central story. How you show up and how others see you is under renovation. You are the project.",
  2: "Your natal ruler is focused on money, self-worth, and material security this year. Income, values, and what you own or build are where your fundamental life force is directed. This is a year to stabilize and increase resources.",
  3: "Your natal ruler is in the house of communication, learning, writing, and local movement. Your mind and your voice are your primary tools this year. Siblings, neighbors, and short travel may play a significant role.",
  4: "Your natal ruler has gone inward — home, family, roots, and the private self are the year's foundation. Real estate, a parent, or your living situation may be central. This is a year of building from the inside out.",
  5: "Your natal ruler is in the house of creativity, romance, pleasure, and children. Joy, self-expression, and love affairs become central to how you experience yourself this year. Create, play, and take risks on your heart.",
  6: "Your natal ruler is focused on work, health, routines, and service. The daily grind becomes meaningful this year — how you show up for work, your physical body, and how you help others defines the year's arc.",
  7: "Your natal ruler has moved into the house of partnership, contracts, and significant others. Relationships — romantic, business, or legal — are where your energy lives this year. Others reflect you back to yourself.",
  8: "Your natal ruler is in the house of transformation, shared resources, and the hidden. This is a year of depth, not surface. Finances tied to others, intimacy, psychological excavation, and major change are in play.",
  9: "Your natal ruler is in the house of expansion, philosophy, higher education, travel, and belief. Your worldview is expanding this year. A long journey — physical or intellectual — is likely the defining experience.",
  10: "Your natal ruler has risen to the most public point in the chart. Career, reputation, authority, and legacy are the year's primary arena. You are visible and your professional identity is actively being shaped.",
  11: "Your natal ruler is in the house of community, future visions, and collective purpose. Friendships, groups, networks, and your hopes for the future define this year. What you want to build for tomorrow matters most.",
  12: "Your natal ruler has withdrawn into the hidden house. This is a year of retreat, spiritual deepening, and processing what is behind the scenes. Rest is not laziness — it is the work. What you release this year matters as much as what you pursue.",
};

// ─── Profection house summaries ─────────────────────────────────────
const profectionHouseSummary: Record<number, string> = {
  1: 'This is a year centered on self, identity, and new beginnings.',
  2: 'This is a year centered on finances, values, and self-worth.',
  3: 'This is a year centered on communication, learning, and local connections.',
  4: 'This is a year centered on home, family, and emotional roots.',
  5: 'This is a year centered on creativity, romance, and self-expression.',
  6: 'This is a year centered on health, daily work, and routines.',
  7: 'This is a year centered on partnerships, relationships, and contracts.',
  8: 'This is a year centered on transformation, shared resources, and depth.',
  9: 'This is a year centered on travel, higher learning, and expanding your worldview.',
  10: 'This is a year centered on career, public reputation, and ambition.',
  11: 'This is a year centered on community, friendships, and future visions.',
  12: 'This is a year centered on rest, spirituality, and inner processing.',
};

// ─── Aspect detection ───────────────────────────────────────────────
interface Aspect {
  planet1: string;
  planet1Source: 'SR' | 'Natal';
  planet2: string;
  planet2Source: 'SR' | 'Natal';
  type: string;
  orb: number;
  exact: number;
}

const ASPECT_ANGLES = [
  { name: 'Conjunction', angle: 0, orb: 8 },
  { name: 'Opposition', angle: 180, orb: 8 },
  { name: 'Trine', angle: 120, orb: 7 },
  { name: 'Square', angle: 90, orb: 7 },
  { name: 'Sextile', angle: 60, orb: 5 },
  { name: 'Quincunx', angle: 150, orb: 3 },
];

const detectAspect = (deg1: number, deg2: number): { type: string; orb: number } | null => {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  for (const a of ASPECT_ANGLES) {
    const orb = Math.abs(diff - a.angle);
    if (orb <= a.orb) return { type: a.name, orb: Math.round(orb * 10) / 10 };
  }
  return null;
};

// ─── Main Analysis types ────────────────────────────────────────────

export interface SRYearlyTheme {
  ascendantSign: string;
  ascendantRuler: string;
  ascendantRulerSign: string;
  ascendantRulerHouse: number | null;
  yearTheme: string;
}

export interface SRAscRulerInNatal {
  /** The SR Ascendant sign */
  srAscSign: string;
  /** The ruler planet of the SR Ascendant */
  rulerPlanet: string;
  /** Where that planet sits in the SR chart (sign) */
  rulerSRSign: string;
  /** Where that planet sits in the SR chart (house) */
  rulerSRHouse: number | null;
  /** Where that planet sits in the NATAL chart (sign) — e.g. Neptune in Scorpio */
  rulerNatalSign: string;
  /** Where that planet sits in the NATAL chart (house) — the key insight */
  rulerNatalHouse: number | null;
  /** Natal house theme */
  rulerNatalHouseTheme: string;
  /** Narrative interpretation */
  interpretation: string;
}

export interface SRHouseOverlay {
  planet: string;
  srSign: string;
  srDegree: string;
  srHouse: number | null;
  srHouseTheme: string;
  natalHouse: number | null;
  houseTheme: string;
}

export interface SRKeyAspect extends Aspect {
  interpretation: string;
}

export interface SRMoonPhase {
  phase: string;
  description: string;
  isEclipse: boolean;
}

export interface SRStellium {
  location: string;
  locationType: 'sign' | 'house';
  planets: string[];
  extras: string[]; // non-planet bodies also in this sign/house
  interpretation: string;
  signMeaning: string;
  blendMeaning: string;
}

export interface SRElementBalance {
  fire: number; earth: number; air: number; water: number;
  firePlanets: string[]; earthPlanets: string[]; airPlanets: string[]; waterPlanets: string[];
  dominant: string;
  missing: string[];
  interpretation: string;
}

export interface SRModalityBalance {
  cardinal: number; fixed: number; mutable: number;
  cardinalPlanets: string[]; fixedPlanets: string[]; mutablePlanets: string[];
  dominant: string;
  interpretation: string;
}

export interface SRRetrogradeReport {
  planets: string[];
  count: number;
  interpretation: string;
}

export interface SRRepeatedTheme {
  description: string;
  significance: string;
}

export interface SRHemisphericEmphasis {
  upper: number; lower: number;
  east: number; west: number;
  interpretation: string;
}

export interface SRSaturnFocus {
  sign: string;
  house: number | null;
  natalHouse: number | null;
  isRetrograde: boolean;
  interpretation: string;
}

export interface SRNodesFocus {
  sign: string;
  house: number | null;
  interpretation: string;
}

export interface SolarReturnAnalysis {
  yearlyTheme: SRYearlyTheme | null;
  srAscRulerInNatal: SRAscRulerInNatal | null;
  sunHouse: { house: number | null; theme: string };
  sunNatalHouse: { house: number | null; theme: string };
  moonSign: string;
  moonHouse: { house: number | null; theme: string };
  moonNatalHouse: { house: number | null; theme: string };
  houseOverlays: SRHouseOverlay[];
  srToNatalAspects: SRKeyAspect[];
  srInternalAspects: SRKeyAspect[];
  angularPlanets: string[];
  relocationTip: string;
  lordOfTheYear: {
    planet: string;
    natalRisingSign: string;
    srHouse: number | null;
    srSign: string;
    srDegree: string;
    isRetrograde: boolean;
    dignity: string;
    interpretation: string;
  } | null;
  profectionYear: {
    age: number;
    houseNumber: number;
    timeLord: string;
    timeLordSRHouse: number | null;
    timeLordSRSign: string;
    overlap: boolean;
    interpretation: string;
  } | null;
  // New deep analysis sections
  moonPhase: SRMoonPhase | null;
  stelliums: SRStellium[];
  elementBalance: SRElementBalance;
  modalityBalance: SRModalityBalance;
  retrogrades: SRRetrogradeReport;
  repeatedThemes: SRRepeatedTheme[];
  hemisphericEmphasis: SRHemisphericEmphasis | null;
  saturnFocus: SRSaturnFocus | null;
  nodesFocus: SRNodesFocus | null;
  /** Where the SR Ascendant degree falls in the natal chart houses (Lynn Bell technique) */
  srAscInNatalHouse: {
    natalHouse: number;
    natalHouseTheme: string;
    interpretation: string;
  } | null;
  /** SR planets within 2° of natal planet degrees — "conduit" connections (Lynn Bell) */
  natalDegreeConduits: {
    srPlanet: string;
    natalPlanet: string;
    srSign: string;
    degree: string;
    orb: number;
    interpretation: string;
  }[];
  /** Moon timing: key aspects the SR Moon will perfect during the year (1°/month) */
  moonTimingEvents: {
    targetPlanet: string;
    aspectType: string;
    monthsFromBirthday: number;
    interpretation: string;
  }[];
  // Helper: map planet name → SR house for display
  planetSRHouses: Record<string, number | null>;
}

const aspectMeaning = (p1: string, p2: string, type: string): string => {
  const action = type === 'Conjunction' ? 'merges with' : type === 'Opposition' ? 'opposes' : type === 'Trine' ? 'flows with' : type === 'Square' ? 'challenges' : type === 'Sextile' ? 'supports' : 'adjusts to';
  return `SR ${p1} ${action} Natal ${p2} — activating themes of both planets this year.`;
};

const internalAspectMeaning = (p1: string, p2: string, type: string): string => {
  const action = type === 'Conjunction' ? 'unites with' : type === 'Opposition' ? 'creates tension with' : type === 'Trine' ? 'harmonizes with' : type === 'Square' ? 'creates friction with' : type === 'Sextile' ? 'cooperates with' : 'requires adjustment with';
  return `${p1} ${action} ${p2} — a key dynamic shaping your year.`;
};

// ─── Stellium interpretation helpers ────────────────────────────────

const signStelliumMeanings: Record<string, string> = {
  Aries: 'An Aries stellium makes this a year of fierce independence, initiative, and courage. You are the pioneer — impatient with delay, ready to fight for what matters. The danger is burnout from constant forward motion. Channel this fire into ONE major initiative rather than scattering it.',
  Taurus: 'A Taurus stellium grounds the year in material reality — money, comfort, beauty, and physical pleasure are central. You are building something lasting and tangible. Stubbornness is both your strength and your trap. Slow, steady effort produces permanent results.',
  Gemini: 'A Gemini stellium creates a year of mental hyperactivity — ideas, conversations, writing, and learning are everywhere. You are collecting information, making connections, and communicating constantly. The risk is superficiality; the gift is versatility and adaptability.',
  Cancer: 'A Cancer stellium makes this a deeply emotional, family-centered year. Home, mother figures, nurturing, and emotional security are the dominant themes. You feel everything more intensely. Creating a safe emotional harbor is both the work and the reward.',
  Leo: 'A Leo stellium infuses the year with creative fire, self-expression, and a desire for recognition. You want to shine, create, love, and be seen. Generosity flows naturally but so does ego. The year asks: can you radiate without needing applause?',
  Virgo: 'A Virgo stellium creates a year focused on improvement, analysis, health, and service. You are fixing, organizing, and refining every area of your life. Perfectionism is the shadow — "good enough" is the lesson. Your body\'s needs demand attention.',
  Libra: 'A Libra stellium makes relationships, beauty, justice, and harmony the year\'s central concerns. You are constantly weighing options, seeking balance, and navigating partnerships. The danger is indecision or people-pleasing. The gift is diplomacy, grace, and genuine collaboration.',
  Scorpio: 'A Scorpio stellium brings a year of intensity, transformation, and depth. Surface-level living is impossible — you are drawn to hidden truths, power dynamics, and psychological excavation. Trust is earned slowly. What dies this year needed to die.',
  Sagittarius: 'A Sagittarius stellium creates an expansive year of travel, philosophy, education, and truth-seeking. You want MORE — more experience, more understanding, more freedom. The risk is overextension or dogmatism. The gift is wisdom earned through direct experience.',
  Capricorn: 'A Capricorn stellium makes this a year of ambition, structure, responsibility, and building for the long term. You are climbing — career, status, or personal mastery. The weight is real but so is the endurance. Discipline is your superpower; rigidity is the trap.',
  Aquarius: 'An Aquarius stellium brings a year of innovation, community, and unconventional thinking. You are questioning everything — systems, traditions, your own assumptions. The group matters more than the individual. Genius and eccentricity walk the same line.',
  Pisces: 'A Pisces stellium creates a year of spiritual depth, artistic inspiration, and emotional sensitivity. Boundaries dissolve — between you and others, between reality and imagination. The gift is compassion and creativity; the danger is escapism and confusion.',
};

const planetKeywords: Record<string, { energy: string; domain: string }> = {
  Sun: { energy: 'vitality, identity, purpose', domain: 'the core self' },
  Moon: { energy: 'emotion, instinct, needs', domain: 'the emotional body' },
  Mercury: { energy: 'thought, communication, analysis', domain: 'the mind' },
  Venus: { energy: 'love, beauty, pleasure, values', domain: 'relationships and aesthetics' },
  Mars: { energy: 'drive, aggression, action, desire', domain: 'willpower and assertion' },
  Jupiter: { energy: 'expansion, optimism, abundance', domain: 'growth and opportunity' },
  Saturn: { energy: 'discipline, limitation, responsibility', domain: 'structure and maturity' },
  Uranus: { energy: 'disruption, freedom, innovation', domain: 'sudden change and awakening' },
  Neptune: { energy: 'dissolution, imagination, spirituality', domain: 'transcendence and illusion' },
  Pluto: { energy: 'transformation, power, death/rebirth', domain: 'deep psychological change' },
};

const getSignStelliumMeaning = (sign: string): string => signStelliumMeanings[sign] || '';

const getStelliumBlendMeaning = (planets: string[]): string => {
  const sorted = [...planets].sort((a, b) => {
    const order = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'];
    return order.indexOf(a) - order.indexOf(b);
  });

  // Check for specific meaningful combinations
  const has = (p: string) => sorted.includes(p);
  const parts: string[] = [];

  if (has('Sun') && has('Moon')) {
    parts.push('Sun-Moon together means your conscious identity and emotional instincts are ALIGNED — there is no internal conflict between what you want and what you need. This creates powerful focus but can also create blind spots (no one is challenging your assumptions from within).');
  }
  if (has('Sun') && has('Venus')) {
    parts.push('Sun-Venus together draws love, beauty, and social pleasure toward your core identity. You attract others naturally this year. Creativity, romance, and aesthetic refinement are inseparable from who you are.');
  }
  if (has('Sun') && has('Mars')) {
    parts.push('Sun-Mars together creates forceful, assertive energy — you are driven to ACT on your identity. This is a year of courage, competition, and potentially conflict. You cannot stay passive; your life force demands direct expression.');
  }
  if (has('Moon') && has('Venus')) {
    parts.push('Moon-Venus together creates emotional warmth, a need for beauty and comfort, and deepened relationships. Your feelings and your values are in sync — what feels good IS good for you this year. Nurturing through beauty and love.');
  }
  if (has('Moon') && has('Mars')) {
    parts.push('Moon-Mars together creates emotional volatility and passionate instincts. You react first, think later. Anger and emotional needs are tangled together. Physical activity channels this intensity productively.');
  }
  if (has('Venus') && has('Mars')) {
    parts.push('Venus-Mars together is the classic attraction combination — passion, desire, and creative/sexual energy are heightened. Relationships are charged. You pursue what you want with both charm and force.');
  }
  if (has('Sun') && has('Pluto')) {
    parts.push('Sun-Pluto together brings transformation to your very identity. This is not a gentle year — you are being remade at a fundamental level. Power dynamics, psychological depth, and letting go of who you used to be are central.');
  }
  if (has('Mars') && has('Pluto')) {
    parts.push('Mars-Pluto together is the most intense drive combination — willpower is extreme, ambition is relentless, and the potential for power struggles is high. Channel this into purposeful transformation, not control.');
  }
  if (has('Jupiter') && has('Saturn')) {
    parts.push('Jupiter-Saturn together balances expansion with discipline — growth is structured and sustainable rather than reckless. You are building something that lasts. Ambition meets realism.');
  }
  if (has('Saturn') && has('Pluto')) {
    parts.push('Saturn-Pluto together brings heavy restructuring — old systems break down to be rebuilt stronger. This can feel crushing but produces lasting transformation. Endurance through difficulty.');
  }
  if (has('Mercury') && has('Venus')) {
    parts.push('Mercury-Venus together brings charm to communication — your words are diplomatic, artistic, and socially effective. Writing, speaking, and negotiating are enhanced by grace and aesthetic sense.');
  }

  if (parts.length === 0) {
    // Generic blend based on planet energies
    const energies = sorted.map(p => planetKeywords[p]?.energy || p).join(', ');
    return `This combination brings together ${energies}. When these forces share the same sign, they amplify each other — the year\'s dominant themes carry the combined weight of all these planetary functions operating in concert.`;
  }

  return parts.join('\n\n');
};

const generateStelliumInterpretation = (location: string, planets: string[], type: 'sign' | 'house', houseNum?: number): string => {
  const planetList = planets.join(', ');
  if (type === 'sign') {
    return `A true stellium of ${planets.length} planets (${planetList}) concentrated in ${location}. This is not a casual emphasis — when three or more planets share a sign, that sign\'s energy becomes the dominant frequency of the entire year. Every area of life touched by these planets is filtered through ${location} qualities.`;
  } else {
    const theme = houseNum ? (houseThemes[houseNum] || '') : '';
    return `A stellium of ${planets.length} planets (${planetList}) in ${location}. This house becomes the primary arena of your year — ${theme.toLowerCase()}. With this much planetary energy concentrated here, events and inner development in this life area are unavoidable and transformative.`;
  }
};

// ─── Main Analysis ──────────────────────────────────────────────────

export const analyzeSolarReturn = (
  srChart: SolarReturnChart,
  natalChart: NatalChart
): SolarReturnAnalysis => {

  // Build planet → SR house map for reuse
  const planetSRHouses: Record<string, number | null> = {};
  for (const planet of [...ALL_PLANETS, 'Ascendant', 'NorthNode'] as const) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) { planetSRHouses[planet] = null; continue; }
    const deg = toAbsDeg(pos);
    planetSRHouses[planet] = deg !== null ? findSRHouse(deg, srChart) : null;
  }

  // 1. Yearly Theme from SR Ascendant
  let yearlyTheme: SRYearlyTheme | null = null;
  const srAsc = srChart.houseCusps?.house1 || srChart.planets.Ascendant;
  if (srAsc) {
    const ruler = signRuler[srAsc.sign] || 'Unknown';
    const rulerPos = srChart.planets[ruler as keyof typeof srChart.planets];
    const rulerSign = rulerPos?.sign || 'Unknown';
    const rulerHouse = planetSRHouses[ruler] ?? null;

    const themeDesc = `Your year is colored by ${srAsc.sign} Rising — ruled by ${ruler} in ${rulerSign}${rulerHouse ? ` (SR ${rulerHouse}th house)` : ''}. This sets the tone for how you approach the entire year.`;
    yearlyTheme = {
      ascendantSign: srAsc.sign,
      ascendantRuler: ruler,
      ascendantRulerSign: rulerSign,
      ascendantRulerHouse: rulerHouse,
      yearTheme: themeDesc,
    };
  }

  // 1b. SR Ascendant Ruler in NATAL houses (J-B Morin / Mel Priestley technique)
  // The SR Ascendant ruler's position in the natal chart shows WHERE in your life
  // the year's themes will play out most strongly.
  let srAscRulerInNatal: SRAscRulerInNatal | null = null;
  if (yearlyTheme && srAsc) {
    const ruler = yearlyTheme.ascendantRuler;
    const rulerSRPos = srChart.planets[ruler as keyof typeof srChart.planets];
    // CORRECT TECHNIQUE (J-B Morin / Lynn Bell): Find where the ruler sits in the NATAL chart,
    // not where the SR version overlays onto natal houses. E.g., SR Asc = Pisces → ruler = Neptune →
    // look at where NATAL Neptune sits → that natal house is where the year's energy plays out.
    const rulerNatalPos = natalChart.planets[ruler as keyof typeof natalChart.planets];
    if (rulerSRPos) {
      const natalDeg = rulerNatalPos ? toAbsDeg(rulerNatalPos) : null;
      const rulerNatalHouse = natalDeg !== null ? findNatalHouse(natalDeg, natalChart) : null;
      const rulerSRHouse = planetSRHouses[ruler] ?? null;
      const natalTheme = rulerNatalHouse ? (houseThemes[rulerNatalHouse] || '') : '';

      const srAscRulerNatalHouseInterps: Record<number, string> = {
        1: `${ruler} rules your SR Ascendant and lands in your natal 1st house — this year's energy flows directly into your identity, appearance, and how you present yourself. You ARE the project. The way you carry yourself and the first impression you make are where the year's story lives.`,
        2: `${ruler} rules your SR Ascendant and lands in your natal 2nd house — this year's energy flows into your money, possessions, and self-worth. How you earn, spend, and value yourself is where the year's themes play out. Building material security or reassessing what you truly value becomes central.`,
        3: `${ruler} rules your SR Ascendant and lands in your natal 3rd house — this year's energy flows into communication, learning, writing, and your immediate environment. Siblings, neighbors, short trips, and how you process and share information become the stage for the year's main themes.`,
        4: `${ruler} rules your SR Ascendant and lands in your natal 4th house — this year's energy flows into home, family, roots, and your private inner world. Your living situation, a parent, or your emotional foundation is where the year's story unfolds. Building from the inside out.`,
        5: `${ruler} rules your SR Ascendant and lands in your natal 5th house — this year's energy flows into creativity, romance, children, and self-expression. Joy, play, and putting your authentic stamp on the world is where the year's themes come alive. Follow what excites you.`,
        6: `${ruler} rules your SR Ascendant and lands in your natal 6th house — this year's energy flows into daily routines, health, work habits, and service. How you show up every day — your body, your job, your rituals — is where the year's story plays out. Small, consistent improvements create big change.`,
        7: `${ruler} rules your SR Ascendant and lands in your natal 7th house — this year's energy flows into partnerships, marriage, contracts, and one-on-one relationships. Another person — romantic, business, or even an adversary — is central to how the year's themes manifest.`,
        8: `${ruler} rules your SR Ascendant and lands in your natal 8th house — this year's energy flows into transformation, shared resources, intimacy, and psychological depth. Joint finances, power dynamics, and letting go of what no longer serves you is where the year's story lives.`,
        9: `${ruler} rules your SR Ascendant and lands in your natal 9th house — this year's energy flows into travel, higher education, philosophy, and expanding your worldview. A journey — physical or intellectual — is where the year's themes play out. Your beliefs are evolving.`,
        10: `${ruler} rules your SR Ascendant and lands in your natal 10th house — this year's energy flows into career, public reputation, and your legacy. Professional ambition and how the world sees you is where the year's story unfolds. You are building something visible.`,
        11: `${ruler} rules your SR Ascendant and lands in your natal 11th house — this year's energy flows into community, friendships, networks, and your vision for the future. Groups, social causes, and your hopes and dreams are where the year's themes manifest.`,
        12: `${ruler} rules your SR Ascendant and lands in your natal 12th house — this year's energy flows into solitude, spirituality, hidden matters, and inner processing. What happens behind the scenes, in dreams, or in retreat is where the year's story lives. Rest is productive work.`,
      };

      const interpretation = rulerNatalHouse
        ? (srAscRulerNatalHouseInterps[rulerNatalHouse] || `${ruler} rules your SR Ascendant and falls in your natal ${rulerNatalHouse}th house — the year's themes play out through ${natalTheme.toLowerCase()}.`)
        : `${ruler} rules your SR Ascendant. Add house cusps to your natal chart to see which area of your life this year's energy flows into.`;

      srAscRulerInNatal = {
        srAscSign: srAsc.sign,
        rulerPlanet: ruler,
        rulerSRSign: rulerSRPos.sign,
        rulerSRHouse,
        rulerNatalSign: rulerNatalPos?.sign || '',
        rulerNatalHouse,
        rulerNatalHouseTheme: natalTheme,
        interpretation,
      };
    }
  }

  // 2. Sun — SR house (primary) + natal overlay
  const sunPos = srChart.planets.Sun;
  let sunHouse: { house: number | null; theme: string } = { house: null, theme: '' };
  let sunNatalHouse: { house: number | null; theme: string } = { house: null, theme: '' };
  if (sunPos) {
    const deg = toAbsDeg(sunPos);
    if (deg !== null) {
      const sh = findSRHouse(deg, srChart);
      sunHouse = { house: sh, theme: sh ? houseThemes[sh] : '' };
      const nh = findNatalHouse(deg, natalChart);
      sunNatalHouse = { house: nh, theme: nh ? houseThemes[nh] : '' };
    }
  }

  // 3. Moon — SR house (primary) + natal overlay
  const moonPos = srChart.planets.Moon;
  const moonSign = moonPos?.sign || 'Unknown';
  let moonHouse: { house: number | null; theme: string } = { house: null, theme: '' };
  let moonNatalHouse: { house: number | null; theme: string } = { house: null, theme: '' };
  if (moonPos) {
    const deg = toAbsDeg(moonPos);
    if (deg !== null) {
      const sh = findSRHouse(deg, srChart);
      moonHouse = { house: sh, theme: sh ? houseThemes[sh] : '' };
      const nh = findNatalHouse(deg, natalChart);
      moonNatalHouse = { house: nh, theme: nh ? houseThemes[nh] : '' };
    }
  }

  // 4. House overlays — SR planets in both SR houses and natal houses
  const houseOverlays: SRHouseOverlay[] = [];
  for (const planet of ALL_PLANETS) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    const deg = toAbsDeg(pos);
    if (deg === null) continue;
    const sh = findSRHouse(deg, srChart);
    const nh = findNatalHouse(deg, natalChart);
    houseOverlays.push({
      planet,
      srSign: pos.sign,
      srDegree: `${pos.degree}°${pos.minutes || 0}'`,
      srHouse: sh,
      srHouseTheme: sh ? houseThemes[sh] : '',
      natalHouse: nh,
      houseTheme: nh ? houseThemes[nh] : '',
    });
  }

  // 5. SR-to-Natal aspects
  const srToNatalAspects: SRKeyAspect[] = [];
  for (const srPlanet of ALL_PLANETS) {
    const srPos = srChart.planets[srPlanet as keyof typeof srChart.planets];
    if (!srPos) continue;
    const srDeg = toAbsDeg(srPos);
    if (srDeg === null) continue;

    for (const natPlanet of [...ALL_PLANETS, 'Ascendant' as const, 'NorthNode' as const]) {
      const natPos = natalChart.planets[natPlanet as keyof typeof natalChart.planets];
      if (!natPos) continue;
      const natDeg = toAbsDeg(natPos);
      if (natDeg === null) continue;
      
      const asp = detectAspect(srDeg, natDeg);
      if (asp) {
        srToNatalAspects.push({
          planet1: srPlanet, planet1Source: 'SR',
          planet2: natPlanet, planet2Source: 'Natal',
          type: asp.type, orb: asp.orb, exact: 0,
          interpretation: aspectMeaning(srPlanet, natPlanet, asp.type),
        });
      }
    }
  }
  srToNatalAspects.sort((a, b) => a.orb - b.orb);

  // 6. SR internal aspects
  const srInternalAspects: SRKeyAspect[] = [];
  for (let i = 0; i < ALL_PLANETS.length; i++) {
    for (let j = i + 1; j < ALL_PLANETS.length; j++) {
      const p1 = ALL_PLANETS[i];
      const p2 = ALL_PLANETS[j];
      const pos1 = srChart.planets[p1 as keyof typeof srChart.planets];
      const pos2 = srChart.planets[p2 as keyof typeof srChart.planets];
      if (!pos1 || !pos2) continue;
      const d1 = toAbsDeg(pos1);
      const d2 = toAbsDeg(pos2);
      if (d1 === null || d2 === null) continue;
      const asp = detectAspect(d1, d2);
      if (asp) {
        srInternalAspects.push({
          planet1: p1, planet1Source: 'SR',
          planet2: p2, planet2Source: 'SR',
          type: asp.type, orb: asp.orb, exact: 0,
          interpretation: internalAspectMeaning(p1, p2, asp.type),
        });
      }
    }
  }
  srInternalAspects.sort((a, b) => a.orb - b.orb);

  // 7. Angular planets (within 8° of SR 1st/10th cusp)
  const angularPlanets: string[] = [];
  const angles = [srChart.houseCusps?.house1, srChart.houseCusps?.house10];
  for (const angle of angles) {
    if (!angle) continue;
    const angleDeg = toAbsDeg(angle);
    if (angleDeg === null) continue;
    for (const planet of ALL_PLANETS) {
      const pos = srChart.planets[planet as keyof typeof srChart.planets];
      if (!pos) continue;
      const pDeg = toAbsDeg(pos);
      if (pDeg === null) continue;
      let diff = Math.abs(pDeg - angleDeg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= 8) {
        angularPlanets.push(planet);
      }
    }
  }

  // 8. Relocation tip
  const relocationTip = `The Solar Return Ascendant changes based on WHERE you are at your exact solar return moment. By traveling to a different location on your birthday, you can shift which sign rises — and therefore which house your SR planets fall in. This is called "Solar Return relocation." Key strategy: Choose a location where benefic planets (Venus, Jupiter) fall on the SR Ascendant or MC for a more supportive year.`;

  // 9. Lord of the Year (Step 2)
  // Read natal ascendant sign — houseCusps.house1 is the DEFINITIVE source
  // planets.Ascendant may contain the ecliptic longitude expressed as Aries-based degrees (wrong sign)
  let lordOfTheYear: SolarReturnAnalysis['lordOfTheYear'] = null;
  const natalAscCusp = natalChart.houseCusps?.house1;
  const natalAscPlanet = natalChart.planets.Ascendant;
  const natalRisingSign: string | null =
    (natalAscCusp && (natalAscCusp as any).sign && SIGNS.includes((natalAscCusp as any).sign)) ? (natalAscCusp as any).sign :
    (natalAscPlanet?.sign && SIGNS.includes(natalAscPlanet.sign)) ? natalAscPlanet.sign :
    null;

  if (natalRisingSign) {
    const lordPlanet = traditionalRuler[natalRisingSign];
    if (lordPlanet) {
      const lordPos = srChart.planets[lordPlanet as keyof typeof srChart.planets];
      if (lordPos) {
        const lordDeg = toAbsDeg(lordPos);
        const lordSRHouse = lordDeg !== null ? findSRHouse(lordDeg, srChart) : null;
        const dignity = getDignity(lordPlanet, lordPos.sign);
        const interp = lordSRHouse ? (lordHouseInterps[lordSRHouse] || '') : '';
        lordOfTheYear = {
          planet: lordPlanet,
          natalRisingSign,
          srHouse: lordSRHouse,
          srSign: lordPos.sign,
          srDegree: `${lordPos.degree}°${(lordPos as any).minutes || 0}'`,
          isRetrograde: !!(lordPos as any).isRetrograde,
          dignity,
          interpretation: interp,
        };
      }
    }
  }

  // 10. Annual Profection (Step 3)
  let profectionYear: SolarReturnAnalysis['profectionYear'] = null;
  if (natalChart.birthDate && srChart.solarReturnYear) {
    const birthYear = parseInt(natalChart.birthDate.slice(0, 4), 10);
    if (!isNaN(birthYear)) {
      const age = srChart.solarReturnYear - birthYear;
      const houseNumber = (age % 12) + 1; // age 0 → house 1, age 12 → house 1, etc.
      
      // Find the sign on the natal house cusp for this profection house
      const natalCuspKey = `house${houseNumber}`;
      const natalCusp = natalChart.houseCusps?.[natalCuspKey as keyof typeof natalChart.houseCusps];
      let timeLord = '';
      let timeLordSRHouse: number | null = null;
      let timeLordSRSign = '';
      
      if (natalCusp) {
        const cuspSign = (natalCusp as any).sign;
        if (cuspSign) {
          timeLord = traditionalRuler[cuspSign] || '';
        }
      }
      // Fallback: if no house cusps, use whole sign from ascendant
      if (!timeLord && natalRisingSign) {
        const ascIdx = SIGNS.indexOf(natalRisingSign);
        if (ascIdx >= 0) {
          const profectionSignIdx = (ascIdx + houseNumber - 1) % 12;
          timeLord = traditionalRuler[SIGNS[profectionSignIdx]] || '';
        }
      }

      if (timeLord) {
        const tlPos = srChart.planets[timeLord as keyof typeof srChart.planets];
        if (tlPos) {
          timeLordSRSign = tlPos.sign;
          const tlDeg = toAbsDeg(tlPos);
          timeLordSRHouse = tlDeg !== null ? findSRHouse(tlDeg, srChart) : null;
        }

        // Check overlap with SR asc ruler or natal asc ruler (lord of the year)
        const srAscRuler = yearlyTheme?.ascendantRuler || '';
        const natalAscRuler = lordOfTheYear?.planet || '';
        const overlap = timeLord === srAscRuler || timeLord === natalAscRuler;

        const overlapText = overlap ? ' This planet is also emphasized as your SR or natal chart ruler — its themes are confirmed as central to this year.' : '';
        const houseSummary = profectionHouseSummary[houseNumber] || '';
        const interpretation = `You are in a ${houseNumber}${houseNumber === 1 ? 'st' : houseNumber === 2 ? 'nd' : houseNumber === 3 ? 'rd' : 'th'} house profection year, making ${timeLord} your Time Lord for the year. ${timeLord} is currently in the SR ${timeLordSRHouse ? `${timeLordSRHouse}${timeLordSRHouse === 1 ? 'st' : timeLordSRHouse === 2 ? 'nd' : timeLordSRHouse === 3 ? 'rd' : 'th'}` : '—'} house in ${timeLordSRSign || '—'}.${overlapText} ${houseSummary}`;

        profectionYear = {
          age,
          houseNumber,
          timeLord,
          timeLordSRHouse,
          timeLordSRSign,
          overlap,
          interpretation,
        };
      }
    }
  }

  // ─── 11. Moon Phase ─────────────────────────────────────────────────
  let moonPhase: SRMoonPhase | null = null;
  if (sunPos && moonPos) {
    const sunDeg = toAbsDeg(sunPos);
    const moonDeg = toAbsDeg(moonPos);
    if (sunDeg !== null && moonDeg !== null) {
      let diff = moonDeg - sunDeg;
      if (diff < 0) diff += 360;
      const phases: { name: string; min: number; max: number; desc: string }[] = [
        { name: 'New Moon', min: 0, max: 22.5, desc: 'A year of new beginnings, planting seeds, and fresh starts. Energy is raw and initiatory — you are starting a new personal cycle. Trust your instincts even when the path is unclear.' },
        { name: 'Crescent', min: 22.5, max: 67.5, desc: 'A year of pushing through resistance to establish something new. You may encounter doubts or obstacles early but the momentum is building. Courage and persistence are required.' },
        { name: 'First Quarter', min: 67.5, max: 112.5, desc: 'A year of crisis in action — decisions must be made, and you cannot remain passive. External events force you to commit or change direction. Action-oriented and sometimes tense.' },
        { name: 'Gibbous', min: 112.5, max: 157.5, desc: 'A year of refinement and adjustment before a major culmination. You are fine-tuning, improving, and preparing for something to come to fruition. Patience and analysis are key.' },
        { name: 'Full Moon', min: 157.5, max: 202.5, desc: 'A year of culmination, revelation, and maximum visibility. What you have been building reaches a peak. Relationships are highlighted — awareness of self and others is heightened.' },
        { name: 'Disseminating', min: 202.5, max: 247.5, desc: 'A year of sharing what you have learned and giving back. You are distributing wisdom, teaching, or reaping the harvest of previous efforts. Social engagement increases.' },
        { name: 'Last Quarter', min: 247.5, max: 292.5, desc: 'A year of reorientation and releasing old structures. A crisis in consciousness — you are letting go of what no longer serves you. Internal shifts matter more than external events.' },
        { name: 'Balsamic', min: 292.5, max: 360, desc: 'A year of rest, reflection, and surrender. The old cycle is ending. Solitude, spiritual practice, and inner processing are needed. Trust the void — what emerges next will be powerful.' },
      ];
      const phase = phases.find(p => diff >= p.min && diff < p.max) || phases[0];
      // Check if Sun-Moon are close enough for eclipse possibility (within ~12° for solar, ~6° of nodes for lunar)
      const isEclipse = diff < 12 || diff > 348 || (diff > 168 && diff < 192);
      moonPhase = { phase: phase.name, description: phase.desc, isEclipse };
    }
  }

  // ─── 12. Stelliums (3+ TRUE PLANETS in same sign or house) ─────────
  // Only Sun through Pluto count for stellium detection; asteroids are noted separately
  const STELLIUM_PLANETS = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
  const EXTRA_BODIES = ['Chiron','NorthNode','Juno','Ceres','Pallas','Vesta','Lilith','Eris'] as const;
  const stelliums: SRStellium[] = [];

  // By sign
  const signPlanetCounts: Record<string, string[]> = {};
  const signExtraCounts: Record<string, string[]> = {};
  for (const planet of STELLIUM_PLANETS) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    if (!signPlanetCounts[pos.sign]) signPlanetCounts[pos.sign] = [];
    signPlanetCounts[pos.sign].push(planet);
  }
  for (const body of EXTRA_BODIES) {
    const pos = srChart.planets[body as keyof typeof srChart.planets];
    if (!pos) continue;
    if (!signExtraCounts[pos.sign]) signExtraCounts[pos.sign] = [];
    signExtraCounts[pos.sign].push(body);
  }
  for (const [sign, planets] of Object.entries(signPlanetCounts)) {
    if (planets.length >= 3) {
      const extras = signExtraCounts[sign] || [];
      stelliums.push({
        location: sign,
        locationType: 'sign',
        planets,
        extras,
        interpretation: generateStelliumInterpretation(sign, planets, 'sign'),
        signMeaning: getSignStelliumMeaning(sign),
        blendMeaning: getStelliumBlendMeaning(planets),
      });
    }
  }
  // By house
  const housePlanetCounts: Record<number, string[]> = {};
  const houseExtraCounts: Record<number, string[]> = {};
  for (const planet of STELLIUM_PLANETS) {
    const h = planetSRHouses[planet];
    if (h == null) continue;
    if (!housePlanetCounts[h]) housePlanetCounts[h] = [];
    housePlanetCounts[h].push(planet);
  }
  for (const body of EXTRA_BODIES) {
    const h = planetSRHouses[body];
    if (h == null) continue;
    if (!houseExtraCounts[h]) houseExtraCounts[h] = [];
    houseExtraCounts[h].push(body);
  }
  for (const [hStr, planets] of Object.entries(housePlanetCounts)) {
    const h = parseInt(hStr);
    if (planets.length >= 3) {
      const extras = houseExtraCounts[h] || [];
      stelliums.push({
        location: `House ${h}`,
        locationType: 'house',
        planets,
        extras,
        interpretation: generateStelliumInterpretation(`House ${h}`, planets, 'house', h),
        signMeaning: '',
        blendMeaning: getStelliumBlendMeaning(planets),
      });
    }
  }

  // ─── 13. Element Balance ──────────────────────────────────────────
  const elementMap: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
    Aries: 'fire', Leo: 'fire', Sagittarius: 'fire',
    Taurus: 'earth', Virgo: 'earth', Capricorn: 'earth',
    Gemini: 'air', Libra: 'air', Aquarius: 'air',
    Cancer: 'water', Scorpio: 'water', Pisces: 'water',
  };
  const elBal = { fire: 0, earth: 0, air: 0, water: 0 };
  const elPlanets: Record<string, string[]> = { fire: [], earth: [], air: [], water: [] };
  for (const planet of PLANETS_CORE) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    const el = elementMap[pos.sign];
    if (el) { elBal[el]++; elPlanets[el].push(planet); }
  }
  const total = elBal.fire + elBal.earth + elBal.air + elBal.water;
  const dominant = (Object.entries(elBal) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0];
  const missing = (Object.entries(elBal) as [string, number][]).filter(([, v]) => v === 0).map(([k]) => k);
  const elementInterpretations: Record<string, string> = {
    fire: 'The year is driven by passion, initiative, and creative energy. You are likely to feel motivated, bold, and eager to take action.',
    earth: 'The year emphasizes practicality, stability, and material concerns. Building, grounding, and tangible results are prioritized.',
    air: 'The year is intellectually stimulating with emphasis on communication, ideas, and social connections. Mental activity is high.',
    water: 'The year is emotionally rich with emphasis on feelings, intuition, and inner processing. Relationships and healing are central.',
  };
  const elementBalance: SRElementBalance = {
    ...elBal,
    firePlanets: elPlanets.fire, earthPlanets: elPlanets.earth, airPlanets: elPlanets.air, waterPlanets: elPlanets.water,
    dominant,
    missing,
    interpretation: elementInterpretations[dominant] + (missing.length > 0 ? ` Missing ${missing.join(' and ')} energy — you may need to consciously cultivate ${missing.join('/')} qualities this year.` : ''),
  };

  // ─── 14. Modality Balance ─────────────────────────────────────────
  const modalityMap: Record<string, 'cardinal' | 'fixed' | 'mutable'> = {
    Aries: 'cardinal', Cancer: 'cardinal', Libra: 'cardinal', Capricorn: 'cardinal',
    Taurus: 'fixed', Leo: 'fixed', Scorpio: 'fixed', Aquarius: 'fixed',
    Gemini: 'mutable', Virgo: 'mutable', Sagittarius: 'mutable', Pisces: 'mutable',
  };
  const modBal = { cardinal: 0, fixed: 0, mutable: 0 };
  const modPlanets: Record<string, string[]> = { cardinal: [], fixed: [], mutable: [] };
  for (const planet of PLANETS_CORE) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    const mod = modalityMap[pos.sign];
    if (mod) { modBal[mod]++; modPlanets[mod].push(planet); }
  }
  const domMod = (Object.entries(modBal) as [string, number][]).sort((a, b) => b[1] - a[1])[0][0];
  const modalityInterpretations: Record<string, string> = {
    cardinal: 'This is an initiating year — new projects, fresh starts, and active leadership. You are motivated to begin things and take charge.',
    fixed: 'This is a year of determination, persistence, and deepening. You are building on what exists, stabilizing, and refusing to budge on what matters.',
    mutable: 'This is a year of flexibility, adaptation, and change. Multiple shifts are likely — your ability to adjust and flow is your greatest asset.',
  };
  const modalityBalance: SRModalityBalance = {
    ...modBal,
    cardinalPlanets: modPlanets.cardinal, fixedPlanets: modPlanets.fixed, mutablePlanets: modPlanets.mutable,
    dominant: domMod,
    interpretation: modalityInterpretations[domMod],
  };

  // ─── 15. Retrograde Report ────────────────────────────────────────
  const retroPlanets: string[] = [];
  for (const planet of PLANETS_CORE) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (pos && (pos as any).isRetrograde) retroPlanets.push(planet);
  }
  const retroInterpretations: Record<string, string> = {
    Mercury: 'Review and revise communication, contracts, and thought processes',
    Venus: 'Reassess relationships, values, and self-worth — old loves may resurface',
    Mars: 'Redirect energy inward — frustrations with progress require patience',
    Jupiter: 'Inner growth and philosophical re-evaluation rather than external expansion',
    Saturn: 'Review structures, boundaries, and responsibilities — karmic reckoning',
    Uranus: 'Internal rebellion and questioning of where you have been inauthentic',
    Neptune: 'Spiritual deepening and dissolving of illusions — heightened intuition',
    Pluto: 'Deep psychological transformation happening beneath the surface',
  };
  const retroDetails = retroPlanets.map(p => `${p}: ${retroInterpretations[p] || 'internalized themes'}`).join('. ');
  const retrogrades: SRRetrogradeReport = {
    planets: retroPlanets,
    count: retroPlanets.length,
    interpretation: retroPlanets.length === 0
      ? 'No retrograde planets — direct, forward momentum characterizes the year. What you see is what you get.'
      : `${retroPlanets.length} planet${retroPlanets.length > 1 ? 's' : ''} retrograde — ${retroDetails}. Retrograde planets indicate areas where internal reflection, revision, and re-evaluation are needed before external progress can be made.`,
  };

  // ─── 16. Repeated Natal Themes ────────────────────────────────────
  const repeatedThemes: SRRepeatedTheme[] = [];
  // Check if SR rising matches natal rising
  const srRisingSign = srAsc?.sign;
  if (srRisingSign && natalRisingSign && srRisingSign === natalRisingSign) {
    repeatedThemes.push({
      description: `SR Ascendant matches your natal Ascendant (${srRisingSign})`,
      significance: 'This is a deeply personal year — you are more "yourself" than usual. Identity themes are reinforced. This year feels like a reset to your core self.',
    });
  }
  // Check if SR Moon matches natal Moon
  const natalMoonSign = natalChart.planets.Moon?.sign;
  if (moonSign && natalMoonSign && moonSign === natalMoonSign) {
    repeatedThemes.push({
      description: `SR Moon matches your natal Moon (${moonSign})`,
      significance: 'Your emotional baseline this year resonates with your core emotional nature. You feel emotionally "at home" — instincts are reliable and your needs are clearer.',
    });
  }
  // Check if SR Sun house = natal Sun house
  const natalSunPos = natalChart.planets.Sun;
  if (natalSunPos && sunPos) {
    const natalSunDeg = toAbsDeg(natalSunPos);
    const natalSunHouse = natalSunDeg !== null ? findNatalHouse(natalSunDeg, natalChart) : null;
    if (natalSunHouse && sunHouse.house && natalSunHouse === sunHouse.house) {
      repeatedThemes.push({
        description: `SR Sun falls in the same house as your natal Sun (House ${natalSunHouse})`,
        significance: 'Your vitality and purpose are reinforced — this house\'s themes are doubly activated, creating a "return to purpose" year.',
      });
    }
  }

  // ─── 17. Hemispheric Emphasis ─────────────────────────────────────
  let hemisphericEmphasis: SRHemisphericEmphasis | null = null;
  const srCusps = extractCusps(srChart);
  if (srCusps) {
    let upper = 0, lower = 0, east = 0, west = 0;
    for (const planet of PLANETS_CORE) {
      const h = planetSRHouses[planet];
      if (h == null) continue;
      if (h >= 7 && h <= 12) upper++; else lower++;
      if (h >= 10 || h <= 3) east++; else west++;
    }
    const total = upper + lower;
    let interp = '';
    if (upper > lower + 2) interp = 'Planets cluster above the horizon — this is a public, visible year. Career, reputation, and social standing are emphasized.';
    else if (lower > upper + 2) interp = 'Planets cluster below the horizon — this is a private, interior year. Home, family, and personal foundations are the focus.';
    if (east > west + 2) interp += (interp ? ' ' : '') + 'Eastern emphasis — you are in the driver\'s seat this year. Self-determination and personal initiative lead.';
    else if (west > east + 2) interp += (interp ? ' ' : '') + 'Western emphasis — others play a significant role this year. Partnerships, collaborations, and responses to external events shape your path.';
    if (!interp) interp = 'Planets are relatively balanced across hemispheres — a mix of public and private, self-directed and other-oriented themes.';
    hemisphericEmphasis = { upper, lower, east, west, interpretation: interp };
  }

  // ─── 18. Saturn Focus ─────────────────────────────────────────────
  let saturnFocus: SRSaturnFocus | null = null;
  const saturnPos = srChart.planets.Saturn;
  if (saturnPos) {
    const satDeg = toAbsDeg(saturnPos);
    const satSRHouse = satDeg !== null ? findSRHouse(satDeg, srChart) : null;
    const satNatalHouse = satDeg !== null ? findNatalHouse(satDeg, natalChart) : null;
    const saturnHouseInterps: Record<number, string> = {
      1: 'Saturn demands maturity in self-expression and appearance. You may feel older, more responsible, or face challenges to your identity this year.',
      2: 'Saturn focuses on financial discipline and values. Earnings may be limited or require hard work — but what you build financially is durable.',
      3: 'Saturn brings serious communication, possibly challenging interactions with siblings, or a demanding learning/writing project.',
      4: 'Saturn at the foundation — home responsibilities, family obligations, or property matters require attention. Emotional maturity is tested.',
      5: 'Saturn restricts or matures creative expression and romance. Children may be a source of responsibility. Joy must be earned this year.',
      6: 'Saturn emphasizes health, work discipline, and daily routines. A year to build better habits and take physical well-being seriously.',
      7: 'Saturn tests partnerships. Relationships face reality checks — commitment is demanded or unsustainable connections end.',
      8: 'Saturn in the house of transformation — facing fears, dealing with shared finances, taxes, or loss. Psychological maturity deepens.',
      9: 'Saturn structures higher learning, travel, or philosophical beliefs. Formal education or publishing may require extra effort.',
      10: 'Saturn at the career peak — professional responsibilities increase significantly. Authority figures are prominent. Reputation is being forged.',
      11: 'Saturn asks you to get serious about your social circle and future goals. Friendships may be tested or reduced to the most meaningful.',
      12: 'Saturn in the hidden house — solitude, spiritual discipline, or institutional involvement. Facing karma and unconscious patterns.',
    };
    saturnFocus = {
      sign: saturnPos.sign,
      house: satSRHouse,
      natalHouse: satNatalHouse,
      isRetrograde: !!(saturnPos as any).isRetrograde,
      interpretation: satSRHouse ? (saturnHouseInterps[satSRHouse] || '') : 'Saturn\'s house placement shapes where you face your greatest responsibilities and growth this year.',
    };
  }

  // ─── 19. North Node Focus ─────────────────────────────────────────
  let nodesFocus: SRNodesFocus | null = null;
  const nnPos = srChart.planets.NorthNode as any;
  if (nnPos?.sign) {
    const nnDeg = toAbsDeg(nnPos);
    const nnHouse = nnDeg !== null ? findSRHouse(nnDeg, srChart) : null;
    const nodeHouseInterps: Record<number, string> = {
      1: 'Growth comes through self-assertion and independence. Step into leadership and trust your own path this year.',
      2: 'Growth comes through building your own resources and self-worth. Financial independence and solid values are the lesson.',
      3: 'Growth comes through communication, learning, and local connections. Speak up, write, teach — your voice matters this year.',
      4: 'Growth comes through home, family, and emotional foundations. Creating a secure base is the soul work this year.',
      5: 'Growth comes through creative self-expression, joy, and following your heart. Take risks on what lights you up.',
      6: 'Growth comes through service, health, and daily discipline. Show up for the mundane — mastery lives in the details.',
      7: 'Growth comes through partnerships and learning to truly share your life. Collaboration and compromise are the teachers.',
      8: 'Growth comes through intimacy, vulnerability, and shared transformation. Let others in — depth is required.',
      9: 'Growth comes through expanding your worldview, travel, and higher learning. Adventure and meaning-making are calling.',
      10: 'Growth comes through career achievement and public responsibility. Step into your authority and be visible.',
      11: 'Growth comes through community involvement and pursuing your ideals. Collective purpose matters more than individual glory.',
      12: 'Growth comes through spiritual surrender, solitude, and letting go of control. Trust the unseen and release the old.',
    };
    nodesFocus = {
      sign: nnPos.sign,
      house: nnHouse,
      interpretation: nnHouse ? (nodeHouseInterps[nnHouse] || '') : 'The North Node in your SR chart points to your growth edge this year.',
    };
  }

  // ─── SR Ascendant falling in natal house (Lynn Bell: "the SR Ascendant is in the 8th house") ──
  let srAscInNatalHouse: SolarReturnAnalysis['srAscInNatalHouse'] = null;
  if (srAsc) {
    const srAscDeg = toAbsDeg(srAsc);
    if (srAscDeg !== null) {
      const nh = findNatalHouse(srAscDeg, natalChart);
      if (nh) {
        const theme = houseThemes[nh] || '';
        const srAscNatalHouseInterps: Record<number, string> = {
          1: 'The SR Ascendant falls in your natal 1st house — the year\'s themes land directly on your identity. This is personal. You are the protagonist, and the events of the year shape how you see yourself.',
          2: 'The SR Ascendant falls in your natal 2nd house — the year\'s energy flows into money, possessions, and self-worth. Financial matters and questions of value are where the year\'s story plays out.',
          3: 'The SR Ascendant falls in your natal 3rd house — communication, learning, siblings, and your immediate environment absorb the year\'s energy. Words, ideas, and local connections matter more than usual.',
          4: 'The SR Ascendant falls in your natal 4th house — home, family, roots, and emotional foundations are the stage for the year\'s themes. Domestic life and inner security are central.',
          5: 'The SR Ascendant falls in your natal 5th house — creativity, romance, children, and joy are where the year\'s energy lands. Self-expression and what brings you alive are front and center.',
          6: 'The SR Ascendant falls in your natal 6th house — daily routines, health, and work absorb the year\'s themes. How you show up day-to-day and care for your body defines the year.',
          7: 'The SR Ascendant falls in your natal 7th house — partnerships and significant others are the primary arena. Another person plays a defining role in your year.',
          8: 'The SR Ascendant falls in your natal 8th house — transformation, shared resources, intimacy, and psychological depth are activated. Something needs to change at a fundamental level.',
          9: 'The SR Ascendant falls in your natal 9th house — travel, higher learning, philosophy, and expansion of your worldview absorb the year\'s themes. A quest for meaning drives the year.',
          10: 'The SR Ascendant falls in your natal 10th house — career, public reputation, and your legacy are where the year\'s energy concentrates. You are visible and your professional identity is in focus.',
          11: 'The SR Ascendant falls in your natal 11th house — community, friendships, and your vision for the future absorb the year\'s themes. Groups and collective purpose define the year.',
          12: 'The SR Ascendant falls in your natal 12th house — the year\'s energy is directed inward, toward solitude, spirituality, and hidden processes. What happens behind the scenes matters most.',
        };
        srAscInNatalHouse = {
          natalHouse: nh,
          natalHouseTheme: theme,
          interpretation: srAscNatalHouseInterps[nh] || `The SR Ascendant falls in your natal ${nh}th house — ${theme.toLowerCase()}.`,
        };
      }
    }
  }

  // ─── Natal Degree Conduits (Lynn Bell: SR planet on natal degree = "conduit") ──
  const natalDegreeConduits: SolarReturnAnalysis['natalDegreeConduits'] = [];
  const CONDUIT_ORB = 2;
  for (const srPlanet of ALL_PLANETS) {
    const srPos = srChart.planets[srPlanet as keyof typeof srChart.planets];
    if (!srPos) continue;
    const srDeg = toAbsDeg(srPos);
    if (srDeg === null) continue;
    for (const natPlanet of [...ALL_PLANETS, 'Ascendant' as const, 'NorthNode' as const]) {
      if (srPlanet === natPlanet) continue;
      const natPos = natalChart.planets[natPlanet as keyof typeof natalChart.planets];
      if (!natPos) continue;
      const natDeg = toAbsDeg(natPos);
      if (natDeg === null) continue;
      let diff = Math.abs(srDeg - natDeg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= CONDUIT_ORB) {
        natalDegreeConduits.push({
          srPlanet,
          natalPlanet: natPlanet,
          srSign: srPos.sign,
          degree: `${srPos.degree}°${(srPos as any).minutes || 0}'`,
          orb: Math.round(diff * 10) / 10,
          interpretation: `SR ${srPlanet} sits on the degree of your natal ${natPlanet} — it becomes a conduit for that natal energy this year. The themes of ${natPlanet} in your birth chart are reawakened and channeled through ${srPlanet}'s expression.`,
        });
      }
    }
  }
  natalDegreeConduits.sort((a, b) => a.orb - b.orb);

  // ─── Moon Timing (Lynn Bell: 1° per month) ──
  const moonTimingEvents: SolarReturnAnalysis['moonTimingEvents'] = [];
  if (moonPos) {
    const moonDeg = toAbsDeg(moonPos);
    if (moonDeg !== null) {
      for (const planet of ALL_PLANETS) {
        if (planet === 'Moon') continue;
        const pos = srChart.planets[planet as keyof typeof srChart.planets];
        if (!pos) continue;
        const pDeg = toAbsDeg(pos);
        if (pDeg === null) continue;
        for (const asp of ASPECT_ANGLES) {
          let diff = Math.abs(moonDeg - pDeg);
          if (diff > 180) diff = 360 - diff;
          const gap = diff - asp.angle;
          if (gap > 0 && gap <= 12) {
            const monthsAway = Math.round(gap * 10) / 10;
            if (monthsAway <= 12) {
              moonTimingEvents.push({
                targetPlanet: planet,
                aspectType: asp.name,
                monthsFromBirthday: monthsAway,
                interpretation: `~${Math.round(monthsAway)} month${Math.round(monthsAway) !== 1 ? 's' : ''} after your birthday, the SR Moon perfects a ${asp.name.toLowerCase()} to ${planet} — activating ${planet} themes.`,
              });
            }
          }
        }
      }
      moonTimingEvents.sort((a, b) => a.monthsFromBirthday - b.monthsFromBirthday);
    }
  }

  return {
    yearlyTheme,
    srAscRulerInNatal,
    sunHouse,
    sunNatalHouse,
    moonSign,
    moonHouse,
    moonNatalHouse,
    houseOverlays,
    srToNatalAspects,
    srInternalAspects,
    angularPlanets,
    relocationTip,
    lordOfTheYear,
    profectionYear,
    moonPhase,
    stelliums,
    elementBalance,
    modalityBalance,
    retrogrades,
    repeatedThemes,
    hemisphericEmphasis,
    saturnFocus,
    nodesFocus,
    srAscInNatalHouse,
    natalDegreeConduits,
    moonTimingEvents,
    planetSRHouses,
  };
};
