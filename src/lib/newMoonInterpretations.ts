import * as Astronomy from 'astronomy-engine';

// Sign rulers and their themes
const SIGN_RULERS: Record<string, { ruler: string; rulerSymbol: string; theme: string; element: string; modality: string }> = {
  Aries: { ruler: 'Mars', rulerSymbol: '♂', theme: 'initiation, courage, identity', element: 'Fire', modality: 'Cardinal' },
  Taurus: { ruler: 'Venus', rulerSymbol: '♀', theme: 'security, values, embodiment', element: 'Earth', modality: 'Fixed' },
  Gemini: { ruler: 'Mercury', rulerSymbol: '☿', theme: 'communication, learning, connections', element: 'Air', modality: 'Mutable' },
  Cancer: { ruler: 'Moon', rulerSymbol: '☽', theme: 'home, family, emotional roots', element: 'Water', modality: 'Cardinal' },
  Leo: { ruler: 'Sun', rulerSymbol: '☉', theme: 'creativity, self-expression, joy', element: 'Fire', modality: 'Fixed' },
  Virgo: { ruler: 'Mercury', rulerSymbol: '☿', theme: 'service, health, refinement', element: 'Earth', modality: 'Mutable' },
  Libra: { ruler: 'Venus', rulerSymbol: '♀', theme: 'relationships, balance, beauty', element: 'Air', modality: 'Cardinal' },
  Scorpio: { ruler: 'Pluto', rulerSymbol: '♇', theme: 'transformation, depth, power', element: 'Water', modality: 'Fixed' },
  Sagittarius: { ruler: 'Jupiter', rulerSymbol: '♃', theme: 'expansion, truth, adventure', element: 'Fire', modality: 'Mutable' },
  Capricorn: { ruler: 'Saturn', rulerSymbol: '♄', theme: 'structure, goals, mastery', element: 'Earth', modality: 'Cardinal' },
  Aquarius: { ruler: 'Uranus', rulerSymbol: '♅', theme: 'innovation, community, freedom', element: 'Air', modality: 'Fixed' },
  Pisces: { ruler: 'Neptune', rulerSymbol: '♆', theme: 'spirituality, imagination, healing', element: 'Water', modality: 'Mutable' },
};

// Planet meanings for aspects
const PLANET_MEANINGS: Record<string, { symbol: string; energy: string; gift: string }> = {
  Sun: { symbol: '☉', energy: 'identity, ego, vitality', gift: 'conscious intention' },
  Moon: { symbol: '☽', energy: 'emotions, instincts, needs', gift: 'emotional depth' },
  Mercury: { symbol: '☿', energy: 'mind, communication, thinking', gift: 'mental clarity' },
  Venus: { symbol: '♀', energy: 'love, values, beauty', gift: 'heart connection' },
  Mars: { symbol: '♂', energy: 'action, drive, assertion', gift: 'motivation and heat' },
  Jupiter: { symbol: '♃', energy: 'expansion, faith, abundance', gift: 'growth and blessing' },
  Saturn: { symbol: '♄', energy: 'structure, discipline, time', gift: 'lasting foundations' },
  Uranus: { symbol: '♅', energy: 'change, awakening, freedom', gift: 'breakthrough insights' },
  Neptune: { symbol: '♆', energy: 'dreams, intuition, transcendence', gift: 'spiritual connection' },
  Pluto: { symbol: '♇', energy: 'transformation, power, depth', gift: 'soul-level intention' },
};

// Retrograde meanings
const RETROGRADE_MEANINGS: Record<string, string> = {
  Mercury: 'review communications and plans',
  Venus: 'reassess values and relationships',
  Mars: 'redirect energy and reconsider actions',
  Jupiter: 'internalize growth and question beliefs',
  Saturn: 'restructure foundations and review commitments',
  Uranus: 'internal awakening and personal revolution',
  Neptune: 'spiritual introspection and dissolving illusions',
  Pluto: 'deep inner transformation and soul work',
};

interface PlanetPosition {
  name: string;
  symbol: string;
  longitude: number;
  sign: string;
  degree: number;
  isRetrograde: boolean;
}

interface NewMoonAspect {
  planet: string;
  symbol: string;
  aspectType: string;
  aspectSymbol: string;
  orb: number;
  meaning: string;
}

export interface NewMoonInterpretation {
  sign: string;
  signSymbol: string;
  degree: number;
  ruler: string;
  rulerSymbol: string;
  rulerSign: string;
  rulerCondition: string;
  signTheme: string;
  element: string;
  modality: string;
  
  // Aspects to the New Moon (Sun/Moon conjunction)
  aspects: NewMoonAspect[];
  
  // Planets conjunct the New Moon
  conjunctions: PlanetPosition[];
  
  // Stellium info
  hasStellium: boolean;
  stelliumPlanets: string[];
  stelliumSign: string;
  
  // Ruler's aspects and condition
  rulerRetrograde: boolean;
  rulerAspects: NewMoonAspect[];
  
  // The story/interpretation
  mainTheme: string;
  whatToSet: string;
  howToWork: string;
  soulLevel: string;
  practicalAdvice: string;
}

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const getSignFromLongitude = (longitude: number): string => {
  const signIndex = Math.floor(((longitude % 360) + 360) % 360 / 30);
  return ZODIAC_SIGNS[signIndex];
};

const getSignSymbol = (sign: string): string => {
  const symbols: Record<string, string> = {
    Aries: '♈', Taurus: '♉', Gemini: '♊', Cancer: '♋',
    Leo: '♌', Virgo: '♍', Libra: '♎', Scorpio: '♏',
    Sagittarius: '♐', Capricorn: '♑', Aquarius: '♒', Pisces: '♓'
  };
  return symbols[sign] || '';
};

const isPlanetRetrograde = (body: Astronomy.Body, date: Date): boolean => {
  try {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayVector = Astronomy.GeoVector(body, date, false);
    const yesterdayVector = Astronomy.GeoVector(body, yesterday, false);
    
    const todayEcliptic = Astronomy.Ecliptic(todayVector);
    const yesterdayEcliptic = Astronomy.Ecliptic(yesterdayVector);
    
    let diff = todayEcliptic.elon - yesterdayEcliptic.elon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    return diff < 0;
  } catch {
    return false;
  }
};

const getPlanetaryPositions = (date: Date): PlanetPosition[] => {
  const planets: { name: string; body: Astronomy.Body; symbol: string }[] = [
    { name: 'Mercury', body: Astronomy.Body.Mercury, symbol: '☿' },
    { name: 'Venus', body: Astronomy.Body.Venus, symbol: '♀' },
    { name: 'Mars', body: Astronomy.Body.Mars, symbol: '♂' },
    { name: 'Jupiter', body: Astronomy.Body.Jupiter, symbol: '♃' },
    { name: 'Saturn', body: Astronomy.Body.Saturn, symbol: '♄' },
    { name: 'Uranus', body: Astronomy.Body.Uranus, symbol: '♅' },
    { name: 'Neptune', body: Astronomy.Body.Neptune, symbol: '♆' },
    { name: 'Pluto', body: Astronomy.Body.Pluto, symbol: '♇' },
  ];
  
  return planets.map(p => {
    try {
      const vector = Astronomy.GeoVector(p.body, date, false);
      const ecliptic = Astronomy.Ecliptic(vector);
      const longitude = ecliptic.elon;
      const sign = getSignFromLongitude(longitude);
      const degree = Math.floor(longitude % 30);
      const isRetrograde = isPlanetRetrograde(p.body, date);
      
      return {
        name: p.name,
        symbol: p.symbol,
        longitude,
        sign,
        degree,
        isRetrograde
      };
    } catch {
      return {
        name: p.name,
        symbol: p.symbol,
        longitude: 0,
        sign: 'Aries',
        degree: 0,
        isRetrograde: false
      };
    }
  });
};

const calculateAspect = (lon1: number, lon2: number): { type: string; symbol: string; orb: number } | null => {
  let diff = Math.abs(lon1 - lon2);
  if (diff > 180) diff = 360 - diff;
  
  // Conjunction
  if (diff < 10) return { type: 'conjunction', symbol: '☌', orb: diff };
  // Sextile
  if (Math.abs(diff - 60) < 6) return { type: 'sextile', symbol: '⚹', orb: Math.abs(diff - 60) };
  // Square
  if (Math.abs(diff - 90) < 8) return { type: 'square', symbol: '□', orb: Math.abs(diff - 90) };
  // Trine
  if (Math.abs(diff - 120) < 8) return { type: 'trine', symbol: '△', orb: Math.abs(diff - 120) };
  // Opposition
  if (Math.abs(diff - 180) < 8) return { type: 'opposition', symbol: '☍', orb: Math.abs(diff - 180) };
  
  return null;
};

const getAspectMeaning = (planet: string, aspectType: string): string => {
  const planetInfo = PLANET_MEANINGS[planet];
  if (!planetInfo) return '';
  
  switch (aspectType) {
    case 'conjunction':
      return `${planetInfo.symbol} ${planet} amplifies this cycle with ${planetInfo.gift}`;
    case 'sextile':
      return `${planetInfo.symbol} ${planet} offers opportunity through ${planetInfo.energy}`;
    case 'trine':
      return `${planetInfo.symbol} ${planet} flows support via ${planetInfo.gift}`;
    case 'square':
      return `${planetInfo.symbol} ${planet} challenges growth around ${planetInfo.energy}`;
    case 'opposition':
      return `${planetInfo.symbol} ${planet} brings awareness to balance ${planetInfo.energy}`;
    default:
      return '';
  }
};

const generateMainTheme = (
  sign: string,
  signInfo: typeof SIGN_RULERS[string],
  conjunctions: PlanetPosition[],
  aspects: NewMoonAspect[],
  rulerSign: string,
  rulerRetrograde: boolean
): string => {
  let theme = `This ${sign} New Moon activates ${signInfo.theme}. `;
  
  // Add ruler context
  if (rulerRetrograde) {
    theme += `${signInfo.ruler} ${signInfo.rulerSymbol} (ruler) is retrograde in ${rulerSign}, inviting ${RETROGRADE_MEANINGS[signInfo.ruler] || 'inner reflection'}. `;
  } else {
    theme += `${signInfo.ruler} ${signInfo.rulerSymbol} in ${rulerSign} guides how this energy manifests. `;
  }
  
  // Add conjunction info (most important)
  if (conjunctions.length > 0) {
    const conjNames = conjunctions.map(c => `${c.symbol}${c.name}`).join(', ');
    theme += `With ${conjNames} conjunct, this is a powerful moment of concentrated energy. `;
    
    // Special meanings for specific conjunctions
    if (conjunctions.some(c => c.name === 'Pluto')) {
      theme += `Pluto adds soul-depth — set intentions from your deepest truth, not ego desires. `;
    }
    if (conjunctions.some(c => c.name === 'Mars')) {
      theme += `Mars brings fire and urgency — your mind may be active, ready to act. `;
    }
    if (conjunctions.some(c => c.name === 'Mercury')) {
      theme += `Mercury heightens mental activity — thoughts are seeds now. `;
    }
    if (conjunctions.some(c => c.name === 'Venus')) {
      theme += `Venus softens the energy — intentions around love, beauty, and values are favored. `;
    }
  }
  
  return theme;
};

const generateWhatToSet = (
  sign: string,
  signInfo: typeof SIGN_RULERS[string],
  conjunctions: PlanetPosition[],
  degree: number
): string => {
  let advice = '';
  
  // Sign-specific intentions
  switch (sign) {
    case 'Capricorn':
      advice = 'Set intentions around long-term goals, career, public role, building lasting structures. ';
      break;
    case 'Sagittarius':
      advice = 'Set intentions around expansion, truth-seeking, travel, higher learning, faith. ';
      break;
    case 'Aquarius':
      advice = 'Set intentions around innovation, community, humanitarian goals, personal freedom. ';
      break;
    case 'Pisces':
      advice = 'Set intentions around spiritual growth, creativity, healing, compassion, letting go. ';
      break;
    case 'Aries':
      advice = 'Set intentions around new beginnings, courage, identity, taking initiative. ';
      break;
    case 'Taurus':
      advice = 'Set intentions around stability, resources, self-worth, physical comfort. ';
      break;
    case 'Gemini':
      advice = 'Set intentions around communication, learning, local connections, mental flexibility. ';
      break;
    case 'Cancer':
      advice = 'Set intentions around home, family, emotional security, nurturing. ';
      break;
    case 'Leo':
      advice = 'Set intentions around creative expression, joy, romance, self-confidence. ';
      break;
    case 'Virgo':
      advice = 'Set intentions around health, service, organization, refinement of skills. ';
      break;
    case 'Libra':
      advice = 'Set intentions around relationships, balance, beauty, diplomacy. ';
      break;
    case 'Scorpio':
      advice = 'Set intentions around transformation, shared resources, intimacy, power. ';
      break;
  }
  
  // Late degree (28-29°) = culmination/completion
  if (degree >= 28) {
    advice += `At ${degree}° — the final degrees — there's a sense of completion and mastery with this energy. `;
  }
  
  // Add conjunction influence on what to set
  if (conjunctions.some(c => c.name === 'Pluto')) {
    advice += 'With Pluto present, set soul-level intentions — what does your deepest self truly want? ';
  }
  if (conjunctions.some(c => c.name === 'Saturn')) {
    advice += 'Saturn helps crystallize intentions into concrete, achievable plans. ';
  }
  if (conjunctions.some(c => c.name === 'Jupiter')) {
    advice += 'Jupiter expands possibilities — dream bigger than usual. ';
  }
  
  return advice;
};

const generateHowToWork = (
  aspects: NewMoonAspect[],
  signInfo: typeof SIGN_RULERS[string],
  rulerSign: string,
  rulerAspects: NewMoonAspect[]
): string => {
  let howTo = '';
  
  // Look for helpful aspects (sextile/trine)
  const supportingAspects = aspects.filter(a => a.aspectType === 'sextile' || a.aspectType === 'trine');
  const challengingAspects = aspects.filter(a => a.aspectType === 'square' || a.aspectType === 'opposition');
  
  if (supportingAspects.length > 0) {
    howTo += `Support comes from: ${supportingAspects.map(a => a.meaning).join('. ')}. `;
  }
  
  if (challengingAspects.length > 0) {
    howTo += `Navigate tensions: ${challengingAspects.map(a => a.meaning).join('. ')}. `;
  }
  
  // Ruler condition
  const rulerSupport = rulerAspects.filter(a => a.aspectType === 'sextile' || a.aspectType === 'trine');
  if (rulerSupport.length > 0) {
    howTo += `The ruler (${signInfo.ruler}) receives support — ${rulerSupport[0].meaning}. `;
  }
  
  return howTo || 'Work with the natural flow of this lunar energy through reflection and intentional action.';
};

const generateSoulLevel = (
  conjunctions: PlanetPosition[],
  sign: string,
  rulerRetrograde: boolean
): string => {
  let soul = '';
  
  if (conjunctions.some(c => c.name === 'Pluto')) {
    soul = 'Pluto with the New Moon means this cycle works at the soul level. Your ego may want one thing, but what does your soul truly intend? Set intentions from empowerment and truth, not fear or control. This is about deep, lasting transformation.';
  } else if (conjunctions.some(c => c.name === 'Neptune')) {
    soul = 'Neptune\'s presence dissolves boundaries — trust intuition, work with dreams, allow spiritual guidance to inform your intentions.';
  } else if (conjunctions.some(c => c.name === 'Uranus')) {
    soul = 'Uranus brings unexpected awakenings — be open to sudden insights that change what you thought you wanted.';
  } else if (rulerRetrograde) {
    soul = 'With the ruler retrograde, this is a time for inner work rather than outer pushing. Let intentions germinate internally before acting.';
  } else {
    soul = `${sign} energy at the soul level is about ${SIGN_RULERS[sign]?.theme || 'growth'}. Connect with what truly matters.`;
  }
  
  return soul;
};

const generatePracticalAdvice = (
  sign: string,
  signInfo: typeof SIGN_RULERS[string],
  conjunctions: PlanetPosition[],
  hasStellium: boolean,
  stelliumPlanets: string[]
): string => {
  let practical = '';
  
  // Element-based timing
  switch (signInfo.element) {
    case 'Earth':
      practical = 'Practical timing: Good for planning, organizing, building tangible foundations. Write down goals. ';
      break;
    case 'Fire':
      practical = 'Practical timing: Good for starting projects, taking bold action, physical activity. ';
      break;
    case 'Air':
      practical = 'Practical timing: Good for communication, networking, learning new information. ';
      break;
    case 'Water':
      practical = 'Practical timing: Good for emotional processing, creative work, spiritual practice. ';
      break;
  }
  
  // Cardinal/Fixed/Mutable
  if (signInfo.modality === 'Cardinal') {
    practical += 'Cardinal energy initiates — this is the right time to BEGIN something new. ';
  } else if (signInfo.modality === 'Fixed') {
    practical += 'Fixed energy consolidates — focus on strengthening existing foundations. ';
  } else {
    practical += 'Mutable energy adapts — be flexible and open to changing direction. ';
  }
  
  // Stellium advice
  if (hasStellium && stelliumPlanets.length >= 4) {
    practical += `With ${stelliumPlanets.length} planets concentrated together, this is a rare moment of focused energy — use it wisely for major intentions. `;
  }
  
  // Specific conjunction advice
  if (conjunctions.some(c => c.name === 'Mars' && c.symbol)) {
    practical += 'Mars energy may feel like mental busyness or physical heat — channel it into action rather than anxiety. ';
  }
  if (conjunctions.some(c => c.name === 'Mercury')) {
    practical += 'Write your intentions down — Mercury makes the written word powerful now. ';
  }
  
  return practical;
};

export const getNewMoonInterpretation = (date: Date, moonLongitude: number): NewMoonInterpretation => {
  const sign = getSignFromLongitude(moonLongitude);
  const signSymbol = getSignSymbol(sign);
  const degree = Math.floor(moonLongitude % 30);
  const signInfo = SIGN_RULERS[sign];
  
  // Get all planetary positions
  const planets = getPlanetaryPositions(date);
  
  // Find the ruler's position
  const rulerPlanet = planets.find(p => p.name === signInfo.ruler);
  const rulerSign = rulerPlanet?.sign || sign;
  const rulerRetrograde = rulerPlanet?.isRetrograde || false;
  
  // Calculate aspects to the New Moon (Sun/Moon position)
  const aspects: NewMoonAspect[] = [];
  const conjunctions: PlanetPosition[] = [];
  
  planets.forEach(planet => {
    const aspect = calculateAspect(moonLongitude, planet.longitude);
    if (aspect) {
      const aspectInfo: NewMoonAspect = {
        planet: planet.name,
        symbol: planet.symbol,
        aspectType: aspect.type,
        aspectSymbol: aspect.symbol,
        orb: Math.round(aspect.orb * 10) / 10,
        meaning: getAspectMeaning(planet.name, aspect.type)
      };
      
      if (aspect.type === 'conjunction') {
        conjunctions.push(planet);
      }
      aspects.push(aspectInfo);
    }
  });
  
  // Check for stellium (4+ planets in same sign)
  const signCounts: Record<string, PlanetPosition[]> = {};
  // Include Sun and Moon
  signCounts[sign] = [{ name: 'Sun', symbol: '☉', longitude: moonLongitude, sign, degree, isRetrograde: false },
                       { name: 'Moon', symbol: '☽', longitude: moonLongitude, sign, degree, isRetrograde: false }];
  
  planets.forEach(p => {
    if (!signCounts[p.sign]) signCounts[p.sign] = [];
    signCounts[p.sign].push(p);
  });
  
  let hasStellium = false;
  let stelliumPlanets: string[] = [];
  let stelliumSign = '';
  
  Object.entries(signCounts).forEach(([s, ps]) => {
    if (ps.length >= 4) {
      hasStellium = true;
      stelliumPlanets = ps.map(p => `${p.symbol}${p.name}`);
      stelliumSign = s;
    }
  });
  
  // Calculate ruler's aspects
  const rulerAspects: NewMoonAspect[] = [];
  if (rulerPlanet) {
    planets.forEach(planet => {
      if (planet.name !== signInfo.ruler) {
        const aspect = calculateAspect(rulerPlanet.longitude, planet.longitude);
        if (aspect) {
          rulerAspects.push({
            planet: planet.name,
            symbol: planet.symbol,
            aspectType: aspect.type,
            aspectSymbol: aspect.symbol,
            orb: Math.round(aspect.orb * 10) / 10,
            meaning: getAspectMeaning(planet.name, aspect.type)
          });
        }
      }
    });
  }
  
  // Determine ruler condition
  let rulerCondition = 'neutral';
  if (rulerPlanet) {
    // Check if ruler is in own sign or exalted
    if (rulerPlanet.sign === sign) {
      rulerCondition = 'strong (in own sign)';
    } else if (
      (signInfo.ruler === 'Saturn' && rulerPlanet.sign === 'Libra') ||
      (signInfo.ruler === 'Jupiter' && rulerPlanet.sign === 'Cancer') ||
      (signInfo.ruler === 'Venus' && rulerPlanet.sign === 'Pisces') ||
      (signInfo.ruler === 'Mars' && rulerPlanet.sign === 'Capricorn')
    ) {
      rulerCondition = 'exalted';
    } else if (rulerRetrograde) {
      rulerCondition = 'retrograde (internalized)';
    }
  }
  
  return {
    sign,
    signSymbol,
    degree,
    ruler: signInfo.ruler,
    rulerSymbol: signInfo.rulerSymbol,
    rulerSign,
    rulerCondition,
    signTheme: signInfo.theme,
    element: signInfo.element,
    modality: signInfo.modality,
    aspects,
    conjunctions,
    hasStellium,
    stelliumPlanets,
    stelliumSign,
    rulerRetrograde,
    rulerAspects,
    mainTheme: generateMainTheme(sign, signInfo, conjunctions, aspects, rulerSign, rulerRetrograde),
    whatToSet: generateWhatToSet(sign, signInfo, conjunctions, degree),
    howToWork: generateHowToWork(aspects, signInfo, rulerSign, rulerAspects),
    soulLevel: generateSoulLevel(conjunctions, sign, rulerRetrograde),
    practicalAdvice: generatePracticalAdvice(sign, signInfo, conjunctions, hasStellium, stelliumPlanets),
  };
};

// Generate a short summary for the table view
export const getNewMoonSummary = (date: Date, moonLongitude: number): string => {
  const interp = getNewMoonInterpretation(date, moonLongitude);
  
  let summary = '';
  
  // Sign ruler info
  summary += `Ruler: ${interp.rulerSymbol}${interp.ruler} in ${interp.rulerSign}`;
  if (interp.rulerRetrograde) summary += ' ℞';
  
  // Conjunctions
  if (interp.conjunctions.length > 0) {
    const conjSymbols = interp.conjunctions.map(c => c.symbol).join('');
    summary += ` | ${conjSymbols} conjunct`;
  }
  
  // Key aspect
  const helpfulAspect = interp.aspects.find(a => a.aspectType === 'sextile' || a.aspectType === 'trine');
  if (helpfulAspect) {
    summary += ` | ${helpfulAspect.symbol}${helpfulAspect.aspectSymbol} support`;
  }
  
  // Stellium
  if (interp.hasStellium) {
    summary += ` | ${interp.stelliumPlanets.length}-planet stellium!`;
  }
  
  return summary;
};
