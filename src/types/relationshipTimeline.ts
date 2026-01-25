export interface RelationshipTimelineConfig {
  person1Name: string;
  person2Name: string;
  person1Chart: any; // Your existing chart type
  person2Chart: any;
  relationshipStartDate: Date;
  relationshipEndDate?: Date; // Optional - for ended relationships
  synastryAspects: any[]; // Your existing synastry aspects
}

export interface MonthlyTransitEvent {
  date: Date;
  transitingPlanet: string;
  transitAspect: string;
  natalPoint: string; // Which synastry point it's hitting
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
  month: string; // "January 2024"
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
