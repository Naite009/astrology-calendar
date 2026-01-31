// Human Design Calculation Engine
// Uses astronomy-engine for precise ephemeris calculations

import * as Astronomy from 'astronomy-engine';
import {
  HumanDesignChart,
  HDPlanetaryActivation,
  HDType,
  HDAuthority,
  HDStrategy,
  HDProfile,
  HDDefinitionType,
  HDIncarnationCross,
  HDGateActivation,
  HDCenterName,
  GATE_TO_CENTER,
  CHANNELS,
} from '@/types/humanDesign';

// I-Ching Wheel mapping: 64 gates distributed around the zodiac
// Each gate occupies 5.625° (360° / 64 = 5.625°)
// The wheel starts at 58°00' Capricorn (Gate 41)
const ICHING_WHEEL_START = 268; // 268° = 28° Capricorn in absolute degrees

// Gate order around the I-Ching mandala (starting from Gate 41)
const GATE_ORDER: number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, // Capricorn-Aquarius
  22, 36, 25, 17, 21, 51, 42, 3,  // Aquarius-Pisces
  27, 24, 2, 23, 8, 20, 16, 35,   // Pisces-Aries
  45, 12, 15, 52, 39, 53, 62, 56, // Aries-Taurus
  31, 33, 7, 4, 29, 59, 40, 64,   // Taurus-Gemini
  47, 6, 46, 18, 48, 57, 32, 50,  // Gemini-Cancer
  28, 44, 1, 43, 14, 34, 9, 5,    // Cancer-Leo
  26, 11, 10, 58, 38, 54, 61, 60, // Leo-Virgo-Libra-Scorpio-Sagittarius
];

// Calculate which gate a planetary position falls into
export function getGateFromLongitude(longitude: number): { gate: number; line: number } {
  // Normalize longitude to 0-360
  let normalizedLong = ((longitude % 360) + 360) % 360;
  
  // Adjust for I-Ching wheel offset (starts at 28° Capricorn = 268° + 58/60)
  // The wheel starts at Gate 41 at 58°00' Capricorn
  const wheelStart = 268 + (58 / 60); // 268.9667°
  
  // Calculate position relative to wheel start
  let relativePosition = normalizedLong - wheelStart;
  if (relativePosition < 0) relativePosition += 360;
  
  // Each gate spans 5.625°
  const gateSpan = 360 / 64; // 5.625°
  const gateIndex = Math.floor(relativePosition / gateSpan);
  
  // Get gate number from order
  const gate = GATE_ORDER[gateIndex % 64];
  
  // Calculate line (1-6) within the gate
  // Each line spans 5.625° / 6 = 0.9375°
  const positionInGate = relativePosition % gateSpan;
  const lineSpan = gateSpan / 6;
  const line = Math.floor(positionInGate / lineSpan) + 1;
  
  return { gate, line: Math.min(line, 6) };
}

// Calculate the Design date (88° before birth)
export function calculateDesignDate(birthDate: Date): Date {
  // The Design calculation uses the Sun's position 88° before birth
  // We need to find when the Sun was at current_position - 88°
  
  const birthTime = Astronomy.MakeTime(birthDate);
  const sunAtBirth = Astronomy.SunPosition(birthTime);
  const birthEcliptic = Astronomy.Ecliptic(sunAtBirth.vec);
  
  // Target longitude is birth longitude - 88°
  let targetLongitude = birthEcliptic.elon - 88;
  if (targetLongitude < 0) targetLongitude += 360;
  
  // The Sun moves approximately 1° per day, so 88° ≈ 88 days before
  // Start searching from approximately 88 days before birth
  let searchDate = new Date(birthDate);
  searchDate.setDate(searchDate.getDate() - 88);
  
  // Binary search to find exact date when Sun was at target longitude
  // The Sun moves about 0.9856° per day on average
  let low = new Date(birthDate);
  low.setDate(low.getDate() - 95); // Start a bit earlier
  let high = new Date(birthDate);
  high.setDate(high.getDate() - 80); // End a bit later
  
  // Iterate to find the exact time
  for (let i = 0; i < 50; i++) {
    const mid = new Date((low.getTime() + high.getTime()) / 2);
    const midTime = Astronomy.MakeTime(mid);
    const sunAtMid = Astronomy.SunPosition(midTime);
    const midEcliptic = Astronomy.Ecliptic(sunAtMid.vec);
    
    // Handle wraparound at 0°/360°
    let diff = midEcliptic.elon - targetLongitude;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    if (Math.abs(diff) < 0.001) {
      return mid; // Found it within tolerance
    }
    
    if (diff > 0) {
      high = mid;
    } else {
      low = mid;
    }
  }
  
  // Return best approximation
  return new Date((low.getTime() + high.getTime()) / 2);
}

// Get planetary positions for a given date/time
export function getPlanetaryPositions(date: Date): Map<string, number> {
  const time = Astronomy.MakeTime(date);
  const positions = new Map<string, number>();
  
  // Sun
  const sun = Astronomy.SunPosition(time);
  const sunEcliptic = Astronomy.Ecliptic(sun.vec);
  positions.set('Sun', sunEcliptic.elon);
  
  // Earth position is opposite to Sun
  positions.set('Earth', (sunEcliptic.elon + 180) % 360);
  
  // Moon
  const moon = Astronomy.GeoMoon(time);
  const moonEcliptic = Astronomy.Ecliptic(moon);
  positions.set('Moon', moonEcliptic.elon);
  
  // Planets
  const planets: Astronomy.Body[] = [
    Astronomy.Body.Mercury,
    Astronomy.Body.Venus,
    Astronomy.Body.Mars,
    Astronomy.Body.Jupiter,
    Astronomy.Body.Saturn,
    Astronomy.Body.Uranus,
    Astronomy.Body.Neptune,
    Astronomy.Body.Pluto,
  ];
  
  for (const planet of planets) {
    const pos = Astronomy.GeoVector(planet, time, true);
    const ecliptic = Astronomy.Ecliptic(pos);
    positions.set(Astronomy.Body[planet], ecliptic.elon);
  }
  
  // Lunar Nodes
  const moonOrbit = Astronomy.GeoMoon(time);
  const moonEcl = Astronomy.Ecliptic(moonOrbit);
  
  // Calculate North Node (Mean Node approximation)
  // This is a simplified calculation - for more precision, use Swiss Ephemeris
  const daysSinceJ2000 = (date.getTime() - Date.UTC(2000, 0, 1, 12, 0, 0)) / (1000 * 60 * 60 * 24);
  const meanNodeLongitude = (125.04 - 0.0529539 * daysSinceJ2000) % 360;
  const northNode = meanNodeLongitude < 0 ? meanNodeLongitude + 360 : meanNodeLongitude;
  
  positions.set('NorthNode', northNode);
  positions.set('SouthNode', (northNode + 180) % 360);
  
  return positions;
}

// Calculate activations for a given date
export function calculateActivations(date: Date, isConscious: boolean): HDPlanetaryActivation[] {
  const positions = getPlanetaryPositions(date);
  const activations: HDPlanetaryActivation[] = [];
  
  const planetOrder = [
    'Sun', 'Earth', 'NorthNode', 'SouthNode', 'Moon',
    'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn',
    'Uranus', 'Neptune', 'Pluto'
  ];
  
  for (const planet of planetOrder) {
    const longitude = positions.get(planet);
    if (longitude !== undefined) {
      const { gate, line } = getGateFromLongitude(longitude);
      activations.push({
        planet,
        gate,
        line,
        longitude,
        isConscious,
      });
    }
  }
  
  return activations;
}

// Determine HD Type based on defined centers
export function determineType(definedCenters: HDCenterName[], definedChannels: string[]): HDType {
  const hasSacral = definedCenters.includes('Sacral');
  const hasThroat = definedCenters.includes('Throat');
  
  // Check for motor to throat connection
  const motorCenters: HDCenterName[] = ['Sacral', 'SolarPlexus', 'Heart', 'Root'];
  const hasMotorToThroat = hasThroat && definedChannels.some(channelId => {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return false;
    
    const gate1Center = GATE_TO_CENTER[channel.gate1];
    const gate2Center = GATE_TO_CENTER[channel.gate2];
    
    return (gate1Center === 'Throat' && motorCenters.includes(gate2Center)) ||
           (gate2Center === 'Throat' && motorCenters.includes(gate1Center));
  });
  
  // Check for sacral to throat connection specifically
  const hasSacralToThroat = hasSacral && hasThroat && definedChannels.some(channelId => {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (!channel) return false;
    
    const gate1Center = GATE_TO_CENTER[channel.gate1];
    const gate2Center = GATE_TO_CENTER[channel.gate2];
    
    return (gate1Center === 'Throat' && gate2Center === 'Sacral') ||
           (gate2Center === 'Throat' && gate1Center === 'Sacral');
  });
  
  // Reflector: No defined centers
  if (definedCenters.length === 0) {
    return 'Reflector';
  }
  
  // Manifestor: Motor to Throat but NO Sacral defined
  if (!hasSacral && hasMotorToThroat) {
    return 'Manifestor';
  }
  
  // Manifesting Generator: Sacral defined AND motor to throat
  if (hasSacral && (hasSacralToThroat || hasMotorToThroat)) {
    return 'Manifesting Generator';
  }
  
  // Generator: Sacral defined but no motor to throat
  if (hasSacral) {
    return 'Generator';
  }
  
  // Projector: No Sacral, no motor to throat
  return 'Projector';
}

// Determine Authority based on defined centers and type
export function determineAuthority(definedCenters: HDCenterName[], type: HDType): HDAuthority {
  // Reflector always has Lunar authority
  if (type === 'Reflector') {
    return 'Lunar';
  }
  
  // Emotional authority (Solar Plexus defined) takes precedence
  if (definedCenters.includes('SolarPlexus')) {
    return 'Emotional';
  }
  
  // Sacral authority (for Generators/MGs without emotional)
  if (definedCenters.includes('Sacral')) {
    return 'Sacral';
  }
  
  // Splenic authority
  if (definedCenters.includes('Spleen')) {
    return 'Splenic';
  }
  
  // Ego authority (for Manifestors/Projectors)
  if (definedCenters.includes('Heart')) {
    // Check if connected to Throat or G center for the distinction
    // Simplified: just return Ego Manifested for Manifestors, Ego Projected for Projectors
    if (type === 'Manifestor') {
      return 'Ego Manifested';
    }
    return 'Ego Projected';
  }
  
  // Self-Projected (G to Throat connection without other authorities)
  if (definedCenters.includes('G')) {
    return 'Self-Projected';
  }
  
  // Mental/None Authority (Projector with only Head/Ajna/Throat defined)
  return 'Mental';
}

// Determine Strategy based on Type
export function determineStrategy(type: HDType): HDStrategy {
  switch (type) {
    case 'Generator':
      return 'Wait to Respond';
    case 'Manifesting Generator':
      return 'Wait to Respond, then Inform';
    case 'Projector':
      return 'Wait for the Invitation';
    case 'Manifestor':
      return 'Inform before Acting';
    case 'Reflector':
      return 'Wait 29 Days';
  }
}

// Calculate Profile from Sun/Earth lines
export function calculateProfile(
  personalitySunLine: number,
  designSunLine: number
): HDProfile {
  return `${personalitySunLine}/${designSunLine}` as HDProfile;
}

// Calculate defined channels from gate activations
export function calculateDefinedChannels(activatedGates: Set<number>): string[] {
  const definedChannels: string[] = [];
  
  for (const channel of CHANNELS) {
    if (activatedGates.has(channel.gate1) && activatedGates.has(channel.gate2)) {
      definedChannels.push(channel.id);
    }
  }
  
  return definedChannels;
}

// Calculate defined centers from defined channels
export function calculateDefinedCenters(definedChannels: string[]): HDCenterName[] {
  const definedCenters = new Set<HDCenterName>();
  
  for (const channelId of definedChannels) {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (channel) {
      definedCenters.add(GATE_TO_CENTER[channel.gate1]);
      definedCenters.add(GATE_TO_CENTER[channel.gate2]);
    }
  }
  
  return Array.from(definedCenters);
}

// Calculate Definition Type
export function calculateDefinitionType(definedCenters: HDCenterName[], definedChannels: string[]): HDDefinitionType {
  if (definedCenters.length === 0) {
    return 'None';
  }
  
  // Build adjacency graph of defined centers
  const connections = new Map<HDCenterName, Set<HDCenterName>>();
  for (const center of definedCenters) {
    connections.set(center, new Set());
  }
  
  for (const channelId of definedChannels) {
    const channel = CHANNELS.find(c => c.id === channelId);
    if (channel) {
      const center1 = GATE_TO_CENTER[channel.gate1];
      const center2 = GATE_TO_CENTER[channel.gate2];
      connections.get(center1)?.add(center2);
      connections.get(center2)?.add(center1);
    }
  }
  
  // Count connected components using BFS
  const visited = new Set<HDCenterName>();
  let components = 0;
  
  for (const center of definedCenters) {
    if (!visited.has(center)) {
      components++;
      const queue: HDCenterName[] = [center];
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);
        const neighbors = connections.get(current);
        if (neighbors) {
          for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
              queue.push(neighbor);
            }
          }
        }
      }
    }
  }
  
  switch (components) {
    case 1:
      return 'Single';
    case 2:
      return 'Split';
    case 3:
      return 'Triple Split';
    case 4:
    default:
      return 'Quadruple Split';
  }
}

// Calculate Incarnation Cross
export function calculateIncarnationCross(
  personalityActivations: HDPlanetaryActivation[],
  designActivations: HDPlanetaryActivation[],
  profile: HDProfile
): HDIncarnationCross {
  const pSun = personalityActivations.find(a => a.planet === 'Sun');
  const pEarth = personalityActivations.find(a => a.planet === 'Earth');
  const dSun = designActivations.find(a => a.planet === 'Sun');
  const dEarth = designActivations.find(a => a.planet === 'Earth');
  
  // Determine cross type based on profile
  const [consciousLine] = profile.split('/').map(Number);
  let crossType: 'Right Angle' | 'Left Angle' | 'Juxtaposition';
  
  if (consciousLine <= 3) {
    crossType = 'Right Angle';
  } else if (consciousLine === 4) {
    // 4/1 and 4/6 are typically Juxtaposition
    crossType = 'Juxtaposition';
  } else {
    crossType = 'Left Angle';
  }
  
  // Determine quarter based on conscious Sun gate
  const sunGate = pSun?.gate || 1;
  let quarter: 'Initiation' | 'Civilization' | 'Duality' | 'Mutation';
  
  // Quarters are defined by gate ranges in the I-Ching wheel
  // Quarter of Initiation: Gates 13-24 area
  // Quarter of Civilization: Gates 2-33 area
  // Quarter of Duality: Gates 7-44 area
  // Quarter of Mutation: Gates 1-19 area
  // This is simplified - actual quarter determination is more complex
  if ([13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24].includes(sunGate)) {
    quarter = 'Initiation';
  } else if ([2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33].includes(sunGate)) {
    quarter = 'Civilization';
  } else if ([7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44].includes(sunGate)) {
    quarter = 'Duality';
  } else {
    quarter = 'Mutation';
  }
  
  return {
    name: `Cross of ${getCrossName(pSun?.gate || 1)}`, // Simplified naming
    type: crossType,
    gates: {
      consciousSun: pSun?.gate || 1,
      consciousEarth: pEarth?.gate || 2,
      unconsciousSun: dSun?.gate || 1,
      unconsciousEarth: dEarth?.gate || 2,
    },
    quarter,
  };
}

// Helper to get cross name (simplified - would need full database)
function getCrossName(sunGate: number): string {
  const crossNames: Record<number, string> = {
    1: 'the Sphinx',
    2: 'the Sphinx',
    7: 'the Sphinx',
    13: 'the Sphinx',
    3: 'Laws',
    50: 'Laws',
    60: 'Laws',
    27: 'Laws',
    4: 'Explanation',
    49: 'Explanation',
    43: 'Explanation',
    23: 'Explanation',
    5: 'Consciousness',
    35: 'Consciousness',
    6: 'Eden',
    36: 'Eden',
    8: 'Contagion',
    14: 'Contagion',
    9: 'Planning',
    16: 'Planning',
    10: 'the Vessel of Love',
    15: 'the Vessel of Love',
    11: 'Education',
    12: 'Education',
    // ... more would be added
  };
  
  return crossNames[sunGate] || `Gate ${sunGate}`;
}

// Main calculation function
export function calculateHumanDesignChart(
  name: string,
  birthDate: string,
  birthTime: string,
  birthLocation: string,
  timezone: string,
  timezoneOffset: number
): HumanDesignChart {
  // Parse birth date and time
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hours, minutes] = birthTime.split(':').map(Number);
  
  // Create UTC date from local time
  const localDate = new Date(year, month - 1, day, hours, minutes);
  const utcDate = new Date(localDate.getTime() - timezoneOffset * 60 * 60 * 1000);
  
  // Calculate Design date (88° before birth)
  const designDate = calculateDesignDate(utcDate);
  
  // Get activations for both dates
  const personalityActivations = calculateActivations(utcDate, true);
  const designActivations = calculateActivations(designDate, false);
  
  // Combine all activated gates
  const allGateActivations: HDGateActivation[] = [];
  const activatedGatesSet = new Set<number>();
  
  for (const activation of [...personalityActivations, ...designActivations]) {
    activatedGatesSet.add(activation.gate);
    allGateActivations.push({
      gate: activation.gate,
      line: activation.line,
      planet: activation.planet,
      isConscious: activation.isConscious,
    });
  }
  
  // Calculate channels and centers
  const definedChannels = calculateDefinedChannels(activatedGatesSet);
  const definedCenters = calculateDefinedCenters(definedChannels);
  const allCenters: HDCenterName[] = [
    'Head', 'Ajna', 'Throat', 'G', 'Heart', 'Sacral', 'SolarPlexus', 'Spleen', 'Root'
  ];
  const undefinedCenters = allCenters.filter(c => !definedCenters.includes(c));
  
  // Determine type, authority, strategy
  const type = determineType(definedCenters, definedChannels);
  const authority = determineAuthority(definedCenters, type);
  const strategy = determineStrategy(type);
  
  // Calculate profile from Sun lines
  const personalitySun = personalityActivations.find(a => a.planet === 'Sun');
  const designSun = designActivations.find(a => a.planet === 'Sun');
  const profile = calculateProfile(
    personalitySun?.line || 1,
    designSun?.line || 1
  );
  
  // Calculate definition type
  const definitionType = calculateDefinitionType(definedCenters, definedChannels);
  
  // Calculate incarnation cross
  const incarnationCross = calculateIncarnationCross(
    personalityActivations,
    designActivations,
    profile
  );
  
  const now = new Date().toISOString();
  
  return {
    id: Date.now().toString(),
    name,
    birthDate,
    birthTime,
    birthLocation,
    timezone,
    timezoneOffset,
    personalityDateTime: utcDate,
    designDateTime: designDate,
    type,
    strategy,
    authority,
    profile,
    definitionType,
    incarnationCross,
    personalityActivations,
    designActivations,
    activatedGates: allGateActivations,
    definedCenters,
    undefinedCenters,
    definedChannels,
    createdAt: now,
    updatedAt: now,
  };
}
