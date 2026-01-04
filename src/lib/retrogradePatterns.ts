import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

// Zodiac signs in order
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Mars Retrograde Database (2020-2030)
export const MARS_RETROGRADES = [
  { start: new Date('2020-09-09'), end: new Date('2020-11-13'), sign: 'Aries', preStart: new Date('2020-07-08'), postEnd: new Date('2021-01-02') },
  { start: new Date('2022-10-30'), end: new Date('2023-01-12'), sign: 'Gemini', preStart: new Date('2022-09-03'), postEnd: new Date('2023-03-15') },
  { start: new Date('2024-12-06'), end: new Date('2025-02-23'), sign: 'Leo/Cancer', preStart: new Date('2024-10-04'), postEnd: new Date('2025-05-02') },
  { start: new Date('2027-01-10'), end: new Date('2027-04-01'), sign: 'Virgo', preStart: new Date('2026-11-12'), postEnd: new Date('2027-06-03') },
  { start: new Date('2029-02-10'), end: new Date('2029-05-02'), sign: 'Libra', preStart: new Date('2028-12-17'), postEnd: new Date('2029-07-02') },
];

// Mercury Retrograde Database (2024-2027)
export const MERCURY_RETROGRADES = [
  // 2024
  { start: new Date('2024-04-01'), end: new Date('2024-04-25'), sign: 'Aries', preStart: new Date('2024-03-18'), postEnd: new Date('2024-05-13') },
  { start: new Date('2024-08-04'), end: new Date('2024-08-28'), sign: 'Virgo/Leo', preStart: new Date('2024-07-16'), postEnd: new Date('2024-09-11') },
  { start: new Date('2024-11-25'), end: new Date('2024-12-15'), sign: 'Sagittarius', preStart: new Date('2024-11-07'), postEnd: new Date('2025-01-02') },
  // 2025
  { start: new Date('2025-03-15'), end: new Date('2025-04-07'), sign: 'Aries/Pisces', preStart: new Date('2025-03-01'), postEnd: new Date('2025-04-22') },
  { start: new Date('2025-07-17'), end: new Date('2025-08-11'), sign: 'Leo', preStart: new Date('2025-07-03'), postEnd: new Date('2025-08-26') },
  { start: new Date('2025-11-09'), end: new Date('2025-11-29'), sign: 'Sagittarius', preStart: new Date('2025-10-25'), postEnd: new Date('2025-12-14') },
  // 2026
  { start: new Date('2026-02-25'), end: new Date('2026-03-20'), sign: 'Pisces', preStart: new Date('2026-02-10'), postEnd: new Date('2026-04-04') },
  { start: new Date('2026-06-29'), end: new Date('2026-07-23'), sign: 'Cancer/Leo', preStart: new Date('2026-06-14'), postEnd: new Date('2026-08-07') },
  { start: new Date('2026-10-23'), end: new Date('2026-11-12'), sign: 'Scorpio', preStart: new Date('2026-10-08'), postEnd: new Date('2026-11-27') },
  // 2027
  { start: new Date('2027-02-09'), end: new Date('2027-03-03'), sign: 'Pisces/Aquarius', preStart: new Date('2027-01-25'), postEnd: new Date('2027-03-18') },
  { start: new Date('2027-06-10'), end: new Date('2027-07-04'), sign: 'Cancer', preStart: new Date('2027-05-27'), postEnd: new Date('2027-07-19') },
  { start: new Date('2027-10-06'), end: new Date('2027-10-28'), sign: 'Scorpio', preStart: new Date('2027-09-21'), postEnd: new Date('2027-11-12') },
];

export interface RetrogradeInfo {
  start: Date;
  end: Date;
  sign: string;
  preStart: Date;
  postEnd: Date;
}

export interface RetrogradeStatus {
  isRetrograde: boolean;
  isShadow: boolean;
  shadowType?: 'pre' | 'post';
  retrogradeInfo?: RetrogradeInfo;
  daysRemaining?: number;
  percentComplete?: number;
}

export interface RetrogradeDisplay {
  mars: RetrogradeStatus;
  mercury: RetrogradeStatus;
  hasActivity: boolean;
}

// Check if date is during retrograde
export const getRetrogradeStatus = (date: Date, retrogrades: RetrogradeInfo[]): RetrogradeStatus => {
  const time = date.getTime();
  
  for (const retro of retrogrades) {
    const startTime = retro.start.getTime();
    const endTime = retro.end.getTime();
    const preStartTime = retro.preStart.getTime();
    const postEndTime = retro.postEnd.getTime();
    
    // Check if in retrograde
    if (time >= startTime && time <= endTime) {
      const totalDays = (endTime - startTime) / (1000 * 60 * 60 * 24);
      const daysIn = (time - startTime) / (1000 * 60 * 60 * 24);
      const daysRemaining = Math.ceil(totalDays - daysIn);
      
      return {
        isRetrograde: true,
        isShadow: false,
        retrogradeInfo: retro,
        daysRemaining,
        percentComplete: Math.round((daysIn / totalDays) * 100),
      };
    }
    
    // Check pre-shadow
    if (time >= preStartTime && time < startTime) {
      return {
        isRetrograde: false,
        isShadow: true,
        shadowType: 'pre',
        retrogradeInfo: retro,
      };
    }
    
    // Check post-shadow
    if (time > endTime && time <= postEndTime) {
      return {
        isRetrograde: false,
        isShadow: true,
        shadowType: 'post',
        retrogradeInfo: retro,
      };
    }
  }
  
  return { isRetrograde: false, isShadow: false };
};

// Get retrograde display info for both Mars and Mercury
export const getRetrogradeDisplay = (date: Date): RetrogradeDisplay => {
  const mars = getRetrogradeStatus(date, MARS_RETROGRADES);
  const mercury = getRetrogradeStatus(date, MERCURY_RETROGRADES);
  
  return {
    mars,
    mercury,
    hasActivity: mars.isRetrograde || mars.isShadow || mercury.isRetrograde || mercury.isShadow,
  };
};

// Convert natal position to longitude
const natalPositionToLongitude = (position: NatalPlanetPosition): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return signIndex * 30 + position.degree + position.minutes / 60 + (position.seconds || 0) / 3600;
};

// Get personal chart activation during retrograde
export const getRetrogradeChartActivation = (
  retrogradeInfo: RetrogradeInfo,
  planet: 'Mars' | 'Mercury',
  natalChart: NatalChart
): string[] => {
  const activations: string[] = [];
  
  // Get the signs involved
  const signs = retrogradeInfo.sign.split('/');
  
  // Check which natal planets are in those signs
  for (const [planetName, position] of Object.entries(natalChart.planets)) {
    if (!position) continue;
    
    if (signs.includes(position.sign)) {
      activations.push(`Your natal ${planetName} in ${position.sign} is directly activated by this ${planet} retrograde.`);
    }
  }
  
  // Add house activation based on retrograde sign
  if (natalChart.houseCusps) {
    for (const [houseName, cusp] of Object.entries(natalChart.houseCusps)) {
      if (!cusp) continue;
      if (signs.includes(cusp.sign)) {
        const houseNum = houseName.replace('house', '');
        activations.push(`${planet} retrograde activates your ${houseNum}th house matters.`);
      }
    }
  }
  
  return activations;
};

// Mars retrograde guidance
export const MARS_RETROGRADE_GUIDANCE = {
  whatToExpect: [
    "Energy turns inward - review how you take action",
    "Past conflicts may resurface for resolution",
    "Passion and drive need redirection",
    "Physical energy may feel depleted or misdirected",
    "Old anger or frustration may arise",
  ],
  bestActivities: [
    "Finish projects already in progress",
    "Review your goals and ambitions",
    "Reassess how you assert yourself",
    "Heal old wounds around anger or competition",
    "Strategic planning (but don't launch yet)",
    "Physical therapy or healing practices",
  ],
  avoid: [
    "Starting major new projects",
    "Initiating conflicts or confrontations",
    "Signing up for competitive ventures",
    "Major surgery (if elective)",
    "Impulsive physical activities",
    "Starting a new exercise regimen",
  ],
};

// Mercury retrograde guidance
export const MERCURY_RETROGRADE_GUIDANCE = {
  whatToExpect: [
    "Communication mishaps and misunderstandings",
    "Technology glitches and malfunctions",
    "Travel delays and scheduling issues",
    "Past contacts may reappear",
    "Hidden information comes to light",
  ],
  bestActivities: [
    "Review and revise documents",
    "Reconnect with old friends",
    "Edit and polish creative work",
    "Research and gather information",
    "Back up all digital data",
    "Revisit abandoned projects",
    "Reflect on past decisions",
  ],
  avoid: [
    "Signing contracts or legal documents",
    "Buying electronics or vehicles",
    "Starting new communication projects",
    "Making major decisions based on new info",
    "Launching websites or apps",
    "Important presentations (if possible)",
  ],
};

// Format date for display
export const formatRetrogradeDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Get days until retrograde ends
export const getDaysUntilEnd = (endDate: Date, currentDate: Date): number => {
  return Math.ceil((endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
};
