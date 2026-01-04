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
              patterns.push({
                name: 'Yod (Finger of God)',
                symbol: '⚲',
                planets: [planets[i].name, planets[j].name, planets[k].name],
                description: `${planets[i].name} and ${planets[j].name} point to ${planets[k].name}—a fated mission.`,
                meaning: 'A Yod indicates a special mission or destiny. The apex planet represents a gift that must be developed through constant adjustment. Life keeps pushing you toward this purpose.',
                challenge: 'Persistent feeling of being "off," health sensitivities, difficulty integrating the apex planet. Life seems to conspire to force growth.',
                gift: 'A special purpose or mission. The apex planet becomes a unique gift once mastered. Fated encounters and turning points.',
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
