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
  HDVariables,
  HDVariable,
  GATE_TO_CENTER,
  CHANNELS,
} from '@/types/humanDesign';
import { 
  determineIncarnationCross as lookupIncarnationCross,
  incarnationCrosses,
  determineQuarter 
} from '@/data/incarnationCrosses';

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
  
  // Calculate North Node using Meeus polynomial (Jean Meeus, Astronomical Algorithms)
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
  const northNode = ((omega % 360) + 360) % 360;
  
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
// Uses graph traversal to find if Sacral is connected to Throat through any path
export function determineType(definedCenters: HDCenterName[], definedChannels: string[]): HDType {
  const hasSacral = definedCenters.includes('Sacral');
  const hasThroat = definedCenters.includes('Throat');
  const hasSpleen = definedCenters.includes('Spleen');
  
  // Reflector: No defined centers
  if (definedCenters.length === 0) {
    return 'Reflector';
  }
  
  // Normalize channel IDs for lookup (handle both "34-57" and "57-34" formats)
  const hasChannel = (gate1: number, gate2: number): boolean => {
    return definedChannels.includes(`${gate1}-${gate2}`) ||
           definedChannels.includes(`${gate2}-${gate1}`);
  };
  
  // Check for specific Sacral-to-Throat pathways
  let hasSacralToThroat = false;
  
  if (hasSacral && hasThroat) {
    // Direct Sacral to Throat: Channel 34-20 (Channel of Charisma)
    const hasDirect34_20 = hasChannel(34, 20);
    if (hasDirect34_20) {
      hasSacralToThroat = true;
    }
    
    // Sacral-Spleen-Throat pathway
    if (hasSpleen) {
      // Check Sacral to Spleen connections
      const hasSacralToSpleen = hasChannel(34, 57); // Channel of Power

      // Check Spleen to Throat connections
      const has48_16 = hasChannel(48, 16); // Channel of the Wavelength
      const has57_20 = hasChannel(57, 20); // Channel of the Brainwave
      const has44_26 = hasChannel(44, 26); // Channel of Surrender

      // Explicitly support the Sacral→Spleen→Throat path the user called out:
      // 34-57 AND 48-16 (Sacral→Spleen and Spleen→Throat)
      if (hasSacralToSpleen && has48_16) {
        hasSacralToThroat = true;
      }

      // Keep other valid Spleen→Throat variants too (e.g., 34-57 + 57-20)
      if (!hasSacralToThroat && hasSacralToSpleen && (has57_20 || has44_26)) {
        hasSacralToThroat = true;
      }
    }
    
    // Sacral-G-Throat pathway
    const hasG = definedCenters.includes('G');
    if (hasG) {
      // Sacral to G connections
      const hasSacralToG = hasChannel(5, 15) ||  // Channel of Rhythm
                           hasChannel(14, 2) ||  // Channel of the Beat
                           hasChannel(29, 46) || // Channel of Discovery
                           hasChannel(59, 6);    // Channel of Mating (Sacral to Solar Plexus, but 6 connects)

      // G to Throat connections
      const hasGToThroat = hasChannel(1, 8) ||   // Channel of Inspiration
                           hasChannel(7, 31) ||  // Channel of the Alpha
                           hasChannel(13, 33) || // Channel of the Prodigal
                           hasChannel(10, 20);   // Channel of Awakening

      if (hasSacralToG && hasGToThroat) {
        hasSacralToThroat = true;
      }
    }
    
    // If specific checks didn't find it, fall back to graph traversal
    if (!hasSacralToThroat) {
      // Build a graph of center connections from defined channels
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
      
      // BFS to check if a path exists from Sacral to Throat
      const visited = new Set<HDCenterName>();
      const queue: HDCenterName[] = ['Sacral'];
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === 'Throat') {
          hasSacralToThroat = true;
          break;
        }
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

  // Manifesting Generator: Sacral defined AND connected to Throat (directly or indirectly)
  if (hasSacral && hasSacralToThroat) {
    return 'Manifesting Generator';
  }

  // Generator: Sacral defined but NOT connected to Throat
  if (hasSacral && !hasSacralToThroat) {
    return 'Generator';
  }
  
  // Check for non-Sacral motor to Throat connections for Manifestor
  const nonSacralMotors: HDCenterName[] = ['SolarPlexus', 'Heart', 'Root'];
  let hasNonSacralMotorToThroat = false;
  
  if (hasThroat) {
    // Build graph for motor-to-throat check
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
    
    // Check each non-sacral motor
    for (const motor of nonSacralMotors) {
      if (!definedCenters.includes(motor)) continue;
      
      const visited = new Set<HDCenterName>();
      const queue: HDCenterName[] = [motor];
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === 'Throat') {
          hasNonSacralMotorToThroat = true;
          break;
        }
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
      if (hasNonSacralMotorToThroat) break;
    }
  }
  
  // Manifestor: Non-Sacral Motor to Throat (no Sacral defined)
  if (!hasSacral && hasNonSacralMotorToThroat) {
    return 'Manifestor';
  }
  
  // Projector: No Sacral, no motor to throat
  return 'Projector';
}

// Determine Authority based on defined centers, type, and channel connections
export function determineAuthority(
  definedCenters: HDCenterName[], 
  type: HDType,
  definedChannels?: string[]
): HDAuthority {
  // 1. Reflector: All centers undefined → Lunar Authority
  if (type === 'Reflector' || definedCenters.length === 0) {
    return 'Lunar';
  }

  // 2. Emotional Authority: Solar Plexus defined (takes precedence over everything)
  if (definedCenters.includes('SolarPlexus')) {
    return 'Emotional';
  }

  // 3. Sacral Authority: Sacral defined (only for Generators/MGs without Emotional)
  if (definedCenters.includes('Sacral')) {
    return 'Sacral';
  }

  // 4. Splenic Authority: Spleen defined (no Emotional, no Sacral)
  if (definedCenters.includes('Spleen')) {
    return 'Splenic';
  }
  
  // 5. Ego Authority: Heart/Will defined and connected to Throat or G
  if (definedCenters.includes('Heart')) {
    // Check if Heart is connected to Throat or G
    const hasHeartToThroat = definedChannels?.some(ch => 
      ch === '21-45' || ch === '45-21' || // Channel of Money
      ch === '25-51' || ch === '51-25'    // Channel of Initiation (Heart to G)
    );
    const hasHeartToG = definedChannels?.some(ch => 
      ch === '25-51' || ch === '51-25' || // Heart gates connect via other paths
      ch === '10-57' || ch === '57-10'    // G center connection through Spleen
    );
    
    if (hasHeartToThroat || definedCenters.includes('Throat')) {
      return 'Ego Manifested';
    }
    if (hasHeartToG || definedCenters.includes('G')) {
      return 'Ego Projected';
    }
    // Default Ego based on type
    return type === 'Manifestor' ? 'Ego Manifested' : 'Ego Projected';
  }
  
  // 6. Self-Projected Authority: G center connected to Throat (Projectors only)
  if (definedCenters.includes('G') && definedCenters.includes('Throat')) {
    // Check if G is actually connected to Throat via channel
    const hasGToThroat = definedChannels?.some(ch => 
      ch === '1-8' || ch === '8-1' ||     // Channel of Inspiration
      ch === '7-31' || ch === '31-7' ||   // Channel of the Alpha
      ch === '13-33' || ch === '33-13' || // Channel of the Prodigal
      ch === '10-20' || ch === '20-10'    // Channel of Awakening
    );
    
    if (hasGToThroat) {
      return 'Self-Projected';
    }
  }

  // 7. Mental/Environmental Authority: No inner authority centers defined
  // Only Head, Ajna, Throat (or no definition below Throat)
  const hasDefinitionBelowThroat = definedCenters.some(c =>
    ['G', 'Heart', 'SolarPlexus', 'Sacral', 'Spleen', 'Root'].includes(c)
  );

  if (!hasDefinitionBelowThroat) {
    return 'Mental';
  }

  // Fallback for edge cases
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
  
  const consciousSun = pSun?.gate || 1;
  const consciousEarth = pEarth?.gate || 2;
  const unconsciousSun = dSun?.gate || 1;
  const unconsciousEarth = dEarth?.gate || 2;
  
  // Cross ANGLE (Right/Left/Juxtaposition) MUST come from the conscious profile line.
  // Even with a database match, we never trust a stored angle label because it can be
  // wrong/incomplete and would create impossible combos (e.g., 6/x saved as Juxtaposition).
  const [consciousLine] = profile.split('/').map(Number);
  const derivedCrossType: 'Right Angle' | 'Left Angle' | 'Juxtaposition' =
    consciousLine <= 3 ? 'Right Angle' : consciousLine === 4 ? 'Juxtaposition' : 'Left Angle';

  // Try to find exact match in database (for the *base name* + theme text)
  const foundCross = lookupIncarnationCross(
    consciousSun, 
    consciousEarth, 
    unconsciousSun, 
    unconsciousEarth,
    derivedCrossType
  );
  
  if (foundCross) {

    // Normalize the name so the prefix always matches the derived cross type
    const baseName = foundCross.name
      .replace(/^(Right Angle|Left Angle|Juxtaposition)\s+/i, '')
      .replace(/^Cross of\s+/i, '')
      .trim();

    const normalizedName = `${derivedCrossType} Cross of ${baseName || `Gate ${consciousSun}`}`;

    return {
      name: normalizedName,
      type: derivedCrossType,
      gates: {
        consciousSun,
        consciousEarth,
        unconsciousSun,
        unconsciousEarth,
      },
      // Quarter is deterministically derived from the Sun gate; keep DB value if present.
      quarter: foundCross.quarter || determineQuarterFromGate(consciousSun),
    };
  }
  
  // No exact match found - generate a descriptive name
  
  // Determine cross type based on profile
  const crossType = derivedCrossType;
  
  // Determine quarter using improved logic
  const quarter = determineQuarterFromGate(consciousSun);
  
  // Generate cross name based on conscious Sun gate
  const gateName = getGateKeyword(consciousSun);
  const crossName = `${crossType} Cross of ${gateName}`;

  return {
    name: crossName,
    type: crossType,
    gates: {
      consciousSun,
      consciousEarth,
      unconsciousSun,
      unconsciousEarth,
    },
    quarter,
  };
}

// Get quarter from gate position on the wheel
function determineQuarterFromGate(sunGate: number): 'Initiation' | 'Civilization' | 'Duality' | 'Mutation' {
  // Quarter of Initiation (Mind): Gates related to awareness and initiating consciousness
  const initiationGates = [13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24];
  // Quarter of Civilization (Form): Gates related to building and structure
  const civilizationGates = [2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33];
  // Quarter of Duality (Bonding): Gates related to relationships
  const dualityGates = [7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44];
  // Quarter of Mutation (Transformation): Remaining gates
  const mutationGates = [1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19];
  
  if (initiationGates.includes(sunGate)) return 'Initiation';
  if (civilizationGates.includes(sunGate)) return 'Civilization';
  if (dualityGates.includes(sunGate)) return 'Duality';
  return 'Mutation';
}

// Get human-readable keyword for a gate
function getGateKeyword(gate: number): string {
  const gateKeywords: Record<number, string> = {
    1: 'Self-Expression',
    2: 'the Receptive',
    3: 'Ordering',
    4: 'Formulization',
    5: 'Fixed Rhythms',
    6: 'Friction',
    7: 'the Role of Self',
    8: 'Contribution',
    9: 'Focus',
    10: 'Behavior of Self',
    11: 'Ideas',
    12: 'Caution',
    13: 'the Listener',
    14: 'Power Skills',
    15: 'Extremes',
    16: 'Skills',
    17: 'Opinions',
    18: 'Correction',
    19: 'Wanting',
    20: 'the Now',
    21: 'the Hunter',
    22: 'Openness',
    23: 'Assimilation',
    24: 'Rationalization',
    25: 'Innocence',
    26: 'the Egoist',
    27: 'Caring',
    28: 'the Game Player',
    29: 'Perseverance',
    30: 'Feelings',
    31: 'Leadership',
    32: 'Continuity',
    33: 'Privacy',
    34: 'Power',
    35: 'Change',
    36: 'Crisis',
    37: 'Friendship',
    38: 'the Fighter',
    39: 'Provocation',
    40: 'Aloneness',
    41: 'Contraction',
    42: 'Growth',
    43: 'Insight',
    44: 'Alertness',
    45: 'the Gatherer',
    46: 'the Determination of Self',
    47: 'Realization',
    48: 'Depth',
    49: 'Principles',
    50: 'Values',
    51: 'Shock',
    52: 'Stillness',
    53: 'Beginnings',
    54: 'Ambition',
    55: 'Spirit',
    56: 'Stimulation',
    57: 'Intuition',
    58: 'Vitality',
    59: 'Sexuality',
    60: 'Limitation',
    61: 'Mystery',
    62: 'Detail',
    63: 'Doubt',
    64: 'Confusion',
  };
  
  return gateKeywords[gate] || `Gate ${gate}`;
}

// Calculate Variables (PHS) from Design activations
// Variables are determined by the color, tone, and base of Design Sun and Nodes
export function calculateVariables(
  designSun: HDPlanetaryActivation | undefined,
  designNorthNode: HDPlanetaryActivation | undefined,
  designSouthNode: HDPlanetaryActivation | undefined
): HDVariables {
  // Calculate color, tone, base from the line position
  // Each line (1-6) has 6 colors, each color has 6 tones, each tone has 5 bases
  const calculateSubLineValues = (activation: HDPlanetaryActivation | undefined): { color: number; tone: number; base: number; arrow: 'Left' | 'Right' } => {
    if (!activation) {
      return { color: 1, tone: 1, base: 1, arrow: 'Right' };
    }
    
    // Get the precise position within the line
    const longitude = activation.longitude;
    const lineSpan = 5.625 / 6; // Each line is 0.9375°
    const colorSpan = lineSpan / 6; // Each color spans 0.15625°
    const toneSpan = colorSpan / 6; // Each tone spans ~0.026°
    
    // Calculate position within gate (0 to 5.625°)
    const wheelStart = 268 + (58 / 60);
    let relativePosition = longitude - wheelStart;
    if (relativePosition < 0) relativePosition += 360;
    const positionInGate = relativePosition % 5.625;
    
    // Calculate position within line
    const positionInLine = positionInGate % lineSpan;
    
    // Calculate color (1-6)
    const color = Math.floor(positionInLine / colorSpan) + 1;
    
    // Calculate position within color for tone
    const positionInColor = positionInLine % colorSpan;
    const tone = Math.floor(positionInColor / toneSpan) + 1;
    
    // Calculate base (1-5)
    const positionInTone = positionInColor % toneSpan;
    const baseSpan = toneSpan / 5;
    const base = Math.floor(positionInTone / baseSpan) + 1;
    
    // Arrow direction: Colors 1-3 = Left, Colors 4-6 = Right
    const arrow: 'Left' | 'Right' = color <= 3 ? 'Left' : 'Right';
    
    return {
      color: Math.min(Math.max(color, 1), 6),
      tone: Math.min(Math.max(tone, 1), 6),
      base: Math.min(Math.max(base, 1), 5),
      arrow
    };
  };
  
  const sunValues = calculateSubLineValues(designSun);
  const northNodeValues = calculateSubLineValues(designNorthNode);
  const southNodeValues = calculateSubLineValues(designSouthNode);
  
  return {
    // Determination (Top Right) - from Design Sun
    determination: {
      arrow: sunValues.arrow,
      color: sunValues.color,
      tone: sunValues.tone,
      base: sunValues.base
    },
    // Environment (Top Left) - from Design Sun (same source, opposite arrow perspective)
    environment: {
      arrow: sunValues.arrow === 'Left' ? 'Right' : 'Left',
      color: sunValues.color,
      tone: sunValues.tone,
      base: sunValues.base
    },
    // Perspective (Bottom Right) - from Design North Node
    perspective: {
      arrow: northNodeValues.arrow,
      color: northNodeValues.color,
      tone: northNodeValues.tone,
      base: northNodeValues.base
    },
    // Motivation (Bottom Left) - from Design South Node
    motivation: {
      arrow: southNodeValues.arrow,
      color: southNodeValues.color,
      tone: southNodeValues.tone,
      base: southNodeValues.base
    }
  };
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
  // Parse birth date and time (these represent a *local clock time* in the selected birth timezone)
  const [year, month, day] = birthDate.split('-').map(Number);
  const [hours, minutes] = birthTime.split(':').map(Number);

  // IMPORTANT: do NOT use `new Date(year, ...)` here.
  // That constructor interprets the parts in the *browser's* timezone, which will shift results
  // for users calculating a chart in a different timezone than their current device.
  //
  // Instead, treat the input as a timezone-naive timestamp and convert to UTC using the
  // precomputed timezone offset (DST-aware) for the *birth location/timezone*.
  //
  // offset is hours from UTC for the birth timezone (e.g., New York in EDT = -4).
  // local = UTC + offset  =>  UTC = local - offset
  const utcMs = Date.UTC(year, month - 1, day, hours, minutes) - timezoneOffset * 60 * 60 * 1000;
  const utcDate = new Date(utcMs);
  
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
  const authority = determineAuthority(definedCenters, type, definedChannels);
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
  
  // Calculate variables (PHS) from Design activations
  const designNorthNode = designActivations.find(a => a.planet === 'NorthNode');
  const designSouthNode = designActivations.find(a => a.planet === 'SouthNode');
  const variables = calculateVariables(designSun, designNorthNode, designSouthNode);
  
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
    variables,
    createdAt: now,
    updatedAt: now,
  };
}
