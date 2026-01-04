// Saturn Cycle Calculator
// Calculates precise Saturn transits over natal Saturn position including retrograde passes
// Saturn's orbital period: ~29.46 years, average daily motion: ~0.034°/day

import { NatalChart } from '@/hooks/useNatalChart';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Element for each sign
const SIGN_ELEMENTS: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire', Taurus: 'Earth', Gemini: 'Air', Cancer: 'Water',
  Leo: 'Fire', Virgo: 'Earth', Libra: 'Air', Scorpio: 'Water',
  Sagittarius: 'Fire', Capricorn: 'Earth', Aquarius: 'Air', Pisces: 'Water'
};

// Modality for each sign
const SIGN_MODALITIES: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
  Aries: 'Cardinal', Taurus: 'Fixed', Gemini: 'Mutable', Cancer: 'Cardinal',
  Leo: 'Fixed', Virgo: 'Mutable', Libra: 'Cardinal', Scorpio: 'Fixed',
  Sagittarius: 'Mutable', Capricorn: 'Cardinal', Aquarius: 'Fixed', Pisces: 'Mutable'
};

export interface SaturnEvent {
  date: Date;
  age: number;
  type: 'exact' | 'retrograde_pass' | 'direct_pass';
  transiting_degree: number;
}

export interface SaturnCyclePhase {
  phaseName: 'First Quarter' | 'Opposition' | 'Third Quarter' | 'Return';
  phaseSymbol: '□' | '☍' | '☌';
  phaseType: 'waxing' | 'culmination' | 'waning' | 'conjunction';
  targetDegree: number;
  transitingSign: string;
  transitingElement: 'Fire' | 'Earth' | 'Air' | 'Water';
  natalSign: string;
  cycleNumber: number;
  events: SaturnEvent[];
  description: string;
  signThemes: string;
  phaseThemes: string;
  question: string;
  isPast: boolean;
  isUpcoming: boolean;
}

export interface DetailedSaturnCycles {
  natalSaturn: {
    sign: string;
    degree: number;
    minutes: number;
    absoluteDegree: number;
    element: 'Fire' | 'Earth' | 'Air' | 'Water';
  };
  cycles: SaturnCyclePhase[];
}

// Convert sign + degree to absolute degree (0-360)
const toAbsoluteDegree = (sign: string, degree: number, minutes: number = 0): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + degree + minutes / 60;
};

// Convert absolute degree to sign + degree
const toSignDegree = (absoluteDegree: number): { sign: string; degree: number; minutes: number } => {
  const normalized = ((absoluteDegree % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const degree = Math.floor(normalized % 30);
  const minutes = Math.round((normalized % 1) * 60);
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree,
    minutes
  };
};

// Get sign from absolute degree
const getSignFromDegree = (absoluteDegree: number): string => {
  const normalized = ((absoluteDegree % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[signIndex];
};

// Format degree for display
export const formatDegreePosition = (absoluteDegree: number): string => {
  const { sign, degree, minutes } = toSignDegree(absoluteDegree);
  return `${degree}°${minutes.toString().padStart(2, '0')}' ${sign}`;
};

// Find when transiting Saturn hits a specific degree
const findSaturnTransits = (
  targetDegree: number,
  birthDate: Date,
  natalSaturnDegree: number,
  startAge: number,
  endAge: number
): SaturnEvent[] => {
  const events: SaturnEvent[] = [];
  
  const degreeDiff = ((targetDegree - natalSaturnDegree) % 360 + 360) % 360;
  const yearsToFirstHit = degreeDiff / 12.2;
  
  for (let cycle = 0; cycle < 4; cycle++) {
    const baseYear = yearsToFirstHit + (cycle * 29.46);
    
    if (baseYear < startAge || baseYear > endAge) continue;
    
    const centralDate = new Date(birthDate);
    centralDate.setFullYear(centralDate.getFullYear() + Math.floor(baseYear));
    centralDate.setMonth(centralDate.getMonth() + Math.floor((baseYear % 1) * 12));
    
    const age = Math.floor(baseYear);
    
    events.push({
      date: new Date(centralDate.getTime() - 90 * 24 * 60 * 60 * 1000),
      age,
      type: 'exact',
      transiting_degree: targetDegree
    });
    
    const monthOfTransit = centralDate.getMonth();
    if (monthOfTransit >= 4 && monthOfTransit <= 9) {
      events.push({
        date: new Date(centralDate),
        age,
        type: 'retrograde_pass',
        transiting_degree: targetDegree
      });
      
      events.push({
        date: new Date(centralDate.getTime() + 90 * 24 * 60 * 60 * 1000),
        age,
        type: 'direct_pass',
        transiting_degree: targetDegree
      });
    }
  }
  
  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
};

const parseBirthDate = (birthDate: string): Date => {
  const [year, month, day] = birthDate.split('-').map(Number);
  return new Date(year, month - 1, day);
};

// ============================================
// THEMATIC INTERPRETATIONS
// ============================================

// Phase-specific themes (waxing vs waning squares, etc.)
const getPhaseThemes = (phaseName: string, cycleNum: number): string => {
  const themes: Record<string, string[]> = {
    'First Quarter': [
      // Cycle 1 (age ~7)
      `WAXING SQUARE: Building toward fullness. This is the first test of your developing Saturn structure. The energy is fresh, youthful, confrontational with early authority figures. You're establishing foundations—even if it feels like friction. The square creates productive tension that BUILDS something new. Less about releasing, more about pushing through resistance to grow.`,
      // Cycle 2 (age ~36-37)
      `WAXING SQUARE: Mid-career crisis of action. The foundations you built at your Saturn Return are now being tested. Are they solid? This square demands you take action on commitments made. The energy still builds—you're not letting go yet, you're doubling down or restructuring what you've built.`,
      // Cycle 3 (age ~66)
      `WAXING SQUARE: Elder restructuring. Testing the legacy structures you've created. This is about what you're building for the next generation, what will outlast you.`
    ],
    'Opposition': [
      // Cycle 1 (age ~14-15)
      `OPPOSITION: Full manifestation and confrontation. Maximum tension between your inner authority (natal Saturn) and outer demands (transiting Saturn). This is the "full moon" of your Saturn cycle—everything comes to a head. You see clearly what you've built vs. what you haven't. External achievements or crises reveal the truth. Identity crisis is common—who am I becoming vs. who do others expect me to be?`,
      // Cycle 2 (age ~44)
      `OPPOSITION: Midlife reckoning. The classic "midlife crisis" moment. You're weighing what you've accomplished against what you dreamed. External circumstances force you to confront whether your life structure serves you. Major decisions about staying the course or pivoting.`,
      // Cycle 3 (age ~73-74)
      `OPPOSITION: Legacy confrontation. What have you truly built? What will remain? This opposition asks you to reconcile your life's work with reality.`
    ],
    'Third Quarter': [
      // Cycle 1 (age ~21-22)
      `WANING SQUARE: Releasing and harvesting. This is MORE INTENSE than the first square because you must let go of what no longer works BEFORE your Saturn Return. The structures, beliefs, and identities you built as a youth are being questioned. You realize you were wrong about some things. This square is about dismantling outdated patterns to make room for your adult self. It's crisis through RELEASE, not building. Preparation for the Return.`,
      // Cycle 2 (age ~51-52)
      `WANING SQUARE: Simplifying and releasing. What responsibilities can you put down? What structures no longer serve your maturing self? This square asks you to harvest wisdom and release the excess before your second Return.`,
      // Cycle 3 (age ~80-81)
      `WANING SQUARE: Final simplification. Distilling life to essentials. Releasing attachment to structures that won't follow you.`
    ],
    'Return': [
      // First Return (age ~29-30)
      `CONJUNCTION: Complete cycle reset. The most significant Saturn event. Everything you've built, learned, and struggled with for 29 years culminates here. You become your own authority—or face the consequences of avoiding that responsibility. Major life restructuring is common: career changes, relationships ending or formalizing, relocations. You're no longer a "young person." Accountability becomes real.`,
      // Second Return (age ~58-59)
      `CONJUNCTION: Wisdom elder initiation. The second Return is about mastery and mentorship. What have you learned that you can teach? How do you want to spend your remaining active years? Many experience renewed purpose, retirement transitions, or becoming the authority figure for others.`,
      // Third Return (age ~87-88)
      `CONJUNCTION: Rare culmination. Few reach this point consciously. Those who do have completed two full Saturn cycles and begin a third. Transcendent perspective on life's lessons.`,
      // Fourth Return (age ~117)
      `CONJUNCTION: Extraordinarily rare. A life of exceptional longevity and presumably exceptional wisdom.`
    ]
  };
  
  const index = Math.min(cycleNum - 1, (themes[phaseName]?.length || 1) - 1);
  return themes[phaseName]?.[index] || 'Saturn cycle event';
};

// Sign-specific themes for transiting Saturn
const getSignThemes = (sign: string, natalSign: string): string => {
  const element = SIGN_ELEMENTS[sign];
  const modality = SIGN_MODALITIES[sign];
  const natalElement = SIGN_ELEMENTS[natalSign];
  
  // Core sign themes for Saturn transits
  const signThemes: Record<string, string> = {
    Aries: `♈ ARIES: Saturn tests your courage and independence. Themes: learning to act alone, confronting fear of failure, developing self-reliance. The challenge is initiating without aggression, leading without dominating. You're building the muscle of healthy self-assertion.`,
    
    Taurus: `♉ TAURUS: Saturn tests your security and values. Themes: financial restructuring, questioning what you truly value, building lasting resources. The challenge is patience without stagnation, stability without rigidity. You're learning what's worth keeping.`,
    
    Gemini: `♊ GEMINI: Saturn tests your mind and communication. Themes: focusing scattered thoughts, committing to learning, speaking with authority. The challenge is depth without losing curiosity, commitment without boredom. You're structuring how you think and share ideas.`,
    
    Cancer: `♋ CANCER: Saturn tests your emotional foundations. Themes: family responsibilities, creating real security, maturing emotionally. The challenge is nurturing without smothering, protecting without controlling. You're building an inner home that can't be shaken.`,
    
    Leo: `♌ LEO: Saturn tests your authentic expression. Themes: creative discipline, leadership responsibilities, earning recognition through effort. The challenge is shining without needing applause, creating without ego. You're learning that true authority comes from within.`,
    
    Virgo: `♍ VIRGO: Saturn tests your service and competence. Themes: health restructuring, work refinement, practical skill-building. The challenge is excellence without perfectionism, service without martyrdom. You're mastering your craft.`,
    
    Libra: `♎ LIBRA: Saturn tests your relationships and fairness. Themes: partnership commitments, learning balance, confronting people-pleasing. The challenge is harmony without self-abandonment, partnership without losing yourself. You're learning to be fair to yourself AND others.`,
    
    Scorpio: `♏ SCORPIO: Saturn tests your power and transformation. Themes: facing shadows, restructuring shared resources, deep psychological work. WATER SIGN: This is emotionally intense—Saturn forces you to FEEL the weight of transformation. The challenge is power without manipulation, depth without destruction. You're learning to trust after being forced to confront betrayal, loss, or your own darkness. Regeneration through discipline.`,
    
    Sagittarius: `♐ SAGITTARIUS: Saturn tests your beliefs and expansion. Themes: committing to a philosophy, structured learning, honest self-assessment. The challenge is wisdom without preaching, freedom within structure. You're building a belief system that actually holds up.`,
    
    Capricorn: `♑ CAPRICORN: Saturn is at home here—tests are intensified. Themes: career mastery, accepting full responsibility, becoming the authority. The challenge is ambition without coldness, achievement without sacrificing soul. You're learning what you're truly building your life toward.`,
    
    Aquarius: `♒ AQUARIUS: Saturn tests your individuality and community. Themes: structured innovation, group responsibilities, being yourself within systems. The challenge is uniqueness without alienation, reform without destruction. You're learning to be an individual who serves the collective.`,
    
    Pisces: `♓ PISCES: Saturn tests your faith and boundaries. Themes: spiritual discipline, compassion with limits, grounding the transcendent. WATER SIGN: Emotionally permeable—you may feel everything more intensely. The challenge is empathy without drowning, spirituality without escapism. You're learning to build structure around the ineffable.`
  };
  
  let themes = signThemes[sign] || `Saturn transiting ${sign}`;
  
  // Add element relationship
  if (element === 'Water') {
    themes += `\n\n💧 WATER TRANSIT: This period emphasizes emotional processing, intuitive development, and psychological depth. Feelings can't be bypassed—they must be worked through.`;
  } else if (element === 'Fire') {
    themes += `\n\n🔥 FIRE TRANSIT: This period emphasizes action, identity, and creative expression. Stagnation is the enemy—you must move forward.`;
  } else if (element === 'Earth') {
    themes += `\n\n🌍 EARTH TRANSIT: This period emphasizes practical results, material security, and tangible building. Abstract won't cut it—you need real-world outcomes.`;
  } else if (element === 'Air') {
    themes += `\n\n💨 AIR TRANSIT: This period emphasizes mental clarity, communication, and social connections. Ideas and relationships are restructured.`;
  }
  
  // Add aspect relationship (square = friction between elements)
  if (element !== natalElement) {
    themes += `\n\n⚡ ELEMENTAL FRICTION: Your natal Saturn in ${natalSign} (${natalElement}) is being activated by Saturn in ${sign} (${element}). This creates productive tension between different modes of being—forcing integration of ${natalElement.toLowerCase()} and ${element.toLowerCase()} qualities.`;
  }
  
  return themes;
};

// Get description for each phase
const getPhaseDescription = (phase: string, cycleNum: number): string => {
  const descriptions: Record<string, string[]> = {
    'First Quarter': [
      'First waxing square—testing early foundations through action',
      'Second waxing square—testing mature commitments through action',
      'Third waxing square—elder restructuring challenges'
    ],
    'Opposition': [
      'First opposition—full manifestation, identity confrontation',
      'Second opposition—midlife reckoning and rebalancing',
      'Third opposition—legacy assessment and reconciliation'
    ],
    'Third Quarter': [
      'First waning square—releasing youth, preparing for Return',
      'Second waning square—simplifying, harvesting wisdom',
      'Third waning square—final distillation of life lessons'
    ],
    'Return': [
      'First Return—becoming your own authority',
      'Second Return—wisdom elder, mastery and mentorship',
      'Third Return—rare transcendent perspective',
      'Fourth Return—extraordinary life completion'
    ]
  };
  
  const index = Math.min(cycleNum - 1, (descriptions[phase]?.length || 1) - 1);
  return descriptions[phase]?.[index] || 'Saturn cycle event';
};

// Main calculation function
export const calculateDetailedSaturnCycles = (
  chart: NatalChart,
  currentDate: Date = new Date()
): DetailedSaturnCycles | null => {
  const saturnPos = chart.planets.Saturn;
  if (!saturnPos) return null;
  
  const natalDegree = toAbsoluteDegree(saturnPos.sign, saturnPos.degree, saturnPos.minutes);
  const birthDate = parseBirthDate(chart.birthDate);
  const currentAge = (currentDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  
  const cycles: SaturnCyclePhase[] = [];
  
  const aspects: Array<{
    name: 'First Quarter' | 'Opposition' | 'Third Quarter' | 'Return';
    symbol: '□' | '☍' | '☌';
    phaseType: 'waxing' | 'culmination' | 'waning' | 'conjunction';
    addDegrees: number;
    question: string;
  }> = [
    { name: 'First Quarter', symbol: '□', phaseType: 'waxing', addDegrees: 90, question: 'What new structure or responsibility emerged that tested you?' },
    { name: 'Opposition', symbol: '☍', phaseType: 'culmination', addDegrees: 180, question: 'What external achievement, crisis, or confrontation defined this time?' },
    { name: 'Third Quarter', symbol: '□', phaseType: 'waning', addDegrees: 270, question: 'What did you have to release, let go of, or restructure?' },
    { name: 'Return', symbol: '☌', phaseType: 'conjunction', addDegrees: 0, question: 'What major life chapter began or ended? How did you become your own authority?' },
  ];
  
  for (let cycleNum = 1; cycleNum <= 4; cycleNum++) {
    for (const aspect of aspects) {
      const targetDegree = ((natalDegree + aspect.addDegrees) % 360);
      const transitingSign = getSignFromDegree(targetDegree);
      
      const baseAge = (cycleNum - 1) * 29.46;
      const aspectOffset = aspect.addDegrees === 0 ? 29.46 : (aspect.addDegrees / 360) * 29.46;
      const approximateAge = baseAge + aspectOffset;
      
      // Skip cycle 1's "return" at age 0 (that's birth, not a return)
      if (cycleNum === 1 && aspect.addDegrees === 0) {
        // For cycle 1, return happens at ~29.46
        const returnAge = 29.46;
        if (returnAge > 100) continue;
        
        const events = findSaturnTransits(targetDegree, birthDate, natalDegree, returnAge - 2, returnAge + 2);
        const finalEvents = events.length > 0 ? events : [{
          date: new Date(birthDate.getTime() + returnAge * 365.25 * 24 * 60 * 60 * 1000),
          age: Math.floor(returnAge),
          type: 'exact' as const,
          transiting_degree: targetDegree
        }];
        
        cycles.push({
          phaseName: aspect.name,
          phaseSymbol: aspect.symbol,
          phaseType: aspect.phaseType,
          targetDegree,
          transitingSign: saturnPos.sign, // Return is in natal sign
          transitingElement: SIGN_ELEMENTS[saturnPos.sign],
          natalSign: saturnPos.sign,
          cycleNumber: 1,
          events: finalEvents,
          description: getPhaseDescription(aspect.name, 1),
          signThemes: getSignThemes(saturnPos.sign, saturnPos.sign),
          phaseThemes: getPhaseThemes(aspect.name, 1),
          question: aspect.question,
          isPast: returnAge < currentAge,
          isUpcoming: returnAge >= currentAge && returnAge <= currentAge + 3
        });
        continue;
      }
      
      if (approximateAge > 100 || approximateAge <= 0) continue;
      
      const events = findSaturnTransits(targetDegree, birthDate, natalDegree, approximateAge - 2, approximateAge + 2);
      const finalEvents = events.length > 0 ? events : [{
        date: new Date(birthDate.getTime() + approximateAge * 365.25 * 24 * 60 * 60 * 1000),
        age: Math.floor(approximateAge),
        type: 'exact' as const,
        transiting_degree: targetDegree
      }];
      
      const isPast = approximateAge < currentAge;
      const isUpcoming = approximateAge >= currentAge && approximateAge <= currentAge + 3;
      
      cycles.push({
        phaseName: aspect.name,
        phaseSymbol: aspect.symbol,
        phaseType: aspect.phaseType,
        targetDegree,
        transitingSign,
        transitingElement: SIGN_ELEMENTS[transitingSign],
        natalSign: saturnPos.sign,
        cycleNumber: aspect.addDegrees === 0 ? cycleNum - 1 : cycleNum, // Returns end the previous cycle
        events: finalEvents,
        description: getPhaseDescription(aspect.name, cycleNum),
        signThemes: getSignThemes(transitingSign, saturnPos.sign),
        phaseThemes: getPhaseThemes(aspect.name, cycleNum),
        question: aspect.question,
        isPast,
        isUpcoming
      });
    }
  }
  
  // Sort by approximate age
  cycles.sort((a, b) => {
    const ageA = a.events[0]?.age || 0;
    const ageB = b.events[0]?.age || 0;
    return ageA - ageB;
  });
  
  return {
    natalSaturn: {
      sign: saturnPos.sign,
      degree: saturnPos.degree,
      minutes: saturnPos.minutes,
      absoluteDegree: natalDegree,
      element: SIGN_ELEMENTS[saturnPos.sign]
    },
    cycles
  };
};

export const formatCycleDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const calculateAgeAtDate = (birthDate: string, targetDate: Date): number => {
  const birth = parseBirthDate(birthDate);
  const ageInMs = targetDate.getTime() - birth.getTime();
  return Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365.25));
};
