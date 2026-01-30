// House calculation utilities for transit-to-natal system
import { NatalChart, HouseCusp } from '@/hooks/useNatalChart';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Convert sign + degree to absolute longitude (0-360)
export const signDegreesToLongitude = (sign: string, degree: number, minutes: number = 0): number => {
  const signIndex = ZODIAC_SIGNS.indexOf(sign);
  if (signIndex === -1) return 0;

  // Defensive coercion: some persisted chart data may have degree/minutes as strings.
  const deg = typeof degree === 'number' ? degree : Number(degree);
  const min = typeof minutes === 'number' ? minutes : Number(minutes);
  if (!Number.isFinite(deg)) return signIndex * 30;
  const safeMin = Number.isFinite(min) ? min : 0;

  return signIndex * 30 + deg + (safeMin / 60);
};

// Get the house cusp longitude from a NatalChart
const getHouseCuspLongitude = (chart: NatalChart, houseNumber: number): number | null => {
  if (!chart.houseCusps) return null;
  const cusp = chart.houseCusps[`house${houseNumber}` as keyof typeof chart.houseCusps];
  if (!cusp?.sign) return null;
  return signDegreesToLongitude(cusp.sign, cusp.degree, cusp.minutes);
};

// Calculate which house a planet is in based on house cusps
export const getHouseForLongitude = (longitude: number, chart: NatalChart): number | null => {
  if (!chart.houseCusps) return null;
  
  // Get all house cusp longitudes
  const cusps: { house: number; longitude: number }[] = [];
  for (let i = 1; i <= 12; i++) {
    const lon = getHouseCuspLongitude(chart, i);
    if (lon === null) return null; // Incomplete house data
    cusps.push({ house: i, longitude: lon });
  }
  
  // Normalize longitude to 0-360
  let normLon = longitude % 360;
  if (normLon < 0) normLon += 360;
  
  // Find which house contains this longitude
  for (let i = 0; i < 12; i++) {
    const currentCusp = cusps[i].longitude;
    const nextCusp = cusps[(i + 1) % 12].longitude;
    
    // Handle wraparound at 0°
    if (nextCusp < currentCusp) {
      // This house spans 0° Aries
      if (normLon >= currentCusp || normLon < nextCusp) {
        return cusps[i].house;
      }
    } else {
      if (normLon >= currentCusp && normLon < nextCusp) {
        return cusps[i].house;
      }
    }
  }
  
  return 1; // Default to 1st house if calculation fails
};

// Get house for a natal planet
export const getNatalPlanetHouse = (
  planetName: string,
  chart: NatalChart
): number | null => {
  const planet = chart.planets[planetName as keyof typeof chart.planets];
  if (!planet?.sign) return null;
  
  const longitude = signDegreesToLongitude(planet.sign, planet.degree, planet.minutes);
  return getHouseForLongitude(longitude, chart);
};

// Get house for a transiting planet
export const getTransitPlanetHouse = (
  transitSign: string,
  transitDegree: number,
  chart: NatalChart
): number | null => {
  const longitude = signDegreesToLongitude(transitSign, transitDegree);
  return getHouseForLongitude(longitude, chart);
};

// House meanings for interpretations
export const HOUSE_MEANINGS: Record<number, { name: string; keywords: string; lifeArea: string }> = {
  1: { 
    name: '1st House', 
    keywords: 'Self, Identity, Appearance',
    lifeArea: 'your sense of self, how you present to the world, personal initiatives'
  },
  2: { 
    name: '2nd House', 
    keywords: 'Money, Values, Possessions',
    lifeArea: 'your finances, personal values, material security, self-worth'
  },
  3: { 
    name: '3rd House', 
    keywords: 'Communication, Siblings, Short Trips',
    lifeArea: 'daily communications, learning, siblings, local travel, mental processes'
  },
  4: { 
    name: '4th House', 
    keywords: 'Home, Family, Roots',
    lifeArea: 'your home, family, emotional foundations, private life, ancestry'
  },
  5: { 
    name: '5th House', 
    keywords: 'Creativity, Romance, Children',
    lifeArea: 'creative expression, romance, children, pleasure, self-expression'
  },
  6: { 
    name: '6th House', 
    keywords: 'Health, Work, Daily Routine',
    lifeArea: 'your health, daily work, routines, service, habits'
  },
  7: { 
    name: '7th House', 
    keywords: 'Partnerships, Marriage, Others',
    lifeArea: 'committed partnerships, marriage, one-on-one relationships, open enemies'
  },
  8: { 
    name: '8th House', 
    keywords: 'Transformation, Shared Resources, Death',
    lifeArea: 'shared finances, intimacy, transformation, inheritances, the occult'
  },
  9: { 
    name: '9th House', 
    keywords: 'Philosophy, Travel, Higher Education',
    lifeArea: 'higher learning, long-distance travel, philosophy, publishing, beliefs'
  },
  10: { 
    name: '10th House', 
    keywords: 'Career, Public Image, Authority',
    lifeArea: 'your career, public reputation, achievements, authority figures'
  },
  11: { 
    name: '11th House', 
    keywords: 'Friends, Groups, Hopes',
    lifeArea: 'friendships, groups, social causes, hopes and dreams, the collective'
  },
  12: { 
    name: '12th House', 
    keywords: 'Subconscious, Secrets, Solitude',
    lifeArea: 'your subconscious, hidden matters, solitude, spirituality, self-undoing'
  },
};

// Get house interpretation for a transit
export const getHouseOverlay = (
  transitPlanet: string,
  transitHouse: number | null,
  natalPlanet: string,
  natalHouse: number | null
): string => {
  if (!transitHouse && !natalHouse) return '';
  
  const parts: string[] = [];
  
  if (transitHouse) {
    const houseInfo = HOUSE_MEANINGS[transitHouse];
    parts.push(`Transit ${transitPlanet} is moving through your ${houseInfo.name} (${houseInfo.keywords}), activating ${houseInfo.lifeArea}.`);
  }
  
  if (natalHouse) {
    const houseInfo = HOUSE_MEANINGS[natalHouse];
    parts.push(`Your natal ${natalPlanet} in the ${houseInfo.name} connects themes of ${houseInfo.lifeArea}.`);
  }
  
  return parts.join(' ');
};

// Get short house label for compact display
export const getHouseLabel = (house: number | null): string => {
  if (!house) return '';
  return `${house}H`;
};

// Check if a chart has house data
export const hasHouseData = (chart: NatalChart): boolean => {
  if (!chart.houseCusps) return false;
  return !!chart.houseCusps.house1?.sign;
};

// Get detailed house transit interpretation based on which house a transiting planet enters
export const getTransitHouseInterpretation = (
  transitPlanet: string,
  house: number
): string => {
  const interpretations: Record<string, Record<number, string>> = {
    Sun: {
      1: 'Time to shine! Focus on yourself and new beginnings.',
      2: 'Attention turns to finances and what you value.',
      3: 'Busy with communications, learning, and local activities.',
      4: 'Home and family matters take center stage.',
      5: 'Creative expression and romance are highlighted.',
      6: 'Focus on health, work habits, and daily routines.',
      7: 'Relationships and partnerships demand attention.',
      8: 'Deep transformation and shared resources in focus.',
      9: 'Expand through travel, learning, or new philosophies.',
      10: 'Career and public image are illuminated.',
      11: 'Friends, groups, and future goals are emphasized.',
      12: 'Time for reflection, rest, and inner work.',
    },
    Moon: {
      1: 'Emotional focus on self and personal needs.',
      2: 'Feelings about money and security surface.',
      3: 'Emotional conversations and nostalgic thoughts.',
      4: 'Deep feelings about home and family.',
      5: 'Romantic feelings and creative moods.',
      6: 'Emotional needs around health and work.',
      7: 'Relationship feelings are prominent.',
      8: 'Intense emotions and intimacy needs.',
      9: 'Feelings about beliefs and meaning.',
      10: 'Emotions about career and public role.',
      11: 'Feelings about friendships and community.',
      12: 'Subconscious feelings surface; need for solitude.',
    },
    Mercury: {
      1: 'Thoughts focused on self-expression.',
      2: 'Thinking about money and values.',
      3: 'Mental activity peaks; many conversations.',
      4: 'Family discussions and home planning.',
      5: 'Creative ideas and playful communication.',
      6: 'Analysis of health and work matters.',
      7: 'Relationship discussions and negotiations.',
      8: 'Deep research and intimate conversations.',
      9: 'Philosophical thinking and study.',
      10: 'Career communications and planning.',
      11: 'Group discussions and future planning.',
      12: 'Introspective thinking; hidden information emerges.',
    },
    Venus: {
      1: 'Charm and attractiveness increase.',
      2: 'Financial luck and valuing pleasure.',
      3: 'Pleasant communications and short trips.',
      4: 'Beautifying the home; family harmony.',
      5: 'Romance, creativity, and joy flourish.',
      6: 'Harmony at work; health improvements.',
      7: 'Love and partnership harmony.',
      8: 'Intimate pleasures and shared resources.',
      9: 'Love of travel and learning.',
      10: 'Career charm and public favor.',
      11: 'Social pleasures and friendly connections.',
      12: 'Secret pleasures; artistic inspiration.',
    },
    Mars: {
      1: 'High energy and assertiveness.',
      2: 'Drive to earn and acquire.',
      3: 'Assertive communications; mental energy.',
      4: 'Activity at home; family conflicts possible.',
      5: 'Passionate creativity and romance.',
      6: 'High work energy; health focus.',
      7: 'Relationship conflicts or passion.',
      8: 'Intense desires and power struggles.',
      9: 'Fighting for beliefs; adventurous energy.',
      10: 'Career drive and ambition peak.',
      11: 'Group activities and social activism.',
      12: 'Hidden anger surfaces; need for retreat.',
    },
    Jupiter: {
      1: 'Personal growth and optimism expand.',
      2: 'Financial growth and abundance.',
      3: 'Expanding knowledge and connections.',
      4: 'Home improvements and family growth.',
      5: 'Creative abundance and romantic luck.',
      6: 'Health improvements and work opportunities.',
      7: 'Partnership growth and beneficial unions.',
      8: 'Inheritances and transformation opportunities.',
      9: 'Major travel and educational expansion.',
      10: 'Career success and recognition.',
      11: 'Social expansion and achieving dreams.',
      12: 'Spiritual growth and inner expansion.',
    },
    Saturn: {
      1: 'Self-discipline and maturity demanded.',
      2: 'Financial responsibility and restructuring.',
      3: 'Serious communications; learning challenges.',
      4: 'Home responsibilities and family duties.',
      5: 'Creative discipline; romantic caution.',
      6: 'Health challenges demand attention to routines.',
      7: 'Relationship tests and commitments.',
      8: 'Facing fears and financial obligations.',
      9: 'Structuring beliefs and long-term planning.',
      10: 'Career challenges and building reputation.',
      11: 'Restructuring friendships and goals.',
      12: 'Confronting fears and karma.',
    },
    Uranus: {
      1: 'Sudden changes to identity and appearance.',
      2: 'Financial upheavals and new values.',
      3: 'Revolutionary ideas and unexpected news.',
      4: 'Home disruptions and family changes.',
      5: 'Unexpected romance and creative breakthroughs.',
      6: 'Work changes and health innovations.',
      7: 'Relationship surprises and freedom needs.',
      8: 'Sudden transformations and awakenings.',
      9: 'Belief changes and unexpected journeys.',
      10: 'Career revolutions and new directions.',
      11: 'New friendships and changed goals.',
      12: 'Spiritual awakenings and hidden discoveries.',
    },
    Neptune: {
      1: 'Identity confusion or spiritual awakening.',
      2: 'Financial confusion or inspired values.',
      3: 'Intuitive communications; creative writing.',
      4: 'Family idealization or confusion.',
      5: 'Romantic fantasy and artistic inspiration.',
      6: 'Health sensitivities; compassionate service.',
      7: 'Relationship idealization or disappointment.',
      8: 'Psychic sensitivity and boundary issues.',
      9: 'Spiritual seeking and imaginative travel.',
      10: 'Career ideals and public image confusion.',
      11: 'Idealistic friendships and inspired goals.',
      12: 'Deep spiritual work and transcendence.',
    },
    Pluto: {
      1: 'Complete identity transformation.',
      2: 'Power issues with money and values.',
      3: 'Transformative communications and thinking.',
      4: 'Deep family healing and home changes.',
      5: 'Creative rebirth and intense romance.',
      6: 'Health transformations and work power dynamics.',
      7: 'Relationship power struggles and rebirth.',
      8: 'Deep transformation and regeneration.',
      9: 'Belief transformation and powerful journeys.',
      10: 'Career transformation and power.',
      11: 'Group power dynamics and changing goals.',
      12: 'Subconscious purging and spiritual death/rebirth.',
    },
  };
  
  return interpretations[transitPlanet]?.[house] || 
    `Transit ${transitPlanet} activates your ${HOUSE_MEANINGS[house].name} themes.`;
};
