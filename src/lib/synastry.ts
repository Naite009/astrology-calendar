/**
 * Synastry Analysis Library
 * 
 * Analyzes astrological compatibility between two natal charts,
 * focusing on major romantic/relationship aspects.
 */

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

// Zodiac sign order for degree conversion
const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

export interface SynastryAspect {
  planet1: string;
  planet1Owner: string;
  planet2: string;
  planet2Owner: string;
  aspectType: string;
  orb: number;
  category: 'passion' | 'emotional' | 'mental' | 'karmic' | 'growth';
  significance: 'major' | 'moderate' | 'minor';
  interpretation: string;
  isHarmonious: boolean;
}

export interface SynastryReport {
  overallScore: number;
  passionScore: number;
  emotionalScore: number;
  mentalScore: number;
  karmicScore: number;
  aspects: SynastryAspect[];
  summary: string;
  strengths: string[];
  challenges: string[];
  soulContract: string;
}

import { getEffectiveOrb } from './aspectOrbs';

// Aspect types with their angles and base orbs (effective orb computed per planet pair)
const ASPECT_DEFINITIONS = {
  conjunction: { angle: 0, orb: 8, symbol: '☌', harmonious: null },
  opposition: { angle: 180, orb: 7, symbol: '☍', harmonious: false },
  trine: { angle: 120, orb: 7, symbol: '△', harmonious: true },
  square: { angle: 90, orb: 7, symbol: '□', harmonious: false },
  sextile: { angle: 60, orb: 5, symbol: '⚹', harmonious: true },
  quincunx: { angle: 150, orb: 3, symbol: '⚻', harmonious: false },
  semisextile: { angle: 30, orb: 2, symbol: '⚺', harmonious: true }
};

// Key romantic planet pairs and their interpretations
const SYNASTRY_INTERPRETATIONS: Record<string, Record<string, { category: SynastryAspect['category']; significance: SynastryAspect['significance']; interpretations: Record<string, string> }>> = {
  'Sun-Moon': {
    default: {
      category: 'emotional',
      significance: 'major',
      interpretations: {
        conjunction: "Deep soul recognition. You feel instantly understood. This is a 'meant to be' connection where your core identities merge.",
        opposition: "Magnetic attraction of opposites. You complete each other but must balance independence with togetherness.",
        trine: "Natural harmony between will and emotion. You support each other's goals while nurturing emotional needs.",
        square: "Creative tension. Your needs may clash, but this friction sparks growth and keeps the relationship dynamic.",
        sextile: "Easy rapport. You communicate your needs well and find comfortable compromise."
      }
    }
  },
  'Venus-Mars': {
    default: {
      category: 'passion',
      significance: 'major',
      interpretations: {
        conjunction: "Explosive chemistry! Love and desire merge perfectly. Strong physical and romantic attraction that rarely dims.",
        opposition: "Irresistible magnetic pull. The attraction is electric but can swing between passion and conflict.",
        trine: "Natural romantic and sexual harmony. Desire flows easily between you without games or struggle.",
        square: "Hot and challenging! The tension creates intense attraction but may lead to push-pull dynamics.",
        sextile: "Gentle, building attraction. Chemistry develops through effort and grows over time."
      }
    }
  },
  'Moon-Moon': {
    default: {
      category: 'emotional',
      significance: 'major',
      interpretations: {
        conjunction: "Emotional twins. You instinctively understand each other's moods, needs, and inner world.",
        opposition: "Emotional opposites that attract. You process feelings differently but can learn from each other.",
        trine: "Natural emotional flow. You feel at home with each other and provide mutual nurturing.",
        square: "Emotional friction. Your comfort zones differ, requiring conscious effort to meet each other's needs.",
        sextile: "Compatible emotional styles with room for growth and understanding."
      }
    }
  },
  'Venus-Venus': {
    default: {
      category: 'emotional',
      significance: 'moderate',
      interpretations: {
        conjunction: "You love in the same way. Shared values, aesthetics, and romantic languages.",
        opposition: "Attracted to opposite expressions of love. Can complement or clash depending on awareness.",
        trine: "Harmonious affection. You appreciate and express love in compatible ways.",
        square: "Different love languages create friction. Learning each other's style is essential.",
        sextile: "Easy appreciation for each other's way of loving."
      }
    }
  },
  'Mars-Mars': {
    default: {
      category: 'passion',
      significance: 'moderate',
      interpretations: {
        conjunction: "Powerful drive together! Can be competitive or collaborative. Energy amplifies.",
        opposition: "Action styles clash. Learning to work as a team vs. opponents is key.",
        trine: "Energies flow well together. You motivate each other and share drive.",
        square: "Sparks fly! Can be combative but also incredibly stimulating if channeled well.",
        sextile: "Supportive energy exchange. You encourage each other's ambitions."
      }
    }
  },
  'Sun-Venus': {
    default: {
      category: 'emotional',
      significance: 'major',
      interpretations: {
        conjunction: "The Venus person adores the Sun person, who feels deeply appreciated and loved.",
        opposition: "Strong attraction with potential for the Venus person to over-idealize.",
        trine: "Natural affection and admiration. The relationship feels good and loving.",
        square: "Love exists but expressing it may create friction or misunderstanding.",
        sextile: "Gentle appreciation. Love grows through shared experiences."
      }
    }
  },
  'Sun-Mars': {
    default: {
      category: 'passion',
      significance: 'moderate',
      interpretations: {
        conjunction: "High energy dynamic! Mars energizes Sun's identity. Can be competitive or inspiring.",
        opposition: "Strong attraction with power dynamics to navigate.",
        trine: "You energize and support each other's goals and identity.",
        square: "Ego clashes possible but creates dynamic sexual tension.",
        sextile: "Mutual encouragement. You push each other toward action."
      }
    }
  },
  'Moon-Venus': {
    default: {
      category: 'emotional',
      significance: 'major',
      interpretations: {
        conjunction: "Deep emotional and romantic connection. Comfort and love intertwine beautifully.",
        opposition: "Strong attraction with some emotional adjustment needed.",
        trine: "Natural nurturing love. You feel safe and adored together.",
        square: "Love is present but emotional needs may not align perfectly.",
        sextile: "Sweet, growing affection. Comfort develops over time."
      }
    }
  },
  'Moon-Mars': {
    default: {
      category: 'passion',
      significance: 'moderate',
      interpretations: {
        conjunction: "Intense emotional-physical connection. Mars stirs Moon's emotions deeply.",
        opposition: "Strong attraction but emotions can be triggered. Requires awareness.",
        trine: "Emotions and action align well. Protective and passionate dynamic.",
        square: "Emotional buttons get pushed. Hot but requires patience.",
        sextile: "Stimulating emotional exchange. Energy flows with effort."
      }
    }
  },
  'Venus-Saturn': {
    default: {
      category: 'karmic',
      significance: 'major',
      interpretations: {
        conjunction: "Karmic love bond. Serious commitment potential but requires work.",
        opposition: "Love meets limitation. Important lessons about commitment and freedom.",
        trine: "Stable, lasting love. Saturn provides structure Venus appreciates.",
        square: "Love feels blocked or tested. Patience and maturity needed.",
        sextile: "Responsible love that grows stronger over time."
      }
    }
  },
  'Sun-Saturn': {
    default: {
      category: 'karmic',
      significance: 'moderate',
      interpretations: {
        conjunction: "Karmic teacher dynamic. Saturn may feel limiting to Sun but offers wisdom.",
        opposition: "Authority dynamics to work through. Can build lasting structure.",
        trine: "Mutual respect and realistic goals together.",
        square: "Ego meets restriction. Growth through patience.",
        sextile: "Supportive structure. You help each other mature."
      }
    }
  },
  'Moon-Saturn': {
    default: {
      category: 'karmic',
      significance: 'moderate',
      interpretations: {
        conjunction: "Emotional security through commitment. Can feel heavy but stabilizing.",
        opposition: "Emotional needs meet structure. Learning to feel safe while respecting limits.",
        trine: "Emotional maturity supports the bond. Lasting comfort.",
        square: "Emotional walls to work through. Patience builds trust.",
        sextile: "Growing emotional security through reliability."
      }
    }
  },
  'Venus-Pluto': {
    default: {
      category: 'passion',
      significance: 'major',
      interpretations: {
        conjunction: "Transformative, obsessive attraction. Love changes you both forever.",
        opposition: "Intense magnetic pull with power dynamics. All-consuming passion.",
        trine: "Deep, empowering love. Transformation through intimacy.",
        square: "Intense but challenging. Power struggles in love. Transformative if navigated.",
        sextile: "Gradual deepening. Intimacy transforms over time."
      }
    }
  },
  'Mars-Pluto': {
    default: {
      category: 'passion',
      significance: 'major',
      interpretations: {
        conjunction: "Explosive passion and power. Incredibly intense physical connection.",
        opposition: "Power struggles meet desire. Magnetic but volatile.",
        trine: "Powerful drive together. You amplify each other's strength.",
        square: "Intense power dynamics. Can be combative or deeply transformative.",
        sextile: "Building power together. Joint ambitions intensify."
      }
    }
  },
  'Venus-Neptune': {
    default: {
      category: 'emotional',
      significance: 'moderate',
      interpretations: {
        conjunction: "Soulmate feeling. Idealized, spiritual love. Watch for illusion.",
        opposition: "Romantic dreams meet reality. Beautiful but needs grounding.",
        trine: "Spiritual, artistic love connection. Dream-like romance.",
        square: "Illusion in love. Beautiful fantasies but clarity needed.",
        sextile: "Gentle, imaginative connection. Romance has a fairy-tale quality."
      }
    }
  },
  'Sun-Pluto': {
    default: {
      category: 'karmic',
      significance: 'major',
      interpretations: {
        conjunction: "Transformative power dynamic. Pluto sees through Sun completely.",
        opposition: "Intense power dynamics. Transformation through relationship.",
        trine: "Empowering connection. You strengthen each other.",
        square: "Power struggles but profound growth potential.",
        sextile: "Gradual empowerment. You help each other evolve."
      }
    }
  },
  'Moon-Pluto': {
    default: {
      category: 'emotional',
      significance: 'major',
      interpretations: {
        conjunction: "Deep emotional-psychological bond. Intense, transformative intimacy.",
        opposition: "Emotional intensity and power dynamics. Very deep connection.",
        trine: "Profound emotional understanding. Healing through love.",
        square: "Emotional intensity can be overwhelming. Deep but challenging.",
        sextile: "Deepening emotional intimacy over time."
      }
    }
  },
  'Venus-Uranus': {
    default: {
      category: 'growth',
      significance: 'moderate',
      interpretations: {
        conjunction: "Electric, unconventional attraction. Love is exciting but unpredictable.",
        opposition: "Attraction to freedom. Needs space within relationship.",
        trine: "Exciting, liberating love. You keep each other fresh.",
        square: "On-again, off-again energy. Exciting but unstable.",
        sextile: "Keeps romance interesting. Openness to new experiences."
      }
    }
  },
  'Mercury-Mercury': {
    default: {
      category: 'mental',
      significance: 'moderate',
      interpretations: {
        conjunction: "Think alike! Communication flows naturally.",
        opposition: "Different perspectives but stimulating conversation.",
        trine: "Easy understanding. Conversations feel effortless.",
        square: "Misunderstandings possible. Different thinking styles.",
        sextile: "Good communication with some effort."
      }
    }
  },
  'Sun-Jupiter': {
    default: {
      category: 'growth',
      significance: 'moderate',
      interpretations: {
        conjunction: "Joy and expansion together. Jupiter amplifies Sun's light.",
        opposition: "Growth through different philosophies. Big dreams together.",
        trine: "Natural luck and optimism together. You uplift each other.",
        square: "Over-promising possible. Keep expectations realistic.",
        sextile: "Supportive growth. You encourage each other's expansion."
      }
    }
  },
  'Moon-Jupiter': {
    default: {
      category: 'emotional',
      significance: 'moderate',
      interpretations: {
        conjunction: "Emotional abundance. You make each other feel emotionally rich.",
        opposition: "Different emotional philosophies but mutual growth.",
        trine: "Generosity and emotional warmth flow naturally.",
        square: "Emotional excess possible. Balance needed.",
        sextile: "Growing emotional generosity and support."
      }
    }
  },
  'Venus-Jupiter': {
    default: {
      category: 'emotional',
      significance: 'moderate',
      interpretations: {
        conjunction: "Love and luck combine! Generous, expansive affection.",
        opposition: "Big love with big expectations. Keep grounded.",
        trine: "Blessed love! Natural generosity and appreciation.",
        square: "Over-indulgence in love. Beautiful but needs moderation.",
        sextile: "Growing warmth and appreciation over time."
      }
    }
  },
  'North Node-Sun': {
    default: {
      category: 'karmic',
      significance: 'major',
      interpretations: {
        conjunction: "Destined meeting. Sun person embodies Node person's life path.",
        opposition: "Past life connection. Sun represents what to release.",
        trine: "Supportive of each other's destiny. Natural growth path.",
        square: "Growth through challenge. Relationship pushes evolution.",
        sextile: "Gentle support for life direction."
      }
    }
  },
  'North Node-Moon': {
    default: {
      category: 'karmic',
      significance: 'major',
      interpretations: {
        conjunction: "Emotionally fated. Moon nurtures Node person's destiny.",
        opposition: "Karmic emotional patterns to release.",
        trine: "Emotionally supportive of life path.",
        square: "Emotional growth through relationship challenges.",
        sextile: "Gentle emotional support for evolution."
      }
    }
  },
  'North Node-Venus': {
    default: {
      category: 'karmic',
      significance: 'major',
      interpretations: {
        conjunction: "Fated love. Venus represents the love Node person is meant to experience.",
        opposition: "Past life romantic karma to resolve.",
        trine: "Love supports life purpose. Harmonious destiny.",
        square: "Love challenges push growth.",
        sextile: "Love gently guides toward purpose."
      }
    }
  }
};

/**
 * Convert a planet position to absolute ecliptic degrees (0-360)
 */
function toAbsoluteDegree(position: NatalPlanetPosition): number {
  const signIndex = ZODIAC_SIGNS.indexOf(position.sign);
  if (signIndex === -1) return 0;
  return (signIndex * 30) + position.degree + (position.minutes / 60);
}

/**
 * Calculate the angle between two positions
 */
function calculateAngle(pos1: NatalPlanetPosition, pos2: NatalPlanetPosition): number {
  const deg1 = toAbsoluteDegree(pos1);
  const deg2 = toAbsoluteDegree(pos2);
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  return diff;
}

/**
 * Determine aspect type from angle
 */
function getAspectType(angle: number): { type: string; orb: number } | null {
  for (const [type, def] of Object.entries(ASPECT_DEFINITIONS)) {
    const orb = Math.abs(angle - def.angle);
    if (orb <= def.orb) {
      return { type, orb };
    }
  }
  return null;
}

/**
 * Get interpretation for a planet pair and aspect
 */
function getInterpretation(planet1: string, planet2: string, aspectType: string): { 
  category: SynastryAspect['category']; 
  significance: SynastryAspect['significance']; 
  interpretation: string 
} | null {
  // Try both orderings
  const key1 = `${planet1}-${planet2}`;
  const key2 = `${planet2}-${planet1}`;
  
  const interp = SYNASTRY_INTERPRETATIONS[key1]?.default || SYNASTRY_INTERPRETATIONS[key2]?.default;
  if (!interp) return null;
  
  const interpretation = interp.interpretations[aspectType];
  if (!interpretation) return null;
  
  return {
    category: interp.category,
    significance: interp.significance,
    interpretation
  };
}

/**
 * Get all key planets for synastry analysis
 */
function getKeyPlanets(chart: NatalChart): Record<string, NatalPlanetPosition> {
  const planets: Record<string, NatalPlanetPosition> = {};
  const keyPlanetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'NorthNode', 'Ascendant'];
  
  for (const name of keyPlanetNames) {
    const pos = chart.planets[name as keyof typeof chart.planets];
    if (pos) {
      planets[name] = pos;
    }
  }
  
  return planets;
}

/**
 * Calculate synastry aspects between two charts
 */
export function calculateSynastryAspects(chart1: NatalChart, chart2: NatalChart): SynastryAspect[] {
  const aspects: SynastryAspect[] = [];
  const planets1 = getKeyPlanets(chart1);
  const planets2 = getKeyPlanets(chart2);
  
  for (const [name1, pos1] of Object.entries(planets1)) {
    for (const [name2, pos2] of Object.entries(planets2)) {
      const angle = calculateAngle(pos1, pos2);
      const aspectInfo = getAspectType(angle);
      
      if (aspectInfo) {
        const interpData = getInterpretation(name1, name2, aspectInfo.type);
        if (interpData) {
          const aspectDef = ASPECT_DEFINITIONS[aspectInfo.type as keyof typeof ASPECT_DEFINITIONS];
          
          aspects.push({
            planet1: name1,
            planet1Owner: chart1.name,
            planet2: name2,
            planet2Owner: chart2.name,
            aspectType: aspectInfo.type,
            orb: Math.round(aspectInfo.orb * 10) / 10,
            category: interpData.category,
            significance: interpData.significance,
            interpretation: interpData.interpretation,
            isHarmonious: aspectDef.harmonious === null 
              ? (name1 === name2 || ['Venus', 'Jupiter'].includes(name1) || ['Venus', 'Jupiter'].includes(name2))
              : aspectDef.harmonious
          });
        }
      }
    }
  }
  
  // Sort by significance and orb
  return aspects.sort((a, b) => {
    const sigOrder = { major: 0, moderate: 1, minor: 2 };
    const sigDiff = sigOrder[a.significance] - sigOrder[b.significance];
    if (sigDiff !== 0) return sigDiff;
    return a.orb - b.orb;
  });
}

/**
 * Generate a full synastry report
 */
export function generateSynastryReport(chart1: NatalChart, chart2: NatalChart): SynastryReport {
  const aspects = calculateSynastryAspects(chart1, chart2);
  
  // Calculate category scores
  let passionPoints = 0, emotionalPoints = 0, mentalPoints = 0, karmicPoints = 0;
  let passionCount = 0, emotionalCount = 0, mentalCount = 0, karmicCount = 0;
  
  const strengths: string[] = [];
  const challenges: string[] = [];
  
  aspects.forEach(aspect => {
    const weight = aspect.significance === 'major' ? 2 : 1;
    const harmonyMod = aspect.isHarmonious ? 1 : 0.6;
    const orbMod = 1 - (aspect.orb / 10);
    const points = weight * harmonyMod * orbMod * 50;
    
    switch (aspect.category) {
      case 'passion':
        passionPoints += points;
        passionCount++;
        break;
      case 'emotional':
        emotionalPoints += points;
        emotionalCount++;
        break;
      case 'mental':
        mentalPoints += points;
        mentalCount++;
        break;
      case 'karmic':
      case 'growth':
        karmicPoints += points;
        karmicCount++;
        break;
    }
    
    // Collect strengths and challenges
    if (aspect.significance === 'major') {
      if (aspect.isHarmonious && aspect.orb < 3) {
        strengths.push(`${aspect.planet1}-${aspect.planet2} ${aspect.aspectType}: ${aspect.interpretation.split('.')[0]}`);
      } else if (!aspect.isHarmonious && aspect.orb < 3) {
        challenges.push(`${aspect.planet1}-${aspect.planet2} ${aspect.aspectType}: ${aspect.interpretation.split('.')[0]}`);
      }
    }
  });
  
  // Normalize scores to 0-100
  const normalize = (points: number, count: number) => 
    count > 0 ? Math.min(100, Math.round((points / count) + 30)) : 50;
  
  const passionScore = normalize(passionPoints, passionCount || 1);
  const emotionalScore = normalize(emotionalPoints, emotionalCount || 1);
  const mentalScore = normalize(mentalPoints, mentalCount || 1);
  const karmicScore = normalize(karmicPoints, karmicCount || 1);
  
  const overallScore = Math.round(
    (passionScore * 0.25) + 
    (emotionalScore * 0.35) + 
    (mentalScore * 0.2) + 
    (karmicScore * 0.2)
  );
  
  // Generate summary
  let summary = '';
  if (overallScore >= 80) {
    summary = `${chart1.name} and ${chart2.name} share exceptional astrological compatibility. This is a deeply significant connection with multiple layers of attraction and understanding.`;
  } else if (overallScore >= 65) {
    summary = `${chart1.name} and ${chart2.name} have strong natural compatibility. The charts show genuine potential for lasting connection with areas for growth.`;
  } else if (overallScore >= 50) {
    summary = `${chart1.name} and ${chart2.name} have moderate compatibility. While challenges exist, there's real potential if both partners are willing to grow.`;
  } else {
    summary = `${chart1.name} and ${chart2.name} face significant astrological challenges. This relationship would require considerable effort but could be deeply transformative.`;
  }
  
  // Soul contract description
  let soulContract = '';
  if (karmicScore >= 70) {
    soulContract = 'Strong karmic indicators suggest a fated connection. You likely have unfinished business from past lives to complete together.';
  } else if (passionScore >= 80) {
    soulContract = 'This connection is primarily about passion and desire. The chemistry is undeniable and can be a catalyst for transformation.';
  } else if (emotionalScore >= 80) {
    soulContract = 'A deep emotional and nurturing bond. You are here to learn about unconditional love and emotional safety together.';
  } else {
    soulContract = 'A relationship of growth and learning. Each challenge is an opportunity to evolve individually and together.';
  }
  
  return {
    overallScore,
    passionScore,
    emotionalScore,
    mentalScore,
    karmicScore,
    aspects: aspects.slice(0, 15), // Top 15 most significant
    summary,
    strengths: strengths.slice(0, 5),
    challenges: challenges.slice(0, 3),
    soulContract
  };
}

/**
 * Get aspect symbol
 */
export function getAspectSymbol(aspectType: string): string {
  const symbols: Record<string, string> = {
    conjunction: '☌',
    opposition: '☍',
    trine: '△',
    square: '□',
    sextile: '⚹',
    quincunx: '⚻',
    semisextile: '⚺'
  };
  return symbols[aspectType] || '•';
}

/**
 * Get category emoji
 */
export function getCategoryEmoji(category: SynastryAspect['category']): string {
  const emojis: Record<string, string> = {
    passion: '🔥',
    emotional: '💗',
    mental: '🧠',
    karmic: '🌙',
    growth: '🌱'
  };
  return emojis[category] || '✨';
}
