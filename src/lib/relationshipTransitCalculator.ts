import * as Astronomy from 'astronomy-engine';
import { TransitEvent, MonthlyTimeline, KarmicAnalysis } from '@/types/relationshipTimeline';

interface BirthChart {
  date: Date;
  latitude: number;
  longitude: number;
  planets: {
    name: string;
    longitude: number;
  }[];
}

interface SynastryAspect {
  person1Planet: string;
  person1Longitude: number;
  person2Planet: string;
  person2Longitude: number;
  aspectType: string;
  orb: number;
}

export class RelationshipTransitCalculator {
  
  /**
   * Calculate synastry aspects between two charts
   */
  static calculateSynastryAspects(
    chart1: BirthChart,
    chart2: BirthChart
  ): SynastryAspect[] {
    const aspects: SynastryAspect[] = [];
    
    chart1.planets.forEach(p1 => {
      chart2.planets.forEach(p2 => {
        const aspect = this.findAspect(p1.longitude, p2.longitude);
        
        if (aspect) {
          aspects.push({
            person1Planet: p1.name,
            person1Longitude: p1.longitude,
            person2Planet: p2.name,
            person2Longitude: p2.longitude,
            aspectType: aspect.type,
            orb: aspect.orb
          });
        }
      });
    });
    
    return aspects;
  }
  
  /**
   * Find aspect between two planetary positions
   */
  private static findAspect(
    long1: number,
    long2: number
  ): { type: string; orb: number } | null {
    let diff = Math.abs(long1 - long2);
    if (diff > 180) diff = 360 - diff;
    
    const aspectTypes = [
      { name: 'conjunction', angle: 0, orb: 8 },
      { name: 'sextile', angle: 60, orb: 6 },
      { name: 'square', angle: 90, orb: 8 },
      { name: 'trine', angle: 120, orb: 8 },
      { name: 'opposition', angle: 180, orb: 8 }
    ];
    
    for (const aspectType of aspectTypes) {
      const orb = Math.abs(diff - aspectType.angle);
      if (orb <= aspectType.orb) {
        return { type: aspectType.name, orb };
      }
    }
    
    return null;
  }
  
  /**
   * Generate timeline from relationship start to end (or now)
   */
  static generateTimeline(
    chart1: BirthChart,
    chart2: BirthChart,
    person1Name: string,
    person2Name: string,
    startDate: Date,
    endDate?: Date
  ): MonthlyTimeline[] {
    
    const synastryAspects = this.calculateSynastryAspects(chart1, chart2);
    const timeline: MonthlyTimeline[] = [];
    
    const finalDate = endDate || new Date();
    let currentDate = new Date(startDate);
    
    while (currentDate <= finalDate) {
      const monthData = this.calculateMonthlyTransits(
        synastryAspects,
        currentDate,
        person1Name,
        person2Name
      );
      
      timeline.push(monthData);
      
      // Move to next month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return timeline;
  }
  
  /**
   * Calculate transits for a specific month
   */
  static calculateMonthlyTransits(
    synastryAspects: SynastryAspect[],
    month: Date,
    person1Name: string,
    person2Name: string
  ): MonthlyTimeline {
    
    const events: TransitEvent[] = [];
    const transitPlanets = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Mars', 'Venus'];
    
    const midMonth = new Date(month.getFullYear(), month.getMonth(), 15);
    
    transitPlanets.forEach(transitPlanet => {
      const transitLongitude = this.getTransitPosition(transitPlanet, midMonth);
      
      if (transitLongitude === null) return;
      
      synastryAspects.forEach(synastryAspect => {
        // Check transit to person1's planet
        const aspectToPerson1 = this.findAspect(transitLongitude, synastryAspect.person1Longitude);
        if (aspectToPerson1) {
          const event = this.createTransitEvent(
            midMonth,
            transitPlanet,
            transitLongitude,
            aspectToPerson1.type,
            synastryAspect,
            'person1',
            person1Name,
            person2Name
          );
          events.push(event);
        }
        
        // Check transit to person2's planet
        const aspectToPerson2 = this.findAspect(transitLongitude, synastryAspect.person2Longitude);
        if (aspectToPerson2) {
          const event = this.createTransitEvent(
            midMonth,
            transitPlanet,
            transitLongitude,
            aspectToPerson2.type,
            synastryAspect,
            'person2',
            person1Name,
            person2Name
          );
          events.push(event);
        }
      });
    });
    
    // Sort by intensity
    events.sort((a, b) => b.intensity - a.intensity);
    
    // Generate summaries
    const summary = this.generateMonthlySummary(events, person1Name, person2Name);
    const person1Summary = this.generatePersonSummary(events, 'person1', person1Name);
    const person2Summary = this.generatePersonSummary(events, 'person2', person2Name);
    const advice = this.generateAdvice(events);
    
    return {
      month: midMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      date: midMonth,
      transits: events,
      summary,
      person1Summary,
      person2Summary,
      advice
    };
  }
  
  /**
   * Get transiting planet position
   */
  private static getTransitPosition(planet: string, date: Date): number | null {
    try {
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
      
      const geoVector = Astronomy.GeoVector(body, date, true);
      const ecliptic = Astronomy.Ecliptic(geoVector);
      return ecliptic.elon;
    } catch (error) {
      console.warn(`Could not calculate ${planet} position:`, error);
      return null;
    }
  }
  
  /**
   * Create transit event with interpretations
   */
  private static createTransitEvent(
    date: Date,
    transitPlanet: string,
    transitLongitude: number,
    aspectType: string,
    synastryAspect: SynastryAspect,
    whoIsTransited: 'person1' | 'person2',
    person1Name: string,
    person2Name: string
  ): TransitEvent {
    
    const whoFeelsItMore = this.determineWhoFeelsMore(transitPlanet, whoIsTransited, synastryAspect);
    const experiences = this.generatePersonExperiences(transitPlanet, aspectType, synastryAspect, whoIsTransited, person1Name, person2Name);
    const interpretation = this.generateInterpretation(transitPlanet, aspectType, synastryAspect, whoIsTransited);
    const intensity = this.calculateIntensity(transitPlanet, aspectType, synastryAspect);
    const isKarmic = this.isKarmicTransit(transitPlanet, synastryAspect);
    
    return {
      date,
      transitPlanet,
      transitLongitude,
      aspectType,
      synastryPoint: synastryAspect,
      whoFeelsItMore,
      person1Experience: experiences.person1,
      person2Experience: experiences.person2,
      interpretation,
      intensity,
      isKarmic
    };
  }
  
  /**
   * Determine who feels transit more
   */
  private static determineWhoFeelsMore(
    transitPlanet: string,
    whoIsTransited: 'person1' | 'person2',
    synastryAspect: SynastryAspect
  ): 'person1' | 'person2' | 'both' {
    
    const relationshipPlanets = ['Venus', 'Mars'];
    const isRelationshipAspect = 
      relationshipPlanets.includes(synastryAspect.person1Planet) &&
      relationshipPlanets.includes(synastryAspect.person2Planet);
    
    if (isRelationshipAspect && (transitPlanet === 'Saturn' || transitPlanet === 'Pluto')) {
      return 'both';
    }
    
    return whoIsTransited;
  }
  
  /**
   * Generate person experiences
   */
  private static generatePersonExperiences(
    transitPlanet: string,
    aspectType: string,
    synastryAspect: SynastryAspect,
    whoIsTransited: 'person1' | 'person2',
    person1Name: string,
    person2Name: string
  ): { person1: string; person2: string } {
    
    const transitedPlanet = whoIsTransited === 'person1' 
      ? synastryAspect.person1Planet 
      : synastryAspect.person2Planet;
    
    const key = `${transitPlanet}_${aspectType}_${transitedPlanet}`;
    const interpretations = this.getTransitInterpretations();
    const baseInterp = interpretations[key] || {
      transited: `You feel ${transitPlanet}'s energy strongly affecting your ${transitedPlanet}.`,
      other: `You notice changes in their ${transitedPlanet} energy due to ${transitPlanet}.`
    };
    
    if (whoIsTransited === 'person1') {
      return {
        person1: baseInterp.transited,
        person2: baseInterp.other
      };
    } else {
      return {
        person1: baseInterp.other,
        person2: baseInterp.transited
      };
    }
  }
  
  /**
   * Transit interpretation library
   */
  private static getTransitInterpretations(): Record<string, { transited: string; other: string }> {
    return {
      'Saturn_conjunction_Venus': {
        transited: 'You feel unable to express love freely. Your affection feels blocked or criticized. You question if you\'re lovable. You may pull back emotionally.',
        other: 'They seem distant, cold, or unavailable. Their warmth has disappeared. You feel rejected or that they don\'t love you anymore.'
      },
      'Saturn_square_Venus': {
        transited: 'Your love feels rejected or not enough. You feel criticized for how you love. Timing is always off. You question your worthiness.',
        other: 'They\'re harder to reach emotionally. They seem unhappy or burdened. Your affection doesn\'t land the same way.'
      },
      'Saturn_opposition_Venus': {
        transited: 'You feel torn between love and responsibility. The relationship feels like an obligation. Reality is crushing romance.',
        other: 'They\'re pulling away or becoming more serious. The fun is gone. They seem burdened by the relationship.'
      },
      'Saturn_conjunction_Mars': {
        transited: 'Your desire and drive feel blocked. You can\'t act on what you want. Sexual energy is low or frustrated.',
        other: 'They seem less passionate or interested. Their drive has disappeared. They\'re not pursuing you anymore.'
      },
      'Saturn_square_Mars': {
        transited: 'Everything you try to do is blocked. Your actions are criticized or fail. Sexual frustration is high.',
        other: 'They\'re irritable, frustrated, or passive-aggressive. Their energy is blocked.'
      },
      'Saturn_conjunction_Moon': {
        transited: 'You feel emotionally depressed, unsafe, or unloved. Your needs feel like burdens. Deep childhood wounds surface.',
        other: 'They\'re emotionally unavailable or depressed. You can\'t reach them. They seem numb or shut down.'
      },
      'Saturn_square_Moon': {
        transited: 'Your emotions are constantly invalidated or criticized. You feel emotionally unsafe. You can\'t be yourself.',
        other: 'They\'re emotionally struggling. Nothing you do helps. They\'re going through deep emotional pain.'
      },
      'Pluto_conjunction_Venus': {
        transited: 'You\'re obsessed or consumed by the relationship. Your love is transforming. Power and control issues surface.',
        other: 'They\'re intensely focused on you - for better or worse. They may be obsessive. Watch for control.'
      },
      'Pluto_square_Venus': {
        transited: 'Power struggles over love. You feel controlled or you\'re trying to control. Jealousy, possessiveness. Crisis.',
        other: 'They\'re being controlling or are in crisis. Jealousy or power issues. The relationship feels dangerous.'
      },
      'Pluto_conjunction_Mars': {
        transited: 'Sexual obsession or power. You want to dominate or be dominated. Intense sexual transformation.',
        other: 'Their desire is overwhelming or scary. Power and sex are mixed. Be careful.'
      },
      'Pluto_square_Mars': {
        transited: 'Rage, power struggles, potential for violence. Your will is being crushed or you\'re crushing theirs.',
        other: 'They\'re dangerous right now emotionally. Anger and power issues. They may explode.'
      },
      'Uranus_conjunction_Venus': {
        transited: 'Sudden changes in how you love. You crave freedom. The relationship feels restrictive. Breakthrough or breakup.',
        other: 'They\'ve changed. They want freedom or something new. They may leave suddenly.'
      },
      'Uranus_square_Venus': {
        transited: 'You\'re rebelling against the relationship. You feel trapped. You want excitement elsewhere.',
        other: 'They\'re unpredictable and distant. They may be interested in someone else. The relationship is unstable.'
      },
      'Uranus_opposition_Venus': {
        transited: 'Sudden awareness that you want different things. You need freedom. Breakup is likely unless major changes.',
        other: 'They suddenly see things differently. They may want out. Brace for change.'
      },
      'Jupiter_conjunction_Venus': {
        transited: 'You feel generous, optimistic, and expansive in love. Your heart is open. Beautiful time for romance.',
        other: 'They\'re loving, generous, and happy. They appreciate you more. Good energy between you.'
      },
      'Jupiter_trine_Venus': {
        transited: 'Love flows easily. You feel blessed and grateful. The relationship brings joy.',
        other: 'They\'re happy and loving. Things are easy between you. Sweet period.'
      },
      'Jupiter_conjunction_Mars': {
        transited: 'Your desire and confidence are high. You pursue what you want. Sexual energy is strong.',
        other: 'They\'re confident and pursuing you. Their energy is high. Good sexual chemistry.'
      },
      'Neptune_conjunction_Venus': {
        transited: 'You\'re in a romantic fog. They seem perfect. You can\'t see clearly. Reality check needed later.',
        other: 'They\'re idealizing you or the relationship. They may not see you clearly. Beautiful but may not be real.'
      },
      'Neptune_square_Venus': {
        transited: 'Confusion about love. Are you in love or deluded? Disappointment likely. You\'re seeing what you want to see.',
        other: 'They\'re confused or deceiving themselves (or you). Something isn\'t real. Trust your instincts.'
      },
      'Mars_conjunction_Venus': {
        transited: 'Sexual chemistry is very high. You feel desired and desiring. Passion, attraction, action.',
        other: 'They\'re pursuing you intensely. Sexual energy between you. Passionate time.'
      },
      'Mars_square_Venus': {
        transited: 'Sexual tension with frustration. You want them but timing is off. Hot arguments.',
        other: 'They\'re attracted but frustrated. Sexual tension. Arguments possible.'
      },
      'Mars_conjunction_Mars': {
        transited: 'High energy, same drive, or major competition. You\'re aligned in action OR fighting for dominance.',
        other: 'They match your energy. You\'re in sync OR competing. Both powerful right now.'
      },
      'Mars_square_Mars': {
        transited: 'Your desires clash. When you want to go, they want to stop. Conflict likely.',
        other: 'They\'re fighting with you or their desires oppose yours. Energy clash. Arguments.'
      }
    };
  }
  
  /**
   * Generate interpretation
   */
  private static generateInterpretation(
    transitPlanet: string,
    aspectType: string,
    synastryAspect: SynastryAspect,
    whoIsTransited: 'person1' | 'person2'
  ): string {
    
    const transitedPlanet = whoIsTransited === 'person1' 
      ? synastryAspect.person1Planet 
      : synastryAspect.person2Planet;
    
    return `Transiting ${transitPlanet} ${aspectType} natal ${transitedPlanet} (synastry ${synastryAspect.aspectType} ${synastryAspect.person1Planet}-${synastryAspect.person2Planet})`;
  }
  
  /**
   * Calculate intensity
   */
  private static calculateIntensity(
    transitPlanet: string,
    aspectType: string,
    synastryAspect: SynastryAspect
  ): number {
    
    let intensity = 5;
    
    if (['Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(transitPlanet)) {
      intensity += 3;
    }
    
    if (['conjunction', 'square', 'opposition'].includes(aspectType)) {
      intensity += 2;
    }
    
    if ((synastryAspect.person1Planet === 'Venus' && synastryAspect.person2Planet === 'Mars') ||
        (synastryAspect.person1Planet === 'Mars' && synastryAspect.person2Planet === 'Venus')) {
      intensity += 2;
    }
    
    if ([synastryAspect.person1Planet, synastryAspect.person2Planet].includes('Moon')) {
      intensity += 1;
    }
    
    return Math.min(intensity, 10);
  }
  
  /**
   * Check if karmic
   */
  private static isKarmicTransit(
    transitPlanet: string,
    synastryAspect: SynastryAspect
  ): boolean {
    
    if (['Saturn', 'Pluto'].includes(transitPlanet)) return true;
    
    if ([synastryAspect.person1Planet, synastryAspect.person2Planet].includes('North Node') ||
        [synastryAspect.person1Planet, synastryAspect.person2Planet].includes('South Node')) {
      return true;
    }
    
    if ([synastryAspect.person1Planet, synastryAspect.person2Planet].includes('Chiron')) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Generate monthly summary
   */
  private static generateMonthlySummary(
    events: TransitEvent[],
    person1Name: string,
    person2Name: string
  ): string {
    
    if (events.length === 0) {
      return 'Calm month with no major astrological activity affecting the relationship.';
    }
    
    const topEvent = events[0];
    
    if (topEvent.intensity >= 8) {
      return `INTENSE month: ${topEvent.interpretation}. Major relationship focus this month.`;
    } else if (topEvent.intensity >= 6) {
      return `Significant month: ${topEvent.interpretation}. Important relationship developments.`;
    } else {
      return `Active month: ${topEvent.interpretation}. Some notable relationship dynamics.`;
    }
  }
  
  /**
   * Generate person summary
   */
  private static generatePersonSummary(
    events: TransitEvent[],
    person: 'person1' | 'person2',
    personName: string
  ): string {
    
    const personEvents = events.filter(e => e.whoFeelsItMore === person || e.whoFeelsItMore === 'both');
    
    if (personEvents.length === 0) {
      return `${personName}: Relatively calm month.`;
    }
    
    const topEvent = personEvents[0];
    return person === 'person1' ? topEvent.person1Experience : topEvent.person2Experience;
  }
  
  /**
   * Generate advice
   */
  private static generateAdvice(events: TransitEvent[]): string {
    
    if (events.length === 0) {
      return 'Enjoy the calm and strengthen your connection through quality time together.';
    }
    
    const topEvent = events[0];
    
    if (topEvent.transitPlanet === 'Saturn') {
      return 'Saturn is testing the relationship. Face realities honestly. Do the work or let go. Maturity required.';
    } else if (topEvent.transitPlanet === 'Pluto') {
      return 'Deep transformation happening. Don\'t resist change. Power struggles will destroy; empowerment will strengthen.';
    } else if (topEvent.transitPlanet === 'Uranus') {
      return 'Unexpected changes. Stay flexible. Freedom and authenticity are needed. Breakthrough or breakup energy.';
    } else if (topEvent.transitPlanet === 'Neptune') {
      return 'Check in with reality. Are you seeing things clearly? Beautiful feelings but verify the truth.';
    } else if (topEvent.transitPlanet === 'Jupiter') {
      return 'Opportunity for growth and joy. Stay open and generous. Good time to expand the relationship.';
    } else {
      return 'Navigate this period with awareness and communication.';
    }
  }
  
  /**
   * Identify karmic patterns
   */
  static identifyKarmicPatterns(synastryAspects: SynastryAspect[]): KarmicAnalysis {
    
    const indicators: string[] = [];
    
    synastryAspects.forEach(aspect => {
      if (aspect.person1Planet === 'South Node' || aspect.person2Planet === 'South Node') {
        indicators.push(`${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspectType}: Past life connection`);
      }
      if (aspect.person1Planet === 'North Node' || aspect.person2Planet === 'North Node') {
        indicators.push(`${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspectType}: Soul growth mission`);
      }
      
      if ((aspect.person1Planet === 'Saturn' || aspect.person2Planet === 'Saturn') &&
          ['conjunction', 'square', 'opposition'].includes(aspect.aspectType)) {
        indicators.push(`${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspectType}: Karmic lesson and testing`);
      }
      
      if ((aspect.person1Planet === 'Pluto' || aspect.person2Planet === 'Pluto') &&
          ['conjunction', 'square'].includes(aspect.aspectType)) {
        indicators.push(`${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspectType}: Transformative karmic bond`);
      }
      
      if (aspect.person1Planet === 'Chiron' || aspect.person2Planet === 'Chiron') {
        indicators.push(`${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspectType}: Healing wound karma`);
      }
    });
    
    const isKarmic = indicators.length > 0;
    
    let description = '';
    if (isKarmic) {
      if (indicators.length >= 3) {
        description = 'HIGHLY KARMIC relationship. You\'ve been together before. This connection exists to complete unfinished business, heal wounds, or evolve both souls.';
      } else {
        description = 'Karmic elements present. This relationship has lessons to teach and old patterns to heal.';
      }
    } else {
      description = 'Not primarily karmic. This is a growth relationship based on present-life compatibility and choice.';
    }
    
    return { isKarmic, karmicIndicators: indicators, description };
  }
}

export type { BirthChart, SynastryAspect };
