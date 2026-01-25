export type RelationshipContext = 'romance' | 'friendship' | 'business' | 'creative' | 'family';

export interface DirectionalAspectInterpretation {
  aspectKey: string; // e.g., "venus_conjunct_saturn"
  personARole: string; // e.g., "venus_person"
  personBRole: string; // e.g., "saturn_person"
  
  personAExperience: {
    romance: string;
    friendship: string;
    business: string;
    creative: string;
    family: string;
  };
  
  personBExperience: {
    romance: string;
    friendship: string;
    business: string;
    creative: string;
    family: string;
  };
  
  mutualWork: string;
  intensityLevel: number; // 1-10
  growthPotential: number; // 1-10
  challengeLevel: number; // 1-10
  
  evolutionTimeline: {
    year1_3: string;
    year4_7: string;
    year7_plus: string;
  };
}
