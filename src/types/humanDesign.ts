// Human Design Chart Type Definitions

export interface HDPlanetaryActivation {
  planet: string;
  gate: number;
  line: number;
  color?: number;
  tone?: number;
  base?: number;
  longitude: number; // Exact zodiacal position in degrees
  isConscious: boolean; // true = Personality (birth), false = Design (88° before)
}

export interface HDCenter {
  name: HDCenterName;
  defined: boolean;
  gates: number[]; // Gates that belong to this center
  activatedGates: number[]; // Gates that are activated in this chart
}

export type HDCenterName = 
  | 'Head'
  | 'Ajna'
  | 'Throat'
  | 'G'
  | 'Heart'
  | 'Sacral'
  | 'SolarPlexus'
  | 'Spleen'
  | 'Root';

export interface HDChannel {
  id: string; // e.g., "1-8"
  gate1: number;
  gate2: number;
  name: string;
  defined: boolean;
  circuit: HDCircuit;
  type: 'Generated' | 'Projected' | 'Manifested' | 'Format';
}

export type HDCircuit = 
  | 'Individual-Knowing'
  | 'Individual-Centering'
  | 'Tribal-Ego'
  | 'Tribal-Defense'
  | 'Collective-Logic'
  | 'Collective-Sensing'
  | 'Integration';

export interface HDGateActivation {
  gate: number;
  line: number;
  planet: string;
  isConscious: boolean;
  color?: number;
  tone?: number;
}

export type HDType = 'Generator' | 'Manifesting Generator' | 'Projector' | 'Manifestor' | 'Reflector';

export type HDAuthority = 
  | 'Emotional'
  | 'Sacral'
  | 'Splenic'
  | 'Ego Manifested'
  | 'Ego Projected'
  | 'Self-Projected'
  | 'Mental'
  | 'Lunar';

export type HDStrategy = 
  | 'Wait to Respond'
  | 'Wait to Respond, then Inform'
  | 'Wait for the Invitation'
  | 'Inform before Acting'
  | 'Wait 29 Days';

export type HDProfile = 
  | '1/3' | '1/4'
  | '2/4' | '2/5'
  | '3/5' | '3/6'
  | '4/6' | '4/1'
  | '5/1' | '5/2'
  | '6/2' | '6/3';

export type HDDefinitionType = 
  | 'Single'
  | 'Split'
  | 'Triple Split'
  | 'Quadruple Split'
  | 'None';

export interface HDIncarnationCross {
  name: string;
  type: 'Right Angle' | 'Left Angle' | 'Juxtaposition';
  gates: {
    consciousSun: number;
    consciousEarth: number;
    unconsciousSun: number;
    unconsciousEarth: number;
  };
  quarter: 'Initiation' | 'Civilization' | 'Duality' | 'Mutation';
}

export interface HDVariable {
  arrow: 'Left' | 'Right';
  color: number;
  tone: number;
  base: number;
}

export interface HDVariables {
  determination: HDVariable; // Top Right - How to Eat
  environment: HDVariable; // Top Left - Where You Thrive
  perspective: HDVariable; // Bottom Right - How You Take In Information
  motivation: HDVariable; // Bottom Left - What Drives You
}

export interface HumanDesignChart {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthLocation: string;
  timezone: string;
  timezoneOffset: number; // hours from UTC
  
  // Calculation timestamps
  personalityDateTime: Date; // Exact birth moment
  designDateTime: Date; // 88° before birth (unconscious)
  
  // Core Mechanics
  type: HDType;
  strategy: HDStrategy;
  authority: HDAuthority;
  profile: HDProfile;
  definitionType: HDDefinitionType;
  
  // Incarnation Cross
  incarnationCross: HDIncarnationCross;
  
  // Activations
  personalityActivations: HDPlanetaryActivation[]; // Conscious (Black)
  designActivations: HDPlanetaryActivation[]; // Unconscious (Red)
  
  // Computed from activations
  activatedGates: HDGateActivation[];
  definedCenters: HDCenterName[];
  undefinedCenters: HDCenterName[];
  definedChannels: string[]; // Channel IDs like "1-8"
  
  // Variables (Advanced - for PHS)
  variables?: HDVariables;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  chartImageBase64?: string; // For future image upload feature
}

// Gate to Center mapping
export const GATE_TO_CENTER: Record<number, HDCenterName> = {
  // Head Center
  64: 'Head', 61: 'Head', 63: 'Head',
  // Ajna Center
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  // Throat Center
  62: 'Throat', 23: 'Throat', 56: 'Throat', 35: 'Throat', 12: 'Throat',
  45: 'Throat', 33: 'Throat', 8: 'Throat', 31: 'Throat', 20: 'Throat', 16: 'Throat',
  // G Center
  1: 'G', 13: 'G', 25: 'G', 46: 'G', 2: 'G', 15: 'G', 10: 'G', 7: 'G',
  // Heart/Ego Center
  51: 'Heart', 21: 'Heart', 40: 'Heart', 26: 'Heart',
  // Sacral Center
  5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral', 9: 'Sacral',
  3: 'Sacral', 42: 'Sacral', 27: 'Sacral', 34: 'Sacral',
  // Solar Plexus Center
  6: 'SolarPlexus', 37: 'SolarPlexus', 22: 'SolarPlexus', 36: 'SolarPlexus',
  30: 'SolarPlexus', 55: 'SolarPlexus', 49: 'SolarPlexus',
  // Spleen Center
  48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen',
  32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
  // Root Center
  53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root',
  41: 'Root', 38: 'Root', 54: 'Root', 58: 'Root',
};

// All 36 Channels with their gates and properties
export const CHANNELS: Array<{
  id: string;
  gate1: number;
  gate2: number;
  name: string;
  circuit: HDCircuit;
  type: 'Generated' | 'Projected' | 'Manifested' | 'Format';
}> = [
  // Individual Knowing Circuit
  { id: '61-24', gate1: 61, gate2: 24, name: 'Channel of Awareness', circuit: 'Individual-Knowing', type: 'Projected' },
  { id: '43-23', gate1: 43, gate2: 23, name: 'Channel of Structuring', circuit: 'Individual-Knowing', type: 'Projected' },
  { id: '38-28', gate1: 38, gate2: 28, name: 'Channel of Struggle', circuit: 'Individual-Knowing', type: 'Projected' },
  { id: '57-20', gate1: 57, gate2: 20, name: 'Channel of the Brainwave', circuit: 'Individual-Knowing', type: 'Projected' },
  { id: '39-55', gate1: 39, gate2: 55, name: 'Channel of Emoting', circuit: 'Individual-Knowing', type: 'Projected' },
  { id: '12-22', gate1: 12, gate2: 22, name: 'Channel of Openness', circuit: 'Individual-Knowing', type: 'Manifested' },
  
  // Individual Centering Circuit
  { id: '1-8', gate1: 1, gate2: 8, name: 'Channel of Inspiration', circuit: 'Individual-Centering', type: 'Projected' },
  { id: '2-14', gate1: 2, gate2: 14, name: 'Channel of the Beat', circuit: 'Individual-Centering', type: 'Generated' },
  { id: '3-60', gate1: 3, gate2: 60, name: 'Channel of Mutation', circuit: 'Individual-Centering', type: 'Generated' },
  { id: '51-25', gate1: 51, gate2: 25, name: 'Channel of Initiation', circuit: 'Individual-Centering', type: 'Projected' },
  { id: '10-20', gate1: 10, gate2: 20, name: 'Channel of Awakening', circuit: 'Integration', type: 'Projected' },
  
  // Integration Circuit (connects Individual circuits)
  { id: '34-57', gate1: 34, gate2: 57, name: 'Channel of Power', circuit: 'Integration', type: 'Generated' },
  { id: '34-20', gate1: 34, gate2: 20, name: 'Channel of Charisma', circuit: 'Integration', type: 'Manifested' },
  { id: '10-57', gate1: 10, gate2: 57, name: 'Channel of Perfected Form', circuit: 'Integration', type: 'Projected' },
  
  // Tribal Ego Circuit
  { id: '21-45', gate1: 21, gate2: 45, name: 'Channel of Money', circuit: 'Tribal-Ego', type: 'Manifested' },
  { id: '26-44', gate1: 26, gate2: 44, name: 'Channel of Surrender', circuit: 'Tribal-Ego', type: 'Projected' },
  { id: '40-37', gate1: 40, gate2: 37, name: 'Channel of Community', circuit: 'Tribal-Ego', type: 'Projected' },
  { id: '51-25', gate1: 51, gate2: 25, name: 'Channel of Initiation', circuit: 'Tribal-Ego', type: 'Projected' },
  
  // Tribal Defense Circuit
  { id: '6-59', gate1: 6, gate2: 59, name: 'Channel of Mating', circuit: 'Tribal-Defense', type: 'Generated' },
  { id: '27-50', gate1: 27, gate2: 50, name: 'Channel of Preservation', circuit: 'Tribal-Defense', type: 'Generated' },
  { id: '32-54', gate1: 32, gate2: 54, name: 'Channel of Transformation', circuit: 'Tribal-Defense', type: 'Projected' },
  { id: '19-49', gate1: 19, gate2: 49, name: 'Channel of Synthesis', circuit: 'Tribal-Defense', type: 'Projected' },
  
  // Collective Logic Circuit
  { id: '63-4', gate1: 63, gate2: 4, name: 'Channel of Logic', circuit: 'Collective-Logic', type: 'Projected' },
  { id: '17-62', gate1: 17, gate2: 62, name: 'Channel of Acceptance', circuit: 'Collective-Logic', type: 'Projected' },
  { id: '48-16', gate1: 48, gate2: 16, name: 'Channel of the Wavelength', circuit: 'Collective-Logic', type: 'Projected' },
  { id: '5-15', gate1: 5, gate2: 15, name: 'Channel of Rhythm', circuit: 'Collective-Logic', type: 'Generated' },
  { id: '7-31', gate1: 7, gate2: 31, name: 'Channel of the Alpha', circuit: 'Collective-Logic', type: 'Projected' },
  { id: '9-52', gate1: 9, gate2: 52, name: 'Channel of Concentration', circuit: 'Collective-Logic', type: 'Generated' },
  { id: '18-58', gate1: 18, gate2: 58, name: 'Channel of Judgment', circuit: 'Collective-Logic', type: 'Projected' },
  
  // Collective Sensing/Abstract Circuit
  { id: '64-47', gate1: 64, gate2: 47, name: 'Channel of Abstraction', circuit: 'Collective-Sensing', type: 'Projected' },
  { id: '11-56', gate1: 11, gate2: 56, name: 'Channel of Curiosity', circuit: 'Collective-Sensing', type: 'Projected' },
  { id: '35-36', gate1: 35, gate2: 36, name: 'Channel of Transitoriness', circuit: 'Collective-Sensing', type: 'Manifested' },
  { id: '30-41', gate1: 30, gate2: 41, name: 'Channel of Recognition', circuit: 'Collective-Sensing', type: 'Projected' },
  { id: '13-33', gate1: 13, gate2: 33, name: 'Channel of the Prodigal', circuit: 'Collective-Sensing', type: 'Projected' },
  { id: '29-46', gate1: 29, gate2: 46, name: 'Channel of Discovery', circuit: 'Collective-Sensing', type: 'Generated' },
  { id: '42-53', gate1: 42, gate2: 53, name: 'Channel of Maturation', circuit: 'Collective-Sensing', type: 'Generated' },
];

// Center connections for determining definition
export const CENTER_CHANNELS: Record<HDCenterName, string[]> = {
  Head: ['64-47', '61-24', '63-4'],
  Ajna: ['64-47', '61-24', '63-4', '47-64', '24-61', '4-63', '17-62', '43-23', '11-56'],
  Throat: ['62-17', '23-43', '56-11', '35-36', '12-22', '45-21', '33-13', '8-1', '31-7', '20-57', '20-10', '20-34', '16-48'],
  G: ['1-8', '13-33', '25-51', '46-29', '2-14', '15-5', '10-20', '10-57', '7-31'],
  Heart: ['51-25', '21-45', '40-37', '26-44'],
  Sacral: ['5-15', '14-2', '29-46', '59-6', '9-52', '3-60', '42-53', '27-50', '34-57', '34-20'],
  SolarPlexus: ['6-59', '37-40', '22-12', '36-35', '30-41', '55-39', '49-19'],
  Spleen: ['48-16', '57-20', '57-34', '57-10', '44-26', '50-27', '32-54', '28-38', '18-58'],
  Root: ['53-42', '60-3', '52-9', '19-49', '39-55', '41-30', '38-28', '54-32', '58-18'],
};
