// Birth Conditions - Moon Phase at Birth & Day/Night Sect Calculations
// These foundational conditions color the entire chart interpretation

import { NatalChart } from '@/hooks/useNatalChart';

// ============================================================================
// MOON PHASE AT BIRTH
// ============================================================================

export type BirthMoonPhase = 
  | 'New Moon'
  | 'Waxing Crescent'
  | 'First Quarter'
  | 'Waxing Gibbous'
  | 'Full Moon'
  | 'Waning Gibbous'
  | 'Last Quarter'
  | 'Balsamic';

export interface BirthMoonPhaseData {
  phase: BirthMoonPhase;
  illumination: number; // 0-100
  symbol: string;
  archetype: string;
  soulPurpose: string;
  expression: string;
  gift: string;
  challenge: string;
  lifeTheme: string;
}

const BIRTH_MOON_PHASES: Record<BirthMoonPhase, Omit<BirthMoonPhaseData, 'phase' | 'illumination'>> = {
  'New Moon': {
    symbol: '🌑',
    archetype: 'The Pioneer',
    soulPurpose: 'You were born at the start of a new cycle. Your soul is beginning something fresh—a new karmic chapter with little baggage from the past. You\'re here to initiate, to plant seeds, to trust your instincts even when you can\'t see the path.',
    expression: 'Instinctual, subjective, self-starting. You act first and understand later. Your Sun and Moon are fused—your identity and emotional needs are one, making you direct but sometimes blind to others\' perspectives.',
    gift: 'Beginner\'s mind, fresh energy, ability to start from nothing, pure potential',
    challenge: 'Impulsive action, difficulty seeing consequences, may feel invisible or like you\'re always starting over',
    lifeTheme: 'Emergence. You learn by doing, not by watching. Trust your instincts—they\'re your compass in uncharted territory.'
  },
  'Waxing Crescent': {
    symbol: '🌒',
    archetype: 'The Survivor',
    soulPurpose: 'You were born fighting for your right to exist. There\'s a scrappy, determined energy to your soul—you had to push through resistance early. You\'re here to prove that your vision deserves space in the world.',
    expression: 'Assertive, tenacious, resource-gathering. You feel an urgency to build, to establish yourself, to overcome early obstacles. Your Moon separates from Sun—your emotional needs are just starting to differentiate from your identity.',
    gift: 'Resilience, determination, ability to grow through adversity, strength through struggle',
    challenge: 'Insecurity, feeling like you have to fight for everything, difficulty receiving help',
    lifeTheme: 'Breakthrough. You\'re meant to push past limitations—your own and others\'. Every obstacle is a growth opportunity.'
  },
  'First Quarter': {
    symbol: '🌓',
    archetype: 'The Builder',
    soulPurpose: 'You were born at a crisis point—a square between Sun and Moon. Your soul carries tension that demands action. You\'re here to build structures, make decisions, and turn vision into reality through willpower.',
    expression: 'Action-oriented, crisis-capable, decisive. You thrive under pressure and feel restless in calm. Your Moon squares your Sun—your emotional needs and identity are in productive tension, driving you forward.',
    gift: 'Ability to act under pressure, decisiveness, turning ideas into action, productive tension',
    challenge: 'Impatience, creating crises when none exist, difficulty with stillness or peace',
    lifeTheme: 'Construction. You\'re here to BUILD something tangible. Crisis is your catalyst—use it wisely.'
  },
  'Waxing Gibbous': {
    symbol: '🌔',
    archetype: 'The Perfectionist',
    soulPurpose: 'You were born in a phase of analysis and improvement. Your soul is here to refine, perfect, and prepare something for its ultimate expression. You sense what\'s almost ready and know exactly what\'s missing.',
    expression: 'Analytical, devoted, improvement-focused. You see the gap between "what is" and "what could be" and work tirelessly to close it. Your Moon approaches fullness—your emotional nature seeks completion through service and refinement.',
    gift: 'Discernment, ability to improve anything, dedication to excellence, serving the vision',
    challenge: 'Over-analysis, perfectionism paralysis, never feeling "ready," self-criticism',
    lifeTheme: 'Refinement. You\'re the editor, not the author. Your gift is making things better, not starting them.'
  },
  'Full Moon': {
    symbol: '🌕',
    archetype: 'The Mirror',
    soulPurpose: 'You were born at maximum illumination—Sun and Moon in opposition. Your soul seeks to integrate polarities through relationship. You\'re here to be seen, to reflect others\' light, and to find yourself through partnership.',
    expression: 'Relationship-oriented, visible, polarized. You experience yourself most clearly through others\' eyes. Your Moon opposes your Sun—your identity and emotional needs are in constant dialogue, creating both tension and wholeness.',
    gift: 'Objectivity, ability to see all sides, relationship wisdom, magnetic presence, being a mirror for others',
    challenge: 'Over-dependency on others\' perception, difficulty being alone, projection, living for audience approval',
    lifeTheme: 'Reflection. You understand yourself through relationship. Partners, friends, even enemies—they all show you who you are.'
  },
  'Waning Gibbous': {
    symbol: '🌖',
    archetype: 'The Teacher',
    soulPurpose: 'You were born after the peak, beginning the journey of sharing what was illuminated. Your soul carries knowledge that wants to be transmitted. You\'re here to disseminate wisdom, to teach, to share what you\'ve learned.',
    expression: 'Communicative, sharing-oriented, teaching. You feel full and want to overflow into others. Your Moon moves away from fullness—your emotional nature seeks meaning through sharing and explaining what you\'ve experienced.',
    gift: 'Teaching ability, distilling wisdom, sharing experience, mentorship',
    challenge: 'Preachy tone, believing you\'ve "figured it out," difficulty receiving new input',
    lifeTheme: 'Dissemination. You\'re meant to share what you know. Your wisdom grows through teaching, not hoarding.'
  },
  'Last Quarter': {
    symbol: '🌗',
    archetype: 'The Revolutionary',
    soulPurpose: 'You were born at another crisis—a square of release. Your soul is here to question what no longer serves, to break down old structures, and to clear space for what comes next. You challenge the status quo.',
    expression: 'Questioning, deconstructing, crisis-oriented toward release. You see what needs to end. Your Moon squares your Sun in releasing mode—your emotional needs and identity are in tension around what to let go of.',
    gift: 'Ability to see what\'s dying, courage to end things, clearing old patterns, revolutionary energy',
    challenge: 'Iconoclasm for its own sake, difficulty building (easier to destroy), feeling stuck between worlds',
    lifeTheme: 'Reorientation. You\'re here to question EVERYTHING—especially what everyone else takes for granted.'
  },
  'Balsamic': {
    symbol: '🌘',
    archetype: 'The Mystic',
    soulPurpose: 'You were born just before a new cycle—the darkest, most inward phase. Your soul is completing something ancient. You carry old wisdom and karma ready for release. You\'re here to surrender, to let go, to prepare the ground for what you cannot see.',
    expression: 'Intuitive, prophetic, surrendering. You sense endings everywhere and feel pulled toward the invisible. Your Moon is nearly conjunct Sun again—your emotional nature seeks merger with something larger than yourself.',
    gift: 'Prophetic sense, ancient wisdom, letting go, faith in the unseen, preparing the future',
    challenge: 'Feeling out of time, isolation, difficulty engaging with "normal" life, exhaustion, feeling "done"',
    lifeTheme: 'Completion. You\'re ending a cycle—possibly many lifetimes of work. Let go of what\'s finished. Trust what wants to be born through you.'
  }
};

/**
 * Calculate the moon phase at birth based on Sun and Moon positions
 */
export function calculateBirthMoonPhase(
  sunSign: string,
  sunDegree: number,
  moonSign: string,
  moonDegree: number
): BirthMoonPhaseData {
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  const sunIndex = signs.indexOf(sunSign);
  const moonIndex = signs.indexOf(moonSign);
  
  const sunAbsolute = sunIndex * 30 + sunDegree;
  const moonAbsolute = moonIndex * 30 + moonDegree;
  
  // Calculate phase angle (Moon ahead of Sun)
  let phaseAngle = moonAbsolute - sunAbsolute;
  if (phaseAngle < 0) phaseAngle += 360;
  
  // Determine phase (each phase is 45°)
  let phase: BirthMoonPhase;
  let illumination: number;
  
  if (phaseAngle < 45) {
    phase = 'New Moon';
    illumination = (phaseAngle / 45) * 25;
  } else if (phaseAngle < 90) {
    phase = 'Waxing Crescent';
    illumination = 25 + ((phaseAngle - 45) / 45) * 25;
  } else if (phaseAngle < 135) {
    phase = 'First Quarter';
    illumination = 50 + ((phaseAngle - 90) / 45) * 12.5;
  } else if (phaseAngle < 180) {
    phase = 'Waxing Gibbous';
    illumination = 62.5 + ((phaseAngle - 135) / 45) * 37.5;
  } else if (phaseAngle < 225) {
    phase = 'Full Moon';
    illumination = 100 - ((phaseAngle - 180) / 45) * 12.5;
  } else if (phaseAngle < 270) {
    phase = 'Waning Gibbous';
    illumination = 87.5 - ((phaseAngle - 225) / 45) * 25;
  } else if (phaseAngle < 315) {
    phase = 'Last Quarter';
    illumination = 62.5 - ((phaseAngle - 270) / 45) * 25;
  } else {
    phase = 'Balsamic';
    illumination = 37.5 - ((phaseAngle - 315) / 45) * 37.5;
  }
  
  return {
    phase,
    illumination: Math.round(illumination),
    ...BIRTH_MOON_PHASES[phase]
  };
}

// ============================================================================
// DAY/NIGHT SECT
// ============================================================================

export type ChartSect = 'Day' | 'Night';

export interface SectData {
  sect: ChartSect;
  description: string;
  sectBenefic: string;
  sectMalefic: string;
  outOfSectBenefic: string;
  outOfSectMalefic: string;
  planetSectStatus: Record<string, { inSect: boolean; meaning: string }>;
  overallMeaning: string;
}

const SECT_PLANETS = {
  Day: {
    luminary: 'Sun',
    benefic: 'Jupiter',
    malefic: 'Saturn'
  },
  Night: {
    luminary: 'Moon',
    benefic: 'Venus',
    malefic: 'Mars'
  }
};

/**
 * Determine if a chart is Day or Night sect
 * Based on whether the Sun is above or below the horizon (Ascendant/Descendant axis)
 */
export function calculateSect(chart: NatalChart): SectData {
  // Simplified sect calculation based on Sun's house
  // Houses 7-12 = Sun above horizon = Day chart
  // Houses 1-6 = Sun below horizon = Night chart
  
  // For now, we'll use a simplified approach based on Sun's sign and Ascendant
  // If we have house data, we use that; otherwise we make an educated guess
  
  const sunSign = chart.planets.Sun?.sign;
  const ascSign = chart.planets.Ascendant?.sign;
  
  if (!sunSign || !ascSign) {
    // Default to day chart if we can't calculate
    return generateSectData('Day');
  }
  
  const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
  
  const sunIndex = signs.indexOf(sunSign);
  const ascIndex = signs.indexOf(ascSign);
  
  // Calculate rough house position
  // If Sun is in signs 7-12 relative to Ascendant, it's above horizon
  let housePos = (sunIndex - ascIndex + 12) % 12;
  
  // Houses 7-12 (above horizon) = Day chart
  // Houses 1-6 (below horizon) = Night chart
  const sect: ChartSect = housePos >= 6 ? 'Day' : 'Night';
  
  return generateSectData(sect);
}

function generateSectData(sect: ChartSect): SectData {
  const sectPlanets = SECT_PLANETS[sect];
  const opposingSect = sect === 'Day' ? 'Night' : 'Day';
  const opposingPlanets = SECT_PLANETS[opposingSect];
  
  const planetSectStatus: Record<string, { inSect: boolean; meaning: string }> = {
    Sun: {
      inSect: sect === 'Day',
      meaning: sect === 'Day' 
        ? 'Your Sun is in sect—your identity expression flows naturally in the world. You feel "at home" being visible and leading.'
        : 'Your Sun is out of sect—your identity operates in a nocturnal mode. You may shine more internally or in private settings.'
    },
    Moon: {
      inSect: sect === 'Night',
      meaning: sect === 'Night'
        ? 'Your Moon is in sect—your emotional nature is supported. Your instincts are reliable guides.'
        : 'Your Moon is out of sect—your emotional nature must work a bit harder to feel secure. Emotions may feel exposed.'
    },
    Jupiter: {
      inSect: sect === 'Day',
      meaning: sect === 'Day'
        ? 'Jupiter is your SECT BENEFIC—its gifts come more easily. Luck, expansion, and opportunity flow naturally.'
        : 'Jupiter is out of sect—its benefits require more effort to access. Growth may come through internal work.'
    },
    Venus: {
      inSect: sect === 'Night',
      meaning: sect === 'Night'
        ? 'Venus is your SECT BENEFIC—love, beauty, and pleasure come more naturally. Relationships tend to support you.'
        : 'Venus is out of sect—you may need to work harder for harmony and pleasure. Love requires conscious cultivation.'
    },
    Saturn: {
      inSect: sect === 'Day',
      meaning: sect === 'Day'
        ? 'Saturn is your SECT MALEFIC—its challenges are more manageable. Discipline feels purposeful rather than oppressive.'
        : 'Saturn is out of sect—its restrictions may feel heavier. You may struggle more with authority, time, and limitations.'
    },
    Mars: {
      inSect: sect === 'Night',
      meaning: sect === 'Night'
        ? 'Mars is your SECT MALEFIC—its energy is more controllable. Your drive and anger have better outlets.'
        : 'Mars is out of sect—its heat can burn hotter. Watch for impulsiveness, anger issues, or overexertion.'
    },
    Mercury: {
      inSect: true, // Mercury is neutral, belongs to both sects
      meaning: 'Mercury belongs to both sects—it adapts to the chart. Look at its sign and aspects for expression.'
    }
  };

  return {
    sect,
    description: sect === 'Day'
      ? 'You have a DAY CHART. The Sun was above the horizon when you were born. Solar themes dominate: visibility, action, external achievement, and conscious will.'
      : 'You have a NIGHT CHART. The Sun was below the horizon when you were born. Lunar themes dominate: interiority, intuition, emotional intelligence, and receptive wisdom.',
    sectBenefic: sectPlanets.benefic,
    sectMalefic: sectPlanets.malefic,
    outOfSectBenefic: opposingPlanets.benefic,
    outOfSectMalefic: opposingPlanets.malefic,
    planetSectStatus,
    overallMeaning: sect === 'Day'
      ? 'Your path to success runs through VISIBILITY and ACTION. You thrive when you put yourself out there, take initiative, and lead. Your challenges (Saturn) are easier to work with, while your Mars may need more conscious management.'
      : 'Your path to success runs through RECEPTIVITY and INTUITION. You thrive when you trust your instincts, work behind the scenes, and allow things to unfold. Your challenges (Mars) are easier to work with, while Saturn may feel heavier.'
  };
}

// ============================================================================
// TIME OF DAY CONTEXT
// ============================================================================

export type TimeOfDay = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'dusk' | 'evening' | 'night' | 'deep_night';

export interface TimeOfDayData {
  timeOfDay: TimeOfDay;
  description: string;
  sunPosition: string;
  symbolism: string;
  lifeExpression: string;
}

export function getTimeOfDayContext(birthTime: string): TimeOfDayData | null {
  if (!birthTime) return null;
  
  const [hours, minutes] = birthTime.split(':').map(Number);
  if (isNaN(hours)) return null;
  
  const timeInMinutes = hours * 60 + (minutes || 0);
  
  // Approximate time brackets (without exact sunrise/sunset which requires location)
  if (timeInMinutes >= 300 && timeInMinutes < 420) { // 5am - 7am
    return {
      timeOfDay: 'dawn',
      description: 'Born at Dawn',
      sunPosition: 'Sun rising on the Eastern horizon',
      symbolism: 'The liminal moment between darkness and light. You carry the energy of EMERGENCE—the first light after the longest dark.',
      lifeExpression: 'You are a bringer of new beginnings. Your presence signals "something is starting." You may feel most alive in early morning hours and during times of transition. There\'s a fresh, hopeful quality to your energy—but also the vulnerability of things just being born.'
    };
  } else if (timeInMinutes >= 420 && timeInMinutes < 660) { // 7am - 11am
    return {
      timeOfDay: 'morning',
      description: 'Born in the Morning',
      sunPosition: 'Sun climbing in the Eastern sky',
      symbolism: 'The time of increasing light and gathering momentum. You carry the energy of BUILDING and ASCENT.',
      lifeExpression: 'You are wired for growth and forward motion. Your energy naturally builds throughout projects and relationships. You may feel most productive in the first half of any cycle. There\'s an optimistic, striving quality to your nature.'
    };
  } else if (timeInMinutes >= 660 && timeInMinutes < 780) { // 11am - 1pm
    return {
      timeOfDay: 'midday',
      description: 'Born at Midday',
      sunPosition: 'Sun at its highest point (Midheaven)',
      symbolism: 'Maximum visibility. The Sun at noon casts the shortest shadows—nothing is hidden. You carry the energy of FULL EXPRESSION and PUBLIC PRESENCE.',
      lifeExpression: 'You are meant to be SEEN. Your chart pushes you toward visibility, achievement, and public recognition. Hiding feels wrong to you. You may feel most alive when you\'re in the spotlight or at the peak of achievement. Your shadows are minimal—what you see is what you get.'
    };
  } else if (timeInMinutes >= 780 && timeInMinutes < 1020) { // 1pm - 5pm
    return {
      timeOfDay: 'afternoon',
      description: 'Born in the Afternoon',
      sunPosition: 'Sun descending in the Western sky',
      symbolism: 'The time of harvest and sharing. The day\'s work is done; now comes distribution. You carry the energy of COMPLETION and RELATIONSHIP.',
      lifeExpression: 'You are wired for collaboration and sharing. Your energy naturally flows toward others in the second half of any cycle. You may do your best work after the initial push is over, refining and perfecting what was started. There\'s a generous, relational quality to your nature.'
    };
  } else if (timeInMinutes >= 1020 && timeInMinutes < 1140) { // 5pm - 7pm
    return {
      timeOfDay: 'dusk',
      description: 'Born at Dusk',
      sunPosition: 'Sun setting on the Western horizon (Descendant)',
      symbolism: 'The liminal moment between light and darkness. You carry the energy of TRANSITION and PARTNERSHIP.',
      lifeExpression: 'You are a bridge between worlds. Your presence signals "something is changing." You may feel most alive during endings, transitions, and in the space between. Relationships (the 7th house/Descendant) are central to your purpose. You understand both sides of any duality.'
    };
  } else if (timeInMinutes >= 1140 && timeInMinutes < 1260) { // 7pm - 9pm
    return {
      timeOfDay: 'evening',
      description: 'Born in the Evening',
      sunPosition: 'Sun below the horizon, twilight fading',
      symbolism: 'The time of reflection, intimacy, and inner life beginning. You carry the energy of DEPTH and PRIVATE PROCESSING.',
      lifeExpression: 'You are wired for intimacy and depth. Your energy naturally turns inward, especially in the second half of any cycle. You may feel most alive in private settings, deep conversations, or transformative experiences. There\'s a psychological, investigative quality to your nature.'
    };
  } else if (timeInMinutes >= 1260 || timeInMinutes < 180) { // 9pm - 3am
    return {
      timeOfDay: 'night',
      description: 'Born at Night',
      sunPosition: 'Sun deep below the horizon',
      symbolism: 'The time of dreams, the unconscious, and invisible work. You carry the energy of the UNSEEN and the INTERNAL.',
      lifeExpression: 'You are wired for the invisible realms. Your energy operates best behind the scenes, in the unconscious, in the realm of dreams and intuition. You may feel most alive in nighttime hours and in states of imagination or meditation. There\'s a mystical, internal quality to your nature.'
    };
  } else { // 3am - 5am
    return {
      timeOfDay: 'deep_night',
      description: 'Born in the Deep Night',
      sunPosition: 'Sun at its lowest point (IC/Nadir)',
      symbolism: 'The darkest hour before dawn. Maximum interiority. You carry the energy of ROOTS, ANCESTRY, and the deepest self.',
      lifeExpression: 'You are anchored in the unseen foundations. Your energy draws from ancestral wells and the collective unconscious. You may feel most alive in solitude, in the deepest parts of any process, or in connection with family/roots. There\'s an ancient, private quality to your nature. What happens in your inner world is more real than the outer.'
    };
  }
}

/**
 * Get complete birth conditions from a natal chart
 */
export function getBirthConditions(chart: NatalChart): {
  moonPhase: BirthMoonPhaseData | null;
  sect: SectData;
  timeOfDay: TimeOfDayData | null;
} {
  let moonPhase: BirthMoonPhaseData | null = null;
  
  if (chart.planets.Sun && chart.planets.Moon) {
    moonPhase = calculateBirthMoonPhase(
      chart.planets.Sun.sign,
      chart.planets.Sun.degree + (chart.planets.Sun.minutes || 0) / 60,
      chart.planets.Moon.sign,
      chart.planets.Moon.degree + (chart.planets.Moon.minutes || 0) / 60
    );
  }
  
  const sect = calculateSect(chart);
  const timeOfDay = getTimeOfDayContext(chart.birthTime);
  
  return { moonPhase, sect, timeOfDay };
}
