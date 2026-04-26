import { NatalChart, NatalPlanetPosition, HouseCusp } from '@/hooks/useNatalChart';
import { SolarReturnChart } from '@/hooks/useSolarReturnChart';
import { analyzeSRHemispheres, type SRHemisphericResult } from './solarReturnHemispheres';
import { calculateVertex, parseLatitudeFromLocation } from './solarReturnVertex';
import {
  calculateMutualReceptions, calculateDignityReport, calculateHealthOverlay,
  calculateEclipseSensitivity, calculateEnhancedRetrogrades, calculateQuarterlyFocus,
  calculateDominantPlanets,
  type SRMutualReception, type SRDignityReport, type SRHealthReport,
  type SREclipseSensitivity, type SREnhancedRetrograde, type SRQuarterlyFocus,
  type SRDominantPlanetsReport,
} from './solarReturnT4Analysis';
import {
  calculateFixedStars, calculateArabicParts, calculateFirdaria,
  calculateAntiscia, calculateSolarArcs, calculateSynthesisSections,
  calculateMidpoints, calculatePrenatalEclipse, calculatePlanetarySpeeds, calculateHeliacalRising,
  type SRFixedStar, type SRArabicPart, type SRFirdariaReport,
  type SRAntisciaContact, type SRSolarArc, type SRSynthesisSection,
  type SRMidpointHit, type SRPrenatalEclipse, type SRPlanetSpeed, type SRHeliacalRising,
} from './solarReturnT5Analysis';

// ─── helpers ────────────────────────────────────────────────────────
const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];
const PLANETS_CORE = ['Sun','Moon','Mercury','Venus','Mars','Jupiter','Saturn','Uranus','Neptune','Pluto'] as const;
const PLANETS_EXTENDED = ['Chiron','Juno','Ceres','Pallas','Vesta','Lilith','Eris'] as const;
const ALL_PLANETS = [...PLANETS_CORE, ...PLANETS_EXTENDED] as const;

const SIGN_GLYPH_MAP: Record<string, string> = {
  '♈': 'Aries', '♉': 'Taurus', '♊': 'Gemini', '♋': 'Cancer',
  '♌': 'Leo', '♍': 'Virgo', '♎': 'Libra', '♏': 'Scorpio',
  '♐': 'Sagittarius', '♑': 'Capricorn', '♒': 'Aquarius', '♓': 'Pisces',
};

const normalizeSign = (sign: string): string => SIGN_GLYPH_MAP[sign] || sign;

const toAbsDeg = (pos: NatalPlanetPosition | HouseCusp | undefined): number | null => {
  if (!pos) return null;
  const idx = SIGNS.indexOf(normalizeSign(pos.sign));
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
  1: "Your life direction is pointing straight at you this year. How you look, how you carry yourself, and how you introduce yourself to new people — that's the work. In daily life: updating your style, starting a fitness routine, getting comfortable saying 'this is who I am' without apologizing.",
  2: "Your life direction is pointing at your wallet and your self-worth this year. How you earn, what you spend on, and how you value your own time are the central questions. In daily life: negotiating a raise, starting a savings plan, or finally dealing with that money situation you've been avoiding.",
  3: "Your life direction is pointing at how you communicate, learn, and connect locally. Your voice matters more than usual this year. In daily life: writing projects, important conversations, a class or workshop, more time with siblings or neighbors, short trips that turn out to be significant.",
  4: "Your life direction turns inward — toward home, family, and your emotional foundation. In daily life: moving, renovating, a parent needing attention, making your living space feel right, or dealing with old family patterns that need resolution.",
  5: "Your life direction points toward joy, creativity, and what makes your heart race. In daily life: a creative project that matters to you, a romance that feels important, more time playing and less time grinding. If you have kids, they're a central part of the story.",
  6: "Your life direction is focused on daily routines, health, and the quality of your work. In daily life: changing your diet, starting a new exercise routine, reorganizing how you work, or getting serious about a health concern. The small daily choices are the big story.",
  7: "Your life direction lives in your closest relationships this year. In daily life: a partner (romantic or business) becomes the main character in your story. Negotiations, compromises, and learning how to truly share space with someone else.",
  8: "Your life direction points to the deep end — shared money, emotional intimacy, and things you don't talk about at dinner. In daily life: dealing with debt, insurance, inheritance, or tax issues. Emotionally, you're going beneath the surface in your closest relationships.",
  9: "Your life direction points outward and upward — travel, education, and rethinking what you believe. In daily life: a meaningful trip, going back to school, exploring a philosophy or practice that reshapes how you see the world.",
  10: "Your life direction is the most visible it can be — career, reputation, and what you're building in the world. In daily life: job changes, promotions, public recognition, or taking on a role that defines you for years to come.",
  11: "Your life direction is aimed at your community, friendships, and future goals. In daily life: joining a group, deepening friendships that matter, letting go of social connections that don't fit anymore, or getting clear about what you actually want for the future.",
  12: "Your life direction has gone behind the scenes. This isn't a year for loud moves — it's a year for rest, reflection, and processing. In daily life: more time alone, therapy or journaling, dealing with something from the past, or supporting someone without recognition.",
};

// ─── Profection house themes (used for synthesis with Time Lord) ──────
const profectionHouseThemes: Record<number, string> = {
  1: 'self, identity, and new beginnings',
  2: 'finances, values, and self-worth',
  3: 'communication, learning, and local connections',
  4: 'home, family, and emotional roots',
  5: 'creativity, romance, and self-expression',
  6: 'health, daily work, and routines',
  7: 'partnerships, relationships, and contracts',
  8: 'transformation, shared resources, and depth',
  9: 'travel, higher learning, and expanding your worldview',
  10: 'career, public reputation, and ambition',
  11: 'community, friendships, and future visions',
  12: 'rest, spirituality, and inner processing',
};

// ─── Planet nature keywords for Time Lord synthesis ──────────────────
const planetNatureKeywords: Record<string, string> = {
  Sun: 'vitality, leadership, and conscious purpose',
  Moon: 'emotional needs, instinct, and nurturing',
  Mercury: 'communication, analysis, and adaptability',
  Venus: 'pleasure, connection, aesthetics, and diplomacy',
  Mars: 'drive, assertion, courage, and decisive action',
  Jupiter: 'growth, opportunity, faith, and expansion',
  Saturn: 'discipline, structure, long-term commitment, and mastery',
};

// SR-house life areas used by the enriched profection synthesis. Mirrors
// the SR_HOUSE_LIFE_AREA in the SR engine for self-contained synthesis prose.
const PROFECTION_SR_HOUSE_AREA: Record<number, string> = {
  1: 'your identity and physical presence',
  2: 'finances, values, and material security',
  3: 'communication, learning, and immediate environment',
  4: 'home, family, and emotional roots',
  5: 'creativity, romance, and what brings you joy',
  6: 'daily routines, health, and the work of being well',
  7: 'partnerships and one-on-one relationships',
  8: 'shared resources, intimacy, and deep transformation',
  9: 'travel, higher learning, and your worldview',
  10: 'career, reputation, and public role',
  11: 'community, friendships, and future-facing goals',
  12: 'solitude, the unconscious, and inner work',
};

const DIGNITY_FORCE_NOTE: Record<string, string> = {
  Domicile: 'in domicile (its home sign) — operating at full strength',
  Exaltation: 'in exaltation — operating with unusual elevation and authority',
  Detriment: 'in detriment — operating in unfamiliar territory and asked to work harder',
  Fall: 'in fall — operating against its grain, which can feel like dragging the year uphill',
  Peregrine: 'in a neutral sign — neither boosted nor weakened by dignity',
};

function buildProfectionSynthesis(
  timeLord: string,
  houseNumber: number,
  timeLordSRHouse: number | null = null,
  timeLordSRSign: string = '',
  isRetrograde: boolean = false,
): string {
  const houseThemes = profectionHouseThemes[houseNumber] || '';
  const planetNature = planetNatureKeywords[timeLord];

  // Compose the dignity + SR-house clause if we have placement data.
  let placementClause = '';
  if (timeLordSRHouse && timeLordSRSign) {
    const dignity = getDignity(timeLord, timeLordSRSign);
    const dignityNote = DIGNITY_FORCE_NOTE[dignity] || '';
    const srArea = PROFECTION_SR_HOUSE_AREA[timeLordSRHouse] || `your ${timeLordSRHouse}th house`;
    const retroClause = isRetrograde
      ? ' Retrograde, the year\'s themes turn inward first — review and integration before outward action.'
      : '';
    placementClause = ` This year ${timeLord} sits in your SR ${timeLordSRHouse}${ord(houseNumber === 0 ? 1 : houseNumber)} house in ${timeLordSRSign}${dignityNote ? `, ${dignityNote}` : ''}, so the year's most defining moments concentrate in ${srArea}.${retroClause}`;
    // Fix the ordinal — we want SR house ordinal, not the profection house ordinal
    placementClause = placementClause.replace(
      `SR ${timeLordSRHouse}${ord(houseNumber === 0 ? 1 : houseNumber)} house`,
      `SR ${ord(timeLordSRHouse)} house`,
    );
  }

  const base = planetNature
    ? `${timeLord} brings ${planetNature} to this year's focus on ${houseThemes}. You'll feel ${timeLord}'s nature coloring every development in these areas.`
    : `The year's focus areas — ${houseThemes} — are activated through ${timeLord}'s influence.`;

  return `${base}${placementClause}`;
}

// Local ordinal helper used by buildProfectionSynthesis when the file's
// inner `ord` (defined later inside analyzeSolarReturn) isn't in scope.
function ord(n: number): string {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

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
  natalHouse: number | null;       // planet's house in the NATAL chart
  natalHouseTheme: string;
  srInNatalHouse: number | null;   // where the SR planet's degree falls in natal houses (overlay)
  srInNatalHouseTheme: string;
  /** @deprecated Use natalHouseTheme instead. This is the natal house theme, kept for backward compat. */
  houseTheme: string;
  interpretation: string;
}

export interface SRKeyAspect extends Aspect {
  interpretation: string;
}

export interface SRMoonPhase {
  phase: string;
  description: string;
  isEclipse: boolean;
  phaseAngle: number;
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

export type SRHemisphericEmphasis = SRHemisphericResult;

export interface SRSaturnFocus {
  sign: string;
  house: number | null;
  natalHouse: number | null;
  isRetrograde: boolean;
  theme: string;
  interpretation: string;
}

export interface SRNodesFocus {
  sign: string;
  house: number | null;
  theme: string;
  interpretation: string;
}

export interface SRVertexData {
  sign: string;
  degree: number;
  minutes: number;
  house: number | null;
  aspects: { planet: string; aspectType: string; orb: number }[];
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
  angularPlanetsDetailed: { planet: string; angle: string; sign: string; house: number; orb: number }[];
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
    natalCuspSign: string;
    timeLord: string;
    timeLordSRHouse: number | null;
    timeLordSRSign: string;
    overlap: boolean;
    overlapDescription: string;
    interpretation: string;
  } | null;
  // New deep analysis sections
  moonPhase: SRMoonPhase | null;
  stelliums: SRStellium[];
  elementBalance: SRElementBalance;
  modalityBalance: SRModalityBalance;
  retrogrades: SRRetrogradeReport;
  repeatedThemes: SRRepeatedTheme[];
  hemisphericEmphasis: SRHemisphericEmphasis;
  saturnFocus: SRSaturnFocus | null;
  nodesFocus: SRNodesFocus | null;
  /** Where the SR Ascendant degree falls in the natal chart houses */
  srAscInNatalHouse: {
    natalHouse: number;
    natalHouseTheme: string;
    interpretation: string;
  } | null;
  /** SR planets within 2° of natal planet degrees — "conduit" connections */
  natalDegreeConduits: {
    srPlanet: string;
    natalPlanet: string;
    srSign: string;
    degree: string;
    orb: number;
    interpretation: string;
  }[];
  /** SR Moon aspects to other SR planets (frozen snapshot at the moment of the return) */
  srMoonAspects: {
    targetPlanet: string;
    aspectType: string;
    orb: number;
    targetSRHouse: number | null;
    targetSRSign: string;
    sourceSRHouse: number | null;
    sourceHouseTheme: string;
    targetHouseTheme: string;
    interpretation: string;
  }[];
  /** Moon timing: key aspects the SR Moon will perfect during the year (1°/month) — DEPRECATED, kept for compat */
  moonTimingEvents: {
    targetPlanet: string;
    aspectType: string;
    monthsFromBirthday: number;
    approximateMonth: string;
    targetSRHouse: number | null;
    interpretation: string;
  }[];
  /** SR Moon angular position category */
  moonAngularity: 'angular' | 'succedent' | 'cadent' | null;
  /** Whether the SR Moon is in late degrees (25+), signaling change */
  moonLateDegree: boolean;
  /** Whether the SR Moon is Void of Course — no major aspects to any SR planet (unaspected Moon) */
  moonVOC: boolean;
  /** The 19-year Metonic cycle — ages when the SR Moon was in the same sign */
  moonMetonicAges: number[];
  /** Vertex — fated encounters point */
  vertex: SRVertexData | null;
  // Helper: map planet name → SR house for display
  planetSRHouses: Record<string, number | null>;
  // ─── Tier 4 ───
  mutualReceptions: SRMutualReception[];
  dignityReport: SRDignityReport;
  healthOverlay: SRHealthReport;
  eclipseSensitivity: SREclipseSensitivity[];
  enhancedRetrogrades: SREnhancedRetrograde[];
  quarterlyFocus: SRQuarterlyFocus[];
  dominantPlanets: SRDominantPlanetsReport;
  // ─── Tier 5 ───
  fixedStars: SRFixedStar[];
  arabicParts: SRArabicPart[];
  firdaria: SRFirdariaReport;
  antisciaContacts: SRAntisciaContact[];
  solarArcs: SRSolarArc[];
  synthesisSections: SRSynthesisSection[];
  // ─── Tier 5b (new techniques) ───
  midpointHits: SRMidpointHit[];
  prenatalEclipse: SRPrenatalEclipse | null;
  planetarySpeeds: SRPlanetSpeed[];
  heliacalRising: SRHeliacalRising | null;
}

// ─── House life-area map & sign felt-sense ──────────────────────────
const SR_HOUSE_LIFE_AREA: Record<number, string> = {
  1: 'your identity, appearance, and how others first perceive you',
  2: 'money, possessions, and your sense of self-worth',
  3: 'communication, siblings, short trips, and everyday learning',
  4: 'home, family, roots, and your private emotional foundation',
  5: 'romance, creativity, children, and what brings you joy',
  6: 'daily routines, health habits, and work responsibilities',
  7: 'partnerships, committed relationships, and one-on-one dynamics',
  8: 'shared resources, intimacy, debt, and psychological transformation',
  9: 'travel, higher education, belief systems, and expanding your worldview',
  10: 'career, public reputation, and your visible achievements',
  11: 'friendships, community, group endeavors, and long-term hopes',
  12: 'solitude, subconscious patterns, healing, and what you do behind the scenes',
};

const getSignFeltSense = (sign: string): string => {
  const senses: Record<string, string> = {
    Aries: 'impatience with anything slow, a need to act first and think later, and a physical restlessness that demands movement',
    Taurus: 'a craving for stability and sensory comfort, slower decision-making, and resistance to being rushed',
    Gemini: 'mental hyperactivity, curiosity pulling you in multiple directions, and a need to talk things through',
    Cancer: 'heightened emotional sensitivity, strong protective instincts, and decisions filtered through gut feelings',
    Leo: 'a need to be seen and appreciated, creative urgency, and taking things personally when recognition is withheld',
    Virgo: 'hyper-awareness of flaws and details, a drive to fix and improve, and anxiety when things feel disorganized',
    Libra: 'constant weighing of options, difficulty making solo decisions, and a pull toward harmony even at personal cost',
    Scorpio: 'intense focus, suspicion of surface-level explanations, and an all-or-nothing approach to what matters',
    Sagittarius: 'restlessness with routine, a hunger for meaning and new experiences, and bluntness that surprises even you',
    Capricorn: 'pressure to achieve measurable results, emotional restraint, and a pragmatic "what\'s the point?" filter on everything',
    Aquarius: 'detachment from emotional pressure, unconventional choices that confuse others, and a need for intellectual freedom',
    Pisces: 'boundary dissolution, absorbing others\' moods, heightened intuition, and a pull toward escapism when overwhelmed',
  };
  return senses[sign] || `the qualities of ${sign}`;
};

// ─── Expert-level aspect interpretation engine ──────────────────────
const PLANET_THEMES: Record<string, { domain: string; drive: string; body: string }> = {
  Sun: { domain: 'identity, vitality, and conscious will', drive: 'to shine, lead, and express purpose', body: 'heart, spine, and overall vitality' },
  Moon: { domain: 'emotions, instincts, and comfort needs', drive: 'to nurture, feel safe, and belong', body: 'stomach, breasts, and fluid balance' },
  Mercury: { domain: 'communication, thinking, and daily logistics', drive: 'to understand, articulate, and connect information', body: 'nervous system, hands, and respiratory' },
  Venus: { domain: 'love, values, money, and aesthetic pleasure', drive: 'to attract, harmonize, and enjoy', body: 'throat, kidneys, and skin' },
  Mars: { domain: 'action, desire, anger, and physical drive', drive: 'to assert, compete, and pursue what you want', body: 'muscles, blood, and adrenals' },
  Jupiter: { domain: 'growth, opportunity, faith, and expansion', drive: 'to explore, teach, and find meaning', body: 'liver, hips, and fat metabolism' },
  Saturn: { domain: 'discipline, limits, responsibility, and time', drive: 'to structure, earn through effort, and endure', body: 'bones, teeth, knees, and skin' },
  Uranus: { domain: 'disruption, liberation, innovation, and sudden change', drive: 'to break free, rebel, and reinvent', body: 'nervous system and circulation' },
  Neptune: { domain: 'imagination, sensitivity, confusion, and foggy boundaries', drive: 'to dissolve what is rigid and open to intuition', body: 'immune system and lymphatic' },
  Pluto: { domain: 'deep change, power dynamics, obsession, and therapy breakthroughs', drive: 'to transform, control, and regenerate from crisis', body: 'reproductive system and elimination' },
  Chiron: { domain: 'old sore spots, insecurity, and teaching from experience', drive: 'to heal others through your own pain', body: 'chronic conditions and sensitivity points' },
  NorthNode: { domain: 'soul growth direction, unfamiliar territory, and destiny', drive: 'to move toward unfamiliar growth', body: '' },
  Ascendant: { domain: 'your visible self, first impressions, and physical presence', drive: 'to project identity into the world', body: 'head and overall constitution' },
  Juno: { domain: 'committed partnership, marriage, and what you need in a partner', drive: 'to find loyalty, equality, and deep commitment', body: '' },
  Vesta: { domain: 'devotion, sacred focus, and what you sacrifice for', drive: 'to dedicate yourself fully to what matters most', body: '' },
  Pallas: { domain: 'strategic wisdom, pattern recognition, and creative intelligence', drive: 'to see the big picture and craft elegant solutions', body: '' },
  Ceres: { domain: 'nurturing, nourishment, and cycles of loss and return', drive: 'to care for others and process grief into growth', body: '' },
  Lilith: { domain: 'raw power, suppressed desires, and reclaimed autonomy', drive: 'to own the parts of yourself others find uncomfortable', body: '' },
  Eris: { domain: 'disruption, whistleblowing, and necessary confrontation', drive: 'to expose what is hidden and demand authenticity', body: '' },
};

const ASPECT_FEEL: Record<string, { verb: string; quality: string; experience: string }> = {
  Conjunction: { verb: 'fuses with', quality: 'intensification', experience: 'These two energies merge into a single force — you cannot separate them this year. They amplify each other, for better or worse. The effect is immediate and constant.' },
  Opposition: { verb: 'opposes', quality: 'polarization and awareness', experience: 'These two energies pull in opposite directions, creating an inner tug-of-war. Oppositions demand integration — you cannot choose one side without the other demanding attention. Other people often embody the planet you are not expressing, creating external confrontations that mirror internal tension.' },
  Trine: { verb: 'flows with', quality: 'ease and natural talent', experience: 'These energies support each other effortlessly — doors open, skills click, and the combination feels natural. The risk is complacency; trines work so smoothly that you may not fully utilize the opportunity. Conscious engagement multiplies the benefit.' },
  Square: { verb: 'clashes with', quality: 'friction and forced growth', experience: 'These energies grind against each other, creating frustration that demands action. Squares are the engine of achievement — nothing changes without friction. Expect obstacles that ultimately force you to develop strength you did not know you had.' },
  Sextile: { verb: 'supports', quality: 'opportunity through effort', experience: 'A cooperative opening that requires conscious engagement. Sextiles do not hand you results — they present doors. You have to walk through them. When activated, they produce tangible, practical results.' },
  Quincunx: { verb: 'requires adjustment with', quality: 'awkward recalibration', experience: 'These energies have nothing in common — different element, different mode. The effect is a persistent irritation that cannot be resolved by choosing one side. Health issues, logistical complications, and the need for constant small adjustments are common.' },
};

const aspectMeaning = (p1: string, p2: string, type: string): string => {
  const t1 = PLANET_THEMES[p1] || { domain: `${p1} themes`, drive: `${p1}'s drive`, body: '' };
  const t2 = PLANET_THEMES[p2] || { domain: `${p2} themes`, drive: `${p2}'s drive`, body: '' };
  const feel = ASPECT_FEEL[type] || ASPECT_FEEL.Conjunction;

  return `SR ${p1} (${t1.domain}) ${feel.verb} Natal ${p2} (${t2.domain}). ${feel.experience} This year, your natal ${p2} pattern — the drive ${t2.drive} — is directly activated by the solar return's ${p1} energy. The ${type.toLowerCase()} creates ${feel.quality} between these two forces.`;
};

const internalAspectMeaning = (p1: string, p2: string, type: string): string => {
  const t1 = PLANET_THEMES[p1] || { domain: `${p1} themes`, drive: `${p1}'s drive`, body: '' };
  const t2 = PLANET_THEMES[p2] || { domain: `${p2} themes`, drive: `${p2}'s drive`, body: '' };
  const feel = ASPECT_FEEL[type] || ASPECT_FEEL.Conjunction;

  return `${p1} (${t1.domain}) ${feel.verb} ${p2} (${t2.domain}) within the solar return chart itself. ${feel.experience} This defines the year's background climate — the dynamic between ${p1} and ${p2} colors every area of life, regardless of which houses they occupy.`;
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

// ─── House Overlay Interpretation Engine ────────────────────────────

const PLANET_OVERLAY_DRIVE: Record<string, { what: string; shift: string }> = {
  Sun: { what: 'your core identity and sense of purpose', shift: 'where you feel most alive and visible' },
  Moon: { what: 'your emotional needs and comfort patterns', shift: 'where you instinctively seek safety and belonging' },
  Mercury: { what: 'your thinking, conversations, and daily logistics', shift: 'where your mind is busiest and most curious' },
  Venus: { what: 'your love style, spending habits, and sense of beauty', shift: 'where you attract pleasure and connection' },
  Mars: { what: 'your drive, ambition, and how you handle anger', shift: 'where you put your energy and fight for results' },
  Jupiter: { what: 'your opportunities, optimism, and desire to grow', shift: 'where life opens doors and rewards risk' },
  Saturn: { what: 'your responsibilities, fears, and long-term commitments', shift: 'where life demands maturity and hard work' },
  Uranus: { what: 'your need for freedom, sudden changes, and experimentation', shift: 'where expect-the-unexpected events show up' },
  Neptune: { what: 'your imagination, sensitivity, and tendency toward confusion', shift: 'where boundaries get foggy and intuition runs high' },
  Pluto: { what: 'your deepest drives, control issues, and capacity for transformation', shift: 'where deep change happens whether you choose it or not' },
  Chiron: { what: 'your old sore spots and where you help others heal', shift: 'where insecurity surfaces but also where you grow the most' },
  NorthNode: { what: 'your growth direction — unfamiliar territory that stretches you', shift: 'the life area calling you forward this year' },
  Juno: { what: 'your partnership needs and what you expect from commitment', shift: 'where loyalty and relationship dynamics play out' },
  Vesta: { what: 'your devotion and what you sacrifice for', shift: 'where you pour focused, dedicated energy' },
  Pallas: { what: 'your strategic intelligence and ability to see patterns', shift: 'where you apply creative problem-solving' },
  Ceres: { what: 'your nurturing style and relationship with nourishment', shift: 'where you care for others and process letting go' },
  Lilith: { what: 'your raw power and the parts of yourself others find uncomfortable', shift: 'where you reclaim autonomy and refuse to be tamed' },
  Eris: { what: 'your willingness to disrupt and demand truth', shift: 'where you challenge the status quo' },
};

function generateOverlayInterpretation(
  planet: string,
  srSign: string,
  srHouse: number | null,
  natalLandingHouse: number | null,
  natalOriginalHouse: number | null,
): string {
  const drive = PLANET_OVERLAY_DRIVE[planet] || { what: `${planet}'s themes`, shift: `where ${planet} focuses` };
  const signFelt = getSignFeltSense(srSign);
  const srArea = srHouse ? (SR_HOUSE_LIFE_AREA[srHouse] || `house ${srHouse}`) : 'an unknown area';
  const natalArea = natalLandingHouse ? (SR_HOUSE_LIFE_AREA[natalLandingHouse] || `house ${natalLandingHouse}`) : null;

  let interp = `${planet} in ${srSign} in your Solar Return chart focuses on ${srArea}. `;
  interp += `${planet} represents ${drive.what}, and in ${srSign} this year, you feel it as ${signFelt}. `;

  if (natalOriginalHouse && srHouse && natalOriginalHouse !== srHouse) {
    const origArea = SR_HOUSE_LIFE_AREA[natalOriginalHouse] || `house ${natalOriginalHouse}`;
    interp += `In your natal chart, ${planet} lives in your ${natalOriginalHouse}${ordinalSuffix(natalOriginalHouse)} house (${origArea}), but this year it shifts to your ${srHouse}${ordinalSuffix(srHouse)} house — meaning ${drive.shift} moves from ${origArea} to ${srArea}. `;
  } else if (natalOriginalHouse && srHouse && natalOriginalHouse === srHouse) {
    interp += `${planet} returns to its natal house this year, reinforcing its lifelong themes around ${srArea}. This is a year of deepening, not redirecting, this energy. `;
  }

  if (natalArea && natalLandingHouse !== srHouse) {
    interp += `Landing in your natal ${natalLandingHouse}${ordinalSuffix(natalLandingHouse!)} house, ${planet} also activates ${natalArea} in a way that connects your inner natal blueprint to this year's external events.`;
  }

  return interp.trim();
}

function ordinalSuffix(n: number): string {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return (s[(v - 20) % 10] || s[v] || s[0]);
}

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

    const rulerTheme = PLANET_THEMES[ruler] || { domain: `${ruler} themes`, drive: `${ruler}'s drive`, body: '' };
    const houseArea = rulerHouse ? SR_HOUSE_LIFE_AREA[rulerHouse] || `your ${rulerHouse}th house affairs` : '';
    const themeDesc = `${srAsc.sign} Rising this year means ${ruler} — the planet of ${rulerTheme.domain} — steers how you meet every situation. With ${ruler} in ${rulerSign}${rulerHouse ? ` (SR ${rulerHouse}th house)` : ''}, your instinctive drive all year is ${rulerTheme.drive}${houseArea ? `, and that drive plays out most visibly in ${houseArea}` : ''}. You'll feel this as a persistent pull: decisions, moods, and reactions will keep filtering through ${rulerSign} energy — ${getSignFeltSense(rulerSign)}.`;
    yearlyTheme = {
      ascendantSign: srAsc.sign,
      ascendantRuler: ruler,
      ascendantRulerSign: rulerSign,
      ascendantRulerHouse: rulerHouse,
      yearTheme: themeDesc,
    };
  }

  // 1b. SR Ascendant Ruler in NATAL houses
  // The SR Ascendant ruler's position in the natal chart shows WHERE in your life
  // the year's themes will play out most strongly.
  let srAscRulerInNatal: SRAscRulerInNatal | null = null;
  if (yearlyTheme && srAsc) {
    const ruler = yearlyTheme.ascendantRuler;
    const rulerSRPos = srChart.planets[ruler as keyof typeof srChart.planets];
    // Find where the ruler sits in the NATAL chart — that natal house is where
    // the year's energy plays out.
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
  for (const planet of [...ALL_PLANETS, 'NorthNode' as const]) {
    const pos = srChart.planets[planet as keyof typeof srChart.planets];
    if (!pos) continue;
    const deg = toAbsDeg(pos);
    if (deg === null) continue;
    const sh = findSRHouse(deg, srChart);
    const nh = findNatalHouse(deg, natalChart);

    // Find natal house of this planet in natal chart
    const natalPos = natalChart.planets[planet as keyof typeof natalChart.planets];
    let natalOrigHouse: number | null = null;
    if (natalPos) {
      const natalDeg = toAbsDeg(natalPos);
      if (natalDeg !== null) natalOrigHouse = findNatalHouse(natalDeg, natalChart);
    }

    const interp = generateOverlayInterpretation(planet, pos.sign, sh, nh, natalOrigHouse);

    houseOverlays.push({
      planet,
      srSign: pos.sign,
      srDegree: `${pos.degree}°${pos.minutes || 0}'`,
      srHouse: sh,
      srHouseTheme: sh ? houseThemes[sh] : '',
      natalHouse: natalOrigHouse,
      natalHouseTheme: natalOrigHouse ? houseThemes[natalOrigHouse] : '',
      srInNatalHouse: nh,
      srInNatalHouseTheme: nh ? houseThemes[nh] : '',
      houseTheme: natalOrigHouse ? houseThemes[natalOrigHouse] : '',
      interpretation: interp,
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
        // Skip Sun-Sun conjunction — it's always 0° by definition in a Solar Return
        if (srPlanet === 'Sun' && natPlanet === 'Sun' && asp.type === 'Conjunction') continue;

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

  // 7. Angular planets (within 8° of SR ASC, MC, DSC, IC)
  const angularPlanets: string[] = [];
  const angularPlanetsDetailed: { planet: string; angle: string; sign: string; house: number; orb: number }[] = [];
  const ANGLE_DEFS: { cusp: any; name: string; house: number }[] = [
    { cusp: srChart.houseCusps?.house1, name: 'Ascendant', house: 1 },
    { cusp: srChart.houseCusps?.house4, name: 'IC', house: 4 },
    { cusp: srChart.houseCusps?.house7, name: 'Descendant', house: 7 },
    { cusp: srChart.houseCusps?.house10, name: 'MC', house: 10 },
  ];
  for (const angleDef of ANGLE_DEFS) {
    if (!angleDef.cusp) continue;
    const angleDeg = toAbsDeg(angleDef.cusp);
    if (angleDeg === null) continue;
    for (const planet of ALL_PLANETS) {
      const pos = srChart.planets[planet as keyof typeof srChart.planets];
      if (!pos) continue;
      const pDeg = toAbsDeg(pos);
      if (pDeg === null) continue;
      let diff = Math.abs(pDeg - angleDeg);
      if (diff > 180) diff = 360 - diff;
      if (diff <= 8) {
        if (!angularPlanets.includes(planet)) angularPlanets.push(planet);
        angularPlanetsDetailed.push({
          planet,
          angle: angleDef.name,
          sign: pos.sign,
          house: angleDef.house,
          orb: Math.round(diff * 10) / 10,
        });
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
      let natalCuspSign = '';
      
      if (natalCusp) {
        const cuspSign = (natalCusp as any).sign;
        if (cuspSign && SIGNS.includes(cuspSign)) {
          natalCuspSign = cuspSign;
          timeLord = traditionalRuler[cuspSign] || '';
        }
      } else {
      }
      // Fallback: if no house cusps, use whole sign from ascendant
      if (!timeLord && natalRisingSign) {
        const ascIdx = SIGNS.indexOf(natalRisingSign);
        if (ascIdx >= 0) {
          const profectionSignIdx = (ascIdx + houseNumber - 1) % 12;
          natalCuspSign = SIGNS[profectionSignIdx];
          timeLord = traditionalRuler[natalCuspSign] || '';
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
        const overlapWithSRAsc = timeLord === srAscRuler;
        const overlapWithLotY = timeLord === natalAscRuler;
        const overlap = overlapWithSRAsc || overlapWithLotY;

        // Build specific overlap description
        let overlapSystems: string[] = [];
        if (overlapWithLotY) overlapSystems.push('Lord of the Year (natal Ascendant ruler)');
        if (overlapWithSRAsc) overlapSystems.push('SR Ascendant ruler');
        const overlapDescription = overlapSystems.length > 0
          ? `${timeLord} is both your Time Lord and your ${overlapSystems.join(' and ')} — ${overlapSystems.length > 1 ? 'three' : 'two'} independent timing systems confirm this planet drives the year.`
          : '';

        const ord = (n: number) => n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`;
        const srHouseText = timeLordSRHouse ? `${ord(timeLordSRHouse)} house in ${timeLordSRSign || '—'}` : '—';
        const synthesis = buildProfectionSynthesis(timeLord, houseNumber);
        const interpretation = `You are in a ${ord(houseNumber)} house profection year, making ${timeLord} your Time Lord for the year. ${timeLord} is currently in the SR ${srHouseText}. ${synthesis}`;

        profectionYear = {
          age,
          houseNumber,
          natalCuspSign,
          timeLord,
          timeLordSRHouse,
          timeLordSRSign,
          overlap,
          overlapDescription,
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
        { name: 'New Moon', min: 0, max: 45, desc: 'A year of new beginnings, planting seeds, and fresh starts. Energy is raw and initiatory — you are starting a new personal cycle. Trust your instincts even when the path is unclear.' },
        { name: 'Waxing Crescent', min: 45, max: 90, desc: 'A year of pushing through resistance to establish something new. You may encounter doubts or obstacles early but the momentum is building. Courage and persistence are required.' },
        { name: 'First Quarter', min: 90, max: 135, desc: 'A year of crisis in action — decisions must be made, and you cannot remain passive. External events force you to commit or change direction. Action-oriented and sometimes tense.' },
        { name: 'Waxing Gibbous', min: 135, max: 180, desc: 'A year of refinement and adjustment before a major culmination. You are fine-tuning, improving, and preparing for something to come to fruition. Patience and analysis are key.' },
        { name: 'Full Moon', min: 180, max: 225, desc: 'A year of culmination, revelation, and maximum visibility. What you have been building reaches a peak. Relationships are highlighted — awareness of self and others is heightened.' },
        { name: 'Waning Gibbous', min: 225, max: 270, desc: 'A year of sharing what you have learned and giving back. You are distributing wisdom, teaching, or reaping the harvest of previous efforts. Social engagement increases.' },
        { name: 'Last Quarter', min: 270, max: 315, desc: 'A year of reorientation and releasing old structures. A crisis in consciousness — you are letting go of what no longer serves you. Internal shifts matter more than external events.' },
        { name: 'Waning Crescent', min: 315, max: 345, desc: 'A year of retreat, reflection, and spiritual processing. The old cycle is winding down. Solitude and inner work prepare you for the renewal ahead.' },
        { name: 'Balsamic', min: 345, max: 360, desc: 'A year of rest, reflection, and surrender. The old cycle is ending. Solitude, spiritual practice, and inner processing are needed. Trust the void — what emerges next will be powerful.' },
      ];
      const phase = phases.find(p => diff >= p.min && diff < p.max) || phases[0];
      // Eclipse requires Sun-Moon alignment AND proximity to the nodal axis (within ~12° of nodes)
      let isEclipse = false;
      const nnPos = srChart.planets.NorthNode;
      if (nnPos) {
        const nnDeg = toAbsDeg(nnPos);
        if (nnDeg !== null) {
          const snDeg = (nnDeg + 180) % 360;
          // Check if Sun or Moon is near either node
          for (const lumDeg of [sunDeg, moonDeg]) {
            for (const nodeDeg of [nnDeg, snDeg]) {
              let nDiff = Math.abs(lumDeg - nodeDeg);
              if (nDiff > 180) nDiff = 360 - nDiff;
              if (nDiff <= 12) {
                // Also check Sun-Moon are in New or Full phase range
                if (diff < 15 || diff > 345 || (diff > 165 && diff < 195)) {
                  isEclipse = true;
                }
              }
            }
          }
        }
      }
      moonPhase = { phase: phase.name, description: phase.desc, isEclipse, phaseAngle: Math.round(diff * 100) / 100 };
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

  // Modality-Moon phase bridging logic
  const currentPhase = moonPhase?.phase || '';
  const closingPhases = ['Balsamic', 'Waning Crescent', 'Last Quarter', 'Waning Gibbous'];
  const openingPhases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous'];
  const isClosingMoon = closingPhases.some(p => currentPhase.toLowerCase().includes(p.toLowerCase()));
  const isOpeningMoon = openingPhases.some(p => currentPhase.toLowerCase().includes(p.toLowerCase()));

  const modalityDefaults: Record<string, string> = {
    cardinal: 'This is an initiating year — new projects, fresh starts, and active leadership. You are motivated to begin things and take charge.',
    fixed: 'This is a year of determination, persistence, and deepening. You are building on what exists, stabilizing, and refusing to budge on what matters.',
    mutable: 'This is a year of flexibility, adaptation, and change. Multiple shifts are likely — your ability to adjust and flow is your greatest asset.',
  };

  let modalityInterp = modalityDefaults[domMod];

  // Bridging: Cardinal + Closing Moon
  if (domMod === 'cardinal' && isClosingMoon) {
    modalityInterp = 'Your planets favor bold, decisive action this year. You naturally gravitate toward taking charge. However, your lunar rhythm is one of completion and release. The blend means this: you have the energy to lead and make things happen, but your deepest growth comes from using that drive to finish what you have already started rather than launching something entirely new. Close chapters with confidence. Clear the deck. The fresh start is coming, but this year is about wrapping up powerfully.';
  }
  // Bridging: Mutable + Closing Moon
  else if (domMod === 'mutable' && isClosingMoon) {
    modalityInterp = `Your energy this year is flexible and adaptive, which pairs naturally with your ${currentPhase} Moon rhythm of release and completion. You are meant to flow with change rather than force it. Let go of what no longer fits. Adjust, adapt, and trust the process of transition.`;
  }
  // Bridging: Fixed + Opening Moon
  else if (domMod === 'fixed' && isOpeningMoon) {
    modalityInterp = 'Your planets favor persistence and staying the course, while your lunar rhythm is one of new beginnings. The blend means you are planting seeds that require patience and commitment to grow. Start what matters, then dig in for the long haul. This year rewards steady follow-through on fresh intentions.';
  }

  const modalityBalance: SRModalityBalance = {
    ...modBal,
    cardinalPlanets: modPlanets.cardinal, fixedPlanets: modPlanets.fixed, mutablePlanets: modPlanets.mutable,
    dominant: domMod,
    interpretation: modalityInterp,
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
  const hemisphericEmphasis: SRHemisphericEmphasis = analyzeSRHemispheres(planetSRHouses, [...PLANETS_CORE]);

  // ─── 18. Saturn Focus ─────────────────────────────────────────────
  function getSaturnSignStyle(sign: string): string {
    const styles: Record<string, string> = {
      Aries: 'frustrated impatience — you want to act fast but Saturn forces you to slow down and plan',
      Taurus: 'stubborn persistence — the lessons are about money, comfort, and learning that security is earned',
      Gemini: 'mental pressure — too many things to think about, contracts to review, or communication breakdowns that need patience',
      Cancer: 'emotional weight — family obligations feel heavier, and you learn to set boundaries with people you love',
      Leo: 'restricted self-expression — your confidence gets tested, and recognition has to be earned rather than given',
      Virgo: 'perfectionist pressure — your standards are high and the work is relentless, but the skills you build are permanent',
      Libra: 'relationship tests — partnerships require real honesty, and anything superficial in your relationships gets exposed',
      Scorpio: 'confronting what you\'ve been avoiding — power dynamics, financial entanglements, or emotional patterns you can\'t keep ignoring',
      Sagittarius: 'belief systems challenged — your assumptions about the world get reality-checked, and blind optimism doesn\'t hold up',
      Capricorn: 'pure hard work — Saturn is at home here, which means the demands are heavy but the rewards are real and lasting',
      Aquarius: 'social responsibility — group dynamics and future plans require serious commitment, not just good intentions',
      Pisces: 'spiritual discipline — your intuition is strong but Saturn asks you to ground it in practice, not just feelings',
    };
    return styles[sign] || 'structured discipline and patience';
  }

  let saturnFocus: SRSaturnFocus | null = null;
  const saturnPos = srChart.planets.Saturn;
  if (saturnPos) {
    const satDeg = toAbsDeg(saturnPos);
    const satSRHouse = satDeg !== null ? findSRHouse(satDeg, srChart) : null;
    const satNatalHouse = satDeg !== null ? findNatalHouse(satDeg, natalChart) : null;
    const saturnHouseInterps: Record<number, string> = {
      1: 'This year asks for maturity in how you present yourself. You may feel more serious, take on a leadership role, or face challenges that reshape your identity. In daily life: being more intentional about how you show up, possibly changing your appearance or taking on responsibilities you didn\'t expect.',
      2: 'Your finances and values are getting a reality check this year. Earnings may require harder work — but what you build financially is durable. In daily life: budgeting becomes essential, and you\'ll think hard about what\'s truly worth your money and time.',
      3: 'Communication and learning take center stage with a serious tone. In daily life: important documents, contracts, or difficult conversations that can\'t be avoided. You may start studying something that demands real effort.',
      4: 'Home and family responsibilities need your full attention this year. In daily life: repairs, a parent needing help, feeling the weight of family expectations, or making hard decisions about where you live.',
      5: 'Creative expression and romance become more serious. In daily life: creative projects require discipline rather than inspiration. Dating feels mature, not casual. If you have children, their needs ask more structure from you.',
      6: 'Your health, work habits, and daily routines are getting your full attention. In daily life: committing to better habits — doctor visits, meal prep, earlier bedtimes. Work feels like a grind but steady effort builds real skills.',
      7: 'This year asks you to get real about partnerships. Solid relationships get stronger; anything built on sand gets rebuilt. In daily life: honest conversations with a partner about what\'s working. Couples may formalize or separate. You learn exactly where the boundaries are.',
      8: 'Deep change and shared resources are in focus — facing fears, dealing with finances tied to others, or letting go of old baggage. In daily life: insurance claims, debt restructuring, or a period where you confront something you\'ve been avoiding about trust in close relationships.',
      9: 'Your beliefs and big-picture vision are getting a reality check. In daily life: a learning commitment that demands real work, travel that\'s more purpose than vacation, or a period where your assumptions are tested by experience.',
      10: 'Your career and public role are getting your full attention — professional responsibilities increase significantly. In daily life: heavier workload, performance reviews, or stepping into a role that comes with real accountability. What you build professionally this year lasts.',
      11: 'Your friendships and future vision need honest assessment. In daily life: you may drift away from connections that don\'t share your values, join a structured group, or realize some friendships require actual work to maintain.',
      12: 'Inner work and quiet processing take priority — you need more alone time this year. In daily life: therapy, meditation practice, a need to withdraw and recharge, or caring for someone behind the scenes.',
    };

    const SATURN_HOUSE_THEME: Record<number, string> = {
      1: 'Maturity in Identity', 2: 'Financial Discipline', 3: 'Serious Communication',
      4: 'Family Responsibility', 5: 'Disciplined Creativity', 6: 'Health & Work Mastery',
      7: 'Partnership Reality Check', 8: 'Deep Financial & Emotional Restructuring',
      9: 'Beliefs Tested by Reality', 10: 'Career Accountability',
      11: 'Friendship & Vision Audit', 12: 'Inner Work & Quiet Processing',
    };

    const isRetro = !!(saturnPos as any).isRetrograde;
    const retroNote = isRetro
      ? ' This year, the lessons here are turned inward — instead of external pressure, the real work is psychological. You\'re re-examining old commitments and whether the structures you\'ve built still hold. Progress feels slow because the growth is internal, but what you resolve now prevents repeating the same patterns.'
      : '';
    saturnFocus = {
      sign: saturnPos.sign,
      house: satSRHouse,
      natalHouse: satNatalHouse,
      isRetrograde: isRetro,
      theme: satSRHouse ? (SATURN_HOUSE_THEME[satSRHouse] || 'Commitment & Responsibility') : 'Commitment & Responsibility',
      interpretation: (satSRHouse ? (saturnHouseInterps[satSRHouse] || '') : 'This year asks you to get real about your commitments and responsibilities. Solid foundations get stronger; anything built on shaky ground gets rebuilt.') + retroNote,
    };
  }

  // ─── 19. North Node Focus ─────────────────────────────────────────
  let nodesFocus: SRNodesFocus | null = null;
  const nnPos = srChart.planets.NorthNode as any;
  if (nnPos?.sign) {
    const nnDeg = toAbsDeg(nnPos);
    const nnHouse = nnDeg !== null ? findSRHouse(nnDeg, srChart) : null;

    // Find North Node's natal house from houseOverlays
    const nnOverlay = houseOverlays.find(o => o.planet === 'NorthNode');
    const nnNatalHouse = nnOverlay?.natalHouse ?? null;
    const nnSrInNatalHouse = nnOverlay?.srInNatalHouse ?? null;

    const NODE_SIGN_GROWTH: Record<string, string> = {
      Aries: 'developing courage, independence, and the willingness to act first and ask permission later',
      Taurus: 'building stability, trusting your own resources, and learning to slow down and savor',
      Gemini: 'staying curious, communicating openly, and engaging with the world around you',
      Cancer: 'nurturing yourself and others, creating emotional safety, and trusting vulnerability',
      Leo: 'creative self-expression, stepping into the spotlight, and daring to lead with your heart',
      Virgo: 'practical service, refining your daily rituals, and finding mastery in the details',
      Libra: 'learning partnership, diplomacy, and how to create harmony without losing yourself',
      Scorpio: 'emotional depth, surrendering control, and trusting the transformative process',
      Sagittarius: 'expanding your worldview, seeking direct experience, and forming your own philosophy',
      Capricorn: 'stepping into authority, building something that lasts, and earning your place',
      Aquarius: 'thinking beyond yourself, serving the collective, and embracing what makes you different',
      Pisces: 'dissolving rigid boundaries, trusting intuition over logic, and surrendering to something larger',
    };

    const NODE_HOUSE_DAILY: Record<number, string> = {
      1: 'making decisions for yourself, initiating without waiting for permission, and building a stronger sense of who you are apart from others',
      2: 'managing your own money, developing skills that feel valuable, and grounding yourself in what you actually need versus what feels familiar',
      3: 'writing, speaking up in daily conversations, asking questions, and connecting with siblings or neighbors in new ways',
      4: 'creating a home that feels like yours, cooking, nesting, having difficult family conversations, and building emotional foundations',
      5: 'making art, taking creative risks, dating, playing, and allowing yourself to be seen without a filter',
      6: 'overhauling your daily routines, paying attention to what you eat and how you move, and showing up consistently even when nobody is watching',
      7: 'committing to real partnership, compromising without people-pleasing, and learning to truly share your life with another person',
      8: 'sharing resources, having honest conversations about money and power, and letting yourself be emotionally vulnerable with someone you trust',
      9: 'traveling, studying something that challenges your assumptions, teaching what you know, and forming beliefs through lived experience rather than theory',
      10: 'taking on professional responsibility, being visible in your career, and accepting that leadership requires showing up imperfectly',
      11: 'joining groups, pursuing a cause bigger than yourself, and contributing to community even when it feels uncomfortable',
      12: 'meditation, therapy, journaling, spending time alone, and releasing the need to control every outcome',
    };

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
      12: 'Growth comes through quiet reflection, solitude, and letting go of control. Trust the process and release the old.',
    };
    const NODE_HOUSE_THEME: Record<number, string> = {
      1: 'Self-Leadership', 2: 'Building Self-Worth', 3: 'Finding Your Voice',
      4: 'Emotional Foundations', 5: 'Creative Courage', 6: 'Daily Mastery',
      7: 'Partnership Growth', 8: 'Depth & Vulnerability', 9: 'Expanding Horizons',
      10: 'Stepping Into Authority', 11: 'Community Purpose', 12: 'Spiritual Surrender',
    };

    // Build rich interpretation
    let fullInterp = '';
    const signGrowth = NODE_SIGN_GROWTH[nnPos.sign];
    if (signGrowth) {
      fullInterp += `In ${nnPos.sign}, your growth direction this year is about ${signGrowth}. `;
    }
    if (nnHouse) {
      fullInterp += nodeHouseInterps[nnHouse] || '';
      const daily = NODE_HOUSE_DAILY[nnHouse];
      if (daily) {
        fullInterp += ` In daily life, this looks like ${daily}. `;
      }
    }
    // Natal vs SR shift
    if (nnNatalHouse && nnHouse && nnNatalHouse !== nnHouse) {
      fullInterp += `Your natal North Node lives in House ${nnNatalHouse} (${houseThemes[nnNatalHouse] || ''}), but this year it activates House ${nnHouse} (${houseThemes[nnHouse] || ''}) — a shift in where your soul growth is focused. `;
    } else if (nnNatalHouse && nnHouse && nnNatalHouse === nnHouse) {
      fullInterp += `Your North Node returns to its natal House ${nnNatalHouse} this year — a powerful reinforcement of your life-long growth direction. `;
    }
    if (nnSrInNatalHouse && nnSrInNatalHouse !== nnHouse) {
      fullInterp += `The SR North Node degree falls in your natal House ${nnSrInNatalHouse} (${houseThemes[nnSrInNatalHouse] || ''}), connecting this year's growth to that natal life area.`;
    }

    nodesFocus = {
      sign: nnPos.sign,
      house: nnHouse,
      theme: nnHouse ? (NODE_HOUSE_THEME[nnHouse] || 'Growth Edge') : 'Growth Edge',
      interpretation: fullInterp.trim() || 'Your growth edge this year points toward what feels unfamiliar but true — lean into the discomfort.',
    };
  }

  // ─── SR Ascendant falling in natal house ──
  let srAscInNatalHouse: SolarReturnAnalysis['srAscInNatalHouse'] = null;
  if (srAsc) {
    const srAscDeg = toAbsDeg(srAsc);
    if (srAscDeg !== null) {
      const nh = findNatalHouse(srAscDeg, natalChart);
      if (nh) {
        const theme = houseThemes[nh] || '';
        const srAscNatalHouseInterps: Record<number, string> = {
          1: 'This year\'s energy lands directly on your identity. This is personal. You are the main character, and the events of the year shape how you see yourself.',
          2: 'This year\'s energy flows into money, possessions, and self-worth. Financial matters and questions of value are where the year\'s story plays out.',
          3: 'Communication, learning, and your immediate environment absorb this year\'s energy. Words, ideas, and local connections matter more than usual.',
          4: 'Home, family, roots, and emotional foundations are the stage for this year. Domestic life and inner security are central.',
          5: 'Creativity, romance, and joy are where this year\'s energy lands. Self-expression and what brings you alive are front and center.',
          6: 'Daily routines, health, and work absorb this year\'s themes. How you show up day-to-day and care for your body defines the year.',
          7: 'Partnerships and significant others are the primary arena this year. Another person plays a defining role.',
          8: 'Deep change, shared resources, and intimacy are activated. Something important is ready to transform.',
          9: 'Travel, higher learning, and expansion of your worldview absorb this year\'s themes. A quest for meaning drives the year.',
          10: 'Career, public reputation, and your legacy are where this year\'s energy concentrates. You are visible and your professional identity is in focus.',
          11: 'Community, friendships, and your vision for the future absorb this year\'s themes. Groups and collective purpose define the year.',
          12: 'This year\'s energy is directed inward, toward solitude, reflection, and quiet inner processes. What happens behind the scenes matters most.',
        };
        srAscInNatalHouse = {
          natalHouse: nh,
          natalHouseTheme: theme,
          interpretation: srAscNatalHouseInterps[nh] || `This year\'s energy focuses on ${theme.toLowerCase()}.`,
        };
      }
    }
  }

  // ─── Natal Degree Conduits (SR planet on natal degree = "conduit") ──
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
        const CONDUIT_INTERPS: Record<string, Record<string, string>> = {
          Sun: { Ascendant: 'Your identity and vitality land directly on your rising degree — this year you ARE your Sun sign in a way people can see. Expect a confidence boost and stronger sense of self.',
            Moon: 'Your conscious will sits on your emotional core — head and heart align this year. Decisions feel clearer because what you want and what you need are the same thing.',
            Mercury: 'Your purpose activates your communication style — you speak with authority this year and people listen. Writing, teaching, or important conversations carry real weight.',
            Venus: 'Your identity lands on your love nature — this year, who you are and what you attract are inseparable. Personal magnetism is high.',
            Mars: 'Your purpose fires up your drive — ambition and identity merge. You pursue goals with unusual clarity and force.',
            Jupiter: 'Your core self activates your expansion point — confidence, opportunity, and growth feel natural and personally meaningful.',
            Saturn: 'Your vitality meets your discipline point — maturity is not optional this year. You step into real responsibility willingly.',
            NorthNode: 'Your purpose activates your growth direction — this is a year where doing what comes naturally IS the growth path.',
            default: 'Your core identity reawakens the themes of your natal placement — expect those life areas to feel more vivid and personally important.' },
          Moon: { Sun: 'Your emotional needs sit on your identity degree — everything this year filters through how you feel. Mood drives decisions more than logic.',
            Ascendant: 'Your emotional self is visible on the surface — others sense your feelings immediately. Vulnerability becomes a strength.',
            Mercury: 'Your feelings activate your communication — you speak from the heart this year, and emotional intelligence guides conversations.',
            Venus: 'Your emotional needs merge with your love nature — what you feel and what you want in relationships are indistinguishable.',
            Mars: 'Your emotions fuel your drive — passion runs high, but so does reactivity. Channel feelings into action rather than conflict.',
            Saturn: 'Your emotional body meets your discipline point — feelings are contained but honest. Emotional maturity deepens.',
            NorthNode: 'Your emotional instincts point toward growth — trust your gut feelings about the direction your life needs to take.',
            default: 'Your emotional radar locks onto this natal point — expect heightened sensitivity around these life themes.' },
          Mercury: { Sun: 'Your communication lands on your identity degree — this year your words define you. How you think and speak shapes how others perceive your core self.',
            Moon: 'Your mind sits on your emotional core — overthinking feelings is likely, but so is emotional articulation. Journal, talk, process.',
            Venus: 'Your communication activates your love nature — flirtation, love letters, important conversations about values and relationships.',
            Mars: 'Your thinking activates your drive — sharp mind, quick decisions, possible arguments that actually clear the air.',
            Jupiter: 'Your communication expands your growth — teaching, publishing, or a conversation that opens an entirely new worldview.',
            Saturn: 'Your mind meets your discipline point — serious thinking, important paperwork, commitments put into writing.',
            Ascendant: 'Your communication style is front and center — you come across as articulate, curious, and mentally sharp this year.',
            default: 'Your thinking and communication reawaken this natal theme — expect mental activity and important conversations around these life areas.' },
          Venus: { Mars: 'Venus lands on your Mars degree — desire and attraction merge. Relationships feel magnetic and decisive.',
            Sun: 'Venus activates your identity — you feel more attractive, artistic, and socially magnetic. Self-worth and self-expression align.',
            Moon: 'Venus touches your emotional core — comfort, beauty, and pleasure heal emotional needs. Nurturing through love and luxury.',
            Mercury: 'Venus meets your communication — sweet words, diplomatic conversations, artistic writing or speaking.',
            Jupiter: 'Venus expands on your growth point — love, money, and pleasure all feel abundant and generous.',
            Saturn: 'Venus meets your discipline — love gets serious. Commitments, loyalty tests, and relationships that prove their worth.',
            NorthNode: 'Venus activates your growth direction — love, beauty, or financial opportunity IS the growth path this year.',
            Ascendant: 'Venus on your rising degree — you radiate charm and attractiveness. People are drawn to you without effort.',
            default: 'Venus activates this natal point — expect more pleasure, beauty, and ease around these life themes.' },
          Mars: { Venus: 'Mars lands on your Venus degree — passion and pursuit merge. You go after what you want in love and money with unusual directness.',
            Sun: 'Mars fires up your identity — assertiveness, courage, and competitive drive define how you show up.',
            Moon: 'Mars sits on your emotional core — feelings run hot. Anger and passion surface quickly but honestly.',
            Mercury: 'Mars activates your communication — sharp tongue, decisive words, arguments that actually resolve things.',
            Saturn: 'Mars meets your discipline point — controlled force, strategic action, the ability to endure and push through.',
            Jupiter: 'Mars expands your ambition — bold moves, calculated risks, and the drive to go bigger than usual.',
            Ascendant: 'Mars on your rising degree — you come across as bold, assertive, and physically energized. Others feel your presence.',
            default: 'Mars reactivates this natal point — expect increased energy, drive, or conflict around these themes.' },
          Jupiter: { Sun: 'Jupiter expands your identity — confidence is high, opportunities align with who you are, and generosity comes naturally.',
            Moon: 'Jupiter lifts your emotional life — optimism, emotional generosity, and a feeling that things will work out.',
            Venus: 'Jupiter blesses your love and finances — abundance in relationships and money. The risk is overindulgence.',
            Saturn: 'Jupiter meets your discipline — structured growth, rewarded hard work, and expansion that actually lasts.',
            Mars: 'Jupiter amplifies your drive — big ambitions, bold actions, and the confidence to take calculated risks.',
            Mercury: 'Jupiter expands your mind — big ideas, important learning, and conversations that change your worldview.',
            NorthNode: 'Jupiter activates your growth direction — this is a year of accelerated spiritual and personal development.',
            default: 'Jupiter expands this natal point — growth, opportunity, and optimism flow into these life themes.' },
          Saturn: { Sun: 'Saturn lands on your identity degree — a serious year of maturation. You feel older, more responsible, and less tolerant of anything that wastes your time.',
            Moon: 'Saturn sits on your emotional core — feelings are heavy but honest. Emotional maturity comes through accepting what you cannot change.',
            Venus: 'Saturn presses on your love and values — relationships face a reality check. What is real survives; what is not, ends.',
            Mars: 'Saturn constrains your drive — frustration with pace, but also disciplined effort that builds something lasting.',
            Jupiter: 'Saturn meets your expansion point — growth slows but solidifies. What you build now has real foundations.',
            Mercury: 'Saturn weighs on your communication — words carry gravity, contracts matter, and careless speech has consequences.',
            Ascendant: 'Saturn on your rising degree — you appear more serious, authoritative, and older. People take you seriously this year.',
            NorthNode: 'Saturn activates your growth direction — the growth path requires hard work, discipline, and patience.',
            default: 'Saturn reactivates this natal point — expect a test or restructuring around these themes.' },
          Uranus: { Sun: 'Uranus electrifies your identity — expect sudden shifts in how you see yourself and how others see you. Liberation from old roles.',
            Moon: 'Uranus disrupts your emotional patterns — feelings are unpredictable but liberating. Old emotional habits break.',
            Venus: 'Uranus shakes your love life — sudden attractions, breakups, or a complete redefinition of what you value.',
            Mars: 'Uranus charges your drive — impulsive action, breakthroughs through unconventional methods, rebellion against constraints.',
            Saturn: 'Uranus meets your structure — the establishment gets disrupted. Rules you have followed for years suddenly feel obsolete.',
            Ascendant: 'Uranus on your rising degree — you reinvent your image, appearance, or public persona in a sudden, dramatic way.',
            default: 'Uranus electrifies this natal point — sudden changes, breakthroughs, or disruptions activate these themes.' },
          Neptune: { Sun: 'Neptune dissolves your identity boundaries — you feel more permeable, empathic, and uncertain about who you are. Creativity soars but clarity drops.',
            Moon: 'Neptune softens your emotional core — heightened intuition, vivid dreams, but also emotional confusion and boundary issues.',
            Venus: 'Neptune romanticizes your love nature — idealization, soul mate fantasies, and the need to see partners clearly through the fog.',
            Mars: 'Neptune undermines your drive — motivation feels diffuse, indirect action works better than force, and escapism tempts.',
            Saturn: 'Neptune dissolves your structure — rules and discipline feel meaningless. Faith replaces certainty.',
            Mercury: 'Neptune clouds your thinking — inspired creativity and intuitive insights, but also miscommunication and misunderstandings.',
            Ascendant: 'Neptune on your rising degree — you appear ethereal, chameleon-like, and hard to pin down. Artistic expression flourishes.',
            default: 'Neptune dissolves boundaries around this natal point — expect heightened intuition but also potential confusion.' },
          Pluto: { Sun: 'Pluto transforms your identity — a fundamental shift in who you are. The old self dies so the new self can emerge.',
            Moon: 'Pluto penetrates your emotional core — deep feelings surface, power dynamics in relationships become visible, catharsis.',
            Venus: 'Pluto intensifies your love life — obsessive attractions, financial power plays, and relationships that change you permanently.',
            Mars: 'Pluto supercharges your drive — relentless willpower, but also power struggles and the temptation to control outcomes.',
            Saturn: 'Pluto meets your structure — institutional power shifts, career upheavals, or dismantling systems that no longer serve.',
            Mercury: 'Pluto deepens your thinking — research, investigation, and conversations that reveal hidden truths.',
            Ascendant: 'Pluto on your rising degree — a year of dramatic personal transformation visible to everyone around you.',
            NorthNode: 'Pluto activates your growth direction — evolution is not optional, and the transformation is permanent.',
            default: 'Pluto intensifies this natal point — deep transformation and power shifts activate around these themes.' },
          Chiron: { Ascendant: 'The wounded healer sits on your rising degree — old insecurities surface publicly, but so does your ability to help others through similar pain.',
            Moon: 'Chiron on your emotional core — old wounds resurface for healing. This is tender but ultimately freeing.',
            Sun: 'Chiron on your identity degree — a year of healing your relationship with yourself. The wound becomes the gift.',
            Venus: 'Chiron touches your love nature — old relationship wounds reopen for healing. Vulnerability in love becomes transformative.',
            Saturn: 'Chiron meets your discipline — the wound around authority, achievement, or fatherhood asks to be acknowledged.',
            NorthNode: 'Chiron activates your growth direction — healing IS the growth path. Your pain becomes your purpose.',
            default: 'Chiron reactivates this natal point — expect old sensitivities to surface, creating opportunities for genuine healing.' },
        };
        const interpMap = CONDUIT_INTERPS[srPlanet] || {};
        const specificInterp = interpMap[natPlanet] || interpMap['default'] || `SR ${srPlanet} sits on the degree of your natal ${natPlanet}, reawakening those birth chart themes through ${srPlanet}'s current expression.`;
        natalDegreeConduits.push({
          srPlanet,
          natalPlanet: natPlanet,
          srSign: srPos.sign,
          degree: `${srPos.degree}\u00B0${(srPos as any).minutes || 0}'`,
          orb: Math.round(diff * 10) / 10,
          interpretation: specificInterp,
        });
      }
    }
  }
  natalDegreeConduits.sort((a, b) => a.orb - b.orb);

  // ─── SR Moon Aspects (frozen snapshot at the SR moment) ──
  // The SR Moon's aspects to other SR planets describe the emotional climate for the year.
  // These are STATIC aspects — the Moon does NOT advance through the chart.
  const srMoonAspects: SolarReturnAnalysis['srMoonAspects'] = [];

  const moonSRHouse = moonHouse?.house ?? null;
  const moonSRHouseTheme = moonSRHouse ? (SR_HOUSE_LIFE_AREA[moonSRHouse] || houseThemes[moonSRHouse] || '') : '';

  // Build house-aware, phase-aware moon aspect interpretations
  const buildMoonAspectInterp = (
    planet: string, aspectType: string, targetHouse: number | null, targetSign: string
  ): string => {
    const planetTheme = PLANET_THEMES[planet] || { domain: `${planet} themes`, drive: `${planet}'s drive`, body: '' };
    const targetHouseTheme = targetHouse ? (SR_HOUSE_LIFE_AREA[targetHouse] || '') : '';
    const moonHouseDesc = moonSRHouse ? `Your Moon sits in your ${moonSRHouse}${moonSRHouse === 1 ? 'st' : moonSRHouse === 2 ? 'nd' : moonSRHouse === 3 ? 'rd' : 'th'} house (${moonSRHouseTheme})` : 'Your Moon';
    const targetHouseDesc = targetHouse ? ` in your ${targetHouse}${targetHouse === 1 ? 'st' : targetHouse === 2 ? 'nd' : targetHouse === 3 ? 'rd' : 'th'} house (${targetHouseTheme})` : '';
    const feel = ASPECT_FEEL[aspectType] || ASPECT_FEEL.Conjunction;

    // Special handling for Sun conjunction: check moon phase
    if (planet === 'Sun' && aspectType === 'Conjunction') {
      const phase = moonPhase?.phase || '';
      if (phase === 'Balsamic') {
        return `${moonHouseDesc}, and the Sun${targetHouseDesc} are in a Balsamic conjunction. This is the END of a cycle, not a beginning. Your emotional life this year is about surrender, completion, and letting go. You are closing out old patterns and preparing the ground for something new that has not yet arrived. Rest, reflection, and release are the work. Resist the urge to start new things. Honor what is finishing.`;
      }
      if (phase === 'Last Quarter') {
        return `${moonHouseDesc}, and the Sun${targetHouseDesc} are conjunct in a late-cycle phase. This is a year of reorientation. Old emotional patterns are being released. You are shedding what no longer fits before a new direction emerges.`;
      }
      // True New Moon (phase angle < 22.5)
      return `${moonHouseDesc}, and the Sun${targetHouseDesc} are in a true New Moon conjunction. This is a powerful fresh start. Your emotional needs and conscious purpose are fused into a single drive. A year of planting seeds and new emotional beginnings.`;
    }

    return `${moonHouseDesc}. ${planet} in ${targetSign}${targetHouseDesc} ${feel.verb} your emotional baseline. ${planetTheme.domain.charAt(0).toUpperCase() + planetTheme.domain.slice(1)} directly shapes how you feel day-to-day. The ${aspectType.toLowerCase()} creates ${feel.quality} between your emotional needs and ${planet}'s themes.`;
  };

  if (moonPos) {
    const moonDeg = toAbsDeg(moonPos);
    if (moonDeg !== null) {
      for (const planet of ALL_PLANETS) {
        if (planet === 'Moon') continue;
        const pos = srChart.planets[planet as keyof typeof srChart.planets];
        if (!pos) continue;
        const pDeg = toAbsDeg(pos);
        if (pDeg === null) continue;
        const targetHouse = planetSRHouses[planet] ?? null;
        const targetSign = pos.sign || '';
        const targetHouseTheme = targetHouse ? (SR_HOUSE_LIFE_AREA[targetHouse] || houseThemes[targetHouse] || '') : '';
        const asp = detectAspect(moonDeg, pDeg);
        if (asp && asp.orb <= 8) {
          const interpretation = buildMoonAspectInterp(planet, asp.type, targetHouse, targetSign);
          srMoonAspects.push({
            targetPlanet: planet,
            aspectType: asp.type,
            orb: asp.orb,
            targetSRHouse: targetHouse,
            targetSRSign: targetSign,
            sourceSRHouse: moonSRHouse,
            sourceHouseTheme: moonSRHouseTheme,
            targetHouseTheme,
            interpretation,
          });
        }
      }
      srMoonAspects.sort((a, b) => a.orb - b.orb);
    }
  }

  // ─── Moon Void of Course (Unaspected in SR) ──
  // If the SR Moon makes no major aspects (conjunction, sextile, square, trine, opposition)
  // to any other SR planet within orb, it is considered "void of course" in the SR chart.
  // This is a significant condition: the Moon operates independently, without planetary dialogue.
  const moonVOC = srMoonAspects.length === 0 && moonPos !== undefined;

  // ─── Moon Angularity (true degree-based, not house-based) ──
  // Check if Moon is within 5° of any angle cusp (ASC, IC, DSC, MC)
  let moonAngularity: SolarReturnAnalysis['moonAngularity'] = null;
  const moonHouseNum = moonHouse?.house ?? null;
  if (moonPos) {
    const moonDeg = toAbsDeg(moonPos);
    if (moonDeg !== null) {
      const angleCusps = [
        srChart.houseCusps?.house1,  // ASC
        srChart.houseCusps?.house4,  // IC
        srChart.houseCusps?.house7,  // DSC
        srChart.houseCusps?.house10, // MC
      ];
      let isConjunctAngle = false;
      for (const cusp of angleCusps) {
        if (!cusp) continue;
        const cuspDeg = toAbsDeg(cusp);
        if (cuspDeg === null) continue;
        let diff = Math.abs(moonDeg - cuspDeg);
        if (diff > 180) diff = 360 - diff;
        if (diff <= 5) { isConjunctAngle = true; break; }
      }

      if (isConjunctAngle) {
        moonAngularity = 'angular';
      } else {
        const succedentHousesSet = [2, 5, 8, 11];
        moonAngularity = moonHouseNum
          ? succedentHousesSet.includes(moonHouseNum) ? 'succedent' : 'cadent'
          : null;
      }
    }
  }

  // ─── Moon Late Degree ──
  const moonLateDegree = moonPos ? parseInt(String(moonPos.degree)) >= 25 : false;

  // ─── Moon 19-Year Metonic Cycle ──
  // Include past ages, current age, and next 3 future occurrences
  const currentAge = profectionYear?.age ?? 0;
  const moonMetonicAges: number[] = [];
  if (currentAge > 0) {
    const startRemainder = currentAge % 19;
    const firstAge = startRemainder === 0 ? 19 : startRemainder;
    for (let a = firstAge; a <= currentAge + 57; a += 19) {
      if (a > 0) moonMetonicAges.push(a);
    }
  }

  // Keep moonTimingEvents empty (deprecated — the technique was incorrectly attributed)
  const moonTimingEvents: SolarReturnAnalysis['moonTimingEvents'] = [];

  // ─── Vertex Calculation ─────────────────────────────────────────────
  let vertex: SRVertexData | null = null;
  const srMC = srChart.houseCusps?.house10;
  const locationStr = srChart.solarReturnLocation || srChart.birthLocation || '';
  const latitude = parseLatitudeFromLocation(locationStr);
  if (srMC && latitude !== null) {
    const vPos = calculateVertex(srMC.sign, srMC.degree, (srMC as any).minutes || 0, latitude);
    if (vPos) {
      const vAbsDeg = SIGNS.indexOf(vPos.sign) * 30 + vPos.degree + vPos.minutes / 60;
      const vHouse = findSRHouse(vAbsDeg, srChart);
      // Find aspects to Vertex
      const vAspects: { planet: string; aspectType: string; orb: number }[] = [];
      for (const p of [...ALL_PLANETS, 'Ascendant', 'NorthNode'] as const) {
        const pPos = srChart.planets[p as keyof typeof srChart.planets];
        if (!pPos) continue;
        const pDeg = toAbsDeg(pPos);
        if (pDeg === null) continue;
        const asp = detectAspect(vAbsDeg, pDeg);
        if (asp && asp.orb <= 5) {
          vAspects.push({ planet: p, aspectType: asp.type, orb: asp.orb });
        }
      }
      // Also check natal planets aspecting SR Vertex
      for (const p of [...ALL_PLANETS, 'Ascendant', 'NorthNode'] as const) {
        const pPos = natalChart.planets[p as keyof typeof natalChart.planets];
        if (!pPos) continue;
        const pDeg = toAbsDeg(pPos);
        if (pDeg === null) continue;
        const asp = detectAspect(vAbsDeg, pDeg);
        if (asp && asp.orb <= 3) {
          vAspects.push({ planet: `Natal ${p}`, aspectType: asp.type, orb: asp.orb });
        }
      }
      vAspects.sort((a, b) => a.orb - b.orb);
      vertex = { sign: vPos.sign, degree: vPos.degree, minutes: vPos.minutes, house: vHouse, aspects: vAspects };
    }
  }

  // ─── Tier 4 Calculations ──────────────────────────────────────────
  const mutualReceptions = calculateMutualReceptions(srChart);
  const dignityReport = calculateDignityReport(srChart, planetSRHouses);
  const healthOverlay = calculateHealthOverlay(srChart, natalChart, planetSRHouses, srInternalAspects);
  const eclipseSensitivity = calculateEclipseSensitivity(
    srChart,
    natalChart,
    srChart.solarReturnYear,
    srChart.solarReturnDateTime,
    natalChart.birthDate,
  );
  const enhancedRetrogrades = calculateEnhancedRetrogrades(srChart, srChart.solarReturnYear);
  // Fill in house numbers for enhanced retrogrades
  for (const r of enhancedRetrogrades) {
    r.house = planetSRHouses[r.planet] ?? null;
  }
  const birthMonth = natalChart.birthDate ? parseInt(natalChart.birthDate.slice(5, 7), 10) - 1 : 0;
  const quarterlyFocus = calculateQuarterlyFocus(srChart, natalChart, planetSRHouses, srChart.solarReturnYear, birthMonth);
  const dominantPlanets = calculateDominantPlanets(srChart, natalChart, planetSRHouses, angularPlanetsDetailed, srToNatalAspects as any, srInternalAspects as any);

  // ─── Tier 5 Calculations ──────────────────────────────────────────
  const fixedStars = calculateFixedStars(srChart, natalChart, srChart.solarReturnYear);
  
  // Arabic Parts need a house-finding function
  const findSRHouseForParts = (deg: number): number | null => {
    const cusps = extractCusps(srChart);
    return cusps ? findHouseInCusps(deg, cusps) : null;
  };
  const arabicParts = calculateArabicParts(srChart, findSRHouseForParts, planetSRHouses);
  
  const t5Age = profectionYear?.age ?? 0;
  const firdaria = calculateFirdaria(t5Age);
  const antisciaContacts = calculateAntiscia(srChart, natalChart);
  const solarArcs = calculateSolarArcs(srChart, natalChart, t5Age);
  const synthesisSections = calculateSynthesisSections(srChart, natalChart, planetSRHouses, srToNatalAspects, houseOverlays);

  // ─── Tier 5b: New Techniques ──────────────────────────────────────
  const midpointHits = calculateMidpoints(srChart, natalChart);
  const prenatalEclipse = calculatePrenatalEclipse(natalChart, srChart);
  const planetarySpeeds = calculatePlanetarySpeeds(srChart);
  const heliacalRising = calculateHeliacalRising(srChart);

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
    angularPlanetsDetailed,
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
    srMoonAspects,
    moonAngularity,
    moonVOC,
    moonLateDegree,
    moonMetonicAges,
    vertex,
    planetSRHouses,
    // Tier 4
    mutualReceptions,
    dignityReport,
    healthOverlay,
    eclipseSensitivity,
    enhancedRetrogrades,
    quarterlyFocus,
    dominantPlanets,
    // Tier 5
    fixedStars,
    arabicParts,
    firdaria,
    antisciaContacts,
    solarArcs,
    synthesisSections,
    // Tier 5b
    midpointHits,
    prenatalEclipse,
    planetarySpeeds,
    heliacalRising,
  };
};
