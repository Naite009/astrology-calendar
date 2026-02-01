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
// Uses graph traversal to find if Sacral is connected to Throat through any path
export function determineType(definedCenters: HDCenterName[], definedChannels: string[]): HDType {
  const hasSacral = definedCenters.includes('Sacral');
  const hasThroat = definedCenters.includes('Throat');
  const hasSpleen = definedCenters.includes('Spleen');
  
  console.log('[HD Type Detection] Starting...');
  console.log('[HD Type Detection] Defined Centers:', definedCenters);
  console.log('[HD Type Detection] Defined Channels:', definedChannels);
  console.log('[HD Type Detection] Has Sacral:', hasSacral, '| Has Throat:', hasThroat, '| Has Spleen:', hasSpleen);
  
  // Reflector: No defined centers
  if (definedCenters.length === 0) {
    console.log('[HD Type Detection] Result: Reflector (no defined centers)');
    return 'Reflector';
  }
  
  // Normalize channel IDs for lookup (handle both "34-57" and "57-34" formats)
  const hasChannel = (gate1: number, gate2: number): boolean => {
    const result = definedChannels.includes(`${gate1}-${gate2}`) || 
           definedChannels.includes(`${gate2}-${gate1}`);
    if (result) {
      console.log(`[HD Type Detection] Found channel: ${gate1}-${gate2}`);
    }
    return result;
  };
  
  // Check for specific Sacral-to-Throat pathways
  let hasSacralToThroat = false;
  
  if (hasSacral && hasThroat) {
    // Direct Sacral to Throat: Channel 34-20 (Channel of Charisma)
    const hasDirect34_20 = hasChannel(34, 20);
    console.log('[HD Type Detection] Direct 34-20 (Charisma):', hasDirect34_20);
    if (hasDirect34_20) {
      hasSacralToThroat = true;
    }
    
    // Sacral-Spleen-Throat pathway
    if (hasSpleen) {
      // Check Sacral to Spleen connections
      const hasSacralToSpleen = hasChannel(34, 57); // Channel of Power
      console.log('[HD Type Detection] Sacral-Spleen (34-57):', hasSacralToSpleen);
      
      // Check Spleen to Throat connections
      const has48_16 = hasChannel(48, 16); // Channel of the Wavelength
      const has57_20 = hasChannel(57, 20); // Channel of the Brainwave
      const has44_26 = hasChannel(44, 26); // Channel of Surrender
      console.log('[HD Type Detection] Spleen-Throat: 48-16:', has48_16, '| 57-20:', has57_20, '| 44-26:', has44_26);
      
      const hasSpleenToThroat = has48_16 || has57_20 || has44_26;
      
      if (hasSacralToSpleen && hasSpleenToThroat) {
        console.log('[HD Type Detection] ✓ Sacral-Spleen-Throat pathway FOUND!');
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
      console.log('[HD Type Detection] Sacral-G connection:', hasSacralToG);
      
      // G to Throat connections
      const hasGToThroat = hasChannel(1, 8) ||   // Channel of Inspiration
                           hasChannel(7, 31) ||  // Channel of the Alpha
                           hasChannel(13, 33) || // Channel of the Prodigal
                           hasChannel(10, 20);   // Channel of Awakening
      console.log('[HD Type Detection] G-Throat connection:', hasGToThroat);
      
      if (hasSacralToG && hasGToThroat) {
        console.log('[HD Type Detection] ✓ Sacral-G-Throat pathway FOUND!');
        hasSacralToThroat = true;
      }
    }
    
    // If specific checks didn't find it, fall back to graph traversal
    if (!hasSacralToThroat) {
      console.log('[HD Type Detection] No direct pathway found, using BFS graph traversal...');
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
      
      console.log('[HD Type Detection] Center connections map:', Array.from(connections.entries()).map(([k, v]) => `${k}: [${Array.from(v).join(', ')}]`));
      
      // BFS to check if a path exists from Sacral to Throat
      const visited = new Set<HDCenterName>();
      const queue: HDCenterName[] = ['Sacral'];
      
      while (queue.length > 0) {
        const current = queue.shift()!;
        if (current === 'Throat') {
          console.log('[HD Type Detection] ✓ BFS found path to Throat!');
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
      
      if (!hasSacralToThroat) {
        console.log('[HD Type Detection] BFS did NOT find path from Sacral to Throat');
      }
    }
  }
  
  // Manifesting Generator: Sacral defined AND connected to Throat (directly or indirectly)
  if (hasSacral && hasSacralToThroat) {
    console.log('[HD Type Detection] ★ RESULT: Manifesting Generator');
    return 'Manifesting Generator';
  }
  
  // Generator: Sacral defined but NOT connected to Throat
  if (hasSacral && !hasSacralToThroat) {
    console.log('[HD Type Detection] ★ RESULT: Generator (Sacral defined, no throat connection)');
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
