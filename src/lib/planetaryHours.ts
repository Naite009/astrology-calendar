import * as Astronomy from 'astronomy-engine';

// Chaldean order of planets (repeating cycle)
const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'] as const;
type ChaldeanPlanet = typeof CHALDEAN_ORDER[number];

// Day rulers (first hour of the day is ruled by the day's planet)
const DAY_RULERS: Record<number, ChaldeanPlanet> = {
  0: 'Sun',     // Sunday
  1: 'Moon',    // Monday
  2: 'Mars',    // Tuesday
  3: 'Mercury', // Wednesday
  4: 'Jupiter', // Thursday
  5: 'Venus',   // Friday
  6: 'Saturn',  // Saturday
};

// Planet symbols
const PLANET_SYMBOLS: Record<ChaldeanPlanet, string> = {
  Saturn: '♄',
  Jupiter: '♃',
  Mars: '♂',
  Sun: '☉',
  Venus: '♀',
  Mercury: '☿',
  Moon: '☽',
};

// What each planetary hour is good for
export const PLANETARY_HOUR_MEANINGS: Record<ChaldeanPlanet, {
  symbol: string;
  bestFor: string[];
  avoid: string[];
  keywords: string[];
  element: string;
}> = {
  Sun: {
    symbol: '☉',
    bestFor: ['Leadership decisions', 'Self-promotion', 'Vitality & health', 'Creative projects', 'Meeting authority figures', 'New beginnings'],
    avoid: ['Hidden activities', 'Deception', 'Overly humble approaches'],
    keywords: ['confidence', 'vitality', 'success', 'authority'],
    element: 'Fire',
  },
  Moon: {
    symbol: '☽',
    bestFor: ['Domestic matters', 'Family time', 'Emotional conversations', 'Intuitive work', 'Women\'s health', 'Nurturing activities'],
    avoid: ['Long-term commitments', 'Major purchases', 'Logical analysis'],
    keywords: ['emotions', 'intuition', 'home', 'family'],
    element: 'Water',
  },
  Mercury: {
    symbol: '☿',
    bestFor: ['Writing', 'Communication', 'Learning', 'Travel plans', 'Tech work', 'Signing contracts', 'Teaching', 'Study'],
    avoid: ['Emotional decisions', 'Long-term commitments without research'],
    keywords: ['communication', 'intellect', 'travel', 'commerce'],
    element: 'Air',
  },
  Venus: {
    symbol: '♀',
    bestFor: ['Love & romance', 'Beauty treatments', 'Shopping for luxury', 'Artistic work', 'Social gatherings', 'Financial negotiations', 'Decorating'],
    avoid: ['Conflict', 'Harsh criticism', 'Ascetic activities'],
    keywords: ['love', 'beauty', 'pleasure', 'harmony'],
    element: 'Earth/Water',
  },
  Mars: {
    symbol: '♂',
    bestFor: ['Physical activity', 'Competition', 'Surgery', 'Starting battles', 'Assertive action', 'Breaking obstacles', 'Courage-requiring tasks'],
    avoid: ['Delicate negotiations', 'Patience-required tasks', 'Seeking peace'],
    keywords: ['action', 'energy', 'courage', 'conflict'],
    element: 'Fire',
  },
  Jupiter: {
    symbol: '♃',
    bestFor: ['Legal matters', 'Higher education', 'Religious activities', 'Long journeys', 'Publishing', 'Expansion', 'Philanthropy', 'Luck-requiring ventures'],
    avoid: ['Small-minded thinking', 'Restriction', 'Pessimism'],
    keywords: ['expansion', 'wisdom', 'luck', 'generosity'],
    element: 'Fire/Air',
  },
  Saturn: {
    symbol: '♄',
    bestFor: ['Serious work', 'Long-term planning', 'Discipline matters', 'Real estate', 'Agriculture', 'Elder care', 'Boundaries', 'Endings'],
    avoid: ['New beginnings', 'Frivolity', 'Impulsive actions', 'Short-term thinking'],
    keywords: ['discipline', 'structure', 'endings', 'karma'],
    element: 'Earth',
  },
};

// Calculate sunrise and sunset for a location
export const getSunTimes = (date: Date, latitude: number, longitude: number): { sunrise: Date; sunset: Date } => {
  try {
    const observer = new Astronomy.Observer(latitude, longitude, 0);
    
    // Set search start to midnight
    const searchStart = new Date(date);
    searchStart.setHours(0, 0, 0, 0);
    
    // Search for sunrise
    const sunriseSearch = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, searchStart, 1);
    const sunsetSearch = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, searchStart, 1);
    
    if (!sunriseSearch || !sunsetSearch) {
      // Default fallback (6 AM / 6 PM)
      const sunrise = new Date(date);
      sunrise.setHours(6, 0, 0, 0);
      const sunset = new Date(date);
      sunset.setHours(18, 0, 0, 0);
      return { sunrise, sunset };
    }
    
    return {
      sunrise: sunriseSearch.date,
      sunset: sunsetSearch.date,
    };
  } catch {
    // Fallback for extreme latitudes or errors
    const sunrise = new Date(date);
    sunrise.setHours(6, 0, 0, 0);
    const sunset = new Date(date);
    sunset.setHours(18, 0, 0, 0);
    return { sunrise, sunset };
  }
};

export interface PlanetaryHour {
  planet: ChaldeanPlanet;
  symbol: string;
  start: Date;
  end: Date;
  isDay: boolean;
  hourNumber: number; // 1-12 for day, 1-12 for night
  meanings: typeof PLANETARY_HOUR_MEANINGS[ChaldeanPlanet];
}

// Calculate all 24 planetary hours for a day
export const calculatePlanetaryHours = (
  date: Date,
  latitude: number = 40.7128, // Default NYC
  longitude: number = -74.0060
): PlanetaryHour[] => {
  const { sunrise, sunset } = getSunTimes(date, latitude, longitude);
  
  // Calculate next sunrise for night hours
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const { sunrise: nextSunrise } = getSunTimes(nextDay, latitude, longitude);
  
  // Day duration and night duration in ms
  const dayDuration = sunset.getTime() - sunrise.getTime();
  const nightDuration = nextSunrise.getTime() - sunset.getTime();
  
  // Each day/night has 12 "hours" (not clock hours!)
  const dayHourLength = dayDuration / 12;
  const nightHourLength = nightDuration / 12;
  
  // Get day ruler (first hour ruler)
  const dayOfWeek = date.getDay();
  const dayRuler = DAY_RULERS[dayOfWeek];
  const startIndex = CHALDEAN_ORDER.indexOf(dayRuler);
  
  const hours: PlanetaryHour[] = [];
  
  // Day hours (sunrise to sunset)
  for (let i = 0; i < 12; i++) {
    const planetIndex = (startIndex + (7 - (i % 7))) % 7;
    const planet = CHALDEAN_ORDER[planetIndex];
    
    hours.push({
      planet,
      symbol: PLANET_SYMBOLS[planet],
      start: new Date(sunrise.getTime() + i * dayHourLength),
      end: new Date(sunrise.getTime() + (i + 1) * dayHourLength),
      isDay: true,
      hourNumber: i + 1,
      meanings: PLANETARY_HOUR_MEANINGS[planet],
    });
  }
  
  // Night hours (sunset to next sunrise)
  for (let i = 0; i < 12; i++) {
    const planetIndex = (startIndex + (7 - ((12 + i) % 7))) % 7;
    const planet = CHALDEAN_ORDER[planetIndex];
    
    hours.push({
      planet,
      symbol: PLANET_SYMBOLS[planet],
      start: new Date(sunset.getTime() + i * nightHourLength),
      end: new Date(sunset.getTime() + (i + 1) * nightHourLength),
      isDay: false,
      hourNumber: i + 1,
      meanings: PLANETARY_HOUR_MEANINGS[planet],
    });
  }
  
  return hours;
};

// Get current planetary hour
export const getCurrentPlanetaryHour = (
  latitude: number = 40.7128,
  longitude: number = -74.0060
): PlanetaryHour | null => {
  const now = new Date();
  const hours = calculatePlanetaryHours(now, latitude, longitude);
  
  return hours.find(h => now.getTime() >= h.start.getTime() && now.getTime() < h.end.getTime()) || null;
};

// Get planetary hour at a specific time
export const getPlanetaryHourAt = (
  date: Date,
  latitude: number = 40.7128,
  longitude: number = -74.0060
): PlanetaryHour | null => {
  const hours = calculatePlanetaryHours(date, latitude, longitude);
  return hours.find(h => date.getTime() >= h.start.getTime() && date.getTime() < h.end.getTime()) || null;
};

// Format time for display
export const formatPlanetaryHourTime = (date: Date, timezone: string = 'America/New_York'): string => {
  return date.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
  });
};

// Get day ruler info
export const getDayRuler = (date: Date): { planet: ChaldeanPlanet; symbol: string; dayName: string } => {
  const dayOfWeek = date.getDay();
  const planet = DAY_RULERS[dayOfWeek];
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  return {
    planet,
    symbol: PLANET_SYMBOLS[planet],
    dayName: dayNames[dayOfWeek],
  };
};
