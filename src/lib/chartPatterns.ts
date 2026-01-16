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

// Apex planet meanings for T-Squares
const TSQUARE_APEX_MEANINGS: Record<string, { focus: string; overdrive: string; release: string }> = {
  Sun: {
    focus: "Identity and ego are the pressure point. You're driven to prove yourself, define who you are, and be recognized.",
    overdrive: "Can become ego-obsessed, domineering, or exhausted from constant self-assertion.",
    release: "Let go of needing to be seen. Find identity through being rather than proving."
  },
  Moon: {
    focus: "Emotional security and nurturing are the pressure point. Feelings run high and drive behavior.",
    overdrive: "Emotional volatility, over-caretaking, or using emotions to control situations.",
    release: "Create stable emotional foundations. Learn that safety comes from within."
  },
  Mercury: {
    focus: "Communication and thinking are the pressure point. Mind is always active, analyzing, strategizing.",
    overdrive: "Overthinking, anxiety, mental exhaustion, or using words as weapons.",
    release: "Quiet the mind. Listen as much as you speak. Not everything needs analysis."
  },
  Venus: {
    focus: "Relationships and values are the pressure point. Driven to find love, beauty, harmony.",
    overdrive: "People-pleasing, over-compromising, or becoming obsessed with appearances.",
    release: "Self-love first. Your values matter. Beauty comes in many forms."
  },
  Mars: {
    focus: "Action and assertion are the pressure point. Tremendous drive to DO, compete, conquer.",
    overdrive: "Aggression, burnout, accidents, or picking fights to release tension.",
    release: "Channel energy into physical outlets. Learn when NOT to act. Strategic patience."
  },
  Jupiter: {
    focus: "Growth and meaning are the pressure point. Constant push to expand, learn, believe.",
    overdrive: "Over-promising, excess, or using beliefs to avoid reality.",
    release: "Find meaning in simplicity. Not everything needs to be a grand adventure."
  },
  Saturn: {
    focus: "Achievement and structure are the pressure point. Relentless drive to master, succeed, prove competence.",
    overdrive: "Workaholism, depression, rigidity, or crushing self-criticism.",
    release: "Rest is productive. Imperfection is acceptable. You've already proven enough."
  },
  Uranus: {
    focus: "Freedom and individuality are the pressure point. Must break free, be different, revolutionize.",
    overdrive: "Chronic instability, rebellion for its own sake, or alienating everyone.",
    release: "Stability doesn't mean imprisonment. Some structures support freedom."
  },
  Neptune: {
    focus: "Ideals and transcendence are the pressure point. Driven toward the spiritual, artistic, or escapist.",
    overdrive: "Confusion, addiction, martyrdom, or losing yourself in fantasy.",
    release: "Ground the vision. Spirit needs a body. Dreams need action."
  },
  Pluto: {
    focus: "Power and transformation are the pressure point. Intense drive to control, transform, or dominate.",
    overdrive: "Power struggles, obsession, manipulation, or destroying what you love.",
    release: "Surrender control. Trust the process. Some things must die for rebirth."
  },
  Chiron: {
    focus: "Wounding and healing are the pressure point. Your pain is visible and drives you to help or hide.",
    overdrive: "Victim identity, over-focusing on wounds, or compulsive healing of others.",
    release: "Your wound is not your identity. Heal yourself first."
  },
  NorthNode: {
    focus: "Your life direction is the pressure point. Immense karmic pressure to evolve.",
    overdrive: "Anxiety about purpose, rushing growth, or paralysis about direction.",
    release: "Trust the path. You don't have to figure it all out now."
  }
};

// Get zodiac sign from absolute degree
const getSignFromDegree = (degree: number): string => {
  const normalizedDeg = ((degree % 360) + 360) % 360;
  const signIndex = Math.floor(normalizedDeg / 30);
  return ZODIAC_ORDER[signIndex];
};

// Get degree within sign from absolute degree
const getDegreeInSign = (degree: number): number => {
  const normalizedDeg = ((degree % 360) + 360) % 360;
  return normalizedDeg % 30;
};

// Calculate which house a degree falls in (simplified - needs house cusps for accuracy)
const getHouseFromDegree = (degree: number, houseCusps?: number[]): number | null => {
  if (!houseCusps || houseCusps.length !== 12) return null;
  
  const normalizedDeg = ((degree % 360) + 360) % 360;
  
  for (let i = 0; i < 12; i++) {
    const currentCusp = houseCusps[i];
    const nextCusp = houseCusps[(i + 1) % 12];
    
    if (nextCusp < currentCusp) {
      // Cusp crosses 0° Aries
      if (normalizedDeg >= currentCusp || normalizedDeg < nextCusp) {
        return i + 1;
      }
    } else {
      if (normalizedDeg >= currentCusp && normalizedDeg < nextCusp) {
        return i + 1;
      }
    }
  }
  return 1;
};

/**
 * Detect T-Square - two planets in opposition with a third square to both
 * Enhanced with release point analysis
 */
const detectTSquares = (planets: Array<{ name: string; degree: number }>, chart?: NatalChart): ChartPattern[] => {
  const patterns: ChartPattern[] = [];
  const orb = 8;
  
  // Build house cusps array from chart if available
  let houseCusps: number[] | undefined;
  if (chart?.houseCusps) {
    houseCusps = [];
    for (let i = 1; i <= 12; i++) {
      const cusp = chart.houseCusps[`house${i}` as keyof typeof chart.houseCusps];
      if (cusp) {
        // Convert house cusp to absolute degree manually (HouseCusp doesn't have seconds)
        const signIndex = ZODIAC_ORDER.indexOf(cusp.sign);
        if (signIndex !== -1) {
          houseCusps.push(signIndex * 30 + cusp.degree + (cusp.minutes || 0) / 60);
        }
      }
    }
    if (houseCusps.length !== 12) houseCusps = undefined;
  }
  
  for (let i = 0; i < planets.length - 2; i++) {
    for (let j = i + 1; j < planets.length - 1; j++) {
      if (getAspectBetween(planets[i].degree, planets[j].degree, orb) === 'opposition') {
        for (let k = 0; k < planets.length; k++) {
          if (k !== i && k !== j) {
            const sq1 = getAspectBetween(planets[i].degree, planets[k].degree, orb);
            const sq2 = getAspectBetween(planets[j].degree, planets[k].degree, orb);
            
            if (sq1 === 'square' && sq2 === 'square') {
              const apexPlanet = planets[k];
              const oppPlanet1 = planets[i];
              const oppPlanet2 = planets[j];
              
              // Calculate the RELEASE POINT - opposite the apex planet (180° away)
              const releasePointDegree = (apexPlanet.degree + 180) % 360;
              const releaseSign = getSignFromDegree(releasePointDegree);
              const releaseDegreeInSign = getDegreeInSign(releasePointDegree);
              const releaseHouse = getHouseFromDegree(releasePointDegree, houseCusps);
              
              // Find planets near the release point (within orb)
              const planetsNearRelease: string[] = [];
              planets.forEach(p => {
                if (p.name !== apexPlanet.name && p.name !== oppPlanet1.name && p.name !== oppPlanet2.name) {
                  const aspectToRelease = getAspectBetween(p.degree, releasePointDegree, 10);
                  if (aspectToRelease === 'conjunction') {
                    planetsNearRelease.push(p.name);
                  }
                }
              });
              
              // Get apex interpretation
              const apexMeaning = TSQUARE_APEX_MEANINGS[apexPlanet.name] || {
                focus: `${apexPlanet.name} themes are the pressure point and focal area.`,
                overdrive: `${apexPlanet.name} can become overactive or stressed.`,
                release: `Develop the opposite quality to ${apexPlanet.name}.`
              };
              
              // Build detailed description
              let detailedDesc = `**T-SQUARE CONFIGURATION**\n\n`;
              detailedDesc += `**Opposition:** ${oppPlanet1.name} ☍ ${oppPlanet2.name}\n`;
              detailedDesc += `These two planets pull in opposite directions, creating a fundamental life tension.\n\n`;
              
              detailedDesc += `**APEX PLANET: ${apexPlanet.name}**\n`;
              detailedDesc += `${apexMeaning.focus}\n\n`;
              detailedDesc += `**Overdrive Warning:** ${apexMeaning.overdrive}\n\n`;
              
              detailedDesc += `**🎯 THE RELEASE POINT (CRITICAL)**\n`;
              detailedDesc += `Location: ${releaseDegreeInSign.toFixed(0)}° ${releaseSign}`;
              if (releaseHouse) {
                detailedDesc += ` (${releaseHouse}${getOrdinalSuffix(releaseHouse)} House)`;
              }
              detailedDesc += `\n\n`;
              
              detailedDesc += `The release point is the EMPTY LEG of your T-Square—opposite the apex. This is where you CONSCIOUSLY develop skills to release the pressure.\n\n`;
              
              // House-specific release guidance
              if (releaseHouse) {
                const houseGuidance = getHouseReleaseGuidance(releaseHouse);
                detailedDesc += `**${releaseHouse}${getOrdinalSuffix(releaseHouse)} House Release:** ${houseGuidance}\n\n`;
              }
              
              // Sign-specific release guidance
              detailedDesc += `**${releaseSign} Energy Needed:** ${getSignReleaseEnergy(releaseSign)}\n\n`;
              
              // Planets near release point
              if (planetsNearRelease.length > 0) {
                detailedDesc += `**⭐ PLANETS NEAR RELEASE POINT: ${planetsNearRelease.join(', ')}**\n`;
                detailedDesc += `This is significant! You have planetary support at your release point. ${planetsNearRelease.join(' and ')} can help channel the T-Square tension constructively. These planets are your pressure valve—develop their qualities consciously.\n\n`;
              } else {
                detailedDesc += `**No planets at the release point**—you must CONSCIOUSLY develop ${releaseSign}/${releaseHouse ? `${releaseHouse}th House` : ''} qualities. This is learned skill, not natural talent.\n\n`;
              }
              
              detailedDesc += `**Integration Practice:** ${apexMeaning.release}`;
              
              patterns.push({
                name: 'T-Square',
                symbol: '⊤',
                planets: [oppPlanet1.name, oppPlanet2.name, apexPlanet.name],
                description: detailedDesc,
                meaning: `The ${oppPlanet1.name}-${oppPlanet2.name} opposition creates a fundamental life polarity. ${apexPlanet.name} at the apex receives ALL that tension and must DO something with it. This creates tremendous drive but also chronic stress. The release point in ${releaseSign}${releaseHouse ? ` (${releaseHouse}th House)` : ''} is where you learn to let go.`,
                challenge: `${apexPlanet.name} is under constant pressure. You may overdo ${apexPlanet.name} activities, burn out in this area, or swing between the two opposition planets without resolution. The release point feels unfamiliar—that's exactly why you need to develop it.`,
                gift: `Extraordinary ${apexPlanet.name} capability built through pressure. Once you learn to use the release point, this becomes a powerful engine for achievement. The tension never fully goes away—but it becomes fuel rather than drain.`,
              });
            }
          }
        }
      }
    }
  }
  
  return patterns;
};

// Helper: Get ordinal suffix
const getOrdinalSuffix = (n: number): string => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

// Helper: House-specific release guidance
const getHouseReleaseGuidance = (house: number): string => {
  const guidance: Record<number, string> = {
    1: "Develop independent self-assertion. Take initiative. Focus on YOUR needs and identity. Physical activity and self-definition are your pressure valve.",
    2: "Build material security and self-worth. Develop your resources, skills, values. Grounding in what you OWN and VALUE releases tension.",
    3: "Communicate, learn, connect locally. Write, teach, network. Short trips and sibling/neighbor connections help. Information gathering is therapeutic.",
    4: "Create a home base. Family healing, emotional security, roots. Private time at home releases pressure. Connect with your ancestry and inner foundation.",
    5: "Create! Play! Romance! Express yourself through art, performance, children. Joy and creative output are your release. Stop being so serious.",
    6: "Daily routines, health practices, service work. Detailed tasks and helping others grounds the energy. Exercise, diet, and skilled work release tension.",
    7: "Partnership and collaboration. Let others help. Develop relationship skills. One-on-one connections and learning to cooperate releases the pressure.",
    8: "Go deep. Psychological work, shared resources, intimacy. Transformation through crisis. Face your shadows. Other people's resources support you.",
    9: "Expand your worldview. Travel, higher education, philosophy, publishing. Think bigger. Meaning and purpose come from the grand perspective.",
    10: "Career achievement and public role. Build your reputation. Take responsibility. Structure and long-term goals channel the energy productively.",
    11: "Community, friends, future vision. Group activities and humanitarian causes. Dreams for the future and belonging to something larger than yourself.",
    12: "Solitude, spirituality, surrender. Meditation, retreat, artistic or healing work. Let go of control. The unconscious and transcendent are your allies."
  };
  return guidance[house] || "Develop the qualities of this house area consciously.";
};

// Helper: Sign-specific release energy
const getSignReleaseEnergy = (sign: string): string => {
  const energies: Record<string, string> = {
    Aries: "Courage, initiative, directness. Be willing to act first, assert yourself, take risks. Stop waiting for permission.",
    Taurus: "Patience, stability, sensory grounding. Slow down. Build something lasting. Enjoy the physical world. Trust the process.",
    Gemini: "Curiosity, flexibility, communication. Ask questions. Stay light. Gather information before deciding. Variety is medicine.",
    Cancer: "Nurturing, emotional honesty, creating safety. Let yourself feel. Take care of yourself and others. Home matters.",
    Leo: "Creative self-expression, generosity, play. Shine without apology. Lead with heart. Drama and joy are therapeutic.",
    Virgo: "Analysis, service, practical improvement. Focus on details. Help others. Refine your skills. Humility and usefulness heal.",
    Libra: "Balance, partnership, aesthetics. Seek harmony. Collaborate. Beauty and fairness matter. Relationship is the path.",
    Scorpio: "Depth, intensity, transformation. Go beneath the surface. Face what you've been avoiding. Power through vulnerability.",
    Sagittarius: "Expansion, optimism, meaning. Think bigger. Travel (physically or mentally). Faith and humor release pressure.",
    Capricorn: "Structure, discipline, long-term thinking. Build something. Be patient. Mastery comes through committed effort.",
    Aquarius: "Detachment, innovation, community. Step back. Think objectively. Connect with groups. The future matters more than the past.",
    Pisces: "Surrender, compassion, transcendence. Let go. Meditate. Create art. Serve without agenda. Trust the universe."
  };
  return energies[sign] || "Develop the qualities of this sign consciously.";
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
    ...detectTSquares(planets, chart),
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
