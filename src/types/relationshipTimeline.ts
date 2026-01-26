export interface RelationshipTimelineConfig {
  person1Name: string;
  person2Name: string;
  person1Chart: any;
  person2Chart: any;
  relationshipStartDate: Date;
  relationshipEndDate?: Date;
  synastryAspects: any[];
}

export interface TransitEvent {
  date: Date;
  transitPlanet: string;
  transitLongitude: number;
  aspectType: string;
  synastryPoint: {
    person1Planet: string;
    person1Longitude: number;
    person2Planet: string;
    person2Longitude: number;
    aspectType: string;
    orb: number;
  };
  whoFeelsItMore: 'person1' | 'person2' | 'both';
  person1Experience: string;
  person2Experience: string;
  interpretation: string;
  intensity: number;
  isKarmic: boolean;
}

export interface MonthlyTimeline {
  month: string;
  date: Date;
  transits: TransitEvent[];
  summary: string;
  person1Summary: string;
  person2Summary: string;
  advice: string;
}

export interface KarmicAnalysis {
  isKarmic: boolean;
  karmicIndicators: string[];
  description: string;
}

// Legacy types for backward compatibility
export interface MonthlyTransitEvent {
  date: Date;
  transitingPlanet: string;
  transitAspect: string;
  natalPoint: string;
  orb: number;
  personAffected: 'person1' | 'person2' | 'both';
  interpretation: string;
  intensity: 'low' | 'medium' | 'high' | 'critical';
  eventType: 'opportunity' | 'challenge' | 'transformation' | 'crisis' | 'breakthrough';
}

export interface RelationshipPhase {
  startDate: Date;
  endDate: Date;
  phaseName: string;
  description: string;
  majorTransits: MonthlyTransitEvent[];
  overallEnergy: string;
  person1Experience: string;
  person2Experience: string;
  advice: string;
}

export interface MonthlySnapshot {
  month: string;
  dateRange: { start: Date; end: Date };
  transits: MonthlyTransitEvent[];
  phase: RelationshipPhase;
  emotionalWeather: 'calm' | 'tense' | 'passionate' | 'transformative' | 'difficult';
  person1Feelings: string;
  person2Feelings: string;
  keyEvents: string[];
  bestDays: Date[];
  worstDays: Date[];
}
