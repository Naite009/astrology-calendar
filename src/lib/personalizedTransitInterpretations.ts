// Personalized Transit Interpretation System
// Generates interpretations based on: transit planet + aspect + natal planet + natal house + natal sign

interface PersonalizedTransitResult {
  meaning: string;
  howItFeels: string;
}

// Aspect modifiers - how the aspect type colors the transit
const ASPECT_MODIFIERS = {
  conjunction: {
    energy: 'intensified fusion',
    experience: 'overwhelming immersion',
    action: 'You cannot escape or compartmentalize this',
    challenge: 'The energy is so close it can feel like you ARE it',
  },
  trine: {
    energy: 'flowing support',
    experience: 'natural ease',
    action: 'This comes so easily you might not notice it',
    challenge: 'You may coast without fully claiming the gift',
  },
  square: {
    energy: 'friction that demands action',
    experience: 'uncomfortable pressure',
    action: 'You must DO something or the tension builds',
    challenge: 'This will not let you stay comfortable',
  },
  opposition: {
    energy: 'projection and awareness',
    experience: 'seeing yourself in others',
    action: 'Others seem to embody what you need to integrate',
    challenge: 'The lesson comes through relationships and mirrors',
  },
  sextile: {
    energy: 'opportunity awaiting effort',
    experience: 'gentle invitation',
    action: 'You must reach for this - it will not force itself',
    challenge: 'Easy to miss if you are not paying attention',
  },
};

// Natal planet meanings - what part of you is being activated
const NATAL_PLANET_MEANINGS: Record<string, { area: string; feels: string }> = {
  Sun: { area: 'your core identity and sense of purpose', feels: 'who you ARE at the deepest level' },
  Moon: { area: 'your emotional needs and instinctual responses', feels: 'your gut, your comfort zone, your inner child' },
  Mercury: { area: 'how you think, communicate, and process', feels: 'your mental patterns and how you speak your truth' },
  Venus: { area: 'what you love, value, and attract', feels: 'your sense of beauty, pleasure, and self-worth' },
  Mars: { area: 'how you act, assert, and pursue', feels: 'your drive, anger, and sexual energy' },
  Jupiter: { area: 'where you seek growth and meaning', feels: 'your faith, optimism, and sense of abundance' },
  Saturn: { area: 'your structures, limits, and responsibilities', feels: 'your fears, duties, and hard-won authority' },
  Uranus: { area: 'your need for freedom and authenticity', feels: 'your rebellious streak and unique genius' },
  Neptune: { area: 'your dreams, intuition, and spiritual connection', feels: 'where you dissolve boundaries and seek transcendence' },
  Pluto: { area: 'your power, shadows, and capacity for transformation', feels: 'your obsessions and where you have died before' },
  NorthNode: { area: 'your soul direction and evolutionary path', feels: 'what you are growing TOWARD in this lifetime' },
  SouthNode: { area: 'your past patterns and karmic gifts', feels: 'your comfort zone and what you need to release' },
  Chiron: { area: 'your deepest wound and healing gift', feels: 'where you carry pain that becomes wisdom' },
  Ascendant: { area: 'how you approach life and appear to others', feels: 'your automatic way of meeting the world' },
  Midheaven: { area: 'your public role and life direction', feels: 'your calling and how you want to be seen' },
};

// House meanings - WHERE in life this plays out
const HOUSE_CONTEXTS: Record<number, { domain: string; examples: string }> = {
  1: { domain: 'self-image and personal identity', examples: 'how you present yourself, your appearance, your sense of "I am"' },
  2: { domain: 'resources, money, and self-worth', examples: 'your finances, possessions, what you value and how you earn' },
  3: { domain: 'communication and immediate environment', examples: 'siblings, neighbors, daily errands, how you learn and speak' },
  4: { domain: 'home, family, and emotional foundations', examples: 'your parents, ancestry, living situation, private emotional life' },
  5: { domain: 'creativity, romance, and self-expression', examples: 'children, hobbies, dating, what brings you joy and play' },
  6: { domain: 'daily work, health, and service', examples: 'your job, routines, physical wellness, pets, being useful' },
  7: { domain: 'partnerships and one-on-one relationships', examples: 'marriage, business partners, close collaborations, open enemies' },
  8: { domain: 'shared resources, intimacy, and transformation', examples: 'other people\'s money, sex, death, psychological depths' },
  9: { domain: 'beliefs, higher education, and expansion', examples: 'travel, philosophy, religion, publishing, foreign cultures' },
  10: { domain: 'career, public reputation, and legacy', examples: 'your profession, status, authority figures, what you are known for' },
  11: { domain: 'community, friends, and future visions', examples: 'groups, social causes, hopes, networking, collective belonging' },
  12: { domain: 'the unconscious, spirituality, and hidden matters', examples: 'dreams, isolation, hospitals, secrets, self-undoing, karma' },
};

// Sign modifiers - HOW the natal planet expresses
const SIGN_EXPRESSION: Record<string, string> = {
  Aries: 'with impulsive directness and a need for independence',
  Taurus: 'with steady determination and a need for security',
  Gemini: 'with curious adaptability and a need for mental stimulation',
  Cancer: 'with protective sensitivity and a need for emotional safety',
  Leo: 'with dramatic flair and a need for recognition',
  Virgo: 'with analytical precision and a need for usefulness',
  Libra: 'with diplomatic grace and a need for harmony',
  Scorpio: 'with intense depth and a need for truth',
  Sagittarius: 'with expansive enthusiasm and a need for freedom',
  Capricorn: 'with disciplined ambition and a need for achievement',
  Aquarius: 'with detached originality and a need for authenticity',
  Pisces: 'with compassionate fluidity and a need for transcendence',
};

// Transit planet intentions - what the outer planet is trying to DO
const TRANSIT_PLANET_ACTIONS: Record<string, { verb: string; effect: string; timeline: string }> = {
  Pluto: { 
    verb: 'transforms and empowers through destruction', 
    effect: 'what was hidden must surface; what is false must die',
    timeline: 'This is a multi-year process that goes deep'
  },
  Neptune: { 
    verb: 'dissolves and inspires through confusion', 
    effect: 'boundaries blur; dreams and illusions intensify',
    timeline: 'This is a gradual sensitizing over years'
  },
  Uranus: { 
    verb: 'awakens and liberates through disruption', 
    effect: 'sudden changes break old patterns; freedom calls',
    timeline: 'Expect the unexpected over the next few years'
  },
  Saturn: { 
    verb: 'structures and limits through pressure', 
    effect: 'reality checks demand maturity; effort pays off',
    timeline: 'This is a 2-3 year test of what is real'
  },
  Jupiter: { 
    verb: 'expands and blesses through opportunity', 
    effect: 'doors open; growth is available if you reach',
    timeline: 'This fortunate window lasts about a year'
  },
  Mars: { 
    verb: 'activates and asserts through energy', 
    effect: 'action is required; conflicts may surface',
    timeline: 'This is an intense burst lasting days to weeks'
  },
  Sun: { 
    verb: 'illuminates and vitalizes through focus', 
    effect: 'attention comes to this area; clarity emerges',
    timeline: 'This is a brief annual spotlight lasting days'
  },
  Venus: { 
    verb: 'attracts and harmonizes through pleasure', 
    effect: 'beauty, love, and ease flow more naturally',
    timeline: 'This is a brief window of grace lasting days'
  },
  Mercury: { 
    verb: 'connects and processes through thought', 
    effect: 'conversations and ideas are activated',
    timeline: 'This is a quick mental activation lasting days'
  },
  Moon: { 
    verb: 'sensitizes and nurtures through feeling', 
    effect: 'emotions rise to the surface',
    timeline: 'This passes in hours as the Moon moves on'
  },
};

// Generate personalized transit interpretation
export function getPersonalizedTransitInterpretation(
  transitPlanet: string,
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null,
  natalSign: string | null
): PersonalizedTransitResult {
  const aspectMod = ASPECT_MODIFIERS[aspect as keyof typeof ASPECT_MODIFIERS] || ASPECT_MODIFIERS.conjunction;
  const natalMeaning = NATAL_PLANET_MEANINGS[natalPlanet] || { area: 'this part of your psyche', feels: 'your inner experience' };
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  const signExpr = natalSign ? SIGN_EXPRESSION[natalSign] : null;
  const transitAction = TRANSIT_PLANET_ACTIONS[transitPlanet] || TRANSIT_PLANET_ACTIONS.Sun;

  // Build the meaning sentence
  let meaning = `Transit ${transitPlanet} ${transitAction.verb}. It is making a ${aspect} to your natal ${natalPlanet}, which governs ${natalMeaning.area}`;
  
  if (houseContext) {
    meaning += ` in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house of ${houseContext.domain}`;
  }
  
  meaning += `. ${aspectMod.action}. ${transitAction.timeline}.`;

  // Build the "how it feels" sentence - this is the personal part
  let howItFeels = '';
  
  // Start with aspect-specific feeling
  if (aspect === 'trine') {
    howItFeels = `This feels like a supportive wind at your back - ${transitPlanet}'s transformative power works WITH your ${natalPlanet}`;
  } else if (aspect === 'square') {
    howItFeels = `This feels like pressure you cannot ignore - ${transitPlanet} is forcing your ${natalPlanet} to evolve through friction`;
  } else if (aspect === 'opposition') {
    howItFeels = `This feels like encountering yourself in a mirror - others may trigger your ${natalPlanet} themes`;
  } else if (aspect === 'conjunction') {
    howItFeels = `This feels all-consuming - ${transitPlanet}'s energy merges completely with your ${natalPlanet}`;
  } else if (aspect === 'sextile') {
    howItFeels = `This feels like a gentle opening - ${transitPlanet} offers gifts to your ${natalPlanet} if you reach for them`;
  }

  // Add house-specific sensation
  if (houseContext && natalHouse) {
    howItFeels += `. Because your ${natalPlanet} lives in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house, this plays out through ${houseContext.examples}`;
  }

  // Add sign coloring
  if (signExpr && natalSign) {
    howItFeels += `. Your ${natalPlanet} in ${natalSign} processes this ${signExpr}`;
  }

  howItFeels += '.';

  return { meaning, howItFeels };
}

// Specific interpretation generators for major outer planet transits
export function getPlutoTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null,
  natalSign: string | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  
  // Base Pluto feeling by aspect
  let baseFeel = '';
  switch (aspect) {
    case 'conjunction':
      baseFeel = `Pluto is fused with your ${natalPlanet}. You are being taken apart and rebuilt in this area. There is no escaping the depth work`;
      break;
    case 'trine':
      baseFeel = `Pluto empowers your ${natalPlanet} from a supportive angle. Transformation flows naturally - you access power without the crisis`;
      break;
    case 'square':
      baseFeel = `Pluto pressures your ${natalPlanet} through friction. Something must change. You feel blocked, obsessed, or forced to confront what you have avoided`;
      break;
    case 'opposition':
      baseFeel = `Pluto faces your ${natalPlanet} across the chart. Power dynamics with others force you to reclaim what you have projected outward`;
      break;
    case 'sextile':
      baseFeel = `Pluto offers transformation to your ${natalPlanet} gently. If you lean in, deep change is available without the intensity of harder aspects`;
      break;
    default:
      baseFeel = `Pluto is activating your ${natalPlanet}`;
  }

  // Add house context
  if (houseContext && natalHouse) {
    baseFeel += `. In your ${natalHouse}${getOrdinalSuffix(natalHouse)} house, this manifests through ${houseContext.examples}`;
  }

  // Add natal planet-specific Pluto feeling
  const planetSpecific = getPlutoPlanetSpecific(natalPlanet, aspect);
  if (planetSpecific) {
    baseFeel += `. ${planetSpecific}`;
  }

  return baseFeel;
}

function getPlutoPlanetSpecific(natalPlanet: string, aspect: string): string {
  const isHard = ['square', 'opposition', 'conjunction'].includes(aspect);
  
  const specifics: Record<string, { hard: string; soft: string }> = {
    Moon: {
      hard: 'Your emotional patterns are being dredged up from the depths. Old wounds with mother/nurturers surface. You may feel emotionally raw, possessive, or unable to trust your instincts until they are purified',
      soft: 'Your emotional intelligence deepens naturally. You access powerful intuition and can help others transform their feelings'
    },
    Sun: {
      hard: 'Your very identity is being deconstructed. Who you thought you were must die for who you are becoming to emerge. Ego battles, power struggles with father figures, or loss of status may occur',
      soft: 'Your personal power consolidates. You step into authority naturally and can influence situations without force'
    },
    Mercury: {
      hard: 'Your thought patterns are being overhauled. Obsessive thinking, intense conversations, or discovering hidden information is likely. Your words carry more weight but may cut deeper than intended',
      soft: 'Your mind gains penetrating insight. Research, investigation, and deep conversations come easily'
    },
    Venus: {
      hard: 'Your relationships and values are being transformed through intensity. Obsessive attractions, jealousy, or the death of relationships that no longer serve you. What you love changes forever',
      soft: 'You attract powerful connections and can transform relationships gracefully. Beauty and pleasure gain depth'
    },
    Mars: {
      hard: 'Your will and drive are being forged in fire. Rage may surface. Power struggles demand you fight for what matters or walk away. Sexual energy intensifies and may feel overwhelming',
      soft: 'Your assertion becomes strategic and effective. You accomplish what you set out to do and can transform conflict into cooperation'
    },
    NorthNode: {
      hard: 'Your soul purpose is being burned into clarity. Life circumstances force you onto your path through elimination of distractions. This is fated transformation toward your destiny',
      soft: 'Your evolutionary direction is supported by deep forces. Transformation accelerates your growth toward what you came here to become'
    },
    Ascendant: {
      hard: 'Your persona and physical body are transforming. Others see you differently. You may look different, project more intensity, or be seen as threatening even when you are not trying',
      soft: 'You project personal power without trying. People sense your depth and may defer to your presence naturally'
    },
    Midheaven: {
      hard: 'Your career and public role are being dismantled and rebuilt. Status changes, loss of reputation, or complete career transformation. What you are known for must die for your true calling to emerge',
      soft: 'Professional power grows organically. You gain influence and authority in your field without destructive power struggles'
    },
  };

  const spec = specifics[natalPlanet];
  if (!spec) return '';
  return isHard ? spec.hard : spec.soft;
}

// Helper function
function getOrdinalSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

export function getNeptuneTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  const isHard = ['square', 'opposition', 'conjunction'].includes(aspect);
  
  let baseFeel = '';
  if (isHard) {
    baseFeel = `Neptune is dissolving clarity around your ${natalPlanet}. You may feel confused, disillusioned, or seduced by fantasy in this area. What seemed solid becomes uncertain`;
  } else {
    baseFeel = `Neptune sensitizes your ${natalPlanet} gently. Intuition, creativity, and spiritual connection flow more easily. Dreams feel more vivid`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. In your ${natalHouse}${getOrdinalSuffix(natalHouse)} house, this fog or inspiration affects ${houseContext.examples}`;
  }

  return baseFeel;
}

export function getUranusTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  const isHard = ['square', 'opposition', 'conjunction'].includes(aspect);
  
  let baseFeel = '';
  if (isHard) {
    baseFeel = `Uranus is electrifying your ${natalPlanet} through disruption. Expect sudden changes, restlessness, or breakthroughs that shatter old patterns. You cannot stay the same here`;
  } else {
    baseFeel = `Uranus awakens your ${natalPlanet} with exciting possibilities. Innovation and freedom feel available without the chaos of harder aspects`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. The lightning strikes in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house through ${houseContext.examples}`;
  }

  return baseFeel;
}

export function getSaturnTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  const isHard = ['square', 'opposition', 'conjunction'].includes(aspect);
  
  let baseFeel = '';
  if (isHard) {
    baseFeel = `Saturn is testing your ${natalPlanet} through restriction. Delays, obstacles, or heavy responsibility press down. Only what is real and mature survives this`;
  } else {
    baseFeel = `Saturn stabilizes your ${natalPlanet} supportively. Discipline pays off, structures solidify, and lasting achievements become possible`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. The tests or rewards manifest in your ${natalHouse}${getOrdinalSuffix(natalHouse)} house through ${houseContext.examples}`;
  }

  return baseFeel;
}

export function getJupiterTransitFeeling(
  aspect: string,
  natalPlanet: string,
  natalHouse: number | null
): string {
  const houseContext = natalHouse ? HOUSE_CONTEXTS[natalHouse] : null;
  
  let baseFeel = `Jupiter expands your ${natalPlanet}. Growth, opportunity, and optimism flow toward this part of you`;
  
  if (aspect === 'square' || aspect === 'opposition') {
    baseFeel = `Jupiter expands your ${natalPlanet} but may over-promise. Watch for excess, overconfidence, or scattered energy. Opportunity comes with a need for discernment`;
  }

  if (houseContext && natalHouse) {
    baseFeel += `. Blessings or expansion touch your ${natalHouse}${getOrdinalSuffix(natalHouse)} house through ${houseContext.examples}`;
  }

  return baseFeel;
}
