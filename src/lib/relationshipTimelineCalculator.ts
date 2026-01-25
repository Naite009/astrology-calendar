import * as Astronomy from 'astronomy-engine';
import { RelationshipTimelineConfig, MonthlyTransitEvent, MonthlySnapshot, RelationshipPhase } from '@/types/relationshipTimeline';

export class RelationshipTimelineCalculator {
  private config: RelationshipTimelineConfig;

  constructor(config: RelationshipTimelineConfig) {
    this.config = config;
  }

  /**
   * Generate complete timeline from start to end (or present)
   */
  generateTimeline(): MonthlySnapshot[] {
    const snapshots: MonthlySnapshot[] = [];
    const endDate = this.config.relationshipEndDate || new Date();
    
    let currentDate = new Date(this.config.relationshipStartDate);
    
    while (currentDate <= endDate) {
      const snapshot = this.generateMonthSnapshot(currentDate);
      snapshots.push(snapshot);
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return snapshots;
  }

  /**
   * Generate snapshot for a specific month
   */
  private generateMonthSnapshot(date: Date): MonthlySnapshot {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    // Calculate all transits for this month
    const transits = this.calculateMonthlyTransits(monthStart, monthEnd);
    
    // Determine relationship phase
    const phase = this.determinePhase(monthStart, transits);
    
    // Calculate emotional weather
    const emotionalWeather = this.calculateEmotionalWeather(transits);
    
    // Generate person-specific experiences
    const person1Feelings = this.generatePersonExperience(transits, 'person1');
    const person2Feelings = this.generatePersonExperience(transits, 'person2');
    
    // Identify key events
    const keyEvents = this.identifyKeyEvents(transits);
    
    // Find best and worst days
    const { bestDays, worstDays } = this.identifySignificantDays(monthStart, monthEnd, transits);
    
    return {
      month: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      dateRange: { start: monthStart, end: monthEnd },
      transits,
      phase,
      emotionalWeather,
      person1Feelings,
      person2Feelings,
      keyEvents,
      bestDays,
      worstDays
    };
  }

  /**
   * Calculate all transits to synastry points for a month
   */
  private calculateMonthlyTransits(startDate: Date, endDate: Date): MonthlyTransitEvent[] {
    const transits: MonthlyTransitEvent[] = [];
    const transitingPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    
    // For each synastry aspect, check if transiting planets aspect it
    this.config.synastryAspects.forEach(synastryAspect => {
      const natalPoint = {
        planet: synastryAspect.planet1,
        position: synastryAspect.position1,
        person: 'person1'
      };
      
      transitingPlanets.forEach(transitPlanet => {
        // Calculate position of transiting planet during this month
        const midMonth = new Date((startDate.getTime() + endDate.getTime()) / 2);
        const transitPosition = this.getTransitingPlanetPosition(transitPlanet, midMonth);
        
        if (!transitPosition) return;
        
        // Check for aspects
        const aspect = this.calculateAspect(transitPosition, natalPoint.position);
        
        if (aspect) {
          const event = this.createTransitEvent(
            midMonth,
            transitPlanet,
            aspect.type,
            natalPoint,
            aspect.orb,
            synastryAspect
          );
          
          if (event) {
            transits.push(event);
          }
        }
      });
    });
    
    // Sort by intensity and date
    return transits.sort((a, b) => {
      const intensityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return intensityOrder[a.intensity] - intensityOrder[b.intensity];
    });
  }

  /**
   * Get transiting planet position for a specific date
   */
  private getTransitingPlanetPosition(planet: string, date: Date): number | null {
    try {
      // Map planet names to astronomy-engine body names
      const bodyMap: Record<string, Astronomy.Body> = {
        'Sun': Astronomy.Body.Sun,
        'Moon': Astronomy.Body.Moon,
        'Mercury': Astronomy.Body.Mercury,
        'Venus': Astronomy.Body.Venus,
        'Mars': Astronomy.Body.Mars,
        'Jupiter': Astronomy.Body.Jupiter,
        'Saturn': Astronomy.Body.Saturn,
        'Uranus': Astronomy.Body.Uranus,
        'Neptune': Astronomy.Body.Neptune,
        'Pluto': Astronomy.Body.Pluto
      };
      
      const body = bodyMap[planet];
      if (!body) return null;
      
      // Get geocentric ecliptic longitude
      const geoVector = Astronomy.GeoVector(body, date, true);
      const ecliptic = Astronomy.Ecliptic(geoVector);
      return ecliptic.elon; // Ecliptic longitude in degrees
    } catch (error) {
      console.warn(`Could not calculate position for ${planet}:`, error);
      return null;
    }
  }

  /**
   * Calculate aspect between two positions
   */
  private calculateAspect(position1: number, position2: number): { type: string; orb: number } | null {
    const diff = Math.abs(position1 - position2);
    const normalizedDiff = diff > 180 ? 360 - diff : diff;
    
    const aspectTypes = [
      { name: 'conjunction', angle: 0, orb: 8 },
      { name: 'sextile', angle: 60, orb: 6 },
      { name: 'square', angle: 90, orb: 8 },
      { name: 'trine', angle: 120, orb: 8 },
      { name: 'opposition', angle: 180, orb: 8 }
    ];
    
    for (const aspectType of aspectTypes) {
      const orb = Math.abs(normalizedDiff - aspectType.angle);
      if (orb <= aspectType.orb) {
        return { type: aspectType.name, orb };
      }
    }
    
    return null;
  }

  /**
   * Create a transit event with interpretation
   */
  private createTransitEvent(
    date: Date,
    transitingPlanet: string,
    aspect: string,
    natalPoint: any,
    orb: number,
    synastryAspect: any
  ): MonthlyTransitEvent | null {
    
    // Determine who is affected
    const personAffected = this.determinePersonAffected(natalPoint, synastryAspect);
    
    // Generate interpretation
    const interpretation = this.generateTransitInterpretation(
      transitingPlanet,
      aspect,
      natalPoint,
      synastryAspect,
      personAffected
    );
    
    // Determine intensity
    const intensity = this.calculateIntensity(transitingPlanet, aspect, orb);
    
    // Determine event type
    const eventType = this.determineEventType(transitingPlanet, aspect);
    
    return {
      date,
      transitingPlanet,
      transitAspect: aspect,
      natalPoint: `${natalPoint.person}'s ${natalPoint.planet}`,
      orb,
      personAffected,
      interpretation,
      intensity,
      eventType
    };
  }

  /**
   * Determine which person is affected by a transit
   */
  private determinePersonAffected(natalPoint: any, synastryAspect: any): 'person1' | 'person2' | 'both' {
    // If it's a synastry aspect involving both charts, both are affected
    if (synastryAspect.planet1Owner !== synastryAspect.planet2Owner) {
      return 'both';
    }
    
    // Otherwise, the person whose planet is being transited
    return natalPoint.person;
  }

  /**
   * Generate human-readable interpretation of transit
   */
  private generateTransitInterpretation(
    transitingPlanet: string,
    aspect: string,
    natalPoint: any,
    synastryAspect: any,
    personAffected: 'person1' | 'person2' | 'both'
  ): string {
    
    const interpretations: Record<string, Record<string, string>> = {
      'Jupiter': {
        'conjunction': 'brings expansion, optimism, and growth to your connection. This is a time of opportunity and increased joy in the relationship.',
        'trine': 'enhances harmony and brings good fortune. The relationship feels easy and blessed during this time.',
        'square': 'may bring overconfidence or overindulgence. Watch for excess or unrealistic expectations.',
        'opposition': 'creates tension between freedom and togetherness. Balance is needed.'
      },
      'Saturn': {
        'conjunction': 'brings seriousness, commitment, and reality checks. This transit tests the relationship foundation.',
        'trine': 'strengthens commitment and builds lasting structures. Good time for serious conversations.',
        'square': 'creates obstacles, delays, or feelings of restriction. Patience and maturity are required.',
        'opposition': 'forces you to face relationship responsibilities and limitations. Make-or-break energy.'
      },
      'Uranus': {
        'conjunction': 'brings sudden changes, breakthroughs, or disruptions. Expect the unexpected in the relationship.',
        'trine': 'energizes the connection with excitement and freedom. Good for trying new things together.',
        'square': 'creates instability, rebellion, or desire for freedom. Relationship may feel unpredictable.',
        'opposition': 'brings sudden awareness of differences. May trigger breakup or breakthrough.'
      },
      'Neptune': {
        'conjunction': 'dissolves boundaries, increases spiritual connection, or creates illusions. Clarity may be lacking.',
        'trine': 'enhances spiritual and romantic connection. Beautiful, transcendent feelings.',
        'square': 'brings confusion, deception, or disappointment. Reality check may be needed.',
        'opposition': 'exposes illusions or creates spiritual crisis. See the relationship clearly.'
      },
      'Pluto': {
        'conjunction': 'triggers intense transformation, power dynamics, or obsession. Deep changes are inevitable.',
        'trine': 'empowers the relationship and facilitates positive transformation. Growth through depth.',
        'square': 'creates power struggles, control issues, or crisis. Transformation through challenge.',
        'opposition': 'forces confrontation with shadow issues. Death and rebirth of relationship patterns.'
      },
      'Mars': {
        'conjunction': 'energizes passion, desire, and action—or conflict and aggression. High intensity period.',
        'trine': 'boosts sexual chemistry and motivation. Good energy for doing things together.',
        'square': 'increases conflict, irritation, or sexual tension. Arguments likely.',
        'opposition': 'creates tension between different desires or approaches. Passion or conflict.'
      },
      'Venus': {
        'conjunction': 'enhances love, affection, and harmony. Beautiful time for romance and connection.',
        'trine': 'makes love flow easily. Affection and appreciation are high.',
        'square': 'creates tension in values or affection. Minor relationship irritations.',
        'opposition': 'highlights differences in love needs. Balance required.'
      },
      'Mercury': {
        'conjunction': 'enhances communication about the relationship. Good time for important talks.',
        'trine': 'communication flows easily and understanding is high.',
        'square': 'creates misunderstandings or arguments. Be careful with words.',
        'opposition': 'exposes different viewpoints. Communication challenges.'
      }
    };
    
    const baseInterpretation = interpretations[transitingPlanet]?.[aspect] || 
      `${transitingPlanet} ${aspect} activates relationship dynamics.`;
    
    // Add person-specific context
    let personContext = '';
    if (personAffected === 'person1') {
      personContext = ` ${this.config.person1Name} feels this more intensely.`;
    } else if (personAffected === 'person2') {
      personContext = ` ${this.config.person2Name} feels this more intensely.`;
    } else {
      personContext = ` Both people feel this transit strongly.`;
    }
    
    return `Transiting ${transitingPlanet} ${aspect} ${natalPoint.planet}: ${baseInterpretation}${personContext}`;
  }

  /**
   * Calculate intensity of a transit
   */
  private calculateIntensity(planet: string, aspect: string, orb: number): 'low' | 'medium' | 'high' | 'critical' {
    // Outer planets are more intense
    const outerPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
    const isOuter = outerPlanets.includes(planet);
    
    // Hard aspects are more intense
    const hardAspects = ['conjunction', 'square', 'opposition'];
    const isHard = hardAspects.includes(aspect);
    
    // Tight orbs are more intense
    const isTight = orb < 3;
    
    if (isOuter && isHard && isTight) return 'critical';
    if (isOuter && isHard) return 'high';
    if (isOuter || isHard) return 'medium';
    return 'low';
  }

  /**
   * Determine event type
   */
  private determineEventType(planet: string, aspect: string): 'opportunity' | 'challenge' | 'transformation' | 'crisis' | 'breakthrough' {
    const harmonious = ['trine', 'sextile'];
    const challenging = ['square', 'opposition'];
    const transformative = ['Pluto', 'Uranus', 'Neptune'];
    
    if (planet === 'Pluto') return 'transformation';
    if (planet === 'Uranus' && aspect === 'conjunction') return 'breakthrough';
    if (challenging.includes(aspect) && transformative.includes(planet)) return 'crisis';
    if (challenging.includes(aspect)) return 'challenge';
    return 'opportunity';
  }

  /**
   * Determine relationship phase for this month
   */
  private determinePhase(date: Date, transits: MonthlyTransitEvent[]): RelationshipPhase {
    const monthsSinceStart = this.getMonthsSince(this.config.relationshipStartDate, date);
    
    // Default phases
    let phaseName = 'Ongoing';
    let description = 'Regular relationship flow';
    
    // Honeymoon phase
    if (monthsSinceStart <= 6) {
      phaseName = 'Honeymoon Phase';
      description = 'Early excitement, getting to know each other, seeing best qualities';
    }
    // Reality check phase
    else if (monthsSinceStart <= 18) {
      phaseName = 'Reality Check';
      description = 'First conflicts, seeing flaws, questioning compatibility';
    }
    // Deepening phase
    else if (monthsSinceStart <= 36) {
      phaseName = 'Deepening';
      description = 'Building real intimacy, working through challenges together';
    }
    
    // Check for transit-triggered phases
    const criticalTransits = transits.filter(t => t.intensity === 'critical');
    if (criticalTransits.length > 0) {
      const hasSaturn = criticalTransits.some(t => t.transitingPlanet === 'Saturn');
      const hasPluto = criticalTransits.some(t => t.transitingPlanet === 'Pluto');
      const hasUranus = criticalTransits.some(t => t.transitingPlanet === 'Uranus');
      
      if (hasSaturn) {
        phaseName = 'Commitment Test';
        description = 'Saturn is testing the relationship foundation. Reality check and maturity required.';
      } else if (hasPluto) {
        phaseName = 'Transformation Crisis';
        description = 'Deep transformation occurring. Power dynamics and control issues surface.';
      } else if (hasUranus) {
        phaseName = 'Sudden Change';
        description = 'Unexpected developments. Freedom vs. commitment tensions.';
      }
    }
    
    return {
      startDate: new Date(date.getFullYear(), date.getMonth(), 1),
      endDate: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      phaseName,
      description,
      majorTransits: transits.filter(t => t.intensity === 'critical' || t.intensity === 'high'),
      overallEnergy: this.summarizeEnergy(transits),
      person1Experience: this.generatePhaseExperience(transits, 'person1'),
      person2Experience: this.generatePhaseExperience(transits, 'person2'),
      advice: this.generateAdvice(phaseName, transits)
    };
  }

  /**
   * Calculate emotional weather for the month
   */
  private calculateEmotionalWeather(transits: MonthlyTransitEvent[]): 'calm' | 'tense' | 'passionate' | 'transformative' | 'difficult' {
    const criticalCount = transits.filter(t => t.intensity === 'critical').length;
    const challengeCount = transits.filter(t => t.eventType === 'challenge' || t.eventType === 'crisis').length;
    const transformativeCount = transits.filter(t => t.eventType === 'transformation').length;
    
    if (criticalCount >= 2 || challengeCount >= 3) return 'difficult';
    if (transformativeCount >= 2) return 'transformative';
    if (challengeCount >= 1) return 'tense';
    
    const passionateTransits = transits.filter(t => 
      t.transitingPlanet === 'Mars' || t.transitingPlanet === 'Venus'
    );
    if (passionateTransits.length >= 2) return 'passionate';
    
    return 'calm';
  }

  /**
   * Generate person-specific experience description
   */
  private generatePersonExperience(transits: MonthlyTransitEvent[], person: 'person1' | 'person2'): string {
    const personTransits = transits.filter(t => 
      t.personAffected === person || t.personAffected === 'both'
    );
    
    if (personTransits.length === 0) {
      return `Relatively calm month with no major astrological triggers.`;
    }
    
    const criticalTransits = personTransits.filter(t => t.intensity === 'critical');
    const challengingTransits = personTransits.filter(t => t.eventType === 'challenge' || t.eventType === 'crisis');
    
    if (criticalTransits.length > 0) {
      const transit = criticalTransits[0];
      return `Strong focus on ${transit.transitingPlanet} energy. ${transit.interpretation}`;
    }
    
    if (challengingTransits.length > 0) {
      return `Experiencing some relationship tensions or challenges. Growth through difficulty.`;
    }
    
    return `Relatively smooth period with opportunities for connection and growth.`;
  }

  /**
   * Identify key events for the month
   */
  private identifyKeyEvents(transits: MonthlyTransitEvent[]): string[] {
    const events: string[] = [];
    
    // Critical transits are always key events
    transits
      .filter(t => t.intensity === 'critical')
      .forEach(t => {
        events.push(`${t.date.toLocaleDateString()}: ${t.transitingPlanet} ${t.transitAspect} - Major relationship activation`);
      });
    
    // Crisis events
    transits
      .filter(t => t.eventType === 'crisis')
      .forEach(t => {
        events.push(`${t.date.toLocaleDateString()}: Relationship crisis point - transformation required`);
      });
    
    // Breakthrough events
    transits
      .filter(t => t.eventType === 'breakthrough')
      .forEach(t => {
        events.push(`${t.date.toLocaleDateString()}: Breakthrough moment - sudden clarity or change`);
      });
    
    return events;
  }

  /**
   * Identify best and worst days of the month
   */
  private identifySignificantDays(startDate: Date, endDate: Date, transits: MonthlyTransitEvent[]): { bestDays: Date[]; worstDays: Date[] } {
    const bestDays: Date[] = [];
    const worstDays: Date[] = [];
    
    // Best days: harmonious Venus or Jupiter transits
    transits
      .filter(t => 
        (t.transitingPlanet === 'Venus' || t.transitingPlanet === 'Jupiter') &&
        (t.transitAspect === 'trine' || t.transitAspect === 'sextile')
      )
      .forEach(t => bestDays.push(t.date));
    
    // Worst days: hard Saturn, Mars, or Pluto transits
    transits
      .filter(t => 
        (t.transitingPlanet === 'Saturn' || t.transitingPlanet === 'Mars' || t.transitingPlanet === 'Pluto') &&
        (t.transitAspect === 'square' || t.transitAspect === 'opposition') &&
        t.intensity === 'critical'
      )
      .forEach(t => worstDays.push(t.date));
    
    return { bestDays, worstDays };
  }

  /**
   * Helper: Get months between two dates
   */
  private getMonthsSince(startDate: Date, currentDate: Date): number {
    const months = (currentDate.getFullYear() - startDate.getFullYear()) * 12;
    return months + (currentDate.getMonth() - startDate.getMonth());
  }

  /**
   * Summarize overall energy
   */
  private summarizeEnergy(transits: MonthlyTransitEvent[]): string {
    const criticalCount = transits.filter(t => t.intensity === 'critical').length;
    
    if (criticalCount >= 3) return 'Extremely intense and transformative';
    if (criticalCount >= 2) return 'Very challenging with major themes';
    if (criticalCount >= 1) return 'Significant relationship focus';
    
    return 'Moderate energy with some notable moments';
  }

  /**
   * Generate phase-specific experience
   */
  private generatePhaseExperience(transits: MonthlyTransitEvent[], person: 'person1' | 'person2'): string {
    const personTransits = transits.filter(t => 
      t.personAffected === person || t.personAffected === 'both'
    );
    
    const dominant = personTransits[0]; // Most intense transit
    
    if (!dominant) {
      return 'Relatively stable period without major astrological activation.';
    }
    
    return `Experiencing ${dominant.transitingPlanet} energy strongly. ${dominant.interpretation}`;
  }

  /**
   * Generate advice based on phase and transits
   */
  private generateAdvice(phaseName: string, transits: MonthlyTransitEvent[]): string {
    const adviceMap: Record<string, string> = {
      'Honeymoon Phase': 'Enjoy the magic but stay grounded. Notice red flags even while excited. Build healthy communication patterns now.',
      'Reality Check': 'First conflicts are normal. Learn to fight fair. This is when real relationship begins. Can you love the real person?',
      'Deepening': 'Use challenges to grow closer. Build trust through consistency. This phase determines long-term potential.',
      'Commitment Test': 'Saturn demands honesty and maturity. Face realities together. This is make-or-break time. Do the work or move on.',
      'Transformation Crisis': 'Deep change is happening. Don\'t resist—transform. Power struggles will destroy; empowerment will strengthen.',
      'Sudden Change': 'Embrace change rather than forcing stability. Freedom and commitment can coexist. Be authentic.',
      'Ongoing': 'Maintain connection intentionally. Don\'t take each other for granted. Keep growing together.'
    };
    
    let advice = adviceMap[phaseName] || 'Navigate this period with awareness and intention.';
    
    // Add transit-specific advice
    const hasDifficultTransits = transits.some(t => t.eventType === 'crisis' || t.intensity === 'critical');
    if (hasDifficultTransits) {
      advice += ' This is a critical period—seek support if needed. Therapy or counseling recommended.';
    }
    
    return advice;
  }
}
