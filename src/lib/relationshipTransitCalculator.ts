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

interface AttractionAnalysis {
  magneticPull: string;
  coreAttraction: string;
  chemistryFactors: string[];
}

interface ChallengeAnalysis {
  coreChallenge: string;
  growthEdge: string;
  warningSignals: string[];
}

interface BreakupAnalysis {
  primaryCause: string;
  triggerTransits: string[];
  buildUp: string;
  finalStraw: string;
}

interface RelationshipOverview {
  attraction: AttractionAnalysis;
  challenge: ChallengeAnalysis;
  breakup?: BreakupAnalysis;
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
   * Analyze overall relationship - attraction, challenges, and breakup
   */
  static analyzeRelationshipOverview(
    chart1: BirthChart,
    chart2: BirthChart,
    person1Name: string,
    person2Name: string,
    startDate: Date,
    endDate?: Date
  ): RelationshipOverview {
    const synastryAspects = this.calculateSynastryAspects(chart1, chart2);
    
    const attraction = this.analyzeAttraction(synastryAspects, person1Name, person2Name);
    const challenge = this.analyzeChallenges(synastryAspects, person1Name, person2Name);
    
    let breakup: BreakupAnalysis | undefined;
    if (endDate) {
      breakup = this.analyzeBreakup(chart1, chart2, synastryAspects, person1Name, person2Name, endDate);
    }
    
    return { attraction, challenge, breakup };
  }

  /**
   * Analyze what attracts the couple to each other
   */
  private static analyzeAttraction(
    synastryAspects: SynastryAspect[],
    person1Name: string,
    person2Name: string
  ): AttractionAnalysis {
    const chemistryFactors: string[] = [];
    let magneticPull = '';
    let coreAttraction = '';

    // Find Venus-Mars connections (sexual chemistry)
    const venusMars = synastryAspects.find(a => 
      (a.person1Planet === 'Venus' && a.person2Planet === 'Mars') ||
      (a.person1Planet === 'Mars' && a.person2Planet === 'Venus')
    );
    
    if (venusMars) {
      const aspectDesc = this.getAspectDescription(venusMars.aspectType);
      chemistryFactors.push(`Venus-Mars ${venusMars.aspectType}: Intense sexual chemistry and magnetic attraction. ${aspectDesc === 'harmonious' ? 'The desire flows naturally between you.' : 'Tension creates irresistible pull.'}`);
    }

    // Find Moon connections (emotional bond)
    const moonConnections = synastryAspects.filter(a => 
      a.person1Planet === 'Moon' || a.person2Planet === 'Moon'
    );
    
    const moonSun = moonConnections.find(a => 
      (a.person1Planet === 'Moon' && a.person2Planet === 'Sun') ||
      (a.person1Planet === 'Sun' && a.person2Planet === 'Moon')
    );
    
    if (moonSun) {
      chemistryFactors.push(`Sun-Moon ${moonSun.aspectType}: Deep emotional recognition. ${moonSun.person1Planet === 'Moon' ? person1Name : person2Name}'s emotional needs align with ${moonSun.person1Planet === 'Moon' ? person2Name : person1Name}'s core identity.`);
    }

    const moonMoon = synastryAspects.find(a => 
      a.person1Planet === 'Moon' && a.person2Planet === 'Moon'
    );
    
    if (moonMoon) {
      const desc = moonMoon.aspectType === 'conjunction' ? 'You feel emotions the same way - instant understanding.' :
                   moonMoon.aspectType === 'trine' || moonMoon.aspectType === 'sextile' ? 'Your emotional rhythms harmonize naturally.' :
                   'Different emotional needs create both friction and fascination.';
      chemistryFactors.push(`Moon-Moon ${moonMoon.aspectType}: ${desc}`);
    }

    // Find Venus-Venus (love language match)
    const venusVenus = synastryAspects.find(a => 
      a.person1Planet === 'Venus' && a.person2Planet === 'Venus'
    );
    
    if (venusVenus) {
      chemistryFactors.push(`Venus-Venus ${venusVenus.aspectType}: Similar love languages and values. You appreciate the same things in life.`);
    }

    // Sun-Sun (identity match)
    const sunSun = synastryAspects.find(a => 
      a.person1Planet === 'Sun' && a.person2Planet === 'Sun'
    );
    
    if (sunSun) {
      const desc = sunSun.aspectType === 'conjunction' ? 'Similar life paths and ego structures. You recognize each other deeply.' :
                   sunSun.aspectType === 'trine' || sunSun.aspectType === 'sextile' ? 'Your identities support and enhance each other.' :
                   'Different core identities create both challenge and growth potential.';
      chemistryFactors.push(`Sun-Sun ${sunSun.aspectType}: ${desc}`);
    }

    // Generate magnetic pull description
    if (venusMars) {
      magneticPull = `The raw attraction between you is undeniable. ${person1Name}'s ${venusMars.person1Planet} ${venusMars.aspectType}s ${person2Name}'s ${venusMars.person2Planet}, creating a classic lover's configuration. When you're near each other, there's an almost gravitational pull.`;
    } else if (moonSun) {
      magneticPull = `The connection feels fated and emotionally deep. One of you unconsciously fills what the other needs - it feels like coming home.`;
    } else if (chemistryFactors.length > 0) {
      magneticPull = `Your attraction operates on subtle but powerful levels. Multiple connections between your charts create a complex, layered draw toward each other.`;
    } else {
      magneticPull = `Your attraction may be based more on timing, circumstance, or conscious choice than overwhelming astrological chemistry. This can actually create a more stable, less volatile bond.`;
    }

    // Generate core attraction summary
    if (chemistryFactors.length >= 3) {
      coreAttraction = `Multiple powerful connections create a relationship that feels "meant to be." ${person1Name} and ${person2Name} are drawn together on physical, emotional, and identity levels. This is a multi-layered attraction that's hard to walk away from.`;
    } else if (chemistryFactors.length >= 1) {
      coreAttraction = `Clear attraction signatures exist between you. The connection isn't just random - your charts show specific reasons why you're drawn to each other.`;
    } else {
      coreAttraction = `Your connection may be based more on compatibility than chemistry. This can actually lead to a more stable long-term relationship, though initial sparks may be subtler.`;
    }

    return { magneticPull, coreAttraction, chemistryFactors };
  }

  /**
   * Analyze the core challenges in the relationship
   */
  private static analyzeChallenges(
    synastryAspects: SynastryAspect[],
    person1Name: string,
    person2Name: string
  ): ChallengeAnalysis {
    const warningSignals: string[] = [];
    let coreChallenge = '';
    let growthEdge = '';

    // Find Saturn contacts (restriction, criticism, testing)
    const saturnContacts = synastryAspects.filter(a => 
      (a.person1Planet === 'Saturn' || a.person2Planet === 'Saturn') &&
      ['conjunction', 'square', 'opposition'].includes(a.aspectType)
    );

    saturnContacts.forEach(a => {
      const saturnPerson = a.person1Planet === 'Saturn' ? person1Name : person2Name;
      const otherPlanet = a.person1Planet === 'Saturn' ? a.person2Planet : a.person1Planet;
      const otherPerson = a.person1Planet === 'Saturn' ? person2Name : person1Name;
      
      if (otherPlanet === 'Moon') {
        warningSignals.push(`${saturnPerson}'s Saturn ${a.aspectType}s ${otherPerson}'s Moon: ${otherPerson} feels emotionally criticized, invalidated, or that their needs are a burden. ${saturnPerson} seems cold or withholding.`);
      } else if (otherPlanet === 'Sun') {
        warningSignals.push(`${saturnPerson}'s Saturn ${a.aspectType}s ${otherPerson}'s Sun: ${otherPerson} feels their identity is crushed or criticized. ${saturnPerson} may try to control or diminish them.`);
      } else if (otherPlanet === 'Venus') {
        warningSignals.push(`${saturnPerson}'s Saturn ${a.aspectType}s ${otherPerson}'s Venus: ${otherPerson} feels unloved, unappreciated, or that their love isn't good enough. Love feels blocked.`);
      } else if (otherPlanet === 'Mars') {
        warningSignals.push(`${saturnPerson}'s Saturn ${a.aspectType}s ${otherPerson}'s Mars: ${otherPerson} feels their desires and actions are constantly blocked or criticized. Sexual frustration likely.`);
      }
    });

    // Find Pluto contacts (power struggles, obsession)
    const plutoContacts = synastryAspects.filter(a => 
      (a.person1Planet === 'Pluto' || a.person2Planet === 'Pluto') &&
      ['conjunction', 'square', 'opposition'].includes(a.aspectType)
    );

    plutoContacts.forEach(a => {
      const plutoPerson = a.person1Planet === 'Pluto' ? person1Name : person2Name;
      const otherPlanet = a.person1Planet === 'Pluto' ? a.person2Planet : a.person1Planet;
      const otherPerson = a.person1Planet === 'Pluto' ? person2Name : person1Name;
      
      if (['Sun', 'Moon', 'Venus'].includes(otherPlanet)) {
        warningSignals.push(`${plutoPerson}'s Pluto ${a.aspectType}s ${otherPerson}'s ${otherPlanet}: Intense power dynamics. ${plutoPerson} may try to control, manipulate, or possess ${otherPerson}. Jealousy and obsession possible.`);
      }
    });

    // Find Neptune contacts (illusion, deception)
    const neptuneContacts = synastryAspects.filter(a => 
      (a.person1Planet === 'Neptune' || a.person2Planet === 'Neptune') &&
      ['conjunction', 'square', 'opposition'].includes(a.aspectType)
    );

    neptuneContacts.forEach(a => {
      const neptunePerson = a.person1Planet === 'Neptune' ? person1Name : person2Name;
      const otherPlanet = a.person1Planet === 'Neptune' ? a.person2Planet : a.person1Planet;
      const otherPerson = a.person1Planet === 'Neptune' ? person2Name : person1Name;
      
      if (['Sun', 'Moon', 'Venus'].includes(otherPlanet)) {
        warningSignals.push(`${neptunePerson}'s Neptune ${a.aspectType}s ${otherPerson}'s ${otherPlanet}: Potential for illusion, idealization, or deception. ${otherPerson} may not see ${neptunePerson} clearly. Reality checks needed.`);
      }
    });

    // Find Mars-Mars squares/oppositions (conflict)
    const marsConflict = synastryAspects.find(a => 
      a.person1Planet === 'Mars' && a.person2Planet === 'Mars' &&
      ['square', 'opposition'].includes(a.aspectType)
    );

    if (marsConflict) {
      warningSignals.push(`Mars-Mars ${marsConflict.aspectType}: Your desires and actions clash. What one wants, the other resists. Arguments and competition for dominance.`);
    }

    // Generate core challenge
    if (saturnContacts.length > 0) {
      const mainSaturn = saturnContacts[0];
      const saturnPerson = mainSaturn.person1Planet === 'Saturn' ? person1Name : person2Name;
      coreChallenge = `${saturnPerson} unconsciously takes on a critical, restrictive, or parental role. This can feel like constant testing, judgment, or withholding. Over time, the other person may feel "not good enough" or lose their sense of self.`;
    } else if (plutoContacts.length > 0) {
      coreChallenge = `Power and control are central themes. One or both partners may struggle with jealousy, possessiveness, manipulation, or the need to dominate. The relationship can become consuming or toxic if not handled consciously.`;
    } else if (neptuneContacts.length > 0) {
      coreChallenge = `Clarity is elusive. One or both partners may be living in illusion about the other or the relationship. Deception (of self or other), confusion, or disappointment when reality hits.`;
    } else if (warningSignals.length > 0) {
      coreChallenge = `Multiple friction points exist between you. Growth is possible but requires conscious effort and communication.`;
    } else {
      coreChallenge = `No major challenging aspects detected. Your friction points likely come from transits, life circumstances, or personal growth patterns rather than inherent incompatibility.`;
    }

    // Generate growth edge
    if (saturnContacts.length > 0) {
      growthEdge = `This relationship teaches maturity, responsibility, and self-worth. If you can learn to set boundaries while staying loving, and receive feedback without crumbling, you'll grow tremendously.`;
    } else if (plutoContacts.length > 0) {
      growthEdge = `This relationship is here to transform you. Old patterns of control, fear, and power must die for something real to emerge. If you can surrender control without losing yourself, profound intimacy is possible.`;
    } else if (neptuneContacts.length > 0) {
      growthEdge = `This relationship teaches discernment and unconditional love. Learning to see clearly while still choosing love - that's the lesson. Spiritual growth through acceptance of reality.`;
    } else {
      growthEdge = `Your growth in this relationship comes from choosing to evolve together rather than being forced by difficult aspects. You have freedom to shape this consciously.`;
    }

    return { coreChallenge, growthEdge, warningSignals };
  }

  /**
   * Analyze what caused the breakup
   */
  private static analyzeBreakup(
    chart1: BirthChart,
    chart2: BirthChart,
    synastryAspects: SynastryAspect[],
    person1Name: string,
    person2Name: string,
    endDate: Date
  ): BreakupAnalysis {
    const triggerTransits: string[] = [];
    
    // Scan 3 months before the breakup for major transits
    const threeMonthsBefore = new Date(endDate);
    threeMonthsBefore.setMonth(threeMonthsBefore.getMonth() - 3);
    
    const breakupPlanets = ['Saturn', 'Uranus', 'Pluto', 'Neptune'];
    const natalPoints = [...chart1.planets, ...chart2.planets];
    
    // Check each week leading up to breakup
    let currentDate = new Date(threeMonthsBefore);
    while (currentDate <= endDate) {
      breakupPlanets.forEach(transitPlanet => {
        const transitLong = this.getTransitPosition(transitPlanet, currentDate);
        if (transitLong === null) return;
        
        // Check transits to person1's planets
        chart1.planets.forEach(natal => {
          if (['Sun', 'Moon', 'Venus', 'Mars', 'Saturn'].includes(natal.name)) {
            const aspect = this.findAspect(transitLong, natal.longitude);
            if (aspect && ['conjunction', 'square', 'opposition'].includes(aspect.type)) {
              const dateStr = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              const desc = this.getBreakupTransitDescription(transitPlanet, natal.name, aspect.type, person1Name);
              const key = `${transitPlanet}-${natal.name}`;
              if (!triggerTransits.some(t => t.includes(key))) {
                triggerTransits.push(`${dateStr}: ${desc}`);
              }
            }
          }
        });
        
        // Check transits to person2's planets
        chart2.planets.forEach(natal => {
          if (['Sun', 'Moon', 'Venus', 'Mars', 'Saturn'].includes(natal.name)) {
            const aspect = this.findAspect(transitLong, natal.longitude);
            if (aspect && ['conjunction', 'square', 'opposition'].includes(aspect.type)) {
              const dateStr = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
              const desc = this.getBreakupTransitDescription(transitPlanet, natal.name, aspect.type, person2Name);
              const key = `${transitPlanet}-${natal.name}`;
              if (!triggerTransits.some(t => t.includes(key))) {
                triggerTransits.push(`${dateStr}: ${desc}`);
              }
            }
          }
        });
      });
      
      // Move forward one week
      currentDate.setDate(currentDate.getDate() + 7);
    }

    // Determine primary cause based on transits found
    let primaryCause = '';
    let buildUp = '';
    let finalStraw = '';

    const hasUranus = triggerTransits.some(t => t.includes('Uranus'));
    const hasSaturn = triggerTransits.some(t => t.includes('Saturn'));
    const hasPluto = triggerTransits.some(t => t.includes('Pluto'));
    const hasNeptune = triggerTransits.some(t => t.includes('Neptune'));

    if (hasUranus && hasSaturn) {
      primaryCause = `A perfect storm of freedom needs (Uranus) clashing with reality and restriction (Saturn). One or both of you woke up to the truth while simultaneously feeling trapped.`;
      buildUp = `The tension had been building for months. Saturn made the relationship feel heavy and obligatory while Uranus screamed for liberation.`;
      finalStraw = `The need for freedom finally overwhelmed the structures holding you together. Someone broke free.`;
    } else if (hasUranus) {
      primaryCause = `Uranus - the awakener and disruptor - shook the relationship. Someone suddenly saw things differently and needed freedom more than connection.`;
      buildUp = `Restlessness had been growing. Small rebellions, distance, or a pull toward something "new" created cracks.`;
      finalStraw = `A sudden realization or event made the status quo impossible. The break came fast.`;
    } else if (hasSaturn) {
      primaryCause = `Saturn - the reality check - crushed the romantic illusions. The weight of what wasn't working became too heavy to carry.`;
      buildUp = `Criticism, disappointment, and feeling "not enough" accumulated over time. Joy drained away.`;
      finalStraw = `One or both of you decided the work wasn't worth it, or that the problems couldn't be fixed.`;
    } else if (hasPluto) {
      primaryCause = `Pluto - the destroyer and transformer - demanded something die. The relationship as it was couldn't survive.`;
      buildUp = `Power struggles, control issues, jealousy, or obsessive patterns intensified. Something toxic needed to end.`;
      finalStraw = `A crisis, betrayal, or transformation made continuing impossible. The old form had to die.`;
    } else if (hasNeptune) {
      primaryCause = `Neptune - the dissolver - slowly eroded the connection. Disillusionment or confusion made the bond impossible to maintain.`;
      buildUp = `The dream slowly faded. You started seeing each other more clearly - and didn't like what you saw.`;
      finalStraw = `The fog lifted and reality didn't match the fantasy. Someone escaped or drifted away.`;
    } else {
      primaryCause = `The timing and circumstances aligned for an ending. While specific dramatic transits aren't obvious, the relationship had run its course.`;
      buildUp = `Small frustrations and unmet needs accumulated over time.`;
      finalStraw = `Eventually, the accumulation of issues outweighed the reasons to stay.`;
    }

    return { primaryCause, triggerTransits, buildUp, finalStraw };
  }

  /**
   * Get breakup transit description
   */
  private static getBreakupTransitDescription(
    transitPlanet: string,
    natalPlanet: string,
    aspectType: string,
    personName: string
  ): string {
    const descriptions: Record<string, string> = {
      'Saturn-Sun': `Saturn ${aspectType} ${personName}'s Sun - identity crisis, feeling crushed or inadequate`,
      'Saturn-Moon': `Saturn ${aspectType} ${personName}'s Moon - emotional depression, feeling unloved`,
      'Saturn-Venus': `Saturn ${aspectType} ${personName}'s Venus - love feels blocked, unable to express affection`,
      'Saturn-Mars': `Saturn ${aspectType} ${personName}'s Mars - desire blocked, frustration and impotence`,
      'Uranus-Sun': `Uranus ${aspectType} ${personName}'s Sun - sudden identity awakening, need for radical change`,
      'Uranus-Moon': `Uranus ${aspectType} ${personName}'s Moon - emotional revolution, need for freedom`,
      'Uranus-Venus': `Uranus ${aspectType} ${personName}'s Venus - love revolution, sudden change in what they want`,
      'Uranus-Mars': `Uranus ${aspectType} ${personName}'s Mars - erratic actions, breaking free of constraints`,
      'Pluto-Sun': `Pluto ${aspectType} ${personName}'s Sun - ego death and transformation, power crisis`,
      'Pluto-Moon': `Pluto ${aspectType} ${personName}'s Moon - emotional obsession or destruction, deep wounds surfacing`,
      'Pluto-Venus': `Pluto ${aspectType} ${personName}'s Venus - love obsession, jealousy, relationship power struggle`,
      'Pluto-Mars': `Pluto ${aspectType} ${personName}'s Mars - rage, power battles, destructive actions`,
      'Neptune-Sun': `Neptune ${aspectType} ${personName}'s Sun - confusion about identity, escapism, disillusionment`,
      'Neptune-Moon': `Neptune ${aspectType} ${personName}'s Moon - emotional confusion, feeling lost or deceived`,
      'Neptune-Venus': `Neptune ${aspectType} ${personName}'s Venus - romantic disillusionment, idealization crashing`
    };
    
    return descriptions[`${transitPlanet}-${natalPlanet}`] || 
           `${transitPlanet} ${aspectType} ${personName}'s ${natalPlanet} - significant pressure on this area of life`;
  }

  /**
   * Get aspect description (harmonious vs challenging)
   */
  private static getAspectDescription(aspectType: string): string {
    if (['trine', 'sextile'].includes(aspectType)) return 'harmonious';
    if (['square', 'opposition'].includes(aspectType)) return 'challenging';
    return 'powerful';
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
        chart1,
        chart2,
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
   * Calculate transits for a specific month - FULL MONTH SCANNING
   */
  static calculateMonthlyTransits(
    synastryAspects: SynastryAspect[],
    chart1: BirthChart,
    chart2: BirthChart,
    month: Date,
    person1Name: string,
    person2Name: string
  ): MonthlyTimeline {
    
    const events: TransitEvent[] = [];
    const seenEvents = new Set<string>(); // Prevent duplicates
    
    // Different scanning frequencies for different planets
    const outerPlanets = ['Saturn', 'Uranus', 'Neptune', 'Pluto']; // Check weekly
    const socialPlanets = ['Jupiter', 'Mars', 'Venus']; // Check every 3 days
    const personalPlanets = ['Sun', 'Mercury']; // Check daily for exact aspects only
    
    const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
    const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
    
    // Scan outer planets weekly
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 7)) {
      outerPlanets.forEach(transitPlanet => {
        this.checkTransitsForDate(transitPlanet, d, synastryAspects, chart1, chart2, events, seenEvents, person1Name, person2Name, 6);
      });
    }
    
    // Scan social planets every 3 days
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 3)) {
      socialPlanets.forEach(transitPlanet => {
        this.checkTransitsForDate(transitPlanet, d, synastryAspects, chart1, chart2, events, seenEvents, person1Name, person2Name, 4);
      });
    }
    
    // Scan personal planets daily but only for tight orbs (more important aspects)
    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 2)) {
      personalPlanets.forEach(transitPlanet => {
        this.checkTransitsForDate(transitPlanet, d, synastryAspects, chart1, chart2, events, seenEvents, person1Name, person2Name, 2);
      });
    }
    
    // Sort by intensity
    events.sort((a, b) => b.intensity - a.intensity);
    
    // Limit to top 10 events to prevent overwhelm
    const topEvents = events.slice(0, 10);
    
    // Generate narrative summaries
    const summary = this.generateMonthlySummary(topEvents, synastryAspects, person1Name, person2Name);
    const person1Summary = this.generatePersonSummary(topEvents, 'person1', person1Name);
    const person2Summary = this.generatePersonSummary(topEvents, 'person2', person2Name);
    const advice = this.generateAdvice(topEvents);
    
    const midMonth = new Date(month.getFullYear(), month.getMonth(), 15);
    
    return {
      month: midMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      date: midMonth,
      transits: topEvents,
      summary,
      person1Summary,
      person2Summary,
      advice
    };
  }

  /**
   * Check transits for a specific date
   */
  private static checkTransitsForDate(
    transitPlanet: string,
    date: Date,
    synastryAspects: SynastryAspect[],
    chart1: BirthChart,
    chart2: BirthChart,
    events: TransitEvent[],
    seenEvents: Set<string>,
    person1Name: string,
    person2Name: string,
    maxOrb: number
  ): void {
    const transitLongitude = this.getTransitPosition(transitPlanet, date);
    if (transitLongitude === null) return;
    
    // Check transits to each person's natal planets
    chart1.planets.forEach(natal => {
      if (!['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(natal.name)) return;
      
      const aspect = this.findAspect(transitLongitude, natal.longitude);
      if (aspect && aspect.orb <= maxOrb) {
        const eventKey = `${transitPlanet}-${natal.name}-${aspect.type}-person1`;
        if (seenEvents.has(eventKey)) return;
        seenEvents.add(eventKey);
        
        // Find related synastry aspect
        const relatedSynastry = synastryAspects.find(s => 
          s.person1Planet === natal.name || s.person2Planet === natal.name
        ) || synastryAspects[0];
        
        const event = this.createTransitEvent(
          date,
          transitPlanet,
          transitLongitude,
          aspect.type,
          relatedSynastry,
          'person1',
          person1Name,
          person2Name,
          natal.name
        );
        events.push(event);
      }
    });
    
    chart2.planets.forEach(natal => {
      if (!['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'].includes(natal.name)) return;
      
      const aspect = this.findAspect(transitLongitude, natal.longitude);
      if (aspect && aspect.orb <= maxOrb) {
        const eventKey = `${transitPlanet}-${natal.name}-${aspect.type}-person2`;
        if (seenEvents.has(eventKey)) return;
        seenEvents.add(eventKey);
        
        const relatedSynastry = synastryAspects.find(s => 
          s.person1Planet === natal.name || s.person2Planet === natal.name
        ) || synastryAspects[0];
        
        const event = this.createTransitEvent(
          date,
          transitPlanet,
          transitLongitude,
          aspect.type,
          relatedSynastry,
          'person2',
          person1Name,
          person2Name,
          natal.name
        );
        events.push(event);
      }
    });
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
   * Check if planet is retrograde
   */
  private static isRetrograde(planet: string, date: Date): boolean {
    try {
      const pos1 = this.getTransitPosition(planet, date);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      const pos2 = this.getTransitPosition(planet, nextDay);
      
      if (pos1 === null || pos2 === null) return false;
      
      // Handle wraparound at 0/360 degrees
      let diff = pos2 - pos1;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      
      return diff < 0;
    } catch {
      return false;
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
    person2Name: string,
    transitedPlanet?: string
  ): TransitEvent {
    
    const whoFeelsItMore = this.determineWhoFeelsMore(transitPlanet, whoIsTransited, synastryAspect);
    const actualTransitedPlanet = transitedPlanet || (whoIsTransited === 'person1' ? synastryAspect.person1Planet : synastryAspect.person2Planet);
    const experiences = this.generatePersonExperiences(transitPlanet, aspectType, actualTransitedPlanet, whoIsTransited, person1Name, person2Name);
    const interpretation = this.generateNarrativeInterpretation(transitPlanet, aspectType, actualTransitedPlanet, whoIsTransited, person1Name, person2Name);
    const intensity = this.calculateIntensity(transitPlanet, aspectType, synastryAspect, actualTransitedPlanet);
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
   * Generate person experiences with narrative voice
   */
  private static generatePersonExperiences(
    transitPlanet: string,
    aspectType: string,
    transitedPlanet: string,
    whoIsTransited: 'person1' | 'person2',
    person1Name: string,
    person2Name: string
  ): { person1: string; person2: string } {
    
    const key = `${transitPlanet}_${aspectType}_${transitedPlanet}`;
    const interpretations = this.getExpandedTransitInterpretations();
    const baseInterp = interpretations[key] || this.generateDefaultInterpretation(transitPlanet, aspectType, transitedPlanet);
    
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
   * Generate narrative interpretation (professional astrologer voice)
   */
  private static generateNarrativeInterpretation(
    transitPlanet: string,
    aspectType: string,
    transitedPlanet: string,
    whoIsTransited: 'person1' | 'person2',
    person1Name: string,
    person2Name: string
  ): string {
    const personName = whoIsTransited === 'person1' ? person1Name : person2Name;
    const partnerName = whoIsTransited === 'person1' ? person2Name : person1Name;
    
    // Professional astrologer narrative interpretations
    const narratives: Record<string, string> = {
      // Saturn transits
      'Saturn_conjunction_Sun': `Saturn is sitting on ${personName}'s Sun right now. This is heavy. They're questioning everything about who they are and whether they're enough. In the relationship, ${partnerName} may feel like ${personName} is pulling back or being overly serious. Give them space to figure themselves out.`,
      'Saturn_square_Sun': `Saturn is grinding against ${personName}'s Sun. Every attempt to shine feels blocked. They may seem dimmer, less confident, more withdrawn. ${partnerName}, this isn't about you - they're fighting an internal battle about their worth.`,
      'Saturn_opposition_Sun': `Saturn is directly opposing ${personName}'s Sun - it's like looking in a harsh mirror. They're being forced to see themselves as others see them, and it's uncomfortable. The relationship may feel like one more responsibility right now.`,
      'Saturn_conjunction_Moon': `Saturn is pressing down on ${personName}'s Moon. This is emotional winter. They feel cold inside, maybe depressed, definitely not nurtured. ${partnerName}, nothing you do will feel like enough right now - it's not personal.`,
      'Saturn_square_Moon': `Saturn is squaring ${personName}'s Moon. Their emotional needs feel constantly invalidated. They might withdraw, become cold, or express feelings through criticism. The relationship feels emotionally unsafe for them.`,
      'Saturn_opposition_Moon': `Saturn opposing ${personName}'s Moon creates emotional distance. They're building walls. ${partnerName} can't reach them the usual ways. Patience and consistency - not pressure - are needed.`,
      'Saturn_conjunction_Venus': `Saturn has arrived at ${personName}'s Venus. Love feels blocked, heavy, or obligatory. They may question if they're lovable or if this relationship is worth the work. Don't take their distance personally.`,
      'Saturn_square_Venus': `Saturn squaring ${personName}'s Venus is testing their capacity for love. Everything romantic feels like effort. They may feel unappreciated or that their love isn't good enough. Affirmation helps.`,
      'Saturn_opposition_Venus': `Saturn opposing ${personName}'s Venus puts love under scrutiny. Is this relationship real or just comfortable? They're weighing costs and benefits. The romance feels gone.`,
      'Saturn_conjunction_Mars': `Saturn is crushing ${personName}'s Mars. Their drive, desire, and will are blocked. Sexually, they may be disinterested or frustrated. Actions don't get results. Patience is required.`,
      'Saturn_square_Mars': `Saturn squaring ${personName}'s Mars creates constant frustration. Everything they try to do gets blocked. Anger simmers. They may take it out on ${partnerName}. Let them vent safely.`,
      
      // Uranus transits
      'Uranus_conjunction_Sun': `Uranus has electrified ${personName}'s Sun. They're waking up to who they really are - and it might not match who they've been in this relationship. Expect sudden changes, restlessness, and a need for authenticity.`,
      'Uranus_square_Sun': `Uranus is disrupting ${personName}'s identity. They're rebelling against expectations, including yours. The person you knew is changing. Flexibility from ${partnerName} is essential.`,
      'Uranus_opposition_Sun': `Uranus opposing ${personName}'s Sun is revolutionary energy. They're breaking free of old versions of themselves. This can feel destabilizing for the relationship. Evolution or separation - those are the options.`,
      'Uranus_conjunction_Moon': `Uranus has hit ${personName}'s Moon. Their emotions are erratic, unpredictable. They need freedom to feel differently than before. Don't try to stabilize them - ride the wave.`,
      'Uranus_square_Moon': `Uranus squaring ${personName}'s Moon creates emotional chaos. They don't know what they feel. The familiar is suddenly boring. They may seek excitement elsewhere or create drama at home.`,
      'Uranus_conjunction_Venus': `Uranus conjunct ${personName}'s Venus is love revolution. What they want in love is changing rapidly. They may be attracted to different types of people or relationship structures. ${partnerName}, reinvent or risk losing them.`,
      'Uranus_square_Venus': `Uranus squaring ${personName}'s Venus creates relationship restlessness. The status quo is unbearable. They want excitement, novelty, freedom. Boredom is the enemy now.`,
      'Uranus_opposition_Venus': `Uranus opposing ${personName}'s Venus is a fork in the road. Stay and revolutionize the relationship, or leave for something completely different. The old ways of loving aren't working.`,
      
      // Pluto transits
      'Pluto_conjunction_Sun': `Pluto has arrived at ${personName}'s Sun. This is death and rebirth of identity. They're going through hell to come out transformed. The person on the other side won't be the same. ${partnerName}, witness this but don't try to control it.`,
      'Pluto_square_Sun': `Pluto squaring ${personName}'s Sun is a power crisis. They're being forced to claim their power or have it stripped away. Watch for control issues, manipulation, or obsessive behavior.`,
      'Pluto_conjunction_Moon': `Pluto on ${personName}'s Moon is emotional transformation at the deepest level. Old wounds surface. Childhood pain emerges. The relationship may become the container for this healing - or the casualty.`,
      'Pluto_square_Moon': `Pluto squaring ${personName}'s Moon brings intense, sometimes frightening emotions. Jealousy, possessiveness, or emotional manipulation may appear. Deep therapy is recommended.`,
      'Pluto_conjunction_Venus': `Pluto has merged with ${personName}'s Venus. Love becomes obsessive, consuming, transformative. They may become possessive or attract intense situations. The relationship can't stay the same.`,
      'Pluto_square_Venus': `Pluto squaring ${personName}'s Venus creates love crisis. Power struggles, jealousy, and intensity. The shadows of relating are exposed. This is make-or-break territory.`,
      
      // Jupiter transits
      'Jupiter_conjunction_Sun': `Jupiter is blessing ${personName}'s Sun. They feel optimistic, expansive, lucky. Good time for the relationship to grow. Their confidence helps everyone.`,
      'Jupiter_trine_Sun': `Jupiter trining ${personName}'s Sun is pure grace. Things flow. They feel good about themselves and the relationship. Enjoy this!`,
      'Jupiter_conjunction_Moon': `Jupiter on ${personName}'s Moon expands their emotional capacity. They feel generous, nurturing, optimistic. The relationship benefits from this emotional abundance.`,
      'Jupiter_conjunction_Venus': `Jupiter conjunct ${personName}'s Venus is love expansion. Their heart is open, generous, seeking joy. Romance flows naturally. Great time for the relationship.`,
      'Jupiter_trine_Venus': `Jupiter trining ${personName}'s Venus is easy love. Appreciation flows. They see the best in ${partnerName} and the relationship. Gratitude and growth.`,
      
      // Neptune transits
      'Neptune_conjunction_Sun': `Neptune is dissolving ${personName}'s boundaries. They may seem foggy, confused, or lost. Spiritual awakening or escapism - hard to tell which. Stay grounded for them.`,
      'Neptune_square_Sun': `Neptune squaring ${personName}'s Sun creates identity confusion. Who are they really? They may deceive themselves or others. Reality checks needed.`,
      'Neptune_conjunction_Venus': `Neptune conjunct ${personName}'s Venus is romantic fog. Everything seems magical but may not be real. Beautiful illusions. Enjoy but don't make permanent decisions.`,
      'Neptune_square_Venus': `Neptune squaring ${personName}'s Venus distorts love perception. They may idealize you or see things that aren't there. Gentle reality checks help.`,
      
      // Mars transits
      'Mars_conjunction_Sun': `Mars is energizing ${personName}'s Sun. High energy, drive, possibly aggression. They're ready to take action. Channel this into shared projects or passion.`,
      'Mars_square_Sun': `Mars squaring ${personName}'s Sun creates friction. They're frustrated, irritable, ready to fight. Pick your battles - or help them release energy constructively.`,
      'Mars_conjunction_Venus': `Mars conjunct ${personName}'s Venus is pure desire. Sexual chemistry is high. They're feeling attractive and attracted. Great time for passion.`,
      'Mars_square_Venus': `Mars squaring ${personName}'s Venus is frustrated desire. They want connection but it's not flowing. Sexual tension with no release. Arguments about intimacy possible.`,
      'Mars_conjunction_Moon': `Mars is hitting ${personName}'s Moon. Emotions run hot. They may be irritable, defensive, or passionately expressive. Handle with care.`,
      'Mars_square_Moon': `Mars squaring ${personName}'s Moon creates emotional volatility. Quick to anger, easily hurt. Arguments flare up fast. Cooling-off periods help.`,
      
      // Venus transits
      'Venus_conjunction_Sun': `Venus is gracing ${personName}'s Sun. They feel attractive, loving, harmonious. Good time for romance and appreciation.`,
      'Venus_conjunction_Moon': `Venus conjunct ${personName}'s Moon is emotional sweetness. They feel loved and loving. Nurturing energy flows. Enjoy the tenderness.`,
      'Venus_trine_Moon': `Venus trining ${personName}'s Moon creates emotional harmony. Love flows naturally. The relationship feels easy and sweet.`,
      
      // Sun transits
      'Sun_conjunction_Venus': `The Sun is illuminating ${personName}'s Venus. Love and beauty are in focus. They want appreciation, romance, nice things. Shower them with attention.`,
      'Sun_square_Venus': `The Sun squaring ${personName}'s Venus creates tension around love and values. They may feel undervalued or struggle to express affection. Small gestures help.`,
      'Sun_conjunction_Moon': `The Sun conjunct ${personName}'s Moon aligns their identity and emotions. They feel whole, integrated. Good time for meaningful connection.`,
      'Sun_opposition_Saturn': `The Sun opposing ${personName}'s Saturn brings challenges with authority or responsibility. They may feel burdened or criticized by life. Support without adding pressure.`,
      
      // Mercury transits
      'Mercury_conjunction_Moon': `Mercury is activating ${personName}'s Moon. Emotions want to be talked about. Good time for heart-to-heart conversations.`,
      'Mercury_square_Moon': `Mercury squaring ${personName}'s Moon creates communication-emotion disconnect. What they say and feel don't match. Listen for the feelings underneath.`,
      'Mercury_conjunction_Venus': `Mercury conjunct ${personName}'s Venus is sweet communication. Love words flow. Good time for expressing affection verbally.`,
      'Mercury_square_Mars': `Mercury squaring ${personName}'s Mars sharpens their tongue. Arguments likely. Words can wound. Think before responding.`
    };
    
    const key = `${transitPlanet}_${aspectType}_${transitedPlanet}`;
    return narratives[key] || `${transitPlanet} is ${aspectType} ${personName}'s ${transitedPlanet}. This activates their ${transitedPlanet.toLowerCase()} energy and affects how they show up in the relationship.`;
  }

  /**
   * Generate default interpretation for missing combinations
   */
  private static generateDefaultInterpretation(
    transitPlanet: string,
    aspectType: string,
    transitedPlanet: string
  ): { transited: string; other: string } {
    const planetEnergies: Record<string, string> = {
      'Saturn': 'restriction, testing, maturity',
      'Uranus': 'sudden change, freedom, awakening',
      'Neptune': 'confusion, spirituality, illusion',
      'Pluto': 'transformation, power, intensity',
      'Jupiter': 'expansion, luck, growth',
      'Mars': 'action, desire, conflict',
      'Venus': 'love, beauty, harmony',
      'Sun': 'identity, vitality, ego',
      'Mercury': 'communication, thinking, connection',
      'Moon': 'emotions, needs, security'
    };
    
    const transitEnergy = planetEnergies[transitPlanet] || 'change';
    const natalEnergy = planetEnergies[transitedPlanet] || 'life energy';
    const aspectFlavor = ['conjunction', 'square', 'opposition'].includes(aspectType) ? 'intensely' : 'harmoniously';
    
    return {
      transited: `You're experiencing ${transitPlanet}'s energy (${transitEnergy}) ${aspectFlavor} affecting your ${transitedPlanet} (${natalEnergy}). This shift in your inner landscape affects how you show up in the relationship.`,
      other: `Your partner is going through a ${transitPlanet}-${transitedPlanet} transit. You may notice changes in their ${natalEnergy.split(',')[0]}. Give them space to process.`
    };
  }
  
  /**
   * Expanded transit interpretation library (100+ combinations)
   */
  private static getExpandedTransitInterpretations(): Record<string, { transited: string; other: string }> {
    return {
      // Saturn transits
      'Saturn_conjunction_Venus': {
        transited: 'You feel unable to express love freely. Your affection feels blocked or criticized. You question if you\'re lovable. The relationship feels like work.',
        other: 'They seem distant, cold, or unavailable. Their warmth has disappeared. You feel rejected or that they don\'t love you anymore. It\'s Saturn - not you.'
      },
      'Saturn_square_Venus': {
        transited: 'Your love feels rejected or not enough. You feel criticized for how you love. Timing is always off. You question your worthiness.',
        other: 'They\'re harder to reach emotionally. They seem unhappy or burdened by love. Your affection doesn\'t land the same way.'
      },
      'Saturn_opposition_Venus': {
        transited: 'You feel torn between love and responsibility. The relationship feels like an obligation. Reality is crushing romance.',
        other: 'They\'re pulling away or becoming overly serious. The fun is gone. They seem burdened by the relationship.'
      },
      'Saturn_conjunction_Mars': {
        transited: 'Your desire and drive feel blocked. You can\'t act on what you want. Sexual energy is low or frustrated. Everything is harder.',
        other: 'They seem less passionate or interested. Their drive has disappeared. They\'re not pursuing you or anything else.'
      },
      'Saturn_square_Mars': {
        transited: 'Everything you try to do is blocked. Your actions are criticized or fail. Sexual frustration is high. Anger builds.',
        other: 'They\'re irritable, frustrated, or passive-aggressive. Their energy is blocked and it shows.'
      },
      'Saturn_conjunction_Moon': {
        transited: 'You feel emotionally depressed, unsafe, or unloved. Your needs feel like burdens. Deep childhood wounds surface. The coldness is internal.',
        other: 'They\'re emotionally unavailable or depressed. You can\'t reach them. They seem numb or shut down. Just be present.'
      },
      'Saturn_square_Moon': {
        transited: 'Your emotions are constantly invalidated or criticized. You feel emotionally unsafe. You can\'t be yourself without judgment.',
        other: 'They\'re emotionally struggling in ways you can\'t fix. Nothing you do helps. They\'re going through deep emotional pain.'
      },
      'Saturn_conjunction_Sun': {
        transited: 'Your identity is being tested. You feel small, inadequate, unseen. Who you are isn\'t working anymore. Rebuild required.',
        other: 'They\'re going through an identity crisis. They seem diminished, serious, or lost. Support but don\'t try to fix.'
      },
      'Saturn_square_Sun': {
        transited: 'Every attempt to shine is blocked. You feel crushed by life. Confidence is at a low. The relationship may feel like part of the problem.',
        other: 'They\'re struggling with self-worth. They may seem defensive or defeated. Their light is dimmed right now.'
      },
      
      // Pluto transits
      'Pluto_conjunction_Venus': {
        transited: 'You\'re obsessed or consumed by love. Power and control issues surface. You can\'t love casually - it\'s all or nothing. Transformation through relationship.',
        other: 'They\'re intensely focused on you or the relationship - for better or worse. They may be obsessive or controlling. Powerful stuff.'
      },
      'Pluto_square_Venus': {
        transited: 'Power struggles over love. You feel controlled or you\'re trying to control. Jealousy and possessiveness emerge. This is crisis territory.',
        other: 'They\'re being controlling or are in relationship crisis. Jealousy or power issues are active. The relationship feels dangerous or consuming.'
      },
      'Pluto_conjunction_Mars': {
        transited: 'Sexual obsession or power. You want to dominate or be dominated. Intense transformation of desire and will. Dangerous but powerful.',
        other: 'Their desire is overwhelming or intimidating. Power and sex are mixed. Be careful but don\'t be afraid.'
      },
      'Pluto_square_Mars': {
        transited: 'Rage, power struggles, potential for destruction. Your will is being crushed or you\'re crushing others. Violence of emotion if not physical.',
        other: 'They\'re in dangerous emotional territory. Anger and power issues are active. They may be destructive. Create safe space.'
      },
      'Pluto_conjunction_Moon': {
        transited: 'Emotional transformation at the deepest level. Old wounds explode to the surface. You feel everything intensely. Catharsis or crisis.',
        other: 'They\'re going through emotional hell. Deep childhood stuff is surfacing. They need witness, not advice.'
      },
      'Pluto_square_Moon': {
        transited: 'Intense, sometimes frightening emotions take over. Jealousy, possessiveness, or emotional manipulation may emerge. This is shadow work.',
        other: 'They\'re in the grip of powerful emotions. They may be manipulative or triggered. Professional help may be needed.'
      },
      'Pluto_conjunction_Sun': {
        transited: 'Death and rebirth of identity. You\'re being torn apart to be rebuilt. Power crisis. Who you were is dying. Who you\'ll become is unknown.',
        other: 'They\'re going through profound transformation. The person you knew is changing. Witness this without trying to control it.'
      },
      
      // Uranus transits
      'Uranus_conjunction_Venus': {
        transited: 'Sudden changes in how you love. You crave freedom. The relationship feels restrictive. You want excitement, novelty, revolution. Breakthrough or breakup.',
        other: 'They\'ve changed suddenly. They want freedom or something radically new. They may leave or need the relationship to transform.'
      },
      'Uranus_square_Venus': {
        transited: 'You\'re rebelling against the relationship. You feel trapped. You want excitement elsewhere. Boredom is intolerable.',
        other: 'They\'re unpredictable and distant. They may be interested in someone else or just need space. The relationship is unstable.'
      },
      'Uranus_opposition_Venus': {
        transited: 'Sudden awareness that you want different things. You need freedom. Major relationship changes are coming. Evolution or ending.',
        other: 'They suddenly see things differently. They may want out or a complete overhaul. Brace for change.'
      },
      'Uranus_conjunction_Moon': {
        transited: 'Emotional revolution. Your needs have changed overnight. What used to comfort you doesn\'t anymore. You need freedom to feel.',
        other: 'They\'re emotionally erratic and unpredictable. What they needed yesterday isn\'t what they need today. Flexibility required.'
      },
      'Uranus_square_Moon': {
        transited: 'Emotional chaos. You don\'t know what you feel. The familiar is suddenly boring or wrong. You may create drama to feel alive.',
        other: 'They\'re emotionally unstable in ways that affect you. They may pick fights or seek excitement. Stay calm as they ride this out.'
      },
      'Uranus_conjunction_Sun': {
        transited: 'Identity revolution. You\'re waking up to who you really are, and it might not match who you\'ve been. Authenticity demands emerge.',
        other: 'They\'re becoming a different person before your eyes. Exciting or scary depending on your flexibility.'
      },
      'Uranus_square_Sun': {
        transited: 'Rebellion against all expectations, including your own. You\'re breaking free of old patterns. Disruption is necessary.',
        other: 'They\'re rebelling. Against you, against life, against their old self. Don\'t take it personally - ride the wave.'
      },
      
      // Jupiter transits
      'Jupiter_conjunction_Venus': {
        transited: 'You feel generous, optimistic, and expansive in love. Your heart is open wide. Beautiful time for romance and appreciation.',
        other: 'They\'re loving, generous, and happy. They appreciate you more. Good energy flows between you.'
      },
      'Jupiter_trine_Venus': {
        transited: 'Love flows easily. You feel blessed and grateful. The relationship brings joy. Everything romantic feels touched by grace.',
        other: 'They\'re in a great mood for love. Things are easy between you. Enjoy this sweet period.'
      },
      'Jupiter_conjunction_Mars': {
        transited: 'Your desire and confidence are high. You pursue what you want with optimism. Sexual energy is strong and positive.',
        other: 'They\'re confident and energetic. They\'re pursuing you or shared goals with enthusiasm. Great chemistry.'
      },
      'Jupiter_conjunction_Moon': {
        transited: 'Emotional expansion and generosity. You feel abundant inside. Your nurturing capacity is high. Share the wealth.',
        other: 'They\'re emotionally generous and open. Their good mood lifts you both. Receive their gifts.'
      },
      'Jupiter_trine_Moon': {
        transited: 'Emotional grace and ease. You feel lucky in love. Your needs are being met. Gratitude flows naturally.',
        other: 'They\'re emotionally content and it shows. The relationship feels blessed right now.'
      },
      'Jupiter_conjunction_Sun': {
        transited: 'You feel expansive, lucky, and optimistic. Your confidence is high. Good time to grow together.',
        other: 'They\'re glowing with positivity. Their good energy lifts the relationship.'
      },
      
      // Neptune transits
      'Neptune_conjunction_Venus': {
        transited: 'You\'re in a romantic fog. They seem perfect. Reality is blurred by beautiful illusion. Enjoy but verify.',
        other: 'They\'re idealizing you or the relationship. They may not see you clearly. Beautiful but maybe not real.'
      },
      'Neptune_square_Venus': {
        transited: 'Confusion about love. Are you in love or deluded? Disappointment may come later. You\'re seeing what you want to see.',
        other: 'They\'re confused or possibly deceiving themselves (or you). Something isn\'t as it seems. Trust your instincts.'
      },
      'Neptune_conjunction_Moon': {
        transited: 'Emotions are dissolved, dreamy, or confused. You may feel lost or spiritually connected. Boundaries are thin.',
        other: 'They seem spacey or in another world. Their emotions don\'t make sense. They may need to escape.'
      },
      'Neptune_square_Moon': {
        transited: 'Emotional confusion and possibly deception - of self or others. Something isn\'t real. Check in with trusted people.',
        other: 'They\'re not being straight with you or themselves. Something\'s off. Don\'t ignore your intuition.'
      },
      'Neptune_conjunction_Sun': {
        transited: 'Identity dissolution. Who are you really? Ego is dissolving for spiritual growth or for escape. Both possible.',
        other: 'They seem lost, foggy, or transcendent. Hard to pin down. They may be using substances or spirituality to escape.'
      },
      
      // Mars transits
      'Mars_conjunction_Venus': {
        transited: 'Sexual chemistry is very high. You feel desired and desiring. Passion, attraction, action. Hot times.',
        other: 'They\'re pursuing you intensely. Sexual energy is high. Passionate period - enjoy it.'
      },
      'Mars_square_Venus': {
        transited: 'Sexual tension with frustration. You want them but timing is off. Passion mixed with conflict.',
        other: 'They\'re attracted but frustrated. Sexual tension that may come out as arguments. Address the real issue.'
      },
      'Mars_conjunction_Mars': {
        transited: 'High energy match. You\'re either perfectly in sync or battling for dominance. Same drive, different directions.',
        other: 'They match your energy exactly. Exhilarating or competitive depending on direction.'
      },
      'Mars_square_Mars': {
        transited: 'Your desires clash directly. When you want to go, they want to stop. Conflict is almost guaranteed.',
        other: 'They\'re fighting against your energy or desires. Arguments about direction. Find common ground.'
      },
      'Mars_conjunction_Moon': {
        transited: 'Emotions run hot. You\'re passionate, maybe irritable. Quick to feel, quick to act on feelings.',
        other: 'They\'re emotionally heated. May be snappy or passionate. Handle with care but don\'t be afraid.'
      },
      'Mars_square_Moon': {
        transited: 'Emotional volatility. Quick anger, quick hurt. Arguments flare up and cool down fast.',
        other: 'They\'re touchy and reactive. Give them space to cool down. Don\'t poke the bear.'
      },
      
      // Venus transits
      'Venus_conjunction_Moon': {
        transited: 'Emotional sweetness flows. You feel loved and loving. Nurturing energy is high. Share the tenderness.',
        other: 'They\'re in a loving, gentle mood. Good time for connection and care.'
      },
      'Venus_trine_Moon': {
        transited: 'Emotions and love harmonize beautifully. You feel blessed in relationship. Grace period.',
        other: 'They\'re easy to be with. Love flows without effort. Enjoy the harmony.'
      },
      'Venus_conjunction_Sun': {
        transited: 'You feel attractive and appreciated. Love and identity align. You shine in relationship.',
        other: 'They\'re radiating charm and love. They make you feel special. Receive it.'
      },
      
      // Sun transits
      'Sun_conjunction_Venus': {
        transited: 'Love is illuminated. You\'re focused on beauty, harmony, and appreciation. Romantic spotlight.',
        other: 'They want love attention. Good time to show appreciation.'
      },
      'Sun_conjunction_Moon': {
        transited: 'Identity and emotions align. You feel whole and integrated. Good day for meaningful connection.',
        other: 'They\'re centered and emotionally present. Good time for real talk.'
      },
      
      // Mercury transits
      'Mercury_conjunction_Moon': {
        transited: 'Emotions want to be spoken. Good time for heart-to-heart talks. Feelings have words.',
        other: 'They want to talk about feelings. Listen actively. Communication heals.'
      },
      'Mercury_square_Moon': {
        transited: 'What you say and what you feel don\'t match. Communication frustrates. Slow down.',
        other: 'Their words and feelings are disconnected. Listen for the meaning underneath.'
      },
      'Mercury_conjunction_Venus': {
        transited: 'Sweet words flow. Good time to express love verbally. Charm and grace in communication.',
        other: 'They\'re expressing love beautifully. Receive their words as gifts.'
      },
      'Mercury_square_Mars': {
        transited: 'Words are sharp. Arguments likely. Think before speaking. Hot takes may burn.',
        other: 'They\'re ready to argue. Pick your battles. Some conflicts aren\'t worth it.'
      }
    };
  }
  
  /**
   * Calculate intensity with additional factors
   */
  private static calculateIntensity(
    transitPlanet: string,
    aspectType: string,
    synastryAspect: SynastryAspect,
    transitedPlanet?: string
  ): number {
    
    let intensity = 4;
    
    // Outer planets are more intense
    if (['Saturn', 'Uranus', 'Neptune', 'Pluto'].includes(transitPlanet)) {
      intensity += 3;
    } else if (['Jupiter', 'Mars'].includes(transitPlanet)) {
      intensity += 2;
    }
    
    // Hard aspects are more intense
    if (['conjunction', 'square', 'opposition'].includes(aspectType)) {
      intensity += 2;
    }
    
    // Personal planets being transited are more felt
    if (transitedPlanet && ['Sun', 'Moon', 'Venus', 'Mars'].includes(transitedPlanet)) {
      intensity += 1;
    }
    
    // Venus-Mars synastry aspects are relationship-critical
    if ((synastryAspect.person1Planet === 'Venus' && synastryAspect.person2Planet === 'Mars') ||
        (synastryAspect.person1Planet === 'Mars' && synastryAspect.person2Planet === 'Venus')) {
      intensity += 1;
    }
    
    // Moon involvement adds emotional intensity
    if ([synastryAspect.person1Planet, synastryAspect.person2Planet].includes('Moon') ||
        transitedPlanet === 'Moon') {
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
   * Generate monthly summary with narrative voice
   */
  private static generateMonthlySummary(
    events: TransitEvent[],
    synastryAspects: SynastryAspect[],
    person1Name: string,
    person2Name: string
  ): string {
    
    if (events.length === 0) {
      // Describe baseline dynamics when no major transits
      const coreAspect = synastryAspects[0];
      if (coreAspect) {
        return `A quieter month without major astrological triggers. The relationship continues operating on its baseline dynamic - the ${coreAspect.person1Planet}-${coreAspect.person2Planet} ${coreAspect.aspectType} between you. Use this stable period to strengthen your foundation and enjoy each other without cosmic interference.`;
      }
      return 'A calm month with no major planetary pressure on the relationship. Use this peace to connect, rest, and appreciate what you\'ve built together.';
    }
    
    // Build narrative based on top events
    const topEvent = events[0];
    const secondEvent = events[1];
    
    let narrative = '';
    
    if (topEvent.intensity >= 8) {
      narrative = `This is an INTENSE month. ${topEvent.interpretation} `;
      if (secondEvent && secondEvent.intensity >= 6) {
        narrative += `Adding to this, ${secondEvent.transitPlanet} is also active, creating a layered challenge and opportunity for growth.`;
      } else {
        narrative += `This transit demands your full attention. The relationship is being tested and transformed.`;
      }
    } else if (topEvent.intensity >= 6) {
      narrative = `Significant energy is moving through the relationship. ${topEvent.interpretation} `;
      if (events.length > 2) {
        narrative += `With ${events.length} active transits, there's a lot happening beneath the surface.`;
      }
    } else {
      narrative = `The relationship has some astrological activity this month, but nothing overwhelming. ${topEvent.transitPlanet} is making contact, bringing ${this.getPlanetKeyword(topEvent.transitPlanet)} energy into focus. Stay aware but don't worry.`;
    }
    
    return narrative;
  }

  /**
   * Get planet keyword for summaries
   */
  private static getPlanetKeyword(planet: string): string {
    const keywords: Record<string, string> = {
      'Saturn': 'testing and maturity',
      'Uranus': 'change and freedom',
      'Neptune': 'dreamy and confusing',
      'Pluto': 'transformative and intense',
      'Jupiter': 'expansive and lucky',
      'Mars': 'passionate and conflicted',
      'Venus': 'loving and harmonious',
      'Sun': 'vitalizing and ego-focused',
      'Mercury': 'communicative and mental',
      'Moon': 'emotional and nurturing'
    };
    return keywords[planet] || 'shifting';
  }
  
  /**
   * Generate person summary with narrative
   */
  private static generatePersonSummary(
    events: TransitEvent[],
    person: 'person1' | 'person2',
    personName: string
  ): string {
    
    const personEvents = events.filter(e => e.whoFeelsItMore === person || e.whoFeelsItMore === 'both');
    
    if (personEvents.length === 0) {
      return `${personName} has a relatively calm month astrologically. They're not the focus of major transits, so they may be more of a witness to their partner's process. Good time to be supportive.`;
    }
    
    const topEvent = personEvents[0];
    const experience = person === 'person1' ? topEvent.person1Experience : topEvent.person2Experience;
    
    if (personEvents.length > 2) {
      return `${experience} With ${personEvents.length} transits hitting ${personName}'s chart, they're going through a lot this month.`;
    }
    
    return experience;
  }
  
  /**
   * Generate advice with professional voice
   */
  private static generateAdvice(events: TransitEvent[]): string {
    
    if (events.length === 0) {
      return 'Enjoy the calm. Use this peace to strengthen your bond through quality time, meaningful conversation, and physical affection. No cosmic pressure means you can just BE together without working through anything.';
    }
    
    const topEvent = events[0];
    
    const adviceMap: Record<string, string> = {
      'Saturn': 'Saturn is testing this relationship. This is not the time for romance - it\'s the time for reality. Face what\'s not working honestly. Do the necessary repairs or make the hard decision. Maturity, patience, and honesty are your tools. Shortcuts will backfire.',
      'Pluto': 'Deep transformation is happening whether you want it or not. Don\'t resist - you can\'t win against Pluto. Surrender control. Look at your shadows. Power struggles will destroy; vulnerability will strengthen. Something must die for something real to be born.',
      'Uranus': 'Expect the unexpected. Uranus demands authenticity and freedom. If the relationship feels like a cage, something will break. Stay flexible. Be willing to revolutionize how you do things. Breakthrough or breakup energy is high.',
      'Neptune': 'Reality check time. Are you seeing clearly? Neptune can bring beautiful connection OR complete delusion. Trust your gut but verify the facts. Don\'t make permanent decisions in temporary fog. Spiritual connection is possible if you stay grounded.',
      'Jupiter': 'Lucky period for the relationship. Doors open. Joy is available. Don\'t take this for granted - actively expand together. Travel, learn, grow. Share your optimism. Watch for overindulgence but otherwise ride this wave of grace.',
      'Mars': 'Energy is high. Use it for passion, not war. If conflict arises, fight fair and make up well. Sexual energy can be channeled or can become destructive. Physical activity together helps. Don\'t let anger fester.',
      'Venus': 'Love is flowing. Make the most of this harmonious period. Express appreciation. Create beauty together. Romance is easy now. Store up this good energy for harder times.',
      'Sun': 'Identity and ego are in focus. Make sure both partners feel seen and valued. Don\'t compete for spotlight - take turns shining. Support each other\'s individual expression.',
      'Mercury': 'Communication is key this month. Talk things through. Listen actively. Misunderstandings are possible - clarify intentions. Write love letters. Have the conversations you\'ve been avoiding.'
    };
    
    return adviceMap[topEvent.transitPlanet] || 'Navigate this period with awareness and compassion. What\'s being activated is part of your growth journey together.';
  }
  
  /**
   * Identify karmic patterns
   */
  static identifyKarmicPatterns(synastryAspects: SynastryAspect[]): KarmicAnalysis {
    
    const indicators: string[] = [];
    
    synastryAspects.forEach(aspect => {
      if (aspect.person1Planet === 'South Node' || aspect.person2Planet === 'South Node') {
        indicators.push(`${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspectType}: Past life connection. You've been together before. Familiar but potentially stagnating.`);
      }
      if (aspect.person1Planet === 'North Node' || aspect.person2Planet === 'North Node') {
        indicators.push(`${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspectType}: Soul growth mission. This relationship pushes you toward your destiny.`);
      }
      
      if ((aspect.person1Planet === 'Saturn' || aspect.person2Planet === 'Saturn') &&
          ['conjunction', 'square', 'opposition'].includes(aspect.aspectType)) {
        indicators.push(`${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspectType}: Karmic lesson and testing. You're here to teach each other about maturity, commitment, and boundaries.`);
      }
      
      if ((aspect.person1Planet === 'Pluto' || aspect.person2Planet === 'Pluto') &&
          ['conjunction', 'square'].includes(aspect.aspectType)) {
        indicators.push(`${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspectType}: Transformative karmic bond. This relationship will change you both profoundly.`);
      }
      
      if (aspect.person1Planet === 'Chiron' || aspect.person2Planet === 'Chiron') {
        indicators.push(`${aspect.person1Planet}-${aspect.person2Planet} ${aspect.aspectType}: Healing wound karma. You've come together to heal each other's deepest wounds.`);
      }
    });
    
    const isKarmic = indicators.length > 0;
    
    let description = '';
    if (isKarmic) {
      if (indicators.length >= 3) {
        description = 'HIGHLY KARMIC relationship. Your souls have history. This connection exists to complete unfinished business, heal old wounds, and evolve both of you. The intensity you feel is recognition across time. This is not random - you were meant to meet.';
      } else if (indicators.length >= 1) {
        description = 'Karmic elements are present. This relationship carries lessons from beyond this lifetime. Pay attention to what triggers you - that\'s where the growth is.';
      }
    } else {
      description = 'Not primarily karmic. This is a fresh connection based on present-life compatibility and conscious choice. You have more freedom to shape this as you wish, without past-life baggage.';
    }
    
    return { isKarmic, karmicIndicators: indicators, description };
  }
}

export type { BirthChart, SynastryAspect, RelationshipOverview, AttractionAnalysis, ChallengeAnalysis, BreakupAnalysis };
