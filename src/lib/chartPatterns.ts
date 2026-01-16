// Chart Pattern Detection - Grand Cross, Grand Trine, T-Square, Yod, Mystic Rectangle, etc.

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';

export interface ChartPattern {
  name: string;
  symbol: string;
  planets: string[];
  description: string;
  meaning: string;
  challenge: string;
  gift: string;
}

const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

// Convert planet position to absolute degree (0-359)
const toAbsoluteDegree = (position: NatalPlanetPosition): number => {
  const signIndex = ZODIAC_ORDER.indexOf(position.sign);
  if (signIndex === -1) return -1;
  return signIndex * 30 + position.degree + (position.minutes || 0) / 60;
};

// Calculate aspect between two absolute degrees
const getAspectBetween = (deg1: number, deg2: number, orb: number = 8): string | null => {
  let diff = Math.abs(deg1 - deg2);
  if (diff > 180) diff = 360 - diff;
  
  if (Math.abs(diff - 0) <= orb || Math.abs(diff - 360) <= orb) return 'conjunction';
  if (Math.abs(diff - 60) <= orb) return 'sextile';
  if (Math.abs(diff - 90) <= orb) return 'square';
  if (Math.abs(diff - 120) <= orb) return 'trine';
  if (Math.abs(diff - 150) <= orb) return 'quincunx';
  if (Math.abs(diff - 180) <= orb) return 'opposition';
  
  return null;
};

// Get all planets with valid positions
const getValidPlanets = (chart: NatalChart): Array<{ name: string; degree: number }> => {
  const planets: Array<{ name: string; degree: number }> = [];
  const planetNames = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'NorthNode', 'Chiron', 'Ascendant'];
  
  for (const name of planetNames) {
    const pos = chart.planets[name as keyof typeof chart.planets];
    if (pos?.sign) {
      const deg = toAbsoluteDegree(pos);
      if (deg >= 0) {
        planets.push({ name, degree: deg });
      }
    }
  }
  
  return planets;
};

/**
 * Detect Grand Trine - three planets all in trine to each other (120° apart)
 */
const detectGrandTrines = (planets: Array<{ name: string; degree: number }>): ChartPattern[] => {
  const patterns: ChartPattern[] = [];
  const orb = 8;
  
  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const asp1 = getAspectBetween(planets[i].degree, planets[j].degree, orb);
        const asp2 = getAspectBetween(planets[j].degree, planets[k].degree, orb);
        const asp3 = getAspectBetween(planets[i].degree, planets[k].degree, orb);
        
        if (asp1 === 'trine' && asp2 === 'trine' && asp3 === 'trine') {
          patterns.push({
            name: 'Grand Trine',
            symbol: '△',
            planets: [planets[i].name, planets[j].name, planets[k].name],
            description: `${planets[i].name}, ${planets[j].name}, and ${planets[k].name} form a Grand Trine—a closed circuit of flowing harmony.`,
            meaning: 'A Grand Trine represents natural talent, ease, and flow. These three planets work together effortlessly, creating an area of innate gift.',
            challenge: 'Can create complacency or taking talents for granted. The ease may prevent growth through struggle.',
            gift: 'Natural ability, luck in this area, talents that flow without effort. A protective configuration.',
          });
        }
      }
    }
  }
  
  return patterns;
};

/**
 * Detect T-Square - two planets in opposition with a third square to both
 */
const detectTSquares = (planets: Array<{ name: string; degree: number }>): ChartPattern[] => {
  const patterns: ChartPattern[] = [];
  const orb = 8;
  
  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      if (getAspectBetween(planets[i].degree, planets[j].degree, orb) === 'opposition') {
        for (let k = 0; k < planets.length; k++) {
          if (k !== i && k !== j) {
            const sq1 = getAspectBetween(planets[i].degree, planets[k].degree, orb);
            const sq2 = getAspectBetween(planets[j].degree, planets[k].degree, orb);
            
            if (sq1 === 'square' && sq2 === 'square') {
              patterns.push({
                name: 'T-Square',
                symbol: '⊤',
                planets: [planets[i].name, planets[j].name, planets[k].name],
                description: `${planets[i].name} opposes ${planets[j].name}, with ${planets[k].name} squaring both—creating dynamic tension.`,
                meaning: 'A T-Square creates constant inner tension that drives achievement. The apex planet (the one squaring both) is the focal point for resolving the opposition.',
                challenge: 'Stress, inner conflict, feeling driven but never at rest. The apex planet area may be overdeveloped.',
                gift: 'Tremendous drive, motivation, and the ability to accomplish through challenge. Dynamic energy for achievement.',
              });
            }
          }
        }
      }
    }
  }
  
  return patterns;
};

/**
 * Detect Grand Cross - four planets forming two oppositions and four squares
 */
const detectGrandCrosses = (planets: Array<{ name: string; degree: number }>): ChartPattern[] => {
  const patterns: ChartPattern[] = [];
  const orb = 8;
  
  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const p = [planets[i], planets[j], planets[k], planets[l]];
          
          // Check for 2 oppositions and 4 squares
          let oppositions = 0;
          let squares = 0;
          
          for (let a = 0; a < 4; a++) {
            for (let b = a + 1; b < 4; b++) {
              const asp = getAspectBetween(p[a].degree, p[b].degree, orb);
              if (asp === 'opposition') oppositions++;
              if (asp === 'square') squares++;
            }
          }
          
          if (oppositions === 2 && squares === 4) {
            patterns.push({
              name: 'Grand Cross',
              symbol: '✚',
              planets: p.map(x => x.name),
              description: `${p[0].name}, ${p[1].name}, ${p[2].name}, and ${p[3].name} form a Grand Cross—maximum dynamic tension.`,
              meaning: 'A Grand Cross represents a lifetime of dealing with tension from four directions. It creates tremendous resilience and the ability to handle pressure others cannot.',
              challenge: 'Feeling pulled in four directions at once. Chronic stress, difficulty finding rest. Life may feel like constant crisis.',
              gift: 'Extraordinary strength, ability to handle complexity, resilience built through constant challenge. The ability to see all sides.',
            });
          }
        }
      }
    }
  }
  
  return patterns;
};

// Detailed apex planet interpretations for Yods
const APEX_PLANET_MEANINGS: Record<string, { mission: string; integration: string; shadow: string }> = {
  Sun: {
    mission: "Your life purpose centers on developing authentic self-expression and leadership. You're being called to shine in a way that may feel uncomfortable at first.",
    integration: "Learn to claim your identity without apology. The universe keeps asking: 'Who ARE you, really?'",
    shadow: "May struggle with ego—either inflated or deflated. Identity crises force evolution."
  },
  Moon: {
    mission: "Emotional mastery and nurturing are your soul assignments. You're learning to feel deeply while not being ruled by emotions.",
    integration: "Create safe spaces for yourself and others. Your sensitivity is a superpower once you stop fighting it.",
    shadow: "Emotional volatility, over-dependency on others, or cutting off from feelings entirely."
  },
  Mercury: {
    mission: "You're here to communicate something important. Your mind works differently—embrace it.",
    integration: "Find YOUR way of thinking and expressing. Traditional learning may not work; alternative approaches will.",
    shadow: "Anxiety, overthinking, difficulty being understood. The message keeps getting refined through frustration."
  },
  Venus: {
    mission: "You're learning radical self-love and new relationship paradigms. Old models of love won't work for you.",
    integration: "Redefine beauty, value, and connection on your own terms. What YOU love matters.",
    shadow: "Relationship patterns that don't work, money issues that force values clarification."
  },
  Mars: {
    mission: "You're developing a unique way of asserting yourself, taking action, and channeling anger. Direct aggression won't work—you need a different approach.",
    integration: "Find constructive outlets for drive. Your warrior spirit needs a worthy cause, not random battles.",
    shadow: "Misdirected anger, passive-aggression, or health issues from suppressed Mars energy. May attract conflict until you learn to wield this energy consciously."
  },
  Jupiter: {
    mission: "Your beliefs and worldview are being constantly expanded. You're meant to teach or share wisdom, but first must earn it.",
    integration: "Travel (inner or outer), study, and keep growing. Your philosophy of life is your greatest gift.",
    shadow: "Over-promising, escapism through excess, or rigid beliefs that keep breaking."
  },
  Saturn: {
    mission: "You're building something that lasts—mastery through discipline. The delays and restrictions are the training.",
    integration: "Embrace structure, commit long-term, build your authority. Time is on your side.",
    shadow: "Depression, chronic limitation, or authority problems that force you to become your own authority."
  },
  Uranus: {
    mission: "You're a paradigm-breaker. Your unique perspective and innovations are needed, even when they make others uncomfortable.",
    integration: "Stop trying to fit in. Your rebelliousness serves evolution—channel it consciously.",
    shadow: "Chronic instability, relationship chaos, or nervous system issues from resisting your own uniqueness."
  },
  Neptune: {
    mission: "You're developing spiritual sensitivity and creative/healing gifts. The boundary between you and the infinite is thin.",
    integration: "Art, healing, meditation, service—find ways to channel the mystical. Grounding practices are essential.",
    shadow: "Escapism, addiction, victimhood, or confusion until you learn to work with spiritual energy."
  },
  Pluto: {
    mission: "You're here for deep transformation—dying and being reborn many times. Power and its responsible use are your curriculum.",
    integration: "Face your shadows. Use your psychological depth to heal yourself and others. Don't fear intensity.",
    shadow: "Control issues, power struggles, or life-upending crises that force transformation."
  },
  Chiron: {
    mission: "Your wound becomes your medicine. You're learning to heal through your own pain.",
    integration: "Don't hide your wounds—they're your credibility for helping others. The wounded healer path.",
    shadow: "Chronic pain (physical or emotional) that won't resolve until you embrace the healing journey."
  },
  NorthNode: {
    mission: "Multiple life themes converge on your soul direction. This Yod supercharges your karmic path.",
    integration: "Lean into what feels unfamiliar but calling. Past-life skills support new growth.",
    shadow: "Resistance to growth feels amplified. The universe won't let you stay comfortable."
  },
  Ascendant: {
    mission: "Your very presence and approach to life is being refined. How you enter rooms matters.",
    integration: "Experiment with self-presentation. Your first impression is more powerful than you know.",
    shadow: "Identity confusion, feeling like you don't know how to 'be' in the world."
  }
};

/**
 * Detect Yod (Finger of God) - two planets in sextile, both quincunx to a third
 */
const detectYods = (planets: Array<{ name: string; degree: number }>): ChartPattern[] => {
  const patterns: ChartPattern[] = [];
  const orb = 3; // Yods need tighter orbs
  
  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      if (getAspectBetween(planets[i].degree, planets[j].degree, 6) === 'sextile') {
        for (let k = 0; k < planets.length; k++) {
          if (k !== i && k !== j) {
            const q1 = getAspectBetween(planets[i].degree, planets[k].degree, orb);
            const q2 = getAspectBetween(planets[j].degree, planets[k].degree, orb);
            
            if (q1 === 'quincunx' && q2 === 'quincunx') {
              const apexPlanet = planets[k].name;
              const basePlanet1 = planets[i].name;
              const basePlanet2 = planets[j].name;
              
              // Find conjunctions to apex planet
              const apexConjunctions: string[] = [];
              for (let m = 0; m < planets.length; m++) {
                if (m !== k && m !== i && m !== j) {
                  const conj = getAspectBetween(planets[k].degree, planets[m].degree, 8);
                  if (conj === 'conjunction') {
                    apexConjunctions.push(planets[m].name);
                  }
                }
              }
              
              // Get apex planet interpretation
              const apexMeaning = APEX_PLANET_MEANINGS[apexPlanet] || {
                mission: `${apexPlanet} at the apex indicates this planetary energy is being intensely developed.`,
                integration: `Work consciously with ${apexPlanet} themes—they are your assignment.`,
                shadow: `${apexPlanet} issues keep recurring until integrated.`
              };
              
              // Build detailed description
              let detailedDescription = `**THE YOD APEX: ${apexPlanet}**\n\n`;
              detailedDescription += `${basePlanet1} sextile ${basePlanet2} form the base, both pointing (via quincunx) to ${apexPlanet}.\n\n`;
              detailedDescription += `**Your Mission:** ${apexMeaning.mission}\n\n`;
              detailedDescription += `**Integration Path:** ${apexMeaning.integration}\n\n`;
              detailedDescription += `**Shadow Work:** ${apexMeaning.shadow}`;
              
              // Add conjunction information if present
              if (apexConjunctions.length > 0) {
                detailedDescription += `\n\n**CRITICAL: ${apexPlanet} is conjunct ${apexConjunctions.join(' and ')}**\n`;
                detailedDescription += `This conjunction AMPLIFIES the Yod's intensity. ${apexConjunctions.join(' and ')} ${apexConjunctions.length > 1 ? 'are' : 'is'} fused with your apex planet—`;
                
                if (apexConjunctions.includes('Saturn')) {
                  detailedDescription += `Saturn conjunct the apex adds weight, delay, and the demand for MASTERY. This isn't a quick lesson—it's a lifelong discipline. The pressure to perform and prove yourself in ${apexPlanet} matters is intense. Structure, patience, and earned authority are required.`;
                } else if (apexConjunctions.includes('Pluto')) {
                  detailedDescription += `Pluto conjunct the apex adds intensity, transformation, and power dynamics. You may experience crises around ${apexPlanet} themes that force complete reinvention.`;
                } else if (apexConjunctions.includes('Uranus')) {
                  detailedDescription += `Uranus conjunct the apex adds unpredictability and the demand for originality. Your ${apexPlanet} expression must be unique—conventional approaches won't work.`;
                } else if (apexConjunctions.includes('Neptune')) {
                  detailedDescription += `Neptune conjunct the apex adds spiritual sensitivity and creative potential, but also confusion. Clarity around ${apexPlanet} comes through surrender, not control.`;
                } else if (apexConjunctions.includes('Jupiter')) {
                  detailedDescription += `Jupiter conjunct the apex expands and amplifies everything. The mission is BIG. Guard against over-promising or believing you've mastered it before you have.`;
                } else if (apexConjunctions.includes('Mars')) {
                  detailedDescription += `Mars conjunct the apex adds drive, urgency, and potential for conflict. You'll need physical outlets and conscious anger management as part of your integration.`;
                } else {
                  detailedDescription += `their energy is woven into your mission and cannot be separated from ${apexPlanet}'s development.`;
                }
              }
              
              patterns.push({
                name: 'Yod (Finger of God)',
                symbol: '⚲',
                planets: [basePlanet1, basePlanet2, apexPlanet, ...apexConjunctions],
                description: detailedDescription,
                meaning: `A Yod with ${apexPlanet} at the apex indicates a FATED MISSION around ${apexPlanet} themes. The base planets (${basePlanet1} and ${basePlanet2}) provide talents and resources, but they must be constantly adjusted to serve ${apexPlanet}'s development. Life keeps redirecting you toward this purpose through events that feel "meant to be."`,
                challenge: `The quincunx creates persistent tension—like an itch you can't scratch. ${apexPlanet} matters don't flow naturally; they require constant conscious adjustment. You may feel "off" until you engage this mission directly. Health, timing, and situational issues often manifest as the universe's way of forcing adjustment.`,
                gift: `Once integrated, ${apexPlanet} becomes your SUPERPOWER—a unique gift no one else has in quite the same way. You become a specialist, a teacher, or a healer in ${apexPlanet} domains. The very challenges that frustrated you become your credibility.`,
              });
            }
          }
        }
      }
    }
  }
  
  return patterns;
};

/**
 * Detect Mystic Rectangle - two oppositions connected by sextiles and trines
 */
const detectMysticRectangles = (planets: Array<{ name: string; degree: number }>): ChartPattern[] => {
  const patterns: ChartPattern[] = [];
  const orb = 6;
  
  for (let i = 0; i < planets.length - 3; i++) {
    for (let j = i + 1; j < planets.length - 2; j++) {
      for (let k = j + 1; k < planets.length - 1; k++) {
        for (let l = k + 1; l < planets.length; l++) {
          const p = [planets[i], planets[j], planets[k], planets[l]];
          
          // Check for 2 oppositions, 2 sextiles, 2 trines
          let oppositions = 0;
          let sextiles = 0;
          let trines = 0;
          
          for (let a = 0; a < 4; a++) {
            for (let b = a + 1; b < 4; b++) {
              const asp = getAspectBetween(p[a].degree, p[b].degree, orb);
              if (asp === 'opposition') oppositions++;
              if (asp === 'sextile') sextiles++;
              if (asp === 'trine') trines++;
            }
          }
          
          if (oppositions === 2 && sextiles === 2 && trines === 2) {
            patterns.push({
              name: 'Mystic Rectangle',
              symbol: '▭',
              planets: p.map(x => x.name),
              description: `${p[0].name}, ${p[1].name}, ${p[2].name}, and ${p[3].name} form a Mystic Rectangle—balanced creative tension.`,
              meaning: 'A Mystic Rectangle combines the awareness of oppositions with the flow of trines and opportunities of sextiles. It creates practical mysticism—the ability to manifest vision.',
              challenge: 'May oscillate between too much ease and too much tension. Can feel like a cosmic balancing act.',
              gift: 'Ability to integrate opposites productively. Practical magic—vision that manifests. Balance between action and flow.',
            });
          }
        }
      }
    }
  }
  
  return patterns;
};

/**
 * Detect Kite - Grand Trine with one planet in opposition to one of the trine planets
 */
const detectKites = (planets: Array<{ name: string; degree: number }>): ChartPattern[] => {
  const patterns: ChartPattern[] = [];
  const orb = 8;
  
  // First find grand trines
  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      for (let k = j + 1; k < planets.length; k++) {
        const asp1 = getAspectBetween(planets[i].degree, planets[j].degree, orb);
        const asp2 = getAspectBetween(planets[j].degree, planets[k].degree, orb);
        const asp3 = getAspectBetween(planets[i].degree, planets[k].degree, orb);
        
        if (asp1 === 'trine' && asp2 === 'trine' && asp3 === 'trine') {
          // Found a grand trine, now look for a planet opposing one of them
          for (let l = 0; l < planets.length; l++) {
            if (l !== i && l !== j && l !== k) {
              const opp1 = getAspectBetween(planets[l].degree, planets[i].degree, orb);
              const opp2 = getAspectBetween(planets[l].degree, planets[j].degree, orb);
              const opp3 = getAspectBetween(planets[l].degree, planets[k].degree, orb);
              
              if (opp1 === 'opposition' || opp2 === 'opposition' || opp3 === 'opposition') {
                patterns.push({
                  name: 'Kite',
                  symbol: '◇',
                  planets: [planets[i].name, planets[j].name, planets[k].name, planets[l].name],
                  description: `A Grand Trine between ${planets[i].name}, ${planets[j].name}, and ${planets[k].name} is activated by ${planets[l].name} in opposition—creating a Kite.`,
                  meaning: 'A Kite takes the natural talents of a Grand Trine and gives them direction through the opposition. The opposing planet provides focus and motivation.',
                  challenge: 'The opposition creates tension that disrupts the trine\'s ease. Must work to channel talents productively.',
                  gift: 'Talents with purpose. The opposition gives the trine somewhere to go. Gifts that achieve rather than coast.',
                });
              }
            }
          }
        }
      }
    }
  }
  
  return patterns;
};

/**
 * Detect all patterns in a natal chart
 */
export const detectChartPatterns = (chart: NatalChart): ChartPattern[] => {
  const planets = getValidPlanets(chart);
  if (planets.length < 3) return [];
  
  const patterns: ChartPattern[] = [
    ...detectGrandTrines(planets),
    ...detectTSquares(planets),
    ...detectGrandCrosses(planets),
    ...detectYods(planets),
    ...detectMysticRectangles(planets),
    ...detectKites(planets),
  ];
  
  // Remove duplicates by pattern name + planets
  const seen = new Set<string>();
  return patterns.filter(p => {
    const key = `${p.name}-${p.planets.sort().join(',')}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

/**
 * Check if a transit activates any natal chart patterns
 */
export const getPatternActivation = (
  transitPlanet: string,
  transitDegree: number,
  chart: NatalChart
): ChartPattern[] => {
  const patterns = detectChartPatterns(chart);
  const activated: ChartPattern[] = [];
  
  for (const pattern of patterns) {
    for (const planetName of pattern.planets) {
      const natalPos = chart.planets[planetName as keyof typeof chart.planets];
      if (natalPos?.sign) {
        const natalDeg = toAbsoluteDegree(natalPos);
        const aspect = getAspectBetween(transitDegree, natalDeg, 3);
        
        if (aspect) {
          activated.push({
            ...pattern,
            description: `Transit ${transitPlanet} ${aspect}s ${planetName}, activating your ${pattern.name}. ${pattern.description}`,
          });
          break; // Only add pattern once per transit
        }
      }
    }
  }
  
  return activated;
};
