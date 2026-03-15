import * as Astronomy from 'astronomy-engine';
import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { detectTimezoneFromLocation, isUSDaylightSavingTime } from './astrology';

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Sign meanings for progressed moon interpretation - RICH CLIENT-READY DESCRIPTIONS
const PROGRESSED_MOON_SIGN_MEANINGS: Record<string, {
  theme: string;
  focus: string;
  keywords: string[];
  fullDescription: string;
  clientSummary: string;
}> = {
  Aries: {
    theme: "New beginnings and self-assertion",
    focus: "Taking initiative, independence, courage, starting fresh",
    keywords: ["independence", "courage", "new starts", "self-focus", "action"],
    fullDescription: "This is a time of emotional rebirth. You're learning to put yourself first — not in a selfish way, but in the necessary way of someone who has been giving too much. Your feelings are fiery, immediate, and honest. You may feel impatient, restless, or ready to fight for what matters. New impulses emerge. You want to START something. Old emotional patterns that kept you passive or dependent are burning away.",
    clientSummary: "Your emotional body is waking up. Expect strong impulses to take action, assert boundaries, and begin new chapters. You may feel more competitive, more easily frustrated, but also more ALIVE. Trust the urge to put yourself first right now."
  },
  Taurus: {
    theme: "Building security and comfort",
    focus: "Finances, physical comfort, stability, sensuality, values",
    keywords: ["stability", "finances", "comfort", "patience", "beauty"],
    fullDescription: "After the fire of Aries, you're entering a phase of stabilization. Your emotional needs now center on SECURITY — financial, physical, and sensory. You crave what is reliable, beautiful, and nourishing. This is not a time for risk-taking but for building solid foundations. Your relationship to money, food, and physical pleasure is being emotionally processed.",
    clientSummary: "Right now, your soul is asking for stability. You'll find yourself drawn to comfort, quality, and financial security. Don't rush — this phase teaches patience and the value of what you already have. Build slowly. Invest in quality. Enjoy your senses."
  },
  Gemini: {
    theme: "Communication and learning",
    focus: "Mental stimulation, siblings, short trips, networking, writing",
    keywords: ["communication", "learning", "curiosity", "versatility", "connections"],
    fullDescription: "Your emotional life becomes more mental and social. You NEED to talk, learn, connect. Siblings, neighbors, and local community may feature prominently. You're emotionally restless — one thing isn't enough. You need variety, stimulation, and mental engagement. Writing, teaching, and short trips feed your soul.",
    clientSummary: "You're emotionally hungry for ideas, conversation, and new experiences. This is a chatty, curious phase. Your nervous system is more active — you need mental stimulation but watch for scattered energy. Learning something new will nourish you deeply."
  },
  Cancer: {
    theme: "Home and emotional foundations",
    focus: "Family, home, nurturing, emotional security, ancestry",
    keywords: ["home", "family", "nurturing", "emotions", "security"],
    fullDescription: "The Progressed Moon returns to its home sign. This is the most emotionally sensitive phase of the entire 28-year cycle. Home, family, parents, ancestry, and emotional foundations are paramount. You may move, renovate, reconnect with family, or deeply process childhood patterns. Your needs for safety and belonging are strong.",
    clientSummary: "This is a deeply emotional time when family, home, and your sense of belonging matter most. You may feel more vulnerable, more connected to your roots, and more aware of what 'home' really means to you. Nurture yourself and your inner child."
  },
  Leo: {
    theme: "Creative self-expression",
    focus: "Romance, children, creativity, drama, leadership, joy",
    keywords: ["creativity", "romance", "children", "joy", "self-expression"],
    fullDescription: "After the inward focus of Cancer, you emerge into the light wanting to SHINE. Romance, creative expression, children, and anything that makes you feel special and recognized become emotionally important. You need applause, play, and self-expression. There's a childlike quality to this phase — follow your joy.",
    clientSummary: "Your heart wants to play, create, and be seen. Romance may flourish. Creative projects feed your soul. Don't be shy — this phase asks you to step into the spotlight and let your unique light shine. Joy is not optional; it's medicine."
  },
  Virgo: {
    theme: "Health and service",
    focus: "Work routines, health habits, analysis, improvement, service",
    keywords: ["health", "service", "details", "improvement", "work"],
    fullDescription: "The party is over; now you organize what you've created. Your emotional needs shift toward usefulness, health, and practical improvement. You feel emotionally satisfied when being of service, when your daily routines are humming, when you're making something BETTER. Perfectionism may intensify — be gentle with yourself.",
    clientSummary: "Right now, getting your life in order feeds your soul. Health routines, organizing your space, being useful to others — these bring deep emotional satisfaction. Watch for critical self-talk, but embrace the urge to improve and serve."
  },
  Libra: {
    theme: "Partnership and harmony",
    focus: "Relationships, balance, beauty, diplomacy, marriage",
    keywords: ["partnership", "balance", "beauty", "harmony", "relationships"],
    fullDescription: "Relationship becomes the mirror for your emotional growth. You need partnership — romantic, business, creative. You're learning about balance, fairness, and the art of compromise. Beauty and aesthetics matter deeply. You may marry, commit, or deeply reconsider your approach to 'the other.'",
    clientSummary: "Your emotional focus is on relationships now. Partnership matters. You're learning when to compromise and when to hold your ground. Beauty and harmony feed your soul — surround yourself with both. This is not the time to go it alone."
  },
  Scorpio: {
    theme: "Transformation and depth",
    focus: "Intensity, shared resources, intimacy, power, rebirth",
    keywords: ["transformation", "intensity", "depth", "power", "healing"],
    fullDescription: "This is the INTENSE phase. Superficial emotional connections won't satisfy. You crave depth, truth, intimacy — even if it's uncomfortable. Power dynamics, sexuality, shared finances, and psychological undercurrents demand your attention. Old emotional patterns must die for new ones to be born. This is the 'death and rebirth' phase.",
    clientSummary: "You're in a transformational period. Expect deep feelings, power dynamics surfacing, and a need for emotional truth. Nothing superficial will satisfy. This is psychological spring cleaning — painful but necessary. What dies now makes space for your next chapter."
  },
  Sagittarius: {
    theme: "Expansion and philosophy",
    focus: "Travel, higher learning, beliefs, adventure, optimism",
    keywords: ["adventure", "philosophy", "travel", "growth", "freedom"],
    fullDescription: "After Scorpio's intensity, you need SPACE — physical, mental, spiritual. Travel calls. Higher learning beckons. Your beliefs and philosophy of life are being emotionally processed. You need adventure, meaning, and freedom. Stagnation feels intolerable. You're searching for the bigger picture.",
    clientSummary: "Your soul is restless for adventure, meaning, and expansion. Travel, study, or exploring new belief systems will feed you deeply. You can't tolerate small thinking or confinement right now. Think bigger. Aim higher. The world is calling."
  },
  Capricorn: {
    theme: "Career and responsibility",
    focus: "Ambition, structure, achievement, authority, discipline",
    keywords: ["career", "ambition", "discipline", "structure", "achievement"],
    fullDescription: "Time to get serious about your place in the world. Career, public reputation, and achievement become emotionally important. You need to BUILD something that matters. Authority figures and your relationship to authority come into focus. This is a maturing phase — less about feelings, more about results.",
    clientSummary: "Career and public standing matter now. You're emotionally driven to achieve, to build something real, to be respected. Don't avoid ambition — embrace it. Structure and discipline feed your soul. This is a 'get serious' chapter."
  },
  Aquarius: {
    theme: "Community and innovation",
    focus: "Friends, groups, ideals, technology, humanitarian causes",
    keywords: ["community", "innovation", "ideals", "friendship", "uniqueness"],
    fullDescription: "After Capricorn's traditional climb, you need to connect with YOUR PEOPLE — friends, groups, communities that share your ideals. Emotional satisfaction comes from contributing to something larger than yourself. Technology, innovation, and progressive ideas appeal. You may feel emotionally detached but deeply connected to humanity.",
    clientSummary: "Community and friendship feed your soul now. You need to belong to groups that share your values. Don't isolate — connect with your 'tribe.' Progressive ideas and humanitarian causes may call strongly. Embrace your uniqueness."
  },
  Pisces: {
    theme: "Spirituality and transcendence",
    focus: "Dreams, intuition, compassion, creativity, spiritual growth",
    keywords: ["spirituality", "dreams", "compassion", "intuition", "creativity"],
    fullDescription: "The final sign of the zodiac brings a culminating, transcendent phase. Boundaries dissolve. Intuition heightens. You may feel more emotionally permeable, picking up on others' feelings. Creativity, spirituality, and compassion become paramount. This is a 'letting go' phase before the next cycle begins in Aries.",
    clientSummary: "You're in a deeply spiritual, intuitive phase. Boundaries may feel thin — you absorb others' feelings easily. Creativity and spirituality nourish you. Some confusion is normal; you're preparing for a new cycle. Trust your dreams and inner guidance."
  },
};

// House meanings for context - RICH CLIENT-READY DESCRIPTIONS
const HOUSE_MEANINGS: Record<number, { short: string; themes: string; clientFeel: string }> = {
  1: { 
    short: "Self & Identity", 
    themes: "personal appearance, self-image, new beginnings",
    clientFeel: "When your progressed Moon is in the 1st house, YOU become the emotional focus. How you present yourself, your body, your persona — all these feel emotionally charged. New beginnings emerge naturally. You're more visible and personally sensitive. Others respond to your emotional state directly."
  },
  2: { 
    short: "Money & Values", 
    themes: "income, possessions, self-worth, resources",
    clientFeel: "Your emotional security is tied to MONEY and resources during this phase. Financial concerns, income changes, and your relationship to material possessions become emotionally loaded. Self-worth issues may surface. What you own and earn reflects how you feel about yourself."
  },
  3: { 
    short: "Communication", 
    themes: "siblings, short trips, learning, neighbors",
    clientFeel: "Your emotional life becomes busier, more connected, more verbal. Siblings, neighbors, and local community matter. You need to TALK about your feelings. Short trips, learning new skills, and constant communication feed your soul. The mind is active — perhaps too active. Journaling helps."
  },
  4: { 
    short: "Home & Family", 
    themes: "roots, parents, emotional foundations, real estate",
    clientFeel: "This is the most DEEPLY PERSONAL house. Home, family, parents, and your emotional roots are paramount. You may move, renovate, or deal intensely with family dynamics. Childhood memories surface. You need a safe nest. This is the 'back to basics' emotional time."
  },
  5: { 
    short: "Creativity & Romance", 
    themes: "children, dating, hobbies, self-expression",
    clientFeel: "JOY becomes your emotional priority. Romance, creativity, hobbies, and anything playful feed your soul. Children may be a focus — having them, relating to them, or reconnecting with your own inner child. You need to create and be seen. Fun is not optional."
  },
  6: { 
    short: "Health & Work", 
    themes: "daily routines, service, pets, wellness",
    clientFeel: "Your emotional wellbeing is now tied to your DAILY LIFE — work routines, health habits, being useful. You feel emotionally satisfied when organized, productive, and of service. Health issues may demand attention. Pets can be emotionally significant. The devil is in the details."
  },
  7: { 
    short: "Partnership", 
    themes: "marriage, business partners, contracts, open enemies",
    clientFeel: "ONE-ON-ONE RELATIONSHIPS become your emotional crucible. Marriage, committed partnership, or significant others dominate your emotional landscape. You may marry, partner, or fundamentally reconsider how you 'do' relationship. You learn about yourself through the mirror of the other."
  },
  8: { 
    short: "Transformation", 
    themes: "shared resources, intimacy, death/rebirth, inheritance",
    clientFeel: "This is the INTENSE emotional house. Sexuality, shared money/resources, psychological depth, power dynamics, and death/rebirth themes are emotionally activated. Nothing superficial satisfies. You're processing deep, often hidden material. Therapy is powerful now. Trust the transformation."
  },
  9: { 
    short: "Philosophy & Travel", 
    themes: "higher education, beliefs, foreign lands, publishing",
    clientFeel: "Your emotional needs EXPAND. Travel, higher education, philosophy, and exploring beliefs become emotionally important. You can't stay small or local — you need the big picture. Foreign cultures or people may feature. Publishing, teaching, or broadcasting can be emotionally fulfilling."
  },
  10: { 
    short: "Career & Status", 
    themes: "profession, reputation, public life, authority",
    clientFeel: "Your CAREER and public standing become emotionally charged. How the world sees you matters deeply. Professional achievements bring emotional satisfaction; career setbacks hit harder. Your relationship with authority figures (or being one) is processed. Ambition drives you."
  },
  11: { 
    short: "Community", 
    themes: "friends, groups, hopes, humanitarian causes",
    clientFeel: "FRIENDSHIP and group belonging become your emotional home. You need your tribe, your community, people who share your ideals. Causes larger than yourself call to you. Social networks matter. Your hopes and wishes for the future are emotionally activated."
  },
  12: { 
    short: "Spirituality", 
    themes: "hidden matters, retreat, institutions, karma",
    clientFeel: "This is the most INWARD phase. You may need solitude, retreat, or spiritual practice. The unconscious speaks loudly through dreams. Old karmic patterns surface for release. Hospitals, prisons, or institutions may be significant. The veil is thin. This is the ending before a new beginning."
  },
};

// Planet symbols
const PLANET_SYMBOLS: Record<string, string> = {
  Sun: '☉',
  Moon: '☽',
  Mercury: '☿',
  Venus: '♀',
  Mars: '♂',
};

// Aspect symbols
const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌',
  opposition: '☍',
  square: '□',
  trine: '△',
};

// Convert natal position to longitude
const natalPositionToLongitude = (position: NatalPlanetPosition): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + position.degree + position.minutes / 60 + (position.seconds || 0) / 3600;
};

// Get sign from longitude
const getSignFromLongitude = (longitude: number): string => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedLon / 30);
  return ZODIAC_SIGNS[signIndex];
};

// Get degree within sign
const getDegreeInSign = (longitude: number): number => {
  const normalizedLon = ((longitude % 360) + 360) % 360;
  return normalizedLon % 30;
};

// Get next sign
const getNextSign = (currentSign: string): string => {
  const index = ZODIAC_SIGNS.indexOf(currentSign);
  return ZODIAC_SIGNS[(index + 1) % 12];
};

export interface ProgressedPlanet {
  planet: string;
  longitude: number;
  sign: string;
  degree: number;
  retrograde: boolean;
}

export interface HouseChangeInfo {
  currentHouse: number | null;
  nextHouse: number | null;
  monthsUntilHouseChange: number | null;
  houseChangeDate: Date | null;
  whatHouseChangeBrings: string;
  howItFeelsBefore: string;
}

export interface ProgressedMoonPhase {
  phaseName: string;
  phaseAngle: number; // 0-360
  description: string;
  lifeTheme: string;
  timing: string;
}

export interface ProgressedMoonInfo {
  sign: string;
  degree: number;
  exactDegree: number; // Full decimal
  house: number | null;
  phase: 'Waxing' | 'Waning';
  phaseDescription: string;
  detailedPhase: ProgressedMoonPhase;
  signMeaning: typeof PROGRESSED_MOON_SIGN_MEANINGS[string];
  houseMeaning: typeof HOUSE_MEANINGS[number] | null;
  monthsUntilSignChange: number;
  signChangeDate: Date;
  nextSign: string;
  houseChange: HouseChangeInfo;
  currentExperience: string;
  upcomingShift: string;
}

export interface ProgressedAspect {
  progressedPlanet: string;
  natalPlanet: string;
  aspect: string;
  aspectSymbol: string;
  orb: number;
  interpretation: string;
}

export interface SecondaryProgressions {
  progressedDate: Date;
  ageInYears: number;
  planets: Record<string, ProgressedPlanet>;
}

// Parse birth date from chart with timezone awareness
// Returns a Date object adjusted to UTC for accurate ephemeris calculations
const parseBirthDate = (chart: NatalChart): Date | null => {
  try {
    const [year, month, day] = chart.birthDate.split('-').map(Number);
    const timeParts = chart.birthTime?.split(':').map(Number) || [12, 0];
    const [hour, minute] = timeParts;
    
    // Create a local date first to check DST
    const localDate = new Date(year, month - 1, day, hour, minute);
    
    // Try to detect timezone from birth location
    let timezoneOffset = 0; // Default to UTC if unknown
    
    if (chart.birthLocation) {
      const detected = detectTimezoneFromLocation(chart.birthLocation, localDate);
      if (detected) {
        timezoneOffset = detected.offset;
      }
    }
    
    // Convert local birth time to UTC
    // If birth was at 17:50 EST (UTC-5), UTC time is 22:50
    // We create the UTC date by subtracting the offset hours
    const utcDate = new Date(Date.UTC(
      year, 
      month - 1, 
      day, 
      hour - timezoneOffset, // Subtract offset to get UTC
      minute
    ));
    
    return utcDate;
  } catch {
    return null;
  }
};

// Calculate Secondary Progressions
// "A day for a year" - each day after birth represents a year of life
export const calculateSecondaryProgressions = (
  natalChart: NatalChart,
  currentDate: Date
): SecondaryProgressions | null => {
  const birthDate = parseBirthDate(natalChart);
  if (!birthDate) return null;
  
  // Convert currentDate to UTC for consistent comparison
  // Since birthDate is now in UTC, we need currentDate in UTC too
  const currentDateUTC = new Date(Date.UTC(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate(),
    currentDate.getHours(),
    currentDate.getMinutes()
  ));
  
  // Calculate precise age in days (including fractional days)
  // Both dates are now in UTC for accurate comparison
  const msSinceBirth = currentDateUTC.getTime() - birthDate.getTime();
  const daysSinceBirth = msSinceBirth / (1000 * 60 * 60 * 24);
  const ageInYears = daysSinceBirth / 365.25;
  
  // For secondary progressions: each day after birth = 1 year of life
  // So for someone who is 40 years old, we look at where the planets were
  // 40 days after their birth
  const progressedDays = ageInYears; // days after birth
  
  // Create the progressed date with fractional day precision
  // This date is in UTC which is what astronomy-engine expects
  const progressedDate = new Date(birthDate.getTime() + progressedDays * 24 * 60 * 60 * 1000);
  
  // Create AstroTime for the astronomy library
  const astroTime = Astronomy.MakeTime(progressedDate);
  
  const progressedPlanets: SecondaryProgressions['planets'] = {};
  
  // Calculate progressed positions for personal planets
  const planetBodies: Record<string, Astronomy.Body> = {
    Sun: Astronomy.Body.Sun,
    Moon: Astronomy.Body.Moon,
    Mercury: Astronomy.Body.Mercury,
    Venus: Astronomy.Body.Venus,
    Mars: Astronomy.Body.Mars,
  };
  
  for (const [planetName, body] of Object.entries(planetBodies)) {
    try {
      // Use GeoVector with the AstroTime object for accuracy
      const vector = Astronomy.GeoVector(body, astroTime, true);
      const ecliptic = Astronomy.Ecliptic(vector);
      const longitude = ecliptic.elon;
      
      progressedPlanets[planetName] = {
        planet: planetName,
        longitude,
        sign: getSignFromLongitude(longitude),
        degree: getDegreeInSign(longitude),
        retrograde: false,
      };
    } catch (e) {
      console.warn(`Failed to calculate progressed ${planetName}:`, e);
    }
  }
  
  return {
    progressedDate,
    ageInYears,
    planets: progressedPlanets,
  };
};

// Get the house a planet is in based on house cusps
const getPlanetHouse = (planetLongitude: number, houseCusps: NatalChart['houseCusps']): number | null => {
  if (!houseCusps) return null;
  
  const cusps: number[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}` as keyof typeof houseCusps];
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
      // House spans 0°
      if (normalizedPlanet >= cuspStart || normalizedPlanet < cuspEnd) {
        return i + 1;
      }
    }
  }
  
  return null;
};

// Calculate 8-phase progressed Moon phase
const getDetailedProgressedMoonPhase = (
  moonLongitude: number,
  sunLongitude: number
): ProgressedMoonPhase => {
  let angle = moonLongitude - sunLongitude;
  if (angle < 0) angle += 360;
  
  // 8 phases of ~45° each
  if (angle < 45) {
    return {
      phaseName: 'New Moon Phase',
      phaseAngle: angle,
      description: 'Subjective, instinctive, new beginnings emerging from the dark',
      lifeTheme: 'A new cycle is beginning. You may feel pulled to start something entirely new, break from the past, or plant seeds for the future. This is a time of emergence — trust your instincts even when you cannot see clearly.',
      timing: 'Duration: ~3.5 years from the progressed New Moon'
    };
  } else if (angle < 90) {
    return {
      phaseName: 'Crescent Moon Phase',
      phaseAngle: angle,
      description: 'Struggle, breakthrough, asserting the new against the old',
      lifeTheme: 'What you started at the New Moon now meets resistance. The past pulls at you. This is a testing phase where you must fight for your vision. Crisis of momentum — push through or fall back.',
      timing: 'Duration: ~3.5 years | Building phase'
    };
  } else if (angle < 135) {
    return {
      phaseName: 'First Quarter Phase',
      phaseAngle: angle,
      description: 'Crisis in action, decisive turning point, building structures',
      lifeTheme: 'A decisive moment. The first quarter square demands action and commitment. You must make real-world choices that structure your path. No more dreaming — build something concrete.',
      timing: 'Duration: ~3.5 years | Action required'
    };
  } else if (angle < 180) {
    return {
      phaseName: 'Gibbous Moon Phase',
      phaseAngle: angle,
      description: 'Refinement, perfecting, preparing for culmination',
      lifeTheme: 'Analysis and refinement dominate. You are preparing for something to come to fruition. Improve your methods, study, train, perfect. The harvest approaches but is not yet here.',
      timing: 'Duration: ~3.5 years | Preparation phase'
    };
  } else if (angle < 225) {
    return {
      phaseName: 'Full Moon Phase',
      phaseAngle: angle,
      description: 'Culmination, maximum illumination, relationship awareness',
      lifeTheme: 'Maximum visibility. What you have been building is now seen clearly — by you and others. Relationships come into sharp focus. Fulfillment OR disillusionment, depending on what you built. Clarity about whether the path is right.',
      timing: 'Duration: ~3.5 years | Culmination'
    };
  } else if (angle < 270) {
    return {
      phaseName: 'Disseminating Moon Phase',
      phaseAngle: angle,
      description: 'Sharing, teaching, distributing what was learned',
      lifeTheme: 'Time to share what you have learned. Teaching, mentoring, publishing, spreading your message. You have wisdom from the Full Moon experience — now pass it on. Meaning comes through contribution.',
      timing: 'Duration: ~3.5 years | Distribution phase'
    };
  } else if (angle < 315) {
    return {
      phaseName: 'Last Quarter Phase',
      phaseAngle: angle,
      description: 'Crisis in consciousness, reorientation, letting go',
      lifeTheme: 'A crisis of meaning. The old structures no longer satisfy. You must reorient your consciousness, question beliefs, let go of what no longer serves. Clearing and pruning for the next cycle.',
      timing: 'Duration: ~3.5 years | Reorientation'
    };
  } else {
    return {
      phaseName: 'Balsamic Moon Phase',
      phaseAngle: angle,
      description: 'Release, endings, seed planting for the future',
      lifeTheme: 'The darkest phase before the new beginning. Endings, completions, surrender. Release the past. You may feel isolated or drawn inward. Seeds are being planted in the dark for the next 28-year cycle.',
      timing: 'Duration: ~3.5 years | Completion phase'
    };
  }
};

// Calculate house change info
const calculateHouseChange = (
  moonLongitude: number,
  houseCusps: NatalChart['houseCusps']
): HouseChangeInfo => {
  if (!houseCusps) {
    return {
      currentHouse: null,
      nextHouse: null,
      monthsUntilHouseChange: null,
      houseChangeDate: null,
      whatHouseChangeBrings: '',
      howItFeelsBefore: ''
    };
  }
  
  const cusps: { house: number; longitude: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    const cusp = houseCusps[`house${i}` as keyof typeof houseCusps];
    if (cusp) {
      const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
      if (signIndex >= 0) {
        cusps.push({
          house: i,
          longitude: signIndex * 30 + cusp.degree + cusp.minutes / 60
        });
      }
    }
  }
  
  if (cusps.length !== 12) {
    return {
      currentHouse: null,
      nextHouse: null,
      monthsUntilHouseChange: null,
      houseChangeDate: null,
      whatHouseChangeBrings: '',
      howItFeelsBefore: ''
    };
  }
  
  // Sort cusps by longitude for finding next cusp
  const sortedCusps = [...cusps].sort((a, b) => a.longitude - b.longitude);
  const normalizedMoon = ((moonLongitude % 360) + 360) % 360;
  
  // Find current house
  let currentHouse: number | null = null;
  for (let i = 0; i < 12; i++) {
    const cuspStart = cusps[i].longitude;
    const cuspEnd = cusps[(i + 1) % 12].longitude;
    
    if (cuspEnd > cuspStart) {
      if (normalizedMoon >= cuspStart && normalizedMoon < cuspEnd) {
        currentHouse = i + 1;
        break;
      }
    } else {
      if (normalizedMoon >= cuspStart || normalizedMoon < cuspEnd) {
        currentHouse = i + 1;
        break;
      }
    }
  }
  
  if (!currentHouse) currentHouse = 1;
  
  // Find next house cusp
  const nextHouse = currentHouse === 12 ? 1 : currentHouse + 1;
  const nextCusp = cusps.find(c => c.house === nextHouse);
  
  if (!nextCusp) {
    return {
      currentHouse,
      nextHouse: null,
      monthsUntilHouseChange: null,
      houseChangeDate: null,
      whatHouseChangeBrings: '',
      howItFeelsBefore: ''
    };
  }
  
  // Calculate degrees until house change
  let degreesUntilHouseChange = nextCusp.longitude - normalizedMoon;
  if (degreesUntilHouseChange < 0) degreesUntilHouseChange += 360;
  if (degreesUntilHouseChange > 30) degreesUntilHouseChange = degreesUntilHouseChange % 30;
  
  // Progressed Moon moves ~1° per month (actually ~13° per year / 12 = ~1.08°/month)
  const monthsUntilHouseChange = Math.round(degreesUntilHouseChange / 1.08);
  
  const houseChangeDate = new Date();
  houseChangeDate.setMonth(houseChangeDate.getMonth() + monthsUntilHouseChange);
  
  const nextHouseMeaning = HOUSE_MEANINGS[nextHouse];
  const currentHouseMeaning = HOUSE_MEANINGS[currentHouse];
  
  return {
    currentHouse,
    nextHouse,
    monthsUntilHouseChange,
    houseChangeDate,
    whatHouseChangeBrings: `When your Progressed Moon enters the ${nextHouse}${getOrdinalSuffix(nextHouse)} house, your emotional focus shifts to ${nextHouseMeaning?.themes || 'new areas'}. This is when you'll FEEL the change — your needs, security concerns, and daily emotional preoccupations will reorganize around ${nextHouseMeaning?.short || 'new themes'}.`,
    howItFeelsBefore: `In the final months of house ${currentHouse}, you may feel a growing restlessness with ${currentHouseMeaning?.short || 'current themes'} — a sense that this chapter is completing. Pay attention to what feels "done" and what naturally draws your attention toward ${nextHouseMeaning?.short || 'what comes next'}.`
  };
};

const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

// Get Progressed Moon info (MOST IMPORTANT!)
export const getProgressedMoonInfo = (
  progressions: SecondaryProgressions,
  natalChart: NatalChart
): ProgressedMoonInfo | null => {
  const progMoon = progressions.planets['Moon'];
  const progSun = progressions.planets['Sun'];
  
  if (!progMoon) return null;
  
  // Progressed Moon moves ~13° per year = ~1.08° per month
  // More accurate calculation for sign change
  const currentDegree = progMoon.degree;
  const degreesUntilSignChange = 30 - currentDegree;
  const monthsUntilSignChange = Math.round(degreesUntilSignChange / 1.08);
  
  const signChangeDate = new Date();
  signChangeDate.setMonth(signChangeDate.getMonth() + monthsUntilSignChange);
  
  // Determine house and house change info
  const house = getPlanetHouse(progMoon.longitude, natalChart.houseCusps);
  const houseChange = calculateHouseChange(progMoon.longitude, natalChart.houseCusps);
  
  // Determine phase (waxing/waning based on relationship to Progressed Sun)
  let phase: 'Waxing' | 'Waning' = 'Waxing';
  let phaseDescription = 'Growth and building phase';
  let detailedPhase: ProgressedMoonPhase;
  
  if (progSun) {
    let diff = progMoon.longitude - progSun.longitude;
    if (diff < 0) diff += 360;
    
    if (diff >= 180) {
      phase = 'Waning';
      phaseDescription = 'Release and integration phase';
    }
    
    detailedPhase = getDetailedProgressedMoonPhase(progMoon.longitude, progSun.longitude);
  } else {
    detailedPhase = {
      phaseName: 'Unknown',
      phaseAngle: 0,
      description: 'Unable to calculate phase without Progressed Sun',
      lifeTheme: '',
      timing: ''
    };
  }
  
  const signMeaning = PROGRESSED_MOON_SIGN_MEANINGS[progMoon.sign];
  const nextSign = getNextSign(progMoon.sign);
  const nextSignMeaning = PROGRESSED_MOON_SIGN_MEANINGS[nextSign];
  
  // Generate current experience description
  const currentExperience = `Your emotional life is currently colored by ${progMoon.sign} themes: ${signMeaning?.focus || ''}. At ${Math.floor(currentDegree)}°, you are ${currentDegree < 10 ? 'still learning the lessons of this sign' : currentDegree < 20 ? 'in the middle of this emotional chapter' : 'approaching the end of this phase, preparing for transition'}.`;
  
  // Generate upcoming shift description
  let upcomingShift = '';
  if (houseChange.monthsUntilHouseChange && houseChange.monthsUntilHouseChange < monthsUntilSignChange) {
    upcomingShift = `Your next major shift is a HOUSE change in ~${houseChange.monthsUntilHouseChange} months (before the sign change). ${houseChange.howItFeelsBefore}`;
  } else {
    upcomingShift = `In ~${monthsUntilSignChange} months, your Progressed Moon enters ${nextSign}. Your emotional needs will shift toward: ${nextSignMeaning?.focus || 'new themes'}. Begin noticing what calls to you from ${nextSign} energy.`;
  }
  
  return {
    sign: progMoon.sign,
    degree: Math.floor(progMoon.degree),
    exactDegree: progMoon.degree,
    house,
    phase,
    phaseDescription,
    detailedPhase,
    signMeaning,
    houseMeaning: house ? HOUSE_MEANINGS[house] : null,
    monthsUntilSignChange,
    signChangeDate,
    nextSign,
    houseChange,
    currentExperience,
    upcomingShift
  };
};

// Find Progressed to Natal aspects
export const findProgressedAspects = (
  progressions: SecondaryProgressions,
  natalChart: NatalChart
): ProgressedAspect[] => {
  const aspects: ProgressedAspect[] = [];
  
  const aspectTypes = [
    { name: 'conjunction', angle: 0, orb: 1 },
    { name: 'opposition', angle: 180, orb: 1 },
    { name: 'square', angle: 90, orb: 1 },
    { name: 'trine', angle: 120, orb: 1 },
  ];
  
  for (const [progPlanetName, progData] of Object.entries(progressions.planets)) {
    for (const natalPlanetName of ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Ascendant']) {
      if (progPlanetName === natalPlanetName) continue;
      
      const natalPosition = natalChart.planets[natalPlanetName as keyof typeof natalChart.planets];
      if (!natalPosition) continue;
      
      const natalLongitude = natalPositionToLongitude(natalPosition);
      
      let diff = Math.abs(progData.longitude - natalLongitude);
      if (diff > 180) diff = 360 - diff;
      
      for (const aspectType of aspectTypes) {
        const angleDiff = Math.abs(diff - aspectType.angle);
        if (angleDiff <= aspectType.orb) {
          aspects.push({
            progressedPlanet: progPlanetName,
            natalPlanet: natalPlanetName,
            aspect: aspectType.name,
            aspectSymbol: ASPECT_SYMBOLS[aspectType.name],
            orb: parseFloat(angleDiff.toFixed(2)),
            interpretation: getProgressedInterpretation(progPlanetName, natalPlanetName, aspectType.name),
          });
        }
      }
    }
  }
  
  return aspects.sort((a, b) => a.orb - b.orb);
};

// Get interpretation for progressed aspect - RICH CLIENT-READY
const getProgressedInterpretation = (progPlanet: string, natalPlanet: string, aspect: string): string => {
  const interpretations: Record<string, string> = {
    // Progressed Moon aspects - THE BIG ONES
    'Moon-Sun-conjunction': "🔴 MAJOR: Progressed Moon conjunct natal Sun — This is one of the most significant transits of your entire life. Your emotional self and core identity merge. A new 28-year emotional cycle begins. Expect profound personal shifts, new beginnings, and a sense of starting fresh. You ARE your feelings right now.",
    'Moon-Moon-conjunction': "🔴 MAJOR: Progressed Moon returns to natal Moon — Lunar Return in progressions. A complete emotional cycle has completed. Deep emotional reset. Themes from 28 years ago may resurface for integration.",
    'Moon-Mercury-conjunction': "Progressed Moon conjunct natal Mercury — Your mind and emotions are speaking the same language. Important conversations, decisions, or communications. You're processing feelings through words and ideas.",
    'Moon-Venus-conjunction': "🟠 IMPORTANT: Progressed Moon conjunct natal Venus — Emotional focus on love, beauty, relationships, and values. Romance may bloom. Creative inspiration flows. You feel more lovable and loving.",
    'Moon-Mars-conjunction': "🟠 IMPORTANT: Progressed Moon conjunct natal Mars — Emotional energy intensifies. You may feel more assertive, passionate, or easily frustrated. Take action on emotional needs. Assert your feelings. Some conflict is productive.",
    'Moon-Jupiter-conjunction': "Progressed Moon conjunct natal Jupiter — Emotional expansion and optimism. Opportunities feel especially lucky. Growth through nurturing. Family may expand. You feel emotionally generous.",
    'Moon-Saturn-conjunction': "🟠 IMPORTANT: Progressed Moon conjunct natal Saturn — A serious, maturing emotional period. Responsibilities feel heavy. Emotional discipline required. You're building emotional structures that will last.",
    'Moon-Uranus-conjunction': "🟠 IMPORTANT: Progressed Moon conjunct natal Uranus — Expect emotional surprises and sudden changes. Your feelings rebel against restriction. Liberation from old emotional patterns. Electric, unpredictable.",
    'Moon-Neptune-conjunction': "Progressed Moon conjunct natal Neptune — Heightened intuition, sensitivity, and creativity. Boundaries dissolve. Dreams are powerful. Spiritual and artistic peak, but watch for confusion.",
    'Moon-Pluto-conjunction': "🔴 MAJOR: Progressed Moon conjunct natal Pluto — Intense emotional transformation. Deep psychological material surfaces. Power dynamics activate. Emotional death and rebirth. Therapy is powerful.",
    'Moon-Ascendant-conjunction': "🔴 MAJOR: Progressed Moon conjunct Ascendant — A peak emotional visibility moment. Your feelings are seen by everyone. Major new beginning in how you present yourself. Others respond directly to your emotional state.",
    'Moon-MC-conjunction': "🔴 MAJOR: Progressed Moon conjunct Midheaven — Career and public life become emotionally significant. Your nurturing qualities are publicly visible. Professional decisions feel personal.",
    'Moon-IC-conjunction': "🔴 MAJOR: Progressed Moon conjunct IC — The deepest point of the chart. Home, family, roots, and emotional foundations are paramount. Moving, family changes, or deep processing of early life.",
    'Moon-Descendant-conjunction': "🔴 MAJOR: Progressed Moon conjunct Descendant — Relationships take center stage emotionally. Marriage, partnership, or major relationship developments. You meet yourself through the other.",
    
    // Oppositions
    'Moon-Sun-opposition': "🟠 IMPORTANT: Progressed Moon opposite natal Sun — The Full Moon point of your progressed cycle. Maximum illumination. What you started 14 years ago culminates. Relationships reveal tensions between self and other.",
    'Moon-Moon-opposition': "Progressed Moon opposite natal Moon — Emotional polarity. You're experiencing the opposite of your natural emotional nature. Integration required. Relationship themes emerge.",
    'Moon-Ascendant-opposition': "Progressed Moon opposite Ascendant (conjunct Descendant) — Relationship focus peaks. Partnership matters dominate your emotional life.",
    
    // Squares
    'Moon-Sun-square': "Progressed Moon square natal Sun — Friction between feelings and identity. A turning point requiring action. Inner tension demands resolution.",
    'Moon-Moon-square': "Progressed Moon square natal Moon — Emotional crisis point. Your current emotional needs conflict with your natural patterns. Adjustment required.",
    
    // Other progressed planets
    'Sun-Moon-conjunction': "Progressed Sun conjunct natal Moon = Core identity touches emotional foundations. Major integration of self and feelings.",
    'Sun-Venus-conjunction': "Progressed Sun conjunct natal Venus = Core self aligns with love and creativity. Artistic expression or romantic highlight.",
    'Venus-Sun-conjunction': "Progressed Venus conjunct natal Sun = Love and beauty themes prominent. Relationships highlighted. Creative period.",
    'Mars-Sun-conjunction': "Progressed Mars conjunct natal Sun = Action and assertion activated. Time to pursue goals with vigor.",
  };
  
  const key = `${progPlanet}-${natalPlanet}-${aspect}`;
  return interpretations[key] || `Progressed ${progPlanet} ${ASPECT_SYMBOLS[aspect] || aspect} natal ${natalPlanet}. Internal maturation brings this energy to consciousness.`;
};

// ── Progressed Lunation Cycle Timeline ───────────────────────────────
// Computes exact dates for each phase transition in the ~29.5-year
// secondary progressed Sun-Moon cycle across the user's entire life.

export interface ProgressedLunationPhase {
  phaseName: string;
  phaseEmoji: string;
  cycleStage: string;
  startDate: Date;
  startAge: number;
  endDate: Date | null;
  endAge: number | null;
  duration: string; // e.g. "~3.4 years"
  lifeTheme: string;
  isCurrent: boolean;
  cycleNumber: number; // which ~29.5 year cycle (1, 2, 3...)
}

const PROG_LUNATION_PHASES = [
  { boundary: 0, name: 'New Moon', emoji: '🌑', stage: 'Beginning', theme: 'A new ~29-year chapter begins. You feel pulled to start something entirely fresh — a new direction that comes from instinct, not planning. Seeds planted now grow for decades.' },
  { boundary: 45, name: 'Crescent', emoji: '🌒', stage: 'Emergence', theme: 'The new direction meets resistance from the past. Old habits, old identities pull backward. This is the struggle phase — push through or lose momentum. The effort you invest now determines whether the seed survives.' },
  { boundary: 90, name: 'First Quarter', emoji: '🌓', stage: 'Crisis of Action', theme: 'A decisive turning point. External circumstances force you to commit and build concrete structures for your vision. No more dreaming — act or lose the thread. Relationships and career may demand clear choices.' },
  { boundary: 135, name: 'Gibbous', emoji: '🌔', stage: 'Refinement', theme: 'The final preparation before results become visible. You refine your skills, analyze what\'s working, and perfect your approach. The harvest is close but not yet here. Patience and precision matter.' },
  { boundary: 180, name: 'Full Moon', emoji: '🌕', stage: 'Culmination', theme: 'Maximum illumination. What you\'ve been building reaches peak expression. Relationships serve as mirrors — you see yourself clearly through others. This is harvest time: fulfillment if you built well, reckoning if you didn\'t.' },
  { boundary: 225, name: 'Disseminating', emoji: '🌖', stage: 'Distribution', theme: 'Time to share what you\'ve gathered. Teaching, mentoring, publishing, contributing your experience to others. Meaning comes through generosity and passing on what you know.' },
  { boundary: 270, name: 'Last Quarter', emoji: '🌗', stage: 'Crisis of Consciousness', theme: 'The structures you built no longer fit. A fundamental reorientation of values and beliefs. You must let go of what no longer serves — even things that once defined you. This is pruning season.' },
  { boundary: 315, name: 'Balsamic', emoji: '🌘', stage: 'Completion', theme: 'The final phase before rebirth. Deep inward turning. Release, surrender, and clearing. You may feel isolated or drawn to solitude — this is preparation, not depression. Seeds for the next 29-year cycle are forming in the dark.' },
];

export function computeProgressedLunationTimeline(
  natalChart: NatalChart,
  currentDate: Date = new Date()
): ProgressedLunationPhase[] {
  const birthDate = parseBirthDate(natalChart);
  if (!birthDate) return [];

  const maxAge = 95; // compute up to age 95
  const stepMonths = 1; // monthly resolution
  const msPerDay = 24 * 60 * 60 * 1000;

  // Compute progressed Sun-Moon angle at monthly intervals
  interface DataPoint { date: Date; age: number; angle: number; }
  const dataPoints: DataPoint[] = [];

  for (let months = 0; months <= maxAge * 12; months += stepMonths) {
    const targetDate = new Date(birthDate.getTime());
    targetDate.setUTCMonth(targetDate.getUTCMonth() + months);

    const daysSinceBirth = (targetDate.getTime() - birthDate.getTime()) / msPerDay;
    const ageInYears = daysSinceBirth / 365.25;
    const progressedDays = ageInYears;
    const progressedDate = new Date(birthDate.getTime() + progressedDays * msPerDay);

    try {
      const astroTime = Astronomy.MakeTime(progressedDate);
      const sunVec = Astronomy.GeoVector(Astronomy.Body.Sun, astroTime, true);
      const moonVec = Astronomy.GeoVector(Astronomy.Body.Moon, astroTime, true);
      const sunLon = Astronomy.Ecliptic(sunVec).elon;
      const moonLon = Astronomy.Ecliptic(moonVec).elon;

      let angle = moonLon - sunLon;
      if (angle < 0) angle += 360;

      dataPoints.push({ date: targetDate, age: ageInYears, angle });
    } catch {
      // skip invalid dates
    }
  }

  if (dataPoints.length < 2) return [];

  // Find phase transitions
  const transitions: { phaseIndex: number; date: Date; age: number }[] = [];

  // First, determine initial phase
  const initialAngle = dataPoints[0].angle;
  let currentPhaseIdx = 0;
  for (let p = PROG_LUNATION_PHASES.length - 1; p >= 0; p--) {
    if (initialAngle >= PROG_LUNATION_PHASES[p].boundary) {
      currentPhaseIdx = p;
      break;
    }
  }
  transitions.push({ phaseIndex: currentPhaseIdx, date: dataPoints[0].date, age: 0 });

  // Scan for phase boundary crossings
  for (let i = 1; i < dataPoints.length; i++) {
    const prevAngle = dataPoints[i - 1].angle;
    const currAngle = dataPoints[i].angle;

    // Check each boundary
    for (let p = 0; p < PROG_LUNATION_PHASES.length; p++) {
      const boundary = PROG_LUNATION_PHASES[p].boundary;

      // Detect crossing: handle wrap-around at 0/360
      let crossed = false;
      if (boundary === 0) {
        // New Moon: angle wraps from ~350+ back to ~0+
        if (prevAngle > 300 && currAngle < 60) crossed = true;
      } else {
        // Normal boundary crossing
        if (prevAngle < boundary && currAngle >= boundary) crossed = true;
        // Handle case where angle jumps over boundary
        if (prevAngle > 300 && currAngle < 60 && boundary < 60) crossed = true;
      }

      if (crossed && p !== currentPhaseIdx) {
        // Interpolate the exact date
        let fraction = 0.5;
        if (boundary === 0) {
          // wrap logic
          const adjustedPrev = prevAngle;
          const adjustedCurr = currAngle + 360;
          fraction = (360 - adjustedPrev) / (adjustedCurr - adjustedPrev);
        } else {
          const range = currAngle - prevAngle;
          if (Math.abs(range) > 0.01) {
            fraction = (boundary - prevAngle) / range;
          }
        }
        fraction = Math.max(0, Math.min(1, fraction));

        const prevMs = dataPoints[i - 1].date.getTime();
        const currMs = dataPoints[i].date.getTime();
        const interpMs = prevMs + (currMs - prevMs) * fraction;
        const interpAge = dataPoints[i - 1].age + (dataPoints[i].age - dataPoints[i - 1].age) * fraction;

        transitions.push({ phaseIndex: p, date: new Date(interpMs), age: interpAge });
        currentPhaseIdx = p;
      }
    }
  }

  // Sort transitions chronologically
  transitions.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Remove duplicates (same phase within 6 months)
  const deduped: typeof transitions = [transitions[0]];
  for (let i = 1; i < transitions.length; i++) {
    const prev = deduped[deduped.length - 1];
    const curr = transitions[i];
    const monthsApart = (curr.date.getTime() - prev.date.getTime()) / (30 * msPerDay);
    if (curr.phaseIndex !== prev.phaseIndex || monthsApart > 6) {
      deduped.push(curr);
    }
  }

  // Build output phases
  const currentAge = (currentDate.getTime() - new Date(natalChart.birthDate).getTime()) / (365.25 * msPerDay);
  const result: ProgressedLunationPhase[] = [];
  let cycleNumber = 1;

  for (let i = 0; i < deduped.length; i++) {
    const t = deduped[i];
    const phaseData = PROG_LUNATION_PHASES[t.phaseIndex];
    const nextT = deduped[i + 1] || null;

    // Track cycle number (increment at each New Moon after the first)
    if (t.phaseIndex === 0 && i > 0) cycleNumber++;

    const startAge = t.age;
    const endAge = nextT ? nextT.age : null;
    const durationYears = endAge !== null ? endAge - startAge : null;

    result.push({
      phaseName: phaseData.name,
      phaseEmoji: phaseData.emoji,
      cycleStage: phaseData.stage,
      startDate: t.date,
      startAge,
      endDate: nextT?.date || null,
      endAge,
      duration: durationYears !== null ? `~${durationYears.toFixed(1)} years` : 'ongoing',
      lifeTheme: phaseData.theme,
      isCurrent: currentAge >= startAge && (endAge === null || currentAge < endAge),
      cycleNumber,
    });
  }

  return result;
}

// Export interface for progressed Moon transit alert
export interface ProgressedMoonTransit {
  type: 'progressed-moon';
  title: string;
  description: string;
  clientSummary: string;
  natalPlanet: string;
  aspectType: string;
  aspectSymbol: string;
  orb: number;
  motion: 'applying' | 'separating' | 'exact';
  monthsUntilExact: number | null;
  exactDate: Date | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  sign: string;
  house: number | null;
  signMeaning: typeof PROGRESSED_MOON_SIGN_MEANINGS[string] | null;
  houseMeaning: typeof HOUSE_MEANINGS[number] | null;
  phaseInfo: ProgressedMoonPhase | null;
}

// Calculate progressed Moon transits for the transit alerts section
export const calculateProgressedMoonTransits = (
  natalChart: NatalChart,
  currentDate: Date = new Date()
): ProgressedMoonTransit[] => {
  const transits: ProgressedMoonTransit[] = [];
  
  const progressions = calculateSecondaryProgressions(natalChart, currentDate);
  if (!progressions) return transits;
  
  const progMoon = progressions.planets['Moon'];
  const progSun = progressions.planets['Sun'];
  if (!progMoon) return transits;
  
  // Get phase info
  let phaseInfo: ProgressedMoonPhase | null = null;
  if (progSun) {
    phaseInfo = getDetailedProgressedMoonPhase(progMoon.longitude, progSun.longitude);
  }
  
  // Get house
  const house = getPlanetHouse(progMoon.longitude, natalChart.houseCusps);
  const signMeaning = PROGRESSED_MOON_SIGN_MEANINGS[progMoon.sign] || null;
  const houseMeaning = house ? HOUSE_MEANINGS[house] : null;
  
  // Check aspects to natal points
  const natalPoints = [
    'Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto', 'Ascendant', 'MC', 'IC', 'Descendant'
  ];
  
  const aspectTypes = [
    { name: 'conjunction', angle: 0, orb: 2, symbol: '☌' },
    { name: 'opposition', angle: 180, orb: 2, symbol: '☍' },
    { name: 'square', angle: 90, orb: 1.5, symbol: '□' },
    { name: 'trine', angle: 120, orb: 1.5, symbol: '△' },
  ];
  
  // Priority planets for determining importance
  const criticalPlanets = ['Sun', 'Moon', 'Ascendant', 'MC', 'IC', 'Descendant'];
  const highPlanets = ['Venus', 'Mars', 'Pluto', 'Saturn', 'Uranus'];
  
  for (const natalPlanetName of natalPoints) {
    let natalLongitude: number | null = null;
    
    // Get position from planets or calculate angles
    if (['Ascendant', 'MC', 'IC', 'Descendant'].includes(natalPlanetName)) {
      if (natalChart.houseCusps) {
        const houseKey = natalPlanetName === 'Ascendant' ? 'house1' :
                         natalPlanetName === 'IC' ? 'house4' :
                         natalPlanetName === 'Descendant' ? 'house7' :
                         natalPlanetName === 'MC' ? 'house10' : null;
        if (houseKey) {
          const cusp = natalChart.houseCusps[houseKey as keyof typeof natalChart.houseCusps];
          if (cusp) {
            const signIndex = ZODIAC_SIGNS.indexOf(cusp.sign);
            natalLongitude = signIndex * 30 + cusp.degree + cusp.minutes / 60;
          }
        }
      }
    } else {
      const natalPos = natalChart.planets[natalPlanetName as keyof typeof natalChart.planets];
      if (natalPos) {
        natalLongitude = natalPositionToLongitude(natalPos);
      }
    }
    
    if (natalLongitude === null) continue;
    
    for (const aspectDef of aspectTypes) {
      let diff = Math.abs(progMoon.longitude - natalLongitude);
      if (diff > 180) diff = 360 - diff;
      
      const angleDiff = Math.abs(diff - aspectDef.angle);
      if (angleDiff <= aspectDef.orb) {
        const interpretation = getProgressedInterpretation('Moon', natalPlanetName, aspectDef.name);
        
        // Determine priority
        let priority: 'critical' | 'high' | 'medium' | 'low' = 'medium';
        if (criticalPlanets.includes(natalPlanetName) && aspectDef.name === 'conjunction') {
          priority = 'critical';
        } else if (criticalPlanets.includes(natalPlanetName) || highPlanets.includes(natalPlanetName)) {
          priority = 'high';
        } else if (aspectDef.name === 'sextile') {
          priority = 'low';
        }
        
        // Calculate motion and timing
        // Progressed Moon moves ~1.08° per month
        // Check if applying (getting closer) or separating (getting farther)
        const isApplying = diff < aspectDef.angle;
        const isExact = angleDiff <= 0.1;
        let motion: 'applying' | 'separating' | 'exact' = isExact ? 'exact' : isApplying ? 'applying' : 'separating';
        
        // Calculate months until exact
        let monthsUntilExact: number | null = null;
        let exactDate: Date | null = null;
        
        if (isApplying && !isExact) {
          // Degrees until exact = angleDiff
          // Progressed Moon moves ~1.08° per month
          monthsUntilExact = Math.round(angleDiff / 1.08);
          exactDate = new Date(currentDate);
          exactDate.setMonth(exactDate.getMonth() + monthsUntilExact);
        } else if (isExact) {
          monthsUntilExact = 0;
          exactDate = currentDate;
        }
        
        transits.push({
          type: 'progressed-moon',
          title: `Progressed ☽ ${aspectDef.symbol} natal ${natalPlanetName}`,
          description: interpretation,
          clientSummary: signMeaning?.clientSummary || '',
          natalPlanet: natalPlanetName,
          aspectType: aspectDef.name,
          aspectSymbol: aspectDef.symbol,
          orb: parseFloat(angleDiff.toFixed(2)),
          motion,
          monthsUntilExact,
          exactDate,
          priority,
          sign: progMoon.sign,
          house,
          signMeaning,
          houseMeaning,
          phaseInfo
        });
      }
    }
  }
  
  // Always add the general progressed Moon position as context
  transits.unshift({
    type: 'progressed-moon',
    title: `Progressed ☽ in ${progMoon.sign} (House ${house || '?'})`,
    description: signMeaning?.fullDescription || `Progressed Moon in ${progMoon.sign}`,
    clientSummary: signMeaning?.clientSummary || '',
    natalPlanet: 'Position',
    aspectType: 'position',
    aspectSymbol: '',
    orb: 0,
    motion: 'exact',
    monthsUntilExact: null,
    exactDate: null,
    priority: 'high',
    sign: progMoon.sign,
    house,
    signMeaning,
    houseMeaning,
    phaseInfo
  });
  
  return transits;
};

// Get planet symbol
export const getProgressedPlanetSymbol = (planet: string): string => {
  return PLANET_SYMBOLS[planet] || planet.charAt(0);
};

// Format sign change date
export const formatSignChangeDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};
