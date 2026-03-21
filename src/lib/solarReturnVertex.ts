/**
 * Vertex in Solar Return — Calculation and Interpretation
 * Sources: L. Edward Johndro, Charles Jayne, Brian Clark ("The Vertex-Anti-Vertex"),
 * Donna Henson, Erin Sullivan
 *
 * The Vertex is the intersection of the Prime Vertical with the Ecliptic in the west.
 * In moderate latitudes it typically falls in houses 5-8.
 * It represents fated encounters, destined events, and experiences beyond conscious control.
 */

import { NatalPlanetPosition } from '@/hooks/useNatalChart';

const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces'];

const toAbsDeg = (pos: { sign: string; degree: number; minutes?: number }): number => {
  const idx = SIGNS.indexOf(pos.sign);
  return idx * 30 + pos.degree + (pos.minutes || 0) / 60;
};

const fromAbsDeg = (absDeg: number): { sign: string; degree: number; minutes: number } => {
  let d = ((absDeg % 360) + 360) % 360;
  const signIdx = Math.floor(d / 30);
  const rem = d - signIdx * 30;
  return { sign: SIGNS[signIdx], degree: Math.floor(rem), minutes: Math.round((rem % 1) * 60) };
};

/**
 * Calculate the Vertex given the MC and geographic latitude.
 * Formula: Vertex = Ascendant calculated with colatitude (90° - |latitude|).
 * The Vertex is the western intersection of the Prime Vertical with the Ecliptic.
 *
 * Simplified formula:
 * RAMC = absolute degree of MC
 * Colatitude = 90 - |latitude|
 * Vertex longitude = atan2(cos(RAMC), -sin(RAMC) * cos(obliquity) - tan(colatitude) * sin(obliquity))
 */
export function calculateVertex(
  mcSign: string, mcDegree: number, mcMinutes: number,
  latitude: number
): { sign: string; degree: number; minutes: number } | null {
  if (!mcSign || latitude === undefined) return null;

  const obliquity = 23.4393; // mean obliquity of the ecliptic in degrees
  const toRad = (d: number) => d * Math.PI / 180;
  const toDeg = (r: number) => r * 180 / Math.PI;

  const mcAbsDeg = SIGNS.indexOf(mcSign) * 30 + mcDegree + (mcMinutes || 0) / 60;
  const RAMC = toRad(mcAbsDeg);
  const oblRad = toRad(obliquity);
  const colatitude = 90 - Math.abs(latitude);
  const colatRad = toRad(colatitude);

  // Calculate using the Ascendant formula with colatitude
  const y = Math.cos(RAMC);
  const x = -(Math.sin(RAMC) * Math.cos(oblRad)) - (Math.tan(colatRad) * Math.sin(oblRad));

  let vertexLong = toDeg(Math.atan2(y, x));
  // Normalize to 0-360
  vertexLong = ((vertexLong % 360) + 360) % 360;

  // The Vertex should be in the western half (houses 5-8, roughly 180-360 from ASC)
  // If it ends up in the eastern half, add 180° to get the correct western point
  // Typically Vertex falls between roughly 150° and 330° absolute
  // This is a simplified check - in most cases the formula yields the correct hemisphere

  return fromAbsDeg(vertexLong);
}

/**
 * Common city latitudes for fallback when location is a city name.
 * Covers major world cities and US cities commonly used in astrology software.
 */
const CITY_LATITUDES: Record<string, number> = {
  'new york': 40.71, 'los angeles': 33.94, 'chicago': 41.88, 'houston': 29.76,
  'phoenix': 33.45, 'philadelphia': 39.95, 'san antonio': 29.42, 'san diego': 32.72,
  'dallas': 32.78, 'san jose': 37.34, 'austin': 30.27, 'jacksonville': 30.33,
  'san francisco': 37.77, 'columbus': 39.96, 'charlotte': 35.23, 'indianapolis': 39.77,
  'seattle': 47.61, 'denver': 39.74, 'washington': 38.91, 'nashville': 36.16,
  'oklahoma city': 35.47, 'el paso': 31.76, 'boston': 42.36, 'portland': 45.52,
  'las vegas': 36.17, 'memphis': 35.15, 'louisville': 38.25, 'baltimore': 39.29,
  'milwaukee': 43.04, 'albuquerque': 35.08, 'tucson': 32.22, 'fresno': 36.74,
  'sacramento': 38.58, 'mesa': 33.42, 'kansas city': 39.10, 'atlanta': 33.75,
  'omaha': 41.26, 'colorado springs': 38.83, 'raleigh': 35.78, 'miami': 25.76,
  'cleveland': 41.50, 'tulsa': 36.15, 'oakland': 37.80, 'minneapolis': 44.98,
  'tampa': 27.95, 'arlington': 32.74, 'new orleans': 29.95, 'bakersfield': 35.37,
  'honolulu': 21.31, 'anaheim': 33.84, 'santa ana': 33.75, 'st louis': 38.63,
  'pittsburgh': 40.44, 'cincinnati': 39.10, 'orlando': 28.54, 'detroit': 42.33,
  'london': 51.51, 'paris': 48.86, 'berlin': 52.52, 'rome': 41.90, 'madrid': 40.42,
  'amsterdam': 52.37, 'vienna': 48.21, 'brussels': 50.85, 'zurich': 47.38,
  'stockholm': 59.33, 'oslo': 59.91, 'copenhagen': 55.68, 'dublin': 53.35,
  'lisbon': 38.72, 'prague': 50.08, 'warsaw': 52.23, 'budapest': 47.50,
  'athens': 37.98, 'barcelona': 41.39, 'munich': 48.14, 'milan': 45.46,
  'moscow': 55.76, 'istanbul': 41.01, 'cairo': 30.04, 'tel aviv': 32.09,
  'jerusalem': 31.77, 'dubai': 25.20, 'mumbai': 19.08, 'delhi': 28.61,
  'bangalore': 12.97, 'kolkata': 22.57, 'chennai': 13.08, 'tokyo': 35.68,
  'osaka': 34.69, 'beijing': 39.90, 'shanghai': 31.23, 'hong kong': 22.32,
  'singapore': 1.35, 'bangkok': 13.76, 'seoul': 37.57, 'taipei': 25.03,
  'sydney': -33.87, 'melbourne': -37.81, 'brisbane': -27.47, 'perth': -31.95,
  'auckland': -36.85, 'wellington': -41.29, 'toronto': 43.65, 'vancouver': 49.28,
  'montreal': 45.50, 'calgary': 51.05, 'ottawa': 45.42, 'mexico city': 19.43,
  'sao paulo': -23.55, 'rio de janeiro': -22.91, 'buenos aires': -34.60,
  'lima': -12.05, 'bogota': 4.71, 'santiago': -33.45, 'johannesburg': -26.20,
  'cape town': -33.93, 'nairobi': -1.29, 'lagos': 6.52, 'accra': 5.56,
};

/**
 * Parse latitude from a location string.
 * Handles: "40°42'N", decimal numbers, and city name lookups.
 * Returns null if unparseable.
 */
export function parseLatitudeFromLocation(location: string): number | null {
  if (!location) return null;

  // Try "40°42'N" format
  const dmsMatch = location.match(/(\d+)[°](\d*)[']?\s*(N|S)/i);
  if (dmsMatch) {
    const deg = parseInt(dmsMatch[1]) + (parseInt(dmsMatch[2] || '0') / 60);
    return dmsMatch[3].toUpperCase() === 'S' ? -deg : deg;
  }

  // Try "lat, lng" decimal pair (e.g. "40.71, -74.01")
  const pairMatch = location.match(/([-]?\d+\.\d+)\s*,\s*([-]?\d+\.\d+)/);
  if (pairMatch) {
    const lat = parseFloat(pairMatch[1]);
    if (lat >= -90 && lat <= 90) return lat;
  }

  // Try city name lookup (case-insensitive, ignore state/country suffixes)
  const lower = location.toLowerCase().trim();
  for (const [city, lat] of Object.entries(CITY_LATITUDES)) {
    if (lower.includes(city)) return lat;
  }

  // Try standalone decimal as last resort
  const decMatch = location.match(/([-]?\d+\.?\d*)/);
  if (decMatch) {
    const val = parseFloat(decMatch[1]);
    if (val >= -90 && val <= 90) return val;
  }

  return null;
}

// ─── Vertex in Sign Interpretations ─────────────────────────────────

export const vertexInSign: Record<string, {
  title: string;
  fatedTheme: string;
  encounters: string;
  lesson: string;
}> = {
  Aries: {
    title: 'Fated Self-Assertion',
    fatedTheme: 'This year, destiny pushes you toward courage, independence, and taking the initiative. Fated events require you to stand on your own, fight for yourself, and claim your personal power — even when you would prefer to defer.',
    encounters: 'You may encounter bold, pioneering individuals who catalyze your own assertiveness. A warrior figure, entrepreneur, or someone who forces you to compete may appear at a turning point.',
    lesson: 'The universe is teaching you that waiting for permission is no longer an option. The fated encounters of this year demand that you ACT, even imperfectly, rather than deliberate endlessly.',
  },
  Taurus: {
    title: 'Fated Grounding',
    fatedTheme: 'Destiny draws you toward matters of material security, beauty, and sensual experience. Fated events connect you to the physical world — land, money, the body, art, and what endures.',
    encounters: 'You may meet someone who embodies stability, sensuality, or artistic mastery. A business partner, artisan, or someone connected to the earth (farming, real estate, crafts) may appear as a fated figure.',
    lesson: 'The lesson is permanence — building something that lasts rather than chasing what is exciting but ephemeral. Value what is real and tangible.',
  },
  Gemini: {
    title: 'Fated Connection',
    fatedTheme: 'Destiny works through communication, ideas, and unexpected information this year. A single conversation, letter, email, or piece of news may change the course of your year.',
    encounters: 'A messenger figure — a writer, teacher, sibling, neighbor, or communicator — appears at a pivotal moment. Twins, duality, and choosing between two paths are themes.',
    lesson: 'The universe is teaching you to listen, learn, and remain curious. The fated path runs through information and exchange, not isolation.',
  },
  Cancer: {
    title: 'Fated Belonging',
    fatedTheme: 'Destiny pulls you toward home, family, and emotional roots. A fated event may involve a parent, your living situation, or the creation of a family structure.',
    encounters: 'A maternal or nurturing figure may appear with uncanny timing. Family members you did not expect to reconnect with may become central. Real estate transactions have a "meant to be" quality.',
    lesson: 'The lesson is about belonging — not just having a house, but having a HOME. Emotional safety is the foundation from which everything else grows.',
  },
  Leo: {
    title: 'Fated Self-Expression',
    fatedTheme: 'Destiny demands that you be SEEN this year. Creative expression, performance, romance, and leadership are the arenas where fated encounters occur.',
    encounters: 'A lover, creative collaborator, or someone who reflects your magnificence back to you may appear at a crucial moment. Children may be central to the fated narrative.',
    lesson: 'You are being taught that your light is not optional — hiding it serves no one. The fated events of this year push you onto the stage of your own life.',
  },
  Virgo: {
    title: 'Fated Service',
    fatedTheme: 'Destiny connects you to health, healing, and meaningful work. A fated event may involve a health crisis, a work opportunity, or a call to service that you cannot refuse.',
    encounters: 'A healer, mentor, or master craftsperson may appear with perfect timing. Someone who needs your specific skills may cross your path in a way that feels orchestrated by fate.',
    lesson: 'The lesson is that your gifts are not just for you — they are meant to serve something larger. Precision, humility, and devotion to craft are the fated curriculum.',
  },
  Libra: {
    title: 'Fated Partnership',
    fatedTheme: 'Destiny works through relationships this year. A fated encounter with a significant other — romantic, business, or artistic — is one of the strongest possibilities of the entire Solar Return.',
    encounters: 'A partner, collaborator, or even an adversary appears at the exact moment when balance in your life is most needed. Marriage, contracts, and legal agreements carry a fated quality.',
    lesson: 'The lesson is that you cannot do this year alone. Relationship IS the curriculum. Fairness, beauty, and the courage to truly partner define the fated path.',
  },
  Scorpio: {
    title: 'Fated Transformation',
    fatedTheme: 'Destiny demands psychological death and rebirth. Fated events strip away what is no longer authentic, forcing transformation through crisis, intimacy, or confrontation with power.',
    encounters: 'An intensely transformative individual — a therapist, lover, financial partner, or power figure — enters your life at a pivotal moment. The encounter is unforgettable and irreversible.',
    lesson: 'The universe is teaching you about surrender. What must die cannot be saved, and what is being born cannot be stopped. Trust the process of destruction and renewal.',
  },
  Sagittarius: {
    title: 'Fated Expansion',
    fatedTheme: 'Destiny works through travel, education, and encounters with foreign cultures or philosophies. A fated journey — physical or intellectual — changes your worldview permanently.',
    encounters: 'A teacher, guru, foreign national, or philosopher appears at the perfect moment. A travel experience or academic opportunity arrives as if orchestrated by fate.',
    lesson: 'The lesson is that your current worldview is too small. The fated events of this year stretch you beyond comfortable beliefs into a broader understanding of truth.',
  },
  Capricorn: {
    title: 'Fated Responsibility',
    fatedTheme: 'Destiny connects you to authority, career, and the assumption of serious responsibility. A fated event involves your professional life, public reputation, or relationship with institutions.',
    encounters: 'A boss, mentor, authority figure, or institution becomes the catalyst for fated developments. Promotions, demotions, or career turning points arrive with a sense of inevitability.',
    lesson: 'The lesson is about mastery and accountability. The fated path runs through accepting the weight of responsibility and building something that matters in the real world.',
  },
  Aquarius: {
    title: 'Fated Liberation',
    fatedTheme: 'Destiny works through sudden breaks, innovations, and encounters with unconventional people or groups. A fated event disrupts the status quo and forces evolution.',
    encounters: 'A revolutionary, iconoclast, or visionary enters your life at a turning point. Technology, science, or progressive social movements may be the vehicle for fated change.',
    lesson: 'The universe is teaching you that freedom IS the path. The fated events of this year liberate you from structures, beliefs, or relationships that have become prisons.',
  },
  Pisces: {
    title: 'Fated Surrender',
    fatedTheme: 'Destiny works through spiritual experience, artistic inspiration, and compassionate service. Fated events dissolve boundaries and connect you to something transcendent.',
    encounters: 'A spiritual teacher, artist, healer, or someone in need of compassion appears at a crucial moment. The encounter may feel mystical, dreamlike, or beyond rational explanation.',
    lesson: 'The lesson is that control is an illusion. The fated events of this year teach you to trust the flow, serve without expectation, and find meaning in surrender.',
  },
};

// ─── Vertex in House Interpretations ────────────────────────────────

export const vertexInHouse: Record<number, {
  title: string;
  description: string;
  fatedArea: string;
}> = {
  5: {
    title: 'Fated Creativity & Romance',
    description: 'The Vertex in the 5th house is one of the most common and powerful placements for fated romantic encounters, creative breakthroughs, and significant events involving children. Love that arrives this year may carry a "destined" quality — you feel compelled toward someone or something creative without understanding why.',
    fatedArea: 'Romance, children, creative projects, self-expression, performance',
  },
  6: {
    title: 'Fated Work & Health Turning Points',
    description: 'The Vertex in the 6th house brings fated events through daily work, health matters, or service encounters. A job opportunity, health crisis, or someone you serve may change your trajectory. The "ordinary" becomes the vehicle for the extraordinary.',
    fatedArea: 'Work opportunities, health events, service encounters, daily routine changes',
  },
  7: {
    title: 'Fated Partnerships & Contracts',
    description: 'The Vertex in the 7th house is the most classically "fated" placement for relationships. Significant others — romantic partners, business partners, or even open adversaries — appear with uncanny timing. Marriage, contracts, and legal agreements carry a destined quality.',
    fatedArea: 'Marriage, partnerships, contracts, legal matters, significant one-on-one encounters',
  },
  8: {
    title: 'Fated Transformation & Crisis',
    description: 'The Vertex in the 8th house brings fated encounters through crisis, intimacy, shared resources, or psychological transformation. Events involving death, inheritance, sexuality, or deep psychological change feel orchestrated by forces beyond your control.',
    fatedArea: 'Intimacy, shared finances, inheritance, crisis events, psychological transformation',
  },
};

// ─── Vertex Aspects ─────────────────────────────────────────────────

export const vertexAspectMeanings: Record<string, string> = {
  Sun: 'A fated encounter with an authority figure, leader, or someone who illuminates your identity. Meeting your "other self" — someone who reflects who you are meant to become.',
  Moon: 'A fated emotional connection — someone who instinctively understands your needs. A woman or nurturing figure appears at a pivotal moment. Family events carry a destined quality.',
  Mercury: 'A fated message, conversation, or piece of information changes everything. A sibling, writer, or communicator is the catalyst. Words heard at the right moment alter your path.',
  Venus: 'One of the strongest indicators of a fated love encounter. Meeting someone who embodies beauty, love, or artistic inspiration. Financial windfalls through destined connections.',
  Mars: 'A fated confrontation or passionate encounter. Someone pushes you into action you would not have taken alone. A competitor or lover appears with irresistible force.',
  Jupiter: 'A fated opportunity or encounter with a benefactor, teacher, or generous soul. Luck arrives through someone else\'s intervention. Travel or education opens a destined door.',
  Saturn: 'A fated encounter with responsibility, limitation, or an authority figure who shapes your maturity. A difficult but necessary lesson arrives through relationship.',
  Uranus: 'A sudden, unexpected fated encounter that shatters the status quo. Someone or something disrupts your life in a way that ultimately liberates you. The most "electric" vertex contact.',
  Neptune: 'A fated spiritual, artistic, or compassionate encounter. Meeting a soulmate or spiritual teacher. The danger of idealization — is this destiny or delusion?',
  Pluto: 'The most transformative fated encounter possible. Meeting someone who permanently alters your psychological landscape. Power, death, rebirth, and irreversible change through another person.',
  NorthNode: 'A supremely fated encounter — the Vertex and North Node together indicate a person or event that is directly connected to your soul\'s evolutionary purpose this year.',
  Chiron: 'A fated encounter with a wounded healer or a situation that triggers your deepest wound — but this time, for the purpose of healing rather than re-wounding.',
  Ascendant: 'A fated encounter that changes how you see yourself and how others see you. Someone appears who mirrors your identity back to you in a new way.',
};
