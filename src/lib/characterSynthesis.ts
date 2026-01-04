// Character Synthesis - Deep analysis of Sun/Moon/Rising interaction
// For expert astrology readings with full decan, element, modality, and house integration

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { getDecan, Decan } from './decans';

// ============================================================================
// ELEMENT & MODALITY COMBINATIONS
// ============================================================================

export const ELEMENT_COMBINATIONS: Record<string, { description: string; dynamic: string; challenge: string; gift: string }> = {
  'Fire-Fire': {
    description: 'Double fire creates an intensely passionate, action-oriented nature. You burn bright with enthusiasm and courage.',
    dynamic: 'Your Sun and Moon both need action, inspiration, and forward movement. There is no inner/outer conflict here—you want what you want, and you go for it.',
    challenge: 'Burnout, impatience, and missing the subtle emotional undercurrents. You may leap before you look consistently.',
    gift: 'Contagious enthusiasm, natural leadership, and the ability to inspire others into action.',
  },
  'Fire-Earth': {
    description: 'Fire meets Earth: vision meets manifestation. You dream big AND build structures to support those dreams.',
    dynamic: 'Your fiery drive is grounded by practical needs. One part of you wants to charge ahead; another needs tangible security.',
    challenge: 'Frustration when inspiration meets limitation. The fire wants speed; the earth demands patience.',
    gift: 'You can actually manifest your visions. You have both the spark and the stamina.',
  },
  'Fire-Air': {
    description: 'Fire and Air feed each other—ideas ignite action, and action generates new ideas. You are mentally active and enthusiastic.',
    dynamic: 'Your emotional needs and identity both thrive on stimulation, movement, and engagement with the world.',
    challenge: 'Can become scattered, all talk and action with little depth. May avoid emotional heaviness.',
    gift: 'Brilliant communicator, natural networker, able to inspire through both word and deed.',
  },
  'Fire-Water': {
    description: 'Fire and Water create steam—intense, passionate, emotionally powerful. This is a volatile but creative combination.',
    dynamic: 'Your outer confidence masks deep emotional complexity. You act boldly but feel profoundly.',
    challenge: 'Inner conflict between expressing and protecting. The fire wants to shine; the water wants to hide.',
    gift: 'Tremendous creative and emotional power. You can move others deeply through your passionate expression.',
  },
  'Earth-Earth': {
    description: 'Double earth creates steadfast reliability and practical wisdom. You are grounded in the material world.',
    dynamic: 'Both your identity and emotional needs require tangible security, sensory comfort, and concrete results.',
    challenge: 'Resistance to change, potential rigidity, difficulty with abstract or spiritual matters.',
    gift: 'Incredible staying power, practical wisdom, and the ability to build lasting structures.',
  },
  'Earth-Air': {
    description: 'Earth and Air combine practicality with intellect. You think things through and then build them.',
    dynamic: 'Your grounded nature is enlivened by mental curiosity. You need both stability and stimulation.',
    challenge: 'Head and body may disconnect. Ideas without follow-through, or work without intellectual engagement.',
    gift: 'Strategic thinking combined with practical execution. You can plan and implement effectively.',
  },
  'Earth-Water': {
    description: 'Earth and Water create fertile soil—nurturing, productive, emotionally grounded. You feel deeply and build carefully.',
    dynamic: 'Your emotional nature is stable but deep. You need security in both physical and emotional realms.',
    challenge: 'May become too insular, stuck in comfort zones, resistant to change or risk.',
    gift: 'Deep nurturing capacity, ability to create lasting emotional and material security.',
  },
  'Air-Air': {
    description: 'Double air creates a brilliant, communicative mind. You live in the realm of ideas, connections, and concepts.',
    dynamic: 'Both your identity and emotional nature thrive on mental stimulation, social connection, and variety.',
    challenge: 'Difficulty grounding ideas into reality, avoiding emotional depth, scattered energy.',
    gift: 'Exceptional communication, ability to see multiple perspectives, natural teacher and networker.',
  },
  'Air-Water': {
    description: 'Air and Water create mist—intuitive intelligence, emotional insight expressed through words and ideas.',
    dynamic: 'Your mind is emotionally sensitive. You think about feelings and feel about thoughts.',
    challenge: 'Can become confused between logic and emotion, anxious when trying to rationalize feelings.',
    gift: 'Emotional intelligence, ability to articulate the ineffable, healing through communication.',
  },
  'Water-Water': {
    description: 'Double water creates profound emotional depth, psychic sensitivity, and intuitive wisdom.',
    dynamic: 'You navigate life through feeling. Both your identity and needs are emotionally driven.',
    challenge: 'Overwhelm, difficulty with boundaries, may absorb others\' emotions, struggle to act decisively.',
    gift: 'Deep empathy, artistic sensitivity, healing presence, connection to collective unconscious.',
  },
};

export const MODALITY_COMBINATIONS: Record<string, { description: string; energy: string; challenge: string }> = {
  'Cardinal-Cardinal': {
    description: 'Double cardinal energy = pure initiation. You are built to start things, lead, and set direction.',
    energy: 'Action-oriented, leadership-driven, always moving toward new beginnings.',
    challenge: 'May start many things but finish few. Restlessness, always seeking the next beginning.',
  },
  'Cardinal-Fixed': {
    description: 'Cardinal initiation meets Fixed determination. You start things AND see them through.',
    energy: 'Leadership combined with staying power. Once you commit, you persist.',
    challenge: 'Can become stubborn about your initiatives. Hard to change course once started.',
  },
  'Cardinal-Mutable': {
    description: 'Cardinal initiation meets Mutable flexibility. You lead but adapt as needed.',
    energy: 'Responsive leadership. You initiate but remain open to adjustment.',
    challenge: 'May start things then get distracted by new options. Direction can be inconsistent.',
  },
  'Fixed-Fixed': {
    description: 'Double fixed energy = absolute determination. Once set, you are immovable in your purpose.',
    energy: 'Concentrated, persistent, unwavering. You complete what you commit to.',
    challenge: 'Rigidity, stubbornness, difficulty adapting to necessary change.',
  },
  'Fixed-Mutable': {
    description: 'Fixed determination meets Mutable adaptability. You hold the vision while flexing the method.',
    energy: 'Strategic persistence. You know where you\'re going but can adjust how you get there.',
    challenge: 'Internal tension between holding on and letting go.',
  },
  'Mutable-Mutable': {
    description: 'Double mutable energy = pure adaptability. You flow with change like water finding its level.',
    energy: 'Flexible, versatile, responsive to environment. You adjust to whatever comes.',
    challenge: 'Difficulty committing, scattered energy, may lose sense of direction.',
  },
};

// ============================================================================
// HOUSE MEANINGS - DEEP INTERPRETATIONS
// ============================================================================

export const HOUSE_DEEP_MEANINGS: Record<number, {
  theme: string;
  lifePurpose: string;
  sunMeaning: string;
  moonMeaning: string;
  workingWith: string;
  shadow: string;
}> = {
  1: {
    theme: 'Self, Identity, Physical Presence',
    lifePurpose: 'Your life purpose centers on self-discovery and personal development. You are here to become yourself fully.',
    sunMeaning: 'With Sun in the 1st House, your very existence is your purpose. You shine through being authentically yourself. Your identity and ego development are front and center—you are meant to be seen. This is the placement of natural leaders and those who make an impact through personal presence alone.',
    moonMeaning: 'Moon in the 1st House makes your emotions visible. You wear your heart on your sleeve. Your moods affect your appearance, and you approach life with emotional immediacy.',
    workingWith: 'Develop your personality consciously. Your appearance and first impression are tools for your life mission.',
    shadow: 'Self-absorption, excessive focus on "me," difficulty seeing beyond personal perspective.',
  },
  2: {
    theme: 'Resources, Values, Self-Worth',
    lifePurpose: 'Your life purpose is expressed through building value, cultivating resources, and developing self-worth.',
    sunMeaning: 'Sun in the 2nd House means you shine through what you build, own, and value. Your identity is connected to your resources and talents. You need tangible evidence of your worth. Financial stability and material achievement are not shallow pursuits for you—they are expressions of your core self.',
    moonMeaning: 'Moon in the 2nd House creates emotional security through possessions and resources. You need material stability to feel safe. Comfort and quality matter deeply.',
    workingWith: 'Identify your core values. Build something lasting. Your net worth reflects your self-worth journey.',
    shadow: 'Materialism, possessiveness, tying self-worth too tightly to external resources.',
  },
  3: {
    theme: 'Communication, Learning, Local Environment',
    lifePurpose: 'Your life purpose involves communication, teaching, learning, and connecting ideas and people.',
    sunMeaning: 'Sun in the 3rd House means you shine through communication. Your identity is tied to your mind, your words, your curiosity. You are the eternal student and teacher. Writing, speaking, networking—these are not just activities but expressions of who you are.',
    moonMeaning: 'Moon in the 3rd House processes emotions through talking, writing, and thinking. You need mental stimulation and conversation to feel emotionally alive.',
    workingWith: 'Develop your communication skills. Your voice is your gift. Learn constantly and share what you learn.',
    shadow: 'Superficiality, gossip, scattered thinking, never going deep.',
  },
  4: {
    theme: 'Home, Family, Emotional Foundation',
    lifePurpose: 'Your life purpose is rooted in home, family, ancestry, and creating emotional security.',
    sunMeaning: 'Sun in the 4th House means you shine within the private realm. Your purpose is connected to family, home, and roots. You may be the pillar of your family, the keeper of traditions, or focused on real estate and domestic matters. Your public success is built on private foundations.',
    moonMeaning: 'Moon in the 4th House is at home here. Emotional security, family bonds, and domestic life are central. You have strong ancestral connections and nurturing instincts.',
    workingWith: 'Create a home that reflects your soul. Heal family patterns. Your roots are your power.',
    shadow: 'Hiding from the world, excessive attachment to family, living in the past.',
  },
  5: {
    theme: 'Creativity, Joy, Self-Expression',
    lifePurpose: 'Your life purpose is expressed through creativity, romance, play, and bringing joy to life.',
    sunMeaning: 'Sun in the 5th House is a powerful placement—you shine through self-expression, creativity, and joie de vivre. You need an audience. Drama, art, performance, romance—these are not frivolous but essential to your identity. Children (creative or biological) are important to your purpose.',
    moonMeaning: 'Moon in the 5th House finds emotional fulfillment through creative expression, romance, and play. You need to create to feel alive. Drama is emotionally necessary.',
    workingWith: 'Create without apology. Express yourself boldly. Make life an art form.',
    shadow: 'Attention-seeking, drama for its own sake, inability to be ordinary.',
  },
  6: {
    theme: 'Work, Health, Service, Daily Routines',
    lifePurpose: 'Your life purpose is expressed through work, service, health, and perfecting your craft.',
    sunMeaning: 'Sun in the 6th House means you shine through work and service. Your identity is connected to what you do, how you serve, and your daily habits. Being useful is not diminishing—it is your path to self-realization. Health and wellness are central themes. You are the craftsperson, the healer, the one who makes things work.',
    moonMeaning: 'Moon in the 6th House processes emotions through work, routine, and service. You need to feel useful to feel emotionally secure. Health and diet affect your moods significantly.',
    workingWith: 'Master your craft. Refine your routines. Your service is your purpose.',
    shadow: 'Workaholism, excessive criticism (of self and others), martyrdom, health anxiety.',
  },
  7: {
    theme: 'Partnership, Relationship, Balance',
    lifePurpose: 'Your life purpose is discovered and expressed through partnership, relationship, and understanding others.',
    sunMeaning: 'Sun in the 7th House means you shine in relationship. You discover yourself through the mirror of others. Partnership is not just desirable but essential to your purpose. You may work with the public, in counseling, or in any field requiring diplomacy and one-on-one connection.',
    moonMeaning: 'Moon in the 7th House processes emotions through relationships. You need partnership to feel emotionally complete. You may be overly dependent on others for emotional regulation.',
    workingWith: 'Develop relationship skills consciously. See others as teachers. Balance giving and receiving.',
    shadow: 'Losing yourself in relationships, defining yourself only through others, conflict avoidance.',
  },
  8: {
    theme: 'Transformation, Shared Resources, Depth',
    lifePurpose: 'Your life purpose involves transformation, dealing with crisis, and working with shared power and resources.',
    sunMeaning: 'Sun in the 8th House means you shine through intensity and transformation. Surface living is not for you. You are drawn to psychology, research, investigation, and anything hidden. Inheritance, other people\'s money, and shared resources may be significant. Death and rebirth themes run through your life.',
    moonMeaning: 'Moon in the 8th House creates deep, intense emotional experiences. You feel everything at a profound level. Transformation is emotionally necessary. Trust is a central issue.',
    workingWith: 'Embrace intensity. Work with shadow material. Your depth is your gift.',
    shadow: 'Control issues, manipulation, obsession, difficulty with trust and vulnerability.',
  },
  9: {
    theme: 'Expansion, Philosophy, Higher Learning',
    lifePurpose: 'Your life purpose is expressed through seeking meaning, expanding horizons, and sharing wisdom.',
    sunMeaning: 'Sun in the 9th House means you shine through expansion—physical travel, intellectual exploration, or spiritual seeking. You need meaning and vision. Teaching, publishing, foreign cultures, and philosophy are natural domains. You are here to seek truth and share it.',
    moonMeaning: 'Moon in the 9th House processes emotions through philosophy, travel, and meaning-making. You feel most alive when exploring new territory—physically or mentally.',
    workingWith: 'Expand your worldview continuously. Travel, learn, teach. Your vision inspires others.',
    shadow: 'Dogmatism, preachiness, escapism through constant movement, never settling.',
  },
  10: {
    theme: 'Career, Public Life, Achievement',
    lifePurpose: 'Your life purpose is expressed through career, public contribution, and lasting achievement.',
    sunMeaning: 'Sun in the 10th House means you shine in public. Your identity is connected to career, achievement, and social standing. You are meant to contribute something lasting to the world. Authority figures and your relationship with them are significant. You are building a legacy.',
    moonMeaning: 'Moon in the 10th House processes emotions through public achievement. Your emotional needs are met through recognition and accomplishment. Your mother may have been achievement-focused.',
    workingWith: 'Build your career consciously. Your public role is your purpose. Lead with integrity.',
    shadow: 'Overemphasis on status, workaholism, sacrificing personal life for achievement.',
  },
  11: {
    theme: 'Community, Friendship, Future Vision',
    lifePurpose: 'Your life purpose is expressed through community, friendship networks, and working toward ideals.',
    sunMeaning: 'Sun in the 11th House means you shine within groups and through collective endeavors. Your identity is connected to your tribe, your ideals, and your vision for the future. You are the networker, the humanitarian, the one who brings people together for a cause.',
    moonMeaning: 'Moon in the 11th House processes emotions through friendship and community. You need your tribe to feel emotionally secure. Group belonging is essential.',
    workingWith: 'Find your people. Serve causes larger than yourself. Your networks are your power.',
    shadow: 'Detachment from personal relationships, sacrificing intimacy for the collective, being a social chameleon.',
  },
  12: {
    theme: 'Spirituality, Unconscious, Transcendence',
    lifePurpose: 'Your life purpose is expressed through spirituality, healing, and accessing the collective unconscious.',
    sunMeaning: 'Sun in the 12th House means you shine in hidden ways. Your identity may feel mysterious even to yourself. You are connected to the spiritual, the artistic, the therapeutic. Solitude and retreat are necessary for self-discovery. You work behind the scenes, in hospitals, prisons, or spiritual contexts.',
    moonMeaning: 'Moon in the 12th House creates deep, often overwhelming emotional sensitivity. You absorb the emotions of others. Dreams and intuition are powerful. You need solitude to process.',
    workingWith: 'Develop your spiritual life. Embrace solitude as a gift. Your compassion heals invisibly.',
    shadow: 'Escapism, victimhood, self-undoing, difficulty with practical reality.',
  },
};

// ============================================================================
// DEGREE MEANINGS
// ============================================================================

export const getDegreeMeaning = (degree: number): { critical: boolean; meaning: string } => {
  const criticalDegrees = [0, 13, 26]; // Aries points
  const anaretic = degree >= 29;
  const isCritical = criticalDegrees.includes(Math.floor(degree));
  
  if (anaretic) {
    return {
      critical: true,
      meaning: `29° is the anaretic (crisis) degree—completing lessons of this sign with urgency. There is a sense of "must finish this" energy, pushing to resolve karma before moving to the next sign.`,
    };
  }
  
  if (Math.floor(degree) === 0) {
    return {
      critical: true,
      meaning: `0° is the degree of new beginnings—pure, undiluted sign energy. This is the very first expression of the sign's archetype, innocent and powerful in its simplicity.`,
    };
  }
  
  if (Math.floor(degree) === 15) {
    return {
      critical: false,
      meaning: `15° is the Avatar degree—the pure center point of the sign where its energy is most stable and fully expressed. This is considered the "heart" of the sign.`,
    };
  }
  
  if (isCritical) {
    return {
      critical: true,
      meaning: `${degree}° is a critical degree, marking a powerful concentration of cardinal energy. Events connected to this placement often manifest more forcefully.`,
    };
  }
  
  return {
    critical: false,
    meaning: `${Math.floor(degree)}° expresses the sign's energy with the specific coloring of its position within the decan.`,
  };
};

// ============================================================================
// TRINITY SYNTHESIS
// ============================================================================

export interface CharacterSynthesis {
  overview: string;
  elementDynamic: {
    combination: string;
    description: string;
    dynamic: string;
    challenge: string;
    gift: string;
  };
  modalityDynamic: {
    combination: string;
    description: string;
    energy: string;
    challenge: string;
  };
  sunDeep: {
    sign: string;
    degree: number;
    decan: Decan;
    degreeMeaning: { critical: boolean; meaning: string };
    house: number | null;
    houseMeaning: string;
    synthesis: string;
  };
  moonDeep: {
    sign: string;
    degree: number;
    decan: Decan;
    degreeMeaning: { critical: boolean; meaning: string };
    house: number | null;
    houseMeaning: string;
    synthesis: string;
  };
  risingDeep: {
    sign: string;
    degree: number;
    decan: Decan;
    degreeMeaning: { critical: boolean; meaning: string };
    synthesis: string;
  };
  trinitySynthesis: string;
  readingNarrative: string;
}

const getElement = (sign: string): string => {
  const elements: Record<string, string[]> = {
    Fire: ['Aries', 'Leo', 'Sagittarius'],
    Earth: ['Taurus', 'Virgo', 'Capricorn'],
    Air: ['Gemini', 'Libra', 'Aquarius'],
    Water: ['Cancer', 'Scorpio', 'Pisces'],
  };
  for (const [element, signs] of Object.entries(elements)) {
    if (signs.includes(sign)) return element;
  }
  return 'Unknown';
};

const getModality = (sign: string): string => {
  const modalities: Record<string, string[]> = {
    Cardinal: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
    Fixed: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
    Mutable: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
  };
  for (const [modality, signs] of Object.entries(modalities)) {
    if (signs.includes(sign)) return modality;
  }
  return 'Unknown';
};

const getSignRuler = (sign: string): string => {
  const rulers: Record<string, string> = {
    Aries: 'Mars', Taurus: 'Venus', Gemini: 'Mercury', Cancer: 'Moon',
    Leo: 'Sun', Virgo: 'Mercury', Libra: 'Venus', Scorpio: 'Pluto',
    Sagittarius: 'Jupiter', Capricorn: 'Saturn', Aquarius: 'Uranus', Pisces: 'Neptune',
  };
  return rulers[sign] || 'Unknown';
};

export const generateCharacterSynthesis = (
  chart: NatalChart,
  sunHouse: number | null,
  moonHouse: number | null
): CharacterSynthesis | null => {
  const sunPos = chart.planets.Sun;
  const moonPos = chart.planets.Moon;
  const risingSign = chart.houseCusps?.house1?.sign || chart.planets.Ascendant?.sign;
  const risingDegree = chart.houseCusps?.house1?.degree ?? chart.planets.Ascendant?.degree ?? 0;
  
  if (!sunPos?.sign || !moonPos?.sign || !risingSign) return null;
  
  const sunElement = getElement(sunPos.sign);
  const moonElement = getElement(moonPos.sign);
  const risingElement = getElement(risingSign);
  
  const sunModality = getModality(sunPos.sign);
  const moonModality = getModality(moonPos.sign);
  const risingModality = getModality(risingSign);
  
  // Get decan info
  const sunDecan = getDecan(sunPos.degree, sunPos.sign);
  const moonDecan = getDecan(moonPos.degree, moonPos.sign);
  const risingDecan = getDecan(risingDegree, risingSign);
  
  // Get degree meanings
  const sunDegreeMeaning = getDegreeMeaning(sunPos.degree);
  const moonDegreeMeaning = getDegreeMeaning(moonPos.degree);
  const risingDegreeMeaning = getDegreeMeaning(risingDegree);
  
  // Element combination (Sun-Moon)
  const elementKey = [sunElement, moonElement].sort().join('-');
  const elementCombo = ELEMENT_COMBINATIONS[elementKey] || ELEMENT_COMBINATIONS[`${sunElement}-${moonElement}`] || ELEMENT_COMBINATIONS[`${moonElement}-${sunElement}`];
  
  // Modality combination (Sun-Moon)
  const modalityKey = [sunModality, moonModality].sort().join('-');
  const modalityCombo = MODALITY_COMBINATIONS[modalityKey] || MODALITY_COMBINATIONS[`${sunModality}-${moonModality}`] || MODALITY_COMBINATIONS[`${moonModality}-${sunModality}`];
  
  // House meanings
  const sunHouseMeaning = sunHouse ? HOUSE_DEEP_MEANINGS[sunHouse]?.sunMeaning || '' : '';
  const moonHouseMeaning = moonHouse ? HOUSE_DEEP_MEANINGS[moonHouse]?.moonMeaning || '' : '';
  
  // Count elements across trinity
  const elements = [sunElement, moonElement, risingElement];
  const elementCounts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  elements.forEach(e => { if (elementCounts[e] !== undefined) elementCounts[e]++; });
  
  // Build overview
  const dominantElements = Object.entries(elementCounts).filter(([, c]) => c >= 2).map(([e]) => e);
  const missingElements = Object.entries(elementCounts).filter(([, c]) => c === 0).map(([e]) => e);
  
  let overview = `Your Big Three reveals a ${sunPos.sign} Sun, ${moonPos.sign} Moon, and ${risingSign} Rising. `;
  
  if (dominantElements.length > 0) {
    overview += `With ${dominantElements.join(' and ')} appearing multiple times, there is a strong ${dominantElements.join('/')} emphasis in your core nature. `;
  }
  if (missingElements.length > 0) {
    overview += `The absence of ${missingElements.join(' and ')} in your trinity suggests these qualities may be areas of growth or attraction. `;
  }
  
  // Build trinity synthesis narrative
  let trinitySynthesis = `Your ${sunPos.sign} Sun (${sunElement}/${sunModality}) gives you a core identity of `;
  trinitySynthesis += sunPos.sign === 'Aries' ? 'pioneering courage and independent spirit. ' :
    sunPos.sign === 'Taurus' ? 'grounded steadiness and sensual appreciation. ' :
    sunPos.sign === 'Gemini' ? 'curious intellect and versatile communication. ' :
    sunPos.sign === 'Cancer' ? 'nurturing depth and protective instincts. ' :
    sunPos.sign === 'Leo' ? 'radiant self-expression and generous heart. ' :
    sunPos.sign === 'Virgo' ? 'analytical precision and service orientation. ' :
    sunPos.sign === 'Libra' ? 'harmonious balance and aesthetic refinement. ' :
    sunPos.sign === 'Scorpio' ? 'intense depth and transformative power. ' :
    sunPos.sign === 'Sagittarius' ? 'expansive vision and philosophical seeking. ' :
    sunPos.sign === 'Capricorn' ? 'ambitious drive and structured achievement. ' :
    sunPos.sign === 'Aquarius' ? 'innovative thinking and humanitarian ideals. ' :
    'mystical sensitivity and compassionate transcendence. ';
  
  trinitySynthesis += `Your ${moonPos.sign} Moon (${moonElement}/${moonModality}) means you emotionally need `;
  trinitySynthesis += moonPos.sign === 'Aries' ? 'action, independence, and the freedom to react immediately. ' :
    moonPos.sign === 'Taurus' ? 'stability, comfort, and sensory pleasure for security. ' :
    moonPos.sign === 'Gemini' ? 'mental stimulation, conversation, and variety to feel alive. ' :
    moonPos.sign === 'Cancer' ? 'emotional safety, nurturing, and deep belonging. ' :
    moonPos.sign === 'Leo' ? 'recognition, warmth, and creative expression to feel seen. ' :
    moonPos.sign === 'Virgo' ? 'order, usefulness, and practical routines for peace. ' :
    moonPos.sign === 'Libra' ? 'harmony, partnership, and aesthetic beauty. ' :
    moonPos.sign === 'Scorpio' ? 'depth, intensity, and transformative emotional experiences. ' :
    moonPos.sign === 'Sagittarius' ? 'freedom, adventure, and space to explore emotionally. ' :
    moonPos.sign === 'Capricorn' ? 'structure, achievement, and emotional control. ' :
    moonPos.sign === 'Aquarius' ? 'independence, friendship, and intellectual connection. ' :
    'transcendence, creativity, and spiritual connection. ';
  
  trinitySynthesis += `With ${risingSign} Rising (${risingElement}/${risingModality}), you meet the world as `;
  trinitySynthesis += risingSign === 'Aries' ? 'a warrior, direct and ready for action. Others see confidence and courage first.' :
    risingSign === 'Taurus' ? 'a steady presence, calm and grounded. Others see reliability and earthy sensuality.' :
    risingSign === 'Gemini' ? 'a curious communicator, quick and versatile. Others see wit and mental agility.' :
    risingSign === 'Cancer' ? 'a nurturer, soft and protective. Others see emotional depth and caring nature.' :
    risingSign === 'Leo' ? 'royalty, commanding and warm. Others see charisma and creative confidence.' :
    risingSign === 'Virgo' ? 'a helper, precise and modest. Others see competence and attention to detail.' :
    risingSign === 'Libra' ? 'a diplomat, graceful and charming. Others see beauty and social ease.' :
    risingSign === 'Scorpio' ? 'mysterious and intense. Others sense power, depth, and magnetism.' :
    risingSign === 'Sagittarius' ? 'an adventurer, open and enthusiastic. Others see optimism and philosophical nature.' :
    risingSign === 'Capricorn' ? 'an authority, serious and composed. Others see ambition and maturity.' :
    risingSign === 'Aquarius' ? 'a unique individual, detached and original. Others see eccentricity and intelligence.' :
    'a dreamer, ethereal and sensitive. Others see gentleness and artistic nature.';
  
  // Build full reading narrative
  let readingNarrative = `Let's look at your Big Three in detail.\n\n`;
  
  // Sun section
  readingNarrative += `**Your Sun at ${sunPos.degree}° ${sunPos.sign}** is in the ${sunDecan.number === 1 ? 'first' : sunDecan.number === 2 ? 'second' : 'third'} decan, ruled by ${sunDecan.ruler}. ${sunDecan.description} `;
  readingNarrative += sunDegreeMeaning.meaning + ' ';
  if (sunHouse) {
    readingNarrative += sunHouseMeaning + ' ';
  }
  readingNarrative += `\n\n`;
  
  // Moon section
  readingNarrative += `**Your Moon at ${moonPos.degree}° ${moonPos.sign}** is in the ${moonDecan.number === 1 ? 'first' : moonDecan.number === 2 ? 'second' : 'third'} decan, ruled by ${moonDecan.ruler}. ${moonDecan.description} `;
  readingNarrative += moonDegreeMeaning.meaning + ' ';
  if (moonHouse) {
    readingNarrative += moonHouseMeaning + ' ';
  }
  readingNarrative += `\n\n`;
  
  // Rising section
  readingNarrative += `**Your Rising at ${risingDegree}° ${risingSign}** is in the ${risingDecan.number === 1 ? 'first' : risingDecan.number === 2 ? 'second' : 'third'} decan, ruled by ${risingDecan.ruler}. ${risingDecan.description} `;
  readingNarrative += risingDegreeMeaning.meaning + ' ';
  readingNarrative += `\n\n`;
  
  // Element/Modality dynamics
  if (elementCombo) {
    readingNarrative += `**Element Dynamic (${sunElement}-${moonElement}):** ${elementCombo.dynamic} ${elementCombo.challenge ? `The challenge: ${elementCombo.challenge}` : ''} ${elementCombo.gift ? `The gift: ${elementCombo.gift}` : ''}\n\n`;
  }
  
  if (modalityCombo) {
    readingNarrative += `**Modality Dynamic (${sunModality}-${moonModality}):** ${modalityCombo.description} ${modalityCombo.energy}`;
  }
  
  return {
    overview,
    elementDynamic: {
      combination: `${sunElement}-${moonElement}`,
      description: elementCombo?.description || '',
      dynamic: elementCombo?.dynamic || '',
      challenge: elementCombo?.challenge || '',
      gift: elementCombo?.gift || '',
    },
    modalityDynamic: {
      combination: `${sunModality}-${moonModality}`,
      description: modalityCombo?.description || '',
      energy: modalityCombo?.energy || '',
      challenge: modalityCombo?.challenge || '',
    },
    sunDeep: {
      sign: sunPos.sign,
      degree: sunPos.degree,
      decan: sunDecan,
      degreeMeaning: sunDegreeMeaning,
      house: sunHouse,
      houseMeaning: sunHouseMeaning,
      synthesis: `${sunPos.sign} Sun at ${sunPos.degree}° (${sunDecan.number}${sunDecan.number === 1 ? 'st' : sunDecan.number === 2 ? 'nd' : 'rd'} decan/${sunDecan.ruler})${sunHouse ? ` in House ${sunHouse}` : ''}: ${sunDecan.description}`,
    },
    moonDeep: {
      sign: moonPos.sign,
      degree: moonPos.degree,
      decan: moonDecan,
      degreeMeaning: moonDegreeMeaning,
      house: moonHouse,
      houseMeaning: moonHouseMeaning,
      synthesis: `${moonPos.sign} Moon at ${moonPos.degree}° (${moonDecan.number}${moonDecan.number === 1 ? 'st' : moonDecan.number === 2 ? 'nd' : 'rd'} decan/${moonDecan.ruler})${moonHouse ? ` in House ${moonHouse}` : ''}: ${moonDecan.description}`,
    },
    risingDeep: {
      sign: risingSign,
      degree: risingDegree,
      decan: risingDecan,
      degreeMeaning: risingDegreeMeaning,
      synthesis: `${risingSign} Rising at ${risingDegree}° (${risingDecan.number}${risingDecan.number === 1 ? 'st' : risingDecan.number === 2 ? 'nd' : 'rd'} decan/${risingDecan.ruler}): ${risingDecan.description}`,
    },
    trinitySynthesis,
    readingNarrative,
  };
};
