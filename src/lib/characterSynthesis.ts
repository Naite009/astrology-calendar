// Character Synthesis - Deep analysis of Sun/Moon/Rising interaction
// For expert astrology readings with full decan, element, modality, and house integration

import { NatalChart, NatalPlanetPosition } from '@/hooks/useNatalChart';
import { getDecan, Decan } from './decans';
import { getReliableAscendant } from './chartDataValidation';

// ============================================================================
// ELEMENT & MODALITY COMBINATIONS
// ============================================================================

// Triple element combinations (Sun, Moon, Rising all same element)
export const TRIPLE_ELEMENT_COMBINATIONS: Record<string, { description: string; dynamic: string; challenge: string; gift: string }> = {
  'Fire': {
    description: 'Triple Fire creates an unstoppable force of pure yang energy. With Sun, Moon, AND Rising all in Fire signs, you are a living flame—passionate, courageous, and perpetually in motion.',
    dynamic: 'Your identity, emotions, AND outward persona all demand action, inspiration, and forward momentum. There is no internal brake—you ARE pure fire from every angle.',
    challenge: 'Epic burnout potential, impatience with anything slow, may dominate conversations/situations, can miss emotional subtlety entirely. Without grounding, you consume yourself.',
    gift: 'Unstoppable inspiration, magnetic leadership, ability to ignite movements and transform others through sheer enthusiasm. You embody courage itself.',
  },
  'Earth': {
    description: 'Triple Earth creates an unshakeable foundation. With Sun, Moon, AND Rising all in Earth signs, you are bedrock—solid, sensual, and supremely practical.',
    dynamic: 'Your identity, emotions, AND outward persona all require tangible security, material comfort, and concrete results. You are ALL about building in the real world.',
    challenge: 'Resistance to change can become total rigidity, may miss spiritual dimensions, difficulty with abstractions. Can become too focused on material security.',
    gift: 'Incredible manifesting power, patience that outlasts everything, ability to build empires. You embody reliability itself.',
  },
  'Air': {
    description: 'Triple Air creates pure mind—a being of thoughts, connections, and endless intellectual curiosity. With Sun, Moon, AND Rising all in Air signs, you exist in the realm of ideas.',
    dynamic: 'Your identity, emotions, AND outward persona all thrive on mental stimulation, social connection, and variety. You process everything through intellect—even feelings become thoughts.',
    challenge: 'Profound difficulty grounding into the body, may intellectualize all emotions away, scattered energy. Without earth, ideas never become real. Can seem detached or cold.',
    gift: 'Brilliant communication across all domains, seeing every perspective simultaneously, natural teacher, networker, and synthesizer of ideas. You embody thought itself.',
  },
  'Water': {
    description: 'Triple Water creates oceanic emotional depth. With Sun, Moon, AND Rising all in Water signs, you are pure feeling—psychic, sensitive, and profoundly intuitive.',
    dynamic: 'Your identity, emotions, AND outward persona all navigate through feeling. You absorb atmospheres, read undercurrents, and live in emotional dimensions others cannot access.',
    challenge: 'Overwhelm without boundaries, absorbing everyone\'s pain, difficulty with decisive action, may drown in feelings. Without fire, you lack assertive power.',
    gift: 'Profound empathy, artistic/healing genius, psychic sensitivity, connection to collective unconscious. You embody feeling itself.',
  },
};

// Double element combinations (two of three same element)
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

// Triple modality combinations (Sun, Moon, Rising all same modality)
export const TRIPLE_MODALITY_COMBINATIONS: Record<string, { description: string; energy: string; challenge: string }> = {
  'Cardinal': {
    description: 'Triple Cardinal creates pure initiating force. With Sun, Moon, AND Rising all in Cardinal signs, you are built to BEGIN—every part of you launches, leads, and sets direction.',
    energy: 'Maximum action orientation. You initiate from your core (Sun), feel compelled to start things emotionally (Moon), and present as a leader to the world (Rising). You ARE the spark.',
    challenge: 'May start endlessly but finish rarely. Restlessness becomes existential. Difficulty with maintenance, follow-through, and the "boring" middle of projects.',
  },
  'Fixed': {
    description: 'Triple Fixed creates absolute determination incarnate. With Sun, Moon, AND Rising all in Fixed signs, you are immovable force—once set, nothing shifts you.',
    energy: 'Maximum persistence. Your identity (Sun), emotions (Moon), and outward presentation (Rising) all resist change and commit completely. You ARE stability itself.',
    challenge: 'Rigidity becomes your shadow. Difficulty adapting even when change is clearly needed. May miss opportunities by refusing to pivot.',
  },
  'Mutable': {
    description: 'Triple Mutable creates pure adaptability—a shapeshifter who flows with every current. With Sun, Moon, AND Rising all in Mutable signs, you adjust to everything.',
    energy: 'Maximum flexibility. Your identity (Sun), emotions (Moon), and outward presentation (Rising) all morph to fit circumstances. You ARE the flow itself.',
    challenge: 'May lose sense of self entirely. Direction becomes impossible. Others may see you as inconsistent or unreliable. Need external structure desperately.',
  },
};

// Double modality combinations (two of three same modality)
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
  
  // Provide meaningful degree-specific interpretation
  const deg = Math.floor(degree);
  const decanNum = deg < 10 ? 1 : deg < 20 ? 2 : 3;
  const decanPhase = decanNum === 1 ? 'initiating' : decanNum === 2 ? 'stabilizing' : 'completing';
  const decanJourney = decanNum === 1 
    ? 'the sign is just beginning its journey—energy is fresh, direct, and unrefined'
    : decanNum === 2 
    ? 'the sign has found its footing—energy is established, concentrated, and building'
    : 'the sign is reaching its culmination—energy is mature, experienced, and ready to transition';
  
  return {
    critical: false,
    meaning: `At ${deg}°, ${decanJourney}. The ${decanPhase} phase of the decan colors how this energy expresses—less about "what" and more about "how mature" the sign's expression is at this point in its arc.`,
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
  const reliableAsc = getReliableAscendant(chart);
  const risingSign = reliableAsc?.sign;
  const risingDegree = reliableAsc?.degree ?? 0;
  
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
  
  // Element combination (all three: Sun, Moon, Rising)
  const allElements = [sunElement, moonElement, risingElement];
  const uniqueElements = [...new Set(allElements)];
  const isTripleElement = uniqueElements.length === 1;
  const isDoubleElement = uniqueElements.length === 2;
  
  // Use Triple combinations when all three are the same element, otherwise use Double combinations
  const elementCombo = isTripleElement 
    ? TRIPLE_ELEMENT_COMBINATIONS[sunElement] 
    : (ELEMENT_COMBINATIONS[`${sunElement}-${moonElement}`] || ELEMENT_COMBINATIONS[`${moonElement}-${sunElement}`] || ELEMENT_COMBINATIONS[[sunElement, moonElement].sort().join('-')]);
  const elementDisplayLabel = isTripleElement ? `Triple ${sunElement}` : isDoubleElement ? `Double ${allElements.filter(e => allElements.filter(x => x === e).length >= 2)[0]} (${allElements.join(', ')})` : `${sunElement}, ${moonElement}, ${risingElement}`;
  
  // Modality combination (all three: Sun, Moon, Rising)
  const allModalities = [sunModality, moonModality, risingModality];
  const uniqueModalities = [...new Set(allModalities)];
  const isTripleModality = uniqueModalities.length === 1;
  const isDoubleModality = uniqueModalities.length === 2;
  
  // Use Triple combinations when all three are the same modality, otherwise use Double combinations
  const modalityCombo = isTripleModality 
    ? TRIPLE_MODALITY_COMBINATIONS[sunModality] 
    : (MODALITY_COMBINATIONS[`${sunModality}-${moonModality}`] || MODALITY_COMBINATIONS[`${moonModality}-${sunModality}`] || MODALITY_COMBINATIONS[[sunModality, moonModality].sort().join('-')]);
  const modalityDisplayLabel = isTripleModality ? `Triple ${sunModality}` : isDoubleModality ? `Double ${allModalities.filter(m => allModalities.filter(x => x === m).length >= 2)[0]} (${allModalities.join(', ')})` : `${sunModality}, ${moonModality}, ${risingModality}`;
  
  // House meanings
  const sunHouseMeaning = sunHouse ? HOUSE_DEEP_MEANINGS[sunHouse]?.sunMeaning || '' : '';
  const moonHouseMeaning = moonHouse ? HOUSE_DEEP_MEANINGS[moonHouse]?.moonMeaning || '' : '';
  
  // Count elements across trinity
  const elements = [sunElement, moonElement, risingElement];
  const elementCounts: Record<string, number> = { Fire: 0, Earth: 0, Air: 0, Water: 0 };
  elements.forEach(e => { if (elementCounts[e] !== undefined) elementCounts[e]++; });
  
  // Count signs - check for stellium or triple
  const signs = [sunPos.sign, moonPos.sign, risingSign];
  const signCounts: Record<string, number> = {};
  signs.forEach(s => { signCounts[s] = (signCounts[s] || 0) + 1; });
  const tripleSign = Object.entries(signCounts).find(([, c]) => c === 3)?.[0];
  const doubleSign = Object.entries(signCounts).find(([, c]) => c === 2)?.[0];
  
  // Build overview with personality insight
  const dominantElements = Object.entries(elementCounts).filter(([, c]) => c >= 2).map(([e]) => e);
  const missingElements = Object.entries(elementCounts).filter(([, c]) => c === 0).map(([e]) => e);
  
  let overview = '';
  
  // Special case: Triple sign - this is rare and significant
  if (tripleSign) {
    const tripleSignDescriptions: Record<string, string> = {
      Aries: `You are pure fire, undiluted warrior energy. With Sun, Moon, and Rising all in Aries, there is no mask—who you are, what you feel, and how you appear are one seamless identity. You are direct, courageous, and pioneering. You cannot pretend. Your gift is authentic action and the courage to go first. Your challenge is patience, collaboration, and recognizing when to follow.`,
      Taurus: `You are the embodiment of Earth—solid, sensual, and unshakeable. With Sun, Moon, and Rising all in Taurus, there is a profound consistency to your being. What you show the world is exactly who you are inside. You value stability, beauty, and the pleasures of the material world. Your gift is steadfast presence and the ability to build lasting things. Your challenge is flexibility when life demands change.`,
      Gemini: `You are pure Mercury—mind in motion, eternal curiosity, the messenger. With Sun, Moon, and Rising all in Gemini, your entire being is oriented toward communication, learning, and connection. There's a quicksilver quality to you that others find fascinating and sometimes hard to pin down. Your gift is versatility and the ability to bridge any gap with words. Your challenge is depth over breadth, commitment over options.`,
      Cancer: `You are pure Moon—feeling, nurturing, and deeply intuitive. With Sun, Moon, and Rising all in Cancer, your emotional nature permeates everything. You are the mother, the protector, the one who creates home wherever you go. Others experience you as profoundly caring, though perhaps moody. Your gift is emotional intelligence and the ability to make others feel safe. Your challenge is releasing the past and trusting that you are protected too.`,
      Leo: `You are pure Sun—radiant, creative, and magnificently yourself. With Sun, Moon, and Rising all in Leo, there is no dimmer switch on your light. You are meant to be seen, to create, to lead with warmth. Drama is not optional—it's how you experience life. Your gift is the ability to inspire and bring joy. Your challenge is sharing the spotlight and finding validation from within rather than applause.`,
      Virgo: `You are pure service—analytical, precise, and devoted to improvement. With Sun, Moon, and Rising all in Virgo, your entire being is oriented toward making things work better. You notice what others miss. You feel compelled to help, to fix, to refine. Your gift is mastery through humble dedication. Your challenge is accepting imperfection—in yourself and others—without losing your peace.`,
      Libra: `With Sun, Moon, and Rising all in Libra, your entire being is oriented toward relationship, harmony, and the art of bringing opposites into balance. You are Triple Cardinal—a powerful initiator who generates energy through connection, strategy, and social architecture. You are Triple Air—mind in motion, ideas flowing, always seeking intellectual equilibrium and fair exchange.

Venus rules all three of your core placements. This makes you a living embodiment of the Goddess energy: grace, aesthetics, and the magnetic pull toward partnership. Traditional astrology (per Chris Brennan) emphasizes that Venus-ruled charts excel at negotiation, artistry, and creating conditions where others flourish. You don't just want peace—you engineer it.

Your mantra is "I BALANCE" and "WE." The Libra archetype is The Diplomat, The Artist, The Lover, The Judge. You carry the scales of Ma'at—weighing truth against truth, seeing validity in opposing perspectives. This is both your gift and your binding.

The Cardinal modality makes you an initiator of relationships and collaborations. Unlike passive relating, you actively create partnerships. You're not waiting to be chosen—you're curating your relational world. Triple Cardinal means you're forceful, generating, and ambitious, though your Libra expression channels this through charm rather than aggression.

As Sara Elise notes, triple-sign charts indicate a soul that chose to go deep into one archetypal experience this lifetime rather than diversify. There is no internal conflict between identity (Sun), emotions (Moon), and persona (Rising)—they are unified in the Venusian frequency. Others experience you as consistent, though this consistency can feel like limitation when you crave complexity.

Your gifts: Aesthetic mastery. Diplomatic genius. The ability to make others feel seen, valued, and understood. You beautify every space you enter. Your presence creates harmony.

Your challenges: Decision paralysis from seeing all sides equally. Losing yourself in the mirror of relationship. Conflict avoidance that postpones necessary truth-telling. Learning that sometimes rupture serves love better than false peace. The journey from people-pleasing to authentic relating.

The Libra esoteric meaning: The end of duality. Male and female in tandem. Personality and soul balanced. You are learning that the ultimate relationship is the one between your human self and your divine self—the sacred marriage within.`,
      Scorpio: `You are pure Pluto—depth, intensity, and transformation itself. With Sun, Moon, and Rising all in Scorpio, there is nothing light about you, and you wouldn't want there to be. You see through masks, you feel everything at maximum intensity, and you present a mysterious façade even when you're trying to be open. Your gift is regenerative power and psychological insight. Your challenge is trusting, releasing control, and allowing vulnerability without it feeling like death.`,
      Sagittarius: `You are pure Jupiter—expansion, adventure, and meaning-seeking. With Sun, Moon, and Rising all in Sagittarius, your entire being is oriented toward the horizon, the next truth, the bigger picture. You cannot be confined. You speak your truth—sometimes too bluntly. Your gift is inspiration, humor, and the ability to see life as a grand adventure. Your challenge is commitment to the present, depth over breadth, and tact in your honesty.`,
      Capricorn: `You are pure Saturn—ambition, discipline, and mastery. With Sun, Moon, and Rising all in Capricorn, your entire being is oriented toward achievement, structure, and long-term building. You were born old and grow younger with age. You take life seriously—perhaps too seriously. Your gift is the ability to manifest anything through sustained effort. Your challenge is allowing pleasure, accepting help, and knowing that you are more than what you accomplish.`,
      Aquarius: `You are pure Uranus—innovation, individuality, and humanitarian vision. With Sun, Moon, and Rising all in Aquarius, your entire being is oriented toward the future, the collective, and being authentically different. You cannot pretend to be normal even when you try. Your gift is original thinking and the ability to see what others will only understand later. Your challenge is intimacy, emotional accessibility, and staying connected to the present while envisioning the future.`,
      Pisces: `You are pure Neptune—sensitivity, spirituality, and transcendence. With Sun, Moon, and Rising all in Pisces, your entire being is oriented toward the unseen, the mystical, the interconnected. Boundaries are thin for you—you absorb everything. You feel at home in art, music, dreams, and spiritual practice. Your gift is compassion and creative vision. Your challenge is staying grounded in practical reality, maintaining boundaries, and not escaping when life gets harsh.`,
    };
    overview = tripleSignDescriptions[tripleSign] || `With Sun, Moon, and Rising all in ${tripleSign}, you are a concentrated expression of this sign's energy—there is no conflict between who you are, how you feel, and how you appear.`;
  } else if (doubleSign) {
    // Two placements in same sign
    const whichDouble = signs.filter(s => s === doubleSign).length === 2 ? signs.find(s => s !== doubleSign) : null;
    const otherSign = signs.find(s => s !== doubleSign) || '';
    overview = `With two of your Big Three in ${doubleSign}, there's a strong ${doubleSign} theme running through your personality—this is your dominant energy. Your ${otherSign} ${signs.indexOf(otherSign) === 0 ? 'Sun' : signs.indexOf(otherSign) === 1 ? 'Moon' : 'Rising'} adds a different flavor, bringing ${getElement(otherSign)} energy to complement your core ${getElement(doubleSign)} nature. `;
    
    if (dominantElements.length > 0) {
      overview += `The ${dominantElements.join(' and ')} emphasis gives you ${dominantElements.includes('Fire') ? 'passion and initiative' : dominantElements.includes('Earth') ? 'groundedness and practical wisdom' : dominantElements.includes('Air') ? 'intellectual clarity and social ease' : 'emotional depth and intuitive understanding'}. `;
    }
  } else {
    // All different signs
    overview = `Your ${sunPos.sign} Sun, ${moonPos.sign} Moon, and ${risingSign} Rising create a dynamic interplay of different energies. `;
    
    if (dominantElements.length > 0) {
      overview += `With ${dominantElements.join(' and ')} appearing twice, you're naturally strong in ${dominantElements.includes('Fire') ? 'taking action and inspiring others' : dominantElements.includes('Earth') ? 'building tangibly and staying grounded' : dominantElements.includes('Air') ? 'thinking clearly and connecting with others' : 'feeling deeply and trusting intuition'}. `;
    }
    
    if (missingElements.length > 0) {
      overview += `The absence of ${missingElements.join(' and ')} in your trinity means you may seek these qualities in partners or life circumstances—they represent your growth edges. `;
    }
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
  
  // Element/Modality dynamics (now includes all three: Sun, Moon, Rising)
  if (elementCombo) {
    readingNarrative += `**Element Dynamic (${elementDisplayLabel}):** ${elementCombo.dynamic} ${elementCombo.challenge ? `The challenge: ${elementCombo.challenge}` : ''} ${elementCombo.gift ? `The gift: ${elementCombo.gift}` : ''}\n\n`;
  }
  
  if (modalityCombo) {
    readingNarrative += `**Modality Dynamic (${modalityDisplayLabel}):** ${modalityCombo.description} ${modalityCombo.energy}`;
  }
  
  return {
    overview,
    elementDynamic: {
      combination: elementDisplayLabel,
      description: elementCombo?.description || '',
      dynamic: elementCombo?.dynamic || '',
      challenge: elementCombo?.challenge || '',
      gift: elementCombo?.gift || '',
    },
    modalityDynamic: {
      combination: modalityDisplayLabel,
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
