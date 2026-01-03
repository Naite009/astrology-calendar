// Detailed Transit Interpretation System
// Rich, educational, actionable guidance for every transit aspect

export const PLANET_ESSENCES: Record<string, string> = {
  Sun: "☉ SUN = Your core identity, vitality, life force. Who you are when most yourself.",
  Moon: "☽ MOON = Your emotional nature, instincts, inner world. How you feel and nurture.",
  Mercury: "☿ MERCURY = Your mind, communication, thinking. How you process information.",
  Venus: "♀ VENUS = Your values, love, beauty. What you attract and appreciate.",
  Mars: "♂ MARS = Your drive, desire, action. How you assert yourself.",
  Jupiter: "♃ JUPITER = Your faith, growth, expansion. Where you find meaning.",
  Saturn: "♄ SATURN = Your discipline, structure, lessons. Where you mature.",
  Uranus: "♅ URANUS = Your individuality, freedom, awakening. Where you break rules.",
  Neptune: "♆ NEPTUNE = Your spirituality, dreams. Where boundaries dissolve.",
  Pluto: "♇ PLUTO = Your power, transformation. Where you die and are reborn.",
  Chiron: "⚷ CHIRON = Your wound and healing gift. Where you teach what hurt you.",
  Vesta: "⚶ VESTA = Your sacred focus, devotion. What you tend like a holy flame.",
  Ceres: "⚳ CERES = Your nurturing, mothering. How you care for others.",
  Pallas: "⚴ PALLAS = Your wisdom, strategy. Pattern recognition and justice.",
  Juno: "⚵ JUNO = Your partnership needs. What you need in committed relationships.",
  NorthNode: "☊ NORTH NODE = Your destiny, life purpose. Where you're meant to grow.",
  Lilith: "⚸ LILITH = Your wild feminine, shadow. What you've rejected but must integrate.",
  Ascendant: "ASC = How you meet the world. Your mask and first impression.",
};

export const ASPECT_MEANINGS: Record<string, { symbol: string; meaning: string; energy: string }> = {
  conjunction: {
    symbol: "☌",
    meaning: "MERGING — These energies fuse into one. Intense focus, new beginnings.",
    energy: "powerful"
  },
  opposition: {
    symbol: "☍",
    meaning: "POLARITY — Tension between two poles. Balance needed. Awareness through contrast.",
    energy: "challenging"
  },
  trine: {
    symbol: "△",
    meaning: "HARMONY — Easy flow. Natural talent. These work together effortlessly.",
    energy: "supportive"
  },
  square: {
    symbol: "□",
    meaning: "TENSION — Friction that demands action. Growth through challenge.",
    energy: "activating"
  },
  sextile: {
    symbol: "⚹",
    meaning: "OPPORTUNITY — Gentle support. Doors open if you take action.",
    energy: "helpful"
  },
};

export const SIGN_QUALITIES: Record<string, { element: string; mode: string; keywords: string; energy: string }> = {
  Aries: { element: "Fire", mode: "Cardinal", keywords: "initiation, courage, independence", energy: "Start boldly. Take action." },
  Taurus: { element: "Earth", mode: "Fixed", keywords: "stability, sensuality, security", energy: "Build steadily. Enjoy fully." },
  Gemini: { element: "Air", mode: "Mutable", keywords: "communication, curiosity, connections", energy: "Learn freely. Talk openly." },
  Cancer: { element: "Water", mode: "Cardinal", keywords: "nurturing, emotions, home", energy: "Feel deeply. Protect what matters." },
  Leo: { element: "Fire", mode: "Fixed", keywords: "creativity, confidence, self-expression", energy: "Shine brightly. Create joyfully." },
  Virgo: { element: "Earth", mode: "Mutable", keywords: "service, health, perfection", energy: "Organize wisely. Serve humbly." },
  Libra: { element: "Air", mode: "Cardinal", keywords: "balance, beauty, relationships", energy: "Harmonize gracefully. Connect deeply." },
  Scorpio: { element: "Water", mode: "Fixed", keywords: "transformation, intensity, power", energy: "Transform powerfully. Trust deeply." },
  Sagittarius: { element: "Fire", mode: "Mutable", keywords: "expansion, philosophy, adventure", energy: "Explore freely. Seek meaning." },
  Capricorn: { element: "Earth", mode: "Cardinal", keywords: "ambition, discipline, structure", energy: "Build deliberately. Achieve goals." },
  Aquarius: { element: "Air", mode: "Fixed", keywords: "innovation, community, individuality", energy: "Innovate uniquely. Serve collective." },
  Pisces: { element: "Water", mode: "Mutable", keywords: "spirituality, compassion, transcendence", energy: "Flow intuitively. Dream deeply." },
};

export const HOUSE_DETAILED: Record<number, { name: string; keywords: string; lifeArea: string; questions: string }> = {
  1: { 
    name: "1st House (Self)", 
    keywords: "identity, appearance, new beginnings",
    lifeArea: "how you present yourself, personal initiatives, your body",
    questions: "How am I showing up? What new beginning is calling?"
  },
  2: { 
    name: "2nd House (Resources)", 
    keywords: "money, values, possessions, self-worth",
    lifeArea: "finances, what you own, what you value most",
    questions: "What do I truly value? How is my relationship with money?"
  },
  3: { 
    name: "3rd House (Mind)", 
    keywords: "communication, learning, siblings, local travel",
    lifeArea: "daily conversations, writing, short trips, mental processes",
    questions: "What message wants to be shared? What am I learning?"
  },
  4: { 
    name: "4th House (Roots)", 
    keywords: "home, family, emotional foundation, ancestry",
    lifeArea: "your private life, parents, where you feel safe",
    questions: "What does home mean to me? What needs healing in my roots?"
  },
  5: { 
    name: "5th House (Joy)", 
    keywords: "creativity, romance, children, self-expression",
    lifeArea: "what brings you joy, creative projects, dating, play",
    questions: "What wants to be created? Where is my joy?"
  },
  6: { 
    name: "6th House (Service)", 
    keywords: "health, daily work, routines, self-improvement",
    lifeArea: "your job, health habits, how you serve others",
    questions: "How can I serve better? What does my body need?"
  },
  7: { 
    name: "7th House (Partnership)", 
    keywords: "relationships, marriage, contracts, others",
    lifeArea: "committed partnerships, what you attract in others",
    questions: "What do I need from partnership? What am I projecting?"
  },
  8: { 
    name: "8th House (Transformation)", 
    keywords: "shared resources, intimacy, death/rebirth, the occult",
    lifeArea: "other people's money, deep intimacy, psychological depths",
    questions: "What must die so I can be reborn? What power am I reclaiming?"
  },
  9: { 
    name: "9th House (Expansion)", 
    keywords: "higher learning, travel, philosophy, publishing",
    lifeArea: "beliefs, long journeys, teaching, spiritual seeking",
    questions: "What do I believe? Where am I meant to expand?"
  },
  10: { 
    name: "10th House (Legacy)", 
    keywords: "career, public image, authority, achievement",
    lifeArea: "your reputation, life's work, relationship with authority",
    questions: "What is my calling? How do I want to be remembered?"
  },
  11: { 
    name: "11th House (Community)", 
    keywords: "friends, groups, hopes, collective causes",
    lifeArea: "friendships, networks, dreams for the future, activism",
    questions: "What is my vision for the future? Who are my people?"
  },
  12: { 
    name: "12th House (Spirit)", 
    keywords: "subconscious, solitude, spirituality, hidden matters",
    lifeArea: "dreams, meditation, what's hidden, self-undoing patterns",
    questions: "What am I avoiding? What wants to be surrendered?"
  },
};

// Get element compatibility interpretation
const getElementCompatibility = (sign1: string, sign2: string): string => {
  const q1 = SIGN_QUALITIES[sign1];
  const q2 = SIGN_QUALITIES[sign2];
  if (!q1 || !q2) return "";
  
  if (q1.element === q2.element) {
    return `Same element (${q1.element})! Natural understanding and flow.`;
  }
  
  const compatible = {
    Fire: "Air",
    Air: "Fire",
    Earth: "Water",
    Water: "Earth"
  };
  
  if (compatible[q1.element as keyof typeof compatible] === q2.element) {
    return `${q1.element} and ${q2.element} support each other. Complementary energies.`;
  }
  
  return `${q1.element} meets ${q2.element}. Different approaches create creative tension.`;
};

// Get practical advice based on aspect and houses
const getPracticalAdvice = (
  transitPlanet: string,
  natalPlanet: string,
  aspect: string,
  transitHouse: number | null,
  natalHouse: number | null
): string[] => {
  const advice: string[] = [];
  
  // Aspect-based advice
  if (aspect === "conjunction") {
    advice.push("Focus intensely on this area today");
    advice.push("New beginnings are favored");
  } else if (aspect === "trine") {
    advice.push("Flow with this easy energy");
    advice.push("Trust your natural talents");
  } else if (aspect === "square") {
    advice.push("Take action despite resistance");
    advice.push("Growth comes through the friction");
  } else if (aspect === "opposition") {
    advice.push("Seek balance between extremes");
    advice.push("Learn from what others mirror to you");
  } else if (aspect === "sextile") {
    advice.push("Take advantage of opportunities");
    advice.push("Small actions lead to good results");
  }
  
  // House-based advice
  if (transitHouse) {
    const houseAdvice: Record<number, string> = {
      1: "Focus on yourself and your personal goals",
      2: "Attend to money matters and what you value",
      3: "Communicate, write, or have important conversations",
      4: "Spend time at home or with family",
      5: "Create, play, or enjoy romance",
      6: "Focus on health, work habits, and service",
      7: "Engage with partners and important relationships",
      8: "Go deep—transformation and intimacy work is favored",
      9: "Learn, travel, or explore new philosophies",
      10: "Take public action on career and reputation",
      11: "Connect with community and friends",
      12: "Rest, meditate, and process the unconscious",
    };
    if (houseAdvice[transitHouse]) {
      advice.push(houseAdvice[transitHouse]);
    }
  }
  
  // Planet-specific advice
  const planetAdvice: Record<string, string> = {
    Moon: "Honor your emotional needs today",
    Mercury: "Good for important communications and decisions",
    Venus: "Enjoy beauty, love, and pleasure",
    Mars: "Take bold action on what matters",
    Jupiter: "Expand and say yes to opportunities",
    Saturn: "Accept responsibility and build structure",
    Uranus: "Expect the unexpected; embrace change",
    Neptune: "Trust your intuition; create or dream",
    Pluto: "Let go of what no longer serves you",
  };
  
  if (planetAdvice[transitPlanet]) {
    advice.push(planetAdvice[transitPlanet]);
  }
  
  return advice.slice(0, 5); // Max 5 items
};

// Get personalized journal prompt
const getDetailedJournalPrompt = (
  transitPlanet: string,
  natalPlanet: string,
  aspect: string,
  transitHouse: number | null,
  natalHouse: number | null
): string => {
  const transitHouseInfo = transitHouse ? HOUSE_DETAILED[transitHouse] : null;
  const natalHouseInfo = natalHouse ? HOUSE_DETAILED[natalHouse] : null;
  
  // Specific prompts for major transits
  const specificPrompts: Record<string, string> = {
    "Sun-Sun-conjunction": "Who am I becoming? What new identity is emerging?",
    "Moon-Moon-conjunction": "What am I feeling most deeply right now?",
    "Venus-Venus-conjunction": "What do I truly love and value today?",
    "Mars-Mars-conjunction": "What brave action is calling me?",
    "Saturn-Saturn-conjunction": "What structure am I building for my life?",
    "Jupiter-Sun-conjunction": "Where am I ready to expand and grow?",
    "Pluto-Sun-conjunction": "What old self must die for the new me to emerge?",
  };
  
  const key = `${transitPlanet}-${natalPlanet}-${aspect}`;
  if (specificPrompts[key]) {
    return specificPrompts[key];
  }
  
  // House-based prompts
  if (transitHouseInfo && natalHouseInfo) {
    return `How does ${transitHouseInfo.keywords.split(",")[0]} (${transitHouse}H) connect to ${natalHouseInfo.keywords.split(",")[0]} (${natalHouse}H) in my life today?`;
  }
  
  if (transitHouseInfo) {
    return transitHouseInfo.questions;
  }
  
  // Generic prompts by natal planet
  const natalPrompts: Record<string, string> = {
    Sun: "How is this affecting my sense of self and identity?",
    Moon: "What emotions are arising? What do I need to feel safe?",
    Mercury: "What thoughts or messages are important today?",
    Venus: "What is bringing me joy or beauty today?",
    Mars: "What action am I called to take?",
    Jupiter: "Where is growth and expansion happening?",
    Saturn: "What responsibility or lesson is presenting itself?",
    Chiron: "What healing is possible today?",
    NorthNode: "How is this aligning me with my purpose?",
  };
  
  return natalPrompts[natalPlanet] || "How am I experiencing this energy today?";
};

// Get house connection interpretation
const getHouseConnection = (
  transitHouse: number | null,
  natalHouse: number | null,
  aspect: string
): string => {
  if (!transitHouse || !natalHouse) return "";
  
  const th = HOUSE_DETAILED[transitHouse];
  const nh = HOUSE_DETAILED[natalHouse];
  if (!th || !nh) return "";
  
  const aspectVerb = aspect === "trine" || aspect === "sextile" 
    ? "flows naturally to" 
    : aspect === "square" || aspect === "opposition"
    ? "creates tension with"
    : "merges with";
  
  return `Energy from your ${th.keywords.split(",")[0]} (${transitHouse}H) ${aspectVerb} your ${nh.keywords.split(",")[0]} (${natalHouse}H).`;
};

// Main function to generate detailed interpretation
export interface DetailedInterpretation {
  header: string;
  transitEssence: string;
  natalEssence: string;
  aspectMeaning: string;
  transitSignInfo: string;
  natalSignInfo: string;
  elementCompatibility: string;
  transitHouseInfo: string;
  natalHouseInfo: string;
  houseConnection: string;
  practicalAdvice: string[];
  journalPrompt: string;
}

export const getDetailedInterpretation = (
  transitPlanet: string,
  transitSign: string,
  transitDegree: number,
  transitHouse: number | null,
  natalPlanet: string,
  natalSign: string,
  natalDegree: number,
  natalHouse: number | null,
  aspect: string,
  orb: string
): DetailedInterpretation => {
  const transitQ = SIGN_QUALITIES[transitSign];
  const natalQ = SIGN_QUALITIES[natalSign];
  const aspectInfo = ASPECT_MEANINGS[aspect];
  const transitH = transitHouse ? HOUSE_DETAILED[transitHouse] : null;
  const natalH = natalHouse ? HOUSE_DETAILED[natalHouse] : null;
  
  return {
    header: `Transit ${transitPlanet} (${transitDegree}° ${transitSign}${transitHouse ? `, ${transitHouse}H` : ""}) ${aspect}s Natal ${natalPlanet} (${natalDegree}° ${natalSign}${natalHouse ? `, ${natalHouse}H` : ""})`,
    
    transitEssence: PLANET_ESSENCES[transitPlanet] || `${transitPlanet} energy is active.`,
    natalEssence: PLANET_ESSENCES[natalPlanet] || `Your natal ${natalPlanet} is activated.`,
    
    aspectMeaning: aspectInfo 
      ? `${aspectInfo.symbol} ${aspect.toUpperCase()} — ${aspectInfo.meaning}`
      : `${aspect} aspect`,
    
    transitSignInfo: transitQ 
      ? `${transitPlanet} in ${transitSign.toUpperCase()} (${transitQ.element}/${transitQ.mode}): ${transitQ.energy}`
      : `${transitPlanet} in ${transitSign}`,
    
    natalSignInfo: natalQ
      ? `${natalPlanet} in ${natalSign.toUpperCase()} (${natalQ.element}/${natalQ.mode}): ${natalQ.energy}`
      : `${natalPlanet} in ${natalSign}`,
    
    elementCompatibility: getElementCompatibility(transitSign, natalSign),
    
    transitHouseInfo: transitH
      ? `${transitH.name}: ${transitH.lifeArea}`
      : "",
    
    natalHouseInfo: natalH
      ? `${natalH.name}: ${natalH.lifeArea}`
      : "",
    
    houseConnection: getHouseConnection(transitHouse, natalHouse, aspect),
    
    practicalAdvice: getPracticalAdvice(transitPlanet, natalPlanet, aspect, transitHouse, natalHouse),
    
    journalPrompt: getDetailedJournalPrompt(transitPlanet, natalPlanet, aspect, transitHouse, natalHouse),
  };
};
